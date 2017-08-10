/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/
msos.provide("demo.chartjs.controllers.gauge");
msos.require("ng.google.chart");


(function() {
    'use strict';
    angular.module(
        'demo.chartjs.controllers.gauge',
        []
    ).controller(
        "demo.chartjs.controllers.gauge.ctrl",
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