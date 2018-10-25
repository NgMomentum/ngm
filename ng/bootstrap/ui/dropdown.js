
/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.bootstrap.ui.dropdown");

ng.bootstrap.ui.dropdown.version = new msos.set_version(17, 12, 6);


// Below is the standard plugin, except for templateUrl location and naming (MSOS style)
// ui.bootstrap.dropdown -> ng.bootstrap.ui.dropdown
angular.module(
    'ng.bootstrap.ui.dropdown',
    ['ng', 'ng.bootstrap.ui', 'ng.bootstrap.ui.multiMap', 'ng.bootstrap.ui.position']
).constant('uibDropdownConfig', {
    appendToOpenClass: 'uib-dropdown-open',
    openClass: 'open'
}).service('uibDropdownService', ['$document', '$rootScope', '$$multiMap', function ($document, $rootScope, $$multiMap) {
    var openScope = null,
        openedContainers = $$multiMap.createNew();

    this.isOnlyOpen = function (dropdownScope, appendTo) {
        var openedDropdowns = openedContainers.get(appendTo),
            openDropdown;

        if (openedDropdowns) {
            openDropdown = openedDropdowns.reduce(
                function (toClose, dropdown) {
                    if (dropdown.scope === dropdownScope) { return dropdown; }
                    return toClose;
                },
                {}
            );

            if (openDropdown) {
                return openedDropdowns.length === 1;
            }
        }

        return false;
    };

    this.open = function (dropdownScope, element, appendTo) {
        if (!openScope) {
            $document.on('click', closeDropdown);
        }

        if (openScope && openScope !== dropdownScope) {
                openScope.isOpen = false;
        }

        openScope = dropdownScope;

        if (!appendTo) { return; }

        var openedDropdowns = openedContainers.get(appendTo),
            openedScopes;

        if (openedDropdowns) {
            openedScopes = openedDropdowns.map(
                function (dropdown) {
                    return dropdown.scope;
                }
            );

            if (openedScopes.indexOf(dropdownScope) === -1) {
                openedContainers.put(
                    appendTo,
                    { scope: dropdownScope }
                );
            }

        } else {
            openedContainers.put(
                appendTo,
                { scope: dropdownScope }
            );
        }
    };

    this.close = function (dropdownScope, element, appendTo) {
        if (openScope === dropdownScope) {
            $document.off('click', closeDropdown);
            $document.off('keydown', this.keybindFilter);
            openScope = null;
        }

        if (!appendTo) { return; }

        var openedDropdowns = openedContainers.get(appendTo),
            dropdownToClose;

        if (openedDropdowns) {
            dropdownToClose = openedDropdowns.reduce(
                function (toClose, dropdown) {
                    if (dropdown.scope === dropdownScope) {
                        return dropdown;
                    }

                    return toClose;
                },
                {}
            );

            if (dropdownToClose) {
                openedContainers.remove(appendTo, dropdownToClose);
            }
        }
    };

    var closeDropdown = function (evt) {
        var toggleElement,
            dropdownElement;

        // This method may still be called during the same mouse event that
        // unbound this event handler. So check openScope before proceeding.
        if (!openScope || !openScope.isOpen) { return; }

        if (evt && openScope.getAutoClose() === 'disabled') { return; }

        if (evt && evt.which === 3) { return; }

        toggleElement = openScope.getToggleElement();

        if (evt && toggleElement && toggleElement[0].contains(evt.target)) {
            return;
        }

        dropdownElement = openScope.getDropdownElement();

        if (evt && openScope.getAutoClose() === 'outsideClick' &&
            dropdownElement && dropdownElement[0].contains(evt.target)) {
            return;
        }

        openScope.focusToggleElement();
        openScope.isOpen = false;

        if (!$rootScope.$$phase) {
            openScope.$apply();
        }
    };

    this.keybindFilter = function (evt) {
        if (!openScope) {
            return;
        }

        var dropdownElement = openScope.getDropdownElement(),
            toggleElement = openScope.getToggleElement(),
            dropdownElementTargeted = dropdownElement && dropdownElement[0].contains(evt.target),
            toggleElementTargeted = toggleElement && toggleElement[0].contains(evt.target);

        if (evt.which === 27) {
            evt.stopPropagation();
            openScope.focusToggleElement();
            closeDropdown();
        } else if (openScope.isKeynavEnabled() && [38, 40].indexOf(evt.which) !== -1 && openScope.isOpen && (dropdownElementTargeted || toggleElementTargeted)) {
            evt.preventDefault();
            evt.stopPropagation();
            openScope.focusDropdownEntry(evt.which);
        }
    };
}]).controller('UibDropdownController', ['$scope', '$element', '$attrs', '$parse', 'uibDropdownConfig', 'uibDropdownService', '$animate', '$uibPosition', '$document', '$compile', '$templateRequest', function ($scope, $element, $attrs, $parse, dropdownConfig, uibDropdownService, $animate, $position, $document, $compile, $templateRequest) {
    var self = this,
        scope = $scope.$new(), // create a child scope so we are not polluting original one
        templateScope,
        appendToOpenClass = dropdownConfig.appendToOpenClass,
        openClass = dropdownConfig.openClass,
        getIsOpen,
        setIsOpen = angular.noop,
        toggleInvoker = $attrs.onToggle ? $parse($attrs.onToggle) : angular.noop,
        keynavEnabled = false,
        body = $document.find('body');

    $element.addClass('dropdown');

    this.init = function () {
        if ($attrs.isOpen) {
            getIsOpen = $parse($attrs.isOpen);
            setIsOpen = getIsOpen.assign;

            $scope.$watch(
                getIsOpen,
                function UibDropdownController_init(value) {
                    scope.isOpen = !!value;
                }
            );
        }

        keynavEnabled = angular.isDefined($attrs.keyboardNav);
    };

    this.toggle = function (open) {
        scope.isOpen = arguments.length ? !!open : !scope.isOpen;

        if (setIsOpen !== angular.noop && angular.isFunction(setIsOpen)) {
            setIsOpen(scope, scope.isOpen);
        }

        return scope.isOpen;
    };

    // Allow other directives to watch status
    this.isOpen = function () {
        return scope.isOpen;
    };

    scope.getToggleElement = function () {
        return self.toggleElement;
    };

    scope.getAutoClose = function () {
        return $attrs.autoClose || 'always'; //or 'outsideClick' or 'disabled'
    };

    scope.getElement = function () {
        return $element;
    };

    scope.isKeynavEnabled = function () {
        return keynavEnabled;
    };

    scope.focusDropdownEntry = function (keyCode) {
        var elems = self.dropdownMenu ? //If append to body is used.
            angular.element(self.dropdownMenu).find('a') :
            $element.find('ul').eq(0).find('a');

        switch (keyCode) {
            case 40:
                {
                    if (!angular.isNumber(self.selectedOption)) {
                        self.selectedOption = 0;
                    } else {
                        self.selectedOption = self.selectedOption === elems.length - 1 ?
                            self.selectedOption :
                            self.selectedOption + 1;
                    }
                    break;
                }
            case 38:
                {
                    if (!angular.isNumber(self.selectedOption)) {
                        self.selectedOption = elems.length - 1;
                    } else {
                        self.selectedOption = self.selectedOption === 0 ?
                            0 : self.selectedOption - 1;
                    }
                    break;
                }
        }
        elems[self.selectedOption].focus();
    };

    scope.getDropdownElement = function () {
        return self.dropdownMenu;
    };

    scope.focusToggleElement = function () {
        if (self.toggleElement) {
            self.toggleElement[0].focus();
        }
    };

    function removeDropdownMenu() {
        $element.append(self.dropdownMenu);
    }

    scope.$watch(
        'isOpen',
        function UibDropdownController_isOpen(isOpen, wasOpen) {
            var appendTo = null,
                appendToBody = false,
                appendToEl,
                appendToFn,
                appendToBodyValue,
                pos,
                css,
                rightalign,
                scrollbarPadding,
                scrollbarWidth = 0,
                appendOffset,
                openContainer,
                dropdownOpenClass,
                hasOpenClass,
                isOnlyOpen,
                toggleClass,
                newEl;

            if (angular.isDefined($attrs.dropdownAppendTo)) {
                appendToEl = $parse($attrs.dropdownAppendTo)(scope);
                if (appendToEl) {
                    appendTo = angular.element(appendToEl);
                }
            }

            if (angular.isDefined($attrs.dropdownAppendToBody)) {
                appendToFn = $parse($attrs.dropdownAppendToBody);
                if (appendToFn !== angular.noop) {
                    appendToBodyValue = appendToFn(scope);
                }
                if (appendToBodyValue !== false) {
                    appendToBody = true;
                }
            }

            if (appendToBody && !appendTo) {
                appendTo = body;
            }

            if (appendTo && self.dropdownMenu) {
                if (isOpen) {
                    appendTo.append(self.dropdownMenu);
                    $element.on('$destroy', removeDropdownMenu);
                } else {
                    $element.off('$destroy', removeDropdownMenu);
                    removeDropdownMenu();
                }
            }

            if (appendTo && self.dropdownMenu) {
                pos = $position.positionElements($element, self.dropdownMenu, 'bottom-left', true);

                css = {
                    top: pos.top + 'px',
                    display: isOpen ? 'block' : 'none'
                };

                rightalign = self.dropdownMenu.hasClass('dropdown-menu-right');

                if (!rightalign) {
                    css.left = pos.left + 'px';
                    css.right = 'auto';
                } else {
                    css.left = 'auto';
                    scrollbarPadding = $position.scrollbarPadding(appendTo);

                    if (scrollbarPadding.heightOverflow && scrollbarPadding.scrollbarWidth) {
                        scrollbarWidth = scrollbarPadding.scrollbarWidth;
                    }

                    css.right = window.innerWidth - scrollbarWidth - (pos.left + $element.prop('offsetWidth')) + 'px';
                }

                // Need to adjust our positioning to be relative to the appendTo container
                // if it's not the body element
                if (!appendToBody) {
                    appendOffset = $position.offset(appendTo);

                    css.top = pos.top - appendOffset.top + 'px';

                    if (!rightalign) {
                        css.left = pos.left - appendOffset.left + 'px';
                    } else {
                        css.right = window.innerWidth -
                            (pos.left - appendOffset.left + $element.prop('offsetWidth')) + 'px';
                    }
                }

                self.dropdownMenu.css(css);
            }

            openContainer = appendTo ? appendTo : $element;
            dropdownOpenClass = appendTo ? appendToOpenClass : openClass;
            hasOpenClass = openContainer.hasClass(appendTo ? appendToOpenClass : openClass);
            isOnlyOpen = uibDropdownService.isOnlyOpen($scope, appendTo);

            if (Boolean(hasOpenClass) !== Boolean(isOpen)) {
                if (appendTo) {
                    toggleClass = !isOnlyOpen ? 'addClass' : 'removeClass';
                } else {
                    toggleClass = isOpen ? 'addClass' : 'removeClass';
                }

                $animate[toggleClass](openContainer, dropdownOpenClass).then(
                    function () {
                        if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
                            if (toggleInvoker !== angular.noop) {
                                toggleInvoker(
                                    $scope,
                                    { open: !!isOpen }
                                );
                            }
                        }
                    }
                );
            }

            if (isOpen) {
                if (self.dropdownMenuTemplateUrl) {
                    $templateRequest(self.dropdownMenuTemplateUrl).then(
                        function (tplContent) {
                            templateScope = scope.$new();
                            $compile(tplContent.trim())(
                                templateScope,
                                function (dropdownElement) {
                                    var newEl_de = dropdownElement;

                                    self.dropdownMenu.replaceWith(newEl_de);
                                    self.dropdownMenu = newEl_de;

                                    $document.on(
                                        'keydown',
                                        uibDropdownService.keybindFilter
                                    );
                                }
                            );
                        }
                    );
                } else {
                    $document.on(
                        'keydown',
                        uibDropdownService.keybindFilter
                    );
                }

                scope.focusToggleElement();
                uibDropdownService.open(scope, $element, appendTo);

            } else {

                uibDropdownService.close(scope, $element, appendTo);

                if (self.dropdownMenuTemplateUrl) {
                    if (templateScope) {
                        templateScope.$destroy();
                    }
                    newEl = angular.element('<ul class="dropdown-menu"></ul>');
                    self.dropdownMenu.replaceWith(newEl);
                    self.dropdownMenu = newEl;
                }

                self.selectedOption = null;
            }

            if (setIsOpen !== angular.noop && angular.isFunction(setIsOpen)) {
                setIsOpen($scope, isOpen);
            }
        }
    );
}]).directive('uibDropdown', function () {
    return {
        controller: 'UibDropdownController',
        link: function (scope, element, attrs, dropdownCtrl) {
            dropdownCtrl.init();
        }
    };
}).directive('uibDropdownMenu', function () {
    return {
        restrict: 'A',
        require: '?^uibDropdown',
        link: function (scope, element, attrs, dropdownCtrl) {
            if (!dropdownCtrl || angular.isDefined(attrs.dropdownNested)) {
                return;
            }

            element.addClass('dropdown-menu');

            var tplUrl = attrs.templateUrl;

            if (tplUrl) {
                dropdownCtrl.dropdownMenuTemplateUrl = tplUrl;
            }

            if (!dropdownCtrl.dropdownMenu) {
                dropdownCtrl.dropdownMenu = element;
            }
        }
    };
}).directive('uibDropdownToggle', function () {
    return {
        require: '?^uibDropdown',
        link: function (scope, element, attrs, dropdownCtrl) {
            if (!dropdownCtrl) {
                return;
            }

            element.addClass('dropdown-toggle');

            dropdownCtrl.toggleElement = element;

            var toggleDropdown = function (event) {
                event.preventDefault();

                if (!element.hasClass('disabled') && !attrs.disabled) {
                    scope.$apply(function () { dropdownCtrl.toggle(); });
                }
            };

            element.bind('click', toggleDropdown);

            // WAI-ARIA
            element.attr({
                'aria-haspopup': true,
                'aria-expanded': false
            });

            scope.$watch(dropdownCtrl.isOpen, function uibDropdownToggle_isOpen(isOpen) {
                element.attr('aria-expanded', !!isOpen);
            });

            scope.$on(
				'$destroy',
				function ng_bootstrap_ui_dropdown_toggle_on() {
					element.unbind('click', toggleDropdown);
				}
			);
        }
    };
}).directive(
    'dropdownNested',
    angular.restrictADir
).directive(
    'onToggle',
    angular.restrictADir
).directive(
    'dropdownAppendToBody',
    angular.restrictADir
).directive(
    'dropdownAppendTo',
    angular.restrictADir
).directive(
    'keyboardNav',
    angular.restrictADir
).directive(
    'isOpen',
    angular.restrictADir
);
