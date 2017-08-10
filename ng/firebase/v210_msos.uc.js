
/*!
 * AngularFire is the officially supported AngularJS binding for Firebase. Firebase
 * is a full backend so you don't need servers to build your Angular app. AngularFire
 * provides you with the $firebase service which allows you to easily keep your $scope
 * variables in sync with your Firebase backend.
 *
 * AngularFire 2.1.0
 * https://github.com/firebase/angularfire/
 * Date: 10/25/2016
 * License: MIT
 */

/*global
    msos: false,
    angular: false,
    firebase: false,
    Modernizr: false,
    _: false
*/

(function () {
    "use strict";

    angular.module(
        'firebase.utils',
        ['ng']
    ).factory(
        '$firebaseUtils',
        ["$q", "$timeout", "$rootScope", function ($q, $timeout, $rootScope) {

            var utils = {

                batch: function (action, context) {
                    return function () {
                        var args = Array.prototype.slice.call(arguments, 0);
                        utils.compile(function () {
                            action.apply(context, args);
                        });
                    };
                },
                debounce: function (fn, ctx, wait, maxWait) {
                    var start,
                        cancelTimer,
                        args,
                        runScheduledForNextTick;

                    if (typeof ctx === 'number') {
                        maxWait = wait;
                        wait = ctx;
                        ctx = null;
                    }

                    if (typeof wait !== 'number') {
                        throw new Error('Must provide a valid integer for wait. Try 0 for a default');
                    }

                    if (typeof fn !== 'function') {
                        throw new Error('Must provide a valid function to debounce');
                    }

                    if (!maxWait) {
                        maxWait = wait * 10 || 100;
                    }

                    // Clears the queue and invokes the debounced function with the most recent arguments
                    function runNow() {
                        cancelTimer = null;
                        start = null;
                        runScheduledForNextTick = false;
                        fn.apply(ctx, args);
                    }

                    // clears the current wait timer and creates a new one
                    // however, if maxWait is exceeded, calls runNow() on the next tick.
                    function resetTimer() {

                        if (cancelTimer) {
                            cancelTimer();
                            cancelTimer = null;
                        }

                        if (start && Date.now() - start > maxWait) {
                            if (!runScheduledForNextTick) {
                                runScheduledForNextTick = true;
                                utils.compile(runNow);
                            }
                        } else {
                            if (!start) {
                                start = Date.now();
                            }
                            cancelTimer = utils.wait(runNow, wait);
                        }
                    }

                    function debounced() {
                        args = Array.prototype.slice.call(arguments, 0);
                        resetTimer();
                    }

                    debounced.running = function () {
                        return start > 0;
                    };

                    return debounced;
                },
                assertValidRef: function (ref, msg) {
                    if (!angular.isObject(ref) ||
                        typeof (ref.ref) !== 'object' ||
                        typeof (ref.ref.transaction) !== 'function') {
                        throw new Error(msg || 'Invalid Firebase reference');
                    }
                },
                inherit: function (ChildClass, ParentClass, methods) {
                    var childMethods = ChildClass.prototype;

                    ChildClass.prototype = _.create(ParentClass.prototype);
                    ChildClass.prototype.constructor = ChildClass; // restoring proper constructor for child class

                    angular.forEach(
                        _.keys(childMethods),
                        function (k) {
                            ChildClass.prototype[k] = childMethods[k];
                        }
                    );

                    if (angular.isObject(methods)) {
                        angular.extend(ChildClass.prototype, methods);
                    }

                    return ChildClass;
                },
                getPrototypeMethods: function (inst, iterator, context) {

                    var methods = {},
                        objProto = Object.getPrototypeOf({}),
                        proto = angular.isFunction(inst) && angular.isObject(inst.prototype)
                            ? inst.prototype
                            : Object.getPrototypeOf(inst),
                        key;

                    while (proto && proto !== objProto) {
                        for (key in proto) {
                            // we only invoke each key once; if a super is overridden it's skipped here
                            if (proto.hasOwnProperty(key) && !methods.hasOwnProperty(key)) {
                                methods[key] = true;
                                iterator.call(context, proto[key], key, proto);
                            }
                        }

                        proto = Object.getPrototypeOf(proto);
                    }
                },
                getPublicMethods: function (inst, iterator, context) {
                    utils.getPrototypeMethods(
                        inst,
                        function (m, k) {
                            if (typeof m === 'function' && k.charAt(0) !== '_') {
                                iterator.call(context, m, k);
                            }
                        }
                    );
                },
                makeNodeResolver: function (deferred) {
                    return function (err, result) {
                        if (err === null) {
                            if (arguments.length > 2) {
                                deferred.resolve(Array.prototype.slice.call(arguments, 1));
                            } else {
                                deferred.resolve(result);
                            }
                        } else {
                            deferred.reject(err);
                        }
                    };
                },
                wait: function (fn, wait) {
                    var to = $timeout(fn, wait || 0);

                    return function () {
                        if (to) {
                            $timeout.cancel(to);
                            to = null;
                        }
                    };
                },
                compile: function (fn) {
                    return $rootScope.$evalAsync(fn || angular.noop);
                },
                deepCopy: function (obj) {
                    if (!angular.isObject(obj)) {
                        return obj;
                    }

                    var newCopy = angular.isArray(obj) ? obj.slice() : angular.extend({}, obj),
                        key;

                    for (key in newCopy) {
                        if (newCopy.hasOwnProperty(key)) {
                            if (angular.isObject(newCopy[key])) {
                                newCopy[key] = utils.deepCopy(newCopy[key]);
                            }
                        }
                    }

                    return newCopy;
                },
                trimKeys: function (dest, source) {

                    utils.each(
                        dest,
                        function (v_na, k) {
                            if (!source.hasOwnProperty(k)) {
                                delete dest[k];
                            }
                        }
                    );
                },
                scopeData: function (dataOrRec) {
                    var data = {
                            $id: dataOrRec.$id,
                            $priority: dataOrRec.$priority
                        },
                        hasPublicProp = false;

                    utils.each(
                        dataOrRec,
                        function (v, k) {
                            hasPublicProp = true;
                            data[k] = utils.deepCopy(v);
                        }
                    );

                    if (!hasPublicProp && dataOrRec.hasOwnProperty('$value')) {
                        data.$value = dataOrRec.$value;
                    }
                    return data;
                },
                updateRec: function (rec, snap) {
                    var data = snap.val(),
                        oldData = angular.extend({}, rec);

                    // deal with primitives
                    if (!angular.isObject(data)) {
                        rec.$value = data;
                        data = {};
                    } else {
                        delete rec.$value;
                    }

                    // apply changes: remove old keys, insert new data, set priority
                    utils.trimKeys(rec, data);
                    angular.extend(rec, data);

                    rec.$priority = snap.getPriority();

                    return !angular.equals(oldData, rec) || oldData.$value !== rec.$value || oldData.$priority !== rec.$priority;
                },
                applyDefaults: function (rec, defaults) {
                    if (angular.isObject(defaults)) {
                        angular.forEach(
                            defaults,
                            function (v, k) {
                                if (!rec.hasOwnProperty(k)) {
                                    rec[k] = v;
                                }
                            }
                        );
                    }

                    return rec;
                },
                dataKeys: function (obj) {
                    var out = [];

                    utils.each(
                        obj,
                        function (v_na, k) {
                            out.push(k);
                        }
                    );

                    return out;
                },
                each: function (obj, iterator, context) {
                    var k = '',
                        i = 0,
                        c;

                    if (angular.isObject(obj)) {
                        for (k in obj) {
                            if (obj.hasOwnProperty(k)) {
                                c = k.charAt(0);
                                if (c !== '_' && c !== '$' && c !== '.') {
                                    iterator.call(context, obj[k], k, obj);
                                }
                            }
                        }
                    } else if (angular.isArray(obj)) {
                        for (i = 0; i < obj.length; i += 1) {
                            iterator.call(context, obj[i], i, obj);
                        }
                    }

                    return obj;
                },
                toJSON: function (rec) {
                    var dat;

                    function stripDollarPrefixedKeys(data) {
                        if (!angular.isObject(data)) {
                            return data;
                        }

                        var out = _.isArray(data) ? [] : {};

                        angular.forEach(
                            data,
                            function (v, k) {
                                if (typeof k !== 'string' || k.charAt(0) !== '$') {
                                    out[k] = stripDollarPrefixedKeys(v);
                                }
                            }
                        );

                        return out;
                    }

                    if (!angular.isObject(rec)) {
                        rec = {
                            $value: rec
                        };
                    }

                    if (angular.isFunction(rec.toJSON)) {
                        dat = rec.toJSON();
                    } else {
                        dat = {};
                        utils.each(
                            rec,
                            function (v, k) {
                                dat[k] = stripDollarPrefixedKeys(v);
                            }
                        );
                    }

                    if (angular.isDefined(rec.$value) && _.keys(dat).length === 0 && rec.$value !== null) {
                        dat['.value'] = rec.$value;
                    }

                    if (angular.isDefined(rec.$priority) && _.keys(dat).length > 0 && rec.$priority !== null) {
                        dat['.priority'] = rec.$priority;
                    }

                    angular.forEach(
                        dat,
                        function (v, k) {
                            if (k.match(/[.$\[\]#\/]/) && k !== '.value' && k !== '.priority') {
                                throw new Error('Invalid key ' + k + ' (cannot contain .$[]#/)');
                            } else if (angular.isUndefined(v)) {
                                throw new Error('Key ' + k + ' was undefined. Cannot pass undefined in JSON. Use null instead.');
                            }
                        }
                    );

                    return dat;
                },
                doSet: function (ref, data) {
                    var def = $q.defer('ng_firebase_doSet'),
                        dataCopy;

                    if (angular.isFunction(ref.set) || !angular.isObject(data)) {
                        // this is not a query, just do a flat set
                        // Use try / catch to handle being passed data which is undefined or has invalid keys
                        try {
                            ref.set(data, utils.makeNodeResolver(def));
                        } catch (err) {
                            def.reject(err);
                        }
                    } else {
                        dataCopy = angular.extend({}, data);
                        // this is a query, so we will replace all the elements
                        // of this query with the value provided, but not blow away
                        // the entire Firebase path
                        ref.once(
                            'value',
                            function (snap) {
                                snap.forEach(
                                    function (ss) {
                                        if (!dataCopy.hasOwnProperty(ss.key)) {
                                            dataCopy[ss.key] = null;
                                        }
                                    }
                                );

                                ref.ref.update(
                                    dataCopy,
                                    utils.makeNodeResolver(def)
                                );
                            },
                            function (err) {
                                def.reject(err);
                            }
                        );
                    }

                    return def.promise;
                },
                doRemove: function (ref) {
                    var def = $q.defer('ng_firebase_doRemove');

                    if (angular.isFunction(ref.remove)) {
                        // ref is not a query, just do a flat remove
                        ref.remove(utils.makeNodeResolver(def));
                    } else {
                        // ref is a query so let's only remove the
                        // items in the query and not the entire path
                        ref.once(
                            'value',
                            function (snap) {
                                var promises = [];

                                snap.forEach(
                                    function (ss) {
                                        promises.push(ss.ref.remove());
                                    }
                                );

                                utils.allPromises(promises).then(
                                    function () {
                                        def.resolve(ref);
                                    },
                                    function (err) {
                                        def.reject(err);
                                    }
                                );
                            },
                            function (err) {
                                def.reject(err);
                            }
                        );
                    }

                    return def.promise;
                },
                VERSION: '2.1.0',
                allPromises: $q.all.bind($q)
            };

            return utils;
        }]
    );

}());

(function () {
    "use strict";

    var FirebaseAuth;

    FirebaseAuth = function ($q, $firebaseUtils, auth) {
        this._q = $q;
        this._utils = $firebaseUtils;

        if (typeof auth === 'string') {
            throw new Error('The $firebaseAuth service accepts a Firebase auth instance (or nothing) instead of a URL.');
        } else if (auth.ref !== undefined) {
            throw new Error('The $firebaseAuth service accepts a Firebase auth instance (or nothing) instead of a Database reference.');
        }

        this._auth = auth;
        this._initialAuthResolver = this._initAuthResolver();
    };

    FirebaseAuth.prototype = {
        construct: function () {
            this._object = {
                // Authentication methods
                $signInWithCustomToken: this.signInWithCustomToken.bind(this),
                $signInAnonymously: this.signInAnonymously.bind(this),
                $signInWithEmailAndPassword: this.signInWithEmailAndPassword.bind(this),
                $signInWithPopup: this.signInWithPopup.bind(this),
                $signInWithRedirect: this.signInWithRedirect.bind(this),
                $signInWithCredential: this.signInWithCredential.bind(this),
                $signOut: this.signOut.bind(this),

                // Authentication state methods
                $onAuthStateChanged: this.onAuthStateChanged.bind(this),
                $getAuth: this.getAuth.bind(this),
                $requireSignIn: this.requireSignIn.bind(this),
                $waitForSignIn: this.waitForSignIn.bind(this),

                // User management methods
                $createUserWithEmailAndPassword: this.createUserWithEmailAndPassword.bind(this),
                $updatePassword: this.updatePassword.bind(this),
                $updateEmail: this.updateEmail.bind(this),
                $deleteUser: this.deleteUser.bind(this),
                $sendPasswordResetEmail: this.sendPasswordResetEmail.bind(this),

                // Hack: needed for tests
                _: this
            };

            return this._object;
        },
        signInWithCustomToken: function (authToken) {
            var _q = this._q;

            return _q.when(_q.defer('ng_firebase_when_signInWithCustomToken'), this._auth.signInWithCustomToken(authToken));
        },
        signInAnonymously: function () {
            var _q = this._q;

            return _q.when(_q.defer('ng_firebase_when_signInAnonymously'), this._auth.signInAnonymously());
        },
        signInWithEmailAndPassword: function (email, password) {
            var _q = this._q;

            return _q.when(_q.defer('ng_firebase_when_signInWithEmailAndPassword'), this._auth.signInWithEmailAndPassword(email, password));
        },
        signInWithPopup: function (provider) {
            var _q = this._q;

            return _q.when(_q.defer('ng_firebase_when_signInWithPopup'), this._auth.signInWithPopup(this._getProvider(provider)));
        },
        signInWithRedirect: function (provider) {
            var _q = this._q;

            return _q.when(_q.defer('ng_firebase_when_signInWithRedirect'), this._auth.signInWithRedirect(this._getProvider(provider)));
        },
        signInWithCredential: function (credential) {
            var _q = this._q;

            return _q.when(_q.defer('ng_firebase_when_signInWithCredential'), this._auth.signInWithCredential(credential));
        },
        signOut: function () {
            var _q = this._q;

            if (this.getAuth() !== null) {
                return _q.when(_q.defer('ng_firebase_when_signOut'), this._auth.signOut());
            }

            return _q.when(_q.defer('ng_firebase_when_null_signOut'));
        },
        onAuthStateChanged: function (callback, context) {
            var fn = this._utils.debounce(callback, context, 0),
                off = this._auth.onAuthStateChanged(fn);

            // Return a method to detach the `onAuthStateChanged()` callback.
            return off;
        },
        getAuth: function () {
            return this._auth.currentUser;
        },
        _routerMethodOnAuthPromise: function (rejectIfAuthDataIsNull) {
            var self = this;

            return this._initialAuthResolver.then(
                function () {
                    var authData = self.getAuth(),
                        res = null;

                    if (rejectIfAuthDataIsNull && authData === null) {
                        res = self._q.reject(self._q.defer('ng_firebase_reject_routerMethodOnAuthPromise'), "AUTH_REQUIRED");
                    } else {
                        res = self._q.when(self._q.defer('ng_firebase_when_routerMethodOnAuthPromise'), authData);
                    }

                    return res;
                }
            );
        },
        _getProvider: function (stringOrProvider) {
            var provider,
                providerID;

            if (typeof stringOrProvider === "string") {
                providerID = stringOrProvider.slice(0, 1).toUpperCase() + stringOrProvider.slice(1);
                provider = new firebase.auth[providerID + "AuthProvider"]();
            } else {
                provider = stringOrProvider;
            }

            return provider;
        },
        _initAuthResolver: function () {
            var auth = this._auth,
                _q = this._q;

            return _q.resolve(_q.defer('ng_firebase_initAuthResolver'), function (resolve) {
                var off;

                function callback() {
                    off();
                    resolve();
                }

                off = auth.onAuthStateChanged(callback);
            });
        },
        requireSignIn: function () {
            return this._routerMethodOnAuthPromise(true);
        },
        waitForSignIn: function () {
            return this._routerMethodOnAuthPromise(false);
        },
        createUserWithEmailAndPassword: function (email, password) {
            var _q = this._q;

            return _q.when(_q.defer('ng_firebase_when_createUserWithEmailAndPassword'), this._auth.createUserWithEmailAndPassword(email, password));
        },
        updatePassword: function (password) {
            var user = this.getAuth(),
                _q = this._q;

            if (user) {
                return _q.when(_q.defer('ng_firebase_when_updatePassword'), user.updatePassword(password));
            }

            return _q.reject(_q.defer('ng_firebase_reject_updatePassword'), "Cannot update password since there is no logged in user.");
        },
        updateEmail: function (email) {
            var user = this.getAuth(),
                _q = this._q;

            if (user) {
                return _q.when(_q.defer('ng_firebase_when_updateEmail'), user.updateEmail(email));
            }

            return _q.reject(_q.defer('ng_firebase_reject_updateEmail'), "Cannot update email since there is no logged in user.");
        },
        deleteUser: function () {
            var user = this.getAuth(),
                _q = this._q;

            if (user) {
                return _q.when(_q.defer('ng_firebase_when_deleteUser'), user['delete']());
            }

            return _q.reject(_q.defer('ng_firebase_reject_deleteUser'), "Cannot delete user since there is no logged in user.");
        },
        sendPasswordResetEmail: function (email) {
            var _q = this._q;

            return _q.when(_q.defer('ng_firebase_when_sendPasswordResetEmail'), this._auth.sendPasswordResetEmail(email));
        }
    };


    function FirebaseAuthService($firebaseAuth) {
        return $firebaseAuth();
    }

    FirebaseAuthService.$inject = ['$firebaseAuth'];

    // Define a service which provides user authentication and management.
    angular.module(
        'firebase.auth',
        ['ng', 'firebase.utils']
    ).factory(
        '$firebaseAuth',
        ['$q', '$firebaseUtils', function ($q, $firebaseUtils) {

            return function (auth) {

                auth = auth || firebase.auth();

                var firebaseAuth = new FirebaseAuth($q, $firebaseUtils, auth);

                return firebaseAuth.construct();
            };
        }]
    ).factory(
        '$firebaseAuthService',
        FirebaseAuthService
    );

}());

(function () {
    'use strict';

    function FirebaseRef() {

        this.urls = null;
        this.registerUrl = function registerUrl(urlOrConfig) {

            msos.console.debug('ng/firebase - FirebaseRef - registerUrl -> for: ' + urlOrConfig);

            if (typeof urlOrConfig === 'string') {
                this.urls = {};
                this.urls.fb_default = urlOrConfig;
            }

            if (angular.isObject(urlOrConfig)) {
                this.urls = urlOrConfig;
            }
        };

        this.$$checkUrls = function $$checkUrls(urlConfig) {
            var err_out;

            if (!urlConfig) {
                err_out = new Error('No Firebase URL registered. Use firebaseRefProvider.registerUrl() in the config phase. This is required if you are using $firebaseAuthService.');
            } else if (!urlConfig.fb_default) {
                err_out = new Error('No default Firebase URL registered. Use firebaseRefProvider.registerUrl({ fb_default: "https://<my-firebase-app>.firebaseio.com/"}).');
            }

            return err_out;
        };

        this.$$createRefsFromUrlConfig = function $$createMultipleRefs(urlConfig) {
            var refs = {},
                error = this.$$checkUrls(urlConfig);

            if (error) { throw error; }

            angular.forEach(
                urlConfig,
                function (value, key) {
                    refs[key] = firebase.database().refFromURL(value);
                }
            );

            return refs;
        };

        this.$get = function FirebaseRef_$get() {
            return this.$$createRefsFromUrlConfig(this.urls);
        };
    }

    angular.module(
        'firebase.database',
        ['ng', 'firebase.utils']
    ).provider(
        '$firebaseRef',
        FirebaseRef
    ).factory(
        '$firebaseArray',
        ["$log", "$firebaseUtils", "$q", function ($log, $firebaseUtils, $q) {

            function ArraySyncManager(firebaseArray) {

                var def = $q.defer('ng_firebase_ArraySyncManager'),
                    resolutionPromises = [],
                    isResolved = false,
                    error,
                    initComplete,
                    sync = {
                        isDestroyed: false,
                        ready: function () {
                            return def.promise.then(
                                function (result) {
                                    return $q.all($q.defer('ng_firebase_all_ready'), resolutionPromises).then(
                                        function () {
                                            return result;
                                        }
                                    );
                                }
                            );
                        }
                    };

                function waitForResolution(maybePromise, callback) {
                    var promise = $q.when($q.defer('ng_firebase_when_waitForResolution'), maybePromise);

                    promise.then(
                        function (result) {
                            if (result) { callback(result); }
                        }
                    );

                    if (!isResolved) {
                        resolutionPromises.push(promise);
                    }
                }

                function created(snap, prevChild) {
                    if (!firebaseArray) {
                        return;
                    }

                    waitForResolution(
                        firebaseArray.$$added(snap, prevChild),
                        function (rec) {
                            firebaseArray.$$process('child_added', rec, prevChild);
                        }
                    );
                }

                function updated(snap) {
                    if (!firebaseArray) {
                        return;
                    }

                    var rec = firebaseArray.$getRecord(snap.key);

                    if (rec) {
                        waitForResolution(
                            firebaseArray.$$updated(snap),
                            function () {
                                firebaseArray.$$process('child_changed', rec);
                            }
                        );
                    }
                }

                function moved(snap, prevChild) {
                    if (!firebaseArray) {
                        return;
                    }

                    var rec = firebaseArray.$getRecord(snap.key);

                    if (rec) {
                        waitForResolution(
                            firebaseArray.$$moved(snap, prevChild),
                            function () {
                                firebaseArray.$$process('child_moved', rec, prevChild);
                            }
                        );
                    }
                }

                function removed(snap) {
                    if (!firebaseArray) {
                        return;
                    }

                    var rec = firebaseArray.$getRecord(snap.key);

                    if (rec) {
                        waitForResolution(
                            firebaseArray.$$removed(snap),
                            function () {
                                firebaseArray.$$process('child_removed', rec);
                            }
                        );
                    }
                }

                // call initComplete(), do not call this directly
                function _initComplete(err, result) {
                    if (!isResolved) {
                        isResolved = true;

                        if (err) {
                            def.reject(err);
                        } else {
                            def.resolve(result);
                        }
                    }
                }

                error = $firebaseUtils.batch(
                    function (err) {
                        _initComplete(err);

                        if (firebaseArray) {
                            firebaseArray.$$error(err);
                        }
                    }
                );

                initComplete = $firebaseUtils.batch(_initComplete);

                sync.init = function ($list) {
                    var ref = firebaseArray.$ref();

                    // listen for changes at the Firebase instance
                    ref.on('child_added',   created,    error);
                    ref.on('child_moved',   moved,      error);
                    ref.on('child_changed', updated,    error);
                    ref.on('child_removed', removed,    error);

                    // determine when initial load is completed
                    ref.once(
                        'value',
                        function (snap) {
                            if (angular.isArray(snap.val())) {
                                $log.warn('Storing data using array indices in Firebase can result in unexpected behavior. See https://firebase.google.com/docs/database/web/structure-data for more information.');
                            }

                            initComplete(null, $list);
                        },
                        initComplete
                    );
                };

                sync.destroy = function (err) {
                    var ref;

                    if (!sync.isDestroyed) {
                        sync.isDestroyed = true;
                        ref = firebaseArray.$ref();
                        ref.off('child_added',      created);
                        ref.off('child_moved',      moved);
                        ref.off('child_changed',    updated);
                        ref.off('child_removed',    removed);
                        firebaseArray = null;
                        initComplete(err || 'destroyed');
                    }
                };

                return sync;
            }

            function FirebaseArray(ref) {

                if (!(this instanceof FirebaseArray)) {
                    return new FirebaseArray(ref);
                }

                var self = this;

                this._observers = [];
                this.$list = [];
                this._ref = ref;
                this._sync = new ArraySyncManager(this);

                $firebaseUtils.assertValidRef(
                    ref,
                    'Must pass a valid Firebase reference to $firebaseArray (not a string or URL)'
                );

                this._indexCache = {};

                $firebaseUtils.getPublicMethods(
                    self,
                    function (fn, key) {
                        self.$list[key] = fn.bind(self);
                    }
                );

                this._sync.init(this.$list);

                this.$list.$resolved = false;

                this.$loaded()['finally'](
                    function () {
                        self.$list.$resolved = true;
                    }
                );

                return this.$list;
            }

            FirebaseArray.prototype = {

                $add: function (data) {

                    this._assertNotDestroyed('$add');

                    var self = this,
                        def = $q.defer('ng_firebase_fbarray_$add'),
                        ref = this.$ref().ref.push(),
                        dataJSON;

                    try {
                        dataJSON = $firebaseUtils.toJSON(data);
                    } catch (err) {
                        def.reject(err);
                    }

                    if (dataJSON !== undefined) {
                        $firebaseUtils.doSet(
                            ref,
                            dataJSON
                        ).then(
                            function () {
                                self.$$notify('child_added', ref.key);
                                def.resolve(ref);
                            }
                        )['catch'](def.reject);
                    }

                    return def.promise;
                },
                $save: function (indexOrItem) {

                    this._assertNotDestroyed('$save');

                    var self = this,
                        item = self._resolveItem(indexOrItem),
                        key = self.$keyAt(item),
                        def = $q.defer('ng_firebase_fbarray_$save'),
                        ref,
                        dataJSON;

                    if (key !== null) {
                        ref = self.$ref().ref.child(key);

                        try {
                            dataJSON = $firebaseUtils.toJSON(item);
                        } catch (err) {
                            def.reject(err);
                        }

                        if (dataJSON !== undefined) {
                            $firebaseUtils.doSet(
                                ref,
                                dataJSON
                            ).then(
                                function () {
                                    self.$$notify('child_changed', key);
                                    def.resolve(ref);
                                }
                            )['catch'](def.reject);
                        }
                    } else {
                        def.reject('Invalid record; could not determine key for ' + indexOrItem);
                    }

                    return def.promise;
                },
                $remove: function (indexOrItem) {

                    this._assertNotDestroyed('$remove');

                    var key = this.$keyAt(indexOrItem),
                        ref;

                    if (key !== null) {
                        ref = this.$ref().ref.child(key);

                        return $firebaseUtils.doRemove(ref).then(
                            function () {
                                return ref;
                            }
                        );
                    }

                    return $q.reject($q.defer('ng_firebase_reject_$remove'), 'Invalid record; could not determine key for ' + indexOrItem);
                },
                $keyAt: function (indexOrItem) {
                    var item = this._resolveItem(indexOrItem);

                    return this.$$getKey(item);
                },
                $indexFor: function (key) {
                    var self = this,
                        cache = self._indexCache,
                        pos;

                    // evaluate whether our key is cached and, if so, whether it is up to date
                    if (!cache.hasOwnProperty(key) || self.$keyAt(cache[key]) !== key) {
                        // update the hashmap
                        pos = _.findIndex(
                            self.$list,
                            function (rec) { return self.$$getKey(rec) === key; }
                        );

                        if (pos !== -1) {
                            cache[key] = pos;
                        }
                    }
                    return cache.hasOwnProperty(key) ? cache[key] : -1;
                },
                $loaded: function (resolve, reject) {
                    var promise = this._sync.ready();

                    //if (angular.isDefined(resolve)) {
                    if (arguments.length) {
                        promise = promise.then(resolve, reject);
                    }

                    return promise;
                },
                $ref: function () {
                    return this._ref;
                },
                $watch: function (cb, context) {
                    var list = this._observers;

                    list.push([cb, context]);

                    // an off function for cancelling the listener
                    return function () {
                        var i = _.findIndex(
                                list,
                                function (parts) {
                                    return parts[0] === cb && parts[1] === context;
                                }
                            );

                        if (i > -1) {
                            list.splice(i, 1);
                        }
                    };
                },
                $destroy: function (err) {
                    if (!this._isDestroyed) {
                        this._isDestroyed = true;
                        this._sync.destroy(err);
                        this.$list.length = 0;
                    }
                },
                $getRecord: function (key) {
                    var i = this.$indexFor(key);

                    return i > -1 ? this.$list[i] : null;
                },
                $$added: function (snap) {
                    // check to make sure record does not exist
                    var i = this.$indexFor(snap.key),
                        rec;

                    if (i === -1) {
                        // parse data and create record
                        rec = snap.val();

                        if (!angular.isObject(rec)) {
                            rec = {
                                $value: rec
                            };
                        }

                        rec.$id = snap.key;
                        rec.$priority = snap.getPriority();
                        $firebaseUtils.applyDefaults(rec, this.$$defaults);

                        return rec;
                    }

                    return false;
                },
                $$removed: function (snap) {
                    return this.$indexFor(snap.key) > -1;
                },
                $$updated: function (snap) {
                    var changed = false,
                        rec = this.$getRecord(snap.key);

                    if (angular.isObject(rec)) {
                        // apply changes to the record
                        changed = $firebaseUtils.updateRec(rec, snap);
                        $firebaseUtils.applyDefaults(rec, this.$$defaults);
                    }

                    return changed;
                },
                $$moved: function (snap) {
                    var rec = this.$getRecord(snap.key);

                    if (angular.isObject(rec)) {
                        rec.$priority = snap.getPriority();
                        return true;
                    }

                    return false;
                },
                $$error: function (err) {
                    $log.error(err);
                    this.$destroy(err);
                },
                $$getKey: function (rec) {
                    return angular.isObject(rec) ? rec.$id : null;
                },
                $$process: function (event, rec, prevChild) {
                    var key = this.$$getKey(rec),
                        changed = false,
                        curPos;

                    switch (event) {
                        case 'child_added':
                            curPos = this.$indexFor(key);
                            break;
                        case 'child_moved':
                            curPos = this.$indexFor(key);
                            this._spliceOut(key);
                            break;
                        case 'child_removed':
                            // remove record from the array
                            changed = this._spliceOut(key) !== null;
                            break;
                        case 'child_changed':
                            changed = true;
                            break;
                        default:
                            throw new Error('Invalid event type: ' + event);
                    }

                    if (angular.isDefined(curPos)) {
                        // add it to the array
                        changed = this._addAfter(rec, prevChild) !== curPos;
                    }

                    if (changed) {
                        // send notifications to anybody monitoring $watch
                        this.$$notify(event, key, prevChild);
                    }

                    return changed;
                },
                $$notify: function (event, key, prevChild) {
                    var eventData = {
                        event: event,
                        key: key
                    };

                    if (angular.isDefined(prevChild)) {
                        eventData.prevChild = prevChild;
                    }

                    angular.forEach(
                        this._observers,
                        function (parts) {
                            parts[0].call(parts[1], eventData);
                        }
                    );
                },
                _addAfter: function (rec, prevChild) {
                    var i;

                    if (prevChild === null) {
                        i = 0;
                    } else {
                        i = this.$indexFor(prevChild) + 1;

                        if (i === 0) {
                            i = this.$list.length;
                        }
                    }

                    this.$list.splice(i, 0, rec);
                    this._indexCache[this.$$getKey(rec)] = i;

                    return i;
                },
                _spliceOut: function (key) {
                    var i = this.$indexFor(key);

                    if (i > -1) {
                        delete this._indexCache[key];
                        return this.$list.splice(i, 1)[0];
                    }

                    return null;
                },
                _resolveItem: function (indexOrItem) {
                    var list = this.$list,
                        key,
                        rec;

                    if (angular.isNumber(indexOrItem) && indexOrItem >= 0 && list.length >= indexOrItem) {
                        return list[indexOrItem];
                    }

                    if (angular.isObject(indexOrItem)) {

                        key = this.$$getKey(indexOrItem);
                        rec = this.$getRecord(key);

                        return rec === indexOrItem ? rec : null;
                    }

                    return null;
                },
                _assertNotDestroyed: function (method) {
                    if (this._isDestroyed) {
                        throw new Error('Cannot call ' + method + ' method on a destroyed $firebaseArray object');
                    }
                }
            };

            FirebaseArray.$extend = function () {
                var methods,
                    args = arguments || [],
                    ChildClass = args[0] || undefined;

                if (arguments.length === 1 && angular.isObject(ChildClass)) {
                    methods = ChildClass;

                    ChildClass = function (ref) {

                        if (!(this instanceof ChildClass)) {
                            return new ChildClass(ref);
                        }

                        FirebaseArray.apply(this, arguments);

                        return this.$list;
                    };

                } else {
                    methods = args[1] || undefined;
                }

                return $firebaseUtils.inherit(ChildClass, FirebaseArray, methods);
            };

            return FirebaseArray;
        }]
    ).factory(
        '$firebaseObject',
        ['$parse', '$firebaseUtils', '$log', '$q', function ($parse, $firebaseUtils, $log, $q) {

            function ObjectSyncManager(firebaseObject, ref) {

                var isResolved = false,
                    def = $q.defer('ng_firebase_ObjectSyncManager'),
                    applyUpdate = $firebaseUtils.batch(
                        function (snap) {
                            var changed = firebaseObject.$$updated(snap);

                            if (changed) {
                                firebaseObject.$$notify();
                            }
                        }
                    ),
                    error,
                    initComplete,
                    sync = {
                        isDestroyed: false,
                        ready: function () { return def.promise; }
                    };

                // call initComplete(); do not call this directly
                function _initComplete(err) {

                    if (!isResolved) {
                        isResolved = true;

                        if (err) {
                            def.reject(err);
                        } else {
                            def.resolve(firebaseObject);
                        }
                    }
                }

                error = $firebaseUtils.batch(
                    function (err) {
                        _initComplete(err);

                        if (firebaseObject) {
                            firebaseObject.$$error(err);
                        }
                    }
                );

                initComplete = $firebaseUtils.batch(_initComplete);

                sync.destroy = function (err) {

                    if (!sync.isDestroyed) {
                        sync.isDestroyed = true;
                        ref.off('value', applyUpdate);
                        firebaseObject = null;
                        initComplete(err || 'destroyed');
                    }
                };

                sync.init = function () {

                    ref.on('value', applyUpdate, error);

                    ref.once(
                        'value',
                        function (snap) {
                            if (angular.isArray(snap.val())) {
                                $log.warn('Storing data using array indices in Firebase can result in unexpected behavior. See https://firebase.google.com/docs/database/web/structure-data for more information. Also note that you probably wanted $firebaseArray and not $firebaseObject.');
                            }

                            initComplete(null);
                        },
                        initComplete
                    );
                };

                return sync;
            }

            function ThreeWayBinding(rec) {
                this.subs = [];
                this.scope = null;
                this.key = null;
                this.rec = rec;
            }

            ThreeWayBinding.prototype = {
                assertNotBound: function (varName) {
                    var msg;

                    if (this.scope) {
                        msg =   'Cannot bind to ' + varName + ' because this instance is already bound to ' +
                                this.key + '; one binding per instance ' +
                                '(call unbind method or create another FirebaseObject instance)';

                        $log.error(msg);

                        return $q.reject($q.defer('ng_firebase_assertNotBound'), msg);
                    }

                    return undefined;
                },
                bindTo: function (scope, varName) {

                    function _bind(self) {
                        var sending = false,
                            parsed = $parse(varName),
                            rec = self.rec,
                            send,
                            scopeUpdated,
                            recUpdated;

                        self.scope = scope;
                        self.varName = varName;

                        function equals(scopeValue) {
                            return angular.equals(scopeValue, rec) &&
                                scopeValue.$priority === rec.$priority &&
                                scopeValue.$value === rec.$value;
                        }

                        function setScope(rec) {
                            parsed.assign(scope, $firebaseUtils.scopeData(rec));
                        }

                        send = $firebaseUtils.debounce(
                            function (val) {
                                var scopeData = $firebaseUtils.scopeData(val);

                                rec.$$scopeUpdated(scopeData)['finally'](
                                    function () {
                                        sending = false;
                                        if (!scopeData.hasOwnProperty('$value')) {
                                            delete rec.$value;
                                            delete parsed(scope).$value;
                                        }
                                        setScope(rec);
                                    }
                                );
                            },
                            50,
                            500
                        );

                        scopeUpdated = function (newVal) {
                            newVal = newVal[0];
                            if (!equals(newVal)) {
                                sending = true;
                                send(newVal);
                            }
                        };

                        recUpdated = function () {
                            if (!sending && !equals(parsed(scope))) {
                                setScope(rec);
                            }
                        };

                        // $watch will not check any vars prefixed with $, so we
                        // manually check $priority and $value using this method
                        function watchExp() {
                            var obj = parsed(scope);

                            return [obj, obj.$priority, obj.$value];
                        }

                        setScope(rec);
                        self.subs.push(scope.$on('$destroy', self.unbind.bind(self)));

                        // monitor scope for any changes
                        self.subs.push(scope.$watch(watchExp, scopeUpdated, true));

                        // monitor the object for changes
                        self.subs.push(rec.$watch(recUpdated));

                        return self.unbind.bind(self);
                    }

                    return this.assertNotBound(varName) || _bind(this);
                },
                unbind: function () {

                    if (this.scope) {
                        angular.forEach(
                            this.subs,
                            function (unbind) {
                                unbind();
                            }
                        );

                        this.subs = [];
                        this.scope = null;
                        this.key = null;
                    }
                },
                destroy: function () {
                    this.unbind();
                    this.rec = null;
                }
            };

            function FirebaseObject(ref) {

                if (!(this instanceof FirebaseObject)) {
                    return new FirebaseObject(ref);
                }

                var self = this;

                this.$$conf = {
                    // synchronizes data to Firebase
                    sync: new ObjectSyncManager(this, ref),
                    // stores the Firebase ref
                    ref: ref,
                    // synchronizes $scope variables with this object
                    binding: new ThreeWayBinding(this),
                    // stores observers registered with $watch
                    listeners: []
                };

                Object.defineProperty(
                    this,
                    '$$conf',
                    { value: this.$$conf }
                );

                this.$id = ref.ref.key;
                this.$priority = null;

                $firebaseUtils.applyDefaults(this, this.$$defaults);

                // start synchronizing data with Firebase
                this.$$conf.sync.init();
                this.$resolved = false;
                this.$loaded()['finally'](
                    function () {
                        self.$resolved = true;
                    }
                );

                return undefined;
            }

            FirebaseObject.prototype = {
                $save: function () {
                    var self = this,
                        ref = self.$ref(),
                        def = $q.defer('ng_firebase_fbobject_$save'),
                        dataJSON;

                    try {
                        dataJSON = $firebaseUtils.toJSON(self);
                    } catch (e) {
                        def.reject(e);
                    }

                    if (dataJSON !== undefined) {
                        $firebaseUtils.doSet(ref, dataJSON).then(
                            function () {
                                self.$$notify();
                                def.resolve(self.$ref());
                            }
                        )['catch'](def.reject);
                    }

                    return def.promise;
                },
                $remove: function () {
                    var self = this;

                    $firebaseUtils.trimKeys(self, {});
                    self.$value = null;

                    return $firebaseUtils.doRemove(self.$ref()).then(
                        function () {
                            self.$$notify();
                            return self.$ref();
                        }
                    );
                },
                $loaded: function (resolve, reject) {
                    var promise = this.$$conf.sync.ready();

                    if (arguments.length) {
                        promise = promise.then(resolve, reject);
                    }

                    return promise;
                },
                $ref: function () {
                    return this.$$conf.ref;
                },
                $bindTo: function (scope, varName) {
                    var self = this;

                    return self.$loaded().then(
                        function () {
                            return self.$$conf.binding.bindTo(scope, varName);
                        }
                    );
                },
                $watch: function (cb, context) {
                    var list = this.$$conf.listeners;

                    list.push([cb, context]);

                    // an off function for cancelling the listener
                    return function () {
                        var i = _.findIndex(
                                list,
                                function (parts) {
                                    return parts[0] === cb && parts[1] === context;
                                }
                            );

                        if (i > -1) {
                            list.splice(i, 1);
                        }
                    };
                },
                $destroy: function (err) {
                    var self = this;

                    if (!self.$isDestroyed) {
                        self.$isDestroyed = true;
                        self.$$conf.sync.destroy(err);
                        self.$$conf.binding.destroy();
                        $firebaseUtils.each(
                            self,
                            function (v_na, k) {
                                delete self[k];
                            }
                        );
                    }
                },
                $$updated: function (snap) {
                    // applies new data to this object
                    var changed = $firebaseUtils.updateRec(this, snap);

                    // applies any defaults set using $$defaults
                    $firebaseUtils.applyDefaults(this, this.$$defaults);
                    // returning true here causes $$notify to be triggered
                    return changed;
                },
                $$error: function (err) {
                    // prints an error to the console (via Angular's logger)
                    $log.error(err);
                    // frees memory and cancels any remaining listeners
                    this.$destroy(err);
                },
                $$scopeUpdated: function (newData) {
                    // we use a one-directional loop to avoid feedback with 3-way bindings
                    // since set() is applied locally anyway, this is still performant
                    var def = $q.defer('ng_firebase_fbobject_$$scopeUpdated');

                    this.$ref().set(
                        $firebaseUtils.toJSON(newData),
                        $firebaseUtils.makeNodeResolver(def)
                    );

                    return def.promise;
                },
                $$notify: function () {
                    var self = this,
                        list = this.$$conf.listeners.slice();

                    // be sure to do this after setting up data and init state
                    angular.forEach(
                        list,
                        function (parts) {
                            parts[0].call(
                                parts[1],
                                {
                                    event: 'value',
                                    key: self.$id
                                }
                            );
                        }
                    );
                },
                forEach: function (iterator, context) {
                    return $firebaseUtils.each(this, iterator, context);
                }
            };

            FirebaseObject.$extend = function () {
                var methods,
                    args = arguments || [],
                    ChildClass = args[0] || undefined;

                if (arguments.length === 1 && angular.isObject(ChildClass)) {
                    methods = ChildClass;

                    ChildClass = function (ref) {
                        if (!(this instanceof ChildClass)) {
                            return new ChildClass(ref);
                        }

                        FirebaseObject.apply(this, arguments);

                        return undefined;
                    };

                } else {
                    methods = args[1] || undefined;
                }

                return $firebaseUtils.inherit(ChildClass, FirebaseObject, methods);
            };

            return FirebaseObject;
        }]
    );

    angular.module(
        "firebase",
        ["ng", "firebase.utils", "firebase.auth", "firebase.database"]
    );

}());
