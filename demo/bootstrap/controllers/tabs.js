
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.bootstrap.controllers.tabs");
msos.require("ng.bootstrap.ui.tabs");

demo.bootstrap.controllers.tabs.version = new msos.set_version(16, 4, 2);


angular.module(
    'demo.bootstrap.controllers.tabs', []
).controller(
    'demo.bootstrap.controllers.tabs.ctrl',
    [
        '$scope',
        function ($scope) {
            "use strict";

            $scope.tabs = [{
                title: 'Dynamic Title 1',
                content: 'Dynamic content 1'
            }, {
                title: 'Dynamic Title 2',
                content: 'Dynamic content 2',
                disabled: true
            }];

            $scope.alertMe = function () {
                setTimeout(function () {
                    alert('You\'ve selected the alert tab!');
                });
            };

            $scope.model = {
                name: 'Tabs'
            };
        }
    ]
);