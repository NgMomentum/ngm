
/**
 * The controller for the `app` component.
 */

/*global
    msos: false,
    demo: false
*/

msos.provide("demo.router.app.authed");
msos.require("demo.router.app.global");


var AuthedController = function () {

	function AuthedController(AppConfig, AuthService, $state) {
		msos._classCallCheck(this, AuthedController);

		this.AuthService = AuthService;
		this.$state = $state;

		this.emailAddress = AppConfig.emailAddress;
		this.isAuthenticated = AuthService.isAuthenticated();
	}

	msos._createClass(
		AuthedController,
		[
			{
				key: 'logout',
				value: function logout() {
					var AuthService = this.AuthService,
						$state = this.$state;

					AuthService.logout();

					// Reload states after authentication change
					return $state.go('welcome', {}, { reload: true });
				}
			},
			{
				key: 'isActive',
				value: function isActive(glob) {
					return this.$state.includes(glob);
				}
			}
		]
	);

	return AuthedController;
}();


AuthedController.$inject = ['AppConfig', 'AuthService', '$state', '$transitions', 'LoadingIndicatorService'];

demo.router.app.authed = {
	controller: AuthedController,
	template: '\n    <div class="navheader">\n      <ul ng-if="::$ctrl.isAuthenticated" class="nav nav-tabs">\n    \n        <li ui-sref-active="active"> <a ui-sref="mymessages" role="button"> Messages </a> </li>\n        <li ui-sref-active="active"> <a ui-sref="contacts" role="button"> Contacts </a> </li>\n        <li ui-sref-active="active"> <a ui-sref="prefs" role="button"> Preferences </a> </li>\n    \n        <li class="navbar-right">\n          <button class="btn btn-primary fa fa-home" ui-sref="home"></button>\n          <button style="margin-right: 15px;" class="btn btn-primary" ui-sref="mymessages.compose"><i class="fa fa-envelope"></i> New Message</button>\n        </li>\n    \n        <li class="navbar-text navbar-right logged-in-user" style="margin: 0.5em 1.5em;">\n          <div>\n            {{::$ctrl.emailAddress}} <i class="fa fa-chevron-down"></i>\n            <div class="hoverdrop">\n              <button class="btn btn-primary" ng-click="$ctrl.logout()">Log Out</button>\n            </div>\n          </div>\n        </li>\n    \n      </ul>\n    </div>\n    \n    <div ui-view></div>\n    <div ui-view="mymessages" ng-show="$ctrl.isActive(\'mymessages.**\')"></div>\n    <div ui-view="contacts" ng-show="$ctrl.isActive(\'contacts.**\')"></div>\n'
};
