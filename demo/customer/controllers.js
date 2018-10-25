/*#######################################################################
  
  Dan Wahlin
  http://twitter.com/DanWahlin
  http://weblogs.asp.net/dwahlin
  http://pluralsight.com/training/Authors/Details/dan-wahlin

  Normally like the break AngularJS controllers into separate files.
  Kept them together here since they're small and it's easier to look through them.
  example. 

  #######################################################################*/

/*global
    msos: false,
    demo: false
*/

msos.provide('demo.customer.controllers');
msos.require('demo.customer.controllers.orders');
msos.require("demo.customer.controllers.customers");
msos.require("demo.customer.controllers.customerorders");


msos.onload_functions.push(
	function () {
		"use strict";

		var temp_cc = 'demo.customer.controllers -> ';

		msos.console.debug(temp_cc + 'start.');

        demo.customer.start.controller(
			'NavbarController',
			['$scope', '$location', function ($scope, $location) {

				$scope.getClass = function (path) {
					if ($location.path().substr(0, path.length) == path) {
						return true;
					}

					return false;
				};
			}]
		);

        demo.customer.start.controller(
			'OrderChildController',
			['$scope', function ($scope) {

				function init() {
					//Calculate grand total
					//Handled at this level so we don't duplicate it across parent controllers
					if ($scope.customer && $scope.customer.orders) {
						var total = 0.00,
							i = 0,
							order;

						for (i = 0; i < $scope.customer.orders.length; i += 1) {
							order = $scope.customer.orders[i];
							total += order.orderTotal;
						}

						$scope.ordersTotal = total;
					}
				}

				$scope.orderby = 'product';
				$scope.reverse = false;
				$scope.ordersTotal = 0.00;

				init();

				$scope.setOrder = function (orderby) {
					if (orderby === $scope.orderby) {
						$scope.reverse = !$scope.reverse;
					}
					$scope.orderby = orderby;
				};
			}]
		);

		msos.console.debug(temp_cc + ' done!');
	}
);