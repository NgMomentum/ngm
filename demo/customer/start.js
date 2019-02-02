
/*#######################################################################
  
  Dan Wahlin
  http://twitter.com/DanWahlin
  http://weblogs.asp.net/dwahlin
  http://pluralsight.com/training/Authors/Details/dan-wahlin

  #######################################################################*/

/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide('demo.customer.start');
msos.require('ng.route');
msos.require('demo.customer.controllers');
msos.require('demo.customer.directives');
msos.require('demo.customer.services');


demo.customer.start = angular.module(
	'demo.customer.start',
	[
		'ng.route',
		'ng.sanitize',
		'ng.postloader',
		'ng.util.anchorscroll'
	]
).config(
	['$routeProvider', function ($routeProvider) {
		"use strict";

		$routeProvider
			.when(
				'/customers',
				{
					controller: 'CustomersController',
					templateUrl: msos.resource_url('demo', 'customer/tmpls/customers.html'),
					resolve: {
						load: ['$postload', function ($postload) {

							// Request specific demo module
							msos.require('demo.customer.controllers.customers');

							// Start AngularJS module registration process
							return $postload.load();
						}]
					}
				}
			).when(
				'/customerorders/:customerID',
				{
					controller: 'CustomerOrdersController',
					templateUrl: msos.resource_url('demo', 'customer/tmpls/customerOrders.html'),
					resolve: {
						load: ['$postload', function ($postload) {

							// Request specific demo module
							msos.require('demo.customer.controllers.customerorders');

							// Start AngularJS module registration process
							return $postload.load();
						}]
					}
				}
			).when(
				'/orders',
				{
					controller: 'OrdersController',
					templateUrl: msos.resource_url('demo', 'customer/tmpls/orders.html'),
					resolve: {
						load: ['$postload', function ($postload) {

							// Request specific demo module
							msos.require('demo.customer.controllers.orders');

							// Start AngularJS module registration process
							return $postload.load();
						}]
					}
				}
			).when(
				'/about',
				{
					templateUrl: msos.resource_url('demo', 'customer/tmpls/about.html')
				}
			).otherwise(
				{
					redirectTo: '/customers'
				}
			);
	}]
);

msos.onload_func_done.push(
	function () {
		"use strict";

		var temp_sd = 'demo.customer.start -> ';

		msos.console.debug(temp_sd + 'start.');

		angular.bootstrap('#body', ['demo.customer.start']);

		msos.console.debug(temp_sd + 'done!');
	}
);