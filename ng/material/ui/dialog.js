
/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.dialog");
msos.require("ng.material.core.animator");
msos.require("ng.material.core.theming");
msos.require("ng.material.core.interim");
msos.require("ng.material.core.autofocus");	// ref. template
msos.require("ng.material.ui.interaction");
msos.require("ng.material.ui.backdrop");
msos.require("ng.material.ui.aria");
msos.require("ng.material.ui.input");		// ref. template
msos.require("ng.material.ui.button");		// ref. template


ng.material.ui.dialog.version = new msos.set_version(18, 8, 12);

// Load AngularJS-Material module specific CSS
ng.material.ui.dialog.css = new msos.loader();
ng.material.ui.dialog.css.load(msos.resource_url('ng', 'material/css/ui/dialog.css'));


function MdDialogDirective($$rAF, $mdTheming, $mdDialog) {
	"use strict";

	return {
		restrict: 'E',
		link: function (scope, element) {

			element.addClass('_md'); // private md component indicator for styling

			$mdTheming(element);

			$$rAF(
				function ng_md_dialog_dir_raf() {
					var images,
						content = element[0].querySelector('md-dialog-content');

					if (content) {
						images = content.getElementsByTagName('img');
						addOverflowClass();
						//-- delayed image loading may impact scroll height, check after images are loaded
						angular.element(images).on('load', addOverflowClass);
					}

					scope.$on(
						'$destroy',
						function ng_md_dialog_dir_raf_on() {
							$mdDialog.destroy(element);
						}
					);

					function addOverflowClass() {
						element.toggleClass('md-content-overflow', content.scrollHeight > content.clientHeight);
					}
				}
			);
		}
	};
}

function MdDialogProvider($$interimElementProvider) {
	"use strict";
 
	var topFocusTrap,
		bottomFocusTrap;

	function advancedDialogOptions() {
		return {
			template: [
				'<md-dialog md-theme="{{ dialog.theme || dialog.defaultTheme }}" aria-label="{{ dialog.ariaLabel }}" ng-class="dialog.css">',
					'<md-dialog-content class="md-dialog-content" role="document" tabIndex="-1">',
						'<h2 class="md-title">{{ dialog.title }}</h2>',
						'<div ng-if="::dialog.mdHtmlContent" class="md-dialog-content-body" ',
							'ng-bind-html="::dialog.mdHtmlContent"></div>',
						'<div ng-if="::!dialog.mdHtmlContent" class="md-dialog-content-body">',
							'<p>{{::dialog.mdTextContent}}</p>',
						'</div>',
						'<md-input-container md-no-float ng-if="::dialog.$type == \'prompt\'" class="md-prompt-input-container">',
							'<input ng-keypress="dialog.keypress($event)" md-autofocus ng-model="dialog.result" ' +
								'placeholder="{{::dialog.placeholder}}" ng-required="dialog.required">',
						'</md-input-container>',
					'</md-dialog-content>',
					'<md-dialog-actions>',
						'<md-button ng-if="dialog.$type === \'confirm\' || dialog.$type === \'prompt\'" ' +
							'ng-click="dialog.abort()" class="md-primary md-cancel-button">',
							'{{ dialog.cancel }}',
						'</md-button>',
						'<md-button ng-click="dialog.hide()" class="md-primary md-confirm-button" md-autofocus="dialog.$type===\'alert\'" ' +
							'ng-disabled="dialog.required && !dialog.result">',
							'{{ dialog.ok }}',
						'</md-button>',
					'</md-dialog-actions>',
				'</md-dialog>'
			].join('').replace(/\s\s+/g, ''),
			controller: ["$mdDialog", "$mdConstant", MdDialogController],
			controllerAs: 'dialog',
			bindToController: true,
		};
	}

	function MdDialogController($mdDialog, $mdConstant) {

		this.$onInit = function () {
			var isPrompt = this.$type == 'prompt';

			if (isPrompt && this.initialValue) {
				this.result = this.initialValue;
			}

			this.hide = function () {
				$mdDialog.hide(isPrompt ? this.result : true);
			};
	
			this.abort = function () {
				$mdDialog.cancel();
			};

			this.keypress = function ($event) {
				var invalidPrompt = isPrompt && this.required && !angular.isDefined(this.result);

				if ($event.keyCode === $mdConstant.KEY_CODE.ENTER && !invalidPrompt) {
					$mdDialog.hide(this.result);
				}
			};
		};
	}

	function dialogDefaultOptions($mdDialog, $mdAria, $mdUtil, $$mdAnimate, $mdConstant, $animate, $document, $window, $rootElement, $log, $injector, $mdTheming, $interpolate, $mdInteraction) {

		function beforeCompile(options) {

			options.defaultTheme = $mdTheming.defaultTheme();

			detectTheming(options);
		}

		function beforeShow(scope, element, options, controller) {

			if (controller) {
				var mdHtmlContent = controller.htmlContent || options.htmlContent || '',
					mdTextContent = controller.textContent || options.textContent || controller.content || options.content || '';

				if (mdHtmlContent && !$injector.has('$sanitize')) {
					throw Error('The ngSanitize module must be loaded in order to use htmlContent.');
				}

				if (mdHtmlContent && mdTextContent) {
					throw Error('md-dialog cannot have both `htmlContent` and `textContent`');
				}

				controller.mdHtmlContent = mdHtmlContent;
				controller.mdTextContent = mdTextContent;
			}
		}

		function dialogPopOut(container, options) {
			return options.reverseAnimate().then(
				function () {
					if (options.contentElement) {
						options.clearAnimate();
					}
				}
			);
		}

		function onRemove(scope, element, options) {

			options.deactivateListeners();
			options.unlockScreenReader();
			options.hideBackdrop(options.$destroy);

			if (topFocusTrap && topFocusTrap.parentNode) {
				topFocusTrap.parentNode.removeChild(topFocusTrap);
			}

			if (bottomFocusTrap && bottomFocusTrap.parentNode) {
				bottomFocusTrap.parentNode.removeChild(bottomFocusTrap);
			}

			function animateRemoval() {
				return dialogPopOut(element, options);
			}

			function detachAndClean() {
				angular.element($document[0].body).removeClass('md-dialog-is-showing');

				if (options.contentElement) {
					options.reverseContainerStretch();
				}

				options.cleanupElement();

				if (!options.$destroy && options.originInteraction === 'keyboard') {
					options.origin.focus();
				}
			}

			return options.$destroy ? detachAndClean() : animateRemoval().then(detachAndClean);
		}

		function detectTheming(options) {
			var targetEl,
				themeCtrl,
				theme,
				unwatch;

			if (options.targetEvent && options.targetEvent.target) {
				targetEl = angular.element(options.targetEvent.target);
			}

			themeCtrl = targetEl && targetEl.controller('mdTheme');

			options.hasTheme = (!!themeCtrl);

			if (!options.hasTheme) { return; }

			options.themeWatch = themeCtrl.$shouldWatch;

			theme = options.theme || themeCtrl.$mdTheme;

			if (theme) { options.scope.theme = theme; }

			unwatch = themeCtrl.registerChanges(
				function (newTheme) {
					options.scope.theme = newTheme;

					if (!options.themeWatch) { unwatch(); }
				}
			);
		}

		function captureParentAndFromToElements(options) {

			options.origin = angular.extend({
				element: null,
				bounds: null,
				focus: angular.noop
			}, options.origin || {});

			function getDomElement(element, defaultElement) {

				if (angular.isString(element)) {
					element = $document[0].querySelector(element);
				}

				return angular.element(element || defaultElement);
			}

			options.parent = getDomElement(options.parent, $rootElement);
			options.closeTo = getBoundingClientRect(getDomElement(options.closeTo));
			options.openFrom = getBoundingClientRect(getDomElement(options.openFrom));

			function getBoundingClientRect(element, orig) {
				var source = angular.element((element || {})),
					bounds = {
						top: 0,
						left: 0,
						height: 0,
						width: 0
					},
					hasFn;

				if (source && source.length) {

					hasFn = angular.isFunction(source[0].getBoundingClientRect);

					return angular.extend(orig || {}, {
						element: hasFn ? source : undefined,
						bounds: hasFn ? source[0].getBoundingClientRect() : angular.extend({}, bounds, source[0]),
						focus: angular.bind(source, source.focus),
					});
				}

				return undefined;
			}

			if (options.targetEvent) {
				options.origin = getBoundingClientRect(options.targetEvent.target, options.origin);
				options.originInteraction = $mdInteraction.getLastInteractionType();
			}
		}

		function stretchDialogContainerToViewport(container, options) {
			var isFixed = $window.getComputedStyle($document[0].body).position == 'fixed',
				backdrop = options.backdrop ? $window.getComputedStyle(options.backdrop[0]) : null,
				height = backdrop ? Math.min($document[0].body.clientHeight, Math.ceil(Math.abs(parseInt(backdrop.height, 10)))) : 0,
				previousStyles = {
					top: container.css('top'),
					height: container.css('height')
				},
				parentTop = Math.abs(options.parent[0].getBoundingClientRect().top);

			container.css({
				top: (isFixed ? parentTop : 0) + 'px',
				height: height ? height + 'px' : '100%'
			});

			return function () { container.css(previousStyles); };
		}

		function activateListeners(element, options) {
			var window = angular.element($window),
				onWindowResize = $mdUtil.debounce(
					function () {
						stretchDialogContainerToViewport(element, options);
					},
					60,
					null,
					false
				),
				removeListeners = [],
				smartClose = function () {
					var closeFn = (options.$type == 'alert') ? $mdDialog.hide : $mdDialog.cancel;
					$mdUtil.nextTick(closeFn, true);
				},
				parentTarget,
				keyHandlerFn,
				target,
				sourceElem,
				mousedownHandler,
				mouseupHandler;

			if (options.escapeToClose) {

				parentTarget = options.parent;
				keyHandlerFn = function (ev) {

					if (ev.keyCode === $mdConstant.KEY_CODE.ESCAPE) {
						ev.stopPropagation();
						ev.preventDefault();

						smartClose();
					}
				};

				// Add keydown listeners
				element.on('keydown', keyHandlerFn);
				parentTarget.on('keydown', keyHandlerFn);

				// Queue remove listeners function
				removeListeners.push(function() {

					element.off('keydown', keyHandlerFn);
					parentTarget.off('keydown', keyHandlerFn);

				});
			}

			// Register listener to update dialog on window resize
			window.on('resize', onWindowResize);

			removeListeners.push(function() {
				window.off('resize', onWindowResize);
			});

			if (options.clickOutsideToClose) {
				target = element;

				mousedownHandler = function (ev) {
					sourceElem = ev.target;
				};

				mouseupHandler = function (ev) {
					if (sourceElem === target[0] && ev.target === target[0]) {
						ev.stopPropagation();
						ev.preventDefault();

						smartClose();
					}
				};

				// Add listeners
				target.on('mousedown', mousedownHandler);
				target.on('mouseup', mouseupHandler);

				// Queue remove listeners function
				removeListeners.push(function() {
					target.off('mousedown', mousedownHandler);
					target.off('mouseup', mouseupHandler);
				});
			}

			// Attach specific `remove` listener handler
			options.deactivateListeners = function () {
				removeListeners.forEach(
					function (removeFn) { removeFn(); }
				);
				options.deactivateListeners = null;
			};
		}

		function showBackdrop(scope, element, options) {

			if (options.disableParentScroll) {
				 options.restoreScroll = $mdUtil.disableScrollAround(element, options.parent);
			}

			if (options.hasBackdrop) {
				options.backdrop = $mdUtil.createBackdrop(scope, "md-dialog-backdrop md-opaque");
				$animate.enter(options.backdrop, options.parent);
			}

			options.hideBackdrop = function hideBackdrop($destroy) {

				if (options.backdrop) {
					if ($destroy) options.backdrop.remove();
					else $animate.leave(options.backdrop);
				}

				if (options.disableParentScroll) {

					if (options.restoreScroll) { options.restoreScroll(); }

					delete options.restoreScroll;
				}

				options.hideBackdrop = null;
			};
		}

		function configureAria(element, options) {

			var role = (options.$type === 'alert') ? 'alertdialog' : 'dialog',
				dialogContent = element.find('md-dialog-content'),
				existingDialogId = element.attr('id'),
				dialogContentId = 'dialogContent_' + (existingDialogId || $mdUtil.nextUid()),
				focusHandler;

			element.attr({
				'role': role,
				'tabIndex': '-1'
			});

			if (dialogContent.length === 0) {
				dialogContent = element;
				// If the dialog element already had an ID, don't clobber it.
				if (existingDialogId) {
					dialogContentId = existingDialogId;
				}
			}

			dialogContent.attr('id', dialogContentId);
			element.attr('aria-describedby', dialogContentId);

			if (options.ariaLabel) {
				$mdAria.expect(element, 'aria-label', options.ariaLabel);
			} else {
				$mdAria.expectAsync(element, 'aria-label', function() {

					if (options.title) {
						return options.title;
					} else {
						var words = dialogContent.text().split(/\s+/);
						if (words.length > 3) words = words.slice(0, 3).concat('...');
						return words.join(' ');
					}
				});
			}

			topFocusTrap = document.createElement('div');
			topFocusTrap.classList.add('md-dialog-focus-trap');
			topFocusTrap.tabIndex = 0;

			bottomFocusTrap = topFocusTrap.cloneNode(false);

			focusHandler = function () {
				element.focus();
			};

			topFocusTrap.addEventListener('focus', focusHandler);
			bottomFocusTrap.addEventListener('focus', focusHandler);

			element[0].parentNode.insertBefore(topFocusTrap, element[0]);
			element.after(bottomFocusTrap);
		}

		function isNodeOneOf(elem, nodeTypeArray) {
			if (nodeTypeArray.indexOf(elem.nodeName) !== -1) {
				return true;
			}
		}
		
		function lockScreenReader(element, options) {
			var isHidden = true;

			function getParents(element) {
				var parents = [],
					children,
					i = 0;

				while (element.parentNode) {
					if (element === document.body) {
						return parents;
					}

					children = element.parentNode.children;

					for (i = 0; i < children.length; i += 1) {
						if (element !== children[i] && !isNodeOneOf(children[i], ['SCRIPT', 'STYLE']) && !children[i].hasAttribute('aria-live')) {
							parents.push(children[i]);
						}
					}

					element = element.parentNode;
				}

				return parents;
			}

			function walkDOM(element) {
				var elements = getParents(element),
					i = 0;

				for (i = 0; i < elements.length; i += 1) {
					elements[i].setAttribute('aria-hidden', isHidden);
				}
			}

			options.unlockScreenReader = function () {
				isHidden = false;
				walkDOM(element[0]);

				options.unlockScreenReader = null;
			};

			// get raw DOM node
			walkDOM(element[0]);
		}

		function dialogPopIn(container, options) {

			options.parent.append(container);
			options.reverseContainerStretch = stretchDialogContainerToViewport(container, options);

			var dialogEl = container.find('md-dialog'),
				animator = $$mdAnimate($mdUtil),
				buildTranslateToOrigin = animator.calculateZoomToOrigin,
				translateOptions = {
					transitionInClass: 'md-transition-in',
					transitionOutClass: 'md-transition-out'
				},
				from = animator.toTransformCss(buildTranslateToOrigin(dialogEl, options.openFrom || options.origin)),
				to = animator.toTransformCss(''); // defaults to center display (or parent or $rootElement)

			dialogEl.toggleClass('md-dialog-fullscreen', !!options.fullscreen);

			return animator
				.translate3d(dialogEl, from, to, translateOptions)
				.then(function (animateReversal) {

					options.reverseAnimate = function () {
						delete options.reverseAnimate;

						if (options.closeTo) {

							translateOptions = {
								transitionInClass: 'md-transition-out',
								transitionOutClass: 'md-transition-in'
							};

							from = to;
							to = animator.toTransformCss(buildTranslateToOrigin(dialogEl, options.closeTo));

							return animator
								.translate3d(dialogEl, from, to, translateOptions);
						}

						return animateReversal(
							to = animator.toTransformCss(
								buildTranslateToOrigin(dialogEl, options.origin)
							)
						);

					};

					options.clearAnimate = function () {
						delete options.clearAnimate;

						dialogEl.removeClass([
							translateOptions.transitionOutClass,
							translateOptions.transitionInClass
						].join(' '));

						return animator.translate3d(dialogEl, to, animator.toTransformCss(''), {});
					};

					return true;
				});
		}

		function onShow(scope, element, options) {

			angular.element($document[0].body).addClass('md-dialog-is-showing');

			var dialogElement = element.find('md-dialog'),
				message;

			 if (dialogElement.hasClass('ng-cloak')) {
				message = '$mdDialog: using `<md-dialog ng-cloak>` will affect the dialog opening animations.';
				$log.warn(message, element[0]);
			}

			captureParentAndFromToElements(options);
			configureAria(dialogElement, options);
			showBackdrop(scope, element, options);
			activateListeners(element, options);

			function warnDeprecatedActions() {
				if (element[0].querySelector('.md-actions')) {
					$log.warn('Using a class of md-actions is deprecated, please use <md-dialog-actions>.');
				}
			}

			function focusOnOpen() {
				if (options.focusOnOpen) {
					var target = $mdUtil.findFocusTarget(element) || findCloseButton() || dialogElement;
					target.focus();
				}

				function findCloseButton() {
					return element[0].querySelector('.dialog-close, md-dialog-actions button:last-child');
				}
			}

			return dialogPopIn(element, options).then(
					function () {
						lockScreenReader(element, options);
						warnDeprecatedActions();
						focusOnOpen();
					}
				);
		}

		return {
			hasBackdrop: true,
			isolateScope: true,
			onCompiling: beforeCompile,
			onShow: onShow,
			onShowing: beforeShow,
			onRemove: onRemove,
			clickOutsideToClose: false,
			escapeToClose: true,
			targetEvent: null,
			closeTo: null,
			openFrom: null,
			focusOnOpen: true,
			disableParentScroll: true,
			autoWrap: true,
			fullscreen: false,
			transformTemplate: function (template, options) {
				var startSymbol = $interpolate.startSymbol(),
					endSymbol = $interpolate.endSymbol(),
					theme = startSymbol + (options.themeWatch ? '' : '::') + 'theme' + endSymbol,
					themeAttr = (options.hasTheme) ? 'md-theme="' + theme + '"' : '';

				function validatedTemplate(template) {
					if (options.autoWrap && !/<\/md-dialog>/g.test(template)) {
						return '<md-dialog>' + (template || '') + '</md-dialog>';
					} else {
						return template || '';
					}
				}

				return '<div class="md-dialog-container" tabindex="-1" ' + themeAttr + '>' + validatedTemplate(template) + '</div>';
			}
		};
	}

	return $$interimElementProvider('$mdDialog')
		.setDefaults({
			methods: ['disableParentScroll', 'hasBackdrop', 'clickOutsideToClose', 'escapeToClose', 'targetEvent', 'closeTo', 'openFrom', 'parent', 'fullscreen', 'multiple'],
			options: ["$mdDialog", "$mdAria", "$mdUtil", "$$mdAnimate", "$mdConstant", "$animate", "$document", "$window", "$rootElement", "$log", "$injector", "$mdTheming", "$interpolate", "$mdInteraction", dialogDefaultOptions]
		})
		.addPreset('alert', {
			methods: ['title', 'htmlContent', 'textContent', 'content', 'ariaLabel', 'ok', 'theme', 'css'],
			options: advancedDialogOptions
		})
		.addPreset('confirm', {
			methods: ['title', 'htmlContent', 'textContent', 'content', 'ariaLabel', 'ok', 'cancel', 'theme', 'css'],
			options: advancedDialogOptions
		})
		.addPreset('prompt', {
			methods: ['title', 'htmlContent', 'textContent', 'initialValue', 'content', 'placeholder', 'ariaLabel', 'ok', 'cancel', 'theme', 'css', 'required'],
			options: advancedDialogOptions
		});
}


angular.module(
	'ng.material.ui.dialog',
	[
		'ng',
		'ng.material.core',
		'ng.material.core.theming',
		'ng.material.core.interim',
		'ng.material.ui.aria',
		'ng.material.ui.backdrop',
		'ng.material.ui.interaction'
	]
).directive(
	'mdDialog',
	["$$rAF", "$mdTheming", "$mdDialog", MdDialogDirective]
).provider(
	'$mdDialog',
	["$$interimElementProvider", MdDialogProvider]
).directive(
    'mdDialogContent',
    angular.restrictEDir
).directive(
    'mdDialogActions',
    angular.restrictEDir
);
