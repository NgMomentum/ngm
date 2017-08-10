
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.v111.ui.layout");
msos.require("ng.material.v111.core");

ng.material.v111.ui.layout.version = new msos.set_version(17, 1, 7);


(function () {
    "use strict";

    var layout_module,
        $mdUtil,
        $interpolate,
        $log,
        SUFFIXES = /(-gt)?-(sm|md|lg|print)/g,
        WHITESPACE = /\s+/g,
        FLEX_OPTIONS = ['grow', 'initial', 'auto', 'none', 'noshrink', 'nogrow'],
        LAYOUT_OPTIONS = ['row', 'column'],
        ALIGNMENT_MAIN_AXIS = ["", "start", "center", "end", "stretch", "space-around", "space-between"],
        ALIGNMENT_CROSS_AXIS = ["", "start", "center", "end", "stretch"],
        enabled = true;

    function detectDisabledLayouts() {
        var isDisabled = !!document.querySelector('[md-layouts-disabled]');
        enabled = !isDisabled;
    }

    function disableLayoutDirective() {
        // Return a 1x-only, first-match attribute directive
        enabled = false;

        return {
            restrict: 'A',
            priority: '900'
        };
    }

    function buildCloakInterceptor(className) {
        return ['$timeout', function ($timeout) {
            return {
                restrict: 'A',
                priority: -10, // run after normal ng-cloak
                compile: function (element) {

                    if (!enabled) { return angular.noop; }

                    // Re-add the cloak
                    element.addClass(className);

                    return function (scope_na, element) {
                        // Wait while layout injectors configure, then uncloak
                        // NOTE: $rAF does not delay enough... and this is a 1x-only event,
                        //       $timeout is acceptable.
                        $timeout(function () {
                            element.removeClass(className);
                        }, 10, false);
                    };
                }
            };
        }];
    }

    function validateAttributeUsage(className, attr_na, element, $log) {
        var find_flex,
            message,
            usage,
            url,
            nodeName = element[0].nodeName.toLowerCase();

        find_flex = className.replace(SUFFIXES, "");

        if (find_flex === 'flex') {
            if ((nodeName === "md-button") || (nodeName === "fieldset")) {

                usage = "<" + nodeName + " " + className + "></" + nodeName + ">";
                url = "https://github.com/philipwalton/flexbugs#9-some-html-elements-cant-be-flex-containers";
                message = "Markup '{0}' may not work as expected in some (IE?) browsers.\n     Consult '{1}' for details.";

                $log.warn('ng.material.v111.ui.layout - validateAttributeUsage -> ' + $mdUtil.supplant(message, [usage, url]));
            }
        }
    }

    function needsInterpolation(value) {
        return (value || "").indexOf($interpolate.startSymbol()) > -1;
    }

    function extractAlignAxis(attrValue) {
        var axis = {
                main: "start",
                cross: "stretch"
            },
            values;

        attrValue = (attrValue || "");

        if (attrValue.indexOf("-") === 0 || attrValue.indexOf(" ") === 0) {
            // For missing main-axis values
            attrValue = "none" + attrValue;
        }

        values = attrValue.toLowerCase().trim().replace(WHITESPACE, "-").split("-");
        if (values.length && (values[0] === "space")) {
            // for main-axis values of "space-around" or "space-between"
            values = [values[0] + "-" + values[1], values[2]];
        }

        if (values.length > 0) { axis.main = values[0]  || axis.main; }
        if (values.length > 1) { axis.cross = values[1] || axis.cross; }

        if (ALIGNMENT_MAIN_AXIS.indexOf(axis.main) < 0)     { axis.main = "start"; }
        if (ALIGNMENT_CROSS_AXIS.indexOf(axis.cross) < 0)   { axis.cross = "stretch"; }

        return axis;
    }

    function findIn(item, list, replaceWith) {

        item = replaceWith && item ? item.replace(WHITESPACE, replaceWith) : item;

        var found = false;

        if (item) {
            list.forEach(function (it) {
                it = replaceWith ? it.replace(WHITESPACE, replaceWith) : it;
                found = found || (it === item);
            });
        }
        return found;
    }

    function validateAttributeValue(className, value, updateFn) {
        var origValue = value,
            axis;

        if (!needsInterpolation(value)) {
            switch (className.replace(SUFFIXES, "")) {
                case 'layout':
                    if (!findIn(value, LAYOUT_OPTIONS)) {
                        value = LAYOUT_OPTIONS[0]; // 'row';
                    }
                    break;

                case 'flex':
                    if (!findIn(value, FLEX_OPTIONS)) {
                        if (isNaN(value)) {
                            value = '';
                        }
                    }
                    break;

                case 'flex-offset':
                case 'flex-order':
                    if (!value || isNaN(+value)) {
                        value = '0';
                    }
                    break;

                case 'layout-align':
                    axis = extractAlignAxis(value);
                    value = $mdUtil.supplant("{main}-{cross}", axis);
                    break;

                case 'layout-padding':
                case 'layout-margin':
                case 'layout-fill':
                case 'layout-wrap':
                case 'layout-nowrap':
                    value = '';
                    break;
            }

            if (value !== origValue) {
                if (_.isFunction(updateFn)) { updateFn(value); }
            }
        }

        return value;
    }

    function buildUpdateFn(element_na, className, attrs) {

        return function updateAttrValue(fallback) {
            if (!needsInterpolation(fallback)) {
                // Do not modify the element's attribute value; so
                // uses '<ui-layout layout="/api/sidebar.html" />' will not
                // be affected. Just update the attrs value.
                attrs[attrs.$normalize(className)] = fallback;
            }
        };
    }

    function getNormalizedAttrValue(className, attrs, defaultVal) {
        var normalizedAttr = attrs.$normalize(className);
        return attrs[normalizedAttr] ? attrs[normalizedAttr].replace(WHITESPACE, "-") : defaultVal || null;
    }

    function updateClassWithValue(element, className) {
        var lastClass;

        return function updateClassFn(newValue) {
            var value = validateAttributeValue(className, newValue || "");
            if (angular.isDefined(value)) {
                if (lastClass) { element.removeClass(lastClass); }
                lastClass = !value ? className : className + "-" + value.replace(WHITESPACE, "-");
                element.addClass(lastClass);
            }
        };
    }

    function attributeWithObserve(className) {

        function translateWithValueToCssClass(scope, element, attrs) {
            var updateFn = updateClassWithValue(element, className, attrs),
                unwatch = attrs.$observe(attrs.$normalize(className), updateFn);

            updateFn(getNormalizedAttrValue(className, attrs, ""));

            scope.$on(
                "$destroy",
                function () {
                    unwatch();
                }
            );
        }

        return ['$mdUtil', '$interpolate', "$log", function (_$mdUtil_, _$interpolate_, _$log_) {
            $mdUtil = _$mdUtil_;
            $interpolate = _$interpolate_;
            $log = _$log_;

            return {
                restrict: 'A',
                compile: function (element, attr) {
                    var linkFn;

                    if (enabled) {
                        // immediately replace static (non-interpolated) invalid values...

                        validateAttributeUsage(className, attr, element, $log);

                        validateAttributeValue(className,
                            getNormalizedAttrValue(className, attr, ""),
                            buildUpdateFn(element, className, attr)
                        );

                        linkFn = translateWithValueToCssClass;
                    }

                    // Use for postLink to account for transforms after ng-transclude.
                    return linkFn || angular.noop;
                }
            };
        }];
    }

    function attributeWithoutValue(className) {

        function translateToCssClass(scope_na, element) {
            element.addClass(className);
        }

        return ['$mdUtil', '$interpolate', "$log", function (_$mdUtil_, _$interpolate_, _$log_) {
            $mdUtil = _$mdUtil_;
            $interpolate = _$interpolate_;
            $log = _$log_;

            return {
                restrict: 'A',
                compile: function (element, attr) {
                    var linkFn;

                    if (enabled) {
                        // immediately replace static (non-interpolated) invalid values...

                        validateAttributeValue(className,
                            getNormalizedAttrValue(className, attr, ""),
                            buildUpdateFn(element, className, attr)
                        );

                        translateToCssClass(null, element);

                        // Use for postLink to account for transforms after ng-transclude.
                        linkFn = translateToCssClass;
                    }

                    return linkFn || angular.noop;
                }
            };
        }];
    }

    function registerLayoutAPI(reg_api_module) {
        var PREFIX_REGEXP = /^((?:x|data)[\:\-_])/i,
            SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g,
            BREAKPOINTS = ["", "xs", "gt-xs", "sm", "gt-sm", "md", "gt-md", "lg", "gt-lg", "xl", "print"],
            API_WITH_VALUES = ["layout", "flex", "flex-order", "flex-offset", "layout-align"],
            API_NO_VALUES = ["show", "hide", "layout-padding", "layout-margin"];

        function directiveNormalize(name) {
            return name
                .replace(PREFIX_REGEXP, '')
                .replace(SPECIAL_CHARS_REGEXP, function (_na, separator_na, letter, offset) {
                    return offset ? letter.toUpperCase() : letter;
                });
        }

        // Build directive registration functions for the standard Layout API... for all breakpoints.
        angular.forEach(BREAKPOINTS, function (mqb) {

            // Attribute directives with expected, observable value(s)
            angular.forEach(API_WITH_VALUES, function (name) {
                var fullName = mqb ? name + "-" + mqb : name;
                reg_api_module.directive(directiveNormalize(fullName), attributeWithObserve(fullName));
            });

            // Attribute directives with no expected value(s)
            angular.forEach(API_NO_VALUES, function (name) {
                var fullName = mqb ? name + "-" + mqb : name;
                reg_api_module.directive(directiveNormalize(fullName), attributeWithoutValue(fullName));
            });

        });

        // Register other, special directive functions for the Layout features:
        reg_api_module.provider(
            '$$mdLayout',
            function () {
                // Publish internal service for Layouts
                return {
                    $get: angular.noop,
                    validateAttributeValue: validateAttributeValue,
                    validateAttributeUsage: validateAttributeUsage,
                    disableLayouts: function (isDisabled) {
                        enabled = (isDisabled !== true);
                    }
                };
            }
        ).directive(
            'mdLayoutCss',
            disableLayoutDirective
        ).directive(
            'ngCloak',
            buildCloakInterceptor('ng-cloak')
        ).directive(
            'layoutWrap',
            attributeWithoutValue('layout-wrap')
        ).directive(
            'layoutNowrap',
            attributeWithoutValue('layout-nowrap')
        ).directive(
            'layoutNoWrap',
            attributeWithoutValue('layout-no-wrap')
        ).directive(
            'layoutFill',
            attributeWithoutValue('layout-fill')
        ).config(
            detectDisabledLayouts
        );
    }

    layout_module = angular.module(
        'ng.material.v111.ui.layout',
        [
            'ng',
            'ng.material.v111.core'
        ]
    );

    registerLayoutAPI(layout_module);

}());
