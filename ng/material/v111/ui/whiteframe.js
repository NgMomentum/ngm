/**
 * @ngdoc module
 * @name material.components.whiteframe
 */

/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.v111.ui.whiteframe");
msos.require("ng.material.v111.core");

ng.material.v111.ui.whiteframe.version = new msos.set_version(16, 12, 23);


function MdWhiteframeDirective($log) {
    "use strict";

    var DISABLE_DP = -1,
        MIN_DP = 1,
        MAX_DP = 24,
        DEFAULT_DP = 4;

    function postLink(scope_na, element, attr) {
        var oldClass = '';

        attr.$observe(
            'mdWhiteframe',
            function (elevation) {

                elevation = parseInt(elevation, 10) || DEFAULT_DP;

                if (elevation !== DISABLE_DP && (elevation > MAX_DP || elevation < MIN_DP)) {
                    $log.warn('md-whiteframe attribute value is invalid. It should be a number between ' + MIN_DP + ' and ' + MAX_DP, element[0]);
                    elevation = DEFAULT_DP;
                }

                var newClass = elevation === DISABLE_DP ? '' : 'md-whiteframe-' + elevation + 'dp';

                attr.$updateClass(newClass, oldClass);
                oldClass = newClass;
            }
        );
    }

    return {
        link: postLink
    };
}


angular.module(
    'ng.material.v111.ui.whiteframe',
    [
        'ng',
        'ng.material.v111.core'
    ]
).directive(
    'mdWhiteframe',
    ['$log', MdWhiteframeDirective]
);
