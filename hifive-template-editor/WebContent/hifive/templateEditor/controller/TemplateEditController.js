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
			}
		},

		_previewController: hifive.templateEditor.controller.PreviewController,

		_sourceEditorController: hifive.templateEditor.controller.SourceEditorController,

		_targetWaitDeferred: null,

		_isCloseConfirmationSet: false,

		__ready: function() {
			var that = this;

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


			this._previewController.setTarget(this.$find('.templateApplicationRoot'));

			// TODO: ここ必要？window.openerはこの窓を開いた窓の参照を返す。
			// if (window.opener) {
			// this._targetWaitDeferred = h5.async.deferred();
			// var promise = this._targetWaitDeferred.promise();
			//
			// this.indicator({
			// target: document.body,
			// promises: promise,
			// block: true,
			// message: 'ロード中...'
			// }).show();
			//
			// var that = this;
			// setTimeout(function() {
			// if (that._targetWaitDeferred.state() === 'pending') {
			// alert('テンプレートの適用先の設定に失敗しました。');
			// that._targetWaitDeferred.resolve();
			// }
			// }, 2000);
			//
			// return promise;
			// }
		},

		init: function(template, json) {

			var jsonData = JSON.stringify(json);

			this.setDataText(jsonData);
			// var templateText = this.view.get(template, json);
			this.setTemplateText(template);

			this._applyTemplate();

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

		'.lib change': function(context, elem) {
			// console.log('test');

			var checked = elem[0].checked;
			if (checked == null) {
				return;
			}

			if (checked) {
				var ifmHead = this.$find('.frame').contents().find('head');
				var css = this.$find('.frame').contents()[0].createElement('link');
				css.href = 'res/lib/bootstrap3.2/css/dummy.css';
				css.type = 'text/css';
				css.rel = 'stylesheet';
				css.media = 'screen';

				try {
					ifmHead[0].appendChild(css);
				}
				catch (e) {
					console.log('cssファイルが見つからない');
				}
			}

		},

		'{rootElement} load': function() {
			console.log('iframe load');
		},

		'{rootElement} ajaxError ': function() {
			console.log('ajax success');
		},



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
				// this._previewController.preview(template);

				var generated = this._previewController.generate(template);
				var myOrigin = location.protocol + '//' + location.host;

				var frame = this.$find('.frame')[0];
				frame.contentWindow.postMessage(generated, myOrigin);
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
