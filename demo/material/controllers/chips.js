
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.chips");
msos.require("ng.messages");
msos.require("ng.material.ui.chips");
msos.require("ng.material.ui.icon");
msos.require("ng.material.ui.list");		// ref. templates
msos.require("ng.material.ui.subheader");	// ref. templates
msos.require("ng.material.ui.layout");		// ref. templates
msos.require("ng.material.ui.content");		// ref. templates
msos.require("ng.material.ui.checkbox");	// ref. templates

demo.material.controllers.chips.version = new msos.set_version(18, 9, 2);


// If we do not have CryptoJS defined, import it
if (typeof CryptoJS == 'undefined') {
    var cryptoSrc = '//cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.min.js',
		scriptTag = document.createElement('script');

    scriptTag.setAttribute('src', cryptoSrc);
    document.body.appendChild(scriptTag);
}

function Demo2Ctrl($q, $timeout) {
	"use strict";

	var self = this,
		pendingSearch,
		cancelSearch = angular.noop,
		lastSearch;

	function loadContacts() {
		var contacts = [
			'Marina Augustine',
			'Oddr Sarno',
			'Nick Giannopoulos',
			'Narayana Garner',
			'Anita Gros',
			'Megan Smith',
			'Tsvetko Metzger',
			'Hector Simek',
			'Some-guy withalongalastaname'
		];

		return contacts.map(
			function (c) {
				var cParts = c.split(' '),
					email = cParts[0][0].toLowerCase() + '.' + cParts[1].toLowerCase() + '@example.com',
					hash = CryptoJS.MD5(email),
					contact = {
						name: c,
						email: email,
						image: '//www.gravatar.com/avatar/' + hash + '?s=50&d=retro'
					};

				contact._lowername = contact.name.toLowerCase();

				return contact;
			}
		);
	}

	self.allContacts = loadContacts();
	self.contacts = [self.allContacts[0]];
	self.asyncContacts = [];

    function createFilterFor(query) {
        var lowercaseQuery = query.toLowerCase();

        return function filterFn(contact) {
            return (contact._lowername.indexOf(lowercaseQuery) !== -1);
        };
    }

    function querySearch(criteria) {
        return criteria ? self.allContacts.filter(createFilterFor(criteria)) : [];
    }

	function debounceSearch() {
		var now = new Date().getMilliseconds();

		lastSearch = lastSearch || now;

		return ((now - lastSearch) < 300);
	}

	function refreshDebounce() {
		lastSearch = 0;
		pendingSearch = null;
		cancelSearch = angular.noop;
	}

	function delayedQuerySearch(criteria) {

		if (!pendingSearch || !debounceSearch()) {

			cancelSearch();

			pendingSearch = $q(
					function(resolve, reject) {
						// Simulate async search... (after debouncing)
						cancelSearch = reject;
						$timeout(
							function demo_material_controllers_delayedQuerySearch_to() {
								resolve(self.querySearch(criteria));
								refreshDebounce();
							},
							Math.random() * 500,
							true
						);
					},
					'demo_material_controllers_chips_Demo2Ctrl'
				);
		}

		return pendingSearch;
	}

    function onModelChange(newModel) {
        msos.console.info('demo.material.controllers.chips -> The model has changed to ' + JSON.stringify(newModel) + '.');
    }

	self.querySearch = querySearch;
	self.delayedQuerySearch = delayedQuerySearch;
	self.onModelChange = onModelChange;
}

function DemoCtrl3() {
	"use strict";

	var self = this;

	self.readonly = false;
	self.selectedItem = null;
	self.searchText = null;
	self.selectedVegetables = [];
	self.numberChips = [];
	self.numberChips2 = [];
	self.numberBuffer = '';
	self.autocompleteDemoRequireMatch = true;

	function transformChip(chip) {
		// If it is an object, it's already a known chip
		if (angular.isObject(chip)) {
			return chip;
		}

		// Otherwise, create a new one
		return {
			name: chip,
			type: 'new'
		};
	}

	function querySearch(query) {
		var results = query ? self.vegetables.filter(createFilterFor(query)) : [];

		return results;
	}

	function createFilterFor(query) {
		var lowercaseQuery = query.toLowerCase();

		return function filterFn(vegetable) {
			return (vegetable._lowername.indexOf(lowercaseQuery) === 0) || (vegetable._lowertype.indexOf(lowercaseQuery) === 0);
		};

	}

	function loadVegetables() {
		var veggies = [{
				'name': 'Broccoli',
				'type': 'Brassica'
			},
			{
				'name': 'Cabbage',
				'type': 'Brassica'
			},
			{
				'name': 'Carrot',
				'type': 'Umbelliferous'
			},
			{
				'name': 'Lettuce',
				'type': 'Composite'
			},
			{
				'name': 'Spinach',
				'type': 'Goosefoot'
			}
		];

		return veggies.map(
			function(veg) {
				veg._lowername = veg.name.toLowerCase();
				veg._lowertype = veg.type.toLowerCase();

				return veg;
			}
		);
	}

	self.querySearch = querySearch;
	self.vegetables = loadVegetables();
	self.transformChip = transformChip;
}

function DemoCtrl4($mdConstant) {
	"use strict";

	    // Any key code can be used to create a custom separator
    var semicolon = 186;

    // Use common key codes found in $mdConstant.KEY_CODE...
    this.keys = [$mdConstant.KEY_CODE.ENTER, $mdConstant.KEY_CODE.COMMA];
    this.tags = [];

    this.customKeys = [$mdConstant.KEY_CODE.ENTER, $mdConstant.KEY_CODE.COMMA, semicolon];
    this.contacts = ['test@example.com'];
}


function DemoCtrl5 () {
	"use strict";

	this.chipText = 'Football';
}

function ValidationCtrl () {
	"use strict";

    this.selectedFruit = [];
    this.selectedVegetables = [];
}


angular.module(
    'demo.material.controllers.chips',
    [
        'ng',
		'ng.messages',
		'ng.material.core',
        'ng.material.ui.icon'
    ]
).config(
    ['$mdIconProvider', function ($mdIconProvider) {
        "use strict";

        $mdIconProvider.icon(
			'md-close',
			msos.resource_url('demo', 'material/img/icons/ic_close_24px.svg'),
			24
		);
    }]
).controller(
    'demo.material.controllers.chips.ctrl1',
    function () {
        "use strict";

        var self = this;

        self.readonly = false;

        // Lists of fruit names and Vegetable objects
        self.fruitNames = ['Apple', 'Banana', 'Orange'];
        self.roFruitNames = angular.copy(self.fruitNames);
        self.editableFruitNames = angular.copy(self.fruitNames);

        self.tags = [];
        self.vegObjs = [{
                'name': 'Broccoli',
                'type': 'Brassica'
            },
            {
                'name': 'Cabbage',
                'type': 'Brassica'
            },
            {
                'name': 'Carrot',
                'type': 'Umbelliferous'
            }
        ];

        self.newVeg = function (chip) {
            return {
                name: chip,
                type: 'unknown'
            };
        };
    }
).controller(
	'demo.material.controllers.chips.ctrl2',
	['$q', '$timeout', Demo2Ctrl]
).controller(
	'demo.material.controllers.chips.ctrl3',
	DemoCtrl3
).controller(
	'demo.material.controllers.chips.ctrl4',
	['$mdConstant', DemoCtrl4]
).controller(
	'demo.material.controllers.chips.ctrl5',
	DemoCtrl5
).controller(
	'demo.material.controllers.chips.ctrl6',
	ValidationCtrl
);
