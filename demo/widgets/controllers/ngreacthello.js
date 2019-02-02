
/*global
    msos: false,
    angular: false,
    demo: false,
    PropTypes: false,
    createReactClass: false
*/

msos.provide("demo.widgets.controllers.ngreacthello");
msos.require("ng.react");

demo.widgets.controllers.ngreacthello.version = new msos.set_version(19, 1, 15);


(function () {
	"use strict";

	var demo_reactclass = createReactClass({
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
					)
				);
		}
	});

	var demo_factory = React.createFactory(
		demo_reactclass
	);

	angular.module(
		'demo.widgets.controllers.ngreacthello',
		['ng', 'ng.react']
	).controller(
		'demo.widgets.controllers.ngreacthello.ctrl',
		function MainController() {
			this.person = {
				fname: 'Clark',
				lname: 'Kent'
			};
		}
	).value(
		'Hello',
		demo_factory
	).directive(
		'hello',
		['reactDirective', function (reactDirective) {
			return reactDirective(demo_factory);
		}]
	);

}());