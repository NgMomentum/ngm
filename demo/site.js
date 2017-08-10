// Copyright Notice:
//					site.js
//			Copyright©2012-2017 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			https://ngmomentum.com and https://opensitemobile.com
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
	    Social site calls, etc.
	
	Plus:

	    Auto-Load Modules - based on dom elements
*/

/*global
	msos:false
*/

msos.site = {
	msie: document.documentMode
};

msos.console.info('site -> start, (/ngm/demo/site.js file).');
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
		ga_loader.load(url, 'js');

    } else {
		msos.console.warn('msos.site.google_analytics -> please update msos.config.google.analytics_domain in config.js!');
      }
};

(function () {
	"use strict";

	var msViewportStyle;

	// http://getbootstrap.com/getting-started/#support-ie10-width
	if (msos.site.msie >= 9 && navigator.userAgent.match(/IEMobile\/10\.0/)) {

		msViewportStyle = document.createElement('style');

		msViewportStyle.appendChild(
			document.createTextNode('@-ms-viewport{width:auto!important}')
		);

		document.head.appendChild(msViewportStyle);
	}
}());

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

	// Apple mobile OS
	if (cfg.mobile && navigator.platform.match(/iPad|iPhone|iPod/i)) { req("msos.mbp.ios"); }

	// Run MobileSiteOS sizing (alt. would be: use media queries instead)
	if (cfg.run_size) { req("msos.size"); }

    // Add auto window.onerror alerting
    if (cfg.run_onerror) { req("msos.onerror"); }

	// Add debugging output (popup)
	if (cfg.debug_output) { req("msos.debug"); }

	// Or based on configuration settings
	if (cfg.run_analytics && bdwidth > 150) { msos.site.google_analytics(); }

	msos.console.debug(temp_ai + 'done!');
};


// Load site specific setup code
msos.onload_func_pre.push(msos.site.auto_init);

msos.console.info('site -> done!');
msos.console.timeEnd('site');
