
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.mobile.ui.modals");

ng.mobile.ui.modals.version = new msos.set_version(16, 10, 27);

// Load Mobile Angular-UI module specific and Bootstrap modal CSS
ng.mobile.ui.modals.css = new msos.loader();
ng.mobile.ui.modals.css.load(msos.resource_url('ng', 'bootstrap/css/ui/modal.css'));
ng.mobile.ui.modals.css.load(msos.resource_url('ng', 'mobile/css/ui/modals.css'));


(function () {
    'use strict';

    angular.module('ng.mobile.ui.modals', ['ng'])

    .directive(
        'modal',
        ['$rootElement', function ($rootElement) {
            return {
                restrict: 'C',
                link: function (scope, elem) {
                    $rootElement.addClass('has-modal');
                    elem.on('$destroy', function () {
                        $rootElement.removeClass('has-modal');
                    });
                    scope.$on('$destroy', function () {
                        $rootElement.removeClass('has-modal');
                    });

                    if (elem.hasClass('modal-overlay')) {
                        $rootElement.addClass('has-modal-overlay');
                        elem.on('$destroy', function () {
                            $rootElement.removeClass('has-modal-overlay');
                        });
                        scope.$on('$destroy', function () {
                            $rootElement.removeClass('has-modal-overlay');
                        });
                    }
                }
            };
        }
    ]);
}());