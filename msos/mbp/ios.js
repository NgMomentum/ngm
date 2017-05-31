/**
 * MBP - Mobile boilerplate helper functions
 *
 * Modified slightly for MobileSiteOS
 */

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.mbp.ios");

msos.mbp.ios.version = new msos.set_version(16, 10, 27);


(function (document) {
    "use strict";

    /**
     * Fix for iPhone viewport scale bug
     * http://www.blog.highub.com/mobile-2/a-fix-for-iphone-viewport-scale-bug/
     */

    msos.mbp.ios.viewportmeta = document.querySelector && document.querySelector('meta[name="viewport"]');
    msos.mbp.ios.ua = navigator.userAgent;

    msos.mbp.ios.gestureStart = function () {
        msos.mbp.ios.viewportmeta.content = 'width=device-width, minimum-scale=0.25, maximum-scale=1.6';
    };

    msos.mbp.ios.scaleFix = function () {
        if (msos.mbp.ios.viewportmeta && /iPhone|iPad|iPod/.test(msos.mbp.ios.ua) && !/Opera Mini/.test(msos.mbp.ios.ua)) {
            msos.mbp.ios.viewportmeta.content = 'width=device-width, minimum-scale=1.0, maximum-scale=1.0';
            document.addEventListener('gesturestart', msos.mbp.ios.gestureStart, false);
        }
    };

    /**
     * Autogrow
     * http://googlecode.blogspot.com/2009/07/gmail-for-mobile-html5-series.html
     */
    msos.mbp.ios.autogrow = function( element, lh) {
        function handler(e) {
            var newHeight = this.scrollHeight;
            var currentHeight = this.clientHeight;
            if (newHeight > currentHeight) {
                this.style.height = newHeight + 3 * textLineHeight + 'px';
            }
        }

        var setLineHeight = (lh) ? lh : 12;
        var textLineHeight = element.currentStyle ? element.currentStyle.lineHeight : getComputedStyle(element, null).lineHeight;

        textLineHeight = (textLineHeight.indexOf('px') == -1) ? setLineHeight : parseInt(textLineHeight, 10);

        element.style.overflow = 'hidden';
        element.addEventListener ? element.addEventListener('input', handler, false) : element.attachEvent('onpropertychange', handler);
    };

    /**
     * Enable CSS active pseudo styles in Mobile Safari
     * http://alxgbsn.co.uk/2011/10/17/enable-css-active-pseudo-styles-in-mobile-safari/
     */
    msos.mbp.ios.enableActive = function () {
        document.addEventListener('touchstart', function () {}, false);
    };

    /**
     * Prevent default scrolling on document window
     */
    msos.mbp.ios.preventScrolling = function () {
        document.addEventListener('touchmove', function (e) {
            if (e.target.type === 'range') { return; }
            e.preventDefault();
        }, false);
    };

	/**
     * Prevent iOS from zooming onfocus
     * https://github.com/h5bp/mobile-boilerplate/pull/108
     * Adapted from original jQuery code here: http://nerd.vasilis.nl/prevent-ios-from-zooming-onfocus/
     */
    msos.mbp.ios.preventZoom = function () {
        if (msos.mbp.ios.viewportmeta && navigator.platform.match(/iPad|iPhone|iPod/i)) {
            var contentString = 'width=device-width,initial-scale=1,maximum-scale=';

			jQuery(document).on(
				'focus',
				'input select textarea',
				function () {
					msos.mbp.ios.viewportmeta.content = contentString + '1';
				}
			);
            jQuery(document).on(
				'blur',
				'input select textarea',
				function () {
					msos.mbp.ios.viewportmeta.content = contentString + '10';
				}
            );
        }
    };

    /**
     * iOS Startup Image helper
     */

    msos.mbp.ios.startupImage = function () {
        var portrait,
            landscape,
            pixelRatio,
            head,
            link1,
            link2;

        pixelRatio = window.devicePixelRatio;
        head = document.getElementsByTagName('head')[0];

        if (navigator.platform === 'iPad') {
            portrait = pixelRatio === 2 ?  msos.resource_url('images', 'startup/startup-tablet-portrait-retina.png') :  msos.resource_url('images', 'startup/startup-tablet-portrait.png');
            landscape = pixelRatio === 2 ? msos.resource_url('images', 'startup/startup-tablet-landscape-retina.png') : msos.resource_url('images', 'startup/startup-tablet-landscape.png');

            link1 = document.createElement('link');
            link1.setAttribute('rel', 'apple-touch-startup-image');
            link1.setAttribute('media', 'screen and (orientation: portrait)');
            link1.setAttribute('href', portrait);
            head.appendChild(link1);

            link2 = document.createElement('link');
            link2.setAttribute('rel', 'apple-touch-startup-image');
            link2.setAttribute('media', 'screen and (orientation: landscape)');
            link2.setAttribute('href', landscape);
            head.appendChild(link2);
        } else {
            portrait = pixelRatio === 2 ? msos.resource_url('images', 'startup/startup-retina.png') : msos.resource_url('images', 'startup/startup.png');

            link1 = document.createElement('link');
            link1.setAttribute('rel', 'apple-touch-startup-image');
            link1.setAttribute('href', portrait);
            head.appendChild(link1);
        }
    };

}(document));


// Add these late (no hurry)
msos.onload_func_done.push(msos.mbp.ios.startupImage);
msos.onload_func_done.push(msos.mbp.ios.preventZoom);
msos.onload_func_done.push(msos.mbp.ios.scaleFix);
