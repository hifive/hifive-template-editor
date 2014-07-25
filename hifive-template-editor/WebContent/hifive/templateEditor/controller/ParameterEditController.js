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

	var parameterEditController = {
		/**
		 * @memberOf hifive.templateEditor.controller.ParameterEditController
		 */
		__name: 'hifive.templateEditor.controller.ParameterEditController',

		__ready: function() {
			// TODO テンプレートを使用する
			this.view.register('parameter-edit-tr', this
					.$find('.parameter-input-table tbody tr:first')[0].outerHTML);
		},

		'.close-button click': function() {
			$(this.rootElement).css('display', 'none');
		},

		'input change': function(context, $target) {
			// 一番最後のinputへの入力なら、新規追加
			var $tr = $target.parents('tr');
			if (!$tr.next().length) {
				this.view.append($target.parents('table').find('tbody'), 'parameter-edit-tr');
			}
		},

		'input.param-name blur': function(context, $target) {
			if ($.trim($target.val())) {
				return;
			}
			// 属性名が空でかつ一番下の列じゃなければ削除
			var $tr = $target.parents('tr');
			if (!$tr.next().length) {
				return;
			}
			$tr.remove();
		}
	};

	// =========================================================================
	//
	// 外部公開
	//
	// =========================================================================

	h5.core.expose(parameterEditController);

})(jQuery);
