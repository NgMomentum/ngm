// Copyright Notice:
//					site.js
//			Copyright©2012-2019 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			https://ngmomentum.com and https://opensitemobile.com
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com

/*

	Use 'site.js' to add site or domain specific code for availability
	to many pages and apps. Note that here, as oppose to the 'config.js'
	file, jQuery, Bootstrap, AngularJS, Backbone, Vue, etc. are now available for use.

	Also, add small jQuery or other common site plugin's here.

	MobileSiteOS site specific code:

	    Google Analytics,
	    Social site calls, etc.

	Plus:

	    Auto-Load Modules - based on dom elements, etc.
*/

/*global
	msos:false
*/

msos.site = {
	msie: document.documentMode
};

msos.console.info('site -> start, (/ngm/demo/site.js file).');
msos.console.time('site');


// Website common setup code, such as "window" and "document"
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

    window.addEventListener('mousedown', function () {
            document.body.classList.add('mouse-navigation');
            document.body.classList.remove('kbd-navigation');
    });

    window.addEventListener('keydown', function(e) {
        if (e.keyCode === 9) {
            document.body.classList.add('kbd-navigation');
            document.body.classList.remove('mouse-navigation');
        }
    });

}());


// --------------------------
// Website Specific Code
// --------------------------

msos.site.auto_init = function () {
    "use strict";

	var temp_ai = 'msos.site.auto_init -> ',
		cfg = msos.config,
		req = msos.require;

	msos.console.debug(temp_ai + 'start.');

	// Add Touch events for ng, ng.bootstrap.ui
	if (cfg.mobile && cfg.browser.touch) { req("ng.touch"); }

	// Apple mobile OS
	if (cfg.mobile && navigator.platform.match(/iPad|iPhone|iPod/i)) { req("msos.mbp.ios"); }

	// Run MobileSiteOS sizing (alt. would be: use media queries)
	if (cfg.run_size) { req("msos.size"); }

    // Add auto window.onerror alerting
    if (cfg.run_onerror) { req("msos.onerror"); }

	// Add debugging output (popup)
	if (cfg.debug_output) { req("msos.debug"); }

	// Add Google Adsense ads
	if (cfg.run_ads) { req("ng.google.adsense"); }

	// Add Google Analytics and Tag Management
	if (cfg.run_analytics) { req("ng.google.tagmanagement"); }

	msos.console.debug(temp_ai + 'done!');
};

msos.site.are_prefetched_ready = function (prefetch_fragment_array) {
	"use strict";

	var temp_cp = 'msos.site.are_prefetched_ready -> ',
		mrg = msos.registered_globals,
		purl = msos.base_site_purl,
		i = 0,
		fragment = (purl.attr('fragment')).split('/'),
		found = false,
		ready = true,
		global;

	for (i = 0; i < prefetch_fragment_array.length; i += 1) {
		if (prefetch_fragment_array[i] === fragment[1]) { found = true; }
	}

	msos.console.debug(temp_cp + 'start, found fragment: ' + fragment[1]);

	if (found) {
		for (global in mrg) {
			if (mrg[global] !== true) { ready = false; }
		}
	}

	if (msos.config.verbose) {
		msos.console.debug(temp_cp + 'current available globals: ', mrg);
	}

	msos.console.debug(temp_cp + ' done, all prefetched are ready: ' + ready);
	return ready;
};


// Load site specific setup code
msos.onload_func_pre.push(msos.site.auto_init);

msos.console.info('site -> done!');
msos.console.timeEnd('site');
