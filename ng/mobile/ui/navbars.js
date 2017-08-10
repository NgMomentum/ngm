
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.mobile.ui.navbars");

ng.mobile.ui.navbars.version = new msos.set_version(16, 10, 27);

// Load Mobile Angular-UI module specific CSS
ng.mobile.ui.navbars.css = new msos.loader();
ng.mobile.ui.navbars.css.load(msos.resource_url('ng', 'mobile/css/ui/navbars.css'));


(function () {
    'use strict';

    var module = angular.module('ng.mobile.ui.navbars', ['ng']);

    angular.forEach(['top', 'bottom'], function (side) {
        var directiveName = 'navbarAbsolute' + side.charAt(0).toUpperCase() + side.slice(1);
        module.directive(directiveName, [
            '$rootElement',
            function ($rootElement) {
                return {
                    restrict: 'C',
                    link: function (scope) {
                        $rootElement.addClass('has-navbar-' + side);
                        scope.$on('$destroy', function () {
                            $rootElement.removeClass('has-navbar-' + side);
                        });
                    }
                };
            }
        ]);
    });
}());