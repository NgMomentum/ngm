
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.repeater");
msos.require("ng.material.v111.ui.repeater");
msos.require("ng.material.v111.ui.content");
msos.require("ng.material.v111.ui.layout");

demo.material.controllers.repeater.version = new msos.set_version(17, 1, 5);


angular.module(
    'demo.material.controllers.repeater',
    ['ng']
).controller(
    'demo.material.controllers.repeater.ctrl',
    ['$timeout', function($timeout) {
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

            $timeout(angular.noop, 300).then(angular.bind(this, function () {

                this.loadedPages[pageNumber] = [];

                var pageOffset = pageNumber * this.PAGE_SIZE,
                    i = 0;

                for (i = pageOffset; i < pageOffset + this.PAGE_SIZE; i += 1) {
                    this.loadedPages[pageNumber].push(i);
                }
            }));
        };

        DynamicItems.prototype.fetchNumItems_ = function() {

            $timeout(angular.noop, 300).then(angular.bind(this, function () {
                this.numItems = 50000;
            }));
        };

        this.dynamicItems = new DynamicItems();
    }]
);


