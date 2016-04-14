
msos.provide("app.bootstrap.controllers.dropdown");
msos.require("ng.bootstrap.ui.dropdown");

app.bootstrap.controllers.dropdown.version = new msos.set_version(16, 4, 1);


angular.module(
    'app.bootstrap.controllers.dropdown', ['ng.bootstrap.ui.dropdown']
).controller(
    'app.bootstrap.controllers.dropdown.ctrl',
    [
        '$scope', '$log', function ($scope, $log) {
            "use strict";

            $scope.items = ['The first choice!', 'And another choice for you.', 'but wait! A third!'];

            $scope.status = {
                isopen: false
            };

            $scope.toggled = function (open) {
                $log.log('Dropdown is now: ', open);
            };

            $scope.toggleDropdown = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.status.isopen = !$scope.status.isopen;
            };
        }
    ]
);