
msos.provide("ng.google.chart.onready");

ng.google.chart.onready.version = new msos.set_version(16, 5, 6);


(function(){
    angular.module('ng.google.chart.onready')
        .directive('agcOnReady', onReadyDirective);
        
    function onReadyDirective(){
        return {
            restrict: 'A',
            scope: false,
            require: 'googleChart',
            link: function(scope, element, attrs, googleChartController){
                callback.$inject=['chartWrapper'];
                function callback(chartWrapper){
                    scope.$apply(function (){
                        scope.$eval(attrs.agcOnReady, {chartWrapper: chartWrapper});
                    });
                }
                googleChartController.registerWrapperListener('ready', callback, this);
            }
        };
    }
})();