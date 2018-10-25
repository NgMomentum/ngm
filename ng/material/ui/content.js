
/**
 * @ngdoc module
 * @name material.components.content
 *
 * @description
 * Scrollable content
 */

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.content");
msos.require("ng.material.core.theming");

ng.material.ui.content.version = new msos.set_version(18, 4, 13);

// Load AngularJS-Material module specific CSS
ng.material.ui.content.css = new msos.loader();
ng.material.ui.content.css.load(msos.resource_url('ng', 'material/css/ui/content.css'));


function iosScrollFix(node) {
    "use strict";

    angular.element(node).on(
        '$md.pressdown',
        function (ev) {
            // Only touch events
            if (ev.pointer.type !== 't') { return; }
            // Don't let a child content's touchstart ruin it for us.
            if (ev.$materialScrollFixed) { return; }

            ev.$materialScrollFixed = true;

            if (node.scrollTop === 0) {
                node.scrollTop = 1;
            } else if (node.scrollHeight === node.scrollTop + node.offsetHeight) {
                node.scrollTop -= 1;
            }
        }
    );
}

function mdContentDirective($mdTheming) {
    "use strict";

    function ContentController($scope, $element) {

        this.$scope = $scope;
        this.$element = $element;
    }

    return {
        restrict: 'E',
        controller: ['$scope', '$element', ContentController],
        link: function (scope, element) {

            element.addClass('_md');		// private md component indicator for styling

            $mdTheming(element);
            scope.$broadcast('$mdContentLoaded', element);

            iosScrollFix(element[0]);
        }
    };
}


angular.module(
    'ng.material.ui.content',
    ['ng', 'ng.material.core.theming']
).directive(
    'mdContent',
    ['$mdTheming', mdContentDirective]
);
