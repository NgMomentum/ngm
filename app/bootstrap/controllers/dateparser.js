
msos.provide("app.bootstrap.controllers.dateparser");
msos.require("ng.bootstrap.ui.datepickerpopup");

app.bootstrap.controllers.dateparser.version = new msos.set_version(16, 4, 13);


angular.module(
    'app.bootstrap.controllers.dateparser', ['ng.bootstrap.ui.datepickerpopup']
).controller(
    'app.bootstrap.controllers.dateparser.ctrl',
    [
		'$scope',
		function ($scope) {
			"use strict";

			$scope.format = 'yyyy/MM/dd';
			$scope.date = new Date();
		}
	]
);

