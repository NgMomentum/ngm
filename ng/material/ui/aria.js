
/**
 * @ngdoc module
 * @name material.core.aria
 * @description
 * Aria Expectations for ngMaterial components.
 */

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.aria");

ng.material.ui.aria.version = new msos.set_version(18, 7, 19);


function MdAriaService($$rAF, $log, $window, $interpolate) {
	"use strict";

	var showWarnings = this.showWarnings;

	function expect(element, attrName, defaultValue) {

		var node = angular.element(element)[0] || element;

		// if node exists and neither it nor its children have the attribute
		if (node && ((!node.hasAttribute(attrName) || node.getAttribute(attrName).length === 0) && !childHasAttribute(node, attrName))) {

			defaultValue = angular.isString(defaultValue) ? defaultValue.trim() : '';

			if (defaultValue.length) {
				element.attr(attrName, defaultValue);
			} else if (showWarnings) {
				$log.warn('ARIA: Attribute "', attrName, '", required for accessibility, is missing on node:', node);
			}
		}
	}

	function expectAsync(element, attrName, defaultValueGetter) {

		$$rAF(
			function () {
				expect(element, attrName, defaultValueGetter());
			}
		);
	}

	function expectWithText(element, attrName) {
		var content = getText(element) || "",
			hasBinding = content.indexOf($interpolate.startSymbol()) > -1;

		if (hasBinding) {
			expectAsync(
				element,
				attrName,
				function () {
					return getText(element);
				}
			);
		} else {
			expect(element, attrName, content);
		}
	}

	function expectWithoutText(element, attrName) {
		var content = getText(element),
			hasBinding = content.indexOf($interpolate.startSymbol()) > -1;

		if (!hasBinding && !content) {
			expect(element, attrName, content);
		}
	}

	function getText(element) {

		element = element[0] || element;

		var walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false),
			text = '',
			node;

		function isAriaHiddenNode(node) {
			while (node.parentNode && (node = node.parentNode) !== element) {
				if (node.getAttribute && node.getAttribute('aria-hidden') === 'true') {
					return true;
				}
			}
		}

		node = walker.nextNode();

		while (node) {
			if (!isAriaHiddenNode(node)) {
				text += node.textContent;
			}
			node = walker.nextNode();
		}

		return text.trim() || '';
	}

	function childHasAttribute(node, attrName) {
		var hasChildren = node.hasChildNodes(),
			hasAttr = false,
			children,
			child,
			i = 0;

		function isHidden(el) {
			var style = el.currentStyle ? el.currentStyle : $window.getComputedStyle(el);

			return (style.display === 'none');
		}

		if (hasChildren) {
			children = node.childNodes;

			for (i = 0; i < children.length; i += 1) {
				child = children[i];

				if (child.nodeType === 1 && child.hasAttribute(attrName)) {
					if (!isHidden(child)) {
						hasAttr = true;
					}
				}
			}
		}

		return hasAttr;
	}

	function hasAriaLabel(element) {
		var node = angular.element(element)[0] || element;

		if (!node.hasAttribute) { return false; }

		return node.hasAttribute('aria-label') || node.hasAttribute('aria-labelledby') || node.hasAttribute('aria-describedby');
	}

	function parentHasAriaLabel(element, level) {

		level = level || 1;

		function performCheck(parentNode) {

			if (!hasAriaLabel(parentNode)) { return false; }

			/* Perform role blacklist check */
			if (parentNode.hasAttribute('role')) {
				switch(parentNode.getAttribute('role').toLowerCase()) {
					case 'command':
					case 'definition':
					case 'directory':
					case 'grid':
					case 'list':
					case 'listitem':
					case 'log':
					case 'marquee':
					case 'menu':
					case 'menubar':
					case 'note':
					case 'presentation':
					case 'separator':
					case 'scrollbar':
					case 'status':
					case 'tablist':
						return false;
				}
			}

			/* Perform tagName blacklist check */
			switch(parentNode.tagName.toLowerCase()) {
				case 'abbr':
				case 'acronym':
				case 'address':
				case 'applet':
				case 'audio':
				case 'b':
				case 'bdi':
				case 'bdo':
				case 'big':
				case 'blockquote':
				case 'br':
				case 'canvas':
				case 'caption':
				case 'center':
				case 'cite':
				case 'code':
				case 'col':
				case 'data':
				case 'dd':
				case 'del':
				case 'dfn':
				case 'dir':
				case 'div':
				case 'dl':
				case 'em':
				case 'embed':
				case 'fieldset':
				case 'figcaption':
				case 'font':
				case 'h1':
				case 'h2':
				case 'h3':
				case 'h4':
				case 'h5':
				case 'h6':
				case 'hgroup':
				case 'html':
				case 'i':
				case 'ins':
				case 'isindex':
				case 'kbd':
				case 'keygen':
				case 'label':
				case 'legend':
				case 'li':
				case 'map':
				case 'mark':
				case 'menu':
				case 'object':
				case 'ol':
				case 'output':
				case 'pre':
				case 'presentation':
				case 'q':
				case 'rt':
				case 'ruby':
				case 'samp':
				case 'small':
				case 'source':
				case 'span':
				case 'status':
				case 'strike':
				case 'strong':
				case 'sub':
				case 'sup':
				case 'svg':
				case 'tbody':
				case 'td':
				case 'th':
				case 'thead':
				case 'time':
				case 'tr':
				case 'track':
				case 'tt':
				case 'ul':
				case 'var':
					return false;
			}

			return true;
		}

		var node = angular.element(element)[0] || element;

		if (!node.parentNode) { return false; }
		if (performCheck(node.parentNode)) { return true; }

		level -= 1;

		if (level) {
			return parentHasAriaLabel(node.parentNode, level);
		}

		return false;
	}

	return {
		expect: expect,
		expectAsync: expectAsync,
		expectWithText: expectWithText,
		expectWithoutText: expectWithoutText,
		getText: getText,
		hasAriaLabel: hasAriaLabel,
		parentHasAriaLabel: parentHasAriaLabel
	};
}

function MdAriaProvider() {
	"use strict";

	var config = {
		showWarnings: true
	};

	function disableWarnings() { config.showWarnings = false; }

	return {
		disableWarnings: disableWarnings,
		$get: ["$$rAF", "$log", "$window", "$interpolate", function ($$rAF, $log, $window, $interpolate) {
			var input_arry = [$$rAF, $log, $window, $interpolate];

			return MdAriaService.apply(config, input_arry);
		}]
	};
}


angular.module(
    'ng.material.ui.aria',
    ['ng']
).provider(
    '$mdAria',
    MdAriaProvider
);
