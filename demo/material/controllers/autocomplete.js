
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.autocomplete");
msos.require("ng.material.core.autofocus");		// ref template
msos.require("ng.material.ui.autocomplete");	// ref template
msos.require("ng.material.ui.layout");			// ref template
msos.require("ng.material.ui.content");			// ref template
msos.require("ng.material.ui.checkbox");		// ref template
msos.require("ng.material.ui.repeater");		// ref template
msos.require("ng.material.ui.dialog");			// ref template
msos.require("ng.material.ui.toolbar");			// ref template
msos.require("ng.material.ui.button");			// ref template


demo.material.controllers.autocomplete.version = new msos.set_version(18, 4, 14);


function DemoCtrl1($timeout, $q, $log) {
    "use strict";

    var self = this;

    self.simulateQuery = false;
    self.isDisabled = false;

    function newState(state) {
        alert("Sorry! You'll need to create a Constitution for " + state + " first!");
    }

    function createFilterFor(query) {
        var lowercaseQuery = angular.$$lowercase(query);

        return function filterFn(state) {
            return (state.value.indexOf(lowercaseQuery) === 0);
        };
    }

    function querySearch(query) {
        var results = query ? self.states.filter(createFilterFor(query)) : self.states,
            deferred;

        if (self.simulateQuery) {
            deferred = $q.defer('demo_autocomplete_basic_def');

            $timeout(
				function () {
					deferred.resolve(results);
				},
				Math.random() * 1000,
				false
			);

            return deferred.promise;
        }

        return results;
    }

    function searchTextChange(text) {
        $log.info('demo.material.controllers.autocomplete -> Text changed to ' + text);
    }

    function selectedItemChange(item) {
        $log.info('demo.material.controllers.autocomplete -> Item changed to ' + JSON.stringify(item));
    }

    function loadAll() {
        var allStates =
            [
				'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
				'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
				'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana',
				'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina',
				'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
				'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
				'Wisconsin', 'Wyoming'
			];

        return allStates.map(
					function(state) {
						return {
							value: state.toLowerCase(),
							display: state
						};
					}
				);
    }

    // list of `state` value/display objects
    self.states = loadAll();
    self.querySearch = querySearch;
    self.selectedItemChange = selectedItemChange;
    self.searchTextChange = searchTextChange;

    self.newState = newState;
}


function DemoCtrl2($timeout, $q, $log) {
	var self = this;

	self.simulateQuery = false;
	self.isDisabled = false;

	self.repos = loadAll();
	self.querySearch = querySearch;
	self.selectedItemChange = selectedItemChange;
	self.searchTextChange = searchTextChange;

	function querySearch(query) {
		var results = query ? self.repos.filter(createFilterFor(query)) : self.repos,
			deferred;
		if (self.simulateQuery) {
			deferred = $q.defer('demo_autocomplete_template_def');
			$timeout(function() {
				deferred.resolve(results);
			}, Math.random() * 1000, false);
			return deferred.promise;
		} else {
			return results;
		}
	}

	function searchTextChange(text) {
		$log.info('Text changed to ' + text);
	}

	function selectedItemChange(item) {
		$log.info('Item changed to ' + JSON.stringify(item));
	}

	function loadAll() {
		var repos = [{
				'name': 'AngularJS',
				'url': 'https://github.com/angular/angular.js',
				'watchers': '3,623',
				'forks': '16,175',
			},
			{
				'name': 'Angular',
				'url': 'https://github.com/angular/angular',
				'watchers': '469',
				'forks': '760',
			},
			{
				'name': 'AngularJS Material',
				'url': 'https://github.com/angular/material',
				'watchers': '727',
				'forks': '1,241',
			},
			{
				'name': 'Angular Material',
				'url': 'https://github.com/angular/material2',
				'watchers': '727',
				'forks': '1,241',
			},
			{
				'name': 'Bower Material',
				'url': 'https://github.com/angular/bower-material',
				'watchers': '42',
				'forks': '84',
			},
			{
				'name': 'Material Start',
				'url': 'https://github.com/angular/material-start',
				'watchers': '81',
				'forks': '303',
			}
		];
		return repos.map(function(repo) {
			repo.value = repo.name.toLowerCase();
			return repo;
		});
	}

	function createFilterFor(query) {
		var lowercaseQuery = query.toLowerCase();

		return function filterFn(item) {
			return (item.value.indexOf(lowercaseQuery) === 0);
		};

	}
}


function DialogCtrl($timeout, $scope, $mdDialog) {
	var self = this;

	self.states = loadAll();
	self.querySearch = querySearch;


	self.cancel = function () {
		$mdDialog.cancel();
	};
	self.finish = function () {
		$mdDialog.hide();
	};

	function querySearch(query) {
		return query ? self.states.filter(createFilterFor(query)) : self.states;
	}

	function loadAll() {
		var allStates = 'Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Delaware, ' +
			'Florida, Georgia, Hawaii, Idaho, Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana, ' +
			'Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana, ' +
			'Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina, ' +
			'North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina, ' +
			'South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia, ' +
			'Wisconsin, Wyoming';

		return allStates.split(/, +/g).map(function(state) {
			return {
				value: state.toLowerCase(),
				display: state
			};
		});
	}

	function createFilterFor(query) {
		var lowercaseQuery = query.toLowerCase();

		return function filterFn(state) {
			return (state.value.indexOf(lowercaseQuery) === 0);
		};

	}
}

function DemoCtrl3($mdDialog) {
	var self = this;

	self.openDialog = function($event) {
		$mdDialog.show({
			controller: ['$timeout', '$scope', '$mdDialog', DialogCtrl],
			controllerAs: 'ctrl',
			templateUrl: msos.resource_url('demo', 'material/tmpl/autocomplete/modal_tmpl.html'),
			parent: angular.element(document.body),
			targetEvent: $event,
			clickOutsideToClose: true
		});
	};
}


angular.module(
    'demo.material.controllers.autocomplete',
    ['ng', 'ng.material.ui.repeater']
).controller(
    'demo.material.controllers.autocomplete.ctrl1',
    ['$timeout', '$q', '$log', DemoCtrl1]
).controller(
    'demo.material.controllers.autocomplete.ctrl2',
    ['$timeout', '$q', '$log', DemoCtrl2]
).controller(
    'demo.material.controllers.autocomplete.ctrl3',
    ['$mdDialog', DemoCtrl3]
);

