
/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.core.tabripple");
msos.require("ng.material.core.ripple");

ng.material.core.tabripple.version = new msos.set_version(18, 3, 22);


function MdTabInkRipple($mdInkRipple) {
    "use strict";

    function attach(scope, element, options) {
        return $mdInkRipple.attach(scope, element, angular.extend({
            center: false,
            dimBackground: true,
            outline: false,
            rippleSize: 'full'
        }, options));
    }

    return {
        attach: attach
    };
}


angular.module(
    'ng.material.core.tabripple',
    [
        'ng',
        'ng.material.core.ripple'
    ]
).factory(
    '$mdTabInkRipple',
    ['$mdInkRipple', MdTabInkRipple]
);
