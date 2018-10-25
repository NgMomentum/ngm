
/**
 * @ngdoc module
 * @name material.components.card
 *
 * @description
 * Card components.
 */

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.card");
msos.require("ng.material.core.theming");

ng.material.ui.card.version = new msos.set_version(18, 4, 15);

// Load AngularJS-Material module specific CSS
ng.material.ui.card.css = new msos.loader();
ng.material.ui.card.css.load(msos.resource_url('ng', 'material/css/ui/card.css'));


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
    'ng.material.ui.card',
    ['ng', 'ng.material.core.theming']
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
).directive(
	'mdCardHeader',
	angular.restrictEDir
).directive(
	'mdCardAvatar',
	angular.restrictEDir
).directive(
	'mdCardHeaderText',
	angular.restrictEDir
).directive(
	'mdCardIconActions',
	angular.restrictEDir
);
