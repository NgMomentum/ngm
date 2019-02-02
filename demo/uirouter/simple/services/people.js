
msos.provide("demo.uirouter.simple.services.people");


angular.module(
    'demo.uirouter.simple.services.people',
	['ng']
).service(
    'PeopleService',
	['$http', function ($http) {
        var service = {
            getAllPeople: function () {
                return $http.get(
						msos.resource_url('demo', 'uirouter/simple/data/people.json'),
						{ cache: true }
					).then(
						function (resp) { return resp.data; }
					);
            },

            getPerson: function (id) {

                function personMatchesParam(person) {
                    return person.id === id;
                }

                return service.getAllPeople().then(
					function (people) {
						return people.find(personMatchesParam);
					}
				);
            }
        };

        return service;
    }]
);
