
msos.provide("app.bootstrap.controllers.buttons");
msos.require("ng.bootstrap.ui.buttons");

app.bootstrap.controllers.buttons.version = new msos.set_version(16, 3, 29);


angular.module(
    'app.bootstrap.controllers.buttons', []
).controller(
    'app.bootstrap.controllers.buttons.ctrl',
    [
        '$scope',
        function ($scope) {
            "use strict";

            $scope.singleModel = 1;

            $scope.radioModel = 'Middle';

            $scope.checkModel = {
                left: false,
                middle: true,
                right: false
            };

            $scope.checkResults = [];

            $scope.$watchCollection(
                'checkModel',
                function () {
                    $scope.checkResults = [];
                    angular.forEach(
                        $scope.checkModel,
                        function (value, key) {
                            if (value) { $scope.checkResults.push(key); }
                        }
                    );
                }
            );
        }
    ]
);