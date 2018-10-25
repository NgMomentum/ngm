
/**
 * @ngdoc module
 * @name material.components.list
 * @description
 * List module
 */

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.list");
msos.require("ng.material.core.theming");
msos.require("ng.material.core.ripple");
msos.require("ng.material.ui.aria");

ng.material.ui.list.version = new msos.set_version(18, 5, 19);

// Load AngularJS-Material module specific CSS
ng.material.ui.list.css = new msos.loader();
ng.material.ui.list.css.load(msos.resource_url('ng', 'material/css/ui/list.css'));


function mdListDirective($mdTheming) {
    "use strict";

    return {
        restrict: 'E',
        compile: function (tEl) {

            tEl[0].setAttribute('role', 'list');

            return $mdTheming;
        }
    };
}

function mdListItemDirective($mdAria, $mdConstant, $mdUtil, $timeout) {
    "use strict";

    var proxiedTypes = ['md-checkbox', 'md-switch', 'md-menu'];

    return {
        restrict: 'E',
        controller: 'MdListController',
        compile: function (tEl, tAttrs) {

            // Check for proxy controls (no ng-click on parent, and a control inside)
            var secondaryItems = tEl[0].querySelectorAll('.md-secondary'),
                hasProxiedElement,
                proxyElement,
                itemContainer = tEl,
                i = 0,
                type;

            tEl[0].setAttribute('role', 'listitem');

            function copyAttributes(source, destination, extraAttrs) {
                var copiedAttrs = $mdUtil.prefixer([
						'ng-if', 'ng-click', 'ng-dblclick', 'aria-label', 'ng-disabled', 'ui-sref',
						'href', 'ng-href', 'rel', 'target', 'ng-attr-ui-sref', 'ui-sref-opts', 'download'
					]);

                if (extraAttrs) {
                    copiedAttrs = copiedAttrs.concat($mdUtil.prefixer(extraAttrs));
                }

                angular.forEach(copiedAttrs, function(attr) {
                    if (source.hasAttribute(attr)) {
                        destination.setAttribute(attr, source.getAttribute(attr));
                        source.removeAttribute(attr);
                    }
                });
            }

            function wrapIn(type) {
                var buttonWrap;

                if (type === 'div') {
                    itemContainer = angular.element('<div class="md-no-style md-list-item-inner">');
                    itemContainer.append(tEl.contents());
                    tEl.addClass('md-proxy-focus');
                } else {
                    // Element which holds the default list-item content.
                    itemContainer = angular.element(
                        '<div class="md-button md-no-style">' +
                        '   <div class="md-list-item-inner"></div>' +
                        '</div>'
                    );

                    // Button which shows ripple and executes primary action.
                    buttonWrap = angular.element(
                        '<md-button class="md-no-style"></md-button>'
                    );

                    copyAttributes(tEl[0], buttonWrap[0]);

					if (!buttonWrap.attr('aria-label')) {
						buttonWrap.attr('aria-label', $mdAria.getText(tEl));
					}

                    if (tEl.hasClass('md-no-focus')) {
                        buttonWrap.addClass('md-no-focus');
                    }

                    // Append the button wrap before our list-item content, because it will overlay in relative.
                    itemContainer.prepend(buttonWrap);
                    itemContainer.children().eq(1).append(tEl.contents());

                    tEl.addClass('_md-button-wrap');
                }

                tEl[0].setAttribute('tabindex', '-1');
                tEl.append(itemContainer);
            }

            if (tAttrs.ngClick || tAttrs.ngDblclick || tAttrs.ngHref || tAttrs.href || tAttrs.uiSref || tAttrs.ngAttrUiSref) {
                wrapIn('button');
            } else if (!tEl.hasClass('md-no-proxy')) {

                for (i = 0;  i < proxiedTypes.length; i += 1) {
                    type = proxiedTypes[i];
                    proxyElement = tEl[0].querySelector(type);

                    if (proxyElement) {
                        hasProxiedElement = true;
                        break;
                    }
                }

                if (hasProxiedElement) {
                    wrapIn('div');
                } else {
                    tEl.addClass('md-no-proxy');
                }
            }

            function isButton(el) {
                var nodeName = el.nodeName.toUpperCase();

                return nodeName === "MD-BUTTON" || nodeName === "BUTTON";
            }

            function hasClickEvent(element) {
                var attr = element.attributes,
                    i = 0;

                for (i = 0; i < attr.length; i += 1) {
                    if (attr[i].name && tAttrs.$normalize(attr[i].name) === 'ngClick') { return true; }
                }
                return false;
            }

            function isProxiedElement(el) {
                return proxiedTypes.indexOf(el.nodeName.toLowerCase()) !== -1;
            }

            function wrapSecondaryItem(secondaryItem, container) {
                var buttonWrapper;
                // If the current secondary item is not a button, but contains a ng-click attribute,
                // the secondary item will be automatically wrapped inside of a button.
                if (secondaryItem && !isButton(secondaryItem) && secondaryItem.hasAttribute('ng-click')) {

                    $mdAria.expect(secondaryItem, 'aria-label');
                    buttonWrapper = angular.element('<md-button class="md-secondary md-icon-button">');

                    // Copy the attributes from the secondary item to the generated button.
                    // We also support some additional attributes from the secondary item,
                    // because some developers may use a ngIf, ngHide, ngShow on their item.
                    copyAttributes(secondaryItem, buttonWrapper[0], ['ng-if', 'ng-hide', 'ng-show']);

                    secondaryItem.setAttribute('tabindex', '-1');
                    buttonWrapper.append(secondaryItem);

                    secondaryItem = buttonWrapper[0];
                }

                if (secondaryItem && (!hasClickEvent(secondaryItem) || (!tAttrs.ngClick && isProxiedElement(secondaryItem)))) {
                    // In this case we remove the secondary class, so we can identify it later, when we searching for the
                    // proxy items.
                    angular.element(secondaryItem).removeClass('md-secondary');
                }

                tEl.addClass('md-with-secondary');
                container.append(secondaryItem);
            }

            function wrapSecondaryItems() {
                var secondaryItemsWrapper = angular.element('<div class="md-secondary-container">');

                angular.forEach(
                    secondaryItems,
                    function (secondaryItem) {
                        wrapSecondaryItem(secondaryItem, secondaryItemsWrapper);
                    }
                );

                itemContainer.append(secondaryItemsWrapper);
            }

            function setupToggleAria() {
                var toggleTypes = ['md-switch', 'md-checkbox'],
                    toggle,
                    i = 0,
                    toggleType,
                    p;

                for (i = 0; i < toggleTypes.length; i += 1) {

                    toggleType = toggleTypes[i];
                    toggle = tEl.find(toggleType)[0];

                    if (toggle) {
                        if (!toggle.hasAttribute('aria-label')) {

                            p = tEl.find('p')[0];

                            if (!p) { return; }

                            toggle.setAttribute('aria-label', 'Toggle ' + p.textContent);
                        }
                    }
                }
            }

            wrapSecondaryItems();
            setupToggleAria();

            function setupProxiedMenu() {
                var menuEl = angular.element(proxyElement),
                    isEndAligned = menuEl.parent().hasClass('md-secondary-container') ||
                        proxyElement.parentNode.firstElementChild !== proxyElement,
                    xAxisPosition = 'left',
                    menuOpenButton;

                if (isEndAligned) {
                    // When the proxy item is aligned at the end of the list, we have to set the origin to the end.
                    xAxisPosition = 'right';
                }

                // Set the position mode / origin of the proxied menu.
                if (!menuEl.attr('md-position-mode')) {
                    menuEl.attr('md-position-mode', xAxisPosition + ' target');
                }

                // Apply menu open binding to menu button
                menuOpenButton = menuEl.children().eq(0);

                if (!hasClickEvent(menuOpenButton[0])) {
                    menuOpenButton.attr('ng-click', '$mdMenu.open($event)');
                }

                if (!menuOpenButton.attr('aria-label')) {
                    menuOpenButton.attr('aria-label', 'Open List Menu');
                }
            }

            if (hasProxiedElement && proxyElement.nodeName === "MD-MENU") {
                setupProxiedMenu();
            }

            function postLink($scope, $element, $attr_na, ctrl) {
                $element.addClass('_md'); // private md component indicator for styling

                var proxies = [],
                    firstElement = $element[0].firstElementChild,
                    isButtonWrap = $element.hasClass('_md-button-wrap'),
                    clickChild = isButtonWrap ? firstElement.firstElementChild : firstElement,
                    hasClick = clickChild && hasClickEvent(clickChild),
                    noProxies = $element.hasClass('md-no-proxy'),
                    clickChildKeypressListener;

                function computeProxies() {

					if (firstElement && firstElement.children && !hasClick && !noProxies) {

                        angular.forEach(
                            proxiedTypes,
                            function (type) {
                                angular.forEach(
                                    firstElement.querySelectorAll(type + ':not(.md-secondary)'),
                                    function (child) {
                                        proxies.push(child);
                                    }
                                );
                            }
                        );
                    }
                }

                function computeClickable() {
                    if (proxies.length === 1 || hasClick) {
                        $element.addClass('md-clickable');

                        if (!hasClick) {
                            ctrl.attachRipple($scope, angular.element($element[0].querySelector('.md-no-style')));
                        }
                    }
                }

                computeProxies();
                computeClickable();

                if (proxies.length) {
                    angular.forEach(
                        proxies,
                        function (proxy) {
                            proxy = angular.element(proxy);

                            $scope.mouseActive = false;
                            proxy.on(
                                'mousedown',
                                function () {
                                    $scope.mouseActive = true;
                                    $timeout(
                                        function () { $scope.mouseActive = false; },
                                        100,
										false
                                    );
                                }
                            ).on(
                                'focus',
                                function () {
                                    if ($scope.mouseActive === false) {
                                        $element.addClass('md-focused');
                                    }

                                    proxy.on(
                                        'blur',
                                        function proxyOnBlur() {
                                            $element.removeClass('md-focused');
                                             proxy.off('blur', proxyOnBlur);
                                        }
                                    );
                                }
                            );
                        }
                    );
                }

                function isEventFromControl(event) {
                    var forbiddenControls = ['md-slider'],
                        maxPath,
                        i = 0;

                    // If there is no path property in the event, then we can assume that the event was not bubbled.
                    if (!event.path) {
                        return forbiddenControls.indexOf(event.target.tagName.toLowerCase()) !== -1;
                    }

                    // We iterate the event path up and check for a possible component.
                    // Our maximum index to search, is the list item root.
                    maxPath = event.path.indexOf($element.children()[0]);

                    for (i = 0; i < maxPath; i += 1) {
                        if (forbiddenControls.indexOf(event.path[i].tagName.toLowerCase()) !== -1) {
                            return true;
                        }
                    }

                    return false;
                }

                clickChildKeypressListener = function (e) {
                    var keyCode;

                    if (e.target.nodeName !== 'INPUT' && e.target.nodeName !== 'TEXTAREA' && !e.target.isContentEditable) {

                        keyCode = e.which || e.keyCode;

                        if (keyCode === $mdConstant.KEY_CODE.SPACE) {
                            if (clickChild) {
                                clickChild.click();
                                e.preventDefault();
                                e.stopPropagation();
                            }
                        }
                    }
                };

                if (!hasClick && !proxies.length && clickChild && clickChild.addEventListener) {
                    clickChild.addEventListener('keypress', clickChildKeypressListener);
                }

                $element.off('click');
                $element.off('keypress');

                if (proxies.length === 1 && clickChild) {
                    $element.children().eq(0).on('click', function(e) {
                        // When the event is coming from an control and it should not trigger the proxied element
                        // then we are skipping.
                        if (isEventFromControl(e)) { return; }

                        var parentButton = $mdUtil.getClosest(e.target, 'BUTTON');

                        if (!parentButton && clickChild.contains(e.target)) {
                            angular.forEach(proxies, function(proxy) {
                                if (e.target !== proxy && !proxy.contains(e.target)) {
                                    if (proxy.nodeName === 'MD-MENU') {
                                        proxy = proxy.children[0];
                                    }
                                    angular.element(proxy).triggerHandler('click');
                                }
                            });
                        }
                    });
                }

                $scope.$on(
                    '$destroy',
                    function ng_md_ui_list_compile_postlink_on() {
                        if (clickChild && clickChild.removeEventListener) {
                            clickChild.removeEventListener('keypress', clickChildKeypressListener);
                        }
                    }
                );
            }

            return postLink;
        }
    };
}

function MdListController($mdListInkRipple) {
    "use strict";

    var ctrl = this;

    function attachRipple(scope, element) {
        var options = {};

        $mdListInkRipple.attach(scope, element, options);
    }

    ctrl.attachRipple = attachRipple;
}


angular.module(
    'ng.material.ui.list',
    [
        'ng',
        'ng.material.core',
        'ng.material.core.theming',
        'ng.material.core.ripple',
        'ng.material.ui.aria'
    ]
).controller(
    'MdListController',
    ['$mdListInkRipple', MdListController]
).directive(
    'mdList',
    ['$mdTheming', mdListDirective]
).directive(
    'mdListItem',
    ['$mdAria', '$mdConstant', '$mdUtil', '$timeout', mdListItemDirective]
).directive(
	'mdInset',
	angular.restrictADir
);
