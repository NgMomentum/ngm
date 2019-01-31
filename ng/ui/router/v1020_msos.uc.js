
/**
 * State-based routing for AngularJS 1.x
 * @version v1.0.20
 * @link https://ui-router.github.io
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

/*global
    msos: false,
    _: false
*/

msos.console.info('ng/ui/router/v1020_msos -> start.');
msos.console.time('ng/ui/router');

(function (global, factory) {

    global['@uirouter/angularjs'] = {};

    factory(
        global['@uirouter/angularjs'],
        global.angular
    );

}(this, (function (exports, ngm_angular) {
    'use strict';

	function copy(src, dest) {
		if (dest) {
			Object.keys(dest).forEach(function (key) { return delete dest[key]; });
		}
		if (!dest) {
			dest = {};
		}

		return extend(dest, src);
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

        return function compose_result() {
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
		msos_error = msos.console.error,
		msos_verbose = msos.config.verbose,
		mvr = msos_verbose === 'router',
		msos_indent = ',\n     ',
		fromJson = ngm_angular.fromJson,
		toJson = ngm_angular.toJson,
		forEach = ngm_angular.forEach,
		extend = Object.assign || _.assign,
		equals = ngm_angular.equals,
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
		isPromise,
		noImpl = function (fnname) {
			return function () {
				throw new Error("No implementation for " + fnname + ". The framework specific code did not implement this method.");
			};
		},
		makeStub = function (service, methods) {
			return methods.reduce(
				function (acc, key) {
					return ((acc[key] = noImpl(service + "." + key + "()")), acc);
				},
				{}
			);
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
		reject_id = 0,
		Rejection,
		viewConfigString,
		_tid,
		_rid,
		transLbl,
		Trace,
		uirouter_trace,
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
		Param,
		PathNode,
		PathUtils,
		defaultResolvePolicy,
		Resolvable,
		resolvePolicies,
		NATIVE_INJECTOR_TOKEN,
		ResolveContext,
		UIInjectorImpl,
		_uiCanExitId = 0,
		UIRouterPluginBase;

	function noop_rt() {
		if (mvr) { msos.console.trace('ng.ui.router - noop_rt -> executed.'); }
		return undefined;
	}

	function noop_tp() {
		if (mvr) { msos.console.trace('ng.ui.router - noop_tp -> (template) executed.'); }
		return undefined;
	}

	function noop_ch() {
		if (mvr) { msos.console.trace('ng.ui.router - noop_ch -> (chain) executed.'); }
		return undefined;
	}

	function noop_st() {
		if (mvr) { msos.console.trace('ng.ui.router - noop_st -> (state) executed.'); }
		return undefined;
	}

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
                if (struct[i][0](x)) {
                    return struct[i][1](x);
                }
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
		var temp_so = 'ng.ui.router - StateObject';

		if (mvr) {
			msos_debug(temp_so + ' - create -> start.');
		}

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

		if (mvr) {
			msos_debug(temp_so + ' - create ->  done!');
		}
        return StateObject;
    }());

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
			},
			makeLateRebindFn = function (fnName) {
				return function lateRebindFunction() {
					target[fnName] = bindFunction(fnName);
					return target[fnName].apply(null, arguments);
				};
			};

        fnNames = fnNames || Object.keys(source());

        return fnNames.reduce(
			function (acc, name) {
				acc[name] = latebind ? makeLateRebindFn(name) : bindFunction(name);
				return acc;
			},
			target
		);
    }

    function defaults(opts) {
        var defaultsList = [],
			defaultVals,
			_i = 0;

        for (_i = 1; _i < arguments.length; _i += 1) {
            defaultsList[_i - 1] = arguments[_i];
        }

        defaultVals = extend.apply(
			void 0,
			[{}].concat(defaultsList.reverse())
		);

        return extend(
			defaultVals,
			_.pick(opts || {}, Object.keys(defaultVals))
		);
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

	silenceUncaughtInPromise = function (promise) {
		promise.catch(function ng_ui_rt_silenceUncaughtInPromise_catch() { return 0; });
		
		return promise;
	};

    silentRejection = function (error) {
		var temp_sr = 'ng.ui.router - silentRejection';

		msos_debug(temp_sr + ' -> start, type: ' + error.type + msos_indent + 'message: ' + error.message);

		var silent_promise = silenceUncaughtInPromise(
				services.$q.reject(services.$q.defer('ui_router_silentRejection_reject'), error)
			);

		msos_debug(temp_sr + ' ->  done!');
		return silent_promise;
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
		var temp_rj = 'ng.ui.router - Rejection';

		if (mvr) {
			msos_debug(temp_rj + ' - create -> start.');
		}

		function Rejection(type, message, detail) {
			this.$id = reject_id;
			this.type = type;
			this.message = message;
			this.detail = detail;

			reject_id += 1;
		}

		Rejection.isRejectionPromise = function (obj) {
			return obj && (typeof obj.then === 'function') && is(Rejection)(obj._transitionRejection);
		};

		Rejection.superseded = function (detail, options) {
			var message = 'The transition has been superseded by a different transition',
				rejection = new Rejection(exports.RejectType.SUPERSEDED, message, detail);

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
			var output = is(Rejection)(detail) ? detail : Rejection.errored(detail);
			return output;
		};

		Rejection.prototype.toString = function () {
			var detailString = function (d) {
					return d && d.toString !== Object.prototype.toString ? d.toString() : stringify(d);
				},
				detail = detailString(this.detail),
				_a = this,
				$id = _a.$id,
				type = _a.type,
				message = _a.message;

			return 'Transition Rejection($id: ' + $id + ' type: ' + exports.RejectType[type] + ', message: ' + message + ', detail: ' + detail + ')';
		};

		Rejection.prototype.toPromise = function () {
			var _this = this;

			if (mvr) {
				msos_debug(temp_rj + ' - toPromise -> called' + msos_indent + 'this:', _this);
			}

			return extend(silentRejection(_this), { _transitionRejection: _this });
		};

		if (mvr) {
			msos_debug(temp_rj + ' - create ->  done!');
		}
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
        return 'ng.ui.router - Trace -> Transition $id: ' + _tid(trans) + ', Router $id: ' + _rid(trans);
    };

    Trace = (function () {
		var temp_t = 'ng.ui.router - Trace';

		if (mvr) {
			msos_debug(temp_t + ' - create -> start.');
		}

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
			if (mvr) {
				msos_debug(transLbl(trans) + ', traceTransitionStart' + msos_indent + stringify(trans));
			} else {
				msos_debug(transLbl(trans) + ', traceTransitionStart.');
			}
        };

        Trace.prototype.traceTransitionIgnored = function (trans) {
            if (!this.enabled(exports.Category.TRANSITION)) {
                return;
            }
			if (mvr) {
				msos_debug(transLbl(trans) + ', traceTransitionIgnored' + msos_indent + stringify(trans));
			} else {
				msos_debug(transLbl(trans) + ', traceTransitionIgnored.');
			}
        };

        Trace.prototype.traceHookInvocation = function (step, trans, options) {
            if (!this.enabled(exports.Category.HOOK)) {
                return;
            }
            var event = parse('traceData.hookType')(options) || 'internal',
                context = parse('traceData.context.state.name')(options) || parse('traceData.context')(options) || 'unknown',
                name = functionToString(step.registeredHook.callback);

			if (mvr) {
				msos_debug(transLbl(trans) + ', traceHookInvocation -> ' + event + ', context: ' + context + msos_indent + maxLength(200, name));
			} else {
				msos_debug(transLbl(trans) + ', traceHookInvocation -> ' + event);
			}
        };

        Trace.prototype.traceHookResult = function (hookResult, trans) {
            if (!this.enabled(exports.Category.HOOK)) {
                return;
            }
			if (mvr) {
				msos_debug(transLbl(trans) + ', <- traceHookResult' + msos_indent + maxLength(200, stringify(hookResult)));
			} else {
				msos_debug(transLbl(trans) + ', <- traceHookResult.');
			}
        };

        Trace.prototype.traceResolvePath = function (path, trans) {
            if (!this.enabled(exports.Category.RESOLVE)) {
                return;
            }
			if (mvr) {
				msos_debug(transLbl(trans) + ', traceResolvePath path(s):', path);
			} else {
				msos_debug(transLbl(trans) + ', traceResolvePath.');
			}
        };

        Trace.prototype.traceResolvableResolved = function (resolvable, trans) {
            if (!this.enabled(exports.Category.RESOLVE)) {
                return;
            }
			if (mvr) {
				msos_debug(transLbl(trans) + ', <- traceResolvableResolved' + msos_indent + resolvable + msos_indent + 'to: ', resolvable.data);
			} else {
				msos_debug(transLbl(trans) + ', <- traceResolvableResolved.');
			}
        };

        Trace.prototype.traceError = function (reason, trans) {
            if (!this.enabled(exports.Category.TRANSITION)) {
                return;
            }

			msos_debug(transLbl(trans) + ', <- traceError' + msos_indent + stringify(trans) + msos_indent + 'reason: ' + reason);
        };

        Trace.prototype.traceSuccess = function (finalState, trans) {
            if (!this.enabled(exports.Category.TRANSITION)) {
                return;
            }

			if (mvr) {
				msos_debug(transLbl(trans) + ', <- traceSuccess, final state: ' + finalState.name + msos_indent + stringify(trans));
			} else {
				msos_debug(transLbl(trans) + ', <- traceSuccess, final state: ' + finalState.name);
			}
        };

        Trace.prototype.traceUIViewEvent = function (event, viewData, extra) {
            if (extra === void 0) {
                extra = '';
            }
            if (!this.enabled(exports.Category.UIVIEW)) {
                return;
            }
			if (mvr) {
				msos_debug(temp_t + ' - ui-view: ' + padString(10, event) + ' ' + uiViewString(viewData) + extra);
			} else {
				msos_debug(temp_t + ' - ui-view: ' + padString(10, event) + ' ' + uiViewString(viewData) + extra);
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
				msos_debug(temp_t + ' - VIEWCONFIG: ' + event + ' ' + viewConfigString(viewConfig));
			}
        };

        Trace.prototype.traceViewServiceUIViewEvent = function (event, viewData) {
            if (!this.enabled(exports.Category.VIEWCONFIG)) {
                return;
            }
			if (msos_verbose) {
				msos_debug(temp_t + ' - VIEWCONFIG: ' + event + ' ' + uiViewString(viewData));
			}
        };

		if (mvr) {
			msos_debug(temp_t + ' - create ->  done!');
		}
        return Trace;
    }());

    uirouter_trace = new Trace();

	if (msos_debug) {
		uirouter_trace.enable(0, 1);
	} else if (msos_verbose) {
		if (mvr) {
			uirouter_trace.enable(0, 1, 2, 3, 4);
		} else {
			uirouter_trace.enable(0, 1, 3);
		}
	}

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
		var temp_tg = 'ng.ui.router - TargetState';

		if (mvr) {
			msos_debug(temp_tg + ' - create -> start.');
		}

		function TargetState(_stateRegistry, _identifier, _params, _options) {
			this._stateRegistry = _stateRegistry;
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
		TargetState.prototype.withParams = function (params, replace) {

			if (replace === void 0) { replace = false; }

			var newParams = replace ? params : extend({}, this._params, params),
				_this = this;

			return new TargetState(_this._stateRegistry, _this._identifier, newParams, _this._options);
		};
		TargetState.prototype.withOptions = function (options, replace) {

			if (replace === void 0) { replace = false; }

			var newOpts = replace ? options : extend({}, this._options, options),
				_this = this;

			return new TargetState(_this._stateRegistry, _this._identifier, _this._params, newOpts);
		};
		TargetState.isDef = function (obj) {
			return obj && obj.state && (_.isString(obj.state) || _.isString(obj.state.name));
		};

		if (mvr) {
			msos_debug(temp_tg + ' - create ->  done!');
		}

        return TargetState;
    }());

	TransitionHook = (function () {
		var temp_th = 'ng.ui.router - TransitionHook';

		if (mvr) {
			msos_debug(temp_th + ' - create -> start.');
		}

        function TransitionHook(transition, stateContext, registeredHook, options) {
            var _this = this;
            this.transition = transition;
            this.stateContext = stateContext;
            this.registeredHook = registeredHook;
            this.isSuperseded = function () {
                var output = _this.type.hookPhase === exports.TransitionHookPhase.RUN && !_this.options.transition.isActive();

				if (mvr || output === true) {
					msos_debug(temp_th + ' - isSuperseded -> called, t/f: ' + output);
				}

				return output;
            };
            this.options = defaults(options, defaultOptions);
            this.type = registeredHook.eventType;
        }

        TransitionHook.prototype.logError = function (err) {
			msos_error(temp_th + ' - logError -> error:', err);
        };

        TransitionHook.prototype.invokeHook = function (origin_fn) {
            var temp_ih = temp_th + ' - invokeHook',
				_this = this,
				debug_note = '',
				hook = _this.registeredHook,
				hook_cb_name = hook.callback.name || 'anonymous',
				notCurrent,
				options,
				invokeCallback,
				normalizeErr,
				handleError,
				handleResult,
				result,
				output;

			origin_fn = origin_fn || 'missing';

			if (msos_verbose) {
				msos_debug(temp_ih + ' -> start' + msos_indent + 'hook id: ' +  hook.id + msos_indent + 'origin: ' + hook.eventType.origin + '_' + origin_fn);
			}
			

            if (hook._deregistered) {
				if (msos_verbose) {
					msos_debug(temp_ih + ' ->  done, deregistered.');
				}
                return;
            }

            notCurrent = this.getNotCurrentRejection();

            if (notCurrent) {
				if (msos_verbose) {
					msos_debug(temp_ih + ' ->  done, notCurrent:', notCurrent);
				}
                return notCurrent;
            }

            options = this.options;

            invokeCallback = function () {
				var temp_ic = ' - invokeCallback -> called';

				if (msos_verbose) {
					if (hook_cb_name === 'anonymous') {
						msos.console.trace(temp_ih + temp_ic + msos_indent + 'anonymous hook.callback:', hook.callback);
					} else {
						msos_debug(temp_ih + temp_ic + msos_indent + 'hook.callback: ' + hook_cb_name);
					}
				}

                return hook.callback.call(options.bind, _this.transition, _this.stateContext);
            };

            normalizeErr = function (err) {
                return Rejection.normalize(err).toPromise();
            };

            handleError = function (err) {
                return hook.eventType.getErrorHandler(_this)(err);
            };

            handleResult = function (result) {
                return hook.eventType.getResultHandler(_this)(result);
            };

			uirouter_trace.traceHookInvocation(this, this.transition, options);

            try {

				if (mvr && hook_cb_name === 'anonymous') {
					msos.console.trace(temp_ih + ' -> anonymous fn' + msos_indent + 'hook.callback:', hook.callback);
				}

                result = invokeCallback();

                if (!this.type.synchronous && isPromise(result)) {
                    output = result.catch(normalizeErr).then(handleResult, handleError);
					debug_note = 'is promise';
                } else {
                    output = handleResult(result);
					debug_note = 'not promise';
                }

            } catch (err) {
				msos_error(temp_ih + ' -> error:', err);
                output = handleError(Rejection.normalize(err));
            } finally {
				if (hook.invokeLimit && ++hook.invokeCount >= hook.invokeLimit) {
					hook.deregister();
					msos_debug(temp_ih + ' -> finally, deregistered hook.');
				}
			}

			if (msos_verbose) {
				if (output) {
					msos_debug(temp_ih + ' ->  done, ' + debug_note + msos_indent + 'output:', output);
				} else {
					msos_debug(temp_ih + ' ->  done, ' + debug_note + '.');
				}
			}

			return output;
        };

        TransitionHook.prototype.handleHookResult = function (result) {
            var temp_hr = temp_th + ' - handleHookResult',
				_this = this,
				notCurrent,
				isTargetState;

			if (mvr) {
				msos_debug(temp_hr + ' -> start.');
			}

			notCurrent = this.getNotCurrentRejection();

            if (notCurrent) {
				if (mvr) {
					msos_debug(temp_hr + ' ->  done, not current.');
				}
                return notCurrent;
			}

            // Hook returned a promise
            if (isPromise(result)) {
				if (mvr) {
					msos_debug(temp_hr + ' ->  done, returned a promise.');
				}
                return result.then(function (val) {
                    return _this.handleHookResult(val);
                });
            }

            uirouter_trace.traceHookResult(result, this.transition, this.options);

            // Hook returned false
            if (result === false) {
                // Abort this Transition
                return Rejection.aborted('Hook aborted transition').toPromise();
            }

            isTargetState = is(TargetState);

            // hook returned a TargetState
            if (isTargetState(result)) {
                // Halt the current Transition and redirect (a new Transition) to the TargetState.
                return Rejection.redirected(result).toPromise();
            }

			if (mvr) {
				msos_debug(temp_hr + ' ->  done!');
			}
        };

        TransitionHook.prototype.getNotCurrentRejection = function () {
            var th_router = this.transition.router;

            if (th_router._disposed) {
                return Rejection.aborted('UIRouter instance #' + th_router.$id + ' has been stopped (disposed)').toPromise();
            }
            if (this.transition._aborted) {
                return Rejection.aborted().toPromise();
            }
            if (this.isSuperseded()) {
                return Rejection.superseded(this.options.current()).toPromise();
            }
        };

        TransitionHook.prototype.toString = function () {
            var _a = this,
                options = _a.options,
                registeredHook = _a.registeredHook,
				event = parse('traceData.hookType')(options) || 'internal',
                context = parse('traceData.context.state.name')(options) || parse('traceData.context')(options) || 'unknown',
                name = fnToString(registeredHook.callback);

            return event + ' context: ' + context + ', ' + maxLength(200, name);
        };

        TransitionHook.chain = function (hooks, waitFor) {
            // Chain the next hook off the previous
            var createHookChainR = function (prev, nextHook) {
                return prev.then(function () {
                    return nextHook.invokeHook('createHookChainR');
                });
            };
            return hooks.reduce(createHookChainR, waitFor || services.$q.when(services.$q.defer('ui_router_transitionhook_when')));
        };

        TransitionHook.invokeHooks = function (hooks, doneCallback) {
			var temp_ih = temp_th + ' - invokeHooks',
				idx = 0,
				hookResult,
				remainingHooks,
				output;

			msos_debug(temp_ih + ' -> start.');

            for (idx = 0; idx < hooks.length; idx += 1) {

                hookResult = hooks[idx].invokeHook('invokeHooks');

                if (hookResult && isPromise(hookResult)) {
                    remainingHooks = hooks.slice(idx + 1);
					msos_debug(temp_ih + ' ->  done, is promise.');
                    return TransitionHook.chain(
							remainingHooks,
							hookResult
						).then(doneCallback);
                }
            }

			output = doneCallback();

			msos_debug(temp_ih + ' ->  done, doneCallback: ' + (doneCallback.name || 'anonymous'));
            return output;
        };

        TransitionHook.runAllHooks = function (hooks) {
            hooks.forEach(function trans_hook_runall(hook) {
                return hook.invokeHook('runAllHooks');
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

		TransitionHook.LOG_ERROR = function trans_hook_log(hook) {
			return function (error) {
				return hook.logError(error);
			};
		};

		TransitionHook.REJECT_ERROR = function trans_hook_reject() {
			return function (error) {
				return silentRejection(error);
			};
		};

		TransitionHook.THROW_ERROR = function trans_hook_throw() {
			return function (error) {
				throw error;
			};
		};

		if (mvr) {
			msos_debug(temp_th + ' - create ->  done!');
		}
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
		var temp_rh = 'ng.ui.router - RegisteredHook',
			hook_count = 0;

		if (mvr) {
			msos_debug(temp_rh + ' - create -> start.');
		}

		function RegisteredHook(tranSvc, eventType, callback, matchCriteria, removeHookFromRegistry, options) {

			if (options === void 0) { options = {}; }

			hook_count += 1;

			this.id = eventType.name + '_' + hook_count;
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
                var nodes = isStateHook ? path : [_.last(path)];
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

		if (mvr) {
			msos_debug(temp_rh + ' - create ->  done!');
		}
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
		var temp_hb = 'ng.ui.router - HookBuilder';

		if (mvr) {
			msos_debug(temp_hb + ' - create -> start.');
		}

        function HookBuilder(transition) {
            this.transition = transition;
        }

        HookBuilder.prototype.buildHooksForPhase = function (phase) {

			msos_debug(temp_hb + ' - buildHooksForPhase -> start, phase: ' + phase);

            var _this = this,
				$transitions = this.transition.router.transitionService,
				output;

            output = $transitions._pluginapi._getEvents(phase)
                .map(function (type) {
                    return _this.buildHooks(type);
                })
                .reduce(unnestR, [])
                .filter(identity);

			msos_debug(temp_hb + ' - buildHooksForPhase ->  done' + msos_indent + 'TransitionHook count: ' + output.length);

			return output;
        };

        HookBuilder.prototype.buildHooks = function (hookType) {
            var transition = this.transition,
				treeChanges = transition.treeChanges(),
				matchingHooks = this.getMatchingHooks(hookType, treeChanges),
				baseHookOptions,
				makeTransitionHooks;

            if (!matchingHooks) { return []; }

            baseHookOptions = {
                transition: transition,
                current: transition.options().current
            };

            makeTransitionHooks = function (hook) {
                // Fetch the Nodes that caused this hook to match.
                var matches = hook.matches(treeChanges);
                // Select the PathNode[] that will be used as TransitionHook context objects
                var matchingNodes = matches[hookType.criteriaMatchPath.name];
                // Return an array of HookTuples
                return matchingNodes.map(function (node) {
                    var _options = extend(
							{
								bind: hook.bind,
								traceData: {
									hookType: hookType.name,
									context: node
								}
							},
							baseHookOptions
						),
						state = hookType.criteriaMatchPath.scope === exports.TransitionHookScope.STATE ? node.state.self : null,
						transitionHook = new TransitionHook(transition, state, hook, _options);

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

		if (mvr) {
			msos_debug(temp_hb + ' - create ->  done!');
		}
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
			raw: type.raw,
            is: arrayHandler(type.is.bind(type), true),
            $arrayMode: mode
        });
    }

    hasOwn = Object.prototype.hasOwnProperty;

    function isShorthand(cfg) {
        return ['value', 'type', 'squash', 'array', 'dynamic'].filter(hasOwn.bind(cfg || {})).length === 0;
    }

    (function (DefType) {
        DefType[DefType.PATH = 0] = 'PATH';
        DefType[DefType.SEARCH = 1] = 'SEARCH';
        DefType[DefType.CONFIG = 2] = 'CONFIG';
    })(exports.DefType || (exports.DefType = {}));

    function unwrapShorthand(cfg) {
        cfg = isShorthand(cfg) ? { value: cfg } : cfg;
        getStaticDefaultValue.__cacheable = true;
        function getStaticDefaultValue() {
            return cfg.value;
        }
        var $$fn = isInjectable(cfg.value) ? cfg.value : getStaticDefaultValue;
        return extend(cfg, { $$fn: $$fn });
    }

    function getParamDeclaration(paramName, location, state) {
        var noReloadOnSearch = (state.reloadOnSearch === false && location === exports.DefType.SEARCH) || undefined,
			dynamic = find([state.dynamic, noReloadOnSearch], isDefined),
			defaultConfig = isDefined(dynamic) ? { dynamic: dynamic } : {},
			paramConfig = unwrapShorthand(state && state.params && state.params[paramName]);

        return extend(defaultConfig, paramConfig);
    }

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

    Param = (function () {
        function Param(id, type, location, urlConfig, state) {
            var config = getParamDeclaration(id, location, state),
				arrayMode,
				isOptional,
				dynamic,
				raw,
				squash,
				replace,
				inherit$$1;

            type = getType(config, type, location, id, urlConfig.paramTypes);

            arrayMode = getArrayMode();
            type = arrayMode ? type.$asArray(arrayMode, location === exports.DefType.SEARCH) : type;
            isOptional = config.value !== undefined || location === exports.DefType.SEARCH;
            dynamic = isDefined(config.dynamic) ? !!config.dynamic : !!type.dynamic;
            raw = isDefined(config.raw) ? !!config.raw : !!type.raw;
            squash = getSquashPolicy(config, isOptional, urlConfig.defaultSquashPolicy());
            replace = getReplace(config, arrayMode, isOptional, squash);
            inherit$$1 = isDefined(config.inherit) ? !!config.inherit : !!type.inherit;

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

            var getDefaultValue = function () {

                if (_this._defaultValueCache) {
                    return _this._defaultValueCache.defaultValue;
                }

                if (!services.$injector) {
                    throw new Error('Injectable functions cannot be called at configuration time');
                }

                var defaultValue = services.$injector.invoke(
					_this.config.$$fn,
					undefined,
					undefined,
					'ng_ui_router_param_value'
				);

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
			var state = _.last(path).state;
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
		var temp_rs = 'ng.ui.router - Resolvable';

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
            function getResolvableDependencies() {
                return $q.all(
                    $q.defer('ui_router_resolvable_all'),
                    resolveContext.getDependencies(_this).map(
                        function (resolvable) {
                            return resolvable.get(resolveContext, trans);
                        }
                    )
                );
            }
            // Invokes the resolve function passing the resolved dependencies as arguments
            function invokeResolveFn(resolvedDeps) {
				if (mvr) {
					msos_debug(temp_rs + ' - resolve - invokeResolveFn -> called' + msos_indent + 'resolvedDeps:', resolvedDeps);
				}
				
                return _this.resolveFn.apply(null, resolvedDeps);
            }

            function waitForRx(observable$) {
				msos_debug(temp_rs + ' - resolve - waitForRx -> called.');
                var cached = observable$.cache(1);
                return cached.take(1).toPromise().then(function () { return cached; });
            }

            // If the resolve policy is RXWAIT, wait for the observable to emit something. otherwise pass through.
            var node = resolveContext.findNode(this);
            var state = node && node.state;
            var maybeWaitForRx = this.getPolicy(state).async === 'RXWAIT' ? waitForRx : identity;
            // After the final value has been resolved, update the state of the Resolvable

            function applyResolvedValue(resolvedValue) {
				if (mvr) {
					msos_debug(temp_rs + ' - resolve - applyResolvedValue -> called' + msos_indent + 'resolvedValue:', resolvedValue);
				}
                _this.data = resolvedValue;
				_this.resolved = true;
				_this.resolveFn = null;
                uirouter_trace.traceResolvableResolved(_this, trans);
                return _this.data;
            }
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
            LAZY: 'LAZY'
        },
        async: {
            WAIT: 'WAIT',
            NOWAIT: 'NOWAIT',
            RXWAIT: 'RXWAIT'
        }
    };

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
            return _.last(matching);
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

        ResolveContext.prototype.resolvePath = function (trans) {
            var _this = this;

            uirouter_trace.traceResolvePath(this._path, trans);

            var matchesPolicy = function (acceptedVals, whenOrAsync) {
                return function (resolvable) {
                    return inArray(acceptedVals, _this.getPolicy(resolvable)[whenOrAsync]);
                };
            };
            // Trigger all the (matching) Resolvables in the path
            // Reduce all the "WAIT" Resolvables into an array
            var promises = this._path.reduce(function (acc, node) {
                var nodeResolvables = node.resolvables.filter(matchesPolicy(['LAZY'], 'when'));
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
                    return _.last(matching);
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

		if (mvr) {
			msos_debug(temp_tr + ' - create -> start.');
		}

        function Transition(fromPath, targetState, tr_router) {
            var _this = this;

            this._deferred = services.$q.defer('ui_router_transition_defer');
            this.promise = this._deferred.promise;
            this._registeredHooks = {};
            this._hookBuilder = new HookBuilder(this);
            this.isActive = function () {
                return _this.router.globals.transition === _this;
            };
            this.router = tr_router;
            this._targetState = targetState;

            if (!targetState.valid()) { throw new Error(targetState.error()); }

            this._options = extend(
				{ current: val(this) },
				targetState.options()
			);
            this.$id = tr_router.transitionService._transitionCount++;

            var toPath = PathUtils.buildToPath(fromPath, targetState);

            this._treeChanges = PathUtils.treeChanges(fromPath, toPath, this._options.reloadState);
            this.createTransitionHookRegFns();

            var onCreateHooks = this._hookBuilder.buildHooksForPhase(exports.TransitionHookPhase.CREATE);

            TransitionHook.invokeHooks(
				onCreateHooks,
				function on_create_hooks() { return null; }
			);

            this.applyViewConfigs(tr_router);
        }

        Transition.prototype.onBefore = function () {
			msos.console.warn(temp_tr + ' - onBefore -> not set yet.');
            return;
        };

        Transition.prototype.onStart = function () {
			msos.console.warn(temp_tr + ' - onStart -> not set yet.');
            return;
        };

        Transition.prototype.onExit = function () {
			msos.console.warn(temp_tr + ' - onExit -> not set yet.');
            return;
        };

        Transition.prototype.onRetain = function () {
			msos.console.warn(temp_tr + ' - onRetain -> not set yet.');
            return;
        };

        Transition.prototype.onEnter = function () {
			msos.console.warn(temp_tr + ' - onEnter -> not set yet.');
            return;
        };

        Transition.prototype.onFinish = function () {
			msos.console.warn(temp_tr + ' - onFinish -> not set yet.');
            return;
        };

        Transition.prototype.onSuccess = function () {
			msos.console.warn(temp_tr + ' - onSuccess -> not set yet.');
            return;
        };

        Transition.prototype.onError = function () {
			msos.console.warn(temp_tr + ' - onError -> not set yet.');
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
					type.origin = 'pluginapi';
                    return makeEvent(_this, _this.router.transitionService, type);
                });
        };
        /** @internalapi */
        Transition.prototype.getHooks = function (hookName) {
            return this._registeredHooks[hookName];
        };
        Transition.prototype.applyViewConfigs = function (ta_router) {
            var enteringStates = this._treeChanges.entering.map(function (node) {
                return node.state;
            });
            PathUtils.applyViewConfigs(ta_router.transitionService.$view, this._treeChanges.to, enteringStates);
        };

        Transition.prototype.$from = function () {
            return _.last(this._treeChanges.from).state;
        };

        Transition.prototype.$to = function () {
            return _.last(this._treeChanges.to).state;
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

        Transition.prototype._ignoredReason = function () {
			msos_debug(temp_tr + ' - _ignoredReason -> start.');

            var pending = this.router.globals.transition,
				reloadState = this._options.reloadState,
				same = function (pathA, pathB) {
					if (pathA.length !== pathB.length) {
						return false;
					}

					var matching = PathUtils.matching(pathA, pathB);

					return pathA.length === matching.filter(
						function (node) {
							return !reloadState || !node.state.includes[reloadState.name];
						}
					).length;
				},
				newTC = this.treeChanges(),
				pendTC = pending && pending.treeChanges(),
				output;

            if (pendTC && same(pendTC.to, newTC.to) && same(pendTC.exiting, newTC.exiting)) {
                output = 'SameAsPending';
            } else if (newTC.exiting.length === 0 && newTC.entering.length === 0 && same(newTC.from, newTC.to)) {
                output = 'SameAsCurrent';
            }

			if (output) {
				msos_debug(temp_tr + ' - _ignoredReason ->  done, for: ' + output);
			} else {
				msos_debug(temp_tr + ' - _ignoredReason ->  done, new vs pending treeChanges.');
				if (mvr) {
					msos_debug('     newTC:', newTC);
					msos_debug('     pendTC:', pendTC);
				}
			}

			return output;
        };

        Transition.prototype.run = function () {
            var temp_pr = temp_tr + ' - run',
				_this = this,
				runAllHooks = TransitionHook.runAllHooks,
				allBeforeHooks;

			msos_debug(temp_pr + ' ::::> start.');

			function getHooksFor(phase) {
				return _this._hookBuilder.buildHooksForPhase(phase);
			}

			function transitionSuccess() {
				uirouter_trace.traceSuccess(_this.$to(), _this);
				_this.success = true;
				_this._deferred.resolve(_this.to());
				runAllHooks(getHooksFor(exports.TransitionHookPhase.SUCCESS));
			}

			function transitionError(reason) {
				// Unfortunately, not all "errors" are bad...
				if (reason.type !== 2 && reason.type !== 5) {
					msos_error(temp_pr + ' - transitionError -> called, reason: ' + reason.message);
				}

				uirouter_trace.traceError(reason, _this);

				_this.success = false;
				_this._deferred.reject(reason);
				_this._error = reason;

				runAllHooks(getHooksFor(exports.TransitionHookPhase.ERROR));
			}

			function runTransition() {
				if (mvr) {
					msos_debug(temp_pr + ' - runTransition -> start.');
				}
				// Wait to build the RUN hook chain until the BEFORE hooks are done
				// This allows a BEFORE hook to dynamically add additional RUN hooks via the Transition object.
				var allRunHooks = getHooksFor(exports.TransitionHookPhase.RUN),
					run_out;

					function run_trans_done() {
						msos_debug(temp_pr + ' - runTransition - run_trans_done -> called.');
						return services.$q.when(services.$q.defer('ui_router_run_transition_when'), undefined);
					}

					run_out = TransitionHook.invokeHooks(allRunHooks, run_trans_done);

				if (mvr) {
					msos_debug(temp_pr + ' - runTransition ->  done!');
				}

				return run_out;
			}

			function startTransition() {
				var globals = _this.router.globals;
				globals.lastStartedTransitionId = _this.$id;
				globals.transition = _this;
				globals.transitionHistory.enqueue(_this);
				uirouter_trace.traceTransitionStart(_this);
				return services.$q.when(services.$q.defer('ui_router_start_transition_when'), undefined);
			}

			allBeforeHooks = getHooksFor(exports.TransitionHookPhase.BEFORE);

			TransitionHook.invokeHooks(allBeforeHooks, startTransition)
				.then(runTransition)
				.then(transitionSuccess, transitionError);

			msos_debug(temp_pr + ' ::::>  done!');
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

		if (mvr) {
			msos_debug(temp_tr + ' - create ->  done!');
		}
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
    function stringifyPattern(value) {
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
    }

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
        if (_.isString(_.last(acc)) && _.isString(x))
            return acc.slice(0, -1).concat(_.last(acc) + x);
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
                extend(
					this.types[type.name],
					services.$injector.invoke(
						type.def,
						undefined,
						undefined,
						'ng_ui_router_paramTypes_flushTypeQueue'
					)
				);
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

	function parseUrl(url) {
		if (!_.isString(url)) {
			return false;
		}

		var root$$1 = url.charAt(0) === '^';

		return { val: root$$1 ? url.substring(1) : url, root: root$$1 };
	}

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

	function getUrlBuilder($urlMatcherFactoryProvider, root$$1) {
		var temp_ub = 'ng.ui.router - getUrlBuilder - urlBuilder -> ';

        return function urlBuilder(stateObject) {
            var state = stateObject.self,
				parent,
				parsed,
				url,
				output;

			if (msos_verbose) {
				msos_debug(temp_ub + 'start.');
			}

            if (state && state.url && state.name && state.name.match(/\.\*\*$/)) {
                state.url += '{remainder:any}';
            }

            parent = stateObject.parent;
            parsed = parseUrl(state.url);

            url = !parsed ? state.url : $urlMatcherFactoryProvider.compile(parsed.val, { state: state });

            if (!url) {
				msos_debug(temp_ub + ' done, no url.');
                return null;
            }

            if (!$urlMatcherFactoryProvider.isMatcher(url)) {
                throw new Error("Invalid url '" + url + "' in state '" + stateObject + "'");
            }

			output = parsed && parsed.root ? url : ((parent && parent.navigable) || root$$1()).url.append(url);

			if (msos_verbose) {
				msos_debug(temp_ub + ' done' + msos_indent + 'state: \'' + state.name + '\'' + msos_indent + 'output: \'' + output + '\'');
			}

            return output;
        };
    }

    function getNavigableBuilder(isRoot) {
        return function navigableBuilder(state) {
            return !isRoot(state) && state.url ? state : (state.parent ? state.parent.navigable : null);
        };
    }

    function getParamsBuilder(paramFactory) {
        return function paramsBuilder(state) {
            var makeConfigParam = function (config_na, id) {
					return paramFactory.fromConfig(id, null, state.self);
				},
				urlParams = (state.url && state.url.parameters({ inherit: false })) || [],
				nonUrlParams = values(
					mapObj(
						_.omit(state.params || {},
						urlParams.map(prop('id'))),
						makeConfigParam
					)
				);

            return urlParams
				.concat(nonUrlParams)
				.map(function (p) { return [p.id, p]; })
				.reduce(applyPairs, {});
        };
    }

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
        function annotate(fn) {
            var $injector = services.$injector;
            // ng1 doesn't have an $injector until runtime.
            // If the $injector doesn't exist, use "deferred" literal as a
            // marker indicating they should be annotated when runtime starts
            return fn.$inject || ($injector && $injector.annotate(fn, $injector.strictDi)) || 'deferred';
        }
        /** true if the object has both `token` and `resolveFn`, and is probably a [[ResolveLiteral]] */
        function isResolveLiteral(obj) {
            return !!(obj.token && obj.resolveFn);
        }
        /** true if the object looks like a provide literal, or a ng2 Provider */
        function isLikeNg2Provider(obj) {
            return !!((obj.provide || obj.token) && (obj.useValue || obj.useFactory || obj.useExisting || obj.useClass));
        }
        /** true if the object looks like a tuple from obj2Tuples */
        function isTupleFromObj(obj) {
            return !!(obj && obj.val && (_.isString(obj.val) || _.isArray(obj.val) || _.isFunction(obj.val)));
        }
        /** extracts the token from a Provider or provide literal */
        function getToken(p) {
            return p.provide || p.token;
        }
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
                return new Resolvable(tuple.token, _.last(tuple.val), tuple.val.slice(0, -1), tuple.policy);
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

            var self = this,
				root$$1 = function () {
					return matcher.find('');
				},
				isRoot = function (state) {
					return state.name === '';
				};

            function parentBuilder(state) {
                if (isRoot(state)) {
                    return null;
                }

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
					noop_ch
				);

				if (chain !== noop_ch) {
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

    var StateQueueManager = (function () {

        function StateQueueManager(sq_router, states, builder, listeners) {
            this.router = sq_router;
            this.states = states;
            this.builder = builder;
            this.listeners = listeners;
            this.queue = [];
        }
        /** @internalapi */
        StateQueueManager.prototype.dispose = function () {
            this.queue = [];
        };
        StateQueueManager.prototype.register = function (stateDecl) {
            var queue = this.queue,
				state = StateObject.create(stateDecl),
				name = state.name;

            if (!_.isString(name)) {
                throw new Error('State must have a valid name');
            }
            if (this.states.hasOwnProperty(name) || inArray(queue.map(prop('name')), name)) {
                throw new Error("State '" + name + "' is already defined");
            }

            queue.push(state);
            this.flush();
            return state;
        };
        StateQueueManager.prototype.flush = function () {
            var _this = this;
            var _a = this,
                queue = _a.queue,
                states = _a.states,
                builder = _a.builder,
				registered = [], // states that got registered
                orphans = [], // states that don't yet have a parent registered
                previousQueueLength = {}, // keep track of how long the queue when an orphan was first encountered
				getState = function (name) {
					return _this.states.hasOwnProperty(name) && _this.states[name];
				},
				notifyListeners = function () {
					if (registered.length) {
						_this.listeners.forEach(
							function (listener) {
								return listener(
										'registered',
										registered.map(
											function (s) { return s.self; }
										)
									);
							}
						);
					}
				},
				state,
				name_1,
				result,
				orphanIdx,
				existingState,
				existingFutureState,
				prev;

            while (queue.length > 0) {

                state = queue.shift();
                name_1 = state.name;
                result = builder.build(state);
                orphanIdx = orphans.indexOf(state);

                if (result) {
                    existingState = getState(name_1);

                    if (existingState && existingState.name === name_1) {
                        throw new Error("State '" + name_1 + "' is already defined");
                    }

                    existingFutureState = getState(name_1 + '.**');

                    if (existingFutureState) {
                        // Remove future state of the same name
                        this.router.stateRegistry.deregister(existingFutureState);
                    }

                    states[name_1] = state;
                    this.attachRoute(state);

                    if (orphanIdx >= 0) {
                        orphans.splice(orphanIdx, 1);
                    }

                    registered.push(state);
                    continue;
                }

                prev = previousQueueLength[name_1];
                previousQueueLength[name_1] = queue.length;

                if (orphanIdx >= 0 && prev === queue.length) {
                    queue.push(state);
                    notifyListeners();
                    return states;
                } else if (orphanIdx < 0) {
                    orphans.push(state);
                }
	
                queue.push(state);
            }

            notifyListeners();
            return states;
        };

        StateQueueManager.prototype.attachRoute = function (state) {
            if (state.abstract || !state.url) {
                return;
            }

			var rulesApi = this.router.urlService.rules;
            rulesApi.rule(rulesApi.urlRuleFactory.create(state));
        };

        return StateQueueManager;
    }());

    var StateRegistry = (function () {

        function StateRegistry(sr_router) {
            this.router = sr_router;
            this.states = {};
            this.listeners = [];
            this.matcher = new StateMatcher(this.states);
            this.builder = new StateBuilder(this.matcher, sr_router.urlMatcherFactory);
            this.stateQueue = new StateQueueManager(sr_router, this.states, this.builder, this.listeners);
            this._registerRoot();
        }

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

			this._root = this.stateQueue.register(rootStateDef);
            this._root.navigable = null;
        };

        StateRegistry.prototype.dispose = function () {
            var _this = this;
            this.stateQueue.dispose();
            this.listeners = [];
            this.get().forEach(
				function (state) {
					return _this.get(state) && _this.deregister(state);
				}
			);
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
					var rulesApi = _this.router.urlService.rules;

                rulesApi
                    .rules()
                    .filter(propEq('state', _state))
                    .forEach(function (rule) { return rulesApi.removeRule(rule); });
                // Remove state from registry
                delete _this.states[_state.name];
            });

            return deregistered;
        };

        StateRegistry.prototype.deregister = function (stateOrName) {
            var _state = this.get(stateOrName),
				deregisteredStates;

            if (!_state) {
                throw new Error("Can't deregister state; not found: " + stateOrName);
            }

            deregisteredStates = this._deregisterTree(_state.$$state());

            this.listeners.forEach(
				function (listener) {
					return listener(
						'deregistered',
						deregisteredStates.map(
							function (s) { return s.self; }
						)
					);
				}
			);

            return deregisteredStates;
        };

        StateRegistry.prototype.get = function (stateOrName, base) {
            var _this = this,
				found;

            if (arguments.length === 0) {
                return Object.keys(this.states).map(
					function (name) {
						return _this.states[name].self;
					}
				);
			}

            found = this.matcher.find(stateOrName, base);

            return (found && found.self) || null;
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

    function memoizeTo(obj, _prop, fn) {
			obj[_prop] = obj[_prop] || fn();
        return obj[_prop];
    }

    var splitOnSlash = splitOnDelim('/');
	var defaultConfig = {
        state: { params: {} },
        strict: true,
        caseInsensitive: true,
    };

    var UrlMatcher = (function () {

        function UrlMatcher(pattern$$1, paramTypes, paramFactory, config) {
            var _this = this;

            this._cache = { path: [this] };
            this._children = [];
            this._params = [];
            this._segments = [];
            this._compiled = [];
            this.config = config = defaults(config, defaultConfig);
			this.pattern = pattern$$1;

			var placeholder = /([:*])([\w\[\]]+)|\{([\w\[\]]+)(?:\:\s*((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g,
				searchPlaceholder = /([:]?)([\w\[\].-]+)|\{([\w\[\].-]+)(?:\:\s*((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g,
				patterns = [],
				last = 0,
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
						makeRegexpType = function (str) {
								return inherit(paramTypes.type(isSearch ? 'query' : 'path'), {
									pattern: new RegExp(str, _this.config.caseInsensitive ? 'i' : undefined)
								}
							);
						};

					return {
						id: id,
						regexp: regexp,
						segment: pattern$$1.substring(last, m.index),
						type: !regexp ? null : paramTypes.type(regexp) || makeRegexpType(regexp)
					};
				},
				details,
				segment,
				i,
				search;

            while ((matchArray = placeholder.exec(pattern$$1))) {
                details = matchDetails(matchArray, false);

                if (details.segment.indexOf('?') >= 0) {
                    break;
                }

                checkParamErrors(details.id);
                this._params.push(paramFactory.fromPath(details.id, details.type, config.state));
                this._segments.push(details.segment);
                patterns.push([details.segment, _.last(this._params)]);
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
                        details = matchDetails(matchArray, true);
                        checkParamErrors(details.id);
                        this._params.push(paramFactory.fromSearch(details.id, details.type, config.state));
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

    var __assign = (undefined && undefined.__assign) || Object.assign || function (t) {
		var s,
			i = 0,
			n = arguments.length,
			p;

		for (i = 1; i < n; i += 1) {
			s = arguments[i];
			for (p in s) {
				if (Object.prototype.hasOwnProperty.call(s, p)) { t[p] = s[p]; }
			}
			
		}

		return t;
    };

    var ParamFactory = (function () {

        function ParamFactory(pf_router) {
			this.router = pf_router;
		}

        ParamFactory.prototype.fromConfig = function (id, type, state) {
            return new Param(id, type, exports.DefType.CONFIG, this.router.urlService.config, state);
        };
        ParamFactory.prototype.fromPath = function (id, type, state) {
            return new Param(id, type, exports.DefType.PATH, this.router.urlService.config, state);
        };
        ParamFactory.prototype.fromSearch = function (id, type, state) {
            return new Param(id, type, exports.DefType.SEARCH, this.router.urlService.config, state);
        };

        return ParamFactory;
    }());

    var UrlMatcherFactory = (function () {

        function UrlMatcherFactory(um_router) {

            this.router = um_router;
            this.paramFactory = new ParamFactory(this.router);

            extend(
				this,
				{ UrlMatcher: UrlMatcher, Param: Param }
			);
        }

        UrlMatcherFactory.prototype.compile = function (pattern$$1, config) {
            var urlConfig = this.router.urlService.config,
				params = config && !config.state && config.params,
				globalConfig;

            config = params ? __assign({ state: { params: params } }, config) : config;
            globalConfig = {
				strict: urlConfig._isStrictMode,
				caseInsensitive: urlConfig._isCaseInsensitive
			};

            return new UrlMatcher(pattern$$1, urlConfig.paramTypes, this.paramFactory, extend(globalConfig, config));
        };

        UrlMatcherFactory.prototype.isMatcher = function (object) {

            if (!_.isObject(object)) {
                return false;
            }

            var result = true;

            forEach(
				UrlMatcher.prototype,
				function (val$$1, name) {
					if (_.isFunction(val$$1)) {
						result = result && (isDefined(object[name]) && _.isFunction(object[name]));
					}
				}
			);

            return result;
        };

        UrlMatcherFactory.prototype.$get = function () {
            var urlConfig = this.router.urlService.config;

            urlConfig.paramTypes.enqueue = false;
            urlConfig.paramTypes._flushTypeQueue();

            return this;
        };

        return UrlMatcherFactory;
    }());

    var UrlRuleFactory = (function () {

        function UrlRuleFactory(ur_router) {
            this.router = ur_router;
        }
        UrlRuleFactory.prototype.compile = function (str) {
            return this.router.urlMatcherFactory.compile(str);
        };
        UrlRuleFactory.prototype.create = function (what, handler) {
            var _this = this,
				isState = StateObject.isState,
				makeRule = pattern([
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
				]),
				rule = makeRule(what);

            if (!rule) { throw new Error("invalid 'what' in when()"); }

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

        UrlRuleFactory.prototype.fromState = function (state, urf_router) {

            var handler = function (match) {
                var $state = urf_router.stateService;
                var globals = urf_router.globals;
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

    var UrlRouter = (function () {

        function UrlRouter(u_router) {

            this.router = u_router;
            this.urlRuleFactory = new UrlRuleFactory(u_router);
        }

        UrlRouter.prototype.update = function (read) {
            var $url = this.router.locationService;

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

            this.router.urlService.url(urlMatcher.format(params || {}), replace);
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

            options = options || { absolute: false };

            cfg = this.router.urlService.config;
			isHtml5 = cfg.html5Mode();

            if (!isHtml5 && url !== null) {
                url = '#' + cfg.hashPrefix() + url;
            }

            url = appendBasePath(url, isHtml5, options.absolute, cfg.baseHref());

            if (!options.absolute || !url) {
                return url;
            }

            slash = !isHtml5 && url ? '/' : '';
            cfgPort = cfg.port();
            port = (cfgPort === 80 || cfgPort === 443 ? '' : ':' + cfgPort);

            return [cfg.protocol(), '://', cfg.host(), port, slash, url].join('');
        };

        return UrlRouter;
    }());

    var ViewService = (function () {

        function ViewService(vs_router) {
            var _this = this;

			this.router = vs_router;

            this._uiViews = [];
            this._viewConfigs = [];
            this._viewConfigFactories = {};
			this._listeners = [];
            this._pluginapi = {
				_rootViewContext: this._rootViewContext.bind(this),
				_viewConfigFactory: this._viewConfigFactory.bind(this),
				_registeredUIView: function (id) {
					return find(
						_this._uiViews,
						function (view) { return _this.router.$id + "." + view.id === id; }
					);
				},
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
            uirouter_trace.traceViewServiceEvent('<- Removing', viewConfig);
            removeFrom(this._viewConfigs, viewConfig);
        };
        ViewService.prototype.activateViewConfig = function (viewConfig) {
            uirouter_trace.traceViewServiceEvent('-> Registering', viewConfig);
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
			uirouter_trace.traceViewSync(allTuples);
        };

        ViewService.prototype.registerUIView = function (uiView) {
            uirouter_trace.traceViewServiceUIViewEvent('-> Registering', uiView);
			var uiViews = this._uiViews;
			var fqnAndTypeMatches = function (uiv) { return uiv.fqn === uiView.fqn && uiv.$type === uiView.$type; };

			if (uiViews.filter(fqnAndTypeMatches).length) {
				uirouter_trace.traceViewServiceUIViewEvent('!!!! duplicate uiView named:', uiView);
			}
            uiViews.push(uiView);
            this.sync();
            return function () {
                var idx = uiViews.indexOf(uiView);
                if (idx === -1) {
                    uirouter_trace.traceViewServiceUIViewEvent('Tried removing non-registered uiView', uiView);
                    return;
                }
                uirouter_trace.traceViewServiceUIViewEvent('<- Deregistering', uiView);
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
            this.lastStartedTransitionId = -1;
            this.transitionHistory = new Queue([], 1);
            this.successfulTransitions = new Queue([], 1);
        }

        UIRouterGlobals.prototype.dispose = function () {
            this.transitionHistory.clear();
            this.successfulTransitions.clear();
            this.transition = null;
        };

        return UIRouterGlobals;
    }());

	function prioritySort(a, b) {
		return (b.priority || 0) - (a.priority || 0);
	}

	function typeSort(a, b) {
		var weights = { STATE: 4, URLMATCHER: 4, REGEXP: 3, RAW: 2, OTHER: 1 };
		return (weights[a.type] || 0) - (weights[b.type] || 0);
	}

	function urlMatcherSort(a, b) {
		return !a.urlMatcher || !b.urlMatcher ? 0 : UrlMatcher.compare(a.urlMatcher, b.urlMatcher);
	}

	function idSort(a, b) {
		// Identically sorted STATE and URLMATCHER best rule will be chosen by `matchPriority` after each rule matches the URL
		var useMatchPriority = { STATE: true, URLMATCHER: true },
			equal = useMatchPriority[a.type] && useMatchPriority[b.type];

		return equal ? 0 : (a.$id || 0) - (b.$id || 0);
	}

    function defaultRuleSortFn(a, b) {
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
	}

    function getHandlerFn(handler) {
        if (!_.isFunction(handler) && !_.isString(handler) && !is(TargetState)(handler) && !TargetState.isDef(handler)) {
            throw new Error("'handler' must be a string, function, TargetState, or have a state: 'newtarget' property");
        }
        return _.isFunction(handler) ? handler : val(handler);
    }

    var UrlRules = (function () {

        function UrlRules(r_router) {

            this.router = r_router;
            this._sortFn = defaultRuleSortFn;
            this._rules = [];
            this._id = 0;
            this.urlRuleFactory = new UrlRuleFactory(r_router);
        }

        UrlRules.prototype.dispose = function () {
            this._rules = [];
            delete this._otherwiseFn;
        };

        UrlRules.prototype.initial = function (handler) {
            var handlerFn = getHandlerFn(handler),
				matchFn = function (urlParts, mf_router) {
					return mf_router.globals.transitionHistory.size() === 0 && !!/^\/?$/.exec(urlParts.path);
				};

            this.rule(this.urlRuleFactory.create(matchFn, handlerFn));
        };
 
        UrlRules.prototype.otherwise = function (handler) {
            var handlerFn = getHandlerFn(handler);
            this._otherwiseFn = this.urlRuleFactory.create(val(true), handlerFn);
            this._sorted = false;
        };

        UrlRules.prototype.removeRule = function (rule) {
            removeFrom(this._rules, rule);
        };

        UrlRules.prototype.rule = function (rule) {
            var _this = this;

            if (!UrlRuleFactory.isUrlRule(rule)) {
                throw new Error('invalid rule');
            }

            rule.$id = this._id++;
            rule.priority = rule.priority || 0;
            this._rules.push(rule);
            this._sorted = false;

            return function () { return _this.removeRule(rule); };
        };

        UrlRules.prototype.rules = function () {
            this.ensureSorted();
            return this._rules.concat(this._otherwiseFn ? [this._otherwiseFn] : []);
        };

        UrlRules.prototype.sort = function (compareFn) {
            var sorted = this.stableSort(this._rules, (this._sortFn = compareFn || this._sortFn)),
				group = 0,
				i = 0;

            for (i = 0; i < sorted.length; i += 1) {
                sorted[i]._group = group;
                if (i < sorted.length - 1 && this._sortFn(sorted[i], sorted[i + 1]) !== 0) {
                    group++;
                }
            }

            this._rules = sorted;
            this._sorted = true;
        };

        UrlRules.prototype.ensureSorted = function () {
			if (!this._sorted) { this.sort(); }
        };

        UrlRules.prototype.stableSort = function (arr, compareFn) {
            var arrOfWrapper = arr.map(
					function (elem, idx) { return ({ elem: elem, idx: idx }); }
				);

            arrOfWrapper.sort(
				function (wrapperA, wrapperB) {
					var cmpDiff = compareFn(wrapperA.elem, wrapperB.elem);

					return cmpDiff === 0 ? wrapperA.idx - wrapperB.idx : cmpDiff;
				}
			);

            return arrOfWrapper.map(
				function (wrapper) { return wrapper.elem; }
			);
        };

        UrlRules.prototype.when = function (matcher, handler, options) {
            var rule = this.urlRuleFactory.create(matcher, handler);

            if (isDefined(options && options.priority)) {
                rule.priority = options.priority;
            }

            this.rule(rule);

            return rule;
        };

        return UrlRules;
    }());

    var UrlConfig = (function () {

		function UrlConfig(uc_router) {
            var _this = this;

            this.router = uc_router;
            this.paramTypes = new ParamTypes();
            this._isCaseInsensitive = false;
            this._isStrictMode = true;
            this._defaultSquashPolicy = false;
            this.dispose = function () {
				return _this.paramTypes.dispose();
			};
            this.baseHref = function () {
				return _this.router.locationConfig.baseHref();
			};
            this.hashPrefix = function (newprefix) {
				return _this.router.locationConfig.hashPrefix(newprefix);
			};
            this.host = function () {
				return _this.router.locationConfig.host();
			};
            this.html5Mode = function () {
				return _this.router.locationConfig.html5Mode();
			};
            this.port = function () {
				return _this.router.locationConfig.port();
			};
            this.protocol = function () {
				return _this.router.locationConfig.protocol();
			};
        }

        UrlConfig.prototype.caseInsensitive = function (value) {
            return (this._isCaseInsensitive = isDefined(value) ? value : this._isCaseInsensitive);
        };

        UrlConfig.prototype.defaultSquashPolicy = function (value) {
            if (isDefined(value) && value !== true && value !== false && !isString(value)) {
                throw new Error("Invalid squash policy: " + value + ". Valid policies: false, true, arbitrary-string");
            }

            return (this._defaultSquashPolicy = isDefined(value) ? value : this._defaultSquashPolicy);
        };

        UrlConfig.prototype.strictMode = function (value) {
            return (this._isStrictMode = isDefined(value) ? value : this._isStrictMode);
        };

        UrlConfig.prototype.type = function (name, definition, definitionFn) {
            var type = this.paramTypes.type(name, definition, definitionFn);

            return !isDefined(definition) ? type : this;
        };

        return UrlConfig;
    }());

    var UrlService = (function () {
		var temp_us = 'ng.ui.router - UrlService';

        function UrlService(us_router) {
			var _this = this;

			msos_debug(temp_us + ' -> start.');

            this.router = us_router;
			this.interceptDeferred = false;

            this.rules = new UrlRules(this.router);
            this.config = new UrlConfig(this.router);

            this.url = function (newurl, replace, state) {
                return _this.router.locationService.url(newurl, replace, state);
            };

            this.path = function () { return _this.router.locationService.path(); };
            this.search = function () { return _this.router.locationService.search(); };
            this.hash = function () { return _this.router.locationService.hash(); };
            this.onChange = function (callback) { return _this.router.locationService.onChange(callback); };

			msos_debug(temp_us + ' ->  done!');
        }

        UrlService.prototype.dispose = function () {
            this.listen(false);
            this.rules.dispose();
        };

       UrlService.prototype.parts = function () {
            return {
				path: this.path(),
				search: this.search(),
				hash: this.hash()
			};
        };

        UrlService.prototype.sync = function (evt) {

			msos_debug(temp_us + ' - sync ====> start.');

            if (evt && evt.defaultPrevented) {
				msos_debug(temp_us + ' - sync ====>  done, defaultPrevented.');
                return;
            }

            var _a = this.router,
				debug_note = 'na',
				urlService = _a.urlService,
				stateService = _a.stateService,
				url = {
					path: urlService.path(),
					search: urlService.search(),
					hash: urlService.hash()
				},
				best = this.match(url),
				applyResult = pattern(
					[
						[_.isString, function (newurl) {
							debug_note = 'string';
							return urlService.url(newurl, true);
						}],
						[TargetState.isDef, function (def) {
							debug_note = 'def';
							return stateService.go(def.state, def.params, def.options);
						}],
						[is(TargetState), function (target) {
							debug_note = 'target';
							return stateService.go(target.state(), target.params(), target.options());
						}]
					]
				);

            applyResult(best && best.rule.handler(best.match, url, _a));

			msos_debug(temp_us + ' - sync ====>  done, apply result via, ' + debug_note);
        };

        UrlService.prototype.listen = function (enabled) {
            var _this = this;

			msos_debug(temp_us + ' - listen -> start.');

            if (enabled === false) {
				if (this._stopListeningFn) {
					this._stopListeningFn();
					delete this._stopListeningFn;
				}
				msos_debug(temp_us + ' - listen ->  done, enabled === false.');
				return undefined;
            }

			if (_.isUndefined(this._stopListeningFn)) {
				this._stopListeningFn = this.router.urlService.onChange(function rt_url_service_onchange(evt) { return _this.sync(evt); });
			}

			msos_debug(temp_us + ' - listen ->  done!');
			return this._stopListeningFn;
        };

        UrlService.prototype.deferIntercept = function (defer) {
            if (defer === undefined) {
                defer = true;
            }
            this.interceptDeferred = defer;
        };

        UrlService.prototype.match = function (url) {
            var _this = this,
				rules,
				checkRule,
				best,
				i = 0,
				current;

            url = extend(
				{ path: '', search: {}, hash: '' },
				url
			);

            rules = this.rules.rules();

            checkRule = function (rule) {
                var match = rule.match(url, _this.router);
                return match && { match: match, rule: rule, weight: rule.matchPriority(match) };
            };

            for (i = 0; i < rules.length; i += 1) {
                // Stop when there is a 'best' rule and the next rule sorts differently than it.
                if (best && best.rule._group !== rules[i]._group) {
                    break;
                }

                current = checkRule(rules[i]);
                // Pick the best MatchResult
                best = !best || (current && current.weight > best.weight) ? current : best;
            }

            return best;
        };

        return UrlService;
    }());

    var _routerInstance = 0,
		locSvcFns = ['url', 'path', 'search', 'hash', 'onChange'],
		locCfgFns = ['port', 'protocol', 'host', 'baseHref', 'html5Mode', 'hashPrefix'],
		locationServiceStub = makeStub('LocationServices', locSvcFns),
		locationConfigStub = makeStub('LocationConfig', locCfgFns);

    var UIRouter = (function () {

        function UIRouter(locationService, locationConfig) {
            if (locationService === void 0) {
                locationService = locationServiceStub;
            }
            if (locationConfig === void 0) {
                locationConfig = locationConfigStub;
            }

            this.locationService = locationService;
            this.locationConfig = locationConfig;

            this.$id = _routerInstance++;
            this._disposed = false;
            this._disposables = [];
            this.trace = uirouter_trace;
            this.viewService = new ViewService(this);
            this.globals = new UIRouterGlobals();
			this.transitionService = new TransitionService(this);
            this.urlMatcherFactory = new UrlMatcherFactory(this);
            this.urlRouter = new UrlRouter(this);
			this.urlService = new UrlService(this);
            this.stateRegistry = new StateRegistry(this);
            this.stateService = new StateService(this);
            this._plugins = {};
            this.viewService._pluginapi._rootViewContext(this.stateRegistry.root());
            this.globals.$current = this.stateRegistry.root();
            this.globals.current = this.globals.$current.self;
            this.disposable(this.globals);
            this.disposable(this.stateService);
            this.disposable(this.stateRegistry);
            this.disposable(this.transitionService);
            this.disposable(this.urlService);
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

    function registerAddCoreResolvables(transitionService) {
        return transitionService.onCreate({}, addCoreResolvables);
    }

	var TRANSITION_TOKENS = ['$transition$', Transition],
		isTransition = inArray(TRANSITION_TOKENS);

	function treeChangesCleanup(trans) {
		var nodes = values(trans.treeChanges()).reduce(unnestR, []).reduce(uniqR, []),
			replaceTransitionWithNull = function (r) {
				return isTransition(r.token) ? Resolvable.fromData(r.token, null) : r;
			};

		nodes.forEach(
			function (node) {
				node.resolvables = node.resolvables.map(replaceTransitionWithNull);
			}
		);
	}

    function redirectToHook(trans) {
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
    }

    function registerRedirectToHook(transitionService) {
        return transitionService.onStart({
            to: function (state) {
                return !!state.redirectTo;
            }
        }, redirectToHook);
    }

    function makeEnterExitRetainHook(hookName) {
        return function (transition, state) {
            var _state = state.$$state();
            var hookFn = _state[hookName];
            return hookFn(transition, state);
        };
    }

    var onExitHook = makeEnterExitRetainHook('onExit');

    function registerOnExitHook(transitionService) {
        return transitionService.onExit({
            exiting: function (state) {
                return !!state.onExit;
            }
        }, onExitHook);
    }

    var onRetainHook = makeEnterExitRetainHook('onRetain');

    function registerOnRetainHook(transitionService) {
        return transitionService.onRetain({
            retained: function (state) {
                return !!state.onRetain;
            }
        }, onRetainHook);
    }

    var onEnterHook = makeEnterExitRetainHook('onEnter');

    function registerOnEnterHook(transitionService) {
        return transitionService.onEnter({
            entering: function (state) {
                return !!state.onEnter;
            }
        }, onEnterHook);
    }

	var RESOLVE_HOOK_PRIORITY = 1000;

    function lazyResolveState(trans, state) {
        return new ResolveContext(trans.treeChanges().to)
            .subContext(state.$$state())
            .resolvePath(trans);
    }

	function registerLazyResolveState(transitionService) {
        return transitionService.onEnter(
					{ entering: val(true) },
					lazyResolveState,
					{ priority: RESOLVE_HOOK_PRIORITY }
				);
    }

	function resolveRemaining(trans) {
			return new ResolveContext(trans.treeChanges().to)
				.resolvePath(trans);
	}

	function registerResolveRemaining(transitionService) {
		return transitionService.onFinish({}, resolveRemaining, { priority: RESOLVE_HOOK_PRIORITY });
	}

    function loadEnteringViews(transition) {
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
			);
    }

    function registerLoadEnteringViews(transitionService) {
        return transitionService.onFinish({}, loadEnteringViews);
    }

    function activateViews(transition) {
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
    }

    function registerActivateViews(transitionService) {
        return transitionService.onSuccess({}, activateViews);
    }

    function updateGlobalState(trans) {
        var globals = trans.router.globals;
        var transitionSuccessful = function transitionSuccessfulFn() {
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
    }

    function registerUpdateGlobalState(transitionService) {
        return transitionService.onCreate({}, updateGlobalState);
    }

    function registerUpdateUrl(transitionService) {

		var temp_ru = 'ng.ui.router.init - registerUpdateUrl',
			tran_serv,
			updateUrl;

		if (msos_verbose) {
			msos_debug(temp_ru + ' -> start.');
		}

		updateUrl = function updateUrlFn(transition) {
			var options = transition.options(),
				$state = transition.router.stateService,
				$urlRouter = transition.router.urlRouter,
				dbug = 'skipped.';

			msos_debug(temp_ru + ' - updateUrl -> start,\n     options:', options);

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

		if (msos_verbose) {
			msos_debug(temp_ru + ' ->  done!');
		}
		return tran_serv;
    }

    function lazyLoadHook(transition) {
        var temp_llh = 'ng.ui.router - lazyLoadHook',
			ll_router = transition.router,
			promises;

		if (msos_verbose) {
			msos_debug(temp_llh + ' -> start.');
		}

        function retryTransition() {
			var orig_target_state,
				$url,
				result,
				rule,
				state,
				params;

			msos_debug(temp_llh + ' - retryTransition -> start.');

            if (transition.originalTransition().options().source !== 'url') {
                orig_target_state = transition.targetState();

				msos_debug(temp_llh + ' - retryTransition ->  done, not via url sync' + msos_indent + 'targetState:', orig_target_state);
                return ll_router.stateService.target(orig_target_state.identifier(), orig_target_state.params(), orig_target_state.options());
            }

            // The original transition was triggered via url sync
            // Run the URL rules and find the best match
            $url = ll_router.urlService;
            result = $url.match($url.parts());
            rule = result && result.rule;

            // If the best match is a state, redirect the transition (instead
            // of calling sync() which supersedes the current transition)
            if (rule && rule.type === 'STATE') {
                state = rule.state;
                params = result.match;

				msos_debug(temp_llh + ' - retryTransition ->  done, via url sync, best match' + msos_indent +'state:', state);
                return ll_router.stateService.target(state, params, transition.options());
            }

            // No matching state found, so let .sync() choose the best non-state match/otherwise
            ll_router.urlService.sync();

			msos_debug(temp_llh + ' - retryTransition ->  done, use url sync, for best non-state match.');
			return undefined;
        }

        promises = transition.entering().filter(
			function filter_lazylooad_state(state) { return !!state.$$state().lazyLoad; }
		).map(
			function map_lazyload_state(state) { return lazyLoadState(transition, state); }
		);

		if (msos_verbose) {
			msos_debug(temp_llh + ' ->  done!');
		}

        return services.$q.all(services.$q.defer('ui_router_loadenteringviews_when'), promises).then(retryTransition);
    }

    function registerLazyLoadHook(transitionService) {
        return transitionService.onBefore(
			{ entering: function (state) { return !!state.lazyLoad; } },
			lazyLoadHook,
			{ priority: -10001 }	// experimental, was default -> 0
		);
    }

    function lazyLoadState(transition, state) {
        var temp_ll = 'ng.ui.router - lazyLoadState',
			db_note = 'included lazyLoadFn promise.',
			lazyLoadFn = state.$$state().lazyLoad,
			promise = lazyLoadFn._promise,
			success,
			error;

		msos_debug(temp_ll + ' -> start.');

        function updateStateRegistry(result) {
            if (result && _.isArray(result.states)) {
                result.states.forEach(function (_state) {
                    return transition.router.stateRegistry.register(_state);
                });
            }

            return result;
        }

        if (!promise) {

            success = function (result) {
                delete state.lazyLoad;
                delete state.$$state().lazyLoad;
                delete lazyLoadFn._promise;
                return result;
            };

            error = function (err) {
                delete lazyLoadFn._promise;
                return services.$q.reject(services.$q.defer('ui_router_lazyloadstate_reject'), err);
            };

            promise = lazyLoadFn._promise =
                services.$q.when(services.$q.defer('ui_router_lazyloadstate_when'), lazyLoadFn(transition, state))
                .then(updateStateRegistry)
                .then(success, error);

			db_note = 'added lazyLoadFn promise.';
        }

		msos_debug(temp_ll + ' ->  done, note: ' + db_note);
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
        var temp_ih = 'ng.ui.router - ignoredHook',
			ignoredReason,
			pending;

		msos_debug(temp_ih + ' -> start.');

		ignoredReason = trans._ignoredReason();

        if (!ignoredReason) {
			msos_debug(temp_ih + ' ->  done, no ignored reason.');
			return;
		}

        uirouter_trace.traceTransitionIgnored(trans);

        pending = trans.router.globals.transition;

        if (ignoredReason === 'SameAsCurrent' && pending) {
            pending.abort();
        }

		msos_debug(temp_ih + ' ->  done, for: ' + ignoredReason);
        // was return Rejection.ignored().toPromise();
		return Rejection.ignored(ignoredReason).toPromise();
    }

    function registerIgnoredTransitionHook(transitionService) {
		msos_debug('ng.ui.router - registerIgnoredTransitionHook -> called.');
        return transitionService.onBefore(
			{},
			ignoredHook,
			{ priority: -9999 }
		);
    }

    function invalidTransitionHook(trans) {
        if (!trans.valid()) {
            throw new Error(trans.error());
        }
    }

    function registerInvalidTransitionHook(transitionService) {
		msos_debug('ng.ui.router - registerInvalidTransitionHook -> called.');
        return transitionService.onBefore(
			{},
			invalidTransitionHook,
			{ priority: -10000 }
		);
    }

    var defaultTransOpts = {
        location: true,
        relative: null,
        inherit: false,
        notify: true,
        reload: false,
        custom: {},
        current: function def_trans_opt() {
            return null;
        },
        source: 'unknown'
    };

    var TransitionService = (function () {
		var temp_ts = 'ng.ui.router.init - TransitionService';

		if (mvr) {
			msos_debug(temp_ts + ' - create -> start.');
		}

        function TransitionService(_router) {

			if (msos_verbose) {
				msos_debug(temp_ts + ' -> start.');
			}

            this._transitionCount = 0;
            this._eventTypes = [];
            this._registeredHooks = {};
            this._criteriaPaths = {};
            this._router = _router;
            this.$view = _router.viewService;
            this._deregisterHookFns = {};
            this._pluginapi = createProxyFunctions(
				val(this),
				{},
				val(this),
				['_definePathType', '_defineEvent', '_getPathTypes', '_getEvents', 'getHooks',]
			);
            this._defineCorePaths();
            this._defineCoreEvents();
            this._defineCoreHooks();	// was this._registerCoreTransitionHooks

			_router.globals.successfulTransitions.onEvict(treeChangesCleanup);

			if (msos_verbose) {
				msos_debug(temp_ts + ' ->  done!');
			}
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
            var Phase = exports.TransitionHookPhase,
				TH = TransitionHook,
				paths = this._criteriaPaths,
				NORMAL_SORT = false,
                REVERSE_SORT = true,
				SYNCHRONOUS = true;

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

        TransitionService.prototype._defineCorePaths = function () {
            var STATE = exports.TransitionHookScope.STATE,
                TRANSITION = exports.TransitionHookScope.TRANSITION;
            this._definePathType('to', TRANSITION);
            this._definePathType('from', TRANSITION);
            this._definePathType('exiting', STATE);
            this._definePathType('retained', STATE);
            this._definePathType('entering', STATE);
        };

        TransitionService.prototype._defineEvent = function (name, hookPhase, hookOrder, criteriaMatchPath, reverseSort, getResultHandler, getErrorHandler, synchronous) {
			var eventType = new TransitionEventType(name, hookPhase, hookOrder, criteriaMatchPath, reverseSort, getResultHandler, getErrorHandler, synchronous);
			eventType.origin = 'define_event';

            this._eventTypes.push(eventType);
            makeEvent(this, this, eventType);
        };

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

        TransitionService.prototype._getPathTypes = function () {
            return this._criteriaPaths;
        };

        TransitionService.prototype.getHooks = function (hookName) {
            return this._registeredHooks[hookName];
        };

        TransitionService.prototype._defineCoreHooks = function () {
            var fns = this._deregisterHookFns;

			if (msos_verbose) {
				msos_debug(temp_ts + ' - _defineCoreHooks -> start.');
			}

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

			if (msos_verbose) {
				msos_debug(temp_ts + ' - _defineCoreHooks ->  done!');
			}
        };

		if (mvr) {
			msos_debug(temp_ts + ' - create ->  done!');
		}
        return TransitionService;
    }());

    var StateService = (function () {
		var temp_ss = 'ng.ui.router - StateService',
			boundFns;

		if (mvr) {
			msos_debug(temp_ss + ' - create -> start.');
		}

        function StateService(ss_router) {
			var getters = ['current', '$current', 'params', 'transition'];

            this.router = ss_router;
            this.invalidCallbacks = [];

            boundFns = Object.keys(StateService.prototype).filter(not(inArray(getters)));
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

        StateService.prototype.dispose = function () {
			msos_debug(temp_ss + ' - dispose -> called.');
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

			if (mvr) {
				msos_debug(temp_ss + ' - go -> called' + msos_indent + 'options:', transOpts);
			} else {
				msos_debug(temp_ss + ' - go -> called.');
			}

            return this.transitionTo(to, params, transOpts);
        };

        StateService.prototype.target = function (identifier, params, options) {
			var reg = this.router.stateRegistry;

			msos_debug(temp_ss + ' - target -> start, identifier: ' + identifier + msos_indent + 'options:', options);

            if (options === void 0) { options = {}; }

            if (_.isObject(options.reload) && !options.reload.name) {
                throw new Error('Invalid reload state object');
            }

            options.reloadState = options.reload === true ? reg.root() : reg.matcher.find(options.reload, options.relative);

            if (options.reload && !options.reloadState) {
                throw new Error("No such reload state '" + (_.isString(options.reload) ? options.reload : options.reload.name) + "'");
            }

			msos_debug(temp_ss + ' - target ->  done, identifier: ' + identifier + msos_indent + 'options:', options);
			return new TargetState(reg, identifier, params, options);
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
            var sst_router = this.router,
				globals = sst_router.globals,
				ref,
				currentPath,
				rejectedTransitionHandler,
				transition,
				transitionToPromise,
				output;

			function getCurrent() {
					return globals.transition;
			}

            if (toParams === void 0) {
                toParams = {};
            }

            if (options === void 0) {
                options = {};
            }

			msos_debug(temp_ss + ' - transitionTo -> start' + msos_indent + 'options:', options);

            options = extend(
				defaults(options, defaultTransOpts),
				{ current: getCurrent }
			);

            ref = this.target(to, toParams, options);

            currentPath = this.getCurrentPath();

            if (!ref.exists()) {
				msos_debug(temp_ss + ' - transitionTo ->  done, non-existant ref:', ref);
                return this._handleInvalidTargetState(currentPath, ref);
            }
            if (!ref.valid()) {
				msos_debug(temp_ss + ' - transitionTo ->  done, invalid ref:', ref);
                return silentRejection(ref.error());
            }

			msos_debug(temp_ss + ' - transitionTo -> current PathNode state name: ' + (currentPath[0].state.name || 'root'));

            rejectedTransitionHandler = function (_trans) {
                return function (error) {
					var temp_rth = temp_ss + ' - transitionTo - rejectedTransitionHandler -> ';

					msos_debug(temp_rth + 'start, type: ' + error.type);

                    if (error instanceof Rejection) {
                        var isLatest = sst_router.globals.lastStartedTransitionId === _trans.$id;
                        if (error.type === exports.RejectType.IGNORED) {
							if (isLatest) {
								sst_router.urlRouter.update();
							}
							msos_debug(temp_rth + ' done, ignored, isLatest: ' + isLatest);
                            // Consider ignored `Transition.run()` as a successful `transitionTo`
                            return services.$q.when(services.$q.defer('ui_router_rejectedtransitionhandler_when'), globals.current);
                        }
                        var detail = error.detail;
                        if (error.type === exports.RejectType.SUPERSEDED && error.redirected && detail instanceof TargetState) {
                            // If `Transition.run()` was redirected, allow the `transitionTo()` promise to resolve successfully
                            // by returning the promise for the new (redirect) `Transition.run()`.
                            var redirect = _trans.redirect(detail);
							msos_debug(temp_rth + ' done, superseded' + msos_indent + 'detail:', detail);
                            return redirect.run().catch(rejectedTransitionHandler(redirect));
                        }
                        if (error.type === exports.RejectType.ABORTED) {
							if (isLatest) {
								sst_router.urlRouter.update();
							}
							msos_debug(temp_rth + ' done, aborted, isLatest: ' + isLatest);
                            return services.$q.reject(services.$q.defer('ui_router_rejectedtransition_abort_reject'), error);
                        }
                    }

					msos_error(temp_rth + ' done' + msos_indent + 'error:', error);
                    return services.$q.reject(services.$q.defer('ui_router_rejectedtransition_default_reject'), error);
                };
            };

            transition = this.router.transitionService.create(currentPath, ref);
            transitionToPromise = transition.run().catch(rejectedTransitionHandler(transition));

			output = extend(
				transitionToPromise,
				{ transition: transition }
			);

			msos_debug(temp_ss + ' - transitionTo ->  done' + msos_indent + 'output: ' + output.$$prom_state.name);
			return output;
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

		if (mvr) {
			msos_debug(temp_ss + ' - create ->  done!');
		}
        return StateService;
    }());

    function beforeAfterSubstr$1(char) {
        return function (str) {
            if (!str)
                return ['', ''];
            var idx = str.indexOf(char);
            if (idx === -1)
                return [str, ''];
            return [str.substr(0, idx), str.substr(idx + 1)];
        };
    }

	function stripLastPathElement(str) { return str.replace(/\/[^/]*$/, ''); }

    var splitHash = beforeAfterSubstr$1('#');
    var splitQuery = beforeAfterSubstr$1('?');
    var splitEqual = beforeAfterSubstr$1('=');

    function trimHashVal(str) {
        return str ? str.replace(/^#/, '') : '';
    }

	function keyValsToObjectR(accum, _a) {
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
	}

    function getParams(queryString) {
        return queryString.split('&').filter(identity).map(splitEqual).reduce(keyValsToObjectR, {});
    }

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

    function buildUrl(loc) {
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
    }

    var BaseLocationServices = (function () {
        function BaseLocationServices(bl_router, fireAfterUpdate) {
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

    (function (_super) {

        function HashLocationService(hl_router) {
            var _this = _super.call(this, hl_router, false) || this;
            window.addEventListener('hashchange', _this._listener, false);
            return _this;
        }

		msos._extends(HashLocationService, _super);

        HashLocationService.prototype._get = function () {
            return trimHashVal(this._location.hash);
        };
        HashLocationService.prototype._set = function (state, title, url) {
            this._location.hash = url;
        };
        HashLocationService.prototype.dispose = function (hld_router) {
            _super.prototype.dispose.call(this, hld_router);
            window.removeEventListener('hashchange', this._listener);
        };
        return HashLocationService;
    }(BaseLocationServices));

    (function (_super) {

        function MemoryLocationService(ml_router) {
            return _super.call(this, ml_router, true) || this;
        }

		msos._extends(MemoryLocationService, _super);

        MemoryLocationService.prototype._get = function () {
            return this._url;
        };
        MemoryLocationService.prototype._set = function (state, title, url) {
            this._url = url;
        };
        return MemoryLocationService;
    }(BaseLocationServices));

    (function (_super) {

        function PushStateLocationService(ps_router) {
            var _this = _super.call(this, ps_router, true) || this;
            _this._config = ps_router.urlService.config;
            window.addEventListener('popstate', _this._listener, false);
            return _this;
        }

		msos._extends(PushStateLocationService, _super);

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
        PushStateLocationService.prototype.dispose = function (psd_router) {
            _super.prototype.dispose.call(this, psd_router);
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

        if (!state.parent) { return {}; }

        var tplKeys = ['templateProvider', 'templateUrl', 'template', 'notify', 'async'],
            ctrlKeys = ['controller', 'controllerProvider', 'controllerAs', 'resolveAs'],
            compKeys = ['component', 'bindings', 'componentProvider'],
            nonCompKeys = tplKeys.concat(ctrlKeys),
            allViewKeys = compKeys.concat(nonCompKeys),
			views = {},
			viewsObject;

        if (isDefined(state.views) && hasAnyKey(allViewKeys, state)) {
            throw new Error("State '" + state.name + "' has a 'views' object. " +
                "It cannot also have \"view properties\" at the state level.  " +
                "Move the following properties into a view (in the 'views' object): " +
                (" " + allViewKeys.filter(function (key) {
                    return isDefined(state[key]);
                }).join(", ")));
        }

        viewsObject = state.views || { '$default': _.pick(state, allViewKeys) };

        forEach(
			viewsObject,
			function (config, name) {
				var normalized;

				// Account for views: { "": { template... } }
				name = name || '$default';

				// Account for views: { header: "headerComponent" }
				if (_.isString(config)) { config = { component: config }; }

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

				normalized = ViewService.normalizeUIViewTarget(config.$context, config.$name);

				config.$uiViewName = normalized.uiViewName;
				config.$uiViewContextAnchor = normalized.uiViewContextAnchor;

				views[name] = config;
			}
		);

		if (mvr) {
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
                uirouter_trace.traceViewServiceEvent('Loaded', _this);
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
            var providerFn = _.isArray(provider) ? _.last(provider) : provider;
            var resolvable = new Resolvable('', providerFn, deps);
            return resolvable.get(context);
        };
        return Ng1ViewConfig;
    }());

    var TemplateFactory = (function () {
		var temp_tf = 'ng.ui.router.util - TemplateFactory';

        function TemplateFactory() {
			var _this = this;

			msos_debug(temp_tf + ' -> start.');

            this.$get = ['$http', '$templateCache', '$injector', '$compile', function ($http, $templateCache, $injector, $compile) {
                _this.$templateRequest = $injector.has && $injector.has('$templateRequest') && $injector.get('$templateRequest');
                _this.$http = $http;
                _this.$templateCache = $templateCache;
				_this.$compile = $compile;
                return _this;
            }];

			msos_debug(temp_tf + ' ->  done!');
        }

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
            if (_.isFunction(url)) {
                url = url(params);
            }
            if (url === null || url === undefined) {
                return null;
            }

            return this.$templateRequest(url);
        };

        TemplateFactory.prototype.fromProvider = function (provider, params, context) {
            var deps = services.$injector.annotate(provider);
            var providerFn = _.isArray(provider) ? _.last(provider) : provider;
            var resolvable = new Resolvable('', providerFn, deps);
            return resolvable.get(context);
        };

        TemplateFactory.prototype.fromComponentProvider = function (provider, params, context) {
            var deps = services.$injector.annotate(provider);
            var providerFn = _.isArray(provider) ? _.last(provider) : provider;
            var resolvable = new Resolvable('', providerFn, deps);
            return resolvable.get(context);
        };

        TemplateFactory.prototype.makeComponentTemplate = function (uiView, context, component, bindings) {
            bindings = bindings || {};

            var _this = this,
				parseDirectiveBindings = _this.$compile.$$parseDirectiveBindings,
				temp_mc = temp_tf + ' - makeComponentTemplate',
				prefix = '::',
				attrs,
				kebobName;

			msos_debug(temp_mc + ' -> start, for component: ' + component);

            function kebob(camelCase) {
                var kebobed = kebobString(camelCase);
                return /^(x|data)-/.exec(kebobed) ? 'x-' + kebobed : kebobed;
            }

			// Gets all the directive(s)' inputs ('@', '=', and '<') and outputs ('&')
			function getComponentBindings(name) {
				var directives = services.$injector.get(name + 'Directive'),	// could be multiple
					directive,
					i = 0,
					btc = [],
					bindings = [];

				if (!directives || !directives.length) {
					throw new Error("Unable to find component named '" + name + "'");
				}

				for (i = 0; i < directives.length; i += 1) {
					directive = directives[i];
					btc = _.values(parseDirectiveBindings(directive, directive.name).bindToController);
					if (btc && btc.length) { bindings = bindings.concat(btc); }
				}

				return bindings;
			}

            function attributeTpl(input) {
                var name = input.attrName,
                    type = input.mode,
					attrName = kebob(name),
					resolveName,
					res,
					fn,
					args,
					arrayIdxStr;

				msos_debug(temp_mc + ' - attributeTpl -> start' + msos_indent + 'name: ' + name + msos_indent + 'input:', input);

                if (uiView.attr(attrName) && !bindings[name]) {
					msos_debug(temp_mc + ' - attributeTpl -> done, for uiView attr, no binding.');
                    return attrName + "='" + uiView.attr(attrName) + "'";
                }

                resolveName = bindings[name] || name;

                if (type === '@') {
					msos_debug(temp_mc + ' - attributeTpl -> done, type @.');
                    return attrName + "='{{" + prefix + "$resolve." + resolveName + "}}'";
                }

                if (type === '&') {
                    res = context.getResolvable(resolveName);
                    fn = res && res.data;
                    args = fn && services.$injector.annotate(fn) || [];
                    arrayIdxStr = _.isArray(fn) ? '[' + (fn.length - 1) + ']' : '';

					msos_debug(temp_mc + ' - attributeTpl -> done, type &.');
                    return attrName + "='$resolve." + resolveName + arrayIdxStr + "(" + args.join(",") + ")'";
                }

                msos_debug(temp_mc + ' - attributeTpl -> done, type = or <.');
                return attrName + "='" + prefix + "$resolve." + resolveName + "'";
            }

            attrs = getComponentBindings(component).map(attributeTpl).join(' ');
            kebobName = kebob(component);

			msos_debug(temp_mc + ' ->  done' + msos_indent + 'attrs: ' + attrs);
            return '<' + kebobName + ' ' + attrs + '></' + kebobName + '>';
        };

        return TemplateFactory;
    }());

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

    var Ng1LocationServices = (function () {
		var temp_ns = 'ng.ui.router - Ng1LocationServices';

		if (mvr) {
			msos_debug(temp_ns + ' - create -> start.');
		}

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
            return html5Mode && ngm_angular.history_pushstate;
        };

		Ng1LocationServices.prototype.baseHref = function () {
            return this._baseHref || (this._baseHref = this.$browser.baseHref() || this.$window.location.pathname);
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

        Ng1LocationServices.prototype._runtimeServices = function ($rootScope, $location, $browser, $window) {
            var _this = this;
            this.$location = $location;
			this.$browser = $browser;
			this.$window = $window;

            // Bind $locationChangeSuccess to the listeners registered in LocationService.onChange
            $rootScope.$on(
				'$locationChangeSuccess',
				function ng_ui_router_loc_chg_on_ng1(evt) {
					if (msos_verbose) {
						msos_debug(temp_ns + ' - ng_ui_router_loc_chg_on_ng1 -> called' + msos_indent + '_this._urlListeners:', _this._urlListeners);
					}

					return _this._urlListeners.forEach(
							function (fn) { return fn(evt); }
						);
				}
			);

            var _loc = val($location);

            createProxyFunctions(_loc, this, _loc, ['replace', 'path', 'search', 'hash']);
            createProxyFunctions(_loc, this, _loc, ['port', 'protocol', 'host']);
        };

		if (mvr) {
			msos_debug(temp_ns + ' - create ->  done!');
		}
        return Ng1LocationServices;
    }());

    var UrlRouterProvider = (function () {
		var temp_ur = 'ng.ui.router.create - UrlRouterProvider';

		if (mvr) {
			msos_debug(temp_ur + ' -> start.');
		}

        function UrlRouterProvider(up_router) {
            this.router = up_router;
        }

        UrlRouterProvider.prototype.$get = function () {
			msos_debug(temp_ur + ' - $get -> start.');

            var urlService = this.router.urlService,
				debug = 'skipped listen().';

            this.router.urlRouter.update(true);

            if (!urlService.interceptDeferred) {
                urlService.listen();
				debug = 'called listen().';
            }

			msos_debug(temp_ur + ' - $get ->  done, ' + debug);
            return this.router.urlRouter;
        };

        UrlRouterProvider.prototype.rule = function (ruleFn) {

            if (!_.isFunction(ruleFn)) {
                throw new Error("'rule' must be a function");
            }

            var _this = this,
				match = function () {
					return ruleFn(
						services.$injector,
						_this.router.locationService
					);
				},
				rule = new BaseUrlRule(match, identity);

			this.router.urlService.rules.rule(rule);

            return this;
        };

        UrlRouterProvider.prototype.otherwise = function (rule) {
            var _this = this,
				urlRules = this.router.urlService.rules;

            if (_.isString(rule)) {
                urlRules.otherwise(rule);
            } else if (_.isFunction(rule)) {
                urlRules.otherwise(
					function () {
						return rule(services.$injector, _this.router.locationService);
					}
				);
            } else {
                throw new Error("'rule' must be a string or function");
            }
            return this;
        };

        UrlRouterProvider.prototype.when = function (what, handler) {
            if (_.isArray(handler) || _.isFunction(handler)) {
                handler = UrlRouterProvider.injectableHandler(this.router, handler);
            }

            this.router.urlService.rules.when(what, handler);

            return this;
        };

        UrlRouterProvider.injectableHandler = function (ih_router, handler) {
            return function (match) {
                return services.$injector.invoke(
						handler,
						undefined,
						{
							$match: match,
							$stateParams: ih_router.globals.params
						},
						'ng_ui_router_UrlRouterProvider_injectableHandler'
					);
            };
        };

        UrlRouterProvider.prototype.deferIntercept = function (defer) {
			this.router.urlService.deferIntercept(defer);
        };

		if (mvr) {
			msos_debug(temp_ur + ' ->  done!');
		}
        return UrlRouterProvider;
    }());

    function getLocals(ctx) {
        var tokens = ctx.getTokens().filter(_.isString);
        var tuples = tokens.map(function (key) {
            var resolvable = ctx.getResolvable(key);
            var waitPolicy = ctx.getPolicy(resolvable).async;
            return [key, waitPolicy === 'NOWAIT' ? resolvable.promise : resolvable.data];
        });
        return tuples.reduce(applyPairs, {});
    }

    function getStateHookBuilder(hookName) {
        return function stateHookBuilder(stateObject) {
            var hook = stateObject[hookName],
				pathname = hookName === 'onExit' ? 'from' : 'to',
				decoratedNg1Hook = function (trans, state) {
					var resolveContext = new ResolveContext(trans.treeChanges(pathname)),
						subContext = resolveContext.subContext(state.$$state()),
						locals = extend(
							getLocals(subContext),
							{ $state$: state, $transition$: trans }
						);

					return services.$injector.invoke(
						hook,
						this,
						locals,
						'ng_ui_router_getStateHookBuilder'
					);
				};

            return hook ? decoratedNg1Hook : undefined;
        };
    }

    var uiRouterProvider = function ($locationProvider) {
		var temp_rp = 'ng.ui.router.init - uiRouterProvider',
			self = this;

		msos_debug(temp_rp + ' %%%%%> start.');

		self.router = new UIRouter();

        self.router.stateProvider = new StateProvider(self.router.stateRegistry, self.router.stateService);

        self.router.stateRegistry.decorator('views', ng1ViewsBuilder);
        self.router.stateRegistry.decorator('onExit', getStateHookBuilder('onExit'));
        self.router.stateRegistry.decorator('onRetain', getStateHookBuilder('onRetain'));
        self.router.stateRegistry.decorator('onEnter', getStateHookBuilder('onEnter'));

        self.router.viewService._pluginapi._viewConfigFactory('ng1', getNg1ViewConfigFactory());

        var ng1LocationService = new Ng1LocationServices($locationProvider);

		self.router.locationService = ng1LocationService;
		self.router.locationConfig = ng1LocationService;

		var pathType = self.router.urlService.config.type('path');

		pathType.encode = function (val) {
			return val !== null && val !== undefined ? val.toString().replace(/(~|\/)/g, function (m) { return ({ '~': '~~', '/': '~2F' }[m]); }) : val;
		};

		pathType.decode = function (val) {
			return val !== null && val !== undefined ? val.toString().replace(/(~~|~2F)/g, function (m) { return ({ '~~': '~', '~2F': '/' }[m]); }) : val;
		};

        self.router.generate = self.router;
        self.router.$get = ['$location', '$browser', '$window', '$rootScope', function ($location, $browser, $window, $rootScope) {
			var _loc = val($location);

			ng1LocationService.$location = $location;
			ng1LocationService.$browser = $browser;
			ng1LocationService.$window = $window;

			$rootScope.$on(
				'$locationChangeSuccess',
				function ng_ui_router_loc_chg_on_RP(evt) {
					if (msos_verbose) {
						msos_debug(temp_rp + ' - ng_ui_router_loc_chg_on_RP -> called' + msos_indent + '_this._urlListeners:', ng1LocationService._urlListeners);
					}

					return ng1LocationService._urlListeners.forEach(
							function (fn) { return fn(evt); }
						);
				}
			);

			createProxyFunctions(_loc, ng1LocationService, _loc, ['replace', 'path', 'search', 'hash']);
			createProxyFunctions(_loc, ng1LocationService, _loc, ['port', 'protocol', 'host']);

            delete self.router.generate;
            delete self.router.$get;

            return self.router;
        }];

		if (mvr) {
			msos_debug(temp_rp + ' %%%%%>  done, router:', self.router);
		} else {
			msos_debug(temp_rp + ' %%%%%>  done!');
		}

        return self.router;
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

    function stateContext(el) {
        var $uiView = el.parent().inheritedData('$uiView');
        var path = parse('$cfg.path')($uiView);
        return path ? _.last(path).state.name : undefined;
    }

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

    function clickHook(el, $state, $timeout, type, getDef) {
        return function clickHookEvt(e) {
            var button = e.which || e.button,
                target = getDef(),
				transition;

            if (!(button > 1 || e.ctrlKey || e.metaKey || e.shiftKey || el.attr('target'))) {
                transition = $timeout(
					function ng_ui_rt_clickhook_to() {
						if (!el.attr('disabled')) {
							$state.go(target.uiState, target.uiStateParams, target.uiStateOpts);
						}
					},
					10,
					false
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

    function defaultOpts(el, $state) {
        return {
            relative: stateContext(el) || $state.$current,
            inherit: true,
            source: 'sref'
        };
    }

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

        scope.$on(
			'$destroy',
			function ng_ui_router_bind_ev_on() {
				var off = element.off ? 'off' : 'unbind',
					_j = 0,
					event_2,
					events_2 = events;

				for (_j = 0; _j < events_2.length; _j += 1) {
					event_2 = events_2[_j];
					element[off](event_2, hookFn);
				}
			}
		);
    }

	function StateRefDirective($uiRouter, $timeout) {
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

	function StateRefDynamicDirective($uiRouter, $timeout) {
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
							return (acc[attr] = noop_st, acc);
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
								if (watchDeregFns[field] !== noop_st) {
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

    function StateRefActiveDirective($state, $stateParams, $interpolate, $uiRouter) {
		return {
			restrict: 'A',
			controller: ['$scope', '$element', '$attrs',
				function ui_sref_active($scope, $element, $attrs) {
					var states = [],
						activeEqClass,
						uiSrefActive;

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

						$scope.$evalAsync(function ng_ui_router_add_rem_cls() {
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

    function IsStateFilter($state) {
        var isFilter = function (state, params, options) {
            return $state.is(state, params, options);
        };
        isFilter.$stateful = true;
        return isFilter;
    }

    function IncludedByStateFilter($state) {
        var includesFilter = function (state, params, options) {
            return $state.includes(state, params, options);
        };
        includesFilter.$stateful = true;
        return includesFilter;
    }

	function ViewDirective($view, $animate, $uiViewScroll, $interpolate, $q) {
		var temp_uv = 'ng.ui.router - ViewDirective';

		msos_debug(temp_uv + ' -> start.');

		function getRenderer() {
			return {
				enter: function (element, target, cb) {
					if (ngm_angular.version.minor > 2) {
						$animate.enter(element, null, target).then(cb);
					} else {
						$animate.enter(element, null, target, cb);
					}
				},
				leave: function (element, cb) {
					if (ngm_angular.version.minor > 2) {
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
						activeUIView;

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

					uirouter_trace.traceUIViewEvent('Linking', activeUIView);

					function configUpdatedCallback(config) {
						if (mvr) {
							msos_debug(temp_uv + 'configUpdatedCallback -> called' + msos_indent + 'config:', config);
						}

						if (config && !(config instanceof Ng1ViewConfig)) {
							return;
						}
						if (configsEqual(viewConfig, config)) {
							return;
						}

						uirouter_trace.traceUIViewConfigUpdated(
							activeUIView,
							config && config.viewDecl && config.viewDecl.$context
						);

						viewConfig = config;

						updateView();
					}

					$element.data('$uiView', {
						$uiView: activeUIView
					});

					// experimental, updateView(); was here and not above

					unregister = $view.registerUIView(activeUIView);

					scope.$on(
						'$destroy',
						function ng_ui_router_updateview_compile_on() {
							uirouter_trace.traceUIViewEvent('Destroying/Unregistering', activeUIView);
							unregister();
						}
					);

					function cleanupLastView() {
						if (previousEl) {
							uirouter_trace.traceUIViewEvent('Removing (previous) el', previousEl.data('$uiView'));
							previousEl.remove();
							previousEl = null;
						}
						if (currentScope) {
							uirouter_trace.traceUIViewEvent('Destroying scope', activeUIView);
							currentScope.$destroy();
							currentScope = null;
						}
						if (currentEl) {
							var _viewData_1 = currentEl.data('$uiViewAnim');
							uirouter_trace.traceUIViewEvent('Animate out', _viewData_1);
							renderer.leave(currentEl, function () {
								_viewData_1.$$animLeave.resolve();
								previousEl = null;
							});
							previousEl = currentEl;
							currentEl = null;
						}
					}

					function updateView() {

						msos_debug(temp_uv + 'updateView -> start, name: ' + name);

						var newScope = scope.$new(),
							animEnter = $q.defer('ui_router_updateview_enter_defer'),
							animLeave = $q.defer('ui_router_updateview_enter_leave'),
							$uiViewData = {
								$cfg: viewConfig,
								$uiView: activeUIView,
							},
							$uiViewAnim = {
								$animEnter: animEnter.promise,
								$animLeave: animLeave.promise,
								$$animLeave: animLeave
							},
							cloned = null;

						if (mvr) {
							msos_debug(temp_uv + 'updateView -> $uiViewData:', $uiViewData);
						}

						newScope.$emit('$viewContentLoading', name);

						cloned = $transclude(
							newScope,
							function ngUiRouterUpdateviewTransclude(clone) {
								clone.data('$uiViewAnim', $uiViewAnim);
								clone.data('$uiView', $uiViewData);

								renderer.enter(
									clone,
									$element,
									function onUIViewEnter() {
										animEnter.resolve();

										if (currentScope)
											currentScope.$emit('$viewContentAnimationEnded');
										if (isDefined(autoScrollExp) && !autoScrollExp || scope.$eval(autoScrollExp)) {
											$uiViewScroll(clone);
										}
									}
								);
								cleanupLastView();
							}
						);

						currentEl = cloned;
						currentScope = newScope;
						currentScope.$emit('$viewContentLoaded', viewConfig);
						currentScope.$eval(onloadExp);

						msos_debug(temp_uv + 'updateView -> done!');
					}
				};
			}
		};

		msos_debug(temp_uv + ' ->  done!');
		return directive;
	}

    function registerControllerCallbacks($q, $transitions, controllerInstance, $scope, cfg) {

		msos_debug('ng.ui.router - registerControllerCallbacks -> start.');

        var viewState = _.last(cfg.path).state.self || undefined,
			hookOptions = {
				bind: controllerInstance
			},
			resolveContext,
			viewCreationTrans_1,
			paramsUpdated,
			id_1,
			cacheProp_1,
			prevTruthyAnswer_1,
			wrappedHook;

        // Add component-level hook for onParamsChange
        if (_.isFunction(controllerInstance.uiOnParamsChanged)) {

            resolveContext = new ResolveContext(cfg.path);
            viewCreationTrans_1 = resolveContext.getResolvable('$transition$').data;

            // Fire callback on any successful transition
            paramsUpdated = function ($transition$) {
                // Exit early if the $transition$ is the same as the view was created within.
                // Exit early if the $transition$ will exit the state the view is for.
                if ($transition$ === viewCreationTrans_1 || $transition$.exiting().indexOf(viewState) !== -1) {
                    return;
                }

                var toParams = $transition$.params('to'),
					fromParams = $transition$.params('from'),
					getNodeSchema = function (node) { return node.paramSchema; },
					toSchema = $transition$
						.treeChanges('to')
						.map(getNodeSchema)
						.reduce(unnestR, []),
					fromSchema = $transition$
						.treeChanges('from')
						.map(getNodeSchema)
						.reduce(unnestR, []),
					changedToParams = toSchema.filter(
						function (param) {
							var idx = fromSchema.indexOf(param);
							return idx === -1 || !fromSchema[idx].type.equals(toParams[param.id], fromParams[param.id]);
						}
					),
					changedKeys_1,
					newValues;

                // Only trigger callback if a to param has changed or is new
                if (changedToParams.length) {
                    changedKeys_1 = changedToParams.map(
						function (x) {
							return x.id;
						}
					);
                    // Filter the params to only changed/new to params.  `$transition$.params()` may be used to get all params.
					newValues = filter(
						toParams,
						function (val, key) {
							return changedKeys_1.indexOf(key) !== -1;
						}
					);
                    controllerInstance.uiOnParamsChanged(newValues, $transition$);
                }
            };
            $scope.$on(
				'$destroy',
				$transitions.onSuccess({}, paramsUpdated, hookOptions)
			);
        }
	
        // Add component-level hook for uiCanExit
        if (_.isFunction(controllerInstance.uiCanExit)) {
            id_1 = _uiCanExitId++;
            cacheProp_1 = '_uiCanExitIds';
            // Returns true if a redirect transition already answered truthy
            prevTruthyAnswer_1 = function (trans) {
                return !!trans && (trans[cacheProp_1] && trans[cacheProp_1][id_1] === true || prevTruthyAnswer_1(trans.redirectedFrom()));
            };
            // If a user answered yes, but the transition was later redirected, don't also ask for the new redirect transition
            wrappedHook = function (trans) {
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

            $scope.$on(
				'$destroy',
				$transitions.onBefore(
					{ exiting: viewState.name },
					wrappedHook,
					hookOptions
				)
			);
        }

		msos_debug('ng.ui.router - registerControllerCallbacks ->  done!');
    }

    function ViewDirectiveFill($compile, $controller, $transitions, $view, $q) {
        var temp_vf = 'ng.ui.router - ViewDirectiveFill',
			getControllerAs = parse('viewDecl.controllerAs'),
			getResolveAs = parse('viewDecl.resolveAs');

		msos_debug(temp_vf + ' -> called.');

        return {
            restrict: 'ECA',
            priority: -400,
            compile: function (tElement) {
                var initial = tElement.html();

                tElement.empty();

                return function (scope, $element) {
                    var data = $element.data('$uiView'),
						debug_note = '',
						cfg,
						resolveCtx,
						link,
						controller,
						controllerAs,
						resolveAs,
						locals,
						controllerInstance,
						kebobName,
						tagRegexp_1,
						deregisterWatch_1,
						getComponentController;

					msos_debug(temp_vf + ' - compile -> start.');

                    if (!data) {
                        $element.html(initial);
                        $compile($element.contents())(scope);
						msos_debug(temp_vf + ' - compile ->  done, no $element.data');
                        return;
                    }

                    cfg = data.$cfg || {
                        viewDecl: {},
                        getTemplate: noop_tp
                    };

					if (mvr) {
						msos_debug(temp_vf + ' - compile -> configuration' + msos_indent + 'config:', cfg);
					}

                    resolveCtx = cfg.path && new ResolveContext(cfg.path);

					if (cfg.getTemplate !== noop_tp) {
						$element.html(cfg.getTemplate($element, resolveCtx) || initial);
						debug_note = 'getTemplate';
					} else {
						$element.html(initial);
						debug_note = 'noop_tp';
					}

                    uirouter_trace.traceUIViewFill(data.$uiView, $element.html());

                    link = $compile($element.contents());

                    controller = cfg.controller;
                    controllerAs = getControllerAs(cfg);
                    resolveAs = getResolveAs(cfg);
                    locals = resolveCtx && getLocals(resolveCtx);

                    scope[resolveAs] = locals;

                    if (controller) {

                        controllerInstance = $controller(
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

						debug_note += ' - controller';

                        if (controllerAs) {
                            scope[controllerAs] = controllerInstance;
                            scope[controllerAs][resolveAs] = locals;

							debug_note += ' - controllerAs';
                        }

                        $element.data('$ngControllerController', controllerInstance);
                        $element.children().data('$ngControllerController', controllerInstance);

                        registerControllerCallbacks($q, $transitions, controllerInstance, scope, cfg);

                    } else {
						debug_note += ' - no controller';
					}

                    // Wait for the component to appear in the DOM
                    if (_.isString(cfg.component)) {

                        kebobName = kebobString(cfg.component);
						tagRegexp_1 = new RegExp('^(x-|data-)?' + kebobName + '$', 'i');

                        getComponentController = function () {
                            var directiveEl = [].slice.call($element[0].children)
                                .filter(function (el) {
									//console.log(temp_vf + ' - compile - getComponentController - filter -> el:', el);
                                    return el && el.tagName && tagRegexp_1.exec(el.tagName);
                                }),
								data_name = "$" + cfg.component + "Controller",
								output = directiveEl && ngm_angular.element(directiveEl).data(data_name);

							if (mvr) {
								msos_debug(temp_vf + ' - compile - getComponentController -> called' + msos_indent + 'data name: ' + data_name + msos_indent + 'output:', output);
								msos_debug('     directiveEl:', directiveEl);
							}

							return output;
						};

                        deregisterWatch_1 = scope.$watch(
							getComponentController,
							function reg_ctrl_cbs(ctrlInstance) {
								if (!ctrlInstance) {
									if (mvr) {
										msos_debug(temp_vf + ' - compile - watch - reg_ctrl_cbs -> called, no instance.');
									}
									return;
								}
								registerControllerCallbacks($q, $transitions, ctrlInstance, scope, cfg);
								deregisterWatch_1();
							}
						);

						debug_note += ' - isString: ' + kebobName;
                    }

                    link(scope);

					msos_debug(temp_vf + ' - compile ->  done' + msos_indent + 'debug: ' + debug_note);
                };
            }
        };
    }

    function ViewScrollProvider() {
        var useAnchorScroll = false;

        this.useAnchorScroll = function () {
            useAnchorScroll = true;
        };

        this.$get = ['$anchorScroll', '$timeout', function ($anchorScroll, $timeout) {
            if (useAnchorScroll) {
                return $anchorScroll;
            }
            return function ($element) {
                return $timeout(
					function () {
						$element[0].scrollIntoView();
					},
					0,
					false
				);
            };
        }];
    }

    function runBlock($injector$$1, $q$$1, $uiRouter) {
		var temp_rb = 'ng.ui.router.init - runBlock';

		msos_debug(temp_rb + ' -> start.');

        services.$injector = $injector$$1;
        services.$q = $q$$1;

        $uiRouter.stateRegistry
			.get()
            .map(function (x) { return x.$$state().resolvables; })
            .reduce(unnestR, [])
            .filter(function (x) { return x.deps === 'deferred'; })
            .forEach(
				function (resolvable) {
					resolvable.deps = $injector$$1.annotate(
						resolvable.resolveFn,
						$injector$$1.strictDi
					);
					return resolvable.deps;
				}
			);

		msos_debug(temp_rb + ' ->  done!');
    }

    function watchDigests($rootScope) {
		if (msos.config.debug) {
			$rootScope.$watch(
				function () {
					uirouter_trace.approximateDigests += 1;
				}
			);
		}
    }

	UIRouterPluginBase = (function () {
		function UIRouterPluginBase() {}
		UIRouterPluginBase.prototype.dispose = function () { };
		return UIRouterPluginBase;
	}());

	ngm_angular.module(
		'ng.ui.router.init',
		['ng']
	).provider(
		'$uiRouter',
		['$locationProvider', uiRouterProvider]
	).run(
		['$injector', '$q', '$uiRouter', runBlock]
	);

	ngm_angular.module(
		'ng.ui.router.util',
		['ng', 'ng.ui.router.init']
	).provider(
		'$urlService',
		['$uiRouterProvider', function ($uiRouterProvider) {
            var service = $uiRouterProvider.generate.urlService;

            service.$get = function () { return service; };
            return service;
        }]
	).provider(
		'$urlMatcherFactory',
		['$uiRouterProvider', function ($uiRouterProvider) { return $uiRouterProvider.urlMatcherFactory; }]
	).provider(
		'$templateFactory',
		function () { return new TemplateFactory(); }
	);

	ngm_angular.module(
		'ng.ui.router.create',
		['ng', 'ng.ui.router.util']
	).provider(
		'$urlRouter',
		['$uiRouterProvider', function ($uiRouterProvider) {
			msos_debug('ng.ui.router.create - $urlRouter -> start.');

			var service = $uiRouterProvider.urlRouterProvider = new UrlRouterProvider($uiRouterProvider);

			msos_debug('ng.ui.router.create - $urlRouter ->  done!');
			return service;
		}]
	).run(
		['$urlRouter', function ($urlRouter) {
			msos_debug('ng.ui.router.create - run -> called, location: ' + ($urlRouter.location || "''"));
		}]
	);

	ngm_angular.module(
		'ng.ui.router.state',
		['ng', 'ng.ui.router.create', 'ng.ui.router.util']
	).provider(
		'$stateRegistry',
		['$uiRouterProvider', function ($uiRouterProvider) {
            var service = $uiRouterProvider.generate.stateRegistry;

            service.$get = function () { return service; };
            return service;
        }]
	).provider(
		'$uiRouterGlobals',
		['$uiRouterProvider', function ($uiRouterProvider) {
            var service = $uiRouterProvider.generate.globals;

            service.$get = function () { return service; };
            return service;
        }]
	).provider(
		'$transitions',
		['$uiRouterProvider', function ($uiRouterProvider) {
            var service = $uiRouterProvider.generate.transitionService;

            service.$get = function () { return service; };
            return service;
        }]
	).provider(
		'$state',
		['$uiRouterProvider', function ($uiRouterProvider) {
			return extend(
				$uiRouterProvider.stateProvider,
				{ $get: function () { return $uiRouterProvider.stateService; } }
			);
		}]
	).factory(
		'$stateParams',
		['$uiRouter', function ($uiRouter) { return $uiRouter.globals.params; }]
	).directive(
		'uiSref',
		['$uiRouter', '$timeout', StateRefDirective]
	).directive(
		'uiSrefActive',
		['$state', '$stateParams', '$interpolate', '$uiRouter', StateRefActiveDirective]
	).directive(
		'uiSrefActiveEq',
		['$state', '$stateParams', '$interpolate', '$uiRouter', StateRefActiveDirective]
	).directive(
		'uiState',
		['$uiRouter', '$timeout', StateRefDynamicDirective]
	).filter(
		'isState',
		['$state', IsStateFilter]
	).filter(
		'includedByState',
		['$state', IncludedByStateFilter]
	).directive(
		'uiView',
		['$view', '$animate', '$uiViewScroll', '$interpolate', '$q', ViewDirective]
	).directive(
		'uiView',
		['$compile', '$controller', '$transitions', '$view', '$q', '$timeout', ViewDirectiveFill]
	).provider(
        '$uiViewScroll',
        ViewScrollProvider
    ).run(
		['$state', function ($state) {

			// Catch gross file load and syntax error in MobileSiteOS (msos),
			// and reload the app at current state, when the error occured.
			msos.onerror_functions.push(
				function ng_ui_rt_msos_onerror() {

					$state.reload($state.current.name);

					setTimeout(function () { location.reload(); }, msos.notify_delay);
				}
			);

			if (mvr) {
				msos_debug('ng.ui.routerstate - run -> executed:', $state);
			}
		}]
	);

	ngm_angular.module(
		'ng.ui.router',
		['ng', 'ng.ui.router.init', 'ng.ui.router.state']
	).factory(
		'$view',
		['$uiRouter', function ($uiRouter) { return $uiRouter.viewService; }]
	).service(
		'$trace',
		function () { return uirouter_trace; }
	).run(
		['$rootScope', watchDigests]
	);

	exports.Transition = Transition;
	exports.UIRouterGlobals = UIRouterGlobals;
	exports.UIRouter = UIRouter;
	exports.UIRouterPluginBase = UIRouterPluginBase;
	exports.defaultTransOpts = defaultTransOpts;
	exports.PathUtils = PathUtils;
	exports.uniqR = uniqR;
	exports.pushTo = pushTo;
	exports.removeFrom = removeFrom;
	exports.anyTrueR = anyTrueR;

})));

msos.console.info('ng/ui/router/v1020_msos -> done!');
msos.console.timeEnd('ng/ui/router');
