
/*global
    angular: false,
    msos: false
*/

msos.provide("demo.oclazyload.start");
msos.require("ng.util.oclazyload");		// We load ocLazyLoad via MSOS since we have it as a MSOS module,
										// and it doesn't make any difference with it's operation...

msos.onload_functions.push(
	function () {
		"use strict";

		var temp_oc = 'demo.oclazyload.start -> ';

		angular.module(
			'demo.oclazyload.start',
			['ng', 'ng.ui.router', 'ng.sanitize', 'ng.util.oclazyload']
		).config(
			['$stateProvider', '$locationProvider', '$urlRouterProvider',
			 function ($stateProvider, $locationProvider, $urlRouterProvider) {

				$urlRouterProvider.otherwise("/");
				$locationProvider.hashPrefix('!');
				$locationProvider.html5Mode(false);

				$stateProvider
					.state(
						'index',
						{
							url: "/",
							views: {
								"lazyLoadView": {
									controller: 'demo.oclazyload.start.ctrl',
									templateUrl: 'partials/main.html'
								}
							}
						}
					).state(
						'modal',
						{
							parent: 'index',
							resolve: {
								loadOcModal: ['$ocLazyLoad', '$injector', '$rootScope', function ($ocLazyLoad, $injector, $rootScope) {

									msos.console.info(temp_oc + 'loading...');

									return $ocLazyLoad.load(
											[
												msos.resource_url('demo', 'oclazyload/css/ocModal.animations.css'),
												msos.resource_url('demo', 'oclazyload/css/ocModal.light.css'),
												msos.resource_url('demo', 'oclazyload/js/ocModal.js'),
												msos.resource_url('demo', 'oclazyload/partials/modal.html')
											]
										).then(
											function () {

												msos.console.info(temp_oc + 'then...');

												// inject the lazy loaded service
												var $ocModal = $injector.get("$ocModal");

												$ocModal.open({
													url: 'modal',
													cls: 'fade-in'
												});

												$rootScope.openModal = function () {
													$ocModal.open({
														url: 'modal',
														cls: 'flip-vertical'
													});
												};

												$rootScope.bootstrapLoaded = true;

												msos.console.info(temp_oc + 'done.');
											}
										);
								}]
							}
						}
					);
			}]
		).controller(
			'demo.oclazyload.start.ctrl',
			['$scope', '$ocLazyLoad', function ($scope, $ocLazyLoad) {

				$ocLazyLoad.config.events = true;

				$scope.$on('ocLazyLoad.moduleLoaded', function(e, params) {
					msos.console.info(temp_oc + 'event module loaded', params);
				});

				$scope.$on('ocLazyLoad.fileLoaded', function(e, file) {
					msos.console.info(temp_oc + 'event file loaded', file);
				});

				$scope.loadBootstrap = function() {

					var unbind = $scope.$on('ocLazyLoad.fileLoaded', function(e, file) {
							if (file === msos.resource_url('ng', 'bootstrap/css/ui/modal.css')) {
								$scope.bootstrapLoaded = true;
								unbind();
							}
						});

					$ocLazyLoad.load([
						msos.resource_url('fonts', 'css/fontawesome.uc.css'),
						msos.resource_url('ng', 'bootstrap/css/v337/wo_icons.uc.css'),
						msos.resource_url('ng', 'bootstrap/css/v337/theme.uc.css'),
						msos.resource_url('ng', 'bootstrap/css/ui/misc.css'),
						msos.resource_url('ng', 'bootstrap/css/ui/modal.css')
					]);
				};
			}]
		);
	}
);

msos.onload_func_post.push(
	function () {
		"use strict";

		angular.bootstrap('body', ['demo.oclazyload.start']);
	}
);
