
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.tabsmd");
msos.require("ng.material.ui.tabs");
msos.require("ng.material.ui.icon");			// ref. template
msos.require("ng.material.ui.button");			// ref. template
msos.require("ng.material.ui.input");			// ref. template
msos.require("ng.material.ui.layout");			// ref. template
msos.require("ng.material.ui.content"); 		// ref. template
msos.require("ng.material.ui.checkbox");		// ref. template

demo.material.controllers.tabsmd.version = new msos.set_version(18, 7, 19);


function DynamicTabsCtrl($scope, $log) {
    "use strict";

    var tabs = [
			{
                title: 'Zero (AKA 0, Cero, One - One, -Nineteen + 19, and so forth and so on and continuing into what seems like infinity.)',
                content: 'Woah...that is a really long title!'
            },
            {
                title: 'One',
                content: "Tabs will become paginated if there isn't enough room for them."
            },
            {
                title: 'Two',
                content: "You can swipe left and right on a mobile device to change tabs."
            },
            {
                title: 'Three',
                content: "You can bind the selected tab via the selected attribute on the md-tabs element."
            },
            {
                title: 'Four',
                content: "If you set the selected tab binding to -1, it will leave no tab selected."
            },
            {
                title: 'Five',
                content: "If you remove a tab, it will try to select a new one."
            },
            {
                title: 'Six',
                content: "There's an ink bar that follows the selected tab, you can turn it off if you want."
            },
            {
                title: 'Seven',
                content: "If you set ng-disabled on a tab, it becomes unselectable. If the currently selected tab becomes disabled, it will try to select the next tab."
            },
            {
                title: 'Eight',
                content: "If you look at the source, you're using tabs to look at a demo for tabs. Recursion!"
            },
            {
                title: 'Nine',
                content: "If you set md-theme=\"green\" on the md-tabs element, you'll get green tabs."
            },
            {
                title: 'Ten',
                content: "If you're still reading this, you should just go check out the API docs for tabs!"
            },
            {
                title: 'Eleven',
                content: "If you're still reading this, you should just go check out the API docs for tabs!"
            },
            {
                title: 'Twelve',
                content: "If you're still reading this, you should just go check out the API docs for tabs!"
            },
            {
                title: 'Thirteen',
                content: "If you're still reading this, you should just go check out the API docs for tabs!"
            },
            {
                title: 'Fourteen',
                content: "If you're still reading this, you should just go check out the API docs for tabs!"
            },
            {
                title: 'Fifteen',
                content: "If you're still reading this, you should just go check out the API docs for tabs!"
            },
            {
                title: 'Sixteen',
                content: "If you're still reading this, you should just go check out the API docs for tabs!"
            },
            {
                title: 'Seventeen',
                content: "If you're still reading this, you should just go check out the API docs for tabs!"
            },
            {
                title: 'Eighteen',
                content: "If you're still reading this, you should just go check out the API docs for tabs!"
            },
            {
                title: 'Nineteen',
                content: "If you're still reading this, you should just go check out the API docs for tabs!"
            },
            {
                title: 'Twenty',
                content: "If you're still reading this, you should just go check out the API docs for tabs!"
            }
        ],
        selected = null,
        previous = null;

    $scope.tabs = tabs;
    $scope.selectedIndex = 0;

    $scope.$watch(
		'selectedIndex',
		function (current, old) {

			previous = selected;
			selected = tabs[current];

			if (old + 1 && previous && (old != current)) {
				$log.debug('Goodbye ' + previous.title + '!');
			}
			if (current + 1) {
				$log.debug('Hello ' + selected.title + '!');
			}
		}
	);

    $scope.addTab = function (title, view) {
        view = view || title + " Content View";
        tabs.push({
            title: title,
            content: view,
            disabled: false
        });
    };

    $scope.removeTab = function (tab) {
        var index = tabs.indexOf(tab);

        tabs.splice(index, 1);
    };
}

function StaticTabsCtrl($scope) {
	"use strict";

    $scope.data = {
		selectedIndex:	0,
		secondLocked:	true,
		secondLabel:	"Item Two",
		bottom:			false
    };

    $scope.next = function () {
		$scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 2) ;
    };

    $scope.previous = function () {
		$scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
    };
}


angular.module(
    'demo.material.controllers.tabsmd',
	['ng', 'ng.material.ui.icon']
).config(
	["$mdIconProvider", function ($mdIconProvider) {
		"use strict";

        $mdIconProvider
			.iconSet(
				'communication',
				msos.resource_url('demo', 'material/img/icons/sets/communication-icons.svg')
			).icon(
				'favorite',
				msos.resource_url('demo', 'material/img/icons/favorite.svg')
			);
    }]
).controller(
    'demo.material.controllers.tabsmd.ctrl1',
	['$scope', function ($scope) {
        "use strict";

        $scope.imagePath = msos.resource_url('demo', 'material/img/washedout.png');
    }]
).controller(
    'demo.material.controllers.tabsmd.ctrl2',
	['$scope', '$log', DynamicTabsCtrl]
).controller(
    'demo.material.controllers.tabsmd.ctrl3',
	['$scope', StaticTabsCtrl]
);
