
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.bootstrap.controllers.pager");
msos.require("ng.bootstrap.ui.pager");

demo.bootstrap.controllers.pager.version = new msos.set_version(16, 4, 5);


angular.module(
    'demo.bootstrap.controllers.pager', []
).controller(
    'demo.bootstrap.controllers.pager.ctrl',
    [
        '$scope',
        function ($scope) {
            "use strict";

            $scope.totalItems = 64;
            $scope.currentPage = 4;
        }
    ]
);