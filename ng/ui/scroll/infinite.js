
msos.provide("ng.ui.scroll.infinite");

ng.ui.scroll.infinite.version = new msos.set_version(18, 2, 6);


angular.module(
	'ng.ui.scroll.infinite',
	['ng']
).value(
	'THROTTLE_MILLISECONDS',
	250			// Using null cause problems, so I pick 250
).directive(
	'infiniteScroll',
	['$rootScope', '$window', '$interval', 'THROTTLE_MILLISECONDS',
	 function($rootScope, $window, $interval, THROTTLE_MILLISECONDS) {
		"use strict";

    return {
        scope: {
            infiniteScroll: '&',
            infiniteScrollContainer: '=',
            infiniteScrollDistance: '=',
            infiniteScrollDisabled: '=',
            infiniteScrollUseDocumentBottom: '=',
            infiniteScrollListenForEvent: '@'
        },

        link: function link(scope, elem, attrs) {
            var windowElement = angular.element($window);

            var scrollDistance = null;
            var scrollEnabled = null;
            var checkWhenEnabled = null;
            var container = null;
            var immediateCheck = true;
            var useDocumentBottom = false;
            var unregisterEventListener = null;
            var checkInterval = false;

            function height(element) {
                var el = element[0] || element;

                if (isNaN(el.offsetHeight)) {
                    return el.document.documentElement.clientHeight;
                }
                return el.offsetHeight;
            }

            function pageYOffset(element) {
                var el = element[0] || element;

                if (isNaN(window.pageYOffset)) {
                    return el.document.documentElement.scrollTop;
                }
                return el.ownerDocument.defaultView.pageYOffset;
            }

            function offsetTop(element) {
                if (!(!element[0].getBoundingClientRect || element.css('none'))) {
                    return element[0].getBoundingClientRect().top + pageYOffset(element);
                }
                return undefined;
            }

            function defaultHandler() {
                var containerBottom = void 0;
                var elementBottom = void 0;

                if (container === windowElement) {
                    containerBottom = height(container) + pageYOffset(container[0].document.documentElement);
                    elementBottom = offsetTop(elem) + height(elem);
                } else {
                    containerBottom = height(container);
                    var containerTopOffset = 0;
                    if (offsetTop(container) !== undefined) {
                        containerTopOffset = offsetTop(container);
                    }
                    elementBottom = offsetTop(elem) - containerTopOffset + height(elem);
                }

                if (useDocumentBottom) {
                    elementBottom = height((elem[0].ownerDocument || elem[0].document).documentElement);
                }

                var remaining = elementBottom - containerBottom;
                var shouldScroll = remaining <= height(container) * scrollDistance + 1;

                if (shouldScroll) {
                    checkWhenEnabled = true;

                    if (scrollEnabled) {
                        if (scope.$$phase || $rootScope.$$phase) {
                            scope.infiniteScroll();
                        } else {
                            scope.$apply(scope.infiniteScroll);
                        }
                    }
                } else {
                    if (checkInterval) {
                        $interval.cancel(checkInterval);
                    }
                    checkWhenEnabled = false;
                }
            }

            function throttle(func, wait) {
                var timeout = null;
                var previous = 0;

                function later() {
                    previous = new Date().getTime();
                    $interval.cancel(timeout);
                    timeout = null;
                    return func.call();
                }

                function throttled() {
                    var now = new Date().getTime();
                    var remaining = wait - (now - previous);
                    if (remaining <= 0) {
                        $interval.cancel(timeout);
                        timeout = null;
                        previous = now;
                        func.call();
                    } else if (!timeout) {
                        timeout = $interval(later, remaining, 1);
                    }
                }

                return throttled;
            }

            var handler = THROTTLE_MILLISECONDS !== null && THROTTLE_MILLISECONDS !== undefined ? throttle(defaultHandler, THROTTLE_MILLISECONDS) : defaultHandler;

            function handleDestroy() {
                container.unbind('scroll', handler);
                if (unregisterEventListener !== null && unregisterEventListener !== undefined) {
                    unregisterEventListener();
                    unregisterEventListener = null;
                }
                if (checkInterval) {
                    $interval.cancel(checkInterval);
                }
            }

            scope.$on('$destroy', handleDestroy);

            function handleInfiniteScrollDistance(v) {
                scrollDistance = parseFloat(v) || 0;
            }

            scope.$watch('infiniteScrollDistance', handleInfiniteScrollDistance);
            // If I don't explicitly call the handler here, tests fail. Don't know why yet.
            handleInfiniteScrollDistance(scope.infiniteScrollDistance);

            function handleInfiniteScrollDisabled(v) {
                scrollEnabled = !v;
                if (scrollEnabled && checkWhenEnabled) {
                    checkWhenEnabled = false;
                    handler();
                }
            }

            scope.$watch('infiniteScrollDisabled', handleInfiniteScrollDisabled);
            // If I don't explicitly call the handler here, tests fail. Don't know why yet.
            handleInfiniteScrollDisabled(scope.infiniteScrollDisabled);

            function handleInfiniteScrollUseDocumentBottom(v) {
                useDocumentBottom = v;
            }

            scope.$watch('infiniteScrollUseDocumentBottom', handleInfiniteScrollUseDocumentBottom);
            handleInfiniteScrollUseDocumentBottom(scope.infiniteScrollUseDocumentBottom);

           function changeContainer(newContainer) {
                if (container !== null && container !== undefined) {
                    container.unbind('scroll', handler);
                }

                container = newContainer;
                if (newContainer !== null && newContainer !== undefined) {
                    container.bind('scroll', handler);
                }
            }

            changeContainer(windowElement);

            if (scope.infiniteScrollListenForEvent) {
                unregisterEventListener = $rootScope.$on(scope.infiniteScrollListenForEvent, handler);
            }

            function handleInfiniteScrollContainer(newContainer) {
 
                if (!(newContainer !== null && newContainer !== undefined) || newContainer.length === 0) {
                    return;
                }

                var newerContainer = void 0;

                if (newContainer.nodeType && newContainer.nodeType === 1) {
                    newerContainer = angular.element(newContainer);
                } else if (typeof newContainer.append === 'function') {
                    newerContainer = angular.element(newContainer[newContainer.length - 1]);
                } else if (typeof newContainer === 'string') {
                    newerContainer = angular.element(document.querySelector(newContainer));
                } else {
                    newerContainer = newContainer;
                }

                if (newerContainer === null || newerContainer === undefined) {
                    throw new Error('invalid infinite-scroll-container attribute.');
                }
                changeContainer(newerContainer);
            }

            scope.$watch('infiniteScrollContainer', handleInfiniteScrollContainer);
            handleInfiniteScrollContainer(scope.infiniteScrollContainer || []);

            // infinite-scroll-parent establishes this element's parent as the
            // container infinitely scrolled instead of the whole window.
            if (attrs.infiniteScrollParent !== null && attrs.infiniteScrollParent !== undefined) {
                changeContainer(angular.element(elem.parent()));
            }

            // infinte-scoll-immediate-check sets whether or not run the
            // expression passed on infinite-scroll for the first time when the
            // directive first loads, before any actual scroll.
            if (attrs.infiniteScrollImmediateCheck !== null && attrs.infiniteScrollImmediateCheck !== undefined) {
                immediateCheck = scope.$eval(attrs.infiniteScrollImmediateCheck);
            }

            function intervalCheck() {
                if (immediateCheck) {
                    handler();
                }
                return $interval.cancel(checkInterval);
            }

            checkInterval = $interval(intervalCheck);
            return checkInterval;
        }
    };
}]);
