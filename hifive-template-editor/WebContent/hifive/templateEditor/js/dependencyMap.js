(function($) {
	var dependencyMap = {

		__name: 'hifive.templateEditor.js.dependencyMap',

		map: {
			'bs3.2': {
				'js': ['res/lib/bootstrap3.2/js/bootstrap.js'],
				'css': ['res/lib/bootstrap3.2/css/bootstrap.css']
			},

			'dummy': {
				'js': ['dummy.js'],
				'css': ['dummy.css']
			}

		}
	};

	h5.core.expose(dependencyMap);
})(jQuery);