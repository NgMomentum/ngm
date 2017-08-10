
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.tooltipmd");
msos.require("ng.material.v111.ui.tooltip");
msos.require("ng.material.v111.ui.icon");
msos.require("ng.material.v111.ui.toolbar");
msos.require("ng.material.v111.ui.layout");
msos.require("ng.material.v111.ui.content");
msos.require("ng.material.v111.ui.button");
msos.require("ng.material.v111.ui.radio");
msos.require("ng.material.v111.ui.checkbox");

demo.material.controllers.tooltipmd.version = new msos.set_version(17, 1, 6);


angular.module(
    'demo.material.controllers.tooltipmd',
    ['ng']
).controller(
    'demo.material.controllers.tooltipmd.ctrl',
    ['$scope', function ($scope) {
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
