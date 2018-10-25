
/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.menu");
msos.require("ng.material.core.theming");
msos.require("ng.material.core.interim");
msos.require("ng.material.core.autofocus");
msos.require("ng.material.ui.icon");
msos.require("ng.material.ui.button");
msos.require("ng.material.ui.backdrop");
msos.require("ng.material.ui.whiteframe");

ng.material.ui.menu.version = new msos.set_version(18, 8, 31);

// Load AngularJS-Material module specific CSS
ng.material.ui.menu.css = new msos.loader();
ng.material.ui.menu.css.load(msos.resource_url('ng', 'material/css/ui/menu.css'));


function MenuController($mdMenu, $attrs, $element, $scope, $mdUtil, $timeout, $rootScope, $q) {
	"use strict";

    var prefixer = $mdUtil.prefixer(),
		menuContainer,
		self = this,
		triggerElement,
		openMenuTimeout,
		menuItems,
		deregisterScopeListeners = [];

    this.nestLevel = parseInt($attrs.mdNestLevel, 10) || 0;

    this.init = function init(setMenuContainer, opts) {
		var menuContainerId;

        opts = opts || {};
        menuContainer = setMenuContainer;

        // Default element for ARIA attributes has the ngClick or ngMouseenter expression
        triggerElement = $element[0].querySelector(prefixer.buildSelector(['ng-click', 'ng-mouseenter']));
        triggerElement.setAttribute('aria-expanded', 'false');

        this.isInMenuBar = opts.isInMenuBar;
        this.nestedMenus = $mdUtil.nodesToArray(menuContainer[0].querySelectorAll('.md-nested-menu'));

        menuContainer.on(
			'$mdInterimElementRemove',
			function ng_md_ui_menu_int_el_rm_on() {
				self.isOpen = false;
				$mdUtil.nextTick(
					function () {
						self.onIsOpenChanged(self.isOpen);
					},
					false	// nextTick was undefined (default true)
				);
			}
		);

        $mdUtil.nextTick(
			function () {
				self.onIsOpenChanged(self.isOpen);
			},
			false	// nextTick was undefined (default true)
		);

        menuContainerId = 'menu_container_' + $mdUtil.nextUid();

        menuContainer.attr('id', menuContainerId);
        angular.element(triggerElement).attr({
            'aria-owns': menuContainerId,
            'aria-haspopup': 'true'
        });

        $scope.$on(
			'$destroy',
			angular.bind(
				this,
				function ng_md_ui_menu_scope_on() {
					this.disableHoverListener();
					$mdMenu.destroy();
				}
			)
		);

        menuContainer.on(
			'$destroy',
			function ng_md_ui_menu_container_on() {
				$mdMenu.destroy();
			}
		);
    };

    this.enableHoverListener = function () {
        deregisterScopeListeners.push(
			$rootScope.$on(
				'$mdMenuOpen',
				function ng_md_ui_menu_open_on(event, el) {
					if (menuContainer[0].contains(el[0])) {
						self.currentlyOpenMenu = el.controller('mdMenu');
						self.isAlreadyOpening = false;
						self.currentlyOpenMenu.registerContainerProxy(self.triggerContainerProxy.bind(self));
					}
				}
			)
		);
        deregisterScopeListeners.push(
			$rootScope.$on(
				'$mdMenuClose',
				function ng_md_ui_menu_close_on(event, el) {
					if (menuContainer[0].contains(el[0])) {
						self.currentlyOpenMenu = undefined;
					}
				}
			)
		);

        menuItems = angular.element($mdUtil.nodesToArray(menuContainer[0].children[0].children));
        menuItems.on('mouseenter', self.handleMenuItemHover);
        menuItems.on('mouseleave', self.handleMenuItemMouseLeave);
    };

    this.disableHoverListener = function () {

        while (deregisterScopeListeners.length) {
            deregisterScopeListeners.shift()();
        }

		if (menuItems) {
			menuItems.off('mouseenter', self.handleMenuItemHover);
			menuItems.off('mouseleave', self.handleMenuItemMouseLeave);
		}
    };

    this.handleMenuItemHover = function (event) {

        if (self.isAlreadyOpening) { return; }

        var nestedMenu = (event.target.querySelector('md-menu') || $mdUtil.getClosest(event.target, 'MD-MENU')),
			focusableTarget;

        openMenuTimeout = $timeout(
			function ng_md_ui_menu_item_to() {
				var closeTo;

				if (nestedMenu) {
					nestedMenu = angular.element(nestedMenu).controller('mdMenu');
				}

				if (self.currentlyOpenMenu && self.currentlyOpenMenu != nestedMenu) {

					closeTo = self.nestLevel + 1;

					self.currentlyOpenMenu.close(
						true,
						{ closeTo: closeTo }
					);

					self.isAlreadyOpening = !!nestedMenu;

					if (nestedMenu) {
						nestedMenu.open();
					}

				} else if (nestedMenu && !nestedMenu.isOpen && nestedMenu.open) {

					self.isAlreadyOpening = !!nestedMenu;

					if (nestedMenu) {
						nestedMenu.open();
					}
				}
			},
			nestedMenu ? 100 : 250,
			false
		);

        focusableTarget = event.currentTarget.querySelector('.md-button:not([disabled])');

		if (focusableTarget) {
			focusableTarget.focus();
		}
    };

    this.handleMenuItemMouseLeave = function () {
        if (openMenuTimeout) {
            $timeout.cancel(openMenuTimeout);
            openMenuTimeout = undefined;
        }
    };

    this.open = function openMenu(ev) {

		if (ev) {
			ev.stopPropagation();
			ev.preventDefault();
		}

        if (self.isOpen) { return; }

        self.enableHoverListener();
        self.isOpen = true;

        $mdUtil.nextTick(
			function ng_md_ui_menu_open_nexttick() {
				self.onIsOpenChanged(self.isOpen);
			},
			false	// nextTick was undefined (default true)
		);

        triggerElement = triggerElement || (ev ? ev.target : $element[0]);
        triggerElement.setAttribute('aria-expanded', 'true');

        $scope.$emit('$mdMenuOpen', $element);

        $mdMenu.show(
			{
				scope: $scope,
				mdMenuCtrl: self,
				nestLevel: self.nestLevel,
				element: menuContainer,
				target: triggerElement,
				preserveElement: true,
				parent: 'body'
			}
		).finally(
			function ng_md_ui_menu_show_finally() {
				triggerElement.setAttribute('aria-expanded', 'false');
				self.disableHoverListener();
			}
		);
    };

    this.onIsOpenChanged = function (isOpen) {

        if (isOpen) {
            menuContainer.attr('aria-hidden', 'false');
            $element[0].classList.add('md-open');

            angular.forEach(
				self.nestedMenus,
				function (el) {
					el.classList.remove('md-open');
				}
			);

        } else {
            menuContainer.attr('aria-hidden', 'true');
            $element[0].classList.remove('md-open');
        }

        $scope.$mdMenuIsOpen = self.isOpen;
    };

    this.focusMenuContainer = function focusMenuContainer() {
        var focusTarget = menuContainer[0]
            .querySelector(prefixer.buildSelector(['md-menu-focus-target', 'md-autofocus']));

        if (!focusTarget) {
			focusTarget = menuContainer[0].querySelector('.md-button:not([disabled])');
		}

        focusTarget.focus();
    };

    this.registerContainerProxy = function registerContainerProxy(handler) {
        this.containerProxy = handler;
    };

    this.triggerContainerProxy = function triggerContainerProxy(ev) {
		if (this.containerProxy) {
			this.containerProxy(ev);
		}
    };

    this.destroy = function() {
        return self.isOpen ? $mdMenu.destroy() : $q.when($q.defer('ng_md_menu_destroy_when'), false);
    };

    // Use the $mdMenu interim element service to close the menu contents
    this.close = function closeMenu(skipFocus, closeOpts) {

        if (!self.isOpen) { return; }

        self.isOpen = false;
        $mdUtil.nextTick(
			function () {
				self.onIsOpenChanged(self.isOpen);
			},
			false	// nextTick was undefined (default true)
		);

        var eventDetails = angular.extend(
				{},
				closeOpts,
				{ skipFocus: skipFocus }
			),
			el;

        $scope.$emit('$mdMenuClose', $element, eventDetails);
        $mdMenu.hide(null, closeOpts);

        if (!skipFocus) {
            el = self.restoreFocusTo || $element.find('button')[0];

            if (el instanceof angular.element) { el = el[0]; }
            if (el) { el.focus(); }
        }
    };

    this.positionMode = function positionMode() {
        var attachment = ($attrs.mdPositionMode || 'target').split(' ');

        if (attachment.length === 1) {
            attachment.push(attachment[0]);
        }

        return {
            left: attachment[0],
            top: attachment[1]
        };
    };

    this.offsets = function offsets() {
        var position = ($attrs.mdOffset || '0 0').split(' ').map(parseFloat);
        if (position.length === 2) {
            return {
                left: position[0],
                top: position[1]
            };
        } else if (position.length === 1) {
            return {
                top: position[0],
                left: position[0]
            };
        } else {
            throw Error('Invalid offsets specified. Please follow format <x, y> or <n>');
        }
    };

    $scope.$mdMenu = {
        open: this.open,
        close: this.close
    };
}

function MenuDirective($mdUtil) {
	"use strict";

    var INVALID_PREFIX = 'Invalid HTML for md-menu: ';

    function link(scope, element, attr, ctrls) {
        var mdMenuCtrl = ctrls[0],
			isInMenuBar = !!ctrls[1],
			menuContainer = angular.element('<div class="_md md-open-menu-container md-whiteframe-z2"></div>'),
			menuContents = element.children()[1];

        element.addClass('_md');

        if (!menuContents.hasAttribute('role')) {
            menuContents.setAttribute('role', 'menu');
        }
        menuContainer.append(menuContents);

        element.on(
			'$destroy',
			function () {
				menuContainer.remove();
			}
		);

        element.append(menuContainer);
        menuContainer[0].style.display = 'none';

        mdMenuCtrl.init(
			menuContainer,
			{ isInMenuBar: isInMenuBar }
		);

    }

    function compile(templateElement) {

        templateElement.addClass('md-menu');

        var triggerEl = templateElement.children()[0],
			prefixer = $mdUtil.prefixer(),
			isButtonTrigger,
			nestedMenus,
			nestingDepth;

        if (!prefixer.hasAttribute(triggerEl, 'ng-click')) {
            triggerEl = triggerEl.querySelector(
				prefixer.buildSelector(['ng-click', 'ng-mouseenter'])
			) || triggerEl;
        }

        isButtonTrigger = triggerEl.nodeName === 'MD-BUTTON' || triggerEl.nodeName === 'BUTTON';

        if (triggerEl && isButtonTrigger && !triggerEl.hasAttribute('type')) {
            triggerEl.setAttribute('type', 'button');
        }

        if (!triggerEl) {
            throw Error(INVALID_PREFIX + 'Expected the menu to have a trigger element.');
        }

        if (templateElement.children().length !== 2) {
            throw Error(INVALID_PREFIX + 'Expected two children elements. The second element must have a `md-menu-content` element.');
        }

        if (triggerEl) {
			triggerEl.setAttribute('aria-haspopup', 'true');
		}

        nestedMenus = templateElement[0].querySelectorAll('md-menu');
        nestingDepth = parseInt(templateElement[0].getAttribute('md-nest-level'), 10) || 0;

        if (nestedMenus) {
            angular.forEach(
				$mdUtil.nodesToArray(nestedMenus),
				function (menuEl) {
					if (!menuEl.hasAttribute('md-position-mode')) {
						menuEl.setAttribute('md-position-mode', 'cascade');
					}

					menuEl.classList.add('_md-nested-menu');
					menuEl.setAttribute('md-nest-level', nestingDepth + 1);
				}
			);
        }

        return link;
    }

    return {
        restrict: 'E',
        require: ['mdMenu', '?^mdMenuBar'],
        controller: 'mdMenuCtrl',
        scope: true,
        compile: compile
    };
}

function MenuProvider($$interimElementProvider) {
	"use strict";

	var MENU_EDGE_MARGIN = 8;

	function toNode(el) {
		if (el instanceof angular.element) {
			el = el[0];
		}
		return el;
	}

	function menuDefaultOptions($mdUtil, $$mdAnimate, $mdTheming, $mdConstant, $document, $window, $q, $animateCss, $animate) {

		var prefixer = $mdUtil.prefixer(),
			animator = $$mdAnimate($mdUtil);

		function showBackdrop(scope, element, options) {

			if (options.nestLevel) { return angular.noop; }

			// If we are not within a dialog...
			if (options.disableParentScroll && !$mdUtil.getClosest(options.target, 'MD-DIALOG')) {
				options.restoreScroll = $mdUtil.disableScrollAround(options.element, options.parent);
			} else {
				options.disableParentScroll = false;
			}

			if (options.hasBackdrop) {
				options.backdrop = $mdUtil.createBackdrop(scope, "md-menu-backdrop md-click-catcher");

				$animate.enter(options.backdrop, $document[0].body);
			}

			return function hideBackdrop() {
				if (options.backdrop) options.backdrop.remove();
				if (options.disableParentScroll) options.restoreScroll();
			};
		}

		function detachElement(element, opts) {
			if (!opts.preserveElement) {
				if (toNode(element).parentNode === toNode(opts.parent)) {
					toNode(opts.parent).removeChild(toNode(element));
				}
			} else {
				toNode(element).style.display = 'none';
			}
		}

		function onRemove(scope, element, opts) {

			opts.cleanupInteraction();
			opts.cleanupBackdrop();
			opts.cleanupResizing();
			opts.hideBackdrop();

			// Before the menu is closing remove the clickable class.
			element.removeClass('md-clickable');

			function animateRemoval() {
				return $animateCss(element, {
					addClass: 'md-leave'
				}).start();
			}

			function detachAndClean() {
				element.removeClass('md-active');
				detachElement(element, opts);
				opts.alreadyOpen = false;
			}

			return (opts.$destroy === true) ? detachAndClean() : animateRemoval().then(detachAndClean);
		}

		function attemptFocus(el) {
			if (el && el.getAttribute('tabindex') != -1) {
				el.focus();
				return ($document[0].activeElement == el);
			}
		}

		function focusMenuItem(e, menuEl, opts, direction) {
			var currentItem = $mdUtil.getClosest(e.target, 'MD-MENU-ITEM'),
				items = $mdUtil.nodesToArray(menuEl[0].children),
				currentIndex = items.indexOf(currentItem),
				i = 0,
				focusTarget,
				didFocus;

			for (i = currentIndex + direction; i >= 0 && i < items.length; i = i + direction) {

				focusTarget = items[i].querySelector('.md-button');
				didFocus = attemptFocus(focusTarget);

				if (didFocus) { break; }
			}

			return didFocus;
		}

		function calculateMenuPosition(el, opts) {

			var containerNode = el[0],
				openMenuNode = el[0].firstElementChild,
				openMenuNodeRect = openMenuNode.getBoundingClientRect(),
				boundryNode = $document[0].body,
				boundryNodeRect = boundryNode.getBoundingClientRect(),
				menuStyle = $window.getComputedStyle(openMenuNode),
				originNode = opts.target[0].querySelector(prefixer.buildSelector('md-menu-origin')) || opts.target[0],
				originNodeRect = originNode.getBoundingClientRect(),
				bounds = {
					left: boundryNodeRect.left + MENU_EDGE_MARGIN,
					top: Math.max(boundryNodeRect.top, 0) + MENU_EDGE_MARGIN,
					bottom: Math.max(boundryNodeRect.bottom, Math.max(boundryNodeRect.top, 0) + boundryNodeRect.height) - MENU_EDGE_MARGIN,
					right: boundryNodeRect.right - MENU_EDGE_MARGIN
				},
				alignTarget,
				alignTargetRect = {
					top: 0,
					left: 0,
					right: 0,
					bottom: 0
				},
				existingOffsets = {
					top: 0,
					left: 0,
					right: 0,
					bottom: 0
				},
				positionMode = opts.mdMenuCtrl.positionMode(),
				position = {},
				transformOrigin = 'top ',
				rtl,
				offsets,
				scaleX,
				scaleY;

			function firstVisibleChild() {
				for (var i = 0; i < openMenuNode.children.length; ++i) {
					if ($window.getComputedStyle(openMenuNode.children[i]).display != 'none') {
						return openMenuNode.children[i];
					}
				}
			}

			if (positionMode.top == 'target' || positionMode.left == 'target' || positionMode.left == 'target-right') {

				alignTarget = firstVisibleChild();

				if (alignTarget) {
					// TODO: Allow centering on an arbitrary node, for now center on first menu-item's child
					alignTarget = alignTarget.firstElementChild || alignTarget;
					alignTarget = alignTarget.querySelector(prefixer.buildSelector('md-menu-align-target')) || alignTarget;
					alignTargetRect = alignTarget.getBoundingClientRect();

					existingOffsets = {
						top: parseFloat(containerNode.style.top || 0),
						left: parseFloat(containerNode.style.left || 0)
					};
				}
			}

			switch (positionMode.top) {
				case 'target':
					position.top = existingOffsets.top + originNodeRect.top - alignTargetRect.top;
					break;
				case 'cascade':
					position.top = originNodeRect.top - parseFloat(menuStyle.paddingTop) - originNode.style.top;
					break;
				case 'bottom':
					position.top = originNodeRect.top + originNodeRect.height;
					break;
				default:
					throw new Error('Invalid target mode "' + positionMode.top + '" specified for md-menu on Y axis.');
			}

			rtl = ($mdUtil.bidi() == 'rtl');

			switch (positionMode.left) {
				case 'target':
					position.left = existingOffsets.left + originNodeRect.left - alignTargetRect.left;
					transformOrigin += rtl ? 'right' : 'left';
					break;
				case 'target-left':
					position.left = originNodeRect.left;
					transformOrigin += 'left';
					break;
				case 'target-right':
					position.left = originNodeRect.right - openMenuNodeRect.width + (openMenuNodeRect.right - alignTargetRect.right);
					transformOrigin += 'right';
					break;
				case 'cascade':
					var willFitRight = rtl ? (originNodeRect.left - openMenuNodeRect.width) < bounds.left : (originNodeRect.right + openMenuNodeRect.width) < bounds.right;
					position.left = willFitRight ? originNodeRect.right - originNode.style.left : originNodeRect.left - originNode.style.left - openMenuNodeRect.width;
					transformOrigin += willFitRight ? 'left' : 'right';
					break;
				case 'right':
					if (rtl) {
						position.left = originNodeRect.right - originNodeRect.width;
						transformOrigin += 'left';
					} else {
						position.left = originNodeRect.right - openMenuNodeRect.width;
						transformOrigin += 'right';
					}
					break;
				case 'left':
					if (rtl) {
						position.left = originNodeRect.right - openMenuNodeRect.width;
						transformOrigin += 'right';
					} else {
						position.left = originNodeRect.left;
						transformOrigin += 'left';
					}
					break;
				default:
					throw new Error('Invalid target mode "' + positionMode.left + '" specified for md-menu on X axis.');
			}

			offsets = opts.mdMenuCtrl.offsets();

			position.top += offsets.top;
			position.left += offsets.left;

			function clamp(pos) {
				pos.top = Math.max(Math.min(pos.top, bounds.bottom - containerNode.offsetHeight), bounds.top);
				pos.left = Math.max(Math.min(pos.left, bounds.right - containerNode.offsetWidth), bounds.left);
			}

			clamp(position);

			scaleX = Math.round(100 * Math.min(originNodeRect.width / containerNode.offsetWidth, 1.0)) / 100;
			scaleY = Math.round(100 * Math.min(originNodeRect.height / containerNode.offsetHeight, 1.0)) / 100;

			return {
				top: Math.round(position.top),
				left: Math.round(position.left),
				// Animate a scale out if we aren't just repositioning
				transform: !opts.alreadyOpen ? $mdUtil.supplant('scale({0},{1})', [scaleX, scaleY]) : undefined,
				transformOrigin: transformOrigin
			};
		}

		function onShow(scope, element, opts) {

			sanitizeAndConfigure(opts);

			if (opts.menuContentEl[0]) {
				// Inherit the theme from the target element.
				$mdTheming.inherit(opts.menuContentEl, opts.target);
			} else {
				msos.console.warn(
					'ng.material.ui.menu - onShow -> ' +
					'Menu elements must contain a `md-menu-content` element,' +
					'otherwise interactivity will not work properly:',
					element
				);
			}

			function startRepositioningOnResize() {

				var repositionMenu = (
						function (target, options) {
							return _.throttle(
									function () {
										if (opts.isRemoved) { return; }

										var position = calculateMenuPosition(target, options);

										target.css(animator.toCss(position));
									},
									100
								);
						}(element, opts));

				$window.addEventListener('resize', repositionMenu);
				$window.addEventListener('orientationchange', repositionMenu);

				return function stopRepositioningOnResize() {

					// Disable resizing handlers
					$window.removeEventListener('resize', repositionMenu);
					$window.removeEventListener('orientationchange', repositionMenu);

				};
			}

			// Register various listeners to move menu on resize/orientation change
			opts.cleanupResizing = startRepositioningOnResize();
			opts.hideBackdrop = showBackdrop(scope, element, opts);

			function showMenu() {

				opts.parent.append(element);
				element[0].style.display = '';

				return $q(
						function (resolve) {
							var position = calculateMenuPosition(element, opts);

							element.removeClass('md-leave');

							$animateCss(
								element,
								{
									addClass: 'md-active',
									from: animator.toCss(position),
									to: animator.toCss({ transform: '' })
								}
							).start().then(resolve);

						},
						'ng_material_ui_menu_showMenu'
					);
			}

			function sanitizeAndConfigure() {

				if (!opts.target) {
					throw Error(
						'$mdMenu.show() expected a target to animate from in options.target'
					);
				}

				angular.extend(
					opts,
					{
						alreadyOpen: false,
						isRemoved: false,
						target: angular.element(opts.target), //make sure it's not a naked dom node
						parent: angular.element(opts.parent),
						menuContentEl: angular.element(element[0].querySelector('md-menu-content'))
					}
				);
			}

			function onBackdropClick(event) {

				event.preventDefault();
				event.stopPropagation();

				scope.$apply(
					function () {
						opts.mdMenuCtrl.close(
							true,
							{ closeAll: true }
						);
					}
				);
			}

			function setupBackdrop() {

				if (!opts.backdrop) { return angular.noop; }

				opts.backdrop.on('click', onBackdropClick);

				return function () {
					opts.backdrop.off('click', onBackdropClick);
				};
			}

			function activateInteraction() {

				if (!opts.menuContentEl[0]) { return angular.noop; }

				opts.menuContentEl.on('keydown', onMenuKeyDown);
				opts.menuContentEl[0].addEventListener('click', captureClickListener, true);

				// kick off initial focus in the menu on the first enabled element
				var focusTarget = opts.menuContentEl[0]
						.querySelector(prefixer.buildSelector(['md-menu-focus-target', 'md-autofocus'])),
					childrenLen,
					childIndex = 0,
					child;

				if (!focusTarget) {

					childrenLen = opts.menuContentEl[0].children.length;

					for (childIndex = 0; childIndex < childrenLen; childIndex += 1) {

						child = opts.menuContentEl[0].children[childIndex];

						focusTarget = child.querySelector('.md-button:not([disabled])');
	
						if (focusTarget) {
							break;
						}

						if (child.firstElementChild && !child.firstElementChild.disabled) {
							focusTarget = child.firstElementChild;
							break;
						}
					}
				}

				if (focusTarget && focusTarget.focus) {
					focusTarget.focus();
				} 

				function onMenuKeyDown(ev) {
					var handled,
						parentMenu;

					switch (ev.keyCode) {
						case $mdConstant.KEY_CODE.ESCAPE:
							opts.mdMenuCtrl.close(false, {
								closeAll: true
							});
							handled = true;
							break;
						case $mdConstant.KEY_CODE.TAB:
							opts.mdMenuCtrl.close(false, {
								closeAll: true
							});
							// Don't prevent default or stop propagation on this event as we want tab
							// to move the focus to the next focusable element on the page.
							handled = false;
							break;
						case $mdConstant.KEY_CODE.UP_ARROW:
							if (!focusMenuItem(ev, opts.menuContentEl, opts, -1) && !opts.nestLevel) {
								opts.mdMenuCtrl.triggerContainerProxy(ev);
							}
							handled = true;
							break;
						case $mdConstant.KEY_CODE.DOWN_ARROW:
							if (!focusMenuItem(ev, opts.menuContentEl, opts, 1) && !opts.nestLevel) {
								opts.mdMenuCtrl.triggerContainerProxy(ev);
							}
							handled = true;
							break;
						case $mdConstant.KEY_CODE.LEFT_ARROW:
							if (opts.nestLevel) {
								opts.mdMenuCtrl.close();
							} else {
								opts.mdMenuCtrl.triggerContainerProxy(ev);
							}
							handled = true;
							break;
						case $mdConstant.KEY_CODE.RIGHT_ARROW:
							parentMenu = $mdUtil.getClosest(ev.target, 'MD-MENU');

							if (parentMenu && parentMenu != opts.parent[0]) {
								ev.target.click();
							} else {
								opts.mdMenuCtrl.triggerContainerProxy(ev);
							}
							handled = true;
							break;
					}

					if (handled) {
						ev.preventDefault();
						ev.stopImmediatePropagation();
					}
				}

				// Close menu on menu item click, if said menu-item is not disabled
				function captureClickListener(e) {
					var target = e.target;

					do {
						if (target == opts.menuContentEl[0]) { return; }

						if ((hasAnyAttribute(target, ['ng-click', 'ng-href', 'ui-sref']) ||
								target.nodeName == 'BUTTON' || target.nodeName == 'MD-BUTTON') && !hasAnyAttribute(target, ['md-prevent-menu-close'])) {
							var closestMenu = $mdUtil.getClosest(target, 'MD-MENU');
							if (!target.hasAttribute('disabled') && (!closestMenu || closestMenu == opts.parent[0])) {
								close();
							}
							break;
						}

						// Get ready for next iteration
						target = target.parentNode;

					} while (target);

					function close() {
						scope.$apply(function() {
							opts.mdMenuCtrl.close(true, {
								closeAll: true
							});
						});
					}

					function hasAnyAttribute(target, attrs) {
						var i = 0,
							attr;

						if (!target) { return false; }

						for (i = 0; i < attrs.length; i += 1) {
							attr = attrs[i];

							if (prefixer.hasAttribute(target, attr)) {
								return true;
							}
						}

						return false;
					}
				}

				return function cleanupInteraction() {
					opts.menuContentEl.off('keydown', onMenuKeyDown);
					opts.menuContentEl[0].removeEventListener('click', captureClickListener, true);
				};
			}

			return showMenu().then(
					function (response) {

						opts.alreadyOpen = true;
						opts.cleanupInteraction = activateInteraction();
						opts.cleanupBackdrop = setupBackdrop();

						// Since the menu finished its animation, mark the menu as clickable.
						element.addClass('md-clickable');

						return response;
					}
				);
		}

		return {
			parent: 'body',
			onShow: onShow,
			onRemove: onRemove,
			hasBackdrop: true,
			disableParentScroll: true,
			skipCompile: true,
			preserveScope: true,
			multiple: true,
			themable: true
		};
	}

	menuDefaultOptions.$inject = [
		'$mdUtil', '$$mdAnimate', '$mdTheming', '$mdConstant', '$document', '$window', '$q', '$animateCss', '$animate'
	];

	return $$interimElementProvider('$mdMenu').setDefaults({
			methods: ['target'],
			options: menuDefaultOptions
		});
}

function MenuItemController($scope, $element, $attrs) {
	"use strict";

	this.$element = $element;
	this.$attrs = $attrs;
	this.$scope = $scope;
}

MenuItemController.prototype.init = function (ngModel) {
	"use strict";

	var $element = this.$element,
		$attrs = this.$attrs;

	this.ngModel = ngModel;

	if ($attrs.type == 'checkbox' || $attrs.type == 'radio') {
		this.mode = $attrs.type;
		this.iconEl = $element[0].children[0];
		this.buttonEl = $element[0].children[1];
		if (ngModel) {
			// Clear ngAria set attributes
			this.initClickListeners();
		}
	}
};

MenuItemController.prototype.clearNgAria = function () {
	"use strict";

	var el = this.$element[0],
		clearAttrs = ['role', 'tabindex', 'aria-invalid', 'aria-checked'];

	angular.forEach(
		clearAttrs,
		function (attr) {
			el.removeAttribute(attr);
		}
	);
};

MenuItemController.prototype.initClickListeners = function () {
	"use strict";

	var self = this,
		ngModel = this.ngModel,
		$scope = this.$scope,
		$attrs = this.$attrs,
		mode = this.mode,
		icon = this.iconEl,
		button = angular.element(this.buttonEl),
		handleClick;

	this.handleClick = angular.bind(this, this.handleClick);

	handleClick = this.handleClick;

	$attrs.$observe('disabled', setDisabled);
	setDisabled($attrs.disabled);

	ngModel.$render = function render() {
		self.clearNgAria();

		if (isSelected()) {
			icon.style.display = '';
			button.attr('aria-checked', 'true');
		} else {
			icon.style.display = 'none';
			button.attr('aria-checked', 'false');
		}
	};

	$scope.$$postDigest(ngModel.$render);

	function isSelected() {
		if (mode == 'radio') {
			var val = $attrs.ngValue ? $scope.$eval($attrs.ngValue) : $attrs.value;
			return ngModel.$modelValue == val;
		} else {
			return ngModel.$modelValue;
		}
	}

	function setDisabled(disabled) {
		if (disabled) {
			button.off('click', handleClick);
		} else {
			button.on('click', handleClick);
		}
	}
};

MenuItemController.prototype.handleClick = function () {
	"use strict";

	var mode = this.mode,
		ngModel = this.ngModel,
		$attrs = this.$attrs,
		newVal;

	if (mode == 'checkbox') {
		newVal = !ngModel.$modelValue;
	} else if (mode == 'radio') {
		newVal = $attrs.ngValue ? this.$scope.$eval($attrs.ngValue) : $attrs.value;
	}

	ngModel.$setViewValue(newVal);
	ngModel.$render();
};

function MenuItemDirective($mdUtil, $mdConstant, $$mdSvgRegistry) {
	"use strict";

	return {
		controller: 'MenuItemController',
		require: ['mdMenuItem', '?ngModel'],
		priority: $mdConstant.BEFORE_NG_ARIA,
		compile: function (templateEl, templateAttrs) {
			var type = templateAttrs.type,
				inMenuBarClass = 'md-in-menu-bar',
				text,
				buttonEl,
				iconTemplate;

			// Note: This allows us to show the `check` icon for the md-menu-bar items.
			// The `md-in-menu-bar` class is set by the mdMenuBar directive.
			if ((type == 'checkbox' || type == 'radio') && templateEl.hasClass(inMenuBarClass)) {

				text = templateEl[0].textContent;
				buttonEl = angular.element('<md-button type="button"></md-button>');
				iconTemplate = '<md-icon md-svg-src="' + $$mdSvgRegistry.mdChecked + '"></md-icon>';

				buttonEl.html(text);
				buttonEl.attr('tabindex', '0');

				templateEl.html('');
				templateEl.append(angular.element(iconTemplate));
				templateEl.append(buttonEl);
				templateEl.addClass('md-indent').removeClass(inMenuBarClass);

				setDefault('role', type == 'checkbox' ? 'menuitemcheckbox' : 'menuitemradio', buttonEl);
				moveAttrToButton('ng-disabled');

			} else {
				setDefault('role', 'menuitem', templateEl[0].querySelector('md-button, button, a'));
			}

			function setDefault(attr, val, el) {
				el = el || templateEl;
				if (el instanceof angular.element) {
					el = el[0];
				}
				if (!el.hasAttribute(attr)) {
					el.setAttribute(attr, val);
				}
			}

			function moveAttrToButton(attribute) {
				var attributes = $mdUtil.prefixer(attribute),
					val;

				angular.forEach(
					attributes,
					function (attr) {
						if (templateEl[0].hasAttribute(attr)) {
							val = templateEl[0].getAttribute(attr);
							buttonEl[0].setAttribute(attr, val);
							templateEl[0].removeAttribute(attr);
						}
					}
				);
			}

			return function (scope, el, attrs, ctrls) {
				var ctrl = ctrls[0];
				var ngModel = ctrls[1];
				ctrl.init(ngModel);
			};
		}
	};
}

function MenuDividerDirective() {
	"use strict";

	return {
		restrict: 'E',
		compile: function (templateEl, templateAttrs) {
			if (!templateAttrs.role) {
				templateEl[0].setAttribute('role', 'separator');
			}
		}
	};
}

function MenuBarController($scope, $rootScope, $element, $attrs, $mdConstant, $document, $mdUtil, $timeout) {
	"use strict";

	this.$element = $element;
	this.$attrs = $attrs;
	this.$mdConstant = $mdConstant;
	this.$mdUtil = $mdUtil;
	this.$document = $document;
	this.$scope = $scope;
	this.$rootScope = $rootScope;
	this.$timeout = $timeout;

	var self = this,
		BOUND_MENU_METHODS = ['handleKeyDown', 'handleMenuHover', 'scheduleOpenHoveredMenu', 'cancelScheduledOpen'];
	
	angular.forEach(
		BOUND_MENU_METHODS,
		function (methodName) {
			self[methodName] = angular.bind(self, self[methodName]);
		}
	);
}

MenuBarController.prototype.init = function () {
	"use strict";

	var $element = this.$element,
		$mdUtil = this.$mdUtil,
		$scope = this.$scope,
		self = this,
		deregisterFns = [];

	$element.on('keydown', this.handleKeyDown);
	this.parentToolbar = $mdUtil.getClosest($element, 'MD-TOOLBAR');

	deregisterFns.push(
		this.$rootScope.$on(
			'$mdMenuOpen',
			function ng_md_ui_menubar_open_on(event, el) {
				if (self.getMenus().indexOf(el[0]) != -1) {
					$element[0].classList.add('md-open');
					el[0].classList.add('md-open');
					self.currentlyOpenMenu = el.controller('mdMenu');
					self.currentlyOpenMenu.registerContainerProxy(self.handleKeyDown);
					self.enableOpenOnHover();
				}
			}
		)
	);

	deregisterFns.push(
		this.$rootScope.$on(
			'$mdMenuClose',
			function ng_md_ui_menubar_close_on(event, el, opts) {
				var rootMenus = self.getMenus(),
					parentMenu;

				if (rootMenus.indexOf(el[0]) != -1) {
					$element[0].classList.remove('md-open');
					el[0].classList.remove('md-open');
				}

				if ($element[0].contains(el[0])) {
					parentMenu = el[0];

					while (parentMenu && rootMenus.indexOf(parentMenu) === -1) {
						parentMenu = $mdUtil.getClosest(parentMenu, 'MD-MENU', true);
					}

					if (parentMenu) {
						if (!opts.skipFocus) { parentMenu.querySelector('button:not([disabled])').focus(); }
						self.currentlyOpenMenu = undefined;
						self.disableOpenOnHover();
						self.setKeyboardMode(true);
					}
				}
			}
		)
	);

	$scope.$on(
		'$destroy',
		function ng_md_ui_menubar_ctrl_on() {
			self.disableOpenOnHover();
			while (deregisterFns.length) {
				deregisterFns.shift()();
			}
		}
	);


	this.setKeyboardMode(true);
};

MenuBarController.prototype.setKeyboardMode = function (enabled) {
	"use strict";

	if (enabled) { this.$element[0].classList.add('md-keyboard-mode'); }
	else { this.$element[0].classList.remove('md-keyboard-mode'); }
};

MenuBarController.prototype.enableOpenOnHover = function () {
	"use strict";

	if (this.openOnHoverEnabled) { return; }

	var self = this;

	self.openOnHoverEnabled = true;

	if (self.parentToolbar) {
		self.parentToolbar.classList.add('md-has-open-menu');

		// Needs to be on the next tick so it doesn't close immediately.
		self.$mdUtil.nextTick(
			function () {
				angular.element(self.parentToolbar).on('click', self.handleParentClick);
			},
			false
		);
	}

	angular.element(self.getMenus()).on('mouseenter', self.handleMenuHover);
};

MenuBarController.prototype.handleMenuHover = function (e) {
	"use strict";

	this.setKeyboardMode(false);

	if (this.openOnHoverEnabled) {
		this.scheduleOpenHoveredMenu(e);
	}
};

MenuBarController.prototype.disableOpenOnHover = function () {
	"use strict";

	if (!this.openOnHoverEnabled) { return; }

	this.openOnHoverEnabled = false;

	if (this.parentToolbar) {
		this.parentToolbar.classList.remove('md-has-open-menu');
		angular.element(this.parentToolbar).off('click', this.handleParentClick);
	}

	angular.element(this.getMenus()).off('mouseenter', this.handleMenuHover);
};

MenuBarController.prototype.scheduleOpenHoveredMenu = function (e) {
	"use strict";

	var menuEl = angular.element(e.currentTarget),
		menuCtrl = menuEl.controller('mdMenu');

	this.setKeyboardMode(false);
	this.scheduleOpenMenu(menuCtrl);
};

MenuBarController.prototype.scheduleOpenMenu = function (menuCtrl) {
	"use strict";

	var self = this,
		$timeout = this.$timeout;

	if (menuCtrl != self.currentlyOpenMenu) {

		$timeout.cancel(self.pendingMenuOpen);

		self.pendingMenuOpen = $timeout(
			function () {
				self.pendingMenuOpen = undefined;

				if (self.currentlyOpenMenu) {
					self.currentlyOpenMenu.close(
						true,
						{ closeAll: true }
					);
				}

				menuCtrl.open();
			},
			200,
			false
		);
	}
};

MenuBarController.prototype.handleKeyDown = function (e) {
	"use strict";

	var keyCodes = this.$mdConstant.KEY_CODE,
		currentMenu = this.currentlyOpenMenu,
		wasOpen = currentMenu && currentMenu.isOpen,
		handled,
		newMenu,
		newMenuCtrl;

	this.setKeyboardMode(true);

	switch (e.keyCode) {
		case keyCodes.DOWN_ARROW:
			if (currentMenu) {
				currentMenu.focusMenuContainer();
			} else {
				this.openFocusedMenu();
			}
			handled = true;
			break;
		case keyCodes.UP_ARROW:
			if (currentMenu) {
				currentMenu.close();
			}

			handled = true;
			break;
		case keyCodes.LEFT_ARROW:
			newMenu = this.focusMenu(-1);
			if (wasOpen) {
				newMenuCtrl = angular.element(newMenu).controller('mdMenu');
				this.scheduleOpenMenu(newMenuCtrl);
			}
			handled = true;
			break;
		case keyCodes.RIGHT_ARROW:
			newMenu = this.focusMenu(+1);
			if (wasOpen) {
				newMenuCtrl = angular.element(newMenu).controller('mdMenu');
				this.scheduleOpenMenu(newMenuCtrl);
			}
			handled = true;
			break;
	}

	if (handled) {
		if (e && e.preventDefault) { e.preventDefault(); }
		if (e && e.stopImmediatePropagation) { e.stopImmediatePropagation(); }
	}
};

MenuBarController.prototype.focusMenu = function (direction) {
	"use strict";

	var menus = this.getMenus(),
		focusedIndex = this.getFocusedMenuIndex(),
		changed = false;

	if (focusedIndex == -1) {
		focusedIndex = this.getOpenMenuIndex();
	}

	if (focusedIndex == -1) {
		focusedIndex = 0;
		changed = true;
	} else if (
		direction < 0 && focusedIndex > 0 ||
		direction > 0 && focusedIndex < menus.length - direction
	) {
		focusedIndex += direction;
		changed = true;
	}
	if (changed) {
		menus[focusedIndex].querySelector('button').focus();
		return menus[focusedIndex];
	}
};

MenuBarController.prototype.openFocusedMenu = function () {
	"use strict";

	var menu = this.getFocusedMenu();

	if (menu) {
		angular.element(menu).controller('mdMenu').open();
	}
};

MenuBarController.prototype.getMenus = function () {
	"use strict";

	var $element = this.$element;

	return this.$mdUtil.nodesToArray($element[0].children).filter(
			function (el) {
				return el.nodeName == 'MD-MENU';
			}
		);
};

MenuBarController.prototype.getFocusedMenu = function () {
	"use strict";

	return this.getMenus()[this.getFocusedMenuIndex()];
};

MenuBarController.prototype.getFocusedMenuIndex = function () {
	"use strict";

	var $mdUtil = this.$mdUtil,
		focusedEl = $mdUtil.getClosest(
			this.$document[0].activeElement,
			'MD-MENU'
		),
		focusedIndex;

	if (!focusedEl) { return -1; }

	focusedIndex = this.getMenus().indexOf(focusedEl);

	return focusedIndex;
};

MenuBarController.prototype.getOpenMenuIndex = function () {
	"use strict";

	var menus = this.getMenus(),
		i = 0;

	for (i = 0; i < menus.length; i += 1) {
		if (menus[i].classList.contains('md-open')) { return i; }
	}

	return -1;
};

MenuBarController.prototype.handleParentClick = function (event) {
	"use strict";

	var openMenu = this.querySelector('md-menu.md-open');

	if (openMenu && !openMenu.contains(event.target)) {
		angular.element(openMenu).controller('mdMenu').close(
			true,
			{ closeAll: true }
		);
	}
};

function MenuBarDirective($mdUtil, $mdTheming) {
	"use strict";

	return {
		restrict: 'E',
		require: 'mdMenuBar',
		controller: 'MenuBarController',

		compile: function compile(templateEl, templateAttrs) {

			if (!templateAttrs.ariaRole) {
				templateEl[0].setAttribute('role', 'menubar');
			}

			angular.forEach(
				templateEl[0].children,
				function (menuEl) {
					var contentEls;

					if (menuEl.nodeName === 'MD-MENU') {

						if (!menuEl.hasAttribute('md-position-mode')) {
							menuEl.setAttribute('md-position-mode', 'left bottom');

							menuEl.querySelector('button, a, md-button').setAttribute('role', 'menuitem');
						}

						contentEls = $mdUtil.nodesToArray(menuEl.querySelectorAll('md-menu-content'));

						angular.forEach(
							contentEls,
							function (contentEl) {
								contentEl.classList.add('md-menu-bar-menu');
								contentEl.classList.add('md-dense');

								if (!contentEl.hasAttribute('width')) {
									contentEl.setAttribute('width', 5);
								}
							}
						);
					}
				}
			);

			templateEl.find('md-menu-item').addClass('md-in-menu-bar');

			return function postLink(scope, el, attr, ctrl) {
				el.addClass('_md'); // private md component indicator for styling
				$mdTheming(scope, el);
				ctrl.init();
			};
		}
	};
}


angular.module(
	'ng.material.ui.menu',
	[
		'ng',
		'ng.material.core',
		'ng.material.core.theming',
		'ng.material.core.interim',
		'ng.material.core.animator',
		'ng.material.ui.icon',
	]
).provider(
	'$mdMenu',
	['$$interimElementProvider', MenuProvider]
).directive(
	'mdMenu',
	["$mdUtil", MenuDirective]
).controller(
	'mdMenuCtrl',
	["$mdMenu", "$attrs", "$element", "$scope", "$mdUtil", "$timeout", "$rootScope", "$q", MenuController]
).controller(
	'MenuItemController',
	["$scope", "$element", "$attrs", MenuItemController]
).controller(
	'MenuBarController',
	["$scope", "$rootScope", "$element", "$attrs", "$mdConstant", "$document", "$mdUtil", "$timeout", MenuBarController]
).directive(
	'mdMenuBar',
	["$mdUtil", "$mdTheming", MenuBarDirective]
).directive(
    'mdMenuContent',
    angular.restrictEDir
).directive(
	'mdMenuItem',
	["$mdUtil", "$mdConstant", "$$mdSvgRegistry", MenuItemDirective]
).directive(
    'mdMenuDivider',
    MenuDividerDirective
).directive(
    'mdMenuAlignTarget',
    angular.restrictADir
).directive(
    'mdMenuOrigin',
    angular.restrictADir
).directive(
    'mdPositionMode',
    angular.restrictADir
).directive(
    'mdNestLevel',
    angular.restrictADir
).directive(
    'mdOffset',
    angular.restrictADir
);
