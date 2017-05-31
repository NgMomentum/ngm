// Copyright Notice:
//				    tab.js
//			Copyright©2008-2016 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile simple tab generator

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.tab");

msos.tab.version = new msos.set_version(16, 10, 27);


// Start by loading our tab specific stylesheet
msos.tab.css = new msos.loader();
msos.tab.css.load(msos.resource_url('css', 'tab.css'));


msos.tab.tool = function (tabs_div) {
    "use strict";

    var tab_obj = this,
        tab_txt = 'msos.tab.tool';

    this.tab_div_el = tabs_div;
    this.tab_set_active = 1;
    this.act_tab_style = 'tab_active';
    this.pas_tab_style = 'tab_passive';
    this.com_tab_style = 'tab_common';
    this.tab_store_name = tabs_div.id;
    this.tabs = [];

    this.add_tab = function (def_obj) {
        var tab_flap = window.document.createElement("div"),
            tab_numb = tab_obj.tabs.length + 1,
            tab_caption = null;

        tab_flap.id = 'tab_flap_' + tab_numb;
        tab_flap.title = def_obj.tab_title;
        tab_flap.unselectable = "on";
        tab_flap.container = def_obj.container;

        jQuery(tab_flap).click(tab_obj.go_to_tab);

        tab_caption = document.createTextNode(def_obj.caption);
        tab_flap.appendChild(tab_caption);
        tab_obj.tabs.push(tab_flap);
    };

    this.generate_tabs = function () {
        var i = 0;

        for (i = 0; i < tab_obj.tabs.length; i += 1) {
            tab_obj.tab_div_el.appendChild(tab_obj.tabs[i]);
        }
        // Use current 'tab_set_active' tab
        tab_obj.set_tab();
        msos.console.debug(tab_txt + ' - generate_tabs -> completed.');
    };

    this.get_tab_fr_store = function () {
        var c_obj = msos.config.storage.site_tabs,
            c_name = c_obj.name + tab_obj.tab_store_name,
            tab_index = msos.basil.get(c_name);

        msos.console.debug(tab_txt + ' - get_tab_fr_store -> index: ' + tab_index + ' for: ' + c_name);
        if (tab_index) {
            tab_obj.tab_set_active = tab_index;
        }
    };

    this.set_tab = function () {
        var st = ' - set_tab -> ',
            c_obj = msos.config.storage.site_tabs,
            c_name = c_obj.name + tab_obj.tab_store_name,
            set_act_tab = tab_obj.tab_set_active || 1,
            act_set = false,
            i = 0;

        if (set_act_tab === 'na') {
            set_act_tab = 1;
        }
        if (isNaN(parseInt(set_act_tab, 10))) {
            set_act_tab = 1;
        }
        if (set_act_tab < 1) {
            set_act_tab = 1;
        }
        if (set_act_tab > tab_obj.tabs.length) {
            set_act_tab = tab_obj.tabs.length;
        }

        msos.console.debug(tab_txt + st + 'start, set active: ' + set_act_tab);

        for (i = 0; i < tab_obj.tabs.length; i += 1) {
            // don't use === here!
            if (set_act_tab == i + 1) {
                tab_obj.tabs[i].className = tab_obj.act_tab_style + " " + tab_obj.com_tab_style;
                tab_obj.tabs[i].container.style.display = 'block';
                jQuery(tab_obj.tabs[i].container).addClass('tab_active');
                tab_obj.tab_set_active = i + 1;
                msos.basil.set(
                    c_name,
                    (i + 1)
                );
                act_set = true;
                msos.console.debug(tab_txt + st + 'index: ' + (i + 1) + ' for stored value: ' + c_name);
            }
            else {
                tab_obj.tabs[i].className = tab_obj.pas_tab_style + " " + tab_obj.com_tab_style;
                tab_obj.tabs[i].container.style.display = 'none';
                jQuery(tab_obj.tabs[i].container).removeClass('tab_active');
            }
        }
        if (!act_set) {
            msos.console.error(tab_txt + st + 'active tab failed!');
        }
        msos.console.debug(tab_txt + st + 'done!');
    };

    // --------------------------
    // Event Functions
    // --------------------------
    this.go_to_tab = function (evt) {

        msos.do_nothing(evt);

        var target = evt.target,
            $target = null,
            tab_idx = tab_obj.tab_set_active,
            tab_id = '';

        msos.console.debug(tab_txt + ' - go_to_tab -> called, id: ' + (target.id || 'na'));

        if (target.id) {
            tab_id = target.id;
        } else {
            // Google Web Translate move event to <font> tag (for some reason?)
            $target = jQuery(target).parents('[id^="tab_flap_"]');
            tab_id = $target[0].id || '';
        }

        tab_id = tab_id.replace(/tab_flap_/, '');

        if (tab_id) {
            tab_idx = parseInt(tab_id, 10)
        } else {
            msos.console.error(tab_txt + ' - go_to_tab -> failed, no specific tab.');
        }

        if (msos.debug) {
            msos.debug.event(evt, "\n" + tab_txt + " - go_to_tab -> index: " + tab_idx);
        }

        tab_obj.tab_set_active = tab_idx;
        tab_obj.set_tab();
    };
};