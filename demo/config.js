// Copyright Notice:
//					config.js
//			Copyright©2012-2017 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			https://ngmomentum.com & https://opensitemobile.com
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com

/*
	NgMomentum demo pages (base) configuration file
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
		msos.resource_url('ng', 'bootstrap/css/ui/misc.css'),
		msos.resource_url('demo', 'site.css')
	];

} else {

	msos.deferred_css = [
		msos.resource_url('fonts', 'css/fontawesome.min.css'),
		msos.resource_url('ng', 'bootstrap/css/v337/wo_icons.min.css'),
		msos.resource_url('ng', 'bootstrap/css/v337/theme.min.css'),
		msos.resource_url('ng', 'bootstrap/css/ui/misc.css'),
		msos.resource_url('demo', 'site.css')
	];

}


// --------------------------
// Scripts to 'defer' load (script injection)
// --------------------------

if (msos.config.debug_script) {

	// Debug full scripts (line no's mean something)
    msos.deferred_scripts = [
		msos.resource_url('jquery', 'v321.uc.js'),
		msos.resource_url('ng', 'v167_msos.uc.js'),
		msos.resource_url('ng', 'ui/router/v042_msos.uc.js'),
		msos.resource_url('ng', 'bootstrap/v250_msos.uc.js'),
		msos.resource_url('demo', 'site.js'),
		msos.resource_url('msos', 'core.uc.js')
	];

	msos.prefetch_scripts = [
		msos.resource_url('firebase', 'v480.min.js'),		// Full script is na
		msos.resource_url('ng', 'firebase/v230_msos.uc.js'),
		msos.resource_url('hello', 'v1151.uc.js')
	];

} else {

	// Standard minimized scripts
    msos.deferred_scripts = [
		msos.resource_url('jquery', 'v321.min.js'),
		msos.resource_url('ng', 'v167_msos.min.js'),
		msos.resource_url('ng', 'ui/router/v042_msos.min.js'),
		msos.resource_url('ng', 'bootstrap/v250_msos.min.js'),
		msos.resource_url('demo', 'site.js'),
		msos.resource_url('msos', 'core.min.js')
	];

	msos.prefetch_scripts = [
		msos.resource_url('firebase', 'v480.min.js'),
		msos.resource_url('ng', 'firebase/v230_msos.min.js'),
		msos.resource_url('hello', 'v1151.min.js')
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
msos.config.oauth2 = {
	google: '296183405068-3379jn2v9polk5aj6j6bilf1k42j0vp2.apps.googleusercontent.com',
	facebook: '1510088492367892',
	windows: '000000004C107945',
	instagram: '34e2fb9bd305446cb080d852597584e9',
	cloudmade: 'efca0172cf084708a66a6d48ae1046dd',
	foursquare: 'SFYWHRQ1LTUJEQWYQMHOCXYWNFNS0MKUCAGANTHLFUGJX02E',
	yahoo: '',
	github: '',
	proxy_url: 'https://auth-server.herokuapp.com/proxy'
};

// Add your Google Maps API key here.
msos.config.google.maps_api_key = 'AIzaSyAhvG_5h55iUW3fLREMTPxB6joCAexYQ2o';

msos.config.google.firebase = {
    apiKey: "<API_KEY>",
    authDomain: "<PROJECT_ID>.firebaseapp.com",
    databaseURL: "https://<DATABASE_NAME>.firebaseio.com",
    storageBucket: "<BUCKET>.appspot.com",
    messagingSenderId: "<SENDER_ID>",
};


// Load our CSS
msos.css_loader(msos.deferred_css);

// Load our primary Scripts
msos.script_loader(msos.deferred_scripts);

// Prefetch our large secondary Scripts
msos.onload_func_done.push(
	function config_run_prefetch() {
		// Note: these will not be available at first page rendering
		msos.script_prefetcher(msos.prefetch_scripts);
	}
);

msos.console.info('config -> done!');
msos.console.timeEnd('config');
