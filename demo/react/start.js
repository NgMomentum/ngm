
msos.onload_functions.push(
	function () {
		"use strict";

		var AppLayout = function (_React$Component) {

			msos._inherits(Layout, _React$Component);

			function Layout(props) {
				msos._classCallCheck(this, Layout);
		
				return msos._constructorReturn(this, (Object.getPrototypeOf(Layout)).call(this, props));
			}

			msos._createClass(Layout, [{
				key: "componentWillMount",
				value: function componentWillMount() {
					console.log("Component mounting");
				}
			}, {
				key: "render",
				value: function render() {
					var _this2 = this;

					return React.createElement(
						"div",
						null,
						React.createElement(
							"h1",
							null,
							"React TO-DO"
						),
						React.createElement(
							"ul",
							null,
							this.props.todos.map(function (todo, key) {
								return React.createElement(
									"li",
									{ key: key, onClick: function onClick() {
											_this2.props.markComplete(todo);
										}, className: ["list-item", todo.done === true ? "done-true" : "done-false"].join(" ") },
									todo.text
								);
							})
						),
						React.createElement(
							"button",
							{ id: "click", onClick: function onClick() {
									_this2.props.newItem("Alter triggered from React but Fired from AngularJS");
								} },
							"Click to make Angular Alert!!"
						)
					);
				}
			}]);

			return Layout;

		}(React.Component);

		angular.module(
			'app',
			['ng']
		).directive(
			'reactToDo',
			function reactToDoDir() {
				return {
					scope: {
						todos: '=',
						markComplete:'&'
					},
					link: function (scope, el) {
		
						scope.newItem = function (value) {alert (value); };
		
						scope.$watch(
							'todos',
							function (newValue) {
								ReactDOM.render(
									React.createElement(
										AppLayout,
										{ todos: newValue, newItem: scope.newItem, markComplete: scope.markComplete }
									),
									el[0]
								);
							},
							true
						);
					}
				};
			}
		).controller(
			'TodoCtrl',
			function ($scope) {

				$scope.todos = [
					{ text: 'learn angular', done:false },
					{ text: 'build an angular app', done:false }
				];

				$scope.addTodo = function () {
					$scope.todos.push({ text:$scope.todoText, done:false });
					$scope.todoText = '';
				};

				$scope.remaining = function () {
					var count = 0;

					angular.forEach(
						$scope.todos,
						function(todo) { count += todo.done ? 0 : 1; }
					);

					return count;
				};

				$scope.markItemCompleted = function (todoText) {
					var index = $scope.todos.findIndex(
							function (item) { return (item.text === todoText); }
						);

					console.log(index);
					$scope.todos[index].done = !$scope.todos[index].done;
					$scope.$apply();
				};
			}
		);

		angular.bootstrap('body', ['app']);
	}
);
