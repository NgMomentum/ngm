
msos.provide("demo.uirouter.simple.components.people");


angular.module(
	'demo.uirouter.simple.components.people',
	['ng']
).component(
	'people',
	{
		bindings: { people: '<' },
		template: '<h3>Some people:</h3>' +
				  '<ul>' +
				  '  <li ng-repeat="person in $ctrl.people">' +
				  '    <a ui-sref="person({ personId: person.id })">' +
				  '      {{person.name}}' +
				  '    </a>' +
				  '  </li>' +
				  '</ul>'
	}
);