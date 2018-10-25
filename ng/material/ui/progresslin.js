
/**
 * @ngdoc module
 * @name material.components.progressLinear
 * @description progressLinear module!
 */

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.progresslin");
msos.require("ng.material.core.theming");
msos.require("ng.material.core.animator");
msos.require("ng.material.ui.aria");

ng.material.ui.progresslin.version = new msos.set_version(18, 6, 24);

// Load AngularJS-Material module specific CSS
ng.material.ui.progresslin.css = new msos.loader();
ng.material.ui.progresslin.css.load(msos.resource_url('ng', 'material/css/ui/progresslin.css'));


function MdProgressLinearDirective($mdTheming, $mdUtil, $$mdAnimate) {
	"use strict";

	var MODE_DETERMINATE = "determinate",
		MODE_INDETERMINATE = "indeterminate",
		MODE_BUFFER = "buffer",
		MODE_QUERY = "query",
		DISABLED_CLASS = "_md-progress-linear-disabled",
		animator = $$mdAnimate($mdUtil);

	function clamp(value) {
		return Math.max(0, Math.min(value || 0, 100));
	}

	function postLink(scope, element, attr) {

		$mdTheming(element);

		var lastMode,
			isDisabled = attr.hasOwnProperty('disabled'),
			toVendorCSS = animator.toCss,
			bar1 = angular.element(element[0].querySelector('.md-bar1')),
			bar2 = angular.element(element[0].querySelector('.md-bar2')),
			container = angular.element(element[0].querySelector('.md-container'));

		element
			.attr('md-mode', mode())
			.toggleClass(DISABLED_CLASS, isDisabled);

		function mode() {
			var value = (attr.mdMode || "").trim();

			if (value) {
				switch (value) {
					case MODE_DETERMINATE:
					case MODE_INDETERMINATE:
					case MODE_BUFFER:
					case MODE_QUERY:
						break;
					default:
						value = MODE_INDETERMINATE;
						break;
				}
			}
			return value;
		}

		function animateIndicator(target, value) {
			if (isDisabled || !mode()) return;

			var to = $mdUtil.supplant("translateX({0}%) scale({1},1)", [(value - 100) / 2, value / 100]),
				styles = toVendorCSS({
					transform: to
				});

			angular.element(target).css(styles);
		}

		function watchAttributes() {
			attr.$observe(
				'value',
				function (value) {
					var percentValue = clamp(value);
					element.attr('aria-valuenow', percentValue);

					if (mode() != MODE_QUERY) animateIndicator(bar2, percentValue);
				}
			);

			attr.$observe(
				'mdBufferValue',
				function (value) {
					animateIndicator(bar1, clamp(value));
				}
			);

			attr.$observe(
				'disabled',
				function (value) {
					if (value === true || value === false) {
						isDisabled = !!value;
					} else {
						isDisabled = angular.isDefined(value);
					}

					element.toggleClass(DISABLED_CLASS, isDisabled);
					container.toggleClass(lastMode, !isDisabled);
				}
			);

			attr.$observe(
				'mdMode',
				function (mode) {
					if (lastMode) container.removeClass(lastMode);

					switch (mode) {
						case MODE_QUERY:
						case MODE_BUFFER:
						case MODE_DETERMINATE:
						case MODE_INDETERMINATE:
							container.addClass(lastMode = "md-mode-" + mode);
							break;
						default:
							container.addClass(lastMode = "md-mode-" + MODE_INDETERMINATE);
							break;
					}
				}
			);
		}

		function validateMode() {
			if (angular.isUndefined(attr.mdMode)) {
				var hasValue = angular.isDefined(attr.value),
					mode = hasValue ? MODE_DETERMINATE : MODE_INDETERMINATE;

				element.attr("md-mode", mode);
				attr.mdMode = mode;
			}
		}

		validateMode();
		watchAttributes();
	}

	function compile(tElement) {
		tElement.attr('aria-valuemin', 0);
		tElement.attr('aria-valuemax', 100);
		tElement.attr('role', 'progressbar');

		return postLink;
	}

	return {
		restrict: 'E',
		template: '<div class="md-container">' +
			'<div class="md-dashed"></div>' +
			'<div class="md-bar md-bar1"></div>' +
			'<div class="md-bar md-bar2"></div>' +
			'</div>',
		compile: compile
	};
}


angular.module(
    'ng.material.ui.progresslin',
    [
        'ng',
        'ng.material.core',
        'ng.material.core.theming',
		'ng.material.core.animator'
    ]
).directive(
	'mdProgressLinear',
    ["$mdTheming", "$mdUtil", "$$mdAnimate", MdProgressLinearDirective]
).directive(
	'mdBufferValue',
	angular.restrictADir
);

