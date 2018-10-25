
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.fabtoolbar");
msos.require("ng.material.ui.fabactions");
msos.require("ng.material.ui.icon");		// ref template
msos.require("ng.material.ui.content");		// ref template
msos.require("ng.material.ui.toolbar");		// ref template
msos.require("ng.material.ui.button");		// ref template
msos.require("ng.material.ui.layout");		// ref template
msos.require("ng.material.ui.radio");		// ref template

demo.material.controllers.fabtoolbar.version = new msos.set_version(18, 7, 11);


angular.module(
	'demo.material.controllers.fabtoolbar',
	['ng']
).controller(
	'demo.material.controllers.fabtoolbar.ctrl',
	['$scope', function($scope) {
		"use strict";

		$scope.isOpen = false;

		$scope.demo = {
			isOpen: false,
			selectedDirection: 'left'
		};
    }]
);
