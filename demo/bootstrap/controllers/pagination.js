
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.bootstrap.controllers.pagination");
msos.require("ng.bootstrap.ui.pagination");

demo.bootstrap.controllers.pagination.version = new msos.set_version(16, 8, 30);


angular.module(
    'demo.bootstrap.controllers.pagination', []
).controller(
    'demo.bootstrap.controllers.pagination.ctrl',
    [
        '$scope', '$log',
        function ($scope, $log) {
            "use strict";

            $scope.totalItems = 64;
            $scope.currentPage = 4;

            $scope.setPage = function (pageNo) {
                $scope.currentPage = pageNo;
            };

            $scope.pageChanged = function () {
                $log.log('Page changed to: ' + $scope.currentPage);
            };

            $scope.maxSize = 5;
            $scope.bigTotalItems = 175;
            $scope.bigCurrentPage = 1;
        }
    ]
);