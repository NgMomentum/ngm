
msos.provide("app.bootstrap.controllers.position");

app.bootstrap.controllers.position.version = new msos.set_version(16, 4, 4);


angular.module(
    'app.bootstrap.controllers.position', []
).controller(
    'app.bootstrap.controllers.position.ctrl',
    ['$scope', '$window', '$uibPosition', function ($scope, $window, $uibPosition) {

        $scope.elemVals = {};
        $scope.parentScrollable = true;
        $scope.parentRelative = true;

        $scope.getValues = function () {
            var divEl = $window.document.querySelector('#posdemodiv'),
                btnEl = $window.document.querySelector('#posdemobtn'),
                offsetParent = $uibPosition.offsetParent(divEl),
                scrollParent = $uibPosition.scrollParent(divEl);

            $scope.elemVals.offsetParent = 'type: ' + offsetParent.tagName + ', id: ' + offsetParent.id;

            $scope.elemVals.scrollParent = 'type: ' + scrollParent.tagName + ', id: ' + scrollParent.id;

            $scope.scrollbarWidth = $uibPosition.scrollbarWidth();

            $scope.elemVals.position = $uibPosition.position(divEl);

            $scope.elemVals.offset = $uibPosition.offset(divEl);

            $scope.elemVals.viewportOffset = $uibPosition.viewportOffset(divEl);

            $scope.elemVals.positionElements = $uibPosition.positionElements(btnEl, divEl, 'auto bottom-left');
        };
    }]
);