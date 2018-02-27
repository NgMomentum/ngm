
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.widgets.controllers.ngreacttable");
msos.require("ng.react");
msos.require("ng.lr.smarttable");
msos.require("ng.lr.dragndrop");

demo.widgets.controllers.ngreacttable.version = new msos.set_version(18, 1, 15);


angular.module(
	'demo.widgets.controllers.ngreacttable',
	['ng', 'ng.react']
).controller(
    'demo.widgets.controllers.ngreacttable.ctrl',
    ['$scope', function ($scope) {

		var temp_st = 'demo.widgets.controllers.ngreacttable.ctrl -> ',
			nameList = ['Pierre', 'Pol', 'Jacques', 'Robert', 'Elisa', 'Johnny', 'Richard', 'Frank'],
			familyName = ['Dupont', 'Germain', 'Delcourt', 'bjip', 'Menez', 'Smith', 'Jones', 'Washington'],
			address = ['gmail', 'yahoo', 'aol'];

		msos.console.debug(temp_st + 'start.');

		function randomDate(start, end) {
			return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
		}

        function generateRows() {
            var rows = [],
				i = 0,
				firstName,
				lastName,
				addr,
				birthDate,
				email,
				balance;

            for (i = 0; i < 200; i += 1) {

				firstName = nameList[Math.floor(Math.random() * 8)];
				lastName = familyName[Math.floor(Math.random() * 8)];
				addr = address[Math.floor(Math.random() * 3)];
				birthDate = randomDate(new Date(2012, 0, 1), new Date());
				email = firstName + lastName + '@' + addr + '.com';
				balance = Math.random() * 3000;

                rows.push([
                    String(firstName),
                    String(lastName),
                    String(email),
                    String(balance),
                    String(birthDate)
                ]);
            }

            return rows;
        }

        $scope.table = {
            cols: ['First Name', 'Last Name', 'Email', 'Balance', 'Birthday'],
            rows: generateRows()
        };

        $scope.regenerate = function () {
            $scope.table.rows = generateRows();
        };

		msos.console.debug(temp_st + ' done!');
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
					{
						key: 'body',
						className: 'table table-striped'
					},
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


/*
 *
angular.module(
	'demo.widgets.controllers.ngreacttable',
	['ng', 'ng.react', 'ng.lr.smarttable', 'ng.lr.dragndrop']
).controller(
	'demo.widgets.controllers.ngreacttable.ctrl',
	['$scope', function ($scope) {
		"use strict";

		var temp_nt = 'demo.widgets.controllers.ngreacttable.ctrl -> ',
			nameList = ['Pierre', 'Pol', 'Jacques', 'Robert', 'Elisa', 'Johnny', 'Richard', 'Frank'],
			familyName = ['Dupont', 'Germain', 'Delcourt', 'bjip', 'Menez', 'Smith', 'Jones', 'Washington'],
			address = ['gmail', 'yahoo', 'aol'];

		msos.console.debug(temp_nt + 'start.');

		$scope.isLoading = false;
		$scope.rowCollection = [];

		function randomDate(start, end) {
			return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
		}

		function createRandomItem() {
			var firstName = nameList[Math.floor(Math.random() * 8)],
				lastName = familyName[Math.floor(Math.random() * 8)],
				addr = address[Math.floor(Math.random() * 3)],
				birthDate = randomDate(new Date(2012, 0, 1), new Date()),
				email = firstName + lastName + '@' + addr + '.com',
				balance = Math.random() * 3000,
				output_array;

				output_array = [firstName, lastName, birthDate, balance, email];
			return output_array;
		}

        function generateRows() {
            var rows = [],
				i = 0;

            for (i = 0; i < 200; i += 1) {
                rows.push(createRandomItem());
            }

            return rows;
        }

        $scope.table = {
			cols: ['firstName', 'lastName', 'birthDate', 'balance', 'email'],
            rows: generateRows()
        };

        $scope.regenerate = function () {
            $scope.table.rows = generateRows();
        };

		msos.console.debug(temp_nt + ' done!');
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
					),
					body = React.createElement(
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
					{ key: 'body', className: 'ngreact-table' },
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


		$scope.columns = ['firstName', 'lastName', 'birthDate', 'balance', 'email', 'utils'];

		for (i = 0; i < 150; i += 1) {
			$scope.rowCollection.push(createRandomItem());
		}

		$scope.predicates = ['firstName', 'lastName', 'birthDate'];
		$scope.selectedPredicate = $scope.predicates[0];

		//add to the real data holder
		$scope.addRandomItem = function addRandomItem() {
			$scope.rowCollection.push(generateRandomItem(id));
			id += 1;
		};

		//remove to the real data holder
		$scope.removeItem = function removeItem(row) {
			var index = $scope.rowCollection.indexOf(row);

			if (index !== -1) {
				$scope.rowCollection.splice(index, 1);
			}
		};

		$scope.itemsByPage = 15;
*/
