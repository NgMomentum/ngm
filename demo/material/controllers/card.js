
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.card");
msos.require("ng.material.v111.ui.card");
msos.require("ng.material.v111.core.theming");
msos.require("ng.material.v111.ui.icon");
msos.require("ng.material.v111.ui.button");
msos.require("ng.material.v111.ui.layout");
msos.require("ng.material.v111.ui.content");
msos.require("ng.material.v111.ui.checkbox");

demo.material.controllers.card.version = new msos.set_version(17, 1, 7);


angular.module(
	'demo.material.controllers.card',
	[
		'ng',
		'ng.material.v111.core.theming'
	]
).controller(
	'demo.material.controllers.card.ctrl',
	['$scope', function ($scope) {
		"use strict";

		$scope.imagePath = './ngm/demo/material/img/washedout.png';
	}]
).config(
	['$mdThemingProvider', function ($mdThemingProvider) {
		"use strict";

		$mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
		$mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
		$mdThemingProvider.theme('dark-purple').backgroundPalette('deep-purple').dark();
		$mdThemingProvider.theme('dark-blue').backgroundPalette('blue').dark();
	}]
);
