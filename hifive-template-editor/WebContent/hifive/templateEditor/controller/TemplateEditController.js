/*
 * Copyright (C) 2013-2014 NS Solutions Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 *
 */

(function($) {

	// =========================================================================
	//
	// 外部定義のインクルード
	//
	// =========================================================================

	// TODO 別ファイルで定義されている定数・変数・関数等を別の名前で使用する場合にここに記述します。
	// 例：var getDeferred = h5.async.deferred;

	var getComponentCreator = hifive.editor.u.getComponentCreator;

	// =========================================================================
	//
	// スコープ内定数
	//
	// =========================================================================



	// =========================================================================
	//
	// スコープ内静的プロパティ
	//
	// =========================================================================

	// =============================
	// スコープ内静的変数
	// =============================

	// TODO このスコープで共有される変数（クラス変数）を記述します。
	// 例：var globalCounter = 0;

	// =============================
	// スコープ内静的関数
	// =============================


	// =========================================================================
	//
	// スコープ内クラス
	//
	// =========================================================================



	// =========================================================================
	//
	// メインコード（コントローラ・ロジック等）
	//
	// =========================================================================

	var templateEditController = {
		/**
		 * @memberOf hifive.templateEditor.controller.TemplateEditorController
		 */
		__name: 'hifive.templateEditor.controller.TemplateEditorController',

		__meta: {
			_previewController: {
				rootElement: '.dataText'
			},
			_sourceEditorController: {
				rootElement: '.sourceText'
			},
			_cssEditorController: {
				rootElement: '#editCSSPanel'
			}
		},

		_previewController: hifive.templateEditor.controller.PreviewController,

		_sourceEditorController: hifive.templateEditor.controller.SourceEditorController,

		_cssEditorController: hifive.templateEditor.controller.CSSEditorController,

		_targetWaitDeferred: null,

		_isCloseConfirmationSet: false,

		_dependencyMap: hifive.templateEditor.js.dependencyMap,

		_indicator: null,

		_indicatorDeferred: null,

		__ready: function() {
			var that = this;

			$(window).bind(
					'message',
					function(e) {
						var ev = e.originalEvent;
						var myOrigin = location.protocol + '//' + location.host;
						if (ev.origin === myOrigin) {

							console.log('TemplateEditorController.jsで「' + ev.data.eventName
									+ '」イベントをトリガする');
							$(that.rootElement).trigger(ev.data.eventName, ev.data.data);

						} else {
							console.log('originが一致していない');
						}
					});

			h5.u.obj.expose('hifive.editor', {

				highlightDropTarget: function(pageX, pageY) {
				// that._highlightDropTarget(pageX, pageY);
				},

				hideDropTarget: function() {
				// this.$find('.editInfoOverlay .cellArea').each(function() {
				// $(this).remove();
				// });
				},

				dropComponent: function(componentId, pageX, pageY) {
					var creator = getComponentCreator(componentId);
					if (!creator) {
						this.log.warn('componentが見つからない。key={0}', componentId);
						return;
					}

					var $view = creator.createView();

					var html = $view[0].outerHTML;

					$(that._sourceEditorController.rootElement).focus();

					document.execCommand('insertText', false, html);

					that._applyTemplate();
				}
			});

		},

		init: function(template, json) {

			template = template.replace(/<script.*>/, '').replace(/<\/script>/, '');

			this.setDataText(JSON.stringify(json));

			this.setTemplateText(template);

		},

		setTarget: function(element) {
			this._previewController.setTarget(element);

			if (this._targetWaitDeferred) {
				this._targetWaitDeferred.resolve();
				this.$find('.result').css('display', 'none');
			}
		},

		setTemplateText: function(text) {
			this._sourceEditorController.setText(text);
		},

		setDataText: function(json) {
			this.$find('.dataText').val(json);
		},

		setTemplateId: function(templateId) {
			this.$find('.templateIdText').text('テンプレートID:' + templateId);
		},

		'.applyTemplateBtn click': function() {
			this._applyTemplate();
		},

		'{rootElement} textChange': function() {
			// this._setCloseConfirmation();
			this._applyTemplate();
		},


		/**
		 * 設定タブの適用ボタンをクリックしたときのイベント。
		 * <p>
		 * iframeをリロードします。
		 *
		 * @param context
		 */
		'.applyLibBtn click': function(context) {
			this.beginIndicator();

			// this._indicatorPromise = indicator.promise;
			// this._indicatorMessage = indicator.message;

			this.$find('iframe')[0].contentDocument.location.reload(true);
		},


		/**
		 * インジケータを表示する
		 */
		beginIndicator: function() {

			var dfd = this.deferred();

			// インジケータの表示
			var indicator = this.indicator({
				promises: dfd.promise(),
				target: document.body,
				message: 'プレビューページをリロードしています'
			}).show();

			this._indicator = indicator;
			this._indicatorDeferred = dfd;
		},


		/**
		 * チェックされたライブラリの選別・パスを取得しpostMessageします。
		 */
		'{rootElement} applyLibrary': function() {

			// インジケータのメッセージを更新
			if (this._indicator) {
				this._indicator.message('ライブラリをロードしています');
			}

			// チェックされたライブラリを選別
			var applyLibs = [];
			this.$find('.lib-list input').each(function() {
				if ($(this).prop('checked')) {
					applyLibs.push($(this).val());
				}
			});

			// チェックされたライブラリがない場合、テンプレートを適用する
			if (applyLibs.length === 0) {
				this._applyTemplate();
				return;
			}


			// 選択されたライブラリのパスをマップから取得
			var libPath = [];
			for (var i = 0, len = applyLibs.length; i < len; i++) {
				libPath.push(this._dependencyMap.map[applyLibs[i]]);
			}

			var data = {
				eventName: 'beginLoadLibrary',
				data: libPath
			};

			this._sendMessage(data);
		},



		// '{rootElement} loadComp': function() {
		//
		// // チェックされたライブラリを選別します
		// var applyLibs = [];
		// $('.lib').each(function() {
		// if ($(this).prop('checked')) {
		// applyLibs.push($(this).val());
		// }
		// });
		//
		//
		// // 選択されたライブラリのパスをマップから取得します
		// var lib = null;
		// for (var i = 0, len = applyLibs.length; i < len; i++) {
		// $.extend(lib, this._dependencyMap.map[applyLibs[i]]);
		// }
		//
		// var data = {
		// eventName: 'beginLoadLibrary',
		// data: lib
		// };
		//
		// this._sendMessage(data);
		//
		// },


		/**
		 * ライブラリのロードが終わったときのイベントハンドラです
		 */
		'{rootElement} loadLibraryComp': function() {
			this._indicator.message('テンプレートのプレビューを再生成しています');
			this._applyTemplate();
		},


		/**
		 * テンプレートの反映が終わったときのイベントハンドラです
		 */
		'{rootElement} applyTemplateComp': function() {
			if (this._indicator) {
				this._indicatorDeferred.resolve();
				// this._indicatorPromise = null;
				// this._indicatorMessage = null;
			}
		},


		/**
		 * postMessageを送ります
		 *
		 * @param data
		 */
		_sendMessage: function(data) {

			var myOrigin = location.protocol + '//' + location.host;
			this.$find('.frame')[0].contentWindow.postMessage(data, myOrigin);
		},


		/**
		 * テンプレートを生成してpostMessageで送ります。
		 */
		_applyTemplate: function() {
			var template = this._sourceEditorController.getText();

			var json;

			this._clearMessage();

			try {
				var data = this._getData();
				if (!data || data === '') {
					json = null;
				} else {
					json = $.parseJSON(data);
				}
			}
			catch (e) {
				this._setMessage('データオブジェクトが不正です：' + e.message);
				return;
			}

			this._previewController.setData(json);

			try {
				var generated = this._previewController.generate(template);
				var data = {
					eventName: 'preview',
					data: generated
				};

				this._sendMessage(data);

			}
			catch (e) {
				this._setMessage(e.message);
			}
		},

		_setCloseConfirmation: function() {
			if (this._isCloseConfirmationSet) {
				return;
			}
			this._isCloseConfirmationSet = true;

			window.addEventListener('beforeunload', function(ev) {
				var msg = '※※注意※※\n' + 'ページ遷移しようとしています。内容をコピーしていない場合はキャンセルしてください。';

				ev.returnValue = msg;
				return msg;
			});
		},

		_clearMessage: function() {
			this._setMessage('');
		},

		_setMessage: function(text) {
			this.$find('.statusMessage').text(text);
		},

		_getData: function() {
			var data = this.$find('.dataText').val();
			return data;
		}

	};

	// =========================================================================
	//
	// 外部公開
	//
	// =========================================================================

	h5.core.expose(templateEditController);

})(jQuery);
