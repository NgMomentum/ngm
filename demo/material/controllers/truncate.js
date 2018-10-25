
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.truncate");
msos.require("ng.material.ui.truncate");	// ref. template
msos.require("ng.material.ui.toolbar");		// ref. template
msos.require("ng.material.ui.icon");		// ref. template
msos.require("ng.material.ui.layout");		// ref. template
msos.require("ng.material.ui.button");		// ref. template

demo.material.controllers.truncate.version = new msos.set_version(18, 5, 19);


angular.module(
	'demo.material.controllers.truncate',
	['ng']
).controller(
	'demo.material.controllers.truncate.ctrl',
	['$scope', function ($scope) {
		"use strict";

		msos.console.info('demo.material.controllers.truncate.ctrl -> fired, $scope:', $scope);
	}]
);
