
var app = angular.module('app', ['ng.react']);

function MainController() {
    this.person = {
        fname: 'Clark',
        lname: 'Kent'
    };
}

app.controller('mainCtrl', MainController);

var app_react_class = createReactClass({
    propTypes: {
        fname: PropTypes.string.isRequired,
        lname: PropTypes.string.isRequired
    },

    render: function () {
        return (React.createElement(
						"span",
						null,
						'Hello ' + this.props.fname + ' ' + this.props.lname,
						"!"
					));
	}
});

var Hello = React.createFactory(app_react_class);

app.value('Hello', Hello);

app.directive(
	'hello',
	['reactDirective', function (reactDirective) {
		return reactDirective(Hello);
	}]
);