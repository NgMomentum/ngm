/*
 * @license AngularJS v1.5.2
 * (c) 2010-2016 Google, Inc. http://angularjs.org
 * License: MIT
 * 
 * Just the original $AnchorScrollProvider code from Angular, but in a seperate file
 */

/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false
*/

msos.provide("ng.util.anchorscroll");


function $AnchorScrollProvider() {
    "use strict";

    this.$get = ['$window', '$location', '$rootScope', function ($window, $location, $rootScope) {
        var temp_asg = 'ng/util/anchorscroll - $AnchorScrollProvider - $get';

        function getFirstAnchor(list) {
            var result = null;

            Array.prototype.some.call(
                list,
                function (element) {
                    var node_name = angular.lowercase(element.nodeName || (element[0] && element[0].nodeName));

                    if (node_name === 'a') {
                        result = element;
                        return true;
                    }
                    return false;
                }
            );
            return result;
        }

        function scroll(hash) {
            hash = _.isString(hash) ? hash : $location.hash();

            var ng_win_doc = $window.document,
                elm;

            msos.console.debug(temp_asg + ' - scroll -> called, hash: ' + (hash || 'na'));

            function getYOffset() {

                var offset = scroll.yOffset,
                    elem,
                    style;

                if (_.isFunction(offset)) {
                    offset = offset();
                } else if (angular.isElement(offset)) {
                    elem = offset[0];
                    style = $window.getComputedStyle(elem);

                    if (style.position !== 'fixed') {
                        offset = 0;
                    } else {
                        offset = elem.getBoundingClientRect().bottom;
                    }
                } else if (!_.isNumber(offset)) {
                    offset = 0;
                }

                return offset;
            }

            function scrollTo(elem) {
                var offset,
                    elemTop;

                if (elem) {
                    elem.scrollIntoView();

                    offset = getYOffset();

                    if (offset) {
                        elemTop = elem.getBoundingClientRect().top;
                        $window.scrollBy(0, elemTop - offset);
                    }

                } else {
                    $window.scrollTo(0, 0);
                }
            }

            // Start scroll execution

            if (!hash || hash === 'top') {
                scrollTo(null);
                return;
            }

            elm = ng_win_doc.getElementById(hash) || getFirstAnchor(document.getElementsByName(hash));

            if (elm) { scrollTo(elm); }
        }

        scroll.prototype.yOffset = 0;

        $rootScope.$watch(
            function autoScrollWatch() {
                var loc_hash = $location.hash();
                msos.console.debug(temp_asg + ' - autoScrollWatch -> called,\n     hash: ' + (loc_hash || 'na'));
                return loc_hash;
            },
            function autoScrollWatchAction(newVal, oldVal) {
                msos.console.debug(temp_asg + ' - autoScrollWatchAction -> start.');
                // skip the initial scroll if $location.hash is empty
                if (newVal === oldVal && newVal === '') { return; }

                // Since we only "bootstrap" after page load,
                // we don't need the "jqLiteDocumentLoaded" stuff
                $rootScope.$evalAsync(scroll, { directive_name: 'AnchorScrollProvider' });

                msos.console.debug(temp_asg + ' - autoScrollWatchAction ->  done!');
            }
        );

        return scroll;
    }];
}

angular.module('ng.util.anchorscroll', ['ng']).provider('$anchorScroll', $AnchorScrollProvider);
