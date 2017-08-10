
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.icon");
msos.require("ng.material.v111.core");
msos.require("ng.material.v111.ui.icon");
msos.require("ng.material.v111.ui.layout");

demo.material.controllers.icon.version = new msos.set_version(16, 12, 23);


angular.module(
    'demo.material.controllers.icon',
    [
        'ng',
        'ng.material.v111.core',
        'ng.material.v111.core.theming'
    ]
).controller(
    'demo.material.controllers.icon.ctrl',
    ['$scope', function ($scope) {
        "use strict";
        // Create list of font-icon names with color overrides
        var iconData = [
            { name: 'icon-home',            color: "#777" },
            { name: 'icon-user-plus',       color: "rgb(89, 226, 168)" },
            { name: 'icon-google-plus2',    color: "#A00" },
            { name: 'icon-youtube4',        color:"#00A" },
             // Use theming to color the font-icon
            { name: 'icon-settings',        color:"#A00", theme:"md-warn md-hue-5"}
        ];

        // Create a set of sizes...
        $scope.sizes = [
            { size: 48, padding: 10 },
            { size: 36, padding: 6 },
            { size: 24, padding: 2 },
            { size: 12, padding: 0 }
        ];

        $scope.fonts = [].concat(iconData);
    }]
).config(
    ['$mdThemingProvider', function ($mdThemingProvider) {
        "use strict";
        // Update the theme colors to use themes on font-icons
        $mdThemingProvider.theme('default').primaryPalette("red").accentPalette('green').warnPalette('blue');
    }]
);
