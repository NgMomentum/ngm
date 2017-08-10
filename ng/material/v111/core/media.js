
/**
 * @ngdoc module
 * @name material.components.media
 * @description
 * Media
 */

/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.v111.core.media");
msos.require("ng.material.v111.core");

ng.material.v111.core.media.version = new msos.set_version(16, 12, 28);


function mdMediaFactory($mdConstant, $rootScope, $window) {
    "use strict";

    var queries = {},
        mqls = {},
        results = {},
        normalizeCache = {};

    function validate(query) {
        return $mdConstant.MEDIA[query] ||
            ((query.charAt(0) !== '(') ? ('(' + query + ')') : query);
    }

    function onQueryChange(query) {
        $rootScope.$evalAsync(function () {
            results[query.media] = !!query.matches;
        });
    }

    function add(query) {
        var result = mqls[query];

        if (!result) {
            result = mqls[query] = $window.matchMedia(query);
        }

        result.addListener(onQueryChange);

        return (results[result.media] = !!result.matches);
    }

    function $mdMedia(query) {
        var validated = queries[query],
            result;

        if (angular.isUndefined(validated)) {
            validated = queries[query] = validate(query);
        }

        result = results[validated];

        if (angular.isUndefined(result)) {
            result = add(validated);
        }

        return result;
    }

    function getQuery(name) {
        return mqls[name];
    }

    // Improves performance dramatically
    function getNormalizedName(attrs, attrName) {

        if (!normalizeCache[attrName]) {
            normalizeCache[attrName] = attrs.$normalize(attrName);
        }

        return normalizeCache[attrName];
    }

    function getResponsiveAttribute(attrs, attrName) {
        var i = 0,
            mediaName,
            normalizedName;

        for (i = 0; i < $mdConstant.MEDIA_PRIORITY.length; i += 1) {
            mediaName = $mdConstant.MEDIA_PRIORITY[i];

            if (!mqls[queries[mediaName]].matches) {
                continue;
            }

            normalizedName = getNormalizedName(attrs, attrName + '-' + mediaName);

            if (attrs[normalizedName]) {
                return attrs[normalizedName];
            }
        }

        // fallback on unprefixed
        return attrs[getNormalizedName(attrs, attrName)];
    }

    function watchResponsiveAttributes(attrNames, attrs, watchFn) {
        var unwatchFns = [];

        attrNames.forEach(
            function (attrName) {
                var normalizedName = getNormalizedName(attrs, attrName),
                    mediaName;

                if (angular.isDefined(attrs[normalizedName])) {
                    unwatchFns.push(
                        attrs.$observe(normalizedName, angular.bind(void 0, watchFn, null))
                    );
                }

                for (mediaName in $mdConstant.MEDIA) {
                    if ($mdConstant.MEDIA.hasOwnProperty(mediaName)) {

                        normalizedName = getNormalizedName(attrs, attrName + '-' + mediaName);

                        if (angular.isDefined(attrs[normalizedName])) {
                            unwatchFns.push(
                                attrs.$observe(normalizedName, angular.bind(void 0, watchFn, mediaName))
                            );
                        }
                    }
                }
            }
        );

        return function unwatch() {
            unwatchFns.forEach(function (fn) {
                fn();
            });
        };
    }

    $mdMedia.getResponsiveAttribute = getResponsiveAttribute;
    $mdMedia.getQuery = getQuery;
    $mdMedia.watchResponsiveAttributes = watchResponsiveAttributes;

    return $mdMedia;
}


angular.module(
    'ng.material.v111.core.media',
    [
        'ng',
        'ng.material.v111.core'
    ]
).factory(
    '$mdMedia',
    ['$mdConstant', '$rootScope', '$window', mdMediaFactory]
);
