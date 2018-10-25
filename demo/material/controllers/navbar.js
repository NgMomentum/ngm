
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.navbar");
msos.require("ng.material.ui.navbar");
msos.require("ng.material.ui.content");		// ref. templates
msos.require("ng.material.ui.checkbox");	// ref. templates


demo.material.controllers.navbar.version = new msos.set_version(18, 7, 23);


function AppCtrl($scope) {
	"use strict";

	$scope.currentNavItem = 'page1';

    $scope.goto = function (page) {
		$scope.status = "Goto " + page;
    };
}


angular.module(
	'demo.material.controllers.navbar',
	['ng']
).controller(
	'demo.material.controllers.navbar.ctrl',
	['$scope', AppCtrl]
);
