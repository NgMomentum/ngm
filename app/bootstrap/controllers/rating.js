
msos.provide("app.bootstrap.controllers.rating");
msos.require("ng.bootstrap.ui.rating");

app.bootstrap.controllers.rating.version = new msos.set_version(16, 4, 4);

angular.module(
    'app.bootstrap.controllers.rating', []
).controller(
    'app.bootstrap.controllers.rating.ctrl',
    [
        '$scope',
        function ($scope) {
            "use strict";

            $scope.rate = 7;
            $scope.max = 10;
            $scope.isReadonly = false;

            $scope.hoveringOver = function (value) {
                $scope.overStar = value;
                $scope.percent = 100 * (value / $scope.max);
            };

            $scope.ratingStates = [{
                stateOn: 'fa-check-circle',
                stateOff: 'fa-check-circle-o'
            }, {
                stateOn: 'fa-star',
                stateOff: 'fa-star-o'
            }, {
                stateOn: 'fa-heart',
                stateOff: 'fa-ban'
            }, {
                stateOn: 'fa-heart'
            }, {
                stateOff: 'fa-power-off'
            }];
        }
    ]
);