/**
 * @license AngularJS v1.3.0-beta.11
 * (c) 2010-2016 Google, Inc. http://angularjs.org
 * License: MIT
 *
 * Originally derived from  v1.3.0-beta.11,
 *       with updates   to  v.1.6.5
 *       ...plus improvements for MobileSiteOS ;)
 */

/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    ArrayBuffer: false,
    Uint8Array: false
*/

msos.console.info('ng/v165_msos -> start.');
msos.console.time('ng');

(function (window) {
    "use strict";

    function noop() { msos.console.trace('ng - noop -> executed.'); return undefined; }

    function UNINITIALIZED_VALUE() { msos.console.debug('ng - UNINITIALIZED_VALUE -> called.'); }

    noop.prototype.$inject = [];

    function nullFormRenameControl(control, name) { control.$name = name; }

    function makeMap(arry) {
        var obj = {},
            i;

        if (_.isArray(arry)) {
            for (i = 0; i < arry.length; i += 1) {
                obj[arry[i]] = true;
            }
        } else {
            msos.console.error('ng - makeMap -> input not an array.');
        }

        return obj;
    }

    var angular = {},
        version = {
            full: '1.6.5',
            major: 1,
            minor: 6,
            dot: 5,
            codeName: 'toffee_salinization_msos'
        },
        msos_verbose = msos.config.verbose,
        msos_debug = msos.console.debug,
        msos_prev_modules = [],
        start_time = msos.new_time(),
        end_time = 0,
        _UNINITIALIZED_VALUE = new UNINITIALIZED_VALUE(),
        NODE_TYPE_ELEMENT = 1,
        NODE_TYPE_TEXT = 3,
        NODE_TYPE_COMMENT = 8,
        NODE_TYPE_DOCUMENT = 9,
        NODE_TYPE_DOCUMENT_FRAGMENT = 11,
        SPACE = /\s+/,
        NOT_EMPTY = /\S+/,
        ALL_COLONS = /:/g,
        TYPED_ARRAY_REGEXP = /^\[object (?:Uint8|Uint8Clamped|Uint16|Uint32|Int8|Int16|Int32|Float32|Float64)Array]$/,
        REGEX_STRING_REGEXP = /^\/(.+)\/([a-z]*)$/,
        SNAKE_CASE_REGEXP = /[A-Z]/g,
        SPECIAL_CHARS_REGEXP = /[:\-_]+(.)/g,
        SURROGATE_PAIR_REGEXP = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
        NON_ALPHANUMERIC_REGEXP = /([^#-~ |!])/g,
        UNDERSCORE_LOWERCASE_REGEXP = /_([a-z])/g,
        HTML_REGEXP = /<|&#?\w+;/,
        ARROW_ARG = /^([^(]+?)=>/,
        FN_ARGS = /^[^(]*\(\s*([^)]*)\)/m,
        FN_ARG_SPLIT = /,/,
        FN_ARG = /^\s*(_?)(\S+?)\1\s*$/,
        STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
        PREFIX_REGEXP = /^((?:x|data)[:\-_])/i,
        PATH_MATCH = /^([^?#]*)(\?([^#]*))?(#(.*))?$/,
        DATE_FORMATS_SPLIT = /((?:[^yMLdHhmsaZEwG']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|L+|d+|H+|h+|m+|s+|a|Z|G+|w+))([\s\S]*)/,
        NUMBER_STRING = /^-?\d+$/,
        ISO_DATE_REGEXP = /^\d{4,}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+(?:[+-][0-2]\d:[0-5]\d|Z)$/,
        R_ISO8601_STR = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+\-])(\d\d):?(\d\d))?)?$/,
        URL_REGEXP = /^[a-z][a-z\d.+-]*:\/*(?:[^:@]+(?::[^@]+)?@)?(?:[^\s:/?#]+|\[[a-f\d:]+])(?::\d+)?(?:\/[^?#]*)?(?:\?[^#]*)?(?:#.*)?$/i,
        EMAIL_REGEXP = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/,
        NUMBER_REGEXP = /^\s*(-|\+)?(\d+|(\d*(\.\d*)))([eE][+-]?\d+)?\s*$/,
        DATE_REGEXP = /^(\d{4,})-(\d{2})-(\d{2})$/,
        DATETIMELOCAL_REGEXP = /^(\d{4,})-(\d\d)-(\d\d)T(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/,
        WEEK_REGEXP = /^(\d{4,})-W(\d\d)$/,
        MONTH_REGEXP = /^(\d{4,})-(\d\d)$/,
        TIME_REGEXP = /^(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/,
        DOUBLE_SLASH_REGEX = /^\s*[\\/]{2,}/,
        PARTIAL_VALIDATION_EVENTS = 'keydown wheel mousedown',
        PARTIAL_VALIDATION_TYPES,
        PURITY_ABSOLUTE = 1,
        PURITY_RELATIVE = 2,
        defaultModelOptions,
        DEFAULT_REGEXP = /(\s+|^)default(\s+|$)/,
        CONSTANT_VALUE_REGEXP = /^(true|false|\d+)$/,
        CNTRL_REG = /^(\S+)(\s+as\s+([\w$]+))?$/,
        NG_OPTIONS_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?(?:\s+disable\s+when\s+([\s\S]+?))?\s+for\s+(?:([$\w][$\w]*)|(?:\(\s*([$\w][$\w]*)\s*,\s*([$\w][$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/,
        DATE_FORMATS = {},
        MAX_DIGITS = 22,
        DECIMAL_SEP = '.',
        ZERO_CHAR = '0',
        DEFAULT_PORTS = {
            'http': 80,
            'https': 443,
            'ftp': 21
        },
        SCE_CONTEXTS = {
            HTML: 'html',
            CSS: 'css',
            URL: 'url',
            RESOURCE_URL: 'resourceUrl',
            JS: 'js'
        },
        APPLICATION_JSON = 'application/json',
        CONTENT_TYPE_APPLICATION_JSON = { 'Content-Type': APPLICATION_JSON + ';charset=utf-8' },
        JSON_START = /^\[|^\{(?!\{)/,
        JSON_ENDS = {
            '[': /\]$/,
            '{': /\}$/
        },
        JSON_PROTECTION_PREFIX = /^\)]\}',?\n/,
        VALIDITY_STATE_PROPERTY = 'validity',
        VALID_CLASS = 'ng-valid',
        INVALID_CLASS = 'ng-invalid',
        PRISTINE_CLASS = 'ng-pristine',
        DIRTY_CLASS = 'ng-dirty',
        UNTOUCHED_CLASS = 'ng-untouched',
        TOUCHED_CLASS = 'ng-touched',
        PENDING_CLASS = 'ng-pending',
        EMPTY_CLASS = 'ng-empty',
        NOT_EMPTY_CLASS = 'ng-not-empty',
        SUBMITTED_CLASS = 'ng-submitted',
        NG_HIDE_CLASS = 'ng-hide',
        NG_HIDE_IN_PROGRESS_CLASS = 'ng-hide-animate',
        NG_ANIMATE_CLASSNAME = 'ng-animate',
        NG_ANIMATE_ATTR_NAME = 'data-ng-animate',
        NG_ANIMATE_PIN_DATA = '$ngAnimatePin',
        ADD_CLASS_SUFFIX = '-add',
        REMOVE_CLASS_SUFFIX = '-remove',
        EVENT_CLASS_PREFIX = 'ng-',
        ACTIVE_CLASS_SUFFIX = '-active',
        PREPARE_CLASS_SUFFIX = '-prepare',
        NG_ANIMATE_CHILDREN_DATA = '$$ngAnimateChildren',
        CSS_PREFIX = '',
        TRANSITION_PROP,
        TRANSITIONEND_EVENT,
        ANIMATION_PROP,
        ANIMATIONEND_EVENT,
        DURATION_KEY = 'Duration',
        PROPERTY_KEY = 'Property',
        DELAY_KEY = 'Delay',
        TIMING_KEY = 'TimingFunction',
        ANIMATION_ITERATION_COUNT_KEY = 'IterationCount',
        ANIMATION_PLAYSTATE_KEY = 'PlayState',
        SAFE_FAST_FORWARD_DURATION_VALUE = 9999,
        ANIMATION_DELAY_PROP,
        ANIMATION_DURATION_PROP,
        TRANSITION_DELAY_PROP,
        TRANSITION_DURATION_PROP,
        ANIMATE_TIMER_KEY = '$$animateCss',
        ONE_SECOND = 1000,
        ELAPSED_TIME_MAX_DECIMAL_PLACES = 3,
        CLOSING_TIME_BUFFER = 1.5,
        DETECT_CSS_PROPERTIES,
        DETECT_STAGGER_CSS_PROPERTIES,
        slice = [].slice,
        splice = [].splice,
        FUNCTION_CTOR = Function.constructor,
        OBJECT_CTOR = {}.constructor,
        FUNCTION_CTOR_PROTO = FUNCTION_CTOR.prototype,
        OBJECT_CTOR_PROTO = OBJECT_CTOR.prototype,
        BIND = FUNCTION_CTOR_PROTO.bind,
        objectValueOf = OBJECT_CTOR_PROTO.valueOf,
        lowercase = function (s) {
            return _.isString(s) ? s.toLowerCase() : String(s);
        },
        hasOwnProperty = Object.prototype.hasOwnProperty,
        uppercase = function (string) {
            return _.isString(string) ? string.toUpperCase() : string;
        },
        manualLowercase = function (s) {
            return _.isString(s) ? s.replace(/[A-Z]/g, function (ch) { return String.fromCharCode(ch.charCodeAt(0) | 32); }) : String(s);
        },
        manualUppercase = function (s) {
            return _.isString(s) ? s.replace(/[a-z]/g, function (ch) { return String.fromCharCode(ch.charCodeAt(0) & ~32); }) : String(s);
        },
        ngto_string = Object.prototype.toString,
        getPrototypeOf = Object.getPrototypeOf,
        urlCache = {},
        urlParsingNode = window.document.createElement('a'),
        originUrl,
        base_href = jQuery('base').attr('href') || '',
        baseHref = base_href ? base_href.replace(/^(https?:)?\/\/[^/]*/, '') : '',
        msie = window.document.documentMode,
        android = parseInt((/android (\d+)/.exec(lowercase((window.navigator || {}).userAgent)) || [])[1], 10),
        isChromePackagedApp = window.chrome && ((window.chrome.app && window.chrome.app.runtime) || (!window.chrome.app && window.chrome.runtime && window.chrome.runtime.id)),
        history_pushstate = !!((!isChromePackagedApp && window.history && window.history.pushState) && !(android < 4)),
        jqLite,
        getAnnotation,
        providerSuffix = 'Provider',
        nanKey = Object.create(null),
        NgMap,
        ngMinErr = null,
        ngModelMinErr = null,
        minErrConfig = { objectMaxDepth: 5 },
        $httpMinErr = null,
        ngTranscludeMinErr = null,
        $injectorMinErr = null,
        $animateMinErr = null,
        $compileMinErr = null,
        $templateRequestMinErr = null,
        $interpolateMinErr = null,
        $locationMinErr = null,
        $parseMinErr = null,
        $sceMinErr = null,
        $ngOptionsMinErr = null,
        $controllerMinErr = null,
        $AnimateProvider = [],
        $jsonpCallbacksProvider = null,
        $$AnimateAsyncRunFactoryProvider = null,
        $$AnimateRunnerFactoryProvider = null,
        $$MapProvider,
        $AnimateCssProvider,
        $$AnimateCssDriverProvider,
        $$AnimateJsProvider,
        $$AnimateJsDriverProvider,
        $$AnimateQueueProvider,
        $$AnimationProvider,
        trim = function (value) {
            return _.isString(value) ? jQuery.trim(value) : value;
        },
        escapeForRegexp = function (s) {
            return s.replace(/([-()[\]{}+?*.$^|,:#<!\\])/g, '\\$1').replace(/\x08/g, '\\x08');
        },
        angularModule,
        nodeName_ = function (element) {
            return lowercase(element.nodeName || (element[0] && element[0].nodeName));
        },
        uid = 0,
        scope_uid = 0,
        elem_uid = 0,
        radio_uid = 0,
        browser_uid = 0,
        browser_std_defer = 10,     // Std AngularJS default is 0 (zero)
        browser_defer_ids = {},
        bindJQueryFired = false,
        bindbootstrapFired = false,
        JQLitePrototype = {},
        BOOLEAN_ATTR = {},
        BOOLEAN_ELEMENTS = {},
        ALIASED_ATTR = {
            'ngMinlength': 'minlength',
            'ngMaxlength': 'maxlength',
            'ngMin': 'min',
            'ngMax': 'max',
            'ngPattern': 'pattern',
            'ngStep': 'step'
        },
        ESCAPE = {
            'n': '\n',
            'f': '\f',
            'r': '\r',
            't': '\t',
            'v': '\v',
            '\'': '\'',
            '"': '"'
        },
        nullFormCtrl = {
            $addControl: noop,
            $$renameControl: nullFormRenameControl,
            $removeControl: noop,
            $setValidity: noop,
            $setDirty: noop,
            $setPristine: noop,
            $setSubmitted: noop
        },
        inputType = {},
        OPERATORS = {},
        Lexer = null,
        AST = null,
        locationPrototype,
        noopNgModelController,
        ngModelDirective,
        ngAttributeAliasDirectives = {},
        ngEventDirectives = {},
        forceAsyncEvents = {
            'blur': true,
            'focus': true
        },
        htmlAnchorDirective,
        formDirectiveFactory,
        formDirective,
        ngFormDirective,
        inputDirective,
        ngChangeDirective,
        requiredDirective,
        patternDirective,
        maxlengthDirective,
        minlengthDirective,
        ngListDirective,
        ngValueDirective,
        ngAttrDivective,
        ngModelOptionsDirective,
        ngBindDirective,
        ngBindTemplateDirective,
        ngBindHtmlDirective,
        ngClassDirective,
        ngClassOddDirective,
        ngClassEvenDirective,
        ngCloakDirective,
        ngControllerDirective,
        ngIfDirective,
        ngIncludeDirective,
        ngIncludeFillContentDirective,
        ngInitDirective,
        ngNonBindableDirective,
        ngPluralizeDirective,
        ngRepeatDirective,
        ngShowDirective,
        ngHideDirective,
        ngStyleDirective,
        ngSwitchDirective,
        ngSwitchWhenDirective,
        ngSwitchDefaultDirective,
        ngTranscludeDirective,
        scriptDirective,
        ngOptionsDirective,
        SelectController,
        selectDirective,
        optionDirective,
        voidElements = makeMap(
            ['area', 'br', 'col', 'hr', 'img', 'wbr']
        ),
        optionalEndTagBlockElements = makeMap(
            ['colgroup', 'dd', 'dt', 'li', 'p', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr']
        ),
        optionalEndTagInlineElements = makeMap(
            ['rp', 'rt']
        ),
        optionalEndTagElements = _.extend(
            {},
            optionalEndTagInlineElements,
            optionalEndTagBlockElements
        ),
        blockElements = _.extend(
            {},
            optionalEndTagBlockElements,
            makeMap(
                [
                    'address', 'article', 'aside', 'blockquote', 'caption', 'center', 'del',
                    'dir', 'div', 'dl', 'figure', 'figcaption', 'footer', 'h1', 'h2', 'h3',
                    'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'ins', 'map', 'menu', 'nav',
                    'ol', 'pre', 'section', 'table', 'ul'
                ]
            )
        ),
        inlineElements = _.extend(
            {},
            optionalEndTagInlineElements,
            makeMap(
                [
                    'a', 'abbr', 'acronym', 'b', 'bdi', 'bdo', 'big', 'br', 'cite', 'code',
                    'del', 'dfn', 'em', 'font', 'i', 'img', 'ins', 'kbd', 'label', 'map',
                    'mark', 'q', 'ruby', 'rp', 'rt', 's', 'samp', 'small', 'span', 'strike',
                    'strong', 'sub', 'sup', 'time', 'tt', 'u', 'var'
                ]
            )
        ),
        svgElements = makeMap(
            [
                'circle', 'defs', 'desc', 'ellipse', 'font-face', 'font-face-name', 'font-face-src',
                'g', 'glyph', 'hkern', 'image', 'linearGradient', 'line', 'marker', 'metadata',
                'missing-glyph', 'mpath', 'path', 'polygon', 'polyline', 'radialGradient', 'rect',
                'stop', 'svg', 'switch', 'text', 'title', 'tspan'
            ]
        ),
        mediaElements = makeMap(
            ['audio', 'canvas', 'fieldset', 'form', 'noscript', 'output', 'video']
        ),
        blockedElements = makeMap(
            ['script', 'style']
        ),
        validElements = _.extend(
            {},
            voidElements,
            blockElements,
            inlineElements,
            optionalEndTagElements
        ),
        uriAttrs = makeMap(
            ['background', 'cite', 'href', 'longdesc', 'src', 'xlink:href']
        ),
        htmlAttrs = makeMap(
            [
                'abbr', 'align', 'alt', 'axis', 'bgcolor', 'border', 'cellpadding', 'cellspacing',
                'class', 'clear', 'color', 'cols', 'colspan', 'compact', 'coords', 'dir', 'face',
                'headers', 'height', 'hreflang', 'hspace', 'ismap', 'lang', 'language', 'nohref',
                'nowrap', 'rel', 'rev', 'rows', 'rowspan', 'rules', 'scope', 'scrolling', 'shape',
                'size', 'span', 'start', 'summary', 'tabindex', 'target', 'title', 'type', 'valign',
                'value', 'vspace', 'width'
            ]
        ),
        ariaAttrs = makeMap(
            [
                'aria-activedescendant', 'aria-atomic', 'aria-autocomplete', 'aria-busy',
                'aria-checked', 'aria-controls', 'aria-describedby', 'aria-disabled', 'aria-dropeffect',
                'aria-expanded', 'aria-flowto', 'aria-grabbed', 'aria-haspopup', 'aria-hidden',
                'aria-invalid', 'aria-label', 'aria-labelledby', 'aria-level', 'aria-live',
                'aria-multiline', 'aria-multiselectable', 'aria-orientation', 'aria-owns',
                'aria-posinset', 'aria-pressed', 'aria-readonly', 'aria-relevant', 'aria-required',
                'aria-selected', 'aria-setsize', 'aria-sort', 'aria-valuemax', 'aria-valuemin',
                'aria-valuenow', 'aria-valuetext', 'role'
            ]
        ),
        svgAttrs = makeMap(
            _.map(
                [
                    'accent-height', 'accumulate', 'additive', 'alphabetic', 'arabic-form', 'ascent',
                    'baseProfile', 'bbox', 'begin', 'by', 'calcMode', 'cap-height', 'class', 'color', 'color-rendering',
                    'content', 'cx', 'cy', 'd', 'dx', 'dy', 'descent', 'display', 'dur', 'end', 'fill', 'fill-rule',
                    'font-family', 'font-size', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'from',
                    'fx', 'fy', 'g1', 'g2', 'glyph-name', 'gradientUnits', 'hanging', 'height', 'horiz-adv-x',
                    'horiz-origin-x', 'ideographic', 'k', 'keyPoints', 'keySplines', 'keyTimes', 'lang', 'marker-end',
                    'marker-mid', 'marker-start', 'markerHeight', 'markerUnits', 'markerWidth', 'mathematical',
                    'max', 'min', 'offset', 'opacity', 'orient', 'origin', 'overline-position', 'overline-thickness',
                    'panose-1', 'path', 'pathLength', 'points', 'preserveAspectRatio', 'r', 'refX', 'refY', 'repeatCount',
                    'repeatDur', 'requiredExtensions', 'requiredFeatures', 'restart', 'rotate', 'rx', 'ry', 'slope', 'stemh',
                    'stemv', 'stop-color', 'stop-opacity', 'strikethrough-position', 'strikethrough-thickness', 'stroke',
                    'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit',
                    'stroke-opacity', 'stroke-width', 'systemLanguage', 'target', 'text-anchor', 'to', 'transform', 'type',
                    'u1', 'u2', 'underline-position', 'underline-thickness', 'unicode', 'unicode-range', 'units-per-em',
                    'values', 'version', 'viewBox', 'visibility', 'width', 'widths', 'x', 'x-height', 'x1', 'x2',
                    'xlink:actuate', 'xlink:arcrole', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base',
                    'xml:lang', 'xml:space', 'xmlns', 'xmlns:xlink', 'y', 'y1', 'y2', 'zoomAndPan'
                ],
                lowercase
            )
        ),
        validAttrs = _.extend(
            {},
            uriAttrs,
            svgAttrs,
            htmlAttrs,
            ariaAttrs
        ),
        validStdAttrs = _.extend(
            {},
            validAttrs,
            { style: true, id: true, on: true, placeholder: true }  // Some of these may need to move to "validAttrs", ref: id, placeholder
        ),
        validStdHtml = _.extend(
            {},
            validElements,
            svgElements,
            mediaElements,
            blockedElements,
            { body: true, button: true, legend: true }    // Some of these may need to move to "validStdHtml", ref: button, legend
        ),
        customAttr = {},
        customHtml = {};

    window.angular = angular;

    msos_debug('ng -> browser supports history pushstate: ' + history_pushstate);

    if ((window.ontransitionend === undefined) && (window.onwebkittransitionend !== undefined)) {
        CSS_PREFIX = '-webkit-';
        TRANSITION_PROP = 'WebkitTransition';
        TRANSITIONEND_EVENT = 'webkitTransitionEnd transitionend';
    } else {
        TRANSITION_PROP = 'transition';
        TRANSITIONEND_EVENT = 'transitionend';
    }

    if ((window.onanimationend === undefined) && (window.onwebkitanimationend !== undefined)) {
        CSS_PREFIX = '-webkit-';
        ANIMATION_PROP = 'WebkitAnimation';
        ANIMATIONEND_EVENT = 'webkitAnimationEnd animationend';
    } else {
        ANIMATION_PROP = 'animation';
        ANIMATIONEND_EVENT = 'animationend';
    }

    ANIMATION_DELAY_PROP = ANIMATION_PROP + DELAY_KEY;
    ANIMATION_DURATION_PROP = ANIMATION_PROP + DURATION_KEY;
    TRANSITION_DELAY_PROP = TRANSITION_PROP + DELAY_KEY;
    TRANSITION_DURATION_PROP = TRANSITION_PROP + DURATION_KEY;

    DETECT_CSS_PROPERTIES = {
        transitionDuration: TRANSITION_DURATION_PROP,
        transitionDelay: TRANSITION_DELAY_PROP,
        transitionProperty: TRANSITION_PROP + PROPERTY_KEY,
        animationDuration: ANIMATION_DURATION_PROP,
        animationDelay: ANIMATION_DELAY_PROP,
        animationIterationCount: ANIMATION_PROP + ANIMATION_ITERATION_COUNT_KEY
    };

    DETECT_STAGGER_CSS_PROPERTIES = {
        transitionDuration: TRANSITION_DURATION_PROP,
        transitionDelay: TRANSITION_DELAY_PROP,
        animationDuration: ANIMATION_DURATION_PROP,
        animationDelay: ANIMATION_DELAY_PROP
    };

    if ('i' !== 'I'.toLowerCase()) {
        lowercase = manualLowercase;
        uppercase = manualUppercase;
    }

    // Not the same as _.isObject
    //  _.isObject = function (obj) {
    //                  var type = typeof obj;
    //                  return type === 'function' || type === 'object' && !!obj;
    //  };
    function isObject(value) {
        return value !== null && typeof value === 'object';
    }

    function isDefined(value) {
        return value !== undefined;
    }

    function isScope(obj) {
        return obj && obj.$evalAsync && obj.$watch;
    }

    function isFile(obj) {
        return ngto_string.call(obj) === '[object File]';
    }

    function isFormData(obj) {
        return ngto_string.call(obj) === '[object FormData]';
    }

    function isBlob(obj) {
        return ngto_string.call(obj) === '[object Blob]';
    }

    function isPromiseLike(obj) {
        return obj && _.isFunction(obj.then);
    }

    function isArrayBuffer(obj) {
        return ngto_string.call(obj) === '[object ArrayBuffer]';
    }

    function isTypedArray(value) {
        return value && _.isNumber(value.length) && TYPED_ARRAY_REGEXP.test(ngto_string.call(value));
    }

    function isElement(node) {
        return !!(node && (node.nodeName || (node.prop && node.attr && node.find)));
    }

    function isError(value) {
        var tag = toString.call(value);

        switch (tag) {
            case '[object Error]': return true;
            case '[object Exception]': return true;
            case '[object DOMException]': return true;
            default: return value instanceof Error;
        }
    }

    function isNumberInteger(num) {
        return (num | 0) === num;
    }

    function sliceArgs(args, startIndex) {
        return slice.call(args, startIndex || 0);
    }

    function concat(array1, array2, index) {
        return array1.concat(slice.call(array2, index));
    }

    function isArrayLike(obj) {

        if (!obj || obj === null || obj === undefined || jQuery.isWindow(obj)) {
            return false;
        }

        if (_.isString(obj) || _.isArray(obj) || (jqLite && obj instanceof jqLite)) { return true; }

        // Support: iOS 8.2 (not reproducible in simulator)
        // "length" in obj used to prevent JIT error (gh-11508)
        var length = 'length' in Object(obj) && obj.length;     // Leave as is

        // NodeList objects (with `item` method) and
        // other objects with suitable length characteristics are array-like
        return _.isNumber(length) && ((length >= 0 && ((length - 1) in obj || obj instanceof Array)) || typeof obj.item === 'function');
    }

    function isValidObjectMaxDepth(maxDepth) {
        return _.isNumber(maxDepth) && maxDepth > 0;
    }

    function errorHandlingConfig(config) {
        if (isObject(config)) {
            if (isDefined(config.objectMaxDepth)) {
                minErrConfig.objectMaxDepth = isValidObjectMaxDepth(config.objectMaxDepth) ? config.objectMaxDepth : NaN;
            }
        } else {
            return minErrConfig;
        }
    }

    function forEach(obj, iterator, context) {
        var key,
            length,
            isPrimitive;

        if (obj) {
            if (_.isFunction(obj)) {
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (key !== 'prototype' && key !== 'length' && key !== 'name') {
                            iterator.call(context, obj[key], key, obj);
                        }
                    }
                }
            } else if (_.isArray(obj) || isArrayLike(obj)) {
                isPrimitive = typeof obj !== 'object';
                for (key = 0, length = obj.length; key < length; key += 1) {
                    if (isPrimitive || obj.hasOwnProperty(key)) {
                        iterator.call(context, obj[key], key, obj);
                    }
                }
            } else if (obj.forEach && obj.forEach !== forEach) {
                obj.forEach(iterator, context, obj);
            } else if (typeof obj.hasOwnProperty === 'function') {
                // Slow path for objects inheriting Object.prototype, hasOwnProperty check needed
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        iterator.call(context, obj[key], key, obj);
                    }
                }
            } else {
                // Slow path for objects which do not have a method `hasOwnProperty`
                for (key in obj) {   // hasOwnProperty.call used
                    if (hasOwnProperty.call(obj, key)) {
                        iterator.call(context, obj[key], key, obj);
                    }
                }
            }
        }
        return obj;
    }

    function forEachSorted(obj, iterator, context) {
        var i = 0,
            keys = Object.keys(obj).sort();

        for (i = 0; i < keys.length; i += 1) {
            iterator.call(context, obj[keys[i]], keys[i]);
        }
        return keys;
    }

    function setHashKey(obj, h) {
        if (h) {
            obj.$$hashKey = h;
        } else {
            delete obj.$$hashKey;
        }
    }

    function baseExtend(dst, objs, deep) {

        if (!_.isObject(dst)) {
            dst = {};
            msos.console.error('ng - baseExtend -> destination was not an object.');
        }

        var h = dst.$$hashKey,
            i = 0,
            ii = 0,
            j = 0,
            jj = 0,
            obj,
            keys,
            key,
            src;

        for (i = 0, ii = objs.length; i < ii; i += 1) {

            obj = objs[i];

            // Note: this first one uses underscore.js _.isObject!
            if (_.isObject(obj)) {

                keys = Object.keys(obj);

                for (j = 0, jj = keys.length; j < jj; j += 1) {

                    key = keys[j];
                    src = obj[key];

                    if (deep && isObject(src)) {
                        if (_.isDate(src)) {
                            dst[key] = new Date(src.valueOf());
                        } else if (_.isRegExp(src)) {
                            dst[key] = new RegExp(src);
                        } else if (src.nodeName) {
                            dst[key] = src.cloneNode(true);
                        } else if (isElement(src)) {
                            dst[key] = src.clone();
                        } else {
                            if (!isObject(dst[key])) { dst[key] = _.isArray(src) ? [] : {}; }
                            baseExtend(dst[key], [src], true);
                        }
                    } else {
                        dst[key] = src;
                    }
                }
            }
        }

        setHashKey(dst, h);
        return dst;
    }

    function extend(dst) {
        return baseExtend(dst, slice.call(arguments, 1), false);
    }

    function merge(dst) {
        return baseExtend(dst, slice.call(arguments, 1), true);
    }

    function inherit(parent, extra) {
        return extend(Object.create(parent), extra);
    }

    function ng_bind(self, fn) {
        var curryArgs = arguments.length > 2 ? sliceArgs(arguments, 2) : [];

        if (_.isFunction(fn) && !(fn instanceof RegExp)) {
            return curryArgs.length ? function () {
                    return arguments.length ? fn.apply(self, concat(curryArgs, arguments, 0))
                        : fn.apply(self, curryArgs);
                  } : function () {
                    return arguments.length ? fn.apply(self, arguments) : fn.call(self);
                  };
        }
        return fn;
    }

    function toJsonReplacer(key, value) {
        var val = value;

        if (typeof key === 'string' && key.charAt(0) === '$' && key.charAt(1) === '$') {
            val = undefined;
        } else if (jQuery.isWindow(value)) {
            val = '$WINDOW';
        } else if (value && window.document === value) {
            val = '$DOCUMENT';
        } else if (isScope(value)) {
            val = '$SCOPE';
        }

        return val;
    }

    function escape_string(str) {
        // Same code as 'dojo.string.escapeString' from dojo.string.extras, Dojo v0.4.2
        return ("\"" + str.replace(/(["\\])/g, "\\$1") + "\"").replace(/[\f]/g, "\\f").replace(/[\b]/g, "\\b").replace(/[\n]/g, "\\n").replace(/[\t]/g, "\\t").replace(/[\r]/g, "\\r");
    }

    function toJson(obj, pretty) {
        if (_.isUndefined(obj))     { return undefined; }
        if (!_.isNumber(pretty))    { pretty = pretty ? 2 : null; }

        return JSON.stringify(obj, toJsonReplacer, pretty);
    }

    function fromJson(json) {
        return _.isString(json) ? JSON.parse(json) : json;
    }

    function timezoneToOffset(timezone, fallback) {
        // IE/Edge do not "understand" colon (`:`) in timezone
        timezone = timezone.replace(ALL_COLONS, '');

        var requestedTimezoneOffset = Date.parse('Jan 01, 1970 00:00:00 ' + timezone) / 60000;

        return _.isNaN(requestedTimezoneOffset) ? fallback : requestedTimezoneOffset;
    }

    function addDateMinutes(date, minutes) {
        date = new Date(date.getTime());
        date.setMinutes(date.getMinutes() + minutes);
        return date;
    }

    function convertTimezoneToLocal(date, timezone, reverse) {
        reverse = reverse ? -1 : 1;

        var dateTimezoneOffset = date.getTimezoneOffset(),
            timezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);

        return addDateMinutes(date, reverse * (timezoneOffset - dateTimezoneOffset));
    }

    function getValueOf(value) {
        return _.isFunction(value.valueOf) ? value.valueOf() : objectValueOf.call(value);
    }

    function serializeObject(obj, maxDepth) {
        var seen = [];

        if (isValidObjectMaxDepth(maxDepth)) {
            obj = copy(obj, null, maxDepth);
        }

        return JSON.stringify(
            obj,
            function (key, val) {
                val = toJsonReplacer(key, val);

                if (_.isObject(val)) {
                    if (seen.indexOf(val) >= 0) { return '...'; }
                    seen.push(val);
                }

                return val;
            }
        );
    }

    function packageStyles(options) {
        var styles = {};

        if (options && (options.to || options.from)) {
            styles.to = options.to;
            styles.from = options.from;
        }
        return styles;
    }

    function pendClasses(classes, fix, isPrefix) {
        var className = '';

        classes = _.isArray(classes) ?
            classes :
            classes && _.isString(classes) && classes.length ?
            classes.split(/\s+/) :
            [];

        forEach(classes, function (klass, i) {
            if (klass && klass.length > 0) {
                className += (i > 0) ? ' ' : '';
                className += isPrefix ? fix + klass :
                    klass + fix;
            }
        });

        return className;
    }

    function removeFromArray(arr, val) {
        var index = arr.indexOf(val);

        if (val >= 0) {
            arr.splice(index, 1);
        }
    }

    function extractElementNode(ex_element) {
        var i = 0,
            elm;

        if (!ex_element[0]) { return ex_element; }    // This was in ngAnimate verison. Possible problem?

        for (i = 0; i < ex_element.length; i += 1) {
            elm = ex_element[i];

            if (elm.nodeType === NODE_TYPE_ELEMENT) {
                return elm;
            }
        }

        return undefined;
    }

    function stripCommentsFromElement(element) {
        if (element instanceof jqLite) {
            switch (element.length) {
                case 0:
                    return element;

                case 1:
                    if (element[0].nodeType === NODE_TYPE_ELEMENT) {
                        return element;
                    }
                    break;

                default:
                    return jqLite(extractElementNode(element));
            }
        }

        if (element.nodeType === NODE_TYPE_ELEMENT) {
            return jqLite(element);
        }

        return undefined;
    }

    function applyAnimationClassesFactory($$jqLite) {

        function $$addClass(element, className) {
            forEach(element, function(elm) {
                $$jqLite.addClass(elm, className);
            });
        }
    
        function $$removeClass(element, className) {
            forEach(element, function(elm) {
                $$jqLite.removeClass(elm, className);
            });
        }
    
        return function(element, options) {
            if (options.addClass) {
                $$addClass(element, options.addClass);
                options.addClass = null;
            }
            if (options.removeClass) {
                $$removeClass(element, options.removeClass);
                options.removeClass = null;
            }
        };
    }

    function prepareAnimationOptions(options) {
        var temp_pa = 'ng/animate - prepareAnimationOptions -> ',
            domOperation;

        if (msos_verbose === 'animate') {
            msos_debug(temp_pa + 'start, options (input):', options);
        }
        
        options = options || {};

        if (!options.$$prepared) {
            domOperation = options.domOperation || noop;

            options.domOperation = function () {
                options.$$domOperationFired = true;
                if (domOperation !== noop) {
                    domOperation();
                    domOperation = noop;
                }
            };

            options.$$prepared = true;
        }

        if (msos_verbose === 'animate') {
            msos_debug(temp_pa + ' done, options (output):', options);
        }
        return options;
    }

    function applyAnimationFromStyles(element, options) {
        if (options.from) {
            element.css(options.from);
            options.from = null;
        }
    }

    function applyAnimationToStyles(element, options) {
        if (options.to) {
            element.css(options.to);
            options.to = null;
        }
    }

    function applyAnimationStyles(element, options) {
        applyAnimationFromStyles(element, options);
        applyAnimationToStyles(element, options);
    }

    function resolveElementClasses(existing, toAdd, toRemove) {
        var ADD_CLASS = 1,
            REMOVE_CLASS = -1,
            flags = {},
            classes = {
                addClass: '',
                removeClass: ''
            };

        function splitClassesToLookup(classes) {

            if (_.isString(classes)) {
                classes = classes.split(' ');
            }

            var obj = {};

            forEach(classes, function (klass) {
                if (klass.length) {
                    obj[klass] = true;
                }
            });
            return obj;
        }

        existing = splitClassesToLookup(existing);

        toAdd = splitClassesToLookup(toAdd);

        forEach(toAdd, function (value_na, key) {
            flags[key] = ADD_CLASS;
        });

        toRemove = splitClassesToLookup(toRemove);

        forEach(toRemove, function (value_na, key) {
            flags[key] = flags[key] === ADD_CLASS ? null : REMOVE_CLASS;
        });

        forEach(flags, function (val, klass) {
            var prop, allow;

            if (val === ADD_CLASS) {
                prop = 'addClass';
                allow = !existing[klass] || existing[klass + REMOVE_CLASS_SUFFIX];
            } else if (val === REMOVE_CLASS) {
                prop = 'removeClass';
                allow = existing[klass] || existing[klass + ADD_CLASS_SUFFIX];
            }
            if (allow) {
                if (classes[prop].length) {
                    classes[prop] += ' ';
                }
                classes[prop] += klass;
            }
        });

        return classes;
    }

    function concatWithSpace(a, b) {
        if (!a) { return b; }
        if (!b) { return a; }
        return a + ' ' + b;
    }

    function mergeAnimationDetails(element, oldAnimation, newAnimation) {
        var target = oldAnimation.options || {},
            newOptions = newAnimation.options || {},
            toAdd = (target.addClass || '') + ' ' + (newOptions.addClass || ''),
            toRemove = (target.removeClass || '') + ' ' + (newOptions.removeClass || ''),
            classes = resolveElementClasses(element.attr('class'), toAdd, toRemove),
            realDomOperation;

        if (newOptions.preparationClasses) {
            target.preparationClasses = concatWithSpace(newOptions.preparationClasses, target.preparationClasses);
            delete newOptions.preparationClasses;
        }

        // noop is basically when there is no callback; otherwise something has been set
        realDomOperation = target.domOperation !== noop ? target.domOperation : null;

        extend(target, newOptions);

        if (realDomOperation) {
            target.domOperation = realDomOperation;
        }

        if (classes.addClass) {
            target.addClass = classes.addClass;
        } else {
            target.addClass = null;
        }

        if (classes.removeClass) {
            target.removeClass = classes.removeClass;
        } else {
            target.removeClass = null;
        }

        oldAnimation.addClass = target.addClass;
        oldAnimation.removeClass = target.removeClass;

        return target;
    }

    function getDomNode(element) {
        return (element instanceof jqLite) ? element[0] : element;
    }

    function applyGeneratedPreparationClasses(element, event, options) {
        var classes = '';

        if (event) {
            classes = pendClasses(event, EVENT_CLASS_PREFIX, true);
        }
        if (options.addClass) {
            classes = concatWithSpace(classes, pendClasses(options.addClass, ADD_CLASS_SUFFIX));
        }
        if (options.removeClass) {
            classes = concatWithSpace(classes, pendClasses(options.removeClass, REMOVE_CLASS_SUFFIX));
        }
        if (classes.length) {
            options.preparationClasses = classes;
            element.addClass(classes);
        }
    }

    function clearGeneratedClasses(element, options) {
        if (options.preparationClasses) {
            element.removeClass(options.preparationClasses);
            options.preparationClasses = null;
        }
        if (options.activeClasses) {
            element.removeClass(options.activeClasses);
            options.activeClasses = null;
        }
    }

    function applyInlineStyle(node, styleTuple) {
        var prop = styleTuple[0],
            value = styleTuple[1];

        if (msos_verbose === 'animate') {
            msos_debug('ng/animate/v161_msos - applyInlineStyle -> called, node:', node);
        }

        node.style[prop] = value;
    }

    function blockTransitions(node, duration) {
        var value = duration ? '-' + duration + 's' : '';

        applyInlineStyle(node, [TRANSITION_DELAY_PROP, value]);

        return [TRANSITION_DELAY_PROP, value];
    }

    function blockKeyframeAnimations(node, applyBlock) {
        var value = applyBlock ? 'paused' : '',
            key = ANIMATION_PROP + ANIMATION_PLAYSTATE_KEY;

        applyInlineStyle(node, [key, value]);

        return [key, value];
    }

    function getCssKeyframeDurationStyle(duration) {
        return [ANIMATION_DURATION_PROP, duration + 's'];
    }

    function getCssDelayStyle(delay, isKeyframeAnimation) {
        var prop = isKeyframeAnimation ? ANIMATION_DELAY_PROP : TRANSITION_DELAY_PROP;

        return [prop, delay + 's'];
    }

    function parseMaxTime(str) {
        var maxValue = 0,
            values = str.split(/\s*,\s*/);

        forEach(values, function (value) {
            // it's always safe to consider only second values and omit `ms` values since
            // getComputedStyle will always handle the conversion for us
            if (value.charAt(value.length - 1) === 's') {
                value = value.substring(0, value.length - 1);
            }
            value = parseFloat(value) || 0;
            maxValue = maxValue ? Math.max(value, maxValue) : value;
        });

        return maxValue;
    }

    function computeCssStyles($window, element, properties) {
        var styles = Object.create(null),
            detectedStyles = $window.getComputedStyle(element) || {};

        forEach(properties, function (formalStyleName, actualStyleName) {
            var val = detectedStyles[formalStyleName],
                c;

            if (val) {
                c = val.charAt(0);

                // only numerical-based values have a negative sign or digit as the first value
                if (c === '-' || c === '+' || c >= 0) {
                    val = parseMaxTime(val);
                }

                if (val === 0) {
                    val = null;
                }

                styles[actualStyleName] = val;
            }
        });

        return styles;
    }

    function truthyTimingValue(val) {
        return val === 0 || val != null;    // Leave as is...
    }

    function getCssTransitionDurationStyle(duration, applyOnlyDuration) {
        var style = TRANSITION_PROP,
            value = duration + 's';

        if (applyOnlyDuration) {
            style += DURATION_KEY;
        } else {
            value += ' linear all';
        }
        return [style, value];
    }

    function createLocalCacheLookup() {
        var cache = Object.create(null);

        return {
            flush: function () {
                cache = Object.create(null);
            },

            count: function (key) {
                var entry = cache[key];
                return entry ? entry.total : 0;
            },

            get: function (key) {
                var entry = cache[key];
                return entry && entry.value;
            },

            put: function (key, value) {
                if (!cache[key]) {
                    cache[key] = {
                        total: 1,
                        value: value
                    };
                } else {
                    cache[key].total += 1;
                }
            }
        };
    }

    function registerRestorableStyles(backup, node, properties) {
        forEach(properties, function (prop) {
            backup[prop] = isDefined(backup[prop]) ?
                backup[prop] :
                node.style.getPropertyValue(prop);
        });
    }

    function toDebugString(obj, maxDepth) {
        if (typeof obj === 'function') {
            return obj.toString().replace(/ \{[\s\S]*$/, '');
        }

        if (obj === undefined) {
            return 'undefined';
        }

        if (typeof obj !== 'string') {
            return serializeObject(obj, maxDepth);
        }

        return obj;
    }

    function minErr(module, ErrorConstructor) {
        ErrorConstructor = ErrorConstructor || Error;

        return function () {
            var code = arguments[0] || 'missing code',
                template = arguments[1] || 'missing template',
                message = '[' + (module ? module + ':' : '') + code + '] ',
                templateArgs = sliceArgs(arguments, 2).map(
                    function (arg) {
                        return toDebugString(arg, minErrConfig.objectMaxDepth);
                    }
                ),
                paramPrefix = '?',
                i;

            message += template.replace(
                /\{\d+\}/g,
                function (match) {
                    var index = +match.slice(1, -1),
                        shiftedIndex = index + SKIP_INDEXES;

                    if (index < templateArgs.length) {
                        return templateArgs[index];
                    }

                    return match;
                }
            );

            message += '\n     ' + msos.config.onerror_uri +
                (module ? module + '/' : '') + code;

            for (i = 0; i < templateArgs.length; i += 1, paramPrefix = '&') {
                message += paramPrefix + 'p' + i + '=' + encodeURIComponent(templateArgs[i]);
            }

            return new ErrorConstructor(message);
        };
    }

    ngMinErr = minErr('ng');
    $injectorMinErr = minErr('$injector');

    /**
     *
     *   | member name   | Description    |
     *   |---------------|----------------|
     *   | href          | A normalized version of the provided URL if it was not an absolute URL |
     *   | protocol      | The protocol including the trailing colon                              |
     *   | host          | The host and port (if the port is non-default) of the normalizedUrl    |
     *   | search        | The search params, minus the question mark                             |
     *   | hash          | The hash string, minus the hash symbol
     *   | hostname      | The hostname
     *   | port          | The port, without ":"
     *   | pathname      | The pathname, beginning with "/"
     *
     */
    function urlResolve(url, note) {
        var purlFn,
            output;

        if (msos_verbose) {
            msos_debug('ng - urlResolve -> start,\n     url: ' + url + (note ? ',\n     ref: ' + note : ''));
        }

        urlParsingNode.setAttribute('href', url);

        if (urlCache['cache-' + urlParsingNode.href]) {
            output = urlCache['cache-' + urlParsingNode.href];

            if (msos_verbose) {
                msos_debug('ng - urlResolve -> done,\n     cached:', output);
            }
        } else {
            purlFn = msos.purl(urlParsingNode.href, true);
            output = {
                href: purlFn.attr('source'),
                protocol: purlFn.attr('protocol'),
                host: purlFn.attr('host') + (purlFn.attr('port') ? ':' + purlFn.attr('port') : ''),
                search: purlFn.attr('query'),
                hash: purlFn.attr('fragment'),
                hostname: purlFn.attr('host'),
                port: purlFn.attr('port'),
                pathname: purlFn.attr('path'),
                source: purlFn.attr('source'),
                params: purlFn.param()
            };

            urlCache['cache-' + urlParsingNode.href] = output;

            if (msos_verbose) {
                msos_debug('ng - urlResolve -> done,\n     parsed:', output);
            }
        }

        return output;
    }

    originUrl = urlResolve(window.location.href, 'set original');

    function urlIsSameOrigin(requestUrl) {
        var parsed = (_.isString(requestUrl)) ? urlResolve(requestUrl, 'check same origin') : requestUrl;
        return (parsed.protocol === originUrl.protocol && parsed.host === originUrl.host);
    }

    function reverseParams(iteratorFn) {
        return function (value, key) {
            iteratorFn(key, value);
        };
    }

    function nextUid() {
        uid += 1;
        return uid;
    }

    function nextScopeUid() {
        scope_uid += 1;
        return scope_uid;
    }

    function nextElemUid() {
        elem_uid += 1;
        return elem_uid;
    }

    function nextRadioUid() {
        radio_uid += 1;
        return radio_uid;
    }

    function nextBrowserUid() {
        browser_uid += 1;
        return browser_uid;
    }

    function identity($) {
        return $;
    }

    identity.$inject = [];

    function valueFn(value) {
        return function valueRef() {
            return value;
        };
    }

    function hasCustomToString(obj) {
        return _.isFunction(obj.toString) && obj.toString !== Object.prototype.toString;
    }

    function arrayRemove(array, value) {
        var index = _.indexOf(array, value);

        if (index >= 0) {
            array.splice(index, 1);
        }
        return index;
    }

    function copy(source, destination, maxDepth) {
        var stackSource = [],
            stackDest = [],
            copyType,
            copyRecurse,
            copyElement;

        maxDepth = isValidObjectMaxDepth(maxDepth) ? maxDepth : NaN;

        copyType = function (source) {
            var copied,
                re;

            switch (ngto_string.call(source)) {

                case '[object Int8Array]':
                case '[object Int16Array]':
                case '[object Int32Array]':
                case '[object Float32Array]':
                case '[object Float64Array]':
                case '[object Uint8Array]':
                case '[object Uint8ClampedArray]':
                case '[object Uint16Array]':
                case '[object Uint32Array]':
                    return new source.constructor(copyElement(source.buffer), source.byteOffset, source.length);

                case '[object ArrayBuffer]':
                    // Support: IE10
                    if (!source.slice) {
                        copied = new ArrayBuffer(source.byteLength);
                        new Uint8Array(copied).set(new Uint8Array(source));
                        return copied;
                    }
                    return source.slice(0);

                case '[object Boolean]':
                case '[object Number]':
                case '[object String]':
                case '[object Date]':
                  return new source.constructor(source.valueOf());

                case '[object RegExp]':
                    re = new RegExp(source.source, source.toString().match(/[^/]*$/)[0]);
                    re.lastIndex = source.lastIndex;
                    return re;

                case '[object Blob]':
                    return new source.constructor([source], { type: source.type });
            }

            if (_.isFunction(source.cloneNode)) {
                return source.cloneNode(true);
            }

            return undefined;
        };

        copyRecurse = function (source, destination, maxDepth) {

            maxDepth -= 1;
            if (maxDepth < 0) { return '...'; }

            var h = destination.$$hashKey,
                key,
                i = 0;

            if (_.isArray(source)) {
                for (i = 0; i < source.length; i += 1) {
                    destination.push(copyElement(source[i], maxDepth));
                }
            } else if (source && typeof source.hasOwnProperty === 'function') {
                // Slow path, which must rely on hasOwnProperty
                for (key in source) {
                    if (source.hasOwnProperty(key)) {
                        destination[key] = copyElement(source[key], maxDepth);
                    }
                }
            } else {
                // Slowest path --- hasOwnProperty can't be called as a method
                for (key in source) {   // hasOwnProperty.call used
                    if (hasOwnProperty.call(source, key)) {
                        destination[key] = copyElement(source[key], maxDepth);
                    }
                }
            }

            setHashKey(destination, h);
            return destination;
        };

        copyElement = function (source, maxDepth) {
            // Simple values
            if (!isObject(source)) { return source; }

            // Already copied values
            var index = stackSource.indexOf(source),
                needsRecurse = false,
                destination;

            if (index !== -1) {
                return stackDest[index];
            }

            if (jQuery.isWindow(source) || isScope(source)) {
                throw ngMinErr(
                    'cpws',
                    'Can\'t copy! Making copies of Window or Scope instances is not supported.'
                );
            }

            destination = copyType(source);

            if (destination === undefined) {
                destination = _.isArray(source) ? [] : Object.create(getPrototypeOf(source));
                needsRecurse = true;
            }

            stackSource.push(source);
            stackDest.push(destination);

            return needsRecurse ? copyRecurse(source, destination, maxDepth) : destination;
        };

        if (destination) {

            if (isTypedArray(destination) || isArrayBuffer(destination)) {
                throw ngMinErr(
                    'cpta',
                    'Can\'t copy! TypedArray destination cannot be mutated.'
                );
            }

            if (source === destination) {
                throw ngMinErr('cpi', 'Can\'t copy! Source and destination are identical.');
            }

            // Empty the destination object
            if (_.isArray(destination)) {
                destination.length = 0;
            } else {
                forEach(
                    destination,
                    function (value_na, key) {
                        if (key !== '$$hashKey') {
                            delete destination[key];
                        }
                    }
                );
            }

            stackSource.push(source);
            stackDest.push(destination);

            return copyRecurse(source, destination, maxDepth);
        }

        return copyElement(source, maxDepth);
    }

    function shallowCopy(src, dst) {
        var i = 0,
            ii,
            key;

        if (_.isArray(src)) {
            dst = dst || [];

            ii = src.length;

            for (i = 0; i < ii; i += 1) {
                dst[i] = src[i];
            }

        } else if (isObject(src)) {
            dst = dst || {};

            for (key in src) {      // src doesn't have hasOwnProperty
                if (!(key.charAt(0) === '$' && key.charAt(1) === '$')) {
                    dst[key] = src[key];
                }
            }
        }

        return dst || src;
    }

    function createMap() {
        return Object.create(null);
    }

    function stringify(value) {

        if (value === null || value === undefined) {
            return '';
        }

        switch (typeof value) {
            case 'string':
                break;
            case 'number':
                value = String(value);
                break;
            default:
                if (hasCustomToString(value) && !_.isArray(value) && !_.isDate(value)) {
                    value = value.toString();
                } else {
                    value = toJson(value);
                }
        }

        return value;
    }

    function simpleCompare(a, b) { return a === b || (a !== a && b !== b); }

    function equals(o1, o2) {

        if (o1 === o2)                  { return true; }    // Same object ref.
        if (o1 === null || o2 === null) { return false; }   // Hell no!
        if (o1 !== o1 && o2 !== o2)     { return true; }    // catch NaN === NaN

        var t1 = typeof o1,
            t2 = typeof o2,
            length,
            key,
            keySet;

        if (t1 === t2 && t1 === 'object') {

            if (_.isArray(o1)) {
                if (!_.isArray(o2)) { return false; }
                length = o1.length;
                if (o1.length === o2.length) {
                    for (key = 0; key < length; key += 1) {
                        if (!equals(o1[key], o2[key])) { return false; }
                    }
                    return true;
                }
                return false;
            }

            if (_.isDate(o1)) {
                if (!_.isDate(o2)) { return false; }
                return simpleCompare(o1.getTime(), o2.getTime());
            }

            if (_.isRegExp(o1)) {
                if (!_.isRegExp(o2)) { return false; }
                return o1.toString() === o2.toString();
            }

            if (isScope(o1) || isScope(o2) || jQuery.isWindow(o1) || jQuery.isWindow(o2) || _.isArray(o2) || _.isDate(o2) || _.isRegExp(o2)) { return false; }
            keySet = createMap();

            for (key in o1) {
                if (o1.hasOwnProperty(key)) {
                    if (key.charAt(0) === '$' || _.isFunction(o1[key])) { continue; }
                    if (!equals(o1[key], o2[key]))                      { return false; }

                    keySet[key] = true;
                }
            }

            for (key in o2) {
                if (o2.hasOwnProperty(key)) {
                    if ((keySet[key] !== true) && (key.charAt(0) !== '$') && isDefined(o2[key]) && !_.isFunction(o2[key])) {
                        return false;
                    }
                }
            }

            return true;
        }
        return false;
    }

    function startingTag(element) {

        element = jqLite(element).clone();
        element.empty();

        // As Per DOM Standards
        var elemHtml = jqLite('<div>').append(element).html();

        return element[0].nodeType === NODE_TYPE_TEXT ? lowercase(elemHtml) : elemHtml.match(/^(<[^>]+>)/)[1].replace(/^<([\w-]+)/, function (match_na, nodeName) { return '<' + lowercase(nodeName); });
    }

    function encodeUriQuery(val, pctEncodeSpaces) {
        return encodeURIComponent(val).
            replace(/%40/gi, '@').
            replace(/%3A/gi, ':').
            replace(/%24/g, '$').
            replace(/%2C/gi, ',').
            replace(/%3B/gi, ';').
            replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
    }

    function encodeUriSegment(val) {
        return encodeUriQuery(val, true).
            replace(/%26/gi, '&').
            replace(/%3D/gi, '=').
            replace(/%2B/gi, '+');
    }

    function encodePath(path) {
        var segments = path.split('/'),
            i = segments.length;

        while (i) {
            i -= 1;
            segments[i] = encodeUriSegment(segments[i]);
        }

        return segments.join('/');
    }

    function encodeEntities(value) {
        value = _.escape(value);
        return value.
            replace(
                SURROGATE_PAIR_REGEXP,
                function (val1) {
                    var hi = val1.charCodeAt(0),
                        low = val1.charCodeAt(1);

                    return '&#' + (((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000) + ';';
                }
            ).
            replace(
                NON_ALPHANUMERIC_REGEXP,
                function (val2) {
                    return '&#' + val2.charCodeAt(0) + ';';
                }
            );
    }

    function toKeyValue(obj) {
        var parts = [];

        forEach(obj, function (value, key) {
            if (_.isArray(value)) {
                forEach(value, function (arrayValue) {
                    parts.push(encodeUriQuery(key, true) + (arrayValue === true ? '' : '=' + encodeUriQuery(arrayValue, true)));
                });
            } else {
                parts.push(encodeUriQuery(key, true) + (value === true ? '' : '=' + encodeUriQuery(value, true)));
            }
        });
        return parts.length ? parts.join('&') : '';
    }

    function snake_case(name, separator) {
        separator = separator || '_';

        if (_.isString(name)) {
            name = name.replace(
                SNAKE_CASE_REGEXP,
                function (letter, pos) { return (pos ? separator : '') + letter.toLowerCase(); });
        } else {
            msos.console.error('ng - snake_case -> not a string: ', name);
        }

        return name;
    }

    function JQLite(element) {

        if (element instanceof jQuery) {
            return element;
        }

        return jQuery(element);
    }

    JQLitePrototype = JQLite.prototype;

    function bindJQuery() {

        var originalCleanData,
            temp_bj = 'ng - bindJQuery -> ';

        msos_debug(temp_bj + 'start.');

        if (bindJQueryFired) {
            msos.console.warn(temp_bj + 'jQuery already bound!');
            return;
        }

        if (jQuery && jQuery.fn.on) {

            jqLite = jQuery;

            extend(jQuery.fn, {
                scope: JQLitePrototype.scope,
                isolateScope: JQLitePrototype.isolateScope,
                controller: (JQLitePrototype).controller,
                injector: JQLitePrototype.injector,
                inheritedData: JQLitePrototype.inheritedData
            });

            originalCleanData = jQuery.cleanData;

            jQuery.cleanData = function (elems) {
                var i = 0,
                    events;

                for (i = 0; elems[i] != null; i += 1) {     // jshint ignore:line
                    // must be "!=" and not "!==" null
                    events = jQuery._data(elems[i], "events");
                    if (events && events.$destroy) {
                        jQuery(elems[i]).triggerHandler('$destroy');
                    }
                }
                originalCleanData(elems);
            };

        } else {
            msos.console.error(temp_bj + 'jQuery is missing!');
        }

        angular.element = jqLite;

        msos_debug(temp_bj + 'done!');
        // Prevent double-proxying.
        bindJQueryFired = true;
    }

    function assertArg(arg, name, reason) {

        if (!arg) {
            throw ngMinErr(
                'assert_arg_req',
                'Argument from \'{0}\' is {1}',
                (name || '?'),
                (reason || 'required.')
            );
        }
    }

    function assertArgFn(input, name, reason) {
        var tpo = typeof input;

        if (msos_verbose) {
            msos_debug('ng - assertArgFn -> called, name: ' + name + ', type: ' + tpo);
        }

        if (!input) {
            assertArg(
                isDefined(input),
                name ,
                'missing definition code, or did not load. Ref: ' + reason
            );
        } else {
            assertArg(
                _.isFunction(input),
                name,
                'typeof: ' + tpo + (tpo === 'string' ? ' -> ' + input : '') + ', ' + reason
            );
        }
    }

    function assertNotHasOwnProperty(name, context) {
        if (name === 'hasOwnProperty') {
            throw ngMinErr(
                'badname',
                'hasOwnProperty is not a valid {0} name',
                context
            );
        }
    }

    function getter(obj, path, bindFnToScope) {

        if (!path) { return obj; }

        var keys = path.split('.') || [],
            key,
            lastInstance = obj,
            i = 0;

        for (i = 0; i < keys.length; i += 1) {
            key = keys[i];
            if (obj) {
                lastInstance = obj;
                obj = obj[key];
            }
        }

        if (!bindFnToScope && _.isFunction(obj)) {
            return _.bind(lastInstance, obj);
        }
        return obj;
    }

    function getBlockNodes(nodes) {

        var node = nodes[0],
            endNode = nodes[nodes.length - 1],
            blockNodes,
            i = 0;

        for (i = 1; node !== endNode && node.nextSibling; i += 1) {

            node = node.nextSibling;

            if (blockNodes || nodes[i] !== node) {
                if (!blockNodes) {
                    blockNodes = jqLite(slice.call(nodes, 0, i));
                }
                blockNodes.push(node);
            }
        }

        return blockNodes || nodes;
    }

    function HashMap(array, isolatedUid) {
        if (isolatedUid) {
            var iso_uid = 0;
            this.nextUid = function () {
                iso_uid += 1;
                return iso_uid;
            };
        }
        forEach(array, this.put, this);
    }

    function hashKey(obj, nextUidFn) {
        var key = obj && obj.$$hashKey,
            objType;

        if (key) {
            if (typeof key === 'function') {
                key = obj.$$hashKey();
            }
            return key;
        }

        objType = typeof obj;

        if (objType === 'function' || (objType === 'object' && obj !== null)) {
            key = obj.$$hashKey = objType + ':' + (nextUidFn || nextUid)();
        } else {
            key = objType + ':' + obj;
        }

        return key;
    }

    HashMap.prototype = {

        put: function (key, value) {
            this[hashKey(key, this.nextUid)] = value;
        },

        get: function (key) {
            return this[hashKey(key, this.nextUid)];
        },

        remove: function (key) {
            key = hashKey(key, this.nextUid);
            var value = this[key];
            delete this[key];
            return value;
        }
    };

    function NgMapShim() {
        this._keys = [];
        this._values = [];
        this._lastKey = NaN;
        this._lastIndex = -1;
    }

    NgMapShim.prototype = {
        _idx: function (key) {
            if (key === this._lastKey) {
                return this._lastIndex;
            }

            this._lastKey = key;
            this._lastIndex = this._keys.indexOf(key);
            return this._lastIndex;
        },
        _transformKey: function (key) {
            return _.isNaN(key) ? nanKey : key;
        },
        get: function (key) {
            key = this._transformKey(key);

            var idx = this._idx(key);

            if (idx !== -1) {
                return this._values[idx];
            }
        },
        set: function (key, value) {
            key = this._transformKey(key);

            var idx = this._idx(key);

            if (idx === -1) {
                idx = this._lastIndex = this._keys.length;
            }

            this._keys[idx] = key;
            this._values[idx] = value;
        },
        delete: function (key) {
            key = this._transformKey(key);

            var idx = this._idx(key);

            if (idx === -1) {
                return false;
            }

            this._keys.splice(idx, 1);
            this._values.splice(idx, 1);
            this._lastKey = NaN;
            this._lastIndex = -1;
            return true;
        }
    };

    NgMap = NgMapShim;

    $$MapProvider = [function () { this.$get = [function () { return NgMap; }]; }];

    function setupModuleLoader(window) {

        var temp_sm = 'ng - setupModuleLoader',
            angular_module = {};

        msos_debug(temp_sm + ' -> start.');

        // Store angular.module() calls, injector creations, module loadings
        angular.registered_modules = [];
        angular.registered_injectors = {};
        angular.loaded_modules = new NgMap();

        function ensure(obj, e_name, factory) {
            var debug = 'exists';

            if (!obj[e_name]) {
                obj[e_name] = factory();
                debug = 'created';
            }

            if (msos_verbose === 'module') {
                msos_debug(temp_sm + ' - ensure -> ' + e_name + ', (' + debug + ')\n     ensure obj:', obj[e_name]);
            }

            return obj[e_name];
        }

        // Set base object
        angular = ensure(window, 'angular', Object);

        // Set module object
        angular_module = ensure(
            angular,
            'module',
            function () {

                var build_modules = {},
                    ng_module_func = null;

                ng_module_func = function (m_name, m_requires, m_config) {
                    var temp_bmf = ' - ng_module_func (angular.module) -> ',
                        prev_m_requires = [],
                        diff_m_requires = [];

                    if (msos_verbose) {
                        msos_debug(temp_sm + temp_bmf + 'start: ' + m_name);
                    }

                    if (!_.isString(m_name)) {
                        msos.console.error(temp_bmf + 'failed, not a viable module name: ' + m_name);
                        m_name = 'unnamed.module';
                    }

                    assertNotHasOwnProperty(m_name, 'module');

                    if (m_requires && !_.isArray(m_requires)) {
                        msos.console.error(temp_sm + temp_bmf + 'failed, required module specification not in array format!');
                    }

                    if (_.indexOf(angular.registered_modules, m_name) < 0) {
                        angular.registered_modules.push(m_name);
                    }

                    if (m_requires && build_modules.hasOwnProperty(m_name)) {

                        if (build_modules[m_name].requires) {
                            prev_m_requires = build_modules[m_name].requires;
                            diff_m_requires = _.difference(prev_m_requires, m_requires);
                        }

                        if (diff_m_requires.length > 0) {
                            msos.console.warn(temp_sm + temp_bmf + 'rebuild: ' + m_name);
                            build_modules[m_name] = null;
                        }

                    } else if (!m_requires || m_requires.length === 0) {

                        if (msos_verbose === 'module' && !build_modules.hasOwnProperty(m_name)) {
                            msos.console.warn(temp_sm + temp_bmf + 'we recommend specifying [\'ng\'] for all initial module declarations, ref: ' + m_name);
                        }
                        m_requires = ['ng'];
                    }

                    // Just add it too those that didn't, but have requirements
                    if (_.indexOf(m_requires, 'ng') < 0) { m_requires.unshift('ng'); }

                    if (msos_verbose) {
                        msos_debug(temp_sm + temp_bmf + ' done: ' + m_name + ', required:', m_requires);
                    }

                    return ensure(build_modules, m_name, function () {

                        var temp_em = ' - ng_module_func - factory',
                            info = {},
                            invokeQueue = [],
                            configBlocks = [],
                            runBlocks = [],
                            create_config,
                            moduleInstance = {};

                        if (msos_verbose) {
                            msos_debug(temp_sm + temp_em + ' -> start: ' + m_name);
                        }

                        function invokeLater(provider, method, insertMethod, queue) {

                            if (!queue) { queue = invokeQueue; }

                            if (msos_verbose === 'module') {
                                    msos_debug(temp_sm + temp_em + ' -> invokeLater (create),\n     for: ' + m_name + ',\n     provider: ' + provider + ',\n     method: ' + method);
                            }

                            return function invoke_later_func() {
                                var reg_inj = angular.registered_injectors,
                                    recipeName = '',
                                    in_args = arguments;

                                queue[insertMethod || 'push']([provider, method, arguments]);

                                if (method === 'value' || method === 'constant') {
                                    // Value or constant invokation creates an injection var.
                                    recipeName = in_args && in_args[0] && _.isString(in_args[0]) ? in_args[0] : '';

                                    if (recipeName) {
                                        // Check for modules creating the same injector variable names
                                        if (reg_inj[recipeName] && reg_inj[recipeName] !== m_name) {
                                            msos.console.error(temp_sm + temp_em + ' -> invokeLater, inject: ' + recipeName + ' was already defined by ' + reg_inj[recipeName]);
                                        } else {
                                            reg_inj[recipeName] = m_name;
                                        }
                                    } else {
                                        msos.console.error(temp_sm + temp_em + ' -> invokeLater, failed for: ' + m_name, in_args);
                                    }
                                }

                                if (msos_verbose === 'module') {
                                    msos_debug(temp_sm + temp_em + ' -> invokeLater (exec),\n     for: ' + m_name + ',\n     inject: ' + recipeName + ',\n     provider: ' + provider + ',\n     method: ' + method + ',\n     instance:', moduleInstance);
                                }

                                return moduleInstance;
                            };
                        }

                        function invokeLaterAndSetModuleName(provider, method, queue) {

                            if (!queue) { queue = invokeQueue; }

                            if (msos_verbose === 'module') {
                                    msos_debug(temp_sm + temp_em + ' -> invokeLaterAndSetModuleName (create),\n     for: ' + m_name + ',\n     provider: ' + provider + ',\n     method: ' + method);
                            }

                            return function invoke_later_set_name_func(recipeName, factoryFunction) {
                                var ff = factoryFunction,
                                    reg_inj = angular.registered_injectors;

                                if (ff) {
                                    if (_.isArray(ff)) {
                                        if (_.isFunction(ff[ff.length - 1])) {
                                            ff[ff.length - 1].$$moduleName = m_name;
                                        }
                                    } else if (_.isFunction(ff)) {
                                        ff.$$moduleName = m_name;
                                    }
                                }

                                queue.push([provider, method, arguments]);

                                // Check for modules creating the same injector variable names
                                if (reg_inj[recipeName] && reg_inj[recipeName] !== m_name) {
                                    msos.console.error(temp_sm + temp_em + ' -> invokeLaterAndSetModuleName (exec), inject: ' + recipeName + ' is already defined by ' + reg_inj[recipeName]);
                                } else {
                                    reg_inj[recipeName] = m_name;
                                }

                                if (msos_verbose === 'module') {
                                    msos_debug(temp_sm + temp_em + ' -> invokeLaterAndSetModuleName (exec),\n     for: ' + m_name + ',\n     inject: ' + recipeName + ',\n     provider: ' + provider + ',\n     method: ' + method + ',\n     instance:', moduleInstance);
                                }

                                return moduleInstance;
                            };
                        }

                        create_config = invokeLater('$injector', 'invoke', 'push', configBlocks);

                        moduleInstance = {
                            // Private state
                            _invokeQueue: invokeQueue,
                            _configBlocks: configBlocks,
                            _runBlocks: runBlocks,

                            info: function (value) {
                                if (isDefined(value)) {
                                    if (!isObject(value)) {
                                        throw ngMinErr('aobj', 'Argument \'{0}\' must be an object', 'value');
                                    }
                                    info = value;
                                    return this;
                                }

                                return info;
                            },

                            requires: m_requires,
                            name: m_name,

                            provider:   invokeLaterAndSetModuleName('$provide', 'provider'),
                            factory:    invokeLaterAndSetModuleName('$provide', 'factory'),
                            service:    invokeLaterAndSetModuleName('$provide', 'service'),
                            value:      invokeLater('$provide', 'value'),
                            constant:   invokeLater('$provide', 'constant', 'unshift'),
                            decorator:  invokeLaterAndSetModuleName('$provide', 'decorator', configBlocks),     // configBlocks Added v1.6.0
                            animation:  invokeLaterAndSetModuleName('$animateProvider', 'register'),
                            filter:     invokeLaterAndSetModuleName('$filterProvider', 'register'),
                            controller: invokeLaterAndSetModuleName('$controllerProvider', 'register'),
                            directive:  invokeLaterAndSetModuleName('$compileProvider', 'directive'),
                            component:  invokeLaterAndSetModuleName('$compileProvider', 'component'),

                            config: create_config,

                            run: function (block) {
                                runBlocks.push(block);
                                return this;
                            }
                        };

                        if (m_config) {
                            if (msos_verbose === 'module') {
                                msos_debug(temp_sm + temp_em + ' -> add config function:', m_config);
                            }
                            create_config(m_config);
                        }

                        if (msos_verbose) {
                            msos_debug(temp_sm + temp_em + ' ->  done: ' + m_name);
                        }

                        return moduleInstance;
                    });
                };

                return ng_module_func;
            }
        );

        msos_debug(temp_sm + ' -> done!');

        return angular_module;
    }

    function fnCamelCaseReplace(all_na, letter) {
        return letter.toUpperCase();
    }

    function snakeToCamel(name) {
        return name.replace(UNDERSCORE_LOWERCASE_REGEXP, fnCamelCaseReplace);
    }

    function jqLiteIsTextNode(html) {
        return !HTML_REGEXP.test(html);
    }

    function jqLiteClone(element) {
        return element.cloneNode(true);
    }

    function jqLiteAddNodes(root, elements) {
        if (root && elements) {

            if (elements.nodeType) {
                root[root.length] = elements;
                root.length += 1;   // Faster than .push(), with pre defined array growth.
            } else {

                var lngth = elements.length,
                    i = 0;

                // if an Array or NodeList and not a Window
                if (typeof lngth === 'number' && elements.window !== elements) {
                    if (lngth) {
                        for (i = 0; i < lngth; i += 1) {
                            root[root.length] = elements[i];
                            root.length += 1;   // Faster than .push(), with pre defined array growth.
                        }
                    }
                } else {
                    root[root.length] = elements;
                    root.length += 1;   // Faster than .push(), with pre defined array growth.
                }
            }
        } else {
            msos.console.warn('ng - jqLiteAddNodes -> missing input.');
        }
    }

    function jqLiteInheritedData(element, name, value) {

        if (element.nodeType === NODE_TYPE_DOCUMENT) {
            element = element.documentElement;
        }

        var names = _.isArray(name) ? name : [name],
            i = 0;

        while (element) {
            for (i = 0; i < names.length; i += 1) {
                value = jqLite.data(element, names[i]);
                if (isDefined(value)) { return value; }
            }

            element = element.parentNode || (element.nodeType === NODE_TYPE_DOCUMENT_FRAGMENT && element.host);
        }

        return undefined;
    }

    function jqLiteController(element, name) {
        return jqLiteInheritedData(element, '$' + (name || 'ngController') + 'Controller');
    }

    forEach(['multiple', 'selected', 'checked', 'disabled', 'readOnly', 'required', 'open'], function (value) {
        BOOLEAN_ATTR[lowercase(value)] = value;
    });

    forEach(['input', 'select', 'option', 'textarea', 'button', 'form', 'details'], function (value) {
        BOOLEAN_ELEMENTS[value] = true;
    });

    function getBooleanAttrName(element, name) {
        // check dom last since we will most likely fail on name
        var booleanAttr = BOOLEAN_ATTR[name.toLowerCase()];

        // booleanAttr is here twice to minimize DOM access
        return booleanAttr && BOOLEAN_ELEMENTS[nodeName_(element)] && booleanAttr;
    }

    function getAliasedAttrName(name) {
        return ALIASED_ATTR[name];
    }

    forEach({

        inheritedData: jqLiteInheritedData,

        scope: function (element) {
            return jqLite.data(element, '$scope') || jqLiteInheritedData(element.parentNode || element, ['$isolateScope', '$scope']);
        },

        isolateScope: function (element) {
            return jqLite.data(element, '$isolateScope') || jqLite.data(element, '$isolateScopeNoTemplate');
        },

        controller: jqLiteController,

        injector: function (element) {
            return jqLiteInheritedData(element, '$injector');
        }

    }, function (fn, name) {

        JQLite.prototype[name] = function (arg1, arg2) {
            var i = 0,
                j = 0,
                jj,
                key,
                nodeCount = this.length,
                value,
                nodeValue;

            if (_.isUndefined((fn.length === 2 && fn !== jqLiteController) ? arg1 : arg2)) {

                if (_.isObject(arg1)) {

                    for (i = 0; i < nodeCount; i += 1) {
                        for (key in arg1) {
                            if (arg1.hasOwnProperty(key)) {
                                fn(this[i], key, arg1[key]);
                            }
                        }
                    }

                    return this;
                }

                value = fn.$dv;
                jj = (_.isUndefined(value)) ? Math.min(nodeCount, 1) : nodeCount;

                // Only if we have $dv do we iterate over all, otherwise it is just the first element.
                for (j = 0; j < jj; j += 1) {
                    nodeValue = fn(this[j], arg1, arg2);
                    value = value ? value + nodeValue : nodeValue;
                }

                return value;
            }

            for (i = 0; i < nodeCount; i += 1) {
                fn(this[i], arg1, arg2);
            }

            return this;
        };
    });

    forEach({

        clone: jqLiteClone

    }, function (fn, name) {

        JQLite.prototype[name] = function (arg1, arg2, arg3) {
            var value,
                i = 0;

            for (i = 0; i < this.length; i += 1) {
                if (_.isUndefined(value)) {
                    value = fn(this[i], arg1, arg2, arg3);
                    if (isDefined(value)) {
                        // any function which returns a value needs to be wrapped
                        value = jqLite(value);
                    }
                } else {
                    jqLiteAddNodes(value, fn(this[i], arg1, arg2, arg3));
                }
            }
            return isDefined(value) ? value : this;
        };

    });

    // Provider for private $$jqLite service
    function $$jqLiteProvider() {

        function jqLiteHasClass(element, selector) {
            if (!element.getAttribute) { return false; }
            return ((' ' + (element.getAttribute('class') || '') + ' ').replace(/[\n\t]/g, ' ').indexOf(' ' + selector + ' ') > -1);
        }

        function jqLiteRemoveClass(element, cssClasses) {
            if (cssClasses && element.setAttribute) {
                forEach(
                    cssClasses.split(' '),
                    function (cssClass) {
                        element.setAttribute(
                            'class',
                            trim(
                                (' ' + (element.getAttribute('class') || '') + ' ')
                                    .replace(/[\n\t]/g, ' ')
                                    .replace(' ' + trim(cssClass) + ' ', ' ')
                            )
                        );
                    }
                );
            }
        }

        function jqLiteAddClass(element, cssClasses) {
            if (cssClasses && element.setAttribute) {
                var existingClasses = (' ' + (element.getAttribute('class') || '') + ' ')
                    .replace(/[\n\t]/g, ' ');

                forEach(
                    cssClasses.split(' '),
                    function (cssClass) {
                        cssClass = trim(cssClass);
                        if (existingClasses.indexOf(' ' + cssClass + ' ') === -1) {
                            existingClasses += cssClass + ' ';
                        }
                    }
                );

                element.setAttribute('class', trim(existingClasses));
            }
        }

        this.$get = function $$jqLite() {
            return extend(
                JQLite,
                {
                    hasClass: function (node, classes) {
                        if (node.attr) { node = node[0]; }
                        return jqLiteHasClass(node, classes);
                    },
                    addClass: function (node, classes) {
                        if (node.attr) { node = node[0]; }
                        return jqLiteAddClass(node, classes);
                    },
                    removeClass: function (node, classes) {
                        if (node.attr) { node = node[0]; }
                        return jqLiteRemoveClass(node, classes);
                    }
                }
            );
        };
    }

    getAnnotation = function (input, name) {
        var temp_a = 'ng - getAnnotation -> ',
            fn,
            type = '',
            flag = false,
            flag_name = '',
            $inject_args = [],
            argDecl;

        function stringifyFn(str_fn) {
            return Function.prototype.toString.call(str_fn);
        }

        function extractArgs(extract_fn) {
            var fnText,
                args = null;

            if (extract_fn && typeof extract_fn === 'function') {
                fnText = stringifyFn(extract_fn).replace(STRIP_COMMENTS, '');
                args = fnText.match(ARROW_ARG) || fnText.match(FN_ARGS);
            } else {
                msos.console.warn('ng - getAnnotation - extractArgs -> input not a function:', extract_fn);
            }

            return args;
        }

        function anonFn(annon_fn) {
            var anonFn_args = extractArgs(annon_fn);

            if (anonFn_args) {
                return 'function (' + (anonFn_args[1] || '').replace(/[\s\r\n]+/, ' ') + ')';
            }

            return 'anonymous fn';
        }

        if (msos_verbose === 'injector') {
            msos_debug(temp_a + 'start.');
        }

        if (_.isArray(input)) {

            type = 'array';
            fn = input[input.length -1];

            $inject_args = input.slice(0, input.length - 1);

        } else {

            type = typeof fn;
            fn = input;

            if (!fn.$inject) {

                if (fn.length) {

                    flag = true;

                    argDecl = extractArgs(fn);

                    forEach(
                        argDecl[1].split(FN_ARG_SPLIT),
                        function (arg) {
                            arg.replace(
                                FN_ARG,
                                function (all_na, underscore_na, inj_arg) {
                                    $inject_args.push(inj_arg);
                                }
                            );
                        }
                    );
                }

                fn.$inject = $inject_args;

            } else {

                $inject_args = fn.$inject;
            }
        }

        if (!_.isString(name)) { name = fn.name || fn.ng_name || anonFn(fn); }

        assertArgFn(fn, name, 'failed in getAnnotation.');

        if (flag) {

            if (name === '$injector') { flag_name = fn.name || fn.ng_name || anonFn(fn); }

            msos.console.warn(temp_a + $injectorMinErr('strictdi', '{0} is not using explicit injector annotation.', name)  + (flag_name ? ',\n     (ref: ' + flag_name + ')' : ''));
        }

        if (msos_verbose === 'injector') {
            msos_debug(temp_a + 'done, for input: ' + type + ', function: ' + name + ',\n     injections args:', $inject_args);
        }

        return $inject_args;
    };

    ////////////////////////////////////
    // Module Loading
    ////////////////////////////////////
    function loadModules(modules_to_load, _injector, _instance) {

        var temp_lm = 'ng - loadModules',
            run_blocks = [],
            moduleFn;

        msos_debug(temp_lm + ' -> start:', modules_to_load);

        if (!_.isArray(modules_to_load)) {
            msos.console.warn(temp_lm + ' ->  done: input not array!', modules_to_load);
            return run_blocks;
        }

        if (modules_to_load.length === 0) {
            msos_debug(temp_lm + ' ->  done, no input.');
            return run_blocks;
        }

        function runInvokeQueue(queue) {
            var temp_ri = temp_lm + ' - runInvokeQueue -> ',
                i = 0,
                invokeArgs,
                invokeArray,
                riq_provider;

            if (msos_verbose) {
                msos_debug(temp_ri + 'start, queue: ' + queue.length);
            }

            for (i = 0; i < queue.length; i += 1) {
                invokeArgs = queue[i];
                // Build our apply input array...including the service name (invokeArgs[0])
                // Note: invokeArgs[2] is an arguments object, and not just an array object
                invokeArray = [
                    invokeArgs[2][0],
                    invokeArgs[2][1],
                    invokeArgs[2][2] || undefined,
                    invokeArgs[2][3] || invokeArgs[0]
                ];

                if (msos_verbose === 'injector') {
                    msos_debug(temp_ri + 'run: ' + invokeArgs[0] + '.' + invokeArgs[1] + ', for:', invokeArray);
                }

                riq_provider = _injector.get(invokeArgs[0]);
                riq_provider[invokeArgs[1]].apply(riq_provider, invokeArray);
            }

            if (msos_verbose) {
                msos_debug(temp_ri + ' done!');
            }
        }

        forEach(
            modules_to_load,
            function (module) {
                var module_name,
                    debug_note = [];

                module_name = _.isArray(module) ? module[0] : _.isFunction(module) ? module.name : module;

                if (msos_verbose) {
                    msos_debug(temp_lm + '(foreach) start, module: ' + module_name);
                }

                if (!module_name || !_.isString(module_name)) {
                    msos.console.error(temp_lm + 'failed, module name:', module_name);
                }

                if (!angular.loaded_modules.get(module)) {

                    // Record it as loaded (only do it once)
                    angular.loaded_modules.set(module, true);

                    if (_.isString(module)) {
                        debug_note.push('as string');

                        moduleFn = angularModule(module);

                        _injector.modules[module] = moduleFn;

                        if (moduleFn.requires.length) {
                            run_blocks = run_blocks.concat(loadModules(moduleFn.requires, _injector)).concat(moduleFn._runBlocks);
                        } else {
                            run_blocks = run_blocks.concat(moduleFn._runBlocks);
                        }

                        runInvokeQueue(moduleFn._invokeQueue);
                        runInvokeQueue(moduleFn._configBlocks);

                    } else if (_.isFunction(module)) {
                        debug_note.push('as function');

                        run_blocks.push(
                            _injector.invoke(
                                module,
                                undefined,
                                undefined,
                                module_name
                            )
                        );
                    } else if (_.isArray(module)) {
                        debug_note.push('as array');

                        run_blocks.push(
                            _injector.invoke(
                                module,
                                undefined,
                                undefined,
                                module_name
                            )
                        );
                    } else {
                        debug_note.push('as arg function');
                        assertArgFn(module, 'module', 'failed in loadModules.');
                    }

                } else {

                    debug_note.push('already loaded');
                }

                if (msos_verbose) {
                    msos_debug(temp_lm + '(foreach)  done, module: ' + module_name + ', ' + debug_note.join(', '));
                }
            }
        );

        if (_instance) {
            forEach(
                run_blocks,
                function (fn, idx) {
                    if (fn) { _instance.invoke(fn, undefined, undefined, 'runBlocks' + idx); }
                }
            );
        }

        msos_debug(temp_lm + ' done:', modules_to_load);

        return run_blocks;
    }

    function createInjector(modulesToLoad) {
        var temp_ci = 'ng - createInjector',
            providerCache = {},
            instanceCache = {},
            instanceInjector = null,
            INSTANTIATING = { dumby: 'object' },
            service_path = [],
            civ = msos_verbose === 'injector';

        msos.console.info(temp_ci + ' ===> start:', modulesToLoad);

        ////////////////////////////////////
        // $provider
        ////////////////////////////////////
        function supportObject(delegate) {
            return function (key, value) {
                if (_.isObject(key)) {
                    forEach(key, reverseParams(delegate));
                } else {
                    return delegate(key, value);
                }

                return undefined;
            };
        }

        function provider(name, provider_input) {

            var db_out = name + ', ' + name + providerSuffix;

            if (msos_verbose === 'injector') {
                msos_debug(temp_ci + ' - provider -> start: ' + db_out);
            }

            assertNotHasOwnProperty(name, 'service');

            if (_.isFunction(provider_input) || _.isArray(provider_input)) {
                provider_input = providerCache.$injector.instantiate(provider_input, undefined, name);
            }

            if (!provider_input.$get) {
                throw $injectorMinErr(
                    'pget',
                    'Provider \'{0}\' must define $get factory method.',
                    name
                );
            }

            if (msos_verbose === 'injector') {
                msos_debug(temp_ci + ' - provider ->  done: ' + db_out);
            }

            // Cache the current provider
            providerCache[name + providerSuffix] = provider_input;

            return provider_input;
        }

        function enforceReturnValue(name, factory) {
            return function enforced_return_value() {
                var result = instanceInjector.invoke(
                        factory,
                        this,
                        undefined,
                        name || 'enforceReturnValue'
                    );

                if (_.isUndefined(result)) {
                    throw $injectorMinErr(
                        'undef',
                        'Provider \'{0}\' must return a value from $get factory method.',
                        name
                    );
                }

                return result;
            };
        }

        function factory(name, factoryFn) {
            return provider(
                name,
                { $get: enforceReturnValue(name, factoryFn) }
            );
        }

        function service(name, constructor) {
            if (msos_verbose) {
                msos_debug(temp_ci + ' - service -> called: ' + name);
            }
            return factory(name, ['$injector', function ($injector) {
                return $injector.instantiate(constructor, undefined, name);
            }]);
        }

        function value(name, val) {
            if (msos_verbose) {
                msos_debug(temp_ci + ' - value -> called: ' + name);
            }
            return factory(name, valueFn(val));
        }

        function constant(name, value) {
            if (msos_verbose) {
                msos_debug(temp_ci + ' - constant -> called: ' + name);
            }
            assertNotHasOwnProperty(name, 'constant');
            providerCache[name] = value;
            instanceCache[name] = value;
        }

        function decorator(serviceName, decorFn) {
            var dec_name = serviceName + providerSuffix,
                origProvider = providerCache.$injector.get(dec_name),
                orig$get = origProvider.$get;

            if (msos_verbose === 'module') {
                msos_debug(temp_ci + ' - decorator -> called: ' + dec_name, origProvider, orig$get, decorFn);
            }

            origProvider.$get = function () {
                var origInstance = instanceInjector.invoke(
                        orig$get,
                        origProvider,
                        undefined,
                        dec_name
                    ),
                    decorInstance;

                if (msos_verbose) {
                    msos_debug(temp_ci + ' - decorator - origProvider.$get -> start, for: ' + dec_name + ',  original instance:', origInstance);
                }

                decorInstance = instanceInjector.invoke(
                    decorFn,
                    null,
                    { $delegate: origInstance },
                    dec_name 
                );

                if (msos_verbose) {
                    msos_debug(temp_ci + ' - decorator - origProvider.$get ->  done, for: ' + dec_name + ', decorator instance:', decorInstance);
                }

                return decorInstance;
            };
        }

        providerCache = {
            $provide: {
                provider:   supportObject(provider),
                factory:    supportObject(factory),
                service:    supportObject(service),
                value:      supportObject(value),
                constant:   supportObject(constant),
                decorator:  decorator
            }
        };

        ////////////////////////////////////
        // internal Injector
        ////////////////////////////////////
        function internal(cache, factory, whichone) {
            var temp_cii = ' - internal';

            function getService(serviceName, caller) {
                var debug_out = ', name: ' + serviceName;

                if (civ) {
                    msos_debug(temp_ci + temp_cii + ' - getService -> start (' + whichone + ')' + debug_out);
                }

                // Already available
                if (cache.hasOwnProperty(serviceName)) {

                    debug_out += ' (exists)';

                // Has proper factory function specified
                } else if (factory !== noop) {

                    cache[serviceName] = INSTANTIATING;

                    try {
                        cache[serviceName] = factory(serviceName, caller);
                    } catch (err) {
                        msos.console.error(temp_ci + temp_cii + ' - getService -> failed (' + whichone + ')' + debug_out, err);
                    }

                    if (cache[serviceName] === INSTANTIATING) {
                        delete cache[serviceName];
                        service_path.unshift(serviceName);
                        debug_out += ' (create failed for ' + service_path.join(' <- ') + ')';
                    } else {
                        debug_out += ' (created)';
                    }

                // F'd up
                } else {
                    service_path.unshift(serviceName);
                    debug_out += ' (skipped for ' + service_path.join(' <- ') + ')';
                }

                if (civ) {
                    msos_debug(temp_ci + temp_cii + ' - getService ->  done (' + whichone + ')' + debug_out);
                }

                return cache[serviceName];
            }

            function injectionArgs(fn, locals, serviceName) {

                var temp_ir = temp_ci + temp_cii + ' - injectionArgs -> ',
                    inputs = [],
                    $inject_ia,
                    i = 0,
                    key;

                if (civ) {
                    msos_debug(temp_ir + 'start (' + whichone + '), for: ' + serviceName + ', locals:', locals);
                }

                $inject_ia = getAnnotation(fn, serviceName);

                for (i = 0; i < $inject_ia.length; i += 1) {
                    key = $inject_ia[i];

                    if (typeof key !== 'string') {
                        msos.console.error(temp_ir + ' failed, for: ' + serviceName, key);
                    } else {
                        inputs.push(locals && locals.hasOwnProperty(key) ? locals[key] : getService(key, serviceName));
                    }
                }

                if (civ) {
                    msos_debug(temp_ir + ' done (' + whichone + '), for: ' + serviceName + ', inputs:', inputs);
                }

                return inputs;
            }

            function invoke(fn, self, locals, serviceName) {

                if (civ) {
                    msos_debug(temp_ci + temp_cii + ' - invoke -> start (' + whichone + '), for: ' + serviceName + ', self:', self);
                }

                var inject = injectionArgs(fn, locals, serviceName),
                    invoke_out;

                if (_.isArray(fn)) { fn = fn[fn.length - 1]; }

                if (fn !== noop) {
                    if (msos_verbose) {
                        if ((_.compact(inject)).length !== inject.length) {
                            msos.console.error(temp_ci + temp_cii + ' - invoke -> failed, (injection variable). Was it properly "required"? Ref:', fn);
                            return invoke_out;
                        }
                        try {
                            invoke_out = fn.apply(self, inject);
                        } catch(e) {
                            msos.console.error(temp_ci + temp_cii + ' - invoke -> failed, for: ' + serviceName, self, inject, e);
                        }
                    } else {
                        invoke_out = fn.apply(self, inject);
                    }
                } else {
                    msos.console.warn(temp_ci + temp_cii + ' - invoke -> noop, for inject:', inject);
                }

                if (civ) {
                    msos_debug(temp_ci + temp_cii + ' - invoke ->  done (' + whichone + '), for: ' + serviceName, + ', output:', invoke_out);
                }

                return invoke_out;
            }

            function instantiate(fn, locals, serviceName) {

                if (civ) {
                    msos_debug(temp_ci + temp_cii + ' - instantiate -> start (' + whichone + '), for: ' + serviceName);
                }

                var inject = injectionArgs(fn, locals, serviceName),
                    FProBA,
                    instan_out;

                if (_.isArray(fn)) { fn = fn[fn.length - 1]; }

                inject.unshift(null);

                FProBA = BIND.apply(fn, inject);

                instan_out = new FProBA();

                if (civ) {
                    msos_debug(temp_ci + temp_cii + ' - instantiate ->  done (' + whichone + '), for: ' + serviceName);
                }

                return instan_out;
            }

            return {
                invoke: invoke,
                instantiate: instantiate,
                get: getService,
                annotate: getAnnotation,
                has: function (name) {
                    var has_prov_cache = providerCache.hasOwnProperty(name + providerSuffix),
                        has_cache = cache.hasOwnProperty(name);

                    if (has_prov_cache) {
                        msos_debug(temp_ci + temp_cii + ' - has -> providerCache: ' + name + providerSuffix);
                    }

                    if (has_cache) {
                        msos_debug(temp_ci + temp_cii + ' - has -> cache: ' + name);
                    }

                    return has_prov_cache || has_cache;
                },
                whichone: whichone
            };
        }

        if (msos_verbose) {
            msos_debug(temp_ci + ' ===> create providerCache.$injector');
        }

        providerCache.$injector = internal(
            providerCache,
            noop,
            'providerCache'
        );

        if (msos_verbose) {
            msos_debug(temp_ci + ' ===> create instanceCache.protoInstanceInjector');
        }

        instanceCache.protoInstanceInjector = { invoke: noop };

        instanceCache.protoInstanceInjector = internal(
            instanceCache,
            function (serviceName, caller) {
                var temp_pi = ' - instanceCache.protoInstanceInjector',
                    provid_service = serviceName + providerSuffix,
                    provid_inject,
                    output;

                if (civ) {
                    msos_debug(temp_ci + temp_pi + ' -> start, for: ' + provid_service);
                }

                provid_inject = providerCache.$injector.get(provid_service, caller);

                if (_.isObject(provid_inject)) {
                    output = instanceCache.protoInstanceInjector.invoke(
                        provid_inject.$get,
                        provid_inject,
                        undefined,
                        serviceName
                    );
                } else {
                    msos.console.error(temp_ci + temp_pi + ' -> failed, for missing provider injector: ' + provid_service);
                }

                if (civ) {
                    msos_debug(temp_ci + temp_pi + ' ->  done, for: ' + provid_service);
                }
                return output;
            },
            'instanceCache'
        );

        providerCache['$injector' + providerSuffix] = { $get: valueFn(instanceCache.protoInstanceInjector) };

        // Create the instance injector (using 'get')
        instanceInjector = instanceCache.protoInstanceInjector.get('$injector');

        providerCache.$injector.modules = createMap();

        loadModules(modulesToLoad, providerCache.$injector, instanceInjector);

        msos.console.info(temp_ci + ' ===> done!');

        return instanceInjector;
    }

    createInjector.$$annotate = getAnnotation;

    function bootstrap(bs_element, bs_modules, bs_config) {

        if (!_.isObject(bs_config)) { bs_config = {}; }

        var temp_b = 'ng - bootstrap',
            doBootstrap = null,
            bs_injector;

        bs_config = extend({}, bs_config);

        msos_debug(temp_b + ' 8==> start, config:', bs_config);

        if (bindbootstrapFired) {
            msos.console.warn(temp_b + ' 8==> done, already fired!');
            return undefined;
        }

        bindbootstrapFired = true;

        doBootstrap = function () {

            var temp_db = ' - doBootstrap',
                tag = '',
                dB_injector = null;

            bs_element = jqLite(bs_element);

            tag = (bs_element[0] === window.document) ? 'document' : nodeName_(bs_element);

            msos_debug(temp_b + temp_db + ' 8==>~ start, attached to: ' + tag);

            bs_modules = bs_modules || [];
            bs_modules.unshift(['$provide', function ($provide) {
                $provide.value('$rootElement', bs_element);
            }]);

            if (bs_config.debugInfoEnabled) {
                // Pushing so that this overrides `debugInfoEnabled` setting defined in user's `modules`.
                bs_modules.push(
                    [
                        '$compileProvider',
                        function ($compileProvider) {
                            $compileProvider.debugInfoEnabled(true);
                        }
                    ]
                );
            }

            bs_modules.unshift('ng');

            dB_injector = createInjector(bs_modules);

            dB_injector.invoke(
                [
                    '$rootScope', '$rootElement', '$compile', '$injector',
                    function bootstrapApply(_rootScope,_rootElement, _compile, _injector) {

                        msos.console.info(temp_b + temp_db + ' - bootstrapApply 8==>~.. start, node: ' + nodeName_(_rootElement) + (_rootElement[0].id ? '#' + _rootElement[0].id : ''));

                        _rootScope.$apply(
                            function rootscopeApply() {
                                _rootElement.data('$injector', _injector);
                                _compile(_rootElement)(_rootScope);
                            }
                        );

                        msos.console.info(temp_b + temp_db + ' - bootstrapApply 8==>~..  done!');
                    }
                ],
                undefined,
                undefined,
                'doBootstrap'
            );

            if (msos_verbose === 'module') {
                msos_debug(temp_b + ' - doBootstrap 8==>~ defined modules and injection var\'s:', angular.registered_modules, angular.registered_injectors);
            }

            msos_debug(temp_b + ' - doBootstrap 8==>~ done!');
            return dB_injector;
        };

        bs_injector = doBootstrap();

        msos_debug(temp_b + ' 8==>  done!');
        return bs_injector;
    }

    function bootstrap_deferred(bsd_element, bsd_modules, bsd_config) {
        var bs_delay = end_time - start_time;   // Add some proportional amount of delay

        // MSOS ver. of Angular much faster than Std. (this used to not be a problem)
        if (msos_verbose) { bs_delay *= 2; }

        msos_debug('ng - bootstrap_deferred -> called, delay: ' + bs_delay);
        _.delay(bootstrap, bs_delay, bsd_element, bsd_modules, bsd_config);
    }

    function $AnchorScrollProvider() {

        var autoScrollingEnabled = false;

        this.enableAutoScrolling = function () {
            autoScrollingEnabled = true;
        };

        this.$get = [
            '$window', '$location', '$rootScope',
            function($window, $location, $rootScope) {
                var document = $window.document,
                    temp_as = 'ng - $AnchorScrollProvider - $get',
                    anchor_scroll;

                function getFirstAnchor(list) {
                    var result = null;

                    Array.prototype.some.call(
                        list,
                        function (element) {
                            if (nodeName_(element) === 'a') {
                                result = element;
                                return true;
                            }

                            return undefined;
                        }
                    );
                    return result;
                }

                function getYOffset() {

                    var offset = anchor_scroll.yOffset,
                        elem,
                        style;

                    if (_.isFunction(offset)) {
                        offset = offset();
                    } else if (isElement(offset)) {
                        elem = offset[0];
                        style = $window.getComputedStyle(elem);

                        if (style.position !== 'fixed') {
                            offset = 0;
                        } else {
                            offset = elem.getBoundingClientRect().bottom;
                        }
                    } else if (!_.isNumber(offset)) {
                        offset = 0;
                    }

                    return offset;
                }

                function scrollTo(elem) {
                    var offset,
                        elemTop;

                    if (elem) {
                        elem.scrollIntoView();

                        offset = getYOffset();

                        if (offset) {

                            elemTop = elem.getBoundingClientRect().top;
                            $window.scrollBy(0, elemTop - offset);
                        }
                    } else {
                        $window.scrollTo(0, 0);
                    }
                }

                anchor_scroll = function (hash) {

                    this.yOffset = 0;   // Set a default
                
                    // Allow numeric hashes
                    hash = _.isString(hash) ? hash : _.isNumber(hash) ? hash.toString() : $location.hash();

                    var elm = document.getElementById(hash) || getFirstAnchor(document.getElementsByName(hash));

                    if (!hash || hash === 'top')    { scrollTo(null); }
                    else if (elm)                   { scrollTo(elm);  }
                };

                if (autoScrollingEnabled) {
                    $rootScope.$watch(
                        function autoScrollWatch() {
                            var loc = $location.hash();
                            msos_debug(temp_as + ' - autoScrollWatch -> fired, location:', loc);
                            return loc;
                        }
                    );
                }

                return anchor_scroll;
            }
        ];
    }

    $AnchorScrollProvider.$$moduleName = 'ng';

    function mergeClasses(a, b) {
        if (!a && !b)   { return ''; }
        if (!a)         { a = ''; }
        if (!b)         { b = ''; }
        if (_.isArray(a)) { a = a.join(' '); }
        if (_.isArray(b)) { b = b.join(' '); }
        return a + (b ? (a ? ' ' : '') + b : '');
    }

    function splitClasses(classes) {
        var obj = createMap(),
            classes_arry = [];

        if (_.isString(classes)) {
            classes_arry = classes.split(SPACE);
        } else if (_.isArray(classes)) {
            classes_arry = classes;
        }

        forEach(
            classes_arry,
            function (klass) {
                if (klass.length) { obj[klass] = true; }
            }
        );

        return obj;
    }

    function prepareAnimateOptions(options) {
        return isObject(options) ? options : {};
    }

    $$AnimateJsProvider = ['$animateProvider', function ($animateProvider) {

        this.$get = ['$injector', '$$jqLite', '$$AnimateRunner', function ($injector, $$jqLite, $$AnimateRunner) {

            var applyAnimationClasses = applyAnimationClassesFactory($$jqLite);

            function lookupAnimations(classes) {

                classes = _.isArray(classes) ? classes : classes.split(' ');

                var matches = [],
                    flagMap = {},
                    i = 0,
                    klass,
                    animationFactory;

                for (i = 0; i < classes.length; i += 1) {

                    klass = classes[i];
                    animationFactory = $animateProvider.$$registeredAnimations[klass];

                    if (animationFactory && !flagMap[klass]) {
                        matches.push($injector.get(animationFactory));
                        flagMap[klass] = true;
                    }
                }

                return matches;
            }

            function AnimateJsProviderGet(element, event, classes, options) {
                var animationClosed = false,
                    classesToAdd,
                    classesToRemove,
                    animations,
                    before,
                    after,
                    runner,
                    afterFn,
                    beforeFn;

                if (arguments.length === 3 && isObject(classes)) {
                    options = classes;
                    classes = null;
                }

                options = prepareAnimationOptions(options);

                if (!classes) {
                    classes = element.attr('class') || '';
                    if (options.addClass) {
                        classes += ' ' + options.addClass;
                    }
                    if (options.removeClass) {
                        classes += ' ' + options.removeClass;
                    }
                }

                classesToAdd = options.addClass;
                classesToRemove = options.removeClass;
                animations = lookupAnimations(classes);

                function executeAnimationFn(fn, element, event, options, onDone) {
                    var args,
                        value;

                    switch (event) {
                        case 'animate':
                            args = [element, options.from, options.to, onDone];
                            break;

                        case 'setClass':
                            args = [element, classesToAdd, classesToRemove, onDone];
                            break;

                        case 'addClass':
                            args = [element, classesToAdd, onDone];
                            break;

                        case 'removeClass':
                            args = [element, classesToRemove, onDone];
                            break;

                        default:
                            args = [element, onDone];
                            break;
                    }

                    args.push(options);

                    value = fn.apply(fn, args);

                    if (value) {
                        if (_.isFunction(value.start)) {
                            value = value.start();
                        }

                        if (value instanceof $$AnimateRunner) {
                            value.done(onDone);
                        } else if (_.isFunction(value)) {
                            return value;
                        }
                    }

                    return noop;
                }

                function groupEventedAnimations(element, event, options, animations, fnName) {
                    var operations = [];

                    forEach(animations, function (ani) {
                        var animation = ani[fnName];

                        if (!animation) { return; }

                        // note that all of these animations will run in parallel
                        operations.push(function () {
                            var runner,
                                endProgressCb,
                                resolved = false,
                                onAnimationComplete = function (rejected) {
                                    if (!resolved) {
                                        resolved = true;
                                        (endProgressCb || noop)(rejected);
                                        runner.complete(!rejected);
                                    }
                                };

                            runner = new $$AnimateRunner({
                                end: function () {
                                    onAnimationComplete();
                                },
                                cancel: function () {
                                    onAnimationComplete(true);
                                }
                            });

                            endProgressCb = executeAnimationFn(animation, element, event, options, function (result) {
                                var cancelled = result === false;
                                onAnimationComplete(cancelled);
                            });

                            return runner;
                        });
                    });

                    return operations;
                }

                function packageAnimations(element, event, options, animations, fnName) {
                    var operations = groupEventedAnimations(element, event, options, animations, fnName),
                        a,
                        b;

                    if (operations.length === 0) {

                        if (fnName === 'beforeSetClass') {
                            a = groupEventedAnimations(element, 'removeClass', options, animations, 'beforeRemoveClass');
                            b = groupEventedAnimations(element, 'addClass', options, animations, 'beforeAddClass');
                        } else if (fnName === 'setClass') {
                            a = groupEventedAnimations(element, 'removeClass', options, animations, 'removeClass');
                            b = groupEventedAnimations(element, 'addClass', options, animations, 'addClass');
                        }

                        if (a) {
                            operations = operations.concat(a);
                        }
                        if (b) {
                            operations = operations.concat(b);
                        }
                    }

                    if (operations.length === 0) { return undefined; }

                    function startAnimation(callback) {

                        var runners = [];

                        if (operations.length) {
                            forEach(operations, function (animateFn) {
                                runners.push(animateFn());
                            });
                        }

                        if (runners.length) {
                            $$AnimateRunner.all(runners, callback);
                        } else {
                            callback();
                        }

                        function endFn(reject) {
                            forEach(runners, function (runner) {
                                if (reject) {
                                    runner.cancel();
                                } else {
                                    runner.end();
                                }
                            });
                        }

                        return endFn;
                    }

                    return startAnimation;
                }

                if (animations.length) {

                    if (event === 'leave') {
                        beforeFn = 'leave';
                        afterFn = 'afterLeave';
                    } else {
                        beforeFn = 'before' + event.charAt(0).toUpperCase() + event.substr(1);
                        afterFn = event;
                    }

                    if (event !== 'enter' && event !== 'move') {
                        before = packageAnimations(element, event, options, animations, beforeFn);
                    }

                    after = packageAnimations(element, event, options, animations, afterFn);
                }

                // no matching animations
                if (!before && !after) { return undefined; }

                function applyOptions() {
                    options.domOperation();
                    applyAnimationClasses(element, options);
                }

                function close() {
                    animationClosed = true;
                    applyOptions();
                    applyAnimationStyles(element, options);
                }

                return {
                    $$willAnimate: true,
                    end: function () {
                        if (runner) {
                            runner.end();
                        } else {
                            close();
                            runner = new $$AnimateRunner();
                            runner.complete(true);
                        }
                        return runner;
                    },
                    start: function () {

                        if (runner) {
                            return runner;
                        }

                        runner = new $$AnimateRunner();

                        var closeActiveAnimations,
                            chain = [];

                        if (before) {
                            chain.push(function (fn) {
                                closeActiveAnimations = before(fn);
                            });
                        }

                        if (chain.length) {
                            chain.push(function (fn) {
                                applyOptions();
                                fn(true);
                            });
                        } else {
                            applyOptions();
                        }

                        if (after) {
                            chain.push(function (fn) {
                                closeActiveAnimations = after(fn);
                            });
                        }

                        function onComplete(success) {
                            close(success);
                            runner.complete(success);
                        }

                        function endAnimations(cancelled) {
                            if (!animationClosed) {
                                (closeActiveAnimations || noop)(cancelled);
                                onComplete(cancelled);
                            }
                        }

                        runner.setHost({
                            end: function () {
                                endAnimations();
                            },
                            cancel: function () {
                                endAnimations(true);
                            }
                        });

                        $$AnimateRunner.chain(chain, onComplete);

                        return runner;
                    }
                };
            }

            return AnimateJsProviderGet;
        }];
    }];

    $$AnimateJsDriverProvider = ['$$animationProvider', function ($$animationProvider) {
        var temp_aj = 'ng/animate - $$AnimateJsDriverProvider';

        msos_debug(temp_aj + ' -> start.');

        $$animationProvider.drivers.push('$$animateJsDriver');

        this.$get = ['$$animateJs', '$$AnimateRunner', function ($$animateJs, $$AnimateRunner) {

            msos_debug(temp_aj + ' - $get -> start.');

            function prepareAnimation(animationDetails) {
                var element = animationDetails.element,
                    event = animationDetails.event,
                    options = animationDetails.options,
                    classes = animationDetails.classes;

                return $$animateJs(element, event, classes, options);
            }

            function initDriverFn(animationDetails) {
                var temp_id = temp_aj + ' - $$AnimateJsDriverProvider - initDriverFn -> ',
                    fromAnimation,
                    toAnimation;

                if (msos_verbose === 'animate') {
                    msos_debug(temp_id + 'start, details:', animationDetails);
                }

                if (animationDetails.from && animationDetails.to) {

                    fromAnimation = prepareAnimation(animationDetails.from);
                    toAnimation = prepareAnimation(animationDetails.to);

                    if (!fromAnimation && !toAnimation) {
                        msos_debug(temp_id + ' done, w/o animations.');
                        return undefined;
                    }

                    msos_debug(temp_id + ' done, w/ animations.');
                    return {
                        start: function () {
                            var animationRunners = [],
                                runner;

                            if (fromAnimation) {
                                animationRunners.push(fromAnimation.start());
                            }

                            if (toAnimation) {
                                animationRunners.push(toAnimation.start());
                            }

                            function endFnFactory() {
                                return function () {
                                    forEach(animationRunners, function (runner) {
                                        // at this point we cannot cancel animations for groups just yet. 1.5+
                                        runner.end();
                                    });
                                };
                            }

                            function done(status) {
                                runner.complete(status);
                            }

                            $$AnimateRunner.all(animationRunners, done);

                            runner = new $$AnimateRunner({
                                end: endFnFactory(),
                                cancel: endFnFactory()
                            });

                            return runner;
                        }
                    };
                }

                if (msos_verbose === 'animate') {
                    msos_debug(temp_id + ' done, prepare animations.');
                }

                return prepareAnimation(animationDetails);
            }

            msos_debug(temp_aj + ' - $get -> done!');

            return initDriverFn;
        }];

        msos_debug(temp_aj + ' ->  done!');
    }];

    $$AnimateQueueProvider = ['$animateProvider', function ($animateProvider) {
        var PRE_DIGEST_STATE = 1,
            RUNNING_STATE = 2,
            ONE_SPACE = ' ',
            rules = {      // Experimental, was rules = this.rules = {
                skip: [],
                cancel: [],
                join: []
            };

        function makeTruthyCssClassMap(classString) {
            if (!classString) {
                return null;
            }

            var keys = classString.split(ONE_SPACE),
                map = Object.create(null);

            forEach(keys, function (key) {
                map[key] = true;
            });

            return map;
        }

        function hasMatchingClasses(newClassString, currentClassString) {
            if (newClassString && currentClassString) {
                var currentClassMap = makeTruthyCssClassMap(currentClassString);

                return newClassString.split(ONE_SPACE).some(
                    function (className) {
                        return currentClassMap[className];
                    }
                );
            }
            return undefined;
        }

        function isAllowed(ruleType, currentAnimation, previousAnimation) {
            return rules[ruleType].some(function (fn) {
                return fn(currentAnimation, previousAnimation);
            });
        }

        function hasAnimationClasses(animation, and) {
            var a = (animation.addClass || '').length > 0,
                b = (animation.removeClass || '').length > 0;

            return and ? a && b : a || b;
        }

        rules.join.push(function (newAnimation) {
            return !newAnimation.structural && hasAnimationClasses(newAnimation);
        });

        rules.skip.push(function (newAnimation) {
            return !newAnimation.structural && !hasAnimationClasses(newAnimation);
        });

        rules.skip.push(function (newAnimation, currentAnimation) {
            return currentAnimation.event === 'leave' && newAnimation.structural;
        });

        rules.skip.push(function (newAnimation, currentAnimation) {
            return currentAnimation.structural && currentAnimation.state === RUNNING_STATE && !newAnimation.structural;
        });

        rules.cancel.push(function (newAnimation, currentAnimation) {
            return currentAnimation.structural && newAnimation.structural;
        });

        rules.cancel.push(function (newAnimation, currentAnimation) {
            return currentAnimation.state === RUNNING_STATE && newAnimation.structural;
        });

        rules.cancel.push(function (newAnimation, currentAnimation) {

            if (currentAnimation.structural) { return false; }

            var nA = newAnimation.addClass,
                nR = newAnimation.removeClass,
                cA = currentAnimation.addClass,
                cR = currentAnimation.removeClass;

            // early detection to save the global CPU shortage :)
            if ((_.isUndefined(nA) && _.isUndefined(nR)) || (_.isUndefined(cA) && _.isUndefined(cR))) {
                return false;
            }

            return hasMatchingClasses(nA, cR) || hasMatchingClasses(nR, cA);
        });

        this.$get = ['$$jqLite', '$$rAF', '$rootScope', '$rootElement', '$document', '$$Map',
            '$$animation', '$$AnimateRunner', '$templateRequest', '$$isDocumentHidden',
            function ($$jqLite, $$rAF, $rootScope, $rootElement, $document, $$Map,
                $$animation, $$AnimateRunner, $templateRequest, $$isDocumentHidden) {

                var activeAnimationsLookup = new $$Map(),
                    disabledElementsLookup = new $$Map(),
                    animationsEnabled = null,
                    deregisterWatch,
                    callbackRegistry,
                    customFilter_AQP,
                    classNameFilter_AQP,
                    returnTrue = function animate_return_true() { return true; },
                    isAnimatableByFilter,
                    isAnimatableClassName,
                    applyAnimationClasses,
                    contains,
                    $animate;

                function postDigestTaskFactory() {
                    var postDigestCalled = false;

                    return function (fn) {
                        if (postDigestCalled) {
                            fn();
                        } else {
                            $rootScope.$$postDigest(function () {
                                postDigestCalled = true;
                                fn();
                            });
                        }
                    };
                }

                deregisterWatch = $rootScope.$watch(
                    function () {
                        return $templateRequest.totalPendingRequests === 0;
                    },
                    function (isEmpty) {
                        if (!isEmpty) { return; }

                        deregisterWatch();

                        $rootScope.$$postDigest(function () {
                            $rootScope.$$postDigest(function () {
                                if (animationsEnabled === null) {
                                    animationsEnabled = true;
                                }
                            });
                        });
                    }
                );

                callbackRegistry = Object.create(null);

                customFilter_AQP = $animateProvider.customFilter();
                classNameFilter_AQP = $animateProvider.classNameFilter();

                isAnimatableByFilter = customFilter_AQP || returnTrue;
                isAnimatableClassName = !classNameFilter_AQP ? returnTrue : function (node, options) {
                    var className = [node.getAttribute('class'), options.addClass, options.removeClass].join(' ');

                    return classNameFilter_AQP.test(className);
                };

                applyAnimationClasses = applyAnimationClassesFactory($$jqLite);

                function normalizeAnimationDetails(element, animation) {
                    return mergeAnimationDetails(element, animation, {});
                }

                contains = window.Node.prototype.contains || function (arg) {
                    return this === arg || !!(this.compareDocumentPosition(arg) & 16);
                };

                function findCallbacks(targetParentNode, targetNode, event) {
                    var matches = [],
                        entries = callbackRegistry[event];

                    if (entries) {
                        forEach(entries, function (entry) {
                            if (contains.call(entry.node, targetNode)) {
                                matches.push(entry.callback);
                            } else if (event === 'leave' && contains.call(entry.node, targetParentNode)) {
                                matches.push(entry.callback);
                            }
                        });
                    }

                    return matches;
                }

                function filterFromRegistry(list, matchContainer, matchCallback) {
                    var containerNode = extractElementNode(matchContainer);

                    return list.filter(function (entry) {
                        var isMatch = entry.node === containerNode && (!matchCallback || entry.callback === matchCallback);

                        return !isMatch;
                    });
                }

                function cleanupEventListeners(phase, node) {
                    if (phase === 'close' && !node.parentNode) {
                        $animate.off(node);
                    }
                }

                function clearElementAnimationState(node) {
                    node.removeAttribute(NG_ANIMATE_ATTR_NAME);
                    activeAnimationsLookup['delete'](node);
                }

                function markElementAnimationState(node, state, details) {

                    details = details || {};
                    details.state = state;

                    var oldValue,
                        newValue;

                    node.setAttribute(NG_ANIMATE_ATTR_NAME, state);

                    oldValue = activeAnimationsLookup.get(node);
                    newValue = oldValue ? extend(oldValue, details) : details;

                    activeAnimationsLookup.set(node, newValue);
                }

                function closeChildAnimations(node) {
                    var children = node.querySelectorAll('[' + NG_ANIMATE_ATTR_NAME + ']');

                    forEach(children, function (child) {
                        var state = parseInt(child.getAttribute(NG_ANIMATE_ATTR_NAME), 10),
                            animationDetails = activeAnimationsLookup.get(child);

                        if (animationDetails) {
                            switch (state) {
                                case RUNNING_STATE:
                                    animationDetails.runner.end();      // Leave as is
                                    /* falls through */
                                case PRE_DIGEST_STATE:
                                    activeAnimationsLookup['delete'](child);
                                    break;
                            }
                        }
                    });
                }

                function areAnimationsAllowed(node, parentNode) {
                    var bodyNode = $document[0].body,
                        rootNode = getDomNode($rootElement),
                        bodyNodeDetected = (node === bodyNode) || node.nodeName === 'HTML',
                        rootNodeDetected = (node === rootNode),
                        parentAnimationDetected = false,
                        elementDisabled = disabledElementsLookup.get(node),
                        animateChildren,
                        parentHost = jqLite.data(node, NG_ANIMATE_PIN_DATA),
                        details,
                        parentNodeDisabled,
                        value,
                        allowAnimation;

                    if (parentHost) {
                        parentNode = getDomNode(parentHost);
                    }

                    while (parentNode) {
                        if (!rootNodeDetected) {
                            rootNodeDetected = (parentNode === rootNode);
                        }

                        if (parentNode.nodeType !== NODE_TYPE_ELEMENT) {
                            break;
                        }

                        details = activeAnimationsLookup.get(parentNode) || {};

                        if (!parentAnimationDetected) {

                            parentNodeDisabled = disabledElementsLookup.get(parentNode);

                            if (parentNodeDisabled === true && elementDisabled !== false) {
                                elementDisabled = true;
                                break;
                            } else if (parentNodeDisabled === false) {
                                elementDisabled = false;
                            }

                            parentAnimationDetected = details.structural;
                        }

                        if (_.isUndefined(animateChildren) || animateChildren === true) {
                            value = jqLite.data(parentNode, NG_ANIMATE_CHILDREN_DATA);

                            if (isDefined(value)) {
                                animateChildren = value;
                            }
                        }

                        if (parentAnimationDetected && animateChildren === false) { break; }

                        if (!bodyNodeDetected) {
                            bodyNodeDetected = (parentNode === bodyNode);
                        }

                        if (bodyNodeDetected && rootNodeDetected) { break; }

                        if (!rootNodeDetected) {
                            parentHost = jqLite.data(parentNode, NG_ANIMATE_PIN_DATA);
                            if (parentHost) {
                                parentNode = getDomNode(parentHost);
                                continue;
                            }
                        }

                        parentNode = parentNode.parentNode;
                    }

                    allowAnimation = (!parentAnimationDetected || animateChildren) && elementDisabled !== true;

                    return allowAnimation && rootNodeDetected && bodyNodeDetected;
                }

                function queueAnimation(originalElement, event, initialOptions) {
                    var options = copy(initialOptions),
                        element = stripCommentsFromElement(originalElement),
                        node = getDomNode(element),
                        parentNode = node && node.parentNode,
                        runner,
                        runInNextPostDigestOrNow,
                        className,
                        isStructural,
                        documentHidden,
                        skipAnimations,
                        existingAnimation,
                        hasExistingAnimation,
                        newAnimation,
                        skipAnimationFlag,
                        cancelAnimationFlag,
                        joinAnimationFlag,
                        isValidAnimation,
                        counter;

                    options = prepareAnimationOptions(options);

                    runner = new $$AnimateRunner();

                    runInNextPostDigestOrNow = postDigestTaskFactory();

                    if (_.isArray(options.addClass)) {
                        options.addClass = options.addClass.join(' ');
                    }

                    if (options.addClass && !_.isString(options.addClass)) {
                        options.addClass = null;
                    }

                    if (_.isArray(options.removeClass)) {
                        options.removeClass = options.removeClass.join(' ');
                    }

                    if (options.removeClass && !_.isString(options.removeClass)) {
                        options.removeClass = null;
                    }

                    if (options.from && !isObject(options.from)) {
                        options.from = null;
                    }

                    if (options.to && !isObject(options.to)) {
                        options.to = null;
                    }

                    function close(reject) {
                        clearGeneratedClasses(element, options);
                        applyAnimationClasses(element, options);
                        applyAnimationStyles(element, options);
                        options.domOperation();
                        runner.complete(!reject);
                    }

                    if (!animationsEnabled ||
                        !node ||
                        !isAnimatableByFilter(node, event, initialOptions) ||
                        !isAnimatableClassName(node, options)) {
                            close();
                            return runner;
                    }

                    isStructural = ['enter', 'move', 'leave'].indexOf(event) >= 0;
                    documentHidden = $$isDocumentHidden();

                    skipAnimations = documentHidden || disabledElementsLookup.get(node);
                    existingAnimation = (!skipAnimations && activeAnimationsLookup.get(node)) || {};
                    hasExistingAnimation = !!existingAnimation.state;

                    if (!skipAnimations && (!hasExistingAnimation || existingAnimation.state !== PRE_DIGEST_STATE)) {
                        skipAnimations = !areAnimationsAllowed(node, parentNode, event);
                    }

                    function notifyProgress(runner, event, phase, data) {
                        runInNextPostDigestOrNow(function () {
                            var callbacks = findCallbacks(parentNode, node, event);

                            if (callbacks.length) {
                                $$rAF(function () {
                                    forEach(callbacks, function (callback) {
                                        callback(element, phase, data);
                                    });
                                    cleanupEventListeners(phase, node);
                                });
                            } else {
                                cleanupEventListeners(phase, node);
                            }
                        });

                        if (runner.progress !== noop) {     // experimental
                            runner.progress(event, phase, data);
                        }
                    }

                    if (skipAnimations) {
                        if (documentHidden) { notifyProgress(runner, event, 'start'); }
                        close();
                        if (documentHidden) { notifyProgress(runner, event, 'close'); }
                        return runner;
                    }

                    if (isStructural) {
                        closeChildAnimations(node);
                    }

                    newAnimation = {
                        structural: isStructural,
                        element: element,
                        event: event,
                        addClass: options.addClass,
                        removeClass: options.removeClass,
                        close: close,
                        options: options,
                        runner: runner
                    };

                    if (hasExistingAnimation) {
                        skipAnimationFlag = isAllowed('skip', newAnimation, existingAnimation);

                        if (skipAnimationFlag) {
                            if (existingAnimation.state === RUNNING_STATE) {
                                close();
                                return runner;
                            }

                            mergeAnimationDetails(element, existingAnimation, newAnimation);
                            return existingAnimation.runner;
                        }

                        cancelAnimationFlag = isAllowed('cancel', newAnimation, existingAnimation);

                        if (cancelAnimationFlag) {
                            if (existingAnimation.state === RUNNING_STATE) {
                                existingAnimation.runner.end();
                            } else if (existingAnimation.structural) {
                                existingAnimation.close();
                            } else {
                                mergeAnimationDetails(element, existingAnimation, newAnimation);
                                return existingAnimation.runner;
                            }
                        } else {
                            joinAnimationFlag = isAllowed('join', newAnimation, existingAnimation);

                            if (joinAnimationFlag) {
                                if (existingAnimation.state === RUNNING_STATE) {
                                    normalizeAnimationDetails(element, newAnimation);
                                } else {
                                    applyGeneratedPreparationClasses(element, isStructural ? event : null, options);

                                    event = newAnimation.event = existingAnimation.event;
                                    options = mergeAnimationDetails(element, existingAnimation, newAnimation);

                                    return existingAnimation.runner;
                                }
                            }
                        }
                    } else {
                        normalizeAnimationDetails(element, newAnimation);
                    }

                    isValidAnimation = newAnimation.structural;

                    if (!isValidAnimation) {
                        isValidAnimation = (newAnimation.event === 'animate' && Object.keys(newAnimation.options.to || {}).length > 0) || hasAnimationClasses(newAnimation);
                    }

                    if (!isValidAnimation) {
                        close();
                        clearElementAnimationState(node);
                        return runner;
                    }

                    counter = (existingAnimation.counter || 0) + 1;
                    newAnimation.counter = counter;

                    markElementAnimationState(node, PRE_DIGEST_STATE, newAnimation);

                    $rootScope.$$postDigest(function () {

                        element = stripCommentsFromElement(originalElement);

                        var animationDetails = activeAnimationsLookup.get(node),
                            animationCancelled = !animationDetails,
                            parentElement,
                            isValidAnimation,
                            realRunner;

                        animationDetails = animationDetails || {};

                        parentElement = element.parent() || [];

                        isValidAnimation = parentElement.length > 0 && (animationDetails.event === 'animate' || animationDetails.structural || hasAnimationClasses(animationDetails));

                        if (animationCancelled || animationDetails.counter !== counter || !isValidAnimation) {
                            if (animationCancelled) {
                                applyAnimationClasses(element, options);
                                applyAnimationStyles(element, options);
                            }

                            if (animationCancelled || (isStructural && animationDetails.event !== event)) {
                                options.domOperation();
                                runner.end();
                            }

                            if (!isValidAnimation) {
                                clearElementAnimationState(node);
                            }

                            return;
                        }

                        event = !animationDetails.structural && hasAnimationClasses(animationDetails, true) ? 'setClass' : animationDetails.event;

                        markElementAnimationState(node, RUNNING_STATE);

                        realRunner = $$animation(element, event, animationDetails.options);

                        runner.setHost(realRunner);
                        notifyProgress(runner, event, 'start', {});

                        realRunner.done(function (status) {
    
                            close(!status);

                            var animationDetails = activeAnimationsLookup.get(node);

                            if (animationDetails && animationDetails.counter === counter) {
                                clearElementAnimationState(node);
                            }

                            notifyProgress(runner, event, 'close', {});
                        });
                    });

                    return runner;
                }

                $animate = {
                    on: function (event, container, callback) {
                        var node = extractElementNode(container);

                        callbackRegistry[event] = callbackRegistry[event] || [];
                        callbackRegistry[event].push({
                            node: node,
                            callback: callback
                        });

                        jqLite(container).on('$destroy', function () {
                            var animationDetails = activeAnimationsLookup.get(node);

                            if (!animationDetails) {
                                $animate.off(event, container, callback);
                            }
                        });
                    },

                    off: function (event, container, callback) {
                        var entries,
                            eventType;

                        if (arguments.length === 1 && !_.isString(event)) {

                            for (eventType in callbackRegistry) {   // Object.create(null) has no hasOwnProperty method
                                callbackRegistry[eventType] = filterFromRegistry(callbackRegistry[eventType], event);
                            }

                            return;
                        }

                        entries = callbackRegistry[event];

                        if (!entries) { return; }

                        callbackRegistry[event] = arguments.length === 1 ? null : filterFromRegistry(entries, container, callback);
                    },

                    pin: function (element, parentElement) {
                        assertArg(isElement(element), 'element', 'not an element');
                        assertArg(isElement(parentElement), 'parentElement', 'not an element');
                        element.data(NG_ANIMATE_PIN_DATA, parentElement);
                    },

                    push: function (element, event, options, domOperation) {
                        options = options || {};
                        options.domOperation = domOperation;
                        return queueAnimation(element, event, options);
                    },

                    enabled: function (element, bool) {
                        var hasElement,
                            node;

                        if (arguments.length === 0) {
                            bool = !!animationsEnabled;
                        } else {
                            hasElement = isElement(element);

                            if (!hasElement) {
                                bool = animationsEnabled = !!element;
                            } else {
                                node = getDomNode(element);

                                if (arguments.length === 1) {
                                    // (element) - Element getter
                                    bool = !disabledElementsLookup.get(node);
                                } else {
                                    // (element, bool) - Element setter
                                    disabledElementsLookup.set(node, !bool);
                                }
                            }
                        }

                        return bool;
                    }
                };

                return $animate;
            }
        ];
    }];

    $$AnimationProvider = function () {
        var NG_ANIMATE_REF_ATTR = 'ng-animate-ref',
            drivers = this.drivers = [],
            RUNNER_STORAGE_KEY = '$$animationRunner';

        function setRunner(element, runner) {
            element.data(RUNNER_STORAGE_KEY, runner);
        }

        function removeRunner(element) {
            element.removeData(RUNNER_STORAGE_KEY);
        }

        function getRunner(element) {
            return element.data(RUNNER_STORAGE_KEY);
        }

        this.$get = ['$$jqLite', '$rootScope', '$injector', '$$AnimateRunner', '$$Map', '$$rAFScheduler',
            function ($$jqLite, $rootScope, $injector, $$AnimateRunner, $$Map, $$rAFScheduler) {

                var temp_ap = 'ng/animate - $$AnimationProvider - $get',
                    animationQueue = [],
                    applyAnimationClasses = applyAnimationClassesFactory($$jqLite);

                msos_debug(temp_ap + ' -> start, applyAnimationClasses:', applyAnimationClasses);

                function sortAnimations(animations) {
                    var tree = {
                            children: []
                        },
                        i = 0,
                        lookup = new $$Map(),
                        animation;

                    for (i = 0; i < animations.length; i+= 1) {
                        animation = animations[i];

                        lookup.set(animation.domNode, animations[i] = {
                            domNode: animation.domNode,
                            fn: animation.fn,
                            children: []
                        });
                    }

                    function processNode(entry) {

                        if (entry.processed) { return entry; }

                        entry.processed = true;

                        var elementNode = entry.domNode,
                            parentNode = elementNode.parentNode,
                            parentEntry;

                        lookup.set(elementNode, entry);

                        while (parentNode) {
                            parentEntry = lookup.get(parentNode);
                            if (parentEntry) {
                                if (!parentEntry.processed) {
                                    parentEntry = processNode(parentEntry);
                                }
                                break;
                            }
                            parentNode = parentNode.parentNode;
                        }

                        (parentEntry || tree).children.push(entry);
                        return entry;
                    }

                    for (i = 0; i < animations.length; i += 1) {
                        processNode(animations[i]);
                    }

                    function flatten(tree) {
                        var result = [],
                            queue = [],
                            i = 0,
                            remainingLevelEntries,
                            nextLevelEntries = 0,
                            row = [],
                            entry;

                        for (i = 0; i < tree.children.length; i += 1) {
                            queue.push(tree.children[i]);
                        }

                        remainingLevelEntries = queue.length;

                        for (i = 0; i < queue.length; i += 1) {
                            entry = queue[i];

                            if (remainingLevelEntries <= 0) {
                                remainingLevelEntries = nextLevelEntries;
                                nextLevelEntries = 0;
                                result.push(row);
                                row = [];
                            }

                            row.push(entry.fn);
                            entry.children.forEach(function (childEntry) {
                                nextLevelEntries += 1;
                                queue.push(childEntry);
                            });

                            remainingLevelEntries-= 1;
                        }

                        if (row.length) {
                            result.push(row);
                        }

                        return result;
                    }

                    return flatten(tree);
                }

                function initAnimationProv(element, event, options) {

                    var temp_ia = temp_ap + ' - initAnimationProv -> ',
                        isStructural = ['enter', 'move', 'leave'].indexOf(event) >= 0,
                        runner,
                        classes,
                        tempClasses,
                        prepareClassName;

                    if (msos_verbose === 'animate') {
                        msos_debug(temp_ia + 'start.');
                    }

                    options = prepareAnimationOptions(options);

                    function handleDestroyedElement() {
                        var runner = getRunner(element);

                        if (runner && (event !== 'leave' || !options.$$domOperationFired)) {
                            runner.end();
                        }
                    }

                    function close(rejected) {
                        element.off('$destroy', handleDestroyedElement);
                        removeRunner(element);

                        applyAnimationClasses(element, options);
                        applyAnimationStyles(element, options);
                        options.domOperation();

                        if (tempClasses) {
                            $$jqLite.removeClass(element, tempClasses);
                        }

                        element.removeClass(NG_ANIMATE_CLASSNAME);
                        runner.complete(!rejected);
                    }

                    runner = new $$AnimateRunner({
                        end: function () {
                            close();
                        },
                        cancel: function () {
                            close(true);
                        }
                    });

                    if (!drivers.length) {
                        close();
                        if (msos_verbose === 'animate') {
                            msos_debug(temp_ia + ' done, no drivers, runner:', runner);
                        }
                        return runner;
                    }

                    setRunner(element, runner);

                    classes = mergeClasses(element.attr('class'), mergeClasses(options.addClass, options.removeClass));
                    tempClasses = options.tempClasses;

                    if (tempClasses) {
                        classes += ' ' + tempClasses;
                        options.tempClasses = null;
                    }

                    if (isStructural) {
                        prepareClassName = 'ng-' + event + PREPARE_CLASS_SUFFIX;
                        $$jqLite.addClass(element, prepareClassName);
                    }

                    function beforeStart() {
                        element.addClass(NG_ANIMATE_CLASSNAME);

                        if (tempClasses) {
                            $$jqLite.addClass(element, tempClasses);
                        }
                        if (prepareClassName) {
                            $$jqLite.removeClass(element, prepareClassName);
                            prepareClassName = null;
                        }
                    }

                    animationQueue.push({
                        element: element,
                        classes: classes,
                        event: event,
                        structural: isStructural,
                        options: options,
                        beforeStart: beforeStart,
                        close: close
                    });

                    element.on('$destroy', handleDestroyedElement);

                    if (animationQueue.length > 1) {
                        if (msos_verbose === 'animate') {
                            msos_debug(temp_ia + ' done, animationQueue.length > 1, runner:', runner);
                        }
                        return runner;
                    }

                    function updateAnimationRunners(animation, newRunner) {

                        function update(element) {
                            var runner = getRunner(element);

                            if (runner) { runner.setHost(newRunner); }
                        }

                        if (animation.from && animation.to) {
                            update(animation.from.element);
                            update(animation.to.element);
                        } else {
                            update(animation.element);
                        }
                    }

                    function invokeFirstDriver(animationDetails) {
                        var i = 0,
                            driverName,
                            factory,
                            driver;

                        for (i = drivers.length - 1; i >= 0; i -= 1) {
                            driverName = drivers[i];
                            factory = $injector.get(driverName);
                            driver = factory(animationDetails);

                            if (driver) {
                                return driver;
                            }
                        }

                        return undefined;
                    }

                    function cssClassesIntersection(a, b) {

                        a = a.split(' ');
                        b = b.split(' ');

                        var matches = [],
                            i = 0,
                            j = 0,
                            aa;

                        for (i = 0; i < a.length; i += 1) {
                            aa = a[i];

                            if (aa.substring(0, 3) === 'ng-') { continue; }

                            for (j = 0; j < b.length; j += 1) {
                                if (aa === b[j]) {
                                    matches.push(aa);
                                    break;
                                }
                            }
                        }

                        return matches.join(' ');
                    }

                    function getAnchorNodes(node) {
                        var SELECTOR = '[' + NG_ANIMATE_REF_ATTR + ']',
                            items = node.hasAttribute(NG_ANIMATE_REF_ATTR) ? [node] : node.querySelectorAll(SELECTOR),
                            anchors = [];

                        forEach(items, function (node) {
                            var attr = node.getAttribute(NG_ANIMATE_REF_ATTR);

                            if (attr && attr.length) {
                                anchors.push(node);
                            }
                        });

                        return anchors;
                    }

                    function groupAnimations(animations) {
                        var preparedAnimations = [],
                            refLookup = {},
                            usedIndicesLookup = {},
                            anchorGroups = {};

                        forEach(animations, function (animation, index) {
                            var element = animation.element,
                                node = getDomNode(element),
                                event = animation.event,
                                enterOrMove = ['enter', 'move'].indexOf(event) >= 0,
                                anchorNodes = animation.structural ? getAnchorNodes(node) : [],
                                direction;

                            if (anchorNodes.length) {
                                direction = enterOrMove ? 'to' : 'from';

                                forEach(anchorNodes, function (anchor) {
                                    var key = anchor.getAttribute(NG_ANIMATE_REF_ATTR);

                                    refLookup[key] = refLookup[key] || {};
                                    refLookup[key][direction] = {
                                        animationID: index,
                                        element: jqLite(anchor)
                                    };
                                });
                            } else {
                                preparedAnimations.push(animation);
                            }
                        });

                        forEach(refLookup, function (operations) {
                            var from = operations.from,
                                to = operations.to,
                                index,
                                indexKey,
                                fromAnimation,
                                toAnimation,
                                lookupKey,
                                group;

                            if (!from || !to) {

                                index = from ? from.animationID : to.animationID;
                                indexKey = index.toString();

                                if (!usedIndicesLookup[indexKey]) {
                                    usedIndicesLookup[indexKey] = true;
                                    preparedAnimations.push(animations[index]);
                                }
                                return;
                            }

                            fromAnimation = animations[from.animationID];
                            toAnimation = animations[to.animationID];
                            lookupKey = from.animationID.toString();

                            if (!anchorGroups[lookupKey]) {
                                group = anchorGroups[lookupKey] = {
                                    structural: true,
                                    beforeStart: function () {
                                        fromAnimation.beforeStart();
                                        toAnimation.beforeStart();
                                    },
                                    close: function () {
                                        fromAnimation.close();
                                        toAnimation.close();
                                    },
                                    classes: cssClassesIntersection(fromAnimation.classes, toAnimation.classes),
                                    from: fromAnimation,
                                    to: toAnimation,
                                    anchors: []
                                };

                                if (group.classes.length) {
                                    preparedAnimations.push(group);
                                } else {
                                    preparedAnimations.push(fromAnimation);
                                    preparedAnimations.push(toAnimation);
                                }
                            }

                            anchorGroups[lookupKey].anchors.push({
                                'out': from.element,
                                'in': to.element
                            });
                        });

                        return preparedAnimations;
                    }

                    $rootScope.$$postDigest(function () {
                        var animations = [],
                            groupedAnimations,
                            toBeSortedAnimations;

                        forEach(animationQueue, function (entry) {
                            if (getRunner(entry.element)) {
                                animations.push(entry);
                            } else {
                                entry.close();
                            }
                        });

                        animationQueue.length = 0;

                        groupedAnimations = groupAnimations(animations);
                        toBeSortedAnimations = [];

                        forEach(groupedAnimations, function (animationEntry) {
                            toBeSortedAnimations.push({
                                domNode: getDomNode(animationEntry.from ? animationEntry.from.element : animationEntry.element),
                                fn: function triggerAnimationStart() {

                                    animationEntry.beforeStart();

                                    var startAnimationFn,
                                        closeFn = animationEntry.close,
                                        targetElement = animationEntry.anchors ? (animationEntry.from.element || animationEntry.to.element) : animationEntry.element,
                                        operation,
                                        animationRunner;

                                    if (getRunner(targetElement)) {
                                        operation = invokeFirstDriver(animationEntry);

                                        if (operation) {
                                            startAnimationFn = operation.start;
                                        }
                                    }

                                    if (!startAnimationFn) {
                                        closeFn();
                                    } else {
                                        animationRunner = startAnimationFn();
                                        animationRunner.done(function (status) {
                                            closeFn(!status);
                                        });
                                        updateAnimationRunners(animationEntry, animationRunner);
                                    }
                                }
                            });
                        });

                        $$rAFScheduler(sortAnimations(toBeSortedAnimations));
                    });

                    if (msos_verbose === 'animate') {
                        msos_debug(temp_ia + ' done, runner:', runner);
                    }
                    return runner;
                }

                msos_debug(temp_ap + ' ->  done!');
                return initAnimationProv;
            }
        ];
    };

    $animateMinErr = minErr('$animate');

    $AnimateProvider = ['$provide', function ($provide) {
        var provider = this,
            classNameFilter_AP = null,
            customFilter = null,
            temp_ap = 'ng - $AnimateProvider';

        function registerAnimate(name, factory) {
            var key = '';

            msos_debug(temp_ap + ' - registerAnimate -> called, for: ' + (name || "'' (empty string)"));

            if (name && name.charAt(0) !== '.') {
                throw $animateMinErr(
                    'notcsel',
                    'Expecting class selector starting with \'.\' got \'{0}\'.',
                    name
                );
            }

            key = name + '-animation';

            provider.$$registeredAnimations[name.substr(1)] = key;
            $provide.factory(key, factory);
        }

        this.$$registeredAnimations = Object.create(null);

        this.register = registerAnimate;

        this.classNameFilter = function (expression) {
            var reservedRegex;

            if (arguments.length === 1) {
                classNameFilter_AP = (expression instanceof RegExp) ? expression : null;

                if (classNameFilter_AP) {
                    reservedRegex = new RegExp('(\\s+|\\/)' + NG_ANIMATE_CLASSNAME + '(\\s+|\\/)');

                    if (reservedRegex.test(classNameFilter_AP.toString())) {
                        classNameFilter_AP = null;
                        throw $animateMinErr(
                            'nongcls',
                            '$animateProvider.classNameFilter(regex) prohibits accepting a regex value which matches/contains the \'{0}\' CSS class.',
                            NG_ANIMATE_CLASSNAME
                        );
                    }
                }
            }
            return classNameFilter_AP;
        };

        this.customFilter = function (filterFn) {
            if (arguments.length === 1) {
                customFilter = _.isFunction(filterFn) ? filterFn : null;
            }

            return customFilter;
        };

        this.$get = ['$$animateQueue', function ($$animateQueue) {

            msos_debug(temp_ap + ' - $get -> called');

            function domInsert(element, parentElement, afterElement) {

                if (afterElement) {
                    var afterNode = extractElementNode(afterElement);

                    if (afterNode && !afterNode.parentNode && !afterNode.previousElementSibling) {
                        afterElement = null;
                    }
                }

                if (afterElement)   { afterElement.after(element); }
                else                { parentElement.prepend(element); }
            }

            return {

                on: $$animateQueue.on,
                off: $$animateQueue.off,
                pin: $$animateQueue.pin,
                enabled: $$animateQueue.enabled,

                cancel: function (runner) {
                    if (runner.end) { runner.end(); }
                },

                enter: function (element, parent, after, options) {
                    if (parent) { parent = jqLite(parent); }
                    if (after)  { after = jqLite(after); }

                    parent = parent || after.parent();
                    domInsert(element, parent, after);

                    return $$animateQueue.push(element, 'enter', prepareAnimateOptions(options));
                },

                move: function (element, parent, after, options) {
                    if (parent) { parent = jqLite(parent); }
                    if (after)  { after = jqLite(after); }

                    parent = parent || after.parent();
                    domInsert(element, parent, after);

                    return $$animateQueue.push(element, 'move', prepareAnimateOptions(options));
                },

                leave: function (element, options) {
                    return $$animateQueue.push(element, 'leave', prepareAnimateOptions(options), function () {
                        element.remove();
                    });
                },

                addClass: function (element, className, options) {
                    options = prepareAnimateOptions(options);
                    options.addClass = mergeClasses(options.addclass, className);

                    return $$animateQueue.push(element, 'addClass', options);
                },

                removeClass: function (element, className, options) {
                    options = prepareAnimateOptions(options);
                    options.removeClass = mergeClasses(options.removeClass, className);

                    return $$animateQueue.push(element, 'removeClass', options);
                },

                setClass: function (element, add, remove, options) {
                    options = prepareAnimateOptions(options);
                    options.addClass = mergeClasses(options.addClass, add);
                    options.removeClass = mergeClasses(options.removeClass, remove);

                    return $$animateQueue.push(element, 'setClass', options);
                },

                animate: function (element, from, to, className, options) {
                    options = prepareAnimateOptions(options);
                    options.from = options.from ? extend(options.from, from) : from;
                    options.to   = options.to   ? extend(options.to, to)     : to;

                    className = className || 'ng-inline-animate';
                    options.tempClasses = mergeClasses(options.tempClasses, className);

                    return $$animateQueue.push(element, 'animate', options);
                }
            };
        }];
    }];

    $$AnimateAsyncRunFactoryProvider = function () {
        this.$get = ['$$rAF', function ($$rAF) {
            var temp_aa = 'ng - $$AnimateAsyncRunFactoryProvider - $get',
                waitQueue = [];

            msos_debug(temp_aa + ' -> start.');

            function waitForTick(fn) {

                waitQueue.push(fn);

                if (waitQueue.length > 1) { // WTF?  " > 1 "
                    msos_debug(temp_aa + ' - waitForTick -> called, skip for waitQueue.length: ' + waitQueue.length);
                    return;
                }

                msos_debug(temp_aa + ' - waitForTick -> called, run $$rAF.');

                $$rAF(
                    function animate_async_rAF() {
                        var i = 0;

                        msos_debug(temp_aa + ' - animate_async_rAF -> called, waitQueue.length:' + waitQueue.length);

                        for (i = 0; i < waitQueue.length; i += 1) { waitQueue[i](); }

                        waitQueue = [];
                    }
                );
            }

            msos_debug(temp_aa + ' ->  done!');

            return function () {
                var passed = false;

                waitForTick(function () { passed = true; });

                return function animate_async_run(callback) {

                    msos_debug(temp_aa + ' - animate_async_run -> called.');

                    if (passed) { callback(); }
                    else        { waitForTick(callback); }
                };
            };
        }];
    };

    $$AnimateRunnerFactoryProvider = function () {

        this.$get = ['$q', '$$animateAsyncRun', '$$isDocumentHidden', '$timeout',
            function ($q,   $$animateAsyncRun,   $$isDocumentHidden,   $timeout) {
                var INITIAL_STATE = 0,
                    DONE_PENDING_STATE = 1,
                    DONE_COMPLETE_STATE = 2,
                    temp_ar = 'ng - $$AnimateRunnerFactoryProvider - $get';

                msos_debug(temp_ar + ' -> start.');

                function AnimateRunner(host) {
                    this.setHost(host);

                    var rafTick = $$animateAsyncRun(),
                        timeoutTick = function (fn) { $timeout(fn, 0, false); };

                    this._doneCallbacks = [];
                    this._tick = function (fn) {
                        if ($$isDocumentHidden())   { timeoutTick(fn); }
                        else                        { rafTick(fn); }
                    };
                    this._state = 0;
                }

                AnimateRunner.prototype = {
                    setHost: function (host) {
                        this.host = host || {};
                    },
                    done: function (fn) {
                        if (this._state === DONE_COMPLETE_STATE) {
                            fn();
                        } else {
                            this._doneCallbacks.push(fn);
                        }
                    },
                    progress: noop,
                    getPromise: function () {

                        if (!this.promise) {
                            var self = this,
                                deferred;

                            deferred = $q.defer('ng_AnimateRunner_getPromise', function (resolve, reject) {
                                    self.done(
                                        function (status) {
                                            if (status === false)   { reject();  }
                                            else                    { resolve(); }
                                        }
                                    );
                                });

                            this.promise = deferred.promise;
                        }

                        if (msos_verbose === 'animate') {
                            msos_debug(temp_ar + ' - getPromise -> called, this.promise:', this.promise);
                        }

                        return this.promise;
                    },
                    then: function (resolveHandler, rejectHandler) {
                        msos_debug(temp_ar + ' - then -> called.');

                        return this.getPromise().then(resolveHandler, rejectHandler);
                    },
                    'catch': function (handler) {
                        return this.getPromise()['catch'](handler);
                    },
                    'finally': function (handler) {
                        return this.getPromise()['finally'](handler);
                    },
                    pause: function () {
                        if (this.host.pause)    { this.host.pause(); }
                    },
                    resume: function () {
                        if (this.host.resume)   { this.host.resume(); }
                    },
                    end: function () {
                        if (this.host.end)      { this.host.end(); }
                        this._resolve(true);
                    },
                    cancel: function () {
                        if (this.host.cancel)   { this.host.cancel(); }
                        this._resolve(false);
                    },
                    complete: function (response) {
                        var self = this;

                        if (self._state === INITIAL_STATE) {
                            self._state = DONE_PENDING_STATE;
                            self._tick(
                                function tick_fn() {
                                    if (msos_verbose === 'animate') {
                                        msos_debug(temp_ar + ' - complete - tick_fn -> called, response:', response);
                                    }

                                    self._resolve(response);
                                }
                            );
                        }
                    },
                    _resolve: function (response) {
                        if (this._state !== DONE_COMPLETE_STATE) {

                            if (msos_verbose === 'animate') {
                                msos_debug(temp_ar + ' - _resolve -> called, response:', response);
                            }

                            forEach(
                                this._doneCallbacks,
                                function (fn) { fn(response); }
                            );

                            this._doneCallbacks.length = 0;
                            this._state = DONE_COMPLETE_STATE;
                        }
                    }
                };

                AnimateRunner.chain = function (chain, callback) {
                    var index = 0;

                    function next() {

                        if (index === chain.length) {
                            callback(true);
                            return;
                        }

                        chain[index](
                            function (response) {
                                if (response === false) {
                                    callback(false);
                                    return;
                                }
                                index += 1;
                                next();
                            }
                        );
                    }

                    next();
                };

                AnimateRunner.all = function (runners, callback) {
                    var count = 0,
                        status = true;

                    function onProgress(response) {
                        status = status && response;

                        count += 1;
                        if (count === runners.length) { callback(status); }
                    }

                    forEach(
                        runners,
                        function (runner) { runner.done(onProgress); }
                    );
                };

                msos_debug(temp_ar + ' ->  done!');

                return AnimateRunner;
            }
        ];
    };

    function stripHash(url) {
        var index = url.indexOf('#');
        return index === -1 ? url : url.substr(0, index);
    }

    function trimEmptyHash(url) {
        return url.replace(/(#.+)|#$/, '$1');
    }

    function Browser(window) {
        var temp_br = 'ng - Browser',
            self = this,
            location = window.location,
            history = window.history,
            set_timeout = window.setTimeout,
            clearTimeout = window.clearTimeout,
            lastBrowserUrl = location.href,
            urlChangeListeners = [],
            urlChangeInit = false,
            outstandingRequestCount_Br = 0,
            outstandingRequestCallbacks_Br = [],
            pendingLocation = null,
            sameState,
            sameBase,
            cachedState,
            lastCachedState = null,
            lastHistoryState;

        self.isMock = false;

        function completeOutstandingRequest_Br(fn) {
            var temp_co = temp_br + ' - completeOutstandingRequest_Br -> ';

            msos_debug(temp_co + 'start.');

            if (msos_verbose) {
                try {
                    // We just want to run "outstandingRequestCallbacks_Br" for noop
                    if (fn !== noop) {
                        fn.apply(null, sliceArgs(arguments, 1));
                    } else {
                        msos_debug(temp_co + 'fn skipped for noop.');
                    }
                } catch (e1) {
                    msos.console.error(temp_co + 'error (fn.apply):', e1);
                } finally {
                    outstandingRequestCount_Br -= 1;
                    if (outstandingRequestCount_Br === 0) {
                        while (outstandingRequestCallbacks_Br.length) {
                            try {
                                outstandingRequestCallbacks_Br.pop()();
                            } catch (e2) {
                                msos.console.error(temp_co + 'error (outstandingRequestCallbacks):', e2);
                            }
                        }
                    }
                }
            } else {

                // We just want to run "outstandingRequestCallbacks_Br" for noop
                if (fn !== noop) { fn.apply(null, sliceArgs(arguments, 1)); }

                outstandingRequestCount_Br -= 1;

                if (outstandingRequestCount_Br === 0) {
                    while (outstandingRequestCallbacks_Br.length) {
                        outstandingRequestCallbacks_Br.pop()();
                    }
                }
            }

            msos_debug(temp_co + ' done!');
        }

        self.$$completeOutstandingRequest = completeOutstandingRequest_Br;
        self.$$incOutstandingRequestCount = function () { outstandingRequestCount_Br += 1; };

        function getHash(url) {
            var index = url.indexOf('#');

            return index === -1 ? '' : url.substr(index);
        }

        //////////////////////////////////////////////////////////////
        // URL API
        //////////////////////////////////////////////////////////////

        function cacheState() {
            // This should be the only place in $browser where `history.state` is read.
            cachedState = history_pushstate ? window.history.state : undefined;
            cachedState = _.isUndefined(cachedState) ? null : cachedState;

            // Prevent callbacks fo fire twice if both hashchange & popstate were fired.
            if (equals(cachedState, lastCachedState)) {
                cachedState = lastCachedState;
            }

            lastCachedState = cachedState;
            lastHistoryState = cachedState;
        }

        function fireStateOrUrlChange() {
            var temp_fu = ' - fireStateOrUrlChange -> ',
                check_url,
                prevLastHistoryState = lastHistoryState;

            msos_debug(temp_br + temp_fu + 'start.');
            
            cacheState();

            check_url = self.url();

            if (lastBrowserUrl === check_url && prevLastHistoryState === cachedState) {
                msos_debug(temp_br + temp_fu + ' done, no change!');
                return;
            }

            msos_debug(temp_br + temp_fu + 'update for new url:\n     ' + check_url);

            lastBrowserUrl = check_url;
            lastHistoryState = cachedState;

            forEach(
                urlChangeListeners,
                function (listener) {
                    listener(self.url(), cachedState);
                }
            );

            msos_debug(temp_br + temp_fu + ' done!');
        }

        cacheState();

        self.url = function (url, replace, state) {
            var out_url;

            if (_.isUndefined(state)) { state = null; }

            // Android Browser BFCache causes location, history reference to become stale.
            if (location !== window.location) { location = window.location; }
            if (history  !== window.history)  { history  = window.history; }

            if (msos_verbose) {
                msos_debug(temp_br + ' - url -> ' + (url ? 'setter start,\n     ' + url + ',' : 'getter start.'));
            }

            // setter
            if (url) {
                sameState = lastHistoryState === state;

                if (lastBrowserUrl === url && (!history_pushstate || sameState)) {
                    if (msos_verbose) {
                        msos_debug(temp_br + ' - url -> setter done, no change!');
                    }
                    return self;
                }

                sameBase = lastBrowserUrl && stripHash(lastBrowserUrl) === stripHash(url);

                lastBrowserUrl = url;
                lastHistoryState = state;

                if (history_pushstate && (!sameBase || !sameState)) {
                    history[replace ? 'replaceState' : 'pushState'](state, '', url);
                    cacheState();
                } else {
                    if (!sameBase) {
                        pendingLocation = url;
                    }

                    if (replace) {
                        if (msos_verbose) {
                            msos_debug(temp_br + ' - url -> setter done, replace url: ' + url);
                        }

                        location.replace(url);

                    } else if (!sameBase) {
                        if (msos.config.debug) {
                            alert(temp_br + ' - url -> setter done, not same base: ' + url);
                        }

                        location.href = url;
                    } else {

                        location.hash = getHash(url);
                    }
                    if (location.href !== url) {

                        pendingLocation = url;
                    }
                }

                if (pendingLocation) { pendingLocation = url; }
      
                if (msos_verbose) {
                    msos_debug(temp_br + ' - url -> setter done!');
                }
                return self;
            }

            out_url = pendingLocation || window.location.href.replace(/%27/g, '\'');

            if (msos_verbose) {
                msos_debug(temp_br + ' - url -> getter done (Larry the Cable Guy),\n     url: ' + out_url);
            }

            return out_url;
        };

        self.state = function () {
            return cachedState;
        };

        function cacheStateAndFireUrlChange() {
            var temp_cs = ' - cacheStateAndFireUrlChange -> ';

            msos_debug(temp_br + temp_cs + 'start.');

            pendingLocation = null;
            fireStateOrUrlChange();

            msos_debug(temp_br + temp_cs + 'done!');
        }

        self.onUrlChange = function (callback) {
            if (!urlChangeInit) {
                // html5 history api - popstate event
                if (history_pushstate) {
                    jqLite(window).on('popstate', cacheStateAndFireUrlChange);
                }
                // hashchange event
                jqLite(window).on('hashchange', cacheStateAndFireUrlChange);
    
                urlChangeInit = true;
            }

            urlChangeListeners.push(callback);
            return callback;
        };

        self.$$applicationDestroyed = function () {

            msos_debug(temp_br + ' - $$applicationDestroyed -> called.');

            jqLite(window).off('hashchange popstate', cacheStateAndFireUrlChange);
        };

        self.$$checkUrlChange = fireStateOrUrlChange;

        self.defer = function (fn, name, delay) {
            var temp_df = ' - defer -> ',
                timeout_key;

            delay = delay || browser_std_defer;

            msos_debug(temp_br + temp_df + 'start, name: ' + name + ', delay: ' + delay, fn);

            timeout_key = 'brw_defer' + nextBrowserUid();

            outstandingRequestCount_Br += 1;

            browser_defer_ids[timeout_key] = set_timeout(
                function () {

                    msos_debug(temp_br + ' - defer - set_timeout -> fired, name: ' + name + ', id: ' + timeout_key);

                    delete browser_defer_ids[timeout_key];
                    completeOutstandingRequest_Br(fn);
                },
                delay
            );

            msos_debug(temp_br + temp_df + ' done, name: ' + name);

            return timeout_key;
        };

        self.cancel = function (defer_to_key) {
            var t_or_f = false;

            if (browser_defer_ids[defer_to_key]) {
                clearTimeout(browser_defer_ids[defer_to_key]);
                delete browser_defer_ids[defer_to_key];
                completeOutstandingRequest_Br(noop);
                t_or_f = true;
            }

            msos_debug(temp_br + ' - cancel -> called, id: ' + defer_to_key);
            return t_or_f;
        };
    }

    function $BrowserProvider() {
        this.$get = ['$window', '$document',
            function ($window, $document) {
                return new Browser($window, $document);
            }
        ];
    }

    $AnimateCssProvider = function () {
        var gcsLookup = createLocalCacheLookup(),
            gcsStaggerLookup = createLocalCacheLookup();

        this.$get = ['$window', '$$jqLite', '$$AnimateRunner', '$timeout',
               '$$forceReflow', '$$rAFScheduler', '$$animateQueue',
            function($window,   $$jqLite,   $$AnimateRunner,   $timeout,
                $$forceReflow,   $$rAFScheduler, $$animateQueue) {

                var applyAnimationClasses = applyAnimationClassesFactory($$jqLite),
                    temp_ap = 'ng/animate - $AnimateCssProvider - $get',
                    parentCounter = 0,
                    rafWaitQueue = [];

                msos_debug(temp_ap + ' -> start.');

                function gcsHashFn(node, extraClasses) {
                    var KEY = '$$ngAnimateParentKey',
                        parentNode = node.parentNode;

                    if (!parentNode[KEY]) {
                        parentCounter += 1;
                        parentNode[KEY] = parentCounter;
                    }

                    return parentNode[KEY] + '-' + node.getAttribute('class') + '-' + extraClasses;
                }

                function computeCachedCssStyles(node, cacheKey, properties) {
                    var timings = gcsLookup.get(cacheKey);

                    if (!timings) {
                        timings = computeCssStyles($window, node, properties);
                        if (timings.animationIterationCount === 'infinite') {
                            timings.animationIterationCount = 1;
                        }
                    }

                    gcsLookup.put(cacheKey, timings);

                    return timings;
                }

                function computeCachedCssStaggerStyles(node, className, cacheKey, properties) {
                    var stagger,
                        staggerClassName;

                    if (gcsLookup.count(cacheKey) > 0) {

                        stagger = gcsStaggerLookup.get(cacheKey);

                        if (!stagger) {
                            staggerClassName = pendClasses(className, '-stagger');

                            $$jqLite.addClass(node, staggerClassName);

                            stagger = computeCssStyles($window, node, properties);

                            // force the conversion of a null value to zero incase not set
                            stagger.animationDuration = Math.max(stagger.animationDuration, 0);
                            stagger.transitionDuration = Math.max(stagger.transitionDuration, 0);

                            $$jqLite.removeClass(node, staggerClassName);

                            gcsStaggerLookup.put(cacheKey, stagger);
                        }
                    }

                    return stagger || {};
                }

                function waitUntilQuiet(callback) {

                    if (callback !== noop) {
                        rafWaitQueue.push(callback);
                    }

                    $$rAFScheduler.waitUntilQuiet(function () {

                        gcsLookup.flush();
                        gcsStaggerLookup.flush();

                        // DO NOT REMOVE THIS LINE OR REFACTOR OUT THE `pageWidth` variable.
                        // PLEASE EXAMINE THE `$$forceReflow` service to understand why.
                        var pageWidth = $$forceReflow(),
                            i = 0;

                        // we use a for loop to ensure that if the queue is changed
                        // during this looping then it will consider new requests
                        for (i = 0; i < rafWaitQueue.length; i += 1) {
                            rafWaitQueue[i](pageWidth);
                        }

                        rafWaitQueue.length = 0;
                    });
                }

                function computeTimings(node, cacheKey) {
                    var timings = computeCachedCssStyles(node, cacheKey, DETECT_CSS_PROPERTIES),
                        aD = timings.animationDelay,
                        tD = timings.transitionDelay;

                    timings.maxDelay = aD && tD ?
                        Math.max(aD, tD) :
                        (aD || tD);
                    timings.maxDuration = Math.max(
                        timings.animationDuration * timings.animationIterationCount,
                        timings.transitionDuration);

                    return timings;
                }

                function AnimateCssProviderGet(element, initialOptions) {

                    var temp_ac = ' - AnimateCssProviderGet -> ',
                        options = initialOptions || {},
                        restoreStyles = {},
                        onAnimationProgress,
                        node = getDomNode(element),
                        classes = element.attr('class'),
                        temporaryStyles = [],
                        styles,
                        animationClosed,
                        animationPaused,
                        animationCompleted,
                        runner,
                        runnerHost,
                        maxDelay,
                        maxDelayTime,
                        maxDuration,
                        maxDurationTime,
                        startTime,
                        events = [],
                        method,
                        isStructural,
                        structuralClassName = '',
                        addRemoveClassName = '',
                        preparationClasses,
                        fullClassName,
                        activeClasses,
                        hasToStyles,
                        containsKeyframeAnimation,
                        cacheKey,
                        stagger,
                        applyOnlyDuration,
                        staggerVal,
                        transitionStyle,
                        durationStyle,
                        keyframeStyle,
                        itemIndex,
                        isFirst,
                        timings,
                        relativeDelay,
                        flags = {},
                        delayStyle;

                    msos_debug(temp_ap + temp_ac + 'start.');

                    function close(rejected) {
                        // if the promise has been called already then we shouldn't close
                        // the animation again
                        if (animationClosed || (animationCompleted && animationPaused)) { return; }

                        animationClosed = true;
                        animationPaused = false;

                        if (!options.$$skipPreparationClasses) {
                            $$jqLite.removeClass(element, preparationClasses);
                        }

                        $$jqLite.removeClass(element, activeClasses);

                        blockKeyframeAnimations(node, false);
                        blockTransitions(node, false);

                        forEach(temporaryStyles, function (entry) {
                            node.style[entry[0]] = '';
                        });

                        applyAnimationClasses(element, options);
                        applyAnimationStyles(element, options);

                        if (Object.keys(restoreStyles).length) {
                            forEach(restoreStyles, function (value, prop) {
                                if (value) {
                                    node.style.setProperty(prop, value);
                                } else {
                                    node.style.removeProperty(prop);
                                }
                            });
                        }

                        if (options.onDone) {
                            options.onDone();
                        }

                        if (events && events.length) {
                            // Remove the transitionend / animationend listener(s)
                            element.off(events.join(' '), onAnimationProgress);
                        }

                        //Cancel the fallback closing timeout and remove the timer data
                        var animationTimerData = element.data(ANIMATE_TIMER_KEY);

                        if (animationTimerData) {
                            $timeout.cancel(animationTimerData[0].timer);
                            element.removeData(ANIMATE_TIMER_KEY);
                        }

                        // if the preparation function fails then the promise is not setup
                        if (runner) {
                            runner.complete(!rejected);
                        }
                    }

                    onAnimationProgress = function (event) {

                        event.stopPropagation();

                        var ev = event.originalEvent || event,
                            timeStamp = ev.$manualTimeStamp || Date.now(),
                            elapsedTime = parseFloat(ev.elapsedTime.toFixed(ELAPSED_TIME_MAX_DECIMAL_PLACES));

                        if (Math.max(timeStamp - startTime, 0) >= maxDelayTime && elapsedTime >= maxDuration) {
                            animationCompleted = true;
                            close();
                        }
                    };

                    function endFn() {
                        close();
                    }

                    function cancelFn() {
                        close(true);
                    }

                    function closeAndReturnNoopAnimator() {
                        runner = new $$AnimateRunner({
                            end: endFn,
                            cancel: cancelFn
                        });

                        // should flush the cache animation
                        waitUntilQuiet(noop);
                        close();

                        return {
                            $$willAnimate: false,
                            start: function () {
                                return runner;
                            },
                            end: endFn
                        };
                    }

                    if (!options.$$prepared) {
                        options = prepareAnimationOptions(copy(options));
                    }

                    if (!node ||
                        !node.parentNode ||
                        !$$animateQueue.enabled()) {
                        msos_debug(temp_ap + temp_ac + ' done, no node, etc.');

                        return closeAndReturnNoopAnimator();
                    }

                    styles = packageStyles(options);

                    if (options.duration === 0 || (!Modernizr.cssanimations && !Modernizr.csstransitions)) {
                        msos_debug(temp_ap + temp_ac + ' done, no animations/transitions');

                        return closeAndReturnNoopAnimator();
                    }

                    method = options.event && _.isArray(options.event) ? options.event.join(' ') : options.event;

                    isStructural = method && options.structural;

                    if (isStructural) {
                        structuralClassName = pendClasses(method, EVENT_CLASS_PREFIX, true);
                    } else if (method) {
                        structuralClassName = method;
                    }

                    if (options.addClass) {
                        addRemoveClassName += pendClasses(options.addClass, ADD_CLASS_SUFFIX);
                    }

                    if (options.removeClass) {
                        if (addRemoveClassName.length) {
                            addRemoveClassName += ' ';
                        }
                        addRemoveClassName += pendClasses(options.removeClass, REMOVE_CLASS_SUFFIX);
                    }

                    if (options.applyClassesEarly && addRemoveClassName.length) {
                        applyAnimationClasses(element, options);
                    }

                    preparationClasses = [structuralClassName, addRemoveClassName].join(' ').trim();
                    fullClassName = classes + ' ' + preparationClasses;
                    activeClasses = pendClasses(preparationClasses, ACTIVE_CLASS_SUFFIX);
                    hasToStyles = styles.to && Object.keys(styles.to).length > 0;
                    containsKeyframeAnimation = (options.keyframeStyle || '').length > 0;

                    if (!containsKeyframeAnimation && !hasToStyles && !preparationClasses) {

                        msos_debug(temp_ap + temp_ac + ' done, no styles/classes.');
                        return closeAndReturnNoopAnimator();
                    }

                    if (options.stagger > 0) {
                        staggerVal = parseFloat(options.stagger);
                        stagger = {
                            transitionDelay: staggerVal,
                            animationDelay: staggerVal,
                            transitionDuration: 0,
                            animationDuration: 0
                        };
                    } else {
                        cacheKey = gcsHashFn(node, fullClassName);
                        stagger = computeCachedCssStaggerStyles(node, preparationClasses, cacheKey, DETECT_STAGGER_CSS_PROPERTIES);
                    }

                    if (!options.$$skipPreparationClasses) {
                        $$jqLite.addClass(element, preparationClasses);
                    }

                    if (options.transitionStyle) {
                        transitionStyle = [TRANSITION_PROP, options.transitionStyle];
                        applyInlineStyle(node, transitionStyle);
                        temporaryStyles.push(transitionStyle);
                    }

                    if (options.duration >= 0) {
                        applyOnlyDuration = node.style[TRANSITION_PROP].length > 0;
                        durationStyle = getCssTransitionDurationStyle(options.duration, applyOnlyDuration);

                        // we set the duration so that it will be picked up by getComputedStyle later
                        applyInlineStyle(node, durationStyle);
                        temporaryStyles.push(durationStyle);
                    }

                    if (options.keyframeStyle) {
                        keyframeStyle = [ANIMATION_PROP, options.keyframeStyle];
                        applyInlineStyle(node, keyframeStyle);
                        temporaryStyles.push(keyframeStyle);
                    }

                    itemIndex = stagger ? options.staggerIndex >= 0 ? options.staggerIndex : gcsLookup.count(cacheKey) : 0;

                    isFirst = itemIndex === 0;

                    if (isFirst && !options.skipBlocking) {
                        blockTransitions(node, SAFE_FAST_FORWARD_DURATION_VALUE);
                    }

                    timings = computeTimings(node, cacheKey);
                    relativeDelay = timings.maxDelay;

                    maxDelay = Math.max(relativeDelay, 0);
                    maxDuration = timings.maxDuration;

                    flags.hasTransitions = timings.transitionDuration > 0;
                    flags.hasAnimations = timings.animationDuration > 0;
                    flags.hasTransitionAll = flags.hasTransitions && timings.transitionProperty === 'all';
                    flags.applyTransitionDuration = hasToStyles && (
                        (flags.hasTransitions && !flags.hasTransitionAll) ||
                        (flags.hasAnimations && !flags.hasTransitions));
                    flags.applyAnimationDuration = options.duration && flags.hasAnimations;
                    flags.applyTransitionDelay = truthyTimingValue(options.delay) && (flags.applyTransitionDuration || flags.hasTransitions);
                    flags.applyAnimationDelay = truthyTimingValue(options.delay) && flags.hasAnimations;
                    flags.recalculateTimingStyles = addRemoveClassName.length > 0;

                    if (flags.applyTransitionDuration || flags.applyAnimationDuration) {
                        maxDuration = options.duration ? parseFloat(options.duration) : maxDuration;

                        if (flags.applyTransitionDuration) {
                            flags.hasTransitions = true;
                            timings.transitionDuration = maxDuration;
                            applyOnlyDuration = node.style[TRANSITION_PROP + PROPERTY_KEY].length > 0;
                            temporaryStyles.push(getCssTransitionDurationStyle(maxDuration, applyOnlyDuration));
                        }

                        if (flags.applyAnimationDuration) {
                            flags.hasAnimations = true;
                            timings.animationDuration = maxDuration;
                            temporaryStyles.push(getCssKeyframeDurationStyle(maxDuration));
                        }
                    }

                    if (maxDuration === 0 && !flags.recalculateTimingStyles) {
                        msos_debug(temp_ap + temp_ac + ' done, duration = 0.');
                        return closeAndReturnNoopAnimator();
                    }

                    if (options.delay != null) {        // leave as is (null of undefined)
                        if (typeof options.delay !== 'boolean') {
                            delayStyle = parseFloat(options.delay);
                            // number in options.delay means we have to recalculate the delay for the closing timeout
                            maxDelay = Math.max(delayStyle, 0);
                        }

                        if (flags.applyTransitionDelay) {
                            temporaryStyles.push(getCssDelayStyle(delayStyle));
                        }

                        if (flags.applyAnimationDelay) {
                            temporaryStyles.push(getCssDelayStyle(delayStyle, true));
                        }
                    }

                    if (options.duration == null && timings.transitionDuration > 0) {   // leave as is (null of undefined)
                        flags.recalculateTimingStyles = flags.recalculateTimingStyles || isFirst;
                    }

                    maxDelayTime = maxDelay * ONE_SECOND;
                    maxDurationTime = maxDuration * ONE_SECOND;

                    if (!options.skipBlocking) {
                        flags.blockTransition = timings.transitionDuration > 0;
                        flags.blockKeyframeAnimation = timings.animationDuration > 0 &&
                            stagger.animationDelay > 0 &&
                            stagger.animationDuration === 0;
                    }

                    if (options.from) {
                        if (options.cleanupStyles) {
                            registerRestorableStyles(restoreStyles, node, Object.keys(options.from));
                        }
                        applyAnimationFromStyles(element, options);
                    }

                    function applyBlocking(duration) {
                        if (flags.blockTransition) {
                            blockTransitions(node, duration);
                        }

                        if (flags.blockKeyframeAnimation) {
                            blockKeyframeAnimations(node, !!duration);
                        }
                    }

                    if (flags.blockTransition || flags.blockKeyframeAnimation) {
                        applyBlocking(maxDuration);
                    } else if (!options.skipBlocking) {
                        blockTransitions(node, false);
                    }

                    function start() {
                        if (animationClosed) { return; }

                        if (!node.parentNode) {
                            close();
                            return;
                        }

                        var playPause = function (playAnimation) {
                                if (!animationCompleted) {
                                    animationPaused = !playAnimation;
                                    if (timings.animationDuration) {
                                        var value = blockKeyframeAnimations(node, animationPaused);
                                        if (animationPaused) {
                                            temporaryStyles.push(value);
                                        } else {
                                            removeFromArray(temporaryStyles, value);
                                        }
                                    }
                                } else if (animationPaused && playAnimation) {
                                    animationPaused = false;
                                    close();
                                }
                            },
                            maxStagger;

                        maxStagger = itemIndex > 0 &&
                            ((timings.transitionDuration && stagger.transitionDuration === 0) ||
                                (timings.animationDuration && stagger.animationDuration === 0)) &&
                            Math.max(stagger.animationDelay, stagger.transitionDelay);

                        runnerHost.resume = function () {
                            playPause(true);
                        };

                        runnerHost.pause = function () {
                            playPause(false);
                        };

                        function onAnimationExpired() {
                            var animationsData = element.data(ANIMATE_TIMER_KEY),
                                i = 0;

                            if (animationsData) {
                                for (i = 1; i < animationsData.length; i += 1) {
                                    animationsData[i]();
                                }
                                element.removeData(ANIMATE_TIMER_KEY);
                            }
                        }

                        function triggerAnimationStart() {
                            var easeProp,
                                easeVal,
                                timerTime,
                                endTime,
                                animationsData,
                                setupFallbackTimer,
                                currentTimerData,
                                timer;

                            if (animationClosed) { return; }

                            applyBlocking(false);

                            forEach(temporaryStyles, function (entry) {
                                var key = entry[0],
                                    value = entry[1];

                                node.style[key] = value;
                            });

                            applyAnimationClasses(element, options);
                            $$jqLite.addClass(element, activeClasses);

                            if (flags.recalculateTimingStyles) {
                                fullClassName = node.getAttribute('class') + ' ' + preparationClasses;
                                cacheKey = gcsHashFn(node, fullClassName);

                                timings = computeTimings(node, cacheKey);
                                relativeDelay = timings.maxDelay;
                                maxDelay = Math.max(relativeDelay, 0);
                                maxDuration = timings.maxDuration;

                                if (maxDuration === 0) {
                                    close();
                                    return;
                                }

                                flags.hasTransitions = timings.transitionDuration > 0;
                                flags.hasAnimations = timings.animationDuration > 0;
                            }

                            if (flags.applyAnimationDelay) {
                                relativeDelay = typeof options.delay !== "boolean" && truthyTimingValue(options.delay) ?
                                    parseFloat(options.delay) :
                                    relativeDelay;

                                maxDelay = Math.max(relativeDelay, 0);
                                timings.animationDelay = relativeDelay;
                                delayStyle = getCssDelayStyle(relativeDelay, true);
                                temporaryStyles.push(delayStyle);
                                node.style[delayStyle[0]] = delayStyle[1];
                            }

                            maxDelayTime = maxDelay * ONE_SECOND;
                            maxDurationTime = maxDuration * ONE_SECOND;

                            if (options.easing) {
                                easeVal = options.easing;

                                if (flags.hasTransitions) {
                                    easeProp = TRANSITION_PROP + TIMING_KEY;
                                    temporaryStyles.push([easeProp, easeVal]);
                                    node.style[easeProp] = easeVal;
                                }
                                if (flags.hasAnimations) {
                                    easeProp = ANIMATION_PROP + TIMING_KEY;
                                    temporaryStyles.push([easeProp, easeVal]);
                                    node.style[easeProp] = easeVal;
                                }
                            }

                            if (timings.transitionDuration) {
                                events.push(TRANSITIONEND_EVENT);
                            }

                            if (timings.animationDuration) {
                                events.push(ANIMATIONEND_EVENT);
                            }

                            startTime = Date.now();

                            timerTime = maxDelayTime + CLOSING_TIME_BUFFER * maxDurationTime;
                            endTime = startTime + timerTime;
                            animationsData = element.data(ANIMATE_TIMER_KEY) || [];
                            setupFallbackTimer = true;

                            if (animationsData.length) {
                                currentTimerData = animationsData[0];

                                setupFallbackTimer = endTime > currentTimerData.expectedEndTime;

                                if (setupFallbackTimer) {
                                    $timeout.cancel(currentTimerData.timer);
                                } else {
                                    animationsData.push(close);
                                }
                            }

                            if (setupFallbackTimer) {
                                timer = $timeout(onAnimationExpired, timerTime, false);

                                animationsData[0] = {
                                    timer: timer,
                                    expectedEndTime: endTime
                                };
                                animationsData.push(close);
                                element.data(ANIMATE_TIMER_KEY, animationsData);
                            }

                            if (events.length) {
                                element.on(events.join(' '), onAnimationProgress);
                            }

                            if (options.to) {
                                if (options.cleanupStyles) {
                                    registerRestorableStyles(restoreStyles, node, Object.keys(options.to));
                                }
                                applyAnimationToStyles(element, options);
                            }
                        }

                        if (maxStagger) {
                            $timeout(triggerAnimationStart,
                                Math.floor(maxStagger * itemIndex * ONE_SECOND),
                                false);
                        } else {
                            triggerAnimationStart();
                        }
                    }

                    msos_debug(temp_ap + temp_ac + ' done!');

                    return {
                        $$willAnimate: true,
                        end: endFn,
                        start: function () {
                            if (animationClosed) { return undefined; }

                            runnerHost = {
                                end: endFn,
                                cancel: cancelFn,
                                resume: null, //this will be set during the start() phase
                                pause: null
                            };

                            runner = new $$AnimateRunner(runnerHost);

                            waitUntilQuiet(start);

                            return runner;
                        }
                    };
                }

                msos_debug(temp_ap + ' -> done!');
                return AnimateCssProviderGet;
            }
        ];
    };

    $$AnimateCssDriverProvider = ['$$animationProvider', function ($$animationProvider) {

        $$animationProvider.drivers.push('$$animateCssDriver');

        var NG_ANIMATE_SHIM_CLASS_NAME = 'ng-animate-shim',
            NG_ANIMATE_ANCHOR_CLASS_NAME = 'ng-anchor',
            NG_OUT_ANCHOR_CLASS_NAME = 'ng-anchor-out',
            NG_IN_ANCHOR_CLASS_NAME = 'ng-anchor-in';

        function isDocumentFragment(node) {
            return node.parentNode && node.parentNode.nodeType === 11;
        }

        this.$get = ['$animateCss', '$$AnimateRunner', '$rootElement', '$document',
            function ($animateCss, $$AnimateRunner, $rootElement, $document) {

                var temp_cd = 'ng/animate - $$AnimateCssDriverProvider - $get',
                    bodyNode,
                    rootNode,
                    rootBodyElement;

                msos_debug(temp_cd + ' -> start.');

                // only browsers that support these properties can render animations
                if (!Modernizr.cssanimations && !Modernizr.csstransitions) { return noop; }

                bodyNode = $document[0].body;
                rootNode = getDomNode($rootElement);

                rootBodyElement = jqLite(
                    isDocumentFragment(rootNode) || bodyNode.contains(rootNode) ? rootNode : bodyNode
                );

                function filterCssClasses(classes) {
                    //remove all the `ng-` stuff
                    return classes.replace(/\bng-\S+\b/g, '');
                }

                function getUniqueValues(a, b) {
                    if (_.isString(a)) { a = a.split(' '); }
                    if (_.isString(b)) { b = b.split(' '); }

                    return a.filter(function (val) {
                        return b.indexOf(val) === -1;
                    }).join(' ');
                }

                function prepareAnchoredAnimation(outAnchor, inAnchor) {

                    function getClassVal(element) {
                        return element.attr('class') || '';
                    }

                    var clone = jqLite(getDomNode(outAnchor).cloneNode(true)),
                        startingClasses = filterCssClasses(getClassVal(clone)),
                        animatorIn,
                        animatorOut,
                        startingAnimator;

                    outAnchor.addClass(NG_ANIMATE_SHIM_CLASS_NAME);
                    inAnchor.addClass(NG_ANIMATE_SHIM_CLASS_NAME);

                    clone.addClass(NG_ANIMATE_ANCHOR_CLASS_NAME);

                    rootBodyElement.append(clone);

                    function calculateAnchorStyles(anchor) {
                        var styles = {},
                            coords = getDomNode(anchor).getBoundingClientRect();

                        forEach(['width', 'height', 'top', 'left'], function (key) {
                            var value = coords[key];

                            switch (key) {
                                case 'top':
                                    value += bodyNode.scrollTop;
                                    break;
                                case 'left':
                                    value += bodyNode.scrollLeft;
                                    break;
                            }
                            styles[key] = Math.floor(value) + 'px';
                        });

                        return styles;
                    }

                    function prepareOutAnimation() {
                        var animator = $animateCss(clone, {
                            addClass: NG_OUT_ANCHOR_CLASS_NAME,
                            delay: true,
                            from: calculateAnchorStyles(outAnchor)
                        });

                        return animator.$$willAnimate ? animator : null;
                    }

                    function prepareInAnimation() {
                        var endingClasses = filterCssClasses(getClassVal(inAnchor)),
                            toAdd = getUniqueValues(endingClasses, startingClasses),
                            toRemove = getUniqueValues(startingClasses, endingClasses),
                            animator = $animateCss(clone, {
                                to: calculateAnchorStyles(inAnchor),
                                addClass: NG_IN_ANCHOR_CLASS_NAME + ' ' + toAdd,
                                removeClass: NG_OUT_ANCHOR_CLASS_NAME + ' ' + toRemove,
                                delay: true
                            });

                        return animator.$$willAnimate ? animator : null;
                    }

                    animatorOut = prepareOutAnimation();

                    function end() {
                        clone.remove();
                        outAnchor.removeClass(NG_ANIMATE_SHIM_CLASS_NAME);
                        inAnchor.removeClass(NG_ANIMATE_SHIM_CLASS_NAME);
                    }

                    if (!animatorOut) {
                        animatorIn = prepareInAnimation();
                        if (!animatorIn) {
                            return end();
                        }
                    }

                    startingAnimator = animatorOut || animatorIn;

                    return {
                        start: function () {
                            var runner,
                                currentAnimation = startingAnimator.start();

                            currentAnimation.done(
                                function () {
                                    currentAnimation = null;

                                    if (!animatorIn) {
                                        animatorIn = prepareInAnimation();
                                        if (animatorIn) {
                                            currentAnimation = animatorIn.start();
                                            currentAnimation.done(function () {
                                                currentAnimation = null;
                                                end();
                                                runner.complete();
                                            });

                                            return currentAnimation;
                                        }
                                    }
                                    // in the event that there is no `in` animation
                                    end();
                                    runner.complete();

                                    return undefined;
                                }
                            );

                            function endFn() {
                                if (currentAnimation) {
                                    currentAnimation.end();
                                }
                            }

                            runner = new $$AnimateRunner({
                                end: endFn,
                                cancel: endFn
                            });

                            return runner;
                        }
                    };
                }

                function prepareRegularAnimation(animationDetails) {
                    var element = animationDetails.element,
                        options = animationDetails.options || {},
                        animator;

                    if (animationDetails.structural) {
                        options.event = animationDetails.event;
                        options.structural = true;
                        options.applyClassesEarly = true;

                        if (animationDetails.event === 'leave') {
                            options.onDone = options.domOperation;
                        }
                    }

                    if (options.preparationClasses) {
                        options.event = concatWithSpace(options.event, options.preparationClasses);
                    }

                    animator = $animateCss(element, options);

                    return animator.$$willAnimate ? animator : null;
                }

                function prepareFromToAnchorAnimation(from, to, anchors) {
                    var fromAnimation = prepareRegularAnimation(from, noop),
                        toAnimation = prepareRegularAnimation(to, noop),
                        anchorAnimations = [];

                    forEach(anchors, function (anchor) {
                        var outElement = anchor.out,
                            inElement = anchor['in'],
                            animator = prepareAnchoredAnimation(outElement, inElement);

                        if (animator) {
                            anchorAnimations.push(animator);
                        }
                    });

                    // no point in doing anything when there are no elements to animate
                    if (!fromAnimation && !toAnimation && anchorAnimations.length === 0) { return undefined; }

                    return {
                        start: function () {
                            var animationRunners = [],
                                runner;

                            if (fromAnimation) {
                                animationRunners.push(fromAnimation.start());
                            }

                            if (toAnimation) {
                                animationRunners.push(toAnimation.start());
                            }

                            forEach(anchorAnimations, function (animation) {
                                animationRunners.push(animation.start());
                            });

                            function endFn() {
                                forEach(animationRunners, function (runner) {
                                    runner.end();
                                });
                            }

                            runner = new $$AnimateRunner({
                                end: endFn,
                                cancel: endFn // CSS-driven animations cannot be cancelled, only ended
                            });

                            $$AnimateRunner.all(animationRunners, function (status) {
                                runner.complete(status);
                            });

                            return runner;
                        }
                    };
                }

                function initDriverFn(animationDetails) {
                    return animationDetails.from && animationDetails.to ? prepareFromToAnchorAnimation(animationDetails.from, animationDetails.to, animationDetails.anchors) : prepareRegularAnimation(animationDetails);
                }

                msos_debug(temp_cd + ' -> done!');
                return initDriverFn;
            }
        ];
    }];

    function $CacheFactoryProvider() {

        this.$get = function () {
            var caches = {};

            function cacheFactory(cacheId, options) {

                if (caches.hasOwnProperty(cacheId)) {
                    throw minErr('$cacheFactory')('iid', "CacheId '{0}' is already taken!", cacheId);
                }

                var cfp_size = 0,
                    stats = extend({}, options, {
                        id: cacheId
                    }),
                    data = createMap(),
                    capacity = (options && options.capacity) || Number.MAX_VALUE,
                    lruHash = createMap(),
                    freshEnd = null,
                    staleEnd = null;

                function link(nextEntry, prevEntry) {
                    if (nextEntry !== prevEntry) {
                        if (nextEntry) { nextEntry.p = prevEntry; }     //p stands for previous, 'prev' didn't minify
                        if (prevEntry) { prevEntry.n = nextEntry; }     //n stands for next, 'next' didn't minify
                    }
                }

                function refresh(entry) {
                    if (entry !== freshEnd) {
                        if (!staleEnd) {
                            staleEnd = entry;
                        } else if (staleEnd === entry) {
                            staleEnd = entry.n;
                        }

                        link(entry.n, entry.p);
                        link(entry, freshEnd);
                        freshEnd = entry;
                        freshEnd.n = null;
                    }
                }

                caches[cacheId] = {

                    put: function (key, value) {
                        var lruEntry;

                        if (_.isUndefined(value)) { return undefined; }

                        if (capacity < Number.MAX_VALUE) {
                            if (lruHash[key]) {
                                lruEntry = lruHash[key];
                            } else {
                                lruHash[key] = { key: key };
                                lruEntry = lruHash[key];
                            }
                            refresh(lruEntry);
                        }

                        if (data[key] === undefined) { cfp_size += 1; }

                        data[key] = value;

                        if (cfp_size > capacity) {
                            this.remove(staleEnd.key);
                        }

                        return value;
                    },

                    get: function (key) {
                        if (capacity < Number.MAX_VALUE) {
                            var lruEntry = lruHash[key];

                            if (!lruEntry) { return undefined; }

                            refresh(lruEntry);
                        }

                        return data[key];
                    },

                    remove: function (key) {
                        if (capacity < Number.MAX_VALUE) {
                            var lruEntry = lruHash[key];

                            if (!lruEntry) { return; }

                            // Should these be '===' instead of '==' ?
                            if (lruEntry === freshEnd) { freshEnd = lruEntry.p; }
                            if (lruEntry === staleEnd) { staleEnd = lruEntry.n; }

                            link(lruEntry.n, lruEntry.p);

                            delete lruHash[key];
                        }

                        if (data[key] === undefined)  { return; }

                        delete data[key];
                        cfp_size -= 1;
                    },

                    removeAll: function () {
                        data = createMap();
                        cfp_size = 0;
                        lruHash = createMap();
                        freshEnd = staleEnd = null;
                    },

                    destroy: function () {
                        data = null;
                        stats = null;
                        lruHash = null;
                        delete caches[cacheId];
                    },

                    info: function () {
                        return extend({}, stats, {
                            size: cfp_size
                        });
                    }
                };

                return caches[cacheId];
            }

            cacheFactory.info = function () {
                var info = {};
                forEach(caches, function (cache, cacheId) {
                    info[cacheId] = cache.info();
                });
                return info;
            };

            cacheFactory.get = function (cacheId) {
                return caches[cacheId];
            };


            return cacheFactory;
        };
    }

    function $TemplateCacheProvider() {
        this.$get = ['$cacheFactory', function ($cacheFactory) {
            return $cacheFactory('templates');
        }];
    }

    /**
     * Converts all accepted directives format into proper directive name.
     * @param name Name to normalize
     */
    function directiveNormalize(name) {
      return name.replace(PREFIX_REGEXP, '').replace(SPECIAL_CHARS_REGEXP, fnCamelCaseReplace);
    }

    function tokenDifference(str1, str2) {
        var values = '',
            tokens1 = str1.split(/\s+/),
            tokens2 = str2.split(/\s+/),
            token,
            i = 0,
            j = 0;

        outerl: for (i = 0; i < tokens1.length; i += 1) {
            token = tokens1[i];
            for (j = 0; j < tokens2.length; j += 1) {
                if (token === tokens2[j]) { continue outerl; }
            }
            values += (values.length > 0 ? ' ' : '') + token;
        }
        return values;
    }

    function removeComments(jqNodes) {
        jqNodes = jqLite(jqNodes);

        var i = jqNodes.length,
            node;

        if (i <= 1) {
            return jqNodes;
        }

        while (i) {

            i -= 1;
            node = jqNodes[i];

            if (node.nodeType === NODE_TYPE_COMMENT || (node.nodeType === NODE_TYPE_TEXT && node.nodeValue.trim() === '')) {
                splice.call(jqNodes, i, 1);
            }
        }

        return jqNodes;
    }

    function identifierForController(ctrl_expression) {
        var temp_ifc = 'ng - identifierForController -> ',
            match;

        if (_.isString(ctrl_expression)) {

            match = CNTRL_REG.exec(ctrl_expression);

            if (match) {
                msos_debug(temp_ifc + 'called, ref: ' + match[1] + ', ' + match[3]);
                return match;
            }

            msos.console.error(temp_ifc + 'failed, no matching identifiers.', ctrl_expression);

        } else {
            msos.console.error(temp_ifc + 'failed, input is not a string!', ctrl_expression);
        }

        return undefined;
    }

    function SimpleChange(previous, current) {
        this.previousValue = previous;
        this.currentValue = current;
    }

    SimpleChange.prototype.isFirstChange = function () {
        return this.previousValue === _UNINITIALIZED_VALUE;
    };

    $compileMinErr = minErr('$compile');

    function $CompileProvider($provide, $$sanitizeUriProvider) {
        var hasDirectives = {},
            hasBindings = {},
            Suffix = 'Directive',
            COMMENT_DIRECTIVE_REGEXP = /^\s*directive:\s*([\w-]+)\s+(.*)$/,
            CLASS_DIRECTIVE_REGEXP = /(([\w-]+)(?::([^;]+))?;?)/,
            ALL_OR_NOTHING_ATTRS = makeMap(['ngSrc', 'ngSrcset', 'src', 'srcset']),
            REQUIRE_PREFIX_REGEXP = /^(?:(\^\^?)?(\?)?(\^\^?)?)?/,
            EVENT_HANDLER_ATTR_REGEXP = /^(on[a-z]+|formaction)$/,
            bindingCache = createMap(),
            preAssignBindingsEnabled_CP = false,
            debugInfoEnabled_CP = msos.config.debug,    // Default in std AngularJS is 'true'
            commentDirectivesEnabledConfig = true,      // Default in std AngularJS is 'true'
            cssClassDirectivesEnabledConfig = true,     // Default in std AngularJS is 'true'
            TTL_CP = 10,
            temp_cp = 'ng - $CompileProvider',
            vc = (msos_verbose === 'compile');

        function parseIsolateBindings(scope, directiveName, isController) {
            var LOCAL_REGEXP = /^\s*([@&<]|=(\*?))(\??)\s*([\w$]*)\s*$/,
                bindings = createMap();

            forEach(
                scope,
                function (definition, scopeName) {

                    if (bindingCache[definition] !== undefined) {
                        bindings[scopeName] = bindingCache[definition];
                        return;
                    }

                    var match = definition.match(LOCAL_REGEXP);

                    if (!match) {
                        throw $compileMinErr(
                            'iscp',
                            'Invalid {3} for directive \'{0}\'. Definition: {... {1}: \'{2}\' ...}',
                            directiveName,
                            scopeName,
                            definition,
                            (isController ? 'controller bindings definition' : 'isolate scope definition'));
                    }

                    bindings[scopeName] = {
                        mode: match[1][0],
                        collection: match[2] === '*',
                        optional: match[3] === '?',
                        attrName: match[4] || scopeName
                    };

                    if (match[4]) {
                        bindingCache[definition] = bindings[scopeName];
                    }

                    hasBindings[scopeName] = true;
                }
            );

            if (vc) {
                msos_debug(temp_cp + ' - parseIsolateBindings -> called, directiveName: ' + directiveName + ', bindings:', bindings);
            }

            return bindings;
        }

        function parseDirectiveBindings(directive, directiveName) {
            var bindings = {
                    isolateScope: null,
                    bindToController: null
                };

            if (isObject(directive.scope)) {
                if (directive.bindToController === true) {
                    bindings.bindToController = parseIsolateBindings(directive.scope, directiveName, true);
                    bindings.isolateScope = {};
                } else {
                    bindings.isolateScope = parseIsolateBindings(directive.scope, directiveName, false);
                }
            }

            if (isObject(directive.bindToController)) {
                bindings.bindToController = parseIsolateBindings(directive.bindToController, directiveName, true);
            }

            if (bindings.bindToController && !directive.controller) {
                // There is no controller
                throw $compileMinErr(
                    'noctrl',
                    'Cannot bind to controller without directive \'{0}\'s controller.',
                    directiveName
                );
            }

            return bindings;
        }

        function assertValidDirectiveName(name) {
            var letter = name.charAt(0);

            if (!letter || letter !== lowercase(letter)) {
                throw $compileMinErr(
                    'baddir',
                    'Directive/Component name \'{0}\' is invalid. The first character must be a lowercase letter',
                    name
                );
            }

            if (name !== trim(name)) {
                throw $compileMinErr(
                    'baddir',
                    'Directive/Component name \'{0}\' is invalid. The name should not contain leading or trailing whitespaces',
                    name
                );
            }
        }

        function getDirectiveRequire(directive) {
            var require = directive.require || (directive.controller && directive.name);

            if (!_.isArray(require) && isObject(require)) {
                forEach(
                    require,
                    function (value, key) {
                        var match = value.match(REQUIRE_PREFIX_REGEXP),
                            name = value.substring(match[0].length);

                        if (!name) { require[key] = match[0] + key; }
                    }
                );
            }

            return require;
        }

        function getDirectiveRestrict(restrict, name) {
            if (restrict && !(_.isString(restrict) && /[EACM]/.test(restrict))) {
                throw $compileMinErr(
                    'badrestrict',
                    'Restrict property \'{0}\' of directive \'{1}\' is invalid',
                    restrict,
                    name
                );
            }

            return restrict || 'EA';
        }

        this.directive = function registerDirective(name, directiveFactory) {

            assertArg(name, 'name');
            assertNotHasOwnProperty(name, 'directive');

            if (_.isString(name)) {

                if (vc) {
                    msos_debug(temp_cp + ' - directive -> start: ' + name);
                }

                assertValidDirectiveName(name);
                assertArg(directiveFactory, 'directiveFactory');

                if (!hasDirectives.hasOwnProperty(name)) {

                    hasDirectives[name] = [];

                    $provide.factory(name + Suffix, ['$injector', function ($injector) {
                        var directives = [];

                        forEach(
                            hasDirectives[name],
                            function (directiveFactory, index) {
                                var directive,
                                    df = directiveFactory,
                                    $$m_name;

                                    if (_.isArray(df))  { $$m_name = df[df.length - 1].$$moduleName; }
                                    else                { $$m_name = df.$$moduleName; }

                                    directive = $injector.invoke(
                                        directiveFactory,
                                        undefined,
                                        undefined,
                                        name
                                    );

                                    if (_.isFunction(directive)) {
                                        directive = {
                                            compile: valueFn(directive)
                                        };
                                    } else if (!directive.compile && directive.link) {
                                        directive.compile = valueFn(directive.link);
                                    }

                                    directive.priority = directive.priority || 0;
                                    directive.index = index;
                                    directive.name = directive.name || name;
                                    directive.require = getDirectiveRequire(directive);
                                    directive.restrict = getDirectiveRestrict(directive.restrict, name);
                                    directive.$$moduleName = $$m_name;
                                    directives.push(directive);
                            }
                        );

                        return directives;
                    }]);
                }

                hasDirectives[name].push(directiveFactory);

                if (vc) {
                    msos_debug(temp_cp + ' - directive ->  done: ' + name);
                }

            } else {

                if (vc) {
                    msos_debug(temp_cp + ' - directive -> start, reverseParams:', name);
                }

                forEach(name, reverseParams(registerDirective));

                if (vc) {
                    msos_debug(temp_cp + ' - directive ->  done, reverseParams:', name);
                }
            }

            return this;
        };

        this.component = function registerComponent(name, options) {

            if (!_.isString(name)) {
                forEach(
                    name,
                    reverseParams(bind(this, registerComponent))
                );
                return this;
            }

            var controller = options.controller || function comp_opt_ctrl() { msos.console.trace('ng - component -> executed (was noop)'); return undefined; };

            function factory($injector) {

                function makeInjectable(fn) {
                    if (_.isFunction(fn) || _.isArray(fn)) {
                        return function (tElement, tAttrs) {
                            return $injector.invoke(
                                        fn,
                                        this,
                                        { $element: tElement, $attrs: tAttrs },
                                        name
                                    );
                        };
                    }

                    return fn;
                }

                var template = (!options.template && !options.templateUrl ? '' : options.template),
                    ctrl_match = identifierForController(options.controller),
                    ddo = {
                        controller: controller,
                        controllerAs: (ctrl_match && ctrl_match[3]) || options.controllerAs || '$ctrl',
                        template: makeInjectable(template),
                        templateUrl: makeInjectable(options.templateUrl),
                        transclude: options.transclude,
                        scope: {},
                        bindToController: options.bindings || {},
                        restrict: 'E',
                        require: options.require
                    };

                // Copy annotations (starting with $) over to the DDO
                forEach(
                    options,
                    function (val, key) {
                        if (key.charAt(0) === '$') { ddo[key] = val; }
                    }
                );

                return ddo;
            }

            // Copy any annotation properties (starting with $) over to the factory function
            // These could be used by libraries such as the new component router
            forEach(
                options,
                function (val, key) {
                    if (key.charAt(0) === '$') {
                        factory[key] = val;
                        // Don't try to copy over annotations to named controller
                        if (_.isFunction(controller)) { controller[key] = val; }
                    }
                }
            );

            factory.$inject = ['$injector'];

            return this.directive(name, factory);
        };

        this.aHrefSanitizationWhitelist = function (regexp) {
            if (isDefined(regexp)) {
                $$sanitizeUriProvider.aHrefSanitizationWhitelist(regexp);
                return this;
            }
            return $$sanitizeUriProvider.aHrefSanitizationWhitelist();
        };

        this.imgSrcSanitizationWhitelist = function (regexp) {
            if (isDefined(regexp)) {
                $$sanitizeUriProvider.imgSrcSanitizationWhitelist(regexp);
                return this;
            }
            return $$sanitizeUriProvider.imgSrcSanitizationWhitelist();
        };

        this.debugInfoEnabled = function (enabled) {
            if (isDefined(enabled)) {
                debugInfoEnabled_CP = enabled;
                return this;
            }
            return debugInfoEnabled_CP;
        };

        /*
         * If enabled (true), the compiler assigns the value of each of the bindings to the
         * properties of the controller object before the constructor of this object is called.
         *
         * If disabled (false), the compiler calls the constructor first before assigning bindings.
         *
         * The default value is true in Angular 1.5.x but will switch to false in Angular 1.6.x.
         */
        this.preAssignBindingsEnabled = function (enabled) {
            if (isDefined(enabled)) {
                preAssignBindingsEnabled_CP = enabled;

                return this;
            }

            return preAssignBindingsEnabled_CP;
        };

        this.onChangesTtl = function (value) {
            if (arguments.length) {
                TTL_CP = value;
                return this;
            }
            return TTL_CP;
        };

        this.commentDirectivesEnabled = function (value) {
            if (arguments.length) {
                commentDirectivesEnabledConfig = value;
                return this;
            }

            return commentDirectivesEnabledConfig;
        };

        this.cssClassDirectivesEnabled = function (value) {
            if (arguments.length) {
                cssClassDirectivesEnabledConfig = value;
                return this;
            }

            return cssClassDirectivesEnabledConfig;
        };

        this.$get = [
            '$injector', '$interpolate', '$templateRequest', '$parse',
            '$controller', '$rootScope', '$sce', '$animate', '$$sanitizeUri',
            function ($injector, $interpolate, $templateRequest, $parse,
                     $controller, $rootScope, $sce, $animate, $$sanitizeUri) {

            var SIMPLE_ATTR_NAME = /^\w/,
                comment_dir_enabled = commentDirectivesEnabledConfig,
                css_class_dir_enabled = cssClassDirectivesEnabledConfig,
                specialAttrHolder = window.document.createElement('div'),
                onChangesTtl = TTL_CP,
                onChangesQueue,
                startSymbol = $interpolate.startSymbol(),
                endSymbol = $interpolate.endSymbol(),
                denormalizeTemplate = (startSymbol === '{{' && endSymbol === '}}') ? identity : function denormalizeTemplate(template) {
                        return template.replace(/\{\{/g, startSymbol).replace(/\}\}/g, endSymbol);
                    },
                NG_ATTR_BINDING = /^ngAttr[A-Z]/,
                MULTI_ELEMENT_DIR_RE = /^(.+)Start$/,
                applyDirectivesToNode = null,
                compile = null,
                compile_nodes_cnt = 0;

            msos_debug(temp_cp + ' - $get -> start.');

            // This function is called in a $$postDigest to trigger all the onChanges hooks in a single digest
            function flushOnChangesQueue() {
                var aborting;

                onChangesTtl -= 1;

                if (!onChangesTtl) {
                        // We have hit the TTL limit so reset everything
                        onChangesQueue = undefined;
                        aborting = $compileMinErr(
                            'infchng',
                            '{0} $onChanges() iterations reached. Aborting!',
                            TTL_CP
                        );
                        msos.console.warn(temp_cp + ' - $get - flushOnChangesQueue -> warning: ' + aborting);
                } else {
                    // We must run this hook in an apply since the $$postDigest runs outside apply
                    $rootScope.$apply(
                        function flushOCQScopeApply() {
                            var i = 0;

                            for (i = 0; i < onChangesQueue.length; i += 1) { onChangesQueue[i](); }

                            // Reset the queue to trigger a new schedule next time there is a change
                            onChangesQueue = undefined;
                        }
                    );
                }

                onChangesTtl += 1;
            }

            function Attributes(element, attributesToCopy) {
                if (attributesToCopy) {
                    var keys = Object.keys(attributesToCopy),
                        i,
                        key;

                    for (i = 0; i < keys.length; i += 1) {
                        key = keys[i];
                        this[key] = attributesToCopy[key];
                    }
                } else {
                    this.$attr = {};
                }

                this.$$element = element;
            }

            function setSpecialAttr(element, attrName, value) {
                // Attributes names that do not start with letters (such as `(click)`) cannot be set using `setAttribute`
                // so we have to jump through some hoops to get such an attribute
                // https://github.com/angular/angular.js/pull/13318
                specialAttrHolder.innerHTML = '<span ' + attrName + '>';

                var attributes = specialAttrHolder.firstChild.attributes,
                    attribute = attributes[0];

                // We have to remove the attribute from its container element before we can add it to the destination element
                attributes.removeNamedItem(attribute.name);
                attribute.value = value;
                element.attributes.setNamedItem(attribute);
            }

            Attributes.prototype = {

                $normalize: directiveNormalize,

                $addClass: function (classVal) {
                    if (classVal && classVal.length > 0) {
                        $animate.addClass(this.$$element, classVal);
                    }
                },

                $removeClass: function (classVal) {
                    if (classVal && classVal.length > 0) {
                        $animate.removeClass(this.$$element, classVal);
                    }
                },

                $updateClass: function (newClasses, oldClasses) {
                    newClasses = newClasses || '';
                    oldClasses = oldClasses || '';

                    var toAdd = tokenDifference(newClasses, oldClasses),
                        toRemove;

                    if (toAdd && toAdd.length) {
                        $animate.addClass(this.$$element, toAdd);
                    }

                    toRemove = tokenDifference(oldClasses, newClasses);

                    if (toRemove && toRemove.length) {
                        $animate.removeClass(this.$$element, toRemove);
                    }
                },

                $set: function (key, value, writeAttr, attrName) {

                    var temp_st = ' - $get - Attributes.$set -> ',
                        node = this.$$element[0],
                        booleanKey = getBooleanAttrName(node, key),
                        aliasedKey = getAliasedAttrName(key),
                        observer = key,
                        $$observers,
                        nodeName = nodeName_(this.$$element),
                        db_name_attr = ', node: ' + nodeName + ' attribute: ' + key,
                        result = '',
                        trimmedSrcset,
                        //            (   999x   ,|   999w   ,|   ,|,   )
                        srcPattern = /(\s+\d+x\s*,|\s+\d+w\s*,|\s+,|,\s+)/,
                        pattern,
                        rawUris,
                        nbrUrisWith2parts,
                        j = 0,
                        innerIdx,
                        lastTuple;

                    if (vc) {
                        msos_debug(temp_cp + temp_st + 'start' + db_name_attr);
                    }

                    if (booleanKey) {
                        this.$$element.prop(key, value);
                        attrName = booleanKey;
                    } else if (aliasedKey) {
                        this[aliasedKey] = value;
                        observer = aliasedKey;
                    }

                    this[key] = value;

                    // translate normalized key to actual key
                    if (attrName) {
                        this.$attr[key] = attrName;
                    } else {
                        attrName = this.$attr[key];
                        if (!attrName) {
                            this.$attr[key] = attrName = snake_case(key, '-');
                        }
                    }

                    if ((nodeName === 'a' && (key === 'href' || key === 'xlinkHref')) || (nodeName === 'img' && key === 'src')) {

                        if (vc) {
                            msos_debug(temp_cp + temp_st + 'unchecked' + db_name_attr + ': ' + value);
                        }

                        if (!(value === null || value === undefined)) {     // Skip since they null/undef are safe
                            // sanitize a[href] and img[src] values
                            this[key] = value = $$sanitizeUri(value, key === 'src');
                        }

                    } else if (nodeName === 'img' && key === 'srcset' && isDefined(value)) {
                        // sanitize img[srcset] values
                        if (vc) {
                            msos_debug(temp_cp + temp_st + 'unchecked' + db_name_attr + ': ' + value);
                        }

                        if (!(value === null || value === undefined)) {     // Skip since they null/undef are safe
                            // first check if there are spaces because it's not the same pattern
                            trimmedSrcset = trim(value);

                            pattern = /\s/.test(trimmedSrcset) ? srcPattern : /(,)/;

                            // split srcset into tuple of uri and descriptor except for the last item
                            rawUris = trimmedSrcset.split(pattern);

                            // for each tuples
                            nbrUrisWith2parts = Math.floor(rawUris.length / 2);

                            for (j = 0; j < nbrUrisWith2parts; j += 1) {
                                innerIdx = j * 2;
                                // sanitize the uri
                                result += $$sanitizeUri(trim(rawUris[innerIdx]), true);
                                // add the descriptor
                                result += (' ' + trim(rawUris[innerIdx + 1]));
                            }

                            // split the last item into uri and descriptor
                            lastTuple = trim(rawUris[j * 2]).split(/\s/);

                            // sanitize the last uri
                            result += $$sanitizeUri(trim(lastTuple[0]), true);

                            // and add the last descriptor if any
                            if (lastTuple.length === 2) {
                                result += (' ' + trim(lastTuple[1]));
                            }

                            this[key] = value = result;
                        }
                    }

                    if (writeAttr !== false) {
                        if (value === null || _.isUndefined(value)) {
                            if (vc) {
                                msos_debug(temp_cp + temp_st + 'remove attribute' + db_name_attr);
                            }
                            this.$$element.removeAttr(attrName);
                        } else {
                            if (SIMPLE_ATTR_NAME.test(attrName)) {
                                this.$$element.attr(attrName, value);
                            } else {
                                setSpecialAttr(this.$$element[0], attrName, value);
                            }
                        }
                    }

                    // fire observers
                    $$observers = this.$$observers;

                    if ($$observers) {
                        forEach(
                            $$observers[observer],
                            function (fn) {
                                if (msos_verbose) {
                                    try {
                                        fn(value);
                                    } catch (e) {
                                        msos.console.error(temp_cp + temp_st + 'failed' + db_name_attr, e);
                                    }
                                } else {
                                    fn(value);
                                }
                                
                            }
                        );
                    }

                    if (vc) {
                        msos_debug(temp_cp + temp_st + ' done' + db_name_attr);
                    }
                },

                $observe: function (key, fn) {
                    var attrs = this,
                        $$observers,
                        listeners;

                    if (!attrs.$$observers) { attrs.$$observers = createMap(); }

                    $$observers = attrs.$$observers;

                    if (!$$observers[key]) { $$observers[key] = []; }

                    listeners = $$observers[key];

                    listeners.push(fn);

                    $rootScope.$evalAsync(
                        function () {
                            if (!listeners.$$inter && attrs.hasOwnProperty(key) && !_.isUndefined(attrs[key])) {
                                fn(attrs[key]);
                            }
                        },
                        { directive_name: '$CompileProvider' }
                    );

                    return function () {
                        arrayRemove(listeners, fn);
                    };
                }
            };

            function wrapTemplate(type, template) {
                var wrapper;

                type = lowercase(type || 'html');

                switch (type) {
                    case 'svg':
                    case 'math':
                        wrapper = window.document.createElement('div');
                        wrapper.innerHTML = '<' + type + '>' + template + '</' + type + '>';
                        return wrapper.childNodes[0].childNodes;
                    default:
                        return template;
                }
            }

            function detectNamespaceForChildElements(parentElement) {

                var node = parentElement && parentElement[0];

                if (!node) { return 'html'; }

                return nodeName_(node) !== 'foreignobject' && ngto_string.call(node).match(/SVG/) ? 'svg' : 'html';
            }

            function createBoundTranscludeFn(scope, transcludeFn, previousBoundTranscludeFn) {

                function boundTranscludeFn(transcludedScope, cloneFn, controllers_bT, futureParentElement, containingScope) {

                    if (!transcludedScope) {
                        transcludedScope = scope.$new(false, containingScope);
                        transcludedScope.$$name += '_bound' + transcludedScope.$id;
                        transcludedScope.$$transcluded = true;
                    }

                    return transcludeFn(
                        transcludedScope,
                        cloneFn,
                        {
                            parentBoundTranscludeFn: previousBoundTranscludeFn,
                            transcludeControllers: controllers_bT,
                            futureParentElement: futureParentElement
                        }
                    );
                }

                var boundSlots = boundTranscludeFn.$$slots = createMap(),
                    slotName;

                // We need to attach the transclusion slots onto the `boundTranscludeFn`
                // so that they are available inside the `controllersBoundTransclude` function 
                for (slotName in transcludeFn.$$slots) {    // Leave as is
                    if (transcludeFn.$$slots[slotName]) {   // hasOwnProperty() na in transcludeFn.$$slots
                        boundSlots[slotName] = createBoundTranscludeFn(
                            scope,
                            transcludeFn.$$slots[slotName],
                            previousBoundTranscludeFn
                        );
                    } else {
                        boundSlots[slotName] = null;
                    }
                }

                return boundTranscludeFn;
            }

            function addDirective(tDirectives, tAdded_directives, name, location, maxPriority, ignoreDirective, startAttrName, endAttrName) {

                var temp_ad = ' - $get - addDirective -> ',
                    db_out =  ' name: ' + name + ', for: ' + location,
                    flag_match = false,
                    directive,
                    directives,
                    i = 0,
                    iso_bindings;

                if (vc) {
                    msos_debug(temp_cp + temp_ad + 'start,' + db_out, _.keys(tAdded_directives));
                }

                if (name === ignoreDirective) {
                    if (vc) {
                        msos_debug(temp_cp + temp_ad + ' done,' + db_out + ' ignored.');
                    }
                    return null;
                }

                if (hasDirectives.hasOwnProperty(name)) {

                    directives = $injector.get(name + Suffix);

                    for (i = 0; i < directives.length; i += 1) {

                        directive = directives[i];

                        if ((_.isUndefined(maxPriority) || maxPriority > directive.priority) && directive.restrict.indexOf(location) !== -1) {

                            if (startAttrName) {
                                directive = inherit(directive, {
                                    $$start: startAttrName,
                                    $$end: endAttrName
                                });
                            }

                            if (!directive.$$bindings) {

                                iso_bindings = directive.$$bindings = parseDirectiveBindings(directive, directive.name);

                                if (isObject(iso_bindings.isolateScope)) {
                                    directive.$$isolateBindings = iso_bindings.isolateScope;
                                }
                            }

                            if (!tAdded_directives[directive.name]) {

                                tDirectives.push(directive);
                                flag_match = true;

                                // Record as an object
                                tAdded_directives[directive.name] = true;

                                if (vc && !directive.$$moduleName) {
                                    msos.console.warn(temp_cp + temp_ad + 'no $$moduleName, directive:', directive);
                                }

                            } else {
                                db_out += ', already assigned.';
                            }
                        }
                    }

                    if (vc) {
                        msos_debug(temp_cp + temp_ad + ' done,' + db_out, _.keys(tAdded_directives));
                    }
                } else {
                    if (vc) {
                        msos_debug(temp_cp + temp_ad + ' done,' + db_out + ' is not available.');
                    }
                }

                return flag_match;
            }

            function directiveIsMultiElement(name) {
                var directive,
                    directives,
                    i = 0;

                if (hasDirectives.hasOwnProperty(name)) {

                    directives = $injector.get(name + Suffix);

                    for (i = 0; i < directives.length; i += 1) {
                        directive = directives[i];
                        if (directive.multiElement) {
                            return true;
                        }
                    }
                }

                return false;
            }

            function getTrustedContext(node, attrNormalizedName) {

                if (attrNormalizedName === 'srcdoc') {
                    return $sce.HTML;
                }

                var tag = nodeName_(node);

                // All tags with src attributes require a RESOURCE_URL value, except for
                // img and various html5 media tags.
                if (attrNormalizedName === 'src' || attrNormalizedName === 'ngSrc') {
                    if (['img', 'video', 'audio', 'source', 'track'].indexOf(tag) === -1) {
                        return $sce.RESOURCE_URL;
                    }
                // maction[xlink:href] can source SVG.  It's not limited to <maction>.
                } else if (attrNormalizedName === 'xlinkHref' || (tag === 'form' && attrNormalizedName === 'action') || (tag === 'link' && attrNormalizedName === 'href')) {
                    return $sce.RESOURCE_URL;
                }

                return undefined;
            }

            function addAttrInterpolateDirective(node, directives, value, name, isNgAttr) {
                var temp_ai = ' - $get - addAttrInterpolateDirective -> ',
                    trustedContext,
                    mustHaveExpression = !isNgAttr,
                    allOrNothing = ALL_OR_NOTHING_ATTRS[name] || isNgAttr,
                    interpolateFn;

                if (vc) {
                    msos_debug(temp_cp + temp_ai + 'start, name: ' + name);
                }

                trustedContext = getTrustedContext(node, name);
                interpolateFn = $interpolate(value, mustHaveExpression, trustedContext, allOrNothing);

                // no interpolation found -> ignore
                if (!interpolateFn) {
                    if (vc) {
                        msos_debug(temp_cp + temp_ai + ' done, name: ' + name + ', no interpolation function.');
                    }
                    return;
                }

                if (name === 'multiple' && nodeName_(node) === 'select') {
                    throw $compileMinErr(
                        'selmulti',
                        'Binding to the \'multiple\' attribute is not supported. Element: {0}',
                        startingTag(node)
                    );
                }

                if (EVENT_HANDLER_ATTR_REGEXP.test(name)) {
                    throw $compileMinErr(
                        'nodomevents',
                        'Interpolations for HTML DOM event attributes are disallowed.  Please use the ' +
                        'ng- versions (such as ng-click instead of onclick) instead.'
                    );
                }

                directives.push({
                    priority: 100,
                    compile: function () {
                        return {
                            pre: function attrInterpolatePreLinkFn(scope, element_na, attr) {
                                var $$observers,
                                    watch_scope,
                                    newValue;

                                if (!attr.$$observers) { attr.$$observers = createMap(); }

                                $$observers = attr.$$observers;

                                // If the attribute has changed since last $interpolate()ed
                                newValue = attr[name];

                                if (newValue !== value) {
                                    if (newValue && newValue.length && NOT_EMPTY.test(newValue) === true) {
                                        interpolateFn = $interpolate(newValue, true, trustedContext, allOrNothing);
                                    }
                                    value = newValue;
                                }

                                // if attribute was updated so that there is no interpolation going on we don't want to
                                // register any observers
                                if (!interpolateFn) { return; }

                                attr[name] = interpolateFn(scope);

                                if (!$$observers[name]) { $$observers[name] = []; }

                                $$observers[name].$$inter = true;

                                if (attr.$$observers
                                 && attr.$$observers[name]
                                 && attr.$$observers[name].$$scope) {
                                    watch_scope = attr.$$observers[name].$$scope;
                                } else {
                                    watch_scope = scope;
                                }

                                watch_scope.$watch(
                                    interpolateFn,
                                    function interpolateAttrFnWatchAction(newValue, oldValue) {
                                        if (name === 'class' && newValue !== oldValue) {
                                            attr.$updateClass(newValue, oldValue);
                                        } else {
                                            attr.$set(name, newValue);
                                        }
                                    }
                                );
                            }
                        };
                    }
                });

                if (vc) {
                    msos_debug(temp_cp + temp_ai + ' done, name: ' + name);
                }
            }

            function addTextInterpolateDirective(directives, text) {
                var temp_at = ' - $get - addTextInterpolateDirective -> ',
                    interpolateFn;

                if (vc) {
                    msos_debug(temp_cp + temp_at + 'start.');
                }

                // Note: we only get here for non-whitespace character strings (works for 'true')
                interpolateFn = $interpolate(text, true);

                if (interpolateFn) {

                    if (vc) {
                        msos_debug(temp_cp + temp_at + 'add directive.');
                    }

                    directives.push({
                        priority: 0,
                        compile: function textInterpolateCompileFn(templateNode) {
                            var templateNodeParent = templateNode.parent(),
                                hasCompileParent = !!templateNodeParent.length;

                            // When transcluding a template that has bindings in the root
                            // we don't have a parent and thus need to add the class during linking fn.
                            if (hasCompileParent) {
                                compile.$$addBindingClass(templateNodeParent);
                            }

                            return function textInterpolateLinkFn(scope, node) {
                                var parent = node.parent();

                                if (!hasCompileParent) { compile.$$addBindingClass(parent); }

                                scope.$watch(
                                    interpolateFn,
                                    function interpolateTextFnWatchAction(value) {
                                        node[0].nodeValue = value;
                                    }
                                );
                            };
                        }
                    });
                }

                if (vc) {
                    msos_debug(temp_cp + temp_at + 'done!');
                }
            }

            function byPriority(a, b) {
                var diff = b.priority - a.priority;
                if (diff !== 0) { return diff; }
                if (a.name !== b.name) { return (a.name < b.name) ? -1 : 1; }
                return a.index - b.index;
            }

            function collectDirectives(node, node_directives, node_attrs, maxPriority, ignoreDirective) {

                var temp_cd = ' - $get - collectDirectives -> ',
                    node_type = node.nodeType,
                    node_name = nodeName_(node),
                    node_attrs_array,
                    node_ng_attrs_array = [],
                    node_added_directives = {},
                    node_norm_name = directiveNormalize(node_name),
                    node_class_name,
                    node_attrs_map = node_attrs.$attr,
                    attr,
                    at_name,
                    at_value,
                    at_ignore = false,
                    at_start_name = false,
                    at_end_name = false,
                    at_ng_name,
                    at_is_ng,
                    at_ng_name_final,
                    at_ng_name_class,
                    at_ng_name_class_match,
                    at_ng_name_comment,
                    at_ng_name_comment_match,
                    j = 0,
                    jj = 0,
                    multiElementMatch,
                    match,
                    directive_names = [];

                if (vc) {
                    msos_debug(temp_cp + temp_cd + 'start, for: ' + node_norm_name);
                }

                switch (node_type) {

                    case NODE_TYPE_ELEMENT:
                        // Use the node name: <directive>

                        if (!validStdHtml[node_norm_name]) { customHtml[node_norm_name] = true; }

                        if (vc) {
                            msos_debug(temp_cp + temp_cd + 'type element, ' + (validStdHtml[node_norm_name] ? '(std html)' : '(custom)') + ' normalized name: ' + node_norm_name);
                        }

                        node_attrs_array = node.attributes;

                        if (node_attrs_array && node_attrs_array.length) { jj = node_attrs_array.length; }

                        for (j = 0; j < jj; j += 1) {

                            at_start_name = false;
                            at_end_name = false;

                            attr = node_attrs_array[j];

                            at_name = attr.name;
                            at_value = attr.value;

                            // support ngAttr attribute binding
                            at_ng_name = directiveNormalize(at_name);

                            if (at_ng_name === 'ngIgnore') {
                                at_ignore = true;
                                // Set this so we can stop child elements too.
                                node_attrs_map[at_ng_name] = at_name;
                            } else {
                                if (!validStdAttrs[lowercase(at_name)]) {
                                    customAttr[at_ng_name] = true;
                                }
                            }

                            if (!at_ignore) {   // Don't bother if ngIgnore

                                at_is_ng = NG_ATTR_BINDING.test(at_ng_name);
    
                                if (at_is_ng) {
                                    at_name = at_name.replace(
                                        PREFIX_REGEXP,
                                        ''
                                    ).substr(8).replace(
                                        /_(.)/g,
                                        function (match_na, letter) {
                                            return letter.toUpperCase();
                                        }
                                    );
                                }

                                multiElementMatch = at_ng_name.match(MULTI_ELEMENT_DIR_RE);

                                if (multiElementMatch && directiveIsMultiElement(multiElementMatch[1])) {
                                    at_start_name = at_name;
                                    at_end_name = at_name.substr(0, at_name.length - 5) + 'end';
                                    at_name = at_name.substr(0, at_name.length - 6);
                                }

                                // Get the final ng name (if mutiple element)
                                at_ng_name_final = directiveNormalize(at_name.toLowerCase());

                                node_attrs_map[at_ng_name_final] = at_name;

                                if (at_is_ng || !node_attrs.hasOwnProperty(at_ng_name_final)) {
                                    node_attrs[at_ng_name_final] = at_value;
                                    if (getBooleanAttrName(node, at_ng_name_final)) {
                                        node_attrs[at_ng_name_final] = true;        // presence means true
                                    }
                                }

                                // Group our attribute names/values
                                node_ng_attrs_array.push({
                                    name:           at_name,
                                    value:          at_value,
                                    start_name:     at_start_name,
                                    end_name:       at_end_name,
                                    ng_name_final:  at_ng_name_final,
                                    is_ng:          at_is_ng
                                });
                            }
                        }

                        if (!at_ignore) {

                            if (vc) {
                                msos_debug(temp_cp + temp_cd + 'type element, directive check name: ' + node_norm_name);
                            }

                            addDirective(
                                node_directives,
                                node_added_directives,
                                node_norm_name,
                                'E',
                                maxPriority,
                                ignoreDirective
                            );

                            for (j = 0; j < jj; j += 1) {

                                if (vc) {
                                    msos_debug(temp_cp + temp_cd + 'type element, directive check attribute: ' + at_ng_name_final);
                                }

                                if (node_ng_attrs_array[j].value && node_ng_attrs_array[j].value.length && NOT_EMPTY.test(node_ng_attrs_array[j].value) === true) {
                                    addAttrInterpolateDirective(
                                        node,
                                        node_directives,
                                        node_ng_attrs_array[j].value,
                                        node_ng_attrs_array[j].ng_name_final,
                                        node_ng_attrs_array[j].is_ng
                                    );
                                }

                                addDirective(
                                    node_directives,
                                    node_added_directives,
                                    node_ng_attrs_array[j].ng_name_final,
                                    'A',
                                    maxPriority,
                                    ignoreDirective,
                                    node_ng_attrs_array[j].start_name,
                                    node_ng_attrs_array[j].end_name
                                );
                            }

                            if (node_name === 'input' && node.getAttribute('type') === 'hidden') {
                                // Hidden input elements can have strange behaviour when navigating back to the page
                                // This tells the browser not to try to cache and reinstate previous values
                                node.setAttribute('autocomplete', 'off');
                            }

                            // Use class as directive
                            if (!css_class_dir_enabled) { break; }

                            node_class_name = node.className;

                            if (_.isObject(node_class_name)) {
                                // Maybe SVGAnimatedString
                                node_class_name = node_class_name.animVal;
                            }

                            if (_.isString(node_class_name) && node_class_name !== '') {

                                // initial value
                                match = CLASS_DIRECTIVE_REGEXP.exec(node_class_name);

                                while (match) {
                                    at_ng_name_class = directiveNormalize(match[2]);

                                    if (vc) {
                                        msos_debug(temp_cp + temp_cd + 'type element, directive check class: ' + at_ng_name_class);
                                    }

                                    at_ng_name_class_match = addDirective(
                                        node_directives,
                                        node_added_directives,
                                        at_ng_name_class,
                                        'C',
                                        maxPriority,
                                        ignoreDirective
                                    );

                                    if (at_ng_name_class_match) {
                                        node_attrs[at_ng_name_class] = trim(match[3]);
                                    }

                                    node_class_name = node_class_name.substr(match.index + match[0].length);

                                    // for next interation
                                    match = CLASS_DIRECTIVE_REGEXP.exec(node_class_name);
                                }
                            }
                        } else {
                            msos_debug(temp_cp + temp_cd + 'type element, skipped: ' + node_name + ', for: ngIgnore');
                        }
                    break;

                    case NODE_TYPE_TEXT:
                        addTextInterpolateDirective(node_directives, node.nodeValue);
                    break;

                    case NODE_TYPE_COMMENT:

                        if (!comment_dir_enabled) { break; }

                        match = COMMENT_DIRECTIVE_REGEXP.exec(node.nodeValue);

                        if (match) {
                            at_ng_name_comment = directiveNormalize(match[1]);

                            msos.console.warn(temp_cp + temp_cd + 'type comment. It is recommended to use elements or attributes instead. Check comment directive: ' + at_ng_name_comment);

                            at_ng_name_comment_match = addDirective(
                                node_directives,
                                node_added_directives,
                                at_ng_name_comment,
                                'M',
                                maxPriority,
                                ignoreDirective
                            );

                            if (at_ng_name_comment_match) {
                                node_attrs[at_ng_name_comment] = trim(match[2]);
                            }
                        }
                    break;
                }

                node_directives.sort(byPriority);

                if (vc) {
                    forEach(
                        node_directives,
                        function (d_obj) { directive_names.push(d_obj.name || (d_obj.compile ? 'compile' : 'na')); }
                    );
                    msos_debug(temp_cp + temp_cd + ' done, for: ' + node_name + ', directives:', directive_names);
                }

                return node_directives;
            }

            function cloneAndAnnotateFn(fn, annotation) {
                return extend(function () {
                    return fn.apply(null, arguments);
                }, fn, annotation);
            }

            function groupScan(node, attrStart, attrEnd) {
                var nodes = [],
                    depth = 0;

                if (attrStart && node.hasAttribute && node.hasAttribute(attrStart)) {

                    do {
                        if (!node) {
                            throw $compileMinErr(
                                'uterdir',
                                'Unterminated attribute, found \'{0}\' but no matching \'{1}\' found.',
                                attrStart,
                                attrEnd
                            );
                        }
                        if (node.nodeType === NODE_TYPE_ELEMENT) {
                            if (node.hasAttribute(attrStart))   { depth += 1; }
                            if (node.hasAttribute(attrEnd))     { depth -= 1; }
                        }
                        nodes.push(node);
                        node = node.nextSibling;
                    } while (depth > 0);
                } else {
                    nodes.push(node);
                }

                return jqLite(nodes);
            }

            function groupElementsLinkFnWrapper(linkFn, attrStart, attrEnd) {
                return function groupedElementsLink(scope, element, attrs, controllers_gE, transcludeFn) {
                    element = groupScan(element[0], attrStart, attrEnd);
                    return linkFn(scope, element, attrs, controllers_gE, transcludeFn);
                };
            }

            function compilationGenerator(eager, $compileNodes, transcludeFn, maxPriority, ignoreDirective, previousCompileContext) {
                var compiled;

                if (eager) {
                    return compile(
                        $compileNodes,
                        transcludeFn,
                        maxPriority,
                        ignoreDirective,
                        previousCompileContext
                    );
                }

                return function lazyCompilation() {
                    if (!compiled) {
                        compiled = compile(
                            $compileNodes,
                            transcludeFn,
                            maxPriority,
                            ignoreDirective,
                            previousCompileContext
                        );

                        // Null out all of these references in order to make them eligible for garbage collection
                        // since this is a potentially long lived closure
                        $compileNodes = transcludeFn = previousCompileContext = null;
                    }

                    return compiled.apply(this, arguments);
                };
            }

            function mergeTemplateAttributes(dst, src) {
                var srcAttr = src.$attr,
                    dstAttr = dst.$attr;

                // reapply the old attributes to the new element
                forEach(dst, function (value, key) {
                    if (key.charAt(0) !== '$') {
                        if (src[key] && src[key] !== value) {
                            if (value.length) {
                                value += (key === 'style' ? ';' : ' ') + src[key];
                            } else {
                                value = src[key];
                            }
                        }
                        dst.$set(key, value, true, srcAttr[key]);
                    }
                });

                // copy the new attributes on the old attrs object
                forEach(src, function (value, key) {
                    if (!dst.hasOwnProperty(key) && key.charAt(0) !== '$') {
                        dst[key] = value;

                        if (key !== 'class' && key !== 'style') {
                            dstAttr[key] = srcAttr[key];
                        }
                    }
                });
            }

            function markDirectiveScope(directives, isolateScope, newScope) {
                var j = 0,
                    jj = 0;

                for (j = 0, jj = directives.length; j < jj; j += 1) {
                    directives[j] = inherit(
                        directives[j],
                        {
                            $$isolateScope: isolateScope,
                            $$newScope: newScope
                        }
                    );
                }
            }

            function assertNoDuplicate(what, previousDirective, directive, element) {
                var temp_an = ' - $get - assertNoDuplicate -> ',
                    output_err;

                if (msos_verbose) {
                    msos_debug(temp_cp + temp_an + 'called, directive: ' + directive.name + ' vs. previous: ' + (previousDirective ? previousDirective.name : 'na') + ', for: ' + what);
                }

                function wrapModuleNameIfDefined(moduleName) {
                    return moduleName ? (' (module: ' + moduleName + ')') : '';
                }

                if (previousDirective) {
                    output_err = $compileMinErr(
                        'multidir',
                        'Multiple directives [{0}{1}, {2}{3}] asking for {4} on: {5}',
                        previousDirective.name,
                        wrapModuleNameIfDefined(previousDirective.$$moduleName),
                        directive.name,
                        wrapModuleNameIfDefined(directive.$$moduleName),
                        what,
                        startingTag(element)
                    );

                    msos.console.error(temp_cp + temp_an + what + '\n' + output_err);
                }
            }

            function replaceWith($rootElement, elementsToRemove, newNode) {
                var firstElementToRemove = elementsToRemove[0],
                    removeCount = elementsToRemove.length,
                    parent = firstElementToRemove.parentNode,
                    i = 0,
                    ii = 0,
                    j = 0,
                    jj = 0,
                    j2 = 0,
                    fragment;

                if ($rootElement) {
                    for (i = 0, ii = $rootElement.length; i < ii; i += 1) {
                        if ($rootElement[i] === firstElementToRemove) {
                            $rootElement[i] = newNode;
                            i += 1;
                            for (j = i, j2 = j + removeCount - 1, jj = $rootElement.length; j < jj; j += 1, j2 += 1) {
                                if (j2 < jj) {
                                    $rootElement[j] = $rootElement[j2];
                                } else {
                                    delete $rootElement[j];
                                }
                            }
                            $rootElement.length -= removeCount - 1;

                            // If the replaced element is also the jQuery .context then replace it
                            // .context is a deprecated jQuery api, so we should set it only when jQuery set it
                            // http://api.jquery.com/context/
                            if ($rootElement.context === firstElementToRemove) {
                                $rootElement.context = newNode;
                            }
                            break;
                        }
                    }
                }

                if (parent) {
                    parent.replaceChild(newNode, firstElementToRemove);
                }

                // Append all the `elementsToRemove` to a fragment. This will...remove them from the DOM, allow them to still be traversed with .nextSibling
                // and allow a single fragment.qSA to fetch all elements being removed
                fragment = window.document.createDocumentFragment();

                for (i = 0; i < removeCount; i += 1) {
                    fragment.appendChild(elementsToRemove[i]);
                }

                if (jqLite.hasData(firstElementToRemove)) {
                    jqLite.data(newNode, jqLite.data(firstElementToRemove));
                    jqLite(firstElementToRemove).off('$destroy');
                }

                // Cleanup any data/listeners on the elements and children.
                // This includes invoking the $destroy event on any elements with listeners.
                jqLite.cleanData(fragment.querySelectorAll('*'));

                // Update the jqLite collection to only contain the `newNode`
                for (i = 1; i < removeCount; i += 1) {
                    delete elementsToRemove[i];
                }

                elementsToRemove[0] = newNode;
                elementsToRemove.length = 1;
            }

            function mergeConsecutiveTextNodes(nodeList, idx, notLiveList) {
                var node = nodeList[idx],
                    parent = node.parentNode,
                    sibling;

                if (node.nodeType !== NODE_TYPE_TEXT) {
                    return;
                }

                while (true) {
                    sibling = parent ? node.nextSibling : nodeList[idx + 1];

                    if (!sibling || sibling.nodeType !== NODE_TYPE_TEXT) { break; }

                    node.nodeValue = node.nodeValue + sibling.nodeValue;

                    if (sibling.parentNode) {
                        sibling.parentNode.removeChild(sibling);
                    }

                    if (notLiveList && sibling === nodeList[idx + 1]) {
                        nodeList.splice(idx + 1, 1);
                    }
                }
            }

            function compileNodes(nodeList, transcludeFn, $rootElement, maxPriority, ignoreDirective, previousCompileContext_cn) {

                compile_nodes_cnt += 1;

                var temp_cn = ' - $get - compileNodes -> ',
                    debug_cn = [],
                    linkFns = [],
                    notLiveList = _.isArray(nodeList) || (nodeList instanceof jqLite),
                    attrs,
                    directives,
                    nodeLinkFn_cN,
                    childNodes,
                    childLinkFn_cN,
                    linkFnFound,
                    nodeLinkFnFound,
                    node_name,
                    l = 0,
                    m = String(compile_nodes_cnt);

                if (msos_verbose) {
                    msos_debug(temp_cp + temp_cn + 'start, iteration: ' + m);
                }

                for (l = 0; l < nodeList.length; l += 1) {

                    node_name = nodeName_(nodeList[l]);

                    // We don't want to process these, ever!
                    if (node_name !== 'head') {

                        attrs = new Attributes();

                        // Support: IE 11 only, Workaround for #11781 and #14924
                        if (msie === 11) {
                            mergeConsecutiveTextNodes(nodeList, l, notLiveList);
                        }

                        // We must always refer to nodeList[i] hereafter,
                        // since the nodes can be replaced underneath us.
                        directives = collectDirectives(nodeList[l], [], attrs, l === 0 ? maxPriority : undefined, ignoreDirective);

                        nodeLinkFn_cN = (directives.length) ? applyDirectivesToNode(
                                directives,
                                nodeList[l],
                                attrs,
                                transcludeFn,
                                $rootElement,
                                null,
                                [],
                                [],
                                previousCompileContext_cn
                            ) : null;

                        if (nodeLinkFn_cN && nodeLinkFn_cN.scope) {
                            if (vc) {
                                debug_cn.push(node_name + ' - add scope class (node: ' + l + ')');
                            }
                            compile.$$addScopeClass(attrs.$$element);
                        }

                        childNodes = nodeList[l].childNodes;

                        childLinkFn_cN = (attrs.$attr.ngIgnore || (nodeLinkFn_cN && nodeLinkFn_cN.terminal) || !childNodes || !childNodes.length) ? null : compileNodes(
                                childNodes,
                                nodeLinkFn_cN ? ((nodeLinkFn_cN.transcludeOnThisElement || !nodeLinkFn_cN.templateOnThisElement) && nodeLinkFn_cN.transclude) : transcludeFn
                            );

                        if (nodeLinkFn_cN || childLinkFn_cN) {
                            if (vc) {
                                debug_cn.push(node_name + ' - node or child link func. (node: ' + l + ')');
                            }
                            linkFns.push(l, nodeLinkFn_cN, childLinkFn_cN);
                            linkFnFound = true;
                            nodeLinkFnFound = nodeLinkFnFound || nodeLinkFn_cN;
                        }

                        // use the previous context only for the first element in the virtual group
                        previousCompileContext_cn = {};   // ???? {}
                    }
                }

                function compositeLinkFn(scope, nodeList, $rootElement, parentBoundTranscludeFn) {
                    var nodeLinkFn_cLF,
                        childLinkFn_cLF,
                        node,
                        childScope,
                        i,
                        idx,
                        childBoundTranscludeFn,
                        stableNodeList,
                        nodeListLength;

                    if (nodeLinkFnFound) {
                        // copy nodeList so that if a nodeLinkFn removes or adds an element at this DOM level our
                        // offsets don't get screwed up
                        nodeListLength = nodeList.length;

                        // New array with lenght 'nodeListLength'
                        stableNodeList = [];
                        stableNodeList.length = nodeListLength;

                        // create a sparse array by only copying the elements which have a linkFn
                        for (i = 0; i < linkFns.length; i += 3) {
                            idx = linkFns[i];
                            stableNodeList[idx] = nodeList[idx];
                        }
                    } else {
                        stableNodeList = nodeList;
                    }

                    for (i = 0; i < linkFns.length; i += 1) {
                        node = stableNodeList[linkFns[i]];
                        i += 1;
                        nodeLinkFn_cLF = linkFns[i];
                        i += 1;
                        childLinkFn_cLF = linkFns[i];

                        if (nodeLinkFn_cLF) {
                            if (nodeLinkFn_cLF.scope) {
                                childScope = scope.$new();
                                childScope.$$name += '_complink' + childScope.$id;
                                compile.$$addScopeInfo(jqLite(node), childScope);
                            } else {
                                childScope = scope;
                            }

                            if (nodeLinkFn_cLF.transcludeOnThisElement) {
                                childBoundTranscludeFn = createBoundTranscludeFn(
                                    scope, nodeLinkFn_cLF.transclude, parentBoundTranscludeFn
                                );

                            } else if (!nodeLinkFn_cLF.templateOnThisElement && parentBoundTranscludeFn) {
                                childBoundTranscludeFn = parentBoundTranscludeFn;

                            } else if (!parentBoundTranscludeFn && transcludeFn) {
                                childBoundTranscludeFn = createBoundTranscludeFn(scope, transcludeFn);

                            } else {
                                childBoundTranscludeFn = null;
                            }

                            nodeLinkFn_cLF(
                                childLinkFn_cLF,
                                childScope,
                                node,
                                $rootElement,
                                childBoundTranscludeFn
                            );

                        } else if (childLinkFn_cLF) {
                            childLinkFn_cLF(
                                scope,
                                node.childNodes,
                                undefined,
                                parentBoundTranscludeFn
                            );
                        }
                    }
                }

                if (msos_verbose) {
                    msos_debug(temp_cp + temp_cn + ' done, iteration: ' + m + (debug_cn.length ? ',\n     ' + debug_cn.join(',\n     ') : ''));
                }

                // return a linking function if we have found anything, null otherwise
                return linkFnFound ? compositeLinkFn : null;
            }

            function compileTemplateUrl(directives, $compileNode, tAttrs, $rootElement, childTranscludeFn, preLinkFns_cTU, postLinkFns_cTU, previousCompileContext_url) {
                var temp_ct = ' - $get - compileTemplateUrl',
                    linkQueue = [],
                    afterTemplateNodeLinkFn,
                    afterTemplateChildLinkFn,
                    beforeTemplateCompileNode = $compileNode[0],
                    origAsyncDirective = directives.shift(),
                    // The fact that we have to copy and patch the directive seems wrong!
                    derivedSyncDirective = inherit(
                        origAsyncDirective,
                        {
                            templateUrl: null,
                            transclude: null,
                            replace: null,
                            $$originalDirective: origAsyncDirective
                        }
                    ),
                    templateUrl = (_.isFunction(origAsyncDirective.templateUrl)) ? origAsyncDirective.templateUrl($compileNode, tAttrs) : origAsyncDirective.templateUrl,
                    templateNamespace = origAsyncDirective.templateNamespace;

                msos_debug(temp_cp + temp_ct + ' -> start.');

                $compileNode.empty();

                $templateRequest(templateUrl).then(
                    function (content) {
                        var compileNode_suc,
                            tempTemplateAttrs,
                            $template_suc = [],
                            childBoundTranscludeFn,
                            templateDirectives_suc,
                            scope,
                            beforeTemplateLinkNode,
                            linkRootElement,
                            boundTranscludeFn,
                            linkNode,
                            oldClasses;

                        msos_debug(temp_cp + temp_ct + ' - $templateRequest (then) -> start,\n     template: ' + templateUrl);

                        content = denormalizeTemplate(content);

                        if (origAsyncDirective.replace) {
                            msos_debug(temp_cp + temp_ct + ' - $templateRequest (then) -> replace');

                            if (jqLiteIsTextNode(content)) {
                                throw $compileMinErr(
                                    'tplrt',
                                    'Template for directive \'{0}\' is only text. Ref. templateUrl: {1}',
                                    origAsyncDirective.name,
                                    templateUrl
                                );
                            }

                            $template_suc = removeComments(wrapTemplate(templateNamespace, trim(content)));

                            compileNode_suc = $template_suc[0];

                            if ($template_suc.length !== 1) {
                                throw $compileMinErr(
                                    'tplrt',
                                    'Template for directive \'{0}\' must have exactly one root element. Ref. templateUrl: {1}',
                                    origAsyncDirective.name,
                                    templateUrl
                                );
                            }

                            if (compileNode_suc.nodeType !== NODE_TYPE_ELEMENT) {
                                throw $compileMinErr(
                                    'tplrt',
                                    'Template for directive \'{0}\' must have root element (nodeType): {1}. Ref. templateUrl: {2}',
                                    origAsyncDirective.name,
                                    NODE_TYPE_ELEMENT,
                                    templateUrl
                                );
                            }

                            tempTemplateAttrs = {
                                $attr: {}
                            };

                            replaceWith($rootElement, $compileNode, compileNode_suc);
                            templateDirectives_suc = collectDirectives(compileNode_suc, [], tempTemplateAttrs);

                            if (_.isObject(origAsyncDirective.scope)) {
                                // the original directive that caused the template to be loaded async required
                                // an isolate scope
                                markDirectiveScope(templateDirectives_suc, true);
                            }
                            directives = templateDirectives_suc.concat(directives);
                            mergeTemplateAttributes(tAttrs, tempTemplateAttrs);
                        } else {
                            msos_debug(temp_cp + temp_ct + ' - $templateRequest (then) -> insert content');

                            compileNode_suc = beforeTemplateCompileNode;
                            $compileNode.html(content);
                        }

                        directives.unshift(derivedSyncDirective);

                        afterTemplateNodeLinkFn = applyDirectivesToNode(
                            directives,
                            compileNode_suc,
                            tAttrs,
                            childTranscludeFn,
                            $compileNode,
                            origAsyncDirective,
                            preLinkFns_cTU,
                            postLinkFns_cTU,
                            previousCompileContext_url
                        );

                        forEach($rootElement, function (node, i) {
                            if (node === compileNode_suc) {
                                $rootElement[i] = $compileNode[0];
                            }
                        });

                        afterTemplateChildLinkFn = compileNodes(
                            $compileNode[0].childNodes,
                            childTranscludeFn
                        );

                        while (linkQueue.length) {
                            scope = linkQueue.shift();
                            beforeTemplateLinkNode = linkQueue.shift();
                            linkRootElement = linkQueue.shift();
                            boundTranscludeFn = linkQueue.shift();
                            linkNode = $compileNode[0];

                            if (scope.$$destroyed) { continue; }

                            if (beforeTemplateLinkNode !== beforeTemplateCompileNode) {
                                oldClasses = beforeTemplateLinkNode.className;

                                if (!(previousCompileContext_url.hasElementTranscludeDirective && origAsyncDirective.replace)) {
                                    // it was cloned therefore we have to clone as well.
                                    linkNode = jqLiteClone(compileNode_suc);
                                }

                                replaceWith(linkRootElement, jqLite(beforeTemplateLinkNode), linkNode);

                                // Copy in CSS classes from original node
                                jqLite(linkNode).addClass(oldClasses);
                            }
                            if (afterTemplateNodeLinkFn.transcludeOnThisElement) {
                                childBoundTranscludeFn = createBoundTranscludeFn(
                                    scope,
                                    afterTemplateNodeLinkFn.transclude,
                                    boundTranscludeFn
                                );
                            } else {
                                childBoundTranscludeFn = boundTranscludeFn;
                            }
                            afterTemplateNodeLinkFn(
                                afterTemplateChildLinkFn,
                                scope,
                                linkNode,
                                $rootElement,
                                childBoundTranscludeFn
                            );
                        }

                        linkQueue = null;

                        msos_debug(temp_cp + temp_ct + ' - $templateRequest (then) ->  done,\n     template: ' + templateUrl);
                    }
                )['catch'](
                    function (error) {
                        if (isError(error)) {
                            msos.console.error(temp_cp + temp_ct + ' -> error:', error);
                        } else {
                            msos.console.warn(temp_cp + temp_ct + ' -> ut..oh:', error);
                        }
                    }
                );

                msos_debug(temp_cp + temp_ct + ' -> done!');

                return function delayedNodeLinkFn(ignoreChildLinkFn_na, scope, node, rootElement, boundTranscludeFn) {
                    var childBoundTranscludeFn = boundTranscludeFn;

                    if (scope.$$destroyed) { return; }

                    if (linkQueue) {
                        linkQueue.push(
                            scope,
                            node,
                            rootElement,
                            childBoundTranscludeFn
                        );
                    } else {
                        if (afterTemplateNodeLinkFn.transcludeOnThisElement) {
                            childBoundTranscludeFn = createBoundTranscludeFn(
                                scope,
                                afterTemplateNodeLinkFn.transclude,
                                boundTranscludeFn
                            );
                        }

                        afterTemplateNodeLinkFn(
                            afterTemplateChildLinkFn,
                            scope,
                            node,
                            rootElement,
                            childBoundTranscludeFn
                        );
                    }
                };
            }

            applyDirectivesToNode = function (directives, compileNode, templateAttrs, transcludeFn, jqCollection, originalReplaceDirective, preLinkFns, postLinkFns, previousCompileContext_apply) {

                previousCompileContext_apply = previousCompileContext_apply || {};

                var temp_ap = ' - $get - applyDirectivesToNode',
                    $compileNode = jqLite(compileNode),
                    comp_node_class = compileNode.classList && compileNode.classList.length ? ' (' + compileNode.classList + ')' : '',
                    comp_node_name = lowercase(compileNode.nodeName) + comp_node_class,
                    i = 0,
                    ii = 0,
                    terminalPriority = -Number.MAX_VALUE,
                    newScopeDirective = previousCompileContext_apply.newScopeDirective,
                    controllerDirectives = previousCompileContext_apply.controllerDirectives,
                    newIsolateScopeDirective = previousCompileContext_apply.newIsolateScopeDirective,
                    templateDirective = previousCompileContext_apply.templateDirective,
                    nonTlbTranscludeDirective = previousCompileContext_apply.nonTlbTranscludeDirective,
                    hasTranscludeDirective = false,
                    hasTemplate = false,
                    hasElementTranscludeDirective = previousCompileContext_apply.hasElementTranscludeDirective,
                    directive,
                    directiveName,
                    $template,
                    replaceDirective = originalReplaceDirective,
                    childTranscludeFn = transcludeFn,
                    linkFn,
                    didScanForMultipleTransclusion = false,
                    mightHaveMultipleTransclusionError = false,
                    candidateDirective,
                    scanningIndex,
                    directiveValue,
                    directive_context,
                    attrStart,
                    attrEnd,
                    newTemplateAttrs,
                    templateDirectives,
                    unprocessedDirectives,
                    slots,
                    slotMap,
                    filledSlots,
                    slotName;

                if (msos_verbose) {
                    msos_debug(temp_cp + temp_ap + ' -> start, node: ' + comp_node_name + ', context:', previousCompileContext_apply);
                }

                templateAttrs.$$element = $compileNode;

                // executes all directives on the current element
                ii = directives.length;

                // Start: defining functions for applyDirectivesToNode
                function getControllers(directiveName, require, $element, elementControllers) {
                    var value,
                        match,
                        name,
                        inheritType,
                        optional,
                        dataName,
                        i = 0;

                    if (_.isString(require)) {

                        match = require.match(REQUIRE_PREFIX_REGEXP);
                        name = require.substring(match[0].length);
                        inheritType = match[1] || match[3];
                        optional = match[2] === '?';

                        // If only parents then start at the parent element
                        if (inheritType === '^^') {
                            $element = $element.parent();
                            // Otherwise attempt getting the controller from elementControllers in case
                            // the element is transcluded (and has no data) and to avoid .data if possible
                        } else {
                            if (elementControllers)         { value = elementControllers[name] || ''; }
                            if (value && value.instance)    { value = value.instance; }
                        }

                        if (!value) {
                            dataName = '$' + name + 'Controller';
                            value = inheritType ? $element.inheritedData(dataName) : $element.data(dataName);
                        }

                        if (!value && !optional) {
                            throw $compileMinErr(
                                'ctreq',
                                'Controller \'{0}\', required by directive \'{1}\', can\'t be found!',
                                name,
                                directiveName
                            );
                        }

                    } else if (_.isArray(require)) {
                        value = [];

                        for (i = 0; i < require.length; i += 1) {
                            value[i] = getControllers(directiveName, require[i], $element, elementControllers);
                        }
                    } else if (isObject(require)) {
                        value = {};

                        forEach(
                            require,
                            function (controller, property) {
                                value[property] = getControllers(
                                    directiveName,
                                    controller,
                                    $element,
                                    elementControllers
                                );
                            }
                        );
                    }

                    return value || null;
                }

                function setupControllers($element, attrs, transcludeFn, su_controller_dirs, su_isolated_scope, su_scope, su_new_isolated_scope_dir) {
                    var elementControllers = createMap(),
                        controllerKey,
                        directive,
                        locals = {},
                        su_controller,
                        su_controllerInstance;

                    msos_debug(temp_cp + temp_ap + ' - setupControllers -> start.', $element);

                    for (controllerKey in su_controller_dirs) {   // hasOwnProperty() na in su_controller_dirs

                        directive = su_controller_dirs[controllerKey];
                        su_controller = directive.controller;

                        locals = {
                            $scope: directive === su_new_isolated_scope_dir || directive.$$isolateScope ? su_isolated_scope : su_scope,
                            $element: $element,
                            $attrs: attrs,
                            $transclude: transcludeFn
                        };

                        if (su_controller === '@') { su_controller = attrs[directive.name]; }

                        // This noop check is experimental...
                        if (su_controller !== noop) {
                            su_controllerInstance = $controller(su_controller, locals, true, directive);

                            elementControllers[directive.name] = su_controllerInstance;
                            $element.data('$' + directive.name + 'Controller', su_controllerInstance.instance);
                        } else {
                            msos_debug(temp_cp + temp_ap + ' - setupControllers -> skipped for noop: ' + directive.name + 'Controller');
                        }

                        if (msos_verbose) {
                            msos_debug(temp_cp + temp_ap + ' - setupControllers -> for: ' + directive.name + 'Controller');
                        }
                    }

                    msos_debug(temp_cp + temp_ap + ' - setupControllers ->  done!');
                    return elementControllers;
                }

                // Set up $watches for isolate scope and controller bindings. This process
                // only occurs for isolate scopes and new scopes with controllerAs.
                function initializeDirectiveBindings(scope, attrs, destination, bindings, directive) {
                    var removeWatchCollection = [],
                        initialChanges = {},
                        changes;

                    msos_debug(temp_cp + temp_ap + ' - initializeDirectiveBindings -> start.');

                    function triggerOnChangesHook() {
                        destination.$onChanges(changes);
                        // Now clear the changes so that we schedule onChanges when more changes arrive
                        changes = undefined;
                    }

                    function recordChanges(key, currentValue, previousValue) {

                        if (_.isFunction(destination.$onChanges) && !simpleCompare(currentValue, previousValue)) {

                            // If we have not already scheduled the top level onChangesQueue handler then do so now
                            if (!onChangesQueue) {
                                scope.$$postDigest(flushOnChangesQueue);
                                onChangesQueue = [];
                            }
                            // If we have not already queued a trigger of onChanges for this controller then do so now
                            if (!changes) {
                                changes = {};
                                onChangesQueue.push(triggerOnChangesHook);
                            }
                            // If the has been a change on this property already then we need to reuse the previous value
                            if (changes[key]) {
                                previousValue = changes[key].previousValue;
                            }

                            // Store this change
                            changes[key] = new SimpleChange(previousValue, currentValue);
                        }
                    }

                    forEach(bindings, function initializeBinding(definition, scopeName) {
                        var attrName = definition.attrName,
                            optional = definition.optional,
                            mode = definition.mode, // @, =, <, or &
                            initialValue,
                            lastValue,
                            parentGet,
                            parentSet,
                            compare_ib,
                            parentValueWatch,
                            removeWatch,
                            deepWatch;

                        switch (mode) {

                            case '@':
                                if (!optional && !hasOwnProperty.call(attrs, attrName)) {
                                    destination[scopeName] = attrs[attrName] = undefined;
                                }

                                removeWatch = attrs.$observe(attrName, function (value) {
                                    var oldValue;

                                    if (_.isString(value) || _.isBoolean(value)) {
                                        oldValue = destination[scopeName];

                                        recordChanges(scopeName, value, oldValue);

                                        destination[scopeName] = value;
                                    }
                                });

                                attrs.$$observers[attrName].$$scope = scope;
                                lastValue = attrs[attrName];

                                if (_.isString(lastValue)) {
                                    // If the attribute has been provided then we trigger an interpolation to ensure
                                    // the value is there for use in the link fn
                                    destination[scopeName] = $interpolate(lastValue)(scope);
                                } else if (_.isBoolean(lastValue)) {
                                    // If the attributes is one of the BOOLEAN_ATTR then Angular will have converted
                                    // the value to boolean rather than a string, so we special case this situation
                                    destination[scopeName] = lastValue;
                                }

                                initialChanges[scopeName] = new SimpleChange(_UNINITIALIZED_VALUE, destination[scopeName]);
                                removeWatchCollection.push(removeWatch);
                            break;

                            case '=':

                                if (!hasOwnProperty.call(attrs, attrName)) {
                                    if (optional) { break; }
                                    attrs[attrName] = undefined;
                                }

                                if (optional && !attrs[attrName]) { break; }

                                parentGet = $parse(attrs[attrName]);

                                if (parentGet.literal) {
                                    compare_ib = equals;
                                } else {
                                    compare_ib = simpleCompare;
                                }

                                parentSet = parentGet.assign || function () {
                                    var exception = '';

                                    if (parentGet === noop) {
                                        lastValue = destination[scopeName] = undefined;
                                    } else {
                                        lastValue = destination[scopeName] = parentGet(scope);

                                        exception = $compileMinErr(
                                            'nonassign',
                                            'Expression \'{0}\' in attribute \'{1}\' used with directive \'{2}\' is non-assignable!',
                                            attrs[attrName],
                                            attrName,
                                            directive.name
                                        );

                                        msos.console.warn(temp_cp + temp_ap + ' - initializeDirectiveBindings -> warning: ' + exception);
                                    }
                                };

                                if (parentGet === noop) {
                                    lastValue = destination[scopeName] = undefined;
                                } else {
                                    lastValue = destination[scopeName] = parentGet(scope);
                                }

                                parentValueWatch = function parentValueWatch (parentValue) {
                                    if (!compare_ib(parentValue, destination[scopeName])) {
                                        // we are out of sync and need to copy
                                        if (!compare_ib(parentValue, lastValue)) {
                                            // parent changed and it has precedence
                                            destination[scopeName] = parentValue;
                                        } else {
                                            // if the parent can be assigned then do so
                                            parentSet(scope, parentValue = destination[scopeName]);
                                        }
                                    }

                                    lastValue = parentValue;

                                    return lastValue;
                                };

                                parentValueWatch.$stateful = true;

                                if (definition.collection) {
                                    removeWatch = scope.$watchCollection(attrs[attrName], parentValueWatch);
                                } else {
                                    removeWatch = scope.$watch($parse(attrs[attrName], parentValueWatch), null, parentGet.literal);
                                }

                                removeWatchCollection.push(removeWatch);
                            break;

                            case '<':
                                if (!hasOwnProperty.call(attrs, attrName)) {
                                    if (optional) { break; }
                                    attrs[attrName] = undefined;
                                }

                                if (optional && !attrs[attrName]) { break; }

                                parentGet = $parse(attrs[attrName]);
                                deepWatch = parentGet.literal;

                                // Experimental
                                if (parentGet === noop) {
                                    destination[scopeName] = undefined;
                                } else {
                                    destination[scopeName] = parentGet(scope);
                                }

                                initialValue = destination[scopeName];

                                initialChanges[scopeName] = new SimpleChange(_UNINITIALIZED_VALUE, destination[scopeName]);

                                removeWatch = scope.$watch(
                                    parentGet,
                                    function parentValueWatchAction(newValue, oldValue) {

                                        if (oldValue === newValue) {
                                            if (oldValue === initialValue || (deepWatch && equals(oldValue, initialValue))) {
                                                return;
                                            }
                                            oldValue = initialValue;
                                        }

                                        recordChanges(scopeName, newValue, oldValue);
                                        destination[scopeName] = newValue;
                                    },
                                    deepWatch
                                );

                                removeWatchCollection.push(removeWatch);
                            break;

                            case '&':
                                // Don't assign Object.prototype method to scope
                                parentGet = attrs.hasOwnProperty(attrName) ? $parse(attrs[attrName]) : noop;

                                // Don't assign noop to destination if expression is not valid
                                if (parentGet === noop && optional) { break; }

                                // Experimental
                                if (parentGet === noop) {
                                    destination[scopeName] = noop;
                                } else {
                                    destination[scopeName] = function (locals) {
                                        return parentGet(scope, locals);
                                    };
                                }

                            break;
                        }
                    });

                    msos_debug(temp_cp + temp_ap + ' - initializeDirectiveBindings ->  done!');

                    return {
                        initialChanges: initialChanges,
                        removeWatches: removeWatchCollection.length && function removeWatches() {
                            var p = 0,
                                pp = 0;

                            for (p = 0, pp = removeWatchCollection.length; p < pp; p += 1) {
                                removeWatchCollection[p]();
                            }
                        }
                    };
                }

                function nodeLinkFn(childLinkFn, scope, linkNode, $rootElement_na, boundTranscludeFn) {
                    var k = 0,
                        kk = 0,
                        linkFn_nLF,
                        isolateScope,
                        controllerScope,
                        elementControllers,
                        transcludeFn_nLF,
                        $element,
                        attrs,
                        scopeBindingInfo,
                        ctrlr_key,
                        controllerDirective,
                        controller,
                        bindings,
                        controllerResult,
                        scopeToChild;

                    // This is the function that is injected as `$transclude`.
                    // Note: all arguments are optional!
                    function controllersBoundTransclude(scope, cloneAttachFn, futureParentElement, cbt_slotName) {
                        var transcludeControllers,
                            slotTranscludeFn;

                        // No scope passed in:
                        if (!isScope(scope)) {
                            cbt_slotName = futureParentElement;
                            futureParentElement = cloneAttachFn;
                            cloneAttachFn = scope;
                            scope = undefined;
                        }

                        if (hasElementTranscludeDirective) {
                            transcludeControllers = elementControllers;
                        }

                        if (!futureParentElement) {
                            futureParentElement = hasElementTranscludeDirective ? $element.parent() : $element;
                        }

                        if (cbt_slotName) {
                            // slotTranscludeFn can be one of three things:
                            //  * a transclude function - a filled slot, `null` - an optional slot that was not filled, `undefined` - a slot that was not declared (i.e. invalid)
                            slotTranscludeFn = boundTranscludeFn.$$slots[cbt_slotName];

                            if (slotTranscludeFn) {
                                return slotTranscludeFn(
                                        scope,
                                        cloneAttachFn,
                                        transcludeControllers,
                                        futureParentElement,
                                        scopeToChild
                                    );
                            }

                            if (_.isUndefined(slotTranscludeFn)) {
                                throw $compileMinErr(
                                        'noslot',
                                        'No parent directive that requires a transclusion with slot name \'{0}\'. ' + 'Element: {1}',
                                        cbt_slotName,
                                        startingTag($element)
                                    );
                            }
                        }

                        return boundTranscludeFn(scope, cloneAttachFn, transcludeControllers, futureParentElement, scopeToChild);
                    }

                    if (compileNode === linkNode) {
                        attrs = templateAttrs;
                        $element = templateAttrs.$$element;
                    } else {
                        $element = jqLite(linkNode);
                        attrs = new Attributes($element, templateAttrs);
                    }

                    controllerScope = scope;

                    if (newIsolateScopeDirective) {
                        isolateScope = scope.$new(true);
                        isolateScope.$$name += '_nodelink' + isolateScope.$id;
                    } else if (newScopeDirective) {
                        controllerScope = scope.$parent;
                    }

                    if (boundTranscludeFn) {
                        // track `boundTranscludeFn` so it can be unwrapped if `transcludeFn`
                        // is later passed as `parentBoundTranscludeFn` to `publicLinkFn`
                        transcludeFn_nLF = controllersBoundTransclude;
                        transcludeFn_nLF.$$boundTransclude = boundTranscludeFn;
                        // expose the slots on the `$transclude` function
                        transcludeFn_nLF.isSlotFilled = function (nLF_slotName) {
                            return !!boundTranscludeFn.$$slots[nLF_slotName];
                        };
                    }

                    if (controllerDirectives) {
                        elementControllers = setupControllers(
                            $element,
                            attrs,
                            transcludeFn_nLF,
                            controllerDirectives,
                            isolateScope,
                            scope,
                            newIsolateScopeDirective
                        );
                    }

                    if (newIsolateScopeDirective) {
                        // Initialize isolate scope bindings for new isolate scope directive.
                        compile.$$addScopeInfo($element, isolateScope, true, !(templateDirective && (templateDirective === newIsolateScopeDirective || templateDirective === newIsolateScopeDirective.$$originalDirective)));

                        compile.$$addScopeClass($element, true);

                        isolateScope.$$isolateBindings = newIsolateScopeDirective.$$isolateBindings;

                        scopeBindingInfo = initializeDirectiveBindings(
                            scope,
                            attrs,
                            isolateScope,
                            isolateScope.$$isolateBindings,
                            newIsolateScopeDirective
                        );

                        if (scopeBindingInfo.removeWatches) {
                            isolateScope.$on('$destroy', scopeBindingInfo.removeWatches);
                        }
                    }

                    if (vc) {
                        msos_debug(temp_cp + temp_ap + ' -> pre-linking, pre-assigned \'bindToController\' bindings enabled: ' + preAssignBindingsEnabled_CP);
                    }

                    // Initialize bindToController bindings
                    for (ctrlr_key in elementControllers) {     // hasOwnProperty() na in elementControllers

                        controllerDirective = controllerDirectives[ctrlr_key];
                        controller = elementControllers[ctrlr_key];
                        bindings = controllerDirective.$$bindings.bindToController;

                        if (preAssignBindingsEnabled_CP) {

                            if (bindings) {
                                controller.bindingInfo = initializeDirectiveBindings(
                                    controllerScope,
                                    attrs,
                                    controller.instance,
                                    bindings,
                                    controllerDirective
                                );
                            } else {
                                controller.bindingInfo = {};
                            }

                            controllerResult = controller();

                            if (controllerResult !== controller.instance) {

                                controller.instance = controllerResult;
                                $element.data('$' + controllerDirective.name + 'Controller', controllerResult);

                                if (controller.bindingInfo.removeWatches) {
                                    controller.bindingInfo.removeWatches();
                                }

                                controller.bindingInfo = initializeDirectiveBindings(
                                    controllerScope,
                                    attrs,
                                    controller.instance,
                                    bindings,
                                    controllerDirective
                                );
                            }

                        } else {

                            controller.instance = controller();
                            $element.data('$' + controllerDirective.name + 'Controller', controller.instance);

                            controller.bindingInfo = initializeDirectiveBindings(
                                controllerScope,
                                attrs,
                                controller.instance,
                                bindings,
                                controllerDirective
                            );
                        }
                    }

                    // Bind the required controllers to the controller, if `require` is an object and `bindToController` is truthy
                    forEach(
                        controllerDirectives,
                        function (controllerDirective, name) {
                            var require = controllerDirective.require;

                            if (controllerDirective.bindToController && !_.isArray(require) && isObject(require)) {
                                extend(
                                    elementControllers[name].instance,
                                    getControllers(name, require, $element, elementControllers)
                                );
                            }
                        }
                    );

                    // Handle the init and destroy lifecycle hooks on all controllers that have them
                    forEach(
                        elementControllers,
                        function (controller) {
                            var ctrl_instance = controller.instance;

                            if (_.isFunction(ctrl_instance.$onChanges)) {
                                ctrl_instance.$onChanges(controller.bindingInfo.initialChanges);
                            }

                            if (_.isFunction(ctrl_instance.$onInit)) {
                                ctrl_instance.$onInit();
                            }

                            if (_.isFunction(ctrl_instance.$doCheck)) {
                                controllerScope.$watch(
                                    function () { ctrl_instance.$doCheck(); }
                                );
                                ctrl_instance.$doCheck();
                            }

                            if (_.isFunction(ctrl_instance.$onDestroy)) {
                                controllerScope.$on(
                                    '$destroy',
                                    function callOnDestroyHook() {
                                        ctrl_instance.$onDestroy();
                                    }
                                );
                            }
                        }
                    );

                    if (vc) {
                        msos_debug(temp_cp + temp_ap + ' -> pre-linking begins, count: ' + preLinkFns.length);
                    }

                    // PRELINKING
                    for (k = 0, kk = preLinkFns.length; k < kk; k += 1) {
                        linkFn_nLF = preLinkFns[k];

                        if (msos_verbose) {
                            msos_debug(temp_cp + temp_ap + ' -> pre-linking directive: ' + (linkFn_nLF.directiveName || 'na'));
                        }

                        linkFn_nLF(
                            linkFn_nLF.isolateScope ? isolateScope : scope,
                            $element,
                            attrs,
                            linkFn_nLF.require && getControllers(
                                linkFn_nLF.directiveName,
                                linkFn_nLF.require,
                                $element,
                                elementControllers
                            ),
                            transcludeFn_nLF
                        );
                    }

                    if (vc) {
                        msos_debug(temp_cp + temp_ap + ' -> pre-linking ends.');
                    }

                    // RECURSION
                    // We only pass the isolate scope, if the isolate directive has a template,
                    // otherwise the child elements do not belong to the isolate directive.
                    scopeToChild = scope;

                    if (newIsolateScopeDirective && (newIsolateScopeDirective.template || newIsolateScopeDirective.templateUrl === null)) {
                        scopeToChild = isolateScope;
                    }

                    if (childLinkFn) {
                        childLinkFn(scopeToChild, linkNode.childNodes, undefined, boundTranscludeFn);
                    }

                    if (vc) {
                        msos_debug(temp_cp + temp_ap + ' -> post-linking begins, count: ' + postLinkFns.length);
                    }

                    // POSTLINKING
                    for (k = postLinkFns.length - 1; k >= 0; k -= 1) {
                        linkFn_nLF = postLinkFns[k];

                        if (vc) {
                            msos_debug(temp_cp + temp_ap + ' -> post-linking directive: ' + (linkFn_nLF.directiveName || linkFn_nLF.name || 'na'));
                        }

                        linkFn_nLF(
                            linkFn_nLF.isolateScope ? isolateScope : scope,
                            $element,
                            attrs,
                            linkFn_nLF.require && getControllers(
                                linkFn_nLF.directiveName,
                                linkFn_nLF.require,
                                $element,
                                elementControllers
                            ),
                            transcludeFn_nLF
                        );
                    }

                    if (vc) {
                        msos_debug(temp_cp + temp_ap + ' -> post-linking ends.');
                    }

                    // Trigger $postLink lifecycle hooks
                    forEach(
                        elementControllers,
                        function (controller) {
                            var ctrl_inst = controller.instance;

                            if (_.isFunction(ctrl_inst.$postLink)) {
                                ctrl_inst.$postLink();
                            }
                        }
                    );
                }

                function addLinkFns(pre, post, attrStart, attrEnd) {
                    if (pre) {
                        if (attrStart) { pre = groupElementsLinkFnWrapper(pre, attrStart, attrEnd); }
                        pre.require = directive.require;
                        pre.directiveName = directiveName;
                        if (newIsolateScopeDirective === directive || directive.$$isolateScope) {
                            pre = cloneAndAnnotateFn(pre, {
                                isolateScope: true
                            });
                        }
                        preLinkFns.push(pre);
                    }

                    if (post) {
                        if (attrStart) { post = groupElementsLinkFnWrapper(post, attrStart, attrEnd); }
                        post.require = directive.require;
                        post.directiveName = directiveName;
                        if (newIsolateScopeDirective === directive || directive.$$isolateScope) {
                            post = cloneAndAnnotateFn(post, {
                                isolateScope: true
                            });
                        }
                        postLinkFns.push(post);
                    }
                }
                // End: defining functions for applyDirectivesToNode

                // Start: for loop for applyDirectivesToNode
                for (i = 0; i < ii; i += 1) {
                    directive = directives[i];
                    attrStart = directive.$$start;
                    attrEnd = directive.$$end;

                    // collect multiblock sections
                    if (attrStart) {
                        $compileNode = groupScan(compileNode, attrStart, attrEnd);
                    }

                    $template = undefined;

                    if (terminalPriority > directive.priority) {
                        break; // prevent further processing of directives
                    }

                    directiveValue = directive.scope;

                    if (directiveValue) {
                        // skip the check for directives with async templates, we'll check the derived sync
                        // directive when the template arrives
                        msos_debug(temp_cp + temp_ap + ' -> processing directive value.');

                        if (!directive.templateUrl) {
                            if (_.isObject(directiveValue)) {
                                // This directive is trying to add an isolated scope.
                                // Check that there is no scope of any kind already
                                assertNoDuplicate('new/isolated scope (object)', newIsolateScopeDirective || newScopeDirective, directive, $compileNode);
                                newIsolateScopeDirective = directive;
                            } else {
                                // This directive is trying to add a child scope.
                                // Check that there is no isolated scope already
                                assertNoDuplicate('new/isolated scope (value)', newIsolateScopeDirective, directive, $compileNode);
                            }
                        }

                        newScopeDirective = newScopeDirective || directive;
                    }

                    directiveName = directive.name;

                    // If we encounter a condition that can result in transclusion on the directive,
                    // then scan ahead in the remaining directives for others that may cause a multiple
                    // transclusion error to be thrown during the compilation process.  If a matching directive
                    // is found, then we know that when we encounter a transcluded directive, we need to eagerly
                    // compile the `transclude` function rather than doing it lazily in order to throw
                    // exceptions at the correct time
                    if (!didScanForMultipleTransclusion
                     && ((directive.replace && (directive.templateUrl || directive.template))
                     || (directive.transclude && !directive.$$tlb))) {

                        for (scanningIndex = i + 1; scanningIndex < directives.length; scanningIndex += 1) {
                            candidateDirective = directives[scanningIndex];

                            if ((candidateDirective.transclude && !candidateDirective.$$tlb)
                             || (candidateDirective.replace && (candidateDirective.templateUrl || candidateDirective.template))) {
                                mightHaveMultipleTransclusionError = true;
                                break;
                            }
                        }

                        didScanForMultipleTransclusion = true;
                    }

                    if (!directive.templateUrl && directive.controller) {

                        controllerDirectives = controllerDirectives || createMap();

                        msos_debug(temp_cp + temp_ap + ' -> waiting for template, controller ready: ' + directiveName);

                        assertNoDuplicate(
                            directiveName + ' controller',
                            controllerDirectives[directiveName],
                            directive,
                            $compileNode
                        );

                        controllerDirectives[directiveName] = directive;
                    }

                    directiveValue = directive.transclude;

                    if (directiveValue) {

                        hasTranscludeDirective = true;

                        msos_debug(temp_cp + temp_ap + ' -> processing transclusion: ' + directiveName);

                        if (!directive.$$tlb) {

                            msos_debug(temp_cp + temp_ap + ' -> processing $$tlb (false): ' + directiveName);

                            assertNoDuplicate(
                                'transclusion $$tlb (false)',
                                nonTlbTranscludeDirective,
                                directive,
                                $compileNode
                            );
                            nonTlbTranscludeDirective = directive;
                        }

                        if (directiveValue === 'element') {
                            hasElementTranscludeDirective = true;
                            terminalPriority = directive.priority;
                            $template = $compileNode;
                            $compileNode = templateAttrs.$$element = jqLite(compile.$$createComment(directiveName, templateAttrs[directiveName]));
                            compileNode = $compileNode[0];
                            replaceWith(jqCollection, sliceArgs($template), compileNode);

                            msos_debug(temp_cp + temp_ap + ' -> processing template (element): ' + directiveName);

                            // Garbage collection problem, V8 Chrome < 50 (https://github.com/angular/angular.js/issues/14041)
                            $template[0].$$parentNode = $template[0].parentNode;

                            childTranscludeFn = compilationGenerator(
                                mightHaveMultipleTransclusionError,
                                $template,
                                transcludeFn,
                                terminalPriority,
                                replaceDirective && replaceDirective.name,
                                { nonTlbTranscludeDirective: nonTlbTranscludeDirective }
                            );

                        } else {

                            msos_debug(temp_cp + temp_ap + ' -> processing template (contents): ' + directiveName);

                            slots = createMap();

                            if (!isObject(directiveValue)) {
                                $template = jqLite(jqLiteClone(compileNode)).contents();
                            } else {
                                // We have transclusion slots, collect them up, compile them and store their transclusion functions
                                $template = [];

                                slotMap = createMap();
                                filledSlots = createMap();

                                // Parse the element selectors
                                forEach(
                                    directiveValue,
                                    function (elementSelector, in_slot_name) {
                                        // If an element selector starts with a ? then it is optional
                                        var optional = (elementSelector.charAt(0) === '?');

                                        elementSelector = optional ? elementSelector.substring(1) : elementSelector;

                                        slotMap[elementSelector] = in_slot_name;

                                        // We explicitly assign `null` since this implies that a slot was defined but not filled.
                                        // Later when calling boundTransclusion functions with a slot name we only error if the
                                        // slot is `undefined`
                                        slots[in_slot_name] = null;

                                        // filledSlots contains `true` for all slots that are either optional or have been
                                        // filled. This is used to check that we have not missed any required slots
                                        filledSlots[in_slot_name] = optional;
                                    }
                                );

                                // Add the matching elements into their slot
                                forEach(
                                    $compileNode.contents(),
                                    function (node) {
                                        var cnc_slot_name = slotMap[directiveNormalize(nodeName_(node))];

                                        if (cnc_slot_name) {
                                            filledSlots[cnc_slot_name] = true;
                                            slots[cnc_slot_name] = slots[cnc_slot_name] || [];
                                            slots[cnc_slot_name].push(node);
                                        } else {
                                            $template.push(node);
                                        }
                                    }
                                );

                                // Check for required slots that were not filled
                                forEach(
                                    filledSlots,
                                    function (filled, fill_slot_name) {
                                        if (!filled) {
                                            throw $compileMinErr(
                                                'reqslot',
                                                'Required transclusion slot \'{0}\' was not filled.',
                                                fill_slot_name
                                            );
                                        }
                                    }
                                );

                                for (slotName in slots) {   // hasOwnProperty() na in slots
                                    if (slots[slotName]) {
                                        // Only define a transclusion function if the slot was filled
                                        slots[slotName] = compilationGenerator(mightHaveMultipleTransclusionError, slots[slotName], transcludeFn);
                                    }
                                }
                            }

                            $compileNode.empty();   // clear contents

                            childTranscludeFn = compilationGenerator(
                                mightHaveMultipleTransclusionError,
                                $template,
                                transcludeFn,
                                undefined,
                                undefined,
                                { needsNewScope: directive.$$isolateScope || directive.$$newScope }
                            );

                            childTranscludeFn.$$slots = slots;
                        }
                    }

                    if (directive.template) {
                        hasTemplate = true;

                        msos_debug(temp_cp + temp_ap + ' -> processing template (script): ' + directiveName);

                        if (!assertNoDuplicate('template (script)', templateDirective, directive, $compileNode)) {
                            templateDirective = directive;
                        }

                        directiveValue = (_.isFunction(directive.template))
                            ? directive.template($compileNode, templateAttrs)
                            : directive.template;

                        directiveValue = denormalizeTemplate(directiveValue);

                        if (directive.replace) {
                            replaceDirective = directive;
                            if (jqLiteIsTextNode(directiveValue)) {
                                $template = [];
                            } else {
                                $template = removeComments(
                                    wrapTemplate(directive.templateNamespace, trim(directiveValue))
                                );
                            }

                            compileNode = $template[0];

                            if ($template.length !== 1 || compileNode.nodeType !== NODE_TYPE_ELEMENT) {
                                throw $compileMinErr(
                                    'tplrt',
                                    'Template for directive \'{0}\' must have exactly one root element. {1}',
                                    directiveName,
                                    ''
                                );
                            }

                            replaceWith(jqCollection, $compileNode, compileNode);

                            newTemplateAttrs = {
                                $attr: {}
                            };

                            templateDirectives = collectDirectives(compileNode, [], newTemplateAttrs);

                            msos_debug(temp_cp + temp_ap + ' -> template directives:', templateDirectives);

                            unprocessedDirectives = directives.splice(i + 1, directives.length - (i + 1));

                            if (newIsolateScopeDirective || newScopeDirective) {
                                markDirectiveScope(
                                    templateDirectives,
                                    newIsolateScopeDirective,
                                    newScopeDirective
                                );
                            }

                            directives = directives.concat(templateDirectives).concat(unprocessedDirectives);

                            mergeTemplateAttributes(templateAttrs, newTemplateAttrs);

                            ii = directives.length;
                        } else {
                            $compileNode.html(directiveValue);
                        }
                    }

                    if (directive.templateUrl) {

                        hasTemplate = true;

                        msos_debug(temp_cp + temp_ap + ' -> processing template (url): ' + directiveName);

                        assertNoDuplicate('template (url)', templateDirective, directive, $compileNode);

                        templateDirective = directive;

                        if (directive.replace) {
                            replaceDirective = directive;
                        }

                        nodeLinkFn = compileTemplateUrl(
                            directives.splice(i, directives.length - i),
                            $compileNode,
                            templateAttrs,
                            jqCollection,
                            hasTranscludeDirective && childTranscludeFn,
                            preLinkFns,
                            postLinkFns,
                            {
                                controllerDirectives:       controllerDirectives,
                                newScopeDirective:          (newScopeDirective !== directive) && newScopeDirective,
                                newIsolateScopeDirective:   newIsolateScopeDirective,
                                templateDirective:          templateDirective,
                                nonTlbTranscludeDirective:  nonTlbTranscludeDirective
                            }
                        );

                        ii = directives.length;

                    } else if (directive.compile) {

                        try {
                            linkFn = directive.compile($compileNode, templateAttrs, childTranscludeFn);
                            directive_context = directive.$$originalDirective || directive;
                            if (_.isFunction(linkFn)) {
                                addLinkFns(null, ng_bind(directive_context, linkFn), attrStart, attrEnd);
                            } else if (linkFn) {
                                addLinkFns(ng_bind(directive_context, linkFn.pre), ng_bind(directive_context, linkFn.post), attrStart, attrEnd);
                            }
                        } catch (e) {
                            msos.console.error(temp_cp + temp_ap + ' -> failed, tag: ' + startingTag($compileNode) + ', directive: ' + directiveName, e);
                        }
                    }

                    if (directive.terminal) {
                        nodeLinkFn.terminal = true;
                        terminalPriority = Math.max(terminalPriority, directive.priority);
                    }
                }
                // End: for loop for applyDirectivesToNode

                nodeLinkFn.scope = newScopeDirective && newScopeDirective.scope === true;
                nodeLinkFn.transcludeOnThisElement = hasTranscludeDirective;
                nodeLinkFn.templateOnThisElement = hasTemplate;
                nodeLinkFn.transclude = childTranscludeFn;

                previousCompileContext_apply.hasElementTranscludeDirective = hasElementTranscludeDirective;

                if (msos_verbose) {
                    msos_debug(temp_cp + temp_ap + ' ->  done, node: ' + comp_node_name);
                }

                // might be normal or delayed nodeLinkFn depending on if templateUrl is present
                return nodeLinkFn;
            };

            compile = function ($compileNodes, transcludeFn, maxPriority, ignoreDirective, previousCompileContext_compile) {
                var temp_c = ' - $get - compile -> ',
                    compositeLinkFn_cpl,
                    namespace = null,
                    debug_out = [],
                    ng_assigned,
                    ng_difference;

                msos.console.info(temp_cp + temp_c + 'start.');

                if (msos_verbose && previousCompileContext_compile) {
                    msos_debug(temp_cp + temp_c + 'prev. context keys:', _.keys(previousCompileContext_compile));
                }

                if (!($compileNodes instanceof jqLite)) {
                    $compileNodes = jqLite($compileNodes);
                }

                msos.console.info(temp_cp + temp_c + 'do node(s): ' + debug_out.join(', '));

                // This is the only one which passes previous context
                compositeLinkFn_cpl = compileNodes(
                    $compileNodes,
                    transcludeFn,
                    $compileNodes,
                    maxPriority,
                    ignoreDirective,
                    previousCompileContext_compile
                );

                compile.$$addScopeClass($compileNodes);

                if (vc) {
                    msos.console.info(temp_cp + temp_c + 'custom Html:', customHtml);
                    msos.console.info(temp_cp + temp_c + 'custom Attr:', customAttr);
                    msos.console.info(temp_cp + temp_c + 'hasDirectives:', hasDirectives);
                    msos.console.info(temp_cp + temp_c + 'hasBindings:', hasBindings);
                }

                // This is expensive, so only do it at debugging (no account for specific scope)
                if (msos.config.debug) {
                    ng_assigned = _.keys(customHtml).concat(_.keys(customAttr));
                    ng_difference = _.difference(ng_assigned, _.keys(hasDirectives).concat(_.keys(hasBindings)));

                    if (ng_difference.length) {
                        msos.console.warn(temp_cp + temp_c + 'missing or unregistered directive references:', ng_difference);
                    }
                }

                msos.console.info(temp_cp + temp_c + 'done!');

                return function publicLinkFn(scope, cloneConnectFn, options) {

                    if (!$compileNodes) {
                        throw $compileMinErr(
                            'multilink',
                            'This element has already been linked.'
                        );
                    }

                    assertArg(scope, 'scope');

                    if (previousCompileContext_compile
                     && previousCompileContext_compile.needsNewScope) {
                        scope = scope.$parent.$new();
                        scope.$$name += '_publink' + scope.$id;
                    }

                    options = options || {};

                    var parentBoundTranscludeFn = options.parentBoundTranscludeFn,
                        transcludeControllers = options.transcludeControllers,
                        futureParentElement = options.futureParentElement,
                        $linkNode,
                        controllerName;

                    // When `parentBoundTranscludeFn` is passed, it is a
                    // `controllersBoundTransclude` function (it was previously passed
                    // as `transclude` to directive.link) so we must unwrap it to get
                    // its `boundTranscludeFn`
                    if (parentBoundTranscludeFn
                     && parentBoundTranscludeFn.$$boundTransclude) {
                        parentBoundTranscludeFn = parentBoundTranscludeFn.$$boundTransclude;
                    }

                    if (!namespace) {
                        namespace = detectNamespaceForChildElements(futureParentElement);
                    }

                    if (namespace !== 'html') {
                        $linkNode = jqLite(
                            wrapTemplate(namespace, jqLite('<div>').append($compileNodes).html())
                        );

                    } else if (cloneConnectFn && cloneConnectFn !== noop) {     // Experimental
                        // important!!: we must call our jqLite.clone() since the jQuery one is trying to be smart
                        // and sometimes changes the structure of the DOM.
                        $linkNode = JQLitePrototype.clone.call($compileNodes);
                    } else {
                        $linkNode = $compileNodes;
                    }

                    if (transcludeControllers) {
                        for (controllerName in transcludeControllers) {     // hasOwnProperty() na in transcludeControllers
                            $linkNode.data('$' + controllerName + 'Controller', transcludeControllers[controllerName].instance);
                        }
                    }

                    compile.$$addScopeInfo($linkNode, scope);

                    if (cloneConnectFn && cloneConnectFn !== noop) {        // Experimental
                        cloneConnectFn($linkNode, scope);
                    }

                    if (compositeLinkFn_cpl) { compositeLinkFn_cpl(scope, $linkNode, $linkNode, parentBoundTranscludeFn); }

                    if (!cloneConnectFn || cloneConnectFn === noop) {        // Experimental
                        $compileNodes = compositeLinkFn_cpl = null;
                        if (msos_verbose && cloneConnectFn === noop) {
                            msos.console.warn(temp_cp + temp_c + 'publicLinkFn (experimental), set $compileNodes = compositeLinkFn_cpl = null for noop!');
                        }
                    }

                    return $linkNode;
                };
            };

            compile.$$addBindingClass = debugInfoEnabled_CP
                ? function $$addBindingClass($element) { $element.addClass('ng-binding'); }
                : noop;

            compile.$$addScopeInfo = debugInfoEnabled_CP
                ? function $$addScopeInfo($element, scope, isolated, noTemplate) {
                    var dataName = isolated ? (noTemplate ? '$isolateScopeNoTemplate' : '$isolateScope') : '$scope';

                    $element.each(
                        function () {
                            var $elem = jqLite(this);

                            $elem.attr('data-debug', nodeName_($elem) + nextElemUid() + '_' + scope.$$name + '_' + dataName);
                        }
                    );
                }
                : noop;

            compile.$$addScopeClass = debugInfoEnabled_CP
                ? function $$addScopeClass($element, isolated) {
                    $element.addClass(isolated ? 'ng-isolate-scope' : 'ng-scope');
                }
                : noop;

            compile.$$createComment = function (directive_name, comment) {
                var content = '';

                if (debugInfoEnabled_CP) {
                    content = ' ' + (directive_name || '') + ': ';
                    if (comment) { content += comment + ' '; }
                }

                return window.document.createComment(content);
            };

            msos_debug(temp_cp + ' - $get -> done!');

            return compile;
        }];
    }

    $controllerMinErr = minErr('$controller');

    $CompileProvider.$inject = ['$provide', '$$sanitizeUriProvider'];

    function $ControllerProvider() {
        var temp_cp = 'ng - $ControllerProvider',
            controllers = {},
            vcp = (msos_verbose === 'injector');

        function registerControllers(regis_input, regis_cnstr) {
            var temp_cr = temp_cp + ' - registerControllers -> ',
                regis_fn = _.isArray(regis_cnstr) ? regis_cnstr[regis_cnstr.length - 1] : regis_cnstr;

            msos_debug(temp_cr + 'start.');

            assertNotHasOwnProperty(regis_input, 'controller');

            if (_.isString(regis_input)) {

                // Add a debugging name, if annonymous fucntion
                if (!regis_fn.name) { regis_fn.ng_name = regis_input; }

                if (controllers.hasOwnProperty(regis_input)) {
                    msos.console.warn(temp_cr + 'already registered: ' + regis_input);
                } else {
                    controllers[regis_input] = regis_cnstr;
                }

                msos_debug(temp_cr + ' done, for key: ' + regis_input);
            } else {
                msos.console.error(temp_cr + 'error, for key:', regis_input);
            }
        }

        this.has = function (name) {
            return controllers.hasOwnProperty(name);
        };

        this.register = registerControllers;

        this.$get = ['$injector', function controller_provider($injector) {

            if (vcp) {
                msos_debug(temp_cp + ' - $get -> start, $injector:', $injector);
            }

            function addIdentifier(locals, identifier, instance, name) {
                var temp_ai = ' - $get - addIdentifier -> ',
                    dbg = ', for controller: ' + name + ', identifier: ' + identifier;

                msos_debug(temp_cp + temp_ai + 'start' + dbg);

                if (msos_verbose) {
                    try {
                        locals.$scope[identifier] = instance;
                    } catch(e) {
                        msos.console.error(temp_cp + temp_ai + 'failed' + dbg, e);
                    }
                } else {
                    locals.$scope[identifier] = instance;
                }

                msos_debug(temp_cp + temp_ai + ' done!');
            }

            if (vcp) {
                msos_debug(temp_cp + ' - $get ->  done!');
            }

            return function controller_inst(expression, locals, later, directive) {
                var temp_ci = ' - $get - controller_inst',
                    debug_ci = '',
                    express_fn,
                    instance_prototype,
                    instance,
                    match,
                    cnstr = '',
                    ctrlAs;

                msos_debug(temp_cp + temp_ci + ' -> start.');

                if (typeof later !== 'boolean') {
                    msos.console.warn(temp_cp + temp_ci + ' -> specify \'later\' argument as a boolean.');
                    if (msos_verbose) {
                        msos.console.trace(temp_cp + temp_ci + ' -> trace output.');
                    }
                }

                later = (later === true);

                if (directive) {
                    if (directive.controllerAs && _.isString(directive.controllerAs)) {
                        ctrlAs = directive.controllerAs;
                    } else if (_.isString(directive)) {
                        ctrlAs = directive;
                        msos.console.warn(temp_cp + temp_ci + ' -> specify \'directive\' argument as an object.');
                    }
                }

                if (_.isString(expression)) {

                    match = identifierForController(expression);

                    if (match) {

                        cnstr = match[1];
                        ctrlAs = ctrlAs || match[3];

                        expression = controllers[cnstr] || getter(locals.$scope, cnstr, true) || undefined;

                        if (!expression) {
                            msos.console.error(temp_cp + temp_ci + ' -> failed for "' + cnstr + '" in controllers: ', controllers);
                        }

                    } else {
                        msos.console.error(temp_cp + temp_ci + ' -> unable to evaluate expression:', expression);
                        expression = noop;
                    }

                    debug_ci += ', type: string';
                    express_fn = _.isArray(expression) ? expression[expression.length - 1] : expression;
                } else if (_.isArray(expression) && _.isFunction(expression[expression.length - 1])) {
                    debug_ci += ', type: array';
                    express_fn = expression[expression.length - 1];
                    cnstr = express_fn.name || express_fn.ng_name || 'annonymous';
                } else if (_.isFunction(expression)) {
                    debug_ci += ', type: function';
                    express_fn = expression;
                    cnstr = express_fn.name || express_fn.ng_name || 'annonymous';
                } else {
                    msos.console.error(temp_cp + temp_ci + ' -> failed for expression input:', expression);
                }

                debug_ci += (cnstr  ? ', constructor: ' + cnstr     : '') +
                            (ctrlAs ? ', ctrlAs: ' + ctrlAs    : '') + ', later: ' +
                            (later ? 'true' : 'false');

                msos_debug(temp_cp + temp_ci + ' -> debugging' + debug_ci);

                if (msos_verbose && cnstr === 'annonymous') {
                    msos.console.warn(temp_cp + temp_ci + ' -> annonymous controllers are hard to debug.', express_fn);
                }

                assertArgFn(express_fn, cnstr, 'failed in controller_inst' + debug_ci + '.');

                if (express_fn === noop) {
                    msos.console.warn(temp_cp + temp_ci + ' -> express_fn === noop' + debug_ci, directive || {});
                }

                if (later) {

                    msos_debug(temp_cp + temp_ci + ' -> flagged \'later\'.');

                    instance_prototype = Object.create(express_fn.prototype || null);

                    instance = extend(
                        function controller_init() {

                            var temp_ii = temp_cp + temp_ci + ' - controller_init -> ',
                                instance_later;

                            msos_debug(temp_ii + 'start' + debug_ci);

                            instance_later = $injector.instantiate(expression, locals, cnstr);

                            if (ctrlAs) {
                                addIdentifier(
                                    locals,
                                    ctrlAs,
                                    instance_later,
                                    cnstr
                                );
                            }

                            msos_debug(temp_ii + ' done' + debug_ci);

                            return instance_later;
                        },
                        {
                            instance: instance_prototype,
                            identifier: ctrlAs
                        }
                    );

                } else {

                    instance = $injector.instantiate(expression, locals, cnstr);

                    if (ctrlAs) {
                        addIdentifier(
                            locals,
                            ctrlAs,
                            instance,
                            cnstr
                        );
                    }
                }

                msos_debug(temp_cp + temp_ci + ' ->  done!');
                return instance;
            };
        }];
    }

    function $DocumentProvider() {
        this.$get = ['$window', function ($window) {
            return jqLite($window.document);
        }];
    }

    function $$IsDocumentHiddenProvider() {
        this.$get = ['$document', '$rootScope', function ($document, $rootScope) {
            var doc = $document[0],
                hidden = doc && doc.hidden;

            function changeListener() {
                hidden = doc.hidden;
            }

            $document.on('visibilitychange', changeListener);

            $rootScope.$on(
                '$destroy',
                function () { $document.off('visibilitychange', changeListener); }
            );

            return function () { return hidden; };
        }];
    }

    function $ExceptionHandlerProvider() {
        this.$get = ['$log', function ($log) {
            return function () {
                $log.error.apply($log, arguments);
            };
        }];
    }

    function $$ForceReflowProvider() {
        this.$get = ['$document', function ($document) {
            return function (domNode) {
                if (domNode) {
                    if (!domNode.nodeType && domNode instanceof jQuery) {
                        domNode = domNode[0];
                    }
                } else {
                    domNode = $document[0].body;
                }

                return domNode.offsetWidth + 1;
            };
        }];
    }

    function serializeValue(v) {
        if (isObject(v)) {
            return _.isDate(v) ? v.toISOString() : toJson(v);
        }

        return v;
    }

    function $HttpParamSerializerProvider() {

        this.$get = function () {
            return function ngParamSerializer(params) {
                if (!params) { return ''; }

                var parts = [];

                forEachSorted(params, function (value, key) {
                    if (value === null || _.isUndefined(value)) { return; }

                    if (_.isArray(value)) {
                        forEach(value, function (v) {
                            parts.push(encodeUriQuery(key)  + '=' + encodeUriQuery(serializeValue(v)));
                        });
                    } else {
                        parts.push(encodeUriQuery(key) + '=' + encodeUriQuery(serializeValue(value)));
                    }
                });

                return parts.join('&');
            };
        };
    }

    function $HttpParamSerializerJQLikeProvider() {

        this.$get = function () {

            return function jQueryLikeParamSerializer(params) {
                var parts = [];

                if (!params) { return ''; }

                function serialize(toSerialize, prefix, topLevel) {
                    if (toSerialize === null || _.isUndefined(toSerialize)) { return; }
    
                    if (_.isArray(toSerialize)) {
                        forEach(toSerialize, function (value, index) {
                            serialize(value, prefix + '[' + (isObject(value) ? index : '') + ']');
                        });
                    } else if (isObject(toSerialize) && !_.isDate(toSerialize)) {
                        forEachSorted(toSerialize, function (value, key) {
                            serialize(value, prefix + (topLevel ? '' : '[') + key + (topLevel ? '' : ']'));
                        });
                    } else {
                        parts.push(encodeUriQuery(prefix) + '=' + encodeUriQuery(serializeValue(toSerialize)));
                    }
                }

                serialize(params, '', true);

                return parts.join('&');
            };
        };
    }

    function isJsonLike(str) {
        var jsonStart = str.match(JSON_START);
        return jsonStart && JSON_ENDS[jsonStart[0]].test(str);
    }

    function defaultHttpResponseTransform(data, headers) {
        var contentType,
            tempData;

        if (_.isString(data)) {
            // Strip json vulnerability protection prefix and trim whitespace
            tempData = data.replace(JSON_PROTECTION_PREFIX, '').trim();

            if (tempData) {
                contentType = headers('Content-Type');
                if ((contentType && (contentType.indexOf(APPLICATION_JSON) === 0)) || isJsonLike(tempData)) {
                    data = fromJson(tempData);
                }
            }
        }

        return data;
    }

    function parseHeaders(headers) {
        var parsed = createMap();

        function fillInParsed(key, val) {
            if (key) {
                parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
            }
        }

        if (_.isString(headers)) {

            forEach(headers.split('\n'), function (line) {
                var i = line.indexOf(':');

                fillInParsed(lowercase(trim(line.substr(0, i))), trim(line.substr(i + 1)));
            });

        } else if (isObject(headers)) {
            forEach(headers, function (headerVal, headerKey) {
                fillInParsed(lowercase(headerKey), trim(headerVal));
            });
        }

        return parsed;
    }

    function headersGetter(headers) {
        var headersObj;

        return function (name) {
            var value;

            if (!headersObj) { headersObj =  parseHeaders(headers); }

            if (name) {
                value = headersObj[lowercase(name)];

                if (value === undefined) {
                    value = null;
                }
                return value;
            }

            return headersObj;
        };
    }

    function transformData(data, headers, status, fns) {
        if (_.isFunction(fns)) { return fns(data, headers, status); }

        forEach(
            fns,
            function (fn) {
                data = fn(data, headers, status);
            }
        );

        return data;
    }

    function isSuccess(status) {
        return 200 <= status && status < 300;
    }

    $httpMinErr = minErr('$http');

    function $HttpProvider() {

        var temp_hp = 'ng - $HttpProvider',
            useApplyAsync = false,
            defaults,
            interceptorFactories;

        this.interceptors = [];

        this.defaults = {
            // transform incoming response data
            transformResponse: [defaultHttpResponseTransform],

            // transform outgoing request data
            transformRequest: [function (d) {
                return _.isObject(d) && !isFile(d) && !isBlob(d) && !isFormData(d) ? toJson(d) : d;
            }],

            // default headers
            headers: {
                common: {
                    'Accept': 'application/json, text/plain, */*'
                },
                post:   shallowCopy(CONTENT_TYPE_APPLICATION_JSON),
                put:    shallowCopy(CONTENT_TYPE_APPLICATION_JSON),
                patch:  shallowCopy(CONTENT_TYPE_APPLICATION_JSON)
            },

            xsrfCookieName: 'XSRF-TOKEN',
            xsrfHeaderName: 'X-XSRF-TOKEN',

            paramSerializer: '$httpParamSerializer',
            jsonpCallbackParam: 'callback'
        };

        this.useApplyAsync = function (value) {
            if (isDefined(value)) {
                useApplyAsync = !!value;
                return this;
            }

            return useApplyAsync;
        };

        defaults = this.defaults;
        interceptorFactories = this.interceptors;

        this.$get = [
            '$browser', '$httpBackend', '$$cookieReader', '$cacheFactory', '$rootScope', '$q', '$injector', '$sce',
            function ($browser, $httpBackend, $$cookieReader, $cacheFactory, $rootScope, $q, $injector, $sce) {

                var defaultCache = $cacheFactory('$http'),
                    reversedInterceptors = [];

                msos_debug(temp_hp + ' - $get -> start.');

                defaults.paramSerializer = _.isString(defaults.paramSerializer) ? $injector.get(defaults.paramSerializer) : defaults.paramSerializer;

                function buildUrl(url, serializedParams) {
                    if (serializedParams.length > 0) {
                        url += ((url.indexOf('?') === -1) ? '?' : '&') + serializedParams;
                    }

                    return url;
                }

                function $http(requestConfig) {
                    var temp_tt = ' - $get - $http',
                        config,
                        requestInterceptors = [],
                        responseInterceptors = [],
                        promise_$http;

                    if (!_.isObject(requestConfig)) {
                        throw minErr('$http')(
                            'badreq',
                            'Http request configuration must be an object. Received: {0}',
                            requestConfig
                        );
                    }
                    if (!_.isString(requestConfig.url)) {
                        throw minErr('$http')(
                            'badreq',
                            'Http request configuration url must be a string or a $sce trusted object.  Received: {0}',
                            requestConfig.url
                        );
                    }

                    msos_debug(temp_hp + temp_tt + ' -> start,\n     url: ' + requestConfig.url);

                    function executeHeaderFns(headers, config) {
                        var headerContent,
                            processedHeaders = {};

                        forEach(
                            headers,
                            function (headerFn, header) {
                                if (_.isFunction(headerFn)) {
                                    headerContent = headerFn(config);
                                    if (headerContent !== null) {
                                        processedHeaders[header] = headerContent;
                                    }
                                } else {
                                    processedHeaders[header] = headerFn;
                                }
                            }
                        );

                        return processedHeaders;
                    }

                    function mergeHeaders(config) {
                        var defHeaders = defaults.headers,
                            reqHeaders = extend({}, config.headers),
                            defHeaderName,
                            lowercaseDefHeaderName,
                            reqHeaderName;

                        defHeaders = extend({}, defHeaders.common, defHeaders[lowercase(config.method)]);

                        // Using for-in instead of forEach to avoid unecessary iteration after header has been found
                        defaultHeadersIteration: for (defHeaderName in defHeaders) {

                            if (defHeaders.hasOwnProperty(defHeaderName)) {

                                lowercaseDefHeaderName = lowercase(defHeaderName);

                                for (reqHeaderName in reqHeaders) {
                                    if (reqHeaders.hasOwnProperty(reqHeaderName)) {
                                        if (lowercase(reqHeaderName) === lowercaseDefHeaderName) {
                                            continue defaultHeadersIteration;
                                        }
                                    } 
                                }

                                reqHeaders[defHeaderName] = defHeaders[defHeaderName];
                            }
                        }

                        // Execute if header value is a function for merged headers
                        return executeHeaderFns(reqHeaders, shallowCopy(config));
                    }

                    config = extend(
                        {
                            method: 'get',
                            transformRequest: defaults.transformRequest,
                            transformResponse: defaults.transformResponse,
                            paramSerializer: defaults.paramSerializer,
                            jsonpCallbackParam: defaults.jsonpCallbackParam
                        },
                        requestConfig
                    );

                    config.headers = mergeHeaders(requestConfig);
                    config.method = uppercase(config.method);
                    config.paramSerializer = _.isString(config.paramSerializer)
                        ? $injector.get(config.paramSerializer)
                        : config.paramSerializer;

                    $browser.$$incOutstandingRequestCount();

                    function transformResponse(response) {
                        // Make a copy since the response must be cacheable
                        var resp = extend({}, response);

                        msos_debug(temp_hp + temp_tt + ' - transformResponse -> called.');

                        resp.data = transformData(response.data, response.headers, response.status, config.transformResponse);

                        return (isSuccess(response.status)) ? resp : $q.reject($q.defer('ng_reject_transformResponse'), resp);
                    }

                    function serverRequest(config) {
                        var headers = config.headers,
                            reqData = transformData(config.data, headersGetter(headers), undefined, config.transformRequest);

                        // strip content-type if data is undefined
                        if (_.isUndefined(reqData)) {
                            forEach(
                                headers,
                                function (value_na, header) {
                                    if (lowercase(header) === 'content-type') {
                                        delete headers[header];
                                    }
                                }
                            );
                        }

                        if (_.isUndefined(config.withCredentials) && !_.isUndefined(defaults.withCredentials)) {
                            config.withCredentials = defaults.withCredentials;
                        }

                        function sendReq(config, reqData) {

                            var deferred = $q.defer('ng_sendReq'),
                                promise_srq = deferred.promise,
                                cache,
                                cachedResp,
                                reqHeaders = config.headers,
                                isJsonp = lowercase(config.method) === 'jsonp',
                                url = config.url,
                                xsrfValue,
                                temp_sr = temp_tt + ' - serverRequest - sendReq';

                            msos_debug(temp_hp + temp_sr + ' -> start,\n     url: ' + url);

                            function sanitizeJsonpCallbackParam(url, key) {
                                if (/[&?][^=]+=JSON_CALLBACK/.test(url)) {
                                    // Throw if the url already contains a reference to JSON_CALLBACK
                                    throw $httpMinErr(
                                        'badjsonp',
                                        'Illegal use of JSON_CALLBACK in url, "{0}"',
                                        url
                                    );
                                }

                                var callbackParamRegex = new RegExp('[&?]' + key + '=');

                                if (callbackParamRegex.test(url)) {
                                    // Throw if the callback param was already provided
                                    throw $httpMinErr(
                                        'badjsonp',
                                        'Illegal use of callback param, \'{0}\', in url, \'{1}\'',
                                        key,
                                        url
                                    );
                                }

                                // Add in the JSON_CALLBACK callback param value
                                url += ((url.indexOf('?') === -1) ? '?' : '&') + key + '=JSON_CALLBACK';

                                return url;
                            }

                            if (isJsonp) {
                              // JSONP is a pretty sensitive operation where we're allowing a script to have full access to
                              // our DOM and JS space.  So we require that the URL satisfies SCE.RESOURCE_URL.
                              url = $sce.getTrustedResourceUrl(url);
                            } else if (!_.isString(url)) {
                              // If it is not a string then the URL must be a $sce trusted object
                              url = $sce.valueOf(url);
                            }

                            url = buildUrl(url, config.paramSerializer(config.params));

                            if (isJsonp) {
                              // Check the url and add the JSONP callback placeholder
                              url = sanitizeJsonpCallbackParam(url, config.jsonpCallbackParam);
                            }

                            function resolvePromise(response, status, headers, statusText) {

                                msos_debug(temp_hp + temp_sr + ' - resolvePromise -> called.');

                                //status: HTTP response status code, 0, -1 (aborted by timeout / promise)
                                status = status >= -1 ? status : 0;

                                (isSuccess(status) ? deferred.resolve : deferred.reject)({
                                    data: response,
                                    status: status,
                                    headers: headersGetter(headers),
                                    config: config,
                                    statusText: statusText
                                });
                            }

                            function resolvePromiseWithResult(result) {
                                msos_debug(temp_hp + temp_sr + ' - resolvePromiseWithResult -> called.');

                                resolvePromise(
                                    result.data,
                                    result.status,
                                    shallowCopy(result.headers()),
                                    result.statusText
                                );
                            }

                            function done(status, response, headersString, statusText) {
                                var db_done = '';

                                msos.console.info(temp_hp + temp_sr + ' - done -> start,\n     url: ' + url + ',\n     phase: ' + $rootScope.$$phase);

                                if (cache) {
                                    if (isSuccess(status)) {
                                        cache.put(url, [status, response, parseHeaders(headersString), statusText]);
                                        db_done = ', added to cache';
                                    } else {
                                        // remove promise from the cache
                                        cache.remove(url);
                                        db_done = ', removed from cache';
                                    }
                                }

                                function resolveHttpPromise() {
                                    resolvePromise(response, status, headersString, statusText);
                                }

                                if (useApplyAsync) {
                                    db_done = 'useApplyAsync' + db_done;
                                    $rootScope.$applyAsync(resolveHttpPromise);
                                } else {
                                    db_done = 'resolveHttpPromise' + db_done;
                                    resolveHttpPromise();

                                    if (!$rootScope.$$phase && $rootScope.$apply !== noop) { $rootScope.$apply(); }
                                }
                                // Its done...done!
                                msos.console.info(temp_hp + temp_sr + ' - done ->  done,\n     url: ' + url + ',\n     by: ' + db_done);
                            }

                            function removePendingReq() {

                                msos_debug(temp_hp + temp_sr + ' - removePendingReq -> called.');

                                var idx = $http.pendingRequests.indexOf(config);

                                if (idx !== -1) { $http.pendingRequests.splice(idx, 1); }
                            }

                            function createApplyHandlers(eventHandlers) {
                                var applyHandlers;

                                if (eventHandlers) {
                                    applyHandlers = {};

                                    forEach(
                                        eventHandlers,
                                        function (eventHandler, key) {
                                            applyHandlers[key] = function (event) {

                                                function callEventHandler() {
                                                    if (msos_verbose === 'events') {
                                                        msos_debug(temp_hp + temp_sr + ' - callEventHandler -> called, for: ' + event.type);
                                                    }
                                                    eventHandler(event);
                                                }

                                                if (useApplyAsync) {
                                                    $rootScope.$applyAsync(callEventHandler);
                                                } else if ($rootScope.$$phase) {
                                                    callEventHandler();
                                                } else {
                                                    $rootScope.$apply(callEventHandler);
                                                }
                                            };
                                        }
                                    );
                                }

                                return applyHandlers;
                            }

                            $http.pendingRequests.push(config);

                            msos_debug(temp_hp + temp_sr + ' -> set: promise_srq.then');

                            promise_srq.then(removePendingReq, removePendingReq);

                            if ((config.cache || defaults.cache) && config.cache !== false && (config.method === 'GET' || config.method === 'JSONP')) {
                                cache = _.isObject(config.cache) ? config.cache : _.isObject((defaults).cache) ? (defaults).cache : defaultCache;
                            }

                            if (cache) {
                                cachedResp = cache.get(url);

                                if (isDefined(cachedResp)) {
                                    if (isPromiseLike(cachedResp)) {
                                        // cached request has already been sent, but there is no response yet
                                        cachedResp.then(resolvePromiseWithResult, resolvePromiseWithResult);
                                    } else {
                                        // serving from cache
                                        if (_.isArray(cachedResp)) {
                                            resolvePromise(cachedResp[1], cachedResp[0], shallowCopy(cachedResp[2]), cachedResp[3]);
                                        } else {
                                            resolvePromise(cachedResp, 200, {}, 'OK');
                                        }
                                    }
                                } else {
                                    // put the promise for the non-transformed response into cache as a placeholder
                                    cache.put(url, promise_srq);
                                }
                            }

                            // if we won't have the response in cache, set the xsrf headers and
                            // send the request to the backend
                            if (_.isUndefined(cachedResp)) {
                                xsrfValue = urlIsSameOrigin(config.url) ? $$cookieReader()[config.xsrfCookieName || defaults.xsrfCookieName] : undefined;

                                if (xsrfValue) {
                                    reqHeaders[(config.xsrfHeaderName || defaults.xsrfHeaderName)] = xsrfValue;
                                }

                                $httpBackend(
                                    config.method,
                                    url,
                                    reqData,
                                    done,
                                    reqHeaders,
                                    config.timeout,
                                    config.withCredentials,
                                    config.responseType,
                                    createApplyHandlers(config.eventHandlers),
                                    createApplyHandlers(config.uploadEventHandlers)
                                );
                            }

                            msos_debug(temp_hp + temp_sr + ' -> done!');

                            return promise_srq;
                        }

                        // send request
                        return sendReq(config, reqData).then(transformResponse, transformResponse);
                    }

                    function chainInterceptors(promis_ch, interceptors) {
                        var i = 0,
                            thenFn,
                            rejectFn;

                        for (i = 0; i < interceptors.length; i += 1) {

                            thenFn = interceptors[i];

                            i += 1;
                            rejectFn = interceptors[i];

                            promis_ch = promis_ch.then(thenFn, rejectFn);
                        }

                        interceptors.length = 0;

                        return promis_ch;
                    }

                    function completeOutstandingRequest() {
                        // Not sure why noop (see also: route.js) ?
                        $browser.$$completeOutstandingRequest(noop);
                    }

                    promise_$http = $q.resolve($q.defer('ng_resolve_$http'), config);

                    // Apply interceptors
                    forEach(
                        reversedInterceptors,
                        function (interceptor) {
                            if (interceptor.request || interceptor.requestError) {
                                requestInterceptors.unshift(interceptor.request, interceptor.requestError);
                            }
                            if (interceptor.response || interceptor.responseError) {
                                responseInterceptors.push(interceptor.response, interceptor.responseError);
                            }
                        }
                    );
              
                    promise_$http = chainInterceptors(promise_$http, requestInterceptors);
                    promise_$http = promise_$http.then(serverRequest);
                    promise_$http = chainInterceptors(promise_$http, responseInterceptors);
                    promise_$http = promise_$http['finally'](completeOutstandingRequest);

                    promise_$http.success = function () {
                        throw new Error('promise_$http.success is gone!');
                    };

                    promise_$http.error = function () {
                        throw new Error('promise_$http.error is gone!');
                    };

                    msos_debug(temp_hp + ' - $get - $http ->  done: ' + promise_$http.$$prom_state.name);
                    return promise_$http;
                }

                function createShortMethods() {
                    forEach(arguments, function (name) {
                        $http[name] = function (url, config) {
                            msos.console.info(temp_hp + ' - $get - $http.' + name + ' -> start.');
                            var $http_out = $http(
                                extend(
                                    {},
                                    config || {},
                                    { method: name, url: url }
                                )
                            );

                            msos.console.info(temp_hp + ' - $get - $http.' + name + ' ->  done: ' + $http_out.$$prom_state.name);
                            return $http_out;
                        };
                    });
                }

                function createShortMethodsWithData() {
                    forEach(arguments, function (name) {
                        $http[name] = function (url, data, config) {
                            msos.console.info(temp_hp + ' - $get - $http.' + name + ' -> start.');
                            var $http_out = $http(
                                extend(
                                    {},
                                    config || {},
                                    { method: name, url: url, data: data }
                                )
                            );

                            msos.console.info(temp_hp + ' - $get - $http.' + name + ' ->  done: ' + $http_out.$$prom_state.name);
                            return $http_out;
                        };
                    });
                }

                forEach(
                    interceptorFactories,
                    function (interceptorFactory) {
                        reversedInterceptors.unshift(
                            _.isString(interceptorFactory)
                                ? $injector.get(interceptorFactory)
                                : $injector.invoke(
                                    interceptorFactory,
                                    undefined,
                                    undefined,
                                    'interceptorFactories'
                                )
                        );
                    }
                );

                $http.pendingRequests = [];

                createShortMethods('get', 'delete', 'head', 'jsonp');
                createShortMethodsWithData('post', 'put', 'patch');

                $http.defaults = defaults;

                msos_debug(temp_hp + ' - $get -> done!');
                return $http;
            }
        ];
    }

    function $xhrFactoryProvider() {
        this.$get = function () {
            return function createXhr() {
                return new window.XMLHttpRequest();
            };
        };
    }

    function createHttpBackend($browser, createXhr, callbacks, rawDocument) {
        var temp_ch = 'ng - createHttpBackend';

        msos_debug(temp_ch + ' -> start.');

        function jsonpReq(url, cbKey_jR, done) {

            url = url.replace('JSON_CALLBACK', cbKey_jR);

            var script = rawDocument.createElement('script'),
                callback = null;

            script.type = 'text/javascript';
            script.src = url;
            script.async = true;

            msos_debug(temp_ch + ' - jsonpReq -> start.');

            callback = function (event) {

                script.removeEventListener('load', callback);
                script.removeEventListener('error', callback);

                rawDocument.body.removeChild(script);
                script = null;

                var status = -1,
                    text = 'unknown';

                msos_debug(temp_ch + ' - jsonpReq - callback -> start.');

                if (event) {
                    if (event.type === 'load' && !callbacks.wasCalled(cbKey_jR)) {
                        event = {
                            type: 'error'
                        };
                    }
                    text = event.type;
                    status = event.type === 'error' ? 404 : 200;
                }

                if (done) {
                    done(status, text);
                }

                msos_debug(temp_ch + ' - jsonpReq - callback -> done!');
            };

            script.addEventListener('load', callback);
            script.addEventListener('error', callback);

            rawDocument.body.appendChild(script);

            msos_debug(temp_ch + ' - jsonpReq -> done!');
            return callback;
        }

        msos_debug(temp_ch + ' -> done.');

        return function (method, url, post, callback, headers, timeout, withCredentials, responseType, eventHandlers, uploadEventHandlers) {
            var callbackKey,
                jsonpDone,
                xhr,
                timeout_id_HTTPBK,
                requestError;

            msos_debug(temp_ch + ' returned function -> start.');

            url = url || $browser.url();

            function timeoutRequest() {
                if (jsonpDone)  { jsonpDone(); }
                if (xhr)        { xhr.abort(); }
            }

            function completeRequest(callback, status, response, headersString, statusText) {
                // cancel timeout and subsequent timeout promise resolution
                if (isDefined(timeout_id_HTTPBK)) {
                    $browser.cancel(timeout_id_HTTPBK);
                }

                jsonpDone = xhr = null;

                callback(
                    status,
                    response,
                    headersString,
                    statusText
                );
            }

            if (lowercase(method) === 'jsonp') {

                callbackKey = callbacks.createCallback();

                jsonpDone = jsonpReq(
                    url,
                    callbackKey,
                    function (status, text) {
                        // jsonpReq only ever sets status to 200 (OK), 404 (ERROR) or -1 (WAITING)
                        var response = (status === 200) && callbacks.getResponse(callbackKey);

                        completeRequest(callback, status, response, '', text);
                        callbacks.removeCallback(callbackKey);
                    }
                );

            } else {

                xhr = createXhr(method, url);

                xhr.open(method, url, true);

                forEach(headers, function (value, key) {
                    if (isDefined(value)) {
                        xhr.setRequestHeader(key, value);
                    }
                });

                xhr.onload = function requestLoaded() {
                    var statusText = xhr.statusText || '',
                        response = xhr.hasOwnProperty('response') ? xhr.response : xhr.responseText,
                        status = xhr.status === 1223 ? 204 : xhr.status;

                    if (status === 0) {
                        status = response ? 200 : urlResolve(url, 'xhr onload').protocol === 'file' ? 404 : 0;
                    }

                    completeRequest(
                        callback,
                        status,
                        response,
                        xhr.getAllResponseHeaders(),
                        statusText
                    );
                };

                requestError = function () {
                    completeRequest(
                        callback,
                        -1,
                        null,
                        null,
                        ''
                    );
                };

                xhr.onerror = requestError;
                xhr.onabort = requestError;
                xhr.ontimeout = requestError;

                forEach(
                    eventHandlers,
                    function (value, key) {
                        xhr.addEventListener(key, value);
                    }
                );

                forEach(
                    uploadEventHandlers,
                    function (value, key) {
                        xhr.upload.addEventListener(key, value);
                    }
                );

                if (withCredentials) {
                    xhr.withCredentials = true;
                }

                if (responseType) {
                    if (msos_verbose) {
                        try {
                            xhr.responseType = responseType;
                        } catch (e) {
                            if (responseType !== 'json') {
                                throw e;
                            }
                        }
                    } else {
                        xhr.responseType = responseType;
                    }
                }

                xhr.send(_.isUndefined(post) ? null : post);
            }

            if (timeout > 0) {
                timeout_id_HTTPBK = $browser.defer(timeoutRequest, 'createHttpBackend', timeout);
            } else if (isPromiseLike(timeout)) {
                timeout.then(timeoutRequest);
            }

            msos_debug(temp_ch + ' returned function -> done!');
        };
    }

    function $HttpBackendProvider() {
        this.$get = [
            '$browser', '$jsonpCallbacks', '$document', '$xhrFactory',
            function ($browser, $jsonpCallbacks, $document, $xhrFactory) {
                return createHttpBackend($browser, $xhrFactory, $jsonpCallbacks, $document[0]);
            }
        ];
    }

    function constantWatchDelegate(scope, listener, objectEquality, parsedExpression) {
        var unwatch = scope.$watch(
                function constantWatch(scope) {
                    unwatch();
                    return parsedExpression !== noop ? parsedExpression(scope) : undefined;
                },
                listener,
                objectEquality
            );

        return unwatch;
    }

    $interpolateMinErr = angular.$interpolateMinErr = minErr('$interpolate');

    $interpolateMinErr.throwNoconcat = function (text) {
        throw $interpolateMinErr(
            'noconcat',
            'Error while interpolating: {0}\nStrict Contextual Escaping disallows ' +
            'interpolations that concatenate multiple expressions when a trusted value is ' +
            'required.  See http://docs.angularjs.org/api/ng.$sce',
            text
        );
    };

    $interpolateMinErr.interr = function (text, err) {
        return $interpolateMinErr(
            'interr',
            'Can\'t interpolate: {0}\n{1}',
            text,
            err.toString()
        );
    };

    function $InterpolateProvider() {
        var temp_ip = 'ng - $InterpolateProvider - ',
            startSymbol = '{{',
            endSymbol = '}}';

        this.startSymbol = function (value) {
            if (value) {
                startSymbol = value;
                return this;
            }
            return startSymbol;
        };

        this.endSymbol = function (value) {
            if (value) {
                endSymbol = value;
                return this;
            }
            return endSymbol;
        };

        this.$get = ['$parse', '$sce', function ($parse, $sce) {

            function escape(ch) {
                return '\\\\\\' + ch;
            }

            var startSymbolLength = startSymbol.length,
                endSymbolLength = endSymbol.length,
                escapedStartRegexp = new RegExp(startSymbol.replace(/./g, escape), 'g'),
                escapedEndRegexp = new RegExp(endSymbol.replace(/./g, escape), 'g');

            function unescapeText(text) {
                return text.replace(escapedStartRegexp, startSymbol).replace(escapedEndRegexp, endSymbol);
            }

            function $interpolateFn(text, skip_return_interp_obj, trustedContext, allOrNothing) {

                var temp_it = '$get - $interpolateFn',
                    db_itrp = '',
                    constantInterp,
                    unescaped_text,
                    startIndex,
                    endIndex,
                    index = 0,
                    expressions = [],
                    parseFns = [],
                    textLength = text.length,
                    exp,
                    int_concat = [],
                    expressionPositions = [],
                    compute = function (values) {
                        var i = 0;
                        for (i = 0; i < expressions.length; i += 1) {
                            if (allOrNothing && _.isUndefined(values[i])) { return undefined; }
                            int_concat[expressionPositions[i]] = values[i];
                        }
                        return int_concat.join('');
                    },
                    getValue = function (value) {
                        return trustedContext ? $sce.getTrusted(trustedContext, value) : $sce.valueOf(value);
                    };

                if (msos_verbose) {
                    msos_debug(temp_ip + temp_it + ' -> start.');
                }

                // Provide a quick exit and simplified result function for text with no interpolation
                if (!textLength || text.indexOf(startSymbol) === -1) {

                    db_itrp += 'text length: ' + textLength + ', skip constantInterp obj: ' + skip_return_interp_obj;

                    if (!skip_return_interp_obj) {
                        unescaped_text = unescapeText(text);
                        constantInterp = valueFn(unescaped_text);
                        constantInterp.exp = text;
                        constantInterp.expressions = [];
                        constantInterp.$$watchDelegate = constantWatchDelegate;
                    }

                    if (msos_verbose) {
                        db_itrp += '\n     string: ' + escape_string(text);
                        msos_debug(temp_ip + temp_it + ' -> done (constantInterp), ' + db_itrp);
                    }

                    return constantInterp;
                }

                allOrNothing = !!allOrNothing;

                function parseStringifyInterceptor(value) {
                    if (msos_verbose) {
                        try {
                            value = getValue(value);
                        } catch (err) {
                            var newErr = $interpolateMinErr(
                                    'interr',
                                    "Can't interpolate: {0}\n",
                                    text
                                );
                            msos.console.error(temp_ip + temp_it + ' - parseStringifyInterceptor -> failed: ' + newErr, err);
                        }
                    } else {
                        value = getValue(value);
                    }

                    return allOrNothing && !isDefined(value) ? value : stringify(value);
                }

                while (index < textLength) {
                    startIndex = text.indexOf(startSymbol, index);
                    endIndex = text.indexOf(endSymbol, startIndex + startSymbolLength);
                    if (startIndex !== -1 && endIndex !== -1) {
                        if (index !== startIndex) {
                            int_concat.push(unescapeText(text.substring(index, startIndex)));
                        }
                        exp = text.substring(startIndex + startSymbolLength, endIndex);
                        expressions.push(exp);
                        parseFns.push($parse(exp, parseStringifyInterceptor));
                        index = endIndex + endSymbolLength;
                        expressionPositions.push(int_concat.length);
                        int_concat.push('');
                    } else {
                        // we did not find an interpolation, so we have to add the remainder to the separators array
                        if (index !== textLength) {
                            int_concat.push(unescapeText(text.substring(index)));
                        }
                        break;
                    }
                }

                if (trustedContext && int_concat.length > 1) {
                    $interpolateMinErr.throwNoconcat(text);
                }

                if (!skip_return_interp_obj || expressions.length) {

                    if (msos_verbose) {
                        db_itrp += '\n     string: ' + escape_string(text);
                        msos_debug(temp_ip + temp_it + ' -> done,' + db_itrp);
                    }

                    return extend(
                        function interpolationFn_Force(context) {
                            var i = 0,
                                values = [],
                                newErr = '';

                            try {
                                for (i = 0; i < expressions.length; i += 1) {
                                    values[i] = parseFns[i](context);
                                }

                                return compute(values);

                            } catch (err) {
                                newErr = $interpolateMinErr('interr', "Can't interpolate: {0}\n", text);

                                msos.console.error(temp_ip + temp_it + ' - interpolationFn_Force -> failed: ' + newErr, err);
                            }

                            return undefined;
                        },
                        {
                            exp: text,
                            expressions: expressions,
                            $$watchDelegate: function (scope, listener) {
                                var lastValue;

                                return scope.$watchGroup(
                                    parseFns,
                                    function interpolateFnWatcher(values, oldValues) {
                                        var currValue = compute(values);
                                        if (_.isFunction(listener)) {
                                            listener.call(this, currValue, values !== oldValues ? lastValue : currValue, scope);
                                        }
                                        lastValue = currValue;
                                    }
                                );
                            }
                        }
                    );
                }

                msos_debug(temp_ip + temp_it + ' -> done, no expressions.');
                return undefined;
            }

            $interpolateFn.startSymbol = function () {
                return startSymbol;
            };

            $interpolateFn.endSymbol = function () {
                return endSymbol;
            };

            return $interpolateFn;
        }];
    }

    function isStateExceptionHandled(state) {
        return !!state.pur;
    }

    function markQStateExceptionHandled(state) {
        state.pur = true;
    }

    function markQExceptionHandled(q) {
        markQStateExceptionHandled(q.$$prom_state);
    }

    function $IntervalProvider() {
        this.$get = ['$rootScope', '$window', '$q', '$$q', '$browser',
            function ($rootScope,   $window,   $q,   $$q,   $browser) {
            var intervals = {},
                temp_ipg = 'ng - $IntervalProvider - $get';

            function interval(fn_in, delay_in, count, invokeApply_in) {
                var temp_in = ' - interval',
                    checked_count = isDefined(count) ? count : 0,
                    hasParams = arguments.length > 4,
                    args = hasParams ? sliceArgs(arguments, 4) : [],
                    setInterval = $window.setInterval,
                    clearInterval = $window.clearInterval,
                    iteration = 0,
                    skipApply = (isDefined(invokeApply_in) && !invokeApply_in),
                    deferred = (skipApply ? $$q : $q).defer('ng_$IntervalProvider_$get'),
                    promise = deferred.promise;

                msos.console.info(temp_ipg + temp_in + ' -> start, name: ' + promise.$$prom_state.name + ', delay: ' + delay_in);

                function callback() {
                    if (!hasParams) {
                        fn_in(iteration);
                    } else {
                        fn_in.apply(null, args);
                    }
                }

                promise.$$intervalId = setInterval(
                    function tick() {
                        var debug_out = ', name: ' + promise.$$prom_state.name + ', iteration: ' + iteration;

                        msos_debug(temp_ipg + temp_in + ' - tick -> start' + debug_out);

                        if (skipApply) {
                            $browser.defer(callback, promise.$$prom_state.name);
                        } else {
                            $rootScope.$evalAsync(callback, { directive_name: '$IntervalProvider_tick' });
                        }

                        deferred.notify(iteration);
                        iteration += 1;

                        if (checked_count > 0 && iteration >= checked_count) {
                            deferred.resolve(iteration);
                            clearInterval(promise.$$intervalId);
                            delete intervals[promise.$$intervalId];
                            msos_debug(temp_ipg + temp_in + ' - tick -> cleared: ' + promise.$$intervalId);
                        }

                        if (!skipApply && $rootScope.$apply !== noop) { $rootScope.$apply(); }

                        msos_debug(temp_ipg + temp_in + ' - tick ->  done' + debug_out);
                    },
                    delay_in
                );

                intervals[promise.$$intervalId] = deferred;

                msos.console.info(temp_ipg + temp_in + ' ->  done, name: ' + promise.$$prom_state.name);

                return promise;
            }

            interval.cancel = function (promise) {

                if (promise && intervals.hasOwnProperty(promise.$$intervalId)) {
                    // Interval cancels should not report as unhandled promise.
                    markQExceptionHandled(intervals[promise.$$intervalId].promise);
                    intervals[promise.$$intervalId].reject('canceled');
                    $window.clearInterval(promise.$$intervalId);
                    delete intervals[promise.$$intervalId];
                    return true;
                }
                return false;
            };

            return interval;
        }];
    }

    $jsonpCallbacksProvider = function () {

        this.$get = function () {
            var callbacksNG = angular.callbacks,
                callbackMap = {};

            function createCallback_jCP(callbackId) {
                var callback = function (data) {
                        callback.data = data;
                        callback.called = true;
                    };

                callback.id = callbackId;

                return callback;
            }

            return {
                createCallback: function () {
                    var cbID = '_' + (callbacksNG.$$counter).toString(36),
                        cbKey = 'angular.callbacks.' + cbID,
                        cb = createCallback_jCP(cbID);

                    callbacksNG.$$counter += 1;

                    callbackMap[cbKey] = callbacksNG[cbID] = cb;
                    return cbKey;
                },

                wasCalled: function (cbKey) {
                    return callbackMap[cbKey].called;
                },

                getResponse: function (cbKey) {
                    return callbackMap[cbKey].data;
                },

                removeCallback: function (cbKey) {
                    var cb = callbackMap[cbKey];

                    delete callbacksNG[cb.id];
                    delete callbackMap[cbKey];
                }
            };
        };
    };

    $locationMinErr = minErr('$location');

    function parseAppUrl(url, locationObj) {
        var temp_pa = 'ng - parseAppUrl -> ',
            prefixed = (url.charAt(0) !== '/'),
            match,
            param;

        if (DOUBLE_SLASH_REGEX.test(url)) {
            throw $locationMinErr(
                'badpath',
                'Invalid url \'{0}\'.',
                url
            );
        }

        // Always make it something (ie: /)
        if (prefixed) {
            url = '/' + url;
        }

        msos_debug(temp_pa + 'start, relative url: ' + url + ', prefixed: ' + prefixed);

        match = urlResolve(url, 'parseAppUrl');

        for (param in match.params) {
            if (match.params[param] === "") {
                match.params[param] = true;    // Default is "true" for key only parameter in url
            }
        }

        locationObj.$$path = decodeURIComponent(prefixed && match.pathname.charAt(0) === '/' ? match.pathname.substring(1) : match.pathname);
        locationObj.$$search = match.params;
        locationObj.$$hash = decodeURIComponent(match.hash);

        // make sure path starts with '/';
        if (locationObj.$$path && locationObj.$$path.charAt(0) !== '/') {
            locationObj.$$path = '/' + locationObj.$$path;
        }

        msos_debug(temp_pa + 'done, Location Object:', locationObj);
    }

    function startsWith(str, search) {
        return str.slice(0, search.length) === search;
    }

    function stripBaseUrl(base, url) {
        if (startsWith(url, base)) {
            return url.substr(base.length);
        }
        return undefined;
    }

    function stripFile(url) {
        return url.substr(0, stripHash(url).lastIndexOf('/') + 1);
    }

    /* return the server only (scheme://host:port) */
    function serverBase(url) {
        return url.substring(0, url.indexOf('/', url.indexOf('//') + 2));
    }

    function LocationHtml5Url(appBase, appBaseNoFile, basePrefix) {

        this.$$html5 = true;
        basePrefix = basePrefix || '';

        var temp_lh5 = 'ng - LocationHtml5Url';

        msos_debug(temp_lh5 + ' -> start,\n     app base: ' + appBase + (basePrefix ? ', base prefix: ' + basePrefix : ''));

        this.$$protocol = originUrl.protocol;
        this.$$host = originUrl.hostname;
        this.$$port = parseInt(originUrl.port, 10) || DEFAULT_PORTS[originUrl.protocol] || null;

        this.$$parse = function (url) {

            msos_debug(temp_lh5 + ' - $$parse -> start,\n     url: ' + url);

            var pathUrl = stripBaseUrl(appBaseNoFile, url);

            if (!_.isString(pathUrl)) {
                throw $locationMinErr('ipthprfx', 'Invalid url "{0}", missing path prefix "{1}".', url, appBaseNoFile);
            }

            parseAppUrl(pathUrl, this);

            if (!this.$$path) {
                this.$$path = '/';
            }

            this.$$compose();

            msos_debug(temp_lh5 + ' - $$parse -> done!');
        };

        this.$$compose = function () {
            var search = toKeyValue(this.$$search),
                hash = this.$$hash ? '#' + encodeUriSegment(this.$$hash) : '';

            this.$$url = encodePath(this.$$path) + (search ? '?' + search : '') + hash;
            this.$$absUrl = appBaseNoFile + this.$$url.substr(1); // first char is always '/'

            this.$$urlUpdatedByLocation = true;
        };

        this.$$parseLinkUrl = function (url, relHref) {

            msos_debug(temp_lh5 + ' - $$parseLinkUrl -> start.');

            if (relHref && relHref[0] === '#') {
                // special case for links to hash fragments:
                // keep the old url and only replace the hash fragment
                this.hash(relHref.slice(1));

                msos_debug(temp_lh5 + ' - $$parseLinkUrl -> done, for #');
                return true;
            }

            var appUrl  = stripBaseUrl(appBase, url),
                appUrlNF = stripBaseUrl(appBaseNoFile, url),
                prevAppUrl,
                rewrittenUrl;

            if (isDefined(appUrl)) {
                prevAppUrl = appUrl;

                appUrl = stripBaseUrl(basePrefix, appUrl);

                if (basePrefix && isDefined(appUrl)) {
                    rewrittenUrl = appBaseNoFile + (stripBaseUrl('/', appUrl) || appUrl);
                } else {
                    rewrittenUrl = appBase + prevAppUrl;
                }
            } else if (isDefined(appUrlNF)) {
                rewrittenUrl = appBaseNoFile + appUrlNF;
            } else if (appBaseNoFile === url + '/') {
                rewrittenUrl = appBaseNoFile;
            }

            if (rewrittenUrl) {
                this.$$parse(rewrittenUrl);
            }

            msos_debug(temp_lh5 + ' - $$parseLinkUrl -> done, rewritten: ' + !!rewrittenUrl);
            return !!rewrittenUrl;
        };

        msos_debug(temp_lh5 + ' -> done!');
    }

    function LocationHashbangUrl(appBase, appBaseNoFile, hashPrefix) {

        var temp_hb = 'ng - LocationHashbangUrl';

        msos_debug(temp_hb + ' -> start,\n     app base: ' + appBase + (hashPrefix ? ', hash prefix: ' + hashPrefix : ''));

        this.$$protocol = originUrl.protocol;
        this.$$host = originUrl.hostname;
        this.$$port = parseInt(originUrl.port, 10) || DEFAULT_PORTS[originUrl.protocol] || null;

        this.$$parse = function (url) {

            msos_debug(temp_hb + ' - $$parse -> start,\n     url: ' + url);
    
            var withoutBaseUrl = stripBaseUrl(appBase, url) || stripBaseUrl(appBaseNoFile, url),
                withoutHashUrl;

            if (!_.isUndefined(withoutBaseUrl) && withoutBaseUrl.charAt(0) === '#') {
                withoutHashUrl = stripBaseUrl(hashPrefix, withoutBaseUrl);
                if (_.isUndefined(withoutHashUrl)) {
                    withoutHashUrl = withoutBaseUrl;
                }
            } else {
                if (this.$$html5) {
                    withoutHashUrl = withoutBaseUrl;
                } else {
                    withoutHashUrl = '';
                    if (_.isUndefined(withoutBaseUrl)) {
                        appBase = url;
                        (this).replace();
                    }
                }
            }

            function removeWindowsDriveName(path, url, base) {
                /*
                    Matches paths for file protocol on windows,
                    such as /C:/foo/bar, and captures only /foo/bar.
                */
                var windowsFilePathExp = /^\/[A-Z]:(\/.*)/,
                    firstPathSegmentMatch;

                //Get the relative path from the input URL.
                if (startsWith(url, base)) {
                    url = url.replace(base, '');
                }

                // The input URL intentionally contains a first path segment that ends with a colon.
                if (windowsFilePathExp.exec(url)) {
                    return path;
                }

                firstPathSegmentMatch = windowsFilePathExp.exec(path);

                return firstPathSegmentMatch ? firstPathSegmentMatch[1] : path;
            }

            parseAppUrl(withoutHashUrl, this);

            this.$$path = removeWindowsDriveName(this.$$path, withoutHashUrl, appBase);

            this.$$compose();

            msos_debug(temp_hb + ' - $$parse -> done!');
        };

        this.$$compose = function () {
            var search = toKeyValue(this.$$search),
                hash = this.$$hash ? '#' + encodeUriSegment(this.$$hash) : '';

            this.$$url = encodePath(this.$$path) + (search ? '?' + search : '') + hash;
            this.$$absUrl = appBase + (this.$$url ? hashPrefix + this.$$url : '');

            this.$$urlUpdatedByLocation = true;
        };

        this.$$parseLinkUrl = function (url) {
            var temp_pu = ' - $$parseLinkUrl -> ';

            msos_debug(temp_hb + temp_pu + 'start.');

            if (stripHash(appBase) === stripHash(url)) {
                this.$$parse(url);
    
                msos_debug(temp_hb + temp_pu + 'done: true');
                return true;
            }

            msos_debug(temp_hb + temp_pu + 'done: false');
            return false;
        };

        msos_debug(temp_hb + ' -> done!');
    }

    function LocationHashbangInHtml5Url(appBase, appBaseNoFile, hashPrefix) {
        this.$$html5 = true;
    
        var temp_5u = 'ng - LocationHashbangInHtml5Url';

        msos_debug(temp_5u + ' -> start.');

        LocationHashbangUrl.apply(this, arguments);

        this.$$parseLinkUrl = function (url, relHref) {
            var temp_pl = ' - $$parseLinkUrl -> ',
                rewrittenUrl,
                appUrl;

            msos_debug(temp_5u + temp_pl + 'start.');
    
            if (relHref && relHref[0] === '#') {
                // special case for links to hash fragments:
                // keep the old url and only replace the hash fragment
                this.hash(relHref.slice(1));
                return true;
            }

            appUrl = stripBaseUrl(appBaseNoFile, url);

            if (appBase === stripHash(url)) {
                rewrittenUrl = url;
            } else if (appUrl) {
                rewrittenUrl = appBase + hashPrefix + appUrl;
            } else if (appBaseNoFile === url + '/') {
                rewrittenUrl = appBaseNoFile;
            }

            if (rewrittenUrl) {
                this.$$parse(rewrittenUrl);
            }

            msos_debug(temp_5u + temp_pl + 'done, rewritten: ' + !!rewrittenUrl);

            return !!rewrittenUrl;
        };

        this.$$compose = function () {
            var search = toKeyValue(this.$$search),
                hash = this.$$hash ? '#' + encodeUriSegment(this.$$hash) : '';

            this.$$url = encodePath(this.$$path) + (search ? '?' + search : '') + hash;
            // include hashPrefix in $$absUrl when $$url is empty so IE8 & 9 do not reload page because of removal of '#'
            this.$$absUrl = appBase + hashPrefix + this.$$url;

            this.$$urlUpdatedByLocation = true;
        };

        msos_debug(temp_5u + ' -> done!');
    }

    function locationGetter(property) {
        return function () {
            return this[property];
        };
    }

    function locationGetterSetter(property, preprocess) {
        return function (value) {
            if (_.isUndefined(value)) {
                return this[property];
            }

            this[property] = preprocess(value);
            this.$$compose();

            return this;
        };
    }

    locationPrototype = {

        $$absUrl: '',
        $$html5: false,
        $$replace: false,
        absUrl: locationGetter('$$absUrl'),

        url: function (url) {
            if (_.isUndefined(url)) { return this.$$url; }

            var match = PATH_MATCH.exec(url);

            if (match[1]) { this.path(decodeURIComponent(match[1])); }
            if (match[2] || match[1]) { this.search(match[3] || ''); }

            this.hash(match[5] || '');

            msos_debug('ng - locationPrototype - url -> called, output:', this);
            return this;
        },

        protocol:   locationGetter('$$protocol'),
        host:       locationGetter('$$host'),
        port:       locationGetter('$$port'),

        path: locationGetterSetter(
            '$$path',
            function (path) {
                path = path !== null ? path.toString() : '';
                return path.charAt(0) === '/' ? path : '/' + path;
            }
        ),

        search: function (srch, paramValue) {
            var temp_sr = 'ng - locationPrototype - search -> ',
                arg_length = arguments.length,
                checked_srch;

            msos_debug(temp_sr + 'start, case: ' + arg_length + (paramValue ? ', paramValue: ' + paramValue : ''));

            switch (arg_length) {

                case 0:
                    msos_debug(temp_sr + ' done, case: 0', this.$$search);
                    return this.$$search;

                case 1:
                    if (_.isString(srch) || _.isNumber(srch)) {
                        checked_srch = srch.toString();
                        this.$$search = msos.parse_string(checked_srch);
                    } else if (_.isObject(srch)) {
                        checked_srch = copy(srch, {});
                        // remove object undefined or null properties
                        forEach(
                            checked_srch,
                            function (value, key) {
                                if (value === null) { delete checked_srch[key]; }
                            }
                        );

                        this.$$search = checked_srch;
                    } else {
                        throw $locationMinErr(
                            'isrcharg',
                            'The first argument of the `$location#search()` call must be a string or an object.'
                        );
                    }
                break;

                default:
                    if (_.isUndefined(paramValue) || paramValue === null) {
                        delete this.$$search[srch];
                        msos_debug(temp_sr + 'case: default, delete $$search key: ' + srch);
                    } else {
                        this.$$search[srch] = typeof paramValue === 'boolean'
                            ? paramValue === true ? 'true' : 'false'
                            : paramValue;
                        msos_debug(temp_sr + 'case: default, set $$search key:', srch);
                    }
            }

            this.$$compose();

            msos_debug(temp_sr + ' done, case: ' + arg_length + ', $$search: ', this.$$search);
            return this;
        },

        hash: locationGetterSetter(
            '$$hash',
            function (hash) {
                return hash !== null ? hash.toString() : '';
            }
        ),

        replace: function () {
            this.$$replace = true;
            return this;
        }
    };

    forEach(
        [LocationHashbangInHtml5Url, LocationHashbangUrl, LocationHtml5Url],
        function (Location) {
            Location.prototype = Object.create(locationPrototype);

            Location.prototype.state = function (state) {
                if (!arguments.length) {
                    return this.$$loc_state;
                }

                if (Location !== LocationHtml5Url || !this.$$html5) {
                    throw $locationMinErr(
                        'nostate',
                        'History API state support is available only in HTML5 mode and only in browsers supporting HTML5 History API'
                    );
                }

                this.$$loc_state = _.isUndefined(state) ? null : state;
                this.$$urlUpdatedByLocation = true;

                return this;
            };
        }
    );

    function $LocationProvider() {
        var temp_lp = 'ng - $LocationProvider',
            hashPrefix = '',    // AngularJS v1.6.0 sets this to '!'???
            html5Mode = {
                enabled: false,
                requireBase: true,
                rewriteLinks: true
            };

        msos_debug(temp_lp + ' -> start.');

        this.hashPrefix = function (prefix) {
            if (isDefined(prefix)) {
                hashPrefix = prefix;
                return this;
            }

            return hashPrefix;
        };

        this.html5Mode = function (mode) {
            if (_.isBoolean(mode)) {
                html5Mode.enabled = mode;
                return this;
            }
            
            if (_.isObject(mode)) {

                if (_.isBoolean(mode.enabled)) {
                    html5Mode.enabled = mode.enabled;
                }

                if (_.isBoolean(mode.requireBase)) {
                    html5Mode.requireBase = mode.requireBase;
                }

                if (_.isBoolean(mode.rewriteLinks) || _.isString(mode.rewriteLinks)) {
                    html5Mode.rewriteLinks = mode.rewriteLinks;
                }

                return this;
            }

            return html5Mode;
        };

        this.$get = ['$rootScope', '$browser', '$rootElement', '$window', function ($rootScope, $browser, $rootElement, $window) {

            var $location_LP,
                LocationMode,
                initialUrl = originUrl.source,
                IGNORE_URI_REGEXP = /^\s*(javascript|mailto):/i,
                appBase,
                appBaseNoFile,
                initializing = true,
                rewrite_url,
                location_watch_count = 0;

            msos_debug(temp_lp + ' - $get -> start,\n     initial url: ' + initialUrl);

            if (html5Mode.enabled) {
                if (!baseHref && html5Mode.requireBase) {
                    throw $locationMinErr(
                        'nobase',
                        "$location in HTML5 mode requires a <base> tag to be present!"
                    );
                }
                appBase = serverBase(initialUrl) + (baseHref || '/');
                LocationMode = history_pushstate ? LocationHtml5Url : LocationHashbangInHtml5Url;
            } else {
                appBase = stripHash(initialUrl);
                LocationMode = LocationHashbangUrl;
            }

            appBaseNoFile = stripFile(appBase);

            $location_LP = new LocationMode(appBase, appBaseNoFile, '#' + hashPrefix);

            $location_LP.$$parseLinkUrl(initialUrl, initialUrl);

            $location_LP.$$loc_state = $browser.state();

            rewrite_url = $location_LP.absUrl();

            // Rewrite hashbang url <> html5 url
            if (trimEmptyHash(rewrite_url) !== trimEmptyHash(initialUrl)) {

                msos_debug(temp_lp + ' - get -> rewrite hashbang url <> html5 url:\n     ', rewrite_url);

                $browser.url(rewrite_url, true);
            }

            function setBrowserUrlWithFallback(url, replace, state) {
                var temp_sbf = ' - $get - setBrowserUrlWithFallback -> ',
                    oldUrl,
                    oldState;

                msos_debug(temp_lp + temp_sbf + 'start.');

                oldUrl = $location_LP.url();
                oldState = $location_LP.$$loc_state;

                if (msos_verbose) {
                    try {
                        $browser.url(url, replace, state);
                        $location_LP.$$loc_state = $browser.state();
                    } catch (e) {
                        // Restore old values if pushState fails
                        $location_LP.url(oldUrl);
                        $location_LP.$$loc_state = oldState;

                        msos.console.warn(temp_lp + temp_sbf + 'pushstate failed:', e);
                    }
                } else {
                    $browser.url(url, replace, state);
                    $location_LP.$$loc_state = $browser.state();
                }

                msos_debug(temp_lp + temp_sbf + 'done!');
            }

            function afterLocationChange(oldUrl, oldState) {
                $rootScope.$broadcast(
                    '$locationChangeSuccess',
                    $location_LP.absUrl(),
                    oldUrl,
                    $location_LP.$$loc_state,
                    oldState
                );
            }

            $rootElement.on(
                'click',
                function (event) {
                    var temp_re = ' - $get - $rootElement.on:click -> ',
                        debug_txt = '',
                        tar_name = event.target.id || lowercase(event.target.nodeName),
                        elm,
                        rewriteLinks = html5Mode.rewriteLinks,
                        absHref,
                        relHref;

                    msos_debug(temp_lp + temp_re + 'start, target: ' + tar_name);

                    if (!rewriteLinks || event.ctrlKey || event.metaKey || event.shiftKey || event.which === 2 || event.button === 2) {
                        msos_debug(temp_lp + temp_re + ' done, target: ' + tar_name + ', ' + (rewriteLinks ? 'html5 rewrite links' : 'skipped event'));
                        return;
                    }

                    elm = jqLite(event.target);

                    // traverse the DOM up to find first A tag
                    while (nodeName_(elm[0]) !== 'a') {
                        // ignore rewriting if no A tag (reached root element, or no parent - removed from document)
                        if (elm[0] === $rootElement[0]) {
                            msos_debug(temp_lp + temp_re + ' done, target: ' + tar_name + ' na, reached root element');
                            return;
                        }

                        elm = elm.parent();

                        if (!elm || elm[0]) {
                            msos_debug(temp_lp + temp_re + ' done, target: ' + tar_name + ' na, no parent element');
                            return;
                        }
                    }

                    if (_.isString(rewriteLinks) && _.isUndefined(elm.attr(rewriteLinks))) {
                        return;
                    }

                    absHref = elm.prop('href');
                    relHref = elm.attr('href') || elm.attr('xlink:href');

                    if (_.isObject(absHref) && absHref.toString() === '[object SVGAnimatedString]') {
                        absHref = urlResolve(absHref.animVal, 'SVGAnimatedString').href;
                    }

                    // Ignore when url is started with javascript: or mailto:
                    if (IGNORE_URI_REGEXP.test(absHref)) {
                        msos_debug(temp_lp + temp_re + ' done, target: ' + tar_name + ' na, is js or mailto url');
                        return;
                    }

                    if (absHref && !elm.attr('target') && !event.isDefaultPrevented()) {
                        if ($location_LP.$$parseLinkUrl(absHref, relHref)) {
                            event.preventDefault();
                            // update location manually
                            if ($location_LP.absUrl() !== $browser.url()) {
                                debug_txt = ', updating location manually';
                                if ($rootScope.$apply !== noop) {
                                    $rootScope.$apply();
                                }
                            }
                        }
                    }

                    msos_debug(temp_lp + temp_re + ' done, target: ' + tar_name + debug_txt);
                }
            );

            // Update $location when $browser url changes
            $browser.onUrlChange(
                function (newUrl, newState) {
                    var temp_bo = ' - $get - $browser.onUrlChange';

                    msos_debug(temp_lp + temp_bo + ' -> start.');

                    if (!startsWith(newUrl, appBaseNoFile)) {
                            // If we are navigating outside of the app then force a reload
                            if (msos_verbose) {
                                msos.console.warn(temp_lp + temp_bo + ' -> done, leaving app for a new url:\n     ' + newUrl);
                                alert(temp_lp + temp_bo + ': Leaving the app for a new url (' + newUrl + ')');
                            }

                            $window.location.href = newUrl;
                            return;
                    }

                    $rootScope.$evalAsync(
                        function browser_on_url_change() {
                            var temp_bo = ' - browser_on_url_change -> ',
                                oldUrl = $location_LP.absUrl(),
                                oldState = $location_LP.$$loc_state,
                                defaultPrevented;

                            newUrl = trimEmptyHash(newUrl);

                            $location_LP.$$parse(newUrl);
                            $location_LP.$$loc_state = newState;

                            msos_debug(temp_lp + temp_bo + 'start,\n     new url: ' + newUrl + '\n     new state:', newState);

                            defaultPrevented = $rootScope.$broadcast(
                                '$locationChangeStart',
                                newUrl,
                                oldUrl,
                                newState,
                                oldState
                            ).defaultPrevented;

                            // if the location was changed by a `$locationChangeStart` handler then stop
                            // processing this location change
                            if ($location_LP.absUrl() !== newUrl) {
                                msos_debug(temp_lp + temp_bo + ' done, stop processing (ref. $locationChangeStart)');
                                return;
                            }

                            if (defaultPrevented) {
                                $location_LP.$$parse(oldUrl);
                                $location_LP.$$loc_state = oldState;
                                setBrowserUrlWithFallback(
                                    oldUrl,
                                    false, oldState
                                );
                            } else {
                                initializing = false;
                                afterLocationChange(oldUrl, oldState);
                            }

                            msos_debug(temp_lp + temp_bo + ' done!');
                        }
                    );

                    if (!$rootScope.$$phase) { $rootScope.$digest(); }

                    msos_debug(temp_lp + temp_bo + ' ->  done!');
                }
            );

            if (msos_verbose) {
                msos_debug(temp_lp + ' - $get -> set $rootScope.$watch, for: ' + $rootScope.$$name);
            }

            // Update browser
            $rootScope.$watch(
                function $locationWatch() {
                    var temp_lw = ' - $locationWatch (' + $rootScope.$$name + ')',
                        oldUrl,
                        oldState,
                        newUrl,
                        currentReplace,
                        urlOrStateChanged;

                    location_watch_count += 1;

                    msos_debug(temp_lp + temp_lw + ' -> start (' + location_watch_count + '),\n     url: ' + newUrl);

                    if (initializing || $location_LP.$$urlUpdatedByLocation) {
                        $location_LP.$$urlUpdatedByLocation = false;

                        oldUrl = trimEmptyHash($browser.url());
                        newUrl = trimEmptyHash($location_LP.absUrl());
                        oldState = $browser.state();
                        currentReplace = $location_LP.$$replace;
                        urlOrStateChanged = oldUrl !== newUrl || ($location_LP.$$html5 && history_pushstate && oldState !== $location_LP.$$loc_state);

                        msos_debug(temp_lp + temp_lw + ' -> update (' + location_watch_count + '),\n     url: ' + newUrl);

                        if (initializing || urlOrStateChanged) {
                            initializing = false;
    
                            $rootScope.$evalAsync(
                                function location_watch_rootScope_evalAsync() {
                                    var temp_ea = temp_lp + temp_lw + ' - location_watch_rootScope_evalAsync -> ',
                                        newUrl = $location_LP.absUrl(),
                                        defaultPrevented = $rootScope.$broadcast(
                                            '$locationChangeStart',
                                            newUrl,
                                            oldUrl,
                                            $location_LP.$$loc_state,
                                            oldState
                                        ).defaultPrevented;
    
                                    msos_debug(temp_ea + 'start.');
    
                                    // if the location was changed by a `$locationChangeStart` handler then stop
                                    // processing this location change
                                    if ($location_LP.absUrl() !== newUrl) {
                                        msos_debug(temp_ea + ' done, stop processing (ref. $locationChangeStart)');
                                        return;
                                    }
    
                                    if (defaultPrevented) {
                                        msos_debug(temp_ea + 'default prevented.');
                                        $location_LP.$$parse(oldUrl);
                                        $location_LP.$$loc_state = oldState;
                                    } else {
                                        if (urlOrStateChanged) {
                                            msos_debug(temp_ea + 'url changed.');
                                            setBrowserUrlWithFallback(
                                                newUrl,
                                                currentReplace,
                                                oldState === $location_LP.$$loc_state ? null : $location_LP.$$loc_state
                                            );
                                        }
    
                                        afterLocationChange(oldUrl, oldState);
                                    }
                                    msos_debug(temp_ea + ' done!');
                                }
                            );
                        }
                    } else {
                        msos_debug(temp_lp + temp_lw + ' -> skipped (' + location_watch_count + ')');
                    }

                    $location_LP.$$replace = false;

                    msos_debug(temp_lp + temp_lw + ' ->  done (' + location_watch_count + ')');
                }
            );

            msos_debug(temp_lp + ' - $get ->  done!');

            return $location_LP;
        }];

        msos_debug(temp_lp + ' -> done!');
    }

    function $LogProvider() {

        this.debugEnabled = function (flag) {
            if (isDefined(flag)) {
                msos.config.debug = flag;
                return this;
            }

            return msos.config.debug;
        };

        this.$get = ['$window', function ($window) {
            return $window.msos.console;
        }];
    }

    $parseMinErr = minErr('$parse');

    OPERATORS = createMap();

    forEach(['+', '-', '*', '/', '%', '===', '!==', '==', '!=', '<', '>', '<=', '>=', '&&', '||', '!', '=', '|'], function (operator) { OPERATORS[operator] = true; });

/**
 * @constructor
 */
    Lexer = function Lexer(options_L) {
        this.options = options_L;
    };

    Lexer.prototype = {

        constructor: Lexer,

        lex: function (text) {
            var ch,
                ch2,
                ch3,
                op1,
                op2,
                op3,
                token;

            this.text = text;
            this.index = 0;
            this.tokens = [];

            while (this.index < this.text.length) {
                ch = this.text.charAt(this.index);

                if (ch === '"' || ch === '\'') {
                    this.readString(ch);
                } else if (this.isNumber(ch) || (ch === '.' && this.isNumber(this.peek()))) {
                    this.readNumber();
                } else if (this.isIdentifierStart(this.peekMultichar())) {
                    this.readIdent();
                } else if (this.is(ch, '(){}[].,;:?')) {
                    this.tokens.push({ index: this.index, text: ch });
                    this.index += 1;
                } else if (this.isWhitespace(ch)) {
                    this.index += 1;
                } else {
                    ch2 = ch  + this.peek();
                    ch3 = ch2 + this.peek(2);
                    op1 = OPERATORS[ch];
                    op2 = OPERATORS[ch2];
                    op3 = OPERATORS[ch3];

                    if (op1 || op2 || op3) {
                        token = op3 ? ch3 : (op2 ? ch2 : ch);
                        this.tokens.push({ index: this.index, text: token, operator: true });
                        this.index += token.length;
                    } else {
                        this.throwError(
                            'Unexpected next character ',
                            this.index,
                            this.index + 1
                        );
                    }
                }
            }
            return this.tokens;
        },

        is: function (ch, chars) {
            return chars.indexOf(ch) !== -1;
        },

        peek: function (i) {
            var num = i || 1;
            return (this.index + num < this.text.length) ? this.text.charAt(this.index + num) : false;
        },

        isNumber: function (ch) {
            return ('0' <= ch && ch <= '9') && typeof ch === 'string';
        },

        isWhitespace: function (ch) {
            // IE treats non-breaking space as \u00A0
            return (ch === ' ' || ch === '\r' || ch === '\t' ||
                    ch === '\n' || ch === '\v' || ch === '\u00A0');
        },

        isIdentifierStart: function (ch) {
            return this.options.isIdentifierStart ? this.options.isIdentifierStart(ch, this.codePointAt(ch)) : this.isValidIdentifierStart(ch);
        },

        isValidIdentifierStart: function (ch) {
            return (('a' <= ch && ch <= 'z') || ('A' <= ch && ch <= 'Z') || '_' === ch || ch === '$');
        },

        isIdentifierContinue: function (ch) {
            return this.options.isIdentifierContinue ? this.options.isIdentifierContinue(ch, this.codePointAt(ch)) : this.isValidIdentifierContinue(ch);
        },

        isValidIdentifierContinue: function (ch, cp) {
            return this.isValidIdentifierStart(ch, cp) || this.isNumber(ch);
        },

        codePointAt: function (ch) {
            if (ch.length === 1) { return ch.charCodeAt(0); }
            /*jshint bitwise: false*/
            return (ch.charCodeAt(0) << 10) + ch.charCodeAt(1) - 0x35FDC00;
            /*jshint bitwise: true*/
        },

        peekMultichar: function () {
            var ch = this.text.charAt(this.index),
                peek = this.peek(),
                cp1,
                cp2;

            if (!peek) { return ch; }

            cp1 = ch.charCodeAt(0);
            cp2 = peek.charCodeAt(0);

            if (cp1 >= 0xD800
             && cp1 <= 0xDBFF
             && cp2 >= 0xDC00
             && cp2 <= 0xDFFF) {
                return ch + peek;
            }

            return ch;
        },

        isExpOperator: function (ch) {
            return (ch === '-' || ch === '+' || this.isNumber(ch));
        },

        throwError: function (error, start, end) {
            end = end || this.index;

            var colStr = (isDefined(start)
                    ? 's ' + start +  '-' + this.index + ' [' + this.text.substring(start, end) + ']'
                    : ' ' + end
                );

            throw $parseMinErr(
                'lexerr',
                'Lexer Error: {0} at column{1} in expression [{2}].',
                error,
                colStr,
                this.text
            );
        },

        readNumber: function () {
            var number = '',
                start = this.index,
                ch,
                peekCh;

            while (this.index < this.text.length) {
                ch = lowercase(this.text.charAt(this.index));
                if (ch === '.' || this.isNumber(ch)) {
                    number += ch;
                } else {
                    peekCh = this.peek();
                    if (ch === 'e' && this.isExpOperator(peekCh)) {
                        number += ch;
                    } else if (this.isExpOperator(ch)
                            && peekCh
                            && this.isNumber(peekCh)
                            && number.charAt(number.length - 1) === 'e') {
                        number += ch;
                    } else if (this.isExpOperator(ch)
                           && (!peekCh || !this.isNumber(peekCh))
                           && number.charAt(number.length - 1) === 'e') {
                        this.throwError('Invalid exponent');
                    } else {
                        break;
                    }
                }
                this.index += 1;
            }

            this.tokens.push({
                index: start,
                text: number,
                constant: true,
                value: Number(number)
            });
        },

        readIdent: function () {
            var start = this.index,
                ch;

            this.index += this.peekMultichar().length;

            while (this.index < this.text.length) {
                ch = this.peekMultichar();

                if (!this.isIdentifierContinue(ch)) { break; }
                this.index += ch.length;
            }

            this.tokens.push({
                index: start,
                text: this.text.slice(start, this.index),
                identifier: true
            });
        },

        readString: function (quote) {
            var start = this.index,
                string = '',
                rawString = quote,
                escape = false,
                ch,
                hex,
                rep;

            this.index += 1;

            while (this.index < this.text.length) {
                ch = this.text.charAt(this.index);
                rawString += ch;

                if (escape) {
                    if (ch === 'u') {
                        hex = this.text.substring(this.index + 1, this.index + 5);
                        if (!hex.match(/[\da-f]{4}/i)) {
                            this.throwError('Invalid unicode escape [\\u' + hex + ']');
                        }
                        this.index += 4;
                        string += String.fromCharCode(parseInt(hex, 16));
                    } else {
                        rep = ESCAPE[ch];
                        string = string + (rep || ch);
                    }
                    escape = false;
                } else if (ch === '\\') {
                    escape = true;
                } else if (ch === quote) {
                    this.index += 1;

                    this.tokens.push({
                        index: start,
                        text: rawString,
                        constant: true,
                        value: string
                    });

                    return;
                }

                string += ch;

                this.index += 1;
            }

            this.throwError(
                'Unterminated quote',
                start
            );
        }
    };

    function isAssignable(ast) {
        return ast.type === AST.Identifier || ast.type === AST.MemberExpression;
    }

    AST = function AST(lexer_AST, options_AST) {
        this.lexer = lexer_AST;
        this.options = options_AST;
    };

    AST.Program = 'Program';
    AST.ExpressionStatement = 'ExpressionStatement';
    AST.AssignmentExpression = 'AssignmentExpression';
    AST.ConditionalExpression = 'ConditionalExpression';
    AST.LogicalExpression = 'LogicalExpression';
    AST.BinaryExpression = 'BinaryExpression';
    AST.UnaryExpression = 'UnaryExpression';
    AST.CallExpression = 'CallExpression';
    AST.MemberExpression = 'MemberExpression';
    AST.Identifier = 'Identifier';
    AST.Literal = 'Literal';
    AST.ArrayExpression = 'ArrayExpression';
    AST.Property = 'Property';
    AST.ObjectExpression = 'ObjectExpression';
    AST.ThisExpression = 'ThisExpression';
    AST.LocalsExpression = 'LocalsExpression';

    // Internal use only
    AST.NGValueParameter = 'NGValueParameter';

    AST.prototype = {
        ast: function (text) {
            this.text = text;
            this.tokens = this.lexer.lex(text);

            var value = this.program();

            if (this.tokens.length !== 0) {
                this.throwError('is an unexpected token', this.tokens[0]);
            }

            return value;
        },

        program: function () {
            var body = [];

            while (true) {
                if (this.tokens.length > 0 && !this.peek('}', ')', ';', ']')) { body.push(this.expressionStatement()); }

                if (!this.expect(';')) {
                    return { type: AST.Program, body: body};
                }
            }
        },

        expressionStatement: function () {
            return { type: AST.ExpressionStatement, expression: this.filterChain() };
        },

        filterChain: function () {
            var left = this.expression();

            while (this.expect('|')) {
                left = this.filter(left);
            }

            return left;
        },

        expression: function () {
            return this.assignment();
        },

        assignment: function () {
            var result = this.ternary();

            if (this.expect('=')) {

                if (!isAssignable(result)) {
                    throw $parseMinErr(
                        'lval',
                        'Trying to assign a value to a non l-value'
                    );
                }

                result = { type: AST.AssignmentExpression, left: result, right: this.assignment(), operator: '='};
            }

            return result;
        },

        ternary: function () {
            var test = this.logicalOR(),
                alternate,
                consequent;

            if (this.expect('?')) {
                alternate = this.expression();
                if (this.consume(':')) {
                    consequent = this.expression();
                    return { type: AST.ConditionalExpression, test: test, alternate: alternate, consequent: consequent};
                }
            }

            return test;
        },

        logicalOR: function () {
            var left = this.logicalAND();

            while (this.expect('||')) {
                left = { type: AST.LogicalExpression, operator: '||', left: left, right: this.logicalAND() };
            }

            return left;
        },

        logicalAND: function () {
            var left = this.equality();

            while (this.expect('&&')) {
                left = { type: AST.LogicalExpression, operator: '&&', left: left, right: this.equality()};
            }

            return left;
        },

        equality: function () {
            var left = this.relational(),
                token;

            while ((token = this.expect('==','!=','===','!=='))) {
                left = { type: AST.BinaryExpression, operator: token.text, left: left, right: this.relational() };
            }

            return left;
        },

        relational: function () {
            var left = this.additive(),
                token;

            while ((token = this.expect('<', '>', '<=', '>='))) {
                left = { type: AST.BinaryExpression, operator: token.text, left: left, right: this.additive() };
            }

            return left;
        },

        additive: function () {
            var left = this.multiplicative(),
                token;

            while ((token = this.expect('+','-'))) {
                left = { type: AST.BinaryExpression, operator: token.text, left: left, right: this.multiplicative() };
            }

            return left;
        },

        multiplicative: function () {
            var left = this.unary(),
            token;

            while ((token = this.expect('*','/','%'))) {
                left = { type: AST.BinaryExpression, operator: token.text, left: left, right: this.unary() };
            }

            return left;
        },

        unary: function () {
            var token = this.expect('+', '-', '!');

            if (token) {
                return { type: AST.UnaryExpression, operator: token.text, prefix: true, argument: this.unary() };
            }

            return this.primary();
        },

        primary: function () {
            var primary,
                next;

            if (this.expect('(')) {
                primary = this.filterChain();
                this.consume(')');
            } else if (this.expect('[')) {
                primary = this.arrayDeclaration();
            } else if (this.expect('{')) {
                primary = this.object();
            } else if (this.selfReferential.hasOwnProperty(this.peek().text)) {
                primary = copy(this.selfReferential[this.consume().text]);
            } else if (this.options.literals.hasOwnProperty(this.peek().text)) {
                primary = { type: AST.Literal, value: this.options.literals[this.consume().text] };
            } else if (this.peek().identifier) {
                primary = this.identifier();
            } else if (this.peek().constant) {
                primary = this.constant();
            } else {
                this.throwError(
                    'not a primary expression',
                    this.peek()
                );
            }

            // Hard to see how this works?
            while ((next = this.expect('(', '[', '.'))) {
                if (msos_verbose) {
                    msos_debug('ng - Parser - primary -> next:', next);
                }
                if (next.text === '(') {
                    primary = {type: AST.CallExpression, callee: primary, parse_args: this.parseArguments() };
                    this.consume(')');
                } else if (next.text === '[') {
                    primary = { type: AST.MemberExpression, object: primary, property: this.expression(), computed: true };
                    this.consume(']');
                } else if (next.text === '.') {
                    primary = { type: AST.MemberExpression, object: primary, property: this.identifier(), computed: false };
                } else {
                    this.throwError('IMPOSSIBLE');
                }
            }

            return primary;
        },

        filter: function (baseExpression) {
            var args = [baseExpression],
                result = {type: AST.CallExpression, callee: this.identifier(), parse_args: args, filter: true};

            while (this.expect(':')) {
                args.push(this.expression());
            }

            return result;
        },

        parseArguments: function () {
            var args = [];

            if (this.peekToken().text !== ')') {
                do {
                    args.push(this.filterChain());
                } while (this.expect(','));
            }

            return args;
        },

        identifier: function () {
            var token = this.consume();

            if (!token.identifier) {
                this.throwError('is not a valid identifier', token);
            }

            return { type: AST.Identifier, name: token.text };
        },

        constant: function () {
            return { type: AST.Literal, value: this.consume().value };
        },

        arrayDeclaration: function () {
            var elements = [];

            if (this.peekToken().text !== ']') {
                do {
                    if (this.peek(']')) {
                        // Support trailing commas per ES5.1.
                        break;
                    }
                    elements.push(this.expression());
                } while (this.expect(','));
            }

            this.consume(']');

            return { type: AST.ArrayExpression, elements: elements };
        },

        object: function () {
            var properties = [], property;

            if (this.peekToken().text !== '}') {
                do {
                    if (this.peek('}')) {
                        // Support trailing commas per ES5.1.
                        break;
                    }

                    property = { type: AST.Property, kind: 'init' };

                    if (this.peek().constant) {
                        property.key = this.constant();
                        property.computed = false;
                        this.consume(':');
                        property.value = this.expression();
                    } else if (this.peek().identifier) {
                        property.key = this.identifier();
                        property.computed = false;
                        if (this.peek(':')) {
                            this.consume(':');
                            property.value = this.expression();
                        } else {
                            property.value = property.key;
                        }
                    } else if (this.peek('[')) {
                        this.consume('[');
                        property.key = this.expression();
                        this.consume(']');
                        property.computed = true;
                        this.consume(':');
                        property.value = this.expression();
                    } else {
                        this.throwError('invalid key', this.peek());
                    }

                    properties.push(property);
                } while (this.expect(','));
            }

            this.consume('}');

            return { type: AST.ObjectExpression, properties: properties };
        },

        throwError: function (msg, token) {
            throw $parseMinErr(
                'syntax',
                'Syntax Error: Token \'{0}\' {1} at column {2} of the expression [{3}] starting at [{4}].',
                token.text,
                msg,
                (token.index + 1),
                this.text,
                this.text.substring(token.index)
            );
        },

        consume: function (e1) {
            if (this.tokens.length === 0) {
                throw $parseMinErr(
                    'ueoe',
                    'Unexpected end of expression: {0}',
                    this.text
                );
            }

            var token = this.expect(e1);

            if (!token) {
                this.throwError('is unexpected, expecting [' + e1 + ']', this.peek());
            }

            return token;
        },

        peekToken: function () {
            if (this.tokens.length === 0) {
                throw $parseMinErr(
                    'ueoe',
                    'Unexpected end of expression: {0}',
                    this.text
                );
            }

            return this.tokens[0];
        },

        peek: function (e1, e2, e3, e4) {
            return this.peekAhead(0, e1, e2, e3, e4);
        },

        peekAhead: function (i, e1, e2, e3, e4) {
            var token,
                t;

            if (this.tokens.length > i) {
                token = this.tokens[i];
                t = token.text;

                if (t === e1 || t === e2 || t === e3 || t === e4 || (!e1 && !e2 && !e3 && !e4)) {
                    return token;
                }
            }

            return false;
        },

        expect: function (e1, e2, e3, e4) {
            var token = this.peek(e1, e2, e3, e4);

            if (token) {
                this.tokens.shift();
                return token;
            }

            return false;
        },

        selfReferential: {
            'this': {type: AST.ThisExpression },
            '$locals': {type: AST.LocalsExpression }
        }
    };

    function plusFn(l, r) {
        if (l === undefined) { return r; }
        if (r === undefined) { return l; }

        return l + r;
    }

    function isStateless($filter, filterName) {
        var fn = $filter(filterName);

        return !fn.$stateful;
    }

    function isPure(node, parentIsPure) {

        switch (node.type) {
            case AST.MemberExpression:
                if (node.computed) {
                    return false;
                }
                break;
            case AST.UnaryExpression:
                return PURITY_ABSOLUTE;
            case AST.BinaryExpression:
                return node.operator !== '+' ? PURITY_ABSOLUTE : false;
            case AST.CallExpression:
                return false;
        }

        return (undefined === parentIsPure) ? PURITY_RELATIVE : parentIsPure;
    }

    function findConstantAndWatchExpressions(ast, $filter, parentIsPure) {
        var allConstants,
            argsToWatch,
            isStatelessFilter,
            astIsPure = ast.isPure = isPure(ast, parentIsPure);

        switch (ast.type) {
            case AST.Program:
                allConstants = true;
                forEach(
                    ast.body,
                    function (expr) {
                        findConstantAndWatchExpressions(expr.expression, $filter, astIsPure);
                        allConstants = allConstants && expr.expression.constant;
                    }
                );
                ast.constant = allConstants;
            break;
            case AST.Literal:
                ast.constant = true;
                ast.toWatch = [];
            break;
            case AST.UnaryExpression:
                findConstantAndWatchExpressions(ast.argument, $filter, astIsPure);
                ast.constant = ast.argument.constant;
                ast.toWatch = ast.argument.toWatch;
            break;
            case AST.BinaryExpression:
                findConstantAndWatchExpressions(ast.left, $filter, astIsPure);
                findConstantAndWatchExpressions(ast.right, $filter, astIsPure);
                ast.constant = ast.left.constant && ast.right.constant;
                ast.toWatch = ast.left.toWatch.concat(ast.right.toWatch);
            break;
            case AST.LogicalExpression:
                findConstantAndWatchExpressions(ast.left, $filter, astIsPure);
                findConstantAndWatchExpressions(ast.right, $filter, astIsPure);
                ast.constant = ast.left.constant && ast.right.constant;
                ast.toWatch = ast.constant ? [] : [ast];
            break;
            case AST.ConditionalExpression:
                findConstantAndWatchExpressions(ast.test, $filter, astIsPure);
                findConstantAndWatchExpressions(ast.alternate, $filter, astIsPure);
                findConstantAndWatchExpressions(ast.consequent, $filter, astIsPure);
                ast.constant = ast.test.constant && ast.alternate.constant && ast.consequent.constant;
                ast.toWatch = ast.constant ? [] : [ast];
            break;
            case AST.Identifier:
                ast.constant = false;
                ast.toWatch = [ast];
            break;
            case AST.MemberExpression:
                findConstantAndWatchExpressions(ast.object, $filter, astIsPure);
                if (ast.computed) {
                    findConstantAndWatchExpressions(ast.property, $filter, astIsPure);
                }
                ast.constant = ast.object.constant && (!ast.computed || ast.property.constant);
                ast.toWatch = [ast];
            break;
            case AST.CallExpression:
                isStatelessFilter = ast.filter ? isStateless($filter, ast.callee.name) : false;
                allConstants = isStatelessFilter;
                argsToWatch = [];

                forEach(
                    ast.parse_args,
                    function (expr) {
                        findConstantAndWatchExpressions(expr, $filter, astIsPure);
                        allConstants = allConstants && expr.constant;
                        if (!expr.constant) {
                            argsToWatch.push.apply(argsToWatch, expr.toWatch);
                        }
                    }
                );

                ast.constant = allConstants;
                ast.toWatch = isStatelessFilter ? argsToWatch : [ast];
            break;
            case AST.AssignmentExpression:
                findConstantAndWatchExpressions(ast.left, $filter, astIsPure);
                findConstantAndWatchExpressions(ast.right, $filter, astIsPure);
                ast.constant = ast.left.constant && ast.right.constant;
                ast.toWatch = [ast];
            break;
            case AST.ArrayExpression:
                allConstants = true;
                argsToWatch = [];
                forEach(
                    ast.elements,
                    function (expr) {
                        findConstantAndWatchExpressions(expr, $filter, astIsPure);
                        allConstants = allConstants && expr.constant;
                        if (!expr.constant) {
                            argsToWatch.push.apply(argsToWatch, expr.toWatch);
                        }
                    }
                );
                ast.constant = allConstants;
                ast.toWatch = argsToWatch;
            break;
            case AST.ObjectExpression:
                allConstants = true;
                argsToWatch = [];
                forEach(
                    ast.properties,
                    function (property) {
                        findConstantAndWatchExpressions(property.value, $filter, astIsPure);
                        allConstants = allConstants && property.value.constant && !property.computed;
                        if (!property.value.constant) {
                            argsToWatch.push.apply(argsToWatch, property.value.toWatch);
                        }
                        if (property.computed) {
                            findConstantAndWatchExpressions(property.key, $filter, astIsPure);
                            if (!property.key.constant) {
                                argsToWatch.push.apply(argsToWatch, property.key.toWatch);
                            }
                        }
                    }
                );
                ast.constant = allConstants;
                ast.toWatch = argsToWatch;
            break;
            case AST.ThisExpression:
                ast.constant = false;
                ast.toWatch = [];
            break;
            case AST.LocalsExpression:
                ast.constant = false;
                ast.toWatch = [];
            break;
        }
    }

    function getInputs(body) {
        if (body.length !== 1) { return undefined; }

        var lastExpression = body[0].expression,
            candidate = lastExpression.toWatch;

        if (candidate.length !== 1) { return candidate; }

        return candidate[0] !== lastExpression ? candidate : undefined;
    }

    function assignableAST(ast) {
        if (ast.body.length === 1 && isAssignable(ast.body[0].expression)) {
            return {
                type: AST.AssignmentExpression,
                left: ast.body[0].expression,
                right: { type: AST.NGValueParameter },
                operator: '='
            };
        }

        return undefined;
    }

    function isLiteral(ast) {
        return ast.body.length === 0
            || (ast.body.length === 1 && (ast.body[0].expression.type === AST.Literal || ast.body[0].expression.type === AST.ArrayExpression || ast.body[0].expression.type === AST.ObjectExpression));
    }

    function isConstant(ast) {
        return ast.constant;
    }

    function ASTInterpreter($filter) {
        this.$filter = $filter;
    }

    ASTInterpreter.prototype = {
        compile: function (ast) {
            var self = this,
                assignable,
                assign,
                toWatch,
                inputs,
                expressions = [],
                fn;

            findConstantAndWatchExpressions(ast, self.$filter);

            assignable = assignableAST(ast);

            if (assignable) {
                assign = this.recurse(assignable);
            }

            toWatch = getInputs(ast.body);

            if (toWatch) {
                inputs = [];

                forEach(
                    toWatch,
                    function (watch, key) {
                        var input = self.recurse(watch);

                        input.isPure = watch.isPure;
                        watch.input = input;
                        inputs.push(input);
                        watch.watchId = key;
                    }
                );
            }

            forEach(
                ast.body,
                function (expression) {
                    expressions.push(self.recurse(expression.expression));
                }
            );

            fn = ast.body.length === 0 ? noop :
                 ast.body.length === 1 ? expressions[0] :
                 function (scope, locals) {
                        var lastValue;

                        forEach(
                            expressions,
                            function (exp) {
                                lastValue = exp(scope, locals);
                            }
                        );

                        return lastValue;
                    };

            if (assign) {
                fn.assign = function (scope, value, locals) {
                    return assign(scope, locals, value);
                };
            }

            if (inputs) { fn.inputs = inputs; }

            return fn;
        },

        recurse: function (ast, context, create) {
            var left,
                right,
                self = this,
                args;

            if (ast.input) {
                return this.inputs(ast.input, ast.watchId);
            }

            switch (ast.type) {
                case AST.Literal:
                    return this.value(ast.value, context);
                case AST.UnaryExpression:
                    right = this.recurse(ast.argument);
                    return this['unary' + ast.operator](right, context);
                case AST.BinaryExpression:
                    left = this.recurse(ast.left);
                    right = this.recurse(ast.right);
                    return this['binary' + ast.operator](left, right, context);
                case AST.LogicalExpression:
                    left = this.recurse(ast.left);
                    right = this.recurse(ast.right);
                    return this['binary' + ast.operator](left, right, context);
                case AST.ConditionalExpression:
                    return this['ternary?:'](
                        this.recurse(ast.test),
                        this.recurse(ast.alternate),
                        this.recurse(ast.consequent),
                        context
                    );
                case AST.Identifier:
                    return self.identifier(
                        ast.name,
                        context,
                        create
                    );
                case AST.MemberExpression:
                    left = this.recurse(ast.object, false, !!create);
                    if (!ast.computed) {
                        right = ast.property.name;
                    }
                    if (ast.computed) { right = this.recurse(ast.property); }
                    return ast.computed
                        ? this.computedMember(left, right, context, create)
                        : this.nonComputedMember(left, right, context, create);
                case AST.CallExpression:
                    args = [];

                    forEach(
                        ast.parse_args,
                        function (expr) {
                            args.push(self.recurse(expr));
                        }
                    );

                    if (ast.filter) { right = this.$filter(ast.callee.name); }
                    if (!ast.filter) { right = this.recurse(ast.callee, true); }

                    return ast.filter
                        ? function (scope, locals, assign, inputs) {
                            var values = [],
                                i = 0,
                                value;

                            for (i = 0; i < args.length; i += 1) {
                                values.push(args[i](scope, locals, assign, inputs));
                            }

                            value = right.apply(undefined, values, inputs);

                            return context ? { context: undefined, name: undefined, value: value } : value;
                        }
                        : function (scope, locals, assign, inputs) {
                            var rhs = right(scope, locals, assign, inputs),
                                values = [],
                                i = 0,
                                value;

                            if (rhs.value != null) {    // Leave as is

                                for (i = 0; i < args.length; i += 1) {
                                    values.push(args[i](scope, locals, assign, inputs));
                                }

                                value = rhs.value.apply(rhs.context, values);
                            }

                            return context ? { value: value } : value;
                        };
                case AST.AssignmentExpression:
                    left = this.recurse(ast.left, true, 1);
                    right = this.recurse(ast.right);
                    return function (scope, locals, assign, inputs) {
                        var lhs = left(scope, locals, assign, inputs),
                            rhs = right(scope, locals, assign, inputs);

                        lhs.context[lhs.name] = rhs;

                        return context ? {value: rhs} : rhs;
                    };
                case AST.ArrayExpression:
                    args = [];

                    forEach(
                        ast.elements,
                        function (expr) {
                            args.push(self.recurse(expr));
                        }
                    );

                    return function (scope, locals, assign, inputs) {
                        var value = [],
                            i = 0;

                        for (i = 0; i < args.length; i += 1) {
                            value.push(args[i](scope, locals, assign, inputs));
                        }

                        return context ? {value: value} : value;
                    };
                case AST.ObjectExpression:
                    args = [];

                    forEach(
                        ast.properties,
                        function (property) {
                            if (property.computed) {
                                args.push({
                                    key: self.recurse(property.key),
                                    computed: true,
                                    value: self.recurse(property.value)
                                });
                            } else {
                                args.push({
                                    key: property.key.type === AST.Identifier ? property.key.name : String(property.key.value),
                                    computed: false,
                                    value: self.recurse(property.value)
                                });
                            }
                        }
                    );

                    return function (scope, locals, assign, inputs) {
                        var value = {},
                            i = 0;

                        for (i = 0; i < args.length; i += 1) {
                            if (args[i].computed) {
                                value[args[i].key(scope, locals, assign, inputs)] = args[i].value(scope, locals, assign, inputs);
                            } else {
                                value[args[i].key] = args[i].value(scope, locals, assign, inputs);
                            }
                        }

                        return context ? {value: value} : value;
                    };
                case AST.ThisExpression:
                    return function (scope) {
                        return context ? { value: scope } : scope;
                    };
                case AST.LocalsExpression:
                    return function (scope_na, locals) {
                        return context ? { value: locals } : locals;
                    };
                case AST.NGValueParameter:
                    return function (scope_na, locals_na, assign) {
                        return context ? { value: assign } : assign;
                    };
            }

            msos.console.warn('ng - ASTInterpreter.prototype.recurse -> no matching case!');
            return '';
        },

        'unary+': function (argument, context) {
            return function (scope, locals, assign, inputs) {
                var arg = argument(scope, locals, assign, inputs);

                if (isDefined(arg)) {
                    arg = +arg;
                } else {
                    arg = 0;
                }

                return context ? { value: arg } : arg;
            };
        },
        'unary-': function (argument, context) {
            return function (scope, locals, assign, inputs) {
                var arg = argument(scope, locals, assign, inputs);

                if (isDefined(arg)) {
                    arg = -arg;
                } else {
                    arg = -0;
                }

                return context ? { value: arg } : arg;
            };
        },
        'unary!': function (argument, context) {
            return function (scope, locals, assign, inputs) {
                var arg = !argument(scope, locals, assign, inputs);

                return context ? { value: arg } : arg;
            };
        },
        'binary+': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var lhs = left(scope, locals, assign, inputs),
                    rhs = right(scope, locals, assign, inputs),
                    arg = plusFn(lhs, rhs);

                return context ? { value: arg } : arg;
            };
        },
        'binary-': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var lhs = left(scope, locals, assign, inputs),
                    rhs = right(scope, locals, assign, inputs),
                    arg = (isDefined(lhs) ? lhs : 0) - (isDefined(rhs) ? rhs : 0);

                return context ? { value: arg } : arg;
            };
        },
        'binary*': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var arg = left(scope, locals, assign, inputs) * right(scope, locals, assign, inputs);

                return context ? { value: arg } : arg;
            };
        },
        'binary/': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var arg = left(scope, locals, assign, inputs) / right(scope, locals, assign, inputs);

                return context ? { value: arg } : arg;
            };
        },
        'binary%': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var arg = left(scope, locals, assign, inputs) % right(scope, locals, assign, inputs);

                return context ? { value: arg } : arg;
            };
        },
        'binary===': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var arg = left(scope, locals, assign, inputs) === right(scope, locals, assign, inputs);

                return context ? { value: arg } : arg;
            };
        },
        'binary!==': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var arg = left(scope, locals, assign, inputs) !== right(scope, locals, assign, inputs);

                return context ? { value: arg } : arg;
            };
        },
        'binary==': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var arg = left(scope, locals, assign, inputs) == right(scope, locals, assign, inputs);  // leave as is...

                return context ? { value: arg } : arg;
            };
        },
        'binary!=': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var arg = left(scope, locals, assign, inputs) != right(scope, locals, assign, inputs);  // leave as is...

                return context ? { value: arg } : arg;
            };
        },
        'binary<': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var arg = left(scope, locals, assign, inputs) < right(scope, locals, assign, inputs);

                return context ? { value: arg } : arg;
            };
        },
        'binary>': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var arg = left(scope, locals, assign, inputs) > right(scope, locals, assign, inputs);

                return context ? { value: arg } : arg;
            };
        },
        'binary<=': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var arg = left(scope, locals, assign, inputs) <= right(scope, locals, assign, inputs);

                return context ? { value: arg } : arg;
            };
        },
        'binary>=': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var arg = left(scope, locals, assign, inputs) >= right(scope, locals, assign, inputs);

                return context ? { value: arg } : arg;
            };
        },
        'binary&&': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var arg = left(scope, locals, assign, inputs) && right(scope, locals, assign, inputs);

                return context ? { value: arg } : arg;
            };
        },
        'binary||': function (left, right, context) {
            return function (scope, locals, assign, inputs) {
                var arg = left(scope, locals, assign, inputs) || right(scope, locals, assign, inputs);
                
                return context ? { value: arg } : arg;
            };
        },
        'ternary?:': function (test, alternate, consequent, context) {
            return function (scope, locals, assign, inputs) {
                var arg = test(scope, locals, assign, inputs) ? alternate(scope, locals, assign, inputs) : consequent(scope, locals, assign, inputs);
                
                return context ? { value: arg } : arg;
            };
        },
        value: function (value, context) {
            return function () { return context ? { context: undefined, name: undefined, value: value } : value; };
        },
        identifier: function (name, context, create) {
            return function (scope, locals) {
                var base = locals && (locals.hasOwnProperty(name)) ? locals : scope,
                    value;

                if (create && create !== 1 && base && !(base[name])) {
                    base[name] = {};
                }

                value = base ? base[name] : undefined;

                if (context) {
                    return { context: base, name: name, value: value };
                }

                return value;
            };
        },
        computedMember: function (left, right, context, create) {
            return function (scope, locals, assign, inputs) {
                var lhs = left(scope, locals, assign, inputs),
                    rhs,
                    value;

                if (lhs != null) {  // jshint ignore:line
                    rhs = right(scope, locals, assign, inputs);
                    rhs = String(rhs);

                    if (create && create !== 1) {
                        if (lhs && !(lhs[rhs])) { lhs[rhs] = {}; }
                    }

                    value = lhs[rhs];
                }
                if (context) {
                    return { context: lhs, name: rhs, value: value };
                }

                return value;
            };
        },
        nonComputedMember: function (left, right, context, create) {
            return function (scope, locals, assign, inputs) {
                var lhs = left(scope, locals, assign, inputs),
                    value;

                if (create && create !== 1) {
                    if (lhs && lhs[right] == null) {
                        lhs[right] = {};
                    }
                }

                value = lhs != null ? lhs[right] : undefined;   // jshint ignore:line

                if (context) {
                    return { context: lhs, name: right, value: value };
                }

                return value;
            };
        },
        inputs: function (input, watchId) {
            return function (scope, value, locals, inputs) {
                if (inputs) { return inputs[watchId]; }

                return input(scope, value, locals);
            };
        }
    };

    /**
     * @constructor
     */
    function Parser(lexer_P, $filter_P, options_P) {
        this.ast = new AST(lexer_P, options_P);
        this.astCompiler = new ASTInterpreter($filter_P);   // We only do csp() expensive checks
    };

    Parser.prototype = {

        constructor: Parser,

        parse: function (text) {
            var ast = this.ast.ast(text),
                fn = this.astCompiler.compile(ast);

            fn.literal = isLiteral(ast);
            fn.constant = isConstant(ast);

            return fn;
        }
    };

    function $ParseProvider() {
        var cacheExpensive = createMap(),
            literals_PP = {
                'true': true,
                'false': false,
                'null': null,
                'undefined': undefined
            },
            identStart,
            identContinue;

        this.addLiteral = function (literalName, literalValue) {
            literals_PP[literalName] = literalValue;
        };

        this.setIdentifierFns = function (identifierStart, identifierContinue) {
            identStart = identifierStart;
            identContinue = identifierContinue;

            return this;
        };

        this.$get = ['$filter', function ($filter) {
            var $parseOptions = {
                    csp: true,
                    literals: copy(literals_PP),
                    isIdentifierStart: _.isFunction(identStart) && identStart,
                    isIdentifierContinue: _.isFunction(identContinue) && identContinue
                };

            function expressionInputDirtyCheck(newValue, oldValueOfValue, compareObjectIdentity) {

                if (newValue == null || oldValueOfValue == null) {      // jshint ignore:line
                    return newValue === oldValueOfValue;
                }

                if (typeof newValue === 'object') {

                    newValue = getValueOf(newValue);

                    if (typeof newValue === 'object' && !compareObjectIdentity) {
                        // objects/arrays are not supported - deep-watching them would be too expensive
                        return false;
                    }
                }

                // Primitive or NaN
                return newValue === oldValueOfValue || (newValue !== newValue && oldValueOfValue !== oldValueOfValue);
            }

            function inputsWatchDelegate(scope, listener, objectEquality, parsedExpression, prettyPrintExpression) {
                var inputExpressions = parsedExpression.inputs,
                    lastResult,
                    oldInputValueOf,
                    oldInputValueOfValues = [],
                    oldInputValues = [],
                    i = 0,
                    ii = 0;

                if (inputExpressions.length === 1) {
                    oldInputValueOf = expressionInputDirtyCheck; // init to something unique so that equals check fails
                    inputExpressions = inputExpressions[0];

                    return scope.$watch(
                        function expressionInputWatch(scope) {
                            var newInputValue = inputExpressions(scope);

                            if (!expressionInputDirtyCheck(newInputValue, oldInputValueOf, inputExpressions.isPure)) {
                                lastResult = parsedExpression(scope, undefined, undefined, [newInputValue]);
                                oldInputValueOf = newInputValue && getValueOf(newInputValue);
                            }

                            return lastResult;
                        },
                        listener,
                        objectEquality,
                        prettyPrintExpression
                    );
                }

                for (i = 0, ii = inputExpressions.length; i < ii; i += 1) {
                    oldInputValueOfValues[i] = expressionInputDirtyCheck; // init to something unique so that equals check fails
                    oldInputValues[i] = null;
                }

                return scope.$watch(
                    function expressionInputsWatch(scope) {
                        var changed = false,
                            j = 0,
                            jj = 0,
                            newInputValue;

                        for (j = 0, jj = inputExpressions.length; j < jj; j += 1) {
                            newInputValue = inputExpressions[j](scope);

                            // Once it is true, it stays true
                            changed = changed || !expressionInputDirtyCheck(newInputValue, oldInputValueOfValues[j], inputExpressions[j].isPure);

                            if (changed) {
                                oldInputValues[j] = newInputValue;
                                oldInputValueOfValues[j] = newInputValue && getValueOf(newInputValue);
                            }
                        }

                        if (changed) {
                            lastResult = parsedExpression(scope, undefined, undefined, oldInputValues);
                        }

                        return lastResult;
                    },
                    listener,
                    objectEquality,
                    prettyPrintExpression
                );
            }

            function oneTimeLiteralWatchDelegate(scope, listener, objectEquality, parsedExpression) {
                var unwatch,
                    lastValue;

                unwatch = scope.$watch(
                    function oneTimeWatch(scope) {
                        return parsedExpression(scope);
                    },
                    function oneTimeListener(value, old, scope) {
                        lastValue = value;
                        if (_.isFunction(listener)) {
                            listener(value, old, scope);
                        }
                        if (isAllDefined(value)) {
                            scope.$$postDigest(
                                function () {
                                    if (isAllDefined(lastValue)) { unwatch(); }
                                }
                            );
                        }
                    },
                    objectEquality
                );

                return unwatch;
            }

            function oneTimeWatchDelegate(scope, listener, objectEquality, parsedExpression, prettyPrintExpression) {
                var unwatch,
                    lastValue;

                function oneTimeWatch(scope) {
                    return parsedExpression(scope);
                }

                function oneTimeListener(value, old, scope) {
                    lastValue = value;

                    if (_.isFunction(listener)) {
                        listener(value, old, scope);
                    }

                    if (isDefined(value)) {
                        scope.$$postDigest(
                            function () {
                                if (isDefined(lastValue)) {
                                    unwatch();
                                }
                            }
                        );
                    }
                }

                if (parsedExpression.inputs) {
                    unwatch = inputsWatchDelegate(
                        scope,
                        oneTimeListener,
                        objectEquality,
                        parsedExpression,
                        prettyPrintExpression
                    );
                } else {
                    unwatch = scope.$watch(
                        oneTimeWatch,
                        oneTimeListener,
                        objectEquality
                    );
                }

                return unwatch;
            }

            function isAllDefined(value) {
                var allDefined = true;

                forEach(
                    value,
                    function (val) {
                        if (!isDefined(val)) { allDefined = false; }
                    }
                );

                return allDefined;
            }

            function addInterceptor(parsedExpression, interceptorFn) {
                if (!interceptorFn) { return parsedExpression; }

                var watchDelegate = parsedExpression.$$watchDelegate,
                    useInputs = false,
                    regularWatch =
                        watchDelegate !== oneTimeLiteralWatchDelegate &&
                        watchDelegate !== oneTimeWatchDelegate,
                    fn = regularWatch ? function regularInterceptedExpression(scope, locals, assign, inputs) {
                        var value = useInputs && inputs ? inputs[0] : parsedExpression(scope, locals, assign, inputs);

                        return interceptorFn(value, scope, locals);
                    } : function oneTimeInterceptedExpression(scope, locals, assign, inputs) {
                        var value = parsedExpression(scope, locals, assign, inputs),
                            result = interceptorFn(value, scope, locals);

                        return isDefined(value) ? result : value;
                    };

                // Propagate $$watchDelegates other then inputsWatchDelegate
                useInputs = !parsedExpression.inputs;

                if (watchDelegate && watchDelegate !== inputsWatchDelegate) {
                    fn.$$watchDelegate = watchDelegate;
                    fn.inputs = parsedExpression.inputs;
                } else if (!interceptorFn.$stateful) {
                    fn.$$watchDelegate = inputsWatchDelegate;
                    fn.inputs = parsedExpression.inputs ? parsedExpression.inputs : [parsedExpression];
                }

                if (fn.inputs) {
                    fn.inputs = fn.inputs.map(
                        function (e) {
                            if (e.isPure === PURITY_RELATIVE) {
                                return function depurifier(s) { return e(s); };
                            }

                            return e;
                        }
                    );
                }

                return fn;
            }

            function addInterceptorNoop(interceptorFn) {
                var useInputs = false,
                    fn = function regularInterceptedExpression(scope, locals, assign_na, inputs) {
                            var value = useInputs && inputs ? inputs[0] : undefined;

                            return interceptorFn(value, scope, locals);
                        };

                if (!interceptorFn.$stateful) {
                    fn.$$watchDelegate = inputsWatchDelegate;
                    useInputs = true;
                    fn.inputs = [noop];
                }

                return fn;
            }

            function $parse_Pp(exp, interceptorFn) {
                var parsed_ex,
                    oneTime,
                    cacheKey,
                    cache,
                    lexer,
                    parser,
                    parser_output;

                switch (typeof exp) {

                    case 'string':
                        exp = exp.trim();
                        cacheKey = exp;

                        cache = cacheExpensive;
                        parsed_ex = cache[cacheKey];

                        if (!parsed_ex) {
                            if (exp.charAt(0) === ':' && exp.charAt(1) === ':') {
                                oneTime = true;
                                exp = exp.substring(2);
                            }

                            lexer = new Lexer($parseOptions);
                            parser = new Parser(lexer, $filter, $parseOptions);

                            parsed_ex = parser.parse(exp);

                            if (parsed_ex.constant) {
                                parsed_ex.$$watchDelegate = constantWatchDelegate;
                            } else if (oneTime) {
                                parsed_ex.$$watchDelegate = parsed_ex.literal ? oneTimeLiteralWatchDelegate : oneTimeWatchDelegate;
                            } else if (parsed_ex.inputs) {
                                parsed_ex.$$watchDelegate = inputsWatchDelegate;
                            }

                            cache[cacheKey] = parsed_ex;
                        }

                        if (!interceptorFn)     { parser_output = parsed_ex; }
                        else                    { parser_output = addInterceptor(parsed_ex, interceptorFn); }
                    break;
                    case 'function':
                        if (!interceptorFn)     { parser_output = exp; }
                        else if (exp === noop)  { parser_output = addInterceptorNoop(interceptorFn); }
                        else                    { parser_output = addInterceptor(exp, interceptorFn); }
                    break;
                    default:
                        if (!interceptorFn)     { parser_output = noop; }
                        else                    { parser_output = addInterceptorNoop(interceptorFn); }
                    break;
                }

                return parser_output;
            }

            return $parse_Pp;
        }];
    }

    function qFactory(next_tick, pvdr, error_on_unhandled_rejects) {
        var temp_qf = 'ng - ' + pvdr + ' - qFactory',
            $qMinErr = minErr('$q', TypeError),
            vip = msos_verbose === 'promise',
            queueSize = 0,
            checkQueue = [],
            count = 0,
            pq_cnt = 0,
            s_schedule_qF = null,
            defer_qf,
            reject_qf,
            when_qf,
            resolve_qf,
            all_qf,
            race_qf;

        function Promise(org) {

            count += 1;
            org = org || 'ng_Promise';      // Highlights missing origin

            this.$$prom_state = {
                status: 0,
                name: org + ':' + count,
                processScheduled: false,
                pending: [],
                pur: false
            };

            if (msos_verbose) {
                msos_debug(temp_qf + ' - Promise ++++> created: ' + this.$$prom_state.name);
            }
        }

        function processChecks_qF() {
            var toCheck;

            while (!queueSize && checkQueue.length) {
                toCheck = checkQueue.shift();

                if (!isStateExceptionHandled(toCheck)) {
                    markQStateExceptionHandled(toCheck);
                    if (isError(toCheck.value)) {
                        msos.console.error(temp_qf + ' - processChecks_qF -> error:', toCheck.value);
                    } else {
                        msos.console.warn(temp_qf + ' - processChecks_qF -> Possible unhandled rejection for:', toCheck);
                    }
                }
            }
        }

        function $$reject_qF(promise, reason) {
            var temp_rj = ' - $$reject_qF -> ',
                ps = promise.$$prom_state;

            if (vip) { msos_debug(temp_qf + temp_rj + 'start, name: ' + ps.name + ', status: ' + ps.status); }

            promise.$$prom_state.value = reason;
            promise.$$prom_state.status = 2;
            s_schedule_qF(promise.$$prom_state);

            if (vip) { msos_debug(temp_qf + temp_rj + ' done, name: ' + ps.name + ', status: ' + ps.status); }
        }

        function notifyPromise_qF(promise, progress) {
            var callbacks = promise.$$prom_state.pending;

            if ((promise.$$prom_state.status <= 0) && callbacks && callbacks.length) {
                next_tick(
                    function () {
                        var callback,
                            result,
                            i = 0;

                        for (i = 0; i < callbacks.length; i += 1) {
                            result = callbacks[i][0];
                            callback = callbacks[i][3];

                            try {
                                notifyPromise_qF(result, _.isFunction(callback) ? callback(progress) : progress);
                            } catch (e) {
                                msos.console.error(temp_qf + ' - notifyPromise_qF -> error, for ' + promise.$$prom_state.name, e);
                            }
                        }
                    },
                    promise.$$prom_state.name
                );
            }
        }

        function $$resolve_qF(promise, val) {
            var temp_rs = ' - $$resolve_qF -> ',
                ps = promise.$$prom_state,
                then,
                done = false;

            if (vip) { msos_debug(temp_qf + temp_rs + 'start, name: ' + ps.name + ', status: ' + ps.status); }

            function doResolve(val) {
                if (done) { return; }
                done = true;

                $$resolve_qF(promise, val);
            }

            function doReject(val) {
                if (done) { return; }
                done = true;

                $$reject_qF(promise, val);
            }

            function doNotify(progress) {
                notifyPromise_qF(promise, progress);
            }

            if (isObject(val) || _.isFunction(val)) { then = val.then; }

            if (_.isFunction(then)) {

                ps.status = -1;

                if (msos_verbose) {
                    try {
                        then.call(val, doResolve, doReject, doNotify);
                    } catch (e) {
                        doReject(e);
                    }
                } else {
                    then.call(val, doResolve, doReject, doNotify);
                }

            } else {

                ps.value = val;
                ps.status = 1;
                s_schedule_qF(ps);

            }

            if (vip) { msos_debug(temp_qf + temp_rs + ' done, name: ' + ps.name + ', status: ' + ps.status); }
        }

        function ss_resolve_qF(promise, val) {
            var temp_rp = ' - ss_resolve_qF -> ',
                ps = promise.$$prom_state;

            if (vip) {
                msos_debug(temp_qf + temp_rp + 'start, name: ' + ps.name + ', status: ' + ps.status);
            }

            if (ps.status) {
                msos_debug(temp_qf + temp_rp + ' done, name: ' + ps.name + ', status: ' + ps.status + ' (skipped)');
                return;
            }

            if (val === promise) {
                $$reject_qF(
                    promise,
                    $qMinErr(
                        'qcycle',
                        'Expected promise to be resolved with value other than itself \'{0}\'',
                        val
                    )
                );
            } else {
                $$resolve_qF(promise, val);
            }

            if (vip) {
                msos_debug(temp_qf + temp_rp + ' done, name: ' + ps.name + ', status: ' + ps.status);
            }
        }

        function ss_reject_qF(promise, reason) {
            var temp_rj = ' - ss_reject_qF -> ',
                ps = promise.$$prom_state;

            if (vip) { msos_debug(temp_qf + temp_rj + 'start, name: ' + ps.name + ', status: ' + ps.status); }
    
            if (promise.$$prom_state.status) {

                if (vip) { msos_debug(temp_qf + temp_rj + ' done, name: ' + ps.name + ', status: ' + ps.status + ' (skipped)'); }
                return;
            }

            $$reject_qF(promise, reason);

            if (vip) {
                msos_debug(temp_qf + temp_rj + ' done, name: ' + ps.name + ', status: ' + ps.status);
            }
        }

        function $$process_qF(state) {
            var temp_pq = temp_qf + ' - $$process_qF -> ',
                fn,
                promise,
                pending = state.pending,
                i = 0,
                ii = pending.length,
                pq_debug = '';

            if (vip) {
                msos_debug(temp_pq + 'start, name: ' + state.name + ', status: ' + state.status);
            }

            pq_cnt += 1;

            state.processScheduled = false;
            state.pending = undefined;

            try {

                for (i = 0; i < ii; i += 1) {

                    markQStateExceptionHandled(state);
                    promise = pending[i][0];
                    fn = pending[i][state.status];

                    pq_debug += ', index: ' + i + ', ';

                    try {
                        if (_.isFunction(fn)) {
                            pq_debug += 'for a function (' + (fn.name || 'annonymous') + ')';
                            ss_resolve_qF(promise, fn === noop ? undefined : fn(state.value));
                        } else if (state.status === 1) {
                            pq_debug += 'for status: resolve (status ' + state.status + ')';
                            ss_resolve_qF(promise, state.value);
                        } else {
                            pq_debug += 'for status: reject (status ' + state.status + ')';
                            ss_reject_qF(promise, state.value);
                        }
                    } catch (e) {
                        msos.console.error(temp_pq + 'error' + pq_debug + ' 8===> ', e, fn);
                        ss_reject_qF(promise, e);
                    }
                }

            } finally {
                queueSize -= 1;

                if (error_on_unhandled_rejects && queueSize === 0) {
                    next_tick(
                        processChecks_qF,
                        state.name
                    );
                }
            }

            if (vip) {
                msos_debug(temp_pq + ' done, name: ' + state.name + pq_debug);
            }
        }

        s_schedule_qF = function (state) {
            var temp_sp = temp_qf + ' - s_schedule_qF',
                debug_out = ', name: ' + state.name + ', status: ' + state.status;

            if (vip) { msos_debug(temp_sp + ' -> start' + debug_out); }

            if (error_on_unhandled_rejects && !state.pending && state.status === 2 && !isStateExceptionHandled(state)) {
                if (queueSize === 0 && checkQueue.length === 0) {
                    next_tick(
                        processChecks_qF,
                        state.name
                    );
                }
                checkQueue.push(state);
            }

            if (state.processScheduled || !state.pending) {
                if (vip) { msos_debug(temp_sp + ' ->  done' + debug_out + ' >> is already scheduled!'); }
                return;
            }

            state.processScheduled = true;
            queueSize += 1;

            next_tick(
                function () { $$process_qF(state); },
                state.name
            );

            if (vip) { msos_debug(temp_sp + ' ->  done' + debug_out + ' next_tick called!'); }
        };

        extend(
            Promise.prototype,
            {
                'set': false,
                'then': function (onFulfilled, onRejected, progressBack) {
                    var temp_t = ' - Promise.then -> ',
                        t_name = this.$$prom_state.name,
                        result;

                    if (msos_verbose) {
                        msos_debug(temp_qf + temp_t + 'start: ' + t_name);
                    }

                    if (_.isUndefined(onFulfilled)
                     && _.isUndefined(onRejected)
                     && _.isUndefined(progressBack)) {
                        msos.console.warn(temp_qf + temp_t + ' done: ' + t_name + ', no inputs!');
                        return this;
                    }

                    if (vip) {
                        msos_debug(temp_qf + temp_t + ' checked for ' + t_name + ', inputs:', onFulfilled, onRejected, progressBack);
                    }

                    result = new Promise(t_name);

                    this.set = true;
                    this.$$prom_state.pending = this.$$prom_state.pending || [];
                    this.$$prom_state.pending.push([result, onFulfilled, onRejected, progressBack]);

                    if (this.$$prom_state.status > 0) { s_schedule_qF(this.$$prom_state); }

                    if (msos_verbose) {
                        msos_debug(temp_qf + temp_t + ' done: ' + t_name);
                    }

                    return result;
                },
                'catch': function (callback) {
                    return this.then(null, callback);
                },
                'finally': function (callback, progressBack) {
                    var t_name = this.$$prom_state.name;

                    function resolve(value) {
                        var result = new Promise('finally_resolve' + t_name);

                        ss_resolve_qF(result, value);
                        return result;
                    }

                    function reject(reason) {
                        var result = new Promise('finally_reject' + t_name);

                        ss_reject_qF(result, reason);
                        return result;
                    }

                    function handleCallback(value, resolver) {
                        var callbackOutput = null;

                        if (msos_verbose) {
                            msos_debug(temp_qf + ' - handleCallback -> called, for ' + t_name);
                        }

                        try {
                            if (_.isFunction(callback)) {
                                callbackOutput = callback();
                            }
                        } catch (e) {
                            return reject(e);
                        }

                        if (isPromiseLike(callbackOutput)) {
                            return callbackOutput.then(
                                function () {
                                    return resolver(value);
                                },
                                reject
                            );
                        }

                        return resolver(value);
                    }

                    return this.then(
                        function (value) {
                            return handleCallback(value, resolve);
                        },
                        function (error) {
                            return handleCallback(error, reject);
                        },
                        progressBack
                    );
                }
            }
        );

        function Deferred(org) {
            org = org || 'ng_Deferred';      // Highlights missing origin

            var promise = this.promise = new Promise(org);

            // Non prototype methods necessary to support unbound execution :/
            this.resolve = function (val) {
                ss_resolve_qF(promise, val);
            };
            this.reject = function (reason) {
                ss_reject_qF(promise, reason);
            };
            this.notify = function (progress) {
                notifyPromise_qF(promise, progress);
            };
        }

        function isDeferredLike(in_d) {
            if (!_.isObject(in_d)
             || !_.isFunction(in_d.resolve)
             || !_.isFunction(in_d.reject)
             || !_.isFunction(in_d.notify)) {
                msos.console.error(temp_qf + ' - isDeferredLike -> failed, NgM requires $q.defer(\'module_name_for debugging\') input.');
                return false;
            }
            return true;
        }

        defer_qf = function (origin) {
            return new Deferred(origin);
        };

        reject_qf = function (d, reason) {

            isDeferredLike(d);

            ss_reject_qF(d.promise, reason);

            return d.promise;
        };

        when_qf = function (d, value, callback, errback, progressBack) {

            isDeferredLike(d);

            var d_prom_out = d.promise,
                ps = d_prom_out.$$prom_state;

            if (vip) { msos_debug(temp_qf + ' - when_qf -> start, name: ' + ps.name); }

            ss_resolve_qF(d_prom_out, value);

            if (callback || errback || progressBack) {      // Skip if none are defined (does nothing)
                d.promise.then(callback, errback, progressBack);
            }

            if (vip) { msos_debug(temp_qf + ' - when_qf ->  done, name: ' + ps.name); }

            return d_prom_out;
        };

        resolve_qf = when_qf;

        all_qf = function (d, in_promises) {
            var counter = 0,
                results = _.isArray(in_promises) ? [] : {};

            if (vip) { msos_debug(temp_qf + ' - all_qf -> start.'); }

            isDeferredLike(d);

            forEach(
                in_promises,
                function (promise, key) {
                    var new_name = 'qFactory_all_qf_' + key;

                    counter += 1;

                    when_qf(defer_qf(new_name), promise).then(
                        function (value) {
                            if (results.hasOwnProperty(key)) { return; }
                            results[key] = value;
                            counter -= 1;
                            if (!counter) {
                                ss_resolve_qF(d.promise, results);
                            }
                        },
                        function (reason) {
                            if (results.hasOwnProperty(key)) { return; }
                            ss_reject_qF(d.promise, reason);
                        }
                    );
                }
            );

            if (counter === 0) {
                ss_resolve_qF(d.promise, results);
            }

            if (vip) { msos_debug(temp_qf + ' - all_qf ->  done!'); }

            return d.promise;
        };

        race_qf = function (d, in_promises) {

            if (vip) { msos_debug(temp_qf + ' - race_qf -> start.'); }

            isDeferredLike(d);

            forEach(
                in_promises,
                function (promise, key) {
                    var new_name = 'qFactory_race_qf_' + key;

                    when_qf(defer_qf(new_name), promise).then(
                        d.resolve,
                        d.reject
                    );
                }
            );

            if (vip) { msos_debug(temp_qf + ' - race_qf ->  done!'); }

            return d.promise;
        };

        function $Q(q_resolver, org) {

            if (msos_verbose && !org) {
                msos.console.warn(temp_qf + ' - $Q -> no module origin entered!');
            }

            org = org || 'ng_$Q_origin_na';

            msos_debug(temp_qf + ' - $Q -> start, for: ' + org);

            if (!_.isFunction(q_resolver)) {
                throw $qMinErr(
                    'norslvr',
                    'Expected resolverFn, got \'{0}\'',
                    q_resolver
                );
            }

            var promise = new Promise(org);

            function resolveFn_Q(value) {
                ss_resolve_qF(promise, value);
            }

            function rejectFn_Q(reason) {
                ss_reject_qF(promise, reason);
            }

            q_resolver(resolveFn_Q, rejectFn_Q);

            msos_debug(temp_qf + ' - $Q ->  done: ' + promise.$$prom_state.name);
            return promise;
        }

        // Let's make the instanceof operator work for promises, so that
        // `new $q(fn) instanceof $q` would evaluate to true.
        $Q.prototype = Promise.prototype;

        $Q.defer = defer_qf;
        $Q.reject = reject_qf;
        $Q.when = when_qf;
        $Q.resolve = resolve_qf;
        $Q.all = all_qf;
        $Q.race = race_qf;

        return $Q;
    }

    function $QProvider() {
        var temp_qp = 'ng - $QProvider',
            errorOnUnhandledRejections_Qp = true;

        msos_debug(temp_qp + ' -> start');

        this.$get = ['$rootScope', function ($rootScope) {
            return qFactory(
                    function $Q_nextTick(callback, state_name) {
                        var temp_rs = ' - $Q_nextTick -> ';

                        if (msos_verbose) { msos_debug(temp_qp + temp_rs + 'start: ' + state_name); }
    
                        $rootScope.$evalAsync(
                            callback,
                            { directive_name: '$Q_' + state_name }
                        );

                        if (msos_verbose) { msos_debug(temp_qp + temp_rs + ' done: ' + state_name); }
                    },
                    '$q',
                    errorOnUnhandledRejections_Qp
                );
            }
        ];

        this.errorOnUnhandledRejections = function (value) {
            if (isDefined(value)) {
                errorOnUnhandledRejections_Qp = value;
                return this;
            }

            return errorOnUnhandledRejections_Qp;
        };

        msos_debug(temp_qp + ' -> done!');
    }

    function $$QProvider() {
        var temp_qqp = 'ng - $$QProvider',
            errorOnUnhandledRejections_Qpp = true;
        
        msos_debug(temp_qqp + ' -> start');

        this.$get = ['$browser', function ($browser) {
            return qFactory(
                    function $$Q_nextTick(callback, state_name) {
                        var temp_bd = ' - $$Q_nextTick -> ';

                        if (msos_verbose) {
                            msos_debug(temp_qqp + temp_bd + 'start: ' + state_name);
                        }

                        $browser.defer(callback, state_name);

                        if (msos_verbose) {
                            msos_debug(temp_qqp + temp_bd + ' done: ' + state_name);
                        }
                    },
                    '$$q',
                    errorOnUnhandledRejections_Qpp
                );
            }
        ];

        this.errorOnUnhandledRejections = function (value) {
            if (isDefined(value)) {
                errorOnUnhandledRejections_Qpp = value;
                return this;
            }

            return errorOnUnhandledRejections_Qpp;
        };

        msos_debug(temp_qqp + ' -> done!');
    }

    function $$RAFProvider() { //rAF
        this.$get = ['$window', '$timeout', function ($window, $timeout) {
            var requestAnimationFrame = $window.requestAnimationFrame
                                    || $window.webkitRequestAnimationFrame,
                cancelAnimationFrame = $window.cancelAnimationFrame
                                    || $window.webkitCancelAnimationFrame
                                    || $window.webkitCancelRequestAnimationFrame,
                rafSupported = !!requestAnimationFrame,
                raf;

            msos_debug('ng - $$RAFProvider - $get -> called, animation frame support: ' + rafSupported);

            raf = rafSupported
                ? function (fn) {
                    var id = requestAnimationFrame(fn);
                    return function () {
                        cancelAnimationFrame(id);
                    };
                }
                : function (fn) {
                    var timer = $timeout(fn, 16.66, false); // 1000 / 60 = 16.666
                    return function () {
                        $timeout.cancel(timer);
                    };
                };

            raf.supported = rafSupported;

            return raf;
        }];
    }

    function $$rAFSchedulerFactory($$rAF) {
        var queue,
            cancelFn;

        function nextTick() {
            if (!queue.length) { return; }

            var items = queue.shift(),
                i = 0;

            if (msos_verbose === 'animate') {
                msos_debug('ng - $$rAFSchedulerFactory - nextTick -> called, queue.length: ' + queue.length);
            }

            for (i = 0; i < items.length; i += 1) {
                items[i]();
            }

            if (!cancelFn) {
                $$rAF(function () {
                    if (!cancelFn) { nextTick(); }
                });
            }
        }

        function scheduler(tasks) {
            queue = queue.concat(tasks);
            nextTick();
        }

        queue = scheduler.queue = [];

        scheduler.waitUntilQuiet = function (fn) {
            if (cancelFn) { cancelFn(); }

            cancelFn = $$rAF(function () {
                cancelFn = null;
                fn();
                nextTick();
            });
        };

        return scheduler;
    }

    $$rAFSchedulerFactory.$inject = ['$$rAF'];

    function $RootScopeProvider() {
        var temp_rsp = 'ng - $RootScopeProvider - ',
            TTL_RP = 12,
            $rootScopeMinErr = minErr('$rootScope'),
            lastDirtyWatch = null,
            applyAsyncId = null,
            rvs = (msos_verbose === 'scope');

        this.digestTtl = function (value) {
            if (arguments.length) {
                TTL_RP = value;
            }
            return TTL_RP;
        };

        function createChildScopeClass(parent) {
            function ChildScope() {
                this.$$watchers = this.$$nextSibling = this.$$childHead = this.$$childTail = null;
                this.$$listeners = {};
                this.$$listenerCount = {};
                this.$$watchersCount = 0;
                this.$id = nextScopeUid();
                this.$$ChildScope = null;
                this.$$name = 'child' + this.$id;
            }

            ChildScope.prototype = parent;
            return ChildScope;
        }

        this.$get = ['$parse', '$browser', function ($parse, $browser) {

            var $rootScope_P,
                asyncQueue = [],
                asyncQueuePosition = 0,
                postDigestQueue = [],
                postDigestQueuePosition = 0,
                applyAsyncQueue = [];

            msos_debug(temp_rsp + '$get -> start.');

            function destroyChildScope($event) {
                $event.currentScope.$$destroyed = true;
            }

            function cleanUpScope($scope) {
                if (msie === 9) {
                    // See issue https://github.com/angular/angular.js/issues/10706
                    if ($scope.$$childHead)     { cleanUpScope($scope.$$childHead); }
                    if ($scope.$$nextSibling)   { cleanUpScope($scope.$$nextSibling); }
                }

                $scope.$parent = $scope.$$nextSibling = $scope.$$prevSibling = $scope.$$childHead =
                    $scope.$$childTail = $scope.$root = $scope.$$watchers = null;
            }

            function incrementWatchersCount(current, increment, name) {
                var temp_il = temp_rsp + '$get - incrementWatchersCount -> ';

                if (rvs) {
                    msos_debug(temp_il + 'called, by: ' + name + ', increment by: ' + increment + ', scope: ' + current.$$name);
                }

                do {

                    current.$$watchersCount += increment;
                    current = current.$parent;

                } while (current);
            }

            function decrementListenerCount(current, increment, ev_name) {

                var temp_dl = temp_rsp + '$get - decrementListenerCount -> ';

                msos_debug(temp_dl + 'called, event: ' + ev_name + ', increment: ' + increment + ', scope: ' + current.$$name);

                do {

                    current.$$listenerCount[ev_name] -= increment;

                    if (current.$$listenerCount[ev_name] === 0) {
                        delete current.$$listenerCount[ev_name];
                        msos_debug(temp_dl + 'done, scope: ' + current.$$name);
                    }

                    current = current.$parent;

                } while (current);
            }

            function flushApplyAsync() {
                var temp_fa = '$get - flushApplyAsync -> ',
                    db_note = applyAsyncQueue.length;

                msos.console.info(temp_rsp + temp_fa + 'start, process applyAsyncQueue: ' + db_note);

                while (applyAsyncQueue.length) {
                    if (msos_verbose) {
                        try {
                            applyAsyncQueue.shift()();
                        } catch (e) {
                            msos.console.error(temp_rsp + temp_fa + 'failed:', e);
                        }
                    } else {
                        applyAsyncQueue.shift()();
                    }
                }

                // Experimental (not in std. Angular)
                if (applyAsyncId) {
                    $browser.cancel(applyAsyncId);
                }

                applyAsyncId = null;

                msos.console.info(temp_rsp + temp_fa + ' done!');
            }

            function scheduleApplyAsync() {
                var temp_sa = '$get - scheduleApplyAsync -> ';

                msos.console.info(temp_rsp + temp_sa + 'start.');

                if (applyAsyncId === null) {
                    if (msos_verbose && $rootScope_P.$apply === noop) {
                        msos.console.warn(temp_rsp + temp_sa + '$apply of noop, is this necessary?');
                    }
                    applyAsyncId = $browser.defer(
                        function () {
                            if ($rootScope_P.$apply !== noop) {
                                $rootScope_P.$apply(flushApplyAsync);
                            } else {
                                msos.console.info(temp_rsp + temp_sa + 'skipped $browser.defer for noop.');
                            }
                        },
                        'scheduleApplyAsync'
                    );
                }
                msos.console.info(temp_rsp + temp_sa + 'done!');
            }

            function Scope() {

                this.$id = nextScopeUid();
                this.$$phase = this.$parent = this.$$watchers = this.$$nextSibling = this.$$prevSibling = this.$$childHead = this.$$childTail = null;
                this.$root = this;
                this.$$destroyed = false;
                this.$$listeners = {};
                this.$$listenerCount = {};
                this.$$watchersCount = 0;
                this.$$isolateBindings = null;
                this.$$name = 'scope' + this.$id;
            }

            Scope.prototype = {

                constructor: Scope,

                $new: function (isolate, parent) {
                    var child;

                    parent = parent || this;

                    if (isolate) {
                        child = new Scope();
                        child.$root = this.$root;
                    } else {
                        // Only create a child scope class if somebody asks for one,
                        // but cache it to allow the VM to optimize lookups.
                        if (!this.$$ChildScope) {
                            this.$$ChildScope = createChildScopeClass(this);
                        }

                        child = new this.$$ChildScope();
                    }

                    child.$parent = parent;
                    child.$$prevSibling = parent.$$childTail;

                    if (parent.$$childHead) {
                        parent.$$childTail.$$nextSibling = child;
                        parent.$$childTail = child;
                    } else {
                        parent.$$childHead = parent.$$childTail = child;
                    }

                    // When the new scope is not isolated or we inherit from `this`, and
                    // the parent scope is destroyed, the property `$$destroyed` is inherited
                    // prototypically. In all other cases, this property needs to be set
                    // when the parent scope is destroyed.
                    // The listener needs to be added after the parent is set
                    if (isolate || parent != this) { child.$on('$destroy', destroyChildScope); }    // Leave as is.

                    return child;
                },

                $watch: function (watchExp, listener, objectEquality, prettyPrintExpression) {

                    var temp_w = '$get - Scope.$watch',
                        scope = this,
                        array = [],
                        watcher = {},
                        get = $parse(watchExp),
                        expr_name = _.isFunction(watchExp) ? (watchExp.name || 'unknown') : '';

                    if (rvs) {
                        msos_debug(temp_rsp + temp_w + ' -> start, scope: ' + scope.$$name + ', for: ' + (expr_name || watchExp));
                    }

                    if (get.$$watchDelegate) {

                        if (rvs) {
                            msos_debug(temp_rsp + temp_w + ' ->  done, use get.$$watchDelegate');
                        }

                        return get.$$watchDelegate(scope, listener, objectEquality, get, watchExp);
                    }

                    array = scope.$$watchers;

                    watcher = {
                        fn: noop,
                        last: noop,
                        get: get,
                        exp: prettyPrintExpression || watchExp,
                        eq: !!objectEquality,
                        name: scope.$$name + (expr_name ? '_' + expr_name : '')
                    };

                    lastDirtyWatch = null;

                    if (_.isFunction(listener)) {
                        watcher.fn = listener;
                    }

                    if (!array) {
                        array = scope.$$watchers = [];
                        array.$$digestWatchIndex = -1;
                    }

                    // we use unshift since we use a while loop in $digest for speed.
                    // the while loop reads in reverse order.
                    array.unshift(watcher);
                    array.$$digestWatchIndex += 1;

                    incrementWatchersCount(scope, 1, '$watch');

                    if (rvs) {
                        msos_debug(temp_rsp + temp_w + ' ->  done, scope: ' + scope.$$name + ', $watch count: ' + array.length);
                    }

                    return function deregisterWatch() {
                        if (rvs) {
                            msos_debug(temp_rsp + temp_w + ' - deregisterWatch -> called, for: ' + watcher.name);
                        }

                        var index = arrayRemove(array, watcher);

                        if (index >= 0) {
                            incrementWatchersCount(scope, -1, '$watch');
                            if (index < array.$$digestWatchIndex) {
                                array.$$digestWatchIndex -= 1;
                            }
                        }

                        lastDirtyWatch = null;
                    };
                },

                $watchGroup: function (watchExpressions, listener) {
                    var oldValues = [],     // important: empty arrays, w/ length of watchExpressions.length
                        newValues = [],
                        deregisterFns = [],
                        self = this,
                        changeReactionScheduled = false,
                        firstRun = true,
                        shouldCall = true;

                    // Predefine the size of these arrays
                    oldValues.length = watchExpressions.length;
                    newValues.length = watchExpressions.length;

                    function watchGroupAction() {
                        changeReactionScheduled = false;

                        if (firstRun) {
                            firstRun = false;
                            listener(newValues, newValues, self);
                        } else {
                            listener(newValues, oldValues, self);
                        }
                    }

                    if (!watchExpressions.length) {
                        // No expressions means we call the listener ASAP
                        self.$evalAsync(
                            function () {
                                if (shouldCall) { listener(newValues, newValues, self); }
                            },
                            { directive_name: '$RootScopeProvider_$watchGroup' }
                        );

                        return function deregisterWatchGroup() {
                            shouldCall = false;
                        };
                    }

                    if (watchExpressions.length === 1) {
                        // Special case size of one
                        return self.$watch(watchExpressions[0], function watchGroupAction(value, oldValue, scope) {
                            newValues[0] = value;
                            oldValues[0] = oldValue;
                            listener(newValues, (value === oldValue) ? newValues : oldValues, scope);
                        });
                    }

                    forEach(watchExpressions, function (expr, i) {
                        var unwatchFn = self.$watch(expr, function watchGroupSubAction(value, oldValue) {
                            newValues[i] = value;
                            oldValues[i] = oldValue;
                            if (!changeReactionScheduled) {
                                changeReactionScheduled = true;
                                self.$evalAsync(
                                    watchGroupAction,
                                    { directive_name: '$RootScopeProvider_watchGroupSubAction' }
                                );
                            }
                        });
                        deregisterFns.push(unwatchFn);
                    });

                    return function deregisterWatchGroup() {
                        while (deregisterFns.length) {
                            deregisterFns.shift()();
                        }
                    };
                },

                $watchCollection: function (obj, listener) {

                    var self = this,
                        newValue,
                        oldValue,
                        veryOldValue,
                        trackVeryOldValue = (listener.length > 1),
                        changeDetected = 0,
                        changeDetector,
                        internalArray = [],
                        internalObject = {},
                        initRun = true,
                        oldLength = 0;

                    function $watchCollectionInterceptor(_value) {
                        newValue = _value;

                        var newLength,
                            key,
                            bothNaN,
                            newItem,
                            oldItem,
                            i = 0;

                        // If the new value is undefined, then return undefined as the watch may be a one-time watch
                        if (_.isUndefined(newValue)) { return undefined; }

                        if (!_.isObject(newValue)) {    // if primitive
                            if (oldValue !== newValue) {
                                oldValue = newValue;
                                changeDetected += 1;
                            }
                        } else if (isArrayLike(newValue)) {
                            if (oldValue !== internalArray) {
                                // we are transitioning from something which was not an array into array.
                                oldValue = internalArray;
                                oldLength = oldValue.length = 0;
                                changeDetected += 1;
                            }

                            newLength = newValue.length;

                            if (oldLength !== newLength) {
                                // if lengths do not match we need to trigger change notification
                                changeDetected += 1;
                                oldValue.length = oldLength = newLength;
                            }

                            // copy the items to oldValue and look for changes.
                            for (i = 0; i < newLength; i += 1) {
                                oldItem = oldValue[i];
                                newItem = newValue[i];

                                bothNaN = (oldItem !== oldItem) && (newItem !== newItem);

                                if (!bothNaN && (oldItem !== newItem)) {
                                    changeDetected += 1;
                                    oldValue[i] = newItem;
                                }
                            }
                        } else {
                            if (oldValue !== internalObject) {
                                // we are transitioning from something which was not an object into object.
                                oldValue = internalObject = {};
                                oldLength = 0;
                                changeDetected += 1;
                            }
                            // copy the items to oldValue and look for changes.
                            newLength = 0;

                            for (key in newValue) {     // uses hasOwnProperty.call
                                if (hasOwnProperty.call(newValue, key)) {
                                    newLength += 1;
                                    newItem = newValue[key];
                                    oldItem = oldValue[key];

                                    if (oldValue.hasOwnProperty(key)) {

                                        bothNaN = (oldItem !== oldItem) && (newItem !== newItem);

                                        if (!bothNaN && (oldItem !== newItem)) {
                                            changeDetected += 1;
                                            oldValue[key] = newItem;
                                        }
                                    } else {
                                        oldLength += 1;
                                        oldValue[key] = newItem;
                                        changeDetected += 1;
                                    }
                                }
                            }

                            if (oldLength > newLength) {
                                // we used to have more keys, need to find them and destroy them.
                                changeDetected += 1;

                                for (key in oldValue) {   // uses hasOwnProperty.call
                                    if (!hasOwnProperty.call(newValue, key)) {
                                        oldLength -= 1;
                                        delete oldValue[key];
                                    }
                                }
                            }
                        }
                        return changeDetected;
                    }

                    function $watchCollectionAction() {
                        var i = 0,
                            key;

                        if (initRun) {
                            initRun = false;
                            listener(newValue, newValue, self);
                        } else {
                            listener(newValue, veryOldValue, self);
                        }

                        // make a copy for the next time a collection is changed
                        if (trackVeryOldValue) {
                            if (!_.isObject(newValue)) {
                                //primitive
                                veryOldValue = newValue;
                            } else if (isArrayLike(newValue)) {

                                veryOldValue = [];
                                veryOldValue.length = newValue.length;  // New array with defined length 'newValue.length'

                                for (i = 0; i < newValue.length; i += 1) {
                                    veryOldValue[i] = newValue[i];
                                }
                            } else { // if object
                                veryOldValue = {};

                                for (key in newValue) {   // hasOwnProperty.call used
                                    if (hasOwnProperty.call(newValue, key)) {
                                        veryOldValue[key] = newValue[key];
                                    }
                                }
                            }
                        }
                    }

                    $watchCollectionInterceptor.$stateful = true;

                    changeDetector = $parse(obj, $watchCollectionInterceptor);

                    return self.$watch(changeDetector, $watchCollectionAction);
                },

                $digest: function () {
                    var temp_dg = '$get - Scope - $digest ~~~> ',
                        db_note = '',
                        watch,
                        value,
                        last,
                        fn,
                        get,
                        watchers,
                        processed = 0,
                        dirty = false,
                        ttl = TTL_RP,
                        next,
                        current,
                        target = this,
                        watchLog = [],
                        logIdx,
                        asyncTask;

                    msos_debug(temp_rsp + temp_dg + 'start.');

                    if ($rootScope_P.$$phase) {

                        msos.console.warn(temp_rsp + temp_dg + 'already in progress, phase: ' + $rootScope_P.$$phase);
                        return;
                    }

                    $rootScope_P.$$phase = '$digest';

                    // Check for changes to browser url that happened in sync before the call to $digest
                    $browser.$$checkUrlChange();

                    if (this === $rootScope_P && applyAsyncId !== null) {

                        msos_debug(temp_rsp + temp_dg + 'for root scope and applyAsyncId.');

                        flushApplyAsync();
                    }

                    lastDirtyWatch = null;

                    // "while dirty" loop
                    do {
                        dirty = false;
                        current = target;
                        ttl -= 1;

                        for (asyncQueuePosition = 0; asyncQueuePosition < asyncQueue.length; asyncQueuePosition += 1) {

                            asyncTask = asyncQueue[asyncQueuePosition];

                            if (msos_verbose) {
                                try {

                                    fn = asyncTask.fn;
                                    fn(asyncTask.scope, asyncTask.locals);

                                } catch (e) {
                                    if      (!asyncTask)            { db_note = ' asyncTask'; }
                                    else if (!asyncTask.expression) { db_note = ' asyncTask.expression'; }

                                    db_note += ' at index ' + asyncQueuePosition + ':';

                                    msos.console.error(temp_rsp + temp_dg + 'failed' + db_note, e);
                                }
                            } else {

                                fn = asyncTask.fn;
                                fn(asyncTask.scope, asyncTask.locals);
                            }

                            lastDirtyWatch = null;
                        }

                        if (msos_verbose) {
                            msos_debug(temp_rsp + temp_dg + 'asyncQueue: ' + asyncQueue.length + ' processed.');
                        }

                        // Done, so reset.
                        asyncQueue.length = 0;

                        // "traverse the scopes" loop
                        traverseScopesLoop: do {

                            watchers = current.$$watchers;

                            if (watchers) {

                                // Process our watches
                                watchers.$$digestWatchIndex = watchers.length;

                                while (watchers.$$digestWatchIndex) {

                                    watchers.$$digestWatchIndex -= 1;
                                    watch = watchers[watchers.$$digestWatchIndex];

                                    if (watch) {
                                        get = watch.get;
                                        fn = watch.fn;
                                        last = watch.last;
                                        value = get !== noop ? get(current) : undefined;

                                        if (value !== last
                                         && fn !== noop     // Non-standard to AngularJS
                                         && !(
                                               watch.eq
                                                   ? equals(value, last)
                                                   : (_.isNaN(value) && _.isNaN(last))
                                            )
                                         ) {

                                            dirty = true;
                                            lastDirtyWatch = watch;

                                            watch.last = watch.eq ? copy(value, null) : value;

                                            if (msos_verbose) {
                                                try {
                                                    fn(value, last, current);

                                                    if (ttl < 5) {
                                                        logIdx = 4 - ttl;

                                                        if (!watchLog[logIdx]) { watchLog[logIdx] = []; }

                                                        watchLog[logIdx].push(
                                                            {
                                                                msg: _.isFunction(watch.exp)
                                                                    ? 'fn: ' + (watch.exp.name || watch.exp.toString())
                                                                    : watch.exp,
                                                                newVal: value,
                                                                oldVal: last
                                                            }
                                                        );
                                                    }
                                                } catch (ignore1) {
                                                    db_note = ' at index ' + watchers.$$digestWatchIndex + ' (' + watch.name + '):\n';
                                                    msos.console.error(temp_rsp + temp_dg + 'traverseScopesLoop, failed' + db_note, ignore1);
                                                }
                                            } else {
                                                // Just do it...
                                                fn(value, last, current);
                                            }

                                            if (ttl <= 2 || rvs) {
                                                msos_debug(temp_rsp + temp_dg + watch.name + ' - dirty, for value:', value, last);
                                            }

                                            processed += 1;

                                        } else if (watch === lastDirtyWatch) {
                                            dirty = false;

                                            if (rvs) {
                                                msos_debug(temp_rsp + temp_dg + watch.name + ' - duplicate.');
                                            }

                                            break traverseScopesLoop;

                                        } else {
                                            if (rvs) {
                                                msos_debug(temp_rsp + temp_dg + watch.name + ' - equal, value:', value);
                                            }
                                        }
                                    }
                                }
                            }

                            next = ((current.$$watchersCount && current.$$childHead) || (current !== target && current.$$nextSibling));

                            if (!next) {
                                while (current !== target && !current.$$nextSibling) {
                                    current = current.$parent;
                                    next = current.$$nextSibling;
                                }
                            }

                            current = next;

                        } while (current);

                        // "break traverseScopesLoop;" brings us to here. Add note if we got near max. interations, (or for ?verbose=scope)
                        if (ttl <= 2 || rvs) {
                            db_note = (dirty ? 'dirty' : asyncQueue.length ? 'async(' + asyncQueue.length + ')' : '');
                            msos_debug(temp_rsp + temp_dg + db_note + ' loop: ' + (dirty || asyncQueue.length ? 'yes' : 'no'));
                        }

                        if (ttl <= 0) {
                            db_note = '{0} $digest() iterations reached. Aborting!\n';

                            if (dirty) {
                                db_note = $rootScopeMinErr(
                                    'infdig',
                                    db_note + (msos_verbose ? 'Watchers from last 5 iterations:' : 'Run ?verbose=scope to see watchers:'),
                                    TTL_RP
                                );
                                msos.console.error(temp_rsp + temp_dg + db_note, watchLog);
                            }

                            if (asyncQueue.length) {
                                db_note = $rootScopeMinErr(
                                    'infdig',
                                    db_note + 'Item(s) still to be processed in asyncQueue:',
                                    TTL_RP
                                );
                                msos.console.error(temp_rsp + temp_dg + db_note, asyncQueue.slice(0));

                                // Clear asyncQueue
                                asyncQueue.length = 0;
                            }

                            // Clear Phase
                            $rootScope_P.$$phase = null;

                            flushApplyAsync();
                            return;
                        }

                    } while (dirty || asyncQueue.length);

                    // clearPhase
                    $rootScope_P.$$phase = null;

                    while (postDigestQueuePosition < postDigestQueue.length) {

                        if (msos_verbose) {
                            try {
                                postDigestQueue[postDigestQueuePosition]();
                            } catch (ignore2) {
                                db_note = ' at index ' + postDigestQueuePosition + ':';

                                msos.console.error(temp_rsp + temp_dg + 'failed' + db_note, ignore2);
                            }
                        } else {
                            postDigestQueue[postDigestQueuePosition]();
                        }

                        postDigestQueuePosition += 1;
                    }

                    if (msos_verbose) {
                        msos_debug(temp_rsp + temp_dg + 'postDigestQueue: ' + postDigestQueue.length + ' processed.');
                    }

                    postDigestQueue.length = 0;
                    postDigestQueuePosition = 0;

                    // Check for changes while the digest ran (add v162)
                    $browser.$$checkUrlChange();

                    msos_debug(temp_rsp + temp_dg + 'done, watches: ' + processed + ' processed.');
                },

                $destroy: function () {

                    if (msos_verbose) {
                        msos_debug(temp_rsp + '$get - Scope - $destroy -> called.');
                    }

                    // we can't destroy the root scope or a scope that has been already destroyed
                    if (this.$$destroyed) { return; }

                    var parent = this.$parent,
                        eventName;

                    this.$broadcast('$destroy');
                    this.$$destroyed = true;

                    if (this === $rootScope_P) {
                        // Remove handlers attached to window when $rootScope is removed
                        $browser.$$applicationDestroyed();
                    }

                    incrementWatchersCount(this, -this.$$watchersCount, '$destroy');

                    for (eventName in this.$$listenerCount) {
                        if (this.$$listenerCount.hasOwnProperty(eventName)) {
                            decrementListenerCount(this, this.$$listenerCount[eventName], eventName);
                        }
                    }

                    // sever all the references to parent scopes (after this cleanup, the current scope should
                    // not be retained by any of our references and should be eligible for garbage collection)
                    if (parent && parent.$$childHead === this) { parent.$$childHead = this.$$nextSibling; }
                    if (parent && parent.$$childTail === this) { parent.$$childTail = this.$$prevSibling; }
                    if (this.$$prevSibling) { this.$$prevSibling.$$nextSibling = this.$$nextSibling; }
                    if (this.$$nextSibling) { this.$$nextSibling.$$prevSibling = this.$$prevSibling; }

                    // Disable listeners, watchers and apply/digest methods
                    this.$destroy = this.$digest = this.$apply = this.$evalAsync = this.$applyAsync = noop;
                    this.$on = this.$watch = this.$watchGroup = function () { return noop; };
                    this.$$listeners = {};

                    // Disconnect the next sibling to prevent `cleanUpScope` destroying those too
                    this.$$nextSibling = null;
                    cleanUpScope(this);
                },

                $eval: function (expr, locals) {
                    var temp_ev = '$get - Scope - $eval -> ',
                        type_of = typeof expr,
                        flag_parse = true,
                        parse_expr;

                    // Quick short-circuit (ie: $parse(expr) returns noop)
                    if (expr === undefined || expr === null || expr === '') { flag_parse = false; }
                    if (type_of === 'function' && expr === noop)            { flag_parse = false; }

                    if (msos_verbose) {
                        msos_debug(temp_rsp + temp_ev + 'start, for: ' + (type_of === 'function' ? (expr.name || 'annonymous') : 'func string'));
                    }

                    if (flag_parse) {
                        parse_expr = $parse(expr)(this, locals);
                    }

                    if (msos_verbose) {
                        msos_debug(temp_rsp + temp_ev + ' done, ran $parse: ' + flag_parse);
                    }

                    return parse_expr;
                },

                $evalAsyncSet: false,

                $evalAsync: function (expr, locals) {
                    var temp_sy = '$get - Scope - $evalAsync -> ',
                        queue_obj = {};

                    if (msos_verbose) {
                        msos_debug(temp_rsp + temp_sy + 'start, asyncQueue: ' + asyncQueue.length + ', $$phase: ' + $rootScope_P.$$phase);
                    }

                    // Experimental: start
                    queue_obj = {
                        scope: this,
                        fn: $parse(expr),
                        locals: locals || { directive_name: 'unknown' }
                    };

                    // We try to do this as little as possible, without causing missed digest updates
                    if ($rootScope_P.$evalAsyncSet === false
                     && $rootScope_P.$$phase === null
                     && asyncQueue.length === 0) {
                        $rootScope_P.$evalAsyncSet = true;
                        $browser.defer(
                            function evalasync_browser_defer() {
                                if (asyncQueue.length) {
                                    $rootScope_P.$digest();
                                    $rootScope_P.$evalAsyncSet = false;
                                }
                            },
                            '$evalAsync'
                        );
                    }

                    asyncQueue.push(queue_obj);
                    // Experimental: end

                    if (msos_verbose) {
                        msos_debug(temp_rsp + temp_sy + ' done, asyncQueue: ' + asyncQueue.length + ', added: ' + queue_obj.locals.directive_name);
                    }
                },

                $$postDigest: function (fn) {
                    postDigestQueue.push(fn);
                },

                $apply: function (expr) {
                    var temp_ap = '$get - Scope - $apply #==> ',
                        dbug_app = ', for phase: ';

                    if (!$rootScope_P.$$phase) {
                        $rootScope_P.$$phase = '$apply';
                        dbug_app = ', initiated phase: ';
                    }

                    dbug_app += $rootScope_P.$$phase;

                    msos.console.info(temp_rsp + temp_ap + 'start.');

                    if (msos_verbose) {
                        try {
                            this.$eval(expr);
                        } catch (e) {
                            msos.console.error(temp_rsp + temp_ap + 'error' + dbug_app, e);
                        }
                    } else {
                        this.$eval(expr);
                    }

                    // ClearPhase
                    $rootScope_P.$$phase = null;

                    // Run, if $digest is set
                    if ($rootScope_P.$digest !== noop) {
                        $rootScope_P.$digest();
                    }

                    msos.console.info(temp_rsp + temp_ap + ' done' + dbug_app);
                },

                $applyAsync: function (expr) {
                    var temp_aa = '$get - Scope - $applyAsync -> ',
                        scope = this;

                    msos_debug(temp_rsp + temp_aa + 'start.');

                    function $applyAsyncExpression() {
                        scope.$eval(expr);
                    }

                    if (expr) {
                        applyAsyncQueue.push($applyAsyncExpression);
                    }

                    expr = $parse(expr);
                    scheduleApplyAsync();

                    msos_debug(temp_rsp + temp_aa + ' done!');
                },

                $on: function (name, listener) {
                    var namedListeners = this.$$listeners[name],
                        current,
                        self;

                    if (!namedListeners) {
                        this.$$listeners[name] = namedListeners = [];
                    }

                    namedListeners.push(listener);

                    current = this;

                    do {
                        if (!current.$$listenerCount[name]) {
                            current.$$listenerCount[name] = 0;
                        }
                        current.$$listenerCount[name] += 1;

                        current = current.$parent;

                    } while (current);

                    self = this;

                    return function () {
                        var indexOfListener = namedListeners.indexOf(listener);

                        if (indexOfListener !== -1) {
                            namedListeners[indexOfListener] = null;
                            decrementListenerCount(self, 1, name);
                        }
                    };
                },

                $emit: function (name) {
                    var empty = [],
                        namedListeners,
                        scope = this,
                        stopPropagation = false,
                        event = {
                            name: name,
                            targetScope: scope,
                            stopPropagation: function () {
                                stopPropagation = true;
                            },
                            preventDefault: function () {
                                event.defaultPrevented = true;
                            },
                            defaultPrevented: false
                        },
                        listenerArgs = concat([event], arguments, 1),
                        i,
                        length;

                    do {
                        namedListeners = scope.$$listeners[name] || empty;
                        event.currentScope = scope;
                        for (i = 0, length = namedListeners.length; i < length; i += 1) {

                            // if listeners were deregistered, defragment the array
                            if (!namedListeners[i]) {
                                namedListeners.splice(i, 1);
                                i -= 1;
                                length -= 1;
                                continue;
                            }

                            if (msos_verbose) {
                                try {
                                    // allow all listeners attached to the current scope to run
                                    namedListeners[i].apply(null, listenerArgs);
                                } catch (e) {
                                    msos.console.error(temp_rsp + '$get - Scope - $emit -> failed:', e);
                                }
                            } else {
                                namedListeners[i].apply(null, listenerArgs);
                            }
                        }
                        //if any listener on the current scope stops propagation, prevent bubbling
                        if (stopPropagation) {
                            event.currentScope = null;
                            return event;
                        }
                        //traverse upwards
                        scope = scope.$parent;
                    } while (scope);

                    event.currentScope = null;

                    return event;
                },

                $broadcast: function (name) {
                    var target = this,
                        current = target,
                        next = target,
                        event = {
                            name: name,
                            targetScope: target,
                            preventDefault: function () {
                                event.defaultPrevented = true;
                            },
                            defaultPrevented: false
                        },
                        listenerArgs,
                        listeners,
                        i,
                        length;

                    if (!target.$$listenerCount[name]) { return event; }

                    listenerArgs = concat([event], arguments, 1);

                    // down while you can, then up and next sibling or up and next sibling until back at root
                    while (current) {

                        event.currentScope = current;
                        listeners = current.$$listeners[name] || [];

                        for (i = 0, length = listeners.length; i < length; i += 1) {
                            // if listeners were deregistered, defragment the array
                            if (!listeners[i]) {
                                listeners.splice(i, 1);
                                i -= 1;
                                length -= 1;
                                continue;
                            }

                            if (msos_verbose) {
                                try {
                                    listeners[i].apply(null, listenerArgs);
                                } catch (e) {
                                    msos.console.error(temp_rsp + '$get - Scope - $broadcast -> failed:', e, listenerArgs);
                                }
                            } else {
                                listeners[i].apply(null, listenerArgs);
                            }
                        }

                        next = (
                            (current.$$listenerCount[name] && current.$$childHead)
                         || (current !== target && current.$$nextSibling)
                        );

                        if (!next) {
                            next = current.$$nextSibling;

                            while (current && current !== target && !next) {
                                next = current.$$nextSibling;
                                current = current.$parent;
                            }
                        }

                        current = next;
                    }

                    event.currentScope = null;
                    return event;
                }
            };

            // Notice the $rootScope_P, (keeping it real!)
            $rootScope_P = new Scope();

            msos_debug(temp_rsp + '$get -> done!');

            return $rootScope_P;
        }];
    }

    function $$SanitizeUriProvider() {
        var aHrefSanitizationWhitelist = /^\s*(https?|ftp|mailto|tel|file):/,
            imgSrcSanitizationWhitelist = /^\s*((https?|ftp|file|blob):|data:image\/)/,
            temp_su = 'ng - $$SanitizeUriProvider';

        if (msos_verbose) {
            msos_debug(temp_su + ' -> start.');
        }

        this.aHrefSanitizationWhitelist = function (regexp) {
            if (isDefined(regexp)) {
                aHrefSanitizationWhitelist = regexp;
                return this;
            }
            return aHrefSanitizationWhitelist;
        };

        this.imgSrcSanitizationWhitelist = function (regexp) {
            if (isDefined(regexp)) {
                imgSrcSanitizationWhitelist = regexp;
                return this;
            }
            return imgSrcSanitizationWhitelist;
        };

        this.$get = function () {
            return function sanitizeUri(uri, isImage) {

                msos_debug(temp_su + ' - $get - sanitizeUri -> start, uri: ' + uri);

                var regex = isImage ? imgSrcSanitizationWhitelist : aHrefSanitizationWhitelist,
                    normalizedVal = urlResolve(uri, '$$SanitizeUriProvider - $get').href;

                if (normalizedVal !== '' && !normalizedVal.match(regex)) {
                    msos.console.warn(temp_su + ' - $get - sanitizeUri -> unsafe done, normalized: ' + normalizedVal);
                    return 'unsafe:' + normalizedVal;
                }

                msos_debug(temp_su + ' - $get - sanitizeUri ->  done, uri: ' + uri);
                return uri;
            };
        };

        if (msos_verbose) {
            msos_debug(temp_su + ' -> done!');
        }
    }

    $sceMinErr = minErr('$sce');

    function adjustMatcher(matcher) {
        if (matcher === 'self') {
            return matcher;
        }

        if (_.isString(matcher)) {

            if (matcher.indexOf('***') > -1) {
                throw $sceMinErr('iwcard', 'Illegal sequence *** in string matcher.  String: {0}', matcher);
            }
            matcher = escapeForRegexp(matcher).replace(/\\\*\\\*/g, '.*').replace(/\\\*/g, '[^:/.?&;]*');

            return new RegExp('^' + matcher + '$');
        }

        if (_.isRegExp(matcher)) {
            // The only other type of matcher allowed is a Regexp.
            // Match entire URL / disallow partial matches.
            // Flags are reset (i.e. no global, ignoreCase or multiline)
            return new RegExp('^' + matcher.source + '$');
        }

        throw $sceMinErr('imatcher', 'Matchers may only be "self", string patterns or RegExp objects');
    }

    function adjustMatchers(matchers) {
        var adjustedMatchers = [];
        if (isDefined(matchers)) {
            forEach(matchers, function (matcher) {
                adjustedMatchers.push(adjustMatcher(matcher));
            });
        }
        return adjustedMatchers;
    }

    function $SceDelegateProvider() {

        this.SCE_CONTEXTS = SCE_CONTEXTS;

        // Resource URLs can also be trusted by policy.
        var resourceUrlWhitelist = ['self'],
            resourceUrlBlacklist = [],
            temp_sd = 'ng - $SceDelegateProvider';

        msos_debug(temp_sd + ' -> start.');

        this.resourceUrlWhitelist = function (value) {
            if (arguments.length) {
                resourceUrlWhitelist = adjustMatchers(value);
            }
            return resourceUrlWhitelist;
        };

        this.resourceUrlBlacklist = function (value) {
            if (arguments.length) {
                resourceUrlBlacklist = adjustMatchers(value);
            }
            return resourceUrlBlacklist;
        };

        this.$get = ['$injector', function ($injector) {

            msos_debug(temp_sd + ' - $get -> start.');

            var htmlSanitizer = function () {
                    throw $sceMinErr(
                        'unsafe',
                        'Attempting to use an unsafe value in a safe context.'
                    );
                },
                trustedValueHolderBase,
                byType = {};

            if ($injector.has('$sanitize')) {
                htmlSanitizer = $injector.get('$sanitize');
            }

            function matchUrl(matcher, parsedUrl) {
                if (matcher === 'self') {
                    return urlIsSameOrigin(parsedUrl);
                }
                // definitely a regex.  See adjustMatchers()
                return !!matcher.exec(parsedUrl.href);
            }

            function isResourceUrlAllowedByPolicy(url) {
                var parsedUrl = urlResolve(url.toString(), temp_sd + ' - $get - isResourceUrlAllowedByPolicy'),
                    i,
                    n,
                    allowed = false;

                // Ensure that at least one item from the whitelist allows this url.
                for (i = 0, n = resourceUrlWhitelist.length; i < n; i += 1) {
                    if (matchUrl(resourceUrlWhitelist[i], parsedUrl)) {
                        allowed = true;
                        break;
                    }
                }
                if (allowed) {
                    // Ensure that no item from the blacklist blocked this url.
                    for (i = 0, n = resourceUrlBlacklist.length; i < n; i += 1) {
                        if (matchUrl(resourceUrlBlacklist[i], parsedUrl)) {
                            allowed = false;
                            break;
                        }
                    }
                }
                return allowed;
            }

            function generateHolderType(Base) {
                var holderType = function TrustedValueHolderType(trustedValue) {
                        this.$$unwrapTrustedValue = function () {
                            return trustedValue;
                        };
                    };

                if (Base) {
                    holderType.prototype = new Base();
                }

                holderType.prototype.valueOf = function sceValueOf() {
                    return this.$$unwrapTrustedValue();
                };

                holderType.prototype.toString = function sceToString() {
                    return this.$$unwrapTrustedValue().toString();
                };

                return holderType;
            }

            trustedValueHolderBase = generateHolderType();

            byType[SCE_CONTEXTS.HTML] = generateHolderType(trustedValueHolderBase);
            byType[SCE_CONTEXTS.CSS] = generateHolderType(trustedValueHolderBase);
            byType[SCE_CONTEXTS.URL] = generateHolderType(trustedValueHolderBase);
            byType[SCE_CONTEXTS.JS] = generateHolderType(trustedValueHolderBase);
            byType[SCE_CONTEXTS.RESOURCE_URL] = generateHolderType(byType[SCE_CONTEXTS.URL]);

            function trustAs(type, trustedValue) {
                var Constructor = (byType.hasOwnProperty(type) ? byType[type] : null);
                if (!Constructor) {
                    throw $sceMinErr('icontext', 'Attempted to trust a value in invalid context. Context: {0}; Value: {1}', type, trustedValue);
                }
                if (trustedValue === null || _.isUndefined(trustedValue) || trustedValue === '') {
                    return trustedValue;
                }
                // All the current contexts in SCE_CONTEXTS happen to be strings.  In order to avoid trusting
                // mutable objects, we ensure here that the value passed in is actually a string.
                if (typeof trustedValue !== 'string') {
                    throw $sceMinErr('itype', 'Attempted to trust a non-string value in a content requiring a string: Context: {0}', type);
                }
                return new Constructor(trustedValue);
            }

            function valueOf(maybeTrusted) {
                if (maybeTrusted instanceof trustedValueHolderBase) {
                    return maybeTrusted.$$unwrapTrustedValue();
                }

                return maybeTrusted;
            }

            function getTrusted(type, maybeTrusted) {
                var temp_gt = ' - $get - getTrusted -> ',
                    constructor;

                msos_debug(temp_sd + temp_gt + 'start,\n     type: ' + type + (maybeTrusted ? ', context: ' + maybeTrusted : ''));

                if (maybeTrusted === null || _.isUndefined(maybeTrusted) || maybeTrusted === '') {
                    msos_debug(temp_sd + temp_gt + 'done, for: ' + (maybeTrusted === null ? 'null' : 'undefined'));
                    return maybeTrusted;
                }

                constructor = (byType.hasOwnProperty(type) ? byType[type] : null);

                if (constructor && maybeTrusted instanceof constructor) {
                    msos_debug(temp_sd + temp_gt + 'done, constructor');
                    return maybeTrusted.$$unwrapTrustedValue();
                }
                // If we get here, then we may only take one of two actions.
                // 1. sanitize the value for the requested type, or
                // 2. throw an exception.
                if (type === SCE_CONTEXTS.RESOURCE_URL) {
                    if (isResourceUrlAllowedByPolicy(maybeTrusted)) {
                        msos_debug(temp_sd + temp_gt + 'done, policy');
                        return maybeTrusted;
                    }

                    throw $sceMinErr('insecurl', 'Blocked loading resource from url not allowed by $sceDelegate policy.  URL: {0}', maybeTrusted.toString());
                }

                if (type === SCE_CONTEXTS.HTML) {
                    msos_debug(temp_sd + temp_gt + 'done, sanitizer');
                    return htmlSanitizer(maybeTrusted);
                }

                throw $sceMinErr('unsafe', 'Attempting to use an unsafe value in a safe context.');
            }

            msos_debug(temp_sd + ' - $get -> done!');

            return {
                trustAs: trustAs,
                getTrusted: getTrusted,
                valueOf: valueOf
            };
        }];

        msos_debug(temp_sd + ' -> done!');
    }

    function $SceProvider() {
        var enabled = true;

        this.enabled = function (value) {
            if (arguments.length) {
                enabled = !!value;
            }
            return enabled;
        };

        this.$get = ['$parse', '$sceDelegate', function ($parse, $sceDelegate) {

            var sce = shallowCopy(SCE_CONTEXTS),
                lName;

            sce.isEnabled = function () {
                return enabled;
            };

            sce.trustAs = $sceDelegate.trustAs;
            sce.getTrusted = $sceDelegate.getTrusted;
            sce.valueOf = $sceDelegate.valueOf;

            if (!enabled) {
                sce.trustAs = sce.getTrusted = function (type_na, value) {
                    return value;
                };
                sce.valueOf = identity;
            }

            sce.parseAs = function sceParseAs(type, expr) {
                var parsed = $parse(expr);

                if (parsed.literal && parsed.constant) {
                    return parsed;
                }

                return $parse(
                    expr,
                    function (value) {
                        return sce.getTrusted(type, value);
                    }
                );
            };

            forEach(SCE_CONTEXTS, function (enumValue, name) {
                lName = lowercase(name);
                sce[snakeToCamel('parse_as_' + lName)] = function (expr) {
                    return sce.parseAs(enumValue, expr);
                };
                sce[snakeToCamel('get_trusted_' + lName)] = function (value) {
                    return sce.getTrusted(enumValue, value);
                };
                sce[snakeToCamel('trust_as_' + lName)] = function (value) {
                    return sce.trustAs(enumValue, value);
                };
            });

            return sce;
        }];
    }

    $templateRequestMinErr = minErr('$compile');

    function $TemplateRequestProvider() {
        var httpOptions;

        this.httpOptions = function (val) {
            if (val) {
                httpOptions = val;
                return this;
            }
            return httpOptions;
        };

        this.$get = ['$templateCache', '$http', '$q', '$sce', function ($templateCache, $http, $q, $sce) {
            var temp_tg = 'ng - $TemplateRequestProvider - $get';

            function handleRequestFn(tpl, ignoreRequestError) {
                var transformResponse;

                handleRequestFn.totalPendingRequests += 1;

                if (!_.isString(tpl) || _.isUndefined($templateCache.get(tpl))) {
                    tpl = $sce.getTrustedResourceUrl(tpl);
                }

                transformResponse = $http.defaults && $http.defaults.transformResponse;

                if (_.isArray(transformResponse)) {
                    transformResponse = transformResponse.filter(
                        function (transformer) {
                            return transformer !== defaultHttpResponseTransform;
                        }
                    );
                } else if (transformResponse === defaultHttpResponseTransform) {
                    transformResponse = null;
                }

                function handleError(resp) {
                    if (!ignoreRequestError) {
                        throw $templateRequestMinErr(
                            'tpload',
                            'Failed to load template: {0} (HTTP status: {1} {2})',
                            tpl,
                            resp.status,
                            resp.statusText
                        );
                    } else {
                        msos.console.warn(temp_tg + ' - handleRequestFn -> failed, template: ' + tpl);
                    }

                    return $q.reject($q.defer('ng_reject_handleRequestFn'), resp);
                }

                return $http.get(
                        tpl,
                        extend(
                            {
                                cache: $templateCache,
                                transformResponse: transformResponse
                            },
                            httpOptions
                        )
                    )['finally'](
                        function () {
                            handleRequestFn.totalPendingRequests -= 1;
                            msos_debug(temp_tg + ' - handleRequestFn (finally) -> called, pending: ' + handleRequestFn.totalPendingRequests);
                        }
                    ).then(
                        function (response) {
                            msos_debug(temp_tg + ' - handleRequestFn (then) -> called, pending: ' + handleRequestFn.totalPendingRequests);
                            $templateCache.put(tpl, response.data);
                            return response.data;
                        },
                        handleError
                    );
            }

            handleRequestFn.totalPendingRequests = 0;

            return handleRequestFn;
        }];
    }

    function $TimeoutProvider() {
        var temp_tp = 'ng - $TimeoutProvider';

        this.$get = ['$rootScope', '$browser', '$q', '$$q',
            function ($rootScope,   $browser,   $q,   $$q) {
                var deferreds = {};

                function timeout(fn_to, delay_to, invokeApply_to) {
                    var temp_to = ' - $get - timeout -> ',
                        args = sliceArgs(arguments, 3),
                        skipApply = (isDefined(invokeApply_to) && !invokeApply_to),
                        deferred = (skipApply ? $$q : $q).defer('ng_$TimeoutProvider_$get'),
                        promise = deferred.promise,
                        timeout_id_TP;

                    msos_debug(temp_tp + temp_to + 'start, name: ' + promise.$$prom_state.name + ', delay: ' + delay_to + ', skip apply:', skipApply);

                    if (_.isFunction(fn_to)) {
                        timeout_id_TP = $browser.defer(
                            function () {
                                if (msos_verbose) {
                                    try {
                                        if (fn_to === noop) {
                                            deferred.resolve(undefined);
                                        } else {
                                            deferred.resolve(fn_to.apply(null, args));
                                        }
                                    } catch (e) {
                                        msos.console.error(temp_tp + temp_to + 'failed:', e);
                                        deferred.reject(e);
                                    } finally {
                                        delete deferreds[promise.$$timeoutId];
                                    }
                                } else {
                                    if (fn_to === noop) {
                                        deferred.resolve(undefined);
                                    } else {
                                        deferred.resolve(fn_to.apply(null, args));
                                    }
                                    delete deferreds[promise.$$timeoutId];
                                }

                                if (!skipApply && $rootScope.$apply !== noop) { $rootScope.$apply(); }
                            },
                            promise.$$prom_state.name,
                            delay_to
                        );

                        promise.$$timeoutId = timeout_id_TP;
                        deferreds[timeout_id_TP] = deferred;
                    } else {
                        msos.console.error(temp_tp + temp_to + 'error: no longer compatible with those inputs.');
                    }

                    msos_debug(temp_tp + temp_to + ' done, name: ' + promise.$$prom_state.name);
                    return promise;
                }

                timeout.cancel = function (promise) {
                    var promise_to_id;

                    if (promise && promise.$$timeoutId in deferreds) {
                        promise_to_id = promise.$$timeoutId || '';
                        // Timeout cancels should not report an unhandled promise.
                        markQExceptionHandled(deferreds[promise_to_id].promise);
                        deferreds[promise_to_id].reject('canceled');
                        delete deferreds[promise_to_id];
                        return $browser.cancel(promise_to_id);
                    }

                    return false;
                };
    
                return timeout;
            }
        ];
    }

    function $WindowProvider() {
        this.$get = valueFn(window);
    }

    function $$CookieReader($document) {
        var rawDocument = $document[0] || {},
            lastCookies = {},
            lastCookieString = '';

        function safeGetCookie(rawDocument) {
            try {
                return rawDocument.cookie || '';
            } catch (e) {
                if (msos_verbose) {
                    msos.console.warn('ng - $$CookieReader - safeGetCookie -> failed for:', e);
                }
                return '';
            }
        }

        function safeDecodeURIComponent(str) {
            try {
                return decodeURIComponent(str);
            } catch (e) {
                return str;
            }
        }

        return function () {
            var cookieArray,
                cookie,
                i,
                index,
                name,
                currentCookieString = safeGetCookie(rawDocument);

            if (currentCookieString !== lastCookieString) {
                lastCookieString = currentCookieString;
                cookieArray = lastCookieString.split('; ');
                lastCookies = {};

                for (i = 0; i < cookieArray.length; i+= 1) {
                    cookie = cookieArray[i];

                    index = cookie.indexOf('=');

                    if (index > 0) { //ignore nameless cookies
                        name = safeDecodeURIComponent(cookie.substring(0, index));

                        if (_.isUndefined(lastCookies[name])) {
                            lastCookies[name] = safeDecodeURIComponent(cookie.substring(index + 1));
                        }
                    }
                }
            }
            return lastCookies;
        };
    }

    $$CookieReader.$inject = ['$document'];

    function $$CookieReaderProvider() {
        this.$get = $$CookieReader;
    }

    function orderByFilter($parse) {

        function isPrimitive(value) {
            switch (typeof value) {
                case 'number':      /* falls through */
                case 'boolean':     /* falls through */
                case 'string':
                    return true;
                default:
                    return false;
            }
        }

        function defaultCompare(v1, v2) {
            var result = 0,
                type1 = v1.type,
                type2 = v2.type,
                value1,
                value2;

            if (type1 === type2) {

                value1 = v1.value;
                value2 = v2.value;

                if (type1 === 'string') {
                    // Compare strings case-insensitively
                    value1 = value1.toLowerCase();
                    value2 = value2.toLowerCase();
                } else if (type1 === 'object') {
                    // For basic objects, use the position of the object
                    // in the collection instead of the value
                    if (isObject(value1)) { value1 = v1.index; }
                    if (isObject(value2)) { value2 = v2.index; }
                }

                if (value1 !== value2) {
                    result = value1 < value2 ? -1 : 1;
                }

            } else {
                result = type1 < type2 ? -1 : 1;
            }

            return result;
        }

        function objectValue(value) {
            // If `valueOf` is a valid function use that
            if (_.isFunction(value.valueOf)) {
                value = value.valueOf();
                if (isPrimitive(value)) { return value; }
            }
            // If `toString` is a valid function and not the one from `Object.prototype` use that
            if (hasCustomToString(value)) {
                value = value.toString();
                if (isPrimitive(value)) { return value; }
            }

            return value;
        }

        function getPredicateValue(value, index) {
            var type = typeof value;

            if (value === null) {
                type = 'string';
                value = 'null';
            } else if (type === 'object') {
                value = objectValue(value);
            }

            return { value: value, type: type, index: index };
        }

        function processPredicates(sortPredicates) {
            return sortPredicates.map(
                function (predicate) {
                    var descending = 1,
                        get = identity,
                        key;

                    if (_.isFunction(predicate)) {
                        get = predicate;
                    } else if (_.isString(predicate)) {
                        if ((predicate.charAt(0) === '+' || predicate.charAt(0) === '-')) {
                            descending = predicate.charAt(0) === '-' ? -1 : 1;
                            predicate = predicate.substring(1);
                        }
                        if (predicate !== '') {
                            get = $parse(predicate);
                            if (get.constant) {
                                key = get();
                                get = function (value) { return value[key]; };
                            }
                        }
                    }

                    return { get: get, descending: descending };
                }
            );
        }
  
        return function (array, sortPredicate, reverseOrder, compareFn) {
            var compareValues,
                predicates,
                descending,
                compare_obf;

            if (array == null) { return array; }    // jshint ignore:line

            if (!isArrayLike(array)) {
                throw minErr('orderBy')(
                    'notarray',
                    'Expected array but received: {0}',
                    array
                );
            }

            function getComparisonObject(value_gco, index_gco) {
                return {
                    value: value_gco,
                    tieBreaker: { value: index_gco, type: 'number', index: index_gco },     // in order to compare index value
                    predicateValues: predicates.map(
                        function (predicate) {
                            return getPredicateValue(predicate.get(value_gco), index_gco);
                        }
                    )
                };
            }

            function doComparison(v1, v2) {
                var result = 0,
                    i = 0,
                    ii = predicates.length;

                for (i = 0; i < ii; i += 1) {
                    result = compare_obf(v1.predicateValues[i], v2.predicateValues[i]);

                    if (result) {
                        return result * predicates[i].descending * descending;
                    }
                }

                return (compare_obf(v1.tieBreaker, v2.tieBreaker) || defaultCompare(v1.tieBreaker, v2.tieBreaker)) * descending;
            }

            if (!_.isArray(sortPredicate))  { sortPredicate = [sortPredicate]; }
            if (sortPredicate.length === 0) { sortPredicate = ['+']; }

            predicates = processPredicates(sortPredicate);
            descending = reverseOrder ? -1 : 1;

            // Define the `compare()` function. Use a default comparator if none is specified.
            compare_obf = _.isFunction(compareFn) ? compareFn : defaultCompare;

            // The next three lines are a version of a Swartzian Transform idiom from Perl
            // (sometimes called the Decorate-Sort-Undecorate idiom)
            // See https://en.wikipedia.org/wiki/Schwartzian_transform
            compareValues = Array.prototype.map.call(array, getComparisonObject);
            compareValues.sort(doComparison);

            array = compareValues.map(
                function (item) { return item.value; }
            );

            return array;
        };
    }

    function getTypeForFilter(val) {
        return (val === null) ? 'null' : typeof val;
    }

    orderByFilter.$inject = ['$parse'];

    function deepCompare(actual, expected, comparator, anyPropertyKey, matchAgainstAnyProp, dontMatchWholeObject) {
        var actualType = getTypeForFilter(actual),
            expectedType = getTypeForFilter(expected),
            key,
            expectedVal,
            matchAnyProperty,
            actualVal;

        if ((expectedType === 'string') && (expected.charAt(0) === '!')) {
            return !deepCompare(actual, expected.substring(1), comparator, anyPropertyKey, matchAgainstAnyProp);
        }

        if (actualType === 'function') { return false; }

        if (_.isArray(actual)) {
            return actual.some(
                function (item) {
                    return deepCompare(item, expected, comparator, anyPropertyKey, matchAgainstAnyProp);
                }
            );
        }

        if (actualType === 'object') {
            if (matchAgainstAnyProp) {
                for (key in actual) {
                    if (actual.hasOwnProperty(key)) {
                        if (key.charAt && (key.charAt(0) !== '$') && deepCompare(actual[key], expected, comparator, anyPropertyKey, true)) {
                            return true;
                        }
                    }
                }

                return dontMatchWholeObject ? false : deepCompare(actual, expected, comparator, anyPropertyKey, false);
            }

            if (expectedType === 'object') {
                for (key in expected) {
                    if (expected.hasOwnProperty(key)) {
                        expectedVal = expected[key];
    
                        if (_.isFunction(expectedVal) || _.isUndefined(expectedVal)) { continue; }
    
                        matchAnyProperty = key === anyPropertyKey;
                        actualVal = matchAnyProperty ? actual : actual[key];
    
                        if (!deepCompare(actualVal, expectedVal, comparator, anyPropertyKey, matchAnyProperty, matchAnyProperty)) {
                            return false;
                        }
                    }
                }
                return true;
            }
        }

        return comparator(actual, expected);
    }

    function createPredicateFn(expression, comparator, anyPropertyKey, matchAgainstAnyProp) {
        var shouldMatchPrimitives = _.isObject(expression) && expression.hasOwnProperty(anyPropertyKey),
            predicateFn_cpn;

        if (comparator === true) {
            comparator = equals;
        } else if (!_.isFunction(comparator)) {
            comparator = function (actual, expected) {

                if (_.isUndefined(actual)) {
                    // No substring matching against `undefined`
                    return false;
                }
                if ((actual === null) || (expected === null)) {
                    // No substring matching against `null`; only match against `null`
                    return actual === expected;
                }
                if (_.isObject(expected) || (_.isObject(actual) && !hasCustomToString(actual))) {
                    // Should not compare primitives against objects, unless they have custom `toString` method
                    return false;
                }

                actual =    lowercase(String(actual));
                expected =  lowercase(String(expected));

                return actual.indexOf(expected) !== -1;
            };
        }

        predicateFn_cpn = function (item) {
            if (shouldMatchPrimitives && !isObject(item)) {
                return deepCompare(item, expression[anyPropertyKey], comparator, anyPropertyKey, false);
            }
            return deepCompare(item, expression, comparator, anyPropertyKey, matchAgainstAnyProp);
        };

        return predicateFn_cpn;
    }

    function filterFilter() {
        return function (array, expression, comparator, anyPropertyKey) {

            if (!isArrayLike(array)) {
                if (array === null || array === undefined) {
                    return array;
                }

                throw minErr('filter')(
                    'notarray',
                    'Expected array but received: {0}',
                    array
                );
            }

            anyPropertyKey = anyPropertyKey || '$';

            var expressionType = getTypeForFilter(expression),
                predicateFn_ff,
                matchAgainstAnyProp;

            switch (expressionType) {
                case 'function':
                    predicateFn_ff = expression;
                    break;
                case 'boolean':
                case 'null':
                case 'number':
                case 'string':
                    matchAgainstAnyProp = true;
                    //jshint -W086
                case 'object':
                    //jshint +W086
                    predicateFn_ff = createPredicateFn(expression, comparator, anyPropertyKey, matchAgainstAnyProp);
                    break;
                default:
                    return array;
            }

            return Array.prototype.filter.call(array, predicateFn_ff);
        };
    }

    function parseNumber(numStr) {
        var exponent = 0,
            digits,
            numberOfIntegerDigits = numStr.indexOf(DECIMAL_SEP),
            i = 0,
            j = 0,
            k = numStr.search(/e/i),
            zeros = 0;

        // Decimal point?
        if (numberOfIntegerDigits > -1) { numStr = numStr.replace(DECIMAL_SEP, ''); }

        // Exponential form?
        if (k > 0) {
            // Work out the exponent.
            if (numberOfIntegerDigits < 0) { numberOfIntegerDigits = k; }

            numberOfIntegerDigits += +numStr.slice(k + 1);
            numStr = numStr.substring(0, k);

        // Integer form?
        } else if (numberOfIntegerDigits < 0) {

            numberOfIntegerDigits = numStr.length;
        }

        // Count the number of leading zeros.
        while (numStr.charAt(i) === ZERO_CHAR) { i += 1; }

        zeros = numStr.length;

        if (i === zeros) {
            // The digits are all zero.
            digits = [0];
            numberOfIntegerDigits = 1;
        } else {
            // Count the number of trailing zeros
            zeros -= 1;

            while (numStr.charAt(zeros) === ZERO_CHAR) { zeros -= 1; }

            // Trailing zeros are insignificant so ignore them
            numberOfIntegerDigits -= i;
            digits = [];

            // Convert string to array of digits without leading/trailing zeros.
            for (j = 0; i <= zeros; i += 1, j += 1) {
                digits[j] = +numStr.charAt(i);
            }
        }

        // If the number overflows the maximum allowed digits then use an exponent.
        if (numberOfIntegerDigits > MAX_DIGITS) {
            digits = digits.splice(0, MAX_DIGITS - 1);
            exponent = numberOfIntegerDigits - 1;
            numberOfIntegerDigits = 1;
        }

        return { d: digits, e: exponent, i: numberOfIntegerDigits };
    }

    function roundNumber(parsedNumber, fractionSize, minFrac, maxFrac) {
        var digits = parsedNumber.d,
            fractionLen = digits.length - parsedNumber.i,
            roundAt,
            digit,
            i = 0,
            j = 0,
            k = 0,
            carry;

        // determine fractionSize if it is not specified; `+fractionSize` converts it to a number
        fractionSize = (_.isUndefined(fractionSize)) ? Math.min(Math.max(minFrac, fractionLen), maxFrac) : +fractionSize;

        // The index of the digit to where rounding is to occur
        roundAt = fractionSize + parsedNumber.i;
        digit = digits[roundAt];

        if (roundAt > 0) {
            // Drop fractional digits beyond `roundAt`
            digits.splice(Math.max(parsedNumber.i, roundAt));

            // Set non-fractional digits beyond `roundAt` to 0
            for (j = roundAt; j < digits.length; j += 1) { digits[j] = 0; }

        } else {
            // We rounded to zero so reset the parsedNumber
            fractionLen = Math.max(0, fractionLen);
            parsedNumber.i = 1;
            roundAt = fractionSize + 1;
            digits.length = Math.max(1, roundAt);
            digits[0] = 0;
            for (i = 1; i < roundAt; i += 1) { digits[i] = 0; }
        }

        if (digit >= 5) {
            if (roundAt - 1 < 0) {
                for (k = 0; k > roundAt; k -= 1) {
                    digits.unshift(0);
                    parsedNumber.i += 1;
                }

                digits.unshift(1);
                parsedNumber.i += 1;
            } else {
                digits[roundAt - 1] += 1;
            }
        }

        // Pad out with zeros to get the required fraction length
        for (j = fractionLen; j < Math.max(0, fractionSize); j += 1) { digits.push(0); }

        // Do any carrying, e.g. a digit was rounded up to 10
        carry = digits.reduceRight(
            function (cry, d, i, dgts) {
                d = d + cry;
                dgts[i] = d % 10;
                return Math.floor(d / 10);
            },
            0
        );

        if (carry) {
            digits.unshift(carry);
            parsedNumber.i += 1;
        }
    }

    function formatNumber(number, pattern, groupSep, decimalSep, fractionSize) {

        if (!(_.isString(number) || _.isNumber(number)) || _.isNaN(number)) { return ''; }

        var isInfinity = !isFinite(number),
            isZero = false,
            numStr = String(Math.abs(number)),
            formattedText = '',
            parsedNumber,
            digits,
            integerLen,
            exponent,
            decimals = [],
            groups = [];

        if (isInfinity) {
            formattedText = '\u221e';
        } else {
            parsedNumber = parseNumber(numStr);

            roundNumber(parsedNumber, fractionSize, pattern.minFrac, pattern.maxFrac);

            digits = parsedNumber.d;
            integerLen = parsedNumber.i;
            exponent = parsedNumber.e;

            isZero = digits.reduce(
                function (isZ, d) { return isZ && !d; },
                true
            );

            // Pad zeros for small numbers
            while (integerLen < 0) {
                digits.unshift(0);
                integerLen += 1;
            }

            // extract decimals digits
            if (integerLen > 0) {
                decimals = digits.splice(integerLen, digits.length);
            } else {
                decimals = digits;
                digits = [0];
            }

            // format the integer digits with grouping separators
            if (digits.length >= pattern.lgSize) {
                groups.unshift(digits.splice(-pattern.lgSize, digits.length).join(''));
            }

            while (digits.length > pattern.gSize) {
                groups.unshift(digits.splice(-pattern.gSize, digits.length).join(''));
            }

            if (digits.length) {
                groups.unshift(digits.join(''));
            }

            formattedText = groups.join(groupSep);

            // append the decimal digits
            if (decimals.length) {
                formattedText += decimalSep + decimals.join('');
            }

            if (exponent) {
                formattedText += 'e+' + exponent;
            }
        }

        if (number < 0 && !isZero) {
            return pattern.negPre + formattedText + pattern.negSuf;
        }

        return pattern.posPre + formattedText + pattern.posSuf;
    }

    function currencyFilter($locale) {
        var formats = $locale.NUMBER_FORMATS;

        return function (amount, currencySymbol, fractionSize) {
            if (_.isUndefined(currencySymbol)) {
                currencySymbol = formats.CURRENCY_SYM;
            }

            if (_.isUndefined(fractionSize)) {
                fractionSize = formats.PATTERNS[1].maxFrac;
            }

            // if null or undefined pass it through
            return (amount == null)     // jshint ignore:line
                ? amount
                : formatNumber(
                    amount,
                    formats.PATTERNS[1],
                    formats.GROUP_SEP,
                    formats.DECIMAL_SEP,
                    fractionSize
                ).replace(/\u00A4/g, currencySymbol);
        };
    }

    currencyFilter.$inject = ['$locale'];

    function numberFilter($locale) {
        var formats = $locale.NUMBER_FORMATS;
        return function (number, fractionSize) {

            // if null or undefined pass it through
            return (number == null)     // jshint ignore:line
                ? number
                : formatNumber(
                    number,
                    formats.PATTERNS[0],
                    formats.GROUP_SEP,
                    formats.DECIMAL_SEP,
                    fractionSize
                );
        };
    }

    numberFilter.$inject = ['$locale'];

    function jsonFilter() {
        return function (object, spacing) {
            if (_.isUndefined(spacing)) {
                spacing = 2;
            }
            return toJson(object, spacing);
        };
    }

    function sliceFn(input, begin, end) {
        if (_.isString(input)) { return input.slice(begin, end); }

        return slice.call(input, begin, end);
    }

    function limitToFilter() {
        return function (input, limit, begin) {

            if (Math.abs(Number(limit)) === Infinity) {
                limit = Number(limit);
            } else {
                limit = parseInt(limit, 10);
            }
            if (_.isNaN(limit)) { return input; }

            if (_.isNumber(input)) { input = input.toString(); }
            if (!isArrayLike(input)) { return input; }

            begin = (!begin || _.isNaN(begin)) ? 0 : parseInt(begin, 10);
            begin = (begin < 0) ? Math.max(0, input.length + begin) : begin;

            if (limit >= 0) {
                return sliceFn(input, begin, begin + limit);
            }

            if (begin === 0) {
                return sliceFn(input, limit, input.length);
            }

            return sliceFn(input, Math.max(0, begin + limit), begin);
        };
    }

    function padNumber(num, digits, trim_flag, negWrap) {
        var neg = '';

        if (num < 0 || (negWrap && num <= 0)) {
            if (negWrap) {
                num = -num + 1;
            } else {
                num = -num;
                neg = '-';
            }
        }

        num = String(num);

        while (num.length < digits) { num = ZERO_CHAR + num; }

        if (trim_flag) {
            num = num.substr(num.length - digits);
        }

        return neg + num;
    }

    function dateGetter(name, size, offset, trim_flag, negWrap) {
        offset = offset || 0;
        return function (date) {
            var value = date['get' + name]();
            if (offset > 0 || value > -offset) { value += offset; }
            if (value === 0 && offset === -12) { value = 12; }
            return padNumber(value, size, trim_flag, negWrap);
        };
    }

    function dateStrGetter(name, shortForm, standAlone) {
        return function (date, formats) {
            var value = date['get' + name](),
                propPrefix = (standAlone ? 'STANDALONE' : '') + (shortForm ? 'SHORT' : ''),
                get = uppercase(propPrefix + name);

            return formats[get][value];
        };
    }

    function timeZoneGetter(date_na, formats_na, offset) {
        var zone = -1 * offset,
            paddedZone = (zone >= 0) ? "+" : "";

        paddedZone += padNumber(Math[zone > 0 ? 'floor' : 'ceil'](zone / 60), 2) + padNumber(Math.abs(zone % 60), 2);

        return paddedZone;
    }

    function getFirstThursdayOfYear(year) {
        // 0 = index of January
        var dayOfWeekOnFirst = (new Date(year, 0, 1)).getDay();
        // 4 = index of Thursday (+1 to account for 1st = 5)
        // 11 = index of *next* Thursday (+1 account for 1st = 12)
        return new Date(year, 0, ((dayOfWeekOnFirst <= 4) ? 5 : 12) - dayOfWeekOnFirst);
    }

    function getThursdayThisWeek(datetime) {
        return new Date(datetime.getFullYear(), datetime.getMonth(),
        // 4 = index of Thursday
        datetime.getDate() + (4 - datetime.getDay()));
    }

    function weekGetter(size) {
        return function (date) {
            var firstThurs = getFirstThursdayOfYear(date.getFullYear()),
                thisThurs = getThursdayThisWeek(date),
                diff = +thisThurs - +firstThurs,
                result = 1 + Math.round(diff / 6.048e8); // 6.048e8 ms per week

            return padNumber(result, size);
        };
    }

    function ampmGetter(date, formats) {
        return date.getHours() < 12 ? formats.AMPMS[0] : formats.AMPMS[1];
    }

    function eraGetter(date, formats) {
        return date.getFullYear() <= 0 ? formats.ERAS[0] : formats.ERAS[1];
    }

    function longEraGetter(date, formats) {
        return date.getFullYear() <= 0 ? formats.ERANAMES[0] : formats.ERANAMES[1];
    }

    DATE_FORMATS = {
        yyyy: dateGetter('FullYear', 4, 0, false, true),
        yy: dateGetter('FullYear', 2, 0, true, true),
        y: dateGetter('FullYear', 1, 0, false, true),
        MMMM: dateStrGetter('Month'),
        MMM: dateStrGetter('Month', true),
        MM: dateGetter('Month', 2, 1),
        M: dateGetter('Month', 1, 1),
        LLLL: dateStrGetter('Month', false, true),
        dd: dateGetter('Date', 2),
        d: dateGetter('Date', 1),
        HH: dateGetter('Hours', 2),
        H: dateGetter('Hours', 1),
        hh: dateGetter('Hours', 2, -12),
        h: dateGetter('Hours', 1, -12),
        mm: dateGetter('Minutes', 2),
        m: dateGetter('Minutes', 1),
        ss: dateGetter('Seconds', 2),
        s: dateGetter('Seconds', 1),
        sss: dateGetter('Milliseconds', 3),
        EEEE: dateStrGetter('Day'),
        EEE: dateStrGetter('Day', true),
        a: ampmGetter,
        Z: timeZoneGetter,
        ww: weekGetter(2),
        w: weekGetter(1),
        G: eraGetter,
        GG: eraGetter,
        GGG: eraGetter,
        GGGG: longEraGetter
    };

    function dateFilter($locale) {

        function jsonStringToDate(string) {
            var match,
                date,
                tzHour = 0,
                tzMin = 0,
                dateSetter,
                timeSetter,
                h,
                m,
                s,
                ms;

            match = string.match(R_ISO8601_STR);

            if (match) {
                date = new Date(0);
                dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear;
                timeSetter = match[8] ? date.setUTCHours : date.setHours;

                if (match[9]) {
                    tzHour = parseInt(match[9] + match[10], 10);
                    tzMin =  parseInt(match[9] + match[11], 10);
                }
                dateSetter.call(date, parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10));

                h = parseInt(match[4] || 0, 10) - tzHour;
                m = parseInt(match[5] || 0, 10) - tzMin;
                s = parseInt(match[6] || 0, 10);
                ms = Math.round(parseFloat('0.' + (match[7] || 0)) * 1000);

                timeSetter.call(date, h, m, s, ms);
                return date;
            }
            return string;
        }

        return function (date, format, timezone) {
            var text = '',
                parts = [],
                fn,
                match,
                dateTimezoneOffset;

            format = format || 'mediumDate';
            format = $locale.DATETIME_FORMATS[format] || format;

            if (_.isString(date)) {
                date = NUMBER_STRING.test(date) ? parseInt(date, 10) : jsonStringToDate(date);
            }

            if (_.isNumber(date)) {
                date = new Date(date);
            }

            if (!_.isDate(date) || !_.isFinite(date.getTime())) {
                return date;
            }

            while (format) {
                match = DATE_FORMATS_SPLIT.exec(format);
                if (match) {
                    parts = concat(parts, match, 1);
                    format = parts.pop();
                } else {
                    parts.push(format);
                    format = null;
                }
            }

            dateTimezoneOffset = date.getTimezoneOffset();

            if (timezone) {
                dateTimezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
                date = convertTimezoneToLocal(date, timezone, true);
            }

            forEach(parts, function (value) {
                fn = DATE_FORMATS[value];
                text += fn
                    ? fn(date, $locale.DATETIME_FORMATS, dateTimezoneOffset)
                    : value === '\'\'' ? '\'' : value.replace(/(^'|'$)/g, '').replace(/''/g, '\'');
            });

            return text;
        };
    }

    dateFilter.$inject = ['$locale'];

    function $FilterProvider($provide) {
        var suffix = 'Filter',
            lowercaseFilter = valueFn(lowercase),
            uppercaseFilter = valueFn(uppercase);

        function registerFilters(name, factory) {

            if (_.isObject(name)) {
                var filters = {};
                forEach(name, function (filter, key) {
                    filters[key] = registerFilters(key, filter);
                });
                return filters;
            }

            return $provide.factory(name + suffix, factory);
        }

        this.register = registerFilters;

        this.$get = ['$injector', function ($injector) {
            return function (name) {
                return $injector.get(name + suffix);
            };
        }];

        registerFilters('currency', currencyFilter);
        registerFilters('date', dateFilter);
        registerFilters('filter', filterFilter);
        registerFilters('json', jsonFilter);
        registerFilters('limitTo', limitToFilter);
        registerFilters('lowercase', lowercaseFilter);
        registerFilters('number', numberFilter);
        registerFilters('orderBy', orderByFilter);
        registerFilters('uppercase', uppercaseFilter);
    }

    $FilterProvider.$inject = ['$provide'];

    function ngDirective(directive) {
        var output_fn;

        if (_.isFunction(directive)) {
            directive = {
                link: directive
            };
        }
        directive.restrict = directive.restrict || 'AC';

        output_fn = valueFn(directive);
        output_fn.$$moduleName = 'ng';

        return output_fn;
    }

    htmlAnchorDirective = valueFn({
        restrict: 'E',
        compile: function (element_na, attr) {

            if (!attr.href && !attr.xlinkHref) {
                return function (scope_na, element) {

                    // If the linked element is not an anchor tag anymore, do nothing
                    if (element[0].nodeName.toLowerCase() !== 'a') { return; }

                    // SVGAElement does not use the href attribute, but rather the 'xlinkHref' attribute.
                    var href = ngto_string.call(element.prop('href')) === '[object SVGAnimatedString]' ? 'xlink:href' : 'href';

                    element.on('click', function (event) {
                        // if we have no href url, then don't navigate anywhere.
                        if (!element.attr(href)) {
                            event.preventDefault();
                        }
                    });
                };
            }

            return undefined;
        }
    });

    htmlAnchorDirective.$$moduleName = 'ng';

    // boolean attrs are evaluated
    forEach(BOOLEAN_ATTR, function (propName, attrName) {
        // binding to multiple is not supported
        if (propName === "multiple") { return; }

        var normalized = directiveNormalize('ng-' + attrName),
            linkFn;

        function defaultLinkFn(scope, element_na, attr) {
            scope.$watch(
                attr[normalized],
                function ngBooleanAttrWatchAction(value) {
                    attr.$set(attrName, !!value);
                }
            );
        }

        if (propName === 'checked') {
            linkFn = function (scope, element, attr) {
                // ensuring ngChecked doesn't interfere with ngModel when both are set on the same input
                if (attr.ngModel !== attr[normalized]) {
                    defaultLinkFn(scope, element, attr);
                }
            };
        } else {
            linkFn = defaultLinkFn;
        }
  
        ngAttributeAliasDirectives[normalized] = function () {
            return {
                restrict: 'A',
                priority: 100,
                link: linkFn
            };
        };
    });

    // aliased input attrs are evaluated
    forEach(ALIASED_ATTR, function (htmlAttr_na, ngAttr) {
        ngAttributeAliasDirectives[ngAttr] = function () {
            return {
                priority: 100,
                link: function (scope, element_na, attr) {
                    //special case ngPattern when a literal regular expression value
                    //is used as the expression (this way we don't have to watch anything).
                    if (ngAttr === 'ngPattern' && attr.ngPattern.charAt(0) === '/') {
                        var match = attr.ngPattern.match(REGEX_STRING_REGEXP);
                        if (match) {
                            attr.$set('ngPattern', new RegExp(match[1], match[2]));
                            return;
                        }
                    }

                    scope.$watch(attr[ngAttr], function ngAttrAliasWatchAction(value) {
                        attr.$set(ngAttr, value);
                    });
                }
            };
        };
    });

    forEach(['src', 'srcset', 'href'], function (attrName) {
        var normalized = directiveNormalize('ng-' + attrName);
        ngAttributeAliasDirectives[normalized] = function () {
            return {
                priority: 99,
                // it needs to run after the attributes are interpolated
                link: function (scope_na, element, attr) {
                    var propName = attrName,
                        name = attrName;

                    if (attrName === 'href' && ngto_string.call(element.prop('href')) === '[object SVGAnimatedString]') {
                        name = 'xlinkHref';
                        attr.$attr[name] = 'xlink:href';
                        propName = null;
                    }

                    attr.$observe(normalized, function (value) {
                        if (!value) {
                            if (attrName === 'href') {
                                attr.$set(name, null);
                            }
                            return;
                        }

                        attr.$set(name, value);

                        // on IE, if "ng:src" directive declaration is used and "src" attribute doesn't exist
                        // then calling element.setAttribute('src', 'foo') doesn't do anything, so we need
                        // to set the property as well to achieve the desired effect.
                        // we use attr[attrName] value since $set can sanitize the url.
                        if (msie && propName) { element.prop(propName, attr[name]); }
                    });
                }
            };
        };
    });

    if (msos_verbose) {
        msos_debug('ng - ngAttributeAliasDirectives -> created,\n     directives:', _.keys(ngAttributeAliasDirectives));
    }

    function isObjectEmpty(obj) {
        var prop;

        if (obj) {
            for (prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    return false;
                }
            }
        }

        return true;
    }

    function setupValidity(instance) {
        instance.$$classCache = {};

        instance.$$classCache[VALID_CLASS] = instance.$$element.hasClass(VALID_CLASS);
        instance.$$classCache[INVALID_CLASS] = !instance.$$classCache[VALID_CLASS];
    }

    function addSetValidityMethod(context) {
        var clazz = context.clazz,
            set = context.set,
            unset = context.unset;

        function createAndSet(ctrl, name, value, controller) {

            if (!ctrl[name]) { ctrl[name] = {}; }

            set(ctrl[name], value, controller);
        }

        function unsetAndCleanup(ctrl, name, value, controller) {

            if (ctrl[name]) {
                unset(ctrl[name], value, controller);
            }

            if (isObjectEmpty(ctrl[name])) {
                ctrl[name] = undefined;
            }
        }

        function cachedToggleClass(ctrl, className, switchValue) {
            if (switchValue && !ctrl.$$classCache[className]) {
                ctrl.$$animate.addClass(ctrl.$$element, className);
                ctrl.$$classCache[className] = true;
            } else if (!switchValue && ctrl.$$classCache[className]) {
                ctrl.$$animate.removeClass(ctrl.$$element, className);
                ctrl.$$classCache[className] = false;
            }
        }

        function toggleValidationCss(ctrl, validationErrorKey, isValid) {
            validationErrorKey = validationErrorKey ? '-' + snake_case(validationErrorKey, '-') : '';

            cachedToggleClass(ctrl, VALID_CLASS + validationErrorKey, isValid === true);
            cachedToggleClass(ctrl, INVALID_CLASS + validationErrorKey, isValid === false);
        }

        clazz.prototype.$setValidity = function (validationErrorKey, state, controller) {
            var combinedState;

            if (_.isUndefined(state)) {
                createAndSet(this, '$pending', validationErrorKey, controller);
            } else {
                unsetAndCleanup(this, '$pending', validationErrorKey, controller);
            }

            if (!_.isBoolean(state)) {
                unset(this.$error,      validationErrorKey, controller);
                unset(this.$$success,   validationErrorKey, controller);
            } else {
                if (state) {
                    unset(this.$error,      validationErrorKey, controller);
                      set(this.$$success,   validationErrorKey, controller);
                } else {
                      set(this.$error,      validationErrorKey, controller);
                    unset(this.$$success,   validationErrorKey, controller);
                }
            }

            if (this.$pending) {
                cachedToggleClass(this, PENDING_CLASS, true);
                this.$valid = this.$invalid = undefined;
                toggleValidationCss(this, '', null);
            } else {
                cachedToggleClass(this, PENDING_CLASS, false);
                this.$valid = isObjectEmpty(this.$error);
                this.$invalid = !this.$valid;
                toggleValidationCss(this, '', this.$valid);
            }
    
            if (this.$pending && this.$pending[validationErrorKey]) {
                combinedState = undefined;
            } else if (this.$error[validationErrorKey]) {
                combinedState = false;
            } else if (this.$$success[validationErrorKey]) {
                combinedState = true;
            } else {
                combinedState = null;
            }

            toggleValidationCss(this, validationErrorKey, combinedState);

            if (this.$$parentForm.$setValidity !== noop) {
                this.$$parentForm.$setValidity(validationErrorKey, combinedState, this);
            }
        };
    }

    function FormController($element, $attrs, $scope, $animate, $interpolate) {
        this.$$controls = [];

        // init state
        this.$error = {};
        this.$$success = {};
        this.$pending = undefined;
        this.$name = $interpolate($attrs.name || $attrs.ngForm || '')($scope);
        this.$dirty = false;
        this.$pristine = true;
        this.$valid = true;
        this.$invalid = false;
        this.$submitted = false;
        this.$$parentForm = nullFormCtrl;

        this.$$element = $element;
        this.$$animate = $animate;

        setupValidity(this);
    }

    FormController.prototype = {

        $rollbackViewValue: function () {
            forEach(
                this.$$controls,
                function (control) {
                    control.$rollbackViewValue();
                }
            );
        },
        $commitViewValue: function () {
            forEach(
                this.$$controls,
                function (control) {
                    control.$commitViewValue();
                }
            );
        },
        $addControl: function (control) {
            // Breaking change - before, inputs whose name was "hasOwnProperty" were quietly ignored
            // and not added to the scope.  Now we throw an error.
            assertNotHasOwnProperty(control.$name, 'input');
            this.$$controls.push(control);

            if (control.$name) {
                this[control.$name] = control;
            }

            control.$$parentForm = this;
        },
        $$renameControl: function (control, newName) {
            var oldName = control.$name;

            if (this[oldName] === control) {
                delete this[oldName];
            }

            this[newName] = control;
            control.$name = newName;
        },
        $removeControl: function (control) {
            if (control.$name && this[control.$name] === control) {
                delete this[control.$name];
            }
            forEach(
                this.$pending,
                function (value_na, name) {
                    this.$setValidity(name, null, control);
                },
                this
            );
            forEach(
                this.$error,
                function (value_na, name) {
                    this.$setValidity(name, null, control);
                },
                this
            );
            forEach(
                this.$$success,
                function (value_na, name) {
                    this.$setValidity(name, null, control);
                },
                this
            );

            arrayRemove(this.$$controls, control);
            control.$$parentForm = nullFormCtrl;
        },
        $setDirty: function () {
            this.$$animate.removeClass(this.$$element, PRISTINE_CLASS);
            this.$$animate.addClass(this.$$element, DIRTY_CLASS);
            this.$dirty = true;
            this.$pristine = false;
            if (this.$$parentForm.$setDirty !== noop) {     // noop would do nothing.
                this.$$parentForm.$setDirty();
            }
        },
        $setPristine: function () {
            this.$$animate.setClass(this.$$element, PRISTINE_CLASS, DIRTY_CLASS + ' ' + SUBMITTED_CLASS);
            this.$dirty = false;
            this.$pristine = true;
            this.$submitted = false;
            forEach(
                this.$$controls,
                function (control) {
                    control.$setPristine();
                }
            );
        },
        $setUntouched: function () {
            forEach(
                this.$$controls,
                function (control) {
                    control.$setUntouched();
                }
            );
        },
        $setSubmitted: function () {
            this.$$animate.addClass(this.$$element, SUBMITTED_CLASS);
            this.$submitted = true;
            if (this.$$parentForm.$setSubmitted !== noop) {
                this.$$parentForm.$setSubmitted();
            }
        }
    };

    addSetValidityMethod(
        {
            clazz: FormController,
            set: function (object, property, controller) {
                var list = object[property],
                    index;

                if (!list) {
                    object[property] = [controller];
                } else {
                    index = list.indexOf(controller);
                    if (index === -1) {
                        list.push(controller);
                    }
                }
            },
            unset: function (object, property, controller) {
                var list = object[property];

                if (!list) { return; }

                arrayRemove(list, controller);

                if (list.length === 0) {
                    delete object[property];
                }
            }
        }
    );

    FormController.$inject = ['$element', '$attrs', '$scope', '$animate', '$interpolate'];

    formDirectiveFactory = function (isNgForm) {
        var temp_fd = 'ng - formDirectiveFactory';

        function form_dir($timeout, $parse) {

            function getSetter(expression) {
                if (expression === '') {
                    // Create an assignable expression, so forms with an empty name can be renamed later
                    return $parse('this[""]').assign;
                }
                return $parse(expression).assign || noop;
            }

            var formDirective_F = {
                name: 'form',
                restrict: isNgForm ? 'EAC' : 'E',
                require: ['form', '^^?form'],   // First is the form's own ctrl, second is an optional parent form
                controller: FormController,
                compile: function ngFormCompile(formElement, attr) {
                    // Setup initial state of the control
                    formElement.addClass(PRISTINE_CLASS).addClass(VALID_CLASS);

                    var nameAttr = attr.name ? 'name' : (isNgForm && attr.ngForm ? 'ngForm' : false);

                    return {
                        pre: function ngFormPreLink(scope, formElement, attr, ctrls) {
                            var controller = ctrls[0],
                                handleFormSubmission,
                                parentFormCtrl,
                                setter;

                            if (!attr.hasOwnProperty('action')) {

                                handleFormSubmission = function (event) {
                                    var temp_hf = ' - compile - ngFormPreLink - handleFormSubmission -> ',
                                        tar_name = event.target.id || lowercase(event.target.nodeName);

                                    msos_debug(temp_fd + temp_hf + 'start, target: ' + tar_name);

                                    scope.$apply(
                                        function ngFormPreLinkScopeApply() {
                                            controller.$commitViewValue();
                                            controller.$setSubmitted();
                                        }
                                    );

                                    event.preventDefault();
                                    msos_debug(temp_fd + temp_hf + 'done!');
                                };

                                formElement[0].addEventListener('submit', handleFormSubmission);

                                // unregister the preventDefault listener so that we don't not leak memory but in a
                                // way that will achieve the prevention of the default action.
                                formElement.on(
                                    '$destroy',
                                    function () {
                                        $timeout(
                                            function () {
                                                formElement[0].removeEventListener('submit', handleFormSubmission);
                                            },
                                            0,
                                            false
                                        );
                                    }
                                );
                            }

                            parentFormCtrl = ctrls[1] || controller.$$parentForm;

                            if (parentFormCtrl.$addControl !== noop) {
                                parentFormCtrl.$addControl(controller);
                            }

                            setter = nameAttr ? getSetter(controller.$name) : noop;

                            if (nameAttr) {

                                if (setter !== noop) {      // If getSetter returns noop
                                    setter(scope, controller);
                                }

                                attr.$observe(
                                    nameAttr,
                                    function (newValue) {
                                        if (controller.$name === newValue) { return; }

                                        if (setter !== noop) {
                                            setter(scope, undefined);
                                        }

                                        controller.$$parentForm.$$renameControl(controller, newValue);
                                        setter = getSetter(controller.$name);
                                        setter(scope, controller);
                                    }
                                );
                            }

                            formElement.on(
                                '$destroy',
                                function () {
                                    if (controller.$$parentForm.$removeControl !== noop) {
                                        controller.$$parentForm.$removeControl(controller);
                                    }
                                    if (setter !== noop) {
                                        setter(scope, undefined);
                                    }

                                    extend(controller, nullFormCtrl);   // Stop propagating child destruction handlers upwards
                                }
                            );
                        }
                    };
                }
            };

            return formDirective_F;
        }

        form_dir.$$moduleName = 'ng';

        return ['$timeout', '$parse', form_dir];
    };

    formDirective = formDirectiveFactory();
    ngFormDirective = formDirectiveFactory(true);

    function stringBasedInputType(ctrl) {
        ctrl.$formatters.push(
            function (value) {
                return ctrl.$isEmpty(value) ? value : value.toString();
            }
        );
    }

    function baseInputType(element, attr, ctrl) {
        var type = lowercase(element[0].type),
            listener,
            partial_listener,
            composing = false;

        listener = function (ev) {

            if (composing) { return; }

            var value = element.val();

            if (type !== 'password' && (!attr.ngTrim || attr.ngTrim !== 'false')) {
                value = trim(value);
            }

            if (ctrl.$viewValue !== value || (value === '' && ctrl.$$hasNativeValidators)) {
                ctrl.$setViewValue(value, ev && ev.type);
            }
        };

        partial_listener = function () {
            var validity = element.prop(VALIDITY_STATE_PROPERTY) || {},
                origBadInput = validity.badInput,
                origTypeMismatch = validity.typeMismatch;

            if (validity.badInput !== origBadInput
             || validity.typeMismatch !== origTypeMismatch) { listener(); }
        };

        if (!android) {

            element.on('compositionstart', function () {
                composing = true;
            });

            element.on('compositionend', function () {
                composing = false;
                listener();
            });
        }

        element.on('input', listener);

        element.on('change', listener);

        if (PARTIAL_VALIDATION_TYPES[type]
         && ctrl.$$hasNativeValidators
         && type === attr.type) {
            element.on(
                PARTIAL_VALIDATION_EVENTS,
                _.throttle(partial_listener, 100)
            );
        }

        ctrl.$render = function () {
            // Workaround for Firefox validation #12102.
            var value = ctrl.$isEmpty(ctrl.$viewValue) ? '' : ctrl.$viewValue;

            if (element.val() !== value) { element.val(value);  }
        };
    }

    function textInputType(scope_na, element, attr, ctrl) {
        baseInputType(element, attr, ctrl);
        stringBasedInputType(ctrl);
    }

    function weekParser(isoWeek, existingDate) {
        var parts,
            year,
            week,
            hours,
            minutes,
            seconds,
            milliseconds,
            firstThurs,
            addDays;

        if (_.isDate(isoWeek)) {
            return isoWeek;
        }

        if (_.isString(isoWeek)) {

            WEEK_REGEXP.lastIndex = 0;

            parts = WEEK_REGEXP.exec(isoWeek);

            if (parts) {
                year = +parts[1];
                week = +parts[2];
                hours = 0;
                minutes = 0;
                seconds = 0;
                milliseconds = 0;
                firstThurs = getFirstThursdayOfYear(year);
                addDays = (week - 1) * 7;

                if (existingDate) {
                    hours = existingDate.getHours();
                    minutes = existingDate.getMinutes();
                    seconds = existingDate.getSeconds();
                    milliseconds = existingDate.getMilliseconds();
                }

                return new Date(year, 0, firstThurs.getDate() + addDays, hours, minutes, seconds, milliseconds);
            }
        }

        return NaN;
    }  

    function createDateParser(regexp, mapping) {
        return function (iso, date) {
            var parts,
                map;

            if (_.isDate(iso)) {
                return iso;
            }

            if (_.isString(iso)) {
                // When a date is JSON'ified to wraps itself inside of an extra
                // set of double quotes. This makes the date parsing code unable
                // to match the date string and parse it as a date.
                if (iso.charAt(0) === '"'
                 && iso.charAt(iso.length - 1) === '"') {
                    iso = iso.substring(1, iso.length - 1);
                }

                if (ISO_DATE_REGEXP.test(iso)) {
                    return new Date(iso);
                }

                regexp.lastIndex = 0;
                parts = regexp.exec(iso);

                if (parts) {
                    parts.shift();
                    if (date) {
                        map = {
                            yyyy: date.getFullYear(),
                            MM: date.getMonth() + 1,
                            dd: date.getDate(),
                            HH: date.getHours(),
                            mm: date.getMinutes(),
                            ss: date.getSeconds(),
                            sss: date.getMilliseconds() / 1000
                        };
                    } else {
                        map = {
                            yyyy: 1970,
                            MM: 1,
                            dd: 1,
                            HH: 0,
                            mm: 0,
                            ss: 0,
                            sss: 0
                        };
                    }

                    forEach(
                        parts,
                        function (part, index) {
                            if (index < mapping.length) {
                                map[mapping[index]] = +part;
                            }
                        }
                    );
                    return new Date(map.yyyy, map.MM - 1, map.dd, map.HH, map.mm, map.ss || 0, map.sss * 1000 || 0);
                }
            }
    
            return NaN;
        };
    }

    function badInputChecker(element, attr_na, ctrl) {
        var node = element[0],
            nativeValidation = ctrl.$$hasNativeValidators = _.isObject(node.validity);

        if (nativeValidation) {
            ctrl.$parsers.push(
                function (value) {
                    var validity = element.prop(VALIDITY_STATE_PROPERTY) || {};
                    
                    return validity.badInput || validity.typeMismatch ? undefined : value;
                }
            );
        }
    }

    function numberFormatterParser(ctrl) {

        ctrl.$$parserName = 'number';

        ctrl.$parsers.push(
            function (value) {
                if (ctrl.$isEmpty(value)) { return null; }
                if (NUMBER_REGEXP.test(value)) { return parseFloat(value); }

                return undefined;
            }
        );

        ctrl.$formatters.push(
            function (value) {
                if (!ctrl.$isEmpty(value)) {
                    if (!_.isNumber(value)) {
                        throw ngModelMinErr(
                            'numfmt',
                            'Expected \'{0}\' to be a number',
                            value
                        );
                    }

                    value = value.toString();
                }

                return value;
            }
        );
    }

    function parseNumberAttrVal(val) {
        if (isDefined(val) && !_.isNumber(val)) {
            val = parseFloat(val);
        }

        // returns a numeric or undefined
        return !_.isNaN(val) ? val : undefined;
    }

    function countDecimals(num) {
        var numString = num.toString(),
            decimalSymbolIndex = numString.indexOf('.'),
            match;

        if (decimalSymbolIndex === -1) {
            if (-1 < num && num < 1) {
                // It may be in the exponential notation format (`1e-X`)
                match = /e-(\d+)$/.exec(numString);

                if (match) {
                    return Number(match[1]);
                }
            }

            return 0;
        }

        return numString.length - decimalSymbolIndex - 1;
    }

    function isValidForStep(viewValue, stepBase, step) {
        // At this point `stepBase` and `step` are expected to be non-NaN values
        // and `viewValue` is expected to be a valid stringified number.
        var value = Number(viewValue),
            isNonIntegerValue = !isNumberInteger(value),
            isNonIntegerStepBase = !isNumberInteger(stepBase),
            isNonIntegerStep = !isNumberInteger(step),
            valueDecimals,
            stepBaseDecimals,
            stepDecimals,
            decimalCount,
            multiplier;

        // Due to limitations in Floating Point Arithmetic (e.g. `0.3 - 0.2 !== 0.1` or
        // `0.5 % 0.1 !== 0`), we need to convert all numbers to integers.
        if (isNonIntegerValue || isNonIntegerStepBase || isNonIntegerStep) {

            valueDecimals = isNonIntegerValue ? countDecimals(value) : 0;
            stepBaseDecimals = isNonIntegerStepBase ? countDecimals(stepBase) : 0;
            stepDecimals = isNonIntegerStep ? countDecimals(step) : 0;

            decimalCount = Math.max(valueDecimals, stepBaseDecimals, stepDecimals);
            multiplier = Math.pow(10, decimalCount);

            value = value * multiplier;
            stepBase = stepBase * multiplier;
            step = step * multiplier;

            if (isNonIntegerValue) { value = Math.round(value); }
            if (isNonIntegerStepBase) { stepBase = Math.round(stepBase); }
            if (isNonIntegerStep) { step = Math.round(step); }
        }

        return (value - stepBase) % step === 0;
    }

    function createDateInputType(type, regexp, parseDate, format) {
        return function dynamicDateInputType(scope_na, element, attr, ctrl, $filter) {

            badInputChecker(element, attr, ctrl);
            baseInputType(element, attr, ctrl);

            var timezone = ctrl && ctrl.$options.getOption('timezone'),
                previousDate,
                minVal,
                maxVal;

            function isValidDate(value) {
                var val_get_time;

                if (value && value.getTime) {
                    val_get_time = value.getTime();
                }
                // Invalid Date: getTime() returns NaN
                return value && val_get_time === val_get_time;
            }

            function parseObservedDateValue(val) {
                return isDefined(val) && !_.isDate(val) ? parseDate(val) || undefined : val;
            }

            ctrl.$$parserName = type;

            ctrl.$parsers.push(
                function (value) {
                    var parsedDate;

                    if (ctrl.$isEmpty(value)) { return null; }

                    if (regexp.test(value)) {
                        // Note: We cannot read ctrl.$modelValue, as there might be a different
                        // parser/formatter in the processing chain so that the model
                        // contains some different data format!
                        parsedDate = parseDate(value, previousDate);

                        if (timezone) {
                            parsedDate = convertTimezoneToLocal(parsedDate, timezone);
                        }

                        return parsedDate;
                    }
                    return undefined;
                }
            );

            ctrl.$formatters.push(
                function (value) {
                    if (value && !_.isDate(value)) {
                        throw ngModelMinErr(
                            'datefmt',
                            'Expected \'{0}\' to be a date',
                            value
                        );
                    }

                    if (isValidDate(value)) {

                        previousDate = value;

                        if (previousDate && timezone) {
                            previousDate = convertTimezoneToLocal(previousDate, timezone, true);
                        }

                        return $filter('date')(value, format, timezone);
                    }

                    previousDate = null;
                    return '';
                }
            );

            if (isDefined(attr.min) || attr.ngMin) {
                ctrl.$validators.min = function (value) {
                    return !isValidDate(value) || _.isUndefined(minVal) || parseDate(value) >= minVal;
                };
                attr.$observe(
                    'min',
                    function (val) {
                        minVal = parseObservedDateValue(val);
                        ctrl.$validate();
                    }
                );
            }

            if (isDefined(attr.max) || attr.ngMax) {
                ctrl.$validators.max = function (value) {
                    return !isValidDate(value) || _.isUndefined(maxVal) || parseDate(value) <= maxVal;
                };
                attr.$observe(
                    'max',
                    function (val) {
                        maxVal = parseObservedDateValue(val);
                        ctrl.$validate();
                    }
                );
            }
        };
    }

    function numberInputType(scope_na, element, attr, ctrl) {
        var minVal,
            maxVal,
            stepVal;

        badInputChecker(element, attr, ctrl);
        numberFormatterParser(ctrl);
        baseInputType(element, attr, ctrl);

        if (isDefined(attr.min) || attr.ngMin) {
            ctrl.$validators.min = function (value) {
                return ctrl.$isEmpty(value) || _.isUndefined(minVal) || value >= minVal;
            };

            attr.$observe(
                'min',
                function (val) {
                    minVal = parseNumberAttrVal(val);
                    ctrl.$validate();
                }
            );
        }

        if (isDefined(attr.max) || attr.ngMax) {
            ctrl.$validators.max = function (value) {
                return ctrl.$isEmpty(value) || _.isUndefined(maxVal) || value <= maxVal;
            };

            attr.$observe(
                'max',
                function (val) {
                    maxVal = parseNumberAttrVal(val);
                    ctrl.$validate();
                }
            );
        }

        if (isDefined(attr.step) || attr.ngStep) {
            ctrl.$validators.step = function (modelValue_na, viewValue) {
                return ctrl.$isEmpty(viewValue) || _.isUndefined(stepVal) || isValidForStep(viewValue, minVal || 0, stepVal);
            };

            attr.$observe(
                'step',
                function (val) {
                    stepVal = parseNumberAttrVal(val);
                    ctrl.$validate();
                }
            );
        }
    }

    function rangeInputType(scope_na, element, attr, ctrl) {

        function setInitialValueAndObserver(htmlAttrName, changeFn) {
            element.attr(htmlAttrName, attr[htmlAttrName]);
            attr.$observe(htmlAttrName, changeFn);
        }

        badInputChecker(element, attr, ctrl);
        numberFormatterParser(ctrl);
        baseInputType(element, attr, ctrl);

        var supportsRange = ctrl.$$hasNativeValidators && element[0].type === 'range',
            minVal = supportsRange ? 0 : undefined,
            maxVal = supportsRange ? 100 : undefined,
            stepVal = supportsRange ? 1 : undefined,
            validity = element[0].validity,
            hasMinAttr = isDefined(attr.min),
            hasMaxAttr = isDefined(attr.max),
            hasStepAttr = isDefined(attr.step),
            originalRender = ctrl.$render;

        function minChange(val) {
            var elVal;

            // minVal (numeric or undefined)
            minVal = parseNumberAttrVal(val);

            if (_.isNaN(ctrl.$modelValue)) { return; }

            if (supportsRange && minVal) {
                elVal = element.val();

                if (minVal > elVal) {
                    elVal = minVal;
                    element.val(elVal);
                }

                ctrl.$setViewValue(elVal);
            } else {
                ctrl.$validate();
            }
        }

        function maxChange(val) {
            var elVal;

            // maxVal (numeric or undefined)
            maxVal = parseNumberAttrVal(val);

            if (_.isNaN(ctrl.$modelValue)) { return; }

            if (supportsRange && maxVal) {
                elVal = element.val();
                // IE11 doesn't set the el val correctly if the maxVal is less than the element value
                if (maxVal < elVal) {
                    element.val(maxVal);
                    // IE11 and Chrome don't set the value to the minVal when max < min
                    elVal = maxVal < minVal ? minVal : maxVal;
                }

                ctrl.$setViewValue(elVal);
            } else {
                ctrl.$validate();
            }
        }

        function stepChange(val) {

            stepVal = parseNumberAttrVal(val);

            // ignore changes before model is initialized
            if (_.isNaN(ctrl.$modelValue)) { return; }

            // Some browsers don't adjust the input value correctly, but set the stepMismatch error
            if (supportsRange && ctrl.$viewValue !== element.val()) {
                ctrl.$setViewValue(element.val());
            } else {
                ctrl.$validate();
            }
        }

        // Browsers that implement range will set these values automatically, but reading the adjusted values after
        // $render would cause the min / max validators to be applied with the wrong value
        ctrl.$render = supportsRange && isDefined(validity.rangeUnderflow) && isDefined(validity.rangeOverflow)
            ?   function rangeRender() {
                    originalRender();
                    ctrl.$setViewValue(element.val());
                }
            : originalRender;

        if (hasMinAttr) {
            ctrl.$validators.min = supportsRange
                ?   function noopMinValidator() {
                        return true;
                    }
                :   function minValidator(modelValue_na, viewValue) {
                        return ctrl.$isEmpty(viewValue) || _.isUndefined(minVal) || viewValue >= minVal;
                    };

            setInitialValueAndObserver('min', minChange);
        }

        if (hasMaxAttr) {
            ctrl.$validators.max = supportsRange
                ?   function noopMaxValidator() {
                        return true;
                    }
                :   function maxValidator(modelValue_na, viewValue) {
                        return ctrl.$isEmpty(viewValue) || _.isUndefined(maxVal) || viewValue <= maxVal;
                    };

            setInitialValueAndObserver('max', maxChange);
        }

        if (hasStepAttr) {
            ctrl.$validators.step = supportsRange
                ?   function nativeStepValidator() {
                        return !validity.stepMismatch;
                    }
                :   function stepValidator(modelValue_na, viewValue) {
                        return ctrl.$isEmpty(viewValue) || _.isUndefined(stepVal) || isValidForStep(viewValue, minVal || 0, stepVal);
                    };

            setInitialValueAndObserver('step', stepChange);
        }
    }

    function urlInputType(scope_na, element, attr, ctrl) {
        // Note: no badInputChecker here by purpose as `url` is only a validation
        // in browsers, i.e. we can always read out input.value even if it is not valid!
        baseInputType(element, attr, ctrl);
        stringBasedInputType(ctrl);

        ctrl.$$parserName = 'url';
        ctrl.$validators.url = function (modelValue, viewValue) {
            var value = modelValue || viewValue;
            return ctrl.$isEmpty(value) || URL_REGEXP.test(value);
        };
    }

    function emailInputType(scope_na, element, attr, ctrl) {
        // Note: no badInputChecker here by purpose as `url` is only a validation
        // in browsers, i.e. we can always read out input.value even if it is not valid!
        baseInputType(element, attr, ctrl);
        stringBasedInputType(ctrl);

        ctrl.$$parserName = 'email';
        ctrl.$validators.email = function (modelValue, viewValue) {
            var value = modelValue || viewValue;
            return ctrl.$isEmpty(value) || EMAIL_REGEXP.test(value);
        };
    }

    function radioInputType(scope_na, element, attr, ctrl) {
        var doTrim = !attr.ngTrim || trim(attr.ngTrim) !== 'false',
            listener;

        // make the name unique, if not defined
        if (_.isUndefined(attr.name)) {
            element.attr('name', nextRadioUid());
        }

        listener = function (ev) {
            var value;

            if (element[0].checked) {
                value = attr.value;
                if (doTrim) {
                    value = trim(value);
                }
                ctrl.$setViewValue(value, ev && ev.type);
            }
        };

        element.on('click', listener);

        ctrl.$render = function () {
            var value = attr.value;

            if (doTrim) {
                value = trim(value);
            }
            element[0].checked = (value === ctrl.$viewValue);
        };

        attr.$observe('value', ctrl.$render);
    }

    function parseConstantExpr($parse, context_scope, name, expression, fallback) {
        var parseFn;
        if (isDefined(expression)) {
            parseFn = $parse(expression);
            if (!parseFn.constant) {
                throw ngModelMinErr(
                    'constexpr',
                    'Expected constant expression for \'{0}\', but saw \'{1}\'.',
                    name,
                    expression
                );
            }
            return parseFn(context_scope);
        }
        return fallback;
    }

    function checkboxInputType(scope, element, attr, ctrl, $filter_na, $parse) {
        var trueValue = parseConstantExpr($parse, scope, 'ngTrueValue', attr.ngTrueValue, true),
            falseValue = parseConstantExpr($parse, scope, 'ngFalseValue', attr.ngFalseValue, false),
            listener = function (ev) {
                ctrl.$setViewValue(element[0].checked, ev && ev.type);
            };

        element.on('click', listener);

        ctrl.$render = function () {
            element[0].checked = ctrl.$viewValue;
        };

        // Override the standard `$isEmpty` because the $viewValue of an empty checkbox is always set to `false`
        // This is because of the parser below, which compares the `$modelValue` with `trueValue` to convert it to a boolean.
        ctrl.$isEmpty = function (value) {
            return value === false;
        };

        ctrl.$formatters.push(function (value) {
            return equals(value, trueValue);
        });

        ctrl.$parsers.push(function (value) {
            return value ? trueValue : falseValue;
        });
    }

    PARTIAL_VALIDATION_TYPES = createMap();

    forEach(
        ['date', 'datetime-local', 'month', 'time', 'week'],
        function (type) { PARTIAL_VALIDATION_TYPES[type] = true; }
    );

    inputType = {

        'text': textInputType,

        'date': createDateInputType('date', DATE_REGEXP, createDateParser(DATE_REGEXP, ['yyyy', 'MM', 'dd']), 'yyyy-MM-dd'),

        'datetime-local': createDateInputType('datetimelocal', DATETIMELOCAL_REGEXP, createDateParser(DATETIMELOCAL_REGEXP, ['yyyy', 'MM', 'dd', 'HH', 'mm', 'ss', 'sss']), 'yyyy-MM-ddTHH:mm:ss.sss'),

        'time': createDateInputType('time', TIME_REGEXP, createDateParser(TIME_REGEXP, ['HH', 'mm', 'ss', 'sss']), 'HH:mm:ss.sss'),

        'week': createDateInputType('week', WEEK_REGEXP, weekParser, 'yyyy-Www'),

        'month': createDateInputType('month', MONTH_REGEXP, createDateParser(MONTH_REGEXP, ['yyyy', 'MM']), 'yyyy-MM'),

        'number': numberInputType,

        'url': urlInputType,

        'email': emailInputType,

        'radio': radioInputType,

        'range': rangeInputType,

        'checkbox': checkboxInputType,

        'hidden': noop,
        'button': noop,
        'submit': noop,
        'reset': noop,
        'file': noop
    };

    function input_dir($filter, $parse) {
        return {
            restrict: 'E',
            require: ['?ngModel'],
            link: {
                pre: function (scope, element, attr, ctrls) {
                    var type;

                    if (ctrls[0]) {
                        type = lowercase(attr.type);

                        (inputType[type] || inputType.text)(
                            scope,
                            element,
                            attr,
                            ctrls[0],
                            $filter,
                            $parse
                        );
                    }
                }
            }
        };
    }

    input_dir.$$moduleName = 'ng';

    inputDirective = ['$filter', '$parse', input_dir];

    function setupModelWatcher(ctrl) {

        ctrl.$$scope.$watch(
            function ngModelWatch(scope) {
                var temp_nmw = 'ng - ngModelWatch -> ',
                    modelValue = ctrl.$$ngModelGet(scope),
                    formatters,
                    idx,
                    viewValue;

                if (modelValue !== ctrl.$modelValue) {

                    if (ctrl.$modelValue === ctrl.$modelValue || modelValue === modelValue) {
                        ctrl.$modelValue = ctrl.$$rawModelValue = modelValue;
                        ctrl.$$parserValid = undefined;

                        formatters = ctrl.$formatters;
                        idx = formatters.length;
                        viewValue = modelValue;

                        while (idx) {
                            idx -= 1;
                            viewValue = formatters[idx](viewValue);
                        }

                        if (ctrl.$viewValue !== viewValue) {

                            ctrl.$$updateEmptyClasses(viewValue);
                            ctrl.$viewValue = ctrl.$$lastCommittedViewValue = viewValue;

                            if (ctrl.$render !== noop) {
                                ctrl.$render();
                            } else {
                                msos_debug(temp_nmw + 'ctrl.$render skipped for noop.');
                            }

                            // It is possible that model and view value have been updated during render
                            ctrl.$$runValidators(ctrl.$modelValue, ctrl.$viewValue, noop);
                        }
                    } else {
                        // NaN checking
                        msos_debug(temp_nmw + 'NaN detected.');
                    }
                }

                return modelValue;
            }
        );
    }

    ngModelMinErr = minErr('ngModel');

    function NgModelController($scope, $attr, $element, $parse, $animate, $timeout, $q, $interpolate) {

        this.$viewValue = Number['NaN'];
        this.$modelValue = Number['NaN'];
        this.$$rawModelValue = undefined;   // stores the parsed modelValue / model set from scope regardless of validity.
        this.$validators = {};
        this.$asyncValidators = {};
        this.$parsers = [];
        this.$formatters = [];
        this.$viewChangeListeners = [];
        this.$untouched = true;
        this.$touched = false;
        this.$pristine = true;
        this.$dirty = false;
        this.$valid = true;
        this.$invalid = false;
        this.$error = {};           // keep invalid keys here
        this.$$success = {};        // keep valid keys here
        this.$pending = undefined;  // keep pending keys here
        this.$name = $interpolate($attr.name || '', false)($scope);
        this.$$parentForm = nullFormCtrl;
        this.$options = defaultModelOptions;

        this.$$parsedNgModel = $parse($attr.ngModel);
        this.$$parsedNgModelAssign = this.$$parsedNgModel.assign;
        this.$$ngModelGet = this.$$parsedNgModel;
        this.$$ngModelSet = this.$$parsedNgModelAssign;
        this.$$pendingDebounce = null;
        this.$$parserValid = undefined;

        this.$$currentValidationRunId = 0;

        Object.defineProperty(this, '$$scope', { value: $scope });

        this.$$attr = $attr;
        this.$$element = $element;
        this.$$animate = $animate;
        this.$$timeout = $timeout;
        this.$$parse = $parse;
        this.$$model_q = $q;

        this.$$moduleName = 'ng';
        this.$$ctrlName = 'ng - NgModelController';

        setupValidity(this);
        setupModelWatcher(this);
    }

    NgModelController.prototype = {
        $$initGetterSetters: function () {
            var invokeModelGetter,
                invokeModelSetter;

            if (this.$options.getOption('getterSetter')) {

                invokeModelGetter = this.$$parse(this.$$attr.ngModel + '()');
                invokeModelSetter = this.$$parse(this.$$attr.ngModel + '($$$p)');

                this.$$ngModelGet = function ($scope) {
                    var modelValue = this.$$parsedNgModel($scope);

                    if (_.isFunction(modelValue)) {
                        modelValue = invokeModelGetter($scope);
                    }

                    return modelValue;
                };

                this.$$ngModelSet = function ($scope, newValue) {

                    if (_.isFunction(this.$$parsedNgModel($scope))) {
                        invokeModelSetter($scope, {$$$p: newValue});
                    } else {
                        this.$$parsedNgModelAssign($scope, newValue);
                    }
                };

            } else if (!this.$$parsedNgModel.assign) {
                throw ngModelMinErr(
                    'nonassign',
                    'Expression \'{0}\' is non-assignable. Element: {1}',
                    this.$$attr.ngModel,
                    startingTag(this.$$element)
                );
            }
        },
        $render: noop,
        $isEmpty: function (value) {
            return _.isUndefined(value) || value === '' || value === null || value !== value;
        },
        $$updateEmptyClasses: function (value) {
            if (this.$isEmpty(value)) {
                this.$$animate.removeClass(this.$$element, NOT_EMPTY_CLASS);
                this.$$animate.addClass(this.$$element, EMPTY_CLASS);
            } else {
                this.$$animate.removeClass(this.$$element, EMPTY_CLASS);
                this.$$animate.addClass(this.$$element, NOT_EMPTY_CLASS);
            }
        },
        $setPristine: function () {
            this.$dirty = false;
            this.$pristine = true;
            this.$$animate.removeClass(this.$$element, DIRTY_CLASS);
            this.$$animate.addClass(this.$$element, PRISTINE_CLASS);
        },
        $setDirty: function () {
            this.$dirty = true;
            this.$pristine = false;
            this.$$animate.removeClass(this.$$element, PRISTINE_CLASS);
            this.$$animate.addClass(this.$$element, DIRTY_CLASS);
            if (this.$$parentForm.$setDirty !== noop) {     // noop would do nothing.
                this.$$parentForm.$setDirty();
            }
        },
        $setUntouched: function () {
            this.$touched = false;
            this.$untouched = true;
            this.$$animate.setClass(this.$$element, UNTOUCHED_CLASS, TOUCHED_CLASS);
        },
        $setTouched: function () {
            this.$touched = true;
            this.$untouched = false;
            this.$$animate.setClass(this.$$element, TOUCHED_CLASS, UNTOUCHED_CLASS);
        },
        $rollbackViewValue: function () {
            this.$$timeout.cancel(this.$$pendingDebounce);
            this.$viewValue = this.$$lastCommittedViewValue;
            this.$render();
        },
        $validate: function () {
            // ignore $validate before model is initialized
            if (_.isNaN(this.$modelValue)) { return; }

            var viewValue = this.$$lastCommittedViewValue,
                modelValue = this.$$rawModelValue,
                prevValid = this.$valid,
                prevModelValue = this.$modelValue,
                allowInvalid = this.$options.getOption('allowInvalid'),
                that = this;

            this.$$runValidators(
                modelValue,
                viewValue,
                function (allValid) {
                    if (!allowInvalid && prevValid !== allValid) {
                        that.$modelValue = allValid ? modelValue : undefined;

                        if (that.$modelValue !== prevModelValue) {
                            that.$$writeModelToScope();
                        }
                    }
                }
            );
        },
        $$runValidators: function (modelValue, viewValue, doneCallback) {

            this.$$currentValidationRunId += 1;

            var localValidationRunId = this.$$currentValidationRunId,
                that = this;

            function setValidity(name, isValid) {
                if (localValidationRunId === that.$$currentValidationRunId) {
                    that.$setValidity(name, isValid);
                }
            }

            function processParseErrors() {
                var errorKey = that.$$parserName || 'parse';

                if (_.isUndefined(that.$$parserValid)) {
                    setValidity(errorKey, null);
                } else {
                    if (!that.$$parserValid) {
                        forEach(
                            that.$validators,
                            function (v_na, name) {
                                setValidity(name, null);
                            }
                        );

                        forEach(
                            that.$asyncValidators,
                            function (v_na, name) {
                                setValidity(name, null);
                            }
                        );
                    }
                    // Set the parse error last, to prevent unsetting it, should a $validators key == parserName
                    setValidity(errorKey, that.$$parserValid);
                    return that.$$parserValid;
                }

                return true;
            }

            function validationDone(allValid) {
                if (localValidationRunId === that.$$currentValidationRunId) {
                    if (doneCallback !== noop) {
                        doneCallback(allValid);
                    } else if (msos_verbose) {
                        msos_debug(that.$$ctrlName + ' - $$runValidators - validationDone -> skipped for noop, allvalid:', allValid);
                    }
                }
            }

            function processSyncValidators() {
                var syncValidatorsValid = true;

                forEach(
                    that.$validators,
                    function (validator, name) {
                        var result = Boolean(validator(modelValue, viewValue));

                        syncValidatorsValid = syncValidatorsValid && result;
                        setValidity(name, result);
                    }
                );

                if (!syncValidatorsValid) {
                    forEach(
                        that.$asyncValidators,
                        function (v_na, name) {
                            setValidity(name, null);
                        }
                    );

                    return false;
                }

                return true;
            }

            function processAsyncValidators() {
                var validatorPromises = [],
                    allValid = true;

                forEach(
                    that.$asyncValidators,
                    function (validator, name) {
                        var promise = validator(modelValue, viewValue);

                        if (!isPromiseLike(promise)) {
                            throw ngModelMinErr(
                                'nopromise',
                                'Expected asynchronous validator to return a promise but got \'{0}\' instead.',
                                promise
                            );
                        }

                        setValidity(name, undefined);

                        validatorPromises.push(
                            promise.then(
                                function () {
                                    setValidity(name, true);
                                },
                                function () {
                                    allValid = false;
                                    setValidity(name, false);
                                }
                            )
                        );
                    }
                );

                if (!validatorPromises.length) {
                    validationDone(true);
                } else {
                    that.$$model_q.all(that.$$model_q.defer('ng_all_processAsyncValidators'), validatorPromises).then(
                        function () { validationDone(allValid); },
                        noop
                    );
                }
            }

            // check parser error
            if (!processParseErrors()) {
                validationDone(false);
                return;
            }

            if (!processSyncValidators()) {
                validationDone(false);
                return;
            }

            processAsyncValidators();
        },
        $commitViewValue: function () {
            var viewValue = this.$viewValue;

            this.$$timeout.cancel(this.$$pendingDebounce);

            if (this.$$lastCommittedViewValue === viewValue
             && (viewValue !== '' || !this.$$hasNativeValidators)) {
                return;
            }

            this.$$updateEmptyClasses(viewValue);
            this.$$lastCommittedViewValue = viewValue;

            // change to dirty
            if (this.$pristine) {
                this.$setDirty();
            }

            this.$$parseAndValidate();
        },
        $$parseAndValidate: function () {
            var viewValue = this.$$lastCommittedViewValue,
                modelValue = viewValue,
                i = 0,
                prevModelValue,
                allowInvalid,
                that = this;

            this.$$parserValid = _.isUndefined(modelValue) ? undefined : true;

            if (this.$$parserValid) {
                for (i = 0; i < this.$parsers.length; i += 1) {
                    modelValue = this.$parsers[i](modelValue);

                    if (_.isUndefined(modelValue)) {
                        this.$$parserValid = false;
                        break;
                    }
                }
            }

            if (_.isNaN(this.$modelValue)) {
                // this.$modelValue has not been touched yet...
                this.$modelValue = this.$$ngModelGet(this.$$scope);
            }

            prevModelValue = this.$modelValue;
            allowInvalid = this.$options.getOption('allowInvalid');

            this.$$rawModelValue = modelValue;

            function writeToModelIfNeeded() {
                if (that.$modelValue !== prevModelValue) {
                    that.$$writeModelToScope();
                }
            }

            if (allowInvalid) {
                this.$modelValue = modelValue;
                writeToModelIfNeeded();
            }

            this.$$runValidators(
                modelValue,
                this.$$lastCommittedViewValue,
                function (allValid) {
                    if (!allowInvalid) {
                        that.$modelValue = allValid ? modelValue : undefined;
                        writeToModelIfNeeded();
                    }
                }
            );
        },
        $$writeModelToScope: function () {
            this.$$ngModelSet(this.$$scope, this.$modelValue);

            forEach(
                this.$viewChangeListeners,
                function (listener) {
                    try {
                        listener();
                    } catch (e) {
                        msos.console.error(this.$$ctrlName + ' - $$writeModelToScope -> error:', e);
                    }
                },
                this
            );
        },
        $setViewValue: function(value, trigger) {
            this.$viewValue = value;

            if (this.$options.getOption('updateOnDefault')) {
                this.$$debounceViewValueCommit(trigger);
            }
        },
        $$debounceViewValueCommit: function (trigger) {
            var debounceDelay = this.$options.getOption('debounce'),
                that = this;

            if (_.isNumber(debounceDelay[trigger])) {
                debounceDelay = debounceDelay[trigger];
            } else if (_.isNumber(debounceDelay['default'])) {
                debounceDelay = debounceDelay['default'];
            }

            this.$$timeout.cancel(this.$$pendingDebounce);

            if (debounceDelay > 0) {    // this fails if debounceDelay is an object
                this.$$pendingDebounce = this.$$timeout(
                    function () {
                        that.$commitViewValue();
                    },
                    debounceDelay
                );
            } else if (this.$$scope.$root.$$phase) {
                this.$commitViewValue();
            } else {
                this.$$scope.$apply(
                    function () {
                        that.$commitViewValue();
                    }
                );
            }
        }
    };

    NgModelController.$inject = ['$scope', '$attrs', '$element', '$parse', '$animate', '$timeout', '$q', '$interpolate'];

    addSetValidityMethod({
        clazz: NgModelController,
        set: function (object, property) {
            object[property] = true;
        },
        unset: function (object, property) {
            delete object[property];
        }
    });

    function ng_model_dir($rootScope) {
        return {
            restrict: 'A',
            require: ['ngModel', '^?form', '^?ngModelOptions'],
            controller: NgModelController,

            // Prelink needs to run before any input directive
            // so that we can set the NgModelOptions in NgModelController
            // before anyone else uses it.
            priority: 1,
            compile: function ngModelCompile(element) {
                var temp_cp = 'ng - ngModelDirective - compile';
                // Setup initial state of the control
                element.addClass(PRISTINE_CLASS).addClass(UNTOUCHED_CLASS).addClass(VALID_CLASS);

                return {
                    pre: function ngModelPreLink(scope, element_na, attr, ctrls) {
                        var modelCtrl = ctrls[0],
                            formCtrl =  ctrls[1] || modelCtrl.$$parentForm,
                            optionsCtrl = ctrls[2];

                        if (optionsCtrl) {
                            modelCtrl.$options = optionsCtrl.$options;
                        }

                        modelCtrl.$$initGetterSetters();

                        // Notify others, especially parent forms
                        if (formCtrl.$addControl !== noop) {
                            formCtrl.$addControl(modelCtrl);
                        }

                        attr.$observe(
                            'name',
                            function (newValue) {
                                if (modelCtrl.$name !== newValue) {
                                    modelCtrl.$$parentForm.$$renameControl(modelCtrl, newValue);
                                }
                            }
                        );

                        // Experimental
                        if (modelCtrl.$$parentForm.$removeControl !== noop) {
                            scope.$on(
                                '$destroy',
                                function () {
                                    modelCtrl.$$parentForm.$removeControl(modelCtrl);
                                }
                            );
                        }
                    },
                    post: function ngModelPostLink(scope, element, attr_na, ctrls) {
                        var temp_pt = temp_cp + ' - post - ngModelPostLink',
                            modelCtrl = ctrls[0];

                        if (modelCtrl.$options.getOption('updateOn')) {
                            element.on(
                                modelCtrl.$options.getOption('updateOn'),
                                function (ev) {
                                    modelCtrl.$$debounceViewValueCommit(ev && ev.type);
                                }
                            );
                        }

                        function setTouched() {
                            modelCtrl.$setTouched();
                        }

                        element.on(
                            'blur',
                            function () {
                                var temp_ob = ' - on:blur -> ';

                                msos_debug(temp_pt + temp_ob + 'start.');

                                if (modelCtrl.$touched) {
                                    msos.console.info(temp_pt + temp_ob + 'done, for $touched!');
                                    return;
                                }

                                if ($rootScope.$$phase) {
                                    scope.$evalAsync(
                                        setTouched,
                                        { directive_name: 'ngModelDirective_blur' }
                                    );
                                } else {
                                    scope.$apply(setTouched);
                                }

                                msos_debug(temp_pt + temp_ob + 'done!');
                            }
                        );
                    }
                };
            }
        };
    }

    ng_model_dir.$$moduleName = 'ng';

    ngModelDirective = ['$rootScope', ng_model_dir];

    function ModelOptions(options) {
        this.$$options = options;
    }

    function shallow_defaults(dst, src) {
        forEach(
            src,
            function(value, key) {
                if (!isDefined(dst[key])) {
                    dst[key] = value;
                }
            }
        );
    }

    ModelOptions.prototype = {

        getOption: function (name) {
            return this.$$options[name];
        },
        createChild: function (options) {
            var inheritAll = false;

            // make a shallow copy
            options = extend({}, options);

            // Inherit options from the parent if specified by the value `"$inherit"`
            forEach(
                options,
                function (option, key) {
                    if (option === '$inherit') {
                        if (key === '*') {
                            inheritAll = true;
                        } else {
                            options[key] = this.$$options[key];
                            // `updateOn` is special so we must also inherit the `updateOnDefault` option
                            if (key === 'updateOn') {
                                options.updateOnDefault = this.$$options.updateOnDefault;
                            }
                        }
                    } else {
                        if (key === 'updateOn') {
                            // If the `updateOn` property contains the `default` event then we have to remove
                            // it from the event list and set the `updateOnDefault` flag.
                            options.updateOnDefault = false;
                            options[key] = trim(
                                option.replace(
                                    DEFAULT_REGEXP,
                                    function () {
                                        options.updateOnDefault = true;
                                        return ' ';
                                    }
                                )
                            );
                        }
                    }
                },
                this
            );

            if (inheritAll) {
                // We have a property of the form: `"*": "$inherit"`
                delete options['*'];
                shallow_defaults(options, this.$$options);
            }

            // Finally add in any missing defaults
            shallow_defaults(options, defaultModelOptions.$$options);

            return new ModelOptions(options);
        }
    };

    defaultModelOptions = new ModelOptions({
        updateOn: '',
        updateOnDefault: true,
        debounce: 0,
        getterSetter: false,
        allowInvalid: false,
        timezone: null
    });

    ngModelOptionsDirective = function () {

        function NgModelOptionsController($attrs, $scope) {
            this.$$attrs = $attrs;
            this.$$scope = $scope;
        }

        NgModelOptionsController.$inject = ['$attrs', '$scope'];

        NgModelOptionsController.prototype = {
            $onInit: function () {
                var parentOptions = this.parentCtrl ? this.parentCtrl.$options : defaultModelOptions,
                    modelOptionsDefinition = this.$$scope.$eval(this.$$attrs.ngModelOptions);

                this.$options = parentOptions.createChild(modelOptionsDefinition);
            }
        };

        return {
            restrict: 'A',
            // ngModelOptions needs to run before ngModel and input directives
            priority: 10,
            require: { parentCtrl: '?^^ngModelOptions' },
            bindToController: true,
            controller: NgModelOptionsController
        };
    };

    ngChangeDirective = valueFn({
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element_na, attr, ctrl) {
            ctrl.$viewChangeListeners.push(function () {
                scope.$eval(attr.ngChange);
            });
        }
    });

    requiredDirective = function () {
            return {
                restrict: 'A',
                require: '?ngModel',
                link: function (scope_na, elm_na, attr, ctrl) {
                    if (!ctrl) { return; }
                    attr.required = true; // force truthy in case we are on non input element

                    ctrl.$validators.required = function (modelValue_na, viewValue) {
                        return !attr.required || !ctrl.$isEmpty(viewValue);
                    };

                    attr.$observe(
                        'required',
                        function () {
                            ctrl.$validate();
                        }
                    );
                }
            };
        };

    patternDirective = function () {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope_na, elm, attr, ctrl) {
                if (!ctrl) { return; }

                var regexp,
                    patternExp = attr.ngPattern || attr.pattern;

                attr.$observe('pattern', function (regex) {
                    if (_.isString(regex) && regex.length > 0) {
                        regex = new RegExp('^' + regex + '$');
                    }

                    if (regex && !regex.test) {
                        throw minErr('ngPattern')(
                            'noregexp',
                            'Expected {0} to be a RegExp but was {1}. Element: {2}',
                            patternExp,
                            regex,
                            startingTag(elm)
                        );
                    }

                    regexp = regex || undefined;
                    ctrl.$validate();
                });

                ctrl.$validators.pattern = function (modelValue_na, viewValue) {
                    // HTML5 pattern constraint validates the input value, so we validate the viewValue
                    return ctrl.$isEmpty(viewValue) || _.isUndefined(regexp) || regexp.test(viewValue);
                };
            }
        };
    };

    maxlengthDirective = function () {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope_na, elm_na, attr, ctrl) {
                if (!ctrl) { return; }

                var maxlength = -1;

                attr.$observe(
                    'maxlength',
                    function (value) {
                        var intVal = parseInt(value, 10);

                        maxlength = _.isNaN(intVal) ? -1 : intVal;
                        ctrl.$validate();
                    }
                );

                ctrl.$validators.maxlength = function (modelValue_na, viewValue) {
                    return (maxlength < 0) || ctrl.$isEmpty(viewValue) || (viewValue.length <= maxlength);
                };
            }
        };
    };

    minlengthDirective = function () {
            return {
                restrict: 'A',
                require: '?ngModel',
                link: function (scope_na, elm_na, attr, ctrl) {
                    if (!ctrl) { return; }

                    var minlength = 0;

                    attr.$observe(
                        'minlength',
                        function (value) {
                            minlength = parseInt(value, 10) || 0;
                            ctrl.$validate();
                        }
                    );

                    ctrl.$validators.minlength = function (modelValue_na, viewValue) {
                        return ctrl.$isEmpty(viewValue) || viewValue.length >= minlength;   // Back to what was in v1.3.0-rc1
                    };
                }
            };
        };

    ngListDirective = function () {
        return {
            restrict: 'A',
            priority: 100,
            require: 'ngModel',
            link: function (scope_na, element_na, attr, ctrl) {
                var ngList = attr.ngList || ', ',
                    trimValues = attr.ngTrim !== 'false',
                    separator = trimValues ? trim(ngList) : ngList,
                    parse = function (viewValue) {
                        // If the viewValue is invalid (say required but empty) it will be `undefined`
                        if (_.isUndefined(viewValue)) { return undefined; }

                        var list = [];

                        if (viewValue) {
                            forEach(viewValue.split(separator), function (value) {
                                if (value) { list.push(trimValues ? trim(value) : value); }
                            });
                        }

                        return list;
                    };

                ctrl.$parsers.push(parse);
                ctrl.$formatters.push(function (value) {
                    if (_.isArray(value)) {
                        return value.join(ngList);
                    }

                    return undefined;
                });

                // Override the standard $isEmpty because an empty array means the input is empty.
                ctrl.$isEmpty = function (value) {
                    return !value || !value.length;
                };
            }
        };
    };

    ngAttrDivective = function () {

        return {
            restrict: 'A',
            priority: 100
        };
    };

    ngValueDirective = function () {

        function updateElementValue(element, attr, value) {
            var propValue = isDefined(value) ? value : (msie === 9) ? '' : null;

            element.prop('value', propValue);
            attr.$set('value', value);
        }

        return {
            restrict: 'A',
            priority: 100,
            compile: function (tpl_na, tplAttr) {
                if (CONSTANT_VALUE_REGEXP.test(tplAttr.ngValue)) {
                    return function ngValueConstantLink(scope, elm, attr) {
                            var value = scope.$eval(attr.ngValue);

                            updateElementValue(elm, attr, value);
                        };
                }

                return function ngValueLink(scope, elm, attr) {
                        scope.$watch(
                            attr.ngValue,
                            function valueWatchAction(value) {
                                updateElementValue(elm, attr, value);
                            }
                        );
                    };
            }
        };
    };

    ngBindDirective = ['$compile', function ($compile) {
        return {
            restrict: 'AC',
            compile: function ngBindCompile(templateElement) {
                $compile.$$addBindingClass(templateElement);

                return function ngBindLink(scope, element, attr) {
                    $compile.$$addBindingInfo(element, attr.ngBind);

                    element = element[0];

                    scope.$watch(
                        attr.ngBind,
                        function ngBindWatchAction(value) {
                            element.textContent = stringify(value);
                        }
                    );
                };
            }
        };
    }];

    ngBindTemplateDirective = ['$compile', function ($compile) {
        return {
            compile: function ngBindTemplateCompile(templateElement) {

                $compile.$$addBindingClass(templateElement);

                return function ngBindTemplateLink(scope_na, element, attr) {

                    // Experimental: removed $compile.$$addBindingInfo stuff
                    element = element[0];

                    attr.$observe(
                        'ngBindTemplate',
                        function (value) {
                            element.textContent = _.isUndefined(value) ? '' : value;
                        }
                    );
                };
            }
        };
    }];

    ngBindHtmlDirective = ['$sce', '$parse', '$compile', function ($sce, $parse, $compile) {
        return {
            restrict: 'A',
            compile: function ngBindHtmlCompile(tElement, tAttrs) {
                var ngBindHtmlGetter = $parse(tAttrs.ngBindHtml),
                    ngBindHtmlWatch = $parse(
                        tAttrs.ngBindHtml,
                        function sceValueOf(val) {
                            // Unwrap the value to compare the actual inner safe value, not the wrapper object.
                            return $sce.valueOf(val);
                        }
                    );

                $compile.$$addBindingClass(tElement);

                return function ngBindHtmlLink(scope, element) {

                    scope.$watch(
                        ngBindHtmlWatch,
                        function ngBindHtmlWatchAction() {
                            // The watched value is the unwrapped value. To avoid re-escaping, use the direct getter.
                            var value = ngBindHtmlGetter(scope);

                            element.html($sce.getTrustedHtml(value) || '');
                        }
                    );
                };
            }
        };
    }];

    function classDirective(name, selector) {
        name = 'ngClass' + name;
        var indexWatchExpression;

        function create_class_dir($parse) {

            function arrayDifference(tokens1, tokens2) {

                if (!tokens1 || !tokens1.length) { return []; }
                if (!tokens2 || !tokens2.length) { return tokens1; }

                var values = [],
                    i = 0,
                    j = 0,
                    token;

                outer:
                for (i = 0; i < tokens1.length; i += 1) {
                    token = tokens1[i];

                    for (j = 0; j < tokens2.length; j += 1) {
                        if (token === tokens2[j]) { continue outer; }
                    }

                    values.push(token);
                }

                return values;
            }

            function split(classString) {
                return classString && classString.split(' ');
            }

            function toClassString(classValue) {
                var classString = classValue;

                if (_.isArray(classValue)) {
                    classString = classValue.map(toClassString).join(' ');
                } else if (_.isObject(classValue)) {
                    classString = Object.keys(classValue).filter(
                        function (key) {
                            return classValue[key];
                        }
                    ).join(' ');
                }

                return classString;
            }

            function toFlatValue(classValue) {
                var flatValue = classValue,
                    hasUndefined;

                if (_.isArray(classValue)) {
                    flatValue = classValue.map(toFlatValue);
                } else if (_.isObject(classValue)) {
                    hasUndefined = false;

                    flatValue = Object.keys(classValue).filter(
                        function (key) {
                            var value = classValue[key];

                            if (!hasUndefined && _.isUndefined(value)) {
                                hasUndefined = true;
                            }

                            return value;
                        }
                    );

                    if (hasUndefined) {
                        flatValue.push(undefined);
                    }
                }

                return flatValue;
            }

            return {
                restrict: 'AC',
                link: function (scope, element, attr) {
                    var expression = attr[name].trim(),
                        isOneTime = (expression.charAt(0) === ':') && (expression.charAt(1) === ':'),
                        watchInterceptor = isOneTime ? toFlatValue : toClassString,
                        watchExpression = $parse(expression, watchInterceptor),
                        watchAction = isOneTime ? ngClassOneTimeWatchAction : ngClassWatchAction,
                        classCounts = element.data('$classCounts'),
                        oldModulo = true,
                        oldClassString;

                    function digestClassCounts(classArray, count) {
                        var classesToUpdate = [];

                        forEach(classArray, function (className) {
                            if (count > 0 || classCounts[className]) {
                                classCounts[className] = (classCounts[className] || 0) + count;
                                if (classCounts[className] === +(count > 0)) {
                                    classesToUpdate.push(className);
                                }
                            }
                        });

                        return classesToUpdate.join(' ');
                    }

                    function updateClasses(oldClassString, newClassString) {
                        var oldClassArray = split(oldClassString),
                            newClassArray = split(newClassString),
                            toRemoveArray = arrayDifference(oldClassArray, newClassArray),
                            toAddArray = arrayDifference(newClassArray, oldClassArray),
                            toRemoveString = digestClassCounts(toRemoveArray, -1),
                            toAddString = digestClassCounts(toAddArray, 1);

                        attr.$addClass(toAddString);
                        attr.$removeClass(toRemoveString);
                    }

                    function ngClassWatchAction(newClassString) {

                        if (oldModulo === selector) {
                            updateClasses(oldClassString, newClassString);
                        }

                        oldClassString = newClassString;
                    }

                    function ngClassOneTimeWatchAction(newClassValue) {
                        var newClassString = toClassString(newClassValue);

                        if (newClassString !== oldClassString) {
                            ngClassWatchAction(newClassString);
                        }
                    }

                    function addClasses(classString) {
                        classString = digestClassCounts(split(classString), 1);
                        attr.$addClass(classString);
                    }

                    function removeClasses(classString) {
                        classString = digestClassCounts(split(classString), -1);
                        attr.$removeClass(classString);
                    }

                    function ngClassIndexWatchAction(newModulo) {
                        if (newModulo === selector) {
                            addClasses(oldClassString);
                        } else {
                            removeClasses(oldClassString);
                        }

                        oldModulo = newModulo;
                    }

                    if (!classCounts) {
                        // Use createMap() to prevent class assumptions involving property
                        // names in Object.prototype
                        classCounts = createMap();
                        element.data('$classCounts', classCounts);
                    }

                    if (name !== 'ngClass') {
                        if (!indexWatchExpression) {
                            indexWatchExpression = $parse(
                                '$index',
                                function moduloTwo($index) {
                                    // eslint-disable-next-line no-bitwise
                                    return $index & 1;
                                }
                            );
                        }

                        scope.$watch(indexWatchExpression, ngClassIndexWatchAction);
                    }

                    scope.$watch(watchExpression, watchAction, isOneTime);
                }
            };
        }

        create_class_dir.$$moduleName = 'ng';

        return ['$parse', create_class_dir];
    }

    ngClassDirective = classDirective('', true);

    ngClassOddDirective = classDirective('Odd', 0);

    ngClassEvenDirective = classDirective('Even', 1);

    ngCloakDirective = ngDirective({
        compile: function (element, attr) {
            attr.$set('ngCloak', undefined);
            element.removeClass('ng-cloak');
        }
    });

    function ng_controller_dir() {
        return {
            restrict: 'A',
            scope: true,
            controller: '@',
            priority: 500
        };
    }

    ng_controller_dir.$$moduleName = 'ng';

    ngControllerDirective = [ng_controller_dir];

    forEach(
        [
            'click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'mousemove',
            'mouseenter', 'mouseleave', 'keydown', 'keyup', 'keypress', 'submit',
            'focus', 'blur', 'copy', 'cut', 'paste'
        ],
        function (eventName) {
            var vb = msos_verbose,
                directiveName = directiveNormalize('ng-' + eventName);

            function ng_event_dir($parse, $rootScope) {
                return {
                    restrict: 'A',
                    compile: function ($element_na, attr) {
                        var temp_ev = directiveName + ' - compile - ngEventHandler',
                            fn = $parse(attr[directiveName]);

                        return function ngEventHandler(scope, element) {
                            element.on(
                                eventName,
                                function (event) {
                                    var callback = function ngEventHandlerCB() {
                                            if (vb === 'events') {
                                                msos.console.info(temp_ev + ' - CB -> called, for:' + event.type);
                                            }
                                            fn(scope, { $event: event });
                                        };

                                    if (vb === 'events') {
                                        msos.console.info(temp_ev + ' -> start.');
                                    }

                                    if (forceAsyncEvents[eventName] && $rootScope.$$phase) {
                                        scope.$evalAsync(
                                            callback,
                                            { directive_name: 'ngEventDirectives_' + directiveName }
                                        );
                                    } else {
                                        scope.$apply(callback);
                                    }

                                    if (vb === 'events') {
                                        msos.console.info(temp_ev + ' ->  done!');
                                    }
                                }
                            );
                        };
                    }
                };
            }

            ng_event_dir.$$moduleName = 'ng';

            ngEventDirectives[directiveName] = ['$parse', '$rootScope', ng_event_dir];
        }
    );

    if (msos_verbose) {
        msos_debug('ng - ngEventDirectives -> created,\n     directives:', _.keys(ngEventDirectives));
    }

    function ng_if_dir($animate, $compile) {
        return {
            multiElement: true,
            transclude: 'element',
            priority: 600,
            terminal: true,
            restrict: 'A',
            $$tlb: true,
            link: function ($scope, $element, $attr, ctrl_na, $transclude) {
                var block, childScope, previousElements;
                $scope.$watch($attr.ngIf, function ngIfWatchAction(value) {

                    if (value) {
                        if (!childScope) {
                            $transclude(function (clone, newScope) {
                                childScope = newScope;
                                clone[clone.length] = $compile.$$createComment('end ngIf', $attr.ngIf);
                                clone.length += 1;   // Faster than .push(), with pre defined array growth.
                                // Note: We only need the first/last node of the cloned nodes.
                                // However, we need to keep the reference to the jqlite wrapper as it might be changed later
                                // by a directive with templateUrl when its template arrives.
                                block = {
                                    clone: clone
                                };
                                $animate.enter(clone, $element.parent(), $element);
                            });
                        }
                    } else {
                        if (previousElements) {
                            previousElements.remove();
                            previousElements = null;
                        }
                        if (childScope) {
                            childScope.$destroy();
                            childScope = null;
                        }
                        if (block) {
                            previousElements = getBlockNodes(block.clone);

                            $animate.leave(previousElements).done(
                                function (response) {
                                    if (response !== false) { previousElements = null; }
                                }
                            );

                            block = null;
                        }
                    }
                });
            }
        };
    }

    ng_if_dir.$$moduleName = 'ng';

    ngIfDirective = ['$animate', '$compile', ng_if_dir];

    function ng_include_dir($templateRequest, $anchorScroll, $animate) {
        var temp_id = 'ng - ngIncludeDirective';

        return {
            restrict: 'ECA',
            priority: 400,
            terminal: true,
            transclude: 'element',
            controller: function ngIncludeDirCtrl() { return undefined; },
            compile: function (element_na, attr) {
                var srcExp = attr.ngInclude || attr.src,
                    onloadExp = attr.onload || '',
                    autoScrollExp = attr.autoscroll;

                return function (scope, $element, $attr_na, ctrl, $transclude) {
                    var changeCounter = 0,
                        currentScope,
                        previousElement,
                        currentElement,
                        cleanupLastIncludeContent = function () {
                            if (previousElement) {
                                previousElement.remove();
                                previousElement = null;
                            }
                            if (currentScope) {
                                currentScope.$destroy();
                                currentScope = null;
                            }

                            if (currentElement) {
                                $animate.leave(currentElement).done(
                                    function (response) {
                                        if (response !== false) { previousElement = null; }
                                    }
                                );

                                previousElement = currentElement;
                                currentElement = null;
                            }
                        };

                    scope.$watch(srcExp, function ngIncludeWatchAction(src) {

                        changeCounter += 1;

                        var thisChangeId = changeCounter,
                            temp_sw = ' - compile - scope.$watch - ngIncludeWatchAction -> ',
                            afterAnimation = function (response) {
                                if (response !== false
                                 && isDefined(autoScrollExp)
                                 && (autoScrollExp !== false || scope.$eval(autoScrollExp))) {
                                    msos_debug(temp_id + temp_sw + 'afterAnimation fired.');
                                    $anchorScroll();
                                }
                            };

                        msos_debug(temp_id + temp_sw + 'start, autoScrollExp:', autoScrollExp);

                        if (src) {
                            $templateRequest(src).then(
                                function (response) {

                                    if (scope.$$destroyed) { return; }
                                    if (thisChangeId !== changeCounter) { return; }

                                    var newScope = scope.$new(),
                                        clone;

                                    newScope.$$name += '_templ' + newScope.$id;
                                    ctrl.template = response;

                                    clone = $transclude(
                                        newScope,
                                        function (clone) {
                                            cleanupLastIncludeContent();
                                            $animate.enter(clone, null, $element).done(afterAnimation);
                                        }
                                    );

                                    currentScope = newScope;
                                    currentElement = clone;

                                    currentScope.$emit('$includeContentLoaded', src);
                                    scope.$eval(onloadExp);
                                },
                                function () {
                                    if (scope.$$destroyed) { return; }

                                    if (thisChangeId === changeCounter) {
                                        cleanupLastIncludeContent();
                                        scope.$emit('$includeContentError', src);
                                    }
                                }
                            );

                            scope.$emit('$includeContentRequested', src);
                        } else {
                            cleanupLastIncludeContent();
                            ctrl.template = null;
                        }

                        msos_debug(temp_id + temp_sw + ' done!');
                    });
                };
            }
        };
    }

    ng_include_dir.$$moduleName = 'ng';

    ngIncludeDirective = ['$templateRequest', '$anchorScroll', '$animate', ng_include_dir];

    function ng_include_fill_content_dir($compile) {

        return {
            restrict: 'ECA',
            priority: -400,
            require: 'ngInclude',
            link: function (scope, $element, $attr_na, ctrl) {

                if (ngto_string.call($element[0]).match(/SVG/)) {
                    $element.empty();
                    $compile(jQuery.buildFragment(ctrl.template, window.document).childNodes)(
                        scope,
                        function namespaceAdaptedClone(clone) { $element.append(clone); },
                        { futureParentElement: $element }
                    );
                    return;
                }

                $element.html(ctrl.template);
                $compile($element.contents())(scope);
            }
        };
    }

    ng_include_fill_content_dir.$$moduleName = 'ng';

    ngIncludeFillContentDirective = ['$compile', ng_include_fill_content_dir];

    ngInitDirective = ngDirective({
        priority: 450,
        compile: function () {
            return {
                pre: function (scope, element_na, attrs) {
                    scope.$eval(attrs.ngInit);
                }
            };
        }
    });

    ngNonBindableDirective = ngDirective({
        terminal: true,
        priority: 1000
    });

    function ng_pluralize_dir($locale, $interpolate) {
        var BRACE = /\{\}/g,
            IS_WHEN = /^when(Minus)?(.+)$/;

        return {
            link: function (scope, element, attr) {
                var numberExp = attr.count,
                    whenExp = attr.$attr.when && element.attr(attr.$attr.when),     // we have {{}} in attrs
                    offset = attr.offset || 0,
                    whens = scope.$eval(whenExp) || {},
                    whensExpFns = {},
                    startSymbol = $interpolate.startSymbol(),
                    endSymbol = $interpolate.endSymbol(),
                    braceReplacement = startSymbol + numberExp + '-' + offset + endSymbol,
                    watchRemover = noop,
                    lastCount;

                function updateElementText(newText) {
                    element.text(newText || '');
                }

                forEach(
                    attr,
                    function (expression_na, attributeName) {
                        var tmpMatch = IS_WHEN.exec(attributeName),
                            whenKey;

                        if (tmpMatch) {
                            whenKey = (tmpMatch[1] ? '-' : '') + lowercase(tmpMatch[2]);
                            whens[whenKey] = element.attr(attr.$attr[attributeName]);
                        }
                    }
                );

                forEach(
                    whens,
                    function (expression, key) {
                        whensExpFns[key] = $interpolate(expression.replace(BRACE, braceReplacement));
                    }
                );

                scope.$watch(
                    numberExp,
                    function ngPluralizeWatchAction(newVal) {
                        var count = parseFloat(newVal),
                            countIsNaN = _.isNaN(count),
                            whenExpFn;

                        if (!countIsNaN && !whens.hasOwnProperty(count)) {
                            // If an explicit number rule such as 1, 2, 3... is defined, just use it.
                            // Otherwise, check it against pluralization rules in $locale service.
                            count = $locale.pluralCat(count - offset);
                        }

                        // If both `count` and `lastCount` are NaN, we don't need to re-register a watch.
                        // In JS `NaN !== NaN`, so we have to exlicitly check.
                        if ((count !== lastCount) && !(countIsNaN && _.isNaN(lastCount))) {
                            watchRemover();
                            whenExpFn = whensExpFns[count];

                            if (_.isUndefined(whenExpFn)) {
                                if (newVal !== null) {
                                    msos.console.warn("ng - ngPluralizeDirective - ngPluralizeWatchAction -> no rule defined for '" + count + "' in " + whenExp);
                                }
                                watchRemover = noop;
                                updateElementText();
                            } else {
                                watchRemover = scope.$watch(whenExpFn, updateElementText);
                            }
                            lastCount = count;
                        }
                    }
                );
            }
        };
    }

    ng_pluralize_dir.$$moduleName = 'ng';

    ngPluralizeDirective = ['$locale', '$interpolate', ng_pluralize_dir];

    function ng_repeat_dir($parse, $animate, $compile) {
        var NG_REMOVED = '$$NG_REMOVED',
            ngRepeatMinErr = minErr('ngRepeat'),
            updateScope = function (scope, index, valueIdentifier, value, keyIdentifier, key, arrayLength) {
                scope[valueIdentifier] = value;
                if (keyIdentifier) { scope[keyIdentifier] = key; }
                scope.$index = index;
                scope.$first = (index === 0);
                scope.$last = (index === (arrayLength - 1));
                scope.$middle = !(scope.$first || scope.$last);
                // jshint bitwise: false
                scope.$even = (index & 1);
                scope.$odd = (scope.$even !== 0);
                // jshint bitwise: true
            },
            getBlockStart = function (block) {
                return block.clone[0];
            },
            getBlockEnd = function (block) {
                return block.clone[block.clone.length - 1];
            };

        return {
            restrict: 'A',
            multiElement: true,
            transclude: 'element',
            priority: 1000,
            terminal: true,
            $$tlb: true,
            compile: function ngRepeatCompile($element_na, $attr) {

                var expression = $attr.ngRepeat,
                    ngRepeatEndComment = $compile.$$createComment('end ngRepeat', expression),
                    match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/),
                    lhs,
                    rhs,
                    aliasAs,
                    trackByExp,
                    valueIdentifier,
                    keyIdentifier,
                    trackByExpGetter,
                    trackByIdExpFn,
                    trackByIdArrayFn,
                    trackByIdObjFn,
                    hashFnLocals = {};

                if (!match) {
                    throw ngRepeatMinErr(
                        'iexp',
                        'Expected expression in form of \'_item_ in _collection_[ track by _id_]\' but got \'{0}\'.',
                        expression
                    );
                }

                lhs = match[1];
                rhs = match[2];
                aliasAs = match[3];
                trackByExp = match[4];

                match = lhs.match(/^(?:(\s*[$\w]+)|\(\s*([$\w]+)\s*,\s*([$\w]+)\s*\))$/);

                if (!match) {
                    throw ngRepeatMinErr(
                        'iidexp',
                        '\'_item_\' in \'_item_ in _collection_\' should be an identifier or \'(_key_, _value_)\' expression, but got \'{0}\'.',
                        lhs
                    );
                }

                valueIdentifier = match[3] || match[1];
                keyIdentifier = match[2];

                if (aliasAs && (!/^[$a-zA-Z_][$a-zA-Z0-9_]*$/.test(aliasAs) || /^(null|undefined|this|\$index|\$first|\$middle|\$last|\$even|\$odd|\$parent|\$root|\$id)$/.test(aliasAs))) {
                    throw ngRepeatMinErr(
                        'badident',
                        'alias \'{0}\' is invalid --- must be a valid JS identifier which is not a reserved name.',
                        aliasAs
                    );
                }

                hashFnLocals = {
                    $id: hashKey
                };

                if (trackByExp) {
                    trackByExpGetter = $parse(trackByExp);
                } else {
                    trackByIdArrayFn = function (key_na, value) {
                        return hashKey(value);
                    };
                    trackByIdObjFn = function (key) {
                        return key;
                    };
                }

                return function ngRepeatLink($scope, $element, $attr_na, ctrl_na, $transclude) {

                    if (trackByExpGetter) {
                        trackByIdExpFn = function (key, value, index) {
                            // assign key, value, and $index to the locals so that they can be used in hash functions
                            if (keyIdentifier) { hashFnLocals[keyIdentifier] = key; }
                            hashFnLocals[valueIdentifier] = value;
                            hashFnLocals.$index = index;
                            return trackByExpGetter($scope, hashFnLocals);
                        };
                    }

                    // Store a list of elements from previous run. This is a hash where key is the item from the
                    // iterator, and the value is objects with following properties.
                    //   - scope: bound scope
                    //   - element: previous element.
                    //   - index: position
                    //
                    // We are using no-proto object so that we don't need to guard against inherited props via
                    // hasOwnProperty.
                    var lastBlockMap = createMap();

                    //watch props
                    $scope.$watchCollection(rhs, function ngRepeatAction(collection) {
                        var index, length, previousNode = $element[0],
                            // node that cloned nodes should be inserted after
                            // initialized to the comment node anchor
                            nextNode,
                            // Same as lastBlockMap but it has the current state. It will become the
                            // lastBlockMap on the next iteration.
                            nextBlockMap = createMap(),
                            collectionLength, key, value, // key/value of iteration
                            trackById, trackByIdFn, collectionKeys, block, // last object information {scope, element, id}
                            nextBlockOrder,
                            elementsToRemove,
                            itemKey,
                            blockKey;

                        if (aliasAs) {
                            $scope[aliasAs] = collection;
                        }

                        if (isArrayLike(collection)) {
                            collectionKeys = collection;
                            trackByIdFn = trackByIdExpFn || trackByIdArrayFn;
                        } else {
                            trackByIdFn = trackByIdExpFn || trackByIdObjFn;
                            // if object, extract keys, in enumeration order, unsorted
                            collectionKeys = [];
                            for (itemKey in collection) {   // Uses hasOwnProperty.call
                                if (hasOwnProperty.call(collection, itemKey) && itemKey.charAt(0) !== '$') {
                                    collectionKeys.push(itemKey);
                                }
                            }
                        }

                        collectionLength = collectionKeys.length;

                        nextBlockOrder = [];
                        nextBlockOrder.length = collectionLength;   // New array with preset length 'collectionLength'

                        // locate existing items
                        for (index = 0; index < collectionLength; index += 1) {
                            key = (collection === collectionKeys) ? index : collectionKeys[index];
                            value = collection[key];
                            trackById = trackByIdFn(key, value, index);
                            if (lastBlockMap[trackById]) {
                                // found previously seen block
                                block = lastBlockMap[trackById];
                                delete lastBlockMap[trackById];
                                nextBlockMap[trackById] = block;
                                nextBlockOrder[index] = block;
                            } else {
                                if (nextBlockMap[trackById]) {
                                    // if collision detected. restore lastBlockMap and throw an error
                                    /* jshint ignore:start */
                                    forEach(nextBlockOrder, function (block) {
                                        if (block && block.scope) { lastBlockMap[block.id] = block; }
                                    });
                                    /* jshint ignore:end */
                                    throw ngRepeatMinErr(
                                        'dupes',
                                        'Duplicates in a repeater are not allowed. Use \'track by\' expression to specify unique keys. Repeater: {0}, Duplicate key: {1}, Duplicate value: {2}',
                                        expression,
                                        trackById,
                                        value
                                    );
                                }
                                // new never before seen block
                                nextBlockOrder[index] = {
                                    id: trackById,
                                    scope: undefined,
                                    clone: undefined
                                };
                                nextBlockMap[trackById] = true;
                            }
                        }

                        // remove leftover items
                        for (blockKey in lastBlockMap) {    // hasOwnProperty na in lastBlockMap

                            block = lastBlockMap[blockKey];
                            elementsToRemove = getBlockNodes(block.clone);
                            $animate.leave(elementsToRemove);

                            if (elementsToRemove[0].parentNode) {
                                // if the element was not removed yet because of pending animation, mark it as deleted
                                // so that we can ignore it later
                                for (index = 0, length = elementsToRemove.length; index < length; index += 1) {
                                    elementsToRemove[index][NG_REMOVED] = true;
                                }
                            }
                            block.scope.$destroy();
                        }

                        // we are not using forEach for perf reasons (trying to avoid #call)
                        for (index = 0; index < collectionLength; index += 1) {
                            key = (collection === collectionKeys) ? index : collectionKeys[index];
                            value = collection[key];
                            block = nextBlockOrder[index];

                            if (block.scope) {
                                // if we have already seen this object, then we need to reuse the
                                // associated scope/element
                                nextNode = previousNode;

                                // skip nodes that are already pending removal via leave animation
                                do {
                                    nextNode = nextNode.nextSibling;
                                } while (nextNode && nextNode[NG_REMOVED]);

                                if (getBlockStart(block) !== nextNode) {
                                    // existing item which got moved
                                    $animate.move(getBlockNodes(block.clone), null, previousNode);
                                }

                                previousNode = getBlockEnd(block);
                                updateScope(block.scope, index, valueIdentifier, value, keyIdentifier, key, collectionLength);
                            } else {
                                // new item which we don't know about
                                /* jshint ignore:start */
                                $transclude(
                                    function ngRepeatTransclude(clone, scope) {
                                        block.scope = scope;
                                        // http://jsperf.com/clone-vs-createcomment
                                        var endNode = ngRepeatEndComment.cloneNode(false);

                                        clone[clone.length] = endNode;
                                        clone.length += 1;   // Faster than .push(), with pre defined array growth.

                                        $animate.enter(clone, null, previousNode);
                                        previousNode = endNode;
                                        // Note: We only need the first/last node of the cloned nodes.
                                        // However, we need to keep the reference to the jqlite wrapper as it might be changed later
                                        // by a directive with templateUrl when its template arrives.
                                        block.clone = clone;
                                        nextBlockMap[block.id] = block;
                                        updateScope(block.scope, index, valueIdentifier, value, keyIdentifier, key, collectionLength);
                                    }
                                );
                                /* jshint ignore:end */
                            }
                        }
                        lastBlockMap = nextBlockMap;
                    });
                };
            }
        };
    }

    ng_repeat_dir.$$moduleName = 'ng';

    ngRepeatDirective = ['$parse', '$animate', '$compile', ng_repeat_dir];

    function ng_show_dir($animate) {
        return {
            restrict: 'A',
            multiElement: true,
            link: function (scope, element, attr) {
                scope.$watch(
                    attr.ngShow,
                    function ngShowWatchAction(value) {
                        msos_debug('ng - ngShowDirective - ngShowWatchAction -> for: ' + value);
                        $animate[value ? 'removeClass' : 'addClass'](
                            element,
                            NG_HIDE_CLASS,
                            { tempClasses: NG_HIDE_IN_PROGRESS_CLASS }
                        );
                    }
                );
            }
        };
    }

    ng_show_dir.$$moduleName = 'ng';

    ngShowDirective = ['$animate', ng_show_dir];

    function ng_hide_dir($animate) {
        return {
            restrict: 'A',
            multiElement: true,
            link: function (scope, element, attr) {
                scope.$watch(
                    attr.ngHide,
                    function ngHideWatchAction(value) {
                        msos_debug('ng - ngHideDirective - ngHideWatchAction -> for: ' + value);
                        $animate[value ? 'addClass' : 'removeClass'](
                            element,
                            NG_HIDE_CLASS,
                            { tempClasses: NG_HIDE_IN_PROGRESS_CLASS }
                        );
                    }
                );
            }
        };
    }

    ng_hide_dir.$$moduleName = 'ng';

    ngHideDirective = ['$animate', ng_hide_dir];

    ngStyleDirective = ngDirective(function (scope, element, attr) {
        scope.$watch(
            attr.ngStyle,
            function ngStyleWatchAction(newStyles, oldStyles) {
                if (oldStyles && (newStyles !== oldStyles)) {
                    forEach(
                        oldStyles,
                        function (value_na, style) { element.css(style, ''); }
                    );
                }
                if (newStyles) { element.css(newStyles); }
            },
            true
        );
    });

    function ng_switch_dir($animate, $compile) {
        var temp_sd = 'ng - ngSwitchDirective';

        return {
            require: 'ngSwitch',

            // asks for $scope to fool the BC controller module
            controller: ['$scope', function NgSwitchController() {
                this.cases = {};
            }],
            link: function (scope, element_na, attr, ngSwitchController) {
                var watchExpr = attr.ngSwitch || attr.on,
                    selectedTranscludes,
                    selectedElements = [],
                    previousLeaveAnimations = [],
                    selectedScopes = [],
                    spliceFactory = function (array, index) {
                        return function (response) {
                            if (response !== false) { array.splice(index, 1); }
                        };
                    };

                scope.$watch(
                    watchExpr,
                    function ngSwitchWatchAction(value) {
                        var temp_sw = ' - scope.$watch - ngSwitchWatchAction -> ',
                            i,
                            ii,
                            selected,
                            runner;

                        msos_debug(temp_sd + temp_sw + 'start, value: ' + String(value));

                        if (msos_verbose) {
                            msos_debug(temp_sd + temp_sw + 'prev. animations:', previousLeaveAnimations);
                        }

                        // Start with the last, in case the array is modified during the loop
                        while (previousLeaveAnimations.length) {
                            $animate.cancel(previousLeaveAnimations.pop());
                        }

                        if (msos_verbose) {
                            msos_debug(temp_sd + temp_sw + 'process selected scopes:', selectedScopes);
                        }

                        for (i = 0, ii = selectedScopes.length; i < ii; i += 1) {
                            selected = getBlockNodes(selectedElements[i].clone);
                            selectedScopes[i].$destroy();
                            runner = previousLeaveAnimations[i] = $animate.leave(selected);
                            runner.done(spliceFactory(previousLeaveAnimations, i));
                        }

                        selectedElements.length = 0;
                        selectedScopes.length = 0;

                        selectedTranscludes = ngSwitchController.cases['!' + value] || ngSwitchController.cases['?'];

                        if (selectedTranscludes) {
                            if (msos_verbose) {
                                msos_debug(temp_sd + temp_sw + 'process selected transcludes:', selectedTranscludes);
                            }

                            forEach(
                                selectedTranscludes,
                                function (selectedTransclude) {
                                    selectedTransclude.transclude(
                                        function (caseElement, selectedScope) {
                                            selectedScopes.push(selectedScope);

                                            var anchor = selectedTransclude.element,
                                                block = {};

                                            caseElement[caseElement.length] = $compile.$$createComment('end ngSwitchWhen');
                                            caseElement.length += 1;   // Faster than .push(), with pre defined array growth.

                                            block = {
                                                clone: caseElement
                                            };

                                            selectedElements.push(block);
                                            $animate.enter(caseElement, anchor.parent(), anchor);
                                        }
                                    );
                                }
                            );
                        }

                        msos_debug(temp_sd + temp_sw + 'done!');
                    }
                );
            }
        };
    }

    ng_switch_dir.$$moduleName = 'ng';

    ngSwitchDirective = ['$animate', '$compile', ng_switch_dir];

    ngSwitchWhenDirective = ngDirective({
        transclude: 'element',
        priority: 1200,
        require: '^ngSwitch',
        multiElement: true,
        link: function (scope_na, element, attrs, ctrl, $transclude) {
            var cases = attrs.ngSwitchWhen.split(
                    attrs.ngSwitchWhenSeparator
                ).sort().filter(
                    // Filter duplicate cases
                    function(element, index, array) {
                        return array[index - 1] !== element;
                    }
                );

            forEach(
                cases,
                function (whenCase) {
                    ctrl.cases['!' + whenCase] = (ctrl.cases['!' + whenCase] || []);
                    ctrl.cases['!' + whenCase].push({
                        transclude: $transclude,
                        element: element
                    });
                }
            );
        }
    });

    ngSwitchDefaultDirective = ngDirective({
        transclude: 'element',
        priority: 1200,
        require: '^ngSwitch',
        multiElement: true,
        link: function (scope_na, element, attr_na, ctrl, $transclude) {
            ctrl.cases['?'] = (ctrl.cases['?'] || []);
            ctrl.cases['?'].push({
                transclude: $transclude,
                element: element
            });
        }
    });

    ngTranscludeMinErr = minErr('ngTransclude');

    ngTranscludeDirective = [
        '$compile',
        function ($compile) {
            return {
                restrict: 'EAC',
                terminal: true,
                compile: function ngTranscludeCompile(tElement) {

                    // Remove and cache any original content to act as a fallback
                    var fallbackLinkFn = $compile(tElement.contents()),
                        slotName;

                    tElement.empty();

                    return function ngTranscludePostLink($scope, $element, $attrs, controller_na, $transclude) {

                        if (!$transclude) {
                            throw ngTranscludeMinErr(
                                'orphan',
                                'Illegal use: ngTransclude dir. (template)! NA parent dir. that requires a transclusion, in element: {0}',
                                startingTag($element)
                            );
                        }

                        function useFallbackContent() {
                            fallbackLinkFn(
                                $scope,
                                function (clone) { $element.append(clone); }
                            );
                        }

                        function notWhitespace(nodes) {
                            var i = 0,
                                node;

                            for (i = 0; i < nodes.length; i += 1) {
                                node = nodes[i];

                                if (node.nodeType !== NODE_TYPE_TEXT
                                 || node.nodeValue.trim()) {
                                    return true;
                                }
                            }

                            return false;
                        }

                        function ngTranscludeCloneAttachFn(clone, transcludedScope) {

                            if (clone.length && notWhitespace(clone)) {
                                $element.append(clone);
                            } else {
                                useFallbackContent();
                                transcludedScope.$destroy();
                            }
                        }

                        // If the attribute is of the form: `ng-transclude="ng-transclude"` then treat it like the default
                        if ($attrs.ngTransclude === $attrs.$attr.ngTransclude) {
                            $attrs.ngTransclude = '';
                        }

                        slotName = $attrs.ngTransclude || $attrs.ngTranscludeSlot;

                        $transclude(ngTranscludeCloneAttachFn, null, slotName);

                        if (slotName && !$transclude.isSlotFilled(slotName)) {
                            useFallbackContent();
                        }
                    };
                }
            };
        }
    ];

    scriptDirective = ['$templateCache', function ($templateCache) {
        return {
            restrict: 'E',
            terminal: true,
            compile: function (element, attr) {
                if (attr.type === 'text/ng-template') {
                    var templateUrl = attr.id,
                        // IE is not consistent, in scripts we have to read .text but in other nodes we have to read .textContent
                        text = element[0].text;

                    $templateCache.put(templateUrl, text);
                }
            }
        };
    }];

    $ngOptionsMinErr = minErr('ngOptions');

    ngOptionsDirective = ['$compile', '$document', '$parse', function ($compile, $document, $parse) {
        var optionTemplate = window.document.createElement('option'),
            optGroupTemplate = window.document.createElement('optgroup');

        function parseOptionsExpression(optionsExp, selectElement, scope) {
            var match = optionsExp.match(NG_OPTIONS_REGEXP),
                locals = {},
                valueName = match[5] || match[7],
                keyName = match[6],
                selectAs = / as /.test(match[0]) && match[1],
                trackBy = match[9],
                valueFn = $parse(match[2] ? match[1] : valueName),
                selectAsFn = selectAs && $parse(selectAs),
                viewValueFn = selectAsFn || valueFn,
                trackByFn = trackBy && $parse(trackBy),
                getLocals = keyName
                    ? function (value, key) {
                        locals[keyName] = key;
                        locals[valueName] = value;
                        return locals;
                    }
                    : function (value) {
                        locals[valueName] = value;
                        return locals;
                    },
                getTrackByValueFn = trackBy
                    ? function (value_na, locals) { return trackByFn(scope, locals); }
                    : function getHashOfValue(value) { return hashKey(value); },
                getTrackByValue = function (value, key) {
                    return getTrackByValueFn(value, getLocals(value, key));
                },
                displayFn = $parse(match[2] || match[1]),
                groupByFn = $parse(match[3] || ''),
                disableWhenFn = $parse(match[4] || ''),
                valuesFn = $parse(match[8]);

            function Option(selectValue, viewValue, label, group, disabled) {
                this.selectValue = selectValue;
                this.viewValue = viewValue;
                this.label = label;
                this.group = group;
                this.disabled = disabled;
            }

            function getOptionValuesKeys(optionValues) {
                var optionValuesKeys,
                    itemKey;

                if (!keyName && isArrayLike(optionValues)) {
                    optionValuesKeys = optionValues;
                } else {
                    // if object, extract keys, in enumeration order, unsorted
                    optionValuesKeys = [];
                    for (itemKey in optionValues) {
                        if (optionValues.hasOwnProperty(itemKey) && itemKey.charAt(0) !== '$') {
                            optionValuesKeys.push(itemKey);
                        }
                    }
                }

                return optionValuesKeys;
            }

            if (!(match)) {
                throw $ngOptionsMinErr(
                    'iexp',
                    'Expected expression in form of \'_select_ (as _label_)? for (_key_,)?_value_ in _collection_\' but got \'{0}\'. Element: {1}',
                    optionsExp,
                    startingTag(selectElement)
                );
            }

            return {
                trackBy: trackBy,
                getTrackByValue: getTrackByValue,
                getWatchables: $parse(
                    valuesFn,
                    function (optionValues) {
                        var watchedArray = [],
                            optionValuesKeys,
                            optionValuesLength,
                            index = 0,
                            key,
                            value,
                            locals,
                            selectValue,
                            label,
                            disableWhen;

                        optionValues = optionValues || [];

                        optionValuesKeys = getOptionValuesKeys(optionValues);
                        optionValuesLength = optionValuesKeys.length;

                        for (index = 0; index < optionValuesLength; index += 1) {
                            key = (optionValues === optionValuesKeys) ? index : optionValuesKeys[index];
                            value = optionValues[key];

                            locals = getLocals(value, key);
                            selectValue = getTrackByValueFn(value, locals);

                            watchedArray.push(selectValue);

                            // Only need to watch the displayFn if there is a specific label expression
                            if (match[2] || match[1]) {
                                label = displayFn(scope, locals);
                                watchedArray.push(label);
                            }

                            // Only need to watch the disableWhenFn if there is a specific disable expression
                            if (match[4] && disableWhenFn !== noop) {       // Experimental, Do we need to "watch" undefined? I'm guessing no!
                                disableWhen = disableWhenFn(scope, locals);
                                watchedArray.push(disableWhen);
                            }
                        }

                        return watchedArray;
                    }
                ),

                getOptions: function () {
                    var optionItems = [],
                        selectValueMap = {},
                        optionValues = valuesFn(scope) || [],
                        optionValuesKeys,
                        optionValuesLength,
                        index = 0,
                        key,
                        value,
                        locals,
                        viewValue,
                        selectValue,
                        label,
                        group,
                        disabled,
                        optionItem;

                    optionValuesKeys = getOptionValuesKeys(optionValues);
                    optionValuesLength = optionValuesKeys.length;

                    for (index = 0; index < optionValuesLength; index += 1) {
                        key = (optionValues === optionValuesKeys) ? index : optionValuesKeys[index];
                        value = optionValues[key];
                        locals = getLocals(value, key);
                        viewValue = viewValueFn(scope, locals);
                        selectValue = getTrackByValueFn(viewValue, locals);
                        label = displayFn(scope, locals);
                        group = groupByFn !== noop ? groupByFn(scope, locals) : undefined;
                        disabled = disableWhenFn !== noop ? disableWhenFn(scope, locals) : undefined;
                        optionItem = new Option(selectValue, viewValue, label, group, disabled);

                        optionItems.push(optionItem);
                        selectValueMap[selectValue] = optionItem;
                    }

                    return {
                        items: optionItems,
                        selectValueMap: selectValueMap,
                        getOptionFromViewValue: function (value) {
                            return selectValueMap[getTrackByValue(value)];
                        },
                        getViewValueFromOption: function (option) {
                            // If the viewValue could be an object that may be mutated by the application,
                            // we need to make a copy and not return the reference to the value on the option.
                            return trackBy ? copy(option.viewValue) : option.viewValue;
                        }
                    };
                }
            };
        }

        function ngOptionsPostLink(scope, selectElement, attr, ctrls) {
            var selectCtrl = ctrls[0],
                ngModelCtrl = ctrls[1],
                multiple = attr.multiple,
                i = 0,
                ii = 0,
                children,
                providedEmptyOption,
                unknownOption,
                options,
                ngOptions,
                listFragment = $document[0].createDocumentFragment();

            for (i = 0, children = selectElement.children(), ii = children.length; i < ii; i += 1) {
                if (children[i].value === '') {
                    selectCtrl.hasEmptyOption = true;
                    selectCtrl.emptyOption = children.eq(i);
                    break;
                }
            }

            selectElement.empty();

            providedEmptyOption = !!selectCtrl.emptyOption;

            unknownOption = jqLite(optionTemplate.cloneNode(false));
            unknownOption.val('?');

            ngOptions = parseOptionsExpression(attr.ngOptions, selectElement, scope);

            function getAndUpdateSelectedOption(viewValue) {
                var option = options.getOptionFromViewValue(viewValue),
                    element = option && option.element;

                if (element && !element.selected) { element.selected = true; }

                return option;
            }

            function updateOptionElement(option, element) {
                option.element = element;
                element.disabled = option.disabled;

                if (option.label !== element.label) {
                    element.label = option.label;
                    element.textContent = option.label;
                }

                element.value = option.selectValue;
            }

            function addOptionElement(option, parent) {
                var optionElement = optionTemplate.cloneNode(false);

                parent.appendChild(optionElement);
                updateOptionElement(option, optionElement);
            }

            function updateOptions() {
                var previousValue = options && selectCtrl.readValue(),
                    i = 0,
                    option,
                    groupElementMap = {},
                    nextValue,
                    isNotPrimitive;

                if (options) {
                    for (i = options.items.length - 1; i >= 0; i -= 1) {
                        option = options.items[i];

                        if (isDefined(option.group)) {
                            jqLite(option.element.parentNode).remove();
                        } else {
                            jqLite(option.element).remove();
                        }
                    }
                }

                options = ngOptions.getOptions();

                options.items.forEach(
                    function addOption(option) {
                        var groupElement;

                        if (isDefined(option.group)) {

                            // This option is to live in a group
                            // See if we have already created this group
                            groupElement = groupElementMap[option.group];

                            if (!groupElement) {

                                groupElement = optGroupTemplate.cloneNode(false);
                                listFragment.appendChild(groupElement);

                                // Update the label on the group element
                                // "null" is special cased because of Safari
                                groupElement.label = option.group === null ? 'null' : option.group;

                                // Store it for use later
                                groupElementMap[option.group] = groupElement;
                            }

                            addOptionElement(option, groupElement);

                        } else {

                            // This option is not in a group
                            addOptionElement(option, listFragment);
                        }
                    }
                );

                selectElement[0].appendChild(listFragment);

                if (ngModelCtrl.$render !== noop) {
                    ngModelCtrl.$render();
                }

                // Check to see if the value has changed due to the update to the options
                if (!ngModelCtrl.$isEmpty(previousValue)) {
                    nextValue = selectCtrl.readValue();
                    isNotPrimitive = ngOptions.trackBy || multiple;

                    if (isNotPrimitive ? !equals(previousValue, nextValue) : previousValue !== nextValue) {
                        ngModelCtrl.$setViewValue(nextValue);
                        if (ngModelCtrl.$render !== noop) {
                            ngModelCtrl.$render();
                        }
                    }
                }
            }

            // Overwrite the implementation. ngOptions doesn't use hashes
            selectCtrl.generateUnknownOptionValue = function () { return '?'; };

            // Update the controller methods for multiple selectable options
            if (!multiple) {

                selectCtrl.writeValue = function writeNgOptionsValue(value) {
                    if (!options) return;

                    var selectedOption = selectElement[0].options[selectElement[0].selectedIndex],
                        option = options.getOptionFromViewValue(value);

                    // Make sure to remove the selected attribute from the previously selected option
                    // Otherwise, screen readers might get confused
                    if (selectedOption) {
                        selectedOption.removeAttribute('selected');
                    }

                    if (option) {

                        if (selectElement[0].value !== option.selectValue) {
                            selectCtrl.removeUnknownOption();

                            selectElement[0].value = option.selectValue;
                            option.element.selected = true;
                        }

                        option.element.setAttribute('selected', 'selected');

                    } else {
                        selectCtrl.selectUnknownOrEmptyOption(value);
                    }
                };

                selectCtrl.readValue = function readNgOptionsValue() {

                    var selectedOption = options.selectValueMap[selectElement.val()];

                    if (selectedOption && !selectedOption.disabled) {

                        selectCtrl.unselectEmptyOption();
                        selectCtrl.removeUnknownOption();

                        return options.getViewValueFromOption(selectedOption);
                    }

                    return null;
                };

                // If we are using `track by` then we must watch the tracked value on the model
                // since ngModel only watches for object identity change
                if (ngOptions.trackBy) {
                    scope.$watch(
                        function ngOptionsPostLink_trackBy() { return ngOptions.getTrackByValue(ngModelCtrl.$viewValue); },
                        function () {
                            if (ngModelCtrl.$render !== noop) {
                                ngModelCtrl.$render();
                            }
                        }
                    );
                }

            } else {

                selectCtrl.writeValue = function writeNgOptionsMultiple(values) {
                    if (!options) { return; }
                    // Only set `<option>.selected` if necessary, in order to prevent some browsers from
                    // scrolling to `<option>` elements that are outside the `<select>` element's viewport.
                    var selectedOptions = values && values.map(getAndUpdateSelectedOption) || [];

                    options.items.forEach(
                        function (option) {
                            if (option.element.selected && !_.includes(selectedOptions, option)) {
                                option.element.selected = false;
                            }
                        }
                    );
                };

                selectCtrl.readValue = function readNgOptionsMultiple() {
                    var selectedValues = selectElement.val() || [],
                        selections = [];

                    forEach(
                        selectedValues,
                        function (value) {
                            var option = options.selectValueMap[value];

                            if (option && !option.disabled) { selections.push(options.getViewValueFromOption(option)); }
                        }
                    );

                    return selections;
                };

                // If we are using `track by` then we must watch these tracked values on the model
                // since ngModel only watches for object identity change
                if (ngOptions.trackBy) {

                    scope.$watchCollection(
                        function () {
                            if (_.isArray(ngModelCtrl.$viewValue)) {
                                return ngModelCtrl.$viewValue.map(
                                    function (value) {
                                        return ngOptions.getTrackByValue(value);
                                    }
                                );
                            }
                            return undefined;
                        },
                        function () {
                            if (ngModelCtrl.$render !== noop) {
                                ngModelCtrl.$render();
                            }
                        }
                    );
                }
            }

            if (providedEmptyOption) {

                // compile the element since there might be bindings in it
                $compile(selectCtrl.emptyOption)(scope);

                selectElement.prepend(selectCtrl.emptyOption);

                if (selectCtrl.emptyOption[0].nodeType === NODE_TYPE_COMMENT) {
                    // This means the empty option has currently no actual DOM node, probably because
                    // it has been modified by a transclusion directive.
                    selectCtrl.hasEmptyOption = false;

                    // Redefine the registerOption function, which will catch
                    // options that are added by ngIf etc. (rendering of the node is async because of
                    // lazy transclusion)
                    selectCtrl.registerOption = function (optionScope, optionEl) {
                        if (optionEl.val() === '') {
                            selectCtrl.hasEmptyOption = true;
                            selectCtrl.emptyOption = optionEl;
                            selectCtrl.emptyOption.removeClass('ng-scope');
                            // This ensures the new empty option is selected if previously no option was selected
                            ngModelCtrl.$render();

                            optionEl.on(
                                '$destroy',
                                function () {
                                    var needsRerender = selectCtrl.$isEmptyOptionSelected();

                                    selectCtrl.hasEmptyOption = false;
                                    selectCtrl.emptyOption = undefined;

                                    if (needsRerender) { ngModelCtrl.$render(); }
                                }
                            );
                        }
                    };
                } else {
                    // remove the class, which is added automatically because we recompile the element and it
                    // becomes the compilation root
                    selectCtrl.emptyOption.removeClass('ng-scope');
                }
            }

            // We will re-render the option elements if the option values or labels change
            scope.$watchCollection(ngOptions.getWatchables, updateOptions);
        }

        return {
            restrict: 'A',
            terminal: true,
            require: ['select', 'ngModel'],
            link: {
                pre: function ngOptionsPreLink(scope_na, selectElement_na, attr_na, ctrls) {
                    ctrls[0].registerOption = noop;
                },
                post: ngOptionsPostLink
            }
        };
    }];

    noopNgModelController = {
        $setViewValue: noop,
        $render: noop
    };

    function setOptionSelectedStatus(optionEl, value) {
        optionEl.prop('selected', value);
        optionEl.attr('selected', value);
    }

    SelectController = ['$element', '$scope', function ($element, $scope) {

        var self = this,
            optionsMap = new NgMap(),
            renderScheduled = false,
            updateScheduled = false;

        function scheduleRender() {
            if (renderScheduled) { return; }

            if (self.ngModelCtrl.$render !== noop) {

                renderScheduled = true;

                $scope.$$postDigest(
                    function () {
                        renderScheduled = false;
                        self.ngModelCtrl.$render();
                    }
                );

            } else if (msos_verbose) {
                msos_debug('ng - SelectController - scheduleRender -> skipped rendering for noop!');
            }
        }

        function scheduleViewValueUpdate(renderAfter) {
            if (updateScheduled) { return; }

            updateScheduled = true;

            $scope.$$postDigest(
                function () {
                    if ($scope.$$destroyed) { return; }

                    updateScheduled = false;
                    self.ngModelCtrl.$setViewValue(self.readValue());

                    if (renderAfter) {
                        self.ngModelCtrl.$render();
                    }
                }
            );
        }

        self.selectValueMap = {}; // Keys are the hashed values, values the original values

         // If the ngModel doesn't get provided then provide a dummy noop version to prevent errors
        self.ngModelCtrl = noopNgModelController;
        self.multiple = false;

        self.unknownOption = jqLite(window.document.createElement('option'));
        self.hasEmptyOption = false;
        self.emptyOption = undefined;

        self.renderUnknownOption = function (val) {
            var unknownVal = self.generateUnknownOptionValue(val);

            self.unknownOption.val(unknownVal);
            $element.prepend(self.unknownOption);
            setOptionSelectedStatus(self.unknownOption, true);
            $element.val(unknownVal);
        };

        self.updateUnknownOption = function (val) {
            var unknownVal = self.generateUnknownOptionValue(val);

            self.unknownOption.val(unknownVal);
            setOptionSelectedStatus(self.unknownOption, true);
            $element.val(unknownVal);
        };

        self.generateUnknownOptionValue = function (val) {
            return '? ' + hashKey(val) + ' ?';
        };

        self.removeUnknownOption = function () {
            if (self.unknownOption.parent()) { self.unknownOption.remove(); }
        };

        self.selectEmptyOption = function () {
            if (self.emptyOption) {
                $element.val('');
                setOptionSelectedStatus(self.emptyOption, true);
            }
        };

        self.unselectEmptyOption = function () {
            if (self.hasEmptyOption) {
                setOptionSelectedStatus(self.emptyOption, false);
            }
        };

        self.$hasEmptyOption = function () {
            return self.hasEmptyOption;
        };

        self.$isUnknownOptionSelected = function () {
            return $element[0].options[0] === self.unknownOption[0];
        };

        self.$isEmptyOptionSelected = function () {
            return self.hasEmptyOption && $element[0].options[$element[0].selectedIndex] === self.emptyOption[0];
        };

        self.selectUnknownOrEmptyOption = function (value) {
            if (value == null && self.emptyOption) {
                self.removeUnknownOption();
                self.selectEmptyOption();
            } else if (self.unknownOption.parent().length) {
                self.updateUnknownOption(value);
            } else {
                self.renderUnknownOption(value);
            }
        };

        $scope.$on(
            '$destroy',
            function () {
                self.renderUnknownOption = noop;
            }
        );

        // Read the value of the select control, the implementation of this changes depending
        // upon whether the select can have multiple values and whether ngOptions is at work.
        self.readValue = function readSingleValue() {
            var val = $element.val(),
                realVal = self.selectValueMap.hasOwnProperty(val) ? self.selectValueMap[val] : val;

            if (self.hasOption(realVal)) { return realVal; }

            return null;
        };

        // Write the value to the select control, the implementation of this changes depending
        // upon whether the select can have multiple values and whether ngOptions is at work.
        self.writeValue = function writeSingleValue(value) {
            var currentlySelectedOption = $element[0].options[$element[0].selectedIndex],
                hashedVal,
                selectedOption;

            if (currentlySelectedOption) {
                setOptionSelectedStatus(jqLite(currentlySelectedOption), false);
            }

            if (self.hasOption(value)) {
                self.removeUnknownOption();

                hashedVal = hashKey(value);
                $element.val(self.selectValueMap.hasOwnProperty(hashedVal) ? hashedVal : value);

                selectedOption = $element[0].options[$element[0].selectedIndex];

                setOptionSelectedStatus(jqLite(selectedOption), true);
            } else {
                self.selectUnknownOrEmptyOption(value);
            }
        };

        // Tell the select control that an option, with the given value, has been added
        self.addOption = function (value, element) {
            var count = 0;

            // Skip comment nodes, as they only pollute the `optionsMap`
            if (element[0].nodeType === NODE_TYPE_COMMENT) { return; }

            assertNotHasOwnProperty(value, '"option value"');

            if (value === '') {
                self.hasEmptyOption = true;
                self.emptyOption = element;
            }

            count = optionsMap.get(value) || 0;
            optionsMap.set(value, count + 1);

            scheduleRender();
        };

        // Tell the select control that an option, with the given value, has been removed
        self.removeOption = function (value) {
            var count = optionsMap.get(value);

            if (count) {
                if (count === 1) {
                    optionsMap['delete'](value);
                    if (value === '') {
                        self.hasEmptyOption = false;
                        self.emptyOption = undefined;
                    }
                } else {
                    optionsMap.set(value, count - 1);
                }
            }
        };

        // Check whether the select control has an option matching the given value
        self.hasOption = function (value) {
            return !!optionsMap.get(value);
        };

        self.registerOption = function (optionScope, optionElement, optionAttrs, interpolateValueFn, interpolateTextFn) {
            var oldVal,
                hashedVal = NaN;

            if (optionAttrs.$attr.ngValue) {
                // The value attribute is interpolated
                optionAttrs.$observe(
                    'value',
                    function valueAttributeObserveAction(newVal) {

                        var removal,
                            previouslySelected = optionElement.prop('selected');

                        if (isDefined(hashedVal)) {
                            self.removeOption(oldVal);
                            delete self.selectValueMap[hashedVal];
                            removal = true;
                        }

                        hashedVal = hashKey(newVal);
                        oldVal = newVal;
                        self.selectValueMap[hashedVal] = newVal;

                        self.addOption(newVal, optionElement);
                        optionElement.attr('value', hashedVal);

                        if (removal && previouslySelected) {
                            scheduleViewValueUpdate();
                        }
                    }
                );

            } else if (interpolateValueFn) {
                // The value attribute is interpolated
                optionAttrs.$observe(
                    'value',
                    function valueAttributeObserveAction(newVal) {
                        // This method is overwritten in ngOptions and has side-effects!
                        self.readValue();

                        var removal,
                            previouslySelected = optionElement.prop('selected');

                        if (isDefined(oldVal)) {
                            self.removeOption(oldVal);
                            removal = true;
                        }

                        oldVal = newVal;
                        self.addOption(newVal, optionElement);

                        if (removal && previouslySelected) {
                            scheduleViewValueUpdate();
                        }
                    }
                );
            } else if (interpolateTextFn) {
                // The text content is interpolated
                optionScope.$watch(
                    interpolateTextFn,
                    function interpolateWatchAction(newVal, oldVal) {
                        optionAttrs.$set('value', newVal);

                        var previouslySelected = optionElement.prop('selected');

                        if (oldVal !== newVal) {
                            self.removeOption(oldVal);
                        }

                        self.addOption(newVal, optionElement);

                        if (oldVal && previouslySelected) {
                            scheduleViewValueUpdate();
                        }
                    }
                );
            } else {
                // The value attribute is static
                self.addOption(optionAttrs.value, optionElement);
            }

            optionAttrs.$observe(
                'disabled',
                function (newVal) {

                    if (newVal === 'true' || (newVal && optionElement.prop('selected'))) {
                        if (self.multiple) {
                            scheduleViewValueUpdate(true);
                        } else {
                            self.ngModelCtrl.$setViewValue(null);
                            self.ngModelCtrl.$render();
                        }
                    }
                }
            );

            optionElement.on(
                '$destroy',
                function () {
                    var currentValue = self.readValue(),
                        removeValue = optionAttrs.value;

                    self.removeOption(removeValue);
                    scheduleRender();

                    if ((self.multiple && currentValue && (currentValue.indexOf(removeValue) !== -1))
                     || currentValue === removeValue) {
                        scheduleViewValueUpdate(true);
                    }
                }
            );
        };
    }];

    selectDirective = function () {

        function selectPreLink(scope, element, attr, ctrls) {
            var selectCtrl = ctrls[0],
                ngModelCtrl = ctrls[1],
                lastView,
                lastViewRef = NaN;

            // if ngModel is not defined, we don't need to do anything but set the registerOption
            // function to noop, so options don't get added internally
            if (!ngModelCtrl) {
                selectCtrl.registerOption = noop;
                return;
            }

            selectCtrl.ngModelCtrl = ngModelCtrl;

            element.on(
                'change',
                function () {
                    selectCtrl.removeUnknownOption();
                    if (scope.$apply !== noop) {
                        scope.$apply(
                            function selectPreLinkScopeApply() { ngModelCtrl.$setViewValue(selectCtrl.readValue()); }
                        );
                    }
                }
            );

            if (attr.multiple) {
                selectCtrl.multiple = true;

                selectCtrl.readValue = function readMultipleValue() {
                    var array = [];

                    forEach(
                        element.find('option'),
                        function (option) {
                            var val = option.value;

                            if (option.selected && !option.disabled) {
                                array.push(selectCtrl.selectValueMap.hasOwnProperty(val) ? selectCtrl.selectValueMap[val] : val);
                            }
                        }
                    );

                    return array;
                };

                // Write value now needs to set the selected property of each matching option
                selectCtrl.writeValue = function writeMultipleValue(value) {
                    forEach(
                        element.find('option'),
                        function (option) {
                            var shouldBeSelected = !!value && (_.includes(value, option.value) || _.includes(value, selectCtrl.selectValueMap[option.value])),
                                currentlySelected = option.selected;

                            if (shouldBeSelected !== currentlySelected) {
                                setOptionSelectedStatus(jqLite(option), shouldBeSelected);
                            }
                        }
                    );
                };

                // we have to do it on each watch since ngModel watches reference, but
                // we need to work of an array, so we need to see if anything was inserted/removed
                scope.$watch(
                    function selectMultipleWatch() {
                        if (lastViewRef === ngModelCtrl.$viewValue && !equals(lastView, ngModelCtrl.$viewValue)) {
                            lastView = shallowCopy(ngModelCtrl.$viewValue);
                            if (ngModelCtrl.$render !== noop) {
                                ngModelCtrl.$render();
                            }
                        }
                        lastViewRef = ngModelCtrl.$viewValue;
                    }
                );

                // If we are a multiple select then value is now a collection
                // so the meaning of $isEmpty changes
                ngModelCtrl.$isEmpty = function (value) {
                    return !value || value.length === 0;
                };
            }
        }

        function selectPostLink(scope_na, element_na, attrs_na, ctrls) {
            // if ngModel is not defined, we don't need to do anything
            var selectCtrl = ctrls[0],
                ngModelCtrl = ctrls[1];

            if (!ngModelCtrl) { return; }

            ngModelCtrl.$render = function () { selectCtrl.writeValue(ngModelCtrl.$viewValue); };
        }

        return {
            restrict: 'E',
            require: ['select', '?ngModel'],
            controller: SelectController,
            priority: 1,
            link: {
                pre: selectPreLink,
                post: selectPostLink
            }
        };
    };

    optionDirective = ['$interpolate', function ($interpolate) {

        return {
            restrict: 'E',
            priority: 100,
            compile: function (element, attr) {
                var interpolateValueFn,
                    interpolateTextFn;

                if (isDefined(attr.ngValue)) {
                    // Will be handled by registerOption
                    msos_debug('ng - optionDirective -> attr.ngValue:', attr.ngValue);
                } else if (isDefined(attr.value)) {
                    interpolateValueFn = $interpolate(attr.value, true);
                } else {
                    interpolateTextFn = $interpolate(element.text(), true);

                    if (!interpolateTextFn) {
                        attr.$set('value', element.text());
                    }
                }

                return function (scope, element, attr) {

                    var selectCtrlName = '$selectController',
                        parent = element.parent(),
                        selectCtrl = parent.data(selectCtrlName) || parent.parent().data(selectCtrlName); // in case we are in optgroup

                    if (selectCtrl) {
                        selectCtrl.registerOption(
                            scope,
                            element,
                            attr,
                            interpolateValueFn,
                            interpolateTextFn
                        );
                    }
                };
            }
        };
    }];

    function publishExternalAPI(angular) {

        var temp_pe = 'ng - publishExternalAPI';

        msos_debug(temp_pe + ' ~~~> start.');

        extend(angular, {
            'errorHandlingConfig': errorHandlingConfig,
            'bootstrap': msos.config.debug ? bootstrap_deferred : bootstrap,  // debug console is very slow, so make sure Ng is ready
            'copy': copy,
            'extend': extend,
            'merge': merge,
            'equals': equals,
            'makeMap': makeMap,
            'element': jqLite,
            'forEach': forEach,
            'injector': createInjector,
            'noop': noop,
            'bind': ng_bind,
            'toJson': toJson,
            'fromJson': fromJson,
            'identity': identity,
            'isUndefined': _.isUndefined,
            'isDefined': isDefined,
            'isString': _.isString,
            'isFunction': _.isFunction,
            'isObject': isObject,           // Watch this, not the same as _.isObject
            'isNumber': _.isNumber,
            'isElement': isElement,
            'isArray': _.isArray,
            'baseHref': baseHref,           // replaces $browser.baseHref(), w/o function
            'inherit': inherit,
            'version': version,
            'isDate': _.isDate,
            'lowercase': lowercase,
            'uppercase': uppercase,
            'mergeClasses': mergeClasses,
            'removeComments': removeComments,
            'extractElementNode': extractElementNode,
            'isPromiseLike': isPromiseLike,
            'splitClasses': splitClasses,
            'callbacks': {
                $$counter: 0
            },
            '$$minErr': minErr,
            '$$csp': function () { return true; },   // Always true now (we default to use csp always)
            'blockElements': blockElements,
            'validElements': validElements,
            'snakeCase': snake_case,
            '$$encodeUriSegment': encodeUriSegment,
            '$$encodeUriQuery': encodeUriQuery,
            '$$stringify': stringify
        });

        angularModule = setupModuleLoader(window);

        angularModule("ngLocale", ['ng'], ["$provide", function ngLocaleModule($provide) {
            var PLURAL_CATEGORY = {
                    ZERO: "zero",
                    ONE: "one",
                    TWO: "two",
                    FEW: "few",
                    MANY: "many",
                    OTHER: "other"
                };

            function getDecimals(n) {
                n = String(n);

                var i = n.indexOf('.');

                return (i === -1) ? 0 : n.length - i - 1;
            }

            function getVF(n, opt_precision) {
                var v = opt_precision,
                    base,
                    f;

                if (undefined === v) {
                    v = Math.min(getDecimals(n), 3);
                }

                base = Math.pow(10, v);
                f = ((n * base) | 0) % base;

                return {
                    v: v,
                    f: f
                };
            }
        
            $provide.value("$locale", {
                "DATETIME_FORMATS": {
                    "AMPMS": [
                        "AM",
                        "PM"
                    ],
                    "DAY": [
                        "Sunday",
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday"
                    ],
                    "ERANAMES": [
                        "Before Christ",
                        "Anno Domini"
                    ],
                    "ERAS": [
                        "BC",
                        "AD"
                    ],
                    "FIRSTDAYOFWEEK": 6,
                    "MONTH": [
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December"
                    ],
                    "SHORTDAY": [
                        "Sun",
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat"
                    ],
                    "SHORTMONTH": [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec"
                    ],
                    "STANDALONEMONTH": [
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December"
                    ],
                    "WEEKENDRANGE": [
                        5,
                        6
                    ],
                    "fullDate": "EEEE, MMMM d, y",
                    "longDate": "MMMM d, y",
                    "medium": "MMM d, y h:mm:ss a",
                    "mediumDate": "MMM d, y",
                    "mediumTime": "h:mm:ss a",
                    "short": "M/d/yy h:mm a",
                    "shortDate": "M/d/yy",
                    "shortTime": "h:mm a"
                },
                "NUMBER_FORMATS": {
                    "CURRENCY_SYM": "$",
                    "DECIMAL_SEP": ".",
                    "GROUP_SEP": ",",
                    "PATTERNS": [{
                        "gSize": 3,
                        "lgSize": 3,
                        "maxFrac": 3,
                        "minFrac": 0,
                        "minInt": 1,
                        "negPre": "-",
                        "negSuf": "",
                        "posPre": "",
                        "posSuf": ""
                    }, {
                        "gSize": 3,
                        "lgSize": 3,
                        "maxFrac": 2,
                        "minFrac": 2,
                        "minInt": 1,
                        "negPre": "-\u00a4",
                        "negSuf": "",
                        "posPre": "\u00a4",
                        "posSuf": ""
                    }]
                },
                "id": "en-us",
                "localeID": "en_US",
                "pluralCat": function (n, opt_precision) {
                    var i = n | 0,
                        vf = getVF(n, opt_precision);

                    if (i === 1 && vf.v === 0) {
                        return PLURAL_CATEGORY.ONE;
                    }

                    return PLURAL_CATEGORY.OTHER;
                }
            });
        }]);

        angularModule('ng', ['ngLocale'], ['$provide', function ngModule($provide) {

            msos_debug(temp_pe + ' - ngModule ~~~> start.');

            // $$sanitizeUriProvider needs to be before $compileProvider as it is used by it.
            $provide.provider({
                $$sanitizeUri: $$SanitizeUriProvider
            });

            $provide.provider(
                '$compile',
                $CompileProvider
            ).directive({
                a: htmlAnchorDirective,
                input: inputDirective,
                textarea: inputDirective,
                form: formDirective,
                script: scriptDirective,
                select: selectDirective,
                option: optionDirective,
                ngBind: ngBindDirective,
                ngBindHtml: ngBindHtmlDirective,
                ngBindTemplate: ngBindTemplateDirective,
                ngClass: ngClassDirective,
                ngClassEven: ngClassEvenDirective,
                ngClassOdd: ngClassOddDirective,
                ngCloak: ngCloakDirective,
                ngController: ngControllerDirective,
                ngForm: ngFormDirective,
                ngHide: ngHideDirective,
                ngIf: ngIfDirective,
                ngInclude: ngIncludeDirective,
                ngInit: ngInitDirective,
                ngNonBindable: ngNonBindableDirective,
                ngPluralize: ngPluralizeDirective,
                ngRepeat: ngRepeatDirective,
                ngShow: ngShowDirective,
                ngStyle: ngStyleDirective,
                ngSwitch: ngSwitchDirective,
                ngSwitchWhen: ngSwitchWhenDirective,
                ngSwitchDefault: ngSwitchDefaultDirective,
                ngOptions: ngOptionsDirective,
                ngTransclude: ngTranscludeDirective,
                ngModel: ngModelDirective,
                ngList: ngListDirective,
                ngChange: ngChangeDirective,
                pattern: patternDirective,
                ngPattern: patternDirective,
                required: requiredDirective,
                ngRequired: requiredDirective,
                minlength: minlengthDirective,
                ngMinlength: minlengthDirective,
                maxlength: maxlengthDirective,
                ngMaxlength: maxlengthDirective,
                ngValue: ngValueDirective,
                ngTrueValue: ngAttrDivective,
                ngFalseValue: ngAttrDivective,
                ngModelOptions: ngModelOptionsDirective
            }).directive({
                ngInclude: ngIncludeFillContentDirective
            }).directive(
                ngAttributeAliasDirectives
            ).directive(
                ngEventDirectives
            );

            $provide.provider({
                $anchorScroll: $AnchorScrollProvider,
                $animate: $AnimateProvider,
                $$animation: $$AnimationProvider,
                $animateCss: $AnimateCssProvider,
                $$animateCssDriver: $$AnimateCssDriverProvider,
                $$animateJs: $$AnimateJsProvider,
                $$animateJsDriver: $$AnimateJsDriverProvider,
                $$animateQueue: $$AnimateQueueProvider,
                $$AnimateRunner: $$AnimateRunnerFactoryProvider,
                $$animateAsyncRun: $$AnimateAsyncRunFactoryProvider,
                $browser: $BrowserProvider,
                $cacheFactory: $CacheFactoryProvider,
                $controller: $ControllerProvider,
                $document: $DocumentProvider,
                $exceptionHandler: $ExceptionHandlerProvider,
                $filter: $FilterProvider,
                $$forceReflow: $$ForceReflowProvider,
                $interpolate: $InterpolateProvider,
                $interval: $IntervalProvider,
                $http: $HttpProvider,
                $httpParamSerializer: $HttpParamSerializerProvider,
                $httpParamSerializerJQLike: $HttpParamSerializerJQLikeProvider,
                $httpBackend: $HttpBackendProvider,
                $xhrFactory: $xhrFactoryProvider,
                $jsonpCallbacks: $jsonpCallbacksProvider,
                $location: $LocationProvider,
                $log: $LogProvider,
                $parse: $ParseProvider,
                $rootScope: $RootScopeProvider,
                $q: $QProvider,
                $$q: $$QProvider,
                $sce: $SceProvider,
                $sceDelegate: $SceDelegateProvider,
                $templateCache: $TemplateCacheProvider,
                $templateRequest: $TemplateRequestProvider,
                $timeout: $TimeoutProvider,
                $window: $WindowProvider,
                $$rAF: $$RAFProvider,
                $$jqLite: $$jqLiteProvider,
                $$Map: $$MapProvider,
                $$cookieReader: $$CookieReaderProvider,
                $$isDocumentHidden: $$IsDocumentHiddenProvider
            });

            $provide.factory(
                '$$rAFScheduler',
                $$rAFSchedulerFactory
            );

            msos_debug(temp_pe + ' - ngModule ~~~> done!');

        }]).info({ angularVersion: '1.6.5' });

        msos_debug(temp_pe + ' ~~~> done!');
    }

    // Run this puppy...
    bindJQuery();

    publishExternalAPI(angular);

    // Start of ng - Postloader code
    angular.module('ngPostloader', ['ng']).provider(
        '$postload',
        [
            '$injector', '$injectorProvider',
            function ($injector, $injectorProvider) {
                var temp_pl = 'ng - Postloader';

                this.$get = [
                    '$rootScope', '$q',
                    function ($rootScope, $q) {

                        msos_debug(temp_pl + ' -> called.');

                        return {
                            run_registration: function () {
                                var temp_rr = temp_pl + ' - run_registration',
                                    defer = $q.defer('ng_postload_run');

                                msos_debug(temp_rr + ' -> start.');

                                msos.onload_func_post.push(
                                    function () {

                                        var curr_modules = _.keys(msos.registered_modules),
                                            diff_modules = _.difference(curr_modules, msos_prev_modules),
                                            angl_modules = [];

                                        msos_debug(temp_rr + ' (onload_func_post) -> start.');

                                        jQuery.each(
                                            diff_modules,
                                            function (index_na, module_key) {
                                                var module_name = module_key.replace(/_/g, '.');    // MSOS encoded naming
                                                // Screen away non-AngularJS modules
                                                if (_.indexOf(angular.registered_modules, module_name) !== -1) {
                                                    if (!angular.loaded_modules.get(module_name)) {
                                                        angl_modules.push(module_name);
                                                    }
                                                }
                                            }
                                        );

                                        // Load and ready our newly received modules
                                        loadModules(_.uniq(angl_modules), $injector, $injectorProvider.$get());

                                        defer.resolve();
                                        $rootScope.$apply();

                                        // Reset for next round...
                                        msos_prev_modules = curr_modules;

                                        msos_debug(temp_rr + ' (onload_func_post) ->  done!');
                                    }
                                );

                                // Run MSOS module loading
                                msos.run_onload();

                                msos_debug(temp_rr + ' ->  done!');
                                return defer.promise;
                            }
                        };
                    }
                ];
            }
        ]
    ).run(
                ['$location', '$timeout',
        function ($location,   $timeout) {
            var temp_rn = 'ng - Postloader - run -> ',
                org_location;

            msos_debug(temp_rn + 'start.');

            // Important: Record the modules "initially" loaded in the previous "msos.run_onload()" cycle
            msos_prev_modules = _.keys(msos.registered_modules);

            // Special case: MSOS module(s) won't have time to load for initial hashtag.
            if ($location.path() !== '' || $location.path() !== '/') {
                msos.console.info(temp_rn + 'init content to show: ' + $location.path());
                // Save specific hashtag fragment
                org_location = $location.path().substring(1);
                // Set to use default page content (before routing)
                $location.path('/');
                // Reset $location, which updates page content (just like internal link routing)
                $timeout(
                    function () {
                        msos.console.info(temp_rn + 'do $location replace.');
                        $location.path(org_location).replace();
                    },
                    100
                );
            }

            msos_debug(temp_rn + ' done!');
        }]
    );

    /**
     * @license AngularJS original v1.5.3, updated to v1.6.5
     * (c) 2010-2016 Google, Inc. http://angularjs.org
     * License: MIT
     * 
     * @ngdoc module
     * @name ngSanitize
     * @description
     *
     */
    (function (_swin, _sdoc) {

        var $sanitizeMinErr = minErr('$sanitize'),
            getInertBodyElement = null,
            nodeContains = _swin.Node.prototype.contains || function (arg) {
                // eslint-disable-next-line no-bitwise
                return !!(this.compareDocumentPosition(arg) & 16);
            };

        function getNonDescendant(propName, node) {
            var nextNode = node[propName];

            if (nextNode && nodeContains.call(node, nextNode)) {
                throw $sanitizeMinErr('elclob', 'Failed to sanitize html because the element is clobbered: {0}', node.outerHTML || node.outerText);
            }

            return nextNode;
        }

        function stripCustomNsAttrs(node) {
            var attrs,
                i = 0,
                l = 0,
                attrNode,
                attrName,
                nextNode;

            while (node) {

                if (node.nodeType === NODE_TYPE_ELEMENT) {

                    attrs = node.attributes;

                    for (i = 0, l = attrs.length; i < l; i += 1) {
                        attrNode = attrs[i];
                        attrName = attrNode.name.toLowerCase();
                        if (attrName === 'xmlns:ns1' || attrName.lastIndexOf('ns1:', 0) === 0) {
                            node.removeAttributeNode(attrNode);
                            i -= 1;
                            l -= 1;
                        }
                    }
                }

                nextNode = node.firstChild;

                if (nextNode) {
                    stripCustomNsAttrs(nextNode);
                }

                node = getNonDescendant('nextSibling', node);
            }
        }

        getInertBodyElement = (function () {
            var inertDocument_gBE,
                inertBodyElement_gBE;

            if (_sdoc && _sdoc.implementation) {
                inertDocument_gBE = _sdoc.implementation.createHTMLDocument('inert');
            } else {
                throw $sanitizeMinErr('noinert', 'Can\'t create an inert html document');
            }

            inertBodyElement_gBE = (inertDocument_gBE.documentElement || inertDocument_gBE.getDocumentElement()).querySelector('body');
            inertBodyElement_gBE.innerHTML = '<svg><g onload="this.parentNode.remove()"></g></svg>';

            function getInertBodyElement_XHR(html) {
                var xhr,
                    body;

                html = '<remove></remove>' + html;

                try {
                    html = encodeURI(html);
                } catch (e) {
                    return undefined;
                }

                xhr = new _swin.XMLHttpRequest();
                xhr.responseType = 'document';
                xhr.open('GET', 'data:text/html;charset=utf-8,' + html, false);
                xhr.send(null);

                body = xhr.response.body;
                body.firstChild.remove();

                return body;
            }

            function getInertBodyElement_DOMParser(html) {
                var body;

                html = '<remove></remove>' + html;

                try {

                    body = new _swin.DOMParser().parseFromString(html, 'text/html').body;
                    body.firstChild.remove();

                    return body;
                } catch (e) {
                    return undefined;
                }
            }

            function getInertBodyElement_InertDocument(html) {

                inertBodyElement_gBE.innerHTML = html;

                if (_sdoc.documentMode) {
                    stripCustomNsAttrs(inertBodyElement_gBE);
                }

                return inertBodyElement_gBE;
            }

            if (!inertBodyElement_gBE.querySelector('svg')) {
                return getInertBodyElement_XHR;
            } else {
                inertBodyElement_gBE.innerHTML = '<svg><p><style><img src="</style><img src=x onerror=alert(1)//">';

                if (inertBodyElement_gBE.querySelector('svg img')) {
                    return getInertBodyElement_DOMParser;
                } else {
                    return getInertBodyElement_InertDocument;
                }
            }

        }());

        function attrToMap(attrs) {
            var map = {},
                i = 0,
                ii = attrs.length;

            for (i = 0; i < ii; i += 1) {
                map[attrs[i].name] = attrs[i].value;
            }

            return map;
        }

        function htmlParser(html, handler) {
            var mXSSAttempts = 5,
                inertBodyElement_hP,
                node,
                nextNode;

            if (html === null || html === undefined) {
                html = '';
            } else if (typeof html !== 'string') {
                html = String(html);
            }

            inertBodyElement_hP = getInertBodyElement(html);

            if (!inertBodyElement_hP) { return ''; }

            do {
                if (mXSSAttempts === 0) {
                    throw $sanitizeMinErr('uinput', 'Failed to sanitize html because the input is unstable');
                }

                mXSSAttempts -= 1;

                html = inertBodyElement_hP.innerHTML; //trigger mXSS
                inertBodyElement_hP = getInertBodyElement(html);

            } while (html !== inertBodyElement_hP.innerHTML);

            node = inertBodyElement_hP.firstChild || undefined;

            while (node) {
                switch (node.nodeType) {
                    case 1: // ELEMENT_NODE
                        handler.start(node.nodeName.toLowerCase(), attrToMap(node.attributes));
                        break;
                    case 3: // TEXT NODE
                        handler.chars(node.textContent);
                        break;
                }

                nextNode = node.firstChild || undefined;

                if (!nextNode) {
                    if (node.nodeType === NODE_TYPE_ELEMENT) {
                        handler.end(node.nodeName.toLowerCase());
                    }

                    nextNode = getNonDescendant('nextSibling', node);

                    if (!nextNode) {
                        while (nextNode == null) {      // Leave as is (undefined or null)
                            node = getNonDescendant('parentNode', node);
                            if (node === inertBodyElement_hP) { break; }
                            nextNode = getNonDescendant('nextSibling', node);
                            if (node.nodeType === NODE_TYPE_ELEMENT) {
                                handler.end(node.nodeName.toLowerCase());
                            }
                        }
                    }
                }

                node = nextNode;
            }

            node = inertBodyElement_hP.firstChild || undefined;

            while (node) {
                inertBodyElement_hP.removeChild(node);
                node = inertBodyElement_hP.firstChild || undefined;
            }
        }

        function htmlSanitizeWriter(buf, uriValidator) {
            var ignoreCurrentElement = false,
                out = ng_bind(buf, buf.push);

            return {
                start: function (tag, attrs) {
                    tag = lowercase(tag);

                    if (!ignoreCurrentElement && blockedElements[tag]) {
                        ignoreCurrentElement = tag;
                    }

                    if (!ignoreCurrentElement && validElements[tag] === true) {
                        out('<');
                        out(tag);

                        forEach(
                            attrs,
                            function (value, key) {
                                var lkey = lowercase(key),
                                    isImage = (tag === 'img' && lkey === 'src') || (lkey === 'background');

                                if (validAttrs[lkey] === true
                                  && (uriAttrs[lkey] !== true || uriValidator(value, isImage))) {
                                    out(' ');
                                    out(key);
                                    out('="');
                                    out(encodeEntities(value));
                                    out('"');
                                } else {
                                    if (msos_verbose) {
                                        msos_debug('ng - ngSanitize - htmlSanitizeWriter - start -> skipped: ' + lkey);
                                    }
                                }
                            }
                        );

                        out('>');
                    }
                },

                end: function (tag) {
                    tag = lowercase(tag);

                    if (!ignoreCurrentElement && validElements[tag] === true && voidElements[tag] !== true) {
                        out('</');
                        out(tag);
                        out('>');
                    }

                    if (tag === ignoreCurrentElement) {
                        ignoreCurrentElement = false;
                    }
                },

                chars: function (chars) {
                    if (!ignoreCurrentElement) {
                        out(encodeEntities(chars));
                    }
                }
            };
        }

        function $SanitizeProvider() {
            var svgEnabled = false,
                mediaEnabled = false;

            this.enableSvg = function (enableSvg) {
                if (isDefined(enableSvg)) {
                    svgEnabled = enableSvg;
                    return this;
                }

                return svgEnabled;
            };

            this.enableMedia = function (enableMedia) {
                if (isDefined(enableMedia)) {
                    mediaEnabled = enableMedia;
                    return this;
                }

                return mediaEnabled;
            };
            
            this.$get = ['$$sanitizeUri', function ($$sanitizeUri) {
                if (svgEnabled) {
                    extend(validElements, svgElements);
                }
                if (mediaEnabled) {
                    extend(blockElements, mediaElements);
                    extend(validElements, mediaElements);
                }

                return function (html) {
                    var buf = [];

                    htmlParser(
                        html,
                        htmlSanitizeWriter(
                            buf,
                            function (uri, isImage) {
                                return !/^unsafe:/.test($$sanitizeUri(uri, isImage));
                            }
                        )
                    );

                    return buf.join('');
                };
            }];
        }

        function sanitizeText(chars) {
            var buf = [],
                writer = htmlSanitizeWriter(buf, noop);

            writer.chars(chars);

            return buf.join('');
        }

        angular.module('ngSanitize', ['ng']).provider('$sanitize', $SanitizeProvider);

        angular.module('ngSanitize').filter(
            'linky',
            ['$sanitize', function ($sanitize) {
                var LINKY_URL_REGEXP = /((ftp|https?):\/\/|(www\.)|(mailto:)?[A-Za-z0-9._%+\-]+@)\S*[^\s.;,(){}<>"\u201d\u2019]/i,
                    MAILTO_REGEXP = /^mailto:/i,
                    linkyMinErr = minErr('linky');

                return function (text, target, attributes) {
                    var match,
                        raw = text,
                        html = [],
                        url,
                        i = 0;

                    function addText(text) {

                        if (!text) { return; }

                        html.push(sanitizeText(text));
                    }

                    function addLink(url, text) {
                        var key;

                        html.push('<a ');

                        if (_.isFunction(attributes)) {
                            attributes = attributes(url);
                        }

                        if (isObject(attributes)) {
                            for (key in attributes) {
                                if (attributes.hasOwnProperty(key)) {
                                    html.push(key + '="' + attributes[key] + '" ');
                                }
                            }
                        } else {
                            attributes = {};
                        }

                        if (isDefined(target) && !(attributes.hasOwnProperty('target'))) {
                            html.push('target="', target, '" ');
                        }

                        html.push('href="', url.replace(/"/g, '&quot;'), '">');

                        addText(text);
                        html.push('</a>');
                    }

                    if (text === undefined || text === null || text === '') { return text; }

                    if (!_.isString(text)) {
                        throw linkyMinErr('notstring', 'Expected string but received: {0}', text);
                    }

                    raw = text;
                    match = raw.match(LINKY_URL_REGEXP);

                    while (match) {
                        // We can not end in these as they are sometimes found at the end of the sentence
                        url = match[0];
                        // if we did not match ftp/http/www/mailto then assume mailto
                        if (!match[2] && !match[4]) {
                            url = (match[3] ? 'http://' : 'mailto:') + url;
                        }

                        i = match.index;
                        addText(raw.substr(0, i));
                        addLink(url, match[0].replace(MAILTO_REGEXP, ''));
                        raw = raw.substring(i + match[0].length);

                        // Next match
                        match = raw.match(LINKY_URL_REGEXP);
                    }

                    addText(raw);

                    return $sanitize(html.join(''));
                };
            }]
        );
    }(window, window.document));

    /**
    * @license ngResize.js v1.1.0
    * (c) 2014 Daniel Smith http://www.danmasta.com
    * License: MIT
    */
    angular.module('ngResize', ['ng']).provider(
        'resize',
        [function resizeProvider() {

            // store throttle time
            this.throttle = 150;

            // by default bind window resize event when service
            // is initialize/ injected for first time
            this.initBind = 1;

            // service object
            this.$get = ['$rootScope', '$window', '$interval',  function ($rootScope, $window, $interval) {
                var _this = this,
                    bound = 0,
                    timer = 0,
                    resized = 0;

                // api to set throttle amount
                function setThrottle(throttle) {
                    _this.throttle = throttle;
                }

                // api to get current throttle amount
                function getThrottle() {
                    return _this.throttle;
                }

                // trigger a resize event on provided $scope or $rootScope
                function trigger($scope) {
                    $scope = $scope || $rootScope;

                    $scope.$broadcast(
                        'resize',
                        {
                            width: $window.innerWidth,
                            height: $window.innerHeight
                        }
                    );
                }

                // bind to window resize event, will only ever be bound
                // one time for entire app
                function bind() {
                    if(!bound){
                        var w = jqLite($window);

                        w.on(
                            'resize',
                            function () {
                                if (!resized) {
                                    timer = $interval(
                                        function () {
                                            if (resized) {
                                                resized = 0;
                                                $interval.cancel(timer);
                                                trigger();
                                            }
                                        },
                                        _this.throttle
                                    );
                                }

                                resized = 1;
                            }
                        );

                        bound = 1;
                        w.triggerHandler('resize');
                    }
                }

                // unbind window scroll event
                function unbind() {
                    if (bound) {
                        var w = jqLite($window);

                        w.off('resize');
                        bound = 0;
                    }
                }

                // by default bind resize event when service is created
                if (_this.initBind) { bind(); }

                // return api
                return {
                    getThrottle: getThrottle,
                    setThrottle: setThrottle,
                    trigger: trigger,
                    bind: bind,
                    unbind: unbind
                };
            }];
        }]

    ).directive(
        'ngResize',
        ['$parse', '$timeout', function ($parse, $timeout) {
            return {
                compile: function (element_na, attr) {
                    var fn = $parse(attr.ngResize);

                    return function (scope) {
                        scope.$on(
                            'resize',
                            function (event_na, data) {
                                $timeout(
                                    function () {
                                        scope.$apply(
                                            function ngResizeDirScopeApply() {
                                                msos_debug('ng - ngResize - onresize -> called.');
                                                fn(scope, { $event: data });
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    };
                }
            };
        }]
    );

    // Determine how long to load basic functions
    end_time = msos.new_time();

}(window));


msos.console.info('ng/v165_msos -> done!');
msos.console.timeEnd('ng');
