
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide('demo.customer.services');
msos.require('ng.bootstrap.ui.modal');


msos.onload_functions.push(
	function () {
		"use strict";

		var temp_cs = 'demo.customer.services';

		msos.console.debug(temp_cs + ' -> start.');

        // This handles retrieving data and is used by controllers. 3 options (server, factory, provider) with 
        // each doing the same thing just structuring the functions/data differently.
        demo.customer.start.service(
			'customersService',
			function () {

				var customers = [
					{
						id: 1, firstName: 'Lee', lastName: 'Carroll', address: '1234 Anywhere St.', city: 'Phoenix',
						orders: [
							{ product: 'Basket', price: 29.99, quantity: 1, orderTotal: 29.99 },
							{ product: 'Yarn', price: 9.99, quantity: 1, orderTotal: 39.96 },
							{ product: 'Needes', price: 5.99, quantity: 1, orderTotal: 5.99 }
						]
					},
					{
						id: 2, firstName: 'Jesse', lastName: 'Hawkins', address: '89 W. Center St.', city: 'Atlanta',
						orders: [
							{ product: 'Table', price: 329.99, quantity: 1, orderTotal: 329.99 },
							{ product: 'Chair', price: 129.99, quantity: 4, orderTotal: 519.96 },
							{ product: 'Lamp', price: 89.99, quantity: 5, orderTotal: 449.95 }
						]
					},
					{
						id: 3, firstName: 'Charles', lastName: 'Sutton', address: '455 7th Ave.', city: 'Quebec',
						orders: [
							{ product: 'Call of Duty', price: 59.99, quantity: 1, orderTotal: 59.99 },
							{ product: 'Controller', price: 49.99, quantity: 1, orderTotal: 49.99 },
							{ product: 'Gears of War', price: 49.99, quantity: 1, orderTotal: 49.99 },
							{ product: 'Lego City', price: 49.99, quantity: 1, orderTotal: 49.99 }
						]
					},
					{
						id: 4, firstName: 'Albert', lastName: 'Einstein', address: '8966 N. Crescent Dr.', city: 'New York City',
						orders: [
							{ product: 'Baseball', price: 9.99, quantity: 5, orderTotal: 49.95 },
							{ product: 'Bat', price: 19.99, quantity: 1, orderTotal: 19.99 }
						]
					},
					{
						id: 5, firstName: 'Sonya', lastName: 'Williams', address: '55 S. Hollywood Blvd', city: 'Los Angeles'
					},
					{
						id: 6, firstName: 'Victor', lastName: 'Bryan', address: '563 N. Rainier St.', city: 'Seattle',
						orders: [
							{ product: 'Speakers', price: 499.99, quantity: 1, orderTotal: 499.99 },
							{ product: 'iPod', price: 399.99, quantity: 1, orderTotal: 399.99 }
						]
					},
					{
						id: 7, firstName: 'Lynette', lastName: 'Gonzalez', address: '25624 Main St.', city: 'Albuquerque',
						orders: [
							{ product: 'Statue', price: 429.99, quantity: 1, orderTotal: 429.99 },
							{ product: 'Picture', price: 1029.99, quantity: 1, orderTotal: 1029.99 }
						]
					},
					{
						id: 8, firstName: 'Erick', lastName: 'Pittman', address: '33 S. Lake Blvd', city: 'Chicago',
						orders: [
							{ product: 'Book: AngularJS Development', price: 39.99, quantity: 1, orderTotal: 39.99 },
							{ product: 'Book: Basket Weaving Made Simple', price: 19.99, quantity: 1, orderTotal: 19.99 }
						]
					},
					{
						id: 9, firstName: 'Alice', lastName: 'Price', address: '3354 Town', city: 'Cleveland',
						orders: [
							{ product: 'Webcam', price: 85.99, quantity: 1, orderTotal: 85.99 },
							{ product: 'HDMI Cable', price: 39.99, quantity: 2, orderTotal: 79.98 }
						]
					},
					{
						id: 10, firstName: 'Gerard', lastName: 'Tucker', address: '6795 N. 53 W. Bills Dr.', city: 'Buffalo',
						orders: [
							{ product: 'Fan', price: 49.99, quantity: 4, orderTotal: 199.96 },
							{ product: 'Remote Control', price: 109.99, quantity: 1, orderTotal: 109.99 }
						]
					},
					{
						id: 11, firstName: 'Shanika', lastName: 'Passmore', address: '459 S. International Dr.', city: 'Orlando'
					}
				];

				this.getCustomers = function () {
					return customers;
				};

				this.insertCustomer = function (firstName, lastName, city) {
					var topID = customers.length + 1;

					customers.push({
						id: topID,
						firstName: firstName,
						lastName: lastName,
						city: city
					});
				};

				this.deleteCustomer = function (id) {
					var i = 0;

					for (i = customers.length - 1; i >= 0; i -= 1) {
						if (customers[i].id === id) {
							customers.splice(i, 1);
							break;
						}
					}
				};

				this.getCustomer = function (id) {
					var i = 0;

					for (i = 0; i < customers.length; i += 1) {
						if (customers[i].id === id) {
							return customers[i];
						}
					}

					return null;
				};
			}
		);

		demo.customer.start.service(
			'modalService',
			['$modal', function ($modal) {
				var modalDefaults = {
						backdrop: true,
						keyboard: true,
						modalFade: true,
						templateUrl: msos.resource_url('apps','customer2/partials/modal.html')
					},
					modalOptions = {
						closeButtonText: 'Close',
						actionButtonText: 'OK',
						headerText: 'Proceed?',
						bodyText: 'Perform this action?'
					};

				this.showModal = function (customModalDefaults, customModalOptions) {
					if (!customModalDefaults) { customModalDefaults = {}; }

					customModalDefaults.backdrop = 'static';

					return this.show(customModalDefaults, customModalOptions);
				};

				this.show = function (customModalDefaults, customModalOptions) {
					//Create temp objects to work with since we're in a singleton service
					var tempModalDefaults = {},
						tempModalOptions = {};

					//Map angular-ui modal custom defaults to modal defaults defined in this service
					angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

					//Map modal.html $scope custom properties to defaults defined in this service
					angular.extend(tempModalOptions, modalOptions, customModalOptions);

					if (!tempModalDefaults.controller) {
						tempModalDefaults.controller = ['$scope', '$modalInstance', function ($scope, $modalInstance) {

							$scope.modalOptions = tempModalOptions;

							$scope.modalOptions.ok = function (result) {
								msos.console.debug(temp_cs + ' - modalService -> ok:', result);
								$modalInstance.close('ok');
							};

							$scope.modalOptions.close = function (result) {
								msos.console.debug(temp_cs + ' - modalService -> close:', result);
								$modalInstance.close('cancel');
							};
						}];
					}

					return $modal.open(tempModalDefaults).result;
				};
			}]
		);

		msos.console.debug(temp_cs + ' ->  done!');
	}
);