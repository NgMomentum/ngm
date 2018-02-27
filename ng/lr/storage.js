
/*global
    msos: false,
    angular: false
*/

msos.provide("ng.lr.storage");

nng.lr.storage.version = new msos.set_version(18, 1, 15);


(function (ng) {
    "use strict";

    ng.module(
		'ng.lr.storage',
		['ng', 'ng.lr.smarttable']
	).directive(
		'stPersist',
		function () {
			return {
				require: '^stTable',
				link: function (scope, element, attr, ctrl) {
					var nameSpace = attr.stPersist,
						savedState,
						tableState;

					// save the table state every time it changes
					scope.$watch(
						function () {
							return ctrl.tableState();
						},
						function (newValue, oldValue) {
							if (newValue !== oldValue) {
								localStorage.setItem(nameSpace, JSON.stringify(newValue));
							}
						},
						true
					);

					// fetch the table state when the directive is loaded
					if (localStorage.getItem(nameSpace)) {

						savedState = JSON.parse(localStorage.getItem(nameSpace));
						tableState = ctrl.tableState();

						angular.extend(tableState, savedState);
						ctrl.pipe();
					}

				}
			};
		}
	);
}(angular));

