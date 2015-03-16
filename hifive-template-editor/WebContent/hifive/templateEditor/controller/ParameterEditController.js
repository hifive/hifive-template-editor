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
	 * パラメータ編集コントローラ
	 *
	 * @class
	 * @name hifive.templateEditor.controller.ParameterEditController
	 */
	var parameterEditController = {
		/**
		 * @memberOf hifive.templateEditor.controller.ParameterEditController
		 */
		__name: 'hifive.templateEditor.controller.ParameterEditController',

		/**
		 * 入力されている値からパラメータオブジェクトを作成する
		 *
		 * @memberOf hifive.templateEditor.controller.ParameterEditController
		 */
		getParameter: function() {
			var $tr = $('.parameter-input-table tbody tr');
			var parameterObj = {};
			var existParam = false;
			$tr.each(function() {
				var $this = $(this);
				var name = $.trim($this.find('.param-name').val());
				var val = $.trim($this.find('.param-value').val());
				if (!name) {
					return;
				}
				existParam = true;
				// 同じnameの値については配列、そうでなければvalueをそのまま格納する
				if (!parameterObj[name]) {
					parameterObj[name] = val;
				} else {
					if (!$.isArray(parameterObj[name])) {
						parameterObj[name] = [parameterObj[name]];
					}
					parameterObj[name].push(val);
				}
			});
			// パラメータが何も指定されていなければnullを返す
			return existParam ? parameterObj : null;
		},

		/**
		 * 閉じるボタンクリック
		 *
		 * @memberOf hifive.templateEditor.controller.ParameterEditController
		 */
		'.close-button click': function() {
			$(this.rootElement).addClass('hidden');
		},

		/**
		 * 入力内容が変更された時のハンドラ
		 *
		 * @memberOf hifive.templateEditor.controller.ParameterEditController
		 */
		'input change': function(context, $target) {
			// 一番最後のinputへの入力なら、新規追加
			var $tr = $target.parents('tr');
			if (!$tr.next().length) {
				this.view.append($target.parents('table').find('tbody'), 'parameter-edit-tr');
			}
		},

		/**
		 * フォーカスが外れた時のハンドラ
		 *
		 * @memberOf hifive.templateEditor.controller.ParameterEditController
		 */
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
