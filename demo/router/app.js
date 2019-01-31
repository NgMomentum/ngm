
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.router.app");
msos.require("ng.ui.router.extras");
msos.require("ng.ui.router.extras.dsr");
msos.require("ng.ui.router.extras.sticky");
msos.require("ng.util.oclazyload");
msos.require("demo.router.app.global");	// Not actually "used" here, but in demo.router.app components below.
msos.require("demo.router.app.authed");
msos.require("demo.router.app.welcome");
msos.require("demo.router.app.login");
msos.require("demo.router.app.home");
msos.require("demo.router.app.states");

// Load the very large Visualizer file
demo.router.app.vis = new msos.loader();
demo.router.app.vis.load(msos.resource_url('ng', 'ui/router/visualizer.uc.js'));


demo.router.app.setProp = function setProp(obj, key, val) {
	"use strict";

	obj[key] = val;return obj;
};

demo.router.app.pushToArr = function pushToArr(array, item) {
	"use strict";

	array.push(item);return array;
};

demo.router.app.guidChar = function guidChar(c) {
	"use strict";

	return c !== 'x' && c !== 'y' ? '-' : Math.floor(Math.random() * 16).toString(16).toUpperCase();
};

demo.router.app.guid = function guid() {
	"use strict";

	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("").map(demo.router.app.guidChar).join("");
};


msos.onload_func_done.push(
	function () {
		"use strict";

		var temp_sd = 'demo.router.app';

		msos.console.debug(temp_sd + ' -> start.');

		angular.module(
			'demo.router.app',
			[
				'ng', 'ng.sanitize', 'ng.ui.router', 'ng.util.oclazyload',
				'ng.ui.router.extras', 'ng.ui.router.extras.dsr', 'ng.ui.router.extras.sticky',
				'demo.router.app.global'
			]
		).run(
			['$uiRouter', '$trace', function ($uiRouter, $trace) {

				// Auto-collapse children in state visualizer
				var Visualizer = window['ui-router-visualizer'].Visualizer;

				$uiRouter.plugin(Visualizer);

				$trace.enable('TRANSITION');
			}]
		).config(
			['$uiRouterProvider', '$locationProvider', function ($uiRouterProvider, $locationProvider) {

				$locationProvider.hashPrefix('');

				var $urlService = $uiRouterProvider.urlService,
					$stateRegistry = $uiRouterProvider.stateRegistry,
					dra = demo.router.app;

				$urlService.rules.otherwise({ state: 'welcome' });

				$stateRegistry.register(dra.states.appState);
				$stateRegistry.register(dra.states.homeState);
				$stateRegistry.register(dra.states.loginState);
				$stateRegistry.register(dra.states.welcomeState);

				$stateRegistry.register(dra.states.contactsFutureState);
				$stateRegistry.register(dra.states.prefsFutureState);
				$stateRegistry.register(dra.states.mymessagesFutureState);
			}]
		).component(
			'demo.router.app.authed',
			demo.router.app.authed
		).component(
			'demo.router.app.welcome',
			demo.router.app.welcome
		).component(
			'demo.router.app.login',
			demo.router.app.login
		).component(
			'demo.router.app.home',
			demo.router.app.home
		);

		angular.bootstrap('#body', ['demo.router.app']);

		msos.console.debug(temp_sd + 'done!');
	}
);