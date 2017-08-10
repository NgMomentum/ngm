
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false,
	demo: false,
	firebase: false
*/

msos.provide("demo.firebase.waiting");
msos.require("ng.route");
msos.require("firebase.auth");
msos.require("firebase.database");


msos.onload_func_done.push(
    function () {
        "use strict";

        msos.console.debug('demo.firebase.waiting -> initializing firebase app.');

        firebase.initializeApp(
            {
                apiKey: "AIzaSyDQODZCA5Ul1tU6XqdkkrW1oic30JfsRZE",
                authDomain: "ngmomentum.firebaseapp.com",
                databaseURL: "https://ngmomentum.firebaseio.com",
                storageBucket: "ngmomentum.appspot.com",
                messagingSenderId: "119009400783"
            }
        );
    }
);

msos.onload_func_done.push(
    function () {
        "use strict";

        var temp_fbw = 'demo.firebase.waiting -> ';

        msos.console.debug(temp_fbw + 'start.');

        demo.firebase.waiting = angular.module(
            'demo.firebase.waiting',
            [
                'ng',
                'ngRoute',
                'firebase',
                'app.auth',
                'app.core',
                'app.layout',
                'app.waitList'
            ]
        ).config(
            ['$routeProvider', function ($routeProvider) {
                $routeProvider.when(
                    '/',
                    {
                        templateUrl: 'app/landing/landing.html'
                    }
                ).when(
                    '/register',
                    {
                        templateUrl: 'app/auth/register.html',
                        controller: 'AuthController',
                        controllerAs: 'vm'
                    }
                ).when(
                    '/login',
                    {
                        templateUrl: 'app/auth/login.html',
                        controller: 'AuthController',
                        controllerAs: 'vm'
                    }
                ).when(
                    '/waitlist',
                    {
                        templateUrl: 'app/waitList/waitList.html',
                        controller: 'WaitListController',
                        controllerAs: 'vm',
                        resolve: {
                            user: ['authService', function resolveUser(authService) {
                                return authService.firebaseAuthObject.$requireSignIn();
                            }]
                        }
                    }
                ).otherwise(
                    {
                        redirectTo: '/'
                    }
                );
            }]
        ).run(
            ['$rootScope', '$location', 'authService', 'PROTECTED_PATHS',
             function ($rootScope, $location, authService, PROTECTED_PATHS) {

                $rootScope.$on(
                    '$routeChangeError',
                    function (event, next, previous, error) {
                        if (error === "AUTH_REQUIRED") {
                            $location.path('/');
                        }
                    }
                );

                function pathIsProtected(path) {
                    return PROTECTED_PATHS.indexOf(path) !== -1;
                }

                authService.firebaseAuthObject.$onAuthStateChanged(
                    function (authData) {
                        if (!authData && pathIsProtected($location.path())) {
                            authService.logout();
                            $location.path('/login');
                        }
                    }
                );
            }]
        );


        angular.module(
            'app.auth',
            ['ng']
        ).controller(
            'AuthController',
            ['$location', 'authService', function ($location, authService) {
                var vm = this;

                vm.error = null;
                vm.register = register;
                vm.login = login;

                function register(user) {
                    return authService.register(user).then(
                            function () {
                                return vm.login(user);
                            }
                        ).then(
                            function () {
                                return authService.sendWelcomeEmail(user.email);
                            }
                        ).catch(
                            function (error) {
                                vm.error = error;
                            }
                        );
                }

                function login(user) {
                    return authService.login(user).then(
                            function () {
                                $location.path('/waitlist');
                            }
                        ).catch(
                            function (error) {
                                vm.error = error;
                            }
                        );
                }
            }]
        ).factory(
            'authService',
            ['$firebaseAuth', 'firebaseDataService', 'partyService',
             function ($firebaseAuth, firebaseDataService, partyService) {

                var firebaseAuthObject = $firebaseAuth(),
                    service = {};

                function register(user) {
                    return firebaseAuthObject.$createUserWithEmailAndPassword(user.email, user.password);
                }

                function login(user) {
                    return firebaseAuthObject.$signInWithEmailAndPassword(user.email, user.password);
                }

                function logout() {
                    partyService.reset();
                    firebaseAuthObject.$signOut();
                }

                function isLoggedIn() {
                    return firebaseAuthObject.$getAuth();
                }

                function sendWelcomeEmail(emailAddress) {
                    firebaseDataService.emails.push({
                        emailAddress: emailAddress
                    });
                }

                service = {
                    firebaseAuthObject: firebaseAuthObject,
                    register: register,
                    login: login,
                    logout: logout,
                    isLoggedIn: isLoggedIn,
                    sendWelcomeEmail: sendWelcomeEmail
                };

                return service;
            }]
        );

        function AuthFormController() {
            var vm = this;

            vm.user = {
                email: '',
                password: ''
            };
        }

        function gzAuthForm() {
            return {
                templateUrl: 'app/auth/authForm.html',
                restrict: 'E',
                controller: AuthFormController,
                controllerAs: 'vm',
                bindToController: true,
                scope: {
                    error: '=',
                    formTitle: '@',
                    submitAction: '&'
                }
            };
        }

        angular.module(
            'app.auth'
        ).directive(
            'gzAuthForm',
            gzAuthForm
        );


        function WaitListController(partyService, user) {
            var vm = this;

            vm.parties  = partyService.getPartiesByUser(user.uid);
        }

        WaitListController.$inject = ['partyService', 'user'];

        function PartyFormController(partyService) {
            var vm = this;

            vm.newParty = new partyService.Party();
            vm.addParty = addParty;

            function addParty() {
                vm.parties.$add(vm.newParty);
                vm.newParty = new partyService.Party();
            }
        }

        PartyFormController.$inject = ['partyService'];

        function PartyTableController(textMessageService) {
            var vm = this;

            function removeParty(party) {
                vm.parties.$remove(party);
            }

            function sendTextMessage(party) {
                textMessageService.sendTextMessage(party, vm.parties);
            }

            function toggleDone(party) {
                vm.parties.$save(party);
            }

            vm.removeParty = removeParty;
            vm.sendTextMessage = sendTextMessage;
            vm.toggleDone = toggleDone;
        }

        PartyTableController.$inject = ['textMessageService'];

        angular.module(
            'app.waitList',
            ['ng']
        ).controller(
            'WaitListController',
            WaitListController
        ).directive(
            'gzPartyForm',
            function () {
                return {
                    templateUrl: 'app/waitList/directives/partyForm.html',
                    restrict: 'E',
                    controller: PartyFormController,
                    controllerAs: 'vm',
                    bindToController: true,
                    scope: {
                        parties: '='
                    }
                };
            }
        ).directive(
            'gzPartyTable',
            function () {
                return {
                    templateUrl: 'app/waitList/directives/partyTable.html',
                    restrict: 'E',
                    controller: PartyTableController,
                    controllerAs: 'vm',
                    bindToController: true,
                    scope: {
                        parties: '='
                    }
                };
            }
        );


        angular.module(
            'app.core',
            ['ng']
        ).constant(
            'PROTECTED_PATHS',
            ['/waitlist']
        ).factory(
            'firebaseDataService',
            function () {
                var root = firebase.database().ref(),
                    service;

                service = {
                    root: root,
                    users: root.child('users'),
                    emails: root.child('emails'),
                    textMessages: root.child('textMessages')
                };

                return service;
            }
        ).factory(
            'partyService',
            ['$firebaseArray', 'firebaseDataService',
             function ($firebaseArray, firebaseDataService) {
                var parties = null,
                    service;

                function Party() {
                    this.name = '';
                    this.phone = '';
                    this.size = '';
                    this.done = false;
                    this.notified = false;
                }

                function getPartiesByUser(uid) {
                    if (!parties) {
                        parties = $firebaseArray(firebaseDataService.users.child(uid).child('parties'));
                    }

                    return parties;
                }

                function reset() {
                    if (parties) {
                        parties.$destroy();
                        parties = null;
                    }
                }

                service = {
                    Party: Party,
                    getPartiesByUser: getPartiesByUser,
                    reset: reset
                };

                return service;
            }]
        ).factory(
            'textMessageService',
            ['firebaseDataService', function (firebaseDataService) {

                function sendTextMessage(party, parties) {
                    var newTextMessage = {
                        phoneNumber: party.phone,
                        size: party.size,
                        name: party.name
                    };

                    firebaseDataService.textMessages.push(newTextMessage);
                    party.notified = true;
                    parties.$save(party);
                }

                var service = {
                    sendTextMessage: sendTextMessage
                };

                return service;
            }]
        );

        function NavbarController($location, authService) {
            var vm = this;

            function logout() {
                authService.logout();
                $location.path('/');
            }

            vm.isLoggedIn = authService.isLoggedIn;
            vm.logout = logout;
        }

        NavbarController.$inject = ['$location', 'authService'];

        angular.module(
            'app.layout',
            ['ng']
        ).directive(
            'gzNavbar',
            function () {
                return {
                    templateUrl: 'app/layout/navbar.html',
                    restrict: 'E',
                    scope: {},
                    controller: NavbarController,
                    controllerAs: 'vm'
                };
            }
        );

        angular.bootstrap('#body', ['demo.firebase.waiting']);

        msos.console.debug(temp_fbw + 'done!');
    }
);
