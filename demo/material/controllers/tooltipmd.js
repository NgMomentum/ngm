
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.tooltipmd");
msos.require("ng.material.ui.tooltip");		// ref. template
msos.require("ng.material.ui.icon");		// ref. template
msos.require("ng.material.ui.input");		// ref. template
msos.require("ng.material.ui.toolbar");		// ref. template
msos.require("ng.material.ui.layout");		// ref. template
msos.require("ng.material.ui.content");		// ref. template
msos.require("ng.material.ui.button");		// ref. template
msos.require("ng.material.ui.radio");		// ref. template
msos.require("ng.material.ui.checkbox");	// ref. template

demo.material.controllers.tooltipmd.version = new msos.set_version(18, 5, 18);


angular.module(
    'demo.material.controllers.tooltipmd',
    ['ng']
).controller(
    'demo.material.controllers.tooltipmd.ctrl',
    ['$scope', function ($scope) {
		"use strict";

        $scope.demo = {
            showTooltip: false,
            tipDirection: 'bottom'
        };

        $scope.demo.delayTooltip = undefined;

        $scope.$watch('demo.delayTooltip', function(val) {
            $scope.demo.delayTooltip = parseInt(val, 10) || 0;
        });
    }]
);
