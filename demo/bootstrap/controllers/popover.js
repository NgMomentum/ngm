
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.bootstrap.controllers.popover");
msos.require("ng.bootstrap.ui.popover");

demo.bootstrap.controllers.popover.version = new msos.set_version(16, 8, 30);


angular.module(
    'demo.bootstrap.controllers.popover', []
).controller(
    'demo.bootstrap.controllers.popover.ctrl',
    [
        '$scope', '$sce',
        function ($scope, $sce) {
            "use strict";

            $scope.dynamicPopover = {
                content: 'Hello, World!',
                templateUrl: 'myPopoverTemplate.html',
                title: 'Title'
            };

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
  
            $scope.htmlPopover = $sce.trustAsHtml('<b style="color: red">I can</b> have <div class="label label-success">HTML</div> content');
        }
    ]
);
