
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.uirouter.simple.start");

demo.uirouter.simple.start.version = new msos.set_version(18, 12, 7);

// Load the very large Visualizer file
demo.uirouter.simple.start.vis = new msos.loader();
demo.uirouter.simple.start.vis.load(msos.resource_url('ng', 'ui/router/visualizer/v600_msos.uc.js'));


msos.onload_func_done.push(
	function () {
		"use strict";

		var temp_sd = 'demo.uirouter.simple.start';

		msos.console.debug(temp_sd + ' -> start.');

		angular.module(
			'demo.uirouter.simple.start',
			[
				'ng',
				'ng.postloader',
				'ng.ui.router'
			]
		).config(
			['$stateProvider', function ($stateProvider) {
				// An array of state definitions
				var states = [
						{
							name: 'hello',
							url: '/hello',
							// Using component: instead of template:
							component: 'hello',
							lazyLoad: function lazyLoad(trans) {
								msos.require("demo.uirouter.simple.components.hello");
								return trans.injector().get('$postload').load();
							}
						},
						{
							name: 'about',
							url: '/about',
							component: 'about',
							lazyLoad: function lazyLoad(trans) {
								msos.require("demo.uirouter.simple.components.about");
								return trans.injector().get('$postload').load();
							}
						},
						{
							name: 'people',
							url: '/people',
							component: 'people',
							// This state defines a 'people' resolve
							// It delegates to the PeopleService to HTTP fetch (async)
							// The people component receives this via its `bindings: `
							resolve: {
								people: ['PeopleService', function (PeopleService) {
									var output = PeopleService.getAllPeople();
									msos.console.info('demo.uirouter.simple.start - resolve - people -> called,\n     ', PeopleService, output);
									return output;
								}]
							},
							lazyLoad: function lazyLoad(trans) {
								msos.require("demo.uirouter.simple.services.people");	// provides "PeopleService"
								msos.require("demo.uirouter.simple.components.people");	// provides "people" component
								return trans.injector().get('$postload').load();
							}
						},
						{
							name: 'person',
							// This state takes a URL parameter called personId
							url: '/people/{personId}',
							component: 'person',
							// This state defines a 'person' resolve
							// It delegates to the PeopleService, passing the personId parameter
							resolve: {
								person: ['PeopleService', '$transition$', function (PeopleService, $transition$) {
									var output = PeopleService.getPerson($transition$.params().personId);
									msos.console.info('demo.uirouter.simple.start - resolve - person -> called,\n     ', $transition$, output);
									return output;						}]
							},
							lazyLoad: function lazyLoad(trans) {
								msos.require("demo.uirouter.simple.services.people");
								msos.require("demo.uirouter.simple.components.person");
								return trans.injector().get('$postload').load();
							}
						}
					];
		
				// Loop over the state definitions and register them
				states.forEach(
					function (state) {
						$stateProvider.state(state);
					}
				);
			}]
		).run(
			['$uiRouter', function ($uiRouter) {
				var StateTree = window['@uirouter/visualizer'].StateTree,
					el = StateTree.create(
						$uiRouter,
						null,
						{
							height: 100,
							width: 300
						}
					);
		
				el.className = 'statevis';
			}]
		);

		angular.bootstrap('#body', ['demo.uirouter.simple.start']);

		msos.console.debug(temp_sd + 'done!');
	}
);
