
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide('demo.route.start');
msos.require('ng.route');


msos.onload_func_done.push(
	function () {
		"use strict";

		var temp_sd = 'demo.route.start';

		msos.console.debug(temp_sd + ' -> start.');

		demo.route.start = angular.module(
			'demo.route.start',
			['ngRoute']
		).config(
			['$routeProvider', function ($routeProvider) {
				$routeProvider
					// route for the home page
					.when('/', {
						templateUrl: msos.resource_url('demo', 'route/pages/home.html'),
						controller: 'mainController'
					})

					// route for the about page
					.when('/about', {
						templateUrl: msos.resource_url('demo', 'route/pages/about.html'),
						controller: 'aboutController'
					})

					// route for the contact page
					.when('/contact', {
						templateUrl: msos.resource_url('demo', 'route/pages/contact.html'),
						controller: 'contactController'
					})

					.otherwise({
						redirectTo: '/'
					});
			}]
		);

		// create the controller and inject Angular's $scope
		demo.route.start.controller(
			'mainController',
			['$scope', function ($scope) {
				msos.console.debug(temp_sd + ' - mainController -> called!');
				// create a message to display in our view
				$scope.message = 'Everyone come and see how good I look!';
			}]
		);

		demo.route.start.controller(
			'aboutController',
			['$scope', function ($scope) {
				msos.console.debug(temp_sd + ' - aboutController -> called!');
				$scope.message = 'Look! I am an about page.';
			}]
		);

		demo.route.start.controller(
			'contactController',
			['$scope', function ($scope) {
				msos.console.debug(temp_sd + ' - contactController -> called!');
				$scope.message = 'Contact us! JK. This is just a demo.';
			}]
		);

		angular.bootstrap('#body', ['demo.route.start']);

		msos.console.debug(temp_sd + 'done!');
	}
);
