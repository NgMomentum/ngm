
/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.bootstrap.ui.alert");

ng.bootstrap.ui.alert.version = new msos.set_version(17, 12, 6);

// Load Angular-UI-Bootstrap module specific CSS
ng.bootstrap.ui.alert.css = new msos.loader();
ng.bootstrap.ui.alert.css.load(msos.resource_url('ng', 'bootstrap/css/ui/alert.css'));


// Below is the standard plugin, except for templateUrl location and naming (MSOS style)
// ui.bootstrap.alert -> ng.bootstrap.ui.alert
// uib/template/alert/alert.html -> msos.resource_url('ng', 'bootstrap/ui/tmpl/alert.html')
angular.module(
    'ng.bootstrap.ui.alert',
    ['ng', 'ng.bootstrap.ui']
).controller(
    'UibAlertController',
    ['$scope', '$element', '$attrs', '$interpolate', '$timeout',
     function ($scope, $element, $attrs, $interpolate, $timeout) {
        $scope.closeable = !!$attrs.close;
        $element.addClass('alert');
        $attrs.$set('role', 'alert');
        if ($scope.closeable) {
            $element.addClass('alert-dismissible');
        }
    
        var dismissOnTimeout = angular.isDefined($attrs.dismissOnTimeout) ?
            $interpolate($attrs.dismissOnTimeout)($scope.$parent) : null;
    
        if (dismissOnTimeout) {
            $timeout(
				function () {
					$scope.close();
				},
				parseInt(dismissOnTimeout, 10),
				false
			);
        }
    }]
).directive(
    'uibAlert',
    function () {
        return {
            controller: 'UibAlertController',
            controllerAs: 'alert',
            restrict: 'A',
            templateUrl: function (element, attrs) {
                return attrs.templateUrl || msos.resource_url('ng', 'bootstrap/ui/tmpl/alert.html');
            },
            transclude: true,
            scope: {
               close: '&'
            }
        };
    }
);
