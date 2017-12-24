
/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.bootstrap.ui.accordion");

ng.bootstrap.ui.accordion.version = new msos.set_version(17, 12, 6);

// Load Angular-UI-Bootstrap module specific CSS (accordion requires panel.css)
ng.bootstrap.ui.accordion.css = new msos.loader();
ng.bootstrap.ui.accordion.css.load(msos.resource_url('ng', 'bootstrap/css/ui/panel.css'));


// Below is the standard plugin, except for templateUrl location and naming (MSOS style)
// ui.bootstrap.accordion -> ng.bootstrap.ui.accordion
// uib/template/accordion/accordion.html        -> msos.resource_url('ng', 'bootstrap/ui/tmpl/accordion.html')
// uib/template/accordion/accordion-group.html  -> msos.resource_url('ng', 'bootstrap/ui/tmpl/accordion/group.html')
angular.module(
    'ng.bootstrap.ui.accordion',
    ['ng', 'ng.bootstrap.ui', 'ng.bootstrap.ui.collapse', 'ng.bootstrap.ui.tabindex']
).constant(
    'uibAccordionConfig',
    { closeOthers: true }
).controller(
    'UibAccordionController',
    ['$scope', '$attrs', 'uibAccordionConfig', function ($scope, $attrs, accordionConfig) {
        "use strict";

        // This array keeps track of the accordion groups
        this.groups = [];
    
        // Ensure that all the groups in this accordion are closed, unless close-others explicitly says not to
        this.closeOthers = function (openGroup) {
            var closeOthers = angular.isDefined($attrs.accordionCloseOthers) ?
                $scope.$eval($attrs.accordionCloseOthers) : accordionConfig.closeOthers;
            if (closeOthers) {
                angular.forEach(this.groups, function (group) {
                    if (group !== openGroup) {
                        group.isOpen = false;
                    }
                });
            }
        };

        // This is called from the accordion-group directive to add itself to the accordion
        this.addGroup = function (groupScope) {
            var that = this;
            this.groups.push(groupScope);
    
            groupScope.$on('$destroy', function () {
                that.removeGroup(groupScope);
            });
        };

        // This is called from the accordion-group directive when to remove itself
        this.removeGroup = function (group) {
            var index = this.groups.indexOf(group);
            if (index !== -1) {
                this.groups.splice(index, 1);
            }
        };
    }]
).directive(
    'uibAccordion',
    function () {
        "use strict";
        return {
            controller: 'UibAccordionController',
            controllerAs: 'accordion',
            transclude: true,
            templateUrl: function (element_na, attrs) {
                return attrs.accordionTemplateUrl || msos.resource_url('ng', 'bootstrap/ui/tmpl/accordion.html');
            }
        };
    }
).directive(
    'uibAccordionGroup',
    function () {
        "use strict";
        return {
            require: '^uibAccordion', // We need this directive to be inside an accordion
            transclude: true, // It transcludes the contents of the directive into the template
            restrict: 'A',
            templateUrl: function (element_na, attrs) {
                return attrs.accordionTemplateUrl || msos.resource_url('ng', 'bootstrap/ui/tmpl/accordion/group.html');
            },
            scope: {
                heading: '@', // Interpolate the heading attribute onto this scope
                panelClass: '@?', // Ditto with panelClass
                isOpen: '=?',
                isDisabled: '=?'
            },
            controller: function uibAccordionGroupCtrl() {
                this.setHeading = function (element) {
                    this.heading = element;
                };
            },
            link: function (scope, element, attrs, accordionCtrl) {
                element.addClass('panel');
                accordionCtrl.addGroup(scope);

                scope.openClass = attrs.openClass || 'panel-open';
                scope.panelClass = attrs.panelClass || 'panel-default';
                scope.$watch('isOpen', function (value) {
                    element.toggleClass(scope.openClass, !!value);
                    if (value) {
                        accordionCtrl.closeOthers(scope);
                    }
                });

                scope.toggleOpen = function ($event) {
                    if (!scope.isDisabled) {
                        if (!$event || $event.which === 32) {
                            scope.isOpen = !scope.isOpen;
                        }
                    }
                };

                var id = 'accordiongroup-' + scope.$id + '-' + Math.floor(Math.random() * 10000);
                scope.headingId = id + '-tab';
                scope.panelId = id + '-panel';
            }
        };
    }
).directive(
    'uibAccordionHeading',
    function () {
        "use strict";
        return {
            transclude: true, // Grab the contents to be used as the heading
            template: '', // In effect remove this element!
            replace: true,
            require: '^uibAccordionGroup',
            link: function (scope, element_na, attrs_na, accordionGroupCtrl, transclude) {
                // Pass the heading to the accordion-group controller
                // so that it can be transcluded into the right place in the template
                // [The second parameter to transclude causes the elements to be cloned so that they work in ng-repeat]
                accordionGroupCtrl.setHeading(transclude(scope, angular.noop));
            }
        };
    }
).directive(
    'uibAccordionTransclude',
    function () {
        "use strict";
        function getHeaderSelectors() {
            return 'uib-accordion-header,' +
                'data-uib-accordion-header,' +
                'x-uib-accordion-header,' +
                'uib\\:accordion-header,' +
                '[uib-accordion-header],' +
                '[data-uib-accordion-header],' +
                '[x-uib-accordion-header]';
        }

        return {
            require: '^uibAccordionGroup',
            link: function (scope, element, attrs, controller) {
                scope.$watch(function () {
                    return controller[attrs.uibAccordionTransclude];
                }, function (heading) {
                    if (heading) {
                        var elem = angular.element(element[0].querySelector(getHeaderSelectors()));
                        elem.html('');
                        elem.append(heading);
                    }
                });
            }
        };
    }
).directive(
    'uibAccordionHeader',
    angular.restrictADir
).directive(
    'accordionCloseOthers',
    angular.restrictADir
).directive(
    'accordionTemplateUrl',
    angular.restrictADir
);
