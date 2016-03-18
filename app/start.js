
msos.provide('app.start');

angular.module(
	'uiRouterSample.contacts',
	['ui.router']).config(
		['$stateProvider', '$urlRouterProvider', function ($stateProvider,   $urlRouterProvider) {
			$stateProvider
				.state(
					'contacts',
					{
						'abstract': true,	// active by children only
						url: '/contacts',	// prepend '/contacts' onto the urls of all its children
						templateUrl: msos.resource_url('app', 'contacts/contacts.html'),

						resolve: {
							contacts: ['contacts', function (contacts) {
								return contacts.all();
							}]
						},

						controller: ['$scope', '$state', 'contacts', 'utils', function ($scope, $state, contacts, utils) {

							$scope.contacts = contacts;
							$scope.goToRandom = function () {
								var randId = utils.newRandomKey(
										$scope.contacts,
										"id",
										$state.params.contactId
									);

								$state.go(
									'contacts.detail',
									{ contactId: randId }
								);
							};
						}]
					}
				).state(
					'contacts.list',
					{
						url: '',										// url is '/contacts' (because '/contacts' + '')
						templateUrl: msos.resource_url('app', 'contacts/contacts.list.html')	// inserted into this state's parent's template
					}
				).state(
					'contacts.detail',
					{
						url: '/{contactId:[0-9]{1,4}}',
						views: {
							'': {
								templateUrl: msos.resource_url('app', 'contacts/contacts.detail.html'),
								controller: ['$scope', '$stateParams', 'utils', function ($scope, $stateParams,  utils) {
									$scope.contact = utils.findById($scope.contacts, $stateParams.contactId);
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
								templateUrl: msos.resource_url('app', 'contacts/contacts.detail.item.html'),
								controller: ['$scope', '$stateParams', '$state', 'utils', function ($scope, $stateParams, $state, utils) {
									$scope.item = utils.findById($scope.contact.items, $stateParams.itemId);
	
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
								templateUrl: msos.resource_url('app', 'contacts/contacts.detail.item.edit.html'),
								controller: ['$scope', '$stateParams', '$state', 'utils', function ($scope, $stateParams, $state, utils) {
									$scope.item = utils.findById($scope.contact.items, $stateParams.itemId);
									$scope.done = function () {
										// '^' means up one, '^.^' up twice, to the grandparent
										$state.go('^', $stateParams);
									};
								}]
							}
						}
					}
				);
		}]
	);

angular.module(
	'uiRouterSample.contacts.service',
	[]
	).factory(
		'contacts',
		['$http', 'utils', function ($http, utils) {
			var path = msos.resource_url('app', 'contacts/data.json'),
				contacts = $http.get(path).then(
					function (resp) {
						return resp.data.contacts;
					}
				),
				factory = {};

			factory.all = function () {
				return contacts;
			};

			factory.get = function (id) {
				return contacts.then(
						function () {
							return utils.findById(contacts, id);
						}
					);
			};

			return factory;
		}]
	);

angular.module(
	'uiRouterSample.utils.service',
	[]
	).factory(
		'utils',
		function () {
			return {
				findById: function findById(a, id) {
					for (var i = 0; i < a.length; i++) {
						if (a[i].id == id) return a[i];
					}

					return null;
				},
				newRandomKey: function newRandomKey(coll, key, currentKey) {
					var randKey;

					do {
						randKey = coll[Math.floor(coll.length * Math.random())][key];
					} while (randKey == currentKey);

					return randKey;
				}
			};
		}
	);

msos.onload_functions.push(
	function () {

		var temp_sd = 'app.start';

		msos.console.debug(temp_sd + ' -> start.');

		app.start = angular.module(
			'app.start', [
				'uiRouterSample.contacts',
				'uiRouterSample.contacts.service',
				'uiRouterSample.utils.service',
				'ui.router', 
				'ngAnimate'
			]
		);

		app.start.run(
					['$rootScope', '$state', '$stateParams',
			function ($rootScope,   $state,   $stateParams) {

				$rootScope.$state = $state;
				$rootScope.$stateParams = $stateParams;
			}]
		);
/*
		app.start.config(
			function ($controllerProvider, $provide, $compileProvider) {
 
				var app = app.start;

				// Let's keep the older references.
				app._controller = app.controller;
				app._service = app.service;
				app._factory = app.factory;
				app._value = app.value;
				app._directive = app.directive;
 
				// Provider-based controller.
				app.controller = function (name, constructor) {
					$controllerProvider.register(name, constructor );
					return (this);
				};
 
				// Provider-based service.
				app.service = function (name, constructor) {
					$provide.service(name, constructor);
					return (this);
				};
 
				// Provider-based factory.
				app.factory = function (name, factory) {
					$provide.factory( name, factory );
					return (this);
				};
 
				// Provider-based value.
				app.value = function (name, value) {
					$provide.value(name, value);
					return (this);
				};
 
				// Provider-based directive.
				app.directive = function (name, factory) {
					$compileProvider.directive( name, factory );
					return (this);
				};
			}
		);
*/
		app.start.config(
				['$stateProvider', '$urlRouterProvider', function ($stateProvider,   $urlRouterProvider) {

				$urlRouterProvider
					.when('/c?id', '/contacts/:id')
					.when('/user/:id', '/contacts/:id')
					.otherwise('/');

				$stateProvider
					.state(
						"home",
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
					)
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
