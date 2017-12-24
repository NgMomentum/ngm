
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.bootstrap.controllers.collapse");

demo.bootstrap.controllers.collapse.version = new msos.set_version(17, 12, 14);


angular.module(
    'demo.bootstrap.controllers.collapse',
	['ng', 'ngAnimate', 'ng.bootstrap.ui.collapse']
).controller(
    'demo.bootstrap.controllers.collapse.ctrl',
    [
        '$scope',
        function ($scope) {
            "use strict";

			$scope.isNavCollapsed = true;
			$scope.isCollapsed = false;
			$scope.isCollapsedHorizontal = false;
        }
    ]
);