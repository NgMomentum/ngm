//
// Yahoo
//

/*global
    msos: false,
    hello: false
*/

msos.provide("hello.to.yahoo");

hello.to.yahoo.version = new msos.set_version(17, 6, 29);

hello.to.yahoo.base = 'https://social.yahooapis.com/v1/';

hello.to.yahoo.formatError = function (o) {
	"use strict";

	if (o && 'meta' in o && 'error_type' in o.meta) {
		o.error = {
			code: o.meta.error_type,
			message: o.meta.error_message
		};
	}
};

hello.to.yahoo.formatUser = function (o) {
	"use strict";

	hello.to.yahoo.formatError(o);

	if (o.query && o.query.results && o.query.results.profile) {

		o = o.query.results.profile;
		o.id = o.guid;
		o.last_name = o.familyName;
		o.first_name = o.givenName || o.nickname;

		var a = [];

		if (o.first_name) {
			a.push(o.first_name);
		}

		if (o.last_name) {
			a.push(o.last_name);
		}

		o.name = a.join(' ');
		o.email = (o.emails && o.emails[0]) ? o.emails[0].handle : null;
		o.thumbnail = o.image ? o.image.imageUrl : null;
	}

	return o;
};

hello.to.yahoo.formatFriends = function (o, headers, request) {
	"use strict";

	hello.to.yahoo.formatError(o);
	hello.to.yahoo.paging(o, headers, request);

	if (o.query && o.query.results && o.query.results.contact) {

		o.data = o.query.results.contact;
		delete o.query;

		if (!Array.isArray(o.data)) {
			o.data = [o.data];
		}

		o.data.forEach(hello.to.yahoo.formatFriend);
	}

	return o;
};

hello.to.yahoo.formatFriend = function (contact) {
	"use strict";

	contact.id = null;

	if (contact.fields && !(contact.fields instanceof Array)) {
		contact.fields = [contact.fields];
	}

	(contact.fields || []).forEach(
		function (field) {
			if (field.type === 'email') {
				contact.email = field.value;
			}

			if (field.type === 'name') {
				contact.first_name = field.value.givenName;
				contact.last_name = field.value.familyName;
				contact.name = field.value.givenName + ' ' + field.value.familyName;
			}

			if (field.type === 'yahooid') {
				contact.id = field.value;
			}
		}
	);
};

hello.to.yahoo.paging = function (res, headers, request) {
	"use strict";

	if (res.query && res.query.count && request.options) {
			res.paging = {
				next: '?start=' + (res.query.count + (+request.options.start || 1))
			};
	}

	return res;
};

hello.to.yahoo.yql = function (q) {
	"use strict";

	return 'https://query.yahooapis.com/v1/yql?q=' + (q + ' limit @{limit|100} offset @{start|0}').replace(/\s/g, '%20') + '&format=json';
};

hello.to.yahoo.config = {

	'yahoo': {

		name: 'Yahoo',
		id: msos.config.oauth2.yahoo,

		oauth: {
			version: '1.0a',
			auth: 'https://api.login.yahoo.com/oauth/v2/request_auth',
			request: 'https://api.login.yahoo.com/oauth/v2/get_request_token',
			token: 'https://api.login.yahoo.com/oauth/v2/get_token'
		},

		login: function (p) {
			"use strict";

			p.options.popup.width = 560;

			try {
				delete p.qs.state.scope;
			} catch (e) {
				
			}
		},

		base: hello.to.yahoo.base,

		get: {
			'me': hello.to.yahoo.yql('select * from social.profile(0) where guid=me'),
			'me/friends': hello.to.yahoo.yql('select * from social.contacts(0) where guid=me'),
			'me/following': hello.to.yahoo.yql('select * from social.contacts(0) where guid=me')
		},
		wrap: {
			'me': hello.to.yahoo.formatUser,
			'me/friends': hello.to.yahoo.formatFriends,
			'me/following': hello.to.yahoo.formatFriends,
			'default': hello.to.yahoo.paging
		}
	}
};


hello.to.yahoo.init = function () {
    "use strict";

    msos.console.debug('hello.to.yahoo.init -> start.');

    hello.init(hello.to.yahoo.config);

    msos.console.debug('hello.to.yahoo.init -> done!');
};

msos.onload_func_start.push(hello.to.yahoo.init);
