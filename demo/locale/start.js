
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

msos.provide("demo.locale.start");
msos.require("ng.route");
msos.require("ng.resource");
msos.require("ng.touch");
msos.require("ng.translate.staticfiles");
msos.require("ng.locale.dynamic");

// Start by loading our demo.locale.start specific stylesheet
demo.locale.start.css = new msos.loader();
demo.locale.start.css.load(msos.resource_url('fonts', 'css/glyphicons.uc.css'));


msos.onload_func_done.push(
    function () {
        "use strict";

        var temp_dl = 'demo.locale.start -> ';

        msos.console.debug(temp_dl + 'start.');

		angular.module(
			'demo.locale.start',
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
						templateUrl: msos.resource_url('demo', 'locale/views/home.html'),
						resolve: {
							load: ['$postload', function ($postload) {

								var module_name = 'demo.locale.controllers.home',
									module_id = module_name.replace(/\./g, '_');

								// If already loaded, just continue resolve
								if (msos.registered_modules[module_id]) {
									return true;
								}

								// Otherwise, request specific demo module
								msos.require(module_name);

								// Then, start AngularJS module registration process
								return $postload.run_registration();
							}]
						}
					}
				).when(
					'/about',
					{
						templateUrl: msos.resource_url('demo', 'locale/views/about.html'),
						resolve: {
							load: ['$postload', function ($postload) {

								var module_name = 'demo.locale.controllers.about',
									module_id = module_name.replace(/\./g, '_');

								// If already loaded, just continue resolve
								if (msos.registered_modules[module_id]) {
									return true;
								}

								// Otherwise, request specific demo module
								msos.require(module_name);

								// Then, start AngularJS module registration process
								return $postload.run_registration();
							}]
						}
					}
				).when(
					'/contacts',
					{
						templateUrl: msos.resource_url('demo', 'locale/views/contacts.html'),
						resolve: {
							load: ['$postload', function ($postload) {

								var module_name = 'demo.locale.controllers.contacts',
									module_id = module_name.replace(/\./g, '_');

								// If already loaded, just continue resolve
								if (msos.registered_modules[module_id]) {
									return true;
								}

								// Otherwise, request specific demo module
								msos.require(module_name);

								// Then, start AngularJS module registration process
								return $postload.run_registration();
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
					msos.console.error('demo.locale.start - LocaleService -> there are no _LOCALES provided.');
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
						msos.console.error('demo.locale.start - LocaleService -> Locale name "' + locale + '" is invalid');
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
			'AppCtrl',
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

        angular.bootstrap('#body', ['demo.locale.start']);

        msos.console.debug(temp_dl + 'done!');
    }
);