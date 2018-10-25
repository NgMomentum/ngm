
/**
 * @ngdoc module
 * @name material.components.tooltip
 */

/*global
    msos: false,
    angular: false,
    ng: false,
    MutationObserver: false
*/

msos.provide("ng.material.ui.tooltip");
msos.require("ng.material.ui.panel");

ng.material.ui.tooltip.version = new msos.set_version(18, 5, 19);

// Load AngularJS-Material module specific CSS
ng.material.ui.tooltip.css = new msos.loader();
ng.material.ui.tooltip.css.load(msos.resource_url('ng', 'material/css/ui/tooltip.css'));


function MdTooltipDirective($timeout, $window, $document, $interpolate, $mdUtil, $mdPanel, $$mdTooltipRegistry) {
    "use strict";

    var ENTER_EVENTS = 'focus touchstart mouseenter',
        LEAVE_EVENTS = 'blur touchcancel mouseleave',
        TOOLTIP_DEFAULT_Z_INDEX = 100,
        TOOLTIP_DEFAULT_SHOW_DELAY = 0,
        TOOLTIP_DEFAULT_DIRECTION = 'bottom',
        TOOLTIP_DIRECTIONS = {
            top: {
                x: $mdPanel.xPosition.CENTER,
                y: $mdPanel.yPosition.ABOVE
            },
            right: {
                x: $mdPanel.xPosition.OFFSET_END,
                y: $mdPanel.yPosition.CENTER
            },
            bottom: {
                x: $mdPanel.xPosition.CENTER,
                y: $mdPanel.yPosition.BELOW
            },
            left: {
                x: $mdPanel.xPosition.OFFSET_START,
                y: $mdPanel.yPosition.CENTER
            }
        };

	function linkFunc(scope, element, attr) {
		// Set constants.
		var tooltipId = 'md-tooltip-' + $mdUtil.nextUid(),
			parent = $mdUtil.getParentWithPointerEvents(element),
			debouncedOnResize = _.throttle(updatePosition, 100),
			mouseActive = false,
			origin,
			position,
			panelPosition,
			panelRef,
			autohide,
			showTimeout,
			elementFocusedOnWindowBlur = null;

        function setDefaults() {
            scope.mdZIndex = scope.mdZIndex || TOOLTIP_DEFAULT_Z_INDEX;
            scope.mdDelay = scope.mdDelay || TOOLTIP_DEFAULT_SHOW_DELAY;

            if (!TOOLTIP_DIRECTIONS[scope.mdDirection]) {
                scope.mdDirection = TOOLTIP_DEFAULT_DIRECTION;
            }
        }

        function addAriaLabel(labelText) {
            var interpolatedText = labelText || $interpolate(element.text().trim())(scope.$parent);

            if ((!parent.attr('aria-label') && !parent.attr('aria-labelledby')) || parent.attr('md-labeled-by-tooltip')) {
                parent.attr('aria-label', interpolatedText);

                if (!parent.attr('md-labeled-by-tooltip')) {
                    parent.attr('md-labeled-by-tooltip', tooltipId);
                }
            }
        }

        function updatePosition() {
            setDefaults();

            if (panelRef && panelRef.panelEl) { panelRef.panelEl.removeClass(origin); }

            origin = 'md-origin-' + scope.mdDirection;

            position = TOOLTIP_DIRECTIONS[scope.mdDirection];

            panelPosition = $mdPanel.newPanelPosition()
                .relativeTo(parent)
                .addPanelPosition(position.x, position.y);

            if (panelRef && panelRef.panelEl) {
                panelRef.panelEl.addClass(origin);
                panelRef.updatePosition(panelPosition);
            }
        }

        function setVisible(value) {

            if (setVisible.queued && setVisible.value === Boolean(value) || !setVisible.queued && scope.mdVisible === Boolean(value)) {
                return;
            }

            setVisible.value = Boolean(value);

            if (!setVisible.queued) {
                if (value) {

                    setVisible.queued = true;

                    showTimeout = $timeout(
						function ng_md_ui_tooltip_link_setvis_to() {
							scope.mdVisible = setVisible.value;
							setVisible.queued = false;
							showTimeout = null;

							if (!scope.visibleWatcher) {
								onVisibleChanged(scope.mdVisible);
							}
						},
						scope.mdDelay,
						false
					);

                } else {
                    $mdUtil.nextTick(
						function () {
							scope.mdVisible = false;

							if (!scope.visibleWatcher) {
								onVisibleChanged(false);
							}
						},
						false	// nextTick was undefined (default true)
					);
                }
            }
        }

        function bindEvents() {
			var attributeObserver;

            if (parent[0] && 'MutationObserver' in $window) {
                attributeObserver = new MutationObserver(
					function (mutations) {
						if (isDisabledMutation(mutations)) {
							$mdUtil.nextTick(
								function () { setVisible(false); },
								false	// nextTick was undefined (default true)
							);
						}
					}
				);

                attributeObserver.observe(
					parent[0],
					{ attributes: true }
				);
            }

            elementFocusedOnWindowBlur = false;

            $$mdTooltipRegistry.register('scroll', windowScrollEventHandler, true);
            $$mdTooltipRegistry.register('blur', windowBlurEventHandler);
            $$mdTooltipRegistry.register('resize', debouncedOnResize);

            scope.$on('$destroy', onDestroy);

            parent.on('mousedown', mousedownEventHandler);
            parent.on(ENTER_EVENTS, enterEventHandler);

            function isDisabledMutation(mutations) {
                mutations.some(
					function (mutation) {
						return mutation.attributeName === 'disabled' && parent[0].disabled;
					}
				);

                return false;
            }

            function windowScrollEventHandler() {
                setVisible(false);
            }

            function windowBlurEventHandler() {
                elementFocusedOnWindowBlur = document.activeElement === parent[0];
            }

            function enterEventHandler($event) {
                if ($event.type === 'focus' && elementFocusedOnWindowBlur) {
                    elementFocusedOnWindowBlur = false;
                } else if (!scope.mdVisible) {

                    parent.on(LEAVE_EVENTS, leaveEventHandler);
                    setVisible(true);

                    if ($event.type === 'touchstart') {
                        parent.one(
							'touchend',
							function () {
								$mdUtil.nextTick(
									function () {
										$document.one('touchend', leaveEventHandler);
									},
									false
								);
							}
						);
                    }
                }
            }

            function leaveEventHandler() {
                autohide = scope.hasOwnProperty('mdAutohide') ? scope.mdAutohide : attr.hasOwnProperty('mdAutohide');

                if (autohide || mouseActive || $document[0].activeElement !== parent[0]) {
                    if (showTimeout) {
                        $timeout.cancel(showTimeout);
                        setVisible.queued = false;
                        showTimeout = null;
                    }

                    parent.off(LEAVE_EVENTS, leaveEventHandler);
                    parent.triggerHandler('blur');
                    setVisible(false);
                }

                mouseActive = false;
            }

            function mousedownEventHandler() {
                mouseActive = true;
            }

            function onDestroy() {

                $$mdTooltipRegistry.deregister('scroll', windowScrollEventHandler, true);
                $$mdTooltipRegistry.deregister('blur', windowBlurEventHandler);
                $$mdTooltipRegistry.deregister('resize', debouncedOnResize);

                parent
                    .off(ENTER_EVENTS, enterEventHandler)
                    .off(LEAVE_EVENTS, leaveEventHandler)
                    .off('mousedown', mousedownEventHandler);

                leaveEventHandler();

				if (attributeObserver) {
					attributeObserver.disconnect();
				}
            }
        }

        function showTooltip() {
			var attachTo,
				panelAnimation,
				panelConfig = null;

            // Do not show the tooltip if the text is empty.
            if (!element[0].textContent.trim()) {
                throw new Error('Text for the tooltip has not been provided. ' +
                    'Please include text within the mdTooltip element.');
            }

            if (!panelRef) {

                attachTo = angular.element(document.body);
                panelAnimation = $mdPanel.newPanelAnimation()
                    .openFrom(parent)
                    .closeTo(parent)
                    .withAnimation({ open: 'md-show', close: 'md-hide' });

                panelConfig = {
                    id: tooltipId,
                    attachTo: attachTo,
                    contentElement: element,
                    propagateContainerEvents: true,
                    panelClass: 'md-tooltip',
                    animation: panelAnimation,
                    position: panelPosition,
                    zIndex: scope.mdZIndex,
                    focusOnOpen: false,
                    onDomAdded: function () { panelRef.panelEl.addClass(origin); }
                };

                panelRef = $mdPanel.create(panelConfig);
            }

            panelRef.open().then(
				function () { panelRef.panelEl.attr('role', 'tooltip'); }
			);
        }

        function hideTooltip() {
			if (panelRef) { panelRef.close(); }
        }

        function onVisibleChanged(isVisible) {
			if (isVisible) { showTooltip(); }
			else { hideTooltip(); }
        }

        function configureWatchers() {
			var attributeObserver;

            if (element[0] && 'MutationObserver' in $window) {
                attributeObserver = new MutationObserver(
					function (mutations) {
						mutations.forEach(
							function (mutation) {
								if (mutation.attributeName === 'md-visible' && !scope.visibleWatcher) {
									scope.visibleWatcher = scope.$watch(
										'mdVisible',
										onVisibleChanged
									);
								}
							}
						);
					}
				);

                attributeObserver.observe(
					element[0],
					{ attributes: true }
				);

                // Build watcher only if mdVisible is being used.
                if (attr.hasOwnProperty('mdVisible')) {
                    scope.visibleWatcher = scope.$watch(
						'mdVisible',
                        onVisibleChanged
					);
                }
            } else {
                // MutationObserver not supported
                scope.visibleWatcher = scope.$watch(
					'mdVisible',
					onVisibleChanged
				);
            }

            scope.$watch('mdDirection', updatePosition);

            element.one('$destroy', onElementDestroy);
             parent.one('$destroy', onElementDestroy);

            scope.$on(
				'$destroy',
				function ng_md_ui_tooltip_link_watchers_on() {

					setVisible(false);

					if (panelRef) { panelRef.destroy(); }
					if (attributeObserver) { attributeObserver.disconnect(); }

					element.remove();
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

            function onElementDestroy() {
                scope.$destroy();
            }
        }

		setDefaults();
		addAriaLabel();

		element.detach();

		updatePosition();
		bindEvents();
		configureWatchers();
    }

    return {
        restrict: 'E',
        priority: 210, // Before ngAria
        scope: {
            mdZIndex: '=?mdZIndex',
            mdDelay: '=?mdDelay',
            mdVisible: '=?mdVisible',
            mdAutohide: '=?mdAutohide',
            mdDirection: '@?mdDirection' // Do not expect expressions.
        },
        link: linkFunc
    };
}

function MdTooltipRegistry() {
	"use strict";

    var listeners = {},
		ngWindow = angular.element(window),
		globalEventHandler = function (event) {
			if (listeners[event.type]) {
				listeners[event.type].forEach(
					function (currentHandler) {
						currentHandler.call(this, event);
					},
					this	// This "this" may be a problem...
				);
			}
		};

    function register(type, handler, useCapture) {
        var handlers = listeners[type] = listeners[type] || [];

        if (!handlers.length) {
			if (useCapture) {
				 window.addEventListener(type, globalEventHandler, true);
			} else {
				ngWindow.on(type, globalEventHandler);
			}
        }

        if (handlers.indexOf(handler) === -1) {
            handlers.push(handler);
        }
    }

    function deregister(type, handler, useCapture) {
        var handlers = listeners[type],
			index = handlers ? handlers.indexOf(handler) : -1;

        if (index > -1) {
            handlers.splice(index, 1);

            if (handlers.length === 0) {
				if (useCapture) {
					window.removeEventListener(type, globalEventHandler, true);
				} else {
					ngWindow.off(type, globalEventHandler);
				}
            }
        }
    }

    return {
        register: register,
        deregister: deregister
    };
}

angular.module(
    'ng.material.ui.tooltip', [
        'ng',
        'ng.material.core',
        'ng.material.ui.panel'
    ]
).directive(
    'mdTooltip', ["$timeout", "$window", "$document", "$interpolate", "$mdUtil", "$mdPanel", "$$mdTooltipRegistry", MdTooltipDirective]
).service(
    '$$mdTooltipRegistry',
    MdTooltipRegistry
);