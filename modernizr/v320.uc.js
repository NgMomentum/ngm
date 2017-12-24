
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

		if (body.fake) {
			root.parentNode.removeChild(root);
		}

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

}(window, document));