
/**
 * @ngdoc module
 * @name material.components.chips
 */

/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.v111.ui.chips");
msos.require("ng.material.v111.core");

ng.material.v111.ui.chips.version = new msos.set_version(17, 1, 11);


ng.material.v111.ui.chips.DELETE_HINT_TEMPLATE = '\
    <span ng-if="!$mdChipsCtrl.readonly" class="md-visually-hidden">\
      {{$mdChipsCtrl.deleteHint}}\
    </span>';

function MdChip($mdTheming, $mdUtil) {
	"use strict";

	var hintTemplate = $mdUtil.processTemplate(ng.material.v111.ui.chips.DELETE_HINT_TEMPLATE);

	function compile(element, attr_na) {
		// Append the delete template
		element.append($mdUtil.processTemplate(hintTemplate));

		return function postLink(scope_na, element, attr_na, ctrls) {
			var chipsController = ctrls.shift(),
				chipController  = ctrls.shift();

			$mdTheming(element);

			if (chipsController) {
				chipController.init(chipsController);

				angular
					.element(element[0]
					.querySelector('.md-chip-content'))
					.on('blur', function () {
						chipsController.resetSelectedChip();
						chipsController.$scope.$applyAsync();
					});
			}
		};
	}

	return {
		restrict: 'E',
		require: ['^?mdChips', 'mdChip'],
		compile:  compile,
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
    this.isEditting = false;
    this.parentController = undefined;
    this.enableChipEdit = false;
}


MdChipCtrl.prototype.init = function (controller) {
	"use strict";

    this.parentController = controller;
    this.enableChipEdit = this.parentController.enableChipEdit;

    if (this.enableChipEdit) {
        this.$element.on('keydown', this.chipKeyDown.bind(this));
        this.$element.on('mousedown', this.chipMouseDown.bind(this));
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

    return angular.element(this.getChipContent().children()[0]);
};

MdChipCtrl.prototype.getChipIndex = function () {
	"use strict";

    return parseInt(this.$element.attr('index'), 10);
};

MdChipCtrl.prototype.goOutOfEditMode = function () {
	"use strict";

    if (!this.isEditting) { return; }

    this.isEditting = false;
    this.$element.removeClass('_md-chip-editing');
    this.getChipContent()[0].contentEditable = 'false';

    var chipIndex = this.getChipIndex(),
		content = this.getContentElement().text();

    if (content) {
        this.parentController.updateChipContents(
            chipIndex,
            this.getContentElement().text()
        );

        this.$mdUtil.nextTick(
			function () {
				if (this.parentController.selectedChip === chipIndex) {
					this.parentController.focusChip(chipIndex);
				}
			}.bind(this)
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

    this.isEditting = true;
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

    if (!this.isEditting &&
        (event.keyCode === this.$mdConstant.KEY_CODE.ENTER ||
            event.keyCode === this.$mdConstant.KEY_CODE.SPACE)) {
        event.preventDefault();
        this.goInEditMode();
    } else if (this.isEditting &&
        event.keyCode === this.$mdConstant.KEY_CODE.ENTER) {
        event.preventDefault();
        this.goOutOfEditMode();
    }
};

MdChipCtrl.prototype.chipMouseDown = function () {
	"use strict";

    if (this.getChipIndex() === this.parentController.selectedChip
	 && this.enableChipEdit
	 && !this.isEditting) {
        this.goInEditMode();
    }
};

ng.material.v111.ui.chips.CONTACT_TEMPLATE = '\
	<md-chips class="md-contact-chips"\
		ng-model="$mdContactChipsCtrl.contacts"\
		md-require-match="$mdContactChipsCtrl.requireMatch"\
		md-autocomplete-snap>\
		<md-autocomplete\
			md-menu-class="md-contact-chips-suggestions"\
			md-selected-item="$mdContactChipsCtrl.selectedItem"\
			md-search-text="$mdContactChipsCtrl.searchText"\
			md-items="item in $mdContactChipsCtrl.queryContact($mdContactChipsCtrl.searchText)"\
			md-item-text="$mdContactChipsCtrl.itemName(item)"\
			md-no-cache="true"\
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

function MdContactChips($mdTheming, $mdUtil) {
	"use strict";

    function compile(element_na, attr) {

        return function postLink(scope, element, attrs_na) {

            $mdUtil.initOptionalProperties(scope, attr);
            $mdTheming(element);

            element.attr('tabindex', '-1');
        };
    }

    return {
        template: function () {
            return ng.material.v111.ui.chips.CONTACT_TEMPLATE;
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
            requireMatch: '=?mdRequireMatch',
            highlightFlags: '@?mdHighlightFlags'
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

	var results = this.contactQuery({'$query': searchText});

	return this.filterSelected ? results.filter(angular.bind(this, this.filterSelectedContacts)) : results;
};

MdContactChipsCtrl.prototype.itemName = function (item) {
	"use strict";

	return item[this.contactName];
};


MdContactChipsCtrl.prototype.filterSelectedContacts = function (contact) {
	"use strict";

	return this.contacts.indexOf(contact) === -1;
};

ng.material.v111.ui.chips.CHIPS_TEMPLATE = '\
	<md-chips-wrap\
		ng-keydown="$mdChipsCtrl.chipKeydown($event)"\
		ng-class="{ \'md-focused\': $mdChipsCtrl.hasFocus(), \
					\'md-readonly\': !$mdChipsCtrl.ngModelCtrl || $mdChipsCtrl.readonly,\
					\'md-removable\': $mdChipsCtrl.isRemovable() }"\
		class="md-chips">\
	  <md-chip ng-repeat="$chip in $mdChipsCtrl.items"\
		  index="{{$index}}"\
		  ng-class="{\'md-focused\': $mdChipsCtrl.selectedChip == $index, \'md-readonly\': !$mdChipsCtrl.ngModelCtrl || $mdChipsCtrl.readonly}">\
		<div class="md-chip-content"\
			tabindex="-1"\
			aria-hidden="true"\
			ng-click="!$mdChipsCtrl.readonly && $mdChipsCtrl.focusChip($index)"\
			ng-focus="!$mdChipsCtrl.readonly && $mdChipsCtrl.selectChip($index)"\
			md-chip-transclude="$mdChipsCtrl.chipContentsTemplate"></div>\
		<div ng-if="$mdChipsCtrl.isRemovable()"\
			 class="md-chip-remove-container"\
			 md-chip-transclude="$mdChipsCtrl.chipRemoveTemplate"></div>\
	  </md-chip>\
	  <div class="md-chip-input-container" ng-if="!$mdChipsCtrl.readonly && $mdChipsCtrl.ngModelCtrl">\
		<div md-chip-transclude="$mdChipsCtrl.chipInputTemplate"></div>\
	  </div>\
	</md-chips-wrap>';

ng.material.v111.ui.chips.CHIP_INPUT_TEMPLATE = '\
	<input\
		class="md-input"\
		tabindex="0"\
		placeholder="{{$mdChipsCtrl.getPlaceholder()}}"\
		aria-label="{{$mdChipsCtrl.getPlaceholder()}}"\
		ng-model="$mdChipsCtrl.chipBuffer"\
		ng-focus="$mdChipsCtrl.onInputFocus()"\
		ng-blur="$mdChipsCtrl.onInputBlur()"\
		ng-keydown="$mdChipsCtrl.inputKeydown($event)">';

ng.material.v111.ui.chips.CHIP_DEFAULT_TEMPLATE = '\
    <span>{{$chip}}</span>';

ng.material.v111.ui.chips.CHIP_REMOVE_TEMPLATE = '\
	<button\
		class="md-chip-remove"\
		ng-if="$mdChipsCtrl.isRemovable()"\
		ng-click="$mdChipsCtrl.removeChipAndFocusInput($$replacedScope.$index)"\
		type="button"\
		aria-hidden="true"\
		tabindex="-1">\
	  <md-icon md-svg-src="{{ $mdChipsCtrl.mdCloseIcon }}"></md-icon>\
	  <span class="md-visually-hidden">\
		{{$mdChipsCtrl.deleteButtonLabel}}\
	  </span>\
	</button>';

function MdChips($mdTheming, $mdUtil, $compile, $log, $timeout, $$mdSvgRegistry) {
	"use strict";

	function getTemplates() {
		return {
			'chips': $mdUtil.processTemplate(ng.material.v111.ui.chips.CHIPS_TEMPLATE),
			'input': $mdUtil.processTemplate(ng.material.v111.ui.chips.CHIP_INPUT_TEMPLATE),
			'default': $mdUtil.processTemplate(ng.material.v111.ui.chips.CHIP_DEFAULT_TEMPLATE),
			'remove': $mdUtil.processTemplate(ng.material.v111.ui.chips.CHIP_REMOVE_TEMPLATE)
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
					'aria-hidden': true,
					tabindex: -1
				})
				.on('focus', function () {
					mdChipsCtrl.onFocus();
				});

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
									}
								);
							}
						}
					);
				}

				$mdUtil.nextTick(
					function () {
						var input = element.find('input');

						if (input ) {
							input.toggleClass('md-input', true);
						}
					}
				);
			}

			// Compile with the parent's scope and prepend any static chips to the wrapper.
			if (staticChips.length > 0) {
				compiledStaticChips = $compile(staticChips.clone())(scope.$parent);
				$timeout(function () {
					element.find('md-chips-wrap').prepend(compiledStaticChips);
				});
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
			deleteHint: '@',
			deleteButtonLabel: '@',
			separatorKeys: '=?mdSeparatorKeys',
			requireMatch: '=?mdRequireMatch'
		}
	};
}

function MdChipsCtrl($scope, $attrs, $mdConstant, $log, $element, $timeout, $mdUtil) {
	"use strict";

    this.$timeout = $timeout;
    this.$mdConstant = $mdConstant;
    this.$scope = $scope;
    this.parent = $scope.$parent;
    this.$log = $log;
    this.$element = $element;
    this.ngModelCtrl = null;
    this.userInputNgModelCtrl = null;
    this.autocompleteCtrl = null;
    this.userInputElement = null;
    this.items = [];
    this.selectedChip = -1;
    this.enableChipEdit = $mdUtil.parseAttributeBoolean($attrs.mdEnableChipEdit);
    this.addOnBlur = $mdUtil.parseAttributeBoolean($attrs.mdAddOnBlur);
    this.deleteHint = 'Press delete to remove this chip.';
    this.deleteButtonLabel = 'Remove';
    this.chipBuffer = '';
    this.useTransformChip = false;
    this.useOnAdd = false;
    this.useOnRemove = false;
}

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
        this.ngModelCtrl.$setDirty();
    }
};


/**
 * Returns true if a chip is currently being edited. False otherwise.
 * @return {boolean}
 */
MdChipsCtrl.prototype.isEditingChip = function () {
	"use strict";

    return !!this.$element[0].getElementsByClassName('_md-chip-editing').length;
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
            this.removeAndSelectAdjacentChip(this.selectedChip);
            break;
        case this.$mdConstant.KEY_CODE.LEFT_ARROW:
            event.preventDefault();
            if (this.selectedChip < 0)	{ this.selectedChip = this.items.length; }
            if (this.items.length)		{ this.selectAndFocusChipSafe(this.selectedChip - 1); }
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

MdChipsCtrl.prototype.removeAndSelectAdjacentChip = function (index) {
	"use strict";

    var selIndex = this.getAdjacentChipIndex(index);

    this.removeChip(index);
    this.$timeout(angular.bind(this, function () {
        this.selectAndFocusChipSafe(selIndex);
    }));
};

MdChipsCtrl.prototype.resetSelectedChip = function () {
	"use strict";

    this.selectedChip = -1;
};

MdChipsCtrl.prototype.getAdjacentChipIndex = function (index) {
	"use strict";

    var len = this.items.length - 1;

    return (len === 0) ? -1 : (index === len) ? index - 1 : index;
};

MdChipsCtrl.prototype.appendChip = function (newChip) {
	"use strict";

	var transformedChip,
		index,
		identical;

    if (this.useTransformChip && this.transformChip) {
        transformedChip = this.transformChip({
            '$chip': newChip
        });

        if (angular.isDefined(transformedChip)) {
            newChip = transformedChip;
        }
    }

    // If items contains an identical object to newChip, do not append
    if (angular.isObject(newChip)) {
        identical = this.items.some(function (item) {
            return angular.equals(newChip, item);
        });
        if (identical) { return; }
    }

    // Check for a null (but not undefined), or existing chip and cancel appending
    if (newChip == null || this.items.indexOf(newChip) + 1) { return; }		// Leave as is (undefined and null)

    // Append the new chip onto our list
    index = this.items.push(newChip);

    // Update model validation
    this.ngModelCtrl.$setDirty();
    this.validateModel();

    // If they provide the md-on-add attribute, notify them of the chip addition
    if (this.useOnAdd && this.onAdd) {
        this.onAdd({
            '$chip': newChip,
            '$index': index
        });
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

    return !this.userInputElement ? this.chipBuffer : this.userInputNgModelCtrl ? this.userInputNgModelCtrl.$viewValue : this.userInputElement[0].value;
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
};

MdChipsCtrl.prototype.removeChip = function (index) {
	"use strict";

    var removed = this.items.splice(index, 1);

    // Update model validation
    this.ngModelCtrl.$setDirty();
    this.validateModel();

    if (removed && removed.length && this.useOnRemove && this.onRemove) {
        this.onRemove({
            '$chip': removed[0],
            '$index': index
        });
    }
};

MdChipsCtrl.prototype.removeChipAndFocusInput = function (index) {
	"use strict";

    this.removeChip(index);

    if (this.autocompleteCtrl) {
        this.autocompleteCtrl.hidden = true;
        this.$mdUtil.nextTick(this.onFocus.bind(this));
    } else {
        this.onFocus();
    }

};

MdChipsCtrl.prototype.selectAndFocusChipSafe = function (index) {
	"use strict";

    if (!this.items.length) {
        this.selectChip(-1);
        this.onFocus();
        return undefined; 
    }

    if (index === this.items.length) { return this.onFocus(); }

    index = Math.max(index, 0);
    index = Math.min(index, this.items.length - 1);
    this.selectChip(index);
    this.focusChip(index);

	return undefined;
};

MdChipsCtrl.prototype.selectChip = function (index) {
	"use strict";

    if (index >= -1 && index <= this.items.length) {
        this.selectedChip = index;

        // Fire the onSelect if provided
        if (this.useOnSelect && this.onSelect) {
            this.onSelect({
                '$chip': this.items[this.selectedChip]
            });
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

    this.$element[0].querySelector('md-chip[index="' + index + '"] .md-chip-content').focus();
};

MdChipsCtrl.prototype.configureNgModel = function (ngModelCtrl) {
	"use strict";

    this.ngModelCtrl = ngModelCtrl;

    var self = this;

    ngModelCtrl.$render = function () {
        // model is updated. do something.
        self.items = self.ngModelCtrl.$viewValue;
    };
};

MdChipsCtrl.prototype.onFocus = function () {
	"use strict";

    var input = this.$element[0].querySelector('input');

	if (input) { input.focus(); }

    this.resetSelectedChip();
};

MdChipsCtrl.prototype.onInputFocus = function () {
	"use strict";

    this.inputHasFocus = true;
    this.resetSelectedChip();
};

MdChipsCtrl.prototype.onInputBlur = function () {
	"use strict";

    this.inputHasFocus = false;

    var chipBuffer = this.getChipBuffer().trim(),
		isModelValid;

    // Update the custom chip validators.
    this.validateModel();

    isModelValid = this.ngModelCtrl.$valid;

    if (this.userInputNgModelCtrl) {
        isModelValid &= this.userInputNgModelCtrl.$valid;
    }

    // Only append the chip and reset the chip buffer if the chips and input ngModel is valid.
    if (this.addOnBlur && chipBuffer && isModelValid) {
        this.appendChip(chipBuffer);
        this.resetChipBuffer();
    }
};

MdChipsCtrl.prototype.configureUserInput = function (inputElement) {
	"use strict";

    this.userInputElement = inputElement;

    var ngModelCtrl = inputElement.controller('ngModel'),
		scope,
		ctrl,
		scopeApplyFn;

    // `.controller` will look in the parent as well.
    if (ngModelCtrl != this.ngModelCtrl) {		// Leave as is for now (undefined and null)
        this.userInputNgModelCtrl = ngModelCtrl;
    }

    scope = this.$scope;
    ctrl = this;

    scopeApplyFn = function (event, fn) {
        scope.$evalAsync(angular.bind(ctrl, fn, event));
    };

    // Bind to keydown and focus events of input
    inputElement
        .attr({
            tabindex: 0
        })
        .on('keydown', function (event) {
            scopeApplyFn(event, ctrl.inputKeydown);
        })
        .on('focus', function (event) {
            scopeApplyFn(event, ctrl.onInputFocus);
        })
        .on('blur', function (event) {
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

MdChipsCtrl.prototype.hasFocus = function () {
	"use strict";

    return this.inputHasFocus || this.selectedChip >= 0;
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
			function () {
				element.attr({ tabindex: -1, 'aria-hidden': true });
				element.find('button').attr('tabindex', '-1');
			}
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
    'ng.material.v111.ui.chips',
	[
        'ng',
		'ng.material.v111.core',
		'ng.material.v111.core.theming'
    ]
).controller(
	'MdChipCtrl',
	["$scope", "$element", "$mdConstant", "$timeout", "$mdUtil", MdChipCtrl]
).controller(
	'MdChipsCtrl',
	["$scope", "$attrs", "$mdConstant", "$log", "$element", "$timeout", "$mdUtil", MdChipsCtrl]
).controller(
	'MdContactChipsCtrl',
	MdContactChipsCtrl
).directive(
	'mdChip',
	["$mdTheming", "$mdUtil", MdChip]
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
);
