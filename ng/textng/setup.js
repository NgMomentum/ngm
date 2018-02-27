
/*global
    msos: false,
    ng: false,
    angular: false
*/

msos.provide("ng.textng.setup");

ng.textng.setup.version = new msos.set_version(18, 1, 11);


ng.textng.setup.tools = {};

ng.textng.setup.tools.selectable_elements = ['a', 'img'];

ng.textng.setup.options = {

	disableSanitizer: false,
	keepStyles: true,
	keyMappings: [],
	toolbar: [
		['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
		['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
		['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'indent', 'outdent'],
		['html', 'insertImage', 'insertLink', 'insertVideo', 'wordcount', 'charcount']
	],
	classes: {
		focussed: "focussed",
		toolbar: "btn-toolbar",
		toolbarGroup: "btn-group",
		toolbarButton: "btn btn-default",
		toolbarButtonActive: "active",
		disabled: "disabled",
		textEditor: 'form-control',
		htmlEditor: 'form-control'
	},
	defaultTagAttributes: {
		a: {
			target: ""
		}
	},
	setup: {
		// wysiwyg mode
		textEditorSetup: function () {
			"use strict";
			/* Do some processing here with $element as input */
		},
		// raw html
		htmlEditorSetup: function () {
			"use strict";
			/* Do some processing here with $element as input */
		}
	},
	defaultFileDropHandler: function (file, insertAction) {
		"use strict";
		/* istanbul ignore next: untestable image processing */
		var reader = new FileReader();

		if (file.type.substring(0, 5) === 'image') {
			reader.onload = function () {
				if (reader.result !== '') { insertAction('insertImage', reader.result, true); }
			};

			reader.readAsDataURL(file);
			// NOTE: For async procedures return a promise and resolve it when the editor should update the model.
			return true;
		}
		return false;
	}
};

ng.textng.setup.renderers = [{
	selector: 'img',
	customAttribute: 'ta-insert-video',
	renderLogic: function (element) {
		"use strict";

		var iframe = angular.element('<iframe></iframe>'),
			attributes = element.prop("attributes");

		// loop through element attributes and apply them on iframe
		angular.forEach(
			attributes,
			function (attr) {
				iframe.attr(attr.name, attr.value);
			}
		);

		iframe.attr('src', iframe.attr('ta-insert-video'));
		element.replaceWith(iframe);
	}
}];

ng.textng.setup.translations = {
	html: {
		tooltip: 'Toggle html / Rich Text'
	},
	heading: {
		tooltip: 'Heading '
	},
	p: {
		tooltip: 'Paragraph'
	},
	pre: {
		tooltip: 'Preformatted text'
	},
	ul: {
		tooltip: 'Unordered List'
	},
	ol: {
		tooltip: 'Ordered List'
	},
	quote: {
		tooltip: 'Quote/unquote selection or paragraph'
	},
	undo: {
		tooltip: 'Undo'
	},
	redo: {
		tooltip: 'Redo'
	},
	bold: {
		tooltip: 'Bold'
	},
	italic: {
		tooltip: 'Italic'
	},
	underline: {
		tooltip: 'Underline'
	},
	strikeThrough: {
		tooltip: 'Strikethrough'
	},
	justifyLeft: {
		tooltip: 'Align text left'
	},
	justifyRight: {
		tooltip: 'Align text right'
	},
	justifyFull: {
		tooltip: 'Justify text'
	},
	justifyCenter: {
		tooltip: 'Center'
	},
	indent: {
		tooltip: 'Increase indent'
	},
	outdent: {
		tooltip: 'Decrease indent'
	},
	clear: {
		tooltip: 'Clear formatting'
	},
	insertImage: {
		dialogPrompt: 'Please enter an image URL to insert',
		tooltip: 'Insert image',
		hotkey: 'the - possibly language dependent hotkey ... for some future implementation'
	},
	insertVideo: {
		tooltip: 'Insert video',
		dialogPrompt: 'Please enter a youtube URL to embed'
	},
	insertLink: {
		tooltip: 'Insert / edit link',
		dialogPrompt: "Please enter a URL to insert"
	},
	editLink: {
		reLinkButton: {
			tooltip: "Relink"
		},
		unLinkButton: {
			tooltip: "Unlink"
		},
		targetToggle: {
			buttontext: "Open in New Window"
		}
	},
	wordcount: {
		tooltip: 'Display words Count'
	},
	charcount: {
		tooltip: 'Display characters Count'
	}
};

ng.textng.setup.tool_functions =  {
	imgOnSelectAction: function (event, $element, editorScope) {
		"use strict";

		// setup the editor toolbar
		// Credit to the work at http://hackerwins.github.io/summernote/ for this editbar logic/display
		var finishEdit = function () {
				editorScope.updateTaBindtaTextElement();
				editorScope.hidePopover();
			},
			container,
			buttonGroup,
			fullButton,
			halfButton,
			quartButton,
			resetButton,
			floatLeft,
			floatRight,
			floatNone,
			remove;

		event.preventDefault();
		editorScope.displayElements.popover.css('width', '375px');

		container = editorScope.displayElements.popoverContainer;
		container.empty();

		buttonGroup = angular.element('<div class="btn-group" style="padding-right: 6px;">');

		fullButton = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1">100% </button>');
		fullButton.on('click', function (event) {
			event.preventDefault();
			$element.css({
				'width': '100%',
				'height': ''
			});
			finishEdit();
		});

		halfButton = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1">50% </button>');
		halfButton.on('click', function (event) {
			event.preventDefault();
			$element.css({
				'width': '50%',
				'height': ''
			});
			finishEdit();
		});

		quartButton = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1">25% </button>');
		quartButton.on('click', function (event) {
			event.preventDefault();
			$element.css({
				'width': '25%',
				'height': ''
			});
			finishEdit();
		});

		resetButton = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1">Reset</button>');
		resetButton.on('click', function (event) {
			event.preventDefault();
			$element.css({
				width: '',
				height: ''
			});
			finishEdit();
		});

		buttonGroup.append(fullButton);
		buttonGroup.append(halfButton);
		buttonGroup.append(quartButton);
		buttonGroup.append(resetButton);
		container.append(buttonGroup);

		buttonGroup = angular.element('<div class="btn-group" style="padding-right: 6px;">');

		floatLeft = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1"><i class="fa fa-align-left"></i></button>');
		floatLeft.on('click', function (event) {
			event.preventDefault();
			// webkit
			$element.css('float', 'left');
			// firefox
			$element.css('cssFloat', 'left');
			finishEdit();
		});

		floatRight = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1"><i class="fa fa-align-right"></i></button>');
		floatRight.on('click', function (event) {
			event.preventDefault();
			// webkit
			$element.css('float', 'right');
			// firefox
			$element.css('cssFloat', 'right');
			finishEdit();
		});

		floatNone = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1"><i class="fa fa-align-justify"></i></button>');
		floatNone.on('click', function (event) {
			event.preventDefault();
			// webkit
			$element.css('float', '');
			// firefox
			$element.css('cssFloat', '');
			finishEdit();
		});

		buttonGroup.append(floatLeft);
		buttonGroup.append(floatNone);
		buttonGroup.append(floatRight);
		container.append(buttonGroup);

		buttonGroup = angular.element('<div class="btn-group">');

		remove = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1"><i class="fa fa-trash-o"></i></button>');
		remove.on('click', function (event) {
			event.preventDefault();
			$element.remove();
			finishEdit();
		});

		buttonGroup.append(remove);
		container.append(buttonGroup);

		editorScope.showPopover($element);
		editorScope.showResizeOverlay($element);
	},
	aOnSelectAction: function (event, $element, editorScope) {
		"use strict";

		var container,
			link,
			buttonGroup,
			reLinkButton,
			unLinkButton,
			targetToggle;
			
		// setup the editor toolbar
		// Credit to the work at http://hackerwins.github.io/summernote/ for this editbar logic
		event.preventDefault();
		editorScope.displayElements.popover.css('width', '436px');

		container = editorScope.displayElements.popoverContainer;
		container.empty();
		container.css('line-height', '28px');

		link = angular.element('<a href="' + $element.attr('href') + '" target="_blank">' + $element.attr('href') + '</a>');
		link.css({
			'display': 'inline-block',
			'max-width': '200px',
			'overflow': 'hidden',
			'text-overflow': 'ellipsis',
			'white-space': 'nowrap',
			'vertical-align': 'middle'
		});

		container.append(link);

		buttonGroup = angular.element('<div class="btn-group pull-right">');

		reLinkButton = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" tabindex="-1" unselectable="on" title="' + ng.textng.setup.translations.editLink.reLinkButton.tooltip + '"><i class="fa fa-edit icon-edit"></i></button>');
		reLinkButton.on('click', function (event) {
			event.preventDefault();
			var urlLink = prompt(ng.textng.setup.translations.insertLink.dialogPrompt, $element.attr('href'));
			if (urlLink && urlLink !== '' && urlLink !== 'http://') {
				$element.attr('href', urlLink);
				editorScope.updateTaBindtaTextElement();
			}
			editorScope.hidePopover();
		});

		buttonGroup.append(reLinkButton);

		unLinkButton = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" tabindex="-1" unselectable="on" title="' + ng.textng.setup.translations.editLink.unLinkButton.tooltip + '"><i class="fa fa-unlink icon-unlink"></i></button>');
		// directly before this click event is fired a digest is fired off whereby the reference to $element is orphaned off
		unLinkButton.on('click', function (event) {
			event.preventDefault();
			$element.replaceWith($element.contents());
			editorScope.updateTaBindtaTextElement();
			editorScope.hidePopover();
		});

		buttonGroup.append(unLinkButton);

		targetToggle = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" tabindex="-1" unselectable="on">' + ng.textng.setup.translations.editLink.targetToggle.buttontext + '</button>');

		if ($element.attr('target') === '_blank') {
			targetToggle.addClass('active');
		}

		targetToggle.on('click', function (event) {
			event.preventDefault();
			$element.attr('target', ($element.attr('target') === '_blank') ? '' : '_blank');
			targetToggle.toggleClass('active');
			editorScope.updateTaBindtaTextElement();
		});

		buttonGroup.append(targetToggle);
		container.append(buttonGroup);
		editorScope.showPopover($element);
	},
	extractYoutubeVideoId: function (url) {
		"use strict";

		var re = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
			match = url.match(re);

		return (match && match[1]) || null;
	}
};
