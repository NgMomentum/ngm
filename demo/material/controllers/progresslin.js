
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.progresslin");
msos.require("ng.material.ui.progresslin");
msos.require("ng.material.ui.switch");		// ref. template
msos.require("ng.material.ui.layout");		// ref. template

demo.material.controllers.progresslin.version = new msos.set_version(18, 6, 24);

angular.module(
    'demo.material.controllers.progresslin',
    ['ng']
).controller(
    'demo.material.controllers.progresslin.ctrl',
	['$scope', '$interval', function ($scope, $interval) {
		"use strict";

		var self = this,
            j = 0,
            counter = 0;

			self.mode = 'query';
			self.activated = true;
			self.determinateValue = 30;
			self.determinateValue2 = 30;

			self.showList = [];

			self.toggleActivation = function () {
				if (!self.activated) self.showList = [];
				if (self.activated) {
					j = counter = 0;
					self.determinateValue = 30;
					self.determinateValue2 = 30;
				}
			};

			$interval(
				function () {
					self.determinateValue += 1;
					self.determinateValue2 += 1.5;

					if (self.determinateValue > 100)	{ self.determinateValue = 30; }
					if (self.determinateValue2 > 100)	{ self.determinateValue2 = 30; }

					// Incrementally start animation the five (5) Indeterminate,
					// themed progress circular bars

					if ((j < 2) && !self.showList[j] && self.activated) {
						self.showList[j] = true;
					}

					if (counter++ % 4 === 0) { j += 1; }

					// Show the indicator in the "Used within Containers" after 200ms delay
					if (j === 2) { self.contained = "indeterminate"; }

				},
				100,
				0,
				$scope
			);

			$interval(
				function () {
					self.mode = (self.mode == 'query' ? 'determinate' : 'query');
				},
				7200,
				0,
				$scope
			);
    }]
);