
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.mobile.ui.switcher");      // Note: 'switch' is a reserved word

ng.mobile.ui.switcher.version = new msos.set_version(18, 9, 2);

// Load Mobile Angular-UI module specific CSS
ng.mobile.ui.switcher.css = new msos.loader();
ng.mobile.ui.switcher.css.load(msos.resource_url('ng', 'mobile/css/ui/switcher.css'));


(function () {
    'use strict';

    angular.module('ng.mobile.ui.switcher', ['ng'])

    .directive('uiSwitch', ['$injector', function ($injector) {
        var $drag = $injector.has('$drag') && $injector.get('$drag');

        return {
            restrict: 'EA',
            scope: {
                model: '=ngModel',
                changeExpr: '@ngChange'
            },
            link: function (scope, elem, attrs) {
                elem.addClass('switch');

                var disabled = attrs.disabled || elem.attr('disabled');

                var unwatchDisabled = scope.$watch(
                    function () {
                        return attrs.disabled || elem.attr('disabled');
                    },
                    function (value) {
                        if (!value || value === 'false' || value === '0') {
                            disabled = false;
                        } else {
                            disabled = true;
                        }
                    }
                );

                var handle = angular.element('<div class="switch-handle"></div>');

                elem.append(handle);

                if (scope.model) {
                    elem.addClass('active');
                }

                elem.addClass('switch-transition-enabled');

                var unwatch = scope.$watch(
						'model',
						function (value) {
							if (value) {
								elem.addClass('active');
							} else {
								elem.removeClass('active');
							}
						}
					);

                var setModel = function (value) {
                    if (!disabled && (value !== scope.model)) {
                        scope.model = value;
                        scope.$apply();
                        if (scope.changeExpr !== null && scope.changeExpr !== undefined) {
                            scope.$parent.$eval(scope.changeExpr);
                        }
                    }
                };

                var clickCb = function () {
                    setModel(!scope.model);
                };

                elem.on('click tap', clickCb);

                var unbind = null;

                // If ng/mobile/gestures is loaded (mobile only)
                if ($drag.TRANSLATE_INSIDE) {
                    unbind = $drag.bind(handle, {
                        transform: $drag.TRANSLATE_INSIDE(elem),
                        start: function () {
                            elem.off('click tap', clickCb);
                        },
                        cancel: function () {
                            handle.removeAttr('style');
                            elem.off('click tap', clickCb);
                            elem.on('click tap', clickCb);
                        },
                        end: function () {
                            var rh = handle[0].getBoundingClientRect();
                            var re = elem[0].getBoundingClientRect();
                            if (rh.left - re.left < rh.width / 3) {
                                setModel(false);
                                handle.removeAttr('style');
                            } else if (re.right - rh.right < rh.width / 3) {
                                setModel(true);
                                handle.removeAttr('style');
                            } else {
                                handle.removeAttr('style');
                            }
                            elem.on('click tap', clickCb);
                        }
                    });
                }

                elem.on('$destroy', function () {
                    if (_.isFunction(unbind)) { unbind(); }
                    unwatchDisabled();
                    unwatch();
                    setModel = unbind = unwatch = unwatchDisabled = clickCb = null;
                });
            }
        };
    }]);
}());