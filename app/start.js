
msos.provide("app.start");
msos.require("app.contacts.service.http");
msos.require("ng.bootstrap.ui.dropdown");


msos.onload_functions.push(
	function () {

		var temp_sd = 'app.start';
			bootstrap_ctrls = [
				'accordion', 'alert', 'buttons', 'carousel', 'collapse', 'datepicker', 'dateparser',
				'datepickerpopup', 'dropdown', 'modal', 'pager', 'pagination', 'popover', 'position',
				'progressbar', 'rating', 'tabs', 'timepicker', 'tooltip', 'typeahead', 'overview'
			];

		msos.console.debug(temp_sd + ' -> start.');

		app.start = angular.module(
			'app.start', [
				'app.contacts.service.http',
				'ui.router',
				'ngAnimate',
				'ngSanitize',
				'ngPostloader',
				'ng.bootstrap.ui',
				'ng.bootstrap.ui.dropdown'
			]
		);

		app.start.config(
					['$stateProvider', '$urlRouterProvider',
			function ($stateProvider,   $urlRouterProvider) {

				function get_random_key(scope_contacts, key, currentKey) {
					var randKey;

					do {
						randKey = scope_contacts[Math.floor(scope_contacts.length * Math.random())][key];
					} while (randKey == currentKey);

					return randKey;
				}

				function find_by_id(data_obj, id) {
					var i = 0;

					for (i = 0; i < data_obj.length; i += 1) {
						if (data_obj[i].id == id) { return data_obj[i]; }
					}

					return null;
				}

				function load_specific_module(_q, _rootScope, _postload, specific_name) {

					var defer = _q.defer('app_contacts_start_config'),
						module_name = 'app.bootstrap.controllers.' + specific_name;

					// Request specific module
					msos.require(module_name);

					// Resolve deferred module loading
					msos.onload_func_done.push(
						function () {

							// Register any just loaded AngularJS modules
							_postload.run_registration();

							// Let AngularJS do it's thing
							defer.resolve();
							_rootScope.$apply();
						}
					);

					// Run specific MobileSiteOS module code, plus MSOS dependencies, plus register AngularJS dependencies
					msos.run_onload();

					return defer.promise;
				}

				function gen_routing_object(ui_name) {
					return {
						url: '/' + ui_name,
						templateUrl : msos.resource_url('app', 'bootstrap/tmpl/' + ui_name + '.html'),
						controller  : 'app.bootstrap.controllers.' + ui_name + '.ctrl',
						resolve: {
							load: ['$q', '$rootScope', '$postload', function ($q, $rootScope, $postload) {
								return load_specific_module($q, $rootScope, $postload, ui_name);
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
							templateUrl: msos.resource_url('app', 'contacts/tmpl/home.html'),
	
							resolve: {
								contacts: [
									'contacts',
									function (contacts) { return contacts.all(); }
								]
							},
	
							controller: [
								'$scope', '$state', 'contacts',
								function ($scope, $state, contacts) {
	
									$scope.contacts = contacts;
	
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
							templateUrl: msos.resource_url('app', 'contacts/tmpl/list.html')	// inserted into this state's parent's template
						}
					).state(
						'contacts.detail',
						{
							url: '/{contactId:[0-9]{1,4}}',
							views: {
								'': {
									templateUrl: msos.resource_url('app', 'contacts/tmpl/detail.html'),
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
									templateUrl: msos.resource_url('app', 'contacts/tmpl/detail/item.html'),
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
									templateUrl: msos.resource_url('app', 'contacts/tmpl/detail/item/edit.html'),
									controller: ['$scope', '$stateParams', '$state',function ($scope, $stateParams, $state) {
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
							template:
								'<p class="lead">Welcome to the UI-Router Demo</p>' +
								'<p>Use the menu above to navigate. ' +
								'Pay attention to the <code>$state</code> and <code>$stateParams</code> values below.</p>' +
								'<p>Click these links—<a href="#/c?id=1">Alice</a> or ' +
								'<a href="#/user/42">Bob</a>—to see a url redirect in action.</p>'
						}
					).state(
						'about',
						{
							url: '/about',
							templateProvider:
								['$timeout', function ($timeout) {
									return $timeout(
										function () {
											return	'<p class="lead">UI-Router Resources</p>' +
													'<ul>' +
														'<li><a href="https://github.com/angular-ui/ui-router/tree/master/sample">Source for this Sample</a></li>' +
														'<li><a href="https://github.com/angular-ui/ui-router">GitHub Main Page</a></li>' +
														'<li><a href="https://github.com/angular-ui/ui-router#quick-start">Quick Start</a></li>' +
														'<li><a href="https://github.com/angular-ui/ui-router/wiki">In-Depth Guide</a></li>' +
														'<li><a href="https://github.com/angular-ui/ui-router/wiki/Quick-Reference">API Reference</a></li>' +
													'</ul>';
										},
										100
									);
								}]
						}
					);

				jQuery.each(
					bootstrap_ctrls,
					function (index, route) {
						$stateProvider.state(
							route,
							gen_routing_object(route)
						);
					}
				);

				$urlRouterProvider
					.when('/c?id', '/contacts/:id')
					.when('/user/:id', '/contacts/:id')
					.otherwise('/');
			}]
		);

		app.start.run(
					['$rootScope', '$state', '$stateParams',
			function ($rootScope,   $state,   $stateParams) {

				// Grab state output for diagnostic output
				$rootScope.diagnostic_state = $state;
				$rootScope.diagnostic_stateParams = $stateParams;
			}]
		);

		msos.console.debug(temp_sd + ' -> done!');
	}
);

msos.onload_func_done.push(
	function () {
		angular.bootstrap('body', ['app.start']);
	}
);
