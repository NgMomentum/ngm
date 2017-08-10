
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.bottomsheet");
msos.require("ng.material.v111.core");
msos.require("ng.material.v111.ui.bottomsheet");
msos.require("ng.material.v111.ui.toast");
msos.require("ng.material.v111.ui.icon");
msos.require("ng.material.v111.ui.button");
msos.require("ng.material.v111.ui.layout");
msos.require("ng.material.v111.ui.subheader");
msos.require("ng.material.v111.ui.list");

demo.material.controllers.bottomsheet.version = new msos.set_version(17, 1, 3);


angular.module(
    'demo.material.controllers.bottomsheet',
    [
        'ng',
        'ng.material.v111.core',
        'ng.material.v111.ui.icon',
        'ng.material.v111.ui.toast',
        'ng.material.v111.ui.bottomsheet'
    ]
).controller(
    'demo.material.controllers.bottomsheet.crtl',
    ['$scope', '$mdBottomSheet', '$mdToast', function ($scope, $mdBottomSheet, $mdToast) {
        "use strict";

        $scope.alert = '';

        $scope.showListBottomSheet = function () {
            $scope.alert = '';
            $mdBottomSheet.show({
                templateUrl: 'ngm/demo/material/tmpl/bottomsheet/list.html',
                controller: 'ListBottomSheetCtrl'
            }).then(function(clickedItem) {
                $scope.alert = clickedItem.name + ' clicked!';
            });
        };

        $scope.showGridBottomSheet = function () {
            $scope.alert = '';
            $mdBottomSheet.show({
                templateUrl: 'ngm/demo/material/tmpl/bottomsheet/grid.html',
                controller: 'GridBottomSheetCtrl',
                clickOutsideToClose: false
            }).then(function(clickedItem) {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent(clickedItem.name + ' clicked!')
                    .position('top right')
                    .hideDelay(1500)
                );
            });
        };
    }]
).controller(
    'ListBottomSheetCtrl',
    ['$scope', '$mdBottomSheet', function ($scope, $mdBottomSheet) {
        "use strict";

        $scope.items = [{
                name: 'Share',
                icon: 'share-arrow'
            },
            {
                name: 'Upload',
                icon: 'upload'
            },
            {
                name: 'Copy',
                icon: 'copy'
            },
            {
                name: 'Print this page',
                icon: 'print'
            }
        ];

        $scope.listItemClick = function ($index) {
            var clickedItem = $scope.items[$index];
            $mdBottomSheet.hide(clickedItem);
        };
    }]
).controller(
    'GridBottomSheetCtrl',
    ['$scope', '$mdBottomSheet', function ($scope, $mdBottomSheet) {
        "use strict";

        $scope.items = [{
                name: 'Hangout',
                icon: 'hangout'
            },
            {
                name: 'Mail',
                icon: 'mail'
            },
            {
                name: 'Message',
                icon: 'message'
            },
            {
                name: 'Copy',
                icon: 'copy2'
            },
            {
                name: 'Facebook',
                icon: 'facebook'
            },
            {
                name: 'Twitter',
                icon: 'twitter'
            }
        ];

        $scope.listItemClick = function ($index) {
            var clickedItem = $scope.items[$index];

            $mdBottomSheet.hide(clickedItem);
        };
    }]
).config(
    ['$mdIconProvider', function ($mdIconProvider) {
        "use strict";

        var icon_path = 'ngm/demo/material/img/icons/';

        $mdIconProvider
            .icon('share-arrow',    icon_path + 'share-arrow.svg', 24)
            .icon('upload',         icon_path + 'upload.svg', 24)
            .icon('copy',           icon_path + 'copy.svg', 24)
            .icon('print',          icon_path + 'print.svg', 24)
            .icon('hangout',        icon_path + 'hangout.svg', 24)
            .icon('mail',           icon_path + 'mail.svg', 24)
            .icon('message',        icon_path + 'message.svg', 24)
            .icon('copy2',          icon_path + 'copy2.svg', 24)
            .icon('facebook',       icon_path + 'facebook.svg', 24)
            .icon('twitter',        icon_path + 'twitter.svg', 24);
    }]
).run(
    ['$templateRequest', function ($templateRequest) {
        "use strict";

        var icon_path = 'ngm/demo/material/img/icons/',
            urls = [
                icon_path + 'share-arrow.svg',
                icon_path + 'upload.svg',
                icon_path + 'copy.svg',
                icon_path + 'print.svg',
                icon_path + 'hangout.svg',
                icon_path + 'mail.svg',
                icon_path + 'message.svg',
                icon_path + 'copy2.svg',
                icon_path + 'facebook.svg',
                icon_path + 'twitter.svg'
            ];

        angular.forEach(
            urls,
            function (url) {
                $templateRequest(url);
            }
        );
    }]
);
