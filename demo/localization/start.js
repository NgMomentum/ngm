
/**
 * @ngdoc overview
 * @name translateApp
 * @description
 * # translateApp
 *
 * Main module of the application.
 */

/*global
    msos: false,
    angular: false
*/

msos.provide("demo.localization.start");
msos.require("ng.route");
msos.require("ng.resource");
msos.require("ng.touch");
msos.require("ng.translate");
msos.require("ng.translate.staticfiles");
msos.require("ng.locale.dynamic");

// Start by loading our demo.localization.start specific stylesheet
demo.localization.start.css = new msos.loader();
demo.localization.start.css.load(msos.resource_url('fonts', 'css/glyphicons.uc.css'));


msos.onload_func_done.push(
    function () {
        "use strict";

        var temp_dl = 'demo.localization.start -> ';

        msos.console.debug(temp_dl + 'start.');

		angular.module(
			'demo.localization.start',
			[
				'ng.animate',		// included in NgM
				'ng.sanitize',		// included in NgM
				'ng.postloader',	// included in NgM
				'ng.resource',
				'ng.route',
				'ng.touch',
				'ng.translate',
				'ng.translate.staticfiles',
				'ng.locale.dynamic',
				'ng.bootstrap.ui',
				'ng.bootstrap.ui.dropdown'
			]
		).constant(
			'VERSION_TAG', new Date().getTime()
		).constant(
			'LOCALES',
			{
				'locales': {
					'ru_RU': 'Русский',
					'en_US': 'English'
				},
				'preferredLocale': 'en_US'
			}
		).config(
			['$routeProvider', function ($routeProvider) {
				$routeProvider
				.when(
					'/home',
					{
						templateUrl: msos.resource_url('demo', 'localization/views/home.html'),
						resolve: {
							load: ['$postload', function ($postload) {

								msos.require('demo.localization.controllers.home');

								return $postload.load();
							}]
						}
					}
				).when(
					'/about',
					{
						templateUrl: msos.resource_url('demo', 'localization/views/about.html'),
						resolve: {
							load: ['$postload', function ($postload) {

								msos.require('demo.localization.controllers.about');

								return $postload.load();
							}]
						}
					}
				).when(
					'/contacts',
					{
						templateUrl: msos.resource_url('demo', 'localization/views/contacts.html'),
						resolve: {
							load: ['$postload', function ($postload) {

								msos.require('demo.localization.controllers.contacts');

								return $postload.load();
							}]
						}
					}
				).otherwise(
					{ redirectTo: '/home' }
				);
			}]
		).config(
			['$translateProvider', 'LOCALES', function ($translateProvider, LOCALES) {

				$translateProvider.useStaticFilesLoader(
					{
						prefix: 'resources/locale-',
						suffix: '.json'
					}
				);

				$translateProvider.preferredLanguage(LOCALES.preferredLocale);
			}]
		).config(
			['tmhDynamicLocaleProvider', function (tmhDynamicLocaleProvider) {
				tmhDynamicLocaleProvider.localeLocationPattern('../../ng/i18n/angular-locale_{{locale}}.js');
			}]
		).directive(
			'ngTranslateLanguageSelect',
			['LocaleService', function (LocaleService) {
				return {
					restrict: 'A',
					replace: true,
					template: '' +
						'<div class="language-select" ng-if="visible">' +
							'<label>' +
								'{{"directives.language-select.Language" | translate}}:' +
								'<select ng-model="currentLocaleDisplayName"' +
									'ng-options="localesDisplayName for localesDisplayName in localesDisplayNames"' +
									'ng-change="changeLanguage(currentLocaleDisplayName)">' +
								'</select>' +
							'</label>' +
						'</div>'+
					'',
					controller: ['$scope', function ($scope) {

						$scope.currentLocaleDisplayName = LocaleService.getLocaleDisplayName();
						$scope.localesDisplayNames = LocaleService.getLocalesDisplayNames();
						$scope.visible = $scope.localesDisplayNames &&
						$scope.localesDisplayNames.length > 1;

						$scope.changeLanguage = function (locale) {
							LocaleService.setLocaleByDisplayName(locale);
						};
					}]
				};
			}]
		).service(
			'LocaleService',
			['$translate', 'LOCALES', '$rootScope', 'tmhDynamicLocale',
			 function ($translate, LOCALES, $rootScope, tmhDynamicLocale) {
				var localesObj = LOCALES.locales,
					_LOCALES = Object.keys(localesObj),
					_LOCALES_DISPLAY_NAMES = [],
					currentLocale,
					checkLocaleIsValid,
					setLocale,
					$html,
					LOADING_CLASS;

				if (!_LOCALES || _LOCALES.length === 0) {
					msos.console.error('demo.localization.start - LocaleService -> there are no _LOCALES provided.');
				}

				_LOCALES.forEach(
					function (locale) { _LOCALES_DISPLAY_NAMES.push(localesObj[locale]); }
				);

				currentLocale = $translate.proposedLanguage();

				checkLocaleIsValid = function (locale) {
					return _LOCALES.indexOf(locale) !== -1;
				};

				setLocale = function (locale) {
					if (!checkLocaleIsValid(locale)) {
						msos.console.error('demo.localization.start - LocaleService -> Locale name "' + locale + '" is invalid');
						return;
					}

					startLoadingAnimation();
					currentLocale = locale;
					$translate.use(locale);
				};

				$html = angular.element('html');
				LOADING_CLASS = 'app-loading';

				function startLoadingAnimation() {
					$html.addClass(LOADING_CLASS);
				}

				function stopLoadingAnimation() {
					$html.removeClass(LOADING_CLASS);
				}

				$rootScope.$on(
					'$translateChangeSuccess',
					function (event, data) {
						document.documentElement.setAttribute('lang', data.language);

						tmhDynamicLocale.set(data.language.toLowerCase().replace(/_/g, '-'));
					}
				);

				$rootScope.$on(
					'$localeChangeSuccess',
					function () { stopLoadingAnimation(); }
				);

				return {
					getLocaleDisplayName: function () {
						return localesObj[currentLocale];
					},
					setLocaleByDisplayName: function (localeDisplayName) {
						setLocale(
							_LOCALES[
								_LOCALES_DISPLAY_NAMES.indexOf(localeDisplayName)// get locale index
							]
						);
					},
					getLocalesDisplayNames: function () {
						return _LOCALES_DISPLAY_NAMES;
					}
				};
			}]
		).controller(
			'demo.localization.start.ctrl',
			['$scope', '$rootScope', '$translate', '$interval', 'VERSION_TAG',
			 function ($scope, $rootScope, $translate, $interval, VERSION_TAG) {

				$rootScope.VERSION_TAG = VERSION_TAG;

				var pageTitleTranslationId = 'PAGE_TITLE',
					pageContentTranslationId = 'PAGE_CONTENT';

				$translate(
					pageTitleTranslationId,
					pageContentTranslationId
				).then(
					function (translatedPageTitle, translatedPageContent) {
						$rootScope.pageTitle = translatedPageTitle;
						$rootScope.pageContent = translatedPageContent;
					}
				);

				$scope.locale = $translate.use();

				$rootScope.$on(
					'$routeChangeSuccess',
					function (event, current) {
						$scope.currentPath = current.$$route.originalPath;
					}
				);

				$scope.currentTime = Date.now();

				$interval(
					function () { $scope.currentTime = Date.now(); },
					1000,
					0,
					$scope
				);

				$rootScope.$on(
					'$translateChangeSuccess',
					function (event, data) {
						$scope.locale = data.language;
						$rootScope.pageTitle = $translate.instant(pageTitleTranslationId);
						$rootScope.pageContent = $translate.instant(pageContentTranslationId);
					}
				);
			}]
		);

        angular.bootstrap('#body', ['demo.localization.start']);

        msos.console.debug(temp_dl + 'done!');
    }
);