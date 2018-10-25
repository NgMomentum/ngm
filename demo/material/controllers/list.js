
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.list");
msos.require("ng.material.ui.list");		// ref template
msos.require("ng.material.ui.icon");
msos.require("ng.material.ui.dialog");
msos.require("ng.material.ui.layout");		// ref template
msos.require("ng.material.ui.button");		// ref template
msos.require("ng.material.ui.checkbox");	// ref template
msos.require("ng.material.ui.content");		// ref template
msos.require("ng.material.ui.subheader");	// ref template
msos.require("ng.material.ui.toolbar");		// ref template
msos.require("ng.material.ui.divider");		// ref template
msos.require("ng.material.ui.menu");		// ref template
msos.require("ng.material.ui.switch");		// ref template

demo.material.controllers.list.version = new msos.set_version(18, 7, 26);


angular.module(
	'demo.material.controllers.list',
	['ng', 'ng.material.ui.icon', 'ng.material.ui.dialog']
).config(
	['$mdIconProvider', function ($mdIconProvider) {
		"use strict";

        $mdIconProvider
            .iconSet(
				'social',
				msos.resource_url('demo', 'material/img/icons/sets/social-icons.svg'),
				24
			).iconSet(
				'device',
				msos.resource_url('demo', 'material/img/icons/sets/device-icons.svg'),
				24
			).iconSet(
				'communication',
				msos.resource_url('demo', 'material/img/icons/sets/communication-icons.svg'),
				24
			).defaultIconSet(
				msos.resource_url('demo', 'material/img/icons/sets/core-icons.svg'),
				24
			);
    }]
).controller(
	'demo.material.controllers.list.ctrl1',
	['$scope', function demo_list_ctrl1($scope) {
		"use strict";

        var imagePath = msos.resource_url('demo', 'material/img/60.jpeg');

        $scope.phones = [{
                type: 'Home',
                number: '(555) 251-1234',
                options: {
                    icon: 'communication:phone'
                }
            },
            {
                type: 'Cell',
                number: '(555) 786-9841',
                options: {
                    icon: 'communication:phone',
                    avatarIcon: true
                }
            },
            {
                type: 'Office',
                number: '(555) 314-1592',
                options: {
                    face: imagePath
                }
            },
            {
                type: 'Offset',
                number: '(555) 192-2010',
                options: {
                    offset: true,
                    actionIcon: 'communication:phone'
                }
            }
        ];
        $scope.todos = [{
                face: imagePath,
                what: 'Brunch this weekend?',
                who: 'Min Li Chan',
                when: '3:08PM',
                notes: " I'll be in your neighborhood doing errands"
            },
            {
                face: imagePath,
                what: 'Brunch this weekend?',
                who: 'Min Li Chan',
                when: '3:08PM',
                notes: " I'll be in your neighborhood doing errands"
            },
            {
                face: imagePath,
                what: 'Brunch this weekend?',
                who: 'Min Li Chan',
                when: '3:08PM',
                notes: " I'll be in your neighborhood doing errands"
            },
            {
                face: imagePath,
                what: 'Brunch this weekend?',
                who: 'Min Li Chan',
                when: '3:08PM',
                notes: " I'll be in your neighborhood doing errands"
            },
            {
                face: imagePath,
                what: 'Brunch this weekend?',
                who: 'Min Li Chan',
                when: '3:08PM',
                notes: " I'll be in your neighborhood doing errands"
            },
        ];
    }]
).controller(
	'demo.material.controllers.list.ctrl2',
	['$scope', '$mdDialog', function demo_list_ctrl2($scope, $mdDialog) {
		"use strict";

		var icon_base_uri = msos.resource_url('demo', 'material');

        $scope.toppings = [{
                name: 'Pepperoni',
                wanted: true
            },
            {
                name: 'Sausage',
                wanted: false
            },
            {
                name: 'Black Olives',
                wanted: true
            },
            {
                name: 'Green Peppers',
                wanted: false
            }
        ];

        $scope.settings = [{
                name: 'Wi-Fi',
                extraScreen: 'Wi-fi menu',
                icon: 'device:network-wifi',
                enabled: true
            },
            {
                name: 'Bluetooth',
                extraScreen: 'Bluetooth menu',
                icon: 'device:bluetooth',
                enabled: false
            },
        ];

        $scope.messages = [{
                id: 1,
                title: "Message A",
                selected: false
            },
            {
                id: 2,
                title: "Message B",
                selected: true
            },
            {
                id: 3,
                title: "Message C",
                selected: true
            },
        ];

        $scope.people = [{
                name: 'Janet Perkins',
                img: icon_base_uri + '/img/100-0.jpeg',
                newMessage: true
            },
            {
                name: 'Mary Johnson',
                img: icon_base_uri + '/img/100-1.jpeg',
                newMessage: false
            },
            {
                name: 'Peter Carlsson',
                img: icon_base_uri + '/img/100-2.jpeg',
                newMessage: false
            }
        ];

        $scope.goToPerson = function (person, event) {
            $mdDialog.show(
                $mdDialog.alert()
                .title('Navigating')
                .textContent('Inspect ' + person)
                .ariaLabel('Person inspect demo')
                .ok('Neat!')
                .targetEvent(event)
            );
        };

        $scope.navigateTo = function (to, event) {
            $mdDialog.show(
                $mdDialog.alert()
                .title('Navigating')
                .textContent('Imagine being taken to ' + to)
                .ariaLabel('Navigation demo')
                .ok('Neat!')
                .targetEvent(event)
            );
        };

        $scope.doPrimaryAction = function (event) {
            $mdDialog.show(
                $mdDialog.alert()
                .title('Primary Action')
                .textContent('Primary actions can be used for one click actions')
                .ariaLabel('Primary click demo')
                .ok('Awesome!')
                .targetEvent(event)
            );
        };

        $scope.doSecondaryAction = function (event) {
            $mdDialog.show(
                $mdDialog.alert()
                .title('Secondary Action')
                .textContent('Secondary actions can be used for one click actions')
                .ariaLabel('Secondary click demo')
                .ok('Neat!')
                .targetEvent(event)
            );
        };

    }]
);
