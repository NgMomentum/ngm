
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.widgets.controllers.localstorage");
msos.require('ng.util.localstorage');

demo.widgets.controllers.localstorage.version = new msos.set_version(18, 1, 13);


angular.module(
    'demo.widgets.controllers.localstorage',
	['ng', 'ng.util.localstorage']
).config(
    [
        'localStorageServiceProvider',
        function (localStorageServiceProvider) {
            localStorageServiceProvider.setPrefix('demoPrefix');
        }
    ]
).controller(
    'demo.widgets.controllers.localstorage.ctrl',
    [
        '$scope',
        'localStorageService',
        function ($scope, localStorageService) {

            $scope.$watch(
                'localStorageDemo',
                function (value) {
                    localStorageService.set('localStorageDemo', value);
                    $scope.localStorageDemoValue = localStorageService.get('localStorageDemo');
                }
            );

            $scope.storageType = 'Local storage';

            if (localStorageService.getStorageType().indexOf('session') >= 0) {
                $scope.storageType = 'Session storage';
            }

            if (!localStorageService.isSupported) {
                $scope.storageType = 'Cookie';
            }
        }
    ]
);
