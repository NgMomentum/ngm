
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.customer.controllers.customerorders");


demo.customer.start.controller(
    'CustomerOrdersController',
    ['$scope', '$routeParams', 'customersService', function ($scope, $routeParams, customersService) {
        "use strict";

        var temp_co = 'demo.customer.start.controller - CustomerOrdersController -> ',
            customerID;

        msos.console.debug(temp_co + 'start.');

        $scope.customer = {};
        $scope.ordersTotal = 0.00;

        // Grab customerID off of the route        
        customerID = ($routeParams.customerID) ? parseInt($routeParams.customerID, 10) : 0;

        if (customerID > 0) {
            $scope.customer = customersService.getCustomer(customerID);
        }

        msos.console.debug(temp_co + ' done!');
    }]
);
