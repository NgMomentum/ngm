
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false,
	demo: false
*/

msos.provide("demo.mobile.drag");
msos.require("ng.bootstrap.ui.alert");


angular.module(
	'demo.mobile.drag',
	[]
).directive(
	'dragToDismiss',
	['$drag', function ($drag) {
		return {
			restrict: 'A',
			controller: ['$scope', '$element', '$parse', '$timeout', function demo_mobile_drag_ctrl($scope, $element, $parse, $timeout) {
				var dismiss = false,
					dismissFn = $parse($element.attr('drag-to-dismiss'));

				// If ng/mobile/gestures.js is loaded (mobile only)
				if ($drag.TRANSLATE_RIGHT) {

					$drag.bind($element, {
						transform: $drag.TRANSLATE_RIGHT,
						move: function (drag) {
							if (drag.distanceX >= drag.rect.width / 4) {
								dismiss = true;
								$element.addClass('dismiss');
							} else {
								dismiss = false;
								$element.removeClass('dismiss');
							}
						},
						cancel: function () {
							$element.removeClass('dismiss');
						},
						end: function (drag) {
							if (dismiss) {
								$element.addClass('dismitted');
								$timeout(function () {
									$scope.$apply(function () {
										dismissFn($scope);
									});
								}, 300);
							} else {
								drag.reset();
							}
						}
					});
				}
			}]
		};
	}]
);
