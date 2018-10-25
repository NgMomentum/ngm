
/**
 * @license AngularJS v1.5.9-build.5033+sha.b59bc0b
 * (c) 2010-2016 Google, Inc. http://angularjs.org
 * License: MIT
 *
 * Updated to v1.7.2
 */

/*global
    msos: false,
    ng: false
*/

msos.provide("ng.aria");

ng.aria.version = new msos.set_version(18, 9, 2);
ng.aria.ARIA_DISABLE_ATTR = 'ngAriaDisable';

(function (window, angular) {
    'use strict';

    var ngAriaModule = angular.module(
            'ng.aria',
			['ng']
        ).provider(
            '$aria', $AriaProvider
        ),
        nodeBlackList = ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT', 'DETAILS', 'SUMMARY'],
        isNodeOneOf = function (elem, nodeTypeArray) {
            if (nodeTypeArray.indexOf(elem[0].nodeName) !== -1) {
                return true;
            }
            return undefined;
        };

    function $AriaProvider() {
        var config = {
            ariaHidden: true,
            ariaChecked: true,
            ariaReadonly: true,
            ariaDisabled: true,
            ariaRequired: true,
            ariaInvalid: true,
            ariaValue: true,
            tabindex: true,
            bindKeydown: true,
            bindRoleForClick: true
        };

        this.config = function (newConfig) {
            config = angular.extend(config, newConfig);
        };

        function watchExpr(attrName, ariaAttr, nodeBlackList, negate) {
            return function (scope, elem, attr) {
				if (attr.hasOwnProperty(ng.aria.ARIA_DISABLE_ATTR)) { return; }

                var ariaCamelName = attr.$normalize(ariaAttr);
                if (config[ariaCamelName] && !isNodeOneOf(elem, nodeBlackList) && !attr[ariaCamelName]) {
                    scope.$watch(
						attr[attrName],
						function (boolVal) {
							// ensure boolean value
							boolVal = negate ? !boolVal : !!boolVal;
							elem.attr(ariaAttr, boolVal);
						}
					);
                }
            };
        }

        this.$get = function () {
            return {
                config: function (key) {
                    return config[key];
                },
                $$watchExpr: watchExpr
            };
        };
    }

    ngAriaModule.directive(
        'ngShow', ['$aria', function ($aria) {
            return $aria.$$watchExpr('ngShow', 'aria-hidden', [], true);
        }]
    ).directive(
        'ngHide', ['$aria', function ($aria) {
            return $aria.$$watchExpr('ngHide', 'aria-hidden', [], false);
        }]
    ).directive(
        'ngValue', ['$aria', function ($aria) {
            return $aria.$$watchExpr('ngValue', 'aria-checked', nodeBlackList, false);
        }]
    ).directive(
        'ngChecked', ['$aria', function ($aria) {
            return $aria.$$watchExpr('ngChecked', 'aria-checked', nodeBlackList, false);
        }]
    ).directive(
        'ngReadonly', ['$aria', function ($aria) {
            return $aria.$$watchExpr('ngReadonly', 'aria-readonly', nodeBlackList, false);
        }]
    ).directive(
        'ngRequired', ['$aria', function ($aria) {
            return $aria.$$watchExpr('ngRequired', 'aria-required', nodeBlackList, false);
        }]
    ).directive(
        'ngModel', ['$aria', function ($aria) {

            function shouldAttachAttr(attr, normalizedAttr, elem, allowBlacklistEls) {
				return $aria.config(normalizedAttr) && !elem.attr(attr) && (allowBlacklistEls || !isNodeOneOf(elem, nodeBlackList)) &&  (elem.attr('type') !== 'hidden' || elem[0].nodeName !== 'INPUT');
            }

            function shouldAttachRole(role, elem) {
                // if element does not have role attribute
                // AND element type is equal to role (if custom element has a type equaling shape) <-- remove?
                // AND element is not in nodeBlackList
                return !elem.attr('role') && (elem.attr('type') === role) && !isNodeOneOf(elem, nodeBlackList);
            }

            function getShape(attr) {
                var type = attr.type,
                    role = attr.role;

                return ((type || role) === 'checkbox' || role === 'menuitemcheckbox') ? 'checkbox' :
                    ((type || role) === 'radio' || role === 'menuitemradio') ? 'radio' :
                    (type === 'range' || role === 'progressbar' || role === 'slider') ? 'range' : '';
            }

            return {
                restrict: 'A',
                require: 'ngModel',
                priority: 200, //Make sure watches are fired after any other directives that affect the ngModel value
                compile: function (elem, attr) {

					if (attr.hasOwnProperty(ng.aria.ARIA_DISABLE_ATTR)) { return; }

                    var shape = getShape(attr, elem);

                    return {
                        post: function (scope, elem, attr, ngModel) {
                            var needsTabIndex = shouldAttachAttr('tabindex', 'tabindex', elem, false);

                            function ngAriaWatchModelValue() {
                                return ngModel.$modelValue;
                            }

                            function getRadioReaction() {
                                // Strict comparison would cause a BC
                                // eslint-disable-next-line eqeqeq
                                var boolVal = (attr.value == ngModel.$viewValue);
                                elem.attr('aria-checked', boolVal);
                            }

                            function getCheckboxReaction() {
                                elem.attr('aria-checked', !ngModel.$isEmpty(ngModel.$viewValue));
                            }

                            switch (shape) {
                                case 'radio':
                                case 'checkbox':
                                    if (shouldAttachRole(shape, elem)) {
                                        elem.attr('role', shape);
                                    }
                                    if (shouldAttachAttr('aria-checked', 'ariaChecked', elem, false)) {
                                        scope.$watch(
											ngAriaWatchModelValue, shape === 'radio' ? getRadioReaction : getCheckboxReaction);
                                    }
                                    if (needsTabIndex) {
                                        elem.attr('tabindex', 0);
                                    }
                                    break;
                                case 'range':
                                    if (shouldAttachRole(shape, elem)) {
                                        elem.attr('role', 'slider');
                                    }
                                    if ($aria.config('ariaValue')) {
                                        var needsAriaValuemin = !elem.attr('aria-valuemin') &&
                                            (attr.hasOwnProperty('min') || attr.hasOwnProperty('ngMin'));
                                        var needsAriaValuemax = !elem.attr('aria-valuemax') &&
                                            (attr.hasOwnProperty('max') || attr.hasOwnProperty('ngMax'));
                                        var needsAriaValuenow = !elem.attr('aria-valuenow');

                                        if (needsAriaValuemin) {
                                            attr.$observe(
                                                'min',
                                                function ngAriaValueMinReaction(newVal) {
                                                    elem.attr('aria-valuemin', newVal);
                                                }
                                            );
                                        }
                                        if (needsAriaValuemax) {
                                            attr.$observe(
                                                'max',
                                                function ngAriaValueMinReaction(newVal) {
                                                    elem.attr('aria-valuemax', newVal);
                                                }
                                            );
                                        }
                                        if (needsAriaValuenow) {
                                            scope.$watch(
                                                ngAriaWatchModelValue,
                                                function ngAriaValueNowReaction(newVal) {
                                                    elem.attr('aria-valuenow', newVal);
                                                }
                                            );
                                        }
                                    }
                                    if (needsTabIndex) {
                                        elem.attr('tabindex', 0);
                                    }
                                    break;
                            }

                            if (!attr.hasOwnProperty('ngRequired') && ngModel.$validators.required &&
                                shouldAttachAttr('aria-required', 'ariaRequired', elem, false)) {
                                // ngModel.$error.required is undefined on custom controls
                                attr.$observe('required', function () {
                                    elem.attr('aria-required', !!attr.required);
                                });
                            }

                            if (shouldAttachAttr('aria-invalid', 'ariaInvalid', elem, true)) {
                                scope.$watch(
									function ngAriaInvalidWatch() {
										return ngModel.$invalid;
									},
									function ngAriaInvalidReaction(newVal) {
										elem.attr('aria-invalid', !!newVal);
									}
								);
                            }
                        }
                    };
                }
            };
        }]
    ).directive(
        'ngDisabled', ['$aria', function ($aria) {
            return $aria.$$watchExpr('ngDisabled', 'aria-disabled', nodeBlackList, false);
        }]
    ).directive(
        'ngMessages', function () {
            return {
                restrict: 'A',
                require: '?ngMessages',
                link: function (scope, elem, attr) {
					if (attr.hasOwnProperty(ng.aria.ARIA_DISABLE_ATTR)) { return; }

                    if (!elem.attr('aria-live')) {
                        elem.attr('aria-live', 'assertive');
                    }
                }
            };
        }
    ).directive(
        'ngClick', ['$aria', '$parse', function ($aria, $parse) {
            return {
                restrict: 'A',
                compile: function (elem, attr) {

					if (attr.hasOwnProperty(ng.aria.ARIA_DISABLE_ATTR)) { return; }

                    var fn = $parse(attr.ngClick);

                    return function (scope, elem, attr) {

                        if (!isNodeOneOf(elem, nodeBlackList)) {

                            if ($aria.config('bindRoleForClick') && !elem.attr('role')) {
                                elem.attr('role', 'button');
                            }

                            if ($aria.config('tabindex') && !elem.attr('tabindex')) {
                                elem.attr('tabindex', 0);
                            }

                            if ($aria.config('bindKeydown') && !attr.ngKeydown && !attr.ngKeypress && !attr.ngKeyup) {
                                elem.on('keydown', function (event) {
                                    var keyCode = event.which || event.keyCode;
                                    if (keyCode === 32 || keyCode === 13) {
                                        scope.$apply(callback);
                                    }

                                    function callback() {
                                        fn(scope, {
                                            $event: event
                                        });
                                    }
                                });
                            }
                        }
                    };
                }
            };
        }]
    ).directive(
        'ngDblclick', ['$aria', function ($aria) {
            return function (scope, elem) {
				if (attr.hasOwnProperty(ng.aria.ARIA_DISABLE_ATTR)) { return; }

                if ($aria.config('tabindex') && !elem.attr('tabindex') && !isNodeOneOf(elem, nodeBlackList)) {
                    elem.attr('tabindex', 0);
                }
            };
        }]
    );


}(window, window.angular));
