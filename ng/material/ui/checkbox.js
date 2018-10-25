
/**
 * @ngdoc module
 * @name material.components.checkbox
 * @description Checkbox module!
 */

/*global
    msos: false,
    ng: false,
    angular: false
*/

msos.provide("ng.material.ui.checkbox");
msos.require("ng.material.core.theming");
msos.require("ng.material.core.ripple");       // ref. template
msos.require("ng.material.ui.aria");
msos.require("ng.material.ui.interaction");

ng.material.ui.checkbox.version = new msos.set_version(18, 4, 13);

// Load AngularJS-Material module specific CSS
ng.material.ui.checkbox.css = new msos.loader();
ng.material.ui.checkbox.css.load(msos.resource_url('ng', 'material/css/ui/checkbox.css'));


function MdCheckboxDirective(inputDirective, $mdAria, $mdConstant, $mdTheming, $mdUtil, $mdInteraction) {
    "use strict";

    inputDirective = inputDirective[0];

    function compile(tElement_na, tAttrs) {

        tAttrs.$set('tabindex', tAttrs.tabindex || '0');
        tAttrs.$set('type', 'checkbox');
        tAttrs.$set('role', tAttrs.type);

        function postLink(scope, element, attr, ctrls) {
            var isIndeterminate,
                containerCtrl = ctrls[0],
                ngModelCtrl = ctrls[1] || $mdUtil.fakeNgModel(),
                formCtrl = ctrls[2],
                isErrorGetter;

            if (containerCtrl) {

                isErrorGetter = containerCtrl.isErrorGetter || function () {
                    return ngModelCtrl.$invalid && (ngModelCtrl.$touched || (formCtrl && formCtrl.$submitted));
                };

                containerCtrl.input = element;

                scope.$watch(isErrorGetter, containerCtrl.setInvalid);
            }

            $mdTheming(element);

            // Redirect focus events to the root element, because IE11 is always focusing the container element instead
            // of the md-checkbox element. This causes issues when using ngModelOptions: `updateOnBlur`
            element.children().on(
                'focus',
                function () {
                    element.focus();
                }
            );

            function setIndeterminateState(newValue) {
                isIndeterminate = newValue !== false;

                if (isIndeterminate) {
                    element.attr('aria-checked', 'mixed');
                }
                element.toggleClass('md-indeterminate', isIndeterminate);
            }

            if ($mdUtil.parseAttributeBoolean(attr.mdIndeterminate)) {
                setIndeterminateState();

                scope.$watch(
                    attr.mdIndeterminate,
                    setIndeterminateState
                );
            }

            if (attr.ngChecked) {
                scope.$watch(scope.$eval.bind(scope, attr.ngChecked), function (value) {
                    ngModelCtrl.$setViewValue(value);
                    ngModelCtrl.$render();
                });
            }

            function $$watchExpr(expr, htmlAttr, valueOpts) {
                if (attr[expr]) {
                    scope.$watch(attr[expr], function (val) {
                        if (valueOpts[val]) {
                            element.attr(htmlAttr, valueOpts[val]);
                        }
                    });
                }
            }

            $$watchExpr(
                'ngDisabled',
                'tabindex',
                {
                    'true': '-1',
                    'false': attr.tabindex
                }
            );

            $mdAria.expectWithText(element, 'aria-label');

            inputDirective.link.pre(scope, {
                on: angular.noop,
                0: {}
            }, attr, [ngModelCtrl]);

            function listener(ev) {

                if (element[0].hasAttribute('disabled') || scope.skipToggle) { return; }

                scope.$apply(
                    function () {
                        // Toggle the checkbox value...
                        var viewValue = attr.ngChecked ? attr.checked : !ngModelCtrl.$viewValue;

                        ngModelCtrl.$setViewValue(viewValue, ev && ev.type);
                        ngModelCtrl.$render();
                    }
                );
            }

            function keypressHandler(ev) {
                var keyCode = ev.which || ev.keyCode;

                if (keyCode === $mdConstant.KEY_CODE.SPACE || keyCode === $mdConstant.KEY_CODE.ENTER) {
                    ev.preventDefault();
                    element.addClass('md-focused');
                    listener(ev);
                }
            }

            element.on(
                'click',
                listener
            ).on(
                'keypress',
                keypressHandler
            ).on(
                'focus',
                function () {
                    if ($mdInteraction.getLastInteractionType() === 'keyboard') {
                        element.addClass('md-focused');
                    }
                }
            ).on(
                'blur',
                function () { element.removeClass('md-focused'); }
            );

            function render() {
                element.toggleClass(
                    'md-checked',
                    !!ngModelCtrl.$viewValue && !isIndeterminate
                );
            }

            ngModelCtrl.$render = render;
        }

        return {
            pre: function (scope_na, element) {
                element.on(
                    'click',
                    function (e) {
                        if (this.hasAttribute('disabled')) {
                            e.stopImmediatePropagation();
                        }
                    }
                );
            },
            post: postLink
        };
    }

    return {
        restrict: 'E',
        transclude: true,
        require: ['^?mdInputContainer', '?ngModel', '?^form'],
        priority: $mdConstant.BEFORE_NG_ARIA,
        template:   '<div class="md-container" md-ink-ripple md-ink-ripple-checkbox>' +
                        '<div class="md-icon"></div>' +
                    '</div>' +
                    '<div ng-transclude class="md-label"></div>',
        compile: compile
    };
}

angular.module(
    'ng.material.ui.checkbox',
    [
        'ng',
        'ng.material.core',
        'ng.material.core.theming',
        'ng.material.core.ripple',
        'ng.material.ui.aria',
        'ng.material.ui.interaction'
    ]
).directive(
    'mdCheckbox',
    ['inputDirective', '$mdAria', '$mdConstant', '$mdTheming', '$mdUtil', '$mdInteraction', MdCheckboxDirective]
).directive(
    'mdIndeterminate',
    angular.restrictADir
);
