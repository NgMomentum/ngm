
/**
 * @license AngularJS Animate v1.5.9 (original), updated to v1.6.1
 * (c) 2010-2016 Google, Inc. http://angularjs.org
 * License: MIT
 *
 * ref. https://css-tricks.com/animations-the-angular-way/, http://www.nganimate.org/
 */

/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.animate.swap");

ng.animate.swap.version = new msos.set_version(17, 2, 10);


(function (angular) {
    'use strict';

    msos.console.debug('ng.animate.swap -> start.');

    var ngAnimateSwapDirective = ['$animate', function ($animate) {

        return {
            restrict: 'A',
            transclude: 'element',
            terminal: true,
            priority: 600, // we use 600 here to ensure that the directive is caught before others
            link: function (scope, $element, attrs, ctrl_na, $transclude) {
                var previousElement,
                    previousScope;

                scope.$watchCollection(attrs.ngAnimateSwap || attrs['for'], function (value) {
                    if (previousElement) {
                        $animate.leave(previousElement);
                    }
                    if (previousScope) {
                        previousScope.$destroy();
                        previousScope = null;
                    }
                    if (value || value === 0) {
                        previousScope = scope.$new();
                        $transclude(previousScope, function (element) {
                            previousElement = element;
                            $animate.enter(element, null, $element);
                        });
                    }
                });
            }
        };
    }];

    angular.module(
        'ng.animate.swap',
        ['ng']
    ).directive(
        'ngAnimateSwap',
        ngAnimateSwapDirective
    );

    msos.console.debug('ng.animate.swap ->  done!');

}(window.angular));