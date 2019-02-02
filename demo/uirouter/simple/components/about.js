
msos.provide("demo.uirouter.simple.components.about");


angular.module(
	'demo.uirouter.simple.components.about',
	['ng']
).component(
	'about',
	{ template:  '<h3>Its the UI-Router<br>Hello Solar System app!</h3>' }
);