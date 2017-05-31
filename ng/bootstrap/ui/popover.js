
msos.provide("ng.bootstrap.ui.popover");
msos.require("ng.bootstrap.ui.tooltip");

ng.bootstrap.ui.popover.version = new msos.set_version(17, 5, 31);


// Load Angular-UI-Bootstrap module specific CSS
ng.bootstrap.ui.popover.css = new msos.loader();
ng.bootstrap.ui.popover.css.load(msos.resource_url('ng', 'bootstrap/css/ui/popover.css'));

// Below is the standard ui.bootstrap.accordion plugin, except for templateUrl location and naming (MSOS style)
// ui.bootstrap.popover -> ng.bootstrap.ui.popover
// uib/template/popover/popover.html            -> msos.resource_url('ng', 'bootstrap/ui/tmpl/popover.html')
// uib/template/popover/popover-template.html   -> msos.resource_url('ng', 'bootstrap/ui/tmpl/popover/template.html')
// uib/template/popover/popover-html.html       -> msos.resource_url('ng', 'bootstrap/ui/tmpl/popover/html.html')
angular.module('ng.bootstrap.ui.popover', ['ng.bootstrap.ui.tooltip'])

.directive('uibPopoverTemplatePopup', function() {
    return {
        replace: true,
        scope: {
            uibTitle: '@',
            contentExp: '&',
            placement: '@',
            popupClass: '@',
            animation: '&',
            isOpen: '&',
            originScope: '&'
        },
        templateUrl: msos.resource_url('ng', 'bootstrap/ui/tmpl/popover/template.html')
    };
})

.directive('uibPopoverTemplate', ['$uibTooltip', function($uibTooltip) {
    return $uibTooltip('uibPopoverTemplate', 'popover', 'click', {
        useContentExp: true
    });
}])

.directive('uibPopoverHtmlPopup', function() {
    return {
        replace: true,
        scope: {
            contentExp: '&',
            uibTitle: '@',
            placement: '@',
            popupClass: '@',
            animation: '&',
            isOpen: '&'
        },
        templateUrl: msos.resource_url('ng', 'bootstrap/ui/tmpl/popover/html.html')
    };
})

.directive('uibPopoverHtml', ['$uibTooltip', function($uibTooltip) {
    return $uibTooltip('uibPopoverHtml', 'popover', 'click', {
        useContentExp: true
    });
}])

.directive('uibPopoverPopup', function() {
    return {
        replace: true,
        scope: {
            uibTitle: '@',
            content: '@',
            placement: '@',
            popupClass: '@',
            animation: '&',
            isOpen: '&'
        },
        templateUrl: msos.resource_url('ng', 'bootstrap/ui/tmpl/popover.html')
    };
})

.directive('uibPopover', ['$uibTooltip', function($uibTooltip) {
    return $uibTooltip('uibPopover', 'popover', 'click');
}]);
