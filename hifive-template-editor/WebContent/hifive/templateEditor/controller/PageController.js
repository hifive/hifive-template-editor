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
			_templateEditorController: '#ejsEditorRoot'
		},

		_templateEditorController: hifive.templateEditor.controller.TemplateEditController,


		/**
		 * タブが切り替わり、対応するコンテントが表示されたときのイベントハンドラ
		 */
		'.nav-tabs shown.bs.tab': function(context) {

			var controllers = h5.core.controllerManager.getControllers($('body'));

			var sourceEditorController = controllers[0]._pageController._templateEditorController._sourceEditorController;

			if (context.event.target.hash === '#template') {

				// テンプレートタブが選択された場合、リスナーの実行を許可する
				sourceEditorController.enableListeners();

				this._refreshDividedBox();


				// dividerの位置を修正する
				var dividerPos = this.$find('.inputArea .divider').offset();
				if (dividerPos) {
					var dividerTop = dividerPos.top;

					var inputAreaSize = this.$find('.inputArea .dividedBox').outerWidth();// テンプレートタブのエディタ部分の幅
					var dividerLeft = inputAreaSize * 0.75;// dividerのleftの位置

					this.$find('.inputArea .divider').offset({
						top: dividerTop,
						left: dividerLeft
					});

					// ツリー部分の位置を修正する
					var palettePos = this.$find('.inputArea .componentPalette').offset();
					var dividerWidth = this.$find('.inputArea .divider').outerWidth();

					var paletteTop = palettePos.top;
					var paletteLeft = dividerLeft + dividerWidth;

					this.$find('.componentPalette').offset({
						top: paletteTop,
						left: paletteLeft
					});


					// テンプレート編集部分の位置を修正する
					this.$find('.sourceText').outerWidth(dividerLeft);


					this._refreshDividedBox();

				}
				return;
			}
			// テンプレートタブ以外が選択された場合、リスナーの実行を禁止する
			sourceEditorController.disableListeners();

		},


		/**
		 * テンプレートとデータオブジェクトをキャッシュします
		 */
		init: function(data_url, template_url) {

			var logic = this._templateEditorController._templateEditorLogic;

			var dataDef = logic.loadData(data_url);// データオブジェクトを取得
			var templateDef = logic.loadTemplate(template_url);// テンプレートを取得

			var promises = [dataDef.promise(), templateDef.promise()];

			var indicator = this.indicator({
				promises: promises,
				target: document.body,
				message: 'データをロードしています'
			}).show();

			h5.async.when(dataDef, templateDef).done(this.own(function(data, template) {

				template = template[0].replace(/<script.*>/, '').replace(/<\/script>/, '');

				this._templateEditorController.setDataText(JSON.stringify(data[0], null, '	'));

				this._templateEditorController.setTemplateText(template);

			}));
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
		}

	};

	// =========================================================================
	//
	// 外部公開
	//
	// =========================================================================

	h5.core.expose(pageController);

})(jQuery);