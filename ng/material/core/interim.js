
/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.core.interim");
msos.require("ng.material.core.theming");

ng.material.core.interim.version = new msos.set_version(18, 8, 11);


function InterimElementProvider() {
	"use strict";

	var temp_iep = 'ng.material.core.interim - IEP';

	function createInterimElementProvider(interimFactoryName) {
		var EXPOSED_METHODS = ['onHide', 'onShow', 'onRemove'],
			customMethods = {},
			providerConfig = { presets: {} },
			provider = null;

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
			definition.options = definition.options || function () { return {}; };

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
			var defaultMethods = providerConfig.methods || [],
				defaultOptions,
				interimElementService = $$interimElement(),
				publicService = null;

			function showInterimElement(opts) {

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

				return $injector.invoke(
						factory || function () { return defaultVal; },
						{},
						locals,
						'ng_md_core_interim_' + interimFactoryName
					);
			}

			defaultOptions = invokeFactory(
				providerConfig.optionsFactory,
				{}
			);

			// Copy over the simple custom methods
			angular.forEach(
				customMethods,
				function (fn, name) { publicService[name] = fn; }
			);

			angular.forEach(
				providerConfig.presets,
				function (definition, name) {
					var presetDefaults = invokeFactory(
							definition.optionsFactory,
							{}
						),
						presetMethods = (definition.methods || []).concat(defaultMethods),
						methodName;

					angular.extend(
						presetDefaults,
						{ $type: name }
					);

					function Preset(opts) {
						this._options = angular.extend({}, presetDefaults, opts);
					}

					angular.forEach(
						presetMethods,
						function (name) {
							Preset.prototype[name] = function (value) {
								this._options[name] = value;
								return this;
							};
						}
					);

					if (definition.argOption) {
						methodName = 'show' + name.charAt(0).toUpperCase() + name.slice(1);

						publicService[methodName] = function (arg) {
							var config = publicService[name](arg);

							return publicService.show(config);
						};
					}

					publicService[name] = function (arg) {

						if (arguments.length && definition.argOption && !angular.isObject(arg) && !angular.isArray(arg)) {

							return (new Preset())[definition.argOption](arg);
						}

						return new Preset(arg);
					};
				}
			);

			return publicService;
		}

		provider = {
			setDefaults: setDefaults,
			addPreset: addPreset,
			addMethod: addMethod,
			$get: ["$$interimElement", "$injector", factory]
		};

		provider.addPreset(
			'build',
			{
				methods: [
					'controller', 'controllerAs', 'resolve', 'multiple',
					'template', 'templateUrl', 'themable', 'transformTemplate', 'parent', 'contentElement'
				]
			}
		);

		return provider;
	}

	function InterimElementFactory($document, $q, $rootScope, $timeout, $rootElement, $animate, $mdUtil, $mdCompiler, $mdTheming, $injector, $exceptionHandler) {

		return function createInterimElementService() {
			var temp_ci = ' - IEF - createIES',
				SHOW_CANCELLED = false,
				service = {},
				showPromises = [],
				hidePromises = [],
				showingInterims = [];

			function show(options) {

				options = options || {};

				msos.console.debug(temp_iep + temp_ci + ' - show -> start.');

				var interimElement = new InterimElement(options),
					hideAction = options.multiple ? $q.resolve($q.defer('ng_md_core_interim_fac_resolve')) : $q.all($q.defer('ng_md_core_interim_fac_all'), showPromises),
					showAction;

				if (!options.multiple) {
					// Wait for all opening interim's to finish their transition.
					hideAction = hideAction.then(
						function () {
							// Wait for all closing and showing interim's to be completely closed.
							var promiseArray = hidePromises.concat(showingInterims.map(service.cancel));

							return $q.all($q.defer('ng_md_core_interim_fac_hideAction_all'), promiseArray);
						}
					);
				}

				showAction = hideAction.then(
					function hide_action_done() {

						return interimElement
							.show()
							.catch(
								function (reason) {
									return reason;
								}
							).finally(
								function () {
									showPromises.splice(showPromises.indexOf(showAction), 1);
									msos.console.debug(temp_iep + temp_ci + ' - show - hide_action_done - finally -> called, interimElement:', interimElement);
									showingInterims.push(interimElement);
								}
							);
					}
				);

				showPromises.push(showAction);

				interimElement.deferred.promise.catch(
					function (fault) {
						if (fault instanceof Error) {
							$exceptionHandler(fault);
						}

						return fault;
					}
				);

				msos.console.debug(temp_iep + temp_ci + ' - show ->  done!');
				// Return a promise that will be resolved when the interim
				// element is hidden or cancelled...
				return interimElement.deferred.promise;
			}

			function hide(reason, options) {

				options = options || {};

				msos.console.debug(temp_iep + temp_ci + ' - hide -> start.');

				function closeElement(interim) {

					var hideAction = interim
						.remove(reason, false, options)
						.catch(
							function (reason) {
								return reason;
							}
						).finally(
							function () {
								msos.console.debug(temp_iep + temp_ci + ' - hide - closeElement - finally -> called.');
								hidePromises.splice(hidePromises.indexOf(hideAction), 1);
							}
						);

					showingInterims.splice(showingInterims.indexOf(interim), 1);
					hidePromises.push(hideAction);

					return interim.deferred.promise;
				}

				if (options.closeAll) {
					return $q.all($q.defer('ng_md_core_interim_fac_hide_all'), showingInterims.slice().reverse().map(closeElement));
				}

				if (options.closeTo !== undefined) {
					return $q.all($q.defer('ng_md_core_interim_fac_hide_closeTo_all'), showingInterims.slice(options.closeTo).map(closeElement));
				}

				msos.console.debug(temp_iep + temp_ci + ' - hide ->  done!');
				// Hide the latest showing interim element.
				return closeElement(showingInterims[showingInterims.length - 1]);
			}

			function cancel(reason, options) {
				var interim = showingInterims.pop();

				msos.console.debug(temp_iep + temp_ci + ' - cancel -> start, interim:', interim);

				if (!interim) { return $q.when($q.defer('ng_md_core_interim_fac_cancel_when'), reason); }

				var cancelAction = interim
						.remove(reason, true, options || {})
						.catch(
							function (reason) { return reason; })
						.finally(
							function () {
								msos.console.debug(temp_iep + temp_ci + ' - cancel - cancelAction - finally -> called.');
								hidePromises.splice(hidePromises.indexOf(cancelAction), 1);
							}
						);

				hidePromises.push(cancelAction);

				msos.console.debug(temp_iep + temp_ci + ' - cancel ->  done!');
				return interim.deferred.promise.catch(angular.noop);
			}

			function waitForInterim(callbackFn) {

				return function interim_serv_fn() {
					var fnArguments = arguments;

					if (!showingInterims.length) {

						if (showPromises.length) {
							msos.console.debug(temp_iep + temp_ci + ' - interim_serv_fn -> called, showPromises: ' + showPromises.length);
							return showPromises[0].finally(
									function () {
										return callbackFn.apply(service, fnArguments);
									}
								);
						}

						msos.console.debug(temp_iep + temp_ci + ' - interim_serv_fn -> called, no elements.');
						return $q.when($q.defer('ng_md_core_interim_fac_waitForInterim_when'), "No interim elements currently showing up.");
					}

					msos.console.debug(temp_iep + temp_ci + ' - interim_serv_fn -> called, showingInterims: ' + showingInterims.length);
					return callbackFn.apply(service, fnArguments);
				};
			}

			function destroy(targetEl) {
				var temp_ds = ' - destroy -> ',
					debug_note = '',
					interim = null,
					jq_el,
					parentEl,
					filtered;

				msos.console.debug(temp_iep + temp_ci + temp_ds + 'start.');

				if (targetEl) {

					 jq_el = angular.element(targetEl);
					 parentEl = jq_el.length && jq_el[0].parentNode;

					if (parentEl) {
						// Try to find the interim in the stack which corresponds to the supplied DOM element.
						filtered = showingInterims.filter(
							function (entry) {
								return entry.options.element[0] === parentEl;
							}
						);

						if (filtered.length) {
							interim = filtered[0];
							showingInterims.splice(showingInterims.indexOf(interim), 1);
						}
					} else {
						debug_note = ', no parent element';
					}

				} else {
					debug_note = ', no target element';
					interim = showingInterims.shift();
				}

				msos.console.debug(temp_iep + temp_ci + temp_ds + ' done' + debug_note + ', interim:', interim);

				return interim ? interim.remove(SHOW_CANCELLED, false, { '$destroy': true }) : $q.when($q.defer('ng_md_core_interim_fac_destroy_when'), SHOW_CANCELLED);
			}


			function InterimElement(options) {
				var self = null,
					element,
					showAction = $q.when($q.defer('ng_md_core_interim_fac_InterimElement_when'), true);

				function configureScopeAndTransitions(options) {

					options = options || {};

					if (options.template) {
						options.template = $mdUtil.processTemplate(options.template);
					}

					return angular.extend(
							{
								preserveScope: false,
								cancelAutoHide: angular.noop,
								scope: options.scope || $rootScope.$new(options.isolateScope),
								onShow: function transitionIn(scope, element, options) {
									return $animate.enter(element, options.parent);
								},
								onRemove: function transitionOut(scope, element) {
									return element && $animate.leave(element) || $q.when($q.defer('ng_md_core_interim_fac_configureScopeAndTransitions_when'));
								}
							},
							options
						);
				}

				options = configureScopeAndTransitions(options);

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

						if (!el) el = $rootElement[0];

						if (el.nodeName === '#comment') {
							el = $document[0].body;
						}

						parent = angular.element(el);
					}

					msos.console.debug(temp_iep + temp_ci + ' - InterimElement - findParent -> called,\n     parent: ' + angular.ngnodeDebugName(parent));
					return parent;
				}

				function linkElement(compileData, options) {

					angular.extend(compileData.locals, options);

					var element = compileData.link(options.scope);

					// Search for parent at insertion time, if not specified
					options.element = element;
					options.parent = findParent(element, options);

					if (options.themable) {
						$mdTheming(element);
					}

					return element;
				}

				function startAutoHide() {
					var autoHideTimer,
						cancelAutoHide = angular.noop;

					if (options.hideDelay) {
						autoHideTimer = $timeout(
							service.hide,
							options.hideDelay || 10,
							false
						);
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

					// Necessary for consistency between AngularJS 1.5 and 1.6.
					try {
						notifyShowing(options.scope, element, options, controller);
					} catch (e) {
						return $q.reject($q.defer('ng_md_core_interim_fac_showElement_reject'), e);
					}

					return $q(
							function (resolve, reject) {
								try {
									// Start transitionIn
									$q.when($q.defer('ng_md_core_interim_fac_showElement_when'), options.onShow(options.scope, element, options, controller))
										.then(
											function () {
												notifyComplete(options.scope, element, options);
												startAutoHide();
												resolve(element);
											},
											reject
										);

								} catch (e) { reject(e.message); }
							},
							'ng_md_core_interim_fac_showElement'
						);
				}

				function hideElement(element, options) {
					var announceRemoving = options.onRemoving || angular.noop;

					return $q(
							function(resolve, reject) {
								var action;

								try {
									// Start transitionIn
									action = $q.when($q.defer('ng_md_core_interim_fac_hideElement_when'), options.onRemove(options.scope, element, options) || true);

									// Trigger callback *before* the remove operation starts
									announceRemoving(element, action);

									if (options.$destroy) {
										// For $destroy, onRemove should be synchronous
										resolve(element);

									if (!options.preserveScope && options.scope) {
										// scope destroy should still be be done after the current digest is done
										action.then(
											function () {
												options.scope.$destroy();
											}
										);
									}
								} else {
									// Wait until transition-out is done
									action.then(
										function () {
											if (!options.preserveScope && options.scope) {
												options.scope.$destroy();
											}

											resolve(element);
										},
										reject
									);
								}
							} catch (e) { reject(e.message); }
						},
						'ng_md_core_interim_fac_hideElement'
					);
				}

				function compileElement(options) {

					var compiled = !options.skipCompile ? $mdCompiler.compile(options) : null;

					return compiled || $q(
								function (resolve) {
									resolve({
										locals: {},
										link: function () { return options.element; }
									});
								},
								'ng_md_core_interim_fac_compileElement'
							);
				}

				function createAndTransitionIn() {

					return $q(
						function (resolve, reject) {

							if (options.onCompiling) {
								options.onCompiling(options);
							}

							compileElement(options)
								.then(
									function (compiledData) {

										element = linkElement(compiledData, options);

										// Expose the cleanup function from the compiler.
										options.cleanupElement = compiledData.cleanup;

										showAction = showElement(element, options, compiledData.controller)
											.then(resolve, rejectAll);

									}
								).catch(rejectAll);

							function rejectAll(fault) {
								// Force the '$md<xxx>.show()' promise to reject
								self.deferred.reject(fault);

								// Continue rejection propagation
								reject(fault);
							}
						},
						'ng_md_core_interim_fac_createAndTransitionIn'
					);
				}

				function transitionOutAndRemove(response, isCancelled, opts) {

					if (!element) { return $q.when($q.defer('ng_md_core_interim_fac_transitionOutAndRemove_when'), false); }

					options = angular.extend(options || {}, opts || {});

					if (options.cancelAutoHide) {
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
										if (rejectAll(response)) { return undefined; }
 									}

									resolveAll(response);

									return undefined;
								}
						);

					} else {
						$q.when($q.defer('ng_md_core_interim_fac_transitionOutAndRemove_when'), showAction).finally(
							function () {
								hideElement(options.element, options).then(
									function () {
										if (isCancelled ) {
											rejectAll(response) ;
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
				}

				self = {
					options: options,
					deferred: $q.defer('ng_md_core_interim_fac_InterimElement_defer'),
					show: createAndTransitionIn,
					remove: transitionOutAndRemove
				};

				return self;
			}

			service = {
				show: show,
				hide: waitForInterim(hide),
				cancel: waitForInterim(cancel),
				destroy: destroy,
				$injector_: $injector
			};

			return service;
		};
	}

	InterimElementFactory.$inject = ["$document", "$q", "$rootScope", "$timeout", "$rootElement", "$animate", "$mdUtil", "$mdCompiler", "$mdTheming", "$injector", "$exceptionHandler"];
	createInterimElementProvider.$get = InterimElementFactory;

	return createInterimElementProvider;
}

angular.module(
	'ng.material.core.interim',
	[
		'ng',
		'ng.material.core',
		'ng.material.core.theming'
	]
).provider(
	'$$interimElement',
	InterimElementProvider
);
