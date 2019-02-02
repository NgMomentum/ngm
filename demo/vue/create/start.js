
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.vue.create.start");
msos.require("ng.vue");

demo.vue.create.start.version = new msos.set_version(18, 12, 11);


msos.onload_func_done.push(
    function () {
        "use strict";

        var temp_sd = 'demo.vue.create.start';

        msos.console.debug(temp_sd + ' -> start.');

        angular.module(
			'demo.vue.create.start',
			['ng', 'ng.vue']
		).controller(
			'MainController',
			function () {
				this.person = {
					firstName: 'The',
					lastName: 'World',
					description:	'ngVue helps you use Vue components in your angular application ' +
									'so that you are able to create a faster and reactive web interfaces.'
				};
			}
		).directive(
			'helloComponent',
			['createVueComponent', function (createVueComponent) {

				var demo_vue_comp = Vue.component(
					'hello-component',
					{
						props: {
							firstName: String,
							lastName: String,
							description: String
						},
						render: function render() {
							return	'<div class="card blue-grey darken-1">' +
										'<div class="card-content white-text">' +
											'<span class="card-title"> Hi, {this.firstName} {this.lastName} </span>' +
											'<p>{this.description}</p>' +
										'</div>' +
										'<div class="card-action">' +
											'<a href="https://vuejs.org/guide/overview.html">Vue.js</a>' +
										'</div>' +
									'</div>';
						}
					}
				);

				return createVueComponent(demo_vue_comp);
			}]
		);

        angular.bootstrap('#body', ['demo.vue.create.start']);

        msos.console.debug(temp_sd + 'done!');
	}
);
