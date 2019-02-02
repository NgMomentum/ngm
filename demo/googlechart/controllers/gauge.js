
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.googlechart.controllers.gauge");
msos.require("ng.google.chart");

demo.googlechart.controllers.gauge.version = new msos.set_version(19, 1, 17);


(function() {
    'use strict';
    angular.module(
        'demo.googlechart.controllers.gauge',
        ['ng', 'ng.google.chart']
    ).controller(
        "demo.googlechart.controllers.gauge.ctrl",
        [
            '$scope',
            function ($scope) {

                $scope.chartObject = {};
                $scope.chartObject.type = "Gauge";
        
                $scope.chartObject.options = {
                    width: 400,
                    height: 120,
                    redFrom: 90,
                    redTo: 100,
                    yellowFrom: 75,
                    yellowTo: 90,
                    minorTicks: 5
                };
        
                $scope.chartObject.data = [
                    ['Label', 'Value'],
                    ['Memory', 80],
                    ['CPU', 55],
                    ['Network', 68]
                ];
            }
        ]
    );
}());
