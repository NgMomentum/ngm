
(function (global, factory) {

	global['@uirouter/deepStateRedirect'] = {};

    factory(global);

}(this, (function (exports) {

	function DSRPlugin($uiRouter) {
		var $transitions = $uiRouter.transitionService,
			$state = $uiRouter.stateService;

		function getDsr(state) {
			return state.deepStateRedirect || state.dsr;
		}

		function getConfig(state) {
			var dsrProp = getDsr(state),
				propType = typeof dsrProp,
				params,
				defaultTarget,
				defaultType,
				fn;

			if (propType === 'undefined') {
				return;
			}

			defaultTarget = propType === 'string' ? dsrProp : undefined;

			fn = propType === 'function' ? dsrProp : undefined;

			if (propType === 'object') {
				fn = dsrProp.fn;
				defaultType = typeof dsrProp.default;

				if (defaultType === 'object') {
					defaultTarget = $state.target(
						dsrProp.default.state,
						dsrProp.default.params,
						dsrProp.default.options
					);
				} else if (defaultType === 'string') {
					defaultTarget = $state.target(dsrProp.default);
				}

				if (dsrProp.params === true) {
					params = function () { return true; };
				} else if (Array.isArray(dsrProp.params)) {
					params = function (param) {
						return dsrProp.params.indexOf(param.id) !== -1;
					};
				}
			}

			fn = fn || (function (transition, target) { return target; });

			return { params: params, default: defaultTarget, fn: fn };
		}

		function paramsEqual(state, transParams, schemaMatchFn, negate) {

			if (negate === void 0) { negate = false; }

			schemaMatchFn = schemaMatchFn || (function () { return true; });

			var schema = state.parameters({ inherit: true }).filter(schemaMatchFn);

			return function (redirect) {
				var equals = core_1.Param.equals(schema, redirect.triggerParams, transParams);

				return negate ? !equals : equals;
			};
		}

		function recordDeepState(transition, state) {
			var paramsConfig = getConfig(state).params;

			transition.promise.then(
				function () {
					var transTo = transition.to(),
						transParams = transition.params(),
						recordedDsrTarget = $state.target(transTo, transParams);

					if (paramsConfig) {
						state.$dsr = (state.$dsr || []).filter(paramsEqual(transTo.$$state(), transParams, undefined, true));
						state.$dsr.push({ triggerParams: transParams, target: recordedDsrTarget });
					} else {
						state.$dsr = recordedDsrTarget;
					}
				}
			);
		}

		function deepStateRedirect(transition) {
			var opts = transition.options(),
				config,
				redirect;

			if (opts.ignoreDsr || (opts.custom && opts.custom.ignoreDsr)) {
				return;
			}

			config = getConfig(transition.to());
			redirect = getDeepStateRedirect(transition.to(), transition.params());
			redirect = config.fn(transition, redirect);

			if (redirect && redirect.state() === transition.to()) {
				return;
			}

			return redirect;
		}

		function getDeepStateRedirect(stateOrName, params) {
			var state = $state.get(stateOrName),
				dsrTarget, config = getConfig(state),
				$$state = state.$$state(),
				predicate,
				match,
				targetParams;

			if (config.params) {
				predicate = paramsEqual($$state, params, config.params, false);
				match = $$state.dsr && $$state.dsr.filter(predicate)[0];
				dsrTarget = match && match.target;
			} else {
				dsrTarget = $$state.dsr;
			}

			dsrTarget = dsrTarget || config.default;

			if (dsrTarget) {
				// merge original params with deep state redirect params
				targetParams = Object.assign({}, params, dsrTarget.params());
				dsrTarget = $state.target(dsrTarget.state(), targetParams, dsrTarget.options());
			}

			return dsrTarget;
		}

		$transitions.onRetain({ retained: getDsr }, recordDeepState);
		$transitions.onEnter({ entering: getDsr }, recordDeepState);
		$transitions.onBefore({ to: getDsr }, deepStateRedirect);

		return {
			name: 'deep-state-redirect',
			reset: function (state, params) {
				if (!state) {
					$state.get().forEach(function (state) { return delete state.$$state().dsr; });
				}
				else if (!params) {
					delete $state.get(state).$$state().dsr;
				}
				else {
					var $$state = $state.get(state).$$state();
					$$state.dsr = $$state.dsr.filter(paramsEqual($$state, params, null, true));
				}
			},
			getRedirect: function (state, params) {
				msos.console.debug('ng/ui/router/dsr - DSRPlugin - getRedirect -> called, state/params:', state, params);
				return getDeepStateRedirect(state, params);
			},
		};
	}

	exports['@uirouter/deepStateRedirect'].DSRPlugin = DSRPlugin;

})));