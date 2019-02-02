
/*global
    angular: false,
    msos: false
*/

msos.provide("demo.uirouter.ngcss.start");
msos.require("ng.ui.router.css");
msos.require("msos.google.prettify");
msos.require("ng.bootstrap.ui.dropdown");

demo.uirouter.ngcss.start.prettify = new msos.loader();
demo.uirouter.ngcss.start.prettify.load(msos.resource_url('css', 'prettify.css'));
demo.uirouter.ngcss.start.prettify.load(msos.resource_url('fonts', 'css/glyphicons.uc.css'));


msos.onload_functions.push(
	function () {
		"use strict";

		// Use UI-Router-CSS events for this demo
		ng.ui.router.css.events_enabled = true;

		var nonSpace = /\S/,
			entityMap = {
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': '&quot;',
				"'": '&#39;',
				"/": '&#x2F;'
			};

		function escapeHtml(string) {
			return String(string).replace(
					/[&<>"'\/]/g,
					function (s) { return entityMap[s]; }
				);
		}

		function trimIndent(content) {
			var lines = content.split("\n"),
				begin = 0,
				end = lines.length - 1,
				ident,
				formatted = "",
				i = 0;

			while ((nonSpace.exec(lines[begin]) === null || nonSpace.exec(lines[begin]) === undefined) && (begin < lines.length)) {
				begin = begin + 1;
			}

			while ((nonSpace.exec(lines[end]) === null || nonSpace.exec(lines[end]) === undefined) && end >= begin) {
				end = end - 1;
			}

			ident = nonSpace.exec(lines[begin]).index;

			for (i = begin; i <= end; i += 1) {
				formatted = formatted + lines[i].slice(ident-1) + ((i < end)?"\n":"");
			}

			return formatted.replaceAll('\t', '&nbsp;&nbsp;');
		}

		String.prototype.replaceAll = function (search, replacement) {
			var target = this;

			return target.replace(new RegExp(search, 'g'), replacement);
		};


		angular.module(
			'demo.uirouter.ngcss.start.utils.strings',
			['ng']
		).factory(
			's',
			function () {
				var $utils = {};

				$utils.textFromHtml = function (str) {
					return str ? String(str).replace(/<[^>]+>/gm, '') : '';
				};

				$utils.firstToUpperCase = function (str) {
					var trimmed = str.trim();

					return trimmed.substr(0, 1).toUpperCase() + trimmed.substr(1);
				};

				$utils.firstToLowerCase = function (str) {
					var trimmed = str.trim();

					return trimmed.substr(0, 1).toLowerCase() + trimmed.substr(1);
				};

				$utils.camelCase = function (str) {

					return str.toLowerCase().replace(
							/-(.)/g,
							function (match, group1) {
								return group1.toUpperCase();
							}
						);
				};

				return $utils;
			}
		);


		angular.module(
			'demo.uirouter.ngcss.start',
			[
				'ng',
				'ng.ui.router',
				'ng.ui.router.css',
				'ng.bootstrap.ui',
				'ng.bootstrap.ui.dropdown',
				'demo.uirouter.ngcss.start.utils.strings'
			]
		).config(
			['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

				$urlRouterProvider.otherwise('/');

				$stateProvider
					.state(
						'root',
						{
							abstract: true,
							url: '',
							views: {
								'@': {
									templateUrl: 'views/layout.html',
									controller: 'RootController'
								},
								'header@root': {
									templateUrl: 'views/header.html'
								},
								'footer@root': {
									templateUrl: 'views/footer.html'
								}
							}
						}
					).state(
						'root.home',
						{
							url: '/',
							views: {
								'content@root': {
									templateUrl: 'views/getting-started.html'
								}
							}
						}
					).state(
						'root.api',
						{
							abstract: true,
							url: '/api',
							views: {
								'content@root': {
									templateUrl: 'views/api/document.html'
								}
							}
						}
					).state(
						'root.api.directive',
						{
							url: '/directive/:name',
							templateUrl: function (stateParams) {
								return 'views/api/directives/' + stateParams.name + '.html';
							}
						}
					).state(
						'root.api.service',
						{
							url: '/service/:name',
							templateUrl: function (stateParams) {
								return 'views/api/services/' + stateParams.name + '.html';
							}
						}
					).state(
						'root.demo',
						{
							url: '/demo',
							views: {
								'content@root': {
									templateUrl: 'views/demo/demo.html',
									controller: 'DemoCtrl'
								}
							},
							data: {
								css: {
									root: 'styles/demo/core.css'
								}
							}
						}
					).state(
						'root.demo.home',
						{
							url: '/home',
							templateUrl: 'views/demo/pages/home.html',
							data: {
								css: 'styles/demo/pages/home.css'
							}
						}
					).state(
						'root.demo.about',
						{
							abstract: true,
							url: '/about',
							templateUrl: 'views/demo/pages/about.html',
							data: {
								css: {
									about: 'styles/demo/pages/about.css'
								}
							}
						}
					).state(
						'root.demo.about.me',
						{
							url: '/me',
							templateUrl: 'views/demo/pages/about-me.html',
							data: {
								css: ['styles/demo/pages/about-me.css']
							}
						}
					).state(
						'root.demo.about.the-project',
						{
							url: '/the-project',
							templateUrl: 'views/demo/pages/about-the-project.html',
							data: {
								css: {
									about: null,
									aboutTheProject: 'styles/demo/pages/about-the-project.css'
								}
							}
						}
					).state(
						'root.demo.contact',
						{
							url: '/contact',
							templateUrl: 'views/demo/pages/contact.html',
							data: {
								css: ['styles/demo/pages/contact.css']
							}
						}
					).state(
						'root.demo.contact.employee',
						{
							url: '?employee',
							templateUrl: 'views/demo/pages/contact-employee.html',
							controller: ['$scope', '$transition$', function demo_contact_empl_ctrl($scope, $transition$) {
								var params = $transition$.params();

								$scope.employee = {
									name: params.employee
								};
							}],
							data: {
								css: {
									employeeCore: 'styles/demo/employees/core.css',
									employee: ['$transition$', function ($transition$) {
										return 'styles/demo/employees/' + $transition$.params().employee + '.css';
									}]
								}
							}
						}
					);
			}]
		).controller(
			'RootController',
			['$rootScope', '$document', function ($rootScope, $document) {

				$rootScope.$on(
					'$stateChangeSuccess',
					function () {
						$document[0].body.scrollTop = $document[0].documentElement.scrollTop = 0;
					}
				);
			}]
		).controller(
			'DemoCtrl',
			['$rootScope', '$scope', 'hlUiRouterCss', '$state',
			function ($rootScope, $scope, hlUiRouterCss, $state) {

				$scope.definitions = [];

				$rootScope.$on(
					'uiRouterCss.loadingStarted',
					function (event, definitions) {
						$scope.definitions = definitions;
					}
				);

				// make sure I enter a demo page as this will cause the definitions to be shown correctly
				if ($state.$current.name === 'root.demo') {
					$state.go('root.demo.home');
				}

				$scope.theme = { model: 'light' };

				function applyTheme() {

					$scope.theme.path = 'styles/demo/themes/' + $scope.theme.model + '.css';

					// inject the custom theme stylesheet and sae the reference
					hlUiRouterCss.toggleStyleDefinitions($scope.theme.path);
				}

				$scope.themeChange = function () { applyTheme(); };

				applyTheme();
			}]
		).filter(
			'firstToUpperCase',
			function (s) {
				return function (str) {
						return s.firstToUpperCase(str);
				};
			}
		).factory(
			"$savedContent",
			function () { return {}; }
		).directive(
			"saveContent",
			['$savedContent', function ($savedContent) {
				return {
					restrict: "A",
					compile: function ($element, $attrs) {
						$savedContent[$attrs.saveContent] = $element.html();
					}
				};
			}]
		).directive(
			"applyContent",
			['$savedContent', function ($savedContent) {
				return {
					restrict: "EAC",
					compile: function ($element) {
						var beforeCompile = $element.html();

							return function ($scope, $element, $attrs) {

								function apply() {

									var content = $savedContent[$attrs.applyContent],
										lang,
										pre;

									if (!content) { content = beforeCompile; }

									lang = $attrs.highlightLang;

									if (lang == "html") { content = escapeHtml(content); }

									content = trimIndent(content);

									pre = msos.google.prettify.prettyPrintOne(content, lang);
									$element.html(pre);
								}

								if (angular.isDefined($attrs.contentWatch)) { $scope.$watch(apply); }
								else { apply(); }
							};
					}
				};
			}]
		).directive(
			'scrollTo',
			['$log', 'offset', function ($log, offset) {
				return {
					restrict: 'A',
					priority: 100,
					link: function (scope, element, attrs) {

						if (!angular.isDefined(attrs.scrollTo) && attrs.scrollTo !== '') {
							$log.error('Directive "scroll-to" must have a value. E.g.: scroll-to="element-id"');
						}

						var gotoElement = null;

						$(element).mousedown(
							function () {
								scope.$apply(
									function () {
										if (!gotoElement) {
											gotoElement = document.getElementById(attrs.scrollTo);

											if (gotoElement === null) {
												$log.warn('Element with id "' + attrs.scrollTo + '" does not exist');
											}
										}

										offset.scrollToElement(gotoElement);
									});
							}
						);

						scope.$on(
							'$destroy',
							function () { gotoElement = null; }
						);
					}
				};
			}]
		).directive(
			'highlightLang',
			angular.restrictADir
		);
	}
);

msos.onload_func_post.push(
	function () {
		"use strict";

		angular.bootstrap('#body', ['demo.uirouter.ngcss.start']);
	}
);
