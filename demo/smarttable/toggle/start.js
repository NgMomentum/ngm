
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.smarttable.toggle.start");
msos.require("ng.lr.smarttable");
msos.require("ng.lr.toggle");

demo.smarttable.toggle.start.version = new msos.set_version(18, 1, 17);


angular.module(
	'demo.smarttable.toggle.start',
	['ng', 'ng.lr.smarttable', 'ng.lr.toggle']
).controller(
	'demo.smarttable.toggle.start.ctrl',
	['$scope', function ($scope) {
		"use strict";

		var temp_st = 'demo.smarttable.toggle.start.ctrl -> ',
			nameList = ['Pierre', 'Pol', 'Jacques', 'Robert', 'Elisa', 'Johnny', 'Richard', 'Frank'],
			familyName = ['Dupont', 'Germain', 'Delcourt', 'bjip', 'Menez', 'Smith', 'Jones', 'Washington'],
			address = ['gmail', 'yahoo', 'aol'],
			j = 0;

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

		$scope.displayed = [];

		for (j = 0; j < 150; j += 1) {
			$scope.displayed.push(createRandomItem());
		}

		msos.console.debug(temp_st + ' done!');
    }]
);