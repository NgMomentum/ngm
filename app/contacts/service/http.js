
msos.provide("app.contacts.service.http");

angular.module(
	'app.contacts.service.http',
	[]
	).factory(
		'contacts',
		['$http', function ($http) {
			var path = msos.resource_url('app', 'contacts/data.json'),
				contacts = $http.get(path).then(
					function (resp) {
						return resp.data.contacts;
					}
				),
				factory = {};

			factory.all = function () {
				return contacts;
			};

			factory.get = function (id) {
				return contacts.then(
						function () {
							return app.contacts.start.find(contacts, id);
						}
					);
			};

			return factory;
		}]
	);