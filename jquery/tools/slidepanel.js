/* jQuery slidePanel plugin
 * Examples and documentation at: http://www.jqeasy.com/
 * Version: 1.0 (22/03/2010)
 * No license. Use it however you want. Just keep this notice included.
 * Requires: jQuery v1.3+
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

/*global
    msos: false,
    jQuery: false,
    jquery: false,
    candy: false
*/

// An slightly modified version of "jQuery slidePanel plugin"

msos.provide("jquery.tools.slidepanel");

jquery.tools.slidepanel.version = new msos.set_version(16, 10, 27);


jquery.tools.slidepanel.css = new msos.loader();
jquery.tools.slidepanel.css.load(msos.resource_url('jquery', 'css/tools/slidepanel.css'));

jquery.tools.slidepanel.counter = 0;
jquery.tools.slidepanel.close_others = [];

(function ($) {
	"use strict";

    $.fn.slidePanel = function (opts) {
        opts = $.extend({
            reference_el:		'#trigger',		// Selector or jQuery element (either a simple reference element, or a trigger element)
			reference_is_trigger: true,
            position:			'absolute',
            referenceTopPos:	0,
			referenceRtPos:		0,
			referenceLtPos:		0,
            panelTopPos:		0,
			panelRtPos:			0,
			panelLtPos:			0,
            panelOpacity:		0.9,
			panelId:			'slide_panel_' + (jquery.tools.slidepanel.counter += 1),
            speed:				'fast',
            ajax:				false,
            ajaxSource:			null,
            close_click_outside: false,
			close_click_other:	true,
			open_icon_class:	'icon-plus-sign',
			close_icon_class:	'icon-minus-sign',
			panel_is_displayed:	false
        }, opts || {});

		var panel = this,
			panel_index = 0,
			panel_loaded = false,
			reference = $(opts.reference_el),
			trig_icon = reference.find($('i')),
			close_panel = null,
			open_panel = null,
			load_panel = null,
			on_trigger_click,
			temp_jsp = 'jquery.tools.slidepanel';

		msos.console.debug(temp_jsp + ' -> start, found reference: ' + (trig_icon.length ? 'true' : 'false') + ', got panel: ' + (panel.length ? 'true' : 'false'));

        if (opts.position === 'fixed') {
			reference.css('position', opts.position);
				panel.css('position', opts.position);
		}

        if (opts.referenceTopPos !== 0)	{ reference.css('top', opts.referenceTopPos); }
		if (opts.panelTopPos !== 0)		{ panel.css('top', opts.panelTopPos); }

		// Default it set in slidepanel.css right: 0 or left: 0 for each
		if (opts.referenceRtPos !== 0) { reference.css('right', opts.referenceRtPos); }
		if (opts.referenceLtPos !== 0) { reference.css('left',  opts.referenceLtPos); }

		if (opts.panelRtPos !== 0) { panel.css('right', opts.panelRtPos); }
		if (opts.panelLtPos !== 0) { panel.css('left',  opts.panelLtPos); }

        panel.css('filter',		'alpha(opacity=' + (opts.panelOpacity * 100) + ')');
        panel.css('opacity',	opts.panelOpacity);

		trig_icon.addClass(opts.open_icon_class);	// Initially use open trigger icon

		close_panel = function () {
			msos.console.debug(temp_jsp + ' - close -> called, panel: ' + opts.panelId);

			panel.hide(opts.speed);
			panel.removeClass("active");

			if (opts.reference_is_trigger) {
				reference.removeClass('active');
				trig_icon.removeClass(opts.close_icon_class);
				trig_icon.addClass(opts.open_icon_class);
			}

			opts.panel_is_displayed = false;
		};

		open_panel = function () {
			msos.console.debug(temp_jsp + ' -  open -> called, panel: ' + opts.panelId);

			panel.show(opts.speed);
			panel.addClass("active");

			if (opts.reference_is_trigger) {
				reference.addClass("active");
				trig_icon.removeClass(opts.open_icon_class);
				trig_icon.addClass(opts.close_icon_class);
			}

			opts.panel_is_displayed = true;
		};

		load_panel = function () {
			panel.load(
				opts.ajaxSource,
				function (response, status, xhr) {
					// if the ajax source wasn't loaded properly
					if (status !== "success") {
						msos.ajax_error(xhr, status, 'An error occured while loading panel content.');
					}

					panel.html(response);

					if (opts.panel_is_displayed)	{ close_panel(); }
					else							{ open_panel();  }
				}
			);
			panel_loaded = true;
		};

		// First time through...
		if (opts.panel_is_displayed) {
			if (panel_loaded) {
				open_panel();
			} else {
				opts.panel_is_displayed = false;	// Fake-out to display after load.
				load_panel();
			}
		}

		on_trigger_click = function (e) {
			var tmp_md = ' - on_trigger_click -> ',
				i = 0;

			msos.console.debug(temp_jsp + tmp_md + 'start.');

			// Close all panels which are to be closed when others are opened
			for (i = 0; i < jquery.tools.slidepanel.close_others.length; i += 1) {
				if (i !== panel_index) {
					jquery.tools.slidepanel.close_others[i]();
				}
			}

			// Load default content if ajax is false
			if (!opts.ajax) {
				if (opts.panel_is_displayed)	{ close_panel(); }
				else							{ open_panel();  }
			} else if (opts.ajaxSource !== null) {
				if (!panel_loaded) {
					load_panel();
				} else {
					if (opts.panel_is_displayed)	{ close_panel(); }
					else							{ open_panel();  }
				}

			} else if (msos.var_is_empty(opts.ajaxSource)) {
				msos.console.warn(temp_jsp + 'no ajax source defined.');
			}

			msos.do_nothing(e);

			msos.console.debug(temp_jsp + tmp_md + 'done!');
		};

		if (opts.reference_is_trigger) {
			// 'trigger_el' mousedown event (one trigger, one panel)
			reference.on(
				'mousedown',
				on_trigger_click
			);
		} else {
			// 'reference' name or jQuery obj (multiple panels, one or more triggers)
			reference.on(
				'jquery:tools:slidepanel.' + opts.panelId,
				on_trigger_click
			);
		}

        if (opts.close_click_outside) {

            $(document).bind(
				'mousedown',
				close_panel
			);

            panel.bind(
				'mousedown',
				function (e) {
					msos.do_nothing(e);
				}
			);
        }

		if (opts.close_click_other) {
			jquery.tools.slidepanel.close_others.push(close_panel);
			panel_index = jquery.tools.slidepanel.close_others.length - 1;
		} else {
			panel_index = - 1;
		}

		msos.console.debug(temp_jsp + ' -> done, for: ' + opts.panelId);
		return opts.panelId;
    };
}(jQuery));