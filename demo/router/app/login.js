
/**
 * The controller for the `login` component
 *
 * The `login` method validates the credentials.
 * Then it sends the user back to the `returnTo` state, which is provided as a resolve data.
 */

/*global
    msos: false,
    demo: false
*/

msos.provide("demo.router.app.login");
msos.require("demo.router.app.global");


var LoginController = function LoginController(AppConfig, AuthService, $state) {
	var _this = this;

	msos._classCallCheck(this, LoginController);

	this.usernames = AuthService.usernames;

	this.credentials = {
		username: AppConfig.emailAddress,
		password: 'password'
	};

	this.login = function (credentials) {

		_this.authenticating = true;

		var returnToOriginalState = function returnToOriginalState() {
				var state = _this.returnTo.state(),
					params = _this.returnTo.params(),
					options = Object.assign({}, _this.returnTo.options(), { reload: true });

				$state.go(state, params, options);
			},
			showError = function showError(errorMessage) {
				_this.errorMessage = errorMessage;
				return errorMessage;
			};

		AuthService.authenticate(
			credentials.username,
			credentials.password).then(
				returnToOriginalState
			).catch(
				showError
			).finally(
				function () {
					_this.authenticating = false;
					return false;
				}
			);
	};
};

LoginController.$inject = ['AppConfig', 'AuthService', '$state'];


demo.router.app.login = {
  bindings: { returnTo: '<' },
  controller: LoginController,
  template: '\n    <div class="container">\n      <div class="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">\n        <h3>Log In</h3>\n        <p>(This login screen is for demonstration only... just pick a username, enter \'password\' and click <b>"Log in"</b>)</p>\n        <hr>\n    \n        <div>\n          <label for="username">Username:</label>\n          <select class="form-control" name="username" id="username"\n            ng-model="$ctrl.credentials.username" ng-options="username for username in $ctrl.usernames"></select>\n          <i style="position: relative; bottom: 1.8em; margin-left: 10em; height: 0"\n              ng-hide="$ctrl.credentials.username" class="fa fa-arrow-left bounce-horizontal"> Choose </i>\n        </div>\n        <br>\n    \n        <div>\n          <label for="password">Password:</label>\n          <input class="form-control" type="password" name="password" ng-model="$ctrl.credentials.password">\n          <i style="position: relative; bottom: 1.8em; margin-left: 5em; height: 0"\n              ng-hide="!$ctrl.credentials.username || $ctrl.credentials.password == \'password\'" class="fa fa-arrow-left bounce-horizontal">\n            Enter \'<b>password</b>\' here\n          </i>\n        </div>\n    \n        <div ng-show="$ctrl.errorMessage" class="well error">{{ $ctrl.errorMessage }}</div>\n    \n        <hr>\n        <div>\n          <button class="btn btn-primary" type="button"\n              ng-disabled="$ctrl.authenticating" ng-click="$ctrl.login($ctrl.credentials)">\n            <i class="fa fa-spin fa-spinner" ng-show="$ctrl.authenticating"></i> <span>Log in</span>\n          </button>\n          <i ng-show="$ctrl.credentials.username && $ctrl.credentials.password == \'password\'" style="position: relative;" class="fa fa-arrow-left bounce-horizontal"> Click Me!</i>\n      </div>\n    </div>\n    '
};
