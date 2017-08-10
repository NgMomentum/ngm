//
// Windows
//

/*global
    msos: false,
    hello: false
*/

msos.provide("hello.to.windows");

hello.to.windows.version = new msos.set_version(17, 7, 15);

hello.to.windows.base = 'https://apis.live.net/v5.0/';

hello.to.windows.formatImage = function (image) {
	"use strict";

	return {
		width: image.width,
		height: image.height,
		source: image.source
	};
};

hello.to.windows.formatDefault = function (o) {
	"use strict";

	if ('data' in o) {
		o.data.forEach(
			function (d) {
				if (d.picture) { d.thumbnail = d.picture; }

				if (d.images) {
					d.pictures = d.images
						.map(hello.to.windows.formatImage)
						.sort(function(a, b) { return a.width - b.width; });
				}
			}
		);
	}

	return o;
};

hello.to.windows.formatAlbums = function (o) {
	"use strict";

	if ('data' in o) {
		o.data.forEach(
			function (d) {
				d.photos = d.files = hello.to.windows.base + d.id + '/photos';
			}
		);
	}

	return o;
};

hello.to.windows.formatUser = function (o, headers, req) {
	"use strict";

	if (o.id) {
		var token = req.query.access_token,
			id;

		if (o.emails) {
			o.email = o.emails.preferred;
		}

		if (o.is_friend !== false) {
			id = (o.user_id || o.id);
			o.thumbnail = o.picture = hello.to.windows.base + id + '/picture?access_token=' + token;
		}
	}

	return o;
};

hello.to.windows.formatFriends = function (o, headers, req) {
	"use strict";

	if ('data' in o) {
		o.data.forEach(
			function (d) {
				hello.to.windows.formatUser(d, headers, req);
			}
		);
	}

	return o;
};

hello.to.windows.config = {

    windows: {

        name: 'Windows live',
        id: msos.config.oauth2.windows,

        oauth: {
			version: 2,
			auth: 'https://login.live.com/oauth20_authorize.srf',
			grant: 'https://login.live.com/oauth20_token.srf'
        },

		// Refresh the access_token once expired
		refresh: true,

		// API base URL
		base: 'https://apis.live.net/v5.0/',

        scope: {
			basic: 'wl.signin,wl.basic',
			email: 'wl.emails',
			birthday: 'wl.birthday',
			events: 'wl.calendars',
			photos: 'wl.photos',
			videos: 'wl.photos',
			friends: 'wl.contacts_emails',
			files: 'wl.skydrive',
			publish: 'wl.share',
			publish_files: 'wl.skydrive_update',
			share: 'wl.share',
			create_event: 'wl.calendars_update,wl.events_create',
			offline_access: 'wl.offline_access'
        },

        get: {
			'me': 'me',
			'me/friends': 'me/friends',
			'me/following': 'me/contacts',
			'me/followers': 'me/friends',
			'me/contacts': 'me/contacts',

			'me/albums': 'me/albums',

			'me/album': '@{id}/files',
			'me/photo': '@{id}',

			'me/files': '@{parent|me/skydrive}/files',
			'me/folders': '@{id|me/skydrive}/files',
			'me/folder': '@{id|me/skydrive}/files'
        },

		post: {
			'me/albums': 'me/albums',
			'me/album': '@{id}/files/',

			'me/folders': '@{id|me/skydrive/}',
			'me/files': '@{parent|me/skydrive}/files'
		},

		del: {
			'me/album': '@{id}',
			'me/photo': '@{id}',
			'me/folder': '@{id}',
			'me/files': '@{id}'
		},

		wrap: {
			'me': hello.to.windows.formatUser,
			'me/friends': hello.to.windows.formatFriends,
			'me/contacts': hello.to.windows.formatFriends,
			'me/followers': hello.to.windows.formatFriends,
			'me/following': hello.to.windows.formatFriends,
			'me/albums': hello.to.windows.formatAlbums,
			'me/photos': hello.to.windows.formatDefault,
			'default': hello.to.windows.formatDefault
		},

		logout: function () {
			"use strict";

			return 'https://login.live.com/oauth20_logout.srf?ts=' + (new Date()).getTime();
		},

		xhr: function (p) {
			"use strict";

			if (p.method !== 'get' && p.method !== 'delete' && !hello.utils.hasBinary(p.data)) {

				if (typeof (p.data.file) === 'string') {
					p.data.file = hello.utils.toBlob(p.data.file);
				} else {
					p.data = JSON.stringify(p.data);
					p.headers = {
						'Content-Type': 'application/json'
					};
				}
			}

			return true;
		},

		jsonp: function (p) {
			"use strict";

			if (p.method !== 'get' && !hello.utils.hasBinary(p.data)) {
				p.data.method = p.method;
				p.method = 'get';
			}
		}
    }
};

hello.to.windows.init = function () {
    "use strict";

    msos.console.debug('hello.to.windows.init -> start.');

    hello.init(hello.to.windows.config);

    msos.console.debug('hello.to.windows.init -> done!');
};


msos.onload_func_start.push(hello.to.windows.init);