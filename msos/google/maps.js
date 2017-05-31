// Copyright Notice:
//				    maps.js
//			Copyright©2010-2017 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile ajax filled popup div functions

/*global
    msos: false,
    jQuery: false,
    Modernizr: false
*/

msos.provide("msos.google.maps");

if (!Modernizr.geolocation) {
    msos.require("msos.html5.geolocation");     // Hopefully never used now...
}

msos.google.maps.version = new msos.set_version(17, 5, 4);

msos.google.maps.places = msos.google.maps.places || false;
msos.google.maps.url_google_api = 'https://maps.googleapis.com/maps/api/js?key=' + msos.config.google.maps_api_key + '&callback=google_maps_api_ready' + (msos.google.maps.places ? '&libraries=places' : '');
msos.google.maps.loaded = false;
msos.google.maps.ran = false;
msos.google.maps.run_onload = [];
msos.google.maps.run_onfail = [];
msos.google.maps.hostname_regx = new RegExp('^https?://.+?/');


msos.google.maps.gen_places_info_window = function (place) {
    "use strict";

    var tmp_mg = 'msos.google.maps.gen_places_info_window -> ',
        content = '',
        website = '',
        fullurl = '',
        i = 0,
        rating_icon = '',
        photo_url = '',
        test_el,
        pic_px = '',
        pic_width = 0;

    if (msos.config.verbose) {
        msos.console.debug(tmp_mg + 'start, place:', place);
    } else {
        msos.console.debug(tmp_mg + 'start.');
    }

    content += '<table class="iw_table">';
    content += 		'<tr class="iw_table_row">';
    content += 			'<td class="iw_attribute"><img class="iw_place_icon" src="' + place.icon + '"/></td>';
    content += 			'<td><a class="msos_link" href="' + place.url + '" target="_blank"><strong>' + place.name + '</strong></a></td>';
    content +=		'</tr><tr class="iw_table_row">';
    content += 			'<td class="iw_attribute"><i class="icon-home"></i></td>';
    content += 			'<td>' + place.vicinity + '</td>';
    content +=		'</tr>';

    if (place.formatted_phone_number) {
        content +=	'<tr class="iw_table_row">';
        content += 		'<td class="iw_attribute"><i class="icon-phone"></i></td>';
        content += 		'<td>' + place.formatted_phone_number + '</td>';
        content +=	'</tr>';      
    }

    if (place.rating) {
        for (i = 0; i < 5; i += 1) {
            if (place.rating < (i + 0.4)) {
                rating_icon += '<i class="iw_ratings icon-star-empty"></i>';
            } else if (place.rating < (i + 0.8)) {
                rating_icon += '<i class="iw_ratings icon-star-half-empty"></i>';
            } else {
                rating_icon += '<i class="iw_ratings icon-star"></i>';
            }
        }
        content +=	'<tr class="iw_table_row">';
        content +=		'<td class="iw_attribute"><i class="icon-thumbs-up"></i></td>';
        content +=		'<td>' + rating_icon + '</td>';
        content +=	'</tr>';
    }

    if (place.website) {
        fullurl = place.website;
        website = msos.google.maps.hostname_regx.exec(place.website);

        if (website === null || website === '') { 
            website = 'http://' + place.website + '/';
            fullurl = website;
        }
        content +=	'<tr class="iw_table_row">';
        content +=		'<td class="iw_attribute"><i class="icon-globe"></i></td>';
        content +=		'<td><a class="msos_link" href="' + fullurl + '" target="_blank"><strong>' + website + '</strong></a></td>';
        content +=	'</tr>';
    }

    content +=	'</table>';

    if (msos.config.size !== 'phone') {
        if (place.photos && place.photos[0]) {
            test_el = jQuery('table')[0];
            pic_px = window.getComputedStyle(test_el).fontSize;
            pic_width = pic_px.replace(/[^\d]/g, '');
            pic_width = Number(pic_width);
            // * 16 corresponds to .iw_table { width: 16em; } in txtmap.css
            pic_width = parseInt((pic_width * 16), 10);
            pic_width = pic_width > 204 ? pic_width : 204;

            photo_url = place.photos[0].getUrl({ maxWidth: pic_width });
            content +=  '<div class="iw_image" style="background: url(\'' + photo_url + '\') no-repeat #CCC;"></div>';
        }
    }

    msos.console.debug(tmp_mg + 'done!');
    return content;
};

msos.google.maps.gen_fb_info_window = function (person, location) {
    "use strict";

    var tmp_mf = 'msos.google.maps.gen_fb_info_window -> ',
        content = '';

    if (msos.config.verbose) {
        msos.console.debug(tmp_mf + 'start, person:', person);
    } else {
        msos.console.debug(tmp_mf + 'start.');
    }

    content +=  '<table class="iw_table">';
    content += 		'<tr class="iw_table_row">';
    content += 			'<td class="iw_attribute"><i class="icon-facebook-sign"></td>';
    content += 			'<td><a class="msos_link" href="https://graph.facebook.com/' + person.uid + '" target="_blank"><strong>' + person.name + '</strong></a></td>';
    content +=		'</tr>';

    if (location.current_location) {
        content +=	'<tr class="iw_table_row">';
        content += 		'<td class="iw_attribute"><i class="icon-bullseye"></i></td>';
        content += 		'<td>' + location.current_location.name + '</td>';
        content +=	'</tr>';      
    }

    if (location.hometown_location) {
        content +=	'<tr class="iw_table_row">';
        content += 		'<td class="iw_attribute"><i class="icon-home"></i></td>';
        content += 		'<td>' + location.hometown_location.name + '</td>';
        content +=	'</tr>';      
    }

    content +=  '</table>';

    msos.console.debug(tmp_mf + 'done!');
    return content;
};

msos.google.maps.add_onload_ready = function (map_ready_func) {
    "use strict";

    if (typeof map_ready_func === 'function') {
 
        if (msos.google.maps.ran) {
            // Google Maps already initialized
            map_ready_func();
        } else {
            // Waiting for Google Maps to load
            msos.google.maps.run_onload.push(map_ready_func);
        }

    } else {
        msos.console.error('msos.google.maps.add_onload_ready -> failed, input not a function!');
    }
};

function google_maps_api_ready() {
    "use strict";

    // Register Google API ready
    msos.google.maps.loaded = true;
}

msos.google.maps.run_index = 0;

msos.google.maps.run = function () {
    "use strict";

    var temp_gmr = 'msos.google.maps.run -> ',
        run = msos.google.maps.run_onload,
        fail = msos.google.maps.run_onfail,
        i;

    // Might have to wait for widget loading
    if (!msos.google.maps.loaded) {
        msos.console.warn(temp_gmr + 'not ready, count: ' + msos.google.maps.run_index);
        msos.google.maps.run_index += 1;

        // Check for up to 15 sec.
        if (msos.google.maps.run_index < 16) {
            setTimeout(msos.google.maps.run, 1000);
        } else {
            for (i = 0; i < fail.length; i += 1) { fail[i](); }
        }
        return;
    }

    msos.console.debug(temp_gmr + 'start.');

    if (!jQuery.fn.gmap3) {
        msos.console.error(temp_gmr + 'missing jQuery GMap3 script, (load via config.js)!');
    } else {

        // If msos.marker.label was loaded, generate "MarkerWithLabel"
        if (msos.marker && msos.marker.label) {
            msos.marker.label.initialize();
        }
    
        for (i = 0; i < run.length; i += 1) { run[i](); }
    
        msos.google.maps.ran = true;
    }

    msos.console.debug(temp_gmr + 'done!');
};

msos.google.maps.initiate = function () {
    "use strict";

    var temp_mi = 'msos.google.maps.initiate -> ',
        map_loader = new msos.loader();

    msos.console.debug(temp_mi + 'start.');

    if (msos.config.debug_disable === 'mapping') {
        msos.console.warn(temp_mi + 'done: skipped mapping while debugging.');
        return;
    }
    // Load Google Checkout API with our loader for better debugging
    map_loader.load(msos.google.maps.url_google_api, 'js');

    msos.console.debug(temp_mi + 'done!');
};

// Add map script immediately
msos.google.maps.initiate();

// Run late so map script has time to create widget
msos.onload_func_done.push(msos.google.maps.run);