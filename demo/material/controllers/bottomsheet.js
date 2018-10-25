
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.bottomsheet");
msos.require("ng.material.ui.bottomsheet");
msos.require("ng.material.core.autofocus");	// ref template
msos.require("ng.material.ui.toast");
msos.require("ng.material.ui.icon");
msos.require("ng.material.ui.button");		// ref template
msos.require("ng.material.ui.layout");		// ref template
msos.require("ng.material.ui.subheader");	// ref template
msos.require("ng.material.ui.list");		// ref template

demo.material.controllers.bottomsheet.version = new msos.set_version(18, 7, 29);


angular.module(
    'demo.material.controllers.bottomsheet',
    [
        'ng',
        'ng.material.core',
        'ng.material.ui.icon',
        'ng.material.ui.toast',
        'ng.material.ui.bottomsheet'
    ]
).config(
    ['$mdIconProvider', function ($mdIconProvider) {
        "use strict";

        var icon_path = msos.resource_url('demo', 'material/img/icons/');

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
).controller(
    'demo.material.controllers.bottomsheet.crtl',
    ['$scope', '$mdBottomSheet', '$mdToast', function ($scope, $mdBottomSheet, $mdToast) {
        "use strict";

        $scope.alert = '';

        $scope.showListBottomSheet = function () {

            $scope.alert = '';
            $mdBottomSheet.show(
				{
					templateUrl: 'ngm/demo/material/tmpl/bottomsheet/list.html',
					controller: 'ListBottomSheetCtrl'
				}
			).then(
				function (clickedItem) {
					if (clickedItem && _.isObject(clickedItem)) {
						$scope.alert = clickedItem.name + ' clicked!';
					}
				}
			).catch(
				function (error) {
					// User clicked outside or hit escape
					msos.console.info('demo.material.controllers.bottomsheet - $scope.showListBottomSheet -> error:', error);
				}
			);
        };

        $scope.showGridBottomSheet = function () {

            $scope.alert = '';
            $mdBottomSheet.show(
				{
					templateUrl: 'ngm/demo/material/tmpl/bottomsheet/grid.html',
					controller: 'GridBottomSheetCtrl',
					clickOutsideToClose: false
				}
			).then(
				function (clickedItem) {
					if (clickedItem && _.isObject(clickedItem)) {
						 $mdToast.show(
							 $mdToast.simple()
								.textContent(clickedItem.name + ' clicked!')
								.position('top right')
								.hideDelay(1500)
						);
					}
				}
			).catch(
				function (error) {
					// User clicked outside or hit escape
					msos.console.info('demo.material.controllers.bottomsheet - $scope.showGridBottomSheet -> error:', error);
				}
			);
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

        $scope.gridItemClick = function ($index) {
            var clickedItem = $scope.items[$index];

            $mdBottomSheet.hide(clickedItem);
        };
    }]
);
