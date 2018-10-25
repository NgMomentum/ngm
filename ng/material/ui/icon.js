
/**
 * @ngdoc module
 * @name material.components.icon
 * @description
 * Icon
 */

/*global
    msos: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.icon");
msos.require("ng.material.core.theming");
msos.require("ng.material.ui.aria");

ng.material.ui.icon.version = new msos.set_version(18, 7, 26);

ng.material.ui.icon.config = {
    defaultViewBoxSize: 24,
    defaultFontSet: 'material-icons',
    fontSets: []
};


function MdIconService(config, $templateRequest, $q, $log, $mdUtil, $sce) {
	"use strict";

	var iconCache = {},
		svgCache = {},
		urlRegex = /[-\w@:%+.~#?&//=]{2,}\.[a-z]{2,4}\b(\/[-\w@:%+.~#?&//=]*)?/i,
		dataUrlRegex = /^data:image\/svg\+xml[\s*;\w\-=]*?(base64)?,(.*)$/i,
		is_config = ng.material.ui.icon.config;

	function Icon(el, ic_config) {
		var viewbox;

		if (el && el.tagName.toLowerCase() === 'symbol') {
			viewbox = el.getAttribute('viewBox');
			el = angular.element('<svg xmlns="http://www.w3.org/2000/svg">').html(el.innerHTML)[0];
			if (viewbox) { el.setAttribute('viewBox', viewbox); }
		}

		if (el && el.tagName.toLowerCase() !== 'svg') {
			el = angular.element('<svg xmlns="http://www.w3.org/2000/svg">').append(el.cloneNode(true))[0];
		}

		// Inject the namespace if not available...
		if (!el.getAttribute('xmlns')) {
			el.setAttribute('xmlns', "http://www.w3.org/2000/svg");
		}

		this.element = el;
		this.config = ic_config;
		this.clone = function () { return this.element.cloneNode(true); };
		this.prepare = function () {

			var viewBoxSize = this.config ? this.config.viewBoxSize : is_config.defaultViewBoxSize;

			angular.forEach(
				{
					'fit': '',
					'height': '100%',
					'width': '100%',
					'preserveAspectRatio': 'xMidYMid meet',
					'viewBox': this.element.getAttribute('viewBox') || ('0 0 ' + viewBoxSize + ' ' + viewBoxSize),
					'focusable': false // Disable IE11s default behavior to make SVGs focusable
				},
				function (val, attr) {
					this.element.setAttribute(attr, val);
				},
				this
			);
		};

		this.prepare();
	}
	
	function transformClone(cacheElement) {
		var clone = cacheElement.clone(),
			cacheSuffix = '_cache' + $mdUtil.nextUid();

		if (clone.id) { clone.id += cacheSuffix; }

		angular.forEach(
			clone.querySelectorAll('[id]'),
			function (item) {
				item.id += cacheSuffix;
			}
		);

		return clone;
	}

	function loadByURL(url) {

		function loadByDataUrl(url) {
			var results = dataUrlRegex.exec(url),
				isBase64 = /base64/i.test(url),
				data = isBase64 ? window.atob(results[2]) : results[2];

			return $q.when($q.defer('ng_md_ui_icon_loadByDataUrl_when'), angular.element(data)[0]);
		}

		function loadByHttpUrl(url) {
			return $q(
				function (resolve, reject) {
					// Catch HTTP or generic errors not related to incorrect icon IDs.
					var announceAndReject = function (err) {
							var msg = angular.isString(err) ? err : (err.message || err.data || err.statusText);

							$log.warn(msg);
							reject(err);
						},
						extractSvg = function (response) {
							if (!svgCache[url]) {
								svgCache[url] = angular.element('<div>').append(response)[0].querySelector('svg');
							}
							resolve(svgCache[url]);
						};

					$templateRequest(url, true).then(extractSvg, announceAndReject);
				},
				'ng_md_ui_icon_loadByHttpUrl'
			);
		}

		return dataUrlRegex.test(url) ? loadByDataUrl(url) : loadByHttpUrl(url);
	}

	function loadByID(id) {
		var iconConfig = is_config[id];

		return loadByURL(iconConfig.url).then(
			function (icon) {
				return new Icon(icon, iconConfig);
			}
		);
	}

	function isIcon(target) {
		return angular.isDefined(target.element) && angular.isDefined(target.config);
	}

	function cacheIcon(id) {

		return function updateCache(icon) {

			iconCache[id] = isIcon(icon) ? icon : new Icon(icon, is_config[id]);

			return iconCache[id].clone();
		};
	}

	function loadFromIconSet(id) {
		var setName = id.substring(0, id.lastIndexOf(':')) || '$default',
			iconSetConfig = is_config[setName];

		function announceIdNotFound(id) {
			var msg = 'icon ' + id + ' not found';

			$log.warn(msg);

			return $q.reject($q.defer('ng_material_ui_icon_loadFromIconSet_reject'), msg || id);
		}

		function extractFromSet(set) {
			var iconName = id.slice(id.lastIndexOf(':') + 1),
				icon = set.querySelector('#' + iconName);

			return icon ? new Icon(icon, iconSetConfig) : announceIdNotFound(id);
		}

		return !iconSetConfig ? announceIdNotFound(id) : loadByURL(iconSetConfig.url).then(extractFromSet);
	}

	function getIcon(id) {

		id = id || '';

		if (!_.isString(id)) {
			id = $sce.getTrustedUrl(id);
		}

		if (iconCache[id]) {
			return $q.when($q.defer('ng_md_ui_icon_getIcon_when'), transformClone(iconCache[id]));
		}

		if (urlRegex.test(id) || dataUrlRegex.test(id)) {
			return loadByURL(id).then(cacheIcon(id));
		}

		if (id.indexOf(':') === -1) {
			id = '$default:' + id;
		}

		var load = is_config[id] ? loadByID : loadFromIconSet;

		return load(id).then(cacheIcon(id));
	}

	function findRegisteredFontSet(alias) {
		var useDefault = _.isUndefined(alias) || !(alias && alias.length),
			result;

		if (useDefault) { return is_config.defaultFontSet; }

		result = alias;

		angular.forEach(is_config.fontSets, function (it) {
			if (it.alias === alias) { result = it.fontSet || result; }
		});

		return result;
	}

	getIcon.fontSet = findRegisteredFontSet;

	// Publish service...
	return getIcon;
}

function MdIconProvider() {
	"use strict";

	msos.console.debug('ng.material.ui.icon - MdIconProvider -> called.');
}

function ConfigurationItem(url, viewBoxSize) {
	"use strict";

    this.url = url;
    this.viewBoxSize = viewBoxSize || ng.material.ui.icon.config.defaultViewBoxSize;
}

MdIconProvider.prototype = {
    icon: function (id, url, viewBoxSize) {
		"use strict";

        if (id.indexOf(':') === -1) { id = '$default:' + id; }

        ng.material.ui.icon.config[id] = new ConfigurationItem(url, viewBoxSize);

        return this;
    },
    iconSet: function (id, url, viewBoxSize) {
		"use strict";

        ng.material.ui.icon.config[id] = new ConfigurationItem(url, viewBoxSize);
        return this;
    },
    defaultIconSet: function (url, viewBoxSize) {
		"use strict";

        var setName = '$default',
			di_config = ng.material.ui.icon.config;

        if (!di_config[setName]) {
            di_config[setName] = new ConfigurationItem(url, viewBoxSize);
        }

        di_config[setName].viewBoxSize = viewBoxSize || di_config.defaultViewBoxSize;

        return this;
    },
    defaultViewBoxSize: function (viewBoxSize) {
		"use strict";

        ng.material.ui.icon.config.defaultViewBoxSize = viewBoxSize;

        return this;
    },
    fontSet: function fontSet(alias, className) {
		"use strict";

        ng.material.ui.icon.config.fontSets.push({
            alias: alias,
            fontSet: className || alias
        });

        return this;
    },
    defaultFontSet: function defaultFontSet(className) {
		"use strict";

        ng.material.ui.icon.config.defaultFontSet = !className ? '' : className;

        return this;
    },
    defaultIconSize: function defaultIconSize(iconSize) {
		"use strict";

        ng.material.ui.icon.config.defaultIconSize = iconSize;

        return this;
    },
    $get: ['$templateRequest', '$q', '$log', '$mdUtil', '$sce', function ($templateRequest, $q, $log, $mdUtil, $sce) {
		"use strict";

		return MdIconService(ng.material.ui.icon.config, $templateRequest, $q, $log, $mdUtil, $sce);
    }]
};


function mdIconDirective($mdIcon, $mdTheming, $mdAria) {
	"use strict";

    function postLink(scope_na, element, attr) {

        $mdTheming(element);

        var lastFontIcon = attr.mdFontIcon,
			lastFontSet = $mdIcon.fontSet(attr.mdFontSet),
			originalSvgSrc,
			iconName,
			svgName = '',
			attrName = '';

        function prepareForFontIcon() {
            if (!attr.mdSvgIcon && !attr.mdSvgSrc) {
                if (attr.mdFontIcon) {
                    element.addClass('md-font ' + attr.mdFontIcon);
                }
                element.addClass(lastFontSet);
            }
        }

        function fontIconChanged() {
			var fontSet;

            if (!attr.mdSvgIcon && !attr.mdSvgSrc) {

                if (attr.mdFontIcon) {
                    element.removeClass(lastFontIcon);
                    element.addClass(attr.mdFontIcon);

                    lastFontIcon = attr.mdFontIcon;
                }

                fontSet = $mdIcon.fontSet(attr.mdFontSet);

                if (lastFontSet !== fontSet) {
                    element.removeClass(lastFontSet);
                    element.addClass(fontSet);

                    lastFontSet = fontSet;
                }
            }
        }

        prepareForFontIcon();

        attr.$observe('mdFontIcon',	fontIconChanged);
        attr.$observe('mdFontSet',	fontIconChanged);

        originalSvgSrc = element[0].getAttribute(attr.$attr.mdSvgSrc);
		svgName = attr.$attr.mdSvgIcon || attr.$attr.mdSvgSrc || '';

		if (svgName) {
			// undefined throughs an unnecessary error
			attrName = attr.$normalize(svgName);
		}

		if (!attr.role) {
			$mdAria.expect(element, 'role', 'img');
			attr.role = 'img';
		}

		if ( attr.role === "img" && !attr.ariaHidden && !$mdAria.hasAriaLabel(element) ) {
			if (attr.alt) {
				$mdAria.expect(element, 'aria-label', attr.alt);
			} else if ($mdAria.parentHasAriaLabel(element, 2)) {
				$mdAria.expect(element, 'aria-hidden', 'true');
			} else if (attr.mdFontIcon || attr.mdSvgIcon || element.text()) {
				iconName = attr.mdFontIcon || attr.mdSvgIcon || element.text();
				$mdAria.expect(element, 'aria-label', iconName);
			} else {
				$mdAria.expect(element, 'aria-hidden', 'true');
			}
		}

		if (attrName) {
			// Use either pre-configured SVG or URL source, respectively.
			attr.$observe(
				attrName,
				function (attrVal) {
					element.empty();

					if (attrVal) {
						$mdIcon(attrVal).then(
							function (svg) {
								element.empty();
								element.append(svg);
							}
						);
					}
				}
			);
		}
    }

    return {
        restrict: 'E',
        link: postLink
    };
}


angular.module(
	'ng.material.ui.icon',
	[
		'ng',
		'ng.material.core',
		'ng.material.core.theming',
		'ng.material.ui.aria'
	]
).constant(
	'$$mdSvgRegistry',
	{
        'mdTabsArrow': 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxnPjxwb2x5Z29uIHBvaW50cz0iMTUuNCw3LjQgMTQsNiA4LDEyIDE0LDE4IDE1LjQsMTYuNiAxMC44LDEyICIvPjwvZz48L3N2Zz4=',
        'mdClose': 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxnPjxwYXRoIGQ9Ik0xOSA2LjQxbC0xLjQxLTEuNDEtNS41OSA1LjU5LTUuNTktNS41OS0xLjQxIDEuNDEgNS41OSA1LjU5LTUuNTkgNS41OSAxLjQxIDEuNDEgNS41OS01LjU5IDUuNTkgNS41OSAxLjQxLTEuNDEtNS41OS01LjU5eiIvPjwvZz48L3N2Zz4=',
        'mdCancel': 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxnPjxwYXRoIGQ9Ik0xMiAyYy01LjUzIDAtMTAgNC40Ny0xMCAxMHM0LjQ3IDEwIDEwIDEwIDEwLTQuNDcgMTAtMTAtNC40Ny0xMC0xMC0xMHptNSAxMy41OWwtMS40MSAxLjQxLTMuNTktMy41OS0zLjU5IDMuNTktMS40MS0xLjQxIDMuNTktMy41OS0zLjU5LTMuNTkgMS40MS0xLjQxIDMuNTkgMy41OSAzLjU5LTMuNTkgMS40MSAxLjQxLTMuNTkgMy41OSAzLjU5IDMuNTl6Ii8+PC9nPjwvc3ZnPg==',
        'mdMenu': 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGQ9Ik0zLDZIMjFWOEgzVjZNMywxMUgyMVYxM0gzVjExTTMsMTZIMjFWMThIM1YxNloiIC8+PC9zdmc+',
        'mdToggleArrow': 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgNDggNDgiPjxwYXRoIGQ9Ik0yNCAxNmwtMTIgMTIgMi44MyAyLjgzIDkuMTctOS4xNyA5LjE3IDkuMTcgMi44My0yLjgzeiIvPjxwYXRoIGQ9Ik0wIDBoNDh2NDhoLTQ4eiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==',
        'mdCalendar': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTkgM2gtMVYxaC0ydjJIOFYxSDZ2Mkg1Yy0xLjExIDAtMS45OS45LTEuOTkgMkwzIDE5YzAgMS4xLjg5IDIgMiAyaDE0YzEuMSAwIDItLjkgMi0yVjVjMC0xLjEtLjktMi0yLTJ6bTAgMTZINVY4aDE0djExek03IDEwaDV2NUg3eiIvPjwvc3ZnPg==',
        'mdChecked': 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxnPjxwYXRoIGQ9Ik05IDE2LjE3TDQuODMgMTJsLTEuNDIgMS40MUw5IDE5IDIxIDdsLTEuNDEtMS40MXoiLz48L2c+PC9zdmc+'
    }
).provider(
	'$mdIcon',
	MdIconProvider
).directive(
	'mdIcon',
	['$mdIcon', '$mdTheming', '$mdAria', mdIconDirective]
).directive(
    'mdFontIcon',
    angular.restrictADir
).directive(
    'mdSvgSrc',
    angular.restrictADir
).directive(
    'mdSvgIcon',
    angular.restrictADir
);
