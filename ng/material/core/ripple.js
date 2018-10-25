
/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.core.ripple");
msos.require("ng.material.core.color");

ng.material.core.ripple.version = new msos.set_version(18, 7, 30);

ng.material.core.ripple.DURATION = 450;

// Load AngularJS-Material module specific CSS
ng.material.core.ripple.css = new msos.loader();
ng.material.core.ripple.css.load(msos.resource_url('ng', 'material/css/ui/ripple.css'));


function InkRippleCtrl($scope, $element, rippleOptions, $window, $timeout, $mdUtil, $mdColorUtil) {
    "use strict";

    this.$window = $window;
    this.$timeout = $timeout;
    this.$mdUtil = $mdUtil;
    this.$mdColorUtil = $mdColorUtil;
    this.$scope = $scope;
    this.$element = $element;
    this.options = rippleOptions;
    this.mousedown = false;
    this.ripples = [];
    this.timeout = null; // Stores a reference to the most-recent ripple timeout
    this.lastRipple = null;

    $mdUtil.valueOnUse(this, 'container', this.createContainer);

    this.$element.addClass('md-ink-ripple');

    // attach method for unit tests
    ($element.controller('mdInkRipple') || {}).createRipple = angular.bind(this, this.createRipple);
    ($element.controller('mdInkRipple') || {}).setColor = angular.bind(this, this.color);

    this.bindEvents();
}

function autoCleanup(self, cleanupFn) {
    "use strict";

    if (self.mousedown || self.lastRipple) {
        self.mousedown = false;
        self.$mdUtil.nextTick(angular.bind(self, cleanupFn), false);
    }
}

InkRippleCtrl.prototype.color = function (value) {
    "use strict";

    var self = this;

    // If assigning a color value, apply it to background and the ripple color
    if (angular.isDefined(value)) {
        self._color = self._parseColor(value);
    }

    function getElementColor() {
        var items = self.options && self.options.colorElement ? self.options.colorElement : [],
            elem = items.length ? items[0] : self.$element[0];

        return elem ? self.$window.getComputedStyle(elem).color : 'rgb(0,0,0)';
    }

    // If color lookup, use assigned, defined, or inherited
    return self._color || self._parseColor(self.inkRipple()) || self._parseColor(getElementColor());
};

InkRippleCtrl.prototype.calculateColor = function () {
    "use strict";

    return this.color();
};

InkRippleCtrl.prototype._parseColor = function parseColor(color, multiplier) {
    "use strict";

    multiplier = multiplier || 1;

    var colorUtil = this.$mdColorUtil;

    if (!color) { return undefined; }
    if (color.indexOf('rgba') === 0) { return color.replace(/\d?\.?\d*\s*\)\s*$/, (0.1 * multiplier).toString() + ')'); }
    if (color.indexOf('rgb') === 0) { return colorUtil.rgbToRgba(color); }
    if (color.indexOf('#') === 0) { return colorUtil.hexToRgba(color); }

    return undefined;
};

/**
 * Binds events to the root element for
 */
InkRippleCtrl.prototype.bindEvents = function () {
    "use strict";

    this.$element.on('mousedown', angular.bind(this, this.handleMousedown));
    this.$element.on('mouseup touchend', angular.bind(this, this.handleMouseup));
    this.$element.on('mouseleave', angular.bind(this, this.handleMouseleave));
    this.$element.on('touchmove', angular.bind(this, this.handleTouchmove));
};

InkRippleCtrl.prototype.handleMousedown = function (event) {
    "use strict";

    var layerRect,
        layerX,
        layerY;

    if (this.mousedown) { return; }

    // When jQuery is loaded, we have to get the original event
    if (event.hasOwnProperty('originalEvent')) { event = event.originalEvent; }
    this.mousedown = true;

    if (this.options.center) {
        this.createRipple(this.container.prop('clientWidth') / 2, this.container.prop('clientWidth') / 2);
    } else {

        // We need to calculate the relative coordinates if the target is a sublayer of the ripple element
        if (event.srcElement !== this.$element[0]) {
            layerRect = this.$element[0].getBoundingClientRect();
            layerX = event.clientX - layerRect.left;
            layerY = event.clientY - layerRect.top;

            this.createRipple(layerX, layerY);
        } else {
            this.createRipple(event.offsetX, event.offsetY);
        }
    }
};

InkRippleCtrl.prototype.handleMouseup = function () {
    "use strict";

    autoCleanup(this, this.clearRipples);

	this.$timeout(
		function md_inkripple_mouseup() {
			autoCleanup(this, this.clearRipples);
		}.bind(this),
		10,
		false
	);
};

InkRippleCtrl.prototype.handleMouseleave = function () {
    "use strict";

    autoCleanup(this, this.clearRipples);
};

InkRippleCtrl.prototype.handleTouchmove = function () {
    "use strict";

    autoCleanup(this, this.deleteRipples);
};

InkRippleCtrl.prototype.deleteRipples = function () {
    "use strict";

    var i = 0;

    for (i = 0; i < this.ripples.length; i += 1) {
        this.ripples[i].remove();
    }
};

InkRippleCtrl.prototype.clearRipples = function () {
    "use strict";

    var i = 0;

    for (i = 0; i < this.ripples.length; i += 1) {
        this.fadeInComplete(this.ripples[i]);
    }
};

InkRippleCtrl.prototype.createContainer = function () {
    "use strict";

    var container = angular.element('<div class="md-ripple-container"></div>');

    this.$element.append(container);
    return container;
};

InkRippleCtrl.prototype.clearTimeout = function () {
    "use strict";

    if (this.timeout) {
        this.$timeout.cancel(this.timeout);
        this.timeout = null;
    }
};

InkRippleCtrl.prototype.isRippleAllowed = function () {
    "use strict";

    var element = this.$element[0];

    do {
        if (!element.tagName || element.tagName === 'BODY') { break; }

        if (element && angular.isFunction(element.hasAttribute)) {
            if (element.hasAttribute('disabled')) { return false; }
            if (this.inkRipple() === 'false' || this.inkRipple() === '0') { return false; }
        }

        element = element.parentNode;

    } while (element);

    return true;
};

InkRippleCtrl.prototype.inkRipple = function () {
    "use strict";

    return this.$element.attr('md-ink-ripple');
};

InkRippleCtrl.prototype.createRipple = function (left, top) {
    "use strict";

    if (!this.isRippleAllowed()) { return; }

    function getSize(fit, x, y) {
        return fit ?
            Math.max(x, y) :
            Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    }

    var ctrl = this,
        colorUtil = ctrl.$mdColorUtil,
        ripple = angular.element('<div class="md-ripple"></div>'),
        width = this.$element.prop('clientWidth'),
        height = this.$element.prop('clientHeight'),
        x = Math.max(Math.abs(width - left), left) * 2,
        y = Math.max(Math.abs(height - top), top) * 2,
        size = getSize(this.options.fitRipple, x, y),
        color = this.calculateColor();

    ripple.css({
        left: left + 'px',
        top: top + 'px',
        background: 'black',
        width: size + 'px',
        height: size + 'px',
        backgroundColor: colorUtil.rgbaToRgb(color),
        borderColor: colorUtil.rgbaToRgb(color)
    });

    this.lastRipple = ripple;

    // we only want one timeout to be running at a time
    this.clearTimeout();

    this.timeout = this.$timeout(
		function IRCcreateRipple_to() {
			ctrl.clearTimeout();
			if (!ctrl.mousedown) { ctrl.fadeInComplete(ripple); }
		},
		ng.material.core.ripple.DURATION * 0.35,
		false
	);

    if (this.options.dimBackground) {
        this.container.css({
            backgroundColor: color
        });
    }

    this.container.append(ripple);
    this.ripples.push(ripple);

    ripple.addClass('md-ripple-placed');

    this.$mdUtil.nextTick(
		function IRCnextTick() {

			ripple.addClass('md-ripple-scaled md-ripple-active');
			ctrl.$timeout(
				function IRCnextTick_to() { ctrl.clearRipples(); },
				ng.material.core.ripple.DURATION,
				false
			);

		},
		false
	);
};

InkRippleCtrl.prototype.fadeInComplete = function (ripple) {
    "use strict";

    if (this.lastRipple === ripple) {
        if (!this.timeout && !this.mousedown) {
            this.removeRipple(ripple);
        }
    } else {
        this.removeRipple(ripple);
    }
};

InkRippleCtrl.prototype.removeRipple = function (ripple) {
    "use strict";

    var ctrl = this,
        index = this.ripples.indexOf(ripple);

    if (index < 0) { return; }

    this.ripples.splice(this.ripples.indexOf(ripple), 1);

    ripple.removeClass('md-ripple-active');
    ripple.addClass('md-ripple-remove');

    if (this.ripples.length === 0) {
        this.container.css({
            backgroundColor: ''
        });
    }
    // use a 2-second timeout in order to allow for the animation to finish
    // we don't actually care how long the animation takes
    this.$timeout(
		function IRCremoveRipple_to() {
			ctrl.fadeOutComplete(ripple);
		},
		ng.material.core.ripple.DURATION,
		false
	);
};

InkRippleCtrl.prototype.fadeOutComplete = function (ripple) {
    "use strict";

    ripple.remove();
    this.lastRipple = null;
};

function InkRippleProvider() {
    "use strict";

    var isDisabledGlobally = false;

    function disableInkRipple() {
        isDisabledGlobally = true;
    }

    return {
        disableInkRipple: disableInkRipple,
        $get: ["$injector", function ($injector) {

            function attach(scope, element, options) {
                if (isDisabledGlobally || element.controller('mdNoInk')) { return angular.noop; }

                return $injector.instantiate(
					['$scope', '$element', 'rippleOptions', '$window', '$timeout', '$mdUtil', '$mdColorUtil', InkRippleCtrl],
					{
						$scope: scope,
						$element: element,
						rippleOptions: options
					},
					'ng_material_core_ripple_InkRippleProvider'
				);
            }

            return {
                attach: attach
            };
        }]
    };
}

function MdCheckboxInkRipple($mdInkRipple) {
    "use strict";

    function attach(scope, element, options) {
        return $mdInkRipple.attach(scope, element, angular.extend({
            center: true,
            dimBackground: false,
            fitRipple: true
        }, options));
    }

    return {
        attach: attach
    };
}

function MdButtonInkRipple($mdInkRipple) {
    "use strict";

    function optionsForElement(element) {
        if (element.hasClass('md-icon-button')) {
            return {
                isMenuItem: element.hasClass('md-menu-item'),
                fitRipple: true,
                center: true
            };
        }

        return {
            isMenuItem: element.hasClass('md-menu-item'),
            dimBackground: true
        };
    }

    return {
        attach: function attachRipple(scope, element, options) {
            options = angular.extend(optionsForElement(element), options);

            return $mdInkRipple.attach(scope, element, options);
        }
    };
}

function MdListInkRipple($mdInkRipple) {
    "use strict";

    function attach(scope, element, options) {
        return $mdInkRipple.attach(scope, element, angular.extend({
            center: false,
            dimBackground: true,
            outline: false,
            rippleSize: 'full'
        }, options));
    }

    return {
        attach: attach
    };
}

function InkRippleDirective ($mdButtonInkRipple, $mdCheckboxInkRipple) {
    "use strict";

    return {
        link: function (scope, element, attr) {
            if (attr.hasOwnProperty('mdInkRippleCheckbox')) {
                $mdCheckboxInkRipple.attach(scope, element);
            } else {
                $mdButtonInkRipple.attach(scope, element);
            }
        }
    };
}

function attrNoDirective() {
    "use strict";

    return {
        controller: angular.noop
    };
}


angular.module(
    'ng.material.core.ripple',
    [
        'ng',
        'ng.material.core',
        'ng.material.core.color'
    ]
).provider(
    '$mdInkRipple',
    InkRippleProvider
).factory(
    '$mdCheckboxInkRipple',
    ['$mdInkRipple', MdCheckboxInkRipple]
).factory(
    '$mdButtonInkRipple',
    ['$mdInkRipple', MdButtonInkRipple]
).factory(
    '$mdListInkRipple',
    ['$mdInkRipple', MdListInkRipple]
).directive(
    'mdInkRipple',
    ['$mdButtonInkRipple', '$mdCheckboxInkRipple', InkRippleDirective]
).directive(
    'mdNoInk',
    attrNoDirective
).directive(
    'mdNoBar',
    attrNoDirective
).directive(
    'mdNoStretch',
    attrNoDirective
).directive(
    'mdInkRippleCheckbox',
    function () {
		"use strict";
        return {
            restrict: 'A'
        };
    }
).directive(
    'mdInkRippleButton',
    function () {
		"use strict";
        return {
            restrict: 'A'
        };
    }
);

