
var app = angular.module('app', ['react']);

app.controller(
	'mainCtrl',
	['$scope', function ($scope) {
		$scope.person = {
			fname: 'Clark',
			lname: 'Kent'
		};
	}]
);

app.filter(
	'hero',
	function () {
		return function (person) {
			if (person.fname === 'Clark' && person.lname === 'Kent') {
				return 'Superman';
			}
			return person.fname + ' ' + person.lname;
		};
	}
);

app.factory(
	"Hello",
	['$filter', function ($filter) {
		return createReactClass({
			propTypes: {
				person: PropTypes.object.isRequired,
			},
	
			render: function () {
				return React.createElement(
					"span",
					null,
					'Hello ' + $filter('hero')(this.props.person)
				);
			}
		});
	}]
);

app.directive(
	'hello',
	['reactDirective', function (reactDirective) {
		return reactDirective('Hello');
	}]
);
