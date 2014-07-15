(function($) {
	var dependencyMap = {

		__name: 'hifive.templateEditor.js.dependencyMap',

		map: {
			'bs3.2': {
				'js': ['res/lib/bootstrap3.2/js/bootstrap.js'],
				'css': ['res/lib/bootstrap3.2/css/bootstrap.css'],
				'name': 'Bootstrap3.2'
			},

			'jqm1.3.0': {
				'js': ['res/lib/jquery.mobile/jquery.mobile-1.3.0.js'],
				'css': ['res/lib/jquery.mobile/jquery.mobile-1.3.0.css',
						'res/lib/jquery.mobile/jquery.mobile.structure-1.3.0.css',
						'res/lib/jquery.mobile/jquery.mobile.theme-1.3.0.css'],
				'name': 'jQuery Mobile 1.3.0'
			}

		}
	};

	h5.core.expose(dependencyMap);
})(jQuery);