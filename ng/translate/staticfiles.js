
msos.provide("ng.translate.staticfiles");


function $translateStaticFilesLoader($q, $http) {
    'use strict';

    return function (options) {

        if (!options || (!angular.isArray(options.files) && (!angular.isString(options.prefix) || !angular.isString(options.suffix)))) {
            throw new Error('Couldn\'t load static files, no files and prefix or suffix specified!');
        }

        if (!options.files) {
            options.files = [{
                prefix: options.prefix,
                suffix: options.suffix
            }];
        }

        var load = function(file) {
            if (!file || (!angular.isString(file.prefix) || !angular.isString(file.suffix))) {
                throw new Error('Couldn\'t load static file, no prefix or suffix specified!');
            }

            var fileUrl = [
                file.prefix,
                options.key,
                file.suffix
            ].join('');

            if (angular.isObject(options.fileMap) && options.fileMap[fileUrl]) {
                fileUrl = options.fileMap[fileUrl];
            }

            return $http(angular.extend({
                    url: fileUrl,
                    method: 'GET'
                }, options.$http))
                .then(function(result) {
                    return result.data;
                }, function() {
                    return $q.reject($q.defer('ng_translate_translateStaticFilesLoader_defer'), options.key);
                });
        };

        var promises = [],
            length = options.files.length;

        for (var i = 0; i < length; i++) {
            promises.push(load({
                prefix: options.files[i].prefix,
                key: options.key,
                suffix: options.files[i].suffix
            }));
        }

        return $q.all($q.defer('ng_translate_translateStaticFilesLoader_all'), promises)
            .then(function (data) {
                var length = data.length,
                    mergedData = {};

                for (var i = 0; i < length; i++) {
                    for (var key in data[i]) {
                        mergedData[key] = data[i][key];
                    }
                }

                return mergedData;
            });
    };
}

$translateStaticFilesLoader.$inject = ['$q', '$http'];
$translateStaticFilesLoader.displayName = '$translateStaticFilesLoader';


angular.module(
	'ng.translate.staticfiles',
	['ng', 'ng.translate']
).factory(
	'$translateStaticFilesLoader',
	$translateStaticFilesLoader
);
