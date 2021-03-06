
msos.provide("ng.translate.partialfiles");


function $translatePartialLoader() {
    'use strict';

    function Part(name, priority, urlTemplate) {
        this.name = name;
        this.isActive = true;
        this.tables = {};
        this.priority = priority || 0;
        this.langPromises = {};
        this.urlTemplate = urlTemplate;
    }

    Part.prototype.parseUrl = function(urlTemplate, targetLang) {
        if (angular.isFunction(urlTemplate)) {
            return urlTemplate(this.name, targetLang);
        }
        return urlTemplate.replace(/\{part\}/g, this.name).replace(/\{lang\}/g, targetLang);
    };

    Part.prototype.getTable = function(lang, $q, $http, $httpOptions, urlTemplate, errorHandler) {

        //locals
        var self = this;
        var lastLangPromise = this.langPromises[lang];
        var deferred = $q.defer('ng_translate_load_partials_defer');

        //private helper helpers
        var fetchData = function() {
            return $http(
                angular.extend({
                        method: 'GET',
                        url: self.parseUrl(self.urlTemplate || urlTemplate, lang)
                    },
                    $httpOptions)
            );
        };

        //private helper
        var handleNewData = function(data) {
            self.tables[lang] = data;
            deferred.resolve(data);
        };

        //private helper
        var rejectDeferredWithPartName = function() {
            deferred.reject(self.name);
        };

        //private helper
        var tryGettingThisTable = function() {
            //data fetching logic
            fetchData().then(
                function(result) {
                    handleNewData(result.data);
                },
                function(errorResponse) {
                    if (errorHandler) {
                        errorHandler(self.name, lang, errorResponse).then(handleNewData, rejectDeferredWithPartName);
                    } else {
                        rejectDeferredWithPartName();
                    }
                });
        };

        //loading logic
        if (!this.tables[lang]) {
            //let's try loading the data
            if (!lastLangPromise) {
                //this is the first request - just go ahead and hit the server
                tryGettingThisTable();
            } else {
                //this is an additional request after one or more unfinished or failed requests
                //chain the deferred off the previous request's promise so that this request conditionally executes
                //if the previous request succeeds then the result will be passed through, but if it fails then this request will try again and hit the server
                lastLangPromise.then(deferred.resolve, tryGettingThisTable);
            }
            //retain a reference to the last promise so we can continue the chain if another request is made before any succeed
            //you can picture the promise chain as a singly-linked list (formed by the .then handler queues) that's traversed by the execution context
            this.langPromises[lang] = deferred.promise;
        } else {
            //the part has already been loaded - if lastLangPromise is also undefined then the table has been populated using setPart
            //this breaks the promise chain because we're not tying langDeferred's outcome to a previous call's promise handler queues, but we don't care because there's no asynchronous execution context to keep track of anymore
            deferred.resolve(this.tables[lang]);
        }
        return deferred.promise;
    };

    var parts = {};

    function hasPart(name) {
        return Object.prototype.hasOwnProperty.call(parts, name);
    }

    function isStringValid(str) {
        return angular.isString(str) && str !== '';
    }

    function isPartAvailable(name) {
        if (!isStringValid(name)) {
            throw new TypeError('Invalid type of a first argument, a non-empty string expected.');
        }

        return (hasPart(name) && parts[name].isActive);
    }

    function deepExtend(dst, src) {
        for (var property in src) {
            if (src[property] && src[property].constructor &&
                src[property].constructor === Object) {
                dst[property] = dst[property] || {};
                deepExtend(dst[property], src[property]);
            } else {
                dst[property] = src[property];
            }
        }
        return dst;
    }

    function getPrioritizedParts() {
        var prioritizedParts = [];
        for (var part in parts) {
            if (parts[part].isActive) {
                prioritizedParts.push(parts[part]);
            }
        }
        prioritizedParts.sort(function(a, b) {
            return a.priority - b.priority;
        });
        return prioritizedParts;
    }

    this.addPart = function(name, priority, urlTemplate) {
        if (!isStringValid(name)) {
            throw new TypeError('Couldn\'t add part, part name has to be a string!');
        }

        if (!hasPart(name)) {
            parts[name] = new Part(name, priority, urlTemplate);
        }
        parts[name].isActive = true;

        return this;
    };

    this.setPart = function(lang, part, table) {
        if (!isStringValid(lang)) {
            throw new TypeError('Couldn\'t set part.`lang` parameter has to be a string!');
        }
        if (!isStringValid(part)) {
            throw new TypeError('Couldn\'t set part.`part` parameter has to be a string!');
        }
        if (typeof table !== 'object' || table === null) {
            throw new TypeError('Couldn\'t set part. `table` parameter has to be an object!');
        }

        if (!hasPart(part)) {
            parts[part] = new Part(part);
            parts[part].isActive = false;
        }

        parts[part].tables[lang] = table;
        return this;
    };

    this.deletePart = function(name) {
        if (!isStringValid(name)) {
            throw new TypeError('Couldn\'t delete part, first arg has to be string.');
        }

        if (hasPart(name)) {
            parts[name].isActive = false;
        }

        return this;
    };

    this.isPartAvailable = isPartAvailable;

    this.$get = ['$rootScope', '$injector', '$q', '$http', '$log',
        function($rootScope, $injector, $q, $http, $log) {

            var service = function(options) {
                if (!isStringValid(options.key)) {
                    throw new TypeError('Unable to load data, a key is not a non-empty string.');
                }

                if (!isStringValid(options.urlTemplate) && !angular.isFunction(options.urlTemplate)) {
                    throw new TypeError('Unable to load data, a urlTemplate is not a non-empty string or not a function.');
                }

                var errorHandler = options.loadFailureHandler;
                if (errorHandler !== undefined) {
                    if (!angular.isString(errorHandler)) {
                        throw new Error('Unable to load data, a loadFailureHandler is not a string.');
                    } else {
                        errorHandler = $injector.get(errorHandler);
                    }
                }

                var loaders = [],
                    prioritizedParts = getPrioritizedParts();

                angular.forEach(prioritizedParts, function(part) {
                    loaders.push(
                        part.getTable(options.key, $q, $http, options.$http, options.urlTemplate, errorHandler)
                    );
                    part.urlTemplate = part.urlTemplate || options.urlTemplate;
                });

                // workaround for #1781
                var structureHasBeenChangedWhileLoading = false;
                var dirtyCheckEventCloser = $rootScope.$on('$translatePartialLoaderStructureChanged', function() {
                    structureHasBeenChangedWhileLoading = true;
                });

                return $q.all($q.defer('ng_translate_load_partials_all'), loaders)
                    .then(function() {
                        dirtyCheckEventCloser();
                        if (structureHasBeenChangedWhileLoading) {
                            if (!options.__retries) {
                                // the part structure has been changed while loading (the origin ones)
                                // this can happen if an addPart/removePart has been invoked right after a $translate.use(lang)
                                // TODO maybe we can optimize this with the actual list of missing parts
                                options.__retries = (options.__retries || 0) + 1;
                                return service(options);
                            } else {
                                // the part structure has been changed again while loading (retried one)
                                // because this could an infinite loop, this will not load another one again
                                $log.warn('The partial loader has detected a multiple structure change (with addPort/removePart) ' +
                                    'while loading translations. You should consider using promises of $translate.use(lang) and ' +
                                    '$translate.refresh(). Also parts should be added/removed right before an explicit refresh ' +
                                    'if possible.');
                            }
                        }
                        var table = {};
                        prioritizedParts = getPrioritizedParts();
                        angular.forEach(prioritizedParts, function(part) {
                            deepExtend(table, part.tables[options.key]);
                        });
                        return table;
                    }, function() {
                        dirtyCheckEventCloser();
                        return $q.reject($q.defer('ng_translate_load_partials_reject'), options.key);
                    });
            };

            service.addPart = function(name, priority, urlTemplate) {
                if (!isStringValid(name)) {
                    throw new TypeError('Couldn\'t add part, first arg has to be a string');
                }

                if (!hasPart(name)) {
                    parts[name] = new Part(name, priority, urlTemplate);
                    $rootScope.$emit('$translatePartialLoaderStructureChanged', name);
                } else if (!parts[name].isActive) {
                    parts[name].isActive = true;
                    $rootScope.$emit('$translatePartialLoaderStructureChanged', name);
                }

                return service;
            };

            service.deletePart = function(name, removeData) {
                if (!isStringValid(name)) {
                    throw new TypeError('Couldn\'t delete part, first arg has to be string');
                }

                if (removeData === undefined) {
                    removeData = false;
                } else if (typeof removeData !== 'boolean') {
                    throw new TypeError('Invalid type of a second argument, a boolean expected.');
                }

                if (hasPart(name)) {
                    var wasActive = parts[name].isActive;
                    if (removeData) {
                        var $translate = $injector.get('$translate');
                        var cache = $translate.loaderCache();
                        if (typeof(cache) === 'string') {
                            // getting on-demand instance of loader
                            cache = $injector.get(cache);
                        }
                        // Purging items from cache...
                        if (typeof(cache) === 'object') {
                            angular.forEach(parts[name].tables, function(value, key) {
                                cache.remove(parts[name].parseUrl(parts[name].urlTemplate, key));
                            });
                        }
                        delete parts[name];
                    } else {
                        parts[name].isActive = false;
                    }
                    if (wasActive) {
                        $rootScope.$emit('$translatePartialLoaderStructureChanged', name);
                    }
                }

                return service;
            };

            service.isPartLoaded = function(name, lang) {
                return angular.isDefined(parts[name]) && angular.isDefined(parts[name].tables[lang]);
            };

            service.getRegisteredParts = function() {
                var registeredParts = [];
                angular.forEach(parts, function(p) {
                    if (p.isActive) {
                        registeredParts.push(p.name);
                    }
                });
                return registeredParts;
            };

            service.isPartAvailable = isPartAvailable;

            return service;

        }
    ];

}

$translatePartialLoader.displayName = '$translatePartialLoader';

angular.module(
	'ng.translate.partialfiles',
	['ng', 'ng.translate']
).provider(
	'$translatePartialLoader',
	$translatePartialLoader
);