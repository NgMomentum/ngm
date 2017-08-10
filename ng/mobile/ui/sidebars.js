
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.mobile.ui.sidebars");
msos.require("ng.mobile.core");

ng.mobile.ui.sidebars.version = new msos.set_version(16, 10, 27);

// Load Mobile Angular-UI module specific CSS
ng.mobile.ui.sidebars.css = new msos.loader();
ng.mobile.ui.sidebars.css.load(msos.resource_url('ng', 'mobile/css/ui/sidebars.css'));


(function () {
    'use strict';

    var module = angular.module(
        'ng.mobile.ui.sidebars',
		[
			'ng',
            'ng.mobile.core.sharedState',
            'ng.mobile.core.outerClick'
        ]
    );

	// Used to declare value used below...for better debugging.
	module.directive(
		'uiTrackAsSearchParam',
		function () {
			return {
				restrict: 'A'
			};
		}
	);

    angular.forEach(['left', 'right'], function (side) {
        var directiveName = 'mobilesidebar' + side.charAt(0).toUpperCase() + side.slice(1),
			defaultStateName = 'ui' + directiveName.charAt(0).toUpperCase() + directiveName.slice(1);

        module.directive(directiveName, [
            '$rootElement',
            'SharedState',
            'bindOuterClick',
            '$location',
            function (
                $rootElement,
                SharedState,
                bindOuterClick,
                $location
            ) {
                return {
                    restrict: 'C',
                    link: function (scope, elem, attrs) {
						var temp_ln = 'ng.mobile.ui.sidebars - ' + defaultStateName + ' - link';
                        var parentClass = 'has-mobilesidebar-' + side;
                        var visibleClass = 'mobilesidebar-' + side + '-visible';
                        var activeClass = 'mobilesidebar-' + side + '-in';
                        var stateName = attrs.id ? attrs.id : defaultStateName;
						var trackAsSearchParam = attrs.uiTrackAsSearchParam === '' || attrs.uiTrackAsSearchParam;

                        var outerClickCb = function () {
							if (trackAsSearchParam) {
								$location.search(stateName, 'false');
							}
                            SharedState.turnOff(stateName);
                        };

                        var outerClickIf = function () {
                            return SharedState.isActive(stateName);
                        };

                        $rootElement.addClass(parentClass);

                        scope.$on('$destroy', function () {
                            $rootElement
                                .removeClass(parentClass);
                            $rootElement
                                .removeClass(visibleClass);
                            $rootElement
                                .removeClass(activeClass);
                        });

                        var defaultActive = attrs.active !== undefined && attrs.active !== 'false';

                        SharedState.initialize(scope, stateName, {
                            defaultValue: defaultActive
                        });

                        scope.$on('mobile-angular-ui.state.changed.' + stateName, function (e, active) {

							msos.console.debug(temp_ln + ' - mobile-angular-ui.state.changed.' + stateName + ' -> start, active:', active);

							if (trackAsSearchParam) {
								$location.search(stateName, active == true ? 'true' : 'false');
							}

                            if (active) {
                                $rootElement
                                    .addClass(visibleClass);
                                $rootElement
                                    .addClass(activeClass);
                            } else {
                                $rootElement
                                    .removeClass(activeClass);
                            }

							msos.console.debug(temp_ln + ' - mobile-angular-ui.state.changed.' + stateName + ' ->  done!');
                        });

                        scope.$on('$routeChangeSuccess', function () {
							msos.console.debug(temp_ln + ' - $routeChangeSuccess -> start, state: ' + stateName);

							if (trackAsSearchParam) {
								$location.search(stateName, 'false');
							}
                            SharedState.turnOff(stateName);

							msos.console.debug(temp_ln + ' - $routeChangeSuccess ->  done, state: ' + stateName);
                        });

						scope.$on('$routeUpdate', function () {
							msos.console.debug(temp_ln + ' - $routeUpdate -> start, state: ' + stateName);

							if (trackAsSearchParam) {
								var loc_search = $location.search();
								if (loc_search[stateName] && loc_search[stateName] === 'true') {
									SharedState.turnOn(stateName);
								} else {
									$location.search(stateName, 'false');
									SharedState.turnOff(stateName);
								}
							}

							msos.console.debug(temp_ln + ' - $routeUpdate ->  done, state: ' + stateName);
						});

                        scope.$on('mobile-angular-ui.app.transitionend', function () {
                            if (!SharedState.isActive(stateName)) {
                                $rootElement.removeClass(visibleClass);
                            }
                        });

                        if (attrs.closeOnOuterClicks !== 'false') {
                            bindOuterClick(scope, elem, outerClickCb, outerClickIf);
                        }
                    }
                };
            }
        ]);
    });

    module.directive(
		'mobile-ng',
		['$rootScope', function ($rootScope) {
			return {
				restrict: 'C',
				link: function (scope, element) {

					element.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend', function () {
						$rootScope.$broadcast('mobile-angular-ui.app.transitionend');
					});
				}
			};
		}]
	);
}());
