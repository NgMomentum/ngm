
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.material.controllers.datepickermd");
msos.require("ng.material.ui.datepicker");		// ref template
msos.require("ng.material.ui.layout");			// ref template
msos.require("ng.material.ui.content");			// ref template
msos.require("ng.material.ui.button");			// ref template
msos.require("ng.material.ui.subheader");		// ref template
msos.require("ng.material.ui.input");			// ref template

demo.material.controllers.datepickermd.version = new msos.set_version(18, 9, 13);

demo.material.controllers.datepickermd.moment_js = new msos.loader();
demo.material.controllers.datepickermd.moment_js.load(msos.resource_url('util', 'moment.js'), 'js');


angular.module(
	'demo.material.controllers.datepickermd',
	['ng', 'ng.material.ui.datepicker']
).config(
	['$mdDateLocaleProvider', function ($mdDateLocaleProvider) {
		"use strict";

        $mdDateLocaleProvider.formatDate = function (date) {
            return date ? moment(date).format('M/D') : '';
        };

        $mdDateLocaleProvider.parseDate = function (dateString) {
            var m = moment(dateString, 'M/D', true);

            return m.isValid() ? m.toDate() : new Date(NaN);
        };

        $mdDateLocaleProvider.isDateComplete = function (dateString) {
            dateString = dateString.trim();
            // Look for two chunks of content (either numbers or text) separated by delimiters.
            var re = /^(([a-zA-Z]{3,}|[0-9]{1,4})([ .,]+|[/-]))([a-zA-Z]{3,}|[0-9]{1,4})/;

            return re.test(dateString);
        };
    }]
).controller(
	'demo.material.controllers.datepickermd.ctrl1',
	function () {
		"use strict";

		this.myDate = new Date();
		this.isOpen = false;
	}
).controller(
	'demo.material.controllers.datepickermd.ctrl2',
	function () {
		"use strict";

		this.startDate = new Date();
		this.endDate = new Date();
		this.endDate.setDate(this.endDate.getDate() + 5);
	}
).controller(
	'demo.material.controllers.datepickermd.ctrl3',
	function() {
		"use strict";

		this.myDate = new Date();

		this.onDateChanged = function () {
			msos.console.info('demo.material.controllers.datepickermd -> Updated Date: ', this.myDate);
		};
	}
).controller(
	'demo.material.controllers.datepickermd.ctrl4',
	function () {
		"use strict";

		this.myDate = new Date();

		this.minDate = new Date(
			this.myDate.getFullYear(),
			this.myDate.getMonth() - 2,
			this.myDate.getDate()
		);

		this.maxDate = new Date(
			this.myDate.getFullYear(),
			this.myDate.getMonth() + 2,
			this.myDate.getDate()
		);

		this.onlyWeekendsPredicate = function (date) {
			var day = date.getDay();
			return day === 0 || day === 6;
		};
	}
);
