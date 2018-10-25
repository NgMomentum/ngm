
/*global
    msos: false,
    demo: false
*/

msos.provide("demo.customer.controllers.customers");


demo.customer.start.controller(
    'CustomersController',
    ['$scope', 'customersService', function ($scope, customersService) {
        "use strict";

        var temp_cc = 'demo.customer.start.controller - CustomersController -> ';

        msos.console.debug(temp_cc + 'start.');

        $scope.customers = customersService.getCustomers();

        $scope.insertCustomer = function () {
            var firstName = $scope.newCustomer.firstName,
                lastName = $scope.newCustomer.lastName,
                city = $scope.newCustomer.city;

                customersService.insertCustomer(firstName, lastName, city);

                $scope.newCustomer.firstName = '';
                $scope.newCustomer.lastName = '';
                $scope.newCustomer.city = '';
        };

        $scope.deleteCustomer = function (id) {
            customersService.deleteCustomer(id);
        };

        msos.console.debug(temp_cc + ' done!');
    }]
);