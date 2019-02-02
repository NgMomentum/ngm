
/*global
    msos: false,
    jQuery: false,
    angular: false,
    demo: false
*/

msos.provide("demo.start");
msos.require("ng.bootstrap.ui.dropdown");

demo.start.css = new msos.loader();
demo.start.css.load(msos.resource_url('demo', 'start.css'));

if (msos.config.run_analytics) {
	msos.require("ng.google.ga");
}


(function () {
	"use strict";

	var temp_sd = 'demo.start',
		bootstrap_ctrls = [
			{ page: 'bootstrap', desc: 'Overview'},
			{ page: 'accordion', desc: 'Accordion'},
			{ page: 'alert', desc: 'Alert'},
			{ page: 'buttons', desc: 'Buttons'},
			{ page: 'carousel', desc: 'Carousel'},
			{ page: 'collapse', desc: 'Collapse'},
			{ page: 'dateparser', desc: 'Dateparser'},
			{ page: 'datepicker', desc: 'Datepicker'},
			{ page: 'datepickerpopup', desc: 'Date Popup'},
			{ page: 'dropdown', desc: 'Dropdown'},
			{ page: 'modal', desc: 'Modal'},
			{ page: 'pager', desc: 'Pager'},
			{ page: 'pagination', desc: 'Pagination'},
			{ page: 'popover', desc: 'Popover'},
			{ page: 'position', desc: 'Position'},
			{ page: 'progressbar', desc: 'Progressbar'},
			{ page: 'rating', desc: 'Rating'},
			{ page: 'tabs', desc: 'Tabs'},
			{ page: 'timepicker', desc: 'Timepicker'},
			{ page: 'tooltip', desc: 'Tooltip'},
			{ page: 'typeahead', desc: 'Typeahead'}
		],
		material_ctrls = [
			{ page: 'material', desc: 'Overview'},
			{ page: 'autocomplete', desc: 'Autocomplete'},
			{ page: 'bottomsheet', desc: 'Bottom Sheet'},
			{ page: 'button', desc: 'Button'},
			{ page: 'card', desc: 'Card'},
			{ page: 'checkbox', desc: 'Checkbox'},
			{ page: 'chips', desc: 'Chips'},
			{ page: 'colors', desc: 'Colors'},
			{ page: 'content', desc: 'Content'},
			{ page: 'datepickermd', desc: 'Datepicker'},
			{ page: 'dialogmd', desc: 'Dialog'},
			{ page: 'divider', desc: 'Divider'},
			{ page: 'fabspeeddial', desc: 'FAB Speeddial'},
			{ page: 'fabtoolbar', desc: 'FAB Toolbar'},
			{ page: 'gridlist', desc: 'Grid List'},
			{ page: 'icon', desc: 'Icon'},
			{ page: 'input', desc: 'Input'},
			{ page: 'list', desc: 'List'},
			{ page: 'menu', desc: 'Menu'},
			{ page: 'menubar', desc: 'Menu Bar'},
			{ page: 'navbar', desc: 'Nav Bar'},
			{ page: 'panel', desc: 'Panel'},
			{ page: 'progresscir', desc: 'Progress, Circular'},
			{ page: 'progresslin', desc: 'Progress, Linear'},
			{ page: 'radio', desc: 'Radio Button'},
			{ page: 'select', desc: 'Select'},
			{ page: 'sidenav', desc: 'Sidenav'},
			{ page: 'slider', desc: 'Slider'},
			{ page: 'subheader', desc: 'Subheader'},
			{ page: 'swipe', desc: 'Swipe'},
			{ page: 'switch', desc: 'Switch'},
			{ page: 'tabsmd', desc: 'Tabs'},
			{ page: 'toast', desc: 'Toast'},
			{ page: 'toolbarmd', desc: 'Toolbar'},
			{ page: 'tooltipmd', desc: 'Tooltip'},
			{ page: 'truncate', desc: 'Truncate'},
			{ page: 'repeater', desc: 'Virtual Repeat'},
			{ page: 'whiteframe', desc: 'Whiteframe'}
		],
		widget_ctrls = [
			{ page: 'widgets', desc: 'Overview'},
			{ page: 'dynamicI18n', desc: 'Dynamic i18n'},
			{ page: 'translate', desc: 'AngularJS Translate'},
			{ page: 'localization', desc: 'Localization i18n'},
			{ page: 'smarttable', desc: 'SmartTable'},
			{ page: 'ngreacthello', desc: 'NgReact Hello'},
			{ page: 'ngreact', desc: 'NgReact Demo'},
			{ page: 'tictactoe', desc: 'NgReact TicTacToe'},
			{ page: 'reacttodo', desc: 'React To-Do'},
			{ page: 'localstorage', desc: 'Localstorage'},
			{ page: 'masonry', desc: 'Masonry'},
			{ page: 'editor', desc: 'Editor Demo'},
			{ page: 'editor2', desc: 'Editor 2nd Demo'},
			{ page: 'editor3', desc: 'Editor 3rd Demo'},
			{ page: 'visualizer', desc: 'UI-Router Visualizer'},
			{ page: 'uiroutercss', desc: 'UI-Router CSS'},
			{ page: 'uiroutersticky', desc: 'UI-Router Sticky'},
			{ page: 'uirouteradv', desc: 'UI-Router Full Demo'}
		],
		googlechart_ctrls = [
			{ page: 'googlechart', desc: 'Overview'},
			{ page: 'annotation', desc: 'Annotated Chart'},
			{ page: 'multi', desc: 'Multi Chart'},
			{ page: 'gauge', desc: 'Gauge Chart'},
			{ page: 'generic', desc: 'Generic Chart'}
		],
		prefetch_dependent = ['tictactoe', 'ngreact', 'ngreacthello', 'reacttodo'];

	msos.console.debug(temp_sd + ' -> start.');

	// We allow certain states to "demand" forward processing of typically "prefetched" scripts.
	// Example: the above prefetch_dependent states require React.js and ReactDom.js be ready.
	// Note: These states only apply to the first website invocation of them, as the initial state.
	if (msos.prefetch_scripts.length) {
		if (!msos.site.are_prefetched_ready(prefetch_dependent)) {
			msos.script_loader(msos.prefetch_scripts);
		}
	}

	demo.start = angular.module(
		'demo.start', [
			'ng',
			'ng.sanitize',
			'ng.postloader',
			'ng.ui.router',
			'ng.bootstrap.ui',
			'ng.bootstrap.ui.dropdown'	// required by first page outside ui-view (index.html or debug.html)
		]
	).config(
		['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

			msos.console.debug('demo.start - config -> start.');

			function gen_routing_object(ui_name, ui_group) {
				return {
					url: '/' + ui_name,
					templateUrl : msos.resource_url('demo', ui_group + '/tmpl/' + ui_name + '.html'),
					lazyLoad: function lazyLoad($transition$) {
						// Request specific module
						msos.require('demo.' + ui_group +'.controllers.' + ui_name);

						// Then, start AngularJS module registration process
						return $transition$.injector().get('$postload').load();
					}
				};
			}

			$urlRouterProvider.otherwise('/home');

			$stateProvider
				.state(
					'/',
					{
						url: "/home",
						templateUrl: msos.resource_url('demo', 'bootstrap/tmpl/home.html'),
						controller: function demo_dumby_ctrl_slash() {
							msos.console.debug('demo.start - config -> slash controller fired.');
						}
					}
				).state(
					'home',
					{
						url: "/home",
						templateUrl: msos.resource_url('demo', 'bootstrap/tmpl/home.html')
					}
				).state(
					'bootstrap_menu',
					{
						url: '/bootstrap_menu',
						templateUrl: msos.resource_url('demo', 'bootstrap/tmpl/bootstrap_menu.html')
					}
				).state(
					'widgets_menu',
					{
						url: '/widgets_menu',
						templateUrl: msos.resource_url('demo', 'widgets/tmpl/widgets_menu.html')
					}
				).state(
					'material_menu',
					{
						url: '/material_menu',
						templateUrl: msos.resource_url('demo', 'material/tmpl/material_menu.html')
					}
				).state(
					'googlechart_menu',
					{
						url: '/googlechart_menu',
						templateUrl: msos.resource_url('demo', 'googlechart/tmpl/googlechart_menu.html')
					}
				);

			// Angular-UI-Bootstrap examples
			jQuery.each(
				bootstrap_ctrls,
				function (index, route) {
					$stateProvider.state(
						route.page,
						gen_routing_object(route.page, 'bootstrap')
					);
				}
			);

			// Material Design examples
			jQuery.each(
				material_ctrls,
				function (index, route) {
					$stateProvider.state(
						route.page,
						gen_routing_object(route.page, 'material')
					);
				}
			);

			// Angular-Widgets examples
			jQuery.each(
				widget_ctrls,
				function (index, route) {
					$stateProvider.state(
						route.page,
						gen_routing_object(route.page, 'widgets')
					);
				}
			);

			// Angular-Widgets examples
			jQuery.each(
				googlechart_ctrls,
				function (index, route) {
					$stateProvider.state(
						route.page,
						gen_routing_object(route.page, 'googlechart')
					);
				}
			);

			msos.console.debug('demo.start - config ->  done!');
		}]
	).directive(
		'bootstrapDropdown',
		function () {
			return {
				restrict: 'E',
				replace: true,
				templateUrl: msos.resource_url('demo', 'bootstrap/tmpl/bootstrap_dropdown.html')
			};
		}
	).directive(
		'materialDropdown',
		function () {
			return {
				restrict: 'E',
				replace: true, 
				templateUrl: msos.resource_url('demo', 'material/tmpl/material_dropdown.html')
			};
		}
	).directive(
		'widgetsDropdown',
		function () {
			return {
				restrict: 'E',
				replace: true, 
				templateUrl: msos.resource_url('demo', 'widgets/tmpl/widgets_dropdown.html')
			};
		}
	).directive(
		'googlechartDropdown',
		function () {
			return {
				restrict: 'E',
				replace: true, 
				templateUrl: msos.resource_url('demo', 'googlechart/tmpl/googlechart_dropdown.html')
			};
		}
	).directive(
		'collapseMenu',
		function () {
			return {
				restrict: 'E',
				replace: true, 
				templateUrl: msos.resource_url('demo', 'collapse_menu.html')
			};
		}
	).controller(
		'bootstrapDropdownCtrl',
		['$scope', function ($scope) {
			$scope.bootstrap_ctrls = bootstrap_ctrls;
		}]
	).controller(
		'materialDropdownCtrl',
		['$scope', function ($scope) {
			$scope.material_ctrls = material_ctrls;
		}]
	).controller(
		'widgetsDropdownCtrl',
		['$scope', function ($scope) {
			$scope.widget_ctrls = widget_ctrls;
		}]
	).controller(
		'googlechartDropdownCtrl',
		['$scope', function ($scope) {
			$scope.googlechart_ctrls = googlechart_ctrls;
		}]
	);

	msos.console.debug(temp_sd + ' -> done!');

}());

msos.onload_func_done.push(
	function () {
		"use strict";

		if (ng.google && ng.google.ga) {
			// Add Google Analytics page transition tracking
			demo.start.config(ng.google.ga);
		}

		angular.bootstrap('#body', ['demo.start']);
	}
);
