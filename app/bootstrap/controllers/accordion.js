
msos.provide("app.bootstrap.controllers.accordion");
msos.require("ng.bootstrap.ui.accordion");

app.bootstrap.controllers.accordion.version = new msos.set_version(16, 3, 29);


angular.module(
    'app.bootstrap.controllers.accordion', []
).controller(
    'app.bootstrap.controllers.accordion.ctrl',
    [
        '$scope',
        function ($scope) {
            "use strict";

            $scope.oneAtATime = true;

            $scope.groups = [{
                title: 'Dynamic Group Header - 1',
                content: 'Dynamic Group Body - 1'
            }, {
                title: 'Dynamic Group Header - 2',
                content: 'Dynamic Group Body - 2'
            }];

            $scope.items = ['Item 1', 'Item 2', 'Item 3'];

            $scope.addItem = function () {
                var newItemNo = $scope.items.length + 1;
                $scope.items.push('Item ' + newItemNo);
            };

            $scope.status = {
                isFirstOpen: true,
                isFirstDisabled: false
            };
        }
    ]
);