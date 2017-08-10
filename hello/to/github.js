//
// Github
//

/*global
    msos: false,
    hello: false
*/

msos.provide("hello.to.github");

hello.to.github.version = new msos.set_version(17, 6, 29);

hello.to.github.base = 'https://api.github.com/';

hello.to.github.formatError = function (o, headers) {
	"use strict";
	
	var code = headers ? headers.statusCode : (o && 'meta' in o && 'status' in o.meta && o.meta.status);

	if ((code === 401 || code === 403)) {
		o.error = {
			code: 'access_denied',
			message: o.message || (o.data ? o.data.message : 'Could not get response')
		};

		delete o.message;
	}
};

hello.to.github.formatUser = function (o) {
	"use strict";

	if (o.id) {
		o.thumbnail = o.picture = o.avatar_url;
		o.name = o.login;
	}
};

hello.to.github.paging = function (res, headers) {
	"use strict";

	if (res.data && res.data.length && headers && headers.Link) {
		var next = headers.Link.match(/<(.*?)>;\s*rel=\"next\"/);

		if (next) {
			res.paging = { next: next[1] };
		}
	}
};

hello.to.github.config = {

	'github': {

		name: 'GitHub',
		id: msos.config.oauth2.github,

		oauth: {
			version: 2,
			auth: 'https://github.com/login/oauth/authorize',
			grant: 'https://github.com/login/oauth/access_token',
			response_type: 'code'
		},

		scope: {
			email: 'user:email'
		},

		base: hello.to.github.base,

		get: {
			'me': 'user',
			'me/friends': 'user/following?per_page=@{limit|100}',
			'me/following': 'user/following?per_page=@{limit|100}',
			'me/followers': 'user/followers?per_page=@{limit|100}',
			'me/like': 'user/starred?per_page=@{limit|100}'
		},

		wrap: {
			'me': function (o, headers) {
				"use strict";

				hello.to.github.formatError(o, headers);
				hello.to.github.formatUser(o);

				return o;
			},
			'default': function (o, headers, req) {
				"use strict";

				hello.to.github.formatError(o, headers);

				if (Array.isArray(o)) {
					o = {data:o};
				}

				if (o.data) {
					hello.to.github.paging(o, headers, req);
					o.data.forEach(hello.to.github.formatUser);
				}

				return o;
			}
		},

		xhr: function (p) {
			"use strict";

			if (p.method !== 'get' && p.data) {

				// Serialize payload as JSON
				p.headers = p.headers || {};
				p.headers['Content-Type'] = 'application/json';

				if (typeof (p.data) === 'object') {
					p.data = JSON.stringify(p.data);
				}
			}

			return true;
		}
    }
};


hello.to.github.init = function () {
    "use strict";

    msos.console.debug('hello.to.github.init -> start.');

    hello.init(hello.to.github.config);

    msos.console.debug('hello.to.github.init -> done!');
};

msos.onload_func_start.push(hello.to.github.init);
