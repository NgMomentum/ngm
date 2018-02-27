
/* global
	msos: false,
	ng: false
*/

msos.provide("ng.google.ga");

ng.google.ga.version = new msos.set_version(18, 1, 29);


ng.google.ga = ['$transitionsProvider', function($transitionsProvider) {
	"use strict";

	var vpv = function vpv(vpath) {
			return window.ga('send', 'pageview', vpath);
		},
		path = function path(trans) {
			var formattedRoute = trans.$to().url.format(trans.params()),
				withSitePrefix = location.pathname + formattedRoute;

			return '/' + withSitePrefix.split('/').filter(function(x) { return x; }).join('/');
		},
		error = function error(trans) {
			var err = trans.error(),
				type = err && err.hasOwnProperty('type') ? err.type : '_',
				message = err && err.hasOwnProperty('message') ? err.message : '_';

			vpv(path(trans) + ';errorType=' + type + ';errorMessage=' + message);
		};

	$transitionsProvider.onSuccess(
		{},
		function(trans) { return vpv(path(trans)); },
		{ priority: -10000 }
	);

	$transitionsProvider.onError(
		{},
		function(trans) { return error(trans); },
		{ priority: -10000 }
	);
}];
