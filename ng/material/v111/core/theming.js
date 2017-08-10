
/*global
    msos: false,
    angular: false,
    ng: false,
    Modernizr: false,
    _: false,
    Node: false
*/

msos.provide("ng.material.v111.core.theming");

ng.material.v111.core.theming.version = new msos.set_version(16, 12, 29);


ng.material.v111.core.theming.color2RgbaArr = function (clr) {
    "use strict";

    if (angular.isArray(clr) && clr.length === 3) { return clr; }

    if (/^rgb/.test(clr)) {
        return clr.replace(/(^\s*rgba?\(|\)\s*$)/g, '').split(',').map(function (value, i) {
            return i === 3 ? parseFloat(value, 10) : parseInt(value, 10);
        });
    }

    if (clr.charAt(0) === '#') { clr = clr.substring(1); }

    if (!/^([a-fA-F0-9]{3}){1,2}$/g.test(clr)) { return undefined; }

    var dig = clr.length / 3,
        red = clr.substr(0, dig),
        grn = clr.substr(dig, dig),
        blu = clr.substr(dig * 2);

    if (dig === 1) {
        red += red;
        grn += grn;
        blu += blu;
    }

    return [parseInt(red, 16), parseInt(grn, 16), parseInt(blu, 16)];
};

_.extend(
    ng.material.v111.core.theming,
    {
        GENERATED: {},
        PALETTES: undefined,
        DARK_FOREGROUND: {
            name: 'dark',
            '1': 'rgba(0,0,0,0.87)',
            '2': 'rgba(0,0,0,0.54)',
            '3': 'rgba(0,0,0,0.38)',
            '4': 'rgba(0,0,0,0.12)'
        },
        LIGHT_FOREGROUND: {
            name: 'light',
            '1': 'rgba(255,255,255,1.0)',
            '2': 'rgba(255,255,255,0.7)',
            '3': 'rgba(255,255,255,0.5)',
            '4': 'rgba(255,255,255,0.12)'
        },
        DARK_SHADOW: '1px 1px 0px rgba(0,0,0,0.4), -1px -1px 0px rgba(0,0,0,0.4)',
        LIGHT_SHADOW: '',
        DARK_CONTRAST_COLOR: ng.material.v111.core.theming.color2RgbaArr('rgba(0,0,0,0.87)'),
        LIGHT_CONTRAST_COLOR: ng.material.v111.core.theming.color2RgbaArr('rgba(255,255,255,0.87)'),
        STRONG_LIGHT_CONTRAST_COLOR: ng.material.v111.core.theming.color2RgbaArr('rgb(255,255,255)'),
        THEME_COLOR_TYPES: ['primary', 'accent', 'warn', 'background'],
        DEFAULT_COLOR_TYPE: 'primary',
        LIGHT_DEFAULT_HUES: {
            'accent': {
                'default': 'A200',
                'hue-1': 'A100',
                'hue-2': 'A400',
                'hue-3': 'A700'
            },
            'background': {
                'default': '50',
                'hue-1': 'A100',
                'hue-2': '100',
                'hue-3': '300'
            }
        },
        DARK_DEFAULT_HUES: {
            'background': {
                'default': 'A400',
                'hue-1': '800',
                'hue-2': '900',
                'hue-3': 'A200'
            }
        },
        VALID_HUE_VALUES: [
            '50', '100', '200', '300', '400', '500', '600',
            '700', '800', '900', 'A100', 'A200', 'A400', 'A700'
        ],
        themeConfig: {
            disableTheming: false, // Generate our themes at run time; also disable stylesheet DOM injection
            generateOnDemand: false, // Whether or not themes are to be generated on-demand (vs. eagerly).
            registeredStyles: [], // Custom styles registered to be used in the theming of custom components.
            nonce: null // Nonce to be added as an attribute to the generated themes style tags.
        },
        rulesByType: {}
    }
);


angular.module(
    'ng.material.v111.core.meta',
    ['ng']
).provider(
    '$$mdMeta',
    function () {
        "use strict";

        var head = angular.element(document.head),
            metaElements = {},
            module = {};

        function mapExistingElement(name) {

            if (metaElements[name]) {
                return true;
            }

            var element = document.getElementsByName(name)[0];

            if (!element) {
                return false;
            }

            metaElements[name] = angular.element(element);

            return true;
        }

        function setMeta(name, content) {
            var newMeta;

            mapExistingElement(name);

            if (!metaElements[name]) {
                newMeta = angular.element('<meta name="' + name + '" content="' + content + '"/>');
                head.append(newMeta);
                metaElements[name] = newMeta;
            } else {
                metaElements[name].attr('content', content);
            }

            return function () {
                metaElements[name].attr('content', '');
                metaElements[name].remove();
                delete metaElements[name];
            };
        }

        function getMeta(name) {

            if (!mapExistingElement(name)) {
                throw new Error('$$mdMeta: could not find a meta tag with the name \'' + name + '\'');
            }

            return metaElements[name].attr('content');
        }

        module.setMeta = setMeta;
        module.getMeta = getMeta;

        return angular.extend(
                {},
                module,
                {
                    $get: function () {
                        return module;
                    }
                }
            );
    }
);


angular.module(
    'ng.material.v111.core.theming.palette',
    ['ng']
).constant(
    '$mdColorPalette',
    {
        'red': {
            '50': '#ffebee',
            '100': '#ffcdd2',
            '200': '#ef9a9a',
            '300': '#e57373',
            '400': '#ef5350',
            '500': '#f44336',
            '600': '#e53935',
            '700': '#d32f2f',
            '800': '#c62828',
            '900': '#b71c1c',
            'A100': '#ff8a80',
            'A200': '#ff5252',
            'A400': '#ff1744',
            'A700': '#d50000',
            'contrastDefaultColor': 'light',
            'contrastDarkColors': '50 100 200 300 A100',
            'contrastStrongLightColors': '400 500 600 700 A200 A400 A700'
        },
        'pink': {
            '50': '#fce4ec',
            '100': '#f8bbd0',
            '200': '#f48fb1',
            '300': '#f06292',
            '400': '#ec407a',
            '500': '#e91e63',
            '600': '#d81b60',
            '700': '#c2185b',
            '800': '#ad1457',
            '900': '#880e4f',
            'A100': '#ff80ab',
            'A200': '#ff4081',
            'A400': '#f50057',
            'A700': '#c51162',
            'contrastDefaultColor': 'light',
            'contrastDarkColors': '50 100 200 A100',
            'contrastStrongLightColors': '500 600 A200 A400 A700'
        },
        'purple': {
            '50': '#f3e5f5',
            '100': '#e1bee7',
            '200': '#ce93d8',
            '300': '#ba68c8',
            '400': '#ab47bc',
            '500': '#9c27b0',
            '600': '#8e24aa',
            '700': '#7b1fa2',
            '800': '#6a1b9a',
            '900': '#4a148c',
            'A100': '#ea80fc',
            'A200': '#e040fb',
            'A400': '#d500f9',
            'A700': '#aa00ff',
            'contrastDefaultColor': 'light',
            'contrastDarkColors': '50 100 200 A100',
            'contrastStrongLightColors': '300 400 A200 A400 A700'
        },
        'deep-purple': {
            '50': '#ede7f6',
            '100': '#d1c4e9',
            '200': '#b39ddb',
            '300': '#9575cd',
            '400': '#7e57c2',
            '500': '#673ab7',
            '600': '#5e35b1',
            '700': '#512da8',
            '800': '#4527a0',
            '900': '#311b92',
            'A100': '#b388ff',
            'A200': '#7c4dff',
            'A400': '#651fff',
            'A700': '#6200ea',
            'contrastDefaultColor': 'light',
            'contrastDarkColors': '50 100 200 A100',
            'contrastStrongLightColors': '300 400 A200'
        },
        'indigo': {
            '50': '#e8eaf6',
            '100': '#c5cae9',
            '200': '#9fa8da',
            '300': '#7986cb',
            '400': '#5c6bc0',
            '500': '#3f51b5',
            '600': '#3949ab',
            '700': '#303f9f',
            '800': '#283593',
            '900': '#1a237e',
            'A100': '#8c9eff',
            'A200': '#536dfe',
            'A400': '#3d5afe',
            'A700': '#304ffe',
            'contrastDefaultColor': 'light',
            'contrastDarkColors': '50 100 200 A100',
            'contrastStrongLightColors': '300 400 A200 A400'
        },
        'blue': {
            '50': '#e3f2fd',
            '100': '#bbdefb',
            '200': '#90caf9',
            '300': '#64b5f6',
            '400': '#42a5f5',
            '500': '#2196f3',
            '600': '#1e88e5',
            '700': '#1976d2',
            '800': '#1565c0',
            '900': '#0d47a1',
            'A100': '#82b1ff',
            'A200': '#448aff',
            'A400': '#2979ff',
            'A700': '#2962ff',
            'contrastDefaultColor': 'light',
            'contrastDarkColors': '50 100 200 300 400 A100',
            'contrastStrongLightColors': '500 600 700 A200 A400 A700'
        },
        'light-blue': {
            '50': '#e1f5fe',
            '100': '#b3e5fc',
            '200': '#81d4fa',
            '300': '#4fc3f7',
            '400': '#29b6f6',
            '500': '#03a9f4',
            '600': '#039be5',
            '700': '#0288d1',
            '800': '#0277bd',
            '900': '#01579b',
            'A100': '#80d8ff',
            'A200': '#40c4ff',
            'A400': '#00b0ff',
            'A700': '#0091ea',
            'contrastDefaultColor': 'dark',
            'contrastLightColors': '600 700 800 900 A700',
            'contrastStrongLightColors': '600 700 800 A700'
        },
        'cyan': {
            '50': '#e0f7fa',
            '100': '#b2ebf2',
            '200': '#80deea',
            '300': '#4dd0e1',
            '400': '#26c6da',
            '500': '#00bcd4',
            '600': '#00acc1',
            '700': '#0097a7',
            '800': '#00838f',
            '900': '#006064',
            'A100': '#84ffff',
            'A200': '#18ffff',
            'A400': '#00e5ff',
            'A700': '#00b8d4',
            'contrastDefaultColor': 'dark',
            'contrastLightColors': '700 800 900',
            'contrastStrongLightColors': '700 800 900'
        },
        'teal': {
            '50': '#e0f2f1',
            '100': '#b2dfdb',
            '200': '#80cbc4',
            '300': '#4db6ac',
            '400': '#26a69a',
            '500': '#009688',
            '600': '#00897b',
            '700': '#00796b',
            '800': '#00695c',
            '900': '#004d40',
            'A100': '#a7ffeb',
            'A200': '#64ffda',
            'A400': '#1de9b6',
            'A700': '#00bfa5',
            'contrastDefaultColor': 'dark',
            'contrastLightColors': '500 600 700 800 900',
            'contrastStrongLightColors': '500 600 700'
        },
        'green': {
            '50': '#e8f5e9',
            '100': '#c8e6c9',
            '200': '#a5d6a7',
            '300': '#81c784',
            '400': '#66bb6a',
            '500': '#4caf50',
            '600': '#43a047',
            '700': '#388e3c',
            '800': '#2e7d32',
            '900': '#1b5e20',
            'A100': '#b9f6ca',
            'A200': '#69f0ae',
            'A400': '#00e676',
            'A700': '#00c853',
            'contrastDefaultColor': 'dark',
            'contrastLightColors': '500 600 700 800 900',
            'contrastStrongLightColors': '500 600 700'
        },
        'light-green': {
            '50': '#f1f8e9',
            '100': '#dcedc8',
            '200': '#c5e1a5',
            '300': '#aed581',
            '400': '#9ccc65',
            '500': '#8bc34a',
            '600': '#7cb342',
            '700': '#689f38',
            '800': '#558b2f',
            '900': '#33691e',
            'A100': '#ccff90',
            'A200': '#b2ff59',
            'A400': '#76ff03',
            'A700': '#64dd17',
            'contrastDefaultColor': 'dark',
            'contrastLightColors': '700 800 900',
            'contrastStrongLightColors': '700 800 900'
        },
        'lime': {
            '50': '#f9fbe7',
            '100': '#f0f4c3',
            '200': '#e6ee9c',
            '300': '#dce775',
            '400': '#d4e157',
            '500': '#cddc39',
            '600': '#c0ca33',
            '700': '#afb42b',
            '800': '#9e9d24',
            '900': '#827717',
            'A100': '#f4ff81',
            'A200': '#eeff41',
            'A400': '#c6ff00',
            'A700': '#aeea00',
            'contrastDefaultColor': 'dark',
            'contrastLightColors': '900',
            'contrastStrongLightColors': '900'
        },
        'yellow': {
            '50': '#fffde7',
            '100': '#fff9c4',
            '200': '#fff59d',
            '300': '#fff176',
            '400': '#ffee58',
            '500': '#ffeb3b',
            '600': '#fdd835',
            '700': '#fbc02d',
            '800': '#f9a825',
            '900': '#f57f17',
            'A100': '#ffff8d',
            'A200': '#ffff00',
            'A400': '#ffea00',
            'A700': '#ffd600',
            'contrastDefaultColor': 'dark'
        },
        'amber': {
            '50': '#fff8e1',
            '100': '#ffecb3',
            '200': '#ffe082',
            '300': '#ffd54f',
            '400': '#ffca28',
            '500': '#ffc107',
            '600': '#ffb300',
            '700': '#ffa000',
            '800': '#ff8f00',
            '900': '#ff6f00',
            'A100': '#ffe57f',
            'A200': '#ffd740',
            'A400': '#ffc400',
            'A700': '#ffab00',
            'contrastDefaultColor': 'dark'
        },
        'orange': {
            '50': '#fff3e0',
            '100': '#ffe0b2',
            '200': '#ffcc80',
            '300': '#ffb74d',
            '400': '#ffa726',
            '500': '#ff9800',
            '600': '#fb8c00',
            '700': '#f57c00',
            '800': '#ef6c00',
            '900': '#e65100',
            'A100': '#ffd180',
            'A200': '#ffab40',
            'A400': '#ff9100',
            'A700': '#ff6d00',
            'contrastDefaultColor': 'dark',
            'contrastLightColors': '800 900',
            'contrastStrongLightColors': '800 900'
        },
        'deep-orange': {
            '50': '#fbe9e7',
            '100': '#ffccbc',
            '200': '#ffab91',
            '300': '#ff8a65',
            '400': '#ff7043',
            '500': '#ff5722',
            '600': '#f4511e',
            '700': '#e64a19',
            '800': '#d84315',
            '900': '#bf360c',
            'A100': '#ff9e80',
            'A200': '#ff6e40',
            'A400': '#ff3d00',
            'A700': '#dd2c00',
            'contrastDefaultColor': 'light',
            'contrastDarkColors': '50 100 200 300 400 A100 A200',
            'contrastStrongLightColors': '500 600 700 800 900 A400 A700'
        },
        'brown': {
            '50': '#efebe9',
            '100': '#d7ccc8',
            '200': '#bcaaa4',
            '300': '#a1887f',
            '400': '#8d6e63',
            '500': '#795548',
            '600': '#6d4c41',
            '700': '#5d4037',
            '800': '#4e342e',
            '900': '#3e2723',
            'A100': '#d7ccc8',
            'A200': '#bcaaa4',
            'A400': '#8d6e63',
            'A700': '#5d4037',
            'contrastDefaultColor': 'light',
            'contrastDarkColors': '50 100 200 A100 A200',
            'contrastStrongLightColors': '300 400'
        },
        'grey': {
            '50': '#fafafa',
            '100': '#f5f5f5',
            '200': '#eeeeee',
            '300': '#e0e0e0',
            '400': '#bdbdbd',
            '500': '#9e9e9e',
            '600': '#757575',
            '700': '#616161',
            '800': '#424242',
            '900': '#212121',
            'A100': '#ffffff',
            'A200': '#000000',
            'A400': '#303030',
            'A700': '#616161',
            'contrastDefaultColor': 'dark',
            'contrastLightColors': '600 700 800 900 A200 A400 A700'
        },
        'blue-grey': {
            '50': '#eceff1',
            '100': '#cfd8dc',
            '200': '#b0bec5',
            '300': '#90a4ae',
            '400': '#78909c',
            '500': '#607d8b',
            '600': '#546e7a',
            '700': '#455a64',
            '800': '#37474f',
            '900': '#263238',
            'A100': '#cfd8dc',
            'A200': '#b0bec5',
            'A400': '#78909c',
            'A700': '#455a64',
            'contrastDefaultColor': 'light',
            'contrastDarkColors': '50 100 200 300 A100 A200',
            'contrastStrongLightColors': '400 500 700'
        }
    }
);


function MdThemeConfigure($mdThemingProvider) {
    "use strict";

    var isDisabled = !!document.querySelector('[md-themes-disabled]');

    $mdThemingProvider.disableTheming(isDisabled);

    $mdThemingProvider.theme('default')
        .primaryPalette('indigo')
        .accentPalette('pink')
        .warnPalette('deep-orange')
        .backgroundPalette('grey');
}

ng.material.v111.core.theming.THEME_COLOR_TYPES.forEach(
    function (colorType) {
        "use strict";

        // Color types with unspecified default hues will use these default hue values
        var defaultDefaultHues = {
            'default': '500',
            'hue-1': '300',
            'hue-2': '800',
            'hue-3': 'A100'
        },
        md_theming = ng.material.v111.core.theming;

        if (!md_theming.LIGHT_DEFAULT_HUES[colorType]) {
            md_theming.LIGHT_DEFAULT_HUES[colorType] = defaultDefaultHues;
        }
        
        if (!md_theming.DARK_DEFAULT_HUES[colorType]) {
            md_theming.DARK_DEFAULT_HUES[colorType] = defaultDefaultHues;
        }
    }
);

function rgba(rgbArray, opacity) {
    "use strict";

    if (!rgbArray) { return "rgb('0,0,0')"; }

    if (rgbArray.length === 4) {
        rgbArray = angular.copy(rgbArray);
        if (opacity) {
            rgbArray.pop();
        } else {
            opacity = rgbArray.pop();
        }
    }

    return opacity && (typeof opacity === 'number' || (typeof opacity === 'string' && opacity.length)) ?
        'rgba(' + rgbArray.join(',') + ',' + opacity + ')' :
        'rgb(' + rgbArray.join(',') + ')';
}

function checkValidPalette(theme, colorType) {
    "use strict";

    var md_theming = ng.material.v111.core.theming;

    // If theme attempts to use a palette that doesnt exist, throw error
    if (!md_theming.PALETTES[(theme.colors[colorType] || {}).name]) {
        throw new Error(
            "You supplied an invalid color palette for theme %1's %2 palette. Available palettes: %3"
            .replace('%1', theme.name)
            .replace('%2', colorType)
            .replace('%3', Object.keys(md_theming.PALETTES).join(', '))
        );
    }
}

function parseRules(theme, colorType, rules) {
    "use strict";

    checkValidPalette(theme, colorType);

    rules = rules.replace(/THEME_NAME/g, theme.name);

    var generatedRules = [],
        md_theming = ng.material.v111.core.theming,
        color = theme.colors[colorType],
        themeNameRegex = new RegExp('\\.md-' + theme.name + '-theme', 'g'),
        hueRegex = new RegExp('(\'|")?{{\\s*(' + colorType + ')-(color|contrast)-?(\\d\\.?\\d*)?\\s*}}(\"|\')?', 'g'),
        simpleVariableRegex = /'?"?\{\{\s*([a-zA-Z]+)-(A?\d+|hue\-[0-3]|shadow|default)-?(\d\.?\d*)?(contrast)?\s*\}\}'?"?/g,
        palette = md_theming.PALETTES[color.name];

    // find and replace simple variables where we use a specific hue, not an entire palette
    // eg. "{{primary-100}}"
    //\(' + THEME_COLOR_TYPES.join('\|') + '\)'
    rules = rules.replace(simpleVariableRegex, function (match_na, colorType, hue, opacity, contrast) {
        if (colorType === 'foreground') {
            if (hue === 'shadow') {
                return theme.foregroundShadow;
            }

            return theme.foregroundPalette[hue] || theme.foregroundPalette['1'];
        }

        // `default` is also accepted as a hue-value, because the background palettes are
        // using it as a name for the default hue.
        if (hue.indexOf('hue') === 0 || hue === 'default') {
            hue = theme.colors[colorType].hues[hue];
        }

        return rgba((md_theming.PALETTES[theme.colors[colorType].name][hue] || '')[contrast ? 'contrast' : 'value'], opacity);
    });

    // For each type, generate rules for each hue (ie. default, md-hue-1, md-hue-2, md-hue-3)
    angular.forEach(color.hues, function (hueValue, hueName) {
        var themeRuleRegex,
            newRule = rules
            .replace(hueRegex, function (match_na, _na, colorType_na, hueType, opacity) {
                return rgba(palette[hueValue][hueType === 'color' ? 'value' : 'contrast'], opacity);
            });

        if (hueName !== 'default') {
            newRule = newRule.replace(themeNameRegex, '.md-' + theme.name + '-theme.md-' + hueName);
        }

        // Don't apply a selector rule to the default theme, making it easier to override
        // styles of the base-component
        if (theme.name === 'default') {
            themeRuleRegex = /((?:(?:(?: |>|\.|\w|-|:|\(|\)|\[|\]|"|'|=)+) )?)((?:(?:\w|\.|-)+)?)\.md-default-theme((?: |>|\.|\w|-|:|\(|\)|\[|\]|"|'|=)*)/g;
            newRule = newRule.replace(themeRuleRegex, function (match, prefix, target, suffix) {
                return match + ', ' + prefix + target + suffix;
            });
        }
        generatedRules.push(newRule);
    });

    return generatedRules;
}

function generateTheme(theme, name, nonce) {
    "use strict";

    var head = document.head,
        firstChild = head ? head.firstElementChild : null,
        md_theming = ng.material.v111.core.theming;

    if (!md_theming.GENERATED[name]) {
        // For each theme, use the color palettes specified for
        // `primary`, `warn` and `accent` to generate CSS rules.
        md_theming.THEME_COLOR_TYPES.forEach(function (colorType) {
            var styleStrings = parseRules(theme, colorType, md_theming.rulesByType[colorType]),
                styleContent,
                style;

            while (styleStrings.length) {
                styleContent = styleStrings.shift();

                if (styleContent) {
                    style = document.createElement('style');
                    style.setAttribute('md-theme-style', '');

                    if (nonce) {
                        style.setAttribute('nonce', nonce);
                    }

                    style.appendChild(document.createTextNode(styleContent));
                    head.insertBefore(style, firstChild);
                }
            }
        });

        md_theming.GENERATED[theme.name] = true;
    }
}

function ThemingProvider($mdColorPalette, $$mdMetaProvider) {
    "use strict";

    var THEMES = {},
        themingProvider,
        alwaysWatchTheme = false,
        defaultTheme = 'default',
        md_theming = ng.material.v111.core.theming,
        setBrowserColor = function (color) {
            // Chrome, Firefox OS and Opera, then Windows Phone
            var removeChrome = $$mdMetaProvider.setMeta('theme-color', color),
                removeWindows = $$mdMetaProvider.setMeta('msapplication-navbutton-color', color);

            return function () {
                    removeChrome();
                    removeWindows();
                };
        },
        enableBrowserColor = function (options) {

            options = _.isObject(options) ? options : {};

            var theme = options.theme || 'default',
                hue = options.hue || '800',
                palette = md_theming.PALETTES[options.palette] || md_theming.PALETTES[THEMES[theme].colors[options.palette || 'primary'].name],
                color = _.isObject(palette[hue]) ? palette[hue].hex : palette[hue];

            return setBrowserColor(color);
        };

    md_theming.PALETTES = {};

    // Load JS Defined Palettes
    angular.extend(md_theming.PALETTES, $mdColorPalette);

    // Make sure that palette has all required hues
    function checkPaletteValid(name, map) {
        var missingColors = md_theming.VALID_HUE_VALUES.filter(function (field) {
            return !map[field];
        });

        if (missingColors.length) {
            throw new Error("Missing colors %1 in palette %2!"
                .replace('%1', missingColors.join(', '))
                .replace('%2', name));
        }

        return map;
    }

    // Example: $mdThemingProvider.definePalette('neonRed', { 50: '#f5fafa', ... });
    function definePalette(name, map) {
        map = map || {};
        md_theming.PALETTES[name] = checkPaletteValid(name, map);
        return themingProvider;
    }

    function extendPalette(name, map) {
        return checkPaletteValid(name, angular.extend({}, md_theming.PALETTES[name] || {}, map));
    }

    function Theme(name) {
        var self = this;

        self.name = name;
        self.colors = {};

        function setDark(isDark) {
            isDark = isDark === undefined ? true : !!isDark;

            // If no change, abort
            if (isDark === self.isDark) { return undefined; }

            self.isDark = isDark;

            self.foregroundPalette = self.isDark ? md_theming.LIGHT_FOREGROUND : md_theming.DARK_FOREGROUND;
            self.foregroundShadow = self.isDark ? md_theming.DARK_SHADOW : md_theming.LIGHT_SHADOW;

            // Light and dark themes have different default hues.
            // Go through each existing color type for this theme, and for every
            // hue value that is still the default hue value from the previous light/dark setting,
            // set it to the default hue value from the new light/dark setting.
            var newDefaultHues = self.isDark ? md_theming.DARK_DEFAULT_HUES : md_theming.LIGHT_DEFAULT_HUES,
                oldDefaultHues = self.isDark ? md_theming.LIGHT_DEFAULT_HUES : md_theming.DARK_DEFAULT_HUES;

            angular.forEach(newDefaultHues, function (newDefaults, colorType) {
                var color = self.colors[colorType],
                    oldDefaults = oldDefaultHues[colorType],
                    hueName;

                if (color) {
                    for (hueName in color.hues) {
                        if (color.hues.hasOwnProperty(hueName)) {
                            if (color.hues[hueName] === oldDefaults[hueName]) {
                                color.hues[hueName] = newDefaults[hueName];
                            }
                        }
                    }
                }
            });

            return self;
        }

        self.dark = setDark;
        setDark(false);

        md_theming.THEME_COLOR_TYPES.forEach(function (colorType) {
            var defaultHues = (self.isDark ? md_theming.DARK_DEFAULT_HUES : md_theming.LIGHT_DEFAULT_HUES)[colorType];
            self[colorType + 'Palette'] = function setPaletteType(paletteName, hues) {
                var color = self.colors[colorType] = {
                    name: paletteName,
                    hues: angular.extend({}, defaultHues, hues)
                };

                Object.keys(color.hues).forEach(function (name) {
                    if (!defaultHues[name]) {
                        throw new Error("Invalid hue name '%1' in theme %2's %3 color %4. Available hue names: %4"
                            .replace('%1', name)
                            .replace('%2', self.name)
                            .replace('%3', paletteName)
                            .replace('%4', Object.keys(defaultHues).join(', '))
                        );
                    }
                });
                Object.keys(color.hues).map(function (key) {
                    return color.hues[key];
                }).forEach(function (hueValue) {
                    if (md_theming.VALID_HUE_VALUES.indexOf(hueValue) === -1) {
                        throw new Error("Invalid hue value '%1' in theme %2's %3 color %4. Available hue values: %5"
                            .replace('%1', hueValue)
                            .replace('%2', self.name)
                            .replace('%3', colorType)
                            .replace('%4', paletteName)
                            .replace('%5', md_theming.VALID_HUE_VALUES.join(', '))
                        );
                    }
                });
                return self;
            };

            self[colorType + 'Color'] = function () {
                var args = Array.prototype.slice.call(arguments);
                console.warn('$mdThemingProviderTheme.' + colorType + 'Color() has been deprecated. ' +
                    'Use $mdThemingProviderTheme.' + colorType + 'Palette() instead.');
                return self[colorType + 'Palette'].apply(self, args);
            };
        });
    }

    function registerTheme(name, inheritFrom) {

        if (THEMES[name]) { return THEMES[name]; }

        inheritFrom = inheritFrom || 'default';

        var parentTheme = typeof inheritFrom === 'string' ? THEMES[inheritFrom] : inheritFrom,
            theme = new Theme(name);

        if (parentTheme) {
            angular.forEach(parentTheme.colors, function (color, colorType) {
                theme.colors[colorType] = {
                    name: color.name,
                    // Make sure a COPY of the hues is given to the child color,
                    // not the same reference.
                    hues: angular.extend({}, color.hues)
                };
            });
        }
        THEMES[name] = theme;

        return theme;
    }

    function ThemingService($rootScope, $log) {
        // Allow us to be invoked via a linking function signature.
        var applyTheme = function (scope, el) {
            if (el === undefined) {
                el = scope;
                scope = undefined;
            }
            if (scope === undefined) {
                scope = $rootScope;
            }
            applyTheme.inherit(el, el);
        };

        function registered(themeName) {
            if (themeName === undefined || themeName === '') { return true; }

            return applyTheme.THEMES[themeName] !== undefined;
        }

        function inheritTheme(el, parent) {
            var ctrl = parent.controller('mdTheme'),
                attrThemeValue = el.attr('md-theme-watch'),
                watchTheme = (alwaysWatchTheme || angular.isDefined(attrThemeValue)) && attrThemeValue !== 'false';

            function lookupThemeName() {
                // As a few components (dialog) add their controllers later, we should also watch for a controller init.
                ctrl = parent.controller('mdTheme') || el.data('$mdThemeController');

                return (ctrl && ctrl.$mdTheme) || (defaultTheme === 'default' ? '' : defaultTheme);
            }

            function updateThemeClass(theme) {
                if (!theme) { return; }

                if (!registered(theme)) {
                    $log.warn('Attempted to use unregistered theme \'' + theme + '\'. ' +
                        'Register it with $mdThemingProvider.theme().');
                }

                var oldTheme = el.data('$mdThemeName');

                if (oldTheme) { el.removeClass('md-' + oldTheme + '-theme'); }

                el.addClass('md-' + theme + '-theme');
                el.data('$mdThemeName', theme);

                if (ctrl) {
                    el.data('$mdThemeController', ctrl);
                }
            }

            function registerChangeCallback() {
                var parentController = parent.controller('mdTheme');

                if (!parentController) { return false; }

                el.on('$destroy', parentController.registerChanges(function () {
                    updateThemeClass(lookupThemeName());
                }));

                return true;
            }

            updateThemeClass(lookupThemeName());

            if ((alwaysWatchTheme && !registerChangeCallback()) || (!alwaysWatchTheme && watchTheme)) {
                el.on('$destroy', $rootScope.$watch(lookupThemeName, updateThemeClass));
            }
        }

        applyTheme.THEMES = angular.extend({}, THEMES);
        applyTheme.PALETTES = angular.extend({}, md_theming.PALETTES);
        applyTheme.inherit = inheritTheme;
        applyTheme.registered = registered;
        applyTheme.defaultTheme = function () {
            return defaultTheme;
        };

        applyTheme.generateTheme = function (name) {
            generateTheme(THEMES[name], name, md_theming.themeConfig.nonce);
        };

        applyTheme.setBrowserColor = enableBrowserColor;

        return applyTheme;
    }

    ThemingService.$inject = ["$rootScope", "$log"];

    themingProvider = {
        definePalette: definePalette,
        extendPalette: extendPalette,
        theme: registerTheme,
        configuration : function () {
            return angular.extend(
                {},
                md_theming.themeConfig,
                {
                    defaultTheme : defaultTheme,
                    alwaysWatchTheme : alwaysWatchTheme,
                    registeredStyles : [].concat(md_theming.themeConfig.registeredStyles)
                }
            );
        },
        disableTheming: function (isDisabled) {
            md_theming.themeConfig.disableTheming = angular.isUndefined(isDisabled) || !!isDisabled;
        },
        registerStyles: function (styles) {
            md_theming.themeConfig.registeredStyles.push(styles);
        },
        setNonce: function (nonceValue) {
            md_theming.themeConfig.nonce = nonceValue;
        },
        generateThemesOnDemand: function (onDemand) {
            md_theming.themeConfig.generateOnDemand = onDemand;
        },
        setDefaultTheme: function (theme) {
            defaultTheme = theme;
        },
        alwaysWatchTheme: function (alwaysWatch) {
            alwaysWatchTheme = alwaysWatch;
        },
        enableBrowserColor: enableBrowserColor,
        $get: ThemingService,
        _LIGHT_DEFAULT_HUES: md_theming.LIGHT_DEFAULT_HUES,
        _DARK_DEFAULT_HUES: md_theming.DARK_DEFAULT_HUES,
        _PALETTES: md_theming.PALETTES,
        _THEMES: THEMES,
        _parseRules: parseRules,
        _rgba: rgba
    };

    return themingProvider;
}

function ThemingDirective($mdTheming, $interpolate, $log) {
    "use strict";

    return {
        priority: 100,
        link: {
            pre: function (scope, el, attrs) {
                var registeredCallbacks = [],
                    ctrl = {
                        registerChanges: function (cb, context) {
                            if (context) {
                                cb = angular.bind(context, cb);
                            }

                            registeredCallbacks.push(cb);

                            return function () {
                                var index = registeredCallbacks.indexOf(cb);

                                if (index > -1) {
                                    registeredCallbacks.splice(index, 1);
                                }
                            };
                        },
                        $setTheme: function (theme) {
                            if (!$mdTheming.registered(theme)) {
                                $log.warn('attempted to use unregistered theme \'' + theme + '\'');
                            }
                            ctrl.$mdTheme = theme;

                            registeredCallbacks.forEach(function (cb) {
                                cb();
                            });
                        }
                    };

                el.data('$mdThemeController', ctrl);
                ctrl.$setTheme($interpolate(attrs.mdTheme)(scope));
                attrs.$observe('mdTheme', ctrl.$setTheme);
            }
        }
    };
}

function disableThemesDirective() {
    "use strict";

    ng.material.v111.core.theming.themeConfig.disableTheming = true;

    // Return a 1x-only, first-match attribute directive
    return {
        restrict: 'A',
        priority: '900'
    };
}

function ThemableDirective($mdTheming) {
    "use strict";

    return $mdTheming;
}

// Generate our themes at run time given the state of THEMES and PALETTES
function generateAllThemes($injector, $mdTheming) {
    "use strict";

    var head = document.head,
        md_theming = ng.material.v111.core.theming,
        firstChild = head ? head.firstElementChild : null,
        themeCss = !md_theming.themeConfig.disableTheming && $injector.has('$MD_THEME_CSS') ? $injector.get('$MD_THEME_CSS') : '',
        rules;

    // Append our custom registered styles to the theme stylesheet.
    themeCss += md_theming.themeConfig.registeredStyles.join('');

    if (!firstChild) { return; }
    if (themeCss.length === 0) { return; }  // no rules, so no point in running this expensive task

    // The user specifies a 'default' contrast color as either light or dark,
    // then explicitly lists which hues are the opposite contrast (eg. A100 has dark, A200 has light)
    function sanitizePalette(palette) {
        var defaultContrast = palette.contrastDefaultColor,
            lightColors = palette.contrastLightColors || [],
            strongLightColors = palette.contrastStrongLightColors || [],
            darkColors = palette.contrastDarkColors || [];

        // These colors are provided as space-separated lists
        if (typeof lightColors === 'string') { lightColors = lightColors.split(' '); }
        if (typeof strongLightColors === 'string') { strongLightColors = strongLightColors.split(' '); }
        if (typeof darkColors === 'string') { darkColors = darkColors.split(' '); }

        // Cleanup after ourselves
        delete palette.contrastDefaultColor;
        delete palette.contrastLightColors;
        delete palette.contrastStrongLightColors;
        delete palette.contrastDarkColors;

        // Change { 'A100': '#fffeee' } to { 'A100': { value: '#fffeee', contrast:DARK_CONTRAST_COLOR }
        angular.forEach(palette, function (hueValue, hueName) {

            if (angular.isObject(hueValue)) { return; }     // Already converted
            // Map everything to rgb colors
            var rgbValue = md_theming.color2RgbaArr(hueValue);

            if (!rgbValue) {
                throw new Error("Color %1, in palette %2's hue %3, is invalid. Hex or rgb(a) color expected."
                    .replace('%1', hueValue)
                    .replace('%2', palette.name)
                    .replace('%3', hueName));
            }

            function getContrastColor() {

                if (defaultContrast === 'light') {

                    if (darkColors.indexOf(hueName) > -1) {
                        return md_theming.DARK_CONTRAST_COLOR;
                    }

                    return strongLightColors.indexOf(hueName) > -1 ? md_theming.STRONG_LIGHT_CONTRAST_COLOR : md_theming.LIGHT_CONTRAST_COLOR;
                }

                if (lightColors.indexOf(hueName) > -1) {
                    return strongLightColors.indexOf(hueName) > -1 ? md_theming.STRONG_LIGHT_CONTRAST_COLOR : md_theming.LIGHT_CONTRAST_COLOR;
                }

                return md_theming.DARK_CONTRAST_COLOR;
            }

            palette[hueName] = {
                hex: palette[hueName],
                value: rgbValue,
                contrast: getContrastColor()
            };
        });
    }

    // Expose contrast colors for palettes to ensure that text is always readable
    angular.forEach(md_theming.PALETTES, sanitizePalette);

    rules = themeCss
        .split(/\}(?!(\}|'|"|;))/)
        .filter(function (rule) {
            return rule && rule.trim().length;
        })
        .map(function (rule) {
            return rule.trim() + '}';
        });

    md_theming.THEME_COLOR_TYPES.forEach(function (type) {
        md_theming.rulesByType[type] = '';
    });

    // Sort the rules based on type, allowing us to do color substitution on a per-type basis
    rules.forEach(function (rule) {
        var i = 0,
            type = md_theming.THEME_COLOR_TYPES[0];

        // First: test that if the rule has '.md-accent', it goes into the accent set of rules
        for (i = 0; type !== undefined; i += 1) {
            if (rule.indexOf('.md-' + type) > -1) {
                md_theming.rulesByType[type] = md_theming.rulesByType[type] + rule;

                return md_theming.rulesByType[type];
            }

            type = md_theming.THEME_COLOR_TYPES[i];
        }

        // If no eg 'md-accent' class is found, try to just find 'accent' in the rule and guess from
        // there
        type = md_theming.THEME_COLOR_TYPES[0];

        for (i = 0; type !== undefined; i += 1) {
            if (rule.indexOf(type) > -1) {
                md_theming.rulesByType[type] = md_theming.rulesByType[type] + rule;

                return md_theming.rulesByType[type];
            }

            type = md_theming.THEME_COLOR_TYPES[i];
        }

        // Default to the primary array
        md_theming.rulesByType[md_theming.DEFAULT_COLOR_TYPE] = md_theming.rulesByType[md_theming.DEFAULT_COLOR_TYPE] + rule;

        return md_theming.rulesByType[md_theming.DEFAULT_COLOR_TYPE];
    });

    // If themes are being generated on-demand, quit here. The user will later manually
    // call generateTheme to do this on a theme-by-theme basis.
    if (md_theming.themeConfig.generateOnDemand) { return; }

    angular.forEach($mdTheming.THEMES, function (theme) {
        if (!md_theming.GENERATED[theme.name] && !($mdTheming.defaultTheme() !== 'default' && theme.name === 'default')) {
            generateTheme(theme, theme.name, md_theming.themeConfig.nonce);
        }
    });
}


angular.module(
    'ng.material.v111.core.theming',
    [
        'ng.material.v111.core.meta',
        'ng.material.v111.core.theming.palette'
    ]
).provider(
    '$mdTheming',
    ['$mdColorPalette', ThemingProvider]
).directive(
    'mdTheme',
    ['$mdTheming', '$interpolate', '$log', ThemingDirective]
).directive(
    'mdThemable',
    ['$mdTheming', ThemableDirective]
).directive(
    'mdThemesDisabled',
    disableThemesDirective
).directive(
    'mdThemeWatch',
    function () {
		"use strict";
        return {
            restrict: 'A'
        };
    }
).config(
    ['$mdThemingProvider', MdThemeConfigure]
).run(
    ['$injector', '$mdTheming', generateAllThemes]
);
