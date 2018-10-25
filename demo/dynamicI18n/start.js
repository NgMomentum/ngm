
/*global
    msos: false,
    angular: false
*/

msos.provide("demo.dynamicI18n.start");
msos.require("ng.locale.dynamic");


msos.onload_func_done.push(
    function () {
        "use strict";

        var temp_di = 'demo.dynamicI18n.start -> ';

        msos.console.debug(temp_di + 'start.');

		angular.module(
			'demo.dynamicI18n.start',
			['ng', 'ngLocale', 'ng.locale.dynamic']
		).config(
			['tmhDynamicLocaleProvider', function (tmhDynamicLocaleProvider) {
				tmhDynamicLocaleProvider.localeLocationPattern('https://code.angularjs.org/1.2.20/i18n/angular-locale_{{locale}}.js');
			}]
		).controller(
			'demo.dynamicI18n.start.ctrl',
			['$rootScope', 'tmhDynamicLocale', '$locale', function ($rootScope, tmhDynamicLocale, $locale) {
				$rootScope.availableLocales = {
					'en': 'English',
					'de': 'German',
					'fr': 'French',
					'ar': 'Arabic',
					'ja': 'Japanese',
					'ko': 'Korean',
					'zh': 'Chinese'
				};

				$rootScope.model = { selectedLocale: 'en' };
				$rootScope.$locale = $locale;
				$rootScope.changeLocale = tmhDynamicLocale.set;
			}]
		);

        angular.bootstrap('#body', ['demo.dynamicI18n.start']);

        msos.console.debug(temp_di + 'done!');
    }
);
