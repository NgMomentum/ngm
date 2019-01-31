
(function (global, factory) {

	global['@uirouter/stickyStates'] = {};

    factory(global);

}(this, (function (exports) {

	var ui_router = exports['@uirouter/angularjs'],
		extend = Object.assign || _.assign,
		not = function (fn) {
			return function () {
				var args = [];
				for (var _i = 0; _i < arguments.length; _i++) {
					args[_i] = arguments[_i];
				}
				return !fn.apply(null, args);
			};
		};

	function identity(x) {
        return x;
    }

	function cloneNode(node) {
		var n = node;
		return (Object(_.isFunction)(n.clone) && n.clone()) || PathNode.clone(node);
	}

	function findInPath(path) {
		return function (node) {
			return path.find(function (pathNode) { return pathNode.state == node.state; });
		};
	}

	function notFoundInPath(path) {
		return Object(not)(findInPath(path));
	}

	function applyParamsFromPath(path, dest) {
		var sourceNode = findInPath(path)(dest);
		if (!sourceNode)
			throw new Error("Could not find matching node for " + dest.state.name + " in source path [" + path.map(function (node) { return node.state.name; }).join(', ') + "]");
		return Object(extend)(cloneNode(dest), { paramValues: sourceNode.paramValues });
	}

	function isChildOf(parent) {
		return function (node) {
			return node.state.parent === parent.state;
		};
	}

	function isChildOfAny(_parents) {
		return function (node) {
			return _parents.map(function (parent) { return isChildOf(parent)(node); }).reduce(ui_router.anyTrueR, false);
		};
	}

	function ancestorPath(state) {
		return state.parent ? ancestorPath(state.parent).concat(state) : [state];
	}

	function isDescendantOf(_ancestor) {
		var ancestor = _ancestor.state;
		return function (node) {
			return ancestorPath(node.state).indexOf(ancestor) !== -1;
		};
	}

	function isDescendantOfAny(ancestors) {
		return function (node) {
			return ancestors.map(function (ancestor) { return isDescendantOf(ancestor)(node); })
				.reduce(ui_router.anyTrueR, false);
		};
	}

	function nodeDepthThenInactivateOrder(inactives) {
		return function (l, r) {
			var depthDelta = (l.state.path.length - r.state.path.length);
			return depthDelta !== 0 ? depthDelta : inactives.indexOf(r) - inactives.indexOf(l);
		};
	}

	function assertMap(predicateOrMap, errMsg) {
		if (errMsg === void 0) { errMsg = 'assert failure'; }
			return function (obj) {
				var result = predicateOrMap(obj);

				if (!result) {
					throw new Error(_.isFunction(errMsg) ? errMsg(obj) : errMsg);
				}
				return result;
		};
	}

	exports['@uirouter/stickyStates'].StickyStates = (function (_super) {

	function StickyStatesPlugin(router) {
		var _this = _super.call(this) || this;

		_this.router = router;
		_this.name = 'sticky-states';
		_this._inactives = [];
		_this.pluginAPI = router.transitionService._pluginapi;
		_this._defineStickyPaths();
		_this._defineStickyEvents();
		_this._addCreateHook();
		_this._addStateCallbacks();
		_this._addDefaultTransitionOption();
		return _this;
	}

	msos._extends(StickyStatesPlugin, _super);

	StickyStatesPlugin.prototype.inactives = function () {
		return this._inactives.map(function (node) {
			return node.state.self;
		});
	};

	StickyStatesPlugin.prototype._addCreateHook = function () {
		var _this = this;
		this.router.transitionService.onCreate({}, function ng_ui_rt_sticky_addCreateHook(trans) {
			trans._treeChanges = _this._calculateStickyTreeChanges(trans);
		}, {
			priority: 100
		});
	};

	StickyStatesPlugin.prototype._defineStickyPaths = function () {
		this.pluginAPI._definePathType('inactivating', ui_router.TransitionHookScope.STATE);
		this.pluginAPI._definePathType('reactivating', ui_router.TransitionHookScope.STATE);
	};

	StickyStatesPlugin.prototype._defineStickyEvents = function () {
		var paths = this.pluginAPI._getPathTypes();
		this.pluginAPI._defineEvent('onInactivate', ui_router.TransitionHookPhase.RUN, 5, paths.inactivating, true);
		this.pluginAPI._defineEvent('onReactivate', ui_router.TransitionHookPhase.RUN, 35, paths.reactivating);
	};

	StickyStatesPlugin.prototype._addStateCallbacks = function () {
		var inactivateCriteria = {
			inactivating: function inactivating(state) {
				return !!state.onInactivate;
			}
		};
		this.router.transitionService.onInactivate(inactivateCriteria, function (trans, state) {
			return state.onInactivate(trans, state);
		});
		var reactivateCriteria = {
			reactivating: function reactivating(state) {
				return !!state.onReactivate;
			}
		};
		this.router.transitionService.onReactivate(reactivateCriteria, function (trans, state) {
			return state.onReactivate(trans, state);
		});
	};

	StickyStatesPlugin.prototype._calculateExitSticky = function (tc, trans) { // Process the inactive states that are going to exit due to $stickyState.reset()
		var exitSticky = trans.options().exitSticky || [];

		if (!Object(_.isArray)(exitSticky)) exitSticky = [exitSticky];

		var $state = trans.router.stateService;
		var states = exitSticky.map(Object(assertMap)(function (stateOrName) {
			return $state.get(stateOrName);
		}, function (state) {
			return 'State not found: ' + state;
		})).map(function (state) {
			return state.$$state();
		});
		var potentialExitingStickies = this._inactives.concat(tc.inactivating).reduce(ui_router.uniqR, []);
		var findInactive = function findInactive(state) {
			return potentialExitingStickies.find(function (node) {
				return node.state === state;
			});
		};
		var notInactiveMsg = function notInactiveMsg(state) {
			return 'State not inactive: ' + state;
		};
		var exitingInactives = states.map(Object(assertMap)(findInactive, notInactiveMsg));
		var exiting = potentialExitingStickies.filter(isDescendantOfAny(exitingInactives));
		var inToPathMsg = function inToPathMsg(node) {
			return 'Can not exit a sticky state that is currently active/activating: ' + node.state.name;
		};
		exiting.map(Object(assertMap)(function (node) {
			return !Object(inArray)(tc.to, node);
		}, inToPathMsg));
		return exiting;
	};

	StickyStatesPlugin.prototype._calculateStickyTreeChanges = function (trans) {
		var _this = this;
		var inactives = this._inactives;
		var tc = trans.treeChanges();
		tc.inactivating = [];
		tc.reactivating = [];

		if (tc.entering.length && tc.exiting[0] && tc.exiting[0].state.sticky) {
			tc.inactivating = tc.exiting;
			tc.exiting = [];
		}

		var inactiveFromPath = tc.retained.concat(tc.entering.map(findInPath(inactives))).filter(identity);
		var simulatedTC = ui_router.PathUtils.treeChanges(inactiveFromPath, tc.to, trans.options().reloadState);
		var shouldRewritePaths = ['retained', 'entering', 'exiting'].some(function (path) {
			return !!simulatedTC[path].length;
		});

		if (shouldRewritePaths) {

			var reactivating = simulatedTC.retained.slice(tc.retained.length);
			tc.reactivating = reactivating.map(function (node) {
				return applyParamsFromPath(tc.to, node);
			});
			tc.entering = simulatedTC.entering;
			tc.exiting = tc.exiting.concat(simulatedTC.exiting);
			var retainedWithToParams = tc.retained.map(function (node) {
				return applyParamsFromPath(tc.to, node);
			});
			tc.to = retainedWithToParams.concat(tc.reactivating).concat(tc.entering);
		}

		var childrenOfToState = inactives.filter(isChildOf(Object(_.last)(tc.to)));
		var childrenOfToPath = inactives.filter(isChildOfAny(tc.to)).filter(notFoundInPath(tc.to)).filter(function (node) {
			return !node.state.sticky;
		});

		var exitingChildren = childrenOfToState.concat(childrenOfToPath).filter(notFoundInPath(tc.exiting));
		var exitingRoots = tc.exiting.concat(exitingChildren);
		var orphans = inactives.filter(isDescendantOfAny(exitingRoots)).filter(notFoundInPath(exitingRoots)).concat(exitingChildren).reduce(ui_router.uniqR, []).sort(nodeDepthThenInactivateOrder(inactives));

		tc.exiting = orphans.concat(tc.exiting);
		trans.onSuccess({}, function ng_ui_rt_sticky_calculateStickyTreeChanges() {
			tc.exiting.map(findInPath(inactives)).forEach(Object(ui_router.removeFrom)(inactives));
			tc.entering.map(findInPath(inactives)).forEach(Object(ui_router.removeFrom)(inactives));
			tc.reactivating.map(findInPath(inactives)).forEach(Object(ui_router.removeFrom)(inactives));
			tc.inactivating.forEach(Object(ui_router.pushTo)(_this._inactives));
		});

		var exitSticky = this._calculateExitSticky(tc, trans);
		exitSticky.filter(function (node) {
			return !findInPath(tc.exiting)(node);
		}).forEach(Object(ui_router.pushTo)(tc.exiting));
		exitSticky.filter(findInPath(tc.inactivating)).forEach(Object(ui_router.removeFrom)(tc.inactivating));
		return tc;
	};

	StickyStatesPlugin.prototype._addDefaultTransitionOption = function () {
		ui_router.defaultTransOpts.exitSticky = [];
	};

	StickyStatesPlugin.prototype.exitSticky = function (states) {
		var $state = this.router.stateService;
		if (states === undefined) states = this._inactives.map(function (node) {
			return node.state.name;
		});
		if (Object(isString)(states)) states = [states];
		return $state.go($state.current, {}, {
			inherit: true,
			exitSticky: states
		});
	};

	return StickyStatesPlugin;

}(ui_router.UIRouterPluginBase));

})));
