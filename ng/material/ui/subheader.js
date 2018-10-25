
/**
 * @ngdoc module
 * @name material.components.subheader
 * @description
 * SubHeader module
 *
 */

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.subheader");
msos.require("ng.material.core.theming");
msos.require("ng.material.ui.aria");
msos.require("ng.material.ui.sticky");

ng.material.ui.subheader.version = new msos.set_version(18, 7, 10);

// Load AngularJS-Material module specific CSS
ng.material.ui.subheader.css = new msos.loader();
ng.material.ui.subheader.css.load(msos.resource_url('ng', 'material/css/ui/subheader.css'));


function MdSubheaderDirective($mdSticky, $compile, $mdTheming, $mdUtil, $mdAria) {
    "use strict";

    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        template: (
            '<div class="md-subheader _md">' +
				'<div class="md-subheader-inner">' +
					'<div class="md-subheader-content"></div>' +
				'</div>' +
            '</div>'
        ),
        link: function postLink(scope, element, attr, controllers_na, transclude) {

            $mdTheming(element);
            element.addClass('_md');

            $mdUtil.prefixer().removeAttribute(element, 'ng-repeat');

            var outerHTML = element[0].outerHTML;

            function getContent(el) {
                return angular.element(el[0].querySelector('.md-subheader-content'));
            }

            attr.$set('role', 'heading');
            $mdAria.expect(element, 'aria-level', '2');

            transclude(
				scope,
				function (clone) {
					getContent(element).append(clone);
				}
			);

            if (!element.hasClass('md-no-sticky')) {
                transclude(
					scope,
					function (clone) {
						var wrapper = $compile('<div class="md-subheader-wrapper" aria-hidden="true">' + outerHTML + '</div>')(scope);

						$mdUtil.nextTick(
							function () { getContent(wrapper).append(clone); },
							false	// nextTick was undefined (default true)
						);

						$mdSticky(scope, element, wrapper);
					}
				);
            }
        }
    };
}


angular.module(
    'ng.material.ui.subheader',
    [
		'ng',
        'ng.material.core',
        'ng.material.core.theming',
        'ng.material.ui.aria'
    ]
).directive(
    'mdSubheader',
    ['$mdSticky', '$compile', '$mdTheming', '$mdUtil', '$mdAria', MdSubheaderDirective]
);
