
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.v111.core.tabripple");
msos.require("ng.material.v111.core.ripple");

ng.material.v111.core.tabripple.version = new msos.set_version(16, 12, 29);


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
    'ng.material.v111.core.tabripple',
    [
        'ng',
        'ng.material.v111.core.ripple'
    ]
).factory(
    '$mdTabInkRipple',
    ['$mdInkRipple', MdTabInkRipple]
);
