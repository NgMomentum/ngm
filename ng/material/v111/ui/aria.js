
/**
 * @ngdoc module
 * @name material.core.aria
 * @description
 * Aria Expectations for ngMaterial components.
 */

/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false,
    NodeFilter: false
*/

msos.provide("ng.material.v111.ui.aria");

ng.material.v111.ui.aria.version = new msos.set_version(16, 12, 23);


function MdAriaProvider() {
    "use strict";

    return {
        $get: ['$$rAF', '$window', '$interpolate', function ($$rAF, $window, $interpolate) {

            var temp_map = 'ng.material.v111.ui.aria - MdAriaProvider - $get -> ';

            msos.console.debug(temp_map + 'start, $interpolate:', $interpolate);

            function childHasAttribute(node, attrName) {
                var hasChildren = node.hasChildNodes(),
                    children,
                    child,
                    i = 0,
                    hasAttr = false;

                function isHidden(el) {
                    var style = el.currentStyle || $window.getComputedStyle(el);

                    return (style.display === 'none');
                }

                if (hasChildren) {
                    children = node.childNodes;

                    for (i = 0; i < children.length; i += 1) {
                        child = children[i];

                        if (child.nodeType === 1 && child.hasAttribute(attrName)) {
                            if (!isHidden(child)) { hasAttr = true; }
                        }
                    }
                }

                return hasAttr;
            }

            function expect(element, attrName, defaultValue) {

                var node = angular.element(element)[0] || element;

                // if node exists and neither it nor its children have the attribute
                if (node
                 && ((!node.hasAttribute(attrName) || node.getAttribute(attrName).length === 0)
                 && !childHasAttribute(node, attrName))) {

                    defaultValue = _.isString(defaultValue) ? defaultValue.trim() : '';

                    if (defaultValue.length) {
                        element.attr(attrName, defaultValue);
                    } else if (msos.config.verbose) {
                        msos.console.warn(temp_map + 'required attribute for accessibility: ' + attrName + ', is missing on node:', node);
                    }
                }
            }

            function expectAsync(element, attrName, defaultValueGetter) {
                $$rAF(
                    function () { expect(element, attrName, defaultValueGetter()); }
                );
            }

            function getText(element) {

                element = element[0] || element;

                var walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false),
                    text = '',
                    node;

                function isAriaHiddenNode(node) {
                    while (node.parentNode && node.parentNode !== element) {
                        node = node.parentNode;

                        if (node.getAttribute && node.getAttribute('aria-hidden') === 'true') {
                            return true;
                        }
                    }

                    return undefined;
                }

                node = walker.nextNode();

                while (node) {
                    if (!isAriaHiddenNode(node)) {
                        text += node.textContent;
                    }
                    node = walker.nextNode();
                }

                return text.trim() || '';
            }

            function expectWithText(element, attrName) {
                var content = getText(element) || '',
                    hasBinding = content.indexOf($interpolate.startSymbol()) > -1;

                if (hasBinding) {
                    expectAsync(
                        element,
                        attrName,
                        function () {
                            return getText(element);
                        }
                    );
                } else {
                    expect(
                        element,
                        attrName,
                        content
                    );
                }
            }

            function expectWithoutText(element, attrName) {
                var content = getText(element) || '',
                    hasBinding = content.indexOf($interpolate.startSymbol()) > -1;
        
                if (!hasBinding && !content) {
                    expect(element, attrName, content);
                }
            }

            msos.console.debug(temp_map + 'done!');

            return {
                expect: expect,
                expectAsync: expectAsync,
                expectWithText: expectWithText,
                expectWithoutText: expectWithoutText
            };
        }]
    };
}

angular.module(
    'ng.material.v111.ui.aria',
    ['ng']
).provider(
    '$mdAria',
    MdAriaProvider
);
