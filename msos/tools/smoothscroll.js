
/*
 * https://github.com/alicelieutier/smoothScroll/
 * A teeny tiny, standard compliant, smooth scroll script with ease-in-out effect and no jQuery (or any other dependancy, FWIW).
 * MIT License
 */

// Highly modified version for MobileSiteOS

/*global
	msos: false
*/

msos.provide("msos.tools.smoothscroll");

msos.tools.smoothscroll.version = new msos.set_version(16, 3, 23);


msos.tools.smoothscroll.fn = function (el_id, duration, callback, context) {
    "use strict";

	duration = duration || 750;
	context = context || window;

    var temp_us = 'msos.tools.smoothscroll.fn -> ',
        getTop = function (element) {
            if (element.nodeName === 'HTML') {
                return -window.pageYOffset;
            }
            return element.getBoundingClientRect().top + window.pageYOffset;
        },
        easeInOutCubic = function (t) {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        },
        position = function (start, end, elapsed, duration) {
            if (elapsed > duration) { return end; }
            return start + (end - start) * easeInOutCubic(elapsed / duration);
        },
        start = window.pageYOffset,
        scroll_to_el,
        end = 0,
        clock = Date.now(),
        requestAnimationFrame =
			window.requestAnimationFrame
		 || window.mozRequestAnimationFrame
		 || window.webkitRequestAnimationFrame
		 || function (fn) { window.setTimeout(fn, 15); },
        step;

	if (typeof el_id === 'number') {

		msos.console.debug(temp_us + 'start, for y: ' + el_id);
		end = parseInt(el_id, 10);

	} else {

		msos.console.debug(temp_us + 'start, for id: ' + el_id);
		scroll_to_el = document.getElementById(el_id);

		if (scroll_to_el) {
			end = getTop(scroll_to_el);
		} else {
			msos.console.warn(temp_us + 'scroll to element na.');
		}
	}

	step = function () {
		var elapsed = Date.now() - clock;

		if (context !== window) {
			context.scrollTop = position(start, end, elapsed, duration);
		} else {
			window.scroll(0, position(start, end, elapsed, duration));
		}

		if (elapsed > duration) {
			if (scroll_to_el && typeof callback === 'function') { callback(scroll_to_el); }
		} else {
			requestAnimationFrame(step);
		}
	};

	// Initiate
	step();

	msos.console.debug(temp_us + 'done!');
};
