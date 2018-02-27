
var app = angular.module('app', ['ng', 'ng.react']);

app.controller(
    'mainCtrl',
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
);

app.value(
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
);

app.directive(
    'myTable',
    ['reactDirective', function (reactDirective) {
      return reactDirective('MyTable');
    }]
);
