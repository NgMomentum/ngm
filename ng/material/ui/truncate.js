
/**
 * @ngdoc module
 * @name material.components.truncate
 */

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.truncate");

ng.material.ui.truncate.version = new msos.set_version(18, 4, 16);


function MdTruncateController($element) {
    "use strict";

    $element.addClass('md-truncate');
}

function MdTruncateDirective() {
    "use strict";

    return {
        restrict: 'AE',
        controller: ['$element', MdTruncateController]
    };
}


angular.module(
    'ng.material.ui.truncate',
    ['ng']
).directive(
    'mdTruncate',
    MdTruncateDirective
);
