
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.bootstrap.controllers.buttons");
msos.require("ng.bootstrap.ui.buttons");

demo.bootstrap.controllers.buttons.version = new msos.set_version(16, 3, 29);


angular.module(
    'demo.bootstrap.controllers.buttons', []
).controller(
    'demo.bootstrap.controllers.buttons.ctrl',
    [
        '$scope',
        function ($scope) {
            "use strict";

            var temp_b = 'demo.bootstrap.controllers.buttons.ctrl';

            msos.console.debug(temp_b + ' -> called.');

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