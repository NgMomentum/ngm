
/**
 * @ngdoc module
 * @name material.components.chips
 */

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.chips");
msos.require("ng.material.core.theming");
msos.require("ng.material.ui.autocomplete");	// ref. template
msos.require("ng.material.ui.icon");			// ref. template
msos.require("ng.material.ui.button");			// ref. template

ng.material.ui.chips.version = new msos.set_version(18, 4, 15);

// Load AngularJS-Material module specific CSS
ng.material.ui.chips.css = new msos.loader();
ng.material.ui.chips.css.load(msos.resource_url('ng', 'material/css/ui/chips.css'));


ng.material.ui.chips.DEFAULT_CHIP_APPEND_DELAY = 300;

ng.material.ui.chips.MD_CHIPS_TEMPLATE = '\
      <md-chips-wrap\
          id="{{$mdChipsCtrl.wrapperId}}"\
          tabindex="{{$mdChipsCtrl.readonly ? 0 : -1}}"\
          ng-keydown="$mdChipsCtrl.chipKeydown($event)"\
          ng-class="{ \'md-focused\': $mdChipsCtrl.hasFocus(), \
                      \'md-readonly\': !$mdChipsCtrl.ngModelCtrl || $mdChipsCtrl.readonly,\
                      \'md-removable\': $mdChipsCtrl.isRemovable() }"\
          aria-setsize="{{$mdChipsCtrl.items.length}}"\
          class="md-chips">\
        <span ng-if="$mdChipsCtrl.readonly" class="md-visually-hidden">\
          {{$mdChipsCtrl.containerHint}}\
        </span>\
        <md-chip ng-repeat="$chip in $mdChipsCtrl.items"\
            md-chip-index="{{$index}}"\
            ng-class="{\'md-focused\': $mdChipsCtrl.selectedChip == $index, \'md-readonly\': !$mdChipsCtrl.ngModelCtrl || $mdChipsCtrl.readonly}">\
          <div class="md-chip-content"\
              tabindex="{{$mdChipsCtrl.ariaTabIndex == $index ? 0 : -1}}"\
              id="{{$mdChipsCtrl.contentIdFor($index)}}"\
              role="option"\
              aria-selected="{{$mdChipsCtrl.selectedChip == $index}}"\
              aria-posinset="{{$index}}"\
              ng-click="!$mdChipsCtrl.readonly && $mdChipsCtrl.focusChip($index)"\
              ng-focus="!$mdChipsCtrl.readonly && $mdChipsCtrl.selectChip($index)"\
              md-chip-transclude="$mdChipsCtrl.chipContentsTemplate"></div>\
          <div ng-if="$mdChipsCtrl.isRemovable()"\
               class="md-chip-remove-container"\
               tabindex="-1"\
               md-chip-transclude="$mdChipsCtrl.chipRemoveTemplate"></div>\
        </md-chip>\
        <div class="md-chip-input-container" ng-if="!$mdChipsCtrl.readonly && $mdChipsCtrl.ngModelCtrl">\
          <div md-chip-transclude="$mdChipsCtrl.chipInputTemplate"></div>\
        </div>\
      </md-chips-wrap>';

ng.material.ui.chips.CHIP_INPUT_TEMPLATE = '\
        <input\
            class="md-input"\
            tabindex="0"\
            aria-label="{{$mdChipsCtrl.inputAriaLabel}}" \
            placeholder="{{$mdChipsCtrl.getPlaceholder()}}"\
            ng-model="$mdChipsCtrl.chipBuffer"\
            ng-focus="$mdChipsCtrl.onInputFocus()"\
            ng-blur="$mdChipsCtrl.onInputBlur()"\
            ng-keydown="$mdChipsCtrl.inputKeydown($event)">';

ng.material.ui.chips.CHIP_DEFAULT_TEMPLATE = '\
	<span>{{$chip}}</span>';

ng.material.ui.chips.CHIP_REMOVE_TEMPLATE = '\
      <button\
          class="md-chip-remove"\
          ng-if="$mdChipsCtrl.isRemovable()"\
          ng-click="$mdChipsCtrl.removeChipAndFocusInput($$replacedScope.$index)"\
          type="button"\
          tabindex="-1">\
        <md-icon md-svg-src="{{ $mdChipsCtrl.mdCloseIcon }}"></md-icon>\
        <span class="md-visually-hidden">\
          {{$mdChipsCtrl.deleteButtonLabel}}\
        </span>\
      </button>';

ng.material.ui.chips.DELETE_HINT_TEMPLATE = '\
    <span ng-if="!$mdChipsCtrl.readonly" class="md-visually-hidden">\
      {{$mdChipsCtrl.deleteHint}}\
    </span>';

ng.material.ui.chips.MD_CONTACT_CHIPS_TEMPLATE = '\
      <md-chips class="md-contact-chips"\
          ng-model="$mdContactChipsCtrl.contacts"\
		  ng-change="$mdContactChipsCtrl.ngChange($mdContactChipsCtrl.contacts)"\
          md-require-match="$mdContactChipsCtrl.requireMatch"\
          md-chip-append-delay="{{$mdContactChipsCtrl.chipAppendDelay}}" \
          md-autocomplete-snap>\
          <md-autocomplete\
              md-menu-class="md-contact-chips-suggestions"\
              md-selected-item="$mdContactChipsCtrl.selectedItem"\
              md-search-text="$mdContactChipsCtrl.searchText"\
              md-items="item in $mdContactChipsCtrl.queryContact($mdContactChipsCtrl.searchText)"\
              md-item-text="$mdContactChipsCtrl.itemName(item)"\
              md-no-cache="true"\
              md-min-length="$mdContactChipsCtrl.minLength"\
              md-autoselect\
              placeholder="{{$mdContactChipsCtrl.contacts.length == 0 ?\
                  $mdContactChipsCtrl.placeholder : $mdContactChipsCtrl.secondaryPlaceholder}}">\
            <div class="md-contact-suggestion">\
              <img \
                  ng-src="{{item[$mdContactChipsCtrl.contactImage]}}"\
                  alt="{{item[$mdContactChipsCtrl.contactName]}}"\
                  ng-if="item[$mdContactChipsCtrl.contactImage]" />\
              <span class="md-contact-name" md-highlight-text="$mdContactChipsCtrl.searchText"\
                    md-highlight-flags="{{$mdContactChipsCtrl.highlightFlags}}">\
                {{item[$mdContactChipsCtrl.contactName]}}\
              </span>\
              <span class="md-contact-email" >{{item[$mdContactChipsCtrl.contactEmail]}}</span>\
            </div>\
          </md-autocomplete>\
          <md-chip-template>\
            <div class="md-contact-avatar">\
              <img \
                  ng-src="{{$chip[$mdContactChipsCtrl.contactImage]}}"\
                  alt="{{$chip[$mdContactChipsCtrl.contactName]}}"\
                  ng-if="$chip[$mdContactChipsCtrl.contactImage]" />\
            </div>\
            <div class="md-contact-name">\
              {{$chip[$mdContactChipsCtrl.contactName]}}\
            </div>\
          </md-chip-template>\
      </md-chips>';


function MdChip($mdTheming, $mdUtil, $compile, $timeout) {
	"use strict";

	var deleteHintTemplate = $mdUtil.processTemplate(ng.material.ui.chips.DELETE_HINT_TEMPLATE);

	function postLink(scope, element, attr, ctrls) {
		var chipsController = ctrls.shift(),
			chipController = ctrls.shift(),
			chipContentElement = angular.element(element[0].querySelector('.md-chip-content'));

		$mdTheming(element);

		if (chipsController) {
			chipController.init(chipsController);

			chipContentElement.append($compile(deleteHintTemplate)(scope));
			chipContentElement.on(
				'blur',
				function () {
					chipsController.resetSelectedChip();
					chipsController.$scope.$applyAsync();
				}
			);
		}

		$timeout(
			function ng_md_ui_chips_MdChip_postlink_to() {
				if (!chipsController) { return; }

				if (chipsController.shouldFocusLastChip) {
					chipsController.focusLastChipThenInput();
				}
			},
			0,
			false
		);
	}

	return {
		restrict: 'E',
		require: ['^?mdChips', 'mdChip'],
		link: postLink,
		controller: 'MdChipCtrl'
	};
}

function MdChipCtrl($scope, $element, $mdConstant, $timeout, $mdUtil) {
	"use strict";

    this.$scope = $scope;
    this.$element = $element;
    this.$mdConstant = $mdConstant;
    this.$timeout = $timeout;
    this.$mdUtil = $mdUtil;
    this.isEditing = false;
    this.parentController = undefined;
    this.enableChipEdit = false;
}


MdChipCtrl.prototype.init = function (controller) {
	"use strict";

    this.parentController = controller;
    this.enableChipEdit = this.parentController.enableChipEdit;

    if (this.enableChipEdit) {
        this.$element.on('keydown', this.chipKeyDown.bind(this));
        this.$element.on('dblclick', this.chipMouseDoubleClick.bind(this));
        this.getChipContent().addClass('_md-chip-content-edit-is-enabled');
    }
};

MdChipCtrl.prototype.getChipContent = function () {
	"use strict";

    var chipContents = this.$element[0].getElementsByClassName('md-chip-content');

    return angular.element(chipContents[0]);
};

MdChipCtrl.prototype.getContentElement = function () {
	"use strict";

    return angular.element(this.getChipContent().contents()[0]);
};

MdChipCtrl.prototype.getChipIndex = function () {
	"use strict";

    return parseInt(this.$element.attr('index'), 10);
};

MdChipCtrl.prototype.goOutOfEditMode = function () {
	"use strict";

    if (!this.isEditing) { return; }

    this.isEditing = false;
    this.$element.removeClass('_md-chip-editing');
    this.getChipContent()[0].contentEditable = 'false';

    var chipIndex = this.getChipIndex(),
		content = this.getContentElement().text();

    if (content) {
        this.parentController.updateChipContents(
            chipIndex,
            content
        );

        this.$mdUtil.nextTick(
			function () {
				if (this.parentController.selectedChip === chipIndex) {
					this.parentController.focusChip(chipIndex);
				}
			}.bind(this),
			false
		);
    } else {
        this.parentController.removeChipAndFocusInput(chipIndex);
    }
};

MdChipCtrl.prototype.selectNodeContents = function (node) {
	"use strict";

    var range,
		selection;

    if (document.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(node);
        range.select();
    } else if (window.getSelection) {
        selection = window.getSelection();
        range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
    }
};

MdChipCtrl.prototype.goInEditMode = function () {
	"use strict";

    this.isEditing = true;
    this.$element.addClass('_md-chip-editing');
    this.getChipContent()[0].contentEditable = 'true';
    this.getChipContent().on(
		'blur',
		function () {
			this.goOutOfEditMode();
		}.bind(this));

    this.selectNodeContents(this.getChipContent()[0]);
};

MdChipCtrl.prototype.chipKeyDown = function (event) {
	"use strict";

    if (!this.isEditing &&
        (event.keyCode === this.$mdConstant.KEY_CODE.ENTER ||
            event.keyCode === this.$mdConstant.KEY_CODE.SPACE)) {
        event.preventDefault();
        this.goInEditMode();
    } else if (this.isEditing &&
        event.keyCode === this.$mdConstant.KEY_CODE.ENTER) {
        event.preventDefault();
        this.goOutOfEditMode();
    }
};

MdChipCtrl.prototype.chipMouseDoubleClick = function () {
	"use strict";

	if (this.enableChipEdit && !this.isEditing) {
		this.goInEditMode();
	}
};


function MdContactChips($mdTheming, $mdUtil) {
	"use strict";

    function compile(element_na, attr) {

        return function postLink(scope, element, attrs, controllers) {
			var contactChipsController = controllers;

            $mdUtil.initOptionalProperties(scope, attr);
            $mdTheming(element);

            element.attr('tabindex', '-1');

			attrs.$observe(
				'mdChipAppendDelay',
				function (newValue) {
					contactChipsController.chipAppendDelay = newValue;
				}
			);
        };
    }

    return {
        template: function () {
            return ng.material.ui.chips.MD_CONTACT_CHIPS_TEMPLATE;
        },
        restrict: 'E',
        controller: 'MdContactChipsCtrl',
        controllerAs: '$mdContactChipsCtrl',
        bindToController: true,
        compile: compile,
        scope: {
            contactQuery: '&mdContacts',
            placeholder: '@',
            secondaryPlaceholder: '@',
            contactName: '@mdContactName',
            contactImage: '@mdContactImage',
            contactEmail: '@mdContactEmail',
            contacts: '=ngModel',
			ngChange: '&',
            requireMatch: '=?mdRequireMatch',
            minLength: '=?mdMinLength',
			highlightFlags: '@?mdHighlightFlags',
			chipAppendDelay: '@?mdChipAppendDelay'
        }
    };
}

function MdContactChipsCtrl () {
	"use strict";

	this.selectedItem = null;
	this.searchText = '';
}

MdContactChipsCtrl.prototype.queryContact = function (searchText) {
	"use strict";

	return this.contactQuery({'$query': searchText});
};

MdContactChipsCtrl.prototype.itemName = function (item) {
	"use strict";

	return item[this.contactName];
};


function MdChips($mdTheming, $mdUtil, $compile, $log, $timeout, $$mdSvgRegistry) {
	"use strict";

	function getTemplates() {
		return {
			'chips': $mdUtil.processTemplate(ng.material.ui.chips.MD_CHIPS_TEMPLATE),
			'input': $mdUtil.processTemplate(ng.material.ui.chips.CHIP_INPUT_TEMPLATE),
			'default': $mdUtil.processTemplate(ng.material.ui.chips.CHIP_DEFAULT_TEMPLATE),
			'remove': $mdUtil.processTemplate(ng.material.ui.chips.CHIP_REMOVE_TEMPLATE)
		};
	}

	var templates = getTemplates();

	function compile(element_na, attr) {
		// Grab the user template from attr and reset the attribute to null.
		var userTemplate = attr.$mdUserTemplate,
			chipTemplate,
			chipRemoveSelector,
			chipRemoveTemplate,
			chipContentsTemplate,
			chipInputTemplate,
			staticChips;

		attr.$mdUserTemplate = null;

		function getTemplateByQuery(query) {

			if (!attr.ngModel) { return undefined; }

			var element = userTemplate[0].querySelector(query);

			if (element) { return element.outerHTML; }

			return undefined;
		}

		chipTemplate = getTemplateByQuery('md-chips>md-chip-template');

		chipRemoveSelector = $mdUtil
			.prefixer()
			.buildList('md-chip-remove')
			.map(function (attr) { return 'md-chips>*[' + attr + ']'; })
			.join(',');

		chipRemoveTemplate = getTemplateByQuery(chipRemoveSelector) || templates.remove;
		chipContentsTemplate = chipTemplate || templates['default'];
		chipInputTemplate = getTemplateByQuery('md-chips>md-autocomplete') || getTemplateByQuery('md-chips>input') || templates.input;
		staticChips = userTemplate.find('md-chip');

		if (userTemplate[0].querySelector('md-chip-template>*[md-chip-remove]')) {
			$log.warn('invalid placement of md-chip-remove within md-chip-template.');
		}

		return function postLink(scope, element, attrs, controllers) {

			$mdUtil.initOptionalProperties(scope, attr);

			$mdTheming(element);

			var mdChipsCtrl = controllers[0],
				compiledStaticChips;

			if (chipTemplate) {
				mdChipsCtrl.enableChipEdit = false;
			}

			mdChipsCtrl.chipContentsTemplate = chipContentsTemplate;
			mdChipsCtrl.chipRemoveTemplate = chipRemoveTemplate;
			mdChipsCtrl.chipInputTemplate = chipInputTemplate;
			mdChipsCtrl.mdCloseIcon = $$mdSvgRegistry.mdClose;

			element
				.attr({
					tabindex: -1
				})
				.on(
					'focus',
					function () {
						mdChipsCtrl.onFocus();
					}
				).on(
					'click',
					function () {
						if (!mdChipsCtrl.readonly && mdChipsCtrl.selectedChip === -1) {
							mdChipsCtrl.onFocus();
						}
					}
				);

			if (attr.ngModel) {

				mdChipsCtrl.configureNgModel(element.controller('ngModel'));

				if (attrs.mdTransformChip)	{ mdChipsCtrl.useTransformChipExpression(); }
				if (attrs.mdOnAdd)			{ mdChipsCtrl.useOnAddExpression(); }
				if (attrs.mdOnRemove)		{ mdChipsCtrl.useOnRemoveExpression(); }
				if (attrs.mdOnSelect)		{ mdChipsCtrl.useOnSelectExpression(); }

				if (chipInputTemplate !== templates.input) {

					scope.$watch(
						'$mdChipsCtrl.readonly',
						function (readonly) {
							if (!readonly) {

								$mdUtil.nextTick(
									function () {
										if (chipInputTemplate.indexOf('<md-autocomplete') === 0) {
											var autocompleteEl = element.find('md-autocomplete');
											mdChipsCtrl.configureAutocomplete(autocompleteEl.controller('mdAutocomplete'));
										}

										mdChipsCtrl.configureUserInput(element.find('input'));
									},
									false
								);
							}
						}
					);
				}

				$mdUtil.nextTick(
					function () {
						var input = element.find('input');

						if (input ) {
							mdChipsCtrl.configureInput(input);
							input.toggleClass('md-input', true);
						}
					}
				);
			}

			// Compile with the parent's scope and prepend any static chips to the wrapper.
			if (staticChips.length > 0) {
				compiledStaticChips = $compile(staticChips.clone())(scope.$parent);
				$timeout(
					function ng_md_ui_chips_MdChips_postlink_to() {
						element.find('md-chips-wrap').prepend(compiledStaticChips);
					},
					0,
					false
				);
			}
		};
	}

	return {
		template: function (element, attrs) {
			attrs.$mdUserTemplate = element.clone();
			return templates.chips;
		},
		require: ['mdChips'],
		restrict: 'E',
		controller: 'MdChipsCtrl',
		controllerAs: '$mdChipsCtrl',
		bindToController: true,
		compile: compile,
		scope: {
			readonly: '=readonly',
			removable: '=mdRemovable',
			placeholder: '@',
			secondaryPlaceholder: '@',
			maxChips: '@mdMaxChips',
			transformChip: '&mdTransformChip',
			onAppend: '&mdOnAppend',
			onAdd: '&mdOnAdd',
			onRemove: '&mdOnRemove',
			onSelect: '&mdOnSelect',
			inputAriaLabel: '@',
			containerHint: '@',
			deleteHint: '@',
			deleteButtonLabel: '@',
			separatorKeys: '=?mdSeparatorKeys',
			requireMatch: '=?mdRequireMatch',
			chipAppendDelayString: '@?mdChipAppendDelay',
			ngChange: '&'
		}
	};
}

function MdChipsCtrl($scope, $attrs, $mdConstant, $log, $element, $timeout, $mdUtil, $exceptionHandler) {
	"use strict";

    this.$timeout = $timeout;
    this.$mdConstant = $mdConstant;
    this.$scope = $scope;
    this.parent = $scope.$parent;
	this.$mdUtil = $mdUtil;
    this.$log = $log;
	this.$exceptionHandler = $exceptionHandler;
    this.$element = $element;
	this.$attrs = $attrs;
    this.ngModelCtrl = null;
    this.userInputNgModelCtrl = null;
    this.autocompleteCtrl = null;
    this.userInputElement = null;
    this.items = [];
    this.selectedChip = -1;
    this.enableChipEdit = $mdUtil.parseAttributeBoolean($attrs.mdEnableChipEdit);
    this.addOnBlur = $mdUtil.parseAttributeBoolean($attrs.mdAddOnBlur);
	this.inputAriaLabel = 'Chips input.';
	this.containerHint = 'Chips container. Use arrow keys to select chips.';
    this.deleteHint = 'Press delete to remove this chip.';
    this.deleteButtonLabel = 'Remove';
    this.chipBuffer = '';
    this.useTransformChip = false;
    this.useOnAdd = false;
    this.useOnRemove = false;
	this.wrapperId = '';
	this.contentIds = [];
	this.ariaTabIndex = null;
	this.chipAppendDelay = ng.material.ui.chips.DEFAULT_CHIP_APPEND_DELAY;
	this.deRegister = [];

	this.init();
}

MdChipsCtrl.prototype.init = function () {
	var ctrl = this;

	this.wrapperId = '_md-chips-wrapper-' + this.$mdUtil.nextUid();

	this.deRegister.push(
		this.$scope.$watchCollection(
			'$mdChipsCtrl.items',
			function () {
				ctrl.setupInputAria();
				ctrl.setupWrapperAria();
			}
		)
	);

	this.deRegister.push(
		this.$attrs.$observe(
			'mdChipAppendDelay',
			function (newValue) {
				ctrl.chipAppendDelay = parseInt(newValue) || ng.material.ui.chips.DEFAULT_CHIP_APPEND_DELAY;
			}
		)
	);
};

MdChipsCtrl.prototype.$onDestroy = function $onDestroy() {
	var $destroyFn;

	$destroyFn = this.deRegister.pop();
	
	while ($destroyFn) {
		$destroyFn.call(this);
		$destroyFn = this.deRegister.pop();
	}
};

MdChipsCtrl.prototype.setupInputAria = function () {
	var input = this.$element.find('input');

	if (!input) { return; }

	input.attr('role', 'textbox');
	input.attr('aria-multiline', true);
};

MdChipsCtrl.prototype.setupWrapperAria = function () {
	var ctrl = this,
		wrapper = this.$element.find('md-chips-wrap');

	if (this.items && this.items.length) {
		wrapper.attr('role', 'listbox');

		this.contentIds = this.items.map(
			function() {
				return ctrl.wrapperId + '-chip-' + ctrl.$mdUtil.nextUid();
			}
		);

		wrapper.attr('aria-owns', this.contentIds.join(' '));

	} else {
		wrapper.removeAttr('role');
		wrapper.removeAttr('aria-owns');
	}
};

MdChipsCtrl.prototype.inputKeydown = function (event) {
	"use strict";

    var chipBuffer = this.getChipBuffer();

    // If we have an autocomplete, and it handled the event, we have nothing to do
    if (this.autocompleteCtrl && event.isDefaultPrevented && event.isDefaultPrevented()) {
        return;
    }

    if (event.keyCode === this.$mdConstant.KEY_CODE.BACKSPACE) {
        // Only select and focus the previous chip, if the current caret position of the
        // input element is at the beginning.
        if (this.getCursorPosition(event.target) !== 0) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (this.items.length) {
            this.selectAndFocusChipSafe(this.items.length - 1);
        }

        return;
    }

    // By default <enter> appends the buffer to the chip list.
    if (!this.separatorKeys || this.separatorKeys.length < 1) {
        this.separatorKeys = [this.$mdConstant.KEY_CODE.ENTER];
    }

    // Support additional separator key codes in an array of `md-separator-keys`.
    if (this.separatorKeys.indexOf(event.keyCode) !== -1) {
        if ((this.autocompleteCtrl && this.requireMatch) || !chipBuffer) { return; }
        event.preventDefault();

        // Only append the chip and reset the chip buffer if the max chips limit isn't reached.
        if (this.hasMaxChipsReached()) { return; }

        this.appendChip(chipBuffer.trim());
        this.resetChipBuffer();

		return false;
    }
};

MdChipsCtrl.prototype.getCursorPosition = function (element) {
	"use strict";

    try {
        if (element.selectionStart === element.selectionEnd) {
            return element.selectionStart;
        }
    } catch (e) {
        if (!element.value) {
            return 0;
        }
    }

	return undefined;
};

MdChipsCtrl.prototype.updateChipContents = function (chipIndex, chipContents) {
	"use strict";

    if (chipIndex >= 0 && chipIndex < this.items.length) {
        this.items[chipIndex] = chipContents;
        this.updateNgModel(true);
    }
};

MdChipsCtrl.prototype.isEditingChip = function () {
	"use strict";

    return !!this.$element[0].querySelector('._md-chip-editing');
};


MdChipsCtrl.prototype.isRemovable = function () {
	"use strict";
    // Return false if we have static chips
    if (!this.ngModelCtrl) {
        return false;
    }

    return this.readonly ? this.removable : angular.isDefined(this.removable) ? this.removable : true;
};

MdChipsCtrl.prototype.chipKeydown = function (event) {
	"use strict";

    if (this.getChipBuffer()) { return; }
    if (this.isEditingChip()) { return; }

    switch (event.keyCode) {
        case this.$mdConstant.KEY_CODE.BACKSPACE:
        case this.$mdConstant.KEY_CODE.DELETE:
            if (this.selectedChip < 0) { return; }
            event.preventDefault();
            // Cancel the delete action only after the event cancel. Otherwise the page will go back.
            if (!this.isRemovable()) { return; }
			this.removeAndSelectAdjacentChip(this.selectedChip, event);
            break;
        case this.$mdConstant.KEY_CODE.LEFT_ARROW:
            event.preventDefault();
			if (this.selectedChip < 0 || (this.readonly && this.selectedChip === 0)) {
				this.selectedChip = this.items.length;
			}
			if (this.items.length) { this.selectAndFocusChipSafe(this.selectedChip - 1); }
            break;
        case this.$mdConstant.KEY_CODE.RIGHT_ARROW:
            event.preventDefault();
            this.selectAndFocusChipSafe(this.selectedChip + 1);
            break;
        case this.$mdConstant.KEY_CODE.ESCAPE:
        case this.$mdConstant.KEY_CODE.TAB:
            if (this.selectedChip < 0) { return; }
            event.preventDefault();
            this.onFocus();
            break;
    }
};

MdChipsCtrl.prototype.getPlaceholder = function () {
	"use strict";

    // Allow `secondary-placeholder` to be blank.
    var useSecondary = (this.items && this.items.length && (this.secondaryPlaceholder === '' || this.secondaryPlaceholder));

    return useSecondary ? this.secondaryPlaceholder : this.placeholder;
};

MdChipsCtrl.prototype.removeAndSelectAdjacentChip = function (index, event) {
	"use strict";

    var self = this,
		selIndex = self.getAdjacentChipIndex(index);

    self.removeChip(index, event);

	// This doesn't look very efficient?
    self.$timeout(
		function ng_md_ui_chips_MdChipsCtrl_rm_to1() {
			self.$timeout(
				function ng_md_ui_chips_MdChipsCtrl_rm_to2() {
					self.selectAndFocusChipSafe(selIndex);
				},
				0,
				false
			);
		},
		0,
		false
	);
};

MdChipsCtrl.prototype.resetSelectedChip = function () {
	"use strict";

    this.selectedChip = -1;
	this.ariaTabIndex = null;
};

MdChipsCtrl.prototype.getAdjacentChipIndex = function (index) {
	"use strict";

    var len = this.items.length - 1;

    return (len === 0) ? -1 : (index === len) ? index - 1 : index;
};

MdChipsCtrl.prototype.appendChip = function (newChip) {
	"use strict";

	var transformedChip,
		identical,
		length,
		index;

	this.shouldFocusLastChip = !this.addOnBlur;

	if (this.useTransformChip && this.transformChip) {

		transformedChip = this.transformChip({ '$chip': newChip });

		if (angular.isDefined(transformedChip)) {
			newChip = transformedChip;
		}
	}

	if (angular.isObject(newChip)) {
		identical = this.items.some(
			function (item) {
				return angular.equals(newChip, item);
			}
		);

		if (identical) { return; }
	}

	if (newChip === null || newChip === undefined || this.items.indexOf(newChip) + 1) { return; }

	length = this.items.push(newChip);
	index = length - 1;

	// Update model validation
	this.updateNgModel();

	if (this.useOnAdd && this.onAdd) {
		this.onAdd({ '$chip': newChip, '$index': index });
	}
};

MdChipsCtrl.prototype.useTransformChipExpression = function () {
	"use strict";

    this.useTransformChip = true;
};

MdChipsCtrl.prototype.useOnAddExpression = function () {
	"use strict";

    this.useOnAdd = true;
};

MdChipsCtrl.prototype.useOnRemoveExpression = function () {
	"use strict";

    this.useOnRemove = true;
};

MdChipsCtrl.prototype.useOnSelectExpression = function () {
	"use strict";

    this.useOnSelect = true;
};

MdChipsCtrl.prototype.getChipBuffer = function () {
	"use strict";

	var chipBuffer = !this.userInputElement ? this.chipBuffer :
                     this.userInputNgModelCtrl ? this.userInputNgModelCtrl.$viewValue :
                     this.userInputElement[0].value;

    return angular.isString(chipBuffer) ? chipBuffer : '';
};

MdChipsCtrl.prototype.resetChipBuffer = function () {
	"use strict";

    if (this.userInputElement) {
        if (this.userInputNgModelCtrl) {
            this.userInputNgModelCtrl.$setViewValue('');
            this.userInputNgModelCtrl.$render();
        } else {
            this.userInputElement[0].value = '';
        }
    } else {
        this.chipBuffer = '';
    }
};

MdChipsCtrl.prototype.hasMaxChipsReached = function () {
	"use strict";

    if (angular.isString(this.maxChips)) { this.maxChips = parseInt(this.maxChips, 10) || 0; }

    return this.maxChips > 0 && this.items.length >= this.maxChips;
};

MdChipsCtrl.prototype.validateModel = function () {
	"use strict";

	this.ngModelCtrl.$setValidity('md-max-chips', !this.hasMaxChipsReached());
	this.ngModelCtrl.$validate(); // rerun any registered validators
};

MdChipsCtrl.prototype.updateNgModel = function (skipValidation) {
	"use strict";

	if (!skipValidation) { this.validateModel(); }

	// This will trigger ng-change to fire, even in cases where $setViewValue() would not.
	angular.forEach(
		this.ngModelCtrl.$viewChangeListeners,
		function (listener) {
			try {
				listener();
			} catch (e) {
				msos.console.error('ng.material.ui.chips - MdChipsCtrl - updateNgModel -> failed, for: ', e);
			}
		}
	);
};

MdChipsCtrl.prototype.removeChip = function (index, event) {
	"use strict";

    var removed = this.items.splice(index, 1);

    this.updateNgModel();

    if (removed && removed.length && this.useOnRemove && this.onRemove) {
        this.onRemove(
			{ '$chip': removed[0], '$index': index, '$event': event }
		);
    }
};

MdChipsCtrl.prototype.removeChipAndFocusInput = function (index, $event) {
	"use strict";

    this.removeChip(index, $event);

    if (this.autocompleteCtrl) {
        this.autocompleteCtrl.hidden = true;
        this.$mdUtil.nextTick(this.onFocus.bind(this));
    } else {
        this.onFocus();
    }

};

MdChipsCtrl.prototype.selectAndFocusChipSafe = function (index) {
	"use strict";

	if (!this.items.length || index === -1) {
		return this.focusInput();
	}

	if (index >= this.items.length) {
		if (this.readonly) {
			index = 0;
		} else {
			return this.onFocus();
		}
	}

	index = Math.max(index, 0);
	index = Math.min(index, this.items.length - 1);

	this.selectChip(index);
	this.focusChip(index);
};

MdChipsCtrl.prototype.focusLastChipThenInput = function () {
	"use strict";

	var ctrl = this;

	ctrl.shouldFocusLastChip = false;

	ctrl.focusChip(this.items.length - 1);

	ctrl.$timeout(
		function ng_md_ui_chips_MdChipsCtrl_focus_to() {
			ctrl.focusInput();
		},
		ctrl.chipAppendDelay,
		false
	);
};

MdChipsCtrl.prototype.focusInput = function () {
	"use strict";

	this.selectChip(-1);
	this.onFocus();
};

MdChipsCtrl.prototype.selectChip = function (index) {
	"use strict";

    if (index >= -1 && index <= this.items.length) {
        this.selectedChip = index;

		// Fire the onSelect if provided
		if (this.useOnSelect && this.onSelect) {
			this.onSelect({ '$chip': this.items[index] });
		}

    } else {
        this.$log.warn('Selected Chip index out of bounds; ignoring.');
    }
};

MdChipsCtrl.prototype.selectAndFocusChip = function (index) {
	"use strict";

    this.selectChip(index);

    if (index !== -1) {
        this.focusChip(index);
    }
};

MdChipsCtrl.prototype.focusChip = function (index) {
	"use strict";

	var chipContent = this.$element[0].querySelector(
			'md-chip[md-chip-index="' + index + '"] .md-chip-content'
		);

	this.ariaTabIndex = index;

	chipContent.focus();
};

MdChipsCtrl.prototype.configureNgModel = function (ngModelCtrl) {
	"use strict";

    this.ngModelCtrl = ngModelCtrl;

    var self = this;

	// in chips the meaning of $isEmpty changes
	ngModelCtrl.$isEmpty = function (value) {
		return !value || value.length === 0;
	};

    ngModelCtrl.$render = function () {
        // model is updated. do something.
        self.items = self.ngModelCtrl.$viewValue;
    };
};

MdChipsCtrl.prototype.onFocus = function () {
	"use strict";

    var input = this.$element[0].querySelector('input');

	if (input && input.focus) { input.focus(); }

    this.resetSelectedChip();
};

MdChipsCtrl.prototype.onInputFocus = function () {
	"use strict";

    this.inputHasFocus = true;
	this.setupInputAria();
    this.resetSelectedChip();
};

MdChipsCtrl.prototype.onInputBlur = function () {
	"use strict";

    this.inputHasFocus = false;

	if (this.shouldAddOnBlur()) {
		this.appendChip(this.getChipBuffer().trim());
		this.resetChipBuffer();
	}
};

MdChipsCtrl.prototype.configureInput = function configureInput(inputElement) {

	var ngModelCtrl = inputElement.controller('ngModel'),
		ctrl = this;

	if (ngModelCtrl) {

		this.deRegister.push(
			this.$scope.$watch(
				function () { return ngModelCtrl.$touched; },
				function (isTouched) {
					if (isTouched) {
						ctrl.ngModelCtrl.$setTouched();
					}
				}
			)
		);

		this.$scope.$watch(
			function() { return ngModelCtrl.$dirty; },
			function (isDirty) {
				if (isDirty) {
					ctrl.ngModelCtrl.$setDirty();
				}
			}
		);
	}
};

MdChipsCtrl.prototype.configureUserInput = function (inputElement) {
	"use strict";

    this.userInputElement = inputElement;

    var ngModelCtrl = inputElement.controller('ngModel'),
		scope,
		ctrl,
		scopeApplyFn;

    if (ngModelCtrl !== this.ngModelCtrl) {		// Leave as is for now (undefined and null)
        this.userInputNgModelCtrl = ngModelCtrl;
    }

    scope = this.$scope;
    ctrl = this;

    scopeApplyFn = function (event, fn) {
        scope.$evalAsync(angular.bind(ctrl, fn, event));
    };

    // Bind to keydown and focus events of input
    inputElement
        .attr({ tabindex: 0 })
        .on('keydown', function (event) {
            scopeApplyFn(event, ctrl.inputKeydown);
        }).on('focus', function (event) {
            scopeApplyFn(event, ctrl.onInputFocus);
        }).on('blur', function (event) {
            scopeApplyFn(event, ctrl.onInputBlur);
        });
};

MdChipsCtrl.prototype.configureAutocomplete = function (ctrl) {
	"use strict";

    if (ctrl) {

        this.autocompleteCtrl = ctrl;

        ctrl.registerSelectedItemWatcher(angular.bind(this, function (item) {
            if (item) {
                // Only append the chip and reset the chip buffer if the max chips limit isn't reached.
                if (this.hasMaxChipsReached()) { return; }

                this.appendChip(item);
                this.resetChipBuffer();
            }
        }));

        this.$element.find('input')
            .on('focus', angular.bind(this, this.onInputFocus))
            .on('blur', angular.bind(this, this.onInputBlur));
    }
};

MdChipsCtrl.prototype.shouldAddOnBlur = function () {

	this.validateModel();

	var chipBuffer = this.getChipBuffer().trim(),
		isModelValid = this.ngModelCtrl.$isEmpty(this.ngModelCtrl.$modelValue) || this.ngModelCtrl.$valid,
		isAutocompleteShowing = this.autocompleteCtrl && !this.autocompleteCtrl.hidden;

	if (this.userInputNgModelCtrl) {
		isModelValid = isModelValid && this.userInputNgModelCtrl.$valid;
	}

	return this.addOnBlur && !this.requireMatch && chipBuffer && isModelValid && !isAutocompleteShowing;
};

MdChipsCtrl.prototype.hasFocus = function () {
	"use strict";

    return this.inputHasFocus || this.selectedChip >= 0;
};

MdChipsCtrl.prototype.contentIdFor = function (index) {
	return this.contentIds[index];
};

function MdChipTransclude($compile) {
	"use strict";

	function link (scope, element, attr) {
		var ctrl = scope.$parent.$mdChipsCtrl,
			newScope = ctrl.parent.$new(false, ctrl.parent),
			newHtml;

		newScope.$$replacedScope = scope;
		newScope.$chip = scope.$chip;
		newScope.$index = scope.$index;
		newScope.$mdChipsCtrl = ctrl;

		newHtml = ctrl.$scope.$eval(attr.mdChipTransclude);

		element.html(newHtml);
		$compile(element.contents())(newScope);
	}

	return {
		restrict: 'EA',
		terminal: true,
		link: link,
		scope: false
	};
}

function MdChipRemove ($timeout) {
	"use strict";

	function postLink(scope, element, attr_na, ctrl) {
		element.on(
			'click', function () {
				scope.$apply(function () {
					ctrl.removeChip(scope.$$replacedScope.$index);
				});
			}
		);

		$timeout(
			function ng_md_ui_chips_MdChipRemove_postlink_to() {
				element.attr({ tabindex: -1, 'aria-hidden': true });
				element.find('button').attr('tabindex', '-1');
			},
			0,
			false
		);
	}

	return {
		restrict: 'A',
		require: '^mdChips',
		scope: false,
		link: postLink
	};
}


angular.module(
    'ng.material.ui.chips',
	[
		'ng',
		'ng.material.core',
		'ng.material.core.theming',
		'ng.material.ui.icon',
		'ng.material.ui.autocomplete'
	]
).controller(
	'MdChipCtrl',
	["$scope", "$element", "$mdConstant", "$timeout", "$mdUtil", MdChipCtrl]
).controller(
	'MdChipsCtrl',
	["$scope", "$attrs", "$mdConstant", "$log", "$element", "$timeout", "$mdUtil", "$exceptionHandler", MdChipsCtrl]
).controller(
	'MdContactChipsCtrl',
	MdContactChipsCtrl
).directive(
	'mdChip',
	["$mdTheming", "$mdUtil", "$compile", "$timeout", MdChip]
).directive(
	'mdChips',
	["$mdTheming", "$mdUtil", "$compile", "$log", "$timeout", "$$mdSvgRegistry", MdChips]
).directive(
	'mdContactChips',
	["$mdTheming", "$mdUtil", MdContactChips]
).directive(
	'mdChipTransclude',
	["$compile", MdChipTransclude]
).directive(
	'mdChipRemove',
	["$timeout", MdChipRemove]
).directive(
    'mdChipsWrap',
    angular.restrictEDir
).directive(
    'mdChipTemplate',
    angular.restrictEDir
).directive(
    'mdEnableChipEdit',
    angular.restrictADir
).directive(
    'mdChipAppendDelay',
    angular.restrictADir
).directive(
    'mdTransformChip',
    angular.restrictADir
).directive(
    'mdMaxChips',
    angular.restrictADir
).directive(
    'mdChipIndex',
    angular.restrictADir
).directive(
    'mdContacts',
    angular.restrictADir
).directive(
    'mdContactName',
    angular.restrictADir
).directive(
    'mdContactImage',
    angular.restrictADir
).directive(
    'mdContactEmail',
    angular.restrictADir
).directive(
    'mdSeparatorKeys',
    angular.restrictADir
);
