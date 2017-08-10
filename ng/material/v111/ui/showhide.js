
/**
 * @ngdoc module
 * @name material.components.showHide
 */

/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.v111.ui.showhide");
msos.require("ng.material.v111.core");
msos.require("ng.material.v111.core.animator");

ng.material.v111.ui.showhide.version = new msos.set_version(16, 12, 29);


function createDirective(name, targetValue) {
    "use strict";

    return ['$mdUtil', '$window', '$$mdAnimate', function ($mdUtil, $window, $$mdAnimate) {
        return {
            restrict: 'A',
            multiElement: true,
            link: function ($scope, $element, $attr) {
                var unregister = $scope.$on(
                        '$md-resize-enable',
                        function () {
                            unregister();

                            var node = $element[0],
                                cachedTransitionStyles = node.nodeType === $window.Node.ELEMENT_NODE
                                    ? $window.getComputedStyle(node)
                                    : {};

                            $scope.$watch(
                                $attr[name],
                                function (value) {
                                    var opts;

                                    if (!!value === targetValue) {
                                        $mdUtil.nextTick(function () {
                                            $scope.$broadcast('$md-resize');
                                        });

                                        opts = { cachedTransitionStyles: cachedTransitionStyles };

                                        $$mdAnimate.waitTransitionEnd($element, opts).then(
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
    'ng.material.v111.ui.showhide',
    [
        'ng',
        'ng.material.v111.core',
        'ng.material.v111.core.animator'
    ]
).directive(
    'ngShow',
    createDirective('ngShow', true)
).directive(
    'ngHide',
    createDirective('ngHide', false)
);
