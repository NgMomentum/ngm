
/*global
    msos: false,
    angular: false
*/

msos.provide("demo.router.app.global");
msos.require("demo.router.app.util.session");

msos.onload_functions.push(
	function demo_router_app_globals() {

		var AppConfig = function() {
			function AppConfig() {
				msos._classCallCheck(this, AppConfig);

				this.sort = '+date';
				this.emailAddress = undefined;
				this.restDelay = 100;
				this.load();
			}

			AppConfig.prototype.load = function load() {
				try {
					return angular.extend(this, angular.fromJson(sessionStorage.getItem("appConfig")));
				} catch (Error) {}
		
				return this;
			};

			AppConfig.prototype.save = function save() {
				sessionStorage.setItem("appConfig", angular.toJson(angular.extend({}, this)));
			};

			return AppConfig;
		}();

		var AuthService = function() {
			function AuthService(AppConfig, $q, $timeout) {
				msos._classCallCheck(this, AuthService);

				this.AppConfig = AppConfig;
				this.$q = $q;
				this.$timeout = $timeout;
				this.usernames = ['myself@angular.dev', 'devgal@angular.dev', 'devguy@angular.dev'];
			}

			AuthService.prototype.isAuthenticated = function isAuthenticated() {
				return !!this.AppConfig.emailAddress;
			};

			AuthService.prototype.authenticate = function authenticate(username, password) {
				var _this = this;

				var $timeout = this.$timeout,
					$q = this.$q,
					AppConfig = this.AppConfig;

				var checkCredentials = function checkCredentials() {
					return $q(function(resolve, reject) {
						var validUsername = _this.usernames.indexOf(username) !== -1;
						var validPassword = password === 'password';

						return validUsername && validPassword ? resolve(username) : reject("Invalid username or password");
					});
				};

				return $timeout(checkCredentials, 800, false).then(function(authenticatedUser) {
					AppConfig.emailAddress = authenticatedUser;
					AppConfig.save();
				});
			};

			AuthService.prototype.logout = function logout() {
				this.AppConfig.emailAddress = undefined;
				this.AppConfig.save();
			};

			return AuthService;
		}();

		AuthService.$inject = ['AppConfig', '$q', '$timeout'];

		var Contacts = function(_SessionStorage) {
			msos._inherits(Contacts, _SessionStorage);

			function Contacts($http, $timeout, $q, AppConfig) {
				msos._classCallCheck(this, Contacts);

				// http://beta.json-generator.com/api/json/get/V1g6UwwGx
				return msos._constructCallCheck(this, _SessionStorage.call(this, $http, $timeout, $q, "contacts", "data/contacts.json", AppConfig));
			}

			return Contacts;
		}(SessionStorage);

		Contacts.$inject = ['$http', '$timeout', '$q', 'AppConfig'];


		var Folders = function(_SessionStorage2) {
			msos._inherits(Folders, _SessionStorage2);

			function Folders($http, $timeout, $q, AppConfig) {
				msos._classCallCheck(this, Folders);

				return msos._constructCallCheck(this, _SessionStorage2.call(this, $http, $timeout, $q, 'folders', 'data/folders.json', AppConfig));
			}

			return Folders;
		}(SessionStorage);

		Folders.$inject = ['$http', '$timeout', '$q', 'AppConfig'];


		var Messages = function(_SessionStorage3) {
			msos._inherits(Messages, _SessionStorage3);

			function Messages($http, $timeout, $q, AppConfig) {
				msos._classCallCheck(this, Messages);

				return msos._constructCallCheck(this, _SessionStorage3.call(this, $http, $timeout, $q, 'messages', 'data/messages.json', AppConfig));
			}

			Messages.prototype.byFolder = function byFolder(folder) {
				var searchObject = {
					folder: folder._id
				};
				var toFromAttr = ["drafts", "sent"].indexOf(folder._id) !== -1 ? "from" : "to";
				searchObject[toFromAttr] = this.AppConfig.emailAddress;
				return this.search(searchObject);
			};

			return Messages;
		}(SessionStorage);


		Messages.$inject = ['$http', '$timeout', '$q', 'AppConfig'];

		function dialog($timeout, $q) {
			return {
				link: function link(scope, elem) {
					$timeout(
						function () {
							return elem.addClass('active');
						},
						0,
						false
					);

					elem.data('promise', $q(function(resolve, reject) {
						scope.yes = function() {
							return resolve(true);
						};
						scope.no = function() {
							return reject(false);
						};
					}));
				},
				template: '\n      <div class="backdrop"></div>\n      <div class=\'wrapper\'>\n        <div class="content">\n          <h4 ng-show="message">{{message}}</h4>\n          <div ng-show="details">{{details}}</div>\n    \n          <div style="padding-top: 1em;">\n            <button class="btn btn-primary" ng-click="yes()">{{yesMsg}}</button>\n            <button class="btn btn-primary" ng-click="no()">{{noMsg}}</button>\n          </div>\n        </div>\n      </div>\n'
			};
		}

		dialog.$inject = ['$timeout', '$q'];

		function DialogService($document, $compile, $rootScope) {
			msos._classCallCheck(this, DialogService);

			var body = $document.find("body");
			var elem = angular.element("<div class='dialog' dialog='opts'></div>");

			this.confirm = function(message) {
				var details = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "Are you sure?";
				var yesMsg = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "Yes";
				var noMsg = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "No";

				$compile(elem)(angular.extend($rootScope.$new(), {
					message: message,
					details: details,
					yesMsg: yesMsg,
					noMsg: noMsg
				}));
				body.append(elem);
				return elem.data("promise").finally(function() {
					return elem.removeClass('active').remove();
				});
			};
		}

		DialogService.$inject = ['$document', '$compile', '$rootScope'];

		function LoadingIndicatorService($document) {
			msos._classCallCheck(this, LoadingIndicatorService);

			var body = $document.find("body");

			this.showLoadingIndicator = function() {
				body.append(angular.element('<div id="spinner"><i class="fa fa-spinner fa-pulse fa-3x fa-fw" aria-hidden="true"></i></div>'));
			};

			this.hideLoadingIndicator = function() {
				var spinner = document.getElementById("spinner");
				spinner.parentElement.removeChild(spinner);
			};
		}

		LoadingIndicatorService.$inject = ['$document', '$compile', '$rootScope'];

		function authHookRunBlock($transitions) {

			var requiresAuthCriteria = {
				to: function to(state) {
					return state.data && state.data.requiresAuth;
				}
			};

			var redirectToLogin = function redirectToLogin(transition) {
				var AuthService = transition.injector().get('AuthService');
				var $state = transition.router.stateService;
				if (!AuthService.isAuthenticated()) {
					return $state.target('login', undefined, {
						location: false
					});
				}
			};

			$transitions.onBefore(requiresAuthCriteria, redirectToLogin, {
				priority: 10
			});
		}

		authHookRunBlock.$inject = ['$transitions', 'AuthService'];

		function loadingIndicatorHookRunBlock($transitions, LoadingIndicatorService) {
			$transitions.onStart(
				{ /* match anything */ },
				LoadingIndicatorService.showLoadingIndicator
			);
			$transitions.onFinish(
				{ /* match anything */ },
				LoadingIndicatorService.hideLoadingIndicator
			);
		}

		loadingIndicatorHookRunBlock.$inject = ['$transitions', 'LoadingIndicatorService'];


		angular.module(
			'demo.router.app.global',
			['ng', 'ng.ui.router']
		).directive(
			'dialog',
			dialog
		).service(
			'AppConfig',
			AppConfig
		).service(
			'AuthService',
			AuthService
		).service(
			'Contacts',
			Contacts
		).service(
			'Folders',Folders
		).service(
			'Messages',
			Messages
		).service(
			'DialogService',
			DialogService
		).service(
			'LoadingIndicatorService',
			LoadingIndicatorService
		).run(
			authHookRunBlock
		).run(
			loadingIndicatorHookRunBlock
		);
	}
);

