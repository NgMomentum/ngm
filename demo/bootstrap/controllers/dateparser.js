
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.bootstrap.controllers.dateparser");
msos.require("ng.bootstrap.ui.datepicker");
msos.require("ng.bootstrap.ui.datepickerpopup");

demo.bootstrap.controllers.dateparser.version = new msos.set_version(17, 9, 10);


angular.module(
    'demo.bootstrap.controllers.dateparser', ['ng.bootstrap.ui.datepicker']
).controller(
    'demo.bootstrap.controllers.dateparser.ctrl',
    [
		'$scope',
		function ($scope) {
			"use strict";

			$scope.format = 'yyyy/MM/dd';
			$scope.date = new Date();
		}
	]
);

