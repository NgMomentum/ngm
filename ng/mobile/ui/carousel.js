
/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.mobile.ui.carousel");

ng.mobile.ui.carousel.version = new msos.set_version(16, 10, 27);

// Load Angular-UI-Bootstrap carousel module specific CSS
ng.mobile.ui.carousel.css = new msos.loader();
ng.mobile.ui.carousel.css.load(msos.resource_url('ng', 'bootstrap/css/ui/carousel.css'));
