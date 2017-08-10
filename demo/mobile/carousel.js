
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false,
	demo: false
*/

msos.provide("demo.mobile.carousel");
msos.require("ng.mobile.ui.carousel");


angular.module(
	'demo.mobile.carousel',
	[]
).directive(
	'carousel',
	function () {
		return {
			restrict: 'C',
			scope: {},
			controller: function () {
				this.itemCount = 0;
				this.activeItem = null;
	
				this.addItem = function () {
					var newId = this.itemCount++;
					this.activeItem = this.itemCount === 1 ? newId : this.activeItem;
					return newId;
				};
	
				this.next = function () {
					this.activeItem = this.activeItem || 0;
					this.activeItem = this.activeItem === this.itemCount - 1 ? 0 : this.activeItem + 1;
				};
	
				this.prev = function () {
					this.activeItem = this.activeItem || 0;
					this.activeItem = this.activeItem === 0 ? this.itemCount - 1 : this.activeItem - 1;
				};
			}
		};
	}
).directive(
	'carouselItem',
	['$drag', function ($drag) {
		return {
			restrict: 'C',
			require: '^carousel',
			scope: {},
			transclude: true,
			template: '<div class="item"><div ng-transclude></div></div>',
			link: function (scope, elem, attrs, carousel) {
				scope.carousel = carousel;
				var id = carousel.addItem();
	
				var zIndex = function () {
						var res = 0;
						if (id === carousel.activeItem) {
							res = 2000;
						} else if (carousel.activeItem < id) {
							res = 2000 - (id - carousel.activeItem);
						} else {
							res = 2000 - (carousel.itemCount - 1 - carousel.activeItem + id);
						}
						return res;
					};
	
				scope.$watch(function () {
					return carousel.activeItem;
				}, function () {
					elem[0].style.zIndex = zIndex();
				});

				if ($drag.TRANSLATE_BOTH) {
					$drag.bind(elem, {
						//
						// This is an example of custom transform function
						//
						transform: function (element, transform, touch) {
							// 
							// use translate both as basis for the new transform:
							// 
							var t = $drag.TRANSLATE_BOTH(element, transform, touch);

							//
							// Add rotation:
							//
							var Dx = touch.distanceX,
								t0 = touch.startTransform,
								sign = Dx < 0 ? -1 : 1,
								angle = sign * Math.min((Math.abs(Dx) / 700) * 30, 30);

							t.rotateZ = angle + (Math.round(t0.rotateZ));

							return t;
						},
						move: function (drag) {
							if (Math.abs(drag.distanceX) >= drag.rect.width / 4) {
								elem.addClass('dismiss');
							} else {
								elem.removeClass('dismiss');
							}
						},
						cancel: function () {
							elem.removeClass('dismiss');
						},
						end: function (drag) {
							elem.removeClass('dismiss');
							if (Math.abs(drag.distanceX) >= drag.rect.width / 4) {
								scope.$apply(function () {
									carousel.next();
								});
							}
							drag.reset();
						}
					});
				}
			}
		};
	}]
);
