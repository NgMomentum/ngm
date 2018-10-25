
/*global
    msos: false,
    jQuery: false,
    angular: false,
    demo: false
*/

msos.provide("demo.start");
msos.require("ng.bootstrap.ui.dropdown");
msos.require("ng.material.core.theming");

if (msos.config.run_analytics) {
	msos.require("ng.google.ga");
}

// Start by loading our demo.start specific stylesheet
demo.start.css = new msos.loader();
demo.start.css.load(msos.resource_url('demo', 'site.css'));


msos.onload_functions.push(
	function () {
		"use strict";

		var temp_sd = 'demo.start',
			bootstrap_ctrls = [
				'accordion', 'alert', 'buttons', 'carousel', 'collapse', 'datepicker', 'dateparser',
				'datepickerpopup', 'dropdown', 'modal', 'pager', 'pagination', 'popover', 'position',
				'progressbar', 'rating', 'tabs', 'timepicker', 'tooltip', 'typeahead', 'bootstrap'
			],
			material_ctrls = [
				'autocomplete', 'bottomsheet', 'button', 'card', 'checkbox', 'chips', 'colors',
				'content', 'datepickermd', 'dialogmd', 'divider', 'fabspeeddial', 'fabtoolbar',
				'gridlist', 'icon', 'input', 'list', 'menu', 'menubar', 'navbar', 'panel',
				'progresscir', 'progresslin', 'radio', 'select', 'sidenav', 'slider', 'subheader',
				'swipe', 'switch', 'tabsmd', 'toast', 'toolbarmd', 'tooltipmd', 'truncate',
				'repeater', 'whiteframe', 'material'
			],
			chartjs_ctrls = ['fat', 'annotation', 'gauge', 'chartjs'],
			easyfb_ctrls = [
				'activity', 'comments', 'easyfb', 'facepile', 'follow', 'like', 'login', 'messages',
				'page', 'post', 'recommendations', 'send', 'share', 'video',
				 
			],
			widget_ctrls = [
				'widgets', 'culture', 'smarttable', 'ngreacttable', 'localstorage',
				'editor', 'editor2', 'editor3', 'masonry', 'tictactoe', 'visualizer'
			],
			prefetch_dependent = ['tictactoe', 'ngreacttable'];

		msos.console.debug(temp_sd + ' -> start.');

		function find_by_id(data_obj, id) {
			var i = 0;

			for (i = 0; i < data_obj.length; i += 1) {
				if (data_obj[i].id == id) { return data_obj[i]; }
			}

			return null;
		}

		demo.start = angular.module(
			'demo.start', [
				'ng.ui.router',
				'ng.sanitize',
				'ng.postloader',
				'ng.bootstrap.ui',		// important to inject base UI-Bootstrap code
				'ng.material.core',		// important to inject base AngularJS Material code
				'ng.bootstrap.ui.dropdown'
			]
		).factory(
			'$app_contacts',
			['$http', function ($http) {
				var path = msos.resource_url('demo', 'contacts/data.json'),
					http_contacts = $http.get(path).then(
						function (resp) {
							return resp.data.contacts;
						}
					),
					factory = {};

				factory.all = function () {
					return http_contacts;
				};

				factory.get = function (id) {
					return http_contacts.then(
						function () {
							return demo.contacts.start.find(http_contacts, id);
						}
					);
				};

				return factory;
			}]
		);

		demo.start.config(
					['$stateProvider', '$urlRouterProvider',
			function ($stateProvider,   $urlRouterProvider) {
				var generic_chart_routing_obj;

				msos.console.debug('demo.start.config -> start.');

				function gen_routing_object(ui_name, ui_group) {
					return {
						url: '/' + ui_name,
						templateUrl : msos.resource_url('demo', ui_group + '/tmpl/' + ui_name + '.html'),
						resolve: {
							load: ['$postload', function ($postload) {

								var module_name = 'demo.' + ui_group +'.controllers.' + ui_name,
									module_id = module_name.replace(/\./g, '_');

								// If already loaded, just continue resolve
								if (msos.registered_modules[module_id]) {
									return true;
								}

								// Otherwise, request specific demo module
								msos.require(module_name);

								// Then, start AngularJS module registration process
								return $postload.run_registration();
							}]
						}
					};
				}

				$stateProvider
					.state(
						'contacts',
						{
							'abstract': true,	// active by children only
							url: '/contacts',	// prepend '/contacts' onto the urls of all its children
							templateUrl: msos.resource_url('demo', 'contacts/tmpl/contacts.html'),

							resolve: {
								$app_contacts: [
									'$app_contacts',
									function ($app_contacts) { return $app_contacts.all(); }
								]
							},

							controller: [
								'$scope', '$state', '$app_contacts',
								function ($scope, $state, $app_contacts) {

									function get_random_key(scope_contacts, key, currentKey) {
										var randKey;

										do {
											randKey = scope_contacts[Math.floor(scope_contacts.length * Math.random())][key];
										} while (randKey == currentKey);

										return randKey;
									}

									$scope.contacts = $app_contacts;

									$scope.goToRandom = function () {
										var randId = get_random_key(
												$scope.contacts,
												"id",
												$state.params.contactId
											);

										$state.go(
											'contacts.detail',
											{ contactId: randId }
										);
									};
								}
							]
						}
					).state(
						'contacts.list',
						{
							url: '',	// url is '/contacts' (because '/contacts' + '')
							templateUrl: msos.resource_url('demo', 'contacts/tmpl/list.html')	// inserted into this state's parent's template
						}
					).state(
						'contacts.detail',
						{
							url: '/{contactId:[0-9]{1,4}}',
							views: {
								'': {
									templateUrl: msos.resource_url('demo', 'contacts/tmpl/detail.html'),
									controller: ['$scope', '$stateParams', function ($scope, $stateParams) {
										$scope.contact = find_by_id($scope.contacts, $stateParams.contactId);
									}]
								},
								'hint@': {
									template: 'This is contacts.detail populating the "hint" ui-view'
								},
								'menuTip': {
									templateProvider: ['$stateParams', function ($stateParams) {
										// even though the global '$stateParams' has not been updated yet.
										return '<hr><small class="muted">Contact ID: ' + $stateParams.contactId + '</small>';
									}]
								}
							}
						}
					).state(		// Contacts > Detail > Item
						'contacts.detail.item',
						{
							url: '/item/:itemId',		// as /contacts/{contactId}/item/:itemId
							views: {
								'': {
									templateUrl: msos.resource_url('demo', 'contacts/tmpl/detail/item.html'),
									controller: ['$scope', '$stateParams', '$state', function ($scope, $stateParams, $state) {
										$scope.item = find_by_id($scope.contact.items, $stateParams.itemId);

										$scope.edit = function () {
											// '^' to go up, '.' to go down as contacts.detail.item.edit
											$state.go('.edit', $stateParams);
										};
									}]
								},
								'hint@': {
									template: ' This is contacts.detail.item overriding the "hint" ui-view'
								}
							}
						}
					).state(		// Contacts > Detail > Item > Edit => via $state.go (or transitionTo)
						'contacts.detail.item.edit',
						{
							views: {
								'@contacts.detail': {
									templateUrl: msos.resource_url('demo', 'contacts/tmpl/detail/item/edit.html'),
									controller: ['$scope', '$stateParams', '$state', function ($scope, $stateParams, $state) {
										$scope.item = find_by_id($scope.contact.items, $stateParams.itemId);
										$scope.done = function () {
											// '^' means up one, '^.^' up twice, to the grandparent
											$state.go('^', $stateParams);
										};
									}]
								}
							}
						}
					).state(
						'home',
						{
							url: "/",
							templateUrl: msos.resource_url('demo', 'bootstrap/tmpl/home.html')
						}
					).state(
						'router',
						{
							url: "/router",
							templateUrl: msos.resource_url('demo', 'contacts/tmpl/router.html')
						}
					).state(
						'about',
						{
							url: '/about',
							templateUrl: msos.resource_url('demo', 'contacts/tmpl/about.html')
						}
					).state(
						'bootstrap_menu',
						{
							url: '/bootstrap_menu',
							templateUrl: msos.resource_url('demo', 'bootstrap/tmpl/bootstrap_menu.html')
						}
					).state(
						'widgets_menu',
						{
							url: '/widgets_menu',
							templateUrl: msos.resource_url('demo', 'widgets/tmpl/widgets_menu.html')
						}
					).state(
						'router_menu',
						{
							url: '/router_menu',
							templateUrl: msos.resource_url('demo', 'contacts/tmpl/router_menu.html')
						}
					).state(
						'material_menu',
						{
							url: '/material_menu',
							templateUrl: msos.resource_url('demo', 'material/tmpl/material_menu.html')
						}
					);

				// Angular-UI-Bootstrap examples
				jQuery.each(
					bootstrap_ctrls,
					function (index, route) {
						$stateProvider.state(
							route,
							gen_routing_object(route, 'bootstrap')
						);
					}
				);

				// Material Design examples
				jQuery.each(
					material_ctrls,
					function (index, route) {
						$stateProvider.state(
							route,
							gen_routing_object(route, 'material')
						);
					}
				);

				// Angular Controlled Google Chart examples
				jQuery.each(
					chartjs_ctrls,
					function (index, route) {
						$stateProvider.state(
							route,
							gen_routing_object(route, 'chartjs')
						);
					}
				);

				// Set up state <=> routing for Chartjs "generic" template page
				generic_chart_routing_obj = gen_routing_object('generic', 'chartjs');
				generic_chart_routing_obj.url += '/:chartType';

				$stateProvider
					.state(
						'generic',
						generic_chart_routing_obj
					);

				// Angular-EasyFb examples
				jQuery.each(
					easyfb_ctrls,
					function (index, route) {
						$stateProvider.state(
							route,
							gen_routing_object(route, 'easyfb')
						);
					}
				);

				// Angular-Widgets examples
				jQuery.each(
					widget_ctrls,
					function (index, route) {
						$stateProvider.state(
							route,
							gen_routing_object(route, 'widgets')
						);
					}
				);

				$urlRouterProvider
					.when('/c?id', '/contacts/:id')
					.when('/user/:id', '/contacts/:id')
					.otherwise('/');

				msos.console.debug('demo.start.config ->  done!');
			}]
		);

		demo.start.run(
			['$rootScope', '$state', '$stateParams', function ($rootScope,   $state,   $stateParams) {
				var redirect_url = '';

				msos.console.debug('demo.start.run -> called.');

				// Special case pages requiring prefetch files (which aren't ready on initial page load)
				redirect_url = msos.check_prefetch_dependent(prefetch_dependent, 'home');

				if (redirect_url) {

					if (msos.config.verbose) {
						alert('demo.start.run -> page not ready, redirecting to: ' + redirect_url);
					}

					location.assign(redirect_url);
				}

				// Grab state output for diagnostic output display
				$rootScope.diagnostic_state = $state;
				$rootScope.diagnostic_stateParams = $stateParams;
			}]
		);

		if (ng.google && ng.google.ga) {
			// Add Google Analytics page transition tracking
			demo.start.config(ng.google.ga);
		}

		msos.console.debug(temp_sd + ' -> done!');
	}
);

msos.onload_func_done.push(
	function demo_start_onload() {
		"use strict";

		angular.bootstrap('#body', ['demo.start']);
	}
);
