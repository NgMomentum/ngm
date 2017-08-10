
/*global
    msos: false,
    hello: false
*/

msos.provide("hello.to.monitor");

hello.to.monitor.version = new msos.set_version(17, 7, 26);


// Start monitoring
(function (_hello, _win) {
	"use strict";

    // Monitor for a change in state and fire
    var tmp_mt = '',
		mtv = msos.config.verbose,
		old_sessions = {},
		expired = {},
		check_count = 0,
		check_timeout = 600000;	// Default checking every 10 minutes

	_win.name = _win.name || 'parent_window';

	// Let ref. where this script is
	tmp_mt = _win.name + ' - monitor 8==> ';

	msos.console.debug(tmp_mt + 'start.');

	// Listen to other triggers to Auth events, use these to update this
	_hello.on(
		'auth.login, auth.logout',
		function (auth) {
			if (auth && typeof (auth) === 'object' && auth.network) {
				old_sessions[auth.network] = _hello.utils.store(auth.network) || {};
				if (mtv) {
					msos.console.debug(tmp_mt + 'old_sessions:', old_sessions);
				}
			}
		}
	);

    (function check() {

        var CURRENT_TIME = ((new Date()).getTime() / 1e3),
			name,
			session,
			provider,
			oldsess,
			refresh,
			cb,
			checked = 0,
			loaded = 0,
			emit = function (event_name) {
                _hello.emit(
					"auth." + event_name,
					{
						network: name,
						authResponse: session
					}
				);
            };

		check_count += 1;
		msos.console.debug(tmp_mt + 'check -> start (' + String(check_count) + ').');

        // Loop through the services
        for (name in _hello.services) {

            if (_hello.services.hasOwnProperty(name) && _hello.services[name] && _hello.services[name].id) {

				checked += 1;

                // Get session
                session =	_hello.utils.store(name) || {};
                oldsess =	old_sessions[name] || {};
				provider =	_hello.services[name];

				if (mtv) { msos.console.debug(tmp_mt + 'check -> loop services, for: ' + name); }

                if (session && session.callback) {

					cb = session.callback;

					delete session.callback;

					// Update store (removing the callback id)
					_hello.utils.store(name, session);

					// Emit global events
					try {
						_win[cb](session);
					} catch (e) {
						msos.console.error(tmp_mt + 'check -> execute callback: ' + cb + ', failed:', e);
					}
					if (mtv) {
						msos.console.debug(tmp_mt + 'check -> executed cb, for: ' + name);
					}
				}

                if (session && session.expires && session.expires < CURRENT_TIME) {

					msos.console.debug(tmp_mt + 'check -> expired, for: ' + name);

					refresh = provider.refresh || session.refresh_token;

					if (refresh && (!(name in expired) || expired[name] < CURRENT_TIME)) {
						// Try to resignin
						_hello.emit(
							'notice',
							name + ' has expired trying to resignin'
						);
						_hello.login(
							{
								network: name,
								options: {
									display: 'none',
									force: false
								}
							}
						);

						// Update expired, every 10 minutes
						expired[name] = CURRENT_TIME + 600;

					} else if (!refresh && !expired[name]) {
						// Label the event
						emit('expired');
						expired[name] = true;
						check_timeout = 600000;	// Reset the timeout to self check every 10 min.
                    }

                } else if (oldsess.access_token === session.access_token && oldsess.expires === session.expires) {
					if (mtv) { msos.console.debug(tmp_mt + 'check -> no change, for: ' + name); }
					expired[name] = false;
					loaded += 1;
                } else if (!session.access_token && oldsess.access_token) {
					if (mtv) { msos.console.debug(tmp_mt + 'check -> logout, for: ' + name); }
                    emit('logout');
                } else if (session.access_token && !oldsess.access_token) {
					if (mtv) { msos.console.debug(tmp_mt + 'check -> login, for: ' + name); }
					emit('login');
                } else if (session.expires !== oldsess.expires) {
					if (mtv) { msos.console.debug(tmp_mt + 'check -> update, for: ' + name); }
                    emit('update');
                }

				// Updated stored session
				old_sessions[name] = session;

				// Remove the expired flags
				if (expired[name]) { delete expired[name]; }

				if (session.expires && session.expires > CURRENT_TIME) {
					if (mtv) { msos.console.debug(tmp_mt + 'check -> name: ' + name + ', expires in: ' + String(parseInt((session.expires - CURRENT_TIME) / 60, 10)) + ' min.'); }
					// We check more often when we get nearer a session expiration (the .8 part)
					if ((session.expires - CURRENT_TIME) < (check_timeout / 1e3)) {
						check_timeout = (session.expires - CURRENT_TIME) * 1e3 * 0.8;
					}
				}
            } else {
				msos.console.warn(tmp_mt + 'check -> no provider, for: ' + name);
			}
        }

		if ((loaded < checked) && (check_count < 11)) {
			// Check for up to 10, 1 sec. intervals
			setTimeout(check, 1000);
		} else {
			// Never go below 1 sec.
			check_timeout = check_timeout < 1000 ? 1000 : check_timeout;

			msos.console.debug(tmp_mt + 'check -> timeout: ' + String(check_timeout));
			setTimeout(check, check_timeout);
		}

		msos.console.debug(tmp_mt + 'check -> done!');

    }());

	msos.console.debug(tmp_mt + 'done!');

}(hello, window));
