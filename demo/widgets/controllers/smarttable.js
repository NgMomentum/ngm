
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.widgets.controllers.smarttable");
msos.require("ng.lr.smarttable");
msos.require("ng.lr.dragndrop");

demo.widgets.controllers.smarttable.version = new msos.set_version(18, 1, 15);


angular.module(
	'demo.widgets.controllers.smarttable',
	['ng', 'ng.lr.smarttable', 'ng.lr.dragndrop']
).controller(
	'demo.widgets.controllers.smarttable.ctrl',
	['$scope', function ($scope) {
		"use strict";

		var temp_st = 'demo.widgets.controllers.smarttable.ctrl -> ',
			nameList = ['Pierre', 'Pol', 'Jacques', 'Robert', 'Elisa', 'Johnny', 'Richard', 'Frank'],
			familyName = ['Dupont', 'Germain', 'Delcourt', 'bjip', 'Menez', 'Smith', 'Jones', 'Washington'],
			address = ['gmail', 'yahoo', 'aol'],
			i = 0;

		msos.console.debug(temp_st + 'start.');

		$scope.isLoading = false;
		$scope.rowCollection = [];

		function randomDate(start, end) {
			return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
		}

		function createRandomItem() {
			var firstName = nameList[Math.floor(Math.random() * 8)],
				lastName = familyName[Math.floor(Math.random() * 8)],
				addr = address[Math.floor(Math.random() * 3)],
				birthDate = randomDate(new Date(2012, 0, 1), new Date()),
				email = firstName + lastName + '@' + addr + '.com',
				balance = Math.random() * 3000;

			return {
				firstName: firstName,
				lastName: lastName,
				birthDate: birthDate,
				balance: balance,
				email: email,
				utils: ''
			};
		}

		$scope.columns = ['firstName', 'lastName', 'birthDate', 'balance', 'email', 'utils'];

		for (i = 0; i < 150; i += 1) {
			$scope.rowCollection.push(createRandomItem());
		}

		$scope.predicates = ['firstName', 'lastName', 'birthDate'];
		$scope.selectedPredicate = $scope.predicates[0];

		//add to the real data holder
		$scope.addRandomItem = function addRandomItem() {
			$scope.rowCollection.push(generateRandomItem(id));
			id += 1;
		};

		//remove to the real data holder
		$scope.removeItem = function removeItem(row) {
			var index = $scope.rowCollection.indexOf(row);

			if (index !== -1) {
				$scope.rowCollection.splice(index, 1);
			}
		};

		$scope.itemsByPage = 15;

		msos.console.debug(temp_st + ' done!');
    }]
);