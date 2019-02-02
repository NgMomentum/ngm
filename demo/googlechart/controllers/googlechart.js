
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.googlechart.controllers.googlechart");

demo.googlechart.controllers.googlechart.version = new msos.set_version(19, 1, 19);


angular.module(
    'demo.googlechart.controllers.googlechart',
	['ng']
).controller(
    'demo.googlechart.controllers.googlechart.ctrl',
    [
        '$scope',
        function ($scope) {
            "use strict";

			msos.console.info('demo.googlechart.controllers.googlechart.ctrl -> called, for $scope: ' + $scope.$$name);
        }
    ]
);