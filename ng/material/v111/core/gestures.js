
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

msos.provide("ng.material.v111.core.gestures");
msos.require("ng.material.v111.core");

_.extend(
    ng.material.v111.core.gestures,
    {
        HANDLERS: {},
        pointer: null,
        lastPointer: null,
        forceSkipClickHijack: false,
        lastLabelClickPos: null,
        isInitialized: false,
        version: new msos.set_version(16, 12, 29)
    }
);


function getEventPoint(ev) {
    "use strict";

    ev = ev.originalEvent || ev; // support jQuery events
    return (ev.touches && ev.touches[0]) ||
        (ev.changedTouches && ev.changedTouches[0]) ||
        ev;
}

function makeStartPointer(ev) {
    "use strict";

    var point = getEventPoint(ev),
        startPointer = {
            startTime: +Date.now(),
            target: ev.target,
            // 'p' for pointer events, 'm' for mouse, 't' for touch
            type: ev.type.charAt(0)
        };

    startPointer.startX = startPointer.x = point.pageX;
    startPointer.startY = startPointer.y = point.pageY;

    return startPointer;
}

function updatePointerState(ev, ud_pointer) {
    "use strict";

    var point = getEventPoint(ev),
        x = ud_pointer.x = point.pageX,
        y = ud_pointer.y = point.pageY;

    ud_pointer.distanceX = x - ud_pointer.startX;
    ud_pointer.distanceY = y - ud_pointer.startY;
    ud_pointer.distance = Math.sqrt(
        ud_pointer.distanceX * ud_pointer.distanceX + ud_pointer.distanceY * ud_pointer.distanceY
    );

    ud_pointer.directionX = ud_pointer.distanceX > 0 ? 'right' : ud_pointer.distanceX < 0 ? 'left' : '';
    ud_pointer.directionY = ud_pointer.distanceY > 0 ? 'down' : ud_pointer.distanceY < 0 ? 'up' : '';

    ud_pointer.duration = +Date.now() - ud_pointer.startTime;
    ud_pointer.velocityX = ud_pointer.distanceX / ud_pointer.duration;
    ud_pointer.velocityY = ud_pointer.distanceY / ud_pointer.duration;
}

function MdGestureProvider() {
    "use strict";
}

MdGestureProvider.prototype = {

    skipClickHijack: function () {
        "use strict";

        ng.material.v111.core.gestures.forceSkipClickHijack = true;

        return ng.material.v111.core.gestures.forceSkipClickHijack;
    },
    $get: ["$$MdGestureHandler", "$$rAF", "$timeout", function ($$MdGestureHandler, $$rAF, $timeout) {
        "use strict";

        function getTouchAction() {
            var testEl = document.createElement('div'),
                vendorPrefixes = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'],
                i = 0,
                prefix,
                property;
    
            for (i = 0; i < vendorPrefixes.length; i +=1) {
                prefix = vendorPrefixes[i];
                property = prefix ? prefix + 'TouchAction' : 'touchAction';
    
                if (angular.isDefined(testEl.style[property])) {
                    return property;
                }
            }
    
            return undefined;
        }
    
        function register(element, handlerName, options) {
            var handler = ng.material.v111.core.gestures.HANDLERS[handlerName.replace(/^\$md./, '')];
            if (!handler) {
                throw new Error('Failed to register element with handler ' + handlerName + '. ' +
                    'Available handlers: ' + Object.keys(ng.material.v111.core.gestures.HANDLERS).join(', '));
            }
            return handler.registerElement(element, options);
        }
    
        var userAgent = navigator.userAgent || navigator.vendor || window.opera,
            isIos = userAgent.match(/ipad|iphone|ipod/i),
            isAndroid = userAgent.match(/android/i),
            touchActionProperty = getTouchAction(),
            hasJQuery = (window.jQuery !== undefined) && (angular.element === window.jQuery),
            maxClickDistance = 6,
            self;
    
        function addHandler(name, definition) {
            var handler = new $$MdGestureHandler(name);
    
            angular.extend(handler, definition);
            ng.material.v111.core.gestures.HANDLERS[name] = handler;
    
            return self;
        }
    
        self = {
            handler: addHandler,
            register: register,
            isIos: isIos,
            isAndroid: isAndroid,
            isHijackingClicks: (isIos || isAndroid) && !hasJQuery && !ng.material.v111.core.gestures.forceSkipClickHijack
        };
    
        function checkDistanceAndEmit(eventName) {
            return function (ev, cd_pointer) {
                if (cd_pointer.distance < this.state.options.maxDistance) {
                    this.dispatchEvent(ev, eventName, cd_pointer);
                }
            };
        }
    
        function canFocus(element) {
            var focusableElements = ['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA', 'VIDEO', 'AUDIO'];
    
            return (element.getAttribute('tabindex') !== '-1') && !element.hasAttribute('DISABLED') && (element.hasAttribute('tabindex') || element.hasAttribute('href') || element.isContentEditable || (focusableElements.indexOf(element.nodeName) !== -1));
        }
    
        if (self.isHijackingClicks) {
    
            self.handler(
                'click',
                {
                    options: { maxDistance: maxClickDistance },
                    onEnd: checkDistanceAndEmit('click')
                }
            );
    
            self.handler(
                'focus', {
                    options: { maxDistance: maxClickDistance },
                    onEnd: function (ev, oe_pointer) {
                        if (oe_pointer.distance < this.state.options.maxDistance) {
                            if (canFocus(ev.target)) {
                                this.dispatchEvent(ev, 'focus', oe_pointer);
                                ev.target.focus();
                            }
                        }
                    }
                }
            );
    
            self.handler(
                'mouseup',
                {
                    options: { maxDistance: maxClickDistance },
                    onEnd: checkDistanceAndEmit('mouseup')
                }
            );
    
            self.handler(
                'mousedown',
                {
                    onStart: function(ev) {
                        this.dispatchEvent(ev, 'mousedown');
                    }
                }
            );
        }
    
        self.handler(
            'press',
            {
                onStart: function (ev) {
                    this.dispatchEvent(ev, '$md.pressdown');
                },
                onEnd: function (ev) {
                    this.dispatchEvent(ev, '$md.pressup');
                }
            }
        ).handler(
            'hold',
            {
                options: {
                    maxDistance: 6,
                    delay: 500
                },
                onCancel: function () {
                    $timeout.cancel(this.state.timeout);
                },
                onStart: function (ev, os_pointer) {
                    // For hold, require a parent to be registered with $mdGesture.register()
                    // Because we prevent scroll events, this is necessary.
                    if (!this.state.registeredParent) { return this.cancel(); }
    
                    this.state.pos = {
                        x: os_pointer.x,
                        y: os_pointer.y
                    };
    
                    this.state.timeout = $timeout(
                        angular.bind(
                            this,
                            function holdDelayFn() {
                                this.dispatchEvent(ev, '$md.hold');
                                this.cancel(); //we're done!
                            }
                        ),
                        this.state.options.delay,
                        false
                    );
    
                    return undefined;
                },
                onMove: function (ev, om_pointer) {
                    // Don't scroll while waiting for hold.
                    // If we don't preventDefault touchmove events here, Android will assume we don't
                    // want to listen to anymore touch events. It will start scrolling and stop sending
                    // touchmove events.
                    if (!touchActionProperty && ev.type === 'touchmove') { ev.preventDefault(); }
    
                    // If the user moves greater than <maxDistance> pixels, stop the hold timer
                    // set in onStart
                    var dx = this.state.pos.x - om_pointer.x,
                        dy = this.state.pos.y - om_pointer.y;
    
                    if (Math.sqrt(dx * dx + dy * dy) > this.options.maxDistance) {
                        this.cancel();
                    }
                },
                onEnd: function () {
                    this.onCancel();
                }
            }
        ).handler(
            'drag',
            {
                options: {
                    minDistance: 6,
                    horizontal: true,
                    cancelMultiplier: 1.5
                },
                onSetup: function (element, options) {
                    if (touchActionProperty) {
                        // We check for horizontal to be false, because otherwise we would overwrite the default opts.
                        this.oldTouchAction = element[0].style[touchActionProperty];
                        element[0].style[touchActionProperty] = options.horizontal === false ? 'pan-y' : 'pan-x';
                    }
                },
                onCleanup: function (element) {
                    if (this.oldTouchAction) {
                        element[0].style[touchActionProperty] = this.oldTouchAction;
                    }
                },
                onStart: function () {
                    // For drag, require a parent to be registered with $mdGesture.register()
                    if (!this.state.registeredParent) { this.cancel(); }
                },
                onMove: function (ev, omd_pointer) {
                    var shouldStartDrag,
                        shouldCancel;
                    // Don't scroll while deciding if this touchmove qualifies as a drag event.
                    // If we don't preventDefault touchmove events here, Android will assume we don't
                    // want to listen to anymore touch events. It will start scrolling and stop sending
                    // touchmove events.
                    if (!touchActionProperty && ev.type === 'touchmove') { ev.preventDefault(); }
    
                    if (!this.state.dragPointer) {
                        if (this.state.options.horizontal) {
                            shouldStartDrag = Math.abs(omd_pointer.distanceX) > this.state.options.minDistance;
                            shouldCancel = Math.abs(omd_pointer.distanceY) > this.state.options.minDistance * this.state.options.cancelMultiplier;
                        } else {
                            shouldStartDrag = Math.abs(omd_pointer.distanceY) > this.state.options.minDistance;
                            shouldCancel = Math.abs(omd_pointer.distanceX) > this.state.options.minDistance * this.state.options.cancelMultiplier;
                        }
    
                        if (shouldStartDrag) {
                            // Create a new pointer representing this drag, starting at this point where the drag started.
                            this.state.dragPointer = makeStartPointer(ev);
                            updatePointerState(ev, this.state.dragPointer);
                            this.dispatchEvent(ev, '$md.dragstart', this.state.dragPointer);
                        } else if (shouldCancel) {
                            this.cancel();
                        }
                    } else {
                        this.dispatchDragMove(ev);
                    }
                },
                dispatchDragMove: _.throttle(
                    function (ev) {
                        // Make sure the drag didn't stop while waiting for the next frame
                        if (this.state.isRunning) {
                            updatePointerState(ev, this.state.dragPointer);
                            this.dispatchEvent(ev, '$md.drag', this.state.dragPointer);
                        }
                    },
                    100
                ),
                onEnd: function (ev) {
                    if (this.state.dragPointer) {
                        updatePointerState(ev, this.state.dragPointer);
                        this.dispatchEvent(ev, '$md.dragend', this.state.dragPointer);
                    }
                }
            }
        ).handler(
            'swipe',
            {
                options: {
                    minVelocity: 0.65,
                    minDistance: 10
                },
                onEnd: function (ev, oes_pointer) {
                    var eventType;
    
                    if (Math.abs(oes_pointer.velocityX) > this.state.options.minVelocity
                     && Math.abs(oes_pointer.distanceX) > this.state.options.minDistance) {
                        eventType = oes_pointer.directionX === 'left' ? '$md.swipeleft' : '$md.swiperight';
                        this.dispatchEvent(ev, eventType);
                    } else if (Math.abs(oes_pointer.velocityY) > this.state.options.minVelocity
                            && Math.abs(oes_pointer.distanceY) > this.state.options.minDistance) {
                        eventType = oes_pointer.directionY === 'up' ? '$md.swipeup' : '$md.swipedown';
                        this.dispatchEvent(ev, eventType);
                    }
                }
            }
        );

        return self;
    }]
};

function GestureHandler(name) {
    "use strict";

    this.name = name;
    this.state = {};
}

function MdGestureHandler() {
    "use strict";

    function jQueryDispatchEvent(srcEvent, eventType, eventPointer) {

        eventPointer = eventPointer || ng.material.v111.core.gestures.pointer;

        var eventObj = new angular.element.Event(eventType);

        eventObj.$material = true;
        eventObj.pointer = eventPointer;
        eventObj.srcEvent = srcEvent;

        angular.extend(
            eventObj, {
                clientX: eventPointer.x,
                clientY: eventPointer.y,
                screenX: eventPointer.x,
                screenY: eventPointer.y,
                pageX: eventPointer.x,
                pageY: eventPointer.y,
                ctrlKey: srcEvent.ctrlKey,
                altKey: srcEvent.altKey,
                shiftKey: srcEvent.shiftKey,
                metaKey: srcEvent.metaKey
            }
        );

        angular.element(eventPointer.target).trigger(eventObj);
    }

    GestureHandler.prototype = {
        options: {},

        dispatchEvent: jQueryDispatchEvent,

        // These are overridden by the registered handler
        onSetup: angular.noop,
        onCleanup: angular.noop,
        onStart: angular.noop,
        onMove: angular.noop,
        onEnd: angular.noop,
        onCancel: angular.noop,

        // onStart sets up a new state for the handler, which includes options from the
        // nearest registered parent element of ev.target.
        start: function (ev, st_pointer) {
            if (this.state.isRunning) { return; }

            var parentTarget = this.getNearestParent(ev.target),
                parentTargetOptions = parentTarget && (parentTarget.$mdGesture[this.name] || {});

            this.state = {
                isRunning: true,
                // Override the default options with the nearest registered parent's options
                options: angular.extend({}, this.options, parentTargetOptions),
                // Pass in the registered parent node to the state so the onStart listener can use
                registeredParent: parentTarget
            };
            this.onStart(ev, st_pointer);
        },
        move: function (ev, m_pointer) {
            if (!this.state.isRunning) { return; }
            this.onMove(ev, m_pointer);
        },
        end: function (ev, e_pointer) {
            if (!this.state.isRunning) { return; }
            this.onEnd(ev, e_pointer);
            this.state.isRunning = false;
        },
        cancel: function (ev, c_pointer) {
            if (this.onCancel !== angular.noop) {
                this.onCancel(ev, c_pointer);
            }
            this.state = {};
        },

        // Find and return the nearest parent element that has been registered to
        // listen for this handler via $mdGesture.register(element, 'handlerName').
        getNearestParent: function (node) {
            var current = node;

            while (current) {
                if ((current.$mdGesture || {})[this.name]) {
                    return current;
                }
                current = current.parentNode;
            }
            return null;
        },

        registerElement: function (element, options) {
            var self = this;

            function onDestroy() {
                delete element[0].$mdGesture[self.name];
                element.off('$destroy', onDestroy);

                self.onCleanup(element, options || {});
            }

            element[0].$mdGesture = element[0].$mdGesture || {};
            element[0].$mdGesture[this.name] = options || {};
            element.on('$destroy', onDestroy);

            self.onSetup(element, options || {});

            return onDestroy;
        }
    };

    return GestureHandler;
}

function typesMatch(ev, t_pointer) {
    "use strict";

    return ev && t_pointer && ev.type.charAt(0) === t_pointer.type;
}

function attachToDocument($mdGesture, $$MdGestureHandler) {
    "use strict";

    // Polyfill document.contains for IE11.
    if (!document.contains) {
        document.contains = function (node) {
            return document.body.contains(node);
        };
    }

    function isInputEventFromLabelClick(event) {
        var click_pos = ng.material.v111.core.gestures.lastLabelClickPos;

        if (click_pos && !_.isUndefined(click_pos.x) && !_.isUndefined(click_pos.y)) {
            return click_pos.x === event.x && click_pos.y === event.y;
        }

        return undefined;
    }

    function mouseInputHijacker(ev) {
        var isKeyClick = !ev.clientX && !ev.clientY;

        if (!isKeyClick && !ev.$material && !ev.isIonicTap && !isInputEventFromLabelClick(ev)) {
            ev.preventDefault();
            ev.stopPropagation();
        }
    }

    function clickHijacker(ev) {
        var isKeyClick = ev.clientX === 0 && ev.clientY === 0;

        if (!isKeyClick && !ev.$material && !ev.isIonicTap && !isInputEventFromLabelClick(ev)) {
            ev.preventDefault();
            ev.stopPropagation();
            ng.material.v111.core.gestures.lastLabelClickPos = null;
        } else {
            ng.material.v111.core.gestures.lastLabelClickPos = null;
            if (ev.target.tagName.toLowerCase() === 'label') {
                ng.material.v111.core.gestures.lastLabelClickPos = { x: ev.x, y: ev.y };
            }
        }
    }

    if (!ng.material.v111.core.gestures.isInitialized && $mdGesture.isHijackingClicks ) {
        document.addEventListener('click',      clickHijacker,      true);
        document.addEventListener('mouseup',    mouseInputHijacker, true);
        document.addEventListener('mousedown',  mouseInputHijacker, true);
        document.addEventListener('focus',      mouseInputHijacker, true);

        ng.material.v111.core.gestures.isInitialized = true;
    }

    // Listen to all events to cover all platforms.
    var START_EVENTS = 'mousedown touchstart pointerdown',
        MOVE_EVENTS = 'mousemove touchmove pointermove',
        END_EVENTS = 'mouseup mouseleave touchend touchcancel pointerup pointercancel';

    function runHandlers(handlerEvent, event) {
        var handler,
            name;

        for (name in ng.material.v111.core.gestures.HANDLERS) {    // Leave as is...
            handler = ng.material.v111.core.gestures.HANDLERS[name];
            if (handler instanceof $$MdGestureHandler) {

                if (handlerEvent === 'start') {
                    // Run cancel to reset any handlers' state
                    handler.cancel();
                }
                handler[handlerEvent](event, ng.material.v111.core.gestures.pointer);
            }
        }
    }

    function gestureStart(ev) {
        var now;

        // If we're already touched down, abort
        if (ng.material.v111.core.gestures.pointer) { return; }

        now = +Date.now();

        // iOS & old android bug: after a touch event, a click event is sent 350 ms later.
        // If <400ms have passed, don't allow an event of a different type than the previous event
        if (ng.material.v111.core.gestures.lastPointer
         && !typesMatch(ev, ng.material.v111.core.gestures.lastPointer)
         && (now - ng.material.v111.core.gestures.lastPointer.endTime < 1500)) {
            return;
        }

        ng.material.v111.core.gestures.pointer = makeStartPointer(ev);

        runHandlers('start', ev);
    }

    function gestureMove(ev) {
        if (!ng.material.v111.core.gestures.pointer || !typesMatch(ev, ng.material.v111.core.gestures.pointer)) { return; }

        updatePointerState(ev, ng.material.v111.core.gestures.pointer);
        runHandlers('move', ev);
    }

    function gestureEnd(ev) {
        if (!ng.material.v111.core.gestures.pointer || !typesMatch(ev, ng.material.v111.core.gestures.pointer)) { return; }

        updatePointerState(ev, ng.material.v111.core.gestures.pointer);
        ng.material.v111.core.gestures.pointer.endTime = +Date.now();

        runHandlers('end', ev);

        ng.material.v111.core.gestures.lastPointer = ng.material.v111.core.gestures.pointer;
        ng.material.v111.core.gestures.pointer = null;
    }

    angular.element(
        document
    ).on(
        START_EVENTS, gestureStart
    ).on(
        MOVE_EVENTS, gestureMove
    ).on(
        END_EVENTS, gestureEnd
    ).on(
        '$$mdGestureReset',
        function gestureClearCache() {
            ng.material.v111.core.gestures.lastPointer = null;
            ng.material.v111.core.gestures.pointer = null;
        }
    );
}


angular.module(
    'ng.material.v111.core.gestures',
    ['ng']
).provider(
    '$mdGesture',
    MdGestureProvider
).factory(
    '$$MdGestureHandler',
    MdGestureHandler
).run(
    ['$mdGesture', '$$MdGestureHandler', attachToDocument]
);

