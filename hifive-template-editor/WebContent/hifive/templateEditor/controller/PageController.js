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

	var pageController = {

		/**
		 * @memberOf hifive.templateEditor.controller.PageController
		 */
		__name: 'hifive.templateEditor.controller.PageController',

		__meta: {
			_templateEditorController: '#ejsEditorRoot',
			_messageController: this.rootElement
		},

		_templateEditorController: hifive.templateEditor.controller.TemplateEditController,

		_messageController: hifive.templateEditor.controller.MessageController,

		_query: null,

		_templateURL: null,

		_dataURL: null,


		__ready: function() {

			// クエリパラメータを取得
			var query = location.search;

			if (query) {
				this._query = this._parseQueryParameters(query);

				var dataURL = this._query.data;
				// データを取得し、セットします
				if (dataURL) {
					// urlを入力欄に入れます
					this.$find('.input-data-url').each(function() {
						$(this).val(dataURL);
					});

					// データを取得し、テキストエリアに表示します
					var dataDef = this._templateEditorController.getData(dataURL).then(
							this.own(function(data) {
								this._templateEditorController.setDataText(data);
							}),

							this.own(function(xhr, textStatus) {

								var $el = this.$find('.template-alert');
								var msg = 'status:' + xhr.status;

								if (textStatus === 'parsererror') {
									msg = msg + '\nデータはJSON型を指定してください';
									this._messageController.alertMessage(msg, $el);
									return;
								}

								msg = msg + '\nデータの取得に失敗しました';
								this._messageController.alertMessage(msg, $el);
							}));
				}

				var templateURL = this._query.template;
				// テンプレートを取得し、セットします
				if (templateURL) {
					var templateDef = this._templateEditorController.getTemplate(templateURL).then(

					this.own(function(template) {
						template = template.replace(/<script.*>/, '').replace(/<\/script>/, '');
						this._templateEditorController.setTemplateText(template);
					}),

					this.own(function(xhr) {
						var $el = this.$find('.template-alert');
						var msg = 'status:' + xhr.status;
						msg = msg + '\nテンプレートの取得に失敗しました';

						this._messageController.alertMessage(msg, $el);
					}));
				}

				if (dataURL && templateURL) {
					var def = [dataDef, templateDef];

					h5.async.when(def).done(this.own(function() {
						this._templateEditorController.createTemplate();
					}));
				}
			}
		},


		/**
		 * メッセージを表示します
		 *
		 * @param context
		 * @prop {string} args.msg メッセージ
		 * @prop {object} args.el メッセージを表示する要素
		 */
		'{rootElement} showMessage': function(context) {
			var args = context.evArg;
			if (args.selector) {
				args.$el = this.$find(args.selector);
			}
			this._messageController.alertMessage(args.msg, args.$el);
		},


		/**
		 * タブが切り替わり、対応するコンテントが表示されたときのイベントハンドラ
		 */
		'.nav-tabs shown.bs.tab': function(context) {

			this._templateEditorController.resizeEditAreaBar();

			var controllers = h5.core.controllerManager.getControllers($('body'));

			var sourceEditorController = controllers[0]._templateEditorController._sourceEditorController;

			if (context.event.target.hash === '#template') {

				// テンプレートタブが選択された場合、リスナーの実行を許可する
				sourceEditorController.enableListeners();

				this._refreshDividedBox();


				// dividerの位置を修正する
				// var dividerPos = this.$find('.divider').offset();
				// if (dividerPos) {
				// var dividerTop = dividerPos.top;
				//
				// var inputAreaSize = this.$find('.dividedBox').outerWidth();// テンプレートタブのエディタ部分の幅
				// var dividerLeft = inputAreaSize * 0.75;// dividerのleftの位置
				//
				// this.$find('.divider').offset({
				// top: dividerTop,
				// left: dividerLeft
				// });
				//
				// // ツリー部分の位置を修正する
				// var palettePos = this.$find('.componentPalette').offset();
				// var dividerWidth = this.$find('.divider').outerWidth();
				//
				// var paletteTop = palettePos.top;
				// var paletteLeft = dividerLeft + dividerWidth;
				//
				// this.$find('.componentPalette').offset({
				// top: paletteTop,
				// left: paletteLeft
				// });
				//
				//
				// // テンプレート編集部分の位置を修正する
				// this.$find('.sourceText').outerWidth(dividerLeft);
				//
				//
				// this._refreshDividedBox();
				//
				// }
				return;
			}
			// テンプレートタブ以外が選択された場合、リスナーの実行を禁止する
			sourceEditorController.disableListeners();

		},


		/**
		 * dividedBoxをリフレッシュします
		 */
		_refreshDividedBox: function() {
			var dividedBoxes = h5.core.controllerManager.getControllers($('body'), {
				name: 'h5.ui.container.DividedBox',
				deep: true
			});

			for (var i = 0, len = dividedBoxes.length; i < len; i++) {
				dividedBoxes[i].refresh();
			}
		},


		_parseQueryParameters: function(query) {
			var param = query.slice(1);

			var ary = param.split('&');

			var map = {};
			for (var i = 0, len = ary.length; i < len; i++) {

				temp = ary[i].split('=');// [key,value]

				var key = temp[0];

				var value;
				if (temp.length === 2) {
					value = temp[1];
				} else {
					value = null;
				}

				map[key] = value;
			}

			return map;
		}


	};

	// =========================================================================
	//
	// 外部公開
	//
	// =========================================================================

	h5.core.expose(pageController);

})(jQuery);

// ---- Init ---- //
$(function() {
	h5.core.controller('body', hifive.templateEditor.controller.PageController);
});