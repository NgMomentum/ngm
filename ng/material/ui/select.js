
/**
 * @ngdoc module
 * @name material.components.select
 */

/*global
    msos: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.select");
msos.require("ng.material.core.animator");
msos.require("ng.material.core.theming");
msos.require("ng.material.core.interim");
msos.require("ng.material.core.ripple");
msos.require("ng.material.ui.aria");
msos.require("ng.material.ui.input");			// ref. label
msos.require("ng.material.ui.backdrop");
msos.require("ng.material.ui.content");			// ref. templates
msos.require("ng.material.ui.progresscir");		// ref. templates

ng.material.ui.select.version = new msos.set_version(18, 5, 18);

// Load AngularJS-Material module specific CSS
ng.material.ui.select.css = new msos.loader();
ng.material.ui.select.css.load(msos.resource_url('ng', 'material/css/ui/select.css'));


(function () {
    "use strict";

    var SELECT_EDGE_MARGIN = 8,
		selectNextId = 0,
		CHECKBOX_SELECTION_INDICATOR = angular.element('<div class="md-container"><div class="md-icon"></div></div>');

    function SelectDirective($mdSelect, $mdUtil, $mdConstant, $mdTheming, $mdAria, $parse, $sce) {

        function compile(element, attr) {
            var valueEl = angular.element('<md-select-value><span></span></md-select-value>'),
				mdContentEl,
				autofillClone,
				opts,
				isMultiple,
				multipleContent,
				selectTemplate;

            valueEl.append('<span class="md-select-icon" aria-hidden="true"></span>');
            valueEl.addClass('md-select-value');

            if (!valueEl[0].hasAttribute('id')) {
                valueEl.attr('id', 'select_value_label_' + $mdUtil.nextUid());
            }

            mdContentEl = element.find('md-content');

            if (!mdContentEl.length) {
                element.append(angular.element('<md-content>').append(element.contents()));
            }

            mdContentEl.attr('role', 'presentation');

            if (attr.mdOnOpen) {

                element
                    .find('md-content')
                    .prepend(
						angular.element(
							'<div>' +
								' <md-progress-circular md-mode="indeterminate" ng-if="$$loadingAsyncDone === false" md-diameter="25px"></md-progress-circular>' +
							'</div>'
						)
					);

                element
                    .find('md-option')
                    .attr('ng-show', '$$loadingAsyncDone');
            }

            if (attr.name) {

                autofillClone = angular.element('<select class="md-visually-hidden"></select>');

                autofillClone.attr({
                    'name': attr.name,
                    'aria-hidden': 'true',
                    'tabindex': '-1'
                });

                opts = element.find('md-option');

                angular.forEach(
					opts,
					function (el) {
						var newEl = angular.element('<option>' + el.innerHTML + '</option>');

						if (el.hasAttribute('ng-value'))	{ newEl.attr('ng-value',	el.getAttribute('ng-value')); }
						else if (el.hasAttribute('value'))	{ newEl.attr('value',		el.getAttribute('value')); }
                    autofillClone.append(newEl);
                });

                autofillClone.append(
                    '<option ng-value="' + attr.ngModel + '" selected></option>'
                );

                element.parent().append(autofillClone);
            }

            isMultiple = $mdUtil.parseAttributeBoolean(attr.multiple);

            // Use everything that's left inside element.contents() as the contents of the menu
            multipleContent = isMultiple ? 'multiple' : '';
            selectTemplate = '' +
                '<div class="md-select-menu-container" aria-hidden="true" role="presentation">' +
                '<md-select-menu role="presentation" {0}>{1}</md-select-menu>' +
                '</div>';

            selectTemplate = $mdUtil.supplant(selectTemplate, [multipleContent, element.html()]);
            element.empty().append(valueEl);
            element.append(selectTemplate);

            if (!attr.tabindex) {
                attr.$set('tabindex', 0);
            }

            return function postLink(scope, element, attr, ctrls) {
                var untouched = true,
					isDisabled, ariaLabelBase,
					containerCtrl = ctrls[0],
					mdSelectCtrl = ctrls[1],
					ngModelCtrl = ctrls[2],
					formCtrl = ctrls[3],
					valueEl = element.find('md-select-value'),
					isReadonly = angular.isDefined(attr.readonly),
					disableAsterisk = $mdUtil.parseAttributeBoolean(attr.mdNoAsterisk),
					isErrorGetter,
					selectContainer,
					selectScope,
					selectMenuCtrl,
					originalRender,
					deregisterWatcher,
					ariaAttrs,
					containerId;

                if (disableAsterisk) {
                    element.addClass('md-no-asterisk');
                }

                if (containerCtrl) {
                    isErrorGetter = containerCtrl.isErrorGetter || function () {
                        return ngModelCtrl.$invalid && (ngModelCtrl.$touched || (formCtrl && formCtrl.$submitted));
                    };

                    if (containerCtrl.input) {
                        if (element.find('md-select-header').find('input')[0] !== containerCtrl.input[0]) {
                            throw new Error("<md-input-container> can only have *one* child <input>, <textarea> or <select> element!");
                        }
                    }

                    containerCtrl.input = element;

                    if (!containerCtrl.label) {
                        $mdAria.expect(element, 'aria-label', element.attr('placeholder'));
                    }

                    scope.$watch(isErrorGetter, containerCtrl.setInvalid);
                }

                findSelectContainer();
                $mdTheming(element);

                if (formCtrl && angular.isDefined(attr.multiple)) {
                    $mdUtil.nextTick(
						function () {
							var hasModelValue = ngModelCtrl.$modelValue || ngModelCtrl.$viewValue;
	
							if (hasModelValue) { formCtrl.$setPristine(); }
						},
						true	// nextTick was undefined (default true)
					);
                }

                originalRender = ngModelCtrl.$render;

                ngModelCtrl.$render = function () {
                    originalRender();
                    syncLabelText();
                    syncAriaLabel();
                    inputCheckValue();
                };

                attr.$observe('placeholder', ngModelCtrl.$render);

                if (containerCtrl && containerCtrl.label) {
                    attr.$observe(
						'required',
						function (value) {
							containerCtrl.label.toggleClass('md-required', value && !disableAsterisk);
						}
					);
                }

                mdSelectCtrl.setLabelText = function (text) {

                    mdSelectCtrl.setIsPlaceholder(!text);

                    var isSelectLabelFromUser = false,
						tmpPlaceholder,
						target;

                    if (attr.mdSelectedText && attr.mdSelectedHtml) {
                        throw Error('md-select cannot have both `md-selected-text` and `md-selected-html`');
                    }

                    if (attr.mdSelectedText || attr.mdSelectedHtml) {
                        text = $parse(attr.mdSelectedText || attr.mdSelectedHtml)(scope);
                        isSelectLabelFromUser = true;
                    } else if (!text) {
                        // Use placeholder attribute, otherwise fallback to the md-input-container label
                        tmpPlaceholder = attr.placeholder || (containerCtrl && containerCtrl.label ? containerCtrl.label.text() : '');

                        text = tmpPlaceholder || '';
                        isSelectLabelFromUser = true;
                    }

                    target = valueEl.children().eq(0);

                    if (attr.mdSelectedHtml) {
                        target.html($sce.getTrustedHtml(text));
                    } else if (isSelectLabelFromUser) {
                        target.text(text);
                    } else {
                        target.html(text);
                    }
                };

                mdSelectCtrl.setIsPlaceholder = function (isPlaceholder) {
                    if (isPlaceholder) {
                        valueEl.addClass('md-select-placeholder');

                        if (containerCtrl && containerCtrl.label) {
                            containerCtrl.label.addClass('md-placeholder');
                        }
                    } else {
                        valueEl.removeClass('md-select-placeholder');

                        if (containerCtrl && containerCtrl.label) {
                            containerCtrl.label.removeClass('md-placeholder');
                        }
                    }
                };

                if (!isReadonly) {

                    element.on(
						'focus',
						function () { if (containerCtrl) { containerCtrl.setFocused(true); } }
					);

                    element.on(
						'blur',
						function (event) {

							if (untouched) {
								untouched = false;
								if (selectScope._mdSelectIsOpen) {
									event.stopImmediatePropagation();
								}
							}

							if (selectScope._mdSelectIsOpen) { return; }

							if (containerCtrl) { containerCtrl.setFocused(false); }

							inputCheckValue();
						}
					);
                }

                mdSelectCtrl.triggerClose = function () {
                    $parse(attr.mdOnClose)(scope);
                };

                scope.$$postDigest(function () {
                    initAriaLabel();
                    syncLabelText();
                    syncAriaLabel();
                });

                function initAriaLabel() {
                    var labelText = element.attr('aria-label') || element.attr('placeholder');

                    if (!labelText && containerCtrl && containerCtrl.label) {
                        labelText = containerCtrl.label.text();
                    }

                    ariaLabelBase = labelText;
                    $mdAria.expect(element, 'aria-label', labelText);
                }

                scope.$watch(
					function () {
						return selectMenuCtrl.selectedLabels();
					},
					syncLabelText
				);

                function syncLabelText() {
                    if (selectContainer) {
                        selectMenuCtrl = selectMenuCtrl || selectContainer.find('md-select-menu').controller('mdSelectMenu');
                        mdSelectCtrl.setLabelText(selectMenuCtrl.selectedLabels());
                    }
                }

                function syncAriaLabel() {
                    if (!ariaLabelBase) { return; }

                    var ariaLabels = selectMenuCtrl.selectedLabels({
                        mode: 'aria'
                    });

                    element.attr('aria-label', ariaLabels.length ? ariaLabelBase + ': ' + ariaLabels : ariaLabelBase);
                }

                attr.$observe(
					'ngMultiple',
					function (val) {
						var parser;

						if (deregisterWatcher) { deregisterWatcher(); }

						parser = $parse(val);

						deregisterWatcher = scope.$watch(
							function () {
								return parser(scope);
							},
							function (multiple, prevVal) {

								if (multiple === undefined && prevVal === undefined) { return; }	// assume compiler did a good job

								if (multiple) {
									element.attr('multiple', 'multiple');
								} else {
									element.removeAttr('multiple');
								}

								element.attr('aria-multiselectable', multiple ? 'true' : 'false');

								if (selectContainer) {
									selectMenuCtrl.setMultiple(multiple);
									originalRender = ngModelCtrl.$render;

									ngModelCtrl.$render = function () {

										originalRender();
										syncLabelText();
										syncAriaLabel();
										inputCheckValue();
									};

									ngModelCtrl.$render();
								}
							}
						);
					}
				);

                attr.$observe(
					'disabled',
					function (disabled) {

						if (angular.isString(disabled)) { disabled = true; }

						if (isDisabled !== undefined && isDisabled === disabled) { return; }

                    	sDisabled = disabled;

						if (disabled) {

							element.attr({'aria-disabled': 'true' })
								.removeAttr('tabindex')
								.off('click', openSelect)
								.off('keydown', handleKeypress);
						} else {
							element.attr({
									'tabindex': attr.tabindex,
									'aria-disabled': 'false'
								})
								.on('click', openSelect)
								.on('keydown', handleKeypress);
						}
					}
				);

                if (!attr.hasOwnProperty('disabled') && !attr.hasOwnProperty('ngDisabled')) {

                    element.attr({ 'aria-disabled': 'false' });

                    element.on('click', openSelect);
                    element.on('keydown', handleKeypress);
                }

                ariaAttrs = {
                    role: 'listbox',
                    'aria-expanded': 'false',
                    'aria-multiselectable': isMultiple && !attr.ngMultiple ? 'true' : 'false'
                };

                if (!element[0].hasAttribute('id')) {
                    ariaAttrs.id = 'select_' + $mdUtil.nextUid();
                }

                containerId = 'select_container_' + $mdUtil.nextUid();

                selectContainer.attr('id', containerId);

                if (!element.find('md-select-menu').length) {
                    ariaAttrs['aria-owns'] = containerId;
                }

                element.attr(ariaAttrs);

                scope.$on(
					'$destroy',
					function ng_md_ui_select_postlink_on() {
                    $mdSelect
                        .destroy()
                        .finally(
							function () {
								if (containerCtrl) {
									containerCtrl.setFocused(false);
									containerCtrl.setHasValue(false);
									containerCtrl.input = null;
								}
								ngModelCtrl.$setTouched();
							}
						);
					}
				);

                function inputCheckValue() {
					if (containerCtrl) { containerCtrl.setHasValue(selectMenuCtrl.selectedLabels().length > 0 || (element[0].validity || {}).badInput); }
                }

                function findSelectContainer() {
					var value;

                    selectContainer = angular.element(
                        element[0].querySelector('.md-select-menu-container')
                    );

                    selectScope = scope;

                    if (attr.mdSelectContainerClass) {
                        value = selectContainer[0].getAttribute('class') + ' ' + attr.mdSelectContainerClass;
                        selectContainer[0].setAttribute('class', value);
                    }

                    selectMenuCtrl = selectContainer.find('md-select-menu').controller('mdSelectMenu');
                    selectMenuCtrl.init(ngModelCtrl, attr.ngModel);

                    element.on(
						'$destroy',
						function ng_md_ui_select_findSelectContainer_on() { selectContainer.remove(); }
					);
                }

                function handleKeypress(e) {
					var node,
						optionCtrl;

                    if ($mdConstant.isNavigationKey(e)) {
                        e.preventDefault();
                        openSelect(e);
                    } else {
                        if (shouldHandleKey(e, $mdConstant)) {
                            e.preventDefault();

                            node = selectMenuCtrl.optNodeForKeyboardSearch(e);

                            if (!node || node.hasAttribute('disabled')) { return; }

                            optionCtrl = angular.element(node).controller('mdOption');

                            if (!selectMenuCtrl.isMultiple) {
                                selectMenuCtrl.deselect(Object.keys(selectMenuCtrl.selected)[0]);
                            }

                            selectMenuCtrl.select(optionCtrl.hashKey, optionCtrl.value);
                            selectMenuCtrl.refreshViewValue();
                        }
                    }
                }

                function openSelect() {

                    selectScope._mdSelectIsOpen = true;
                    element.attr('aria-expanded', 'true');

                    $mdSelect.show({
                        scope: selectScope,
                        preserveScope: true,
                        skipCompile: true,
                        element: selectContainer,
                        target: element[0],
                        selectCtrl: mdSelectCtrl,
                        preserveElement: true,
                        hasBackdrop: true,
                        loadingAsync: attr.mdOnOpen ? scope.$eval(attr.mdOnOpen) || true : false
                    }).finally(
						function () {
							selectScope._mdSelectIsOpen = false;
							element.focus();
							element.attr('aria-expanded', 'false');
							ngModelCtrl.$setTouched();
						}
					);
                }
            };
        }

        return {
            restrict: 'E',
            require: ['^?mdInputContainer', 'mdSelect', 'ngModel', '?^form'],
            compile: compile,
            controller: function () { msos.console.debug('ng.material.ui.select - SelectDirective - controller -> noop called.'); }
        };
    }

    function SelectMenuDirective($parse, $mdUtil, $mdConstant, $mdTheming) {

        // We use preLink instead of postLink to ensure that the select is initialized before
        // its child options run postLink.
        function preLink(scope, element, attr, ctrls) {
            var selectCtrl = ctrls[0];

            element.addClass('_md'); // private md component indicator for styling

            $mdTheming(element);
            element.on('click', clickListener);
            element.on('keypress', keyListener);

            function keyListener(e) {
                if (e.keyCode == 13 || e.keyCode == 32) {
                    clickListener(e);
                }
            }

            function clickListener(ev) {
                var option = $mdUtil.getClosest(ev.target, 'md-option'),
					optionCtrl = option && angular.element(option).data('$mdOptionController'),
					optionHashKey,
					isSelected;

                if (!option || !optionCtrl) { return; }

                if (option.hasAttribute('disabled')) {
                    ev.stopImmediatePropagation();
                    return false;
                }

                optionHashKey = selectCtrl.hashGetter(optionCtrl.value);
                isSelected = angular.isDefined(selectCtrl.selected[optionHashKey]);

                scope.$apply(
					function () {
						if (selectCtrl.isMultiple) {
							if (isSelected) {
								selectCtrl.deselect(optionHashKey);
							} else {
								selectCtrl.select(optionHashKey, optionCtrl.value);
							}
						} else {
							if (!isSelected) {
								selectCtrl.deselect(Object.keys(selectCtrl.selected)[0]);
								selectCtrl.select(optionHashKey, optionCtrl.value);
							}
						}

						selectCtrl.refreshViewValue();
					}
				);
            }
        }

        function SelectMenuController($scope, $attrs, $element) {
            var self = this,
				deregisterCollectionWatch,
				defaultIsEmpty,
				searchStr = '',
				clearSearchTimeout,
				optNodes,
				optText,
				CLEAR_SEARCH_AFTER = 300;

            self.isMultiple = angular.isDefined($attrs.multiple);
            self.selected = {};
            self.options = {};

            $scope.$watchCollection(
				function () {
					return self.options;
				},
				function () {
					self.ngModel.$render();
				}
			);

            self.setMultiple = function (isMultiple) {
                var ngModel = self.ngModel;

                defaultIsEmpty = defaultIsEmpty || ngModel.$isEmpty;

                self.isMultiple = isMultiple;

                if (deregisterCollectionWatch) { deregisterCollectionWatch(); }

                if (self.isMultiple) {

                    ngModel.$validators['md-multiple'] = validateArray;
                    ngModel.$render = renderMultiple;

                    $scope.$watchCollection(
						self.modelBinding,
						function (value) {
							if (validateArray(value)) { renderMultiple(value); }
						}
					);

                    ngModel.$isEmpty = function (value) {
                        return !value || value.length === 0;
                    };

                } else {

                    delete ngModel.$validators['md-multiple'];
                    ngModel.$render = renderSingular;

                }

                function validateArray(modelValue, viewValue) {
                    return angular.isArray(modelValue || viewValue || []);
                }
            };

            self.optNodeForKeyboardSearch = function (e) {
				var search,
					i = 0;

				if (clearSearchTimeout) { clearTimeout(clearSearchTimeout); }
 
                clearSearchTimeout = setTimeout(
					function () {
						clearSearchTimeout = undefined;
						searchStr = '';
						optText = undefined;
						optNodes = undefined;
					},
					CLEAR_SEARCH_AFTER
				);

				searchStr += e.key;

                search = new RegExp('^' + searchStr, 'i');

                if (!optNodes) {

                    optNodes = $element.find('md-option');
                    optText = new Array(optNodes.length);

                    angular.forEach(
						optNodes,
						function (el, i) {
							optText[i] = el.textContent.trim();
						}
					);
                }

                for (i = 0; i < optText.length; i += 1) {
                    if (search.test(optText[i])) {
                        return optNodes[i];
                    }
                }
            };

            self.init = function (ngModel, binding) {
				var trackByOption,
					trackByLocals = {},
					trackByParsed;

                self.ngModel = ngModel;
                self.modelBinding = binding;

                self.ngModel.$isEmpty = function ($viewValue) {
                    return !self.options[self.hashGetter($viewValue)];
                };

                trackByOption = $mdUtil.getModelOption(ngModel, 'trackBy');

                if (trackByOption) {

                    trackByParsed = $parse(trackByOption);

                    self.hashGetter = function (value, valueScope) {
                        trackByLocals.$value = value;

                        return trackByParsed(valueScope || $scope, trackByLocals);
                    };

                } else {

                    self.hashGetter = function getHashValue(value) {

                        if (angular.isObject(value)) {
                            return 'object_' + (value.$$mdSelectId || (value.$$mdSelectId = ++selectNextId));
                        }

                        return value;
                    };
                }

                self.setMultiple(self.isMultiple);
            };

            self.selectedLabels = function (opts) {
                opts = opts || {};

                var mode = opts.mode || 'html',
					selectedOptionEls = $mdUtil.nodesToArray($element[0].querySelectorAll('md-option[selected]')),
					mapFn = null;

                if (selectedOptionEls.length) {

                    if (mode == 'html') {

                        mapFn = function (el) {
							var html,
								rippleContainer,
								checkboxContainer;

                            if (el.hasAttribute('md-option-empty')) { return ''; }

                            html = el.innerHTML;

                            rippleContainer = el.querySelector('.md-ripple-container');

                            if (rippleContainer) {
                                html = html.replace(rippleContainer.outerHTML, '');
                            }

                            checkboxContainer = el.querySelector('.md-container');

                            if (checkboxContainer) {
                                html = html.replace(checkboxContainer.outerHTML, '');
                            }

                            return html;
                        };

                    } else if (mode == 'aria') {
                        mapFn = function (el) {
                            return el.hasAttribute('aria-label') ? el.getAttribute('aria-label') : el.textContent;
                        };
                    }

                    return _.uniq(selectedOptionEls.map(mapFn)).join(', ');

                } else {
                    return '';
                }
            };

            self.select = function (hashKey, hashedValue) {
                var option = self.options[hashKey];

				if (option) { option.setSelected(true); }

                self.selected[hashKey] = hashedValue;
            };

            self.deselect = function (hashKey) {
                var option = self.options[hashKey];

				if (option) { option.setSelected(false); }

                delete self.selected[hashKey];
            };

            self.addOption = function (hashKey, optionCtrl) {

                if (angular.isDefined(self.options[hashKey])) {
                    throw new Error('Duplicate md-option values are not allowed in a select. ' +
                        'Duplicate value "' + optionCtrl.value + '" found.');
                }

                self.options[hashKey] = optionCtrl;

                if (angular.isDefined(self.selected[hashKey])) {
                    self.select(hashKey, optionCtrl.value);

                    if (angular.isDefined(self.ngModel.$modelValue) && self.hashGetter(self.ngModel.$modelValue) === hashKey) {
                        self.ngModel.$validate();
                    }

                    self.refreshViewValue();
                }
            };

            self.removeOption = function(hashKey) {
                delete self.options[hashKey];
            };

            self.refreshViewValue = function() {
                var values = [],
					option,
					hashKey,
					usingTrackBy,
					newVal,
					prevVal;

                for (hashKey in self.selected) {

                    if ((option = self.options[hashKey])) {
                        values.push(option.value);
                    } else {
                        values.push(self.selected[hashKey]);
                    }
                }

                usingTrackBy = $mdUtil.getModelOption(self.ngModel, 'trackBy');

                newVal = self.isMultiple ? values : values[0];
                prevVal = self.ngModel.$modelValue;

                if (usingTrackBy ? !angular.equals(prevVal, newVal) : (prevVal + '') !== newVal) {
                    self.ngModel.$setViewValue(newVal);
                    self.ngModel.$render();
                }
            };

            function renderMultiple() {

                var newSelectedValues = self.ngModel.$modelValue || self.ngModel.$viewValue || [],
					oldSelected,
					newSelectedHashes,
					deselected;

                if (!angular.isArray(newSelectedValues)) return;

                oldSelected = Object.keys(self.selected);

                newSelectedHashes = newSelectedValues.map(self.hashGetter);

                deselected = oldSelected.filter(
					function (hash) { return newSelectedHashes.indexOf(hash) === -1; }
				);

                deselected.forEach(self.deselect);

                newSelectedHashes.forEach(
					function (hashKey, i) { self.select(hashKey, newSelectedValues[i]); }
				);
            }

            function renderSingular() {
                var value = self.ngModel.$viewValue || self.ngModel.$modelValue;

                Object.keys(self.selected).forEach(self.deselect);
                self.select(self.hashGetter(value), value);
            }
        }

        return {
            restrict: 'E',
            require: ['mdSelectMenu'],
            scope: false,
            controller: ["$scope", "$attrs", "$element", SelectMenuController],
            link: { pre: preLink }
        };
    }

    function OptionDirective($mdButtonInkRipple, $mdUtil, $mdTheming) {

        function compile(element, attr) {
            // Manual transclusion to avoid the extra inner <span> that ng-transclude generates
            element.append(angular.element('<div class="md-text">').append(element.contents()));

            element.attr('tabindex', attr.tabindex || '0');

            if (!hasDefinedValue(attr)) {
                element.attr('md-option-empty', '');
            }

            return postLink;
        }

        function hasDefinedValue(attr) {
            var value = attr.value,
				ngValue = attr.ngValue;

            return value || ngValue;
        }

        function postLink(scope, element, attr, ctrls) {
            var optionCtrl = ctrls[0],
				selectCtrl = ctrls[1];

            $mdTheming(element);

            if (selectCtrl.isMultiple) {
                element.addClass('md-checkbox-enabled');
                element.prepend(CHECKBOX_SELECTION_INDICATOR.clone());
            }

            if (angular.isDefined(attr.ngValue)) {
                scope.$watch(attr.ngValue, setOptionValue);
            } else if (angular.isDefined(attr.value)) {
                setOptionValue(attr.value);
            } else {
                scope.$watch(
					function () {
						return element.text().trim();
					},
					setOptionValue
				);
            }

            attr.$observe(
				'disabled',
				function (disabled) {
					if (disabled) {
						element.attr('tabindex', '-1');
					} else {
						element.attr('tabindex', '0');
					}
				}
			);

            scope.$$postDigest(
				function ng_md_ui_select_postdigest() {
					attr.$observe(
						'selected',
						function (selected) {
							if (!angular.isDefined(selected)) { return; }

							if (typeof selected == 'string') { selected = true; }

							if (selected) {
								if (!selectCtrl.isMultiple) {
									selectCtrl.deselect(Object.keys(selectCtrl.selected)[0]);
								}
								selectCtrl.select(optionCtrl.hashKey, optionCtrl.value);
							} else {
								selectCtrl.deselect(optionCtrl.hashKey);
							}

							selectCtrl.refreshViewValue();
						}
					);
				}
			);

            $mdButtonInkRipple.attach(scope, element);

            configureAria();

            function setOptionValue(newValue, oldValue, prevAttempt) {
				var oldHashKey,
					newHashKey;

                if (!selectCtrl.hashGetter) {
                    if (!prevAttempt) {
                        scope.$$postDigest(
							function () { setOptionValue(newValue, oldValue, true); }
						);
                    }
                    return;
                }

                oldHashKey = selectCtrl.hashGetter(oldValue, scope);
                newHashKey = selectCtrl.hashGetter(newValue, scope);

                optionCtrl.hashKey = newHashKey;
                optionCtrl.value = newValue;

                selectCtrl.removeOption(oldHashKey, optionCtrl);
                selectCtrl.addOption(newHashKey, optionCtrl);
            }

            scope.$on(
				'$destroy',
				function ng_md_ui_select_otpdir_on() {
					selectCtrl.removeOption(optionCtrl.hashKey, optionCtrl);
				}
			);

            function configureAria() {
                var ariaAttrs = {
                    'role': 'option',
                    'aria-selected': 'false'
                };

                if (!element[0].hasAttribute('id')) {
                    ariaAttrs.id = 'select_option_' + $mdUtil.nextUid();
                }

                element.attr(ariaAttrs);
            }
        }

        function OptionController($element) {

            this.selected = false;
            this.setSelected = function (isSelected) {

                if (isSelected && !this.selected) {
                    $element.attr({
                        'selected': 'selected',
                        'aria-selected': 'true'
                    });
                } else if (!isSelected && this.selected) {
                    $element.removeAttr('selected');
                    $element.attr('aria-selected', 'false');
                }

                this.selected = isSelected;
            };
        }

        return {
            restrict: 'E',
            require: ['mdOption', '^^mdSelectMenu'],
            controller: ["$element", OptionController],
            compile: compile
        };
    }

    function OptgroupDirective() {

        function compile(el, attrs) {

            if (!hasSelectHeader()) {
                setupLabelElement();
            }

            function hasSelectHeader() {
                return el.parent().find('md-select-header').length;
            }

            function setupLabelElement() {
                var labelElement = el.find('label');

                if (!labelElement.length) {
                    labelElement = angular.element('<label>');
                    el.prepend(labelElement);
                }

                labelElement.addClass('md-container-ignore');
                labelElement.attr('aria-hidden', 'true');

                if (attrs.label) { labelElement.text(attrs.label); }
            }
        }

        return {
            restrict: 'E',
            compile: compile
        };
    }

    function SelectHeaderDirective() {
        return {
            restrict: 'E',
        };
    }

    function SelectValueDirective() {
        return {
            restrict: 'E',
        };
    }

    function SelectProvider($$interimElementProvider) {

        function selectDefaultOptions($mdSelect, $mdConstant, $mdUtil, $$mdAnimate, $window, $q, $$rAF, $animateCss, $animate, $document) {
            var ERROR_TARGET_EXPECTED = "$mdSelect.show() expected a target element in options.target but got '{0}'!",
				animator = $$mdAnimate($mdUtil),
				keyCodes = $mdConstant.KEY_CODE;

            function onRemove(scope, element, opts) {
                var animationRunner = null,
					destroyListener = scope.$on(
						'$destroy',
						function ng_md_ui_select_prov_on() { animationRunner.end(); }
					);

                opts = opts || {};
                opts.cleanupInteraction();
                opts.cleanupResizing();
                opts.hideBackdrop();

                function animateRemoval() {
                    animationRunner = $animateCss(element, {
                        addClass: 'md-leave',
						duration: 0.1
                    });
                    return animationRunner.start();
                }

                function cleanElement() {

                    destroyListener();

                    element
                        .removeClass('md-active')
                        .attr('aria-hidden', 'true')
                        .css('display', 'none');

                    element
						.parent()
						.find('md-select-value')
						.removeAttr('aria-hidden');

                    announceClosed(opts);

                    if (!opts.$destroy && opts.restoreFocus) { opts.target.focus(); }
                }

				return (opts.$destroy === true) ? cleanElement() : animateRemoval().then(cleanElement);
            }

            function onShow(scope, element, opts) {

                watchAsyncLoad();
                sanitizeAndConfigure(scope, opts);

                opts.hideBackdrop = showBackdrop(scope, element, opts);

                function showDropDown(scope, element, opts) {

                    if (opts.parent !== element.parent()) {
                        element.parent().attr('aria-owns', element.attr('id'));
                    }

                    element.parent().find('md-select-value').attr('aria-hidden', 'true');

                    opts.parent.append(element);

                    return $q(
						function(resolve, reject) {

							try {
								$animateCss(element, {
										removeClass: 'md-leave',
										duration: 0.1
									})
									.start()
									.then(positionAndFocusMenu)
									.then(resolve);

							} catch (e) {
								reject(e);
							}
						},
						'ng_material_ui_select_show_DD'
					);
                }

                function positionAndFocusMenu() {

                    return $q(
						function (resolve) {
							var info;

							if (opts.isRemoved) { return $q.reject($q.defer('ng_material_ui_select_position_reject'), false); }

							info = calculateMenuPositions(scope, element, opts);
							info.container.element.css(animator.toCss(info.container.styles));
							info.dropDown.element.css(animator.toCss(info.dropDown.styles));

							$$rAF(
								function () {
									element.addClass('md-active');
									info.dropDown.element.css(
										animator.toCss({ transform: '' })
									);

									resolve();
								}
							);
						},
						'ng_material_ui_select_position_focus'
					);
                }

                function showBackdrop(scope, element, options) {

                    if (options.disableParentScroll && !$mdUtil.getClosest(options.target, 'MD-DIALOG')) {
                        options.restoreScroll = $mdUtil.disableScrollAround(options.element, options.parent);
                    } else {
                        options.disableParentScroll = false;
                    }

                    if (options.hasBackdrop) {

                        options.backdrop = $mdUtil.createBackdrop(scope, "md-select-backdrop md-click-catcher");

                        $animate.enter(
							options.backdrop,
							$document[0].body,
							null,
							{ duration: 0 }
						);
                    }

                    return function hideBackdrop() {

                        if (options.backdrop) { options.backdrop.remove(); }
                        if (options.disableParentScroll) { options.restoreScroll(); }

                        delete options.restoreScroll;
                    };
                }

                function autoFocus(focusedNode) {
                    if (focusedNode && !focusedNode.hasAttribute('disabled')) {
                        focusedNode.focus();
                    }
                }

                function sanitizeAndConfigure(scope, options) {
                    var selectEl = element.find('md-select-menu');

                    if (!options.target) {
                        throw new Error($mdUtil.supplant(ERROR_TARGET_EXPECTED, [options.target]));
                    }

                    angular.extend(options, {
                        isRemoved: false,
                        target: angular.element(options.target), //make sure it's not a naked dom node
                        parent: angular.element(options.parent),
                        selectEl: selectEl,
                        contentEl: element.find('md-content'),
                        optionNodes: selectEl[0].getElementsByTagName('md-option')
                    });
                }

                function activateResizing() {
                    var debouncedOnResize = (
						function (scope, target, options) {

								return function () {

									if (options.isRemoved) { return; }

									var updates = calculateMenuPositions(scope, target, options),
										container = updates.container,
										dropDown = updates.dropDown;

									container.element.css(animator.toCss(container.styles));
									dropDown.element.css(animator.toCss(dropDown.styles));
								};

							}(scope, element, opts)
						),
						r_window = angular.element($window);

                    r_window.on('resize', debouncedOnResize);
                    r_window.on('orientationchange', debouncedOnResize);

                    // Publish deactivation closure...
                    return function deactivateResizing() {

                        // Disable resizing handlers
                        r_window.off('resize', debouncedOnResize);
                        r_window.off('orientationchange', debouncedOnResize);
                    };
                }

                function watchAsyncLoad() {

                    if (opts.loadingAsync && !opts.isRemoved) {

                        scope.$$loadingAsyncDone = false;

                        $q.when($q.defer('ng_md_ui_select_watchAsyncLoad_when'), opts.loadingAsync)
                            .then(
								function () {
									scope.$$loadingAsyncDone = true;
									delete opts.loadingAsync;
								})
							.then(
								function () {
									$$rAF(positionAndFocusMenu);
								}
							);
                    }
                }

                function activateInteraction() {
					var dropDown,
						selectCtrl;

                    if (opts.isRemoved) { return; }

                    dropDown = opts.selectEl;
                    selectCtrl = dropDown.controller('mdSelectMenu') || {};

                    element.addClass('md-clickable');

                    if (opts.backdrop) { opts.backdrop.on('click', onBackdropClick); }

                    dropDown.on('keydown', onMenuKeyDown);
                    dropDown.on('click', checkCloseMenu);

                    return function cleanupInteraction() {

						if (opts.backdrop) { opts.backdrop.off('click', onBackdropClick); }

                        dropDown.off('keydown', onMenuKeyDown);
                        dropDown.off('click', checkCloseMenu);

                        element.removeClass('md-clickable');
                        opts.isRemoved = true;
                    };

                    function onBackdropClick(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        opts.restoreFocus = false;
                        $mdUtil.nextTick($mdSelect.hide, true);
                    }

                    function onMenuKeyDown(ev) {
						var option,
							optNode;

                        ev.preventDefault();
                        ev.stopPropagation();

                        switch (ev.keyCode) {
                            case keyCodes.UP_ARROW:
                                return focusPrevOption();
                            case keyCodes.DOWN_ARROW:
                                return focusNextOption();
                            case keyCodes.SPACE:
                            case keyCodes.ENTER:
                                option = $mdUtil.getClosest(ev.target, 'md-option');

                                if (option) {
                                    dropDown.triggerHandler({
                                        type: 'click',
                                        target: option
                                    });
                                    ev.preventDefault();
                                }

                                checkCloseMenu(ev);
                                break;
                            case keyCodes.TAB:
                            case keyCodes.ESCAPE:
                                ev.stopPropagation();
                                ev.preventDefault();
                                opts.restoreFocus = true;
                                $mdUtil.nextTick($mdSelect.hide, true);
                                break;
                            default:
                                if (shouldHandleKey(ev, $mdConstant)) {
                                    optNode = dropDown.controller('mdSelectMenu').optNodeForKeyboardSearch(ev);
                                    opts.focusedNode = optNode || opts.focusedNode;

									if (optNode) { optNode.focus(); }
                                }
                        }
                    }

                    function focusOption(direction) {
                        var optionsArray = $mdUtil.nodesToArray(opts.optionNodes),
							index = optionsArray.indexOf(opts.focusedNode),
							newOption;

                        do {
                            if (index === -1) {
                                index = 0;
                            } else if (direction === 'next' && index < optionsArray.length - 1) {
                                index += 1;
                            } else if (direction === 'prev' && index > 0) {
                                index -= 1;
                            }

                            newOption = optionsArray[index];

                            if (newOption.hasAttribute('disabled')) { newOption = undefined; }

                        } while (!newOption && index < optionsArray.length - 1 && index > 0);

						if (newOption) { newOption.focus(); }

                        opts.focusedNode = newOption;
                    }

                    function focusNextOption() {
                        focusOption('next');
                    }

                    function focusPrevOption() {
                        focusOption('prev');
                    }

                    function checkCloseMenu(ev) {

                        if (ev && (ev.type == 'click') && (ev.currentTarget != dropDown[0])) { return; }
                        if (mouseOnScrollbar()) { return; }

                        var option = $mdUtil.getClosest(ev.target, 'md-option');

                        if (option && option.hasAttribute && !option.hasAttribute('disabled')) {

                            ev.preventDefault();
                            ev.stopPropagation();

                            if (!selectCtrl.isMultiple) {

                                opts.restoreFocus = true;

                                $mdUtil.nextTick(
									function () { $mdSelect.hide(selectCtrl.ngModel.$viewValue); },
									true
								);
                            }
                        }

                        function mouseOnScrollbar() {
                            var clickOnScrollbar = false,
								child,
								hasScrollbar,
								relPosX;

                            if (ev && (ev.currentTarget.children.length > 0)) {

                                child = ev.currentTarget.children[0];
                                hasScrollbar = child.scrollHeight > child.clientHeight;

                                if (hasScrollbar && child.children.length > 0) {

                                    relPosX = ev.pageX - ev.currentTarget.getBoundingClientRect().left;

                                    if (relPosX > child.querySelector('md-option').offsetWidth) { clickOnScrollbar = true; }
                                }
                            }

                            return clickOnScrollbar;
                        }
                    }
                }

                return showDropDown(scope, element, opts)
                    .then(
						function (response) {
							element.attr('aria-hidden', 'false');
							opts.alreadyOpen = true;
							opts.cleanupInteraction = activateInteraction();
							opts.cleanupResizing = activateResizing();
							autoFocus(opts.focusedNode);

							return response;
						},
						opts.hideBackdrop
					);
            }

            function announceClosed(opts) {
                var mdSelect = opts.selectCtrl,
					menuController;

                if (mdSelect) {
                    menuController = opts.selectEl.controller('mdSelectMenu');
                    mdSelect.setLabelText(menuController ? menuController.selectedLabels() : '');
                    mdSelect.triggerClose();
                }
            }


            /**
             * Calculate the
             */
            function calculateMenuPositions(scope, element, opts) {
                var
                    containerNode = element[0],
                    targetNode = opts.target[0].children[0], // target the label
                    parentNode = $document[0].body,
                    selectNode = opts.selectEl[0],
                    contentNode = opts.contentEl[0],
                    parentRect = parentNode.getBoundingClientRect(),
                    targetRect = targetNode.getBoundingClientRect(),
                    shouldOpenAroundTarget = false,
                    bounds = {
                        left: parentRect.left + SELECT_EDGE_MARGIN,
                        top: SELECT_EDGE_MARGIN,
                        bottom: parentRect.height - SELECT_EDGE_MARGIN,
                        right: parentRect.width - SELECT_EDGE_MARGIN - ($mdUtil.floatingScrollbars() ? 16 : 0)
                    },
                    spaceAvailable = {
                        top: targetRect.top - bounds.top,
                        left: targetRect.left - bounds.left,
                        right: bounds.right - (targetRect.left + targetRect.width),
                        bottom: bounds.bottom - (targetRect.top + targetRect.height)
                    },
                    maxWidth = parentRect.width - SELECT_EDGE_MARGIN * 2,
                    selectedNode = selectNode.querySelector('md-option[selected]'),
                    optionNodes = selectNode.getElementsByTagName('md-option'),
                    optgroupNodes = selectNode.getElementsByTagName('md-optgroup'),
                    isScrollable = calculateScrollable(element, contentNode),
                    centeredNode,
					loading = isPromiseLike(opts.loadingAsync),
					focusedNode,
					selectMenuRect,
					centeredRect,
					centeredStyle,
					scrollBuffer,
					left,
					top,
					transformOrigin,
					minWidth,
					fontSize,
					containerRect,
					scaleX,
					scaleY;

                if (!loading) {
                    if (selectedNode) {
                        centeredNode = selectedNode;
                    } else if (optgroupNodes.length) {
                        centeredNode = optgroupNodes[0];
                    } else if (optionNodes.length) {
                        centeredNode = optionNodes[0];
                    } else {
                        centeredNode = contentNode.firstElementChild || contentNode;
                    }
                } else {
                    centeredNode = contentNode.firstElementChild || contentNode;
                }

                if (contentNode.offsetWidth > maxWidth) {
                    contentNode.style['max-width'] = maxWidth + 'px';
                } else {
                    contentNode.style.maxWidth = null;
                }

                if (shouldOpenAroundTarget) {
                    contentNode.style['min-width'] = targetRect.width + 'px';
                }

                if (isScrollable) {
                    selectNode.classList.add('md-overflow');
                }

                focusedNode = centeredNode;

                if ((focusedNode.tagName || '').toUpperCase() === 'MD-OPTGROUP') {
                    focusedNode = optionNodes[0] || contentNode.firstElementChild || contentNode;
                    centeredNode = focusedNode;
                }
                // Cache for autoFocus()
                opts.focusedNode = focusedNode;

                // Get the selectMenuRect *after* max-width is possibly set above
                containerNode.style.display = 'block';
                selectMenuRect = selectNode.getBoundingClientRect();
                centeredRect = getOffsetRect(centeredNode);

                if (centeredNode) {
                    centeredStyle = $window.getComputedStyle(centeredNode);
                    centeredRect.paddingLeft = parseInt(centeredStyle.paddingLeft, 10) || 0;
                    centeredRect.paddingRight = parseInt(centeredStyle.paddingRight, 10) || 0;
                }

                if (isScrollable) {
                    scrollBuffer = contentNode.offsetHeight / 2;
                    contentNode.scrollTop = centeredRect.top + centeredRect.height / 2 - scrollBuffer;

                    if (spaceAvailable.top < scrollBuffer) {
                        contentNode.scrollTop = Math.min(
                            centeredRect.top,
                            contentNode.scrollTop + scrollBuffer - spaceAvailable.top
                        );
                    } else if (spaceAvailable.bottom < scrollBuffer) {
                        contentNode.scrollTop = Math.max(
                            centeredRect.top + centeredRect.height - selectMenuRect.height,
                            contentNode.scrollTop - scrollBuffer + spaceAvailable.bottom
                        );
                    }
                }

                if (shouldOpenAroundTarget) {

                    left = targetRect.left;
                    top = targetRect.top + targetRect.height;
                    transformOrigin = '50% 0';

                    if (top + selectMenuRect.height > bounds.bottom) {
                        top = targetRect.top - selectMenuRect.height;
                        transformOrigin = '50% 100%';
                    }
                } else {

                    left = (targetRect.left + centeredRect.left - centeredRect.paddingLeft) + 2;
                    top = Math.floor(targetRect.top + targetRect.height / 2 - centeredRect.height / 2 -
                        centeredRect.top + contentNode.scrollTop) + 2;

                    transformOrigin = (centeredRect.left + targetRect.width / 2) + 'px ' +
                        (centeredRect.top + centeredRect.height / 2 - contentNode.scrollTop) + 'px 0px';

                    minWidth = Math.min(targetRect.width + centeredRect.paddingLeft + centeredRect.paddingRight, maxWidth);

                    fontSize = window.getComputedStyle(targetNode)['font-size'];
                }

                // Keep left and top within the window
                containerRect = containerNode.getBoundingClientRect();
                scaleX = Math.round(100 * Math.min(targetRect.width / selectMenuRect.width, 1.0)) / 100;
                scaleY = Math.round(100 * Math.min(targetRect.height / selectMenuRect.height, 1.0)) / 100;

                return {
                    container: {
                        element: angular.element(containerNode),
                        styles: {
                            left: Math.floor(clamp(bounds.left, left, bounds.right - containerRect.width)),
                            top: Math.floor(clamp(bounds.top, top, bounds.bottom - containerRect.height)),
                            'min-width': minWidth,
                            'font-size': fontSize
                        }
                    },
                    dropDown: {
                        element: angular.element(selectNode),
                        styles: {
                            transformOrigin: transformOrigin,
                            transform: !opts.alreadyOpen ? $mdUtil.supplant('scale({0},{1})', [scaleX, scaleY]) : ""
                        }
                    }
                };
            }

            return {
                parent: 'body',
                themable: true,
                onShow: onShow,
                onRemove: onRemove,
                hasBackdrop: true,
                disableParentScroll: true
            };
        }

        function isPromiseLike(obj) {
            return obj && angular.isFunction(obj.then);
        }

        function clamp(min, n, max) {
            return Math.max(min, Math.min(n, max));
        }

        function getOffsetRect(node) {
            return node ? {
                left: node.offsetLeft,
                top: node.offsetTop,
                width: node.offsetWidth,
                height: node.offsetHeight
            } : {
                left: 0,
                top: 0,
                width: 0,
                height: 0
            };
        }

        function calculateScrollable(element, contentNode) {
            var isScrollable = false,
				oldDisplay;

            try {
                oldDisplay = element[0].style.display;

                element[0].style.display = 'block';

                isScrollable = contentNode.scrollHeight > contentNode.offsetHeight;

                element[0].style.display = oldDisplay;
            } finally {
                // Nothing to do
            }

            return isScrollable;
        }

        return $$interimElementProvider('$mdSelect')
            .setDefaults({
                methods: ['target'],
                options: ["$mdSelect", "$mdConstant", "$mdUtil", "$$mdAnimate", "$window", "$q", "$$rAF", "$animateCss", "$animate", "$document", selectDefaultOptions]
            });
    }

    function shouldHandleKey(ev, $mdConstant) {
        var char_str = String.fromCharCode(ev.keyCode),
			isNonUsefulKey = (ev.keyCode <= 31);

        return (char_str && char_str.length && !isNonUsefulKey && !$mdConstant.isMetaKey(ev) && !$mdConstant.isFnLockKey(ev) && !$mdConstant.hasModifierKey(ev));
    }


    angular.module(
		'ng.material.ui.select',
		[
			'ng',
            'ng.material.core',
			'ng.material.core.theming',
			'ng.material.core.interim',
			'ng.material.core.ripple',
			'ng.material.core.animator',
			'ng.material.ui.aria',
            'ng.material.ui.backdrop',
			'ng.material.ui.progresscir'
        ]
	).directive(
		'mdSelect',
		["$mdSelect", "$mdUtil", "$mdConstant", "$mdTheming", "$mdAria", "$parse", "$sce", SelectDirective]
	).directive(
		'mdSelectMenu',
		["$parse", "$mdUtil", "$mdConstant", "$mdTheming", SelectMenuDirective]
	).directive(
		'mdOption',
		["$mdButtonInkRipple", "$mdUtil", "$mdTheming", OptionDirective]
	).directive(
		'mdOptgroup',
		OptgroupDirective
	).directive(
		'mdSelectHeader',
		SelectHeaderDirective
	).directive(
		'mdSelectValue',
		SelectValueDirective
	).provider(
		'$mdSelect',
		["$$interimElementProvider", SelectProvider]
	).directive(
		'mdSelectContainerClass',
		angular.restrictADir
	).directive(
		'mdOnOpen',
		angular.restrictADir
	).directive(
		'mdOnClose',
		angular.restrictADir
	).directive(
		'mdSelectedText',
		angular.restrictADir
	).directive(
		'mdSelectedHtml',
		angular.restrictADir
	);

}());
