
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
				var bs_file = msos.resource_url('ng', 'bootstrap/css/ui/modal.css'),
					cfg = { events: true };

				$ocLazyLoad.config(cfg);
				$scope.bootstrapLoaded = false;

				$scope.$on(
					'ocLazyLoad.moduleLoaded',
					function (e, params) {
						msos.console.info(temp_oc + 'event module loaded', params);
					}
				);

				var unbind = $scope.$on(
						'ocLazyLoad.fileLoaded',
						function (e, file) {
							if (file === bs_file) {
								$scope.bootstrapLoaded = true;
								unbind();
							}
							msos.console.info(temp_oc + 'event file loaded', file);
						}
					);

				$scope.loadBootstrap = function () {
					msos.console.info(temp_oc + 'loadBootstrap fired.');

					$ocLazyLoad.load([bs_file]);
				};
			}]
		);
	}
);

msos.onload_func_post.push(
	function () {
		"use strict";

		angular.bootstrap('#body', ['demo.oclazyload.start']);
	}
);
