/**
 * @ngdoc module
 * @name material.components.subheader
 * @description
 * SubHeader module
 *
 *  Subheaders are special list tiles that delineate distinct sections of a
 *  list or grid list and are typically related to the current filtering or
 *  sorting criteria. Subheader tiles are either displayed inline with tiles or
 *  can be associated with content, for example, in an adjacent column.
 *
 *  Upon scrolling, subheaders remain pinned to the top of the screen and remain
 *  pinned until pushed on or off screen by the next subheader. @see [Material
 *  Design Specifications](https://www.google.com/design/spec/components/subheaders.html)
 *
 *  > To improve the visual grouping of content, use the system color for your subheaders.
 *
 */

/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.v111.ui.subheader");
msos.require("ng.material.v111.core");
msos.require("ng.material.v111.core.theming");
msos.require("ng.material.v111.ui.aria");
msos.require("ng.material.v111.ui.sticky");

ng.material.v111.ui.subheader.version = new msos.set_version(17, 1, 5);


function MdSubheaderDirective($mdSticky, $compile, $mdTheming, $mdUtil, $mdAria) {
    "use strict";

    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        template: (
            '<div class="md-subheader _md">' +
            '  <div class="md-subheader-inner">' +
            '    <div class="md-subheader-content"></div>' +
            '  </div>' +
            '</div>'
        ),
        link: function postLink(scope, element, attr, controllers_na, transclude) {
            $mdTheming(element);
            element.addClass('_md');

            // Remove the ngRepeat attribute from the root element, because we don't want to compile
            // the ngRepeat for the sticky clone again.
            $mdUtil.prefixer().removeAttribute(element, 'ng-repeat');

            var outerHTML = element[0].outerHTML;

            function getContent(el) {
                return angular.element(el[0].querySelector('.md-subheader-content'));
            }

            // Set the ARIA attributes on the original element since it keeps it's original place in
            // the DOM, whereas the clones are in reverse order. Should be done after the outerHTML,
            // in order to avoid having multiple element be marked as headers.
            attr.$set('role', 'heading');
            $mdAria.expect(element, 'aria-level', '2');

            // Transclude the user-given contents of the subheader
            // the conventional way.
            transclude(scope, function (clone) {
                getContent(element).append(clone);
            });

            // Create another clone, that uses the outer and inner contents
            // of the element, that will be 'stickied' as the user scrolls.
            if (!element.hasClass('md-no-sticky')) {
                transclude(scope, function (clone) {
                    // If the user adds an ng-if or ng-repeat directly to the md-subheader element, the
                    // compiled clone below will only be a comment tag (since they replace their elements with
                    // a comment) which cannot be properly passed to the $mdSticky; so we wrap it in our own
                    // DIV to ensure we have something $mdSticky can use
                    var wrapper = $compile('<div class="md-subheader-wrapper" aria-hidden="true">' + outerHTML + '</div>')(scope);

                    // Delay initialization until after any `ng-if`/`ng-repeat`/etc has finished before
                    // attempting to create the clone
                    $mdUtil.nextTick(function () {
                        // Append our transcluded clone into the wrapper.
                        // We don't have to recompile the element again, because the clone is already
                        // compiled in it's transclusion scope. If we recompile the outerHTML of the new clone, we would lose
                        // our ngIf's and other previous registered bindings / properties.
                        getContent(wrapper).append(clone);
                    });

                    // Make the element sticky and provide the stickyClone our self, to avoid recompilation of the subheader
                    // element.
                    $mdSticky(scope, element, wrapper);
                });
            }
        }
    };
}


angular.module(
    'ng.material.v111.ui.subheader',
    [
        'ng.material.v111.core',
        'ng.material.v111.core.theming',
        'ng.material.v111.ui.aria',
        'ng.material.v111.ui.sticky'
    ]
).directive(
    'mdSubheader',
    ['$mdSticky', '$compile', '$mdTheming', '$mdUtil', '$mdAria', MdSubheaderDirective]
);