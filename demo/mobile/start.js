
/*global
    msos: false,
    angular: false,
	demo: false
*/

msos.provide("demo.mobile.start");
msos.require("ng.route");
msos.require("ng.mobile.core");
msos.require("ng.mobile.ui.sidebars");
msos.require("ng.mobile.ui.navbars");
msos.require("ng.mobile.ui.switcher");
msos.require("ng.mobile.ui.scrollable");


msos.onload_func_done.push(
    function () {
        "use strict";

        var temp_sd = 'demo.mobile.start -> ';

        msos.console.debug(temp_sd + 'start.');

        demo.mobile.start = angular.module(
            'demo.mobile.start',
            [
				'ng',
                'ng.route',
                'ng.postloader',
                'ng.mobile.core',
                'ng.mobile.ui.sidebars',
                'ng.mobile.ui.navbars',
                'ng.mobile.ui.switcher',
                'ng.mobile.ui.scrollable'
            ]
        ).config(
            ['$routeProvider', function ($routeProvider) {

                $routeProvider.when('/home', {
                    templateUrl: 'tmpl/home.html',
                    reloadOnSearch: false
                });
                $routeProvider.when('/scroll', {
                    templateUrl: 'tmpl/scroll.html',
                    reloadOnSearch: false
                });
                $routeProvider.when('/toggle', {
                    templateUrl: 'tmpl/toggle.html',
                    reloadOnSearch: false
                });
                $routeProvider.when('/tabs', {
                    templateUrl: 'tmpl/tabs.html',
                    reloadOnSearch: false
                });
                $routeProvider.when('/accordion', {
                    templateUrl: 'tmpl/accordion.html',
                    reloadOnSearch: false
                });
                $routeProvider.when('/overlay', {
                    templateUrl: 'tmpl/overlay.html',
                    reloadOnSearch: false,
                    resolve: {
						load: ['$postload', function ($postload) {

							// Request specific demo module
							msos.require('ng.mobile.ui.modals');

							// Start AngularJS module registration process
							return $postload.run_registration();
						}]
					}
                });
                $routeProvider.when('/forms', {
                    templateUrl: 'tmpl/forms.html',
                    reloadOnSearch: false
                });
                $routeProvider.when('/dropdown', {
                    templateUrl: 'tmpl/dropdown.html',
                    reloadOnSearch: false
                });
                $routeProvider.when('/touch', {
                    templateUrl: 'tmpl/touch.html',
                    reloadOnSearch: false,
                    resolve: {
						load: ['$postload', function ($postload) {

							// Request specific demo module
							msos.require('demo.mobile.controller.touch');

							// Start AngularJS module registration process
							return $postload.run_registration();
						}]
					}
                });
                $routeProvider.when('/swipe', {
                    templateUrl: 'tmpl/swipe.html',
                    reloadOnSearch: false
                });
                $routeProvider.when('/drag', {
                    templateUrl: 'tmpl/drag.html',
                    reloadOnSearch: false,
                    resolve: {
						load: ['$postload', function ($postload) {

							// Request specific demo module
							msos.require('demo.mobile.controller.drag');

							// Start AngularJS module registration process
							return $postload.run_registration();
						}]
					}
                });
                $routeProvider.when('/drag2', {
                    templateUrl: 'tmpl/drag2.html',
                    reloadOnSearch: false,
                    resolve: {
						load: ['$postload', function ($postload) {

							// Request specific demo module
							msos.require('demo.mobile.controller.drag2');

							// Start AngularJS module registration process
							return $postload.run_registration();
						}]
					}
                });
                $routeProvider.when('/carousel', {
                    templateUrl: 'tmpl/carousel.html',
                    reloadOnSearch: false,
                    resolve: {
						load: ['$postload', function ($postload) {

							// Request specific demo module
							msos.require('demo.mobile.controller.carousel');

							// Start AngularJS module registration process
							return $postload.run_registration();
						}]
					}
                }).otherwise({
						redirectTo: '/home'
				});
            }]
        ).controller(
            'MainController',
            ['$rootScope', '$scope', function ($rootScope, $scope) {
                var i = 0,
                    j = 0,
                    scrollItems = [];

                $scope.swiped = function (direction) {
                    alert('Swiped ' + direction);
                };

                // User agent displayed in home page
                $scope.userAgent = navigator.userAgent;

                // Needed for the loading screen
                $rootScope.$on('$routeChangeStart', function () {
                    $rootScope.loading = true;
                });

                $rootScope.$on('$routeChangeSuccess', function () {
                    $rootScope.loading = false;
                });

                // Fake text i used here and there.
                $scope.lorem = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vel explicabo, aliquid eaque soluta nihil eligendi adipisci error, illum corrupti nam fuga omnis quod quaerat mollitia expedita impedit dolores ipsam. Obcaecati.';

                // 
                // 'Scroll' screen
                // 
                for (i = 1; i <= 100; i += 1) {
                    scrollItems.push('Item ' + i);
                }

                $scope.scrollItems = scrollItems;

                $scope.bottomReached = function () {
                    /* global alert: false; */
                    alert('Congrats you scrolled to the end of the list!');
                };

                // 
                // Right Sidebar
                // 
                $scope.chatUsers = [{
                    name: 'Carlos  Flowers',
                    online: true
                }, {
                    name: 'Byron Taylor',
                    online: true
                }, {
                    name: 'Jana  Terry',
                    online: true
                }, {
                    name: 'Darryl  Stone',
                    online: true
                }, {
                    name: 'Fannie  Carlson',
                    online: true
                }, {
                    name: 'Holly Nguyen',
                    online: true
                }, {
                    name: 'Bill  Chavez',
                    online: true
                }, {
                    name: 'Veronica  Maxwell',
                    online: true
                }, {
                    name: 'Jessica Webster',
                    online: true
                }, {
                    name: 'Jackie  Barton',
                    online: true
                }, {
                    name: 'Crystal Drake',
                    online: false
                }, {
                    name: 'Milton  Dean',
                    online: false
                }, {
                    name: 'Joann Johnston',
                    online: false
                }, {
                    name: 'Cora  Vaughn',
                    online: false
                }, {
                    name: 'Nina  Briggs',
                    online: false
                }, {
                    name: 'Casey Turner',
                    online: false
                }, {
                    name: 'Jimmie  Wilson',
                    online: false
                }, {
                    name: 'Nathaniel Steele',
                    online: false
                }, {
                    name: 'Aubrey  Cole',
                    online: false
                }, {
                    name: 'Donnie  Summers',
                    online: false
                }, {
                    name: 'Kate  Myers',
                    online: false
                }, {
                    name: 'Priscilla Hawkins',
                    online: false
                }, {
                    name: 'Joe Barker',
                    online: false
                }, {
                    name: 'Lee Norman',
                    online: false
                }, {
                    name: 'Ebony Rice',
                    online: false
                }];

                //
                // 'Forms' screen
                //  
                $scope.rememberMe = true;
                $scope.email = 'me@example.com';

                $scope.login = function () {
                    alert('You submitted the login form');
                };

                // 
                // 'Drag' screen
                // 
                $scope.notices = [];

                for (j = 0; j < 10; j += 1) {
                    $scope.notices.push({
                        icon: 'envelope',
                        message: 'Notice ' + (j + 1)
                    });
                }

                $scope.deleteNotice = function (notice) {
                    var index = $scope.notices.indexOf(notice);
                    if (index > -1) {
                        $scope.notices.splice(index, 1);
                    }
                };
            }]
        );

        angular.bootstrap('#body', ['demo.mobile.start']);

        msos.console.debug(temp_sd + 'done!');
    }
);
