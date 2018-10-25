
/**
 * @ngdoc module
 * @name material.components.bottomSheet
 * @description
 * BottomSheet
 */

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.bottomsheet");
msos.require("ng.material.core.gestures");
msos.require("ng.material.core.theming");
msos.require("ng.material.core.interim");
msos.require('ng.material.ui.backdrop');     // ref. $mdUtil.createBackdrop

ng.material.ui.bottomsheet.version = new msos.set_version(18, 7, 29);

// Load AngularJS-Material module specific CSS
ng.material.ui.bottomsheet.css = new msos.loader();
ng.material.ui.bottomsheet.css.load(msos.resource_url('ng', 'material/css/ui/bottomsheet.css'));


(function () {
    "use strict";

	var temp_bs = 'ng.material.ui.bottomsheet - ';

    function MdBottomSheetDirective($mdBottomSheet) {
        return {
            restrict: 'E',
            link: function postLink(scope, element) {

				msos.console.debug(temp_bs + 'MdBottomSheetDirective - link -> called.');

                element.addClass('_md'); // private md component indicator for styling

                scope.$on(
                    '$destroy',
                    function ng_md_ui_bottomsheet_dir_link_on() {
						msos.console.debug(temp_bs + 'MdBottomSheetDirective - link - $destroy -> called.');
                        $mdBottomSheet.destroy();
                    }
                );
            }
        };
    }

    function MdBottomSheetProvider($$interimElementProvider) {
        // how fast we need to flick down to close the sheet, pixels/ms
        var CLOSING_VELOCITY = 0.5,
            PADDING = 80; // same as css

        /* @ngInject */
        function bottomSheetDefaults($animate, $mdConstant, $mdUtil, $mdTheming, $mdBottomSheet, $rootElement, $mdGesture) {
            var backdrop;

            function registerGestures(element, parent) {
                var deregister = $mdGesture.register(parent, 'drag', { horizontal: false });

                function onDragStart() {
					msos.console.debug(temp_bs + 'bottomSheetDefaults - registerGestures - onDragStart -> called.');
                    // Disable transitions on transform so that it feels fast
                    element.css($mdConstant.CSS.TRANSITION_DURATION, '0ms');
                }

                function onDrag(ev) {
                    var transform = ev.pointer.distanceY;
                    if (transform < 5) {
                        // Slow down drag when trying to drag up, and stop after PADDING
                        transform = Math.max(-PADDING, transform / 2);
                    }
                    element.css($mdConstant.CSS.TRANSFORM, 'translate3d(0,' + (PADDING + transform) + 'px,0)');
                }

                function onDragEnd(ev) {
                    var distanceRemaining,
                        transitionDuration;

                    if (ev.pointer.distanceY > 0 &&
                        (ev.pointer.distanceY > 20 || Math.abs(ev.pointer.velocityY) > CLOSING_VELOCITY)) {
                        distanceRemaining = element.prop('offsetHeight') - ev.pointer.distanceY;
                        transitionDuration = Math.min(distanceRemaining / ev.pointer.velocityY * 0.75, 500);
                        element.css($mdConstant.CSS.TRANSITION_DURATION, transitionDuration + 'ms');
                        $mdUtil.nextTick(
							$mdBottomSheet.cancel,
							true
						);
                    } else {
                        element.css($mdConstant.CSS.TRANSITION_DURATION, '');
                        element.css($mdConstant.CSS.TRANSFORM, '');
                    }
                }

                parent.on('$md.dragstart', onDragStart)
                    .on('$md.drag', onDrag)
                    .on('$md.dragend', onDragEnd);

				return function cleanupGestures() {
					deregister();
					parent.off('$md.dragstart', onDragStart);
					parent.off('$md.drag', onDrag);
					parent.off('$md.dragend', onDragEnd);
				};
            }

            function onShow(scope, element, options) {

				msos.console.debug(temp_bs + 'MdBottomSheetProvider - bottomSheetDefaults - onShow -> called.');

                element = $mdUtil.extractElementByName(element, 'md-bottom-sheet');

                element.attr('tabindex', '-1');

                if (element.hasClass('ng-cloak')) {
                    msos.console.warn('ng.material.ui.bottomsheet - onShow -> $mdBottomSheet: using <md-bottom-sheet ng-cloak> may affect the bottom-sheet opening animations.', element[0]);
                }

				if (options.isLockedOpen) {
					options.clickOutsideToClose = false;
					options.escapeToClose = false;
				} else {
					options.cleanupGestures = registerGestures(element, options.parent);
				}

                if (!options.disableBackdrop) {

                    backdrop = $mdUtil.createBackdrop(scope, "md-bottom-sheet-backdrop md-opaque");
                    backdrop[0].tabIndex = -1;

                    if (options.clickOutsideToClose) {
                        backdrop.on('click', function () {
                            $mdUtil.nextTick($mdBottomSheet.cancel, true);
                        });
                    }

                    $mdTheming.inherit(backdrop, options.parent);

                    $animate.enter(backdrop, options.parent, null);
                }

				$mdTheming.inherit(element, options.parent);

                if (options.disableParentScroll) {
					options.restoreScroll = $mdUtil.disableScrollAround(element, options.parent);
				}

                return $animate.enter(element, options.parent, backdrop).then(
                    function () {
                        var focusable = $mdUtil.findFocusTarget(element) || angular.element(
                            element[0].querySelector('button') ||
                            element[0].querySelector('a') ||
                            element[0].querySelector($mdUtil.prefixer('ng-click', true))
                        ) || backdrop;

                        if (options.escapeToClose) {
                            options.rootElementKeyupCallback = function (e) {
                                if (e.keyCode === $mdConstant.KEY_CODE.ESCAPE) {
                                    $mdUtil.nextTick(
										$mdBottomSheet.cancel,
										true
									);
                                }
                            };

                            $rootElement.on('keyup', options.rootElementKeyupCallback);

                            if (focusable && focusable.focus) {
                                focusable.focus();
                            }
                        }
                    }
                );
            }

            function onRemove(scope_na, element, options) {

				msos.console.debug(temp_bs + 'MdBottomSheetProvider - bottomSheetDefaults - onRemove -> called.');

                if (!options.disableBackdrop) {
					$animate.leave(backdrop);
				}

                return $animate.leave(element).then(
					function () {
						if (options.disableParentScroll) {
							options.restoreScroll();
							delete options.restoreScroll;
						}

						if (options.cleanupGestures) {
							options.cleanupGestures();
						}
					}
				);
            }

            return {
                themable: true,
                onShow: onShow,
                onRemove: onRemove,
                disableBackdrop: false,
                escapeToClose: true,
                clickOutsideToClose: true,
                disableParentScroll: true,
				isLockedOpen: false
            };
        }

        return $$interimElementProvider('$mdBottomSheet').setDefaults(
            {
                methods: ['disableParentScroll', 'escapeToClose', 'clickOutsideToClose'],
                options: ['$animate', '$mdConstant', '$mdUtil', '$mdTheming', '$mdBottomSheet', '$rootElement', '$mdGesture', bottomSheetDefaults]
            }
        );
    }


    angular.module(
        'ng.material.ui.bottomsheet',
        [
            'ng',
            'ng.material.core',
            'ng.material.core.gestures',
            'ng.material.core.theming',
			'ng.material.core.interim'
        ]
    ).provider(
        '$mdBottomSheet',
        ['$$interimElementProvider', MdBottomSheetProvider]
    ).directive(
        'mdBottomSheet',
        ['$mdBottomSheet', MdBottomSheetDirective]
    );

}());
