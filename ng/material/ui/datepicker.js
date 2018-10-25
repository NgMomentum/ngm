
/**
 * @ngdoc module
 * @name material.components.datepicker
 */

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.datepicker");
msos.require("ng.material.core.theming");
msos.require("ng.material.ui.aria");
msos.require("ng.material.ui.icon");
msos.require("ng.material.ui.input");
msos.require("ng.material.ui.repeater");		// ref. templates

ng.material.ui.datepicker.version = new msos.set_version(18, 9, 12);

// Load AngularJS-Material module specific CSS
ng.material.ui.datepicker.css = new msos.loader();
ng.material.ui.datepicker.css.load(msos.resource_url('ng', 'material/css/ui/datepicker.css'));


(function () {
    "use strict";

    function calendarDirective() {
        return {
            template: function (tElement, tAttr) {

                var extraAttrs = tAttr.hasOwnProperty('ngIf') ? '' : 'ng-if="calendarCtrl.isInitialized"',
					template = '' +
						'<div ng-switch="calendarCtrl.currentView" ' + extraAttrs + '>' +
						'<md-calendar-year ng-switch-when="year"></md-calendar-year>' +
						'<md-calendar-month ng-switch-default></md-calendar-month>' +
						'</div>';

                return template;
            },
            scope: {
                minDate: '=mdMinDate',
                maxDate: '=mdMaxDate',
                dateFilter: '=mdDateFilter',

                _mode: '@mdMode',
                _currentView: '@mdCurrentView'
            },
            require: ['ngModel', 'mdCalendar'],
            controller: ["$element", "$scope", "$$mdDateUtil", "$mdUtil", "$mdConstant", "$mdTheming", "$$rAF", "$attrs", "$mdDateLocale", CalendarCtrl],
            controllerAs: 'calendarCtrl',
            bindToController: true,
            link: function (scope, element, attrs, controllers) {
                var ngModelCtrl = controllers[0],
					mdCalendarCtrl = controllers[1];

                mdCalendarCtrl.configureNgModel(ngModelCtrl);
            }
        };
    }

    var FALLBACK_WIDTH = 340;
    var nextUniqueId = 0;
    var MODE_MAP = {
        day: 'month',
        month: 'year'
    };

    function CalendarCtrl($element, $scope, $$mdDateUtil, $mdUtil, $mdConstant, $mdTheming, $$rAF, $attrs, $mdDateLocale) {

        $mdTheming($element);

        this.$element = $element;
        this.$scope = $scope;
        this.dateUtil = $$mdDateUtil;
        this.$mdUtil = $mdUtil;
        this.keyCode = $mdConstant.KEY_CODE;
        this.$$rAF = $$rAF;
        this.$mdDateLocale = $mdDateLocale;
        this.today = this.dateUtil.createDateAtMidnight();
        this.ngModelCtrl = null;
        this.SELECTED_DATE_CLASS = 'md-calendar-selected-date';
        this.TODAY_CLASS = 'md-calendar-date-today';
        this.FOCUSED_DATE_CLASS = 'md-focus';
        this.id = nextUniqueId++;
        this.displayDate = null;
        this.selectedDate = null;
        this.firstRenderableDate = null;
        this.lastRenderableDate = null;
        this.isInitialized = false;
        this.width = 0;
        this.scrollbarWidth = 0;

        if (!$attrs.tabindex) {
            $element.attr('tabindex', '-1');
        }

        var boundKeyHandler = angular.bind(this, this.handleKeyEvent),
			handleKeyElement;

        if ($element.parent().hasClass('md-datepicker-calendar')) {
            handleKeyElement = angular.element(document.body);
        } else {
            handleKeyElement = $element;
        }

        handleKeyElement.on('keydown', boundKeyHandler);

        $scope.$on('$destroy', function ng_md_ui_datepicker_CC_on() {
            handleKeyElement.off('keydown', boundKeyHandler);
        });
    }

    CalendarCtrl.prototype.$onInit = function () {
		var dateLocale;

        if (this._mode && MODE_MAP.hasOwnProperty(this._mode)) {
            this.currentView = MODE_MAP[this._mode];
            this.mode = this._mode;
        } else {
            this.currentView = this._currentView || 'month';
            this.mode = null;
        }

        dateLocale = this.$mdDateLocale;

        if (this.minDate && this.minDate > dateLocale.firstRenderableDate) {
            this.firstRenderableDate = this.minDate;
        } else {
            this.firstRenderableDate = dateLocale.firstRenderableDate;
        }

        if (this.maxDate && this.maxDate < dateLocale.lastRenderableDate) {
            this.lastRenderableDate = this.maxDate;
        } else {
            this.lastRenderableDate = dateLocale.lastRenderableDate;
        }
    };

    CalendarCtrl.prototype.configureNgModel = function (ngModelCtrl) {
        var self = this;

        self.ngModelCtrl = ngModelCtrl;

        self.$mdUtil.nextTick(function () {
            self.isInitialized = true;
        });

        ngModelCtrl.$render = function () {
            var value = this.$viewValue;

            self.$scope.$broadcast('md-calendar-parent-changed', value);

            if (!self.selectedDate) {
                self.selectedDate = value;
            }

            if (!self.displayDate) {
                self.displayDate = self.selectedDate || self.today;
            }
        };
    };

    CalendarCtrl.prototype.setNgModelValue = function (date) {
        var value = this.dateUtil.createDateAtMidnight(date);

        this.focus(value);
        this.$scope.$emit('md-calendar-change', value);
        this.ngModelCtrl.$setViewValue(value);
        this.ngModelCtrl.$render();

        return value;
    };

    CalendarCtrl.prototype.setCurrentView = function (newView, time) {
        var self = this;

        self.$mdUtil.nextTick(function () {
            self.currentView = newView;

            if (time) {
                self.displayDate = angular.isDate(time) ? time : new Date(time);
            }
        });
    };

    CalendarCtrl.prototype.focus = function (date) {
		var previousFocus,
			cellId,
			cell,
			rootElement;

        if (this.dateUtil.isValidDate(date)) {
            previousFocus = this.$element[0].querySelector('.' + this.FOCUSED_DATE_CLASS);
            if (previousFocus) {
                previousFocus.classList.remove(this.FOCUSED_DATE_CLASS);
            }

            cellId = this.getDateId(date, this.currentView);
            cell = document.getElementById(cellId);

            if (cell) {
                cell.classList.add(this.FOCUSED_DATE_CLASS);
                cell.focus();
                this.displayDate = date;
            }
        } else {
            rootElement = this.$element[0].querySelector('[ng-switch]');

            if (rootElement) {
                rootElement.focus();
            }
        }
    };

    CalendarCtrl.prototype.changeSelectedDate = function (date) {
        var selectedDateClass = this.SELECTED_DATE_CLASS,
			prevDateCell = this.$element[0].querySelector('.' + selectedDateClass),
			dateCell;

        if (prevDateCell) {
            prevDateCell.classList.remove(selectedDateClass);
            prevDateCell.setAttribute('aria-selected', 'false');
        }

        if (date) {
            dateCell = document.getElementById(this.getDateId(date, this.currentView));

            if (dateCell) {
                dateCell.classList.add(selectedDateClass);
                dateCell.setAttribute('aria-selected', 'true');
            }
        }

        this.selectedDate = date;
    };

    CalendarCtrl.prototype.getActionFromKeyEvent = function (event) {
        var keyCode = this.keyCode;

        switch (event.which) {
            case keyCode.ENTER:
                return 'select';

            case keyCode.RIGHT_ARROW:
                return 'move-right';
            case keyCode.LEFT_ARROW:
                return 'move-left';

            case keyCode.DOWN_ARROW:
                return event.metaKey ? 'move-page-down' : 'move-row-down';
            case keyCode.UP_ARROW:
                return event.metaKey ? 'move-page-up' : 'move-row-up';

            case keyCode.PAGE_DOWN:
                return 'move-page-down';
            case keyCode.PAGE_UP:
                return 'move-page-up';

            case keyCode.HOME:
                return 'start';
            case keyCode.END:
                return 'end';

            default:
                return null;
        }
    };

    CalendarCtrl.prototype.handleKeyEvent = function (event) {
        var self = this;

        this.$scope.$apply(function () {
			var action;

            if (event.which == self.keyCode.ESCAPE || event.which == self.keyCode.TAB) {
                self.$scope.$emit('md-calendar-close');

                if (event.which == self.keyCode.TAB) {
                    event.preventDefault();
                }

                return;
            }

            // Broadcast the action that any child controllers should take.
            action = self.getActionFromKeyEvent(event);

            if (action) {
                event.preventDefault();
                event.stopPropagation();
                self.$scope.$broadcast('md-calendar-parent-action', action);
            }
        });
    };

    CalendarCtrl.prototype.hideVerticalScrollbar = function (childCtrl) {
        var self = this,
			element = childCtrl.$element[0],
			scrollMask = element.querySelector('.md-calendar-scroll-mask');

        if (self.width > 0) {
            setWidth();
        } else {
            self.$$rAF(
				function () {
					var scroller = childCtrl.calendarScroller,
						table_el = element.querySelector('table');

					if (scroller && table_el) {
						self.scrollbarWidth = scroller.offsetWidth - scroller.clientWidth;
						self.width = table_el.offsetWidth;

						setWidth();
					}
				}
			);
        }

        function setWidth() {
            var width = self.width || FALLBACK_WIDTH,
				scrollbarWidth = self.scrollbarWidth,
				scroller = childCtrl.calendarScroller;

            scrollMask.style.width = width + 'px';
            scroller.style.width = (width + scrollbarWidth) + 'px';
            scroller.style.paddingRight = scrollbarWidth + 'px';
        }
    };

    CalendarCtrl.prototype.getDateId = function (date, namespace) {
        if (!namespace) {
            throw new Error('A namespace for the date id has to be specified.');
        }

        return [
            'md',
            this.id,
            namespace,
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        ].join('-');
    };

    CalendarCtrl.prototype.updateVirtualRepeat = function () {
        var scope = this.$scope,
			virtualRepeatResizeListener = scope.$on('$md-resize-enable', function ng_md_ui_datepicker_CC_repeat_resize_on() {
				if (!scope.$$phase) { scope.$apply(); }

				virtualRepeatResizeListener();
			});
    };


    var TBODY_HEIGHT_MON = 265;
    var TBODY_SINGLE_ROW_HEIGHT = 45;

    function calendarMonthDirective() {
        return {
            template: '<table aria-hidden="true" class="md-calendar-day-header"><thead></thead></table>' +
                '<div class="md-calendar-scroll-mask">' +
                '<md-virtual-repeat-container class="md-calendar-scroll-container" ' +
                'md-offset-size="' + (TBODY_SINGLE_ROW_HEIGHT - TBODY_HEIGHT_MON) + '">' +
                '<table role="grid" tabindex="0" class="md-calendar" aria-readonly="true">' +
                '<tbody ' +
                'md-calendar-month-body ' +
                'role="rowgroup" ' +
                'md-virtual-repeat="i in monthCtrl.items" ' +
                'md-month-offset="$index" ' +
                'class="md-calendar-month" ' +
                'md-start-index="monthCtrl.getSelectedMonthIndex()" ' +
                'md-item-size="' + TBODY_HEIGHT_MON + '">' +

                '<tr aria-hidden="true" md-force-height="\'' + TBODY_HEIGHT_MON + 'px\'"></tr>' +
                '</tbody>' +
                '</table>' +
                '</md-virtual-repeat-container>' +
                '</div>',
            require: ['^^mdCalendar', 'mdCalendarMonth'],
            controller: ["$element", "$scope", "$animate", "$q", "$$mdDateUtil", "$mdDateLocale", CalendarMonthCtrl],
            controllerAs: 'monthCtrl',
            bindToController: true,
            link: function (scope, element, attrs, controllers) {
                var calendarCtrl = controllers[0],
					monthCtrl = controllers[1];

                monthCtrl.initialize(calendarCtrl);
            }
        };
    }

    function CalendarMonthCtrl($element, $scope, $animate, $q, $$mdDateUtil, $mdDateLocale) {

		var self = this;

        this.$element = $element;
        this.$scope = $scope;
        this.$animate = $animate;
        this.$q = $q;
        this.dateUtil = $$mdDateUtil;
        this.dateLocale = $mdDateLocale;
        this.calendarScroller = $element[0].querySelector('.md-virtual-repeat-scroller');
        this.isInitialized = false;
        this.isMonthTransitionInProgress = false;

        this.cellClickHandler = function () {
            var timestamp = $$mdDateUtil.getTimestampFromNode(this);
            self.$scope.$apply(function () {
                self.calendarCtrl.setNgModelValue(timestamp);
            });
        };

        this.headerClickHandler = function () {
            self.calendarCtrl.setCurrentView('year', $$mdDateUtil.getTimestampFromNode(this));
        };
    }


    CalendarMonthCtrl.prototype.initialize = function (calendarCtrl) {

        this.items = {
            length: this.dateUtil.getMonthDistance(
                calendarCtrl.firstRenderableDate,
                calendarCtrl.lastRenderableDate
            ) + 2
        };

        this.calendarCtrl = calendarCtrl;
        this.attachScopeListeners();

        calendarCtrl.updateVirtualRepeat();

		if (calendarCtrl.ngModelCtrl) {
			calendarCtrl.ngModelCtrl.$render();
		}
    };

    CalendarMonthCtrl.prototype.getSelectedMonthIndex = function () {
        var calendarCtrl = this.calendarCtrl;

        return this.dateUtil.getMonthDistance(
            calendarCtrl.firstRenderableDate,
            calendarCtrl.displayDate || calendarCtrl.selectedDate || calendarCtrl.today
        );
    };


    CalendarMonthCtrl.prototype.changeDisplayDate = function (date) {
		var self = this,
			animationPromise;

        if (!this.isInitialized) {
            this.buildWeekHeader();
            this.calendarCtrl.hideVerticalScrollbar(this);
            this.isInitialized = true;
            return this.$q.when(this.$q.defer('ng_md_ui_datepickermd_CMC_changedisplay_init_when'));
        }

        if (!this.dateUtil.isValidDate(date) || this.isMonthTransitionInProgress) {
            return this.$q.when(this.$q.defer('ng_md_ui_datepickermd_CMC_changedisplay_invalid_date_when'));
        }

        this.isMonthTransitionInProgress = true;
        animationPromise = this.animateDateChange(date);

        this.calendarCtrl.displayDate = date;

        animationPromise.then(function () {
            self.isMonthTransitionInProgress = false;
        });

        return animationPromise;
    };

    CalendarMonthCtrl.prototype.animateDateChange = function (date) {
        if (this.dateUtil.isValidDate(date)) {
            var monthDistance = this.dateUtil.getMonthDistance(this.calendarCtrl.firstRenderableDate, date);
            this.calendarScroller.scrollTop = monthDistance * TBODY_HEIGHT_MON;
        }

        return this.$q.when(this.$q.defer('ng_md_ui_datepickermd_CMC_animatedatechange_when'));
    };

    CalendarMonthCtrl.prototype.buildWeekHeader = function () {
        var firstDayOfWeek = this.dateLocale.firstDayOfWeek,
			shortDays = this.dateLocale.shortDays,
			row = document.createElement('tr'),
			i = 0,
			th;

        for (i = 0; i < 7; i++) {
            th = document.createElement('th');
            th.textContent = shortDays[(i + firstDayOfWeek) % 7];
            row.appendChild(th);
        }

        this.$element.find('thead').append(row);
    };

    CalendarMonthCtrl.prototype.attachScopeListeners = function () {
        var self = this;

        self.$scope.$on('md-calendar-parent-changed', function ng_md_ui_datepicker_CC_cal_parent_on(event, value) {
            self.calendarCtrl.changeSelectedDate(value);
            self.changeDisplayDate(value);
        });

        self.$scope.$on('md-calendar-parent-action', angular.bind(this, this.handleKeyEvent));
    };

    CalendarMonthCtrl.prototype.handleKeyEvent = function (event, action) {
        var calendarCtrl = this.calendarCtrl,
			displayDate = calendarCtrl.displayDate,
			date = null,
			dateUtil;

        if (action === 'select') {
            calendarCtrl.setNgModelValue(displayDate);
        } else {

            dateUtil = this.dateUtil;

            switch (action) {
                case 'move-right':
                    date = dateUtil.incrementDays(displayDate, 1);
                    break;
                case 'move-left':
                    date = dateUtil.incrementDays(displayDate, -1);
                    break;

                case 'move-page-down':
                    date = dateUtil.incrementMonths(displayDate, 1);
                    break;
                case 'move-page-up':
                    date = dateUtil.incrementMonths(displayDate, -1);
                    break;

                case 'move-row-down':
                    date = dateUtil.incrementDays(displayDate, 7);
                    break;
                case 'move-row-up':
                    date = dateUtil.incrementDays(displayDate, -7);
                    break;

                case 'start':
                    date = dateUtil.getFirstDateOfMonth(displayDate);
                    break;
                case 'end':
                    date = dateUtil.getLastDateOfMonth(displayDate);
                    break;
            }

            if (date) {
                date = this.dateUtil.clampDate(date, calendarCtrl.minDate, calendarCtrl.maxDate);

                this.changeDisplayDate(date).then(function () {
                    calendarCtrl.focus(date);
                });
            }
        }
    };


    function mdCalendarMonthBodyDirective($compile, $$mdSvgRegistry) {
        var ARROW_ICON = $compile('<md-icon md-svg-src="' +
            $$mdSvgRegistry.mdTabsArrow + '"></md-icon>')({})[0];

        return {
            require: ['^^mdCalendar', '^^mdCalendarMonth', 'mdCalendarMonthBody'],
            scope: {
                offset: '=mdMonthOffset'
            },
            controller: ["$element", "$$mdDateUtil", "$mdDateLocale", CalendarMonthBodyCtrl],
            controllerAs: 'mdMonthBodyCtrl',
            bindToController: true,
            link: function (scope, element, attrs, controllers) {
                var calendarCtrl = controllers[0];
                var monthCtrl = controllers[1];
                var monthBodyCtrl = controllers[2];

                monthBodyCtrl.calendarCtrl = calendarCtrl;
                monthBodyCtrl.monthCtrl = monthCtrl;
                monthBodyCtrl.arrowIcon = ARROW_ICON.cloneNode(true);

                scope.$watch(function () {
                    return monthBodyCtrl.offset;
                }, function (offset) {
                    if (angular.isNumber(offset)) {
                        monthBodyCtrl.generateContent();
                    }
                });
            }
        };
    }

    function CalendarMonthBodyCtrl($element, $$mdDateUtil, $mdDateLocale) {

        this.$element = $element;
        this.dateUtil = $$mdDateUtil;
        this.dateLocale = $mdDateLocale;
        this.monthCtrl = null;
        this.calendarCtrl = null;
        this.offset = null;
        this.focusAfterAppend = null;
    }

    CalendarMonthBodyCtrl.prototype.generateContent = function () {
        var date = this.dateUtil.incrementMonths(this.calendarCtrl.firstRenderableDate, this.offset);

        this.$element
            .empty()
            .append(this.buildCalendarForMonth(date));

        if (this.focusAfterAppend) {
            this.focusAfterAppend.classList.add(this.calendarCtrl.FOCUSED_DATE_CLASS);
            this.focusAfterAppend.focus();
            this.focusAfterAppend = null;
        }
    };


    CalendarMonthBodyCtrl.prototype.buildDateCell = function (opt_date) {
        var monthCtrl = this.monthCtrl,
			calendarCtrl = this.calendarCtrl,
			cell = document.createElement('td'),
			cellText,
			selectionIndicator;

        cell.tabIndex = -1;
        cell.classList.add('md-calendar-date');
        cell.setAttribute('role', 'gridcell');

        if (opt_date) {
            cell.setAttribute('tabindex', '-1');
            cell.setAttribute('aria-label', this.dateLocale.longDateFormatter(opt_date));
            cell.id = calendarCtrl.getDateId(opt_date, 'month');

            cell.setAttribute('data-timestamp', opt_date.getTime());

            if (this.dateUtil.isSameDay(opt_date, calendarCtrl.today)) {
                cell.classList.add(calendarCtrl.TODAY_CLASS);
            }

            if (this.dateUtil.isValidDate(calendarCtrl.selectedDate) &&
                this.dateUtil.isSameDay(opt_date, calendarCtrl.selectedDate)) {
                cell.classList.add(calendarCtrl.SELECTED_DATE_CLASS);
                cell.setAttribute('aria-selected', 'true');
            }

            cellText = this.dateLocale.dates[opt_date.getDate()];

            if (this.isDateEnabled(opt_date)) {

                selectionIndicator = document.createElement('span');
                selectionIndicator.classList.add('md-calendar-date-selection-indicator');
                selectionIndicator.textContent = cellText;
                cell.appendChild(selectionIndicator);
                cell.addEventListener('click', monthCtrl.cellClickHandler);

                if (calendarCtrl.displayDate && this.dateUtil.isSameDay(opt_date, calendarCtrl.displayDate)) {
                    this.focusAfterAppend = cell;
                }
            } else {
                cell.classList.add('md-calendar-date-disabled');
                cell.textContent = cellText;
            }
        }

        return cell;
    };

    CalendarMonthBodyCtrl.prototype.isDateEnabled = function (opt_date) {
        return this.dateUtil.isDateWithinRange(opt_date,
                this.calendarCtrl.minDate, this.calendarCtrl.maxDate) &&
            (!angular.isFunction(this.calendarCtrl.dateFilter) ||
                this.calendarCtrl.dateFilter(opt_date));
    };

    CalendarMonthBodyCtrl.prototype.buildDateRow = function (rowNumber) {
        var row = document.createElement('tr');

        row.setAttribute('role', 'row');
        row.setAttribute('aria-label', this.dateLocale.weekNumberFormatter(rowNumber));

        return row;
    };

    CalendarMonthBodyCtrl.prototype.buildCalendarForMonth = function (opt_dateInMonth) {
        var date = this.dateUtil.isValidDate(opt_dateInMonth) ? opt_dateInMonth : new Date(),
			firstDayOfMonth = this.dateUtil.getFirstDateOfMonth(date),
			firstDayOfTheWeek = this.getLocaleDay_(firstDayOfMonth),
			numberOfDaysInMonth = this.dateUtil.getNumberOfDaysInMonth(date),
			monthBody = document.createDocumentFragment(),
			rowNumber = 1,
			row = this.buildDateRow(rowNumber),
			isFinalMonth,
			blankCellOffset = 0,
			monthLabelCell,
			monthLabelCellContent,
			calendarCtrl,
			monthLabelRow,
			i = 0,
			dayOfWeek,
			iterationDate,
			d = 0,
			cell,
			whitespaceRow,
			j = 0;

        monthBody.appendChild(row);

        isFinalMonth = this.offset === this.monthCtrl.items.length - 1;

        monthLabelCell = document.createElement('td');
        monthLabelCellContent = document.createElement('span');
        calendarCtrl = this.calendarCtrl;

        monthLabelCellContent.textContent = this.dateLocale.monthHeaderFormatter(date);
        monthLabelCell.appendChild(monthLabelCellContent);
        monthLabelCell.classList.add('md-calendar-month-label');

        if (calendarCtrl.maxDate && firstDayOfMonth > calendarCtrl.maxDate) {
            monthLabelCell.classList.add('md-calendar-month-label-disabled');
        } else if (!calendarCtrl.mode) {
            monthLabelCell.addEventListener('click', this.monthCtrl.headerClickHandler);
            monthLabelCell.setAttribute('data-timestamp', firstDayOfMonth.getTime());
            monthLabelCell.setAttribute('aria-label', this.dateLocale.monthFormatter(date));
            monthLabelCell.classList.add('md-calendar-label-clickable');
            monthLabelCell.appendChild(this.arrowIcon.cloneNode(true));
        }

        if (firstDayOfTheWeek <= 2) {
            monthLabelCell.setAttribute('colspan', '7');

            monthLabelRow = this.buildDateRow();
            monthLabelRow.appendChild(monthLabelCell);
            monthBody.insertBefore(monthLabelRow, row);

            if (isFinalMonth) {
                return monthBody;
            }
        } else {
            blankCellOffset = 3;
            monthLabelCell.setAttribute('colspan', '3');
            row.appendChild(monthLabelCell);
        }

        for (i = blankCellOffset; i < firstDayOfTheWeek; i++) {
            row.appendChild(this.buildDateCell());
        }

        dayOfWeek = firstDayOfTheWeek;
		iterationDate = firstDayOfMonth;

        for (d = 1; d <= numberOfDaysInMonth; d++) {

            if (dayOfWeek === 7) {

                if (isFinalMonth) {
                    return monthBody;
                }

                dayOfWeek = 0;
                rowNumber++;
                row = this.buildDateRow(rowNumber);
                monthBody.appendChild(row);
            }

            iterationDate.setDate(d);
            cell = this.buildDateCell(iterationDate);
            row.appendChild(cell);

            dayOfWeek++;
        }

        while (row.childNodes.length < 7) {
            row.appendChild(this.buildDateCell());
        }

        while (monthBody.childNodes.length < 6) {
            whitespaceRow = this.buildDateRow();

            for (j = 0; j < 7; j += 1) {
                whitespaceRow.appendChild(this.buildDateCell());
            }

            monthBody.appendChild(whitespaceRow);
        }

        return monthBody;
    };

    CalendarMonthBodyCtrl.prototype.getLocaleDay_ = function (date) {
        return (date.getDay() + (7 - this.dateLocale.firstDayOfWeek)) % 7;
    };


    var TBODY_HEIGHT_YR = 88;

    function calendarYearDirective() {
        return {
            template: '<div class="md-calendar-scroll-mask">' +
                '<md-virtual-repeat-container class="md-calendar-scroll-container">' +
                '<table role="grid" tabindex="0" class="md-calendar" aria-readonly="true">' +
                '<tbody ' +
                'md-calendar-year-body ' +
                'role="rowgroup" ' +
                'md-virtual-repeat="i in yearCtrl.items" ' +
                'md-year-offset="$index" class="md-calendar-year" ' +
                'md-start-index="yearCtrl.getFocusedYearIndex()" ' +
                'md-item-size="' + TBODY_HEIGHT_YR + '">' +

                '<tr aria-hidden="true" md-force-height="\'' + TBODY_HEIGHT_YR + 'px\'"></tr>' +
                '</tbody>' +
                '</table>' +
                '</md-virtual-repeat-container>' +
                '</div>',
            require: ['^^mdCalendar', 'mdCalendarYear'],
            controller: ["$element", "$scope", "$animate", "$q", "$$mdDateUtil", "$mdUtil", CalendarYearCtrl],
            controllerAs: 'yearCtrl',
            bindToController: true,
            link: function (scope, element, attrs, controllers) {
                var calendarCtrl = controllers[0],
					yearCtrl = controllers[1];

                yearCtrl.initialize(calendarCtrl);
            }
        };
    }

    function CalendarYearCtrl($element, $scope, $animate, $q, $$mdDateUtil, $mdUtil) {
		var self = this;

        this.$element = $element;
        this.$scope = $scope;
        this.$animate = $animate;
        this.$q = $q;
        this.dateUtil = $$mdDateUtil;
        this.calendarScroller = $element[0].querySelector('.md-virtual-repeat-scroller');
        this.isInitialized = false;
        this.isMonthTransitionInProgress = false;
        this.$mdUtil = $mdUtil;

        this.cellClickHandler = function () {
            self.onTimestampSelected($$mdDateUtil.getTimestampFromNode(this));
        };
    }

    CalendarYearCtrl.prototype.initialize = function (calendarCtrl) {

        this.items = {
            length: this.dateUtil.getYearDistance(
                calendarCtrl.firstRenderableDate,
                calendarCtrl.lastRenderableDate
            ) + 1
        };

        this.calendarCtrl = calendarCtrl;
        this.attachScopeListeners();
        calendarCtrl.updateVirtualRepeat();

		if (calendarCtrl.ngModelCtrl) {
			calendarCtrl.ngModelCtrl.$render();
		}
    };

    CalendarYearCtrl.prototype.getFocusedYearIndex = function () {
        var calendarCtrl = this.calendarCtrl;

        return this.dateUtil.getYearDistance(
            calendarCtrl.firstRenderableDate,
            calendarCtrl.displayDate || calendarCtrl.selectedDate || calendarCtrl.today
        );
    };

    CalendarYearCtrl.prototype.changeDate = function (date) {
		var self = this,
			animationPromise;

        if (!this.isInitialized) {
            this.calendarCtrl.hideVerticalScrollbar(this);
            this.isInitialized = true;
            return this.$q.when(this.$q.defer('ng_md_ui_datepickermd_CYC_changedate_when'));
        } else if (this.dateUtil.isValidDate(date) && !this.isMonthTransitionInProgress) {

            animationPromise = this.animateDateChange(date);

            self.isMonthTransitionInProgress = true;
            self.calendarCtrl.displayDate = date;

            return animationPromise.then(function () {
                self.isMonthTransitionInProgress = false;
            });
        }
    };

    CalendarYearCtrl.prototype.animateDateChange = function (date) {
        if (this.dateUtil.isValidDate(date)) {
            var monthDistance = this.dateUtil.getYearDistance(this.calendarCtrl.firstRenderableDate, date);
            this.calendarScroller.scrollTop = monthDistance * TBODY_HEIGHT_YR;
        }

        return this.$q.when(this.$q.defer('ng_md_ui_datepickermd_CYC_animatechangedate_when'));
    };

    CalendarYearCtrl.prototype.handleKeyEvent = function (event, action) {
        var self = this,
			calendarCtrl = self.calendarCtrl,
			displayDate = calendarCtrl.displayDate,
			date,
			dateUtil;

        if (action === 'select') {
            self.changeDate(displayDate).then(function () {
                self.onTimestampSelected(displayDate);
            });
        } else {
            date = null;
            dateUtil = self.dateUtil;

            switch (action) {
                case 'move-right':
                    date = dateUtil.incrementMonths(displayDate, 1);
                    break;
                case 'move-left':
                    date = dateUtil.incrementMonths(displayDate, -1);
                    break;

                case 'move-row-down':
                    date = dateUtil.incrementMonths(displayDate, 6);
                    break;
                case 'move-row-up':
                    date = dateUtil.incrementMonths(displayDate, -6);
                    break;
            }

            if (date) {
                var min = calendarCtrl.minDate ? dateUtil.getFirstDateOfMonth(calendarCtrl.minDate) : null;
                var max = calendarCtrl.maxDate ? dateUtil.getFirstDateOfMonth(calendarCtrl.maxDate) : null;
                date = dateUtil.getFirstDateOfMonth(self.dateUtil.clampDate(date, min, max));

                self.changeDate(date).then(function () {
                    calendarCtrl.focus(date);
                });
            }
        }
    };

    CalendarYearCtrl.prototype.attachScopeListeners = function () {
        var self = this;

        self.$scope.$on('md-calendar-parent-changed', function ng_md_ui_datepicker_CYC_cal_parent_on(event, value) {
            self.calendarCtrl.changeSelectedDate(value ? self.dateUtil.getFirstDateOfMonth(value) : value);
            self.changeDate(value);
        });

        self.$scope.$on('md-calendar-parent-action', angular.bind(self, self.handleKeyEvent));
    };

    CalendarYearCtrl.prototype.onTimestampSelected = function (timestamp) {
        var calendarCtrl = this.calendarCtrl;

        if (calendarCtrl.mode) {
            this.$mdUtil.nextTick(function () {
                calendarCtrl.setNgModelValue(timestamp);
            });
        } else {
            calendarCtrl.setCurrentView('month', timestamp);
        }
    };


    function mdCalendarYearDirective() {
        return {
            require: ['^^mdCalendar', '^^mdCalendarYear', 'mdCalendarYearBody'],
            scope: {
                offset: '=mdYearOffset'
            },
            controller: ["$element", "$$mdDateUtil", "$mdDateLocale", CalendarYearBodyCtrl],
            controllerAs: 'mdYearBodyCtrl',
            bindToController: true,
            link: function (scope, element, attrs, controllers) {
                var calendarCtrl = controllers[0];
                var yearCtrl = controllers[1];
                var yearBodyCtrl = controllers[2];

                yearBodyCtrl.calendarCtrl = calendarCtrl;
                yearBodyCtrl.yearCtrl = yearCtrl;

                scope.$watch(function () {
                    return yearBodyCtrl.offset;
                }, function (offset) {
                    if (angular.isNumber(offset)) {
                        yearBodyCtrl.generateContent();
                    }
                });
            }
        };
    }

    function CalendarYearBodyCtrl($element, $$mdDateUtil, $mdDateLocale) {

        this.$element = $element;
        this.dateUtil = $$mdDateUtil;
        this.dateLocale = $mdDateLocale;
        this.calendarCtrl = null;
        this.yearCtrl = null;
        this.offset = null;
        this.focusAfterAppend = null;
    }

    CalendarYearBodyCtrl.prototype.generateContent = function () {
        var date = this.dateUtil.incrementYears(this.calendarCtrl.firstRenderableDate, this.offset);

        this.$element
            .empty()
            .append(this.buildCalendarForYear(date));

        if (this.focusAfterAppend) {
            this.focusAfterAppend.classList.add(this.calendarCtrl.FOCUSED_DATE_CLASS);
            this.focusAfterAppend.focus();
            this.focusAfterAppend = null;
        }
    };

    CalendarYearBodyCtrl.prototype.buildMonthCell = function (year, month) {
        var calendarCtrl = this.calendarCtrl,
			yearCtrl = this.yearCtrl,
			cell = this.buildBlankCell(),
			firstOfMonth = new Date(year, month, 1),
			cellText,
			selectionIndicator;

        cell.setAttribute('aria-label', this.dateLocale.monthFormatter(firstOfMonth));
        cell.id = calendarCtrl.getDateId(firstOfMonth, 'year');

        cell.setAttribute('data-timestamp', firstOfMonth.getTime());

        if (this.dateUtil.isSameMonthAndYear(firstOfMonth, calendarCtrl.today)) {
            cell.classList.add(calendarCtrl.TODAY_CLASS);
        }

        if (this.dateUtil.isValidDate(calendarCtrl.selectedDate) &&
            this.dateUtil.isSameMonthAndYear(firstOfMonth, calendarCtrl.selectedDate)) {
            cell.classList.add(calendarCtrl.SELECTED_DATE_CLASS);
            cell.setAttribute('aria-selected', 'true');
        }

        cellText = this.dateLocale.shortMonths[month];

        if (this.dateUtil.isMonthWithinRange(firstOfMonth,
                calendarCtrl.minDate, calendarCtrl.maxDate)) {
            selectionIndicator = document.createElement('span');
            selectionIndicator.classList.add('md-calendar-date-selection-indicator');
            selectionIndicator.textContent = cellText;
            cell.appendChild(selectionIndicator);
            cell.addEventListener('click', yearCtrl.cellClickHandler);

            if (calendarCtrl.displayDate && this.dateUtil.isSameMonthAndYear(firstOfMonth, calendarCtrl.displayDate)) {
                this.focusAfterAppend = cell;
            }
        } else {
            cell.classList.add('md-calendar-date-disabled');
            cell.textContent = cellText;
        }

        return cell;
    };

    CalendarYearBodyCtrl.prototype.buildBlankCell = function () {
        var cell = document.createElement('td');

        cell.tabIndex = -1;
        cell.classList.add('md-calendar-date');
        cell.setAttribute('role', 'gridcell');

        cell.setAttribute('tabindex', '-1');

        return cell;
    };

    CalendarYearBodyCtrl.prototype.buildCalendarForYear = function (date) {
        var year = date.getFullYear(),
			yearBody = document.createDocumentFragment(),
			i = 0,
			firstRow = document.createElement('tr'),
			labelCell = document.createElement('td'),
			secondRow;

        labelCell.className = 'md-calendar-month-label';
        labelCell.textContent = year;
        firstRow.appendChild(labelCell);

        for (i = 0; i < 6; i++) {
            firstRow.appendChild(this.buildMonthCell(year, i));
        }

        yearBody.appendChild(firstRow);

        secondRow = document.createElement('tr');
        secondRow.appendChild(this.buildBlankCell());

        for (i = 6; i < 12; i++) {
            secondRow.appendChild(this.buildMonthCell(year, i));
        }

        yearBody.appendChild(secondRow);

        return yearBody;
    };


    function datePickerDirective($$mdSvgRegistry, $mdUtil, $mdAria, inputDirective) {
        return {
            template: function (tElement, tAttrs) {

                var hiddenIcons = tAttrs.mdHideIcons,
					ariaLabelValue = tAttrs.ariaLabel || tAttrs.mdPlaceholder,
					calendarButton = (hiddenIcons === 'all' || hiddenIcons === 'calendar') ? '' :
						'<md-button class="md-datepicker-button md-icon-button" type="button" ' +
						'tabindex="-1" aria-hidden="true" ' +
						'ng-click="ctrl.openCalendarPane($event)">' +
						'<md-icon class="md-datepicker-calendar-icon" aria-label="md-calendar" ' +
						'md-svg-src="' + $$mdSvgRegistry.mdCalendar + '"></md-icon>' +
						'</md-button>',
					triangleButton = '';

                if (hiddenIcons !== 'all' && hiddenIcons !== 'triangle') {
                    triangleButton = '' +
                        '<md-button type="button" md-no-ink ' +
                        'class="md-datepicker-triangle-button md-icon-button" ' +
                        'ng-click="ctrl.openCalendarPane($event)" ' +
                        'aria-label="{{::ctrl.locale.msgOpenCalendar}}">' +
                        '<div class="md-datepicker-expand-triangle"></div>' +
                        '</md-button>';

                    tElement.addClass(HAS_TRIANGLE_ICON_CLASS);
                }

                return calendarButton +
                    '<div class="md-datepicker-input-container" ng-class="{\'md-datepicker-focused\': ctrl.isFocused}">' +
                    '<input ' +
                    (ariaLabelValue ? 'aria-label="' + ariaLabelValue + '" ' : '') +
                    'class="md-datepicker-input" ' +
                    'aria-haspopup="true" ' +
                    'aria-expanded="{{ctrl.isCalendarOpen}}" ' +
                    'ng-focus="ctrl.setFocused(true)" ' +
                    'ng-blur="ctrl.setFocused(false)"> ' +
                    triangleButton +
                    '</div>' +

                    '<div class="md-datepicker-calendar-pane md-whiteframe-z1" id="{{::ctrl.calendarPaneId}}">' +
                    '<div class="md-datepicker-input-mask">' +
                    '<div class="md-datepicker-input-mask-opaque"></div>' +
                    '</div>' +
                    '<div class="md-datepicker-calendar">' +
                    '<md-calendar role="dialog" aria-label="{{::ctrl.locale.msgCalendar}}" ' +
                    'md-current-view="{{::ctrl.currentView}}" ' +
                    'md-mode="{{::ctrl.mode}}" ' +
                    'md-min-date="ctrl.minDate" ' +
                    'md-max-date="ctrl.maxDate" ' +
                    'md-date-filter="ctrl.dateFilter" ' +
                    'ng-model="ctrl.date" ng-if="ctrl.isCalendarOpen">' +
                    '</md-calendar>' +
                    '</div>' +
                    '</div>';
            },
            require: ['ngModel', 'mdDatepicker', '?^mdInputContainer', '?^form'],
            scope: {
                minDate: '=mdMinDate',
                maxDate: '=mdMaxDate',
                placeholder: '@mdPlaceholder',
                currentView: '@mdCurrentView',
                mode: '@mdMode',
                dateFilter: '=mdDateFilter',
                isOpen: '=?mdIsOpen',
                debounceInterval: '=mdDebounceInterval',
                dateLocale: '=mdDateLocale'
            },
            controller: ["$scope", "$element", "$attrs", "$window", "$mdConstant", "$mdTheming", "$mdUtil", "$mdDateLocale", "$$mdDateUtil", "$$rAF", "$filter", DatePickerCtrl],
            controllerAs: 'ctrl',
            bindToController: true,
            link: function (scope, element, attr, controllers) {
                var ngModelCtrl = controllers[0],
					mdDatePickerCtrl = controllers[1],
					mdInputContainer = controllers[2],
					parentForm = controllers[3],
					mdNoAsterisk = $mdUtil.parseAttributeBoolean(attr.mdNoAsterisk),
					spacer,
					parentSubmittedWatcher;

                mdDatePickerCtrl.configureNgModel(ngModelCtrl, mdInputContainer, inputDirective);

                if (mdInputContainer) {
                    spacer = element[0].querySelector('.md-errors-spacer');

                    if (spacer) {
                        element.after(angular.element('<div>').append(spacer));
                    }

                    mdInputContainer.setHasPlaceholder(attr.mdPlaceholder);
                    mdInputContainer.input = element;
                    mdInputContainer.element
                        .addClass(INPUT_CONTAINER_CLASS)
                        .toggleClass(HAS_CALENDAR_ICON_CLASS, attr.mdHideIcons !== 'calendar' && attr.mdHideIcons !== 'all');

                    if (!mdInputContainer.label) {
                        $mdAria.expect(element, 'aria-label', attr.mdPlaceholder);
                    } else if (!mdNoAsterisk) {
                        attr.$observe('required', function (value) {
                            mdInputContainer.label.toggleClass('md-required', !!value);
                        });
                    }

                    scope.$watch(mdInputContainer.isErrorGetter || function () {
                        return ngModelCtrl.$invalid && (ngModelCtrl.$touched || (parentForm && parentForm.$submitted));
                    }, mdInputContainer.setInvalid);
                } else if (parentForm) {

                    parentSubmittedWatcher = scope.$watch(function () {
                        return parentForm.$submitted;
                    }, function (isSubmitted) {
                        if (isSubmitted) {
                            mdDatePickerCtrl.updateErrorState();
                            parentSubmittedWatcher();
                        }
                    });
                }
            }
        };
    }

    var EXTRA_INPUT_SIZE = 3;
    var INVALID_CLASS = 'md-datepicker-invalid';
    var OPEN_CLASS = 'md-datepicker-open';
    var INPUT_CONTAINER_CLASS = '_md-datepicker-floating-label';
    var HAS_CALENDAR_ICON_CLASS = '_md-datepicker-has-calendar-icon';
    var HAS_TRIANGLE_ICON_CLASS = '_md-datepicker-has-triangle-icon';
    var DEFAULT_DEBOUNCE_INTERVAL = 500;
    var CALENDAR_PANE_HEIGHT = 368;
    var CALENDAR_PANE_WIDTH = 360;
    var IS_MOBILE_REGEX = /ipad|iphone|ipod|android/i;

    function DatePickerCtrl($scope, $element, $attrs, $window, $mdConstant, $mdTheming, $mdUtil, $mdDateLocale, $$mdDateUtil, $$rAF, $filter) {

		var self = this;

        this.$window = $window;
        this.dateUtil = $$mdDateUtil;
        this.$mdConstant = $mdConstant;
        this.$mdUtil = $mdUtil;
        this.$$rAF = $$rAF;
        this.$mdDateLocale = $mdDateLocale;
        this.documentElement = angular.element(document.documentElement);
        this.ngModelCtrl = null;
        this.inputElement = $element[0].querySelector('input');
        this.ngInputElement = angular.element(this.inputElement);
        this.inputContainer = $element[0].querySelector('.md-datepicker-input-container');
        this.calendarPane = $element[0].querySelector('.md-datepicker-calendar-pane');
        this.calendarButton = $element[0].querySelector('.md-datepicker-button');
        this.inputMask = angular.element($element[0].querySelector('.md-datepicker-input-mask-opaque'));
        this.$element = $element;
        this.$attrs = $attrs;
        this.$scope = $scope;
        this.date = null;
        this.isFocused = false;
        this.isDisabled = undefined;
        this.setDisabled($element[0].disabled || angular.isString($attrs.disabled));
        this.isCalendarOpen = false;
        this.openOnFocus = $attrs.hasOwnProperty('mdOpenOnFocus');
        this.mdInputContainer = null;
        this.calendarPaneOpenedFrom = null;
        this.calendarPaneId = 'md-date-pane-' + $mdUtil.nextUid();
        this.bodyClickHandler = angular.bind(this, this.handleBodyClick);
        this.windowEventName = IS_MOBILE_REGEX.test(
            navigator.userAgent || navigator.vendor || window.opera
        ) ? 'orientationchange' : 'resize';
        this.windowEventHandler = $mdUtil.debounce(angular.bind(this, this.closeCalendarPane), 100, null, false);
        this.windowBlurHandler = angular.bind(this, this.handleWindowBlur);
        this.ngDateFilter = $filter('date');
        this.leftMargin = 20;
        this.topMargin = null;

        if ($attrs.tabindex) {
            this.ngInputElement.attr('tabindex', $attrs.tabindex);
            $attrs.$set('tabindex', null);
        } else {
            $attrs.$set('tabindex', '-1');
        }

        $attrs.$set('aria-owns', this.calendarPaneId);

        $mdTheming($element);
        $mdTheming(angular.element(this.calendarPane));

        $scope.$on('$destroy', function ng_md_ui_datepicker_DPC_on() {
            self.detachCalendarPane();
        });

        if ($attrs.mdIsOpen) {
            $scope.$watch('ctrl.isOpen', function (shouldBeOpen) {
                if (shouldBeOpen) {
                    self.openCalendarPane({
                        target: self.inputElement
                    });
                } else {
                    self.closeCalendarPane();
                }
            });
        }
    }

    DatePickerCtrl.prototype.$onInit = function () {

        this.locale = this.dateLocale ? angular.extend({}, this.$mdDateLocale, this.dateLocale) : this.$mdDateLocale;

        this.installPropertyInterceptors();
        this.attachChangeListeners();
        this.attachInteractionListeners();
    };

    DatePickerCtrl.prototype.configureNgModel = function (ngModelCtrl, mdInputContainer, inputDirective) {
        var self = this,
			updateOn;

        this.ngModelCtrl = ngModelCtrl;
        this.mdInputContainer = mdInputContainer;
        this.$attrs.$set('type', 'date');

        inputDirective[0].link.pre(this.$scope, {
            on: angular.noop,
            val: angular.noop,
            0: {}
        }, this.$attrs, [ngModelCtrl]);

        self.ngModelCtrl.$formatters.push(function (value) {
            var parsedValue = angular.isDefined(value) ? value : null;

            if (!(value instanceof Date)) {
                parsedValue = Date.parse(value);

                if (!isNaN(parsedValue) && angular.isNumber(parsedValue)) {
                    value = new Date(parsedValue);
                }

                if (value && !(value instanceof Date)) {
                    throw Error(
                        'The ng-model for md-datepicker must be a Date instance or a value ' +
                        'that can be parsed into a date. Currently the model is of type: ' + typeof value
                    );
                }
            }

            self.onExternalChange(value);

            return value;
        });

        ngModelCtrl.$viewChangeListeners.unshift(angular.bind(this, this.updateErrorState));

        updateOn = self.$mdUtil.getModelOption(ngModelCtrl, 'updateOn');

        if (updateOn) {
            this.ngInputElement.on(
                updateOn,
                angular.bind(this.$element, this.$element.triggerHandler, updateOn)
            );
        }
    };

    DatePickerCtrl.prototype.attachChangeListeners = function () {
        var self = this,
			debounceInterval;

        self.$scope.$on('md-calendar-change', function ng_md_ui_datepicker_DPC_change_on(event, date) {
            self.setModelValue(date);
            self.onExternalChange(date);
            self.closeCalendarPane();
        });

        self.ngInputElement.on('input', angular.bind(self, self.resizeInputElement));

        debounceInterval = angular.isDefined(this.debounceInterval) ? this.debounceInterval : DEFAULT_DEBOUNCE_INTERVAL;

        self.ngInputElement.on(
			'input',
			self.$mdUtil.debounce(
				self.handleInputEvent,
				debounceInterval,
				self,
				false
			)
		);
    };

    DatePickerCtrl.prototype.attachInteractionListeners = function () {
        var self = this,
			$scope = this.$scope,
			keyCodes = this.$mdConstant.KEY_CODE;

        self.ngInputElement.on('keydown', function (event) {
            if (event.altKey && event.keyCode == keyCodes.DOWN_ARROW) {
                self.openCalendarPane(event);
                $scope.$digest();
            }
        });

        if (self.openOnFocus) {
            self.ngInputElement.on('focus', angular.bind(self, self.openCalendarPane));
            angular.element(self.$window).on('blur', self.windowBlurHandler);

            $scope.$on('$destroy', function ng_md_ui_datepicker_DPC_interact_focus_on() {
                angular.element(self.$window).off('blur', self.windowBlurHandler);
            });
        }

        $scope.$on('md-calendar-close', function ng_md_ui_datepicker_DPC_interact_close_on() {
            self.closeCalendarPane();
        });
    };

    DatePickerCtrl.prototype.installPropertyInterceptors = function () {
        var self = this,
			scope;

        if (this.$attrs.ngDisabled) {

            scope = this.$scope.$parent;

            if (scope) {
                scope.$watch(this.$attrs.ngDisabled, function (isDisabled) {
                    self.setDisabled(isDisabled);
                });
            }
        }

        Object.defineProperty(this, 'placeholder', {
            get: function () {
                return self.inputElement.placeholder;
            },
            set: function (value) {
                self.inputElement.placeholder = value || '';
            }
        });
    };

    DatePickerCtrl.prototype.setDisabled = function (isDisabled) {
        this.isDisabled = isDisabled;
        this.inputElement.disabled = isDisabled;

        if (this.calendarButton) {
            this.calendarButton.disabled = isDisabled;
        }
    };

    DatePickerCtrl.prototype.updateErrorState = function (opt_date) {
        var date = opt_date || this.date;

        this.clearErrorState();

        if (this.dateUtil.isValidDate(date)) {

            date = this.dateUtil.createDateAtMidnight(date);

            if (this.dateUtil.isValidDate(this.minDate)) {
                var minDate = this.dateUtil.createDateAtMidnight(this.minDate);
                this.ngModelCtrl.$setValidity('mindate', date >= minDate);
            }

            if (this.dateUtil.isValidDate(this.maxDate)) {
                var maxDate = this.dateUtil.createDateAtMidnight(this.maxDate);
                this.ngModelCtrl.$setValidity('maxdate', date <= maxDate);
            }

            if (angular.isFunction(this.dateFilter)) {
                this.ngModelCtrl.$setValidity('filtered', this.dateFilter(date));
            }
        } else {
            this.ngModelCtrl.$setValidity('valid', (date === null || date === undefined));
        }

        angular.element(this.inputContainer).toggleClass(INVALID_CLASS, !this.ngModelCtrl.$valid);
    };

    DatePickerCtrl.prototype.clearErrorState = function () {
        this.inputContainer.classList.remove(INVALID_CLASS);
        ['mindate', 'maxdate', 'filtered', 'valid'].forEach(function (field) {
            this.ngModelCtrl.$setValidity(field, true);
        }, this);
    };

    DatePickerCtrl.prototype.resizeInputElement = function () {
        this.inputElement.size = this.inputElement.value.length + EXTRA_INPUT_SIZE;
    };

    DatePickerCtrl.prototype.handleInputEvent = function () {
        var inputString = this.inputElement.value,
			parsedDate = inputString ? this.locale.parseDate(inputString) : null,
			isValidInput;

        this.dateUtil.setDateTimeToMidnight(parsedDate);

        isValidInput = inputString === '' || (
            this.dateUtil.isValidDate(parsedDate) &&
            this.locale.isDateComplete(inputString) &&
            this.isDateEnabled(parsedDate)
        );

        if (isValidInput) {
            this.setModelValue(parsedDate);
            this.date = parsedDate;
        }

        this.updateErrorState(parsedDate);
    };

    DatePickerCtrl.prototype.isDateEnabled = function (opt_date) {
        return this.dateUtil.isDateWithinRange(opt_date, this.minDate, this.maxDate) &&
            (!angular.isFunction(this.dateFilter) || this.dateFilter(opt_date));
    };

    DatePickerCtrl.prototype.attachCalendarPane = function () {
        var calendarPane = this.calendarPane,
			body = document.body,
			elementRect,
			bodyRect,
			paneTop,
			paneLeft,
			viewportTop,
			viewportLeft,
			viewportBottom,
			viewportRight;

        calendarPane.style.transform = '';
        this.$element.addClass(OPEN_CLASS);

		if (this.mdInputContainer) {
			this.mdInputContainer.element.addClass(OPEN_CLASS);
		}

        angular.element(body).addClass('md-datepicker-is-showing');

        elementRect = this.inputContainer.getBoundingClientRect();
        bodyRect = body.getBoundingClientRect();

        if (!this.topMargin || this.topMargin < 0) {
            this.topMargin = (this.inputMask.parent().prop('clientHeight') - this.ngInputElement.prop('clientHeight')) / 2;
        }

        paneTop = elementRect.top - bodyRect.top - this.topMargin;
        paneLeft = elementRect.left - bodyRect.left - this.leftMargin;
        viewportTop = (bodyRect.top < 0 && document.body.scrollTop === 0) ? -bodyRect.top : document.body.scrollTop;
		viewportLeft = (bodyRect.left < 0 && document.body.scrollLeft === 0) ? -bodyRect.left : document.body.scrollLeft;
        viewportBottom = viewportTop + this.$window.innerHeight;
        viewportRight = viewportLeft + this.$window.innerWidth;

        this.inputMask.css({
            position: 'absolute',
            left: this.leftMargin + 'px',
            top: this.topMargin + 'px',
            width: (elementRect.width - 1) + 'px',
            height: (elementRect.height - 2) + 'px'
        });

        if (paneLeft + CALENDAR_PANE_WIDTH > viewportRight) {
            if (viewportRight - CALENDAR_PANE_WIDTH > 0) {
                paneLeft = viewportRight - CALENDAR_PANE_WIDTH;
            } else {
                paneLeft = viewportLeft;
                var scale = this.$window.innerWidth / CALENDAR_PANE_WIDTH;
                calendarPane.style.transform = 'scale(' + scale + ')';
            }

            calendarPane.classList.add('md-datepicker-pos-adjusted');
        }

        if (paneTop + CALENDAR_PANE_HEIGHT > viewportBottom &&
            viewportBottom - CALENDAR_PANE_HEIGHT > viewportTop) {
            paneTop = viewportBottom - CALENDAR_PANE_HEIGHT;
            calendarPane.classList.add('md-datepicker-pos-adjusted');
        }

        calendarPane.style.left = paneLeft + 'px';
        calendarPane.style.top = paneTop + 'px';
        document.body.appendChild(calendarPane);

        this.$$rAF(function () {
            calendarPane.classList.add('md-pane-open');
        });
    };

    DatePickerCtrl.prototype.detachCalendarPane = function () {
        this.$element.removeClass(OPEN_CLASS);

		if (this.mdInputContainer) {
			this.mdInputContainer.element.removeClass(OPEN_CLASS);
		}

        angular.element(document.body).removeClass('md-datepicker-is-showing');

        this.calendarPane.classList.remove('md-pane-open');
        this.calendarPane.classList.remove('md-datepicker-pos-adjusted');

        if (this.isCalendarOpen) {
            this.$mdUtil.enableScrolling();
        }

        if (this.calendarPane.parentNode) {
            this.calendarPane.parentNode.removeChild(this.calendarPane);
        }
    };

    DatePickerCtrl.prototype.openCalendarPane = function (event) {
		var self = this;

        if (!this.isCalendarOpen && !this.isDisabled && !this.inputFocusedOnWindowBlur) {
            this.isCalendarOpen = this.isOpen = true;
            this.calendarPaneOpenedFrom = event.target;

            this.$mdUtil.disableScrollAround(this.calendarPane);

            this.attachCalendarPane();
            this.focusCalendar();
            this.evalAttr('ngFocus');

            this.$mdUtil.nextTick(function () {

                self.documentElement.on('click touchstart', self.bodyClickHandler);
            }, false);

            window.addEventListener(this.windowEventName, this.windowEventHandler);
        }
    };

    DatePickerCtrl.prototype.closeCalendarPane = function () {
		var self = this;

        if (this.isCalendarOpen) {

            self.detachCalendarPane();
            self.ngModelCtrl.$setTouched();
            self.evalAttr('ngBlur');

            self.documentElement.off('click touchstart', self.bodyClickHandler);
            window.removeEventListener(self.windowEventName, self.windowEventHandler);

            self.calendarPaneOpenedFrom.focus();
            self.calendarPaneOpenedFrom = null;

            if (self.openOnFocus) {
                self.$mdUtil.nextTick(reset);
            } else {
                reset();
            }
        }

        function reset() {
            self.isCalendarOpen = self.isOpen = false;
        }
    };

    DatePickerCtrl.prototype.getCalendarCtrl = function () {
        return angular.element(this.calendarPane.querySelector('md-calendar')).controller('mdCalendar');
    };

    DatePickerCtrl.prototype.focusCalendar = function () {
        var self = this;

        this.$mdUtil.nextTick(function () {
            self.getCalendarCtrl().focus();
        }, false);
    };

    DatePickerCtrl.prototype.setFocused = function (isFocused) {
        if (!isFocused) {
            this.ngModelCtrl.$setTouched();
        }

        if (!this.openOnFocus) {
            this.evalAttr(isFocused ? 'ngFocus' : 'ngBlur');
        }

        this.isFocused = isFocused;
    };

    DatePickerCtrl.prototype.handleBodyClick = function (event) {
		var isInCalendar;

        if (this.isCalendarOpen) {
            isInCalendar = this.$mdUtil.getClosest(event.target, 'md-calendar');

            if (!isInCalendar) {
                this.closeCalendarPane();
            }

            this.$scope.$digest();
        }
    };

    DatePickerCtrl.prototype.handleWindowBlur = function () {
        this.inputFocusedOnWindowBlur = document.activeElement === this.inputElement;
    };

    DatePickerCtrl.prototype.evalAttr = function (attr) {
        if (this.$attrs[attr]) {
            this.$scope.$parent.$eval(this.$attrs[attr]);
        }
    };

    DatePickerCtrl.prototype.setModelValue = function (value) {
        var timezone = this.$mdUtil.getModelOption(this.ngModelCtrl, 'timezone');
        this.ngModelCtrl.$setViewValue(this.ngDateFilter(value, 'yyyy-MM-dd', timezone));
    };

    DatePickerCtrl.prototype.onExternalChange = function (value) {
        var timezone = this.$mdUtil.getModelOption(this.ngModelCtrl, 'timezone');

        this.date = value;
        this.inputElement.value = this.locale.formatDate(value, timezone);

		if (this.mdInputContainer) {
			this.mdInputContainer.setHasValue(!!value);
		}

        this.resizeInputElement();
        this.updateErrorState();
    };


angular.module(
	'ng.material.ui.datepicker',
	[
		'ng',
		'ng.material.core',
		'ng.material.core.theming',
		'ng.material.ui.aria',
		'ng.material.ui.icon',
		'ng.material.ui.input',
		'ng.material.ui.repeater'
	]
).config(
	["$provide", function ($provide) {

        function DateLocaleProvider() {

            this.months = null;
            this.shortMonths = null;
            this.days = null;
            this.shortDays = null;
            this.dates = null;
            this.firstDayOfWeek = 0;
            this.formatDate = null;
            this.parseDate = null;
            this.monthHeaderFormatter = null;
            this.weekNumberFormatter = null;
            this.longDateFormatter = null;
            this.isDateComplete = null;
            this.msgCalendar = '';
            this.msgOpenCalendar = '';
        }

        DateLocaleProvider.prototype.$get = function ($locale, $filter) {

			var defaultShortDays,
				defaultDates,
				defaultMsgCalendar,
				defaultMsgOpenCalendar,
				defaultFirstRenderableDate,
				defaultLastRendereableDate,
				service,
				i = 0;

            function defaultFormatDate(date, timezone) {

                if (!date) {
                    return '';
                }

                var localeTime = date.toLocaleTimeString(),
					formatDate = date;

                if (date.getHours() === 0 &&
                    (localeTime.indexOf('11:') !== -1 || localeTime.indexOf('23:') !== -1)) {
                    formatDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 1, 0, 0);
                }

                return $filter('date')(formatDate, 'M/d/yyyy', timezone);
            }

            function defaultParseDate(dateString) {
                return new Date(dateString);
            }

            function defaultIsDateComplete(dateString) {
                dateString = dateString.trim();

                var re = /^(([a-zA-Z]{3,}|[0-9]{1,4})([ .,]+|[/-])){2}([a-zA-Z]{3,}|[0-9]{1,4})$/;
                return re.test(dateString);
            }

            function defaultMonthHeaderFormatter(date) {
                return service.shortMonths[date.getMonth()] + ' ' + date.getFullYear();
            }

            function defaultMonthFormatter(date) {
                return service.months[date.getMonth()] + ' ' + date.getFullYear();
            }

            function defaultWeekNumberFormatter(number) {
                return 'Week ' + number;
            }

            function defaultLongDateFormatter(date) {
                // Example: 'Thursday June 18 2015'
                return [
                    service.days[date.getDay()],
                    service.months[date.getMonth()],
                    service.dates[date.getDate()],
                    date.getFullYear()
                ].join(' ');
            }

            defaultShortDays = $locale.DATETIME_FORMATS.SHORTDAY.map(function (day) {
                return day.substring(0, 1);
            });

            defaultDates = Array(32);

            for (i = 1; i <= 31; i += 1) {
                defaultDates[i] = i;
            }

            // Default ARIA messages are in English (US).
            defaultMsgCalendar = 'Calendar';
            defaultMsgOpenCalendar = 'Open calendar';

            // Default start/end dates that are rendered in the calendar.
            defaultFirstRenderableDate = new Date(1880, 0, 1);
            defaultLastRendereableDate = new Date(defaultFirstRenderableDate.getFullYear() + 250, 0, 1);

            service = {
                months: this.months || $locale.DATETIME_FORMATS.MONTH,
                shortMonths: this.shortMonths || $locale.DATETIME_FORMATS.SHORTMONTH,
                days: this.days || $locale.DATETIME_FORMATS.DAY,
                shortDays: this.shortDays || defaultShortDays,
                dates: this.dates || defaultDates,
                firstDayOfWeek: this.firstDayOfWeek || 0,
                formatDate: this.formatDate || defaultFormatDate,
                parseDate: this.parseDate || defaultParseDate,
                isDateComplete: this.isDateComplete || defaultIsDateComplete,
                monthHeaderFormatter: this.monthHeaderFormatter || defaultMonthHeaderFormatter,
                monthFormatter: this.monthFormatter || defaultMonthFormatter,
                weekNumberFormatter: this.weekNumberFormatter || defaultWeekNumberFormatter,
                longDateFormatter: this.longDateFormatter || defaultLongDateFormatter,
                msgCalendar: this.msgCalendar || defaultMsgCalendar,
                msgOpenCalendar: this.msgOpenCalendar || defaultMsgOpenCalendar,
                firstRenderableDate: this.firstRenderableDate || defaultFirstRenderableDate,
                lastRenderableDate: this.lastRenderableDate || defaultLastRendereableDate
            };

            return service;
        };

        DateLocaleProvider.prototype.$get.$inject = ["$locale", "$filter"];

        $provide.provider('$mdDateLocale', new DateLocaleProvider());
    }]
).factory(
	'$$mdDateUtil',
	function () {

        return {
            getFirstDateOfMonth: getFirstDateOfMonth,
            getNumberOfDaysInMonth: getNumberOfDaysInMonth,
            getDateInNextMonth: getDateInNextMonth,
            getDateInPreviousMonth: getDateInPreviousMonth,
            isInNextMonth: isInNextMonth,
            isInPreviousMonth: isInPreviousMonth,
            getDateMidpoint: getDateMidpoint,
            isSameMonthAndYear: isSameMonthAndYear,
            getWeekOfMonth: getWeekOfMonth,
            incrementDays: incrementDays,
            incrementMonths: incrementMonths,
            getLastDateOfMonth: getLastDateOfMonth,
            isSameDay: isSameDay,
            getMonthDistance: getMonthDistance,
            isValidDate: isValidDate,
            setDateTimeToMidnight: setDateTimeToMidnight,
            createDateAtMidnight: createDateAtMidnight,
            isDateWithinRange: isDateWithinRange,
            incrementYears: incrementYears,
            getYearDistance: getYearDistance,
            clampDate: clampDate,
            getTimestampFromNode: getTimestampFromNode,
            isMonthWithinRange: isMonthWithinRange
        };

        function getFirstDateOfMonth(date) {
            return new Date(date.getFullYear(), date.getMonth(), 1);
        }

        function getNumberOfDaysInMonth(date) {
            return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        }

        function getDateInNextMonth(date) {
            return new Date(date.getFullYear(), date.getMonth() + 1, 1);
        }

        function getDateInPreviousMonth(date) {
            return new Date(date.getFullYear(), date.getMonth() - 1, 1);
        }

        function isSameMonthAndYear(d1, d2) {
            return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
        }

        function isSameDay(d1, d2) {
            return d1.getDate() == d2.getDate() && isSameMonthAndYear(d1, d2);
        }

        function isInNextMonth(startDate, endDate) {
            var nextMonth = getDateInNextMonth(startDate);

            return isSameMonthAndYear(nextMonth, endDate);
        }

        function isInPreviousMonth(startDate, endDate) {
            var previousMonth = getDateInPreviousMonth(startDate);
            return isSameMonthAndYear(endDate, previousMonth);
        }

        function getDateMidpoint(d1, d2) {
            return createDateAtMidnight((d1.getTime() + d2.getTime()) / 2);
        }

        function getWeekOfMonth(date) {
            var firstDayOfMonth = getFirstDateOfMonth(date);
            return Math.floor((firstDayOfMonth.getDay() + date.getDate() - 1) / 7);
        }

        function incrementDays(date, numberOfDays) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() + numberOfDays);
        }

        function incrementMonths(date, numberOfMonths) {
            var dateInTargetMonth = new Date(date.getFullYear(), date.getMonth() + numberOfMonths, 1);
            var numberOfDaysInMonth = getNumberOfDaysInMonth(dateInTargetMonth);

            if (numberOfDaysInMonth < date.getDate()) {
                dateInTargetMonth.setDate(numberOfDaysInMonth);
            } else {
                dateInTargetMonth.setDate(date.getDate());
            }

            return dateInTargetMonth;
        }

        function getMonthDistance(start, end) {
            return (12 * (end.getFullYear() - start.getFullYear())) + (end.getMonth() - start.getMonth());
        }

        function getLastDateOfMonth(date) {
            return new Date(date.getFullYear(), date.getMonth(), getNumberOfDaysInMonth(date));
        }

        function isValidDate(date) {
            return date && date.getTime && !isNaN(date.getTime());
        }

        function setDateTimeToMidnight(date) {
            if (isValidDate(date)) {
                date.setHours(0, 0, 0, 0);
            }
        }

        function createDateAtMidnight(opt_value) {
            var date;

            if (angular.isUndefined(opt_value)) {
                date = new Date();
            } else {
                date = new Date(opt_value);
            }
            setDateTimeToMidnight(date);
            return date;
        }

        function isDateWithinRange(date, minDate, maxDate) {
            var dateAtMidnight = createDateAtMidnight(date),
				minDateAtMidnight = isValidDate(minDate) ? createDateAtMidnight(minDate) : null,
				maxDateAtMidnight = isValidDate(maxDate) ? createDateAtMidnight(maxDate) : null;

            return (!minDateAtMidnight || minDateAtMidnight <= dateAtMidnight) &&
                (!maxDateAtMidnight || maxDateAtMidnight >= dateAtMidnight);
        }

        function incrementYears(date, numberOfYears) {
            return incrementMonths(date, numberOfYears * 12);
        }

        function getYearDistance(start, end) {
            return end.getFullYear() - start.getFullYear();
        }

        function clampDate(date, minDate, maxDate) {
            var boundDate = date;

            if (minDate && date < minDate) {
                boundDate = new Date(minDate.getTime());
            }
            if (maxDate && date > maxDate) {
                boundDate = new Date(maxDate.getTime());
            }
            return boundDate;
        }

        function getTimestampFromNode(node) {
            if (node && node.hasAttribute('data-timestamp')) {
                return Number(node.getAttribute('data-timestamp'));
            }
        }

        function isMonthWithinRange(date, minDate, maxDate) {
            var month = date.getMonth(),
				year = date.getFullYear();

            return (!minDate || minDate.getFullYear() < year || minDate.getMonth() <= month) &&
                (!maxDate || maxDate.getFullYear() > year || maxDate.getMonth() >= month);
        }
    }
).directive(
	'mdCalendar',
	calendarDirective
).directive(
	'mdCalendarMonth',
	calendarMonthDirective
).directive(
	'mdCalendarMonthBody',
	["$compile", "$$mdSvgRegistry", mdCalendarMonthBodyDirective]
).directive(
	'mdCalendarYear',
	calendarYearDirective
).directive(
	'mdCalendarYearBody',
	mdCalendarYearDirective
).directive(
	'mdDatepicker',
	["$$mdSvgRegistry", "$mdUtil", "$mdAria", "inputDirective", datePickerDirective]
).directive(
    'mdPlaceholder',
    angular.restrictADir
).directive(
    'mdOpenOnFocus',
    angular.restrictADir
).directive(
    'mdCurrentView',
    angular.restrictADir
).directive(
    'mdMinDate',
    angular.restrictADir
).directive(
    'mdMaxDate',
    angular.restrictADir
).directive(
    'mdDateFilter',
    angular.restrictADir
).directive(
    'mdMonthOffset',
    angular.restrictADir
).directive(
    'mdYearOffset',
    angular.restrictADir
);

}());