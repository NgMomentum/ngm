
/*global
    msos: false,
    jQuery: false,
    angular: false,
    demo: false
*/

msos.provide('demo.ng.start');
msos.require('ng.route');
msos.require('ng.bootstrap.ui.dropdown');

demo.ng.start.css = new msos.loader();

// Load the page specific css (but after ./config.js loaded css)
demo.ng.start.css.load(msos.resource_url('demo', 'ng/css/demo.css'), 'css');


msos.onload_functions.push(
	function () {
		"use strict";

		var temp_sd = 'demo.ng.start';

		msos.console.debug(temp_sd + ' -> start.');

		demo.ng.start = angular.module('demo.ng.start', ['ngRoute', 'ng.bootstrap.ui', 'ng.bootstrap.ui.dropdown']);

		// The basic technique below was derived from the example at:
		// http://www.bennadel.com/blog/2554-loading-angularjs-components-with-requirejs-after-application-bootstrap.htm
		demo.ng.start.config(
			['$controllerProvider', '$provide', '$compileProvider', function ($controllerProvider, $provide, $compileProvider) {

				var app = demo.ng.start;

				// Let's keep the older references.
				app._controller = app.controller;
				app._service = app.service;
				app._factory = app.factory;
				app._value = app.value;
				app._directive = app.directive;

				// Provider-based controller.
				app.controller = function (name, constructor) {
					$controllerProvider.register(name, constructor);
					return (this);
				};

				// Provider-based service.
				app.service = function (name, constructor) {
					$provide.service(name, constructor);
					return (this);
				};

				// Provider-based factory.
				app.factory = function (name, factory) {
					$provide.factory(name, factory);
					return (this);
				};

				// Provider-based value.
				app.value = function (name, value) {
					$provide.value(name, value);
					return (this);
				};

				// Provider-based directive.
				app.directive = function (name, factory) {
					$compileProvider.directive(name, factory);
					return (this);
				};
			}]
		);

		demo.ng.start.factory(
			"get_template",
			['$templateCache', '$http', function ($templateCache, $http) {

				function load_template(scpe, pge) {

					msos.console.debug(temp_sd + ' - get_template -> called: ' + pge.url);

					scpe.template = pge.url;

					$http(
						{
							method: 'GET',
							url: pge.url,
							cache: $templateCache
						}
					).then(
						function (response) {
							// response.data, response.status, response.headers, config
							var html_in = response.data;

							scpe.html = html_in;
							jQuery('textarea').text(html_in);	// Had to go with this due to IE
						},
						function (response) {
							scpe.html = 'Unable to load code: ' + response.status;
						}
					);
				}

				return load_template;
			}]
		);

		demo.ng.start.factory(
			"get_script",
			['$rootScope', '$q', 'get_template', function ($rootScope, $q, get_template) {

				var deferred = $q.defer('demo_ng_start_factory');

				function load_script(scpe, pge) {

					msos.console.debug(temp_sd + ' - load_script -> called: ' + pge.script);

					jQuery.ajax(
						{
							url: pge.script,
							dataType: "script",
							cache: true
						}
					).done(
						function () {
							msos.console.debug(temp_sd + ' - load_script -> loaded: ' + pge.script);

							// possibly should be -> $rootScope.$evalAsync(function () { ... });
							$rootScope.$apply(
								function () {
									deferred.resolve();
									get_template(scpe, pge);
								}
							);
						}
					).fail(
						function (jqxhr_na, settings_na, e) {
							msos.console.debug(temp_sd + ' - load_script -> error: ', e);

							$rootScope.$apply(
								function () {
									deferred.reject(e);
								}
							);
						}
					);
				}

				return load_script;
			}]
		);

        demo.ng.start.controller(
            'samplesController',
            ['$scope', 'get_template', 'get_script', function ($scope, get_template, get_script) {

				var res_url = msos.resource_url;

				$scope.template = '';
                $scope.html = '';
                $scope.pages = [
                    {
                        title: 'Data Binding Basics',
                        url: res_url('demo', 'ng/pages/1_basics.html'),
						icon: 'fa-chevron-right'
                    },
                    {
                        title: 'Initialize Data',
                        url: res_url('demo', 'ng/pages/2_init.html'),
						icon: 'fa-chevron-right'
                    },
                    {
                        title: 'Looping with ng-repeat',
                        url: res_url('demo', 'ng/pages/3_looping.html'),
						icon: 'fa-chevron-right'
                    },
                    {
                        title: 'Adding a Simple Controller',
                        url: res_url('demo', 'ng/pages/4_controller.html'),
						script: res_url('demo', 'ng/scripts/4_controller.js'),
						icon: 'fa-chevron-right'
                    },
                    {
                        title: 'Filtering and Sorting Data',
                        url: res_url('demo', 'ng/pages/5_filtering.html'),
						script: res_url('demo', 'ng/scripts/5_filtering.js'),
						icon: 'fa-chevron-right'
                    },
                    {
                        title: 'Simple Application w/Filtering',
                        url: res_url('demo', 'ng/pages/6_simple.html'),
						icon: 'fa-chevron-right'
                    },
                    {
                        title: 'Using ng-init and ng-repeat w/Objects',
                        url: res_url('demo', 'ng/pages/7_objects.html'),
						icon: 'fa-chevron-right'
                    },
                    {
                        title: 'Using Multiple Controllers',
                        url: res_url('demo', 'ng/pages/8_multiple.html'),
						script: res_url('demo', 'ng/scripts/8_multiple.js'),
						icon: 'fa-chevron-right'
                    },
                    {
                        title: 'Using Select Element',
                        url: res_url('demo', 'ng/pages/9_select.html'),
						script: res_url('demo', 'ng/scripts/9_select.js'),
						icon: 'fa-chevron-right'
                    },
                    {
                        title: 'Using Dropdown Menu',
                        url: res_url('demo', 'ng/pages/10_dropdown.html'),
						script: res_url('demo', 'ng/scripts/10_dropdown.js'),
						icon: 'fa-chevron-right'
                    },
                    {
                        title: 'NgM, Ultra Simple',
                        url: '',
                        href: '../simple/index.html',
						icon: 'fa-external-link'
                    },
                    {
                        title: 'NgM, Simple Routing',
                        url: '',
                        href: '../route/index.html',
						icon: 'fa-external-link'
                    },
                    {
                        title: 'NgM, Mobile Angular',
                        url: '',
                        href: '../mobile/index.html',
						icon: 'fa-external-link'
                    },
                    {
                        title: 'NgM, Customer Demo',
                        url: '',
                        href: '../customer/index.html',
						icon: 'fa-external-link'
                    }
                ];

                $scope.loadPage = function (page) {

                    if (page.href) {
                        document.location = page.href;	// Load new page
                    }

					if (page.script)	{ get_script($scope, page); }
					else				{ get_template($scope, page); }
                };
            }]
        );

		msos.console.debug(temp_sd + ' -> done!');
	}
);

msos.onload_func_done.push(
	function () {
		"use strict";

		angular.bootstrap('body', ['demo.ng.start']);
	}
);
