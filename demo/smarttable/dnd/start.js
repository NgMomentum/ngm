
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.smarttable.dnd.start");
msos.require("ng.lr.smarttable");
msos.require("ng.lr.dragndrop");

demo.smarttable.dnd.start.version = new msos.set_version(18, 1, 17);


angular.module(
	'demo.smarttable.dnd.start',
	['ng', 'ng.lr.smarttable', 'ng.lr.dragndrop']
).controller(
	'demo.smarttable.dnd.start.ctrl',
	['$scope', function ($scope) {
		"use strict";

		var temp_st = 'demo.smarttable.dnd.start.ctrl -> ',
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
				email: email
			};
		}

		$scope.columns = ['firstName', 'lastName', 'birthDate', 'balance', 'email'];

		for (i = 0; i < 150; i += 1) {
			$scope.rowCollection.push(createRandomItem());
		}

		msos.console.debug(temp_st + ' done!');
    }]
);