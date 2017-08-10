
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.button");
msos.require("ng.material.v111.core");
msos.require("ng.material.v111.ui.button");
msos.require("ng.material.v111.ui.layout");
msos.require("ng.material.v111.ui.icon");
msos.require("ng.material.v111.ui.content");

demo.material.controllers.button.version = new msos.set_version(16, 12, 28);


angular.module(
	'demo.material.controllers.button',
	[
		'ng',
		'ng.material.v111.core'
	]
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
