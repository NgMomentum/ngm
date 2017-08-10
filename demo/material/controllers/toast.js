
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.toast");
msos.require("ng.material.v111.core");
msos.require("ng.material.v111.ui.toast");
msos.require("ng.material.v111.ui.layout");
msos.require("ng.material.v111.ui.button");
msos.require("ng.material.v111.ui.checkbox");

demo.material.controllers.toast.version = new msos.set_version(16, 12, 28);


angular.module(
    'demo.material.controllers.toast',
    [
        'ng',
        'ng.material.v111.core',
        'ng.material.v111.ui.toast'
    ]
).controller(
    'demo.material.controllers.toast.ctrl',
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
    'ToastCtrl',
    function ($scope, $mdToast) {
        "use strict";

        $scope.closeToast = function () {
            $mdToast.hide();
        };
    }
);
