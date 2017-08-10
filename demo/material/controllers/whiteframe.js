

/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.whiteframe");
msos.require("ng.material.v111.core");
msos.require("ng.material.v111.ui.layout");
msos.require("ng.material.v111.ui.whiteframe");

demo.material.controllers.whiteframe.version = new msos.set_version(16, 12, 23);


angular.module(
	'demo.material.controllers.whiteframe',
	[
		'ng',
		'ng.material.v111.core',
		'ng.material.v111.ui.layout',
		'ng.material.v111.ui.whiteframe'
	]
);
