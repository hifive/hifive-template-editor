/*
 * Copyright (C) 2013-2015 NS Solutions Corporation
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
	 * ページコントローラ
	 *
	 * @class
	 * @name hifive.templateEditor.controller.PageController
	 */
	var pageController = {
		/**
		 * @memberOf hifive.templateEditor.controller.PageController
		 */
		__name: 'hifive.templateEditor.controller.PageController',

		__templates: 'hifive/templateEditor/templates/templateEditor.ejs',

		/**
		 * コントローラのメタ定義
		 *
		 * @memberOf hifive.templateEditor.controller.PageController
		 * @private
		 */
		__meta: {
			_editorController: '#ejsEditorRoot',
			_messageController: this.rootElement
		},

		/**
		 * エディタコントローラ
		 *
		 * @memberOf hifive.templateEditor.controller.PageController
		 * @private
		 */
		_editorController: hifive.templateEditor.controller.EditorController,

		/**
		 * メッセージコントローラ
		 *
		 * @memberOf hifive.templateEditor.controller.PageController
		 * @private
		 */
		_messageController: hifive.templateEditor.controller.MessageController,

		/**
		 * 初期化
		 *
		 * @memberOf hifive.templateEditor.controller.PageController
		 * @private
		 */
		__ready: function() {
			// クエリパラメータを取得
			if (!location.search) {
				return;
			}
			var query = this._parseQueryParameters(location.search);

			var dataURL = query.data;
			var dataDef = null;
			// データを取得し、セットします
			if (dataURL) {
				// urlを入力欄に入れます
				this.$find('input[name="data-url"]').val(dataURL);

				// データを取得し、テキストエリアに表示します
				dataDef = this._editorController.loadData(dataURL).done(this.own(function(data) {
					this._editorController._dataEditorController.setTextByObject(data);
				}));
			}

			var templateURL = query.template;
			var templateDef = null;
			// テンプレートを取得し、セットします
			if (templateURL) {
				// urlを入力欄に入れます
				this.$find('input[name="ejs-url"]').val(templateURL);
				templateDef = this._editorController.loadTemplate(templateURL);
			}

			if (!dataURL && !templateURL) {
				return;
			}
			var readyDfd = h5.async.deferred();
			h5.async.when(dataDef, templateDef).done(this.own(function() {
				this.$find('#ejsEditorRoot').trigger('applyTemplate');
			})).always(function() {
				readyDfd.resolve();
			});
			return readyDfd.promise();
		},

		/**
		 * メッセージを表示します
		 *
		 * @memberOf hifive.templateEditor.controller.PageController
		 * @param context
		 * @prop {String} context.evArg.msg メッセージ
		 * @prop {String|jQuery|DOM} context.evArg.target メッセージを表示する要素
		 */
		'{rootElement} showMessage': function(context) {
			var args = context.evArg;
			this._messageController.alertMessage(args.msg, $(args.target));
		},

		/**
		 * メッセージを非表示にします
		 *
		 * @memberOf hifive.templateEditor.controller.PageController
		 * @param context
		 * @prop {String|jQuery|DOM} context.evArg.target メッセージを表示する要素
		 */
		'{rootElement} clearMessage': function(context) {
			var args = context.evArg;
			if (args.selector) {
				args.$el = this.$find(args.selector);
			}
			this._messageController.clearMessage(args.$el);
		},

		/**
		 * タブが切り替わり、対応するコンテントが表示されたときのイベントハンドラ
		 *
		 * @memberOf hifive.templateEditor.controller.PageController
		 * @param {Object} context
		 */
		'.nav-tabs shown.bs.tab': function(context) {

			this._editorController.resizeEditAreaBar();

			var controllers = h5.core.controllerManager.getControllers($('body'));

			var sourceEditorController = controllers[0]._editorController._sourceEditorController;

			if (context.event.target.hash === '#template') {
				// テンプレートタブが選択された場合、リスナーの実行を許可する
				sourceEditorController.enableListeners();
				this._refreshDividedBox();
				// テンプレートエディタにフォーカス
				sourceEditorController.focus();
				return;
			}
			// テンプレートタブ以外が選択された場合、リスナーの実行を禁止する
			sourceEditorController.disableListeners();

			if (context.event.target.hash === '#data') {
				// データエディタにフォーカス
				var dataEditorController = controllers[0]._editorController._dataEditorController;
				dataEditorController.focus();
			}
		},

		/**
		 * dividedBoxをリフレッシュします
		 *
		 * @memberOf hifive.templateEditor.controller.PageController
		 * @private
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

		/**
		 * リクエストパラメータをパースします
		 *
		 * @memberOf hifive.templateEditor.controller.PageController
		 * @returns {Object}
		 */
		_parseQueryParameters: function(query) {
			var param = query.slice(1);
			var ary = param.split('&');
			var map = {};
			for (var i = 0, len = ary.length; i < len; i++) {
				var temp = ary[i].split('=');// [key,value]
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