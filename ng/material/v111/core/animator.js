
/*!
 * Angular Material Design
 * https://github.com/angular/material
 * @license MIT
 * v1.1.1
 */

/*global
    msos: false,
    angular: false,
    ng: false,
    Modernizr: false,
    _: false
*/

msos.provide("ng.material.v111.core.animator");
msos.require("ng.material.v111.core");

ng.material.v111.core.animator.version = new msos.set_version(16, 12, 29);


angular.module(
	'ng.material.v111.core.animator',
	[
		'ng',
		'ng.material.v111.core'
	]
).factory(
	'$$mdAnimate',
	['$q', '$timeout', '$mdConstant', '$animateCss', '$mdUtil', function mdAnimateFactory($q, $timeout, $mdConstant, $animateCss, $mdUtil) {
		"use strict";

		var self = {

			translate3d: function (target, from, to, options) {

				function reverseTranslate(newFrom) {
					return $animateCss(target, {
						to: newFrom || from,
						addClass: options.transitionOutClass,
						removeClass: options.transitionInClass
					}).start();
				}

				return $animateCss(target, {
						from: from,
						to: to,
						addClass: options.transitionInClass,
						removeClass: options.transitionOutClass
					})
					.start()
					.then(function () {
						// Resolve with reverser function...
						return reverseTranslate;
					});
			},
			waitTransitionEnd: function (element, opts) {
				var TIMEOUT = 3000; // fallback is 3 secs

				return $q(function (resolve, reject_na) {
					var timer;

					opts = opts || {};

					function noTransitionFound(styles) {
						styles = styles || window.getComputedStyle(element[0]);

						return styles.transitionDuration === '0s' || (!styles.transition && !styles.transitionProperty);
					}

					if (noTransitionFound(opts.cachedTransitionStyles)) {
						TIMEOUT = 0;
					}

					function finished(ev) {

						if (ev && ev.target !== element[0]) { return; }

						if (ev) { $timeout.cancel(timer); }

						element.off($mdConstant.CSS.TRANSITIONEND, finished);
		
						resolve();
					}

					timer = $timeout(finished, opts.timeout || TIMEOUT);

					element.on($mdConstant.CSS.TRANSITIONEND, finished);

				}, 'ng_md_rr_waitTransitionEnd');
			},
			calculateTransformValues: function (element, originator) {
				var origin = originator.element,
					bounds = originator.bounds,
					originBnds,
					dialogRect,
					dialogCenterPt,
					originCenterPt;

				function currentBounds() {
					var cntr = element ? element.parent() : null,
						parent = cntr ? cntr.parent() : null;

					return parent ? self.clientRect(parent) : null;
				}

				if (origin || bounds) {

					originBnds = origin ? self.clientRect(origin) || currentBounds() : self.copyRect(bounds);
					dialogRect = self.copyRect(element[0].getBoundingClientRect());
					dialogCenterPt = self.centerPointFor(dialogRect);
					originCenterPt = self.centerPointFor(originBnds);

					return {
						centerX: originCenterPt.x - dialogCenterPt.x,
						centerY: originCenterPt.y - dialogCenterPt.y,
						scaleX: Math.round(100 * Math.min(0.5, originBnds.width / dialogRect.width)) / 100,
						scaleY: Math.round(100 * Math.min(0.5, originBnds.height / dialogRect.height)) / 100
					};
				}

				return {
					centerX: 0,
					centerY: 0,
					scaleX: 0.5,
					scaleY: 0.5
				};
			},
			calculateZoomToOrigin: function (element, originator) {
				var zoomTemplate = "translate3d( {centerX}px, {centerY}px, 0 ) scale( {scaleX}, {scaleY} )",
					buildZoom = angular.bind(null, $mdUtil.supplant, zoomTemplate);

				return buildZoom(self.calculateTransformValues(element, originator));
			},
			calculateSlideToOrigin: function (element, originator) {
				var slideTemplate = "translate3d( {centerX}px, {centerY}px, 0 )",
					buildSlide = angular.bind(null, $mdUtil.supplant, slideTemplate);

				return buildSlide(self.calculateTransformValues(element, originator));
			},
			toCss: function (raw) {
				var css = {},
					lookups = 'left top right bottom width height x y min-width min-height max-width max-height';

				function convertToVendor(vendor, value) {
					angular.forEach(
						vendor.split(' '),
						function (key) {
							css[key] = value;
						}
					);
				}

				angular.forEach(raw, function (value, key) {
					if (angular.isUndefined(value)) { return; }

					if (lookups.indexOf(key) >= 0) {
						css[key] = value + 'px';
					} else {
						switch (key) {
							case 'transition':
								convertToVendor($mdConstant.CSS.TRANSITION, value);
								break;
							case 'transform':
								convertToVendor($mdConstant.CSS.TRANSFORM, value);
								break;
							case 'transformOrigin':
								convertToVendor($mdConstant.CSS.TRANSFORM_ORIGIN, value);
								break;
							case 'font-size':
								css['font-size'] = value; // font sizes aren't always in px
								break;
						}
					}
				});

				return css;
			},
			toTransformCss: function (transform, addTransition, transition) {
				var css = {};

				angular.forEach(
					$mdConstant.CSS.TRANSFORM.split(' '),
					function (key) {
						css[key] = transform;
					}
				);

				if (addTransition) {
					transition = transition || "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) !important";
					css.transition = transition;
				}

				return css;
			},
			copyRect: function (source, destination) {

				if (!source) { return null; }

				destination = destination || {};

				angular.forEach(
					['left', 'top', 'right', 'bottom', 'width', 'height'],
					function (key) {
						destination[key] = Math.round(source[key]);
					}
				);

				destination.width = destination.width || (destination.right - destination.left);
				destination.height = destination.height || (destination.bottom - destination.top);

				return destination;
			},
			clientRect: function (element) {
				var bounds = angular.element(element)[0].getBoundingClientRect(),
					isPositiveSizeClientRect = function (rect) {
						return rect && (rect.width > 0) && (rect.height > 0);
					};

				// If the event origin element has zero size, it has probably been hidden.
				return isPositiveSizeClientRect(bounds) ? self.copyRect(bounds) : null;
			},
			centerPointFor: function (targetRect) {
				return targetRect ? {
					x: Math.round(targetRect.left + (targetRect.width / 2)),
					y: Math.round(targetRect.top + (targetRect.height / 2))
				} : {
					x: 0,
					y: 0
				};
			}
		};

		return self;
	}]
);
