
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.simple.start");
msos.require('ng.route');


msos.onload_func_done.push(
    function () {
        'use strict';

        var temp_ss = 'demo.simple.start -> ';

        msos.console.debug(temp_ss + 'start.');

        angular.module(
            'xmpl.service', ['ng']
        ).value(
            'greeter',
            {
                salutation: 'Hello',
                localize: function (localization) {
                    this.salutation = localization.salutation;
                },
                greet: function (name) {
                    return this.salutation + ' ' + name + '!';
                }
            }
        ).value(
            'user',
            {
                load: function (name) {
                    this.name = name;
                }
            }
        );

        angular.module('xmpl.directive', ['ng']);

        angular.module('xmpl.filter', ['ng']);

        angular.module(
            'demo.mobile.start',
            ['ng', 'xmpl.service', 'xmpl.directive', 'xmpl.filter']
        ).run(
            ['greeter', 'user', function (greeter, user) {
                // This is effectively part of the main method initialization code
                greeter.localize({
                    salutation: 'Bonjour'
                });

                user.load('World');
            }]
        ).controller(
            'XmplController',
            ['$scope', 'greeter', 'user', function ($scope, greeter, user) {
                $scope.greeting = greeter.greet(user.name);
            }]
        );

        angular.bootstrap('body', ['demo.mobile.start']);

        msos.console.debug(temp_ss + 'done!');
    }
);
