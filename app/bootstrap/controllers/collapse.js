
msos.provide("app.bootstrap.controllers.collapse");

app.bootstrap.controllers.collapse.version = new msos.set_version(16, 4, 1);


angular.module(
    'app.bootstrap.controllers.collapse', ['ng.bootstrap.ui.collapse']
).controller(
    'app.bootstrap.controllers.collapse.ctrl',
    [
        '$scope',
        function ($scope) {
            "use strict";

            $scope.isCollapsed = false;
        }
    ]
);