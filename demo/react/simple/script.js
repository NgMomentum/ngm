angular.module(
    'app',
	['ng']
).service(
	'PicsService',
	['$interval', function ($interval) {
		var _this = this;

		this.data = {
			counter: 0
		};

		$interval(
			function () {
				return _this.data.counter += 1;
			},
			Math.random() * 200 + 100
		);

	}]
).factory(
	'Pic',
	function () {
		return React.createClass({
			render: function render() {
				return React.createElement('h2', {}, "ReactJS is here! ", this.props.counter);
			}
		});
	}
).directive(
	'react',
	['$injector', function ($injector) {
		return {
			template: '<div></div>',
			link: function link(scope, element, attrs) {
				var component = $injector.get(attrs.react);
				var react = function react(counter) {
					return React.render(React.createElement(component, {
						counter: counter
					}), element[0]);
				};

				scope.$watch(attrs.counter, react);
			}
		};
	}]
).directive(
	'pics',
	['PicsService', function (PicsService) {
		return {
			controller: ['$scope', function controller($scope) {
				$scope.data = PicsService.data;
			}],
			template: '<div><h2>AngularJS is here! {{ data.counter }}</h2><div class="inside" react="Pic" counter="data.counter">inside</div></div>'
		};
	}]
);