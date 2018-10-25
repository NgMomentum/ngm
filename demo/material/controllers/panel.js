
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.panel");
msos.require("ng.material.core.autofocus");	// ref. templates
msos.require("ng.material.ui.panel");
msos.require("ng.material.ui.aria");
msos.require("ng.material.ui.icon");		// ref. templates
msos.require("ng.material.ui.content");		// ref. templates
msos.require("ng.material.ui.divider");		// ref. templates
msos.require("ng.material.ui.button");		// ref. templates
msos.require("ng.material.ui.radio");		// ref. templates
msos.require("ng.material.ui.checkbox");	// ref. templates
msos.require("ng.material.ui.input");		// ref. templates
msos.require("ng.material.ui.layout");		// ref. templates
msos.require("ng.material.ui.whiteframe");	// ref. templates
msos.require("ng.material.ui.toolbar");		// ref. templates

demo.material.controllers.panel.version = new msos.set_version(18, 7, 23);


function PanelDialogCtrl(mdPanelRef) {
	"use strict";

    this._mdPanelRef = mdPanelRef;
}

PanelDialogCtrl.prototype.closeDialog = function () {
	"use strict";

    var panelRef = this._mdPanelRef;

	if (panelRef) {
		panelRef.close().then(
			function () {
				angular.element(document.querySelector('.demo-dialog-open-button')).focus();
				panelRef.destroy();
			}
		);
	}
};

function PanelMenuCtrl(mdPanelRef, $timeout) {
	"use strict";

	this._mdPanelRef = mdPanelRef;
	this.favoriteDessert = this.selected.favoriteDessert;

	$timeout(
		function demo_md_ctrl_panelmenu_to() {
			var selected = document.querySelector('.demo-menu-item.selected');

			if (selected) {
				angular.element(selected).focus();
			} else {
				angular.element(document.querySelectorAll('.demo-menu-item')[0]).focus();
			}
		},
		0,
		false
	);
}

PanelMenuCtrl.prototype.selectDessert = function (dessert) {
	"use strict";

	this.selected.favoriteDessert = dessert;

	if (this._mdPanelRef) {
		this._mdPanelRef.close().then(
			function () {
				angular.element(document.querySelector('.demo-menu-open-button')).focus();
			}
		);
	}
};

PanelMenuCtrl.prototype.onKeydown = function ($event, dessert) {
	"use strict";

	var handled, els, index, prevIndex, nextIndex;

	switch ($event.which) {
		case 38: // Up Arrow.
			els = document.querySelectorAll('.demo-menu-item');
			index = indexOf(els, document.activeElement);
			prevIndex = (index + els.length - 1) % els.length;
			els[prevIndex].focus();
			handled = true;
			break;

		case 40: // Down Arrow.
			els = document.querySelectorAll('.demo-menu-item');
			index = indexOf(els, document.activeElement);
			nextIndex = (index + 1) % els.length;
			els[nextIndex].focus();
			handled = true;
			break;

		case 13: // Enter.
		case 32: // Space.
			this.selectDessert(dessert);
			handled = true;
			break;

		case 9: // Tab.
			if (this._mdPanelRef) {
				this._mdPanelRef.close();
			}
	}

	if (handled) {
		$event.preventDefault();
		$event.stopImmediatePropagation();
	}

	function indexOf(nodeList, element) {
		var item,
			i = 0;

		for (i = 0; i <= nodeList.length; i += 1) {

			item = nodeList[i];

			if (item === element) {
				return i;
			}
		}

		return -1;
	}
};

function BasicDemoCtrl($mdPanel) {
	"use strict";

	this._mdPanel = $mdPanel;

	this.desserts = [
		'Apple Pie',
		'Donut',
		'Fudge',
		'Cupcake',
		'Ice Cream',
		'Tiramisu'
	];

	this.selected = {
		favoriteDessert: 'Donut'
	};

	this.disableParentScroll = false;
}

BasicDemoCtrl.prototype.showDialog = function () {
	"use strict";

	var position = this._mdPanel.newPanelPosition().absolute().center(),
		config = {
			attachTo: angular.element(document.body),
			controller: ['mdPanelRef', PanelDialogCtrl],
			controllerAs: 'ctrl',
			disableParentScroll: this.disableParentScroll,
			templateUrl: msos.resource_url('demo', 'material/tmpl/panel/demo.html'),
			hasBackdrop: true,
			panelClass: 'demo-dialog-example',
			position: position,
			trapFocus: true,
			zIndex: 150,
			clickOutsideToClose: true,
			escapeToClose: true,
			focusOnOpen: true
		};

	this._mdPanel.open(config);
};

BasicDemoCtrl.prototype.showMenu = function (ev) {
	"use strict";

	var position = this._mdPanel.newPanelPosition().relativeTo('.demo-menu-open-button').addPanelPosition(this._mdPanel.xPosition.ALIGN_START, this._mdPanel.yPosition.BELOW),
		config = {
			attachTo: angular.element(document.body),
			controller: ['mdPanelRef', '$timeout', PanelMenuCtrl],
			controllerAs: 'ctrl',
			template: '<div class="demo-menu-example" ' +
					'     aria-label="Select your favorite dessert." ' +
					'     role="listbox">' +
					'  <div class="demo-menu-item" ' +
					'       ng-class="{selected : dessert == ctrl.favoriteDessert}" ' +
					'       aria-selected="{{dessert == ctrl.favoriteDessert}}" ' +
					'       tabindex="-1" ' +
					'       role="option" ' +
					'       ng-repeat="dessert in ctrl.desserts" ' +
					'       ng-click="ctrl.selectDessert(dessert)"' +
					'       ng-keydown="ctrl.onKeydown($event, dessert)">' +
					'    {{ dessert }} ' +
					'  </div>' +
					'</div>',
			panelClass: 'demo-menu-example',
			position: position,
			locals: {
				'selected': this.selected,
				'desserts': this.desserts
			},
			openFrom: ev,
			clickOutsideToClose: true,
			escapeToClose: true,
			focusOnOpen: false,
			zIndex: 2
		};

	this._mdPanel.open(config);
};

function PanelMenuCtrl2(mdPanelRef) {
	"use strict";

    this.closeMenu = function () {
		if (mdPanelRef) {
			mdPanelRef.close();
		}
    };
}

function PanelGroupsCtrl($mdPanel) {
	"use strict";

	this.settings = {
		name: 'settings',
		items: [
			'Home',
			'About',
			'Contact'
		]
	};
	this.favorite = {
		name: 'favorite',
		items: [
			'Add to Favorites'
		]
	};
	this.more = {
		name: 'more',
		items: [
			'Account',
			'Sign Out'
		]
	};
	this.tools = {
		name: 'tools',
		items: [
			'Create',
			'Delete'
		]
	};
	this.code = {
		name: 'code',
		items: [
			'See Source',
			'See Commits'
		]
	};

	this.menuTemplate = '' +
		'<div class="menu-panel" md-whiteframe="4">' +
		'  <div class="menu-content">' +
		'    <div class="menu-item" ng-repeat="item in ctrl.items">' +
		'      <button class="md-button">' +
		'        <span>{{item}}</span>' +
		'      </button>' +
		'    </div>' +
		'    <md-divider></md-divider>' +
		'    <div class="menu-item">' +
		'      <button class="md-button" ng-click="ctrl.closeMenu()">' +
		'        <span>Close Menu</span>' +
		'      </button>' +
		'    </div>' +
		'  </div>' +
		'</div>';

	$mdPanel.newPanelGroup('toolbar', {
		maxOpen: 2
	});

	$mdPanel.newPanelGroup('menus2', {
		maxOpen: 3
	});

	this.showToolbarMenu = function ($event, menu) {
		var template = this.menuTemplate,
			position = $mdPanel.newPanelPosition()
				.relativeTo($event.target)
				.addPanelPosition(
					$mdPanel.xPosition.ALIGN_START,
					$mdPanel.yPosition.BELOW
			),
			config = {
				id: 'toolbar_' + menu.name,
				attachTo: angular.element(document.body),
				controller: ['mdPanelRef', PanelMenuCtrl2],
				controllerAs: 'ctrl',
				template: template,
				position: position,
				panelClass: 'menu-panel-container',
				locals: {
					items: menu.items
				},
				openFrom: $event,
				focusOnOpen: false,
				zIndex: 100,
				propagateContainerEvents: true,
				groupName: ['toolbar', 'menus2']
			};

		$mdPanel.open(config);
	};

	this.showContentMenu = function ($event, menu) {
		var template = this.menuTemplate,
			position = $mdPanel.newPanelPosition()
				.relativeTo($event.target)
				.addPanelPosition(
					$mdPanel.xPosition.ALIGN_START,
					$mdPanel.yPosition.BELOW
			),
			config = {
				id: 'content_' + menu.name,
				attachTo: angular.element(document.body),
				controller: ['mdPanelRef', PanelMenuCtrl2],
				controllerAs: 'ctrl',
				template: template,
				position: position,
				panelClass: 'menu-panel-container',
				locals: {
					items: menu.items
				},
				openFrom: $event,
				focusOnOpen: false,
				zIndex: 100,
				propagateContainerEvents: true,
				groupName: 'menus2'
			};

		$mdPanel.open(config);
	};
}

function AnimationCtrl($mdPanel) {
	"use strict";

	this._mdPanel = $mdPanel;
	this.openFrom = 'button';
	this.closeTo = 'button';
	this.animationType = 'scale';
	this.duration = 300;
	this.separateDurations = {
		open: this.duration,
		close: this.duration
	};
}

AnimationCtrl.prototype.showDialog = function () {
	"use strict";

	var position = this._mdPanel.newPanelPosition()
			.absolute()
			.right()
			.top(),
		animation = this._mdPanel.newPanelAnimation(),
		config = {};

	animation.duration(this.duration || this.separateDurations);

	switch (this.openFrom) {
		case 'button':
			animation.openFrom('.animation-target');
			break;
		case 'corner':
			animation.openFrom({
				top: 0,
				left: 0
			});
			break;
		case 'bottom':
			animation.openFrom({
				top: document.documentElement.clientHeight,
				left: document.documentElement.clientWidth / 2 - 250
			});
	}

	switch (this.closeTo) {
		case 'button':
			animation.closeTo('.animation-target');
			break;
		case 'corner':
			animation.closeTo({
				top: 0,
				left: 0
			});
			break;
		case 'bottom':
			animation.closeTo({
				top: document.documentElement.clientHeight,
				left: document.documentElement.clientWidth / 2 - 250
			});
	}

	switch (this.animationType) {
		case 'custom':
			animation.withAnimation({
				open: 'demo-dialog-custom-animation-open',
				close: 'demo-dialog-custom-animation-close'
			});
			break;
		case 'slide':
			animation.withAnimation(this._mdPanel.animation.SLIDE);
			break;
		case 'scale':
			animation.withAnimation(this._mdPanel.animation.SCALE);
			break;
		case 'fade':
			animation.withAnimation(this._mdPanel.animation.FADE);
			break;
		case 'none':
			animation = undefined;
			break;
	}

	config = {
		animation: animation,
		attachTo: angular.element(document.body),
		controller: ['mdPanelRef', PanelDialogCtrl],
		controllerAs: 'ctrl',
		templateUrl: msos.resource_url('demo', 'material/tmpl/panel/demo.html'),
		panelClass: 'demo-dialog-example',
		position: position,
		trapFocus: true,
		zIndex: 150,
		clickOutsideToClose: true,
		clickEscapeToClose: true,
		hasBackdrop: true,
	};

	this._mdPanel.open(config);
};

function PanelProviderConfig($mdPanelProvider) {
	"use strict";

	$mdPanelProvider.definePreset('demoPreset', {
		attachTo: angular.element(document.body),
		controller: ['mdPanelRef', PanelMenuCtrl2],
		controllerAs: 'ctrl',
		template: '' +
			'<div class="menu-panel" md-whiteframe="4">' +
			'  <div class="menu-content">' +
			'    <div class="menu-item" ng-repeat="item in ctrl.items">' +
			'      <button class="md-button">' +
			'        <span>{{item}}</span>' +
			'      </button>' +
			'    </div>' +
			'    <md-divider></md-divider>' +
			'    <div class="menu-item">' +
			'      <button class="md-button" ng-click="ctrl.closeMenu()">' +
			'        <span>Close Menu</span>' +
			'      </button>' +
			'    </div>' +
			'  </div>' +
			'</div>',
		panelClass: 'menu-panel-container',
		focusOnOpen: false,
		zIndex: 100,
		propagateContainerEvents: true,
		groupName: 'menus'
	});
}

function PanelProviderCtrl($mdPanel) {
	"use strict";

	this.navigation = {
		name: 'navigation',
		items: [
			'Home',
			'About',
			'Contact'
		]
	};
	this.favorites = {
		name: 'favorites',
		items: [
			'Add to Favorites'
		]
	};
	this.more = {
		name: 'more',
		items: [
			'Account',
			'Sign Out'
		]
	};

	$mdPanel.newPanelGroup('menus', {
		maxOpen: 2
	});

	this.showMenu = function ($event, menu) {

		$mdPanel.open('demoPreset', {
			id: 'menu_' + menu.name,
			position: $mdPanel.newPanelPosition()
				.relativeTo($event.target)
				.addPanelPosition(
					$mdPanel.xPosition.ALIGN_START,
					$mdPanel.yPosition.BELOW
				),
			locals: {
				items: menu.items
			},
			openFrom: $event
		});
	};
}


angular.module(
    'demo.material.controllers.panel',
    ['ng', 'ng.material.ui.panel']
).config(
	['$mdPanelProvider', PanelProviderConfig]
).controller(
    'demo.material.controllers.panel.ctrl1',
    ['$mdPanel', BasicDemoCtrl]
).controller(
	'PanelDialogCtrl',
	['mdPanelRef', PanelDialogCtrl]
).controller(
	'demo.material.controllers.panel.ctrl2',
	['$mdPanel', PanelGroupsCtrl]
).controller(
	'PanelMenuCtrl2',
	['mdPanelRef', PanelMenuCtrl2]
).controller(
	'demo.material.controllers.panel.ctrl3',
	['$mdPanel', AnimationCtrl]
).controller(
	'demo.material.controllers.panel.ctrl4',
	['$mdPanel', PanelProviderCtrl]
);
