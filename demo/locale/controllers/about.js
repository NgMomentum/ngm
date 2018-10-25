
/**
 * @ngdoc function
 * @name translateApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the translateApp
 */

msos.provide("demo.locale.controllers.about");


angular.module(
	'demo.locale.controllers.about',
	['ng']
).controller(
	'AboutCtrl',
	['$scope', function ($scope) {
		"use strict";
		// Yeoman part (for tests)
		$scope.awesomeThings = [
			'HTML5 Boilerplate',
			'AngularJS',
			'Karma'
		];
	}]
);
