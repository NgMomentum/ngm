// Copyright Notice:
//				    size.js
//			Copyright©2012-2016 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile MobileSiteOS page size selection code
//

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.size");
msos.require("msos.i18n.common");

msos.size.version = new msos.set_version(16, 10, 27);

msos.size.page_ready = function () {
	"use strict";
	msos.console.debug('msos.size.page_ready -> first call does nothing.');
};

msos.size.evaluate = function (force_sizing) {
	"use strict";

	var cc = msos.config.storage,
		prev_size = msos.config.size;

	// Set the display size
	msos.get_display_size(force_sizing);

	// Check for change
	if (prev_size !== msos.config.size) {

		// Reset site user preferences for new size
		msos.basil.set(
			cc.site_pref.name,
			cc.site_pref.value
		);

		if (msos.config.run_ads) {
			// Reload page (so Google AdSense sizes correctly)
			window.location.reload(false);
		} else {
			msos.size.set_display();
		}
	}
};

msos.size.set_display = function () {
	"use strict";

	var temp_rd = 'msos.size.set_display -> ',
		loader_obj = new msos.loader(),
		run_on_display_change = function () {
			var j = 0,
				odc = msos.ondisplay_size_change;

			for (j = 0; j < odc.length; j += 1) { odc[j](); }

			jQuery('#body').show();
		};

	msos.console.debug(temp_rd + 'start.');

	jQuery('#body').hide();

	loader_obj.toggle_css = msos.config.size_array.slice(0);

	// Largest -> smallest display
	loader_obj.toggle_css.reverse();

	// Load the stylesheet for this size (or make active for already available one's)
	loader_obj.add_resource_onload.push(
		function () {
			setTimeout(run_on_display_change, 150);
		}
	);

	// Load sizing stylesheet
    loader_obj.load(msos.resource_url(msos.config.size_folder, 'size/' + msos.config.size + '.css'));

	msos.console.debug(temp_rd + 'done: ' + msos.config.size);
};

// This code is very similar to the 'msos.demo' module
msos.size.selection = function ($container) {
    "use strict";

    var select_display_sizes = {},
        size = '';

    if (!msos.valid_jq_node($container, 'select')) { return; }

    // Build display size select input object
    for (size in msos.config.size_wide) {
		if (msos.config.size_wide.hasOwnProperty(size)) {
			select_display_sizes[size] = (msos.i18n.common.bundle[size] || size) + ': ' + msos.config.size_wide[size] + 'px';
		}
    }

    // Generate display size menu
    msos.gen_select_menu($container, select_display_sizes, msos.config.size);

    $container.change(
        function () {
			// Set size via query parameter (ref. msos.get_display_size)
            msos.config.query.size = jQuery.trim(this.value);

            msos.size.evaluate();
        }
    );
};

msos.size.set_onorientation = function () {
	"use strict";

	msos.size.evaluate();
};

msos.size.set_onresize = function () {
	"use strict";

	// 'true' forces recalculation
	msos.size.evaluate(true);
};


// Run immediately
msos.size.set_display();

// Run on orientation change
msos.onorientationchange_functions.push(msos.size.set_onorientation);

// Run on window resize
msos.onresize_functions.push(msos.size.set_onresize);
