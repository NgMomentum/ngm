
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.button");
msos.require("ng.material.ui.button");
msos.require("ng.material.ui.layout");		// ref template
msos.require("ng.material.ui.icon");		// ref template
msos.require("ng.material.ui.content");		// ref template

demo.material.controllers.button.version = new msos.set_version(18, 4, 13);


angular.module(
	'demo.material.controllers.button',
	['ng']
).controller(
	'demo.material.controllers.button.ctrl',
	['$scope', function ($scope) {
		"use strict";

		$scope.title1 = 'Button';
		$scope.title4 = 'Warn';
		$scope.isDisabled = true;

		$scope.googleUrl = 'http://google.com';
	}]
);
