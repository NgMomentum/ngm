
demo.ng.start.controller(
	'SimpleController2',
	['$scope',function ($scope) {

		$scope.customers = [
			{ name: 'Dave Jones',	city: 'Phoenix' },
			{ name: 'Jamie Riley',	city: 'Atlanta' },
			{ name: 'Heedy Wahlin',	city: 'Chandler' },
			{ name: 'Thomas Winter',	city: 'Seattle' }
		];

		$scope.addCustomer = function () {
			$scope.customers.push(
				{ name: $scope.inputData.name, city: $scope.inputData.city }
			);
		}
	}]
);