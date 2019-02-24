
/* global
	msos: false,
	ng: false,
	angular: false
*/

msos.provide("ng.google.tagmanagement");

ng.google.tagmanagement.version = new msos.set_version(19, 2, 23);


// Add Google Analytics and Tag Management code via our prefetch functions (loads late, as page readies)
msos.prefetch_scripts.push('https://www.googletagmanager.com/gtag/js?id=' + msos.config.google.analytics_key);
msos.prefetch_scripts.push('https://www.googletagmanager.com/gtm.js?id=' + msos.config.google.tag_management_key);

window.dataLayer = window.dataLayer || [];

function gtag() { dataLayer.push(arguments); }

gtag('js', new Date());
gtag('config', msos.config.google.analytics_key);

window.dataLayer.push({
	'gtm.start': new Date().getTime(),
	'event': 'gtm.js'
});

/*
angular.module(
	'ng.google.tagmanagement',
	['ng', 'ng.ui.router']
).run(
	['$transitionsProvider', function ($transitionsProvider) {
		"use strict";

		var vpv = function vpv(vpath) {

				gtag('js', new Date());
				gtag('config', 'UA-135011380-1');

				return window.ga('send', 'pageview', vpath);
			},
			path = function path(trans) {
				var formattedRoute = trans.$to().url.format(trans.params()),
					withSitePrefix = location.pathname + formattedRoute;
	
				return '/' + withSitePrefix.split('/').filter(function (x) { return x; }).join('/');
			},
			error = function error(trans) {
				var err = trans.error(),
					type = err && err.hasOwnProperty('type') ? err.type : '_',
					message = err && err.hasOwnProperty('message') ? err.message : '_';
	
				vpv(path(trans) + ';errorType=' + type + ';errorMessage=' + message);
			};

		$transitionsProvider.onSuccess(
			{},
			function (trans) {
				return vpv(path(trans));
			},
			{ priority: -10000 }
		);

		$transitionsProvider.onError(
			{},
			function (trans) { return error(trans); },
			{ priority: -10000 }
		);
	}]
);

*/