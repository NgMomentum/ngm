
/**
 * @license AngularJS v1.7.5
 * (c) 2010-2017 Google, Inc. http://angularjs.org
 * License: MIT
 */

/*global
    msos: false,
    ng: false
*/

msos.provide("ng.resource");

ng.resource.version = new msos.set_version(18, 10, 25);


(function (window, angular) {
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

        var keys = path.split('.'),
			i = 0,
			ii = 0,
			key;

        for (i = 0, ii = keys.length; i < ii && angular.isDefined(obj); i += 1) {
            key = keys[i];
            obj = (obj !== null) ? obj[key] : undefined;
        }

        return obj;
    }

    function shallowClearAndCopy(src, dst) {
		var key;

        dst = dst || {};

        angular.forEach(dst, function (value, key) {
            delete dst[key];
        });

        for (key in src) {
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
        angularVersion: '1.7.5'
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
                setUrlParams: function (config, params, actionUrl) {
                    var self = this,
                        url = actionUrl || self.template,
                        val,
                        encodedVal,
                        protocolAndIpv6 = '';

                    var urlParams = self.urlParams = Object.create(null);
                    forEach(url.split(/\W/), function (param) {
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
                    url = url.replace(PROTOCOL_AND_IPV6_REGEX, function (match) {
                        protocolAndIpv6 = match;
                        return '';
                    });

                    params = params || {};
                    forEach(self.urlParams, function (paramInfo, urlParam) {
                        val = params.hasOwnProperty(urlParam) ? params[urlParam] : self.defaults[urlParam];
                        if (isDefined(val) && val !== null) {
                            if (paramInfo.isQueryParamValue) {
                                encodedVal = encodeUriQuery(val, true);
                            } else {
                                encodedVal = encodeUriSegment(val);
                            }
                            url = url.replace(new RegExp(':' + urlParam + '(\\W|$)', 'g'), function (match, p1) {
                                return encodedVal + p1;
                            });
                        } else {
                            url = url.replace(new RegExp('(/?):' + urlParam + '(\\W|$)', 'g'), function (match,
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
                    forEach(params, function (value, key) {
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

                function extractParams(ex_data, actionParams) {
                    var ids = {};

                    actionParams = extend({}, paramDefaults, actionParams);

                    forEach(
						actionParams,
						function (value, key) {
							if (isFunction(value)) {
								value = value(ex_data);
							}

							ids[key] = value && value.charAt && value.charAt(0) === '@' ? lookupDottedPath(ex_data, value.substr(1)) : value;
						}
					);

                    return ids;
                }

                function defaultResponseInterceptor(response) {
                    return response.resource;
                }

                function Resource(value) {
                    shallowClearAndCopy(value || {}, this);
                }

                Resource.prototype.toJSON = function () {
                    var json_data = extend({}, this);

                    delete json_data.$promise;
                    delete json_data.$resolved;
                    delete json_data.$cancelRequest;
                    return json_data;
                };

                forEach(
					actions,
					function (action, name) {
						var hasBody = action.hasBody === true || (action.hasBody !== false && /^(POST|PUT|PATCH)$/i.test(action.method)),
							numericTimeout = action.timeout,
							cancellable = isDefined(action.cancellable) ? action.cancellable : route.defaults.cancellable;

						if (numericTimeout && !isNumber(numericTimeout)) {
							$log.debug('ng.resource:\n' +
								'  Only numeric values are allowed as `timeout`.\n' +
								'  Promises are not supported in $resource, because the same value would ' +
								'be used for multiple requests. If you are looking for a way to cancel ' +
								'requests, you should use the `cancellable` option.');
							delete action.timeout;
							numericTimeout = null;
						}

						Resource[name] = function (a1, a2, a3, a4) {
							var params = {},
								rs_data,
								onSuccess,
								onError;

							switch (arguments.length) {
								case 4:
									onError = a4;
									onSuccess = a3;
									// falls through
								case 3:
								case 2:
									if (isFunction(a2)) {
										if (isFunction(a1)) {
											onSuccess = a1;
											onError = a2;
											break;
										}
	
										onSuccess = a2;
										onError = a3;
										// falls through
									} else {
										params = a1;
										rs_data = a2;
										onSuccess = a3;
										break;
									}
									// falls through
								case 1:
									if (isFunction(a1)) onSuccess = a1;
									else if (hasBody) rs_data = a1;
									else params = a1;
									break;
								case 0:
									break;
								default:
									throw $resourceMinErr('badargs',
										'Expected up to 4 arguments [params, data, success, error], got {0} arguments',
										arguments.length);
							}

							var isInstanceCall = this instanceof Resource,
								value = isInstanceCall ? rs_data : (action.isArray ? [] : new Resource(rs_data)),
								httpConfig = {},
								requestInterceptor = action.interceptor && action.interceptor.request || undefined,
								requestErrorInterceptor = action.interceptor && action.interceptor.requestError || undefined,
								responseInterceptor = action.interceptor && action.interceptor.response || defaultResponseInterceptor,
								responseErrorInterceptor = action.interceptor && action.interceptor.responseError || $q.reject($q.defer('ng_resourceFactory_reject')),
								successCallback = onSuccess ? function (val) {
									onSuccess(val, response.headers, response.status, response.statusText);
								} : undefined,
								errorCallback = onError || undefined,
								timeoutDeferred,
								numericTimeoutPromise,
								response,
								promise;

							forEach(action, function (value, key) {
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
									numericTimeoutPromise = $timeout(
										timeoutDeferred.resolve,
										numericTimeout,
										false
									);
								}
							}
	
							if (hasBody) { httpConfig.data = rs_data; }
	
							route.setUrlParams(
								httpConfig,
								extend({}, extractParams(rs_data, action.params || {}), params),
								action.url
							);

							// Start the promise chain
							promise = $q
								.resolve($q.defer('ng_resourceFactory_resolve'), httpConfig)
								.then(requestInterceptor)
								.catch(requestErrorInterceptor)
								.then($http);

							promise = promise.then(
								function (resp) {
									var pr_data = resp.data,
										th_promise;

									if (pr_data) {
										// Need to convert action.isArray to boolean in case it is undefined
										if (isArray(pr_data) !== Boolean(action.isArray)) {
											throw $resourceMinErr(
												'badcfg',
												'Error in resource configuration for action `{0}`. Expected response to ' +
												'contain an {1} but got an {2} (Request: {3} {4})', name, action.isArray ? 'array' : 'object',
												isArray(pr_data) ? 'array' : 'object', httpConfig.method, httpConfig.url);
										}

										if (action.isArray) {
											value.length = 0;
											forEach(
												pr_data,
												function (item) {
													if (typeof item === 'object') {
														value.push(new Resource(item));
													} else {
														// Valid JSON values may be string literals, and these should not be converted
														// into objects. These items will not have access to the Resource prototype
														// methods, but unfortunately there
														value.push(item);
													}
												}
											);
										} else {
											th_promise = value.$promise; // Save the promise
											shallowClearAndCopy(pr_data, value);
											value.$promise = th_promise; // Restore the promise
										}
									}

									resp.resource = value;
									response = resp;

									return responseInterceptor(resp);
								},
								function (rejectionOrResponse) {

									rejectionOrResponse.resource = value;
									response = rejectionOrResponse;

									return responseErrorInterceptor(rejectionOrResponse);
								}
							);

							promise = promise['finally'](
								function () {

									value.$resolved = true;

									if (!isInstanceCall && cancellable) {
										value.$cancelRequest = noop;
										$timeout.cancel(numericTimeoutPromise);
										timeoutDeferred = numericTimeoutPromise = httpConfig.timeout = null;
									}
								}
							);

							// Run the `success`/`error` callbacks, but do not let them affect the returned promise.
							promise.then(successCallback, errorCallback);

							function cancelRequest(value) {
								promise.catch(noop);
								if (timeoutDeferred !== null) {
									timeoutDeferred.resolve(value);
								}
							}

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
						};

						Resource.prototype['$' + name] = function (params, success, error) {

							if (isFunction(params)) {
								error = success;
								success = params;
								params = {};
							}

							var result = Resource[name].call(this, params, this, success, error);

							return result.$promise || result;
						};
					}
				);

                return Resource;
            }

            return resourceFactory;
        }];
    });

})(window, window.angular);
