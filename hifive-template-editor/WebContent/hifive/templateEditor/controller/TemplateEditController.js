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
	var BLANK_PAGE = 'sample/blank.html';// ブランクページ


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

		_isBlank: true,// iframeがロードしているページがブランクページかのフラグ

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

					this.createTemplate();
				}
			});

			this._target = $('iframe')[0];// postMessageの送信先を設定

			$('iframe').load(this.own(function() {
				var msg = this._isBlank ? 'ブランクページのロードが完了しました' : 'ページのロードが完了しました';

				$(this.rootElement).trigger('showMessage', {
					'msg': msg,
					'$el': this.$find('.preview-msg')
				});
			}));

			this._editAreaBarHeight = $('.active .editAreaBar').outerHeight();// editAreaBarの高さを調整(window幅によって高さが変わる)

			this._beginIndicator();

			this.$find('iframe')[0].src = BLANK_PAGE;
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
		setDataText: function(data) {
			this.$find('.dataText').val(JSON.stringify(data, null, '  '));
		},


		/**
		 * editAreaBarの高さが変わっていたらeditAreaの高さを修正します
		 */
		resizeEditAreaBar: function() {
			var height = this.$find('.active .editAreaBar').outerHeight();

			if (this._editAreaBarHeight !== height) {
				this.$find('.tab-content').css('padding-bottom', height);
				this._editAreaBarHeight = height;
			}
		},


		getTemplate: function(url) {
			return this._templateEditorLogic.loadTemplate(url);
		},


		getData: function(url) {
			return this._templateEditorLogic.loadData(url);
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

				case 'createTemplate':
					this.createTemplate();
					break;

				case 'getLibraryPath':
					this._getLibraryPath();
					break;

				case 'loadLibraryComp':
					this._loadLibraryComp();
					break;

				case 'previewComp':
					this._applyTemplateComp();
					break;

				case 'showMessage':
					$(this.rootElement).trigger('showMessage', data);
					break;

				default:
					this.log.warn('messageが不正です');
				}

			} else {
				this.log.debug('originが一致していません');
			}
		},


		'{window} resize': function(context) {
			this.resizeEditAreaBar();

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
			this.createTemplate();
		},


		'{rootElement} textChange': function() {
			this.createTemplate();
		},


		/**
		 * 入力されたurlをiframeで読み込みます
		 */
		'.load-page submit': function(context) {
			context.event.preventDefault();

			var url = this.$find('.input-url').val();

			url = $.trim(url);

			if (url.length === 0) {
				return;
			}

			this._target.src = url;

			if (url !== BLANK_PAGE) {
				this._disableLibrary();
				this._isBlank = false;

			} else {
				this._enableLibrary();
				this._isBlank = true;
			}
		},


		/**
		 * テンプレートを反映させるセレクタ(文字列)をプレビューに送る
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
		 * テンプレートを反映させるセレクタ(文字列)をプレビューに送る
		 * <p>
		 * ここで指定されるセレクタはiframeが読み込むhtml上の要素
		 *
		 * @param context
		 */
		'.target-selector submit': function(context) {
			context.event.preventDefault();

			var selector = this.$find('.input-selector').val();

			if (selector === '') {
				$(this.rootElement).trigger('showMessage', {
					'msg': 'セレクタを指定してください',
					'$el': this.$find('.template-alert')
				});

				return;
			}

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
		 * データタブのラジオボタンが切り替わった時、もう一方のラジオボタンも切り替えます
		 *
		 * @param context
		 * @param $el
		 */
		'.sendType change': function(context, $el) {
			var type = $el[0].value;

			if (type === "GET") {
				this.$find('.sendType[value="GET"]').each(function() {
					$(this).prop('checked', 'checked');
				});
				return;
			}

			this.$find('.sendType[value="POST"]').each(function() {
				$(this).prop('checked', 'checked');
			});
		},


		/**
		 * 指定されたurlでデータオブジェクトを取得します
		 */
		'.load-data submit': function(context, $el) {
			context.event.preventDefault();

			var url = this.$find('.input-data-url').val();

			if (url === '') {
				// URLが未入力であればメッセージを表示します
				$(this.rootElement).trigger('showMessage', {
					'msg': 'URLを指定してください',
					'$el': this.$find('.data-alert')
				});

				return;
			}

			var param = this._parameterEditController.getParameter();

			var type = null;
			var $elm = $('.sendType');

			// 送信方法を取得(GET/POST)します
			for (var i = 0, len = $elm.length; i < len; i++) {
				if ($($elm[i]).prop('checked')) {
					type = $elm[i].value;
					break;
				}
			}

			// データを取得します
			this._templateEditorLogic.loadData(url, type, param).then(this.own(function(data) {

				this.setDataText(data);// データをテキストエリアに反映します

				this.createTemplate();

				$(this.rootElement).trigger('showMessage', {
					'msg': 'データの取得が完了しました',
					'$el': this.$find('.data-msg')
				});

			}), this.own(function(xhr, textStatus) {
				// 取得に失敗したらエラーメッセージを表示します
				var msg = 'status:' + xhr.status;

				msg += (textStatus === 'parsererror') ? '\nJSONへのパースに失敗しました' : '\nデータの取得に失敗しました';

				$(this.rootElement).trigger('showMessage', {
					'msg': msg,
					'$el': this.$find('.data-alert')
				});
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

		// /**
		// * UNDO
		// */
		// '.undo-button click': function() {
		// var undoBuffer = this._getUndoBuffer();
		// var redoBuffer = this._getRedoBuffer();
		//
		// if (undoBuffer.length != 0) {
		// var temp = undoBuffer.pop();
		//
		// redoBuffer.push(this._sourceEditorController.getText());
		//
		// this.setTemplateText(temp);
		//
		// this.createTemplate();
		// }
		// },
		//
		//
		// /**
		// * REDO
		// */
		// '.redo-button click': function() {
		// var undoBuffer = this._getUndoBuffer();
		// var redoBuffer = this._getRedoBuffer();
		//
		// if (redoBuffer.length != 0) {
		// var temp = redoBuffer.pop();
		//
		// undoBuffer.push(this._sourceEditorController.getText());
		//
		// this.setTemplateText(temp);
		//
		// this.createTemplate();
		// }
		// },


		/**
		 * データオブジェクトをフォーマットします
		 */
		'.format-button click': function() {
			var data = this._getData();

			try {
				if (!data || data === '') {
					data = null;
				} else {
					data = $.parseJSON(data);
				}

				this.setDataText(data);

			} catch (e) {
				$(this.rootElement).trigger('showMessage', {
					'msg': 'JSONのパースに失敗しました',
					'$el': this.$find('.data-alert')
				});
			}
		},


		/**
		 * プレビューにブランクページを表示します。
		 */
		'.blank-button click': function() {
			this._target.src = BLANK_PAGE;

			this._isBlank = true;

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
		_getLibraryPath: function() {

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
				this.createTemplate();
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
			this.createTemplate();
		},


		/**
		 * テンプレートの反映が終わったときのイベントハンドラです
		 */
		_applyTemplateComp: function() {
			// インジケータが表示されていれば、非表示にします。
			if (this._indicator) {
				this._indicatorDeferred.resolve();
			}

			// var myOrigin = location.protocol + '//' + location.host;
			// var reg = new RegExp(myOrigin);

			// if (!reg.test(this.$find('iframe')[0].src)) {
			// this._alertMessage('別ドメインのページをロードしました。現在は何もできません。別ページのロードは可能です。', this
			// .$find('.preview-alert'));
			// return;
			// }
			// this._alertMessage('ページのロードが完了しました', this.$find('.preview-msg'));
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
		createTemplate: function() {
			var template = this._sourceEditorController.getText();

			try {
				// データをテキストエリアから取得してパースします
				var data = this._getData();
				if (!data || data === '') {
					data = null;
				} else {
					data = $.parseJSON(data);
				}

			} catch (e) {
				// activeなタブにエラーを表示します
				var $el = $('.tab-pane.active .alert-danger');

				$(this.rootElement).trigger('showMessage', {
					'msg': 'JSONのパースに失敗しました' + e.stack,
					'$el': $el
				});

				if (this._indicator) {
					this._indicatorDeferred.resolve();
				}

				return;
			}

			try {
				// テンプレートを生成します
				var generated = this._previewController.generate(template, data);

				var data = {
					type: 'preview',
					template: generated
				};

				this._sendMessage(data);

			} catch (e) {
				// activeなタブにエラーメッセージを表示します
				var $el = $('.tab-pane.active .alert-danger');
				$(this.rootElement).trigger('showMessage', {
					'msg': 'テンプレートの生成に失敗しました\n' + e.stack,
					'$el': $el
				});

				if (this._indicator) {
					this._indicatorDeferred.resolve();
				}
			}
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

			this.$find('.applyLibBtn').attr('disabled', 'disabled');

			this.$find('.libraryMessage').show();
		},

		_enableLibrary: function() {
			this.$find('.libraries input').each(function() {
				$(this).prop('disabled', '');
			});

			this.$find('.applyLibBtn').removeAttr('disabled');

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
