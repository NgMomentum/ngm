
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.bootstrap.controllers.datepicker");
msos.require("ng.bootstrap.ui.datepicker");
msos.require("ng.bootstrap.ui.tooltip");

demo.bootstrap.controllers.datepicker.version = new msos.set_version(17, 9, 11);


angular.module(
    'demo.bootstrap.controllers.datepicker', []
).controller(
    'demo.bootstrap.controllers.datepicker.ctrl',
    [
        '$scope',
        function ($scope) {
            "use strict";

            function getDayClass(data) {
                var date = data.date,
                    mode = data.mode,
                    dayToCheck,
                    currentDay,
                    i = 0;

                if (mode === 'day') {
                    dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                    for (i = 0; i < $scope.events.length; i += 1) {
                        currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                        if (dayToCheck === currentDay) {
                            return $scope.events[i].status;
                        }
                    }
                }

                return '';
            }

            $scope.today = function () {
                $scope.dt = new Date();
            };

            $scope.today();

            $scope.clear = function () {
                $scope.dt = null;
            };

            $scope.options = {
                customClass: getDayClass,
                minDate: new Date(),
                showWeeks: true
            };

            $scope.toggleMin = function () {
                $scope.options.minDate = $scope.options.minDate ? null : new Date();
            };

            $scope.toggleMin();

            $scope.setDate = function (year, month, day) {
                $scope.dt = new Date(year, month, day);
            };

            var tomorrow = new Date(),
                afterTomorrow;

            tomorrow.setDate(tomorrow.getDate() + 1);

            afterTomorrow = new Date(tomorrow);

            afterTomorrow.setDate(tomorrow.getDate() + 1);

            $scope.events = [{
                date: tomorrow,
                status: 'full'
            }, {
                date: afterTomorrow,
                status: 'partially'
            }];
        }
    ]
);