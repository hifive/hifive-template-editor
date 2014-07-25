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

	// var getComponentCreator = hifive.editor.u.getComponentCreator;

	// =========================================================================
	//
	// スコープ内定数
	//
	// =========================================================================
	var DEFAULT_PAGE = 'sample/sample-preview.html';// デフォルトページ


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
		__name: 'hifive.templateEditor.controller.TemplateEditController',

		__meta: {
			_previewController: {
				rootElement: '.dataText'
			},
			_sourceEditorController: {
				rootElement: '.sourceText'
			},
			_parameterEditController: {
				rootElement: '.parameter-input'
			}
		/*
		 * _cssEditorController: { rootElement: '#editCSSPanel' }
		 */
		},

		_previewController: hifive.templateEditor.controller.PreviewController,

		_sourceEditorController: hifive.templateEditor.controller.SourceEditorController,

		/* _cssEditorController: hifive.templateEditor.controller.CSSEditorController, */

		_parameterEditController: hifive.templateEditor.controller.ParameterEditController,

		_templateEditorLogic: hifive.templateEditor.logic.TemplateEditLogic,

		_targetWaitDeferred: null,

		_isCloseConfirmationSet: false,

		_dependencyMap: hifive.templateEditor.js.dependencyMap,

		_indicator: null,

		_indicatorDeferred: null,

		_target: null,// postMessageの送信先

		_editAreaBarHeight: null,

		__ready: function() {

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

					$(this._sourceEditorController.rootElement).focus();

					hifive.editor.u.execInsertTextCommand(html);

					this._applyTemplate();
				}
			});

			this._target = $('iframe')[0];// postMessageの送信先を設定

			this._editAreaBarHeight = $('.active .editAreaBar').outerHeight();
		},


		/**
		 * postMessageの送信先を設定します。
		 *
		 * @param element
		 */
		setTarget: function(element) {
			if (element) {
				this._target = element;
			} else {
				this._target = null;
			}
		},


		/**
		 * テンプレートをセットします。
		 *
		 * @param text
		 */
		setTemplateText: function(text) {
			this._sourceEditorController.setText(text);
		},


		/**
		 * データオブジェクトをテキストエリアに反映します。
		 *
		 * @param json
		 */
		setDataText: function(json) {
			this.$find('.dataText').val(json);
		},


		/**
		 * メッセージのtypeプロパティからメソッドを呼び出します。
		 */
		'{window} message': function(context) {
			var ev = context.event.originalEvent;
			// シリアライズした文字列が渡されるので、デシリアライズする
			var data = h5.u.obj.deserialize(ev.data);

			var myOrigin = location.protocol + '//' + location.host;

			if (ev.origin === myOrigin) {

				switch (data.type) {

				case 'applyTemplate':
					this._applyTemplate();
					break;

				case 'applyLibrary':
					this._applyLibrary();
					break;

				case 'loadLibraryComp':
					this._loadLibraryComp();
					break;

				case 'applyTemplateComp':
					this._applyTemplateComp();
					break;

				default:
					this.log.warn('messageが不正です');
				}

			} else {
				this.log.debug('originが一致していません');
			}
		},

		'{window} resize': function(context) {

			// .editAreaBarの高さが変化していたら、その高さに合わせる
			var height = this.$find('.active .editAreaBar').outerHeight();

			if (this._editAreaBarHeight !== height) {
				this.$find('.tab-content').css('padding-bottom', height);
				this._editAreaBarHeight = height;
			}

			// DividedBoxのrefreshを呼ぶ
			var dividedBoxes = h5.core.controllerManager.getControllers($('body'), {
				name: 'h5.ui.container.DividedBox',
				deep: true
			});

			for (var i = 0, len = dividedBoxes.length; i < len; i++) {
				dividedBoxes[i].refresh();
			}

		},


		/**
		 * 再適用ボタンをクリックしたときのイベントハンドラ。テンプレートを反映させます
		 */
		'.applyTemplateBtn click': function() {
			this._applyTemplate();
		},


		'{rootElement} textChange': function() {
			this._applyTemplate();
		},


		/**
		 * 入力されたページ(url)をiframeで読み込みます
		 */
		'.load-button click': function() {
			var url = this.$find('.input-url').val();
			this._target.contentDocument.location.replace(url);

			if (url !== DEFAULT_PAGE) {
				this._disableLibrary();

			} else {
				this._enableLibrary();

			}
		},

		/**
		 * テンプレートを反映させるセレクタ文字列をプレビューに送る
		 * <p>
		 * ここで指定されるセレクタはiframeが読み込むhtml上の要素
		 */
		'.selector-button click': function() {
			var selector = this.$find('.input-selector').val();

			var data = {
				type: 'changeTarget',
				selector: selector
			};

			this._sendMessage(data);
		},

		/**
		 * パラメータ入力ポップ画面を表示します
		 */
		'.data-parameter click': function() {
			this.$find('.parameter-input').css('display', 'block');
		},

		/**
		 * 指定されたurlでデータオブジェクトを取得します
		 */
		'.data-button click': function(context) {

			context.event.preventDefault();

			var url = this.$find('.input-data-url').val();
			var param = this._parameterEditController.getParameter();

			if (url === '') {
				// TODO: エラーメッセージ
				return;
			}

			var type = null;
			$('input[name="sendType"]').each(function() {
				if ($(this).prop('checked')) {
					type = $(this).context.value;
				}
			});

			this._templateEditorLogic.loadData(url, type, param).done(this.own(function(data) {
				this.setDataText(JSON.stringify(data, null, '	'));
				this._applyTemplate();
			}));
		},


		/**
		 * 設定タブの適用ボタンをクリックしたときのイベントハンドラ。
		 * <p>
		 * iframeをリロードします。
		 *
		 * @param context
		 */
		'.applyLibBtn click': function(context) {
			// インジケータを表示します
			this._beginIndicator();

			this._target.contentDocument.location.reload(true);
		},


		'.undo-button click': function() {
			var undoBuffer = this._getUndoBuffer();
			var redoBuffer = this._getRedoBuffer();

			if (undoBuffer.length != 0) {
				var temp = undoBuffer.pop();

				redoBuffer.push(this._sourceEditorController.getText());

				this.setTemplateText(temp);

				this._applyTemplate();
			}
		},


		'.redo-button click': function() {
			var undoBuffer = this._getUndoBuffer();
			var redoBuffer = this._getRedoBuffer();

			if (redoBuffer.length != 0) {
				var temp = redoBuffer.pop();

				undoBuffer.push(this._sourceEditorController.getText());

				this.setTemplateText(temp);

				this._applyTemplate();
			}
		},


		/**
		 * データオブジェクトをフォーマットします
		 */
		'.format-button click': function() {
			var data = this._getData();

			data = JSON.parse(data);

			this.setDataText(JSON.stringify(data, null, '	'));
		},


		/**
		 * プレビューにデフォルトページを表示します。
		 */
		'.blank-button click': function() {
			this._target.contentDocument.location.replace(DEFAULT_PAGE);

			this._enableLibrary();
		},


		/**
		 * dividerを操作するときに、iframeの上にdivをかぶせる(iframe上でmousemoveイベントを拾えないため)
		 *
		 * @param context
		 * @param $el
		 */
		'.divider h5trackstart': function(context, $el) {
			this._addIFrameCover();
		},


		/**
		 * dividerを操作し終えたときに、iframeの上のdivを取り除く
		 *
		 * @param context
		 * @param $el
		 */
		'.divider h5trackend': function(context, $el) {
			this._removeIFrameCover();
		},


		/**
		 * iframeを覆う要素を追加
		 */
		_addIFrameCover: function() {
			this.$find('.iframeWrapper').append('<div class="iframeCover"></div>');
		},


		/**
		 * iframeを覆う要素を削除
		 */
		_removeIFrameCover: function() {
			this.$find('.iframeCover').remove();
		},


		/**
		 * 画面にインジケータを表示します
		 */
		_beginIndicator: function() {

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
		 * チェックされたライブラリのパスを取得しpostMessageします。
		 */
		_applyLibrary: function() {

			// インジケータのメッセージを更新
			if (this._indicator) {
				this._indicator.message('ライブラリをロードしています');
			}

			// チェックされたライブラリを選別
			var applyLibs = [];
			this.$find('.lib').each(function() {
				if ($(this).prop('checked')) {
					applyLibs.push($(this).val());
				}
			});

			// チェックされたライブラリがない場合、テンプレートを適用します。
			if (applyLibs.length === 0) {
				this._applyTemplate();
				return;
			}


			// 選択されたライブラリのパスをマップから取得します。
			var libPath = [];
			for (var i = 0, len = applyLibs.length; i < len; i++) {
				libPath.push(this._dependencyMap.map[applyLibs[i]]);
			}

			var data = {
				type: 'beginLoadLibrary',
				path: libPath
			};

			this._sendMessage(data);
		},


		/**
		 * ライブラリのロードが終わったときのイベントハンドラです
		 */
		_loadLibraryComp: function() {
			if (this._indicator) {
				this._indicator.message('テンプレートのプレビューを再生成しています');
			}

			// テンプレートを適用します。
			this._applyTemplate();
		},


		/**
		 * テンプレートの反映が終わったときのイベントハンドラです
		 */
		_applyTemplateComp: function() {
			// インジケータが表示されていれば、非表示にします。
			if (this._indicator) {
				this._indicatorDeferred.resolve();
			}
		},


		/**
		 * postMessageを送ります
		 *
		 * @param data
		 */
		_sendMessage: function(data) {
			var myOrigin = location.protocol + '//' + location.host;

			this._target.contentWindow.postMessage(h5.u.obj.serialize(data), myOrigin);
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
					type: 'preview',
					template: generated
				};

				this._sendMessage(data);

			}
			catch (e) {
				this._setMessage(e.message);
			}
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
		},

		_getUndoBuffer: function() {
			return this._sourceEditorController.getUndoBuffer();
		},

		_getRedoBuffer: function() {
			return this._sourceEditorController.getRedoBuffer();
		},

		_disableLibrary: function() {
			this.$find('.libraries input').each(function() {
				$(this).prop('disabled', 'disabled');
			});

			this.$find('.libraryMessage').show();
		},

		_enableLibrary: function() {
			this.$find('.libraries input').each(function() {
				$(this).prop('disabled', '');
			});

			this.$find('.libraryMessage').hide();
		}


	};

	// =========================================================================
	//
	// 外部公開
	//
	// =========================================================================

	h5.core.expose(templateEditController);

})(jQuery);
