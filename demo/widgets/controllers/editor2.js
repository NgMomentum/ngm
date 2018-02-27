
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.widgets.controllers.editor2");
msos.require("ng.textng.core");
msos.require("ng.textng.setup");

demo.widgets.controllers.editor2.version = new msos.set_version(18, 1, 11);


angular.module(
    'demo.widgets.controllers.editor2',
	['ng', 'textAngular']
).controller(
    'demo.widgets.controllers.editor2.ctrl',
    ['$scope', 'textAngularManager', function app_ngText_ctrl($scope, textAngularManager) {
		"use strict";

		var temp_ce = 'demo.widgets.controllers.editor2.ctrl -> ';

        msos.console.debug(temp_ce + 'start, textAngularManager:', textAngularManager);

		$scope.version = textAngularManager.getVersion();

		msos.console.debug(temp_ce + ' done!');
    }]
);
