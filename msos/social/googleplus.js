// Copyright Notice:
//				    googleplus.js
//			Copyright©2013-2017 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensitemobile.com and http://ngmomentum.com
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile Google+ functions

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.social.googleplus");

msos.social.googleplus.version = new msos.set_version(17, 6, 22);


msos.social.googleplus.one = function () {
    "use strict";

    var nav_lang = navigator.language || navigator.userLanguage || 'en-US',
		url = 'https://apis.google.com/js/plusone.js',
		gp_data = {
			'data-size' : 'medium',
			'data-href' : msos.base_site_url
		};

    ___gcfg = { lang: nav_lang };

    // Set to your website
    if (jQuery('.g-plusone').length) {
		jQuery('.g-plusone').attr(gp_data);

		// Use our loader for better debugging
		msos.site.loader.load(url, 'js');
    }
};

msos.site.social_html =
	'<div class="row">' +
		'<div class="span3">' +
			'<div class="g-plusone"></div>' +	// Google rewrites the g-plusone div
		'</div>' +
		'<div class="span3 fb-like"></div>' +
		'<div class="span3 twitter-like">' +
			'<a class="twitter-share-button" href="https://twitter.com/share">Tweet</a>' +
		'</div>' +
	'</div>' +
    '<script>' +
		'msos.site.google_plusone();' +
		'msos.site.facebook_like();' +
		'msos.site.twitter_like();' +
    '</script>';