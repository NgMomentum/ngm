
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.widgets.controllers.editor3");
msos.require("ng.textng.core");
msos.require("ng.textng.setup");

demo.widgets.controllers.editor3.version = new msos.set_version(18, 1, 11);


angular.module(
    'demo.widgets.controllers.editor3',
	['ng', 'textAngular']
).controller(
    'demo.widgets.controllers.editor3.ctrl',
    ['$scope', 'textAngularManager', function app_ngText_ctrl($scope, textAngularManager) {
		"use strict";

		var temp_ce = 'demo.widgets.controllers.editor3.ctrl -> ';

        msos.console.debug(temp_ce + 'start, textAngularManager:', textAngularManager);

		$scope.version = textAngularManager.getVersion();

		$scope.htmlContent = '<h2>Try me!</h2><p>textAngular is a super cool WYSIWYG Text Editor directive for AngularJS</p><p><b>Features:</b></p><ol><li>Automatic Seamless Two-Way-Binding</li><li style="color: blue;">Super Easy <b>Theming</b> Options</li><li>Simple Editor Instance Creation</li><li>Safely Parses Html for Custom Toolbar Icons</li><li>Doesn&apos;t Use an iFrame</li><li>Works with Firefox, Chrome, and IE9+</li></ol><p><b>Code at GitHub:</b> <a href="https://github.com/fraywing/textAngular">Here</a> </p>';

		msos.console.debug(temp_ce + ' done!');
    }]
);
