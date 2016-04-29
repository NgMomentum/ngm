
msos.provide("ng.bootstrap.ui.modal");

ng.bootstrap.ui.modal.version = new msos.set_version(16, 4, 12);

// Load Angular-UI-Bootstrap module specific CSS
ng.bootstrap.ui.modal.css = new msos.loader();
ng.bootstrap.ui.modal.css.load('ng_bootstrap_css_ui_modal_css', msos.resource_url('ng', 'bootstrap/css/ui/modal.css'));


// Below is the standard plugin, except for templateUrl location and naming (MSOS style)
// ui.bootstrap.modal -> ng.bootstrap.ui.modal
// uib/template/modal/backdrop.html -> msos.resource_url('ng', 'bootstrap/ui/tmpl/backdrop.html')
// uib/template/modal/window.html   -> msos.resource_url('ng', 'bootstrap/ui/tmpl/window.html')
//
// ...and our adaptation of $q, $qq (ref. function qFactory)
angular.module('ng.bootstrap.ui.modal', ['ng.bootstrap.ui.stackedMap', 'ng.bootstrap.ui.position'])

.factory('$$multiMap', function() {
    return {
        createNew: function() {
            var map = {};

            return {
                entries: function() {
                    return Object.keys(map).map(function(key) {
                        return {
                            key: key,
                            value: map[key]
                        };
                    });
                },
                get: function(key) {
                    return map[key];
                },
                hasKey: function(key) {
                    return !!map[key];
                },
                keys: function() {
                    return Object.keys(map);
                },
                put: function(key, value) {
                    if (!map[key]) {
                        map[key] = [];
                    }

                    map[key].push(value);
                },
                remove: function(key, value) {
                    var values = map[key];

                    if (!values) {
                        return;
                    }

                    var idx = values.indexOf(value);

                    if (idx !== -1) {
                        values.splice(idx, 1);
                    }

                    if (!values.length) {
                        delete map[key];
                    }
                }
            };
        }
    };
})

.provider('$uibResolve', function () {
    var resolve = this;
    this.resolver = null;

    this.setResolver = function(resolver) {
        this.resolver = resolver;
    };

    this.$get = ['$injector', '$q', function($injector, $q) {
        var resolver = resolve.resolver ? $injector.get(resolve.resolver) : null;
        return {
            resolve: function(invocables, locals, parent, self) {
                if (resolver) {
                    return resolver.resolve(invocables, locals, parent, self);
                }

                var promises = [];

                angular.forEach(invocables, function(value) {
                    if (angular.isFunction(value) || angular.isArray(value)) {
                        promises.push($q.resolve($q.defer('$uibResolve_function'), $injector.invoke(value)));
                    } else if (angular.isString(value)) {
                        promises.push($q.resolve($q.defer('$uibResolve_string'), $injector.get(value)));
                    } else {
                        promises.push($q.resolve($q.defer('$uibResolve_value'), value));
                    }
                });

                return $q.all($q.defer('$uibResolve_all'), promises).then(function(resolves) {
                    var resolveObj = {};
                    var resolveIter = 0;
                    angular.forEach(invocables, function(value, key) {
                        resolveObj[key] = resolves[resolveIter++];
                    });

                    return resolveObj;
                });
            }
        };
    }];
})

.directive('uibModalBackdrop', ['$timeout',
    function($timeout) {
        return {
            // Could not get the v1.3.1 animation code to play nice with NgMomentum
            restrict: 'EA',
            replace: true,
            $$tlb: false,
            templateUrl: msos.resource_url('ng', 'bootstrap/ui/tmpl/backdrop.html'),
            compile: function (tElement, tAttrs) {
                tElement.addClass(tAttrs.backdropClass);
                return linkFn;
            }
        };

        // Could not get the v1.3.1 animation code to play nice with NgMomentum
        function linkFn(scope, element, attrs) {
            scope.animate = false;

            //trigger CSS transitions
            $timeout(function () {
                scope.animate = true;
            });
        }
    }]
)

.directive('uibModalWindow', ['$uibModalStack', '$q',
    function($uibModalStack, $q) {
        return {
            // Could not get the v1.3.1 animation code to play nice with NgMomentum
            restrict: 'EA',
            scope: {
                index: '@',
                animate: '='
            },
            replace: true,
            transclude: true,
            $$tlb: false,
            templateUrl: function(tElement, tAttrs) {
                return tAttrs.templateUrl || msos.resource_url('ng', 'bootstrap/ui/tmpl/window.html');
            },
            link: function(scope, element, attrs) {
                element.addClass(attrs.windowClass || '');
                element.addClass(attrs.windowTopClass || '');
                scope.size = attrs.size;

                scope.close = function (evt) {
                    var modal = $uibModalStack.getTop();
                    if (modal && modal.value.backdrop &&
                        modal.value.backdrop != 'static' &&
                        (evt.target === evt.currentTarget)) {
                        evt.preventDefault();
                        evt.stopPropagation();
                        $uibModalStack.dismiss(modal.key, 'backdrop click');
                    }
                };

                element.on('click', scope.close);
                scope.$isRendered = true;

                // Deferred object that will be resolved when this modal is render.
                var modalRenderDeferObj = $q.defer('modalWinRenderDeferObj');
                // Observe function will be called on next digest cycle after compilation, ensuring that the DOM is ready.
                // In order to use this way of finding whether DOM is ready, we need to observe a scope property used in modal's template.
                attrs.$observe('modalRender', function(value) {
                    if (value === 'true') {
                        modalRenderDeferObj.resolve();
                    }
                });

                modalRenderDeferObj.promise.then(function() {
                    // trigger CSS transitions
                    scope.animate = true;

                    var inputsWithAutofocus = element[0].querySelectorAll('[autofocus]');

                    // Could not get the v1.3.1 animation code to play nice with NgMomentum
                    // ref. scope.$on -> $uibModalStack.NOW_CLOSING_EVENT stuff

                    if (inputsWithAutofocus.length) {
                        inputsWithAutofocus[0].focus();
                    } else {
                        element[0].focus();
                    }

                    // Notify {@link $uibModalStack} that modal is rendered.
                    var modal = $uibModalStack.getTop();
                    if (modal) {
                        $uibModalStack.modalRendered(modal.key);
                    }
                });
            }
        };
    }]
)

.directive('uibModalAnimationClass', [
    function() {
        return {
            compile: function (tElement, tAttrs) {
                if (tAttrs.modalAnimation) {
                    tElement.addClass(tAttrs.uibModalAnimationClass);
                }
            }
        };
    }
])

.directive('uibModalTransclude', function () {
    return {
        link: function(scope, element, attrs, controller, transclude) {
            transclude(scope.$parent, function (clone) {
                element.empty();
                element.append(clone);
            });
        }
    };
})

.factory('$uibModalStack', ['$animate', '$animateCss', '$document',
    '$compile', '$rootScope', '$q', '$$multiMap', '$$stackedMap', '$uibPosition',
    function($animate, $animateCss, $document, $compile, $rootScope, $q, $$multiMap, $$stackedMap, $uibPosition) {
        var OPENED_MODAL_CLASS = 'modal-open';

        var backdropDomEl, backdropScope;
        var openedWindows = $$stackedMap.createNew();
        var openedClasses = $$multiMap.createNew();
        var $modalStack = {
            NOW_CLOSING_EVENT: 'modal.stack.now-closing'
        };
        var topModalIndex = 0;
        var previousTopOpenedModal = null;

        //Modal focus behavior
        var tabableSelector = 'a[href], area[href], input:not([disabled]), ' +
            'button:not([disabled]),select:not([disabled]), textarea:not([disabled]), ' +
            'iframe, object, embed, *[tabindex], *[contenteditable=true]';
        var scrollbarPadding;

        function isVisible(element) {
            return !!(element.offsetWidth ||
                element.offsetHeight ||
                element.getClientRects().length);
        }

        function backdropIndex() {
            var topBackdropIndex = -1;
            var opened = openedWindows.keys();
            for (var i = 0; i < opened.length; i++) {
                if (openedWindows.get(opened[i]).value.backdrop) {
                    topBackdropIndex = i;
                }
            }

            // If any backdrop exist, ensure that it's index is always
            // right below the top modal
            if (topBackdropIndex > -1 && topBackdropIndex < topModalIndex) {
                topBackdropIndex = topModalIndex;
            }
            return topBackdropIndex;
        }

        $rootScope.$watch(backdropIndex, function(newBackdropIndex) {
            if (backdropScope) {
                backdropScope.index = newBackdropIndex;
            }
        });

        function removeModalWindow(modalInstance, elementToReceiveFocus) {
            var modalWindow = openedWindows.get(modalInstance).value;
            var appendToElement = modalWindow.appendTo;

            //clean up the stack
            openedWindows.remove(modalInstance);
            previousTopOpenedModal = openedWindows.top();
            if (previousTopOpenedModal) {
                topModalIndex = parseInt(previousTopOpenedModal.value.modalDomEl.attr('index'), 10);
            }

            removeAfterAnimate(modalWindow.modalDomEl, modalWindow.modalScope, function() {
                var modalBodyClass = modalWindow.openedClass || OPENED_MODAL_CLASS,
                    areAnyOpen;

                openedClasses.remove(modalBodyClass, modalInstance);
                areAnyOpen = openedClasses.hasKey(modalBodyClass);

                appendToElement.toggleClass(modalBodyClass, areAnyOpen);

                if (!areAnyOpen
                 && scrollbarPadding
                 && scrollbarPadding.heightOverflow
                 && scrollbarPadding.scrollbarWidth) {
                    if (scrollbarPadding.originalRight) {
                        appendToElement.css({
                            paddingRight: scrollbarPadding.originalRight + 'px'
                        });
                    } else {
                        appendToElement.css({
                            paddingRight: ''
                        });
                    }
                    scrollbarPadding = null;
                }
                toggleTopWindowClass(true);
            }, modalWindow.closedDeferred);
            checkRemoveBackdrop();

            //move focus to specified element if available, or else to body
            if (elementToReceiveFocus && elementToReceiveFocus.focus) {
                elementToReceiveFocus.focus();
            } else if (appendToElement.focus) {
                appendToElement.focus();
            }
        }

        // Add or remove "windowTopClass" from the top window in the stack
        function toggleTopWindowClass(toggleSwitch) {
            var modalWindow;

            if (openedWindows.length() > 0) {
                modalWindow = openedWindows.top().value;
                modalWindow.modalDomEl.toggleClass(modalWindow.windowTopClass || '', toggleSwitch);
            }
        }

        function checkRemoveBackdrop() {
            //remove backdrop if no longer needed
            if (backdropDomEl && backdropIndex() === -1) {
                var backdropScopeRef = backdropScope;
                removeAfterAnimate(backdropDomEl, backdropScope, function() {
                    backdropScopeRef = null;
                });
                backdropDomEl = undefined;
                backdropScope = undefined;
            }
        }

        function removeAfterAnimate(domEl, scope, done, closedDeferred) {
            var asyncDeferred;
            var asyncPromise = null;
            var setIsAsync = function() {
                if (!asyncDeferred) {
                    asyncDeferred = $q.defer('removeAfterAnimate');
                    asyncPromise = asyncDeferred.promise;
                }

                return function asyncDone() {
                    asyncDeferred.resolve();
                };
            };
            scope.$broadcast($modalStack.NOW_CLOSING_EVENT, setIsAsync);

            // Note that it's intentional that asyncPromise might be null.
            // That's when setIsAsync has not been called during the
            // NOW_CLOSING_EVENT broadcast.
            return $q.when($q.defer('removeAfterAnimate_when'), asyncPromise).then(afterAnimating);

            function afterAnimating() {
                if (afterAnimating.done) {
                    return;
                }
                afterAnimating.done = true;

                $animate.leave(domEl).then(function() {
                    domEl.remove();
                    if (closedDeferred) {
                        closedDeferred.resolve();
                    }
                });

                scope.$destroy();
                if (done) {
                    done();
                }
            }
        }

        $document.on('keydown', keydownListener);

        $rootScope.$on('$destroy', function() {
            $document.off('keydown', keydownListener);
        });

        function keydownListener(evt) {
            if (evt.isDefaultPrevented()) {
                return evt;
            }

            var modal = openedWindows.top();
            if (modal) {
                switch (evt.which) {
                    case 27:
                        {
                            if (modal.value.keyboard) {
                                evt.preventDefault();
                                $rootScope.$apply(function() {
                                    $modalStack.dismiss(modal.key, 'escape key press');
                                });
                            }
                            break;
                        }
                    case 9:
                        {
                            var list = $modalStack.loadFocusElementList(modal);
                            var focusChanged = false;
                            if (evt.shiftKey) {
                                if ($modalStack.isFocusInFirstItem(evt, list) || $modalStack.isModalFocused(evt, modal)) {
                                    focusChanged = $modalStack.focusLastFocusableElement(list);
                                }
                            } else {
                                if ($modalStack.isFocusInLastItem(evt, list)) {
                                    focusChanged = $modalStack.focusFirstFocusableElement(list);
                                }
                            }

                            if (focusChanged) {
                                evt.preventDefault();
                                evt.stopPropagation();
                            }

                            break;
                        }
                }
            }
        }

        $modalStack.open = function(modalInstance, modal) {
            var modalOpener = $document[0].activeElement,
                modalBodyClass = modal.openedClass || OPENED_MODAL_CLASS;

            toggleTopWindowClass(false);

            // Store the current top first, to determine what index we ought to use
            // for the current top modal
            previousTopOpenedModal = openedWindows.top();

            openedWindows.add(modalInstance, {
                deferred: modal.deferred,
                renderDeferred: modal.renderDeferred,
                closedDeferred: modal.closedDeferred,
                modalScope: modal.scope,
                backdrop: modal.backdrop,
                keyboard: modal.keyboard,
                openedClass: modal.openedClass,
                windowTopClass: modal.windowTopClass,
                animation: modal.animation,
                appendTo: modal.appendTo
            });

            openedClasses.put(modalBodyClass, modalInstance);

            var appendToElement = modal.appendTo,
                currBackdropIndex = backdropIndex();

            if (!appendToElement.length) {
                throw new Error('appendTo element not found. Make sure that the element passed is in DOM.');
            }

            if (currBackdropIndex >= 0 && !backdropDomEl) {
                backdropScope = $rootScope.$new(true);
                backdropScope.modalOptions = modal;
                backdropScope.index = currBackdropIndex;
                backdropDomEl = angular.element('<div uib-modal-backdrop="modal-backdrop"></div>');
                backdropDomEl.attr('backdrop-class', modal.backdropClass);
                if (modal.animation) {
                    backdropDomEl.attr('modal-animation', 'true');
                }
                $compile(backdropDomEl)(backdropScope);
                $animate.enter(backdropDomEl, appendToElement);
                scrollbarPadding = $uibPosition.scrollbarPadding(appendToElement);
                if (scrollbarPadding.heightOverflow && scrollbarPadding.scrollbarWidth) {
                    appendToElement.css({paddingRight: scrollbarPadding.right + 'px'});
                }
            }

            // Set the top modal index based on the index of the previous top modal
            topModalIndex = previousTopOpenedModal ? parseInt(previousTopOpenedModal.value.modalDomEl.attr('index'), 10) + 1 : 0;
            var angularDomEl = angular.element('<div uib-modal-window="modal-window"></div>');
            angularDomEl.attr({
                'template-url': modal.windowTemplateUrl,
                'window-class': modal.windowClass,
                'window-top-class': modal.windowTopClass,
                'size': modal.size,
                'index': topModalIndex,
                'animate': 'animate'
            }).html(modal.content);
            if (modal.animation) {
                angularDomEl.attr('modal-animation', 'true');
            }

            appendToElement.addClass(modalBodyClass);
            $animate.enter($compile(angularDomEl)(modal.scope), appendToElement);

            openedWindows.top().value.modalDomEl = angularDomEl;
            openedWindows.top().value.modalOpener = modalOpener;
        };

        function broadcastClosing(modalWindow, resultOrReason, closing) {
            return !modalWindow.value.modalScope.$broadcast('modal.closing', resultOrReason, closing).defaultPrevented;
        }

        $modalStack.close = function(modalInstance, result) {
            var modalWindow = openedWindows.get(modalInstance);
            if (modalWindow && broadcastClosing(modalWindow, result, true)) {
                modalWindow.value.modalScope.$$uibDestructionScheduled = true;
                modalWindow.value.deferred.resolve(result);
                removeModalWindow(modalInstance, modalWindow.value.modalOpener);
                return true;
            }
            return !modalWindow;
        };

        $modalStack.dismiss = function(modalInstance, reason) {
            var modalWindow = openedWindows.get(modalInstance);
            if (modalWindow && broadcastClosing(modalWindow, reason, false)) {
                modalWindow.value.modalScope.$$uibDestructionScheduled = true;
                modalWindow.value.deferred.reject(reason);
                removeModalWindow(modalInstance, modalWindow.value.modalOpener);
                return true;
            }
            return !modalWindow;
        };

        $modalStack.dismissAll = function(reason) {
            var topModal = this.getTop();
            while (topModal && this.dismiss(topModal.key, reason)) {
                topModal = this.getTop();
            }
        };

        $modalStack.getTop = function() {
            return openedWindows.top();
        };

        $modalStack.modalRendered = function(modalInstance) {
            var modalWindow = openedWindows.get(modalInstance);
            if (modalWindow) {
                modalWindow.value.renderDeferred.resolve();
            }
        };

        $modalStack.focusFirstFocusableElement = function(list) {
            if (list.length > 0) {
                list[0].focus();
                return true;
            }
            return false;
        };

        $modalStack.focusLastFocusableElement = function(list) {
            if (list.length > 0) {
                list[list.length - 1].focus();
                return true;
            }
            return false;
        };

        $modalStack.isModalFocused = function(evt, modalWindow) {
            if (evt && modalWindow) {
                var modalDomEl = modalWindow.value.modalDomEl;
                if (modalDomEl && modalDomEl.length) {
                    return (evt.target || evt.srcElement) === modalDomEl[0];
                }
            }
            return false;
        };

        $modalStack.isFocusInFirstItem = function(evt, list) {
            if (list.length > 0) {
                return (evt.target || evt.srcElement) === list[0];
            }
            return false;
        };

        $modalStack.isFocusInLastItem = function(evt, list) {
            if (list.length > 0) {
                return (evt.target || evt.srcElement) === list[list.length - 1];
            }
            return false;
        };

        $modalStack.loadFocusElementList = function(modalWindow) {
            if (modalWindow) {
                var modalDomE1 = modalWindow.value.modalDomEl;
                if (modalDomE1 && modalDomE1.length) {
                    var elements = modalDomE1[0].querySelectorAll(tabableSelector);
                    return elements ?
                        Array.prototype.filter.call(elements, function(element) {
                            return isVisible(element);
                        }) : elements;
                }
            }
        };

        return $modalStack;
    }
])

.provider('$uibModal', function() {
    var $modalProvider = {
        options: {
            animation: true,
            backdrop: true, //can also be false or 'static'
            keyboard: true
        },
        $get: ['$rootScope', '$q', '$document', '$templateRequest', '$controller', '$uibResolve', '$uibModalStack',
            function($rootScope, $q, $document, $templateRequest, $controller, $uibResolve, $uibModalStack) {

                var $modal = {};

                function getTemplatePromise(options) {
                    return options.template ? $q.when($q.defer('$uibModal_when'), options.template) : $templateRequest(angular.isFunction(options.templateUrl) ? options.templateUrl() : options.templateUrl);
                }

                var promiseChain = null;

                $modal.getPromiseChain = function() {
                    return promiseChain;
                };

                $modal.open = function(modalOptions) {

                    var modalResultDeferred = $q.defer('modalResultDeferred');
                    var modalOpenedDeferred = $q.defer('modalOpenedDeferred');
                    var modalClosedDeferred = $q.defer('modalClosedDeferred');
                    var modalRenderDeferred = $q.defer('modalRenderDeferred');

                    //prepare an instance of a modal to be injected into controllers and returned to a caller
                    var modalInstance = {
                        result: modalResultDeferred.promise,
                        opened: modalOpenedDeferred.promise,
                        closed: modalClosedDeferred.promise,
                        rendered: modalRenderDeferred.promise,
                        close: function(result) {
                            return $uibModalStack.close(modalInstance, result);
                        },
                        dismiss: function(reason) {
                            return $uibModalStack.dismiss(modalInstance, reason);
                        }
                    };

                    //merge and clean up options
                    modalOptions = angular.extend({}, $modalProvider.options, modalOptions);
                    modalOptions.resolve = modalOptions.resolve || {};
                    modalOptions.appendTo = modalOptions.appendTo || $document.find('body').eq(0);

                    //verify options
                    if (!modalOptions.template && !modalOptions.templateUrl) {
                        throw new Error('One of template or templateUrl options is required.');
                    }

                    var templateAndResolvePromise = $q.all(
                            $q.defer('templateAndResolvePromise_all'),
                            [getTemplatePromise(modalOptions), $uibResolve.resolve(modalOptions.resolve, {}, null, null)]
                        );

                    function resolveWithTemplate() {
                        return templateAndResolvePromise;
                    }

                    // Wait for the resolution of the existing promise chain.
                    // Then switch to our own combined promise dependency (regardless of how the previous modal fared).
                    // Then add to $uibModalStack and resolve opened.
                    // Finally clean up the chain variable if no subsequent modal has overwritten it.
                    var samePromise;
                    samePromise = promiseChain = $q.all($q.defer('promiseChain_all'), [promiseChain])
                        .then(resolveWithTemplate, resolveWithTemplate)
                        .then(function resolveSuccess(tplAndVars) {
                            var providedScope = modalOptions.scope || $rootScope;

                            var modalScope = providedScope.$new();
                            modalScope.$close = modalInstance.close;
                            modalScope.$dismiss = modalInstance.dismiss;

                            modalScope.$on('$destroy', function() {
                                if (!modalScope.$$uibDestructionScheduled) {
                                    modalScope.$dismiss('$uibUnscheduledDestruction');
                                }
                            });

                            var ctrlInstance, ctrlInstantiate, ctrlLocals = {};

                            //controllers
                            if (modalOptions.controller) {
                                ctrlLocals.$scope = modalScope;
                                ctrlLocals.$uibModalInstance = modalInstance;
                                angular.forEach(tplAndVars[1], function(value, key) {
                                    ctrlLocals[key] = value;
                                });

                                // the third param will make the controller instantiate later,private api
                                // @see https://github.com/angular/angular.js/blob/master/src/ng/controller.js#L126
                                ctrlInstantiate = $controller(modalOptions.controller, ctrlLocals, true);
                                if (modalOptions.controllerAs) {
                                    ctrlInstance = ctrlInstantiate.instance;

                                    if (modalOptions.bindToController) {
                                        ctrlInstance.$close = modalScope.$close;
                                        ctrlInstance.$dismiss = modalScope.$dismiss;
                                        angular.extend(ctrlInstance, providedScope);
                                    }

                                    ctrlInstance = ctrlInstantiate();

                                    modalScope[modalOptions.controllerAs] = ctrlInstance;
                                } else {
                                    ctrlInstance = ctrlInstantiate();
                                }

                                if (angular.isFunction(ctrlInstance.$onInit)) {
                                    ctrlInstance.$onInit();
                                }
                            }

                            $uibModalStack.open(modalInstance, {
                                scope: modalScope,
                                deferred: modalResultDeferred,
                                renderDeferred: modalRenderDeferred,
                                closedDeferred: modalClosedDeferred,
                                content: tplAndVars[0],
                                animation: modalOptions.animation,
                                backdrop: modalOptions.backdrop,
                                keyboard: modalOptions.keyboard,
                                backdropClass: modalOptions.backdropClass,
                                windowTopClass: modalOptions.windowTopClass,
                                windowClass: modalOptions.windowClass,
                                windowTemplateUrl: modalOptions.windowTemplateUrl,
                                size: modalOptions.size,
                                openedClass: modalOptions.openedClass,
                                appendTo: modalOptions.appendTo
                            });

                            modalOpenedDeferred.resolve(true);

                        }, function resolveError(reason) {
                            modalOpenedDeferred.reject(reason);
                            modalResultDeferred.reject(reason);
                        })['finally'](function() {
                            if (promiseChain === samePromise) {
                                promiseChain = null;
                            }
                        });

                    return modalInstance;
                };

                return $modal;
            }
        ]
    };

    return $modalProvider;
});