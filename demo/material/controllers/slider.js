
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.slider");
msos.require("ng.material.ui.slider");
msos.require("ng.material.ui.icon");
msos.require("ng.material.ui.layout");		// ref. template
msos.require("ng.material.ui.input");		// ref. template
msos.require("ng.material.ui.checkbox");	// ref. template
msos.require("ng.material.ui.content");		// ref. template

demo.material.controllers.slider.version = new msos.set_version(18, 6, 21);


angular.module(
    'demo.material.controllers.slider',
	['ng', 'ng.material.ui.icon']
).config(
    ['$mdIconProvider', function ($mdIconProvider) {
		"use strict";

        $mdIconProvider.iconSet(
			'device',
			msos.resource_url('demo', 'material/img/icons/sets/device-icons.svg'),
			24
		);
    }]
).controller(
    'demo.material.controllers.slider.ctrl1',
	['$scope', function ($scope) {
		"use strict";

        $scope.color = {
            red: Math.floor(Math.random() * 255),
            green: Math.floor(Math.random() * 255),
            blue: Math.floor(Math.random() * 255)
        };

        $scope.rating1 = 3;
        $scope.rating2 = 2;
        $scope.rating3 = 4;

        $scope.disabled1 = Math.floor(Math.random() * 100);
        $scope.disabled2 = 0;
        $scope.disabled3 = 70;

        $scope.invert = Math.floor(Math.random() * 100);

        $scope.isDisabled = true;
    }]
).controller(
    'demo.material.controllers.slider.ctrl2',
	['$scope', function ($scope) {
		"use strict";

		$scope.vol = Math.floor(Math.random() * 100);
		$scope.bass = Math.floor(Math.random() * 100);
		$scope.master = Math.floor(Math.random() * 100);
	}]
);
