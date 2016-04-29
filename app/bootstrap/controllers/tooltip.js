
msos.provide("app.bootstrap.controllers.tooltip");
msos.require("ng.bootstrap.ui.tooltip");

app.bootstrap.controllers.tooltip.version = new msos.set_version(16, 4, 1);


angular.module(
    'app.bootstrap.controllers.tooltip', []
).controller(
    'app.bootstrap.controllers.tooltip.ctrl',
    [
        '$scope', '$sce',
        function ($scope, $sce) {

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