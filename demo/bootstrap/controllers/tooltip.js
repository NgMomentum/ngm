
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.bootstrap.controllers.tooltip");
msos.require("ng.bootstrap.ui.tooltip");

demo.bootstrap.controllers.tooltip.version = new msos.set_version(16, 4, 1);


angular.module(
    'demo.bootstrap.controllers.tooltip', []
).controller(
    'demo.bootstrap.controllers.tooltip.ctrl',
    [
        '$scope', '$sce',
        function ($scope, $sce) {
            "use strict";

            $scope.dynamicTooltip = 'Hello, World!';
            $scope.dynamicTooltipText = 'dynamic';
            $scope.htmlTooltip = $sce.trustAsHtml('I\'ve been made <b>bold</b>!');
            $scope.placement = {
                options: [
                    'top',
                    'top-left',
                    'top-right',
                    'bottom',
                    'bottom-left',
                    'bottom-right',
                    'left',
                    'left-top',
                    'left-bottom',
                    'right',
                    'right-top',
                    'right-bottom'
                ],
                selected: 'top'
            };
        }
    ]
);