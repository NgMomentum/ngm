
msos.provide("ng.bootstrap.ui.pager");
msos.require("ng.bootstrap.ui.paging");

ng.bootstrap.ui.pager.version = new msos.set_version(17, 5, 31);

// Load Angular-UI-Bootstrap module specific CSS
ng.bootstrap.ui.pager.css = new msos.loader();
ng.bootstrap.ui.pager.css.load(msos.resource_url('ng', 'bootstrap/css/ui/pager.css'));

// Below is the standard ui.bootstrap.accordion plugin, except for templateUrl location and naming (MSOS style)
// ui.bootstrap.pagination -> ng.bootstrap.ui.pagination
// uib/template/pagination/pager.html -> msos.resource_url('ng', 'bootstrap/ui/tmpl/pager.html')
angular.module('ng.bootstrap.ui.pager', ['ng.bootstrap.ui.paging'])

.controller('UibPagerController', ['$scope', '$attrs', 'uibPaging', 'uibPagerConfig', function($scope, $attrs, uibPaging, uibPagerConfig) {
    $scope.align = angular.isDefined($attrs.align) ? $scope.$parent.$eval($attrs.align) : uibPagerConfig.align;

    uibPaging.create(this, $scope, $attrs);
}])

.constant('uibPagerConfig', {
    itemsPerPage: 10,
    previousText: '« Previous',
    nextText: 'Next »',
    align: true
})

.directive('uibPager', ['uibPagerConfig', function(uibPagerConfig) {
    return {
        scope: {
            totalItems: '=',
            previousText: '@',
            nextText: '@',
            ngDisabled: '='
        },
        require: ['uibPager', '?ngModel'],
        controller: 'UibPagerController',
        controllerAs: 'pager',
        templateUrl: function(element, attrs) {
            return attrs.templateUrl || msos.resource_url('ng', 'bootstrap/ui/tmpl/pager.html');
        },
        replace: true,
        link: function(scope, element, attrs, ctrls) {
            var paginationCtrl = ctrls[0],
                ngModelCtrl = ctrls[1];

            if (!ngModelCtrl) {
                return; // do nothing if no ng-model
            }

            paginationCtrl.init(ngModelCtrl, uibPagerConfig);
        }
    };
}]);
