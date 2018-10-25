
/*global
    msos: false,
    angular: false,
    ng: false,
    Node: false
*/

msos.provide("ng.material.ui.input");
msos.require("ng.messages");
msos.require("ng.material.core.theming");
msos.require("ng.material.core.gestures");
msos.require("ng.material.ui.aria");
msos.require("ng.material.ui.icon");		// ref. code classes

ng.material.ui.input.version = new msos.set_version(18, 9, 5);

// Load AngularJS-Material module specific CSS
ng.material.ui.input.css = new msos.loader();
ng.material.ui.input.css.load(msos.resource_url('ng', 'material/css/ui/input.css'));


(function () {
    "use strict";

    var visibilityDirectives = ['ngIf', 'ngShow', 'ngHide', 'ngSwitchWhen', 'ngSwitchDefault'],
        $$AnimateRunner_inp,
        $animateCss_inp,
        $mdUtil_inp;

    function saveSharedServices(_$$AnimateRunner_, _$animateCss_, _$mdUtil_) {
        $$AnimateRunner_inp = _$$AnimateRunner_;
        $animateCss_inp = _$animateCss_;
        $mdUtil_inp = _$mdUtil_;
    }

    function mdInputContainerDirective($mdTheming, $parse) {

        var INPUT_TAGS = ['INPUT', 'TEXTAREA', 'SELECT', 'MD-SELECT'],
            LEFT_SELECTORS = INPUT_TAGS.reduce(
                function (selectors, isel) {
                    return selectors.concat(['md-icon ~ ' + isel, '.md-icon ~ ' + isel]);
                },
                []
            ).join(","),
            RIGHT_SELECTORS = INPUT_TAGS.reduce(
                function (selectors, isel) {
                    return selectors.concat([isel + ' ~ md-icon', isel + ' ~ .md-icon']);
                },
                []
            ).join(",");

        function compile(tElement) {
            // Check for both a left & right icon
            var leftIcon = tElement[0].querySelector(LEFT_SELECTORS),
                rightIcon = tElement[0].querySelector(RIGHT_SELECTORS);

            if (leftIcon) {
                tElement.addClass('md-icon-left');
            }
            if (rightIcon) {
                tElement.addClass('md-icon-right');
            }

            return function postLink(scope_na, element) {
                $mdTheming(element);
            };
        }

        function ContainerCtrl($scope, $element, $attrs, $animate) {
            var self = this;

            self.isErrorGetter = $attrs.mdIsError && $parse($attrs.mdIsError);

            self.delegateClick = function () {
                self.input.focus();
            };
            self.element = $element;
            self.setFocused = function (isFocused) {
                $element.toggleClass('md-input-focused', !!isFocused);
            };
            self.setHasValue = function (hasValue) {
                $element.toggleClass('md-input-has-value', !!hasValue);
            };
            self.setHasPlaceholder = function (hasPlaceholder) {
                $element.toggleClass('md-input-has-placeholder', !!hasPlaceholder);
            };
            self.setInvalid = function (isInvalid) {
                if (isInvalid) {
                    $animate.addClass($element, 'md-input-invalid');
                } else {
                    $animate.removeClass($element, 'md-input-invalid');
                }
            };
            $scope.$watch(function () {
                return self.label && self.input;
            }, function (hasLabelAndInput) {
                if (hasLabelAndInput && !self.label.attr('for')) {
                    self.label.attr('for', self.input.attr('id'));
                }
            });
        }

        ContainerCtrl.$inject = ["$scope", "$element", "$attrs", "$animate"];

        return {
            restrict: 'E',
            compile: compile,
            controller: ContainerCtrl
        };
    }

    function labelDirective() {
        return {
            restrict: 'E',
            require: '^?mdInputContainer',
            link: function (scope, element, attr, containerCtrl) {
                if (!containerCtrl || attr.mdNoFloat || element.hasClass('md-container-ignore')) { return; }

                containerCtrl.label = element;
                scope.$on(
					'$destroy',
					function ng_md_ui_input_lable_dir_link_on() {
						containerCtrl.label = null;
					}
				);
            }
        };
    }

    function inputTextareaDirective($mdUtil, $window, $mdAria, $timeout, $mdGesture) {

        function postLink(scope, element, attr, ctrls) {

            var containerCtrl = ctrls[0],
                hasNgModel = !!ctrls[1],
                ngModelCtrl = ctrls[1] || $mdUtil.fakeNgModel(),
                parentForm = ctrls[2],
                isReadonly = angular.isDefined(attr.readonly),
                mdNoAsterisk = $mdUtil.parseAttributeBoolean(attr.mdNoAsterisk),
                tagName = element[0].tagName.toLowerCase(),
                errorsSpacer,
				placeholderText,
                isErrorGetter;

            if (!containerCtrl) { return; }

            if (attr.type === 'hidden') {
                element.attr('aria-hidden', 'true');
                return;
            }

            if (containerCtrl.input) {
                if (containerCtrl.input[0].contains(element[0])) {
                    return;
                }
                throw new Error("<md-input-container> can only have *one* <input>, <textarea> or <md-select> child element!");
            }

            containerCtrl.input = element;

            function setupAttributeWatchers() {
                if (containerCtrl.label) {
                    attr.$observe('required', function (value) {
                        // We don't need to parse the required value, it's always a boolean because of angular's
                        // required directive.
                        containerCtrl.label.toggleClass('md-required', value && !mdNoAsterisk);
                    });
                }
            }

            function ngModelPipelineCheckValue(arg) {
                containerCtrl.setHasValue(!ngModelCtrl.$isEmpty(arg));
                return arg;
            }

            function inputCheckValue() {
                containerCtrl.setHasValue(element.val().length > 0 || (element[0].validity || {}).badInput);
            }

            function setupTextarea() {
                var isAutogrowing = !attr.hasOwnProperty('mdNoAutogrow'),
                    minRows,
                    maxRows,
                    scopeResizeListener,
                    lineHeight,
                    node,
                    handleHiddenChange;

                if (!isAutogrowing) { return; }

                function getHeight() {
                    var offsetHeight = node.offsetHeight,
                        line = node.scrollHeight - offsetHeight;

                    return offsetHeight + Math.max(line, 0);
                }

                function growTextarea() {
                    // temporarily disables element's flex so its height 'runs free'
                    element
                        .attr('rows', 1)
                        .css('height', 'auto')
                        .addClass('md-no-flex');

                    var height = getHeight(),
                        originalPadding,
                        maxHeight;

                    if (!lineHeight) {
                        // offsetHeight includes padding which can throw off our value
                        originalPadding = element[0].style.padding || '';
                        lineHeight = element.css('padding', 0).prop('offsetHeight');
                        element[0].style.padding = originalPadding;
                    }

                    if (minRows && lineHeight) {
                        height = Math.max(height, lineHeight * minRows);
                    }

                    if (maxRows && lineHeight) {
                        maxHeight = lineHeight * maxRows;

                        if (maxHeight < height) {
                            element.attr('md-no-autogrow', '');
                            height = maxHeight;
                        } else {
                            element.removeAttr('md-no-autogrow');
                        }
                    }

                    if (lineHeight) {
                        element.attr('rows', Math.round(height / lineHeight));
                    }

                    element
                        .css('height', height + 'px')
                        .removeClass('md-no-flex');
                }

                function formattersListener(value) {
                    $mdUtil.nextTick(
						growTextarea,
						false		// nextTick was undefined (default true)
					);
                    return value;
                }

                function disableAutogrow() {
                    if (!isAutogrowing) { return; }

                    isAutogrowing = false;
                    angular.element($window).off('resize', growTextarea);

                    if (scopeResizeListener) {
                        scopeResizeListener();
                    }

                    element
                        .attr('md-no-autogrow', '')
                        .off('input', growTextarea);

                    if (hasNgModel) {
                        var listenerIndex = ngModelCtrl.$formatters.indexOf(formattersListener);

                        if (listenerIndex > -1) {
                            ngModelCtrl.$formatters.splice(listenerIndex, 1);
                        }
                    }
                }

                function attachResizeHandle() {
                    if (attr.hasOwnProperty('mdNoResize')) { return; }

                    var handle = angular.element('<div class="md-resize-handle"></div>'),
                        isDragging = false,
                        dragStart = null,
                        startHeight = 0,
                        container = containerCtrl.element,
                        dragGestureHandler = $mdGesture.register(handle, 'drag', {
                            horizontal: false
                        });

                    function onMouseDown(ev) {
                        ev.preventDefault();
                        isDragging = true;
                        dragStart = ev.clientY;
                        startHeight = parseFloat(element.css('height')) || element.prop('offsetHeight');
                    }

                    function onDragStart(ev) {
                        if (!isDragging) { return; }

                        ev.preventDefault();
                        disableAutogrow();
                        container.addClass('md-input-resized');
                    }

                    function onDrag(ev) {
                        if (!isDragging) { return; }

						element.css('height', (startHeight + ev.pointer.distanceY) + 'px');
                    }

                    function onDragEnd() {
                        if (!isDragging) { return; }

                        isDragging = false;
                        container.removeClass('md-input-resized');
                    }

                    element.wrap('<div class="md-resize-wrapper">').after(handle);
                    handle.on('mousedown', onMouseDown);

                    container
                        .on('$md.dragstart', onDragStart)
                        .on('$md.drag', onDrag)
                        .on('$md.dragend', onDragEnd);

                    scope.$on(
						'$destroy',
						function () {
							handle
								.off('mousedown', onMouseDown)
								.remove();

							container
								.off('$md.dragstart', onDragStart)
								.off('$md.drag', onDrag)
								.off('$md.dragend', onDragEnd);
	
							dragGestureHandler();
							handle = null;
							container = null;
							dragGestureHandler = null;
						}
					);
                }

                attachResizeHandle();

                // Can't check if height was or not explicity set,
                // so rows attribute will take precedence if present
                minRows = attr.hasOwnProperty('rows') ? parseInt(attr.rows, 10) : NaN;
                maxRows = attr.hasOwnProperty('maxRows') ? parseInt(attr.maxRows, 10) : NaN;
                scopeResizeListener = scope.$on('md-resize-textarea', growTextarea);
                lineHeight = null;
                node = element[0];

                $timeout(
					function ng_md_ui_input_ITDir_to() {
						$mdUtil.nextTick(
							growTextarea,
							false	// nextTick was undefined (default true)
						);
					},
					10,
					false
				);

                element.on('input', growTextarea);

                if (hasNgModel) {
                    ngModelCtrl.$formatters.push(formattersListener);
                }

                if (!minRows) {
                    element.attr('rows', 1);
                }

                angular.element($window).on('resize', growTextarea);
                scope.$on('$destroy', disableAutogrow);

                // Attach a watcher to detect when the textarea gets shown.
                if (attr.hasOwnProperty('mdDetectHidden')) {

                    handleHiddenChange = (function () {
                        var wasHidden = false;

                        return function () {
                            var isHidden = node.offsetHeight === 0;

                            if (isHidden === false && wasHidden === true) {
                                growTextarea();
                            }

                            wasHidden = isHidden;
                        };
                    }());

                    // Check every digest cycle whether the visibility of the textarea has changed.
                    // Queue up to run after the digest cycle is complete.
                    scope.$watch(function () {
                        $mdUtil.nextTick(
							handleHiddenChange,
							false
						);
                        return true;
                    });
                }
            }

            setupAttributeWatchers();

            // Add an error spacer div after our input to provide space for the char counter and any ng-messages
            errorsSpacer = angular.element('<div class="md-errors-spacer">');
            element.after(errorsSpacer);

            placeholderText = angular.isString(attr.placeholder) ? attr.placeholder.trim() : '';

			if (!containerCtrl.label && !placeholderText.length) {
				$mdAria.expect(element, 'aria-label');
			}

            element.addClass('md-input');

            if (!element.attr('id')) {
                element.attr('id', 'input_' + $mdUtil.nextUid());
            }

            if (tagName === 'input' && attr.type === 'number' && attr.min && attr.max && !attr.step) {
                element.attr('step', 'any');
            } else if (tagName === 'textarea') {
                setupTextarea();
            }

            if (!hasNgModel) {
                inputCheckValue();
            }

            isErrorGetter = containerCtrl.isErrorGetter || function () {
                return ngModelCtrl.$invalid && (ngModelCtrl.$touched || (parentForm && parentForm.$submitted));
            };

            scope.$watch(isErrorGetter, containerCtrl.setInvalid);

            if (attr.ngValue) {
                attr.$observe('value', inputCheckValue);
            }

            ngModelCtrl.$parsers.push(ngModelPipelineCheckValue);
            ngModelCtrl.$formatters.push(ngModelPipelineCheckValue);

            element.on('input', inputCheckValue);

            if (!isReadonly) {
                element
                    .on('focus', function () {
                        $mdUtil.nextTick(
							function () {
								containerCtrl.setFocused(true);
							},
							false	// nextTick was undefined (default true)
						);
                    })
                    .on('blur', function () {
                        $mdUtil.nextTick(
							function () {
								containerCtrl.setFocused(false);
								inputCheckValue();
							},
							false	// nextTick was undefined (default true)
						);
                    });
            }

            scope.$on(
				'$destroy',
				function ng_md_ui_input_textarea_postlink_on() {
					containerCtrl.setFocused(false);
					containerCtrl.setHasValue(false);
					containerCtrl.input = null;
				}
			);
        }

        return {
            restrict: 'E',
            require: ['^?mdInputContainer', '?ngModel', '?^form'],
            link: postLink
        };
    }

    function mdMaxlengthDirective($animate, $mdUtil) {

        function postLink(scope, element, attr, ctrls) {
            var maxlength = parseInt(attr.mdMaxlength),
                ngModelCtrl = ctrls[0],
                containerCtrl = ctrls[1],
                charCountEl,
				errorsSpacer,
				ngTrim = angular.isDefined(attr.ngTrim) ? $mdUtil.parseAttributeBoolean(attr.ngTrim) : true,
				isPasswordInput = attr.type === 'password';

			if (isNaN(maxlength)) maxlength = -1;

			function calculateInputValueLength(value) {
				value = ngTrim && !isPasswordInput && angular.isString(value) ? value.trim() : value;

				if (value === undefined || value === null) { value = ''; }

				return String(value).length;
			}

			function renderCharCount() {
				// If we have not been initialized or appended to the body yet; do not render.
				if (!charCountEl || !charCountEl.parent()) { return; }

				charCountEl.text(calculateInputValueLength(element.val()) + ' / ' + maxlength);
			}

            ngModelCtrl.$validators['md-maxlength'] = function (modelValue, viewValue) {

				if (!angular.isNumber(maxlength) || maxlength < 0) { return true; }

				// We always update the char count, when the modelValue has changed.
				// Using the $validators for triggering the update works very well.
				renderCharCount();

				var elementVal = element.val() || viewValue;

				if (elementVal === undefined || elementVal === null) { elementVal = ''; }

				elementVal = ngTrim && !isPasswordInput && angular.isString(elementVal) ? elementVal.trim() : elementVal;

				// Force the value into a string since it may be a number,
				// which does not have a length property.
				return String(elementVal).length <= maxlength;
			};

			ngModelCtrl.$isEmpty = function (value) {
				return calculateInputValueLength(value) === 0;
			};

            $mdUtil.nextTick(
				function () {

					errorsSpacer = angular.element(containerCtrl.element[0].querySelector('.md-errors-spacer'));
					charCountEl = angular.element('<div class="md-char-counter">');

					errorsSpacer.append(charCountEl);

					attr.$observe(
						'ngTrim',
						function (value) {
							ngTrim = angular.isDefined(value) ? $mdUtil.parseAttributeBoolean(value) : true;
						}
					);

					scope.$watch(attr.mdMaxlength, function (value) {
						maxlength = value;
						if (angular.isNumber(value) && value > 0) {
							if (!charCountEl.parent().length) {
								$animate.enter(charCountEl, errorsSpacer);
							}
							renderCharCount();
						} else {
							$animate.leave(charCountEl);
						}
					});
				},
				true	// nextTick was undefined (default true)
			);
        }

        return {
            restrict: 'A',
            require: ['ngModel', '^mdInputContainer'],
            link: postLink
        };
    }

    function placeholderDirective($compile) {

        function preLink(scope, element, attr, inputContainer) {
            // If there is no input container, just return
            if (!inputContainer) { return; }

            var label = inputContainer.element.find('label'),
                noFloat = inputContainer.element.attr('md-no-float'),
                newLabel;

            // If we have a label, or they specify the md-no-float attribute, just return
            if ((label && label.length) || noFloat === '' || scope.$eval(noFloat)) {
                // Add a placeholder class so we can target it in the CSS
                inputContainer.setHasPlaceholder(true);
                return;
            }

            // md-select handles placeholders on it's own
            if (element[0].nodeName !== 'MD-SELECT') {
                // Move the placeholder expression to the label
                newLabel = angular.element('<label ng-click="delegateClick()" tabindex="-1">' + attr.placeholder + '</label>');

                attr.$set('placeholder', null);

                inputContainer.element
                    .addClass('md-icon-float')
                    .prepend(newLabel);

                $compile(newLabel)(scope);
            }
        }

        return {
            restrict: 'A',
            require: '^^?mdInputContainer',
            priority: 200,
            link: {
                pre: preLink
            }
        };
    }

    function mdSelectOnFocusDirective($document, $timeout) {

        function postLink(scope, element) {

            if (element[0].nodeName !== 'INPUT' && element[0].nodeName !== "TEXTAREA") { return; }

            var preventMouseUp = false;

            function onFocus() {

                preventMouseUp = true;

                $timeout(
					function ng_md_ui_input_mdSelectOnFocusDir_to() {
						if ($document[0].activeElement === element[0]) {
							element[0].select();
						}

						preventMouseUp = false;
					},
					10,
					false
				);
            }

            function onMouseUp(event) {
                if (preventMouseUp) {
                    event.preventDefault();
                }
            }

            element
                .on('focus', onFocus)
                .on('mouseup', onMouseUp);

            scope.$on(
				'$destroy',
				function ng_md_ui_input_mdSelectOnFocusDir_on() {
					element
						.off('focus', onFocus)
						.off('mouseup', onMouseUp);
				}
			);
        }

        return {
            restrict: 'A',
            link: postLink
        };
    }

    function ngMessagesDirective() {

        function hasVisibiltyDirective(attrs) {
            return visibilityDirectives.some(function (attr) {
                return attrs[attr];
            });
        }

        function postLink(scope_na, element, attrs, inputContainer) {
            // If we are not a child of an input container, don't do anything
            if (!inputContainer) { return; }

            // Add our animation class
            element.toggleClass('md-input-messages-animation', true);

            // Add our md-auto-hide class to automatically hide/show messages when container is invalid
            element.toggleClass('md-auto-hide', true);

            // If we see some known visibility directives, remove the md-auto-hide class
            if (attrs.mdAutoHide === 'false' || hasVisibiltyDirective(attrs)) {
                element.toggleClass('md-auto-hide', false);
            }
        }

        return {
            restrict: 'EA',
            link: postLink,
            require: '^^?mdInputContainer'
        };
    }

    function ngMessageDirective($mdUtil) {

        function compile(tElement) {

            function isInsideFragment() {
                var nextNode = tElement[0];

                nextNode = nextNode.parentNode;

                while (nextNode) {
                    if (nextNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                        return true;
                    }
                    nextNode = nextNode.parentNode;
                }

                return false;
            }

            function isInsideInputContainer(element) {
                return !!$mdUtil.getClosest(element, "md-input-container");
            }

            function initMessageElement(element) {
                // Add our animation class
                element.toggleClass('md-input-message-animation', true);
            }

            if (!isInsideInputContainer(tElement)) {
                if (isInsideFragment()) {
                    return function (scope_na, element) {
                        if (isInsideInputContainer(element)) {
                            initMessageElement(tElement);
                        }
                    };
                }
            } else {
                initMessageElement(tElement);
            }

            return undefined;
        }

        return {
            restrict: 'EA',
            compile: compile,
            priority: 100
        };
    }

    function getMessagesElement(element) {
		if (element.hasClass('md-input-messages-animation')) {
			return element;
		}

        if (element.hasClass('md-input-message-animation')) {
            return angular.element(
				$mdUtil_inp.getClosest(
					element,
					function (node) {
						return node.classList.contains('md-input-messages-animation');
					}
				)
			);
        }

        // Otherwise, we can traverse down
        return angular.element(element[0].querySelector('.md-input-messages-animation'));
    }

    function getInputElement(element) {
        var inputContainer = element.controller('mdInputContainer');

        return inputContainer.element;
    }

    function showMessage(element) {
        var height = parseInt(window.getComputedStyle(element[0]).height, 10),
            topMargin = parseInt(window.getComputedStyle(element[0]).marginTop, 10),
            messages = getMessagesElement(element),
            container = getInputElement(element),
            alreadyVisible = (topMargin > -height);

        // If we have the md-auto-hide class, the md-input-invalid animation will fire, so we can skip
        if (alreadyVisible || (messages.hasClass('md-auto-hide') && !container.hasClass('md-input-invalid'))) {
            return $animateCss_inp(element, {});
        }

        return $animateCss_inp(element, {
            event: 'enter',
            structural: true,
            from: {
                "opacity": 0,
                "margin-top": -height + "px"
            },
            to: {
                "opacity": 1,
                "margin-top": "0"
            },
            duration: 0.3
        });
    }

    function showInputMessages(element, done) {
        var animators = [],
            animator,
            messages = getMessagesElement(element),
			children = messages.children(),
			errorsSpacer;

		if (messages.length === 0 || children.length === 0) {
			errorsSpacer = angular.element(element[0].querySelector('.md-errors-spacer'));
			if (!errorsSpacer) {
				msos.console.warn('ng.material.ui.input - showInputMessages -> mdInput is missing display element for: ', element);
			}
			done();
			return;
		}

        angular.forEach(
			children,
			function (child) {
				animator = showMessage(angular.element(child));

				animators.push(animator.start());
			}
		);

        $$AnimateRunner_inp.all(animators, done);
    }

    function mdInputInvalidMessagesAnimation($$AnimateRunner, $animateCss, $mdUtil) {
        saveSharedServices($$AnimateRunner, $animateCss, $mdUtil);

        return {
            addClass: function (element, className_na, done) {
                showInputMessages(element, done);
            }
        };
    }

    function hideMessage(element) {
        var height = element[0].offsetHeight,
            styles = window.getComputedStyle(element[0]);

        // If we are already hidden, just return an empty animation
        if (parseInt(styles.opacity) === 0) {
            return $animateCss_inp(element, {});
        }

        // Otherwise, animate
        return $animateCss_inp(element, {
            event: 'leave',
            structural: true,
            from: {
                "opacity": 1,
                "margin-top": 0
            },
            to: {
                "opacity": 0,
                "margin-top": -height + "px"
            },
            duration: 0.3
        });
    }

    function hideInputMessages(element, done) {
        var animators = [],
            animator,
            messages = getMessagesElement(element),
			children = messages.children(),
			errorsSpacer;

		if (messages.length === 0 || children.length === 0) {
			errorsSpacer = angular.element(element[0].querySelector('.md-errors-spacer'));
			if (!errorsSpacer) {
				msos.console.warn('ng.material.ui.input - hideInputMessages -> mdInput is missing display element for: ', element);
			}
			done();

			return;
		}

        angular.forEach(
			children,
			function (child) {
				animator = hideMessage(angular.element(child));

				animators.push(animator.start());
			}
		);

        $$AnimateRunner_inp.all(animators, done);
    }
    
    function ngMessagesAnimation($$AnimateRunner, $animateCss, $mdUtil) {
        saveSharedServices($$AnimateRunner, $animateCss, $mdUtil);

        return {
            enter: function (element, done) {
                showInputMessages(element, done);
            },

            leave: function (element, done) {
                hideInputMessages(element, done);
            },

            addClass: function (element, className, done) {
                if (className === "ng-hide") {
                    hideInputMessages(element, done);
                } else {
                    done();
                }
            },

            removeClass: function (element, className, done) {
                if (className === "ng-hide") {
                    showInputMessages(element, done);
                } else {
                    done();
                }
            }
        };
    }

    function ngMessageAnimation($$AnimateRunner, $animateCss, $mdUtil) {

        saveSharedServices($$AnimateRunner, $animateCss, $mdUtil);

        return {
            enter: function (element, done) {
                var animator = showMessage(element);

                animator.start().done(done);
            },

            leave: function (element, done) {
                var animator = hideMessage(element);

                animator.start().done(done);
            }
        };
    }


    angular.module(
        'ng.material.ui.input',
        [
            'ng',
			'ng.messages',
            'ng.material.core',
            'ng.material.core.theming',
            'ng.material.core.gestures',
            'ng.material.ui.aria'
        ]
    ).directive(
        'mdInputContainer',
        ["$mdTheming", "$parse", mdInputContainerDirective]
    ).directive(
        'label',
        labelDirective
    ).directive(
        'input',
        ["$mdUtil", "$window", "$mdAria", "$timeout", "$mdGesture", inputTextareaDirective]
    ).directive(
        'textarea',
        ["$mdUtil", "$window", "$mdAria", "$timeout", "$mdGesture", inputTextareaDirective]
    ).directive(
        'mdMaxlength',
        ["$animate", "$mdUtil", mdMaxlengthDirective]
    ).directive(
        'placeholder',
        ["$compile", placeholderDirective]
    ).directive(
        'ngMessages',
        ngMessagesDirective
    ).directive(
        'ngMessage',
        ["$mdUtil", ngMessageDirective]
    ).directive(
        'ngMessageExp',
        ["$mdUtil", ngMessageDirective]
    ).directive(
        'mdSelectOnFocus',
        ["$document", "$timeout", mdSelectOnFocusDirective]
    ).directive(
		'mdNoFloat',
		angular.restrictADir
	).directive(
		'mdAutoHide',
		angular.restrictADir
	).animation(
        '.md-input-invalid',
        ["$$AnimateRunner", "$animateCss", "$mdUtil", mdInputInvalidMessagesAnimation]
    ).animation(
        '.md-input-messages-animation',
        ["$$AnimateRunner", "$animateCss", "$mdUtil", ngMessagesAnimation]
    ).animation(
        '.md-input-message-animation',
        ["$$AnimateRunner", "$animateCss", "$mdUtil", ngMessageAnimation]
    ).service(
        'mdInputInvalidAnimation',
        ["$$AnimateRunner", "$animateCss", "$mdUtil", mdInputInvalidMessagesAnimation]
    ).service(
        'mdInputMessagesAnimation', ["$$AnimateRunner", "$animateCss", "$mdUtil", ngMessagesAnimation]
    ).service(
        'mdInputMessageAnimation', ["$$AnimateRunner", "$animateCss", "$mdUtil", ngMessageAnimation]
    );

}());
