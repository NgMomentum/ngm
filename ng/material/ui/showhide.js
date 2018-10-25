
/**
 * @ngdoc module
 * @name material.components.showHide
 */

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.showhide");
msos.require("ng.material.core.animator");

ng.material.ui.showhide.version = new msos.set_version(18, 7, 8);


function createDirective(name, targetValue) {
    "use strict";

    return ['$mdUtil', '$$mdAnimate', '$window', function ($mdUtil, $$mdAnimate, $window) {
        return {
            restrict: 'A',
            multiElement: true,
            link: function ($scope, $element, $attr) {
                var unregister = $scope.$on(
                        '$md-resize-enable',
                        function () {
                            unregister();

                            var node = $element[0],
                                cachedTransitionStyles = node.nodeType === $window.Node.ELEMENT_NODE ? $window.getComputedStyle(node) : {};

                            $scope.$watch(
                                $attr[name],
                                function (value) {
                                    var opts,
										animator = $$mdAnimate($mdUtil);

                                    if (Boolean(value) == targetValue) {
                                        $mdUtil.nextTick(
											function () {
												$scope.$broadcast('$md-resize');
											},
											false	// nextTick was undefined (default true)
										);

                                        opts = { cachedTransitionStyles: cachedTransitionStyles };

                                        animator.waitTransitionEnd($element, opts).then(
                                            function () {
                                                $scope.$broadcast('$md-resize');
                                            }
                                        );
                                    }
                                }
                            );
                        }
                    );
            }
        };
    }];
}


angular.module(
    'ng.material.ui.showhide',
    ['ng', 'ng.material.core']
).directive(
    'ngShow',
    createDirective('ngShow', true)
).directive(
    'ngHide',
    createDirective('ngHide', false)
);
