/**
 * @ngdoc module
 * @name material.core.liveannouncer
 * @description
 * Angular Material Live Announcer to provide accessibility for Voice Readers.
 */

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.announcer");

ng.material.ui.announcer.version = new msos.set_version(18, 8, 22);


function MdLiveAnnouncer($timeout) {
    "use strict";

    this._$timeout = $timeout;
    this._liveElement = this._createLiveElement();
    this._announceTimeout = 100;
}

MdLiveAnnouncer.prototype.announce = function (message, politeness) {
    "use strict";

    if (!politeness) {
        politeness = 'polite';
    }

    var self = this;

    self._liveElement.textContent = '';
    self._liveElement.setAttribute('aria-live', politeness);

    self._$timeout(
		function ng_md_ui_announcer_live_to() {
			self._liveElement.textContent = message;
		},
		self._announceTimeout,
		false
	);
};

MdLiveAnnouncer.prototype._createLiveElement = function () {
    "use strict";

    var liveEl = document.createElement('div');

    liveEl.classList.add('md-visually-hidden');
    liveEl.setAttribute('role', 'status');
    liveEl.setAttribute('aria-atomic', 'true');
    liveEl.setAttribute('aria-live', 'polite');

    document.body.appendChild(liveEl);

    return liveEl;
};


angular.module(
    'ng.material.ui.announcer',
	["ng"]
).service(
    '$mdLiveAnnouncer',
    ['$timeout', MdLiveAnnouncer]
);
