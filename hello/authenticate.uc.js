/**
 * @hello.js
 *
 * HelloJS is a client side Javascript SDK for making OAuth2 logins and subsequent REST calls.
 *
 * @author Andrew Dodson
 * @company Knarly
 *
 * @copyright Andrew Dodson, 2012 - 2017
 * @license MIT: You are free to use and modify this code for any use, on the condition that this copyright notice remains.
 */

/*global
	msos: false,
	hello: false
*/

(function (_hello, _win) {
	"use strict";

    var tmp_at = '',
		parent = _win.opener || _win.parent,
		location = _win.location,
		p = _hello.utils.param(location.search),
		state,
		path,
		stateDecoded,
		a,
		b;

    // Make sure we have a window name
	_win.name = _win.name || 'child_' + parseInt(Math.random() * 1e12, 10).toString(36);

	// Lets note where this is coming from
	tmp_at = _win.name + ' - authenticating 8==> ';

	msos.console.debug(tmp_at + 'start, location: ' + location);

	function closeWindow() {

		try {
			_win.close();
		} catch (e) {
			msos.console.warn(tmp_at + 'closeWindow: failed!');
		}

		if (_win.addEventListener) {
			_win.addEventListener(
				'load',
				function () { _win.close(); }
			);
		}
	}

    function auth_cb(obj) {

		var tmp_ac = 'auth_cb -> ',
			cb = obj.callback,
			network = obj.network;

		msos.console.debug(tmp_at + tmp_ac + 'start.');

		if (obj.display && obj.display === 'page') {

			msos.console.debug(tmp_at + tmp_ac + 'skipped for page.');

		} else if (parent && cb && parent[cb]) {

			try {
                delete obj.callback;
			} catch (e) {
				msos.console.error(tmp_at + tmp_ac + 'delete callback failed, ' + e.message);
			}

			msos.console.debug(tmp_at + tmp_ac + 'callback: ' + cb);

			if (callbackID.indexOf('_hellojs_') !== 0) {
				msos.console.error(tmp_at + tmp_ac + 'could not execute callback: ' + callbackID);
			} else {
				try {
					parent[cb](obj);
				} catch (e) {
					msos.console.error(tmp_at + tmp_ac + 'callback: ' + cb + ', failed: ', e);
				}
			}

			closeWindow();
        } else {
			msos.console.warn(tmp_at + tmp_ac + 'no parent or parent callback');
			closeWindow();
		}

		_hello.utils.store(network, obj);

		msos.console.debug(tmp_at + tmp_ac + 'done!');
    }

	if (p && p.state && (p.code || p.oauth_token)) {

		state = JSON.parse(p.state);

		p.redirect_uri = state.redirect_uri || location.href.replace(/[\?\#].*$/, '');

		path = state.oauth_proxy + '?' + _hello.utils.param(p);

		location.assign(path);

		return;
	}

	p = _.extend(
			{},
			_hello.utils.param(location.search	|| ''),
			_hello.utils.param(location.hash	|| '')
	);

	msos.console.debug(tmp_at + 'revised p:', p);

    if (p && p.state) {

        try {
            a = JSON.parse(p.state);
            _.extend(p, a);
        } catch (e1) {
			stateDecoded = decodeURIComponent(p.state);
			try {
				b = JSON.parse(stateDecoded);
				_.extend(p, b);
			} catch (e2) {
				msos.console.error(tmp_at + 'could not decode state parameter, ' + e2.message);
			}
        }

        if (p.access_token && p.network) {

            if (!p.expires_in || parseInt(p.expires_in, 10) === 0) {
                p.expires_in = 0;
            }

            p.expires_in = parseInt(p.expires_in, 10);
            p.expires = ((new Date()).getTime() / 1e3) + (p.expires_in || (60 * 60 * 24 * 365));

            auth_cb(p.network, p);

        } else if (p.error && p.network) {

            p.error = {
                code: p.error,
                message: p.error_message || p.error_description
            };

            auth_cb(p);

        } else if (p.callback && p.result) {
            // trigger a function in the parent
            if (_win.parent[p.callback]) {
                _win.parent[p.callback](JSON.parse(p.result));
            }
        }

    } else if (p && p.oauth_redirect) {
		location.assign(decodeURIComponent(p.oauth_redirect));
	} else {
		msos.console.warn(tmp_at + 'no query returned.');
	}

	msos.console.debug(tmp_at + 'done, window: ' + _win.name);

}(hello, window));