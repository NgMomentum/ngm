
/*global
    angular: false,
    msos: false
*/

msos.provide("demo.swipe.start");
msos.require("ng.touch");


angular.module(
	"demo.swipe.start",
	['ng', 'ng.touch']
).directive(
	'ngSwipeCarousel',
	function () {
		return function (scope, element) {
			var el = element[0],
				containerEl = el.querySelector("ul"),
				slidesEl = containerEl.querySelectorAll("li"),
				i = 0,
				slideEl;

			scope.numSlides = slidesEl.length;
			scope.curSlide = 1;   
			scope.$watch(
				'curSlide',
				function (num) {
					num = (num % scope.numSlides) + 1;
					containerEl.style.left = (-1 * 100 * (num - 1)) + '%';
				}
			);

			el.style.position = 'relative';
			el.style.overflow = 'hidden';

			containerEl.style.position = 'absolute';
			containerEl.style.width = (scope.numSlides * 100) + '%';
			containerEl.style.listStyleType = 'none';
			containerEl.style.margin = 0;
			containerEl.style.padding = 0;
			containerEl.style.transition = '1s';

			for (i = 0; i < slidesEl.length; i += 1) {
				slideEl = slidesEl[i];
				slideEl.style.display = 'inline-block';
				slideEl.style.width = (100 / scope.numSlides) + '%';
			}
		};
    }
);

msos.onload_func_done.push(
	function demo_start_onload() {
		"use strict";

		angular.bootstrap('body', ['demo.swipe.start']);
	}
);
