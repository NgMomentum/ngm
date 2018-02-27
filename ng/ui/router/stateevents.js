
/**
 * State-based routing for AngularJS 1.x
 * @version v1.0.14
 * @link https://ui-router.github.io
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

/*global
    msos: false,
    ng: false
*/

msos.provide("ng.ui.router.stateevents");

ng.ui.router.stateevents.version = new msos.set_version(18, 2, 2);


(function (global, factory) {

	global['@uirouter/angularjs-state-events'] = {};

    factory(
		global['@uirouter/angularjs-state-events'],
		global.angular
	);

}(this, (function (exports, ng_from_import) {
    "use strict";

    var $stateChangeStart,
		$stateChangeCancel,
		$stateChangeSuccess,
		$stateChangeError,
		$stateNotFound;

    (function () {
        var isFunction = ng_from_import.isFunction,
            isString = ng_from_import.isString;

        function applyPairs(memo, keyValTuple) {
            var key, value;

            if (Array.isArray(keyValTuple)) {
                key = keyValTuple[0];
				value = keyValTuple[1];
			}

            if (!isString(key)) {
                throw new Error('invalid parameters to applyPairs');
            }

            memo[key] = value;
            return memo;
        }

        function stateChangeStartHandler($transition$) {
            if (!$transition$.options().notify || !$transition$.valid() || $transition$.ignored()) {
                return;
            }

            var $injector = $transition$.injector(),
				$stateEvents = $injector.get('$stateEvents'),
				$rootScope = $injector.get('$rootScope'),
				$state = $injector.get('$state'),
				$urlRouter = $injector.get('$urlRouter'),
				enabledEvents = $stateEvents.provider.enabled(),
				toParams = $transition$.params('to'),
				fromParams = $transition$.params('from'),
				startEvent,
				successOpts = {
                    priority: 9999
                };

            if (enabledEvents.$stateChangeSuccess) {

                startEvent = $rootScope.$broadcast('$stateChangeStart', $transition$.to(), toParams, $transition$.from(), fromParams, $transition$.options(), $transition$);

                if (startEvent.defaultPrevented) {

                    if (enabledEvents.$stateChangeCancel) {
                        $rootScope.$broadcast('$stateChangeCancel', $transition$.to(), toParams, $transition$.from(), fromParams, $transition$.options(), $transition$);
                    }
                    // Don't update and resync url if there's been a new transition started. see issue #2238, #600
                    if ($state.transition === null || $state.transition === undefined) {
                        $urlRouter.update();
                    }

                    return false;
                }

                $transition$.onSuccess({}, function () {
                    $rootScope.$broadcast('$stateChangeSuccess', $transition$.to(), toParams, $transition$.from(), fromParams, $transition$.options(), $transition$);
                }, successOpts);
            }

            if (enabledEvents.$stateChangeError) {
                $transition$.promise['catch'](function (error) {
                    if (error && (error.type === 2 /* RejectType.SUPERSEDED */ || error.type === 3 /* RejectType.ABORTED */ ))
                        return;
                    var evt = $rootScope.$broadcast('$stateChangeError', $transition$.to(), toParams, $transition$.from(), fromParams, error, $transition$.options(), $transition$);
                    if (!evt.defaultPrevented) {
                        $urlRouter.update();
                    }
                });
            }
        }

        stateNotFoundHandler.$inject = ['$to$', '$from$', '$state', '$rootScope', '$urlRouter'];

        function stateNotFoundHandler($to$, $from$, injector) {
            var $state = injector.get('$state'),
				$rootScope = injector.get('$rootScope'),
				$urlRouter = injector.get('$urlRouter'),
				redirect = {
					to: $to$.identifier(),
					toParams: $to$.params(),
					options: $to$.options()
				},
				e = $rootScope.$broadcast('$stateNotFound', redirect, $from$.state(), $from$.params());

            if (e.defaultPrevented || e.retry) {
                $urlRouter.update();
            }

            function redirectFn() {
                return $state.target(redirect.to, redirect.toParams, redirect.options);
            }

            if (e.defaultPrevented) {
                return false;
            } else if (e.retry || !!$state.get(redirect.to)) {
                return e.retry && isFunction(e.retry.then) ? e.retry.then(redirectFn) : redirectFn();
            }
        }

        $StateEventsProvider.$inject = ['$stateProvider'];

        function $StateEventsProvider($stateProvider) {

            $StateEventsProvider.prototype.instance = this;

            var runtime = false,
				allEvents = ['$stateChangeStart', '$stateNotFound', '$stateChangeSuccess', '$stateChangeError'],
				enabledStateEvents = allEvents.map(
					function (e) {
						return [e, true];
					}
				).reduce(applyPairs, {});

            function assertNotRuntime() {
                if (runtime) {
                    throw new Error('Cannot enable events at runtime (use $stateEventsProvider');
                }
            }

            this.enable = function () {
                var events = [],
					_i = 0;

                for (_i = 0; _i < arguments.length; _i++) {
                    events[_i] = arguments[_i];
                }

                assertNotRuntime();

                if (!events || !events.length) {
                    events = allEvents;
                }

                events.forEach(
					function (event) {
						enabledStateEvents[event] = true;
						return enabledStateEvents[event];
					}
				);
            };

            this.disable = function () {
                var events = [],
					_i = 0;

                for (_i = 0; _i < arguments.length; _i++) {
                    events[_i] = arguments[_i];
                }

                assertNotRuntime();

                if (!events || !events.length) {
                    events = allEvents;
                }

                events.forEach(
					function (event) {
						return delete enabledStateEvents[event];
					}
				);
            };

            this.enabled = function () {
                return enabledStateEvents;
            };
            this.$get = $get;
            $get.$inject = ['$transitions'];

            function $get($transitions) {
                runtime = true;
                if (enabledStateEvents.$stateNotFound)
                    $stateProvider.onInvalid(stateNotFoundHandler);
                if (enabledStateEvents.$stateChangeStart)
                    $transitions.onBefore({}, stateChangeStartHandler, {
                        priority: 1000
                    });
                return {
                    provider: $StateEventsProvider.prototype.instance,
                };
            }
        }

        ng_from_import.module(
			'ng.ui.router.stateevents',
			['ng', 'ng.ui.router.state']
		).provider(
			'$stateEvents',
			$StateEventsProvider
		).run(
			['$stateEvents', function () {}]
		);

    }());

    exports.$stateChangeStart = $stateChangeStart;
    exports.$stateChangeCancel = $stateChangeCancel;
    exports.$stateChangeSuccess = $stateChangeSuccess;
    exports.$stateChangeError = $stateChangeError;
    exports.$stateNotFound = $stateNotFound;

})));

