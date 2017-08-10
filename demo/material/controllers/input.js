
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.input");
msos.require("ng.material.v111.ui.input");
msos.require("ng.material.v111.core.theming");
msos.require("ng.material.v111.ui.layout");
msos.require("ng.material.v111.ui.content");

demo.material.controllers.input.version = new msos.set_version(17, 1, 12);


angular.module(
    'demo.material.controllers.input',
    [
        'ng',
        'ng.material.v111.core.theming'
    ]
).controller(
    'demo.material.controllers.input.ctrl',
    ['$scope', function ($scope) {
        "use strict";

        $scope.user = {
            title: 'Developer',
            email: 'ipsum@lorem.com',
            firstName: '',
            lastName: '',
            company: 'Google',
            address: '1600 Amphitheatre Pkwy',
            city: 'Mountain View',
            state: 'CA',
            biography: 'Loves kittens, snowboarding, and can type at 130 WPM.\n\nAnd rumor has it she bouldered up Castle Craig!',
            postalCode: '94043'
        };

        $scope.states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS ' +
            'MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI ' +
            'WY').split(' ').map(function (state) {
            return {
                abbrev: state
            };
        });
    }]
).config(
    ['$mdThemingProvider', function ($mdThemingProvider) {
        "use strict";

        $mdThemingProvider.theme('docs-dark', 'default')
            .primaryPalette('yellow')
            .dark();
    }]
);