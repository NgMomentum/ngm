
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.googlechart.controllers.generic");
msos.require("ng.google.chart");

demo.googlechart.controllers.generic.version = new msos.set_version(19, 1, 17);


angular.module(
    "demo.googlechart.controllers.generic",
	['ng', 'ng.google.chart']
).controller(
    "demo.googlechart.controllers.generic.ctrl",
    ['$scope', function ($scope) {
        "use strict";

		$scope.myChartObject = {};

		$scope.myChartObject.type = "PieChart";

		$scope.onions = [
			{ v: "Onions" },
			{ v: 3 },
		];

		$scope.myChartObject.data = {
			"cols": [
				{ id: "t", label: "Topping", type: "string" },
				{ id: "s", label: "Slices", type: "number" }
			],
			"rows": [
				{ c: [{ v: "Mushrooms" }, { v: 3 } ] },
				{ c: $scope.onions },
				{ c: [{ v: "Olives" }, { v: 31 }] },
				{ c: [{ v: "Zucchini" }, { v: 1 }] },
				{ c: [{ v: "Pepperoni" }, { v: 2 }] }
			]
		};

		$scope.myChartObject.options = {
			'title': 'How Much Pizza I Ate Last Night'
		};
	}]
);

