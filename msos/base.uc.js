// Copyright Notice:
//					base.js
//			Copyright©2012-2017 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensitemobile.com
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com

/*
	OpenSiteMobile MobileSiteOS base object file.
	Use as the installation base for all your MobileSiteOS web apps.

	This file includes: Underscore.js, Modernizr.js, Purl.js, Verge.js, Basil.js
*/

/*global
    msos: true,
    Modernizr: true,
    _: true
*/

if (console && console.info) { console.info('msos/base -> start.'); }

// --------------------------
// Our Global Object
// --------------------------
var msos = {

	// *******************************************
    // Edit these key/value pairs on initial setup
	// *******************************************

    // Edit msos.default_locale (to be your native or typical user language) using one of the
    // codes in 'msos.config.i18n.select_trans_msos'. This must correspond to the language used
    // for the files in the 'ROOT' of the '/msos/nls' folder (those used as default, which are currently 'en').
    default_locale: (document.getElementsByTagName('html')[0].getAttribute('lang') || 'en'),

	// Edit msos.default_translate to be your preferred initial 'translate to' language for
	// '/demo/msos_translate.html'.
	default_translate: 'fr',

    // Edit msos.default_country to be the country codes most likely used by your user's, based on browser
    // language locale code (note: use underscores for '-' in object item name). See 'msos.countrystate.country'
    // for ref. to available two-letter country codes for value.
    default_country: {
        en: 'US',
        fr: 'FR',
        de: 'DE'
    },

	// Edit msos.default_keyboard_locales to be the most utilized language (locale) by your user's.
	// Order is relative to there display. These codes are base on the available codes found in
	// msos.config.i18n.select_kbrds_msos
	default_keyboard_locales: [
		'en', 'fr', 'de', 'es'
	],

	// *******************************************
    // *** Do NOT edit the key/value pairs below ***
	// *******************************************

    base_site_url: document.domain ? '//' + document.domain : '',
	base_script_url: document.currentScript && document.currentScript.src ? document.currentScript.src : '',
	base_msos_folder: '',
	base_config_url: '',
	base_images_url: '',

    body: null,
    head: null,
    html: null,
    docl: null,

	ajax_loading_kbps: {},

	deferred_css: [],
	deferred_scripts: [],

	dom: {},

    form_inputs: null,
    form_validate: null,
    html_inputs: ['text', 'file', 'password', 'textarea', 'radio', 'checkbox', 'select'],
    html5_attributes: [
		// All possible HTML5 form input attributes
		'autocomplete', 'autofocus', 'list', 'placeholder', 'max', 'min', 'maxlength', 'multiple', 'pattern', 'required', 'step'
	],
    html5_inputs: [
		// All possible HTML5 input fields
		'search', 'tel', 'url', 'email', 'datetime', 'date', 'month', 'week', 'time', 'datetime-local', 'number', 'range', 'color'
	],

    i18n_order: [],
    i18n_queue: 0,

	log_methods: ['error', 'warn', 'info', 'debug', 'time', 'timeEnd', 'log', 'assert', 'dir', 'clear', 'profile', 'profileEnd', 'trace'],

	onload_func_pre:	[],
    onload_func_start:	[],
    onload_functions:	[],
    onload_func_done:	[],
	onload_func_post:	[],

	ondisplay_size_change: [],

	onorientationchange_functions: [],
    onresize_functions: [],

	pending_file_loads: [],
    record_times: {},

    registered_files: {
        js: {},
        css: {},
        ico: {},
		ajax: {}
    },
    registered_folders: {
        msos: '',
        jquery: '',
        apps: ''
    },
    registered_modules: {
        msos: false
    },
    registered_templates: {},
    registered_tools: {},
    require_attempts: 0,
	require_deferred: 0,
    require_queue: 0
};

(function () {
	"use strict";

	var reg_msos = new RegExp('mobilesiteos'),
		reg_ngm = new RegExp('ngm');

	msos.base_script_url = msos.base_script_url.slice(0, msos.base_script_url.lastIndexOf('/') + 1) || '';

	if (!msos.base_site_url)	{ throw new Error('msos.base_site_url must be set manually.'); }
	if (!msos.base_script_url)	{ throw new Error('msos.base_script_url must be set manually.'); }

	if (reg_msos.test(msos.base_script_url)) { msos.base_msos_folder = 'mobilesiteos'; }
	if ( reg_ngm.test(msos.base_script_url)) { msos.base_msos_folder = 'ngm'; }

	if (!msos.base_msos_folder)	{ throw new Error('msos.base_msos_folder must be set manually.');}

	if (console && console.info) {
		console.info('msos/base -> settings,\n     msos.base_site_url: ' + msos.base_site_url + ',\n     msos.base_script_url: ' + msos.base_script_url + ',\n     msos.base_msos_folder: ' + msos.base_msos_folder);
	}
}());

// *******************************************
// Base Configuration Settings
// Edit as deisired for all apps
// *******************************************

msos.config = {
	// Ref. -> set app specifics in '/js/config.js' file
    console: false,
	clear_storage: false,
    debug: false,
	debug_css: false,
	debug_output: false,
	debug_script: false,
	debug_disable: false,
    mobile: false,
	verbose: false,
	visualevent: false,

    run_ads: false,
	run_size: false,
	run_analytics: false,
    run_onerror: false,
	run_overflowscroll: false,
    run_social: false,
	run_translate: false,
	run_amazon_prev: false,

    browser: {
		ok: false,
        advanced: false,
        current: false,
        direction: '',
        editable: false,
        mobile: false,
        touch: false,
		nativeoverflow: false,
		fastclick: false,
		scalable: false
    },

    // jQuery.ajax, 'cache' required scripts/templates (static files), false for testing
    cache: true,

    // Editable display or resource variables
    color: {
        bk: 'black',
        wh: 'white',
        dg: 'darkgrey',
        lg: 'lightgrey',
        sl: 'salmon',
        lb: 'lightblue',
        rd: 'red',
        be: 'beige'
    },

	connection: {
		type: 0,
		bandwidth: 10,
		metered: false
	},

    storage: {
		// These are specific storage identifier names
        site_pref: { name: 'msos_site_pref', value: '', set: false },		// Site Preferences -> core.uc.js & core.min.js
        site_i18n: { name: 'msos_site_i18n', value: '', set: false },		// i18n -> msos.i18n & msos.intl
		site_cltl: { name: 'msos_site_cltl', value: '', set: false },		// Colortool -> msos.colortool.calc
		site_bdwd: { name: 'msos_site_bdwd', value: '', set: false },		// Bandwidth -> core.uc.js & core.min.js
		site_ajax: { name: 'msos_site_ajax', value: '', set: false },		// Ajax load times object -> core.uc.js & core.min.js 

		// These are base names
		site_tabs: { name: 'msos_site_tab_'  },		// Tabs -> msos.tab
		site_sdmn: { name: 'msos_site_sdm_'  },		// Slashdot Menu -> msos.sdmenu.js
		site_popu: { name: 'msos_site_pop_'  }		// Popup Div's -> msos.popdiv
    },

	// All the T/F toggles used for debugging (see msos.debugform)
	debugging: [
		'console',
		'debug', 'debug_script', 'debug_css', 'debug_output',
		'mobile', 'verbose', 'visualevent',
		'run_ads', 'run_size', 'run_analytics', 'run_onerror',
		'run_overflowscroll', 'run_social', 'run_translate', 'run_amazon_prev',
		'use_date', 'use_color', 'use_number', 'use_range',
		'clear_storage'
	],

    // Default settings and tests
    doctype: window.document.getElementsByTagName('html')[0].getAttribute('xmlns') ? 'xhtml5' : 'html5',

    file: {
        'file': (typeof window.File === "object" ? true : false),
        'reader': (typeof window.FileReader === "function" ? true : false),
        'list': (typeof window.FileList === "object" ? true : false),
        'blob': (typeof window.Blob === "object" ? true : false)
    },

    // Force the use of MSOS HTML5 shim widgets?
	force_shim: {
		inputs: {
			date: true,
			color: true,
			number: true,
			range: true,
			time: false,
			month: false,
			week: false
		},
		media: {
			// Future
			video: false,
			audio: false
		}
	},

	google: {
		no_translate: {},
		hide_tooltip: {},
		maps_api_key: ''
	},

	// Set full url in config.js file
	hellojs_redirect: '/' + msos.base_msos_folder + '/hello/redirect.html',

    // See 'msos.i18n' and the 'MSOS Available Language Matrix' for ref.
    i18n: {
        select_trans_msos: {},
        select_kbrds_msos: {}
    },

    // See 'msos.intl' for ref.
    intl: {
        select_culture: {},
        select_calendar: {}
    },

    // i18n Internationalization config and object definitions
     locale: (navigator.language || navigator.userLanguage || msos.default_locale).replace('-', '_').toLowerCase(),
    culture: (navigator.language || navigator.userLanguage || msos.default_locale).replace('-', '_').toLowerCase(),
    calendar: 'standard',

    json: (typeof JSON === 'object' && typeof JSON.stringify === 'function' && typeof JSON.parse === 'function' ? true : false),

    jquery_ui_theme: 'mobilesiteos',
    jquery_ui_avail: {
        base: 'Base (generic)',
        lightness: 'UI-Lightness',
		mobilesiteos: 'MobileSiteOS'
    },

	keyboard: '',
	keyboard_locales: [].concat(msos.default_keyboard_locales),

    gesture: (function () {
        "use strict";
        var el = document.createElement('div');
        el.setAttribute('ongesturestart', 'return;');
        return (typeof el.ongesturestart === 'function' ? true : false);
    }()),

	onerror_uri: msos.base_site_url + '/' + msos.base_msos_folder + '/onerror.html',

	orientation: (typeof window.orientation === 'number' ? true : false),
    orientation_change: ('onorientationchange' in window ? true : false),

	overflow_scrolling: {
		webkitoverflowscrolling: ('WebkitOverflowScrolling' in document.documentElement.style ? true : false),
		msoverflowstyle: ('msOverflowStyle' in document.documentElement.style ? true : false)
	},

	page_uri: window.location.href,

    pixel_ratio: window.devicePixelRatio || 1,

    popups_blocked: false,

	query: {},

    script_onerror: (function () {
        "use strict";
        var spt = document.createElement('script');
			spt.type = 'text/javascript';
			spt.setAttribute('onerror', "return;");
        if (typeof spt.onerror === 'function') {
            return true;
        }
        return ('onerror' in spt ? true : false);
    }()),

	script_preload: {
		available: false,
		async: false,
		defer: false,
		explicit: false,
		ordered: false,
		xhr_cache: false
	},

    scrolltop: (window.pageXOffset !== undefined || document.documentElement.scrollTop !== undefined ? true : false),

	size: '',
	size_folder: 'css',
	size_array: [],
    size_wide: {		// Note: these keys are the names used to call sizing CSS
		'desktop': 1080,
        'large': 960,
        'medium': 760,
        'small': 640,
        'tablet': 480,
        'phone': 320
    },

	social: {},

    touch: {
        ontouchstart: ('ontouchstart' in window ? true : false),
        ontouchend: ('ontouchend' in document ? true : false),
		ontouchmove: ('ontouchmove' in document ? true : false),
        object: (typeof window.Touch === "object" ? true : false),
        event: (window.TouchEvent !== undefined ? true : false),
        create: ('createTouch' in document ? true : false),
		doc_touch: ('DocumentTouch' in window && document instanceof DocumentTouch ? true : false)
    },

    view_orientation: {
        layout: '',
        direction: '',
        method: '',
        numeric: 0
    },

    view_port: {
        height: 0,
        width: 0,
        delta_width: 0,
        delta_heigth: 0
    }
};


/*
 * Purl (A JavaScript URL parser) v2.3.1
 * Developed and maintanined by Mark Perkins, mark@allmarkedup.com
 * Source repository: https://github.com/allmarkedup/jQuery-URL-Parser
 */

(function (_global) {
	"use strict";

    var tag2attr = {
            a       : 'href',
            img     : 'src',
            form    : 'action',
            base    : 'href',
            script  : 'src',
            iframe  : 'src',
            link    : 'href',
            embed   : 'src',
            object  : 'data'
        },

        key = ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'fragment'], // keys available to query

        aliases = { 'anchor' : 'fragment' }, // aliases for backwards compatability

        parser = {
            strict : /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,  //less intuitive, more accurate to the specs
            loose :  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/ // more intuitive, fails on relative paths and deviates from specs
        },

        isint = /^[0-9]+$/;

    function parseUri(url, strictMode) {
        var str = decodeURI( url ),
        res = parser[ strictMode || false ? 'strict' : 'loose' ].exec( str ),
        uri = { attr : {}, param : {}, seg : {} },
        i = 14;

        while (i--) {
            uri.attr[ key[i] ] = res[i] || '';
        }

        // build query and fragment parameters
        uri.param.query = parseString(uri.attr.query);
        uri.param.fragment = parseString(uri.attr.fragment);

        // split path and fragement into segments
        uri.seg.path = uri.attr.path.replace(/^\/+|\/+$/g,'').split('/');
        uri.seg.fragment = uri.attr.fragment.replace(/^\/+|\/+$/g,'').split('/');

        // compile a 'base' domain attribute
        uri.attr.base = uri.attr.host ? (uri.attr.protocol ?  uri.attr.protocol+'://'+uri.attr.host : uri.attr.host) + (uri.attr.port ? ':'+uri.attr.port : '') : '';

        return uri;
    }

    function getAttrName( elm ) {
        var tn = elm.tagName;
        if ( typeof tn !== 'undefined' ) return tag2attr[tn.toLowerCase()];
        return tn;
    }

    function promote(parent, key) {
        if (parent[key].length === 0) {
			parent[key] = {};
			return parent[key];
		}

        var t = {},
			i;

        for (i in parent[key]) {
			if (parent[key].hasOwnProperty(i)) {
				t[i] = parent[key][i];
			}
		}

        parent[key] = t;
        return t;
    }

    function parse(parts, parent, key, val) {
        var part = parts.shift();
        if (!part) {
            if (isArray(parent[key])) {
                parent[key].push(val);
            } else if ('object' == typeof parent[key]) {
                parent[key] = val;
            } else if ('undefined' == typeof parent[key]) {
                parent[key] = val;
            } else {
                parent[key] = [parent[key], val];
            }
        } else {
            var obj = parent[key] = parent[key] || [];
            if (']' == part) {
                if (isArray(obj)) {
                    if ('' !== val) obj.push(val);
                } else if ('object' == typeof obj) {
                    obj[keys(obj).length] = val;
                } else {
                    obj = parent[key] = [parent[key], val];
                }
            } else if (~part.indexOf(']')) {
                part = part.substr(0, part.length - 1);
                if (!isint.test(part) && isArray(obj)) obj = promote(parent, key);
                parse(parts, obj, part, val);
                // key
            } else {
                if (!isint.test(part) && isArray(obj)) obj = promote(parent, key);
                parse(parts, obj, part, val);
            }
        }
    }

    function merge(parent, key, val) {
        if (~key.indexOf(']')) {
            var parts = key.split('[');
            parse(parts, parent, 'base', val);
        } else {
            if (!isint.test(key) && isArray(parent.base)) {
                var t = {},
					k;

                for (k in parent.base) {
					if (parent.base.hasOwnProperty(k)) {
						t[k] = parent.base[k];
					}
				}
                parent.base = t;
            }
            if (key !== '') {
                set(parent.base, key, val);
            }
        }
        return parent;
    }

    function parseString(str) {
        return reduce(String(str).split(/&|;/), function (ret, pair) {
            try {
                pair = decodeURIComponent(pair.replace(/\+/g, ' '));
            } catch(e) {
                // ignore
            }
            var eql = pair.indexOf('='),
                brace = lastBraceInKey(pair),
                key = pair.substr(0, brace || eql),
                val = pair.substr(brace || eql, pair.length);

            val = val.substr(val.indexOf('=') + 1, val.length);

            if (key === '') {
                key = pair;
                val = '';
            }

            return merge(ret, key, val);
        }, { base: {} }).base;
    }

    function set(obj, key, val) {
        var v = obj[key];
        if (typeof v === 'undefined') {
            obj[key] = val;
        } else if (isArray(v)) {
            v.push(val);
        } else {
            obj[key] = [v, val];
        }
    }

    function lastBraceInKey(str) {
        var len = str.length,
            brace,
            c;
        for (var i = 0; i < len; ++i) {
            c = str[i];
            if (']' == c) brace = false;
            if ('[' == c) brace = true;
            if ('=' == c && !brace) return i;
        }
		return undefined;
    }

    function reduce(obj, accumulator){
        var i = 0,
            l = obj.length >> 0,
            curr = arguments[2];
        while (i < l) {
            if (i in obj) curr = accumulator.call(undefined, curr, obj[i], i, obj);
            ++i;
        }
        return curr;
    }

    function isArray(vArg) {
        return Object.prototype.toString.call(vArg) === "[object Array]";
    }

    function keys(obj) {
        var key_array = [];
        for ( var prop in obj ) {
            if ( obj.hasOwnProperty(prop) ) key_array.push(prop);
        }
        return key_array;
    }

    function purl( url, strictMode ) {
        if ( arguments.length === 1 && url === true ) {
            strictMode = true;
            url = undefined;
        }
        strictMode = strictMode || false;
        url = url || window.location.toString();

        return {

            data : parseUri(url, strictMode),

            // get various attributes from the URI
            attr : function ( attr ) {
                attr = aliases[attr] || attr;
                return typeof attr !== 'undefined' ? this.data.attr[attr] : this.data.attr;
            },

            // return query string parameters
            param : function ( param ) {
                return typeof param !== 'undefined' ? this.data.param.query[param] : this.data.param.query;
            },

            // return fragment parameters
            fparam : function ( param ) {
                return typeof param !== 'undefined' ? this.data.param.fragment[param] : this.data.param.fragment;
            },

            // return path segments
            segment : function ( seg ) {
                if ( typeof seg === 'undefined' ) {
                    return this.data.seg.path;
                } else {
                    seg = seg < 0 ? this.data.seg.path.length + seg : seg - 1; // negative segments count from the end
                    return this.data.seg.path[seg];
                }
            },

            // return fragment segments
            fsegment : function ( seg ) {
                if ( typeof seg === 'undefined' ) {
                    return this.data.seg.fragment;
                } else {
                    seg = seg < 0 ? this.data.seg.fragment.length + seg : seg - 1; // negative segments count from the end
                    return this.data.seg.fragment[seg];
                }
            }

        };

    }

	_global.parse_string = parseString;
    _global.purl = purl;

}(msos));


msos.parse_query = function () {
    "use strict";

	var url = msos.purl(),	// Get current page url
		key = '',
        cfg = '',
		result = url.param();

    for (key in result) {
		// only allow std word characters
		if (result.hasOwnProperty(key)) {
			result[key] = result[key].replace(/[^0-9a-zA-Z_]/g, '_');
	
			if (result[key] === 'true')		{ result[key] = true; }
			if (result[key] === 'false')	{ result[key] = false; }
		}
	}

    // Update msos.config if new info passed in by query string
    for (cfg in msos.config) {
		if (msos.config.hasOwnProperty(cfg)) {
			if (result[cfg] || result[cfg] === false) {
				msos.config[cfg] = result[cfg];
			}
		}
    }

	// Verbose output implies debugging too.
	if (msos.config.verbose) { msos.config.debug = true; }

    return result;
};

// Run immediately so inputs are evaluated
msos.config.query = msos.parse_query();


msos.console = (function () {
	"use strict";

	var console_obj = { queue: [] },
		console_win = window.console,
		idx = msos.log_methods.length - 1,
		aps = Array.prototype.slice,
		methods = [
			'assert', 'clear', 'count', 'debug', 'dir', 'dirxml',
			'error', 'exception', 'group', 'groupCollapsed', 'groupEnd',
			'info', 'log', 'markTimeline', 'profile', 'profiles',
			'profileEnd', 'show', 'table', 'time', 'timeEnd', 'timeline',
			'timelineEnd', 'timeStamp', 'trace', 'warn'
		],
		method = methods.pop(),
		console_method_func = function (key) { return function () { console.warn('msos.console -> method: ' + key + ' is na!'); };};

	// Normalize across browsers
    if (!console_win.memory) { console_win.memory = {}; }

    while (method) {
		if (!console_win[method]) { console_win[method] = console_method_func(method); }
		method = methods.pop();
	}

	// From AngularJS
    function formatError(arg) {
		if (arg instanceof Error) {
			if (arg.stack) {
				arg = (arg.message && arg.stack.indexOf(arg.message) === -1) ? 'Error: ' + arg.message + '\n' + arg.stack : arg.stack;
			} else if (arg.sourceURL) {
				arg = arg.message + '\n' + arg.sourceURL + ':' + arg.line;
			}
		}
		return arg;
    }

	function build_console(method) {

		console_obj[method] = function () {

			// Always show errors and warnings
			if (!(method === 'error' || method === 'warn') && !msos.config.debug) {
				return;
			}

			var cfg = msos.config,
				filter = cfg.query.debug_filter || '',
				i = 0,
				args = aps.apply(arguments),
				name = args[0] && typeof args[0] === 'string' ? args[0].replace(/\W/g, '_') : 'missing name or input',
				console_org = console_win[method] || console_win.log,
				log_output = [],
				out_args = [],
				message;

			if (method === 'debug' && cfg.verbose && filter && /^[0-9a-zA-Z.]+$/.test(filter)) {
				filter = new RegExp('^' + filter.replace('.', "\."));
				if (!name.match(filter)) {
					msos.console.warn('msos.console -> no match for debug filter: ' + filter);
					return;
				}
			}

			if (method === 'time' || method === 'timeEnd') {
				msos.record_times[name + '_' + method] = (new Date()).getTime();
			}

			// if msos console output, add this
			if (cfg.console) {

				log_output = [method].concat(args);

				if (method === 'time' || method === 'timeEnd') {
					log_output.push(msos.record_times[name + '_' + method]);
				}

				console_obj.queue.push(log_output);
			}

			// if window console, add it
			if (console_win) {
				if (console_org.apply) {
					for (i = 0; i < args.length; i += 1) {
						out_args.push(formatError(args[i]));
					}
					// Do this for normal browsers
					console_org.apply(console_win, out_args);

				} else {
					// Do this for IE9
					message = args.join(' ');
					console_org(message);
				}
			}
		};
	}

	while (idx >= 0) {
		build_console(msos.log_methods[idx]);
		idx -= 1;
	}

	return console_obj;
}());

msos.console.time('base');
msos.console.debug('msos/base -> msos.console now available.');
msos.console.debug('msos/base -> purl.js now available.');

msos.site_specific = function (settings) {
	"use strict";

	var i = 0,
		ms_db = msos.config.debugging,
		ms_qu = msos.config.query,
		set = '';

	for (i = 0; i < ms_db.length; i += 1) {
		// configuration setting
		set = ms_db[i];

		if (typeof settings[set] === 'boolean') {
			// Set msos.config based on site specific setting
			msos.config[set] = settings[set];
		}
		if (typeof ms_qu[set] === 'boolean') {
			// Or override w/ debugging settings if sent via query string
			msos.config[set] = ms_qu[set];
		}
	}
};


//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function () {

    // Baseline setup
    // --------------

    // Establish the root object, `window` in the browser, or `exports` on the server.
    var root = this;

    // Save the previous value of the `_` variable.
    var previousUnderscore = root._;

    // Save bytes in the minified (but not gzipped) version:
    var ArrayProto = Array.prototype,
        ObjProto = Object.prototype,
        FuncProto = Function.prototype;

    // Create quick reference variables for speed access to core prototypes.
    var
        push = ArrayProto.push,
        slice = ArrayProto.slice,
        toString = ObjProto.toString,
        hasOwnProperty = ObjProto.hasOwnProperty;

    // All **ECMAScript 5** native function implementations that we hope to use
    // are declared here.
    var
        nativeIsArray = Array.isArray,
        nativeKeys = Object.keys,
        nativeBind = FuncProto.bind,
        nativeCreate = Object.create;

    // Naked function reference for surrogate-prototype-swapping.
    var Ctor = function () {};

    // Create a safe reference to the Underscore object for use below.
    var _ = function (obj) {
        if (obj instanceof _) return obj;
        if (!(this instanceof _)) return new _(obj);
        this._wrapped = obj;
    };

    // Export the Underscore object for **Node.js**, with
    // backwards-compatibility for the old `require()` API. If we're in
    // the browser, add `_` as a global object.
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = _;
        }
        exports._ = _;
    } else {
        root._ = _;
    }

    // Current version.
    _.VERSION = '1.8.3';

    // Internal function that returns an efficient (for current engines) version
    // of the passed-in callback, to be repeatedly applied in other Underscore
    // functions.
    var optimizeCb = function (func, context, argCount) {
        if (context === void 0) return func;
        switch (argCount == null ? 3 : argCount) {
            case 1:
                return function (value) {
                    return func.call(context, value);
                };
            case 2:
                return function (value, other) {
                    return func.call(context, value, other);
                };
            case 3:
                return function (value, index, collection) {
                    return func.call(context, value, index, collection);
                };
            case 4:
                return function (accumulator, value, index, collection) {
                    return func.call(context, accumulator, value, index, collection);
                };
        }
        return function () {
            return func.apply(context, arguments);
        };
    };

    var cb = function (value, context, argCount) {
        if (value == null) return _.identity;
        if (_.isFunction(value)) return optimizeCb(value, context, argCount);
        if (_.isObject(value)) return _.matcher(value);
        return _.property(value);
    };
    _.iteratee = function (value, context) {
        return cb(value, context, Infinity);
    };

    // An internal function for creating assigner functions.
    var createAssigner = function (keysFunc, undefinedOnly) {
        return function (obj) {
            var length = arguments.length;
            if (length < 2 || obj == null) return obj;
            for (var index = 1; index < length; index++) {
                var source = arguments[index],
                    keys = keysFunc(source),
                    l = keys.length;
                for (var i = 0; i < l; i++) {
                    var key = keys[i];
                    if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
                }
            }
            return obj;
        };
    };

    // An internal function for creating a new object that inherits from another.
    var baseCreate = function (prototype) {
        if (!_.isObject(prototype)) return {};
        if (nativeCreate) return nativeCreate(prototype);
        Ctor.prototype = prototype;
        var result = new Ctor();
        Ctor.prototype = null;
        return result;
    };

    var property = function (key) {
        return function (obj) {
            return obj == null ? void 0 : obj[key];
        };
    };

    // Helper for collection methods to determine whether a collection
    // should be iterated as an array or as an object
    // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
    // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
    var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
    var getLength = property('length');
    var isArrayLike = function (collection) {
        var length = getLength(collection);
        return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
    };

    // Collection Functions
    // --------------------

    // The cornerstone, an `each` implementation, aka `forEach`.
    // Handles raw objects in addition to array-likes. Treats all
    // sparse array-likes as if they were dense.
    _.each = _.forEach = function (obj, iteratee, context) {
        iteratee = optimizeCb(iteratee, context);
        var i, length;
        if (isArrayLike(obj)) {
            for (i = 0, length = obj.length; i < length; i++) {
                iteratee(obj[i], i, obj);
            }
        } else {
            var keys = _.keys(obj);
            for (i = 0, length = keys.length; i < length; i++) {
                iteratee(obj[keys[i]], keys[i], obj);
            }
        }
        return obj;
    };

    // Return the results of applying the iteratee to each element.
    _.map = _.collect = function (obj, iteratee, context) {
        iteratee = cb(iteratee, context);
        var keys = !isArrayLike(obj) && _.keys(obj),
            length = (keys || obj).length,
            results = Array(length);
        for (var index = 0; index < length; index++) {
            var currentKey = keys ? keys[index] : index;
            results[index] = iteratee(obj[currentKey], currentKey, obj);
        }
        return results;
    };

    // Create a reducing function iterating left or right.
    function createReduce(dir) {
        // Optimized iterator function as using arguments.length
        // in the main function will deoptimize the, see #1991.
        function iterator(obj, iteratee, memo, keys, index, length) {
            for (; index >= 0 && index < length; index += dir) {
                var currentKey = keys ? keys[index] : index;
                memo = iteratee(memo, obj[currentKey], currentKey, obj);
            }
            return memo;
        }

        return function (obj, iteratee, memo, context) {
            iteratee = optimizeCb(iteratee, context, 4);
            var keys = !isArrayLike(obj) && _.keys(obj),
                length = (keys || obj).length,
                index = dir > 0 ? 0 : length - 1;
            // Determine the initial value if none is provided.
            if (arguments.length < 3) {
                memo = obj[keys ? keys[index] : index];
                index += dir;
            }
            return iterator(obj, iteratee, memo, keys, index, length);
        };
    }

    // **Reduce** builds up a single result from a list of values, aka `inject`,
    // or `foldl`.
    _.reduce = _.foldl = _.inject = createReduce(1);

    // The right-associative version of reduce, also known as `foldr`.
    _.reduceRight = _.foldr = createReduce(-1);

    // Return the first value which passes a truth test. Aliased as `detect`.
    _.find = _.detect = function (obj, predicate, context) {
        var key;
        if (isArrayLike(obj)) {
            key = _.findIndex(obj, predicate, context);
        } else {
            key = _.findKey(obj, predicate, context);
        }
        if (key !== void 0 && key !== -1) return obj[key];
    };

    // Return all the elements that pass a truth test.
    // Aliased as `select`.
    _.filter = _.select = function (obj, predicate, context) {
        var results = [];
        predicate = cb(predicate, context);
        _.each(obj, function (value, index, list) {
            if (predicate(value, index, list)) results.push(value);
        });
        return results;
    };

    // Return all the elements for which a truth test fails.
    _.reject = function (obj, predicate, context) {
        return _.filter(obj, _.negate(cb(predicate)), context);
    };

    // Determine whether all of the elements match a truth test.
    // Aliased as `all`.
    _.every = _.all = function (obj, predicate, context) {
        predicate = cb(predicate, context);
        var keys = !isArrayLike(obj) && _.keys(obj),
            length = (keys || obj).length;
        for (var index = 0; index < length; index++) {
            var currentKey = keys ? keys[index] : index;
            if (!predicate(obj[currentKey], currentKey, obj)) return false;
        }
        return true;
    };

    // Determine if at least one element in the object matches a truth test.
    // Aliased as `any`.
    _.some = _.any = function (obj, predicate, context) {
        predicate = cb(predicate, context);
        var keys = !isArrayLike(obj) && _.keys(obj),
            length = (keys || obj).length;
        for (var index = 0; index < length; index++) {
            var currentKey = keys ? keys[index] : index;
            if (predicate(obj[currentKey], currentKey, obj)) return true;
        }
        return false;
    };

    // Determine if the array or object contains a given item (using `===`).
    // Aliased as `includes` and `include`.
    _.contains = _.includes = _.include = function (obj, item, fromIndex, guard) {
        if (!isArrayLike(obj)) obj = _.values(obj);
        if (typeof fromIndex != 'number' || guard) fromIndex = 0;
        return _.indexOf(obj, item, fromIndex) >= 0;
    };

    // Invoke a method (with arguments) on every item in a collection.
    _.invoke = function (obj, method) {
        var args = slice.call(arguments, 2);
        var isFunc = _.isFunction(method);
        return _.map(obj, function (value) {
            var func = isFunc ? method : value[method];
            return func == null ? func : func.apply(value, args);
        });
    };

    // Convenience version of a common use case of `map`: fetching a property.
    _.pluck = function (obj, key) {
        return _.map(obj, _.property(key));
    };

    // Convenience version of a common use case of `filter`: selecting only objects
    // containing specific `key:value` pairs.
    _.where = function (obj, attrs) {
        return _.filter(obj, _.matcher(attrs));
    };

    // Convenience version of a common use case of `find`: getting the first object
    // containing specific `key:value` pairs.
    _.findWhere = function (obj, attrs) {
        return _.find(obj, _.matcher(attrs));
    };

    // Return the maximum element (or element-based computation).
    _.max = function (obj, iteratee, context) {
        var result = -Infinity,
            lastComputed = -Infinity,
            value, computed;
        if (iteratee == null && obj != null) {
            obj = isArrayLike(obj) ? obj : _.values(obj);
            for (var i = 0, length = obj.length; i < length; i++) {
                value = obj[i];
                if (value > result) {
                    result = value;
                }
            }
        } else {
            iteratee = cb(iteratee, context);
            _.each(obj, function (value, index, list) {
                computed = iteratee(value, index, list);
                if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
                    result = value;
                    lastComputed = computed;
                }
            });
        }
        return result;
    };

    // Return the minimum element (or element-based computation).
    _.min = function (obj, iteratee, context) {
        var result = Infinity,
            lastComputed = Infinity,
            value, computed;
        if (iteratee == null && obj != null) {
            obj = isArrayLike(obj) ? obj : _.values(obj);
            for (var i = 0, length = obj.length; i < length; i++) {
                value = obj[i];
                if (value < result) {
                    result = value;
                }
            }
        } else {
            iteratee = cb(iteratee, context);
            _.each(obj, function (value, index, list) {
                computed = iteratee(value, index, list);
                if (computed < lastComputed || computed === Infinity && result === Infinity) {
                    result = value;
                    lastComputed = computed;
                }
            });
        }
        return result;
    };

    _.shuffle = function (obj) {
        var set = isArrayLike(obj) ? obj : _.values(obj);
        var length = set.length;
        var shuffled = Array(length);
        for (var index = 0, rand; index < length; index++) {
            rand = _.random(0, index);
            if (rand !== index) shuffled[index] = shuffled[rand];
            shuffled[rand] = set[index];
        }
        return shuffled;
    };

    // Sample **n** random values from a collection.
    // If **n** is not specified, returns a single random element.
    // The internal `guard` argument allows it to work with `map`.
    _.sample = function (obj, n, guard) {
        if (n == null || guard) {
            if (!isArrayLike(obj)) obj = _.values(obj);
            return obj[_.random(obj.length - 1)];
        }
        return _.shuffle(obj).slice(0, Math.max(0, n));
    };

    // Sort the object's values by a criterion produced by an iteratee.
    _.sortBy = function (obj, iteratee, context) {
        iteratee = cb(iteratee, context);
        return _.pluck(_.map(obj, function (value, index, list) {
            return {
                value: value,
                index: index,
                criteria: iteratee(value, index, list)
            };
        }).sort(function (left, right) {
            var a = left.criteria;
            var b = right.criteria;
            if (a !== b) {
                if (a > b || a === void 0) return 1;
                if (a < b || b === void 0) return -1;
            }
            return left.index - right.index;
        }), 'value');
    };

    // An internal function used for aggregate "group by" operations.
    var group = function (behavior) {
        return function (obj, iteratee, context) {
            var result = {};
            iteratee = cb(iteratee, context);
            _.each(obj, function (value, index) {
                var key = iteratee(value, index, obj);
                behavior(result, value, key);
            });
            return result;
        };
    };

    // Groups the object's values by a criterion. Pass either a string attribute
    // to group by, or a function that returns the criterion.
    _.groupBy = group(function (result, value, key) {
        if (_.has(result, key)) result[key].push(value);
        else result[key] = [value];
    });

    // Indexes the object's values by a criterion, similar to `groupBy`, but for
    // when you know that your index values will be unique.
    _.indexBy = group(function (result, value, key) {
        result[key] = value;
    });

    // Counts instances of an object that group by a certain criterion. Pass
    // either a string attribute to count by, or a function that returns the
    // criterion.
    _.countBy = group(function (result, value, key) {
        if (_.has(result, key)) result[key]++;
        else result[key] = 1;
    });

    // Safely create a real, live array from anything iterable.
    _.toArray = function (obj) {
        if (!obj) return [];
        if (_.isArray(obj)) return slice.call(obj);
        if (isArrayLike(obj)) return _.map(obj, _.identity);
        return _.values(obj);
    };

    // Return the number of elements in an object.
    _.size = function (obj) {
        if (obj == null) return 0;
        return isArrayLike(obj) ? obj.length : _.keys(obj).length;
    };

    // Split a collection into two arrays: one whose elements all satisfy the given
    // predicate, and one whose elements all do not satisfy the predicate.
    _.partition = function (obj, predicate, context) {
        predicate = cb(predicate, context);
        var pass = [],
            fail = [];
        _.each(obj, function (value, key, obj) {
            (predicate(value, key, obj) ? pass : fail).push(value);
        });
        return [pass, fail];
    };

    // Array Functions
    // ---------------

    // Get the first element of an array. Passing **n** will return the first N
    // values in the array. Aliased as `head` and `take`. The **guard** check
    // allows it to work with `_.map`.
    _.first = _.head = _.take = function (array, n, guard) {
        if (array == null) return void 0;
        if (n == null || guard) return array[0];
        return _.initial(array, array.length - n);
    };

    // Returns everything but the last entry of the array. Especially useful on
    // the arguments object. Passing **n** will return all the values in
    // the array, excluding the last N.
    _.initial = function (array, n, guard) {
        return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
    };

    // Get the last element of an array. Passing **n** will return the last N
    // values in the array.
    _.last = function (array, n, guard) {
        if (array == null) return void 0;
        if (n == null || guard) return array[array.length - 1];
        return _.rest(array, Math.max(0, array.length - n));
    };

    // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
    // Especially useful on the arguments object. Passing an **n** will return
    // the rest N values in the array.
    _.rest = _.tail = _.drop = function (array, n, guard) {
        return slice.call(array, n == null || guard ? 1 : n);
    };

    // Trim out all falsy values from an array.
    _.compact = function (array) {
        return _.filter(array, _.identity);
    };

    // Internal implementation of a recursive `flatten` function.
    var flatten = function (input, shallow, strict, startIndex) {
        var output = [],
            idx = 0;
        for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
            var value = input[i];
            if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
                //flatten current level of array or arguments object
                if (!shallow) value = flatten(value, shallow, strict);
                var j = 0,
                    len = value.length;
                output.length += len;
                while (j < len) {
                    output[idx++] = value[j++];
                }
            } else if (!strict) {
                output[idx++] = value;
            }
        }
        return output;
    };

    // Flatten out an array, either recursively (by default), or just one level.
    _.flatten = function (array, shallow) {
        return flatten(array, shallow, false);
    };

    // Return a version of the array that does not contain the specified value(s).
    _.without = function (array) {
        return _.difference(array, slice.call(arguments, 1));
    };

    // Produce a duplicate-free version of the array. If the array has already
    // been sorted, you have the option of using a faster algorithm.
    // Aliased as `unique`.
    _.uniq = _.unique = function (array, isSorted, iteratee, context) {
        if (!_.isBoolean(isSorted)) {
            context = iteratee;
            iteratee = isSorted;
            isSorted = false;
        }
        if (iteratee != null) iteratee = cb(iteratee, context);
        var result = [];
        var seen = [];
        for (var i = 0, length = getLength(array); i < length; i++) {
            var value = array[i],
                computed = iteratee ? iteratee(value, i, array) : value;
            if (isSorted) {
                if (!i || seen !== computed) result.push(value);
                seen = computed;
            } else if (iteratee) {
                if (!_.contains(seen, computed)) {
                    seen.push(computed);
                    result.push(value);
                }
            } else if (!_.contains(result, value)) {
                result.push(value);
            }
        }
        return result;
    };

    // Produce an array that contains the union: each distinct element from all of
    // the passed-in arrays.
    _.union = function () {
        return _.uniq(flatten(arguments, true, true));
    };

    // Produce an array that contains every item shared between all the
    // passed-in arrays.
    _.intersection = function (array) {
        var result = [];
        var argsLength = arguments.length;
        for (var i = 0, length = getLength(array); i < length; i++) {
            var item = array[i];
            if (_.contains(result, item)) continue;
            for (var j = 1; j < argsLength; j++) {
                if (!_.contains(arguments[j], item)) break;
            }
            if (j === argsLength) result.push(item);
        }
        return result;
    };

    // Take the difference between one array and a number of other arrays.
    // Only the elements present in just the first array will remain.
    _.difference = function (array) {
        var rest = flatten(arguments, true, true, 1);
        return _.filter(array, function (value) {
            return !_.contains(rest, value);
        });
    };

    // Zip together multiple lists into a single array -- elements that share
    // an index go together.
    _.zip = function () {
        return _.unzip(arguments);
    };

    // Complement of _.zip. Unzip accepts an array of arrays and groups
    // each array's elements on shared indices
    _.unzip = function (array) {
        var length = array && _.max(array, getLength).length || 0;
        var result = Array(length);

        for (var index = 0; index < length; index++) {
            result[index] = _.pluck(array, index);
        }
        return result;
    };

    // Converts lists into objects. Pass either a single array of `[key, value]`
    // pairs, or two parallel arrays of the same length -- one of keys, and one of
    // the corresponding values.
    _.object = function (list, values) {
        var result = {};
        for (var i = 0, length = getLength(list); i < length; i++) {
            if (values) {
                result[list[i]] = values[i];
            } else {
                result[list[i][0]] = list[i][1];
            }
        }
        return result;
    };

    // Generator function to create the findIndex and findLastIndex functions
    function createPredicateIndexFinder(dir) {
        return function (array, predicate, context) {
            predicate = cb(predicate, context);
            var length = getLength(array);
            var index = dir > 0 ? 0 : length - 1;
            for (; index >= 0 && index < length; index += dir) {
                if (predicate(array[index], index, array)) return index;
            }
            return -1;
        };
    }

    // Returns the first index on an array-like that passes a predicate test
    _.findIndex = createPredicateIndexFinder(1);
    _.findLastIndex = createPredicateIndexFinder(-1);

    // Use a comparator function to figure out the smallest index at which
    // an object should be inserted so as to maintain order. Uses binary search.
    _.sortedIndex = function (array, obj, iteratee, context) {
        iteratee = cb(iteratee, context, 1);
        var value = iteratee(obj);
        var low = 0,
            high = getLength(array);
        while (low < high) {
            var mid = Math.floor((low + high) / 2);
            if (iteratee(array[mid]) < value) low = mid + 1;
            else high = mid;
        }
        return low;
    };

    // Generator function to create the indexOf and lastIndexOf functions
    function createIndexFinder(dir, predicateFind, sortedIndex) {
        return function (array, item, idx) {
            var i = 0,
                length = getLength(array);
            if (typeof idx == 'number') {
                if (dir > 0) {
                    i = idx >= 0 ? idx : Math.max(idx + length, i);
                } else {
                    length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
                }
            } else if (sortedIndex && idx && length) {
                idx = sortedIndex(array, item);
                return array[idx] === item ? idx : -1;
            }
            if (item !== item) {
                idx = predicateFind(slice.call(array, i, length), _.isNaN);
                return idx >= 0 ? idx + i : -1;
            }
            for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
                if (array[idx] === item) return idx;
            }
            return -1;
        };
    }

    // Return the position of the first occurrence of an item in an array,
    // or -1 if the item is not included in the array.
    // If the array is large and already in sort order, pass `true`
    // for **isSorted** to use binary search.
    _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
    _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

    // Generate an integer Array containing an arithmetic progression. A port of
    // the native Python `range()` function. See
    // [the Python documentation](http://docs.python.org/library/functions.html#range).
    _.range = function (start, stop, step) {
        if (stop == null) {
            stop = start || 0;
            start = 0;
        }
        step = step || 1;

        var length = Math.max(Math.ceil((stop - start) / step), 0);
        var range = Array(length);

        for (var idx = 0; idx < length; idx++, start += step) {
            range[idx] = start;
        }

        return range;
    };

    // Function (ahem) Functions
    // ------------------

    // Determines whether to execute a function as a constructor
    // or a normal function with the provided arguments
    var executeBound = function (sourceFunc, boundFunc, context, callingContext, args) {
        if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
        var self = baseCreate(sourceFunc.prototype);
        var result = sourceFunc.apply(self, args);
        if (_.isObject(result)) return result;
        return self;
    };

    // Create a function bound to a given object (assigning `this`, and arguments,
    // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
    // available.
    _.bind = function (func, context) {
        if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
        if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
        var args = slice.call(arguments, 2);
        var bound = function () {
            return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
        };
        return bound;
    };

    // Partially apply a function by creating a version that has had some of its
    // arguments pre-filled, without changing its dynamic `this` context. _ acts
    // as a placeholder, allowing any combination of arguments to be pre-filled.
    _.partial = function (func) {
        var boundArgs = slice.call(arguments, 1);
        var bound = function () {
            var position = 0,
                length = boundArgs.length;
            var args = Array(length);
            for (var i = 0; i < length; i++) {
                args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
            }
            while (position < arguments.length) args.push(arguments[position++]);
            return executeBound(func, bound, this, this, args);
        };
        return bound;
    };

    // Bind a number of an object's methods to that object. Remaining arguments
    // are the method names to be bound. Useful for ensuring that all callbacks
    // defined on an object belong to it.
    _.bindAll = function (obj) {
        var i, length = arguments.length,
            key;
        if (length <= 1) throw new Error('bindAll must be passed function names');
        for (i = 1; i < length; i++) {
            key = arguments[i];
            obj[key] = _.bind(obj[key], obj);
        }
        return obj;
    };

    // Memoize an expensive function by storing its results.
    _.memoize = function (func, hasher) {
        var memoize = function (key) {
            var cache = memoize.cache;
            var address = '' + (hasher ? hasher.apply(this, arguments) : key);
            if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
            return cache[address];
        };
        memoize.cache = {};
        return memoize;
    };

    // Delays a function for the given number of milliseconds, and then calls
    // it with the arguments supplied.
    _.delay = function (func, wait) {
        var args = slice.call(arguments, 2);
        return setTimeout(function () {
            return func.apply(null, args);
        }, wait);
    };

    // Defers a function, scheduling it to run after the current call stack has
    // cleared.
    _.defer = _.partial(_.delay, _, 1);

    // Returns a function, that, when invoked, will only be triggered at most once
    // during a given window of time. Normally, the throttled function will run
    // as much as it can, without ever going more than once per `wait` duration;
    // but if you'd like to disable the execution on the leading edge, pass
    // `{leading: false}`. To disable execution on the trailing edge, ditto.
    _.throttle = function (func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        if (!options) options = {};
        var later = function () {
            previous = options.leading === false ? 0 : _.now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        };
        return function () {
            var now = _.now();
            if (!previous && options.leading === false) previous = now;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    };

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    _.debounce = function (func, wait, immediate) {
        var timeout, args, context, timestamp, result;

        var later = function () {
            var last = _.now() - timestamp;

            if (last < wait && last >= 0) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                }
            }
        };

        return function () {
            context = this;
            args = arguments;
            timestamp = _.now();
            var callNow = immediate && !timeout;
            if (!timeout) timeout = setTimeout(later, wait);
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }

            return result;
        };
    };

    // Returns the first function passed as an argument to the second,
    // allowing you to adjust arguments, run code before and after, and
    // conditionally execute the original function.
    _.wrap = function (func, wrapper) {
        return _.partial(wrapper, func);
    };

    // Returns a negated version of the passed-in predicate.
    _.negate = function (predicate) {
        return function () {
            return !predicate.apply(this, arguments);
        };
    };

    // Returns a function that is the composition of a list of functions, each
    // consuming the return value of the function that follows.
    _.compose = function () {
        var args = arguments;
        var start = args.length - 1;
        return function () {
            var i = start;
            var result = args[start].apply(this, arguments);
            while (i--) result = args[i].call(this, result);
            return result;
        };
    };

    // Returns a function that will only be executed on and after the Nth call.
    _.after = function (times, func) {
        return function () {
            if (--times < 1) {
                return func.apply(this, arguments);
            }
        };
    };

    // Returns a function that will only be executed up to (but not including) the Nth call.
    _.before = function (times, func) {
        var memo;
        return function () {
            if (--times > 0) {
                memo = func.apply(this, arguments);
            }
            if (times <= 1) func = null;
            return memo;
        };
    };

    // Returns a function that will be executed at most one time, no matter how
    // often you call it. Useful for lazy initialization.
    _.once = _.partial(_.before, 2);

    // Object Functions
    // ----------------

    // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
    var hasEnumBug = !{
        toString: null
    }.propertyIsEnumerable('toString');
    var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
        'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'
    ];

    function collectNonEnumProps(obj, keys) {
        var nonEnumIdx = nonEnumerableProps.length;
        var constructor = obj.constructor;
        var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

        // Constructor is a special case.
        var prop = 'constructor';
        if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

        while (nonEnumIdx--) {
            prop = nonEnumerableProps[nonEnumIdx];
            if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
                keys.push(prop);
            }
        }
    }

    // Retrieve the names of an object's own properties.
    // Delegates to **ECMAScript 5**'s native `Object.keys`
    _.keys = function (obj) {
        if (!_.isObject(obj)) return [];
        if (nativeKeys) return nativeKeys(obj);
        var keys = [];
        for (var key in obj)
            if (_.has(obj, key)) keys.push(key);
            // Ahem, IE < 9.
        if (hasEnumBug) collectNonEnumProps(obj, keys);
        return keys;
    };

    // Retrieve all the property names of an object.
    _.allKeys = function (obj) {
        if (!_.isObject(obj)) return [];
        var keys = [];
        for (var key in obj) keys.push(key);
        // Ahem, IE < 9.
        if (hasEnumBug) collectNonEnumProps(obj, keys);
        return keys;
    };

    // Retrieve the values of an object's properties.
    _.values = function (obj) {
        var keys = _.keys(obj);
        var length = keys.length;
        var values = Array(length);
        for (var i = 0; i < length; i++) {
            values[i] = obj[keys[i]];
        }
        return values;
    };

    // Returns the results of applying the iteratee to each element of the object
    // In contrast to _.map it returns an object
    _.mapObject = function (obj, iteratee, context) {
        iteratee = cb(iteratee, context);
        var keys = _.keys(obj),
            length = keys.length,
            results = {},
            currentKey;
        for (var index = 0; index < length; index++) {
            currentKey = keys[index];
            results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
        }
        return results;
    };

    // Convert an object into a list of `[key, value]` pairs.
    _.pairs = function (obj) {
        var keys = _.keys(obj);
        var length = keys.length;
        var pairs = Array(length);
        for (var i = 0; i < length; i++) {
            pairs[i] = [keys[i], obj[keys[i]]];
        }
        return pairs;
    };

    // Invert the keys and values of an object. The values must be serializable.
    _.invert = function (obj) {
        var result = {};
        var keys = _.keys(obj);
        for (var i = 0, length = keys.length; i < length; i++) {
            result[obj[keys[i]]] = keys[i];
        }
        return result;
    };

    // Return a sorted list of the function names available on the object.
    // Aliased as `methods`
    _.functions = _.methods = function (obj) {
        var names = [];
        for (var key in obj) {
            if (_.isFunction(obj[key])) names.push(key);
        }
        return names.sort();
    };

    // Extend a given object with all the properties in passed-in object(s).
    _.extend = createAssigner(_.allKeys);

    // Assigns a given object with all the own properties in the passed-in object(s)
    // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
    _.extendOwn = _.assign = createAssigner(_.keys);

    // Returns the first key on an object that passes a predicate test
    _.findKey = function (obj, predicate, context) {
        predicate = cb(predicate, context);
        var keys = _.keys(obj),
            key;
        for (var i = 0, length = keys.length; i < length; i++) {
            key = keys[i];
            if (predicate(obj[key], key, obj)) return key;
        }
    };

    // Return a copy of the object only containing the whitelisted properties.
    _.pick = function (object, oiteratee, context) {
        var result = {},
            obj = object,
            iteratee, keys;
        if (obj == null) return result;
        if (_.isFunction(oiteratee)) {
            keys = _.allKeys(obj);
            iteratee = optimizeCb(oiteratee, context);
        } else {
            keys = flatten(arguments, false, false, 1);
            iteratee = function (value, key, obj) {
                return key in obj;
            };
            obj = Object(obj);
        }
        for (var i = 0, length = keys.length; i < length; i++) {
            var key = keys[i];
            var value = obj[key];
            if (iteratee(value, key, obj)) result[key] = value;
        }
        return result;
    };

    // Return a copy of the object without the blacklisted properties.
    _.omit = function (obj, iteratee, context) {
        if (_.isFunction(iteratee)) {
            iteratee = _.negate(iteratee);
        } else {
            var keys = _.map(flatten(arguments, false, false, 1), String);
            iteratee = function (value, key) {
                return !_.contains(keys, key);
            };
        }
        return _.pick(obj, iteratee, context);
    };

    // Fill in a given object with default properties.
    _.defaults = createAssigner(_.allKeys, true);

    // Creates an object that inherits from the given prototype object.
    // If additional properties are provided then they will be added to the
    // created object.
    _.create = function (prototype, props) {
        var result = baseCreate(prototype);
        if (props) _.extendOwn(result, props);
        return result;
    };

    // Create a (shallow-cloned) duplicate of an object.
    _.clone = function (obj) {
        if (!_.isObject(obj)) return obj;
        return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
    };

    // Invokes interceptor with the obj, and then returns obj.
    // The primary purpose of this method is to "tap into" a method chain, in
    // order to perform operations on intermediate results within the chain.
    _.tap = function (obj, interceptor) {
        interceptor(obj);
        return obj;
    };

    // Returns whether an object has a given set of `key:value` pairs.
    _.isMatch = function (object, attrs) {
        var keys = _.keys(attrs),
            length = keys.length;
        if (object == null) return !length;
        var obj = Object(object);
        for (var i = 0; i < length; i++) {
            var key = keys[i];
            if (attrs[key] !== obj[key] || !(key in obj)) return false;
        }
        return true;
    };


    // Internal recursive comparison function for `isEqual`.
    var eq = function (a, b, aStack, bStack) {
        // Identical objects are equal. `0 === -0`, but they aren't identical.
        // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
        if (a === b) return a !== 0 || 1 / a === 1 / b;
        // A strict comparison is necessary because `null == undefined`.
        if (a == null || b == null) return a === b;
        // Unwrap any wrapped objects.
        if (a instanceof _) a = a._wrapped;
        if (b instanceof _) b = b._wrapped;
        // Compare `[[Class]]` names.
        var className = toString.call(a);
        if (className !== toString.call(b)) return false;
        switch (className) {
            // Strings, numbers, regular expressions, dates, and booleans are compared by value.
            case '[object RegExp]':
                // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
            case '[object String]':
                // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
                // equivalent to `new String("5")`.
                return '' + a === '' + b;
            case '[object Number]':
                // `NaN`s are equivalent, but non-reflexive.
                // Object(NaN) is equivalent to NaN
                if (+a !== +a) return +b !== +b;
                // An `egal` comparison is performed for other numeric values.
                return +a === 0 ? 1 / +a === 1 / b : +a === +b;
            case '[object Date]':
            case '[object Boolean]':
                // Coerce dates and booleans to numeric primitive values. Dates are compared by their
                // millisecond representations. Note that invalid dates with millisecond representations
                // of `NaN` are not equivalent.
                return +a === +b;
        }

        var areArrays = className === '[object Array]';
        if (!areArrays) {
            if (typeof a != 'object' || typeof b != 'object') return false;

            // Objects with different constructors are not equivalent, but `Object`s or `Array`s
            // from different frames are.
            var aCtor = a.constructor,
                bCtor = b.constructor;
            if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                    _.isFunction(bCtor) && bCtor instanceof bCtor) && ('constructor' in a && 'constructor' in b)) {
                return false;
            }
        }
        // Assume equality for cyclic structures. The algorithm for detecting cyclic
        // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

        // Initializing stack of traversed objects.
        // It's done here since we only need them for objects and arrays comparison.
        aStack = aStack || [];
        bStack = bStack || [];
        var length = aStack.length;
        while (length--) {
            // Linear search. Performance is inversely proportional to the number of
            // unique nested structures.
            if (aStack[length] === a) return bStack[length] === b;
        }

        // Add the first object to the stack of traversed objects.
        aStack.push(a);
        bStack.push(b);

        // Recursively compare objects and arrays.
        if (areArrays) {
            // Compare array lengths to determine if a deep comparison is necessary.
            length = a.length;
            if (length !== b.length) return false;
            // Deep compare the contents, ignoring non-numeric properties.
            while (length--) {
                if (!eq(a[length], b[length], aStack, bStack)) return false;
            }
        } else {
            // Deep compare objects.
            var keys = _.keys(a),
                key;
            length = keys.length;
            // Ensure that both objects contain the same number of properties before comparing deep equality.
            if (_.keys(b).length !== length) return false;
            while (length--) {
                // Deep compare each member
                key = keys[length];
                if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
            }
        }
        // Remove the first object from the stack of traversed objects.
        aStack.pop();
        bStack.pop();
        return true;
    };

    // Perform a deep comparison to check if two objects are equal.
    _.isEqual = function (a, b) {
        return eq(a, b);
    };

    // Is a given array, string, or object empty?
    // An "empty" object has no enumerable own-properties.
    _.isEmpty = function (obj) {
        if (obj == null) return true;
        if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
        return _.keys(obj).length === 0;
    };

    // Is a given value a DOM element?
    _.isElement = function (obj) {
        return !!(obj && obj.nodeType === 1);
    };

    // Is a given value an array?
    // Delegates to ECMA5's native Array.isArray
    _.isArray = nativeIsArray || function (obj) {
        return toString.call(obj) === '[object Array]';
    };

    // Is a given variable an object?
    _.isObject = function (obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
    _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function (name) {
        _['is' + name] = function (obj) {
            return toString.call(obj) === '[object ' + name + ']';
        };
    });

    // Define a fallback version of the method in browsers (ahem, IE < 9), where
    // there isn't any inspectable "Arguments" type.
    if (!_.isArguments(arguments)) {
        _.isArguments = function (obj) {
            return _.has(obj, 'callee');
        };
    }

    // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
    // IE 11 (#1621), and in Safari 8 (#1929).
    if (typeof /./ != 'function' && typeof Int8Array != 'object') {
        _.isFunction = function (obj) {
            return typeof obj == 'function' || false;
        };
    }

    // Is a given object a finite number?
    _.isFinite = function (obj) {
        return isFinite(obj) && !isNaN(parseFloat(obj));
    };

    // Is the given value `NaN`? (NaN is the only number which does not equal itself).
    _.isNaN = function (obj) {
        return _.isNumber(obj) && obj !== +obj;
    };

    // Is a given value a boolean?
    _.isBoolean = function (obj) {
        return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
    };

    // Is a given value equal to null?
    _.isNull = function (obj) {
        return obj === null;
    };

    // Is a given variable undefined?
    _.isUndefined = function (obj) {
        return obj === void 0;
    };

    // Shortcut function for checking if an object has a given property directly
    // on itself (in other words, not on a prototype).
    _.has = function (obj, key) {
        return obj != null && hasOwnProperty.call(obj, key);
    };

    // Utility Functions
    // -----------------

    // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
    // previous owner. Returns a reference to the Underscore object.
    _.noConflict = function () {
        root._ = previousUnderscore;
        return this;
    };

    // Keep the identity function around for default iteratees.
    _.identity = function (value) {
        return value;
    };

    // Predicate-generating functions. Often useful outside of Underscore.
    _.constant = function (value) {
        return function () {
            return value;
        };
    };

    _.noop = function () {};

    _.property = property;

    // Generates a function for a given object that returns a given property.
    _.propertyOf = function (obj) {
        return obj == null ? function () {} : function (key) {
            return obj[key];
        };
    };

    // Returns a predicate for checking whether an object has a given set of
    // `key:value` pairs.
    _.matcher = _.matches = function (attrs) {
        attrs = _.extendOwn({}, attrs);
        return function (obj) {
            return _.isMatch(obj, attrs);
        };
    };

    // Run a function **n** times.
    _.times = function (n, iteratee, context) {
        var accum = Array(Math.max(0, n));
        iteratee = optimizeCb(iteratee, context, 1);
        for (var i = 0; i < n; i++) accum[i] = iteratee(i);
        return accum;
    };

    // Return a random integer between min and max (inclusive).
    _.random = function (min, max) {
        if (max == null) {
            max = min;
            min = 0;
        }
        return min + Math.floor(Math.random() * (max - min + 1));
    };

    // A (possibly faster) way to get the current timestamp as an integer.
    _.now = Date.now || function () {
        return new Date().getTime();
    };

    // List of HTML entities for escaping.
    var escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '`': '&#x60;'
    };
    var unescapeMap = _.invert(escapeMap);

    // Functions for escaping and unescaping strings to/from HTML interpolation.
    var createEscaper = function (map) {
        var escaper = function (match) {
            return map[match];
        };
        // Regexes for identifying a key that needs to be escaped
        var source = '(?:' + _.keys(map).join('|') + ')';
        var testRegexp = RegExp(source);
        var replaceRegexp = RegExp(source, 'g');
        return function (string) {
            string = string == null ? '' : '' + string;
            return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
        };
    };
    _.escape = createEscaper(escapeMap);
    _.unescape = createEscaper(unescapeMap);

    // If the value of the named `property` is a function then invoke it with the
    // `object` as context; otherwise, return it.
    _.result = function (object, property, fallback) {
        var value = object == null ? void 0 : object[property];
        if (value === void 0) {
            value = fallback;
        }
        return _.isFunction(value) ? value.call(object) : value;
    };

    // Generate a unique integer id (unique within the entire client session).
    // Useful for temporary DOM ids.
    var idCounter = 0;
    _.uniqueId = function (prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
    };

    // By default, Underscore uses ERB-style template delimiters, change the
    // following template settings to use alternative delimiters.
    _.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };

    // When customizing `templateSettings`, if you don't want to define an
    // interpolation, evaluation or escaping regex, we need one that is
    // guaranteed not to match.
    var noMatch = /(.)^/;

    // Certain characters need to be escaped so that they can be put into a
    // string literal.
    var escapes = {
        "'": "'",
        '\\': '\\',
        '\r': 'r',
        '\n': 'n',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
    };

    var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

    var escapeChar = function (match) {
        return '\\' + escapes[match];
    };

    // JavaScript micro-templating, similar to John Resig's implementation.
    // Underscore templating handles arbitrary delimiters, preserves whitespace,
    // and correctly escapes quotes within interpolated code.
    // NB: `oldSettings` only exists for backwards compatibility.
    _.template = function (text, settings, oldSettings) {
        if (!settings && oldSettings) settings = oldSettings;
        settings = _.defaults({}, settings, _.templateSettings);

        // Combine delimiters into one regular expression via alternation.
        var matcher = RegExp([
            (settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source
        ].join('|') + '|$', 'g');

        // Compile the template source, escaping string literals appropriately.
        var index = 0;
        var source = "__p+='";
        text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset).replace(escaper, escapeChar);
            index = offset + match.length;

            if (escape) {
                source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
            } else if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            } else if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }

            // Adobe VMs need the match returned to produce the correct offest.
            return match;
        });
        source += "';\n";

        // If a variable is not specified, place data values in local scope.
        if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

        source = "var __t,__p='',__j=Array.prototype.join," +
            "print=function (){__p+=__j.call(arguments,'');};\n" +
            source + 'return __p;\n';

        try {
            var render = new Function(settings.variable || 'obj', '_', source);
        } catch (e) {
            e.source = source;
			msos.console.debug('msos/base - _.template -> error:', e);
            throw e;
        }

        var template = function (data) {
			if (msos.config.verbose) {
				msos.console.debug('msos/base - _.template -> called, for data:', data);
			}
            return render.call(this, data, _);
        };

        // Provide the compiled source as a convenience for precompilation.
        var argument = settings.variable || 'obj';
        template.source = 'function (' + argument + '){\n' + source + '}';

        return template;
    };

    // Add a "chain" function. Start chaining a wrapped Underscore object.
    _.chain = function (obj) {
        var instance = _(obj);
        instance._chain = true;
        return instance;
    };

    // OOP
    // ---------------
    // If Underscore is called as a function, it returns a wrapped object that
    // can be used OO-style. This wrapper holds altered versions of all the
    // underscore functions. Wrapped objects may be chained.

    // Helper function to continue chaining intermediate results.
    var result = function (instance, obj) {
        return instance._chain ? _(obj).chain() : obj;
    };

    // Add your own custom functions to the Underscore object.
    _.mixin = function (obj) {
        _.each(_.functions(obj), function (name) {
            var func = _[name] = obj[name];
            _.prototype[name] = function () {
                var args = [this._wrapped];
                push.apply(args, arguments);
                return result(this, func.apply(_, args));
            };
        });
    };

    // Add all of the Underscore functions to the wrapper object.
    _.mixin(_);

    // Add all mutator Array functions to the wrapper.
    _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function (name) {
        var method = ArrayProto[name];
        _.prototype[name] = function () {
            var obj = this._wrapped;
            method.apply(obj, arguments);
            if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
            return result(this, obj);
        };
    });

    // Add all accessor Array functions to the wrapper.
    _.each(['concat', 'join', 'slice'], function (name) {
        var method = ArrayProto[name];
        _.prototype[name] = function () {
            return result(this, method.apply(this._wrapped, arguments));
        };
    });

    // Extracts the result from a wrapped and chained object.
    _.prototype.value = function () {
        return this._wrapped;
    };

    // Provide unwrapping proxy for some methods used in engine operations
    // such as arithmetic and JSON stringification.
    _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

    _.prototype.toString = function () {
        return '' + this._wrapped;
    };

    // AMD registration happens at the end for compatibility with AMD loaders
    // that may not enforce next-turn semantics on modules. Even though general
    // practice for AMD registration is to be anonymous, underscore registers
    // as a named module because, like jQuery, it is a base library that is
    // popular enough to be bundled in a third party lib, but not be part of
    // an AMD load request. Those cases could generate an error when an
    // anonymous define() is called outside of a loader request.
    if (typeof define === 'function' && define.amd) {
        define('underscore', [], function () {
            return _;
        });
    }

	msos.console.debug('msos/base -> underscore.js now available.');

}.call(this));


/*!
 * modernizr v3.2.0
 *
 * Copyright (c)
 *  Faruk Ates
 *  Paul Irish
 *  Alex Sexton
 *  Ryan Seddon
 *  Patrick Kettner
 *  Stu Cox
 *  Richard Herrera

 * MIT License
 */

(function(window, document) {
    "use strict";

    var tests = [],
        classes = [],
        ModernizrProto = {
            _version: '3.2.0',

            // Any settings that don't work as separate modules
            // can go in here as configuration.
            _config: {
                'classPrefix': '',
                'enableClasses': true,
                'enableJSClass': true,
                'usePrefixes': true
            },

            // Queue of tests
            _q: [],

            // Stub these for people who are listening
            on: function(test, cb) {
                var self = this;

                setTimeout(function() {
                    cb(self[test]);
                }, 0);
            },

            addTest: function(name, fn, options) {
                tests.push({
                    name: name,
                    fn: fn,
                    options: options
                });
            },

            addAsyncTest: function(fn) {
                tests.push({
                    name: null,
                    fn: fn
                });
            }
        },
        Modernizr = function() {},
        docElement = document.documentElement,
        prefixes,
        newSyntax,
        oldSyntax,
        isSVG = docElement.nodeName.toLowerCase() === 'svg',
        hasEvent,
        testStyles,
        inputElem,
        inputtypes = ['search', 'tel', 'url', 'email', 'datetime', 'date', 'month', 'week', 'time', 'datetime-local', 'number', 'range', 'color'],
        inputs = {},
        domPrefixes,
        cssomPrefixes,
        modElem,
        mStyle,
        omPrefixes = 'Moz O ms Webkit',
        i = 0;

    function createElement() {

        if (typeof document.createElement !== 'function') {
            // This is the case in IE7, where the type of createElement is "object".
            // For this reason, we cannot call apply() as Object is not a Function.
            return document.createElement(arguments[0]);
        }

        if (isSVG) {
            return document.createElementNS.call(document, 'http://www.w3.org/2000/svg', arguments[0]);
        }

        return document.createElement.apply(document, arguments);
    }

    inputElem = createElement('input');

    Modernizr.prototype = ModernizrProto;

    // Leak modernizr globally when you `require` it rather than force it here.
    // Overwrite name so constructor name is nicer :D
    Modernizr = new Modernizr();

    Modernizr.addTest('geolocation', 'geolocation' in navigator);
    Modernizr.addTest('websockets', 'WebSocket' in window && window.WebSocket.CLOSING === 2);
    Modernizr.addTest('devicemotion', 'DeviceMotionEvent' in window);
    Modernizr.addTest('deviceorientation', 'DeviceOrientationEvent' in window);

    Modernizr.addTest('localstorage', function() {
        var mod = 'modernizr';
        try {
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            return true;
        } catch (e) {
            return false;
        }
    });

    Modernizr.addTest('sessionstorage', function() {
        var mod = 'modernizr';
        try {
            sessionStorage.setItem(mod, mod);
            sessionStorage.removeItem(mod);
            return true;
        } catch (e) {
            return false;
        }
    });

    Modernizr.addTest('websqldatabase', 'openDatabase' in window);

	Modernizr.addTest('cors', 'XMLHttpRequest' in window && 'withCredentials' in new XMLHttpRequest());

    // dataset API for data-* attributes
     Modernizr.addTest('dataset', function () {
        var n = createElement('div');

        n.setAttribute('data-a-b', 'c');

        return !!(n.dataset && n.dataset.aB === 'c');
    });

    function is(obj, type) {
        return typeof obj === type;
    }

    function testRunner() {
        var featureNames,
            feature,
            aliasIdx,
            result,
            nameIdx,
            featureName,
            featureNameSplit,
            featureIdx;

        for (featureIdx in tests) {
            if (tests.hasOwnProperty(featureIdx)) {
                featureNames = [];
                feature = tests[featureIdx];

                if (feature.name) {
                    featureNames.push(feature.name.toLowerCase());

                    if (feature.options && feature.options.aliases && feature.options.aliases.length) {
                        // Add all the aliases into the names list
                        for (aliasIdx = 0; aliasIdx < feature.options.aliases.length; aliasIdx += 1) {
                            featureNames.push(feature.options.aliases[aliasIdx].toLowerCase());
                        }
                    }
                }

                // Run the test, or use the raw value if it's not a function
                result = is(feature.fn, 'function') ? feature.fn() : feature.fn;

                // Set each of the names on the Modernizr object
                for (nameIdx = 0; nameIdx < featureNames.length; nameIdx += 1) {
                    featureName = featureNames[nameIdx];

                    featureNameSplit = featureName.split('.');

                    if (featureNameSplit.length === 1) {
                        Modernizr[featureNameSplit[0]] = result;
                    } else {
                        // cast to a Boolean, if not one already
                        /* jshint -W053 */
                        if (Modernizr[featureNameSplit[0]] && !(Modernizr[featureNameSplit[0]] instanceof Boolean)) {
                            Modernizr[featureNameSplit[0]] = new Boolean(Modernizr[featureNameSplit[0]]);
                        }

                        Modernizr[featureNameSplit[0]][featureNameSplit[1]] = result;
                    }

                    classes.push((result ? '' : 'no-') + featureNameSplit.join('-'));
                }
            }
        }
    }

    prefixes = (ModernizrProto._config.usePrefixes ? ['-webkit-', '-moz-', '-o-', '-ms-'] : []);

    // expose these for the plugin API. Look in the source for how to join() them against your input
    ModernizrProto._prefixes = prefixes;

    newSyntax = 'CSS' in window && 'supports' in window.CSS;
    oldSyntax = 'supportsCSS' in window;

    Modernizr.addTest('supports', newSyntax || oldSyntax);

    hasEvent = (function () {

        // Detect whether event support can be detected via `in`. Test on a DOM element
        // using the "blur" event b/c it should always exist. bit.ly/event-detection
        var needsFallback = !('onblur' in document.documentElement);

        function inner(eventName, element) {
            var isSupported;

            if (!eventName) {
                return false;
            }
            if (!element || typeof element === 'string') {
                element = createElement(element || 'div');
            }

            // Testing via the `in` operator is sufficient for modern browsers and IE.
            // When using `setAttribute`, IE skips "unload", WebKit skips "unload" and
            // "resize", whereas `in` "catches" those.
            eventName = 'on' + eventName;
            isSupported = eventName in element;

            // Fallback technique for old Firefox - bit.ly/event-detection
            if (!isSupported && needsFallback) {
                if (!element.setAttribute) {
                    // Switch to generic element if it lacks `setAttribute`.
                    // It could be the `document`, `window`, or something else.
                    element = createElement('div');
                }

                element.setAttribute(eventName, '');
                isSupported = typeof element[eventName] === 'function';

                if (element[eventName] !== undefined) {
                    // If property was created, "remove it" by setting value to `undefined`.
                    element[eventName] = undefined;
                }
                element.removeAttribute(eventName);
            }

            return isSupported;
        }
        return inner;
    }());

    ModernizrProto.hasEvent = hasEvent;

    Modernizr.addTest('audio', function() {
        /* jshint -W053 */
        var elem = createElement('audio'),
            bool = false;

        try {
            bool = !!elem.canPlayType;

            if (bool) {
                bool = new Boolean(bool);
                bool.ogg = elem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, '');
                bool.mp3 = elem.canPlayType('audio/mpeg;').replace(/^no$/, '');
                bool.opus = elem.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, '');
                bool.wav = elem.canPlayType('audio/wav; codecs="1"').replace(/^no$/, '');
                bool.m4a = (elem.canPlayType('audio/x-m4a;') ||
                    elem.canPlayType('audio/aac;')).replace(/^no$/, '');
            }
        } catch (e) {}

        return bool;
    });

    Modernizr.addTest('contenteditable', function() {
        // early bail out
        if (!('contentEditable' in docElement)) {
            return false;
        }

        var div = createElement('div');

        div.contentEditable = true;
        return div.contentEditable === 'true';
    });

    Modernizr.addTest('video', function() {
        /* jshint -W053 */
        var elem = createElement('video'),
            bool = false;

        // IE9 Running on Windows Server SKU can cause an exception to be thrown, bug #224
        try {
            bool = !!elem.canPlayType;

            if (bool) {
                bool = new Boolean(bool);
                bool.ogg = elem.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, '');
                bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, '');
                bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, '');
                bool.vp9 = elem.canPlayType('video/webm; codecs="vp9"').replace(/^no$/, '');
                bool.hls = elem.canPlayType('application/x-mpegURL; codecs="avc1.42E01E"').replace(/^no$/, '');
            }
        } catch (e) {}

        return bool;
    });

    Modernizr.addTest('cssgradients', function() {

        var str1 = 'background-image:',
            str2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));',
            css = '',
            angle,
            i = 0,
            len,
            elem,
            style;

        for (i = 0, len = prefixes.length - 1; i < len; i += 1) {
            angle = (i === 0 ? 'to ' : '');
            css += str1 + prefixes[i] + 'linear-gradient(' + angle + 'left top, #9f9, white);';
        }

        if (Modernizr._config.usePrefixes) {
            // legacy webkit syntax (FIXME: remove when syntax not in use anymore)
            css += str1 + '-webkit-' + str2;
        }

        elem = createElement('a');
        style = elem.style;

        style.cssText = css;

        // IE6 returns undefined so cast to string
        return ('' + style.backgroundImage).indexOf('gradient') > -1;
    });

    Modernizr.addTest('csspointerevents', function () {
        var style = createElement('a').style;

        style.cssText = 'pointer-events:auto';
        return style.pointerEvents === 'auto';
    });

    Modernizr.addTest('formattribute', function() {
        var form = createElement('form'),
            input = createElement('input'),
            div = createElement('div'),
            id = 'formtest' + (new Date()).getTime(),
            attr,
            bool = false;

        form.id = id;

        //IE6/7 confuses the form idl attribute and the form content attribute, so we use document.createAttribute
        try {
            input.setAttribute('form', id);
        } catch (e) {
            if (document.createAttribute) {
                attr = document.createAttribute('form');
                attr.nodeValue = id;
                input.setAttributeNode(attr);
            }
        }

        div.appendChild(form);
        div.appendChild(input);

        docElement.appendChild(div);

        bool = form.elements && form.elements.length === 1 && input.form == form;

        div.parentNode.removeChild(div);
        return bool;
    });

    function getBody() {
        // After page load injecting a fake body doesn't work so check if body exists
        var body = document.body;

        if (!body) {
            // Can't use the real body create a fake one.
            body = createElement(isSVG ? 'svg' : 'body');
            body.fake = true;
        }

        return body;
    }

    domPrefixes = (ModernizrProto._config.usePrefixes ? omPrefixes.toLowerCase().split(' ') : []);

    ModernizrProto._domPrefixes = domPrefixes;

    Modernizr.addTest('pointerevents', function() {
        // Cannot use `.prefixed()` for events, so test each prefix
        var bool = false,
            i = domPrefixes.length;

        // Don't forget un-prefixed...
        bool = Modernizr.hasEvent('pointerdown');

        while (i-- && !bool) {
            if (hasEvent(domPrefixes[i] + 'pointerdown')) {
                bool = true;
            }
        }
        return bool;
    });

    function injectElementWithStyles(rule, callback, nodes, testnames) {
        var mod = 'modernizr',
            style,
            ret,
            node,
            docOverflow,
            div = createElement('div'),
            body = getBody(),
            oh;

        if (parseInt(nodes, 10)) {
            // In order not to give false positives we create a node for each test
            // This also allows the method to scale for unspecified uses
            while (nodes--) {
                node = createElement('div');
                node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
                div.appendChild(node);
            }
        }

        style = createElement('style');
        style.type = 'text/css';
        style.id = 's' + mod;

        // IE6 will false positive on some tests due to the style element inside the test div somehow interfering offsetHeight, so insert it into body or fakebody.
        // Opera will act all quirky when injecting elements in documentElement when page is served as xml, needs fakebody too. #270
        (!body.fake ? div : body).appendChild(style);
        body.appendChild(div);

        if (style.styleSheet) {
            style.styleSheet.cssText = rule;
        } else {
            style.appendChild(document.createTextNode(rule));
        }
        div.id = mod;

        if (body.fake) {
            //avoid crashing IE8, if background image is used
            body.style.background = '';
            //Safari 5.13/5.1.4 OSX stops loading if ::-webkit-scrollbar is used and scrollbars are visible
            body.style.overflow = 'hidden';
            docOverflow = docElement.style.overflow;
            docElement.style.overflow = 'hidden';
            docElement.appendChild(body);
        }

        ret = callback(div, rule);

        // If this is done after page load we don't want to remove the body so check if body exists
        if (body.fake) {
            body.parentNode.removeChild(body);
            docElement.style.overflow = docOverflow;
            // Trigger layout so kinetic scrolling isn't disabled in iOS6+
            oh = docElement.offsetHeight;
        } else {
            div.parentNode.removeChild(div);
        }

        return !!ret;
    }

    testStyles = ModernizrProto.testStyles = injectElementWithStyles;

    // Chrome (desktop) used to lie about its support on this, but that has since been rectified: http://crbug.com/36415
    Modernizr.addTest('touchevents', function() {
        var bool,
            query;

        if (('ontouchstart' in window) || (window.DocumentTouch && document instanceof DocumentTouch)) {
            bool = true;
        } else {
            query = ['@media (', prefixes.join('touch-enabled),('), 'heartz', ')', '{#modernizr{top:9px;position:absolute}}'].join('');
            testStyles(query, function(node) {
                bool = node.offsetTop === 9;
            });
        }
        return bool;
    });

    Modernizr.addTest('formvalidation', function() {
        var form = createElement('form'),
            invalidFired = false,
            input;

        if (!('checkValidity' in form) || !('addEventListener' in form)) {
            return false;
        }
        if ('reportValidity' in form) {
            return true;
        }

        Modernizr.formvalidationapi = true;

        // Prevent form from being submitted
        form.addEventListener('submit', function(e) {
            // Old Presto based Opera does not validate form, if submit is prevented
            // although Opera Mini servers use newer Presto.
            if (!window.opera || window.operamini) {
                e.preventDefault();
            }
            e.stopPropagation();
        }, false);

        // Calling form.submit() doesn't trigger interactive validation,
        // use a submit button instead
        //older opera browsers need a name attribute
        form.innerHTML = '<input name="modTest" required><button></button>';

        testStyles('#modernizr form{position:absolute;top:-99999em}', function(node) {
            node.appendChild(form);

            input = form.getElementsByTagName('input')[0];

            // Record whether "invalid" event is fired
            input.addEventListener('invalid', function(e) {
                invalidFired = true;
                e.preventDefault();
                e.stopPropagation();
            }, false);

            //Opera does not fully support the validationMessage property
            Modernizr.formvalidationmessage = !!input.validationMessage;

            // Submit form by clicking submit button
            form.getElementsByTagName('button')[0].click();
        });

        return invalidFired;
    });

    Modernizr.inputtypes = (function(props) {
        var i = 0,
            len = props.length,
            smile = ':)',
            inputElemType,
            defaultView,
            bool;

        for (i = 0; i < len; i += 1) {

            inputElem.setAttribute('type', inputElemType = props[i]);
            bool = inputElem.type !== 'text' && 'style' in inputElem;

            // We first check to see if the type we give it sticks..
            // If the type does, we feed it a textual value, which shouldn't be valid.
            // If the value doesn't stick, we know there's input sanitization which infers a custom UI
            if (bool) {

                inputElem.value = smile;
                inputElem.style.cssText = 'position:absolute;visibility:hidden;';

                if (/^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined) {

                    docElement.appendChild(inputElem);
                    defaultView = document.defaultView;

                    // Safari 2-4 allows the smiley as a value, despite making a slider
                    bool = defaultView.getComputedStyle &&
                        defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== 'textfield' &&
                        // Mobile android web browser has false positive, so must
                        // check the height to see if the widget is actually there.
                        (inputElem.offsetHeight !== 0);

                    docElement.removeChild(inputElem);

                } else if (/^(search|tel)$/.test(inputElemType)) {
                    // Spec doesn't define any special parsing or detectable UI
                    //   behaviors so we pass these through as true

                    // Interestingly, opera fails the earlier test, so it doesn't
                    //  even make it here.

                } else if (/^(url|email|number)$/.test(inputElemType)) {
                    // Real url and email support comes with prebaked validation.
                    bool = inputElem.checkValidity && inputElem.checkValidity() === false;

                } else {
                    // If the upgraded input compontent rejects the :) text, we got a winner
                    bool = inputElem.value !== smile;
                }
            }

            inputs[props[i]] = !!bool;
        }
        return inputs;

    }(inputtypes));

    Modernizr.addTest('localizednumber', function() {
        // this extends our testing of input[type=number], so bomb out if that's missing
        if (!Modernizr.inputtypes.number) {
            return false;
        }
        // we rely on checkValidity later, so bomb out early if we don't have it
        if (!Modernizr.formvalidation) {
            return false;
        }

        var el = createElement('div'),
            diff,
            body = getBody(),
            root = (function() {
                return docElement.insertBefore(body, docElement.firstElementChild || docElement.firstChild);
            }()),
            input;

        el.innerHTML = '<input type="number" value="1.0" step="0.1"/>';

        input = el.childNodes[0];
        root.appendChild(el);
        input.focus();

        try {
            document.execCommand('InsertText', false, '1,1');
        } catch (e) {
            // prevent warnings in IE
        }

        diff = input.type === 'number' && input.valueAsNumber === 1.1 && input.checkValidity();
        root.removeChild(el);
        body.fake && root.parentNode.removeChild(root);

        return diff;
    });

    cssomPrefixes = (ModernizrProto._config.usePrefixes ? omPrefixes.split(' ') : []);

    ModernizrProto._cssomPrefixes = cssomPrefixes;

    function contains(str, substr) {
        return !!~('' + str).indexOf(substr);
    }

    function cssToDOM(name) {
        return name.replace(/([a-z])-([a-z])/g, function(str, m1, m2) {
            return m1 + m2.toUpperCase();
        }).replace(/^-/, '');
    }

    function fnBind(fn, that) {
        return function() {
            return fn.apply(that, arguments);
        };
    }

    function testDOMProps(props, obj, elem) {
        var item,
            pro;

        for (pro in props) {
            if (props[pro] in obj) {

                // return the property name as a string
                if (elem === false) {
                    return props[pro];
                }

                item = obj[props[pro]];

                // let's bind a function
                if (is(item, 'function')) {
                    // bind to obj unless overriden
                    return fnBind(item, elem || obj);
                }

                // return the unbound function or obj or value
                return item;
            }
        }
        return false;
    }

    modElem = {
        elem: createElement('modernizr')
    };

    // Clean up this element
    Modernizr._q.push(function() {
        delete modElem.elem;
    });

    mStyle = {
        style: modElem.elem.style
    };

    // kill ref for gc, must happen before mod.elem is removed, so we unshift on to
    // the front of the queue.
    Modernizr._q.unshift(function() {
        delete mStyle.style;
    });

    function domToCSS(name) {
        return name.replace(/([A-Z])/g, function(str, m1) {
            return '-' + m1.toLowerCase();
        }).replace(/^ms-/, '-ms-');
    }

    function nativeTestProps(props, value) {
        var i = props.length,
            conditionText = [];

        // Start with the JS API: http://www.w3.org/TR/css3-conditional/#the-css-interface
        if ('CSS' in window && 'supports' in window.CSS) {
            // Try every prefixed variant of the property
            while (i--) {
                if (window.CSS.supports(domToCSS(props[i]), value)) {
                    return true;
                }
            }
            return false;
        }
        // Otherwise fall back to at-rule (for Opera 12.x)
        else if ('CSSSupportsRule' in window) {
            // Build a condition string for every prefixed variant
            while (i--) {
                conditionText.push('(' + domToCSS(props[i]) + ':' + value + ')');
            }

            conditionText = conditionText.join(' or ');

            return injectElementWithStyles('@supports (' + conditionText + ') { #modernizr { position: absolute; } }', function(node) {
                return getComputedStyle(node, null).position === 'absolute';
            });
        }
        return undefined;
    }

    function testProps(props, prefixed, value, skipValueTest) {

        skipValueTest = is(skipValueTest, 'undefined') ? false : skipValueTest;

        var result,
            afterInit,
            elems = ['modernizr', 'tspan'],
            i = 0,
            propsLength,
            prop,
            before;

        // Try native detect first
        if (!is(value, 'undefined')) {
            result = nativeTestProps(props, value);

            if (!is(result, 'undefined')) {
                return result;
            }
        }

        while (!mStyle.style) {
            afterInit = true;
            mStyle.modElem = createElement(elems.shift());
            mStyle.style = mStyle.modElem.style;
        }

        // Delete the objects if we created them.
        function cleanElems() {
            if (afterInit) {
                delete mStyle.style;
                delete mStyle.modElem;
            }
        }

        propsLength = props.length;

        for (i = 0; i < propsLength; i += 1) {

            prop = props[i];
            before = mStyle.style[prop];

            if (contains(prop, '-')) {
                prop = cssToDOM(prop);
            }

            if (mStyle.style[prop] !== undefined) {

                // If value to test has been passed in, do a set-and-check test.
                // 0 (integer) is a valid property value, so check that `value` isn't
                // undefined, rather than just checking it's truthy.
                if (!skipValueTest && !is(value, 'undefined')) {

                    // Needs a try catch block because of old IE. This is slow, but will
                    // be avoided in most cases because `skipValueTest` will be used.
                    try {
                        mStyle.style[prop] = value;
                    } catch (e) {}

                    // If the property value has changed, we assume the value used is
                    // supported. If `value` is empty string, it'll fail here (because
                    // it hasn't changed), which matches how browsers have implemented
                    // CSS.supports()
                    if (mStyle.style[prop] != before) {
                        cleanElems();
                        return prefixed === 'pfx' ? prop : true;
                    }
                }
                // Otherwise just return true, or the property name if this is a
                // `prefixed()` call
                else {
                    cleanElems();
                    return prefixed === 'pfx' ? prop : true;
                }
            }
        }
        cleanElems();
        return false;
    }

    function testPropsAll(prop, prefixed, elem, value, skipValueTest) {
        var ucProp = prop.charAt(0).toUpperCase() + prop.slice(1),
            props = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

        // did they call .prefixed('boxSizing') or are we just testing a prop?
        if (is(prefixed, 'string') || is(prefixed, 'undefined')) {
            return testProps(props, prefixed, value, skipValueTest);
        }

        // otherwise, they called .prefixed('requestAnimationFrame', window[, elem])
        props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
        return testDOMProps(props, prefixed, elem);
    }

    ModernizrProto.testAllProps = testPropsAll;

    function testAllProps(prop, value, skipValueTest) {
        return testPropsAll(prop, undefined, undefined, value, skipValueTest);
    }

    ModernizrProto.testAllProps = testAllProps;

    Modernizr.addTest('cssanimations', testAllProps('animationName', 'a', true));

    Modernizr.addTest('overflowscrolling', testAllProps('overflowScrolling', 'touch', true));

	Modernizr.addTest('boxshadow', testAllProps('boxShadow', '1px 1px', true));

    Modernizr.addTest('csstransforms', function() {
        // Android < 3.0 is buggy, so we sniff and blacklist
        // http://git.io/hHzL7w
        return navigator.userAgent.indexOf('Android 2.') === -1 &&
            testAllProps('transform', 'scale(1)', true);
    });

    Modernizr.addTest('csstransforms3d', function() {
        var ret = !!testAllProps('perspective', '1px', true),
            usePrefix = Modernizr._config.usePrefixes,
            mq,
            defaultStyle = '#modernizr{width:0;height:0}';

        if (ret && (!usePrefix || 'webkitPerspective' in docElement.style)) {

            // Use CSS Conditional Rules if available
            if (Modernizr.supports) {
                mq = '@supports (perspective: 1px)';
            } else {
                // Otherwise, Webkit allows this media query to succeed only if the feature is enabled.
                // `@media (transform-3d),(-webkit-transform-3d){ ... }`
                mq = '@media (transform-3d)';
                if (usePrefix) {
                    mq += ',(-webkit-transform-3d)';
                }
            }

            mq += '{#modernizr{width:7px;height:18px;margin:0;padding:0;border:0}}';

            testStyles(defaultStyle + mq, function(elem) {
                ret = elem.offsetWidth === 7 && elem.offsetHeight === 18;
            });
        }

        return ret;
    });

    Modernizr.addTest('csstransitions', testAllProps('transition', 'all', true));

    // Run each test
    testRunner();

    delete ModernizrProto.addTest;
    delete ModernizrProto.addAsyncTest;

    // Run the things that are supposed to run after the tests
    for (i = 0; i < Modernizr._q.length; i += 1) {
        Modernizr._q[i]();
    }

    // Leak Modernizr namespace
    window.Modernizr = Modernizr;

	msos.console.debug('msos/base -> Modernizr.js now available.');

}(window, document));


// Copyright 2014 Wisembly and contributors
// https://github.com/Wisembly/basil.js

(function () {
    // Basil
    var Basil = function (options) {

        return _.extend(
			{},
			Basil.plugins,
			new Basil.Storage().init(options)
		);
    };

    // Version
    Basil.version = '0.4.2';

    // Utils
    Basil.utils = {
        each: function (obj, fnIterator, context) {
            if (_.isArray(obj)) {
                for (var i = 0; i < obj.length; i++)
                    if (fnIterator.call(context, obj[i], i) === false) return;
            } else if (obj) {
                for (var key in obj)
                    if (fnIterator.call(context, obj[key], key) === false) return;
            }
        },
        tryEach: function (obj, fnIterator, fnError, context) {
            this.each(
				obj,
				function (value, key) {
					try {
						return fnIterator.call(context, value, key);
					} catch (error) {
						if (_.isFunction(fnError)) {
							try {
								fnError.call(context, value, key, error);
							} catch (error) {
								msos.console.error('msos/base - Basil.tryEach -> failed:', error);
							}
						}
					}
					return undefined;
				},
				this
			);
        },
        registerPlugin: function (methods) {
            Basil.plugins = _.extend(methods, Basil.plugins);
        }
    };

    // Plugins
    Basil.plugins = {};

    // Options
    Basil.options = _.extend({
        namespace: 'msos_b45i1',
        storages: ['local', 'cookie', 'session', 'memory'],
        expireDays: 31
    }, window.Basil ? window.Basil.options : {});

    // Storage
    Basil.Storage = function () {
        var _salt = 'b45i1' + (Math.random() + 1)
            .toString(36)
            .substring(7),
            _storages = {},
            _toStoragesArray = function (storages) {
                if (_.isArray(storages))
                    return storages;
                return _.isString(storages) ? [storages] : [];
            },
            _toStoredKey = function (namespace, path) {
                var key = '';
                if (_.isString(path) && path.length)
                    path = [path];
                if (_.isArray(path) && path.length)
                    key = path.join(':');
                return key && namespace ? namespace + ':' + key : key;
            },
            _toKeyName = function (namespace, key) {
                if (!namespace)
                    return key;
                return key.replace(new RegExp('^' + namespace + ':'), '');
            },
            _toStoredValue = function (value) {
                return JSON.stringify(value);
            },
            _fromStoredValue = function (value) {
                return value ? JSON.parse(value) : null;
            };

        // HTML5 web storage interface
        var webStorageInterface = {
            engine: null,
            check: function () {
                try {
                    window[this.engine].setItem(_salt, true);
                    window[this.engine].removeItem(_salt);
                } catch (e) {
					msos.console.warn('msos/base - Basil.check -> response:', e);
                    return false;
                }
                return true;
            },
            set: function (key, value, options) {
                if (!key)
                    throw Error('invalid key');
                window[this.engine].setItem(key, value);
            },
            get: function (key) {
                return window[this.engine].getItem(key);
            },
            remove: function (key) {
                window[this.engine].removeItem(key);
            },
            reset: function (namespace) {
                for (var i = 0, key; i < window[this.engine].length; i++) {
                    key = window[this.engine].key(i);
                    if (!namespace || key.indexOf(namespace) === 0) {
                        this.remove(key);
                        i--;
                    }
                }
            },
            keys: function (namespace) {
                var keys = [];
                for (var i = 0, key; i < window[this.engine].length; i++) {
                    key = window[this.engine].key(i);
                    if (!namespace || key.indexOf(namespace) === 0)
                        keys.push(_toKeyName(namespace, key));
                }
                return keys;
            }
        };

        // local storage
        _storages.local = _.extend({}, webStorageInterface, {
            engine: 'localStorage'
        });
        // session storage
        _storages.session = _.extend({}, webStorageInterface, {
            engine: 'sessionStorage'
        });

        // memory storage
        _storages.memory = {
            _hash: {},
            check: function () {
                return true;
            },
            set: function (key, value, options) {
                if (!key)
                    throw Error('invalid key');
                this._hash[key] = value;
            },
            get: function (key) {
                return this._hash[key] || null;
            },
            remove: function (key) {
                delete this._hash[key];
            },
            reset: function (namespace) {
                for (var key in this._hash) {
                    if (!namespace || key.indexOf(namespace) === 0)
                        this.remove(key);
                }
            },
            keys: function (namespace) {
                var keys = [];
                for (var key in this._hash)
                    if (!namespace || key.indexOf(namespace) === 0)
                        keys.push(_toKeyName(namespace, key));
                return keys;
            }
        };

        // cookie storage
        _storages.cookie = {
            check: function () {
                return navigator.cookieEnabled;
            },
            set: function (key, value, options) {
                if (!this.check())
                    throw Error('cookies are disabled');
                options = options || {};
                if (!key)
                    throw Error('invalid key');
                var cookie = encodeURIComponent(key) + '=' + encodeURIComponent(value);
                // handle expiration days
                if (options.expireDays) {
                    var date = new Date();
                    date.setTime(date.getTime() + (options.expireDays * 24 * 60 * 60 * 1000));
                    cookie += '; expires=' + date.toGMTString();
                }
                // handle domain
                if (options.domain && options.domain !== document.domain) {
                    var _domain = options.domain.replace(/^\./, '');
                    if (document.domain.indexOf(_domain) === -1 || _domain.split('.').length <= 1)
                        throw Error('invalid domain');
                    cookie += '; domain=' + options.domain;
                }
                // handle secure
                if (options.secure === true) {
                    cookie += '; secure';
                }
                document.cookie = cookie + '; path=/';
            },
            get: function (key) {
                if (!this.check())
                    throw Error('cookies are disabled');
                var encodedKey = encodeURIComponent(key);
                var cookies = document.cookie ? document.cookie.split(';') : [];
                // retrieve last updated cookie first
                for (var i = cookies.length - 1, cookie; i >= 0; i--) {
                    cookie = cookies[i].replace(/^\s*/, '');
                    if (cookie.indexOf(encodedKey + '=') === 0)
                        return decodeURIComponent(cookie.substring(encodedKey.length + 1, cookie.length));
                }
                return null;
            },
            remove: function (key) {
                // remove cookie from main domain
                this.set(key, '', {
                    expireDays: -1
                });
                // remove cookie from upper domains
                var domainParts = document.domain.split('.');
                for (var i = domainParts.length; i >= 0; i--) {
                    this.set(key, '', {
                        expireDays: -1,
                        domain: '.' + domainParts.slice(-i).join('.')
                    });
                }
            },
            reset: function (namespace) {
                var cookies = document.cookie ? document.cookie.split(';') : [];
                for (var i = 0, cookie, key; i < cookies.length; i++) {
                    cookie = cookies[i].replace(/^\s*/, '');
                    key = cookie.substr(0, cookie.indexOf('='));
                    if (!namespace || key.indexOf(namespace) === 0)
                        this.remove(key);
                }
            },
            keys: function (namespace) {
                if (!this.check())
                    throw Error('cookies are disabled');
                var keys = [],
                    cookies = document.cookie ? document.cookie.split(';') : [];
                for (var i = 0, cookie, key; i < cookies.length; i++) {
                    cookie = cookies[i].replace(/^\s*/, '');
                    key = decodeURIComponent(cookie.substr(0, cookie.indexOf('=')));
                    if (!namespace || key.indexOf(namespace) === 0)
                        keys.push(_toKeyName(namespace, key));
                }
                return keys;
            }
        };

        return {
            init: function (options) {
                this.setOptions(options);
                return this;
            },
            setOptions: function (options) {
                this.options = _.extend({}, this.options || Basil.options, options);
            },
            support: function (storage) {
                return _storages.hasOwnProperty(storage);
            },
            check: function (storage) {
                if (this.support(storage))
                    return _storages[storage].check();
                return false;
            },
            set: function (key, value, options) {
				if (msos.config.verbose) {
					msos.console.debug('msos/base - Basil.set -> called, key: ' + key);
				}
                options = _.extend({}, this.options, options);
                if (!(key = _toStoredKey(options.namespace, key)))
                    return false;
                value = options.raw === true ? value : _toStoredValue(value);
                var where = null;
                // try to set key/value in first available storage
                Basil.utils.tryEach(_toStoragesArray(options.storages), function (storage, index) {
                    _storages[storage].set(key, value, options);
                    where = storage;
                    return false; // break;
                }, null, this);
                if (!where) {
                    // key has not been set anywhere
                    return false;
                }
                // remove key from all other storages
                Basil.utils.tryEach(_toStoragesArray(options.storages), function (storage, index) {
                    if (storage !== where)
                        _storages[storage].remove(key);
                }, null, this);
                return true;
            },
            get: function (key, options) {
				if (msos.config.verbose) {
					msos.console.debug('msos/base - Basil.get -> start, key: ' + key);
				}
                options = _.extend({}, this.options, options);
                if (!(key = _toStoredKey(options.namespace, key)))
                    return null;
                var value = null;
                Basil.utils.tryEach(
					_toStoragesArray(options.storages),
					function (storage, index) {
						if (value !== null)
							return false; // break if a value has already been found.
						value = _storages[storage].get(key, options) || null;
						value = options.raw === true ? value : _fromStoredValue(value);
						return true;
					},
					function (storage, index, error) {
						value = null;
					},
					this
				);

				if (msos.config.verbose) {
					msos.console.debug('msos/base - Basil.get ->  done, key: ' + key + ', value:', value);
				}
                return value;
            },
            remove: function (key, options) {
				if (msos.config.verbose) {
					msos.console.debug('msos/base - Basil.remove -> called, key: ' + key);
				}
                options = _.extend({}, this.options, options);
                if (!(key = _toStoredKey(options.namespace, key)))
                    return;
                Basil.utils.tryEach(_toStoragesArray(options.storages), function (storage) {
                    _storages[storage].remove(key);
                }, null, this);
            },
            reset: function (options) {
				if (msos.config.verbose) {
					msos.console.debug('msos/base - Basil.reset -> called.');
				}
                options = _.extend({}, this.options, options);
                Basil.utils.tryEach(_toStoragesArray(options.storages), function (storage) {
                    _storages[storage].reset(options.namespace);
                }, null, this);
            },
            keys: function (options) {
                options = options || {};
                var keys = [];
                for (var key in this.keysMap(options))
                    keys.push(key);
                return keys;
            },
            keysMap: function (options) {
                options = _.extend({}, this.options, options);
                var map = {};
                Basil.utils.tryEach(_toStoragesArray(options.storages), function (storage) {
                    Basil.utils.each(_storages[storage].keys(options.namespace), function (key) {
                        map[key] = _.isArray(map[key]) ? map[key] : [];
                        map[key].push(storage);
                    }, this);
                }, null, this);
                return map;
            }
        };
    };

    // Access to native storages, without namespace or basil value decoration
    Basil.memory = new Basil.Storage().init({
        storages: 'memory',
        namespace: null,
        raw: true
    });
    Basil.cookie = new Basil.Storage().init({
        storages: 'cookie',
        namespace: null,
        raw: true
    });
    Basil.localStorage = new Basil.Storage().init({
        storages: 'local',
        namespace: null,
        raw: true
    });
    Basil.sessionStorage = new Basil.Storage().init({
        storages: 'session',
        namespace: null,
        raw: true
    });

    // browser export
    window.Basil = Basil;

	msos.console.debug('msos/base -> basil.js now available.');
}());


// Generate our new Basil object
msos.basil = new window.Basil();

// Clear storage for testing, debugging
if (msos.config.clear_storage) { msos.basil.reset(); }

if (msos.config.verbose) {
	msos.console.debug('msos/base -> storage availability,\n        cookies: ' + msos.basil.check('cookie') + ',\n   localStorage: ' + msos.basil.check('local') + ',\n sessionStorage: ' + msos.basil.check('session'));

	msos.basil.get('last_script_exec');
	msos.basil.set('last_script_exec', (new Date()));
}


// Copyright (C) 2012 Ryan Van Etten

(function (root, name, make) {
    "use strict";
    root[name] = make();
}(msos, 'verge', function () {
    "use strict";

    var xports = {},
        win = window !== undefined && window,
        doc = document !== undefined && document,
        docElem = doc && doc.documentElement,
        matchMedia = win.matchMedia || win.msMatchMedia,
        mq = matchMedia ? function (q) {
            return !!matchMedia.call(win, q).matches;
        } : function () {
            return false;
        };

    xports.viewportW = function () {
        var a = docElem.clientWidth,
            b = win.innerWidth;
        return a < b ? b : a;
    };

    xports.viewportH = function () {
        var a = docElem.clientHeight,
            b = win.innerHeight;
        return a < b ? b : a;
    };

    xports.mq = mq;

    xports.matchMedia = matchMedia ? function () {
        // matchMedia must be bound to window
        return matchMedia.apply(win, arguments);
    } : function () {
        // Gracefully degrade to plain object
        return {};
    };

    xports.viewport = function () {
        return {
            'width': xports.viewportW(),
            'height': xports.viewportH()
        };
    };

    xports.scrollX = function () {
        return win.pageXOffset || docElem.scrollLeft;
    };

    xports.scrollY = function () {
        return win.pageYOffset || docElem.scrollTop;
    };

    function calibrate(coords, cushion) {
        var o = {};

        cushion = +cushion || 0;

        o.right =  coords.right  + cushion;
        o.left =   coords.left   - cushion;
        o.bottom = coords.bottom + cushion;
        o.top =    coords.top    - cushion;

        o.width = o.right - o.left;
        o.height = o.bottom - o.top;

        return o;
    }

    xports.rectangle = function (el, cushion) {
        el = el && !el.nodeType ? el[0] : el;
        if (!el || 1 !== el.nodeType) { return false; }
        return calibrate(el.getBoundingClientRect(), cushion);
    };

    xports.aspect = function (o) {
        o = o === undefined ? xports.viewport() : 1 === o.nodeType ? xports.rectangle(o) : o;

        var h = o.height,
            w = o.width;

        h = typeof h === 'function' ? h.call(o) : h;
        w = typeof w === 'function' ? w.call(o) : w;

        return w / h;
    };

    xports.inX = function (el, cushion) {
        var r = xports.rectangle(el, cushion);
        return !!r && r.right >= 0 && r.left <= xports.viewportW();
    };

    xports.inY = function (el, cushion) {
        var r = xports.rectangle(el, cushion);
        return !!r && r.bottom >= 0 && r.top <= xports.viewportH();
    };

    xports.inViewport = function (el, cushion) {
        var r = xports.rectangle(el, cushion);
        return !!r && r.bottom >= 0 && r.right >= 0 && r.top <= xports.viewportH() && r.left <= xports.viewportW();
    };

    return xports;
}));


// *******************************************
// Script Basics (No jQuery, Backbone.js)
// *******************************************

// Sort 'size_wide' object into consistent 'size_array' for resizeable displays
_.keys(msos.config.size_wide).map(
		function (k) {
			return [k, msos.config.size_wide[k]];
		}
	).sort(
		function (a, b) {
			if (a[1] < b[1]) return -1;
			if (a[1] > b[1]) return  1;
			return 0;
		}
	).forEach(
		function (d) {
			msos.config.size_array.push(d[0]);
		}
	);


// --------------------------
// MSOS Helper Functions
// --------------------------
msos.var_is_null = function (variable) {
    "use strict";

    if (variable === undefined)	{ return true;  }
    if (variable === null)		{ return true;  }
    return false;
};

msos.var_is_empty = function (variable) {
    "use strict";

    if (msos.var_is_null(variable))	{ return true;  }
    if (variable === '')			{ return true;  }
	return false;
};

msos.do_nothing = function (evt) {
    'use strict';

    evt.preventDefault();
    evt.stopPropagation();
};

msos.do_abs_nothing = function (evt) {
    'use strict';

    evt.preventDefault();
    evt.stopImmediatePropagation();
};

msos.new_time = function () {
	"use strict";
	return (new Date()).getTime();
};

msos.set_version = function (mjr, mnr, pth) {
	"use strict";

	var self = this;

	self = {			// loosely translates to:
		major: mjr,		// year
		minor: mnr,		// month
		patch: pth,		// day
		toString: function () {
			return 'v' + self.major + '.' + self.minor + '.' + self.patch;
		}
	};

	return self;
};

msos.gen_namespace = function (b) {
	"use strict";

	var a = window,
		c = 0;

	b = b.split('.');

	for (c = 0; c < b.length; c += 1) {
		a = a[b[c]] || (a[b[c]] = {});
	}

	return a;
};

msos.generate_url_name = function (url) {
	"use strict";

	var path,
		parts = [],
		name = '';

	path = msos.purl(url).attr('path');

	parts = path.split('/');

	// Remove first two "commom" elements and clean up for use as key
	name = parts.slice(2).join(':');
	name = name.replace(/[^0-9a-zA-Z]/g, '_');

	return name;
};

msos.run_function_array = function (name) {
	"use strict";

	var temp_fa = 'msos.run_func_array -> ',
		m = 0;

	name = name || 'missing';

	msos.console.debug(temp_fa + 'start: ' + name);

	if (!msos[name] || !(_.isArray(msos[name]))) {
		msos.console.error(temp_fa + 'for: ' + name + ', failed.');
		return;
	}

	for (m = 0; m < msos[name].length; m += 1) {

		if (msos.config.debug) {

			msos.console.debug(temp_fa + 'index: ' + m + ', for: ' + name);

			try {
				msos[name][m]();
			} catch (e) {
				msos.console.error(temp_fa + 'for: ' + name, e);
			}
		} else {
			msos[name][m]();
		}
	}

	// Clear all functions
	msos[name] = [];

	msos.console.debug(temp_fa + ' done: ' + name);
};

// --------------------------
// Apply Resource (relative) Locations
// --------------------------
msos.resource_url = function (folder, resource_file) {
    "use strict";
    // Always relative to 'msos' folder
    return msos.base_script_url.replace(/\/msos\//, '/' + (folder ? folder + '/' : '')) + resource_file;
};

msos.set_locale = function () {
	"use strict";

	var temp_gl = 'msos.set_locale -> ',
		cfg = msos.config,
		store_obj = cfg.storage.site_i18n,
		store_array = [];

    if (store_obj.value) { store_array = store_obj.value.split(':'); }

	msos.console.debug(temp_gl + 'start, stored local: ' + (store_obj.value || 'na'));

    // Check user input, then stored, then browser or default value
    cfg.locale =   cfg.query.locale		|| store_array[0] || cfg.locale		|| msos.default_locale;
    cfg.culture =  cfg.query.culture	|| store_array[1] || cfg.culture	|| cfg.locale;
    cfg.calendar = cfg.query.calendar	|| store_array[2] || cfg.calendar;

	msos.console.debug(temp_gl + ' done, locale: ' + cfg.locale + ', culture: ' + cfg.culture + ', calendar: ' + cfg.calendar);
};

msos.set_locale_storage = function () {
	"use strict";

	var temp_sl = 'msos.set_locale_storage -> ',
		store_obj = msos.config.storage.site_i18n;

	msos.console.debug(temp_sl + 'start.');

    store_obj.value = msos.config.locale + ':' + msos.config.culture + ':' + msos.config.calendar;

	msos.basil.set(store_obj.name, store_obj.value);

	msos.console.debug(temp_sl + 'done, value: ' + store_obj.value );
    store_obj.set = true;
};


// --------------------------
// Browser detection & testing
// --------------------------
msos.get_viewport = function (for_win) {
    "use strict";

    var port = msos.verge.viewport();

    if (window === for_win) { msos.config.view_port = port; }

    msos.console.debug('msos.get_viewport -> viewport:', port);
    return port;
};

msos.browser_orientation = function () {
    "use strict";

    var orient_ref = msos.config.view_orientation,
		v_port_ref = msos.get_viewport(window),
		temp_txt = 'msos.browser_orientation -> ';

    if (window.orientation !== undefined) {
		switch (window.orientation) {
			case 0:
				orient_ref.layout = "portrait";
				orient_ref.direction = 'normal';
				orient_ref.numeric = 0;
			break;
			case -90:
				orient_ref.layout = "landscape";
				orient_ref.direction = 'right';
				orient_ref.numeric = -90;
			break;
			case 90:
				orient_ref.layout = "landscape";
				orient_ref.direction = 'left';
				orient_ref.numeric = 90;
			break;
			case 180:
				orient_ref.layout = "portrait";
				orient_ref.direction = 'flipped';
				orient_ref.numeric = 180;
			break;
			default:
				orient_ref.layout = v_port_ref.width / v_port_ref.height < 1.1 ? "portrait" : "landscape";
				orient_ref.direction = 'normal';
				orient_ref.numeric = v_port_ref.width / v_port_ref.height < 1.1 ? 0 : 90;
		}
		orient_ref.method = 'window.orientation(' + window.orientation + ')';
    } else {
		orient_ref.layout = v_port_ref.width / v_port_ref.height < 1.1 ? "portrait" : "landscape";
		orient_ref.direction = 'normal';
		orient_ref.method = 'document.documentElement';
		orient_ref.numeric = v_port_ref.width / v_port_ref.height < 1.1 ? 0 : 90;
      }

    msos.console.debug(temp_txt + 'layout: ' + orient_ref.layout + ', dir: ' + orient_ref.direction + ' for ' + orient_ref.method);

    return orient_ref;
};

msos.browser_ok = function () {
    "use strict";

    var temp_txt = 'msos.browser_ok -> ',
		failed = [];

	// Absolute minimum requirements...more may be needed for jQuery 2.x.x
    if (!window.focus)              { failed.push('window.focus'); }
    if (!document.images)           { failed.push('document.images'); }
    if (!document.styleSheets)      { failed.push('document.styleSheets'); }
    if (!document.open)             { failed.push('document.open'); }
    if (!document.close)            { failed.push('document.close'); }
    if (!window.document.write)     { failed.push('document.write'); }
	if (!document.addEventListener) { failed.push('document.addEventListener'); }	// Looking at you IE...

    if (failed.length === 0) {
        msos.console.debug(temp_txt + 'browser is ok');
		msos.config.browser.ok = true;
        return;
    }

    msos.console.error(temp_txt + 'browser failed, does not support: ' + failed.join(', '));
    msos.config.browser.ok = false;
};

msos.browser_current = function () {
    "use strict";

    var temp_txt = 'msos.browser_current -> ',
		failed = [];

	// Hoped for features
	if (!Array.prototype.indexOf)	{ failed.push('Array.indexOf'); }
    if (!Array.prototype.forEach)	{ failed.push('Array.forEach'); }
	if (!String.prototype.indexOf)	{ failed.push('String.indexOf'); }
    if (!String.prototype.trim)		{ failed.push('String.trim'); }                
    if (!Function.prototype.bind)	{ failed.push('Function.bind'); }
    if (!Object.keys)				{ failed.push('Object.keys'); }
    if (!Object.create)				{ failed.push('Object.create'); }
    if (!JSON || !JSON.stringify || !JSON.stringify.length || JSON.stringify.length < 3) {
		failed.push('JSON.stringify');
	}

    if (failed.length === 0) {
        msos.console.debug(temp_txt + 'browser is current');
		msos.config.browser.current = true;
        return;
    }

    msos.console.warn(temp_txt + 'browser does not support: ' + failed.join(', ') + ' -> for doctype ' + msos.config.doctype);
    if (msos.config.doctype === 'xhtml5' && failed[2] === 'document.write') {
		msos.config.browser.current = true;
		return;
	}

    msos.console.error(temp_txt + 'browser is not current');
    msos.config.browser.current = false;
};

msos.browser_touch = function () {
    "use strict";

    var temp_tch = 'msos.browser_touch -> ',
		test = '',
		test_div = document.createElement('div'),
		touch_avail = 0;

    // Is touch capability showing up?
    for (test in msos.config.touch) {
		if (msos.config.touch.hasOwnProperty(test)) {
			if (msos.config.touch[test] === true)	{ touch_avail += 1; }
			else									{ touch_avail -= 1; }
		}
    }

    // Try creating or adding an event
    try {
		document.createEvent("TouchEvent");
		touch_avail += 1;
    } catch (e) {
		touch_avail -= 1;
      }

    if ("ontouchstart" in test_div) {
		touch_avail += 1;
    }

    test_div = null;

    if (touch_avail > 0) { msos.config.browser.touch = true; }

	if (Modernizr.touchevents !== msos.config.browser.touch) {
		msos.console.warn(temp_tch + 'Modernizr.touchevents returned: ' + Modernizr.touchevents);
	}

    msos.console.debug(temp_tch + 'touch is ' + (msos.config.browser.touch ? '' : 'not') + ' available, ref. (' + String(touch_avail) + ')');
};

msos.browser_mobile = function () {
    "use strict";

    var temp_mbl = 'msos.browser_mobile -> ',
		scrn_px = 0,
		flag = [];

    // Screen width (available)
    if (!msos.var_is_empty(screen.height) && !msos.var_is_empty(screen.width)) {
		scrn_px = (screen.height > screen.width) ? screen.height : screen.width;
    }

    // Probably mobile
    if (scrn_px && scrn_px < 481)	{ flag.push('screen'); }
    if (msos.config.browser.touch)	{ flag.push('touch'); }

    // Most likely
    if (msos.config.orientation)		{ flag.push('orientation'); }
    if (msos.config.orientation_change)	{ flag.push('orientation_change'); }
    if (msos.config.pixel_ratio > 1)	{ flag.push('pixel_ratio'); }
	if (Modernizr.devicemotion)			{ flag.push('device_motion'); }
	if (Modernizr.deviceorientation)	{ flag.push('device_orientation'); }
	if (Modernizr.overflowscrolling)	{ flag.push('overflow_scrolling'); }

    if (flag.length > 3) {
		msos.config.browser.mobile = true;
		msos.config.mobile = true;
    }

    msos.console.debug(temp_mbl + 'browser is ' + (msos.config.browser.mobile ? 'mobile' : 'not mobile') + (flag.length > 0 ? ', flag(s): ' + flag.join(', ') : ''));
    
    if (msos.config.query.mobile === true || msos.config.query.mobile === false) {
		if (msos.config.browser.mobile !== msos.config.query.mobile) {
			msos.console.debug(temp_mbl + 'force mobile setting: ' + msos.config.query.mobile);
		}
		msos.config.mobile = msos.config.query.mobile ? true : false;
    }
};

msos.browser_advanced = function () {
    "use strict";

    var temp_txt = 'msos.browser_advanced -> ',
		M = Modernizr,
		failed = [];

	if (!M.cssgradients)	{ failed.push('cssgradients'); }
	if (!M.boxshadow)		{ failed.push('boxshadow'); }
	if (!M.csstransitions)	{ failed.push('csstransitions'); }
	if (!M.csstransforms)	{ failed.push('csstransforms'); }
	if (!M.cssanimations)	{ failed.push('cssanimations'); }
    if (!M.websockets)		{ failed.push('websockets'); }
	if (!M.localstorage)	{ failed.push('localstorage'); }
	if (!M.dataset)			{ failed.push('dataset'); }

    if (!msos.config.scrolltop) { failed.push('scrollTop'); }

    if (failed[0]) {
		msos.console.debug(temp_txt + 'browser is not advanced, missing: ' + failed.join(' '));
		msos.config.browser.advanced = false;
		return false;
    }
    msos.console.debug(temp_txt + 'browser is advanced.');
    msos.config.browser.advanced = true;
    return true;
};

msos.browser_editable = function () {
    "use strict";

    if (!(document.designMode || msos.body.contentEditable))	{ msos.config.browser.editable = false; return; }
    if (document.execCommand === undefined)						{ msos.config.browser.editable = false; return; }

    msos.console.debug('msos.browser_editable -> browser supports content editing');
    msos.config.browser.editable = true;
};

// Don't run before 'body' is loaded, see 'msos.run_onload'
msos.browser_direction = function () {
    "use strict";

    var browser_dir = '',
		build_test = null;

    build_test = function () {
		var container = document.createElement("p"),
			span = document.createElement("span"),
			direction = '';
	
		container.style.margin =  "0 0 0 0";
		container.style.padding = "0 0 0 0";
		container.style.textAlign = "";
		
		span.innerHTML = "X";
		
		container.appendChild(span);
		document.body.appendChild(container);
		
		direction = span.offsetLeft < (container.offsetWidth - (span.offsetLeft + span.offsetWidth)) ? "ltr" : "rtl";
		msos.body.removeChild(container);
	
		if (msos.config.verbose) { msos.console.debug('msos.browser_direction -> by build_test: ' + direction); }
		return direction;
    };

    browser_dir = (msos.body.dir || document.documentElement.dir || build_test() || 'ltr').toLowerCase();
    msos.config.browser.direction = browser_dir;
};

msos.browser_preloading = function () {
	"use strict";

	var script_pre = msos.config.script_preload,
		script_elm = document.createElement("script"),
		dua = navigator.userAgent;

	script_pre.async = 'async' in script_elm ? true : false;
	script_pre.defer = 'defer' in script_elm ? true : false;

	script_pre.explicit  = typeof script_elm.preload === "boolean" ? true : false;
	script_pre.available = script_pre.explicit ? true : (script_elm.readyState && script_elm.readyState === "uninitialized") ? true : false;
	script_pre.ordered   = (!script_pre.available && script_elm.async === true) ? true : false;
	script_pre.xhr_cache = (script_pre.available || (!script_pre.ordered && !(dua.indexOf("Opera") !== -1) && !(dua.indexOf("Gecko") !== -1))) ? true : false;

	script_elm = null;
};

msos.browser_native_overflow = function () {
	"use strict";

	var conf = msos.config;

	conf.browser.nativeoverflow = Modernizr.overflowscrolling || conf.overflow_scrolling.webkitoverflowscrolling || conf.overflow_scrolling.msoverflowstyle;
};

// Borrowed from "FastClick.notNeeded"
msos.browser_has_fastclick = function () {
	"use strict";

	var chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [0,0])[1],
		firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [0,0])[1],
		isblackberry10 = navigator.userAgent.indexOf('BB10') > 0,
		blackberryVersion,
		output = false;

	// Devices that don't support touch don't need FastClick
	if (window.ontouchstart === undefined) {

		output = true;

	} else if (chromeVersion) {

		// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
		if (navigator.userAgent.indexOf('Android') > 0) {
			if (msos.config.browser.scalable) {
				output = true;
			}
		} else {
			output = true;
		}

	} else if (isblackberry10) {

		blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

		// BlackBerry 10.3+ does not require Fastclick library.
		// https://github.com/ftlabs/fastclick/issues/251
		if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
			if (msos.config.browser.scalable) {
				output = true;
			}
		}

	} else if (firefoxVersion >= 27) {

		if (msos.config.browser.scalable) {
			output = true;
		}

	} else if (document.body.style.touchAction === 'none' || document.body.style.touchAction === 'manipulation') {
		// IE10, 11 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom
		output = true;
	}

	msos.config.browser.fastclick = output;
};

msos.browser_is_scalable = function () {
	"use strict";

	var metaViewport = document.querySelector('meta[name=viewport]');

	if ((metaViewport && metaViewport.content.indexOf('user-scalable=no') !== -1) || (document.documentElement.scrollWidth <= window.outerWidth)) {
		msos.config.browser.scalable = true;
	}
};

msos.get_head = function (win) {
    "use strict";

    var d = win.document,
		de = d.documentElement,
		hd = d.head || d.getElementsByTagName('head')[0];

    if (!hd) {
		hd = d.createElement('head');
		de.insertBefore(hd, de.firstChild);
    }
    return hd;
};

msos.create_node = function (tag, atts_obj, win) {
    "use strict";

    // Allow creating element in another window
    if (!win) { win = window; }

    var elem = win.document.createElement(tag),
		at = '';

    if (msos.config.verbose) {
		msos.console.debug('msos.create_node -> called for:\n     ' + tag, atts_obj);
    }

    for (at in atts_obj) {
		if (atts_obj.hasOwnProperty(at)) {
			elem.setAttribute(at, atts_obj[at]);
		}
    }

    return elem;
};

msos.loader = function (win) {
    "use strict";

    var temp_mod = 'msos.loader',
		ld_obj = this,
		file = msos.purl().attr('file'),
		i = 0;

    if (!win)		{ win = window; }		// Default is parent
    if (!win.msos)	{ win.msos = {}; }		// Popup might not have msos defined
    if (!win.name)	{ win.name = file.replace(/[^0-9a-zA-Z]/g, '_') || 'base_win'; }

    // Initiate 'dynamic_files' tracking
    if (!win.msos.registered_files) {
		win.msos.registered_files = { js : {}, css : {}, ico : {}, ajax: {} };
    }

    msos.console.debug(temp_mod + " -> start for window: " + win.name);

    // Get document head element
    this.doc_head = msos.get_head(win);
    this.toggle_css = [];
    this.delay_css = 0;
	this.deferred_array = [];
	this.deferred_done = true;

	this.add_resource_onload = [];

    // Load the resource
    this.load = function (url, type, attribs) {
		var name = msos.generate_url_name(url),
			base = url.split('?')[0],
			ext = base.substr(base.lastIndexOf('.') + 1),
			pattern = /^js|css|ico$/,
			lo = ' - load -> ',
			load_resource_func = null;

		if (msos.config.verbose) {
			msos.console.debug(temp_mod + lo + 'start, name: ' + name);
		}

		// Check for attribs object
		attribs = attribs || {};

		// If file type passed in use it, otherwise determine from url
		if (!type) { type = ext || 'na'; }

		if (!pattern.test(type) || !name) {

			msos.console.error(temp_mod + lo + 'missing or invalid input for url: ' + url + ', type: ' + type);
			return;
		}

		if (ld_obj.check(name, url, type)) {

			msos.console.debug(temp_mod + lo + 'already loaded: ' + name + ', url: ' + url);

		} else {

			load_resource_func = function () {
				ld_obj.resource(name, url, type, attribs);
				msos.pending_file_loads.push(name);
			};

			if (attribs.defer && attribs.defer === 'defer') {

				if (msos.config.script_preload.ordered) {

					load_resource_func();
					msos.console.debug(temp_mod + lo + 'browser deferred file: ' + url);

				} else {

					if (ld_obj.deferred_done === true) {
						ld_obj.deferred_done = false;
						load_resource_func();	// Load first one directly
					} else {
						// Load next at callback. See ld_obj.resource -> on_resource_load()
						ld_obj.deferred_array.push(load_resource_func);
					}

					msos.console.debug(temp_mod + lo + 'deferred file: ' + url + ', queue: ' + ld_obj.deferred_array.length);
				}

			} else if (type === 'css') {

				// Some browsers (especially Chrome) need a small delay for multiple css loads
				setTimeout(load_resource_func, ld_obj.delay_css);
				ld_obj.delay_css += 5;

				msos.console.debug(temp_mod + lo + 'css file: ' + url + ', delay: ' + ld_obj.delay_css);

			} else {

				load_resource_func();
				msos.console.debug(temp_mod + lo + 'file: ' + url);
			}
		}

		if (msos.config.verbose) {
			msos.console.debug(temp_mod + lo + 'done!');
		}
    };

    this.check = function (file_name, file_url, file_type) {
		var toggle = ld_obj.toggle_css,
			flag_loaded = false,
			ld = ' - check -> ';

		msos.console.debug(temp_mod + ld + 'start.');

		// Important: See the popwin.js for 'win.msos.registered_files' clearing
		if (win.msos.registered_files[file_type] && win.msos.registered_files[file_type][file_name]) {
			flag_loaded = true;
		}

		// Allow only one css file to be 'active', if part of a toggle 'group' such as size
		if (file_type === 'css' && toggle.length > 0) {
			// Turn any already loaded css (per type spec ld_obj.toggle_css) off
			for (i = 0; i < toggle.length; i += 1) {
				if (win.msos.registered_files.css[toggle[i]]) {
					win.msos.registered_files.css[toggle[i]].disabled = true;
				}
			}
			// If already loaded, turn this one back on
			if (win.msos.registered_files.css[file_name]) {
				win.msos.registered_files.css[file_name].disabled = false;
				msos.console.debug(temp_mod + ld + 'set active: ' + file_url);
			}

			// Run any included onload functions
			for (i = 0; i < ld_obj.add_resource_onload.length; i += 1) {
				ld_obj.add_resource_onload[i]();
			}
		}

		msos.console.debug(temp_mod + ld + 'done, already loaded (t/f): ' + (flag_loaded ? 'true' : 'false') + ' for ' + file_name);
		return flag_loaded;
    };

    this.init_create_node = function (name, url, type, attribs) {
		var node = null,
			icn = ' - init_create_node -> ',
			node_attrs = {},
			ats = '';

		if (msos.config.verbose) {
			msos.console.debug(temp_mod + icn + 'start, name: ' + name + ', type: ' + type);
		}

		// Force new copies (for testing)
		if (msos.config.cache === false) {
			url += ((/\?.*$/.test(url) ? "&_" : "?_") + ~~ (Math.random() * 1E9) + "=");
		}

		// Define our typical node attributes by type (for convenience)
		if			(type === 'js' ) {
			node_attrs = { id: name, src: url };
		} else if	(type === 'css') {
			node_attrs = { id: name, rel: 'stylesheet', href: url, media: 'all' };
		} else if	(type === 'ico') {
			node_attrs = { id: name, type: 'image/x-icon', rel: 'shortcut icon', href: url };
		  }

		if (attribs !== undefined && typeof attribs === 'object') {
			for (ats in attribs) {
				if (attribs.hasOwnProperty(ats)) {
					node_attrs[ats] = attribs[ats];
				}
			}
		}

		// Important: You have to create a node in the variable 'win' window context in order
		// for IE to be able to use it (see 'this.resource'). FF, Opera and Chrome don't care.

		if			(type === 'js' ) {
			node = msos.create_node('script',	node_attrs, win);
			if (attribs.defer === 'defer')	{ node.async = false; }		// Browsers lacking "real defered" order retention
			else							{ node.async = true;  }		// Browsers conforming to "defered" order retention
		} else if	(type === 'css') {
			node = msos.create_node('link',		node_attrs, win);
		} else if	(type === 'ico') {
			node = msos.create_node('link',		node_attrs, win);
		  }

		node.msos_load_state = 'loading';

		if (type === 'js' && msos.config.script_onerror) {
			node.onerror = function (e) { msos.console.error(temp_mod + ' -> failed for: ' + name, e); };
		}

		if (msos.config.verbose) {
			msos.console.debug(temp_mod + icn + 'done!');
		}

		return node;
    };

    this.resource = function (file_name, file_url, file_type, file_atts) {
		var node = ld_obj.init_create_node(file_name, file_url, file_type, file_atts) || null,
			ls = ' - resource -> ',
			on_resource_load = function () {
				var i = 0,
					pending_idx,
					pending_file = msos.pending_file_loads,
					shifted;

				if (this.msos_load_state !== 'loaded' && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete' || this.readyState === 'uninitialized')) {

					this.msos_load_state = 'loaded';

					// This should always return an index...
					pending_idx = _.indexOf(pending_file, this.id);

					if (pending_idx >= 0) {
						pending_file.splice(pending_idx, 1);
						if (msos.config.verbose) {
							msos.console.debug(temp_mod + ls + 'loaded, name: ' + this.id + ', pending file count:', pending_file.length);
						}
					} else {
						msos.console.error(temp_mod + ls + 'unknown pending file, name: ' + this.id, pending_file);
					}

					for (i = 0; i < ld_obj.add_resource_onload.length; i += 1) {
						ld_obj.add_resource_onload[i]();
					}

					// Check for (and run) next deferred script
					if (this.getAttribute('defer') === 'defer') {
						if (ld_obj.deferred_array.length) {
							shifted = ld_obj.deferred_array.shift();
							shifted();
						} else {
							ld_obj.deferred_done = true;
						}
					}

					this.onload = this.onreadystatechange = null;
				}

				return true;
			};

		msos.console.debug(temp_mod + ls + 'start, type: ' + file_type + ', name: ' + file_name);

		if (node !== null) {

			// Run something when node loads...
			node.onload = node.onreadystatechange = on_resource_load;

			// Add the new node to the page head...
			ld_obj.doc_head.appendChild(node);

			// Store our new dynamic file node
			win.msos.registered_files[file_type][file_name] = node;

			msos.console.debug(temp_mod + ls + 'done!');
		}
    };

    msos.console.debug(temp_mod + " -> done!");
};


// --------------------------
// Setup MSOS Environment
// --------------------------
msos.set_environment = function () {
    "use strict";

    var set_txt = 'msos.set_environment -> ',
		st_obj = msos.config.storage;

    msos.console.debug(set_txt + 'start');

	// Get stored site user info
	st_obj.site_pref.value = msos.basil.get(st_obj.site_pref.name);
	st_obj.site_i18n.value = msos.basil.get(st_obj.site_i18n.name);
	st_obj.site_bdwd.value = msos.basil.get(st_obj.site_bdwd.name);

    // Get some browser capabilities
	msos.browser_ok();
    msos.browser_current();
    msos.browser_advanced();
    msos.browser_editable();
    msos.browser_orientation();
    msos.browser_touch();
    msos.browser_mobile();
	msos.browser_preloading();
	msos.browser_native_overflow();
	msos.browser_is_scalable();
	msos.browser_has_fastclick();

	if (msos.config.verbose) {
		msos.console.debug(set_txt + 'done, browser env: ', msos.config.browser);
	} else {
		msos.console.debug(set_txt + 'done!');
	}
};

msos.calc_display_size = function () {
    "use strict";

    var view = '',
		view_size = msos.config.view_port,
		view_width = 0,
		scrn_width = 0,
		scrn_px = 0,
		size = '',
		adj_width = 0;

    // Screen width (as displayed)
    if (!msos.var_is_empty(view_size.width) && view_size.width !== 0) { view_width = view_size.width; }
    if (!msos.var_is_empty(   screen.width) &&	  screen.width !== 0) { scrn_width =    screen.width; }

    scrn_px = view_width || scrn_width;

    for (size in msos.config.size_wide) {
		// Get the size that fits (size_wide + 1%)
		if (msos.config.size_wide.hasOwnProperty(size)) {
			adj_width = msos.config.size_wide[size] + (msos.config.size_wide[size] * 0.01);
			if (scrn_px > adj_width) {
				if (view) { if (msos.config.size_wide[view] < msos.config.size_wide[size])	{ view = size; } }
				else																		{ view = size; }
			}
		}
    }

    msos.console.debug('msos.calc_display_size -> calculated: ' + view + ', viewport w: ' + view_size.width + ', screen w: ' + screen.width);
    return view;
};

msos.get_display_size = function (resize) {
    "use strict";

    var temp_dis = 'msos.get_display_size -> ',
		store_value = msos.config.storage.site_pref.value,
		browser_layout  = msos.config.view_orientation.layout,
		store_array = [],
		display_size = '';

    msos.console.debug(temp_dis + 'start, resize: ' + (resize ? 'true' : 'false'));

    if (store_value) {
		store_array = store_value.split(':');
		if (browser_layout === 'portrait')	{ display_size = store_array[0] || ''; }
		else								{ display_size = store_array[1] || ''; }
		msos.console.debug(temp_dis + 'stored value detected: ' + store_value);
    } else {
		// set stored value to something initially
		store_array[0] = 'unknown';
		store_array[1] = 'unknown';
      }

    // Always update this
    store_array[2] = browser_layout;

    // This layout not set yet, so set to undef and get_size will kick in
    if (display_size === 'unknown' || resize) { display_size = ''; }

    msos.config.size = msos.config.query.size || display_size || msos.calc_display_size();

    if (msos.config.query.size) {
		// Warn that onorientationchange or onresize display change may have been overridden by an input value
		msos.console.info(temp_dis + 'NOTE: size set by input!');
    }

    if (browser_layout === 'portrait')	{ store_array[0] = msos.config.size; }
    else								{ store_array[1] = msos.config.size; }

    store_value = store_array.join(':');

	// Reset site user preferences info...
	msos.config.storage.site_pref.value = store_value;

    msos.console.debug(temp_dis + 'done: ' + msos.config.size + ', for ' + browser_layout);
};


// --------------------------
// Bulk External CSS Loading
// --------------------------
msos.css_loader = function (url_array, win) {
	"use strict";

	var temp_cl = 'msos.css_loader -> ',
		loader_obj = null,
		css_url = '',
		i = 0;

	msos.console.debug(temp_cl + 'start.');

	// One loader object retains load order 
	loader_obj = new msos.loader(win);

	for (i = 0; i < url_array.length; i += 1) {
		css_url = url_array[i];
		loader_obj.load(css_url, 'css');
	}

	msos.console.debug(temp_cl + 'done!');
};

// --------------------------
// Bulk External Script Loading
// --------------------------
msos.script_loader = function (url_array) {
	"use strict";

	var temp_esl = 'msos.script_loader -> ',
		loader_obj = null,
		script_url = '',
		i = 0;

	msos.console.debug(temp_esl + 'start.');

	// Get a new loader object
	loader_obj = new msos.loader();

	for (i = 0; i < url_array.length; i += 1) {
		script_url = url_array[i];
		loader_obj.load(script_url, 'js', { defer: 'defer' });
	}

	msos.console.debug(temp_esl + 'done!');
};


// --------------------------
// Establish base MSOS environment
// --------------------------
msos.set_environment();
msos.set_locale();
msos.get_display_size();


if (console && console.info) { console.info('msos/base -> done!'); }
msos.console.timeEnd('base');