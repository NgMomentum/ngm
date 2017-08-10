
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.bootstrap.controllers.collapse");

demo.bootstrap.controllers.collapse.version = new msos.set_version(16, 8, 30);


angular.module(
    'demo.bootstrap.controllers.collapse', ['ng.bootstrap.ui.collapse']
).controller(
    'demo.bootstrap.controllers.collapse.ctrl',
    [
        '$scope',
        function ($scope) {
            "use strict";

            $scope.isCollapsed = false;
            $scope.isCollapsedHorizontal = false;
        }
    ]
);