
/*global
    msos: false,
    angular: false
*/

msos.provide("ng.lr.infinitescroll");

ng.lr.infinitescroll.version = new msos.set_version(18, 1, 17);


(function (ng) {
    'use strict';

	ng.module(
		'ng.lr.infinitescroll',
		['ng', 'ng.lr.smarttable']
	).directive(
		'stPaginationScroll',
		['$timeout', function ($timeout) {
			return {
				require: 'stTable',
				link: function (scope, element, attr, ctrl) {
					var itemByPage = 20,
						pagination = ctrl.tableState().pagination,
						lengthThreshold = 50,
						timeThreshold = 400,
						handler = function () {
							//call next page
							ctrl.slice(pagination.start + itemByPage, itemByPage);
						},
						promise = null,
						lastRemaining = 9999,
						container = angular.element(element.parent());
	
					container.bind(
						'scroll',
						function () {
							var remaining = container[0].scrollHeight - (container[0].clientHeight + container[0].scrollTop);
	
							//if we have reached the threshold and we scroll down
							if (remaining < lengthThreshold && (remaining - lastRemaining) < 0) {
	
								//if there is already a timer running which has no expired yet we have to cancel it and restart the timer
								if (promise !== null) {
									$timeout.cancel(promise);
								}

								promise = $timeout(
									function () {
										handler();
										//scroll a bit up
										container[0].scrollTop -= 500;
										promise = null;
									},
									timeThreshold,
									false
								);
							}

							lastRemaining = remaining;
						}
					);
				}
			};
		}]
	);
}(angular));
