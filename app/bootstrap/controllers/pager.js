
msos.provide("app.bootstrap.controllers.pager");
msos.require("ng.bootstrap.ui.pager");

app.bootstrap.controllers.pager.version = new msos.set_version(16, 4, 5);


angular.module(
    'app.bootstrap.controllers.pager', []
).controller(
    'app.bootstrap.controllers.pager.ctrl',
    [
        '$scope',
        function ($scope) {
            "use strict";

            $scope.totalItems = 64;
            $scope.currentPage = 4;
        }
    ]
);