/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 1.3.1 - 2016-03-06
 * License: MIT
 */

// Reduced version of angular-ui-bootstrap for just these components.
// We rename them for standarization with other MSOS ones (follows directory structure)
// ui.bootstrap.collapse        -> ng.bootstrap.ui.collapse,
// ui.bootstrap.position        -> ng.bootstrap.ui.position,
// ui.bootstrap.isClass         -> ng.bootstrap.ui.isClass
// ui.bootstrap.debounce        -> ng.bootstrap.ui.debounce
// ui.bootstrap.stackedMap      -> ng.bootstrap.ui.stackedMap
// Also Note: our adaptation of $q, $qq (ref. function qFactory where $q.defer acceptes a name)
angular.module(
    "ng.bootstrap.ui", [
        "ng.bootstrap.ui.collapse", "ng.bootstrap.ui.isClass",
        "ng.bootstrap.ui.position", "ng.bootstrap.ui.debounce",
        "ng.bootstrap.ui.stackedMap"
    ]
);

angular.module('ng.bootstrap.ui.collapse', []).directive(
    'uibCollapse',
    ['$animate', '$q', '$parse', '$injector', function($animate, $q, $parse, $injector) {

    var $animateCss = $injector.has('$animateCss') ? $injector.get('$animateCss') : null;
    return {
        link: function(scope, element, attrs) {
            var expandingExpr = $parse(attrs.expanding),
                expandedExpr = $parse(attrs.expanded),
                collapsingExpr = $parse(attrs.collapsing),
                collapsedExpr = $parse(attrs.collapsed);

            if (!scope.$eval(attrs.uibCollapse)) {
                element.addClass('in')
                    .addClass('collapse')
                    .attr('aria-expanded', true)
                    .attr('aria-hidden', false)
                    .css({
                        height: 'auto'
                    });
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
                            to: {
                                height: element[0].scrollHeight + 'px'
                            }
                        }).start()['finally'](expandDone);
                    } else {
                        $animate.addClass(element, 'in', {
                            to: {
                                height: element[0].scrollHeight + 'px'
                            }
                        }).then(expandDone);
                    }
                }

                if (element.hasClass('collapse') && element.hasClass('in')) {
                    return;
                }

                if (expandingExpr === angular.noop) {
                    expand_then();
                } else {
                    $q.resolve($q.defer('ng_bootstrap_ui_collapse_resolve_expand'), expandingExpr(scope))
                        .then(expand_then);
                }
            }

            function expandDone() {
                element.removeClass('collapsing')
                    .addClass('collapse')
                    .css({
                        height: 'auto'
                    });

                if (expandedExpr !== angular.noop) {
                    expandedExpr(scope);
                }
            }

            function collapse() {

                function collapse_then() {
                    element
                    // IMPORTANT: The height must be set before adding "collapsing" class.
                    // Otherwise, the browser attempts to animate from height 0 (in
                    // collapsing class) to the given height here.
                        .css({
                            height: element[0].scrollHeight + 'px'
                        })
                        // initially all panel collapse have the collapse class, this removal
                        // prevents the animation from jumping to collapsed state
                        .removeClass('collapse')
                        .addClass('collapsing')
                        .attr('aria-expanded', false)
                        .attr('aria-hidden', true);

                    if ($animateCss) {
                        $animateCss(element, {
                            removeClass: 'in',
                            to: {
                                height: '0'
                            }
                        }).start()['finally'](collapseDone);
                    } else {
                        $animate.removeClass(element, 'in', {
                            to: {
                                height: '0'
                            }
                        }).then(collapseDone);
                    }
                }

                if (!element.hasClass('collapse') && !element.hasClass('in')) {
                    collapseDone();
                } else {
                    if (collapsingExpr === angular.noop) {
                        collapse_then();
                    } else {
                        $q.resolve($q.defer('ng_bootstrap_ui_collapse_resolve_collapse'), collapsingExpr(scope))
                            .then(collapse_then);
                    }
                }
            }

            function collapseDone() {
                element.css({
                    height: '0'
                }); // Required so that collapse works when animation is disabled
                element.removeClass('collapsing')
                    .addClass('collapse');

                if (collapsedExpr !== angular.noop) {
                    collapsedExpr(scope);
                }
            }

            scope.$watch(attrs.uibCollapse, function(shouldCollapse) {
                if (shouldCollapse) {
                    collapse();
                } else {
                    expand();
                }
            });
        }
    };
}]);

angular.module('ng.bootstrap.ui.isClass', [])
    .directive('uibIsClass', [
        '$animate',
        function($animate) {
            //                    11111111          22222222
            var ON_REGEXP = /^\s*([\s\S]+?)\s+on\s+([\s\S]+?)\s*$/;
            //                    11111111           22222222
            var IS_REGEXP = /^\s*([\s\S]+?)\s+for\s+([\s\S]+?)\s*$/;

            var dataPerTracked = {};

            return {
                restrict: 'A',
                compile: function(tElement, tAttrs) {
                    var linkedScopes = [];
                    var instances = [];
                    var expToData = {};
                    var lastActivated = null;
                    var onExpMatches = tAttrs.uibIsClass.match(ON_REGEXP);
                    var onExp = onExpMatches[2];
                    var expsStr = onExpMatches[1];
                    var exps = expsStr.split(',');

                    return linkFn;

                    function linkFn(scope, element, attrs) {
                        linkedScopes.push(scope);
                        instances.push({
                            scope: scope,
                            element: element
                        });

                        exps.forEach(function(exp, k) {
                            addForExp(exp, scope);
                        });

                        scope.$on('$destroy', removeScope);
                    }

                    function addForExp(exp, scope) {
                        var matches = exp.match(IS_REGEXP);
                        var clazz = scope.$eval(matches[1]);
                        var compareWithExp = matches[2];
                        var data = expToData[exp];
                        if (!data) {
                            var watchFn = function(compareWithVal) {
                                var newActivated = null;
                                instances.some(function(instance) {
                                    var thisVal = instance.scope.$eval(onExp);
                                    if (thisVal === compareWithVal) {
                                        newActivated = instance;
                                        return true;
                                    }
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

                    function removeScope(e) {
                        var removedScope = e.targetScope;
                        var index = linkedScopes.indexOf(removedScope);
                        linkedScopes.splice(index, 1);
                        instances.splice(index, 1);
                        if (linkedScopes.length) {
                            var newWatchScope = linkedScopes[0];
                            angular.forEach(expToData, function(data) {
                                if (data.scope === removedScope) {
                                    data.watcher = newWatchScope.$watch(data.compareWithExp, data.watchFn);
                                    data.scope = newWatchScope;
                                }
                            });
                        } else {
                            expToData = {};
                        }
                    }
                }
            };
        }
    ]);

angular.module('ng.bootstrap.ui.position', [])

.factory('$uibPosition', ['$document', '$window', function($document, $window) {
    /**
     * Used by scrollbarWidth() function to cache scrollbar's width.
     * Do not access this variable directly, use scrollbarWidth() instead.
     */
    var SCROLLBAR_WIDTH;
    /**
     * scrollbar on body and html element in IE and Edge overlay
     * content and should be considered 0 width.
     */
    var BODY_SCROLLBAR_WIDTH;
    var OVERFLOW_REGEX = {
        normal: /(auto|scroll)/,
        hidden: /(auto|scroll|hidden)/
    };
    var PLACEMENT_REGEX = {
        auto: /\s?auto?\s?/i,
        primary: /^(top|bottom|left|right)$/,
        secondary: /^(top|bottom|left|right|center)$/,
        vertical: /^(top|bottom)$/
    };
    var BODY_REGEX = /(HTML|BODY)/;

    return {

        getRawNode: function(elem) {
            return elem.nodeName ? elem : elem[0] || elem;
        },

        parseStyle: function(value) {
            value = parseFloat(value);
            return isFinite(value) ? value : 0;
        },

        offsetParent: function(elem) {
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

        scrollbarWidth: function(isBody) {
            if (isBody) {
                if (angular.isUndefined(BODY_SCROLLBAR_WIDTH)) {
                    var bodyElem = $document.find('body');
                    bodyElem.addClass('uib-position-body-scrollbar-measure');
                    BODY_SCROLLBAR_WIDTH = $window.innerWidth - bodyElem[0].clientWidth;
                    BODY_SCROLLBAR_WIDTH = isFinite(BODY_SCROLLBAR_WIDTH) ? BODY_SCROLLBAR_WIDTH : 0;
                    bodyElem.removeClass('uib-position-body-scrollbar-measure');
                }
                return BODY_SCROLLBAR_WIDTH;
            }

            if (angular.isUndefined(SCROLLBAR_WIDTH)) {
                var scrollElem = angular.element('<div class="uib-position-scrollbar-measure"></div>');
                $document.find('body').append(scrollElem);
                SCROLLBAR_WIDTH = scrollElem[0].offsetWidth - scrollElem[0].clientWidth;
                SCROLLBAR_WIDTH = isFinite(SCROLLBAR_WIDTH) ? SCROLLBAR_WIDTH : 0;
                scrollElem.remove();
            }

            return SCROLLBAR_WIDTH;
        },

        scrollbarPadding: function(elem) {
            elem = this.getRawNode(elem);

            var elemStyle = $window.getComputedStyle(elem);
            var paddingRight = this.parseStyle(elemStyle.paddingRight);
            var paddingBottom = this.parseStyle(elemStyle.paddingBottom);
            var scrollParent = this.scrollParent(elem, false, true);
            var scrollbarWidth = this.scrollbarWidth(scrollParent, BODY_REGEX.test(scrollParent.tagName));

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

        isScrollable: function(elem, includeHidden) {
            elem = this.getRawNode(elem);

            var overflowRegex = includeHidden ? OVERFLOW_REGEX.hidden : OVERFLOW_REGEX.normal;
            var elemStyle = $window.getComputedStyle(elem);
            return overflowRegex.test(elemStyle.overflow + elemStyle.overflowY + elemStyle.overflowX);
        },

        scrollParent: function(elem, includeHidden, includeSelf) {
            elem = this.getRawNode(elem);

            var overflowRegex = includeHidden ? OVERFLOW_REGEX.hidden : OVERFLOW_REGEX.normal;
            var documentEl = $document[0].documentElement;
            var elemStyle = $window.getComputedStyle(elem);
            if (includeSelf && overflowRegex.test(elemStyle.overflow + elemStyle.overflowY + elemStyle.overflowX)) {
                return elem;
            }
            var excludeStatic = elemStyle.position === 'absolute';
            var scrollParent = elem.parentElement || documentEl;

            if (scrollParent === documentEl || elemStyle.position === 'fixed') {
                return documentEl;
            }

            while (scrollParent.parentElement && scrollParent !== documentEl) {
                var spStyle = $window.getComputedStyle(scrollParent);
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

        position: function(elem, includeMagins) {
            elem = this.getRawNode(elem);

            var elemOffset = this.offset(elem);
            if (includeMagins) {
                var elemStyle = $window.getComputedStyle(elem);
                elemOffset.top -= this.parseStyle(elemStyle.marginTop);
                elemOffset.left -= this.parseStyle(elemStyle.marginLeft);
            }
            var parent = this.offsetParent(elem);
            var parentOffset = {
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

        offset: function(elem) {
            elem = this.getRawNode(elem);

            var elemBCR = elem.getBoundingClientRect();
            return {
                width: Math.round(angular.isNumber(elemBCR.width) ? elemBCR.width : elem.offsetWidth),
                height: Math.round(angular.isNumber(elemBCR.height) ? elemBCR.height : elem.offsetHeight),
                top: Math.round(elemBCR.top + ($window.pageYOffset || $document[0].documentElement.scrollTop)),
                left: Math.round(elemBCR.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft))
            };
        },

        viewportOffset: function(elem, useDocument, includePadding) {
            elem = this.getRawNode(elem);
            includePadding = includePadding !== false ? true : false;

            var elemBCR = elem.getBoundingClientRect();
            var offsetBCR = {
                top: 0,
                left: 0,
                bottom: 0,
                right: 0
            };

            var offsetParent = useDocument ? $document[0].documentElement : this.scrollParent(elem);
            var offsetParentBCR = offsetParent.getBoundingClientRect();

            offsetBCR.top = offsetParentBCR.top + offsetParent.clientTop;
            offsetBCR.left = offsetParentBCR.left + offsetParent.clientLeft;
            if (offsetParent === $document[0].documentElement) {
                offsetBCR.top += $window.pageYOffset;
                offsetBCR.left += $window.pageXOffset;
            }
            offsetBCR.bottom = offsetBCR.top + offsetParent.clientHeight;
            offsetBCR.right = offsetBCR.left + offsetParent.clientWidth;

            if (includePadding) {
                var offsetParentStyle = $window.getComputedStyle(offsetParent);
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

        parsePlacement: function(placement) {
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

        positionElements: function(hostElem, targetElem, placement, appendToBody) {
            hostElem = this.getRawNode(hostElem);
            targetElem = this.getRawNode(targetElem);

            // need to read from prop to support tests.
            var targetWidth = angular.isDefined(targetElem.offsetWidth) ? targetElem.offsetWidth : targetElem.prop('offsetWidth');
            var targetHeight = angular.isDefined(targetElem.offsetHeight) ? targetElem.offsetHeight : targetElem.prop('offsetHeight');

            placement = this.parsePlacement(placement);

            var hostElemPos = appendToBody ? this.offset(hostElem) : this.position(hostElem);
            var targetElemPos = {
                top: 0,
                left: 0,
                placement: ''
            };

            if (placement[2]) {
                var viewportOffset = this.viewportOffset(hostElem, appendToBody);

                var targetElemStyle = $window.getComputedStyle(targetElem);
                var adjustedSize = {
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
                        var xOverflow = hostElemPos.width / 2 - targetWidth / 2;
                        if (viewportOffset.left + xOverflow < 0 && adjustedSize.width - hostElemPos.width <= viewportOffset.right) {
                            placement[1] = 'left';
                        } else if (viewportOffset.right + xOverflow < 0 && adjustedSize.width - hostElemPos.width <= viewportOffset.left) {
                            placement[1] = 'right';
                        }
                    } else {
                        var yOverflow = hostElemPos.height / 2 - adjustedSize.height / 2;
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

        positionArrow: function(elem, placement) {
            elem = this.getRawNode(elem);

            var innerElem = elem.querySelector('.tooltip-inner, .popover-inner');
            if (!innerElem) {
                return;
            }

            var isTooltip = angular.element(innerElem).hasClass('tooltip-inner');

            var arrowElem = isTooltip ? elem.querySelector('.tooltip-arrow') : elem.querySelector('.arrow');
            if (!arrowElem) {
                return;
            }

            var arrowCss = {
                top: '',
                bottom: '',
                left: '',
                right: ''
            };

            placement = this.parsePlacement(placement);
            if (placement[1] === 'center') {
                // no adjustment necessary - just reset styles
                angular.element(arrowElem).css(arrowCss);
                return;
            }

            var borderProp = 'border-' + placement[0] + '-width';
            var borderWidth = $window.getComputedStyle(arrowElem)[borderProp];

            var borderRadiusProp = 'border-';
            if (PLACEMENT_REGEX.vertical.test(placement[0])) {
                borderRadiusProp += placement[0] + '-' + placement[1];
            } else {
                borderRadiusProp += placement[1] + '-' + placement[0];
            }
            borderRadiusProp += '-radius';
            var borderRadius = $window.getComputedStyle(isTooltip ? innerElem : elem)[borderRadiusProp];

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

angular.module('ng.bootstrap.ui.debounce', [])
    /**
     * A helper, internal service that debounces a function
     */
    .factory('$$debounce', ['$timeout', function($timeout) {
        return function(callback, debounceTime) {
            var timeoutPromise;

            return function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments);
                if (timeoutPromise) {
                    $timeout.cancel(timeoutPromise);
                }

                timeoutPromise = $timeout(function() {
                    callback.apply(self, args);
                }, debounceTime);
            };
        };
    }]);

angular.module('ng.bootstrap.ui.stackedMap', [])
    /**
     * A helper, internal data structure that acts as a map but also allows getting / removing
     * elements in the LIFO order
     */
    .factory('$$stackedMap', function() {
        return {
            createNew: function() {
                var stack = [];

                return {
                    add: function(key, value) {
                        stack.push({
                            key: key,
                            value: value
                        });
                    },
                    get: function(key) {
                        for (var i = 0; i < stack.length; i++) {
                            if (key === stack[i].key) {
                                return stack[i];
                            }
                        }
                    },
                    keys: function() {
                        var keys = [];
                        for (var i = 0; i < stack.length; i++) {
                            keys.push(stack[i].key);
                        }
                        return keys;
                    },
                    top: function() {
                        return stack[stack.length - 1];
                    },
                    remove: function(key) {
                        var idx = -1;
                        for (var i = 0; i < stack.length; i++) {
                            if (key === stack[i].key) {
                                idx = i;
                                break;
                            }
                        }
                        return stack.splice(idx, 1)[0];
                    },
                    removeTop: function() {
                        return stack.splice(stack.length - 1, 1)[0];
                    },
                    length: function() {
                        return stack.length;
                    }
                };
            }
        };
    });
