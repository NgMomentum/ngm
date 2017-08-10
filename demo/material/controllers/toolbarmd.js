
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.toolbarmd");
msos.require("ng.material.v111.ui.toolbar");
msos.require("ng.material.v111.ui.icon");
msos.require("ng.material.v111.ui.button");
msos.require("ng.material.v111.ui.content");
msos.require("ng.material.v111.ui.layout");
msos.require("ng.material.v111.ui.truncate");

demo.material.controllers.toolbarmd.version = new msos.set_version(17, 1, 3);


angular.module(
	'demo.material.controllers.toolbarmd',
	[
		'ng',
		'ng.material.v111.ui.toolbar'
	]
).controller(
	'demo.material.controllers.toolbarmd.ctrl',
	['$scope', function ($scope) { "use strict"; }]
);
