
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false,
    demo: false
*/

msos.provide("demo.bootstrap.controllers.carousel");
msos.require("ng.bootstrap.ui.carousel");


demo.bootstrap.controllers.carousel.version = new msos.set_version(17, 2, 9);

angular.module(
    'demo.bootstrap.controllers.carousel',
    ['ng']
).controller(
    'demo.bootstrap.controllers.carousel.ctrl',
    ['$scope', function ($scope) {
        "use strict";

        $scope.myInterval = 5000;
        $scope.noWrapSlides = false;
        $scope.active = 0;

        var temp_cc = 'demo.bootstrap.controllers.carousel.ctrl',
            slides = $scope.slides = [],
            currIndex = 0,
            i = 0;

        msos.console.debug(temp_cc + ' -> start.');

        // Randomize logic below
        function assignNewIndexesToSlides(indexes) {
            var i = 0,
                l = 0;

            for (i = 0, l = slides.length; i < l; i += 1) {
                slides[i].id = indexes.pop();
            }
        }

        // http://stackoverflow.com/questions/962802#962890
        function shuffle(array) {
            var tmp, current, top = array.length;

            if (top) {
                top -= 1;
                while (top) {
                    current = Math.floor(Math.random() * (top + 1));
                    tmp = array[current];
                    array[current] = array[top];
                    array[top] = tmp;
                    top -= 1;
                }
            }

            return array;
        }

        function generateIndexesArray() {
            var indexes = [],
                i = 0;

            for (i = 0; i < currIndex; i += 1) {
                indexes[i] = i;
            }

            return shuffle(indexes);
        }

        $scope.addSlide = function () {
            var newWidth = 600 + slides.length + 1;

            slides.push({
                image: '//unsplash.it/' + newWidth + '/300',
                text: ['Nice image', 'Awesome photograph', 'That is so cool', 'I love that'][slides.length % 4],
                id: currIndex
            });

            currIndex += 1;
        };

        $scope.randomize = function() {
            var indexes = generateIndexesArray();
            assignNewIndexesToSlides(indexes);
        };

        for (i = 0; i < 4; i += 1) {
            $scope.addSlide();
        }

        msos.console.debug(temp_cc + ' -> done, slides added: ', slides);
    }]
);