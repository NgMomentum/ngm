// Copyright Notice:
//					site.js
//			Copyright©2012-2017 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://ngmomentum.com & http://opensitemobile.com
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com

/*

	Use 'site.js' to add site specific code for availability
	to many pages and apps. Note that here, as oppose to the 'config.js'
	file, jQuery, Bootstrap, AngularJS, Backbone, etc. are now available for use.

	Also, add small jQuery plugin's here, (ie - jQuery FitText below).

	OpenSiteMobile MobileSiteOS site specific code:

	    Google Analytics,
	    AddThis,
	    other Social site calls, etc.
	
	Plus:

	    Auto-Load Modules - based on dom elements
*/

/*global
	msos:false
*/

msos.site = {
	msie: document.documentMode
};

msos.console.info('site -> start, (/ngm/app/site.js file).');
msos.console.time('site');


// --------------------------
// Google Analytics Tracking Function
// --------------------------

msos.site.google_analytics = function () {
    "use strict";

    // Set to your website or remove if/else statment
    if (document.domain === msos.config.google.analytics_domain) {

		var url = ('https:' === document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js',
			ga_loader = new msos.loader();

		// Use our loader for better debugging
		ga_loader.load('google_analytics_api', url, 'js');

    } else {
		msos.console.warn('msos.site.google_analytics -> please update msos.config.google.analytics_domain in config.js!');
      }
};


// http://getbootstrap.com/getting-started/#support-ie10-width
if (msos.site.msie >= 9 && navigator.userAgent.match(/IEMobile\/10\.0/)) {

	msViewportStyle = document.createElement('style');

	msViewportStyle.appendChild(
		document.createTextNode('@-ms-viewport{width:auto!important}')
	);

	document.head.appendChild(msViewportStyle);
}


// --------------------------
// Determine Need for FastClick
// --------------------------

msos.site.fastclick_na = function () {
	"use strict";

	var metaViewport,
		chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [undefined, 0])[1],
		firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [undefined ,0])[1],
		isblackberry10 = navigator.userAgent.indexOf('BB10') > 0,
		blackberryVersion;

	// Devices that don't support touch don't need FastClick
	if (window.ontouchstart === undefined) {
		return true;
	}

	if (chromeVersion) {
		// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
		if (navigator.userAgent.indexOf('Android') > 0) {

			metaViewport = document.querySelector('meta[name=viewport]');

			if (metaViewport) {
				// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
				if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
					return true;
				}
				// Chrome 32 and above with width=device-width or less don't need FastClick
				if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
					return true;
				}
			}

		// Chrome desktop doesn't need FastClick (issue #15)
		} else { return true; }
	}

	if (isblackberry10) {

		blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

		// BlackBerry 10.3+ does not require Fastclick library.
		// https://github.com/ftlabs/fastclick/issues/251
		if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
	
			metaViewport = document.querySelector('meta[name=viewport]');

			if (metaViewport) {
				// user-scalable=no eliminates click delay.
				if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
					return true;
				}
				// width=device-width (or less than device-width) eliminates click delay.
				if (document.documentElement.scrollWidth <= window.outerWidth) {
					return true;
				}
			}
		}
	}

	if (firefoxVersion >= 27) {
		// Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896
		metaViewport = document.querySelector('meta[name=viewport]');

		if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
			return true;
		}
	}

	// IE10, 11 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom
	if (document.body.style.msTouchAction === 'none' || document.body.style.touchAction === 'none' || document.body.style.touchAction === 'manipulation') {
		return true;
	}

	return false;
};

// --------------------------
// Site Specific Code
// --------------------------

msos.site.auto_init = function () {
    "use strict";

	var temp_ai = 'msos.site.auto_init -> ',
		cfg = msos.config,
		req = msos.require,
		bw_val = msos.config.storage.site_bdwd.value || '',
		bdwidth = bw_val ? parseInt(bw_val, 10) : 0;

	msos.console.debug(temp_ai + 'start.');

	// Run MobileSiteOS sizing (alt. would be: use media queries instead)
	if (cfg.run_size)		{ req("msos.size"); }

    // If a mobile (touch) operating system
    if (cfg.mobile)			{ req("msos.mobile"); }

    // Add auto window.onerror alerting
    if (cfg.run_onerror)	{ req("msos.onerror"); }

	// Add debugging output (popup)
	if (cfg.debug_output)	{ req("msos.debug"); }

	// Or based on configuration settings
	if (cfg.run_analytics && bdwidth > 150)		{ msos.site.google_analytics(); }

	if (!msos.site.fastclick_na)				{ req("msos.fastclick"); }

	msos.console.debug(temp_ai + 'done!');
};


// Load site specific setup code
msos.onload_func_pre.push(msos.site.auto_init);

msos.console.info('site -> done!');
msos.console.timeEnd('site');