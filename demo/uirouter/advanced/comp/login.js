
/*global
    msos: false,
    demo: false
*/

msos.provide("demo.uirouter.advanced.comp.login");


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

demo.uirouter.advanced.comp.login = {
	bindings: { returnTo: '<' },
	controller: ['AppConfig', 'AuthService', '$state', LoginController],
	templateUrl: msos.resource_url('demo', 'uirouter/advanced/template/login.html')
};
