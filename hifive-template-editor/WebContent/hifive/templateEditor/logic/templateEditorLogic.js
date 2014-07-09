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
 * hifive
 */

(function($) {

	var templateEditorLogic = {

		/**
		 * @memberOf hifive.tepmlateEditor.logic.TemplateEditorLogic
		 */
		__name: 'hifive.tepmlateEditor.logic.TemplateEditorLogic',

		_url: null,

		_template: null,

		_trimTemplate: null,

		_json: null,

		_jsonData: null,



		/**
		 *
		 * @param url
		 */
		_getData: function(url) {
			return h5.ajax({
				url: url
			});
		},


		_trimTemplateData: function() {
			return _template.replace(/<script.*>/, '').replace(/<\/script>/, '');
		},







	};

	// ===
	//
	// 外部公開
	//
	// ===
	h5.core.expose(templateEditorLogic);

})(jQuery);