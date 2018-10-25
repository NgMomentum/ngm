
/**
 * @ngdoc module
 * @name material.components.progressCircular
 * @description progressCircular module!
 */

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.progresscir");
msos.require("ng.material.core.theming");
msos.require("ng.material.ui.aria");

ng.material.ui.progresscir.version = new msos.set_version(18, 6, 24);

// Load AngularJS-Material module specific CSS
ng.material.ui.progresscir.css = new msos.loader();
ng.material.ui.progresscir.css.load(msos.resource_url('ng', 'material/css/ui/progresscir.css'));


function MdProgressCircularProvider() {
	"use strict";

	function linearEase(t, b, c, d) {
		return c * t / d + b;
	}

	function materialEase(t, b, c, d) {
		// via http://www.timotheegroleau.com/Flash/experiments/easing_function_generator.htm
		// with settings of [0, 0, 1, 1]
		var ts = (t /= d) * t,
			tc = ts * t;

		return b + c * (6 * tc * ts + -15 * ts * ts + 10 * tc);
	}

	var progressConfig = {
		progressSize: 50,
		strokeWidth: 10,
		duration: 100,
		easeFn: linearEase,

		durationIndeterminate: 1333,
		startIndeterminate: 1,
		endIndeterminate: 149,
		easeFnIndeterminate: materialEase,

		easingPresets: {
			linearEase: linearEase,
			materialEase: materialEase
		}
	};

	return {
		configure: function (options) {
			progressConfig = angular.extend(progressConfig, options || {});
			return progressConfig;
		},
		$get: function () {
			return progressConfig;
		}
	};
}

function MdProgressCircularDirective($window, $mdProgressCircular, $mdTheming, $mdUtil, $interval) {

	// Note that this shouldn't use $$rAF, because it can cause an infinite loop
	// in any tests that call $animate.flush.
	var rAF = $window.requestAnimationFrame ||
		$window.webkitRequestAnimationFrame ||
		angular.noop,
		cAF = $window.cancelAnimationFrame ||
		$window.webkitCancelAnimationFrame ||
		$window.webkitCancelRequestAnimationFrame ||
		angular.noop,
		MODE_DETERMINATE = 'determinate',
		MODE_INDETERMINATE = 'indeterminate',
		DISABLED_CLASS = '_md-progress-circular-disabled',
		INDETERMINATE_CLASS = 'md-mode-indeterminate';

	function MdProgressCircularLink(scope, element, attrs) {
		var node = element[0],
			svg = angular.element(node.querySelector('svg')),
			path = angular.element(node.querySelector('path')),
			startIndeterminate = $mdProgressCircular.startIndeterminate,
			endIndeterminate = $mdProgressCircular.endIndeterminate,
			iterationCount = 0,
			lastAnimationId = 0,
			lastDrawFrame,
			interval;

		$mdTheming(element);
		element.toggleClass(DISABLED_CLASS, attrs.hasOwnProperty('disabled'));

		if (scope.mdMode === MODE_INDETERMINATE) {
			startIndeterminateAnimation();
		}

		scope.$on(
			'$destroy',
			function ng_md_ui_prog_cir_link_on() {
				cleanupIndeterminateAnimation();

				if (lastDrawFrame) { cAF(lastDrawFrame); }
			}
		);

		scope.$watchGroup(
			['value', 'mdMode', function () {
				var isDisabled = node.disabled;

				if (isDisabled === true || isDisabled === false) {
					return isDisabled;
				}

				return angular.isDefined(element.attr('disabled'));
			}],
			function (newValues, oldValues) {
				var mode = newValues[1],
					isDisabled = newValues[2],
					wasDisabled = oldValues[2],
					newValue;

				if (isDisabled !== wasDisabled) {
					element.toggleClass(DISABLED_CLASS, !!isDisabled);
				}

				if (isDisabled) {
					cleanupIndeterminateAnimation();
				} else {
					if (mode !== MODE_DETERMINATE && mode !== MODE_INDETERMINATE) {
						mode = MODE_INDETERMINATE;
						attrs.$set('mdMode', mode);
					}

					if (mode === MODE_INDETERMINATE) {
						startIndeterminateAnimation();
					} else {
						newValue = clamp(newValues[0]);

						cleanupIndeterminateAnimation();

						element.attr('aria-valuenow', newValue);
						renderCircle(clamp(oldValues[0]), newValue);
					}
				}

			}
		);

		scope.$watch(
			'mdDiameter',
			function (newValue) {
				var diameter = getSize(newValue),
					strokeWidth = getStroke(diameter),
					value = clamp(scope.value),
					transformOrigin = (diameter / 2) + 'px',
					dimensions = {
						width: diameter + 'px',
						height: diameter + 'px'
					};

				svg[0].setAttribute('viewBox', '0 0 ' + diameter + ' ' + diameter);

				svg
					.css(dimensions)
					.css('transform-origin', transformOrigin + ' ' + transformOrigin + ' ' + transformOrigin);

				element.css(dimensions);

				path.attr('stroke-width', strokeWidth);
				path.attr('stroke-linecap', 'square');

				if (scope.mdMode == MODE_INDETERMINATE) {
					path.attr('d', getSvgArc(diameter, strokeWidth, true));
					path.attr('stroke-dasharray', (diameter - strokeWidth) * $window.Math.PI * 0.75);
					path.attr('stroke-dashoffset', getDashLength(diameter, strokeWidth, 1, 75));
				} else {
					path.attr('d', getSvgArc(diameter, strokeWidth, false));
					path.attr('stroke-dasharray', (diameter - strokeWidth) * $window.Math.PI);
					path.attr('stroke-dashoffset', getDashLength(diameter, strokeWidth, 0, 100));
					renderCircle(value, value);
				}
			}
		);

		function renderCircle(animateFrom, animateTo, easing, duration, iterationCount, maxValue) {
			var id = ++lastAnimationId,
				startTime = $mdUtil.now(),
				changeInValue = animateTo - animateFrom,
				diameter = getSize(scope.mdDiameter),
				strokeWidth = getStroke(diameter),
				ease = easing || $mdProgressCircular.easeFn,
				animationDuration = duration || $mdProgressCircular.duration,
				rotation = -90 * (iterationCount || 0),
				dashLimit = maxValue || 100;

			// No need to animate it if the values are the same
			if (animateTo === animateFrom) {
				renderFrame(animateTo);
			} else {
				lastDrawFrame = rAF(
					function animation() {
						var currentTime = $window.Math.max(0, $window.Math.min($mdUtil.now() - startTime, animationDuration));

						renderFrame(ease(currentTime, animateFrom, changeInValue, animationDuration));

						// Do not allow overlapping animations
						if (id === lastAnimationId && currentTime < animationDuration) {
							lastDrawFrame = rAF(animation);
						}
					}
				);
			}

			function renderFrame(value) {
				path.attr('stroke-dashoffset', getDashLength(diameter, strokeWidth, value, dashLimit));
				path.attr('transform', 'rotate(' + (rotation) + ' ' + diameter / 2 + ' ' + diameter / 2 + ')');
			}
		}

		function animateIndeterminate() {

			renderCircle(
				startIndeterminate,
				endIndeterminate,
				$mdProgressCircular.easeFnIndeterminate,
				$mdProgressCircular.durationIndeterminate,
				iterationCount,
				75
			);

			// The %4 technically isn't necessary, but it keeps the rotation
			// under 360, instead of becoming a crazy large number.
			iterationCount = ++iterationCount % 4;

		}

		function startIndeterminateAnimation() {
			if (!interval) {
				// Note that this interval isn't supposed to trigger a digest.
				interval = $interval(
					animateIndeterminate,
					$mdProgressCircular.durationIndeterminate,
					0,
					scope
				);

				animateIndeterminate();

				element
					.addClass(INDETERMINATE_CLASS)
					.removeAttr('aria-valuenow');
			}
		}

		function cleanupIndeterminateAnimation() {
			if (interval) {
				$interval.cancel(interval);
				interval = null;
				element.removeClass(INDETERMINATE_CLASS);
			}
		}
	}

	function getSvgArc(diameter, strokeWidth, indeterminate) {
		var radius = diameter / 2,
			offset = strokeWidth / 2,
			start = radius + ',' + offset,
			end = offset + ',' + radius,
			arcRadius = radius - offset;

		return 'M' + start +
			'A' + arcRadius + ',' + arcRadius + ' 0 1 1 ' + end +
			(indeterminate ? '' : 'A' + arcRadius + ',' + arcRadius + ' 0 0 1 ' + start); // loop to start
	}

	function getDashLength(diameter, strokeWidth, value, limit) {
		return (diameter - strokeWidth) * $window.Math.PI * ((3 * (limit || 100) / 100) - (value / 100));
	}

	function clamp(value) {
		return $window.Math.max(0, $window.Math.min(value || 0, 100));
	}

	function getSize(value) {
		var defaultValue = $mdProgressCircular.progressSize,
			parsed;

		if (value) {
			parsed = parseFloat(value);

			if (value.lastIndexOf('%') === value.length - 1) {
				parsed = (parsed / 100) * defaultValue;
			}

			return parsed;
		}

		return defaultValue;
	}

	function getStroke(diameter) {
		return $mdProgressCircular.strokeWidth / 100 * diameter;
	}

	return {
		restrict: 'E',
		scope: {
			value: '@',
			mdDiameter: '@',
			mdMode: '@'
		},
		template:	'<svg xmlns="http://www.w3.org/2000/svg">' +
						'<path fill="none"/>' +
					'</svg>',
		compile: function(element, attrs) {

			element.attr({
				'aria-valuemin': 0,
				'aria-valuemax': 100,
				'role': 'progressbar'
			});

			if (angular.isUndefined(attrs.mdMode)) {
				var mode = attrs.hasOwnProperty('value') ? MODE_DETERMINATE : MODE_INDETERMINATE;
				attrs.$set('mdMode', mode);
			} else {
				attrs.$set('mdMode', attrs.mdMode.trim());
			}

			return MdProgressCircularLink;
		}
	};
}


angular.module(
	'ng.material.ui.progresscir',
	['ng', 'ng.material.core', 'ng.material.core.theming']
).provider(
	"$mdProgressCircular",
	MdProgressCircularProvider
).directive(
	'mdProgressCircular',
	["$window", "$mdProgressCircular", "$mdTheming", "$mdUtil", "$interval", MdProgressCircularDirective]
);
