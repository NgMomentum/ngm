
/**
 * @ngdoc module
 * @name material.components.radioButton
 * @description radioButton module!
 */

/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.v111.ui.radio");
msos.require("ng.material.v111.core");
msos.require("ng.material.v111.core.ripple");    // ref. template
msos.require("ng.material.v111.core.theming");
msos.require("ng.material.v111.ui.aria");

ng.material.v111.ui.radio.version = new msos.set_version(17, 1, 6);


function mdRadioGroupDirective($mdUtil, $mdConstant, $mdTheming, $timeout) {
    "use strict";

    function linkRadioGroup(scope, element, attr_na, ctrls) {

        element.addClass('_md'); // private md component indicator for styling
        $mdTheming(element);

        var rgCtrl = ctrls[0],
            ngModelCtrl = ctrls[1] || $mdUtil.fakeNgModel();

        rgCtrl.init(ngModelCtrl);

        scope.mouseActive = false;

        function setFocus() {
            if (!element.hasClass('md-focused')) {
                element.addClass('md-focused');
            }
        }

        function keydownListener(ev) {
            var keyCode = ev.which || ev.keyCode,
                form;

            // Only listen to events that we originated ourselves
            // so that we don't trigger on things like arrow keys in
            // inputs.

            if (keyCode !== $mdConstant.KEY_CODE.ENTER &&
                ev.currentTarget !== ev.target) {
                return;
            }

            switch (keyCode) {
                case $mdConstant.KEY_CODE.LEFT_ARROW:
                case $mdConstant.KEY_CODE.UP_ARROW:
                    ev.preventDefault();
                    rgCtrl.selectPrevious();
                    setFocus();
                    break;

                case $mdConstant.KEY_CODE.RIGHT_ARROW:
                case $mdConstant.KEY_CODE.DOWN_ARROW:
                    ev.preventDefault();
                    rgCtrl.selectNext();
                    setFocus();
                    break;

                case $mdConstant.KEY_CODE.ENTER:
                    form = angular.element($mdUtil.getClosest(element[0], 'form'));

                    if (form.length > 0) {
                        form.triggerHandler('submit');
                    }
                    break;
            }
        }

        element
            .attr({
                'role': 'radiogroup',
                'tabIndex': element.attr('tabindex') || '0'
            })
            .on('keydown', keydownListener)
            .on('mousedown', function () {
                scope.mouseActive = true;
                $timeout(function () {
                    scope.mouseActive = false;
                }, 100);
            })
            .on('focus', function () {
                if (scope.mouseActive === false) {
                    rgCtrl.$element.addClass('md-focused');
                }
            })
            .on('blur', function () {
                rgCtrl.$element.removeClass('md-focused');
            });
    }

    function RadioGroupController($element) {
        this._radioButtonRenderFns = [];
        this.$element = $element;
    }

    function changeSelectedButton(parent, increment) {
        // Coerce all child radio buttons into an array, then wrap then in an iterator
        var buttons = $mdUtil.iterator(parent[0].querySelectorAll('md-radio-button'), true),
            validate,
            selected,
            target;

        if (buttons.count()) {
            validate = function (button) {
                // If disabled, then NOT valid
                return !angular.element(button).attr("disabled");
            };

            selected = parent[0].querySelector('md-radio-button.md-checked');
            target = buttons[increment < 0 ? 'previous' : 'next'](selected, validate) || buttons.first();

            // Activate radioButton's click listener (triggerHandler won't create a real click event)
            angular.element(target).triggerHandler('click');
        }
    }

    function createRadioGroupControllerProto() {
        return {
            init: function (ngModelCtrl) {
                this._ngModelCtrl = ngModelCtrl;
                this._ngModelCtrl.$render = angular.bind(this, this.render);
            },
            add: function (rbRender) {
                this._radioButtonRenderFns.push(rbRender);
            },
            remove: function (rbRender) {
                var index = this._radioButtonRenderFns.indexOf(rbRender);
                if (index !== -1) {
                    this._radioButtonRenderFns.splice(index, 1);
                }
            },
            render: function () {
                this._radioButtonRenderFns.forEach(function (rbRender) {
                    rbRender();
                });
            },
            setViewValue: function (value, eventType) {
                this._ngModelCtrl.$setViewValue(value, eventType);
                // update the other radio buttons as well
                this.render();
            },
            getViewValue: function () {
                return this._ngModelCtrl.$viewValue;
            },
            selectNext: function () {
                return changeSelectedButton(this.$element, 1);
            },
            selectPrevious: function () {
                return changeSelectedButton(this.$element, -1);
            },
            setActiveDescendant: function (radioId) {
                this.$element.attr('aria-activedescendant', radioId);
            },
            isDisabled: function () {
                return this.$element[0].hasAttribute('disabled');
            }
        };
    }

    RadioGroupController.prototype = createRadioGroupControllerProto();

    return {
        restrict: 'E',
        controller: ['$element', RadioGroupController],
        require: ['mdRadioGroup', '?ngModel'],
        link: {
            pre: linkRadioGroup
        }
    };
}

function mdRadioButtonDirective($mdAria, $mdUtil, $mdTheming) {
    "use strict";

    var CHECKED_CSS = 'md-checked';

    function link(scope, element, attr, rgCtrl) {
        var lastChecked;

        function configureAria(element) {
            element.attr({
                id: attr.id || 'radio_' + $mdUtil.nextUid(),
                role: 'radio',
                'aria-checked': 'false'
            });

            $mdAria.expectWithText(element, 'aria-label');
        }

        $mdTheming(element);
        configureAria(element, scope);

        function render() {
            var checked = rgCtrl.getViewValue() == attr.value;      // leave for now (undefined mutated to null)

            if (checked === lastChecked) { return; }

            if (element[0].parentNode.nodeName.toLowerCase() !== 'md-radio-group') {
                // If the radioButton is inside a div, then add class so highlighting will work
                element.parent().toggleClass(CHECKED_CSS, checked);
            }

            if (checked) {
                rgCtrl.setActiveDescendant(element.attr('id'));
            }

            lastChecked = checked;

            element
                .attr('aria-checked', checked)
                .toggleClass(CHECKED_CSS, checked);
        }

        function listener(ev) {
            if (element[0].hasAttribute('disabled') || rgCtrl.isDisabled()) { return; }

            scope.$apply(function () {
                rgCtrl.setViewValue(attr.value, ev && ev.type);
            });
        }

        function initialize() {
            if (!rgCtrl) {
                throw 'RadioButton: No RadioGroupController could be found.';
            }

            rgCtrl.add(render);
            attr.$observe('value', render);

            element
                .on('click', listener)
                .on('$destroy', function () {
                    rgCtrl.remove(render);
                });
        }

        if (attr.ngValue) {
            $mdUtil.nextTick(initialize, false);
        } else {
            initialize();
        }
    }

    return {
        restrict: 'E',
        require: '^mdRadioGroup',
        transclude: true,
        template: '<div class="md-container" md-ink-ripple md-ink-ripple-checkbox>' +
            '<div class="md-off"></div>' +
            '<div class="md-on"></div>' +
            '</div>' +
            '<div ng-transclude class="md-label"></div>',
        link: link
    };
}


angular.module(
    'ng.material.v111.ui.radio',
    [
        'ng',
        'ng.material.v111.core',
        'ng.material.v111.core.theming',
        'ng.material.v111.ui.aria'
    ]
).directive(
    'mdRadioGroup',
    ['$mdUtil', '$mdConstant', '$mdTheming', '$timeout', mdRadioGroupDirective]
).directive(
    'mdRadioButton',
    ['$mdAria', '$mdUtil', '$mdTheming', mdRadioButtonDirective]
);
