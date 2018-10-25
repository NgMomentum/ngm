
/**
 * @ngdoc module
 * @name material.components.swipe
 * @description Swipe module!
 */

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.swipe");

ng.material.ui.swipe.version = new msos.set_version(18, 4, 17);


function getDirective(name) {
	"use strict";

	var directiveName = 'md' + name,
		eventName = '$md.' + name.toLowerCase();

	function DirectiveFactory($parse) {

		function postLink(scope, element, attr) {
			var fn = $parse(attr[directiveName]);

			element.on(
				eventName,
				function (ev) {
					var currentTarget = ev.currentTarget;

					scope.$applyAsync(
						function () {
							fn(scope, { $event: ev, $target: { current: currentTarget } });
						}
					);
				}
			);
		}

		return {
				restrict: 'A',
				link: postLink
			};
    }

	return DirectiveFactory;
}


angular.module(
	'ng.material.ui.swipe',
	['ng']
).directive(
	'mdSwipeLeft',
	["$parse", getDirective('SwipeLeft')]
).directive(
	'mdSwipeRight',
	["$parse", getDirective('SwipeRight')]
).directive(
	'mdSwipeUp',
	["$parse", getDirective('SwipeUp')]
).directive(
	'mdSwipeDown',
	["$parse", getDirective('SwipeDown')]
);
