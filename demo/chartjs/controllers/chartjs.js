
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.chartjs.controllers.chartjs");

demo.chartjs.controllers.chartjs.version = new msos.set_version(16, 5, 4);


angular.module(
    'demo.chartjs.controllers.chartjs', []
).controller(
    'demo.chartjs.controllers.chartjs.ctrl',
    [
        '$scope',
        function ($scope) {
            "use strict";

        }
    ]
);