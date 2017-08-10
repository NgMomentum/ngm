
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.bootstrap.controllers.timepicker");
msos.require("ng.bootstrap.ui.timepicker");

demo.bootstrap.controllers.timepicker.version = new msos.set_version(16, 4, 9);


angular.module(
    'demo.bootstrap.controllers.timepicker', []
).controller(
    'demo.bootstrap.controllers.timepicker.ctrl',
    [
        '$scope', '$log', function ($scope, $log) {
            "use strict";

            $scope.mytime = new Date();

            $scope.hstep = 1;
            $scope.mstep = 15;

            $scope.options = {
                hstep: [1, 2, 3],
                mstep: [1, 5, 10, 15, 25, 30]
            };

            $scope.ismeridian = true;
            $scope.toggleMode = function () {
                $scope.ismeridian = ! $scope.ismeridian;
            };

            $scope.update = function () {
                var d = new Date();

                d.setHours(14);
                d.setMinutes(0);
                $scope.mytime = d;
            };

            $scope.changed = function () {
                $log.debug('Time changed to: ' + $scope.mytime);
            };

            $scope.clear = function () {
                $scope.mytime = null;
            };
        }
    ]
);