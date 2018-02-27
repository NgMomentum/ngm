
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.bootstrap.controllers.accordion");
msos.require("ng.bootstrap.ui.accordion");

demo.bootstrap.controllers.accordion.version = new msos.set_version(17, 1, 20);


angular.module(
    'demo.bootstrap.controllers.accordion',
    ['ng']
).controller(
    'demo.bootstrap.controllers.accordion.ctrl',
    ['$scope', function ($scope) {
        "use strict";

        var temp_cc = 'demo.bootstrap.controllers.accordion.ctrl';

        msos.console.debug(temp_cc + ' -> called.');

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
            msos.console.debug(temp_cc + ' - $scope.addItem -> called.');
            var newItemNo = $scope.items.length + 1;
            $scope.items.push('Item ' + newItemNo);
        };

        $scope.status = {
            isCustomHeaderOpen: false,
            isFirstOpen: true,
            isFirstDisabled: false
        };
    }]
);
