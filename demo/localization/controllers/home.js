
/**
 * @ngdoc function
 * @name translateApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the translateApp
 */

msos.provide("demo.localization.controllers.home");


angular.module(
	'demo.localization.controllers.home',
	['ng']
).controller(
	'MainCtrl',
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
