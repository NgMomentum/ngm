
/*global
    msos: false,
    angular: false
*/

msos.provide("demo.simple.translate.start");
msos.require("ng.translate");
msos.require("ng.translate.staticfiles");


msos.onload_func_done.push(
    function () {
        "use strict";

        var temp_pp = 'demo.simple.translate.start -> ';

        msos.console.debug(temp_pp + 'start.');

        angular.module(
			'demo.simple.translate.start',
			['ng', 'ng.translate', 'ng.translate.staticfiles']
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
						return '<span style="color: #cccccc">' +
									translationId + '(' + lang + ')' +
								'</span>' +
								'<div>' +
									(interpolatedTranslation ? interpolatedTranslation : translation) +
								'</div>';
					}
				);
            }]
		).controller(
			'demo.simple.translate.start.ctrl',
			['$scope', '$translate', function ($scope, $translate) {

                $scope.setLang = function (langKey) {
                    // You can change the language during runtime
                    $translate.use(langKey);
                };
            }]
		);

        angular.bootstrap('body', ['demo.simple.translate.start']);

        msos.console.debug(temp_pp + 'done!');
    }
);