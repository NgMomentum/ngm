
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.colors");
msos.require("ng.material.core.theming");
msos.require("ng.material.ui.colors");
msos.require("ng.material.ui.icon");
msos.require("ng.material.ui.layout");
msos.require("ng.material.ui.card");
msos.require("ng.material.ui.button");

demo.material.controllers.colors.version = new msos.set_version(18, 7, 11);


angular.module(
    'demo.material.controllers.colors',
    [
        'ng',
		'ng.material.core',
        'ng.material.core.theming',
        'ng.material.ui.icon'
    ]
).config(
    ['$mdThemingProvider', '$mdIconProvider', function ($mdThemingProvider, $mdIconProvider) {
        "use strict";

        $mdThemingProvider.theme('forest')
            .primaryPalette('brown')
            .accentPalette('green');

        $mdIconProvider
            .defaultIconSet(
				msos.resource_url('demo', 'material/img/icons/sets/social-icons.svg'),
				24
			);
    }]
).directive(
    'regularCard',
    function () {
        "use strict";

        return {
            restrict: 'E',
            templateUrl: 'ngm/demo/material/tmpl/colors/regular.html',
            scope: {
                name: '@'
            }
        };
    }
).directive(
    'userCard',
    function () {
        "use strict";

        return {
            restrict: 'E',
            templateUrl: 'ngm/demo/material/tmpl/colors/user.html',
            scope: {
                name: '@',
                theme: '@'
            },
            controller: ['$scope', function useCardDirCtrlFn($scope) {
                $scope.theme = $scope.theme || 'default';
            }]
        };
    }
).controller(
	'demo.material.controllers.colors.ctrl',
	['$scope', '$mdColorPalette', function ($scope, $mdColorPalette) {
		"use strict";

        $scope.colors = Object.keys($mdColorPalette);

        $scope.mdURL = 'https://material.google.com/style/color.html#color-color-palette';
        $scope.primary = 'purple';
        $scope.accent = 'green';

        $scope.isPrimary = true;

        $scope.selectTheme = function(color) {
            if ($scope.isPrimary) {
                $scope.primary = color;

                $scope.isPrimary = false;
            } else {
                $scope.accent = color;

                $scope.isPrimary = true;
            }
        };
    }]
).directive(
	'themePreview',
	function () {
		"use strict";

        return {
            restrict: 'E',
            templateUrl: 'ngm/demo/material/tmpl/colors/theme_preview.html',
            scope: {
                primary: '=',
                accent: '='
            },
            controller: ['$scope', '$mdColors', '$mdColorUtil', function colors_theme_preview_ctrl($scope, $mdColors, $mdColorUtil) {
                $scope.getColor = function (color) {
                    return $mdColorUtil.rgbaToHex($mdColors.getThemeColor(color));
                };
            }]
        };
    }
).directive(
	'mdJustified',
	function () {
        return {
            restrict: 'A',
            compile: function (element, attrs) {
                var layoutDirection = 'layout-' + (attrs.mdJustified || "row");

                element.removeAttr('md-justified');
                element.addClass(layoutDirection);
                element.addClass("layout-align-space-between-stretch");

                return angular.noop;
            }
        };
    }
);
