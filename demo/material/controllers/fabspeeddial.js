
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.fabspeeddial");
msos.require("ng.material.ui.fabactions");
msos.require("ng.material.ui.dialog");
msos.require("ng.material.ui.icon");		// ref template
msos.require("ng.material.ui.content");		// ref template
msos.require("ng.material.ui.toolbar");		// ref template
msos.require("ng.material.ui.button");		// ref template
msos.require("ng.material.ui.layout");		// ref template
msos.require("ng.material.ui.radio");		// ref template
msos.require("ng.material.ui.checkbox");	// ref template
msos.require("ng.material.ui.tooltip");		// ref template

demo.material.controllers.fabspeeddial.version = new msos.set_version(18, 7, 11);


angular.module(
	'demo.material.controllers.fabspeeddial',
	['ng', 'ng.material.ui.dialog']
).controller(
	'demo.material.controllers.fabspeeddial.ctrl1',
	function () {
		"use strict";

		this.topDirections = ['left', 'up'];
		this.bottomDirections = ['down', 'right'];

		this.isOpen = false;

		this.availableModes = ['md-fling', 'md-scale'];
		this.selectedMode = 'md-fling';

		this.availableDirections = ['up', 'down', 'left', 'right'];
		this.selectedDirection = 'up';
    }
).controller(
	'demo.material.controllers.fabspeeddial.ctrl2',
	['$scope', '$mdDialog', '$timeout', function ($scope, $mdDialog, $timeout) {
		"use strict";

        var self = this;

        self.hidden = false;
        self.isOpen = false;
        self.hover = false;

        $scope.$watch(
			'demo.isOpen',
			function (isOpen) {
                if (isOpen) {
                    $timeout(
						function () {
							$scope.tooltipVisible = self.isOpen;
						},
						600,
						false
					);
                } else {
                    $scope.tooltipVisible = self.isOpen;
                }
            }
		);

        self.items = [
			{
				name: "Twitter",
				icon: "ngm/demo/material/img/icons/twitter.svg",
				direction: "bottom"
			},
			{
				name: "Facebook",
				icon: "ngm/demo/material/img/icons/facebook.svg",
				direction: "top"
			},
			{
				name: "Google Hangout",
				icon: "ngm/demo/material/img/icons/hangout.svg",
				direction: "bottom"
			}
		];

        self.openDialog = function ($event, item) {
            $mdDialog.show(
				{
					clickOutsideToClose: true,
                    controller: function($mdDialog) {
                        // Save the clicked item
                        this.item = item;

                        // Setup some handlers
                        this.close = function() {
                            $mdDialog.cancel();
                        };
                        this.submit = function() {
                            $mdDialog.hide();
                        };
                    },
                    controllerAs: 'dialog',
                    templateUrl: 'dialog_script.html',
                    targetEvent: $event
                }
			);
        };
    }]
);
