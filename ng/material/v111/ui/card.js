
/**
 * @ngdoc module
 * @name material.components.card
 *
 * @description
 * Card components.
 */

/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.v111.ui.card");

ng.material.v111.ui.card.version = new msos.set_version(17, 1, 7);


function mdCardDirective($mdTheming) {
    "use strict";

    return {
        restrict: 'E',
        link: function ($scope_na, $element) {
            $element.addClass('_md');   // private md component indicator for styling
            $mdTheming($element);
        }
    };
}

function mdCardElementDirective() {
    "use strict";

    return {
        restrict: 'E'
    };
}


angular.module(
    'ng.material.v111.ui.card',
    [
        'ng.material.v111.core.theming'
    ]
).directive(
    'mdCard',
    ['$mdTheming', mdCardDirective]
).directive(
    'mdCardTitle',
    mdCardElementDirective
).directive(
    'mdCardActions',
    mdCardElementDirective
).directive(
    'mdCardContent',
    mdCardElementDirective
).directive(
    'mdCardTitleText',
    mdCardElementDirective
).directive(
    'mdCardTitleMedia',
    mdCardElementDirective
);
