
/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.bootstrap.ui.buttons");

ng.bootstrap.ui.buttons.version = new msos.set_version(17, 12, 6);


// Below is the standard plugin, except for naming (MSOS style)
// ui.bootstrap.buttons -> ng.bootstrap.ui.buttons
angular.module(
    'ng.bootstrap.ui.buttons',
    ['ng', 'ng.bootstrap.ui']
).constant(
    'uibButtonConfig',
    {
        activeClass: 'active',
        toggleEvent: 'click'
    }
).controller(
    'UibButtonsController',
    ['uibButtonConfig', function (uibButtonConfig) {
        "use strict";

        this.activeClass = uibButtonConfig.activeClass || 'active';
        this.toggleEvent = uibButtonConfig.toggleEvent || 'click';
    }]
).directive(
    'uibBtnRadio',
    ['$parse', function ($parse) {
        "use strict";
        return {
            require: ['uibBtnRadio', 'ngModel'],
            controller: 'UibButtonsController',
            controllerAs: 'buttons',
            link: function (scope, element, attrs, ctrls) {
                var buttonsCtrl = ctrls[0],
                    ngModelCtrl = ctrls[1],
                    uncheckableExpr = $parse(attrs.uibUncheckable);

                element.find('input').css({
                    display: 'none'
                });

                //model -> UI
                ngModelCtrl.$render = function () {
                    element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, scope.$eval(attrs.uibBtnRadio)));
                };

                //ui->model
                element.on(buttonsCtrl.toggleEvent, function () {
                    if (attrs.disabled) {
                        return;
                    }

                    var isActive = element.hasClass(buttonsCtrl.activeClass);

                    if (!isActive || angular.isDefined(attrs.uncheckable)) {
                        scope.$apply(function () {
                            ngModelCtrl.$setViewValue(isActive ? null : scope.$eval(attrs.uibBtnRadio));
                            ngModelCtrl.$render();
                        });
                    }
                });

                if (attrs.uibUncheckable) {
                    scope.$watch(uncheckableExpr, function (uncheckable) {
                        attrs.$set('uncheckable', uncheckable ? '' : undefined);
                    });
                }
            }
        };
    }]
).directive(
    'uibBtnCheckbox',
    function () {
        "use strict";

        return {
            require: ['uibBtnCheckbox', 'ngModel'],
            controller: 'UibButtonsController',
            controllerAs: 'button',
            link: function (scope, element, attrs, ctrls) {
                var buttonsCtrl = ctrls[0],
                    ngModelCtrl = ctrls[1];

                element.find('input').css({
                    display: 'none'
                });

                function getCheckboxValue(attribute, defaultValue) {
                    return angular.isDefined(attribute) ? scope.$eval(attribute) : defaultValue;
                }

                function getTrueValue() {
                    return getCheckboxValue(attrs.btnCheckboxTrue, true);
                }

                function getFalseValue() {
                    return getCheckboxValue(attrs.btnCheckboxFalse, false);
                }

                //model -> UI
                ngModelCtrl.$render = function () {
                    element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, getTrueValue()));
                };

                //ui->model
                element.on(buttonsCtrl.toggleEvent, function () {
                    if (attrs.disabled) {
                        return;
                    }

                    scope.$apply(function () {
                        ngModelCtrl.$setViewValue(element.hasClass(buttonsCtrl.activeClass) ? getFalseValue() : getTrueValue());
                        ngModelCtrl.$render();
                    });
                });
            }
        };
    }
).directive(
    'btnCheckboxTrue',
    angular.restrictADir
).directive(
    'btnCheckboxFalse',
    angular.restrictADir
).directive(
    'uibUncheckable',
    angular.restrictADir
).directive(
    'uncheckable',
    angular.restrictADir
);