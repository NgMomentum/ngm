
/**
 * @ngdoc module
 * @name material.components.button
 * @description
 *
 * Button
 */

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.button");
msos.require("ng.material.core.theming");
msos.require("ng.material.core.ripple");
msos.require("ng.material.ui.aria");
msos.require("ng.material.ui.interaction");

ng.material.ui.button.version = new msos.set_version(18, 4, 13);

// Load AngularJS-Material module specific CSS
ng.material.ui.button.css = new msos.loader();
ng.material.ui.button.css.load(msos.resource_url('ng', 'material/css/ui/button.css'));


function MdAnchorDirective($mdTheming) {
    "use strict";

    return {
        restrict: 'E',
        link: function postLink(scope_na, element) {
            // Make sure to inherit theme so stand-alone anchors
            // support theme colors for md-primary, md-accent, etc.
            $mdTheming(element);
        }
    };
}

function MdButtonDirective($mdButtonInkRipple, $mdTheming, $mdAria, $mdInteraction) {
    "use strict";

    function isAnchor(attr) {
        return angular.isDefined(attr.href) || angular.isDefined(attr.ngHref) || angular.isDefined(attr.ngLink) || angular.isDefined(attr.uiSref);
    }

    function getTemplate(element_na, attr) {

        if (isAnchor(attr)) {
            return '<a class="md-button" ng-transclude></a>';
        }

        //If buttons don't have type="button", they will submit forms automatically.
        var btnType = attr.type === undefined ? 'button' : attr.type;

        return '<button class="md-button" type="' + btnType + '" ng-transclude></button>';
    }

    function postLink(scope, element, attr) {

        $mdTheming(element);
        $mdButtonInkRipple.attach(scope, element);

        // Use async expect to support possible bindings in the button label
        $mdAria.expectWithoutText(element, 'aria-label');

        // For anchor elements, we have to set tabindex manually when the
        // element is disabled
        if (isAnchor(attr) && angular.isDefined(attr.ngDisabled)) {
            scope.$watch(attr.ngDisabled, function(isDisabled) {
                element.attr('tabindex', isDisabled ? -1 : 0);
            });
        }

        // disabling click event when disabled is true
        element.on('click', function(e) {
            if (attr.disabled === true) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        });

        if (!element.hasClass('md-no-focus')) {

            element.on('focus', function() {

                // Only show the focus effect when being focused through keyboard interaction or programmatically
                if (!$mdInteraction.isUserInvoked() || $mdInteraction.getLastInteractionType() === 'keyboard') {
                    element.addClass('md-focused');
                }

            });

            element.on('blur', function() {
                element.removeClass('md-focused');
            });
        }
    }

    return {
        restrict: 'EA',
        replace: true,
        transclude: true,
        template: getTemplate,
        link: postLink
    };
}

angular.module(
    'ng.material.ui.button',
    [
        'ng',
        'ng.material.core.ripple',
        'ng.material.core.theming',
        'ng.material.ui.aria',
        'ng.material.ui.interaction'
    ]
).directive(
    'mdButton',
    ['$mdButtonInkRipple', '$mdTheming', '$mdAria', '$mdInteraction', MdButtonDirective]
).directive(
    'a',
    ['$mdTheming', MdAnchorDirective]
);
