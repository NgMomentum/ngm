
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.bootstrap.controllers.rating");
msos.require("ng.bootstrap.ui.rating");

demo.bootstrap.controllers.rating.version = new msos.set_version(16, 8, 31);

angular.module(
    'demo.bootstrap.controllers.rating', []
).controller(
    'demo.bootstrap.controllers.rating.ctrl',
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
