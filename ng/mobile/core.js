
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false,
    util: false
*/

msos.provide("ng.mobile.core");

if (msos.config.mobile === true) {
	msos.require("ng.mobile.gestures");
}
// Add FastClick for mobile devices that need it
if (msos.config.browser.fastclick === false) {
	msos.require("util.fastclick");
}


(function () {
    'use strict';

    var fastclick_module,
        shared_state_module,
        uiBindEvent,
        parseScopeContext,
        mixScopeContext,
        parseUiCondition,
        ng_mobile_core_css = new msos.loader();

    // Load Angular-UI-Bootstrap module panel CSS (panel.css) because most ui's require it
    ng_mobile_core_css.load(msos.resource_url('ng', 'bootstrap/css/ui/panel.css'));
    // Add Mobile-UI-Angular mobile ui misc. css
    ng_mobile_core_css.load(msos.resource_url('ng', 'mobile/css/ui/misc.css'));
    // Add Mobile-UI-Angular mobile only css
    if (msos.config.mobile === true) {
        ng_mobile_core_css.load(msos.resource_url('ng', 'mobile/css/ui/only.css'));
    }

    fastclick_module = angular.module(
        'ng.mobile.core.fastclick',
        ['ng']
    );

    if (window.util
     && window.util.fastclick) {

        fastclick_module.run(
            ['$window', function ($window) {

                var orgHandler = $window.util.fastclick.prototype.onTouchEnd;

                $window.util.fastclick.prototype.onTouchEnd = function (event) {

                    if (!event.changedTouches) {
                        event.changedTouches = [{}];
                    }

                    orgHandler = _.bind(orgHandler, this);
                    orgHandler(event);
                };

                $window.util.fastclick.attach($window.document.body);
            }]
        );

        angular.forEach(
            ['select', 'input', 'textarea'],
            function (directiveName) {
                fastclick_module.directive(
                    directiveName,
                    function () {
                        return {
                            restrict: 'E',
                            compile: function (elem) {
                                elem.addClass('needsclick');
                            }
                        };
                    }
                );
            }
        );
    }

    angular.module(
        'ng.mobile.core.activeLinks',
        ['ng']
    ).provider(
        'setupActiveLinks',
        ['$locationProvider', function ($locationProvider) {
            this.$get = [
                '$document',
                '$location',
                function ($document, $location) {
                    return function () {
                        var currentPath = $location.path();
                        var links = $document[0].links;

                        for (var i = 0; i < links.length; i++) {
                            var link = angular.element(links[i]);
                            var href = link.attr('href');

                            if (!href) {
                                return link.removeClass('active');
                            }

                            var html5Mode = $locationProvider.html5Mode().enabled;

                            if (!html5Mode) {
                                var linkPrefix = '#' + $locationProvider.hashPrefix();
                                if (href.slice(0, linkPrefix.length) === linkPrefix) {
                                    href = href.slice(linkPrefix.length);
                                } else {
                                    return link.removeClass('active');
                                }
                            }

                            if (href.charAt(0) !== '/') {
                                return link.removeClass('active');
                            }

                            href = href.split('#')[0].split('?')[0];

                            if (href === currentPath) {
                                link.addClass('active');
                            } else {
                                link.removeClass('active');
                            }
                        }

                        return undefined;
                    };
                }
            ];
        }]
    ).run(['$rootScope', 'setupActiveLinks', function ($rootScope, setupActiveLinks) {
            $rootScope.$on('$locationChangeSuccess', setupActiveLinks);
            $rootScope.$on('$includeContentLoaded', setupActiveLinks);
        }]
    );

    angular.module(
        'ng.mobile.core.capture',
        ['ng']
    ).run([
        'Capture',
        '$rootScope',
        function (Capture, $rootScope) {
            $rootScope.$on('$routeChangeSuccess', function () {
                Capture.resetAll();
            });
        }
    ]).factory(
        'Capture',
        ['$compile', function ($compile) {
            var yielders = {};

            return {
                yielders: yielders,

                resetAll: function () {
                    for (var name in yielders) {
                        if (yielders.hasOwnProperty(name)) {
                            this.resetYielder(name);
                        }
                    }
                },

                resetYielder: function (name) {
                    var b = yielders[name];
                    this.setContentFor(name, b.defaultContent, b.defaultScope);
                },

                putYielder: function (name, element, defaultScope, defaultContent) {
                    var yielder = {};
                    yielder.name = name;
                    yielder.element = element;
                    yielder.defaultContent = defaultContent || '';
                    yielder.defaultScope = defaultScope;
                    yielders[name] = yielder;
                },

                getYielder: function (name) {
                    return yielders[name];
                },

                removeYielder: function (name) {
                    delete yielders[name];
                },

                setContentFor: function (name, content, scope) {
                    var b = yielders[name];
                    if (!b) {
                        return;
                    }
                    b.element.html(content);
                    $compile(b.element.contents())(scope);
                }

            };
        }
    ]).directive(
        'uiContentFor',
        ['Capture', function (Capture) {
            return {
                compile: function (tElem, tAttrs) {
                    var rawContent = tElem.html();
                    if (tAttrs.uiDuplicate === null || tAttrs.uiDuplicate === undefined) {
                        // no need to compile anything!
                        tElem.html('');
                        tElem.remove();
                    }
                    return function (scope, elem, attrs) {
                        Capture.setContentFor(attrs.uiContentFor, rawContent, scope);
                    };
                }
            };
        }
    ]).directive(
        'uiYieldTo',
        ['$compile', 'Capture', function ($compile, Capture) {
            return {
                link: function (scope, element, attr) {
                    Capture.putYielder(attr.uiYieldTo, element, scope, element.html());

                    element.on('$destroy', function () {
                        Capture.removeYielder(attr.uiYieldTo);
                    });

                    scope.$on('$destroy', function () {
                        Capture.removeYielder(attr.uiYieldTo);
                    });
                }
            };
        }
    ]);

    angular.module(
        'ng.mobile.core.outerClick',
        ['ng']
    ).factory(
        '_mauiIsAncestorOrSelf',
        function () {
            return function (element, target) {
                var parent = element;
                while (parent.length > 0) {
                    if (parent[0] === target[0]) {
                        parent = null;
                        return true;
                    }
                    parent = parent.parent();
                }
                parent = null;
                return false;
            };
        }
    ).factory(
        'bindOuterClick',
        ['$document', '$timeout', '_mauiIsAncestorOrSelf', function ($document, $timeout, isAncestorOrSelf) {
            return function (scope, element, outerClickFn, outerClickIf) {
                var handleOuterClick = function (event) {
                    if (!isAncestorOrSelf(angular.element(event.target), element)) {
                        scope.$apply(function () {
                            outerClickFn(scope, {
                                $event: event
                            });
                        });
                    }
                };

                var stopWatching = angular.noop;
                var t = null;

                if (outerClickIf) {
                    stopWatching = scope.$watch(
						outerClickIf,
						function (value) {
							$timeout.cancel(t);
	
							if (value) {
								// prevents race conditions
								// activating with other click events
								t = $timeout(
									function () {
										$document.on('click tap', handleOuterClick);
									},
									0,
									false
								);
	
							} else {
								$document.unbind('click tap', handleOuterClick);
							}
						}
					);
                } else {
                    $timeout.cancel(t);
                    $document.on('click tap', handleOuterClick);
                }

                scope.$on('$destroy', function () {
                    stopWatching();
                    $document.unbind('click tap', handleOuterClick);
                });
            };
        }
    ]).directive(
        'uiOuterClickIf',
        function () {
            return {
                restrict: 'A'
            };
        }
    ).directive(
        'uiOuterClick',
        ['bindOuterClick', '$parse', function (bindOuterClick, $parse) {
            return {
                restrict: 'A',
                compile: function (elem, attrs) {
                    var outerClickFn = $parse(attrs.uiOuterClick);
                    var outerClickIf = attrs.uiOuterClickIf;
                    return function (scope, elem) {
                        bindOuterClick(scope, elem, outerClickFn, outerClickIf);
                    };
                }
            };
        }
    ]);

    shared_state_module = angular.module(
        'ng.mobile.core.sharedState',
        ['ng']
    ).factory(
        'SharedState',
        ['$rootScope', '$log', function ($rootScope, $log) {
            var values = {}; // values, context object for evals
            var statusesMeta = {}; // status info
            var scopes = {}; // scopes references
            var exclusionGroups = {}; // support exclusive boolean sets

            return {

                initialize: function (scope, id, options) {
                    options = options || {};

                    var isNewScope = scopes[scope] === undefined;
                    var defaultValue = options.defaultValue;
                    var exclusionGroup = options.exclusionGroup;

                    scopes[scope.$id] = scopes[scope.$id] || [];
                    scopes[scope.$id].push(id);

                    if (!statusesMeta[id]) { // is a brand new state
                        // not referenced by any
                        // scope currently

                        statusesMeta[id] = angular.extend({}, options, {
                            references: 1
                        });

                        $rootScope.$broadcast('mobile-angular-ui.state.initialized.' + id, defaultValue);

                        if (defaultValue !== undefined) {
                            this.setOne(id, defaultValue);
                        }

                        if (exclusionGroup) {
                            // Exclusion groups are sets of statuses references
                            exclusionGroups[exclusionGroup] = exclusionGroups[exclusionGroup] || {};
                            exclusionGroups[exclusionGroup][id] = true;
                        }

                    } else if (isNewScope) { // is a new reference from
                        // a different scope
                        statusesMeta[id].references++;
                    }
                    scope.$on('$destroy', function () {
                        var ids = scopes[scope.$id] || [];
                        for (var i = 0; i < ids.length; i++) {
                            var status = statusesMeta[ids[i]];

                            if (status.exclusionGroup) {
                                delete exclusionGroups[status.exclusionGroup][ids[i]];
                                if (Object.keys(exclusionGroups[status.exclusionGroup]).length === 0) {
                                    delete exclusionGroups[status.exclusionGroup];
                                }
                            }

                            status.references--;
                            if (status.references <= 0) {
                                delete statusesMeta[ids[i]];
                                delete values[ids[i]];
                                $rootScope.$broadcast('mobile-angular-ui.state.destroyed.' + id);
                            }
                        }
                        delete scopes[scope.$id];
                    });
                },

                setOne: function (id, value) {
                    if (statusesMeta[id] !== undefined) {
                        var prev = values[id];
                        values[id] = value;
                        if (prev !== value) {
                            $rootScope.$broadcast('mobile-angular-ui.state.changed.' + id, value, prev);
                        }
                        return value;
                    }
                    $log.warn('Warning: Attempt to set uninitialized shared state: ' + id);
                    return undefined;
                },

                setMany: function (map) {
                    angular.forEach(map, function (value, id) {
                        this.setOne(id, value);
                    }, this);
                },

                set: function (idOrMap, value) {
                    if (!idOrMap) {
                        return;
                    } else if (angular.isObject(idOrMap)) {
                        this.setMany(idOrMap);
                    } else {
                        this.setOne(idOrMap, value);
                    }
                },

                turnOn: function (id) {
                    // Turns off other statuses belonging to the same exclusion group.
                    var eg = statusesMeta[id] && statusesMeta[id].exclusionGroup;
                    if (eg) {
                        var egStatuses = Object.keys(exclusionGroups[eg]);
                        for (var i = 0; i < egStatuses.length; i++) {
                            var item = egStatuses[i];
                            if (item !== id) {
                                this.turnOff(item);
                            }
                        }
                    }
                    return this.setOne(id, true);
                },

                turnOff: function (id) {
                    return this.setOne(id, false);
                },

                toggle: function (id) {
                    return this.get(id) ? this.turnOff(id) : this.turnOn(id);
                },

                get: function (id) {
                    return statusesMeta[id] && values[id];
                },

                isActive: function (id) {
                    return Boolean(this.get(id));
                },

                active: function (id) {
                    return this.isActive(id);
                },

                isUndefined: function (id) {
                    return statusesMeta[id] === undefined || this.get(id) === undefined;
                },

                has: function (id) {
                    return statusesMeta[id] !== undefined;
                },

                referenceCount: function (id) {
                    var status = statusesMeta[id];
                    return status === undefined ? 0 : status.references;
                },

                equals: function (id, value) {
                    return this.get(id) === value;
                },

                eq: function (id, value) {
                    return this.equals(id, value);
                },

                values: function () {
                    return values;
                },

                exclusionGroups: function () {
                    return exclusionGroups;
                }
            };
        }
    ]);

	// Used to declare value used below...for better debugging.
	shared_state_module.directive(
		'uiExclusionGroup',
		function () {
			return {
				restrict: 'A'
			};
		}
	).directive(
		'uiDefault',
		function () {
			return {
				restrict: 'A'
			};
		}
	);

    shared_state_module.directive(
        'uiSharedState',
        ['SharedState', function (SharedState) {
            return {
                restrict: 'EA',
                priority: 601, // more than ng-if
                link: function (scope, elem, attrs) {
                    var id = attrs.uiSharedState || attrs.id;
                    var defaultValueExpr = attrs.uiDefault;
                    var defaultValue = defaultValueExpr ? scope.$eval(defaultValueExpr) : undefined;

                    SharedState.initialize(scope, id, {
                        defaultValue: defaultValue,
                        exclusionGroup: attrs.uiExclusionGroup
                    });
                }
            };
        }]
    );

    uiBindEvent = function (scope, element, eventNames, fn) {
        eventNames = eventNames || 'click tap';

        element.on(
            eventNames,
            function (event) {
                scope.$apply(
                    function () {
                        fn(scope, { $event: event });
                    }
                );
            }
        );
    };

    angular.forEach(
        ['toggle', 'turnOn', 'turnOff', 'set'],
        function (methodName) {
            var directiveName = 'ui' + methodName[0].toUpperCase() + methodName.slice(1);

            shared_state_module.directive(directiveName, [
                '$parse',
                '$interpolate',
                'SharedState',
                function ($parse, $interpolate, SharedState) {
                    var method = SharedState[methodName];
                    return {
                        restrict: 'A',
                        priority: 1, // This would make postLink calls happen after ngClick
                        // (and similar) ones, thus intercepting events after them.
                        //
                        // This will prevent eventual ng-if to detach elements
                        // before ng-click fires.

                        compile: function (elem, attrs) {
                            var attr = attrs[directiveName];
                            var needsInterpolation = attr.match(/\{\{/);

                            var exprFn = function ($scope) {
                                var res = attr;
                                if (needsInterpolation) {
                                    var interpolateFn = $interpolate(res);
                                    res = interpolateFn($scope);
                                }
                                if (methodName === 'set') {
                                    res = ($parse(res))($scope);
                                }
                                return res;
                            };

                            return function (scope, elem, attrs) {
                                var callback = function () {
                                        var arg = exprFn(scope);
                                        return method.call(SharedState, arg);
                                    };

                                uiBindEvent(scope, elem, attrs.uiTriggers, callback);
                            };
                        }
                    };
                }
            ]);
        }
    );

    parseScopeContext = function (attr) {
        if (!attr || attr === '') {
            return [];
        }
        var vars = attr ? attr.trim().split(/ *, */) : [];
        var res = [];
        for (var i = 0; i < vars.length; i++) {
            var item = vars[i].split(/ *as */);
            if (item.length > 2 || item.length < 1) {
                throw new Error('Error parsing uiScopeContext="' + attr + '"');
            }
            res.push(item);
        }
        return res;
    };

    mixScopeContext = function (context, scopeVars, scope) {
        for (var i = 0; i < scopeVars.length; i++) {
            var key = scopeVars[i][0];
            var alias = scopeVars[i][1] || key;
            context[alias] = key.split('.').reduce(function (scope, nextKey) {
                return scope[nextKey];
            }, scope);
        }
    };

    parseUiCondition = function (name, attrs, $scope, SharedState, $parse, $interpolate) {
        var expr = attrs[name];
        var needsInterpolation = expr.match(/\{\{/);
        var exprFn;

        if (needsInterpolation) {
            exprFn = function (context) {
                var interpolateFn = $interpolate(expr);
                var parseFn = $parse(interpolateFn($scope));
                return parseFn(context);
            };
        } else {
            exprFn = $parse(expr);
        }

        var uiScopeContext = parseScopeContext(attrs.uiScopeContext);
        return function () {
            var context;
            if (uiScopeContext.length) {
                context = angular.extend({}, SharedState.values());
                mixScopeContext(context, uiScopeContext, $scope);
            } else {
                context = SharedState.values();
            }
            return exprFn(context);
        };
    };

    shared_state_module.directive(
        'uiIf',
        ['$animate', 'SharedState', '$parse', '$interpolate', function ($animate, SharedState, $parse, $interpolate) {

            function getBlockNodes(nodes) {
                var node = nodes[0];
                var endNode = nodes[nodes.length - 1];
                var blockNodes = [node];
                do {
                    node = node.nextSibling;
                    if (!node) {
                        break;
                    }
                    blockNodes.push(node);
                } while (node !== endNode);

                return angular.element(blockNodes);
            }

            return {
                multiElement: true,
                transclude: 'element',
                priority: 600,
                terminal: true,
                restrict: 'A',
                $$tlb: true,
                link: function ($scope, $element, $attr, ctrl, $transclude) {
                    var block;
                    var childScope;
                    var previousElements;
                    var uiIfFn = parseUiCondition('uiIf', $attr, $scope, SharedState, $parse, $interpolate);

                    $scope.$watch(
						uiIfFn,
						function uiIfWatchAction(value) {
							if (value) {
								if (!childScope) {
									$transclude(
										undefined,		// no scope
										function ngMobileUiIfTransclude(clone, newScope) {
											childScope = newScope;
											clone[clone.length++] = document.createComment(' end uiIf: ' + $attr.uiIf + ' ');
											// Note: We only need the first/last node of the cloned nodes.
											// However, we need to keep the reference to the jqlite wrapper as it might be changed later
											// by a directive with templateUrl when its template arrives.
											block = { clone: clone };
											$animate.enter(clone, $element.parent(), $element);
										}
									);
								}
							} else {
								if (previousElements) {
									previousElements.remove();
									previousElements = null;
								}
								if (childScope) {
									childScope.$destroy();
									childScope = null;
								}
								if (block) {
									previousElements = getBlockNodes(block.clone);
									var done = function () {
										previousElements = null;
									};
									var nga = $animate.leave(previousElements, done);
									if (nga) {
										nga.then(done);
									}
									block = null;
								}
							}
						}
					);
                }
            };
        }]
    );

    shared_state_module.directive(
        'uiHide',
        ['$animate', 'SharedState', '$parse', '$interpolate', function ($animate, SharedState, $parse, $interpolate) {
            var NG_HIDE_CLASS = 'ng-hide';
            var NG_HIDE_IN_PROGRESS_CLASS = 'ng-hide-animate';

            return {
                restrict: 'A',
                multiElement: true,
                link: function (scope, element, attr) {
                    var uiHideFn = parseUiCondition('uiHide', attr, scope, SharedState, $parse, $interpolate);
                    scope.$watch(
						uiHideFn,
						function uiHideWatchAction(value) {
							$animate[value ? 'addClass' : 'removeClass'](element, NG_HIDE_CLASS, { tempClasses: NG_HIDE_IN_PROGRESS_CLASS });
						}
					);
                }
            };
        }]
    );

    shared_state_module.directive(
        'uiShow',
        ['$animate', 'SharedState', '$parse', '$interpolate', function ($animate, SharedState, $parse) {
            var NG_HIDE_CLASS = 'ng-hide';
            var NG_HIDE_IN_PROGRESS_CLASS = 'ng-hide-animate';

            return {
                restrict: 'A',
                multiElement: true,
                link: function (scope, element, attr) {
                    var uiShowFn = parseUiCondition('uiShow', attr, scope, SharedState, $parse);
                    scope.$watch(
						uiShowFn,
						function uiShowWatchAction(value) {
							$animate[value ? 'removeClass' : 'addClass'](element, NG_HIDE_CLASS, { tempClasses: NG_HIDE_IN_PROGRESS_CLASS });
						}
					);
                }
            };
        }]
    );

    shared_state_module.directive(
        'uiClass',
        ['SharedState', '$parse', '$interpolate', function (SharedState, $parse) {
            return {
                restrict: 'A',
                link: function (scope, element, attr) {
                    var uiClassFn = parseUiCondition('uiClass', attr, scope, SharedState, $parse);
                    scope.$watch(
						uiClassFn,
						function uiClassWatchAction(value) {
							var classesToAdd = '';
							var classesToRemove = '';

							angular.forEach(value, function (expr, className) {
								if (expr) {
									classesToAdd += ' ' + className;
								} else {
									classesToRemove += ' ' + className;
								}
								classesToAdd = classesToAdd.trim();
								classesToRemove = classesToRemove.trim();
								if (classesToAdd.length) {
									element.addClass(classesToAdd);
								}
								if (classesToRemove.length) {
									element.removeClass(classesToRemove);
								}
							});
						},
						true
					);
                }
            };
        }]
    );

    shared_state_module.run(
        ['$rootScope', 'SharedState', function ($rootScope, SharedState) {
            $rootScope.Ui = SharedState;
        }]
    );

    // Dumby directive (does nothing for desktop)
    angular.module(
        'ng.mobile.core.touchmoveDefaults',
        ['ng']
    ).directive(
        'uiPreventTouchmoveDefaults',
        function () {
			return {
				restrict: 'A'
			};
		}
    ).factory(
        'allowTouchmoveDefault',
        function () {
            return angular.noop;
        }
    );

    // Dumby directive (does nothing for desktop)
    var swipe_module = angular.module('ng.mobile.gestures.swipe', ['ng']);

    swipe_module.factory(
        '$swipe',
        function () {
            return {
                bind: function () {
                    return undefined;
                }
            };
        }
    );

    angular.forEach(
        ['ui', 'ng'],
        function (prefix) {
            angular.forEach(
                ['Left', 'Right'],
                function (direction) {
                    var directiveName = prefix + 'Swipe' + direction,
                        swipe_dir;

                    swipe_dir = function ($swipe, $parse) {
                        return {
                            link: function (scope, elem, attrs) { return undefined; }
                        };
                    }

                    swipe_dir.$$moduleName = 'ng/mobile/gestures';

                    swipe_module.directive(
                        directiveName,
                        ['$swipe', '$parse', swipe_dir]
                );
            });
        }
    );

    // Dumby directive (does nothing for desktop)
    angular.module(
        'ng.mobile.gestures.drag',
        ['ng']
    ).factory(
        '$drag',
        function () {
            return {
                bind: function () {
                    return undefined;
                }
            };
        }
    );

    angular.module('ng.mobile.core', [
        'ng.mobile.core.fastclick',
        'ng.mobile.core.activeLinks',
        'ng.mobile.core.capture',
        'ng.mobile.core.outerClick',
        'ng.mobile.core.sharedState',
        'ng.mobile.core.touchmoveDefaults',
        'ng.mobile.gestures.swipe',
        'ng.mobile.gestures.drag'
    ]);

}());
