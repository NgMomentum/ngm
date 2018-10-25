
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.whiteframe");
msos.require("ng.material.ui.layout");			// ref. template
msos.require("ng.material.ui.whiteframe");		// ref. template

demo.material.controllers.whiteframe.version = new msos.set_version(18, 8, 13);


angular.module(
	'demo.material.controllers.whiteframe',
	['ng']
).controller(
	'demo.material.controllers.whiteframe.ctrl',
	['$scope', '$interval', function ($scope, $interval) {
		"use strict";

		var promise;

		this.elevation = 1;
		this.showFrame = 3;

		this.nextElevation = function () {
			if (++this.elevation === 25) { this.elevation = 1; }
		};

		promise = $interval(
			this.nextElevation.bind(this),
			1000,
			0,
			$scope
		);

		this.toggleFrame = function () {
			this.showFrame = this.showFrame == 3 ? -1 : 3;
		};
	}]
);
