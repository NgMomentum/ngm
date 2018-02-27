(function (ng, undefined) {
    'use strict';
    ng.module('lrCloudinary', [])
        .constant('lrCloudinary.config', {
//            cloudName: 'you cloud name',
            baseUrl: 'https://res.cloudinary.com/'
        })
        .provider('lrCloudinaryUrl', ['lrCloudinary.config', function CloudinaryProvider(defaultConfig) {

            var config = ng.extend({}, defaultConfig);

            this.setConfig = function setConfig(configObject) {
                ng.extend(config, configObject);
            };

            this.$get = [function () {

                function generateTransformationString(options) {
                    var params = [];
                    var output = '/';
                    if (options.width) {
                        params.push('w_' + options.width);
                    }
                    if (options.height) {
                        params.push('h_' + options.height);
                    }
                    if (options.crop) {
                        params.push('c_' + options.crop);
                    }

                    if (params.length > 0) {
                        output += params.join(',');
                        output += '/';
                    }

                    return output;

                }

                /**
                 * create a cloudinary url from a cloudinary public_id passing all transformation parameters
                 * @input the cloudinary public_id
                 * @options transformation options
                 * <pre>
                 *     <code>
                 *          {
                 *              format:'gif',//the requested format (default jpeg)
                 *              width:150,//the width resize prop
                 *              height:100,//the height resize prop
                 *              crop:'fill'//the crop mode
                 *          }
                 *     </code>
                 * </pre>
                 */
                return function generateUrl(input, options) {
                    var output = '';
                    var optionsOrDefault = ng.extend({format: 'jpg'}, options);
                    var transformString = generateTransformationString(optionsOrDefault);

                    if (input && config.cloudName) {
                        output = config.baseUrl + config.cloudName + '/image/upload' + transformString + input + '.' + optionsOrDefault.format;
                    }
                    return output;
                };
            }];
        }])
        .filter('lrCloudinaryFilter', ['lrCloudinaryUrl', function (cloudinary) {
            return cloudinary;
        }]);
})(angular);
