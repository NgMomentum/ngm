
/**
 * @ngdoc function
 * @name translateApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the translateApp
 */

msos.provide("demo.locale.controllers.home");


angular.module(
	'demo.locale.controllers.home',
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
