
/*
 * @ngdoc module
 * @name material.components.backdrop
 * @description Backdrop
 */

/**
 * @ngdoc directive
 * @name mdBackdrop
 * @module material.components.backdrop
 *
 * @restrict E
 *
 * @description
 * `<md-backdrop>` is a backdrop element used by other components, such as dialog and bottom sheet.
 * Apply class `opaque` to make the backdrop use the theme backdrop color.
 *
 */

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.backdrop");
msos.require("ng.material.core.theming");

ng.material.ui.backdrop.version = new msos.set_version(18, 3, 22);

// Load AngularJS-Material module specific CSS
ng.material.ui.backdrop.css = new msos.loader();
ng.material.ui.backdrop.css.load(msos.resource_url('ng', 'material/css/ui/backdrop.css'));


angular.module(
    'ng.material.ui.backdrop',
    [
        'ng',
        'ng.material.core',
        'ng.material.core.theming'
    ]
).directive(
    'mdBackdrop',
    ['$mdTheming', '$mdUtil', '$animate', '$rootElement', '$window', '$log', '$$rAF', '$document',
	 function BackdropDirective($mdTheming, $mdUtil, $animate, $rootElement, $window, $log, $$rAF, $document) {
        "use strict";

        var ERROR_CSS_POSITION = '<md-backdrop> may not work properly in a scrolled, static-positioned parent container.';

        function postLink(scope, element) {
            // backdrop may be outside the $rootElement, tell ngAnimate to animate regardless
            if ($animate.pin) { $animate.pin(element, $rootElement); }

            var bodyStyles;

            function resize() {
                var viewportHeight = parseInt(bodyStyles.height, 10) + Math.abs(parseInt(bodyStyles.top, 10));
                element.css('height', viewportHeight + 'px');
            }

            $$rAF(function ng_md_ui_backdrop_raf() {
                var resizeHandler,
                    parent,
                    styles;

                bodyStyles = $window.getComputedStyle($document[0].body);

                if (bodyStyles.position === 'fixed') {

                    resizeHandler = $mdUtil.debounce(
                        function ng_md_ui_backdrop_raf_resize() {
                            bodyStyles = $window.getComputedStyle($document[0].body);
                            resize();
                        },
                        60,
                        null,
                        false
                    );

                    resize();

                    angular.element($window).on('resize', resizeHandler);

                    scope.$on(
						'$destroy',
						function ng_md_ui_backdrop_raf_destroy_on() {
							angular.element($window).off('resize', resizeHandler);
						}
					);
                }

                // Often $animate.enter() is used to append the backDrop element
                // so let's wait until $animate is done...
                parent = element.parent();

                if (parent.length) {
                    if (parent[0].nodeName === 'BODY') {
                        element.css('position', 'fixed');
                    }

                    styles = $window.getComputedStyle(parent[0]);

                    if (styles.position === 'static') {
                        // backdrop uses position:absolute and will not work properly with parent position:static (default)
                        $log.warn(ERROR_CSS_POSITION);
                    }

                    // Only inherit the parent if the backdrop has a parent.
                    $mdTheming.inherit(element, parent);
                }
            });
        }

        return {
            restrict: 'E',
            link: postLink
        };
    }]
);
