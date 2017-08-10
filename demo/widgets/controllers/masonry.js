
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.widgets.controllers.masonry");
msos.require("ng.ui.masonry");

demo.widgets.controllers.masonry.version = new msos.set_version(16, 5, 18);


angular.module(
    'demo.widgets.controllers.masonry', []
).controller(
    'demo.widgets.controllers.masonry.ctrl',
    [
        '$scope',
        function ($scope) {
            "use strict";

            function genBrick() {
                var height = ~~(Math.random() * 500) + 100,
                    id = ~~(Math.random() * 10000);

                return {
                    src: 'http://lorempixel.com/g/280/' + height + '/?' + id
                };
            }

            $scope.bricks = [
                genBrick(),
                genBrick(),
                genBrick(),
                genBrick(),
                genBrick()
            ];

            $scope.add = function add() {
                $scope.bricks.push(genBrick());
            };

            $scope.remove = function remove() {
                $scope.bricks.splice(~~(Math.random() * $scope.bricks.length), 1);
            };
        }
    ]
);