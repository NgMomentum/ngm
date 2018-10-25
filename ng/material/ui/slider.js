
/**
 * @ngdoc module
 * @name material.components.slider
 *
 */

/*global
    msos: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.slider");
msos.require("ng.material.core.gestures");
msos.require("ng.material.core.theming");
msos.require("ng.material.ui.aria");

ng.material.ui.slider.version = new msos.set_version(18, 9, 2);

// Load AngularJS-Material module specific CSS
ng.material.ui.slider.css = new msos.loader();
ng.material.ui.slider.css.load(msos.resource_url('ng', 'material/css/ui/slider.css'));


function SliderContainerDirective() {
	"use strict";

	var temp_sc = 'ng.material.ui.slider - SliderDirective - compile';

    return {
        controller: function slider_cont_dumby_ctrl() {},
        compile: function (elem) {
            var slider = elem.find('md-slider');

			msos.console.debug(temp_sc + ' -> start.');

            if (!slider) {
				msos.console.debug(temp_sc + ' ->  done, no slider found.');
                return;
            }

            if (slider.attr('md-vertical')) {
                elem.attr('md-vertical', '');
            }

            if (!slider.attr('flex')) {
                slider.attr('flex', '');
            }

			msos.console.debug(temp_sc + ' ->  done!');

            return function postLink(scope, element, attr, ctrl) {
				var stopDisabledWatch = angular.noop,
					initialMaxWidth;

                element.addClass('_md'); // private md component indicator for styling

                function setDisable(value) {
                    element.children().attr('disabled', value);
                    element.find('input').attr('disabled', value);
                }

                if (attr.disabled) {
                    setDisable(true);
                } else if (attr.ngDisabled) {
                    stopDisabledWatch = scope.$watch(
						attr.ngDisabled,
						function (value) { setDisable(value); }
					);
                }

                scope.$on(
					'$destroy',
					function ng_md_ui_slider_cont_postlink_on() {
						stopDisabledWatch();
					}
				);

                ctrl.fitInputWidthToTextLength = function (length) {
                    var input = element[0].querySelector('md-input-container'),
						computedStyle,
						minWidth,
						padding,
						newMaxWidth;

                    if (input) {
                        computedStyle = getComputedStyle(input);
                        minWidth = parseInt(computedStyle.minWidth);
                        padding = parseInt(computedStyle.paddingLeft) + parseInt(computedStyle.paddingRight);

                        initialMaxWidth = initialMaxWidth || parseInt(computedStyle.maxWidth);
                        newMaxWidth = Math.max(initialMaxWidth, minWidth + padding + (minWidth / 2 * length));

                        input.style.maxWidth = newMaxWidth + 'px';
                    }
                };
            };
        }
    };
}

function SliderDirective($window, $mdAria, $mdUtil, $mdConstant, $mdTheming, $mdGesture, $parse, $log, $timeout) {
	"use strict";

    function postLink(scope, element, attr, ctrls) {

        $mdTheming(element);

        var temp_pl = 'ng.material.ui.slider - SliderDirective - postLink - ',
			ngModelCtrl = ctrls[0] || {
				$setViewValue: function (val) {
					this.$viewValue = val;
					this.$viewChangeListeners.forEach(function (cb) { cb(); });
				},
				$parsers: [],
				$formatters: [],
				$viewChangeListeners: []
			},
			containerCtrl = ctrls[1],
			isDisabled = attr.ngDisabled ? angular.bind(null, $parse(attr.ngDisabled), scope.$parent) : function () {
				return element[0].hasAttribute('disabled');
			},
			thumb = angular.element(element[0].querySelector('.md-thumb')),
			thumbText = angular.element(element[0].querySelector('.md-thumb-text')),
			thumbContainer = thumb.parent(),
			trackContainer = angular.element(element[0].querySelector('.md-track-container')),
			activeTrack = angular.element(element[0].querySelector('.md-track-fill')),
			tickContainer = angular.element(element[0].querySelector('.md-track-ticks')),
			wrapper = angular.element(element[0].getElementsByClassName('md-slider-wrapper')),
			throttledRefreshDimensions = $mdUtil.throttle(refreshSliderDimensions, 5000),
			DEFAULT_ROUND = 3,
			vertical = angular.isDefined(attr.mdVertical),
			discrete = angular.isDefined(attr.mdDiscrete),
			invert = angular.isDefined(attr.mdInvert),
			stopDisabledWatch = angular.noop,
			debouncedUpdateAll,
			min,
			max,
			step,
			round,
			tickCanvas,
			tickCtx,
			sliderDimensions = {},
			isDragging = false;

		if (angular.isDefined(attr.min)) { attr.$observe('min', updateMin); }
		else { updateMin(0); }

		if (angular.isDefined(attr.max)) { attr.$observe('max', updateMax); }
		else { updateMax(100); }

		if (angular.isDefined(attr.step)) { attr.$observe('step', updateStep); }
		else { updateStep(1); }

		if (angular.isDefined(attr.round)) { attr.$observe('round', updateRound); }
		else { updateRound(DEFAULT_ROUND); }

        if (attr.ngDisabled) {
            stopDisabledWatch = scope.$parent.$watch(
				attr.ngDisabled,
				updateAriaDisabled
			);
        }

        $mdGesture.register(
			wrapper,
			'drag',
			{ horizontal: !vertical }
		);

        scope.mouseActive = false;

        wrapper
            .on('keydown', keydownListener)
            .on('mousedown', mouseDownListener)
            .on('focus', focusListener)
            .on('blur', blurListener)
            .on('$md.pressdown', onPressDown)
            .on('$md.pressup', onPressUp)
            .on('$md.dragstart', onDragStart)
            .on('$md.drag', onDrag)
            .on('$md.dragend', onDragEnd);

        // On resize, recalculate the slider's dimensions and re-render
        function updateAll() {
            refreshSliderDimensions();
            ngModelRender();
        }

        setTimeout(updateAll, 0);

        debouncedUpdateAll = _.throttle(updateAll, 100);
        angular.element($window).on('resize', debouncedUpdateAll);

        scope.$on(
			'$destroy',
			function ng_md_ui_slider_dir_postlink_on() {
				angular.element($window).off('resize', debouncedUpdateAll);
			}
		);

        ngModelCtrl.$render = ngModelRender;
        ngModelCtrl.$viewChangeListeners.push(ngModelRender);
        ngModelCtrl.$formatters.push(minMaxValidator);
        ngModelCtrl.$formatters.push(stepValidator);

        function updateMin(value) {
            min = parseFloat(value);
			ngModelCtrl.$viewValue = minMaxValidator(ngModelCtrl.$modelValue, min, max);
            element.attr('aria-valuemin', value);
            updateAll();
        }

        function updateMax(value) {
            max = parseFloat(value);
			ngModelCtrl.$viewValue = minMaxValidator(ngModelCtrl.$modelValue, min, max);
            element.attr('aria-valuemax', value);
            updateAll();
        }

        function updateStep(value) {
            step = parseFloat(value);
        }

        function updateRound(value) {
            // Set max round digits to 6, after 6 the input uses scientific notation
            round = minMaxValidator(parseInt(value), 0, 6);
        }

        function updateAriaDisabled() {
            element.attr('aria-disabled', !!isDisabled());
        }

        function redrawTicks() {

            if (!discrete || isDisabled()) { return; }
            if (angular.isUndefined(step)) { return; }

            var numSteps = Math.floor((max - min) / step),
				dimensions,
				msg,
				distance,
				i = 0,
				trackTicksStyle;

            if (step <= 0) {
                msg = 'Slider step value must be greater than zero when in discrete mode';
                $log.error(msg);
                throw new Error(msg);
            }

            if (!tickCanvas) {
                tickCanvas = angular.element('<canvas>').css('position', 'absolute');
                tickContainer.append(tickCanvas);

                tickCtx = tickCanvas[0].getContext('2d');
            }

            dimensions = getSliderDimensions();

            // If `dimensions` doesn't have height and width it might be the first attempt so we will refresh dimensions
            if (dimensions && !dimensions.height && !dimensions.width) {
                refreshSliderDimensions();
                dimensions = sliderDimensions;
            }

            tickCanvas[0].width = dimensions.width;
            tickCanvas[0].height = dimensions.height;

            for (i = 0; i <= numSteps; i += 1) {

                trackTicksStyle = $window.getComputedStyle(tickContainer[0]);
                tickCtx.fillStyle = trackTicksStyle.color || 'black';

                distance = Math.floor((vertical ? dimensions.height : dimensions.width) * (i / numSteps));

                tickCtx.fillRect(
					vertical && distance >= 1 ? 0 : distance - 1,
                    vertical && distance >= 1 ? distance - 1 : 0,
                    vertical ? dimensions.width : 2,
                    vertical ? 2 : dimensions.height);
            }
        }

        function clearTicks() {
            if (tickCanvas && tickCtx) {
                var dimensions = getSliderDimensions();
                tickCtx.clearRect(0, 0, dimensions.width, dimensions.height);
            }
        }

        function refreshSliderDimensions() {
            sliderDimensions = trackContainer[0].getBoundingClientRect();
			msos.console.debug(temp_pl + 'refreshSliderDimensions -> sliderDimensions:', sliderDimensions);
        }

		refreshSliderDimensions();

        function getSliderDimensions() {
            throttledRefreshDimensions();
            return sliderDimensions;
        }

        function keydownListener(ev) {

            if (isDisabled()) { return; }

            var changeAmount;

            if (vertical ? ev.keyCode === $mdConstant.KEY_CODE.DOWN_ARROW : ev.keyCode === $mdConstant.KEY_CODE.LEFT_ARROW) {
                changeAmount = -step;
            } else if (vertical ? ev.keyCode === $mdConstant.KEY_CODE.UP_ARROW : ev.keyCode === $mdConstant.KEY_CODE.RIGHT_ARROW) {
                changeAmount = step;
            }

            changeAmount = invert ? -changeAmount : changeAmount;

            if (changeAmount) {
                if (ev.metaKey || ev.ctrlKey || ev.altKey) {
                    changeAmount *= 4;
                }
                ev.preventDefault();
                ev.stopPropagation();
                scope.$evalAsync(function () {
                    setModelValue(ngModelCtrl.$viewValue + changeAmount);
                });
            }
        }

        function mouseDownListener() {
            redrawTicks();

            scope.mouseActive = true;
            wrapper.removeClass('md-focused');

            $timeout(
				function () {
					scope.mouseActive = false;
				},
				100,
				false
			);
        }

        function focusListener() {
            if (scope.mouseActive === false) {
                wrapper.addClass('md-focused');
            }
        }

        function blurListener() {
            wrapper.removeClass('md-focused');
            element.removeClass('md-active');
            clearTicks();
        }

        function setModelValue(value) {
            ngModelCtrl.$setViewValue(minMaxValidator(stepValidator(value)));
        }

        function ngModelRender() {

            if (isNaN(ngModelCtrl.$viewValue)) {
                ngModelCtrl.$viewValue = ngModelCtrl.$modelValue;
            }

            ngModelCtrl.$viewValue = minMaxValidator(ngModelCtrl.$viewValue);

            var percent = valueToPercent(ngModelCtrl.$viewValue);

            scope.modelValue = ngModelCtrl.$viewValue;
            element.attr('aria-valuenow', ngModelCtrl.$viewValue);
            setSliderPercent(percent);
            thumbText.text(ngModelCtrl.$viewValue);
        }

        function minMaxValidator(value, minValue, maxValue) {
            if (angular.isNumber(value)) {
                minValue = angular.isNumber(minValue) ? minValue : min;
                maxValue = angular.isNumber(maxValue) ? maxValue : max;

                return Math.max(minValue, Math.min(maxValue, value));
            }
        }

        function stepValidator(value) {
            if (angular.isNumber(value)) {
                var formattedValue = (Math.round((value - min) / step) * step + min);
                formattedValue = (Math.round(formattedValue * Math.pow(10, round)) / Math.pow(10, round));

                if (containerCtrl && containerCtrl.fitInputWidthToTextLength) {
                    $mdUtil.debounce(
						function () {
							containerCtrl.fitInputWidthToTextLength(formattedValue.toString().length);
						},
						100,
						null,
						false
					)();
                }

                return formattedValue;
            }
        }

        function setSliderPercent(percent) {

            percent = clamp(percent);

            var thumbPosition = (percent * 100) + '%',
				activeTrackPercent = invert ? (1 - percent) * 100 + '%' : thumbPosition;

            if (vertical) {
                thumbContainer.css('bottom', thumbPosition);
            } else {
                $mdUtil.bidiProperty(thumbContainer, 'left', 'right', thumbPosition);
            }

            activeTrack.css(vertical ? 'height' : 'width', activeTrackPercent);

            element.toggleClass((invert ? 'md-max' : 'md-min'), percent === 0);
            element.toggleClass((invert ? 'md-min' : 'md-max'), percent === 1);
        }

        function onPressDown(ev) {

            if (isDisabled()) return;

            element.addClass('md-active');
            element[0].focus();
            refreshSliderDimensions();

            var exactVal = percentToValue(positionToPercent(vertical ? ev.pointer.y : ev.pointer.x)),
				closestVal = minMaxValidator(stepValidator(exactVal));

            scope.$apply(
				function () {
					setModelValue(closestVal);
					setSliderPercent(valueToPercent(closestVal));
				}
			);
        }

        function onPressUp(ev) {

            if (isDisabled()) return;

            element.removeClass('md-dragging');

            var exactVal = percentToValue(positionToPercent(vertical ? ev.pointer.y : ev.pointer.x)),
				closestVal = minMaxValidator(stepValidator(exactVal));

            scope.$apply(
				function () {
					setModelValue(closestVal);
					ngModelRender();
				}
			);
        }

        function onDragStart(ev) {

            if (isDisabled()) { return; }

            isDragging = true;

            ev.stopPropagation();

            element.addClass('md-dragging');
            setSliderFromEvent(ev);
        }

        function onDrag(ev) {

            if (!isDragging) { return; }

            ev.stopPropagation();
            setSliderFromEvent(ev);
        }

        function onDragEnd(ev) {
            if (!isDragging) { return; }

            ev.stopPropagation();
            isDragging = false;
        }

        function setSliderFromEvent(ev) {
            // While panning discrete, update only the
            // visual positioning but not the model value.
            if (discrete) {
				adjustThumbPosition(vertical ? ev.pointer.y : ev.pointer.x);
			} else {
				doSlide(vertical ? ev.pointer.y : ev.pointer.x);
			}
        }

        function doSlide(x) {

			msos.console.debug(temp_pl + 'doSlide -> x: ' + x);

            scope.$evalAsync(
				function () {
					setModelValue(percentToValue(positionToPercent(x)));
				}
			);
        }

        function adjustThumbPosition(x) {
            var exactVal = percentToValue(positionToPercent(x)),
				closestVal = minMaxValidator(stepValidator(exactVal));

			msos.console.debug(temp_pl + 'adjustThumbPosition -> exactVal: ' + exactVal + ', closestVal: ' + closestVal);

            setSliderPercent(positionToPercent(x));
            thumbText.text(closestVal);
        }

        function clamp(value) {
            return Math.max(0, Math.min(value || 0, 1));
        }

        function positionToPercent(position) {
            var offset = vertical ? sliderDimensions.top : sliderDimensions.left,
				size = vertical ? sliderDimensions.height : sliderDimensions.width,
				calc = (position - offset) / size,
				output = 0;

            if (!vertical && $mdUtil.bidi() === 'rtl') {
                calc = 1 - calc;
            }

			output = Math.max(0, Math.min(1, vertical ? 1 - calc : calc));

			msos.console.debug(temp_pl + 'positionToPercent -> position: ' + position + ', offset: ' + offset + ', size: ' + size + ', calc: ' + calc + ', output: ' + output);

			return output;
        }

        function percentToValue(percent) {
            var adjustedPercent = invert ? (1 - percent) : percent;
            return (min + adjustedPercent * (max - min));
        }

        function valueToPercent(val) {
            var percent = (val - min) / (max - min);
            return invert ? (1 - percent) : percent;
        }
    }

    function compile(tElement, tAttrs) {
        var wrapper = angular.element(tElement[0].getElementsByClassName('md-slider-wrapper')),
			tabIndex = tAttrs.tabindex || 0;

        wrapper.attr('tabindex', tabIndex);

        if (tAttrs.disabled || tAttrs.ngDisabled) { wrapper.attr('tabindex', -1); }

        tElement.attr('role', 'slider');

        $mdAria.expect(tElement, 'aria-label');

        return postLink;
    }

    return {
        scope: {},
        require: ['?ngModel', '?^mdSliderContainer'],
        template: '<div class="md-slider-wrapper">' +
            '<div class="md-slider-content">' +
            '<div class="md-track-container">' +
            '<div class="md-track"></div>' +
            '<div class="md-track md-track-fill"></div>' +
            '<div class="md-track-ticks"></div>' +
            '</div>' +
            '<div class="md-thumb-container">' +
            '<div class="md-thumb"></div>' +
            '<div class="md-focus-thumb"></div>' +
            '<div class="md-focus-ring"></div>' +
            '<div class="md-sign">' +
            '<span class="md-thumb-text"></span>' +
            '</div>' +
            '<div class="md-disabled-thumb"></div>' +
            '</div>' +
            '</div>' +
            '</div>',
        compile: compile
    };
}


angular.module(
    'ng.material.ui.slider',
	[
		'ng',
		'ng.material.ui.aria',
		'ng.material.core.gestures',
		'ng.material.core.theming'
	]
).directive(
    'mdSlider',
	["$window", "$mdAria", "$mdUtil", "$mdConstant", "$mdTheming", "$mdGesture", "$parse", "$log", "$timeout", SliderDirective]
).directive(
    'mdSliderContainer',
    SliderContainerDirective
).directive(
    'mdThumb',
    angular.restrictEDir
).directive(
    'mdTrack',
    angular.restrictEDir
).directive(
    'mdSign',
    angular.restrictEDir
).directive(
    'mdDiscrete',
    angular.restrictADir
).directive(
    'mdVertical',
    angular.restrictADir
);
