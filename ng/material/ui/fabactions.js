
/**
 * @ngdoc module
 * @name material.components.fabActions
 */

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.fabactions");

ng.material.ui.fabactions.version = new msos.set_version(18, 7, 12);

ng.material.ui.fabactions.cssAnimationDuration = 300;

// Load AngularJS-Material module specific CSS
ng.material.ui.fabactions.css = new msos.loader();
ng.material.ui.fabactions.css.load(msos.resource_url('ng', 'material/css/ui/fabactions.css'));


function MdFabActionsDirective($mdUtil) {
	return {
		restrict: 'E',
		require: ['^?mdFabSpeedDial', '^?mdFabToolbar'],
		compile: function (element) {
			var children = element.children(),
				hasNgRepeat = $mdUtil.prefixer().hasAttribute(children, 'ng-repeat');

			// Support both ng-repeat and static content
			if (hasNgRepeat) {
				children.addClass('md-fab-action-item');
			} else {
				// Wrap every child in a new div and add a class that we can scale/fling independently
				children.wrap('<div class="md-fab-action-item">');
			}
		}
	};
}

function MdFabController($scope, $element, $animate, $mdUtil, $mdConstant, $timeout) {
    var vm = this,
		initialAnimationAttempts = 0,
		closeTimeout;

	vm.open = function () {
		$scope.$evalAsync("vm.isOpen = true");
	};

	vm.close = function () {
		$scope.$evalAsync("vm.isOpen = false");
		$element.find('md-fab-trigger')[0].focus();
	};

	vm.toggle = function () {
		$scope.$evalAsync("vm.isOpen = !vm.isOpen");
	};

    function setupDefaults() {

		vm.direction = vm.direction || 'down';
		vm.isOpen = vm.isOpen || false;

		resetActionIndex();

		$element.addClass('md-animations-waiting');
    }

    function setupListeners() {
		var eventTypes = ['click', 'focusin', 'focusout'];

		angular.forEach(
			eventTypes,
			function (eventType) {
				$element.on(eventType, parseEvents);
			}
		);

		$scope.$on(
			'$destroy',
			function ng_md_ui_fabactions_ctrl_on() {
				angular.forEach(
					eventTypes,
					function (eventType) {
						$element.off(eventType, parseEvents);
					}
				);

				disableKeyboard();
			}
		);
	}

	vm.$onInit = function () {
		setupDefaults();
		setupListeners();
		setupWatchers();

		fireInitialAnimations();
	};

    function parseEvents(event) {

		if (event.type == 'click') {
			handleItemClick(event);
		}

		if (event.type == 'focusout' && !closeTimeout) {
			closeTimeout = $timeout(
				function () {
					vm.close();
				},
				100,
				false
			);
		}

		if (event.type == 'focusin' && closeTimeout) {
			$timeout.cancel(closeTimeout);
			closeTimeout = null;
		}
    }

    function resetActionIndex() {
		vm.currentActionIndex = -1;
    }

    function setupWatchers() {
		var trigger,
			actions;

		$scope.$watch(
			'vm.direction',
			function (newDir, oldDir) {

				$animate.removeClass($element, 'md-' + oldDir);
				$animate.addClass($element, 'md-' + newDir);

				resetActionIndex();
			}
		);

		$scope.$watch(
			'vm.isOpen',
			function (isOpen) {
				var toAdd,
					toRemove;

				resetActionIndex();

				if (!trigger || !actions) {
					trigger = getTriggerElement();
					actions = getActionsElement();
				}

				if (isOpen) {
					enableKeyboard();
				} else {
					disableKeyboard();
				}

				toAdd = isOpen ? 'md-is-open' : '';
				toRemove = isOpen ? '' : 'md-is-open';

				// Set the proper ARIA attributes
				trigger.attr('aria-haspopup', true);
				trigger.attr('aria-expanded', isOpen);
				actions.attr('aria-hidden', !isOpen);

				// Animate the CSS classes
				$animate.setClass($element, toAdd, toRemove);
			}
		);
    }

    function fireInitialAnimations() {

		if ($element[0].scrollHeight > 0) {
			$animate.addClass(
				$element,
				'_md-animations-ready'
			).then(
				function () {
					$element.removeClass('md-animations-waiting');
				}
			);
		} else if (initialAnimationAttempts < 10) {
			$timeout(
				fireInitialAnimations,
				100,
				false
			);
			initialAnimationAttempts = initialAnimationAttempts + 1;
		}
    }

    function enableKeyboard() {
		$element.on('keydown', keyPressed);

		$mdUtil.nextTick(
			function () {
				angular.element(document).on('click touchend', checkForOutsideClick);
			},
			false		// nextTick was undefined (default true)
		);
    }

    function disableKeyboard() {
		$element.off('keydown', keyPressed);
		angular.element(document).off('click touchend', checkForOutsideClick);
    }

    function checkForOutsideClick(event) {
		var closestTrigger,
			closestActions;

		if (event.target) {
			closestTrigger = $mdUtil.getClosest(event.target, 'md-fab-trigger');
			closestActions = $mdUtil.getClosest(event.target, 'md-fab-actions');

			if (!closestTrigger && !closestActions) {
				vm.close();
			}
		}
    }

    function keyPressed(event) {
		switch (event.which) {
			case $mdConstant.KEY_CODE.ESCAPE: vm.close(); event.preventDefault();
				return false;
			case $mdConstant.KEY_CODE.LEFT_ARROW: doKeyLeft(event);
				return false;
			case $mdConstant.KEY_CODE.UP_ARROW: doKeyUp(event);
				return false;
			case $mdConstant.KEY_CODE.RIGHT_ARROW: doKeyRight(event);
				return false;
			case $mdConstant.KEY_CODE.DOWN_ARROW: doKeyDown(event);
				return false;
		}
    }

    function doActionPrev(event) {
		focusAction(event, -1);
    }

    function doActionNext(event) {
		focusAction(event, 1);
    }

    function focusAction(event, direction) {
		var actions = resetActionTabIndexes(),
			focusElement;

		vm.currentActionIndex = vm.currentActionIndex + direction;
		vm.currentActionIndex = Math.min(actions.length - 1, vm.currentActionIndex);
		vm.currentActionIndex = Math.max(0, vm.currentActionIndex);

		focusElement = angular.element(actions[vm.currentActionIndex]).children()[0];

		angular.element(focusElement).attr('tabindex', 0);

		focusElement.focus();

		event.preventDefault();
		event.stopImmediatePropagation();
    }

    function resetActionTabIndexes() {
		var actions = getActionsElement()[0].querySelectorAll('.md-fab-action-item');

		angular.forEach(
			actions,
			function (action) {
				angular.element(angular.element(action).children()[0]).attr('tabindex', -1);
			}
		);

		return actions;
    }

    function doKeyLeft(event) {
		if (vm.direction === 'left') {
			doActionNext(event);
		} else {
			doActionPrev(event);
		}
    }

    function doKeyUp(event) {
		if (vm.direction === 'down') {
			doActionPrev(event);
		} else {
			doActionNext(event);
		}
    }

    function doKeyRight(event) {
		if (vm.direction === 'left') {
			doActionPrev(event);
		} else {
			doActionNext(event);
		}
    }

    function doKeyDown(event) {
		if (vm.direction === 'up') {
			doActionPrev(event);
		} else {
			doActionNext(event);
		}
    }

    function isTrigger(element) {
		return $mdUtil.getClosest(element, 'md-fab-trigger');
    }

    function isAction(element) {
		return $mdUtil.getClosest(element, 'md-fab-actions');
    }

    function handleItemClick(event) {
		if (isTrigger(event.target)) {
			vm.toggle();
		}

		if (isAction(event.target)) {
			vm.close();
		}
    }

    function getTriggerElement() {
		return $element.find('md-fab-trigger');
    }

    function getActionsElement() {
		return $element.find('md-fab-actions');
    }
}

function MdFabSpeedDialDirective() {
	"use strict";

    function FabSpeedDialLink(scope, element) {
		element.prepend('<div class="_md-css-variables"></div>');
    }

    return {
		restrict: 'E',
		scope: {
			direction: '@?mdDirection',
			isOpen: '=?mdOpen'
		},
		bindToController: true,
		controller: 'MdFabController',
		controllerAs: 'vm',

		link: FabSpeedDialLink
    };
}

function MdFabSpeedDialFlingAnimation($timeout) {

    function delayDone(done) {
		$timeout(
			done,
			ng.material.ui.fabactions.cssAnimationDuration,
			false
		);
	}

    function runAnimation(element) {

		if (element.hasClass('md-animations-waiting') && !element.hasClass('_md-animations-ready')) {
			return;
		}

		var el = element[0],
			ctrl = element.controller('mdFabSpeedDial'),
			items = el.querySelectorAll('.md-fab-action-item'),
			triggerElement = el.querySelector('md-fab-trigger'),
			variablesElement = el.querySelector('._md-css-variables'),
			startZIndex = parseInt(window.getComputedStyle(variablesElement).zIndex);

		angular.forEach(
			items,
			function (item, index) {
				var styles = item.style;

				styles.transform = styles.webkitTransform = '';
				styles.transitionDelay = '';
				styles.opacity = 1;
				styles.zIndex = (items.length - index) + startZIndex;
			}
		);

		triggerElement.style.zIndex = startZIndex + items.length + 1;

		if (!ctrl.isOpen) {
			angular.forEach(
				items,
				function (item, index) {
					var newPosition, axis,
						styles = item.style,
						triggerItemHeightOffset = (triggerElement.clientHeight - item.clientHeight) / 2,
						triggerItemWidthOffset = (triggerElement.clientWidth - item.clientWidth) / 2,
						newTranslate;

					switch (ctrl.direction) {
						case 'up':
							newPosition = (item.scrollHeight * (index + 1) + triggerItemHeightOffset);
							axis = 'Y';
							break;
						case 'down':
							newPosition = -(item.scrollHeight * (index + 1) + triggerItemHeightOffset);
							axis = 'Y';
							break;
						case 'left':
							newPosition = (item.scrollWidth * (index + 1) + triggerItemWidthOffset);
							axis = 'X';
							break;
						case 'right':
							newPosition = -(item.scrollWidth * (index + 1) + triggerItemWidthOffset);
							axis = 'X';
							break;
					}

					newTranslate = 'translate' + axis + '(' + newPosition + 'px)';

					styles.transform = styles.webkitTransform = newTranslate;
				}
			);
		}
    }

    return {
		addClass: function (element, className, done) {
			if (element.hasClass('md-fling')) {
				runAnimation(element);
				delayDone(done);
			} else {
				done();
			}
		},
		removeClass: function (element, className, done) {
				runAnimation(element);
				delayDone(done);
		}
    };
}

function MdFabSpeedDialScaleAnimation($timeout) {
	"use strict";

    function delayDone(done) {
		$timeout(
			done,
			ng.material.ui.fabactions.cssAnimationDuration,
			false
		);
	}

    var delay = 65;

    function runAnimation(element) {
		var el = element[0],
			ctrl = element.controller('mdFabSpeedDial'),
			items = el.querySelectorAll('.md-fab-action-item'),
			variablesElement = el.querySelector('._md-css-variables'),
			startZIndex = parseInt(window.getComputedStyle(variablesElement).zIndex);

		angular.forEach(
			items,
			function (item, index) {
				var styles = item.style,
					offsetDelay = index * delay;

				styles.opacity = ctrl.isOpen ? 1 : 0;
				styles.transform = styles.webkitTransform = ctrl.isOpen ? 'scale(1)' : 'scale(0)';
				styles.transitionDelay = (ctrl.isOpen ? offsetDelay : (items.length - offsetDelay)) + 'ms';
				styles.zIndex = (items.length - index) + startZIndex;
			}
		);
    }

    return {
		addClass: function (element, className, done) {
			runAnimation(element);
			delayDone(done);
		},
		removeClass: function (element, className, done) {
			runAnimation(element);
			delayDone(done);
		}
    };
}

function MdFabToolbarDirective() {
	"use strict";

    function link(scope, element) {

      element.addClass('md-fab-toolbar');
      element.find('md-fab-trigger').find('button').prepend('<div class="md-fab-toolbar-background"></div>');
    }

	return {
		restrict: 'E',
		transclude: true,
		template:	'<div class="md-fab-toolbar-wrapper">' +
						'<div class="md-fab-toolbar-content" ng-transclude></div>' +
					'</div>',

		scope: {
			direction: '@?mdDirection',
			isOpen: '=?mdOpen'
		},

		bindToController: true,
		controller: 'MdFabController',
		controllerAs: 'vm',

		link: link
    };
}

function MdFabToolbarAnimation() {
	"use strict";

    function runAnimation(element, className) {

		if (!className) { return; }

		var el = element[0],
			ctrl = element.controller('mdFabToolbar'),
			backgroundElement = el.querySelector('.md-fab-toolbar-background'),
			triggerElement = el.querySelector('md-fab-trigger button'),
			toolbarElement = el.querySelector('md-toolbar'),
			iconElement = el.querySelector('md-fab-trigger button md-icon'),
			actions = element.find('md-fab-actions').children(),
			color,
			width,
			height,
			scale;

		if (triggerElement && backgroundElement) {

			color = window.getComputedStyle(triggerElement).getPropertyValue('background-color');
			width = el.offsetWidth;
			height = el.offsetHeight;
			scale = 2 * (width / triggerElement.offsetWidth);

			backgroundElement.style.backgroundColor = color;
			backgroundElement.style.borderRadius = width + 'px';

			if (ctrl.isOpen) {
				toolbarElement.style.pointerEvents = 'inherit';

				backgroundElement.style.width = triggerElement.offsetWidth + 'px';
				backgroundElement.style.height = triggerElement.offsetHeight + 'px';
				backgroundElement.style.transform = 'scale(' + scale + ')';
				backgroundElement.style.transitionDelay = '0ms';

				if (iconElement) {
					iconElement.style.transitionDelay = '.3s';
				}

				angular.forEach(
					actions,
					function (action, index) {
						action.style.transitionDelay = (actions.length - index) * 25 + 'ms';
					}
				);

			} else {
				toolbarElement.style.pointerEvents = 'none';

				backgroundElement.style.transform = 'scale(1)';
				backgroundElement.style.top = '0';

				if (element.hasClass('md-right')) {
					backgroundElement.style.left = '0';
					backgroundElement.style.right = null;
				}

				if (element.hasClass('md-left')) {
					backgroundElement.style.right = '0';
					backgroundElement.style.left = null;
				}

				backgroundElement.style.transitionDelay = '200ms';

				if (iconElement) {
					iconElement.style.transitionDelay = '0ms';
				}

				angular.forEach(
					actions,
					function (action, index) {
						action.style.transitionDelay = 200 + (index * 25) + 'ms';
					}
				);
			}
		}
    }

    return {
		addClass: function (element, className, done) {
			runAnimation(element, className, done);
			done();
		},
		removeClass: function (element, className, done) {
			runAnimation(element, className, done);
			done();
		}
	};
}

angular.module(
	'ng.material.ui.fabactions',
	['ng', 'ng.material.core']
).directive(
	'mdFabActions',
	["$mdUtil", MdFabActionsDirective]
).controller(
	'MdFabController',
	["$scope", "$element", "$animate", "$mdUtil", "$mdConstant", "$timeout", MdFabController]
).directive(
	'mdFabToolbar',
	MdFabToolbarDirective
).animation(
	'.md-fab-toolbar',
	MdFabToolbarAnimation
).service(
	'mdFabToolbarAnimation',
	MdFabToolbarAnimation
).directive(
	'mdFabSpeedDial',
	MdFabSpeedDialDirective
).animation(
	'.md-fling',
	["$timeout", MdFabSpeedDialFlingAnimation]
).animation(
	'.md-scale',
	["$timeout", MdFabSpeedDialScaleAnimation]
).service(
	'mdFabSpeedDialFlingAnimation',
	["$timeout", MdFabSpeedDialFlingAnimation]
).service(
	'mdFabSpeedDialScaleAnimation',
	["$timeout", MdFabSpeedDialScaleAnimation]
).directive(
    'mdFabTrigger',
    angular.restrictEDir
).directive(
    'mdFabActions',
    angular.restrictEDir
);
