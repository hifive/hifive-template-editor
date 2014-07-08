/*
 * Copyright (C) 2013-2014 NS Solutions Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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

	var TEMPLATE_ID = 'dummyId';

	var DATA_TEMPLATE_ID = 'data-template-id';

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

	var previewController = {
		/**
		 * @memberOf hifive.templateEditor.controller.PreviewController
		 */
		__name: 'hifive.templateEditor.controller.PreviewController',

		_view: null,

		_data: null,

		_$target: null,

		__construct: function() {
			this._view = h5.core.view.createView();
		},

		/**
		 * テンプレートに適用するデータ（パラメータオブジェクト）をセットします。
		 *
		 * @param data
		 */
		setData: function(data) {
			this._data = data;
		},

		/**
		 * テンプレートの適用先要素を設定します。
		 *
		 * @param element
		 */
		setTarget: function(element) {
			if (element) {
				this._$target = $(element);
			} else {
				//elementがnullの場合にjQueryオブジェクトを作らない
				this._$target = null;
			}
		},

		/**
		 * テンプレートを適用します。
		 *
		 * @param template
		 */
		preview: function(template) {
			//テンプレートが不正な場合ここで例外が発生する
			this._view.register(TEMPLATE_ID, template);

			var generated = this._view.get(TEMPLATE_ID, this._data);

			var $target = this._$target ? this._$target : $(this.rootElement);

			if(window.opener) {
				var page = window.opener.hifive.editor.u.getFocusedPageController();
				page.setHtml(this._$target[0], generated);

				var doc = page.getDocument();

				var templateId = $target.attr(DATA_TEMPLATE_ID);

				if(templateId){
					var $tmpl = $('script[type="text/ejs"][id="'+ templateId +'"]', doc)
					$tmpl[0].text = template;
				}

			}
			else {
				$target.html(generated);
			}
		}
	};

	// =========================================================================
	//
	// 外部公開
	//
	// =========================================================================

	h5.core.expose(previewController);

})(jQuery);
