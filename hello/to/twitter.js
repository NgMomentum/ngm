//
// Twitter
//

/*global
    msos: false,
    hello: false
*/

msos.provide("hello.to.twitter");

hello.to.twitter.version = new msos.set_version(17, 6, 29);

hello.to.twitter.base = 'https://api.twitter.com/';

hello.to.twitter.formatUser = function (o) {
	"use strict";

	if (o.id) {

		if (o.name) {
			var m = o.name.split(' ');
			o.first_name = m.shift();
			o.last_name = m.join(' ');
		}

		// See: https://dev.twitter.com/overview/general/user-profile-images-and-banners
		o.thumbnail = o.profile_image_url_https || o.profile_image_url;
	}

	return o;
};

hello.to.twitter.formatFriends = function (o) {
	"use strict";

	hello.to.twitter.formatError(o);
	hello.to.twitter.paging(o);

	if (o.users) {
		o.data = o.users.map(hello.to.twitter.formatUser);
		delete o.users;
	}

	return o;
};

hello.to.twitter.formatError = function (o) {
	"use strict";

	if (o.errors) {
		var e = o.errors[0];

		o.error = {
			code: 'request_failed',
			message: e.message
		};
	}
};

hello.to.twitter.paging = function (res) {
	"use strict";

	if ('next_cursor_str' in res) {
		res.paging = { next: '?cursor=' + res.next_cursor_str };
	}
};

hello.to.twitter.arrayToDataResponse = function (res) {
	"use strict";

	return Array.isArray(res) ? { data: res } : res;
};

hello.to.twitter.config = {

    'twitter': {

        name: "Twitter",
        id: msos.config.oauth2.twitter,

		oauth: {
				version: '1.0a',
				auth: hello.to.twitter.base + 'oauth/authenticate',
				request: hello.to.twitter.base + 'oauth/request_token',
				token: hello.to.twitter.base + 'oauth/access_token'
			},

        scope: {},

        autorefresh: false,

		base: hello.to.twitter.base + '1.1/',

        get: {
			'me': 'account/verify_credentials.json',
			'me/friends': 'friends/list.json?count=@{limit|200}',
			'me/following': 'friends/list.json?count=@{limit|200}',
			'me/followers': 'followers/list.json?count=@{limit|200}',
			'me/share': 'statuses/user_timeline.json?count=@{limit|200}',
			'me/like': 'favorites/list.json?count=@{limit|200}'
        },

		login: function (p) {
			"use strict";

			var prefix = '?force_login=true';

			this.oauth.auth = this.oauth.auth.replace(prefix, '') + (p.options.force ? prefix : '');
		},

		post: {
			'me/share': function (p, callback) {
				"use strict";

				var data = p.data,
					status = [];

				p.data = null;

				// Change message to status
				if (data.message) {
					status.push(data.message);
					delete data.message;
				}

				// If link is given
				if (data.link) {
					status.push(data.link);
					delete data.link;
				}

				if (data.picture) {
					status.push(data.picture);
					delete data.picture;
				}

				// Compound all the components
				if (status.length) {
					data.status = status.join(' ');
				}

				// Tweet media
				if (data.file) {
					data['media[]'] = data.file;
					delete data.file;
					p.data = data;
					callback('statuses/update_with_media.json');
				}

				// Retweet?
				else if ('id' in data) {
					callback('statuses/retweet/' + data.id + '.json');
				}

				// Tweet
				else {
					// Assign the post body to the query parameters
					hello.utils.extend(p.query, data);
					callback('statuses/update.json?include_entities=1');
				}
			},

			'me/like': function (p, callback) {
				"use strict";

				var id = p.data.id;

				p.data = null;
				callback('favorites/create.json?id=' + id);
			}
		},

		del: {

			'me/like': function () {
				"use strict";

				p.method = 'post';
				var id = p.data.id;
				p.data = null;
				callback('favorites/destroy.json?id=' + id);
			}
		},

		wrap: {
			'me': function (res) {
				"use strict";

				hello.to.twitter.formatError(res);
				hello.to.twitter.formatUser(res);
				return res;
			},

			'me/friends': hello.to.twitter.formatFriends,
			'me/followers': hello.to.twitter.formatFriends,
			'me/following': hello.to.twitter.formatFriends,

			'me/share': function (res) {
				"use strict";

				hello.to.twitter.formatError(res);
				hello.to.twitter.paging(res);

				if (!res.error && 'length' in res) {
					return { data: res };
				}

				return res;
			},

			'default': function (res) {
				"use strict";

				res = hello.to.twitter.arrayToDataResponse(res);
				hello.to.twitter.paging(res);

				return res;
			}
		},
		xhr: function (p) {
			"use strict";

			return (p.method !== 'get');
		}
    }
};


hello.to.twitter.init = function () {
    "use strict";

    msos.console.debug('hello.to.twitter.init -> start.');

    hello.init(hello.to.twitter.config);

    msos.console.debug('hello.to.twitter.init -> done!');
};

msos.onload_func_start.push(hello.to.twitter.init);
