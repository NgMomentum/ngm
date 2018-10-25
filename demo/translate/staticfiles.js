
/*global
    msos: false,
    angular: false
*/

msos.provide("demo.translate.staticfiles");
msos.require("ng.route");
msos.require("ng.resource");
msos.require("ng.touch");
msos.require("ng.translate.staticfiles");
msos.require("ng.translate.partialfiles");
msos.require("ng.locale.dynamic");


msos.onload_func_done.push(
    function () {
        "use strict";

        var temp_sf = 'demo.translate.staticfiles -> ';

        msos.console.debug(temp_sf + 'start.');

        angular.module(
			'demo.translate.staticfiles',
			['ng', 'ng.sanitize', 'ng.translate', 'ng.translate.staticfiles', 'ng.translate.partialfiles']
		).config(
			['$translateProvider', '$provide', '$translatePartialLoaderProvider',
			 function ($translateProvider, $provide, $translatePartialLoaderProvider) {
                $translateProvider.useLoader(
					'$translatePartialLoader',
					{ urlTemplate: 'I10n/partial/{part}/{lang}.json' }
				);
                // Tell the module what language to use by default
                $translateProvider.preferredLanguage('en_US');
                // Tell the module to store the language in the cookies
                $translateProvider.useStorage();
                $translatePartialLoaderProvider.addPart('root');
            }]
		).controller(
			'demo.translate.staticfiles.ctrl',
			['$scope', '$translate', '$translatePartialLoader',
			 function ($scope, $translate, $translatePartialLoader) {

                $scope.setLang = function (langKey) {
                    // You can change the language during runtime
                    $translate.use(langKey);
                };

                $scope.loadModule = function ($event, module) {
                    $event.preventDefault();
                    $translatePartialLoader.addPart(module);
                    $translate.refresh();
                };

                $scope.unloadModule = function ($event, module) {
                    $event.preventDefault();
                    $translatePartialLoader.deletePart(module);
                    $translate.refresh();
                };

            }]
		);

        angular.bootstrap('body', ['demo.translate.staticfiles']);

        msos.console.debug(temp_sf + 'done!');
    }
);