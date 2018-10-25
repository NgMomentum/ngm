
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.toast");
msos.require("ng.material.ui.toast");
msos.require("ng.material.ui.dialog");
msos.require("ng.material.ui.layout");		// ref. template
msos.require("ng.material.ui.button");		// ref. template
msos.require("ng.material.ui.checkbox");	// ref. template

demo.material.controllers.toast.version = new msos.set_version(18, 5, 27);

demo.material.controllers.toast.isDlgOpen = false;


angular.module(
    'demo.material.controllers.toast',
    [
        'ng',
        'ng.material.ui.toast'
    ]
).controller(
    'demo.material.controllers.toast.ctrl1',
    ['$scope', '$mdToast', function ($scope, $mdToast) {
        "use strict";

        var last = {
            bottom: false,
            top: true,
            left: false,
            right: true
        };

        $scope.toastPosition = angular.extend({}, last);

        $scope.getToastPosition = function () {
            sanitizePosition();

            return Object.keys($scope.toastPosition)
                .filter(function(pos) {
                    return $scope.toastPosition[pos];
                })
                .join(' ');
        };

        function sanitizePosition() {
            var current = $scope.toastPosition;

            if (current.bottom && last.top) current.top = false;
            if (current.top && last.bottom) current.bottom = false;
            if (current.right && last.left) current.left = false;
            if (current.left && last.right) current.right = false;

            last = angular.extend({}, current);
        }

        $scope.showSimpleToast = function () {
            var pinTo = $scope.getToastPosition();

            $mdToast.show(
                $mdToast.simple()
                .textContent('Simple Toast!')
                .position(pinTo)
                .hideDelay(3000)
            );
        };

        $scope.showActionToast = function () {
            var pinTo = $scope.getToastPosition(),
                toast = $mdToast.simple()
                    .textContent('Marked as read')
                    .action('UNDO')
                    .highlightAction(true)
                    .highlightClass('md-accent') // Accent is used by default, this just demonstrates the usage.
                    .position(pinTo);
    
            $mdToast.show(toast).then(
                function (response) {
                    if (response == 'ok') {
                        alert('You clicked the \'UNDO\' action.');
                    }
                }
            );
        };
    }]
).controller(
	'demo.material.controllers.toast.ctrl2',
	['$scope', '$mdToast', function ($scope, $mdToast) {
		"use strict";

		$scope.showCustomToast = function () {
			$mdToast.show({
				hideDelay: 3000,
				position: 'top right',
				controller: ['$scope', '$mdToast', '$mdDialog', function demo_md_toast_ctrl2($scope, $mdToast, $mdDialog) {

					$scope.closeToast = function () {
						if (demo.material.controllers.toast.isDlgOpen) { return; }
			
						$mdToast
							.hide()
							.then(
								function () { demo.material.controllers.toast.isDlgOpen = false; }
							);
					};
			
					$scope.openMoreInfo = function (e) {
			
						if (demo.material.controllers.toast.isDlgOpen) { return; }
			
						demo.material.controllers.toast.isDlgOpen = true;
			
						$mdDialog
							.show(
								$mdDialog
									.alert()
									.title('More info goes here.')
									.textContent('Something witty.')
									.ariaLabel('More info')
									.ok('Got it')
									.targetEvent(e)
							).then(
								function () { demo.material.controllers.toast.isDlgOpen = false; }
							);
					};
				}],
				templateUrl: msos.resource_url('demo', 'material/tmpl/toast/custom.html')
			});
		};
	}]
);
