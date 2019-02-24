
/* global
	msos: false,
	ng: false
*/

msos.provide("ng.google.adsense");

ng.google.adsense.version = new msos.set_version(19, 2, 24);


// Add Adsense code via our prefetch functions (loads late, as page readies)
msos.prefetch_scripts.push('//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js');

angular.module(
	'ng.google.adsense',
	['ng']
).directive(
	'adsense',
	function () {
		"use strict";

		var client = msos.config.google.adsense_client_key;

		msos.console.debug('ng.google.adsense - adsense -> called, for client: ' + client);

		// <adsense ad-slot="5181577052"></adsense>

		var ins_tmpl ='<ins class="adsbygoogle" style="display:block" data-ad-client="' + client + '" data-ad-slot="{{adSlot}}" data-ad-format="auto" data-full-width-responsive="true"></ins>';

        return {
            restrict: 'E',
            replace: true,
            scope : {
				adSlot : '@'
            },
            template: ins_tmpl,
            controller: ['$timeout', function ($timeout) {

				msos.console.debug('ng.google.adsense - adsense - controller -> called.');

                $timeout(
					function () {
						(window.adsbygoogle = window.adsbygoogle || []).push({
							google_ad_client: client,
							enable_page_level_ads: true
						});
					},
					10,
					false
				);
            }]
        };
    }
);
