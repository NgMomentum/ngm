
/**
 * @ngdoc module
 * @name material.components.whiteframe
 */

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.whiteframe");

ng.material.ui.whiteframe.version = new msos.set_version(18, 8, 13);

// Load AngularJS-Material module specific CSS
ng.material.ui.whiteframe.css = new msos.loader();
ng.material.ui.whiteframe.css.load(msos.resource_url('ng', 'material/css/ui/whiteframe.css'));


function MdWhiteframeDirective() {
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
                    msos.console.warn('md-whiteframe attribute value is invalid. It should be a number between ' + MIN_DP + ' and ' + MAX_DP, element[0]);
                    elevation = DEFAULT_DP;
                }

                var newClass = elevation === DISABLE_DP ? '' : 'md-whiteframe-' + elevation + 'dp';

                attr.$updateClass(newClass, oldClass);
                oldClass = newClass;
            }
        );
    }

    return {
		restrict: 'EA',
        link: postLink
    };
}


angular.module(
    'ng.material.ui.whiteframe',
    ['ng']
).directive(
    'mdWhiteframe',
    MdWhiteframeDirective
);
