
/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: v2.1.4 (original), updated to v2.5.0
 * License: MIT
 */

/*global
    msos: false,
    angular: false
*/

// Reduced version of angular-ui-bootstrap for just these components.
// We rename them for standarization with other MSOS ones (follows directory structure)
// ui.bootstrap.collapse        -> ng.bootstrap.ui.collapse,
// ui.bootstrap.position        -> ng.bootstrap.ui.position,
// ui.bootstrap.isClass         -> ng.bootstrap.ui.isClass
// ui.bootstrap.debounce        -> ng.bootstrap.ui.debounce
// ui.bootstrap.tabindex        -> ng.bootstrap.ui.tabindex
// ui.bootstrap.stackedMap      -> ng.bootstrap.ui.stackedMap
// ui.bootstrap.multiMap		-> ng.bootstrap.ui.multiMap
// Also Note: our adaptation of $q, $qq (ref. function qFactory where $q.defer acceptes a name)

angular.module(
    "ng.bootstrap.ui",
	[
        "ng",
        "ng.bootstrap.ui.collapse", "ng.bootstrap.ui.isClass",
        "ng.bootstrap.ui.position", "ng.bootstrap.ui.debounce",
        "ng.bootstrap.ui.tabindex", "ng.bootstrap.ui.stackedMap",
        "ng.bootstrap.ui.multiMap"
    ]
).directive(
    'templateUrl',  // used in many, many uib modules (this should probably be uibTemplateUrl)
    angular.restrictADir
).directive(
    'animate',      // used in progressbar and modal (this should probably be uibAnimate)
    angular.restrictADir
).directive(
    'disable',		// // used in many, many uib modules (this should probably be uibDisable)
    angular.restrictADir
);

angular.module(
    'ng.bootstrap.ui.collapse',
    ['ng']
).directive(
    'uibCollapse',
    ['$animate', '$q', '$parse', '$injector', function ($animate, $q, $parse, $injector) {
        "use strict";

        var $animateCss = $injector.has('$animateCss') ? $injector.get('$animateCss') : null;

        return {
            link: function (scope, element, attrs) {
                var temp_cl = 'ng.bootstrap.ui.collapse - link',
                    expandingExpr = $parse(attrs.expanding),
                    expandedExpr = $parse(attrs.expanded),
                    collapsingExpr = $parse(attrs.collapsing),
                    collapsedExpr = $parse(attrs.collapsed),
                    horizontal = false,
                    css = {},
                    cssTo = {};

                function getScrollFromElement(gs_elm) {
                    var output;
                    if (horizontal) {
                        output = { width: gs_elm.scrollWidth + 'px' };
                    } else {
                        output = { height: gs_elm.scrollHeight + 'px' };
                    }

                    msos.console.debug(temp_cl + ' - getScrollFromElement -> output:', output);
                    return output;
                }

                function expandDone() {
					var dbd = '.';

                    element
                        .removeClass('collapsing')
                        .addClass('collapse')
                        .css(css);

                    if (expandedExpr !== angular.noop) {
                        expandedExpr(scope);
						dbd = ', with expandedExpr.';
                    }

					msos.console.debug(temp_cl + ' - expandDone -> fired' + dbd);
                }

                function expand() {

                    function expand_then() {
                        element.removeClass('collapse')
                            .addClass('collapsing')
                            .attr('aria-expanded', true)
                            .attr('aria-hidden', false);

                        if ($animateCss) {
                            $animateCss(element, {
                                addClass: 'in',
                                easing: 'ease',
                                css: {
                                    overflow: 'hidden'
                                },
                                to: getScrollFromElement(element[0])
                            }).start()['finally'](expandDone);
                        } else {
                            $animate.addClass(element, 'in', {
                                css: {
                                    overflow: 'hidden'
                                },
                                to: getScrollFromElement(element[0])
                            }).then(expandDone);
                        }
                    }

                    if (element.hasClass('collapse') && element.hasClass('in')) {
						msos.console.debug(temp_cl + ' - expand -> skipped.');
                        return;
                    }

					// Get rid of noop causing expand/collape running thru $digest (Expreimental)
                    if (expandingExpr === angular.noop) {
                        expand_then();
                    } else {
						$q.resolve(
							$q.defer('ng_bootstrap_ui_collapse_resolve_expand'), expandingExpr(scope)
						).then(
							expand_then,
							angular.noop
						);
					}
                }

                function collapseDone() {
					element.css(cssTo);	// Required so that collapse works when animation is disabled
                    element
                        .removeClass('collapsing')
                        .addClass('collapse')
                        .css(cssTo);
    
                    if (collapsedExpr !== angular.noop) {
                        collapsedExpr(scope);
                    }
                }

                function collapse() {

                    function collapse_then() {

                        element
                            .css(getScrollFromElement(element[0]))
                            .removeClass('collapse')
                            .addClass('collapsing')
                            .attr('aria-expanded', false)
                            .attr('aria-hidden', true);

                        if ($animateCss) {
                            msos.console.debug(temp_cl + ' - collapse_then -> fired, for $animateCss');
                            $animateCss(element, {
                                removeClass: 'in',
                                to: cssTo
                            }).start()['finally'](collapseDone);
                        } else {
                            msos.console.debug(temp_cl + ' - collapse_then -> fired, for $animate');
                            $animate.removeClass(element, 'in', {
                                to: cssTo
                            }).then(collapseDone);
                        }
                    }

                    if (!element.hasClass('collapse') && !element.hasClass('in')) {
                        collapseDone();
                    } else {
                        // Get rid of noop causing expand/collape running thru $digest (Experimental)
                        if (collapsingExpr === angular.noop) {
                            collapse_then();
                        } else {
							$q.resolve(
								$q.defer('ng_bootstrap_ui_collapse_resolve_collapse'), collapsingExpr(scope)
							).then(
								collapse_then,
								angular.noop
							);
						}
                    }
                }

                function init() {

                    horizontal = !!(attrs.hasOwnProperty('horizontal'));

                    if (horizontal) {
                        css = {
                            width: ''
                        };
                        cssTo = {
                            width: '0'
                        };
                    } else {
                        css = {
                            height: ''
                        };
                        cssTo = {
                            height: '0'
                        };
                    }

                    if (!scope.$eval(attrs.uibCollapse)) {
                        element.addClass('in')
                            .addClass('collapse')
                            .attr('aria-expanded', true)
                            .attr('aria-hidden', false)
                            .css(css);
                    }
                }

                init();

                scope.$watch(
                    attrs.uibCollapse,
                    function collapse_scope_watch(shouldCollapse) {
                        if (shouldCollapse) {
                            collapse();
                        } else {
                            expand();
                        }
                    }
                );
            }
        };
    }]
).directive(
    'uibToggle',
    angular.restrictADir
).directive(
    'uibTarget',
    angular.restrictADir
).directive(
    'horizontal',
    angular.restrictADir
);

angular.module(
    'ng.bootstrap.ui.tabindex',
    ['ng']
).directive(
    'uibTabindexToggle', function () {
        "use strict";

        return {
            restrict: 'A',
            link: function (scope_na, elem_na, attrs) {
                    attrs.$observe(
                        'disabled',
                        function (disabled) {
                            attrs.$set('tabindex', disabled ? -1 : null);
                        }
                    );
                }
        };
    }
);

angular.module(
    'ng.bootstrap.ui.isClass',
    ['ng']
).directive(
    'uibIsClass',
    ['$animate', function ($animate) {
        "use strict";

        //                    11111111          22222222
        var ON_REGEXP = /^\s*([\s\S]+?)\s+on\s+([\s\S]+?)\s*$/,
        //                    11111111           22222222
            IS_REGEXP = /^\s*([\s\S]+?)\s+for\s+([\s\S]+?)\s*$/;

        return {
            restrict: 'A',
            compile: function (tElement_na, tAttrs) {
                var linkedScopes = [],
                    instances = [],
                    expToData = {},
                    onExpMatches = tAttrs.uibIsClass.match(ON_REGEXP),
                    onExp = onExpMatches[2],
                    expsStr = onExpMatches[1],
                    exps = expsStr.split(',');

                function removeScope(e) {
                    var removedScope = e.targetScope,
                        index = linkedScopes.indexOf(removedScope),
                        newWatchScope;

                    linkedScopes.splice(index, 1);
                    instances.splice(index, 1);

                    if (linkedScopes.length) {

                        newWatchScope = linkedScopes[0];

                        angular.forEach(expToData, function (data) {
                            if (data.scope === removedScope) {
                                data.watcher = newWatchScope.$watch(data.compareWithExp, data.watchFn);
                                data.scope = newWatchScope;
                            }
                        });
                    } else {
                        expToData = {};
                    }
                }

                function addForExp(exp, scope) {
                    var matches = exp.match(IS_REGEXP),
                        clazz = scope.$eval(matches[1]),
                        compareWithExp = matches[2],
                        data = expToData[exp],
                        watchFn;

                    if (!data) {
                        watchFn = function (compareWithVal) {
                            var newActivated = null;

                            instances.some(function (instance) {
                                var thisVal = instance.scope.$eval(onExp);

                                if (thisVal === compareWithVal) {
                                    newActivated = instance;
                                    return true;
                                }
                                return undefined;
                            });
                            if (data.lastActivated !== newActivated) {
                                if (data.lastActivated) {
                                    $animate.removeClass(data.lastActivated.element, clazz);
                                }
                                if (newActivated) {
                                    $animate.addClass(newActivated.element, clazz);
                                }
                                data.lastActivated = newActivated;
                            }
                        };
                        expToData[exp] = data = {
                            lastActivated: null,
                            scope: scope,
                            watchFn: watchFn,
                            compareWithExp: compareWithExp,
                            watcher: scope.$watch(compareWithExp, watchFn)
                        };
                    }
                    data.watchFn(scope.$eval(compareWithExp));
                }

                function linkFn(scope, element) {

                    linkedScopes.push(scope);

                    instances.push({
                        scope: scope,
                        element: element
                    });

                    exps.forEach(function (exp) {
                        addForExp(exp, scope);
                    });

                    scope.$on('$destroy', removeScope);
                }

                return linkFn;
            }
        };
    }]
);

angular.module(
    'ng.bootstrap.ui.position',
    ['ng']
).factory(
    '$uibPosition', ['$document', '$window', function ($document, $window) {
    "use strict";

    var SCROLLBAR_WIDTH,
        BODY_SCROLLBAR_WIDTH,
        OVERFLOW_REGEX = {
            normal: /(auto|scroll)/,
            hidden: /(auto|scroll|hidden)/
        },
        PLACEMENT_REGEX = {
            auto: /\s?auto?\s?/i,
            primary: /^(top|bottom|left|right)$/,
            secondary: /^(top|bottom|left|right|center)$/,
            vertical: /^(top|bottom)$/
        },
        BODY_REGEX = /(HTML|BODY)/;

    return {

        getRawNode: function (elem) {
            return elem.nodeName ? elem : elem[0] || elem;
        },

        parseStyle: function (value) {
            value = parseFloat(value);
            return isFinite(value) ? value : 0;
        },

        offsetParent: function (elem) {

            elem = this.getRawNode(elem);

            var offsetParent = elem.offsetParent || $document[0].documentElement;

            function isStaticPositioned(el) {
                return ($window.getComputedStyle(el).position || 'static') === 'static';
            }

            while (offsetParent && offsetParent !== $document[0].documentElement && isStaticPositioned(offsetParent)) {
                offsetParent = offsetParent.offsetParent;
            }

            return offsetParent || $document[0].documentElement;
        },

        scrollbarWidth: function (isBody) {
            var bodyElem,
                scrollElem;

            if (isBody) {
                if (angular.isUndefined(BODY_SCROLLBAR_WIDTH)) {
                    bodyElem = $document.find('body');
                    bodyElem.addClass('uib-position-body-scrollbar-measure');

                    BODY_SCROLLBAR_WIDTH = $window.innerWidth - bodyElem[0].clientWidth;
                    BODY_SCROLLBAR_WIDTH = isFinite(BODY_SCROLLBAR_WIDTH) ? BODY_SCROLLBAR_WIDTH : 0;
                    bodyElem.removeClass('uib-position-body-scrollbar-measure');
                }

                return BODY_SCROLLBAR_WIDTH;
            }

            if (angular.isUndefined(SCROLLBAR_WIDTH)) {
                scrollElem = angular.element('<div class="uib-position-scrollbar-measure"></div>');

                $document.find('body').append(scrollElem);
                SCROLLBAR_WIDTH = scrollElem[0].offsetWidth - scrollElem[0].clientWidth;
                SCROLLBAR_WIDTH = isFinite(SCROLLBAR_WIDTH) ? SCROLLBAR_WIDTH : 0;
                scrollElem.remove();
            }

            return SCROLLBAR_WIDTH;
        },

        scrollbarPadding: function (elem) {

            elem = this.getRawNode(elem);

            var elemStyle = $window.getComputedStyle(elem),
                paddingRight = this.parseStyle(elemStyle.paddingRight),
                paddingBottom = this.parseStyle(elemStyle.paddingBottom),
                scrollParent = this.scrollParent(elem, false, true),
				scrollbarWidth = this.scrollbarWidth(BODY_REGEX.test(scrollParent.tagName));

            return {
                scrollbarWidth: scrollbarWidth,
                widthOverflow: scrollParent.scrollWidth > scrollParent.clientWidth,
                right: paddingRight + scrollbarWidth,
                originalRight: paddingRight,
                heightOverflow: scrollParent.scrollHeight > scrollParent.clientHeight,
                bottom: paddingBottom + scrollbarWidth,
                originalBottom: paddingBottom
            };
        },

        isScrollable: function (elem, includeHidden) {
            elem = this.getRawNode(elem);

            var overflowRegex = includeHidden ? OVERFLOW_REGEX.hidden : OVERFLOW_REGEX.normal,
                elemStyle = $window.getComputedStyle(elem);

            return overflowRegex.test(elemStyle.overflow + elemStyle.overflowY + elemStyle.overflowX);
        },

        scrollParent: function (elem, includeHidden, includeSelf) {

            elem = this.getRawNode(elem);

            var overflowRegex = includeHidden ? OVERFLOW_REGEX.hidden : OVERFLOW_REGEX.normal,
                documentEl = $document[0].documentElement,
                elemStyle = $window.getComputedStyle(elem),
                excludeStatic,
                scrollParent,
                spStyle;

            if (includeSelf && overflowRegex.test(elemStyle.overflow + elemStyle.overflowY + elemStyle.overflowX)) {
                return elem;
            }

            excludeStatic = elemStyle.position === 'absolute';
            scrollParent = elem.parentElement || documentEl;

            if (scrollParent === documentEl || elemStyle.position === 'fixed') {
                return documentEl;
            }

            while (scrollParent.parentElement && scrollParent !== documentEl) {

                spStyle = $window.getComputedStyle(scrollParent);

                if (excludeStatic && spStyle.position !== 'static') {
                    excludeStatic = false;
                }

                if (!excludeStatic && overflowRegex.test(spStyle.overflow + spStyle.overflowY + spStyle.overflowX)) {
                    break;
                }

                scrollParent = scrollParent.parentElement;
            }

            return scrollParent;
        },

        position: function (elem, includeMagins) {
            elem = this.getRawNode(elem);

            var elemOffset = this.offset(elem),
                elemStyle,
                parent,
                parentOffset;

            if (includeMagins) {
                elemStyle = $window.getComputedStyle(elem);
                elemOffset.top -= this.parseStyle(elemStyle.marginTop);
                elemOffset.left -= this.parseStyle(elemStyle.marginLeft);
            }

            parent = this.offsetParent(elem);
            parentOffset = {
                top: 0,
                left: 0
            };

            if (parent !== $document[0].documentElement) {
                parentOffset = this.offset(parent);
                parentOffset.top += parent.clientTop - parent.scrollTop;
                parentOffset.left += parent.clientLeft - parent.scrollLeft;
            }

            return {
                width: Math.round(angular.isNumber(elemOffset.width) ? elemOffset.width : elem.offsetWidth),
                height: Math.round(angular.isNumber(elemOffset.height) ? elemOffset.height : elem.offsetHeight),
                top: Math.round(elemOffset.top - parentOffset.top),
                left: Math.round(elemOffset.left - parentOffset.left)
            };
        },

        offset: function (elem) {
            elem = this.getRawNode(elem);

            var elemBCR = elem.getBoundingClientRect();
            return {
                width: Math.round(angular.isNumber(elemBCR.width) ? elemBCR.width : elem.offsetWidth),
                height: Math.round(angular.isNumber(elemBCR.height) ? elemBCR.height : elem.offsetHeight),
                top: Math.round(elemBCR.top + ($window.pageYOffset || $document[0].documentElement.scrollTop)),
                left: Math.round(elemBCR.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft))
            };
        },

        viewportOffset: function (elem, useDocument, includePadding) {
            elem = this.getRawNode(elem);
            includePadding = includePadding !== false ? true : false;

            var elemBCR = elem.getBoundingClientRect(),
                offsetBCR = {
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0
                },
                offsetParent = useDocument ? $document[0].documentElement : this.scrollParent(elem),
                offsetParentBCR = offsetParent.getBoundingClientRect(),
                offsetParentStyle;

            offsetBCR.top = offsetParentBCR.top + offsetParent.clientTop;
            offsetBCR.left = offsetParentBCR.left + offsetParent.clientLeft;

            if (offsetParent === $document[0].documentElement) {
                offsetBCR.top += $window.pageYOffset;
                offsetBCR.left += $window.pageXOffset;
            }

            offsetBCR.bottom = offsetBCR.top + offsetParent.clientHeight;
            offsetBCR.right = offsetBCR.left + offsetParent.clientWidth;

            if (includePadding) {
                offsetParentStyle = $window.getComputedStyle(offsetParent);
                offsetBCR.top += this.parseStyle(offsetParentStyle.paddingTop);
                offsetBCR.bottom -= this.parseStyle(offsetParentStyle.paddingBottom);
                offsetBCR.left += this.parseStyle(offsetParentStyle.paddingLeft);
                offsetBCR.right -= this.parseStyle(offsetParentStyle.paddingRight);
            }

            return {
                top: Math.round(elemBCR.top - offsetBCR.top),
                bottom: Math.round(offsetBCR.bottom - elemBCR.bottom),
                left: Math.round(elemBCR.left - offsetBCR.left),
                right: Math.round(offsetBCR.right - elemBCR.right)
            };
        },

        parsePlacement: function (placement) {
            var autoPlace = PLACEMENT_REGEX.auto.test(placement);

            if (autoPlace) {
                placement = placement.replace(PLACEMENT_REGEX.auto, '');
            }

            placement = placement.split('-');
            placement[0] = placement[0] || 'top';

            if (!PLACEMENT_REGEX.primary.test(placement[0])) {
                placement[0] = 'top';
            }

            placement[1] = placement[1] || 'center';

            if (!PLACEMENT_REGEX.secondary.test(placement[1])) {
                placement[1] = 'center';
            }

            if (autoPlace) {
                placement[2] = true;
            } else {
                placement[2] = false;
            }

            return placement;
        },

        positionElements: function (hostElem, targetElem, placement, appendToBody) {

            hostElem = this.getRawNode(hostElem);
            targetElem = this.getRawNode(targetElem);

            // need to read from prop to support tests.
            var targetWidth = angular.isDefined(targetElem.offsetWidth) ? targetElem.offsetWidth : targetElem.prop('offsetWidth'),
                targetHeight = angular.isDefined(targetElem.offsetHeight) ? targetElem.offsetHeight : targetElem.prop('offsetHeight'),
                hostElemPos,
                targetElemPos,
                viewportOffset,
                targetElemStyle,
                adjustedSize,
                xOverflow,
                yOverflow;

            placement = this.parsePlacement(placement);

            hostElemPos = appendToBody ? this.offset(hostElem) : this.position(hostElem);
            targetElemPos = {
                top: 0,
                left: 0,
                placement: ''
            };

            if (placement[2]) {

                viewportOffset = this.viewportOffset(hostElem, appendToBody);
                targetElemStyle = $window.getComputedStyle(targetElem);
                adjustedSize = {
                    width: targetWidth + Math.round(Math.abs(this.parseStyle(targetElemStyle.marginLeft) + this.parseStyle(targetElemStyle.marginRight))),
                    height: targetHeight + Math.round(Math.abs(this.parseStyle(targetElemStyle.marginTop) + this.parseStyle(targetElemStyle.marginBottom)))
                };

                placement[0] = placement[0] === 'top' && adjustedSize.height > viewportOffset.top && adjustedSize.height <= viewportOffset.bottom ? 'bottom' :
                    placement[0] === 'bottom' && adjustedSize.height > viewportOffset.bottom && adjustedSize.height <= viewportOffset.top ? 'top' :
                    placement[0] === 'left' && adjustedSize.width > viewportOffset.left && adjustedSize.width <= viewportOffset.right ? 'right' :
                    placement[0] === 'right' && adjustedSize.width > viewportOffset.right && adjustedSize.width <= viewportOffset.left ? 'left' :
                    placement[0];

                placement[1] = placement[1] === 'top' && adjustedSize.height - hostElemPos.height > viewportOffset.bottom && adjustedSize.height - hostElemPos.height <= viewportOffset.top ? 'bottom' :
                    placement[1] === 'bottom' && adjustedSize.height - hostElemPos.height > viewportOffset.top && adjustedSize.height - hostElemPos.height <= viewportOffset.bottom ? 'top' :
                    placement[1] === 'left' && adjustedSize.width - hostElemPos.width > viewportOffset.right && adjustedSize.width - hostElemPos.width <= viewportOffset.left ? 'right' :
                    placement[1] === 'right' && adjustedSize.width - hostElemPos.width > viewportOffset.left && adjustedSize.width - hostElemPos.width <= viewportOffset.right ? 'left' :
                    placement[1];

                if (placement[1] === 'center') {
                    if (PLACEMENT_REGEX.vertical.test(placement[0])) {
                        xOverflow = hostElemPos.width / 2 - targetWidth / 2;
                        if (viewportOffset.left + xOverflow < 0 && adjustedSize.width - hostElemPos.width <= viewportOffset.right) {
                            placement[1] = 'left';
                        } else if (viewportOffset.right + xOverflow < 0 && adjustedSize.width - hostElemPos.width <= viewportOffset.left) {
                            placement[1] = 'right';
                        }
                    } else {
                        yOverflow = hostElemPos.height / 2 - adjustedSize.height / 2;
                        if (viewportOffset.top + yOverflow < 0 && adjustedSize.height - hostElemPos.height <= viewportOffset.bottom) {
                            placement[1] = 'top';
                        } else if (viewportOffset.bottom + yOverflow < 0 && adjustedSize.height - hostElemPos.height <= viewportOffset.top) {
                            placement[1] = 'bottom';
                        }
                    }
                }
            }

            switch (placement[0]) {
                case 'top':
                    targetElemPos.top = hostElemPos.top - targetHeight;
                    break;
                case 'bottom':
                    targetElemPos.top = hostElemPos.top + hostElemPos.height;
                    break;
                case 'left':
                    targetElemPos.left = hostElemPos.left - targetWidth;
                    break;
                case 'right':
                    targetElemPos.left = hostElemPos.left + hostElemPos.width;
                    break;
            }

            switch (placement[1]) {
                case 'top':
                    targetElemPos.top = hostElemPos.top;
                    break;
                case 'bottom':
                    targetElemPos.top = hostElemPos.top + hostElemPos.height - targetHeight;
                    break;
                case 'left':
                    targetElemPos.left = hostElemPos.left;
                    break;
                case 'right':
                    targetElemPos.left = hostElemPos.left + hostElemPos.width - targetWidth;
                    break;
                case 'center':
                    if (PLACEMENT_REGEX.vertical.test(placement[0])) {
                        targetElemPos.left = hostElemPos.left + hostElemPos.width / 2 - targetWidth / 2;
                    } else {
                        targetElemPos.top = hostElemPos.top + hostElemPos.height / 2 - targetHeight / 2;
                    }
                    break;
            }

            targetElemPos.top = Math.round(targetElemPos.top);
            targetElemPos.left = Math.round(targetElemPos.left);
            targetElemPos.placement = placement[1] === 'center' ? placement[0] : placement[0] + '-' + placement[1];

            return targetElemPos;
        },

        adjustTop: function (placementClasses, containerPosition, initialHeight, currentHeight) {
            if (placementClasses.indexOf('top') !== -1 && initialHeight !== currentHeight) {
                return {
                    top: containerPosition.top - currentHeight + 'px'
                };
            }
            return undefined;
        },

        positionArrow: function (elem, placement) {
            elem = this.getRawNode(elem);

            var innerElem = elem.querySelector('.tooltip-inner, .popover-inner'),
                isTooltip,
                arrowElem,
                arrowCss = {
                    top: '',
                    bottom: '',
                    left: '',
                    right: ''
                },
                borderProp,
                borderWidth,
                borderRadiusProp,
                borderRadius;

            if (!innerElem) {
                return;
            }

            isTooltip = angular.element(innerElem).hasClass('tooltip-inner');
            arrowElem = isTooltip ? elem.querySelector('.tooltip-arrow') : elem.querySelector('.arrow');

            if (!arrowElem) {
                return;
            }

            placement = this.parsePlacement(placement);

            if (placement[1] === 'center') {
                // no adjustment necessary - just reset styles
                angular.element(arrowElem).css(arrowCss);
                return;
            }

            borderProp = 'border-' + placement[0] + '-width';
            borderWidth = $window.getComputedStyle(arrowElem)[borderProp];
            borderRadiusProp = 'border-';

            if (PLACEMENT_REGEX.vertical.test(placement[0])) {
                borderRadiusProp += placement[0] + '-' + placement[1];
            } else {
                borderRadiusProp += placement[1] + '-' + placement[0];
            }

            borderRadiusProp += '-radius';
            borderRadius = $window.getComputedStyle(isTooltip ? innerElem : elem)[borderRadiusProp];

            switch (placement[0]) {
                case 'top':
                    arrowCss.bottom = isTooltip ? '0' : '-' + borderWidth;
                    break;
                case 'bottom':
                    arrowCss.top = isTooltip ? '0' : '-' + borderWidth;
                    break;
                case 'left':
                    arrowCss.right = isTooltip ? '0' : '-' + borderWidth;
                    break;
                case 'right':
                    arrowCss.left = isTooltip ? '0' : '-' + borderWidth;
                    break;
            }

            arrowCss[placement[1]] = borderRadius;

            angular.element(arrowElem).css(arrowCss);
        }
    };
}]);

angular.module(
    'ng.bootstrap.ui.debounce',
	['ng']
).factory(
    '$$debounce',
    ['$timeout', function ($timeout) {
        "use strict";

        return function (callback, debounceTime) {
            var timeoutPromise;

            return function () {
                var self = this,
                    args = Array.prototype.slice.call(arguments);

                if (timeoutPromise) {
                    $timeout.cancel(timeoutPromise);
                }

                timeoutPromise = $timeout(function () {
                    callback.apply(self, args);
                }, debounceTime);
            };
        };
    }]
);

angular.module(
    'ng.bootstrap.ui.multiMap',
    ['ng']
).factory(
    '$$multiMap', function () {
        "use strict";

        return {
            createNew: function () {
                var map = {};

                return {
                    entries: function () {
                        return Object.keys(map).map(
                            function (key) {
                                return {
                                    key: key,
                                    value: map[key]
                                };
                            }
                        );
                    },
          get: function (key) {
            return map[key];
          },
          hasKey: function (key) {
            return !!map[key];
          },
          keys: function () {
            return Object.keys(map);
          },
          put: function (key, value) {
            if (!map[key]) {
              map[key] = [];
            }

            map[key].push(value);
          },
          remove: function (key, value) {
            var values = map[key],
                idx;

            if (!values) {
              return;
            }

            idx = values.indexOf(value);

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
  }
);

angular.module(
    'ng.bootstrap.ui.stackedMap',
    ['ng']
).factory(
    '$$stackedMap',
    function () {
        "use strict";

        return {
            createNew: function () {
                var stack = [];

                return {
                    add: function (key, value) {
                        stack.push({
                            key: key,
                            value: value
                        });
                    },
                    get: function (key) {
                        var i = 0;

                        for (i = 0; i < stack.length; i += 1) {
                            if (key === stack[i].key) {
                                return stack[i];
                            }
                        }
                        return undefined;
                    },
                    keys: function () {
                        var i = 0,
                            keys = [];

                        for (i = 0; i < stack.length; i += 1) {
                            keys.push(stack[i].key);
                        }

                        return keys;
                    },
                    top: function () {
                        return stack[stack.length - 1];
                    },
                    remove: function (key) {
                        var i = 0,
                            idx = -1;

                        for (i = 0; i < stack.length; i += 1) {
                            if (key === stack[i].key) {
                                idx = i;
                                break;
                            }
                        }

                        return stack.splice(idx, 1)[0];
                    },
                    removeTop: function () {
                        return stack.pop();
                    },
                    length: function () {
                        return stack.length;
                    }
                };
            }
        };
    }
);
