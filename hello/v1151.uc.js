/**
 * @hello.js
 *
 * HelloJS is a client side Javascript SDK for making OAuth2 logins and subsequent REST calls.
 *
 * @author Andrew Dodson
 * @website https://adodson.com/hello.js/
 *
 * @copyright Andrew Dodson, 2012 - 2017
 * @license MIT: You are free to use and modify this code for any use, on the condition that this copyright notice remains.
 *
 * Highly modified version of hello.js v0.2.0, v1.15.1 for use with MobileSiteOS
 */

/*global
	msos: false,
    _: false
*/

var hello = function (name) {
	msos.console.debug('hello -> called for: ' + name);
	return hello.use(name);
};

hello.responsive = msos.config.size_wide[msos.config.size];

hello.settings = {
	// OAuth 2 authentication defaults
	redirect_uri: msos.config.hellojs_redirect,		// Full uri path including protocal
	response_type: 'token',
	display: 'popup',
	state: '',
	oauth_proxy: msos.config.oauth2.proxy_url,
	popup: {
		resizable: 1,
		scrollbars: 1,
		width: (hello.responsive < 520 ? hello.responsive : 520),
		height: 550
	},
	scope: ['basic'],
	scope_map: { basic: '' },
	default_service: null,
	force: true,
	page_uri: window.location.href
};

hello.utils = {

	ut_name: 'hello.utils',

	domInstance: function (type, data) {
		var test = 'HTML' + (type || '').replace(
					/^[a-z]/,
					function (m) { return m.toUpperCase(); }
				) + 'Element';

		if (!data) { return false; }

		if (window[test])			{ return data instanceof window[test]; }
		else if (window.Element)	{ return data instanceof window.Element && (!type || (data.tagName && data.tagName.toLowerCase() === type)); }
		else						{ return (!(data instanceof Object || data instanceof Array || data instanceof String || data instanceof Number) && data.tagName && data.tagName.toLowerCase() === type); }
	},

	clone: function (obj) {
		var clone = {},
			x;

		if (obj === null || typeof (obj) !== 'object' || obj instanceof Date || 'nodeName' in obj || this.isBinary(obj) || (typeof FormData === 'function' && obj instanceof FormData)) {
			return obj;
		}

		if (_.isArray(obj)) {
			return obj.map(this.clone.bind(this));
		}

		for (x in obj) {
			if (obj.hasOwnProperty(x)) {
				clone[x] = this.clone(obj[x]);
			}
		}

		return clone;
	},

	error: function (in_code, in_message) {
		"use strict";

		return {
			error: {
				code: in_code,
				message: in_message
			}
		};
	},

	error_db: function (in_code, in_message) {
		"use strict";

		var _this = this;

		msos.console.error(_this.ut_name + '.error -> ' + in_code + ': ' + in_message);

		return {
			error: {
				code: in_code,
				message: in_message
			}
		};
	},

	request_cors: function (callback) {
		"use strict";

		return 'withCredentials' in new XMLHttpRequest() && callback();
	},

	request: function (p, callback) {
		"use strict";

		var utils = this,
			cors,
			_query,
			opts;

		msos.console.debug(this.ut_name + '.request -> start, p:', p);

		function formatUrl(p, callback) {
			var sign,
				path;

			if (p.authResponse && p.authResponse.oauth && parseInt(p.authResponse.oauth.version, 10) === 1) {
				sign = p.query.access_token;
				delete p.query.access_token;
				p.proxy = true;
			}

			if (p.data && (p.method === 'get' || p.method === 'delete')) {
				_.extend(p.query, p.data);
				p.data = null;
			}

			path = utils.qs(p.url, p.query);

			if (p.proxy) {

				path = utils.qs(
					p.oauth_proxy,
					{
						path: path,
						access_token: sign || '',
						then: p.proxy_response_type || (p.method.toLowerCase() === 'get' ? 'redirect' : 'proxy'),
						method: p.method.toLowerCase(),
						suppress_response_codes: true
					}
				);
			}

			msos.console.debug(utils.ut_name + '.request - formatUrl -> called, path:', path);
			callback(path);
		}

		if (!_.isEmpty(p.data) && !('FileList' in window) && utils.hasBinary(p.data)) {
			p.xhr = false;
			p.jsonp = false;
		}

		cors = utils.request_cors(
			function () {
				return ((p.xhr === undefined) || (p.xhr && (typeof (p.xhr) !== 'function' || p.xhr(p, p.query))));
			}
		);

		if (cors) {
			formatUrl(
				p,
				function (url) {
					var x = utils.xhr(p.method, url, p.headers, p.data, callback);

					x.onprogress = p.onprogress || null;

					if (x.upload && p.onuploadprogress) {
						x.upload.onprogress = p.onuploadprogress;
					}
				}
			);

			msos.console.debug(this.ut_name + '.request -> done, for cors.');
			return;
		}

		_query = p.query;

		p.query = utils.clone(p.query);
		p.callbackID = utils.globalEvent();

		if (p.jsonp !== false) {

			p.query.callback = p.callbackID;

			if (typeof (p.jsonp) === 'function') { p.jsonp(p, p.query); }

			if (p.method === 'get') {

				formatUrl(
					p,
					function (url) {
						utils.jsonp(url, callback, p.callbackID, p.timeout);
					}
				);

				msos.console.debug(this.ut_name + '.request -> done, for get request.');
				return;
			} else { p.query = _query; }
		}

		if (p.form !== false) {

			p.query.redirect_uri = p.redirect_uri;
			p.query.state = JSON.stringify({ callback: p.callbackID });

			if (typeof (p.form) === 'function') { opts = p.form(p, p.query); }

			if (p.method === 'post' && opts !== false) {

				formatUrl(
					p,
					function (url) {
						utils.post(url, p.data, opts, callback, p.callbackID, p.timeout);
					}
				);

				msos.console.debug(this.ut_name + '.request -> done, for form post.');
				return;
			}
		}

		callback(utils.error('invalid_request', 'hello.utils.request -> no mechanism for handling this request'));
		return;
	},

	xhr: function (method, url, headers, data, callback) {
		"use strict";

		var r = new XMLHttpRequest(),
			binary = false,
			x,
			f;

		msos.console.debug('hello.utils.xhr -> start.');

		if (method === 'blob') {
			binary = method;
			method = 'GET';
		}

		method = method.toUpperCase();

		function headersToJSON(s) {
			var r = {},
				reg = /([a-z\-]+):\s?(.*);?/gi,
				m;

			while ((m = reg.exec(s))) { r[m[1]] = m[2]; }

			return r;
		}

		r.onload = function () {
			var json = r.response,
				headers;

			try {
				json = JSON.parse(r.responseText);
			} catch (e) {
				if (r.status === 401) {
					json = utils.error_db('access_denied', r.statusText);
				}
			}

			headers = headersToJSON(r.getAllResponseHeaders());
			headers.statusCode = r.status;

			callback(json || (method === 'GET' ? utils.error('empty_response', 'hello.utils.xhr -> could not get resource') : {}), headers);
		};

		r.onerror = function () {
			var json = r.responseText;

			try {
				json = JSON.parse(r.responseText);
			} catch (e) {
				utils.error_db('onerror_parse', 'hello.utils.xhr -> problem parsing r.responseText');
			}

			callback(json || utils.error('access_denied', 'hello.utils.xhr -> could not get resource'));
		};

		if (method === 'GET' || method === 'DELETE') {
			data = null;
		} else if (data && typeof (data) !== 'string' && !(data instanceof FormData) && !(data instanceof File) && !(data instanceof Blob)) {

			f = new FormData();

			for (x in data) {
				if (data.hasOwnProperty(x)) {
					if (data[x] instanceof HTMLInputElement) {
						if ('files' in data[x] && data[x].files.length > 0) {
							f.append(x, data[x].files[0]);
						}
					} else if (data[x] instanceof Blob) {
						f.append(x, data[x], data.name);
					} else {
						f.append(x, data[x]);
					}
				}
			}

			data = f;
		}

		r.open(method, url, true);

		if (binary) {
			if ('responseType' in r) {
				r.responseType = binary;
			} else {
				r.overrideMimeType('text/plain; charset=x-user-defined');
			}
		}

		if (headers) {
			for (x in headers) {
				if (headers.hasOwnProperty(x)) {
					r.setRequestHeader(x, headers[x]);
				}
			}
		}

		r.send(data);

		msos.console.debug('hello.utils.xhr -> done, r:', r);
		return r;
	},

	url: function (path) {
		"use strict";

		var a;

		if (!path) {
			return window.location;
		} else if (window.URL && URL instanceof Function && URL.length !== 0) {
			return new URL(path, window.location);
		} else {
			a = document.createElement('a');
			a.href = path;
			return a.cloneNode(false);
		}
	},

	diffKey: function (a, b) {
		"use strict";

		var r = {},
			x;

		if (a || !b) {
			for (x in a) {
				if (a.hasOwnProperty(x)) {
					if (!(x in b)) { r[x] = a[x]; }
				}
			}

			return r;
		}

		return a;
	},

	qs: function (url, params, formatFunction) {
		"use strict";

		var x,
			str,
			reg,
			new_url = '',
			mtv = msos.config.verbose;

		if (mtv) {
			msos.console.debug(this.ut_name + '.qs -> start, url: ' + url+ ', params:', params);
		}

		if (params) {

			formatFunction = formatFunction || encodeURIComponent;

			for (x in params) {
				if (params.hasOwnProperty(x)) {
					str = '([\\?\\&])' + x + '=[^\\&]*';
					reg = new RegExp(str);

					if (url.match(reg)) {
						url = url.replace(reg, '$1' + x + '=' + formatFunction(params[x]));
						delete params[x];
					}
				}
			}
		}

		if (!_.isEmpty(params)) {
			new_url = url + (url.indexOf('?') > -1 ? '&' : '?') + this.param(params, formatFunction);
			if (mtv) {
				msos.console.debug(this.ut_name + '.qs ->  done (empty params), url: ' + new_url);
			}
			return new_url;
		}

		if (mtv) {
			msos.console.debug(this.ut_name + '.qs ->  done, url: ' + url);
		}
		return url;
	},

	jsonp: function (url, callback, callbackID, timeout) {
		"use strict";

		var utils = this,
			bool = 0,
			head = document.getElementsByTagName('head')[0],
			cb = function () {
				if (!bool) {
					bool += 1;
					setTimeout(
						function () {
							callback(utils.error('server_error', 'hello.utils.jsonp - cb -> server error for ID: ' + callbackID));
							head.removeChild(script);
						},
						0
					);
				}
			},
			script;

		if (msos.config.verbose) {
			msos.console.debug(this.ut_name + '.jsonp -> start, url: ' + url + ', callbackID:', callbackID);
		}

		callbackID = utils.globalEvent(
			function (json) {
				result = json;
				return true;
			},
			callbackID
		);

		url = url.replace(new RegExp('=\\?(&|$)'), '=' + callbackID + '$1');

		script = utils.append(
			'script', {
				id: callbackID,
				name: callbackID,
				src: url,
				async: true,
				onload: cb,
				onerror: cb,
				onreadystatechange: function () {
					if (/loaded|complete/i.test(this.readyState)) { cb(); }
				}
			}
		);

		if (timeout) {
			setTimeout(
				function () {
					result = utils.error('timeout', 'hello.utils.jsonp -> timeout');
					cb();
				},
				timeout
			);
		}

		if (msos.config.verbose) {
			msos.console.debug(this.ut_name + '.jsonp -> done, callbackID:', callbackID);
		}

		head.appendChild(script);
	},

	post: function (url, data, options, callback, callbackID, timeout) {
		"use strict";

		var utils = this,
			form = null,
			reenableAfterSubmit = [],
			doc_body = document.body,
			newform,
			i = 0,
			x = null,
			bool = 0,
			cb = function (r) {
				if (!bool) {
					bool +=  1;
					callback(r);
				}
			},
			win = document.createElement('iframe'),
			input,
			el,
			inputs;

		msos.console.debug(this.ut_name + '.post -> start, url: ' + url + ', callbackID: ' + callbackID + ', data:', data);

		win.name = callbackID;
		win.id = callbackID;
		win.style.display = 'none';

		utils.globalEvent(cb, callbackID);

		if (options && options.callbackonload) {
			win.onload = function () {
				cb({
					response: 'posted',
					message: 'Content was posted'
				});
			};
		}

		if (timeout) {
			setTimeout(
				function () {
					cb(utils.error('timeout', 'hello.utils.post -> operation timed out'));
				},
				timeout
			);
		}

		doc_body.appendChild(win);

		if (utils.domInstance('form', data)) {
			form = data.form;

			for (i = 0; i < form.elements.length; i += 1) {
				if (form.elements[i] !== data) {
					form.elements[i].setAttribute('disabled', true);
				}
			}

			data = form;
		}

		if (utils.domInstance('form', data)) {
			form = data;

			for (i = 0; i < form.elements.length; i += 1) {
				if (!form.elements[i].disabled && form.elements[i].type === 'file') {
					form.encoding = form.enctype = 'multipart/form-data';
					form.elements[i].setAttribute('name', 'file');
				}
			}

		} else {

			for (x in data) {
				if (data.hasOwnProperty(x)) {
					if (utils.domInstance('input', data[x]) && data[x].type === 'file') {
						form = data[x].form;
						form.encoding = form.enctype = 'multipart/form-data';
					}
				}
			}

			if (!form) {
				form = document.createElement('form');
				doc_body.appendChild(form);
				newform = form;
			}

			for (x in data) {
				if (data.hasOwnProperty(x)) {

					el = (utils.domInstance('input', data[x]) || utils.domInstance('textArea', data[x]) || utils.domInstance('select', data[x]));

					if (!el || data[x].form !== form) {

						inputs = form.elements[x];

						if (input) {
							if (!(inputs instanceof NodeList)) {
								inputs = [inputs];
							}

							for (i = 0; i < inputs.length; i++) {
								inputs[i].parentNode.removeChild(inputs[i]);
							}
						}

						input = document.createElement('input');
						input.setAttribute('type', 'hidden');
						input.setAttribute('name', x);

						if (el) {
							input.value = data[x].value;
						} else if (utils.domInstance(null, data[x])) {
							input.value = data[x].innerHTML || data[x].innerText;
						} else {
							input.value = data[x];
						}

						form.appendChild(input);

					} else if (el && data[x].name !== x) {
						data[x].setAttribute('name', x);
						data[x].name = x;
					}
				}
			}

			for (i = 0; i < form.elements.length; i += 1) {

				input = form.elements[i];

				if (!(input.name in data) && input.getAttribute('disabled') !== true) {
					input.setAttribute('disabled', true);
					reenableAfterSubmit.push(input);
				}
			}
		}

		form.setAttribute('method', 'POST');
		form.setAttribute('target', callbackID);
		form.setAttribute('action', url);

		setTimeout(
			function () {
				form.submit();

				setTimeout(
					function () {
						var i = 0;

						try {
							if (newform) {
								doc_body.removeChild(newform);
							}
						} catch (e) {
							utils.error_db('remove_form', e.message);
						}

						for (i = 0; i < reenableAfterSubmit.length; i += 1) {
							if (reenableAfterSubmit[i]) {
								reenableAfterSubmit[i].setAttribute('disabled', false);
								reenableAfterSubmit[i].disabled = false;
							}
						}
					},
					10
				);
			},
			100
		);

		msos.console.debug(this.ut_name + '.post ->  done!');
	},

	param: function (s, formatFunction) {
		"use strict";

		var b,
			a = {},
			c = [],
			m,
			i = 0,
			o,
			x,
			str = '';

		if (msos.config.verbose) {
			msos.console.debug(this.ut_name + '.param -> start, for:', s);
		}

		if (typeof s === 'string') {

			formatFunction = formatFunction || decodeURIComponent;

			m = s.replace(/^[\#\?]/, '').match(/([^=\/\&]+)=([^\&]+)/g);
			if (m) {
				for (i = 0; i < m.length; i += 1) {
					b = m[i].match(/([^=]+)=(.*)/);
					a[b[1]] = formatFunction(b[2]);
				}
			}

			if (msos.config.verbose) {
				msos.console.debug(this.ut_name + '.param -> done, object:', a);
			}
			return a;
		}

		formatFunction = formatFunction || encodeURIComponent;

		o = s;

		if (_.isObject(o)) {

			for (x in o) {
				if (o.hasOwnProperty(x)) {
					c.push([x, o[x] === '?' ? '?' : formatFunction(o[x])].join('='));
				}
			}

			str = c.join('&');
		}

		if (msos.config.verbose) {
			msos.console.debug(this.ut_name + '.param -> done, string: ' + str);
		}

		return str;
	},

	store_cache: undefined,
	store: function (name, value) {
		"use strict";

		var json;

		if (this.store_cache === undefined) {
			json = JSON.parse(msos.basil.get('hello')) || {};
			this.store_cache = json;
		} else {
			json = this.store_cache;
		}

		if (name && value === undefined) {
			msos.console.debug('hello.utils.store - get -> name: ' + name + ', value: ' + json[name]);
			return json[name] || null;
		} else if (name && value === null) {
			try {
				delete json[name];
			} catch (e) {
				json[name] = null;
			}
		} else if (name) {
			msos.console.debug('hello.utils.store - set -> name: ' + name + ', value: ' + value);
			json[name] = value;
		} else {
			return json;
		}

		// If we get to here, reset cache and set new Basil value
		this.store_cache = undefined;
		msos.basil.set('hello', JSON.stringify(json));

		return json || null;
	},

	append: function (node, attr, target) {
		"use strict";

		var n = typeof node === 'string' ? document.createElement(node) : node,
			x,
			y,
			dbug = '';

		msos.console.debug(this.ut_name + '.append -> start.');

		if (typeof attr === 'object') {
			if (attr.tagName) {
				target = attr;
			} else {
				for (x in attr) {
					if (attr.hasOwnProperty(x)) {
						if (typeof (attr[x]) === 'object') {
							for (y in attr[x]) {
								if (attr[x].hasOwnProperty(y)) {
									n[x][y] = attr[x][y];
								}
							}
						} else if (x === 'html') {
							n.innerHTML = attr[x];
						} else if (!/^on/.test(x)) {
							// IE doesn't like us setting methods with setAttribute
							n.setAttribute(x, attr[x]);
						} else {
							n[x] = attr[x];
						}
					}
				}
			}
		}

		if (target === 'body') {
			dbug = 'body';
			(function self() {
				if (document.body) {
					document.body.appendChild(n);
				} else {
					setTimeout(self, 16);
				}
			}());
		} else if (typeof target === 'object') {
			dbug = 'dom object';
			target.appendChild(n);
		} else if (typeof target === 'string') {
			dbug = target;
			document.getElementsByTagName(target)[0].appendChild(n);
		} else {
			dbug = 'no target';
		}

		msos.console.debug(this.ut_name + '.append -> done, target: ' + dbug);
		return n;
	},

	iframe: function (src) {
		"use strict";

		this.append(
			'iframe',
			{
				src: src,
				style: { position: 'absolute', left: '-1000px', bottom: 0, height: '1px', width: '1px'}
			},
			'body'
		);
	},

	args: function (o, args) {
		"use strict";

		var p = {},
			i = 0,
			t = null,
			x = null;

		for (x in o) {
			if (o.hasOwnProperty(x)) { break; }
		}

		if ((args.length === 1) && (typeof (args[0]) === 'object') && o[x] != 'o!') {
			for (x in args[0]) {
				if (o.hasOwnProperty(x)) {
					if (x in o) { return args[0]; }
				}
			}
		}

		for (x in o) {
			if (o.hasOwnProperty(x)) {

				t = typeof (args[i]);

				if ((typeof (o[x]) === 'function' && o[x].test(args[i])) || (typeof (o[x]) === 'string' && (
					(o[x].indexOf('s') > -1 && t === 'string') ||
					(o[x].indexOf('o') > -1 && t === 'object') ||
					(o[x].indexOf('i') > -1 && t === 'number') ||
					(o[x].indexOf('a') > -1 && t === 'object') ||
					(o[x].indexOf('f') > -1 && t === 'function')
					))
				) {
					p[x] = args[i++];
				} else if (typeof (o[x]) === 'string' && o[x].indexOf('!') > -1) {
					return false;
				}
			}
		}

		return p;
	},

	Promise: (function(){
		/*  promise states [Promises/A+ 2.1]  */
		var STATE_PENDING   = 0;                                         /*  [Promises/A+ 2.1.1]  */
		var STATE_FULFILLED = 1;                                         /*  [Promises/A+ 2.1.2]  */
		var STATE_REJECTED  = 2;                                         /*  [Promises/A+ 2.1.3]  */

		/*  promise object constructor  */
		var api = function (executor) {
			/*  optionally support non-constructor/plain-function call  */
			if (!(this instanceof api))
				return new api(executor);

			/*  initialize object  */
			this.id           = "Thenable/1.0.6";
			this.state        = STATE_PENDING; /*  initial state  */
			this.fulfillValue = undefined;     /*  initial value  */     /*  [Promises/A+ 1.3, 2.1.2.2]  */
			this.rejectReason = undefined;     /*  initial reason */     /*  [Promises/A+ 1.5, 2.1.3.2]  */
			this.onFulfilled  = [];            /*  initial handlers  */
			this.onRejected   = [];            /*  initial handlers  */

			/*  provide optional information-hiding proxy  */
			this.proxy = {
				then: this.then.bind(this)
			};

			/*  support optional executor function  */
			if (typeof executor === "function")
				executor.call(this, this.fulfill.bind(this), this.reject.bind(this));
		};

		/*  promise API methods  */
		api.prototype = {
			/*  promise resolving methods  */
			fulfill: function (value) { return deliver(this, STATE_FULFILLED, "fulfillValue", value); },
			reject:  function (value) { return deliver(this, STATE_REJECTED,  "rejectReason", value); },

			/*  "The then Method" [Promises/A+ 1.1, 1.2, 2.2]  */
			then: function (onFulfilled, onRejected) {
				var curr = this;
				var next = new api();                                    /*  [Promises/A+ 2.2.7]  */
				curr.onFulfilled.push(
					resolver(onFulfilled, next, "fulfill"));             /*  [Promises/A+ 2.2.2/2.2.6]  */
				curr.onRejected.push(
					resolver(onRejected,  next, "reject" ));             /*  [Promises/A+ 2.2.3/2.2.6]  */
				execute(curr);
				return next.proxy;                                       /*  [Promises/A+ 2.2.7, 3.3]  */
			}
		};

		/*  deliver an action  */
		var deliver = function (curr, state, name, value) {
			if (curr.state === STATE_PENDING) {
				curr.state = state;                                      /*  [Promises/A+ 2.1.2.1, 2.1.3.1]  */
				curr[name] = value;                                      /*  [Promises/A+ 2.1.2.2, 2.1.3.2]  */
				execute(curr);
			}
			return curr;
		};

		/*  execute all handlers  */
		var execute = function (curr) {
			if (curr.state === STATE_FULFILLED)
				execute_handlers(curr, "onFulfilled", curr.fulfillValue);
			else if (curr.state === STATE_REJECTED)
				execute_handlers(curr, "onRejected",  curr.rejectReason);
		};

		/*  execute particular set of handlers  */
		var execute_handlers = function (curr, name, value) {
			/* global process: true */
			/* global setImmediate: true */
			/* global setTimeout: true */

			/*  short-circuit processing  */
			if (curr[name].length === 0)
				return;

			/*  iterate over all handlers, exactly once  */
			var handlers = curr[name];
			curr[name] = [];                                             /*  [Promises/A+ 2.2.2.3, 2.2.3.3]  */
			var func = function () {
				for (var i = 0; i < handlers.length; i++)
					handlers[i](value);                                  /*  [Promises/A+ 2.2.5]  */
			};

			/*  execute procedure asynchronously  */                     /*  [Promises/A+ 2.2.4, 3.1]  */
			if (typeof process === "object" && typeof process.nextTick === "function")
				process.nextTick(func);
			else if (typeof setImmediate === "function")
				setImmediate(func);
			else
				setTimeout(func, 0);
		};

		/*  generate a resolver function  */
		var resolver = function (cb, next, method) {
			return function (value) {
				if (typeof cb !== "function")                            /*  [Promises/A+ 2.2.1, 2.2.7.3, 2.2.7.4]  */
					next[method].call(next, value);                      /*  [Promises/A+ 2.2.7.3, 2.2.7.4]  */
				else {
					var result;
					try { result = cb(value); }                          /*  [Promises/A+ 2.2.2.1, 2.2.3.1, 2.2.5, 3.2]  */
					catch (e) {
						next.reject(e);                                  /*  [Promises/A+ 2.2.7.2]  */
						return;
					}
					resolve(next, result);                               /*  [Promises/A+ 2.2.7.1]  */
				}
			};
		};

		/*  "Promise Resolution Procedure"  */                           /*  [Promises/A+ 2.3]  */
		var resolve = function (promise, x) {
			/*  sanity check arguments  */                               /*  [Promises/A+ 2.3.1]  */
			if (promise === x || promise.proxy === x) {
				promise.reject(new TypeError("cannot resolve promise with itself"));
				return;
			}

			/*  surgically check for a "then" method
				(mainly to just call the "getter" of "then" only once)  */
			var then;
			if ((typeof x === "object" && x !== null) || typeof x === "function") {
				try { then = x.then; }                                   /*  [Promises/A+ 2.3.3.1, 3.5]  */
				catch (e) {
					promise.reject(e);                                   /*  [Promises/A+ 2.3.3.2]  */
					return;
				}
			}

			/*  handle own Thenables    [Promises/A+ 2.3.2]
				and similar "thenables" [Promises/A+ 2.3.3]  */
			if (typeof then === "function") {
				var resolved = false;
				try {
					/*  call retrieved "then" method */                  /*  [Promises/A+ 2.3.3.3]  */
					then.call(x,
						/*  resolvePromise  */                           /*  [Promises/A+ 2.3.3.3.1]  */
						function (y) {
							if (resolved) return; resolved = true;       /*  [Promises/A+ 2.3.3.3.3]  */
							if (y === x)                                 /*  [Promises/A+ 3.6]  */
								promise.reject(new TypeError("circular thenable chain"));
							else
								resolve(promise, y);
						},

						/*  rejectPromise  */                            /*  [Promises/A+ 2.3.3.3.2]  */
						function (r) {
							if (resolved) return; resolved = true;       /*  [Promises/A+ 2.3.3.3.3]  */
							promise.reject(r);
						}
					);
				}
				catch (e) {
					if (!resolved)                                       /*  [Promises/A+ 2.3.3.3.3]  */
						promise.reject(e);                               /*  [Promises/A+ 2.3.3.3.4]  */
				}
				return;
			}

			/*  handle other values  */
			promise.fulfill(x);                                          /*  [Promises/A+ 2.3.4, 2.3.3.4]  */
		};

		/*  export API  */
		return api;
	})(),

	Event: function () {
		"use strict";

		var separator = /[\s\,]+/;

		this.parent = {
			events:		this.events,
			findEvents:	this.findEvents,
			parent:		this.parent,
			utils:		this.utils
		};

		this.events = {};

		this.on = function (evt, callback) {

			if (callback && typeof callback === 'function') {
				var a = evt.split(separator),
					i = 0;

				for (i = 0; i < a.length; i += 1) {
					this.events[a[i]] = [callback].concat(this.events[a[i]] || []);
				}
			}

			return this;
		};

		this.off = function (evt, callback) {

			this.findEvents(
				evt,
				function (name, index) {
					if (!callback || this.events[name][index] === callback) {
						this.events[name][index] = null;
					}
				}
			);

			return this;
		};

		this.emit = function (evt) {

			var args = Array.prototype.slice.call(arguments, 1),
				_this = this,
				handler = function (name, index) {
					args[args.length - 1] = (name === '*' ? evt : name);
					this.events[name][index].apply(this, args);
				};

			args.push(evt);

			while (_this && _this.findEvents) {
				_this.findEvents(evt + ',*', handler);
				_this = _this.parent;
			}

			return this;
		};

		this.emitAfter = function () {
			var self = this,
				args = arguments;

			setTimeout(
				function () {
					self.emit.apply(self, args);
				},
				10
			);

			return this;
		};

		this.findEvents = function (evt, callback) {

			var a = evt.split(separator),
				name,
				i = 0;

			for (name in this.events) {
				if (this.events.hasOwnProperty(name)) {
					if (_.indexOf(a, name) > -1) {
						for (i = 0; i < this.events[name].length; i += 1) {
							if (this.events[name][i]) {
								callback.call(this, name, i);
							}
						}
					}
				}
			}
		};

		return this;
	},

	globalEvent: function (glob_evt_cb, guid) {
		"use strict";

		guid = guid || '_hellojs_' + parseInt(Math.random() * 1e12, 10).toString(36);

		msos.console.debug(this.ut_name + '.globalEvent -> start, guid: ' + guid);

		window[guid] = function () {

			var bool = glob_evt_cb.apply(this, arguments);

			msos.console.debug(guid + ' ~~~> start.');

			if (bool) {
				// Remove this handler reference
				try {
					delete window[guid];
					msos.console.debug(guid + ' ~~~> delete: ' + guid);
				} catch (e) {
					msos.console.error(guid + ' ~~~> delete failed, reason: ' + e.message);
				}
			}

			msos.console.debug(guid + ' ~~~> done!');
		};

		msos.console.debug(this.ut_name + '.globalEvent ->  done, guid: ' + guid);
		return guid;
	},

	popup: function (url, redirectUri, options) {
		"use strict";

		var documentElement = document.documentElement,
			dualScreenTop,
			dualScreenLeft,
			height,
			width,
			optionsArray = [],
			popup;

		if (options.height) {
			dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top;
			height = screen.height || window.innerHeight || documentElement.clientHeight;
			options.top = parseInt((height - options.height) / 2, 10) + dualScreenTop;
		}

		if (options.width) {
			dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
			width = screen.width || window.innerWidth || documentElement.clientWidth;
			options.left = parseInt((width - options.width) / 2, 10) + dualScreenLeft;
		}

		Object.keys(options).forEach(
			function (name) {
				var value = options[name];

				optionsArray.push(name + (value !== null ? '=' + value : ''));
			}
		);

		if (navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) {
			url = redirectUri + '#oauth_redirect=' + encodeURIComponent(encodeURIComponent(url));
		}

		popup = window.open(
			url,
			'_blank',
			optionsArray.join(',')
		);

		if (popup && popup.focus) { popup.focus(); }

		return popup;
	},

	hasBinary: function (data) {
		var x;

		for (x in data) {
			if (data.hasOwnProperty(x)) {
				if (this.isBinary(data[x])) { return true; }
			}
		}

		return false;
	},

	isBinary: function(data) {
		return data instanceof Object && ((this.domInstance('input', data) && data.type === 'file') || ('FileList' in window && data instanceof window.FileList) || ('File' in window && data instanceof window.File) || ('Blob' in window && data instanceof window.Blob));
	},

	toBlob: function (dataURI) {
		var reg = /^data\:([^;,]+(\;charset=[^;,]+)?)(\;base64)?,/i,
			m = dataURI.match(reg),
			binary,
			array = [],
			i = 0;

		if (!m) {
			return dataURI;
		}

		binary = atob(dataURI.replace(reg, ''));

		for (i = 0; i < binary.length; i += 1) {
			array.push(binary.charCodeAt(i));
		}

		return new Blob([new Uint8Array(array)], { type: m[1] });
	},

	dataToJSON: function (p) {
		var utils = this,
			w = window,
			data = p.data,
			x;

		if (utils.domInstance('form', data)) {
			data = utils.nodeListToJSON(data.elements);
		} else if ('NodeList' in w && data instanceof NodeList) {
			data = utils.nodeListToJSON(data);
		} else if (utils.domInstance('input', data)) {
			data = utils.nodeListToJSON([data]);
		}

		if (('File' in w && data instanceof w.File) || ('Blob' in w && data instanceof w.Blob) || ('FileList' in w && data instanceof w.FileList)) {
			data = { file: data };
		}

		if (!('FormData' in w && data instanceof w.FormData)) {
			for (x in data) {
				if (data.hasOwnProperty(x)) {
					if ('FileList' in w && data[x] instanceof w.FileList) {
						if (data[x].length === 1) { data[x] = data[x][0]; }
					} else if (utils.domInstance('input', data[x]) && data[x].type === 'file') {
						continue;
					} else if (utils.domInstance('input', data[x]) || utils.domInstance('select', data[x]) || utils.domInstance('textArea', data[x])) {
						data[x] = data[x].value;
					} else if (utils.domInstance(null, data[x])) {
						data[x] = data[x].innerHTML || data[x].innerText;
					}
				}
			}
		}

		p.data = data;
		return data;
	},

	nodeListToJSON: function (nodelist) {
		var json = {},
			i = 0,
			input;

		for (i = 0; i < nodelist.length; i += 1) {

			input = nodelist[i];

			if (input.disabled || !input.name) { continue; }

			if (input.type === 'file')	{ json[input.name] = input; }
			else						{ json[input.name] = input.value || input.innerHTML; }
		}

		return json;
	}
};

hello.services = {};
hello.events = {};

hello.use = function (service) {
		"use strict";

	msos.console.debug('hello.use -> start, service: ' + service);

	// Create self, which inherits from its parent
	var self = Object.create(this);

	// Inherit the prototype from its parent
	self.settings = Object.create(this.settings);

	// Define the default service
	if (service) {
		self.settings.default_service = service;
	}

	msos.console.debug('hello.use -> done!');
	return self;
};

 hello.init = function (service, options) {
	"use strict";

	var _this = this,
		mtv = msos.config.verbose;

	if (mtv) { msos.console.debug('hello.init -> start, service:', service); }

	if (service) {

		_this.services = _.extend(_this.services, service);

		// Update the default settings with this one.
		if (options) {

			if (mtv) { msos.console.debug('hello.init -> extend setting, options:', options); }

			_this.settings = _.extend(_this.settings, options);

			if ('redirect_uri' in options) {
				_this.settings.redirect_uri = hello.utils.url(options.redirect_uri).href;
			}
		}

	} else {
		msos.console.warn('hello.init -> done, no service input.');
	}

	if (mtv) { msos.console.debug('hello.init -> done!'); }
	return _this;
};

hello.login = function () {
	"use strict";

	var _this = this,
		mtv = msos.config.verbose,
		utils = _this.utils,
		error = utils.error,
		promise = utils.Promise(),
		p = utils.args(
			{
				network: 's',
				options: 'o',
				callback: 'f'
			},
			arguments
		),
		url,
		qs,
		provider,
		callbackId,
		redirectUri,
		responseType,
		session,
		SCOPE_SPLIT = /[,\s]+/,
		diff,
		scope,
		scopeMap,
		popup,
		timer,
		leave_page = true;

	msos.console.debug('hello.login -> start, p:', p);

	function encodeFunction(s) { return s; }

	function filterEmpty(s) { return !!s; }

	p.options = _.isObject(p.options) ? p.options : {};

	qs = utils.diffKey(p.options, _this.settings);

	p.options = _.extend(_this.settings, p.options);

	if (mtv) {
		msos.console.debug('hello.login -> qs:', qs);
	}

	p.network = p.network || _this.settings.default_service;

	promise.proxy.then(p.callback, p.callback);

	function emit(s, value) {
		hello.emit(s, value);
	}

	promise.proxy.then(
		emit.bind(
			this,
			'auth.login auth'
		),
		emit.bind(
			this,
			'auth.failed auth'
		)
	);

	if (typeof (p.network) !== 'string' || !(p.network in _this.services)) {
		return promise.reject(
			error(
				'invalid_network',
				'the provided network was not recognized'
			)
		);
	}

	provider = _this.services[p.network];

	if (mtv) {
		msos.console.debug('hello.login -> provider:', provider);
	}

	callbackId = utils.globalEvent(
		function (str) {

			var obj;

			msos.console.debug('hello.login - cb -> start.');

			if (str) {
				obj = JSON.parse(str);
			} else {
				obj = error(
					'cancelled',
					'the authentication was not completed'
				);
			}

			if (!obj.error) {

				utils.store(obj.network, obj);

				promise.fulfill(
					{
						network: obj.network,
						authResponse: obj
					}
				);
			} else {
				promise.reject(obj);
			}

			msos.console.debug('hello.login - cb -> done!');
		}
	);

	redirectUri = utils.url(p.options.redirect_uri).href;

	responseType = provider.oauth.response_type || p.options.response_type;

	if (/\bcode\b/.test(responseType) && !provider.oauth.grant) {
		responseType = responseType.replace(/\bcode\b/, 'token');
	}

	p.qs = _.extend(
		qs,
		{
			client_id: encodeURIComponent(provider.id),
			response_type: encodeURIComponent(responseType),
			redirect_uri: encodeURIComponent(redirectUri),
			state: {
				client_id: provider.id,
				network: p.network,
				display: p.options.display,
				callback: callbackId,
				state: p.options.state,
				redirect_uri: redirectUri
			}
		}
	);

	session = utils.store(p.network);
	scope = _this.settings.scope;

	if (mtv) {
		msos.console.debug('hello.login -> session/scope:', session, scope);
	}

	scopeMap = _.extend(_this.settings.scope_map, provider.scope);

	if (p.options.scope) {
		scope.push(p.options.scope.toString());
	}

	if (session && session.scope && session.scope instanceof String) {
		scope.push(session.scope);
	}
console.log('scope 1:', scope);
	scope = scope.join(',').split(SCOPE_SPLIT);
console.log('scope 2:', scope);
	scope = _.uniq(scope).filter(filterEmpty);
console.log('scope 3:', scope);
	p.qs.state.scope = scope.join(',');

	scope = scope.map(
		function (item) {
			return (item in scopeMap) ? scopeMap[item] : item;
		}
	);
console.log('scope 4:', scope);
	scope = scope.join(',').split(SCOPE_SPLIT);
console.log('scope 5:', scope);
	scope = _.uniq(scope).filter(filterEmpty);
console.log('scope 6:', scope);
	p.qs.scope = scope.join(provider.scope_delim || ',');
console.log('p.qs.scope:', p.qs.scope);
	if (p.options.force === false) {

		if (session && session.access_token && session.expires && session.expires > ((new Date()).getTime() / 1e3)) {

			diff = _.difference((session.scope || '').split(SCOPE_SPLIT), (p.qs.state.scope || '').split(SCOPE_SPLIT));

			if (diff.length === 0) {

				msos.console.debug('hello.login -> found access_token');

				promise.fulfill(
					{
						unchanged: true,
						network: p.network,
						authResponse: session
					}
				);

				return promise;
			}
		}
	}

	if (p.options.display === 'page' && p.options.page_uri) {
		p.qs.state.page_uri = utils.url(p.options.page_uri).href;
	}

	if (provider.login && typeof (provider.login) === 'function') {
		provider.login(p);
	}

	if (!/\btoken\b/.test(responseType) || parseInt(provider.oauth.version, 10) < 2 || (p.options.display === 'none' && provider.oauth.grant && session && session.refresh_token)) {

		p.qs.state.oauth = provider.oauth;
		p.qs.state.oauth_proxy = p.options.oauth_proxy;
	}

	p.qs.state = encodeURIComponent(JSON.stringify(p.qs.state));

	if (parseInt(provider.oauth.version, 10) === 1) {

		url = utils.qs(p.options.oauth_proxy, p.qs, encodeFunction);

	} else if (p.options.display === 'none' && provider.oauth.grant && session && session.refresh_token) {

		p.qs.refresh_token = session.refresh_token;

		url = utils.qs(p.options.oauth_proxy, p.qs, encodeFunction);

	} else {
		url = utils.qs(provider.oauth.auth, p.qs, encodeFunction);
	}

	emit('auth.init', p);

	if (mtv) {
		msos.console.debug('hello.login -> p: ', p);
	}

	if (p.options.display === 'none') {

		utils.iframe(url);

	} else if (p.options.display === 'popup') {

		popup = utils.popup(url, redirectUri, p.options.popup);

		timer = setInterval(
			function () {
				var response;

				if (!popup || popup.closed) {

					clearInterval(timer);

					if (!promise.state) {

						response = error(
							'cancelled',
							'login has been cancelled'
						);

						if (!popup) {
							response = error(
								'blocked',
								'popup was blocked'
							);
						}

						response.network = p.network;

						promise.reject(response);
					}
				}
			},
			100
		);

	} else {

		msos.console.debug('hello.login -> forward to: ' + url);

		if (msos.config.debug) {
			// Stop new window location, so we can see debugging info
			leave_page = confirm('Leaving page, confirm ok');
		}

		if (leave_page) { window.location = url; }
	}

	msos.console.debug('hello.login -> done!');
	return promise.proxy;
};

hello.logout = function () {
	"use strict";

	var _this = this,
		utils = _this.utils,
		error = utils.error,
		promise = utils.Promise(),
		p = utils.args(
			{
				name:'s',
				options: 'o',
				callback: 'f'
			},
			arguments
		),
		callback,
		_opts = {},
		logout;

	p.options = p.options || {};

	msos.console.debug('hello.logout -> start, p:', p);

	promise.proxy.then(p.callback, p.callback);

	function emit(s, value) {
		hello.emit(s, value);
	}

	promise.proxy.then(
		emit.bind(
			this,
			'auth.logout auth'
		),
		emit.bind(
			this,
			'error'
		)
	);

	// Network
	p.name = p.name || this.settings.default_service;
	p.authResponse = utils.store(p.name);

	if (p.name && !(p.name in _this.services)) {

		promise.reject(
			error(
				'invalid_network',
				'the network was unrecognized'
			)
		);
	} else if (p.name && p.authResponse) {

		callback = function (opts) {

			// Remove from the store
			utils.store(p.name, null);

			// Emit events by default
			promise.fulfill(
				_.extend({ network: p.name }, opts || {})
			);
		};

		if (p.options.force) {
			logout = _this.services[p.name].logout;

			if (logout) {
				if (typeof (logout) === 'function') {
					logout = logout(callback, p);
				}

				if (typeof (logout) === 'string') {
					utils.iframe(logout);
					_opts.force = null;
					_opts.message = 'logout success on providers site was indeterminate';
				} else if (logout === undefined) {
					return promise.proxy;
				}
			}
		}

		callback(_opts);

	} else {
		promise.reject(
			error(
				'invalid_session',
				'there was no session to remove'
			)
		);
	}

	msos.console.debug('hello.logout -> done!');
	return promise.proxy;
};

hello.getAuthResponse = function (service) {
	"use strict";

	msos.console.debug('hello.getAuthResponse -> start, for: ' + service);

	// If the service doesn't exist
	service = service || this.settings.default_service;

	if (!service || !(service in this.services)) {
		msos.console.warn('hello.getAuthResponse -> done, service na');
		return null;
	}

	msos.console.debug('hello.getAuthResponse -> done!');
	return this.utils.store(service) || null;
};

hello.api = function () {
	"use strict";

	// Shorthand
	var _this = this,
		utils = _this.utils,
		error = utils.error,
		promise = utils.Promise(),
		p = utils.args(
			{
				path: 's!',
				query: 'o',
				method: 's',
				data: 'o',
				timeout: 'i',
				callback: 'f'
			},
			arguments
		),
		a,
		reg,
		o,
		url,
		m,
		actions,
		query;

	msos.console.debug('hello.api -> start.');

	function getPath(url) {

		url = url.replace(
			/\@\{([a-z\_\-]+)(\|.*?)?\}/gi,
			function (m, key, defaults) {
				var val = defaults ? defaults.replace(/^\|/, '') : '';

				if (key in p.query) {
					val = p.query[key];
					delete p.query[key];
				} else if (p.data && key in p.data) {
					val = p.data[key];
					delete p.data[key];
				} else if (!defaults) {
					promise.reject(
						error(
							'missing_attribute',
							'the attribute ' + key + ' is missing from the request'
						)
					);
				}

				return val;
			}
		);

		if (!url.match(/^https?:\/\//)) {
			url = o.base + url;
		}

		p.url = url;

		utils.request(
			p,
			function (r, headers) {
				var wrap,
					b;

				if (!p.formatResponse) {
					if (typeof headers === 'object' ? (headers.statusCode >= 400) : (typeof r === 'object' && 'error' in r)) {
						promise.reject(r);
					} else {
						promise.fulfill(r);
					}

					return;
				}

				if (r === true) {
					r = {success:true};
				} else if (!r) {
					r = {};
				}

				if (p.method === 'delete') {
					r = (!r || utils.isEmpty(r)) ? {success:true} : r;
				}

				if (o.wrap && ((p.path in o.wrap) || ('default' in o.wrap))) {
					wrap = (p.path in o.wrap ? p.path : 'default');

					b = o.wrap[wrap](r, headers, p);

					if (b) {
						r = b;
					}
				}

				if (r && 'paging' in r && r.paging.next) {

					if (r.paging.next[0] === '?') {
						r.paging.next = p.path + r.paging.next;
					} else {
						r.paging.next += '#' + p.path;
					}
				}

				if (!r || 'error' in r) {
					promise.reject(r);
				} else {
					promise.fulfill(r);
				}
			}
		);
	}

	p.method = (p.method || 'get').toLowerCase();
	p.headers = p.headers || {};
	p.query = p.query || {};

	// If get, put all parameters into query
	if (p.method === 'get' || p.method === 'delete') {
		_.extend(p.query, p.data);
		p.data = {};
	}

	msos.console.debug('hello.api -> p.data:', p.data);

	promise.then(p.callback, p.callback);

	if (!p.path) {
		return promise.reject(
			error(
				'invalid_path',
				'missing the path parameter from the request'
			)
		);
	}

	p.path = p.path.replace(/^\/+/, '');
	a = (p.path.split(/[\/\:]/, 2) || [])[0].toLowerCase();

	if (a in _this.services) {
		p.network = a;
		reg = new RegExp('^' + a + ':?\/?');
		p.path = p.path.replace(reg, '');
	}

	p.network = _this.settings.default_service = p.network || _this.settings.default_service;
	o = _this.services[p.network];

	if (!o) {
		return promise.reject(
			error(
				'invalid_network',
				'could not match the service requested: ' + p.network
			)
		);
	}

	if (!(!(p.method in o) || !(p.path in o[p.method]) || o[p.method][p.path] !== false)) {
		return promise.reject(
			error(
				'invalid_path',
				'the provided path is not available on the selected network'
			)
		);
	}

	if (!p.oauth_proxy) {
		p.oauth_proxy = _this.settings.oauth_proxy;
	}

	if (!('proxy' in p)) {
		p.proxy = p.oauth_proxy && o.oauth && parseInt(o.oauth.version, 10) === 1;
	}

	if (!('timeout' in p)) {
		p.timeout = _this.settings.timeout;
	}

	if (!('formatResponse' in p)) {
		p.formatResponse = true;
	}

	p.authResponse = _this.getAuthResponse(p.network);

	if (p.authResponse && p.authResponse.access_token) {
		p.query.access_token = p.authResponse.access_token;
	}

	url = p.path;

	p.options =	utils.clone(p.query);
	p.data =	utils.clone(p.data);

	actions = o[{ 'delete': 'del' }[p.method] || p.method] || {};

	if (p.method === 'get') {

		query = url.split(/[\?#]/)[1];

		if (query) {
			utils.extend(p.query, utils.param(query));
			url = url.replace(/\?.*?(#|$)/, '$1');
		}
	}

	if ((m = url.match(/#(.+)/, ''))) {
		url = url.split('#')[0];
		p.path = m[1];
	} else if (url in actions) {
		p.path = url;
		url = actions[url];
	} else if ('default' in actions) {
		url = actions['default'];
	}

	p.redirect_uri = _this.settings.redirect_uri;

	p.xhr = o.xhr;
	p.jsonp = o.jsonp;
	p.form = o.form;

	if (typeof (url) === 'function') {
		url(p, getPath);
	} else {
		getPath(url);
	}

	msos.console.debug('hello.api -> done!');
	return promise.proxy;
};

hello.utils.Event.call(hello);

(function (_hello) {
	"use strict";

	var api = _hello.api;

	// Replace original function
	_hello.api = function () {

		var p = _hello.utils.args(
				{
					path: 's!',
					method: 's',
					data:'o',
					timeout: 'i',
					callback: 'f'
				},
				arguments
			);

		msos.console.debug('hello.api (amended) -> called.');

		if (p.data) {
			msos.console.debug('hello.api (amended) -> p.data:', p.data);
			_hello.utils.dataToJSON(p);
		}

		return api.call(this, p);
	};

}(hello));
