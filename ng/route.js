
/**
 * @license AngularJS v1.3.0
 * (c) 2010-2014 Google, Inc. http://angularjs.org
 * License: MIT
 *
 * Originally derived from v1.3.0,
 *       with updates from v1.3.3, thru v1.7.2,
 */

/*global
    msos: false,
    _: false,
    ng: false
*/

msos.provide("ng.route");

ng.route.version = new msos.set_version(18, 7, 4);


(function (w_angular, w_msos) {
    'use strict';

    var ngRouteModule,
        $routeMinErr = w_angular.$$minErr('ng.route'),
        isEagerInstantiationEnabled = true,
        vb_rt = false;

    if (w_msos.config.verbose === 'route') { vb_rt = true; }

	function routeToRegExp(path, opts) {
		var keys = [],
			pattern = path
				.replace(/([().])/g, '\\$1')
				.replace(/(\/)?:(\w+)(\*\?|[?*])?/g, function (_, slash, key, option) {
					var optional = option === '?' || option === '*?',
						star = option === '*' || option === '*?';

					keys.push({name: key, optional: optional});
					slash = slash || '';

					return (
						(optional ? '(?:' + slash : slash + '(?:') +
						(star ? '(.+?)' : '([^/]+)') +
						(optional ? '?)?' : ')')
					);
				})
				.replace(/([/$*])/g, '\\$1');

		if (opts.ignoreTrailingSlashes) {
			pattern = pattern.replace(/\/+$/, '') + '/*';
		}

		return {
			keys: keys,
			regexp: new RegExp(
				'^' + pattern + '(?:[?#]|$)',
				opts.caseInsensitiveMatch ? 'i' : ''
			)
		};
	}

    function $RouteProvider() {
        var routes = {},
            temp_rt = 'ng.route - $RouteProvider';

        function inherit(parent, extra) {
            return w_angular.extend(
                Object.create(parent),
                extra
            );
        }

        this.caseInsensitiveMatch = false;

        this.when = function (path, route) {
            var temp_w = ' - when -> ',
                redirectPath,
                routeCopy = w_angular.shallowCopy(route);

            if (vb_rt) {
                w_msos.console.debug(temp_rt + temp_w + 'start, path: ' + (path || 'na') + ', routeCopy:', routeCopy);
            }

			if (_.isUndefined(routeCopy.reloadOnUrl)) {
				routeCopy.reloadOnUrl = true;
			}

            if (_.isUndefined(routeCopy.reloadOnSearch)) {
                routeCopy.reloadOnSearch = true;
            }

            if (_.isUndefined(routeCopy.caseInsensitiveMatch)) {
                routeCopy.caseInsensitiveMatch = this.caseInsensitiveMatch;
            }

			routes[path] = w_angular.extend(
				routeCopy,
				{ originalPath: path },
				path && routeToRegExp(path, routeCopy)
			);

            // create redirection for trailing slashes
            if (path) {
                redirectPath = (path[path.length - 1] === '/') ? path.substr(0, path.length - 1) : path + '/';

				routes[redirectPath] = w_angular.extend(
					{ originalPath: path, redirectTo: path },
					routeToRegExp(redirectPath, routeCopy)
				);
            }

            if (vb_rt) {
                w_msos.console.debug(temp_rt + temp_w + 'done, redirectPath: ' + (redirectPath || 'na'));
            }

            return this;
        };

        this.otherwise = function (params) {
            if (typeof params === 'string') {
                params = { redirectTo: params };
            }

            this.when(null, params);
            return this;
        };

        this.eagerInstantiationEnabled = function eagerInstantiationEnabled(enabled) {
            if (w_angular.isDefined(enabled)) {
                isEagerInstantiationEnabled = enabled;
                return this;
            }

            return isEagerInstantiationEnabled;
        };

        this.$get = ['$rootScope', '$location', '$routeParams', '$q', '$injector', '$templateRequest', '$sce', '$browser',
            function ($rootScope,   $location,   $routeParams,   $q,   $injector,   $templateRequest,   $sce,   $browser) {

            var forceReload = false,
                preparedRoute,
                preparedRouteIsUpdateOnly,
                $route;

            function interpolate(string, params) {
                var result = [];

                w_angular.forEach(
                    (string || '').split(':'),
                    function (segment, i) {
                        var segmentMatch,
                            key;

                        if (i === 0) {
                            result.push(segment);
                        } else {
                            segmentMatch = segment.match(/(\w+)(?:[?*])?(.*)/);
                            key = segmentMatch[1];

                            result.push(params[key]);
                            result.push(segmentMatch[2] || '');
                            delete params[key];
                        }
                    }
                );

                return result.join('');
            }

            function switchRouteMatcher(on, route) {
                var route_keys = route.keys,
                    params = {},
                    m,
                    i = 0,
                    key,
                    val;

                if (!route.regexp) { return null; }

                m = route.regexp.exec(on);

                if (!m) { return null; }

                for (i = 1; i < m.length; i += 1) {
                    key = route_keys[i - 1];

                    val = m[i];

                    if (key && val) { params[key.name] = val; }
                }
                return params;
            }

            function parseRoute() {
                // Match a route
                var temp_pa = ' - $get - parseRoute -> ',
                    params,
                    match;

                if (w_msos.config.verbose) {
                    w_msos.console.debug(temp_rt + temp_pa + 'start.');
                }

                w_angular.forEach(
                    routes,
                    function (route) {
                        if (!match) {
                            params = switchRouteMatcher($location.path(), route);
                            if (params) {
                                match = inherit(
                                    route,
                                    {
                                        params: w_angular.extend(
                                            {},
                                            $location.$$search,      // Eperimental, was $location.search()
                                            params
                                        ),
                                        pathParams: params
                                    }
                                );
                                match.$$route = route;
                            }
                        }
                    }
                );

                if (w_msos.config.verbose) {
                    w_msos.console.debug(temp_rt + temp_pa + ' done!');
                }
                // No route matched; fallback to "otherwise" route
                return match || (routes[null] && inherit(routes[null], { params: {}, pathParams: {} }));
            }

			function isNavigationUpdateOnly(newRoute, oldRoute) {
				// IF this is not a forced reload
				return !forceReload && newRoute && oldRoute && (newRoute.$$route === oldRoute.$$route) && (!newRoute.reloadOnUrl || (!newRoute.reloadOnSearch && angular.equals(newRoute.pathParams, oldRoute.pathParams)));
			}

            function prepareRoute($locationEvent) {
                var temp_pr = ' - $get - prepareRoute -> ',
                    lastRoute = $route.current;

                w_msos.console.debug(temp_rt + temp_pr + 'start.');

                preparedRoute = parseRoute();
                preparedRouteIsUpdateOnly = isNavigationUpdateOnly(preparedRoute, lastRoute);

                if (!preparedRouteIsUpdateOnly && (lastRoute || preparedRoute)) {
                    if ($rootScope.$broadcast('$routeChangeStart', preparedRoute, lastRoute).defaultPrevented) {
                        if ($locationEvent) {
                            $locationEvent.preventDefault();
                        }
                    }
                }

                w_msos.console.debug(temp_rt + temp_pr + 'done!');
            }

            function getTemplateFor(route) {
                var template,
                    templateUrl;

                if (w_angular.isDefined(template = route.template)) {

                    if (w_angular.isFunction(template)) {
                        template = template(route.params);
                    }

                } else if (w_angular.isDefined(templateUrl = route.templateUrl)) {

                    if (w_angular.isFunction(templateUrl)) {
                        templateUrl = templateUrl(route.params);
                    }

                    if (w_angular.isDefined(templateUrl)) {
                        route.loadedTemplateUrl = $sce.valueOf(templateUrl);
                        template = $templateRequest(templateUrl);
                    }
                }

                return template;
            }

            function resolveLocals(route) {
                var locals,
                    template;

                if (route) {
                    locals = w_angular.extend({}, route.resolve);

                    w_angular.forEach(
                        locals,
                        function (value, key) {
                            locals[key] = w_angular.isString(value) ? $injector.get(value) : $injector.invoke(value, null, null, key);
                        }
                    );

                    template = getTemplateFor(route);

                    if (w_angular.isDefined(template)) {
                        locals.$template = template;
                    }

                    return $q.all($q.defer('ng_route_all_resolveLocals'), locals);
                }

                return undefined;
            }

            function getRedirectionData(route) {
                var data = {
                        route: route,
                        hasRedirection: false
                    },
                    oldPath,
                    oldSearch,
                    newUrl;

                if (route) {
                    if (route.redirectTo) {
                        if (w_angular.isString(route.redirectTo)) {
                            data.path = interpolate(route.redirectTo, route.params);
                            data.search = route.params;
                            data.hasRedirection = true;
                        } else {
                            oldPath = $location.path();
                            oldSearch = $location.$$search;      // Eperimental, was $location.search()
                            newUrl = route.redirectTo(route.pathParams, oldPath, oldSearch);

                            if (w_angular.isDefined(newUrl)) {
                                data.url = newUrl;
                                data.hasRedirection = true;
                            }
                        }
                    } else if (route.resolveRedirectTo) {
                        return $q.resolve(
                                    $injector.invoke(route.resolveRedirectTo)
                                ).then(
                                    function (newUrl) {
                                        if (w_angular.isDefined(newUrl)) {
                                            data.url = newUrl;
                                            data.hasRedirection = true;
                                        }

                                        return data;
                                    }
                                );
                    }
                }

                return data;
            }

            function handlePossibleRedirection(data) {
                var keepProcessingRoute = true,
                    oldUrl,
                    newUrl;

                if (data.route !== $route.current) {
                    keepProcessingRoute = false;
                } else if (data.hasRedirection) {

                    oldUrl = $location.url();
                    newUrl = data.url;

                    if (newUrl) {
                        $location.url(newUrl).replace();
                    } else {
                        newUrl = $location.path(data.path).search(data.search).replace().url();
                    }

                    if (newUrl !== oldUrl) {
                        keepProcessingRoute = false;
                    }
                }

                return keepProcessingRoute;
            }

            function commitRoute() {
                var temp_cr = ' - $get - commitRoute -> ',
                    lastRoute = $route.current,
                    nextRoute = preparedRoute,
                    nextRoutePromise;

                w_msos.console.debug(temp_rt + temp_cr + 'start.');

				function commit_route_noop() {
					w_msos.console.debug(temp_rt + temp_cr + 'finally completed.');
				}

                if (preparedRouteIsUpdateOnly) {
                    lastRoute.params = nextRoute.params;
                    w_angular.copy(lastRoute.params, $routeParams);
                    $rootScope.$broadcast('$routeUpdate', lastRoute);
                } else if (nextRoute || lastRoute) {
                    forceReload = false;
                    $route.current = nextRoute;

                    nextRoutePromise = $q.when($q.defer('ng_route_when_commitRoute'), nextRoute);
					$browser.$$incOutstandingRequestCount('$route');

                    nextRoutePromise.then(
                        getRedirectionData
                    ).then(
                        handlePossibleRedirection
                    ).then(
                        function (keepProcessingRoute) {
                            return keepProcessingRoute && nextRoutePromise.then(
                                        resolveLocals
                                    ).then(
                                        function (locals) {
                                            // after route change
                                            if (nextRoute === $route.current) {
                                                if (nextRoute) {
                                                    nextRoute.locals = locals;
                                                    w_angular.copy(nextRoute.params, $routeParams);
                                                }
                                                $rootScope.$broadcast(
                                                    '$routeChangeSuccess',
                                                    nextRoute,
                                                    lastRoute
                                                );
                                            }
                                        }
                                    );
                        }).catch(
                            function (error) {
                                if (nextRoute === $route.current) {
                                    $rootScope.$broadcast(
                                        '$routeChangeError',
                                        nextRoute,
                                        lastRoute,
                                        error
                                    );
                                }
                            }
                        ).finally(
							function () { $browser.$$completeOutstandingRequest(commit_route_noop, '$route'); }
						);
                }

                w_msos.console.debug(temp_rt + temp_cr + 'done!');
            }

            $route = {
                routes: routes,

                reload: function () {
                    forceReload = true;
                    $rootScope.$evalAsync(
                        function () {
                            w_msos.console.debug(temp_rt + ' - $get - $route - reload -> start.');
                            // Don't support cancellation of a reload for now...
                            prepareRoute();
                            commitRoute();

                            w_msos.console.debug(temp_rt + ' - $get - $route - reload -> done!');
                        }
                    );
                },

                updateParams: function (newParams) {

                    w_msos.console.debug(temp_rt + ' - $get - $route - updateParams -> start.');

                    if (this.current && this.current.$$route) {
                        newParams = w_angular.extend({}, this.current.params, newParams);

                        $location.path(interpolate(this.current.$$route.originalPath, newParams));
                        $location.search(newParams);

                    } else {
                        throw $routeMinErr(
                            'norout',
                            'Tried updating route with no current route'
                        );
                    }
                     w_msos.console.debug(temp_rt + ' - $get - $route - updateParams ->  done!');
                }
            };

            $rootScope.$on('$locationChangeStart',      prepareRoute);
            $rootScope.$on('$locationChangeSuccess',    commitRoute);

            return $route;
        }];
    }

    function $RouteParamsProvider() {
        this.$get = function () { return {}; };
    }

    function $RouteScrollProvider() {

        this.$get = ['$timeout', function ($timeout) {

            return function ($element) {
                return $timeout(
					function () { $element[0].scrollIntoView(); },
					0,
					false
				);
            };
        }];
    }

    function ngViewFactory($route, $animate, $routeViewScroll) {
        var temp_vf = 'ng.route - ngViewFactory - link';

        return {
            restrict: 'ECA',
            terminal: true,
            priority: 400,
            transclude: 'element',
            link: function (scope, $element, attr, ctrl_na, $transclude) {
                var currentScope,
                    currentElement,
                    previousLeaveAnimation,
                    autoScrollExp = attr.autoscroll,
                    onloadExp = attr.onload || '';

                msos.console.debug(temp_vf + ' -> start.');

                function cleanupLastView() {
                    if (previousLeaveAnimation) {
                        $animate.cancel(previousLeaveAnimation);
                        previousLeaveAnimation = null;
                    }

                    if (currentScope) {
                        currentScope.$destroy();
                        currentScope = null;
                    }

                    if (currentElement) {
                        previousLeaveAnimation = $animate.leave(currentElement);
                        previousLeaveAnimation.done(
                            function (response) {
                                if (response !== false) { previousLeaveAnimation = null; }
                            }
                        );

                        currentElement = null;
                    }
                }

                function update() {
                    var locals = $route.current && $route.current.locals,
                        template = locals && locals.$template,
                        newScope,
                        current,
                        clone;

                    msos.console.debug(temp_vf + ' - update -> start.');

                    if (w_angular.isDefined(template)) {

                        newScope = scope.$new();
                        current = $route.current;

                        clone = $transclude(
                            newScope,
                            function ngRouteViewTransclude(clone) {
                                $animate.enter(
                                    clone,
                                    null,
                                    currentElement || $element).done(
                                        function onNgViewEnter(response) {
                                            if (response !== false && w_angular.isDefined(autoScrollExp) && (!autoScrollExp || scope.$eval(autoScrollExp))) {
                                                // $anchorScroll();
                                                $routeViewScroll();
                                            }
                                        }
                                    );

                                cleanupLastView();
                            }
                        );

                        currentElement = clone;
                        currentScope = current.scope = newScope;
                        currentScope.$emit('$viewContentLoaded');

                        // MSOS: don't bother with noop
                        if (onloadExp && onloadExp !== w_angular.noop) {
                            currentScope.$eval(onloadExp);
                        }

                    } else {
                        cleanupLastView();
                    }

                    msos.console.debug(temp_vf + ' - update ->  done!');
                }

                scope.$on('$routeChangeSuccess', update);
                update();

                msos.console.debug(temp_vf + ' -> done.');
            }
        };
    }

    function ngViewControllerFactory($compile, $controller, $route) {
        return {
            restrict: 'ECA',
            priority: -400,
            link: function (scope, $element) {
                var temp_nc = 'ng.route - ngViewControllerFactory -> ',
                    current = $route.current,
                    locals = current.locals,
                    link,
                    controller;

                msos.console.debug(temp_nc + 'start.');

                $element.html(locals.$template);

                link = $compile($element.contents());

                if (current.controller) {

                    msos.console.debug(temp_nc + 'has current controller: ' + current.controller);

                    locals.$scope = scope;
                    controller = $controller(current.controller, locals, false, current);

                    $element.data('$ngControllerController', controller);
                    $element.children().data('$ngControllerController', controller);
                }

                link(scope);

                msos.console.debug(temp_nc + 'done!');
            }
        };
    }

    function instantiateRoute($injector) {
        if (isEagerInstantiationEnabled) {
            w_msos.console.debug('ng.route - instantiateRoute -> eager enabled.');
            $injector.get('$route');
        }
    }

    ngRouteModule = w_angular.module(
        'ng.route',
        ['ng']
    ).provider(
        '$route',
        $RouteProvider
    ).provider(
        '$routeParams',
        $RouteParamsProvider
    ).provider(
        '$routeViewScroll',
        $RouteScrollProvider
    ).directive(
        'ngView',
        ['$route', '$animate', '$routeViewScroll', ngViewFactory]
    ).directive(
        'ngView',
        ['$compile', '$controller', '$route', ngViewControllerFactory]
    ).run(
        ['$injector', instantiateRoute]
    );

}(window.angular, window.msos));
