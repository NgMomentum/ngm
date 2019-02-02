
/*global
    angular: false,
    msos: false,
    demo: false
*/

msos.provide("demo.visualizer.start");
msos.require("ng.util.oclazyload");

demo.visualizer.start.version = new msos.set_version(18, 12, 7);

// Load the very large Visualizer file
demo.visualizer.start.vis = new msos.loader();
demo.visualizer.start.vis.load(msos.resource_url('ng', 'ui/router/visualizer/v600_msos.uc.js'));


var HomeController = function () {
    function HomeController() {
      msos._classCallCheck(this, HomeController);
    }

    HomeController.prototype.$onInit = function $onInit() {
		msos.console.info("demo.visualizer.start -> Hello from home component!");
    };

    return HomeController;
}();


msos.onload_functions.push(
	function () {
		"use strict";

		angular.module(
			'demo.visualizer.start',
			['ng', 'ng.ui.router', 'ng.util.oclazyload']
		).run(
			['$uiRouter', '$trace', function ($uiRouter, $trace) {

				// Auto-collapse children in state visualizer
				var Visualizer = window['@uirouter/visualizer'].Visualizer,
					registry = $uiRouter.stateRegistry;

				registry.get('deepnest').$$state()._collapsed = true;
				registry.get('deepnest.nest1').$$state()._collapsed = true;
				registry.get('deepnest.nest2').$$state()._collapsed = true;
				registry.get('deepnest.nest3').$$state()._collapsed = true;

				$uiRouter.plugin(Visualizer);

				// Always include transition tracing.
				// (msos.config.debug and msos.config.verbose include more)
				$trace.enable('TRANSITION');

			}]
		).config(
			['$stateProvider', function ($stateProvider) {

				$stateProvider.state(
					{
						name: 'home',
						component: 'home',
						url: '/home'
					}
				).state(
					{
						name: 'about',
						component: 'about',
						url: '/about'
					}
				).state(
					{
						name: 'about.lazy.**',
						url: '/lazy',
						lazyLoad: function lazyLoad(trans) {
							return trans.injector().get('$ocLazyLoad').load(msos.resource_url('demo', 'visualizer/_lazy.js')).then(true);
						}
					}
				).state(
					{
						name: 'home.foo',
						url: '/foo',
						resolve: {
							fooData: function fooData() {
								return ['foo', 'FOO', 'Fu'];
							}
						},
						component: 'foo'
					}
				).state(
					{
						name: 'home.bar',
						url: '/bar',
						resolve: {
							barData: function barData() {
								return ['bar', 'snickers', 'cheers'];
							}
						},
						component: 'bar'
					}
				);

				function makeDeepNestState(name, component, _links) {
					return {
						name: name,
						component: component,
						url: '/' + name.split(".").pop(),
						resolve: {
							state: function state() { return name; },
							links: function links() { return _links; }
						}
					};
				}

				$stateProvider
				 .state(makeDeepNestState('deepnest', 'deepNest', ['.nest1', '.nest2', '.nest3'])
				).state(makeDeepNestState('deepnest.nest1', 'autoNest', ['.sub1', '.sub2', '.sub3'])
				).state(makeDeepNestState('deepnest.nest2', 'autoNest', ['.sub1', '.sub2'])
				).state(makeDeepNestState('deepnest.nest3', 'autoNest', ['.sub1', '.sub2'])
				).state(makeDeepNestState('deepnest.nest1.sub1', 'autoNest', [])
				).state(makeDeepNestState('deepnest.nest1.sub2', 'autoNest', [])
				).state(makeDeepNestState('deepnest.nest1.sub3', 'autoNest', [])
				).state(makeDeepNestState('deepnest.nest2.sub1', 'autoNest', [])
				).state(makeDeepNestState('deepnest.nest2.sub2', 'autoNest', [])
				).state(makeDeepNestState('deepnest.nest3.sub1', 'autoNest', [])
				).state(makeDeepNestState('deepnest.nest3.sub2', 'autoNest', []));

			}]

		).component(
			'home',
			{
				template: '\n      <h1>home state loaded</h1>\n      <h4>This state has two substates: </h4>\n      <a ui-sref="home.foo" ui-sref-active="active">home.foo</a>\n      <a ui-sref="home.bar" ui-sref-active="active">home.bar</a>\n      <div ui-view></div>\n    ',
				controller: HomeController
			}
		).component(
			'about',
			{
				template: '\n      <h1>about state loaded</h1>\n      <h4>This state has a nested state tree that is lazy loaded: </h4>\n      <a ui-sref="about.lazy" ui-sref-active="active">about.lazy</a>\n      <div ui-view></div>\n    '
			}
		).component(
			'deepNest',
			{
				controller: function () {
					// deepNest requires a controller to execute, even if it is noop...
					msos.console.info("demo.visualizer.start -> dumby controller for deepNest");
				},
				template: '\n      <h1>Top of deeply nested state tree loaded</h1>\n      <h4>The state visualizer automatically collapses this state\'s children</h4>\n      <h4>Double click a state in the state visualizer to toggle auto-collapsing.</h4>\n      \n      <button ng-repeat="link in $ctrl.links" ui-state="link" ui-sref-active="active">\n        {{ link }}\n      </button>\n      <div ui-view></div>\n    ',
				bindings: { state: '<', links: '<' }
			}
		).component(
			'autoNest',
			{
				controller: function () {
					// autoNest requires a controller to execute, even if it is noop...
					msos.console.info("demo.visualizer.start -> dumby controller for autoNest");
				},
				template: '\n      <h1>{{ $ctrl.state }} state loaded (deep nested subtree)</h1>\n      <button ng-repeat="link in $ctrl.links" ui-state="link" ui-sref-active="active">\n        {{ link }}\n      </button>\n      <div ui-view></div>\n    ',
				bindings: { state: '<', links: '<' }
			}
		).component(
			'bar',
			{
				controller: function () {
					// bar requires a controller to execute, even if it is noop...
					msos.console.info("demo.visualizer.start -> dumby controller for bar");
				},
				template: '\n      <h1>bar state loaded</h1>\n      <h4>This state has some resolve data:</h4>\n      <ul><li ng-repeat="bar in $ctrl.barData">{{bar}}</li></ul>\n      <div ui-view></div>\n    ',
				bindings: { barData: "<" }
			}
		).component(
			'foo',
			{
				controller: function () {
					// foo requires a controller to execute, even if it is noop...
					msos.console.info("demo.visualizer.start -> dumby controller for foo");
				},
				template: '\n      <h1>foo state loaded</h1>\n      <h4>This state has some resolve data:</h4>\n      <ul><li ng-repeat="foo in $ctrl.fooData">{{foo}}</li></ul>\n      <div ui-view></div>\n    ',
				bindings: { fooData: "<" }
			}
		);
	}
);

msos.onload_func_post.push(
	function () {
		"use strict";

		angular.bootstrap('#body', ['demo.visualizer.start']);
	}
);
