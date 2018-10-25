
/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.bootstrap.ui.carousel");

ng.bootstrap.ui.carousel.version = new msos.set_version(18, 9, 23);

// Load Angular-UI-Bootstrap module specific CSS
ng.bootstrap.ui.carousel.css = new msos.loader();
ng.bootstrap.ui.carousel.css.load(msos.resource_url('ng', 'bootstrap/css/ui/carousel.css'));


// Below is the standard plugin, except for templateUrl location and naming (MSOS style)
// ui.bootstrap.carousel -> ng.bootstrap.ui.carousel,
// uib/template/carousel/carousel.html  -> msos.resource_url('ng', 'bootstrap/ui/tmpl/carousel.html')
// uib/template/carousel/slide.html     -> msos.resource_url('ng', 'bootstrap/ui/tmpl/slide.html')
angular.module(
    'ng.bootstrap.ui.carousel',
    ['ng', 'ng.bootstrap.ui']
).controller(
    'UibCarouselController',
    ['$scope', '$element', '$interval', '$animate', function ($scope, $element, $interval, $animate) {
		"use strict";

		var temp_cl = 'ng.bootstrap.ui.carousel - UCC',
			self = this,
			slides = self.slides = $scope.slides = [],
			SLIDE_DIRECTION = 'uib-slideDirection',
			currentIndex = angular.isNumber($scope.active) ? $scope.active : 0,
			currentInterval,
			direction,
			interval = 0,
			isPlaying =true,
			destroyed = false;

		msos.console.debug(temp_cl + ' -> start.');

		$element.addClass('carousel');

        function setActive(index) {
            var i = 0,
				found = false;

            for (i = 0; i < slides.length; i += 1) {
				if (i === index) {
					slides[i].slide.active = true;
					$scope.active = i;
					currentIndex = i;
					found = true;
				} else {
					slides[i].slide.active = false;
				}
            }

			if (found) {
				msos.console.debug(temp_cl + ' - setActive -> called, set index: ' + index);
			} else {
				msos.console.error(temp_cl + ' - setActive -> failed!');
			}
        }

        function findSlideIndex(slide) {
            var i = 0;

            for (i = 0; i < slides.length; i += 1) {
                if (slides[i].slide === slide) {
					msos.console.debug(temp_cl + ' - findSlideIndex -> found, index: ' + i);
                    return i;
                }
            }

            return 0;
        }

		function timerFn() {
			if (slides.length && isPlaying && !isNaN(interval) && interval > 0) {
				$scope.next();
			} else {
				$scope.pause();
			}
		}

		function resetTimer() {

			// Update once per slide selection
			interval = +$scope.interval;

			if (currentInterval) {
				$interval.cancel(currentInterval);
				currentInterval = null;
			}
		}

        function restartTimer() {

            resetTimer(); 

            if (!isNaN(interval) && interval > 0) {
                currentInterval = $interval(
					timerFn,
					interval,
					0,
					null	// $scope
				);
            }
        }

		self.addSlide = function (slide, element) {
			var add_index = 0;

			msos.console.debug(temp_cl + ' - addSlide -> start.');

            slides.push({
                slide: slide,
                element: element
            });

            slides.sort(
				function (a, b) { return +a.slide.index - +b.slide.index; }
			);

			if (slide.index === $scope.active || slides.length === 1 && !angular.isNumber($scope.active)) {

				if ($scope.$currentTransition) { $scope.$currentTransition = null; }

				self.select(slides[add_index]);

				if (slides.length === 1) { $scope.play(); }
			}

			msos.console.debug(temp_cl + ' - addSlide ->  done, # of slides:' + slides.length);
		};

        self.getCurrentIndex = function () {
            var i = 0;

			msos.console.debug(temp_cl + ' - getCurrentIndex -> start.');

            for (i = 0; i < slides.length; i += 1) {
                if (slides[i].slide.index === currentIndex) {
                    msos.console.debug(temp_cl + ' - getCurrentIndex ->  done, index: ' + i);
                    return i;
                }
            }

            return 0;
        };

		self.next = $scope.next = function () {
			var next_idx = (currentIndex + 1) % slides.length;

			self.select(slides[next_idx], 'next');
		};

		self.prev = $scope.prev = function () {
			var prev_idx = currentIndex - 1 < 0 ? slides.length - 1 : currentIndex - 1;

			self.select(slides[prev_idx], 'prev');
		};

		self.removeSlide = function (slide) {
			var index = findSlideIndex(slide);

			slides.splice(index, 1);

			if (slides.length > 0 && currentIndex === index) {
				if (index >= slides.length) {
					self.select(slides[slides.length - 1]);
				} else {
					self.select(slides[index]);
				}
			} else if (currentIndex > index) {
				setActive(currentIndex -= 1);
			}

			if (slides.length === 0) {
				currentIndex = 0;
				$scope.active = null;
			}
		};

        self.select = $scope.select = function (nextSlide, nextDirection) {
			var slide = nextSlide.slide,
				index = findSlideIndex(slide);

			msos.console.debug(temp_cl + ' - $scope.select -> start, direction: ' + nextDirection);

            if (destroyed) {
				msos.console.debug(temp_cl + ' - $scope.select ->  done, already destroyed.');
				return;
			}

			if (nextDirection === undefined) {
				direction = index >= currentIndex ? 'next' : 'prev';
			} else {
				direction = nextDirection;
			}

			if (!$scope.$currentTransition) {

				angular.extend(
					slide,
					{ direction: direction }
				);

				angular.extend(
					slides[currentIndex].slide || {},
					{ direction: direction }
				);

				if (
					!$scope.$currentTransition &&
					slides.length > 1 &&
					slides[index].element &&
					$animate.enabled !== angular.noop &&
					$animate.enabled($element)
					) {

					slides[index].element.data(SLIDE_DIRECTION, slide.direction);

					$scope.$currentTransition = true;

					$animate.on(
						'addClass',
						slides[index].element,
						function (element, phase) {
							if (phase === 'close') {
								$scope.$currentTransition = null;
								$animate.off('addClass', element);
							}
						}
					);

					msos.console.debug(temp_cl + ' - $scope.select -> $animate.on addClass set');
				}

				setActive(index);

				msos.console.debug(temp_cl + ' - $scope.select ->  done, for index: ' + index);

            } else {

				msos.console.debug(temp_cl + ' - $scope.select ->  done, skipped.');
			}
        };

		$scope.indexOfSlide = function (slide) {
			return +slide.slide.index;
		};

		$scope.isActive = function (slide) {
			return $scope.active === slide.slide.index;
		};

		$scope.pause = function () {
			if (!$scope.noPause) {
				isPlaying = false;
				resetTimer();
			}

			msos.console.debug(temp_cl + ' - $scope.pause -> called, isPlaying: ' + isPlaying);
		};

		$scope.play = function () {
			if (!isPlaying) {
				isPlaying = true;
				restartTimer();
			}

			msos.console.debug(temp_cl + ' - $scope.play -> called.');
		};

		$element.on('mouseenter', $scope.pause);
		$element.on('mouseleave', $scope.play);

		$scope.$on(
			'$destroy',
			function ng_bs_ui_carousel_UCB_on() {
				destroyed = true;
				resetTimer();
			}
		);

        $scope.$watch(
			'noTransition',
			function ng_bs_ui_carousel_UCB_notrans(noTransition) {
				if ($animate.enabled) {
					$animate.enabled($element, !noTransition);
				}
			}
		);

		$scope.$watch(
			'interval',
			restartTimer
		);

		function resetTransition(slides) {
			if (!slides.length) { $scope.$currentTransition = null; }
		}

		$scope.$watchCollection(
			'slides',
			resetTransition
		);

		$scope.$watch(
			'active',
			function ng_bs_ui_carousel_UCB_active(index) {
				var i = 0,
					slide;

				if (angular.isNumber(index)) {
					for (i = 0; i < slides.length; i += 1) {
						if (slides[i].slide.index === index) { break; }
					}

					slide = slides[i];

					if (slide) { self.select(slides[i]); }
				}
			}
		);

		msos.console.debug(temp_cl + ' ->  done!');
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
                noPause: '='
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
                scope.$on(
					'$destroy',
					function ng_bs_ui_carousel_uibSlide_on() {
						carouselCtrl.removeSlide(scope);
					}
				);
                scope.$watch(
					'active',
					function ng_bs_ui_carousel_uibSlide_active(active) {
						$animate[active ? 'addClass' : 'removeClass'](element, 'active');
					}
				);
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
                var stopped = false,
					direction,
                    directionClass,
                    removeClassFn;

                if (className === 'active') {
                    direction = element.data(SLIDE_DIRECTION);
                    directionClass = direction === 'next' ? 'left' : 'right';
                    removeClassFn = removeClass.bind(this, element, directionClass + ' ' + direction, done);
                    element.addClass(direction);

                    $animateCss(
                        element,
                        { addClass: directionClass }
                    ).start().done(removeClassFn);

                    return function () { stopped = true; };		// or use angular.noop;
                }

                done();
                return undefined;
            },
            beforeRemoveClass: function (element, className, done) {
                var stopped = false,
					direction,
                    directionClass,
                    removeClassFn;

                if (className === 'active') {
                    direction = element.data(SLIDE_DIRECTION);
                    directionClass = direction === 'next' ? 'left' : 'right';
                    removeClassFn = removeClass.bind(this, element, directionClass, done);

                    $animateCss(
						element,
						{ addClass: directionClass }
					).start().done(removeClassFn);

                    return function () { stopped = true; };		// or use angular.noop;
                }

                done();
                return undefined;
            }
        };
    }
]);
