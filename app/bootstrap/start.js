
/*global
	msos: false,
    jQuery: false,
    angular: false,
    app: false
*/

msos.provide('app.bootstrap.start');
msos.require("ng.route");
msos.require("ng.bootstrap.ui.dropdown");
msos.require("msos.tools.smoothscroll");

app.bootstrap.start.css = new msos.loader();

// Load the page specific css
app.bootstrap.start.css.load('app_bootstrap_css_demo', msos.resource_url('app', 'bootstrap/css/demo.css'), 'css');


msos.onload_functions.push(
	function () {
		"use strict";

		var temp_sd = 'app.bootstrap.start',
			avail_ui_demo_ctrls = [
				'accordion', 'alert', 'buttons', 'carousel', 'collapse', 'datepicker', 'dateparser',
				'datepickerpopup', 'dropdown', 'modal', 'pager', 'pagination', 'popover', 'position',
				'progressbar', 'rating', 'tabs', 'timepicker', 'tooltip', 'typeahead'
			],
			org_location = '';

		msos.console.debug(temp_sd + ' -> start.');

        app.bootstrap.start = angular.module(
			'app.bootstrap.start',
			[
				'ngRoute',
				'ngSanitize',
				'ngPostloader',
				'ng.bootstrap.ui',
				'ng.bootstrap.ui.dropdown'
			]
		).run(['$location', '$timeout', function ($location, $timeout) {
				// Special case: MSOS module(s) won't have time to load for initial hashtag.
				if ($location.path() !== '' && $location.path() !== '/') {
					msos.console.info(temp_sd + ' - run -> init content to show: ' + $location.path());
					// Save specific hashtag fragment
					org_location = $location.path().substring(1);
					// Set to use default page content (before routing)
					$location.path('/');
					// Reset $location, which updates page content (just like internal link routing)
					$timeout(
						function () {
							msos.console.debug(temp_sd + ' - run -> do $location replace.');
							$location.path(org_location).replace();
						},
						500
					);
				}
			}]
		);

		app.bootstrap.start.config(
			['$routeProvider', function ($routeProvider) {

				var load_specific_module = function ($q, $rootScope, $postload, specific_name) {

						var defer = $q.defer('app_bootstrap_start_config'),
							module_name = 'app.bootstrap.controllers.' + specific_name;

						// Request specific module
						msos.require(module_name);

						// Resolve deferred module loading
						msos.onload_func_done.push(
							function () {

								// Register any just loaded AngularJS modules
								$postload.run_registration();

								// Let AngularJS do it's thing
								defer.resolve();
								$rootScope.$apply();

								msos.tools.smoothscroll.fn(specific_name, 1000);
							}
						);

						// Run specific MobileSiteOS module code, plus MSOS dependencies, plus register AngularJS dependencies
						msos.run_onload();

						return defer.promise;
					},
					gen_routing_object = function (ui_name) {
						return {
							templateUrl : msos.resource_url('app', 'bootstrap/tmpl/' + ui_name + '.html'),
							controller  : 'app.bootstrap.controllers.' + ui_name + '.ctrl',
							resolve: {
								load: ['$q', '$rootScope', '$postload', function ($q, $rootScope, $postload) {
									return load_specific_module($q, $rootScope, $postload, ui_name);
								}]
							}
						};
					};

				// Generate our applications routings
				$routeProvider.when(
					'/',
					{
						templateUrl : msos.resource_url('app', 'bootstrap/tmpl/welcome.html')
					}
				).when(
					'/welcome',
					{
						templateUrl : msos.resource_url('app', 'bootstrap/tmpl/welcome.html'),
						controller  : 'app.bootstrap.controllers.welcome.ctrl'
					}
				);

				jQuery.each(
					avail_ui_demo_ctrls,
					function (index, route) {
						$routeProvider.when('/' + route, gen_routing_object(route));
					}
				);

				$routeProvider.otherwise(
					{
						redirectTo: '/'
					}
				);
			}]
		);

		app.bootstrap.start.controller(
			'app.bootstrap.controllers.welcome.ctrl',
			function () {
				msos.tools.smoothscroll.fn('welcome', 750);
			}
		);

		msos.console.debug(temp_sd + ' -> done!');
	}
);

msos.onload_func_done.push(
	function () {
		"use strict";

		angular.bootstrap('body', ['app.bootstrap.start']);
	}
);
