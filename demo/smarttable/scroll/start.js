
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.smarttable.scroll.start");
msos.require("ng.lr.smarttable");
msos.require("ng.lr.infinitescroll");

demo.smarttable.scroll.start.version = new msos.set_version(18, 1, 17);


angular.module(
	'demo.smarttable.scroll.start',
	['ng', 'ng.lr.smarttable', 'ng.lr.infinitescroll']
).controller(
	'demo.smarttable.scroll.start.ctrl',
	['$scope', '$timeout', function ($scope, $timeout) {
		"use strict";

		var temp_st = 'demo.smarttable.scroll.start.ctrl -> ',
			nameList = ['Pierre', 'Pol', 'Jacques', 'Robert', 'Elisa', 'Johnny', 'Richard', 'Frank'],
			familyName = ['Dupont', 'Germain', 'Delcourt', 'bjip', 'Menez', 'Smith', 'Jones', 'Washington'],
			address = ['gmail', 'yahoo', 'aol'],
			lastStart = 0,
            maxNodes = 400;

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

		function getAPage() {
			var data = [],
				j = 0;

			for (j = 0; j < 20; j += 1) {
				data.push(createRandomItem());
			}

			return data;
		}

		$scope.callServer = function getData(tableState) {
			//here you could create a query string from tableState, fake ajax call
			$scope.isLoading = true;

			$timeout(
				function () {
					//if we reset (like after a search or an order)
					if (tableState.pagination.start === 0) {
						$scope.rowCollection = getAPage();
					} else {
						//we load more
						$scope.rowCollection = $scope.rowCollection.concat(getAPage());
						//remove first nodes if needed
						if (lastStart < tableState.pagination.start && $scope.rowCollection.length > maxNodes) {
							//remove the first nodes
							$scope.rowCollection.splice(0, 20);
						}
					}

					lastStart = tableState.pagination.start;

					$scope.isLoading = false;
				},
				1000
			);

		};

		$scope.rowCollection = getAPage();

		msos.console.debug(temp_st + ' done!');
    }]
);