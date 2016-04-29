
msos.provide("app.bootstrap.controllers.timepicker");
msos.require("ng.bootstrap.ui.timepicker");

app.bootstrap.controllers.timepicker.version = new msos.set_version(16, 4, 9);


angular.module(
    'app.bootstrap.controllers.timepicker', []
).controller(
    'app.bootstrap.controllers.timepicker.ctrl',
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