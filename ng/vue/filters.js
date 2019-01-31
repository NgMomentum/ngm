
msos.provide("ng.vue.filters");

ng.vue.filters.version = new msos.set_version(19, 1, 28);


(function (w_angular) {
    "use strict";

    var originalModule = w_angular.module;

    function evaluateFilterFunction(name, def) {
		var obj = {},
			key = name,
			value = def();

		if (key in obj) {
			Object.defineProperty(
				obj,
				key,
				{
					value: value,
					enumerable: !0,
					configurable: !0,
					writable: !0
				}
			);
		} else {
			obj[key] = value;
		}

        return obj;
    }

    function _hasDependence($injector, ngDef) {
        return 0 < $injector.annotate(ngDef).length;
    }

    w_angular.module = function (moduleName) {
		var _len = arguments.length,
			otherArgs = Array(1 < _len ? _len - 1 : 0),
			_key = 0,
			module,
			$injector,
			originalFilter,
			filters = [];

        for (_key = 1; _key < _len; _key += 1) { otherArgs[_key - 1] = arguments[_key]; }

        module = originalModule.apply(
			void 0,
			[moduleName].concat(otherArgs)
		);

        $injector = w_angular.injector(["ng", moduleName]);

        if (!$injector.has("$ngVue")) {
			throw new Error("ngVue.plugins should be required as a dependency in your application");
        }

        originalFilter = module.filter;

		module.provider(
			"$ngVueFilter",
			["$filterProvider", "$ngVueProvider", function ($filterProvider, $ngVueProvider) {
				var temp_fp = 'ng.vue.filters - $ngVueFilter';

				this.register = function (name, ngDef) {

					msos.console.debug(temp_fp + ' - register -> called, name: ' + name);

					$filterProvider.register(name, ngDef);

					if (_hasDependence($injector, ngDef)) {
						$ngVueProvider.filters.register(
							evaluateFilterFunction(name, ngDef)
						);
					}

				};
				this.$get = function () {
					msos.console.debug(temp_fp + ' - $get -> called.');
				};
			}]
		);

		module.filter = function (name, ngDef) {

			if (_hasDependence($injector, ngDef)) {
				filters.push(
					evaluateFilterFunction(name, ngDef)
				);
			}

			return originalFilter.apply(this, arguments);
		};

		module.config(
			["$ngVueProvider", function ($ngVueProvider) {
				filters.forEach(
					function (f) {
						return $ngVueProvider.filters.register(f);
					}
				);
				filters = [];
			}]
		);

        return module;
    };
}(angular));