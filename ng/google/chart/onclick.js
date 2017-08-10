
msos.provide("ng.google.chart.onclick");

ng.google.chart.onclick.version = new msos.set_version(16, 5, 6);


(function(){
    angular.module('ng.google.chart.onclick')
        .directive('agcOnClick', onClickDirective);

    function onClickDirective(){
        return {
            restrict: 'A',
            scope: false,
            require: 'googleChart',
            link: function(scope, element, attrs, googleChartController){
                callback.$inject = ['args', 'chart', 'chartWrapper'];
                function callback(args, chart, chartWrapper){
                    scope.$apply(function (){
                        scope.$eval(attrs.agcOnClick, {args: args, chart: chart, chartWrapper: chartWrapper});
                    });
                }
                googleChartController.registerChartListener('click', callback, this);
            }
        };
    }
})();
