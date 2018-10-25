
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.repeater");
msos.require("ng.material.ui.repeater");
msos.require("ng.material.ui.input");		// ref. template
msos.require("ng.material.ui.content");		// ref. template
msos.require("ng.material.ui.layout");		// ref. template
msos.require("ng.material.ui.select");		// ref. template

demo.material.controllers.repeater.version = new msos.set_version(18, 4, 16);


angular.module(
    'demo.material.controllers.repeater',
    ['ng']
).controller(
    'demo.material.controllers.repeater.ctrl1',
    ['$timeout', function ($timeout) {
        "use strict";

        var DynamicItems = function () {
                this.loadedPages = {};
                this.numItems = 0;
                this.PAGE_SIZE = 50;
                this.fetchNumItems_();
            };

        // Required.
        DynamicItems.prototype.getItemAtIndex = function (index) {
            var pageNumber = Math.floor(index / this.PAGE_SIZE),
                page = this.loadedPages[pageNumber];

            if (page) {
                return page[index % this.PAGE_SIZE];
            }

            if (page !== null) {
                this.fetchPage_(pageNumber);
            }

            return undefined;
        };

        // Required.
        DynamicItems.prototype.getLength = function () {
            return this.numItems;
        };

        DynamicItems.prototype.fetchPage_ = function (pageNumber) {
            // Set the page to null so we know it is already being fetched.
            this.loadedPages[pageNumber] = null;

            $timeout(angular.noop, 300, false).then(angular.bind(this, function () {

                this.loadedPages[pageNumber] = [];

                var pageOffset = pageNumber * this.PAGE_SIZE,
                    i = 0;

                for (i = pageOffset; i < pageOffset + this.PAGE_SIZE; i += 1) {
                    this.loadedPages[pageNumber].push(i);
                }
            }));
        };

        DynamicItems.prototype.fetchNumItems_ = function() {

            $timeout(angular.noop, 300, false).then(angular.bind(this, function () {
                this.numItems = 50000;
            }));
        };

        this.dynamicItems = new DynamicItems();
    }]
).controller(
	'demo.material.controllers.repeater.ctrl2',
	function () {
		"use strict";

		var i = 0;

        this.items = [];

        for (i = 0; i < 1000; i += 1) {
			this.items.push(i);
        }
	}
).controller(
	'demo.material.controllers.repeater.ctrl3',
	['$timeout', function ($timeout) {
		"use strict";

		this.infiniteItems = {
			numLoaded_: 0,
			toLoad_: 0,
			getItemAtIndex: function (index) {
				if (index > this.numLoaded_) {
					this.fetchMoreItems_(index);
					return null;
				}

				return index;
			},
			getLength: function () {
				return this.numLoaded_ + 5;
			},
			fetchMoreItems_: function (index) {
				// For demo purposes, we simulate loading more items with a timed
				// promise. In real code, this function would likely contain an
				// $http request.
				if (this.toLoad_ < index) {
					this.toLoad_ += 20;
					$timeout(angular.noop, 300, false).then(
						angular.bind(
							this,
							function () {
								this.numLoaded_ = this.toLoad_;
							}
						)
					);
				}
			}
		};
	}]
).controller(
	'demo.material.controllers.repeater.ctrl4',
	['$scope', function ($scope) {
		"use strict";

		this.selectedYear = 0;
		this.years = [];
		this.items = [];

		var currentYear = new Date().getFullYear(),
			monthNames = [
				'January', 'February', 'March', 'April', 'May', 'June',
				'July', 'August', 'September', 'October', 'November', 'December'
			],
			y = 0,
			m = 0;

		// Build a list of months over 20 years
		for (y = currentYear; y >= (currentYear-20); y -= 1) {
			this.years.push(y);
			this.items.push({ year: y, text: y, header: true });

			for (m = 11; m >= 0; m -= 1) {
				this.items.push({ year: y, month: m, text: monthNames[m] });
			}
		}

		// Whenever a different year is selected, scroll to that year
		$scope.$watch(
			'ctrl.selectedYear',
			angular.bind(
				this,
				function (yearIndex) {
					var scrollYear = Math.floor(this.topIndex / 13);
					if (scrollYear !== yearIndex) {
						this.topIndex = yearIndex * 13;
					}
				}
			)
		);
		// The selected year should follow the year that is at the top of the scroll container
		$scope.$watch(
			'ctrl.topIndex',
			angular.bind(
				this,
				function (topIndex) {
					var scrollYear = Math.floor(topIndex / 13);
					this.selectedYear = scrollYear;
				}
			)
		);
	}]
);
