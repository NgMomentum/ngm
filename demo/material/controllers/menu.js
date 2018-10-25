
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.menu");
msos.require("ng.material.ui.menu");
msos.require("ng.material.ui.icon");
msos.require("ng.material.ui.dialog");
msos.require("ng.material.ui.button");		// ref. template
msos.require("ng.material.ui.layout");		// ref. template

demo.material.controllers.menu.version = new msos.set_version(18, 7, 23);


function DemoCtrl1($mdDialog) {
	"use strict";

	var originatorEv;

	this.openMenu = function ($mdMenu, ev) {
		originatorEv = ev;
		$mdMenu.open();
    };

	this.notificationsEnabled = true;
	this.toggleNotifications = function () {
		this.notificationsEnabled = !this.notificationsEnabled;
	};

	this.redial = function () {
		$mdDialog.show(
			$mdDialog.alert()
			.targetEvent(originatorEv)
			.clickOutsideToClose(true)
			.parent('body')
			.title('Suddenly, a redial')
			.textContent('You just called a friend; who told you the most amazing story. Have a cookie!')
			.ok('That was easy')
		);

		originatorEv = null;
	};

	this.checkVoicemail = function () {
		msos.console.info('demo.material.controllers.menu - DemoCtrl - checkVoicemail -> called.');
	};
}

function DemoCtrl2($mdDialog) {
	"use strict";

    var originatorEv;

    this.menuHref = "http://www.google.com/design/spec/components/menus.html#menus-specs";

    this.openMenu = function ($mdMenu, ev) {
      originatorEv = ev;
      $mdMenu.open(ev);
    };

    this.announceClick = function (index) {
		$mdDialog.show(
			$mdDialog.alert()
				.title('You clicked!')
				.textContent('You clicked the menu item at index ' + index)
				.ok('Nice')
				.targetEvent(originatorEv)
		);

		originatorEv = null;
    };
}

function WidthDemoCtrl($mdDialog) {
	"use strict";

	this.announceClick = function (index) {
		$mdDialog.show(
			$mdDialog.alert()
				.title('You clicked!')
				.textContent('You clicked the menu item at index ' + index)
				.ok('Nice')
		);
	};
}


angular.module(
	'demo.material.controllers.menu',
	['ng', 'ng.material.ui.menu', 'ng.material.ui.dialog', 'ng.material.ui.icon']
).config(
	['$mdIconProvider', function ($mdIconProvider) {
		"use strict";

        $mdIconProvider
            .iconSet(
				"call",
				msos.resource_url('demo', 'material/img/icons/sets/communication-icons.svg'),
				24
			).iconSet(
				"social",
				msos.resource_url('demo', 'material/img/icons/sets/social-icons.svg'),
				24
			);
    }]
).controller(
	'demo.material.controllers.menu.ctrl1',
	['$mdDialog', DemoCtrl1]
).controller(
	'demo.material.controllers.menu.ctrl2',
	['$mdDialog', DemoCtrl2]
).controller(
	'demo.material.controllers.menu.ctrl3',
	['$mdDialog', WidthDemoCtrl]
);
