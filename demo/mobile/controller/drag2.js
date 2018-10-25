
/*global
    msos: false,
    angular: false
*/

msos.provide("demo.mobile.controller.drag2");
msos.require("ng.bootstrap.ui.alert");


angular.module(
	'demo.mobile.controller.drag2',
	["ng", 'ng.mobile.gestures.drag']
).directive(
	'dragMeTwo',
	['$drag', function ($drag) {
		return {
			restrict: 'A',
			controller: ['$scope', '$element', function demo_mobile_drag2_ctrl($scope, $element) {
				// If ng/mobile/gestures.js is loaded (mobile only)
				if ($drag.TRANSLATE_INSIDE) {

					$drag.bind($element, {
						//
						// Here you can see how to limit movement 
						// to an element
						//
						transform: $drag.TRANSLATE_INSIDE($element.parent()),
						end: function (drag) {
							// go back to initial position
							drag.reset();
						}
					}, { // release touch when movement is outside bounduaries
						sensitiveArea: $element.parent()
					});
				}
			}]
		};
	}]
);
