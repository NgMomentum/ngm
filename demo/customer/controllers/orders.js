
/*global
    msos: false,
    demo: false
*/

msos.provide("demo.customer.controllers.orders");


demo.customer.start.controller(
    'OrdersController',
    ['$scope', 'customersService', function ($scope, customersService) {
        "use strict";

        var temp_do = 'demo.customer.controllers.orders - OrdersController';

        msos.console.debug(temp_do + ' -> start.');

        $scope.customers = [];
        $scope.customers = customersService.getCustomers();

        msos.console.debug(temp_do + ' ->  done!');
    }]
);