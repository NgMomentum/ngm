
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.sidenav");
msos.require("ng.material.core.autofocus");	// ref. template
msos.require("ng.material.ui.sidenav");
msos.require("ng.material.ui.toolbar");
msos.require("ng.material.ui.layout");		// ref. template
msos.require("ng.material.ui.input");		// ref. template
msos.require("ng.material.ui.button");		// ref. template
msos.require("ng.material.ui.content");		// ref. template
msos.require("ng.material.ui.whiteframe");	// ref. template

demo.material.controllers.sidenav.version = new msos.set_version(18, 6, 22);


angular.module(
    'demo.material.controllers.sidenav',
	['ng', 'ng.material.ui.sidenav']
).controller(
	'demo.material.controllers.sidenav.ctrl1',
	['$scope', '$timeout', '$mdSidenav', '$log', function ($scope, $timeout, $mdSidenav, $log) {
		"use strict";

		function debounce(func, wait) {
			var timer;

			return function debounced() {
				var context = $scope,
					args = Array.prototype.slice.call(arguments);

				$timeout.cancel(timer);

				timer = $timeout(
					function () {
						timer = undefined;
						func.apply(context, args);
					},
					wait || 10,
					false
				);
			};
		}

		function buildDelayedToggler(navID) {

			return debounce(
				function () {
					// Component lookup should always be available since we are not using `ng-if`
					$mdSidenav(navID)
						.toggle()
						.then(
							function () {
								$log.debug("toggle " + navID + " is done");
							}
						);
				},
				200
			);
		}

		function buildToggler(navID) {
			return function () {
				// Component lookup should always be available since we are not using `ng-if`
				$mdSidenav(navID)
					.toggle()
					.then(
						function () {
							$log.debug("toggle " + navID + " is done");
						});
			};
		}

		$scope.toggleLeft = buildDelayedToggler('left');
		$scope.toggleRight = buildToggler('right');
		$scope.isOpenRight = function () {
			return $mdSidenav('right').isOpen();
		};
	}]
).controller(
	'LeftCtrl',
	['$scope', '$mdSidenav', '$log', function ($scope, $mdSidenav, $log) {
		"use strict";

		$scope.close = function () {
			// Component lookup should always be available since we are not using `ng-if`
			$mdSidenav('left').close()
				.then(
					function () {
						$log.debug("close LEFT is done");
					}
				);

		};
	}]
).controller(
	'RightCtrl',
	['$scope', '$mdSidenav', '$log', function ($scope, $mdSidenav, $log) {
		"use strict";

		$scope.close = function () {
			// Component lookup should always be available since we are not using `ng-if`
			$mdSidenav('right').close()
				.then(
					function () {
						$log.debug("close RIGHT is done");
					}
				);
		};
	}]
).controller(
	'demo.material.controllers.sidenav.ctrl2',
	['$scope', '$mdSidenav', function ($scope, $mdSidenav) {
		"use strict";

		function buildToggler(componentId) {
			return function () {
				$mdSidenav(componentId).toggle();
			};
		}

		$scope.toggleLeft = buildToggler('left2');
	}]
);
