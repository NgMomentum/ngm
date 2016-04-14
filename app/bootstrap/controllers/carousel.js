
msos.provide("app.bootstrap.controllers.carousel");
msos.require("ng.bootstrap.ui.carousel");


app.bootstrap.controllers.carousel.version = new msos.set_version(14, 8, 6);

angular.module(
    'app.bootstrap.controllers.carousel', []
).controller(
    'app.bootstrap.controllers.carousel.ctrl',
    [
        '$scope',
        function ($scope) {

            $scope.myInterval = 5000;
            $scope.noWrapSlides = false;
            $scope.active = 0;
            $scope.slides = [];

            var slides = $scope.slides,
                currIndex = 0;

            $scope.addSlide = function () {
                var newWidth = 600 + slides.length + 1;

                slides.push({
                    image: 'http://lorempixel.com/' + newWidth + '/300',
                    text: ['Nice image', 'Awesome photograph','That is so cool', 'I love that'][slides.length % 4],
                    id: currIndex++
                });
            };

            $scope.randomize = function () {
                var indexes = generateIndexesArray();

                assignNewIndexesToSlides(indexes);
            };

            for (var i = 0; i < 4; i += 1) {
                $scope.addSlide();
            }

            // Randomize logic below
            function assignNewIndexesToSlides(indexes) {
                var i = 0;

                for (i = 0; i < slides.length; i += 1) {
                    slides[i].id = indexes.pop();
                }
            }

            function generateIndexesArray() {
                var indexes = [],
                    i = 0;

                for (i = 0; i < currIndex; i += 1) {
                    indexes[i] = i;
                }
                return shuffle(indexes);
            }

            // http://stackoverflow.com/questions/962802#962890
            function shuffle(array) {
                var tmp,
                    current,
                    top = array.length;

                if (top) {
                    while (--top) {
                        current = Math.floor(Math.random() * (top + 1));
                        tmp = array[current];
                        array[current] = array[top];
                        array[top] = tmp;
                    }
                }

                return array;
            }
        }
    ]
);