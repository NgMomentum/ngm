
/**
 * @ngdoc module
 * @name material.components.toolbar
 */

/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.v111.ui.toolbar");
msos.require("ng.material.v111.core");
msos.require("ng.material.v111.core.theming");

ng.material.v111.ui.toolbar.version = new msos.set_version(17, 1, 3);


function mdToolbarDirective($$rAF, $mdConstant, $mdUtil, $mdTheming, $animate) {
    "use strict";

    var translateY = angular.bind(null, $mdUtil.supplant, 'translate3d(0,{0}px,0)');

    return {
        template: '',
        restrict: 'E',

        link: function (scope, element, attr) {

            element.addClass('_md'); // private md component indicator for styling
            $mdTheming(element);

            $mdUtil.nextTick(
                function () { element.addClass('_md-toolbar-transitions'); },
                false
            );

            function setupScrollShrink() {

                var toolbarHeight,
                    contentElement,
                    disableScrollShrink = angular.noop,
                    y = 0,
                    prevScrollTop = 0,
                    shrinkSpeedFactor = attr.mdShrinkSpeedFactor || 0.5,
                    debouncedContentScroll,
                    debouncedUpdateHeight;

                function onContentScroll(e) {
                    var scrollTop = e ? e.target.scrollTop : prevScrollTop;

                    debouncedUpdateHeight();

                    y = Math.min(
                        toolbarHeight / shrinkSpeedFactor,
                        Math.max(0, y + scrollTop - prevScrollTop)
                    );

                    element.css($mdConstant.CSS.TRANSFORM, translateY([-y * shrinkSpeedFactor]));
                    contentElement.css($mdConstant.CSS.TRANSFORM, translateY([(toolbarHeight - y) * shrinkSpeedFactor]));

                    prevScrollTop = scrollTop;

                    $mdUtil.nextTick(
                        function () {
                            var hasWhiteFrame = element.hasClass('md-whiteframe-z1');

                            if (hasWhiteFrame && !y) {
                                $animate.removeClass(element, 'md-whiteframe-z1');
                            } else if (!hasWhiteFrame && y) {
                                $animate.addClass(element, 'md-whiteframe-z1');
                            }
                        }
                    );
                }

                function updateToolbarHeight() {

                    toolbarHeight = element.prop('offsetHeight');

                    var margin = (-toolbarHeight * shrinkSpeedFactor) + 'px';

                    contentElement.css({
                        "margin-top": margin,
                        "margin-bottom": margin
                    });

                    onContentScroll();
                }

                function enableScrollShrink() {

                    if (!contentElement) { return angular.noop; } // no md-content

                    contentElement.on('scroll', debouncedContentScroll);
                    contentElement.attr('scroll-shrink', 'true');

                    $mdUtil.nextTick(updateToolbarHeight, false);

                    return function disableScrollShrink() {

                        contentElement.off('scroll', debouncedContentScroll);
                        contentElement.attr('scroll-shrink', 'false');

                        updateToolbarHeight();
                    };
                }

                function onMdContentLoad($event_na, newContentEl) {
                    // Toolbar and content must be siblings
                    if (newContentEl && element.parent()[0] === newContentEl.parent()[0]) {
                        // unhook old content event listener if exists
                        if (contentElement) {
                            contentElement.off('scroll', debouncedContentScroll);
                        }

                        contentElement = newContentEl;
                        disableScrollShrink = enableScrollShrink();
                    }
                }

                function onChangeScrollShrink(shrinkWithScroll) {
                    var closestContent = element.parent().find('md-content');

                    if (!contentElement && closestContent.length) {
                        onMdContentLoad(null, closestContent);
                    }

                    // Evaluate the expression
                    shrinkWithScroll = scope.$eval(shrinkWithScroll);

                    // Disable only if the attribute's expression evaluates to false
                    if (shrinkWithScroll === false) {
                        disableScrollShrink();
                    } else {
                        disableScrollShrink = enableScrollShrink();
                    }
                }

                debouncedContentScroll = $$rAF.throttle(onContentScroll);
                debouncedUpdateHeight = $mdUtil.debounce(updateToolbarHeight, 5 * 1000);

                scope.$on('$mdContentLoaded', onMdContentLoad);

                attr.$observe('mdScrollShrink', onChangeScrollShrink);

                if (attr.ngShow) {
                    scope.$watch(attr.ngShow, updateToolbarHeight);
                }

                if (attr.ngHide) {
                    scope.$watch(attr.ngHide, updateToolbarHeight);
                }

                scope.$on('$destroy', disableScrollShrink);
            }

            if (angular.isDefined(attr.mdScrollShrink)) {
                setupScrollShrink();
            }
        }
    };
}


angular.module(
    'ng.material.v111.ui.toolbar',
    [
        'ng.material.v111.core',
        'ng.material.v111.core.theming'
    ]
).directive(
    'mdToolbar',
    ['$$rAF', '$mdConstant', '$mdUtil', '$mdTheming', '$animate', mdToolbarDirective]
);
