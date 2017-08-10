
/**
 * @ngdoc module
 * @name material.components.tooltip
 */

/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false,
    MutationObserver: false
*/
msos.provide("ng.material.v111.ui.tooltip");
msos.require("ng.material.v111.core");
msos.require("ng.material.v111.core.theming");

ng.material.v111.ui.tooltip.version = new msos.set_version(17, 1, 6);


function MdTooltipDirective($timeout, $window, $document, $mdUtil, $mdTheming, $animate, $interpolate) {
    "use strict";

    var ENTER_EVENTS = 'focus touchstart mouseenter',
        LEAVE_EVENTS = 'blur touchcancel mouseleave',
        SHOW_CLASS = 'md-show',
        TOOLTIP_SHOW_DELAY = 0,
        TOOLTIP_WINDOW_EDGE_SPACE = 8;

    function postLink(scope, element, attr) {

        $mdTheming(element);

        var parent = $mdUtil.getParentWithPointerEvents(element),
            content = angular.element(element[0].getElementsByClassName('md-content')[0]),
            tooltipParent = angular.element(document.body),
            showTimeout = null,
            debouncedOnResize;

        function updateContentOrigin() {
            var origin = 'center top';

            switch (scope.direction) {
                case 'left':
                    origin = 'right center';
                    break;
                case 'right':
                    origin = 'left center';
                    break;
                case 'top':
                    origin = 'center bottom';
                    break;
                case 'bottom':
                    origin = 'center top';
                    break;
            }
            content.css('transform-origin', origin);
        }

        function positionTooltip() {
            var tipRect = $mdUtil.offsetRect(element, tooltipParent),
                parentRect = $mdUtil.offsetRect(parent, tooltipParent),
                newPosition,
                offsetParent = element.prop('offsetParent');

            function getPosition(dir) {

                return dir === 'left' ?
                    {
                        left: parentRect.left - tipRect.width - TOOLTIP_WINDOW_EDGE_SPACE,
                        top: parentRect.top + parentRect.height / 2 - tipRect.height / 2
                    } :
                    dir === 'right' ?
                    {
                        left: parentRect.left + parentRect.width + TOOLTIP_WINDOW_EDGE_SPACE,
                        top: parentRect.top + parentRect.height / 2 - tipRect.height / 2
                    } :
                    dir === 'top' ?
                    {
                        left: parentRect.left + parentRect.width / 2 - tipRect.width / 2,
                        top: parentRect.top - tipRect.height - TOOLTIP_WINDOW_EDGE_SPACE
                    } :
                    {
                        left: parentRect.left + parentRect.width / 2 - tipRect.width / 2,
                        top: parentRect.top + parentRect.height + TOOLTIP_WINDOW_EDGE_SPACE
                    };
            }

            newPosition = getPosition(scope.direction);

            function fitInParent(pos) {
                var newPosition = {
                        left: pos.left,
                        top: pos.top
                    };

                newPosition.left = Math.min(newPosition.left, tooltipParent.prop('scrollWidth') - tipRect.width - TOOLTIP_WINDOW_EDGE_SPACE);
                newPosition.left = Math.max(newPosition.left, TOOLTIP_WINDOW_EDGE_SPACE);
                newPosition.top = Math.min(newPosition.top, tooltipParent.prop('scrollHeight') - tipRect.height - TOOLTIP_WINDOW_EDGE_SPACE);
                newPosition.top = Math.max(newPosition.top, TOOLTIP_WINDOW_EDGE_SPACE);

                return newPosition;
            }

            if (scope.direction) {
                newPosition = fitInParent(newPosition);
            } else if (offsetParent && newPosition.top > offsetParent.scrollHeight - tipRect.height - TOOLTIP_WINDOW_EDGE_SPACE) {
                newPosition = fitInParent(getPosition('top'));
            }

            element.css({
                left: newPosition.left + 'px',
                top: newPosition.top + 'px'
            });
        }

        function updatePosition() {

            if (!scope.visible) { return; }

            updateContentOrigin();
            positionTooltip();
        }

        debouncedOnResize = _.throttle(
            function () {
                updatePosition();
            },
            100
        );

        if ($animate.pin) { $animate.pin(element, parent); }

        function setDefaults() {
            scope.delay = scope.delay || TOOLTIP_SHOW_DELAY;
        }

        function showTooltip() {
            //  Do not show the tooltip if the text is empty.
            if (!element[0].textContent.trim()) { return; }

            // Insert the element and position at top left, so we can get the position
            // and check if we should display it
            element.css({
                top: 0,
                left: 0
            });
            tooltipParent.append(element);

            // Check if we should display it or not.
            // This handles hide-* and show-* along with any user defined css
            if ($mdUtil.hasComputedStyle(element, 'display', 'none')) {
                scope.visible = false;
                element.detach();
                return;
            }

            updatePosition();

            $animate.addClass(content, SHOW_CLASS).then(function () {
                element.addClass(SHOW_CLASS);
            });
        }

        function hideTooltip() {
            $animate.removeClass(content, SHOW_CLASS).then(function () {
                element.removeClass(SHOW_CLASS);
                if (!scope.visible) {
                    element.detach();
                }
            });
        }

        function onVisibleChanged(isVisible) {
            if (isVisible)  { showTooltip(); }
            else            { hideTooltip(); }
        }

        function setVisible(value) {
            // break if passed value is already in queue or there is no queue and passed value is current in the scope
            if ((setVisible.queued && setVisible.value === !!value) || (!setVisible.queued && scope.visible === !!value)) { return; }

            setVisible.value = !!value;

            if (!setVisible.queued) {
                if (value) {
                    setVisible.queued = true;
                    showTimeout = $timeout(function () {
                        scope.visible = setVisible.value;
                        setVisible.queued = false;
                        showTimeout = null;

                        if (!scope.visibleWatcher) {
                            onVisibleChanged(scope.visible);
                        }
                    }, scope.delay);
                } else {
                    $mdUtil.nextTick(function () {
                        scope.visible = false;
                        if (!scope.visibleWatcher) {
                            onVisibleChanged(false);
                        }
                    });
                }
            }
        }

        function addAriaLabel(override) {
            if ((override || !parent.attr('aria-label')) && !parent.text().trim()) {
                var rawText = override || element.text().trim(),
                    interpolatedText = $interpolate(rawText)(parent.scope());
                parent.attr('aria-label', interpolatedText);
            }
        }

        function configureWatchers() {
            var attributeObserver,
                onElementDestroy;

            if (element[0] && $window.hasOwnProperty('MutationObserver')) {
                attributeObserver = new MutationObserver(function (mutations) {
                    mutations
                        .forEach(function (mutation) {
                            if (mutation.attributeName === 'md-visible') {
                                if (!scope.visibleWatcher) {
                                    scope.visibleWatcher = scope.$watch('visible', onVisibleChanged);
                                }
                            }
                            if (mutation.attributeName === 'md-direction') {
                                updatePosition(scope.direction);
                            }
                        });
                });

                attributeObserver.observe(element[0], {
                    attributes: true
                });

                // build watcher only if mdVisible is being used
                if (attr.hasOwnProperty('mdVisible')) {
                    scope.visibleWatcher = scope.$watch('visible', onVisibleChanged);
                }
            } else { // MutationObserver not supported
                scope.visibleWatcher = scope.$watch('visible', onVisibleChanged);
                scope.$watch('direction', updatePosition);
            }

            onElementDestroy = function () {
                scope.$destroy();
            };

            element.one('$destroy', onElementDestroy);
            parent.one('$destroy', onElementDestroy);

            scope.$on(
                '$destroy',
                function () {
                    setVisible(false);
                    element.remove();
                    if (attributeObserver && attributeObserver.disconnect) {
                        attributeObserver.disconnect();
                    }
                }
            );

            if (element.text().indexOf($interpolate.startSymbol()) > -1) {
                scope.$watch(
                    function () {
                        return element.text().trim();
                    },
                    addAriaLabel
                );
            }
        }

        function manipulateElement() {
            element.detach();
            element.attr('role', 'tooltip');
        }

        function bindEvents() {
            var mouseActive = false,
                windowBlurHandler,
                attributeObserver,
                elementFocusedOnWindowBlur = false,
                enterHandler,
                leaveHandler,
                mousedownHandler;

            if (parent[0] && $window.hasOwnProperty('MutationObserver')) {
                // use an mutationObserver to tackle #2602
                attributeObserver = new MutationObserver(
                    function (mutations) {
                        if (mutations.some(function (mutation) { return (mutation.attributeName === 'disabled' && parent[0].disabled); })) {
                            $mdUtil.nextTick(
                                function () {
                                    setVisible(false);
                                }
                            );
                        }
                    }
                );

                attributeObserver.observe(parent[0], {
                    attributes: true
                });
            }

            // Store whether the element was focused when the window loses focus.
            windowBlurHandler = function () {
                elementFocusedOnWindowBlur = document.activeElement === parent[0];
            };

            function windowScrollHandler() {
                setVisible(false);
            }

            angular.element($window)
                .on('blur', windowBlurHandler)
                .on('resize', debouncedOnResize);

            document.addEventListener('scroll', windowScrollHandler, true);

            scope.$on('$destroy', function () {
                angular.element($window)
                    .off('blur', windowBlurHandler)
                    .off('resize', debouncedOnResize);

                parent
                    .off(ENTER_EVENTS, enterHandler)
                    .off(LEAVE_EVENTS, leaveHandler)
                    .off('mousedown', mousedownHandler);

                // Trigger the handler in case any the tooltip was still visible.
                leaveHandler();
                document.removeEventListener('scroll', windowScrollHandler, true);

                if (attributeObserver && attributeObserver.disconnect) {
                    attributeObserver.disconnect();
                }
            });

            enterHandler = function (e) {
                // Prevent the tooltip from showing when the window is receiving focus.
                if (e.type === 'focus' && elementFocusedOnWindowBlur) {
                    elementFocusedOnWindowBlur = false;
                } else if (!scope.visible) {
                    parent.on(LEAVE_EVENTS, leaveHandler);
                    setVisible(true);

                    // If the user is on a touch device, we should bind the tap away after
                    // the `touched` in order to prevent the tooltip being removed immediately.
                    if (e.type === 'touchstart') {
                        parent.one('touchend', function () {
                            $mdUtil.nextTick(function () {
                                $document.one('touchend', leaveHandler);
                            }, false);
                        });
                    }
                }
            };

            leaveHandler = function () {
                var autohide = scope.hasOwnProperty('autohide') ? scope.autohide : attr.hasOwnProperty('mdAutohide');

                if (autohide || mouseActive || $document[0].activeElement !== parent[0]) {
                    // When a show timeout is currently in progress, then we have to cancel it.
                    // Otherwise the tooltip will remain showing without focus or hover.
                    if (showTimeout) {
                        $timeout.cancel(showTimeout);
                        setVisible.queued = false;
                        showTimeout = null;
                    }

                    parent.off(LEAVE_EVENTS, leaveHandler);
                    parent.triggerHandler('blur');
                    setVisible(false);
                }
                mouseActive = false;
            };

            mousedownHandler = function () {
                mouseActive = true;
            };

            // to avoid `synthetic clicks` we listen to mousedown instead of `click`
            parent.on('mousedown', mousedownHandler);
            parent.on(ENTER_EVENTS, enterHandler);
        }

        setDefaults();
        manipulateElement();
        bindEvents();

        updateContentOrigin();

        configureWatchers();
        addAriaLabel();
    }

    return {
        restrict: 'E',
        transclude: true,
        priority: 210, // Before ngAria
        template: '<div class="md-content _md" ng-transclude></div>',
        scope: {
            delay: '=?mdDelay',
            visible: '=?mdVisible',
            autohide: '=?mdAutohide',
            direction: '@?mdDirection' // only expect raw or interpolated string value; not expression
        },
        compile: function (tElement_na, tAttr) {
            if (!tAttr.mdDirection) {
                tAttr.$set('mdDirection', 'bottom');
            }

            return postLink;
        }
    };
}

angular.module(
    'ng.material.v111.ui.tooltip', [
        'ng',
        'ng.material.v111.core',
        'ng.material.v111.core.theming'
    ]
).directive(
    'mdTooltip', ["$timeout", "$window", "$document", "$mdUtil", "$mdTheming", "$animate", "$interpolate", MdTooltipDirective]
);