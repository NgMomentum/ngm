
msos.provide("app.bootstrap.controllers.pagination");
msos.require("ng.bootstrap.ui.pagination");

app.bootstrap.controllers.pagination.version = new msos.set_version(16, 4, 5);


angular.module(
    'app.bootstrap.controllers.pagination', []
).controller(
    'app.bootstrap.controllers.pagination.ctrl',
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