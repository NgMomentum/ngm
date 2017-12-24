
/**
 * @license AngularJS v1.6.7
 * (c) 2010-2017 Google, Inc. http://angularjs.org
 * License: MIT
 */

/*global
    msos: false,
    ng: false
*/

msos.provide("ng.touch");

ng.touch.version = new msos.set_version(17, 12, 17);


(function (window, angular) {
    'use strict';

    var MAX_VERTICAL_DISTANCE = 75,
        MAX_VERTICAL_RATIO = 0.3,
        MIN_HORIZONTAL_DISTANCE = 30;

    function $TouchProvider($provide, $compileProvider) {

        var ngClickOverrideEnabled = false,
            ngClickDirectiveAdded = false;

        this.ngClickOverrideEnabled = function (enabled) {

            if (angular.isDefined(enabled)) {

                if (enabled && !ngClickDirectiveAdded) {

                    ngClickDirectiveAdded = true;

                    ngTouchClickDirectiveFactory.$$moduleName = 'ng.touch';
                    $compileProvider.directive(
                        'ngClick',
                        ngTouchClickDirectiveFactory
                    );

                    $provide.decorator(
                        'ngClickDirective',
                        ['$delegate', function ($delegate) {
                            var i = 0;

                            if (ngClickOverrideEnabled) {
                                $delegate.shift();
                            } else {
                                i = $delegate.length - 1;
                            
                                while (i >= 0) {
                                    if ($delegate[i].$$moduleName === 'ng.touch') {
                                        $delegate.splice(i, 1);
                                        break;
                                    }

                                    i-= 1;
                                }
                            }

                            return $delegate;
                        }]
                    );
                }

                ngClickOverrideEnabled = enabled;
                return this;
            }

            return ngClickOverrideEnabled;
        };

        this.$get = function () {
            return {

                ngClickOverrideEnabled: function () {
                    return ngClickOverrideEnabled;
                }
            };
        };
    }

    $TouchProvider.$inject = ['$provide', '$compileProvider'];

    var ngTouchClickDirectiveFactory = ['$parse', '$timeout', '$rootElement', function ($parse, $timeout, $rootElement) {
        var TAP_DURATION = 750,
            MOVE_TOLERANCE = 12,
            PREVENT_DURATION = 2500,
            CLICKBUSTER_THRESHOLD = 25,
            ACTIVE_CLASS_NAME = 'ng-click-active',
            lastPreventedTime,
            touchCoordinates,
            lastLabelClickCoordinates;


       function hit(x1, y1, x2, y2) {
            return Math.abs(x1 - x2) < CLICKBUSTER_THRESHOLD && Math.abs(y1 - y2) < CLICKBUSTER_THRESHOLD;
        }

        function checkAllowableRegions(touchCoordinates, x, y) {
            var i = 0;

            for (i = 0; i < touchCoordinates.length; i += 2) {
                if (hit(touchCoordinates[i], touchCoordinates[i + 1], x, y)) {
                    touchCoordinates.splice(i, i + 2);
                    return true;
                }
            }

            return false;
        }

        function onClick(event) {

            if (Date.now() - lastPreventedTime > PREVENT_DURATION) { return; }

            touches = event.touches && event.touches.length ? event.touches : [event];

            var x = touches[0].clientX,
                y = touches[0].clientY;

            if (x < 1 && y < 1) { return; }

            if (lastLabelClickCoordinates && lastLabelClickCoordinates[0] === x && lastLabelClickCoordinates[1] === y) {
                return;
            }

            if (lastLabelClickCoordinates) {
                lastLabelClickCoordinates = null;
            }

            if (angular.ngnodeName(event.target) === 'label') {
                lastLabelClickCoordinates = [x, y];
            }

            if (checkAllowableRegions(touchCoordinates, x, y)) { return; }

            event.stopPropagation();
            event.preventDefault();

            if (event.target && event.target.blur) {
                event.target.blur();
            }
        }

        function onTouchStart(event) {

            var touches = event.touches && event.touches.length ? event.touches : [event],
                x = touches[0].clientX,
                y = touches[0].clientY;

            touchCoordinates.push(x, y);

            $timeout(
                function () {
                    var i = 0;

                    for (i = 0; i < touchCoordinates.length; i += 2) {
                        if (touchCoordinates[i] === x && touchCoordinates[i + 1] === y) {
                            touchCoordinates.splice(i, i + 2);
                            return;
                        }
                    }
                },
                PREVENT_DURATION,
                false
            );
        }

        function preventGhostClick(x, y) {
            if (!touchCoordinates) {
                $rootElement[0].addEventListener('click', onClick, true);
                $rootElement[0].addEventListener('touchstart', onTouchStart, true);
                touchCoordinates = [];
            }

            lastPreventedTime = Date.now();

            checkAllowableRegions(touchCoordinates, x, y);
        }

        return function (scope, element, attr) {
            var clickHandler = $parse(attr.ngClick),
                tapping = false,
                tapElement,
                startTime,
                touchStartX,
                touchStartY;

            function resetState() {
                tapping = false;
                element.removeClass(ACTIVE_CLASS_NAME);
            }

            element.on(
                'touchstart',
                function (event) {
                    tapping = true;
                    tapElement = event.target ? event.target : event.srcElement; // IE uses srcElement.

                    if (tapElement.nodeType === 3) {
                        tapElement = tapElement.parentNode;
                    }

                    element.addClass(ACTIVE_CLASS_NAME);

                    startTime = Date.now();

                    var originalEvent = event.originalEvent || event,
                        touches = originalEvent.touches && originalEvent.touches.length ? originalEvent.touches : [originalEvent],
                        e = touches[0];

                    touchStartX = e.clientX;
                    touchStartY = e.clientY;
                }
            );

            element.on(
                'touchcancel',
                function () { resetState(); }
            );

            element.on(
                'touchend',
                function (event) {
                    var diff = Date.now() - startTime,
                        originalEvent = event.originalEvent || event,
                        touches = (originalEvent.changedTouches && originalEvent.changedTouches.length) ? originalEvent.changedTouches : ((originalEvent.touches && originalEvent.touches.length) ? originalEvent.touches : [originalEvent]),
                        e = touches[0],
                        x = e.clientX,
                        y = e.clientY,
                        dist = Math.sqrt(Math.pow(x - touchStartX, 2) + Math.pow(y - touchStartY, 2));

                    if (tapping && diff < TAP_DURATION && dist < MOVE_TOLERANCE) {
                        preventGhostClick(x, y);

                        if (tapElement) { tapElement.blur(); }

                        if (!angular.isDefined(attr.disabled) || attr.disabled === false) {
                            element.triggerHandler('click', [event]);
                        }
                    }

                    resetState();
                }
            );

            element.onclick = function () {};

            element.on(
                'click',
                function (event, touchend) {
                        scope.$apply(
                            function () {
                                clickHandler(
                                    scope,
                                    { $event: (touchend || event) }
                                );
                            }
                        );
                }
            );

            element.on(
                'mousedown',
                function () {
                    element.addClass(ACTIVE_CLASS_NAME);
                }
            );

            element.on(
                'mousemove mouseup',
                function () {
                    element.removeClass(ACTIVE_CLASS_NAME);
                }
            );
        };
    }];

    angular.module(
        'ng.touch', ['ng']
    ).provider(
        '$touch',
        $TouchProvider
    ).factory(
        '$swipe',
        [function () {

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
    
                bind: function(element, eventHandlers, pointerTypes) {
                    var totalX, totalY,
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
    
                            if (eventHandlers.start) { eventHandlers.start(startCoords, event); }
                        }
                    );
    
                    events = getEvents(pointerTypes, 'cancel');
    
                    if (events) {
                        element.on(events, function(event) {
                            active = false;
                            if (eventHandlers.cancel) {
                                eventHandlers.cancel(event);
                            }
                        });
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
    
                        if (totalX < MOVE_BUFFER_RADIUS && totalY < MOVE_BUFFER_RADIUS) {
                            return;
                        }
    
                        if (totalY > totalX) {
                            active = false;
    
                            if (eventHandlers.cancel) {
                                eventHandlers.cancel(event);
                            }
    
                            return;
                        } else {
                            event.preventDefault();
    
                            if (eventHandlers.move) {
                                eventHandlers.move(coords, event);
                            }
                        }
                    });
    
                    element.on(
                        getEvents(pointerTypes, 'end'),
                        function(event) {
    
                            if (!active) { return; }
    
                            active = false;
    
                            if (eventHandlers.end) {
                                eventHandlers.end(getCoordinates(event), event);
                            }
                        }
                    );
                }
            };
        }]
    ).directive(
        'ngSwipeLeft',
        ['$parse', '$swipe', function ($parse, $swipe) {

            return function (scope, element, attr) {
                var swipeHandler = $parse(attr.ngSwipeLeft),
                    startCoords,
                    valid,
                    pointerTypes = ['touch'];

                function validSwipe(coords) {

                    if (!startCoords) { return false; }

                    var deltaY = Math.abs(coords.y - startCoords.y),
                        deltaX = (coords.x - startCoords.x) * -1;

                    return valid && deltaY < MAX_VERTICAL_DISTANCE && deltaX > 0 && deltaX > MIN_HORIZONTAL_DISTANCE && deltaY / deltaX < MAX_VERTICAL_RATIO;
                }

                if (!angular.isDefined(attr.ngSwipeDisableMouse)) {
                    pointerTypes.push('mouse');
                }

                $swipe.bind(
                    element, {
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
                                        element.triggerHandler('swipeleft');
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
    ).directive(
        'ngSwipeRight',
        ['$parse', '$swipe', function ($parse, $swipe) {

            return function (scope, element, attr) {
                var swipeHandler = $parse(attr.ngSwipeRight),
                    startCoords,
                    valid,
                    pointerTypes = ['touch'];

                function validSwipe(coords) {

                    if (!startCoords) { return false; }

                    var deltaY = Math.abs(coords.y - startCoords.y),
                        deltaX = (coords.x - startCoords.x) * 1;

                    return valid && deltaY < MAX_VERTICAL_DISTANCE && deltaX > 0 && deltaX > MIN_HORIZONTAL_DISTANCE && deltaY / deltaX < MAX_VERTICAL_RATIO;
                }

                if (!angular.isDefined(attr.ngSwipeDisableMouse)) {
                    pointerTypes.push('mouse');
                }

                $swipe.bind(
                    element, {
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
                                        element.triggerHandler('swiperight');
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

}(window, window.angular));