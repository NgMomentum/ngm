
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.bootstrap.controllers.alert");
msos.require("ng.bootstrap.ui.alert");

demo.bootstrap.controllers.alert.version = new msos.set_version(17, 1, 20);


demo.bootstrap.controllers.alert.ctrl = function ($scope) {
    "use strict";

    var temp_ac = 'demo.bootstrap.controllers.alert.ctrl';

    msos.console.debug(temp_ac + ' -> called.');

    $scope.alerts = [{
        type: 'danger',
        msg: 'Oh snap! Change a few things up and try submitting again.'
    }, {
        type: 'success',
        msg: 'Well done! You successfully read this important alert message.'
    }];

    $scope.addAlert = function () {
        msos.console.debug(temp_ac + ' - $scope.addAlert -> called.');
        $scope.alerts.push({
            msg: 'Another alert!'
        });
    };

    $scope.closeAlert = function (index) {
        msos.console.debug(temp_ac + ' - $scope.closeAlert -> called.');
        $scope.alerts.splice(index, 1);
    };
};

angular.module(
    'demo.bootstrap.controllers.alert',
    ['ng']
).controller(
    'demo.bootstrap.controllers.alert.ctrl',
    ['$scope', demo.bootstrap.controllers.alert.ctrl]
);
