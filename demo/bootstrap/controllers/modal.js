
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.bootstrap.controllers.modal");
msos.require("ng.bootstrap.ui.modal");


demo.bootstrap.controllers.modal.version = new msos.set_version(16, 8, 30);

angular.module(
    'demo.bootstrap.controllers.modal', ['ng.bootstrap.ui.modal']
).controller(
    'demo.bootstrap.controllers.modal.ctrl', [
        '$uibModal', '$log',
        function ($uibModal, $log) {
            "use strict";

            var $ctrl = this;

            $ctrl.items = ['item1', 'item2', 'item3'];

            $ctrl.animationsEnabled = true;

            $ctrl.open = function (size) {
                var modalInstance = $uibModal.open({
                    animation: $ctrl.animationsEnabled,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'myModalContent.html',
                    controller: 'ModalInstanceCtrl',
                    controllerAs: '$ctrl',
                    size: size,
                    resolve: {
                        items: function () {
                            return $ctrl.items;
                        }
                    }
                });

                modalInstance.result.then(function (selectedItem) {
                    $ctrl.selected = selectedItem;
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            };

            $ctrl.openComponentModal = function () {
                var modalInstance = $uibModal.open({
                    animation: $ctrl.animationsEnabled,
                    component: 'modalComponent',
                    resolve: {
                        items: function () {
                            return $ctrl.items;
                        }
                    }
                });

                modalInstance.result.then(function (selectedItem) {
                    $ctrl.selected = selectedItem;
                }, function () {
                    $log.info('modal-component dismissed at: ' + new Date());
                });
            };

            $ctrl.toggleAnimation = function () {
                $ctrl.animationsEnabled = !$ctrl.animationsEnabled;
            };
        }
    ]
).controller(
    'ModalInstanceCtrl',
    ['$uibModalInstance', 'items', function ($uibModalInstance, items) {
        var $ctrl = this;
        $ctrl.items = items;
        $ctrl.selected = {
            item: $ctrl.items[0]
        };

        $ctrl.ok = function () {
            $uibModalInstance.close($ctrl.selected.item);
        };

        $ctrl.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }]
).component(
    'modalComponent', {
        templateUrl: 'myModalContent.html',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&'
        },
        controller: function () {
            var $ctrl = this;

            $ctrl.$onInit = function () {
                $ctrl.items = $ctrl.resolve.items;
                $ctrl.selected = {
                    item: $ctrl.items[0]
                };
            };

            $ctrl.ok = function () {
                $ctrl.close({
                    $value: $ctrl.selected.item
                });
            };

            $ctrl.cancel = function () {
                $ctrl.dismiss({
                    $value: 'cancel'
                });
            };
        }
    }
);