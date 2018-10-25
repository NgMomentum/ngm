
/**
 * @ngdoc module
 * @name material.components.media
 * @description
 * Color Util
 */

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.core.color");

ng.material.core.color.version = new msos.set_version(18, 3, 22);


function ColorUtilFactory() {
    "use strict";

    function hexToRgba(color) {
        var hex = color[0] === '#' ? color.substr(1) : color,
            dig = hex.length / 3,
            red = hex.substr(0, dig),
            green = hex.substr(dig, dig),
            blue = hex.substr(dig * 2);
        if (dig === 1) {
            red += red;
            green += green;
            blue += blue;
        }
        return 'rgba(' + parseInt(red, 16) + ',' + parseInt(green, 16) + ',' + parseInt(blue, 16) + ',0.1)';
    }

    function rgbaToHex(color) {
        color = color.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);

        var hex = (color && color.length === 4) ? "#" +
            ("0" + parseInt(color[1], 10).toString(16)).slice(-2) +
            ("0" + parseInt(color[2], 10).toString(16)).slice(-2) +
            ("0" + parseInt(color[3], 10).toString(16)).slice(-2) : '';

        return hex.toUpperCase();
    }

    function rgbToRgba(color) {
        return color.replace(')', ', 0.1)').replace('(', 'a(');
    }

    function rgbaToRgb(color) {
        return color ? color.replace('rgba', 'rgb').replace(/,[^),]+\)/, ')') : 'rgb(0,0,0)';
    }

    return {
        rgbaToHex: rgbaToHex,
        hexToRgba: hexToRgba,
        rgbToRgba: rgbToRgba,
        rgbaToRgb: rgbaToRgb
    };
}

angular.module(
    'ng.material.core.color',
    ['ng']
).factory(
    '$mdColorUtil',
    ColorUtilFactory
);
