
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.checkbox");
msos.require("ng.material.v111.ui.checkbox");
msos.require("ng.material.v111.ui.layout");

demo.material.controllers.checkbox.version = new msos.set_version(17, 1, 7);


angular.module(
	'demo.material.controllers.checkbox',
	['ng']
).controller(
	'demo.material.controllers.checkbox.ctrl',
	['$scope', function ($scope) {
		"use strict";

		$scope.data = {};
		$scope.data.cb1 = true;
		$scope.data.cb2 = false;
		$scope.data.cb3 = false;
		$scope.data.cb4 = false;
		$scope.data.cb5 = false;
	}]
);
