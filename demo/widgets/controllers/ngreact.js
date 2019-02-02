
/*global
    msos: false,
    angular: false,
    demo: false,
    createReactClass: false,
    PropTypes: false
*/

msos.provide("demo.widgets.controllers.ngreact");
msos.require("ng.react");

demo.widgets.controllers.ngreact.version = new msos.set_version(19, 1, 15);


angular.module(
	'demo.widgets.controllers.ngreact',
	['ng', 'ng.react']
).controller(
	'demo.widgets.controllers.ngreact.ctrl',
	['$scope', function ($scope) {

		function generateRows() {
			var rows = [];
			for (var i = 0; i < 2000; i++) {
				var d = new Date();
				rows.push([
					'First Name ' + i,
					'Last Name ' + i,
					'name' + i + '@domain.com',
					'@name' + i,
					i + '-' + i,
					d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
				]);
			}

			return rows;
		}

		$scope.table = {
			cols: ['First Name', 'Last Name', 'Email', 'Twitter', 'Id', 'Modified'],
			rows: generateRows()
		};

		$scope.regenerate = function () {
			$scope.table.rows = generateRows();
		};

	}]
).value(
	"MyTable",
	createReactClass(
		{
			propTypes: {
				table: PropTypes.object.isRequired
			},
			getDefaultProps: function () {
				return {
					table: {
						rows: [],
						cols: []
					}
				};
			},
			render: function () {
				var cols = this.props.table.cols.map(
						function (col, i) {
							return React.createElement(
								'th',
								{ key: i },
								col
							);
						}
					),
					header = React.createElement(
						'thead',
						{ key: 'table' },
						React.createElement(
							'tr',
							{ key: 'header' },
							cols
						)
					);

				var body = React.createElement(
						'tbody',
						{ key: 'thead' },
						this.props.table.rows.map(
							function (row, i) {
								return React.createElement(
									'tr',
									{ key: i },
									row.map(
										function (cell, j) {
											return React.createElement(
												'td',
												{ key: j },
												cell
											);
										}
									)
								);
							}
						)
					);

				return React.createElement(
					'table',
					{ key: 'body', className: 'pure-table' },
					[header, body]
				);
			}
		}
	)
).directive(
	'myTable',
	['reactDirective', function (reactDirective) {
	  return reactDirective('MyTable');
	}]
);
