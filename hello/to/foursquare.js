//
// FourSquare
//
/*global
    msos: false,
    hello: false
*/

msos.provide("hello.to.foursquare");

hello.to.foursquare.version = new msos.set_version(17, 6, 29);

hello.to.foursquare.formatError = function (o) {
	"use strict";

	if (o.meta && (o.meta.code === 400 || o.meta.code === 401)) {
		o.error = {
			code: 'access_denied',
			message: o.meta.errorDetail
		};
	}
};

hello.to.foursquare.formatUser = function (o) {
	"use strict";

	if (o && o.id) {
		o.thumbnail = o.photo.prefix + '100x100' + o.photo.suffix;
		o.name = o.firstName + ' ' + o.lastName;
		o.first_name = o.firstName;
		o.last_name = o.lastName;

		if (o.contact) {
			if (o.contact.email) {
				o.email = o.contact.email;
			}
		}
	}
};

hello.to.foursquare.formatRequest = function (p, qs) {
	"use strict";

	msos.console.debug('hello.to.foursquare.formatRequest -> called, p/qs:', p, qs);

	var token = qs.access_token;

	qs.oauth_token = token;
	qs.v = 20121125;

	delete qs.access_token;

	return true;
};

hello.to.foursquare.config = {

    foursquare: {

        name: 'FourSquare',
        id: msos.config.oauth2.foursquare,

        oauth: {
            version: 2,
            auth: 'https://foursquare.com/oauth2/authenticate',
			grant : 'https://foursquare.com/oauth2/access_token'
        },

        scope: {},

		refresh: true,

		base: 'https://api.foursquare.com/v2/',

        get: {
			'me': 'users/self',
			'me/friends': 'users/self/friends',
			'me/followers': 'users/self/friends',
			'me/following': 'users/self/friends'
        },

		wrap: {
			me: function (o) {
				"use strict";

				hello.to.foursquare.formatError(o);

				if (o && o.response) {
					o = o.response.user;
					hello.to.foursquare.formatUser(o);
				}

				return o;
			},

			'default': function (o) {
				"use strict";

				hello.to.foursquare.formatError(o);

				if (o && 'response' in o && 'friends' in o.response && 'items' in o.response.friends) {
					o.data = o.response.friends.items;
					o.data.forEach(hello.to.foursquare.formatUser);
					delete o.response;
				}

				return o;
			}
		}

//		xhr: hello.to.foursquare.formatRequest,
//		jsonp: hello.to.foursquare.formatRequest
    }
};


hello.to.foursquare.init = function () {
    "use strict";

    msos.console.debug('hello.to.foursquare.init -> start.');

    hello.init(hello.to.foursquare.config);

    msos.console.debug('hello.to.foursquare.init -> done!');
};

msos.onload_func_start.push(hello.to.foursquare.init);