/**
 * @ngdoc module
 * @name material.components.content
 *
 * @description
 * Scrollable content
 */

/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.v111.ui.content");
msos.require("ng.material.v111.core.theming");

ng.material.v111.ui.content.version = new msos.set_version(16, 12, 29);


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

            element.addClass('_md'); // private md component indicator for styling

            $mdTheming(element);
            scope.$broadcast('$mdContentLoaded', element);

            iosScrollFix(element[0]);
        }
    };
}


angular.module(
    'ng.material.v111.ui.content',
    [
        'ng',
        'ng.material.v111.core.theming'
    ]
).directive(
    'mdContent',
    ['$mdTheming', mdContentDirective]
);
