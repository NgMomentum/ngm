
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.chartjs.controllers.generic");
msos.require("ng.google.chart");


angular.module(
    "demo.chartjs.controllers.generic", []
).controller(
    "demo.chartjs.controllers.generic.ctrl",
    ['$scope', '$state', function ($scope, $state) {
        "use strict";

        $scope.chartObject = {};

        $scope.onions = [
            {v: "Onions"},
            {v: 3}
        ];
    
        $scope.chartObject.data = {"cols": [
            {id: "t", label: "Topping", type: "string"},
            {id: "s", label: "Slices", type: "number"}
        ], "rows": [
            {c: [
                {v: "Mushrooms"},
                {v: 3}
            ]},
            {c: $scope.onions},
            {c: [
                {v: "Olives"},
                {v: 31}
            ]},
            {c: [
                {v: "Zucchini"},
                {v: 1}
            ]},
            {c: [
                {v: "Pepperoni"},
                {v: 2}
            ]}
        ]};


        // $routeParams.chartType == BarChart or PieChart or ColumnChart...
        $scope.chartObject.type = $state.params.chartType;
        $scope.chartObject.options = {
            'title': 'How Much Pizza I Ate Last Night'
        };
    }]
);

