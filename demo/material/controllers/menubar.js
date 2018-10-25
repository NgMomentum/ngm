
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.menubar");
msos.require("ng.material.ui.menu");
msos.require("ng.material.ui.icon");
msos.require("ng.material.ui.dialog");
msos.require("ng.material.ui.button");		// ref. template
msos.require("ng.material.ui.card");		// ref. template
msos.require("ng.material.ui.layout");		// ref. template
msos.require("ng.material.ui.toolbar");		// ref. template
msos.require("ng.material.ui.content");		// ref. template

demo.material.controllers.menubar.version = new msos.set_version(18, 7, 23);


function DemoCtrl1($mdDialog) {
	"use strict";

	this.settings = {
		printLayout: true,
		showRuler: true,
		showSpellingSuggestions: true,
		presentationMode: 'edit'
	};

	this.sampleAction = function (name, ev) {
		$mdDialog.show(
			$mdDialog.alert()
				.title(name)
				.textContent('You triggered the "' + name + '" action')
				.ok('Great')
				.targetEvent(ev)
		);
	};
}

function DemoCtrl2() {
	"use strict";

	this.organizations = [{
			department: 'Sales',
			managers: [{
					name: 'Jane',
					reports: [{
							name: 'Rick'
						},
						{
							name: 'Joan'
						},
						{
							name: 'Ron'
						}
					]
				},
				{
					name: 'Jim',
					reports: [{
							name: 'Bob'
						},
						{
							name: 'Sandra'
						},
						{
							name: 'Juan'
						}
					]
				}
			]
		},
		{
			department: 'Engineering',
			managers: [{
					name: 'Janet',
					reports: [{
							name: 'Betty'
						},
						{
							name: 'Corrie'
						},
						{
							name: 'Carlos'
						}
					]
				},
				{
					name: 'Randy',
					reports: [{
							name: 'Julia'
						},
						{
							name: 'Matt'
						},
						{
							name: 'Kara'
						}
					]
				}
			]
		},
		{
			department: 'Marketing',
			managers: [{
					name: 'Peggy',
					reports: [{
							name: 'Dwight'
						},
						{
							name: 'Pam'
						},
						{
							name: 'Jeremy'
						}
					]
				},
				{
					name: 'Andrew',
					reports: [{
							name: 'Stephen'
						},
						{
							name: 'Naomi'
						},
						{
							name: 'Erin'
						}
					]
				}
			]
		}
	];

	this.onClick = function onClick(item) {
		msos.console.info('demo.material.controllers.menubar - DemoCtrl2 - onClick -> item:', item);
	};
}


angular.module(
	'demo.material.controllers.menubar',
	['ng', 'ng.material.ui.menu', 'ng.material.ui.dialog', 'ng.material.ui.icon']
).config(
	['$mdIconProvider', function ($mdIconProvider) {
		"use strict";

		$mdIconProvider
			.iconSet(
				"communication",
				msos.resource_url('demo', 'material/img/icons/sets/communication-icons.svg'),
				24
			).defaultIconSet(
				msos.resource_url('demo', 'material/img/icons/sets/core-icons.svg'),
				24
			);
    }]
).filter(
	'keyboardShortcut',
	['$window', function ($window) {
		"use strict";

        return function (str) {

            if (!str) { return; }

            var keys = str.split('-'),
				isOSX = /Mac OS X/.test($window.navigator.userAgent),
				separator = (!isOSX || keys.length > 2) ? '+' : '',
				abbreviations = {
					M: isOSX ? '⌘' : 'Ctrl',
					A: isOSX ? 'Option' : 'Alt',
					S: 'Shift'
				};

            return keys.map(
					function (key, index) {
						var last = index === keys.length - 1;

						return last ? key : abbreviations[key];
					}
				).join(separator);
        };
    }]
).controller(
	'demo.material.controllers.menubar.ctrl1',
	['$mdDialog', DemoCtrl1]
).controller(
	'demo.material.controllers.menubar.ctrl2',
	DemoCtrl2
);
