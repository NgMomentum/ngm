
/**
 * @ngdoc module
 * @name material.components.tabs
 */

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.tabs");
msos.require("ng.material.core.theming");
msos.require("ng.material.core.tabripple");
msos.require("ng.material.ui.interaction");
msos.require("ng.material.ui.swipe");			// ref template
msos.require("ng.material.ui.icon");			// ref template

ng.material.ui.tabs.version = new msos.set_version(18, 8, 12);

// Load AngularJS-Material module specific CSS
ng.material.ui.tabs.css = new msos.loader();
ng.material.ui.tabs.css.load(msos.resource_url('ng', 'material/css/ui/tabs.css'));


function MdTabsPaginationService() {
	"use strict";

	function decreasePageOffset(elements_dpo, currentOffset) {
		var canvas = elements_dpo.canvas,
			tabOffsets = getTabOffsets(elements_dpo),
			i = 0,
			firstVisibleTabOffset;

		for (i = 0; i < tabOffsets.length; i += 1) {
			if (tabOffsets[i] >= currentOffset) {
				firstVisibleTabOffset = tabOffsets[i];
				break;
			}
		}

		return Math.max(0, firstVisibleTabOffset - canvas.clientWidth);
	}

	function increasePageOffset(elements_ipo, currentOffset) {
		var canvas = elements_ipo.canvas,
			maxOffset = getTotalTabsWidth(elements_ipo) - canvas.clientWidth,
			tabOffsets = getTabOffsets(elements_ipo),
			i = 0,
			firstHiddenTabOffset;

		for (i = 0; i < tabOffsets.length, tabOffsets[i] <= currentOffset + canvas.clientWidth; i += 1) {
			firstHiddenTabOffset = tabOffsets[i];
		}

		return Math.min(maxOffset, firstHiddenTabOffset);
	}

	function getTabOffsets(elements_gpo) {
		var i,
			tab,
			currentOffset = 0,
			offsets = [];

		for (i = 0; i < elements_gpo.tabs.length; i += 1) {
			tab = elements_gpo.tabs[i];
			offsets.push(currentOffset);
			currentOffset += tab.offsetWidth;
		}

		return offsets;
	}

	function getTotalTabsWidth(elements_gtw) {
		var sum = 0, i, tab;

		for (i = 0; i < elements_gtw.tabs.length; i += 1) {
			tab = elements_gtw.tabs[i];
			sum += tab.offsetWidth;
		}

		return sum;
	}

	return {
		decreasePageOffset: decreasePageOffset,
		increasePageOffset: increasePageOffset,
		getTabOffsets: getTabOffsets,
		getTotalTabsWidth: getTotalTabsWidth
	};
}

function MdTab() {
    "use strict";

    function postLink(scope, element, attr, ctrl) {

        if (!ctrl) { return; }

        var index = ctrl.getTabElementIndex(element),
            body = firstChild(element, 'md-tab-body').remove(),
            label = firstChild(element, 'md-tab-label').remove(),
            data = ctrl.insertTab(
					{
						scope: scope,
						parent: scope.$parent,
						index: index,
						element: element,
						template: body.html(),
						label: label.html()
					},
					index
				);

        scope.select = scope.select || angular.noop;
        scope.deselect = scope.deselect || angular.noop;

        scope.$watch(
			'active',
			function (active) { if (active) ctrl.select(data.getIndex(), true); }
		);

        scope.$watch(
			'disabled',
			function () { ctrl.refreshIndex(); }
		);

        scope.$watch(
            function () {
                return ctrl.getTabElementIndex(element);
            },
            function (newIndex) {
                data.index = newIndex;
                ctrl.updateTabOrder();
            }
        );

        scope.$on(
			'$destroy',
			function ng_md_ui_tab_postlink_on() {
				ctrl.removeTab(data);
			}
		);
    }

    function firstChild(element, tagName) {
        var children = element[0].children,
			i = 0,
			child;

        for (i = 0; i < children.length; i += 1) {
            child = children[i];
            if (child.tagName === tagName.toUpperCase()) {
				return angular.element(child);
			}
        }

        return angular.element();
    }

    return {
        require: '^?mdTabs',
        terminal: true,
        compile: function (element, attr) {
            var label = firstChild(element, 'md-tab-label'),
				body = firstChild(element, 'md-tab-body'),
				contents;

            if (label.length === 0) {
                label = angular.element('<md-tab-label></md-tab-label>');

                if (attr.label) { label.text(attr.label); }
                else { label.append(element.contents()); }

                if (body.length === 0) {
                    contents = element.contents().detach();
                    body = angular.element('<md-tab-body></md-tab-body>');
                    body.append(contents);
                }
            }

            element.append(label);

            if (body.html()) { element.append(body); }

            return postLink;
        },
        scope: {
            active: '=?mdActive',
            disabled: '=?ngDisabled',
            select: '&?mdOnSelect',
            deselect: '&?mdOnDeselect'
        }
    };
}

function MdTabItem() {
	"use strict";

    return {
        require: '^?mdTabs',
        link: function link(scope, element, attr, ctrl) {
            if (!ctrl) { return; }
            ctrl.attachRipple(scope, element);
        }
    };
}

function MdTabLabel() {
	"use strict";

    return {
        terminal: true
    };
}

function MdTabScroll($parse) {
	"use strict";

    return {
        restrict: 'A',
        compile: function ng_md_ui_tabs_scroll_compile($element, attr) {
            var fn = $parse(attr.mdTabScroll, null, true);

            return function ngEventHandler(scope, element) {

                element.on(
					'mousewheel',
					function (event) {
						scope.$apply(
							function () {
								fn(scope, { $event: event });
							}
						);
					}
				);
            };
        }
    };
}

function MdTabsController($scope, $element, $window, $mdConstant, $mdTabInkRipple, $mdUtil, $animateCss, $attrs, $compile, $mdTheming, $mdInteraction, MdTabsPaginationService) {
    // define private properties
    var ctrl = this,
        locked = false,
        queue = [],
        destroyed = false,
        loaded = false;

    function getElements() {
        var elements_ge = {},
			node = $element[0];

        // gather tab bar elements
        elements_ge.wrapper = node.querySelector('md-tabs-wrapper');
        elements_ge.canvas = elements_ge.wrapper.querySelector('md-tabs-canvas');
        elements_ge.paging = elements_ge.canvas.querySelector('md-pagination-wrapper');
        elements_ge.inkBar = elements_ge.paging.querySelector('md-ink-bar');
        elements_ge.nextButton = node.querySelector('md-next-button');
        elements_ge.prevButton = node.querySelector('md-prev-button');

        elements_ge.contents = node.querySelectorAll('md-tabs-content-wrapper > md-tab-content');
        elements_ge.tabs = elements_ge.paging.querySelectorAll('md-tab-item');
        elements_ge.dummies = elements_ge.canvas.querySelectorAll('md-dummy-tab');

        return elements_ge;
    }

    function getMaxTabWidth() {
        var elements_tw = getElements(),
            containerWidth = elements_tw.canvas.clientWidth,
            specMax = 264,
			tab_width = 0;

		tab_width = Math.max(0, Math.min(containerWidth - 1, specMax));

		return tab_width;
    }

    function attachRipple(scope, element) {
        var elements_ar = getElements(),
			options = {
				colorElement: angular.element(elements_ar.inkBar)
			};

        $mdTabInkRipple.attach(scope, element, options);
    }

    function updateInkBarClassName() {
        var elements_ib = getElements(),
			newIndex = ctrl.selectedIndex,
            oldIndex = ctrl.lastSelectedIndex,
            ink = angular.element(elements_ib.inkBar);

        if (!angular.isNumber(oldIndex)) { return; }

        ink.toggleClass('md-left', newIndex < oldIndex).toggleClass('md-right', newIndex > oldIndex);
    }

    function calcTabsWidth(tabs) {
        var width = 0;

        angular.forEach(
			tabs,
			function (tab) {
				width += Math.max(tab.offsetWidth, tab.getBoundingClientRect().width);
			}
		);

        return Math.ceil(width);
    }

    function updateInkBarStyles() {
        var elements_ibs = getElements(),
			index,
			totalWidth,
			tab,
			left,
			right,
			tabWidth;

        if (!elements_ibs.tabs[ctrl.selectedIndex]) {

            angular.element(elements_ibs.inkBar).css({
                left: 'auto',
                right: 'auto'
            });

            return;
        }

        if (!ctrl.tabs.length) { return queue.push(ctrl.updateInkBarStyles); }

        if (!$element.prop('offsetParent')) { return handleResizeWhenVisible(); }

        index = ctrl.selectedIndex;
		totalWidth = elements_ibs.paging.offsetWidth;
        tab = elements_ibs.tabs[index];
        left = tab.offsetLeft;
        right = totalWidth - left - tab.offsetWidth;

        if (ctrl.shouldCenterTabs) {

            tabWidth = calcTabsWidth(elements_ibs.tabs);

            if (totalWidth > tabWidth) {
                $mdUtil.nextTick(updateInkBarStyles, false);
            }
        }

        updateInkBarClassName();

        angular.element(elements_ibs.inkBar).css({
            left: left + 'px',
            right: right + 'px'
        });
    }

    function getNearestSafeIndex(newIndex) {

        if (newIndex === -1) { return -1; }

        var maxOffset = Math.max(ctrl.tabs.length - newIndex, newIndex),
            i = 0,
			tab;

        for (i = 0; i <= maxOffset; i += 1) {

            tab = ctrl.tabs[newIndex + i];

            if (tab && (tab.scope.disabled !== true)) { return tab.getIndex(); }

            tab = ctrl.tabs[newIndex - i];

            if (tab && (tab.scope.disabled !== true)) { return tab.getIndex(); }
        }

        return newIndex;
    }

    function refreshIndex() {
        ctrl.selectedIndex = getNearestSafeIndex(ctrl.selectedIndex);
        ctrl.focusIndex = getNearestSafeIndex(ctrl.focusIndex);
    }

    function redirectFocus() {
        ctrl.styleTabItemFocus = ($mdInteraction.getLastInteractionType() === 'keyboard');
        getElements().tabs[ctrl.focusIndex].focus();
    }

    function incrementIndex(inc, focus) {
        var newIndex,
            key = focus ? 'focusIndex' : 'selectedIndex',
            index = ctrl[key];

        for (newIndex = index + inc; ctrl.tabs[newIndex] && ctrl.tabs[newIndex].scope.disabled; newIndex += inc) { /* do nothing */ }

        newIndex = (index + inc + ctrl.tabs.length) % ctrl.tabs.length;

        if (ctrl.tabs[newIndex]) { ctrl[key] = newIndex; }
    }

    function updateTabOrder() {
        var selectedItem = ctrl.tabs[ctrl.selectedIndex],
            focusItem = ctrl.tabs[ctrl.focusIndex];

        ctrl.tabs = ctrl.tabs.sort(
			function (a, b) { return a.index - b.index; }
		);

        ctrl.selectedIndex = ctrl.tabs.indexOf(selectedItem);
        ctrl.focusIndex = ctrl.tabs.indexOf(focusItem);
    }

    function shouldPaginate() {

        if (ctrl.noPagination || !loaded) { return false; }

        var canvasWidth = $element.prop('clientWidth');

        angular.forEach(
			getElements().tabs,
			function (tab) { canvasWidth -= tab.offsetWidth; }
		);

        return canvasWidth < 0;
    }

    function updatePagination() {
        ctrl.maxTabWidth = getMaxTabWidth();
        ctrl.shouldPaginate = shouldPaginate();
    }

    function shouldStretchTabs() {

        switch (ctrl.stretchTabs) {
            case 'always':
                return true;
            case 'never':
                return false;
            default:
                return !ctrl.shouldPaginate &&
                    $window.matchMedia('(max-width: 600px)').matches;
        }
    }

    function shouldCenterTabs() {
        return ctrl.centerTabs && !ctrl.shouldPaginate;
    }

    function canPageBack() {
        // This works for both LTR and RTL
        return ctrl.offsetLeft > 0;
    }

    function canPageForward() {
        var elements_pf = getElements(),
			lastTab = elements_pf.tabs[elements_pf.tabs.length - 1];

        if (isRtl()) {
            return ctrl.offsetLeft < elements_pf.paging.offsetWidth - elements_pf.canvas.offsetWidth;
        }

        return lastTab && lastTab.offsetLeft + lastTab.offsetWidth > elements_pf.canvas.clientWidth + ctrl.offsetLeft;
    }

    function getFocusedTabId() {
        var focusedTab = ctrl.tabs[ctrl.focusIndex];

        if (!focusedTab || !focusedTab.id) {
            return null;
        }

        return 'tab-item-' + focusedTab.id;
    }

    // Define public methods
    ctrl.$onInit = $onInit;
    ctrl.updatePagination = $mdUtil.debounce(updatePagination, 100, null, false);
    ctrl.redirectFocus = redirectFocus;
    ctrl.attachRipple = attachRipple;
    ctrl.insertTab = insertTab;
    ctrl.removeTab = removeTab;
    ctrl.select = select;
    ctrl.scroll = scroll;
    ctrl.nextPage = nextPage;
    ctrl.previousPage = previousPage;
    ctrl.keydown = keydown;
    ctrl.canPageForward = canPageForward;
    ctrl.canPageBack = canPageBack;
    ctrl.refreshIndex = refreshIndex;
    ctrl.incrementIndex = incrementIndex;
    ctrl.getTabElementIndex = getTabElementIndex;
    ctrl.updateInkBarStyles = $mdUtil.debounce(updateInkBarStyles, 100, null, false);
    ctrl.updateTabOrder = $mdUtil.debounce(updateTabOrder, 100, null, false);
    ctrl.getFocusedTabId = getFocusedTabId;

    function defineProperty(key, handler, value) {
        Object.defineProperty(
			ctrl,
			key,
			{
				get: function () {
					return value;
				},
				set: function (newValue) {
					var oldValue = value;

					value = newValue;

					if (handler) {
						handler(newValue, oldValue);
					}
				}
			}
		);
    }

    function $onInit() {
        // Define one-way bindings
        defineOneWayBinding('stretchTabs', handleStretchTabs);

        // Define public properties with change handlers
        defineProperty('focusIndex', handleFocusIndexChange, ctrl.selectedIndex || 0);
        defineProperty('offsetLeft', handleOffsetChange, 0);
        defineProperty('hasContent', handleHasContent, false);
        defineProperty('maxTabWidth', handleMaxTabWidth, getMaxTabWidth());
        defineProperty('shouldPaginate', handleShouldPaginate, false);

        // Define boolean attributes
        defineBooleanAttribute('noInkBar', handleInkBar);
        defineBooleanAttribute('dynamicHeight', handleDynamicHeight);
        defineBooleanAttribute('noPagination');
        defineBooleanAttribute('swipeContent');
        defineBooleanAttribute('noDisconnect');
        defineBooleanAttribute('autoselect');
        defineBooleanAttribute('noSelectClick');
        defineBooleanAttribute('centerTabs', handleCenterTabs, false);
        defineBooleanAttribute('enableDisconnect');

        // Define public properties
        ctrl.scope = $scope;
        ctrl.parent = $scope.$parent;
        ctrl.tabs = [];
        ctrl.lastSelectedIndex = null;
        ctrl.hasFocus = false;
        ctrl.styleTabItemFocus = false;
        ctrl.shouldCenterTabs = shouldCenterTabs();
        ctrl.tabContentPrefix = 'tab-content-';

        setupTabsController();
    }

    function updateHeightFromContent() {

        if (!ctrl.dynamicHeight)	{ return $element.css('height', ''); }
        if (!ctrl.tabs.length)		{ return queue.push(updateHeightFromContent); }

        var elements_uh = getElements(),
			tabContent = elements_uh.contents[ctrl.selectedIndex],
            contentHeight = tabContent ? tabContent.offsetHeight : 0,
            tabsHeight = elements_uh.wrapper.offsetHeight,
            newHeight = contentHeight + tabsHeight,
            currentHeight = $element.prop('clientHeight'),
			fromHeight,
			toHeight;

        if (currentHeight === newHeight) { return; }

        if ($element.attr('md-align-tabs') === 'bottom') {

            currentHeight -= tabsHeight;
            newHeight -= tabsHeight;

            if ($element.attr('md-border-bottom') !== undefined) { currentHeight += 1; }
        }

        locked = true;

        fromHeight = {
            height: currentHeight + 'px'
        };

        toHeight = {
            height: newHeight + 'px'
        };

        $element.css(fromHeight);

        $animateCss(
			$element,
			{
				from: fromHeight,
				to: toHeight,
				easing: 'cubic-bezier(0.35, 0, 0.25, 1)',
				duration: 0.5
			}
		).start().done(
			function () {

				$element.css({
					transition: 'none',
					height: ''
				});

				$mdUtil.nextTick(
					function () {
						$element.css('transition', '');
					},
					false	// nextTick was undefined (default true)
				);

				locked = false;
			}
		);
    }

    function adjustOffset(index) {
        var elements_ao = getElements(),
			tab,
			left,
			right,
			extraOffset,
			tabWidthsBefore,
			tabWidthsIncluding;

        if (!angular.isNumber(index)) { index = ctrl.focusIndex; }

        if (!elements_ao.tabs[index]) { return; }
        if (ctrl.shouldCenterTabs) { return; }

        tab = elements_ao.tabs[index];
		left = tab.offsetLeft;
        right = tab.offsetWidth + left;
        extraOffset = 32;

        if (index === 0) {
            ctrl.offsetLeft = 0;
            return;
        }

        if (isRtl()) {
            tabWidthsBefore = calcTabsWidth(Array.prototype.slice.call(elements_ao.tabs, 0, index));
            tabWidthsIncluding = calcTabsWidth(Array.prototype.slice.call(elements_ao.tabs, 0, index + 1));

            ctrl.offsetLeft = Math.min(ctrl.offsetLeft, fixOffset(tabWidthsBefore));
            ctrl.offsetLeft = Math.max(ctrl.offsetLeft, fixOffset(tabWidthsIncluding - elements_ao.canvas.clientWidth));
        } else {
            ctrl.offsetLeft = Math.max(ctrl.offsetLeft, fixOffset(right - elements_ao.canvas.clientWidth + extraOffset));
            ctrl.offsetLeft = Math.min(ctrl.offsetLeft, fixOffset(left));
        }
    }

    function setupTabsController() {

        ctrl.selectedIndex = ctrl.selectedIndex || 0;
        compileTemplate();
        configureWatchers();
        bindEvents();
        $mdTheming($element);

        $mdUtil.nextTick(
			function () {
				updateHeightFromContent();
				adjustOffset();
				updateInkBarStyles();

				if (ctrl.tabs[ctrl.selectedIndex]) {
					ctrl.tabs[ctrl.selectedIndex].scope.select();
				}

				loaded = true;
				updatePagination();
			},
			false	// nextTick was undefined (default true)
		);
    }

    function compileTemplate() {
        var template = $attrs.$mdTabsTemplate,
            element = angular.element($element[0].querySelector('md-tab-data'));

        element.html(template);
        $compile(element.contents())(ctrl.parent);

        delete $attrs.$mdTabsTemplate;
    }

    function bindEvents() {
        angular.element($window).on('resize', handleWindowResize);
        $scope.$on('$destroy', cleanup);
    }

    function configureWatchers() {
        $scope.$watch('$mdTabsCtrl.selectedIndex', handleSelectedIndexChange);
    }

    function defineOneWayBinding(key, handler) {
        var attr = $attrs.$normalize('md-' + key);

        if (handler) defineProperty(key, handler);

        $attrs.$observe(
			attr,
			function (newValue) { ctrl[key] = newValue; }
		);
    }

    function defineBooleanAttribute(key, handler) {
        var attr = $attrs.$normalize('md-' + key);

        if (handler) defineProperty(key, handler);
        if ($attrs.hasOwnProperty(attr)) updateValue($attrs[attr]);

        $attrs.$observe(attr, updateValue);

        function updateValue(newValue) {
            ctrl[key] = newValue !== 'false';
        }
    }

    function cleanup() {
        destroyed = true;
        angular.element($window).off('resize', handleWindowResize);
    }

    function handleStretchTabs() {
        var elements_st = getElements();

        angular.element(elements_st.wrapper).toggleClass('md-stretch-tabs', shouldStretchTabs());
        updateInkBarStyles();
    }

    function handleCenterTabs() {
        ctrl.shouldCenterTabs = shouldCenterTabs();
    }

    function handleMaxTabWidth(newWidth, oldWidth) {

        if (newWidth !== oldWidth) {
            var elements_mtw = getElements();

            // Set the max width for the real tabs
            angular.forEach(
				elements_mtw.tabs,
				function (tab) {
					tab.style.maxWidth = newWidth + 'px';
				}
			);

            // Set the max width for the dummy tabs too
            angular.forEach(
				elements_mtw.dummies,
				function (tab) {
					tab.style.maxWidth = newWidth + 'px';
				}
			);

            $mdUtil.nextTick(
				ctrl.updateInkBarStyles,
				false	// nextTick was undefined (default true)
			);
        }
    }

    function handleShouldPaginate(newValue, oldValue) {
        if (newValue !== oldValue) {
            ctrl.maxTabWidth = getMaxTabWidth();
            ctrl.shouldCenterTabs = shouldCenterTabs();

            $mdUtil.nextTick(
				function () {
					ctrl.maxTabWidth = getMaxTabWidth();
					adjustOffset(ctrl.selectedIndex);
				},
				false	// nextTick was undefined (default true)
			);
        }
    }

    function handleHasContent(hasContent) {
        $element[hasContent ? 'removeClass' : 'addClass']('md-no-tab-content');
    }

    function isRtl() {
        return ($mdUtil.bidi() === 'rtl');
    }

    function handleOffsetChange(left) {
        var elements_oc = getElements(),
			newValue = ((ctrl.shouldCenterTabs || isRtl() ? '' : '-') + left + 'px');

        newValue = newValue.replace('--', '');

        angular.element(elements_oc.paging).css($mdConstant.CSS.TRANSFORM, 'translate3d(' + newValue + ', 0, 0)');
        $scope.$broadcast('$mdTabsPaginationChanged');
    }

    function handleFocusIndexChange(newIndex, oldIndex) {

        if (newIndex === oldIndex) { return; }
        if (!getElements().tabs[newIndex]) { return; }

        adjustOffset();
        redirectFocus();
    }

    function handleSelectedIndexChange(newValue, oldValue) {

        if (newValue === oldValue) { return; }

        ctrl.selectedIndex = getNearestSafeIndex(newValue);
        ctrl.lastSelectedIndex = oldValue;
        ctrl.updateInkBarStyles();
        updateHeightFromContent();
        adjustOffset(newValue);
        $scope.$broadcast('$mdTabsChanged');

		if (ctrl.tabs[oldValue]) {
			ctrl.tabs[oldValue].scope.deselect();
		}

		if (ctrl.tabs[newValue]) {
			ctrl.tabs[newValue].scope.select();
		}
    }

    function getTabElementIndex(tabEl) {
        var tabs = $element[0].getElementsByTagName('md-tab');

        return Array.prototype.indexOf.call(tabs, tabEl[0]);
    }

    function handleResizeWhenVisible() {

        if (handleResizeWhenVisible.watcher) { return; }

        handleResizeWhenVisible.watcher = $scope.$watch(
			function () {

				$mdUtil.nextTick(
					function () {

						if (!handleResizeWhenVisible.watcher) { return; }

						if ($element.prop('offsetParent')) {
							handleResizeWhenVisible.watcher();
							handleResizeWhenVisible.watcher = null;

							handleWindowResize();
						}
					},
					false
				);
			}
		);
    }

    function keydown(event) {

        switch (event.keyCode) {
            case $mdConstant.KEY_CODE.LEFT_ARROW:
                event.preventDefault();
                incrementIndex(-1, true);
                break;
            case $mdConstant.KEY_CODE.RIGHT_ARROW:
                event.preventDefault();
                incrementIndex(1, true);
                break;
            case $mdConstant.KEY_CODE.SPACE:
            case $mdConstant.KEY_CODE.ENTER:
                event.preventDefault();
                if (!locked) select(ctrl.focusIndex);
                break;
            case $mdConstant.KEY_CODE.TAB:
                if (ctrl.focusIndex !== ctrl.selectedIndex) {
                    ctrl.focusIndex = ctrl.selectedIndex;
                }
                break;
        }
    }

    function select(index, canSkipClick) {

        if (!locked) { ctrl.focusIndex = ctrl.selectedIndex = index; }

        if (canSkipClick && ctrl.noSelectClick) { return; }

        $mdUtil.nextTick(
			function () { ctrl.tabs[index].element.triggerHandler('click'); },
			false
		);
    }

    function fixOffset(value) {
        var elements_fo = getElements(),
			lastTab,
			totalWidth;

        if (!elements_fo.tabs.length || !ctrl.shouldPaginate) return 0;

        lastTab = elements_fo.tabs[elements_fo.tabs.length - 1];
		totalWidth = lastTab.offsetLeft + lastTab.offsetWidth;

        if (isRtl()) {
            value = Math.min(elements_fo.paging.offsetWidth - elements_fo.canvas.clientWidth, value);
            value = Math.max(0, value);
        } else {
            value = Math.max(0, value);
            value = Math.min(totalWidth - elements_fo.canvas.clientWidth, value);
        }

        return value;
    }

    function scroll(event) {

        if (!ctrl.shouldPaginate) { return; }

        event.preventDefault();

        ctrl.offsetLeft = fixOffset(ctrl.offsetLeft - event.wheelDelta);
    }

    function nextPage() {

        if (!ctrl.canPageForward()) { return; }

        var newOffset = MdTabsPaginationService.increasePageOffset(getElements(), ctrl.offsetLeft);

        ctrl.offsetLeft = fixOffset(newOffset);
    }

    function previousPage() {

        if (!ctrl.canPageBack()) { return; }

        var newOffset = MdTabsPaginationService.decreasePageOffset(getElements(), ctrl.offsetLeft);

        ctrl.offsetLeft = fixOffset(newOffset);
    }

    function handleWindowResize() {

        ctrl.lastSelectedIndex = ctrl.selectedIndex;
        ctrl.offsetLeft = fixOffset(ctrl.offsetLeft);

        $mdUtil.nextTick(
			function () {
				ctrl.updateInkBarStyles();
				updatePagination();
			},
			false	// nextTick was undefined (default true)
		);
    }

    function handleInkBar(hide) {
        angular.element(getElements().inkBar).toggleClass('ng-hide', hide);
    }

    function handleDynamicHeight(value) {
        $element.toggleClass('md-dynamic-height', value);
    }

    function removeTab(tabData) {

        if (destroyed) { return; }

        var selectedIndex = ctrl.selectedIndex,
            tab = ctrl.tabs.splice(tabData.getIndex(), 1)[0];

        refreshIndex();

        if (ctrl.selectedIndex === selectedIndex) {
            tab.scope.deselect();
			if (ctrl.tabs[ctrl.selectedIndex]) {
				ctrl.tabs[ctrl.selectedIndex].scope.select();
			}
        }

        $mdUtil.nextTick(
			function () {
				updatePagination();
				ctrl.offsetLeft = fixOffset(ctrl.offsetLeft);
			},
			false	// nextTick was undefined (default true)
		);
    }

    function setAriaControls(tab) {
		var nodes;

        if (tab.hasContent) {
            nodes = $element[0].querySelectorAll('[md-tab-id="' + tab.id + '"]');
            angular.element(nodes).attr('aria-controls', ctrl.tabContentPrefix + tab.id);
        }
    }

    function updateHasContent() {
        var hasContent = false,
			i = 0;

        for (i = 0; i < ctrl.tabs.length; i += 1) {
            if (ctrl.tabs[i].hasContent) {
                hasContent = true;
                break;
            }
        }

        ctrl.hasContent = hasContent;
    }

    function processQueue() {

        queue.forEach(
			function (func) {
				$mdUtil.nextTick(
					func,
					false	// nextTick was undefined (default true)
				);
			}
		);
	
        queue = [];
    }

    function insertTab(tabData, index) {
        var hasLoaded = loaded,
			proto = {
                getIndex: function () {
                    return ctrl.tabs.indexOf(tab);
                },
                isActive: function () {
                    return this.getIndex() === ctrl.selectedIndex;
                },
                isLeft: function () {
                    return this.getIndex() < ctrl.selectedIndex;
                },
                isRight: function () {
                    return this.getIndex() > ctrl.selectedIndex;
                },
                shouldRender: function () {
                    return !ctrl.noDisconnect || this.isActive();
                },
                hasFocus: function () {
                    return ctrl.styleTabItemFocus &&
                        ctrl.hasFocus && this.getIndex() === ctrl.focusIndex;
                },
                id: $mdUtil.nextUid(),
                hasContent: !!(tabData.template && tabData.template.trim())
            },
            tab = angular.extend(proto, tabData);

        if (angular.isDefined(index)) {
            ctrl.tabs.splice(index, 0, tab);
        } else {
            ctrl.tabs.push(tab);
        }

        processQueue();
        updateHasContent();

        $mdUtil.nextTick(
			function () {

				updatePagination();
				setAriaControls(tab);

				// if autoselect is enabled, select the newly added tab
				if (hasLoaded && ctrl.autoselect) {
					$mdUtil.nextTick(
						function () {
							$mdUtil.nextTick(
								function () { select(ctrl.tabs.indexOf(tab)); }
							);
						},
						true	// nextTick was undefined (default true)
					);
				}
			},
			false	// nextTick was undefined (default true)
		);

        return tab;
    }
}

function MdTabs($$mdSvgRegistry) {
	"use strict";

    return {
        scope: {
            selectedIndex: '=?mdTabSelected'
        },
        template: function (element, attr) {

            attr.$mdTabsTemplate = element.html();

            return '' +
                '<md-tabs-wrapper> ' +
                '<md-tab-data></md-tab-data> ' +
                '<md-prev-button ' +
                'tabindex="-1" ' +
                'role="button" ' +
                'aria-label="Previous Page" ' +
                'aria-disabled="{{!$mdTabsCtrl.canPageBack()}}" ' +
                'ng-class="{ \'md-disabled\': !$mdTabsCtrl.canPageBack() }" ' +
                'ng-if="$mdTabsCtrl.shouldPaginate" ' +
                'ng-click="$mdTabsCtrl.previousPage()"> ' +
                '<md-icon md-svg-src="' + $$mdSvgRegistry.mdTabsArrow + '"></md-icon> ' +
                '</md-prev-button> ' +
                '<md-next-button ' +
                'tabindex="-1" ' +
                'role="button" ' +
                'aria-label="Next Page" ' +
                'aria-disabled="{{!$mdTabsCtrl.canPageForward()}}" ' +
                'ng-class="{ \'md-disabled\': !$mdTabsCtrl.canPageForward() }" ' +
                'ng-if="$mdTabsCtrl.shouldPaginate" ' +
                'ng-click="$mdTabsCtrl.nextPage()"> ' +
                '<md-icon md-svg-src="' + $$mdSvgRegistry.mdTabsArrow + '"></md-icon> ' +
                '</md-next-button> ' +
                '<md-tabs-canvas ' +
                'ng-focus="$mdTabsCtrl.redirectFocus()" ' +
                'ng-class="{ ' +
                '\'md-paginated\': $mdTabsCtrl.shouldPaginate, ' +
                '\'md-center-tabs\': $mdTabsCtrl.shouldCenterTabs ' +
                '}" ' +
                'ng-keydown="$mdTabsCtrl.keydown($event)"> ' +
                '<md-pagination-wrapper ' +
                'ng-class="{ \'md-center-tabs\': $mdTabsCtrl.shouldCenterTabs }" ' +
                'md-tab-scroll="$mdTabsCtrl.scroll($event)" ' +
                'role="tablist"> ' +
                '<md-tab-item ' +
                'tabindex="{{ tab.isActive() ? 0 : -1 }}" ' +
                'class="md-tab" ' +
                'ng-repeat="tab in $mdTabsCtrl.tabs" ' +
                'role="tab" ' +
                'id="tab-item-{{::tab.id}}" ' +
                'md-tab-id="{{::tab.id}}" ' +
                'aria-selected="{{tab.isActive()}}" ' +
                'aria-disabled="{{tab.scope.disabled || \'false\'}}" ' +
                'ng-click="$mdTabsCtrl.select(tab.getIndex())" ' +
                'ng-focus="$mdTabsCtrl.hasFocus = true" ' +
                'ng-blur="$mdTabsCtrl.hasFocus = false" ' +
                'ng-class="{ ' +
                '\'md-active\':    tab.isActive(), ' +
                '\'md-focused\':   tab.hasFocus(), ' +
                '\'md-disabled\':  tab.scope.disabled ' +
                '}" ' +
                'ng-disabled="tab.scope.disabled" ' +
                'md-swipe-left="$mdTabsCtrl.nextPage()" ' +
                'md-swipe-right="$mdTabsCtrl.previousPage()" ' +
                'md-tabs-template="::tab.label" ' +
                'md-scope="::tab.parent"></md-tab-item> ' +
                '<md-ink-bar></md-ink-bar> ' +
                '</md-pagination-wrapper> ' +
                '<md-tabs-dummy-wrapper aria-hidden="true" class="md-visually-hidden md-dummy-wrapper"> ' +
                '<md-dummy-tab ' +
                'class="md-tab" ' +
                'tabindex="-1" ' +
                'ng-repeat="tab in $mdTabsCtrl.tabs" ' +
                'md-tabs-template="::tab.label" ' +
                'md-scope="::tab.parent"></md-dummy-tab> ' +
                '</md-tabs-dummy-wrapper> ' +
                '</md-tabs-canvas> ' +
                '</md-tabs-wrapper> ' +
                '<md-tabs-content-wrapper ng-show="$mdTabsCtrl.hasContent && $mdTabsCtrl.selectedIndex >= 0" class="_md"> ' +
                '<md-tab-content ' +
                'id="{{:: $mdTabsCtrl.tabContentPrefix + tab.id}}" ' +
                'class="_md" ' +
                'role="tabpanel" ' +
                'aria-labelledby="tab-item-{{::tab.id}}" ' +
                'md-swipe-left="$mdTabsCtrl.swipeContent && $mdTabsCtrl.incrementIndex(1)" ' +
                'md-swipe-right="$mdTabsCtrl.swipeContent && $mdTabsCtrl.incrementIndex(-1)" ' +
                'ng-if="tab.hasContent" ' +
                'ng-repeat="(index, tab) in $mdTabsCtrl.tabs" ' +
                'ng-class="{ ' +
                '\'md-no-transition\': $mdTabsCtrl.lastSelectedIndex == null, ' +
                '\'md-active\':        tab.isActive(), ' +
                '\'md-left\':          tab.isLeft(), ' +
                '\'md-right\':         tab.isRight(), ' +
                '\'md-no-scroll\':     $mdTabsCtrl.dynamicHeight ' +
                '}"> ' +
                '<div ' +
                'md-tabs-template="::tab.template" ' +
                'md-connected-if="tab.isActive()" ' +
                'md-scope="::tab.parent" ' +
                'ng-if="$mdTabsCtrl.enableDisconnect || tab.shouldRender()"></div> ' +
                '</md-tab-content> ' +
                '</md-tabs-content-wrapper>';
        },
        controller: 'MdTabsController',
        controllerAs: '$mdTabsCtrl',
        bindToController: true
    };
}

function MdTabsDummyWrapper($mdUtil, $window) {
	"use strict";

    return {
        require: '^?mdTabs',
        link: function link(scope, element, attr, ctrl) {

            if (!ctrl) { return; }

            var observer,
				disconnect,
				mutationCallback = function () {
					ctrl.updatePagination();
					ctrl.updateInkBarStyles();
				},
				config,
				debounced;

            if ('MutationObserver' in $window) {
                config = {
                    childList: true,
                    subtree: true,
                    characterData: true
                };

                observer = new MutationObserver(mutationCallback);
                observer.observe(element[0], config);
                disconnect = observer.disconnect.bind(observer);

            } else {

                debounced = $mdUtil.debounce(
					mutationCallback,
					15,
					null,
					false
				);

                element.on('DOMSubtreeModified', debounced);
                disconnect = element.off.bind(element, 'DOMSubtreeModified', debounced);
            }

            // Disconnect the observer
            scope.$on(
				'$destroy',
				function ng_md_ui_tabs_dummy_link_on() { disconnect(); }
			);
        }
    };
}

function MdTabsTemplate($compile, $mdUtil) {
	"use strict";

    function link(scope, element, attr, ctrl) {

        if (!ctrl) { return; }

        var compileScope = ctrl.enableDisconnect ? scope.compileScope.$new() : scope.compileScope;

        element.html(scope.template);
        $compile(element.contents())(compileScope);

        function disconnect() {
            if (ctrl.enableDisconnect) { $mdUtil.disconnectScope(compileScope); }
        }

        function reconnect() {
            if (ctrl.enableDisconnect) { $mdUtil.reconnectScope(compileScope); }
        }

        function handleScope() {
            scope.$watch(
				'connected',
				function (value) {
					if (value === false) {
						disconnect();
					} else {
						reconnect();
					}
				}
			);

            scope.$on('$destroy', reconnect);
        }

		return $mdUtil.nextTick(
			handleScope,
			false	// nextTick was undefined (default true)
		);
    }

    return {
        restrict: 'A',
        link: link,
        scope: {
            template: '=mdTabsTemplate',
            connected: '=?mdConnectedIf',
            compileScope: '=mdScope'
        },
        require: '^?mdTabs'
    };
}


angular.module(
    'ng.material.ui.tabs',
	['ng', 'ng.material.core', 'ng.material.core.theming', 'ng.material.core.tabripple', 'ng.material.ui.interaction']
).service(
	'MdTabsPaginationService',
	MdTabsPaginationService
).directive(
    'mdTab',
    MdTab
).directive(
    'mdTabs',
	["$$mdSvgRegistry", MdTabs]
).directive(
    'mdTabItem',
    MdTabItem
).directive(
    'mdTabLabel',
    MdTabLabel
).directive(
    'mdTabScroll',
	["$parse", MdTabScroll]
).directive(
    'mdTabsDummyWrapper',
	["$mdUtil", "$window", MdTabsDummyWrapper]
).directive(
    'mdTabsTemplate',
	["$compile", "$mdUtil", MdTabsTemplate]
).directive(
    'mdPrevButton',
    angular.restrictEDir
).directive(
    'mdNextButton',
    angular.restrictEDir
).directive(
    'mdTabsWrapper',
    angular.restrictEDir
).directive(
    'mdTabsCanvas',
    angular.restrictEDir
).directive(
    'mdTabData',
    angular.restrictEDir
).directive(
    'mdInkBar',
    angular.restrictEDir
).directive(
    'mdTabsContentWrapper',
    angular.restrictEDir
).directive(
    'mdPaginationWrapper',
    angular.restrictEDir
).directive(
    'mdDummyTab',
    angular.restrictEDir
).directive(
    'mdTabContent',
    angular.restrictEDir
).directive(
    'mdScope',
    angular.restrictADir
).directive(
    'mdTabId',
    angular.restrictADir
).directive(
    'mdBorderBottom',
    angular.restrictADir
).directive(
    'mdDynamicHeight',
    angular.restrictADir
).directive(
    'mdConnectedIf',
    angular.restrictADir
).directive(
    'mdAlignTabs',
    angular.restrictADir
).directive(
    'mdTabSelected',
    angular.restrictADir
).controller(
    'MdTabsController',
	["$scope", "$element", "$window", "$mdConstant", "$mdTabInkRipple", "$mdUtil", "$animateCss", "$attrs", "$compile", "$mdTheming", "$mdInteraction", "MdTabsPaginationService", MdTabsController]
);
