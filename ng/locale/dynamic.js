
/**
 * Angular Dynamic Locale - 0.1.32
 * https://github.com/lgalfaso/angular-dynamic-locale
 * License: MIT
 */

/*global
    msos: false
*/

msos.provide("ng.locale.dynamic");

ng.locale.dynamic.version = new msos.set_version(18, 3, 11);


(function () {
    'use strict';

    angular.module(
		'ng.locale.dynamic',
		['ng', 'ngLocale']
	).config(
		['$provide', function ($provide) {

            function makeStateful($delegate) {
                $delegate.$stateful = true;
                return $delegate;
            }

            $provide.decorator(
				'dateFilter',
				['$delegate', makeStateful]
			);

            $provide.decorator(
				'numberFilter',
				['$delegate', makeStateful]
			);

            $provide.decorator(
				'currencyFilter',
				['$delegate', makeStateful]
			);
        }]
	).constant(
		'tmhDynamicLocale.STORAGE_KEY', 'tmhDynamicLocale.locale'
	).provider(
		'tmhDynamicLocale',
		['tmhDynamicLocale.STORAGE_KEY', function (STORAGE_KEY) {

            var defaultLocale,
                localeLocationPattern = 'angular/i18n/angular-locale_{{locale}}.js',
                storageFactory = 'tmhDynamicLocaleStorageCache',
                storage,
                storageKey = STORAGE_KEY,
                promiseCache = {},
                activeLocale,
                extraProperties = {};

            function loadScript(url, callback, errorCallback) {
                var load_script = new msos.loader();

				load_script.add_resource_onload.push(callback);
				load_script.add_resource_onerror.push(errorCallback);
				load_script.load(url, 'js');
            }

            function loadLocale(localeUrl, $locale, localeId, $rootScope, $q, localeCache) {

                function overrideValues(oldObject, newObject) {

                    if (activeLocale !== localeId) { return; }

                    angular.forEach(
						oldObject,
						function (value, key) {
							if (!newObject[key]) {
								delete oldObject[key];
							} else if (angular.isArray(newObject[key])) {
								oldObject[key].length = newObject[key].length;
							}
						}
					);

                    angular.forEach(
						newObject,
						function (value, key) {
							if (angular.isArray(newObject[key]) || angular.isObject(newObject[key])) {

								if (!oldObject[key]) {
									oldObject[key] = angular.isArray(newObject[key]) ? [] : {};
								}

								overrideValues(oldObject[key], newObject[key]);

							} else {
								oldObject[key] = newObject[key];
							}
						}
					);
                }

                if (promiseCache[localeId]) {
                    activeLocale = localeId;
                    return promiseCache[localeId];
                }

                var cachedLocale,
                    deferred = $q.defer('ng_locale_dynamic_defer');

                if (localeId === activeLocale) {
                    deferred.resolve($locale);
                } else if ((cachedLocale = localeCache.get(localeId))) {
                    activeLocale = localeId;
                    $rootScope.$evalAsync(
						function () {
							overrideValues($locale, cachedLocale);
							storage.put(storageKey, localeId);
							$rootScope.$broadcast('$localeChangeSuccess', localeId, $locale);
							deferred.resolve($locale);
						}
					);
                } else {
                    activeLocale = localeId;
                    promiseCache[localeId] = deferred.promise;
                    loadScript(
						localeUrl,
						function ng_locale_dyn_loadScript_cb() {
							// Create a new injector with the new locale
							var localInjector = angular.injector(['ngLocale']),
								externalLocale = localInjector.get('$locale');

							msos.console.debug('ng.locale.dynamic - tmhDynamicLocale - loadLocale -> externalLocale.id: ' + externalLocale.id);

							overrideValues($locale, externalLocale);
							localeCache.put(localeId, externalLocale);

							delete promiseCache[localeId];

							$rootScope.$applyAsync(
								function ng_locale_dynamic_apply_success() {
									storage.put(storageKey, localeId);
									$rootScope.$broadcast('$localeChangeSuccess', localeId, $locale);
									deferred.resolve($locale);
								}
							);
						},
						function ng_locale_dyn_loadScript_err() {

							delete promiseCache[localeId];

							$rootScope.$applyAsync(
								function ng_locale_dynamic_apply_reject() {
									if (activeLocale === localeId) { activeLocale = $locale.id; }

									$rootScope.$broadcast('$localeChangeError', localeId);
									deferred.reject(localeId);
								}
							);
						}
					);
                }

                return deferred.promise;
            }

            this.localeLocationPattern = function (value) {
                if (value) {
                    localeLocationPattern = value;
                    return this;
                } else {
                    return localeLocationPattern;
                }
            };

            this.useStorage = function (storageName) {
                storageFactory = storageName;
            };

            this.useCookieStorage = function () {
                this.useStorage('$cookieStore');
            };

            this.defaultLocale = function (value) {
                defaultLocale = value;
            };

            this.storageKey = function (value) {
                if (value) {
                    storageKey = value;
                    return this;
                } else {
                    return storageKey;
                }
            };

            this.addLocalePatternValue = function (key, value) {
                extraProperties[key] = value;
            };

            this.$get = ['$rootScope', '$injector', '$interpolate', '$locale', '$q', 'tmhDynamicLocaleCache',
				function ($rootScope, $injector, interpolate, locale, $q, tmhDynamicLocaleCache) {

                var localeLocation = interpolate(localeLocationPattern);

                storage = $injector.get(storageFactory);

                $rootScope.$evalAsync(
					function () {
						var initialLocale;

						if ((initialLocale = (storage.get(storageKey) || defaultLocale))) { loadLocaleFn(initialLocale); }
					}
				);

                return {
                    set: loadLocaleFn,
                    get: function () {
                        return activeLocale;
                    }
                };

                function loadLocaleFn(localeId) {
                    var baseProperties = {
							locale: localeId,
							angularVersion: angular.version.full
						};

                    return loadLocale(
						localeLocation(
							angular.extend(
								{},
								extraProperties,
								baseProperties
							)
						),
						locale,
						localeId,
						$rootScope,
						$q,
						tmhDynamicLocaleCache
					);
                }
            }];
        }]
	).provider(
		'tmhDynamicLocaleCache',
		function () {
            this.$get = ['$cacheFactory', function ($cacheFactory) {
                return $cacheFactory('tmh.dynamicLocales');
            }];
        }
	).provider(
		'tmhDynamicLocaleStorageCache',
		function () {
            this.$get = ['$cacheFactory', function ($cacheFactory) {
                return $cacheFactory('tmh.dynamicLocales.store');
            }];
        }
	);

}());
