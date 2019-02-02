
/*global
    msos: false,
    demo: false,
    React: false,
    createReactClass: false
*/

msos.provide("demo.widgets.controllers.tictactoe");
msos.require("ng.react");

demo.widgets.controllers.tictactoe.version = new msos.set_version(19, 1, 15);


function calculateWinner(squares) {
	"use strict";

    var lines = [
			[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
			[1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
		],
		i = 0,
		_lines$i,
		a,
		b,
		c;

    for (i = 0; i < lines.length; i++) {
        _lines$i = lines[i];
        a = _lines$i[0];
        b = _lines$i[1];
        c = _lines$i[2];

        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }

    return null;
}


angular.module(
	'demo.widgets.controllers.tictactoe',
	['ng', 'ng.react']
).controller(
	'demo.widgets.controllers.tictactoe.ctrl',
	['$scope', function ($scope) {
		"use strict";

		var temp_tt = 'demo.widgets.controllers.tictactoe.ctrl -> ';

		msos.console.debug(temp_tt + 'start.');
		// "demo.widgets.controllers.tictactoe.ctrl" isn't needed, as currently written...

		msos.console.debug(temp_tt + ' demo, $scope:', $scope);
	}]

).value(
	"tictactoe",
	function () {
		"use strict";

		function Square(props) {

			return React.createElement(
				"button", {
					className: "square",
					onClick: props.onClick
				},
				props.value
			);
		}

		var Board = function(_React$Component) {

			function Board() {
				msos._classCallCheck(this, Board);
		
				return msos._constructorReturn(this, _React$Component.apply(this, arguments));
			}

			msos._inherits(Board, _React$Component);

			Board.prototype.renderSquare = function renderSquare(i) {
				var _this2 = this;

				return React.createElement(Square, {
					value: this.props.squares[i],
					onClick: function onClick() {
						return _this2.props.onClick(i);
					}
				});
			};

			Board.prototype.render = function render() {
				return React.createElement(
					"div",
					null,
					React.createElement(
						"div", {
							className: "board-row"
						},
						this.renderSquare(0),
						this.renderSquare(1),
						this.renderSquare(2)
					),
					React.createElement(
						"div", {
							className: "board-row"
						},
						this.renderSquare(3),
						this.renderSquare(4),
						this.renderSquare(5)
					),
					React.createElement(
						"div", {
							className: "board-row"
						},
						this.renderSquare(6),
						this.renderSquare(7),
						this.renderSquare(8)
					)
				);
			};

			return Board;

		}(React.Component);

		var Game = function(_React$Component2) {

			function Game(props) {
				msos._classCallCheck(this, Game);

				var _this3 = msos._constructorReturn(this, _React$Component2.call(this, props));

				_this3.state = {
					history: [{
						squares: Array(9).fill(null)
					}],
					stepNumber: 0,
					xIsNext: true
				};
				return _this3;
			}

			msos._inherits(Game, _React$Component2);

			Game.prototype.handleClick = function handleClick(i) {
				var history = this.state.history.slice(0, this.state.stepNumber + 1),
					current = history[history.length - 1],
					squares = current.squares.slice();

				if (calculateWinner(squares) || squares[i]) {
					return;
				}

				squares[i] = this.state.xIsNext ? "X" : "O";

				this.setState({
					history: history.concat([{
						squares: squares
					}]),
					stepNumber: history.length,
					xIsNext: !this.state.xIsNext
				});
			};

			Game.prototype.jumpTo = function jumpTo(step) {
				this.setState({
					stepNumber: step,
					xIsNext: step % 2 === 0
				});
			};

			Game.prototype.render = function render() {
					var _this4 = this,
						history = this.state.history,
						current = history[this.state.stepNumber],
						winner = calculateWinner(current.squares),
						moves = history.map(
							function (step, move) {
								var desc = move ? 'Go to move #' + move : 'Go to game start';

							return React.createElement(
									"li", {
										key: move
									},
									React.createElement(
										"button", {
											className: "btn btn-info btn-sm",
											onClick: function onClick() {
												return _this4.jumpTo(move);
											}
										},
										desc
									)
								);
							}
						),
						status;

				if (winner) {
					status = "Winner: " + winner;
				} else {
					status = "Next player: " + (this.state.xIsNext ? "X" : "O");
				}

				return React.createElement(
					"div", {
						className: "game well"
					},
					React.createElement(
						"div", {
							className: "game-board"
						},
						React.createElement(Board, {
							squares: current.squares,
							onClick: function onClick(i) {
								return _this4.handleClick(i);
							}
						})
					),
					React.createElement(
						"div", {
							className: "game-info"
						},
						React.createElement(
							"div",
							null,
							status
						),
						React.createElement(
							"ol",
							null,
							moves
						)
					)
				);
			};

			return Game;

		}(React.Component);

		return createReactClass(
			{
				render: function () {
					return React.createElement(Game, null);
				}
			}
		);

	}()
).directive(
	'tictactoe',
	['reactDirective', function (reactDirective) {
		"use strict";

		return reactDirective('tictactoe');
	}]
);
