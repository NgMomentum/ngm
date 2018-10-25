
/**
 * @license AngularJS v1.7.2
 * (c) 2010-2018 Google, Inc. http://angularjs.org
 * License: MIT
 */

/*global
    msos: false,
    ng: false
*/

msos.provide("ng.touch");


(function (window, angular) {
    'use strict';

    ng.touch = angular.module(
		'ng.touch',
		['ng']
	).info(
		{ angularVersion: '1.7.2' }
	).factory(
		'$swipe',
		function () {

			var MOVE_BUFFER_RADIUS = 10,
				POINTER_EVENTS = {
					'mouse': {
						start: 'mousedown',
						move: 'mousemove',
						end: 'mouseup'
					},
					'touch': {
						start: 'touchstart',
						move: 'touchmove',
						end: 'touchend',
						cancel: 'touchcancel'
					},
					'pointer': {
						start: 'pointerdown',
						move: 'pointermove',
						end: 'pointerup',
						cancel: 'pointercancel'
					}
				};

			function getCoordinates(event) {
				var originalEvent = event.originalEvent || event,
					touches = originalEvent.touches && originalEvent.touches.length ? originalEvent.touches : [originalEvent],
					e = (originalEvent.changedTouches && originalEvent.changedTouches[0]) || touches[0];

				return {
					x: e.clientX,
					y: e.clientY
				};
			}

			function getEvents(pointerTypes, eventType) {
				var res = [];

				angular.forEach(
					pointerTypes,
					function (pointerType) {
						var eventName = POINTER_EVENTS[pointerType][eventType];

						if (eventName) {
							res.push(eventName);
						}
					}
				);

				return res.join(' ');
			}

			return {

				bind: function (element, eventHandlers, pointerTypes) {
					var totalX,
						totalY,
						startCoords,
						lastPos,
						active = false,
						events;

					pointerTypes = pointerTypes || ['mouse', 'touch', 'pointer'];

					element.on(
						getEvents(pointerTypes, 'start'),
						function (event) {
							startCoords = getCoordinates(event);
							active = true;
							totalX = 0;
							totalY = 0;
							lastPos = startCoords;

							if (eventHandlers.start) {
								eventHandlers.start(startCoords, event);
							}
						}
					);

					events = getEvents(pointerTypes, 'cancel');

					if (events) {
						element.on(
							events,
							function (event) {
								active = false;
	
								if (eventHandlers.cancel) {
									eventHandlers.cancel(event);
								}
							}
						);
					}

					element.on(
						getEvents(pointerTypes, 'move'),
						function (event) {

							if (!active) { return; }
							if (!startCoords) { return; }

							var coords = getCoordinates(event);

							totalX += Math.abs(coords.x - lastPos.x);
							totalY += Math.abs(coords.y - lastPos.y);

							lastPos = coords;

							if (totalX < MOVE_BUFFER_RADIUS && totalY < MOVE_BUFFER_RADIUS) { return; }

							// One of totalX or totalY has exceeded the buffer, so decide on swipe vs. scroll.
							if (totalY > totalX) {
								// Allow native scrolling to take over.
								active = false;

								if (eventHandlers.cancel) {
									eventHandlers.cancel(event);
								}

								return;
							} else {
								// Prevent the browser from scrolling.
								event.preventDefault();

								if (eventHandlers.move) {
									eventHandlers.move(coords, event);
								}
							}
						}
					);

					element.on(
						getEvents(pointerTypes, 'end'),
						function (event) {

							if (!active) { return; }

							active = false;

							if (eventHandlers.end) {
								eventHandlers.end(getCoordinates(event), event);
							}
						}
					);
				}
			};
		}
	);

	ng.touch.version = new msos.set_version(18, 7, 3);

    function makeSwipeDirective(directiveName, direction, eventName) {

        ng.touch.directive(
			directiveName,
			['$parse', '$swipe', function ($parse, $swipe) {
				var MAX_VERTICAL_DISTANCE = 75,
					MAX_VERTICAL_RATIO = 0.3,
					MIN_HORIZONTAL_DISTANCE = 30;

				return function (scope, element, attr) {
					var swipeHandler = $parse(attr[directiveName]),
						startCoords,
						valid,
						pointerTypes = ['touch'];

					function validSwipe(coords) {

						if (!startCoords) { return false; }

						var deltaY = Math.abs(coords.y - startCoords.y),
							deltaX = (coords.x - startCoords.x) * direction;

						return valid && deltaY < MAX_VERTICAL_DISTANCE && deltaX > 0 && deltaX > MIN_HORIZONTAL_DISTANCE && deltaY / deltaX < MAX_VERTICAL_RATIO;
					}

					if (!angular.isDefined(attr.ngSwipeDisableMouse)) {
						pointerTypes.push('mouse');
					}

					$swipe.bind(
						element,
						{
							'start': function (coords) {
								startCoords = coords;
								valid = true;
							},
							'cancel': function () {
								valid = false;
							},
							'end': function (coords, event) {
								if (validSwipe(coords)) {
									scope.$apply(
										function () {
											element.triggerHandler(eventName);
											swipeHandler(
												scope,
												{ $event: event }
											);
										}
									);
								}
							}
						},
						pointerTypes
					);
				};
			}]
		);
    }

    // Left is negative X-coordinate, right is positive.
    makeSwipeDirective('ngSwipeLeft', -1, 'swipeleft');
    makeSwipeDirective('ngSwipeRight', 1, 'swiperight');

}(window, window.angular));