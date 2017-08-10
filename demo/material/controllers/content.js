
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.content");
msos.require("ng.material.v111.ui.content");
msos.require("ng.material.v111.ui.layout");
msos.require("ng.material.v111.ui.toolbar");

demo.material.controllers.content.version = new msos.set_version(17, 1, 3);


angular.module(
	'demo.material.controllers.content',
	[
		'ng',
		'ng.material.v111.ui.content'
	]
).controller(
	'demo.material.controllers.content.ctrl',
	['$scope', function ($scope) { "use strict"; }]
);
