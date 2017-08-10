
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.colors");
msos.require("ng.material.v111.ui.colors");
msos.require("ng.material.v111.core.theming");
msos.require("ng.material.v111.ui.icon");
msos.require("ng.material.v111.ui.layout");
msos.require("ng.material.v111.ui.card");

demo.material.controllers.colors.version = new msos.set_version(17, 1, 7);


angular.module(
    'demo.material.controllers.colors',
    [
        'ng',
        'ng.material.core.theming',
        'ng.material.v111.ui.icon'
    ]
).config(
    ['$mdThemingProvider', '$mdIconProvider', function ($mdThemingProvider, $mdIconProvider) {
        "use strict";

        $mdThemingProvider.theme('forest')
            .primaryPalette('brown')
            .accentPalette('green');

        $mdIconProvider
            .defaultIconSet('ngm/demo/material/img/icons/sets/social-icons.svg', 24);
    }]
).directive(
    'exRegularCard',
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
    'exUserCard',
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
);
