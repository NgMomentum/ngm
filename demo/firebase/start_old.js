
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false,
	demo: false
*/

msos.provide("demo.firebase.start");
msos.require("ng.route");
msos.require("demo.firebase.fireauth");
msos.require("demo.firebase.controllers.auth");
msos.require("demo.firebase.services.auth");


msos.onload_func_done.push(
    function () {
        "use strict";

        var temp_fa = 'demo.firebase.start -> ';

        msos.console.debug(temp_fa + 'start.');

        /*
         * @author: Alan Museljic
         * @licence: MIT
         * @github: https://github.com/uloga
         */

        /* 
         * Replace firebaseUrl with your own firebase url.
         */

        var config = {
                apiKey: "AIzaSyDQODZCA5Ul1tU6XqdkkrW1oic30JfsRZE",
                authDomain: "ngmomentum.firebaseapp.com",
                databaseURL: "https://ngmomentum.firebaseio.com",
                storageBucket: "fireAuth",
                messagingSenderId: "119009400783"
            };

        firebase.initializeApp(config);

        // Module Setter | This could be your main app module
        demo.firebase.start = angular.module(
            'demo.firebase.start',
            [
                'ngRoute',
                'fireAuth'
            ]
        );

        // Getters
        demo.firebase.start.constant(
            'DB',
            { url: config.databaseURL }
        ).factory(
            'firePath',
            Paths
        );

        function Paths() {
            return {
                // can be accessed without authentication
                allowed: ['/home'],
                // requires authentication
                restricted: ['/profile'],
                // after login redirect to:
                afterLogin: ['/profile']
            };
        }

        angular.bootstrap('#body', ['demo.firebase.start']);

        msos.console.debug(temp_fa + 'done!');
    }
);
