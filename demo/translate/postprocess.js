
/*global
    msos: false,
    angular: false
*/

msos.provide("demo.translate.postprocess");
msos.require("ng.route");
msos.require("ng.resource");
msos.require("ng.touch");
msos.require("ng.translate.staticfiles");
msos.require("ng.locale.dynamic");


msos.onload_func_done.push(
    function () {
        "use strict";

        var temp_pp = 'demo.translate.postprocess -> ';

        msos.console.debug(temp_pp + 'start.');

        angular.module(
			'demo.translate.postprocess',
			['ng', 'ng.sanitize', 'ng.translate', 'ng.translate.staticfiles']
		).config(
			['$translateProvider', function ($translateProvider) {

                // Register a loader for the static files
                // So, the module will search missing translation tables under the specified urls.
                // Those urls are [prefix][langKey][suffix].
                $translateProvider.useStaticFilesLoader({
                    prefix: 'I10n/',
                    suffix: '.json'
                });

                // Tell the module what language to use by default
                $translateProvider.fallbackLanguage('ru_RU');
                $translateProvider.preferredLanguage('en_US');

                // Tell the module to store the language in the cookies
                $translateProvider.useStorage();

                // Tell the module to postprocess the translations in success cases
                $translateProvider.postProcess(
					function (translationId, translation, interpolatedTranslation, params, lang) {
						return '<span style="color: #cccccc">' + translationId + '(' + lang + '):</span> ' + (interpolatedTranslation ? interpolatedTranslation : translation);
					}
				);
            }]
		).controller(
			'demo.translate.postprocess.ctrl',
			['$scope', '$translate', function ($scope, $translate) {

                $scope.setLang = function (langKey) {
                    // You can change the language during runtime
                    $translate.use(langKey);
                };
            }]
		);

        angular.bootstrap('body', ['demo.translate.postprocess']);

        msos.console.debug(temp_pp + 'done!');
    }
);