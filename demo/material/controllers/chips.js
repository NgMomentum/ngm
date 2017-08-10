
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.chips");
msos.require("ng.messages");
msos.require("ng.material.v111.ui.chips");
msos.require("ng.material.v111.ui.icon");
msos.require("ng.material.v111.ui.button");
msos.require("ng.material.v111.ui.layout");
msos.require("ng.material.v111.ui.content");
msos.require("ng.material.v111.ui.checkbox");

demo.material.controllers.chips.version = new msos.set_version(17, 1, 11);


angular.module(
    'demo.material.controllers.chips',
    [
        'ng',
        'ng.material.v111.ui.icon'
    ]
).controller(
    'demo.material.controllers.chips.ctrl',
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
).config(
    ['$mdIconProvider', function ($mdIconProvider) {
        "use strict";

        $mdIconProvider.icon('md-close', 'ngm/demo/material/img/icons/ic_close_24px.svg', 24);
    }]
);
