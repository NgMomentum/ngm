
/**
 * @license AngularJS Animate v1.5.9 (original), updated to v1.6.1
 * (c) 2010-2016 Google, Inc. http://angularjs.org
 * License: MIT
 *
 * ref. https://css-tricks.com/animations-the-angular-way/, http://www.nganimate.org/
 */

/*global
    msos: false,
    ng: false
*/

msos.provide("ng.animate.children");

ng.animate.children.version = new msos.set_version(17, 2, 10);


(function (angular) {
    'use strict';

    msos.console.debug('ng.animate.children -> start.');

    var NG_ANIMATE_CHILDREN_DATA = '$$ngAnimateChildren',
        $$AnimateChildrenDirective = ['$interpolate', function ($interpolate) {
        return {
            link: function (scope, element, attrs) {
                var val = attrs.ngAnimateChildren;

                function setData(value) {
                    value = value === 'on' || value === 'true';
                    element.data(NG_ANIMATE_CHILDREN_DATA, value);
                }

                if (_.isString(val) && val.length === 0) { //empty attribute
                    element.data(NG_ANIMATE_CHILDREN_DATA, true);
                } else {
                    setData($interpolate(val)(scope));
                    attrs.$observe('ngAnimateChildren', setData);
                }
            }
        };
    }];

    angular.module(
        'ng.animate.children',
        ['ng']
    ).directive(
        'ngAnimateChildren',
        $$AnimateChildrenDirective
    );

    msos.console.debug('ng.animate.children ->  done!');

}(window.angular));
