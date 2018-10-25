
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.toolbarmd");
msos.require("ng.material.ui.toolbar");		// ref. template
msos.require("ng.material.ui.icon");		// ref. template
msos.require("ng.material.ui.list");		// ref. template
msos.require("ng.material.ui.button");		// ref. template
msos.require("ng.material.ui.content");		// ref. template
msos.require("ng.material.ui.layout");		// ref. template
msos.require("ng.material.ui.truncate");	// ref. template
msos.require("ng.material.ui.divider");		// ref. template

demo.material.controllers.toolbarmd.version = new msos.set_version(18, 7, 12);


angular.module(
	'demo.material.controllers.toolbarmd',
	['ng']
).controller(
	'demo.material.controllers.toolbarmd.ctrl1',
	['$scope', function ($scope) {
		"use strict";

		msos.console.info('demo.material.controllers.toolbarmd.ctrl1 -> fired, $scope:', $scope);
	}]
).controller(
	'demo.material.controllers.toolbarmd.ctrl2',
	['$scope', function ($scope) {
		"use strict";

		var imagePath = msos.resource_url('demo', 'material/img/60.jpeg'),
			i = 0;

		$scope.title = 'My App Title';
		$scope.todos = [];

		for (i = 0; i < 15; i += 1) {
			$scope.todos.push({
				face: imagePath,
				what: "Brunch this weekend?",
				who: "Min Li Chan",
				notes: "I'll be in your neighborhood doing errands."
			});
		}
	}]
);