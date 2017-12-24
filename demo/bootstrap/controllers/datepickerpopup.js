
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.bootstrap.controllers.datepickerpopup");
msos.require("ng.bootstrap.ui.datepickerpopup");
msos.require("ng.bootstrap.ui.tooltip");

demo.bootstrap.controllers.datepickerpopup.version = new msos.set_version(17, 9, 25);


angular.module(
    'demo.bootstrap.controllers.datepickerpopup', []
).controller(
    'demo.bootstrap.controllers.datepickerpopup.ctrl', [
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

            // Disable weekend selection
            function disabled(data) {
                var date = data.date,
                    mode = data.mode;

                return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
            }

            $scope.today = function () {
                $scope.dt = new Date();
            };

            $scope.today();

            $scope.clear = function() {
                $scope.dt = null;
            };

            $scope.inlineOptions = {
                customClass: getDayClass,
                minDate: new Date(),
                showWeeks: true
            };

            $scope.dateOptions = {
                dateDisabled: disabled,
                formatYear: 'yy',
                maxDate: new Date(2020, 5, 22),
                minDate: new Date(),
                startingDay: 1
            };

            $scope.toggleMin = function() {
                $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
                $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
            };

            $scope.toggleMin();

            $scope.open1 = function() {
                $scope.popup1.opened = true;
            };

            $scope.open2 = function() {
                $scope.popup2.opened = true;
            };

            $scope.setDate = function(year, month, day) {
                $scope.dt = new Date(year, month, day);
            };

            $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
            $scope.format = $scope.formats[0];
            $scope.altInputFormats = ['M!/d!/yyyy'];

            $scope.popup1 = {
                opened: false
            };

            $scope.popup2 = {
                opened: false
            };

            var tomorrow = new Date(),
                afterTomorrow;

            tomorrow.setDate(tomorrow.getDate() + 1);

            afterTomorrow = new Date();

            afterTomorrow.setDate(tomorrow.getDate() + 1);

            $scope.events = [{
                date: tomorrow,
                status: 'full'
            }, {
                date: afterTomorrow,
                status: 'partially'
            }];
        }
    ]);
