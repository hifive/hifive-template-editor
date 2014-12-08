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

	var messageController = {

		/**
		 * @memberOf hifive.templateEditor.controller.messageController
		 */
		__name: 'hifive.templateEditor.controller.MessageController',

		_templateTimer: null,// テンプレートタブのメッセージ表示用タイマー

		_templateErrTimer: null,// テンプレートタブのエラーメッセージ表示用タイマー

		_dataTimer: null, // データタブのメッセージ表示用タイマー

		_dataErrTimer: null, // データタブのエラーメッセージ表示用タイマー

		_previewTimer: null,// プレビューのメッセージ表示用タイマー

		_previewErrTimer: null,// プレビューのエラーメッセージ表示用タイマー

		_selectorMap: {},


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
		 * @param msg 表示するメッセージ
		 * @param $el メッセージを表示する要素
		 */
		alertMessage: function(msg, $el) {

			$el.text(msg);
			$el.css('display', 'block');


			if (this._selectorMap[$el.selector]) {
				clearTimeout(this._selectorMap[$el.selector]);
			}

			this._selectorMap[$el.selector] = setTimeout(function() {
				$el.css('display', 'none');
			}, 3000);
		},

		/**
		 * メッセージを非表示にします
		 *
		 * @param $el メッセージを非表示にする要素
		 */
		clearMessage: function($el) {
			$el.css('display', 'none');
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