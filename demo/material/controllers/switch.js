
/*global
    msos: false,
    angular: false
*/

msos.provide("demo.material.controllers.switch");
msos.require("ng.material.ui.switch");		// ref. template

// Load AngularJS-Material module specific CSS
ng.material.ui.switch.css = new msos.loader();
ng.material.ui.switch.css.load(msos.resource_url('ng', 'material/css/ui/switch.css'));


angular.module(
	'demo.material.controllers.switch',
	['ng']
).controller(
	'demo.material.controllers.switch.ctrl',
	['$scope', function ($scope) {

		$scope.data = {
			cb1: true,
			cb4: true,
			cb5: false
		};

		$scope.message = 'false';

		$scope.onChange = function (cbState) {
			$scope.message = cbState;
		};
	}]
);

