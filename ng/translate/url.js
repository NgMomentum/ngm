
msos.provide("ng.translate.url");


function $translateUrlLoader($q, $http) {

    'use strict';

    return function(options) {

        if (!options || !options.url) {
            throw new Error('Couldn\'t use urlLoader since no url is given!');
        }

        var requestParams = {};

        requestParams[options.queryParameter || 'lang'] = options.key;

        return $http(angular.extend({
                url: options.url,
                params: requestParams,
                method: 'GET'
            }, options.$http))
            .then(function(result) {
                return result.data;
            }, function() {
                return $q.reject($q.defer('ng_translate_translateUrlLoader_reject'), options.key);
            });
    };
}

$translateUrlLoader.$inject = ['$q', '$http'];
$translateUrlLoader.displayName = '$translateUrlLoader';


angular.module(
	'ng.translate.url'
).factory(
	'$translateUrlLoader',
	$translateUrlLoader
);