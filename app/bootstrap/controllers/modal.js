
msos.provide("app.bootstrap.controllers.modal");
msos.require("ng.bootstrap.ui.modal");


app.bootstrap.controllers.modal.version = new msos.set_version(16, 4, 12);

angular.module(
    'app.bootstrap.controllers.modal', ['ng.bootstrap.ui.modal']
).controller(
    'app.bootstrap.controllers.modal.ctrl',
    [
        '$scope', '$uibModal', '$log',
        function ($scope, $uibModal, $log) {

            $scope.items = ['item1', 'item2', 'item3'];

            $scope.animationsEnabled = true;

            $scope.open = function (size) {

                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: msos.resource_url('app','bootstrap/tmpl/modal_demo.html'),
                    controller: 'ModalInstanceCtrl',
                    size: size,
                    resolve: {
                        items: function () {
                            return $scope.items;
                        }
                    }
                });

                modalInstance.result.then(
                    function (selectedItem) {
                        $scope.selected = selectedItem;
                    },
                    function () {
                        $log.info('Modal dismissed at: ' + new Date());
                    }
                );
            };

            $scope.toggleAnimation = function () {
                $scope.animationsEnabled = !$scope.animationsEnabled;
            };
        }
    ]
).controller(
    'ModalInstanceCtrl',
    [
        '$scope', '$uibModalInstance', 'items',
        function ($scope, $uibModalInstance, items) {

            $scope.items = items;
            $scope.selected = {
                item: $scope.items[0]
            };

            $scope.ok = function () {
                $uibModalInstance.close($scope.selected.item);
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
        }
    ]
);
