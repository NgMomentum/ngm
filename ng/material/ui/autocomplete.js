
/**
 * @ngdoc module
 * @name material.components.autocomplete
 */

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.autocomplete");
msos.require("ng.material.core.theming");
msos.require("ng.material.ui.icon");
msos.require("ng.material.ui.input");			// ref. template
msos.require("ng.material.ui.announcer");
msos.require("ng.material.ui.repeater");		// ref. template
msos.require("ng.material.ui.progresslin");		// ref. template

ng.material.ui.autocomplete.version = new msos.set_version(18, 8, 29);

// Load AngularJS-Material module specific CSS
ng.material.ui.autocomplete.css = new msos.loader();
ng.material.ui.autocomplete.css.load(msos.resource_url('ng', 'material/css/ui/autocomplete.css'));


function MdAutocompleteCtrl($scope, $element, $mdUtil, $mdConstant, $mdTheming, $window, $animate, $rootElement, $attrs, $q, $log, $mdLiveAnnouncer) {
	"use strict";

    // Internal Variables.
    var temp_ac = 'ng.material.ui.autocomplete - MdAcCtrl',
		ITEM_HEIGHT = 48,
        MAX_ITEMS = 5,
        MENU_PADDING = 8,
        INPUT_PADDING = 2,
        ctrl = this,
        itemParts = $scope.itemsExpr.split(/ in /i),
        itemExpr = itemParts[1],
        elements = null,
        cache = {},
        noBlur = false,
        selectedItemWatchers = [],
        hasFocus = false,
        fetchesInProgress = 0,
        enableWrapScroll = null,
        inputModelCtrl = null,
        debouncedOnResize = null,
		ReportType = {
			Count: 1,
			Selected: 2
		},
		defaultMinLenght = 1;

    function positionDropdown() {

        function getVerticalOffset() {
            var offset = 0,
				inputContainer = $element.find('md-input-container'),
				input;

            if (inputContainer.length) {
                input = inputContainer.find('input');

                offset = inputContainer.prop('offsetHeight');
                offset -= input.prop('offsetTop');
                offset -= input.prop('offsetHeight');
                // add in the height left up top for the floating label text
                offset += inputContainer.prop('offsetTop');
            }

            return offset;
        }

        var dropdownHeight = ($scope.dropdownItems || MAX_ITEMS) * ITEM_HEIGHT,
			hrect = elements.wrap.getBoundingClientRect(),
            vrect = elements.snap.getBoundingClientRect(),
            root = elements.root.getBoundingClientRect(),
            top = vrect.bottom - root.top,
            bot = root.bottom - vrect.top,
            left = hrect.left - root.left,
            width = hrect.width,
            offset = getVerticalOffset(),
            position = $scope.dropdownPosition,
            styles,
			bottomSpace;

        if (!position) {
            position = (top > bot && root.height - hrect.bottom - MENU_PADDING < dropdownHeight) ? 'top' : 'bottom';
        }

        if ($attrs.mdFloatingLabel) {
            left += INPUT_PADDING;
            width -= INPUT_PADDING * 2;
        }

        styles = {
            left: left + 'px',
            minWidth: width + 'px',
            maxWidth: Math.max(hrect.right - root.left, root.right - hrect.left) - MENU_PADDING + 'px'
        };

        if (position === 'top') {

            styles.top = 'auto';
            styles.bottom = bot + 'px';
            styles.maxHeight = Math.min(dropdownHeight, hrect.top - root.top - MENU_PADDING) + 'px';

        } else {

            bottomSpace = root.bottom - hrect.bottom - MENU_PADDING + $mdUtil.getViewportTop();

            styles.top = (top - offset) + 'px';
            styles.bottom = 'auto';
            styles.maxHeight = Math.min(dropdownHeight, bottomSpace) + 'px';
        }

        function correctHorizontalAlignment() {
            var dropdown = elements.scrollContainer.getBoundingClientRect(),
                styles = {};

            if (dropdown.right > root.right - MENU_PADDING) {
                styles.left = (hrect.right - dropdown.width) + 'px';
            }

            elements.$.scrollContainer.css(styles);

			// Force virtual-repeater to re-render the matches
			// (required by NgM to overcome a timing issue, I guess)
			$scope.$broadcast('$md-resize');
        }

        elements.$.scrollContainer.css(styles);
        $mdUtil.nextTick(correctHorizontalAlignment, false);
    }

    function disableElementScrollEvents(element) {

        function preventDefault(e) {
            e.preventDefault();
        }

        element.on('wheel', preventDefault);
        element.on('touchmove', preventDefault);

        return function () {
            element.off('wheel', preventDefault);
            element.off('touchmove', preventDefault);
        };
    }

    function getCurrentDisplayValue() {
        return getDisplayValue(ctrl.matches[ctrl.index]);
    }

    function getCountMessage() {
        switch (ctrl.matches.length) {
            case 0:
                return 'There are no matches available.';
            case 1:
                return 'There is 1 match available.';
            default:
                return 'There are ' + ctrl.matches.length + ' matches available.';
        }
    }

    function reportMessages(isPolite, types) {

        var politeness = isPolite ? 'polite' : 'assertive',
			messages = [];

        if (types & ReportType.Selected && ctrl.index !== -1) {
            messages.push(getCurrentDisplayValue());
        }

        if (types & ReportType.Count) {
            messages.push($q.resolve($q.defer('ng_md_ui_autocompl_reportMessages_resolve'), getCountMessage()));
        }

        $q.all($q.defer('ng_md_ui_autocompl_reportMessages_all'), messages).then(
			function (data) {
				$mdLiveAnnouncer.announce(data.join(' '), politeness);
			}
		);
    }

    function handleHiddenChange(hidden, oldHidden) {

        if (!hidden && oldHidden) {

			debouncedOnResize();

            // Report in polite mode, because the screenreader should finish the default description of
            // the input. element.
            reportMessages(true, ReportType.Count | ReportType.Selected);

            if (elements) {
                $mdUtil.disableScrollAround(elements.ul);
                enableWrapScroll = disableElementScrollEvents(angular.element(elements.wrap));
            }

        } else if (hidden && !oldHidden) {

            $mdUtil.enableScrolling();

            if (enableWrapScroll) {
                enableWrapScroll();
                enableWrapScroll = null;
            }
        }
    }

    function defineProperty(key, handler, value) {
        Object.defineProperty(ctrl, key, {
            get: function () {
                return value;
            },
            set: function (newValue) {
                var oldValue = value;
                value = newValue;
                handler(newValue, oldValue);
            }
        });
    }

	debouncedOnResize = $mdUtil.debounce(positionDropdown, 10, null, false);

	// Public Exported Variables with handlers
	defineProperty('hidden', handleHiddenChange, true);

	// Public Exported Variables
	ctrl.scope      = $scope;
	ctrl.parent     = $scope.$parent;
	ctrl.itemName   = itemParts[ 0 ];
	ctrl.matches    = [];
	ctrl.loading    = false;
	ctrl.hidden     = true;
	ctrl.index      = null;
	ctrl.id         = $mdUtil.nextUid();
	ctrl.isDisabled = null;
	ctrl.isRequired = null;
	ctrl.isReadonly = null;
	ctrl.hasNotFound = false;
	ctrl.notFoundVis_tf = false;

    function updateModelValidators() {
        if (!$scope.requireMatch || !inputModelCtrl) { return; }

        inputModelCtrl.$setValidity('md-require-match', !!$scope.selectedItem || !$scope.searchText);
    }

    function moveDropdown() {
        if (!elements.$.root.length) { return; }

        $mdTheming(elements.$.scrollContainer);
        elements.$.scrollContainer.detach();
        elements.$.root.append(elements.$.scrollContainer);

        if ($animate.pin) {
			$animate.pin(elements.$.scrollContainer, $rootElement);
		}
    }

    function focusInputElement() {
        elements.input.focus();
    }

    function announceTextChange() {
        if (angular.isFunction($scope.textChange)) {
			$scope.textChange();
		}
    }

    function isMinLengthMet() {
        return (ctrl.scope.searchText || '').length >= ctrl.autocompleteMinLength;
    }

    function getDefaultIndex() {
        return $scope.autoselect ? 0 : -1;
    }

    function setLoading(value) {
        if (ctrl.loading !== value) {
            ctrl.loading = value;
        }

        // Always refresh the hidden variable as something else might have changed
        ctrl.hidden = shouldHide();
    }

    function handleSearchText(searchText, previousSearchText) {
		var temp_hst = ' - handleSearchText -> ';

		searchText = searchText || '';

		msos.console.debug(temp_ac + temp_hst  + 'start,\n     searchText: \'' + searchText + '\',\n     previousSearchText: \'' + previousSearchText + '\'');

        ctrl.index = getDefaultIndex();

        // do nothing on init
        if (searchText === previousSearchText) {
			msos.console.debug(temp_ac + temp_hst  + ' done, no change.');
			return;
		}

        updateModelValidators();

        getDisplayValue(
			$scope.selectedItem
		).then(
			function (val) {
				// clear selected item if search text no longer matches it
				if (searchText !== val) {
					$scope.selectedItem = null;

					// trigger change event if available
					if (searchText !== previousSearchText) { announceTextChange(); }

					// cancel results if search text is not long enough
					if (!isMinLengthMet()) {

						ctrl.matches = [];

						setLoading(false);
						reportMessages(false, ReportType.Count);

					} else {
						handleQuery();
					}
				}
			}
		);

		msos.console.debug(temp_ac + temp_hst  + ' done!');
    }

    function cleanup() {
        if (!ctrl.hidden) {
            $mdUtil.enableScrolling();
        }

        angular.element($window).off('resize', debouncedOnResize);

        if (elements) {
            var items = ['ul', 'scroller', 'scrollContainer', 'input'];
            angular.forEach(items, function (key) {
                elements.$[key].remove();
            });
        }
    }

    function handleSelectedItemChange(selectedItem, previousSelectedItem) {
        selectedItemWatchers.forEach(
			function (watcher) {
				watcher(selectedItem, previousSelectedItem);
			}
		);
    }

    function getDisplayValue(item) {

        function getItemText(item) {
            return (item && $scope.itemText) ? $scope.itemText(getItemAsNameVal(item)) : null;
        }

        return $q.when(
				$q.defer('ng_md_ui_autocompl_getDisplayValue_when'),
				getItemText(item) || item
			).then(
				function (itemText) {
					if (itemText && !angular.isString(itemText)) {
						$log.warn('ng.materail.ui.autocomplete - getDisplayValue -> Could not resolve display value to a string. Please check the `md-item-text` attribute.');
					}

					return itemText;
				}
			);
    }

    function getItemAsNameVal(item) {
		var locals = {};

        if (!item) { return undefined; }
        if (ctrl.itemName) { locals[ctrl.itemName] = item; }

        return locals;
    }

    function announceItemChange() {
		if (angular.isFunction($scope.itemChange)) {
			$scope.itemChange(getItemAsNameVal($scope.selectedItem));
		}
    }

    function selectedItemChange(selectedItem, previousSelectedItem) {

        updateModelValidators();

        if (selectedItem) {
            getDisplayValue(selectedItem).then(
				function (val) {
					$scope.searchText = val;
					handleSelectedItemChange(selectedItem, previousSelectedItem);
				}
			);
        } else if (previousSelectedItem && $scope.searchText) {
            getDisplayValue(previousSelectedItem).then(
				function (displayValue) {
					// Clear the searchText, when the selectedItem is set to null.
					// Do not clear the searchText, when the searchText isn't matching with the previous
					// selected item.
					if (angular.isString($scope.searchText) && displayValue.toString().toLowerCase() === $scope.searchText.toLowerCase()) {
						$scope.searchText = '';
					}
				}
			);
        }

        if (selectedItem !== previousSelectedItem) { announceItemChange(); }
    }

    function configureWatchers() {
        var wait = parseInt($scope.delay, 10) || 0;

        $attrs.$observe('disabled', function (value) {
            ctrl.isDisabled = $mdUtil.parseAttributeBoolean(value, false);
        });
        $attrs.$observe('required', function (value) {
            ctrl.isRequired = $mdUtil.parseAttributeBoolean(value, false);
        });
        $attrs.$observe('readonly', function (value) {
            ctrl.isReadonly = $mdUtil.parseAttributeBoolean(value, false);
        });

        $scope.$watch('searchText', wait ? $mdUtil.debounce(handleSearchText, wait, null, false) : handleSearchText);
        $scope.$watch('selectedItem', selectedItemChange);

        angular.element($window).on('resize', debouncedOnResize);

        $scope.$on('$destroy', cleanup);
    }

    function gatherSnapWrap() {
        var element,
			value,
			wrap;

        for (element = $element; element.length; element = element.parent()) {
            value = element.attr('md-autocomplete-snap');

            if (angular.isDefined(value)) { break; }
        }

        if (element.length) {
            return {
                snap: element[0],
                wrap: (value.toLowerCase() === 'width') ? element[0] : $element.find('md-autocomplete-wrap')[0]
            };
        }

        wrap = $element.find('md-autocomplete-wrap')[0];

        return {
            snap: wrap,
            wrap: wrap
        };
    }

    function getAngularElements(elements) {
        var obj = {},
			key;

        for (key in elements) {
            if (elements.hasOwnProperty(key)) {
				obj[key] = angular.element(elements[key]);
            }
        }

        return obj;
    }

    function gatherElements() {

        var snapWrap = gatherSnapWrap();

        elements = {
            main: $element[0],
            scrollContainer: $element[0].querySelector('.md-virtual-repeat-container'),
            scroller: $element[0].querySelector('.md-virtual-repeat-scroller'),
            ul: $element.find('ul')[0],
            input: $element.find('input')[0],
            wrap: snapWrap.wrap,
            snap: snapWrap.snap,
            root: document.body
        };

        elements.li = elements.ul.getElementsByTagName('li');
        elements.$ = getAngularElements(elements);

        inputModelCtrl = elements.$.input.controller('ngModel');
    }

    function onListEnter() {
        noBlur = true;
    }

    function onListLeave() {
        if (!hasFocus && !ctrl.hidden) { elements.input.focus(); }

        noBlur = false;
        ctrl.hidden = shouldHide();
    }

    function onMouseup() {
        elements.input.focus();
    }

    function registerSelectedItemWatcher(cb) {
        if (selectedItemWatchers.indexOf(cb) === -1) {
            selectedItemWatchers.push(cb);
        }
    }

    function unregisterSelectedItemWatcher(cb) {
        var i = selectedItemWatchers.indexOf(cb);

        if (i !== -1) {
            selectedItemWatchers.splice(i, 1);
        }
    }

    function blur($event) {
        hasFocus = false;

        if (!noBlur) {
            ctrl.hidden = shouldHide();
            evalAttr(
				'ngBlur',
				{ $event: $event }
			);
        }
    }

    function doBlur(forceBlur) {
        if (forceBlur) {
            noBlur = false;
            hasFocus = false;
        }
        elements.input.blur();
    }

    function isSearchable() {
        if (ctrl.loading && !ctrl.matches.length)	{ return false; }	// No query when query is in progress.
        if (ctrl.scope.selectedItem)				{ return false; }	// No query if there is already a selection
        if (!hasFocus)								{ return false; }	// No query if the input does not have focus

        return true;
    }

    function fetchResults(searchText, term) {
        var temp_fr = ' - fetchResults',
			items = $scope.$parent.$eval(itemExpr),
            isList = angular.isArray(items),
            isPromise = !!items.then; // Every promise should contain a `then` property

		msos.console.debug(temp_ac + temp_fr + ' -> start,\n     isList: ' + isList + ',\n     isPromise: ' + isPromise + ',\n     term: \'' + term + '\'');

        function onResultsRetrieved(or_matches) {
			var temp_rr = ' - onResultsRetrieved -> ';

			msos.console.debug(temp_ac + temp_fr + temp_rr + 'start, matches: ' + or_matches.length);

            cache[term] = or_matches;

            // Just cache the results if the request is now outdated.
            // The request becomes outdated, when the new searchText has changed during the result fetching.
            if ((searchText || '') !== ($scope.searchText || '')) {
				msos.console.debug(temp_ac + temp_fr + temp_rr + ' done, skip for search changed.');
                return;
            }

            handleResults(or_matches);

			msos.console.debug(temp_ac + temp_fr + temp_rr + ' done!');
        }

        function handleAsyncResults(items) {
			var temp_ha = ' - handleAsyncResults -> ';

			msos.console.debug(temp_ac + temp_fr + temp_ha + 'start.');

            if (!items) {
				msos.console.debug(temp_ac + temp_fr + temp_ha + ' done, no items.');
				return;
			}

            items = $q.when(
				$q.defer('ng_md_ui_autocompl_handleAsyncResults_when'),
				items
			);

            fetchesInProgress += 1;
            setLoading(true);

            $mdUtil.nextTick(
				function () {
					items.then(onResultsRetrieved).finally(
						function () {
							fetchesInProgress -= 1;
							if (fetchesInProgress === 0) {
								setLoading(false);
							}
						}
					);
				},
				false,
				$scope
			);

			msos.console.debug(temp_ac + temp_fr + temp_ha + ' done!');
        }

        if (isList)			{ onResultsRetrieved(items); }
        else if (isPromise)	{ handleAsyncResults(items); }

		msos.console.debug(temp_ac + temp_fr + ' ->  done,\n     term: \'' + term + '\'');
    }

    function handleQuery() {
        var searchText = $scope.searchText || '',
			term = searchText.toLowerCase() || '_undef_',
			debug_note = '';

		msos.console.debug(temp_ac + ' - handleQuery -> start,\n     searchText: \'' + searchText + '\',\n     term: \'' + term + '\'');

        // If caching is enabled and the current searchText is stored in the cache
        if (!$scope.noCache && cache[term]) {
            // The results should be handled as same as a normal un-cached request does.
            handleResults(cache[term]);
			debug_note = 'used cache';
        } else {
            fetchResults(searchText, term);
			debug_note = 'used fetch';
        }

		ctrl.hidden = shouldHide();

		msos.console.debug(temp_ac + ' - handleQuery ->  done, (' + debug_note + ')');
    }

	function notFoundVisible () {
		var textLength = (ctrl.scope.searchText || '').length,
			matchLength = ctrl.matches.length ? true : false,
			output = ctrl.hasNotFound && !matchLength && (!ctrl.loading || fetchesInProgress !== 0) && textLength >= ctrl.autocompleteMinLength && (hasFocus || noBlur) && !ctrl.scope.selectedItem;

		// Record the output.
		ctrl.notFoundVis_tf = output;

		msos.console.debug(temp_ac + ' - notFoundVisible -> called, text length: ' + textLength + ', matches: ' + ctrl.matches.length +  ', t/f: ' + output);
		return output;
	}

    function shouldHide() {
		var output,
			notFound;

		if (ctrl.isReadonly) {
			output = true;
		} else if (!isSearchable()) {
			output = true;
		} else {
			notFound = notFoundVisible();
			output = !((ctrl.matches.length && isMinLengthMet()) || notFound);
		}

		msos.console.debug(temp_ac + ' - shouldHide -> called, t/f: ' + output);
        return output;
    }

    function getMinLength() {
		var minLen = angular.isNumber($scope.minLength) ? $scope.minLength : 1;

		msos.console.debug(temp_ac + ' - getMinLength -> called, Min. Length: ' + minLen + ', for text: ' + $scope.minLength);
        return minLen;
    }

    function focus($event) {
        hasFocus = true;

		msos.console.debug(temp_ac + ' - focus -> start.');

		ctrl.autocompleteMinLength = getMinLength();

        if (isSearchable() && isMinLengthMet()) { handleQuery(); }

		ctrl.hidden = shouldHide();

        evalAttr(
			'ngFocus',
			{ $event: $event }
		);

//		debouncedOnResize();

		msos.console.debug(temp_ac + ' - focus ->  done!');
    }

    function clearSearchText() {

        setLoading(true);

        $scope.searchText = '';

        var eventObj = document.createEvent('CustomEvent');

        eventObj.initCustomEvent('change', true, true, {
            value: ''
        });

        elements.input.dispatchEvent(eventObj);

        elements.input.blur();
        $scope.searchText = '';
        elements.input.focus();
    }

    function scrollTo(offset) {
		msos.console.warn('ng.material.ui.autocomplete - scrollTo -> called, offset: ' + offset);

        elements.$.scrollContainer.controller('mdVirtualRepeatContainer').scrollTo(offset);
    }

    function updateScroll() {

        if (!elements.li[0]) {
			msos.console.warn('ng.material.ui.autocomplete - updateScroll -> no li elements.');
			return;
		}

        var height = elements.li[0].offsetHeight,
            top = height * ctrl.index,
            bot = top + height,
            hgt = elements.scroller.clientHeight,
            scrollTop = elements.scroller.scrollTop;

        if (top < scrollTop) {
            scrollTo(top);
        } else if (bot > scrollTop + hgt) {
            scrollTo(bot - hgt);
        }
    }

    function hasEscapeOption(option) {
        return !$scope.escapeOptions || $scope.escapeOptions.toLowerCase().indexOf(option) !== -1;
    }

    function shouldProcessEscape() {
        return (hasEscapeOption('blur') || !ctrl.hidden || ctrl.loading || hasEscapeOption('clear')) && $scope.searchText;
    }

    function select(index) {
        //-- force form to update state for validation
        $mdUtil.nextTick(
			function () {
				getDisplayValue(ctrl.matches[index]).then(
					function (val) {
						var ngModel = elements.$.input.controller('ngModel');

						ngModel.$setViewValue(val);
						ngModel.$render();
					}
				).finally(
					function () {
						$scope.selectedItem = ctrl.matches[index];
						setLoading(false);
					}
				);
			},
			false
		);
    }

    function keydown(event) {
        switch (event.keyCode) {
            case $mdConstant.KEY_CODE.DOWN_ARROW:
                if (ctrl.loading) { return; }
                event.stopPropagation();
                event.preventDefault();
                ctrl.index = Math.min(ctrl.index + 1, ctrl.matches.length - 1);
                updateScroll();
                reportMessages(false, ReportType.Selected);
                break;
            case $mdConstant.KEY_CODE.UP_ARROW:
                if (ctrl.loading) { return; }
                event.stopPropagation();
                event.preventDefault();
                ctrl.index = ctrl.index < 0 ? ctrl.matches.length - 1 : Math.max(0, ctrl.index - 1);
                updateScroll();
                reportMessages(false, ReportType.Selected);
                break;
            case $mdConstant.KEY_CODE.TAB:
                // If we hit tab, assume that we've left the list so it will close
                onListLeave();

                if (ctrl.hidden || ctrl.loading || ctrl.index < 0 || ctrl.matches.length < 1) { return; }
                select(ctrl.index);
                break;
            case $mdConstant.KEY_CODE.ENTER:
                if (ctrl.hidden || ctrl.loading || ctrl.index < 0 || ctrl.matches.length < 1) { return; }
                if (ctrl.scope.selectedItem) { return; }
                event.stopPropagation();
                event.preventDefault();
                select(ctrl.index);
                break;
            case $mdConstant.KEY_CODE.ESCAPE:
                event.preventDefault(); // Prevent browser from always clearing input
                if (!shouldProcessEscape()) { return; }
                event.stopPropagation();

				// Reset our variables
				ctrl.index = 0;
				ctrl.matches = [];

                if ($scope.searchText && hasEscapeOption('clear')) {
                    clearSearchText();
                }

                // Manually hide (needed for mdNotFound support)
                ctrl.hidden = true;

                if (hasEscapeOption('blur')) {
                    // Force the component to blur if they hit escape
                    doBlur(true);
                }

                break;
            default:
        }
    }

    function selectItemOnMatch() {
        var temp_sim = ' - selectItemOnMatch',
			sim_searchText = ctrl.scope.searchText,
            sim_matches = ctrl.matches;

		msos.console.debug(temp_ac + temp_sim + ' -> start, # of matches: ' + sim_matches.length);

        if (sim_matches.length === 1) {
			getDisplayValue(sim_matches[0]).then(
				function (displayValue) {
					var isMatching;

					msos.console.debug(temp_ac + temp_sim + ' - then -> called, searchText: ' + sim_searchText + ', displayValue: ' + displayValue);

					if ($scope.matchInsensitive) {
						isMatching = sim_searchText.toLowerCase() === displayValue.toLowerCase();
					} else {
						isMatching = sim_searchText === displayValue;
					}

					if (isMatching) { select(0); }
				}
			);
		}

		msos.console.debug(temp_ac + temp_sim + ' ->  done!');
    }

    function handleResults(results) {

		msos.console.debug(temp_ac + ' - handleResults -> start, # of results: ' + results.length);

        ctrl.matches = results;
		ctrl.hidden = shouldHide();

        // If loading is in progress, then we'll end the progress. This is needed for example,
        // when the `clear` button was clicked, because there we always show the loading process, to prevent flashing.
        if (ctrl.loading) { setLoading(false); }

        if ($scope.selectOnMatch) { selectItemOnMatch(); }

		debouncedOnResize();
		
        reportMessages(true, ReportType.Count);

		msos.console.debug(temp_ac + ' - handleResults ->  done!');
    }

    function evalAttr(attr, locals) {
        if ($attrs[attr]) {
            $scope.$parent.$eval($attrs[attr], locals || {});
        }
    }

    function init() {

        $mdUtil.initOptionalProperties(
			$scope,
			$attrs,
			{
				searchText: '',
				selectedItem: null,
				clearButton: false
			}
		);

        $mdTheming($element);
        configureWatchers();

        $mdUtil.nextTick(
			function () {

				gatherElements();
				moveDropdown();

				// Forward all focus events to the input element when autofocus is enabled
				if ($scope.autofocus) { $element.on('focus', focusInputElement); }
			},
			false,
			$scope
		);
    }

    function clearValue() {
		// Reset our variables
        ctrl.index = 0;
        ctrl.matches = [];

        clearSearchText();
    }

    function loadingIsVisible() {
        return ctrl.loading && !ctrl.scope.selectedItem;
    }

	// Public Exported Methods
	ctrl.keydown = keydown;
	ctrl.blur = blur;
	ctrl.focus = focus;
	ctrl.clear = clearValue;
	ctrl.select = select;
	ctrl.listEnter = onListEnter;
	ctrl.listLeave = onListLeave;
	ctrl.mouseUp = onMouseup;
	ctrl.getCurrentDisplayValue = getCurrentDisplayValue;
	ctrl.registerSelectedItemWatcher = registerSelectedItemWatcher;
	ctrl.unregisterSelectedItemWatcher = unregisterSelectedItemWatcher;
	ctrl.notFoundVisible = notFoundVisible;
	ctrl.loadingIsVisible = loadingIsVisible;
	ctrl.positionDropdown = positionDropdown;
	ctrl.autocompleteMinLength = defaultMinLenght;

	init();
}

function MdHighlightCtrl($scope, $element, $attrs) {
	"use strict";

    this.$scope = $scope;
    this.$element = $element;
    this.$attrs = $attrs;
    this.regex = null;
}

MdHighlightCtrl.prototype.init = function (unsafeTermFn, unsafeContentFn) {
	"use strict";

    this.flags = this.$attrs.mdHighlightFlags || '';

    this.unregisterFn = this.$scope.$watch(
		function ($scope) {
			return {
				term: unsafeTermFn($scope),
				contentText: unsafeContentFn($scope)
			};
		}.bind(this),
		this.onRender.bind(this),
		true
	);

    this.$element.on('$destroy', this.unregisterFn);
};

MdHighlightCtrl.prototype.onRender = function (state, prevState) {
	"use strict";

    var contentText = state.contentText;

    /* Update the regex if it's outdated, because we don't want to rebuilt it constantly. */
    if (this.regex === null || state.term !== prevState.term) {
        this.regex = this.createRegex(state.term, this.flags);
    }

    /* If a term is available apply the regex to the content */
    if (state.term) {
        this.applyRegex(contentText);
    } else {
        this.$element.text(contentText);
    }
};

MdHighlightCtrl.prototype.applyRegex = function (text) {
	"use strict";

    var tokens = this.resolveTokens(text);

    this.$element.empty();

    tokens.forEach(
		function (token) {

			if (token.isMatch) {
				var tokenEl = angular.element('<span class="highlight">').text(token.text);

				this.$element.append(tokenEl);
			} else {
				this.$element.append(document.createTextNode(token));
			}

		}.bind(this)
	);

};

MdHighlightCtrl.prototype.resolveTokens = function (string) {
	"use strict";

    var tokens = [],
		lastIndex = 0;

    function appendToken(from, to) {
        var targetText = string.slice(from, to);

		if (targetText) {
			tokens.push(targetText);
		}
    }

    string.replace(
		this.regex,
		function (match, index) {
			appendToken(lastIndex, index);

			tokens.push({
				text: match,
				isMatch: true
			});

			lastIndex = index + match.length;
		}
	);

    // Append the missing text as a token.
    appendToken(lastIndex);

    return tokens;
};

MdHighlightCtrl.prototype.createRegex = function (term, flags) {
	"use strict";

    var startFlag = '',
        endFlag = '',
		regexTerm = this.sanitizeRegex(term);

    if (flags.indexOf('^') >= 0) { startFlag = '^'; }
    if (flags.indexOf('$') >= 0) { endFlag = '$'; }

    return new RegExp(startFlag + regexTerm + endFlag, flags.replace(/[$^]/g, ''));
};

/** Sanitizes a regex by removing all common RegExp identifiers */
MdHighlightCtrl.prototype.sanitizeRegex = function (term) {
	"use strict";

    return term && term.toString().replace(/[\\^$*+?.()|{}[\]]/g, '\\$&');
};

function MdHighlight($interpolate, $parse) {
	"use strict";

    return {
        terminal: true,
        controller: ['$scope', '$element', '$attrs', MdHighlightCtrl],
        compile: function mdHighlightCompile(tElement, tAttr) {
            var termExpr = $parse(tAttr.mdHighlightText),
				unsafeContentExpr = $interpolate(tElement.html());

            return function mdHighlightLink(scope, element, attr, ctrl) {
                ctrl.init(termExpr, unsafeContentExpr);
            };
        }
    };
}


function MdAutocomplete($$mdSvgRegistry) {
	"use strict";

    return {
		controller:   'mdAutocompleteCtrl',
		controllerAs: '$mdAutocompleteCtrl',
		scope: {
			inputName:          '@mdInputName',
			inputMinlength:     '@mdInputMinlength',
			inputMaxlength:     '@mdInputMaxlength',
			searchText:         '=?mdSearchText',
			selectedItem:       '=?mdSelectedItem',
			itemsExpr:          '@mdItems',
			itemText:           '&mdItemText',
			placeholder:        '@placeholder',
			noCache:            '=?mdNoCache',
			requireMatch:       '=?mdRequireMatch',
			selectOnMatch:      '=?mdSelectOnMatch',
			matchInsensitive:   '=?mdMatchCaseInsensitive',
			itemChange:         '&?mdSelectedItemChange',
			textChange:         '&?mdSearchTextChange',
			minLength:          '=?mdMinLength',
			delay:              '=?mdDelay',
			autofocus:          '=?mdAutofocus',
			floatingLabel:      '@?mdFloatingLabel',
			autoselect:         '=?mdAutoselect',
			menuClass:          '@?mdMenuClass',
			menuContainerClass: '@?mdMenuContainerClass',
			inputClass:         '@?mdInputClass',
			inputId:            '@?mdInputId',
			escapeOptions:      '@?mdEscapeOptions',
			dropdownItems:      '=?mdDropdownItems',
			dropdownPosition:   '@?mdDropdownPosition',
			clearButton:        '=?mdClearButton'
        },
        compile: function (tElement, tAttrs) {
            var attributes = ['md-select-on-focus', 'md-no-asterisk', 'ng-trim', 'ng-pattern'],
				input = tElement.find('input');

            attributes.forEach(
				function (attribute) {
					var attrValue = tAttrs[tAttrs.$normalize(attribute)];

					if (attrValue !== null) {
						input.attr(attribute, attrValue);
					}
				}
			);

            return function (scope, element, attrs, ctrl) {

                ctrl.hasNotFound = !!element.attr('md-has-not-found');

                if (!angular.isDefined(attrs.mdClearButton) && !scope.floatingLabel) {
                    scope.clearButton = true;
                }
            };
        },
        template: function (element, attr) {

            function getNoItemsTemplate() {
                var templateTag = element.find('md-not-found').detach(),
                    template = templateTag.length ? templateTag.html() : '';

                return template ?
                    '<li ng-if="$mdAutocompleteCtrl.notFoundVis_tf" md-autocomplete-parent-scope>' + template + '</li>' :
                    '';
            }

            function getItemTemplate() {
                var templateTag = element.find('md-item-template').detach(),
                    html = templateTag.length ? templateTag.html() : element.html();

                if (!templateTag.length) { element.empty(); }

                return '<md-autocomplete-parent-scope>' + html + '</md-autocomplete-parent-scope>';
            }

            var noItemsTemplate = getNoItemsTemplate(),
                itemTemplate = getItemTemplate(),
                leftover = element.html(),
                tabindex = attr.tabindex,
				menuContainerClass = attr.mdMenuContainerClass ? ' ' + attr.mdMenuContainerClass : '';

            if (noItemsTemplate) { element.attr('md-has-not-found', true); }

            element.attr('tabindex', '-1');

            function getInputElement() {
                if (attr.mdFloatingLabel) {
                    return '\
            <md-input-container ng-if="floatingLabel">\
              <label>{{floatingLabel}}</label>\
              <input type="search"\
                  ' + (tabindex != null ? 'tabindex="' + tabindex + '"' : '') + '\
                  id="{{ inputId || \'fl-input-\' + $mdAutocompleteCtrl.id }}"\
                  name="{{inputName}}"\
				  ng-class="::inputClass"\
                  autocomplete="off"\
                  ng-required="$mdAutocompleteCtrl.isRequired"\
                  ng-readonly="$mdAutocompleteCtrl.isReadonly"\
                  ng-minlength="inputMinlength"\
                  ng-maxlength="inputMaxlength"\
                  ng-disabled="$mdAutocompleteCtrl.isDisabled"\
                  ng-model="$mdAutocompleteCtrl.scope.searchText"\
                  ng-model-options="{ allowInvalid: true }"\
                  ng-keydown="$mdAutocompleteCtrl.keydown($event)"\
                  ng-blur="$mdAutocompleteCtrl.blur($event)"\
                  ng-focus="$mdAutocompleteCtrl.focus($event)"\
                  aria-owns="ul-{{$mdAutocompleteCtrl.id}}"\
                  aria-label="{{floatingLabel}}"\
                  aria-autocomplete="list"\
                  role="combobox"\
                  aria-haspopup="true"\
                  aria-activedescendant=""\
                  aria-expanded="{{!$mdAutocompleteCtrl.hidden}}"/>\
              <div md-autocomplete-parent-scope>' + leftover + '</div>\
            </md-input-container>';
                } else {
                    return '\
            <input type="search"\
                ' + (tabindex != null ? 'tabindex="' + tabindex + '"' : '') + '\
                id="{{ inputId || \'input-\' + $mdAutocompleteCtrl.id }}"\
                name="{{inputName}}"\
				ng-class="::inputClass"\
                ng-if="!floatingLabel"\
                autocomplete="off"\
                ng-required="$mdAutocompleteCtrl.isRequired"\
                ng-disabled="$mdAutocompleteCtrl.isDisabled"\
                ng-readonly="$mdAutocompleteCtrl.isReadonly"\
                ng-minlength="inputMinlength"\
                ng-maxlength="inputMaxlength"\
                ng-model="$mdAutocompleteCtrl.scope.searchText"\
                ng-keydown="$mdAutocompleteCtrl.keydown($event)"\
                ng-blur="$mdAutocompleteCtrl.blur($event)"\
                ng-focus="$mdAutocompleteCtrl.focus($event)"\
                placeholder="{{placeholder}}"\
                aria-owns="ul-{{$mdAutocompleteCtrl.id}}"\
                aria-label="{{placeholder}}"\
                aria-autocomplete="list"\
                role="combobox"\
                aria-haspopup="true"\
                aria-activedescendant=""\
                aria-expanded="{{!$mdAutocompleteCtrl.hidden}}"/>';
                }
            }

            function getClearButton() {
                return '' +
                    '<button ' +
                    'type="button" ' +
                    'aria-label="Clear Input" ' +
                    'tabindex="-1" ' +
                    'ng-if="clearButton && $mdAutocompleteCtrl.scope.searchText && !$mdAutocompleteCtrl.isDisabled" ' +
                    'ng-click="$mdAutocompleteCtrl.clear()">' +
                    '<md-icon md-svg-src="' + $$mdSvgRegistry.mdClose + '"></md-icon>' +
                    '</button>';
            }

			return '\
			  <md-autocomplete-wrap\
				  ng-class="{ \'md-whiteframe-z1\': !floatingLabel, \
							  \'md-menu-showing\': !$mdAutocompleteCtrl.hidden, \
							  \'md-show-clear-button\': !!clearButton }">\
				' + getInputElement() + '\
				' + getClearButton() + '\
				<md-progress-linear\
					class="' + (attr.mdFloatingLabel ? 'md-inline' : '') + '"\
					ng-if="$mdAutocompleteCtrl.loadingIsVisible()"\
					md-mode="indeterminate"></md-progress-linear>\
				<md-virtual-repeat-container\
					md-auto-shrink\
					md-auto-shrink-min="1"\
					ng-mouseenter="$mdAutocompleteCtrl.listEnter()"\
					ng-mouseleave="$mdAutocompleteCtrl.listLeave()"\
					ng-mouseup="$mdAutocompleteCtrl.mouseUp()"\
					ng-hide="$mdAutocompleteCtrl.hidden"\
					class="md-autocomplete-suggestions-container md-whiteframe-z1' + menuContainerClass + '"\
					class="md-autocomplete-suggestions-container md-whiteframe-z1"\
					ng-class="{ \'md-not-found\': $mdAutocompleteCtrl.notFoundVis_tf }"\
					role="presentation">\
				  <ul class="md-autocomplete-suggestions"\
					  ng-class="::menuClass"\
					  id="ul-{{$mdAutocompleteCtrl.id}}">\
					<li md-virtual-repeat="item in $mdAutocompleteCtrl.matches"\
						ng-class="{ selected: $index === $mdAutocompleteCtrl.index }"\
						ng-click="$mdAutocompleteCtrl.select($index)"\
						md-extra-name="$mdAutocompleteCtrl.itemName">\
						' + itemTemplate + '\
						</li>' + noItemsTemplate + '\
				  </ul>\
				</md-virtual-repeat-container>\
			  </md-autocomplete-wrap>';
        }
    };
}


function MdAutocompleteItemScopeDirective($compile, $mdUtil) {
	"use strict";

    function compile(tElement, tAttr, transclude) {

        return function postLink(scope, element) {
            var ctrl = scope.$mdAutocompleteCtrl,
				newScope = ctrl.parent.$new(),
				itemName = ctrl.itemName;

            function watchVariable(variable, alias) {
	
                newScope[alias] = scope[variable];

                scope.$watch(
					variable,
					function (value) {
						$mdUtil.nextTick(
							function () { newScope[alias] = value; },
							false
						);
					}
				);
            }

            function connectScopes() {
                var scopeDigesting = false,
					newScopeDigesting = false;

				function ng_md_ui_autocomplete_postdigest() {

					if (!newScopeDigesting) { newScope.$digest(); }

					scopeDigesting = false;
					newScopeDigesting = false;
				}

				scope.$$postDigest(ng_md_ui_autocomplete_postdigest);

                newScope.$watch(
					function () { newScopeDigesting = true; }
				);

                scope.$watch(
					function () {
						if (scopeDigesting) { return; }

						scopeDigesting = true;
					}
				);
            }

            // Watch for changes to our scope's variables and copy them to the new scope
            watchVariable('$index', '$index');
            watchVariable('item', itemName);

            // Ensure that $digest calls on our scope trigger $digest on newScope.
            connectScopes();

            // Link the element against newScope.
            transclude(
				newScope,
				function (clone) { element.after(clone); }
			);
        };
    }

    return {
        restrict: 'AE',
        compile: compile,
        terminal: true,
        transclude: 'element'
    };
}


angular.module(
    'ng.material.ui.autocomplete',
	[
		'ng',
		'ng.material.core',
		'ng.material.core.theming',
		'ng.material.ui.icon',
		'ng.material.ui.input',
		'ng.material.ui.repeater',
		'ng.material.ui.announcer',
		'ng.material.ui.progresslin'
	]
).controller(
	'mdAutocompleteCtrl',
	["$scope", "$element", "$mdUtil", "$mdConstant", "$mdTheming", "$window", "$animate", "$rootElement", "$attrs", "$q", "$log", "$mdLiveAnnouncer", MdAutocompleteCtrl]
).directive(
    'mdAutocomplete',
    ['$$mdSvgRegistry', MdAutocomplete]
).directive(
    'mdAutocompleteParentScope',
    ['$compile', '$mdUtil', MdAutocompleteItemScopeDirective]
).directive(
    'mdHighlightText',
    ['$interpolate', '$parse', MdHighlight]
).directive(
    'mdAutocompleteSnap',
    angular.restrictADir
).directive(
    'mdAutocompleteWrap',
    angular.restrictEDir
).directive(
    'mdMenuClass',
    angular.restrictADir
).directive(
    'mdNoCache',
    angular.restrictADir
).directive(
    'mdSearchText',
    angular.restrictADir
).directive(
    'mdSearchTextChange',
    angular.restrictADir
).directive(
    'mdSelectedItem',
    angular.restrictADir
).directive(
    'mdSelectedItemChange',
    angular.restrictADir
).directive(
    'mdAutoselect',
    angular.restrictADir
).directive(
    'mdItems',
    angular.restrictADir
).directive(
    'mdItemText',
    angular.restrictADir
).directive(
    'mdMenuClass',
    angular.restrictADir
).directive(
    'mdMenuContainerClass',
    angular.restrictADir
);
