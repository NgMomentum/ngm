
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.icon");
msos.require("ng.material.core.theming");
msos.require("ng.material.ui.icon");		// ref. templates
msos.require("ng.material.ui.layout");		// ref. templates

demo.material.controllers.icon.version = new msos.set_version(18, 7, 27);


angular.module(
    'demo.material.controllers.icon',
    ['ng', 'ng.material.core.theming', 'ng.material.ui.icon']
).config(
    ['$mdThemingProvider', '$mdIconProvider', function ($mdThemingProvider, $mdIconProvider) {
        "use strict";
        // Update the theme colors to use themes on font-icons
        $mdThemingProvider
			.theme('default')
			.primaryPalette("red")
			.accentPalette('green')
			.warnPalette('blue');

		$mdIconProvider
			.iconSet(
				'social',
				msos.resource_url('demo', 'material/img/icons/sets/social-icons.svg'),
				24
			).iconSet(
				'symbol',
				msos.resource_url('demo', 'material/img/icons/sets/symbol-icons.svg'),
				24
			).icon(
				'social:cake',
				msos.resource_url('demo', 'material/img/icons/cake.svg'),
				24
			).defaultIconSet(
				msos.resource_url('demo', 'material/img/icons/sets/core-icons.svg'),
				24
			);      
    }]
).run(
	['$templateRequest', function ($templateRequest) {

        var urls = [
			msos.resource_url('demo', 'material/img/icons/sets/core-icons.svg'),
            msos.resource_url('demo', 'material/img/icons/cake.svg'),
            msos.resource_url('demo', 'material/img/icons/android.svg')
        ];

        angular.forEach(
			urls, function (url) {
				$templateRequest(url);
			}
		);

    }]
).controller(
    'demo.material.controllers.icon.ctrl1',
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
).controller(
	'demo.material.controllers.icon.ctrl2',
	['$scope', function ($scope) {
		"use strict";
		// Specify a list of font-icons with ligatures and color overrides
		var iconData = [
            { name: 'accessibility',	color: "#777" },
            { name: 'question_answer',	color: "rgb(89, 226, 168)" },
            { name: 'backup',			color: "#A00" },
            { name: 'email',			color: "#00A" }
        ];

      $scope.fonts = [].concat(iconData);

      // Create a set of sizes...
      $scope.sizes = [
        { size:"md-18", padding:0 },
        { size:"md-24", padding:2 },
        { size:"md-36", padding:6 },
        { size:"md-48", padding:10 }
      ];
  }]
).controller(
	'demo.material.controllers.icon.ctrl3',
	['$scope', function( $scope ) {
		"use strict";

		$scope.insertDriveIconURL = msos.resource_url('demo', 'material/img/icons/ic_insert_drive_file_24px.svg');
		$scope.getAndroid = function () {
			return msos.resource_url('demo', 'material/img/icons/android.svg');
		};

		/* Returns base64 encoded SVG. */
		$scope.getAndroidEncoded = function () {
			return 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PGcgaWQ9ImFuZHJvaWQiPjxwYXRoIGQ9Ik02IDE4YzAgLjU1LjQ1IDEgMSAxaDF2My41YzAgLjgzLjY3IDEuNSAxLjUgMS41czEuNS0uNjcgMS41LTEuNVYxOWgydjMuNWMwIC44My42NyAxLjUgMS41IDEuNXMxLjUtLjY3IDEuNS0xLjVWMTloMWMuNTUgMCAxLS40NSAxLTFWOEg2djEwek0zLjUgOEMyLjY3IDggMiA4LjY3IDIgOS41djdjMCAuODMuNjcgMS41IDEuNSAxLjVTNSAxNy4zMyA1IDE2LjV2LTdDNSA4LjY3IDQuMzMgOCAzLjUgOHptMTcgMGMtLjgzIDAtMS41LjY3LTEuNSAxLjV2N2MwIC44My42NyAxLjUgMS41IDEuNXMxLjUtLjY3IDEuNS0xLjV2LTdjMC0uODMtLjY3LTEuNS0xLjUtMS41em0tNC45Ny01Ljg0bDEuMy0xLjNjLjItLjIuMi0uNTEgMC0uNzEtLjItLjItLjUxLS4yLS43MSAwbC0xLjQ4IDEuNDhDMTMuODUgMS4yMyAxMi45NSAxIDEyIDFjLS45NiAwLTEuODYuMjMtMi42Ni42M0w3Ljg1LjE1Yy0uMi0uMi0uNTEtLjItLjcxIDAtLjIuMi0uMi41MSAwIC43MWwxLjMxIDEuMzFDNi45NyAzLjI2IDYgNS4wMSA2IDdoMTJjMC0xLjk5LS45Ny0zLjc1LTIuNDctNC44NHpNMTAgNUg5VjRoMXYxem01IDBoLTFWNGgxdjF6Ii8+PC9nPjwvc3ZnPg==';
		};

		/* Returns decoded SVG */
		$scope.getCartDecoded = function () {
			return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g id="add-shopping-cart"><path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4h-.01l-1.1 2-2.76 5H8.53l-.13-.27L6.16 6l-.95-2-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z"/></g></svg>';
		};
	}]
).controller(
	'demo.material.controllers.icon.ctrl4',
	['$scope', function ($scope) {
		"use strict";

		msos.console.info('demo.material.controllers.icon - demo.material.controllers.icon.ctrl4 -> called, $scope:', $scope);
	}]
).controller(
	'demo.material.controllers.icon.ctrl5',
	['$scope', function ($scope) {
		"use strict";

		msos.console.info('demo.material.controllers.icon - demo.material.controllers.icon.ctrl5 -> called, $scope:', $scope);
	}]
);
