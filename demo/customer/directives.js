
/*global
    msos: false,
    jQuery: false,
    angular: false,
    demo: false
*/

msos.provide('demo.customer.directives');
msos.require('ng.util.anchorscroll');


msos.onload_functions.push(
	function () {
		"use strict";

		var temp_cd = 'demo.customer.directives -> ';

        msos.console.debug(temp_cd + 'start.');

        // This directive adds custom animations to views as they enter or leave a screen
        // Note that AngularJS 1.1.4 now has an ng-animate directive but this one can be used when you 
        // want complete control or when you can't use that version of AngularJS yet
        demo.customer.start.directive(
			'animatedView',
			['$route', '$anchorScroll', '$compile', '$controller',
			 function ($route, $anchorScroll, $compile, $controller) {
				return {
					restrict: 'ECA',
					terminal: true,
					link: function (scope, element, attr) {
						var lastScope,
							onloadExp = attr.onload || '',
							defaults = {
								duration: 500,
								viewEnterAnimation: 'slideLeft',
								viewExitAnimation: 'fadeOut',
								slideAmount: 50, disabled: false
							},
							locals,
							template,
							options = scope.$eval(attr.animations);

						angular.extend(defaults, options);

						function destroyLastScope() {
							if (lastScope) {
								lastScope.$destroy();
								lastScope = null;
							}
						}

						function clearContent() {
							element.html('');
							destroyLastScope();
						}

						function bindElement() {
							element.html(template);
							destroyLastScope();

							var link = $compile(element.contents()),
								current = $route.current,
								controller;

							lastScope = current.scope = scope.$new();

							if (current.controller) {
								locals.$scope = lastScope;
								controller = $controller(current.controller, locals, false, current);
								element.children().data('$ngControllerController', controller);
							}

							link(lastScope);
							lastScope.$emit('$viewContentLoaded');
							lastScope.$eval(onloadExp);

							// $anchorScroll might listen on event...
							$anchorScroll();
						}

						function animate(animationType) {
							switch (animationType) {
								case 'fadeOut':
									jQuery(element.children()).animate({
										//opacity: 0.0, 
									}, defaults.duration, function () {
										jQuery(element).css('display', 'block');
										bindElement();
										animate('slideLeft');
									});
									break;
								case 'slideLeft':
									jQuery(element.children()).animate({
										left: '-=' + defaults.slideAmount,
										opacity: 1.0
									}, defaults.duration);
									break;
								case 'slideRight':
									jQuery(element.children()).animate({
										left: '+=' + defaults.slideAmount,
										opacity: 1.0
									}, defaults.duration);
									break;
							}
						}

						function animateEnterView(animation) {
							jQuery(element).css('display', 'block');
							bindElement();
							animate(animation);
						}

						function update() {
							locals = $route.current && $route.current.locals;
							template = locals && locals.$template;

							if (template) {
								if (!defaults.disabled) {
									if (element.children().length > 0) { //Have content in view
										animate(defaults.viewExitAnimation);
									}
									else { //No content in view so treat it as an enter animation
										animateEnterView(defaults.viewEnterAnimation);
									}
								}
								else {
									bindElement();
								}
			
							} else {
								clearContent();
							}
						}

						scope.$on('$routeChangeSuccess', update);
						update();
					}
				};
			}]
		);

		msos.console.debug(temp_cd + ' done!');
	}
);