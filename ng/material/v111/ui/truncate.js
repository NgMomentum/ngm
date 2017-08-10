
/**
 * @ngdoc module
 * @name material.components.truncate
 */

/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.v111.ui.truncate");

ng.material.v111.ui.truncate.version = new msos.set_version(16, 12, 29);


function MdTruncateController($element) {
    "use strict";

    $element.addClass('md-truncate');
}

function MdTruncateDirective() {
    "use strict";

    return {
        restrict: 'AE',

        controller: ['$element', MdTruncateController],
        controllerAs: '$ctrl',
        bindToController: true
    };
}


angular.module(
    'ng.material.v111.ui.truncate',
    [
        'ng'
    ]
).directive(
    'mdTruncate',
    MdTruncateDirective
);
