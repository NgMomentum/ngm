
msos.provide("demo.chartjs.bubble");
msos.require("ng.chart");

demo.chartjs.bubble.version = new msos.set_version(19, 1, 17);


msos.onload_func_done.push(
	function () {
		"use strict";

		angular.module(
			'demo.chartjs.bubble',
			['ng', 'ng.chart']
		).config(
			['ChartJsProvider', function (ChartJsProvider) {

				ChartJsProvider.setOptions({
					tooltips: {
						enabled: false
					}
				});
			}]
		).controller(
			'demo.chartjs.bubble.ctrl',
			['$scope', '$interval', function ($scope, $interval) {

				$scope.options = {
					scales: {
						xAxes: [{
							display: false,
							ticks: {
								max: 125,
								min: -125,
								stepSize: 10
							}
						}],
						yAxes: [{
							display: false,
							ticks: {
								max: 125,
								min: -125,
								stepSize: 10
							}
						}]
					}
				};

				createChart();
				$interval(createChart, 3000);

				function createChart() {
					$scope.series = [];
					$scope.data = [];
					for (var i = 0; i < 50; i++) {
						$scope.series.push(`Series ${i}`);
						$scope.data.push([{
							x: randomScalingFactor(),
							y: randomScalingFactor(),
							r: randomRadius()
						}]);
					}
				}

				function randomScalingFactor() {
					return (Math.random() > 0.5 ? 1.0 : -1.0) * Math.round(Math.random() * 100);
				}

				function randomRadius() {
					return Math.abs(randomScalingFactor()) / 4;
				}
			}]
		);

		angular.bootstrap('body', ['demo.chartjs.bubble']);
	}
);