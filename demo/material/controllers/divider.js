
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.divider");
msos.require("ng.material.ui.divider");		// ref template
msos.require("ng.material.ui.content");		// ref template
msos.require("ng.material.ui.list");		// ref template
msos.require("ng.material.ui.toolbar");		// ref template
msos.require("ng.material.ui.button");		// ref template

demo.material.controllers.divider.version = new msos.set_version(18, 7, 11);


angular.module(
	'demo.material.controllers.divider',
	['ng']
).controller(
	'demo.material.controllers.divider.ctrl',
	['$scope', function ($scope) {
		"use strict";

        var imagePath = msos.resource_url('demo', 'material/img/60.jpeg');

        $scope.messages = [{
            face: imagePath,
            what: 'Brunch this weekend?',
            who: 'Min Li Chan',
            when: '3:08PM',
            notes: " I'll be in your neighborhood doing errands"
        }, {
            face: imagePath,
            what: 'Brunch this weekend?',
            who: 'Min Li Chan',
            when: '3:08PM',
            notes: " I'll be in your neighborhood doing errands"
        }, {
            face: imagePath,
            what: 'Brunch this weekend?',
            who: 'Min Li Chan',
            when: '3:08PM',
            notes: " I'll be in your neighborhood doing errands"
        }, {
            face: imagePath,
            what: 'Brunch this weekend?',
            who: 'Min Li Chan',
            when: '3:08PM',
            notes: " I'll be in your neighborhood doing errands"
        }, {
            face: imagePath,
            what: 'Brunch this weekend?',
            who: 'Min Li Chan',
            when: '3:08PM',
            notes: " I'll be in your neighborhood doing errands"
        }];
    }]
);
