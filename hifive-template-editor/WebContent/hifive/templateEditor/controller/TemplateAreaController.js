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

	var templateAreaController = {

		/**
		 * @memberOf hifive.templateEditor.controller.templateAreaController
		 */
		__name: 'hifive.templateEditor.controller.TemplateAreaController',


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

			$(this.rootElement).trigger('sendMsg', {
				'data': data
			});
		},


		'.lineNum-btn click': function() {
			$(this.rootElement).trigger('addLineNum');
		}


	};

	// =========================================================================
	//
	// 外部公開
	//
	// =========================================================================

	h5.core.expose(templateAreaController);

})(jQuery);