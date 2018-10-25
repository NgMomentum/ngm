
/**
 * @ngdoc module
 * @name material.components.toast
 * @description
 * Toast
 */

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.toast");
msos.require("ng.material.core.media");
msos.require("ng.material.core.theming");
msos.require("ng.material.core.interim");
msos.require("ng.material.ui.button");		// ref. template

ng.material.ui.toast.version = new msos.set_version(18, 4, 14);

// Load AngularJS-Material module specific CSS
ng.material.ui.toast.css = new msos.loader();
ng.material.ui.toast.css.load(msos.resource_url('ng', 'material/css/ui/toast.css'));


function MdToastDirective($mdToast) {
    "use strict";

    return {
        restrict: 'E',
        link: function postLink(scope, element) {

			msos.console.debug('ng.material.ui.toast - MdToastDirective - link -> called.');

            element.addClass('_md'); // private md component indicator for styling

            scope.$on(
                '$destroy',
                function ng_md_ui_toast_dir_link_on() {
                    $mdToast.destroy();
                }
            );
        }
    };
}

function MdToastProvider($$interimElementProvider) {
    "use strict";

    // Differentiate promise resolves: hide timeout (value == true) and hide action clicks (value == ok).
    var ACTION_RESOLVE = 'ok',
        activeToastContent,
        $mdToast;

    function updateTextContent(newContent) {
        activeToastContent = newContent;
    }

	function MdToastController($mdToast, $scope) {

		this.$onInit = function () {
			var self = this;

			if (self.highlightAction) {
				$scope.highlightClasses = ['md-highlight', self.highlightClass];
			}

			$scope.$watch(
				function () { return activeToastContent; },
				function () { self.content = activeToastContent; }
			);

			this.resolve = function () {
				$mdToast.hide(ACTION_RESOLVE);
			};
		};
	}

    function toastDefaultOptions($animate, $mdToast, $mdUtil, $mdMedia) {
        var SWIPE_EVENTS = '$md.swipeleft $md.swiperight $md.swipeup $md.swipedown';

        function toastOpenClass(position) {
            // For mobile, always open full-width on bottom
            if (!$mdMedia('gt-xs')) {
                return 'md-toast-open-bottom';
            }

            return 'md-toast-open-' + (position.indexOf('top') > -1 ? 'top' : 'bottom');
        }

        function onShow(scope_na, element, options) {

			msos.console.debug('ng.material.ui.toast - MdToastProvider - toastDefaultOptions - onShow -> called.');

            activeToastContent = options.textContent || options.content; // support deprecated #content method

            var isSmScreen = !$mdMedia('gt-sm');

            element = $mdUtil.extractElementByName(element, 'md-toast', true);
            options.element = element;

            options.onSwipe = function (ev) {
                //Add the relevant swipe class to the element so it can animate correctly
                var swipe = ev.type.replace('$md.', ''),
                    direction = swipe.replace('swipe', '');

                if ((direction === 'down' && options.position.indexOf('top') !== -1 && !isSmScreen) ||
                    (direction === 'up' && (options.position.indexOf('bottom') !== -1 || isSmScreen))) {
                    return;
                }

                if ((direction === 'left' || direction === 'right') && isSmScreen) {
                    return;
                }

                element.addClass('md-' + swipe);

                $mdUtil.nextTick(
					$mdToast.cancel,
					false	// nextTick was undefined (default true)
				);
            };

            options.openClass = toastOpenClass(options.position);

            element.addClass(options.toastClass);

            // 'top left' -> 'md-top md-left'
            options.parent.addClass(options.openClass);

            // static is the default position
            if ($mdUtil.hasComputedStyle(options.parent, 'position', 'static')) {
                options.parent.css('position', 'relative');
            }

            element.on(SWIPE_EVENTS, options.onSwipe);
            element.addClass(isSmScreen ? 'md-bottom' : options.position.split(' ').map(function (pos) {
                return 'md-' + pos;
            }).join(' '));

            if (options.parent) { options.parent.addClass('md-toast-animating'); }

            return $animate.enter(element, options.parent).then(
                function () {
                    if (options.parent) { options.parent.removeClass('md-toast-animating'); }
                }
            );
        }

        function onRemove(scope_na, element, options) {

			msos.console.debug('ng.material.ui.toast - MdToastProvider - toastDefaultOptions - onRemove -> called.');

            element.off(SWIPE_EVENTS, options.onSwipe);

            if (options.parent)     { options.parent.addClass('md-toast-animating'); }
            if (options.openClass)  { options.parent.removeClass(options.openClass); }

            return ((options.$destroy === true) ? element.remove() : $animate.leave(element))
                .then(function () {
                    if (options.parent) { options.parent.removeClass('md-toast-animating'); }
                    if ($mdUtil.hasComputedStyle(options.parent, 'position', 'static')) {
                        options.parent.css('position', '');
                    }
                });
        }

        return {
            onShow: onShow,
            onRemove: onRemove,
            toastClass: '',
            position: 'bottom left',
            themable: true,
            hideDelay: 3000,
            autoWrap: true,
            transformTemplate: function (template, options) {
                var shouldAddWrapper = options.autoWrap && template && !/md-toast-content/g.test(template),
                    templateRoot,
                    i = 0,
                    wrapper;

                if (shouldAddWrapper) {

                    templateRoot = document.createElement('md-template');
                    templateRoot.innerHTML = template;

                    for (i = 0; i < templateRoot.children.length; i += 1) {
                        if (templateRoot.children[i].nodeName === 'MD-TOAST') {
                            wrapper = angular.element('<div class="md-toast-content">');

                            wrapper.append(angular.element(templateRoot.children[i].childNodes));

                            templateRoot.children[i].appendChild(wrapper[0]);
                        }
                    }

                    return templateRoot.innerHTML;
                }

                return template || '';
            }
        };
    }

    toastDefaultOptions.$inject = ['$animate', '$mdToast', '$mdUtil', '$mdMedia'];


    $mdToast = $$interimElementProvider('$mdToast').setDefaults(
			{
				methods: ['position', 'hideDelay', 'capsule', 'parent', 'position', 'toastClass'],
				options: toastDefaultOptions
			}
		).addPreset(
			'simple',
			{
				argOption: 'textContent',
				methods: ['textContent', 'content', 'action', 'highlightAction', 'highlightClass', 'theme', 'parent'],
				options: ['$mdToast', '$mdTheming', function ($mdToast, $mdTheming) {
					return {
						template:
							'<md-toast md-theme="{{ toast.theme }}" ng-class="{\'md-capsule\': toast.capsule}">' +
								'<div class="md-toast-content">' +
									'<span class="md-toast-text" role="alert" aria-relevant="all" aria-atomic="true">' +
										'{{ toast.content }}' +
									'</span>' +
									'<md-button class="md-action" ng-if="toast.action" ng-click="toast.resolve()" ' +
										'ng-class="highlightClasses">' +
										'{{ toast.action }}' +
									'</md-button>' +
								'</div>' +
							'</md-toast>',
						controller: ["$mdToast", "$scope", MdToastController],
						theme: $mdTheming.defaultTheme(),
						controllerAs: 'toast',
						bindToController: true
					};
				}]
			}
		).addMethod(
			'updateTextContent',
			updateTextContent
		).addMethod(
			'updateContent',
			updateTextContent
		);

    return $mdToast;
}


angular.module(
    'ng.material.ui.toast',
    [
        'ng',
        'ng.material.core',
        'ng.material.core.media',
		'ng.material.core.interim',
		'ng.material.core.theming'
    ]
).directive(
    'mdToast',
    ['$mdToast', MdToastDirective]
).provider(
    '$mdToast',
    ['$$interimElementProvider', MdToastProvider]
);
