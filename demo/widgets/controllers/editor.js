
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false,
    demo: false
*/

msos.provide("demo.widgets.controllers.editor");
msos.require("ng.textng.core");
msos.require("ng.textng.setup");

demo.widgets.controllers.editor.version = new msos.set_version(16, 5, 4);


angular.module(
    'demo.widgets.controllers.editor', ['textAngular']
).controller(
    'demo.widgets.controllers.editor.ctrl',
    [
        '$scope',
        function app_ngText_ctrl($scope) {
            "use strict";

            var temp_ce = 'demo.widgets.controllers.editor.ctrl -> ';

            msos.console.debug(temp_ce + 'start.');

            $scope.htmlContent =
                '<h2>Try me!</h2>' +
                '<p>textAngular is a super cool WYSIWYG Text Editor directive for AngularJS</p>' +
                '<p><b>Features:</b></p>' +
                '<ol>' +
                    '<li>Automatic Seamless Two-Way-Binding</li>' +
                    '<li>Super Easy <b>Theming</b> Options</li>' +
                    '<li style="color: green;">Simple Editor Instance Creation</li>' +
                    '<li>Safely Parses Html for Custom Toolbar Icons</li>' +
                    '<li class="text-danger">Doesn&apos;t Use an iFrame</li>' +
                    '<li>Works with Firefox, Chrome, and IE9+</li>' +
                '</ol>' +
                '<p><b>Code at GitHub:</b> <a href="https://github.com/fraywing/textAngular">Here</a> </p>' +
                '<h4>Supports non-latin Characters</h4>' +
                '<p>昮朐 魡 燚璒瘭 譾躒鑅, 皾籈譧 紵脭脧 逯郹酟 煃 瑐瑍, 踆跾踄 趡趛踠 顣飁 廞 熥獘 豥 蔰蝯蝺 廦廥彋 蕍蕧螛 溹溦 幨懅憴 妎岓岕 緁, 滍 蘹蠮 蟷蠉蟼 鱐鱍鱕, 阰刲 鞮鞢騉 烳牼翐 魡 骱 銇韎餀 媓幁惁 嵉愊惵 蛶觢, 犝獫 嶵嶯幯 縓罃蔾 魵 踄 罃蔾 獿譿躐 峷敊浭, 媓幁 黐曮禷 椵楘溍 輗 漀 摲摓 墐墆墏 捃挸栚 蛣袹跜, 岓岕 溿 斶檎檦 匢奾灱 逜郰傃</p>';

            msos.console.debug(temp_ce + ' done!');
        }
    ]
);
