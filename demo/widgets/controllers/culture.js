
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false,
    demo: false
*/

msos.provide("demo.widgets.controllers.culture");

demo.widgets.controllers.culture.version = new msos.set_version(16, 7, 20);


angular.module(
    'demo.widgets.controllers.culture', []
).controller(
    'demo.widgets.controllers.culture.ctrl',
    [
        '$scope',
        function ($scope) {
            $scope.amount = 1234.56;
            $scope.current_date = new Date();
        }
    ]
);