
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.vue.component.start");
msos.require("ng.vue");

demo.vue.component.start.version = new msos.set_version(18, 12, 27);


msos.onload_func_done.push(
    function () {
        "use strict";

        var temp_sd = 'demo.vue.component.start';

        msos.console.debug(temp_sd + ' -> start.');

        angular.module(
			'demo.vue.component.start',
			['ng', 'ng.vue']
		).controller(
			'MainController',
			function () {
				var _this = this;

				this.person = {
					firstName: 'The',
					lastName: 'World',
					description:	'ngVue helps you use Vue components in your angular application ' +
									'so that you are able to create a faster and reactive web interfaces.'
				};
				this.updateFirstName = function (firstName) {
					_this.person.firstName = firstName;
				};
			}
		).value(
			'HelloComponent',
			vue.component(
				'hello-component',
				{
					props: {
						firstName: String,
						lastName: String,
						description: String
					},
					methods: {
						updateFirstName: function updateFirstName() {
							this.$emit('newFirstName', 'THE');
						}
					},
					template:	'<div class="card blue-grey darken-1">' +
									'<div class="card-content white-text">' +
										'<span class="card-title"> Hi, {this.firstName} {this.lastName} </span>' +
										'<p>{this.description}</p>' +
									'</div>' +
									'<div class="card-action">' +
										'<a href="https://vuejs.org/v2/guide/">Vue.js</a>' +
										'<button onClick={this.updateFirstName}>Update first name from Vue</button>' +
									'</div>' +
								'</div>'
				}
			)
		);

        angular.bootstrap('#body', ['demo.vue.component.start']);

        msos.console.debug(temp_sd + 'done!');
    }
);
