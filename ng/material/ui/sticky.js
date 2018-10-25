
/**
 * @ngdoc module
 * @name material.components.sticky
 * @description
 * Sticky effects for md
 *
 */

/*global
    msos: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.sticky");
msos.require("ng.material.ui.content");

ng.material.ui.sticky.version = new msos.set_version(18, 3, 29);

// Load AngularJS-Material module specific CSS
ng.material.ui.sticky.css = new msos.loader();
ng.material.ui.sticky.css.load(msos.resource_url('ng', 'material/css/ui/sticky.css'));


function MdSticky($mdConstant, $mdUtil, $compile) {
    "use strict";

    var browserStickySupport = $mdUtil.checkStickySupport();

    function setupSticky(contentCtrl) {
        var contentEl = contentCtrl.$element,
            debouncedRefreshElements,
            self;

        function translate(item, amount) {
            if (!item) { return; }

            if (amount === null || amount === undefined) {
                if (item.translateY) {
                    item.translateY = null;
                    item.clone.css($mdConstant.CSS.TRANSFORM, '');
                }
            } else {
                item.translateY = amount;

                $mdUtil.bidi(
                    item.clone,
                    $mdConstant.CSS.TRANSFORM,
                    'translate3d(' + item.left + 'px,' + amount + 'px,0)',
                    'translateY(' + amount + 'px)'
                );
            }
        }

        function setStickyState(item, state) {

            if (!item || item.state === state) { return; }

            if (item.state) {
                item.clone.attr('sticky-prev-state', item.state);
                item.element.attr('sticky-prev-state', item.state);
            }

            item.clone.attr('sticky-state', state);
            item.element.attr('sticky-state', state);
            item.state = state;
        }

        function setCurrentItem(item) {
            var index;

            if (self.current === item) { return; }

            // Deactivate currently active item
            if (self.current) {
                translate(self.current, null);
                setStickyState(self.current, null);
            }

            // Activate new item if given
            if (item) {
                setStickyState(item, 'active');
            }

            self.current = item;
            index = self.items.indexOf(item);

            // If index === -1, index + 1 = 0. It works out.
            self.next = self.items[index + 1];
            self.prev = self.items[index - 1];
            setStickyState(self.next, 'next');
            setStickyState(self.prev, 'prev');
        }

        function refreshPosition(item) {
            var current = item.element[0],
                defaultVal;

            item.top = 0;
            item.left = 0;
            item.right = 0;

            while (current && current !== contentEl[0]) {

                item.top += current.offsetTop;
                item.left += current.offsetLeft;

                if (current.offsetParent) {
                    item.right += current.offsetParent.offsetWidth - current.offsetWidth - current.offsetLeft; // Compute offsetRight
                }

                current = current.offsetParent;
            }

            item.height = item.element.prop('offsetHeight');

            defaultVal = $mdUtil.floatingScrollbars() ? '0' : undefined;

            $mdUtil.bidi(item.clone, 'margin-left',     item.left,  defaultVal);
            $mdUtil.bidi(item.clone, 'margin-right',    defaultVal, item.right);
        }

        function refreshElements() {

            self.items.forEach(refreshPosition);

            self.items = self.items.sort(function (a, b) {
                return a.top < b.top ? -1 : 1;
            });

            var item,
                currentScrollTop = contentEl.prop('scrollTop'),
                i = 0;

            for (i = self.items.length - 1; i >= 0; i -= 1) {
                if (currentScrollTop > self.items[i].top) {
                    item = self.items[i];
                    break;
                }
            }

            setCurrentItem(item);
        }

        // As we scroll, push in and select the correct sticky element.
        function onScroll() {
            var scrollTop = contentEl.prop('scrollTop'),
                isScrollingDown = scrollTop > (onScroll.prevScrollTop || 0);

            // Store the previous scroll so we know which direction we are scrolling
            onScroll.prevScrollTop = scrollTop;

            if (scrollTop === 0) {
                // If we're at the top, just clear the current item and return
                setCurrentItem(null);
                return;
            }

            if (isScrollingDown) {

                if (self.next && self.next.top <= scrollTop) {
                    setCurrentItem(self.next);
                    return;
                }

                if (self.current && self.next && self.next.top - scrollTop <= self.next.height) {
                    translate(self.current, scrollTop + (self.next.top - self.next.height - scrollTop));
                    return;
                }
            }

            if (!isScrollingDown) {

                if (self.current && self.prev && scrollTop < self.current.top) {
                    setCurrentItem(self.prev);
                    return;
                }

                if (self.next && self.current && (scrollTop >= (self.next.top - self.current.height))) {
                    translate(self.current, scrollTop + (self.next.top - scrollTop - self.current.height));
                    return;
                }
            }

            if (self.current) {
                translate(self.current, scrollTop);
            }
        }

        function setupAugmentedScrollEvents(element) {
            var SCROLL_END_DELAY = 200,
                isScrolling,
                lastScrollTime;

            function loopScrollEvent() {
                if (+$mdUtil.now() - lastScrollTime > SCROLL_END_DELAY) {
                    isScrolling = false;
                    element.triggerHandler('$scrollend');
                } else {
                    element.triggerHandler('$scroll');
                    _.throttle(loopScrollEvent, 100);
                }
            }

            element.on('scroll touchmove', function () {
                if (!isScrolling) {
                    isScrolling = true;
                    _.throttle(loopScrollEvent, 100);
                    element.triggerHandler('$scrollstart');
                }

                element.triggerHandler('$scroll');
                lastScrollTime = +$mdUtil.now();
            });
        }

        debouncedRefreshElements = _.throttle(refreshElements, 100);
        setupAugmentedScrollEvents(contentEl);
        contentEl.on('$scrollstart', debouncedRefreshElements);
        contentEl.on('$scroll', onScroll);

        function add(element, stickyClone) {

            stickyClone.addClass('md-sticky-clone');

            var item = {
                element: element,
                clone: stickyClone
            };

            self.items.push(item);

            $mdUtil.nextTick(
				function () {
					contentEl.prepend(item.clone);
				},
				false	// nextTick was undefined (default true)
			);

            debouncedRefreshElements();

            return function remove() {
                self.items.forEach(function (item, index) {
                    if (item.element[0] === element[0]) {
                        self.items.splice(index, 1);
                        item.clone.remove();
                    }
                });
                debouncedRefreshElements();
            };
        }

        self = {
            prev: null,
            current: null,      // the currently stickied item
            next: null,
            items: [],
            add: add,
            refreshElements: refreshElements
        };

        return self;
    }

    return function registerStickyElement(scope, element, stickyClone) {
        var contentCtrl = element.controller('mdContent'),
            $$sticky,
            cloneElement,
            deregister;

        if (!contentCtrl) { return; }

        if (browserStickySupport) {
            element.css({
                position: browserStickySupport,
                top: 0,
                'z-index': 2
            });
        } else {

            $$sticky = contentCtrl.$element.data('$$sticky');

            if (!$$sticky) {
                $$sticky = setupSticky(contentCtrl);
                contentCtrl.$element.data('$$sticky', $$sticky);
            }

            // Compile our cloned element, when cloned in this service, into the given scope.
            cloneElement = stickyClone || $compile(element.clone())(scope);

            deregister = $$sticky.add(element, cloneElement);
            scope.$on('$destroy', deregister);
        }
    };
}


angular.module(
    'ng.material.ui.sticky',
    [
        'ng',
        'ng.material.core',
        'ng.material.ui.content'   // see registerStickyElement
    ]
).factory(
    '$mdSticky',
    ["$mdConstant", "$mdUtil", "$compile", MdSticky]
);
