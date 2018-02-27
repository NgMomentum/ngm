/**
 * @license AngularJS v1.6.7
 * (c) 2010-2017 Google, Inc. http://angularjs.org
 * License: MIT
 */

/*global
    msos: false,
    ng: false
*/

msos.provide("ng.resource");

ng.resource.version = new msos.set_version(17, 12, 30);


(function(window, angular) {
    'use strict';

    var $resourceMinErr = angular.$$minErr('$resource'),
        MEMBER_NAME_REGEX = /^(\.[a-zA-Z_$@][0-9a-zA-Z_$@]*)+$/;

    function isValidDottedPath(path) {
        return (path !== null && path !== undefined && path !== '' && path !== 'hasOwnProperty' &&
            MEMBER_NAME_REGEX.test('.' + path));
    }

    function lookupDottedPath(obj, path) {
        if (!isValidDottedPath(path)) {
            throw $resourceMinErr('badmember', 'Dotted member path "@{0}" is invalid.', path);
        }
        var keys = path.split('.');
        for (var i = 0, ii = keys.length; i < ii && angular.isDefined(obj); i++) {
            var key = keys[i];
            obj = (obj !== null) ? obj[key] : undefined;
        }
        return obj;
    }

    function shallowClearAndCopy(src, dst) {
        dst = dst || {};

        angular.forEach(dst, function(value, key) {
            delete dst[key];
        });

        for (var key in src) {
            if (src.hasOwnProperty(key) && !(key.charAt(0) === '$' && key.charAt(1) === '$')) {
                dst[key] = src[key];
            }
        }

        return dst;
    }

    angular.module(
		'ng.resource',
		['ng']
	).info({
        angularVersion: '1.6.7'
    }).provider(
		'$resource',
		function ResourceProvider() {
        var PROTOCOL_AND_IPV6_REGEX = /^https?:\/\/\[[^\]]*][^/]*/,
			provider = this;

        this.defaults = {
            // Strip slashes by default
            stripTrailingSlashes: true,

            // Make non-instance requests cancellable (via `$cancelRequest()`)
            cancellable: false,

            // Default actions configuration
            actions: {
                'get': {
                    method: 'GET'
                },
                'save': {
                    method: 'POST'
                },
                'query': {
                    method: 'GET',
                    isArray: true
                },
                'remove': {
                    method: 'DELETE'
                },
                'delete': {
                    method: 'DELETE'
                }
            }
        };

        this.$get = ['$http', '$log', '$q', '$timeout', function ($http, $log, $q, $timeout) {

            var noop = angular.noop,
                forEach = angular.forEach,
                extend = angular.extend,
                copy = angular.copy,
                isArray = angular.isArray,
                isDefined = angular.isDefined,
                isFunction = angular.isFunction,
                isNumber = angular.isNumber,
                encodeUriQuery = angular.$$encodeUriQuery,
                encodeUriSegment = angular.$$encodeUriSegment;

            function Route(template, defaults) {
                this.template = template;
                this.defaults = extend({}, provider.defaults, defaults);
                this.urlParams = {};
            }

            Route.prototype = {
                setUrlParams: function(config, params, actionUrl) {
                    var self = this,
                        url = actionUrl || self.template,
                        val,
                        encodedVal,
                        protocolAndIpv6 = '';

                    var urlParams = self.urlParams = Object.create(null);
                    forEach(url.split(/\W/), function(param) {
                        if (param === 'hasOwnProperty') {
                            throw $resourceMinErr('badname', 'hasOwnProperty is not a valid parameter name.');
                        }
                        if (!(new RegExp('^\\d+$').test(param)) && param &&
                            (new RegExp('(^|[^\\\\]):' + param + '(\\W|$)').test(url))) {
                            urlParams[param] = {
                                isQueryParamValue: (new RegExp('\\?.*=:' + param + '(?:\\W|$)')).test(url)
                            };
                        }
                    });
                    url = url.replace(/\\:/g, ':');
                    url = url.replace(PROTOCOL_AND_IPV6_REGEX, function(match) {
                        protocolAndIpv6 = match;
                        return '';
                    });

                    params = params || {};
                    forEach(self.urlParams, function(paramInfo, urlParam) {
                        val = params.hasOwnProperty(urlParam) ? params[urlParam] : self.defaults[urlParam];
                        if (isDefined(val) && val !== null) {
                            if (paramInfo.isQueryParamValue) {
                                encodedVal = encodeUriQuery(val, true);
                            } else {
                                encodedVal = encodeUriSegment(val);
                            }
                            url = url.replace(new RegExp(':' + urlParam + '(\\W|$)', 'g'), function(match, p1) {
                                return encodedVal + p1;
                            });
                        } else {
                            url = url.replace(new RegExp('(/?):' + urlParam + '(\\W|$)', 'g'), function(match,
                                leadingSlashes, tail) {
                                if (tail.charAt(0) === '/') {
                                    return tail;
                                } else {
                                    return leadingSlashes + tail;
                                }
                            });
                        }
                    });

                    // strip trailing slashes and set the url (unless this behavior is specifically disabled)
                    if (self.defaults.stripTrailingSlashes) {
                        url = url.replace(/\/+$/, '') || '/';
                    }

                    // Collapse `/.` if found in the last URL path segment before the query.
                    // E.g. `http://url.com/id/.format?q=x` becomes `http://url.com/id.format?q=x`.
                    url = url.replace(/\/\.(?=\w+($|\?))/, '.');
                    // Replace escaped `/\.` with `/.`.
                    // (If `\.` comes from a param value, it will be encoded as `%5C.`.)
                    config.url = protocolAndIpv6 + url.replace(/\/(\\|%5C)\./, '/.');


                    // set params - delegate param encoding to $http
                    forEach(params, function(value, key) {
                        if (!self.urlParams[key]) {
                            config.params = config.params || {};
                            config.params[key] = value;
                        }
                    });
                }
            };


            function resourceFactory(url, paramDefaults, actions, options) {
                var route = new Route(url, options);

                actions = extend({}, provider.defaults.actions, actions);

                function extractParams(data, actionParams) {
                    var ids = {};
                    actionParams = extend({}, paramDefaults, actionParams);
                    forEach(actionParams, function(value, key) {
                        if (isFunction(value)) {
                            value = value(data);
                        }
                        ids[key] = value && value.charAt && value.charAt(0) === '@' ?
                            lookupDottedPath(data, value.substr(1)) : value;
                    });
                    return ids;
                }

                function defaultResponseInterceptor(response) {
                    return response.resource;
                }

                function Resource(value) {
                    shallowClearAndCopy(value || {}, this);
                }

                Resource.prototype.toJSON = function() {
                    var data = extend({}, this);
                    delete data.$promise;
                    delete data.$resolved;
                    delete data.$cancelRequest;
                    return data;
                };

                forEach(actions, function(action, name) {
                    var hasBody = action.hasBody === true || (action.hasBody !== false && /^(POST|PUT|PATCH)$/i.test(action.method));
                    var numericTimeout = action.timeout;
                    var cancellable = isDefined(action.cancellable) ?
                        action.cancellable : route.defaults.cancellable;

                    if (numericTimeout && !isNumber(numericTimeout)) {
                        $log.debug('ng.resource:\n' +
                            '  Only numeric values are allowed as `timeout`.\n' +
                            '  Promises are not supported in $resource, because the same value would ' +
                            'be used for multiple requests. If you are looking for a way to cancel ' +
                            'requests, you should use the `cancellable` option.');
                        delete action.timeout;
                        numericTimeout = null;
                    }

                    Resource[name] = function(a1, a2, a3, a4) {
                        var params = {},
                            data, success, error;

                        switch (arguments.length) {
                            case 4:
                                error = a4;
                                success = a3;
                                // falls through
                            case 3:
                            case 2:
                                if (isFunction(a2)) {
                                    if (isFunction(a1)) {
                                        success = a1;
                                        error = a2;
                                        break;
                                    }

                                    success = a2;
                                    error = a3;
                                    // falls through
                                } else {
                                    params = a1;
                                    data = a2;
                                    success = a3;
                                    break;
                                }
                                // falls through
                            case 1:
                                if (isFunction(a1)) success = a1;
                                else if (hasBody) data = a1;
                                else params = a1;
                                break;
                            case 0:
                                break;
                            default:
                                throw $resourceMinErr('badargs',
                                    'Expected up to 4 arguments [params, data, success, error], got {0} arguments',
                                    arguments.length);
                        }

                        var isInstanceCall = this instanceof Resource;
                        var value = isInstanceCall ? data : (action.isArray ? [] : new Resource(data));
                        var httpConfig = {};
                        var responseInterceptor = action.interceptor && action.interceptor.response ||
                            defaultResponseInterceptor;
                        var responseErrorInterceptor = action.interceptor && action.interceptor.responseError ||
                            undefined;
                        var hasError = !!error;
                        var hasResponseErrorInterceptor = !!responseErrorInterceptor;
                        var timeoutDeferred;
                        var numericTimeoutPromise;

                        forEach(action, function(value, key) {
                            switch (key) {
                                default: httpConfig[key] = copy(value);
                                break;
                                case 'params':
                                        case 'isArray':
                                        case 'interceptor':
                                        case 'cancellable':
                                        break;
                            }
                        });

                        if (!isInstanceCall && cancellable) {
                            timeoutDeferred = $q.defer('resourceFactory_defer');
                            httpConfig.timeout = timeoutDeferred.promise;

                            if (numericTimeout) {
                                numericTimeoutPromise = $timeout(timeoutDeferred.resolve, numericTimeout);
                            }
                        }

                        if (hasBody) httpConfig.data = data;
                        route.setUrlParams(httpConfig,
                            extend({}, extractParams(data, action.params || {}), params),
                            action.url);

                        var promise = $http(httpConfig).then(function(response) {
                            var data = response.data;

                            if (data) {
                                // Need to convert action.isArray to boolean in case it is undefined
                                if (isArray(data) !== (!!action.isArray)) {
                                    throw $resourceMinErr('badcfg',
                                        'Error in resource configuration for action `{0}`. Expected response to ' +
                                        'contain an {1} but got an {2} (Request: {3} {4})', name, action.isArray ? 'array' : 'object',
                                        isArray(data) ? 'array' : 'object', httpConfig.method, httpConfig.url);
                                }
                                if (action.isArray) {
                                    value.length = 0;
                                    forEach(data, function(item) {
                                        if (typeof item === 'object') {
                                            value.push(new Resource(item));
                                        } else {
                                            // Valid JSON values may be string literals, and these should not be converted
                                            // into objects. These items will not have access to the Resource prototype
                                            // methods, but unfortunately there
                                            value.push(item);
                                        }
                                    });
                                } else {
                                    var promise = value.$promise; // Save the promise
                                    shallowClearAndCopy(data, value);
                                    value.$promise = promise; // Restore the promise
                                }
                            }

                            response.resource = value;

                            return response;
                        }, function(response) {
                            response.resource = value;
                            return $q.reject($q.defer('resourceFactory_reject_1'), response);
                        });

                        promise = promise['finally'](function() {
                            value.$resolved = true;
                            if (!isInstanceCall && cancellable) {
                                value.$cancelRequest = noop;
                                $timeout.cancel(numericTimeoutPromise);
                                timeoutDeferred = numericTimeoutPromise = httpConfig.timeout = null;
                            }
                        });

                        promise = promise.then(
                            function(response) {
                                var value = responseInterceptor(response);
                                (success || noop)(value, response.headers, response.status, response.statusText);
                                return value;
                            },
                            (hasError || hasResponseErrorInterceptor) ?
                            function(response) {
                                if (hasError && !hasResponseErrorInterceptor) {
                                    // Avoid `Possibly Unhandled Rejection` error,
                                    // but still fulfill the returned promise with a rejection
                                    promise.catch(noop);
                                }
                                if (hasError) error(response);
                                return hasResponseErrorInterceptor ?
                                    responseErrorInterceptor(response) :
                                    $q.reject($q.defer('resourceFactory_reject_2'), response);
                            } :
                            undefined);

                        if (!isInstanceCall) {
                            // we are creating instance / collection
                            // - set the initial promise
                            // - return the instance / collection
                            value.$promise = promise;
                            value.$resolved = false;
                            if (cancellable) value.$cancelRequest = cancelRequest;

                            return value;
                        }

                        // instance call
                        return promise;

                        function cancelRequest(value) {
                            promise.catch(noop);
                            if (timeoutDeferred !== null) {
                                timeoutDeferred.resolve(value);
                            }
                        }
                    };


                    Resource.prototype['$' + name] = function(params, success, error) {
                        if (isFunction(params)) {
                            error = success;
                            success = params;
                            params = {};
                        }
                        var result = Resource[name].call(this, params, this, success, error);
                        return result.$promise || result;
                    };
                });

                return Resource;
            }

            return resourceFactory;
        }];
    });

})(window, window.angular);
