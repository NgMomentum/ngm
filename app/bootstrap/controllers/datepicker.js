
msos.provide("app.bootstrap.controllers.datepicker");
msos.require("ng.bootstrap.ui.datepicker");

app.bootstrap.controllers.datepicker.version = new msos.set_version(16, 3, 29);


angular.module(
    'app.bootstrap.controllers.datepicker', []
).controller(
    'app.bootstrap.controllers.datepicker.ctrl',
    [
        '$scope',
        function ($scope) {

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

            // Disable weekend selection
            function disabled(data) {
                var date = data.date,
                    mode = data.mode;
                return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
            }

            $scope.toggleMin = function () {
                $scope.options.minDate = $scope.options.minDate ? null : new Date();
            };

            $scope.toggleMin();

            $scope.setDate = function (year, month, day) {
                $scope.dt = new Date(year, month, day);
            };

            var tomorrow = new Date();

            tomorrow.setDate(tomorrow.getDate() + 1);

            var afterTomorrow = new Date(tomorrow)

            afterTomorrow.setDate(tomorrow.getDate() + 1);

            $scope.events = [{
                date: tomorrow,
                status: 'full'
            }, {
                date: afterTomorrow,
                status: 'partially'
            }];

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
        }
    ]
);