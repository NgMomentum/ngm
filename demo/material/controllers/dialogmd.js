
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.dialogmd");
msos.require("ng.material.core.theming");
msos.require("ng.material.core.autofocus");	// ref. template
msos.require("ng.material.ui.dialog");
msos.require("ng.material.ui.button");		// ref. template
msos.require("ng.material.ui.checkbox");	// ref. template
msos.require("ng.material.ui.layout");		// ref. template
msos.require("ng.material.ui.tabs");		// ref. template
msos.require("ng.material.ui.content");		// ref. template
msos.require("ng.material.ui.toolbar");		// ref. template

demo.material.controllers.dialogmd.version = new msos.set_version(18, 7, 27);


angular.module(
	'demo.material.controllers.dialogmd',
	['ng', 'ng.material.core.theming', 'ng.material.ui.dialog']
).config(
	['$mdThemingProvider', function ($mdThemingProvider) {
		"use strict";

        $mdThemingProvider.theme('red')
            .primaryPalette('red');

        $mdThemingProvider.theme('blue')
            .primaryPalette('blue');

    }]
).controller(
	'demo.material.controllers.dialogmd.ctrl1',
	['$scope', '$mdDialog', function ($scope, $mdDialog) {
		"use strict";

        $scope.status = '  ';
        $scope.customFullscreen = false;

        $scope.showAlert = function (ev) {

            $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('This is an alert title')
                .textContent('You can specify some description text in here.')
                .ariaLabel('Alert Dialog Demo')
                .ok('Got it!')
                .targetEvent(ev)
            );
        };

        $scope.showConfirm = function (ev) {

            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.confirm()
                .title('Would you like to delete your debt?')
                .textContent('All of the banks have agreed to forgive you your debts.')
                .ariaLabel('Lucky day')
                .targetEvent(ev)
                .ok('Please do it!')
                .cancel('Sounds like a scam');

            $mdDialog.show(confirm).then(
				function () {
					$scope.status = 'You decided to get rid of your debt.';
				},
				function () {
					$scope.status = 'You decided to keep your debt.';
				}
			);
        };

        $scope.showPrompt = function (ev) {

            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.prompt()
                .title('What would you name your dog?')
                .textContent('Bowser is a common name.')
                .placeholder('Dog name')
                .ariaLabel('Dog name')
                .initialValue('Buddy')
                .targetEvent(ev)
                .required(true)
                .ok('Okay!')
                .cancel('I\'m a cat person');

            $mdDialog.show(confirm).then(
				function (result) {
					$scope.status = 'You decided to name your dog ' + result + '.';
				},
				function () {
					$scope.status = 'You didn\'t name your dog.';
				}
			);
        };

        $scope.showAdvanced = function (ev) {

            $mdDialog.show({
                    controller: ['$scope', '$mdDialog', DialogController],
                    templateUrl: msos.resource_url('demo', 'material/tmpl/dialog/dialog1.html'),
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                })
                .then(
					function (answer) {
						$scope.status = 'You said the information was "' + answer + '".';
					},
					function () {
						$scope.status = 'You cancelled the dialog.';
					}
				);
        };

        $scope.showTabDialog = function (ev) {

            $mdDialog.show({
                    controller: ['$scope', '$mdDialog', DialogController],
                    templateUrl:  msos.resource_url('demo', 'material/tmpl/dialog/tab.html'),
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                })
                .then(
					function (answer) {
						$scope.status = 'You said the information was "' + answer + '".';
					},
					function () {
						$scope.status = 'You cancelled the dialog.';
					}
				);
        };

        $scope.showPrerenderedDialog = function (ev) {
            $mdDialog.show({
                contentElement: '#myDialog',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        };

        function DialogController($scope, $mdDialog) {

            $scope.hide = function () {
                $mdDialog.hide();
            };

            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.answer = function (answer) {
                $mdDialog.hide(answer);
            };
        }
    }]
).controller(
	'demo.material.controllers.dialogmd.ctrl2',
	['$scope', '$mdDialog', function ($scope, $mdDialog) {
		"use strict";

        $scope.openFromLeft = function () {
            $mdDialog.show(
                $mdDialog.alert()
                .clickOutsideToClose(true)
                .title('Opening from the left')
                .textContent('Closing to the right!')
                .ariaLabel('Left to right demo')
                .ok('Nice!')
                // You can specify either sting with query selector
                .openFrom('#left')
                // or an element
                .closeTo(angular.element(document.querySelector('#right')))
            );
        };

        $scope.openOffscreen = function () {
            $mdDialog.show(
                $mdDialog.alert()
                .clickOutsideToClose(true)
                .title('Opening from offscreen')
                .textContent('Closing to offscreen')
                .ariaLabel('Offscreen Demo')
                .ok('Amazing!')
                // Or you can specify the rect to do the transition from
                .openFrom({
                    top: -50,
                    width: 30,
                    height: 80
                })
                .closeTo({
                    left: 1500
                })
            );
        };
    }]
).controller(
	'demo.material.controllers.dialogmd.ctrl3',
	['$scope', '$mdDialog', '$interval', function ($scope, $mdDialog, $interval) {
        $scope.theme = 'red';

        var isThemeRed = true;

        $interval(
			function() {
				$scope.theme = isThemeRed ? 'blue' : 'red';

				isThemeRed = !isThemeRed;
			},
			2000,
			0,
			$scope
		);

        $scope.showAdvanced = function(ev) {
            $mdDialog.show({
                    controller: ['$scope', '$mdDialog', DialogController],
                    templateUrl: msos.resource_url('demo', 'material/tmpl/dialog/dialog1.html'),
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function() {
                    $scope.status = 'You cancelled the dialog.';
                });
        };

        function DialogController($scope, $mdDialog) {
            $scope.hide = function() {
                $mdDialog.hide();
            };

            $scope.cancel = function() {
                $mdDialog.cancel();
            };

            $scope.answer = function(answer) {
                $mdDialog.hide(answer);
            };
        }
    }]
);
