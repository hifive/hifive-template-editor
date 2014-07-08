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
	var JSON_DATA_URL = 'sample.json';

	var editorLogic = {
		__name: 'hifive.editor.sample.EditorLogic',

		loadJsonData: function() {
			return h5.ajax({
				url: JSON_DATA_URL,
			// dataType: 'json'
			});
		}

	};
	h5.core.expose(editorLogic);
})(jQuery);

(function($) {

	var editorSampleController = {

		__name: 'hifive.editor.sample.editorSampleController',

		_templateEditorController: hifive.editor.controller.ejs.TemplateEditController,

		__meta: {
			_templateEditorController: {
				rootElement: '#ejsEditorRoot'
			}
		},

		__templates: 'sample.ejs', // サンプルのテンプレート

		_editorLogic: hifive.editor.sample.EditorLogic,

		__ready: function() {

			this._editorLogic.loadJsonData().done(this.own(function(json) {

				var templateText = this.view.get('sampleEjs', json);

				this._templateEditorController.init(templateText, json);

			})).fail(
					function(XMLHttpRequest, textStatus, errorThrown) {
						alert("XMLHttpRequest : " + XMLHttpRequest.status + " textStatus : "
								+ textStatus + " errorThrown : " + errorThrown.message);
					});

		}
	};

	h5.core.expose(editorSampleController);

})(jQuery);


// ---- Init ---- //
$(function() {
	h5.core.controller('body', hifive.editor.sample.editorSampleController);
});