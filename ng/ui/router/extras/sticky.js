/**
 * UI-Router Extras: Sticky states, Future States, Deep State Redirect, Transition promise
 * Module: sticky
 * @version 0.1.3
 * @link http://christopherthielen.github.io/ui-router-extras/
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.ui.router.extras.sticky");

ng.ui.router.extras.sticky.version = new msos.set_version(18, 1, 30);


(function(angular, undefined) {
    "use strict";

    var mod_sticky = angular.module(
		"ng.ui.router.extras.sticky",
		['ng', 'ng.ui.router.extras']
	);

    $StickyStateProvider.$inject = ['$stateProvider', 'uirextras_coreProvider'];

    function $StickyStateProvider($stateProvider, uirextras_coreProvider) {
        var core = uirextras_coreProvider;
        var inheritParams = core.inheritParams;
        var protoKeys = core.protoKeys;
        var forEach = core.forEach;
        var map = core.map;

        // Holds all the states which are inactivated.  Inactivated states can be either sticky states, or descendants of sticky states.
        var inactiveStates = {}; // state.name -> (state)
        var stickyStates = {}; // state.name -> true
        var DEBUG = msos.config.verbose;

        // Called by $stateProvider.registerState();
        // registers a sticky state with $stickyStateProvider
        this.registerStickyState = function(state) {
            stickyStates[state.name] = state;
            // console.log("Registered sticky state: ", state);
        };

        this.enableDebug = this.debugMode = function(enabled) {
            if (angular.isDefined(enabled))
                DEBUG = enabled;
            return DEBUG;
        };

        this.$get = ['$rootScope', '$state', '$stateParams', '$injector', '$log',
            function($rootScope, $state, $stateParams, $injector, $log) {
                // Each inactive states is either a sticky state, or a child of a sticky state.
                // This function finds the closest ancestor sticky state, then find that state's parent.
                // Map all inactive states to their closest parent-to-sticky state.
                function mapInactives() {
                    var mappedStates = {};
                    angular.forEach(inactiveStates, function(state) {
                        var stickyAncestors = getStickyStateStack(state);
                        for (var i = 0; i < stickyAncestors.length; i++) {
                            var parent = stickyAncestors[i].parent;
                            mappedStates[parent.name] = mappedStates[parent.name] || [];
                            mappedStates[parent.name].push(state);
                        }
                        if (mappedStates['']) {
                            // This is necessary to compute Transition.inactives when there are sticky states are children to root state.
                            mappedStates['__inactives'] = mappedStates['']; // jshint ignore:line
                        }
                    });
                    return mappedStates;
                }

                function mapInactivesByImmediateParent() {
                    var inactivesByAllParents = {};
                    forEach(inactiveStates, function(state) {
                        forEach(state.path, function(ancestor) {
                            if (ancestor === state) return;
                            inactivesByAllParents[ancestor.name] = inactivesByAllParents[ancestor.name] || [];
                            inactivesByAllParents[ancestor.name].push(state);
                        });
                    });
                    return inactivesByAllParents;
                }

                // Given a state, returns all ancestor states which are sticky.
                // Walks up the view's state's ancestry tree and locates each ancestor state which is marked as sticky.
                // Returns an array populated with only those ancestor sticky states.
                function getStickyStateStack(state) {
                    var stack = [];
                    if (!state) return stack;
                    do {
                        if (state.sticky) stack.push(state);
                        state = state.parent;
                    } while (state);
                    stack.reverse();
                    return stack;
                }

                // Returns a sticky transition type necessary to enter the state.
                // Transition can be: reactivate, reload, or enter

                // Note: if a state is being reactivated but params dont match, we treat
                // it as a Exit/Enter, thus the special "reload" transition.
                // If a parent inactivated state has "reload" transition type, then
                // all descendant states must also be exit/entered, thus the first line of this function.
                function getEnterTransition(state, stateParams, reloadStateTree, ancestorReloaded) {
                    if (ancestorReloaded) return "reload";
                    var inactiveState = inactiveStates[state.self.name];
                    if (!inactiveState) return "enter";
                    if (state.self === reloadStateTree) return "reload";
                    var paramsMatch = paramsEqualForState(state.ownParams, stateParams, inactiveState.locals.globals.$stateParams);
                    return paramsMatch ? "reactivate" : "reload";
                }

                // Given a state and (optional) stateParams, returns the inactivated state from the inactive sticky state registry.
                function getInactivatedState(state, stateParams) {
                    var inactiveState = inactiveStates[state.name];
                    if (!inactiveState) return null;
                    if (!stateParams) return inactiveState;
                    var paramsMatch = paramsEqualForState(state.ownParams, stateParams, inactiveState.locals.globals.$stateParams);
                    return paramsMatch ? inactiveState : null;
                }

                function paramsEqualForState(ownParams, stateParams, stateParams2) {
                    if (ownParams && typeof ownParams.$$equals === 'function') {
                        return ownParams.$$equals(stateParams, stateParams2);
                    }
                    return equalForKeys(stateParams, stateParams2, ownParams);
                }

                // Duplicates logic in $state.transitionTo, primarily to find the pivot state (i.e., the "keep" value)
                function equalForKeys(a, b, keys) {
                    if (!angular.isArray(keys) && angular.isObject(keys)) {
                        keys = protoKeys(keys, ["$$keys", "$$values", "$$equals", "$$validates", "$$new", "$$parent"]);
                    }
                    if (!keys) {
                        keys = [];
                        for (var n in a) keys.push(n); // Used instead of Object.keys() for IE8 compatibility
                    }

                    for (var i = 0; i < keys.length; i++) {
                        var k = keys[i];
                        if (a[k] != b[k]) return false; // Not '===', values aren't necessarily normalized
                    }
                    return true;
                }

                function calcTreeChanges(transition) {
                    var fromPath = transition.fromState.path;
                    var toPath = transition.toState.path;
                    var toParams = transition.toParams;
                    var keep = 0,
                        state = toPath[keep];

                    if (transition.options && transition.options.inherit) {
                        toParams = transition.toParams =
                            inheritParams($stateParams, toParams || {}, $state.$current, transition.toState);
                    }

                    while (state && state === fromPath[keep] && paramsEqualForState(state.ownParams, toParams, transition.fromParams)) {
                        // We're "keeping" this state. bump keep var and get the next state in toPath for the next iteration.
                        state = toPath[++keep];
                    }

                    return {
                        keep: keep,
                        retained: fromPath.slice(0, keep),
                        exiting: fromPath.slice(keep),
                        entering: toPath.slice(keep)
                    };
                }

                function sortByStateDepth(a, b) {
                    return a.name.split(".").length - b.name.split(".").length;
                }

                var stickySupport = {
                    getInactiveStates: function() {
                        return map(inactiveStates, angular.identity).sort(sortByStateDepth);
                    },
                    getInactiveStatesByParent: function() {
                        return mapInactives();
                    },

                    processTransition: function(transition) {
                        var treeChanges = calcTreeChanges(transition);
                        var currentInactives = stickySupport.getInactiveStates();
                        var futureInactives, exitingTypes, enteringTypes;
                        var keep = treeChanges.keep;


                        /////////////////////////////////////////
                        // helper functions
                        function notIn(array) {
                            return function(elem) {
                                return array.indexOf(elem) === -1;
                            };
                        }

                        function flattenReduce(memo, list) {
                            return memo.concat(list);
                        }

                        function prop(attr) {
                            return function(obj) {
                                return obj[attr];
                            };
                        }

                        function typeIs(type) {
                            return function(obj) {
                                return obj.type === type;
                            };
                        }

                        function isChildOf(state) {
                            return function(other) {
                                return other.parent === state;
                            };
                        }
                        var notEntering = notIn(treeChanges.entering);

                        function notSticky(state) {
                            return !state.sticky;
                        }

                        var shouldInactivate = treeChanges.exiting[0] && treeChanges.exiting[0].sticky && treeChanges.entering.length > 0;
                        exitingTypes = treeChanges.exiting.map(function(state) {
                            var stateRentering = treeChanges.entering.indexOf(state) !== -1;
                            var type = shouldInactivate && !stateRentering ? "inactivate" : "exit";
                            return {
                                type: type,
                                state: state
                            };
                        });

                        var reloaded = transition.options && !!transition.options.reload;
                        enteringTypes = treeChanges.entering.map(function(state) {
                            var type = getEnterTransition(state, transition.toParams, transition.reloadStateTree, reloaded);
                            reloaded = reloaded || type === 'reload';
                            return {
                                type: type,
                                state: state
                            };
                        });

                        var orphanedRoots = treeChanges.entering
                            // For each entering state in the path, find all sibling states which are currently inactive
                            .map(function(entering) {
                                return currentInactives.filter(isChildOf(entering.parent));
                            })
                            // Flatten nested arrays. Now we have an array of inactive states that are children of the ones being entered.
                            .reduce(flattenReduce, [])
                            // Consider "orphaned": only those children that are themselves not currently being entered
                            .filter(notEntering)
                            // Consider "orphaned": only those children that are not themselves sticky states.
                            .filter(notSticky)
                            // Finally, union that set with any inactive children of the "to state"
                            .concat(currentInactives.filter(isChildOf(transition.toState)));

                        var currentInactivesByParent = mapInactivesByImmediateParent();
                        var allOrphans = orphanedRoots
                            .map(function(root) {
                                return currentInactivesByParent[root.name];
                            })
                            .filter(angular.isDefined)
                            .reduce(flattenReduce, [])
                            .concat(orphanedRoots)
                            // Sort by depth to exit orphans in proper order
                            .sort(sortByStateDepth);

                        // Add them to the list of states being exited.
                        var exitOrOrphaned = exitingTypes
                            .filter(typeIs("exit"))
                            .map(prop("state"))
                            .concat(allOrphans);

                        // Now calculate the states that will be inactive if this transition succeeds.
                        // We have already pushed the transitionType == "inactivate" states to 'inactives'.
                        // Second, add all the existing inactive states
                        futureInactives = currentInactives
                            .filter(notIn(exitOrOrphaned))
                            .filter(notIn(treeChanges.entering))
                            .concat(exitingTypes.filter(typeIs("inactivate")).map(prop("state")))
                            .sort(sortByStateDepth);

                        return {
                            keep: keep,
                            enter: new Array(keep).concat(enteringTypes.map(prop("type"))),
                            exit: new Array(keep).concat(exitingTypes.map(prop("type"))),
                            inactives: futureInactives,
                            reactivatingStates: enteringTypes.filter(typeIs("reactivate")).map(prop("state")),
                            orphans: allOrphans
                        };
                    },

                    // Adds a state to the inactivated sticky state registry.
                    stateInactivated: function(state) {
                        // Keep locals around.
                        inactiveStates[state.self.name] = state;
                        // Notify states they are being Inactivated (i.e., a different
                        // sticky state tree is now active).
                        state.self.status = 'inactive';
                        if (state.self.onInactivate)
                            $injector.invoke(state.self.onInactivate, state.self, state.locals.globals);
                    },

                    // Removes a previously inactivated state from the inactive sticky state registry
                    stateReactivated: function(state) {
                        if (inactiveStates[state.self.name]) {
                            delete inactiveStates[state.self.name];
                        }
                        state.self.status = 'entered';
                        //        if (state.locals == null || state.locals.globals == null) debugger;
                        if (state.self.onReactivate)
                            $injector.invoke(state.self.onReactivate, state.self, state.locals.globals);
                    },

                    // Exits all inactivated descendant substates when the ancestor state is exited.
                    // When transitionTo is exiting a state, this function is called with the state being exited.  It checks the
                    // registry of inactivated states for descendants of the exited state and also exits those descendants.  It then
                    // removes the locals and de-registers the state from the inactivated registry.
                    stateExiting: function(exiting, exitQueue, onExit) {
                        var exitingNames = {};
                        angular.forEach(exitQueue, function(state) {
                            exitingNames[state.self.name] = true;
                        });

                        angular.forEach(inactiveStates, function(inactiveExiting, name) {
                            // TODO: Might need to run the inactivations in the proper depth-first order?
                            if (!exitingNames[name] && inactiveExiting.includes[exiting.name]) {
                                if (DEBUG) $log.debug("Exiting " + name + " because it's a substate of " + exiting.name + " and wasn't found in ", exitingNames);
                                if (inactiveExiting.self.onExit)
                                    $injector.invoke(inactiveExiting.self.onExit, inactiveExiting.self, inactiveExiting.locals.globals);
                                angular.forEach(inactiveExiting.locals, function(localval, key) {
                                    delete inactivePseudoState.locals[key];
                                });
                                inactiveExiting.locals = null;
                                inactiveExiting.self.status = 'exited';
                                delete inactiveStates[name];
                            }
                        });

                        if (onExit)
                            $injector.invoke(onExit, exiting.self, exiting.locals.globals);
                        exiting.locals = null;
                        exiting.self.status = 'exited';
                        delete inactiveStates[exiting.self.name];
                    },

                    // Removes a previously inactivated state from the inactive sticky state registry
                    stateEntering: function(entering, params, onEnter, updateParams) {
                        var inactivatedState = getInactivatedState(entering);
                        if (inactivatedState && (updateParams || !getInactivatedState(entering, params))) {
                            var savedLocals = entering.locals;
                            this.stateExiting(inactivatedState);
                            entering.locals = savedLocals;
                        }
                        entering.self.status = 'entered';

                        if (onEnter)
                            $injector.invoke(onEnter, entering.self, entering.locals.globals);
                    },
                    reset: function reset(inactiveState, params) {
                        function resetOne(state) {
                            stickySupport.reset(state);
                        }
                        if (inactiveState === "*") {
                            angular.forEach(stickySupport.getInactiveStates(), resetOne);
                            return true;
                        }
                        var state = $state.get(inactiveState);
                        if (!state) return false;
                        var exiting = getInactivatedState(state, params);
                        if (!exiting) return false;
                        stickySupport.stateExiting(exiting);
                        $rootScope.$broadcast("$viewContentLoading");
                        return true;
                    }
                };

                return stickySupport;
            }
        ];
    }

    mod_sticky.provider("$stickyState", $StickyStateProvider);

    // ------------------------ Sticky State module-level variables -----------------------------------------------
    var _StickyState; // internal reference to $stickyStateProvider
    var root, // Root state, internal representation
        pendingTransitions = [], // One transition may supersede another.  This holds references to all pending transitions
        pendingRestore, // The restore function from the superseded transition
        inactivePseudoState, // This pseudo state holds all the inactive states' locals (resolved state data, such as views etc)
        reactivatingLocals = {}, // This is a prent locals to the inactivePseudoState locals, used to hold locals for states being reactivated
        versionHeuristics = { // Heuristics used to guess the current UI-Router Version
            hasParamSet: false
        };

    // Creates a blank surrogate state
    function SurrogateState(type) {
        return {
            resolve: {},
            locals: {
                globals: root && root.locals && root.locals.globals
            },
            views: {},
            self: {},
            params: {},
            ownParams: (versionHeuristics.hasParamSet ? {
                $$equals: function() {
                    return true;
                }
            } : []),
            surrogateType: type
        };
    }

    // ------------------------ Sticky State registration and initialization code ----------------------------------
    // Grab a copy of the $stickyState service for use by the transition management code
    angular.module("ng.ui.router.extras.sticky").run(["$stickyState", function($stickyState) {
        _StickyState = $stickyState;
    }]);

    angular.module("ng.ui.router.extras.sticky").config(
        ["$provide", "$stateProvider", '$stickyStateProvider', '$urlMatcherFactoryProvider', 'uirextras_coreProvider',
            function($provide, $stateProvider, $stickyStateProvider, $urlMatcherFactoryProvider, uirextras_coreProvider) {
                var core = uirextras_coreProvider;
                var internalStates = core.internalStates;
                var inherit = core.inherit;
                var forEach = core.forEach;
                var map = core.map;
                var filterObj = core.filterObj;

                versionHeuristics.hasParamSet = !!$urlMatcherFactoryProvider.ParamSet;
                // inactivePseudoState (__inactives) holds all the inactive locals which includes resolved states data, i.e., views, scope, etc
                inactivePseudoState = angular.extend(new SurrogateState("__inactives"), {
                    self: {
                        name: '__inactives'
                    }
                });
                // Reset other module scoped variables.  This is to primarily to flush any previous state during karma runs.
                root = pendingRestore = undefined;
                pendingTransitions = [];

                uirextras_coreProvider.onStateRegistered(function(state) {
                    // Register the ones marked as "sticky"
                    if (state.self.sticky === true) {
                        $stickyStateProvider.registerStickyState(state.self);
                    }
                });

                var $state_transitionTo; // internal reference to the real $state.transitionTo function
                // Decorate the $state service, so we can decorate the $state.transitionTo() function with sticky state stuff.
                $provide.decorator("$state", ['$delegate', '$log', '$q', function($state, $log, $q) {
                    // Note: this code gets run only on the first state that is decorated
                    root = $state.$current;
                    internalStates[""] = root;
                    root.parent = inactivePseudoState; // Make inactivePsuedoState the parent of root.  "wat"
                    inactivePseudoState.parent = undefined; // Make inactivePsuedoState the real root.
                    // Add another locals bucket, as a parent to inactivatePseudoState locals.
                    // This is for temporary storage of locals of states being reactivated while a transition is pending
                    // This is necessary in some cases where $viewContentLoading is triggered before the $state.$current is updated to the toState.
                    inactivePseudoState.locals = inherit(reactivatingLocals, inactivePseudoState.locals);
                    root.locals = inherit(inactivePseudoState.locals, root.locals); // make root locals extend the __inactives locals.
                    delete inactivePseudoState.locals.globals;

                    // Hold on to the real $state.transitionTo in a module-scope variable.
                    $state_transitionTo = $state.transitionTo;

                    // ------------------------ Decorated transitionTo implementation begins here ---------------------------
                    $state.transitionTo = function(to, toParams, options) {
                        var DEBUG = $stickyStateProvider.debugMode();
                        // TODO: Move this to module.run?
                        // TODO: I'd rather have root.locals prototypally inherit from inactivePseudoState.locals
                        // Link root.locals and inactives.locals.  Do this at runtime, after root.locals has been set.
                        if (!inactivePseudoState.locals)
                            inactivePseudoState.locals = root.locals;
                        var idx = pendingTransitions.length;
                        if (pendingRestore) {
                            pendingRestore();
                            if (DEBUG) {
                                $log.debug("Restored paths from pending transition");
                            }
                        }

                        var fromState = $state.$current,
                            fromParams = $state.params;
                        var rel = options && options.relative || $state.$current; // Not sure if/when $state.$current is appropriate here.
                        var toStateSelf = $state.get(to, rel); // exposes findState relative path functionality, returns state.self
                        var savedToStatePath, savedFromStatePath, stickyTransitions;
                        var reactivated = [],
                            exited = [],
                            terminalReactivatedState;
                        toParams = toParams || {};
                        arguments[1] = toParams;

                        var noop = function() {};
                        // Sticky states works by modifying the internal state objects of toState and fromState, especially their .path(s).
                        // The restore() function is a closure scoped function that restores those states' definitions to their original values.
                        var restore = function() {
                            if (savedToStatePath) {
                                toState.path = savedToStatePath;
                                savedToStatePath = null;
                            }

                            if (savedFromStatePath) {
                                fromState.path = savedFromStatePath;
                                savedFromStatePath = null;
                            }

                            angular.forEach(restore.restoreFunctions, function(restoreFunction) {
                                restoreFunction();
                            });

                            // Restore is done, now set the restore function to noop in case it gets called again.
                            restore = noop;
                            // pendingRestore keeps track of a transition that is in progress.  It allows the decorated transitionTo
                            // method to be re-entrant (for example, when superceding a transition, i.e., redirect).  The decorated
                            // transitionTo checks right away if there is a pending transition in progress and restores the paths
                            // if so using pendingRestore.
                            pendingRestore = null;
                            pendingTransitions.splice(idx, 1); // Remove this transition from the list
                        };

                        // All decorated transitions have their toState.path and fromState.path replaced.  Surrogate states also make
                        // additional changes to the states definition before handing the transition off to UI-Router. In particular,
                        // certain types of surrogate states modify the state.self object's onEnter or onExit callbacks.
                        // Those surrogate states must then register additional restore steps using restore.addRestoreFunction(fn)
                        restore.restoreFunctions = [];
                        restore.addRestoreFunction = function addRestoreFunction(fn) {
                            this.restoreFunctions.push(fn);
                        };

                        // --------------------- Surrogate State Functions ------------------------
                        // During a transition, the .path arrays in toState and fromState are replaced.  Individual path elements
                        // (states) which aren't being "kept" are replaced with surrogate elements (states).  This section of the code
                        // has factory functions for all the different types of surrogate states.


                        function stateReactivatedSurrogatePhase1(state) {
                            var surrogate = angular.extend(new SurrogateState("reactivate_phase1"), {
                                locals: state.locals
                            });
                            surrogate.self = angular.extend({}, state.self);
                            return surrogate;
                        }

                        function stateReactivatedSurrogatePhase2(state) {
                            var surrogate = angular.extend(new SurrogateState("reactivate_phase2"), state);
                            var oldOnEnter = surrogate.self.onEnter;
                            surrogate.resolve = {}; // Don't re-resolve when reactivating states (fixes issue #22)
                            // TODO: Not 100% sure if this is necessary.  I think resolveState will load the views if I don't do this.
                            surrogate.views = {}; // Don't re-activate controllers when reactivating states (fixes issue #22)
                            surrogate.self.onEnter = function() {
                                // ui-router sets locals on the surrogate to a blank locals (because we gave it nothing to resolve)
                                // Re-set it back to the already loaded state.locals here.
                                surrogate.locals = state.locals;
                                _StickyState.stateReactivated(state);
                            };
                            restore.addRestoreFunction(function() {
                                state.self.onEnter = oldOnEnter;
                            });
                            return surrogate;
                        }

                        function stateInactivatedSurrogate(state) {
                            var surrogate = new SurrogateState("inactivate");
                            surrogate.self = state.self;
                            var oldOnExit = state.self.onExit;
                            surrogate.self.onExit = function() {
                                _StickyState.stateInactivated(state);
                            };
                            restore.addRestoreFunction(function() {
                                state.self.onExit = oldOnExit;
                            });
                            return surrogate;
                        }

                        function stateEnteredSurrogate(state, toParams) {
                            var oldOnEnter = state.self.onEnter;
                            state.self.onEnter = function() {
                                _StickyState.stateEntering(state, toParams, oldOnEnter);
                            };
                            restore.addRestoreFunction(function() {
                                state.self.onEnter = oldOnEnter;
                            });

                            return state;
                        }

                        // TODO: This may be completely unnecessary now that we're using $$uirouterextrasreload temp param
                        function stateUpdateParamsSurrogate(state, toParams) {
                            var oldOnEnter = state.self.onEnter;
                            state.self.onEnter = function() {
                                _StickyState.stateEntering(state, toParams, oldOnEnter, true);
                            };
                            restore.addRestoreFunction(function() {
                                state.self.onEnter = oldOnEnter;
                            });

                            return state;
                        }

                        function stateExitedSurrogate(state) {
                            var oldOnExit = state.self.onExit;
                            state.self.onExit = function() {
                                _StickyState.stateExiting(state, exited, oldOnExit);
                            };
                            restore.addRestoreFunction(function() {
                                state.self.onExit = oldOnExit;
                            });

                            return state;
                        }


                        // --------------------- decorated .transitionTo() logic starts here ------------------------
                        if (toStateSelf) {
                            var toState = internalStates[toStateSelf.name]; // have the state, now grab the internal state representation
                            if (toState) {
                                // Save the toState and fromState paths to be restored using restore()
                                savedToStatePath = toState.path;
                                savedFromStatePath = fromState.path;

                                // Try to resolve options.reload to a state.  If so, we'll reload only up to the given state.
                                var reload = options && options.reload || false;
                                var reloadStateTree = reload && (reload === true ? savedToStatePath[0].self : $state.get(reload, rel));
                                // If options.reload is a string or a state, we want to handle reload ourselves and not
                                // let ui-router reload the entire toPath.
                                if (options && reload && reload !== true)
                                    delete options.reload;

                                var currentTransition = {
                                    toState: toState,
                                    toParams: toParams || {},
                                    fromState: fromState,
                                    fromParams: fromParams || {},
                                    options: options,
                                    reloadStateTree: reloadStateTree
                                };

                                pendingTransitions.push(currentTransition); // TODO: See if a list of pending transitions is necessary.
                                pendingRestore = restore;

                                // If we're reloading from a state and below, temporarily add a param to the top of the state tree
                                // being reloaded, and add a param value to the transition.  This will cause the "has params changed
                                // for state" check to return true, and the states will be reloaded.
                                if (reloadStateTree) {
                                    currentTransition.toParams.$$uirouterextrasreload = Math.random();
                                    var params = reloadStateTree.$$state().params;
                                    var ownParams = reloadStateTree.$$state().ownParams;

                                    if (versionHeuristics.hasParamSet) {
                                        var tempParam = new $urlMatcherFactoryProvider.Param('$$uirouterextrasreload');
                                        params.$$uirouterextrasreload = ownParams.$$uirouterextrasreload = tempParam;
                                        restore.restoreFunctions.push(function() {
                                            delete params.$$uirouterextrasreload;
                                            delete ownParams.$$uirouterextrasreload;
                                        });
                                    } else {
                                        params.$$uirouterextrasreload = null;
                                        ownParams.$$uirouterextrasreload = null;

                                        restore.restoreFunctions.push(function() {
                                            params.length = params.length - 1;
                                            ownParams.length = ownParams.length - 1;
                                        });
                                    }
                                }

                                // $StickyStateProvider.processTransition analyzes the states involved in the pending transition.  It
                                // returns an object that tells us:
                                // 1) if we're involved in a sticky-type transition
                                // 2) what types of exit transitions will occur for each "exited" path element
                                // 3) what types of enter transitions will occur for each "entered" path element
                                // 4) which states will be inactive if the transition succeeds.
                                stickyTransitions = _StickyState.processTransition(currentTransition);

                                if (DEBUG) debugTransition($log, currentTransition, stickyTransitions);

                                // Begin processing of surrogate to and from paths.
                                var surrogateToPath = toState.path.slice(0, stickyTransitions.keep);
                                var surrogateFromPath = fromState.path.slice(0, stickyTransitions.keep);

                                // Clear out and reload inactivePseudoState.locals each time transitionTo is called
                                angular.forEach(inactivePseudoState.locals, function(local, name) {
                                    if (name.indexOf("@") != -1) delete inactivePseudoState.locals[name];
                                });

                                var saveViewsToLocals = function(targetObj) {
                                    return function(view, name) {
                                        if (name.indexOf("@") !== -1) { // Only grab this state's "view" locals
                                            targetObj[name] = view; // Add all inactive views not already included.
                                        }
                                    };
                                };

                                // For each state that will be inactive when the transition is complete, place its view-locals on the
                                // __inactives pseudostate's .locals.  This allows the ui-view directive to access them and
                                // render the inactive views.
                                forEach(stickyTransitions.inactives, function(state) {
                                    forEach(state.locals, saveViewsToLocals(inactivePseudoState.locals));
                                });

                                forEach(stickyTransitions.reactivatingStates, function(state) {
                                    forEach(state.locals, saveViewsToLocals(reactivatingLocals));
                                });

                                // When the transition is complete, remove the copies of the view locals from reactivatingLocals.
                                restore.addRestoreFunction(function clearReactivatingLocals() {
                                    forEach(reactivatingLocals, function(val, viewname) {
                                        delete reactivatingLocals[viewname];
                                    });
                                });

                                // Find all the states the transition will be entering.  For each entered state, check entered-state-transition-type
                                // Depending on the entered-state transition type, place the proper surrogate state on the surrogate toPath.
                                angular.forEach(stickyTransitions.enter, function(value, idx) {
                                    var surrogate;
                                    var enteringState = toState.path[idx];
                                    if (value === "reactivate") {
                                        // Reactivated states require TWO surrogates.  The "phase 1 reactivated surrogates" are added to both
                                        // to.path and from.path, and as such, are considered to be "kept" by UI-Router.
                                        // This is required to get UI-Router to add the surrogate locals to the protoypal locals object
                                        surrogate = stateReactivatedSurrogatePhase1(enteringState);
                                        surrogateToPath.push(surrogate);
                                        surrogateFromPath.push(surrogate); // so toPath[i] === fromPath[i]

                                        // The "phase 2 reactivated surrogate" is added to the END of the .path, after all the phase 1
                                        // surrogates have been added.
                                        reactivated.push(stateReactivatedSurrogatePhase2(enteringState));
                                        terminalReactivatedState = enteringState;
                                    } else if (value === "reload") {
                                        // If the state params have been changed, we need to exit any inactive states and re-enter them.
                                        surrogateToPath.push(stateUpdateParamsSurrogate(enteringState));
                                        terminalReactivatedState = enteringState;
                                    } else if (value === "enter") {
                                        // Standard enter transition.  We still wrap it in a surrogate.
                                        surrogateToPath.push(stateEnteredSurrogate(enteringState));
                                    }
                                });

                                // Find all the states the transition will be exiting.  For each exited state, check the exited-state-transition-type.
                                // Depending on the exited-state transition type, place a surrogate state on the surrogate fromPath.
                                angular.forEach(stickyTransitions.exit, function(value, idx) {
                                    var exiting = fromState.path[idx];
                                    if (value === "inactivate") {
                                        surrogateFromPath.push(stateInactivatedSurrogate(exiting));
                                        exited.push(exiting);
                                    } else if (value === "exit") {
                                        surrogateFromPath.push(stateExitedSurrogate(exiting));
                                        exited.push(exiting);
                                    }
                                });

                                // Add surrogate states for reactivated to ToPath again (phase 2), this time without a matching FromPath entry
                                // This is to get ui-router to call the surrogate's onEnter callback.
                                if (reactivated.length) {
                                    angular.forEach(reactivated, function(surrogate) {
                                        surrogateToPath.push(surrogate);
                                    });
                                }

                                // We may transition directly to an inactivated state, reactivating it.  In this case, we should
                                // exit all of that state's inactivated children.
                                var orphans = stickyTransitions.orphans;
                                // Add surrogate exited states for all orphaned descendants of the Deepest Reactivated State
                                surrogateFromPath = surrogateFromPath.concat(map(orphans, function(exiting) {
                                    return stateExitedSurrogate(exiting);
                                }));
                                exited = exited.concat(orphans);

                                // Replace the .path variables.  toState.path and fromState.path are now ready for a sticky transition.
                                fromState.path = surrogateFromPath;
                                toState.path = surrogateToPath;

                                var pathMessage = function(state) {
                                    return (state.surrogateType ? state.surrogateType + ":" : "") + state.self.name;
                                };
                                if (DEBUG) $log.debug("SurrogateFromPath: ", map(surrogateFromPath, pathMessage));
                                if (DEBUG) $log.debug("SurrogateToPath:   ", map(surrogateToPath, pathMessage));
                            }
                        }

                        // toState and fromState are all set up; now run stock UI-Router's $state.transitionTo().
                        var transitionPromise = $state_transitionTo.apply($state, arguments);

                        // Add post-transition promise handlers, then return the promise to the original caller.
                        return transitionPromise.then(function transitionSuccess(state) {
                            // First, restore toState and fromState to their original values.
                            restore();
                            if (DEBUG) debugViewsAfterSuccess($log, internalStates[state.name], $state);

                            state.status = 'active'; // TODO: This status is used in statevis.js, and almost certainly belongs elsewhere.

                            return state;
                        }, function transitionFailed(err) {
                            restore();
                            if (DEBUG &&
                                err.message !== "transition prevented" &&
                                err.message !== "transition aborted" &&
                                err.message !== "transition superseded") {
                                $log.debug("transition failed", err);
                                $log.debug(err.stack);
                            }
                            return $q.reject($q.defer('ng_ui_router_extra_sticky_reject_err'), err);
                        });
                    };
                    return $state;
                }]);



                function debugTransition($log, currentTransition, stickyTransition) {
                    function message(path, index, state) {
                        return (path[index] ? path[index].toUpperCase() + ": " + state.self.name : "(" + state.self.name + ")");
                    }

                    var inactiveLogVar = map(stickyTransition.inactives, function(state) {
                        return state.self.name;
                    });
                    var enterLogVar = map(currentTransition.toState.path, function(state, index) {
                        return message(stickyTransition.enter, index, state);
                    });
                    var exitLogVar = map(currentTransition.fromState.path, function(state, index) {
                        return message(stickyTransition.exit, index, state);
                    });

                    var transitionMessage = currentTransition.fromState.self.name + ": " +
                        angular.toJson(currentTransition.fromParams) + ": " +
                        " -> " +
                        currentTransition.toState.self.name + ": " +
                        angular.toJson(currentTransition.toParams);

                    $log.debug("------------------------------------------------------");
                    $log.debug("   Current transition: ", transitionMessage);
                    $log.debug("Before transition, inactives are:   : ", map(_StickyState.getInactiveStates(), function(s) {
                        return s.self.name;
                    }));
                    $log.debug("After transition,  inactives will be: ", inactiveLogVar);
                    $log.debug("Transition will exit:  ", exitLogVar);
                    $log.debug("Transition will enter: ", enterLogVar);
                }

                function debugViewsAfterSuccess($log, currentState) {
                    $log.debug("Current state: " + currentState.self.name + ", inactive states: ", map(_StickyState.getInactiveStates(), function(s) {
                        return s.self.name;
                    }));

                    var statesOnly = function(local, name) {
                        return name != 'globals' && name != 'resolve';
                    };

                    var viewsForState = function(state) {
                        var viewLocals = filterObj(state.locals, statesOnly);

                        if (!Object.keys(viewLocals).length) {
                            viewLocals[''] = {
                                $$state: {
                                    name: null
                                }
                            };
                        }

                        return map(viewLocals, function(local, name) {
                            return {
                                localsFor: state.self.name ? state.self.name : "(root)",
                                uiViewName: name || null,
                                filledByState: local.$$state.name
                            };
                        });
                    };

                    var viewsByState = viewsForState(currentState);
                    var parent = currentState.parent;
                    while (parent && parent !== currentState) {
                        viewsByState = viewsByState.concat(viewsForState(parent));
                        currentState = parent;
                        parent = currentState.parent;
                    }

                    $log.debug("Views active on each state:");
                    console.table(viewsByState.reverse());
                }
            }
        ]
    );

})(angular);