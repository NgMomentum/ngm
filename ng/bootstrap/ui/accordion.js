
msos.provide("ng.bootstrap.ui.accordion");

ng.bootstrap.ui.accordion.version = new msos.set_version(14, 12, 14);


// Below is the standard plugin, except for templateUrl location and naming (MSOS style)
// ui.bootstrap.accordion -> ng.bootstrap.ui.accordion
// template/accordion/accordion.html        -> msos.resource_url('ng', 'bootstrap/ui/tmpl/accordion.html')
// template/accordion/accordion-group.html  -> msos.resource_url('ng', 'bootstrap/ui/tmpl/accordion-group.html')
angular.module('ng.bootstrap.ui.accordion', ['ng.bootstrap.ui.collapse'])

.constant('accordionConfig', {
    closeOthers: true
})

.controller('AccordionController', ['$scope', '$attrs', 'accordionConfig', function ($scope, $attrs, accordionConfig) {

    // This array keeps track of the accordion groups
    this.groups = [];

    // Ensure that all the groups in this accordion are closed, unless close-others explicitly says not to
    this.closeOthers = function (openGroup) {
        var closeOthers = angular.isDefined($attrs.closeOthers) ? $scope.$eval($attrs.closeOthers) : accordionConfig.closeOthers;
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

        groupScope.$on('$destroy', function (event) {
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

}])

.directive('accordion', function () {
    return {
        restrict: 'EA',
        controller: 'AccordionController',
        transclude: true,
        replace: false,
        templateUrl: msos.resource_url('ng', 'bootstrap/ui/tmpl/accordion.html')
    };
})

// The accordion-group directive indicates a block of html that will expand and collapse in an accordion
.directive('accordionGroup', function () {
    return {
        require: '^accordion',
        // We need this directive to be inside an accordion
        restrict: 'EA',
        transclude: true,
        // It transcludes the contents of the directive into the template
        replace: true,
        // The element containing the directive will be replaced with the template
        templateUrl: msos.resource_url('ng', 'bootstrap/ui/tmpl/accordion-group.html'),
        scope: {
            heading: '@',
            // Interpolate the heading attribute onto this scope
            isOpen: '=?',
            isDisabled: '=?'
        },
        controller: function () {
            this.setHeading = function (element) {
                this.heading = element;
            };
        },
        link: function (scope, element, attrs, accordionCtrl) {
            accordionCtrl.addGroup(scope);

            scope.$watch('isOpen', function (value) {
                if (value) {
                    accordionCtrl.closeOthers(scope);
                }
            });

            scope.toggleOpen = function () {
                if (!scope.isDisabled) {
                    scope.isOpen = !scope.isOpen;
                }
            };
        }
    };
})

.directive('accordionHeading', function () {
    return {
        restrict: 'EA',
        transclude: true,
        // Grab the contents to be used as the heading
        template: '',
        // In effect remove this element!
        replace: true,
        require: '^accordionGroup',
        link: function (scope, element, attr, accordionGroupCtrl, transclude) {
            // Pass the heading to the accordion-group controller
            // so that it can be transcluded into the right place in the template
            // [The second parameter to transclude causes the elements to be cloned so that they work in ng-repeat]
            accordionGroupCtrl.setHeading(transclude(scope, function () {}));
        }
    };
})

.directive('accordionTransclude', function () {
    return {
        require: '^accordionGroup',
        link: function (scope, element, attr, controller) {
            scope.$watch(function () {
                return controller[attr.accordionTransclude];
            }, function (heading) {
                if (heading) {
                    element.html('');
                    element.append(heading);
                }
            });
        }
    };
});