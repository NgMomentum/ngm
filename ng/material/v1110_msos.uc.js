
/*!
 * Angular Material Design
 * https://github.com/angular/material
 * @license MIT
 * v1.1.10
 */

/*global
    msos: false,
    _: false,
    Node: false
*/

(function (window, angular) {
    "use strict";

    var nextUniqueId = 0;

    function MdConstantFactory() {

		function getVendorPrefix(testElement) {
			var prop,
				match,
				vendorRegex = /^(Moz|webkit|ms)(?=[A-Z])/;

			for (prop in testElement.style) {
				match = vendorRegex.exec(prop);
				if (match) {
					return match[0];
				}
			}
		}

        var prefixTestEl = document.createElement('div'),
			vendorPrefix = getVendorPrefix(prefixTestEl),
			isWebkit = /webkit/i.test(vendorPrefix),
			SPECIAL_CHARS_REGEXP = /([:\-_]+(.))/g,
            self;

        function camelCase(input) {
            return input.replace(
					SPECIAL_CHARS_REGEXP,
					function (matches_na, separator_na, letter, offset) {
						return offset ? letter.toUpperCase() : letter;
					}
				);
        }

		function hasStyleProperty(testElement, property) {
			return angular.isDefined(testElement.style[property]);
		}

		function vendorProperty(name) {
			var prefixedName = vendorPrefix + '-' + name,
				ucPrefix = camelCase(prefixedName),
				lcPrefix = ucPrefix.charAt(0).toLowerCase() + ucPrefix.substring(1);

			return	hasStyleProperty(prefixTestEl, name)     ? name     :       // The current browser supports the un-prefixed property
					hasStyleProperty(prefixTestEl, ucPrefix) ? ucPrefix :       // The current browser only supports the prefixed property.
					hasStyleProperty(prefixTestEl, lcPrefix) ? lcPrefix : name; // Some browsers are only supporting the prefix in lowercase.
		}

        self = {
			isInputKey : function (e) { return (e.keyCode >= 31 && e.keyCode <= 90); },
			isNumPadKey : function (e) { return (3 === e.location && e.keyCode >= 97 && e.keyCode <= 105); },
			isMetaKey: function (e) { return (e.keyCode >= 91 && e.keyCode <= 93); },
			isFnLockKey: function (e) { return (e.keyCode >= 112 && e.keyCode <= 145); },
			isNavigationKey : function (e) {
				var kc = self.KEY_CODE,
					NAVIGATION_KEYS = [kc.SPACE, kc.ENTER, kc.UP_ARROW, kc.DOWN_ARROW];

				return (NAVIGATION_KEYS.indexOf(e.keyCode) != -1);
			},
			hasModifierKey: function (e) { return e.ctrlKey || e.metaKey || e.altKey; },
			ELEMENT_MAX_PIXELS: 1533917,
			BEFORE_NG_ARIA: 210,
			KEY_CODE: {
				COMMA: 188,
				SEMICOLON : 186,
				ENTER: 13,
				ESCAPE: 27,
				SPACE: 32,
				PAGE_UP: 33,
				PAGE_DOWN: 34,
				END: 35,
				HOME: 36,
				LEFT_ARROW : 37,
				UP_ARROW : 38,
				RIGHT_ARROW : 39,
				DOWN_ARROW : 40,
				TAB : 9,
				BACKSPACE: 8,
				DELETE: 46
			},
			CSS: {
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

    function UtilFactory($document, $timeout, $compile, $rootScope, $interpolate, $rootElement, $window, $$rAF) {
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
            now: window.performance && window.performance.now ?
                angular.bind(window.performance, window.performance.now) : Date.now || function () {
                    return new Date().getTime();
            },
			getModelOption: function (ngModelCtrl, optionName) {

				if (!ngModelCtrl.$options) { return; }

				var $options = ngModelCtrl.$options;

				return $options.getOption ? $options.getOption(optionName) : $options[optionName];
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
			getViewportTop: function () {
				return window.scrollY || window.pageYOffset || 0;
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
			disableScrollAround: function (element, parent, options) {

				options = options || {};

				$mdUtil.disableScrollAround._count = Math.max(0, $mdUtil.disableScrollAround._count || 0);
				$mdUtil.disableScrollAround._count += 1;

				if ($mdUtil.disableScrollAround._restoreScroll) {
					return $mdUtil.disableScrollAround._restoreScroll;
				}

				function disableBodyScroll() {
					var documentElement = $document[0].documentElement,
						prevDocumentStyle = documentElement.style.cssText || '',
						prevBodyStyle = body.style.cssText || '',
						viewportTop = $mdUtil.getViewportTop(),
						clientWidth = body.clientWidth,
						hasVerticalScrollbar = body.scrollHeight > body.clientHeight + 1,
						scrollElement = documentElement.scrollTop > 0 ? documentElement : body;

					if (hasVerticalScrollbar) {
						angular.element(body).css(
							{
								position: 'fixed',
								width: '100%',
								top: -viewportTop + 'px'
							}
						);
					}

					if (body.clientWidth < clientWidth) {
						body.style.overflow = 'hidden';
					}

					if (hasVerticalScrollbar) {
						documentElement.style.overflowY = 'scroll';
					}

					return function restoreScroll() {
						// Reset the inline style CSS to the previous.
						body.style.cssText = prevBodyStyle;
						documentElement.style.cssText = prevDocumentStyle;

						// The scroll position while being fixed
						scrollElement.scrollTop = viewportTop;
					};
				}

				function disableElementScroll(element) {

					element = angular.element(element || body);

					var scrollMask;

					if (options.disableScrollMask) {
						scrollMask = element;
					} else {
						scrollMask = angular.element(
							'<div class="md-scroll-mask">' +
								'<div class="md-scroll-mask-bar"></div>' +
							'</div>'
						);

						element.append(scrollMask);
					}

					function preventDefault(e) { e.preventDefault(); }

					scrollMask.on('wheel', preventDefault);
					scrollMask.on('touchmove', preventDefault);

					return function restoreElementScroll() {
						scrollMask.off('wheel');
						scrollMask.off('touchmove');

						if (!options.disableScrollMask && scrollMask[0].parentNode ) {
							scrollMask[0].parentNode.removeChild(scrollMask[0]);
						}
					};
				}

				var body = $document[0].body,
					restoreBody = disableBodyScroll(),
					restoreElement = disableElementScroll(parent);

				$mdUtil.disableScrollAround._restoreScroll = function () {

					$mdUtil.disableScrollAround._count -= 1;

					if ($mdUtil.disableScrollAround._count <= 0) {
						restoreBody();
						restoreElement();
						delete $mdUtil.disableScrollAround._restoreScroll;
					}
				};

				return $mdUtil.disableScrollAround._restoreScroll;
			},
			enableScrolling: function () {
				var restoreFn = this.disableScrollAround._restoreScroll;

				if (restoreFn && angular.isFunction(restoreFn)) {
					restoreFn();
				}
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
				pattern = pattern || /\{([^{}]*)\}/g;
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

				if (_.isUndefined(invokeApply)) { invokeApply = false; }

				invokeApply = Boolean(invokeApply);

                return function debounced() {
                    var context = scope,
                        args = Array.prototype.slice.call(arguments);

                    $timeout.cancel(timer);

                    timer = $timeout(
						function ng_material_core_debounced_to() {

							timer = undefined;
							func.apply(context, args);

						},
						wait || 10,
						invokeApply
					);
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
                        return el.nodeName.toUpperCase() === tagName;
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

				function scanChildren(element) {
					var found,
						i = 0,
						len = 0,
						target,
						j = 0,
						numChild = 0;

					if (element) {
						for (i = 0, len = element.length; i < len; i += 1) {
							target = element[i];
							if (!found) {
								for (j = 0, numChild = target.childNodes.length; j < numChild; j += 1) {
									found = found || scanTree([target.childNodes[j]]);
								}
							}
						}
					}

					return found;
				}

				function scanTree(element) {
					return scanLevel(element) || (scanDeep ? scanChildren(element) : null);
				}

                found = scanTree(element);

                if (!found && !!warnNotFound) {
                    msos.console.warn('ng.material.core -> ' +  $mdUtil.supplant("Unable to find node '{0}' in element '{1}'.", [nodeName, element[0].outerHTML]));
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
                if (digest === null || digest === undefined) { digest = false; }

                //-- store updated digest/queue values
                nextTick.digest = nextTick.digest || Boolean(digest);
                nextTick.queue = queue;

                function mdUtil_nextTick_processQueue() {
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

                nextTick.timeout = $timeout(mdUtil_nextTick_processQueue, 10, false);

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
            animateScrollTo: function (element, scrollEnd, duration) {
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
                    var easeDuration = duration || 1000,
						currentTime = $mdUtil.now() - startTime;

                    return ease(currentTime, scrollStart, scrollChange, easeDuration);
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

	function MdCompilerProvider($compileProvider) {
		var mdc_provider = this,
			respectPreAssignBindingsEnabled = false;

		this.respectPreAssignBindingsEnabled = function (respected) {
			if (angular.isDefined(respected)) {
				respectPreAssignBindingsEnabled = respected;
				return this;
			}

			return respectPreAssignBindingsEnabled;
		};

		function getPreAssignBindingsEnabled() {
			if (!respectPreAssignBindingsEnabled) {
				return true;
			}

			if (typeof $compileProvider.preAssignBindingsEnabled === 'function') {
				return $compileProvider.preAssignBindingsEnabled();
			}

			if (angular.version.major === 1 && angular.version.minor < 6) {
				return true;
			}

			// AngularJS >=1.7.0
			return false;
		}

		function MdCompilerService($q, $templateRequest, $injector, $compile, $controller) {

			this.$q = $q;
			this.$templateRequest = $templateRequest;
			this.$injector = $injector;
			this.$compile = $compile;
			this.$controller = $controller;
		}

		MdCompilerService.prototype.compile = function (options) {
			if (options.contentElement) {
				return this._prepareContentElement(options);
			} else {
				return this._compileTemplate(options);
			}
		};

		MdCompilerService.prototype._prepareContentElement = function (options) {

			var contentElement = this._fetchContentElement(options);

			return this.$q.resolve(
					this.$q.defer('ng_md_resolve_mdCompilerService'),
					{
						element: contentElement.element,
						cleanup: contentElement.restore,
						locals: {},
						link: function() { return contentElement.element; }
					}
				);
		};

		MdCompilerService.prototype._compileTemplate = function (options) {

			var self = this,
				templateUrl = options.templateUrl,
				template = options.template || '',
				resolve = angular.extend({}, options.resolve),
				locals = angular.extend({}, options.locals),
				transformTemplate = options.transformTemplate || angular.identity;

			angular.forEach(
				resolve,
				function (value, key) {
					if (angular.isString(value)) {
						resolve[key] = self.$injector.get(value);
					} else {
						resolve[key] = self.$injector.invoke(value);
					}
				}
			);

			angular.extend(resolve, locals);

			if (templateUrl) {
				resolve.$$ngTemplate = this.$templateRequest(templateUrl);
			} else {
				resolve.$$ngTemplate = this.$q.when(this.$q.defer('ng_md_when_mdCompilerService'), template);
			}

			return this.$q.all(this.$q.defer('ng_md_all_mdCompilerService'), resolve).then(
					function(locals) {
						var template = transformTemplate(locals.$$ngTemplate, options),
							element = options.element || angular.element('<div>').html(template.trim()).contents();

						return self._compileElement(locals, element, options);
					}
				);

		};

		MdCompilerService.prototype._compileElement = function (locals, element, options) {
			var self = this,
				ngLinkFn = this.$compile(element),
				compileData = {};

			function linkFn(scope) {
				var injectLocals,
					ctrl;

				locals.$scope = scope;

				if (options.controller) {
					injectLocals = angular.extend(
						{},
						locals,
						{ $element: element }
					);

					ctrl = self._createController(options, injectLocals, locals);

					element.data('$ngControllerController', ctrl);
					element.children().data('$ngControllerController', ctrl);

					compileData.controller = ctrl;
				}

				return ngLinkFn(scope);
			}

			compileData = {
				element: element,
				cleanup: element.remove.bind(element),
				locals: locals,
				link: linkFn
			};

			return compileData;
		};

		MdCompilerService.prototype._createController = function (options, injectLocals, locals) {
			var ctrl,
				preAssignBindingsEnabled = getPreAssignBindingsEnabled(),
				invokeCtrl;

			if (preAssignBindingsEnabled) {
				invokeCtrl = this.$controller(options.controller, injectLocals, true);

				if (options.bindToController) {
					angular.extend(invokeCtrl.instance, locals);
				}

				ctrl = invokeCtrl();

			} else {

				ctrl = this.$controller(options.controller, injectLocals);

				if (options.bindToController) {
					angular.extend(ctrl, locals);
				}
			}

			if (options.controllerAs) {
				injectLocals.$scope[options.controllerAs] = ctrl;
			}

			// Call the $onInit hook if it's present on the controller.
			if (angular.isFunction(ctrl.$onInit)) {
				ctrl.$onInit();
			}

			return ctrl;
		};

		MdCompilerService.prototype._fetchContentElement = function(options) {
			var contentEl = options.contentElement,
				restoreFn = null;

			function createRestoreFn(element) {
				var parent = element.parentNode,
					nextSibling = element.nextElementSibling;

				return function () {
					if (!nextSibling) {
						parent.appendChild(element);
					} else {
						parent.insertBefore(element, nextSibling);
					}
				};
			}

			if (angular.isString(contentEl)) {
				contentEl = document.querySelector(contentEl);
				restoreFn = createRestoreFn(contentEl);
			} else {
				contentEl = contentEl[0] || contentEl;

				if (document.contains(contentEl)) {
					restoreFn = createRestoreFn(contentEl);
				} else {
					restoreFn = function () {
						if (contentEl.parentNode) {
							contentEl.parentNode.removeChild(contentEl);
						}
					};
				}
			}

			return {
				element: angular.element(contentEl),
				restore: restoreFn
			};
		};

		mdc_provider.$get = ["$q", "$templateRequest", "$injector", "$compile", "$controller",
			function ($q, $templateRequest, $injector, $compile, $controller) {
				return new MdCompilerService($q, $templateRequest, $injector, $compile, $controller);
		}];
	}

    function ComponentRegistry($q) {

        var self,
            instances = [],
            pendings = {};

        function isValidID(handle) {
            return handle && (handle !== "");
        }

        self = {

            notFoundError: function (handle, msgContext) {
				msos.console.error('ng.material.core -> ' + (msgContext || "") + 'No instance found for handle', handle);
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

    function DetectNgTouch($injector) {
        if ($injector.has('$swipe')) {
            var msg =   "ng.materail.core -> You are using the ng.touch module. \n" +
                        "Angular Material already has mobile click, tap, and swipe support... \n" +
                        "ng.touch is not supported with Angular Material!";
            msos.console.warn(msg);
        }
    }


    angular.module(
        'ng.material.core',
        ["ng"]
    ).provider(
		'$mdCompiler',
		['$compileProvider', MdCompilerProvider]
	).factory(
        '$mdConstant',
        MdConstantFactory
    ).factory(
        '$mdUtil',
        ['$document', '$timeout', '$compile', '$rootScope', '$interpolate', '$rootElement', '$window', '$$rAF', UtilFactory]
    ).factory(
        '$mdComponentRegistry',
        ['$q', ComponentRegistry]
    ).directive(
		'mdInvert',
		angular.restrictADir
	).directive(
		'mdComponentId',			// ref. sidenav (only, for now)
		angular.restrictADir
	).directive(
		'mdNoAsterisk',				// ref. input, select
		angular.restrictADir
	).directive(
		'mdMode',					// ref. progresslin, progresscir
		angular.restrictADir
	).directive(
		'mdOpen',					// ref. fabactions (only, for now)
		angular.restrictADir
	).directive(
		'mdDirection',				// ref. fabactions, tooltip
		angular.restrictADir
	).directive(
		'mdRemovable',				// ref. chips
		angular.restrictADir
	).directive(
		'mdHighlightFlags',			// ref. chips, autocomplete
		angular.restrictADir
	).directive(
		'mdRequireMatch',			// ref. chips, autocomplete
		angular.restrictADir
	).directive(
		'mdMinLength',				// ref. chips, autocomplete
		angular.restrictADir
	).directive(
		'mdIsOpen',					// ref. sidenav, datepickermd
		angular.restrictADir
	).run(
        ['$injector', DetectNgTouch]
    );

}(window, window.angular));
