
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.material");

demo.material.controllers.material.version = new msos.set_version(18, 9, 14);


angular.module(
    'demo.material.controllers.material',
	['ng']
).controller(
    'demo.material.controllers.material.ctrl',
    ['$scope', function ($scope) {
            "use strict";

            var temp_m = 'demo.material.controllers.material.ctrl';

            msos.console.info(temp_m + ' -> called, $scope: ', $scope);

        }
    ]
);
