
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.autocomplete");
msos.require("ng.material.v111.ui.autocomplete");
msos.require("ng.material.v111.ui.layout");
msos.require("ng.material.v111.ui.content");
msos.require("ng.material.v111.ui.checkbox");
msos.require("ng.material.v111.ui.repeater");

demo.material.controllers.autocomplete.version = new msos.set_version(17, 1, 3);


function DemoCtrl($timeout, $q, $log) {
    "use strict";

    var self = this;

    self.simulateQuery = false;
    self.isDisabled = false;

    function newState(state) {
        alert("Sorry! You'll need to create a Constitution for " + state + " first!");
    }

    function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);

        return function filterFn(state) {
            return (state.value.indexOf(lowercaseQuery) === 0);
        };
    }

    function querySearch(query) {
        var results = query ? self.states.filter(createFilterFor(query)) : self.states,
            deferred;

        if (self.simulateQuery) {
            deferred = $q.defer('demo_autocomplete_def');
            $timeout(function() {
                deferred.resolve(results);
            }, Math.random() * 1000, false);
            return deferred.promise;
        }

        return results;
    }

    function searchTextChange(text) {
        $log.info('Text changed to ' + text);
    }

    function selectedItemChange(item) {
        $log.info('Item changed to ' + JSON.stringify(item));
    }

    function loadAll() {
        var allStates =
            'Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Delaware,\
            Florida, Georgia, Hawaii, Idaho, Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana,\
            Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana,\
            Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina,\
            North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina,\
            South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia,\
            Wisconsin, Wyoming';

        return allStates.split(/, +/g).map(function(state) {
            return {
                value: state.toLowerCase(),
                display: state
            };
        });
    }

    // list of `state` value/display objects
    self.states = loadAll();
    self.querySearch = querySearch;
    self.selectedItemChange = selectedItemChange;
    self.searchTextChange = searchTextChange;

    self.newState = newState;
}

angular.module(
    'demo.material.controllers.autocomplete',
    [
        'ng',
        'ng.material.v111.ui.autocomplete',
        'ng.material.v111.ui.layout'
    ]
).controller(
    'demo.material.controllers.autocomplete.ctrl',
    ['$timeout', '$q', '$log', DemoCtrl]
);

