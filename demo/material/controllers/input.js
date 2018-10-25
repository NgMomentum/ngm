
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.input");
msos.require("ng.material.ui.input");
msos.require("ng.material.core.theming");
msos.require("ng.material.ui.layout");			// ref. template
msos.require("ng.material.ui.content");			// ref. template
msos.require("ng.material.ui.select");			// ref. template
msos.require("ng.material.ui.checkbox");		// ref. template
msos.require("ng.material.ui.button");			// ref. template
msos.require("ng.material.ui.switch");			// ref. template

demo.material.controllers.input.version = new msos.set_version(18, 9, 7);


angular.module(
    'demo.material.controllers.input',
    [
        'ng',
        'ng.material.core.theming'
    ]
).config(
    ['$mdThemingProvider', function ($mdThemingProvider) {
        "use strict";

        $mdThemingProvider.theme('docs-dark', 'default')
            .primaryPalette('yellow')
            .dark();
    }]
).controller(
    'demo.material.controllers.input.ctrl1',
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
).controller(
	'demo.material.controllers.input.ctrl2',
	['$scope', function ($scope) {
		"use strict";

		$scope.project = {
			description: 'Nuclear Missile Defense System',
			rate: 500,
			special: true
		};
	}]
).controller(
	'demo.material.controllers.input.ctrl3',
	['$scope', function ($scope) {
		"use strict";

		$scope.showHints = true;

		$scope.user = {
			name: "",
			email: "",
			social: "123456789",
			phone: "N/A"
		};
	}]
).controller(
	'demo.material.controllers.input.ctrl4',
	['$scope', function ($scope) {
		"use strict";

		$scope.user = {
			name: 'John Doe',
			email: '',
			phone: '',
			address: 'Mountain View, CA',
			donation: 19.99
		};
	}]
);
