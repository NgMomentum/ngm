/**
 * @ngdoc module
 * @name material.core.interaction
 * @description
 * User interaction detection to provide proper accessibility.
 */

/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.v111.ui.interaction");


function MdInteractionService($timeout, $mdUtil) {
    "use strict";

    this.$timeout = $timeout;
    this.$mdUtil = $mdUtil;

    this.bodyElement = angular.element(document.body);
    this.isBuffering = false;
    this.bufferTimeout = null;
    this.lastInteractionType = null;
    this.lastInteractionTime = null;

    this.inputEventMap = {
        'keydown': 'keyboard',
        'mousedown': 'mouse',
        'mouseenter': 'mouse',
        'touchstart': 'touch',
        'pointerdown': 'pointer',
        'MSPointerDown': 'pointer'
    };

    this.iePointerMap = {
        2: 'touch',
        3: 'touch',
        4: 'mouse'
    };

    this.initializeEvents();
}

MdInteractionService.prototype.initializeEvents = function () {
    "use strict";

    // IE browsers can also trigger pointer events, which also leads to an interaction.
    var pointerEvent = 'MSPointerEvent' in window ? 'MSPointerDown' : 'PointerEvent' in window ? 'pointerdown' : null;

    this.bodyElement.on('keydown mousedown', this.onInputEvent.bind(this));

    if ('ontouchstart' in document.documentElement) {
        this.bodyElement.on('touchstart', this.onBufferInputEvent.bind(this));
    }

    if (pointerEvent) {
        this.bodyElement.on(pointerEvent, this.onInputEvent.bind(this));
    }

};

MdInteractionService.prototype.onInputEvent = function (event) {
    "use strict";

    if (this.isBuffering) {
        return;
    }

    var type = this.inputEventMap[event.type];

    if (type === 'pointer') {
        type = this.iePointerMap[event.pointerType] || event.pointerType;
    }

    this.lastInteractionType = type;
    this.lastInteractionTime = this.$mdUtil.now();
};

MdInteractionService.prototype.onBufferInputEvent = function (event) {
    "use strict";

    this.$timeout.cancel(this.bufferTimeout);

    this.onInputEvent(event);
    this.isBuffering = true;

    // The timeout of 650ms is needed to delay the touchstart, because otherwise the touch will call
    // the `onInput` function multiple times.
    this.bufferTimeout = this.$timeout(function () {
        this.isBuffering = false;
    }.bind(this), 650, false);

};

MdInteractionService.prototype.getLastInteractionType = function () {
    "use strict";

    return this.lastInteractionType;
};

MdInteractionService.prototype.isUserInvoked = function (checkDelay) {
    "use strict";

    var delay = angular.isNumber(checkDelay) ? checkDelay : 15;

    // Check for any interaction to be within the specified check time.
    return this.lastInteractionTime >= this.$mdUtil.now() - delay;
};


angular.module(
    'ng.material.v111.ui.interaction',
    [
        'ng',
        'ng.material.v111.core'
    ]
).service(
    '$mdInteraction',
    ['$timeout', '$mdUtil', MdInteractionService]
);
