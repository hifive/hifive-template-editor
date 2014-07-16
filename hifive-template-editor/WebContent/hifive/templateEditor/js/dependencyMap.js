(function($) {
	var dependencyMap = {

		__name: 'hifive.templateEditor.js.dependencyMap',

		map: {
			'bs3.2': {
				'js': ['../../res/lib/bootstrap3.2/js/bootstrap.js'],
				'css': ['../../res/lib/bootstrap3.2/css/bootstrap.css'],
				'name': 'bs3.2'
			},

			'jqm1.3.0': {
				'js': ['../../res/lib/jqm/1.3.0/jquery.mobile-1.3.0.js'],
				'css': ['../../res/lib/jqm/1.3.0/jquery.mobile-1.3.0.css',
						'../../res/lib/jqm/1.3.0/jquery.mobile.structure-1.3.0.css',
						'../../res/lib/jqm/1.3.0/jquery.mobile.theme-1.3.0.css'],
				'name': 'jqm1.3.0'
			},

			'jqm1.4.2': {
				'js': ['../../res/lib/jqm/1.4.2/jquery.mobile-1.4.2.js'],
				'css': ['../../res/lib/jqm/1.4.2/jquery.mobile-1.4.2.css',
						'../../res/lib/jqm/1.4.2/jquery.mobile.structure-1.4.2.css',
						'../../res/lib/jqm/1.4.2/jquery.mobile.theme-1.4.2.css'],
				'name': 'jqm1.4.2'
			}

		}
	};

	h5.core.expose(dependencyMap);
})(jQuery);