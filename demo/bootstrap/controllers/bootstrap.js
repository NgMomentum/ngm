
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.bootstrap.controllers.bootstrap");

demo.bootstrap.controllers.bootstrap.version = new msos.set_version(16, 9, 1);


angular.module(
    'demo.bootstrap.controllers.bootstrap', []
).controller(
    'demo.bootstrap.controllers.bootstrap.ctrl',
    [
        '$scope',
        function ($scope) {
            "use strict";

            var temp_b = 'demo.bootstrap.controllers.bootstrap.ctrl';

            msos.console.debug(temp_b + ' -> called.');

        }
    ]
);