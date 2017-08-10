
/*	Overthrow v1.2.0
	An overflow:auto polyfill for responsive design. (c) 2012: Scott Jehl,
	Filament Group, Inc.
	http://filamentgroup.github.com/Overthrow/license.txt
*/

msos.provide("util.overthrow");


(function (w, o, undefined) {

	var doc = w.document,
		docElem = doc.documentElement,
		nativeOverflow =
			msos.config.browser.nativeoverflow ||
			(function () {
				var ua = w.navigator.userAgent,
					webkit = ua.match(/AppleWebKit\/([0-9]+)/),
					wkversion = webkit && webkit[1],
					wkLte534 = webkit && wkversion >= 534;

				return (
					ua.match(/Android ([0-9]+)/) && RegExp.$1 >= 3 && wkLte534 ||
					ua.match(/ Version\/([0-9]+)/) && RegExp.$1 >= 0 && w.blackberry && wkLte534 ||
					ua.indexOf("PlayBook") > -1 && wkLte534 && !ua.indexOf("Android 2") === -1 ||
					ua.match(/Firefox\/([0-9]+)/) && RegExp.$1 >= 4 ||
					ua.match(/wOSBrowser\/([0-9]+)/) && RegExp.$1 >= 233 && wkLte534 ||
					ua.match(/NokiaBrowser\/([0-9\.]+)/) && parseFloat(RegExp.$1) === 7.3 && webkit && wkversion >= 533
				);
			}());

	o.enabledClassName = "overthrow-enabled";
	o.addClass = function () {
		if (docElem.className.indexOf(o.enabledClassName) === -1) {
			docElem.className += " " + o.enabledClassName;
		}
	};

	o.removeClass = function () { docElem.className = docElem.className.replace( o.enabledClassName, "" ); };
	o.forget = function () { o.removeClass(); };
	o.support = nativeOverflow ? "native" : "none";
    o.set = function () { if (nativeOverflow) { o.addClass(); } };

    // Auto-init
    o.set();

}(window, util.overthrow));

/*! Overthrow. An overflow:auto polyfill for responsive design. (c) 2012: Scott Jehl, Filament Group, Inc. http://filamentgroup.github.com/Overthrow/license.txt */
(function (w, o, undefined) {

	o.scrollIndicatorClassName = "overthrow";

	var doc = w.document,
		docElem = doc.documentElement,
		// o api
		nativeOverflow = o.support === "native",
		canBeFilledWithPoly = o.canBeFilledWithPoly,
		configure = o.configure,
		set = o.set,
		forget = o.forget,
		scrollIndicatorClassName = o.scrollIndicatorClassName;

	// find closest overthrow (elem or a parent)
	o.closest = function (target, ascend) {
		return !ascend && target.className && target.className.indexOf( scrollIndicatorClassName ) > -1 && target || o.closest( target.parentNode );
	};
	
	// polyfill overflow
	var enabled = false;

	o.set = function () {

		set();

		// If nativeOverflow or it doesn't look like the browser canBeFilledWithPoly, our job is done here. Exit viewport left.
		if (enabled || nativeOverflow || !canBeFilledWithPoly) {
			return;
		}

		o.addClass();

		enabled = true;

		o.support = "polyfilled";

		o.forget = function () {
			forget();
			enabled = false;
			// Remove touch binding (check for method support since this part isn't qualified by touch support like the rest)
			if (doc.removeEventListener) {
				doc.removeEventListener("touchstart", start, false);
			}
		};

		var elem,
			lastTops = [],
			lastLefts = [],
			lastDown,
			lastRight,
			resetVertTracking = function () {
				lastTops = [];
				lastDown = null;
			},
			resetHorTracking = function () {
				lastLefts = [];
				lastRight = null;
			},
			inputs,
			setPointers = function (val) {
				inputs = elem.querySelectorAll("textarea, input");
				for (var i = 0, il = inputs.length; i < il; i++) {
					inputs[ i ].style.pointerEvents = val;
				}
			},

			// For nested overthrows, changeScrollTarget restarts a touch event cycle on a parent or child overthrow
			changeScrollTarget = function (startEvent, ascend) {
				if (doc.createEvent) {
					var newTarget = (!ascend || ascend === undefined) && elem.parentNode || elem.touchchild || elem,
						tEnd;
							
					if (newTarget !== elem) {
						tEnd = doc.createEvent("HTMLEvents");
						tEnd.initEvent("touchend", true, true);
						elem.dispatchEvent(tEnd);
						newTarget.touchchild = elem;
						elem = newTarget;
						newTarget.dispatchEvent(startEvent);
					}
				}
			},

			start = function (e) {

				// Stop any throw in progress
				if (o.intercept) {
					o.intercept();
				}

				// Reset the distance and direction tracking
				resetVertTracking();
				resetHorTracking();

				elem = o.closest(e.target);

				if (!elem || elem === docElem || e.touches.length > 1) {
					return;
				}			

				setPointers("none");

				var touchStartE = e,
					scrollT = elem.scrollTop,
					scrollL = elem.scrollLeft,
					height = elem.offsetHeight,
					width = elem.offsetWidth,
					startY = e.touches[ 0 ].pageY,
					startX = e.touches[ 0 ].pageX,
					scrollHeight = elem.scrollHeight,
					scrollWidth = elem.scrollWidth,

					// Touchmove handler
					move = function (e) {

						var ty = scrollT + startY - e.touches[ 0 ].pageY,
							tx = scrollL + startX - e.touches[ 0 ].pageX,
							down = ty >= (lastTops.length ? lastTops[ 0 ] : 0),
							right = tx >= (lastLefts.length ? lastLefts[ 0 ] : 0);
							
						// If there's room to scroll the current container, prevent the default window scroll
						if ((ty > 0 && ty < scrollHeight - height) || (tx > 0 && tx < scrollWidth - width)) {
							e.preventDefault();
						}
						// This bubbling is dumb. Needs a rethink.
						else {
							changeScrollTarget(touchStartE);
						}

						// If down and lastDown are inequal, the y scroll has changed direction. Reset tracking.
						if (lastDown && down !== lastDown) {
							resetVertTracking();
						}

						// If right and lastRight are inequal, the x scroll has changed direction. Reset tracking.
						if (lastRight && right !== lastRight) {
							resetHorTracking();
						}

						// remember the last direction in which we were headed
						lastDown = down;
						lastRight = right;							

						// set the container's scroll
						elem.scrollTop = ty;
						elem.scrollLeft = tx;

						lastTops.unshift(ty);
						lastLefts.unshift(tx);

						if (lastTops.length > 3) {
							lastTops.pop();
						}
						if (lastLefts.length > 3) {
							lastLefts.pop();
						}
					},

					// Touchend handler
					end = function (e) {

						// Bring the pointers back
						setPointers("auto");
						setTimeout(function () {
							setPointers("none");
						}, 450);
						elem.removeEventListener("touchmove", move, false);
						elem.removeEventListener("touchend", end, false);
					};

				elem.addEventListener("touchmove", move, false);
				elem.addEventListener("touchend", end, false);
			};

		// Bind to touch, handle move and end within
		doc.addEventListener("touchstart", start, false);
	};

}(window, util.overthrow));

