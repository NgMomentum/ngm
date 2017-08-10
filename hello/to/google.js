//
// GOOGLE API
//
/*global
    msos: false,
    hello: false
*/

msos.provide("hello.to.google");

hello.to.google.version = new msos.set_version(17, 6, 30);

hello.to.google.base = 'https://www.googleapis.com/';
hello.to.google.contactsUrl = 'https://www.google.com/m8/feeds/contacts/default/full?v=3.0&alt=json&max-results=@{limit|1000}&start-index=@{start|1}';

hello.to.google.formatFeed = function (o) {
	"use strict";

	hello.to.google.paging(o);
	o.data = o.items;
	delete o.items;

	return o;
};

// Format: ensure each record contains a name, id etc.
hello.to.google.formatItem = function (o) {
	"use strict";

	if (o.error) {
		return;
	}

	if (!o.name) {
		o.name = o.title || o.message;
	}

	if (!o.picture) {
		o.picture = o.thumbnailLink;
	}

	if (!o.thumbnail) {
		o.thumbnail = o.thumbnailLink;
	}

	if (o.mimeType === 'application/vnd.google-apps.folder') {
		o.type = 'folder';
		o.files = 'https://www.googleapis.com/drive/v2/files?q=%22' + o.id + '%22+in+parents';
	}

	return o;
};

hello.to.google.formatImage = function (image) {
	"use strict";

	return {
		source: image.url,
		width: image.width,
		height: image.height
	};
};

hello.to.google.formatPhotos = function (o) {
	"use strict";

		o.data = o.feed.entry.map(hello.to.google.formatEntry);
		delete o.feed;
};

// Google has a horrible JSON API
hello.to.google.gEntry = function (o) {
	"use strict";

	hello.to.google.paging(o);

	if ('feed' in o && 'entry' in o.feed) {
		o.data = o.feed.entry.map(hello.to.google.formatEntry);
		delete o.feed;
	}

	// Old style: Picasa, etc.
	else if ('entry' in o) {
		return hello.to.google.formatEntry(o.entry);
	}

	// New style: Google Drive & Plus
	else if ('items' in o) {
		o.data = o.items.map(hello.to.google.formatItem);
		delete o.items;
	} else {
		hello.to.google.formatItem(o);
	}

	return o;
};

hello.to.google.formatPerson = function (o) {
	"use strict";

	o.name = o.displayName || o.name;
	o.picture = o.picture || (o.image ? o.image.url : null);
	o.thumbnail = o.picture;
};

hello.to.google.formatFriends = function (o, headers, req) {
	"use strict";

	hello.to.google.paging(o);

	var token,
		i = 0,
		a,
		pic;

	if ('feed' in o && 'entry' in o.feed) {
		token = req.query.access_token;
		for (i = 0; i < o.feed.entry.length; i += 1) {
			a = o.feed.entry[i];

			a.id	= a.id.$t;
			a.name	= a.title.$t;
			delete a.title;
			if (a.gd$email) {
				a.email	= (a.gd$email && a.gd$email.length > 0) ? a.gd$email[0].address : null;
				a.emails = a.gd$email;
				delete a.gd$email;
			}

			if (a.updated) {
				a.updated = a.updated.$t;
			}

			if (a.link) {

				pic = (a.link.length > 0) ? a.link[0].href : null;

				if (pic && a.link[0].gd$etag) {
					pic += (pic.indexOf('?') > -1 ? '&' : '?') + 'access_token=' + token;
					a.picture = pic;
					a.thumbnail = pic;
				}

				delete a.link;
			}

			if (a.category) {
				delete a.category;
			}
		}

		o.data = o.feed.entry;
		delete o.feed;
	}

	return o;
};

hello.to.google.formatEntry = function (a) {
	"use strict";

	var group = a.media$group,
		photo = group.media$content.length ? group.media$content[0] : {},
		mediaContent = group.media$content || [],
		mediaThumbnail = group.media$thumbnail || [],
		pictures = mediaContent
			.concat(mediaThumbnail)
			.map(hello.to.google.formatImage)
			.sort(function (a, b) {
				return a.width - b.width;
			}),
		i = 0,
		d,
		_a,
		p = {
			id: a.id.$t,
			name: a.title.$t,
			description: a.summary.$t,
			updated_time: a.updated.$t,
			created_time: a.published.$t,
			picture: photo ? photo.url : null,
			pictures: pictures,
			images: [],
			thumbnail: photo ? photo.url : null,
			width: photo.width,
			height: photo.height
		};

	// Get feed/children
	if ('link' in a) {
		for (i = 0; i < a.link.length; i += 1) {
			d = a.link[i];
			if (d.rel.match(/\#feed$/)) {
				p.upload_location = p.files = p.photos = d.href;
				break;
			}
		}
	}

	// Get images of different scales
	if ('category' in a && a.category.length) {
		_a = a.category;

		for (i = 0; i < _a.length; i += 1) {
			if (_a[i].scheme && _a[i].scheme.match(/\#kind$/)) {
				p.type = _a[i].term.replace(/^.*?\#/, '');
			}
		}
	}

	// Get images of different scales
	if ('media$thumbnail' in group && group.media$thumbnail.length) {
		_a = group.media$thumbnail;
		p.thumbnail = _a[0].url;
		p.images = _a.map(hello.to.google.formatImage);
	}

	_a = group.media$content;

	if (_a && _a.length) {
		p.images.push(hello.to.google.formatImage(_a[0]));
	}

	return p;
};

hello.to.google.paging = function (res) {
	"use strict";

	// Contacts V2
	if ('feed' in res && res.feed.openSearch$itemsPerPage) {
		var limit = parseInt(res.feed.openSearch$itemsPerPage.$t, 10),
			start = parseInt(res.feed.openSearch$startIndex.$t, 10),
			total = parseInt(res.feed.openSearch$totalResults.$t, 10);

		if ((start + limit) < total) {
			res.paging = {
				next: '?start=' + (start + limit)
			};
		}

	} else if ('nextPageToken' in res) {
		res.paging = { next: '?pageToken=' + res.nextPageToken };
	}
};

// Construct a multipart message
hello.to.google.Multipart = function () {
	"use strict";

	// Internal body
	var body = [],
		boundary = (Math.random() * 1e10).toString(32),
		counter = 0,
		lineBreak = '\r\n',
		delim = lineBreak + '--' + boundary,
		ready = function () {},
		dataUri = /^data\:([^;,]+(\;charset=[^;,]+)?)(\;base64)?,/i;

	// Add file
	function addFile(item) {
		var fr = new FileReader();
		fr.onload = function(e) {
			addContent(btoa(e.target.result), item.type + lineBreak + 'Content-Transfer-Encoding: base64');
		};

		fr.readAsBinaryString(item);
	}

	// Add content
	function addContent(content, type) {
		body.push(lineBreak + 'Content-Type: ' + type + lineBreak + lineBreak + content);
		counter--;
		ready();
	}

	// Add new things to the object
	this.append = function (content, type) {
		var i = 0,
			item,
			m;

		// Does the content have an array
		if (typeof (content) === 'string' || !('length' in Object(content))) {
			// Converti to multiples
			content = [content];
		}

		for (i = 0; i < content.length; i += 1) {

			counter += 1;

			item = content[i];

			// Is this a file?
			// Files can be either Blobs or File types
			if (
				(typeof (File) !== 'undefined' && item instanceof File) ||
				(typeof (Blob) !== 'undefined' && item instanceof Blob)
			) {
				// Read the file in
				addFile(item);
			}

			// Data-URI?
			// Data:[<mime type>][;charset=<charset>][;base64],<encoded data>
			// /^data\:([^;,]+(\;charset=[^;,]+)?)(\;base64)?,/i
			else if (typeof (item) === 'string' && item.match(dataUri)) {
				m = item.match(dataUri);
				addContent(item.replace(dataUri, ''), m[1] + lineBreak + 'Content-Transfer-Encoding: base64');
			}

			// Regular string
			else {
				addContent(item, type);
			}
		}
	};

	this.onready = function (fn) {
		ready = function () {
			if (counter === 0) {
				// Trigger ready
				body.unshift('');
				body.push('--');
				fn(body.join(delim), boundary);
				body = [];
			}
		};

		ready();
	};
};

hello.to.google.uploadDrive = function (p, callback) {
	"use strict";

	var data = {},
		file,
		parts;

	if (p.data && (typeof (HTMLInputElement) !== 'undefined' && p.data instanceof HTMLInputElement)) {
		p.data = {file: p.data};
	}

	if (!p.data.name && Object(Object(p.data.file).files).length && p.method === 'post') {
		p.data.name = p.data.file.files[0].name;
	}

	if (p.method === 'post') {
		p.data = {
			title: p.data.name,
			parents: [{id: p.data.parent || 'root'}],
			file: p.data.file
		};
	} else {

		data = p.data;
		p.data = {};

		if (data.parent) {
			p.data.parents = [{id: p.data.parent || 'root'}];
		}

		if (data.file) {
			p.data.file = data.file;
		}

		if (data.name) {
			p.data.title = data.name;
		}
	}

	if ('file' in p.data) {
		file = p.data.file;
		delete p.data.file;

		if (typeof (file) === 'object' && 'files' in file) {
			// Assign the NodeList
			file = file.files;
		}

		if (!file || !file.length) {
			callback({
				error: {
					code: 'request_invalid',
					message: 'There were no files attached with this request to upload'
				}
			});

			return;
		}
	}

	parts = new hello.to.google.Multipart();
	parts.append(JSON.stringify(p.data), 'application/json');

	if (file) { parts.append(file); }

	parts.onready(
		function (body, boundary) {

			p.headers['content-type'] = 'multipart/related; boundary="' + boundary + '"';
			p.data = body;

			callback('upload/drive/v2/files' + (data.id ? '/' + data.id : '') + '?uploadType=multipart');
		}
	);
};

hello.to.google.toJSON = function (p) {
	"use strict";

	if (typeof (p.data) === 'object') {
		// Convert the POST into a javascript object
		try {
			p.data = JSON.stringify(p.data);
			p.headers['content-type'] = 'application/json';
		}
		catch (e) {}
	}
};

hello.to.google.config = {

    google: {

        name: "Google Plus",
        id: msos.config.oauth2.google,

        login: function (p) {
			"use strict";

			if (p.qs.response_type === 'code') {

				p.qs.access_type = 'offline';
			}

			if (p.options.force) {
				p.qs.approval_prompt = 'force';
			}
        },

        oauth: {
			version: 2,
			auth: 'https://accounts.google.com/o/oauth2/auth',
			grant: 'https://accounts.google.com/o/oauth2/token'
        },

        scope: {
			basic: 'https://www.googleapis.com/auth/plus.me profile',
			email: 'email',
			birthday: '',
			events: '',
			photos: 'https://picasaweb.google.com/data/',
			videos: 'http://gdata.youtube.com',
			friends: 'https://www.google.com/m8/feeds, https://www.googleapis.com/auth/plus.login',
			files: 'https://www.googleapis.com/auth/drive.readonly',
			publish: '',
			publish_files: 'https://www.googleapis.com/auth/drive',
			share: '',
			create_event: '',
			offline_access: ''
        },

        scope_delim: ' ',

        base: hello.to.google.base,

        get: {
			'me': 'plus/v1/people/me',
			'me/friends': 'plus/v1/people/me/people/visible?maxResults=@{limit|100}',
			'me/following': hello.to.google.contactsUrl,
			'me/followers': hello.to.google.contactsUrl,
			'me/contacts': hello.to.google.contactsUrl,
			'me/share': 'plus/v1/people/me/activities/public?maxResults=@{limit|100}',
			'me/feed': 'plus/v1/people/me/activities/public?maxResults=@{limit|100}',
			'me/albums': 'https://picasaweb.google.com/data/feed/api/user/default?alt=json&max-results=@{limit|100}&start-index=@{start|1}',
			'me/album': function (p, callback) {
				"use strict";

				var key = p.query.id;

				delete p.query.id;
				callback(key.replace('/entry/', '/feed/'));
			},
			'me/photos': 'https://picasaweb.google.com/data/feed/api/user/default?alt=json&kind=photo&max-results=@{limit|100}&start-index=@{start|1}',
			'me/file': 'drive/v2/files/@{id}',
			'me/files': 'drive/v2/files?q=%22@{parent|root}%22+in+parents+and+trashed=false&maxResults=@{limit|100}',
			'me/folders': 'drive/v2/files?q=%22@{id|root}%22+in+parents+and+mimeType+=+%22application/vnd.google-apps.folder%22+and+trashed=false&maxResults=@{limit|100}',
			'me/folder': 'drive/v2/files?q=%22@{id|root}%22+in+parents+and+trashed=false&maxResults=@{limit|100}'
		},

		post: {

			// Google Drive
			'me/files': hello.to.google.uploadDrive,
			'me/folders': function (p, callback) {
				"use strict";

				p.data = {
					title: p.data.name,
					parents: [{id: p.data.parent || 'root'}],
					mimeType: 'application/vnd.google-apps.folder'
				};

				callback('drive/v2/files');
			}
		},

		put: {
			'me/files': hello.to.google.uploadDrive
		},

		del: {
			'me/files': 'drive/v2/files/@{id}',
			'me/folder': 'drive/v2/files/@{id}'
		},

		patch: {
			'me/file': 'drive/v2/files/@{id}'
		},

		wrap: {
			'me': function (o) {
				"use strict";

				if (o.id) {
					o.last_name = o.family_name || (o.name ? o.name.familyName : null);
					o.first_name = o.given_name || (o.name ? o.name.givenName : null);

					if (o.emails && o.emails.length) {
						o.email = o.emails[0].value;
					}

					hello.to.google.formatPerson(o);
				}

				return o;
			},

			'me/friends': function (o) {
				"use strict";

				if (o.items) {
					hello.to.google.paging(o);
					o.data = o.items;
					o.data.forEach(hello.to.google.formatPerson);
					delete o.items;
				}

				return o;
			},

			'me/contacts': hello.to.google.formatFriends,
			'me/followers': hello.to.google.formatFriends,
			'me/following': hello.to.google.formatFriends,
			'me/share': hello.to.google.formatFeed,
			'me/feed': hello.to.google.formatFeed,
			'me/albums': hello.to.google.gEntry,
			'me/photos': hello.to.google.formatPhotos,
			'default': hello.to.google.gEntry
		},

		xhr: function (p) {
			"use strict";

			if (p.method === 'post' || p.method === 'put') {
				hello.to.google.toJSON(p);
			} else if (p.method === 'patch') {
				hello.utils.extend(p.query, p.data);
				p.data = null;
			}

			return true;
		},

		form: false
    }
};


hello.to.google.init = function () {
    "use strict";

    msos.console.debug('hello.to.google.init -> start.');

    hello.init(hello.to.google.config);

    msos.console.debug('hello.to.google.init -> done!');
};

msos.onload_func_start.push(hello.to.google.init);
