
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.bootstrap.controllers.progressbar");
msos.require("ng.bootstrap.ui.progressbar");

demo.bootstrap.controllers.progressbar.version = new msos.set_version(16, 8, 30);


angular.module(
    'demo.bootstrap.controllers.progressbar', []
).controller(
    'demo.bootstrap.controllers.progressbar.ctrl',
    [
        '$scope',function ($scope) {
            "use strict";

            $scope.max = 200;

            $scope.random = function () {
                var value = Math.floor((Math.random() * 100) + 1),
                    type;

                if (value < 25) {
                    type = 'success';
                } else if (value < 50) {
                    type = 'info';
                } else if (value < 75) {
                    type = 'warning';
                } else {
                    type = 'danger';
                }

                $scope.showWarning = (type === 'danger' || type === 'warning');

                $scope.dynamic = value;
                $scope.type = type;

                msos.console.debug('demo.bootstrap.controllers.progressbar.ctrl - random -> output:', value, type);
            };

            $scope.randomStacked = function () {

                $scope.stacked = [];

                var types = ['success', 'info', 'warning', 'danger'],
                    last_one,
                    new_stack = [],
                    i = 0,
                    n = 0,
                    index;

                for (i = 0, n = Math.floor((Math.random() * 4) + 1); i < n; i += 1) {
                    index = Math.floor((Math.random() * 4));
                    index = index !== last_one ? index : Math.floor((Math.random() * 4));
                    new_stack.push({
                        value: Math.floor((Math.random() * 30) + 1),
                        type: types[index]
                    });

                    last_one = index;
                }

                $scope.stacked = new_stack.slice(0);

                msos.console.debug('demo.bootstrap.controllers.progressbar.ctrl - randomStacked -> output:', $scope.stacked);
            };

            $scope.random();
            $scope.randomStacked();
        }
    ]
);
