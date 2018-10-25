
/*global
    msos: false,
    angular: false
*/

msos.provide("demo.easyfb.start");
msos.require("ng.route");
msos.require("ng.util.easyfb");


msos.onload_func_done.push(
    function () {
        "use strict";

        var temp_ez = 'demo.easyfb.start -> ';

        msos.console.debug(temp_ez + 'start.');

		angular.module(
			'demo.easyfb.start',
			['ng', 'ng.route', 'ng.util.easyfb']
		).constant(
			'SOCIAL_PLUGINS',
			[
				'like', 'share', 'post', 'video', 'comments', 'page',
				'follow', 'send', 'messages', 'login', 'embed', 'save'
			]
		).config(
			['ezfbProvider', '$routeProvider', 'SOCIAL_PLUGINS',
			 function (ezfbProvider, $routeProvider, SOCIAL_PLUGINS) {

				ezfbProvider.setInitParams({
					appId: msos.config.oauth2.facebook,
					version: 'v2.6'
				});

				$routeProvider.otherwise({
					redirectTo: '/video'
				});

				angular.forEach(SOCIAL_PLUGINS, function (dirTag) {
					var routeName = dirTag;

					$routeProvider
						.when('/' + routeName, {
							templateUrl: msos.resource_url('demo', 'easyfb/tmpl/' + routeName + '.html'),
						});
				});
			}]
		).controller(
			'demo.easyfb.start.ctrl',
			['$scope', '$route', 'SOCIAL_PLUGINS', '$location',
			 function ($scope, $route, SOCIAL_PLUGINS, $location) {

				$scope.SOCIAL_PLUGINS = SOCIAL_PLUGINS;

				$scope.pluginOn = true;
				$scope.rendering = false;

				$scope.goto = function (dirTag) {
					$location.path('/' + dirTag);
				};

				$scope.isActive = function (dirTag) {
					return ($location.path() === '/' + dirTag);
				};

				$scope.rendered = function () {
					msos.console.info(temp_ez + '$scope.rendered fired.');
					$scope.rendering = false;
				};

				$scope.$watch(
					'pluginOn',
					function (newVal, oldVal) {
						msos.console.info(temp_ez + 'pluginOn $watch fired.');
						if (newVal !== oldVal) {
							$scope.rendering = true;
						}
					}
				);

				$scope.$on(
					'$routeChangeSuccess',
					function () {
						msos.console.info(temp_ez + '$routeChangeSuccess fired.');
						$scope.rendering = true;
					}
				);
			}]
		);

        angular.bootstrap('#body', ['demo.easyfb.start']);

        msos.console.debug(temp_ez + 'done!');
    }
);
