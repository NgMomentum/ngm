/**
 * @license AngularJS v1.3.0
 * (c) 2010-2014 Google, Inc. http://angularjs.org
 * License: MIT
 *
 * Originally derived from v1.3.0,
 *       with updates from v1.3.3, thru v1.5.0,
 */

/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false
*/

msos.provide("ng.route");


(function (w_angular, w_msos) {
    'use strict';

    var ngRouteModule,
        $routeMinErr = w_angular.$$minErr('ngRoute'),
        vb_rt = false;

    if (w_msos.config.verbose === 'route') { vb_rt = true; }

    function $RouteProvider() {
        var routes = {},
            temp_rt = 'ng/route - $RouteProvider';

        function inherit(parent, extra) {
            return w_angular.extend(
                Object.create(parent),
                extra
            );
        }

        function pathRegExp(path, opts) {
            var insensitive = opts.caseInsensitiveMatch,
                ret = {
                    originalPath: path,
                    regexp: path
                },
                ret_keys = ret.keys = [];   // must be same ref. (added ret_keys to help see var)

            path = path.replace(/([().])/g, '\\$1').replace(
                /(\/)?:(\w+)([\?\*])?/g,
                function (dumby, slash, key, option) {
                    var optional =  option === '?' ? option : null,
                        star =      option === '*' ? option : null;

                    ret_keys.push({
                        name: key,
                        optional: !!optional
                    });

                    slash = slash || '';

                    return (optional ? '' : slash)
                        + '(?:'
                        + (optional ? slash : '')
                        + (star ? '(.+?)' : '([^/]+)')
                        + (optional || '')
                        + ')'
                        + (optional || '');
                }
            ).replace(/([\/$\*])/g, '\\$1');

            ret.regexp = new RegExp('^' + path + '$', insensitive ? 'i' : '');

            return ret;
        }

        this.caseInsensitiveMatch = false;

        this.when = function (path, route) {
            var temp_w = ' - when -> ',
                redirectPath,
                rCopy = w_angular.copy(route);

            if (vb_rt) {
                w_msos.console.debug(temp_rt + temp_w + 'start, path: ' + (path || 'na') + ', rCopy:', rCopy);
            }

            if (_.isUndefined(rCopy.reloadOnSearch)) {
                rCopy.reloadOnSearch = true;
            }

            if (_.isUndefined(rCopy.caseInsensitiveMatch)) {
                rCopy.caseInsensitiveMatch = this.caseInsensitiveMatch;
            }

            routes[path] = w_angular.extend(
                rCopy,
                path && pathRegExp(path, rCopy)
            );

            // create redirection for trailing slashes
            if (path) {
                redirectPath = (path[path.length - 1] === '/')
                    ? path.substr(0, path.length - 1)
                    : path + '/';

                routes[redirectPath] = w_angular.extend(
                    { redirectTo: path },
                    pathRegExp(redirectPath, rCopy)
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

        this.$get = ['$rootScope', '$location', '$routeParams', '$q', '$injector', '$templateRequest', '$sce',
            function ($rootScope,   $location,   $routeParams,   $q,   $injector,   $templateRequest,   $sce) {

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

            function prepareRoute($locationEvent) {
                var temp_pr = ' - $get - prepareRoute -> ',
                    lastRoute = $route.current;

                w_msos.console.debug(temp_rt + temp_pr + 'start.');

                preparedRoute = parseRoute();
                preparedRouteIsUpdateOnly = preparedRoute && lastRoute && preparedRoute.$$route === lastRoute.$$route && w_angular.equals(preparedRoute.pathParams, lastRoute.pathParams) && !preparedRoute.reloadOnSearch && !forceReload;

                if (!preparedRouteIsUpdateOnly && (lastRoute || preparedRoute)) {
                    if ($rootScope.$broadcast('$routeChangeStart', preparedRoute, lastRoute).defaultPrevented) {
                        if ($locationEvent) {
                            $locationEvent.preventDefault();
                        }
                    }
                }

                w_msos.console.debug(temp_rt + temp_pr + 'done!');
            }

            function commitRoute() {
                var temp_cr = ' - $get - commitRoute -> ',
                    lastRoute = $route.current,
                    nextRoute = preparedRoute;

                w_msos.console.debug(temp_rt + temp_cr + 'start.');

                if (preparedRouteIsUpdateOnly) {
                    lastRoute.params = nextRoute.params;
                    w_angular.copy(lastRoute.params, $routeParams);
                    $rootScope.$broadcast('$routeUpdate', lastRoute);
                } else if (nextRoute || lastRoute) {
                    forceReload = false;
                    $route.current = nextRoute;
                    if (nextRoute) {
                        if (nextRoute.redirectTo) {
                            w_msos.console.debug(temp_rt + temp_cr + 'redirect.');
                            if (w_angular.isString(nextRoute.redirectTo)) {
                                $location.path(interpolate(nextRoute.redirectTo, nextRoute.params)).search(nextRoute.params).replace();
                            } else {
                                $location.url(nextRoute.redirectTo(
                                    nextRoute.pathParams,
                                    $location.path(),
                                    $location.$$search      // Eperimental, was $location.search()
                                )).replace();
                            }
                        }
                    }

                    $q.when($q.defer('ng_route_when_commitRoute'), nextRoute).then(
                        function () {
                            if (nextRoute) {
                                var locals = w_angular.extend(
                                        {},
                                        nextRoute.resolve
                                    ),
                                    template, templateUrl;

                                w_angular.forEach(
                                    locals,
                                    function (value, key) {
                                        locals[key] = w_angular.isString(value) ? $injector.get(value) : $injector.invoke(value, null, null, key);
                                    }
                                );

                                template = nextRoute.template;

                                if (w_angular.isDefined(template)) {
                                    if (_.isFunction(template)) {
                                        template = template(nextRoute.params);
                                    }
                                } else {
                                    templateUrl = nextRoute.templateUrl;
                                    if (w_angular.isDefined(templateUrl)) {

                                        if (_.isFunction(templateUrl)) {
                                            templateUrl = templateUrl(nextRoute.params);
                                        }

                                        if (w_angular.isDefined(templateUrl)) {
                                            nextRoute.loadedTemplateUrl = $sce.valueOf(templateUrl);
                                            template = $templateRequest(templateUrl);
                                        }
                                    }
                                }

                                if (w_angular.isDefined(template)) {
                                    locals.$template = template;
                                }

                                w_msos.console.debug(temp_rt + temp_cr + 'returning $q.all');
                                return $q.all($q.defer('ng_route_all_commitRoute'), locals);
                            }
                            return undefined;
                        }
                    ).then(
                        function (locals) {
                            if (nextRoute === $route.current) {
                                if (nextRoute) {
                                    nextRoute.locals = locals;
                                    w_angular.copy(nextRoute.params, $routeParams);
                                }
                                $rootScope.$broadcast('$routeChangeSuccess', nextRoute, lastRoute);
                            }
                        },
                        function (error) {
                            if (nextRoute === $route.current) {
                                $rootScope.$broadcast('$routeChangeError', nextRoute, lastRoute, error);
                            }
                        }
                    );
                }
                w_msos.console.debug(temp_rt + temp_cr + 'done!');
            }

            var forceReload = false,
                preparedRoute,
                preparedRouteIsUpdateOnly,
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
                                'Tried updating route when with no current route'
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

    ngRouteModule = w_angular.module('ngRoute', ['ng']).provider('$route', $RouteProvider);
    ngRouteModule.provider('$routeParams', $RouteParamsProvider);

    function $RouteScrollProvider() {

        this.$get = ['$timeout', function ($timeout) {

            return function ($element) {
                return $timeout(function () {
                    $element[0].scrollIntoView();
                }, 0, false);
            };
        }];
    }

    ngRouteModule.provider('$routeViewScroll', $RouteScrollProvider);

    function ngViewFactory($route, $animate, $routeViewScroll) {
        var temp_vf = 'ng/route - ngViewFactory - link';

        return {
            restrict: 'ECA',
            terminal: true,
            priority: 400,
            transclude: 'element',
            link: function (scope, $element, attr, ctrl, $transclude) {
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
                        previousLeaveAnimation.then(
                            function () {
                                previousLeaveAnimation = null;
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
                            function (clone) {
                                $animate.enter(
                                    clone,
                                    null,
                                    currentElement || $element).then(
                                        function onNgViewEnter() {
                                            if (w_angular.isDefined(autoScrollExp)
                                             && (!autoScrollExp || scope.$eval(autoScrollExp))) {
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
                        if (onloadExp && onloadExp !== angular.noop) {
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

    ngViewFactory.$inject = ['$route', '$animate', '$routeViewScroll'];


    function ngViewControllerFactory($compile, $controller, $route) {
        return {
            restrict: 'ECA',
            priority: -400,
            link: function (scope, $element) {
                var temp_nc = 'ng/route - ngViewControllerFactory -> ',
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
                    controller = $controller(current.controller, locals);

                    if (current.controllerAs) {
                        scope[current.controllerAs] = controller;
                    }

                    $element.data('$ngControllerController', controller);
                    $element.children().data('$ngControllerController', controller);
                }

                link(scope);

                msos.console.debug(temp_nc + 'done!');
            }
        };
    }

    ngViewControllerFactory.$inject = ['$compile', '$controller', '$route'];


    ngRouteModule.directive('ngView', ngViewFactory);
    ngRouteModule.directive('ngView', ngViewControllerFactory);

}(window.angular, window.msos));
