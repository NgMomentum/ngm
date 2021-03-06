
/*global
    msos: false,
	demo: false
*/

msos.provide("demo.mobile.controller.touch");


demo.mobile.controller.start.directive(
	'toucharea',
	['$touch', function ($touch) {
		// Runs during compile
		return {
			restrict: 'C',
			link: function ($scope, elem) {
	
				$scope.touch = null;
				$touch.bind(elem, {
					start: function (touch) {
						$scope.containerRect = elem[0].getBoundingClientRect();
						$scope.touch = touch;
						$scope.$apply();
					},
	
					cancel: function (touch) {
						$scope.touch = touch;
						$scope.$apply();
					},
	
					move: function (touch) {
						$scope.touch = touch;
						$scope.$apply();
					},
	
					end: function (touch) {
						$scope.touch = touch;
						$scope.$apply();
					}
				});
			}
		};
	}]
);