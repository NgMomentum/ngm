
/*global
    msos: false,
    demo: false
*/

msos.provide('demo.router.app.util.session');


var SessionStorage = function () {
    "use strict";

    function SessionStorage($http, $timeout, $q, sessionStorageKey, sourceUrl, AppConfig) {
        var _this = this;

        msos._classCallCheck(this, SessionStorage);

        var data = void 0,
            fromSession = sessionStorage.getItem(sessionStorageKey);
        // A promise for *all* of the data.
        this._data = undefined;

        // For each data object, the _idProp defines which property has that object's unique identifier
        this._idProp = "_id";

        // A basic triple-equals equality checker for two values
        this._eqFn = function (l, r) {
            return l[_this._idProp] === r[_this._idProp];
        };

        // Services required to implement the fake REST API
        this.$q = $q;
        this.$timeout = $timeout;
        this.sessionStorageKey = sessionStorageKey;
        this.AppConfig = AppConfig; // Used to get the REST latency simulator,

        if (fromSession) {
            try {
                // Try to parse the existing data from the Session Storage API
                data = JSON.parse(fromSession);
            } catch (e) {
                console.log("Unable to parse session messages, retrieving intial data.");
            }
        }

        var stripHashKey = function stripHashKey(obj) {
            return (0, demo.router.app.setProp)(obj, '$$hashKey', undefined);
        };

        // Create a promise for the data; Either the existing data from session storage, or the initial data via $http request
        this._data = (data ? $q.resolve($q.defer('app_util_sessionstorage_resolve_data'), data) : $http.get(sourceUrl).then(function (resp) {
            return resp.data;
        })).then(this._commit.bind(this)).then(function () {
            return JSON.parse(sessionStorage.getItem(sessionStorageKey));
        }).then(function (array) {
            return array.map(stripHashKey);
        });
    }

    SessionStorage.prototype._commit = function _commit(data) {
        sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(data));
        return this.$q.resolve(this.$q.defer('app_util_sessionstorage_resolve_commit'), data);
    };

    SessionStorage.prototype.all = function all(thenFn) {
        var _this2 = this;

        return this.$timeout(
				function () {
					return _this2._data;
				},
				this.AppConfig.restDelay).then(thenFn || true);
    };

    SessionStorage.prototype.search = function search(exampleItem) {
        var contains = function contains(search, inString) {
            return ("" + inString).indexOf("" + search) !== -1;
        };
        var matchesExample = function matchesExample(example, item) {
            return Object.keys(example).reduce(function (memo, key) {
                return memo && contains(example[key], item[key]);
            }, true);
        };
        return this.all(function (items) {
            return items.filter(matchesExample.bind(null, exampleItem));
        });
    };

    SessionStorage.prototype.get = function get(id) {
        var _this3 = this;

        return this.all(function (items) {
            return items.find(function (item) {
                return item[_this3._idProp] === id;
            });
        });
    };

    SessionStorage.prototype.save = function save(item) {
        return item[this._idProp] ? this.put(item) : this.post(item);
    };

    SessionStorage.prototype.post = function post(item) {
        item[this._idProp] = (0, demo.router.app.guid)();
        return this.all(function (items) {
            return (0, demo.router.app.pushToArr)(items, item);
        }).then(this._commit.bind(this));
    };

    SessionStorage.prototype.put = function put(item) {
        var _this4 = this;

        var eqFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._eqFn;

        return this.all(function (items) {
            var idx = items.findIndex(eqFn.bind(null, item));
            if (idx === -1) throw Error(item + " not found in " + _this4);
            items[idx] = item;
            return _this4._commit(items).then(function () {
                return item;
            });
        });
    };

    SessionStorage.prototype.remove = function remove(item) {
        var _this5 = this;

        var eqFn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._eqFn;

        return this.all(function (items) {
            var idx = items.findIndex(eqFn.bind(null, item));
            if (idx === -1) throw Error(item + " not found in " + _this5);
            items.splice(idx, 1);
            return _this5._commit(items).then(function () {
                return item;
            });
        });
    };

    return SessionStorage;
}();

SessionStorage.$inject = ['$http', '$timeout', '$q', 'sessionStorageKey', 'sourceUrl', 'AppConfig'];

