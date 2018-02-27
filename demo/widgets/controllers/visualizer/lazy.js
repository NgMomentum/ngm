
angular.module(
	'lazy',
	['ng', 'ng.ui.router']
).run(
	['$uiRouter', function ($uiRouter) {
		"use strict";

		var registry = $uiRouter.stateRegistry;

		registry.register(
			{
				name: 'about.lazy',
				component: 'lazy',
				url: '/lazy' }
			);
		registry.register(
			{
				name: 'about.lazy.child',
				component: 'lazyChild',
				url: '/child'
			}
		);
	}]
).component(
	'lazy',
	{ template: "<h1>Lazy state</h1>" + "<a ui-sref='.child' ui-sref-active='active'>lazy.child</a>" + "<ui-view></ui-view>" }
).component(
	'lazyChild',
	{ template: "<h1>Lazy Child</h1>" + "<ui-view></ui-view>" }
);

