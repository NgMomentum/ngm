
/**
 * @ngdoc function
 * @name translateApp.controller:ContactsCtrl
 * @description
 * # ContactsCtrl
 * Controller of the translateApp
 */

msos.provide("demo.locale.controllers.contacts");


angular.module(
	'demo.locale.controllers.contacts',
	['ng']
).controller(
	'ContactsCtrl',
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
