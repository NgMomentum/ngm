
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.content");
msos.require("ng.material.ui.content");		// ref. template
msos.require("ng.material.ui.layout");		// ref. template
msos.require("ng.material.ui.toolbar");		// ref. template

demo.material.controllers.content.version = new msos.set_version(18, 7, 29);


angular.module(
	'demo.material.controllers.content',
	['ng']
).controller(
	'demo.material.controllers.content.ctrl1',
	['$scope', function ($scope) {
		"use strict";

		msos.console.info('demo.material.controllers.content.ctrl1 -> fired, $scope:', $scope);
	}]
);
