
/*global
    msos: false,
    angular: false,
    ng: false,
    _: false
*/

msos.provide("ng.material.core.theming");

ng.material.core.theming.version = new msos.set_version(18, 7, 8);


ng.material.core.theming.color2RgbaArr = function (clr) {
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
    ng.material.core.theming,
    {
        GENERATED: {},
        PALETTES: {},
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
        DARK_CONTRAST_COLOR: ng.material.core.theming.color2RgbaArr('rgba(0,0,0,0.87)'),
        LIGHT_CONTRAST_COLOR: ng.material.core.theming.color2RgbaArr('rgba(255,255,255,0.87)'),
        STRONG_LIGHT_CONTRAST_COLOR: ng.material.core.theming.color2RgbaArr('rgb(255,255,255)'),
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
    'ng.material.core.meta',
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
    'ng.material.core.theming.palette',
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

ng.material.core.theming.THEME_COLOR_TYPES.forEach(
    function (colorType) {
        "use strict";

        // Color types with unspecified default hues will use these default hue values
        var defaultDefaultHues = {
            'default': '500',
            'hue-1': '300',
            'hue-2': '800',
            'hue-3': 'A100'
        },
        md_theming = ng.material.core.theming;

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

    var md_theming = ng.material.core.theming;

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

	checkValidPalette(theme, colorType);

	rules = rules.replace(/THEME_NAME/g, theme.name);

	var themeNameRegex = new RegExp('\\.md-' + theme.name + '-theme', 'g'),
		simpleVariableRegex = /'?"?\{\{\s*([a-zA-Z]+)-(A?\d+|hue-[0-3]|shadow|default)-?(\d\.?\d*)?(contrast)?\s*\}\}'?"?/g,
		hueRegex = new RegExp('(\'|")?{{\\s*([a-zA-Z]+)-(color|contrast)-?(\\d\\.?\\d*)?\\s*}}("|\')?','g'),
		md_theming = ng.material.core.theming,
		generatedRules = [];

	rules = rules.replace(
		simpleVariableRegex,
		function(match, colorType, hue, opacity, contrast) {
			if (colorType === 'foreground') {
				if (hue == 'shadow') {
					return theme.foregroundShadow;
				} else {
					return theme.foregroundPalette[hue] || theme.foregroundPalette['1'];
				}
			}

			if (hue.indexOf('hue') === 0 || hue === 'default') {
				hue = theme.colors[colorType].hues[hue];
			}

			return rgba((md_theming.PALETTES[ theme.colors[colorType].name ][hue] || '')[contrast ? 'contrast' : 'value'], opacity);
		}
	);

	// For each type, generate rules for each hue (ie. default, md-hue-1, md-hue-2, md-hue-3)
	angular.forEach(
		['default', 'hue-1', 'hue-2', 'hue-3'],
		function (hueName) {
			var newRule = rules.replace(
					hueRegex,
					function (match, _, matchedColorType, hueType, opacity) {
						var color = theme.colors[matchedColorType],
							palette = md_theming.PALETTES[color.name],
							hueValue = color.hues[hueName];

						return rgba(palette[hueValue][hueType === 'color' ? 'value' : 'contrast'], opacity);
					}
				),
				themeRuleRegex = /((?:\s|>|\.|\w|-|:|\(|\)|\[|\]|"|'|=)*)\.md-default-theme((?:\s|>|\.|\w|-|:|\(|\)|\[|\]|"|'|=)*)/g;

			if (hueName !== 'default') {
				newRule = newRule.replace(themeNameRegex, '.md-' + theme.name + '-theme.md-' + hueName);
			}

			if (theme.name == 'default') {
				newRule = newRule.replace(
					themeRuleRegex,
					function (match, start, end) {
						return match + ', ' + start + end;
					}
				);
			}

			generatedRules.push(newRule);
		}
	);

	return generatedRules;
}

function generateTheme(theme, name, nonce) {
    "use strict";

    var head = document.head,
        firstChild = head ? head.firstElementChild : null,
        md_theming = ng.material.core.theming;

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
        md_theming = ng.material.core.theming,
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

    function ThemingService($rootScope, $mdUtil, $q, $log) {
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
			var ctrl = parent.controller('mdTheme') || el.data('$mdThemeController'),
				scope = el.scope(),
				watchTheme,
				clearNameWatcher,
				unwatch;

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

			function lookupThemeName() {
				// As a few components (dialog) add their controllers later, we should also watch for a controller init.
				return (ctrl && ctrl.$mdTheme) || (defaultTheme === 'default' ? '' : defaultTheme);
			}

			updateThemeClass(lookupThemeName());

			if (ctrl) {

				watchTheme = alwaysWatchTheme || ctrl.$shouldWatch || $mdUtil.parseAttributeBoolean(el.attr('md-theme-watch'));

				if (watchTheme || ctrl.isAsyncTheme) {

					clearNameWatcher = function () {
						if (unwatch) {
							unwatch();
							unwatch = undefined;
						}
					};

					unwatch = ctrl.registerChanges(
						function (name) {
							updateThemeClass(name);

							if (!watchTheme) {
								clearNameWatcher();
							}
						}
					);

					if (scope) {
						scope.$on(
							'$destroy',
							clearNameWatcher
						);
					} else {
						el.on(
							'$destroy',
							clearNameWatcher
						);
					}
				}
			}
		}

		Object.defineProperty(
			applyTheme,
			'THEMES',
			{
				get: function () {
					return angular.extend({}, THEMES);
				}
			}
		);
		Object.defineProperty(
			applyTheme,
			'PALETTES',
			{
				get: function () {
					return angular.extend({}, md_theming.PALETTES);
				}
			}
		);
		Object.defineProperty(
			applyTheme,
			'ALWAYS_WATCH',
			{
				get: function () {
					return alwaysWatchTheme;
				}
			}
		);

        applyTheme.inherit = inheritTheme;
        applyTheme.registered = registered;

        applyTheme.defaultTheme = function () {
            return defaultTheme;
        };

        applyTheme.generateTheme = function (name) {
            generateTheme(THEMES[name], name, md_theming.themeConfig.nonce);
        };

		applyTheme.defineTheme = function (name, options) {

			options = options || {};

			var theme = registerTheme(name);

			if (options.primary) {
				theme.primaryPalette(options.primary);
			}
			if (options.accent) {
				theme.accentPalette(options.accent);
			}
			if (options.warn) {
				theme.warnPalette(options.warn);
			}
			if (options.background) {
				theme.backgroundPalette(options.background);
			}
			if (options.dark){
				theme.dark();
			}

			this.generateTheme(name);

			return $q.resolve($q.defer('ng_md_theming_applyTheme_defineTheme_resolve'), name);
		};

        applyTheme.setBrowserColor = enableBrowserColor;

        return applyTheme;
    }

	ThemingService.$inject = ["$rootScope", "$mdUtil", "$q", "$log"];

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

function ThemingDirective($mdTheming, $interpolate, $parse, $mdUtil, $q, $log) {
	"use strict";

	return {
		priority: 101, // has to be more than 100 to be before interpolation (issue on IE)
		link: {
			pre: function (scope, el, attrs) {
				var registeredCallbacks = [],
					startSymbol = $interpolate.startSymbol(),
					endSymbol = $interpolate.endSymbol(),
					theme = attrs.mdTheme.trim(),
					hasInterpolation =
						theme.substr(0, startSymbol.length) === startSymbol &&
						theme.lastIndexOf(endSymbol) === theme.length - endSymbol.length,
					oneTimeOperator = '::',
					oneTimeBind = attrs.mdTheme
						.split(startSymbol).join('')
						.split(endSymbol).join('')
						.trim()
						.substr(0, oneTimeOperator.length) === oneTimeOperator,
					getTheme = function () {
							var interpolation = $interpolate(attrs.mdTheme)(scope);

							return $parse(interpolation)(scope) || interpolation;
					},
					ctrl = {
						isAsyncTheme: angular.isFunction(getTheme()) || angular.isFunction(getTheme().then),
						registerChanges: function (cb, context) {
							if (context) {
								cb = angular.bind(context, cb);
							}

							if (!angular.isFunction(cb)) {
								msos.console.error('ng.material.core.theming - ThemingDirective -> cb is not a function:', cb);
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
							var i = 0;

							if (!$mdTheming.registered(theme)) {
								$log.warn('attempted to use unregistered theme \'' + theme + '\'');
							}

							ctrl.$mdTheme = theme;

							for (i = registeredCallbacks.length; i >= 0; i -= 1) {
								if (registeredCallbacks[i]) {
									registeredCallbacks[i](theme);
								}
							}
						},
						$shouldWatch: $mdUtil.parseAttributeBoolean(el.attr('md-theme-watch')) || $mdTheming.ALWAYS_WATCH || (hasInterpolation && !oneTimeBind)
					},
					setParsedTheme,
					unwatch;

				el.data('$mdThemeController', ctrl);

				setParsedTheme = function (theme) {
					if (typeof theme === 'string') { return ctrl.$setTheme(theme); }

					$q.when($q.defer('ng_md_ThemingDirective_setParsedTheme_when'), angular.isFunction(theme) ?  theme() : theme).then(
						function (name) { ctrl.$setTheme(name); }
					);
				};

				setParsedTheme(getTheme());

				unwatch = scope.$watch(
					getTheme,
					function (theme) {
						if (theme) {
							setParsedTheme(theme);

							if (!ctrl.$shouldWatch) { unwatch(); }
						}
					}
				);
			}
		}
	};
}

function disableThemesDirective() {
    "use strict";

    ng.material.core.theming.themeConfig.disableTheming = true;

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
        md_theming = ng.material.core.theming,
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
    'ng.material.core.theming',
    [
		'ng',
		'ng.material.core',
		'ng.material.core.meta',
		'ng.material.core.theming.palette'
	]
).constant(
    "$MD_THEME_CSS","md-autocomplete.md-THEME_NAME-theme{background:\"{{background-hue-1}}\"}md-autocomplete.md-THEME_NAME-theme[disabled]:not([md-floating-label]){background:\"{{background-hue-2}}\"}md-autocomplete.md-THEME_NAME-theme button md-icon path{fill:\"{{background-600}}\"}md-autocomplete.md-THEME_NAME-theme button:after{background:\"{{background-600-0.3}}\"}md-autocomplete.md-THEME_NAME-theme input{color:\"{{foreground-1}}\"}.md-autocomplete-suggestions-container.md-THEME_NAME-theme{background:\"{{background-hue-1}}\"}.md-autocomplete-suggestions-container.md-THEME_NAME-theme li{color:\"{{foreground-1}}\"}.md-autocomplete-suggestions-container.md-THEME_NAME-theme li.selected,.md-autocomplete-suggestions-container.md-THEME_NAME-theme li:hover{background:\"{{background-500-0.18}}\"}md-backdrop{background-color:\"{{background-900-0.0}}\"}md-backdrop.md-opaque.md-THEME_NAME-theme{background-color:\"{{background-900-1.0}}\"}md-bottom-sheet.md-THEME_NAME-theme{background-color:\"{{background-50}}\";border-top-color:\"{{background-300}}\"}md-bottom-sheet.md-THEME_NAME-theme.md-list md-list-item{color:\"{{foreground-1}}\"}md-bottom-sheet.md-THEME_NAME-theme .md-subheader{background-color:\"{{background-50}}\";color:\"{{foreground-1}}\"}.md-button.md-THEME_NAME-theme:not([disabled]).md-focused,.md-button.md-THEME_NAME-theme:not([disabled]):hover{background-color:\"{{background-500-0.2}}\"}.md-button.md-THEME_NAME-theme:not([disabled]).md-icon-button:hover{background-color:transparent}.md-button.md-THEME_NAME-theme.md-fab md-icon{color:\"{{accent-contrast}}\"}.md-button.md-THEME_NAME-theme.md-primary{color:\"{{primary-color}}\"}.md-button.md-THEME_NAME-theme.md-primary.md-fab,.md-button.md-THEME_NAME-theme.md-primary.md-raised{color:\"{{primary-contrast}}\";background-color:\"{{primary-color}}\"}.md-button.md-THEME_NAME-theme.md-primary.md-fab:not([disabled]) md-icon,.md-button.md-THEME_NAME-theme.md-primary.md-raised:not([disabled]) md-icon{color:\"{{primary-contrast}}\"}.md-button.md-THEME_NAME-theme.md-primary.md-fab:not([disabled]).md-focused,.md-button.md-THEME_NAME-theme.md-primary.md-fab:not([disabled]):hover,.md-button.md-THEME_NAME-theme.md-primary.md-raised:not([disabled]).md-focused,.md-button.md-THEME_NAME-theme.md-primary.md-raised:not([disabled]):hover{background-color:\"{{primary-600}}\"}.md-button.md-THEME_NAME-theme.md-primary:not([disabled]) md-icon{color:\"{{primary-color}}\"}.md-button.md-THEME_NAME-theme.md-fab{background-color:\"{{accent-color}}\";color:\"{{accent-contrast}}\"}.md-button.md-THEME_NAME-theme.md-fab:not([disabled]) .md-icon{color:\"{{accent-contrast}}\"}.md-button.md-THEME_NAME-theme.md-fab:not([disabled]).md-focused,.md-button.md-THEME_NAME-theme.md-fab:not([disabled]):hover{background-color:\"{{accent-A700}}\"}.md-button.md-THEME_NAME-theme.md-raised{color:\"{{background-900}}\";background-color:\"{{background-50}}\"}.md-button.md-THEME_NAME-theme.md-raised:not([disabled]) md-icon{color:\"{{background-900}}\"}.md-button.md-THEME_NAME-theme.md-raised:not([disabled]):hover{background-color:\"{{background-50}}\"}.md-button.md-THEME_NAME-theme.md-raised:not([disabled]).md-focused{background-color:\"{{background-200}}\"}.md-button.md-THEME_NAME-theme.md-warn{color:\"{{warn-color}}\"}.md-button.md-THEME_NAME-theme.md-warn.md-fab,.md-button.md-THEME_NAME-theme.md-warn.md-raised{color:\"{{warn-contrast}}\";background-color:\"{{warn-color}}\"}.md-button.md-THEME_NAME-theme.md-warn.md-fab:not([disabled]) md-icon,.md-button.md-THEME_NAME-theme.md-warn.md-raised:not([disabled]) md-icon{color:\"{{warn-contrast}}\"}.md-button.md-THEME_NAME-theme.md-warn.md-fab:not([disabled]).md-focused,.md-button.md-THEME_NAME-theme.md-warn.md-fab:not([disabled]):hover,.md-button.md-THEME_NAME-theme.md-warn.md-raised:not([disabled]).md-focused,.md-button.md-THEME_NAME-theme.md-warn.md-raised:not([disabled]):hover{background-color:\"{{warn-600}}\"}.md-button.md-THEME_NAME-theme.md-warn:not([disabled]) md-icon{color:\"{{warn-color}}\"}.md-button.md-THEME_NAME-theme.md-accent{color:\"{{accent-color}}\"}.md-button.md-THEME_NAME-theme.md-accent.md-fab,.md-button.md-THEME_NAME-theme.md-accent.md-raised{color:\"{{accent-contrast}}\";background-color:\"{{accent-color}}\"}.md-button.md-THEME_NAME-theme.md-accent.md-fab:not([disabled]) md-icon,.md-button.md-THEME_NAME-theme.md-accent.md-raised:not([disabled]) md-icon{color:\"{{accent-contrast}}\"}.md-button.md-THEME_NAME-theme.md-accent.md-fab:not([disabled]).md-focused,.md-button.md-THEME_NAME-theme.md-accent.md-fab:not([disabled]):hover,.md-button.md-THEME_NAME-theme.md-accent.md-raised:not([disabled]).md-focused,.md-button.md-THEME_NAME-theme.md-accent.md-raised:not([disabled]):hover{background-color:\"{{accent-A700}}\"}.md-button.md-THEME_NAME-theme.md-accent:not([disabled]) md-icon{color:\"{{accent-color}}\"}.md-button.md-THEME_NAME-theme.md-accent[disabled],.md-button.md-THEME_NAME-theme.md-fab[disabled],.md-button.md-THEME_NAME-theme.md-raised[disabled],.md-button.md-THEME_NAME-theme.md-warn[disabled],.md-button.md-THEME_NAME-theme[disabled]{color:\"{{foreground-3}}\";cursor:default}.md-button.md-THEME_NAME-theme.md-accent[disabled] md-icon,.md-button.md-THEME_NAME-theme.md-fab[disabled] md-icon,.md-button.md-THEME_NAME-theme.md-raised[disabled] md-icon,.md-button.md-THEME_NAME-theme.md-warn[disabled] md-icon,.md-button.md-THEME_NAME-theme[disabled] md-icon{color:\"{{foreground-3}}\"}.md-button.md-THEME_NAME-theme.md-fab[disabled],.md-button.md-THEME_NAME-theme.md-raised[disabled]{background-color:\"{{foreground-4}}\"}.md-button.md-THEME_NAME-theme[disabled]{background-color:transparent}._md a.md-THEME_NAME-theme:not(.md-button).md-primary{color:\"{{primary-color}}\"}._md a.md-THEME_NAME-theme:not(.md-button).md-primary:hover{color:\"{{primary-700}}\"}._md a.md-THEME_NAME-theme:not(.md-button).md-accent{color:\"{{accent-color}}\"}._md a.md-THEME_NAME-theme:not(.md-button).md-accent:hover{color:\"{{accent-A700}}\"}._md a.md-THEME_NAME-theme:not(.md-button).md-warn{color:\"{{warn-color}}\"}._md a.md-THEME_NAME-theme:not(.md-button).md-warn:hover{color:\"{{warn-700}}\"}md-card.md-THEME_NAME-theme{color:\"{{foreground-1}}\";background-color:\"{{background-hue-1}}\";border-radius:2px}md-card.md-THEME_NAME-theme .md-card-image{border-radius:2px 2px 0 0}md-card.md-THEME_NAME-theme md-card-header md-card-avatar md-icon{color:\"{{background-color}}\";background-color:\"{{foreground-3}}\"}md-card.md-THEME_NAME-theme md-card-header md-card-header-text .md-subhead,md-card.md-THEME_NAME-theme md-card-title md-card-title-text:not(:only-child) .md-subhead{color:\"{{foreground-2}}\"}md-checkbox.md-THEME_NAME-theme .md-ripple{color:\"{{accent-A700}}\"}md-checkbox.md-THEME_NAME-theme.md-checked .md-ripple{color:\"{{background-600}}\"}md-checkbox.md-THEME_NAME-theme.md-checked.md-focused .md-container:before{background-color:\"{{accent-color-0.26}}\"}md-checkbox.md-THEME_NAME-theme .md-ink-ripple{color:\"{{foreground-2}}\"}md-checkbox.md-THEME_NAME-theme.md-checked .md-ink-ripple{color:\"{{accent-color-0.87}}\"}md-checkbox.md-THEME_NAME-theme:not(.md-checked) .md-icon{border-color:\"{{foreground-2}}\"}md-checkbox.md-THEME_NAME-theme.md-checked .md-icon{background-color:\"{{accent-color-0.87}}\"}md-checkbox.md-THEME_NAME-theme.md-checked .md-icon:after{border-color:\"{{accent-contrast-0.87}}\"}md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary .md-ripple{color:\"{{primary-600}}\"}md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-ripple{color:\"{{background-600}}\"}md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary .md-ink-ripple{color:\"{{foreground-2}}\"}md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-ink-ripple{color:\"{{primary-color-0.87}}\"}md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary:not(.md-checked) .md-icon{border-color:\"{{foreground-2}}\"}md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-icon{background-color:\"{{primary-color-0.87}}\"}md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked.md-focused .md-container:before{background-color:\"{{primary-color-0.26}}\"}md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-icon:after{border-color:\"{{primary-contrast-0.87}}\"}md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary .md-indeterminate[disabled] .md-container{color:\"{{foreground-3}}\"}md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn .md-ripple{color:\"{{warn-600}}\"}md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn .md-ink-ripple{color:\"{{foreground-2}}\"}md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked .md-ink-ripple{color:\"{{warn-color-0.87}}\"}md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn:not(.md-checked) .md-icon{border-color:\"{{foreground-2}}\"}md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked .md-icon{background-color:\"{{warn-color-0.87}}\"}md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked.md-focused:not([disabled]) .md-container:before{background-color:\"{{warn-color-0.26}}\"}md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked .md-icon:after{border-color:\"{{background-200}}\"}md-checkbox.md-THEME_NAME-theme[disabled]:not(.md-checked) .md-icon{border-color:\"{{foreground-3}}\"}md-checkbox.md-THEME_NAME-theme[disabled].md-checked .md-icon{background-color:\"{{foreground-3}}\"}md-checkbox.md-THEME_NAME-theme[disabled].md-checked .md-icon:after{border-color:\"{{background-200}}\"}md-checkbox.md-THEME_NAME-theme[disabled] .md-icon:after{border-color:\"{{foreground-3}}\"}md-checkbox.md-THEME_NAME-theme[disabled] .md-label{color:\"{{foreground-3}}\"}md-chips.md-THEME_NAME-theme .md-chips{box-shadow:0 1px \"{{foreground-4}}\"}md-chips.md-THEME_NAME-theme .md-chips.md-focused{box-shadow:0 2px \"{{primary-color}}\"}md-chips.md-THEME_NAME-theme .md-chips .md-chip-input-container input{color:\"{{foreground-1}}\"}md-chips.md-THEME_NAME-theme .md-chips .md-chip-input-container input:-moz-placeholder,md-chips.md-THEME_NAME-theme .md-chips .md-chip-input-container input::-moz-placeholder{color:\"{{foreground-3}}\"}md-chips.md-THEME_NAME-theme .md-chips .md-chip-input-container input:-ms-input-placeholder{color:\"{{foreground-3}}\"}md-chips.md-THEME_NAME-theme .md-chips .md-chip-input-container input::-webkit-input-placeholder{color:\"{{foreground-3}}\"}md-chips.md-THEME_NAME-theme md-chip{background:\"{{background-300}}\";color:\"{{background-800}}\"}md-chips.md-THEME_NAME-theme md-chip md-icon{color:\"{{background-700}}\"}md-chips.md-THEME_NAME-theme md-chip.md-focused{background:\"{{primary-color}}\";color:\"{{primary-contrast}}\"}md-chips.md-THEME_NAME-theme md-chip.md-focused md-icon{color:\"{{primary-contrast}}\"}md-chips.md-THEME_NAME-theme md-chip._md-chip-editing{background:transparent;color:\"{{background-800}}\"}md-chips.md-THEME_NAME-theme md-chip-remove .md-button md-icon path{fill:\"{{background-500}}\"}.md-contact-suggestion span.md-contact-email{color:\"{{background-400}}\"}md-content.md-THEME_NAME-theme{color:\"{{foreground-1}}\";background-color:\"{{background-default}}\"}.md-THEME_NAME-theme .md-calendar{background:\"{{background-hue-1}}\";color:\"{{foreground-1-0.87}}\"}.md-THEME_NAME-theme .md-calendar tr:last-child td{border-bottom-color:\"{{background-hue-2}}\"}.md-THEME_NAME-theme .md-calendar-day-header{background:\"{{background-500-0.32}}\";color:\"{{foreground-1-0.87}}\"}.md-THEME_NAME-theme .md-calendar-date.md-calendar-date-today .md-calendar-date-selection-indicator{border:1px solid \"{{primary-500}}\"}.md-THEME_NAME-theme .md-calendar-date.md-calendar-date-today.md-calendar-date-disabled{color:\"{{primary-500-0.6}}\"}.md-calendar-date.md-focus .md-THEME_NAME-theme .md-calendar-date-selection-indicator,.md-THEME_NAME-theme .md-calendar-date-selection-indicator:hover{background:\"{{background-500-0.32}}\"}.md-THEME_NAME-theme .md-calendar-date.md-calendar-selected-date .md-calendar-date-selection-indicator,.md-THEME_NAME-theme .md-calendar-date.md-focus.md-calendar-selected-date .md-calendar-date-selection-indicator{background:\"{{primary-500}}\";color:\"{{primary-500-contrast}}\";border-color:transparent}.md-THEME_NAME-theme .md-calendar-date-disabled,.md-THEME_NAME-theme .md-calendar-month-label-disabled{color:\"{{foreground-3}}\"}.md-THEME_NAME-theme .md-calendar-month-label md-icon,.md-THEME_NAME-theme .md-datepicker-input{color:\"{{foreground-1}}\"}.md-THEME_NAME-theme .md-datepicker-input:-moz-placeholder,.md-THEME_NAME-theme .md-datepicker-input::-moz-placeholder{color:\"{{foreground-3}}\"}.md-THEME_NAME-theme .md-datepicker-input:-ms-input-placeholder{color:\"{{foreground-3}}\"}.md-THEME_NAME-theme .md-datepicker-input::-webkit-input-placeholder{color:\"{{foreground-3}}\"}.md-THEME_NAME-theme .md-datepicker-input-container{border-bottom-color:\"{{foreground-4}}\"}.md-THEME_NAME-theme .md-datepicker-input-container.md-datepicker-focused{border-bottom-color:\"{{primary-color}}\"}.md-accent .md-THEME_NAME-theme .md-datepicker-input-container.md-datepicker-focused{border-bottom-color:\"{{accent-color}}\"}.md-THEME_NAME-theme .md-datepicker-input-container.md-datepicker-invalid,.md-warn .md-THEME_NAME-theme .md-datepicker-input-container.md-datepicker-focused{border-bottom-color:\"{{warn-A700}}\"}.md-THEME_NAME-theme .md-datepicker-calendar-pane{border-color:\"{{background-hue-1}}\"}.md-THEME_NAME-theme .md-datepicker-triangle-button .md-datepicker-expand-triangle{border-top-color:\"{{foreground-2}}\"}.md-THEME_NAME-theme .md-datepicker-open .md-datepicker-calendar-icon{color:\"{{primary-color}}\"}.md-accent .md-THEME_NAME-theme .md-datepicker-open .md-datepicker-calendar-icon,.md-THEME_NAME-theme .md-datepicker-open.md-accent .md-datepicker-calendar-icon{color:\"{{accent-color}}\"}.md-THEME_NAME-theme .md-datepicker-open.md-warn .md-datepicker-calendar-icon,.md-warn .md-THEME_NAME-theme .md-datepicker-open .md-datepicker-calendar-icon{color:\"{{warn-A700}}\"}.md-THEME_NAME-theme .md-datepicker-calendar{background:\"{{background-hue-1}}\"}.md-THEME_NAME-theme .md-datepicker-input-mask-opaque{box-shadow:0 0 0 9999px \"{{background-hue-1}}\"}.md-THEME_NAME-theme .md-datepicker-open .md-datepicker-input-container{background:\"{{background-hue-1}}\"}md-dialog.md-THEME_NAME-theme{border-radius:4px;background-color:\"{{background-hue-1}}\";color:\"{{foreground-1}}\"}md-dialog.md-THEME_NAME-theme.md-content-overflow .md-actions,md-dialog.md-THEME_NAME-theme.md-content-overflow md-dialog-actions,md-divider.md-THEME_NAME-theme{border-top-color:\"{{foreground-4}}\"}.layout-gt-lg-row>md-divider.md-THEME_NAME-theme,.layout-gt-md-row>md-divider.md-THEME_NAME-theme,.layout-gt-sm-row>md-divider.md-THEME_NAME-theme,.layout-gt-xs-row>md-divider.md-THEME_NAME-theme,.layout-lg-row>md-divider.md-THEME_NAME-theme,.layout-md-row>md-divider.md-THEME_NAME-theme,.layout-row>md-divider.md-THEME_NAME-theme,.layout-sm-row>md-divider.md-THEME_NAME-theme,.layout-xl-row>md-divider.md-THEME_NAME-theme,.layout-xs-row>md-divider.md-THEME_NAME-theme{border-right-color:\"{{foreground-4}}\"}md-icon.md-THEME_NAME-theme{color:\"{{foreground-2}}\"}md-icon.md-THEME_NAME-theme.md-primary{color:\"{{primary-color}}\"}md-icon.md-THEME_NAME-theme.md-accent{color:\"{{accent-color}}\"}md-icon.md-THEME_NAME-theme.md-warn{color:\"{{warn-color}}\"}md-input-container.md-THEME_NAME-theme .md-input{color:\"{{foreground-1}}\";border-color:\"{{foreground-4}}\"}md-input-container.md-THEME_NAME-theme .md-input:-moz-placeholder,md-input-container.md-THEME_NAME-theme .md-input::-moz-placeholder{color:\"{{foreground-3}}\"}md-input-container.md-THEME_NAME-theme .md-input:-ms-input-placeholder{color:\"{{foreground-3}}\"}md-input-container.md-THEME_NAME-theme .md-input::-webkit-input-placeholder{color:\"{{foreground-3}}\"}md-input-container.md-THEME_NAME-theme>md-icon{color:\"{{foreground-1}}\"}md-input-container.md-THEME_NAME-theme .md-placeholder,md-input-container.md-THEME_NAME-theme label{color:\"{{foreground-3}}\"}md-input-container.md-THEME_NAME-theme label.md-required:after{color:\"{{warn-A700}}\"}md-input-container.md-THEME_NAME-theme:not(.md-input-focused):not(.md-input-invalid) label.md-required:after{color:\"{{foreground-2}}\"}md-input-container.md-THEME_NAME-theme .md-input-message-animation,md-input-container.md-THEME_NAME-theme .md-input-messages-animation{color:\"{{warn-A700}}\"}md-input-container.md-THEME_NAME-theme .md-input-message-animation .md-char-counter,md-input-container.md-THEME_NAME-theme .md-input-messages-animation .md-char-counter{color:\"{{foreground-1}}\"}md-input-container.md-THEME_NAME-theme.md-input-focused .md-input:-moz-placeholder,md-input-container.md-THEME_NAME-theme.md-input-focused .md-input::-moz-placeholder{color:\"{{foreground-2}}\"}md-input-container.md-THEME_NAME-theme.md-input-focused .md-input:-ms-input-placeholder{color:\"{{foreground-2}}\"}md-input-container.md-THEME_NAME-theme.md-input-focused .md-input::-webkit-input-placeholder{color:\"{{foreground-2}}\"}md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-has-value label{color:\"{{foreground-2}}\"}md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused .md-input,md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-resized .md-input{border-color:\"{{primary-color}}\"}md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused label,md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused md-icon{color:\"{{primary-color}}\"}md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused.md-accent .md-input{border-color:\"{{accent-color}}\"}md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused.md-accent label,md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused.md-accent md-icon{color:\"{{accent-color}}\"}md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused.md-warn .md-input{border-color:\"{{warn-A700}}\"}md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused.md-warn label,md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused.md-warn md-icon{color:\"{{warn-A700}}\"}md-input-container.md-THEME_NAME-theme.md-input-invalid .md-input{border-color:\"{{warn-A700}}\"}md-input-container.md-THEME_NAME-theme.md-input-invalid .md-char-counter,md-input-container.md-THEME_NAME-theme.md-input-invalid .md-input-message-animation,md-input-container.md-THEME_NAME-theme.md-input-invalid label{color:\"{{warn-A700}}\"}[disabled] md-input-container.md-THEME_NAME-theme .md-input,md-input-container.md-THEME_NAME-theme .md-input[disabled]{border-bottom-color:transparent;color:\"{{foreground-3}}\";background-image:linear-gradient(90deg,\"{{foreground-3}}\" 0,\"{{foreground-3}}\" 33%,transparent 0);background-image:-ms-linear-gradient(left,transparent 0,\"{{foreground-3}}\" 100%)}md-list.md-THEME_NAME-theme md-list-item.md-2-line .md-list-item-text h3,md-list.md-THEME_NAME-theme md-list-item.md-2-line .md-list-item-text h4,md-list.md-THEME_NAME-theme md-list-item.md-3-line .md-list-item-text h3,md-list.md-THEME_NAME-theme md-list-item.md-3-line .md-list-item-text h4{color:\"{{foreground-1}}\"}md-list.md-THEME_NAME-theme md-list-item.md-2-line .md-list-item-text p,md-list.md-THEME_NAME-theme md-list-item.md-3-line .md-list-item-text p{color:\"{{foreground-2}}\"}md-list.md-THEME_NAME-theme .md-proxy-focus.md-focused div.md-no-style{background-color:\"{{background-100}}\"}md-list.md-THEME_NAME-theme md-list-item .md-avatar-icon{background-color:\"{{foreground-3}}\";color:\"{{background-color}}\"}md-list.md-THEME_NAME-theme md-list-item>md-icon{color:\"{{foreground-2}}\"}md-list.md-THEME_NAME-theme md-list-item>md-icon.md-highlight{color:\"{{primary-color}}\"}md-list.md-THEME_NAME-theme md-list-item>md-icon.md-highlight.md-accent{color:\"{{accent-color}}\"}md-menu-content.md-THEME_NAME-theme{background-color:\"{{background-hue-1}}\"}md-menu-content.md-THEME_NAME-theme md-menu-item{color:\"{{foreground-1}}\"}md-menu-content.md-THEME_NAME-theme md-menu-item md-icon{color:\"{{foreground-2}}\"}md-menu-content.md-THEME_NAME-theme md-menu-item .md-button[disabled],md-menu-content.md-THEME_NAME-theme md-menu-item .md-button[disabled] md-icon{color:\"{{foreground-3}}\"}md-menu-content.md-THEME_NAME-theme md-menu-divider{background-color:\"{{foreground-4}}\"}md-menu-bar.md-THEME_NAME-theme>button.md-button{color:\"{{foreground-1}}\";border-radius:2px}md-menu-bar.md-THEME_NAME-theme md-menu>button{color:\"{{foreground-1}}\"}md-menu-bar.md-THEME_NAME-theme md-menu.md-open>button,md-menu-bar.md-THEME_NAME-theme md-menu>button:focus{outline:none;background-color:\"{{ background-500-0.18}}\"}md-menu-bar.md-THEME_NAME-theme.md-open:not(.md-keyboard-mode) md-menu:hover>button{background-color:\"{{ background-500-0.18}}\"}md-menu-bar.md-THEME_NAME-theme:not(.md-keyboard-mode):not(.md-open) md-menu button:focus,md-menu-bar.md-THEME_NAME-theme:not(.md-keyboard-mode):not(.md-open) md-menu button:hover{background:transparent}md-menu-content.md-THEME_NAME-theme .md-menu>.md-button:after{color:\"{{foreground-2}}\"}md-menu-content.md-THEME_NAME-theme .md-menu.md-open>.md-button{background-color:\"{{ background-500-0.18}}\"}md-toolbar.md-THEME_NAME-theme.md-menu-toolbar{background-color:\"{{background-hue-1}}\";color:\"{{foreground-1}}\"}md-toolbar.md-THEME_NAME-theme.md-menu-toolbar md-toolbar-filler{background-color:\"{{primary-color}}\";color:\"{{primary-contrast}}\"}md-toolbar.md-THEME_NAME-theme.md-menu-toolbar md-toolbar-filler md-icon{color:\"{{primary-contrast}}\"}md-nav-bar.md-THEME_NAME-theme .md-nav-bar{background-color:transparent;border-color:\"{{foreground-4}}\"}md-nav-bar.md-THEME_NAME-theme .md-button._md-nav-button.md-unselected{color:\"{{foreground-2}}\"}md-nav-bar.md-THEME_NAME-theme .md-button._md-nav-button[disabled]{color:\"{{foreground-3}}\"}md-nav-bar.md-THEME_NAME-theme md-nav-ink-bar{color:\"{{accent-color}}\";background:\"{{accent-color}}\"}md-nav-bar.md-THEME_NAME-theme.md-accent>.md-nav-bar{background-color:\"{{accent-color}}\"}md-nav-bar.md-THEME_NAME-theme.md-accent>.md-nav-bar .md-button._md-nav-button{color:\"{{accent-A100}}\"}md-nav-bar.md-THEME_NAME-theme.md-accent>.md-nav-bar .md-button._md-nav-button.md-active,md-nav-bar.md-THEME_NAME-theme.md-accent>.md-nav-bar .md-button._md-nav-button.md-focused{color:\"{{accent-contrast}}\"}md-nav-bar.md-THEME_NAME-theme.md-accent>.md-nav-bar .md-button._md-nav-button.md-focused{background:\"{{accent-contrast-0.1}}\"}md-nav-bar.md-THEME_NAME-theme.md-accent>.md-nav-bar md-nav-ink-bar{color:\"{{primary-600-1}}\";background:\"{{primary-600-1}}\"}md-nav-bar.md-THEME_NAME-theme.md-warn>.md-nav-bar{background-color:\"{{warn-color}}\"}md-nav-bar.md-THEME_NAME-theme.md-warn>.md-nav-bar .md-button._md-nav-button{color:\"{{warn-100}}\"}md-nav-bar.md-THEME_NAME-theme.md-warn>.md-nav-bar .md-button._md-nav-button.md-active,md-nav-bar.md-THEME_NAME-theme.md-warn>.md-nav-bar .md-button._md-nav-button.md-focused{color:\"{{warn-contrast}}\"}md-nav-bar.md-THEME_NAME-theme.md-warn>.md-nav-bar .md-button._md-nav-button.md-focused{background:\"{{warn-contrast-0.1}}\"}md-nav-bar.md-THEME_NAME-theme.md-primary>.md-nav-bar{background-color:\"{{primary-color}}\"}md-nav-bar.md-THEME_NAME-theme.md-primary>.md-nav-bar .md-button._md-nav-button{color:\"{{primary-100}}\"}md-nav-bar.md-THEME_NAME-theme.md-primary>.md-nav-bar .md-button._md-nav-button.md-active,md-nav-bar.md-THEME_NAME-theme.md-primary>.md-nav-bar .md-button._md-nav-button.md-focused{color:\"{{primary-contrast}}\"}md-nav-bar.md-THEME_NAME-theme.md-primary>.md-nav-bar .md-button._md-nav-button.md-focused{background:\"{{primary-contrast-0.1}}\"}md-toolbar>md-nav-bar.md-THEME_NAME-theme>.md-nav-bar{background-color:\"{{primary-color}}\"}md-toolbar>md-nav-bar.md-THEME_NAME-theme>.md-nav-bar .md-button._md-nav-button{color:\"{{primary-100}}\"}md-toolbar>md-nav-bar.md-THEME_NAME-theme>.md-nav-bar .md-button._md-nav-button.md-active,md-toolbar>md-nav-bar.md-THEME_NAME-theme>.md-nav-bar .md-button._md-nav-button.md-focused{color:\"{{primary-contrast}}\"}md-toolbar>md-nav-bar.md-THEME_NAME-theme>.md-nav-bar .md-button._md-nav-button.md-focused{background:\"{{primary-contrast-0.1}}\"}md-toolbar.md-accent>md-nav-bar.md-THEME_NAME-theme>.md-nav-bar{background-color:\"{{accent-color}}\"}md-toolbar.md-accent>md-nav-bar.md-THEME_NAME-theme>.md-nav-bar .md-button._md-nav-button{color:\"{{accent-A100}}\"}md-toolbar.md-accent>md-nav-bar.md-THEME_NAME-theme>.md-nav-bar .md-button._md-nav-button.md-active,md-toolbar.md-accent>md-nav-bar.md-THEME_NAME-theme>.md-nav-bar .md-button._md-nav-button.md-focused{color:\"{{accent-contrast}}\"}md-toolbar.md-accent>md-nav-bar.md-THEME_NAME-theme>.md-nav-bar .md-button._md-nav-button.md-focused{background:\"{{accent-contrast-0.1}}\"}md-toolbar.md-accent>md-nav-bar.md-THEME_NAME-theme>.md-nav-bar md-nav-ink-bar{color:\"{{primary-600-1}}\";background:\"{{primary-600-1}}\"}md-toolbar.md-warn>md-nav-bar.md-THEME_NAME-theme>.md-nav-bar{background-color:\"{{warn-color}}\"}md-toolbar.md-warn>md-nav-bar.md-THEME_NAME-theme>.md-nav-bar .md-button._md-nav-button{color:\"{{warn-100}}\"}md-toolbar.md-warn>md-nav-bar.md-THEME_NAME-theme>.md-nav-bar .md-button._md-nav-button.md-active,md-toolbar.md-warn>md-nav-bar.md-THEME_NAME-theme>.md-nav-bar .md-button._md-nav-button.md-focused{color:\"{{warn-contrast}}\"}md-toolbar.md-warn>md-nav-bar.md-THEME_NAME-theme>.md-nav-bar .md-button._md-nav-button.md-focused{background:\"{{warn-contrast-0.1}}\"}._md-panel-backdrop.md-THEME_NAME-theme{background-color:\"{{background-900-1.0}}\"}md-progress-circular.md-THEME_NAME-theme path{stroke:\"{{primary-color}}\"}md-progress-circular.md-THEME_NAME-theme.md-warn path{stroke:\"{{warn-color}}\"}md-progress-circular.md-THEME_NAME-theme.md-accent path{stroke:\"{{accent-color}}\"}md-progress-linear.md-THEME_NAME-theme .md-container{background-color:\"{{primary-100}}\"}md-progress-linear.md-THEME_NAME-theme .md-bar{background-color:\"{{primary-color}}\"}md-progress-linear.md-THEME_NAME-theme.md-warn .md-container{background-color:\"{{warn-100}}\"}md-progress-linear.md-THEME_NAME-theme.md-warn .md-bar{background-color:\"{{warn-color}}\"}md-progress-linear.md-THEME_NAME-theme.md-accent .md-container{background-color:\"{{accent-100}}\"}md-progress-linear.md-THEME_NAME-theme.md-accent .md-bar{background-color:\"{{accent-color}}\"}md-progress-linear.md-THEME_NAME-theme[md-mode=buffer].md-primary .md-bar1{background-color:\"{{primary-100}}\"}md-progress-linear.md-THEME_NAME-theme[md-mode=buffer].md-primary .md-dashed:before{background:radial-gradient(\"{{primary-100}}\" 0,\"{{primary-100}}\" 16%,transparent 42%)}md-progress-linear.md-THEME_NAME-theme[md-mode=buffer].md-warn .md-bar1{background-color:\"{{warn-100}}\"}md-progress-linear.md-THEME_NAME-theme[md-mode=buffer].md-warn .md-dashed:before{background:radial-gradient(\"{{warn-100}}\" 0,\"{{warn-100}}\" 16%,transparent 42%)}md-progress-linear.md-THEME_NAME-theme[md-mode=buffer].md-accent .md-bar1{background-color:\"{{accent-100}}\"}md-progress-linear.md-THEME_NAME-theme[md-mode=buffer].md-accent .md-dashed:before{background:radial-gradient(\"{{accent-100}}\" 0,\"{{accent-100}}\" 16%,transparent 42%)}md-radio-button.md-THEME_NAME-theme .md-off{border-color:\"{{foreground-2}}\"}md-radio-button.md-THEME_NAME-theme .md-on{background-color:\"{{accent-color-0.87}}\"}md-radio-button.md-THEME_NAME-theme.md-checked .md-off{border-color:\"{{accent-color-0.87}}\"}md-radio-button.md-THEME_NAME-theme.md-checked .md-ink-ripple{color:\"{{accent-color-0.87}}\"}md-radio-button.md-THEME_NAME-theme .md-container .md-ripple{color:\"{{accent-A700}}\"}md-radio-button.md-THEME_NAME-theme:not([disabled]).md-primary .md-on,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-primary .md-on,md-radio-group.md-THEME_NAME-theme:not([disabled]).md-primary .md-on,md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-primary .md-on{background-color:\"{{primary-color-0.87}}\"}md-radio-button.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-off,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-primary.md-checked .md-off,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-primary .md-checked .md-off,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-primary .md-checked .md-off,md-radio-group.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-off,md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-primary.md-checked .md-off,md-radio-group.md-THEME_NAME-theme:not([disabled]).md-primary .md-checked .md-off,md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-primary .md-checked .md-off{border-color:\"{{primary-color-0.87}}\"}md-radio-button.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-ink-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-primary.md-checked .md-ink-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-primary .md-checked .md-ink-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-primary .md-checked .md-ink-ripple,md-radio-group.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-ink-ripple,md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-primary.md-checked .md-ink-ripple,md-radio-group.md-THEME_NAME-theme:not([disabled]).md-primary .md-checked .md-ink-ripple,md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-primary .md-checked .md-ink-ripple{color:\"{{primary-color-0.87}}\"}md-radio-button.md-THEME_NAME-theme:not([disabled]).md-primary .md-container .md-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-primary .md-container .md-ripple,md-radio-group.md-THEME_NAME-theme:not([disabled]).md-primary .md-container .md-ripple,md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-primary .md-container .md-ripple{color:\"{{primary-600}}\"}md-radio-button.md-THEME_NAME-theme:not([disabled]).md-warn .md-on,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-warn .md-on,md-radio-group.md-THEME_NAME-theme:not([disabled]).md-warn .md-on,md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-warn .md-on{background-color:\"{{warn-color-0.87}}\"}md-radio-button.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked .md-off,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-warn.md-checked .md-off,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-warn .md-checked .md-off,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-warn .md-checked .md-off,md-radio-group.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked .md-off,md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-warn.md-checked .md-off,md-radio-group.md-THEME_NAME-theme:not([disabled]).md-warn .md-checked .md-off,md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-warn .md-checked .md-off{border-color:\"{{warn-color-0.87}}\"}md-radio-button.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked .md-ink-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-warn.md-checked .md-ink-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-warn .md-checked .md-ink-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-warn .md-checked .md-ink-ripple,md-radio-group.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked .md-ink-ripple,md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-warn.md-checked .md-ink-ripple,md-radio-group.md-THEME_NAME-theme:not([disabled]).md-warn .md-checked .md-ink-ripple,md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-warn .md-checked .md-ink-ripple{color:\"{{warn-color-0.87}}\"}md-radio-button.md-THEME_NAME-theme:not([disabled]).md-warn .md-container .md-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-warn .md-container .md-ripple,md-radio-group.md-THEME_NAME-theme:not([disabled]).md-warn .md-container .md-ripple,md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-warn .md-container .md-ripple{color:\"{{warn-600}}\"}md-radio-button.md-THEME_NAME-theme[disabled],md-radio-group.md-THEME_NAME-theme[disabled]{color:\"{{foreground-3}}\"}md-radio-button.md-THEME_NAME-theme[disabled] .md-container .md-off,md-radio-button.md-THEME_NAME-theme[disabled] .md-container .md-on,md-radio-group.md-THEME_NAME-theme[disabled] .md-container .md-off,md-radio-group.md-THEME_NAME-theme[disabled] .md-container .md-on{border-color:\"{{foreground-3}}\"}md-radio-group.md-THEME_NAME-theme .md-checked .md-ink-ripple{color:\"{{accent-color-0.26}}\"}md-radio-group.md-THEME_NAME-theme .md-checked:not([disabled]).md-primary .md-ink-ripple,md-radio-group.md-THEME_NAME-theme.md-primary .md-checked:not([disabled]) .md-ink-ripple{color:\"{{primary-color-0.26}}\"}md-radio-group.md-THEME_NAME-theme.md-focused:not(:empty) .md-checked .md-container:before{background-color:\"{{accent-color-0.26}}\"}md-radio-group.md-THEME_NAME-theme.md-focused:not(:empty) .md-checked.md-primary .md-container:before,md-radio-group.md-THEME_NAME-theme.md-focused:not(:empty).md-primary .md-checked .md-container:before{background-color:\"{{primary-color-0.26}}\"}md-radio-group.md-THEME_NAME-theme.md-focused:not(:empty) .md-checked.md-warn .md-container:before,md-radio-group.md-THEME_NAME-theme.md-focused:not(:empty).md-warn .md-checked .md-container:before{background-color:\"{{warn-color-0.26}}\"}md-input-container md-select.md-THEME_NAME-theme .md-select-value span:first-child:after{color:\"{{warn-A700}}\"}md-input-container:not(.md-input-focused):not(.md-input-invalid) md-select.md-THEME_NAME-theme .md-select-value span:first-child:after{color:\"{{foreground-3}}\"}md-input-container.md-input-focused:not(.md-input-has-value) md-select.md-THEME_NAME-theme .md-select-value,md-input-container.md-input-focused:not(.md-input-has-value) md-select.md-THEME_NAME-theme .md-select-value.md-select-placeholder{color:\"{{primary-color}}\"}md-input-container.md-input-invalid md-select.md-THEME_NAME-theme .md-select-value{color:\"{{warn-A700}}\"!important;border-bottom-color:\"{{warn-A700}}\"!important}md-input-container.md-input-invalid md-select.md-THEME_NAME-theme.md-no-underline .md-select-value{border-bottom-color:transparent!important}md-select.md-THEME_NAME-theme[disabled] .md-select-value{border-bottom-color:transparent;background-image:linear-gradient(90deg,\"{{foreground-3}}\" 0,\"{{foreground-3}}\" 33%,transparent 0);background-image:-ms-linear-gradient(left,transparent 0,\"{{foreground-3}}\" 100%)}md-select.md-THEME_NAME-theme .md-select-value{border-bottom-color:\"{{foreground-4}}\"}md-select.md-THEME_NAME-theme .md-select-value.md-select-placeholder{color:\"{{foreground-3}}\"}md-select.md-THEME_NAME-theme .md-select-value span:first-child:after{color:\"{{warn-A700}}\"}md-select.md-THEME_NAME-theme.md-no-underline .md-select-value{border-bottom-color:transparent!important}md-select.md-THEME_NAME-theme.ng-invalid.ng-touched .md-select-value{color:\"{{warn-A700}}\"!important;border-bottom-color:\"{{warn-A700}}\"!important}md-select.md-THEME_NAME-theme.ng-invalid.ng-touched.md-no-underline .md-select-value{border-bottom-color:transparent!important}md-select.md-THEME_NAME-theme:not([disabled]):focus .md-select-value{border-bottom-color:\"{{primary-color}}\";color:\"{{ foreground-1 }}\"}md-select.md-THEME_NAME-theme:not([disabled]):focus .md-select-value.md-select-placeholder{color:\"{{ foreground-1 }}\"}md-select.md-THEME_NAME-theme:not([disabled]):focus.md-no-underline .md-select-value{border-bottom-color:transparent!important}md-select.md-THEME_NAME-theme:not([disabled]):focus.md-accent .md-select-value{border-bottom-color:\"{{accent-color}}\"}md-select.md-THEME_NAME-theme:not([disabled]):focus.md-warn .md-select-value{border-bottom-color:\"{{warn-color}}\"}md-select.md-THEME_NAME-theme[disabled] .md-select-icon,md-select.md-THEME_NAME-theme[disabled] .md-select-value,md-select.md-THEME_NAME-theme[disabled] .md-select-value.md-select-placeholder{color:\"{{foreground-3}}\"}md-select.md-THEME_NAME-theme .md-select-icon{color:\"{{foreground-2}}\"}md-select-menu.md-THEME_NAME-theme md-content{background-color:\"{{background-hue-1}}\"}md-select-menu.md-THEME_NAME-theme md-content md-optgroup{color:\"{{foreground-2}}\"}md-select-menu.md-THEME_NAME-theme md-content md-option{color:\"{{foreground-1}}\"}md-select-menu.md-THEME_NAME-theme md-content md-option[disabled] .md-text{color:\"{{foreground-3}}\"}md-select-menu.md-THEME_NAME-theme md-content md-option:not([disabled]):focus,md-select-menu.md-THEME_NAME-theme md-content md-option:not([disabled]):hover{background-color:\"{{background-500-0.18}}\"}md-select-menu.md-THEME_NAME-theme md-content md-option[selected]{color:\"{{primary-500}}\"}md-select-menu.md-THEME_NAME-theme md-content md-option[selected]:focus{color:\"{{primary-600}}\"}md-select-menu.md-THEME_NAME-theme md-content md-option[selected].md-accent{color:\"{{accent-color}}\"}md-select-menu.md-THEME_NAME-theme md-content md-option[selected].md-accent:focus{color:\"{{accent-A700}}\"}.md-checkbox-enabled.md-THEME_NAME-theme .md-ripple{color:\"{{primary-600}}\"}.md-checkbox-enabled.md-THEME_NAME-theme[selected] .md-ripple{color:\"{{background-600}}\"}.md-checkbox-enabled.md-THEME_NAME-theme .md-ink-ripple{color:\"{{foreground-2}}\"}.md-checkbox-enabled.md-THEME_NAME-theme[selected] .md-ink-ripple{color:\"{{primary-color-0.87}}\"}.md-checkbox-enabled.md-THEME_NAME-theme:not(.md-checked) .md-icon{border-color:\"{{foreground-2}}\"}.md-checkbox-enabled.md-THEME_NAME-theme[selected] .md-icon{background-color:\"{{primary-color-0.87}}\"}.md-checkbox-enabled.md-THEME_NAME-theme[selected].md-focused .md-container:before{background-color:\"{{primary-color-0.26}}\"}.md-checkbox-enabled.md-THEME_NAME-theme[selected] .md-icon:after{border-color:\"{{primary-contrast-0.87}}\"}.md-checkbox-enabled.md-THEME_NAME-theme .md-indeterminate[disabled] .md-container{color:\"{{foreground-3}}\"}.md-checkbox-enabled.md-THEME_NAME-theme md-option .md-text{color:\"{{foreground-1}}\"}md-sidenav.md-THEME_NAME-theme,md-sidenav.md-THEME_NAME-theme md-content{background-color:\"{{background-hue-1}}\"}md-slider.md-THEME_NAME-theme .md-track{background-color:\"{{foreground-3}}\"}md-slider.md-THEME_NAME-theme .md-track-ticks{color:\"{{background-contrast}}\"}md-slider.md-THEME_NAME-theme .md-focus-ring{background-color:\"{{accent-A200-0.2}}\"}md-slider.md-THEME_NAME-theme .md-disabled-thumb{border-color:\"{{background-color}}\";background-color:\"{{background-color}}\"}md-slider.md-THEME_NAME-theme.md-min .md-thumb:after{background-color:\"{{background-color}}\";border-color:\"{{foreground-3}}\"}md-slider.md-THEME_NAME-theme.md-min .md-focus-ring{background-color:\"{{foreground-3-0.38}}\"}md-slider.md-THEME_NAME-theme.md-min[md-discrete] .md-thumb:after{background-color:\"{{background-contrast}}\";border-color:transparent}md-slider.md-THEME_NAME-theme.md-min[md-discrete] .md-sign{background-color:\"{{background-400}}\"}md-slider.md-THEME_NAME-theme.md-min[md-discrete] .md-sign:after{border-top-color:\"{{background-400}}\"}md-slider.md-THEME_NAME-theme.md-min[md-discrete][md-vertical] .md-sign:after{border-top-color:transparent;border-left-color:\"{{background-400}}\"}md-slider.md-THEME_NAME-theme .md-track.md-track-fill{background-color:\"{{accent-color}}\"}md-slider.md-THEME_NAME-theme .md-thumb:after{border-color:\"{{accent-color}}\";background-color:\"{{accent-color}}\"}md-slider.md-THEME_NAME-theme .md-sign{background-color:\"{{accent-color}}\"}md-slider.md-THEME_NAME-theme .md-sign:after{border-top-color:\"{{accent-color}}\"}md-slider.md-THEME_NAME-theme[md-vertical] .md-sign:after{border-top-color:transparent;border-left-color:\"{{accent-color}}\"}md-slider.md-THEME_NAME-theme .md-thumb-text{color:\"{{accent-contrast}}\"}md-slider.md-THEME_NAME-theme.md-warn .md-focus-ring{background-color:\"{{warn-200-0.38}}\"}md-slider.md-THEME_NAME-theme.md-warn .md-track.md-track-fill{background-color:\"{{warn-color}}\"}md-slider.md-THEME_NAME-theme.md-warn .md-thumb:after{border-color:\"{{warn-color}}\";background-color:\"{{warn-color}}\"}md-slider.md-THEME_NAME-theme.md-warn .md-sign{background-color:\"{{warn-color}}\"}md-slider.md-THEME_NAME-theme.md-warn .md-sign:after{border-top-color:\"{{warn-color}}\"}md-slider.md-THEME_NAME-theme.md-warn[md-vertical] .md-sign:after{border-top-color:transparent;border-left-color:\"{{warn-color}}\"}md-slider.md-THEME_NAME-theme.md-warn .md-thumb-text{color:\"{{warn-contrast}}\"}md-slider.md-THEME_NAME-theme.md-primary .md-focus-ring{background-color:\"{{primary-200-0.38}}\"}md-slider.md-THEME_NAME-theme.md-primary .md-track.md-track-fill{background-color:\"{{primary-color}}\"}md-slider.md-THEME_NAME-theme.md-primary .md-thumb:after{border-color:\"{{primary-color}}\";background-color:\"{{primary-color}}\"}md-slider.md-THEME_NAME-theme.md-primary .md-sign{background-color:\"{{primary-color}}\"}md-slider.md-THEME_NAME-theme.md-primary .md-sign:after{border-top-color:\"{{primary-color}}\"}md-slider.md-THEME_NAME-theme.md-primary[md-vertical] .md-sign:after{border-top-color:transparent;border-left-color:\"{{primary-color}}\"}md-slider.md-THEME_NAME-theme.md-primary .md-thumb-text{color:\"{{primary-contrast}}\"}md-slider.md-THEME_NAME-theme[disabled] .md-thumb:after{border-color:transparent}md-slider.md-THEME_NAME-theme[disabled]:not(.md-min) .md-thumb:after,md-slider.md-THEME_NAME-theme[disabled][md-discrete] .md-thumb:after{background-color:\"{{foreground-3}}\";border-color:transparent}md-slider.md-THEME_NAME-theme[disabled][readonly] .md-sign{background-color:\"{{background-400}}\"}md-slider.md-THEME_NAME-theme[disabled][readonly] .md-sign:after{border-top-color:\"{{background-400}}\"}md-slider.md-THEME_NAME-theme[disabled][readonly][md-vertical] .md-sign:after{border-top-color:transparent;border-left-color:\"{{background-400}}\"}md-slider.md-THEME_NAME-theme[disabled][readonly] .md-disabled-thumb{border-color:transparent;background-color:transparent}md-slider-container[disabled]>:first-child:not(md-slider),md-slider-container[disabled]>:last-child:not(md-slider){color:\"{{foreground-3}}\"}.md-subheader.md-THEME_NAME-theme{color:\"{{ foreground-2-0.23 }}\";background-color:\"{{background-default}}\"}.md-subheader.md-THEME_NAME-theme.md-primary{color:\"{{primary-color}}\"}.md-subheader.md-THEME_NAME-theme.md-accent{color:\"{{accent-color}}\"}.md-subheader.md-THEME_NAME-theme.md-warn{color:\"{{warn-color}}\"}md-switch.md-THEME_NAME-theme .md-ink-ripple{color:\"{{background-500}}\"}md-switch.md-THEME_NAME-theme .md-thumb{background-color:\"{{background-50}}\"}md-switch.md-THEME_NAME-theme .md-bar{background-color:\"{{background-500}}\"}md-switch.md-THEME_NAME-theme.md-checked .md-ink-ripple{color:\"{{accent-color}}\"}md-switch.md-THEME_NAME-theme.md-checked .md-thumb{background-color:\"{{accent-color}}\"}md-switch.md-THEME_NAME-theme.md-checked .md-bar{background-color:\"{{accent-color-0.5}}\"}md-switch.md-THEME_NAME-theme.md-checked.md-focused .md-thumb:before{background-color:\"{{accent-color-0.26}}\"}md-switch.md-THEME_NAME-theme.md-checked.md-primary .md-ink-ripple{color:\"{{primary-color}}\"}md-switch.md-THEME_NAME-theme.md-checked.md-primary .md-thumb{background-color:\"{{primary-color}}\"}md-switch.md-THEME_NAME-theme.md-checked.md-primary .md-bar{background-color:\"{{primary-color-0.5}}\"}md-switch.md-THEME_NAME-theme.md-checked.md-primary.md-focused .md-thumb:before{background-color:\"{{primary-color-0.26}}\"}md-switch.md-THEME_NAME-theme.md-checked.md-warn .md-ink-ripple{color:\"{{warn-color}}\"}md-switch.md-THEME_NAME-theme.md-checked.md-warn .md-thumb{background-color:\"{{warn-color}}\"}md-switch.md-THEME_NAME-theme.md-checked.md-warn .md-bar{background-color:\"{{warn-color-0.5}}\"}md-switch.md-THEME_NAME-theme.md-checked.md-warn.md-focused .md-thumb:before{background-color:\"{{warn-color-0.26}}\"}md-switch.md-THEME_NAME-theme[disabled] .md-thumb{background-color:\"{{background-400}}\"}md-switch.md-THEME_NAME-theme[disabled] .md-bar{background-color:\"{{foreground-4}}\"}md-tabs.md-THEME_NAME-theme md-tabs-wrapper{background-color:transparent;border-color:\"{{foreground-4}}\"}md-tabs.md-THEME_NAME-theme .md-paginator md-icon{color:\"{{primary-color}}\"}md-tabs.md-THEME_NAME-theme md-ink-bar{color:\"{{accent-color}}\";background:\"{{accent-color}}\"}md-tabs.md-THEME_NAME-theme .md-tab{color:\"{{foreground-2}}\"}md-tabs.md-THEME_NAME-theme .md-tab[disabled],md-tabs.md-THEME_NAME-theme .md-tab[disabled] md-icon{color:\"{{foreground-3}}\"}md-tabs.md-THEME_NAME-theme .md-tab.md-active,md-tabs.md-THEME_NAME-theme .md-tab.md-active md-icon,md-tabs.md-THEME_NAME-theme .md-tab.md-focused,md-tabs.md-THEME_NAME-theme .md-tab.md-focused md-icon{color:\"{{primary-color}}\"}md-tabs.md-THEME_NAME-theme .md-tab.md-focused{background:\"{{primary-color-0.1}}\"}md-tabs.md-THEME_NAME-theme .md-tab .md-ripple-container{color:\"{{accent-A100}}\"}md-tabs.md-THEME_NAME-theme.md-accent>md-tabs-wrapper{background-color:\"{{accent-color}}\"}md-tabs.md-THEME_NAME-theme.md-accent>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]),md-tabs.md-THEME_NAME-theme.md-accent>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]) md-icon{color:\"{{accent-A100}}\"}md-tabs.md-THEME_NAME-theme.md-accent>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-active,md-tabs.md-THEME_NAME-theme.md-accent>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-active md-icon,md-tabs.md-THEME_NAME-theme.md-accent>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-focused,md-tabs.md-THEME_NAME-theme.md-accent>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-focused md-icon{color:\"{{accent-contrast}}\"}md-tabs.md-THEME_NAME-theme.md-accent>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-focused{background:\"{{accent-contrast-0.1}}\"}md-tabs.md-THEME_NAME-theme.md-accent>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-ink-bar{color:\"{{primary-600-1}}\";background:\"{{primary-600-1}}\"}md-tabs.md-THEME_NAME-theme.md-primary>md-tabs-wrapper{background-color:\"{{primary-color}}\"}md-tabs.md-THEME_NAME-theme.md-primary>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]),md-tabs.md-THEME_NAME-theme.md-primary>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]) md-icon{color:\"{{primary-100}}\"}md-tabs.md-THEME_NAME-theme.md-primary>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-active,md-tabs.md-THEME_NAME-theme.md-primary>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-active md-icon,md-tabs.md-THEME_NAME-theme.md-primary>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-focused,md-tabs.md-THEME_NAME-theme.md-primary>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-focused md-icon{color:\"{{primary-contrast}}\"}md-tabs.md-THEME_NAME-theme.md-primary>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-focused{background:\"{{primary-contrast-0.1}}\"}md-tabs.md-THEME_NAME-theme.md-warn>md-tabs-wrapper{background-color:\"{{warn-color}}\"}md-tabs.md-THEME_NAME-theme.md-warn>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]),md-tabs.md-THEME_NAME-theme.md-warn>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]) md-icon{color:\"{{warn-100}}\"}md-tabs.md-THEME_NAME-theme.md-warn>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-active,md-tabs.md-THEME_NAME-theme.md-warn>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-active md-icon,md-tabs.md-THEME_NAME-theme.md-warn>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-focused,md-tabs.md-THEME_NAME-theme.md-warn>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-focused md-icon{color:\"{{warn-contrast}}\"}md-tabs.md-THEME_NAME-theme.md-warn>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-focused{background:\"{{warn-contrast-0.1}}\"}md-toolbar>md-tabs.md-THEME_NAME-theme>md-tabs-wrapper{background-color:\"{{primary-color}}\"}md-toolbar>md-tabs.md-THEME_NAME-theme>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]),md-toolbar>md-tabs.md-THEME_NAME-theme>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]) md-icon{color:\"{{primary-100}}\"}md-toolbar>md-tabs.md-THEME_NAME-theme>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-active,md-toolbar>md-tabs.md-THEME_NAME-theme>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-active md-icon,md-toolbar>md-tabs.md-THEME_NAME-theme>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-focused,md-toolbar>md-tabs.md-THEME_NAME-theme>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-focused md-icon{color:\"{{primary-contrast}}\"}md-toolbar>md-tabs.md-THEME_NAME-theme>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-focused{background:\"{{primary-contrast-0.1}}\"}md-toolbar.md-accent>md-tabs.md-THEME_NAME-theme>md-tabs-wrapper{background-color:\"{{accent-color}}\"}md-toolbar.md-accent>md-tabs.md-THEME_NAME-theme>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]),md-toolbar.md-accent>md-tabs.md-THEME_NAME-theme>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]) md-icon{color:\"{{accent-A100}}\"}md-toolbar.md-accent>md-tabs.md-THEME_NAME-theme>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-active,md-toolbar.md-accent>md-tabs.md-THEME_NAME-theme>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-active md-icon,md-toolbar.md-accent>md-tabs.md-THEME_NAME-theme>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-focused,md-toolbar.md-accent>md-tabs.md-THEME_NAME-theme>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-focused md-icon{color:\"{{accent-contrast}}\"}md-toolbar.md-accent>md-tabs.md-THEME_NAME-theme>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-focused{background:\"{{accent-contrast-0.1}}\"}md-toolbar.md-accent>md-tabs.md-THEME_NAME-theme>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-ink-bar{color:\"{{primary-600-1}}\";background:\"{{primary-600-1}}\"}md-toolbar.md-warn>md-tabs.md-THEME_NAME-theme>md-tabs-wrapper{background-color:\"{{warn-color}}\"}md-toolbar.md-warn>md-tabs.md-THEME_NAME-theme>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]),md-toolbar.md-warn>md-tabs.md-THEME_NAME-theme>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]) md-icon{color:\"{{warn-100}}\"}md-toolbar.md-warn>md-tabs.md-THEME_NAME-theme>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-active,md-toolbar.md-warn>md-tabs.md-THEME_NAME-theme>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-active md-icon,md-toolbar.md-warn>md-tabs.md-THEME_NAME-theme>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-focused,md-toolbar.md-warn>md-tabs.md-THEME_NAME-theme>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-focused md-icon{color:\"{{warn-contrast}}\"}md-toolbar.md-warn>md-tabs.md-THEME_NAME-theme>md-tabs-wrapper>md-tabs-canvas>md-pagination-wrapper>md-tab-item:not([disabled]).md-focused{background:\"{{warn-contrast-0.1}}\"}md-toast.md-THEME_NAME-theme .md-toast-content{background-color:#323232;color:\"{{background-50}}\"}md-toast.md-THEME_NAME-theme .md-toast-content .md-button{color:\"{{background-50}}\"}md-toast.md-THEME_NAME-theme .md-toast-content .md-button.md-highlight{color:\"{{accent-color}}\"}md-toast.md-THEME_NAME-theme .md-toast-content .md-button.md-highlight.md-primary{color:\"{{primary-color}}\"}md-toast.md-THEME_NAME-theme .md-toast-content .md-button.md-highlight.md-warn{color:\"{{warn-color}}\"}md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar){background-color:\"{{primary-color}}\";color:\"{{primary-contrast}}\"}md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar) md-icon{color:\"{{primary-contrast}}\";fill:\"{{primary-contrast}}\"}md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar) .md-button[disabled] md-icon{color:\"{{primary-contrast-0.26}}\";fill:\"{{primary-contrast-0.26}}\"}md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar).md-accent{background-color:\"{{accent-color}}\";color:\"{{accent-contrast}}\"}md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar).md-accent .md-ink-ripple{color:\"{{accent-contrast}}\"}md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar).md-accent md-icon{color:\"{{accent-contrast}}\";fill:\"{{accent-contrast}}\"}md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar).md-accent .md-button[disabled] md-icon{color:\"{{accent-contrast-0.26}}\";fill:\"{{accent-contrast-0.26}}\"}md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar).md-warn{background-color:\"{{warn-color}}\";color:\"{{warn-contrast}}\"}.md-panel.md-tooltip.md-THEME_NAME-theme{color:\"{{background-700-contrast}}\";background-color:\"{{background-700}}\"}body.md-THEME_NAME-theme,html.md-THEME_NAME-theme{color:\"{{foreground-1}}\";background-color:\"{{background-color}}\"}"
).provider(
    '$mdTheming',
    ['$mdColorPalette', '$$mdMetaProvider', ThemingProvider]
).directive(
    'mdTheme',
    ["$mdTheming", "$interpolate", "$parse", "$mdUtil", "$q", "$log", ThemingDirective]
).directive(
    'mdThemable',
    ['$mdTheming', ThemableDirective]
).directive(
    'mdThemesDisabled',
    disableThemesDirective
).directive(
    'mdThemeWatch',
    angular.restrictADir
).config(
    ['$mdThemingProvider', MdThemeConfigure]
).run(
    ['$injector', '$mdTheming', generateAllThemes]
);
