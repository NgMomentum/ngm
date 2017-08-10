
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.v111.ui.colors");
msos.require("ng.material.v111.core");
msos.require("ng.material.v111.core.theming");

ng.material.v111.ui.colors.version = new msos.set_version(17, 1, 7);


(function () {
    "use strict";

    var STATIC_COLOR_EXPRESSION = /^\{((\s|,)*?["'a-zA-Z-]+?\s*?:\s*?('|")[a-zA-Z0-9-.]*('|"))+\s*\}$/,
        colorPalettes = null;

    function MdColorsService($mdTheming, $mdUtil) {

        colorPalettes = colorPalettes || Object.keys($mdTheming.PALETTES);

        function extractHue(parts, theme) {
            var themeColors = $mdTheming.THEMES[theme].colors,
                hueNumber;

            if (parts[1] === 'hue') {

                hueNumber = parseInt(parts.splice(2, 1)[0], 10);

                if (hueNumber < 1 || hueNumber > 3) {
                    throw new Error($mdUtil.supplant('mdColors: \'hue-{hueNumber}\' is not a valid hue, can be only \'hue-1\', \'hue-2\' and \'hue-3\'', {
                        hueNumber: hueNumber
                    }));
                }

                parts[1] = 'hue-' + hueNumber;

                if (!themeColors.hasOwnProperty(parts[0])) {
                    throw new Error($mdUtil.supplant('mdColors: \'hue-x\' can only be used with [{availableThemes}], but was used with \'{usedTheme}\'', {
                        availableThemes: Object.keys(themeColors).join(', '),
                        usedTheme: parts[0]
                    }));
                }

                return themeColors[parts[0]].hues[parts[1]];
            }

            return parts[1] || themeColors[themeColors.hasOwnProperty(parts[0]) ? parts[0] : 'primary'].hues['default'];
        }

        function extractPalette(parts, theme) {
            // If the next section is one of the palettes we assume it's a two word palette
            // Two word palette can be also written in camelCase, forming camelCase to dash-case
            var isTwoWord = parts.length > 1 && colorPalettes.indexOf(parts[1]) !== -1,
                palette = parts[0].replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
                scheme;

            if (isTwoWord) { palette = parts[0] + '-' + parts.splice(1, 1); }

            if (colorPalettes.indexOf(palette) === -1) {
                // If the palette is not in the palette list it's one of primary/accent/warn/background
                scheme = $mdTheming.THEMES[theme].colors[palette];

                if (!scheme) {
                    throw new Error($mdUtil.supplant('mdColors: couldn\'t find \'{palette}\' in the palettes.', {
                        palette: palette
                    }));
                }

                palette = scheme.name;
            }

            return palette;
        }

        function extractColorOptions(expression) {
            var parts = expression.split('-'),
                hasTheme = angular.isDefined($mdTheming.THEMES[parts[0]]),
                theme = hasTheme ? parts.splice(0, 1)[0] : $mdTheming.defaultTheme();

            return {
                theme: theme,
                palette: extractPalette(parts, theme),
                hue: extractHue(parts, theme),
                opacity: parts[2] || 1
            };
        }

        function parseColor(color, contrast) {

            contrast = contrast || false;

            var rgbValues = $mdTheming.PALETTES[color.palette][color.hue];

            rgbValues = contrast ? rgbValues.contrast : rgbValues.value;

            return $mdUtil.supplant('rgba({0}, {1}, {2}, {3})', [rgbValues[0], rgbValues[1], rgbValues[2], rgbValues[3] || color.opacity]);
        }

        function interpolateColors(themeColors) {
            var rgbColors = {},
                hasColorProperty = themeColors.hasOwnProperty('color');

            angular.forEach(
                themeColors,
                function (value, key) {
                    var color = extractColorOptions(value),
                        hasBackground = key.indexOf('background') > -1;

                    rgbColors[key] = parseColor(color);

                    if (hasBackground && !hasColorProperty) {
                        rgbColors.color = parseColor(color, true);
                    }
                }
            );

            return rgbColors;
        }

        function applyThemeColors(element, colorExpression) {
            try {
                if (colorExpression) {
                    // Assign the calculate RGBA color values directly as inline CSS
                    element.css(interpolateColors(colorExpression));
                }
            } catch (e) {
                msos.console.error('ng.material.v111.ui.colors - MdColorsService - applyThemeColors -> error:', e);
            }

        }

        function getThemeColor(expression) {
            var color = extractColorOptions(expression);

            return parseColor(color);
        }

        function hasTheme(expression) {
            return angular.isDefined($mdTheming.THEMES[expression.split('-')[0]]);
        }

        return {
            applyThemeColors: applyThemeColors,
            getThemeColor: getThemeColor,
            hasTheme: hasTheme
        };
    }

    function MdColorsDirective($mdColors, $mdUtil, $parse) {

        return {
            restrict: 'A',
            require: ['^?mdTheme'],
            compile: function (tElem_na, tAttrs) {

                function shouldColorsWatch() {
                    // Simulate 1x binding and mark mdColorsWatch == false
                    var rawColorExpression = tAttrs.mdColors,
                        bindOnce = rawColorExpression.indexOf('::') > -1,
                        isStatic = bindOnce ? true : STATIC_COLOR_EXPRESSION.test(tAttrs.mdColors),
                        hasWatchAttr;

                    // Remove it for the postLink...
                    tAttrs.mdColors = rawColorExpression.replace('::', '');

                    hasWatchAttr = angular.isDefined(tAttrs.mdColorsWatch);

                    return (bindOnce || isStatic) ? false :
                        hasWatchAttr ? $mdUtil.parseAttributeBoolean(tAttrs.mdColorsWatch) : true;
                }

                var shouldWatch = shouldColorsWatch();

                return function (scope, element, attrs, ctrl) {
                    var mdThemeController = ctrl[0],
                        lastColors = {},
                        cleanElement = function (colors) {
                            if (!angular.equals(colors, lastColors)) {
                                var keys = Object.keys(lastColors);

                                if (lastColors.background && !keys.color) {
                                    keys.push('color');
                                }

                                keys.forEach(
                                    function (key) { element.css(key, ''); }
                                );
                            }

                            lastColors = colors;
                        },
                        parseColors = function (theme) {

                            if (typeof theme !== 'string') {
                                theme = '';
                            }

                            if (!attrs.mdColors) {
                                attrs.mdColors = '{}';
                            }

                            var colors = $parse(attrs.mdColors)(scope);

                            if (mdThemeController) {
                                Object.keys(colors).forEach(
                                    function (prop) {
                                        var color = colors[prop];

                                        if (!$mdColors.hasTheme(color)) {
                                            colors[prop] = (theme || mdThemeController.$mdTheme) + '-' + color;
                                        }
                                    }
                                );
                            }

                            cleanElement(colors);

                            return colors;
                        },
                        unregisterChanges = angular.noop;

                    if (mdThemeController) {
                        unregisterChanges = mdThemeController.registerChanges(
                            function (theme) {
                                $mdColors.applyThemeColors(element, parseColors(theme));
                            }
                        );

                        scope.$on(
                            '$destroy',
                            function () {
                                unregisterChanges();
                            }
                        );
                    }

                    try {
                        if (shouldWatch) {
                            scope.$watch(parseColors, angular.bind(this,
                                $mdColors.applyThemeColors, element
                            ), true);
                        } else {
                            $mdColors.applyThemeColors(element, parseColors());
                        }

                    } catch (e) {
                        msos.console.error('ng.material.v111.ui.colors - MdColorsDirective - compile -> error:', e);
                    }

                };
            }
        };
    }

    angular.module(
        'ng.material.v111.ui.colors',
        [
            'ng',
            'ng.material.v111.core',
            'ng.material.v111.core.theming'
        ]
    ).service(
        '$mdColors',
        ['$mdTheming', '$mdUtil', MdColorsService]
    ).directive(
        'mdColors',
        ['$mdColors', '$mdUtil', '$parse', MdColorsDirective]
    );

}());