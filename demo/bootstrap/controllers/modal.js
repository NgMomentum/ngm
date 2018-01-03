
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.bootstrap.controllers.modal");
msos.require("ng.bootstrap.ui.modal");


demo.bootstrap.controllers.modal.version = new msos.set_version(17, 11, 25);

angular.module(
    'demo.bootstrap.controllers.modal',
    ['ng', 'ngAnimate', 'ng.sanitize', 'ng.bootstrap.ui.modal']
).controller(
    'demo.bootstrap.controllers.modal.ctrl',
    ['$uibModal', '$log', '$document', 'items',
        function ($uibModal, $log, $document, items) {
            "use strict";

            var $ctrl = this;

            $ctrl.items = items;

            $ctrl.animationsEnabled = true;

            msos.console.info('demo.bootstrap.controllers.modal.ctrl -> called, $ctrl:', $ctrl);

            $ctrl.open = function (size, parentSelector) {
    
                msos.console.info('demo.bootstrap.controllers.modal.ctrl - $ctrl.open -> called.');

                var parentElem = parentSelector ? angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined,
                    modalInstance = $uibModal.open(
                        {
                            animation: $ctrl.animationsEnabled,
                            ariaLabelledBy: 'modal-title',
                            ariaDescribedBy: 'modal-body',
                            templateUrl: 'myModalContent.html',
                            controller: 'ModalInstanceCtrl',
                            controllerAs: '$ctrl',
                            size: size,
                            appendTo: parentElem,
                            resolve: {
                                items: function () {
                                    return $ctrl.items;
                                }
                            }
                        }
                    );

                modalInstance.result.then(
                    function open_modal_resolve(selectedItem) {
                        msos.console.info('demo.bootstrap.controllers.modal.ctrl - $ctrl.open -> modal selectedItem: ' + selectedItem);
                        $ctrl.selected = selectedItem;
                    }, function open_modal_reject() {
                        msos.console.warn('demo.bootstrap.controllers.modal.ctrl - $ctrl.open -> modal dismissed at: ' + new Date());
                    }
                );
            };

            $ctrl.openComponentModal = function () {
                var modalInstance = $uibModal.open(
                        {
                            animation: $ctrl.animationsEnabled,
                            component: 'modalComponent',
                            resolve: {
                                items: function () {
                                    return $ctrl.items;
                                }
                            }
                        }
                    );

                modalInstance.result.then(
                    function open_comp_modal_resolve(selectedItem) {
                        msos.console.info('demo.bootstrap.controllers.modal.ctrl -> modal-component selectedItem: ' + selectedItem);
                        $ctrl.selected = selectedItem;
                    },
                    function open_comp_modal_reject() {
                        msos.console.warn('demo.bootstrap.controllers.modal.ctrl -> modal-component dismissed at: ' + new Date());
                    }
                );
            };

            $ctrl.openMultipleModals = function () {

                $uibModal.open(
                    {
                        animation: $ctrl.animationsEnabled,
                        ariaLabelledBy: 'modal-title-bottom',
                        ariaDescribedBy: 'modal-body-bottom',
                        templateUrl: 'stackedModal.html',
                        size: 'sm',
                        controller: ['$scope', function ($scope) {
                            $scope.name = 'bottom';  
                        }]
                    }
                );

                $uibModal.open(
                    {
                        animation: $ctrl.animationsEnabled,
                        ariaLabelledBy: 'modal-title-top',
                        ariaDescribedBy: 'modal-body-top',
                        templateUrl: 'stackedModal.html',
                        size: 'sm',
                        controller: ['$scope', function ($scope) {
                            $scope.name = 'top';  
                        }]
                    }
                );
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

        msos.console.info('demo.bootstrap.controllers.modal - ModalInstanceCtrl -> called, $ctrl:', $ctrl);

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
).value(
    'items',
    ['item1', 'item2', 'item3']
);