//
// Instagram
//

/*global
    msos: false,
    hello: false,
    _: false
*/

msos.provide("hello.to.instagram");

hello.to.instagram.version = new msos.set_version(17, 6, 29);


hello.to.instagram.formatImage = function (image) {
	"use strict";

	return {
		source: image.url,
		width: image.width,
		height: image.height
	};
};

hello.to.instagram.formatError = function (o) {
	"use strict";

	if (typeof o === 'string') {
		return {
			error: {
				code: 'invalid_request',
				message: o
			}
		};
	}

	if (o && 'meta' in o && 'error_type' in o.meta) {
		o.error = {
			code: o.meta.error_type,
			message: o.meta.error_message
		};
	}

	return o;
};

hello.to.instagram.formatFriends = function (o) {
	"use strict";

	hello.to.instagram.paging(o);

	if (o && 'data' in o) {
		o.data.forEach(hello.to.instagram.formatFriend);
	}

	return o;
};

hello.to.instagram.formatFriend = function (o) {
	"use strict";

	if (o.id) {
		o.thumbnail = o.profile_picture;
		o.name = o.full_name || o.username;
	}
};

hello.to.instagram.paging = function (res) {
	"use strict";

	if ('pagination' in res) {
		res.paging = {
			next: res.pagination.next_url
		};

		delete res.pagination;
	}
};

hello.to.instagram.config = {

	instagram: {

		name: 'Instagram',
		id: msos.config.oauth2.instagram,

		oauth: {
			version: 2,
			auth: 'https://instagram.com/oauth/authorize/',
			grant: 'https://api.instagram.com/oauth/access_token'
		},

		scope: {
			basic: 'basic',
			photos: '',
			friends: 'relationships',
			publish: 'likes comments',
			email: '',
			share: '',
			publish_files: '',
			files: '',
			videos: '',
			offline_access: ''
		},

		scope_delim : ' ',

		refresh: true,

		base: 'https://api.instagram.com/v1/',

		get: {
			'me': 'users/self',
			'me/feed': 'users/self/feed?count=@{limit|100}',
			'me/photos': 'users/self/media/recent?min_id=0&count=@{limit|100}',
			'me/friends': 'users/self/follows?count=@{limit|100}',
			'me/following': 'users/self/follows?count=@{limit|100}',
			'me/followers': 'users/self/followed-by?count=@{limit|100}',
			'friend/photos': 'users/@{id}/media/recent?min_id=0&count=@{limit|100}'
		},

		post: {
			'me/like': function (p, callback) {
				"use strict";

				var id = p.data.id;

				p.data = {};
				callback('media/' + id + '/likes');
			}
		},

		del: {
			'me/like': 'media/@{id}/likes'
		},

		wrap: {
			'me': function (o) {
				"use strict";

				hello.to.instagram.formatError(o);

				if ('data' in o) {
					o.id = o.data.id;
					o.thumbnail = o.data.profile_picture;
					o.name = o.data.full_name || o.data.username;
				}

				return o;
			},
			'me/friends': hello.to.instagram.formatFriends,
			'me/following': hello.to.instagram.formatFriends,
			'me/followers': hello.to.instagram.formatFriends,
			'me/photos': function (o) {
				"use strict";

				hello.to.instagram.formatError(o);
				hello.to.instagram.paging(o);

				if ('data' in o) {
					o.data = o.data.filter(
						function (d) {
							return d.type === 'image';
						}
					);

					o.data.forEach(
						function (d) {
							d.name = d.caption ? d.caption.text : null;
							d.thumbnail = d.images.thumbnail.url;
							d.picture = d.images.standard_resolution.url;
							d.pictures = Object.keys(d.images)
								.map(
									function (key) {
										var image = d.images[key];
										return hello.to.instagram.formatImage(image);
									}
								).sort(
									function (a, b) {
										return a.width - b.width;
									}
								);
						}
					);
				}

				return o;
			},
			'default': function (o) {
				o = hello.to.instagram.formatError(o);
				hello.to.instagram.paging(o);
				return o;
			}
		},

		// Not in std Hello.js
		jsonp: function (qs_obj, base_url, callback) {
			"use strict";

			var temp_jp = 'hello.to.instagram.config.jsonp -> ',
				utils = hello.utils,
				head = document.getElementsByTagName('head')[0],
				script,
				result = {
					error: {
						message: 'server error',
						code: 'server_error'
					}
				},
				cb = _.once(
					function () {
						callback(result);
						head.removeChild(script);
					}
				),
				jsonp_cb_id = utils.globalEvent(
					function (json) {
						result = json;
						return true; // mark callback as done
					}
				),
				url = '';

			msos.console.debug(temp_jp + 'start.');

			// Assign the callback name
			qs_obj.callback = jsonp_cb_id;

			url = utils.add_qs(base_url, qs_obj);

			script = utils.append(
				'script',
				{
					id: jsonp_cb_id,
					name: jsonp_cb_id,
					src: url,
					async: true,
					onload: cb,
					onerror: cb,
					onreadystatechange: function () {
						if (/loaded|complete/i.test(this.readyState)) {
							cb();
						}
					}
				}
			);

			setTimeout(
				function () {
					result = {
						error: {
							message: 'timeout',
							code: 'timeout'
						}
					};
					cb();
				},
				20000
			);

			head.appendChild(script);

			msos.console.debug(temp_jp + 'done.');
		},

		xhr: function (p) {
			"use strict";

			var method = p.method,
				proxy = method !== 'get';

			if (proxy) {

				if ((method === 'post' || method === 'put') && p.query.access_token) {
					p.data.access_token = p.query.access_token;
					delete p.query.access_token;
				}

				p.proxy = proxy;
			}

			return proxy;
		},

		form: false
	}
};


hello.to.instagram.init = function () {
    "use strict";

    msos.console.debug('hello.to.instagram.init -> start.');

    hello.init(hello.to.instagram.config);

    msos.console.debug('hello.to.instagram.init -> done!');
};

msos.onload_func_start.push(hello.to.instagram.init);
