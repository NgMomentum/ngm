
/*global
    msos: false,
    angular: false
*/

msos.provide("demo.material.controllers.swipe");
msos.require("ng.material.ui.swipe");		// ref. template
msos.require("ng.material.ui.layout");		// ref. template
msos.require("ng.material.ui.icon");		// ref. template
msos.require("ng.material.ui.divider");		// ref. template

demo.material.controllers.swipe.version = new msos.set_version(18, 7, 12);


angular.module(
    'demo.material.controllers.swipe',
	['ng']
).controller(
    'demo.material.controllers.swipe.ctrl',
	['$scope', '$log', function ($scope, $log) {

        $scope.onSwipeLeft = function (ev, target) {
            alert('You swiped left!!');

            $log.log('Event Target: ', ev.target);
            $log.log('Event Current Target: ', ev.currentTarget);
            $log.log('Original Current Target: ', target.current);
        };

        $scope.onSwipeRight = function (ev, target) {
            alert('You swiped right!!');

            $log.log('Event Target: ', ev.target);
            $log.log('Event Current Target: ', ev.currentTarget);
            $log.log('Original Current Target: ', target.current);
        };

        $scope.onSwipeUp = function (ev, target) {
            alert('You swiped up!!');

            $log.log('Event Target: ', ev.target);
            $log.log('Event Current Target: ', ev.currentTarget);
            $log.log('Original Current Target: ', target.current);
        };

        $scope.onSwipeDown = function (ev, target) {
            alert('You swiped down!!');

            $log.log('Event Target: ', ev.target);
            $log.log('Event Current Target: ', ev.currentTarget);
            $log.log('Original Current Target: ', target.current);
        };
    }]
);
