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
	 * メッセージコントローラ
	 *
	 * @class
	 * @name hifive.templateEditor.controller.MessageController
	 */
	var messageController = {
		/**
		 * @memberOf hifive.templateEditor.controller.MessageController
		 */
		__name: 'hifive.templateEditor.controller.MessageController',

		/**
		 * テンプレートタブのメッセージ表示用タイマー
		 *
		 * @memberOf hifive.templateEditor.controller.MessageController
		 * @private
		 */
		_templateTimer: null,

		/**
		 * テンプレートタブのエラーメッセージ表示用タイマー
		 *
		 * @memberOf hifive.templateEditor.controller.MessageController
		 * @private
		 */
		_templateErrTimer: null,

		/**
		 * データタブのメッセージ表示用タイマー
		 *
		 * @memberOf hifive.templateEditor.controller.MessageController
		 * @private
		 */
		_dataTimer: null,

		/**
		 * データタブのエラーメッセージ表示用タイマー
		 *
		 * @memberOf hifive.templateEditor.controller.MessageController
		 * @private
		 */
		_dataErrTimer: null, // データタブのエラーメッセージ表示用タイマー

		/**
		 * プレビューのメッセージ表示用タイマー
		 *
		 * @memberOf hifive.templateEditor.controller.MessageController
		 * @private
		 */
		_previewTimer: null,// プレビューのメッセージ表示用タイマー

		/**
		 * プレビューのエラーメッセージ表示用タイマー
		 *
		 * @memberOf hifive.templateEditor.controller.MessageController
		 * @private
		 */
		_previewErrTimer: null,

		/**
		 * 表示している要素のselectorと表示しているメッセージタイマーIDのマップ
		 *
		 * @memberOf hifive.templateEditor.controller.MessageController
		 * @private
		 */
		_selectorMap: {},

		/**
		 * 初期化
		 *
		 * @memberOf hifive.templateEditor.controller.MessageController
		 * @private
		 */
		__ready: function() {
			$.extend(this._selectorMap, {
				'.template-alert': this._templateErrTimer,
				'.template-msg': this._templateTimer,
				'.data-alert': this._dataErrTimer,
				'.data-msg': this._dataTimer,
				'.preview-alert': this._previewErrTimer,
				'.preview-msg': this._previewTimer
			});
		},

		/**
		 * メッセージを表示します
		 *
		 * @memberOf hifive.templateEditor.controller.MessageController
		 * @param msg 表示するメッセージ
		 * @param $el メッセージを表示する要素
		 */
		alertMessage: function(msg, $el) {
			$el.text(msg);
			$el.removeClass('hidden');
			if (this._selectorMap[$el.selector]) {
				clearTimeout(this._selectorMap[$el.selector]);
			}

			this._selectorMap[$el.selector] = setTimeout(function() {
				$el.addClass('hidden');
			}, 3000);
		},

		/**
		 * メッセージを非表示にします
		 *
		 * @memberOf hifive.templateEditor.controller.MessageController
		 * @param $el メッセージを非表示にする要素
		 */
		clearMessage: function($el) {
			$el.addClass('hidden');
			if (this._selectorMap[$el.selector]) {
				clearTimeout(this._selectorMap[$el.selector]);
			}
		}
	};


	// =========================================================================
	//
	// 外部公開
	//
	// =========================================================================

	h5.core.expose(messageController);

})(jQuery);