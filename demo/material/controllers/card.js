
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.card");
msos.require("ng.material.ui.card");
msos.require("ng.material.core.theming");
msos.require("ng.material.ui.icon");
msos.require("ng.material.ui.button");		// ref. template
msos.require("ng.material.ui.layout");		// ref. template
msos.require("ng.material.ui.content");		// ref. template
msos.require("ng.material.ui.checkbox");	// ref. template

demo.material.controllers.card.version = new msos.set_version(18, 4, 15);


angular.module(
	'demo.material.controllers.card',
	['ng', 'ng.material.core.theming', 'ng.material.ui.icon']
).controller(
	'demo.material.controllers.card.ctrl1',
	['$scope', function ($scope) {
		"use strict";

		$scope.imagePath = msos.resource_url('demo', 'material/img/washedout.png');
	}]
).config(
	['$mdThemingProvider', '$mdIconProvider', function ($mdThemingProvider, $mdIconProvider) {
		"use strict";

		$mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
		$mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
		$mdThemingProvider.theme('dark-purple').backgroundPalette('deep-purple').dark();
		$mdThemingProvider.theme('dark-blue').backgroundPalette('blue').dark();

		$mdIconProvider.icon(
			'md-toggle-arrow',
			msos.resource_url('demo', 'material/img/icons/toggle-arrow.svg'),
			48
		);
	}]
);
