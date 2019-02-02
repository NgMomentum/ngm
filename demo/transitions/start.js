
/*global
    angular: false,
    msos: false,
    demo: false
*/

msos.provide("demo.transitions.start");
msos.require("ng.route");

// Start by loading our demo.transitions.start specific stylesheet
demo.transitions.start.css = new msos.loader();
demo.transitions.start.css.load(msos.resource_url('demo', 'transitions/style.css'));


angular.module(
	'demo.transitions.start',
	['ng', 'ng.route']
).config(
	['$routeProvider', function ($routeProvider) {
		"use strict";

		$routeProvider
			.when(
				'/',
				{
					templateUrl: msos.resource_url('demo', 'transitions/tmpl/home.html'),
					controller: 'mainController'
				}
			).when(
				'/about',
				{
					templateUrl: msos.resource_url('demo', 'transitions/tmpl/about.html'),
					controller: 'aboutController'
				}
			).when(
				'/contact',
				{
					templateUrl: msos.resource_url('demo', 'transitions/tmpl/contact.html'),
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

		angular.bootstrap('#body', ['demo.transitions.start']);
	}
);
