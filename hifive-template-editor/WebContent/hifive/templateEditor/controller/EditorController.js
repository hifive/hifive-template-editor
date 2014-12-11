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

	// =========================================================================
	//
	// スコープ内定数
	//
	// =========================================================================
	/** ブランクページURL */
	var BLANK_PAGE = 'blank.html';

	/** 入力内容をプレビューに適用するときのテンプレートID */
	var TEMPLATE_ID = 'templateId';

	/** プレビューページに読み込ませるResultEditorControllerのパス */
	var RESULT_EDITOR_CTRL_PATH = 'hifive/templateEditor/controller/ResultEditorController.js';

	// =========================================================================
	//
	// スコープ内静的プロパティ
	//
	// =========================================================================

	// =============================
	// スコープ内静的変数
	// =============================

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
	/**
	 * エディタ全体のコントローラ
	 *
	 * @class
	 * @name hifive.templateEditor.controller.EditorController
	 */
	var editorController = {
		/**
		 * @memberOf hifive.templateEditor.controller.EditorController
		 */
		__name: 'hifive.templateEditor.controller.EditorController',

		/**
		 * コントローラメタ定義
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 */
		__meta: {
			_sourceEditorController: {
				rootElement: '.sourceTextWrapper'
			},
			_templateAreaController: {
				rootElement: '#template'
			},
			_dataEditorController: {
				rootElement: '#data'
			}
		},

		/**
		 * ソースエディタコントローラ
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 */
		_sourceEditorController: hifive.templateEditor.controller.SourceEditorController,

		/**
		 * データエディタコントローラ
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 */
		_dataEditorController: hifive.templateEditor.controller.DataEditorController,

		/**
		 * テンプレートロードロジック
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 */
		_templateLoadLogic: hifive.templateEditor.logic.TemplateLoadLogic,

		/**
		 * ライブラリマップ
		 * <p>
		 * ライブラリ名と必要なソースパスなどのマップオブジェクト
		 * </p>
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 */
		_libraryMap: hifive.templateEditor.js.libraryMap,

		/**
		 * 表示中のインジケータ
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 */
		_indicator: null,

		/**
		 * プレビューするiframe要素
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 */
		_previewTarget: null,

		/**
		 * エディタ部分の高さのキャッシュ(サイズ変更検知のため)
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 */
		_editAreaBarHeight: null,

		/**
		 * iframeがロードしているページがブランクページかのフラグ
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 */
		_isBlank: true,

		/**
		 * 初期化処理
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 */
		__ready: function() {
			// コントローラのバインドを非同期処理終了まで待機
			var readyDfd = h5.async.deferred();

			// libraryMapからライブラリリストを生成
			var libraryMap = this._libraryMap.map;
			for ( var p in libraryMap) {
				var src = libraryMap[p];
				if (!src.defaultLoad) {
					this.view.append('.libraries', 'libraries-control', {
						data: src
					});
				}
			}

			// editAreaBarの高さをキャッシュ(変更検知のため)
			this._editAreaBarHeight = $('.active .editAreaBar').outerHeight();

			// インジケータの表示
			this._showIndicator();

			// プレビューするiframe要素の取得
			var $iframe = this.$find('iframe');
			this._previewTarget = $iframe.get(0);

			// iframeのloadイベントハンドラ
			$iframe.load(this.own(function() {
				// ブランクページを読み込む場合はjquery,hifiveはロード済み
				if (this._isBlank) {
					var msg = 'ブランクページのロードが完了しました';
					$(this.rootElement).trigger('showMessage', {
						msg: msg,
						target: this.$find('.preview-msg')
					});
					readyDfd.resolve();
					return;
				}
				if (this._indicator) {
					this._indicator.message('スクリプトをロードしています');
				}

				var pathname = location.pathname;

				// jquery,hifive,ResultEditorControllerを順番にロード
				h5.async.deferred().resolve().then(this.own(function() {
					if (this._previewTarget.contentWindow.jQuery) {
						return;
					}
					// jQueryをロード
					var jqPath;
					if (h5.env.ua.isIE && h5.env.ua.browserVersion <= 8) {
						jqPath = libraryMap.jquery1.js;
					} else {
						jqPath = libraryMap.jquery2.js;
					}
					return this._insertScriptToIFrame(jqPath);
				})).then(this.own(function() {
					// hifive
					if (this._previewTarget.contentWindow.h5) {
						return;
					}
					// h5.cssをロード
					return this._insertCSSToIFrame(libraryMap.hifive.css).then(this.own(function() {
						// h5.jsをロード
						return this._insertScriptToIFrame(libraryMap.hifive.js);
					}));
				})).then(this.own(function() {
					var contentWindow = this._previewTarget.contentWindow;
					if (contentWindow.hifive && contentWindow.hifive.templateEditor) {
						return;
					}
					// ResultEditorControllerをロード
					var resultEditorCtrlPath = pathname + RESULT_EDITOR_CTRL_PATH;
					return this._insertScriptToIFrame(resultEditorCtrlPath);
				})).done(this.own(function() {
					var msg = 'ページのロードが完了しました';
					$(this.rootElement).trigger('showMessage', {
						msg: msg,
						target: this.$find('.preview-msg')
					});
					readyDfd.resolve();
				}));
			}));
			// ブランクページを設定
			this._previewTarget.src = BLANK_PAGE;
			return readyDfd.promise();
		},

		/**
		 * メッセージを受け取った時のイベントハンドラ
		 * <p>
		 * event.data.typeプロパティを見て処理を振り分けます
		 * </p>
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @param {Object} context
		 */
		'{window} message': function(context) {
			var ev = context.event.originalEvent;
			// シリアライズした文字列が渡されるので、デシリアライズする
			var data = h5.u.obj.deserialize(ev.data);

			var myOrigin = location.protocol + '//' + location.host;

			if (ev.origin === myOrigin) {

				switch (data.type) {

				case 'applyTemplate':
					this._sendPreviewMessage();
					break;

				case 'getLibraryPath':
					this._getLibraryPath();
					break;

				case 'loadLibraryComp':
					this._loadLibraryComp();
					break;

				case 'loadLibraryFail':
					this._loadLibraryFail();
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

		/**
		 * DividedBoxの上げるサイズ変更イベントのハンドラ
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 */
		'.editArea boxSizeChange ': function() {
			// データエリアと、ソースエリアにリサイズを通知
			this._sourceEditorController.adjustSize();
			this._dataEditorController.adjustSize();
		},

		/**
		 * windowのリサイズイベントハンドラ
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 */
		'{window} resize': function() {
			this.resizeEditAreaBar();// editAreaBarの高さを調整します

			// DividedBoxのrefreshを呼びます
			var dividedBoxes = h5.core.controllerManager.getControllers($('body'), {
				name: 'h5.ui.container.DividedBox',
				deep: true
			});

			for (var i = 0, len = dividedBoxes.length; i < len; i++) {
				dividedBoxes[i].refresh();
			}
		},

		/**
		 * エディタの入力内容に変更があった時のイベントハンドラ
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 */
		'{rootElement} textChange': function() {
			this._sendPreviewMessage();
		},

		/**
		 * URLのロードボタン
		 * <p>
		 * 入力されたurlをiframeで読み込みます
		 * </p>
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 */
		'.load-page submit': function(context) {
			context.event.preventDefault();

			var url = this.$find('.input-url').val();

			url = $.trim(url);

			if (!url.length) {
				// URL指定無しならブランクページ表示
				this._showBlankPage();
				return;
			}

			this._previewTarget.src = url;

			// TODO: ブランクページかどうかの判定方法が雑
			if (url !== BLANK_PAGE) {
				this._disableLibrary();
				this._isBlank = false;

			} else {
				this._enableLibrary();
				this._isBlank = true;
			}
		},

		/**
		 * イベント引数に格納されたデータをiframeに送信します
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @param {Object} context
		 */
		'{rootElement} sendMsg': function(context) {
			this._sendMessage(context.evArg.data);
		},

		/**
		 * 設定タブの適用ボタンをクリックしたときのイベントハンドラ。
		 * <p>
		 * iframeをリロードします。
		 * </p>
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @param {Object} context
		 */
		'.applyLibBtn click': function(context) {
			// インジケータを表示します
			this._showIndicator();

			this._previewTarget.contentDocument.location.reload(true);
		},

		/**
		 * テンプレートを反映させるセレクタ(文字列)をプレビューに送る
		 * <p>
		 * ここで指定されるセレクタはiframeが読み込むhtml上の要素
		 * </p>
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @param {Object} context
		 */
		'.target-selector submit': function(context) {
			context.event.preventDefault();

			var selector = this.$find('.input-selector').val();

			var data = {
				type: 'changeTarget',
				selector: selector
			};

			this.trigger('sendMsg', {
				'data': data
			});
		},

		/**
		 * ブランクページ表示ボタンクリック
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 */
		'.blank-button click': function() {
			this._showBlankPage();
		},

		/**
		 * プレビュー状態の詳細表示開始(タッチ)
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 */
		'.preview-state touchstart': function() {
			this._showPreviewStateDetail();
		},

		/**
		 * プレビュー状態の詳細表示終了(タッチ)
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 */
		'.preview-state touchend': function() {
			this._hidePreviewStateDetail();
		},

		/**
		 * プレビュー状態の詳細表示開始(マウス)
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 */
		'.preview-state mouseenter': function() {
			this._showPreviewStateDetail();
		},

		/**
		 * プレビュー状態の詳細表示終了(マウス)
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 */
		'.preview-state mouseleave': function() {
			this._hidePreviewStateDetail();
		},

		/**
		 * プレビューにブランクページを表示します
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 */
		_showBlankPage: function() {
			this._previewTarget.src = BLANK_PAGE;

			this._isBlank = true;

			this._enableLibrary();
		},

		/**
		 * postMessageの送信先を設定します。
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @param element
		 */
		setTarget: function(element) {
			if (element) {
				this._previewTarget = element;
			} else {
				this._previewTarget = null;
			}
		},

		/**
		 * テンプレートエディタに文字列をセットします
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @param {String} text
		 */
		setTemplateText: function(text) {
			this._sourceEditorController.setText(text);
		},

		/**
		 * editAreaBarの高さが変わっていたらeditAreaの高さを修正します
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 */
		resizeEditAreaBar: function() {
			var height = this.$find('.active .editAreaBar').outerHeight();

			if (this._editAreaBarHeight !== height) {
				this.$find('.tab-content').css('padding-bottom', height);
				this._editAreaBarHeight = height;
			}
			// データエリアと、ソースエリアにリサイズを通知
			this._sourceEditorController.adjustSize();
			this._dataEditorController.adjustSize();
		},

		/**
		 * テンプレートをロードします
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @param {String} url
		 * @returns {Promise}
		 */
		loadTemplate: function(url) {
			return this._templateLoadLogic.loadTemplate(url);
		},

		/**
		 * データをロードします
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @param {String} url
		 * @param {String} type
		 * @param {String} param
		 * @returns {Promise}
		 */
		loadData: function(url, type, param) {
			return this._templateLoadLogic.loadData(url, type, param);
		},

		/**
		 * プレビュー状態の詳細を表示する
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 */
		_showPreviewStateDetail: function() {
			this.$find('.preview-state-detail').removeClass('hidden');
		},

		/**
		 * プレビュー状態の詳細を非表示
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 */
		_hidePreviewStateDetail: function() {
			this.$find('.preview-state-detail').addClass('hidden');
		},

		/**
		 * dividerを操作するときに、iframeの上にdivをかぶせる(iframe上でmousemoveイベントを拾えないため)
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @param context
		 * @param $el
		 */
		'.divider h5trackstart': function(context, $el) {
			this._addIFrameCover();
		},

		/**
		 * dividerを操作し終えたときに、iframeの上のdivを取り除く
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @param context
		 * @param $el
		 */
		'.divider h5trackend': function(context, $el) {
			this._removeIFrameCover();
		},

		/**
		 * iframeを覆う要素を追加
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 */
		_addIFrameCover: function() {
			this.$find('.iframeWrapper').append('<div class="iframeCover"></div>');
		},


		/**
		 * iframeを覆う要素を削除
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 */
		_removeIFrameCover: function() {
			this.$find('.iframeCover').remove();
		},

		/**
		 * 画面にインジケータを表示します
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 */
		_showIndicator: function() {
			// インジケータの表示
			var indicator = this.indicator({
				target: document.body,
				message: 'プレビューページをロードしています'
			}).show();
			this._indicator = indicator;
		},

		/**
		 * 画面に表示中のインジケータを削除
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 */
		_hideIndicator: function() {
			if (this._indicator) {
				this._indicator.hide();
			}
			this._indicator = null;
		},

		/**
		 * チェックされたライブラリのパスを取得しpostMessageします。
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 */
		_getLibraryPath: function() {
			// インジケータのメッセージを更新
			if (this._indicator) {
				this._indicator.message('ライブラリをロードしています');
			}

			// IFrameがブランクページ以外を読み込んでいればライブラリはロードしない
			if (!this._isBlank) {
				this._sendPreviewMessage();
				return;
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
				this._sendPreviewMessage();
				return;
			}


			// 選択されたライブラリのパスをマップから取得します。
			var libPath = [];
			for (var i = 0, len = applyLibs.length; i < len; i++) {
				libPath.push(this._libraryMap.map[applyLibs[i]]);
			}
			this._sendMessage({
				type: 'beginLoadLibrary',
				path: libPath
			});
		},


		/**
		 * ライブラリのロードが終わったときのイベントハンドラ
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 */
		_loadLibraryComp: function() {
			if (this._indicator) {
				this._indicator.message('テンプレートのプレビューを再生成しています');
			}

			// テンプレートを適用します。
			this._sendPreviewMessage();
		},

		/**
		 * ライブラリのロードに失敗した場合のハンドラ
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 */
		_loadLibraryFail: function() {
			if (this._indicator) {
				this._indicator.message('テンプレートのプレビューを再生成しています');
			}

			// テンプレートを適用します
			this._sendPreviewMessage();

			// activeなタブにエラーメッセージを表示します
			$(this.rootElement).trigger('showMessage', {
				msg: 'ライブラリのロードに失敗しました\n',
				target: $('.tab-pane.active .alert-danger')
			});
		},


		/**
		 * テンプレートの反映が終わったときのイベントハンドラ
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 */
		_applyTemplateComp: function() {
			// インジケータが表示されていれば、非表示にします。
			this._hideIndicator();
		},


		/**
		 * postMessageを送ります
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 * @param data
		 */
		_sendMessage: function(data) {
			var myOrigin = location.protocol + '//' + location.host;

			this._previewTarget.contentWindow.postMessage(h5.u.obj.serialize(data), myOrigin);
		},

		/**
		 * テンプレートを生成します
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 */
		'{rootElement} applyTemplate': function() {
			this._sendPreviewMessage();
		},


		/**
		 * テンプレートを生成します
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 */
		_applyTemplate: function() {
			var template = this._sourceEditorController.getText();
			var dataError = null;
			var templateError = null
			var data = null;
			var $message = $('.tab-pane.active .alert-danger');

			$(this.rootElement).trigger('clearMessage', {
				$el: $message
			});

			try {
				// データをテキストエリアから取得してパースします
				data = this._dataEditorController.getText();
				if (!data || data === '') {
					data = null;
				} else {
					data = $.parseJSON(data);
				}
				// エラーバッジを非表示
				this.$find('.data-tab .error-badge').addClass('hidden');
			} catch (e) {
				dataError = e;
			}

			var generated = '';
			try {
				// テンプレートを生成します
				// エラーがある場合はnullのdataで生成して生成します
				generated = this._generate(template, data);
				// エラーバッジを非表示
				this.$find('.template-tab .error-badge').addClass('hidden');
			} catch (e) {
				templateError = e;
			}
			var $previewState = this.$find('.preview-state');
			var $previewStateDetail = this.$find('.preview-state-detail').empty();

			if (dataError || templateError) {
				// データタブにエラーのバッジを表示
				if (dataError) {
					this.$find('.data-tab .error-badge').removeClass('hidden');
				}
				if (templateError) {
					this.$find('.template-tab .error-badge').removeClass('hidden');
				}

				// プレビュー状態表示を更新
				$previewState.removeClass('success').addClass('error');
				if (templateError) {
					$previewStateDetail.append('<p>[テンプレート] '
							+ (templateError.detail.message || templateError.message) + '</p>');
				}
				if (dataError) {
					$previewStateDetail.append('<p>[データ] ' + dataError.message + '</p>');
				}
				$previewState.data('message', '');

				this._hideIndicator();
				return;
			}
			// プレビュー状態表示を更新
			$previewState.removeClass('error').addClass('success');
			$previewStateDetail.append('<p>[最終更新日時] ' + this._getFormatTime(new Date) + '</p>');
			return generated;
		},

		/**
		 * 時刻をフォーマットして返します。(hh:mm.ss)
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 * @param {Date} d
		 */
		_getFormatTime: function(d) {
			function toDouble(num) {
				return ('0' + num).slice(-2);
			}
			return h5.u.str.format('{0}:{1}.{2}', toDouble(d.getHours()), toDouble(d.getMinutes()),
					toDouble(d.getSeconds()));
		},

		/**
		 * テンプレートとデータからテンプレートを生成して返します。
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 * @param {String} template
		 * @param {Object} data
		 * @return generated
		 */
		_generate: function(template, data) {
			// テンプレートが不正な場合ここで例外が発生する
			var view = h5.core.view.createView();
			view.register(TEMPLATE_ID, template);
			return view.get(TEMPLATE_ID, data);
		},

		/**
		 * 設定タブの読み込むライブラリの選択を使用不可にします
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 */
		_disableLibrary: function() {
			this.$find('.libraries input').each(function() {
				$(this).prop('disabled', 'disabled');
			});

			this.$find('.applyLibBtn').attr('disabled', 'disabled');

			this.$find('.libraryMessage').show();
		},

		/**
		 * 設定タブの読み込むライブラリの選択を使用可にします
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 */
		_enableLibrary: function() {
			this.$find('.libraries input').each(function() {
				$(this).prop('disabled', '');
			});

			this.$find('.applyLibBtn').removeAttr('disabled');

			this.$find('.libraryMessage').hide();
		},

		/**
		 * プレビュー画面に生成したテンプレートを送ります
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 */
		_sendPreviewMessage: function() {
			var template = this._applyTemplate();
			var data = {
				type: 'preview',
				template: template
			};
			this._sendMessage(data);
		},

		/**
		 * プレビューiframeにjsを読み込ませます
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 * @param {String|String[]} jsファイルパスまたはその配列
		 */
		_insertScriptToIFrame: function(jsPath) {
			if ($.isArray(jsPath)) {
				var promises = [];
				for (var i = 0, l = jsPath.length; i < l; i++) {
					promises.push(this._insertScriptToIFrame(jsPath[i]));
				}
				return h5.async.when(promises);
			}
			var def = this.deferred();

			var script = document.createElement('script');
			if (h5.env.ua.isIE && h5.env.ua.browserVersion <= 8) {
				script.onreadystatechange = function() {
					if (script.readyState == 'loaded') {
						def.resolve();
					}
				};
			} else {
				$(script).load(function() {
					def.resolve();
				});
			}

			$(script).error(this.own(function(e) {
				def.resolve();
				$(this).trigger('loadLibraryFail');
			}));

			script.type = 'text/javascript';
			if (jsPath[0] !== '/' && jsPath[0] !== '.') {
				// '.'始まりでも'/'始まりでもなければ、index.htmlからのパスに変換して読込ページでロードする
				jsPath = location.pathname + jsPath;
			}
			script.src = jsPath;
			this._getIFrameHeadElement().appendChild(script);

			return def;
		},

		/**
		 * プレビューiframeにcssを読み込ませます
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 * @param {String|String[]} cssファイルパスまたはその配列
		 */
		_insertCSSToIFrame: function(cssPath) {
			if ($.isArray(cssPath)) {
				var promises = [];
				for (var i = 0, l = cssPath.length; i < l; i++) {
					promises.push(this._insertCSSToIFrame(cssPath[i]));
				}
				return h5.async.when(promises);
			}
			var def = h5.async.deferred();

			var css = document.createElement('link');
			$(css).load(function() {
				def.resolve();
			});

			$(css).error(this.own(function(e) {
				def.resolve();
				$(this).trigger('loadLibraryFail');
			}));

			css.type = 'text/css';
			css.rel = 'stylesheet';
			if (cssPath[0] !== '/' && cssPath[0] !== '.') {
				// '.'始まりでも'/'始まりでもなければ、index.htmlからのパスに変換して読込ページでロードする
				cssPath = location.pathname + cssPath;
			}
			css.href = cssPath;
			this._getIFrameHeadElement().appendChild(css);

			return def;
		},

		/**
		 * プレビューiframeのhead要素を返します
		 *
		 * @memberOf hifive.templateEditor.controller.EditorController
		 * @private
		 */
		_getIFrameHeadElement: function() {
			var iframe = this.$find('iframe').get(0);
			if (h5.env.ua.isIE && h5.env.ua.browserVersion <= 8) {
				return iframe.contentDocument.getElementsByTagName('head')[0];
			}
			return iframe.contentDocument.head;
		}
	};

	// =========================================================================
	//
	// 外部公開
	//
	// =========================================================================

	h5.core.expose(editorController);

})(jQuery);
