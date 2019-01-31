
msos.provide("ng.vue.plugins");

ng.vue.plugins.version = new msos.set_version(19, 1, 28);

(function(w_angular, w_Vue) {
    "use strict";

    var _extends = Object.assign || _.assign,
		pluginHooks = Object.create(null),
		defaultHooks = [
			"beforeCreated", "created", "beforeMount", "mounted",
			"beforeUpdate", "updated", "beforeDestroy", "destroyed"
		],
		vueHooks = Object.create(null),
		registered = Object.create(null),
		lazyStringFilters = [],
		ngFilters,
		onPluginInit;

    function addHooks(map, hooks) {
		if (hooks) {
			Object.keys(hooks).forEach(
				function (h) {
					map[h] = map[h] ? map[h] : [];
					map[h].push(hooks[h]);
				}
			);
		}
    }

    function callHooks(map, name, callback) {
        var hooks = map[name];

		if (hooks) {
			hooks.forEach(callback);
		}
    }

    function addFilter(name, filter) {
        registered[name] = filter;
    }

    function registerFilters(filters) {
		if (angular.isArray(filters)) {
			lazyStringFilters = lazyStringFilters.concat(filters);
		} else if (angular.isObject(filters)) {
			Object.keys(filters).forEach(
				function (name) {
					addFilter(name, filters[name]);
				}
			);
		}
    }

    ngFilters = function(Vue$$1) {
		Object.keys(registered).forEach(
			function (name) {
				return Vue$$1.filter(name, registered[name]);
			}
		);
	};

	onPluginInit = function ($injector_out, Vue$$1) {

		(function ($injector_in) {
			var $filter = $injector_in.get("$filter");

			lazyStringFilters.forEach(
				function (name) {
					addFilter(name, $filter(name));
				}
			);

			lazyStringFilters = [];

		}($injector_out));

		Vue$$1.use(ngFilters);
	};

    w_angular.module(
		"ng.vue.plugins",
		["ng"]
	).config(
		["$ngVueProvider", function ($ngVueProvider) {

			$ngVueProvider.install(
				function () {
					return {
						$name: "filters",
						$config: { register: registerFilters },
						$plugin: { init: onPluginInit }
					};
				}
			);

		}]
	).provider(
		"$ngVue",
		["$injector", function ($injector) {
			var _this = this,
				_inQuirkMode = !1,
				rootProps = {};

			this.activeQuirkMode = function () {
				_inQuirkMode = !0;
			};

			this.enableVuex = function (store) {
				msos.console.warn("ng.vue.plugins - $ngVue -> enableVuex() is deprecated.\n     Consider switching to setRootVueInstanceProps().");

				Object.assign(
					rootProps,
					{ store: store }
				);

			};

			this.setRootVueInstanceProps = function (props) {
				Object.keys(props).filter(
					function (hookName) {
						return defaultHooks.includes(hookName);
					}
				).forEach(
					function (hookName) {
						return delete props[hookName];
					}
				);

				Object.assign(rootProps, props);

			};

			this.install = function (plugin) {
				var _plugin = plugin($injector),
					$name = _plugin.$name,
					$config = _plugin.$config,
					$plugin = _plugin.$plugin,
					$vue = _plugin.$vue;

				addHooks(pluginHooks, $plugin);
				addHooks(vueHooks, $vue);

				angular.extend(
					_this,
					msos._defineProperty({}, $name, $config)
				);
			};

			this.$get = ["$injector", function ($injector) {
				var hookCallback, cb = function (hook) {
						hook($injector, w_Vue, this);
					};

				callHooks(pluginHooks, "init", cb);
		
				Object.assign(
					rootProps,
					(
						hookCallback = cb, 
						Object.keys(vueHooks).reduce(
							function (available, name) {
								return _extends(
									{},
									available,
									msos._defineProperty(
										{},
										name,
										function () {
											var _cb = hookCallback.bind(this);
											callHooks(vueHooks, name, _cb);
										}
									)
								);
							},
							{}
						)
					)
				);

				return {
					getRootProps: function () {
						return rootProps;
					},
					inQuirkMode: function () {
						return _inQuirkMode;
					}
				};
			}];
		}]
	);

}(angular, Vue));
