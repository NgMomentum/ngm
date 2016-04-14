/**
 * @ngdoc overview
 * @name ui.bootstrap.tabs
 *
 * @description
 * AngularJS version of the tabs directive.
 */
msos.provide("ng.bootstrap.ui.tabs");

ng.bootstrap.ui.tabs.version = new msos.set_version(16, 4, 4);


// Below is the standard ui.bootstrap.accordion plugin, except for templateUrl location and naming (MSOS style)
// ui.bootstrap.tabs -> ng.bootstrap.ui.tabs
// uib/template/tabs/tabset.html    -> msos.resource_url('ng', 'bootstrap/ui/tmpl/tabset.html'),
// uib/template/tabs/tab.html       -> msos.resource_url('ng', 'bootstrap/ui/tmpl/tab.html')
angular.module('ng.bootstrap.ui.tabs', [])

.controller('UibTabsetController', ['$scope', function($scope) {
    var ctrl = this,
        oldIndex;
    ctrl.tabs = [];

    ctrl.select = function(index, evt) {
        if (!destroyed) {
            var previousIndex = findTabIndex(oldIndex);
            var previousSelected = ctrl.tabs[previousIndex];
            if (previousSelected) {
                if (previousSelected.tab.onDeselect !== angular.noop) {
                    previousSelected.tab.onDeselect({
                        $event: evt
                    });
                }
                if (evt && evt.isDefaultPrevented()) {
                    return;
                }
                previousSelected.tab.active = false;
            }

            var selected = ctrl.tabs[index];
            if (selected) {
                if (selected.tab.onSelect !== angular.noop) {
                    selected.tab.onSelect({
                        $event: evt
                    });
                }
                selected.tab.active = true;
                ctrl.active = selected.index;
                oldIndex = selected.index;
            } else if (!selected && angular.isNumber(oldIndex)) {
                ctrl.active = null;
                oldIndex = null;
            }
        }
    };

    ctrl.addTab = function addTab(tab) {
        ctrl.tabs.push({
            tab: tab,
            index: tab.index
        });
        ctrl.tabs.sort(function(t1, t2) {
            if (t1.index > t2.index) {
                return 1;
            }

            if (t1.index < t2.index) {
                return -1;
            }

            return 0;
        });

        if (tab.index === ctrl.active || !angular.isNumber(ctrl.active) && ctrl.tabs.length === 1) {
            var newActiveIndex = findTabIndex(tab.index);
            ctrl.select(newActiveIndex);
        }
    };

    ctrl.removeTab = function removeTab(tab) {
        var index = findTabIndex(tab.index),
            i = 0,
            newActiveTabIndex;

        for (i = 0; i < ctrl.tabs.length; i += 1) {
            if (ctrl.tabs[i].tab === tab) {
                index = i;
                break;
            }
        }

        if (ctrl.tabs[index].index === ctrl.active) {
            newActiveTabIndex = index === ctrl.tabs.length - 1 ? index - 1 : index + 1 % ctrl.tabs.length;
            ctrl.select(newActiveTabIndex);
        }

        ctrl.tabs.splice(index, 1);
    };

    $scope.$watch('tabset.active', function(val) {
        if (angular.isNumber(val) && val !== oldIndex) {
            ctrl.select(findTabIndex(val));
        }
    });

    var destroyed;
    $scope.$on('$destroy', function() {
        destroyed = true;
    });

    function findTabIndex(index) {
        for (var i = 0; i < ctrl.tabs.length; i++) {
            if (ctrl.tabs[i].index === index) {
                return i;
            }
        }
    }
}])

.directive('uibTabset', function() {
    return {
        transclude: true,
        replace: true,
        scope: {},
        bindToController: {
            active: '=?',
            type: '@'
        },
        controller: 'UibTabsetController',
        controllerAs: 'tabset',
        templateUrl: function(element, attrs) {
            return attrs.templateUrl || msos.resource_url('ng', 'bootstrap/ui/tmpl/tab/set.html');
        },
        link: function(scope, element, attrs) {
            scope.vertical = angular.isDefined(attrs.vertical) ?
                scope.$parent.$eval(attrs.vertical) : false;
            scope.justified = angular.isDefined(attrs.justified) ?
                scope.$parent.$eval(attrs.justified) : false;
            if (angular.isUndefined(attrs.active)) {
                scope.active = 0;
            }
        }
    };
})

.directive('uibTab', ['$parse', function($parse) {
    return {
        require: '^uibTabset',
        replace: true,
        templateUrl: function(element, attrs) {
            return attrs.templateUrl || msos.resource_url('ng', 'bootstrap/ui/tmpl/tab.html');
        },
        transclude: true,
        scope: {
            heading: '@',
            index: '=?',
            classes: '@?',
            onSelect: '&select', //This callback is called in contentHeadingTransclude
            //once it inserts the tab's content into the dom
            onDeselect: '&deselect'
        },
        controller: function() {
            //Empty controller so other directives can require being 'under' a tab
        },
        controllerAs: 'tab',
        link: function(scope, elm, attrs, tabsetCtrl, transclude) {
            scope.disabled = false;
            if (attrs.disable) {
                scope.$parent.$watch($parse(attrs.disable), function(value) {
                    scope.disabled = !!value;
                });
            }

            if (angular.isUndefined(attrs.index)) {
                if (tabsetCtrl.tabs && tabsetCtrl.tabs.length) {
                    scope.index = Math.max.apply(null, tabsetCtrl.tabs.map(function(t) {
                        return t.index;
                    })) + 1;
                } else {
                    scope.index = 0;
                }
            }

            if (angular.isUndefined(attrs.classes)) {
                scope.classes = '';
            }

            scope.select = function(evt) {
                if (!scope.disabled) {
                    var index;
                    for (var i = 0; i < tabsetCtrl.tabs.length; i++) {
                        if (tabsetCtrl.tabs[i].tab === scope) {
                            index = i;
                            break;
                        }
                    }

                    tabsetCtrl.select(index, evt);
                }
            };

            tabsetCtrl.addTab(scope);
            scope.$on('$destroy', function() {
                tabsetCtrl.removeTab(scope);
            });

            //We need to transclude later, once the content container is ready.
            //when this link happens, we're inside a tab heading.
            scope.$transcludeFn = transclude;
        }
    };
}])

.directive('uibTabHeadingTransclude', function() {
    return {
        restrict: 'A',
        require: '^uibTab',
        link: function(scope, elm, attrs, tabCtrl) {
            scope.$watch(
                'headingElement',
                function updateHeadingElement(heading) {
                    if (heading) {
                        elm.html('');
                        elm.append(heading);
                    }
                }
            );
        }
    };
})

.directive('uibTabContentTransclude', function () {
    return {
        restrict: 'A',
        require: '^uibTabset',
        link: function (scope, elm, attrs) {
            var tab = scope.$eval(attrs.uibTabContentTransclude).tab;
            //Now our tab is ready to be transcluded: both the tab heading area
            //and the tab content area are loaded.  Transclude 'em both.
            tab.$transcludeFn(tab.$parent, function(contents) {
                angular.forEach(contents, function(node) {
                    if (isTabHeading(node)) {
                        // Let tabHeadingTransclude know.
                        tab.headingElement = angular.element(node).html();
                    } else {
                        elm.append(node);
                    }
                });
            });
        }
    };

    function isTabHeading(node) {
        return node.tagName && (
            node.hasAttribute('uib-tab-heading') ||
            node.hasAttribute('data-uib-tab-heading') ||
            node.hasAttribute('x-uib-tab-heading') ||
            node.tagName.toLowerCase() === 'uib-tab-heading' ||
            node.tagName.toLowerCase() === 'data-uib-tab-heading' ||
            node.tagName.toLowerCase() === 'x-uib-tab-heading' ||
            node.tagName.toLowerCase() === 'uib:tab-heading'
        );
    }
});
