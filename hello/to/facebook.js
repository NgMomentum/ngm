//
// Facebook
//

/*global
    msos: false,
    hello: false
*/

msos.provide("hello.to.facebook");

hello.to.facebook.version = new msos.set_version(17, 7, 15);

hello.to.facebook.sdk = 'v2.9';
hello.to.facebook.base = 'https://graph.facebook.com/';

hello.to.facebook.formatUser = function (o) {
	"use strict";

	if (o.id) {
		o.thumbnail = o.picture = hello.to.facebook.base + o.id + '/picture';
	}

	return o;
};

hello.to.facebook.formatFriends = function (o) {
	"use strict";

	if ('data' in o) {
		o.data.forEach(hello.to.facebook.formatUser);
	}

	return o;
};

hello.to.facebook.format = function (o, headers, req) {
	"use strict";

	if (typeof o === 'boolean') {
		o = { success: o };
	}

	if (o && 'data' in o) {
		var token = req.query.access_token,
			data;

		if (!(o.data instanceof Array)) {
			data = o.data;

			delete o.data;
			o.data = [data];
		}

		o.data.forEach(function (d) {

			if (d.picture) {
				d.thumbnail = d.picture;
			}

			d.pictures = (d.images || []).sort(
				function (a, b) {
					return a.width - b.width;
				}
			);

			if (d.cover_photo && d.cover_photo.id) {
				d.thumbnail = base + d.cover_photo.id + '/picture?access_token=' + token;
			}

			if (d.type === 'album') {
				d.files = d.photos = base + d.id + '/photos';
			}

			if (d.can_upload) {
				d.upload_location = base + d.id + '/photos';
			}
		});
	}

	return o;
};


hello.to.facebook.config = {

    facebook: {

        name: 'Facebook',
        id: msos.config.oauth2.facebook,

        oauth: {
            version: 2,
            auth: 'https://www.facebook.com/' + hello.to.facebook.sdk + '/dialog/oauth/',
            grant: hello.to.facebook.base + 'oauth/access_token'
        },

        // Authorization scopes
        scope: {
			basic: 'public_profile',
			email: 'email',
			share: 'user_posts',
			birthday: 'user_birthday',
			events: 'user_events',
			photos: 'user_photos',
			videos: 'user_videos',
			friends: 'user_friends',
			files: 'user_photos,user_videos',
			publish_files: 'user_photos,user_videos,publish_actions',
			publish: 'publish_actions',
			offline_access: ''
        },

		// Refresh the access_token
		refresh: false,

        // API Base URL
		base: hello.to.facebook.base + hello.to.facebook.sdk + '/',

        // Map GET requests
        get: {
			'me': 'me?fields=email,first_name,last_name,name,timezone,verified',
			'me/friends': 'me/friends',
			'me/following': 'me/friends',
			'me/followers': 'me/friends',
			'me/share': 'me/feed',
			'me/like': 'me/likes',
			'me/files': 'me/albums',
			'me/albums': 'me/albums?fields=cover_photo,name',
			'me/album': '@{id}/photos?fields=picture',
			'me/photos': 'me/photos',
			'me/photo': '@{id}',
			'friend/albums': '@{id}/albums',
			'friend/photos': '@{id}/photos'
        },

		// Map POST requests
		post: {
			'me/share': 'me/feed',
			'me/photo': '@{id}'
		},

		wrap: {
			'me': hello.to.facebook.formatUser,
			'me/friends': hello.to.facebook.formatFriends,
			'me/following': hello.to.facebook.formatFriends,
			'me/followers': hello.to.facebook.formatFriends,
			'me/albums': hello.to.facebook.format,
			'me/photos': hello.to.facebook.format,
			'me/files': hello.to.facebook.format,
			'default': hello.to.facebook.format
		},

		// Added v1151
		login: function (p) {
			"use strict";

			if (p.options.force) { p.qs.auth_type = 'reauthenticate'; }

			p.qs.display = p.options.display || 'popup';
		},

		logout: function (callback, options) {
			"use strict";

			var callbackID = hello.utils.globalEvent(callback),
				redirect = encodeURIComponent(hello.settings.redirect_uri + '?' + hello.utils.param({ callback: callbackID, result: JSON.stringify({ force: true }), state: '{}' })),
				token = (options.authResponse || {}).access_token;

			hello.utils.iframe('https://www.facebook.com/logout.php?next=' + redirect + '&access_token=' + token);

			if (!token) { return false; }
		},

		xhr: function (p, qs) {
			"use strict";

			if (p.method === 'get' || p.method === 'post') {
				qs.suppress_response_codes = true;
			}

			if (p.method === 'post' && p.data && typeof (p.data.file) === 'string') {
				p.data.file = hello.utils.toBlob(p.data.file);
			}

			return true;
		},

		jsonp: function (p, qs) {
			"use strict";

			var m = p.method;

			if (m !== 'get' && !hello.utils.hasBinary(p.data)) {
				p.data.method = m;
				p.method = 'get';
			} else if (p.method === 'delete') {
				qs.method = 'delete';
				p.method = 'post';
			}
		},

		form: function () {
			"use strict";

			return { callbackonload: true };
		}
    }
};


hello.to.facebook.init = function () {
    "use strict";

    msos.console.debug('hello.to.facebook.init -> start.');

    hello.init(hello.to.facebook.config);

    msos.console.debug('hello.to.facebook.init -> done!');
};

msos.onload_func_start.push(hello.to.facebook.init);
