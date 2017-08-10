/**
 * @ngdoc module
 * @name material.components.toast
 * @description
 * Toast
 */

/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.v111.ui.toast");
msos.require("ng.material.v111.core");
msos.require("ng.material.v111.core.media");

ng.material.v111.ui.toast.version = new msos.set_version(16, 12, 28);


function MdToastDirective($mdToast) {
    "use strict";

    return {
        restrict: 'E',
        link: function postLink(scope, element) {
            element.addClass('_md'); // private md component indicator for styling

            // When navigation force destroys an interimElement, then
            // listen and $destroy() that interim instance...
            scope.$on(
                '$destroy',
                function () {
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

    function toastDefaultOptions($animate, $mdToast, $mdUtil, $mdMedia) {
        var SWIPE_EVENTS = '$md.swipeleft $md.swiperight $md.swipeup $md.swipedown';

        function toastOpenClass(position) {
            // For mobile, always open full-width on bottom
            if (!$mdMedia('gt-xs')) {
                return 'md-toast-open-bottom';
            }

            return 'md-toast-open-' +
                (position.indexOf('top') > -1 ? 'top' : 'bottom');
        }

        function onShow(scope_na, element, options) {

            activeToastContent = options.textContent || options.content; // support deprecated #content method

            var isSmScreen = !$mdMedia('gt-sm');

            element = $mdUtil.extractElementByName(element, 'md-toast', true);
            options.element = element;

            options.onSwipe = function (ev) {
                //Add the relevant swipe class to the element so it can animate correctly
                var swipe = ev.type.replace('$md.', ''),
                    direction = swipe.replace('swipe', '');

                // If the swipe direction is down/up but the toast came from top/bottom don't fade away
                // Unless the screen is small, then the toast always on bottom
                if ((direction === 'down' && options.position.indexOf('top') !== -1 && !isSmScreen) ||
                    (direction === 'up' && (options.position.indexOf('bottom') !== -1 || isSmScreen))) {
                    return;
                }

                if ((direction === 'left' || direction === 'right') && isSmScreen) {
                    return;
                }

                element.addClass('md-' + swipe);
                $mdUtil.nextTick($mdToast.cancel);
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
                    // Root element of template will be <md-toast>. We need to wrap all of its content inside of
                    // of <div class="md-toast-content">. All templates provided here should be static, developer-controlled
                    // content (meaning we're not attempting to guard against XSS).
                    templateRoot = document.createElement('md-template');
                    templateRoot.innerHTML = template;

                    // Iterate through all root children, to detect possible md-toast directives.
                    for (i = 0; i < templateRoot.children.length; i += 1) {
                        if (templateRoot.children[i].nodeName === 'MD-TOAST') {
                            wrapper = angular.element('<div class="md-toast-content">');

                            // Wrap the children of the `md-toast` directive in jqLite, to be able to append multiple
                            // nodes with the same execution.
                            wrapper.append(angular.element(templateRoot.children[i].childNodes));

                            // Append the new wrapped element to the `md-toast` directive.
                            templateRoot.children[i].appendChild(wrapper[0]);
                        }
                    }

                    // We have to return the innerHTMl, because we do not want to have the `md-template` element to be
                    // the root element of our interimElement.
                    return templateRoot.innerHTML;
                }

                return template || '';
            }
        };
    }

    toastDefaultOptions.$inject = ['$animate', '$mdToast', '$mdUtil', '$mdMedia'];


    $mdToast = $$interimElementProvider('$mdToast').setDefaults({
        methods: ['position', 'hideDelay', 'capsule', 'parent', 'position', 'toastClass'],
        options: toastDefaultOptions
    }).addPreset(
        'simple',
        {
            argOption: 'textContent',
            methods: ['textContent', 'content', 'action', 'highlightAction', 'highlightClass', 'theme', 'parent'],
            options: ['$mdToast', '$mdTheming', function ($mdToast, $mdTheming) {
                return {
                    template: '<md-toast md-theme="{{ toast.theme }}" ng-class="{\'md-capsule\': toast.capsule}">' +
                        '  <div class="md-toast-content">' +
                        '    <span class="md-toast-text" role="alert" aria-relevant="all" aria-atomic="true">' +
                        '      {{ toast.content }}' +
                        '    </span>' +
                        '    <md-button class="md-action" ng-if="toast.action" ng-click="toast.resolve()" ' +
                        '        ng-class="highlightClasses">' +
                        '      {{ toast.action }}' +
                        '    </md-button>' +
                        '  </div>' +
                        '</md-toast>',
                    controller: /* @ngInject */ function mdToastCtrl($scope) {
                        var self = this;

                        if (self.highlightAction) {
                            $scope.highlightClasses = [
                                'md-highlight',
                                self.highlightClass
                            ];
                        }

                        $scope.$watch(function () {
                            return activeToastContent;
                        }, function () {
                            self.content = activeToastContent;
                        });

                        this.resolve = function () {
                            $mdToast.hide(ACTION_RESOLVE);
                        };
                    },
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
    'ng.material.v111.ui.toast',
    [
        'ng',
        'ng.material.v111.core',
        'ng.material.v111.core.media'
    ]
).directive(
    'mdToast',
    ['$mdToast', MdToastDirective]
).provider(
    '$mdToast',
    ['$$interimElementProvider', MdToastProvider]
);
