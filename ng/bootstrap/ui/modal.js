
/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.bootstrap.ui.modal");

ng.bootstrap.ui.modal.version = new msos.set_version(17, 12, 6);

// Load Angular-UI-Bootstrap module specific CSS
ng.bootstrap.ui.modal.css = new msos.loader();
ng.bootstrap.ui.modal.css.load(msos.resource_url('ng', 'bootstrap/css/ui/modal.css'));


// Below is the standard plugin, except for templateUrl location and naming (MSOS style)
// ui.bootstrap.modal -> ng.bootstrap.ui.modal
// uib/template/modal/window.html   -> msos.resource_url('ng', 'bootstrap/ui/tmpl/window.html')
//
// ...and our adaptation of $q, $qq (ref. function qFactory)
angular.module(
    'ng.bootstrap.ui.modal',
    ['ng', 'ng.bootstrap.ui', 'ng.bootstrap.ui.multiMap', 'ng.bootstrap.ui.stackedMap', 'ng.bootstrap.ui.position']
).provider(
    '$uibResolve',
    function () {
        "use strict";

        var resolve = this;

        this.resolver = null;

        this.setResolver = function (resolver) {
            this.resolver = resolver;
        };

        this.$get = ['$injector', '$q', function ($injector, $q) {

            var resolver = resolve.resolver ? $injector.get(resolve.resolver) : null;

            return {
                resolve: function uib_modal_resolve(invocables, locals, parent, self) {
                    var temp_um = 'ng.bootstrap.ui.modal - uib_modal_resolve';

                    msos.console.debug(temp_um + ' -> start, invocables:', invocables);

                    if (resolver) {
                        msos.console.debug(temp_um + ' ->  done, for resolver');
                        return resolver.resolve(invocables, locals, parent, self);
                    }

                    var promises = [];

                    angular.forEach(
                        invocables,
                        function uib_resolve_invocables(value) {
                            var debug = '';

                            msos.console.debug(temp_um + ' - foreach -> start.');

                            if (angular.isFunction(value) || angular.isArray(value)) {
                                debug = 'function or array';
                                promises.push($q.resolve($q.defer('$uibResolve_function'), $injector.invoke(value, undefined, undefined, '$uibResolve')));
                            } else if (angular.isString(value)) {
                                debug = 'string';
                                promises.push($q.resolve($q.defer('$uibResolve_string'), $injector.get(value)));
                            } else {
                                debug = 'object or opps';
                                promises.push($q.resolve($q.defer('$uibResolve_value'), value));
                            }
                            msos.console.debug(temp_um + ' - foreach -> done, debug: ' + debug + ', promises:', promises);
                        }
                    );

                    msos.console.debug(temp_um + ' -> done, for $q.all');

                    return $q.all(
                            $q.defer('$uibResolve_all'),
                            promises
                        ).then(
                            function (resolves) {
                                msos.console.debug(temp_um + ' - $q.all then -> start, resolves:', resolves);

                                var resolveObj = {},
                                    resolveIter = 0;

                                angular.forEach(
                                    invocables,
                                    function (value, key) {
                                        resolveObj[key] = resolves[resolveIter++];
                                    }
                                );

                                msos.console.debug(temp_um + ' - $q.all then -> done, resolveObj:', resolveObj);
                                return resolveObj;
                            }
                        );
                }
            };
        }];
    }
).directive(
    'uibModalBackdrop',
    ['$animate', '$injector', '$uibModalStack', function ($animate, $injector, $uibModalStack) {
        "use strict";

        function linkFn(scope, element, attrs) {

            if (attrs.modalInClass) {
                $animate.addClass(element, attrs.modalInClass);

                scope.$on(
                    $uibModalStack.NOW_CLOSING_EVENT,
                    function (e, setIsAsync) {
                        var done = setIsAsync();

                        if (scope.modalOptions.animation) {
                            $animate.removeClass(element, attrs.modalInClass).then(done);
                        } else {
                            done();
                        }
                    }
                );
            }
        }

        return {
            restrict: 'A',
            compile: function (tElement, tAttrs) {
                tElement.addClass(tAttrs.backdropClass);
                return linkFn;
            }
        };
    }]
).directive(
    'uibModalWindow',
    ['$uibModalStack', '$q', '$animateCss', '$document', function ($uibModalStack, $q, $animateCss, $document) {
        "use strict";

        return {
            scope: {
                index: '@',
            },
            restrict: 'A',
            transclude: true,
            templateUrl: function (tElement, tAttrs) {
                return tAttrs.templateUrl || msos.resource_url('ng', 'bootstrap/ui/tmpl/window.html');
            },
            link: function (scope, element, attrs) {

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
                // Resolve render promise post-digest
                scope.$$postDigest(function rs_pd_modal_stack_link() {
                    modalRenderDeferObj.resolve();
                });


                modalRenderDeferObj.promise.then(function () {
                    var animationPromise = null;

                    if (attrs.modalInClass) {

                        animationPromise = $animateCss(
                            element,
                            { addClass: attrs.modalInClass }
                        ).start();

                        scope.$on(
                            $uibModalStack.NOW_CLOSING_EVENT,
                            function (e, setIsAsync) {
                                var done = setIsAsync();

                                $animateCss(
                                    element,
                                    { removeClass: attrs.modalInClass }
                                ).start().then(done);
                            }
                        );
                    }


                    $q.when($q.defer('modalWinRenderDeferObj_animation'), animationPromise).then(
                        function () {
                            // Notify {@link $uibModalStack} that modal is rendered.
                            var modal = $uibModalStack.getTop();

                            if (modal) {
                                $uibModalStack.modalRendered(modal.key);
                            }

                            if (!($document[0].activeElement && element[0].contains($document[0].activeElement))) {
                                var inputWithAutofocus = element[0].querySelector('[autofocus]');

                                if (inputWithAutofocus) {
                                    inputWithAutofocus.focus();
                                } else {
                                    element[0].focus();
                                }
                            }
                        }
                    );
                });
            }
        };
    }]
).directive(
    'uibModalAnimationClass',
    [function () {
        "use strict";

        return {
            compile: function (tElement, tAttrs) {
                if (tAttrs.modalAnimation) {
                    tElement.addClass(tAttrs.uibModalAnimationClass);
                }
            }
        };
    }]
).directive(
    'uibModalTransclude',
    ['$animate', function ($animate) {
        "use strict";

        return {
            link: function (scope, element, attrs, controller, transclude) {
                msos.console.debug('ng.bootstrap.ui.modal - uibModalTransclude.link -> called, transclude: ' + (transclude.name || 'anonymous'));
                transclude(
                    scope.$parent,
                    function (clone) {
                        element.empty();
                        $animate.enter(clone, element);
                    }
                );
            }
        };
    }]
).factory(
    '$uibModalStack',
    ['$animate', '$document', '$compile', '$rootScope', '$q', '$$multiMap', '$$stackedMap', '$uibPosition',
    function ($animate, $document, $compile, $rootScope, $q, $$multiMap, $$stackedMap, $uibPosition) {
        "use strict";

        var temp_um = 'ng.bootstrap.ui.modal - $uibModalStack',
            OPENED_MODAL_CLASS = 'modal-open',
            backdropDomEl,
            backdropScope,
            openedWindows = $$stackedMap.createNew(),
            openedClasses = $$multiMap.createNew(),
            $modalStack = {
                NOW_CLOSING_EVENT: 'modal.stack.now-closing'
            },
            topModalIndex = 0,
            previousTopOpenedModal = null,
            ARIA_HIDDEN_ATTRIBUTE_NAME = 'data-bootstrap-modal-aria-hidden-count',
            tabbableSelector,
            scrollbarPadding;

        msos.console.debug(temp_um + ' -> start.');

        //Modal focus behavior
        tabbableSelector =  'a[href], area[href], input:not([disabled]):not([tabindex=\'-1\']), ' +
                            'button:not([disabled]):not([tabindex=\'-1\']),select:not([disabled]):not([tabindex=\'-1\']), textarea:not([disabled]):not([tabindex=\'-1\']), ' +
                            'iframe, object, embed, *[tabindex]:not([tabindex=\'-1\']), *[contenteditable=true]';

        function isVisible(element) {
            return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
        }

        function backdropIndex() {
            var topBackdropIndex = -1,
                opened = openedWindows.keys();

            for (var i = 0; i < opened.length; i += 1) {
                if (openedWindows.get(opened[i]).value.backdrop) {
                    topBackdropIndex = i;
                }
            }

            if (topBackdropIndex > -1 && topBackdropIndex < topModalIndex) {
                topBackdropIndex = topModalIndex;
            }
            return topBackdropIndex;
        }

        $rootScope.$watch(
            backdropIndex,
            function (newBackdropIndex) {
                if (backdropScope) { backdropScope.index = newBackdropIndex; }
            }
        );

        function removeAfterAnimate(domEl, scope, done, closedDeferred) {
            var asyncDeferred = $q.defer('uibmodalstack_removeAfterAnimate'),
                asyncPromise = asyncDeferred.promise,
                setIsAsync = function () {
                    return function asyncDone() { asyncDeferred.resolve(); };
                };

            msos.console.debug(temp_um + ' - removeAfterAnimate -> start, domEl:', domEl);

            scope.$broadcast($modalStack.NOW_CLOSING_EVENT, setIsAsync);

            function afterAnimating() {
                if (afterAnimating.done) {
                    return;
                }

                afterAnimating.done = true;

                $animate.leave(domEl).then(
                    function() {
                        if (done) { done(); }

                        domEl.remove();

                        if (closedDeferred) {
                            closedDeferred.resolve();
                        }
                    }
                );

                scope.$destroy();
            }

            $q.when(
                $q.defer('uibmodalstack_raa_when'), asyncPromise
            ).then(afterAnimating);

            msos.console.debug(temp_um + ' - removeAfterAnimate -> done!');
        }

        function removeModalWindow(modalInstance, elementToReceiveFocus) {
            var modalWindow,
                appendToElement;

            msos.console.debug(temp_um + ' - removeModalWindow -> start, modalInstance:', modalInstance);

            modalWindow = openedWindows.get(modalInstance).value;
            appendToElement = modalWindow.appendTo;

            // clean up the stack
            openedWindows.remove(modalInstance);
            previousTopOpenedModal = openedWindows.top();

            if (previousTopOpenedModal) {
                topModalIndex = parseInt(previousTopOpenedModal.value.modalDomEl.attr('index'), 10);
            }

            removeAfterAnimate(
                modalWindow.modalDomEl,
                modalWindow.modalScope,
                function () {
                    var modalBodyClass = modalWindow.openedClass || OPENED_MODAL_CLASS,
                        areAnyOpen;

                    openedClasses.remove(modalBodyClass, modalInstance);
                    areAnyOpen = openedClasses.hasKey(modalBodyClass);

                    appendToElement.toggleClass(modalBodyClass, areAnyOpen);

                    if (!areAnyOpen && scrollbarPadding && scrollbarPadding.heightOverflow && scrollbarPadding.scrollbarWidth) {
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
                },
                modalWindow.closedDeferred
            );

            checkRemoveBackdrop();

            //move focus to specified element if available, or else to body
            if (elementToReceiveFocus && elementToReceiveFocus.focus) {
                elementToReceiveFocus.focus();
            } else if (appendToElement.focus) {
                appendToElement.focus();
            }

            msos.console.debug(temp_um + ' - removeModalWindow ->  done!');
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
    
                removeAfterAnimate(
                    backdropDomEl,
                    backdropScope,
                    function () {
                        backdropScopeRef = null;
                    }
                );

                backdropDomEl = undefined;
                backdropScope = undefined;
            }
        }

        $document.on('keydown', keydownListener);

        $rootScope.$on(
            '$destroy',
            function () {
                $document.off('keydown', keydownListener);
            }
        );

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
                                $rootScope.$apply(
                                    function () {
                                        $modalStack.dismiss(modal.key, 'escape key press');
                                    }
                                );
                            }
                            break;
                        }
                    case 9:
                        {
                            var list = $modalStack.loadFocusElementList(modal),
                                focusChanged = false;

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

            return undefined;
        }

        $modalStack.open = function (modalInstance, modal) {
            var modalOpener = $document[0].activeElement,
                modalBodyClass = modal.openedClass || OPENED_MODAL_CLASS,
                appendToElement,
                currBackdropIndex,
                content,
                angularDomEl;

            toggleTopWindowClass(false);

            // Store the current top first, to determine what index we ought to use
            // for the current top modal
            previousTopOpenedModal = openedWindows.top();

            openedWindows.add(
                modalInstance,
                {
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
                }
            );

            openedClasses.put(modalBodyClass, modalInstance);

            appendToElement = modal.appendTo;
            currBackdropIndex = backdropIndex();

            if (currBackdropIndex >= 0 && !backdropDomEl) {

                backdropScope = $rootScope.$new(true);
                backdropScope.modalOptions = modal;
                backdropScope.index = currBackdropIndex;
                backdropDomEl = angular.element('<div uib-modal-backdrop="modal-backdrop"></div>');
                backdropDomEl.attr(
                    {
                        'class': 'modal-backdrop',
                        'ng-style': '{\'z-index\': 1040 + (index && 1 || 0) + index*10}',
                        'uib-modal-animation-class': 'fade',
                        'modal-in-class': 'in'
                    }
                );

                if (modal.backdropClass) {
                    backdropDomEl.addClass(modal.backdropClass);
                }

                if (modal.animation) {
                    backdropDomEl.attr('modal-animation', 'true');
                }

                $compile(backdropDomEl)(backdropScope);
                $animate.enter(backdropDomEl, appendToElement);

                if ($uibPosition.isScrollable(appendToElement)) {
                    scrollbarPadding = $uibPosition.scrollbarPadding(appendToElement);
                    if (scrollbarPadding.heightOverflow && scrollbarPadding.scrollbarWidth) {
                        appendToElement.css({paddingRight: scrollbarPadding.right + 'px'});
                    }
                }
            }

            if (modal.component) {
                content = document.createElement(angular.snakeCase(modal.component.name));
                content = angular.element(content);
                content.attr({
                    resolve: '$resolve',
                    'modal-instance': '$uibModalInstance',
                    close: '$close($value)',
                    dismiss: '$dismiss($value)'
                });
            } else {
                content = modal.content;
            }

            // Set the top modal index based on the index of the previous top modal
            topModalIndex = previousTopOpenedModal ? parseInt(previousTopOpenedModal.value.modalDomEl.attr('index'), 10) + 1 : 0;

            angularDomEl = angular.element('<div uib-modal-window="modal-window"></div>');

            angularDomEl.attr({
                'class': 'modal',
                'template-url': modal.windowTemplateUrl,
                'window-top-class': modal.windowTopClass,
                'role': 'dialog',
                'aria-labelledby': modal.ariaLabelledBy,
                'aria-describedby': modal.ariaDescribedBy,
                'size': modal.size,
                'index': topModalIndex,
                'animate': 'animate',
                'ng-style': '{\'z-index\': 1050 + $$topModalIndex*10, display: \'block\'}',
                'tabindex': -1,
                'uib-modal-animation-class': 'fade',
                'modal-in-class': 'in'
            }).append(content);

            if (modal.windowClass) {
                angularDomEl.addClass(modal.windowClass);
            }
            if (modal.animation) {
                angularDomEl.attr('modal-animation', 'true');
            }

            appendToElement.addClass(modalBodyClass);

            if (modal.scope) {
                modal.scope.$$topModalIndex = topModalIndex;
            }
            $animate.enter($compile(angularDomEl)(modal.scope), appendToElement);

            openedWindows.top().value.modalDomEl = angularDomEl;
            openedWindows.top().value.modalOpener = modalOpener;

            function applyAriaHidden(el) {

                if (!el || el[0].tagName === 'BODY') { return; }

                function getSiblings(el) {
                    var children = el.parent() ? el.parent().children() : [];

                    return Array.prototype.filter.call(
                            children,
                            function (child) {
                                return child !== el[0];
                            }
                        );
                }

                getSiblings(el).forEach(
                    function(sibling) {
                        var elemIsAlreadyHidden = sibling.getAttribute('aria-hidden') === 'true',
                            ariaHiddenCount = parseInt(sibling.getAttribute(ARIA_HIDDEN_ATTRIBUTE_NAME), 10);

                        if (!ariaHiddenCount) { ariaHiddenCount = elemIsAlreadyHidden ? 1 : 0; }

                        sibling.setAttribute(ARIA_HIDDEN_ATTRIBUTE_NAME, ariaHiddenCount + 1);
                        sibling.setAttribute('aria-hidden', 'true');
                    }
                );

                return applyAriaHidden(el.parent());
            }

            applyAriaHidden(angularDomEl);
        };

        function broadcastClosing(modalWindow, resultOrReason, closing) {
            return !modalWindow.value.modalScope.$broadcast('modal.closing', resultOrReason, closing).defaultPrevented;
        }

        function unhideBackgroundElements() {
            Array.prototype.forEach.call(
                document.querySelectorAll('[' + ARIA_HIDDEN_ATTRIBUTE_NAME + ']'),
                function (hiddenEl) {
                    var ariaHiddenCount = parseInt(hiddenEl.getAttribute(ARIA_HIDDEN_ATTRIBUTE_NAME), 10),
                        newHiddenCount = ariaHiddenCount - 1;

                    hiddenEl.setAttribute(ARIA_HIDDEN_ATTRIBUTE_NAME, newHiddenCount);

                    if (!newHiddenCount) {
                        hiddenEl.removeAttribute(ARIA_HIDDEN_ATTRIBUTE_NAME);
                        hiddenEl.removeAttribute('aria-hidden');
                    }
                }
            );
        }

        $modalStack.close = function (modalInstance, result) {
            var modalWindow = openedWindows.get(modalInstance);

            unhideBackgroundElements();

            if (modalWindow && broadcastClosing(modalWindow, result, true)) {
                modalWindow.value.modalScope.$$uibDestructionScheduled = true;
                modalWindow.value.deferred.resolve(result);
                removeModalWindow(modalInstance, modalWindow.value.modalOpener);
                return true;
            }

            return !modalWindow;
        };

        $modalStack.dismiss = function (modalInstance, reason) {
            var modalWindow = openedWindows.get(modalInstance);

            unhideBackgroundElements();

            if (modalWindow && broadcastClosing(modalWindow, reason, false)) {
                modalWindow.value.modalScope.$$uibDestructionScheduled = true;
                modalWindow.value.deferred.reject(reason);
                removeModalWindow(modalInstance, modalWindow.value.modalOpener);
                return true;
            }

            return !modalWindow;
        };

        $modalStack.dismissAll = function (reason) {
            var topModal = this.getTop();

            while (topModal && this.dismiss(topModal.key, reason)) {
                topModal = this.getTop();
            }
        };

        $modalStack.getTop = function () {
            return openedWindows.top();
        };

        $modalStack.modalRendered = function (modalInstance) {
            var modalWindow = openedWindows.get(modalInstance);
            if (modalWindow) {
                modalWindow.value.renderDeferred.resolve();
            }
        };

        $modalStack.focusFirstFocusableElement = function (list) {
            if (list.length > 0) {
                list[0].focus();
                return true;
            }
            return false;
        };

        $modalStack.focusLastFocusableElement = function (list) {
            if (list.length > 0) {
                list[list.length - 1].focus();
                return true;
            }
            return false;
        };

        $modalStack.isModalFocused = function (evt, modalWindow) {
            if (evt && modalWindow) {
                var modalDomEl = modalWindow.value.modalDomEl;
                if (modalDomEl && modalDomEl.length) {
                    return (evt.target || evt.srcElement) === modalDomEl[0];
                }
            }
            return false;
        };

        $modalStack.isFocusInFirstItem = function (evt, list) {
            if (list.length > 0) {
                return (evt.target || evt.srcElement) === list[0];
            }
            return false;
        };

        $modalStack.isFocusInLastItem = function (evt, list) {
            if (list.length > 0) {
                return (evt.target || evt.srcElement) === list[list.length - 1];
            }
            return false;
        };

        $modalStack.loadFocusElementList = function (modalWindow) {
            var modalDomE1,
                elements;

            if (modalWindow) {
                modalDomE1 = modalWindow.value.modalDomEl;

                if (modalDomE1 && modalDomE1.length) {
                    elements = modalDomE1[0].querySelectorAll(tabbableSelector);

                    return elements ? Array.prototype.filter.call(elements, function (element) { return isVisible(element); }) : elements;
                }
            }
        };

        msos.console.debug(temp_um + ' ->  done!');
        return $modalStack;
    }
]).provider('$uibModal', function () {
    "use strict";

    var $modalProvider = {
        options: {
            animation: true,
            backdrop: true, //can also be false or 'static'
            keyboard: true
        },
        $get: ['$rootScope', '$rootElement', '$q', '$document', '$templateRequest', '$controller', '$uibResolve', '$uibModalStack',
            function ($rootScope, $rootElement, $q, $document, $templateRequest, $controller, $uibResolve, $uibModalStack) {

                var $modal = {},
                    promiseChain = null;

                function getTemplatePromise(options) {
                    return options.template ? $q.when($q.defer('$uibModal_when'), options.template) : $templateRequest(angular.isFunction(options.templateUrl) ? options.templateUrl() : options.templateUrl);
                }

                $modal.getPromiseChain = function () {
                    return promiseChain;
                };

                $modal.open = function (modalOptions) {

                    var modalResultDeferred = $q.defer('modalResultDeferred'),
                        modalOpenedDeferred = $q.defer('modalOpenedDeferred'),
                        modalClosedDeferred = $q.defer('modalClosedDeferred'),
                        modalRenderDeferred = $q.defer('modalRenderDeferred'),
                        templateAndResolvePromise,
                        modalInstance = {
                            result: modalResultDeferred.promise,
                            opened: modalOpenedDeferred.promise,
                            closed: modalClosedDeferred.promise,
                            rendered: modalRenderDeferred.promise,
                            close: function (result) {
                                return $uibModalStack.close(modalInstance, result);
                            },
                            dismiss: function (reason) {
                                return $uibModalStack.dismiss(modalInstance, reason);
                            }
                        },
                        samePromise;

                    //merge and clean up options
                    modalOptions = angular.extend({}, $modalProvider.options, modalOptions);
                    modalOptions.resolve = modalOptions.resolve || {};
                    modalOptions.appendTo = modalOptions.appendTo || $rootElement.eq(0);

                    if (!modalOptions.appendTo.length) {
                        throw new Error('appendTo element not found. Make sure that the element passed is in DOM.');
                    }

                    //verify options
                    if (!modalOptions.component && !modalOptions.template && !modalOptions.templateUrl) {
                        throw new Error('One of component or template or templateUrl options is required.');
                    }

                    if (modalOptions.component) {
                        templateAndResolvePromise = $q.when(
                            $q.defer('uibmodal_templateAndResolvePromise_when'),
                            $uibResolve.resolve(modalOptions.resolve, {}, null, null)
                        );
                    } else {
                        templateAndResolvePromise = $q.all(
                            $q.defer('uibmodal_templateAndResolvePromise_all'),
                            [getTemplatePromise(modalOptions), $uibResolve.resolve(modalOptions.resolve, {}, null, null)]
                        );
                    }

                    function resolveWithTemplate() {
                        return templateAndResolvePromise;
                    }

                    samePromise = promiseChain = $q.all($q.defer('uibmodal_promiseChain_all'), [promiseChain])
                        .then(resolveWithTemplate, resolveWithTemplate)
                        .then(
                            function resolveSuccess(tplAndVars) {
                                var providedScope = modalOptions.scope || $rootScope,
                                    modalScope = providedScope.$new(),
                                    modal,
                                    component = {},
                                    ctrlInstance,
                                    ctrlInstantiate,
                                    ctrlLocals = {};

                                modalScope.$close = modalInstance.close;
                                modalScope.$dismiss = modalInstance.dismiss;

                                modalScope.$on('$destroy', function () {
                                    if (!modalScope.$$uibDestructionScheduled) {
                                        modalScope.$dismiss('$uibUnscheduledDestruction');
                                    }
                                });

                                modal = {
                                    scope: modalScope,
                                    deferred: modalResultDeferred,
                                    renderDeferred: modalRenderDeferred,
                                    closedDeferred: modalClosedDeferred,
                                    animation: modalOptions.animation,
                                    backdrop: modalOptions.backdrop,
                                    keyboard: modalOptions.keyboard,
                                    backdropClass: modalOptions.backdropClass,
                                    windowTopClass: modalOptions.windowTopClass,
                                    windowClass: modalOptions.windowClass,
                                    windowTemplateUrl: modalOptions.windowTemplateUrl,
                                    ariaLabelledBy: modalOptions.ariaLabelledBy,
                                    ariaDescribedBy: modalOptions.ariaDescribedBy,
                                    size: modalOptions.size,
                                    openedClass: modalOptions.openedClass,
                                    appendTo: modalOptions.appendTo
                                };

                                if (modalOptions.component) {
                                    constructLocals(component, false, true, false);
                                    component.name = modalOptions.component;
                                    modal.component = component;
                                } else if (modalOptions.controller) {
                                    constructLocals(ctrlLocals, true, false, true);
                                    ctrlInstantiate = $controller(modalOptions.controller, ctrlLocals, true, modalOptions);

                                    if (modalOptions.controllerAs && modalOptions.bindToController) {
                                        ctrlInstance = ctrlInstantiate.instance;
                                        ctrlInstance.$close = modalScope.$close;
                                        ctrlInstance.$dismiss = modalScope.$dismiss;
                                        angular.extend(
                                            ctrlInstance,
                                            { $resolve: ctrlLocals.$scope.$resolve },
                                            providedScope
                                        );
                                    }

                                    ctrlInstance = ctrlInstantiate();
    
                                    if (angular.isFunction(ctrlInstance.$onInit)) {
                                        ctrlInstance.$onInit();
                                    }
                                }

                                if (!modalOptions.component) {
                                    modal.content = tplAndVars[0];
                                }

                                $uibModalStack.open(modalInstance, modal);
                                modalOpenedDeferred.resolve(true);

                                function constructLocals(obj, template, instanceOnScope, injectable) {
                                    obj.$scope = modalScope;
                                    obj.$scope.$resolve = {};

                                    if (instanceOnScope) {
                                        obj.$scope.$uibModalInstance = modalInstance;
                                    } else {
                                        obj.$uibModalInstance = modalInstance;
                                    }

                                    var resolves = template ? tplAndVars[1] : tplAndVars;

                                    angular.forEach(
                                        resolves,
                                        function (value, key) {
                                            if (injectable) {
                                                obj[key] = value;
                                            }

                                            obj.$scope.$resolve[key] = value;
                                        }
                                    );
                                }
                            },
                            function resolveError(reason) {
                                modalOpenedDeferred.reject(reason);
                                modalResultDeferred.reject(reason);
                            }
                        )['finally'](
                            function () {
                                if (promiseChain === samePromise) {
                                    promiseChain = null;
                                }
                            }
                        );

                    return modalInstance;
                };

                return $modal;
            }
        ]
    };

    return $modalProvider;
}).directive(
    'modalInClass',
    angular.restrictADir
).directive(
    'modalAnimation',
    angular.restrictADir
);