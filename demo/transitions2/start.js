
/*global
    angular: false,
    msos: false,
    demo: false
*/

msos.provide("demo.transitions2.start");
msos.require("ng.route");

// Start by loading our demo.transitions2.start specific stylesheet
demo.transitions2.start.css = new msos.loader();
demo.transitions2.start.css.load(msos.resource_url('demo', 'transitions2/style.css'));


angular.module(
	'demo.transitions2.start',
	['ng', 'ng.route', 'ng.animate']
).config(
	['$routeProvider', function ($routeProvider) {
		"use strict";

		$routeProvider
			.when(
				'/',
				{
					templateUrl: msos.resource_url('demo', 'transitions2/tmpl/page-home.html'),
					controller: 'mainController'
				}
			).when(
				'/about',
				{
					templateUrl: msos.resource_url('demo', 'transitions2/tmpl/page-about.html'),
					controller: 'aboutController'
				}
			).when(
				'/contact',
				{
					templateUrl: msos.resource_url('demo', 'transitions2/tmpl/page-contact.html'),
					controller: 'contactController'
				}
			);
		}]
	).controller(
		'mainController',
		['$scope', function ($scope) {
			"use strict";
			$scope.pageClass = 'page-home';
		}]
	).controller(
		'aboutController',
		['$scope', function ($scope) {
			"use strict";
			$scope.pageClass = 'page-about';
		}]
	).controller(
		'contactController',
		['$scope', function ($scope) {
			"use strict";
			$scope.pageClass = 'page-contact';
		}]
	);

msos.onload_func_done.push(
	function demo_start_onload() {
		"use strict";

		angular.bootstrap('#body', ['demo.transitions2.start']);
	}
);
