
/**
 * State-based routing for AngularJS 1.x
 * NOTICE: This monolithic bundle also bundles the @uirouter/core code.
 *         This causes it to be incompatible with plugins that depend on @uirouter/core.
 *         We recommend switching to the ui-router-core.js and ui-router-angularjs.js bundles instead.
 *         For more information, see http://ui-router.github.io/blog/angular-ui-router-umd-bundles
 * @version v1.0.14
 * @link https://ui-router.github.io
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

/*global
    msos: false,
    _: false
*/

msos.console.info('ng/ui/router/v1014_msos -> start.');
msos.console.time('ng/ui/router');

(function (global, factory) {

    global['@uirouter/angularjs'] = {};

    factory(
        global['@uirouter/angularjs'],
        global.angular
    );

}(this, (function (exports, ng_from_import) {
    'use strict';

	function noop_rt() {
		msos.console.trace('ng.ui.router - noop_rt -> executed.');
		return undefined;
	}

	function copy(src, dest) {
		if (dest) {
			Object.keys(dest).forEach(function (key) { return delete dest[key]; });
		}
		if (!dest) {
			dest = {};
		}
		return extend(dest, src);
	}

	function _extend(toObj) {
		var i = 0,
			obj,
			keys,
			j = 0;

		for (i = 1; i < arguments.length; i++) {
			obj = arguments[i];

			if (!obj) { continue; }

			keys = Object.keys(obj);

			for (j = 0; j < keys.length; j++) {
				toObj[keys[j]] = obj[keys[j]];
			}
		}
		return toObj;
	}

    function curry(fn) {
        var initial_args = [].slice.apply(arguments, [1]),
			func_args_length = fn.length;

        function curried(args) {
            if (args.length >= func_args_length) {
                return fn.apply(null, args);
            }
            return function () {
                return curried(args.concat([].slice.apply(arguments)));
            };
        }
        return curried(initial_args);
    }

    function compose() {
        var args = arguments,
			start = args.length - 1;

        return function () {
            var i = start,
                result = args[start].apply(this, arguments);

            while (i--) {
                result = args[i].call(this, result);
            }
            return result;
        };
    }

    function pipe() {
        var funcs = [];

        for (var _i = 0; _i < arguments.length; _i++) {
            funcs[_i] = arguments[_i];
        }
        return compose.apply(null, [].slice.call(arguments).reverse());
    }

    function _inArray(array, obj) {
        return array.indexOf(obj) !== -1;
    }

    function _removeFrom(array, obj) {
        var idx = array.indexOf(obj);
        if (idx >= 0)
            array.splice(idx, 1);
        return array;
    }

    function pushR(arr, obj) {
        arr.push(obj);
        return arr;
    }

	function _pushTo(arr, _val) {
		return (arr.push(_val), _val);
	}

    function assertFn(predicateOrMap, errMsg) {
        if (errMsg === void 0) {
            errMsg = 'assert failure';
        }
        return function (obj) {
            var result = predicateOrMap(obj);
            if (!result) {
                throw new Error(_.isFunction(errMsg) ? errMsg(obj) : errMsg);
            }
            return result;
        };
    }

    var msos_debug = msos.console.debug,
		msos_trace = msos.console.trace,
		msos_verbose = msos.config.verbose,
		fromJson = ng_from_import.fromJson,
		toJson = ng_from_import.toJson,
		forEach = ng_from_import.forEach,
		extend = Object.assign || _extend,
		equals = ng_from_import.equals,
		pushTo = curry(_pushTo),
		prop = function (name) {
			return function (obj) {
				return obj && obj[name];
			};
		},
		propEq = curry(function (name, _val, obj) {
			return obj && obj[name] === _val;
		}),
		parse = function (name) {
			return pipe.apply(null, name.split('.').map(prop));
		},
		not = function (fn) {
			return function () {
				var args = [];
				for (var _i = 0; _i < arguments.length; _i++) {
					args[_i] = arguments[_i];
				}
				return !fn.apply(null, args);
			};
		},
		is = function (ctor) {
			return function (obj) {
				return (obj !== null && obj !== undefined && obj.constructor === ctor || obj instanceof ctor);
			};
		},
		val = function (v) {
			return function () {
				return v;
			};
		},
		Glob,
		StateObject,
		isDefined = not(_.isUndefined),
		isNullOrUndefined = or(_.isNull, _.isUndefined),
		services = {
			$q: undefined,
			$injector: undefined,
		},
		isState,
		isPromise,
		notImplemented = function (fnname) {
			return function () {
				throw new Error(fnname + '(): No coreservices implementation for UI-Router is loaded.');
			};
		},
		inArray = curry(_inArray),
		removeFrom = curry(_removeFrom),
		deregAll = function (functions) {
			return functions.slice().forEach(
				function (fn) {
					if (typeof fn === 'function') { fn(); }
					removeFrom(functions, fn);
				}
			);
		},
		inherit = function (parent, extra) {
			return extend(Object.create(parent), extra);
		},
		mergeR = function (memo, item) {
			return extend(memo, item);
		},
		mapObj,
		values = function (obj) {
			return Object.keys(obj).map(function (key) {
				return obj[key];
			});
		},
		allTrueR = function (memo, elem) {
			return memo && elem;
		},
		anyTrueR = function (memo, elem) {
			return memo || elem;
		},
		unnestR = function (memo, elem) {
			return memo.concat(elem);
		},
		flattenR = function (memo, elem) {
			return _.isArray(elem) ? memo.concat(elem.reduce(flattenR, [])) : pushR(memo, elem);
		},
		uniqR = function (acc, token) {
			return inArray(acc, token) ? acc : pushR(acc, token);
		},
		unnest = function (arr) {
			return arr.reduce(unnestR, []);
		},
		assertPredicate = assertFn,
		silenceUncaughtInPromise,
		silentRejection,
		Queue,
		id = 0,
		Rejection,
		viewConfigString,
		_tid,
		_rid,
		transLbl,
		Trace,
		trace,
		TargetState,
		defaultOptions = {
			current: noop_rt,
			transition: null,
			traceData: {},
			bind: null,
		},
		TransitionHook,
		RegisteredHook,
		HookBuilder,
		ParamType,
		hasOwn,
		isShorthand,
		Param,
		PathNode,
		PathUtils,
		defaultResolvePolicy,
		Resolvable,
		resolvePolicies,
		whens,
		ALL_WHENS,
		EAGER_WHENS,
		NATIVE_INJECTOR_TOKEN,
		ResolveContext,
		UIInjectorImpl;

    function and(fn1, fn2) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return fn1.apply(null, args) && fn2.apply(null, args);
        };
    }

    function or(fn1, fn2) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return fn1.apply(null, args) || fn2.apply(null, args);
        };
    }

    function invoke(fnName, args) {
        return function (obj) {
            return obj[fnName].apply(obj, args);
        };
    }

    function pattern(struct) {
        return function (x) {
            for (var i = 0; i < struct.length; i++) {
                if (struct[i][0](x))
                    return struct[i][1](x);
            }
        };
    }

    Glob = (function () {

        function Glob(text) {
            this.text = text;
            this.glob = text.split('.');
            var regexpString = this.text.split('.')
                .map(function (seg) {
                    if (seg === '**')
                        return '(?:|(?:\\.[^.]*)*)';
                    if (seg === '*')
                        return '\\.[^.]*';
                    return '\\.' + seg;
                }).join('');
            this.regexp = new RegExp('^' + regexpString + '$');
        }

        /** Returns true if the string has glob-like characters in it */
        Glob.is = function (text) {
            return !!/[!,*]+/.exec(text);
        };
        /** Returns a glob from the string, or null if the string isn't Glob-like */
        Glob.fromString = function (text) {
            return Glob.is(text) ? new Glob(text) : null;
        };

        Glob.prototype.matches = function (name) {
            return this.regexp.test('.' + name);
        };

        return Glob;
    }());

    StateObject = (function () {

        function StateObject(config) {
            return StateObject.create(config || {});
        }

        StateObject.create = function (stateDecl) {
            stateDecl = StateObject.isStateClass(stateDecl) ? new stateDecl() : stateDecl;
            var state = inherit(inherit(stateDecl, StateObject.prototype));
            stateDecl.$$state = function () {
                return state;
            };
            state.self = stateDecl;
            state.__stateObjectCache = {
                nameGlob: Glob.fromString(state.name) // might return null
            };
            return state;
        };

        StateObject.prototype.is = function (ref) {
            return this === ref || this.self === ref || this.fqn() === ref;
        };

        StateObject.prototype.fqn = function () {
            if (!this.parent || !(this.parent instanceof this.constructor))
                return this.name;
            var name = this.parent.fqn();
            return name ? name + '.' + this.name : this.name;
        };

        StateObject.prototype.root = function () {
            return this.parent && this.parent.root() || this;
        };

        StateObject.prototype.parameters = function (opts) {
            opts = defaults(opts, {
                inherit: true,
                matchingKeys: null
            });
            var inherited = opts.inherit &&
							this.parent &&
							this.parent.parameters &&
							this.parent.parameters() || [];

            return inherited.concat(values(this.params))
                .filter(function (param) {
                    return !opts.matchingKeys || opts.matchingKeys.hasOwnProperty(param.id);
                });
        };

        StateObject.prototype.parameter = function (id, opts) {
            if (opts === void 0) {
                opts = {};
            }
            return (this.url && this.url.parameter(id, opts) ||
                find(values(this.params), propEq('id', id)) ||
                opts.inherit && this.parent && this.parent.parameter(id));
        };
        StateObject.prototype.toString = function () {
            return this.fqn();
        };
		StateObject.isStateClass = function (stateDecl) {
			return _.isFunction(stateDecl) && stateDecl.__uiRouterState === true;
		};
		StateObject.isState = function (obj) {
			return _.isObject(obj.__stateObjectCache);
		};
        return StateObject;
    }());

    isState = StateObject.isState;

    function isInjectable(val) {
        if (_.isArray(val) && val.length) {
            var head = val.slice(0, -1),
                tail = val.slice(-1);
            return !(head.filter(not(_.isString)).length || tail.filter(not(_.isFunction)).length);
        }
        return _.isFunction(val);
    }

    isPromise = and(_.isObject, pipe(prop('then'), _.isFunction));

    function identity(x) {
        return x;
    }

    function createProxyFunctions(source, target, bind, fnNames, latebind) {

        if (latebind === void 0) {
            latebind = false;
        }
        var bindFunction = function (fnName) {
            return source()[fnName].bind(bind());
        };
        var makeLateRebindFn = function (fnName) {
            return function lateRebindFunction() {
                target[fnName] = bindFunction(fnName);
                return target[fnName].apply(null, arguments);
            };
        };
        fnNames = fnNames || Object.keys(source());
        return fnNames.reduce(function (acc, name) {
            acc[name] = latebind ? makeLateRebindFn(name) : bindFunction(name);
            return acc;
        }, target);
    }

    function defaults(opts) {
        var defaultsList = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            defaultsList[_i - 1] = arguments[_i];
        }
        var _defaultsList = defaultsList.concat({}).reverse();
        var defaultVals = extend.apply(null, _defaultsList);

        return extend({}, defaultVals, _.pick(opts || {}, Object.keys(defaultVals)));
    }

    function ancestors(first, second) {
        var path = [];
        for (var n in first.path) {
            if (first.path[n] !== second.path[n])
                break;
            path.push(first.path[n]);
        }
        return path;
    }

    function filter(collection, callback) {
        var arr = _.isArray(collection),
            result = arr ? [] : {};
        var accept = arr ? function (x) {
            return result.push(x);
        } : function (x, key) {
				result[key] = x;
            return x;
        };
        forEach(collection, function (item, i) {
            if (callback(item, i))
                accept(item, i);
        });
        return result;
    }

    function find(collection, callback) {
        var result;
        forEach(collection, function (item, i) {
            if (result)
                return;
            if (callback(item, i))
                result = item;
        });
        return result;
    }

	function map(collection, callback, target) {
		target = target || (_.isArray(collection) ? [] : {});

		forEach(
			collection,
			function (item, i) {
				target[i] = callback(item, i);
				return target[i];
			}
		);

		return target;
	}

	mapObj = map;

    function arrayTuples() {
        var args = [],
			_i = 0,
			maxArrayLen,
			i = 0,
			result = [],
			_loop_1;

        for (_i = 0; _i < arguments.length; _i += 1) {
            args[_i] = arguments[_i];
        }

        if (args.length === 0) {
            return [];
        }

        maxArrayLen = args.reduce(
			function (min, arr) {
				return Math.min(arr.length, min);
			},
			9007199254740991
		);

		function default_result(j) { return args.map(function (array) { return array[j]; }); }

		_loop_1 = function (i) {
			// This is a hot function
			// Unroll when there are 1-4 arguments
			switch (args.length) {
				case 1:
					result.push([args[0][i]]);
					break;
				case 2:
					result.push([args[0][i], args[1][i]]);
					break;
				case 3:
					result.push([args[0][i], args[1][i], args[2][i]]);
					break;
				case 4:
					result.push([args[0][i], args[1][i], args[2][i], args[3][i]]);
					break;
				default:
					result.push(default_result(i));
					break;
			}
		};

		for (i = 0; i < maxArrayLen; i += 1) { _loop_1(i); }

		return result;
    }

    function applyPairs(memo, keyValTuple) {
        var key, value;
        if (_.isArray(keyValTuple))
            key = keyValTuple[0];
			value = keyValTuple[1];
        if (!_.isString(key))
            throw new Error('invalid parameters to applyPairs');
        memo[key] = value;
        return memo;
    }

    function tail(arr) {
		if (!arr) {
			msos_debug('ng.ui.router - tail -> no input.');
		}
        return arr && arr.length && arr[arr.length - 1] || undefined;
    }

    silenceUncaughtInPromise = function (promise) {
        return promise.catch(function () {
            return 0;
        }) && promise;
    };

    silentRejection = function (error) {
        return silenceUncaughtInPromise(services.$q.reject(services.$q.defer('ui_router_silentRejection_reject'), error));
    };

    Queue = (function () {

        function Queue(_items, _limit) {
            if (_items === void 0) {
                _items = [];
            }
            if (_limit === void 0) {
                _limit = null;
            }
            this._items = _items;
            this._limit = _limit;
			this._evictListeners = [];
			this.onEvict = pushTo(this._evictListeners);
        }

        Queue.prototype.enqueue = function (item) {
            var items = this._items;

            items.push(item);

            if (this._limit && items.length > this._limit) {
				this.evict();
            }

            return item;
        };
		Queue.prototype.evict = function () {
			var item = this._items.shift();

			this._evictListeners.forEach(
				function (fn) { return fn(item); }
			);

			return item;
		};
        Queue.prototype.dequeue = function () {
            if (this.size())
                return this._items.splice(0, 1)[0];
        };
        Queue.prototype.clear = function () {
            var current = this._items;
            this._items = [];
            return current;
        };
        Queue.prototype.size = function () {
            return this._items.length;
        };
        Queue.prototype.remove = function (item) {
            var idx = this._items.indexOf(item);
            return idx > -1 && this._items.splice(idx, 1)[0];
        };
        Queue.prototype.peekTail = function () {
            return this._items[this._items.length - 1];
        };
        Queue.prototype.peekHead = function () {
            if (this.size())
                return this._items[0];
        };
        return Queue;
    }());

    (function (RejectType) {
        RejectType[RejectType.SUPERSEDED = 2] = 'SUPERSEDED';
        RejectType[RejectType.ABORTED = 3] = 'ABORTED';
        RejectType[RejectType.INVALID = 4] = 'INVALID';
        RejectType[RejectType.IGNORED = 5] = 'IGNORED';
        RejectType[RejectType.ERROR = 6] = 'ERROR';
    })(exports.RejectType || (exports.RejectType = {}));

	Rejection = (function () {
		function Rejection(type, message, detail) {
			this.$id = id++;
			this.type = type;
			this.message = message;
			this.detail = detail;
		}
		Rejection.isRejectionPromise = function (obj) {
			return obj && (typeof obj.then === 'function') && is(Rejection)(obj._transitionRejection);
		};
		Rejection.superseded = function (detail, options) {
			var message = 'The transition has been superseded by a different transition';
			var rejection = new Rejection(exports.RejectType.SUPERSEDED, message, detail);
			if (options && options.redirected) {
				rejection.redirected = true;
			}
			return rejection;
		};
		Rejection.redirected = function (detail) {
			return Rejection.superseded(detail, { redirected: true });
		};
		Rejection.invalid = function (detail) {
			var message = 'This transition is invalid';
			return new Rejection(exports.RejectType.INVALID, message, detail);
		};
		Rejection.ignored = function (detail) {
			var message = 'The transition was ignored';
			return new Rejection(exports.RejectType.IGNORED, message, detail);
		};
		Rejection.aborted = function (detail) {
			var message = 'The transition has been aborted';
			return new Rejection(exports.RejectType.ABORTED, message, detail);
		};
		Rejection.errored = function (detail) {
			var message = 'The transition errored';
			return new Rejection(exports.RejectType.ERROR, message, detail);
		};
		Rejection.normalize = function (detail) {
			return is(Rejection)(detail) ? detail : Rejection.errored(detail);
		};
		Rejection.prototype.toString = function () {
			var detailString = function (d) {
				return d && d.toString !== Object.prototype.toString ? d.toString() : stringify(d);
			};
			var detail = detailString(this.detail);
			var _a = this, $id = _a.$id, type = _a.type, message = _a.message;
			return 'Transition Rejection($id: ' + $id + ' type: ' + type + ', message: ' + message + ', detail: ' + detail + ')';
		};
		Rejection.prototype.toPromise = function () {
			return extend(silentRejection(this), { _transitionRejection: this });
		};

		return Rejection;
	}());

	function uiViewString(uiview) {
		if (!uiview) {
			return 'ui-view (defunct)';
		}
		var state = uiview.creationContext ? uiview.creationContext.name || '(root)' : '(none)';
		return '[ui-view#' + uiview.id + ' ' + uiview.$type + ':' + uiview.fqn + ' (' + uiview.name + '@' + state + ')]';
	}

    viewConfigString = function (viewConfig) {
		var view = viewConfig.viewDecl,
			state = view.$context.name || '(root)';

		return '[View#' + viewConfig.$id + " from '" + state + "' state]: target ui-view: '" + view.$uiViewName + '@' + view.$uiViewContextAnchor + "'";
	};

    function normalizedCat(input) {
        return _.isNumber(input) ? exports.Category[input] : exports.Category[exports.Category[input]];
    }

    (function (Category) {
        Category[Category.RESOLVE = 0] = 'RESOLVE';
        Category[Category.TRANSITION = 1] = 'TRANSITION';
        Category[Category.HOOK = 2] = 'HOOK';
        Category[Category.UIVIEW = 3] = 'UIVIEW';
        Category[Category.VIEWCONFIG = 4] = 'VIEWCONFIG';
    })(exports.Category || (exports.Category = {}));

    _tid = parse('$id');
    _rid = parse('router.$id');

    transLbl = function (trans) {
        return 'Transition #' + _tid(trans) + '-' + _rid(trans);
    };

    Trace = (function () {

        function Trace() {
            this._enabled = {};
            this.approximateDigests = 0;
        }

        Trace.prototype._set = function (enabled, categories) {
            var _this = this;
            if (!categories.length) {
                categories = Object.keys(exports.Category)
                    .map(function (k) {
                        return parseInt(k, 10);
                    })
                    .filter(function (k) {
                        return !isNaN(k);
                    })
                    .map(function (key) {
                        return exports.Category[key];
                    });
            }
            categories.map(normalizedCat).forEach(function (category) {
				_this._enabled[category] = enabled;
                return enabled;
            });
        };

        Trace.prototype.enable = function () {
            var categories = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                categories[_i] = arguments[_i];
            }
            this._set(true, categories);
        };

        Trace.prototype.disable = function () {
            var categories = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                categories[_i] = arguments[_i];
            }
            this._set(false, categories);
        };

        Trace.prototype.enabled = function (category) {
            return !!this._enabled[normalizedCat(category)];
        };

        Trace.prototype.traceTransitionStart = function (trans) {
            if (!this.enabled(exports.Category.TRANSITION)) {
                return;
            }
			if (msos_verbose === 'router') {
				msos_trace(transLbl(trans) + ': Started  -> ' + stringify(trans));
			} else {
				msos_debug(transLbl(trans) + ': Started  -> ' + stringify(trans));
			}
        };

        Trace.prototype.traceTransitionIgnored = function (trans) {
            if (!this.enabled(exports.Category.TRANSITION))
                return;
			if (msos_verbose === 'router') {
				msos_trace(transLbl(trans) + ': Ignored  <> ' + stringify(trans));
			} else {
				msos_debug(transLbl(trans) + ': Ignored  <> ' + stringify(trans));
			}
        };

        Trace.prototype.traceHookInvocation = function (step, trans, options) {
            if (!this.enabled(exports.Category.HOOK))
                return;
            var event = parse('traceData.hookType')(options) || 'internal',
                context = parse('traceData.context.state.name')(options) || parse('traceData.context')(options) || 'unknown',
                name = functionToString(step.registeredHook.callback);

			if (msos_verbose === 'router') {
				msos_trace(transLbl(trans) + ':   Hook -> ' + event + ' context: ' + context + ', ' + maxLength(200, name));
			} else {
				msos_debug(transLbl(trans) + ':   Hook -> ' + event + ' context: ' + context + ', ' + maxLength(200, name));
			}
        };

        Trace.prototype.traceHookResult = function (hookResult, trans) {
            if (!this.enabled(exports.Category.HOOK))
                return;
			if (msos_verbose === 'router') {
				msos_trace(transLbl(trans) + ':   <- Hook returned: ' + maxLength(200, stringify(hookResult)));
			} else {
				msos_debug(transLbl(trans) + ':   <- Hook returned: ' + maxLength(200, stringify(hookResult)));
			}
        };

        Trace.prototype.traceResolvePath = function (path, when, trans) {
            if (!this.enabled(exports.Category.RESOLVE))
                return;
			if (msos_verbose === 'router') {
				msos_trace(transLbl(trans) + ':         Resolving ' + path + ' (' + when + ')');
			} else {
				msos_debug(transLbl(trans) + ':         Resolving ' + path + ' (' + when + ')');
			}
        };

        Trace.prototype.traceResolvableResolved = function (resolvable, trans) {
            if (!this.enabled(exports.Category.RESOLVE))
                return;
			if (msos_verbose === 'router') {
				msos_trace(transLbl(trans) + ':               <- Resolved  ' + resolvable + ' to: ' + maxLength(200, stringify(resolvable.data)));
			} else {
				msos_debug(transLbl(trans) + ':               <- Resolved  ' + resolvable + ' to: ' + maxLength(200, stringify(resolvable.data)));
			}
        };

        Trace.prototype.traceError = function (reason, trans) {
            if (!this.enabled(exports.Category.TRANSITION))
                return;
			if (msos_verbose === 'router') {
				msos_trace(transLbl(trans) + ': <- Rejected ' + stringify(trans) + ', reason: ' + reason);
			} else {
				msos_debug(transLbl(trans) + ': <- Rejected ' + stringify(trans) + ', reason: ' + reason);
			}
        };

        Trace.prototype.traceSuccess = function (finalState, trans) {
            if (!this.enabled(exports.Category.TRANSITION))
                return;
			if (msos_verbose === 'router') {
				msos_trace(transLbl(trans) + ': <- Success  ' + stringify(trans) + ', final state: ' + finalState.name);
			} else {
				msos_debug(transLbl(trans) + ': <- Success  ' + stringify(trans) + ', final state: ' + finalState.name);
			}
        };

        Trace.prototype.traceUIViewEvent = function (event, viewData, extra) {
            if (extra === void 0) {
                extra = '';
            }
            if (!this.enabled(exports.Category.UIVIEW))
                return;
			if (msos_verbose === 'router') {
				msos_trace('ui-view: ' + padString(30, event) + ' ' + uiViewString(viewData) + extra);
			} else {
				msos_debug('ui-view: ' + padString(30, event) + ' ' + uiViewString(viewData) + extra);
			}
        };

        Trace.prototype.traceUIViewConfigUpdated = function (viewData, context) {
            if (!this.enabled(exports.Category.UIVIEW))
                return;
            this.traceUIViewEvent('Updating', viewData, " with ViewConfig from context='" + context + "'");
        };

        Trace.prototype.traceUIViewFill = function (viewData, html) {
            if (!this.enabled(exports.Category.UIVIEW))
                return;
            this.traceUIViewEvent('Fill', viewData, ' with: ' + maxLength(200, html));
        };

		Trace.prototype.traceViewSync = function (pairs) {
			if (!this.enabled(exports.Category.VIEWCONFIG)) { return; }

			var uivheader = 'uiview component fqn',
				cfgheader = 'view config state (view name)',
				mapping = pairs.map(
					function (_a) {
						var uiView = _a.uiView,
							viewConfig = _a.viewConfig,
							uiv = uiView && uiView.fqn,
							cfg = viewConfig && viewConfig.viewDecl.$context.name + ": (" + viewConfig.viewDecl.$name + ")",
							_b = {};

						_b[uivheader] = uiv;
						_b[cfgheader] = cfg;

						return _b;
					}
				).sort(
					function (a, b) {
						return (a[uivheader] || '').localeCompare(b[uivheader] || '');
					}
				);

			msos.console.table(mapping);
		};

        Trace.prototype.traceViewServiceEvent = function (event, viewConfig) {
            if (!this.enabled(exports.Category.VIEWCONFIG)) {
                return;
            }
			if (msos_verbose) {
				msos_debug('VIEWCONFIG: ' + event + ' ' + viewConfigString(viewConfig));
			}
        };

        Trace.prototype.traceViewServiceUIViewEvent = function (event, viewData) {
            if (!this.enabled(exports.Category.VIEWCONFIG)) {
                return;
            }
			if (msos_verbose) {
				msos_debug('VIEWCONFIG: ' + event + ' ' + uiViewString(viewData));
			}
        };

        return Trace;
    }());

    trace = new Trace();

    (function (TransitionHookPhase) {
        TransitionHookPhase[TransitionHookPhase.CREATE = 0] = 'CREATE';
        TransitionHookPhase[TransitionHookPhase.BEFORE = 1] = 'BEFORE';
        TransitionHookPhase[TransitionHookPhase.RUN = 2] = 'RUN';
        TransitionHookPhase[TransitionHookPhase.SUCCESS = 3] = 'SUCCESS';
        TransitionHookPhase[TransitionHookPhase.ERROR = 4] = 'ERROR';
    })(exports.TransitionHookPhase || (exports.TransitionHookPhase = {}));

    (function (TransitionHookScope) {
        TransitionHookScope[TransitionHookScope.TRANSITION = 0] = 'TRANSITION';
        TransitionHookScope[TransitionHookScope.STATE = 1] = 'STATE';
    })(exports.TransitionHookScope || (exports.TransitionHookScope = {}));

    TargetState = (function () {

		function TargetState(_stateRegistry, _identifier, _params, _options) {
			this._stateRegistry = _stateRegistry;
			this._identifier = _identifier;
			this._identifier = _identifier;
			this._params = extend({}, _params || {});
			this._options = extend({}, _options || {});
			this._definition = _stateRegistry.matcher.find(_identifier, this._options.relative);
		}

        TargetState.prototype.name = function () {
            return this._definition && this._definition.name || this._identifier;
        };

        TargetState.prototype.identifier = function () {
            return this._identifier;
        };

        TargetState.prototype.params = function () {
            return this._params;
        };

        TargetState.prototype.$state = function () {
            return this._definition;
        };

        TargetState.prototype.state = function () {
            return this._definition && this._definition.self;
        };

        TargetState.prototype.options = function () {
            return this._options;
        };

        TargetState.prototype.exists = function () {
            return !!(this._definition && this._definition.self);
        };

        TargetState.prototype.valid = function () {
            return !this.error();
        };

        TargetState.prototype.error = function () {
            var base = this.options().relative;
            if (!this._definition && !!base) {
                var stateName = base.name ? base.name : base;
                return "Could not resolve '" + this.name() + "' from state '" + stateName + "'";
            }
            if (!this._definition)
                return "No such state '" + this.name() + "'";
            if (!this._definition.self)
                return "State '" + this.name() + "' has an invalid definition";
        };
        TargetState.prototype.toString = function () {
			return "'" + this.name() + "'" + stringify(this.params());
        };
		TargetState.prototype.withState = function (state) {
			return new TargetState(this._stateRegistry, state, this._params, this._options);
		};
		TargetState.prototype.withParams = function (params, replace) {
			if (replace === void 0) { replace = false; }
			var newParams = replace ? params : extend({}, this._params, params);
			return new TargetState(this._stateRegistry, this._identifier, newParams, this._options);
		};
		TargetState.prototype.withOptions = function (options, replace) {
			if (replace === void 0) { replace = false; }
			var newOpts = replace ? options : extend({}, this._options, options);
			return new TargetState(this._stateRegistry, this._identifier, this._params, newOpts);
		};
		TargetState.isDef = function (obj) {
			return obj && obj.state && (_.isString(obj.state) || _.isString(obj.state.name));
		};
        return TargetState;
    }());

	TransitionHook= (function () {
        function TransitionHook(transition, stateContext, registeredHook, options) {
            var _this = this;
            this.transition = transition;
            this.stateContext = stateContext;
            this.registeredHook = registeredHook;
            this.options = options;
            this.isSuperseded = function () {
                return _this.type.hookPhase === exports.TransitionHookPhase.RUN && !_this.options.transition.isActive();
            };
            this.options = defaults(options, defaultOptions);
            this.type = registeredHook.eventType;
        }
        TransitionHook.prototype.logError = function (err) {
            this.transition.router.stateService.defaultErrorHandler()(err);
        };
        TransitionHook.prototype.invokeHook = function () {
            var _this = this;
            var hook = this.registeredHook;
            if (hook._deregistered)
                return;
            var notCurrent = this.getNotCurrentRejection();
            if (notCurrent)
                return notCurrent;
            var options = this.options;
            trace.traceHookInvocation(this, this.transition, options);
            var invokeCallback = function () {
                return hook.callback.call(options.bind, _this.transition, _this.stateContext);
            };
            var normalizeErr = function (err) {
                return Rejection.normalize(err).toPromise();
            };
            var handleError = function (err) {
                return hook.eventType.getErrorHandler(_this)(err);
            };
            var handleResult = function (result) {
                return hook.eventType.getResultHandler(_this)(result);
            };
            try {
                var result = invokeCallback();
                if (!this.type.synchronous && isPromise(result)) {
                    return result.catch(normalizeErr)
                        .then(handleResult, handleError);
                } else {
                    return handleResult(result);
                }
            } catch (err) {
                // If callback throws (synchronously)
                return handleError(Rejection.normalize(err));
            } finally {
				if (hook.invokeLimit && ++hook.invokeCount >= hook.invokeLimit) {
					hook.deregister();
				}
			}
        };

        TransitionHook.prototype.handleHookResult = function (result) {
            var _this = this;
            var notCurrent = this.getNotCurrentRejection();
            if (notCurrent)
                return notCurrent;
            // Hook returned a promise
            if (isPromise(result)) {
                // Wait for the promise, then reprocess with the resulting value
                return result.then(function (val) {
                    return _this.handleHookResult(val);
                });
            }
            trace.traceHookResult(result, this.transition, this.options);
            // Hook returned false
            if (result === false) {
                // Abort this Transition
                return Rejection.aborted('Hook aborted transition').toPromise();
            }
            var isTargetState = is(TargetState);
            // hook returned a TargetState
            if (isTargetState(result)) {
                // Halt the current Transition and redirect (a new Transition) to the TargetState.
                return Rejection.redirected(result).toPromise();
            }
        };

        TransitionHook.prototype.getNotCurrentRejection = function () {
            var router = this.transition.router;
            // The router is stopped
            if (router._disposed) {
                return Rejection.aborted('UIRouter instance #' + router.$id + ' has been stopped (disposed)').toPromise();
            }
            if (this.transition._aborted) {
                return Rejection.aborted().toPromise();
            }
            // This transition is no longer current.
            // Another transition started while this hook was still running.
            if (this.isSuperseded()) {
                // Abort this transition
                return Rejection.superseded(this.options.current()).toPromise();
            }
        };
        TransitionHook.prototype.toString = function () {
            var _a = this,
                options = _a.options,
                registeredHook = _a.registeredHook;
            var event = parse('traceData.hookType')(options) || 'internal',
                context = parse('traceData.context.state.name')(options) || parse('traceData.context')(options) || 'unknown',
                name = fnToString(registeredHook.callback);
            return event + ' context: ' + context + ', ' + maxLength(200, name);
        };

        TransitionHook.chain = function (hooks, waitFor) {
            // Chain the next hook off the previous
            var createHookChainR = function (prev, nextHook) {
                return prev.then(function () {
                    return nextHook.invokeHook();
                });
            };
            return hooks.reduce(createHookChainR, waitFor || services.$q.when(services.$q.defer('ui_router_transitionhook_when')));
        };

        TransitionHook.invokeHooks = function (hooks, doneCallback) {
            for (var idx = 0; idx < hooks.length; idx++) {
                var hookResult = hooks[idx].invokeHook();
                if (isPromise(hookResult)) {
                    var remainingHooks = hooks.slice(idx + 1);
                    return TransitionHook.chain(remainingHooks, hookResult)
                        .then(doneCallback);
                }
            }
            return doneCallback();
        };

        TransitionHook.runAllHooks = function (hooks) {
            hooks.forEach(function (hook) {
                return hook.invokeHook();
            });
        };

		TransitionHook.HANDLE_RESULT = function (hook) {
			return function (result) {
				return hook.handleHookResult(result);
			};
		};

		TransitionHook.LOG_REJECTED_RESULT = function (hook) {
			return function (result) {
				if (isPromise(result)) {
					result.catch(
						function (err) {
							return hook.logError(Rejection.normalize(err));
						}
					);
				}
	
				return undefined;
			};
		};

		TransitionHook.LOG_ERROR = function (hook) {
			return function (error) {
				return hook.logError(error);
			};
		};
		TransitionHook.REJECT_ERROR = function () {
			return function (error) {
				return silentRejection(error);
			};
		};
		TransitionHook.THROW_ERROR = function () {
			return function (error) {
				throw error;
			};
		};

        return TransitionHook;
    }());

    function matchState(state, criterion) {
        var toMatch = _.isString(criterion) ? [criterion] : criterion;

        function matchGlobs(_state) {
            var globStrings = toMatch;
            for (var i = 0; i < globStrings.length; i++) {
                var glob = new Glob(globStrings[i]);
                if ((glob && glob.matches(_state.name)) || (!glob && globStrings[i] === _state.name)) {
                    return true;
                }
            }
            return false;
        }
        var matchFn = (_.isFunction(toMatch) ? toMatch : matchGlobs);
        return !!matchFn(state);
    }

    RegisteredHook = (function () {
		function RegisteredHook(tranSvc, eventType, callback, matchCriteria, removeHookFromRegistry, options) {
			if (options === void 0) { options = {}; }

			this.tranSvc = tranSvc;
			this.eventType = eventType;
			this.callback = callback;
			this.matchCriteria = matchCriteria;
			this.removeHookFromRegistry = removeHookFromRegistry;
			this.invokeCount = 0;
			this._deregistered = false;
			this.priority = options.priority || 0;
			this.bind = options.bind || null;
			this.invokeLimit = options.invokeLimit;
		}

        RegisteredHook.prototype._matchingNodes = function (nodes, criterion) {
            if (criterion === true)
                return nodes;
            var matching = nodes.filter(function (node) {
                return matchState(node.state, criterion);
            });
            return matching.length ? matching : null;
        };

        RegisteredHook.prototype._getDefaultMatchCriteria = function () {
			return mapObj(
					this.tranSvc._pluginapi._getPathTypes(),
					function () { return true; }
				);
        };

        RegisteredHook.prototype._getMatchingNodes = function (treeChanges) {
            var _this = this;
            var criteria = extend(this._getDefaultMatchCriteria(), this.matchCriteria);
            var paths = values(this.tranSvc._pluginapi._getPathTypes());
            return paths.reduce(function (mn, pathtype) {
                // STATE scope criteria matches against every node in the path.
                // TRANSITION scope criteria matches against only the last node in the path
                var isStateHook = pathtype.scope === exports.TransitionHookScope.STATE;
                var path = treeChanges[pathtype.name] || [];
                var nodes = isStateHook ? path : [tail(path)];
                mn[pathtype.name] = _this._matchingNodes(nodes, criteria[pathtype.name]);
                return mn;
            }, {});
        };

        RegisteredHook.prototype.matches = function (treeChanges) {
            var matches = this._getMatchingNodes(treeChanges);
            // Check if all the criteria matched the TreeChanges object
            var allMatched = values(matches).every(identity);
            return allMatched ? matches : null;
        };
		RegisteredHook.prototype.deregister = function () {
			this.removeHookFromRegistry(this);
			this._deregistered = true;
		};
        return RegisteredHook;
    }());

    function makeEvent(registry, transitionService, eventType) {
        // Create the object which holds the registered transition hooks.
        var _registeredHooks = registry._registeredHooks = (registry._registeredHooks || {});
        var hooks = _registeredHooks[eventType.name] = [];
		var removeHookFn = removeFrom(hooks);
        // Create hook registration function on the IHookRegistry for the event
        registry[eventType.name] = hookRegistrationFn;

        function hookRegistrationFn(matchObject, callback, options) {
            if (options === void 0) {
                options = {};
            }
			var registeredHook = new RegisteredHook(transitionService, eventType, callback, matchObject, removeHookFn, options);
            hooks.push(registeredHook);
            return registeredHook.deregister.bind(registeredHook);
        }
        return hookRegistrationFn;
    }

    HookBuilder = (function () {
        function HookBuilder(transition) {
            this.transition = transition;
        }
        HookBuilder.prototype.buildHooksForPhase = function (phase) {
            var _this = this;
            var $transitions = this.transition.router.transitionService;
            return $transitions._pluginapi._getEvents(phase)
                .map(function (type) {
                    return _this.buildHooks(type);
                })
                .reduce(unnestR, [])
                .filter(identity);
        };

        HookBuilder.prototype.buildHooks = function (hookType) {
            var transition = this.transition;
            var treeChanges = transition.treeChanges();
            // Find all the matching registered hooks for a given hook type
            var matchingHooks = this.getMatchingHooks(hookType, treeChanges);
            if (!matchingHooks)
                return [];
            var baseHookOptions = {
                transition: transition,
                current: transition.options().current
            };
            var makeTransitionHooks = function (hook) {
                // Fetch the Nodes that caused this hook to match.
                var matches = hook.matches(treeChanges);
                // Select the PathNode[] that will be used as TransitionHook context objects
                var matchingNodes = matches[hookType.criteriaMatchPath.name];
                // Return an array of HookTuples
                return matchingNodes.map(function (node) {
                    var _options = extend({
                        bind: hook.bind,
                        traceData: {
                            hookType: hookType.name,
                            context: node
                        }
                    }, baseHookOptions);
                    var state = hookType.criteriaMatchPath.scope === exports.TransitionHookScope.STATE ? node.state.self : null;
                    var transitionHook = new TransitionHook(transition, state, hook, _options);
                    return {
                        hook: hook,
                        node: node,
                        transitionHook: transitionHook
                    };
                });
            };
            return matchingHooks.map(makeTransitionHooks)
                .reduce(unnestR, [])
                .sort(tupleSort(hookType.reverseSort))
                .map(function (tuple) {
                    return tuple.transitionHook;
                });
        };

        HookBuilder.prototype.getMatchingHooks = function (hookType, treeChanges) {
            var isCreate = hookType.hookPhase === exports.TransitionHookPhase.CREATE;
            // Instance and Global hook registries
            var $transitions = this.transition.router.transitionService;
            var registries = isCreate ? [$transitions] : [this.transition, $transitions];
            return registries.map(function (reg) {
                    return reg.getHooks(hookType.name);
                }) // Get named hooks from registries
                .filter(assertPredicate(_.isArray, 'broken event named: ' + hookType.name)) // Sanity check
                .reduce(unnestR, []) // Un-nest RegisteredHook[][] to RegisteredHook[] array
                .filter(function (hook) {
                    return hook.matches(treeChanges);
                }); // Only those satisfying matchCriteria
        };
        return HookBuilder;
    }());

    function tupleSort(reverseDepthSort) {
        if (reverseDepthSort === void 0) {
            reverseDepthSort = false;
        }
        return function nodeDepthThenPriority(l, r) {
            var factor = reverseDepthSort ? -1 : 1;
            var depthDelta = (l.node.state.path.length - r.node.state.path.length) * factor;
            return depthDelta !== 0 ? depthDelta : r.hook.priority - l.hook.priority;
        };
    }

    ParamType = (function () {

        function ParamType(def) {

            this.pattern = /.*/;
            this.inherit = true;

            extend(this, def);
        }

        ParamType.prototype.is = function () {
            return true;
        };

        ParamType.prototype.encode = function () {
            return val;
        };

        ParamType.prototype.decode = function () {
            return val;
        };

        ParamType.prototype.equals = function (a, b) {
            return a == b;
        };
        ParamType.prototype.$subPattern = function () {
            var sub = this.pattern.toString();
            return sub.substr(1, sub.length - 2);
        };
        ParamType.prototype.toString = function () {
            return '{ParamType:' + this.name + '}';
        };

        ParamType.prototype.$normalize = function (val) {
            return this.is(val) ? val : this.decode(val);
        };

        ParamType.prototype.$asArray = function (mode, isSearch) {
            if (!mode)
                return this;
            if (mode === 'auto' && !isSearch)
                throw new Error("'auto' array mode is for query parameters only");
            return new ArrayType(this, mode);
        };
        return ParamType;
    }());

    function ArrayType(type, mode) {
        var _this = this;
        // Wrap non-array value as array
        function arrayWrap(val) {
            return _.isArray(val) ? val : (isDefined(val) ? [val] : []);
        }
        // Unwrap array value for "auto" mode. Return undefined for empty array.
        function arrayUnwrap(val) {
            switch (val.length) {
                case 0:
                    return undefined;
                case 1:
                    return mode === 'auto' ? val[0] : val;
                default:
                    return val;
            }
        }
        // Wraps type (.is/.encode/.decode) functions to operate on each value of an array
        function arrayHandler(callback, allTruthyMode) {
            return function handleArray(val) {
                if (_.isArray(val) && val.length === 0)
                    return val;
                var arr = arrayWrap(val);
                var result = map(arr, callback);
                return (allTruthyMode === true) ? filter(result, function (x) {
                    return !x;
                }).length === 0 : arrayUnwrap(result);
            };
        }
        // Wraps type (.equals) functions to operate on each value of an array
        function arrayEqualsHandler(callback) {
            return function handleArray(val1, val2) {
                var left = arrayWrap(val1),
                    right = arrayWrap(val2);
                if (left.length !== right.length)
                    return false;
                for (var i = 0; i < left.length; i++) {
                    if (!callback(left[i], right[i]))
                        return false;
                }
                return true;
            };
        }
        ['encode', 'decode', 'equals', '$normalize'].forEach(function (name) {
            var paramTypeFn = type[name].bind(type);
            var wrapperFn = name === 'equals' ? arrayEqualsHandler : arrayHandler;
            _this[name] = wrapperFn(paramTypeFn);
        });
        extend(this, {
            dynamic: type.dynamic,
            name: type.name,
            pattern: type.pattern,
            inherit: type.inherit,
            is: arrayHandler(type.is.bind(type), true),
            $arrayMode: mode
        });
    }

    hasOwn = Object.prototype.hasOwnProperty;

    isShorthand = function (cfg) {
        return ['value', 'type', 'squash', 'array', 'dynamic'].filter(hasOwn.bind(cfg || {})).length === 0;
    };

    (function (DefType) {
        DefType[DefType.PATH = 0] = 'PATH';
        DefType[DefType.SEARCH = 1] = 'SEARCH';
        DefType[DefType.CONFIG = 2] = 'CONFIG';
    })(exports.DefType || (exports.DefType = {}));

    function unwrapShorthand(cfg) {
        cfg = isShorthand(cfg) && {
            value: cfg
        } || cfg;
        getStaticDefaultValue.__cacheable = true;

        function getStaticDefaultValue() {
            return cfg.value;
        }
        return extend(cfg, {
            $$fn: isInjectable(cfg.value) ? cfg.value : getStaticDefaultValue,
        });
    }
    /** @hidden */
    function getType(cfg, urlType, location, id, paramTypes) {
        if (cfg.type && urlType && urlType.name !== 'string')
            throw new Error("Param '" + id + "' has two type configurations.");
        if (cfg.type && urlType && urlType.name === 'string' && paramTypes.type(cfg.type))
            return paramTypes.type(cfg.type);
        if (urlType)
            return urlType;
        if (!cfg.type) {
            var type = location === exports.DefType.CONFIG ? 'any' :
                location === exports.DefType.PATH ? 'path' :
                location === exports.DefType.SEARCH ? 'query' : 'string';
            return paramTypes.type(type);
        }
        return cfg.type instanceof ParamType ? cfg.type : paramTypes.type(cfg.type);
    }

    function getSquashPolicy(config, isOptional, defaultPolicy) {
        var squash = config.squash;
        if (!isOptional || squash === false)
            return false;
        if (!isDefined(squash) || squash === null || squash === undefined)
            return defaultPolicy;
        if (squash === true || _.isString(squash))
            return squash;
        throw new Error("Invalid squash policy: '" + squash + "'. Valid policies: false, true, or arbitrary string");
    }
    /** @internalapi */
    function getReplace(config, arrayMode, isOptional, squash) {
        var replace,
			configuredKeys,
			defaultPolicy = [
				{
					from: '',
					to: (isOptional || arrayMode ? undefined : '')
				},
				{
					from: null,
					to: (isOptional || arrayMode ? undefined : '')
				},
			];

        replace = _.isArray(config.replace) ? config.replace : [];

        if (_.isString(squash)) {
            replace.push({
                from: squash,
                to: undefined
            });
		}

        configuredKeys = map(replace, prop('from'));

        return filter(
			defaultPolicy,
			function (item) {
				return configuredKeys.indexOf(item.from) === -1;
			}
		).concat(replace);
	}
    /** @internalapi */
    Param = (function () {
        function Param(id, type, config, location, urlMatcherFactory) {
            config = unwrapShorthand(config);
            type = getType(config, type, location, id, urlMatcherFactory.paramTypes);
            var arrayMode = getArrayMode();
            type = arrayMode ? type.$asArray(arrayMode, location === exports.DefType.SEARCH) : type;
            var isOptional = config.value !== undefined || location === exports.DefType.SEARCH;
            var dynamic = isDefined(config.dynamic) ? !!config.dynamic : !!type.dynamic;
            var raw = isDefined(config.raw) ? !!config.raw : !!type.raw;
            var squash = getSquashPolicy(config, isOptional, urlMatcherFactory.defaultSquashPolicy());
            var replace = getReplace(config, arrayMode, isOptional, squash);
            var inherit$$1 = isDefined(config.inherit) ? !!config.inherit : !!type.inherit;
            // array config: param name (param[]) overrides default settings.  explicit config overrides param name.
            function getArrayMode() {
                var arrayDefaults = {
                    array: (location === exports.DefType.SEARCH ? 'auto' : false)
                };
                var arrayParamNomenclature = id.match(/\[\]$/) ? {
                    array: true
                } : {};
                return extend(arrayDefaults, arrayParamNomenclature, config).array;
            }
            extend(this, {
                id: id,
                type: type,
                location: location,
                isOptional: isOptional,
                dynamic: dynamic,
                raw: raw,
                squash: squash,
                replace: replace,
                inherit: inherit$$1,
                array: arrayMode,
                config: config
            });
        }

		Param.values = function (params, values$$1) {

			if (values$$1 === void 0) { values$$1 = {}; }

			var paramValues = {},
				_i = 0,
				params_1 = params,
				param;

			for (_i = 0; _i < params_1.length; _i += 1) {
				param = params_1[_i];
				paramValues[param.id] = param.value(values$$1[param.id]);
			}

			return paramValues;
		};

		Param.changed = function (params, values1, values2) {
			if (values1 === void 0) { values1 = {}; }
			if (values2 === void 0) { values2 = {}; }
			return params.filter(
				function (param) {
					return !param.type.equals(values1[param.id], values2[param.id]);
				}
			);
		};
		Param.equals = function (params, values1, values2) {
			if (values1 === void 0) { values1 = {}; }
			if (values2 === void 0) { values2 = {}; }
			return Param.changed(params, values1, values2).length === 0;
		};
		Param.validates = function (params, values$$1) {
			if (values$$1 === void 0) { values$$1 = {}; }
			return params.map(
				function (param) {
					return param.validates(values$$1[param.id]);
				}
			).reduce(allTrueR, true);
		};
        Param.prototype.isDefaultValue = function (value) {
            return this.isOptional && this.type.equals(this.value(), value);
        };

        Param.prototype.value = function (value) {
            var _this = this;
            /**
             * [Internal] Get the default value of a parameter, which may be an injectable function.
             */
            var getDefaultValue = function () {
                if (_this._defaultValueCache)
                    return _this._defaultValueCache.defaultValue;
                if (!services.$injector)
                    throw new Error('Injectable functions cannot be called at configuration time');
                var defaultValue = services.$injector.invoke(_this.config.$$fn);
                if (defaultValue !== null && defaultValue !== undefined && !_this.type.is(defaultValue))
                    throw new Error("Default value (" + defaultValue + ") for parameter '" + _this.id + "' is not an instance of ParamType (" + _this.type.name + ")");
                if (_this.config.$$fn.__cacheable) {
                    _this._defaultValueCache = {
                        defaultValue: defaultValue
                    };
                }
                return defaultValue;
            };
            var replaceSpecialValues = function (val) {
                for (var _i = 0, _a = _this.replace; _i < _a.length; _i++) {
                    var tuple = _a[_i];
                    if (tuple.from === val)
                        return tuple.to;
                }
                return val;
            };
            value = replaceSpecialValues(value);
            return _.isUndefined(value) ? getDefaultValue() : this.type.$normalize(value);
        };
        Param.prototype.isSearch = function () {
            return this.location === exports.DefType.SEARCH;
        };
        Param.prototype.validates = function (value) {
            // There was no parameter value, but the param is optional
            if ((_.isUndefined(value) || value === null) && this.isOptional)
                return true;
            // The value was not of the correct ParamType, and could not be decoded to the correct ParamType
            var normalized = this.type.$normalize(value);
            if (!this.type.is(normalized))
                return false;
            // The value was of the correct type, but when encoded, did not match the ParamType's regexp
            var encoded = this.type.encode(normalized);
            return !(_.isString(encoded) && !this.type.pattern.exec(encoded));
        };
        Param.prototype.toString = function () {
            return '{Param:' + this.id + ' ' + this.type + " squash: '" + this.squash + "' optional: " + this.isOptional + '}';
        };

        return Param;
    }());

    PathNode = (function () {
        function PathNode(stateOrNode) {
            if (stateOrNode instanceof PathNode) {
                var node = stateOrNode;
                this.state = node.state;
                this.paramSchema = node.paramSchema.slice();
                this.paramValues = extend({}, node.paramValues);
                this.resolvables = node.resolvables.slice();
                this.views = node.views && node.views.slice();
            } else {
                var state = stateOrNode;
                this.state = state;
                this.paramSchema = state.parameters({
                    inherit: false
                });
                this.paramValues = {};
                this.resolvables = state.resolvables.map(function (res) {
                    return res.clone();
                });
            }
        }
        /** Sets [[paramValues]] for the node, from the values of an object hash */
        PathNode.prototype.applyRawParams = function (params) {
            var getParamVal = function (paramDef) {
                return [paramDef.id, paramDef.value(params[paramDef.id])];
            };
            this.paramValues = this.paramSchema.reduce(function (memo, pDef) {
                return applyPairs(memo, getParamVal(pDef));
            }, {});
            return this;
        };
        /** Gets a specific [[Param]] metadata that belongs to the node */
        PathNode.prototype.parameter = function (name) {
            return find(this.paramSchema, propEq('id', name));
        };

        PathNode.prototype.equals = function (node, paramsFn) {
            var diff = this.diff(node, paramsFn);
            return diff && diff.length === 0;
        };

        PathNode.prototype.diff = function (node, paramsFn) {
            if (this.state !== node.state)
                return false;
            var params = paramsFn ? paramsFn(this) : this.paramSchema;
            return Param.changed(params, this.paramValues, node.paramValues);
        };
		PathNode.prototype.clone = function () {
			return new PathNode(this);
		};
		PathNode.clone = function (node) { return node.clone(); };
        return PathNode;
    }());

    PathUtils = (function () {
        function PathUtils() {}
        /** Given a PathNode[], create an TargetState */
		PathUtils.makeTargetState = function (registry, path) {
			var state = tail(path).state;
			return new TargetState(registry, state, path.map(prop('paramValues')).reduce(mergeR, {}), {});
		};
        PathUtils.buildPath = function (targetState) {
            var toParams = targetState.params();
            return targetState.$state().path.map(function (state) {
                return new PathNode(state).applyRawParams(toParams);
            });
        };
        /** Given a fromPath: PathNode[] and a TargetState, builds a toPath: PathNode[] */
        PathUtils.buildToPath = function (fromPath, targetState) {
            var toPath = PathUtils.buildPath(targetState);
            if (targetState.options().inherit) {
                return PathUtils.inheritParams(fromPath, toPath, Object.keys(targetState.params()));
            }
            return toPath;
        };

        PathUtils.applyViewConfigs = function ($view, path, states) {
            // Only apply the viewConfigs to the nodes for the given states
            path.filter(function (node) {
                return inArray(states, node.state);
            }).forEach(function (node) {
                var viewDecls = values(node.state.views || {});
                var subPath = PathUtils.subPath(path, function (n) {
                    return n === node;
                });
                var viewConfigs = viewDecls.map(function (view) {
                    return $view.createViewConfig(subPath, view);
                });
                node.views = viewConfigs.reduce(unnestR, []);
            });
        };

        PathUtils.inheritParams = function (fromPath, toPath, toKeys) {
            if (toKeys === void 0) {
                toKeys = [];
            }

            function nodeParamVals(path, state) {
                var node = find(path, propEq('state', state));
                return extend({}, node && node.paramValues);
            }
            var noInherit = fromPath.map(function (node) {
                    return node.paramSchema;
                })
                .reduce(unnestR, [])
                .filter(function (param) {
                    return !param.inherit;
                })
                .map(prop('id'));

            function makeInheritedParamsNode(toNode) {
                // All param values for the node (may include default key/vals, when key was not found in toParams)
                var toParamVals = extend({}, toNode && toNode.paramValues);
                // limited to only those keys found in toParams
                var incomingParamVals = _.pick(toParamVals, toKeys);
                toParamVals = _.omit(toParamVals, toKeys);
                var fromParamVals = _.omit(nodeParamVals(fromPath, toNode.state) || {}, noInherit);
                // extend toParamVals with any fromParamVals, then override any of those those with incomingParamVals
                var ownParamVals = extend(toParamVals, fromParamVals, incomingParamVals);
                return new PathNode(toNode.state).applyRawParams(ownParamVals);
            }
            // The param keys specified by the incoming toParams
            return toPath.map(makeInheritedParamsNode);
        };
        /**
         * Computes the tree changes (entering, exiting) between a fromPath and toPath.
         */
        PathUtils.treeChanges = function (fromPath, toPath, reloadState) {
            var keep = 0,
                max = Math.min(fromPath.length, toPath.length),
				nodesMatch = function (node1, node2) {
					return node1.equals(node2, PathUtils.nonDynamicParams);
				},
				from,
				retained,
				exiting,
				retainedWithToParams,
				entering,
				to;

            while (keep < max && fromPath[keep].state !== reloadState && nodesMatch(fromPath[keep], toPath[keep])) {
                keep++;
            }

			function applyToParams(retainedNode, idx) {
				var cloned = retainedNode.clone();

				cloned.paramValues = toPath[idx].paramValues;
				return cloned;
			}

            from = fromPath;
            retained = from.slice(0, keep);
            exiting = from.slice(keep);
			retainedWithToParams = retained.map(applyToParams);
			entering = toPath.slice(keep);
			to = (retainedWithToParams).concat(entering);

			return {
				from: from,
				to: to,
				retained: retained,
				retainedWithToParams: retainedWithToParams,
				exiting: exiting,
				entering: entering
			};
        };
 
        PathUtils.matching = function (pathA, pathB, paramsFn) {
            var done = false;
            var tuples = arrayTuples(pathA, pathB);
            return tuples.reduce(function (matching, _a) {
                var nodeA = _a[0],
                    nodeB = _a[1];
                done = done || !nodeA.equals(nodeB, paramsFn);
                return done ? matching : matching.concat(nodeA);
            }, []);
        };

        PathUtils.equals = function (pathA, pathB, paramsFn) {
            return pathA.length === pathB.length &&
                PathUtils.matching(pathA, pathB, paramsFn).length === pathA.length;
        };

        PathUtils.subPath = function (path, predicate) {
            var node = find(path, predicate);
            var elementIdx = path.indexOf(node);
            return elementIdx === -1 ? undefined : path.slice(0, elementIdx + 1);
        };
		PathUtils.nonDynamicParams = function (node) {
			return node.state.parameters({
					inherit: false
				})
				.filter(function (param) {
					return !param.dynamic;
				});
		};
		PathUtils.paramValues = function (path) {
			return path.reduce(function (acc, node) {
				return extend(acc, node.paramValues);
			}, {});
		};
        return PathUtils;
    }());

    defaultResolvePolicy = {
        when: 'LAZY',
        async: 'WAIT'
    };

    Resolvable = (function () {

        function Resolvable(arg1, resolveFn, deps, policy, data) {
			var literal;

            this.resolved = false;
            this.promise = undefined;

            if (arg1 instanceof Resolvable) {
                extend(this, arg1);
            } else if (_.isFunction(resolveFn)) {
                if (isNullOrUndefined(arg1))
                    throw new Error('new Resolvable(): token argument is required');

                if (!_.isFunction(resolveFn))
                    throw new Error('new Resolvable(): resolveFn argument must be a function');

                this.token = arg1;
                this.policy = policy;
                this.resolveFn = resolveFn;
                this.deps = deps || [];
                this.data = data;
                this.resolved = data !== undefined;
                this.promise = this.resolved ? services.$q.when(services.$q.defer('ui_router_resolvable_when'), this.data) : undefined;

            } else if (_.isObject(arg1) && arg1.token && (arg1.hasOwnProperty('resolveFn') || arg1.hasOwnProperty('data'))) {
                literal = arg1;

                return new Resolvable(literal.token, literal.resolveFn, literal.deps, literal.policy, literal.data);
            }
        }

        Resolvable.prototype.getPolicy = function (state) {
            var thisPolicy = this.policy || {};
            var statePolicy = state && state.resolvePolicy || {};
            return {
                when: thisPolicy.when || statePolicy.when || defaultResolvePolicy.when,
                async: thisPolicy.async || statePolicy.async || defaultResolvePolicy.async,
            };
        };

        Resolvable.prototype.resolve = function (resolveContext, trans) {
            var _this = this;
            var $q = services.$q;
            // Gets all dependencies from ResolveContext and wait for them to be resolved
            var getResolvableDependencies = function () {
                return $q.all(
                    $q.defer('ui_router_resolvable_all'),
                    resolveContext.getDependencies(_this).map(
                        function (resolvable) {
                            return resolvable.get(resolveContext, trans);
                        }
                    )
                );
            };
            // Invokes the resolve function passing the resolved dependencies as arguments
            var invokeResolveFn = function (resolvedDeps) {
                return _this.resolveFn.apply(null, resolvedDeps);
            };

            var waitForRx = function (observable$) {
                var cached = observable$.cache(1);
                return cached.take(1).toPromise().then(function () {
                    return cached;
                });
            };
            // If the resolve policy is RXWAIT, wait for the observable to emit something. otherwise pass through.
            var node = resolveContext.findNode(this);
            var state = node && node.state;
            var maybeWaitForRx = this.getPolicy(state).async === 'RXWAIT' ? waitForRx : identity;
            // After the final value has been resolved, update the state of the Resolvable
            var applyResolvedValue = function (resolvedValue) {
                _this.data = resolvedValue;
				_this.resolved = true;
				_this.resolveFn = null;
                trace.traceResolvableResolved(_this, trans);
                return _this.data;
            };
            // Sets the promise property first, then getsResolvableDependencies in the context of the promise chain. Always waits one tick.
            this.promise = $q.when($q.defer('ui_router_resolvable_when'))
                .then(getResolvableDependencies)
                .then(invokeResolveFn)
                .then(maybeWaitForRx)
                .then(applyResolvedValue);

            return this.promise;
        };

        Resolvable.prototype.get = function (resolveContext, trans) {
            return this.promise || this.resolve(resolveContext, trans);
        };
        Resolvable.prototype.toString = function () {
            return 'Resolvable(token: ' + stringify(this.token) + ', requires: [' + this.deps.map(stringify) + '])';
        };
        Resolvable.prototype.clone = function () {
            return new Resolvable(this);
        };
		Resolvable.fromData = function (token, data) {
			return new Resolvable(token, function () { return data; }, null, null, data);
		};
        return Resolvable;
    }());

    Resolvable.fromData = function (token, data) {
        return new Resolvable(token, function () {
            return data;
        }, null, null, data);
    };

    resolvePolicies = {
        when: {
            LAZY: 'LAZY',
            EAGER: 'EAGER'
        },
        async: {
            WAIT: 'WAIT',
            NOWAIT: 'NOWAIT',
            RXWAIT: 'RXWAIT'
        }
    };

	whens = resolvePolicies.when;
	ALL_WHENS = [whens.EAGER, whens.LAZY];
	EAGER_WHENS = [whens.EAGER];
	NATIVE_INJECTOR_TOKEN = 'Native Injector';

    ResolveContext = (function () {
        function ResolveContext(_path) {
            this._path = _path;
        }
        /** Gets all the tokens found in the resolve context, de-duplicated */
        ResolveContext.prototype.getTokens = function () {
            return this._path.reduce(function (acc, node) {
                return acc.concat(node.resolvables.map(function (r) {
                    return r.token;
                }));
            }, []).reduce(uniqR, []);
        };

        ResolveContext.prototype.getResolvable = function (token) {
            var matching = this._path.map(function (node) {
                    return node.resolvables;
                })
                .reduce(unnestR, [])
                .filter(function (r) {
                    return r.token === token;
                });
            return tail(matching);
        };
        /** Returns the [[ResolvePolicy]] for the given [[Resolvable]] */
        ResolveContext.prototype.getPolicy = function (resolvable) {
            var node = this.findNode(resolvable);
            return resolvable.getPolicy(node.state);
        };

        ResolveContext.prototype.subContext = function (state) {
            return new ResolveContext(PathUtils.subPath(this._path, function (node) {
                return node.state === state;
            }));
        };

        ResolveContext.prototype.addResolvables = function (newResolvables, state) {
            var node = find(this._path, propEq('state', state));
            var keys = newResolvables.map(function (r) {
                return r.token;
            });
            node.resolvables = node.resolvables.filter(function (r) {
                return keys.indexOf(r.token) === -1;
            }).concat(newResolvables);
        };

        ResolveContext.prototype.resolvePath = function (when, trans) {
            var _this = this;
            if (when === void 0) {
                when = 'LAZY';
            }
            // This option determines which 'when' policy Resolvables we are about to fetch.
            var whenOption = inArray(ALL_WHENS, when) ? when : 'LAZY';
            // If the caller specified EAGER, only the EAGER Resolvables are fetched.
            // if the caller specified LAZY, both EAGER and LAZY Resolvables are fetched.`
            var matchedWhens = whenOption === resolvePolicies.when.EAGER ? EAGER_WHENS : ALL_WHENS;
            // get the subpath to the state argument, if provided
            trace.traceResolvePath(this._path, when, trans);
            var matchesPolicy = function (acceptedVals, whenOrAsync) {
                return function (resolvable) {
                    return inArray(acceptedVals, _this.getPolicy(resolvable)[whenOrAsync]);
                };
            };
            // Trigger all the (matching) Resolvables in the path
            // Reduce all the "WAIT" Resolvables into an array
            var promises = this._path.reduce(function (acc, node) {
                var nodeResolvables = node.resolvables.filter(matchesPolicy(matchedWhens, 'when'));
                var nowait = nodeResolvables.filter(matchesPolicy(['NOWAIT'], 'async'));
                var wait = nodeResolvables.filter(not(matchesPolicy(['NOWAIT'], 'async')));
                // For the matching Resolvables, start their async fetch process.
                var subContext = _this.subContext(node.state);
                var getResult = function (r) {
                    return r.get(subContext, trans)
                        .then(function (value) {
                            return ({
                                token: r.token,
                                value: value
                            });
                        });
                };
                nowait.forEach(getResult);
                return acc.concat(wait.map(getResult));
            }, []);
            // Wait for all the "WAIT" resolvables
            return services.$q.all(services.$q.defer('ui_router_resolvecontext_all'), promises);
        };
        ResolveContext.prototype.injector = function () {
            return this._injector || (this._injector = new UIInjectorImpl(this));
        };
        ResolveContext.prototype.findNode = function (resolvable) {
            return find(this._path, function (node) {
                return inArray(node.resolvables, resolvable);
            });
        };

        ResolveContext.prototype.getDependencies = function (resolvable) {
            var _this = this;
            var node = this.findNode(resolvable);
            // Find which other resolvables are "visible" to the `resolvable` argument
            // subpath stopping at resolvable's node, or the whole path (if the resolvable isn't in the path)
            var subPath = PathUtils.subPath(this._path, function (x) {
                return x === node;
            }) || this._path;
            var availableResolvables = subPath
				.reduce(function (acc, _node) { return acc.concat(_node.resolvables); }, []) //all of subpath's resolvables
				.filter(function (res) { return res !== resolvable; }); // filter out the `resolvable` argument
            var getDependency = function (token) {
                var matching = availableResolvables.filter(function (r) {
                    return r.token === token;
                });
                if (matching.length)
                    return tail(matching);
                var fromInjector = _this.injector().getNative(token);
                if (_.isUndefined(fromInjector)) {
                    throw new Error('Could not find Dependency Injection token: ' + stringify(token));
                }
                return new Resolvable(token, function () {
                    return fromInjector;
                }, [], fromInjector);
            };
            return resolvable.deps.map(getDependency);
        };
        return ResolveContext;
    }());

    UIInjectorImpl = (function () {
        function UIInjectorImpl(context) {
            this.context = context;
            this.native = this.get(NATIVE_INJECTOR_TOKEN) || services.$injector;
        }
        UIInjectorImpl.prototype.get = function (token) {
            var resolvable = this.context.getResolvable(token);
            if (resolvable) {
                if (this.context.getPolicy(resolvable).async === 'NOWAIT') {
                    return resolvable.get(this.context);
                }
                if (!resolvable.resolved) {
                    throw new Error('Resolvable async .get() not complete:' + stringify(resolvable.token));
                }
                return resolvable.data;
            }

			return this.getNative(token);
        };
        UIInjectorImpl.prototype.getAsync = function (token) {
            var resolvable = this.context.getResolvable(token);
            if (resolvable)
                return resolvable.get(this.context);
            return services.$q.when(services.$q.defer('ui_router_uiinjectorimpl_when'), this.native.get(token));
        };
        UIInjectorImpl.prototype.getNative = function (token) {
            return this.native && this.native.get(token);
        };
        return UIInjectorImpl;
    }());

    var stateSelf = prop('self');

    var Transition = (function () {
		var temp_tr = 'ng.ui.router - Transition';

        function Transition(fromPath, targetState, router) {
            var _this = this;
            /** @hidden */
            this._deferred = services.$q.defer('ui_router_transition_defer');

            this.promise = this._deferred.promise;
            /** @hidden Holds the hook registration functions such as those passed to Transition.onStart() */
            this._registeredHooks = {};
            /** @hidden */
            this._hookBuilder = new HookBuilder(this);
            /** Checks if this transition is currently active/running. */
            this.isActive = function () {
                return _this.router.globals.transition === _this;
            };
            this.router = router;
            this._targetState = targetState;
            if (!targetState.valid()) {
                throw new Error(targetState.error());
            }
            // current() is assumed to come from targetState.options, but provide a naive implementation otherwise.
            this._options = extend({
                current: val(this)
            }, targetState.options());
            this.$id = router.transitionService._transitionCount++;
            var toPath = PathUtils.buildToPath(fromPath, targetState);
            this._treeChanges = PathUtils.treeChanges(fromPath, toPath, this._options.reloadState);
            this.createTransitionHookRegFns();
            var onCreateHooks = this._hookBuilder.buildHooksForPhase(exports.TransitionHookPhase.CREATE);
            TransitionHook.invokeHooks(onCreateHooks, function () {
                return null;
            });
            this.applyViewConfigs(router);
        }
        /** @hidden */
        Transition.prototype.onBefore = function () {
			msos.console.warn(temp_tr + ' - onBefore -> not set yet.');
            return;
        };
        /** @inheritdoc */
        Transition.prototype.onStart = function () {
			msos.console.warn(temp_tr + ' - onStart -> not set yet.');
            return;
        };
        /** @inheritdoc */
        Transition.prototype.onExit = function () {
			msos.console.warn(temp_tr + ' - onExit -> not set yet.');
            return;
        };
        /** @inheritdoc */
        Transition.prototype.onRetain = function () {
			msos.console.warn(temp_tr + ' - onRetain -> not set yet.');
            return;
        };
        /** @inheritdoc */
        Transition.prototype.onEnter = function () {
			msos.console.warn(temp_tr + ' - onEnter -> not set yet.');
            return;
        };
        /** @inheritdoc */
        Transition.prototype.onFinish = function () {
			msos.console.warn(temp_tr + ' - onFinish -> not set yet.');
            return;
        };
        /** @inheritdoc */
        Transition.prototype.onSuccess = function () {
			msos.console.warn(temp_tr + ' - onSuccess -> not set yet.');
            return;
        };
        /** @inheritdoc */
        Transition.prototype.onError = function () {
			msos.console.warn(temp_tr + ' - onBefore -> not set yet.');
            return;
        };
        /** @hidden
         * Creates the transition-level hook registration functions
         * (which can then be used to register hooks)
         */
        Transition.prototype.createTransitionHookRegFns = function () {
            var _this = this;
            this.router.transitionService._pluginapi._getEvents()
                .filter(function (type) {
                    return type.hookPhase !== exports.TransitionHookPhase.CREATE;
                })
                .forEach(function (type) {
                    return makeEvent(_this, _this.router.transitionService, type);
                });
        };
        /** @internalapi */
        Transition.prototype.getHooks = function (hookName) {
            return this._registeredHooks[hookName];
        };
        Transition.prototype.applyViewConfigs = function (router) {
            var enteringStates = this._treeChanges.entering.map(function (node) {
                return node.state;
            });
            PathUtils.applyViewConfigs(router.transitionService.$view, this._treeChanges.to, enteringStates);
        };

        Transition.prototype.$from = function () {
            return tail(this._treeChanges.from).state;
        };

        Transition.prototype.$to = function () {
            return tail(this._treeChanges.to).state;
        };

        Transition.prototype.from = function () {
            return this.$from().self;
        };

        Transition.prototype.to = function () {
            return this.$to().self;
        };

        Transition.prototype.targetState = function () {
            return this._targetState;
        };

        Transition.prototype.is = function (compare) {
            if (compare instanceof Transition) {
                // TODO: Also compare parameters
                return this.is({
                    to: compare.$to().name,
                    from: compare.$from().name
                });
            }
            return !((compare.to && !matchState(this.$to(), compare.to)) ||
                (compare.from && !matchState(this.$from(), compare.from)));
        };
        Transition.prototype.params = function (pathname) {
            if (pathname === void 0) {
                pathname = 'to';
            }
            return Object.freeze(this._treeChanges[pathname].map(prop('paramValues')).reduce(mergeR, {}));
        };

        Transition.prototype.injector = function (state, pathName) {
            if (pathName === void 0) {
                pathName = 'to';
            }
            var path = this._treeChanges[pathName];
            if (state)
                path = PathUtils.subPath(path, function (node) {
                    return node.state === state || node.state.name === state;
                });
            return new ResolveContext(path).injector();
        };

        Transition.prototype.getResolveTokens = function (pathname) {
            if (pathname === void 0) {
                pathname = 'to';
            }
            return new ResolveContext(this._treeChanges[pathname]).getTokens();
        };

        Transition.prototype.addResolvable = function (resolvable, state) {
            if (state === void 0) {
                state = '';
            }
            resolvable = is(Resolvable)(resolvable) ? resolvable : new Resolvable(resolvable);
            var stateName = (typeof state === 'string') ? state : state.name;
            var topath = this._treeChanges.to;
            var targetNode = find(topath, function (node) {
                return node.state.name === stateName;
            });
            var resolveContext = new ResolveContext(topath);
            resolveContext.addResolvables([resolvable], targetNode.state);
        };

        Transition.prototype.redirectedFrom = function () {
            return this._options.redirectedFrom || null;
        };

        Transition.prototype.originalTransition = function () {
            var rf = this.redirectedFrom();
            return (rf && rf.originalTransition()) || this;
        };

        Transition.prototype.options = function () {
            return this._options;
        };

        Transition.prototype.entering = function () {
            return map(this._treeChanges.entering, prop('state')).map(stateSelf);
        };

        Transition.prototype.exiting = function () {
            return map(this._treeChanges.exiting, prop('state')).map(stateSelf).reverse();
        };

        Transition.prototype.retained = function () {
            return map(this._treeChanges.retained, prop('state')).map(stateSelf);
        };
 
        Transition.prototype.views = function (pathname, state) {
            if (pathname === void 0) {
                pathname = 'entering';
            }
            var path = this._treeChanges[pathname];
            path = !state ? path : path.filter(propEq('state', state));
            return path.map(prop('views')).filter(identity).reduce(unnestR, []);
        };
        Transition.prototype.treeChanges = function (pathname) {
            return pathname ? this._treeChanges[pathname] : this._treeChanges;
        };
 
        Transition.prototype.redirect = function (targetState) {
            var redirects = 1,
                trans = this;

			trans = trans.redirectedFrom();

            while (trans !== null && trans !== undefined) {
                if (++redirects > 20) {
                    throw new Error('Too many consecutive Transition redirects (20+)');
                }
				trans = trans.redirectedFrom();
            }

            var redirectOpts = {
                redirectedFrom: this,
                source: 'redirect'
            };

            if (this.options().source === 'url' && targetState.options().location !== false) {
                redirectOpts.location = 'replace';
            }
            var newOptions = extend({}, this.options(), targetState.options(), redirectOpts);
            targetState = targetState.withOptions(newOptions, true);
            var newTransition = this.router.transitionService.create(this._treeChanges.from, targetState);
            var originalEnteringNodes = this._treeChanges.entering;
            var redirectEnteringNodes = newTransition._treeChanges.entering;
            var nodeIsReloading = function (reloadState) {
                return function (node) {
                    return reloadState && node.state.includes[reloadState.name];
                };
            };
            // Find any "entering" nodes in the redirect path that match the original path and aren't being reloaded
            var matchingEnteringNodes = PathUtils.matching(redirectEnteringNodes, originalEnteringNodes, PathUtils.nonDynamicParams)
                .filter(not(nodeIsReloading(targetState.options().reloadState)));
            // Use the existing (possibly pre-resolved) resolvables for the matching entering nodes.
            matchingEnteringNodes.forEach(function (node, idx) {
                node.resolvables = originalEnteringNodes[idx].resolvables;
            });
            return newTransition;
        };
        /** @hidden If a transition doesn't exit/enter any states, returns any [[Param]] whose value changed */
        Transition.prototype._changedParams = function () {
            var tc = this._treeChanges;
            /** Return undefined if it's not a "dynamic" transition, for the following reasons */
            // If user explicitly wants a reload
            if (this._options.reload)
                return undefined;
            // If any states are exiting or entering
            if (tc.exiting.length || tc.entering.length)
                return undefined;
            // If to/from path lengths differ
            if (tc.to.length !== tc.from.length)
                return undefined;
            // If the to/from paths are different
            var pathsDiffer = arrayTuples(tc.to, tc.from)
                .map(function (tuple) {
                    return tuple[0].state !== tuple[1].state;
                })
                .reduce(anyTrueR, false);
            if (pathsDiffer)
                return undefined;
            // Find any parameter values that differ
            var nodeSchemas = tc.to.map(function (node) {
                return node.paramSchema;
            });
            var _a = [tc.to, tc.from].map(function (path) {
                    return path.map(function (x) {
                        return x.paramValues;
                    });
                }),
                toValues = _a[0],
                fromValues = _a[1];
            var tuples = arrayTuples(nodeSchemas, toValues, fromValues);
            return tuples.map(function (_a) {
                var schema = _a[0],
                    toVals = _a[1],
                    fromVals = _a[2];
                return Param.changed(schema, toVals, fromVals);
            }).reduce(unnestR, []);
        };
 
        Transition.prototype.dynamic = function () {
            var changes = this._changedParams();
            return !changes ? false : changes.map(function (x) {
                return x.dynamic;
            }).reduce(anyTrueR, false);
        };

        Transition.prototype.ignored = function () {
            return !!this._ignoredReason();
        };
        /** @hidden */
        Transition.prototype._ignoredReason = function () {
            var pending = this.router.globals.transition;
            var reloadState = this._options.reloadState;
            var same = function (pathA, pathB) {
                if (pathA.length !== pathB.length)
                    return false;
                var matching = PathUtils.matching(pathA, pathB);
                return pathA.length === matching.filter(function (node) {
                    return !reloadState || !node.state.includes[reloadState.name];
                }).length;
            };
            var newTC = this.treeChanges();
            var pendTC = pending && pending.treeChanges();
            if (pendTC && same(pendTC.to, newTC.to) && same(pendTC.exiting, newTC.exiting))
                return 'SameAsPending';
            if (newTC.exiting.length === 0 && newTC.entering.length === 0 && same(newTC.from, newTC.to))
                return 'SameAsCurrent';
        };

        Transition.prototype.run = function () {
            var temp_pr = 'ng.ui.router - Transition.prototype.run - ',
				_this = this,
				runAllHooks = TransitionHook.runAllHooks,
				getHooksFor = function (phase) {
					return _this._hookBuilder.buildHooksForPhase(phase);
				},
				transitionSuccess = function () {
					if (msos_verbose === 'router') {
						msos_debug(temp_pr + 'transitionSuccess -> called, $to:', _this.$to);
					}
					trace.traceSuccess(_this.$to(), _this);
					_this.success = true;
					_this._deferred.resolve(_this.to());
					runAllHooks(getHooksFor(exports.TransitionHookPhase.SUCCESS));
				},
				transitionError = function (reason) {
					if (msos_verbose === 'router') {
						msos_debug(temp_pr + 'transitionError -> called, reason:', reason);
					}
					trace.traceError(reason, _this);
					_this.success = false;
					_this._deferred.reject(reason);
					_this._error = reason;
					runAllHooks(getHooksFor(exports.TransitionHookPhase.ERROR));
				},
				runTransition = function () {
					if (msos_verbose === 'router') {
						msos_debug(temp_pr + 'runTransition -> called.');
					}
					// Wait to build the RUN hook chain until the BEFORE hooks are done
					// This allows a BEFORE hook to dynamically add additional RUN hooks via the Transition object.
					var allRunHooks = getHooksFor(exports.TransitionHookPhase.RUN);
					var done = function () {
						return services.$q.when(services.$q.defer('ui_router_runtransition_when'), undefined);
					};
					return TransitionHook.invokeHooks(allRunHooks, done);
				},
				startTransition = function () {
					var globals = _this.router.globals;
					globals.lastStartedTransitionId = _this.$id;
					globals.transition = _this;
					globals.transitionHistory.enqueue(_this);
					trace.traceTransitionStart(_this);
					return services.$q.when(services.$q.defer('ui_router_starttransition_when'), undefined);
				},
				allBeforeHooks = getHooksFor(exports.TransitionHookPhase.BEFORE);

			TransitionHook.invokeHooks(allBeforeHooks, startTransition)
				.then(runTransition)
				.then(transitionSuccess, transitionError);

			return this.promise;
        };

        Transition.prototype.valid = function () {
            return !this.error() || this.success !== undefined;
        };

        Transition.prototype.abort = function () {
            // Do not set flag if the transition is already complete
            if (_.isUndefined(this.success)) {
                this._aborted = true;
            }
        };

		Transition.prototype.error = function () {
			var state = this.$to();

			if (state.self.abstract) {
				return "Cannot transition to abstract state '" + state.name + "'";
			}

			var paramDefs = state.parameters(), values$$1 = this.params();
			var invalidParams = paramDefs.filter(
					function (param) { return !param.validates(values$$1[param.id]); }
				);

			if (invalidParams.length) {
				return "Param values not valid for state '" + state.name + "'. Invalid params: [ " + invalidParams.map(function (param) { return param.id; }).join(', ') + " ]";
			}

			if (this.success === false) {
				return this._error;
			}
		};

        Transition.prototype.toString = function () {
            var fromStateOrName = this.from();
            var toStateOrName = this.to();
            var avoidEmptyHash = function (params) {
                return (params['#'] !== null && params['#'] !== undefined) ? params : _.omit(params, ['#']);
            };
            // (X) means the to state is invalid.
			var id = this.$id,
				from = _.isObject(fromStateOrName) ? fromStateOrName.name : fromStateOrName,
				fromParams = stringify(avoidEmptyHash(this._treeChanges.from.map(prop('paramValues')).reduce(mergeR, {}))),
				toValid = this.valid() ? '' : '(X) ',
				to = _.isObject(toStateOrName) ? toStateOrName.name : toStateOrName,
				toParams = stringify(avoidEmptyHash(this.params()));

            return 'Transition#' + id + "( '" + from + "'" + fromParams + " -> " + toValid + "'" + to + "'" + toParams + " )";
        };

		Transition.diToken = Transition;
        return Transition;
    }());

    function maxLength(max, str) {
        if (str.length <= max)
            return str;
        return str.substr(0, max - 3) + '...';
    }

    function padString(length, str) {
        while (str.length < length)
            str += ' ';
        return str;
    }

    function kebobString(camelCase) {
        return camelCase
            .replace(/^([A-Z])/, function ($1) {
                return $1.toLowerCase();
            }) // replace first char
            .replace(/([A-Z])/g, function ($1) {
                return '-' + $1.toLowerCase();
            }); // replace rest
    }

    function functionToString(fn) {
        var fnStr = fnToString(fn);
        var namedFunctionMatch = fnStr.match(/^(function [^ ]+\([^)]*\))/);
        var toStr = namedFunctionMatch ? namedFunctionMatch[1] : fnStr;
        var fnName = fn.name || '';
        if (fnName && toStr.match(/function \(/)) {
            return 'function ' + fnName + toStr.substr(9);
        }
        return toStr;
    }

    function fnToString(fn) {
        var _fn = _.isArray(fn) ? fn.slice(-1)[0] : fn;
        return _fn && _fn.toString() || 'undefined';
    }
    var stringifyPatternFn = null;
    var stringifyPattern = function (value) {
        var isRejection = Rejection.isRejectionPromise;
        stringifyPatternFn = stringifyPatternFn || pattern([
            [not(isDefined), val('undefined')],
            [_.isNull, val('null')],
            [isPromise, val('[Promise]')],
            [isRejection, function (x) {
                return x._transitionRejection.toString();
            }],
            [is(Rejection), invoke('toString')],
            [is(Transition), invoke('toString')],
            [is(Resolvable), invoke('toString')],
            [isInjectable, functionToString],
            [val(true), identity]
        ]);
        return stringifyPatternFn(value);
    };

    function stringify(o) {
        var seen = [];

        function format(val) {
            if (_.isObject(val)) {
                if (seen.indexOf(val) !== -1)
                    return '[circular ref]';
                seen.push(val);
            }
            return stringifyPattern(val);
        }
        return JSON.stringify(o, function (key, val) {
            return format(val);
        }).replace(/\\"/g, '"');
    }

    function splitOnDelim(delim) {
        var re = new RegExp('(' + delim + ')', 'g');
        return function (str) {
            return str.split(re).filter(identity);
        };
    }

    function joinNeighborsR(acc, x) {
        if (_.isString(tail(acc)) && _.isString(x))
            return acc.slice(0, -1).concat(tail(acc) + x);
        return pushR(acc, x);
    }

    var ParamTypes = (function () {
        /** @internalapi */
        function ParamTypes() {
            /** @hidden */
            this.enqueue = true;
            /** @hidden */
            this.typeQueue = [];
            /** @internalapi */
            this.defaultTypes = _.pick(ParamTypes.prototype, ['hash', 'string', 'query', 'path', 'int', 'bool', 'date', 'json', 'any']);
            // Register default types. Store them in the prototype of this.types.
            var makeType = function (definition, name) {
                return new ParamType(extend({
                    name: name
                }, definition));
            };
            this.types = inherit(map(this.defaultTypes, makeType), {});
        }
        /** @internalapi */
        ParamTypes.prototype.dispose = function () {
            this.types = {};
        };

        ParamTypes.prototype.type = function (name, definition, definitionFn) {
            if (!isDefined(definition))
                return this.types[name];
            if (this.types.hasOwnProperty(name))
                throw new Error("A type named '" + name + "' has already been defined.");
            this.types[name] = new ParamType(extend({
                name: name
            }, definition));
            if (definitionFn) {
                this.typeQueue.push({
                    name: name,
                    def: definitionFn
                });
                if (!this.enqueue)
                    this._flushTypeQueue();
            }
            return this;
        };
        /** @internalapi */
        ParamTypes.prototype._flushTypeQueue = function () {
            while (this.typeQueue.length) {
                var type = this.typeQueue.shift();
                if (type.pattern)
                    throw new Error("You cannot override a type's .pattern at runtime.");
                extend(this.types[type.name], services.$injector.invoke(type.def));
            }
        };
        return ParamTypes;
    }());
    /** @hidden */
    function initDefaultTypes() {
        var makeDefaultType = function (def) {
            var valToString = function (val) {
                return val !== null && val !== undefined ? val.toString() : val;
            };
            var defaultTypeBase = {
                encode: valToString,
                decode: valToString,
                is: is(String),
                pattern: /.*/,
                equals: function (a, b) {
                    return a == b;
                },
            };
            return extend({}, defaultTypeBase, def);
        };
        // Default Parameter Type Definitions
        extend(ParamTypes.prototype, {
            string: makeDefaultType({}),
            path: makeDefaultType({
                pattern: /[^/]*/,
            }),
            query: makeDefaultType({}),
            hash: makeDefaultType({
                inherit: false,
            }),
            int: makeDefaultType({
                decode: function (val) {
                    return parseInt(val, 10);
                },
                is: function (val) {
                    return !isNullOrUndefined(val) && this.decode(val.toString()) === val;
                },
                pattern: /-?\d+/,
            }),
            bool: makeDefaultType({
                encode: function (val) {
                    return val && 1 || 0;
                },
                decode: function (val) {
                    return parseInt(val, 10) !== 0;
                },
				pattern: /0|1/,
                is: is(Boolean)
            }),
            date: makeDefaultType({
                encode: function (val) {
                    return !this.is(val) ?
						undefined :
						[val.getFullYear(), ('0' + (val.getMonth() + 1)).slice(-2), ('0' + val.getDate()).slice(-2)].join('-');
                },
                decode: function (val) {
                    if (this.is(val))
                        return val;
                    var match = this.capture.exec(val);
                    return match ? new Date(match[1], match[2] - 1, match[3]) : undefined;
                },
                is: function (val) {
                    return val instanceof Date && !isNaN(val.valueOf());
                },
                pattern: /[0-9]{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[1-2][0-9]|3[0-1])/,
                capture: /([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/,
                equals: function (l, r) {
                    return ['getFullYear', 'getMonth', 'getDate']
                        .reduce(function (acc, fn) {
                            return acc && l[fn]() === r[fn]();
                        }, true);
                }
            }),
            json: makeDefaultType({
                encode: toJson,
                decode: fromJson,
                is: is(Object),
				pattern: /[^/]*/,
                equals: equals
            }),
            // does not encode/decode
            any: makeDefaultType({
                encode: identity,
                decode: identity,
                is: function () {
                    return true;
                },
                equals: equals
            }),
        });
    }
    initDefaultTypes();

    var StateParams = (function () {
        function StateParams(params) {
            if (params === void 0) {
                params = {};
            }
            extend(this, params);
        }

        StateParams.prototype.$inherit = function (newParams, $current, $to) {
            var parents = ancestors($current, $to),
                parentParams, inherited = {},
                inheritList = [];
            for (var i in parents) {
                if (!parents[i] || !parents[i].params)
                    continue;
                parentParams = Object.keys(parents[i].params);
                if (!parentParams.length)
                    continue;
                for (var j in parentParams) {
                    if (inheritList.indexOf(parentParams[j]) >= 0)
                        continue;
                    inheritList.push(parentParams[j]);
                    inherited[parentParams[j]] = this[parentParams[j]];
                }
            }
            return extend({}, inherited, newParams);
        };

        return StateParams;
    }());

	var parseUrl = function (url) {
		if (!_.isString(url)) {
			return false;
		}

		var root$$1 = url.charAt(0) === '^';

		return { val: root$$1 ? url.substring(1) : url, root: root$$1 };
	};

    function nameBuilder(state) {
        return state.name;
    }

    function selfBuilder(state) {
        state.self.$$state = function () {
            return state;
        };
        return state.self;
    }

    function dataBuilder(state) {
        if (state.parent && state.parent.data) {
            state.data = state.self.data = inherit(state.parent.data, state.data);
        }
        return state.data;
    }
    var getUrlBuilder = function ($urlMatcherFactoryProvider, root$$1) {
        return function urlBuilder(state) {
            var stateDec = state;
            // For future states, i.e., states whose name ends with `.**`,
            // match anything that starts with the url prefix
            if (stateDec && stateDec.url && stateDec.name && stateDec.name.match(/\.\*\*$/)) {
                stateDec.url += '{remainder:any}'; // match any path (.*)
            }
            var parsed = parseUrl(stateDec.url),
                parent = state.parent;
            var url = !parsed ? stateDec.url : $urlMatcherFactoryProvider.compile(parsed.val, {
                params: state.params || {},
                paramMap: function (paramConfig, isSearch) {
                    if (stateDec.reloadOnSearch === false && isSearch)
                        paramConfig = extend(paramConfig || {}, {
                            dynamic: true
                        });
                    return paramConfig;
                }
            });
            if (!url)
                return null;
            if (!$urlMatcherFactoryProvider.isMatcher(url))
                throw new Error("Invalid url '" + url + "' in state '" + state + "'");
            return (parsed && parsed.root) ? url : ((parent && parent.navigable) || root$$1()).url.append(url);
        };
    };
    var getNavigableBuilder = function (isRoot) {
        return function navigableBuilder(state) {
            return !isRoot(state) && state.url ? state : (state.parent ? state.parent.navigable : null);
        };
    };
    var getParamsBuilder = function (paramFactory) {
        return function paramsBuilder(state) {
            var makeConfigParam = function (config, id) {
                return paramFactory.fromConfig(id, null, config);
            };
            var urlParams = (state.url && state.url.parameters({
                inherit: false
            })) || [];
            var nonUrlParams = values(mapObj(_.omit(state.params || {}, urlParams.map(prop('id'))), makeConfigParam));
            return urlParams.concat(nonUrlParams).map(function (p) {
                return [p.id, p];
            }).reduce(applyPairs, {});
        };
    };

    function pathBuilder(state) {
        return state.parent ? state.parent.path.concat(state) : [state];
    }

    function includesBuilder(state) {
        var includes = state.parent ? extend({}, state.parent.includes) : {};
        includes[state.name] = true;
        return includes;
    }

    function resolvablesBuilder(state) {
        /** convert resolve: {} and resolvePolicy: {} objects to an array of tuples */
        var objects2Tuples = function (resolveObj, resolvePolicies) {
            return Object.keys(resolveObj || {}).map(function (token) {
                return ({
                    token: token,
                    val: resolveObj[token],
                    deps: undefined,
                    policy: resolvePolicies[token]
                });
            });
        };
        /** fetch DI annotations from a function or ng1-style array */
        var annotate = function (fn) {
            var $injector = services.$injector;
            // ng1 doesn't have an $injector until runtime.
            // If the $injector doesn't exist, use "deferred" literal as a
            // marker indicating they should be annotated when runtime starts
            return fn.$inject || ($injector && $injector.annotate(fn, $injector.strictDi)) || 'deferred';
        };
        /** true if the object has both `token` and `resolveFn`, and is probably a [[ResolveLiteral]] */
        var isResolveLiteral = function (obj) {
            return !!(obj.token && obj.resolveFn);
        };
        /** true if the object looks like a provide literal, or a ng2 Provider */
        var isLikeNg2Provider = function (obj) {
            return !!((obj.provide || obj.token) && (obj.useValue || obj.useFactory || obj.useExisting || obj.useClass));
        };
        /** true if the object looks like a tuple from obj2Tuples */
        var isTupleFromObj = function (obj) {
            return !!(obj && obj.val && (_.isString(obj.val) || _.isArray(obj.val) || _.isFunction(obj.val)));
        };
        /** extracts the token from a Provider or provide literal */
        var getToken = function (p) {
            return p.provide || p.token;
        };
        /** Given a literal resolve or provider object, returns a Resolvable */
        var literal2Resolvable = pattern([
            [prop('resolveFn'), function (p) {
                return new Resolvable(getToken(p), p.resolveFn, p.deps, p.policy);
            }],
            [prop('useFactory'), function (p) {
                return new Resolvable(getToken(p), p.useFactory, (p.deps || p.dependencies), p.policy);
            }],
            [prop('useClass'), function (p) {
                return new Resolvable(getToken(p), function () {
                    return new p.useClass();
                }, [], p.policy);
            }],
            [prop('useValue'), function (p) {
                return new Resolvable(getToken(p), function () {
                    return p.useValue;
                }, [], p.policy, p.useValue);
            }],
            [prop('useExisting'), function (p) {
                return new Resolvable(getToken(p), identity, [p.useExisting], p.policy);
            }],
        ]);
        var tuple2Resolvable = pattern([
            [pipe(prop('val'), _.isString), function (tuple) {
                return new Resolvable(tuple.token, identity, [tuple.val], tuple.policy);
            }],
            [pipe(prop('val'), _.isArray), function (tuple) {
                return new Resolvable(tuple.token, tail(tuple.val), tuple.val.slice(0, -1), tuple.policy);
            }],
            [pipe(prop('val'), _.isFunction), function (tuple) {
                return new Resolvable(tuple.token, tuple.val, annotate(tuple.val), tuple.policy);
            }],
        ]);
        var item2Resolvable = pattern([
            [is(Resolvable), function (r) {
                return r;
            }],
            [isResolveLiteral, literal2Resolvable],
            [isLikeNg2Provider, literal2Resolvable],
            [isTupleFromObj, tuple2Resolvable],
            [val(true), function (obj) {
                throw new Error('Invalid resolve value: ' + stringify(obj));
            }]
        ]);
        // If resolveBlock is already an array, use it as-is.
        // Otherwise, assume it's an object and convert to an Array of tuples
        var decl = state.resolve;
        var items = _.isArray(decl) ? decl : objects2Tuples(decl, state.resolvePolicy || {});
        return items.map(item2Resolvable);
    }

    var StateBuilder = (function () {
        function StateBuilder(matcher, urlMatcherFactory) {
            this.matcher = matcher;
            var self = this;
            var root$$1 = function () {
				return matcher.find('');
			};
            var isRoot = function (state) {
                return state.name === '';
            };

            function parentBuilder(state) {
                if (isRoot(state))
                    return null;
                return matcher.find(self.parentName(state)) || root$$1();
            }
            this.builders = {
                name: [nameBuilder],
                self: [selfBuilder],
                parent: [parentBuilder],
                data: [dataBuilder],
                // Build a URLMatcher if necessary, either via a relative or absolute URL
                url: [getUrlBuilder(urlMatcherFactory, root$$1)],
                // Keep track of the closest ancestor state that has a URL (i.e. is navigable)
                navigable: [getNavigableBuilder(isRoot)],
                params: [getParamsBuilder(urlMatcherFactory.paramFactory)],
                // Each framework-specific ui-router implementation should define its own `views` builder
                // e.g., src/ng1/statebuilders/views.ts
                views: [],
                // Keep a full path from the root down to this state as this is needed for state activation.
                path: [pathBuilder],
                // Speed up $state.includes() as it's used a lot
                includes: [includesBuilder],
                resolvables: [resolvablesBuilder]
            };
        }

        StateBuilder.prototype.builder = function (name, fn) {
            var builders = this.builders,
				array = builders[name] || [];

            if (_.isString(name) && !isDefined(fn)) {
                return array.length > 1 ? array : array[0];
            }
            if (!_.isString(name) || !_.isFunction(fn)) {
                return;
            }

            builders[name] = array;
            builders[name].push(fn);

            return function () {
                return builders[name].splice(builders[name].indexOf(fn, 1)) && null;
            };
        };

        StateBuilder.prototype.build = function (state) {
            var _a = this,
                matcher = _a.matcher,
                builders = _a.builders,
				parent = this.parentName(state),
				key,
				chain;

            if (parent && !matcher.find(parent, undefined, false)) {
                return null;
            }

			function step_parent(parentFn, step) {
				return function (_state) {
					return step(_state, parentFn);
				};
			}

            for (key in builders) {
                if (!builders.hasOwnProperty(key)) {
                    continue;
                }
                chain = builders[key].reduce(
					step_parent,
					noop_rt
				);

				if (chain !== noop_rt) {
					state[key] = chain(state);
				} else {
					state[key] = undefined;
				}
            }

            return state;
        };
		StateBuilder.prototype.parentName = function (state) {
			// name = 'foo.bar.baz.**'
			var name = state.name || '';
			// segments = ['foo', 'bar', 'baz', '.**']
			var segments = name.split('.');
			// segments = ['foo', 'bar', 'baz']
			var lastSegment = segments.pop();
			// segments = ['foo', 'bar'] (ignore .** segment for future states)
			if (lastSegment === '**')
				segments.pop();
			if (segments.length) {
				if (state.parent) {
					throw new Error("States that specify the 'parent:' property should not have a '.' in their name (" + name + ")");
				}
				// 'foo.bar'
				return segments.join('.');
			}
			if (!state.parent) {
				return '';
			}
			return _.isString(state.parent) ? state.parent : state.parent.name;
		};
        StateBuilder.prototype.name = function (state) {
            var name = state.name;
            if (name.indexOf('.') !== -1 || !state.parent)
                return name;
            var parentName = _.isString(state.parent) ? state.parent : state.parent.name;
            return parentName ? parentName + '.' + name : name;
        };
        return StateBuilder;
    }());

    /** @module state */
    /** for typedoc */
    var StateMatcher = (function () {
        function StateMatcher(_states) {
            this._states = _states;
        }
        StateMatcher.prototype.isRelative = function (stateName) {
            stateName = stateName || '';
            return stateName.indexOf('.') === 0 || stateName.indexOf('^') === 0;
        };
        StateMatcher.prototype.find = function (stateOrName, base, matchGlob) {
            if (matchGlob === void 0) {
                matchGlob = true;
            }
            if (!stateOrName && stateOrName !== '')
                return undefined;
            var isStr = _.isString(stateOrName);
            var name = isStr ? stateOrName : stateOrName.name;
            if (this.isRelative(name))
                name = this.resolvePath(name, base);
            var state = this._states[name];
            if (state && (isStr || (!isStr && (state === stateOrName || state.self === stateOrName)))) {
                return state;
            } else if (isStr && matchGlob) {
                var _states = values(this._states);
                var matches = _states.filter(
						function (_state) {
							return _state.__stateObjectCache.nameGlob &&
								_state.__stateObjectCache.nameGlob.matches(name);
						}
					);

                if (matches.length > 1) {
                    msos_debug('stateMatcher.find: Found multiple matches for ' + name + ' using glob: ', matches.map(
							function (match) { return match.name; }
						)
					);
                }

                return matches[0];
            }

            return undefined;
        };
        StateMatcher.prototype.resolvePath = function (name, base) {
            if (!base) {
                throw new Error("No reference point given for path '" + name + "'");
            }
            var baseState = this.find(base),
				splitName = name.split('.'),
                i = 0,
                pathLength = splitName.length,
                current = baseState,
				relName;

            for (i = 0; i < pathLength; i += 1) {

                if (splitName[i] === '' && i === 0) {
                    current = baseState;
                    continue;
                }

                if (splitName[i] === '^') {
                    if (!current.parent) {
                        throw new Error("Path '" + name + "' not valid for state '" + baseState.name + "'");
                    }
                    current = current.parent;
                    continue;
                }

                break;
            }

            relName = splitName.slice(i).join('.');

            return current.name + (current.name && relName ? '.' : '') + relName;
        };
        return StateMatcher;
    }());

    /** @module state */
    /** for typedoc */
    /** @internalapi */
    var StateQueueManager = (function () {
        function StateQueueManager($registry, $urlRouter, states, builder, listeners) {
            this.$registry = $registry;
            this.$urlRouter = $urlRouter;
            this.states = states;
            this.builder = builder;
            this.listeners = listeners;
            this.queue = [];
            this.matcher = $registry.matcher;
        }
        /** @internalapi */
        StateQueueManager.prototype.dispose = function () {
            this.queue = [];
        };
        StateQueueManager.prototype.register = function (stateDecl) {
            var queue = this.queue;
            var state = StateObject.create(stateDecl);
            var name = state.name;
            if (!_.isString(name))
                throw new Error('State must have a valid name');
            if (this.states.hasOwnProperty(name) || inArray(queue.map(prop('name')), name))
                throw new Error("State '" + name + "' is already defined");
            queue.push(state);
            this.flush();
            return state;
        };
        StateQueueManager.prototype.flush = function () {
            var _this = this;
            var _a = this,
                queue = _a.queue,
                states = _a.states,
                builder = _a.builder;
            var registered = [], // states that got registered
                orphans = [], // states that don't yet have a parent registered
                previousQueueLength = {}; // keep track of how long the queue when an orphan was first encountered
            var getState = function (name) {
                return _this.states.hasOwnProperty(name) && _this.states[name];
            };
            while (queue.length > 0) {
                var state = queue.shift();
                var name_1 = state.name;
                var result = builder.build(state);
                var orphanIdx = orphans.indexOf(state);
                if (result) {
                    var existingState = getState(name_1);
                    if (existingState && existingState.name === name_1) {
                        throw new Error("State '" + name_1 + "' is already defined");
                    }
                    var existingFutureState = getState(name_1 + '.**');
                    if (existingFutureState) {
                        // Remove future state of the same name
                        this.$registry.deregister(existingFutureState);
                    }
                    states[name_1] = state;
                    this.attachRoute(state);
                    if (orphanIdx >= 0)
                        orphans.splice(orphanIdx, 1);
                    registered.push(state);
                    continue;
                }
                var prev = previousQueueLength[name_1];
                previousQueueLength[name_1] = queue.length;
                if (orphanIdx >= 0 && prev === queue.length) {
                    // Wait until two consecutive iterations where no additional states were dequeued successfully.
                    // throw new Error(`Cannot register orphaned state '${name}'`);
                    queue.push(state);
                    return states;
                } else if (orphanIdx < 0) {
                    orphans.push(state);
                }
                queue.push(state);
            }
            if (registered.length) {
                this.listeners.forEach(function (listener) {
                    return listener('registered', registered.map(function (s) {
                        return s.self;
                    }));
                });
            }
            return states;
        };
        StateQueueManager.prototype.attachRoute = function (state) {
            if (state.abstract || !state.url)
                return;
            this.$urlRouter.rule(this.$urlRouter.urlRuleFactory.create(state));
        };
        return StateQueueManager;
    }());

    var StateRegistry = (function () {
        /** @internalapi */
        function StateRegistry(_router) {
            this._router = _router;
            this.states = {};
            this.listeners = [];
            this.matcher = new StateMatcher(this.states);
            this.builder = new StateBuilder(this.matcher, _router.urlMatcherFactory);
            this.stateQueue = new StateQueueManager(this, _router.urlRouter, this.states, this.builder, this.listeners);
            this._registerRoot();
        }
        /** @internalapi */
        StateRegistry.prototype._registerRoot = function () {
            var rootStateDef = {
                name: '',
                url: '^',
                views: null,
                params: {
                    '#': {
                        value: null,
                        type: 'hash',
                        dynamic: true
                    }
                },
                abstract: true
            };
            var _root = this._root = this.stateQueue.register(rootStateDef);
            _root.navigable = null;
        };
        /** @internalapi */
        StateRegistry.prototype.dispose = function () {
            var _this = this;
            this.stateQueue.dispose();
            this.listeners = [];
            this.get().forEach(function (state) {
                return _this.get(state) && _this.deregister(state);
            });
        };

        StateRegistry.prototype.onStatesChanged = function (listener) {
            this.listeners.push(listener);
            return function deregisterListener() {
                removeFrom(this.listeners)(listener);
            }.bind(this);
        };

        StateRegistry.prototype.root = function () {
            return this._root;
        };

        StateRegistry.prototype.register = function (stateDefinition) {
            return this.stateQueue.register(stateDefinition);
        };

        StateRegistry.prototype._deregisterTree = function (state) {
            var _this = this,
				all$$1 = this.get().map(
					function (s) {
						return s.$$state();
					}
				),
				getChildren = function (states) {
					var _children = all$$1.filter(
						function (s) {
							return states.indexOf(s.parent) !== -1;
						}
					);

					return _children.length === 0 ? _children : _children.concat(getChildren(_children));
				},
				children = getChildren([state]),
				deregistered = [state].concat(children).reverse();

			deregistered.forEach(
				function (_state) {
					var $ur = _this._router.urlRouter;

					$ur.rules().filter(propEq('state', _state)).forEach($ur.removeRule.bind($ur));
					delete _this.states[_state.name];
				}
			);

            return deregistered;
        };

        StateRegistry.prototype.deregister = function (stateOrName) {
            var _state = this.get(stateOrName);

            if (!_state)
                throw new Error("Can't deregister state; not found: " + stateOrName);
            var deregisteredStates = this._deregisterTree(_state.$$state());
            this.listeners.forEach(function (listener) {
                return listener('deregistered', deregisteredStates.map(function (s) {
                    return s.self;
                }));
            });
            return deregisteredStates;
        };
        StateRegistry.prototype.get = function (stateOrName, base) {
            var _this = this;
            if (arguments.length === 0)
                return Object.keys(this.states).map(function (name) {
                    return _this.states[name].self;
                });
            var found = this.matcher.find(stateOrName, base);
            return found && found.self || null;
        };
        StateRegistry.prototype.decorator = function (name, func) {
            return this.builder.builder(name, func);
        };
        return StateRegistry;
    }());

    function quoteRegExp(string, param) {
        var surroundPattern = ['', ''],
            result = string.replace(/[\\\[\]\^$*+?.()|{}]/g, '\\$&');
        if (!param)
            return result;
        switch (param.squash) {
            case false:
                surroundPattern = ['(', ')' + (param.isOptional ? '?' : '')];
                break;
            case true:
                result = result.replace(/\/$/, '');
                surroundPattern = ['(?:\/(', ')|\/)?'];
                break;
            default:
                surroundPattern = ['(' + param.squash + '|', ')?'];
                break;
        }
        return result + surroundPattern[0] + param.type.pattern.source + surroundPattern[1];
    }

    var memoizeTo = function (obj, _prop, fn) {
			obj[_prop] = obj[_prop] || fn();
        return obj[_prop];
    };

    var splitOnSlash = splitOnDelim('/');

    var UrlMatcher = (function () {

        function UrlMatcher(pattern$$1, paramTypes, paramFactory, config) {
            var _this = this;

            this.config = config;
            this._cache = {
                path: [this]
            };
            this._children = [];
            this._params = [];
            this._segments = [];
            this._compiled = [];
            this.pattern = pattern$$1;
            this.config = defaults(this.config, {
                params: {},
                strict: true,
                caseInsensitive: false,
                paramMap: identity
            });

			var placeholder = /([:*])([\w\[\]]+)|\{([\w\[\]]+)(?:\:\s*((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g,
				searchPlaceholder = /([:]?)([\w\[\].-]+)|\{([\w\[\].-]+)(?:\:\s*((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g,
                last = 0,
				patterns = [],
				matchArray,
				checkParamErrors = function (id) {
					if (!UrlMatcher.nameValidator.test(id)) {
						throw new Error("Invalid parameter name '" + id + "' in pattern '" + pattern$$1 + "'");
					}
					if (find(_this._params, propEq('id', id))) {
						throw new Error("Duplicate parameter name '" + id + "' in pattern '" + pattern$$1 + "'");
					}
				},
				matchDetails = function (m, isSearch) {
					var id = m[2] || m[3],
						regexp = isSearch ? m[4] : m[4] || (m[1] === '*' ? '[\\s\\S]*' : null),
						makeRegexpType = function (regexp) {
								return inherit(paramTypes.type(isSearch ? 'query' : 'path'), {
									pattern: new RegExp(regexp, _this.config.caseInsensitive ? 'i' : undefined)
								}
							);
						};

					return {
						id: id,
						regexp: regexp,
						cfg: _this.config.params[id],
						segment: pattern$$1.substring(last, m.index),
						type: !regexp ? null : paramTypes.type(regexp) || makeRegexpType(regexp)
					};
				},
				p,
				segment,
				i,
				search;

            while ((matchArray = placeholder.exec(pattern$$1))) {
                p = matchDetails(matchArray, false);

                if (p.segment.indexOf('?') >= 0) {
                    break;
                }

                checkParamErrors(p.id);
                this._params.push(paramFactory.fromPath(p.id, p.type, this.config.paramMap(p.cfg, false)));
                this._segments.push(p.segment);
                patterns.push([p.segment, tail(this._params)]);
                last = placeholder.lastIndex;
            }

            segment = pattern$$1.substring(last);

			i = segment.indexOf('?');

            if (i >= 0) {
                search = segment.substring(i);
                segment = segment.substring(0, i);

                if (search.length > 0) {
                    last = 0;
                    while ((matchArray = searchPlaceholder.exec(search))) {
                        p = matchDetails(matchArray, true);
                        checkParamErrors(p.id);
                        this._params.push(paramFactory.fromSearch(p.id, p.type, this.config.paramMap(p.cfg, true)));
                        last = placeholder.lastIndex;
                        // check if ?&
                    }
                }
            }

            this._segments.push(segment);
			this._compiled = patterns.map(
				function (_pattern) {
					return quoteRegExp.apply(null, _pattern);
				}
			).concat(quoteRegExp(segment));
        }

        UrlMatcher.prototype.append = function (url) {
            this._children.push(url);
            url._cache = {
                path: this._cache.path.concat(url),
                parent: this,
                pattern: null,
            };
            return url;
        };
        /** @hidden */
        UrlMatcher.prototype.isRoot = function () {
            return this._cache.path[0] === this;
        };
        /** Returns the input pattern string */
        UrlMatcher.prototype.toString = function () {
            return this.pattern;
        };

        UrlMatcher.prototype.exec = function (path, search, hash, options) {
            var _this = this;
            if (search === void 0) {
                search = {};
            }
            if (options === void 0) {
                options = {};
            }
            var match = memoizeTo(this._cache, 'pattern', function () {
                return new RegExp([
                    '^',
                    unnest(_this._cache.path.map(prop('_compiled'))).join(''),
                    _this.config.strict === false ? '\/?' : '',
                    '$'
                ].join(''), _this.config.caseInsensitive ? 'i' : undefined);
            }).exec(path);
            if (!match)
                return null;
            //options = defaults(options, { isolate: false });
            var allParams = this.parameters(),
                pathParams = allParams.filter(function (param) {
                    return !param.isSearch();
                }),
                searchParams = allParams.filter(function (param) {
                    return param.isSearch();
                }),
                nPathSegments = this._cache.path.map(function (urlm) {
                    return urlm._segments.length - 1;
                }).reduce(function (a, x) {
                    return a + x;
                }),
                values$$1 = {};
            if (nPathSegments !== match.length - 1)
                throw new Error("Unbalanced capture group in route '" + this.pattern + "'");

            function decodePathArray(string) {
                var reverseString = function (str) {
                    return str.split('').reverse().join('');
                };
                var unquoteDashes = function (str) {
                    return str.replace(/\\-/g, '-');
                };
                var split = reverseString(string).split(/-(?!\\)/);
                var allReversed = map(split, reverseString);
                return map(allReversed, unquoteDashes).reverse();
            }
            for (var i = 0; i < nPathSegments; i++) {
                var param = pathParams[i];
                var value = match[i + 1];
                // if the param value matches a pre-replace pair, replace the value before decoding.
                for (var j = 0; j < param.replace.length; j++) {
                    if (param.replace[j].from === value)
                        value = param.replace[j].to;
                }
                if (value && param.array === true)
                    value = decodePathArray(value);
                if (isDefined(value))
                    value = param.type.decode(value);
                values$$1[param.id] = param.value(value);
            }
            searchParams.forEach(function (param) {
                var value = search[param.id];
                for (var j = 0; j < param.replace.length; j++) {
                    if (param.replace[j].from === value)
                        value = param.replace[j].to;
                }
                if (isDefined(value))
                    value = param.type.decode(value);
                values$$1[param.id] = param.value(value);
            });
            if (hash)
                values$$1['#'] = hash;
            return values$$1;
        };

        UrlMatcher.prototype.parameters = function (opts) {
            if (opts === void 0) {
                opts = {};
            }
            if (opts.inherit === false)
                return this._params;
            return unnest(this._cache.path.map(function (matcher) {
                return matcher._params;
            }));
        };

        UrlMatcher.prototype.parameter = function (id, opts) {
            var _this = this;
            if (opts === void 0) {
                opts = {};
            }
            var findParam = function () {
                for (var _i = 0, _a = _this._params; _i < _a.length; _i++) {
                    var param = _a[_i];
                    if (param.id === id)
                        return param;
                }
            };
            var parent = this._cache.parent;
            return findParam() || (opts.inherit !== false && parent && parent.parameter(id, opts)) || null;
        };

        UrlMatcher.prototype.validates = function (params) {
            var validParamVal = function (param, val) {
                return !param || param.validates(val);
            };
            params = params || {};
            // I'm not sure why this checks only the param keys passed in, and not all the params known to the matcher
            var paramSchema = this.parameters().filter(function (paramDef) {
                return params.hasOwnProperty(paramDef.id);
            });
            return paramSchema.map(function (paramDef) {
                return validParamVal(paramDef, params[paramDef.id]);
            }).reduce(allTrueR, true);
        };

        UrlMatcher.prototype.format = function (values$$1) {
            if (values$$1 === void 0) {
                values$$1 = {};
            }
            // Build the full path of UrlMatchers (including all parent UrlMatchers)
            var urlMatchers = this._cache.path;
            // Extract all the static segments and Params (processed as ParamDetails)
            // into an ordered array
            var pathSegmentsAndParams = urlMatchers.map(UrlMatcher.pathSegmentsAndParams)
                .reduce(unnestR, [])
                .map(function (x) {
                    return _.isString(x) ? x : getDetails(x);
                });
            // Extract the query params into a separate array
            var queryParams = urlMatchers.map(UrlMatcher.queryParams)
                .reduce(unnestR, [])
                .map(getDetails);
            var isInvalid = function (param) {
                return param.isValid === false;
            };
            if (pathSegmentsAndParams.concat(queryParams).filter(isInvalid).length) {
                return null;
            }
            /**
             * Given a Param, applies the parameter value, then returns detailed information about it
             */
            function getDetails(param) {
                // Normalize to typed value
                var value = param.value(values$$1[param.id]);
                var isValid = param.validates(value);
                var isDefaultValue = param.isDefaultValue(value);
                // Check if we're in squash mode for the parameter
                var squash = isDefaultValue ? param.squash : false;
                // Allow the Parameter's Type to encode the value
                var encoded = param.type.encode(value);
                return {
                    param: param,
                    value: value,
                    isValid: isValid,
                    isDefaultValue: isDefaultValue,
                    squash: squash,
                    encoded: encoded
                };
            }
            // Build up the path-portion from the list of static segments and parameters
            var pathString = pathSegmentsAndParams.reduce(function (acc, x) {
                // The element is a static segment (a raw string); just append it
                if (_.isString(x))
                    return acc + x;
                // Otherwise, it's a ParamDetails.
                var squash = x.squash,
                    encoded = x.encoded,
                    param = x.param;
                // If squash is === true, try to remove a slash from the path
                if (squash === true) {
                    return (acc.match(/\/$/)) ? acc.slice(0, -1) : acc;
                }
                // If squash is a string, use the string for the param value
                if (_.isString(squash)) {
                    return acc + squash;
                }
                if (squash !== false) {
                    return acc; // ?
                }
                if (encoded === null || encoded === undefined) {
                    return acc;
                }
                // If this parameter value is an array, encode the value using encodeDashes
                if (_.isArray(encoded)) {
                    return acc + map(encoded, UrlMatcher.encodeDashes).join('-');
                }
                // If the parameter type is "raw", then do not encodeURIComponent
                if (param.raw) {
                    return acc + encoded;
                }
                // Encode the value
                return acc + encodeURIComponent(encoded);
            }, '');
            // Build the query string by applying parameter values (array or regular)
            // then mapping to key=value, then flattening and joining using "&"
            var queryString = queryParams.map(function (paramDetails) {
                var param = paramDetails.param,
                    squash = paramDetails.squash,
                    encoded = paramDetails.encoded,
                    isDefaultValue = paramDetails.isDefaultValue;
                if (encoded === null || encoded === undefined || (isDefaultValue && squash !== false))
                    return;
                if (!_.isArray(encoded))
                    encoded = [encoded];
                if (encoded.length === 0)
                    return;
                if (!param.raw)
                    encoded = map(encoded, encodeURIComponent);
                return encoded.map(function (val) {
                    return param.id + '=' + val;
                });
            }).filter(identity).reduce(unnestR, []).join('&');
            // Concat the pathstring with the queryString (if exists) and the hashString (if exists)
            return pathString + (queryString ? '?' + queryString : '') + (values$$1['#'] ? '#' + values$$1['#'] : '');
        };
        /** @hidden */
        UrlMatcher.encodeDashes = function (str) {
            return encodeURIComponent(str).replace(/-/g, function (c) {
                return '%5C%' + c.charCodeAt(0).toString(16).toUpperCase();
            });
        };
        /** @hidden Given a matcher, return an array with the matcher's path segments and path params, in order */
        UrlMatcher.pathSegmentsAndParams = function (matcher) {
            var staticSegments = matcher._segments;
            var pathParams = matcher._params.filter(function (p) {
                return p.location === exports.DefType.PATH;
            });
            return arrayTuples(staticSegments, pathParams.concat(undefined))
                .reduce(unnestR, [])
                .filter(function (x) {
                    return x !== '' && isDefined(x);
                });
        };
        /** @hidden Given a matcher, return an array with the matcher's query params */
        UrlMatcher.queryParams = function (matcher) {
            return matcher._params.filter(function (p) {
                return p.location === exports.DefType.SEARCH;
            });
        };

        UrlMatcher.compare = function (a, b) {

            var segments = function (matcher) {

                matcher._cache.segments = matcher._cache.segments ||
                    matcher._cache.path.map(UrlMatcher.pathSegmentsAndParams)
                    .reduce(unnestR, [])
                    .reduce(joinNeighborsR, [])
                    .map(function (x) {
                        return _.isString(x) ? splitOnSlash(x) : x;
                    })
                    .reduce(unnestR, []);

					return matcher._cache.segments;
            };

            var weights = function (matcher) {
					matcher._cache.weights = matcher._cache.weights ||
						segments(matcher).map(function (segment) {
							// Sort slashes first, then static strings, the Params
							if (segment === '/')
								return 1;
							if (_.isString(segment))
								return 2;
							if (segment instanceof Param)
								return 3;
						});

					return matcher._cache.weights;
				},
				padArrays = function (l, r, padVal) {
					var len = Math.max(l.length, r.length);

					while (l.length < len) {
						l.push(padVal);
					}
					while (r.length < len) {
						r.push(padVal);
					}
				},
				weightsA = weights(a),
				weightsB = weights(b),
				cmp,
				i = 0,
				_pairs;

			padArrays(weightsA, weightsB, 0);

			_pairs = arrayTuples(weightsA, weightsB);

			for (i = 0; i < _pairs.length; i++) {
				cmp = _pairs[i][0] - _pairs[i][1];
				if (cmp !== 0)
					return cmp;
			}

			return 0;
        };

		UrlMatcher.nameValidator = /^\w+([-.]+\w+)*(?:\[\])?$/;

        return UrlMatcher;
    }());

    var UrlMatcherFactory = (function () {
        function UrlMatcherFactory() {
            var _this = this;

            this.paramTypes = new ParamTypes();
            this._isCaseInsensitive = false;
            this._isStrictMode = true;
            this._defaultSquashPolicy = false;
            this._getConfig = function (config) {
                return extend({
                    strict: _this._isStrictMode,
                    caseInsensitive: _this._isCaseInsensitive
                }, config);
            };
            this.paramFactory = {
                fromConfig: function (id, type, config) {
                    return new Param(id, type, config, exports.DefType.CONFIG, _this);
                },
                fromPath: function (id, type, config) {
                    return new Param(id, type, config, exports.DefType.PATH, _this);
                },
                fromSearch: function (id, type, config) {
                    return new Param(id, type, config, exports.DefType.SEARCH, _this);
                },
            };
            extend(this, {
                UrlMatcher: UrlMatcher,
                Param: Param
            });
        }
        /** @inheritdoc */
        UrlMatcherFactory.prototype.caseInsensitive = function (value) {
			this._isCaseInsensitive = isDefined(value) ? value : this._isCaseInsensitive;
            return this._isCaseInsensitive;
        };
        /** @inheritdoc */
        UrlMatcherFactory.prototype.strictMode = function (value) {
			this._isStrictMode = isDefined(value) ? value : this._isStrictMode;
            return this._isStrictMode;
        };
        /** @inheritdoc */
        UrlMatcherFactory.prototype.defaultSquashPolicy = function (value) {
            if (isDefined(value) && value !== true && value !== false && !_.isString(value)) {
                throw new Error('Invalid squash policy: ' + value + '. Valid policies: false, true, arbitrary-string');
            }

			this._defaultSquashPolicy = isDefined(value) ? value : this._defaultSquashPolicy;
            return this._defaultSquashPolicy;
        };

        UrlMatcherFactory.prototype.compile = function (pattern, config) {
            return new UrlMatcher(pattern, this.paramTypes, this.paramFactory, this._getConfig(config));
        };

        UrlMatcherFactory.prototype.isMatcher = function (object) {
            // TODO: typeof?
            if (!_.isObject(object))
                return false;
            var result = true;
            forEach(UrlMatcher.prototype, function (val, name) {
                if (_.isFunction(val))
                    result = result && (isDefined(object[name]) && _.isFunction(object[name]));
            });
            return result;
        };

        UrlMatcherFactory.prototype.type = function (name, definition, definitionFn) {
            var type = this.paramTypes.type(name, definition, definitionFn);
            return !isDefined(definition) ? type : this;
        };

        /** @hidden */
        UrlMatcherFactory.prototype.$get = function () {
            this.paramTypes.enqueue = false;
            this.paramTypes._flushTypeQueue();
            return this;
        };

        /** @internalapi */
        UrlMatcherFactory.prototype.dispose = function () {
            this.paramTypes.dispose();
        };
        return UrlMatcherFactory;
    }());

    var UrlRuleFactory = (function () {
        function UrlRuleFactory(router) {
            this.router = router;
        }
        UrlRuleFactory.prototype.compile = function (str) {
            return this.router.urlMatcherFactory.compile(str);
        };
        UrlRuleFactory.prototype.create = function (what, handler) {
            var _this = this;
            var makeRule = pattern([
                [_.isString, function (_what) {
                    return makeRule(_this.compile(_what));
                }],
                [is(UrlMatcher), function (_what) {
                    return _this.fromUrlMatcher(_what, handler);
                }],
                [isState, function (_what) {
                    return _this.fromState(_what, _this.router);
                }],
                [is(RegExp), function (_what) {
                    return _this.fromRegExp(_what, handler);
                }],
                [_.isFunction, function (_what) {
                    return new BaseUrlRule(_what, handler);
                }],
            ]);
            var rule = makeRule(what);
            if (!rule)
                throw new Error("invalid 'what' in when()");
            return rule;
        };

        UrlRuleFactory.prototype.fromUrlMatcher = function (urlMatcher, handler) {
            var _handler = handler;
            if (_.isString(handler))
                handler = this.router.urlMatcherFactory.compile(handler);
            if (is(UrlMatcher)(handler))
                _handler = function (match) {
                    return handler.format(match);
                };

            function matchUrlParamters(url) {
                var params = urlMatcher.exec(url.path, url.search, url.hash);
                return urlMatcher.validates(params) && params;
            }
 
            function matchPriority(params) {
                var optional = urlMatcher.parameters().filter(function (param) {
                    return param.isOptional;
                });
                if (!optional.length)
                    return 0.000001;
                var matched = optional.filter(function (param) {
                    return params[param.id];
                });
                return matched.length / optional.length;
            }
            var details = {
                urlMatcher: urlMatcher,
                matchPriority: matchPriority,
                type: 'URLMATCHER'
            };
            return extend(new BaseUrlRule(matchUrlParamters, _handler), details);
        };

        UrlRuleFactory.prototype.fromState = function (state, router) {

            var handler = function (match) {
                var $state = router.stateService;
                var globals = router.globals;
                if ($state.href(state, match) !== $state.href(globals.current, globals.params)) {
                    $state.transitionTo(state, match, {
                        inherit: true,
                        source: 'url'
                    });
                }
            };
            var details = {
                state: state,
                type: 'STATE'
            };
            return extend(this.fromUrlMatcher(state.url, handler), details);
        };

        UrlRuleFactory.prototype.fromRegExp = function (regexp, handler) {
            if (regexp.global || regexp.sticky)
                throw new Error('Rule RegExp must not be global or sticky');
 
            var redirectUrlTo = function (match) {
                // Interpolates matched values into $1 $2, etc using a String.replace()-style pattern
                return handler.replace(/\$(\$|\d{1,2})/, function (m, what) {
                    return match[what === '$' ? 0 : Number(what)];
                });
            };
            var _handler = _.isString(handler) ? redirectUrlTo : handler;
            var matchParamsFromRegexp = function (url) {
                return regexp.exec(url.path);
            };
            var details = {
                regexp: regexp,
                type: 'REGEXP'
            };
            return extend(new BaseUrlRule(matchParamsFromRegexp, _handler), details);
        };

		UrlRuleFactory.isUrlRule = function (obj) {
			return obj && ['type', 'match', 'handler'].every(function (key) {
				return isDefined(obj[key]);
			});
		};

        return UrlRuleFactory;
    }());

    var BaseUrlRule = (function () {
        function BaseUrlRule(match, handler) {
            var _this = this;
            this.match = match;
            this.type = 'RAW';
            this.matchPriority = function () {
                return 0 - _this.$id;
            };
            this.handler = handler || identity;
        }
        return BaseUrlRule;
    }());

    function appendBasePath(url, isHtml5, absolute, baseHref) {
        if (baseHref === '/')
            return url;
        if (isHtml5)
            return stripLastPathElement(baseHref) + url;
        if (absolute)
            return baseHref.slice(1) + url;
        return url;
    }

	var prioritySort = function (a, b) {
		return (b.priority || 0) - (a.priority || 0);
	};
	/** @hidden */
	var typeSort = function (a, b) {
		var weights = { 'STATE': 4, 'URLMATCHER': 4, 'REGEXP': 3, 'RAW': 2, 'OTHER': 1 };
		return (weights[a.type] || 0) - (weights[b.type] || 0);
	};
	/** @hidden */
	var urlMatcherSort = function (a, b) {
		return !a.urlMatcher || !b.urlMatcher ? 0 : UrlMatcher.compare(a.urlMatcher, b.urlMatcher);
	};
	/** @hidden */
	var idSort = function (a, b) {
		// Identically sorted STATE and URLMATCHER best rule will be chosen by `matchPriority` after each rule matches the URL
		var useMatchPriority = { STATE: true, URLMATCHER: true };
		var equal = useMatchPriority[a.type] && useMatchPriority[b.type];
		return equal ? 0 : (a.$id || 0) - (b.$id || 0);
	};

    var defaultRuleSortFn = function (a, b) {
		var cmp = prioritySort(a, b);

		if (cmp !== 0) {
			return cmp;
		}

		cmp = typeSort(a, b);

		if (cmp !== 0) {
			return cmp;
		}

		cmp = urlMatcherSort(a, b);

		if (cmp !== 0) {
			return cmp;
		}

		return idSort(a, b);
	};

    var UrlRouter = (function () {
        /** @hidden */
        function UrlRouter(router) {
            /** @hidden */
            this._sortFn = defaultRuleSortFn;
            /** @hidden */
            this._rules = [];
            /** @hidden */
            this.interceptDeferred = false;
            /** @hidden */
            this._id = 0;
            /** @hidden */
            this._sorted = false;
            this._router = router;
            this.urlRuleFactory = new UrlRuleFactory(router);
            createProxyFunctions(val(UrlRouter.prototype), this, val(this));
        }
        /** @internalapi */
        UrlRouter.prototype.dispose = function () {
            this.listen(false);
            this._rules = [];
            delete this._otherwiseFn;
        };
        /** @inheritdoc */
		UrlRouter.prototype.sort = function (compareFn) {
			this._rules = this.stableSort(this._rules, this._sortFn = compareFn || this._sortFn);
			this._sorted = true;
		};
        UrlRouter.prototype.ensureSorted = function () {
			if (!this._sorted) { this.sort(); }
        };
		UrlRouter.prototype.stableSort = function (arr, compareFn) {
			var arrOfWrapper = arr.map(function (elem, idx) { return ({ elem: elem, idx: idx }); });
			arrOfWrapper.sort(function (wrapperA, wrapperB) {
				var cmpDiff = compareFn(wrapperA.elem, wrapperB.elem);
				return cmpDiff === 0 ? wrapperA.idx - wrapperB.idx : cmpDiff;
			});
			return arrOfWrapper.map(function (wrapper) { return wrapper.elem; });
		};
        UrlRouter.prototype.match = function (url) {
            var _this = this;
            this.ensureSorted();
            url = extend({
                path: '',
                search: {},
                hash: ''
            }, url);
            var rules = this.rules();
            if (this._otherwiseFn)
                rules.push(this._otherwiseFn);
            // Checks a single rule. Returns { rule: rule, match: match, weight: weight } if it matched, or undefined
            var checkRule = function (rule) {
                var match = rule.match(url, _this._router);
                return match && {
                    match: match,
                    rule: rule,
                    weight: rule.matchPriority(match)
                };
            };

            var best;
            for (var i = 0; i < rules.length; i++) {
                // Stop when there is a 'best' rule and the next rule sorts differently than it.
                if (best && this._sortFn(rules[i], best.rule) !== 0)
                    break;
                var current = checkRule(rules[i]);
                // Pick the best MatchResult
                best = (!best || current && current.weight > best.weight) ? current : best;
            }
            return best;
        };
        /** @inheritdoc */
        UrlRouter.prototype.sync = function (evt) {
            if (evt && evt.defaultPrevented)
                return;
            var router = this._router,
                $url = router.urlService,
                $state = router.stateService;
            var url = {
                path: $url.path(),
                search: $url.search(),
                hash: $url.hash(),
            };
            var best = this.match(url);
            var applyResult = pattern([
                [_.isString, function (newurl) {
                    return $url.url(newurl, true);
                }],
                [TargetState.isDef, function (def) {
                    return $state.go(def.state, def.params, def.options);
                }],
                [is(TargetState), function (target) {
                    return $state.go(target.state(), target.params(), target.options());
                }],
            ]);
            applyResult(best && best.rule.handler(best.match, url, router));
        };

        UrlRouter.prototype.listen = function (enabled) {
            var _this = this;

            if (enabled === false) {
				if (this._stopFn) {
					this._stopFn();
				}
                delete this._stopFn;
            } else {
				this._stopFn = this._stopFn ||
					this._router.urlService.onChange(
						function (evt) { return _this.sync(evt); }
					);
				return this._stopFn;
            }
        };

        UrlRouter.prototype.update = function (read) {
            var $url = this._router.locationService;
			if (read) {
				this.location = $url.url();
				return;
			}
			if ($url.url() === this.location) {
				return;
			}

			$url.url(this.location, true);
        };

        UrlRouter.prototype.push = function (urlMatcher, params, options) {
            var replace = options && !!options.replace;
            this._router.urlService.url(urlMatcher.format(params || {}), replace);
        };

        UrlRouter.prototype.href = function (urlMatcher, params, options) {
            var url = urlMatcher.format(params),
				cfg,
				isHtml5,
				slash,
				cfgPort,
				port;

            if (url === null || url === undefined) {
                return null;
            }

            options = options || {
                absolute: false
            };

            cfg = this._router.urlService.config;
            isHtml5 = cfg.html5Mode();

            if (!isHtml5 && url !== null) {
                url = '#' + cfg.hashPrefix() + url;
            }

            url = appendBasePath(url, isHtml5, options.absolute, ng_from_import.baseHref);

            if (!options.absolute || !url) {
                return url;
            }

			slash = (!isHtml5 && url ? '/' : '');
			cfgPort = cfg.port();
			port = (cfgPort === 80 || cfgPort === 443 ? '' : ':' + cfgPort);

			return [cfg.protocol(), '://', cfg.host(), port, slash, url].join('');
        };

        UrlRouter.prototype.rule = function (rule) {
            var _this = this;
            if (!UrlRuleFactory.isUrlRule(rule))
                throw new Error('invalid rule');
            rule.$id = this._id++;
            rule.priority = rule.priority || 0;
            this._rules.push(rule);
            this._sorted = false;
            return function () {
                return _this.removeRule(rule);
            };
        };
        /** @inheritdoc */
        UrlRouter.prototype.removeRule = function (rule) {
            removeFrom(this._rules, rule);
        };
        /** @inheritdoc */
        UrlRouter.prototype.rules = function () {
            this.ensureSorted();
            return this._rules.slice();
        };
        /** @inheritdoc */
        UrlRouter.prototype.otherwise = function (handler) {
            var handlerFn = getHandlerFn(handler);
            this._otherwiseFn = this.urlRuleFactory.create(val(true), handlerFn);
            this._sorted = false;
        };

        /** @inheritdoc */
        UrlRouter.prototype.initial = function (handler) {
            var handlerFn = getHandlerFn(handler);
            var matchFn = function (urlParts, router) {
                return router.globals.transitionHistory.size() === 0 && !!/^\/?$/.exec(urlParts.path);
            };
            this.rule(this.urlRuleFactory.create(matchFn, handlerFn));
        };

        UrlRouter.prototype.when = function (matcher, handler, options) {
            var rule = this.urlRuleFactory.create(matcher, handler);
            if (isDefined(options && options.priority))
                rule.priority = options.priority;
            this.rule(rule);
            return rule;
        };

        UrlRouter.prototype.deferIntercept = function (defer) {
            if (defer === undefined)
                defer = true;
            this.interceptDeferred = defer;
        };

        return UrlRouter;
    }());

    function getHandlerFn(handler) {
        if (!_.isFunction(handler) && !_.isString(handler) && !is(TargetState)(handler) && !TargetState.isDef(handler)) {
            throw new Error("'handler' must be a string, function, TargetState, or have a state: 'newtarget' property");
        }
        return _.isFunction(handler) ? handler : val(handler);
    }

    var ViewService = (function () {

        function ViewService() {
            var _this = this;

            this._uiViews = [];
            this._viewConfigs = [];
            this._viewConfigFactories = {};
			this._listeners = [];
            this._pluginapi = {
				_rootViewContext: this._rootViewContext.bind(this),
				_viewConfigFactory: this._viewConfigFactory.bind(this),
				_registeredUIViews: function () { return _this._uiViews; },
				_activeViewConfigs: function () { return _this._viewConfigs; },
				_onSync: function (listener) {
					_this._listeners.push(listener);
					return function () { return removeFrom(_this._listeners, listener); };
				}
            };
        }

        ViewService.prototype._rootViewContext = function (context) {
            this._rootContext = context || this._rootContext;
			return this._rootContext;
        };

        ViewService.prototype._viewConfigFactory = function (viewType, factory) {
            this._viewConfigFactories[viewType] = factory;
        };
        ViewService.prototype.createViewConfig = function (path, decl) {
            var cfgFactory = this._viewConfigFactories[decl.$type];
            if (!cfgFactory)
                throw new Error('ViewService: No view config factory registered for type ' + decl.$type);
            var cfgs = cfgFactory(path, decl);
            return _.isArray(cfgs) ? cfgs : [cfgs];
        };

        ViewService.prototype.deactivateViewConfig = function (viewConfig) {
            trace.traceViewServiceEvent('<- Removing', viewConfig);
            removeFrom(this._viewConfigs, viewConfig);
        };
        ViewService.prototype.activateViewConfig = function (viewConfig) {
            trace.traceViewServiceEvent('-> Registering', viewConfig);
            this._viewConfigs.push(viewConfig);
        };
        ViewService.prototype.sync = function () {
            var _this = this;
            var uiViewsByFqn = this._uiViews.map(function (uiv) {
                return [uiv.fqn, uiv];
            }).reduce(applyPairs, {});
            // Return a weighted depth value for a uiView.
            // The depth is the nesting depth of ui-views (based on FQN; times 10,000)
            // plus the depth of the state that is populating the uiView
            function uiViewDepth(uiView) {
                var stateDepth = function (context) {
                    return context && context.parent ? stateDepth(context.parent) + 1 : 1;
                };
                return (uiView.fqn.split('.').length * 10000) + stateDepth(uiView.creationContext);
            }
            // Return the ViewConfig's context's depth in the context tree.
            function viewConfigDepth(config) {
                var context = config.viewDecl.$context,
                    count = 0;
                while (++count && context.parent)
                    context = context.parent;
                return count;
            }
            // Given a depth function, returns a compare function which can return either ascending or descending order
            var depthCompare = curry(function (depthFn, posNeg, left, right) {
                return posNeg * (depthFn(left) - depthFn(right));
            });
            var matchingConfigPair = function (uiView) {
                var matchingConfigs = _this._viewConfigs.filter(ViewService.matches(uiViewsByFqn, uiView));
                if (matchingConfigs.length > 1) {
                    // This is OK.  Child states can target a ui-view that the parent state also targets (the child wins)
                    // Sort by depth and return the match from the deepest child
                    // console.log(`Multiple matching view configs for ${uiView.fqn}`, matchingConfigs);
                    matchingConfigs.sort(depthCompare(viewConfigDepth, -1)); // descending
                }
                return { uiView: uiView, viewConfig: matchingConfigs[0] };
            };
			var configureUIView = function (tuple) {
				// If a parent ui-view is reconfigured, it could destroy child ui-views.
				// Before configuring a child ui-view, make sure it's still in the active uiViews array.
				if (_this._uiViews.indexOf(tuple.uiView) !== -1)
					tuple.uiView.configUpdated(tuple.viewConfig);
			};
			// Sort views by FQN and state depth. Process uiviews nearest the root first.
			var uiViewTuples = this._uiViews.sort(depthCompare(uiViewDepth, 1)).map(matchingConfigPair);
			var matchedViewConfigs = uiViewTuples.map(function (tuple) { return tuple.viewConfig; });
			var unmatchedConfigTuples = this._viewConfigs
				.filter(function (config) { return inArray(matchedViewConfigs, config); })
				.map(function (viewConfig) { return ({ uiView: undefined, viewConfig: viewConfig }); });
			var allTuples = uiViewTuples.concat(unmatchedConfigTuples);
			uiViewTuples.forEach(configureUIView);
			this._listeners.forEach(function (cb) { return cb(allTuples); });
			trace.traceViewSync(allTuples);
        };

        ViewService.prototype.registerUIView = function (uiView) {
            trace.traceViewServiceUIViewEvent('-> Registering', uiView);
			var uiViews = this._uiViews;
			var fqnAndTypeMatches = function (uiv) { return uiv.fqn === uiView.fqn && uiv.$type === uiView.$type; };

			if (uiViews.filter(fqnAndTypeMatches).length) {
				trace.traceViewServiceUIViewEvent('!!!! duplicate uiView named:', uiView);
			}
            uiViews.push(uiView);
            this.sync();
            return function () {
                var idx = uiViews.indexOf(uiView);
                if (idx === -1) {
                    trace.traceViewServiceUIViewEvent('Tried removing non-registered uiView', uiView);
                    return;
                }
                trace.traceViewServiceUIViewEvent('<- Deregistering', uiView);
                removeFrom(uiViews)(uiView);
            };
        };

        ViewService.prototype.available = function () {
            return this._uiViews.map(prop('fqn'));
        };

        ViewService.prototype.active = function () {
            return this._uiViews.filter(prop('$config')).map(prop('name'));
        };

        ViewService.normalizeUIViewTarget = function (context, rawViewName) {
            if (rawViewName === void 0) {
                rawViewName = '';
            }
            // TODO: Validate incoming view name with a regexp to allow:
            // ex: "view.name@foo.bar" , "^.^.view.name" , "view.name@^.^" , "" ,
            // "@" , "$default@^" , "!$default.$default" , "!foo.bar"
            var viewAtContext = rawViewName.split('@');
            var uiViewName = viewAtContext[0] || '$default'; // default to unnamed view
            var uiViewContextAnchor = _.isString(viewAtContext[1]) ? viewAtContext[1] : '^'; // default to parent context
            // Handle relative view-name sugar syntax.
            // Matches rawViewName "^.^.^.foo.bar" into array: ["^.^.^.foo.bar", "^.^.^", "foo.bar"],
            var relativeViewNameSugar = /^(\^(?:\.\^)*)\.(.*$)/.exec(uiViewName);
            if (relativeViewNameSugar) {
                // Clobbers existing contextAnchor (rawViewName validation will fix this)
                uiViewContextAnchor = relativeViewNameSugar[1]; // set anchor to "^.^.^"
                uiViewName = relativeViewNameSugar[2]; // set view-name to "foo.bar"
            }
            if (uiViewName.charAt(0) === '!') {
                uiViewName = uiViewName.substr(1);
                uiViewContextAnchor = ''; // target absolutely from root
            }
            // handle parent relative targeting "^.^.^"
            var relativeMatch = /^(\^(?:\.\^)*)$/;
            if (relativeMatch.exec(uiViewContextAnchor)) {
                var anchor = uiViewContextAnchor.split('.').reduce((function (anchor) {
                    return anchor.parent;
                }), context);
                uiViewContextAnchor = anchor.name;
            } else if (uiViewContextAnchor === '.') {
                uiViewContextAnchor = context.name;
            }
            return {
                uiViewName: uiViewName,
                uiViewContextAnchor: uiViewContextAnchor
            };
        };
        return ViewService;
    }());

    ViewService.matches = function (uiViewsByFqn, uiView) {
		return function (viewConfig) {
			// Don't supply an ng1 ui-view with an ng2 ViewConfig, etc
			if (uiView.$type !== viewConfig.viewDecl.$type) {
				return false;
			}
			// Split names apart from both viewConfig and uiView into segments
			var vc = viewConfig.viewDecl;
			var vcSegments = vc.$uiViewName.split('.');
			var uivSegments = uiView.fqn.split('.');
			// Check if the tails of the segment arrays match. ex, these arrays' tails match:
			// vc: ["foo", "bar"], uiv fqn: ["$default", "foo", "bar"]
			if (!equals(vcSegments, uivSegments.slice(0 - vcSegments.length))) {
				return false;
			}
			// Now check if the fqn ending at the first segment of the viewConfig matches the context:
			// ["$default", "foo"].join(".") == "$default.foo", does the ui-view $default.foo context match?
			var negOffset = (1 - vcSegments.length) || undefined;
			var fqnToFirstSegment = uivSegments.slice(0, negOffset).join('.');
			var uiViewContext = uiViewsByFqn[fqnToFirstSegment].creationContext;

			return vc.$uiViewContextAnchor === (uiViewContext && uiViewContext.name);
		};
	};

    var UIRouterGlobals = (function () {
        function UIRouterGlobals() {

            this.params = new StateParams();
            /** @internalapi */
            this.lastStartedTransitionId = -1;
            /** @internalapi */
            this.transitionHistory = new Queue([], 1);
            /** @internalapi */
            this.successfulTransitions = new Queue([], 1);
        }
        UIRouterGlobals.prototype.dispose = function () {
            this.transitionHistory.clear();
            this.successfulTransitions.clear();
            this.transition = null;
        };
        return UIRouterGlobals;
    }());

    var makeStub = function (keys) {
        return keys.reduce(function (acc, key) {
            return (acc[key] = notImplemented(key), acc);
        }, {
            dispose: noop_rt
        });
    };
    /** @hidden */
    var locationServicesFns = ['url', 'path', 'search', 'hash', 'onChange'];
    /** @hidden */
    var locationConfigFns = ['port', 'protocol', 'host', 'baseHref', 'html5Mode', 'hashPrefix'];
    /** @hidden */
    var umfFns = ['type', 'caseInsensitive', 'strictMode', 'defaultSquashPolicy'];
    /** @hidden */
    var rulesFns = ['sort', 'when', 'initial', 'otherwise', 'rules', 'rule', 'removeRule'];
    /** @hidden */
    var syncFns = ['deferIntercept', 'listen', 'sync', 'match'];
    /**
     * API for URL management
     */
    var UrlService = (function () {
        /** @hidden */
        function UrlService(router, lateBind) {
            if (lateBind === void 0) {
                lateBind = true;
            }
            this.router = router;
            this.rules = {};
            this.config = {};
            // proxy function calls from UrlService to the LocationService/LocationConfig
            var locationServices = function () {
                return router.locationService;
            };
            createProxyFunctions(locationServices, this, locationServices, locationServicesFns, lateBind);
            var locationConfig = function () {
                return router.locationConfig;
            };
            createProxyFunctions(locationConfig, this.config, locationConfig, locationConfigFns, lateBind);
            var umf = function () {
                return router.urlMatcherFactory;
            };
            createProxyFunctions(umf, this.config, umf, umfFns);
            var urlRouter = function () {
                return router.urlRouter;
            };
            createProxyFunctions(urlRouter, this.rules, urlRouter, rulesFns);
            createProxyFunctions(urlRouter, this, urlRouter, syncFns);
        }
        UrlService.prototype.url = function () {
            return;
        };

        /** @inheritdoc */
        UrlService.prototype.path = function () {
            return;
        };

        /** @inheritdoc */
        UrlService.prototype.search = function () {
            return;
        };

        /** @inheritdoc */
        UrlService.prototype.hash = function () {
            return;
        };

        /** @inheritdoc */
        UrlService.prototype.onChange = function () {
            return;
        };

        UrlService.prototype.parts = function () {
            return {
                path: this.path(),
                search: this.search(),
                hash: this.hash()
            };
        };
        UrlService.prototype.dispose = function () {};
        /** @inheritdoc */
        UrlService.prototype.sync = function () {
            return;
        };
        /** @inheritdoc */
        UrlService.prototype.listen = function () {
            return;
        };

        /** @inheritdoc */
        UrlService.prototype.deferIntercept = function () {
            return;
        };
        /** @inheritdoc */
        UrlService.prototype.match = function () {
            return;
        };
		/** @hidden */
		UrlService.locationServiceStub = makeStub(locationServicesFns);
		/** @hidden */
		UrlService.locationConfigStub = makeStub(locationConfigFns);

        return UrlService;
    }());

    var _routerInstance = 0;

    var UIRouter = (function () {

        function UIRouter(locationService, locationConfig) {
            if (locationService === void 0) {
                locationService = UrlService.locationServiceStub;
            }
            if (locationConfig === void 0) {
                locationConfig = UrlService.locationConfigStub;
            }
            this.locationService = locationService;
            this.locationConfig = locationConfig;

            this.$id = _routerInstance++;
            this._disposed = false;
            this._disposables = [];
            this.trace = trace;
            this.viewService = new ViewService();
            this.globals = new UIRouterGlobals();
			this.transitionService = new TransitionService(this);
            this.urlMatcherFactory = new UrlMatcherFactory();
            this.urlRouter = new UrlRouter(this);
            this.stateRegistry = new StateRegistry(this);
            this.stateService = new StateService(this);
            this.urlService = new UrlService(this);
            this._plugins = {};
            this.viewService._pluginapi._rootViewContext(this.stateRegistry.root());
            this.globals.$current = this.stateRegistry.root();
            this.globals.current = this.globals.$current.self;
            this.disposable(this.globals);
            this.disposable(this.stateService);
            this.disposable(this.stateRegistry);
            this.disposable(this.transitionService);
            this.disposable(this.urlRouter);
            this.disposable(locationService);
            this.disposable(locationConfig);
        }

        UIRouter.prototype.disposable = function (disposable) {
            this._disposables.push(disposable);
        };

        UIRouter.prototype.dispose = function (disposable) {
            var _this = this;
            if (disposable && _.isFunction(disposable.dispose)) {
                disposable.dispose(this);
                return undefined;
            }
            this._disposed = true;
            this._disposables.slice().forEach(function (d) {
                try {
					if (typeof d.dispose === 'function') {
						d.dispose(_this);
					}

                    removeFrom(_this._disposables, d);
                } catch (ignored) {}
            });
        };

        UIRouter.prototype.plugin = function (plugin, options) {
            if (options === void 0) {
                options = {};
            }

            var pluginInstance = new plugin(this, options);

            if (!pluginInstance.name) {
                throw new Error("Required property `name` missing on plugin: " + pluginInstance);
            }
            this._disposables.push(pluginInstance);
            this._plugins[pluginInstance.name] = pluginInstance;
			return this._plugins[pluginInstance.name];
        };
        UIRouter.prototype.getPlugin = function (pluginName) {
            return pluginName ? this._plugins[pluginName] : values(this._plugins);
        };
        return UIRouter;
    }());

	function addCoreResolvables(trans) {
		trans.addResolvable(Resolvable.fromData(UIRouter, trans.router), '');
		trans.addResolvable(Resolvable.fromData(Transition, trans), '');
		trans.addResolvable(Resolvable.fromData('$transition$', trans), '');
		trans.addResolvable(Resolvable.fromData('$stateParams', trans.params()), '');
		trans.entering().forEach(function (state) {
			trans.addResolvable(Resolvable.fromData('$state$', state), state);
		});
	}

    var registerAddCoreResolvables = function (transitionService) {
        return transitionService.onCreate({}, addCoreResolvables);
    };

	var TRANSITION_TOKENS = ['$transition$', Transition],
		isTransition = inArray(TRANSITION_TOKENS);

	var treeChangesCleanup = function (trans) {
    
		var replaceTransitionWithNull = function (r) {
				return isTransition(r.token) ? Resolvable.fromData(r.token, null) : r;
			},
			cleanPath = function (path) {
				return path.map(
					function (node) {
						var resolvables = node.resolvables.map(replaceTransitionWithNull);

						return extend(node.clone(), { resolvables: resolvables });
					}
				);
			},
			treeChanges = trans.treeChanges();

		mapObj(treeChanges, cleanPath, treeChanges);
	};

    var redirectToHook = function (trans) {
        var redirect = trans.to().redirectTo;

        if (!redirect) {
            return;
        }

        var $state = trans.router.stateService;

        function handleResult(result) {
            if (!result) {
                return;
            }
            if (result instanceof TargetState) {
                return result;
            }
            if (_.isString(result)) {
                return $state.target(result, trans.params(), trans.options());
            }
            if (result.state || result.params) {
                return $state.target(result.state || trans.to(), result.params || trans.params(), trans.options());
            }
        }

        if (_.isFunction(redirect)) {
            return services.$q.when(services.$q.defer('ui_router_redirect_when'), redirect(trans)).then(handleResult);
        }

        return handleResult(redirect);
    };

    var registerRedirectToHook = function (transitionService) {
        return transitionService.onStart({
            to: function (state) {
                return !!state.redirectTo;
            }
        }, redirectToHook);
    };

    function makeEnterExitRetainHook(hookName) {
        return function (transition, state) {
            var _state = state.$$state();
            var hookFn = _state[hookName];
            return hookFn(transition, state);
        };
    }

    var onExitHook = makeEnterExitRetainHook('onExit');
    var registerOnExitHook = function (transitionService) {
        return transitionService.onExit({
            exiting: function (state) {
                return !!state.onExit;
            }
        }, onExitHook);
    };

    var onRetainHook = makeEnterExitRetainHook('onRetain');
    var registerOnRetainHook = function (transitionService) {
        return transitionService.onRetain({
            retained: function (state) {
                return !!state.onRetain;
            }
        }, onRetainHook);
    };

    var onEnterHook = makeEnterExitRetainHook('onEnter');
    var registerOnEnterHook = function (transitionService) {
        return transitionService.onEnter({
            entering: function (state) {
                return !!state.onEnter;
            }
        }, onEnterHook);
    };

	var RESOLVE_HOOK_PRIORITY = 1000;

    var eagerResolvePath = function (trans) {
        return new ResolveContext(trans.treeChanges().to)
            .resolvePath('EAGER', trans);
    };
    var registerEagerResolvePath = function (transitionService) {
        return transitionService.onStart({}, eagerResolvePath, { priority: RESOLVE_HOOK_PRIORITY });
    };

    var lazyResolveState = function (trans, state) {
        return new ResolveContext(trans.treeChanges().to)
            .subContext(state.$$state())
            .resolvePath('LAZY', trans);
    };

    var registerLazyResolveState = function (transitionService) {
        return transitionService.onEnter(
					{ entering: val(true) },
					lazyResolveState,
					{ priority: RESOLVE_HOOK_PRIORITY }
				);
    };

	var resolveRemaining = function (trans) {
			return new ResolveContext(trans.treeChanges().to)
				.resolvePath('LAZY', trans);
	};

	var registerResolveRemaining = function (transitionService) {
		return transitionService.onFinish({}, resolveRemaining, { priority: RESOLVE_HOOK_PRIORITY });
	};

    var loadEnteringViews = function (transition) {
        var $q = services.$q,
			enteringViews = transition.views('entering');

        if (!enteringViews.length) { return; }

        return $q.all(
				$q.defer('ui_router_loadenteringviews_all'),
				enteringViews.map(
					function (view) {
						return $q.when($q.defer('ui_router_loadenteringviews_when'), view.load());
					}
				)
			).then(noop_rt);
    };
    var registerLoadEnteringViews = function (transitionService) {
        return transitionService.onFinish({}, loadEnteringViews);
    };

    var activateViews = function (transition) {
        var enteringViews = transition.views('entering');
        var exitingViews = transition.views('exiting');
        if (!enteringViews.length && !exitingViews.length)
            return;
        var $view = transition.router.viewService;
        exitingViews.forEach(function (vc) {
            return $view.deactivateViewConfig(vc);
        });
        enteringViews.forEach(function (vc) {
            return $view.activateViewConfig(vc);
        });
        $view.sync();
    };
    var registerActivateViews = function (transitionService) {
        return transitionService.onSuccess({}, activateViews);
    };

    var updateGlobalState = function (trans) {
        var globals = trans.router.globals;
        var transitionSuccessful = function () {
            globals.successfulTransitions.enqueue(trans);
            globals.$current = trans.$to();
            globals.current = globals.$current.self;
            copy(trans.params(), globals.params);
        };
        var clearCurrentTransition = function () {
            // Do not clear globals.transition if a different transition has started in the meantime
            if (globals.transition === trans)
                globals.transition = null;
        };
        trans.onSuccess({}, transitionSuccessful, {
            priority: 10000
        });
        trans.promise.then(clearCurrentTransition, clearCurrentTransition);
    };

    var registerUpdateGlobalState = function (transitionService) {
        return transitionService.onCreate({}, updateGlobalState);
    };

    var registerUpdateUrl = function (transitionService) {

		var temp_ru = 'ng.ui.router - registerUpdateUrl',
			tran_serv,
			updateUrl;

		msos_debug(temp_ru + ' -> start.');

		updateUrl = function (transition) {
			var options = transition.options(),
				$state = transition.router.stateService,
				$urlRouter = transition.router.urlRouter,
				dbug = 'skipped.';

			msos_debug(temp_ru + ' - updateUrl -> start, options:', options);

			if (options.source !== 'url' && options.location && $state.$current.navigable) {
				var urlOptions = {
					replace: options.location === 'replace'
				};
				$urlRouter.push($state.$current.navigable.url, $state.params, urlOptions);
				dbug = 'location replace.';
			}

			$urlRouter.update(true);

			msos_debug(temp_ru + ' - updateUrl ->  done, ' + dbug);
		};

        tran_serv = transitionService.onSuccess(
			{},
			updateUrl,
			{ priority: 9999 }
		);

		msos_debug(temp_ru + ' ->  done!');
		return tran_serv;
    };

    var lazyLoadHook = function (transition) {
        var router = transition.router;

        function retryTransition() {
            if (transition.originalTransition().options().source !== 'url') {
                // The original transition was not triggered via url sync
                // The lazy state should be loaded now, so re-try the original transition
                var orig = transition.targetState();
                return router.stateService.target(orig.identifier(), orig.params(), orig.options());
            }
            // The original transition was triggered via url sync
            // Run the URL rules and find the best match
            var $url = router.urlService;
            var result = $url.match($url.parts());
            var rule = result && result.rule;
            // If the best match is a state, redirect the transition (instead
            // of calling sync() which supersedes the current transition)
            if (rule && rule.type === 'STATE') {
                var state = rule.state;
                var params = result.match;
                return router.stateService.target(state, params, transition.options());
            }
            // No matching state found, so let .sync() choose the best non-state match/otherwise
            router.urlService.sync();
        }
        var promises = transition.entering()
            .filter(function (state) {
                return !!state.$$state().lazyLoad;
            })
            .map(function (state) {
                return lazyLoadState(transition, state);
            });
        return services.$q.all(services.$q.defer('ui_router_loadenteringviews_when'), promises).then(retryTransition);
    };
    var registerLazyLoadHook = function (transitionService) {
        return transitionService.onBefore({
            entering: function (state) {
                return !!state.lazyLoad;
            }
        }, lazyLoadHook);
    };

    function lazyLoadState(transition, state) {
        var lazyLoadFn = state.$$state().lazyLoad;
        // Store/get the lazy load promise on/from the hookfn so it doesn't get re-invoked
        var promise = lazyLoadFn._promise;
        if (!promise) {
            var success = function (result) {
                delete state.lazyLoad;
                delete state.$$state().lazyLoad;
                delete lazyLoadFn._promise;
                return result;
            };
            var error = function (err) {
                delete lazyLoadFn._promise;
                return services.$q.reject(services.$q.defer('ui_router_lazyloadstate_reject'), err);
            };
            promise = lazyLoadFn._promise =
                services.$q.when(
                    services.$q.defer('ui_router_lazyloadstate_when'), lazyLoadFn(transition, state))
                .then(updateStateRegistry)
                .then(success, error);
        }
        /** Register any lazy loaded state definitions */
        function updateStateRegistry(result) {
            if (result && _.isArray(result.states)) {
                result.states.forEach(function (_state) {
                    return transition.router.stateRegistry.register(_state);
                });
            }
            return result;
        }
        return promise;
    }

    var TransitionEventType = (function () {
        function TransitionEventType(name, hookPhase, hookOrder, criteriaMatchPath, reverseSort, getResultHandler, getErrorHandler, synchronous) {
            if (reverseSort === void 0) {
                reverseSort = false;
            }
            if (getResultHandler === void 0) {
                getResultHandler = TransitionHook.HANDLE_RESULT;
            }
            if (getErrorHandler === void 0) {
                getErrorHandler = TransitionHook.REJECT_ERROR;
            }
            if (synchronous === void 0) {
                synchronous = false;
            }
            this.name = name;
            this.hookPhase = hookPhase;
            this.hookOrder = hookOrder;
            this.criteriaMatchPath = criteriaMatchPath;
            this.reverseSort = reverseSort;
            this.getResultHandler = getResultHandler;
            this.getErrorHandler = getErrorHandler;
            this.synchronous = synchronous;
        }
        return TransitionEventType;
    }());

    function ignoredHook(trans) {
        var ignoredReason = trans._ignoredReason();
        if (!ignoredReason)
            return;
        trace.traceTransitionIgnored(trans);
        var pending = trans.router.globals.transition;

        if (ignoredReason === 'SameAsCurrent' && pending) {
            pending.abort();
        }
        return Rejection.ignored().toPromise();
    }
    var registerIgnoredTransitionHook = function (transitionService) {
        return transitionService.onBefore({}, ignoredHook, {
            priority: -9999
        });
    };

    function invalidTransitionHook(trans) {
        if (!trans.valid()) {
            throw new Error(trans.error());
        }
    }
    var registerInvalidTransitionHook = function (transitionService) {
        return transitionService.onBefore({}, invalidTransitionHook, {
            priority: -10000
        });
    };

    var defaultTransOpts = {
        location: true,
        relative: null,
        inherit: false,
        notify: true,
        reload: false,
        custom: {},
        current: function () {
            return null;
        },
        source: 'unknown'
    };

    var TransitionService = (function () {

        function TransitionService(_router) {

            this._transitionCount = 0;
            this._eventTypes = [];
            this._registeredHooks = {};
            this._criteriaPaths = {};
            this._router = _router;
            this.$view = _router.viewService;
            this._deregisterHookFns = {};
            this._pluginapi = createProxyFunctions(val(this), {}, val(this), [
                '_definePathType',
                '_defineEvent',
                '_getPathTypes',
                '_getEvents',
                'getHooks',
            ]);
            this._defineCorePaths();
            this._defineCoreEvents();
            this._registerCoreTransitionHooks();
			_router.globals.successfulTransitions.onEvict(treeChangesCleanup);
        }

        TransitionService.prototype.onCreate = function () {
            return;
        };
        TransitionService.prototype.onBefore = function () {
            return;
        };
        TransitionService.prototype.onStart = function () {
            return;
        };
        TransitionService.prototype.onExit = function () {
            return;
        };
        TransitionService.prototype.onRetain = function () {
            return;
        };
        TransitionService.prototype.onEnter = function () {
            return;
        };
        TransitionService.prototype.onFinish = function () {
            return;
        };
        TransitionService.prototype.onSuccess = function () {
            return;
        };
        TransitionService.prototype.onError = function () {
            return;
        };
 
        TransitionService.prototype.dispose = function () {
            values(this._registeredHooks).forEach(function (hooksArray) {
                return hooksArray.forEach(function (hook) {
                    hook._deregistered = true;
                    removeFrom(hooksArray, hook);
                });
            });
        };

        TransitionService.prototype.create = function (fromPath, targetState) {
            return new Transition(fromPath, targetState, this._router);
        };

        TransitionService.prototype._defineCoreEvents = function () {
            var Phase = exports.TransitionHookPhase;
            var TH = TransitionHook;
            var paths = this._criteriaPaths;
            var NORMAL_SORT = false,
                REVERSE_SORT = true;
            var SYNCHRONOUS = true;

            this._defineEvent('onCreate', Phase.CREATE, 0, paths.to, NORMAL_SORT, TH.LOG_REJECTED_RESULT, TH.THROW_ERROR, SYNCHRONOUS);
            this._defineEvent('onBefore', Phase.BEFORE, 0, paths.to);
            this._defineEvent('onStart', Phase.RUN, 0, paths.to);
            this._defineEvent('onExit', Phase.RUN, 100, paths.exiting, REVERSE_SORT);
            this._defineEvent('onRetain', Phase.RUN, 200, paths.retained);
            this._defineEvent('onEnter', Phase.RUN, 300, paths.entering);
            this._defineEvent('onFinish', Phase.RUN, 400, paths.to);
            this._defineEvent('onSuccess', Phase.SUCCESS, 0, paths.to, NORMAL_SORT, TH.LOG_REJECTED_RESULT, TH.LOG_ERROR, SYNCHRONOUS);
            this._defineEvent('onError', Phase.ERROR, 0, paths.to, NORMAL_SORT, TH.LOG_REJECTED_RESULT, TH.LOG_ERROR, SYNCHRONOUS);
        };
        /** @hidden */
        TransitionService.prototype._defineCorePaths = function () {
            var STATE = exports.TransitionHookScope.STATE,
                TRANSITION = exports.TransitionHookScope.TRANSITION;
            this._definePathType('to', TRANSITION);
            this._definePathType('from', TRANSITION);
            this._definePathType('exiting', STATE);
            this._definePathType('retained', STATE);
            this._definePathType('entering', STATE);
        };
        /** @hidden */
        TransitionService.prototype._defineEvent = function (name, hookPhase, hookOrder, criteriaMatchPath, reverseSort, getResultHandler, getErrorHandler, synchronous) {
            if (reverseSort === void 0) {
                reverseSort = false;
            }
            if (getResultHandler === void 0) {
                getResultHandler = TransitionHook.HANDLE_RESULT;
            }
            if (getErrorHandler === void 0) {
                getErrorHandler = TransitionHook.REJECT_ERROR;
            }
            if (synchronous === void 0) {
                synchronous = false;
            }
            var eventType = new TransitionEventType(name, hookPhase, hookOrder, criteriaMatchPath, reverseSort, getResultHandler, getErrorHandler, synchronous);
            this._eventTypes.push(eventType);
            makeEvent(this, this, eventType);
        };

        /** @hidden */
        TransitionService.prototype._getEvents = function (phase) {
            var transitionHookTypes = isDefined(phase) ?
                this._eventTypes.filter(function (type) {
                    return type.hookPhase === phase;
                }) :
                this._eventTypes.slice();
            return transitionHookTypes.sort(function (l, r) {
                var cmpByPhase = l.hookPhase - r.hookPhase;
                return cmpByPhase === 0 ? l.hookOrder - r.hookOrder : cmpByPhase;
            });
        };

        TransitionService.prototype._definePathType = function (name, hookScope) {
            this._criteriaPaths[name] = {
                name: name,
                scope: hookScope
            };
        };
        /** * @hidden */
        TransitionService.prototype._getPathTypes = function () {
            return this._criteriaPaths;
        };
        /** @hidden */
        TransitionService.prototype.getHooks = function (hookName) {
            return this._registeredHooks[hookName];
        };
        /** @hidden */
        TransitionService.prototype._registerCoreTransitionHooks = function () {
            var fns = this._deregisterHookFns;
            fns.addCoreResolves = registerAddCoreResolvables(this);
            fns.ignored = registerIgnoredTransitionHook(this);
            fns.invalid = registerInvalidTransitionHook(this);
            // Wire up redirectTo hook
            fns.redirectTo = registerRedirectToHook(this);
            // Wire up onExit/Retain/Enter state hooks
            fns.onExit = registerOnExitHook(this);
            fns.onRetain = registerOnRetainHook(this);
            fns.onEnter = registerOnEnterHook(this);
            // Wire up Resolve hooks
            fns.eagerResolve = registerEagerResolvePath(this);
            fns.lazyResolve = registerLazyResolveState(this);
			fns.resolveAll = registerResolveRemaining(this);
            // Wire up the View management hooks
            fns.loadViews = registerLoadEnteringViews(this);
            fns.activateViews = registerActivateViews(this);
            // Updates global state after a transition
            fns.updateGlobals = registerUpdateGlobalState(this);
            // After globals.current is updated at priority: 10000
            fns.updateUrl = registerUpdateUrl(this);
            // Lazy load state trees
            fns.lazyLoad = registerLazyLoadHook(this);
        };

        return TransitionService;
    }());

    var StateService = (function () {
		var temp_ss = 'ng.ui.router - StateService';

        /** @internalapi */
        function StateService(router) {
            this.router = router;
            /** @internalapi */
            this.invalidCallbacks = [];
            /** @hidden */
            this._defaultErrorHandler = function $defaultErrorHandler($error$) {
                if ($error$ instanceof Error && $error$.stack) {
                    console.error($error$);
                    console.error($error$.stack);
                } else if ($error$ instanceof Rejection) {
                    console.error($error$.toString());
                    if ($error$.detail && $error$.detail.stack)
                        console.error($error$.detail.stack);
                } else {
                    console.error($error$);
                }
            };
            var getters = ['current', '$current', 'params', 'transition'];
            var boundFns = Object.keys(StateService.prototype).filter(not(inArray(getters)));
            createProxyFunctions(val(StateService.prototype), this, val(this), boundFns);
        }
        Object.defineProperty(StateService.prototype, 'transition', {

            get: function () {
                return this.router.globals.transition;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StateService.prototype, 'params', {
 
            get: function () {
                return this.router.globals.params;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StateService.prototype, 'current', {

            get: function () {
                return this.router.globals.current;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StateService.prototype, '$current', {
 
            get: function () {
                return this.router.globals.$current;
            },
            enumerable: true,
            configurable: true
        });
        /** @internalapi */
        StateService.prototype.dispose = function () {
            this.defaultErrorHandler(noop_rt);
            this.invalidCallbacks = [];
        };

        StateService.prototype._handleInvalidTargetState = function (fromPath, toState) {
            var _this = this;
            var fromState = PathUtils.makeTargetState(this.router.stateRegistry, fromPath);
            var globals = this.router.globals;
            var latestThing = function () {
                return globals.transitionHistory.peekTail();
            };
            var latest = latestThing();
            var callbackQueue = new Queue(this.invalidCallbacks.slice());
            var injector = new ResolveContext(fromPath).injector();
            var checkForRedirect = function (result) {
                if (!(result instanceof TargetState)) {
                    return;
                }
                var target = result;
                // Recreate the TargetState, in case the state is now defined.
                target = _this.target(target.identifier(), target.params(), target.options());
                if (!target.valid()) {
                    return Rejection.invalid(target.error()).toPromise();
                }
                if (latestThing() !== latest) {
                    return Rejection.superseded().toPromise();
                }
                return _this.transitionTo(target.identifier(), target.params(), target.options());
            };

            function invokeNextCallback() {
                var nextCallback = callbackQueue.dequeue();
                if (nextCallback === undefined)
                    return Rejection.invalid(toState.error()).toPromise();
                var callbackResult = services.$q.when(services.$q.defer('ui_router_invokenextcb_when'), nextCallback(toState, fromState, injector));
                return callbackResult.then(checkForRedirect).then(function (result) {
                    return result || invokeNextCallback();
                });
            }
            return invokeNextCallback();
        };

        StateService.prototype.onInvalid = function (callback) {
            this.invalidCallbacks.push(callback);
            return function deregisterListener() {
                removeFrom(this.invalidCallbacks)(callback);
            }.bind(this);
        };

        StateService.prototype.reload = function (reloadState) {
            return this.transitionTo(this.current, this.params, {
                reload: isDefined(reloadState) ? reloadState : true,
                inherit: false,
                notify: false,
            });
        };

        StateService.prototype.go = function (to, params, options) {
            var defautGoOpts = {
					relative: this.$current,
					inherit: true
				},
				transOpts = defaults(options, defautGoOpts, defaultTransOpts);

			if (msos_verbose) {
				msos_debug(temp_ss + ' - go -> called, transOpts:', transOpts);
			}

            return this.transitionTo(to, params, transOpts);
        };

        StateService.prototype.target = function (identifier, params, options) {
            if (options === void 0) {
                options = {};
            }
            // If we're reloading, find the state object to reload from
            if (_.isObject(options.reload) && !options.reload.name) {
                throw new Error('Invalid reload state object');
            }

            var reg = this.router.stateRegistry;
            options.reloadState = options.reload === true ? reg.root() : reg.matcher.find(options.reload, options.relative);

            if (options.reload && !options.reloadState) {
                throw new Error("No such reload state '" + (_.isString(options.reload) ? options.reload : options.reload.name) + "'");
            }

			return new TargetState(this.router.stateRegistry, identifier, params, options);
        };

        StateService.prototype.getCurrentPath = function () {
            var _this = this;
            var globals = this.router.globals;
            var latestSuccess = globals.successfulTransitions.peekTail();
            var rootPath = function () {
                return [new PathNode(_this.router.stateRegistry.root())];
            };
            return latestSuccess ? latestSuccess.treeChanges().to : rootPath();
        };

        StateService.prototype.transitionTo = function (to, toParams, options) {
            var _this = this;
            if (toParams === void 0) {
                toParams = {};
            }
            if (options === void 0) {
                options = {};
            }
            var router = this.router;
            var globals = router.globals;
            options = defaults(options, defaultTransOpts);
            var getCurrent = function () {
                return globals.transition;
            };
            options = extend(options, {
                current: getCurrent
            });
            var ref = this.target(to, toParams, options);
            var currentPath = this.getCurrentPath();
            if (!ref.exists())
                return this._handleInvalidTargetState(currentPath, ref);
            if (!ref.valid())
                return silentRejection(ref.error());

            var rejectedTransitionHandler = function (_trans) {
                return function (error) {
                    if (error instanceof Rejection) {
                        var isLatest = router.globals.lastStartedTransitionId === _trans.$id;
                        if (error.type === exports.RejectType.IGNORED) {
							if (isLatest) {
								router.urlRouter.update();
							}
                            // Consider ignored `Transition.run()` as a successful `transitionTo`
                            return services.$q.when(services.$q.defer('ui_router_rejectedtransitionhandler_when'), globals.current);
                        }
                        var detail = error.detail;
                        if (error.type === exports.RejectType.SUPERSEDED && error.redirected && detail instanceof TargetState) {
                            // If `Transition.run()` was redirected, allow the `transitionTo()` promise to resolve successfully
                            // by returning the promise for the new (redirect) `Transition.run()`.
                            var redirect = _trans.redirect(detail);
                            return redirect.run().catch(rejectedTransitionHandler(redirect));
                        }
                        if (error.type === exports.RejectType.ABORTED) {
							if (isLatest) {
								router.urlRouter.update();
							}
                            return services.$q.reject(services.$q.defer('ui_router_rejectedtransition_abort_reject'), error);
                        }
                    }
                    var errorHandler = _this.defaultErrorHandler();
                    errorHandler(error);
                    return services.$q.reject(services.$q.defer('ui_router_rejectedtransition_default_reject'), error);
                };
            };
            var transition = this.router.transitionService.create(currentPath, ref);
            var transitionToPromise = transition.run().catch(rejectedTransitionHandler(transition));
            silenceUncaughtInPromise(transitionToPromise); // issue #2676
            // Return a promise for the transition, which also has the transition object on it.
            return extend(transitionToPromise, {
                transition: transition
            });
        };

        StateService.prototype.is = function (stateOrName, params, options) {
            options = defaults(options, {
                relative: this.$current
            });
            var state = this.router.stateRegistry.matcher.find(stateOrName, options.relative);
            if (!isDefined(state))
                return undefined;
            if (this.$current !== state)
                return false;
            if (!params)
                return true;
            var schema = state.parameters({
                inherit: true,
                matchingKeys: params
            });
            return Param.equals(schema, Param.values(schema, params), this.params);
        };

        StateService.prototype.includes = function (stateOrName, params, options) {
            options = defaults(options, {
                relative: this.$current
            });
            var glob = _.isString(stateOrName) && Glob.fromString(stateOrName);
            if (glob) {
                if (!glob.matches(this.$current.name))
                    return false;
                stateOrName = this.$current.name;
            }
            var state = this.router.stateRegistry.matcher.find(stateOrName, options.relative),
                include = this.$current.includes;
            if (!isDefined(state))
                return undefined;
            if (!isDefined(include[state.name]))
                return false;
            if (!params)
                return true;
            var schema = state.parameters({
                inherit: true,
                matchingKeys: params
            });
            return Param.equals(schema, Param.values(schema, params), this.params);
        };

        StateService.prototype.href = function (stateOrName, params, options) {
            var defaultHrefOpts = {
                lossy: true,
                inherit: true,
                absolute: false,
                relative: this.$current,
            };
            options = defaults(options, defaultHrefOpts);
            params = params || {};
            var state = this.router.stateRegistry.matcher.find(stateOrName, options.relative);
            if (!isDefined(state))
                return null;
            if (options.inherit)
                params = this.params.$inherit(params, this.$current, state);
            var nav = (state && options.lossy) ? state.navigable : state;
            if (!nav || nav.url === undefined || nav.url === null) {
                return null;
            }
            return this.router.urlRouter.href(nav.url, params, {
                absolute: options.absolute,
            });
        };

        StateService.prototype.defaultErrorHandler = function (handler) {
            this._defaultErrorHandler = handler || this._defaultErrorHandler;

			return this._defaultErrorHandler;
        };

        StateService.prototype.get = function (stateOrName, base) {
            var reg = this.router.stateRegistry;
            if (arguments.length === 0)
                return reg.get();
            return reg.get(stateOrName, base || this.$current);
        };

        StateService.prototype.lazyLoad = function (stateOrName, transition) {
            var state = this.get(stateOrName);
            if (!state || !state.lazyLoad)
                throw new Error('Can not lazy load ' + stateOrName);
            var currentPath = this.getCurrentPath();
            var target = PathUtils.makeTargetState(this.router.stateRegistry, currentPath);
            transition = transition || this.router.transitionService.create(currentPath, target);
            return lazyLoadState(transition, state);
        };
        return StateService;
    }());

    var beforeAfterSubstr$1 = function (char) {
        return function (str) {
            if (!str)
                return ['', ''];
            var idx = str.indexOf(char);
            if (idx === -1)
                return [str, ''];
            return [str.substr(0, idx), str.substr(idx + 1)];
        };
    };

	var stripLastPathElement = function (str) { return str.replace(/\/[^/]*$/, ''); };
    var splitHash = beforeAfterSubstr$1('#');
    var splitQuery = beforeAfterSubstr$1('?');
    var splitEqual = beforeAfterSubstr$1('=');
    var trimHashVal = function (str) {
        return str ? str.replace(/^#/, '') : '';
    };

	var keyValsToObjectR = function (accum, _a) {
		var key = _a[0],
			val = _a[1];

		if (!accum.hasOwnProperty(key)) {
			accum[key] = val;
		} else if (isArray(accum[key])) {
			accum[key].push(val);
		} else {
			accum[key] = [accum[key], val];
		}
		return accum;
	};
    var getParams = function (queryString) {
        return queryString.split('&').filter(identity).map(splitEqual).reduce(keyValsToObjectR, {});
    };

    function parseUrl$1(url) {
        var orEmptyString = function (x) {
            return x || '';
        };
        var _a = splitHash(url).map(orEmptyString),
            beforehash = _a[0],
            hash = _a[1];
        var _b = splitQuery(beforehash).map(orEmptyString),
            path = _b[0],
            search = _b[1];
        return {
            path: path,
            search: search,
            hash: hash,
            url: url
        };
    }
    var buildUrl = function (loc) {
        var path = loc.path();
        var searchObject = loc.search();
        var hash = loc.hash();
        var search = Object.keys(searchObject).map(function (key) {
            var param = searchObject[key];
            var vals = _.isArray(param) ? param : [param];
            return vals.map(function (val) {
                return key + '=' + val;
            });
        }).reduce(unnestR, []).join('&');
        return path + (search ? '?' + search : '') + (hash ? '#' + hash : '');
    };

    var BaseLocationServices = (function () {
        function BaseLocationServices(router, fireAfterUpdate) {
            var _this = this;
            this.fireAfterUpdate = fireAfterUpdate;
            this._listener = function (evt) {
                return _this._listeners.forEach(function (cb) {
                    return cb(evt);
                });
            };
            this._listeners = [];
            this.hash = function () {
                return parseUrl$1(_this._get()).hash;
            };
            this.path = function () {
                return parseUrl$1(_this._get()).path;
            };
            this.search = function () {
                return getParams(parseUrl$1(_this._get()).search);
            };
            this._location = window && window.location;
            this._history = window && window.history;
        }
        BaseLocationServices.prototype.url = function (url, replace) {
            if (replace === void 0) {
                replace = true;
            }

			if (isDefined(url) && url !== this._get()) {
				this._set(null, null, url, replace);
				if (this.fireAfterUpdate) {
					this._listeners.forEach(function (cb) { return cb({ url: url }); });
				}
			}

            return buildUrl(this);
        };
        BaseLocationServices.prototype.onChange = function (cb) {
            var _this = this;
            this._listeners.push(cb);
            return function () {
                return removeFrom(_this._listeners, cb);
            };
        };
        BaseLocationServices.prototype.dispose = function () {
            deregAll(this._listeners);
        };
        return BaseLocationServices;

    }());

    var __extends = (undefined && undefined.__extends) ||
			(function () {
				var extendStatics = Object.setPrototypeOf || function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

			return function (d, b) {
					extendStatics(d, b);
					var __ = function () { this.constructor = d; };
					d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
				};
			}());

    (function (_super) {

        function HashLocationService(router) {
            var _this = _super.call(this, router, false) || this;
            window.addEventListener('hashchange', _this._listener, false);
            return _this;
        }

		__extends(HashLocationService, _super);

        HashLocationService.prototype._get = function () {
            return trimHashVal(this._location.hash);
        };
        HashLocationService.prototype._set = function (state, title, url) {
            this._location.hash = url;
        };
        HashLocationService.prototype.dispose = function (router) {
            _super.prototype.dispose.call(this, router);
            window.removeEventListener('hashchange', this._listener);
        };
        return HashLocationService;
    }(BaseLocationServices));

    var __extends$1 = (undefined && undefined.__extends) || (function () {
		var extendStatics = Object.setPrototypeOf || function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

			return function (d, b) {
				extendStatics(d, b);
				var __ = function () { this.constructor = d; };
				d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
			};
		})();

    (function (_super) {

        function MemoryLocationService(router) {
            return _super.call(this, router, true) || this;
        }

		__extends$1(MemoryLocationService, _super);

        MemoryLocationService.prototype._get = function () {
            return this._url;
        };
        MemoryLocationService.prototype._set = function (state, title, url) {
            this._url = url;
        };
        return MemoryLocationService;
    }(BaseLocationServices));

    var __extends$2 = (undefined && undefined.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf || function (d, b) {
                for (var p in b)
                    if (b.hasOwnProperty(p)) d[p] = b[p];
            };

        return function (d, b) {
            extendStatics(d, b);
            var __ = function () { this.constructor = d; };
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();

    (function (_super) {

        function PushStateLocationService(router) {
            var _this = _super.call(this, router, true) || this;
            _this._config = router.urlService.config;
            window.addEventListener('popstate', _this._listener, false);
            return _this;
        }

		__extends$2(PushStateLocationService, _super);

		PushStateLocationService.prototype._getBasePrefix = function () {
			return stripLastPathElement(this._config.baseHref());
		};
		PushStateLocationService.prototype._get = function () {
			var _a = this._location,
				pathname = _a.pathname,
				hash = _a.hash,
				search = _a.search;

			search = splitQuery(search)[1]; // strip ? if found
			hash = splitHash(hash)[1]; // strip # if found

			var basePrefix = this._getBasePrefix();
			var exactBaseHrefMatch = pathname === this._config.baseHref();
			var startsWithBase = pathname.substr(0, basePrefix.length) === basePrefix;

			pathname = exactBaseHrefMatch ? '/' : startsWithBase ? pathname.substring(basePrefix.length) : pathname;
			return pathname + (search ? '?' + search : '') + (hash ? '#' + hash : '');
		};
		PushStateLocationService.prototype._set = function (state, title, url, replace) {
			var basePrefix = this._getBasePrefix();
			var slash = url && url[0] !== '/' ? '/' : '';
			var fullUrl = (url === '' || url === '/') ? this._config.baseHref() : basePrefix + slash + url;

			if (replace) {
				this._history.replaceState(state, title, fullUrl);
			} else {
				this._history.pushState(state, title, fullUrl);
			}
		};
        PushStateLocationService.prototype.dispose = function (router) {
            _super.prototype.dispose.call(this, router);
            window.removeEventListener('popstate', this._listener);
        };
        return PushStateLocationService;
    }(BaseLocationServices));

    function getNg1ViewConfigFactory() {
        var templateFactory = null;
        return function (path, view) {
            templateFactory = templateFactory || services.$injector.get('$templateFactory');
            return [new Ng1ViewConfig(path, view, templateFactory)];
        };
    }
    var hasAnyKey = function (keys, obj) {
        return keys.reduce(function (acc, key) {
            return acc || isDefined(obj[key]);
        }, false);
    };

    function ng1ViewsBuilder(state) {
        // Do not process root state
        if (!state.parent)
            return {};
        var tplKeys = ['templateProvider', 'templateUrl', 'template', 'notify', 'async'],
            ctrlKeys = ['controller', 'controllerProvider', 'controllerAs', 'resolveAs'],
            compKeys = ['component', 'bindings', 'componentProvider'],
            nonCompKeys = tplKeys.concat(ctrlKeys),
            allViewKeys = compKeys.concat(nonCompKeys);
        // Do not allow a state to have both state-level props and also a `views: {}` property.
        // A state without a `views: {}` property can declare properties for the `$default` view as properties of the state.
        // However, the `$default` approach should not be mixed with a separate `views: ` block.
        if (isDefined(state.views) && hasAnyKey(allViewKeys, state)) {
            throw new Error("State '" + state.name + "' has a 'views' object. " +
                "It cannot also have \"view properties\" at the state level.  " +
                "Move the following properties into a view (in the 'views' object): " +
                (" " + allViewKeys.filter(function (key) {
                    return isDefined(state[key]);
                }).join(", ")));
        }
        var views = {},
            viewsObject = state.views || {
                '$default': _.pick(state, allViewKeys)
            };
        forEach(viewsObject, function (config, name) {
            // Account for views: { "": { template... } }
            name = name || '$default';
            // Account for views: { header: "headerComponent" }
            if (_.isString(config))
                config = {
                    component: config
                };
            // Make a shallow copy of the config object
            config = extend({}, config);
            // Do not allow a view to mix props for component-style view with props for template/controller-style view
            if (hasAnyKey(compKeys, config) && hasAnyKey(nonCompKeys, config)) {
                throw new Error("Cannot combine: " + compKeys.join("|") + " with: " + nonCompKeys.join("|") + " in stateview: '" + name + "@" + state.name + "'");
            }
            config.resolveAs = config.resolveAs || '$resolve';
            config.$type = 'ng1';
            config.$context = state;
            config.$name = name;
            var normalized = ViewService.normalizeUIViewTarget(config.$context, config.$name);
            config.$uiViewName = normalized.uiViewName;
            config.$uiViewContextAnchor = normalized.uiViewContextAnchor;
            views[name] = config;
        });
		if (msos_verbose === 'router') {
			msos_debug('ng.ui.router - ng1ViewsBuilder -> called, views:', views);
		}
        return views;
    }
    var id$1 = 0;
    var Ng1ViewConfig = (function () {
        function Ng1ViewConfig(path, viewDecl, factory) {
            var _this = this;
            this.path = path;
            this.viewDecl = viewDecl;
            this.factory = factory;
            this.$id = id$1++;
            this.loaded = false;
            this.getTemplate = function (uiView, context) {
                return _this.component ? _this.factory.makeComponentTemplate(uiView, context, _this.component, _this.viewDecl.bindings) : _this.template;
            };
        }
        Ng1ViewConfig.prototype.load = function () {
            var _this = this;
            var $q = services.$q;
            var context = new ResolveContext(this.path);
            var params = this.path.reduce(function (acc, node) {
                return extend(acc, node.paramValues);
            }, {});
            var promises = {
                template: $q.when($q.defer('ui_router_Ng1viewconfig_tmpl_when'), this.factory.fromConfig(this.viewDecl, params, context)),
                controller: $q.when($q.defer('ui_router_Ng1viewconfig_ctrl_when'), this.getController(context))
            };
            return $q.all($q.defer('ui_router_Ng1viewconfig_all'), promises).then(function (results) {
                trace.traceViewServiceEvent('Loaded', _this);
                _this.controller = results.controller;
                extend(_this, results.template); // Either { template: "tpl" } or { component: "cmpName" }
                return _this;
            });
        };

        Ng1ViewConfig.prototype.getController = function (context) {
            var provider = this.viewDecl.controllerProvider;
            if (!isInjectable(provider))
                return this.viewDecl.controller;
            var deps = services.$injector.annotate(provider);
            var providerFn = _.isArray(provider) ? tail(provider) : provider;
            var resolvable = new Resolvable('', providerFn, deps);
            return resolvable.get(context);
        };
        return Ng1ViewConfig;
    }());

    var TemplateFactory = (function () {
        function TemplateFactory() {
            var _this = this;
            /** @hidden */
            this._useHttp = ng_from_import.version.minor < 3;
            /** @hidden */
            this.$get = ['$http', '$templateCache', '$injector', function ($http, $templateCache, $injector) {
                _this.$templateRequest = $injector.has && $injector.has('$templateRequest') && $injector.get('$templateRequest');
                _this.$http = $http;
                _this.$templateCache = $templateCache;
                return _this;
            }];
        }

        TemplateFactory.prototype.useHttpService = function (value) {
            this._useHttp = value;
        };

        TemplateFactory.prototype.fromConfig = function (config, params, context) {
            var defaultTemplate = '<ui-view></ui-view>';
            var asTemplate = function (result) {
                return services.$q.when(services.$q.defer('ui_router_templatefactory_tmpl_when'), result).then(function (str) {
                    return ({
                        template: str
                    });
                });
            };
            var asComponent = function (result) {
                return services.$q.when(services.$q.defer('ui_router_templatefactory_comp_when'), result).then(function (str) {
                    return ({
                        component: str
                    });
                });
            };
            return (isDefined(config.template) ? asTemplate(this.fromString(config.template, params)) :
                isDefined(config.templateUrl) ? asTemplate(this.fromUrl(config.templateUrl, params)) :
                isDefined(config.templateProvider) ? asTemplate(this.fromProvider(config.templateProvider, params, context)) :
                isDefined(config.component) ? asComponent(config.component) :
                isDefined(config.componentProvider) ? asComponent(this.fromComponentProvider(config.componentProvider, params, context)) :
                asTemplate(defaultTemplate));
        };

        TemplateFactory.prototype.fromString = function (template, params) {
            return _.isFunction(template) ? template(params) : template;
        };

        TemplateFactory.prototype.fromUrl = function (url, params) {
            if (_.isFunction(url))
                url = url(params);
            if (url === null || url === undefined)
                return null;
            if (this._useHttp) {
                return this.$http.get(url, {
                        cache: this.$templateCache,
                        headers: {
                            Accept: 'text/html'
                        }
                    })
                    .then(function (response) {
                        return response.data;
                    });
            }
            return this.$templateRequest(url);
        };

        TemplateFactory.prototype.fromProvider = function (provider, params, context) {
            var deps = services.$injector.annotate(provider);
            var providerFn = _.isArray(provider) ? tail(provider) : provider;
            var resolvable = new Resolvable('', providerFn, deps);
            return resolvable.get(context);
        };

        TemplateFactory.prototype.fromComponentProvider = function (provider, params, context) {
            var deps = services.$injector.annotate(provider);
            var providerFn = _.isArray(provider) ? tail(provider) : provider;
            var resolvable = new Resolvable('', providerFn, deps);
            return resolvable.get(context);
        };

        TemplateFactory.prototype.makeComponentTemplate = function (uiView, context, component, bindings) {
            bindings = bindings || {};
            // Bind once prefix
            var prefix = ng_from_import.version.minor >= 3 ? '::' : '';
            // Convert to kebob name. Add x- prefix if the string starts with `x-` or `data-`
            var kebob = function (camelCase) {
                var kebobed = kebobString(camelCase);
                return /^(x|data)-/.exec(kebobed) ? 'x-' + kebobed : kebobed;
            };
            var attributeTpl = function (input) {
                var name = input.name,
                    type = input.type;
                var attrName = kebob(name);
                // If the ui-view has an attribute which matches a binding on the routed component
                // then pass that attribute through to the routed component template.
                // Prefer ui-view wired mappings to resolve data, unless the resolve was explicitly bound using `bindings:`
                if (uiView.attr(attrName) && !bindings[name])
                    return attrName + "='" + uiView.attr(attrName) + "'";
                var resolveName = bindings[name] || name;
                // Pre-evaluate the expression for "@" bindings by enclosing in {{ }}
                // some-attr="{{ ::$resolve.someResolveName }}"
                if (type === '@')
                    return attrName + "='{{" + prefix + "$resolve." + resolveName + "}}'";
                // Wire "&" callbacks to resolves that return a callback function
                // Get the result of the resolve (should be a function) and annotate it to get its arguments.
                // some-attr="$resolve.someResolveResultName(foo, bar)"
                if (type === '&') {
                    var res = context.getResolvable(resolveName);
                    var fn = res && res.data;
                    var args = fn && services.$injector.annotate(fn) || [];
                    // account for array style injection, i.e., ['foo', function (foo) {}]
                    var arrayIdxStr = _.isArray(fn) ? '[' + (fn.length - 1) + ']' : '';
                    return attrName + "='$resolve." + resolveName + arrayIdxStr + "(" + args.join(",") + ")'";
                }
                // some-attr="::$resolve.someResolveName"
                return attrName + "='" + prefix + "$resolve." + resolveName + "'";
            };
            var attrs = getComponentBindings(component).map(attributeTpl).join(' ');
            var kebobName = kebob(component);
            return '<' + kebobName + ' ' + attrs + '></' + kebobName + '>';
        };

        return TemplateFactory;
    }());
    // Gets all the directive(s)' inputs ('@', '=', and '<') and outputs ('&')
    function getComponentBindings(name) {
        var cmpDefs = services.$injector.get(name + 'Directive'); // could be multiple
        if (!cmpDefs || !cmpDefs.length)
            throw new Error("Unable to find component named '" + name + "'");
        return cmpDefs.map(getBindings).reduce(unnestR, []);
    }

    var getBindings = function (def) {
        if (_.isObject(def.bindToController))
            return scopeBindings(def.bindToController);
        return scopeBindings(def.scope);
    };

    var scopeBindings = function (bindingsObj) {
        return Object.keys(bindingsObj || {})
            .map(function (key) {
                return [key, /^([=<@&])[?]?(.*)/.exec(bindingsObj[key])];
            })
            .filter(function (tuple) {
                return isDefined(tuple) && _.isArray(tuple[1]);
            })
            .map(function (tuple) {
                return ({
                    name: tuple[1][2] || tuple[0],
                    type: tuple[1][1]
                });
            });
    };

    var StateProvider = (function () {
        function StateProvider(stateRegistry, stateService) {
            this.stateRegistry = stateRegistry;
            this.stateService = stateService;
            createProxyFunctions(val(StateProvider.prototype), this, val(this));
        }

        StateProvider.prototype.decorator = function (name, func) {
            return this.stateRegistry.decorator(name, func) || this;
        };

        StateProvider.prototype.state = function (name, definition) {
            if (_.isObject(name)) {
                definition = name;
            } else {
                definition.name = name;
            }
            this.stateRegistry.register(definition);
            return this;
        };

        StateProvider.prototype.onInvalid = function (callback) {
            return this.stateService.onInvalid(callback);
        };
        return StateProvider;
    }());

    var getStateHookBuilder = function (hookName) {
        return function stateHookBuilder(stateObject) {
            var hook = stateObject[hookName];
            var pathname = hookName === 'onExit' ? 'from' : 'to';

            var decoratedNg1Hook = function (trans, state) {
				var resolveContext = new ResolveContext(trans.treeChanges(pathname));
				var subContext = resolveContext.subContext(state.$$state());
				var locals = extend(
						getLocals(subContext),
						{ $state$: state, $transition$: trans }
					);

				return services.$injector.invoke(hook, this, locals);
            };

            return hook ? decoratedNg1Hook : undefined;
        };
    };

    /**
     * Implements UI-Router LocationServices and LocationConfig using Angular 1's $location service
     */
    var Ng1LocationServices = (function () {
		var temp_ns = 'ng.ui.router - Ng1LocationServices';

        function Ng1LocationServices($locationProvider) {
            // .onChange() registry
            this._urlListeners = [];
            this.$locationProvider = $locationProvider;
            var _lp = val($locationProvider);
            createProxyFunctions(_lp, this, _lp, ['hashPrefix']);
        }
        Ng1LocationServices.prototype.dispose = function () {};
        Ng1LocationServices.prototype.onChange = function (callback) {
            var _this = this;
            this._urlListeners.push(callback);
            return function () {
                return removeFrom(_this._urlListeners)(callback);
            };
        };
        Ng1LocationServices.prototype.html5Mode = function () {
            var html5Mode = this.$locationProvider.html5Mode();
            html5Mode = _.isObject(html5Mode) ? html5Mode.enabled : html5Mode;
            return html5Mode && ng_from_import.history_pushstate;
        };
        Ng1LocationServices.prototype.url = function (newUrl, replace, state) {
            if (replace === void 0) {
                replace = false;
            }
            if (isDefined(newUrl))
                this.$location.url(newUrl);
            if (replace)
                this.$location.replace();
            if (state)
                this.$location.state(state);
            return this.$location.url();
        };
        Ng1LocationServices.prototype._runtimeServices = function ($rootScope, $location, $browser) {
            var _this = this;
            this.$location = $location;

            // Bind $locationChangeSuccess to the listeners registered in LocationService.onChange
            $rootScope.$on(
				'$locationChangeSuccess',
				function (evt) {
					if (msos_verbose) {
						msos_debug(temp_ns + ' - _runtimeServices ($locationChangeSuccess) -> called, _this._urlListeners:', _this._urlListeners);
					}
					return _this._urlListeners.forEach(
							function (fn) { return fn(evt); }
						);
				}
			);

            var _loc = val($location),
				_browser = val($browser);

            createProxyFunctions(_loc, this, _loc, ['replace', 'path', 'search', 'hash']);
            createProxyFunctions(_loc, this, _loc, ['port', 'protocol', 'host']);
			createProxyFunctions(_browser, this, _browser, ['baseHref']);
        };

        Ng1LocationServices.monkeyPatchPathParameterType = function (router) {
            var pathType = router.urlMatcherFactory.type('path');

			pathType.encode = function (val) {
				return val !== null && val !== undefined ? val.toString().replace(/(~|\/)/g, function (m) { return ({ '~': '~~', '/': '~2F' }[m]); }) : val;
			};
			pathType.decode = function (val) {
				return val !== null && val !== undefined ? val.toString().replace(/(~~|~2F)/g, function (m) { return ({ '~~': '~', '~2F': '/' }[m]); }) : val;
			};
        };

        return Ng1LocationServices;
    }());

    var UrlRouterProvider = (function () {
		var temp_ur = 'ng.ui.router - UrlRouterProvider';

        function UrlRouterProvider(router) {
			msos_debug(temp_ur + ' -> start.');
            this._router = router;
            this._urlRouter = router.urlRouter;
			msos_debug(temp_ur + ' ->  done!');
        }

        UrlRouterProvider.prototype.$get = function () {
			msos_debug(temp_ur + ' - $get -> start.');

            var urlRouter = this._urlRouter,
				debug = 'skipped listen().';

            urlRouter.update(true);

            if (!urlRouter.interceptDeferred) {
                urlRouter.listen();
				debug = 'called listen().';
            }

			msos_debug(temp_ur + ' - $get ->  done, ' + debug);
            return urlRouter;
        };

        UrlRouterProvider.prototype.rule = function (ruleFn) {
            var _this = this;
            if (!_.isFunction(ruleFn))
                throw new Error("'rule' must be a function");
            var match = function () {
                return ruleFn(services.$injector, _this._router.locationService);
            };
            var rule = new BaseUrlRule(match, identity);
            this._urlRouter.rule(rule);
            return this;
        };

        UrlRouterProvider.prototype.otherwise = function (rule) {
            var _this = this;
            var urlRouter = this._urlRouter;
            if (_.isString(rule)) {
                urlRouter.otherwise(rule);
            } else if (_.isFunction(rule)) {
                urlRouter.otherwise(function () {
                    return rule(services.$injector, _this._router.locationService);
                });
            } else {
                throw new Error("'rule' must be a string or function");
            }
            return this;
        };

        UrlRouterProvider.prototype.when = function (what, handler) {
            if (_.isArray(handler) || _.isFunction(handler)) {
                handler = UrlRouterProvider.injectableHandler(this._router, handler);
            }
            this._urlRouter.when(what, handler);
            return this;
        };

        UrlRouterProvider.injectableHandler = function (router, handler) {
            return function (match) {
                return services.$injector.invoke(
						handler,
						null,
						{
							$match: match,
							$stateParams: router.globals.params
						}
					);
            };
        };

        UrlRouterProvider.prototype.deferIntercept = function (defer) {
            this._urlRouter.deferIntercept(defer);
        };

        return UrlRouterProvider;
    }());

    var mod_init = ng_from_import.module('ng.ui.router.init', []);
    var mod_util = ng_from_import.module('ng.ui.router.util', ['ng', 'ng.ui.router.init']);
    var mod_rtr = ng_from_import.module('ng.ui.router.router', ['ng.ui.router.util']);
    var mod_state = ng_from_import.module('ng.ui.router.state', ['ng.ui.router.router', 'ng.ui.router.util']);
    var mod_main = ng_from_import.module('ng.ui.router', ['ng.ui.router.init', 'ng.ui.router.state']);

    var router = null;

    /** This angular 1 provider instantiates a Router and exposes its services via the angular injector */
    function $uiRouterProvider($locationProvider) {
        // Create a new instance of the Router when the $uiRouterProvider is initialized
        router = this.router = new UIRouter();
        router.stateProvider = new StateProvider(router.stateRegistry, router.stateService);
        // Apply ng1 specific StateBuilder code for `views`, `resolve`, and `onExit/Retain/Enter` properties
        router.stateRegistry.decorator('views', ng1ViewsBuilder);
        router.stateRegistry.decorator('onExit', getStateHookBuilder('onExit'));
        router.stateRegistry.decorator('onRetain', getStateHookBuilder('onRetain'));
        router.stateRegistry.decorator('onEnter', getStateHookBuilder('onEnter'));
        router.viewService._pluginapi._viewConfigFactory('ng1', getNg1ViewConfigFactory());
        var ng1LocationService = router.locationService = router.locationConfig = new Ng1LocationServices($locationProvider);
        Ng1LocationServices.monkeyPatchPathParameterType(router);
        // backwards compat: also expose router instance as $uiRouterProvider.router

        function $get($location, $browser, $rootScope) {
            ng1LocationService._runtimeServices($rootScope, $location, $browser);
            delete router.router;
            delete router.$get;
            return router;
        }
		$get.$inject = ['$location', '$browser', '$rootScope'];

        router.router = router;
        router.$get = $get;

		if (msos_verbose === 'router') {
			msos_debug('ng.ui.router - $uiRouterProvider -> called, router:', router);
		}
		
        return router;
    }

	$uiRouterProvider.$inject = ['$locationProvider'];

    var getProviderFor = function (serviceName) {
        return ['$uiRouterProvider', function ($urp) {
            var service = $urp.router[serviceName];
            service.$get = function () {
                return service;
            };
            return service;
        }];
    };
    // This effectively calls $get() on `$uiRouterProvider` to trigger init (when ng enters runtime)
    runBlock.$inject = ['$injector', '$q', '$uiRouter'];

    function runBlock($injector, $q, $uiRouter) {
        services.$injector = $injector;
        services.$q = $q;
        // The $injector is now available.
        // Find any resolvables that had dependency annotation deferred
        $uiRouter.stateRegistry.get()
            .map(function (x) {
                return x.$$state().resolvables;
            })
            .reduce(unnestR, [])
            .filter(function (x) {
                return x.deps === 'deferred';
            })
            .forEach(function (resolvable) {
                resolvable.deps = $injector.annotate(resolvable.resolveFn);
				return resolvable.deps;
            });
    }
    // $urlRouter service and $urlRouterProvider
    var getUrlRouterProvider = function (uiRouter) {
        uiRouter.urlRouterProvider = new UrlRouterProvider(uiRouter);

		return uiRouter.urlRouterProvider;
    };

    var getStateProvider = function () {
        return extend(router.stateProvider, {
            $get: function () {
                return router.stateService;
            }
        });
    };
    watchDigests.$inject = ['$rootScope'];

    function watchDigests($rootScope) {
        $rootScope.$watch(function () {
            trace.approximateDigests++;
        });
    }
    mod_init.provider('$uiRouter', $uiRouterProvider);
    mod_rtr.provider('$urlRouter', ['$uiRouterProvider', getUrlRouterProvider]);
    mod_util.provider('$urlService', getProviderFor('urlService'));
    mod_util.provider('$urlMatcherFactory', ['$uiRouterProvider', function () {
        return router.urlMatcherFactory;
    }]);
    mod_util.provider('$templateFactory', function () {
        return new TemplateFactory();
    });
    mod_state.provider('$stateRegistry', getProviderFor('stateRegistry'));
    mod_state.provider('$uiRouterGlobals', getProviderFor('globals'));
    mod_state.provider('$transitions', getProviderFor('transitionService'));
    mod_state.provider('$state', ['$uiRouterProvider', getStateProvider]);
    mod_state.factory('$stateParams', ['$uiRouter', function ($uiRouter) {
        return $uiRouter.globals.params;
    }]);
    mod_main.factory('$view', function () {
        return router.viewService;
    });
    mod_main.service('$trace', function () {
        return trace;
    });
    mod_main.run(watchDigests);

	// These are important, They initialize each $get function, etc. (kind of kludgy...)
    mod_util.run(
		['$urlMatcherFactory', function ($urlMatcherFactory) {
			if (msos_verbose === 'router') {
				msos_debug('ng.ui.router - mod_util.run -> executed, (init $get):', $urlMatcherFactory);
			}
		}]
	);
    mod_state.run(
		['$state', function ($state) {
			if (msos_verbose === 'router') {
				msos_debug('ng.ui.router - mod_state.run -> executed, (init $get):', $state);
			}
		}]
	);
    mod_rtr.run(
		['$urlRouter', function ($urlRouter) {
			if (msos_verbose === 'router') {
				msos_debug('ng.ui.router - mod_rtr.run -> executed, (init $get):', $urlRouter);
			}
		}]
	);

    mod_init.run(runBlock);
    /** @hidden TODO: find a place to move this */
    var getLocals = function (ctx) {
        var tokens = ctx.getTokens().filter(_.isString);
        var tuples = tokens.map(function (key) {
            var resolvable = ctx.getResolvable(key);
            var waitPolicy = ctx.getPolicy(resolvable).async;
            return [key, waitPolicy === 'NOWAIT' ? resolvable.promise : resolvable.data];
        });
        return tuples.reduce(applyPairs, {});
    };

    function parseStateRef(ref) {
        var paramsOnly = ref.match(/^\s*({[^}]*})\s*$/),
            parsed;
        if (paramsOnly)
            ref = '(' + paramsOnly[1] + ')';
        parsed = ref.replace(/\n/g, ' ').match(/^\s*([^(]*?)\s*(\((.*)\))?\s*$/);
        if (!parsed || parsed.length !== 4)
            throw new Error("Invalid state ref '" + ref + "'");
        return {
            state: parsed[1] || null,
            paramExpr: parsed[3] || null
        };
    }
    /** @hidden */
    function stateContext(el) {
        var $uiView = el.parent().inheritedData('$uiView');
        var path = parse('$cfg.path')($uiView);
        return path ? tail(path).state.name : undefined;
    }
    /** @hidden */
    function processedDef($state, $element, def) {
        var uiState = def.uiState || $state.current.name;
        var uiStateOpts = extend(defaultOpts($element, $state), def.uiStateOpts || {});
        var href = $state.href(uiState, def.uiStateParams, uiStateOpts);
        return {
            uiState: uiState,
            uiStateParams: def.uiStateParams,
            uiStateOpts: uiStateOpts,
            href: href
        };
    }
    /** @hidden */
    function getTypeInfo(el) {
        // SVGAElement does not use the href attribute, but rather the 'xlinkHref' attribute.
        var isSvg = Object.prototype.toString.call(el.prop('href')) === '[object SVGAnimatedString]';
        var isForm = el[0].nodeName === 'FORM';
        return {
            attr: isForm ? 'action' : (isSvg ? 'xlink:href' : 'href'),
            isAnchor: el.prop('tagName').toUpperCase() === 'A',
            clickable: !isForm
        };
    }
    /** @hidden */
    function clickHook(el, $state, $timeout, type, getDef) {
        return function (e) {
            var button = e.which || e.button,
                target = getDef(),
				transition;

            if (!(button > 1 || e.ctrlKey || e.metaKey || e.shiftKey || el.attr('target'))) {
                // HACK: This is to allow ng-clicks to be processed before the transition is initiated:
                transition = $timeout(
					function clickhook_timeout() {
						$state.go(target.uiState, target.uiStateParams, target.uiStateOpts);
					}
				);
                e.preventDefault();
                // if the state has no URL, ignore one preventDefault from the <a> directive.
                var ignorePreventDefaultCount = type.isAnchor && !target.href ? 1 : 0;
                e.preventDefault = function () {
                    if (ignorePreventDefaultCount-- <= 0)
                        $timeout.cancel(transition);
                };
            }
        };
    }
    /** @hidden */
    function defaultOpts(el, $state) {
        return {
            relative: stateContext(el) || $state.$current,
            inherit: true,
            source: 'sref'
        };
    }
    /** @hidden */
    function bindEvents(element, scope, hookFn, uiStateOpts) {
        var events,
			event_1,
			events_1,
			on,
			_i = 0;

        if (uiStateOpts) {
            events = uiStateOpts.events;
        }

        if (!_.isArray(events)) {
            events = ['click'];
        }

		events_1 = events;
        on = element.on ? 'on' : 'bind';

        for (_i = 0; _i < events_1.length; _i += 1) {
            event_1 = events_1[_i];
            element[on](event_1, hookFn);
        }

        scope.$on('$destroy', function () {
            var off = element.off ? 'off' : 'unbind',
				_j = 0,
				event_2,
				events_2 = events;

            for (_j = 0; _j < events_2.length; _j += 1) {
                event_2 = events_2[_j];
                element[off](event_2, hookFn);
            }
        });
    }

    var uiSrefDirective;
    uiSrefDirective = ['$uiRouter', '$timeout',
        function $StateRefDirective($uiRouter, $timeout) {
            var $state = $uiRouter.stateService;
            return {
                restrict: 'A',
                require: ['?^uiSrefActive', '?^uiSrefActiveEq'],
                link: function (scope, element, attrs, uiSrefActive) {
                    var type = getTypeInfo(element);
                    var active = uiSrefActive[1] || uiSrefActive[0];
                    var unlinkInfoFn = null;
                    var hookFn;
                    var rawDef = {};
                    var getDef = function () {
                        return processedDef($state, element, rawDef);
                    };
                    var ref = parseStateRef(attrs.uiSref);
                    rawDef.uiState = ref.state;
                    rawDef.uiStateOpts = attrs.uiSrefOpts ? scope.$eval(attrs.uiSrefOpts) : {};

                    function update() {
                        var def = getDef();
                        if (unlinkInfoFn)
                            unlinkInfoFn();
                        if (active) {
                            unlinkInfoFn = active.$$addStateInfo(def.uiState, def.uiStateParams);
                        }
                        if (def.href !== null && def.href !== undefined) {
                            attrs.$set(type.attr, def.href);
                        }
                    }
                    if (ref.paramExpr) {
                        scope.$watch(ref.paramExpr, function (val) {
                            rawDef.uiStateParams = extend({}, val);
                            update();
                        }, true);
                        rawDef.uiStateParams = extend({}, scope.$eval(ref.paramExpr));
                    }

                    update();

                    scope.$on('$destroy', $uiRouter.stateRegistry.onStatesChanged(update));
                    scope.$on('$destroy', $uiRouter.transitionService.onSuccess({}, update));

                    if (!type.clickable) { return; }

                    hookFn = clickHook(element, $state, $timeout, type, getDef);
                    bindEvents(element, scope, hookFn, rawDef.uiStateOpts);
                }
            };
        }
    ];

    var uiStateDirective;
    uiStateDirective = ['$uiRouter', '$timeout',
        function $StateRefDynamicDirective($uiRouter, $timeout) {
            var $state = $uiRouter.stateService;
            return {
                restrict: 'A',
                require: ['?^uiSrefActive', '?^uiSrefActiveEq'],
                link: function (scope, element, attrs, uiSrefActive) {
                    var type = getTypeInfo(element),
						active = uiSrefActive[1] || uiSrefActive[0],
						unlinkInfoFn = null,
						hookFn,
						rawDef = {},
						getDef = function () {
							return processedDef($state, element, rawDef);
						},
						inputAttrs = ['uiState', 'uiStateParams', 'uiStateOpts'],
						watchDeregFns = inputAttrs.reduce(
							function (acc, attr) {
								return (acc[attr] = noop_rt, acc);
							},
							{}
						);

                    function update() {
                        var def = getDef();
                        if (unlinkInfoFn) {
                            unlinkInfoFn();
                        }
                        if (active) {
                            unlinkInfoFn = active.$$addStateInfo(def.uiState, def.uiStateParams);
                        }
                        if (def.href !== null && def.href !== undefined) {
                            attrs.$set(type.attr, def.href);
                        }
                    }
                    inputAttrs.forEach(
						function (field) {
							rawDef[field] = attrs[field] ? scope.$eval(attrs[field]) : null;

							attrs.$observe(
								field,
								function (expr) {
									if (watchDeregFns[field] !== noop_rt) {
										watchDeregFns[field]();
									}
									watchDeregFns[field] = scope.$watch(
										expr,
										function (newval) {
											rawDef[field] = newval;
											update();
										},
										true
									);
								}
							);
						}
					);

                    update();

                    scope.$on('$destroy', $uiRouter.stateRegistry.onStatesChanged(update));
                    scope.$on('$destroy', $uiRouter.transitionService.onSuccess({}, update));

                    if (!type.clickable) { return; }

                    hookFn = clickHook(element, $state, $timeout, type, getDef);
                    bindEvents(element, scope, hookFn, rawDef.uiStateOpts);
                }
            };
        }
    ];

    var uiSrefActiveDirective;
    uiSrefActiveDirective = ['$state', '$stateParams', '$interpolate', '$uiRouter',
        function $StateRefActiveDirective($state, $stateParams, $interpolate, $uiRouter) {
            return {
                restrict: 'A',
                controller: ['$scope', '$element', '$attrs',
                    function ui_sref_active($scope, $element, $attrs) {
                        var states = [],
                            activeEqClass, uiSrefActive;
 
                         activeEqClass = $interpolate($attrs.uiSrefActiveEq || '', false)($scope);

                        try {
                            uiSrefActive = $scope.$eval($attrs.uiSrefActive);
                        } catch (e) {
                            // Do nothing. uiSrefActive is not a valid expression.
                            // Fall back to using $interpolate below
                        }

                        uiSrefActive = uiSrefActive || $interpolate($attrs.uiSrefActive || '', false)($scope);
                        setStatesFromDefinitionObject(uiSrefActive);

                        this.$$addStateInfo = function (newState, newParams) {

                            if (_.isObject(uiSrefActive) && states.length > 0) {
                                return;
                            }

                            var deregister = addState(newState, newParams, uiSrefActive);

                            update();
                            return deregister;
                        };

                        function updateAfterTransition(trans) {
							trans.promise.then(update);
                        }

                        $scope.$on('$destroy', setupEventListeners());

						if ($uiRouter.globals.transition) {
                            updateAfterTransition($uiRouter.globals.transition);
                        }

						function setupEventListeners() {
							var deregisterStatesChangedListener = $uiRouter.stateRegistry.onStatesChanged(handleStatesChanged),
								deregisterOnStartListener = $uiRouter.transitionService.onStart({}, updateAfterTransition),
								deregisterStateChangeSuccessListener = $scope.$on('$stateChangeSuccess', update);

							return function cleanUp() {
								deregisterStatesChangedListener();
								deregisterOnStartListener();
								deregisterStateChangeSuccessListener();
							};
						}

						function handleStatesChanged() {
							setStatesFromDefinitionObject(uiSrefActive);
						}

						function setStatesFromDefinitionObject(statesDefinition) {
							if (_.isObject(statesDefinition)) {
								states = [];

								forEach(statesDefinition, function (stateOrName, activeClass) {
									// Helper function to abstract adding state.
									var addStateForClass = function (stateOrName, activeClass) {
										var ref = parseStateRef(stateOrName);
										addState(ref.state, $scope.$eval(ref.paramExpr), activeClass);
									};

									if (isString(stateOrName)) {
										// If state is string, just add it.
										addStateForClass(stateOrName, activeClass);
									} else if (isArray(stateOrName)) {
										// If state is an array, iterate over it and add each array item individually.
										forEach(stateOrName, function (stateOrName) {
											addStateForClass(stateOrName, activeClass);
										});
									}
								});
							}
						}

                        function addState(stateName, stateParams, activeClass) {
                            var state = $state.get(stateName, stateContext($element)),
								stateInfo = {
									state: state || {
										name: stateName
									},
									params: stateParams,
									activeClass: activeClass
								};

                            states.push(stateInfo);

                            return function removeState() {
                                removeFrom(states)(stateInfo);
                            };
                        }
                        // Update route state
                        function update() {
                            var splitClasses = function (str) {
                                return str.split(/\s/).filter(identity);
                            };
                            var getClasses = function (stateList) {
                                return stateList.map(function (x) {
                                    return x.activeClass;
                                }).map(splitClasses).reduce(unnestR, []);
                            };
                            var allClasses = getClasses(states).concat(splitClasses(activeEqClass)).reduce(uniqR, []);
                            var fuzzyClasses = getClasses(states.filter(function (x) {
                                return $state.includes(x.state.name, x.params);
                            }));
                            var exactlyMatchesAny = !!states.filter(function (x) {
                                return $state.is(x.state.name, x.params);
                            }).length;
                            var exactClasses = exactlyMatchesAny ? splitClasses(activeEqClass) : [];
                            var addClasses = fuzzyClasses.concat(exactClasses).reduce(uniqR, []);
                            var removeClasses = allClasses.filter(function (cls) {
                                return !inArray(addClasses, cls);
                            });
                            $scope.$evalAsync(function () {
                                addClasses.forEach(function (className) {
                                    return $element.addClass(className);
                                });
                                removeClasses.forEach(function (className) {
                                    return $element.removeClass(className);
                                });
                            });
                        }
                        update();
                    }
                ]
            };
        }
    ];
    ng_from_import.module('ng.ui.router.state')
		.directive('uiSref', uiSrefDirective)
		.directive('uiSrefActive', uiSrefActiveDirective)
		.directive('uiSrefActiveEq', uiSrefActiveDirective)
		.directive('uiState', uiStateDirective);

    $IsStateFilter.$inject = ['$state'];

    function $IsStateFilter($state) {
        var isFilter = function (state, params, options) {
            return $state.is(state, params, options);
        };
        isFilter.$stateful = true;
        return isFilter;
    }

    $IncludedByStateFilter.$inject = ['$state'];

    function $IncludedByStateFilter($state) {
        var includesFilter = function (state, params, options) {
            return $state.includes(state, params, options);
        };
        includesFilter.$stateful = true;
        return includesFilter;
    }
    ng_from_import.module('ng.ui.router.state')
        .filter('isState', $IsStateFilter)
        .filter('includedByState', $IncludedByStateFilter);

    var uiView;
    uiView = ['$view', '$animate', '$uiViewScroll', '$interpolate', '$q',
        function $ViewDirective($view, $animate, $uiViewScroll, $interpolate, $q) {
            function getRenderer() {
                return {
                    enter: function (element, target, cb) {
                        if (ng_from_import.version.minor > 2) {
                            $animate.enter(element, null, target).then(cb);
                        } else {
                            $animate.enter(element, null, target, cb);
                        }
                    },
                    leave: function (element, cb) {
                        if (ng_from_import.version.minor > 2) {
                            $animate.leave(element).then(cb);
                        } else {
                            $animate.leave(element, cb);
                        }
                    }
                };
            }

            function configsEqual(config1, config2) {
                return config1 === config2;
            }
            var rootData = {
                $cfg: {
                    viewDecl: {
                        $context: $view._pluginapi._rootViewContext()
                    }
                },
                $uiView: {}
            };
            var directive = {
                count: 0,
                restrict: 'ECA',
                terminal: true,
                priority: 400,
                transclude: 'element',
                compile: function (tElement, tAttrs, $transclude) {
                    return function (scope, $element, attrs) {
						var temp_uv = 'ng.ui.router - uiView - compile - ',
							onloadExp = attrs.onload || '',
							autoScrollExp = attrs.autoscroll,
							renderer = getRenderer(attrs, scope),
							inherited = $element.inheritedData('$uiView') || rootData,
							name = $interpolate(attrs.uiView || attrs.name || '')(scope) || '$default',
							previousEl,
							currentEl,
							currentScope,
							unregister,
                            viewConfig,
							activeUIView = {
								$type: 'ng1',
								id: directive.count++,
								name: name,
								fqn: inherited.$uiView.fqn ? inherited.$uiView.fqn + '.' + name : name,
								config: null,
								configUpdated: configUpdatedCallback,
								get creationContext() {
									var fromParentTagConfig = parse('$cfg.viewDecl.$context')(inherited);
									var fromParentTag = parse('$uiView.creationContext')(inherited);
									return fromParentTagConfig || fromParentTag;
								}
							};

                        trace.traceUIViewEvent('Linking', activeUIView);

                        function configUpdatedCallback(config) {
							if (msos_verbose === 'router') {
								msos_debug(temp_uv + 'configUpdatedCallback -> called, config:', config);
							}
                            if (config && !(config instanceof Ng1ViewConfig)) {
                                return;
                            }
                            if (configsEqual(viewConfig, config)) {
                                return;
                            }
                            trace.traceUIViewConfigUpdated(activeUIView, config && config.viewDecl && config.viewDecl.$context);
                            viewConfig = config;
                            updateView(config);
                        }
                        $element.data('$uiView', {
                            $uiView: activeUIView
                        });
                        updateView();
                        unregister = $view.registerUIView(activeUIView);
                        scope.$on('$destroy', function () {
                            trace.traceUIViewEvent('Destroying/Unregistering', activeUIView);
                            unregister();
                        });

                        function cleanupLastView() {
                            if (previousEl) {
                                trace.traceUIViewEvent('Removing (previous) el', previousEl.data('$uiView'));
                                previousEl.remove();
                                previousEl = null;
                            }
                            if (currentScope) {
                                trace.traceUIViewEvent('Destroying scope', activeUIView);
                                currentScope.$destroy();
                                currentScope = null;
                            }
                            if (currentEl) {
                                var _viewData_1 = currentEl.data('$uiViewAnim');
                                trace.traceUIViewEvent('Animate out', _viewData_1);
                                renderer.leave(currentEl, function () {
                                    _viewData_1.$$animLeave.resolve();
                                    previousEl = null;
                                });
                                previousEl = currentEl;
                                currentEl = null;
                            }
                        }

                        function updateView(config) {
							if (msos_verbose) {
								msos_debug(temp_uv + 'updateView -> start, config:', config);
							}
                            var newScope = scope.$new();
                            var animEnter = $q.defer('ui_router_updateview_enter_defer'),
                                animLeave = $q.defer('ui_router_updateview_enter_leave');
                            var $uiViewData = {
                                $cfg: config,
                                $uiView: activeUIView,
                            };
                            var $uiViewAnim = {
                                $animEnter: animEnter.promise,
                                $animLeave: animLeave.promise,
                                $$animLeave: animLeave
                            };

                            newScope.$emit('$viewContentLoading', name);

                            var cloned = $transclude(newScope, function (clone) {
                                clone.data('$uiViewAnim', $uiViewAnim);
                                clone.data('$uiView', $uiViewData);
                                renderer.enter(clone, $element, function onUIViewEnter() {
                                    animEnter.resolve();
                                    if (currentScope)
                                        currentScope.$emit('$viewContentAnimationEnded');
                                    if (isDefined(autoScrollExp) && !autoScrollExp || scope.$eval(autoScrollExp)) {
                                        $uiViewScroll(clone);
                                    }
                                });
                                cleanupLastView();
                            });

                            currentEl = cloned;
                            currentScope = newScope;
                            currentScope.$emit('$viewContentLoaded', config || viewConfig);
                            currentScope.$eval(onloadExp);

							if (msos_verbose) {
								msos_debug(temp_uv + 'updateView -> done!');
							}
                        }
                    };
                }
            };
            return directive;
        }
    ];

    function $ViewDirectiveFill($compile, $controller, $transitions, $view, $q) {
        var temp_vf = 'ng.ui.router - $ViewDirectiveFill',
			getControllerAs = parse('viewDecl.controllerAs'),
			getResolveAs = parse('viewDecl.resolveAs');

		msos_debug(temp_vf + ' -> called, getControllerAs/getResolveAs:', getControllerAs, getResolveAs);

        return {
            restrict: 'ECA',
            priority: -400,
            compile: function (tElement) {
                var initial = tElement.html();
                tElement.empty();
                return function (scope, $element) {
                    var data = $element.data('$uiView');

                    if (!data) {
                        $element.html(initial);
                        $compile($element.contents())(scope);
						msos_debug(temp_vf + ' - compile -> no $element.data');
                        return;
                    }

                    var cfg = data.$cfg || {
                        viewDecl: {},
                        getTemplate: noop_rt
                    };

					if (msos_verbose === 'router') {
						msos_debug(temp_vf + ' - compile -> cfg', cfg);
					}

                    var resolveCtx = cfg.path && new ResolveContext(cfg.path);

					if (cfg.getTemplate !== noop_rt) {
						$element.html(cfg.getTemplate($element, resolveCtx) || initial);
					} else {
						$element.html(initial);
					}

                    trace.traceUIViewFill(data.$uiView, $element.html());

					function ui_router_comp_noop() {
						msos_debug(temp_vf + ' - ui_router_comp_noop -> called.');
						return undefined;
					}

                    var link = $compile($element.contents());
                    var controller = cfg.controller;
                    var controllerAs = getControllerAs(cfg);
                    var resolveAs = getResolveAs(cfg);
                    var locals = resolveCtx && getLocals(resolveCtx);

                    scope[resolveAs] = locals;

                    if (controller) {
                        var controllerInstance = $controller(
								controller,
								extend(
									{},
									locals,
									{
										$scope: scope,
										$element: $element
									}
								),
								false
							);

                        if (controllerAs) {
                            scope[controllerAs] = controllerInstance;
                            scope[controllerAs][resolveAs] = locals;
                        }

                        $element.data('$ngControllerController', controllerInstance);
                        $element.children().data('$ngControllerController', controllerInstance);

                        registerControllerCallbacks($q, $transitions, controllerInstance, scope, cfg);
                    } else {
						// Unlike std AngularJS, we need a 'noop' function as default, so we can
						// screen away useless one's in NgMomentum, fire the $digest for decorators
						$controller(
								ui_router_comp_noop,
								{},
								true
							);
					}

                    // Wait for the component to appear in the DOM
                    if (_.isString(cfg.viewDecl.component)) {
                        var cmp_1 = cfg.viewDecl.component;
                        var kebobName = kebobString(cmp_1);
                        var tagRegexp_1 = new RegExp('^(x-|data-)?' + kebobName + '$', 'i');
                        var getComponentController = function () {
                            var directiveEl = [].slice.call($element[0].children)
                                .filter(function (el) {
                                    return el && el.tagName && tagRegexp_1.exec(el.tagName);
                                });
                            return directiveEl && ng_from_import.element(directiveEl).data('$' + cmp_1 + 'Controller');
                        };
                        var deregisterWatch_1 = scope.$watch(getComponentController, function (ctrlInstance) {
                            if (!ctrlInstance)
                                return;
                            registerControllerCallbacks($q, $transitions, ctrlInstance, scope, cfg);
                            deregisterWatch_1();
                        });
                    }

                    link(scope);
                };
            }
        };
    }

	$ViewDirectiveFill.$inject = ['$compile', '$controller', '$transitions', '$view', '$q', '$timeout'];

    var hasComponentImpl = typeof ng_from_import.module('ng.ui.router').component === 'function';
    var _uiCanExitId = 0;

    /** @hidden TODO: move these callbacks to $view and/or `/hooks/components.ts` or something */
    function registerControllerCallbacks($q, $transitions, controllerInstance, $scope, cfg) {
        // Call $onInit() ASAP
        if (_.isFunction(controllerInstance.$onInit) && !(cfg.viewDecl.component && hasComponentImpl)) {
            controllerInstance.$onInit();
        }

        var viewState = tail(cfg.path).state.self || undefined;
        var hookOptions = {
            bind: controllerInstance
        };
        // Add component-level hook for onParamsChange
        if (_.isFunction(controllerInstance.uiOnParamsChanged)) {
            var resolveContext = new ResolveContext(cfg.path);
            var viewCreationTrans_1 = resolveContext.getResolvable('$transition$').data;
            // Fire callback on any successful transition
            var paramsUpdated = function ($transition$) {
                // Exit early if the $transition$ is the same as the view was created within.
                // Exit early if the $transition$ will exit the state the view is for.
                if ($transition$ === viewCreationTrans_1 || $transition$.exiting().indexOf(viewState) !== -1)
                    return;
                var toParams = $transition$.params('to');
                var fromParams = $transition$.params('from');
                var toSchema = $transition$.treeChanges().to.map(function (node) {
                    return node.paramSchema;
                }).reduce(unnestR, []);
                var fromSchema = $transition$.treeChanges().from.map(function (node) {
                    return node.paramSchema;
                }).reduce(unnestR, []);
                // Find the to params that have different values than the from params
                var changedToParams = toSchema.filter(function (param) {
                    var idx = fromSchema.indexOf(param);
                    return idx === -1 || !fromSchema[idx].type.equals(toParams[param.id], fromParams[param.id]);
                });
                // Only trigger callback if a to param has changed or is new
                if (changedToParams.length) {
                    var changedKeys_1 = changedToParams.map(function (x) {
                        return x.id;
                    });
                    // Filter the params to only changed/new to params.  `$transition$.params()` may be used to get all params.
					var newValues = filter(
							toParams,
							function (val, key) { return changedKeys_1.indexOf(key) !== -1; }
						);
                    controllerInstance.uiOnParamsChanged(newValues, $transition$);
                }
            };
            $scope.$on('$destroy', $transitions.onSuccess({}, paramsUpdated, hookOptions));
        }
        // Add component-level hook for uiCanExit
        if (_.isFunction(controllerInstance.uiCanExit)) {
            var id_1 = _uiCanExitId++;
            var cacheProp_1 = '_uiCanExitIds';
            // Returns true if a redirect transition already answered truthy
            var prevTruthyAnswer_1 = function (trans) {
                return !!trans && (trans[cacheProp_1] && trans[cacheProp_1][id_1] === true || prevTruthyAnswer_1(trans.redirectedFrom()));
            };
            // If a user answered yes, but the transition was later redirected, don't also ask for the new redirect transition
            var wrappedHook = function (trans) {
                var promise,
					ids = trans[cacheProp_1] = trans[cacheProp_1] || {};

                if (!prevTruthyAnswer_1(trans)) {
					promise = $q.when($q.defer('ng_ui_router_registerControllerCallbacks_when'), controllerInstance.uiCanExit(trans));
					promise.then(
						function (val) {
							ids[id_1] = (val !== false);
							return ids[id_1];
						}
					);
				}
                return promise;
            };
            var criteria = {
                exiting: viewState.name
            };
            $scope.$on('$destroy', $transitions.onBefore(criteria, wrappedHook, hookOptions));
        }
    }

    function $ViewScrollProvider() {
        var useAnchorScroll = false;
        this.useAnchorScroll = function () {
            useAnchorScroll = true;
        };
        this.$get = ['$anchorScroll', '$timeout', function ($anchorScroll, $timeout) {
            if (useAnchorScroll) {
                return $anchorScroll;
            }
            return function ($element) {
                return $timeout(function () {
                    $element[0].scrollIntoView();
                }, 0, false);
            };
        }];
    }

    ng_from_import.module(
		'ng.ui.router.state'
	).directive(
		'uiView',
		uiView
	).directive(
		'uiView',
		$ViewDirectiveFill
	).provider(
        '$uiViewScroll',
        $ViewScrollProvider
    );

	exports.Transition = Transition;
	exports.UIRouterGlobals = UIRouterGlobals;
	exports.UIRouter = UIRouter;

})));

msos.console.info('ng/ui/router/v1014_msos -> done!');
msos.console.timeEnd('ng/ui/router');
