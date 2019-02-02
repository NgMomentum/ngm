
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.uirouter.sticky.start");

demo.uirouter.sticky.start.version = new msos.set_version(18, 12, 11);

// Load the very large Visualizer file
demo.uirouter.sticky.start.vis = new msos.loader();
demo.uirouter.sticky.start.vis.load(msos.resource_url('ng', 'ui/router/visualizer/v600_msos.uc.js'));
demo.uirouter.sticky.start.vis.load(msos.resource_url('ng', 'ui/router/sticky/v130_msos.uc.js'));


msos.onload_func_done.push(
    function () {
        "use strict";

        var temp_sd = 'demo.uirouter.advanced.fstart';

        // Create the module where our functionality can attach to
        angular.module(
            'demo.uirouter.sticky.start', [
                'ng',
                'ng.ui.router'
            ]
        ).run(
            ['$uiRouter', '$trace', '$state', '$rootScope', function($uiRouter, $trace, $state, $rootScope) {

                var Visualizer = window['@uirouter/visualizer'].Visualizer,
                    StickyStates = window['@uirouter/stickyStates'].StickyStates;

                $uiRouter.plugin(Visualizer);
                $uiRouter.plugin(StickyStates);

                $trace.enable('TRANSITION');

                $rootScope.$state = $state;

            }]
        ).config(
            ['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

                $urlRouterProvider.otherwise("/overview");

                // set up the states
                $stateProvider.state('group', {
                    'abstract': true,
                    template:	'<div ui-view="overview" ng-show="$state.includes(\'group.overview\')"></div>' +
								'<div ui-view="projects"  ng-show="$state.includes(\'group.projects\')"></div>' +
								'<div ui-view="tasks"  ng-show="$state.includes(\'group.tasks\')"></div>' +
								'<div ui-view="discussions"  ng-show="$state.includes(\'group.discussions\')"></div>' +
								'<div ui-view="members"  ng-show="$state.includes(\'group.members\')"></div>' +
								'<hr><h1>Parent</h1><div scope-age></div>',
                    controller: 'timerController'
                }).state('group.overview', {
                    url: "/overview",
                    views: {
                        'overview@group': {
                            controller: 'timerController',
                            template: '<h1>Overview</h1><div scope-age></div>'
                        }
                    },
                    sticky: true,
                    deepStateRedirect: true
                }).state('group.projects', {
                    url: "/projects",
                    views: {
                        'projects@group': {
                            controller: 'timerController',
                            template: '<h1>Projects</h1><div scope-age></div>'
                        }
                    },
                    sticky: true,
                    deepStateRedirect: true
                }).state('group.tasks', {
                    url: "/tasks",
                    views: {
                        'tasks@group': {
                            controller: 'timerController',
                            template: '<h1>Tasks</h1><div scope-age></div>'
                        }
                    },
                    sticky: true,
                    deepStateRedirect: true
                }).state('group.discussions', {
                    url: "/discussions",
                    views: {
                        'discussions@group': {
                            controller: 'timerController',
                            template: '<h1>Discussions</h1><div scope-age></div>'
                        }
                    },
                    sticky: true,
                    deepStateRedirect: true
                }).state('group.members', {
                    url: "/members",
                    views: {
                        'members@group': {
                            controller: 'timerController',
                            template: '<h1>Members</h1><div scope-age></div>'
                        }
                    },
                    sticky: true,
                    deepStateRedirect: true
                });
            }]
        ).directive(
            "scopeAge",
            function() {
                return {
                    template: '<div>This scope is {{age || 0}} seconds old</div>'
                };
            }
        ).service(
            "timerService", ['$interval', function($interval) {
                return {
                    instrument: function instrument($scope) {
                        var scopeCreated = Date.now();
                        var computeAge = function() {
                                var delta = Date.now() - scopeCreated;
                                $scope.ageMs = delta;
                                $scope.age = Math.floor(delta / 1000);
                            },
                            intervalPromise;

                        computeAge();

                        intervalPromise = $interval(computeAge, 1000);

                        $scope.$on(
                            "$destroy",
                            function demo_timeservice_on() {
                                $interval.cancel(intervalPromise);
                            }
                        );
                    }
                };
            }]
        ).controller(
            "timerController", ['$scope', 'timerService', function($scope, timerService) {
                timerService.instrument($scope);
            }]
        );

        angular.bootstrap('#body', ['demo.uirouter.sticky.start']);

        msos.console.debug(temp_sd + 'done!');
    }
);
