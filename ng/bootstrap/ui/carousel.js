
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.bootstrap.ui.carousel");

ng.bootstrap.ui.carousel.version = new msos.set_version(17, 1, 25);

// Load Angular-UI-Bootstrap module specific CSS
ng.bootstrap.ui.carousel.css = new msos.loader();
ng.bootstrap.ui.carousel.css.load(msos.resource_url('ng', 'bootstrap/css/ui/carousel.css'));


// Below is the standard plugin, except for templateUrl location and naming (MSOS style)
// ui.bootstrap.carousel -> ng.bootstrap.ui.carousel,
// uib/template/carousel/carousel.html  -> msos.resource_url('ng', 'bootstrap/ui/tmpl/carousel.html')
// uib/template/carousel/slide.html     -> msos.resource_url('ng', 'bootstrap/ui/tmpl/slide.html')
angular.module(
    'ng.bootstrap.ui.carousel',
    ['ng']
).controller(
    'UibCarouselController',
    ['$scope', '$element', '$interval', '$animate', function ($scope, $element, $interval, $animate) {
        "use strict";

        var temp_cl = 'ng.bootstrap.ui.carousel - UibCarouselController',
            self = this,
            slides = self.slides = $scope.slides = [],
            SLIDE_DIRECTION = 'uib-slideDirection',
            currentIndex = $scope.active,
            currentInterval,
            isPlaying,
            destroyed = false;

        msos.console.debug(temp_cl + 'start, currentIndex: ' + currentIndex);

        $element.addClass('carousel');

        function setActive(index) {
            var i = 0;

            for (i = 0; i < slides.length; i += 1) {
                slides[i].slide.active = i === index;
            }
        }

        function findSlideIndex(slide) {
            var i = 0;

            for (i = 0; i < slides.length; i += 1) {
                if (slides[i].slide === slide) {
                    return i;
                }
            }
            return undefined;
        }

        function resetTimer() {
            if (currentInterval) {
                $interval.cancel(currentInterval);
                currentInterval = null;
            }
        }

        function resetTransition(slides) {
            if (!slides.length) {
                $scope.$currentTransition = null;
            }
        }

        function timerFn() {
            var interval = +$scope.interval;

            if (isPlaying && !isNaN(interval) && interval > 0 && slides.length) {
                $scope.next();
            } else {
                $scope.pause();
            }
        }

        function restartTimer() {
            resetTimer();

            var interval = +$scope.interval;

            if (!isNaN(interval) && interval > 0) {
                currentInterval = $interval(timerFn, interval);
            }
        }

        function goNext(slide, index, direction) {
            if (destroyed) {
                return;
            }

            angular.extend(slide, {
                direction: direction
            });
            angular.extend(slides[currentIndex].slide || {}, {
                direction: direction
            });

            if ($animate.enabled !== angular.noop
             && $animate.enabled($element)
             && !$scope.$currentTransition
             && slides[index].element && self.slides.length > 1) {
                slides[index].element.data(SLIDE_DIRECTION, slide.direction);
                var currentIdx = self.getCurrentIndex();

                if (angular.isNumber(currentIdx) && slides[currentIdx].element) {
                    slides[currentIdx].element.data(SLIDE_DIRECTION, slide.direction);
                }

                $scope.$currentTransition = true;
                $animate.on('addClass', slides[index].element, function (element, phase) {

                    if (phase === 'close') {
                        $scope.$currentTransition = null;
                        $animate.off('addClass', element);
                    }
                });
            }

            $scope.active = slide.index;
            currentIndex = slide.index;
            setActive(index);

            //every time you change slides, reset the timer
            restartTimer();
        }

        self.addSlide = function (slide, element) {
            msos.console.debug(temp_cl + ' - addSlide -> start.');

            slides.push({
                slide: slide,
                element: element
            });

            slides.sort(function (a, b) {
                return +a.slide.index - +b.slide.index;
            });

            // if this is the first slide or the slide is set to active, select it
            if (slide.index === $scope.active || (slides.length === 1 && !angular.isNumber($scope.active))) {
                if ($scope.$currentTransition) {
                    $scope.$currentTransition = null;
                }

                currentIndex = slide.index;
                $scope.active = slide.index;
                setActive(currentIndex);
                self.select(slides[findSlideIndex(slide)]);

                if (slides.length === 1) {
                    $scope.play();
                }
            }

            msos.console.debug(temp_cl + ' - addSlide ->  done, slides:', slides);
        };

        self.getCurrentIndex = function () {
            var i = 0;

            for (i = 0; i < slides.length; i += 1) {
                if (slides[i].slide.index === currentIndex) {
                    msos.console.debug(temp_cl + ' - getCurrentIndex ->  index:' + i);
                    return i;
                }
            }
            return undefined;
        };

        self.next = $scope.next = function () {
            var newIndex = (self.getCurrentIndex() + 1) % slides.length;

            if (newIndex === 0 && $scope.noWrap()) {
                $scope.pause();
                return undefined;
            }

            return self.select(slides[newIndex], 'next');
        };
    
        self.prev = $scope.prev = function () {
            var newIndex = self.getCurrentIndex() - 1 < 0 ? slides.length - 1 : self.getCurrentIndex() - 1;
    
            if ($scope.noWrap() && newIndex === slides.length - 1) {
                $scope.pause();
                return undefined;
            }
    
            return self.select(slides[newIndex], 'prev');
        };

        self.removeSlide = function (slide) {
            var index = findSlideIndex(slide);
    
            //get the index of the slide inside the carousel
            slides.splice(index, 1);

            if (slides.length > 0 && currentIndex === index) {
                if (index >= slides.length) {
                    currentIndex = slides.length - 1;
                    $scope.active = currentIndex;
                    setActive(currentIndex);
                    self.select(slides[slides.length - 1]);
                } else {
                    currentIndex = index;
                    $scope.active = currentIndex;
                    setActive(currentIndex);
                    self.select(slides[index]);
                }
            } else if (currentIndex > index) {
                currentIndex -= 1;
                $scope.active = currentIndex;
            }
    
            //clean the active value when no more slide
            if (slides.length === 0) {
                currentIndex = null;
                $scope.active = null;
            }
        };
    
        self.select = $scope.select = function (nextSlide, direction) {
            var nextIndex = findSlideIndex(nextSlide.slide);
            //Decide direction if it's not given
            if (direction === undefined) {
                direction = nextIndex > self.getCurrentIndex() ? 'next' : 'prev';
            }
            //Prevent this user-triggered transition from occurring if there is already one in progress
            if (nextSlide.slide.index !== currentIndex && !$scope.$currentTransition) {
                goNext(nextSlide.slide, nextIndex, direction);
            }
        };

        $scope.indexOfSlide = function (slide) {
            return +slide.slide.index;
        };

        $scope.isActive = function (slide) {
            return $scope.active === slide.slide.index;
        };
    
        $scope.isPrevDisabled = function () {
            return $scope.active === 0 && $scope.noWrap();
        };
    
        $scope.isNextDisabled = function () {
            return $scope.active === slides.length - 1 && $scope.noWrap();
        };

        $scope.pause = function () {
            if (!$scope.noPause) {
                isPlaying = false;
                resetTimer();
            }
        };
    
        $scope.play = function () {
            if (!isPlaying) {
                isPlaying = true;
                restartTimer();
            }
        };

        $element.on('mouseenter', $scope.pause);
        $element.on('mouseleave', $scope.play);

        $scope.$on('$destroy', function () {
            destroyed = true;
            resetTimer();
        });

        $scope.$watch('interval', restartTimer);


        $scope.$watch('noTransition', function (noTransition) {
            if ($animate.enabled !== angular.noop) {
                $animate.enabled($element, !noTransition);
            }
        });

        $scope.$watchCollection('slides', resetTransition);

        $scope.$watch('active', function (index) {
            var i = 0,
                slide;

            if (angular.isNumber(index) && currentIndex !== index) {
                for (i = 0; i < slides.length; i += 1) {
                    if (slides[i].slide.index === index) {
                        index = i;
                        break;
                    }
                }
    
                slide = slides[index];

                if (slide) {
                    setActive(index);
                    self.select(slides[index]);
                    currentIndex = index;
                }
            }
        });

        msos.console.debug(temp_cl + ' done!');
    }]
).directive(
    'uibCarousel',
    function () {
        "use strict";

        return {
            transclude: true,
            controller: 'UibCarouselController',
            controllerAs: 'carousel',
            restrict: 'A',
            templateUrl: function (element_na, attrs) {
                return attrs.templateUrl || msos.resource_url('ng', 'bootstrap/ui/tmpl/carousel.html');
            },
            scope: {
                active: '=',
                interval: '=',
                noTransition: '=',
                noPause: '=',
                noWrap: '&'
            }
        };
    }
).directive(
    'uibSlide',
    ['$animate', function ($animate) {
        "use strict";

        return {
            require: '^uibCarousel',
            restrict: 'A',
            transclude: true,
            templateUrl: function (element_na, attrs) {
                return attrs.templateUrl || msos.resource_url('ng', 'bootstrap/ui/tmpl/slide.html');
            },
            scope: {
                actual: '=?',
                index: '=?'
            },
            link: function (scope, element, attrs_na, carouselCtrl) {

                element.addClass('item');
                carouselCtrl.addSlide(scope, element);
                //when the scope is destroyed then remove the slide from the current slides array
                scope.$on('$destroy', function () {
                    carouselCtrl.removeSlide(scope);
                });
                scope.$watch('active', function (active) {
                    $animate[active ? 'addClass' : 'removeClass'](element, 'active');
                });
            }
        };
    }]
).animation(
    '.item',
    ['$animateCss', function ($animateCss) {
        "use strict";

        var SLIDE_DIRECTION = 'uib-slideDirection';

        function removeClass(element, className, callback) {
            element.removeClass(className);
            if (callback) {
                callback();
            }
        }

        return {
            beforeAddClass: function (element, className, done) {
                var direction,
                    directionClass,
                    removeClassFn;

                if (className === 'active') {
                    direction = element.data(SLIDE_DIRECTION);
                    directionClass = direction === 'next' ? 'left' : 'right';
                    removeClassFn = removeClass.bind(this, element,
                        directionClass + ' ' + direction, done);
                    element.addClass(direction);

                    $animateCss(element, {
                            addClass: directionClass
                        })
                        .start()
                        .done(removeClassFn);

                    return angular.noop;
                }
                done();
                return undefined;
            },
            beforeRemoveClass: function (element, className, done) {
                var direction,
                    directionClass,
                    removeClassFn;

                if (className === 'active') {
                    direction = element.data(SLIDE_DIRECTION);
                    directionClass = direction === 'next' ? 'left' : 'right';
                    removeClassFn = removeClass.bind(this, element, directionClass, done);

                    $animateCss(element, {
                            addClass: directionClass
                        })
                        .start()
                        .done(removeClassFn);

                    return angular.noop;
                }
                done();
                return undefined;
            }
        };
    }
]);