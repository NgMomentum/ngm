
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.mobile.ui.scrollable");
msos.require("ng.mobile.core");

// This does a basic check. "util.overthrow.support" does a final one below.
if (msos.config.mobile === true
 && msos.config.browser.nativeoverflow === false) {
	msos.require("util.overthrow");
}

ng.mobile.ui.scrollable.version = new msos.set_version(16, 11, 3);

// Load Mobile Angular-UI module specific CSS
ng.mobile.ui.scrollable.css = new msos.loader();
ng.mobile.ui.scrollable.css.load(msos.resource_url('ng', 'mobile/css/ui/scrollable.css'));


(function () {
    'use strict';

    var module = angular.module(
			'ng.mobile.ui.scrollable',
			['ng', 'ng.mobile.core.touchmoveDefaults']
		);

    var getTouchY = function (event) {
        var touches = event.touches && event.touches.length ? event.touches : [event];
        var e = (event.changedTouches && event.changedTouches[0]) ||
            (event.originalEvent && event.originalEvent.changedTouches &&
                event.originalEvent.changedTouches[0]) ||
            touches[0].originalEvent || touches[0];

        return e.clientY;
    };

    module.directive('scrollableContent', function () {
        return {
            restrict: 'C',
            controller: ['$element', '$document', 'allowTouchmoveDefault', function scrollableContent_ctrl($element, $document, allowTouchmoveDefault) {
                var scrollableContent = $element[0];
                var scrollable = $element.parent()[0];

                // Handle nobounce behaviour
                if ('ontouchmove' in $document[0]) {
                    var allowUp;
                    var allowDown;
                    var lastY;
                    var setupTouchstart = function (event) {
                        allowUp = (scrollableContent.scrollTop > 0);

                        allowDown = (scrollableContent.scrollTop < scrollableContent.scrollHeight - scrollableContent.clientHeight);
                        lastY = getTouchY(event);
                    };

                    $element.on('touchstart', setupTouchstart);
                    $element.on('$destroy', function () {
                        $element.off('touchstart');
                    });

                    allowTouchmoveDefault($element, function (event) {
                        var currY = getTouchY(event);
                        var up = (currY > lastY);
                        var down = !up;
                        lastY = currY;
                        return (up && allowUp) || (down && allowDown);
                    });
                }

                this.scrollableContent = scrollableContent;

                this.scrollTo = function (elementOrNumber, marginTop) {
                    marginTop = marginTop || 0;

                    if (angular.isNumber(elementOrNumber)) {
                        scrollableContent.scrollTop = elementOrNumber - marginTop;
                    } else {
                        var target = angular.element(elementOrNumber)[0];
                        if ((!target.offsetParent) || target.offsetParent === scrollable) {
                            scrollableContent.scrollTop = target.offsetTop - marginTop;
                        } else {
                            // recursively subtract offsetTop from marginTop until it reaches scrollable element.
                            this.scrollTo(target.offsetParent, marginTop - target.offsetTop);
                        }
                    }
                };
            }],
            link: function (scope, element) {
				var ovrthrw;

				if (window.util
				 && window.util.overthrow) {
					ovrthrw = window.util.overthrow;
				}

                if (ovrthrw
				 && ovrthrw.support !== 'native') {
                    element.addClass('overthrow');
                    ovrthrw.forget();
                    ovrthrw.set();
                }
            }
        };
    });

    angular.forEach(['input', 'textarea'], function (directiveName) {
        module.directive(directiveName, ['$rootScope', '$timeout', function ($rootScope, $timeout) {
            return {
                require: '?^^scrollableContent',
                link: function (scope, elem, attrs, scrollable) {
                    // Workaround to avoid soft keyboard hiding inputs
                    elem.on('focus', function () {
                        if (scrollable && scrollable.scrollableContent) {
                            var h1 = scrollable.scrollableContent.offsetHeight;
                            $timeout(function () {
                                var h2 = scrollable.scrollableContent.offsetHeight;
                                //
                                // if scrollableContent height is reduced in half second
                                // since an input got focus we assume soft keyboard is showing.
                                //
                                if (h1 > h2) {
                                    var marginTop = 10;
                                    // if scrollableHeader is present increase the marginTop to compensate for scrollableHeader's height.
                                    var scrollableHeader = scrollable.scrollableContent.parentElement.querySelector('.scrollable-header');
                                    if (scrollableHeader) {
                                        marginTop = (scrollableHeader.getBoundingClientRect().bottom - scrollableHeader.getBoundingClientRect().top) + marginTop;
                                    }
                                    scrollable.scrollTo(elem, marginTop);
                                }
                            },
							500,
							false
							);
                        }
                    });
                }
            };
        }]);
    });

    angular.forEach({
            uiScrollTop: function (elem) {
                return elem.scrollTop === 0;
            },
            uiScrollBottom: function (elem) {
                return elem.scrollHeight === elem.scrollTop + elem.clientHeight;
            }
        },
        function (reached, directiveName) {
            module.directive(directiveName, [function () {
                return {
                    restrict: 'A',
                    link: function (scope, elem, attrs) {
                        elem.on('scroll', function () {
                            /* If reached bottom */
                            if (reached(elem[0])) {
                                /* Do what is specified by onScrollBottom */
                                scope.$apply(function () {
                                    scope.$eval(attrs[directiveName]);
                                });
                            }
                        });
                    }
                };
            }]);
        });

    angular.forEach({
            Top: 'scrollableHeader',
            Bottom: 'scrollableFooter'
        },
        function (directiveName, side) {
            module.directive(directiveName, [
                '$window',
                function ($window) {
                    return {
                        restrict: 'C',
                        link: function (scope, element) {
                            var el = element[0],
								parentStyle = element.parent()[0].style;

                            var adjustParentPadding = function () {
                                var styles = $window.getComputedStyle(el),
									margin = parseInt(styles.marginTop, 10) + parseInt(styles.marginBottom, 10);

                                parentStyle['padding' + side] = el.offsetHeight + margin + 'px';
                            };

                            var interval = setInterval(adjustParentPadding, 30);

                            element.on('$destroy', function () {
                                parentStyle['padding' + side] = null;
                                clearInterval(interval);
                                interval = adjustParentPadding = element = null;
                            });
                        }
                    };
                }
            ]);
        });
}());