/**
 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
 *
 * @version 0.6.7
 * @codingstandard ftlabs-jsv2
 * @copyright The Financial Times Limited [All Rights Reserved]
 * @license MIT License (see LICENSE.txt)
 *
 *      Skips code for iOS version 5 or earlier (no needsclick class),
 *      No AMD or module support
 */

/*global
    msos: false,
    jQuery: false,
    _: false
*/

msos.provide("msos.fastclick");

msos.fastclick.version = new msos.set_version(16, 4, 6);


// Sniffers...
msos.fastclick.deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0;
msos.fastclick.deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent);
msos.fastclick.deviceIsIOSWithBadTarget = msos.fastclick.deviceIsIOS && (/OS ([6-9]|\d{2})_\d/).test(navigator.userAgent);

msos.fastclick.FC = function (layer, options) {
	"use strict";

	options = options || {};

	var oldOnClick,
		self = this,
		methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'],
		i = 0;

	// Tracking
	this.trackingClick = false;
	this.trackingClickStart = 0;
	this.targetElement = null;
	this.touchStartX = 0;
	this.touchStartY = 0;
	this.lastTouchIdentifier = 0;
	this.touchBoundary = options.touchBoundary || 10;
	this.layer = layer;
	this.tapDelay = options.tapDelay || 200;
	this.tapTimeout = options.tapTimeout || 700;

	this.temp_fc = 'msos.fastclick';

	msos.console.debug(this.temp_fc + ' -> start.');

	// Simple check
	if (!layer || !layer.nodeType) {
		throw new TypeError('Layer must be a document node');
	}

	this.needsClick = function (target) {

		switch (target.nodeName.toLowerCase()) {
			case 'button':
			case 'select':
			case 'textarea':
				if (target.disabled) { return true; }
				break;
			case 'input':
				if ((msos.fastclick.deviceIsIOS && target.type === 'file') || target.disabled) { return true; }
				break;
			case 'label':
			case 'video':
				return true;
		}

		return false;
	};

	for (i = 0; i < methods.length; i += 1) {
		self[methods[i]] = _.bind(self[methods[i]], self);
	}

	if (msos.fastclick.deviceIsAndroid) {
		layer.addEventListener('mouseover',	this.onMouse, true);
		layer.addEventListener('mousedown',	this.onMouse, true);
		layer.addEventListener('mouseup',	this.onMouse, true);
	}

	layer.addEventListener('click',			this.onClick,		true);
	layer.addEventListener('touchstart',	this.onTouchStart,	false);
	layer.addEventListener('touchmove',		this.onTouchMove,	false);
	layer.addEventListener('touchend',		this.onTouchEnd,	false);
	layer.addEventListener('touchcancel',	this.onTouchCancel,	false);

	if (typeof layer.onclick === 'function') {

		oldOnClick = layer.onclick;

		layer.addEventListener(
			'click',
			function (event) { oldOnClick(event); },
			false
		);

		layer.onclick = null;
	}

	msos.console.debug(this.temp_fc + ' -> done!');
};

msos.fastclick.FC.prototype.onMouse = function (event) {
	'use strict';

	if (!this.targetElement)		{ return true; }
	if (event.forwardedTouchEvent)	{ return true; }
	if (!event.cancelable)			{ return true; }

	if (!this.needsClick(this.targetElement)
	 || this.cancelNextClick) {

		if (event.stopImmediatePropagation) {
			event.stopImmediatePropagation();
		} else {
			msos.console.warn(this.temp_fc + ' - onMouse -> event.stopImmediatePropagation is na.');
		}

		// Cancel the event
		event.stopPropagation();
		event.preventDefault();

		return false;
	}

	return true;
};

msos.fastclick.FC.prototype.onClick = function (event) {
	'use strict';

	var permitted;

	if (this.trackingClick) {
		msos.console.debug(this.temp_fc + ' - onclick -> called, on tracked click.');

		this.targetElement = null;
		this.trackingClick = false;
		return true;
	}

	if (event.target.type === 'submit' && event.detail === 0) {
		msos.console.debug(this.temp_fc + ' - onclick -> called, on iOS submit.');

		return true;
	}

	permitted = this.onMouse(event);

	if (!permitted) {
		this.targetElement = null;
	}

	return permitted;
};

msos.fastclick.FC.prototype.onTouchStart = function (event) {
	'use strict';

	var targetElement,
		touch,
		selection;

	if (event.targetTouches.length > 1) {
		return true;
	}

	targetElement = event.target;
	touch = event.targetTouches[0];

	if (msos.fastclick.deviceIsIOS) {

		// Only trusted events will deselect text on iOS (issue #49)
		selection = window.getSelection();

		if (selection.rangeCount
		 && !selection.isCollapsed) { return true; }
	}

	this.trackingClick = true;
	this.trackingClickStart = event.timeStamp;
	this.targetElement = targetElement;

	this.touchStartX = touch.pageX;
	this.touchStartY = touch.pageY;

	// Prevent phantom clicks on fast double-tap (issue #36)
	if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
		event.preventDefault();
	}

	return true;
};

msos.fastclick.FC.prototype.onTouchMove = function (event) {
	'use strict';

	var boundary = this.touchBoundary,
		touch_start_x = this.touchStartX,
		touch_start_y = this.touchStartY;

	function touchHasMoved(evt) {
		var touch = evt.changedTouches[0];

		if (Math.abs(touch.pageX - touch_start_x) > boundary
		 || Math.abs(touch.pageY - touch_start_y) > boundary) {
			return true;
		}

		return false;
	}

	if (!this.trackingClick) {
		return true;
	}

	// If the touch has moved, cancel the click tracking
	if (this.targetElement !== event.target || touchHasMoved(event)) {
		this.trackingClick = false;
		this.targetElement = null;
	}

	return true;
};

msos.fastclick.FC.prototype.onTouchEnd = function (event) {
	'use strict';

	var forElement,
		trackingClickStart,
		targetTagName,
		scrollParent,
		touch,
		targetElement = this.targetElement;

	function findControl(label_el) {

		if (label_el.control !== undefined) {
			return label_el.control;
		}

		if (label_el.htmlFor) {
			return document.getElementById(label_el.htmlFor);
		}

		return label_el.querySelector(
			'button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea'
		);
	}

	function focus(target_el) {
		var length;
	
		if (msos.fastclick.deviceIsIOS
		 && target_el.setSelectionRange
		 && target_el.type.indexOf('date') !== 0
		 && target_el.type !== 'time'
		 && target_el.type !== 'month') {
			length = target_el.value.length;
			target_el.setSelectionRange(length, length);
		} else {
			target_el.focus();
		}
	}

	function needsFocus(target) {

		switch (target.nodeName.toLowerCase()) {
			case 'textarea':
				return true;
			case 'select':
				return !msos.fastclick.deviceIsAndroid;
			case 'input':
				switch (target.type) {
					case 'button':
					case 'checkbox':
					case 'file':
					case 'image':
					case 'radio':
					case 'submit':
						return false;
				}
				return !target.disabled && !target.readOnly;
		}

		return false;
	}

	function sendClick(tar_elm, event) {
		var clickEvent,
			touch;

		function determineEventType(target_el) {

			if (msos.fastclick.deviceIsAndroid
			 && target_el.tagName.toLowerCase() === 'select') {
				return 'mousedown';
			}

			return 'click';
		}

		if (document.activeElement
		 && document.activeElement !== tar_elm) {
			document.activeElement.blur();
		}
	
		touch = event.changedTouches[0];
	
		// Synthesise a click event, with an extra attribute so it can be tracked
		clickEvent = document.createEvent('MouseEvents');
	
		clickEvent.initMouseEvent(
			determineEventType(tar_elm),
			true,
			true,
			window,
			1,
			touch.screenX,
			touch.screenY,
			touch.clientX,
			touch.clientY,
			false,
			false,
			false,
			false,
			0,
			null
		);
	
		clickEvent.forwardedTouchEvent = true;
		tar_elm.dispatchEvent(clickEvent);
	}

	if (!this.trackingClick) {
		return true;
	}

	// Prevent phantom clicks on fast double-tap (issue #36)
	if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
		this.cancelNextClick = true;
		return true;
	}

	if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
		return true;
	}

	// Reset to prevent wrong click cancel on input (issue #156).
	this.cancelNextClick = false;

	this.lastClickTime = event.timeStamp;

	trackingClickStart = this.trackingClickStart;
	this.trackingClick = false;
	this.trackingClickStart = 0;

	if (msos.fastclick.deviceIsIOSWithBadTarget) {
		touch = event.changedTouches[0];

		targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
		targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
	}

	targetTagName = targetElement.tagName.toLowerCase();

	if (targetTagName === 'label') {

		forElement = findControl(targetElement);

		if (forElement) {
			focus(targetElement);

			if (msos.fastclick.deviceIsAndroid) {
				return false;
			}

			targetElement = forElement;
		}

	} else if (needsFocus(targetElement)) {

		if ((event.timeStamp - trackingClickStart) > 100 || (msos.fastclick.deviceIsIOS && window.top !== window && targetTagName === 'input')) {
			this.targetElement = null;
			return false;
		}

		focus(targetElement);
		sendClick(targetElement, event);

		if (!msos.fastclick.deviceIsIOS || targetTagName !== 'select') {
			this.targetElement = null;
			event.preventDefault();
		}

		return false;
	}

	if (msos.fastclick.deviceIsIOS) {
		scrollParent = targetElement.fastClickScrollParent;

		if (scrollParent
		 && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) { return true; }
	}

	if (!this.needsClick(targetElement)) {
		event.preventDefault();
		sendClick(targetElement, event);
	}

	return false;
};

msos.fastclick.FC.prototype.onTouchCancel = function() {
	'use strict';

	this.trackingClick = false;
	this.targetElement = null;
};

// This only runs after page load (via MSOS)
msos.fastclick.instance = new msos.fastclick.FC(document.body);
