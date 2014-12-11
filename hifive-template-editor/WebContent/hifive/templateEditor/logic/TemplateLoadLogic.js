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
			return h5.ajax({
				url: url,
				dataType: 'text'
			});
		}

	};

	h5.core.expose(templateLoadLogic);

})(jQuery);
