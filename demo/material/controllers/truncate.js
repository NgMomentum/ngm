
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.truncate");
msos.require("ng.material.v111.ui.truncate");
msos.require("ng.material.v111.ui.toolbar");
msos.require("ng.material.v111.ui.icon");
msos.require("ng.material.v111.ui.layout");
msos.require("ng.material.v111.ui.button");


demo.material.controllers.truncate.version = new msos.set_version(17, 1, 3);


angular.module(
	'demo.material.controllers.truncate',
	[
		'ng',
		'ng.material.v111.ui.truncate'
	]
).controller(
	'demo.material.controllers.truncate.ctrl',
	['$scope', function ($scope) { "use strict"; }]
);
