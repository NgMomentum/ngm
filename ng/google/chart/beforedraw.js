
msos.provide("ng.google.chart.beforedraw");

ng.google.chart.beforedraw.version = new msos.set_version(16, 5, 6);


(function(){
    angular.module('ng.google.chart.beforedraw')
        .directive('agcBeforeDraw', onReadyDirective);
        
    function onReadyDirective(){
        return {
            restrict: 'A',
            scope: false,
            require: 'googleChart',
            link: function(scope, element, attrs, googleChartController){
                callback.$inject=['chartWrapper'];
                function callback(chartWrapper){
                    scope.$apply(function (){
                        scope.$eval(attrs.agcBeforeDraw, {chartWrapper: chartWrapper});
                    });
                }
                googleChartController.registerServiceListener('beforeDraw', callback, this);
            }
        };
    }
})();