
/**
 * ocmodal - An angularJS modal directive / service
 * @version v0.1.12
 * @link https://github.com/ocombe/ocModal
 * @license MIT
 * @author Olivier Combe <olivier.combe@gmail.com>
 */

(function () {
	'use strict';

	var ocModal = angular.module(
		'oc.modal',
		["ng"]
	);

	ocModal.factory(
		'$ocModal',
		['$rootScope', '$controller', '$location', '$timeout', '$compile', '$q', function ($rootScope, $controller, $location, $timeout, $compile, $q) {
			var $body = angular.element(document.body),
				$dialogsWrapper = angular.element('<div role="dialog" tabindex="-1" class="modal"><div class="modal-backdrop"></div></div>'),
				$modalWrapper = angular.element(
					'<div class="modal-wrapper"></div>'
				),
				modals = {},
				openedModals = [],
				baseOverflow;

			// include the modal in DOM at start for animations
			$modalWrapper.css('display', 'none');
			$modalWrapper.append($dialogsWrapper);
			$body.append($modalWrapper);
			$dialogsWrapper.on('click', function (e) {
				if (angular.element(e.target).hasClass('modal-backdrop')) { // only if clicked on backdrop
					$rootScope.$apply(function () {
						self.closeOnEsc();
					});
				}
			});

			var parseMaxTime = function parseMaxTime(str) {
				var total = 0, values = angular.isString(str) ? str.split(/\s*,\s*/) : [];
				angular.forEach(values, function (value) {
					total = Math.max(parseFloat(value) || 0, total);
				});
				return total;
			};

			var getAnimDuration = function getDuration($element) {
				var duration = 0;
				if ((Modernizr.csstransitions || Modernizr.cssanimations)) {
					//one day all browsers will have these properties
					var w3cAnimationProp = 'animation';
					var w3cTransitionProp = 'transition';

					//but some still use vendor-prefixed styles
					var vendorAnimationProp = 'Animation';
					var vendorTransitionProp = 'Transition';

					var durationKey = 'Duration',
						delayKey = 'Delay',
						animationIterationCountKey = 'IterationCount';

					//we want all the styles defined before and after
					var ELEMENT_NODE = 1;
					angular.forEach($element, function (element) {
						if (element.nodeType == ELEMENT_NODE) {
							var elementStyles = window.getComputedStyle(element) || {};

							var transitionDelay = Math.max(parseMaxTime(elementStyles[w3cTransitionProp + delayKey]),
								parseMaxTime(elementStyles[vendorTransitionProp + delayKey]));

							var animationDelay = Math.max(parseMaxTime(elementStyles[w3cAnimationProp + delayKey]),
								parseMaxTime(elementStyles[vendorAnimationProp + delayKey]));

							var transitionDuration = Math.max(parseMaxTime(elementStyles[w3cTransitionProp + durationKey]),
								parseMaxTime(elementStyles[vendorTransitionProp + durationKey]));

							var animationDuration = Math.max(parseMaxTime(elementStyles[w3cAnimationProp + durationKey]),
								parseMaxTime(elementStyles[vendorAnimationProp + durationKey]));

							if (animationDuration > 0) {
								animationDuration *= Math.max(parseInt(elementStyles[w3cAnimationProp + animationIterationCountKey]) || 0,
									parseInt(elementStyles[vendorAnimationProp + animationIterationCountKey]) || 0, 1);
							}

							duration = Math.max(animationDelay + animationDuration, transitionDelay + transitionDuration, duration);
						}
					});
				}

				return duration * 1000;
			};

			angular.element(document).on('keyup', function (e) {
				if (e.keyCode == 27 && openedModals.length > 0) {
					e.stopPropagation();
					$rootScope.$apply(function () {
						self.closeOnEsc(openedModals[openedModals.length - 1]);
					});
				}
			});

			var self = {
				waitingForOpen: false,

				getOpenedModals: function () {
					return openedModals;
				},

				register: function (params) {
					modals[params.id || '_default'] = params;
				},

				remove: function (id) {
					delete modals[id || '_default'];
				},

				open: function (opt) {
					if (typeof opt === 'string') {
						if (opt.match('<')) { // if html code
							opt = {
								template: opt
							};
						} else {
							opt = {
								url: opt
							};
						}
					}
					var modal = modals[opt.id || '_default'];
					if (!modal) {
						$dialogsWrapper.append($compile('<div oc-modal="'+(opt.id ? opt.id : '_default')+'"></div>')($rootScope));
						$timeout(
							function demo_oclazyload_open_to() { // let the ng-include detect that it's now empty
								self.open(opt);
							},
							0,
							false
						);
						return;
					} else if (modal && openedModals.indexOf(opt.id || '_default') !== -1) { // if modal already opened
						if (self.waitingForOpen) {
							return;
						}
						self.waitingForOpen = true;
						self.close(opt.id).then(function () {
							self.open(opt);
						});
						return;
					}
					// ok let's open the modal
					if (!self.waitingForOpen) {
						if (openedModals.length === 0) { // if no modal opened
							baseOverflow = document.body.style.overflow;
							document.body.style.overflow = 'hidden';
							$modalWrapper.css('display', 'block');
						} else {
							for(var i = 0, len = openedModals.length; i < len; i++) {
								var $e = modals[openedModals[i]].$element;
								modals[openedModals[i]].baseZIndex = $e.css('z-index');
								$e.css('z-index', '-1');
								$e.addClass('no-backdrop');
							}
						}
					}
					self.waitingForOpen = false;
					openedModals.push(opt.id || '_default');
					modal.params = opt;
					modal.$scope.customClass = modal.params.cls;

					$timeout(
						function demo_oclazyload_show_to() {
							modal.$scope.modalShow = true;
						},
						200,
						true
					);

					if (typeof modal.params.onOpen === 'function') {
						modal.params.onOpen();
					}

					var off = modal.$scope.$on('$includeContentLoaded', function (event) { // on view load
						if (modal.params.init && !modal.params.isolate) {
							angular.extend(event.targetScope, modal.params.init);
						}
						if (typeof modal.params.controller === 'string') {
							$controller(modal.params.controller, {$scope: event.targetScope, $init: modal.params.init, $ocModalParams: modal.params}); // inject controller
						}
						off();
					});

					if (modal.params.template) {
						modal.$scope.modalTemplate = modal.params.template; // load the view
					} else if (modal.params.url) {
						modal.$scope.modalUrl = modal.params.url; // load the view
					} else {
						throw "You need to define a template or an url";
					}

					if (typeof callback === 'function') {
						modal.$scope.callbacksList.push(callback);
					}
				},

				closeOnEsc: function (id) {
					if (modals[id || openedModals[openedModals.length -1]].params.closeOnEsc !== false) {
						return self.close(id);
					}
				},

				close: function (id) {
					var args,
						deferred = $q.defer('ocmodal_close_defer');
					if (typeof id === 'string' && openedModals.indexOf(id) !== -1) {
						args = Array.prototype.slice.call(arguments, 1);
					} else {
						args = arguments;
					}
					if (typeof id === 'undefined' || openedModals.indexOf(id) === -1) {
						id = openedModals[openedModals.length -1];
					}

					var modal = modals[id || openedModals[openedModals.length -1]];

					if (modal && modal.$scope.modalShow === true) { // if the modal is opened
						var animDuration = getAnimDuration(angular.element(modal.$element[0].querySelector('.modal-content')));
						$timeout(
							function demo_oclazyload_close_to() {
								modal.$scope.modalShow = false;

								$timeout(
									function demo_oclazyload_destroy_to() {
										modal.$scope.$destroy();
										modal.$element.remove(); // destroy the modal
										modal.callbacksList = []; // forget all callbacks

										openedModals.splice(openedModals.indexOf(id || openedModals[openedModals.length -1]), 1);
										if (openedModals.length === 0) { // if no modal left opened
											if (!self.waitingForOpen) { // in case the current modal is closed because another opened with the same id (avoid backdrop flickering in firefox)
												document.body.style.overflow = baseOverflow; // restore the body overflow
												$modalWrapper.css('display', 'none');
											}
										} else {
											var topModal = modals[openedModals[openedModals.length - 1]];
											topModal.$element.css('z-index', topModal.baseZIndex);
											topModal.$element.removeClass('no-backdrop');
										}
										if (typeof modal.params.onClose === 'function') {
											modal.params.onClose.apply(undefined, args);
										}

										deferred.resolve();
									},
									animDuration,
									false
								);
							},
							0,
							false
						);
					} else {
						deferred.resolve();
					}
					return deferred.promise;
				}
			};

			return self;
		}]
	);

	ocModal.directive('ocModal', ['$ocModal', '$compile', '$timeout', function ($ocModal, $compile) {
			return {
				restrict: 'AE',
				replace: true,
				scope: true,
				template:
				'<div class="modal-dialog">' +
					'<div class="modal-backdrop"></div>' +
					'<div class="modal-content {{customClass}}" ng-class="{opened: modalShow}" ng-if="modalTemplate"></div>' +
					'<div class="modal-content {{customClass}}" ng-class="{opened: modalShow}" ng-include="modalUrl"></div>' +
				'</div>',

				link: function link($scope, $element, $attrs) {
					var id = $attrs.ocModal,
						$templateWrapper;

					$scope.closeModal = function () {
						var args = Array.prototype.slice.call(arguments);
						args.unshift(id);
						$ocModal.close.apply(undefined, args);
					};

					$ocModal.register({
						id: id,
						$scope: $scope,
						$element: $element
					});

					$element.on('$destroy', function () {
						$ocModal.remove(id);
					});

					$scope.$watch('modalTemplate', function (newVal) {
						if (typeof newVal !== 'undefined') {
							if (!$templateWrapper) {
								$templateWrapper = angular.element($element.children()[1]);
							}
							$templateWrapper.append($compile(newVal)($scope));
							$scope.$emit('$includeContentLoaded');
						}
					});
				}
			};
		}]
	);

	ocModal.directive(
		'ocModalOpen',
		['$ocModal', function ($ocModal) {
			return {
				restrict: 'A',
				require: '?modal',
				link: function ($scope, $element, $attrs) {
					$element.on('click touchstart', function (e) {
						e.preventDefault();
						e.stopPropagation();
						var newScope = $scope.$new();
						var params = newScope.$eval($attrs.ocModalOpen);
						if (params) {
							if (typeof params === "number") {
								params = { url: $attrs.ocModalOpen };
							} else if (typeof params === "string") {
								params = { url: params };
							}
							if (!params.url) {
								throw "You need to set the modal url";
							}
							$scope.$apply(function () {
								$ocModal.open(params);
							});
						}
					});
				}
			};
		}]
	);

	ocModal.directive(
		'ocModalClose',
		['$ocModal', function ($ocModal) {
			return {
				restrict: 'A',
				require: '?modal',
				link: function ($scope, $element, $attrs) {
					$element.on('click touchstart', function (e) {
						e.preventDefault();
						e.stopPropagation();
						$scope.$apply(function () {
							var params;
							if ($attrs.ocModalClose) {
								params = $scope.$new().$eval($attrs.ocModalClose);
							}
							$ocModal.close(params);
						});
					});
				}
			};
		}]
	);

})();
