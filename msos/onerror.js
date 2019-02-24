// Copyright Notice:
//				    onerror.js
//			Copyright©2011-2019 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile 'window.onerror' tracking function

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.onerror");

msos.onerror.version = new msos.set_version(19, 2, 20);


window.onerror = function (msg, url, line) {
	"use strict";

	var temp_wo = 'msos.onerror -> ';

	msos.catch_js_error(msg, url, line);

	jQuery.ajax({
		type: "GET",
		cache: false,
		url: msos.config.onerror_uri,
		data: jQuery.param({
			'message': msg,
			'url': url,
			'userAgent': navigator.userAgent,
			'line': line,
			'website': document.domain
		}),
		success: function () {
			msos.console.info(temp_wo + 'logged to url: ' + msos.config.onerror_uri);
		},
		error: msos.ajax_error
	});

	if (window.opener && window.opener.msos) {
		window.opener.msos.console.error(temp_wo + 'called, child window.onerror -> for window: ' + window.name);
	}

	return true;
};
