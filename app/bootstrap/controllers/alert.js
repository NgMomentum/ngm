
msos.provide("app.bootstrap.controllers.alert");
msos.require("ng.bootstrap.ui.alert");

app.bootstrap.controllers.alert.version = new msos.set_version(16, 3, 29);

app.bootstrap.controllers.alert.ctrl = function ($scope) {
    "use strict";

    $scope.alerts = [{
        type: 'danger',
        msg: 'Oh snap! Change a few things up and try submitting again.'
    }, {
        type: 'success',
        msg: 'Well done! You successfully read this important alert message.'
    }];

    $scope.addAlert = function () {
        $scope.alerts.push({
            msg: 'Another alert!'
        });
    };

    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };
}

angular.module(
    'app.bootstrap.controllers.alert', []
).controller(
    'app.bootstrap.controllers.alert.ctrl',
    ['$scope', app.bootstrap.controllers.alert.ctrl]
);