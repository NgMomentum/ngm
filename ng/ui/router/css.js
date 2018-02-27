
/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.ui.router.css");

ng.ui.router.css.version = new msos.set_version(18, 2, 26);

ng.ui.router.css.tracking = {};
ng.ui.router.css.events_enabled = false;
ng.ui.router.css.themes = new msos.loader();


(function (angular) {

	"use strict";

    var _$rootScope,
		_$q,
		_$injector,
		EVENTS_NAMESPACE = 'uiRouterCss',
		EVENT_LOADING_STARTED = 'loadingStarted',
		EVENT_LOADING_FINISHED = 'loadingFinished',
		nextResourceId = 1,
		currentDefQueue = [],
		vcss = msos.config.verbose === 'router';

    function error(message) {
        throw Error('ng.ui.router.css -> Error: ' + message);
    }

    function isInt(value) {
        return Number(value) === value && value % 1 === 0;
    }

    function generateResourceId() {
        return '@resource~' + nextResourceId++;
    }

    function isInjectable(obj) {
        return angular.isFunction(obj) || (angular.isArray(obj) && angular.isFunction(obj[obj.length - 1]));
    }

    function normalizeStyleDef(definition, key) {

        if (!isInjectable(definition)) {
            if (angular.isString(definition) || !definition) {
                definition = {
                    url: definition
                };
            }

            if (angular.isUndefined(definition.url)) {
                error('the definition needs to contain a URL: ' + JSON.stringify(definition));
            }

            if (definition.id) {
                key = definition.id;
            }

            if (isInt(key)) {
                key = generateResourceId();
            }

            definition.id = key;
        }

        return definition;
    }

    function normalizeStyleDefinitions(definitions) {
		// Making sure each entry has a unique resource ID.
        var normalizedDefinitions = {};

        if (isInjectable(definitions)) {
            return definitions;
        } else if (angular.isString(definitions)) {
            definitions = [definitions];
        }

        angular.forEach(
			definitions,
			function (definition, key) {
				var normalizedDefinition = normalizeStyleDef(definition, key);

				normalizedDefinitions[normalizedDefinition.id] = normalizedDefinition;
			}
		);

		if (vcss) {
			msos.console.debug('ng.ui.router.css - normalizeStyleDefinitions -> called, output:', normalizedDefinitions);
		}

        return normalizedDefinitions;
    }

    function loadStyleDefinition(definition) {
        var deferred = _$q.defer('ng_ui_router_css_defer'),
			css_loader = new msos.loader(),
			css_name = '';

		css_loader.add_resource_onload.push(
			function () {
				ng.ui.router.css.tracking[css_name] = msos.registered_files.css[css_name];
				deferred.resolve();
			}
		);

		css_name = css_loader.load(
			definition.url,
			'css',
			{ media: 'all' }
		);

        return deferred.promise;
    }

	function loadStylesForState($transition$) {
		var temp_ls = 'ng.ui.router.css - loadStylesForState -> ',
			debug = '',
			css_el,
			definitionChain = [],
			state = $transition$.to(),
			obj,
			definitions = {},
			promises = [],
			output;

		currentDefQueue = [];

		if (vcss) {
			msos.console.debug(temp_ls + 'start, to state:', state);
		}

		// Disable all ui-router-css loaded stylesheets
		for (css_el in ng.ui.router.css.tracking) {
			if (ng.ui.router.css.tracking.hasOwnProperty(css_el)) {
				ng.ui.router.css.tracking[css_el].disabled = true;
			}
		}

		if (state.data && state.data.css) {

			obj = state.data;

			while (obj !== null) {
				definitionChain.unshift(obj.css);
				obj = Object.getPrototypeOf(obj);
			}
		}

		function inject($inject) {
			return _$injector.invoke($inject, null, { $transition$: $transition$ }, 'ng_ui_router_loadStyles');
		}

		angular.forEach(
			definitionChain,
			function (_definitions) {
				if (isInjectable(_definitions)) {
					_definitions = normalizeStyleDefinitions(inject(_definitions));
				}
				angular.extend(definitions, _definitions);
			}
		);

		// Make sure we're working with a fresh object as it might otherwise lead to issues
		definitions = angular.copy(definitions);

		angular.forEach(
			definitions,
			function (definition) {
				var css_name = '';

				if (isInjectable(definition)) {
					definition = normalizeStyleDef(inject(definition));
				}

				if (definition.url === null || definition.url === undefined) {
					if (vcss) {
						msos.console.debug(temp_ls + 'skip css for null/undefined in definition.');
					}
					return;
				}

				css_name = msos.generate_url_name(definition.url);

				// Only load new css files
				if (ng.ui.router.css.tracking[css_name]) {
					ng.ui.router.css.tracking[css_name].disabled = false;
					debug += ' enabled: ' + css_name;
				} else {
					promises.push(loadStyleDefinition(definition));
					debug += ' created: ' + css_name;
				}

				currentDefQueue.push(definition);
			}
		);

		debug += ' promises: ' + promises.length;

		if (ng.ui.router.css.events_enabled) {
			_$rootScope.$broadcast(EVENTS_NAMESPACE + '.' + EVENT_LOADING_STARTED, currentDefQueue);

			output = _$q.all(_$q.defer('ng_ui_router_css_broadcast_all'), promises.length ? promises : true).then(
				function () {
					_$rootScope.$broadcast(EVENTS_NAMESPACE + '.' + EVENT_LOADING_FINISHED);
				}
			);
		} else {
			// Only wait if there are promises to wait for...
			output = _$q.all(_$q.defer('ng_ui_router_css_broadcast_all'), promises.length ? promises : true);
		}

		if (vcss) {
			msos.console.debug(temp_ls + ' done, debug:' + debug);
		}

		return output;
	}

	function loadStylesForStateComplete() {
		var temp_lc = 'ng.ui.router.css - loadStylesForStateComplete -> ';

		// Here for future needs, if any.

		if (vcss) {
			msos.console.debug(temp_lc + 'called.');
		}
	}

    angular.module(
		'ng.ui.router.css',
		['ng', 'ng.ui.router']
	).config(
		['$stateProvider', function ($stateProvider) {
			// Using data decorator to normalize style definitions.
			$stateProvider.decorator(
				'data',
				function (state, parent) {
					var data = parent(state);

					if (data && data.css) {
						data.css = normalizeStyleDefinitions(data.css);
					}

					return data;
				}
			);
		}]
	).run(
		['$rootScope', '$transitions', '$q', '$injector',
			function ($rootScope, $transitions, $q, $injector) {

			// set a few service references so they can be used without passing them around between functions
			_$rootScope = $rootScope;
			_$q = $q;
			_$injector = $injector;

			$transitions.onBefore(
				{},
				function (transition) {
					transition.addResolvable({
						token: '@css',
						resolveFn: function () {
							return loadStylesForState(transition);
						}
					});
				}
			);

			$transitions.onSuccess(
				{},
				function () { loadStylesForStateComplete(); }
			);
		}]
	).service(
		'hlUiRouterCss',
		['$timeout', function ($timeout) {
			this.toggleStyleDefinitions = function (definitions) {
				definitions = normalizeStyleDefinitions(definitions);

				if (vcss) {
					msos.console.debug('ng.ui.router.css - hlUiRouterCss -> called, definitions:', definitions);
				}

				// Immediately inject the stylesheets at the next tick
				$timeout(
					function () {
						if (vcss) {
							msos.console.debug('ng.ui.router.css - hlUiRouterCss -> loading...');
						}

						angular.forEach(
							definitions,
							function (def_hlUi) {
								if (vcss === 'router') {
									msos.console.debug('ng.ui.router.css - hlUiRouterCss -> toggle: ' + def_hlUi.url);
								}

								ng.ui.router.css.themes.toggle_css.push(
									ng.ui.router.css.themes.load(def_hlUi.url, 'css')
								);
							}
						);
					},
					0
				);
			};
		}]
	);

})(angular);
