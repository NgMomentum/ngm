
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.bootstrap.controllers.bootstrap");

demo.bootstrap.controllers.bootstrap.version = new msos.set_version(17, 12, 31);


angular.module(
    'demo.bootstrap.controllers.bootstrap',
	['ng']
).controller(
    'demo.bootstrap.controllers.bootstrap.ctrl',
    [
        '$scope',
        function ($scope) {
            "use strict";

            var temp_b = 'demo.bootstrap.controllers.bootstrap.ctrl';

            msos.console.info(temp_b + ' -> called.');

        }
    ]
);
