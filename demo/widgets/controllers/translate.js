
/*global
    msos: false,
    demo: false
*/

msos.provide("demo.widgets.controllers.translate");
msos.require("ng.translate");
msos.require("ng.translate.staticfiles");
msos.require("ng.translate.partialfiles");

demo.widgets.controllers.translate.version = new msos.set_version(19, 1, 17);


(function () {
	"use strict";

	var temp_sf = 'demo.widgets.controllers.translate -> ';

	msos.console.debug(temp_sf + 'start.');

	angular.module(
		'demo.widgets.controllers.translate',
		['ng', 'ng.translate', 'ng.translate.staticfiles', 'ng.translate.partialfiles']
	).config(
		['$translateProvider', '$translatePartialLoaderProvider',
		 function ($translateProvider, $translatePartialLoaderProvider) {
			$translateProvider.useLoader(
				'$translatePartialLoader',
				{ urlTemplate: msos.resource_url('demo', 'widgets/controllers/I10n/partial/{part}/{lang}.json') }
			);
			// Tell the module what language to use by default
			$translateProvider.preferredLanguage('en_US');
			// Tell the module to store the language in the cookies
			$translateProvider.useStorage();
			$translatePartialLoaderProvider.addPart('root');
		}]
	).controller(
		'demo.widgets.controllers.translate.ctrl',
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

	msos.console.debug(temp_sf + 'done!');

}());
