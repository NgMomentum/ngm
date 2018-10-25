
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.progresscir");
msos.require("ng.material.core.theming");
msos.require("ng.material.ui.progresscir");
msos.require("ng.material.ui.content");		// ref. template
msos.require("ng.material.ui.switch");		// ref. template
msos.require("ng.material.ui.layout");		// ref. template

demo.material.controllers.progresscir.version = new msos.set_version(18, 6, 24);


angular.module(
    'demo.material.controllers.progresscir',
    ['ng', 'ng.material.core.theming']
).config(
	['$mdThemingProvider', function ($mdThemingProvider) {
		"use strict";

		$mdThemingProvider.theme('docs-dark', 'default')
			.primaryPalette('yellow')
			.dark();
    }]
).controller(
	'demo.material.controllers.progresscir.ctrl',
	['$scope', '$interval', function ($scope, $interval) {
		"use strict";

        var self = this;

        self.activated = true;
        self.determinateValue = 30;

        // Iterate every 100ms, non-stop and increment
        // the Determinate loader.
        $interval(
			function () {
                self.determinateValue += 1;

                if (self.determinateValue > 100) {
                    self.determinateValue = 30;
                }

            },
			100,
			0,
			$scope
		);
    }]
);
