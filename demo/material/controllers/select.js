
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.select");
msos.require("ng.material.ui.select");
msos.require("ng.material.ui.card");		// ref. template
msos.require("ng.material.ui.content");		// ref. template
msos.require("ng.material.ui.layout");		// ref. template
msos.require("ng.material.ui.input");		// ref. template
msos.require("ng.material.ui.checkbox");	// ref. template
msos.require("ng.material.ui.button");		// ref. template

demo.material.controllers.select.version = new msos.set_version(18, 6, 23);


angular.module(
    'demo.material.controllers.select',
	['ng']
).controller(
	'demo.material.controllers.select.ctrl1',
	function () {
		"use strict";

        this.userState = '';
        this.states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS ' +
            'MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI ' +
            'WY').split(' ').map(
				function (state) { return { abbrev: state }; }
			);
      }
).controller(
	'demo.material.controllers.select.ctrl2',
	['$scope', function ($scope) {
		"use strict";

		$scope.sizes = [
			"small (12-inch)",
			"medium (14-inch)",
			"large (16-inch)",
			"insane (42-inch)"
		];

		$scope.toppings = [
			{ category: 'meat', name: 'Pepperoni' },
			{ category: 'meat', name: 'Sausage' },
			{ category: 'meat', name: 'Ground Beef' },
			{ category: 'meat', name: 'Bacon' },
			{ category: 'veg', name: 'Mushrooms' },
			{ category: 'veg', name: 'Onion' },
			{ category: 'veg', name: 'Green Pepper' },
			{ category: 'veg', name: 'Green Olives' }
		];

		$scope.selectedToppings = [];
		$scope.printSelectedToppings = function printSelectedToppings() {

			var numberOfToppings = this.selectedToppings.length,
				needsOxfordComma,
				lastToppingConjunction,
				lastTopping;

			// If there is more than one topping, we add an 'and'
			// to be gramatically correct. If there are 3+ toppings
			// we also add an oxford comma.
			if (numberOfToppings > 1) {
				needsOxfordComma = numberOfToppings > 2;
				lastToppingConjunction = (needsOxfordComma ? ',' : '') + ' and ';
				lastTopping = lastToppingConjunction + this.selectedToppings[this.selectedToppings.length - 1];

				return this.selectedToppings.slice(0, -1).join(', ') + lastTopping;
			}

			return this.selectedToppings.join('');
		};

    }]
).controller(
	'demo.material.controllers.select.ctrl3',
	['$timeout', '$scope', function ($timeout, $scope) {
		"use strict";

		$scope.user = null;
		$scope.users = null;

		$scope.loadUsers = function () {

			// Use timeout to simulate a 650ms request.
			return $timeout(
				function () {

					$scope.users =  $scope.users  || [
						{ id: 1, name: 'Scooby Doo' },
						{ id: 2, name: 'Shaggy Rodgers' },
						{ id: 3, name: 'Fred Jones' },
						{ id: 4, name: 'Daphne Blake' },
						{ id: 5, name: 'Velma Dinkley' }
					];
				},
				650,
				false
			);
		};
	}]
).controller(
	'demo.material.controllers.select.ctrl4',
	['$scope', '$element', function ($scope, $element) {
		"use strict";

		$scope.vegetables = ['Corn' ,'Onions' ,'Kale' ,'Arugula' ,'Peas', 'Zucchini'];
		$scope.searchTerm = '';
		$scope.clearSearchTerm = function () {
			$scope.searchTerm = '';
		};

		// The md-select directive eats keydown events for some quick select
		// logic. Since we have a search input here, we don't need that logic.
		$element.find('input').on('keydown', function (ev) { ev.stopPropagation(); });
    }]
).controller(
	'demo.material.controllers.select.ctrl5',
	['$scope', function ($scope) {
		"use strict";

		$scope.items = [1, 2, 3, 4, 5, 6, 7];
		$scope.selectedItem = undefined;

		$scope.getSelectedText = function () {
			if ($scope.selectedItem !== undefined) {
				return "You have selected: Item " + $scope.selectedItem;
			} else {
				return "Please select an item";
			}
		};
	}]
).controller(
	'demo.material.controllers.select.ctrl6',
	['$scope', function ($scope) {
		"use strict";

		$scope.clearValue = function () {
			$scope.quest = undefined;
			$scope.favoriteColor = undefined;
			$scope.myForm.$setPristine();
		};

		$scope.save = function () {
			if ($scope.myForm.$valid) {
				$scope.myForm.$setSubmitted();
				alert('Form was valid.');
			} else {
				alert('Form was invalid!');
			}
		};
	}]
);
