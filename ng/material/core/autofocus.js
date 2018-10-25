
/*global
    msos: false,
    ng: false
*/

msos.provide("ng.material.core.autofocus");

ng.material.core.autofocus.version = new msos.set_version(18, 4, 5);


(function (window, angular) {
    "use strict";

	function MdAutofocusDirective($parse) {

		function preLink(scope, element, attr) {
			var attrExp = attr.mdAutoFocus || attr.mdAutofocus || attr.mdSidenavFocus;

			function updateExpression(value) {

				if (angular.isUndefined(value)) { value = true; }

				element.toggleClass('md-autofocus', !!value);
			}

			// Initially update the expression by manually parsing the expression as per $watch source.
			updateExpression($parse(attrExp)(scope));

			// Only watch the expression if it is not empty.
			if (attrExp) {
				scope.$watch(attrExp, updateExpression);
			}
		}

		return {
			restrict: 'A',
			link: { pre: preLink }
		};
	}

	angular.module(
        'ng.material.core.autofocus',
        ["ng"]
    ).directive(
        'mdAutofocus',
        ['$parse', MdAutofocusDirective]
    ).directive(
        'mdAutoFocus',
        ['$parse', MdAutofocusDirective]
    ).directive(
        'mdSidenavFocus',
        ["$parse", MdAutofocusDirective]
    );

}(window, window.angular));