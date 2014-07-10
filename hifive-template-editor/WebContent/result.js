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
	var resultEditorController = {

		/**
		 * @memberOf hifive.templateEditor.controller.ResultEditorController
		 */
		__name: 'hifive.templateEditor.controller.ResultEditorController',


		/**
		 * テンプレートを反映
		 *
		 * @param data
		 */
		'{rootElement} preview': function(data) {
			this.$find('.templateApplicationRoot')[0].innerHTML = data;
		},



		'{rootElement} loadLib': function(path) {
			console.log('loadLib 到達！');
		},

		__ready: function() {
			var myOrigin = location.protocol + '//' + location.host;
			var data = {
				eventName: 'readyComp'
			};
//			parent.$('')[0].contentWindow.postMessage(data, myOrigin);
			parent.$('body').trigger('readyComp');
		}

	};

	h5.core.expose(resultEditorController);

})(jQuery);

// ---Init--- //
$(function() {
	h5.core.controller('body', hifive.templateEditor.controller.ResultEditorController);
});