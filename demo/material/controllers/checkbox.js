
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.checkbox");
msos.require("ng.material.ui.checkbox");	// ref. template
msos.require("ng.material.ui.layout");		// ref. template

demo.material.controllers.checkbox.version = new msos.set_version(18, 4, 9);


angular.module(
	'demo.material.controllers.checkbox',
	['ng']
).controller(
	'demo.material.controllers.checkbox.ctrl1',
	['$scope', function ($scope) {
		"use strict";

		$scope.data = {};
		$scope.data.cb1 = true;
		$scope.data.cb2 = false;
		$scope.data.cb3 = false;
		$scope.data.cb4 = false;
		$scope.data.cb5 = false;
	}]
).controller(
	'demo.material.controllers.checkbox.ctrl2',
	['$scope', function ($scope) {

		$scope.items = [1,2,3,4,5];
		$scope.selected = [];

		$scope.toggle = function (item, list) {
			var idx = list.indexOf(item);

			if (idx > -1) {
				list.splice(idx, 1);
			} else {
				list.push(item);
			}
		};

		$scope.exists = function (item, list) {
			return list.indexOf(item) > -1;
		};
	}]
).controller(
	'demo.material.controllers.checkbox.ctrl3',
	['$scope', function ($scope) {

        $scope.items = [1, 2, 3, 4, 5];
        $scope.selected = [1];
        $scope.toggle = function (item, list) {
            var idx = list.indexOf(item);
            if (idx > -1) {
                list.splice(idx, 1);
            } else {
                list.push(item);
            }
        };

        $scope.exists = function(item, list) {
            return list.indexOf(item) > -1;
        };

        $scope.isIndeterminate = function() {
            return ($scope.selected.length !== 0 &&
                $scope.selected.length !== $scope.items.length);
        };

        $scope.isChecked = function() {
            return $scope.selected.length === $scope.items.length;
        };

        $scope.toggleAll = function () {
            if ($scope.selected.length === $scope.items.length) {
                $scope.selected = [];
            } else if ($scope.selected.length === 0 || $scope.selected.length > 0) {
                $scope.selected = $scope.items.slice(0);
            }
        };
    }]
);