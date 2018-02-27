
/**
 * oclazyload - Load modules on demand (lazy load) with angularJS
 * @version v1.0.10
 * @link https://github.com/ocombe/ocLazyLoad
 * @license MIT
 * @author Olivier Combe <olivier.combe@gmail.com>
 */

/*global
	msos: false,
    angular: false
*/

msos.provide("ng.util.oclazyload");

(function (angular) {
    'use strict';

    var modulesToLoad = [],
        realModules = [],
        recordDeclarations = [],
        justLoaded = [],
		_addToLoadList = function _addToLoadList(name, force, real) {
			if ((recordDeclarations.length > 0 || force) &&
				angular.isString(name) &&
				modulesToLoad.indexOf(name) === -1) {

				modulesToLoad.push(name);

				if (real) { realModules.push(name); }
			}
		},
		ngModuleFct = angular.module;

	// Override Std AngularJS Module function...
    angular.module = function (name, requires, configFn) {
        _addToLoadList(name, false, true);
        return ngModuleFct(name, requires, configFn);
    };

	angular.module(
		'ng.util.oclazyload',
		['ng']
	).provider(
		'$ocLazyLoad',
		function () {
			var modules = {},
				debug = msos.config.debug,
				events = false,
				moduleCache = [],
				modulePromises = {};

			moduleCache.push = function (value) {
				if (this.indexOf(value) === -1) {
					Array.prototype.push.apply(this, arguments);
				}
			};

			function getModuleName(module) {
				var moduleName = null;

				if (angular.isString(module)) {
					moduleName = module;
				} else if (angular.isObject(module) &&
						   module.hasOwnProperty('name') &&
						   angular.isString(module.name)) {
					moduleName = module.name;
				}

				return moduleName;
			}

			function getModule(moduleName) {
				if (!angular.isString(moduleName)) {
					msos.console.warn('ng.util.oclazyload - getModule -> moduleName is not a string.');
					return false;
				}

				try {
					return ngModuleFct(moduleName);
				} catch (e) {
					// this error message really suxx
					if (/No module/.test(e) || e.message.indexOf('$injector:nomod') > -1) {
						e.message = 'The module "' + angular.stringify(moduleName) + '" that you are trying to load does not exist. ' + e.message;
					}
					msos.console.error('ng.util.oclazyload - getModule -> failed for moduleName: ' + moduleName, e);
					return false;
				}
			}

			this.$get = ["$log", "$rootElement", "$rootScope", "$cacheFactory", "$q", "$templateCache", "$http",
				function ($log, $rootElement, $rootScope, $cacheFactory, $q, $templateCache, $http) {
					var instanceInjector,
						filesCache = $cacheFactory('ocLazyLoad'),
						getInstanceInjector = function () {
							return instanceInjector ?
									instanceInjector :
									instanceInjector = $rootElement.data('$injector') || angular.injector();
						};

				function broadcast(eventName, params) {
					if (events) {
						$rootScope.$broadcast(eventName, params);
					}

					if (debug) { $log.info(eventName, params); }
				}

				function reject(e) {
					var deferred = $q.defer('oclazyload_get_defer_reject');

					$log.error(e.message);
					deferred.reject(e);

					return deferred.promise;
				}

				function _register(registerModules) {
					if (registerModules) {
						getInstanceInjector().loadNewModules(registerModules);
					}
				}

				function getRequires(module) {
					var requires = [];

					angular.forEach(
						module.requires,
						function (requireModule) {
							if (angular.registered_modules.indexOf(requireModule) === -1) {
								requires.push(requireModule);
							}
						}
					);

					return requires;
				}

				function buildElement(type, path, params) {
					var msos_builder = new msos.loader(),
						deferred = $q.defer('oclazyload_build_el_defer');

					if (angular.isUndefined(filesCache.get(path))) {
						filesCache.put(path, deferred.promise);
					}

					msos.config.cache = params.cache || true;

					// Switch in case more content types are added later
					switch (type) {
						case 'css':
							msos_builder.load(path, 'css');
							break;
						case 'js':
							msos_builder.load(path, 'js');
							break;
						default:
							filesCache.remove(path);
							deferred.reject(new Error('Requested type "' + type + '" is not known. Could not inject "' + path + '"'));
							break;
					}

					msos_builder.add_resource_onload.push(
						function () {
							broadcast('ocLazyLoad.fileLoaded', path);
							deferred.resolve(true);
						}
					);

					msos_builder.add_resource_onerror.push(
						function () {
							filesCache.remove(path);
							deferred.reject(new Error('Unable to load ' + path));
						}
					);

					return deferred.promise;
				}

				return {
					config: function (cfg) {
						if (angular.isDefined(cfg.debug)) {
							debug = cfg.debug;
						}
			
						if (angular.isDefined(cfg.events)) {
							events = cfg.events;
						}
					},
					toggleWatch: function toggleWatch(watch) {
						if (watch) {
							recordDeclarations.push(true);
						} else {
							recordDeclarations.pop();
						}
					},
					setModuleConfig: function (moduleConfig) {
						if (!angular.isObject(moduleConfig)) {
							throw new Error('You need to give the module config object to set');
						}

						modules[moduleConfig.name] = moduleConfig;
						return moduleConfig;
					},
					loadDependencies: function (moduleName, localParams, real) {
						var loadedModule,
							requires,
							self = this;

						moduleName = getModuleName(moduleName);

						msos.console.debug('ng.util.oclazyload - loadDependencies -> called for: ' + moduleName + ', localParams:', localParams);

						if (moduleName !== null) {

							try {
								loadedModule = getModule(moduleName);
							} catch (e) {
								return reject(e);
							}

							if (!loadedModule) { return reject(moduleName + ' is not available yet.'); }

							// get unloaded requires
							requires = getRequires(loadedModule);
						}

						if (requires) {
							return $q.when($q.defer('oclazyload_get_loadDependencies_requires')).then(
									function () { self.inject(requires, localParams, real); }
								);
						}

						return $q.when($q.defer('oclazyload_get_loadDependencies_done'));
					},
					inject: function inject(moduleName) {
						var localParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1],
							real = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2],
							self = this,
							promisesList = [],
							deferred = $q.defer('oclazyload_get_defer_inject'),
							res;

						msos.console.debug('ng.util.oclazyload - inject -> called, with localParams/real:', localParams, real);

						if (angular.isDefined(moduleName) && moduleName !== null) {

							if (angular.isArray(moduleName)) {

								angular.forEach(
									moduleName,
									function (module) {
										if (!angular.loaded_modules.get(module)) {
											promisesList.push(self.inject(module, localParams, real));
										}
									}
								);

								return $q.all($q.defer('oclazyload_get_all_inject'), promisesList);

							} else if (!angular.loaded_modules.get(moduleName)) {
								_addToLoadList(getModuleName(moduleName), true, real);
							} else {
								broadcast('ocLazyLoad.moduleLoaded', moduleName);
							}
						}

						function loadNext(moduleName, resolve_obj) {

							moduleCache.push(moduleName);
							modulePromises[moduleName] = deferred.promise;

							self.loadDependencies(moduleName, localParams, real).then(
								function success() {
									try {
										justLoaded = [];
										_register(moduleCache);
										moduleCache = [];	// Clear registered module queue
									} catch (e) {
										$log.error(e.message);
										deferred.reject(e);
										return;
									}

									if (modulesToLoad.length > 0) {
										loadNext(modulesToLoad.shift(), resolve_obj);
									} else {
										deferred.resolve(resolve_obj);
									}
								},
								function error(err) {
									deferred.reject(err);
								}
							);
						}

						if (modulesToLoad.length > 0) {
							res = modulesToLoad.slice(); // clean copy

							// load the first in list
							loadNext(modulesToLoad.shift(), res);

						} else if (localParams &&
								   localParams.name &&
								   modulePromises[localParams.name]) {
							return modulePromises[localParams.name];
						} else {
							deferred.resolve();
						}

						return deferred.promise;
					},
					filesLoader: function (config) {
						var self = this,
							params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1],
							cssFiles = [],
							templatesFiles = [],
							jsFiles = [],
							promises = [],
							cachePromise = null,
							pushFile;

						self.toggleWatch(true);

						angular.extend(params, config);

						pushFile = function pushFile(path) {
							var file_type = null,
								m;

							if (angular.isObject(path)) {
								file_type = path.type;
								path = path.path;
							}

							cachePromise = filesCache.get(path);

							if (angular.isUndefined(cachePromise) || params.cache === false) {

								if (!file_type) {
									if ((m = /[.](css|less|html|htm|js)?((\?|#).*)?$/.exec(path)) !== null) {
										// Detect file type via file extension
										file_type = m[1];
									} else {
										$log.error('File type could not be determined. ' + path);
										return;
									}
								}

								if ((file_type === 'css' || file_type === 'less') && cssFiles.indexOf(path) === -1) {
									cssFiles.push(path);
								} else if ((file_type === 'html' || file_type === 'htm') && templatesFiles.indexOf(path) === -1) {
									templatesFiles.push(path);
								} else if (file_type === 'js' || jsFiles.indexOf(path) === -1) {
									jsFiles.push(path);
								} else {
									$log.error('File type is not valid. ' + path);
								}

							} else if (cachePromise) {
								promises.push(cachePromise);
							}
						};

						if (params.serie) {
							pushFile(params.files.shift());
						} else {
							angular.forEach(params.files, function (path) {
								pushFile(path);
							});
						}

						if (cssFiles.length > 0) {
							var cssDeferred = $q.defer('oclazyload_fileload_defer');
							self.cssLoader(cssFiles, function (err) {
								if (angular.isDefined(err)) {
									$log.error(err);
									cssDeferred.reject(err);
								} else {
									cssDeferred.resolve();
								}
							}, params);
							promises.push(cssDeferred.promise);
						}

						if (templatesFiles.length > 0) {
							var templatesDeferred = $q.defer('oclazyload_fileload_defer_tmpl');
							self.templatesLoader(templatesFiles, function (err) {
								if (angular.isDefined(err)) {
									$log.error(err);
									templatesDeferred.reject(err);
								} else {
									templatesDeferred.resolve();
								}
							}, params);
							promises.push(templatesDeferred.promise);
						}

						if (jsFiles.length > 0) {
							var jsDeferred = $q.defer('oclazyload_fileload_defer_js');
							self.jsLoader(jsFiles, function (err) {
								if (angular.isDefined(err)) {
									$log.error(err);
									jsDeferred.reject(err);
								} else {
									jsDeferred.resolve();
								}
							}, params);
							promises.push(jsDeferred.promise);
						}

						if (promises.length === 0) {
							var deferred = $q.defer('oclazyload_fileload_defer_error'),
								err = "Error: no file to load has been found, if you're trying to load an existing module you should use the 'inject' method instead of 'load'.";

							$log.error(err);
							deferred.reject(err);

							return deferred.promise;
						} else if (params.serie && params.files.length > 0) {
							return $q.all($q.defer('oclazyload_fileload_all_params'), promises).then(function () {
								return self.filesLoader(config, params);
							});
						} else {
							return $q.all($q.defer('oclazyload_fileload_all'), promises)['finally'](function (res) {
								self.toggleWatch(false); // stop watching angular.module calls
								return res;
							});
						}
					},
					load: function (originalModule) {
						var self = this,
							originalParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1],
							config = null,
							deferredList = [],
							deferred = $q.defer('oclazyload_load'),
							errText,
							module = angular.copy(originalModule),
							params = angular.copy(originalParams);

						// If module is an array, break it down
						if (angular.isArray(module)) {
							// Resubmit each entry as a single module
							angular.forEach(
								module,
								function (m) {
									deferredList.push(self.load(m, params));
								}
							);

							// Resolve the promise once everything has loaded
							$q.all($q.defer('oclazyload_load_all'), deferredList).then(
								function (res) {
									deferred.resolve(res);
								},
								function (err) {
									deferred.reject(err);
								}
							);

							return deferred.promise;
						}

						function getModuleConfig(moduleName) {
							if (!angular.isString(moduleName)) {
								throw new Error('You need to give the name of the module to get');
							}
							if (!modules[moduleName]) {
								return null;
							}
							return angular.copy(modules[moduleName]);
						}

						// Get or Set a configuration depending on what was passed in
						if (angular.isString(module)) {
							config = getModuleConfig(module);
							if (!config) {
								config = {
									files: [module]
								};
							}
						} else if (angular.isObject(module)) {
							// case {type: 'js', path: lazyLoadUrl + 'testModule.fakejs'}
							if (angular.isDefined(module.path) && angular.isDefined(module.type)) {
								config = {
									files: [module]
								};
							} else {
								config = self.setModuleConfig(module);
							}
						}
		
						if (config === null) {
							var moduleName = getModuleName(module);

							errText = 'Module "' + (moduleName || 'unknown') + '" is not configured, cannot load.';
							$log.error(errText);
							deferred.reject(new Error(errText));

							return deferred.promise;
						}
		
						var localParams = angular.extend({}, params, config);
		
						 if (angular.isUndefined(config.files) && angular.isDefined(config.name) && getModule(config.name)) {
							return self.inject(config.name, localParams, true);
						}
		
						self.filesLoader(config, localParams).then(function () {
							self.inject(null, localParams).then(function (res) {
								deferred.resolve(res);
							}, function (err) {
								deferred.reject(err);
							});
						}, function (err) {
							deferred.reject(err);
						});
		
						return deferred.promise;
					},
					cssLoader: function (paths, callback, params) {
						var promises = [];

						angular.forEach(
							paths,
							function (path) {
								promises.push(buildElement('css', path, params));
							}
						);

						$q.all($q.defer('oclazyload_css_all'), promises).then(
							function () {
								callback();
							}, function (err) {
								callback(err);
							}
						);
					},
					jsLoader: function (paths, callback, params) {
						var promises = [];
		
						angular.forEach(
							paths,
							function (path) {
								promises.push(buildElement('js', path, params));
							}
						);
		
						$q.all($q.defer('oclazyload_js_all'), promises).then(
							function () {
								callback();
							}, function (err) {
								callback(err);
							}
						);
					},
					templatesLoader: function (paths, callback, params) {
						var promises = [];
		
						angular.forEach(
							paths,
							function (url) {
								var deferred = $q.defer('oclazyload_tmpl_defer');
		
								promises.push(deferred.promise);
		
								$http.get(url, params).then(function (response) {
									var data = response.data;
		
									if (angular.isString(data) && data.length > 0) {
										angular.forEach(
											angular.element(data),
											function (node) {
												if (node.nodeName === 'SCRIPT' && node.type === 'text/ng-template') {
													$templateCache.put(node.id, node.innerHTML);
												}
											}
										);
									}
		
									if (angular.isUndefined(filesCache.get(url))) {
										filesCache.put(url, true);
									}
		
									deferred.resolve();
								})['catch'](
									function (response) {
										deferred.reject(new Error('Unable to load template file "' + url + '": ' + response.data));
									}
								);
							}
						);
		
						return $q.all($q.defer('oclazyload_tmpl_all'), promises).then(
							function () {
								callback();
							}, function (err) {
								callback(err);
							}
						);
					}
				};
			}];
		}
	).directive(
		'ocLazyLoad',
		["$ocLazyLoad", "$compile", "$animate", "$parse", function ($ocLazyLoad, $compile, $animate, $parse) {
			return {
				restrict: 'A',
				terminal: true,
				priority: 1000,
				compile: function compile(element) {

					var content = element[0].innerHTML;

					element.html('');

					return function ($scope, $element, $attr) {
						var model = $parse($attr.ocLazyLoad);

						$scope.$watch(
							function () {
								return model($scope) || $attr.ocLazyLoad;
							},
							function (moduleName) {
								if (angular.isDefined(moduleName)) {
									$ocLazyLoad.load(moduleName).then(
										function () {
											$animate.enter(content, $element);
											$compile($element.contents())($scope);
										}
									);
								}
							},
							true
						);
					};
				}
			};
		}]
	);

}(angular));
