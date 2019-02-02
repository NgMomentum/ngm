
/*global
    msos: false
*/

msos.provide("demo.uirouter.advanced.comp.app");


var AuthedController = (function () {

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
}());

demo.uirouter.advanced.comp.app = {
	controller: ['AppConfig', 'AuthService', '$state', AuthedController],
	templateUrl: msos.resource_url('demo', 'uirouter/advanced/template/authed.html')
};
