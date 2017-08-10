/**
 * @ngdoc module
 * @name material.components.sidenav
 *
 * @description
 * A Sidenav QP component.
 */
msos.provide("ng.material.comp.sidenav");
msos.require("ng.material.comp.backdrop");


(function () {
    "use strict";

    angular.module(
        'ng.material.comp.sidenav',
        [
            'material.core',
            'ng.material.comp.backdrop'
        ]
    ).factory(
        '$mdSidenav',
        ['$mdComponentRegistry', '$mdUtil', '$q', '$log', SidenavService]
    ).directive(
        'mdSidenav',
        ['$mdMedia', '$mdUtil', '$mdConstant', '$mdTheming', '$animate', '$compile', '$parse', '$log', '$q', '$document', '$window', SidenavDirective]
    ).directive(
        'mdSidenavFocus',
        SidenavFocusDirective
    ).controller(
        '$mdSidenavController',
        ['$scope', '$element', '$attrs', '$mdComponentRegistry', '$q', SidenavController]
    );

    function SidenavService($mdComponentRegistry, $mdUtil, $q, $log) {
        var errorMsg = "SideNav '{0}' is not available! Did you use md-component-id='{0}'?";
        var service = {
            find: findInstance, //  sync  - returns proxy API
            waitFor: waitForInstance //  async - returns promise
        };

        return function(handle, enableWait) {
            if (angular.isUndefined(handle)) return service;

            var shouldWait = enableWait === true;
            var instance = service.find(handle, shouldWait);
            return !instance && shouldWait ? service.waitFor(handle) :
                !instance && angular.isUndefined(enableWait) ? addLegacyAPI(service, handle) : instance;
        };

        function addLegacyAPI(service, handle) {
            var falseFn = function() {
                return false;
            };
            var rejectFn = function() {
                return $q.when($q.defer('ng_md_sidenav_when_addLegacyAPI'), $mdUtil.supplant(errorMsg, [handle || ""]));
            };

            return angular.extend({
                isLockedOpen: falseFn,
                isOpen: falseFn,
                toggle: rejectFn,
                open: rejectFn,
                close: rejectFn,
                onClose: angular.noop,
                then: function(callback) {
                    return waitForInstance(handle)
                        .then(callback || angular.noop);
                }
            }, service);
        }

        function findInstance(handle, shouldWait) {
            var instance = $mdComponentRegistry.get(handle);

            if (!instance && !shouldWait) {

                // Report missing instance
                $log.error($mdUtil.supplant(errorMsg, [handle || ""]));

                // The component has not registered itself... most like NOT yet created
                // return null to indicate that the Sidenav is not in the DOM
                return undefined;
            }
            return instance;
        }

        function waitForInstance(handle) {
            return $mdComponentRegistry.when(handle).catch($log.error);
        }
    }

    function SidenavFocusDirective() {
        return {
            restrict: 'A',
            require: '^mdSidenav',
            link: function(scope, element, attr, sidenavCtrl) {
                // @see $mdUtil.findFocusTarget(...)
            }
        };
    }

    function SidenavDirective($mdMedia, $mdUtil, $mdConstant, $mdTheming,
        $animate, $compile, $parse, $log, $q, $document, $window) {
        return {
            restrict: 'E',
            scope: {
                isOpen: '=?mdIsOpen'
            },
            controller: '$mdSidenavController',
            compile: function(element) {
                element.addClass('md-closed');
                element.attr('tabIndex', '-1');
                return postLink;
            }
        };

        function postLink(scope, element, attr, sidenavCtrl) {
            var lastParentOverFlow;
            var backdrop;
            var disableScrollTarget = null;
            var triggeringElement = null;
            var previousContainerStyles;
            var promise = $q.when($q.defer('ng_md_sidenave_SidenavDirective_postLink'), true);
            var isLockedOpenParsed = $parse(attr.mdIsLockedOpen);
            var ngWindow = angular.element($window);
            var isLocked = function() {
                return isLockedOpenParsed(scope.$parent, {
                    $media: function(arg) {
                        $log.warn("$media is deprecated for is-locked-open. Use $mdMedia instead.");
                        return $mdMedia(arg);
                    },
                    $mdMedia: $mdMedia
                });
            };

            if (attr.mdDisableScrollTarget) {
                disableScrollTarget = $document[0].querySelector(attr.mdDisableScrollTarget);

                if (disableScrollTarget) {
                    disableScrollTarget = angular.element(disableScrollTarget);
                } else {
                    $log.warn($mdUtil.supplant('mdSidenav: couldn\'t find element matching ' +
                        'selector "{selector}". Falling back to parent.', {
                            selector: attr.mdDisableScrollTarget
                        }));
                }
            }

            if (!disableScrollTarget) {
                disableScrollTarget = element.parent();
            }
    
            // Only create the backdrop if the backdrop isn't disabled.
            if (!attr.hasOwnProperty('mdDisableBackdrop')) {
                backdrop = $mdUtil.createBackdrop(scope, "md-sidenav-backdrop md-opaque ng-enter");
            }

            element.addClass('_md'); // private md component indicator for styling
            $mdTheming(element);

            // The backdrop should inherit the sidenavs theme,
            // because the backdrop will take its parent theme by default.
            if (backdrop) $mdTheming.inherit(backdrop, element);

            element.on('$destroy', function() {
                backdrop && backdrop.remove();
                sidenavCtrl.destroy();
            });

            scope.$on('$destroy', function() {
                backdrop && backdrop.remove();
            });

            scope.$watch(isLocked, updateIsLocked);
            scope.$watch('isOpen', updateIsOpen);

            // Publish special accessor for the Controller instance
            sidenavCtrl.$toggleOpen = toggleOpen;

            /**
             * Toggle the DOM classes to indicate `locked`
             * @param isLocked
             */
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
                // Support deprecated md-sidenav-focus attribute as fallback
                var focusEl = $mdUtil.findFocusTarget(element) || $mdUtil.findFocusTarget(element, '[md-sidenav-focus]') || element;
                var parent = element.parent();

                parent[isOpen ? 'on' : 'off']('keydown', onKeyDown);
                if (backdrop) backdrop[isOpen ? 'on' : 'off']('click', close);

                var restorePositioning = updateContainerPositions(parent, isOpen);

                if (isOpen) {
                    // Capture upon opening..
                    triggeringElement = $document[0].activeElement;
                }

                disableParentScroll(isOpen);

                return promise = $q.all($q.defer('ng_md_sidenav_all_updateIsOpen'), [
                    isOpen && backdrop ? $animate.enter(backdrop, parent) : backdrop ?
                    $animate.leave(backdrop) : $q.when($q.defer('ng_md_sidenav_when_updateIsOpen'), true),
                    $animate[isOpen ? 'removeClass' : 'addClass'](element, 'md-closed')
                ]).then(function() {
                    // Perform focus when animations are ALL done...
                    if (scope.isOpen) {
                        // Notifies child components that the sidenav was opened.
                        ngWindow.triggerHandler('resize');
                        focusEl && focusEl.focus();
                    }

                    // Restores the positioning on the sidenav and backdrop.
                    restorePositioning && restorePositioning();
                });
            }

            function updateContainerPositions(parent, willOpen) {
                var drawerEl = element[0];
                var scrollTop = parent[0].scrollTop;

                if (willOpen && scrollTop) {
                    previousContainerStyles = {
                        top: drawerEl.style.top,
                        bottom: drawerEl.style.bottom,
                        height: drawerEl.style.height
                    };

                    // When the parent is scrolled down, then we want to be able to show the sidenav at the current scroll
                    // position. We're moving the sidenav down to the correct scroll position and apply the height of the
                    // parent, to increase the performance. Using 100% as height, will impact the performance heavily.
                    var positionStyle = {
                        top: scrollTop + 'px',
                        bottom: 'auto',
                        height: parent[0].clientHeight + 'px'
                    };

                    // Apply the new position styles to the sidenav and backdrop.
                    element.css(positionStyle);
                    backdrop.css(positionStyle);
                }

                // When the sidenav is closing and we have previous defined container styles,
                // then we return a restore function, which resets the sidenav and backdrop.
                if (!willOpen && previousContainerStyles) {
                    return function() {
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

                        $mdUtil.nextTick(function() {
                            // When the current `updateIsOpen()` animation finishes
                            promise.then(function(result) {

                                if (!scope.isOpen) {
                                    // reset focus to originating element (if available) upon close
                                    triggeringElement && triggeringElement.focus();
                                    triggeringElement = null;
                                }

                                resolve(result);
                            });
                        });
                    });
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

    function SidenavController($scope, $element, $attrs, $mdComponentRegistry, $q) {

        var self = this;

        // Use Default internal method until overridden by directive postLink

        // Synchronous getters
        self.isOpen = function() {
            return !!$scope.isOpen;
        };
        self.isLockedOpen = function() {
            return !!$scope.isLockedOpen;
        };

        // Synchronous setters
        self.onClose = function(callback) {
            self.onCloseCb = callback;
            return self;
        };

        // Async actions
        self.open = function() {
            return self.$toggleOpen(true);
        };
        self.close = function() {
            return self.$toggleOpen(false);
        };
        self.toggle = function() {
            return self.$toggleOpen(!$scope.isOpen);
        };
        self.$toggleOpen = function(value) {
            return $q.when($q.defer('ng_md_sidenav_when_SidenavController'), $scope.isOpen = value);
        };

        self.destroy = $mdComponentRegistry.register(self, $attrs.mdComponentId);
    }
}());