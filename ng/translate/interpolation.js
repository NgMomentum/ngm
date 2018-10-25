
msos.provide("ng.translate.interpolation");


function $translateMessageFormatInterpolation($translateSanitization, $cacheFactory, TRANSLATE_MF_INTERPOLATION_CACHE, messageFormatConfigurer) {
    'use strict';

    var $translateInterpolator = {},
        $cache = $cacheFactory.get(TRANSLATE_MF_INTERPOLATION_CACHE),
        // instantiate with default locale (which is 'en')
        $mf = new MessageFormat('en'),
        $identifier = 'messageformat';

    if (angular.isFunction(messageFormatConfigurer)) {
        messageFormatConfigurer($mf);
    }

    if (!$cache) {
        // create cache if it doesn't exist already
        $cache = $cacheFactory(TRANSLATE_MF_INTERPOLATION_CACHE);
    }

    $cache.put('en', $mf);

    $translateInterpolator.setLocale = function(locale) {
        $mf = $cache.get(locale);
        if (!$mf) {
            $mf = new MessageFormat(locale);
            if (angular.isFunction(messageFormatConfigurer)) {
                messageFormatConfigurer($mf);
            }
            $cache.put(locale, $mf);
        }
    };

    $translateInterpolator.getInterpolationIdentifier = function() {
        return $identifier;
    };

    $translateInterpolator.useSanitizeValueStrategy = function(value) {
        $translateSanitization.useStrategy(value);
        return this;
    };

    $translateInterpolator.interpolate = function(string, interpolationParams, context, sanitizeStrategy) {
        interpolationParams = interpolationParams || {};
        interpolationParams = $translateSanitization.sanitize(interpolationParams, 'params', sanitizeStrategy);

        var compiledFunction = $cache.get('mf:' + string);

        // if given string wasn't compiled yet, we do so now and never have to do it again
        if (!compiledFunction) {

            // Ensure explicit type if possible
            // MessageFormat checks the actual type (i.e. for amount based conditions)
            for (var key in interpolationParams) {
                if (interpolationParams.hasOwnProperty(key)) {
                    // ensure number
                    var number = parseInt(interpolationParams[key], 10);
                    if (angular.isNumber(number) && ('' + number) === interpolationParams[key]) {
                        interpolationParams[key] = number;
                    }
                }
            }

            compiledFunction = $mf.compile(string);
            $cache.put('mf:' + string, compiledFunction);
        }

        var interpolatedText = compiledFunction(interpolationParams);

        return $translateSanitization.sanitize(interpolatedText, 'text', sanitizeStrategy);
    };

    return $translateInterpolator;
}

$translateMessageFormatInterpolation.displayName = '$translateMessageFormatInterpolation';


function $translateMessageFormatInterpolationProvider() {
    'use strict';

    var configurer;

    this.messageFormatConfigurer = function (fn) { configurer = fn; };

    this.$get = ['$translateSanitization', '$cacheFactory', 'TRANSLATE_MF_INTERPOLATION_CACHE',
		function ($translateSanitization, $cacheFactory, TRANSLATE_MF_INTERPOLATION_CACHE) {
        return $translateMessageFormatInterpolation($translateSanitization, $cacheFactory, TRANSLATE_MF_INTERPOLATION_CACHE, configurer);
    }];
}


angular.module(
	'ng.translate.interpolation',
	['ng', 'ng.translate']
).constant(
	'TRANSLATE_MF_INTERPOLATION_CACHE',
	'$translateMessageFormatInterpolation'
).provider(
	'$translateMessageFormatInterpolation',
	$translateMessageFormatInterpolationProvider
);
