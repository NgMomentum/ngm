
/**
 * @ngdoc module
 * @name material.components.switch
 */

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.switch");
msos.require("ng.material.core.gestures");
msos.require("ng.material.ui.checkbox");

ng.material.ui.switch.version = new msos.set_version(18, 4, 17);


function MdSwitch(mdCheckboxDirective, $mdUtil, $mdConstant, $parse, $$rAF, $mdGesture, $timeout) {
	var checkboxDirective = mdCheckboxDirective[0];

	function mdSwitchCompile(element, attr) {
		var checkboxLink = checkboxDirective.compile(element, attr).post;

		// No transition on initial load.
		element.addClass('md-dragging');

		return function (scope, element, attr, ctrls) {
			var ngModel = ctrls[1] || $mdUtil.fakeNgModel(),
				disabledGetter = null,
				thumbContainer,
				switchContainer,
				labelContainer,
				drag;

			if (attr.disabled !== null && attr.disabled !== undefined) {
				disabledGetter = function () { return true; };
			} else if (attr.ngDisabled) {
				disabledGetter = $parse(attr.ngDisabled);
			}

			thumbContainer =  angular.element(element[0].querySelector('.md-thumb-container'));
			switchContainer = angular.element(element[0].querySelector('.md-container'));
			labelContainer =  angular.element(element[0].querySelector('.md-label'));

			// no transition on initial load
			$$rAF(
				function () { element.removeClass('md-dragging'); }
			);

			checkboxLink(scope, element, attr, ctrls);

			if (disabledGetter) {
				scope.$watch(
					disabledGetter,
					function (isDisabled) {
						element.attr('tabindex', isDisabled ? -1 : 0);
					}
				);
			}

			attr.$observe(
				'mdInvert',
				function (newValue) {
					var isInverted = $mdUtil.parseAttributeBoolean(newValue);

					if (isInverted) {
						element.prepend(labelContainer);
					} else {
						element.prepend(switchContainer);
					}

					// Toggle a CSS class to update the margin.
					element.toggleClass('md-inverted', isInverted);
				}
			);

			// These events are triggered by setup drag
			$mdGesture.register(switchContainer, 'drag');

			function applyModelValue(newValue) {
				scope.$apply(
					function () {
						ngModel.$setViewValue(newValue);
						ngModel.$render();
					}
				);
			}

			function onDragStart(ev) {
				// Don't go if the switch is disabled.
				if (disabledGetter && disabledGetter(scope)) { return; }

				ev.stopPropagation();

				element.addClass('md-dragging');
				drag = { width: thumbContainer.prop('offsetWidth') };
			}

			function onDrag(ev) {
				var percent,
					translate;

				if (!drag) { return; }

				ev.stopPropagation();

				if (ev.srcEvent) {
					ev.srcEvent.preventDefault();
				}

				percent = ev.pointer.distanceX / drag.width;
				translate = ngModel.$viewValue ?  1 + percent : percent;

				// Make sure the switch stays inside its bounds, 0-1%
				translate = Math.max(0, Math.min(1, translate));

				thumbContainer.css($mdConstant.CSS.TRANSFORM, 'translate3d(' + (100*translate) + '%,0,0)');
				drag.translate = translate;
			}

			function onDragEnd(ev) {
				var isChanged;

				if (!drag) { return; }

				ev.stopPropagation();

				element.removeClass('md-dragging');
				thumbContainer.css($mdConstant.CSS.TRANSFORM, '');

				
				isChanged = ngModel.$viewValue ? drag.translate < 0.5 : drag.translate > 0.5;

				if (isChanged) {
					applyModelValue(!ngModel.$viewValue);
				}

				drag = null;

				// Wait for incoming mouse click
				scope.skipToggle = true;

				$timeout(
					function () { scope.skipToggle = false; },
					1,
					false
				);
			}

			switchContainer
				.on('$md.dragstart', onDragStart)
				.on('$md.drag', onDrag)
				.on('$md.dragend', onDragEnd);
		};
	}

	return {
		restrict: 'E',
		priority: $mdConstant.BEFORE_NG_ARIA,
		transclude: true,
		template:
			'<div class="md-container">' +
				'<div class="md-bar"></div>' +
				'<div class="md-thumb-container">' +
					'<div class="md-thumb" md-ink-ripple md-ink-ripple-checkbox></div>' +
				'</div>'+
			'</div>' +
			'<div ng-transclude class="md-label"></div>',
		require: ['^?mdInputContainer', '?ngModel', '?^form'],
		compile: mdSwitchCompile
	};
}


angular.module(
	'ng.material.ui.switch',
	['ng', 'ng.material.core', 'ng.material.core.gestures', 'ng.material.ui.checkbox']
).directive(
	'mdSwitch',
	["mdCheckboxDirective", "$mdUtil", "$mdConstant", "$parse", "$$rAF", "$mdGesture", "$timeout", MdSwitch]
);