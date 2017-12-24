
/**
 * State-based routing for AngularJS
 * @version v0.2.18 originally, updated to v0.4.0
 * @link http://angular-ui.github.com/
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

/*global
    msos: false,
    Modernizr: false,
    _: false
*/

(function (w_angular) {
    'use strict';

    var $$UMFP;     // reference to $UrlMatcherFactoryProvider

    function ancestors(first, second) {
        var path = [],
            n;

        for (n in first.path) {
            if (first.path.hasOwnProperty(n)) {
                if (first.path[n] !== second.path[n]) { break; }
                path.push(first.path[n]);
            }
        }

        return path;
    }

    function silenceUncaughtInPromise(promise) {
        return promise.then(undefined, function () { if (msos.config.verbose) { msos.console.info('ng/ui/router - silenceUncaughtInPromise -> called.'); } }) && promise;
    }

    function inheritParams(currentParams, newParams, $current, $to) {
        var parents = ancestors($current, $to),
            parentParams,
            inherited = {},
            inheritList = [],
            i = 0,
            j = 0;

        for (i = 0; i < parents.length; i += 1) {

            if (parents[i] && parents[i].params) {

                parentParams = _.keys(parents[i].params);

                for (j = 0; j < parentParams.length; j += 1) {

                    if (_.indexOf(inheritList, parentParams[j]) >= 0) { continue; }

                    inheritList.push(parentParams[j]);
                    inherited[parentParams[j]] = currentParams[parentParams[j]];
                }
            }
        }

        return w_angular.extend({}, inherited, newParams);
    }

    function equalForKeys(a, b, keys) {
        var i = 0,
            k;

        if (!keys) { keys = _.keys(a); }

        for (i = 0; i < keys.length; i += 1) {
            k = keys[i];
            if (a[k] != b[k]) { return false; }     // Not '===', values aren't necessarily normalized
        }

        return true;
    }

    function filterByKeys(keys, values) {
        var filtered = {};

        w_angular.forEach(keys, function (name) {
            filtered[name] = values[name];
        });

        return filtered;
    }

    w_angular.module('ui.router.util', ['ng']);
    w_angular.module('ui.router.router', ['ui.router.util']);
    w_angular.module('ui.router.state', ['ui.router.router', 'ui.router.util']);
    w_angular.module('ui.router', ['ui.router.state']);
    w_angular.module('ui.router.compat', ['ui.router']);

    function $Resolve($q, $injector) {

        var VISIT_IN_PROGRESS = 1,
            VISIT_DONE = 2,
            NOTHING = {},
            NO_DEPENDENCIES = [],
            NO_LOCALS = NOTHING,
            NO_PARENT = w_angular.extend(
                $q.when($q.defer('ng_ui_router_when_$Resolve'), NOTHING),
                {
                    $$promises: NOTHING,
                    $$values: NOTHING
                }
            );

        this.study = function (invocables) {

            if (!w_angular.isObject(invocables)) {
                throw new Error("'invocables' must be an object");
            }

            var invocableKeys = _.keys(invocables),
                plan = [],
                cycle = [],
                visited = {};

            function visit(value, key) {
                var params;

                if (visited[key] === VISIT_DONE) { return; }

                cycle.push(key);

                if (visited[key] === VISIT_IN_PROGRESS) {
                    cycle.splice(0, _.indexOf(cycle, key));
                    throw new Error("Cyclic dependency: " + cycle.join(" -> "));
                }

                visited[key] = VISIT_IN_PROGRESS;

                if (_.isString(value)) {
                    plan.push(
                        key,
                        [function () { return $injector.get(value); }],
                        NO_DEPENDENCIES
                    );
                } else {

                    params = $injector.annotate(value);

                    w_angular.forEach(params, function (param) {
                        if (param !== key && invocables.hasOwnProperty(param)) {
                            visit(invocables[param], param);
                        }
                    });

                    plan.push(key, value, params);
                }

                cycle.pop();
                visited[key] = VISIT_DONE;
            }

            w_angular.forEach(invocables, visit);
            invocables = cycle = visited = null; // plan is all that's required

            function isResolve(value) {
                return w_angular.isObject(value) && value.then && value.$$promises;
            }

            return function (locals, parent, self) {

                if (isResolve(locals) && self === undefined) {
                    self = parent;
                    parent = locals;
                    locals = null;
                }

                if (!locals) {
                    locals = NO_LOCALS;
                } else if (!w_angular.isObject(locals)) {
                    throw new Error("'locals' must be an object");
                }

                if (!parent) {
                    parent = NO_PARENT;
                } else if (!isResolve(parent)) {
                    throw new Error("'parent' must be a promise returned by $resolve.resolve()");
                }

                // To complete the overall resolution, we have to wait for the parent
                // promise and for the promise for each invokable in our plan.
                var resolution = $q.defer('ng_ui_router_$Resolve_study'),
                    result = silenceUncaughtInPromise(resolution.promise),
                    promises = result.$$promises = {},
                    values = w_angular.extend({}, locals),
                    wait = 1 + plan.length / 3,
                    merged = false,
                    i = 0;

                silenceUncaughtInPromise(result);

                function done() {
                    // Merge parent values we haven't got yet and publish our own $$values
                    wait -= 1;
                    if (!wait) {
                        if (!merged) { w_angular.merge(values, parent.$$values); }

                        result.$$values = values;
                        result.$$promises = result.$$promises || true; // keep for isResolve()

                        delete result.$$inheritedValues;
                        resolution.resolve(values);
                    }
                }

                function fail(reason) {
                    result.$$failure = reason;
                    resolution.reject(reason);
                }

                // Short-circuit if parent has already failed
                if (w_angular.isDefined(parent.$$failure)) {
                    fail(parent.$$failure);
                    return result;
                }

                if (parent.$$inheritedValues) {
                    w_angular.merge(
                        values,
                        _.omit(parent.$$inheritedValues, invocableKeys)
                    );
                }

                // Merge parent values if the parent has already resolved, or merge
                // parent promises and wait if the parent resolve is still in progress.
                w_angular.extend(promises, parent.$$promises);

                if (parent.$$values) {
                    merged = w_angular.merge(
                        values,
                        _.omit(parent.$$values, invocableKeys)
                    );
                    result.$$inheritedValues = _.omit(parent.$$values, invocableKeys);
                    done();
                } else {
                    if (parent.$$inheritedValues) {
                        result.$$inheritedValues = _.omit(parent.$$inheritedValues, invocableKeys);
                    }
                    parent.then(done, fail);
                }

                function invoke(key, invocable, params) {
                    // Create a deferred for this invocation. Failures will propagate to the resolution as well.
                    var invocation = $q.defer('ng_ui_router_$Resolver_study_invoke'),
                        waitParams = 0;

                    function onfailure(reason) {
                        invocation.reject(reason);
                        fail(reason);
                    }

                    function proceed() {
                        if (w_angular.isDefined(result.$$failure)) { return; }

                        try {
                            invocation.resolve($injector.invoke(
                                invocable,
                                self,
                                values,
                                '$Resolver'
                            ));
                            invocation.promise.then(
                                function (result) {
                                    values[key] = result;
                                    done();
                                },
                                onfailure
                            );
                        } catch (e) {
                            onfailure(e);
                        }
                    }

                    w_angular.forEach(
                        params,
                        function (dep) {
                            if (promises.hasOwnProperty(dep) && !locals.hasOwnProperty(dep)) {
                                waitParams += 1;
                                promises[dep].then(
                                    function (result) {
                                        values[dep] = result;
                                        waitParams -= 1;
                                        if (!waitParams) { proceed(); }
                                    },
                                    onfailure
                                );
                            }
                        }
                    );

                    if (!waitParams) { proceed(); }

                    promises[key] = silenceUncaughtInPromise(invocation.promise);
                }

                // Process each invocable in the plan, but ignore any where a local of the same name exists.
                for (i = 0; i < plan.length; i += 3) {
                    if (locals.hasOwnProperty(plan[i])) {
                        done();
                    } else {
                        invoke(plan[i], plan[i + 1], plan[i + 2]);
                    }
                }

                return result;
            };
        };

        this.resolve = function (invocables, locals, parent, self) {
            return this.study(invocables)(locals, parent, self);
        };
    }

    $Resolve.$inject = ['$q', '$injector'];

    w_angular.module('ui.router.util').service('$resolve', $Resolve);

    function $TemplateFactory($http, $templateCache, $injector) {

        this.fromConfig = function (config, params, locals) {
            return (
                w_angular.isDefined(config.template) ? this.fromString(config.template, params) : w_angular.isDefined(config.templateUrl) ? this.fromUrl(config.templateUrl, params) : w_angular.isDefined(config.templateProvider) ? this.fromProvider(config.templateProvider, params, locals) : null
            );
        };

        this.fromString = function (template, params) {
            return _.isFunction(template) ? template(params) : template;
        };

        this.fromUrl = function (url, params) {
            if (_.isFunction(url)) { url = url(params); }

            if (url == null) {
                msos.console.warn('ng/ui/router - $TemplateFactory.fromUrl -> no url passed in.');
                return null;
            }

            return $injector.get('$templateRequest')(url);
        };

        this.fromProvider = function (provider, params, locals) {
            return $injector.invoke(
                provider,
                null,
                locals || { params: params },
                '$TemplateFactory'
            );
        };
    }

    $TemplateFactory.$inject = ['$http', '$templateCache', '$injector'];

    w_angular.module('ui.router.util').service('$templateFactory', $TemplateFactory);


    function UrlMatcher(pattern, config, parentMatcher) {

        config = w_angular.extend(
            { params: {} },
            w_angular.isObject(config) ? config : {}
        );

        // Find all placeholders and create a compiled pattern, using either classic or curly syntax:
        //   '*' name
        //   ':' name
        //   '{' name '}'
        //   '{' name ':' regexp '}'
        // The regular expression is somewhat complicated due to the need to allow curly braces
        // inside the regular expression. The placeholder regexp breaks down as follows:
        //    ([:*])([\w\[\]]+)              - classic placeholder ($1 / $2) (search version has - for snake-case)
        //    \{([\w\[\]]+)(?:\:\s*( ... ))?\}  - curly brace placeholder ($3) with optional regexp/type ... ($4) (search version has - for snake-case
        //    (?: ... | ... | ... )+         - the regexp consists of any number of atoms, an atom being either
        //    [^{}\\]+                       - anything other than curly braces or backslash
        //    \\.                            - a backslash escape
        //    \{(?:[^{}\\]+|\\.)*\}          - a matched set of curly braces containing other atoms
        var placeholder = /([:*])([\w\[\]]+)|\{([\w\[\]]+)(?:\:\s*((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g,
            searchPlaceholder = /([:]?)([\w\[\].-]+)|\{([\w\[\].-]+)(?:\:\s*((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g,
            compiled = '^',
            last = 0,
            m,
            segments = this.segments = [],
            parentParams = parentMatcher ? parentMatcher.params : {},
            params = this.params = parentMatcher ? parentMatcher.params.$$new() : new $$UMFP.ParamSet(),
            paramNames = [],
            p,
            param,
            segment,
            i,
            search;

        function addParameter(id, type, config, location) {
            paramNames.push(id);

            if (parentParams[id]) { return parentParams[id]; }

            if (!/^\w+([-.]+\w+)*(?:\[\])?$/.test(id)) {
                throw new Error("Invalid parameter name '" + id + "' in pattern '" + pattern + "'");
            }
            if (params[id]) {
                throw new Error("Duplicate parameter name '" + id + "' in pattern '" + pattern + "'");
            }

            params[id] = new $$UMFP.Param(id, type, config, location);
            return params[id];
        }

        function quoteRegExp(string, pattern, squash, optional) {
            var surroundPattern = ['', ''],
                result = string.replace(/[\\\[\]\^$*+?.()|{}]/g, "\\$&");

            if (!pattern) { return result; }

            switch (squash) {
                case false:
                    surroundPattern = ['(', ')' + (optional ? "?" : "")];
                    break;
                case true:
                    result = result.replace(/\/$/, '');
                    surroundPattern = ['(?:\/(', ')|\/)?'];
                    break;
                default:
                    surroundPattern = ['(' + squash + "|", ')?'];
                    break;
            }

            return result + surroundPattern[0] + pattern + surroundPattern[1];
        }

        this.source = pattern;

        // Split into static segments separated by path parameter placeholders.
        // The number of segments is always 1 more than the number of parameters.
        function matchDetails(m, isSearch) {
            var id,
                regexp,
                segment,
                type,
                cfg;

            id = m[2] || m[3]; // IE[78] returns '' for unmatched groups instead of null
            cfg = config.params[id];
            segment = pattern.substring(last, m.index);
            regexp = isSearch ? m[4] : m[4] || (m[1] === '*' ? '.*' : null);

            if (regexp) {
                type = $$UMFP.type(regexp) || w_angular.inherit($$UMFP.type("string"), { pattern: new RegExp(regexp, config.caseInsensitive ? 'i' : undefined) });
            }

            return {
                id: id,
                regexp: regexp,
                segment: segment,
                type: type,
                cfg: cfg
            };
        }

        while ((m = placeholder.exec(pattern))) {
            p = matchDetails(m, false);
            if (p.segment.indexOf('?') >= 0) { break; }     // we're into the search part

            param = addParameter(p.id, p.type, p.cfg, "path");

            compiled += quoteRegExp(
                p.segment,
                param.type.pattern.source,
                param.squash,
                param.isOptional
            );

            segments.push(p.segment);
            last = placeholder.lastIndex;
        }

        segment = pattern.substring(last);

        // Find any search parameter names and remove them from the last segment
        i = segment.indexOf('?');

        if (i >= 0) {
            search = this.sourceSearch = segment.substring(i);
            segment = segment.substring(0, i);
            this.sourcePath = pattern.substring(0, last + i);

            if (search.length > 0) {
                last = 0;
                while ((m = searchPlaceholder.exec(search))) {
                    p = matchDetails(m, true);
                    param = addParameter(p.id, p.type, p.cfg, "search");
                    last = placeholder.lastIndex;
                    // check if ?&
                }
            }
        } else {
            this.sourcePath = pattern;
            this.sourceSearch = '';
        }

        compiled += quoteRegExp(segment) + (config.strict === false ? '\/?' : '') + '$';
        segments.push(segment);

        this.regexp = new RegExp(compiled, config.caseInsensitive ? 'i' : undefined);
        this.prefix = segments[0];
        this.$$paramNames = paramNames;
    }

    UrlMatcher.prototype.concat = function (pattern, config) {
        // Because order of search parameters is irrelevant, we can add our own search
        // parameters to the end of the new pattern. Parse the new pattern by itself
        // and then join the bits together, but it's much easier to do this on a string level.
        var defaultConfig = {
            caseInsensitive: $$UMFP.caseInsensitive(),
            strict: $$UMFP.strictMode(),
            squash: $$UMFP.defaultSquashPolicy()
        };
        return new UrlMatcher(this.sourcePath + pattern + this.sourceSearch, w_angular.extend(defaultConfig, config), this);
    };

    UrlMatcher.prototype.toString = function () {
        return this.source;
    };

    UrlMatcher.prototype.exec = function (path, searchParams) {
        var m = this.regexp.exec(path),
            paramNames,
            nTotal,
            nPath,
            values = {},
            i,
            j,
            paramName,
            param,
            paramVal;

        if (!m) { return null; }

        searchParams = searchParams || {};
        paramNames = this.parameters();
        nTotal = paramNames.length;
        nPath = this.segments.length - 1;

        if (nPath !== m.length - 1) {
            throw new Error("Unbalanced capture group in route '" + this.source + "'");
        }

        function decodePathArray(string) {

            function reverseString(str) {
                return str.split("").reverse().join("");
            }

            function unquoteDashes(str) {
                return str.replace(/\\-/g, "-");
            }

            var split = reverseString(string).split(/-(?!\\)/),
                allReversed = _.map(split, reverseString);

            return _.map(allReversed, unquoteDashes).reverse();
        }

        for (i = 0; i < nPath; i += 1) {

            paramName = paramNames[i];
            param = this.params[paramName];
            paramVal = m[i + 1];

            // if the param value matches a pre-replace pair, replace the value before decoding.
            for (j = 0; j < param.replace.length; j += 1) {
                if (param.replace[j].from === paramVal) { paramVal = param.replace[j].to; }
            }

            if (paramVal && param.array === true)   { paramVal = decodePathArray(paramVal); }
            if (w_angular.isDefined(paramVal))      { paramVal = param.type.decode(paramVal); }

            values[paramName] = param.value(paramVal);
        }

        // use current value of i
        for (i; i < nTotal; i += 1) {
            paramName = paramNames[i];
            values[paramName] = this.params[paramName].value(searchParams[paramName]);
            param = this.params[paramName];
            paramVal = searchParams[paramName];

            for (j = 0; j < param.replace.length; j += 1) {
                if (param.replace[j].from === paramVal) { paramVal = param.replace[j].to; }
            }

            if (w_angular.isDefined(paramVal)) { paramVal = param.type.decode(paramVal); }

            values[paramName] = param.value(paramVal);
        }

        return values;
    };

    UrlMatcher.prototype.parameters = function (param) {
        if (!w_angular.isDefined(param)) { return this.$$paramNames; }
        return this.params[param] || null;
    };

    UrlMatcher.prototype.validates = function (params) {
        return this.params.$$validates(params);
    };

    UrlMatcher.prototype.format = function (values) {
        values = values || {};

        var segments = this.segments,
            params = this.parameters(),
            paramset = this.params,
            i,
            search = false,
            nPath,
            nTotal,
            result,
            isPathParam,
            name,
            param,
            value,
            isDefaultValue,
            squash,
            encoded,
            nextSegment,
            isFinalPathParam,
            capture;

        if (!this.validates(values)) { return null; }

        nPath = segments.length - 1;
        nTotal = params.length;
        result = segments[0];

        function encodeDashes(str) { // Replace dashes with encoded "\-"
            return encodeURIComponent(str).replace(/-/g, function (c) { return '%5C%' + c.charCodeAt(0).toString(16).toUpperCase(); });
        }

        for (i = 0; i < nTotal; i += 1) {

            isPathParam = i < nPath;
            name = params[i];
            param = paramset[name];
            value = param.value(values[name]);
            isDefaultValue = param.isOptional && param.type.equals(param.value(), value);
            squash = isDefaultValue ? param.squash : false;
            encoded = param.type.encode(value);

            if (isPathParam) {
                nextSegment = segments[i + 1];
                isFinalPathParam = i + 1 === nPath;

                if (squash === false) {
                    if (encoded !== null && encoded !== undefined) {
                        if (_.isArray(encoded) && encoded.length) {
                            result += _.map(encoded, encodeDashes).join("-");
                        } else if (_.isString(encoded)) {
                            result += encodeURIComponent(encoded);
                        } else {
                            msos.console.warn('ng/ui/router - UrlMatcher.prototype.format -> na:', encoded);
                        }
                    }
                    result += nextSegment;
                } else if (squash === true) {
                    capture = result.match(/\/$/) ? /\/?(.*)/ : /(.*)/;
                    result += nextSegment.match(capture)[1];
                } else if (_.isString(squash)) {
                    result += squash + nextSegment;
                }

                if (isFinalPathParam && param.squash === true && result.slice(-1) === '/') {
                    result = result.slice(0, -1);
                }

            } else {
                if (encoded === null || encoded === undefined || (isDefaultValue && squash !== false)) { continue; }
                if (!_.isArray(encoded)) { encoded = [encoded]; }
                if (encoded.length === 0) { continue; }

                encoded = _.map(encoded, encodeURIComponent).join('&' + name + '=');
                result += (search ? '&' : '?') + (name + '=' + encoded);
                search = true;
            }
        }

        return result;
    };

    // ???
    function Type(config) {
        w_angular.extend(this, config);
    }

    Type.prototype.is = function () {
        return true;
    };

    Type.prototype.encode = function (val) {
        return val;
    };

    Type.prototype.decode = function (val) {
        return val;
    };

    Type.prototype.equals = function (a, b) {
        // was a == b
        return a === b;
    };

    Type.prototype.$subPattern = function () {
        var sub = this.pattern.toString();
        return sub.substr(1, sub.length - 2);
    };

    Type.prototype.pattern = /.*/;

    Type.prototype.toString = function () {
        return "{Type:" + this.name + "}";
    };

    /** Given an encoded string, or a decoded object, returns a decoded object */
    Type.prototype.$normalize = function (val) {
        return this.is(val) ? val : this.decode(val);
    };

    Type.prototype.$asArray = function (mode, isSearch) {

        if (!mode) { return this; }
        if (mode === "auto" && !isSearch) {
            throw new Error("'auto' array mode is for query parameters only");
        }

        function ArrayType(type, mode) {
            function bindTo(type, callbackName) {
                return function () {
                    return type[callbackName].apply(type, arguments);
                };
            }

            // Wrap non-array value as array
            function arrayWrap(val) {
                return _.isArray(val) ? val : (w_angular.isDefined(val) ? [val] : []);
            }

            // Unwrap array value for "auto" mode. Return undefined for empty array.
            function arrayUnwrap(val) {
                switch (val.length) {
                    case 0:
                        return undefined;
                    case 1:
                        return mode === "auto" ? val[0] : val;
                    default:
                        return val;
                }
            }

            function falsey(val) {
                return !val;
            }

            // Wraps type (.is/.encode/.decode) functions to operate on each value of an array
            function arrayHandler(callback, allTruthyMode) {
                return function handleArray(val) {
                    var result;

                    if (_.isArray(val) && val.length === 0) { return val; }

                    val = arrayWrap(val);
                    result = _.map(val, callback);

                    if (allTruthyMode === true) {
                        return _.filter(result, falsey).length === 0;
                    }

                    return arrayUnwrap(result);
                };
            }

            // Wraps type (.equals) functions to operate on each value of an array
            function arrayEqualsHandler(callback) {
                return function handleArray(val1, val2) {
                    var left = arrayWrap(val1),
                        right = arrayWrap(val2),
                        i = 0;

                    if (left.length !== right.length) { return false; }

                    for (i = 0; i < left.length; i += 1) {
                        if (!callback(left[i], right[i])) { return false; }
                    }

                    return true;
                };
            }

            this.encode =       arrayHandler(bindTo(type, 'encode'));
            this.decode =       arrayHandler(bindTo(type, 'decode'));
            this.is =           arrayHandler(bindTo(type, 'is'), true);
            this.$normalize =   arrayHandler(bindTo(type, '$normalize'));
            this.equals =       arrayEqualsHandler(bindTo(type, 'equals'));
            this.pattern = type.pattern;
            this.name = type.name;
            this.$arrayMode = mode;
        }

        return new ArrayType(this, mode);
    };

    function $UrlMatcherFactory() {

        $$UMFP = this;

        function valToString(val) {
            return val != null ? val.toString().replace(/(~|\/)/g, function (m) { return {'~':'~~', '/':'~2F'}[m]; }) : val;
        }

        function valFromString(val) {
            return val != null ? val.toString().replace(/(~~|~2F)/g, function (m) { return {'~~':'~', '~2F':'/'}[m]; }) : val;
        }

        var isCaseInsensitive = false,
            isStrictMode = true,
            defaultSquashPolicy = false,
            $types = {},
            enqueue = true,
            typeQueue = [],
            injector,
            defaultTypes = {
                "string": {
                    encode: valToString,
                    decode: valFromString,
                    // In 0.2.x, string params are optional by default for backwards compat
                    is: function (val) {
                        return val === null || val === undefined || typeof val === "string";
                    },
                    pattern: /[^/]*/
                },
                "int": {
                    encode: valToString,
                    decode: function (val) {
                        return parseInt(val, 10);
                    },
                    is: function (val) {
                        return val !== undefined && val !== null && this.decode(val.toString()) === val;
                    },
                    pattern: /\d+/
                },
                "bool": {
                    encode: function (val) {
                        return val ? 1 : 0;
                    },
                    decode: function (val) {
                        return parseInt(val, 10) !== 0;
                    },
                    is: function (val) {
                        return val === true || val === false;
                    },
                    pattern: /0|1/
                },
                "date": {
                    encode: function (val) {
                        if (!this.is(val)) {
                            return undefined;
                        }
                        return [val.getFullYear(),
                            ('0' + (val.getMonth() + 1)).slice(-2),
                            ('0' + val.getDate()).slice(-2)
                        ].join("-");
                    },
                    decode: function (val) {
                        if (this.is(val)) { return val; }

                        var match = this.capture.exec(val);
                        return match ? new Date(match[1], match[2] - 1, match[3]) : undefined;
                    },
                    is: function (val) {
                        return val instanceof Date && !isNaN(val.valueOf());
                    },
                    equals: function (a, b) {
                        return this.is(a) && this.is(b) && a.toISOString() === b.toISOString();
                    },
                    pattern: /[0-9]{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[1-2][0-9]|3[0-1])/,
                    capture: /([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/
                },
                "json": {
                    encode: w_angular.toJson,
                    decode: w_angular.fromJson,
                    is: w_angular.isObject,
                    equals: w_angular.equals,
                    pattern: /[^/]*/
                },
                "any": { // does not encode/decode
                    encode: w_angular.identity,
                    decode: w_angular.identity,
                    equals: w_angular.equals,
                    pattern: /.*/
                }
            };

        function getDefaultConfig() {
            return {
                strict: isStrictMode,
                caseInsensitive: isCaseInsensitive
            };
        }

        function isInjectable(value) {
            return (_.isFunction(value) || (_.isArray(value) && _.isFunction(value[value.length - 1])));
        }

        /**
         * [Internal] Get the default value of a parameter, which may be an injectable function.
         */
        $UrlMatcherFactory.$$getDefaultValue = function (config) {
            if (!isInjectable(config.value)) { return config.value; }
            if (!injector) {
                throw new Error("Injectable functions cannot be called at configuration time");
            }

            return injector.invoke(
                    config.value,
                    undefined,
                    undefined,
                    '$UrlMatcherFactory'
                );
        };

        this.caseInsensitive = function (value) {
            if (w_angular.isDefined(value)) {
                isCaseInsensitive = value;
            }
            return isCaseInsensitive;
        };

        this.strictMode = function (value) {
            if (w_angular.isDefined(value)) {
                isStrictMode = value;
            }
            return isStrictMode;
        };

        this.defaultSquashPolicy = function (value) {
            if (!w_angular.isDefined(value)) { return defaultSquashPolicy; }
            if (value !== true && value !== false && !_.isString(value)) {
                throw new Error("Invalid squash policy: " + value + ". Valid policies: false, true, arbitrary-string");
            }
            defaultSquashPolicy = value;
            return value;
        };

        this.compile = function (pattern, config) {
            return new UrlMatcher(pattern, w_angular.extend(getDefaultConfig(), config));
        };

        this.isMatcher = function (o) {
            var result = true;

            if (!w_angular.isObject(o)) { return false; }

            w_angular.forEach(
                UrlMatcher.prototype,
                function (val, name) {
                    if (_.isFunction(val)) {
                        result = result && (w_angular.isDefined(o[name]) && _.isFunction(o[name]));
                    }
                }
            );

            return result;
        };

        // `flushTypeQueue()` waits until `$urlMatcherFactory` is injected before invoking the queued `definitionFn`s
        function flushTypeQueue() {
            var type;

            while (typeQueue.length) {
                type = typeQueue.shift();
                if (type.pattern) {
                    throw new Error("You cannot override a type's .pattern at runtime.");
                }
                w_angular.extend($types[type.name], injector.invoke(type.def, undefined, undefined, type.name));
            }
        }

        this.type = function (name, definition, definitionFn) {

            if (!w_angular.isDefined(definition)) { return $types[name]; }

            if ($types.hasOwnProperty(name)) {
                throw new Error("A type named '" + name + "' has already been defined.");
            }

            $types[name] = new Type(
                w_angular.extend({ name: name }, definition)
            );

            if (definitionFn) {

                typeQueue.push({
                    name: name,
                    def: definitionFn
                });

                if (!enqueue) { flushTypeQueue(); }
            }

            return this;
        };

        // Register default types. Store them in the prototype of $types.
        w_angular.forEach(
            defaultTypes,
            function (type, name) {
                $types[name] = new Type(w_angular.extend({ name: name }, type));
            }
        );

        $types = w_angular.inherit($types, {});

        /* No need to document $get, since it returns this */
        this.$get = ['$injector', function ($injector) {

            injector = $injector;
            enqueue = false;
            flushTypeQueue();

            w_angular.forEach(
                defaultTypes,
                function (type, name) {
                    if (!$types[name]) { $types[name] = new Type(type); }
                }
            );

            return this;
        }];

        this.Param = function Param(id, type, config, location) {
            var self = this,
                arrayMode,
                isOptional,
                squash,
                replace;

            function unwrapShorthand(config) {
                var keys = w_angular.isObject(config) ? _.keys(config) : [],
                    isShorthand = _.indexOf(keys, "value") === -1 && _.indexOf(keys, "type") === -1 && _.indexOf(keys, "squash") === -1 && _.indexOf(keys, "array") === -1;

                if (isShorthand) { config = { value: config }; }

                config.$$fn = isInjectable(config.value) ? config.value : function () {
                    return config.value;
                };

                return config;
            }

            function getType(config, urlType, location) {
                if (config.type && urlType) {
                    throw new Error("Param '" + id + "' has two type configurations.");
                }

                if (urlType) { return urlType; }
                if (!config.type) { return (location === "config" ? $types.any : $types.string); }

                if (_.isString(config.type)) {
                    return $types[config.type];
                }
                if (config.type instanceof Type) {
                    return config.type;
                }

                return new Type(config.type);
            }

            config = unwrapShorthand(config);
            type = getType(config, type, location);

            // array config: param name (param[]) overrides default settings.  explicit config overrides param name.
            function getArrayMode() {
                var arrayDefaults = {
                        array: (location === "search" ? "auto" : false)
                    },
                    arrayParamNomenclature = id.match(/\[\]$/) ? { array: true } : {};

                return w_angular.extend(arrayDefaults, arrayParamNomenclature, config).array;
            }

            arrayMode = getArrayMode();
            type = arrayMode ? type.$asArray(arrayMode, location === "search") : type;

            if (type.name === "string" && !arrayMode && location === "path" && config.value === undefined) {
                config.value = ""; // for 0.2.x; in 0.3.0+ do not automatically default to ""
            }

            /**
             * returns false, true, or the squash value to indicate the "default parameter url squash policy".
             */
            function getSquashPolicy(config, isOptional) {
                var squash = config.squash;

                if (!isOptional || squash === false)            { return false; }
                if (squash === undefined || squash === null)    { return defaultSquashPolicy; }
                if (squash === true || _.isString(squash))      { return squash; }

                throw new Error("Invalid squash policy: '" + squash + "'. Valid policies: false, true, or arbitrary string");
            }

            function getReplace(config, arrayMode, isOptional, squash) {
                var replace,
                    configuredKeys,
                    defaultPolicy = [
                        {
                            from: "",
                            to: (isOptional || arrayMode ? undefined : "")
                        }, {
                            from: null,
                            to: (isOptional || arrayMode ? undefined : "")
                        }
                    ];

                replace = _.isArray(config.replace) ? config.replace : [];

                if (_.isString(squash)) {
                    replace.push({
                        from: squash,
                        to: undefined
                    });
                }

                configuredKeys = _.map(
                    replace,
                    function (item) { return item.from; }
                );

                return _.filter(
                    defaultPolicy,
                    function (item) {
                        return _.indexOf(configuredKeys, item.from) === -1;
                    }
                ).concat(replace);
            }

            isOptional = config.value !== undefined;
            squash = getSquashPolicy(config, isOptional);
            replace = getReplace(config, arrayMode, isOptional, squash);

            /**
             * [Internal] Get the default value of a parameter, which may be an injectable function.
             */
            function $$getDefaultValue() {
                if (!injector) {
                    throw new Error("Injectable functions cannot be called at configuration time");
                }

                var defaultValue = injector.invoke(
                        config.$$fn,
                        undefined,
                        undefined,
                        self.type.name
                    );

                if (defaultValue !== null && defaultValue !== undefined && !self.type.is(defaultValue)) {
                    throw new Error("Default value (" + defaultValue + ") for parameter '" + self.id + "' is not an instance of Type (" + self.type.name + ")");
                }

                return defaultValue;
            }

            /**
             * [Internal] Gets the decoded representation of a value if the value is defined, otherwise, returns the
             * default value, which may be the result of an injectable function.
             */
            function $value(value) {
                function hasReplaceVal(val) {
                    return function (obj) {
                        return obj.from === val;
                    };
                }

                function $replace(value) {
                    var replacement = _.map(
                            _.filter(self.replace, hasReplaceVal(value)),
                            function (obj) { return obj.to; }
                        );

                    return replacement.length ? replacement[0] : value;
                }
                value = $replace(value);
                return !w_angular.isDefined(value) ? $$getDefaultValue() : self.type.$normalize(value);
            }

            function toString() {
                return "{Param:" + id + " " + type + " squash: '" + squash + "' optional: " + isOptional + "}";
            }

            w_angular.extend(
                this,
                {
                    id: id,
                    type: type,
                    location: location,
                    array: arrayMode,
                    squash: squash,
                    replace: replace,
                    isOptional: isOptional,
                    value: $value,
                    dynamic: undefined,
                    config: config,
                    toString: toString
                }
            );
        };

        function ParamSet(params) {
            w_angular.extend(this, params || {});
        }

        ParamSet.prototype = {
            $$new: function () {
                return w_angular.inherit(this, w_angular.extend(new ParamSet(), {
                    $$parent: this
                }));
            },
            $$keys: function () {
                var keys = [],
                    chain = [],
                    parent = this,
                    ignore = _.keys(ParamSet.prototype);

                while (parent) {
                    chain.push(parent);
                    parent = parent.$$parent;
                }

                chain.reverse();

                w_angular.forEach(
                    chain,
                    function (paramset) {
                        w_angular.forEach(
                            _.keys(paramset),
                            function (key) {
                                if (_.indexOf(keys, key) === -1 && _.indexOf(ignore, key) === -1) { keys.push(key); }
                            }
                        );
                    }
                );

                return keys;
            },
            $$values: function (paramValues) {
                var values = {},
                    self = this;

                w_angular.forEach(
                    self.$$keys(),
                    function (key) {
                        values[key] = self[key].value(paramValues && paramValues[key]);
                    }
                );
                return values;
            },
            $$equals: function (paramValues1, paramValues2) {
                var equal = true,
                    self = this;

                w_angular.forEach(
                    self.$$keys(),
                    function (key) {
                        var left = paramValues1 && paramValues1[key],
                            right = paramValues2 && paramValues2[key];

                        if (!self[key].type.equals(left, right)) { equal = false; }
                    }
                );
                return equal;
            },
            $$validates: function $$validate(paramValues) {
                var keys = this.$$keys(),
                    i, param, rawVal, normalized, encoded;

                for (i = 0; i < keys.length; i += 1) {
                    param = this[keys[i]];
                    rawVal = paramValues[keys[i]];

                    if ((rawVal === undefined || rawVal === null) && param.isOptional) {
                        break; // There was no parameter value, but the param is optional
                    }

                    normalized = param.type.$normalize(rawVal);

                    if (!param.type.is(normalized)) {
                        return false; // The value was not of the correct Type, and could not be decoded to the correct Type
                    }

                    encoded = param.type.encode(normalized);

                    if (_.isString(encoded) && !param.type.pattern.exec(encoded)) {
                        return false; // The value was of the correct type, but when encoded, did not match the Type's regexp
                    }
                }
                return true;
            },
            $$parent: undefined
        };

        this.ParamSet = ParamSet;
    }

    // Register as a provider so it's available to other providers
    w_angular.module('ui.router.util').provider('$urlMatcherFactory', $UrlMatcherFactory);
    w_angular.module('ui.router.util').run(['$urlMatcherFactory', function ($urlMatcherFactory) { msos.console.debug('ng/ui/router - $urlMatcherFactory -> called:', $urlMatcherFactory); }]);


    function $UrlRouterProvider($locationProvider, $urlMatcherFactory) {
        var rules = [],
            otherwise = null,
            interceptDeferred = false,
            listener;

        // Returns a string that is a prefix of all strings matching the RegExp
        function regExpPrefix(re) {
            var prefix = /^\^((?:\\[^a-zA-Z0-9]|[^\\\[\]\^$*+?.()|{}]+)*)/.exec(re.source);

            return (prefix !== null && prefix !== undefined) ? prefix[1].replace(/\\(.)/g, "$1") : '';
        }

        // Interpolates matched values into a String.replace()-style pattern
        function interpolate(pattern, match) {
            return pattern.replace(/\$(\$|\d{1,2})/, function (m_na, what) {
                return match[what === '$' ? 0 : Number(what)];
            });
        }

        this.rule = function (rule) {
            if (!_.isFunction(rule)) { throw new Error("'rule' must be a function"); }
            rules.push(rule);
            return this;
        };

        this.otherwise = function (rule) {
            var redirect;

            if (_.isString(rule)) {
                redirect = rule;
                rule = function () { return redirect; };
            } else if (!_.isFunction(rule)) {
                throw new Error("'rule' must be a function");
            }
            otherwise = rule;
            return this;
        };


        function handleIfMatch($injector, handler, match) {
            if (!match) { return false; }

            var result = $injector.invoke(
                    handler,
                    handler,
                    { $match: match },
                    'handleIfMatch'
                );

            return w_angular.isDefined(result) ? result : true;
        }

        this.when = function (what, handler) {
            var redirect,
                handlerIsString = _.isString(handler),
                strategies,
                check;

            if (_.isString(what)) { what = $urlMatcherFactory.compile(what); }

            if (!handlerIsString && !_.isFunction(handler) && !_.isArray(handler)) {
                throw new Error("invalid 'handler' in when()");
            }

            strategies = {
                matcher: function (what, handler) {
                    if (handlerIsString) {
                        redirect = $urlMatcherFactory.compile(handler);
                        handler = ['$match', function ($match) {
                            return redirect.format($match);
                        }];
                    }
                    return w_angular.extend(
                        function ($injector, $location) {
                            return handleIfMatch(
                                $injector,
                                handler,
                                what.exec(
                                    $location.path(),
                                    $location.$$search      // Eperimental, was $location.search()
                                )
                            );
                        },
                        { prefix: _.isString(what.prefix) ? what.prefix : '' }
                    );
                },
                regex: function (what, handler) {

                    if (what.global || what.sticky) { throw new Error("when() RegExp must not be global or sticky"); }

                    if (handlerIsString) {
                        redirect = handler;
                        handler = ['$match', function ($match) {
                            return interpolate(redirect, $match);
                        }];
                    }
                    return w_angular.extend(
                        function ($injector, $location) {
                            return handleIfMatch($injector, handler, what.exec($location.path()));
                        },
                        { prefix: regExpPrefix(what) }
                    );
                }
            };

            check = {
                matcher: $urlMatcherFactory.isMatcher(what),
                regex: what instanceof RegExp
            };

            if (check.matcher)  { return this.rule(strategies.matcher(what, handler)); }
            if (check.regex)    { return this.rule(strategies.regex(what, handler)); }

            throw new Error("invalid 'what' in when()");
        };

        this.deferIntercept = function (defer) {
            if (defer === undefined) { defer = true; }
            interceptDeferred = defer;
        };

        function $get($location, $rootScope, $injector) {

            var baseHref = w_angular.baseHref,
                location = $location.url(),
                lastPushedUrl;

            function appendBasePath(url, isHtml5, absolute) {
                if (baseHref === '/')   { return url; }
                if (isHtml5)            { return baseHref.slice(0, -1) + url; }
                if (absolute)           { return baseHref.slice(1) + url; }

                return url;
            }

            function update(evt) {
                var i = 0;

                if (evt && evt.defaultPrevented) { return; }

                lastPushedUrl = undefined;

                function check(rule) {
                    var handled = rule($injector, $location);

                    if (!handled) { return false; }

                    if (_.isString(handled)) {
                        msos.console.debug('ng/ui/router - $UrlRouterProvider - $get - update -> url: ' + handled);
                        $location.replace().url(handled);
                    }

                    return true;
                }

                for (i = 0; i < rules.length; i += 1) { if (check(rules[i])) { return; } }

                // always check otherwise last to allow dynamic updates to the set of rules
                if (otherwise) { check(otherwise); }
            }

            function listen() {
                listener = listener || $rootScope.$on('$locationChangeSuccess', update);
                return listener;
            }

            if (!interceptDeferred) { listen(); }

            return {

                sync: function () {
                    update();
                },

                listen: function () {
                    return listen();
                },

                update: function (read) {
                    if (read) {
                        location = $location.url();
                        return;
                    }
                    if ($location.url() === location) { return; }

                    $location.url(location);
                    $location.replace();
                },

                push: function (urlMatcher, params, options) {
                    var url = urlMatcher.format(params || {});

                    // Handle the special hash param, if needed
                    if (url !== null && params && params['#']) {
                        url += '#' + params['#'];
                    }

                    $location.url(url);

                    lastPushedUrl = options && options.$$avoidResync ? $location.url() : undefined;

                    if (options && options.replace) { $location.replace(); }
                },

                href: function (urlMatcher, params, options) {
                    if (!urlMatcher.validates(params)) { return null; }

                    var isHtml5 = $locationProvider.html5Mode(),
                        url,
                        slash,
                        port;

                    if (w_angular.isObject(isHtml5)) {
                        isHtml5 = isHtml5.enabled;
                    }

                    isHtml5 = isHtml5 && Modernizr.history;

                    url = urlMatcher.format(params);
                    options = options || {};

                    if (!isHtml5 && url !== null) {
                        url = "#" + $locationProvider.hashPrefix() + url;
                    }

                    // Handle special hash param, if needed
                    if (url !== null && params && params['#']) {
                        url += '#' + params['#'];
                    }

                    url = appendBasePath(url, isHtml5, options.absolute);

                    if (!options.absolute || !url) {
                        return url;
                    }

                    slash = (!isHtml5 && url ? '/' : '');
                    port = $location.port();

                    port = (port === 80 || port === 443 ? '' : ':' + port);

                    return [$location.protocol(), '://', $location.host(), port, slash, url].join('');
                }
            };
        }

        $get.$inject = ['$location', '$rootScope', '$injector'];
        this.$get = $get;
    }

    $UrlRouterProvider.$inject = ['$locationProvider', '$urlMatcherFactoryProvider'];

    w_angular.module('ui.router.router').provider('$urlRouter', $UrlRouterProvider);


    function $StateProvider($urlRouterProvider, $urlMatcherFactory) {
        var temp_sp = 'ng/ui/router - $StateProvider',
            root,
            states = {},
            $state,
            queue = {},
            abstractKey = 'abstract',
            stateBuilder;

        function isRelative(stateName) {
            return stateName.indexOf(".") === 0 || stateName.indexOf("^") === 0;
        }

        function findState(stateOrName, base) {

            if (!stateOrName) { return undefined; }

            var isStr = _.isString(stateOrName),
                name = isStr ? stateOrName : stateOrName.name,
                path = isRelative(name),
                i = 0,
                rel,
                pathLength,
                current,
                state;

            if (path) {
                if (!base) { throw new Error("No reference point given for path '" + name + "'"); }

                base = findState(base);

                rel = name.split(".");
                pathLength = rel.length;
                current = base;

                for (i = 0; i < pathLength; i += 1) {

                    if (rel[i] === "" && i === 0) {
                        current = base;
                    } else if (rel[i] === "^") {
                        if (!current.parent) {
                            throw new Error("Path '" + name + "' not valid for state '" + base.name + "'");
                        }
                        current = current.parent;
                    } else {
                        break;
                    }
                }

                rel = rel.slice(i).join(".");
                name = current.name + (current.name && rel ? "." : "") + rel;
            }

            state = states[name];

            if (state && (isStr || (!isStr && (state === stateOrName || state.self === stateOrName)))) {
                return state;
            }

            return undefined;
        }

        stateBuilder = {
            // Builds state properties from definition passed to registerState()
            // Derive parent state from a hierarchical name only if 'parent' is not explicitly defined.
            parent: function (state) {
                if (w_angular.isDefined(state.parent) && state.parent) { return findState(state.parent); }
                // regex matches any valid composite state name
                // would match "contact.list" but not "contacts"
                var compositeName = /^(.+)\.[^.]+$/.exec(state.name);

                return compositeName ? findState(compositeName[1]) : root;
            },
            // inherit 'data' from parent and override by own values (if any)
            data: function (state) {
                if (state.parent && state.parent.data) {
                    state.data = state.self.data = w_angular.inherit(state.parent.data, state.data);
                }

                return state.data;
            },
            // Build a URLMatcher if necessary, either via a relative or absolute URL
            url: function (state) {
                var url = state.url,
                    config = { params: state.params || {} };

                if (_.isString(url)) {
                    if (url.charAt(0) === '^') {
                        return $urlMatcherFactory.compile(url.substring(1), config);
                    }
                    return (state.parent.navigable || root).url.concat(url, config);
                }

                if (!url || $urlMatcherFactory.isMatcher(url)) { return url; }

                throw new Error("Invalid url '" + url + "' in state '" + state + "'");
            },
            // Keep track of the closest ancestor state that has a URL (i.e. is navigable)
            navigable: function (state) {
                return state.url ? state : (state.parent ? state.parent.navigable : null);
            },
            // Own parameters for this state. state.url.params is already built at this point. Create and add non-url params
            ownParams: function (state) {
                var params = (state.url && state.url.params) || new $$UMFP.ParamSet();

                w_angular.forEach(
                    state.params || {},
                    function (config, id) {
                        if (!params[id]) { params[id] = new $$UMFP.Param(id, null, config, "config"); }
                    }
                );

                return params;
            },
            // Derive parameters for this state and ensure they're a super-set of parent's parameters
            params: function (state) {
                var ownParams = _.pick(state.ownParams, state.ownParams.$$keys());
                return state.parent && state.parent.params ? w_angular.extend(state.parent.params.$$new(), ownParams) : new $$UMFP.ParamSet();
            },
            // If there is no explicit multi-view configuration, make one up so we don't have
            // to handle both cases in the view directive later. Note that having an explicit
            // 'views' property will mean the default unnamed view properties are ignored. This
            // is also a good time to resolve view names to absolute names, so everything is a
            // straight lookup at link time.
            views: function (state) {
                var views = {};

                w_angular.forEach(
                    w_angular.isDefined(state.views) ? state.views : { '': state },
                    function (view, name) {
                        if (name.indexOf('@') < 0) { name += '@' + state.parent.name; }
                        view.resolveAs = view.resolveAs || state.resolveAs || '$resolve';
                        views[name] = view;
                    }
                );

                return views;
            },
            // Keep a full path from the root down to this state as this is needed for state activation.
            path: function (state) {
                return state.parent ? state.parent.path.concat(state) : []; // exclude root from path
            },
            // Speed up $state.contains() as it's used a lot
            includes: function (state) {
                var includes = state.parent ? w_angular.extend({}, state.parent.includes) : {};
                includes[state.name] = true;

                return includes;
            },
            $delegates: {}
        };

        function queueState(parentName, state) {
            if (!queue[parentName]) {
                queue[parentName] = [];
            }
            queue[parentName].push(state);
        }

        function registerState(state) {
            // Wrap a new object around the state so we can store our private details easily.
            state = w_angular.inherit(state, {
                self: state,
                resolve: state.resolve || {},
                toString: function () {
                    return this.name;
                }
            });

            var name = state.name,
                parentName,
                key,
                queued;

            if (!_.isString(name) || name.indexOf('@') >= 0)    { throw new Error("State must have a valid name"); }
            if (states.hasOwnProperty(name))                    { throw new Error("State '" + name + "' is already defined"); }

            // Get parent name
            parentName = (name.indexOf('.') !== -1) ? name.substring(0, name.lastIndexOf('.')) : (_.isString(state.parent)) ? state.parent : (w_angular.isObject(state.parent) && _.isString(state.parent.name)) ? state.parent.name : '';

            // If parent is not registered yet, add state to queue and register later
            if (parentName && !states[parentName]) {
                return queueState(parentName, state.self);
            }

            for (key in stateBuilder) {
                if (stateBuilder.hasOwnProperty(key) && _.isFunction(stateBuilder[key])) {
                    state[key] = stateBuilder[key](state, stateBuilder.$delegates[key]);
                }
            }

            states[name] = state;

            // Register the state in the global state list and with $urlRouter if necessary.
            if (!state[abstractKey] && state.url) {
                $urlRouterProvider.when(state.url, ['$match', '$stateParams', function ($match, $stateParams) {
                    if ($state.$current.navigable !== state || !equalForKeys($match, $stateParams)) {
                        $state.transitionTo(state, $match, {
                            inherit: true,
                            location: false
                        });
                    }
                }]);
            }

            // Register any queued children
            queued = queue[name] || [];

            while (queued.length) { registerState(queued.shift()); }

            return state;
        }

        // Checks text to see if it looks like a glob.
        function isGlob(text) {
            return text.indexOf('*') > -1;
        }

        // Returns true if glob matches current $state name.
        function doesStateMatchGlob(glob) {
            var globSegments = glob.split('.'),
                segments = $state.$current.name.split('.'),
                i = 0;

            // match single stars
            for (i = 0; i < globSegments.length; i += 1) {
                if (globSegments[i] === '*') {
                    segments[i] = '*';
                }
            }

            // match greedy starts
            if (globSegments[0] === '**') {
                segments = segments.slice(_.indexOf(segments, globSegments[1]));
                segments.unshift('**');
            }

            // match greedy ends
            if (globSegments[globSegments.length - 1] === '**') {
                segments.splice(_.indexOf(segments, globSegments[globSegments.length - 2]) + 1, Number.MAX_VALUE);
                segments.push('**');
            }

            if (globSegments.length !== segments.length) { return false; }

            return segments.join('') === globSegments.join('');
        }

        // Implicit root state that is always active
        root = registerState({
            name: '',
            url: '^',
            views: null,
            'abstract': true
        });

        root.navigable = null;

        this.decorator = function decorator(name, func) {
            var self = this;

            if (_.isString(name) && !w_angular.isDefined(func)) {
                return stateBuilder[name];
            }
            if (!_.isFunction(func) || !_.isString(name)) {
                return self;
            }
            if (stateBuilder[name] && !stateBuilder.$delegates[name]) {
                stateBuilder.$delegates[name] = stateBuilder[name];
            }

            stateBuilder[name] = func;
            return self;
        };

        this.state = function state(name, definition) {
            var self = this;

            if (w_angular.isObject(name)) { definition = name; }
            else                { definition.name = name; }

            registerState(definition);
            return self;
        };

        function shouldSkipReload(to, toParams, from, fromParams, locals, options) {
            // Return true if there are no differences in non-search (path/object) params, false if there are differences

            function nonSearchParamsEqual(fromAndToState, fromParams, toParams) {
                // Identify whether all the parameters that differ between `fromParams` and `toParams` were search params.
                function notSearchParam(key) {
                    return fromAndToState.params[key].location !== "search";
                }

                var nonQueryParamKeys = fromAndToState.params.$$keys().filter(notSearchParam),
                    nonQueryParams = _.pick.apply({}, [fromAndToState.params].concat(nonQueryParamKeys)),
                    nonQueryParamSet = new $$UMFP.ParamSet(nonQueryParams);

                return nonQueryParamSet.$$equals(fromParams, toParams);
            }

            if (!options.reload && to === from && (locals === from.locals || (to.self.reloadOnSearch === false && nonSearchParamsEqual(from, fromParams, toParams)))) {
                return true;
            }

            return false;
        }

        function $get($rootScope, $q, $view, $injector, $resolve, $stateParams, $urlRouter) {

            var temp_sg = 'ng_ui_router_reject_$StateProvider_$get_',
                TransitionSupersededError = new Error('transition superseded'),
                TransitionSuperseded = silenceUncaughtInPromise($q.reject($q.defer(temp_sg + 'rej_suspend'), TransitionSupersededError)),
                TransitionPrevented = silenceUncaughtInPromise($q.reject($q.defer(temp_sg + 'rej_prevent'), new Error('transition prevented'))),
                TransitionAborted = silenceUncaughtInPromise($q.reject($q.defer(temp_sg + 'rej_abort'), new Error('transition aborted'))),
                TransitionFailed = silenceUncaughtInPromise($q.reject($q.defer(temp_sg + 'rej_failed'), new Error('transition failed')));

            // Handles the case where a state which is the target of a transition is not found, and the user
            // can optionally retry or defer the transition
            function handleRedirect(redirect, state, params, options) {

                var evt = $rootScope.$broadcast('$stateNotFound', redirect, state, params),
                    retryTransition;

                if (evt.defaultPrevented) {
                    $urlRouter.update();
                    return TransitionAborted;
                }

                if (!evt.retry) {
                    return null;
                }

                // Allow the handler to return a promise to defer state lookup retry
                if (options.$retry) {
                    $urlRouter.update();
                    return TransitionFailed;
                }

                retryTransition = $state.transition = $q.when($q.defer(temp_sg + '_study_invoke'), evt.retry);

                function rT_then_resolve() {
                        if (retryTransition !== $state.transition) {
                            msos.console.warn(temp_sp + ' - $get - handleRedirect - rT_then_resolve -> failed for:', retryTransition, $state.transition);
                            $rootScope.$broadcast('$stateChangeCancel', redirect.to, redirect.toParams, state, params);
                            return TransitionSuperseded;
                        }
                        redirect.options.$retry = true;
                        return $state.transitionTo(redirect.to, redirect.toParams, redirect.options);
                }

                function rT_then_reject() {
                    msos.console.warn(temp_sp + ' - $get - handleRedirect - rT_then_reject -> called.');
                    return TransitionAborted;
                }

                retryTransition.then(
                    rT_then_resolve,
                    rT_then_reject
                );

                $urlRouter.update();

                return retryTransition;
            }

            function resolveState(state, params, paramsAreFiltered, inherited, dst, options) {
                // Make a restricted $stateParams with only the parameters that apply to this state if
                // necessary. In addition to being available to the controller and onEnter/onExit callbacks,
                // we also need $stateParams to be available for any $injector calls we make during the
                // dependency resolution process.
                var $stateParams = (paramsAreFiltered) ? params : filterByKeys(state.params.$$keys(), params),
                    locals = {
                        $stateParams: $stateParams
                    },
                    promises;

                // Resolve 'global' dependencies for the state, i.e. those not specific to a view.
                // We're also including $stateParams in this; that way the parameters are restricted
                // to the set that should be visible to the state, and are independent of when we update
                // the global $state and $stateParams values.
                dst.resolve = $resolve.resolve(state.resolve, locals, dst.resolve, state);

                promises = [dst.resolve.then(function (globals) { dst.globals = globals; })];

                if (inherited) { promises.push(inherited); }

                function resolveViews() {
                    var viewsPromises = [];

                    // Resolve template and dependencies for all views.
                    w_angular.forEach(state.views, function (view, name) {
                        var injectables = (view.resolve && view.resolve !== state.resolve ? view.resolve : {});
                        injectables.$template = [function () {
                            return $view.load(name, {
                                view: view,
                                locals: dst.globals,
                                params: $stateParams,
                                notify: options.notify
                            }) || '';
                        }];

                        viewsPromises.push($resolve.resolve(injectables, dst.globals, dst.resolve, state).then(function (result) {
                            // References to the controller (only instantiated at link time)
                            if (_.isFunction(view.controllerProvider) || _.isArray(view.controllerProvider)) {
                                var injectLocals = w_angular.extend({}, injectables, dst.globals);
                                result.$$controller = $injector.invoke(
                                    view.controllerProvider,
                                    null,
                                    injectLocals,
                                    'resolveViews'
                                );
                            } else {
                                result.$$controller = view.controller;
                            }
                            // Provide access to the state itself for internal use
                            result.$$state = state;
                            result.$$controllerAs = view.controllerAs;
                            result.$$resolveAs = view.resolveAs;
                            dst[name] = result;
                        }));
                    });

                    return $q.all($q.defer('ng_ui_router_all_$StateProvider_$get_resolveViews'), viewsPromises).then(function () {
                        return dst.globals;
                    });
                }

                // Wait for all the promises and then return the activation object
                return $q.all($q.defer('ng_ui_router_all_$StateProvider_$get_resolveState'), promises).then(resolveViews).then(function () {
                    return dst;
                });
            }

            root.locals = {
                resolve: null,
                globals: {
                    $stateParams: {}
                }
            };

            $state = {
                params: {},
                current: root.self,
                $current: root,
                transition: null
            };

            $state.reload = function reload(state) {
                return $state.transitionTo($state.current, $stateParams, {
                    reload: state || true,
                    inherit: false,
                    notify: true
                });
            };

            $state.go = function go(to, params, options) {
                return $state.transitionTo(to, params, w_angular.extend({
                    inherit: true,
                    relative: $state.$current
                }, options));
            };

            $state.transitionTo = function transitionTo(to, toParams, options) {

                toParams = toParams || {};
                options = w_angular.extend({
                    location: true,
                    inherit: false,
                    relative: null,
                    notify: true,
                    reload: false,
                    $retry: false
                }, options || {});

                var from = $state.$current,
                    fromParams = $state.params,
                    fromPath = from.path,
                    evt,
                    toState = findState(to, options.relative),
                    hash = toParams['#'],   // Store the hash param for later (since it will be stripped out by various methods)
                    redirect,
                    redirectResult,
                    toPath,
                    resolved,
                    l,
                    keep = 0,
                    transition,
                    state,
                    locals,
                    toLocals = [],
                    reloadState;

                if (!w_angular.isDefined(toState)) {
                    redirect = {
                        to: to,
                        toParams: toParams,
                        options: options
                    };
                    redirectResult = handleRedirect(redirect, from.self, fromParams, options);

                    if (redirectResult) {
                        return redirectResult;
                    }

                    // Always retry once if the $stateNotFound was not prevented
                    // (handles either redirect changed or state lazy-definition)
                    to = redirect.to;
                    toParams = redirect.toParams;
                    options = redirect.options;
                    toState = findState(to, options.relative);

                    if (!w_angular.isDefined(toState)) {
                        if (!options.relative) { throw new Error("No such state '" + to + "'"); }
                        throw new Error("Could not resolve '" + to + "' from state '" + options.relative + "'");
                    }
                }

                if (toState[abstractKey]) { throw new Error("Cannot transition to abstract state '" + to + "'"); }

                if (options.inherit) {
                    toParams = inheritParams($stateParams, toParams || {}, $state.$current, toState);
                }

                if (!toState.params.$$validates(toParams)) {
                    return TransitionFailed;
                }

                toParams = toState.params.$$values(toParams);
                to = toState;

                toPath = to.path;

                // Starting from the root of the path, keep all levels that haven't changed
                state = toPath[keep];
                locals = root.locals;

                if (!options.reload) {
                    while (state && state === fromPath[keep] && state.ownParams.$$equals(toParams, fromParams)) {
                        locals = toLocals[keep] = state.locals;
                        keep += 1;
                        state = toPath[keep];
                    }
                } else if (_.isString(options.reload) || w_angular.isObject(options.reload)) {
                    if (w_angular.isObject(options.reload) && !options.reload.name) {
                        throw new Error('Invalid reload state object');
                    }

                    reloadState = options.reload === true ? fromPath[0] : findState(options.reload);

                    if (options.reload && !reloadState) {
                        throw new Error("No such reload state '" + (_.isString(options.reload) ? options.reload : options.reload.name) + "'");
                    }

                    while (state && state === fromPath[keep] && state !== reloadState) {
                        locals = toLocals[keep] = state.locals;
                        keep += 1;
                        state = toPath[keep];
                    }
                }

                // If we're going to the same state and all locals are kept, we've got nothing to do.
                // But clear 'transition', as we still want to cancel any other pending transitions.
                if (shouldSkipReload(to, toParams, from, fromParams, locals, options)) {
                    if (hash) { toParams['#'] = hash; }

                    $state.params = toParams;
                    w_angular.copy($state.params, $stateParams);
                    w_angular.copy(filterByKeys(to.params.$$keys(), $stateParams), to.locals.globals.$stateParams);

                    if (options.location && to.navigable && to.navigable.url) {
                        $urlRouter.push(to.navigable.url, toParams, {
                            $$avoidResync: true,
                            replace: options.location === 'replace'
                        });
                        $urlRouter.update(true);
                    }
                    $state.transition = null;
                    return $q.when($q.defer('ng_ui_router_when_$StateProvider_$get_$state.transitionTo_skip_reload'), $state.current);
                }

                // Filter parameters before we pass them to event handlers etc.
                toParams = filterByKeys(to.params.$$keys(), toParams || {});

                // Re-add the saved hash before we start returning things or broadcasting $stateChangeStart
                if (hash) { toParams['#'] = hash; }

                // Broadcast start event and cancel the transition if requested
                if (options.notify) {

                    if ($rootScope.$broadcast('$stateChangeStart', to.self, toParams, from.self, fromParams, options).defaultPrevented) {
                        $rootScope.$broadcast('$stateChangeCancel', to.self, toParams, from.self, fromParams);
                        //Don't update and resync url if there's been a new transition started. see issue #2238, #600
                        if ($state.transition === null || $state.transition === undefined) { $urlRouter.update(); }
                        return TransitionPrevented;
                    }
                }

                resolved = $q.when($q.defer('ng_ui_router_when_$StateProvider_$get_$state.transitionTo'), locals);

                for (l = keep; l < toPath.length; l += 1, state = toPath[l]) {
                    locals = toLocals[l] = w_angular.inherit(locals);
                    resolved = resolveState(state, toParams, state === to, resolved, locals, options);
                }

                function rS_resolve() {
                    var l,
                        entering,
                        exiting;

                    if (transition !== $state.transition) {
                        msos.console.warn(temp_sp + ' - $get - resolveState - $state.transitionTo - rS_resolve -> failed for:', transition, $state.transition);
                        $rootScope.$broadcast('$stateChangeCancel', to.self, toParams, from.self, fromParams);
                        return TransitionSuperseded;
                    }

                    // Exit 'from' states not kept
                    for (l = fromPath.length - 1; l >= keep; l -= 1) {
                        exiting = fromPath[l];
                        if (exiting.self.onExit) {
                            $injector.invoke(
                                exiting.self.onExit,
                                exiting.self,
                                exiting.locals.globals,
                                '$state.transitionTo.onExit'
                            );
                        }
                        exiting.locals = null;
                    }

                    // Enter 'to' states not kept
                    for (l = keep; l < toPath.length; l += 1) {
                        entering = toPath[l];
                        entering.locals = toLocals[l];
                        if (entering.self.onEnter) {
                            $injector.invoke(
                                entering.self.onEnter,
                                entering.self,
                                entering.locals.globals,
                                '$state.transitionTo.onEnter'
                            );
                        }
                    }

                    // Run it again, to catch any transitions in callbacks
                    if ($state.transition !== transition) {
                        msos.console.warn(temp_sp + ' - $get - resolveState - $state.transitionTo - rS_resolve -> failed for:', transition, $state.transition);
                        $rootScope.$broadcast('$stateChangeCancel', to.self, toParams, from.self, fromParams);
                        return TransitionSuperseded;
                    }

                    // Update globals in $state
                    $state.$current = to;
                    $state.current = to.self;
                    $state.params = toParams;
                    w_angular.copy($state.params, $stateParams);
                    $state.transition = null;

                    if (options.location && to.navigable) {
                        $urlRouter.push(to.navigable.url, to.navigable.locals.globals.$stateParams, {
                            $$avoidResync: true,
                            replace: options.location === 'replace'
                        });
                    }

                    if (options.notify) {
                        $rootScope.$broadcast('$stateChangeSuccess', to.self, toParams, from.self, fromParams);
                    }

                    $urlRouter.update(true);

                    return $state.current;
                }

                function rS_reject(error) {

                    if (error === TransitionSupersededError) { return TransitionSuperseded; }

                    if ($state.transition !== transition) {
                        msos.console.warn(temp_sp + ' - $get - resolveState - $state.transitionTo - rS_reject -> failed:', transition, $state.transition);
                        $rootScope.$broadcast('$stateChangeCancel', to.self, toParams, from.self, fromParams);
                        return TransitionSuperseded;
                    }

                    $state.transition = null;

                    evt = $rootScope.$broadcast('$stateChangeError', to.self, toParams, from.self, fromParams, error);

                    if (!evt.defaultPrevented) {
                        $urlRouter.update();
                    }

                    return $q.reject($q.defer('ng_ui_router_reject_$StateProvider_$get_$state.transitionTo'), error);
                }

                transition = $state.transition = resolved.then(
                    rS_resolve
                ).then(
                    null,
                    rS_reject
                );

                silenceUncaughtInPromise(transition);
                return transition;
            };

            $state.is = function is(stateOrName, params, options) {

                options = w_angular.extend({
                    relative: $state.$current
                }, options || {});

                var state = findState(stateOrName, options.relative);

                if (!w_angular.isDefined(state)) {
                    return undefined;
                }
                if ($state.$current !== state) {
                    return false;
                }
 //               return params ? equalForKeys(state.params.$$values(params), $stateParams) : true;
                return !params || _.keys(params).reduce(
                        function (acc, key) {
                            var paramDef = state.params[key];

                            return acc && !paramDef || paramDef.type.equals($stateParams[key], params[key]);
                        },
                        true
                    );
            };

            $state.includes = function includes(stateOrName, params, options) {
                options = w_angular.extend({
                    relative: $state.$current
                }, options || {});
                if (_.isString(stateOrName) && isGlob(stateOrName)) {
                    if (!doesStateMatchGlob(stateOrName)) {
                        return false;
                    }
                    stateOrName = $state.$current.name;
                }

                var state = findState(stateOrName, options.relative),
                    keys,
                    key,
                    paramDef,
                    i = 0;
                
                if (!w_angular.isDefined(state)) {
                    return undefined;
                }

                if (!w_angular.isDefined($state.$current.includes[state.name])) {
                    return false;
                }

                if (!params) { return true; }

                keys = _.keys(params);

                for (i = 0; i < keys.length; i += 1) {
                    key = keys[i];
                    paramDef = state.params[key];

                    if (paramDef && !paramDef.type.equals($stateParams[key], params[key])) {
                        return false;
                    }
                }

//                return true;
                return _.keys(params).reduce(
                        function (acc, key) {
                            var paramDef = state.params[key];

                            return acc && !paramDef || paramDef.type.equals($stateParams[key], params[key]);
                        },
                        true
                    );
            };

            $state.href = function href(stateOrName, params, options) {
                options = w_angular.extend({
                    lossy: true,
                    inherit: true,
                    absolute: false,
                    relative: $state.$current
                }, options || {});

                var state = findState(stateOrName, options.relative),
                    nav;

                if (!w_angular.isDefined(state)) { return null; }
                if (options.inherit) { params = inheritParams($stateParams, params || {}, $state.$current, state); }

                nav = (state && options.lossy) ? state.navigable : state;

                if (!nav || nav.url === undefined || nav.url === null) {
                    return null;
                }

                return $urlRouter.href(nav.url, filterByKeys(state.params.$$keys().concat('#'), params || {}), {
                    absolute: options.absolute
                });
            };

            $state.get = function (stateOrName, context) {
                if (arguments.length === 0) {
                    return _.map(_.keys(states), function (name) { return states[name].self; });
                }

                var state = findState(stateOrName, context || $state.$current);

                return (state && state.self) ? state.self : null;
            };

            return $state;
        }

        $get.$inject = ['$rootScope', '$q', '$view', '$injector', '$resolve', '$stateParams', '$urlRouter'];

        this.$get = $get;
    }

    $StateProvider.$inject = ['$urlRouterProvider', '$urlMatcherFactoryProvider'];

    w_angular.module(
        'ui.router.state'
    ).factory(
        '$stateParams',
        function () { return {}; }
    ).constant(
        '$state.runtime',
        { autoinject: true }
    ).provider(
        '$state',
        $StateProvider
    ).run(
        ['$injector', function ($injector) {
            if ($injector.get("$state.runtime").autoinject) {
                $injector.get('$state');
            }
        }]
    );


    function $ViewProvider() {

        function $get($templateFactory) {
            return {

                load: function load(name, options) {
                    var result, defaults = {
                        template: null,
                        controller: null,
                        view: null,
                        locals: null,
                        notify: true,
                        async: true,
                        params: {}
                    };
                    options = w_angular.extend(defaults, options);

                    msos.console.debug('ng/ui/router - $ViewProvider - $get - load -> called for: ' + name);

                    if (options.view) {
                        result = $templateFactory.fromConfig(options.view, options.params, options.locals);
                    }

                    return result;
                }
            };
        }

        $get.$inject = ['$templateFactory'];
        this.$get = $get;
    }

    $ViewProvider.$inject = [];

    w_angular.module('ui.router.state').provider('$view', $ViewProvider);


    function $ViewScrollProvider() {

        this.$get = ['$timeout', function ($timeout) {

            return function ($element) {
                return $timeout(function () {
                    $element[0].scrollIntoView();
                }, 0, false);
            };
        }];
    }

    w_angular.module('ui.router.state').provider('$uiViewScroll', $ViewScrollProvider);

    function getUiViewName(scope, attrs, element, $interpolate) {
        var name = $interpolate(attrs.uiView || attrs.name || '')(scope),
            uiViewCreatedBy = element.inheritedData('$uiView');

        return name.indexOf('@') >= 0 ?  name : (name + '@' + (uiViewCreatedBy ? uiViewCreatedBy.state.name : ''));
    }

    function $ViewDirective($state, $injector, $uiViewScroll, $interpolate, $q) {

        function getService() {
            return ($injector.has) ? function (service) {
                    return $injector.has(service) ? $injector.get(service) : null;
                } : function(service) {
                    try {
                        return $injector.get(service);
                    } catch (e) {
                        return null;
                    }
                };
        }

        var service = getService(),
            $animator = service('$animator'),
            $animate = service('$animate'),
            directive;

        function getRenderer(attrs, scope) {
            var statics = function () {
                    return {
                        enter: function (element, target, cb) { target.after(element); cb(); },
                        leave: function (element, cb) { element.remove(); cb(); }
                    };
                },
                animate;

            if ($animate) {
                return {
                    enter: function (element, target, cb) {
                        $animate.enter(element, null, target).then(cb);
                    },
                    leave: function (element, cb) {
                        $animate.leave(element).then(cb);
                    }
                };
            }

            if ($animator) {
                animate = $animator && $animator(scope, attrs);

                return {
                    enter: function (element, target, cb) { animate.enter(element, null, target); cb(); },
                    leave: function (element, cb) { animate.leave(element); cb(); }
                };
            }

            return statics();
        }

        directive = {
            restrict: 'ECA',
            terminal: true,
            priority: 400,
            transclude: 'element',
            compile: function (tElement_na, tAttrs_na, $transclude) {
                return function (scope, $element, attrs) {
                    var previousEl, currentEl, currentScope, latestLocals,
                        onloadExp = attrs.onload || '',
                        autoScrollExp = attrs.autoscroll,
                        renderer = getRenderer(attrs, scope);

                    function cleanupLastView() {
                        if (previousEl) {
                            previousEl.remove();
                            previousEl = null;
                        }

                        if (currentScope) {
                            currentScope.$destroy();
                            currentScope = null;
                        }

                        if (currentEl) {
                            var $uiViewData = currentEl.data('$uiViewAnim');
                            
                            renderer.leave(
                                currentEl,
                                function () {
                                    $uiViewData.$$animLeave.resolve();
                                    previousEl = null;
                                }
                            );

                            previousEl = currentEl;
                            currentEl = null;
                        }
                    }

                    function updateView(firstTime) {
                        var newScope,
                            name = getUiViewName(scope, attrs, $element, $interpolate),
                            previousLocals = name && $state.$current && $state.$current.locals[name],
                            clone;

                        if (!firstTime && previousLocals === latestLocals) { return; }      // nothing to do

                        newScope = scope.$new();
                        latestLocals = $state.$current.locals[name];

                        newScope.$emit('$viewContentLoading', name);

                        clone = $transclude(
                            newScope,
                            function (clone) {
                                var animEnter = $q.defer('ng_ui_router_$ViewDirective_updateView_animEnter_def'),
                                    animLeave = $q.defer('ng_ui_router_$ViewDirective_updateView_animLeave_def'),
                                    viewAnimData = {
                                        $animEnter: animEnter.promise,
                                        $animLeave: animLeave.promise,
                                        $$animLeave: animLeave
                                    };

                                clone.data('$uiViewAnim', viewAnimData);

                                renderer.enter(
                                    clone,
                                    $element,
                                    function onUiViewEnter() {
                                        animEnter.resolve();

                                        if (currentScope) {
                                            currentScope.$emit('$viewContentAnimationEnded');
                                        }

                                        if ((w_angular.isDefined(autoScrollExp) && !autoScrollExp) || scope.$eval(autoScrollExp)) {
                                            $uiViewScroll(clone);
                                        }
                                    }
                                );

                                cleanupLastView();
                            }
                        );

                        currentEl = clone;
                        currentScope = newScope;
                        currentScope.$emit('$viewContentLoaded', name);
                        currentScope.$eval(onloadExp);
                    }

                    scope.$on('$stateChangeSuccess', function () {
                        updateView(false);
                    });

                    updateView(true);
                };
            }
        };

        return directive;
    }

    $ViewDirective.$inject = ['$state', '$injector', '$uiViewScroll', '$interpolate', '$q'];


    function $ViewDirectiveFill($compile, $controller, $state, $interpolate) {
        return {
            restrict: 'ECA',
            priority: -400,
            compile: function (tElement) {
                var initial = tElement.html();

                if (tElement.empty) {
                    tElement.empty();
                } else {
                    // ng 1.0.0 doesn't have empty(), which cleans up data and handlers
                    tElement[0].innerHTML = null;
                }

                return function (scope, $element, attrs) {
                    var current = $state.$current,
                        name = getUiViewName(scope, attrs, $element, $interpolate),
                        locals = current && current.locals[name],
                        resolveData,
                        link,
                        controller;

                    if (!locals) {
                        $element.html(initial);
                        $compile($element.contents())(scope);
                        return;
                    }

                    $element.data(
                        '$uiView', {
                            name: name,
                            state: locals.$$state
                        }
                    );

                    $element.html(locals.$template || initial);

                    resolveData = w_angular.extend({}, locals);
                    scope[locals.$$resolveAs] = resolveData;

                    link = $compile($element.contents());

                    if (locals.$$controller) {

                        locals.$scope = scope;
                        locals.$element = $element;

                        controller = $controller(locals.$$controller, locals);

                        if (locals.$$controllerAs) {
                            scope[locals.$$controllerAs] = controller;
                            scope[locals.$$controllerAs][locals.$$resolveAs] = resolveData;
                        }

                        if (_.isFunction(controller.$onInit)) { controller.$onInit(); }

                        $element.data('$ngControllerController', controller);
                        $element.children().data('$ngControllerController', controller);
                    }

                    link(scope);
                };
            }
        };
    }

    $ViewDirectiveFill.$inject = ['$compile', '$controller', '$state', '$interpolate'];


    w_angular.module('ui.router.state').directive('uiView', $ViewDirective);
    w_angular.module('ui.router.state').directive('uiView', $ViewDirectiveFill);

    function parseStateRef(ref, current) {
        var preparsed = ref.match(/^\s*({[^}]*})\s*$/),
            parsed;

        if (preparsed) { ref = current + '(' + preparsed[1] + ')'; }

        parsed = ref.replace(/\n/g, " ").match(/^([^(]+?)\s*(\((.*)\))?$/);

        if (!parsed || parsed.length !== 4) { throw new Error("Invalid state ref '" + ref + "'"); }

        return {
            state: parsed[1],
            paramExpr: parsed[3] || null
        };
    }

    function stateContext(el) {
        var stateData = el.parent().inheritedData('$uiView');

        if (stateData && stateData.state && stateData.state.name) {
            return stateData.state;
        }

        return undefined;
    }

    function getTypeInfo(el) {
        // SVGAElement does not use the href attribute, but rather the 'xlinkHref' attribute.
        var isSvg = Object.prototype.toString.call(el.prop('href')) === '[object SVGAnimatedString]',
            isForm = el[0].nodeName === "FORM";

        return {
            attr: isForm ? "action" : (isSvg ? 'xlink:href' : 'href'),
            isAnchor: el.prop("tagName").toUpperCase() === "A",
            clickable: !isForm
        };
    }

    function clickHook(el, $state, $timeout, type, current) {
        return function (e) {
            var button = e.which || e.button,
                target = current(),
                transition,
                ignorePreventDefaultCount;

            if (!(button > 1 || e.ctrlKey || e.metaKey || e.shiftKey || el.attr('target'))) {
                // HACK: This is to allow ng-clicks to be processed before the transition is initiated:
                transition = $timeout(function router_clickhook_timeout() {
                    $state.go(target.state, target.params, target.options);
                });

                e.preventDefault();

                // if the state has no URL, ignore one preventDefault from the <a> directive.
                ignorePreventDefaultCount = type.isAnchor && !target.href ? 1 : 0;

                e.preventDefault = function () {
                    if (ignorePreventDefaultCount <= 0) { $timeout.cancel(transition); }
                    ignorePreventDefaultCount -= 1;
                };
            }
        };
    }

    function defaultOpts(el, $state) {
        return {
            relative: stateContext(el) || $state.$current,
            inherit: true
        };
    }


    function $StateRefDirective($state, $timeout) {
        return {
            restrict: 'A',
            require: ['?^uiSrefActive', '?^uiSrefActiveEq'],
            link: function (scope, element, attrs, uiSrefActive) {
                var ref = parseStateRef(attrs.uiSref, $state.current.name),
                    def = {
                        state: ref.state,
                        href: null,
                        params: null
                    },
                    type = getTypeInfo(element),
                    active = uiSrefActive[1] || uiSrefActive[0],
                    update,
                    unlinkInfoFn = null,
                    hookFn;

                def.options = w_angular.extend(defaultOpts(element, $state), attrs.uiSrefOpts ? scope.$eval(attrs.uiSrefOpts) : {});

                update = function (val) {

                    if (val) { def.params = w_angular.copy(val); }
                    def.href = $state.href(ref.state, def.params, def.options);

                    if (unlinkInfoFn) { unlinkInfoFn(); }
                    if (active) { unlinkInfoFn = active.$$addStateInfo(ref.state, def.params); }
                    if (def.href !== null) { attrs.$set(type.attr, def.href); }
                };

                if (ref.paramExpr) {
                    scope.$watch(
                        ref.paramExpr,
                        function (val) {
                            if (val !== def.params) { update(val); }
                        },
                        true
                    );

                    def.params = w_angular.copy(scope.$eval(ref.paramExpr));
                }

                update();

                if (!type.clickable) { return; }

                hookFn = clickHook(element, $state, $timeout, type, function () { return def; });

                element[element.on ? 'on' : 'bind']("click", hookFn);

                scope.$on(
                    '$destroy',
                    function () {
                        element[element.off ? 'off' : 'unbind']("click", hookFn);
                    }
                );
            }
        };
    }

    $StateRefDirective.$inject = ['$state', '$timeout'];


    function $StateRefDynamicDirective($state, $timeout) {

        return {
            restrict: 'A',
            require: ['?^uiSrefActive', '?^uiSrefActiveEq'],
            link: function (scope, element, attrs, uiSrefActive) {
                var type = getTypeInfo(element),
                    active = uiSrefActive[1] || uiSrefActive[0],
                    group = [attrs.uiState, attrs.uiStateParams || null, attrs.uiStateOpts || null],
                    watch = '[' + group.map(function (val) {
                            return val || 'null';
                        }).join(', ') + ']',
                    def = {
                        state: null,
                        params: null,
                        options: null,
                        href: null
                    },
                    unlinkInfoFn = null,
                    hookFn;

                function runStateRefLink(group) {
                    def.state = group[0];
                    def.params = group[1];
                    def.options = group[2];
                    def.href = $state.href(def.state, def.params, def.options);

                    if (unlinkInfoFn) { unlinkInfoFn(); }
                    if (active)     { unlinkInfoFn = active.$$addStateInfo(def.state, def.params); }
                    if (def.href)   { attrs.$set(type.attr, def.href); }
                }

                scope.$watch(watch, runStateRefLink, true);
                runStateRefLink(scope.$eval(watch));

                if (!type.clickable) { return; }

                hookFn = clickHook(element, $state, $timeout, type, function () { return def; });

                element[element.on ? 'on' : 'bind']("click", hookFn);

                scope.$on(
                    '$destroy',
                    function () {
                        element[element.off ? 'off' : 'unbind']("click", hookFn);
                    }
                );
            }
        };
    }

    $StateRefDynamicDirective.$inject = ['$state', '$timeout'];


    function $StateRefActiveDirective($state, $interpolate) {

        return {
            restrict: "A",
            controller: ['$scope', '$element', '$attrs', '$timeout',
                function StateRefActiveDirectiveFunc($scope, $element, $attrs, $timeout) {

                var states = [],
                    activeClasses = {},
                    activeEqClass, uiSrefActive;

                function addClass(el, className) {
                    $timeout(function () {
                        el.addClass(className);
                    });
                }

                function removeClass(el, className) {
                    el.removeClass(className);
                }

                function anyMatch(state, params) {
                    return $state.includes(state.name, params);
                }

                function exactMatch(state, params) {
                    return $state.is(state.name, params);
                }

                // Update route state
                function update() {
                    var i = 0;

                    for (i = 0; i < states.length; i += 1) {
                        if (anyMatch(states[i].state, states[i].params)) {
                            addClass($element, activeClasses[states[i].hash]);
                        } else {
                            removeClass($element, activeClasses[states[i].hash]);
                        }

                        if (exactMatch(states[i].state, states[i].params)) {
                            addClass($element, activeEqClass);
                        } else {
                            removeClass($element, activeEqClass);
                        }
                    }
                }

                function createStateHash(state, params) {
                    if (!_.isString(state)) {
                        throw new Error('state should be a string');
                    }
                    if (w_angular.isObject(params)) {
                        return state + w_angular.toJson(params);
                    }

                    params = $scope.$eval(params);

                    if (w_angular.isObject(params)) {
                        return state + w_angular.toJson(params);
                    }

                    return state;
                }

                function addState(stateName, stateParams, activeClass) {
                    var state = $state.get(stateName, stateContext($element)),
                        stateHash = createStateHash(stateName, stateParams),
                        stateInfo = {
                            state: state || { name: stateName },
                            params: stateParams,
                            hash: stateHash
                        };

                    states.push(stateInfo);
                    activeClasses[stateHash] = activeClass;

                    return function removeState() {
                        var idx = states.indexOf(stateInfo);

                        if (idx !== -1) { states.splice(idx, 1); }
                    };
                }

                activeEqClass = $interpolate($attrs.uiSrefActiveEq || '', false)($scope);

                try {
                    uiSrefActive = $scope.$eval($attrs.uiSrefActive);
                } catch (e) {
                    // Do nothing. uiSrefActive is not a valid expression.
                    // Fall back to using $interpolate below
                }

                uiSrefActive = uiSrefActive || $interpolate($attrs.uiSrefActive || '', false)($scope);

                if (w_angular.isObject(uiSrefActive)) {
                    w_angular.forEach(
                        uiSrefActive,
                        function (stateOrName, activeClass) {
                            var ref;

                            if (_.isString(stateOrName)) {
                                ref = parseStateRef(stateOrName, $state.current.name);
                                addState(ref.state, $scope.$eval(ref.paramExpr), activeClass);
                            }
                        }
                    );
                }

                this.$$addStateInfo = function (newState, newParams) {

                    if (w_angular.isObject(uiSrefActive) && states.length > 0) {
                        return undefined;
                    }

                    var deregister = addState(newState, newParams, uiSrefActive);
                    update();

                    return deregister;
                };

                $scope.$on('$stateChangeSuccess', update);

                update();
            }]
        };
    }

    $StateRefActiveDirective.$inject = ['$state', '$interpolate'];


    w_angular.module('ui.router.state')
        .directive('uiSref', $StateRefDirective)
        .directive('uiSrefActive', $StateRefActiveDirective)
        .directive('uiSrefActiveEq', $StateRefActiveDirective)
        .directive('uiState', $StateRefDynamicDirective);

    function $IsStateFilter($state) {
        var isFilter = function (state, params) {
                return $state.is(state, params);
            };

        isFilter.$stateful = true;
        return isFilter;
    }

    $IsStateFilter.$inject = ['$state'];


    function $IncludedByStateFilter($state) {
        var includesFilter = function (state, params, options) {
                return $state.includes(state, params, options);
            };

        includesFilter.$stateful = true;
        return includesFilter;
    }

    $IncludedByStateFilter.$inject = ['$state'];


    w_angular.module('ui.router.state')
        .filter('isState', $IsStateFilter)
        .filter('includedByState', $IncludedByStateFilter);

}(window.angular));