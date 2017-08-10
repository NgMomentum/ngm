/**
 * @ngdoc module
 * @name material.components.bottomSheet
 * @description
 * BottomSheet
 */

/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.v111.ui.bottomsheet");
msos.require("ng.material.v111.core");
msos.require("ng.material.v111.core.gestures");
msos.require("ng.material.v111.core.theming");
msos.require('ng.material.v111.ui.backdrop');     // ref. $mdUtil.createBackdrop

ng.material.v111.ui.bottomsheet.version = new msos.set_version(16, 12, 28);


(function () {
    "use strict";

    function MdBottomSheetDirective($mdBottomSheet) {
        return {
            restrict: 'E',
            link: function postLink(scope, element) {
                element.addClass('_md'); // private md component indicator for styling

                // When navigation force destroys an interimElement, then
                // listen and $destroy() that interim instance...
                scope.$on(
                    '$destroy',
                    function () {
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
        function bottomSheetDefaults($animate, $mdConstant, $mdUtil, $mdTheming, $mdBottomSheet, $rootElement, $mdGesture, $log) {
            var backdrop;

            function BottomSheet(element, parent) {
                var deregister = $mdGesture.register(parent, 'drag', { horizontal: false });
    
                function onDragStart() {
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
                        $mdUtil.nextTick($mdBottomSheet.cancel, true);
                    } else {
                        element.css($mdConstant.CSS.TRANSITION_DURATION, '');
                        element.css($mdConstant.CSS.TRANSFORM, '');
                    }
                }

                parent.on('$md.dragstart', onDragStart)
                    .on('$md.drag', onDrag)
                    .on('$md.dragend', onDragEnd);

                return {
                    element: element,
                    cleanup: function cleanup() {
                        deregister();
                        parent.off('$md.dragstart', onDragStart);
                        parent.off('$md.drag', onDrag);
                        parent.off('$md.dragend', onDragEnd);
                    }
                };
            }

            function onShow(scope, element, options, controller_na) {
                var bottomSheet;

                element = $mdUtil.extractElementByName(element, 'md-bottom-sheet');

                // prevent tab focus or click focus on the bottom-sheet container
                element.attr('tabindex', "-1");

                // Once the md-bottom-sheet has `ng-cloak` applied on his template the opening animation will not work properly.
                // This is a very common problem, so we have to notify the developer about this.
                if (element.hasClass('ng-cloak')) {
                    $log.warn('$mdBottomSheet: using `<md-bottom-sheet ng-cloak >` will affect the bottom-sheet opening animations.', element[0]);
                }

                if (!options.disableBackdrop) {
                    // Add a backdrop that will close on click
                    backdrop = $mdUtil.createBackdrop(scope, "md-bottom-sheet-backdrop md-opaque");

                    // Prevent mouse focus on backdrop; ONLY programatic focus allowed.
                    // This allows clicks on backdrop to propogate to the $rootElement and
                    // ESC key events to be detected properly.

                    backdrop[0].tabIndex = -1;

                    if (options.clickOutsideToClose) {
                        backdrop.on('click', function () {
                            $mdUtil.nextTick($mdBottomSheet.cancel, true);
                        });
                    }

                    $mdTheming.inherit(backdrop, options.parent);

                    $animate.enter(backdrop, options.parent, null);
                }

                bottomSheet = new BottomSheet(element, options.parent);
                options.bottomSheet = bottomSheet;

                $mdTheming.inherit(bottomSheet.element, options.parent);
    
                if (options.disableParentScroll) {
                    options.restoreScroll = $mdUtil.disableScrollAround(bottomSheet.element, options.parent);
                }

                return $animate.enter(bottomSheet.element, options.parent, backdrop).then(
                    function () {
                        var focusable = $mdUtil.findFocusTarget(element) || angular.element(
                            element[0].querySelector('button') ||
                            element[0].querySelector('a') ||
                            element[0].querySelector($mdUtil.prefixer('ng-click', true))
                        ) || backdrop;

                        if (options.escapeToClose) {
                            options.rootElementKeyupCallback = function (e) {
                                if (e.keyCode === $mdConstant.KEY_CODE.ESCAPE) {
                                    $mdUtil.nextTick($mdBottomSheet.cancel, true);
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

            function onRemove(scope_na, element_na, options) {

                var bottomSheet = options.bottomSheet;

                if (!options.disableBackdrop) { $animate.leave(backdrop); }

                return $animate.leave(bottomSheet.element).then(function () {
                    if (options.disableParentScroll) {
                        options.restoreScroll();
                        delete options.restoreScroll;
                    }

                    bottomSheet.cleanup();
                });
            }

            return {
                themable: true,
                onShow: onShow,
                onRemove: onRemove,
                disableBackdrop: false,
                escapeToClose: true,
                clickOutsideToClose: true,
                disableParentScroll: true
            };
        }

        return $$interimElementProvider('$mdBottomSheet').setDefaults(
            {
                methods: ['disableParentScroll', 'escapeToClose', 'clickOutsideToClose'],
                options: ['$animate', '$mdConstant', '$mdUtil', '$mdTheming', '$mdBottomSheet', '$rootElement', '$mdGesture', '$log', bottomSheetDefaults]
            }
        );
    }


    angular.module(
        'ng.material.v111.ui.bottomsheet',
        [
            'ng',
            'ng.material.v111.core',
            'ng.material.v111.core.gestures',
            'ng.material.v111.core.theming'
        ]
    ).provider(
        '$mdBottomSheet',
        ['$$interimElementProvider', MdBottomSheetProvider]
    ).directive(
        'mdBottomSheet',
        ['$mdBottomSheet', MdBottomSheetDirective]
    );

}());
