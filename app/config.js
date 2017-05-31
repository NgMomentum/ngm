// Copyright Notice:
//					config.js
//			Copyright©2012-2017 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://ngmomentum.com & http://opensitemobile.com
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com

/*
	NgMomentum - configuration file
*/

/*global
	msos: false,
    _gaq: true,
    ___gcfg: true
*/

msos.console.info('config -> start, (/ngm/demo/config.js file).');
msos.console.time('config');

// Set specific config flags (w/ boolean true/false)
msos.site_specific({ run_onerror: true });

// --------------------------
// Stylesheets to load (CSS injection)
// --------------------------

if (msos.config.debug_css) {

	msos.deferred_css = [
		msos.resource_url('fonts', 'css/fontawesome.uc.css'),
		msos.resource_url('ng', 'bootstrap/css/v337/wo_icons.uc.css'),
		msos.resource_url('ng', 'bootstrap/css/v337/theme.uc.css'),
		msos.resource_url('ng', 'bootstrap/css/ui/misc.css')
	];

} else {

	msos.deferred_css = [
		msos.resource_url('fonts', 'css/fontawesome.min.css'),
		msos.resource_url('ng', 'bootstrap/css/v337/wo_icons.min.css'),
		msos.resource_url('ng', 'bootstrap/css/v337/theme.min.css'),
		msos.resource_url('ng', 'bootstrap/css/ui/misc.css')
	];

}


// --------------------------
// Scripts to 'defer' load (script injection)
// --------------------------

if (msos.config.debug_script) {

	// Debug full scripts (line no's mean something)
    msos.deferred_scripts = [
		msos.resource_url('jquery', 'v311_msos.uc.js'),
//		msos.resource_url('firebase', 'v360.min.js'),		// There is no uncompressed file available
		msos.resource_url('ng', 'v155_msos.uc.js'),
		msos.resource_url('ng', 'animate/v155_msos.uc.js'),
		msos.resource_url('ng', 'ui/router/v0218_msos.uc.js'),
		msos.resource_url('ng', 'bootstrap/v132_msos.uc.js'),
//		msos.resource_url('ng', 'firebase/v210_msos.uc.js'),
		msos.resource_url('app', 'site.js'),					// Common installation specific setup code (which needs jQuery, underscore.js, etc.)
		msos.resource_url('msos', 'core.uc.js')
	];

} else {

	// Standard site provided (including ext. bundles) scripts
    msos.deferred_scripts = [
		msos.resource_url('jquery', 'v311_msos.min.js'),
//		msos.resource_url('firebase', 'v360.min.js'),
		msos.resource_url('ng', 'v155_msos.min.js'),
		msos.resource_url('ng', 'animate/v155_msos.min.js'),
		msos.resource_url('ng', 'ui/router/v0218_msos.min.js'),
		msos.resource_url('ng', 'bootstrap/v132_msos.min.js'),
//		msos.resource_url('ng', 'firebase/v210_msos.min.js'),
		msos.resource_url('app', 'site.js'),
		msos.resource_url('msos', 'core.min.js')
	];
}


// Google Analytics
var _gaq = [],
    ___gcfg = {};

_gaq.push(['_setAccount', 'UA-24170958-1']);
_gaq.push(['_trackPageview']);
// Ref. 'msos.site.google_analytics' in site.uc.js -> site.min.js
msos.config.google.analytics_domain = 'opensitemobile.com';

// Social website API access keys
msos.config.social = {
	google: '526338426431.apps.googleusercontent.com',
	facebook: '583738878406494',
	windows: '000000004C107945',
	instagram: '34e2fb9bd305446cb080d852597584e9',
	cloudmade: 'efca0172cf084708a66a6d48ae1046dd',
	foursquare: 'SFYWHRQ1LTUJEQWYQMHOCXYWNFNS0MKUCAGANTHLFUGJX02E'
};


msos.css_loader(msos.deferred_css);
msos.script_loader(msos.deferred_scripts);

msos.console.info('config -> done!');
msos.console.timeEnd('config');
