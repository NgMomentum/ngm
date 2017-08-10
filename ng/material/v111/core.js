
/*!
 * Angular Material Design
 * https://github.com/angular/material
 * @license MIT
 * v1.1.1
 */

/*global
    msos: false,
    angular: false,
    ng: false,
    Modernizr: false,
    _: false,
    Node: false
*/

msos.provide("ng.material.v111.core");

ng.material.v111.core.version = new msos.set_version(16, 12, 29);


(function (window, angular) {
    "use strict";

    var ng_material_core_css = new msos.loader(),
        nextUniqueId = 0,
        mdCompilerService;

    // Add AngularJS Material Design specific css
    ng_material_core_css.load(msos.resource_url('ng', 'material/css/v111/full.uc.css'));


    function MdConstantFactory() {

        var vendorPrefix,
            vendorRegex = /^(Moz|webkit|ms)(?=[A-Z])/,
            SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g,
            bodyStyle = document.body && document.body.style,
            prop,
            match,
            isWebkit,
            prefixTestEl,
            self;

        if (bodyStyle) {
            for (prop in bodyStyle) {
                if (bodyStyle.hasOwnProperty(prop)) {
                    match = vendorRegex.exec(prop);

                    if (match) {
                        vendorPrefix = match[0];
                        vendorPrefix = vendorPrefix[0].toUpperCase() + vendorPrefix.substr(1);
                        break;
                    }
                }
            }
        }

        if (!vendorPrefix) {
            vendorPrefix = bodyStyle.hasOwnProperty('WebkitOpacity') && 'webkit';
        }

        isWebkit = /webkit/i.test(vendorPrefix);
        prefixTestEl = document.createElement('div');

        function camelCase(input) {
            return input.replace(SPECIAL_CHARS_REGEXP, function (matches_na, separator_na, letter, offset) {
                return offset ? letter.toUpperCase() : letter;
            });
        }

        function hasStyleProperty(property) {
            return angular.isDefined(prefixTestEl.style[property]);
        }

        function vendorProperty(name) {
            // Add a dash between the prefix and name, to be able to transform the string into camelcase.
            var prefixedName = vendorPrefix + '-' + name,
                ucPrefix = camelCase(prefixedName),
                lcPrefix = ucPrefix.charAt(0).toLowerCase() + ucPrefix.substring(1);

            return hasStyleProperty(name) ? name : // The current browser supports the un-prefixed property
                hasStyleProperty(ucPrefix) ? ucPrefix : // The current browser only supports the prefixed property.
                hasStyleProperty(lcPrefix) ? lcPrefix : name; // Some browsers are only supporting the prefix in lowercase.
        }

        self = {
            isInputKey: function (e) {
                return (e.keyCode >= 31 && e.keyCode <= 90);
            },
            isNumPadKey: function (e) {
                return (3 === e.location && e.keyCode >= 97 && e.keyCode <= 105);
            },
            isNavigationKey: function (e) {
                var kc = self.KEY_CODE,
                    NAVIGATION_KEYS = [kc.SPACE, kc.ENTER, kc.UP_ARROW, kc.DOWN_ARROW];
                return (NAVIGATION_KEYS.indexOf(e.keyCode) !== -1);
            },

            KEY_CODE: {
                COMMA: 188,
                SEMICOLON: 186,
                ENTER: 13,
                ESCAPE: 27,
                SPACE: 32,
                PAGE_UP: 33,
                PAGE_DOWN: 34,
                END: 35,
                HOME: 36,
                LEFT_ARROW: 37,
                UP_ARROW: 38,
                RIGHT_ARROW: 39,
                DOWN_ARROW: 40,
                TAB: 9,
                BACKSPACE: 8,
                DELETE: 46
            },
            CSS: {
                /* Constants */
                TRANSITIONEND: 'transitionend' + (isWebkit ? ' webkitTransitionEnd' : ''),
                ANIMATIONEND: 'animationend' + (isWebkit ? ' webkitAnimationEnd' : ''),

                TRANSFORM: vendorProperty('transform'),
                TRANSFORM_ORIGIN: vendorProperty('transformOrigin'),
                TRANSITION: vendorProperty('transition'),
                TRANSITION_DURATION: vendorProperty('transitionDuration'),
                ANIMATION_PLAY_STATE: vendorProperty('animationPlayState'),
                ANIMATION_DURATION: vendorProperty('animationDuration'),
                ANIMATION_NAME: vendorProperty('animationName'),
                ANIMATION_TIMING: vendorProperty('animationTimingFunction'),
                ANIMATION_DIRECTION: vendorProperty('animationDirection')
            },
            /**
             * As defined in core/style/variables.scss
             *
             * $layout-breakpoint-xs:     600px !default;
             * $layout-breakpoint-sm:     960px !default;
             * $layout-breakpoint-md:     1280px !default;
             * $layout-breakpoint-lg:     1920px !default;
             *
             */
            MEDIA: {
                'xs': '(max-width: 599px)',
                'gt-xs': '(min-width: 600px)',
                'sm': '(min-width: 600px) and (max-width: 959px)',
                'gt-sm': '(min-width: 960px)',
                'md': '(min-width: 960px) and (max-width: 1279px)',
                'gt-md': '(min-width: 1280px)',
                'lg': '(min-width: 1280px) and (max-width: 1919px)',
                'gt-lg': '(min-width: 1920px)',
                'xl': '(min-width: 1920px)',
                'landscape': '(orientation: landscape)',
                'portrait': '(orientation: portrait)',
                'print': 'print'
            },
            MEDIA_PRIORITY: [
                'xl',
                'gt-lg',
                'lg',
                'gt-md',
                'md',
                'gt-sm',
                'sm',
                'gt-xs',
                'xs',
                'landscape',
                'portrait',
                'print'
            ]
        };

        return self;
    }

    function MdIterator(items, reloop) {
        var trueFn = function () {
                return true;
            },
            _items;

        if (items && !angular.isArray(items)) {
            items = Array.prototype.slice.call(items);
        }

        reloop = !!reloop;
        _items = items || [];

        function getItems() {
            return [].concat(_items);
        }

        function count() {
            return _items.length;
        }

        function inRange(index) {
            return _items.length && (index > -1) && (index < _items.length);
        }

        function indexOf(item) {
            return _items.indexOf(item);
        }

        function hasNext(item) {
            return item ? inRange(indexOf(item) + 1) : false;
        }

        function hasPrevious(item) {
            return item ? inRange(indexOf(item) - 1) : false;
        }

        function itemAt(index) {
            return inRange(index) ? _items[index] : null;
        }

        function findBy(key, val) {
            return _items.filter(function (item) {
                return item[key] === val;
            });
        }

        function add(item, index) {
            if (!item) { return -1; }

            if (!angular.isNumber(index)) {
                index = _items.length;
            }

            _items.splice(index, 0, item);

            return indexOf(item);
        }

        function contains(item) {
            return item && (indexOf(item) > -1);
        }

        function remove(item) {
            if (contains(item)) {
                _items.splice(indexOf(item), 1);
            }
        }

        function first() {
            return _items.length ? _items[0] : null;
        }

        function last() {
            return _items.length ? _items[_items.length - 1] : null;
        }

        function findSubsequentItem(backwards, item, validate, limit) {
            validate = validate || trueFn;

            var curIndex = indexOf(item),
                nextIndex,
                foundItem;

            while (true) {
                if (!inRange(curIndex)) { return null; }

                nextIndex = curIndex + (backwards ? -1 : 1);
                foundItem = null;

                if (inRange(nextIndex)) {
                    foundItem = _items[nextIndex];
                } else if (reloop) {
                    foundItem = backwards ? last() : first();
                    nextIndex = indexOf(foundItem);
                }

                if ((foundItem === null) || (nextIndex === limit)) { return null; }
                if (validate(foundItem)) { return foundItem; }

                if (angular.isUndefined(limit)) { limit = nextIndex; }

                curIndex = nextIndex;
            }
        }

        // Published API
        return {
            items: getItems,
            count: count,

            inRange: inRange,
            contains: contains,
            indexOf: indexOf,
            itemAt: itemAt,

            findBy: findBy,

            add: add,
            remove: remove,

            first: first,
            last: last,
            next: angular.bind(null, findSubsequentItem, false),
            previous: angular.bind(null, findSubsequentItem, true),

            hasPrevious: hasPrevious,
            hasNext: hasNext

        };
    }

    function MdPrefixer(initialAttributes, buildSelector) {
        var PREFIXES = ['data', 'x'];

        function _buildList(attributes) {
            attributes = angular.isArray(attributes) ? attributes : [attributes];

            attributes.forEach(function (item) {
                PREFIXES.forEach(function (prefix) {
                    attributes.push(prefix + '-' + item);
                });
            });

            return attributes;
        }

        function _buildSelector(attributes) {
            attributes = angular.isArray(attributes) ? attributes : [attributes];

            return _buildList(attributes).map(
                    function (item) {
                        return '[' + item + ']';
                    }
                ).join(',');
        }

        function _getNativeElement(element) {
            element = element[0] || element;

            if (element.nodeType) {
                return element;
            }

            return undefined;
        }

        function _hasAttribute(element, attribute) {

            element = _getNativeElement(element);

            if (!element) {
                return false;
            }

            var prefixedAttrs = _buildList(attribute),
                i = 0;

            for (i = 0; i < prefixedAttrs.length; i += 1) {
                if (element.hasAttribute(prefixedAttrs[i])) {
                    return true;
                }
            }

            return false;
        }

        function _removeAttribute(element, attribute) {

            element = _getNativeElement(element);

            if (!element) {
                return;
            }

            _buildList(attribute).forEach(
                function (prefixedAttribute) {
                    element.removeAttribute(prefixedAttribute);
                }
            );
        }

        if (initialAttributes) {
            // The prefixer also accepts attributes as a parameter, and immediately builds a list or selector for
            // the specified attributes.
            return buildSelector ? _buildSelector(initialAttributes) : _buildList(initialAttributes);
        }

        return {
            buildList: _buildList,
            buildSelector: _buildSelector,
            hasAttribute: _hasAttribute,
            removeAttribute: _removeAttribute
        };
    }

    function UtilFactory($document, $timeout, $compile, $rootScope, $interpolate, $log, $rootElement, $window, $$rAF) {
        // Setup some core variables for the processTemplate method
        var startSymbol = $interpolate.startSymbol(),
            endSymbol = $interpolate.endSymbol(),
            usesStandardSymbols = ((startSymbol === '{{') && (endSymbol === '}}')),
            hasComputedStyle = function (target, key, expectedVal) {
                var hasValue = false,
                    computedStyles;

                if (target && target.length) {
                    computedStyles = $window.getComputedStyle(target[0]);
                    hasValue = angular.isDefined(computedStyles[key]) && (expectedVal ? computedStyles[key] === expectedVal : true);
                }

                return hasValue;
            },
            $mdUtil;

        function getNode(el) {
            return el[0] || el;
        }

        function hasPx(value) {
            return String(value).indexOf('px') > -1;
        }

        function hasPercent(value) {
            return String(value).indexOf('%') > -1;
        }

        function validateCssValue(value) {
            return !value ? '0' :
                hasPx(value) || hasPercent(value) ? value : value + 'px';
        }

        $mdUtil = {
            dom: {},
            now: window.performance ?
                angular.bind(window.performance, window.performance.now) : Date.now || function () {
                    return new Date().getTime();
                },

            bidi: function (element, property, lValue, rValue) {
                var ltr = !($document[0].dir === 'rtl' || $document[0].body.dir === 'rtl'),
                    elem;

                // If accessor
                if (arguments.length === 0) { return ltr ? 'ltr' : 'rtl'; }

                // If mutator
                elem = angular.element(element);

                if (ltr && angular.isDefined(lValue)) {
                    elem.css(property, validateCssValue(lValue));
                } else if (!ltr && angular.isDefined(rValue)) {
                    elem.css(property, validateCssValue(rValue));
                }

                return undefined;
            },
            bidiProperty: function (element, lProperty, rProperty, value) {
                var ltr = !($document[0].dir === 'rtl' || $document[0].body.dir === 'rtl'),
                    elem = angular.element(element);

                if (ltr && angular.isDefined(lProperty)) {
                    elem.css(lProperty, validateCssValue(value));
                    elem.css(rProperty, '');
                } else if (!ltr && angular.isDefined(rProperty)) {
                    elem.css(rProperty, validateCssValue(value));
                    elem.css(lProperty, '');
                }
            },
            clientRect: function (element, offsetParent, isOffsetRect) {
                var node = getNode(element),
                    nodeRect = node.getBoundingClientRect(),
                    offsetRect;

                offsetParent = getNode(offsetParent || node.offsetParent || document.body);

                // The user can ask for an offsetRect: a rect relative to the offsetParent,
                // or a clientRect: a rect relative to the page
                offsetRect = isOffsetRect ?
                    offsetParent.getBoundingClientRect() : {
                        left: 0,
                        top: 0,
                        width: 0,
                        height: 0
                    };

                return {
                    left: nodeRect.left - offsetRect.left,
                    top: nodeRect.top - offsetRect.top,
                    width: nodeRect.width,
                    height: nodeRect.height
                };
            },
            offsetRect: function (element, offsetParent) {
                return $mdUtil.clientRect(element, offsetParent, true);
            },
            // Annoying method to copy nodes to an array, thanks to IE
            nodesToArray: function (nodes) {
                nodes = nodes || [];

                var results = [],
                    i = 0;

                for (i = 0; i < nodes.length; i += 1) {
                    results.push(nodes.item(i));
                }

                return results;
            },
            scrollTop: function (element) {

                element = angular.element(element || $document[0].body);

                var body = (element[0] === $document[0].body) ? $document[0].body : undefined,
                    scrollTop = body ? body.scrollTop + body.parentElement.scrollTop : 0;

                // Calculate the positive scroll offset
                return scrollTop || Math.abs(element[0].getBoundingClientRect().top);
            },
            findFocusTarget: function (containerEl, attributeVal) {

                var AUTO_FOCUS = this.prefixer('md-autofocus', true),
                    elToFocus;

                function scanForFocusable(target, selector) {
                    var elFound,
                        items = target[0].querySelectorAll(selector);

                    // Find the last child element with the focus attribute
                    if (items && items.length) {
                        angular.forEach(
                            items,
                            function (it) {
                                it = angular.element(it);
    
                                // Check the element for the md-autofocus class to ensure any associated expression
                                // evaluated to true.
                                var isFocusable = it.hasClass('md-autofocus');
    
                                if (isFocusable) { elFound = it; }
                            }
                        );
                    }

                    return elFound;
                }

                elToFocus = scanForFocusable(containerEl, attributeVal || AUTO_FOCUS);

                if (!elToFocus && attributeVal !== AUTO_FOCUS) {
                    // Scan for deprecated attribute
                    elToFocus = scanForFocusable(containerEl, this.prefixer('md-auto-focus', true));

                    if (!elToFocus) {
                        // Scan for fallback to 'universal' API
                        elToFocus = scanForFocusable(containerEl, AUTO_FOCUS);
                    }
                }

                return elToFocus;
            },
            disableScrollAround: function (element_na, parent, options) {
                var body = $document[0].body,
                    restoreBody,
                    restoreElement;

                $mdUtil.disableScrollAround._count = $mdUtil.disableScrollAround._count || 0;

                $mdUtil.disableScrollAround._count += 1;

                if ($mdUtil.disableScrollAround._enableScrolling) { return $mdUtil.disableScrollAround._enableScrolling; }

                // Creates a virtual scrolling mask to absorb touchmove, keyboard, scrollbar clicking, and wheel events
                function disableElementScroll(element) {

                    element = angular.element(element || body);

                    var scrollMask;

                    if (options && options.disableScrollMask) {
                        scrollMask = element;
                    } else {
                        element = element[0];
                        scrollMask = angular.element(
                            '<div class="md-scroll-mask">' +
                            '  <div class="md-scroll-mask-bar"></div>' +
                            '</div>');
                        element.appendChild(scrollMask[0]);
                    }

                    function preventDefault(e) {
                        e.preventDefault();
                    }

                    scrollMask.on('wheel', preventDefault);
                    scrollMask.on('touchmove', preventDefault);

                    return function restoreScroll() {
                        scrollMask.off('wheel');
                        scrollMask.off('touchmove');
                        scrollMask[0].parentNode.removeChild(scrollMask[0]);

                        delete $mdUtil.disableScrollAround._enableScrolling;
                    };
                }

                function applyStyles(el, styles) {
                    var key;

                    for (key in styles) {
                        if (styles.hasOwnProperty(key)) {
                            el.style[key] = styles[key];
                        }
                    }
                }

                // Converts the body to a position fixed block and translate it to the proper scroll position
                function disableBodyScroll() {
                    var htmlNode = body.parentNode,
                        restoreHtmlStyle = htmlNode.style.cssText || '',
                        restoreBodyStyle = body.style.cssText || '',
                        scrollOffset = $mdUtil.scrollTop(body),
                        clientWidth = body.clientWidth;

                    if (body.scrollHeight > body.clientHeight + 1) {
                        applyStyles(body, {
                            position: 'fixed',
                            width: '100%',
                            top: -scrollOffset + 'px'
                        });

                        htmlNode.style.overflowY = 'scroll';
                    }

                    if (body.clientWidth < clientWidth) {
                        applyStyles(
                            body,
                            { overflow: 'hidden' }
                        );
                    }

                    return function restoreScroll() {
                        body.style.cssText = restoreBodyStyle;
                        htmlNode.style.cssText = restoreHtmlStyle;
                        body.scrollTop = scrollOffset;
                        htmlNode.scrollTop = scrollOffset;
                    };
                }

                restoreBody = disableBodyScroll();
                restoreElement = disableElementScroll(parent);

                $mdUtil.disableScrollAround._enableScrolling = function () {

                    $mdUtil.disableScrollAround._count -= 1;

                    if (!$mdUtil.disableScrollAround._count) {
                        restoreBody();
                        restoreElement();
                        delete $mdUtil.disableScrollAround._enableScrolling;
                    }
                };

                return $mdUtil.disableScrollAround._enableScrolling;
            },
            enableScrolling: function () {
                var method = this.disableScrollAround._enableScrolling;

                if (method && _.isFunction(method)) { method(); }
            },
            floatingScrollbars: function () {
                if (this.floatingScrollbars.cached === undefined) {
                    var tempNode = angular.element('<div><div></div></div>').css({
                        width: '100%',
                        'z-index': -1,
                        position: 'absolute',
                        height: '35px',
                        'overflow-y': 'scroll'
                    });
                    tempNode.children().css('height', '60px');

                    $document[0].body.appendChild(tempNode[0]);
                    this.floatingScrollbars.cached = (tempNode[0].offsetWidth === tempNode[0].childNodes[0].offsetWidth);
                    tempNode.remove();
                }
                return this.floatingScrollbars.cached;
            },
            // Mobile safari only allows you to set focus in click event listeners...
            forceFocus: function (element) {
                var node = element[0] || element,
                    newEvent = document.createEvent('MouseEvents');

                document.addEventListener('click', function focusOnClick(ev) {
                    if (ev.target === node && ev.$focus) {
                        node.focus();
                        ev.stopImmediatePropagation();
                        ev.preventDefault();
                        node.removeEventListener('click', focusOnClick);
                    }
                }, true);

                newEvent.initMouseEvent('click', false, true, window, {}, 0, 0, 0, 0,
                    false, false, false, false, 0, null);
                newEvent.$material = true;
                newEvent.$focus = true;
                node.dispatchEvent(newEvent);
            },
            createBackdrop: function (scope, addClass) {
                return $compile($mdUtil.supplant('<md-backdrop class="{0}">', [addClass]))(scope);
            },
            supplant: function (template, values, pattern) {
                pattern = pattern || /\{([^\{\}]*)\}/g;
                return template.replace(pattern, function (a, b) {
                    var p = b.split('.'),
                        r = values,
                        s;

                    try {
                        for (s in p) {
                            if (p.hasOwnProperty(s)) {
                                r = r[p[s]];
                            }
                        }
                    } catch (e) {
                        r = a;
                    }
                    return (typeof r === 'string' || typeof r === 'number') ? r : a;
                });
            },
            fakeNgModel: function () {
                return {
                    $fake: true,
                    $setTouched: angular.noop,
                    $setViewValue: function (value) {
                        this.$viewValue = value;
                        this.$render(value);
                        this.$viewChangeListeners.forEach(function (cb) {
                            cb();
                        });
                    },
                    $isEmpty: function (value) {
                        value = String(value);
                        return value.length === 0;
                    },
                    $parsers: [],
                    $formatters: [],
                    $viewChangeListeners: [],
                    $render: angular.noop
                };
            },
            debounce: function (func, wait, scope, invokeApply) {
                var timer;

                return function debounced() {
                    var context = scope,
                        args = Array.prototype.slice.call(arguments);

                    $timeout.cancel(timer);
                    timer = $timeout(function () {

                        timer = undefined;
                        func.apply(context, args);

                    }, wait || 10, invokeApply);
                };
            },
            throttle: function throttle(func, delay) {
                var recent;

                return function throttled() {
                    var context = this,
                        args = arguments,
                        now = $mdUtil.now();

                    if (!recent || (now - recent > delay)) {
                        func.apply(context, args);
                        recent = now;
                    }
                };
            },
            time: function time(cb) {
                var start = $mdUtil.now();

                cb();

                return $mdUtil.now() - start;
            },
            valueOnUse: function (scope, key, getter) {
                var value = null,
                    args = Array.prototype.slice.call(arguments),
                    params = (args.length > 3) ? args.slice(3) : [];

                Object.defineProperty(scope, key, {
                    get: function () {
                        if (value === null) { value = getter.apply(scope, params); }
                        return value;
                    }
                });
            },
            nextUid: function () {
                nextUniqueId += 1;

                return String(nextUniqueId);
            },
            // Stop watchers and events from firing on a scope without destroying it,
            // by disconnecting it from its parent and its siblings' linked lists.
            disconnectScope: function disconnectScope(scope) {
                if (!scope) { return; }

                // we can't destroy the root scope or a scope that has been already destroyed
                if (scope.$root === scope) { return; }
                if (scope.$$destroyed) { return; }

                var parent = scope.$parent;

                scope.$$disconnected = true;

                // See Scope.$destroy
                if (parent.$$childHead === scope) { parent.$$childHead = scope.$$nextSibling; }
                if (parent.$$childTail === scope) { parent.$$childTail = scope.$$prevSibling; }
                if (scope.$$prevSibling) { scope.$$prevSibling.$$nextSibling = scope.$$nextSibling; }
                if (scope.$$nextSibling) { scope.$$nextSibling.$$prevSibling = scope.$$prevSibling; }

                scope.$$nextSibling = scope.$$prevSibling = null;
            },
            iterator: MdIterator,
            prefixer: MdPrefixer,
            // Undo the effects of disconnectScope above.
            reconnectScope: function reconnectScope(scope) {
                if (!scope) { return; }

                // we can't disconnect the root node or scope already disconnected
                if (scope.$root === scope) { return; }
                if (!scope.$$disconnected) { return; }

                var child = scope,
                    parent = child.$parent;

                child.$$disconnected = false;
                // See Scope.$new for this logic...
                child.$$prevSibling = parent.$$childTail;
                if (parent.$$childHead) {
                    parent.$$childTail.$$nextSibling = child;
                    parent.$$childTail = child;
                } else {
                    parent.$$childHead = parent.$$childTail = child;
                }
            },
            getClosest: function getClosest(el, validateWith, onlyParent) {
                var tagName;

                if (angular.isString(validateWith)) {
                    tagName = validateWith.toUpperCase();
                    validateWith = function (el) {
                        return el.nodeName === tagName;
                    };
                }

                if (el instanceof angular.element) { el = el[0]; }
                if (onlyParent) { el = el.parentNode; }
                if (!el) { return null; }

                do {
                    if (validateWith(el)) {
                        return el;
                    }

                    // Now do the parent
                    el = el.parentNode;

                } while (el);

                return null;
            },
            elementContains: function (node, child) {
                var hasContains = (window.Node && window.Node.prototype && Node.prototype.contains),
                    findFn = hasContains ? angular.bind(node, node.contains) : angular.bind(node, function (arg) {
                    // compares the positions of two nodes and returns a bitmask
                    return (node === child) || !!(this.compareDocumentPosition(arg) & 16);
                });

                return findFn(child);
            },
            extractElementByName: function (element, nodeName, scanDeep, warnNotFound) {
                var found;

                function scanLevel(element) {
                    var i = 0,
                        len = 0;

                    if (element) {
                        for (i = 0, len = element.length; i < len; i += 1) {
                            if (element[i].nodeName.toLowerCase() === nodeName) {
                                return element[i];
                            }
                        }
                    }
                    return null;
                }

                function scanTree(element) {

                    function scanChildren(element_sC) {
                        var found_sC,
                            i = 0,
                            len = 0,
                            target,
                            j = 0,
                            numChild = 0;
    
                        if (element_sC) {
                            for (i = 0, len = element_sC.length; i < len; i += 1) {
                                target = element_sC[i];
    
                                if (!found_sC) {
                                    for (j = 0, numChild = target.childNodes.length; j < numChild; j += 1) {
                                        found_sC = found_sC || scanTree([target.childNodes[j]]);
                                    }
                                }
                            }
                        }
    
                        return found_sC;
                    }

                    return scanLevel(element) || (!!scanDeep ? scanChildren(element) : null);
                }

                found = scanTree(element);

                if (!found && !!warnNotFound) {
                    $log.warn($mdUtil.supplant("Unable to find node '{0}' in element '{1}'.", [nodeName, element[0].outerHTML]));
                }

                return angular.element(found || element);
            },
            initOptionalProperties: function (scope, attr, defaults) {
                defaults = defaults || {};
                angular.forEach(
                    scope.$$isolateBindings,
                    function (binding, key) {
                        var attrIsDefined;
                        if (binding.optional && angular.isUndefined(scope[key])) {
                            attrIsDefined = angular.isDefined(attr[binding.attrName]);
                            scope[key] = angular.isDefined(defaults[key]) ? defaults[key] : attrIsDefined;
                        }
                    }
                );
            },
            nextTick: function (callback, digest, scope) {
                //-- grab function reference for storing state details
                var nextTick = $mdUtil.nextTick,
                    timeout = nextTick.timeout,
                    queue = nextTick.queue || [];

                //-- add callback to the queue
                queue.push({
                    scope: scope,
                    callback: callback
                });

                //-- set default value for digest
                if (digest == null) { digest = true; }      // Leave as is, may need to coerce undefined

                //-- store updated digest/queue values
                nextTick.digest = nextTick.digest || digest;
                nextTick.queue = queue;

                function processQueue() {
                    var queue = nextTick.queue,
                        digest = nextTick.digest;

                    nextTick.queue = [];
                    nextTick.timeout = null;
                    nextTick.digest = false;

                    queue.forEach(function (queueItem) {
                        var skip = queueItem.scope && queueItem.scope.$$destroyed;

                        if (!skip) {
                            queueItem.callback();
                        }
                    });

                    if (digest) { $rootScope.$digest(); }
                }

                //-- either return existing timeout or create a new one
                if (timeout) { return timeout; }

                nextTick.timeout = $timeout(processQueue, 0, false);

                return nextTick.timeout;
            },
            processTemplate: function (template) {
                if (usesStandardSymbols) {
                    return template;
                }

                if (!template || !_.isString(template)) {
                    return template;
                }

                return template.replace(/\{\{/g, startSymbol).replace(/\}\}/g, endSymbol);
            },
            getParentWithPointerEvents: function (element) {
                var parent = element.parent();

                // jqLite might return a non-null, but still empty, parent; so check for parent and length
                while (hasComputedStyle(parent, 'pointer-events', 'none')) {
                    parent = parent.parent();
                }

                return parent;
            },
            getNearestContentElement: function (element) {
                var current = element.parent()[0];
                // Look for the nearest parent md-content, stopping at the rootElement.
                while (current && current !== $rootElement[0] && current !== document.body && current.nodeName.toUpperCase() !== 'MD-CONTENT') {
                    current = current.parentNode;
                }
                return current;
            },
            checkStickySupport: function () {
                var stickyProp,
                    testEl = angular.element('<div>'),
                    stickyProps = ['sticky', '-webkit-sticky'],
                    i = 0;

                $document[0].body.appendChild(testEl[0]);

                for (i = 0; i < stickyProps.length; i += 1) {
                    testEl.css({
                        position: stickyProps[i],
                        top: 0,
                        'z-index': 2
                    });

                    if (testEl.css('position') === stickyProps[i]) {
                        stickyProp = stickyProps[i];
                        break;
                    }
                }

                testEl.remove();

                return stickyProp;
            },
            parseAttributeBoolean: function(value, negatedCheck) {
                // very ambiguous, but heh...what can you do?
                return value === '' || !!value && (negatedCheck === false || value !== 'false' && value !== '0');   // Leave as is...
            },
            hasComputedStyle: hasComputedStyle,
            isParentFormSubmitted: function (element) {
                var parent = $mdUtil.getClosest(element, 'form'),
                    form = parent ? angular.element(parent).controller('form') : null;

                return form ? form.$submitted : false;
            },
            animateScrollTo: function (element, scrollEnd) {
                var scrollStart = element.scrollTop,
                    scrollChange = scrollEnd - scrollStart,
                    scrollingDown = scrollStart < scrollEnd,
                    startTime = $mdUtil.now();

                function ease(currentTime, start, change, duration) {
                    // If the duration has passed (which can occur if our app loses focus due to $$rAF), jump
                    // straight to the proper position
                    if (currentTime > duration) {
                        return start + change;
                    }

                    var ts = (currentTime /= duration) * currentTime,
                        tc = ts * currentTime;

                    return start + change * (-2 * tc + 3 * ts);
                }

                function calculateNewPosition() {
                    var duration = 1000,
                        currentTime = $mdUtil.now() - startTime;

                    return ease(currentTime, scrollStart, scrollChange, duration);
                }

                function scrollChunk() {
                    var newPosition = calculateNewPosition();

                    element.scrollTop = newPosition;

                    if (scrollingDown ? newPosition < scrollEnd : newPosition > scrollEnd) {
                        $$rAF(scrollChunk);
                    }
                }

                $$rAF(scrollChunk);
            }
        };

        return $mdUtil;
    }

    angular.element.prototype.focus = angular.element.prototype.focus || function () {
        if (this.length) {
            this[0].focus();
        }
        return this;
    };

    angular.element.prototype.blur = angular.element.prototype.blur || function () {
        if (this.length) {
            this[0].blur();
        }
        return this;
    };

    angular.module(
        'ng.material.v111.core',
        ['ng']
    ).factory(
        '$mdConstant',
        MdConstantFactory
    ).factory(
        '$mdUtil',
        ['$document', '$timeout', '$compile', '$rootScope', '$interpolate', '$log', '$rootElement', '$window', '$$rAF', UtilFactory]
    );


    mdCompilerService = function ($q, $templateRequest, $injector, $compile, $controller) {

        this.compile = function (options) {
            var templateUrl = options.templateUrl,
                template = options.template || '',
                controller = options.controller,
                controllerAs = options.controllerAs,
                resolve = angular.extend({}, options.resolve || {}),
                locals = angular.extend({}, options.locals || {}),
                transformTemplate = options.transformTemplate || angular.identity,
                bindToController = options.bindToController;

            // Take resolve values and invoke them.
            // Resolves can either be a string (value: 'MyRegisteredAngularConst'),
            // or an invokable 'factory' of sorts: (value: function ValueGetter($dependency) {})
            angular.forEach(resolve, function (value, key) {
                if (_.isString(value)) {
                    resolve[key] = $injector.get(value);
                } else {
                    resolve[key] = $injector.invoke(value);
                }
            });
            //Add the locals, which are just straight values to inject
            //eg locals: { three: 3 }, will inject three into the controller
            angular.extend(resolve, locals);

            if (templateUrl) {
                resolve.$template = $templateRequest(templateUrl)
                    .then(function (response) {
                        return response;
                    });
            } else {
                resolve.$template = $q.when($q.defer('ng_md_when_mdCompilerService'), template);
            }

            // Wait for all the resolves to finish if they are promises
            return $q.all($q.defer('ng_md_all_mdCompilerService'), resolve).then(function (locals) {

                var compiledData,
                    template = transformTemplate(locals.$template, options),
                    element = options.element || angular.element('<div>').html(template.trim()).contents(),
                    linkFn = $compile(element);

                // Return a linking function that can be used later when the element is ready
                compiledData = {
                    locals: locals,
                    element: element,
                    link: function link(scope) {

                        locals.$scope = scope;

                        var invokeCtrl,
                            ctrl;

                        //Instantiate controller if it exists, because we have scope
                        if (controller) {
                            invokeCtrl = $controller(controller, locals, true, controllerAs);

                            if (bindToController) {
                                angular.extend(invokeCtrl.instance, locals);
                            }

                            ctrl = invokeCtrl();

                            // See angular-route source for this logic
                            element.data('$ngControllerController', ctrl);
                            element.children().data('$ngControllerController', ctrl);

                            // Publish reference to this controller
                            compiledData.controller = ctrl;
                        }

                        return linkFn(scope);
                    }
                };

                return compiledData;
            });

        };
    };

    angular.module(
        'ng.material.v111.core'
    ).service(
        '$mdCompiler',
        ['$q', '$templateRequest', '$injector', '$compile', '$controller', mdCompilerService]
    );


    function InterimElementProvider() {

        function createInterimElementProvider(interimFactoryName) {
            var EXPOSED_METHODS = ['onHide', 'onShow', 'onRemove'],
                customMethods = {},
                providerConfig = {
                    presets: {}
                },
                provider;

            function setDefaults(definition) {
                providerConfig.optionsFactory = definition.options;
                providerConfig.methods = (definition.methods || []).concat(EXPOSED_METHODS);
                return provider;
            }

            function addMethod(name, fn) {
                customMethods[name] = fn;
                return provider;
            }

            function addPreset(name, definition) {
                definition = definition || {};
                definition.methods = definition.methods || [];
                definition.options = definition.options || function () {
                    return {};
                };

                if (/^cancel|hide|show$/.test(name)) {
                    throw new Error("Preset '" + name + "' in " + interimFactoryName + " is reserved!");
                }
                if (definition.methods.indexOf('_options') > -1) {
                    throw new Error("Method '_options' in " + interimFactoryName + " is reserved!");
                }
                providerConfig.presets[name] = {
                    methods: definition.methods.concat(EXPOSED_METHODS),
                    optionsFactory: definition.options,
                    argOption: definition.argOption
                };
                return provider;
            }

            function factory($$interimElement, $injector) {
                var defaultMethods,
                    defaultOptions,
                    interimElementService = $$interimElement(),
                    publicService;

                function showInterimElement(opts) {
                    // opts is either a preset which stores its options on an _options field,
                    // or just an object made up of options
                    opts = opts || {};

                    if (opts._options) { opts = opts._options; }

                    return interimElementService.show(
                        angular.extend({}, defaultOptions, opts)
                    );
                }

                function destroyInterimElement(opts) {
                    return interimElementService.destroy(opts);
                }

                publicService = {
                    hide: interimElementService.hide,
                    cancel: interimElementService.cancel,
                    show: showInterimElement,
                    destroy: destroyInterimElement
                };

                function invokeFactory(factory, defaultVal) {
                    var locals = {};

                    locals[interimFactoryName] = publicService;

                    return $injector.invoke(factory || function () {
                        return defaultVal;
                    }, {}, locals);
                }

                defaultMethods = providerConfig.methods || [];
                // This must be invoked after the publicService is initialized
                defaultOptions = invokeFactory(providerConfig.optionsFactory, {});

                // Copy over the simple custom methods
                angular.forEach(customMethods, function (fn, name) {
                    publicService[name] = fn;
                });

                angular.forEach(providerConfig.presets, function (definition, name) {
                    var presetDefaults = invokeFactory(definition.optionsFactory, {}),
                        presetMethods = (definition.methods || []).concat(defaultMethods),
                        methodName;

                    // Every interimElement built with a preset has a field called `$type`,
                    // which matches the name of the preset.
                    // Eg in preset 'confirm', options.$type === 'confirm'
                    angular.extend(
                        presetDefaults,
                        { $type: name }
                    );

                    function Preset(opts) {
                        this._options = angular.extend({}, presetDefaults, opts);
                    }

                    angular.forEach(presetMethods, function (name) {
                        Preset.prototype[name] = function (value) {
                            this._options[name] = value;
                            return this;
                        };
                    });

                    // Create shortcut method for one-linear methods
                    if (definition.argOption) {
                        methodName = 'show' + name.charAt(0).toUpperCase() + name.slice(1);

                        publicService[methodName] = function (arg) {
                            var config = publicService[name](arg);
                            return publicService.show(config);
                        };
                    }

                    // eg $mdDialog.alert() will return a new alert preset
                    publicService[name] = function (arg) {
                        if (arguments.length && definition.argOption &&
                            !angular.isObject(arg) && !angular.isArray(arg)) {

                            return (new Preset())[definition.argOption](arg);
                        }

                        return new Preset(arg);
                    };
                });

                return publicService;
            }

            provider = {
                setDefaults: setDefaults,
                addPreset: addPreset,
                addMethod: addMethod,
                $get: factory
            };

            provider.addPreset('build', {
                methods: ['controller', 'controllerAs', 'resolve',
                    'template', 'templateUrl', 'themable', 'transformTemplate', 'parent'
                ]
            });

            factory.$inject = ["$$interimElement", "$injector"];

            return provider;
        }

                                    // $document, $q, $$q, $rootScope, $timeout, $rootElement, $animate, $mdUtil, $mdCompiler, $mdTheming, $injector
        function InterimElementFactory($document, $q, $$q, $rootScope, $timeout, $rootElement, $animate, $mdUtil, $mdCompiler, $injector) {

            return function createInterimElementService() {
                var SHOW_CANCELLED = false,
                    service,
                    stack = [];

                function hide(reason, options) {
                    var promise,
                        interim;

                    if (!stack.length) {
                        return $q.when($q.defer('ng_md_when_hide'), reason);
                    }

                    options = options || {};

                    function closeElement(interim) {
                        interim.remove(reason, false, options || {})['catch'](
                            function (reason) {
                                //$log.error("InterimElement.hide() error: " + reason );
                                return reason;
                            }
                        );

                        return interim.deferred.promise;
                    }

                    if (options.closeAll) {
                        promise = $q.all($q.defer('ng_md_all_hide_closeAll'), stack.reverse().map(closeElement));
                        stack = [];
                        return promise;
                    }

                    if (options.closeTo !== undefined) {
                        return $q.all($q.defer('ng_md_all_hide_closeTo'), stack.splice(options.closeTo).map(closeElement));
                    }

                    interim = stack.pop();
                    return closeElement(interim);
                }

                function cancel(reason, options) {
                    var interim = stack.pop();

                    if (!interim) {
                        return $q.when($q.defer('ng_md_when cancel'), reason);
                    }

                    interim.remove(reason, true, options || {})['catch'](
                        function (reason) {
                            //$log.error("InterimElement.cancel() error: " + reason );
                            return reason;
                        }
                    );

                    return interim.deferred.promise['catch'](angular.noop);
                }

                function destroy(target) {
                    var interim = !target ? stack.shift() : null,
                        cntr = angular.element(target).length ? angular.element(target)[0].parentNode : null,
                        filtered;

                    if (cntr) {
                        // Try to find the interim element in the stack which corresponds to the supplied DOM element.
                        filtered = stack.filter(function (entry) {
                            var currNode = entry.options.element[0];
                            return (currNode === cntr);
                        });

                        // Note: this function might be called when the element already has been removed, in which
                        //       case we won't find any matches. That's ok.
                        if (filtered.length > 0) {
                            interim = filtered[0];
                            stack.splice(stack.indexOf(interim), 1);
                        }
                    }

                    return interim ? interim.remove(SHOW_CANCELLED, false, {
                        '$destroy': true
                    }) : $q.when($q.defer('ng_md_when_destroy'), SHOW_CANCELLED);
                }

                function InterimElement(options) {
                    var self,
                        element,
                        showAction = $q.when($q.defer('ng_md_when_InterimElement'), true);

                    function configureScopeAndTransitions(options) {
                        options = options || {};
                        if (options.template) {
                            options.template = $mdUtil.processTemplate(options.template);
                        }

                        return angular.extend({
                            preserveScope: false,
                            cancelAutoHide: angular.noop,
                            scope: options.scope || $rootScope.$new(options.isolateScope),

                            /**
                             * Default usage to enable $animate to transition-in; can be easily overridden via 'options'
                             */
                            onShow: function transitionIn(scope_na, element, options) {
                                return $animate.enter(element, options.parent);
                            },

                            /**
                             * Default usage to enable $animate to transition-out; can be easily overridden via 'options'
                             */
                            onRemove: function transitionOut(scope_na, element) {
                                // Element could be undefined if a new element is shown before
                                // the old one finishes compiling.
                                return element && ($animate.leave(element) || $q.when($q.defer('ng_md_when_configureScopeAndTransitions_onRemove')));
                            }
                        }, options);
                    }

                    options = configureScopeAndTransitions(options);

                    function hideElement(element, options) {
                        var announceRemoving = options.onRemoving || angular.noop;

                        return $$q(function (resolve, reject) {
                            try {
                                // Start transitionIn
                                var action = $$q.when($$q.defer('ng_md_when_hideElement_transIn'), options.onRemove(options.scope, element, options) || true);

                                // Trigger callback *before* the remove operation starts
                                announceRemoving(element, action);

                                if (options.$destroy === true) {

                                    // For $destroy, onRemove should be synchronous
                                    resolve(element);

                                } else {

                                    // Wait until transition-out is done
                                    action.then(function () {

                                        if (!options.preserveScope && options.scope) {
                                            options.scope.$destroy();
                                        }

                                        resolve(element);

                                    }, reject);
                                }

                            } catch (e) {
                                reject(e);
                            }
                        }, 'ng_md_rr_hideElement');
                    }

                    function transitionOutAndRemove(response, isCancelled, opts) {

                        // abort if the show() and compile failed
                        if (!element) {
                            return $q.when($q.defer('ng_md_when_transitionOutAndRemove_fail'), false);
                        }

                        options = angular.extend(options || {}, opts || {});

                        if (options.cancelAutoHide
                         && _.isFunction(options.cancelAutoHide)
                         && options.cancelAutoHide !== angular.noop) {
                            options.cancelAutoHide();
                        }

                        options.element.triggerHandler('$mdInterimElementRemove');

                        function resolveAll(response) {
                            self.deferred.resolve(response);
                        }

                        function rejectAll(fault) {
                            self.deferred.reject(fault);
                        }

                        if (options.$destroy === true) {

                            return hideElement(options.element, options).then(
                                function () {
                                    if (isCancelled) {
                                        rejectAll(response);
                                    } else {
                                        resolveAll(response);
                                    }
                                }
                            );

                        }

                        $q.when($q.defer('ng_md_when_transitionOutAndRemove'), showAction)['finally'](
                            function () {
                                hideElement(options.element, options).then(
                                    function () {
                                        if (isCancelled) {
                                            rejectAll(response);
                                        } else {
                                            resolveAll(response);
                                        }
                                    },
                                    rejectAll
                                );
                            }
                        );

                        return self.deferred.promise;
                    }

                    function compileElement(options) {

                        var compiled = !options.skipCompile ? $mdCompiler.compile(options) : null;

                        return compiled || $q(function (resolve) {
                            resolve({
                                locals: {},
                                link: function () {
                                    return options.element;
                                }
                            });
                        }, 'ng_md_rr_compileElement');
                    }

                    function findParent(element, options) {
                        var parent = options.parent,
                            el;

                        // Search for parent at insertion time, if not specified
                        if (angular.isFunction(parent)) {
                            parent = parent(options.scope, element, options);
                        } else if (angular.isString(parent)) {
                            parent = angular.element($document[0].querySelector(parent));
                        } else {
                            parent = angular.element(parent);
                        }

                        // If parent querySelector/getter function fails, or it's just null,
                        // find a default.
                        if (!(parent || {}).length) {

                            if ($rootElement[0] && $rootElement[0].querySelector) {
                                el = $rootElement[0].querySelector(':not(svg) > body');
                            }

                            if (!el) { el = $rootElement[0]; }

                            if (el.nodeName === '#comment') {
                                el = $document[0].body;
                            }

                            return angular.element(el);
                        }

                        return parent;
                    }

                    function linkElement(compileData, options) {
                        angular.extend(compileData.locals, options);

                        var element = compileData.link(options.scope);

                        // Search for parent at insertion time, if not specified
                        options.element = element;
                        options.parent = findParent(element, options);

                        if (options.themable) {
                            msos.console.warn('ng.material.v111.core - InterimElementFactory - linkElement -> need to add theming to:', element);
                            // $mdTheming(element);
                        }

                        return element;
                    }

                    function startAutoHide() {
                        var autoHideTimer, cancelAutoHide = angular.noop;

                        if (options.hideDelay) {
                            autoHideTimer = $timeout(service.hide, options.hideDelay);
                            cancelAutoHide = function () {
                                $timeout.cancel(autoHideTimer);
                            };
                        }

                        // Cache for subsequent use
                        options.cancelAutoHide = function () {
                            cancelAutoHide();
                            options.cancelAutoHide = undefined;
                        };
                    }

                    function showElement(element, options, controller) {
                        var notifyShowing = options.onShowing || angular.noop,
                            notifyComplete = options.onComplete || angular.noop;

                        notifyShowing(options.scope, element, options, controller);

                        return $q(function (resolve, reject) {
                            try {
                                // Start transitionIn
                                $q.when($q.defer('ng_md_when_showElement_transIn'), options.onShow(options.scope, element, options, controller))
                                    .then(function () {
                                        notifyComplete(options.scope, element, options);
                                        startAutoHide();

                                        resolve(element);

                                    }, reject);

                            } catch (e) {
                                reject(e.message);
                            }
                        }, 'ng_md_rr_showElement');
                    }

                    function createAndTransitionIn() {
                        return $q(function (resolve, reject) {

                            if (options.onCompiling && _.isFunction(options.onCompiling)) {
                                options.onCompiling(options);
                            }

                            function rejectAll(fault) {
                                // Force the '$md<xxx>.show()' promise to reject
                                self.deferred.reject(fault);

                                // Continue rejection propagation
                                reject(fault);
                            }

                            compileElement(
                                options
                            ).then(
                                function (compiledData) {
                                    element = linkElement(compiledData, options);

                                    showAction = showElement(element, options, compiledData.controller)
                                        .then(resolve, rejectAll);

                                },
                                rejectAll
                            );
                        },
                        'ng_md_rr_createAndTransitionIn');
                    }

                    self = {
                        options: options,
                        deferred: $q.defer('ng_md_def_InterimElement'),
                        show: createAndTransitionIn,
                        remove: transitionOutAndRemove
                    };

                    return self;
                }

                function show(options) {
                    options = options || {};

                    var interimElement = new InterimElement(options || {}),
                        hideExisting = !options.skipHide && stack.length ? service.cancel() : $q.when($q.defer('ng_md_when_show'), true);

                    // This hide()s only the current interim element before showing the next, new one
                    // NOTE: this is not reversible (e.g. interim elements are not stackable)

                    hideExisting['finally'](function () {

                        stack.push(interimElement);
                        interimElement.show()['catch'](
                            function (reason) {
                                //$log.error("InterimElement.show() error: " + reason );
                                return reason;
                            }
                        );
                    });

                    // Return a promise that will be resolved when the interim
                    // element is hidden or cancelled...

                    return interimElement.deferred.promise;
                }

                service = {
                    show: show,
                    hide: hide,
                    cancel: cancel,
                    destroy: destroy,
                    $injector_: $injector
                };

                return service;
            };
        }

        InterimElementFactory.$inject = ["$document", "$q", "$$q", "$rootScope", "$timeout", "$rootElement", "$animate", "$mdUtil", "$mdCompiler", "$mdTheming", "$injector"];

        createInterimElementProvider.$get = InterimElementFactory;

        return createInterimElementProvider;
    }

    angular.module(
        'ng.material.v111.core'
    ).provider(
        '$$interimElement',
        InterimElementProvider
    );


    function ComponentRegistry($log, $q) {

        var self,
            instances = [],
            pendings = {};

        function isValidID(handle) {
            return handle && (handle !== "");
        }

        self = {

            notFoundError: function (handle, msgContext) {
                $log.error((msgContext || "") + 'No instance found for handle', handle);
            },

            getInstances: function () {
                return instances;
            },

            get: function (handle) {

                if (!isValidID(handle)) { return null; }

                var i,
                    j,
                    instance;

                for (i = 0, j = instances.length; i < j; i += 1) {
                    instance = instances[i];

                    if (instance.$$mdHandle === handle) {
                        return instance;
                    }
                }

                return null;
            },

            register: function (instance, handle) {

                if (!handle) { return angular.noop; }

                function resolveWhen() {
                    var dfd = pendings[handle];

                    if (dfd) {
                        dfd.forEach(function (promise) {
                            promise.resolve(instance);
                        });

                        delete pendings[handle];
                    }
                }

                instance.$$mdHandle = handle;
                instances.push(instance);
                resolveWhen();

                function deregister() {
                    var index = instances.indexOf(instance);

                    if (index !== -1) {
                        instances.splice(index, 1);
                    }
                }

                return deregister;
            },

            /**
             * Async accessor to registered component instance
             * If not available then a promise is created to notify
             * all listeners when the instance is registered.
             */
            when: function (handle) {
                if (isValidID(handle)) {
                    var deferred = $q.defer('ng_md_defer_ComponentRegistry'),
                        instance = self.get(handle);

                    if (instance) {
                        deferred.resolve(instance);
                    } else {
                        if (pendings[handle] === undefined) {
                            pendings[handle] = [];
                        }
                        pendings[handle].push(deferred);
                    }

                    return deferred.promise;
                }
                return $q.reject($q.defer('ng_md_reject_ComponentRegistry'), "Invalid `md-component-id` value.");
            }
        };

        return self;
    }

    function MdAutofocusDirective() {

        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var attr = attrs.mdAutoFocus || attrs.mdAutofocus || attrs.mdSidenavFocus;

                // Setup a watcher on the proper attribute to update a class we can check for in $mdUtil
                scope.$watch(attr, function (canAutofocus) {
                    element.toggleClass('md-autofocus', canAutofocus);
                });
            }
        };
    }

    function DetectNgTouch($log, $injector) {
        if ($injector.has('$swipe')) {
            var msg =   "You are using the ngTouch module. \n" +
                        "Angular Material already has mobile click, tap, and swipe support... \n" +
                        "ngTouch is not supported with Angular Material!";
            $log.warn(msg);
        }
    }


    angular.module(
        'ng.material.v111.core',
        [
            "ng",
            "ng.material.v111.core.theming"
        ]
    ).factory(
        '$mdComponentRegistry',
        ['$log', '$q', ComponentRegistry]
    ).constant(
        "$MD_THEME_CSS",
        "md-autocomplete.md-THEME_NAME-theme {  background: '{{background-A100}}'; }  md-autocomplete.md-THEME_NAME-theme[disabled]:not([md-floating-label]) {    background: '{{background-100}}'; }  md-autocomplete.md-THEME_NAME-theme button md-icon path {    fill: '{{background-600}}'; }  md-autocomplete.md-THEME_NAME-theme button:after {    background: '{{background-600-0.3}}'; }.md-autocomplete-suggestions-container.md-THEME_NAME-theme {  background: '{{background-A100}}'; }  .md-autocomplete-suggestions-container.md-THEME_NAME-theme li {    color: '{{background-900}}'; }    .md-autocomplete-suggestions-container.md-THEME_NAME-theme li .highlight {      color: '{{background-600}}'; }    .md-autocomplete-suggestions-container.md-THEME_NAME-theme li:hover, .md-autocomplete-suggestions-container.md-THEME_NAME-theme li.selected {      background: '{{background-200}}'; }md-backdrop {  background-color: '{{background-900-0.0}}'; }  md-backdrop.md-opaque.md-THEME_NAME-theme {    background-color: '{{background-900-1.0}}'; }md-bottom-sheet.md-THEME_NAME-theme {  background-color: '{{background-50}}';  border-top-color: '{{background-300}}'; }  md-bottom-sheet.md-THEME_NAME-theme.md-list md-list-item {    color: '{{foreground-1}}'; }  md-bottom-sheet.md-THEME_NAME-theme .md-subheader {    background-color: '{{background-50}}'; }  md-bottom-sheet.md-THEME_NAME-theme .md-subheader {    color: '{{foreground-1}}'; }.md-button.md-THEME_NAME-theme:not([disabled]):hover {  background-color: '{{background-500-0.2}}'; }.md-button.md-THEME_NAME-theme:not([disabled]).md-focused {  background-color: '{{background-500-0.2}}'; }.md-button.md-THEME_NAME-theme:not([disabled]).md-icon-button:hover {  background-color: transparent; }.md-button.md-THEME_NAME-theme.md-fab {  background-color: '{{accent-color}}';  color: '{{accent-contrast}}'; }  .md-button.md-THEME_NAME-theme.md-fab md-icon {    color: '{{accent-contrast}}'; }  .md-button.md-THEME_NAME-theme.md-fab:not([disabled]):hover {    background-color: '{{accent-A700}}'; }  .md-button.md-THEME_NAME-theme.md-fab:not([disabled]).md-focused {    background-color: '{{accent-A700}}'; }.md-button.md-THEME_NAME-theme.md-primary {  color: '{{primary-color}}'; }  .md-button.md-THEME_NAME-theme.md-primary.md-raised, .md-button.md-THEME_NAME-theme.md-primary.md-fab {    color: '{{primary-contrast}}';    background-color: '{{primary-color}}'; }    .md-button.md-THEME_NAME-theme.md-primary.md-raised:not([disabled]) md-icon, .md-button.md-THEME_NAME-theme.md-primary.md-fab:not([disabled]) md-icon {      color: '{{primary-contrast}}'; }    .md-button.md-THEME_NAME-theme.md-primary.md-raised:not([disabled]):hover, .md-button.md-THEME_NAME-theme.md-primary.md-fab:not([disabled]):hover {      background-color: '{{primary-600}}'; }    .md-button.md-THEME_NAME-theme.md-primary.md-raised:not([disabled]).md-focused, .md-button.md-THEME_NAME-theme.md-primary.md-fab:not([disabled]).md-focused {      background-color: '{{primary-600}}'; }  .md-button.md-THEME_NAME-theme.md-primary:not([disabled]) md-icon {    color: '{{primary-color}}'; }.md-button.md-THEME_NAME-theme.md-fab {  background-color: '{{accent-color}}';  color: '{{accent-contrast}}'; }  .md-button.md-THEME_NAME-theme.md-fab:not([disabled]) .md-icon {    color: '{{accent-contrast}}'; }  .md-button.md-THEME_NAME-theme.md-fab:not([disabled]):hover {    background-color: '{{accent-A700}}'; }  .md-button.md-THEME_NAME-theme.md-fab:not([disabled]).md-focused {    background-color: '{{accent-A700}}'; }.md-button.md-THEME_NAME-theme.md-raised {  color: '{{background-900}}';  background-color: '{{background-50}}'; }  .md-button.md-THEME_NAME-theme.md-raised:not([disabled]) md-icon {    color: '{{background-900}}'; }  .md-button.md-THEME_NAME-theme.md-raised:not([disabled]):hover {    background-color: '{{background-50}}'; }  .md-button.md-THEME_NAME-theme.md-raised:not([disabled]).md-focused {    background-color: '{{background-200}}'; }.md-button.md-THEME_NAME-theme.md-warn {  color: '{{warn-color}}'; }  .md-button.md-THEME_NAME-theme.md-warn.md-raised, .md-button.md-THEME_NAME-theme.md-warn.md-fab {    color: '{{warn-contrast}}';    background-color: '{{warn-color}}'; }    .md-button.md-THEME_NAME-theme.md-warn.md-raised:not([disabled]) md-icon, .md-button.md-THEME_NAME-theme.md-warn.md-fab:not([disabled]) md-icon {      color: '{{warn-contrast}}'; }    .md-button.md-THEME_NAME-theme.md-warn.md-raised:not([disabled]):hover, .md-button.md-THEME_NAME-theme.md-warn.md-fab:not([disabled]):hover {      background-color: '{{warn-600}}'; }    .md-button.md-THEME_NAME-theme.md-warn.md-raised:not([disabled]).md-focused, .md-button.md-THEME_NAME-theme.md-warn.md-fab:not([disabled]).md-focused {      background-color: '{{warn-600}}'; }  .md-button.md-THEME_NAME-theme.md-warn:not([disabled]) md-icon {    color: '{{warn-color}}'; }.md-button.md-THEME_NAME-theme.md-accent {  color: '{{accent-color}}'; }  .md-button.md-THEME_NAME-theme.md-accent.md-raised, .md-button.md-THEME_NAME-theme.md-accent.md-fab {    color: '{{accent-contrast}}';    background-color: '{{accent-color}}'; }    .md-button.md-THEME_NAME-theme.md-accent.md-raised:not([disabled]) md-icon, .md-button.md-THEME_NAME-theme.md-accent.md-fab:not([disabled]) md-icon {      color: '{{accent-contrast}}'; }    .md-button.md-THEME_NAME-theme.md-accent.md-raised:not([disabled]):hover, .md-button.md-THEME_NAME-theme.md-accent.md-fab:not([disabled]):hover {      background-color: '{{accent-A700}}'; }    .md-button.md-THEME_NAME-theme.md-accent.md-raised:not([disabled]).md-focused, .md-button.md-THEME_NAME-theme.md-accent.md-fab:not([disabled]).md-focused {      background-color: '{{accent-A700}}'; }  .md-button.md-THEME_NAME-theme.md-accent:not([disabled]) md-icon {    color: '{{accent-color}}'; }.md-button.md-THEME_NAME-theme[disabled], .md-button.md-THEME_NAME-theme.md-raised[disabled], .md-button.md-THEME_NAME-theme.md-fab[disabled], .md-button.md-THEME_NAME-theme.md-accent[disabled], .md-button.md-THEME_NAME-theme.md-warn[disabled] {  color: '{{foreground-3}}';  cursor: default; }  .md-button.md-THEME_NAME-theme[disabled] md-icon, .md-button.md-THEME_NAME-theme.md-raised[disabled] md-icon, .md-button.md-THEME_NAME-theme.md-fab[disabled] md-icon, .md-button.md-THEME_NAME-theme.md-accent[disabled] md-icon, .md-button.md-THEME_NAME-theme.md-warn[disabled] md-icon {    color: '{{foreground-3}}'; }.md-button.md-THEME_NAME-theme.md-raised[disabled], .md-button.md-THEME_NAME-theme.md-fab[disabled] {  background-color: '{{foreground-4}}'; }.md-button.md-THEME_NAME-theme[disabled] {  background-color: transparent; }._md a.md-THEME_NAME-theme:not(.md-button).md-primary {  color: '{{primary-color}}'; }  ._md a.md-THEME_NAME-theme:not(.md-button).md-primary:hover {    color: '{{primary-700}}'; }._md a.md-THEME_NAME-theme:not(.md-button).md-accent {  color: '{{accent-color}}'; }  ._md a.md-THEME_NAME-theme:not(.md-button).md-accent:hover {    color: '{{accent-700}}'; }._md a.md-THEME_NAME-theme:not(.md-button).md-accent {  color: '{{accent-color}}'; }  ._md a.md-THEME_NAME-theme:not(.md-button).md-accent:hover {    color: '{{accent-A700}}'; }._md a.md-THEME_NAME-theme:not(.md-button).md-warn {  color: '{{warn-color}}'; }  ._md a.md-THEME_NAME-theme:not(.md-button).md-warn:hover {    color: '{{warn-700}}'; }md-card.md-THEME_NAME-theme {  color: '{{foreground-1}}';  background-color: '{{background-hue-1}}';  border-radius: 2px; }  md-card.md-THEME_NAME-theme .md-card-image {    border-radius: 2px 2px 0 0; }  md-card.md-THEME_NAME-theme md-card-header md-card-avatar md-icon {    color: '{{background-color}}';    background-color: '{{foreground-3}}'; }  md-card.md-THEME_NAME-theme md-card-header md-card-header-text .md-subhead {    color: '{{foreground-2}}'; }  md-card.md-THEME_NAME-theme md-card-title md-card-title-text:not(:only-child) .md-subhead {    color: '{{foreground-2}}'; }md-checkbox.md-THEME_NAME-theme .md-ripple {  color: '{{accent-A700}}'; }md-checkbox.md-THEME_NAME-theme.md-checked .md-ripple {  color: '{{background-600}}'; }md-checkbox.md-THEME_NAME-theme.md-checked.md-focused .md-container:before {  background-color: '{{accent-color-0.26}}'; }md-checkbox.md-THEME_NAME-theme .md-ink-ripple {  color: '{{foreground-2}}'; }md-checkbox.md-THEME_NAME-theme.md-checked .md-ink-ripple {  color: '{{accent-color-0.87}}'; }md-checkbox.md-THEME_NAME-theme:not(.md-checked) .md-icon {  border-color: '{{foreground-2}}'; }md-checkbox.md-THEME_NAME-theme.md-checked .md-icon {  background-color: '{{accent-color-0.87}}'; }md-checkbox.md-THEME_NAME-theme.md-checked .md-icon:after {  border-color: '{{accent-contrast-0.87}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary .md-ripple {  color: '{{primary-600}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-ripple {  color: '{{background-600}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary .md-ink-ripple {  color: '{{foreground-2}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-ink-ripple {  color: '{{primary-color-0.87}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary:not(.md-checked) .md-icon {  border-color: '{{foreground-2}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-icon {  background-color: '{{primary-color-0.87}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked.md-focused .md-container:before {  background-color: '{{primary-color-0.26}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-icon:after {  border-color: '{{primary-contrast-0.87}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary .md-indeterminate[disabled] .md-container {  color: '{{foreground-3}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn .md-ripple {  color: '{{warn-600}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn .md-ink-ripple {  color: '{{foreground-2}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked .md-ink-ripple {  color: '{{warn-color-0.87}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn:not(.md-checked) .md-icon {  border-color: '{{foreground-2}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked .md-icon {  background-color: '{{warn-color-0.87}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked.md-focused:not([disabled]) .md-container:before {  background-color: '{{warn-color-0.26}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked .md-icon:after {  border-color: '{{background-200}}'; }md-checkbox.md-THEME_NAME-theme[disabled]:not(.md-checked) .md-icon {  border-color: '{{foreground-3}}'; }md-checkbox.md-THEME_NAME-theme[disabled].md-checked .md-icon {  background-color: '{{foreground-3}}'; }md-checkbox.md-THEME_NAME-theme[disabled].md-checked .md-icon:after {  border-color: '{{background-200}}'; }md-checkbox.md-THEME_NAME-theme[disabled] .md-icon:after {  border-color: '{{foreground-3}}'; }md-checkbox.md-THEME_NAME-theme[disabled] .md-label {  color: '{{foreground-3}}'; }md-chips.md-THEME_NAME-theme .md-chips {  box-shadow: 0 1px '{{foreground-4}}'; }  md-chips.md-THEME_NAME-theme .md-chips.md-focused {    box-shadow: 0 2px '{{primary-color}}'; }  md-chips.md-THEME_NAME-theme .md-chips .md-chip-input-container input {    color: '{{foreground-1}}'; }    md-chips.md-THEME_NAME-theme .md-chips .md-chip-input-container input::-webkit-input-placeholder {      color: '{{foreground-3}}'; }    md-chips.md-THEME_NAME-theme .md-chips .md-chip-input-container input:-moz-placeholder {      color: '{{foreground-3}}'; }    md-chips.md-THEME_NAME-theme .md-chips .md-chip-input-container input::-moz-placeholder {      color: '{{foreground-3}}'; }    md-chips.md-THEME_NAME-theme .md-chips .md-chip-input-container input:-ms-input-placeholder {      color: '{{foreground-3}}'; }    md-chips.md-THEME_NAME-theme .md-chips .md-chip-input-container input::-webkit-input-placeholder {      color: '{{foreground-3}}'; }md-chips.md-THEME_NAME-theme md-chip {  background: '{{background-300}}';  color: '{{background-800}}'; }  md-chips.md-THEME_NAME-theme md-chip md-icon {    color: '{{background-700}}'; }  md-chips.md-THEME_NAME-theme md-chip.md-focused {    background: '{{primary-color}}';    color: '{{primary-contrast}}'; }    md-chips.md-THEME_NAME-theme md-chip.md-focused md-icon {      color: '{{primary-contrast}}'; }  md-chips.md-THEME_NAME-theme md-chip._md-chip-editing {    background: transparent;    color: '{{background-800}}'; }md-chips.md-THEME_NAME-theme md-chip-remove .md-button md-icon path {  fill: '{{background-500}}'; }.md-contact-suggestion span.md-contact-email {  color: '{{background-400}}'; }md-content.md-THEME_NAME-theme {  color: '{{foreground-1}}';  background-color: '{{background-default}}'; }/** Theme styles for mdCalendar. */.md-calendar.md-THEME_NAME-theme {  background: '{{background-A100}}';  color: '{{background-A200-0.87}}'; }  .md-calendar.md-THEME_NAME-theme tr:last-child td {    border-bottom-color: '{{background-200}}'; }.md-THEME_NAME-theme .md-calendar-day-header {  background: '{{background-300}}';  color: '{{background-A200-0.87}}'; }.md-THEME_NAME-theme .md-calendar-date.md-calendar-date-today .md-calendar-date-selection-indicator {  border: 1px solid '{{primary-500}}'; }.md-THEME_NAME-theme .md-calendar-date.md-calendar-date-today.md-calendar-date-disabled {  color: '{{primary-500-0.6}}'; }.md-calendar-date.md-focus .md-THEME_NAME-theme .md-calendar-date-selection-indicator, .md-THEME_NAME-theme .md-calendar-date-selection-indicator:hover {  background: '{{background-300}}'; }.md-THEME_NAME-theme .md-calendar-date.md-calendar-selected-date .md-calendar-date-selection-indicator,.md-THEME_NAME-theme .md-calendar-date.md-focus.md-calendar-selected-date .md-calendar-date-selection-indicator {  background: '{{primary-500}}';  color: '{{primary-500-contrast}}';  border-color: transparent; }.md-THEME_NAME-theme .md-calendar-date-disabled,.md-THEME_NAME-theme .md-calendar-month-label-disabled {  color: '{{background-A200-0.435}}'; }/** Theme styles for mdDatepicker. */.md-THEME_NAME-theme .md-datepicker-input {  color: '{{foreground-1}}'; }  .md-THEME_NAME-theme .md-datepicker-input::-webkit-input-placeholder {    color: '{{foreground-3}}'; }  .md-THEME_NAME-theme .md-datepicker-input:-moz-placeholder {    color: '{{foreground-3}}'; }  .md-THEME_NAME-theme .md-datepicker-input::-moz-placeholder {    color: '{{foreground-3}}'; }  .md-THEME_NAME-theme .md-datepicker-input:-ms-input-placeholder {    color: '{{foreground-3}}'; }  .md-THEME_NAME-theme .md-datepicker-input::-webkit-input-placeholder {    color: '{{foreground-3}}'; }.md-THEME_NAME-theme .md-datepicker-input-container {  border-bottom-color: '{{foreground-4}}'; }  .md-THEME_NAME-theme .md-datepicker-input-container.md-datepicker-focused {    border-bottom-color: '{{primary-color}}'; }    .md-accent .md-THEME_NAME-theme .md-datepicker-input-container.md-datepicker-focused {      border-bottom-color: '{{accent-color}}'; }    .md-warn .md-THEME_NAME-theme .md-datepicker-input-container.md-datepicker-focused {      border-bottom-color: '{{warn-A700}}'; }  .md-THEME_NAME-theme .md-datepicker-input-container.md-datepicker-invalid {    border-bottom-color: '{{warn-A700}}'; }.md-THEME_NAME-theme .md-datepicker-calendar-pane {  border-color: '{{background-hue-1}}'; }.md-THEME_NAME-theme .md-datepicker-triangle-button .md-datepicker-expand-triangle {  border-top-color: '{{foreground-3}}'; }.md-THEME_NAME-theme .md-datepicker-triangle-button:hover .md-datepicker-expand-triangle {  border-top-color: '{{foreground-2}}'; }.md-THEME_NAME-theme .md-datepicker-open .md-datepicker-calendar-icon {  color: '{{primary-color}}'; }.md-THEME_NAME-theme .md-datepicker-open.md-accent .md-datepicker-calendar-icon, .md-accent .md-THEME_NAME-theme .md-datepicker-open .md-datepicker-calendar-icon {  color: '{{accent-color}}'; }.md-THEME_NAME-theme .md-datepicker-open.md-warn .md-datepicker-calendar-icon, .md-warn .md-THEME_NAME-theme .md-datepicker-open .md-datepicker-calendar-icon {  color: '{{warn-A700}}'; }.md-THEME_NAME-theme .md-datepicker-open .md-datepicker-input-container,.md-THEME_NAME-theme .md-datepicker-input-mask-opaque {  background: '{{background-hue-1}}'; }.md-THEME_NAME-theme .md-datepicker-calendar {  background: '{{background-A100}}'; }md-dialog.md-THEME_NAME-theme {  border-radius: 4px;  background-color: '{{background-hue-1}}';  color: '{{foreground-1}}'; }  md-dialog.md-THEME_NAME-theme.md-content-overflow .md-actions, md-dialog.md-THEME_NAME-theme.md-content-overflow md-dialog-actions {    border-top-color: '{{foreground-4}}'; }md-divider.md-THEME_NAME-theme {  border-top-color: '{{foreground-4}}'; }.layout-row > md-divider.md-THEME_NAME-theme,.layout-xs-row > md-divider.md-THEME_NAME-theme, .layout-gt-xs-row > md-divider.md-THEME_NAME-theme,.layout-sm-row > md-divider.md-THEME_NAME-theme, .layout-gt-sm-row > md-divider.md-THEME_NAME-theme,.layout-md-row > md-divider.md-THEME_NAME-theme, .layout-gt-md-row > md-divider.md-THEME_NAME-theme,.layout-lg-row > md-divider.md-THEME_NAME-theme, .layout-gt-lg-row > md-divider.md-THEME_NAME-theme,.layout-xl-row > md-divider.md-THEME_NAME-theme {  border-right-color: '{{foreground-4}}'; }md-icon.md-THEME_NAME-theme {  color: '{{foreground-2}}'; }  md-icon.md-THEME_NAME-theme.md-primary {    color: '{{primary-color}}'; }  md-icon.md-THEME_NAME-theme.md-accent {    color: '{{accent-color}}'; }  md-icon.md-THEME_NAME-theme.md-warn {    color: '{{warn-color}}'; }md-input-container.md-THEME_NAME-theme .md-input {  color: '{{foreground-1}}';  border-color: '{{foreground-4}}'; }  md-input-container.md-THEME_NAME-theme .md-input::-webkit-input-placeholder {    color: '{{foreground-3}}'; }  md-input-container.md-THEME_NAME-theme .md-input:-moz-placeholder {    color: '{{foreground-3}}'; }  md-input-container.md-THEME_NAME-theme .md-input::-moz-placeholder {    color: '{{foreground-3}}'; }  md-input-container.md-THEME_NAME-theme .md-input:-ms-input-placeholder {    color: '{{foreground-3}}'; }  md-input-container.md-THEME_NAME-theme .md-input::-webkit-input-placeholder {    color: '{{foreground-3}}'; }md-input-container.md-THEME_NAME-theme > md-icon {  color: '{{foreground-1}}'; }md-input-container.md-THEME_NAME-theme label,md-input-container.md-THEME_NAME-theme .md-placeholder {  color: '{{foreground-3}}'; }md-input-container.md-THEME_NAME-theme label.md-required:after {  color: '{{warn-A700}}'; }md-input-container.md-THEME_NAME-theme:not(.md-input-focused):not(.md-input-invalid) label.md-required:after {  color: '{{foreground-2}}'; }md-input-container.md-THEME_NAME-theme .md-input-messages-animation, md-input-container.md-THEME_NAME-theme .md-input-message-animation {  color: '{{warn-A700}}'; }  md-input-container.md-THEME_NAME-theme .md-input-messages-animation .md-char-counter, md-input-container.md-THEME_NAME-theme .md-input-message-animation .md-char-counter {    color: '{{foreground-1}}'; }md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-has-value label {  color: '{{foreground-2}}'; }md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused .md-input, md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-resized .md-input {  border-color: '{{primary-color}}'; }md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused label,md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused md-icon {  color: '{{primary-color}}'; }md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused.md-accent .md-input {  border-color: '{{accent-color}}'; }md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused.md-accent label,md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused.md-accent md-icon {  color: '{{accent-color}}'; }md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused.md-warn .md-input {  border-color: '{{warn-A700}}'; }md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused.md-warn label,md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused.md-warn md-icon {  color: '{{warn-A700}}'; }md-input-container.md-THEME_NAME-theme.md-input-invalid .md-input {  border-color: '{{warn-A700}}'; }md-input-container.md-THEME_NAME-theme.md-input-invalid label,md-input-container.md-THEME_NAME-theme.md-input-invalid .md-input-message-animation,md-input-container.md-THEME_NAME-theme.md-input-invalid .md-char-counter {  color: '{{warn-A700}}'; }md-input-container.md-THEME_NAME-theme .md-input[disabled],[disabled] md-input-container.md-THEME_NAME-theme .md-input {  border-bottom-color: transparent;  color: '{{foreground-3}}';  background-image: linear-gradient(to right, \"{{foreground-3}}\" 0%, \"{{foreground-3}}\" 33%, transparent 0%);  background-image: -ms-linear-gradient(left, transparent 0%, \"{{foreground-3}}\" 100%); }md-list.md-THEME_NAME-theme md-list-item.md-2-line .md-list-item-text h3, md-list.md-THEME_NAME-theme md-list-item.md-2-line .md-list-item-text h4,md-list.md-THEME_NAME-theme md-list-item.md-3-line .md-list-item-text h3,md-list.md-THEME_NAME-theme md-list-item.md-3-line .md-list-item-text h4 {  color: '{{foreground-1}}'; }md-list.md-THEME_NAME-theme md-list-item.md-2-line .md-list-item-text p,md-list.md-THEME_NAME-theme md-list-item.md-3-line .md-list-item-text p {  color: '{{foreground-2}}'; }md-list.md-THEME_NAME-theme .md-proxy-focus.md-focused div.md-no-style {  background-color: '{{background-100}}'; }md-list.md-THEME_NAME-theme md-list-item .md-avatar-icon {  background-color: '{{foreground-3}}';  color: '{{background-color}}'; }md-list.md-THEME_NAME-theme md-list-item > md-icon {  color: '{{foreground-2}}'; }  md-list.md-THEME_NAME-theme md-list-item > md-icon.md-highlight {    color: '{{primary-color}}'; }    md-list.md-THEME_NAME-theme md-list-item > md-icon.md-highlight.md-accent {      color: '{{accent-color}}'; }md-menu-content.md-THEME_NAME-theme {  background-color: '{{background-A100}}'; }  md-menu-content.md-THEME_NAME-theme md-menu-item {    color: '{{background-A200-0.87}}'; }    md-menu-content.md-THEME_NAME-theme md-menu-item md-icon {      color: '{{background-A200-0.54}}'; }    md-menu-content.md-THEME_NAME-theme md-menu-item .md-button[disabled] {      color: '{{background-A200-0.25}}'; }      md-menu-content.md-THEME_NAME-theme md-menu-item .md-button[disabled] md-icon {        color: '{{background-A200-0.25}}'; }  md-menu-content.md-THEME_NAME-theme md-menu-divider {    background-color: '{{background-A200-0.11}}'; }md-menu-bar.md-THEME_NAME-theme > button.md-button {  color: '{{foreground-2}}';  border-radius: 2px; }md-menu-bar.md-THEME_NAME-theme md-menu.md-open > button, md-menu-bar.md-THEME_NAME-theme md-menu > button:focus {  outline: none;  background: '{{background-200}}'; }md-menu-bar.md-THEME_NAME-theme.md-open:not(.md-keyboard-mode) md-menu:hover > button {  background-color: '{{ background-500-0.2}}'; }md-menu-bar.md-THEME_NAME-theme:not(.md-keyboard-mode):not(.md-open) md-menu button:hover,md-menu-bar.md-THEME_NAME-theme:not(.md-keyboard-mode):not(.md-open) md-menu button:focus {  background: transparent; }md-menu-content.md-THEME_NAME-theme .md-menu > .md-button:after {  color: '{{background-A200-0.54}}'; }md-menu-content.md-THEME_NAME-theme .md-menu.md-open > .md-button {  background-color: '{{ background-500-0.2}}'; }md-toolbar.md-THEME_NAME-theme.md-menu-toolbar {  background-color: '{{background-A100}}';  color: '{{background-A200}}'; }  md-toolbar.md-THEME_NAME-theme.md-menu-toolbar md-toolbar-filler {    background-color: '{{primary-color}}';    color: '{{background-A100-0.87}}'; }    md-toolbar.md-THEME_NAME-theme.md-menu-toolbar md-toolbar-filler md-icon {      color: '{{background-A100-0.87}}'; }md-nav-bar.md-THEME_NAME-theme .md-nav-bar {  background-color: transparent;  border-color: '{{foreground-4}}'; }md-nav-bar.md-THEME_NAME-theme .md-button._md-nav-button.md-unselected {  color: '{{foreground-2}}'; }md-nav-bar.md-THEME_NAME-theme md-nav-ink-bar {  color: '{{accent-color}}';  background: '{{accent-color}}'; }.md-panel {  background-color: '{{background-900-0.0}}'; }  .md-panel._md-panel-backdrop.md-THEME_NAME-theme {    background-color: '{{background-900-1.0}}'; }md-progress-circular.md-THEME_NAME-theme path {  stroke: '{{primary-color}}'; }md-progress-circular.md-THEME_NAME-theme.md-warn path {  stroke: '{{warn-color}}'; }md-progress-circular.md-THEME_NAME-theme.md-accent path {  stroke: '{{accent-color}}'; }md-progress-linear.md-THEME_NAME-theme .md-container {  background-color: '{{primary-100}}'; }md-progress-linear.md-THEME_NAME-theme .md-bar {  background-color: '{{primary-color}}'; }md-progress-linear.md-THEME_NAME-theme.md-warn .md-container {  background-color: '{{warn-100}}'; }md-progress-linear.md-THEME_NAME-theme.md-warn .md-bar {  background-color: '{{warn-color}}'; }md-progress-linear.md-THEME_NAME-theme.md-accent .md-container {  background-color: '{{accent-100}}'; }md-progress-linear.md-THEME_NAME-theme.md-accent .md-bar {  background-color: '{{accent-color}}'; }md-progress-linear.md-THEME_NAME-theme[md-mode=buffer].md-warn .md-bar1 {  background-color: '{{warn-100}}'; }md-progress-linear.md-THEME_NAME-theme[md-mode=buffer].md-warn .md-dashed:before {  background: radial-gradient(\"{{warn-100}}\" 0%, \"{{warn-100}}\" 16%, transparent 42%); }md-progress-linear.md-THEME_NAME-theme[md-mode=buffer].md-accent .md-bar1 {  background-color: '{{accent-100}}'; }md-progress-linear.md-THEME_NAME-theme[md-mode=buffer].md-accent .md-dashed:before {  background: radial-gradient(\"{{accent-100}}\" 0%, \"{{accent-100}}\" 16%, transparent 42%); }md-radio-button.md-THEME_NAME-theme .md-off {  border-color: '{{foreground-2}}'; }md-radio-button.md-THEME_NAME-theme .md-on {  background-color: '{{accent-color-0.87}}'; }md-radio-button.md-THEME_NAME-theme.md-checked .md-off {  border-color: '{{accent-color-0.87}}'; }md-radio-button.md-THEME_NAME-theme.md-checked .md-ink-ripple {  color: '{{accent-color-0.87}}'; }md-radio-button.md-THEME_NAME-theme .md-container .md-ripple {  color: '{{accent-A700}}'; }md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-primary .md-on, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-primary .md-on,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-primary .md-on,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-primary .md-on {  background-color: '{{primary-color-0.87}}'; }md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-primary .md-checked .md-off, md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-primary.md-checked .md-off, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-primary .md-checked .md-off, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-off,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-primary .md-checked .md-off,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-primary.md-checked .md-off,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-primary .md-checked .md-off,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-off {  border-color: '{{primary-color-0.87}}'; }md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-primary .md-checked .md-ink-ripple, md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-primary.md-checked .md-ink-ripple, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-primary .md-checked .md-ink-ripple, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-ink-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-primary .md-checked .md-ink-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-primary.md-checked .md-ink-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-primary .md-checked .md-ink-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-ink-ripple {  color: '{{primary-color-0.87}}'; }md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-primary .md-container .md-ripple, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-primary .md-container .md-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-primary .md-container .md-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-primary .md-container .md-ripple {  color: '{{primary-600}}'; }md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-warn .md-on, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-warn .md-on,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-warn .md-on,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-warn .md-on {  background-color: '{{warn-color-0.87}}'; }md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-warn .md-checked .md-off, md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-warn.md-checked .md-off, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-warn .md-checked .md-off, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked .md-off,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-warn .md-checked .md-off,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-warn.md-checked .md-off,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-warn .md-checked .md-off,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked .md-off {  border-color: '{{warn-color-0.87}}'; }md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-warn .md-checked .md-ink-ripple, md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-warn.md-checked .md-ink-ripple, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-warn .md-checked .md-ink-ripple, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked .md-ink-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-warn .md-checked .md-ink-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-warn.md-checked .md-ink-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-warn .md-checked .md-ink-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked .md-ink-ripple {  color: '{{warn-color-0.87}}'; }md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-warn .md-container .md-ripple, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-warn .md-container .md-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-warn .md-container .md-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-warn .md-container .md-ripple {  color: '{{warn-600}}'; }md-radio-group.md-THEME_NAME-theme[disabled],md-radio-button.md-THEME_NAME-theme[disabled] {  color: '{{foreground-3}}'; }  md-radio-group.md-THEME_NAME-theme[disabled] .md-container .md-off,  md-radio-button.md-THEME_NAME-theme[disabled] .md-container .md-off {    border-color: '{{foreground-3}}'; }  md-radio-group.md-THEME_NAME-theme[disabled] .md-container .md-on,  md-radio-button.md-THEME_NAME-theme[disabled] .md-container .md-on {    border-color: '{{foreground-3}}'; }md-radio-group.md-THEME_NAME-theme .md-checked .md-ink-ripple {  color: '{{accent-color-0.26}}'; }md-radio-group.md-THEME_NAME-theme.md-primary .md-checked:not([disabled]) .md-ink-ripple, md-radio-group.md-THEME_NAME-theme .md-checked:not([disabled]).md-primary .md-ink-ripple {  color: '{{primary-color-0.26}}'; }md-radio-group.md-THEME_NAME-theme .md-checked.md-primary .md-ink-ripple {  color: '{{warn-color-0.26}}'; }md-radio-group.md-THEME_NAME-theme.md-focused:not(:empty) .md-checked .md-container:before {  background-color: '{{accent-color-0.26}}'; }md-radio-group.md-THEME_NAME-theme.md-focused:not(:empty).md-primary .md-checked .md-container:before,md-radio-group.md-THEME_NAME-theme.md-focused:not(:empty) .md-checked.md-primary .md-container:before {  background-color: '{{primary-color-0.26}}'; }md-radio-group.md-THEME_NAME-theme.md-focused:not(:empty).md-warn .md-checked .md-container:before,md-radio-group.md-THEME_NAME-theme.md-focused:not(:empty) .md-checked.md-warn .md-container:before {  background-color: '{{warn-color-0.26}}'; }md-input-container md-select.md-THEME_NAME-theme .md-select-value span:first-child:after {  color: '{{warn-A700}}'; }md-input-container:not(.md-input-focused):not(.md-input-invalid) md-select.md-THEME_NAME-theme .md-select-value span:first-child:after {  color: '{{foreground-3}}'; }md-input-container.md-input-focused:not(.md-input-has-value) md-select.md-THEME_NAME-theme .md-select-value {  color: '{{primary-color}}'; }  md-input-container.md-input-focused:not(.md-input-has-value) md-select.md-THEME_NAME-theme .md-select-value.md-select-placeholder {    color: '{{primary-color}}'; }md-input-container.md-input-invalid md-select.md-THEME_NAME-theme .md-select-value {  color: '{{warn-A700}}' !important;  border-bottom-color: '{{warn-A700}}' !important; }md-input-container.md-input-invalid md-select.md-THEME_NAME-theme.md-no-underline .md-select-value {  border-bottom-color: transparent !important; }md-select.md-THEME_NAME-theme[disabled] .md-select-value {  border-bottom-color: transparent;  background-image: linear-gradient(to right, \"{{foreground-3}}\" 0%, \"{{foreground-3}}\" 33%, transparent 0%);  background-image: -ms-linear-gradient(left, transparent 0%, \"{{foreground-3}}\" 100%); }md-select.md-THEME_NAME-theme .md-select-value {  border-bottom-color: '{{foreground-4}}'; }  md-select.md-THEME_NAME-theme .md-select-value.md-select-placeholder {    color: '{{foreground-3}}'; }  md-select.md-THEME_NAME-theme .md-select-value span:first-child:after {    color: '{{warn-A700}}'; }md-select.md-THEME_NAME-theme.md-no-underline .md-select-value {  border-bottom-color: transparent !important; }md-select.md-THEME_NAME-theme.ng-invalid.ng-touched .md-select-value {  color: '{{warn-A700}}' !important;  border-bottom-color: '{{warn-A700}}' !important; }md-select.md-THEME_NAME-theme.ng-invalid.ng-touched.md-no-underline .md-select-value {  border-bottom-color: transparent !important; }md-select.md-THEME_NAME-theme:not([disabled]):focus .md-select-value {  border-bottom-color: '{{primary-color}}';  color: '{{ foreground-1 }}'; }  md-select.md-THEME_NAME-theme:not([disabled]):focus .md-select-value.md-select-placeholder {    color: '{{ foreground-1 }}'; }md-select.md-THEME_NAME-theme:not([disabled]):focus.md-no-underline .md-select-value {  border-bottom-color: transparent !important; }md-select.md-THEME_NAME-theme:not([disabled]):focus.md-accent .md-select-value {  border-bottom-color: '{{accent-color}}'; }md-select.md-THEME_NAME-theme:not([disabled]):focus.md-warn .md-select-value {  border-bottom-color: '{{warn-color}}'; }md-select.md-THEME_NAME-theme[disabled] .md-select-value {  color: '{{foreground-3}}'; }  md-select.md-THEME_NAME-theme[disabled] .md-select-value.md-select-placeholder {    color: '{{foreground-3}}'; }md-select-menu.md-THEME_NAME-theme md-content {  background: '{{background-A100}}'; }  md-select-menu.md-THEME_NAME-theme md-content md-optgroup {    color: '{{background-600-0.87}}'; }  md-select-menu.md-THEME_NAME-theme md-content md-option {    color: '{{background-900-0.87}}'; }    md-select-menu.md-THEME_NAME-theme md-content md-option[disabled] .md-text {      color: '{{background-400-0.87}}'; }    md-select-menu.md-THEME_NAME-theme md-content md-option:not([disabled]):focus, md-select-menu.md-THEME_NAME-theme md-content md-option:not([disabled]):hover {      background: '{{background-200}}'; }    md-select-menu.md-THEME_NAME-theme md-content md-option[selected] {      color: '{{primary-500}}'; }      md-select-menu.md-THEME_NAME-theme md-content md-option[selected]:focus {        color: '{{primary-600}}'; }      md-select-menu.md-THEME_NAME-theme md-content md-option[selected].md-accent {        color: '{{accent-color}}'; }        md-select-menu.md-THEME_NAME-theme md-content md-option[selected].md-accent:focus {          color: '{{accent-A700}}'; }.md-checkbox-enabled.md-THEME_NAME-theme .md-ripple {  color: '{{primary-600}}'; }.md-checkbox-enabled.md-THEME_NAME-theme[selected] .md-ripple {  color: '{{background-600}}'; }.md-checkbox-enabled.md-THEME_NAME-theme .md-ink-ripple {  color: '{{foreground-2}}'; }.md-checkbox-enabled.md-THEME_NAME-theme[selected] .md-ink-ripple {  color: '{{primary-color-0.87}}'; }.md-checkbox-enabled.md-THEME_NAME-theme:not(.md-checked) .md-icon {  border-color: '{{foreground-2}}'; }.md-checkbox-enabled.md-THEME_NAME-theme[selected] .md-icon {  background-color: '{{primary-color-0.87}}'; }.md-checkbox-enabled.md-THEME_NAME-theme[selected].md-focused .md-container:before {  background-color: '{{primary-color-0.26}}'; }.md-checkbox-enabled.md-THEME_NAME-theme[selected] .md-icon:after {  border-color: '{{primary-contrast-0.87}}'; }.md-checkbox-enabled.md-THEME_NAME-theme .md-indeterminate[disabled] .md-container {  color: '{{foreground-3}}'; }.md-checkbox-enabled.md-THEME_NAME-theme md-option .md-text {  color: '{{background-900-0.87}}'; }md-sidenav.md-THEME_NAME-theme, md-sidenav.md-THEME_NAME-theme md-content {  background-color: '{{background-hue-1}}'; }md-slider.md-THEME_NAME-theme .md-track {  background-color: '{{foreground-3}}'; }md-slider.md-THEME_NAME-theme .md-track-ticks {  color: '{{background-contrast}}'; }md-slider.md-THEME_NAME-theme .md-focus-ring {  background-color: '{{accent-A200-0.2}}'; }md-slider.md-THEME_NAME-theme .md-disabled-thumb {  border-color: '{{background-color}}';  background-color: '{{background-color}}'; }md-slider.md-THEME_NAME-theme.md-min .md-thumb:after {  background-color: '{{background-color}}';  border-color: '{{foreground-3}}'; }md-slider.md-THEME_NAME-theme.md-min .md-focus-ring {  background-color: '{{foreground-3-0.38}}'; }md-slider.md-THEME_NAME-theme.md-min[md-discrete] .md-thumb:after {  background-color: '{{background-contrast}}';  border-color: transparent; }md-slider.md-THEME_NAME-theme.md-min[md-discrete] .md-sign {  background-color: '{{background-400}}'; }  md-slider.md-THEME_NAME-theme.md-min[md-discrete] .md-sign:after {    border-top-color: '{{background-400}}'; }md-slider.md-THEME_NAME-theme.md-min[md-discrete][md-vertical] .md-sign:after {  border-top-color: transparent;  border-left-color: '{{background-400}}'; }md-slider.md-THEME_NAME-theme .md-track.md-track-fill {  background-color: '{{accent-color}}'; }md-slider.md-THEME_NAME-theme .md-thumb:after {  border-color: '{{accent-color}}';  background-color: '{{accent-color}}'; }md-slider.md-THEME_NAME-theme .md-sign {  background-color: '{{accent-color}}'; }  md-slider.md-THEME_NAME-theme .md-sign:after {    border-top-color: '{{accent-color}}'; }md-slider.md-THEME_NAME-theme[md-vertical] .md-sign:after {  border-top-color: transparent;  border-left-color: '{{accent-color}}'; }md-slider.md-THEME_NAME-theme .md-thumb-text {  color: '{{accent-contrast}}'; }md-slider.md-THEME_NAME-theme.md-warn .md-focus-ring {  background-color: '{{warn-200-0.38}}'; }md-slider.md-THEME_NAME-theme.md-warn .md-track.md-track-fill {  background-color: '{{warn-color}}'; }md-slider.md-THEME_NAME-theme.md-warn .md-thumb:after {  border-color: '{{warn-color}}';  background-color: '{{warn-color}}'; }md-slider.md-THEME_NAME-theme.md-warn .md-sign {  background-color: '{{warn-color}}'; }  md-slider.md-THEME_NAME-theme.md-warn .md-sign:after {    border-top-color: '{{warn-color}}'; }md-slider.md-THEME_NAME-theme.md-warn[md-vertical] .md-sign:after {  border-top-color: transparent;  border-left-color: '{{warn-color}}'; }md-slider.md-THEME_NAME-theme.md-warn .md-thumb-text {  color: '{{warn-contrast}}'; }md-slider.md-THEME_NAME-theme.md-primary .md-focus-ring {  background-color: '{{primary-200-0.38}}'; }md-slider.md-THEME_NAME-theme.md-primary .md-track.md-track-fill {  background-color: '{{primary-color}}'; }md-slider.md-THEME_NAME-theme.md-primary .md-thumb:after {  border-color: '{{primary-color}}';  background-color: '{{primary-color}}'; }md-slider.md-THEME_NAME-theme.md-primary .md-sign {  background-color: '{{primary-color}}'; }  md-slider.md-THEME_NAME-theme.md-primary .md-sign:after {    border-top-color: '{{primary-color}}'; }md-slider.md-THEME_NAME-theme.md-primary[md-vertical] .md-sign:after {  border-top-color: transparent;  border-left-color: '{{primary-color}}'; }md-slider.md-THEME_NAME-theme.md-primary .md-thumb-text {  color: '{{primary-contrast}}'; }md-slider.md-THEME_NAME-theme[disabled] .md-thumb:after {  border-color: transparent; }md-slider.md-THEME_NAME-theme[disabled]:not(.md-min) .md-thumb:after, md-slider.md-THEME_NAME-theme[disabled][md-discrete] .md-thumb:after {  background-color: '{{foreground-3}}';  border-color: transparent; }md-slider.md-THEME_NAME-theme[disabled][readonly] .md-sign {  background-color: '{{background-400}}'; }  md-slider.md-THEME_NAME-theme[disabled][readonly] .md-sign:after {    border-top-color: '{{background-400}}'; }md-slider.md-THEME_NAME-theme[disabled][readonly][md-vertical] .md-sign:after {  border-top-color: transparent;  border-left-color: '{{background-400}}'; }md-slider.md-THEME_NAME-theme[disabled][readonly] .md-disabled-thumb {  border-color: transparent;  background-color: transparent; }md-slider-container[disabled] > *:first-child:not(md-slider),md-slider-container[disabled] > *:last-child:not(md-slider) {  color: '{{foreground-3}}'; }.md-subheader.md-THEME_NAME-theme {  color: '{{ foreground-2-0.23 }}';  background-color: '{{background-default}}'; }  .md-subheader.md-THEME_NAME-theme.md-primary {    color: '{{primary-color}}'; }  .md-subheader.md-THEME_NAME-theme.md-accent {    color: '{{accent-color}}'; }  .md-subheader.md-THEME_NAME-theme.md-warn {    color: '{{warn-color}}'; }md-switch.md-THEME_NAME-theme .md-ink-ripple {  color: '{{background-500}}'; }md-switch.md-THEME_NAME-theme .md-thumb {  background-color: '{{background-50}}'; }md-switch.md-THEME_NAME-theme .md-bar {  background-color: '{{background-500}}'; }md-switch.md-THEME_NAME-theme.md-checked .md-ink-ripple {  color: '{{accent-color}}'; }md-switch.md-THEME_NAME-theme.md-checked .md-thumb {  background-color: '{{accent-color}}'; }md-switch.md-THEME_NAME-theme.md-checked .md-bar {  background-color: '{{accent-color-0.5}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-focused .md-thumb:before {  background-color: '{{accent-color-0.26}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-primary .md-ink-ripple {  color: '{{primary-color}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-primary .md-thumb {  background-color: '{{primary-color}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-primary .md-bar {  background-color: '{{primary-color-0.5}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-primary.md-focused .md-thumb:before {  background-color: '{{primary-color-0.26}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-warn .md-ink-ripple {  color: '{{warn-color}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-warn .md-thumb {  background-color: '{{warn-color}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-warn .md-bar {  background-color: '{{warn-color-0.5}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-warn.md-focused .md-thumb:before {  background-color: '{{warn-color-0.26}}'; }md-switch.md-THEME_NAME-theme[disabled] .md-thumb {  background-color: '{{background-400}}'; }md-switch.md-THEME_NAME-theme[disabled] .md-bar {  background-color: '{{foreground-4}}'; }md-tabs.md-THEME_NAME-theme md-tabs-wrapper {  background-color: transparent;  border-color: '{{foreground-4}}'; }md-tabs.md-THEME_NAME-theme .md-paginator md-icon {  color: '{{primary-color}}'; }md-tabs.md-THEME_NAME-theme md-ink-bar {  color: '{{accent-color}}';  background: '{{accent-color}}'; }md-tabs.md-THEME_NAME-theme .md-tab {  color: '{{foreground-2}}'; }  md-tabs.md-THEME_NAME-theme .md-tab[disabled], md-tabs.md-THEME_NAME-theme .md-tab[disabled] md-icon {    color: '{{foreground-3}}'; }  md-tabs.md-THEME_NAME-theme .md-tab.md-active, md-tabs.md-THEME_NAME-theme .md-tab.md-active md-icon, md-tabs.md-THEME_NAME-theme .md-tab.md-focused, md-tabs.md-THEME_NAME-theme .md-tab.md-focused md-icon {    color: '{{primary-color}}'; }  md-tabs.md-THEME_NAME-theme .md-tab.md-focused {    background: '{{primary-color-0.1}}'; }  md-tabs.md-THEME_NAME-theme .md-tab .md-ripple-container {    color: '{{accent-A100}}'; }md-tabs.md-THEME_NAME-theme.md-accent > md-tabs-wrapper {  background-color: '{{accent-color}}'; }  md-tabs.md-THEME_NAME-theme.md-accent > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]) {    color: '{{accent-A100}}'; }    md-tabs.md-THEME_NAME-theme.md-accent > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active, md-tabs.md-THEME_NAME-theme.md-accent > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active md-icon, md-tabs.md-THEME_NAME-theme.md-accent > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused, md-tabs.md-THEME_NAME-theme.md-accent > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused md-icon {      color: '{{accent-contrast}}'; }    md-tabs.md-THEME_NAME-theme.md-accent > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused {      background: '{{accent-contrast-0.1}}'; }  md-tabs.md-THEME_NAME-theme.md-accent > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-ink-bar {    color: '{{primary-600-1}}';    background: '{{primary-600-1}}'; }md-tabs.md-THEME_NAME-theme.md-primary > md-tabs-wrapper {  background-color: '{{primary-color}}'; }  md-tabs.md-THEME_NAME-theme.md-primary > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]) {    color: '{{primary-100}}'; }    md-tabs.md-THEME_NAME-theme.md-primary > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active, md-tabs.md-THEME_NAME-theme.md-primary > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active md-icon, md-tabs.md-THEME_NAME-theme.md-primary > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused, md-tabs.md-THEME_NAME-theme.md-primary > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused md-icon {      color: '{{primary-contrast}}'; }    md-tabs.md-THEME_NAME-theme.md-primary > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused {      background: '{{primary-contrast-0.1}}'; }md-tabs.md-THEME_NAME-theme.md-warn > md-tabs-wrapper {  background-color: '{{warn-color}}'; }  md-tabs.md-THEME_NAME-theme.md-warn > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]) {    color: '{{warn-100}}'; }    md-tabs.md-THEME_NAME-theme.md-warn > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active, md-tabs.md-THEME_NAME-theme.md-warn > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active md-icon, md-tabs.md-THEME_NAME-theme.md-warn > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused, md-tabs.md-THEME_NAME-theme.md-warn > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused md-icon {      color: '{{warn-contrast}}'; }    md-tabs.md-THEME_NAME-theme.md-warn > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused {      background: '{{warn-contrast-0.1}}'; }md-toolbar > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper {  background-color: '{{primary-color}}'; }  md-toolbar > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]) {    color: '{{primary-100}}'; }    md-toolbar > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active, md-toolbar > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active md-icon, md-toolbar > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused, md-toolbar > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused md-icon {      color: '{{primary-contrast}}'; }    md-toolbar > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused {      background: '{{primary-contrast-0.1}}'; }md-toolbar.md-accent > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper {  background-color: '{{accent-color}}'; }  md-toolbar.md-accent > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]) {    color: '{{accent-A100}}'; }    md-toolbar.md-accent > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active, md-toolbar.md-accent > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active md-icon, md-toolbar.md-accent > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused, md-toolbar.md-accent > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused md-icon {      color: '{{accent-contrast}}'; }    md-toolbar.md-accent > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused {      background: '{{accent-contrast-0.1}}'; }  md-toolbar.md-accent > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-ink-bar {    color: '{{primary-600-1}}';    background: '{{primary-600-1}}'; }md-toolbar.md-warn > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper {  background-color: '{{warn-color}}'; }  md-toolbar.md-warn > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]) {    color: '{{warn-100}}'; }    md-toolbar.md-warn > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active, md-toolbar.md-warn > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active md-icon, md-toolbar.md-warn > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused, md-toolbar.md-warn > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused md-icon {      color: '{{warn-contrast}}'; }    md-toolbar.md-warn > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused {      background: '{{warn-contrast-0.1}}'; }md-toast.md-THEME_NAME-theme .md-toast-content {  background-color: #323232;  color: '{{background-50}}'; }  md-toast.md-THEME_NAME-theme .md-toast-content .md-button {    color: '{{background-50}}'; }    md-toast.md-THEME_NAME-theme .md-toast-content .md-button.md-highlight {      color: '{{accent-color}}'; }      md-toast.md-THEME_NAME-theme .md-toast-content .md-button.md-highlight.md-primary {        color: '{{primary-color}}'; }      md-toast.md-THEME_NAME-theme .md-toast-content .md-button.md-highlight.md-warn {        color: '{{warn-color}}'; }md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar) {  background-color: '{{primary-color}}';  color: '{{primary-contrast}}'; }  md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar) md-icon {    color: '{{primary-contrast}}';    fill: '{{primary-contrast}}'; }  md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar) .md-button[disabled] md-icon {    color: '{{primary-contrast-0.26}}';    fill: '{{primary-contrast-0.26}}'; }  md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar).md-accent {    background-color: '{{accent-color}}';    color: '{{accent-contrast}}'; }    md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar).md-accent .md-ink-ripple {      color: '{{accent-contrast}}'; }    md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar).md-accent md-icon {      color: '{{accent-contrast}}';      fill: '{{accent-contrast}}'; }    md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar).md-accent .md-button[disabled] md-icon {      color: '{{accent-contrast-0.26}}';      fill: '{{accent-contrast-0.26}}'; }  md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar).md-warn {    background-color: '{{warn-color}}';    color: '{{warn-contrast}}'; }md-tooltip.md-THEME_NAME-theme {  color: '{{background-A100}}'; }  md-tooltip.md-THEME_NAME-theme .md-content {    background-color: '{{foreground-2}}'; }/*  Only used with Theme processes */html.md-THEME_NAME-theme, body.md-THEME_NAME-theme {  color: '{{foreground-1}}';  background-color: '{{background-color}}'; }"
    ).directive(
        'mdAutofocus',
        MdAutofocusDirective
    ).directive(
        'mdAutoFocus',
        MdAutofocusDirective
    ).directive(
        'mdSidenavFocus',
        MdAutofocusDirective
    ).run(
        ['$log', '$injector', DetectNgTouch]
    );

}(window, window.angular));

window.ngMaterial = {
    version: {
        full: "1.1.1"
    }
};
