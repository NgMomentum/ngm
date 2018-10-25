
/**
 * @ngdoc module
 * @name material.components.navBar
*/

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.navbar");
msos.require("ng.material.core.theming");
msos.require("ng.material.core.ripple");
msos.require("ng.material.ui.aria");
msos.require("ng.material.ui.button");
msos.require("ng.material.ui.layout");

ng.material.ui.navbar.version = new msos.set_version(18, 9, 1);


(function () {
    "use strict";

    function MdNavBarController($element, $scope, $timeout, $mdConstant) {

        this._$timeout = $timeout;
		this._$scope = $scope;
		this._$mdConstant = $mdConstant;
		this.mdSelectedNavItem = undefined;
		this.navBarAriaLabel = undefined;
		this._navBarEl = $element[0];
		this._inkbar = undefined;

        var self = this,
			deregisterTabWatch = this._$scope.$watch(
				function () {
					return self._navBarEl.querySelectorAll('._md-nav-button').length;
				},
				function (newLength) {
					if (newLength > 0) {
						self._initTabs();
						deregisterTabWatch();
					}
				}
			);
	}

    function MdNavBar($mdAria, $mdTheming) {

        return {
            restrict: 'E',
            transclude: true,
            controller: ["$element", "$scope", "$timeout", "$mdConstant", MdNavBarController],
            controllerAs: 'ctrl',
            bindToController: true,
            scope: {
                'mdSelectedNavItem': '=?',
                'mdNoInkBar': '=?',
                'navBarAriaLabel': '@?',
            },
            template: '<div class="md-nav-bar">' +
                '<nav role="navigation">' +
                '<ul class="_md-nav-bar-list" ng-transclude role="listbox" ' +
                'tabindex="0" ' +
                'ng-focus="ctrl.onFocus()" ' +
                'ng-keydown="ctrl.onKeydown($event)" ' +
                'aria-label="{{ctrl.navBarAriaLabel}}">' +
                '</ul>' +
                '</nav>' +
                '<md-nav-ink-bar ng-hide="ctrl.mdNoInkBar"></md-nav-ink-bar>' +
                '</div>',
            link: function (scope, element, attrs, ctrl) {
                $mdTheming(element);
                if (!ctrl.navBarAriaLabel) {
                    $mdAria.expectAsync(element, 'aria-label', angular.noop);
                }
            },
        };
    }

    MdNavBarController.prototype._initTabs = function () {

		var self = this;

        this._inkbar = angular.element(this._navBarEl.querySelector('md-nav-ink-bar'));

        this._$timeout(
			function ng_md_ui_navbar_initTabs_to() {
				self._updateTabs(self.mdSelectedNavItem, undefined);
			},
			0,
			false
		);

        this._$scope.$watch(
			'ctrl.mdSelectedNavItem',
			function (newValue, oldValue) {
				self._$timeout(
					function ng_md_ui_navbar_initTabs_watch_to() { self._updateTabs(newValue, oldValue); },
					0,
					false
				);
			}
		);
    };

    MdNavBarController.prototype._updateTabs = function (newValue, oldValue) {
        var self = this,
			oldIndex = -1,
			newIndex = -1,
			newTab,
			oldTab,
			tabs = this._getTabs();

        // this._getTabs can return null if nav-bar has not yet been initialized
        if (!tabs) { return; }

        newTab = this._getTabByName(newValue);
        oldTab = this._getTabByName(oldValue);

        if (oldTab) {
            oldTab.setSelected(false);
            oldIndex = tabs.indexOf(oldTab);
        }

        if (newTab) {
            newTab.setSelected(true);
            newIndex = tabs.indexOf(newTab);
        }

        this._$timeout(
			function ng_md_ui_navbar_updateTabs_to() { self._updateInkBarStyles(newTab, newIndex, oldIndex); },
			0,
			false
		);
    };

    MdNavBarController.prototype._updateInkBarStyles = function (tab, newIndex, oldIndex) {
		var tabEl,
			left;

        this._inkbar.toggleClass('_md-left', newIndex < oldIndex).toggleClass('_md-right', newIndex > oldIndex);

        this._inkbar.css({
            display: newIndex < 0 ? 'none' : ''
        });

        if (tab) {

            tabEl = tab.getButtonEl();
            left = tabEl.offsetLeft;

            this._inkbar.css({
                left: left + 'px',
                width: tabEl.offsetWidth + 'px'
            });
        }
    };

    MdNavBarController.prototype._getTabs = function () {
        var controllers = Array.prototype.slice.call(
				this._navBarEl.querySelectorAll('.md-nav-item')
			).map(
				function (el) { return angular.element(el).controller('mdNavItem'); }
			);

			return controllers.indexOf(undefined) ? controllers : null;
	};

    MdNavBarController.prototype._getTabByName = function (name) {
        return this._findTab(
			function (tab) {
				return tab.getName() == name;
			}
		);
    };

    MdNavBarController.prototype._getSelectedTab = function () {
        return this._findTab(function (tab) { return tab.isSelected(); });
    };

    MdNavBarController.prototype.getFocusedTab = function () {
        return this._findTab(
			function (tab) {
				return tab.hasFocus();
			}
		);
    };

    MdNavBarController.prototype._findTab = function (fn) {
        var tabs = this._getTabs(),
			i = 0;

        for (i = 0; i < tabs.length; i += 1) {
            if (fn(tabs[i])) {
                return tabs[i];
            }
        }

        return null;
    };

    MdNavBarController.prototype.onFocus = function () {
        var tab = this._getSelectedTab();

        if (tab) {
            tab.setFocused(true);
        }
    };

    MdNavBarController.prototype._moveFocus = function (oldTab, newTab) {
        oldTab.setFocused(false);
        newTab.setFocused(true);
    };

    MdNavBarController.prototype.onKeydown = function (e) {
        var keyCodes = this._$mdConstant.KEY_CODE,
			tabs = this._getTabs(),
			focusedTab = this.getFocusedTab();

        if (!focusedTab) { return; }

        var focusedTabIndex = tabs.indexOf(focusedTab);

        // use arrow keys to navigate between tabs
        switch (e.keyCode) {
            case keyCodes.UP_ARROW:
            case keyCodes.LEFT_ARROW:
                if (focusedTabIndex > 0) {
                    this._moveFocus(focusedTab, tabs[focusedTabIndex - 1]);
                }
                break;
            case keyCodes.DOWN_ARROW:
            case keyCodes.RIGHT_ARROW:
                if (focusedTabIndex < tabs.length - 1) {
                    this._moveFocus(focusedTab, tabs[focusedTabIndex + 1]);
                }
                break;
            case keyCodes.SPACE:
            case keyCodes.ENTER:
                // timeout to avoid a "digest already in progress" console error
                this._$timeout(
					function () { focusedTab.getButtonEl().click(); },
					0,
					false
				);
                break;
        }
    };

    function MdNavItem($mdAria, $$rAF, $mdUtil, $window) {
        return {
            restrict: 'E',
            require: ['mdNavItem', '^mdNavBar'],
            controller: ["$element", MdNavItemController],
            bindToController: true,
            controllerAs: 'ctrl',
            replace: true,
            transclude: true,
            template: function (tElement, tAttrs) {
                var hasNavClick = tAttrs.mdNavClick,
					hasNavHref = tAttrs.mdNavHref,
					hasNavSref = tAttrs.mdNavSref,
					hasSrefOpts = tAttrs.srefOpts,
					navigationAttribute,
					navigationOptions,
					buttonTemplate;

                // Cannot specify more than one nav attribute
                if ((hasNavClick ? 1 : 0) + (hasNavHref ? 1 : 0) + (hasNavSref ? 1 : 0) > 1) {
                    throw Error(
                        'Must not specify more than one of the md-nav-click, md-nav-href, ' +
                        'or md-nav-sref attributes per nav-item directive.'
                    );
                }

                if (hasNavClick) {
                    navigationAttribute = 'ng-click="ctrl.mdNavClick()"';
                } else if (hasNavHref) {
                    navigationAttribute = 'ng-href="{{ctrl.mdNavHref}}"';
                } else if (hasNavSref) {
                    navigationAttribute = 'ui-sref="{{ctrl.mdNavSref}}"';
                }

                navigationOptions = hasSrefOpts ? 'ui-sref-opts="{{ctrl.srefOpts}}" ' : '';

                if (navigationAttribute) {
                    buttonTemplate = '' +
                        '<md-button class="_md-nav-button md-accent" ' +
                        'ng-class="ctrl.getNgClassMap()" ' +
                        'ng-blur="ctrl.setFocused(false)" ' +
                        'ng-disabled="ctrl.disabled" ' +
                        'tabindex="-1" ' +
                        navigationOptions +
                        navigationAttribute + '>' +
                        '<span ng-transclude class="_md-nav-button-text"></span>' +
                        '</md-button>';
                }

                return '' +
                    '<li class="md-nav-item" ' +
                    'role="option" ' +
                    'aria-selected="{{ctrl.isSelected()}}">' +
                    (buttonTemplate || '') +
                    '</li>';
            },
            scope: {
                'mdNavClick': '&?',
                'mdNavHref': '@?',
                'mdNavSref': '@?',
                'srefOpts': '=?',
                'name': '@',
            },
            link: function (scope, element, attrs, controllers) {
                var disconnect;

                $$rAF(
					function () {
						var mdNavItem = controllers[0],
							mdNavBar = controllers[1],
							navButton = angular.element(element[0].querySelector('._md-nav-button')),
							config = {},
							targetNode,
							mutationCallback,
							observer;

						if (!mdNavItem.name) {
							mdNavItem.name = angular.element(element[0].querySelector('._md-nav-button-text')).text().trim();
						}

						navButton.on(
							'click',
							function () {
								mdNavBar.mdSelectedNavItem = mdNavItem.name;
								scope.$apply();
							}
						);

						// Get the disabled attribute value first, then setup observing of value changes
						mdNavItem.disabled = $mdUtil.parseAttributeBoolean(attrs.disabled, false);

						if ('MutationObserver' in $window) {
							config = {
								attributes: true,
								attributeFilter: ['disabled']
							};

							targetNode = element[0];

							mutationCallback = function (mutationList) {
								$mdUtil.nextTick(
									function () {
										mdNavItem.disabled = $mdUtil.parseAttributeBoolean(attrs[mutationList[0].attributeName], false);
									},
									false	// nextTick was undefined (default true)
								);
							};

							observer = new MutationObserver(mutationCallback);
							observer.observe(targetNode, config);

							disconnect = observer.disconnect.bind(observer);

						} else {
							attrs.$observe(
								'disabled',
								function (value) {
									mdNavItem.disabled = $mdUtil.parseAttributeBoolean(value, false);
								}
							);
						}

						$mdAria.expectWithText(element, 'aria-label');
					}
				);

                scope.$on(
					'destroy',
					function ng_md_ui_navbar_link_on() {
						disconnect();
					}
				);
            }
        };
    }

    function MdNavItemController($element) {

        this._$element = $element;
        this.mdNavClick = undefined;
        this.mdNavHref = undefined;
        this.mdNavSref = undefined;
        this.srefOpts = undefined;
        this.name = undefined;
        this._selected = false;
        this._focused = false;
    }

    MdNavItemController.prototype.getNgClassMap = function () {
        return {
            'md-active': this._selected,
            'md-primary': this._selected,
            'md-unselected': !this._selected,
            'md-focused': this._focused,
        };
    };

    MdNavItemController.prototype.getName = function () {
        return this.name;
    };

    MdNavItemController.prototype.getButtonEl = function () {
        return this._$element[0].querySelector('._md-nav-button');
    };

    MdNavItemController.prototype.setSelected = function (isSelected) {
        this._selected = isSelected;
    };

    MdNavItemController.prototype.isSelected = function () {
        return this._selected;
    };

    MdNavItemController.prototype.setFocused = function (isFocused) {
        this._focused = isFocused;

        if (isFocused) {
            this.getButtonEl().focus();
        }
    };

    MdNavItemController.prototype.hasFocus = function () {
        return this._focused;
    };


    angular.module(
		'ng.material.ui.navbar',
		[
			'ng',
			'ng.material.core',
			'ng.material.core.theming',
			'ng.material.ui.aria'
		]
	).controller(
		'MdNavBarController',
		["$element", "$scope", "$timeout", "$mdConstant", MdNavBarController]
	).directive(
		'mdNavBar',
		["$mdAria", "$mdTheming", MdNavBar]
	).controller(
		'MdNavItemController',
		["$element", MdNavItemController]
	).directive(
		'mdNavItem',
		["$mdAria", "$$rAF", "$mdUtil", "$window", MdNavItem]
	).directive(
		'mdNavInkBar',
		angular.restrictEDir
	);

}());