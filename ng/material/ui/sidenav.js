
/**
 * @ngdoc module
 * @name material.components.sidenav
 *
 * @description
 * A Sidenav QP component.
 */

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.sidenav");
msos.require("ng.material.core.autofocus");		// ref. templates
msos.require("ng.material.core.media");
msos.require("ng.material.core.theming");
msos.require("ng.material.ui.backdrop");
msos.require("ng.material.ui.interaction");

ng.material.ui.sidenav.version = new msos.set_version(18, 8, 12);

// Load AngularJS-Material module specific CSS
ng.material.ui.sidenav.css = new msos.loader();
ng.material.ui.sidenav.css.load(msos.resource_url('ng', 'material/css/ui/sidenav.css'));


(function () {
    "use strict";

    function SidenavService($mdComponentRegistry, $mdUtil, $q, $log) {
        var errorMsg = "SideNav '{0}' is not available! Did you use md-component-id='{0}'?",
			service = null;

        function addLegacyAPI(service, handle) {
            var falseFn = function () {
					return false;
				},
				rejectFn = function () {
					return $q.when($q.defer('ng_md_sidenav_when_addLegacyAPI'), $mdUtil.supplant(errorMsg, [handle || ""]));
				};

            return angular.extend({
                isLockedOpen: falseFn,
                isOpen: falseFn,
                toggle: rejectFn,
                open: rejectFn,
                close: rejectFn,
                onClose: angular.noop,
                then: function (callback) {
                    return waitForInstance(handle)
                        .then(callback || angular.noop);
                }
            }, service);
        }

        function findInstance(handle, shouldWait) {
            var instance = $mdComponentRegistry.get(handle);

            if (!instance && !shouldWait) {

                $log.error($mdUtil.supplant(errorMsg, [handle || ""]));

                return undefined;
            }

            return instance;
        }

        function waitForInstance(handle) {
            return $mdComponentRegistry.when(handle).catch($log.error);
        }

		service = {
			find: findInstance, //  sync  - returns proxy API
			waitFor: waitForInstance //  async - returns promise
		};

        return function (handle, enableWait) {

            if (angular.isUndefined(handle)) { return service; }

            var shouldWait = enableWait === true,
				instance = service.find(handle, shouldWait);

            return !instance && shouldWait ? service.waitFor(handle) : !instance && angular.isUndefined(enableWait) ? addLegacyAPI(service, handle) : instance;
        };
    }

    function SidenavDirective($mdMedia, $mdUtil, $mdConstant, $mdTheming, $mdInteraction, $animate, $compile, $parse, $log, $q, $document, $window, $$rAF) {

        return {
            restrict: 'E',
            scope: {
                isOpen: '=?mdIsOpen'
            },
            controller: '$mdSidenavController',
            compile: function (element) {

				element.addClass('md-closed').attr('tabIndex', '-1');

                return postLink;
            }
        };

        function postLink(scope, element, attr, sidenavCtrl) {
            var lastParentOverFlow,
				backdrop,
				disableCloseEvents = false,
				disableScrollTarget = null,
				triggeringInteractionType,
				triggeringElement = null,
				previousContainerStyles,
				promise = $q.when($q.defer('ng_md_sidenave_SidenavDirective_postLink'), true),
				isLockedOpenParsed = $parse(attr.mdIsLockedOpen),
				ngWindow = angular.element($window),
				isLocked = function () {
					return isLockedOpenParsed(
							scope.$parent,
							{
								$media: function (arg) {
									$log.warn("$media is deprecated for is-locked-open. Use $mdMedia instead.");
									return $mdMedia(arg);
								},
								$mdMedia: $mdMedia
							}
						);
				};

            if (attr.mdDisableScrollTarget) {
                disableScrollTarget = $document[0].querySelector(attr.mdDisableScrollTarget);

                if (disableScrollTarget) {
                    disableScrollTarget = angular.element(disableScrollTarget);
                } else {
                    $log.warn(
						$mdUtil.supplant(
							'mdSidenav: couldn\'t find element matching selector "{selector}". Falling back to parent.',
							{ selector: attr.mdDisableScrollTarget }
						)
					);
                }
            }

            if (!disableScrollTarget) {
                disableScrollTarget = element.parent();
            }
    
            // Only create the backdrop if the backdrop isn't disabled.
            if (!attr.hasOwnProperty('mdDisableBackdrop')) {
                backdrop = $mdUtil.createBackdrop(scope, "md-sidenav-backdrop md-opaque ng-enter");
            }

			if (attr.hasOwnProperty('mdDisableCloseEvents')) {
				disableCloseEvents = true;
			}

            element.addClass('_md'); // private md component indicator for styling
            $mdTheming(element);

            if (backdrop) { $mdTheming.inherit(backdrop, element); }

            element.on(
				'$destroy',
				function ng_md_ui_sidenav_postlink_el_on() {
					if (backdrop) { backdrop.remove(); }
					sidenavCtrl.destroy();
				}
			);

            scope.$on(
				'$destroy',
				function ng_md_ui_sidenav_postlink_scope_on() {
					if (backdrop) { backdrop.remove(); }
				}
			);

            scope.$watch(isLocked, updateIsLocked);
            scope.$watch('isOpen', updateIsOpen);

            sidenavCtrl.$toggleOpen = toggleOpen;

            function updateIsLocked(isLocked, oldValue) {

                scope.isLockedOpen = isLocked;

                if (isLocked === oldValue) {
                    element.toggleClass('md-locked-open', !!isLocked);
                } else {
                    $animate[isLocked ? 'addClass' : 'removeClass'](element, 'md-locked-open');
                }
                if (backdrop) {
                    backdrop.toggleClass('md-locked-open', !!isLocked);
                }
            }

            function updateIsOpen(isOpen) {
                var focusEl = $mdUtil.findFocusTarget(element) || $mdUtil.findFocusTarget(element, '[md-sidenav-focus]') || element,
					parent = element.parent(),
					restorePositioning;

                if ( !disableCloseEvents ) {
					parent[isOpen ? 'on' : 'off']('keydown', onKeyDown);
					if (backdrop) {
						backdrop[isOpen ? 'on' : 'off']('click', close);
					}
				}

                restorePositioning = updateContainerPositions(parent, isOpen);

                if (isOpen) {
                    // Capture upon opening..
                    triggeringElement = $document[0].activeElement;
					triggeringInteractionType = $mdInteraction.getLastInteractionType();
                }

                disableParentScroll(isOpen);

                promise = $q.all($q.defer('ng_md_sidenav_all_updateIsOpen'), [
                    isOpen && backdrop ? $animate.enter(backdrop, parent) : backdrop ?
                    $animate.leave(backdrop) : $q.when($q.defer('ng_md_sidenav_when_updateIsOpen'), true),
                    $animate[isOpen ? 'removeClass' : 'addClass'](element, 'md-closed')
                ]).then(function () {
                    // Perform focus when animations are ALL done...
					if (scope.isOpen) {
						$$rAF(
							function () {
								ngWindow.triggerHandler('resize');
							}
						);

						if (focusEl) { focusEl.focus(); }
					}

                    if (restorePositioning) { restorePositioning(); }
                });

				return promise;
            }

            function updateContainerPositions(parent, willOpen) {
                var drawerEl = element[0],
					scrollTop = parent[0].scrollTop,
					positionStyle;

                if (willOpen && scrollTop) {

                    previousContainerStyles = {
                        top: drawerEl.style.top,
                        bottom: drawerEl.style.bottom,
                        height: drawerEl.style.height
                    };

                    positionStyle = {
                        top: scrollTop + 'px',
                        bottom: 'auto',
                        height: parent[0].clientHeight + 'px'
                    };

                    // Apply the new position styles to the sidenav and backdrop.
                    element.css(positionStyle);
                    backdrop.css(positionStyle);
                }

                if (!willOpen && previousContainerStyles) {

                    return function () {

                        drawerEl.style.top = previousContainerStyles.top;
                        drawerEl.style.bottom = previousContainerStyles.bottom;
                        drawerEl.style.height = previousContainerStyles.height;

                        backdrop[0].style.top = null;
                        backdrop[0].style.bottom = null;
                        backdrop[0].style.height = null;

                        previousContainerStyles = null;
                    };
                }
            }

            function disableParentScroll(disabled) {
                if (disabled && !lastParentOverFlow) {
                    lastParentOverFlow = disableScrollTarget.css('overflow');
                    disableScrollTarget.css('overflow', 'hidden');
                } else if (angular.isDefined(lastParentOverFlow)) {
                    disableScrollTarget.css('overflow', lastParentOverFlow);
                    lastParentOverFlow = undefined;
                }
            }

            function toggleOpen(isOpen) {
                if (scope.isOpen == isOpen) {

                    return $q.when($q.defer('ng_md_sidenav_when_toggleOpen'), true);

                } else {
                    if (scope.isOpen && sidenavCtrl.onCloseCb) sidenavCtrl.onCloseCb();

                    return $q(function(resolve) {
                        // Toggle value to force an async `updateIsOpen()` to run
                        scope.isOpen = isOpen;

                        $mdUtil.nextTick(
							function() {
								// When the current `updateIsOpen()` animation finishes
								promise.then(
									function (result) {

										if (!scope.isOpen && triggeringElement && triggeringInteractionType === 'keyboard') {
											// reset focus to originating element (if available) upon close
											triggeringElement.focus();
											triggeringElement = null;
										}

										resolve(result);
									}
								);
							},
							true	// nextTick was undefined (default true)
						);
                    },
					'ng_md_sidenav_resolve_toggleOpen');
                }
            }

            function onKeyDown(ev) {
                var isEscape = (ev.keyCode === $mdConstant.KEY_CODE.ESCAPE);

                return isEscape ? close(ev) : $q.when($q.defer('ng_md_sidenav_when_onKeyDown'), true);
            }

            function close(ev) {
                ev.preventDefault();

                return sidenavCtrl.close();
            }
        }
    }

    function SidenavController($scope, $attrs, $mdComponentRegistry, $q, $interpolate) {
        var self = this,
			rawId,
			hasDataBinding,
			componentId;

        // Use Default internal method until overridden by directive postLink

        // Synchronous getters
        self.isOpen = function () {
            return !!$scope.isOpen;
        };
        self.isLockedOpen = function () {
            return !!$scope.isLockedOpen;
        };

        // Synchronous setters
        self.onClose = function (callback) {
            self.onCloseCb = callback;
            return self;
        };

        // Async actions
        self.open = function () {
            return self.$toggleOpen(true);
        };
        self.close = function () {
            return self.$toggleOpen(false);
        };
        self.toggle = function () {
            return self.$toggleOpen(!$scope.isOpen);
        };
        self.$toggleOpen = function (value) {
            return $q.when($q.defer('ng_md_sidenav_when_SidenavController'), $scope.isOpen = value);
        };

		// Evaluate the component id.
		rawId = $attrs.mdComponentId;
		hasDataBinding = rawId && rawId.indexOf($interpolate.startSymbol()) > -1;
		componentId = hasDataBinding ? $interpolate(rawId)($scope.$parent) : rawId;

		// Register the component.
		self.destroy = $mdComponentRegistry.register(self, componentId);

		// Watch and update the component, if the id has changed.
		if (hasDataBinding) {
			$attrs.$observe(
				'mdComponentId',
				function (id) {
					if (id && id !== self.$$mdHandle) {
						self.destroy(); // `destroy` only deregisters the old component id so we can add the new one.
						self.destroy = $mdComponentRegistry.register(self, id);
					}
				}
			);
		}
    }

    angular.module(
        'ng.material.ui.sidenav',
        [
			'ng',
			'ng.material.core',
			'ng.material.core.media',
			'ng.material.core.theming',
			'ng.material.ui.backdrop',
			'ng.material.ui.interaction'
		]
    ).factory(
        '$mdSidenav',
        ['$mdComponentRegistry', '$mdUtil', '$q', '$log', SidenavService]
    ).directive(
        'mdSidenav',
        ["$mdMedia", "$mdUtil", "$mdConstant", "$mdTheming", "$mdInteraction", "$animate", "$compile", "$parse", "$log", "$q", "$document", "$window", "$$rAF", SidenavDirective]
    ).controller(
        '$mdSidenavController',
        ["$scope", "$attrs", "$mdComponentRegistry", "$q", "$interpolate", SidenavController]
    ).directive(
		'mdIsLockedOpen',
		angular.restrictADir
	).directive(
		'mdDisableBackdrop',
		angular.restrictADir
	);

}());