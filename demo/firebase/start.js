
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
msos.require("firebase.database");


msos.onload_func_done.push(
    function () {
        "use strict";

        firebase.initializeApp(
            {
                apiKey: "AIzaSyDQODZCA5Ul1tU6XqdkkrW1oic30JfsRZE",
                authDomain: "ngmomentum.firebaseapp.com",
                databaseURL: "https://ngmomentum.firebaseio.com",
                storageBucket: "ngmomentum.appspot.com",
                messagingSenderId: "119009400783"
            }
        );
    }
);

msos.onload_func_done.push(
    function () {
        "use strict";

        var temp_fa = 'demo.firebase.start -> ';

        msos.console.debug(temp_fa + 'start.');

        demo.firebase.start = angular.module(
            'demo.firebase.start',
            [
                'ngRoute',
                'firebase'
            ]
        ).controller(
            'SampleCtrl',
            ['$scope', '$firebaseObject', function ($scope, $firebaseObject) {
                var ref = firebase.database().ref();

                // download the data into a local object
                $scope.data = $firebaseObject(ref);
            }]
        );

        angular.bootstrap('#body', ['demo.firebase.start']);

        msos.console.debug(temp_fa + 'done!');
    }
);
