
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.subheader");
msos.require("ng.material.ui.subheader");
msos.require("ng.material.core.theming");
msos.require("ng.material.ui.list");		// ref. template
msos.require("ng.material.ui.layout");		// ref. template
msos.require("ng.material.ui.content");		// ref. template
msos.require("ng.material.ui.toolbar");		// ref. template
msos.require("ng.material.ui.sticky");		// ref. template

demo.material.controllers.subheader.version = new msos.set_version(18, 4, 16);


angular.module(
    'demo.material.controllers.subheader',
    ['ng', 'ng.material.core.theming']
).controller(
    'demo.material.controllers.subheader.ctrl1',
    ['$scope', function ($scope) {
        "use strict";

        var imagePath = msos.resource_url('demo', 'material/img/60.jpeg');

        $scope.messages = [{
                face: imagePath,
                what: 'Brunch this weekend?',
                who: 'Min Li Chan',
                when: '3:08PM',
                notes: " I'll be in your neighborhood doing errands"
            },
            {
                face: imagePath,
                what: 'Brunch this weekend?',
                who: 'Min Li Chan',
                when: '3:08PM',
                notes: " I'll be in your neighborhood doing errands"
            },
            {
                face: imagePath,
                what: 'Brunch this weekend?',
                who: 'Min Li Chan',
                when: '3:08PM',
                notes: " I'll be in your neighborhood doing errands"
            },
            {
                face: imagePath,
                what: 'Brunch this weekend?',
                who: 'Min Li Chan',
                when: '3:08PM',
                notes: " I'll be in your neighborhood doing errands"
            },
            {
                face: imagePath,
                what: 'Brunch this weekend?',
                who: 'Min Li Chan',
                when: '3:08PM',
                notes: " I'll be in your neighborhood doing errands"
            },
            {
                face: imagePath,
                what: 'Brunch this weekend?',
                who: 'Min Li Chan',
                when: '3:08PM',
                notes: " I'll be in your neighborhood doing errands"
            },
            {
                face: imagePath,
                what: 'Brunch this weekend?',
                who: 'Min Li Chan',
                when: '3:08PM',
                notes: " I'll be in your neighborhood doing errands"
            },
            {
                face: imagePath,
                what: 'Brunch this weekend?',
                who: 'Min Li Chan',
                when: '3:08PM',
                notes: " I'll be in your neighborhood doing errands"
            },
            {
                face: imagePath,
                what: 'Brunch this weekend?',
                who: 'Min Li Chan',
                when: '3:08PM',
                notes: " I'll be in your neighborhood doing errands"
            },
            {
                face: imagePath,
                what: 'Brunch this weekend?',
                who: 'Min Li Chan',
                when: '3:08PM',
                notes: " I'll be in your neighborhood doing errands"
            },
            {
                face: imagePath,
                what: 'Brunch this weekend?',
                who: 'Min Li Chan',
                when: '3:08PM',
                notes: " I'll be in your neighborhood doing errands"
            }
        ];
    }]
).config(
    ['$mdThemingProvider', function ($mdThemingProvider) {
        "use strict";

        $mdThemingProvider.theme('altTheme').primaryPalette('purple');
    }]
);