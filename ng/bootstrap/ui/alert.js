
msos.provide("ng.bootstrap.ui.alert");

ng.bootstrap.ui.alert.version = new msos.set_version(16, 3, 21);

// Load Angular-UI-Bootstrap module specific CSS
ng.bootstrap.ui.alert.css = new msos.loader();
ng.bootstrap.ui.alert.css.load('ng_bootstrap_css_ui_alert_css', msos.resource_url('ng', 'bootstrap/css/ui/alert.css'));


// Below is the standard plugin, except for templateUrl location and naming (MSOS style)
// ui.bootstrap.alert -> ng.bootstrap.ui.alert
// uib/template/alert/alert.html -> msos.resource_url('ng', 'bootstrap/ui/tmpl/alert.html')
angular.module('ng.bootstrap.ui.alert', [])

.controller('UibAlertController', ['$scope', '$attrs', '$interpolate', '$timeout', function($scope, $attrs, $interpolate, $timeout) {
    $scope.closeable = !!$attrs.close;

    var dismissOnTimeout = angular.isDefined($attrs.dismissOnTimeout) ?
        $interpolate($attrs.dismissOnTimeout)($scope.$parent) : null;

    if (dismissOnTimeout) {
        $timeout(function() {
            $scope.close();
        }, parseInt(dismissOnTimeout, 10));
    }
}])

.directive('uibAlert', function() {
    return {
        controller: 'UibAlertController',
        controllerAs: 'alert',
        templateUrl: function(element, attrs) {
            return attrs.templateUrl || msos.resource_url('ng', 'bootstrap/ui/tmpl/alert.html');
        },
        transclude: true,
        replace: true,
        scope: {
            type: '@',
            close: '&'
        }
    };
});