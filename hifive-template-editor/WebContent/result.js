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
		'{rootElement} preview': function(context) {
			this.$find('.templateApplicationRoot')[0].innerHTML = context.evArg;
		},


		'{rootElement} loadLib': function(context) {
			var path = context.evArg;

			if (typeof path === 'object') {
				path = [path];
			}

			var jsPaths = [];
			var cssPaths = [];
			for (var i = 0, len = path.length; i < len; i++) {

				// jsファイルのパスを格納
				for (var j = 0, jsLen = path[i]['js'].length; j < jsLen; j++) {
					jsPaths.push(path[i]['js'][j]);
				}

				// cssファイルのパスを格納
				for (var k = 0, cssLen = path[i]['css'].length; k < cssLen; k++) {
					cssPaths.push(path[i]['css'][k]);
				}
			}

			var loadJS = h5.u.loadScript(jsPaths);

			h5.async.when(loadJS, this._loadCSS(cssPaths)).done(function(data) {
				console.log('loadLib ロードできたっぽい？');
			});

		},

		__ready: function() {
			parent.$('#ejsEditorRoot').trigger('resultEditorReadyComp');
		},


		_loadCSS: function(cssPaths) {
			var def = h5.async.deferred();
			var cssFiles = [];
			for (var i = 0, len = cssPaths.length; i < len; i++) {
				var css = document.createElement('link');
				css.href = cssPaths[i];
				css.type = 'text/css';
				css.rel = 'stylesheet';
				css.media = 'screen';
				cssFiles.push(css);
				def.resolve(cssFiles);
			}
			return def;
		}

	};

	h5.core.expose(resultEditorController);

})(jQuery);

// ---Init--- //
$(function() {
	h5.core.controller('body', hifive.templateEditor.controller.ResultEditorController);
});