
/*global
    msos: false,
    angular: false,
    demo: false
*/


msos.provide("demo.widgets.controllers.dynamicI18n");
msos.require("ng.locale.dynamic");

demo.widgets.controllers.dynamicI18n.version = new msos.set_version(19, 1, 17);


(function () {
	"use strict";

	var temp_di = 'demo.widgets.controllers.dynamicI18n -> ';

	msos.console.debug(temp_di + 'start.');

	angular.module(
		'demo.widgets.controllers.dynamicI18n',
		['ng', 'ngLocale', 'ng.locale.dynamic']
	).config(
		['tmhDynamicLocaleProvider', function (tmhDynamicLocaleProvider) {
			tmhDynamicLocaleProvider.localeLocationPattern(
				'https://code.angularjs.org/1.2.20/i18n/angular-locale_{{locale}}.js'
			);
		}]
	).controller(
		'demo.widgets.controllers.dynamicI18n.ctrl',
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

	msos.console.debug(temp_di + 'done!');

}());