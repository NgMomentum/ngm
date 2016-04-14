/**
 * @license AngularJS v1.5.0
 * (c) 2010-2016 Google, Inc. http://angularjs.org
 * License: MIT
 */
msos.provide("ng.touch");

ng.touch.version = new msos.set_version(16, 3, 24);


(function(window, angular, undefined) {
    'use strict';

    var ngTouch = angular.module('ng.touch', []);

    ngTouch.provider('$touch', $TouchProvider);

    function nodeName_(element) {
        return angular.lowercase(element.nodeName || (element[0] && element[0].nodeName));
    }

    $TouchProvider.$inject = ['$provide', '$compileProvider'];

    function $TouchProvider($provide, $compileProvider) {

        var ngClickOverrideEnabled = false;
        var ngClickDirectiveAdded = false;
        this.ngClickOverrideEnabled = function(enabled) {
            if (angular.isDefined(enabled)) {

                if (enabled && !ngClickDirectiveAdded) {
                    ngClickDirectiveAdded = true;

                    // Use this to identify the correct directive in the delegate
                    ngTouchClickDirectiveFactory.$$moduleName = 'ng.touch';
                    $compileProvider.directive('ngClick', ngTouchClickDirectiveFactory);

                    $provide.decorator('ngClickDirective', ['$delegate', function($delegate) {
                        if (ngClickOverrideEnabled) {
                            // drop the default ngClick directive
                            $delegate.shift();
                        } else {
                            // drop the ngTouch ngClick directive if the override has been re-disabled (because
                            // we cannot de-register added directives)
                            var i = $delegate.length - 1;
                            while (i >= 0) {
                                if ($delegate[i].$$moduleName === 'ng.touch') {
                                    $delegate.splice(i, 1);
                                    break;
                                }
                                i--;
                            }
                        }

                        return $delegate;
                    }]);
                }

                ngClickOverrideEnabled = enabled;
                return this;
            }

            return ngClickOverrideEnabled;
        };

        this.$get = function() {
            return {
                ngClickOverrideEnabled: function() {
                    return ngClickOverrideEnabled;
                }
            };
        };

    }

    ngTouch.factory('$swipe', [function() {
        // The total distance in any direction before we make the call on swipe vs. scroll.
        var MOVE_BUFFER_RADIUS = 10;

        var POINTER_EVENTS = {
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
            }
        };

        function getCoordinates(event) {
            var originalEvent = event.originalEvent || event;
            var touches = originalEvent.touches && originalEvent.touches.length ? originalEvent.touches : [originalEvent];
            var e = (originalEvent.changedTouches && originalEvent.changedTouches[0]) || touches[0];

            return {
                x: e.clientX,
                y: e.clientY
            };
        }

        function getEvents(pointerTypes, eventType) {
            var res = [];
            angular.forEach(pointerTypes, function(pointerType) {
                var eventName = POINTER_EVENTS[pointerType][eventType];
                if (eventName) {
                    res.push(eventName);
                }
            });
            return res.join(' ');
        }

        return {

            bind: function(element, eventHandlers, pointerTypes) {
                // Absolute total movement, used to control swipe vs. scroll.
                var totalX, totalY;
                // Coordinates of the start position.
                var startCoords;
                // Last event's position.
                var lastPos;
                // Whether a swipe is active.
                var active = false;

                pointerTypes = pointerTypes || ['mouse', 'touch'];
                element.on(getEvents(pointerTypes, 'start'), function(event) {
                    startCoords = getCoordinates(event);
                    active = true;
                    totalX = 0;
                    totalY = 0;
                    lastPos = startCoords;
                    eventHandlers['start'] && eventHandlers['start'](startCoords, event);
                });
                var events = getEvents(pointerTypes, 'cancel');
                if (events) {
                    element.on(events, function(event) {
                        active = false;
                        eventHandlers['cancel'] && eventHandlers['cancel'](event);
                    });
                }

                element.on(getEvents(pointerTypes, 'move'), function(event) {
                    if (!active) return;

                    if (!startCoords) return;
                    var coords = getCoordinates(event);

                    totalX += Math.abs(coords.x - lastPos.x);
                    totalY += Math.abs(coords.y - lastPos.y);

                    lastPos = coords;

                    if (totalX < MOVE_BUFFER_RADIUS && totalY < MOVE_BUFFER_RADIUS) {
                        return;
                    }

                    // One of totalX or totalY has exceeded the buffer, so decide on swipe vs. scroll.
                    if (totalY > totalX) {
                        // Allow native scrolling to take over.
                        active = false;
                        eventHandlers['cancel'] && eventHandlers['cancel'](event);
                        return;
                    } else {
                        // Prevent the browser from scrolling.
                        event.preventDefault();
                        eventHandlers['move'] && eventHandlers['move'](coords, event);
                    }
                });

                element.on(getEvents(pointerTypes, 'end'), function(event) {
                    if (!active) return;
                    active = false;
                    eventHandlers['end'] && eventHandlers['end'](getCoordinates(event), event);
                });
            }
        };
    }]);


    var ngTouchClickDirectiveFactory = ['$parse', '$timeout', '$rootElement',
        function($parse, $timeout, $rootElement) {
            var TAP_DURATION = 750; // Shorter than 750ms is a tap, longer is a taphold or drag.
            var MOVE_TOLERANCE = 12; // 12px seems to work in most mobile browsers.
            var PREVENT_DURATION = 2500; // 2.5 seconds maximum from preventGhostClick call to click
            var CLICKBUSTER_THRESHOLD = 25; // 25 pixels in any dimension is the limit for busting clicks.

            var ACTIVE_CLASS_NAME = 'ng-click-active';
            var lastPreventedTime;
            var touchCoordinates;
            var lastLabelClickCoordinates;


            // Checks if the coordinates are close enough to be within the region.
            function hit(x1, y1, x2, y2) {
                return Math.abs(x1 - x2) < CLICKBUSTER_THRESHOLD && Math.abs(y1 - y2) < CLICKBUSTER_THRESHOLD;
            }

            // Checks a list of allowable regions against a click location.
            // Returns true if the click should be allowed.
            // Splices out the allowable region from the list after it has been used.
            function checkAllowableRegions(touchCoordinates, x, y) {
                for (var i = 0; i < touchCoordinates.length; i += 2) {
                    if (hit(touchCoordinates[i], touchCoordinates[i + 1], x, y)) {
                        touchCoordinates.splice(i, i + 2);
                        return true; // allowable region
                    }
                }
                return false; // No allowable region; bust it.
            }

            // Global click handler that prevents the click if it's in a bustable zone and preventGhostClick
            // was called recently.
            function onClick(event) {
                if (Date.now() - lastPreventedTime > PREVENT_DURATION) {
                    return; // Too old.
                }

                var touches = event.touches && event.touches.length ? event.touches : [event];
                var x = touches[0].clientX;
                var y = touches[0].clientY;
                // Work around desktop Webkit quirk where clicking a label will fire two clicks (on the label
                // and on the input element). Depending on the exact browser, this second click we don't want
                // to bust has either (0,0), negative coordinates, or coordinates equal to triggering label
                // click event
                if (x < 1 && y < 1) {
                    return; // offscreen
                }
                if (lastLabelClickCoordinates &&
                    lastLabelClickCoordinates[0] === x && lastLabelClickCoordinates[1] === y) {
                    return; // input click triggered by label click
                }
                // reset label click coordinates on first subsequent click
                if (lastLabelClickCoordinates) {
                    lastLabelClickCoordinates = null;
                }
                // remember label click coordinates to prevent click busting of trigger click event on input
                if (nodeName_(event.target) === 'label') {
                    lastLabelClickCoordinates = [x, y];
                }

                // Look for an allowable region containing this click.
                // If we find one, that means it was created by touchstart and not removed by
                // preventGhostClick, so we don't bust it.
                if (checkAllowableRegions(touchCoordinates, x, y)) {
                    return;
                }

                // If we didn't find an allowable region, bust the click.
                event.stopPropagation();
                event.preventDefault();

                // Blur focused form elements
                event.target && event.target.blur && event.target.blur();
            }

            // Global touchstart handler that creates an allowable region for a click event.
            // This allowable region can be removed by preventGhostClick if we want to bust it.
            function onTouchStart(event) {
                var touches = event.touches && event.touches.length ? event.touches : [event];
                var x = touches[0].clientX;
                var y = touches[0].clientY;
                touchCoordinates.push(x, y);

                $timeout(function() {
                    // Remove the allowable region.
                    for (var i = 0; i < touchCoordinates.length; i += 2) {
                        if (touchCoordinates[i] == x && touchCoordinates[i + 1] == y) {
                            touchCoordinates.splice(i, i + 2);
                            return;
                        }
                    }
                }, PREVENT_DURATION, false);
            }

            // On the first call, attaches some event handlers. Then whenever it gets called, it creates a
            // zone around the touchstart where clicks will get busted.
            function preventGhostClick(x, y) {
                if (!touchCoordinates) {
                    $rootElement[0].addEventListener('click', onClick, true);
                    $rootElement[0].addEventListener('touchstart', onTouchStart, true);
                    touchCoordinates = [];
                }

                lastPreventedTime = Date.now();

                checkAllowableRegions(touchCoordinates, x, y);
            }

            // Actual linking function.
            return function(scope, element, attr) {
                var clickHandler = $parse(attr.ngClick),
                    tapping = false,
                    tapElement, // Used to blur the element after a tap.
                    startTime, // Used to check if the tap was held too long.
                    touchStartX,
                    touchStartY;

                function resetState() {
                    tapping = false;
                    element.removeClass(ACTIVE_CLASS_NAME);
                }

                element.on('touchstart', function(event) {
                    tapping = true;
                    tapElement = event.target ? event.target : event.srcElement; // IE uses srcElement.
                    // Hack for Safari, which can target text nodes instead of containers.
                    if (tapElement.nodeType == 3) {
                        tapElement = tapElement.parentNode;
                    }

                    element.addClass(ACTIVE_CLASS_NAME);

                    startTime = Date.now();

                    // Use jQuery originalEvent
                    var originalEvent = event.originalEvent || event;
                    var touches = originalEvent.touches && originalEvent.touches.length ? originalEvent.touches : [originalEvent];
                    var e = touches[0];
                    touchStartX = e.clientX;
                    touchStartY = e.clientY;
                });

                element.on('touchcancel', function(event) {
                    resetState();
                });

                element.on('touchend', function(event) {
                    var diff = Date.now() - startTime;

                    // Use jQuery originalEvent
                    var originalEvent = event.originalEvent || event;
                    var touches = (originalEvent.changedTouches && originalEvent.changedTouches.length) ?
                        originalEvent.changedTouches :
                        ((originalEvent.touches && originalEvent.touches.length) ? originalEvent.touches : [originalEvent]);
                    var e = touches[0];
                    var x = e.clientX;
                    var y = e.clientY;
                    var dist = Math.sqrt(Math.pow(x - touchStartX, 2) + Math.pow(y - touchStartY, 2));

                    if (tapping && diff < TAP_DURATION && dist < MOVE_TOLERANCE) {
                        // Call preventGhostClick so the clickbuster will catch the corresponding click.
                        preventGhostClick(x, y);

                        if (tapElement) {
                            tapElement.blur();
                        }

                        if (!angular.isDefined(attr.disabled) || attr.disabled === false) {
                            element.triggerHandler('click', [event]);
                        }
                    }

                    resetState();
                });

                element.onclick = function(event) {};

                element.on('click', function(event, touchend) {
                    scope.$apply(function() {
                        clickHandler(scope, {
                            $event: (touchend || event)
                        });
                    });
                });

                element.on('mousedown', function(event) {
                    element.addClass(ACTIVE_CLASS_NAME);
                });

                element.on('mousemove mouseup', function(event) {
                    element.removeClass(ACTIVE_CLASS_NAME);
                });

            };
        }
    ];


    function makeSwipeDirective(directiveName, direction, eventName) {
        ngTouch.directive(directiveName, ['$parse', '$swipe', function($parse, $swipe) {
            // The maximum vertical delta for a swipe should be less than 75px.
            var MAX_VERTICAL_DISTANCE = 75;
            // Vertical distance should not be more than a fraction of the horizontal distance.
            var MAX_VERTICAL_RATIO = 0.3;
            // At least a 30px lateral motion is necessary for a swipe.
            var MIN_HORIZONTAL_DISTANCE = 30;

            return function(scope, element, attr) {
                var swipeHandler = $parse(attr[directiveName]);

                var startCoords, valid;

                function validSwipe(coords) {

                    if (!startCoords) return false;
                    var deltaY = Math.abs(coords.y - startCoords.y);
                    var deltaX = (coords.x - startCoords.x) * direction;
                    return valid && // Short circuit for already-invalidated swipes.
                        deltaY < MAX_VERTICAL_DISTANCE &&
                        deltaX > 0 &&
                        deltaX > MIN_HORIZONTAL_DISTANCE &&
                        deltaY / deltaX < MAX_VERTICAL_RATIO;
                }

                var pointerTypes = ['touch'];
                if (!angular.isDefined(attr['ngSwipeDisableMouse'])) {
                    pointerTypes.push('mouse');
                }
                $swipe.bind(element, {
                    'start': function(coords, event) {
                        startCoords = coords;
                        valid = true;
                    },
                    'cancel': function(event) {
                        valid = false;
                    },
                    'end': function(coords, event) {
                        if (validSwipe(coords)) {
                            scope.$apply(function() {
                                element.triggerHandler(eventName);
                                swipeHandler(scope, {
                                    $event: event
                                });
                            });
                        }
                    }
                }, pointerTypes);
            };
        }]);
    }

    // Left is negative X-coordinate, right is positive.
    makeSwipeDirective('ngSwipeLeft', -1, 'swipeleft');
    makeSwipeDirective('ngSwipeRight', 1, 'swiperight');

})(window, window.angular);