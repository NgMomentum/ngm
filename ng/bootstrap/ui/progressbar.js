
/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.bootstrap.ui.progressbar");

ng.bootstrap.ui.progressbar.version = new msos.set_version(17, 12, 26);

// Load Angular-UI-Bootstrap module specific CSS
ng.bootstrap.ui.progressbar.css = new msos.loader();
ng.bootstrap.ui.progressbar.css.load(msos.resource_url('ng', 'bootstrap/css/ui/progress.css'));


// Below is the standard ui.bootstrap.accordion plugin, except for templateUrl location and naming (MSOS style)
// ui.bootstrap.progressbar -> ng.bootstrap.ui.progressbar
// uib/template/progressbar/progress.html       -> msos.resource_url('ng', 'bootstrap/ui/tmpl/progress.html'),
// uib/template/progressbar/bar.html            -> msos.resource_url('ng', 'bootstrap/ui/tmpl/bar.html'),
// uib/template/progressbar/progressbar.html'   -> msos.resource_url('ng', 'bootstrap/ui/tmpl/progressbar.html')
angular.module(
    'ng.bootstrap.ui.progressbar',
    ['ng', 'ng.bootstrap.ui']
).constant(
    'uibProgressConfig', {
        animate: true,
        max: 100
    }
).controller('UibProgressController', ['$scope', '$attrs', 'uibProgressConfig', function ($scope, $attrs, progressConfig) {
    var self = this,
        animate = angular.isDefined($attrs.animate) ? $scope.$parent.$eval($attrs.animate) : progressConfig.animate;

    this.bars = [];
    $scope.max = getMaxOrDefault();

    this.addBar = function (bar, element, attrs) {
        if (!animate) {
            element.css({
                'transition': 'none'
            });
        }

        this.bars.push(bar);

        bar.max = getMaxOrDefault();
        bar.title = attrs && angular.isDefined(attrs.title) ? attrs.title : 'progressbar';

        bar.$watch('value', function () {
            bar.recalculatePercentage();
        });

        bar.recalculatePercentage = function () {
            var totalPercentage = self.bars.reduce(function (total, bar) {
                bar.percent = +(100 * bar.value / bar.max).toFixed(2);
                return total + bar.percent;
            }, 0);

            if (totalPercentage > 100) {
                bar.percent -= totalPercentage - 100;
            }
        };

        bar.$on('$destroy', function () {
            element = null;
            self.removeBar(bar);
        });
    };

    this.removeBar = function (bar) {
        this.bars.splice(this.bars.indexOf(bar), 1);
        this.bars.forEach(function (bar) {
            bar.recalculatePercentage();
        });
    };

    //$attrs.$observe('maxParam', function (maxParam) {
    $scope.$watch('maxParam', function () {
        self.bars.forEach(function (bar) {
            bar.max = getMaxOrDefault();
            bar.recalculatePercentage();
        });
    });

    function getMaxOrDefault() {
        return angular.isDefined($scope.maxParam) ? $scope.maxParam : progressConfig.max;
    }
}])

.directive('uibProgress', function () {
    return {
        replace: true,
        transclude: true,
        controller: 'UibProgressController',
        require: 'uibProgress',
        scope: {
            maxParam: '=?max'
        },
        templateUrl: msos.resource_url('ng', 'bootstrap/ui/tmpl/progress.html')
    };
})

.directive('uibBar', function () {
    return {
        replace: true,
        transclude: true,
        require: '^uibProgress',
        scope: {
            value: '=',
            type: '@'
        },
        templateUrl: msos.resource_url('ng', 'bootstrap/ui/tmpl/bar.html'),
        link: function (scope, element, attrs, progressCtrl) {
            progressCtrl.addBar(scope, element, attrs);
        }
    };
})

.directive('uibProgressbar', function () {
    return {
        replace: true,
        transclude: true,
        controller: 'UibProgressController',
        scope: {
            value: '=',
            maxParam: '=?max',
            type: '@'
        },
        templateUrl: msos.resource_url('ng', 'bootstrap/ui/tmpl/progressbar.html'),
        link: function (scope, element, attrs, progressCtrl) {
            progressCtrl.addBar(scope, angular.element(element.children()[0]), {
                title: attrs.title
            });
        }
    };
});
