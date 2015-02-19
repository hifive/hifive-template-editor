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

	var ERR_MSG_TEMPLATE_FILE_INVALID_ELEMENT = 'テンプレートファイルに<script>タグ以外の記述があります。テンプレートファイルは全て<script>タグで囲んだテンプレートを記述してください';
	var ERR_MSG_TEMPLATE_FILE_NO_TEMPLATE = 'テンプレートファイルに<script>タグの記述がありません。テンプレートファイルは全て<script>タグで囲んだテンプレートを記述してください';
	var ERR_MSG_TEMPLATE_INVALID_ID = 'テンプレートIDが指定されていません。空や空白でない文字列で指定してください。';

	/**
	 * ViewTemplateクラス
	 */
	function ViewTemplate(id, content) {
		this.id = id;
		this.contents = content
	}

	/**
	 * @class
	 * @name
	 */
	var templateLoadLogic = {

		/**
		 * @memberof hifive.templateEditor.logic.TemplateLoadLogic
		 */
		__name: 'hifive.templateEditor.logic.TemplateLoadLogic',

		/**
		 * 指定されたurlからデータオブジェクトを取得します（戻り値はJSONと仮定）
		 */
		loadData: function(url, type, param) {
			var data = {
				url: url,
				dataType: 'json',
				data: param,
				type: type || 'GET'
			};

			return h5.ajax(data);
		},

		/**
		 * 指定されたurlからテンプレ―トを取得します
		 */
		loadTemplate: function(url) {
			var dfd = this.deferred();
			h5.ajax(url, {
				dataType: 'text'
			}).done(this.own(function(content) {
				try {
					var textResources = this.parseTemplateFileContents(content);
				} catch (e) {
					dfd.reject(e);
				}
				// resolveする
				dfd.resolve({
					url: url,
					templates: textResources
				});
			})).fail(function(errorObj) {
				// リソースの取得に失敗
				dfd.reject(errorObj);
			});
			return dfd.promise();
		},

		/**
		 * テンプレートファイル記述文字列をパースしてViewTemplateの配列を返します
		 */
		parseTemplateFileContents: function(content) {
			// コンテンツからscript要素を取得
			var $elements = $(content).filter(function() {
				// IE8以下で、要素内にSCRIPTタグが含まれていると、jQueryが</SCRIPT>をunknownElementとして扱ってしまう。
				// nodeTypeを見てコメントノードも除去して、tagNameが'/SCRIPT'のものも除去する。
				return this.nodeType === 1 && this.tagName.indexOf('/') !== 1;
			});
			var textResources = [];
			if ($elements.not('script[type="text/ejs"]').length > 0) {
				// テンプレート記述以外のタグがあ場合はエラー
				throw new Error(ERR_MSG_TEMPLATE_FILE_INVALID_ELEMENT);
			}
			if ($elements.length === 0) {
				// テンプレート記述が一つもない場合はエラー
				throw new Error(ERR_MSG_TEMPLATE_FILE_NO_TEMPLATE);
			}
			// script要素からViewTemplateを作成
			$elements.each(function() {
				var id = $.trim(this.id);
				if (!id) {
					throw new Error(ERR_MSG_TEMPLATE_INVALID_ID);
				}
				var content = $.trim(this.innerHTML);
				textResources.push(new ViewTemplate(id, content));
			});
			return textResources;
		}
	};

	h5.core.expose(templateLoadLogic);

})(jQuery);
