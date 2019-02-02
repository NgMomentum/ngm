
/*global
    msos: false,
    angular: false
*/

msos.provide("demo.uirouter.advanced.app.prefs");

demo.uirouter.advanced.app.prefs.version = new msos.set_version(18, 12, 8);


var PrefsController = function () {
	"use strict";

    function PrefsController(AppConfig) {
        msos._classCallCheck(this, PrefsController);

        this.AppConfig = AppConfig;
    }

    PrefsController.prototype.$onInit = function $onInit() {
        this.prefs = {
            restDelay: this.AppConfig.restDelay
        };
    };

    PrefsController.prototype.reset = function reset() {
        sessionStorage.clear();
        document.location.reload(true);
    };

    PrefsController.prototype.savePrefs = function savePrefs() {
        angular.extend(this.AppConfig, {
            restDelay: this.prefs.restDelay
        }).save();
        document.location.reload(true);
    };

    return PrefsController;
}();

angular.module(
	'demo.uirouter.advanced.app.prefs',
	[
		'ng',
		'ng.ui.router'
	]
).config(
	['$stateProvider', function ($stateProvider) {
		"use strict";

		$stateProvider.state({
			parent: 'app',
			name: 'prefs',
			url: '/prefs',
			component: 'prefs',
			data: { requiresAuth: true }
		});
	}]
).component(
	'prefs',
	{
		controller: ['AppConfig', PrefsController],
		templateUrl: msos.resource_url('demo', 'uirouter/advanced/template/prefs.html') 
	}
);
