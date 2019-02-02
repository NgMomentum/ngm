
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.uirouter.advanced.start");
msos.require("demo.uirouter.advanced.util.session");
msos.require("demo.uirouter.advanced.comp.app");
msos.require("demo.uirouter.advanced.comp.login");

demo.uirouter.advanced.start.version = new msos.set_version(18, 12, 20);

// Load the very large Visualizer file
demo.uirouter.advanced.start.vis = new msos.loader();
demo.uirouter.advanced.start.vis.load(msos.resource_url('ng', 'ui/router/visualizer/v600_msos.uc.js'));
demo.uirouter.advanced.start.vis.load(msos.resource_url('ng', 'ui/router/sticky/v130_msos.uc.js'));
demo.uirouter.advanced.start.vis.load(msos.resource_url('ng', 'ui/router/dsr/v130_msos.uc.js'));


msos.onload_functions.push(
	function () {
		"use strict";

		var temp_sd = 'demo.uirouter.advanced.start';

		msos.console.debug(temp_sd + ' -> start.');

		var AppConfig = (function () {
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
		}());

		var AuthService = (function () {
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
					return $q(
						function (resolve, reject) {
							var validUsername = _this.usernames.indexOf(username) !== -1;
							var validPassword = password === 'password';

							return validUsername && validPassword ? resolve(username) : reject("Invalid username or password");
						},
						'demo_checkCredentials'
					);
				};

				return $timeout(checkCredentials, 800, false).then(function (authenticatedUser) {
					AppConfig.emailAddress = authenticatedUser;
					AppConfig.save();
				});
			};

			AuthService.prototype.logout = function logout() {
				this.AppConfig.emailAddress = undefined;
				this.AppConfig.save();
			};

			return AuthService;
		}());

		var sContacts = (function (_SessionStorage) {

			function Contacts($http, $timeout, $q, AppConfig) {
				msos._classCallCheck(this, Contacts);

				// http://beta.json-generator.com/api/json/get/V1g6UwwGx
				return msos._constructorReturn(this, _SessionStorage.call(this, $http, $timeout, $q, "contacts", "data/contacts.json", AppConfig));
			}

			msos._inherits(Contacts, _SessionStorage);

			return Contacts;
		}(SessionStorage));

		var sFolders = (function (_SessionStorage2) {

			function Folders($http, $timeout, $q, AppConfig) {
				msos._classCallCheck(this, Folders);

				return msos._constructorReturn(this, _SessionStorage2.call(this, $http, $timeout, $q, 'folders', 'data/folders.json', AppConfig));
			}

			msos._inherits(Folders, _SessionStorage2);

			return Folders;
		}(SessionStorage));

		var sMessages = (function (_SessionStorage3) {

			function Messages($http, $timeout, $q, AppConfig) {
				msos._classCallCheck(this, Messages);

				return msos._constructorReturn(this, _SessionStorage3.call(this, $http, $timeout, $q, 'messages', 'data/messages.json', AppConfig));
			}

			msos._inherits(Messages, _SessionStorage3);

			Messages.prototype.byFolder = function byFolder(folder) {
				var _this = this,
					searchObject = { folder: folder._id },
					toFromAttr = ["drafts", "sent"].indexOf(folder._id) !== -1 ? "from" : "to";

				searchObject[toFromAttr] = _this.AppConfig.emailAddress;
				return _this.search(searchObject);
			};

			return Messages;
		}(SessionStorage));

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

					elem.data('promise', $q(
						function (resolve, reject) {
							scope.yes = function () {
								return resolve(true);
							};
							scope.no = function () {
								return reject(false);
							};
						},
						'demo_dialog'
					));
				},
				templateUrl: msos.resource_url('demo', 'uirouter/advanced/template/dialog.html') 
			};
		}

		function DialogService($document, $compile, $rootScope) {
			msos._classCallCheck(this, DialogService);

			var body = $document.find("body");
			var elem = angular.element("<div class='dialog' dialog='opts'></div>");

			this.confirm = function (message) {
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
				return elem.data("promise").finally(function () {
					return elem.removeClass('active').remove();
				});
			};
		}

		function LoadingIndicatorService($document) {
			msos._classCallCheck(this, LoadingIndicatorService);

			var body = $document.find("body");

			this.showLoadingIndicator = function demo_showLoadingIndicator() {
				body.append(angular.element('<div id="spinner"><i class="fa fa-spinner fa-pulse fa-3x fa-fw" aria-hidden="true"></i></div>'));
			};

			this.hideLoadingIndicator = function demo_hideLoadingIndicator() {
				var spinner = document.getElementById("spinner");
				spinner.parentElement.removeChild(spinner);
			};
		}

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

		function sortMessages(AppConfig) {

			return {
				restrict: 'A',
				link: function link(scope, elem, attrs) {
					var col = attrs.sortMessages;
					if (!col) return;
					var chevron = angular.element("<i style='padding-left: 0.25em' class='fa'></i>");
					elem.append(chevron);

					elem.on(
						"click",
						function () {
							AppConfig.sort = AppConfig.sort === '+' + col ? '-' + col : '+' + col;
							return AppConfig.sort;
						}
					);

					scope.$watch(
						function () {
							return AppConfig.sort;
						},
						function (newVal) {
							chevron.toggleClass("fa-sort-asc", newVal == '+' + col);
							chevron.toggleClass("fa-sort-desc", newVal == '-' + col);
						}
					);
				}
			};
		}

		function messageBody($sce) {

			return function () {
				var msgText = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
				return $sce.trustAsHtml(msgText.split(/\n/).map(function (p) {
					return '<p>' + p + '</p>';
				}).join('\n'));
			};
		}

		var MessageListUI = function () {

			function MessageListUI($filter, AppConfig) {
				msos._classCallCheck(this, MessageListUI);

				this.$filter = $filter;
				this.AppConfig = AppConfig;
			}

			MessageListUI.prototype.proximalMessageId = function proximalMessageId(messages, messageId) {
				var sorted = this.$filter("orderBy")(messages, this.AppConfig.sort);
				var idx = sorted.findIndex(function (msg) {
					return msg._id === messageId;
				});
				var proximalIdx = sorted.length > idx + 1 ? idx + 1 : idx - 1;
				return proximalIdx >= 0 ? sorted[proximalIdx]._id : undefined;
			};

			return MessageListUI;
		}();

		angular.module(
			'demo.uirouter.advanced.start',
			[
				'ng',
				'ng.sanitize',
				'ng.postloader',
				'ng.ui.router'
			]
		).directive(
			'dialog',
			['$timeout', '$q', dialog]
		).directive(
			'sortMessages',
			['AppConfig', sortMessages]
		).service(
			'AppConfig',
			AppConfig
		).service(
			'AuthService',
			['AppConfig', '$q', '$timeout', AuthService]
		).service(
			'Contacts',
			['$http', '$timeout', '$q', 'AppConfig', sContacts]
		).service(
			'Folders',
			['$http', '$timeout', '$q', 'AppConfig', sFolders]
		).service(
			'Messages',
			['$http', '$timeout', '$q', 'AppConfig', sMessages]
		).service(
			'DialogService',
			['$document', '$compile', '$rootScope', DialogService]
		).service(
			'LoadingIndicatorService',
			['$document', LoadingIndicatorService]
		).service(
			'MessageListUI',
			['$filter', 'AppConfig', MessageListUI]
		).filter(
			'messageBody',
			['$sce', messageBody]
		).config(
			['$stateProvider', '$uiRouterProvider', '$locationProvider', function ($stateProvider, $uiRouterProvider, $locationProvider) {

				$locationProvider.hashPrefix('');

				var $urlService = $uiRouterProvider.urlService;

				function returnTo($transition$) {
					var $state = $transition$.router.stateService;

					if ($transition$.redirectedFrom() !== null || $transition$.redirectedFrom() !== undefined) {
						return $transition$.redirectedFrom().targetState();
					}

					if ($transition$.from().name !== '') {
						return $state.target($transition$.from(), $transition$.params("from"));
					}

					return $state.target('home');
				}

				$urlService.rules.otherwise({ state: 'welcome' });

				$stateProvider.state({
					name: 'app',
					redirectTo: 'welcome',
					component: 'app'
				}).state({
					parent: 'app',
					name: 'home',
					url: '/home',
					component: 'home'
				}).state({
					parent: 'app',
					name: 'login',
					url: '/login',
					component: 'login',
					resolve: { returnTo: ['$transition$', returnTo] }
				}).state({
					parent: 'app',
					name: 'welcome',
					url: '/welcome',
					component: 'welcome'
				}).state({
					parent: 'app',
					name: 'contacts.**',
					url: '/contacts',
					lazyLoad: function lazyLoad(transition) {
						msos.require("demo.uirouter.advanced.app.contacts");
						return transition.injector().get('$postload').load();
					}
				}).state({
					parent: 'app',
					name: 'prefs.**',
					url: '/prefs',
					lazyLoad: function lazyLoad(transition) {
						msos.require("demo.uirouter.advanced.app.prefs");
						return transition.injector().get('$postload').load();
					}
				}).state({
					parent: 'app',
					name: 'mymessages.**',
					url: '/mymessages',
					lazyLoad: function lazyLoad(transition) {
						msos.require("demo.uirouter.advanced.app.mymessages");
						return transition.injector().get('$postload').load();
					}
				});
			}]
		).component(
			'app',
			demo.uirouter.advanced.comp.app
		).component(
			'welcome',
			{ templateUrl: msos.resource_url('demo', 'uirouter/advanced/template/welcome.html') }
		).component(
			'login',
			demo.uirouter.advanced.comp.login
		).component(
			'home',
			{ templateUrl: msos.resource_url('demo', 'uirouter/advanced/template/home.html') }
		).run(
			['$transitions', authHookRunBlock]
		).run(
			['$transitions', 'LoadingIndicatorService', loadingIndicatorHookRunBlock]
		).run(
			['$uiRouter', function ($uiRouter) {

				var Visualizer = window['@uirouter/visualizer'].Visualizer,
					StickyStates = window['@uirouter/stickyStates'].StickyStates,
					DeepStateRedir = window['@uirouter/deepStateRedirect'].DSRPlugin;

				$uiRouter.plugin(Visualizer);
				$uiRouter.plugin(StickyStates);
				$uiRouter.plugin(DeepStateRedir);
			}]
		);

		angular.bootstrap('#body', ['demo.uirouter.advanced.start']);

		msos.console.debug(temp_sd + 'done!');
	}
);