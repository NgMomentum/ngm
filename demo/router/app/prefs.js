
/*global
    msos: false,
    angular: false
*/


var PrefsController = function() {
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

PrefsController.$inject = ['AppConfig'];

var prefs = {
    controller: PrefsController,

    template: '\n    <div>\n      <button class="btn btn-primary" ng-click="$ctrl.reset()"><i class="fa fa-recycle"></i> <span>Reset All Data</span></button>\n    </div>\n    \n    <div>\n      <label for="restDelay">Simulated REST API delay (ms)</label>\n      <input type="text" name="restDelay" ng-model="$ctrl.prefs.restDelay">\n      <button class="btn btn-primary" ng-click="$ctrl.savePrefs()">Save</button>\n    </div>\n'
};

var prefsState = {
    parent: 'app',
    name: 'prefs',
    url: '/prefs',
    component: 'demo.router.app.prefs',
    data: {
        requiresAuth: true
    }
};


angular.module(
	'demo.router.app',
	['ng', 'ng.ui.router']
).component(
	'demo.router.app.prefs',
	prefs
).config(
	['$stateRegistryProvider', function($stateRegistry) {
		$stateRegistry.register(prefsState);
	}]
);
