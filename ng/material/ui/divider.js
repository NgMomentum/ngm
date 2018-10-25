
/**
 * @ngdoc module
 * @name material.components.autocomplete
 */

/*global
    msos: false,
    ng: false
*/

msos.provide("ng.material.ui.divider");
msos.require("ng.material.core.theming");

ng.material.ui.divider.version = new msos.set_version(18, 7, 11);

// Load AngularJS-Material module specific CSS
ng.material.ui.divider.css = new msos.loader();
ng.material.ui.divider.css.load(msos.resource_url('ng', 'material/css/ui/divider.css'));


(function () {
	"use strict";

	function MdDividerDirective($mdTheming) {
		return {
			restrict: 'E',
			link: $mdTheming
		};
	}

	angular.module(
		'ng.material.ui.divider',
		['ng']
	).directive(
		'mdDivider',
		["$mdTheming", MdDividerDirective]
	);

}());
