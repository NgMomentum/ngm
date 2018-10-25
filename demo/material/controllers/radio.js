
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.radio");
msos.require("ng.material.ui.radio");
msos.require("ng.material.ui.icon");
msos.require("ng.material.ui.button");		// ref. template
msos.require("ng.material.ui.layout");		// ref. template
msos.require("ng.material.ui.divider");		// ref. template

demo.material.controllers.radio.version = new msos.set_version(18, 6, 23);


angular.module(
    'demo.material.controllers.radio',
    [
        'ng',
        'ng.material.ui.icon'
    ]
).controller(
    'demo.material.controllers.radio.ctrl1',
    ['$scope', function ($scope) {
        "use strict";

        $scope.data = {
            group1: 'Banana',
            group2: '2',
            group3: 'avatar-1'
        };

        $scope.avatarData = [{
            id: "avatars:svg-1",
            title: 'avatar 1',
            value: 'avatar-1'
        }, {
            id: "avatars:svg-2",
            title: 'avatar 2',
            value: 'avatar-2'
        }, {
            id: "avatars:svg-3",
            title: 'avatar 3',
            value: 'avatar-3'
        }];

        $scope.radioData = [{
                label: '1',
                value: 1
            },
            {
                label: '2',
                value: 2
            },
            {
                label: '3',
                value: '3',
                isDisabled: true
            },
            {
                label: '4',
                value: '4'
            }
        ];

        $scope.submit = function () {
            alert('submit');
        };

        $scope.addItem = function () {
            var r = Math.ceil(Math.random() * 1000);
            $scope.radioData.push({
                label: r,
                value: r
            });
        };

        $scope.removeItem = function () {
            $scope.radioData.pop();
        };

    }]
).controller(
	'demo.material.controllers.radio.ctrl2',
	['$scope', '$filter', function ($scope, $filter) {
		"use strict";

		var self = this;

		self.contacts = [{
			'id': 1,
			'fullName': 'Maria Guadalupe',
			'lastName': 'Guadalupe',
			'title': "CEO, Found"
		}, {
			'id': 2,
			'fullName': 'Gabriel García Marquéz',
			'lastName': 'Marquéz',
			'title': "VP Sales & Marketing"
		}, {
			'id': 3,
			'fullName': 'Miguel de Cervantes',
			'lastName': 'Cervantes',
			'title': "Manager, Operations"
		}, {
			'id': 4,
			'fullName': 'Pacorro de Castel',
			'lastName': 'Castel',
			'title': "Security"
		}];

		self.selectedId = 2;
		self.selectedUser = function () {
			return $filter('filter')(self.contacts, { id: self.selectedId })[0].lastName;
		};
  }]
).config(
    ['$mdIconProvider', function ($mdIconProvider) {
        "use strict";

        $mdIconProvider.iconSet(
			"avatars",
			msos.resource_url('demo', 'material/img/icons/avatar-icons.svg'),
			128
		);
    }]
);