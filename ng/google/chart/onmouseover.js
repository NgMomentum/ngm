
msos.provide("ng.google.chart.onmouseover");

ng.google.chart.onmouseover.version = new msos.set_version(16, 5, 6);


(function(){
    angular.module('ng.google.chart.onmouseover')
        .directive('agcOnMouseover', agcOnMouseoverDirective);
    
    function agcOnMouseoverDirective(){
        return {
            restrict: 'A',
            scope: false,
            require: 'googleChart',
            link: function(scope, element, attrs, googleChartController){
                callback.$inject = ['args', 'chart', 'chartWrapper'];
                function callback(args, chart, chartWrapper){
                    var returnParams = {
                        chartWrapper: chartWrapper,
                        chart: chart,
                        args: args,
                        column: args[0].column,
                        row: args[0].row
                    };
                    scope.$apply(function () {
                        scope.$eval(attrs.agcOnMouseover, returnParams);
                    });
                }
                googleChartController.registerChartListener('onmouseover', callback, this);
            }
        };
    }
})();