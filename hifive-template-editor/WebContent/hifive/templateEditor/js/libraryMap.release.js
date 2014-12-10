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
	var libraryMap = {

		__name: 'hifive.templateEditor.js.libraryMap',

		map: {
			'bs3.3.0': {
				js: ['res/lib/bootstrap/3.3.0/js/bootstrap.js'],
				css: ['res/lib/bootstrap/3.3.0/css/bootstrap.css'],
				name: 'bs3.3.0',
				label: 'Bootstrap3.3.0',
				defaultChecked: true
			},

			'jqm1.3.0': {
				'js': ['res/lib/jqm/1.3.0/jquery.mobile-1.3.0.js'],
				'css': ['res/lib/jqm/1.3.0/jquery.mobile-1.3.0.css',
						'res/lib/jqm/1.3.0/jquery.mobile.structure-1.3.0.css',
						'res/lib/jqm/1.3.0/jquery.mobile.theme-1.3.0.css'],
				'name': 'jqm1.3.0',
				label: 'jQuery Mobile 1.3.0'
			},

			'jqm1.4.2': {
				'js': ['res/lib/jqm/1.4.2/jquery.mobile-1.4.2.js'],
				'css': ['res/lib/jqm/1.4.2/jquery.mobile-1.4.2.css',
						'res/lib/jqm/1.4.2/jquery.mobile.structure-1.4.2.css',
						'res/lib/jqm/1.4.2/jquery.mobile.theme-1.4.2.css'],
				'name': 'jqm1.4.2',
				label: 'jQuery Mobile 1.4.2'
			},

			jquery1: {
				js: ['res/lib/jquery/jquery-1.js'],
				name: 'jquery1',
				defaultLoad: true
			},

			jquery2: {
				js: ['res/lib/jquery/jquery-2.js'],
				name: 'jquery2',
				defaultLoad: true
			},

			hifive: {
				js: ['res/lib/hifive/ejs-h5mod.js', 'res/lib/hifive/h5.js'],
				css: ['res/lib/hifive/h5.css'],
				name: 'hifive',
				defaultLoad: true
			}
		}
	};

	h5.core.expose(libraryMap);
})(jQuery);