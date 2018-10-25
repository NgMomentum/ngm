/*
@license textAngular
Author : Austin Anderson
License : 2013 MIT
Version 1.5.16

See README.md or https://github.com/fraywing/textAngular/wiki for requirements and use.
*/

/*global
    msos: false,
    ng: false,
    angular: false,
    rangy: false
*/

msos.provide("ng.textng.core");
msos.require("ng.textng.setup");	// Duplicate, but emphasizes this is required (better if called out in app file)
msos.require("rangy.core");
msos.require("rangy.selectionsaverestore");

ng.textng.core.version = new msos.set_version(18, 1, 11);
ng.textng.core.ta_version = 'v1.5.16';

// Start by loading our ngTextEditor specific.css stylesheet
ng.textng.core.css = new msos.loader();
ng.textng.core.css.load(msos.resource_url('ng', 'textng/css/specific.css'));


ng.textng.core.ta_tag = function (tag) {
	"use strict";

	if (!tag)	{ return 'p'; }
	return tag;
};

ng.textng.core.dropFired = false;

ng.textng.core.stylesheet = (
	function () {
		"use strict";

		// Create the <style> tag
		var style_elm = document.createElement("style");

		// AppleWebKit may (still) need this text node
		style_elm.appendChild(document.createTextNode(""));
		style_elm.setAttribute('id', 'ng_textng_internal_styles');

		document.getElementsByTagName('head')[0].appendChild(style_elm);

		return style_elm.sheet;
	}()
);

ng.textng.core.add_css_rule = function (selector, ad_rules) {
	"use strict";

	var insertIndex,
		insertedRule,
		ad_sheet = ng.textng.core.stylesheet;

	if		(ad_sheet.cssRules)	{ insertIndex = Math.max(ad_sheet.cssRules.length - 1, 0); }
	else if	(ad_sheet.rules)	{ insertIndex = Math.max(ad_sheet.rules.length - 1, 0); }

	if (ad_sheet.insertRule) {
		ad_sheet.insertRule(selector + "{" + ad_rules + "}", insertIndex);
	} else {
		ad_sheet.addRule(selector, ad_rules, insertIndex);
	}

	if		(ad_sheet.rules)	{ insertedRule = ad_sheet.rules[insertIndex]; }
	else if	(ad_sheet.cssRules)	{ insertedRule = ad_sheet.cssRules[insertIndex]; }

	return insertedRule;
};

ng.textng.core.remove_css_rule = function (rm_rule) {
	"use strict";

	var rm_sheet = ng.textng.core.stylesheet,
		rules = rm_sheet.cssRules || rm_sheet.rules,
		ruleIndex;

	function _getRuleIndex(gt_rule, gt_rules) {
		var i,
			gt_ruleIndex;

		for (i = 0; i < gt_rules.length; i += 1) {
			if (gt_rules[i].cssText === gt_rule.cssText) {
				gt_ruleIndex = i;
				break;
			}
		}

		return gt_ruleIndex;
	}

	if (!rules || rules.length === 0) { return; }

	ruleIndex = _getRuleIndex(rm_rule, rules);

	if (rm_sheet.removeRule)	{ rm_sheet.removeRule(ruleIndex); }
	else						{ rm_sheet.deleteRule(ruleIndex); }
};

var textAngular = angular.module(
	"textAngular",
	[
		'ng.sanitize',
		'textAngular.factories',
		'textAngular.DOM',
		'textAngular.validators',
		'textAngular.taBind'
	]
).service(
	'taSelection',
	['$document', 'taDOM', function ($document, taDOM) {
		"use strict";

		msos.console.debug('ng.textng.core - taSelection -> called.');

		// need to dereference the document else the calls don't work correctly
		var _document = $document[0],
			bShiftState,
			brException = function (element, offset) {
				if (element.tagName && element.tagName.match(/^br$/i) && offset === 0 && !element.previousSibling) {
					return {
						element: element.parentNode,
						offset: 0
					};
				}

				return {
					element: element,
					offset: offset
				};
			},
			api = {
				getSelection: function () {
					var range = rangy.core.getSelection().getRangeAt(0),
						container = range.commonAncestorContainer,
						selection = {
							start: brException(range.startContainer, range.startOffset),
							end: brException(range.endContainer, range.endOffset),
							collapsed: range.collapsed
						};

					// Check if the container is a text node and return its parent if so
					container = container.nodeType === 3 ? container.parentNode : container;
	
					if (container.parentNode === selection.start.element || container.parentNode === selection.end.element) {
						selection.container = container.parentNode;
					} else {
						selection.container = container;
					}

					return selection;
				},
				getOnlySelectedElements: function () {
					var range = rangy.core.getSelection().getRangeAt(0),
						container = range.commonAncestorContainer;

					// Check if the container is a text node and return its parent if so
					container = container.nodeType === 3 ? container.parentNode : container;

					return range.getNodes(
						[1],
						function (node) {
							return node.parentNode === container;
						}
					);
				},
				// Some basic selection functions
				getSelectionElement: function () {
					return api.getSelection().container;
				},
				setSelection: function (el, start, end) {
					var range = rangy.core.createRange();
			
					range.setStart(el, start);
					range.setEnd(el, end);
			
					rangy.core.getSelection().setSingleRange(range);
				},
				setSelectionBeforeElement: function (el) {
					var range = rangy.core.createRange();
			
					range.selectNode(el);
					range.collapse(true);
			
					rangy.core.getSelection().setSingleRange(range);
				},
				setSelectionAfterElement: function (el) {
					var range = rangy.core.createRange();
			
					range.selectNode(el);
					range.collapse(false);
			
					rangy.core.getSelection().setSingleRange(range);
				},
				setSelectionToElementStart: function (el) {
					var range = rangy.core.createRange();
			
					range.selectNodeContents(el);
					range.collapse(true);
			
					rangy.core.getSelection().setSingleRange(range);
				},
				setSelectionToElementEnd: function (el) {
					var range = rangy.core.createRange();
			
					range.selectNodeContents(el);
					range.collapse(false);

					if (el.childNodes && el.childNodes[el.childNodes.length - 1] && el.childNodes[el.childNodes.length - 1].nodeName === 'br') {
						range.startOffset = range.endOffset = range.startOffset - 1;
					}
					rangy.core.getSelection().setSingleRange(range);
				},
				setStateShiftKey: function (bS) {
					bShiftState = bS;
				},
				getStateShiftKey: function () {
					return bShiftState;
				},
				insertHtml: function (html, topNode) {
					var parent,
						secondParent,
						_childI,
						_n = 0,
						nodes,
						i,
						lastNode,
						_lastSecondParent,
						_tempFrag,
						element = angular.element("<div>" + html + "</div>"),
						range = rangy.core.getSelection().getRangeAt(0),
						frag = _document.createDocumentFragment(),
						children = element[0].childNodes,
						isInline = true;
			
					if (children.length > 0) {
						// NOTE!! We need to do the following:
						// check for blockelements - if they exist then we have to split the current element in half (and all others up to the closest block element) and insert all children in-between.
						// If there are no block elements, or there is a mixture we need to create textNodes for the non wrapped text (we don't want them spans messing up the picture).
						nodes = [];
						for (_childI = 0; _childI < children.length; _childI += 1) {
							if (!(
								(children[_childI].nodeName.toLowerCase() === 'p' && children[_childI].innerHTML.trim() === '') || // empty p element
								(children[_childI].nodeType === 3 && children[_childI].nodeValue.trim() === '') // empty text node
							)) {
								isInline = isInline && !angular.blockElements[children[_childI].nodeName.toLowerCase()];
								nodes.push(children[_childI]);
							}
						}

						for (_n = 0; _n < nodes.length; _n += 1) { lastNode = frag.appendChild(nodes[_n]); }

						if (!isInline && range.collapsed && /^(|<br(|\/)>)$/i.test(range.startContainer.innerHTML)) {
							range.selectNode(range.startContainer);
						}
					} else {
						isInline = true;
						// paste text of some sort
						lastNode = frag = _document.createTextNode(html);
					}

					// Other Edge case - selected data spans multiple blocks.
					if (isInline) {
						range.deleteContents();
					} else { // not inline insert
						if (range.collapsed && range.startContainer !== topNode) {
							if (range.startContainer.innerHTML && range.startContainer.innerHTML.match(/^<[^>]*>$/i)) {
								// this log is to catch when innerHTML is something like `<img ...>`
								parent = range.startContainer;

								if (range.startOffset === 1) {
									// before single tag
									range.setStartAfter(parent);
									range.setEndAfter(parent);
								} else {
									// after single tag
									range.setStartBefore(parent);
									range.setEndBefore(parent);
								}
							} else {
								// split element into 2 and insert block element in middle
								if (range.startContainer.nodeType === 3 && range.startContainer.parentNode !== topNode) { // if text node
									parent = range.startContainer.parentNode;
									secondParent = parent.cloneNode();
									// split the nodes into two lists - before and after, splitting the node with the selection into 2 text nodes.
									taDOM.splitNodes(parent.childNodes, parent, secondParent, range.startContainer, range.startOffset);
							
									// Escape out of the inline tags like b
									while(!angular.validElements[parent.nodeName.toLowerCase()]) {
										angular.element(parent).after(secondParent);

										parent = parent.parentNode;
										_lastSecondParent = secondParent;
										secondParent = parent.cloneNode();
										// split the nodes into two lists - before and after, splitting the node with the selection into 2 text nodes.
										taDOM.splitNodes(parent.childNodes, parent, secondParent, _lastSecondParent);
									}

								} else {
									parent = range.startContainer;
									secondParent = parent.cloneNode();
									taDOM.splitNodes(parent.childNodes, parent, secondParent, undefined, undefined, range.startOffset);
								}
						
								angular.element(parent).after(secondParent);
								// put cursor to end of inserted content
								range.setStartAfter(parent);
								range.setEndAfter(parent);

								if (/^(|<br(|\/)>)$/i.test(parent.innerHTML.trim())) {
									range.setStartBefore(parent);
									range.setEndBefore(parent);
									angular.element(parent).remove();
								}

								if (/^(|<br(|\/)>)$/i.test(secondParent.innerHTML.trim())) { angular.element(secondParent).remove(); }

								if (parent.nodeName.toLowerCase() === 'li') {
									_tempFrag = _document.createDocumentFragment();

									for (i = 0; i < frag.childNodes.length; i += 1) {
										element = angular.element('<li>');
										taDOM.transferChildNodes(frag.childNodes[i], element[0]);
										taDOM.transferNodeAttributes(frag.childNodes[i], element[0]);
										_tempFrag.appendChild(element[0]);
									}

									frag = _tempFrag;

									if (lastNode) {
										lastNode = frag.childNodes[frag.childNodes.length - 1];
										lastNode = lastNode.childNodes[lastNode.childNodes.length - 1];
									}
								}
							}
						} else {
							range.deleteContents();
						}
					}
			
					range.insertNode(frag);

					if (lastNode) {
						api.setSelectionToElementEnd(lastNode);
					}
				}
			};

		return api;
	}]
).constant(
    'taRegisterTool',
	function (name, toolDefinition) {
		"use strict";

		function validElementString(string) {
			try {
				return angular.element(string).length !== 0;
			} catch (any) {
				return false;
			}
		}

		if (!name || name === '') {
			throw('textAngular Error: no tool name submitted.');
		}

		if (ng.textng.setup.tools.hasOwnProperty(name)) {
			msos.console.warn('textAngular Error: A unique name is required for a Tool Definition');
		} else {
			if (
				(toolDefinition.display && (toolDefinition.display === '' || !validElementString(toolDefinition.display))) ||
				(!toolDefinition.display && !toolDefinition.buttontext && !toolDefinition.iconclass)
			) {
				throw('textAngular Error: Tool Definition for "' + name + '" does not have a valid display/iconclass/buttontext value');
			}

			ng.textng.setup.tools[name] = toolDefinition;
		}
	}
).run(
	[
        'taRegisterTool', 'taSelection',
        function app_ngText_run(taRegisterTool, taSelection) {
			"use strict";

            var temp_rn = 'ng.textng.core - run -> ',
				taTranslations = ng.textng.setup.translations,
				_retActiveStateFunction = function (q) {
                    return function () { return this.$editor().queryFormatBlockState(q); };
                },
                headerAction = function () {
                    return this.$editor().wrapSelection("formatBlock", "<" + this.name.toUpperCase() +">");
                },
                blockJavascript = function (link) {
                    if (link.toLowerCase().indexOf('javascript')!==-1) {
                        return true;
                    }
                    return false;
                };

			msos.console.debug(temp_rn + 'start.', taRegisterTool, taSelection);

            taRegisterTool("html", {
                iconclass: 'fa fa-code',
                tooltiptext: taTranslations.html.tooltip,
                action: function () {
                    this.$editor().switchView();
                },
                activeState: function () {
                    return this.$editor().showHtml;
                }
            });

            angular.forEach(['h1','h2','h3','h4','h5','h6'], function (h) {
                taRegisterTool(h.toLowerCase(), {
                    buttontext: h.toUpperCase(),
                    tooltiptext: taTranslations.heading.tooltip + h.charAt(1),
                    action: headerAction,
                    activeState: _retActiveStateFunction(h.toLowerCase())
                });
            });

            taRegisterTool('p', {
                buttontext: 'P',
                tooltiptext: taTranslations.p.tooltip,
                action: function () {
                    return this.$editor().wrapSelection("formatBlock", "<P>");
                },
                activeState: function () { return this.$editor().queryFormatBlockState('p'); }
            });

            // key: pre -> taTranslations[key].tooltip, taTranslations[key].buttontext
            taRegisterTool('pre', {
                buttontext: 'pre',
                tooltiptext: taTranslations.pre.tooltip,
                action: function () {
                    return this.$editor().wrapSelection("formatBlock", "<PRE>");
                },
                activeState: function () { return this.$editor().queryFormatBlockState('pre'); }
            });

            taRegisterTool('ul', {
                iconclass: 'fa fa-list-ul',
                tooltiptext: taTranslations.ul.tooltip,
                action: function () {
                    return this.$editor().wrapSelection("insertUnorderedList", null);
                },
                activeState: function () { return this.$editor().queryCommandState('insertUnorderedList'); }
            });

            taRegisterTool('ol', {
                iconclass: 'fa fa-list-ol',
                tooltiptext: taTranslations.ol.tooltip,
                action: function () {
                    return this.$editor().wrapSelection("insertOrderedList", null);
                },
                activeState: function () { return this.$editor().queryCommandState('insertOrderedList'); }
            });

            taRegisterTool('quote', {
                iconclass: 'fa fa-quote-right',
                tooltiptext: taTranslations.quote.tooltip,
                action: function () {
                    return this.$editor().wrapSelection("formatBlock", "<BLOCKQUOTE>");
                },
                activeState: function () { return this.$editor().queryFormatBlockState('blockquote'); }
            });

            taRegisterTool('undo', {
                iconclass: 'fa fa-undo',
                tooltiptext: taTranslations.undo.tooltip,
                action: function () {
                    return this.$editor().wrapSelection("undo", null);
                }
            });

            taRegisterTool('redo', {
                iconclass: 'fa fa-repeat',
                tooltiptext: taTranslations.redo.tooltip,
                action: function () {
                    return this.$editor().wrapSelection("redo", null);
                }
            });

            taRegisterTool('bold', {
                iconclass: 'fa fa-bold',
                tooltiptext: taTranslations.bold.tooltip,
                action: function () {
                    return this.$editor().wrapSelection("bold", null);
                },
                activeState: function () {
                    return this.$editor().queryCommandState('bold');
                },
                commandKeyCode: 98
            });

            taRegisterTool('justifyLeft', {
                iconclass: 'fa fa-align-left',
                tooltiptext: taTranslations.justifyLeft.tooltip,
                action: function () {
                    return this.$editor().wrapSelection("justifyLeft", null);
                },
                activeState: function (commonElement) {
					var result = false;

                    /* istanbul ignore next: */
                    if (commonElement && commonElement.nodeName === '#document') { return result; }

                    if (commonElement) {
						// commonELement.css('text-align') can throw an error 'Cannot read property 'defaultView' of null' in rare conditions
						// so we do try catch here...
						try {
							result =
								commonElement.css('text-align') === 'left' ||
								commonElement.attr('align') === 'left' ||
								(
									commonElement.css('text-align') !== 'right' &&
									commonElement.css('text-align') !== 'center' &&
									commonElement.css('text-align') !== 'justify' &&
									!this.$editor().queryCommandState('justifyRight') &&
									!this.$editor().queryCommandState('justifyCenter')
								) && !this.$editor().queryCommandState('justifyFull');
						} catch (e) {

							msos.console.warn('ng.testng - app_ngText_run - taRegisterTool (justifyLeft) -> failed:', e);
							result = false;
						}
					}

                    result = result || this.$editor().queryCommandState('justifyLeft');
                    return result;
                }
            });

            taRegisterTool('justifyRight', {
                iconclass: 'fa fa-align-right',
                tooltiptext: taTranslations.justifyRight.tooltip,
                action: function () {
                    return this.$editor().wrapSelection("justifyRight", null);
                },
                activeState: function (commonElement) {
					var result = false;

                    /* istanbul ignore next: */
                    if (commonElement && commonElement.nodeName === '#document') { return result; }

					if (commonElement) {
						// commonELement.css('text-align') can throw an error 'Cannot read property 'defaultView' of null' in rare conditions
						// so we do try catch here...
						try {
							result = commonElement.css('text-align') === 'right';
						} catch (e) {

							msos.console.warn('ng.testng - app_ngText_run - taRegisterTool (justifyRight) -> failed:', e);
							result = false;
						}
					}

                    result = result || this.$editor().queryCommandState('justifyRight');
                    return result;
                }
            });

            taRegisterTool('justifyFull', {
                iconclass: 'fa fa-align-justify',
                tooltiptext: taTranslations.justifyFull.tooltip,
                action: function () {
                    return this.$editor().wrapSelection("justifyFull", null);
                },
                activeState: function (commonElement) {
                    var result = false;

                    if (commonElement) {
						// commonELement.css('text-align') can throw an error 'Cannot read property 'defaultView' of null' in rare conditions
						// so we do try catch here...
						try {
							result = commonElement.css('text-align') === 'justify';
						} catch (e) {

							msos.console.warn('ng.testng - app_ngText_run - taRegisterTool (justifyFull) -> failed:', e);
							result = false;
						}
					}

                    result = result || this.$editor().queryCommandState('justifyFull');
                    return result;
                }
            });

            taRegisterTool('justifyCenter', {
                iconclass: 'fa fa-align-center',
                tooltiptext: taTranslations.justifyCenter.tooltip,
                action: function () {
                    return this.$editor().wrapSelection("justifyCenter", null);
                },
                activeState: function (commonElement) {
					var result = false;

                    /* istanbul ignore next: */
                    if (commonElement && commonElement.nodeName === '#document') { return result; }

                    if (commonElement) {
						// commonELement.css('text-align') can throw an error 'Cannot read property 'defaultView' of null' in rare conditions
						// so we do try catch here...
						try {
							result = commonElement.css('text-align') === 'center';
						} catch( e) {

							msos.console.warn('ng.testng - app_ngText_run - taRegisterTool (justifyCenter) -> failed:', e);
							result = false;
						}
					}

                    result = result || this.$editor().queryCommandState('justifyCenter');
                    return result;
                }
            });

            taRegisterTool('indent', {
                iconclass: 'fa fa-indent',
                tooltiptext: taTranslations.indent.tooltip,
                action: function () {
                    return this.$editor().wrapSelection("indent", null);
                },
                activeState: function () {
                    return this.$editor().queryFormatBlockState('blockquote');
                },
                commandKeyCode: 'TabKey'
            });

            taRegisterTool('outdent', {
                iconclass: 'fa fa-outdent',
                tooltiptext: taTranslations.outdent.tooltip,
                action: function () {
                    return this.$editor().wrapSelection("outdent", null);
                },
                activeState: function () {
                    return false;
                },
                commandKeyCode: 'ShiftTabKey'
            });

            taRegisterTool('italics', {
                iconclass: 'fa fa-italic',
                tooltiptext: taTranslations.italic.tooltip,
                action: function () {
                    return this.$editor().wrapSelection("italic", null);
                },
                activeState: function () {
                    return this.$editor().queryCommandState('italic');
                },
                commandKeyCode: 105
            });

            taRegisterTool('underline', {
                iconclass: 'fa fa-underline',
                tooltiptext: taTranslations.underline.tooltip,
                action: function () {
                    return this.$editor().wrapSelection("underline", null);
                },
                activeState: function () {
                    return this.$editor().queryCommandState('underline');
                },
                commandKeyCode: 117
            });

            taRegisterTool('strikeThrough', {
                iconclass: 'fa fa-strikethrough',
                tooltiptext: taTranslations.strikeThrough.tooltip,
                action: function () {
                    return this.$editor().wrapSelection("strikeThrough", null);
                },
                activeState: function () {
                    return document.queryCommandState('strikeThrough');
                }
            });

            taRegisterTool('clear', {
                iconclass: 'fa fa-ban',
                tooltiptext: taTranslations.clear.tooltip,
                action: function (deferred_na, restoreSelection) {
                    var i,
						possibleNodes,
						removeListElements,
						_list,
						_preLis = [],
						_postLis = [],
						_found = false,
						_parent,
						newElem,
						_firstList,
						_secondList,
						$editor = this.$editor(),
						recursiveRemoveClass;

                    $editor.wrapSelection("removeFormat", null);

                    possibleNodes = angular.element(taSelection.getSelectionElement());

                    // remove lists
                    removeListElements = function (list) {
                        list = angular.element(list);
                        var prevElement = list;

                        angular.forEach(list.children(), function (liElem) {
                            var newElem = angular.element('<p></p>');

                            newElem.html(angular.element(liElem).html());
                            prevElement.after(newElem);
                            prevElement = newElem;
                        });

                        list.remove();
                    };

                    angular.forEach(possibleNodes.find("ul"), removeListElements);
                    angular.forEach(possibleNodes.find("ol"), removeListElements);

                    if (possibleNodes[0].tagName.toLowerCase() === 'li') {
                        _list = possibleNodes[0].parentNode.childNodes;

                        for (i = 0; i < _list.length; i += 1) {
                            if (_list[i] === possibleNodes[0]) { _found = true; }
							else if (!_found) { _preLis.push(_list[i]); }
                            else { _postLis.push(_list[i]); }
                        }

                        _parent = angular.element(possibleNodes[0].parentNode);

                        newElem = angular.element('<p></p>');
                        newElem.html(angular.element(possibleNodes[0]).html());

                        if (_preLis.length === 0 || _postLis.length === 0) {
	
                            if (_postLis.length === 0) { _parent.after(newElem); }
                            else { _parent[0].parentNode.insertBefore(newElem[0], _parent[0]); }

                            if (_preLis.length === 0 && _postLis.length === 0) { _parent.remove(); }
                            else { angular.element(possibleNodes[0]).remove(); }

                        } else {

                            _firstList = angular.element('<'+_parent[0].tagName+'></'+_parent[0].tagName+'>');
                            _secondList = angular.element('<'+_parent[0].tagName+'></'+_parent[0].tagName+'>');

                            for (i = 0; i < _preLis.length; i += 1)		{  _firstList.append(angular.element(_preLis[i])); }
                            for (i = 0; i < _postLis.length; i += 1)	{ _secondList.append(angular.element(_postLis[i])); }

                            _parent.after(_secondList);
                            _parent.after(newElem);
                            _parent.after(_firstList);
                            _parent.remove();
                        }

                        taSelection.setSelectionToElementEnd(newElem[0]);
                    }

					recursiveRemoveClass = function (node) {
                        node = angular.element(node);

                        if (node[0] !== $editor.displayElements.text[0]) { node.removeAttr('class'); }
                        angular.forEach(node.children(), recursiveRemoveClass);
                    };

                    angular.forEach(possibleNodes, recursiveRemoveClass);

                    // check if in list. If not in list then use formatBlock option
					if (possibleNodes[0] &&
						possibleNodes[0].tagName.toLowerCase() !== 'li' &&
						possibleNodes[0].tagName.toLowerCase() !== 'ol' &&
						possibleNodes[0].tagName.toLowerCase() !== 'ul' &&
						possibleNodes[0].getAttribute("contenteditable") !== "true") {
							$editor.wrapSelection("formatBlock", "default");
					}

                    restoreSelection();
                }
            });

            taRegisterTool('insertImage', {
                iconclass: 'fa fa-picture-o',
                tooltiptext: taTranslations.insertImage.tooltip,
                action: function () {
                    var imageLink,
						embed;

                    imageLink = prompt(taTranslations.insertImage.dialogPrompt, 'http://');

                    if (imageLink && imageLink !== '' && imageLink !== 'http://') {
 						if (!blockJavascript(imageLink)) {
							if (taSelection.getSelectionElement().tagName && taSelection.getSelectionElement().tagName.toLowerCase() === 'a') {
								taSelection.setSelectionAfterElement(taSelection.getSelectionElement());
							}
							embed = '<img src="' + imageLink + '">';
							return this.$editor().wrapSelection('insertHTML', embed, true);
						}
                    }

					return undefined;
                },
                onElementSelect: {
                    element: 'img',
                    action: ng.textng.setup.tool_functions.imgOnSelectAction
                }
            });

            taRegisterTool('insertVideo', {
                iconclass: 'fa fa-youtube-play',
                tooltiptext: taTranslations.insertVideo.tooltip,
                action: function () {
                    var urlPrompt,
						urlLink,
						embed,
						videoId;

                    urlPrompt = prompt(taTranslations.insertVideo.dialogPrompt, 'https://');
                    // block javascript here
                    /* istanbul ignore else: if it's javascript don't worry - though probably should show some kind of error message */
                    if (!blockJavascript(urlPrompt)) {

                        if (urlPrompt && urlPrompt !== '' && urlPrompt !== 'https://') {

                            videoId = ng.textng.setup.tool_functions.extractYoutubeVideoId(urlPrompt);

                            /* istanbul ignore else: if it's invalid don't worry - though probably should show some kind of error message */
                            if (videoId) {
                                // create the embed link
                                urlLink = "https://www.youtube.com/embed/" + videoId;
                                embed = '<img class="ta-insert-video" src="https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg" ta-insert-video="' + urlLink + '" contenteditable="false" allowfullscreen="true" frameborder="0" />';
                                /* istanbul ignore next: don't know how to test this... since it needs a dialogPrompt */
								if (taSelection.getSelectionElement().tagName && taSelection.getSelectionElement().tagName.toLowerCase() === 'a') {
									taSelection.setSelectionAfterElement(taSelection.getSelectionElement());
								}
                                // insert
                                return this.$editor().wrapSelection('insertHTML', embed, true);
                            }
                        }
                    }
					return undefined;
                },
                onElementSelect: {
                    element: 'img',
                    onlyWithAttrs: ['ta-insert-video'],
                    action: ng.textng.setup.tool_functions.imgOnSelectAction
                }
            });

            taRegisterTool('insertLink', {
                tooltiptext: taTranslations.insertLink.tooltip,
                iconclass: 'fa fa-link',
				action: function () {
					var urlLink;
					// if this link has already been set, we need to just edit the existing link
					/* istanbul ignore if: we do not test this */
					if (taSelection.getSelectionElement().tagName && taSelection.getSelectionElement().tagName.toLowerCase() === 'a') {
						urlLink = $window.prompt(taTranslations.insertLink.dialogPrompt, taSelection.getSelectionElement().href);
					} else {
						urlLink = $window.prompt(taTranslations.insertLink.dialogPrompt, 'http://');
					}

					if (urlLink && urlLink !== '' && urlLink !== 'http://') {
						// block javascript here
						/* istanbul ignore else: if it's javascript don't worry - though probably should show some kind of error message */
						if (!blockJavascript(urlLink)) {
							return this.$editor().wrapSelection('createLink', urlLink, true);
						}
					}
				},
                activeState: function (commonElement) {
                    if (commonElement) { return commonElement[0].tagName === 'A'; }
                    return false;
                },
                onElementSelect: {
                    element: 'a',
                    action: ng.textng.setup.tool_functions.aOnSelectAction
                }
            });

            taRegisterTool('wordcount', {
                display: '<div id="toolbarWC" style="display:block; min-width:100px;">Words: <span ng-bind="wordcount"></span></div>',
                disabled: true,
                wordcount: 0,
                activeState: function () { // this fires on keyup
                    var textElement = this.$editor().displayElements.text,
						workingHTML = textElement[0].innerHTML || '',
						noOfWords = 0;

                    /* istanbul ignore if: will default to '' when undefined */
                    if (workingHTML.replace(/\s*<[^>]*?>\s*/g, '') !== '') {
                        noOfWords = workingHTML.replace(/<\/?(b|i|em|strong|span|u|strikethrough|a|img|small|sub|sup|label)( [^>*?])?>/gi, '') // remove inline tags without adding spaces
                                                .replace(/(<[^>]*?>\s*<[^>]*?>)/ig, ' ') // replace adjacent tags with possible space between with a space
                                                .replace(/(<[^>]*?>)/ig, '') // remove any singular tags
                                                .replace(/\s+/ig, ' ') // condense spacing
                                                .match(/\S+/g).length; // count remaining non-space strings
                    }

                    //Set current scope
                    this.wordcount = noOfWords;
                    //Set editor scope
                    this.$editor().wordcount = noOfWords;

                    return false;
                }
            });

            taRegisterTool('charcount', {
                display: '<div id="toolbarCC" style="display:block; min-width:120px;">Characters: <span ng-bind="charcount"></span></div>',
                disabled: true,
                charcount: 0,
                activeState: function () { // this fires on keyup
                    var textElement = this.$editor().displayElements.text,
						sourceText = textElement[0].innerText || textElement[0].textContent, // to cover the non-jquery use case.
						noOfChars = sourceText.replace(/(\r\n|\n|\r)/gm,"").replace(/^\s+/g,' ').replace(/\s+$/g, ' ').length;
          
                    //Set current scope
                    this.charcount = noOfChars;
                    //Set editor scope
                    this.$editor().charcount = noOfChars;

                    return false;
                }
            });

            msos.console.debug(temp_rn + ' done!');
        }
	]
).directive(
    'taTextEditorClass',
    angular.restrictADir
).directive(
    'taHtmlEditorClass',
    angular.restrictADir
).directive(
    'taFocussedClass',
    angular.restrictADir
).directive(
    'taDefaultWrap',
    angular.restrictADir
).directive(
    'taPaste',
    angular.restrictADir
).directive(
    'taReadonly',
    angular.restrictADir
).directive(
    'taShowHtml',
    angular.restrictADir
).directive(
    'taDisabled',
    angular.restrictADir
).directive(
    'taResizeForceAspectRatio',
    angular.restrictADir
).directive(
    'taTargetToolbars',
    angular.restrictADir
).directive(
    'taKeepStyles',
    angular.restrictADir
).directive(
    'taFocussedClass',
    angular.restrictADir
).directive(
    'taToolbarActiveButtonClass',
    angular.restrictADir
).directive(
    'taToolbarButtonClass',
    angular.restrictADir
).directive(
    'taToolbarGroupClass',
    angular.restrictADir
).directive(
    'taToolbarClass',
    angular.restrictADir
).directive(
    'taToolbar',
    angular.restrictADir
).directive(
    'taFileDrop',
    angular.restrictADir
).directive(
    'taHtmlEditorSetup',
    angular.restrictADir
).directive(
    'taTextEditorSetup',
    angular.restrictADir
).directive(
    'taDefaultTagAttributes',
    angular.restrictADir
);

angular.module(
	'textAngular.factories', []
).factory(
	'taApplyCustomRenderers',
	['taDOM', function (taDOM) {
		"use strict";

		return function (val) {
			var element = angular.element('<div></div>');

			element[0].innerHTML = val;

			angular.forEach(
				ng.textng.setup.renderers,
				function (renderer) {
					var elements = [];

					if (renderer.selector && renderer.selector !== '') {
						elements = element.find(renderer.selector);
					} else if (renderer.customAttribute && renderer.customAttribute !== '') {
						elements = taDOM.getByAttribute(element, renderer.customAttribute);
					}

					angular.forEach(
						elements,
						function (_element) {
							_element = angular.element(_element);

							if (renderer.selector &&
								renderer.selector !== '' &&
								renderer.customAttribute &&
								renderer.customAttribute !== '') {
								if (_element.attr(renderer.customAttribute) !== undefined) {
									renderer.renderLogic(_element);
								}
							} else { renderer.renderLogic(_element); }
						}
					);
				}
			);

			return element[0].innerHTML;
		};
	}]
).factory(
	'taFixChrome',
	function () {

		var betterSpanMatch = /style\s?=\s?(["'])(?:(?=(\\?))\2.)*?\1/ig,
			taFixChrome = function (html, keepStyles) {

				if (!html || !angular.isString(html) || html.length <= 0) {
					return html;
				}
 
				var appleConvertedSpaceMatch = /<span class="Apple-converted-space">([^<]+)<\/span>/ig,
					match,
					styleVal,
					appleSpaceVal,
					finalHtml = '',
					lastIndex = 0,
					fe;

				while (match = appleConvertedSpaceMatch.exec(html)) {
					appleSpaceVal = match[1];
					appleSpaceVal = appleSpaceVal.replace(/&nbsp;/ig, ' ');
					finalHtml += html.substring(lastIndex, match.index) + appleSpaceVal;
					lastIndex = match.index + match[0].length;
				}

				if (lastIndex) {
					// modified....
					finalHtml += html.substring(lastIndex);
					html=finalHtml;
					finalHtml='';
					lastIndex=0;
				}

				if (!keepStyles) {
					while (match = betterSpanMatch.exec(html)) {

						finalHtml += html.substring(lastIndex, match.index-1);
						styleVal = match[0];
						// test for chrome inserted junk
						 match = /font-family: inherit;|line-height: 1.[0-9]{3,12};|color: inherit; line-height: 1.1;|color: rgb\(\d{1,3}, \d{1,3}, \d{1,3}\);|background-color: rgb\(\d{1,3}, \d{1,3}, \d{1,3}\);/gi.exec(styleVal);

						if (match) {
							styleVal = styleVal.replace(/( |)font-family: inherit;|( |)line-height: 1.[0-9]{3,12};|( |)color: inherit;|( |)color: rgb\(\d{1,3}, \d{1,3}, \d{1,3}\);|( |)background-color: rgb\(\d{1,3}, \d{1,3}, \d{1,3}\);/ig, '');

							if (styleVal.length > 8) {
								finalHtml += ' ' + styleVal;
							}
						} else {
							finalHtml += ' ' + styleVal;
						}

						 lastIndex = betterSpanMatch.lastIndex;
					}

					finalHtml += html.substring(lastIndex);
				}

				if (lastIndex > 0) {
					// replace all empty strings
					fe = finalHtml.replace(/<span\s?>(.*?)<\/span>(<br(\/|)>|)/ig, '$1');
					return fe;
				} else {
					return html;
				}
			};

		return taFixChrome;
	}
).factory(
	'taSanitize',
	['$sanitize', function taSanitizeFactory($sanitize) {
		"use strict";

		var convert_infos = [
				{
					property: 'font-weight',
					values: ['bold'],
					tag: 'b'
				},
				{
					property: 'font-style',
					values: ['italic'],
					tag: 'i'
				}
			],
			styleMatch = [],
			i = 0,
			j = 0,
			_partialStyle,
			styleRegexString;

		for (i = 0; i < convert_infos.length; i += 1) {

			_partialStyle = '(' + convert_infos[i].property + ':\\s*(';

			for (j = 0; j < convert_infos[i].values.length; j += 1) {
				if (j > 0) { _partialStyle += '|'; }
				_partialStyle += convert_infos[i].values[j];
			}

			_partialStyle += ');)';

			styleMatch.push(_partialStyle);
		}

		styleRegexString = '(' + styleMatch.join('|') + ')';

		return function taSanitize(unsafe, oldsafe) {

			function transformLegacyStyles(ls_html) {
				var i,
					styleElementMatch = /<([^>\/]+?)style=("([^"]+)"|'([^']+)')([^>]*)>/ig,
					ls_match,
					subMatch,
					styleVal,
					styleRegex,
					styleRegexExec,
					newTag,
					lastNewTag = '',
					newHtml,
					ls_finalHtml = '',
					ls_lastIndex = 0;

				if (!ls_html || !angular.isString(ls_html) || ls_html.length <= 0) { return ls_html; }

				function wrapNested(wn_html, wrapTag) {
					var depth = 0,
						wn_lastIndex = 0,
						wn_match,
						tagRegex = /<[^>]*>/ig;

					while(wn_match = tagRegex.exec(wn_html)) {
						wn_lastIndex = wn_match.index;

						if (wn_match[0].substr(1, 1) === '/') {
							if (depth === 0) { break; }
							else { depth -= 1; }
						} else {
							depth += 1;
						}
					}

					return wrapTag +
						wn_html.substring(0, wn_lastIndex) +
						angular.element(wrapTag)[0].outerHTML.substring(wrapTag.length) +
						wn_html.substring(wn_lastIndex);
				}

				while(ls_match = styleElementMatch.exec(ls_html)) {

					styleVal = ls_match[3] || ls_match[4];
					styleRegex = new RegExp(styleRegexString, 'i');

					// test for style values to change
					if (angular.isString(styleVal) && styleRegex.test(styleVal)) {
						// remove build tag list
						newTag = '';
						// init regex here for exec
						styleRegexExec = new RegExp(styleRegexString, 'ig');
						// find relevand tags and build a string of them
						while(subMatch = styleRegexExec.exec(styleVal)) {
							for (i = 0; i < convert_infos.length; i += 1) {
								if (!!subMatch[(i*2) + 2]) {
									newTag += '<' + convert_infos[i].tag + '>';
								}
							}
						}
						// recursively find more legacy styles in html before this tag and after the previous ls_match (if any)
						newHtml = transformLegacyStyles(ls_html.substring(ls_lastIndex, ls_match.index));
						// build up html
						if (lastNewTag.length > 0) {
							ls_finalHtml += wrapNested(newHtml, lastNewTag);
						} else {
							ls_finalHtml += newHtml;
						}
						// grab the style val without the transformed values
						styleVal = styleVal.replace(new RegExp(styleRegexString, 'ig'), '');
						// build the html tag
						ls_finalHtml += '<' + ls_match[1].trim();
						if (styleVal.length > 0) { ls_finalHtml += ' style="' + styleVal + '"'; }
						ls_finalHtml += ls_match[5] + '>';
						// update the start index to after this tag
						ls_lastIndex = ls_match.index + ls_match[0].length;
						lastNewTag = newTag;
					}
				}
				if (lastNewTag.length > 0) {
					ls_finalHtml += wrapNested(ls_html.substring(ls_lastIndex), lastNewTag);
				} else {
					ls_finalHtml += ls_html.substring(ls_lastIndex);
				}

				return ls_finalHtml;
			}

			function transformLegacyAttributes(la_html) {
				var attrElementMatch = /<([^>\/]+?)align=("([^"]+)"|'([^']+)')([^>]*)>/ig,
					la_match,
					la_finalHtml = '',
					la_lastIndex = 0,
					newTag = '';

				if (!la_html || !angular.isString(la_html) || la_html.length <= 0) { return la_html; }

				// match all attr tags
				while(la_match = attrElementMatch.exec(la_html)) {
					// add all html before this tag
					la_finalHtml += la_html.substring(la_lastIndex, la_match.index);
					// record last index after this tag
					la_lastIndex = la_match.index + la_match[0].length;
					// construct tag without the align attribute
					newTag = '<' + la_match[1] + la_match[5];
					// add the style attribute
					if (/style=("([^"]+)"|'([^']+)')/ig.test(newTag)) {
						newTag = newTag.replace(/style=("([^"]+)"|'([^']+)')/i, 'style="$2$3 text-align:' + (la_match[3] || la_match[4]) + ';"');
					} else {
						newTag += ' style="text-align:' + (la_match[3] || la_match[4]) + ';"';
					}
					newTag += '>';
					// add to html
					la_finalHtml += newTag;
				}

				return la_finalHtml + la_html.substring(la_lastIndex);
			}

			var temp_ts = 'ng.textng.core - taSanitize -> ',
				safe,
				_preTags,
				processedSafe,
				re = /<pre[^>]*>.*?<\/pre[^>]*>/ig,
				index = 0,
				lastIndex = 0,
				origTag;

			try {
				unsafe = transformLegacyStyles(unsafe);
			} catch (e3) {
				msos.console.error(temp_ts + 'transformLegacyStyles failed:', e3);
			}

			unsafe = transformLegacyAttributes(unsafe);

			try {
				safe = $sanitize(unsafe);
			} catch (e4) {
				msos.console.error(temp_ts + 'transformLegacyAttributes failed:', e4);
				safe = oldsafe || '';
			}

			// Do processing for <pre> tags, removing tabs and return carriages outside of them
			_preTags = safe.match(/(<pre[^>]*>.*?<\/pre[^>]*>)/ig);
			processedSafe = safe.replace(/(&#(9|10);)*/ig, '');

			safe = '';

			while((origTag = re.exec(processedSafe)) !== null && index < _preTags.length) {
				safe += processedSafe.substring(lastIndex, origTag.index) + _preTags[index];
				lastIndex = origTag.index + origTag[0].length;
				index += 1;
			}

			return safe + processedSafe.substring(lastIndex);
		};
	}]
).factory(
	'taToolExecuteAction',
	['$q', function ($q) {
		"use strict";

		return function (editor) {
			var temp_te = 'ng.textng.core - taToolExecuteAction -> ',
				deferred = $q.defer('ng_textng_taToolExecuteAction'),
				promise = deferred.promise,
				_editor = this.$editor(),
				result;

			if (editor !== undefined) {
				this.$editor = function () { return editor; };
			}

			// pass into the action the deferred function and also the function to reload the current selection if rangy available
			try {
				result = this.action(deferred, _editor.startAction());
				// We set the .finally callback here to make sure it doesn't get executed before any other .then callback.
				promise['finally'](
					function () {
						_editor.endAction();
					}
				);
			} catch (e5) {
				msos.console.error(temp_te + 'failed:', e5);
			}

			if (result || result === undefined) { deferred.resolve(); }
		};
	}]
);

angular.module(
	'textAngular.DOM', ['textAngular.factories']
).factory(
	'taExecCommand',
	['taSelection', '$document', function (taSelection, $document) {
		"use strict";

		var temp_ex = 'ng.textng.core - taExecCommand',
			listToDefault = function (listElement, defaultWrap) {
				var $target,
					i,
					children = listElement.find('li');

				// if all selected then we should remove the list
				// grab all li elements and convert to taDefaultWrap tags
				for (i = children.length - 1; i >= 0; i -= 1) {
					$target = angular.element('<' + defaultWrap + '>' + children[i].innerHTML + '</' + defaultWrap + '>');
					listElement.after($target);
				}

				listElement.remove();
				taSelection.setSelectionToElementEnd($target[0]);
			},
			listElementToSelfTag = function (list, listElement, selfTag, bDefault, defaultWrap){
				var $target,
					i,
					priorElement,
					nextElement,
					children = list.find('li'),
					foundIndex,
					html = '',
					p,
					html1 = '',
					listTag,
					html2 = '';

				for (i = 0; i<children.length; i += 1) {
					if (children[i].outerHTML === listElement[0].outerHTML) {
						// found it...
						foundIndex = i;

						if (i > 0) {
							priorElement = children[i - 1];
						}
						if (i + 1 < children.length) {
							nextElement = children[i + 1];
						}
						break;
					}
				}

				if (bDefault) {
					html += '<' + defaultWrap + '>' + listElement[0].innerHTML + '</' + defaultWrap + '>';
				} else {
					html += '<' + taBrowserTag(selfTag) + '>';
					html += '<li>' + listElement[0].innerHTML + '</li>';
					html += '</' + taBrowserTag(selfTag) + '>';
				}

				$target = angular.element(html);

				if (!priorElement) {
					// this is the first the list, so we just remove it...
					listElement.remove();
					list.after(angular.element(list[0].outerHTML));
					list.after($target);
					list.remove();
					taSelection.setSelectionToElementEnd($target[0]);
					return;
				} else if (!nextElement) {
					// this is the last in the list, so we just remove it..
					listElement.remove();
					list.after($target);
					taSelection.setSelectionToElementEnd($target[0]);
				} else {
					p = list.parent();
					listTag = list[0].nodeName.toLowerCase();
					html1 += '<' + listTag + '>';

					for (i = 0; i < foundIndex; i += 1) {
						html1 += '<li>' + children[i].innerHTML + '</li>';
					}

					html1 += '</' + listTag + '>';
					html2 += '<' + listTag + '>';

					for (i = foundIndex + 1; i < children.length; i += 1) {
						html2 += '<li>' + children[i].innerHTML + '</li>';
					}

					html2 += '</' + listTag + '>';

					list.after(angular.element(html2));
					list.after($target);
					list.after(angular.element(html1));
					list.remove();

					taSelection.setSelectionToElementEnd($target[0]);
				}
			},
			listElementsToSelfTag = function(list, listElements, selfTag, bDefault, defaultWrap){
				var $target,
					i,
					j,
					priorElement,
					afterElement,
					children = list.find('li'),
					foundIndexes = [],
					html = '',
					html1 = '',
					listTag,
					html2 = '';

				for (i = 0; i < children.length; i += 1) {
					for (j = 0; j < listElements.length; j += 1) {
						if (children[i].isEqualNode(listElements[j])) {
							foundIndexes[j] = i;
						}
					}
				}

				if (foundIndexes[0] > 0) {
					priorElement = children[foundIndexes[0] - 1];
				}
				if (foundIndexes[listElements.length - 1] + 1 < children.length) {
					afterElement = children[foundIndexes[listElements.length - 1] + 1];
				}


				if (bDefault) {
					for (j = 0; j < listElements.length; j += 1) {
						html += '<' + defaultWrap + '>' + listElements[j].innerHTML + '</' + defaultWrap + '>';
						listElements[j].remove();
					}
				} else {
					html += '<' + taBrowserTag(selfTag) + '>';

					for (j = 0; j < listElements.length; j += 1) {
						html += listElements[j].outerHTML;
						listElements[j].remove();
					}

					html += '</' + taBrowserTag(selfTag) + '>';
				}

				$target = angular.element(html);

				if (!priorElement) {
					// this is the first the list, so we just remove it...
					list.after(angular.element(list[0].outerHTML));
					list.after($target);
					list.remove();
					taSelection.setSelectionToElementEnd($target[0]);
					return;
				} else if (!afterElement) {
					// this is the last in the list, so we just remove it..
					list.after($target);
					taSelection.setSelectionToElementEnd($target[0]);
					return;
				} else {
					// okay it was some where in the middle... so we need to break apart the list...
					listTag = list[0].nodeName.toLowerCase();
					html1 += '<' + listTag + '>';

					for (i = 0; i < foundIndexes[0]; i += 1) {
						html1 += '<li>' + children[i].innerHTML + '</li>';
					}

					html1 += '</' + listTag + '>';
					html2 += '<' + listTag + '>';

					for(i = foundIndexes[listElements.length-1]+1; i < children.length; i++){
						html2 += '<li>' + children[i].innerHTML + '</li>';
					}

					html2 += '</' + listTag + '>';

					list.after(angular.element(html2));
					list.after($target);
					list.after(angular.element(html1));
					list.remove();
	
					taSelection.setSelectionToElementEnd($target[0]);
				}
			},
			selectLi = function (liElement) {
				if (/(<br(|\/)>)$/i.test(liElement.innerHTML.trim())) {
					taSelection.setSelectionBeforeElement(angular.element(liElement).find("br")[0]);
				} else {
					taSelection.setSelectionToElementEnd(liElement);
				}
			},
			listToList = function (listElement, newListTag) {
				var $target = angular.element('<' + newListTag + '>' + listElement[0].innerHTML + '</' + newListTag + '>');

				listElement.after($target);
				listElement.remove();
				selectLi($target.find('li')[0]);
			},
			childElementsToList = function (elements, listElement, newListTag) {
				var html = '',
					i = 0,
					$target;

				for (i = 0; i < elements.length; i += 1) {
					html += '<' + ng.textng.core.ta_tag('li') + '>' + elements[i].innerHTML + '</' + ng.textng.core.ta_tag('li') + '>';
				}

				$target = angular.element('<' + newListTag + '>' + html + '</' + newListTag + '>');

				listElement.after($target);
				listElement.remove();

				selectLi($target.find('li')[0]);
			},
			turnBlockIntoBlocks = function (element, options) {
				var i = 0,
					_n,
					$target;

				for(i = 0; i < element.childNodes.length; i += 1) {
					_n = element.childNodes[i];

					if (_n.tagName && angular.blockElements[_n.tagName.toLowerCase()]) {
						turnBlockIntoBlocks(_n, options);
					}
				}

				if (element.parentNode === null) {
					return element;
				}

				if (options === '<br>') {
					return element;
				} else {
					$target = angular.element(options);
					$target[0].innerHTML = element.innerHTML;
					element.parentNode.insertBefore($target[0], element);
					element.parentNode.removeChild(element);
					return $target;
				}
			};

		msos.console.debug(temp_ex + ' -> called.');

		return function (taDefaultWrap, topNode) {

			msos.console.debug(temp_ex + ' -> add taDefaultWrap.');

			taDefaultWrap = ng.textng.core.ta_tag(taDefaultWrap);

			return function (command, showUI, options, defaultTagAttributes) {
				var LISTELEMENTS = /^(ul|li|ol)$/i,
					i,
					$target,
					html,
					_nodes,
					next,
					optionsTagName,
					ourSelection,
					selectedElement,
					defaultWrapper = angular.element('<' + taDefaultWrap + '>'),
					__h,
					_innerNode,
					$selected,
					tagName,
					selfTag,
					selectedElements,
					childBlockElements = false,
					$nodes = [],
					$n,
					hasBlock = false,
					blockElement,
					contents,
					tagBegin,
					tagEnd,
					_selection,
					node;

				msos.console.debug(temp_ex + ' - command -> called.');

				try {
					if (taSelection.getSelection) {
						ourSelection = taSelection.getSelection();
					}

					selectedElement = taSelection.getSelectionElement();

					if (selectedElement.tagName !== undefined) {

						if (selectedElement.tagName.toLowerCase() === 'div' &&
							/taTextElement.+/.test(selectedElement.id) &&
							ourSelection && ourSelection.start &&
							ourSelection.start.offset === 1 &&
							ourSelection.end.offset === 1) {

							__h = selectedElement.innerHTML;

							if (/<br>/i.test(__h)) {
								// Firefox adds <br>'s and so we remove the <br>
								__h = __h.replace(/<br>/i, '&#8203;');  // no space-space
							}
							if (/<br\/>/i.test(__h)) {
								// Firefox adds <br/>'s and so we remove the <br/>
								__h = __h.replace(/<br\/>/i, '&#8203;');  // no space-space
							}
							// remove stacked up <span>'s
							if (/<span>(<span>)+/i.test(__h)) {
								__h = __.replace(/<span>(<span>)+/i, '<span>');
							}
							// remove stacked up </span>'s
							if (/<\/span>(<\/span>)+/i.test(__h)) {
								__h = __.replace(/<\/span>(<\/span>)+/i, '<\/span>');
							}
							if (/<span><\/span>/i.test(__h)) {
								// if we end up with a <span></span> here we remove it...
								__h = __h.replace(/<span><\/span>/i, '');
							}
							//console.log('inner whole container', selectedElement.childNodes);
							_innerNode = '<div>' + __h + '</div>';
							selectedElement.innerHTML = _innerNode;
							//console.log('childNodes:', selectedElement.childNodes);
							taSelection.setSelectionToElementEnd(selectedElement.childNodes[0]);
							selectedElement = taSelection.getSelectionElement();
						} else if (selectedElement.tagName.toLowerCase() === 'span' &&
							ourSelection && ourSelection.start &&
							ourSelection.start.offset === 1 &&
							ourSelection.end.offset === 1) {
							// just a span -- this is a problem...
							//console.log('selecting span!');
							__h = selectedElement.innerHTML;
							if (/<br>/i.test(__h)) {
								// Firefox adds <br>'s and so we remove the <br>
								__h = __h.replace(/<br>/i, '&#8203;');  // no space-space
							}
							if (/<br\/>/i.test(__h)) {
								// Firefox adds <br/>'s and so we remove the <br/>
								__h = __h.replace(/<br\/>/i, '&#8203;');  // no space-space
							}
							// remove stacked up <span>'s
							if (/<span>(<span>)+/i.test(__h)) {
								__h = __.replace(/<span>(<span>)+/i, '<span>');
							}
							// remove stacked up </span>'s
							if (/<\/span>(<\/span>)+/i.test(__h)) {
								__h = __.replace(/<\/span>(<\/span>)+/i, '<\/span>');
							}
							if (/<span><\/span>/i.test(__h)) {
								// if we end up with a <span></span> here we remove it...
								__h = __h.replace(/<span><\/span>/i, '');
							}
							//console.log('inner span', selectedElement.childNodes);
							// we wrap this in a <div> because otherwise the browser get confused when we attempt to select the whole node
							// and the focus is not set correctly no matter what we do
							_innerNode = '<div>' + __h + '</div>';
							selectedElement.innerHTML = _innerNode;
							taSelection.setSelectionToElementEnd(selectedElement.childNodes[0]);
							selectedElement = taSelection.getSelectionElement();
							//console.log(selectedElement.innerHTML);
						} else if (selectedElement.tagName.toLowerCase() === 'p' &&
							ourSelection && ourSelection.start &&
							ourSelection.start.offset === 1 &&
							ourSelection.end.offset === 1) {
							//console.log('p special');
							// we need to remove the </br> that firefox adds!
							__h = selectedElement.innerHTML;
							if (/<br>/i.test(__h)) {
								// Firefox adds <br>'s and so we remove the <br>
								__h = __h.replace(/<br>/i, '&#8203;');  // no space-space
								selectedElement.innerHTML = __h;
							}
						} else if (selectedElement.tagName.toLowerCase() === 'li' &&
							ourSelection && ourSelection.start &&
							ourSelection.start.offset === ourSelection.end.offset) {
							// we need to remove the </br> that firefox adds!
							__h = selectedElement.innerHTML;
							if (/<br>/i.test(__h)) {
								// Firefox adds <br>'s and so we remove the <br>
								__h = __h.replace(/<br>/i, '');  // nothing
								selectedElement.innerHTML = __h;
							}
						}
					}
				} catch (e1) {
					msos.console.warn(temp_ex + ' - command -> getSelectionElement failed:', e1);
				}

				if (selectedElement !== undefined) {

					$selected = angular.element(selectedElement);
					tagName = selectedElement.tagName.toLowerCase();

					if (command.toLowerCase() === 'insertorderedlist' || command.toLowerCase() === 'insertunorderedlist') {

						selfTag = ng.textng.core.ta_tag((command.toLowerCase() === 'insertorderedlist')? 'ol' : 'ul');
						selectedElements = taSelection.getOnlySelectedElements();

						if (selectedElements.length > 1 && (tagName === 'ol' || tagName === 'ul')) {
							return listElementsToSelfTag($selected, selectedElements, selfTag, selfTag === tagName, taDefaultWrap);
						}

						if (tagName === selfTag) {

							if ($selected[0].childNodes.length !== selectedElements.length && selectedElements.length === 1) {
								$selected = angular.element(selectedElements[0]);
								return listElementToSelfTag($selected.parent(), $selected, selfTag, true, taDefaultWrap);
							}

							return listToDefault($selected, taDefaultWrap);
						}
						if (
							tagName === 'li' &&
							$selected.parent()[0].tagName.toLowerCase() === selfTag &&
							$selected.parent().children().length === 1) {
							// catch for the previous statement if only one li exists
							return listToDefault($selected.parent(), taDefaultWrap);
						}
						if (
							tagName === 'li' &&
							$selected.parent()[0].tagName.toLowerCase() !== selfTag &&
							$selected.parent().children().length === 1) {
							// catch for the previous statement if only one li exists
							return listToList($selected.parent(), selfTag);
						}
						if (
							angular.blockElements[tagName] &&
							!$selected.hasClass('ta-bind')) {

							if (selectedElements.length) {
								if ($selected[0].childNodes.length !== selectedElements.length && selectedElements.length === 1) {
									$selected = angular.element(selectedElements[0]);
									return listElementToSelfTag($selected.parent(), $selected, selfTag, selfTag === tagName, taDefaultWrap);
								}
							}

							if (tagName === 'ol' || tagName === 'ul') {
								return listToList($selected, selfTag);
							}

							angular.forEach(
								$selected.children(),
								function (elem) {
									if (angular.blockElements[elem.tagName.toLowerCase()]) {
										childBlockElements = true;
									}
								}
							);

							if (childBlockElements) {
								return childElementsToList($selected.children(), $selected, selfTag);
							}

							return childElementsToList([angular.element('<div>' + selectedElement.innerHTML + '</div>')[0]], $selected, selfTag);
						}
						if (angular.blockElements[tagName]) {
							// if we get here then all the contents of the ta-bind are selected
							_nodes = taSelection.getOnlySelectedElements();

							if (_nodes.length === 0) {
								// here is if there is only text in ta-bind ie <div ta-bind>test content</div>
								$target = angular.element('<' + selfTag + '><li>' + selectedElement.innerHTML + '</li></' + selfTag + '>');
								$selected.html('');
								$selected.append($target);
							} else if (_nodes.length === 1 && (_nodes[0].tagName.toLowerCase() === 'ol' || _nodes[0].tagName.toLowerCase() === 'ul')) {
								if (_nodes[0].tagName.toLowerCase() === selfTag) {
									// remove
									return listToDefault(angular.element(_nodes[0]), taDefaultWrap);
								}
								return listToList(angular.element(_nodes[0]), selfTag);

							} else {

								html = '';

								for (i = 0; i < _nodes.length; i += 1) {

									if (_nodes[i].nodeType !== 3) {
										$n = angular.element(_nodes[i]);

										if (_nodes[i].tagName.toLowerCase() === 'li') {
											continue;
										} else if (_nodes[i].tagName.toLowerCase() === 'ol' || _nodes[i].tagName.toLowerCase() === 'ul') {
											html += $n[0].innerHTML; // if it's a list, add all it's children
										} else if (_nodes[i].tagName.toLowerCase() === 'span' && (_nodes[i].childNodes[0].tagName.toLowerCase() === 'ol' || _nodes[i].childNodes[0].tagName.toLowerCase() === 'ul')) {
											html += $n[0].childNodes[0].innerHTML; // if it's a list, add all it's children
										} else {
											html += '<' + ng.textng.core.ta_tag('li') + '>' + $n[0].innerHTML + '</' + ng.textng.core.ta_tag('li') + '>';
										}
										$nodes.unshift($n);
									}
								}

								$target = angular.element('<' + selfTag + '>' + html + '</' + selfTag + '>');
								$nodes.pop().replaceWith($target);

								angular.forEach(
									$nodes,
									function ($node) { $node.remove(); }
								);
							}

							taSelection.setSelectionToElementEnd($target[0]);
							return undefined;
						}

					} else if (command.toLowerCase() === 'formatblock') {

						optionsTagName = options.toLowerCase().replace(/[<>]/ig, '');

						if (optionsTagName.trim() === 'default') {
							optionsTagName = taDefaultWrap;
							options = '<' + taDefaultWrap + '>';
						}

						if (tagName === 'li')	{ $target = $selected.parent(); }
						else					{ $target = $selected; }

						// find the first blockElement
						while(!$target[0].tagName || (!angular.blockElements[$target[0].tagName.toLowerCase()] && !$target.parent().attr('contenteditable'))) {
							$target = $target.parent();
							tagName = ($target[0].tagName || '').toLowerCase();
						}

						if (tagName === optionsTagName) {
							// $target is wrap element
							_nodes = $target.children();
							hasBlock = false;

							for (i = 0; i < _nodes.length; i += 1) {
								hasBlock = hasBlock || angular.blockElements[_nodes[i].tagName.toLowerCase()];
							}

							if (hasBlock) {
								$target.after(_nodes);
								next = $target.next();
								$target.remove();
								$target = next;
							} else {
								defaultWrapper.append($target[0].childNodes);
								$target.after(defaultWrapper);
								$target.remove();
								$target = defaultWrapper;
							}

						} else if ($target.parent()[0].tagName.toLowerCase() === optionsTagName && !$target.parent().hasClass('ta-bind')) {
							//unwrap logic for parent
							blockElement = $target.parent();
							contents = blockElement.contents();

							for (i = 0; i < contents.length; i += 1) {
								if (blockElement.parent().hasClass('ta-bind') && contents[i].nodeType === 3) {
									defaultWrapper = angular.element('<' + taDefaultWrap + '>');
									defaultWrapper[0].innerHTML = contents[i].outerHTML;
									contents[i] = defaultWrapper[0];
								}
								blockElement.parent()[0].insertBefore(contents[i], blockElement[0]);
							}

							blockElement.remove();

						} else if (tagName.match(LISTELEMENTS)) {
							// wrapping a list element
							$target.wrap(options);
						} else {
							// default wrap behaviour
							_nodes = taSelection.getOnlySelectedElements();

							if (_nodes.length === 0) { _nodes = [$target[0]]; }

							// find the parent block element if any of the nodes are inline or text
							for (i = 0; i < _nodes.length; i += 1) {
								if (_nodes[i].nodeType === 3 || !angular.blockElements[_nodes[i].tagName.toLowerCase()]) {
									while(_nodes[i].nodeType === 3 || !_nodes[i].tagName || !angular.blockElements[_nodes[i].tagName.toLowerCase()]) {
										_nodes[i] = _nodes[i].parentNode;
									}
								}
							}

							_nodes = _nodes.filter(
								function (value, index, self) {
									return self.indexOf(value) === index;
								}
							);

							if (_nodes.length > 1) {
								_nodes = _nodes.filter(
									function (value) {
										return !(value.nodeName.toLowerCase() === 'div' && /^taTextElement/.test(value.id));
									}
								);
							}

							if (angular.element(_nodes[0]).hasClass('ta-bind')) {
								$target = angular.element(options);
								$target[0].innerHTML = _nodes[0].innerHTML;
								_nodes[0].innerHTML = $target[0].outerHTML;
							} else if (optionsTagName === 'blockquote') {
								// blockquotes wrap other block elements
								html = '';

								for (i = 0; i < _nodes.length; i += 1) {
									html += _nodes[i].outerHTML;
								}

								$target = angular.element(options);
								$target[0].innerHTML = html;

								_nodes[0].parentNode.insertBefore($target[0],_nodes[0]);

								for (i = _nodes.length - 1; i >= 0; i -= 1) {
									if (_nodes[i].parentNode) { _nodes[i].parentNode.removeChild(_nodes[i]); }
								}

							} else if (optionsTagName === 'pre' && taSelection.getStateShiftKey()) {
			
								html = '';

								for (i = 0; i < _nodes.length; i += 1) {
									html += _nodes[i].outerHTML;
								}

								$target = angular.element(options);
								$target[0].innerHTML = html;

								_nodes[0].parentNode.insertBefore($target[0], _nodes[0]);

								for (i = _nodes.length - 1; i >= 0; i -= 1) {
									if (_nodes[i].parentNode) { _nodes[i].parentNode.removeChild(_nodes[i]); }
								}
							} else {
								// regular block elements replace other block elements
								for (i = 0; i < _nodes.length; i += 1) {
									var newBlock = turnBlockIntoBlocks(_nodes[i], options);
									if (_nodes[i] === $target[0]) {
										$target = angular.element(newBlock);
									}
								}
							}
						}

						taSelection.setSelectionToElementEnd($target[0]);
						$target[0].focus();

						return undefined;

					} else if (command.toLowerCase() === 'createlink') {

						if (tagName === 'a') {
							taSelection.getSelectionElement().href = options;
							return;
						}

						tagBegin = '<a href="' + options + '" target="' + (defaultTagAttributes.a.target || '') + '">';
						tagEnd = '</a>';

						_selection = taSelection.getSelection();

						if (_selection.collapsed) {
							// insert text at selection, then select then just let normal exec-command run
							taSelection.insertHtml(tagBegin + options + tagEnd, topNode);
						} else if (rangy.core.getSelection().getRangeAt(0).canSurroundContents()) {
							node = angular.element(tagBegin + tagEnd)[0];
							rangy.core.getSelection().getRangeAt(0).surroundContents(node);
						}

						return undefined;

					} else if (command.toLowerCase() === 'inserthtml') {
						taSelection.insertHtml(options, topNode);
						return undefined;
					}
				}

				try {
					$document[0].execCommand(command, showUI, options);
				} catch (e2) {
					msos.console.warn(temp_ex + ' -> failed:', e2);
				}

				return undefined;
			};
		};
	}]
).service('taDOM', function () {
	"use strict";

	var taDOM = {
		// recursive function that returns an array of angular.elements that have the passed attribute set on them
		getByAttribute: function (element, attribute) {
			var resultingElements = [],
				childNodes = element.children();

			if (childNodes.length) {
				angular.forEach(
					childNodes,
					function (child) {
						resultingElements = resultingElements.concat(taDOM.getByAttribute(angular.element(child), attribute));
					}
				);
			}

			if (element.attr(attribute) !== undefined) { resultingElements.push(element); }

			return resultingElements;
		},

		transferChildNodes: function (source, target) {
			// clear out target
			target.innerHTML = '';
			while(source.childNodes.length > 0) { target.appendChild(source.childNodes[0]); }

			return target;
		},
		
		splitNodes: function (nodes, target1, target2, splitNode, subSplitIndex, splitIndex) {
			if (!splitNode && isNaN(splitIndex)) {
				throw new Error('taDOM.splitNodes requires a splitNode or splitIndex');
			}

			var startNodes = document.createDocumentFragment(),
				endNodes = document.createDocumentFragment(),
				index = 0;
			
			while(nodes.length > 0 && (isNaN(splitIndex) || splitIndex !== index) && nodes[0] !== splitNode) {
				startNodes.appendChild(nodes[0]); // this removes from the nodes array (if proper childNodes object.
				index += 1;
			}
			
			if (!isNaN(subSplitIndex) && subSplitIndex >= 0 && nodes[0]) {
				startNodes.appendChild(document.createTextNode(nodes[0].nodeValue.substring(0, subSplitIndex)));
				nodes[0].nodeValue = nodes[0].nodeValue.substring(subSplitIndex);
			}
			while(nodes.length > 0) { endNodes.appendChild(nodes[0]); }
			
			taDOM.transferChildNodes(startNodes, target1);
			taDOM.transferChildNodes(endNodes, target2);
		},
		
		transferNodeAttributes: function (source, target) {
			var i = 0;

			for (i = 0; i < source.attributes.length; i +=  1) {
				target.setAttribute(source.attributes[i].name, source.attributes[i].value);
			}

			return target;
		}
	};

	return taDOM;
});

angular.module(
	'textAngular.validators', []
).directive(
	'taMaxText', function () {
		"use strict";

		return {
			restrict: 'A',
			require: 'ngModel',
			link: function (scope, elem, attrs, ctrl) {
				var max = parseInt(scope.$eval(attrs.taMaxText), 10);

				if (isNaN(max)) {
					throw('Max text must be an integer');
				}

				attrs.$observe('taMaxText', function (value) {
					max = parseInt(value, 10);

					if (isNaN(max)) {
						throw('Max text must be an integer');
					}
					if (ctrl.$dirty) {
						ctrl.$validate();
					}
				});

				ctrl.$validators.taMaxText = function (viewValue) {
					var source = angular.element('<div/>');
					source.html(viewValue);

					return source.text().length <= max;
				};
			}
		};
	}
).directive(
	'taMinText',
	function () {
		"use strict";

		return {
			restrict: 'A',
			require: 'ngModel',
			link: function (scope, elem, attrs, ctrl) {
				var min = parseInt(scope.$eval(attrs.taMinText), 10);

				if (isNaN(min)) {
					throw('Min text must be an integer');
				}

				attrs.$observe('taMinText', function (value) {
					min = parseInt(value, 10);
					if (isNaN(min)) {
						throw('Min text must be an integer');
					}
					if (ctrl.$dirty) {
						ctrl.$validate();
					}
				});

				ctrl.$validators.taMinText = function (viewValue) {
					var source = angular.element('<div/>');

					source.html(viewValue);
					return !source.text().length || source.text().length >= min;
				};
			}
		};
	}
);

angular.module(
	'textAngular.taBind',
	['textAngular.factories', 'textAngular.DOM']
).service(
	'_taBlankTest',
	[function () {
		"use strict";

		var INLINETAGS_NONBLANK = /<(a|abbr|acronym|bdi|bdo|big|cite|code|del|dfn|img|ins|kbd|label|map|mark|q|ruby|rp|rt|s|samp|time|tt|var|table)[^>]*(>|$)/i;

		return function (_defaultTest) {
			return function (_blankVal) {
				if (!_blankVal) { return true; }

				if (typeof _blankVal !== 'string') {
					_blankVal = _blankVal.toString();
					msos.console.warn('ng.textng.core - _taBlankTest -> _blankVal was not a string: ' + _blankVal);
				}
					// find first non-tag match - ie start of string or after tag that is not whitespace
				var _firstMatch = /(^[^<]|>)[^<]/i.exec(_blankVal),
					_firstTagIndex,
					re = /\="[^"]*"/i;

				if (!_firstMatch) {
					// find the end of the first tag removing all the
					// Don't do a global replace as that would be waaayy too long, just replace the first 4 occurences should be enough
					_blankVal = _blankVal
						.replace(re, '')
						.replace(re, '')
						.replace(re, '')
						.replace(re, '');

					_firstTagIndex = _blankVal.indexOf('>');
				} else {
					_firstTagIndex = _firstMatch.index;
				}

				_blankVal = _blankVal.trim().substring(_firstTagIndex, _firstTagIndex + 100);

				// check for no tags entry
				if (/^[^<>]+$/i.test(_blankVal)) {
					return false;
				}

				// this regex is to match any number of whitespace only between two tags
				if (_blankVal.length === 0 || _blankVal === _defaultTest || /^>(\s|&nbsp;)*<\/[^>]+>$/ig.test(_blankVal)) {
					return true;
				}
				// this regex tests if there is a tag followed by some optional whitespace and some text after that
				if (/>\s*[^\s<]/i.test(_blankVal) || INLINETAGS_NONBLANK.test(_blankVal)) {
					return false;
				}

				return true;
			};
		};
	}]
).directive(
	'taButton',
	[function () {
		"use strict";

		return {
			link: function (scope, element) {
				element.attr('unselectable', 'on');
				element.on('mousedown', function (ev, eventData) {
					if (eventData) { angular.extend(ev, eventData); }
					// this prevents focusout from firing on the editor when clicking toolbar buttons
					ev.preventDefault();
					return false;
				});
			}
		};
	}]
).directive('taBind', [
	'taSanitize', '$timeout', '$document', 'taFixChrome',
	'taSelection', 'taApplyCustomRenderers',
	'_taBlankTest', '$parse', 'taDOM', 'textAngularManager',
	function (
		taSanitize, $timeout, $document, taFixChrome,
		taSelection, taApplyCustomRenderers,
		_taBlankTest, $parse, taDOM, textAngularManager) {
		"use strict";

		var temp_bi = 'ng.textng.core - taBind';

		msos.console.debug(temp_bi + ' -> called.');

	// Uses for this are textarea or input with ng-model and ta-bind='text'
	// OR any non-form element with contenteditable="contenteditable" ta-bind="html|text" ng-model
	return {
		priority: 2,	// So we override validators correctly
		require: ['ngModel','?ngModelOptions'],
		link: function (scope, element, attrs, controller) {
			var msie = window.document.documentMode,
				ngModel = controller[0],
				ngModelOptions = controller[1] || {},
				_isContentEditable = element.attr('contenteditable') !== undefined && element.attr('contenteditable'),
				_isInputFriendly = _isContentEditable || element[0].tagName.toLowerCase() === 'textarea' || element[0].tagName.toLowerCase() === 'input',
				_isReadonly = false,
				_focussed = false,
				_skipRender = false,
				_disableSanitizer = attrs.taUnsafeSanitizer || ng.textng.setup.options.disableSanitizer,
				_keepStyles = attrs.taKeepStyles || ng.textng.setup.options.keepStyles,
				_lastKey,
				BLOCKED_KEYS = /^(9|19|20|27|33|34|35|36|37|38|39|40|45|112|113|114|115|116|117|118|119|120|121|122|123|144|145)$/i,
				UNDO_TRIGGER_KEYS = /^(8|13|32|46|59|61|107|109|173|186|187|188|189|190|191|192|219|220|221|222)$/i,
				_pasteHandler,
				_defaultVal,
				_defaultTest,
				_CTRL_KEY = 0x0001,
				_META_KEY = 0x0002,
				_ALT_KEY = 0x0004,
				_SHIFT_KEY = 0x0008,
				_ENTER_KEYCODE = 13,
				_SHIFT_KEYCODE = 16,
				_TAB_KEYCODE = 9,
				_LEFT_ARROW_KEYCODE = 37,
				_RIGHT_ARROW_KEYCODE = 39,
				_keyMappings = [
					//		ctrl/command + z
					{
						specialKey: 'UndoKey',
						forbiddenModifiers: _ALT_KEY + _SHIFT_KEY,
						mustHaveModifiers: [_META_KEY + _CTRL_KEY],
						keyCode: 90
					},
					//		ctrl/command + shift + z
					{
						specialKey: 'RedoKey',
						forbiddenModifiers: _ALT_KEY,
						mustHaveModifiers: [_META_KEY + _CTRL_KEY, _SHIFT_KEY],
						keyCode: 90
					},
					//		ctrl/command + y
					{
						specialKey: 'RedoKey',
						forbiddenModifiers: _ALT_KEY + _SHIFT_KEY,
						mustHaveModifiers: [_META_KEY + _CTRL_KEY],
						keyCode: 89
					},
					//		TabKey
					{
						specialKey: 'TabKey',
						forbiddenModifiers: _META_KEY + _SHIFT_KEY + _ALT_KEY + _CTRL_KEY,
						mustHaveModifiers: [],
						keyCode: 9
					},
					//		shift + TabKey
					{
						specialKey: 'ShiftTabKey',
						forbiddenModifiers: _META_KEY + _ALT_KEY + _CTRL_KEY,
						mustHaveModifiers: [_SHIFT_KEY],
						keyCode: 9
					}
				],
				_blankTest,
				_ensureContentWrapped,
				_undoKeyupTimeout,
				_redoUndoTimeout,
				_undo,
				_redo,
				_compileHtml,
				_setViewValue,
				_sanitize,
				_repeat,
				_forEach,
				_recursiveListFormat,
				_processingPaste = false,
				_processpaste,
				_setInnerHTML = function (newval) {
					element[0].innerHTML = newval;
				},
				_renderTimeout,
				_renderInProgress = false,
				_keyupTimeout,
				_inputTimeout,
				_rule,
				_selectorClickHandler,
				_fileDropHandler,
				_reApplyOnSelectorHandlers;

			function _mapKeys(event) {
				var specialKey;

				_keyMappings.forEach(
					function (map) {
						var netModifiers;

						function mustHaveModEvery(modifier) { return netModifiers & modifier; }

						if (map.keyCode === event.keyCode) {
							netModifiers = (event.metaKey ? _META_KEY: 0) +
								(event.ctrlKey	? _CTRL_KEY : 0) +
								(event.shiftKey	? _SHIFT_KEY : 0) +
								(event.altKey	? _ALT_KEY : 0);

							if (map.forbiddenModifiers & netModifiers) { return; }

							if (map.mustHaveModifiers.every(mustHaveModEvery)) {
								specialKey = map.specialKey;
							}
						}
					}
				);

				return specialKey;
			}

			if (attrs.taDefaultWrap === undefined) {
				attrs.taDefaultWrap = 'p';
			}

			if (attrs.taDefaultWrap === '') {
				_defaultVal = '';
				_defaultTest = msie === undefined ? '<div><br></div>' : window.document.documentMode >= 11 ? '<p><br></p>' : '<p>&nbsp;</p>';
			} else {
				_defaultVal = (msie === undefined || msie >= 11)  ? '<' + attrs.taDefaultWrap + '><br></' + attrs.taDefaultWrap + '>' : '<' + attrs.taDefaultWrap + '></' + attrs.taDefaultWrap + '>';
				_defaultTest = (msie === undefined || msie >= 11) ? '<' + attrs.taDefaultWrap + '><br></' + attrs.taDefaultWrap + '>' : '<' + attrs.taDefaultWrap + '>&nbsp;</' + attrs.taDefaultWrap + '>';
			}

			if (!ngModelOptions.$options) {
				ngModelOptions.$options = {};
			}

			_blankTest = _taBlankTest(_defaultTest);

			_ensureContentWrapped = function (value) {

				if (_blankTest(value)) { return value; }

				var domTest = angular.element("<div>" + value + "</div>"),
					_children,
					i = 0,
					_foundBlockElement = false,
					node,
					nodeName,
					text,
					_subVal;

				//console.log('domTest.children().length():', domTest.children().length);
				if (domTest.children().length === 0) {
					value = "<" + attrs.taDefaultWrap + ">" + value + "</" + attrs.taDefaultWrap + ">";
				} else {
					_children = domTest[0].childNodes;

					for (i = 0; i < _children.length; i += 1) {
						if (angular.blockElements[_children[i].nodeName.toLowerCase()]) {
							_foundBlockElement = true;
							break;
						}
					}
					if (!_foundBlockElement) {
						value = "<" + attrs.taDefaultWrap + ">" + value + "</" + attrs.taDefaultWrap + ">";
					}
					else {
						value = "";
						for (i = 0; i < _children.length; i += 1) {
							node = _children[i];
							nodeName = node.nodeName.toLowerCase();

							//console.log('node#:', i, 'name:', nodeName);
							if (nodeName === '#comment') {
								value += '<!--' + node.nodeValue + '-->';
							} else if (nodeName === '#text') {
								// determine if this is all whitespace, if so, we will leave it as it is.
								// otherwise, we will wrap it as it is
								text = node.textContent;
								if (!text.trim()) {
									// just whitespace
									value += text;
								} else {
									// not pure white space so wrap in <p>...</p> or whatever attrs.taDefaultWrap is set to.
									value += "<" + attrs.taDefaultWrap + ">" + text + "</" + attrs.taDefaultWrap + ">";
								}
							} else if (!angular.blockElements[nodeName]) {
								/* istanbul ignore  next: Doesn't seem to trigger on tests */
								_subVal = (node.outerHTML || node.nodeValue);
								/* istanbul ignore else: Doesn't seem to trigger on tests, is tested though */
								if (_subVal.trim() !== '') {
									value += "<" + attrs.taDefaultWrap + ">" + _subVal + "</" + attrs.taDefaultWrap + ">";
								} else {
									value += _subVal;
								}
							} else {
								value += node.outerHTML;
							}
							//console.log(value);
						}
					}
				}
				//console.log(value);
				return value;
			};

			if (attrs.taPaste) { _pasteHandler = $parse(attrs.taPaste); }

			element.addClass('ta-bind');

			scope['$undoManager' + (attrs.id || '')] = ngModel.$undoManager = {
				_stack: [],
				_index: 0,
				_max: 1000,
				push: function (value) {
					if ((value === undefined || value === null) || ((this.current() !== undefined && this.current() !== null) && value === this.current())) { return value; }
					if (this._index < this._stack.length - 1) {
						this._stack = this._stack.slice(0,this._index+1);
					}
					this._stack.push(value);
					if (_undoKeyupTimeout) { $timeout.cancel(_undoKeyupTimeout); }
					if (this._stack.length > this._max) { this._stack.shift(); }
					this._index = this._stack.length - 1;
					return value;
				},
				undo: function () {
					return this.setToIndex(this._index-1);
				},
				redo: function () {
					return this.setToIndex(this._index+1);
				},
				setToIndex: function (index) {
					if (index < 0 || index > this._stack.length - 1) {
						return undefined;
					}
					this._index = index;
					return this.current();
				},
				current: function () {
					return this._stack[this._index];
				}
			};

			_undo = scope['$undoTaBind' + (attrs.id || '')] = function () {
				/* istanbul ignore else: can't really test it due to all changes being ignored as well in readonly */
				if (!_isReadonly && _isContentEditable) {
					var content = ngModel.$undoManager.undo();
					if (content !== undefined && content !== null) {
						_setInnerHTML(content);
						_setViewValue(content, false);
						if (_redoUndoTimeout) { $timeout.cancel(_redoUndoTimeout); }
						_redoUndoTimeout = $timeout(
							function () {
								element[0].focus();
								taSelection.setSelectionToElementEnd(element[0]);
							},
							1,
							false
						);
					}
				}
			};

			_redo = scope['$redoTaBind' + (attrs.id || '')] = function () {
				/* istanbul ignore else: can't really test it due to all changes being ignored as well in readonly */
				if (!_isReadonly && _isContentEditable) {
					var content = ngModel.$undoManager.redo();
					if (content !== undefined && content !== null) {
						_setInnerHTML(content);
						_setViewValue(content, false);
						/* istanbul ignore next */
						if (_redoUndoTimeout) { $timeout.cancel(_redoUndoTimeout); }
						_redoUndoTimeout = $timeout(
							function () {
								element[0].focus();
								taSelection.setSelectionToElementEnd(element[0]);
							},
							1,
							false
						);
					}
				}
			};

			// in here we are undoing the converts used elsewhere to prevent the < > and & being displayed when they shouldn't in the code.
			_compileHtml = function () {
				if (_isContentEditable)	{ return element[0].innerHTML; }
				if (_isInputFriendly)	{ return element.val(); }
				throw ('textAngular Error: attempting to update non-editable taBind');
			};

			_setViewValue = function (_val, triggerUndo, skipRender) {
				_skipRender = skipRender || false;

				if (triggerUndo === undefined || triggerUndo === null) {
					triggerUndo = _isContentEditable ? true : false;
				}

				if (_val === undefined || _val === null) { _val = _compileHtml(); }
				if (_blankTest(_val)) {
					// this avoids us from tripping the ng-pristine flag if we click in and out with out typing
					if (ngModel.$viewValue !== '') {
						ngModel.$setViewValue('');
					}
					if (triggerUndo && ngModel.$undoManager.current() !== '') {
						ngModel.$undoManager.push('');
					}
				} else {
					_reApplyOnSelectorHandlers();
					if (ngModel.$viewValue !== _val) {
						ngModel.$setViewValue(_val);
						if (triggerUndo) {
							ngModel.$undoManager.push(_val);
						}
					}
				}
				ngModel.$render();
			};

			//used for updating when inserting wrapped elements
			scope['updateTaBind' + (attrs.id || '')] = function () {
				if (!_isReadonly) {
					_setViewValue(undefined, undefined, true);
				}
			};

			// catch DOM XSS via taSanitize
			// Sanitizing both ways is identical
			_sanitize = function (unsafe) {
				return (ngModel.$oldViewValue = taSanitize(taFixChrome(unsafe, _keepStyles), ngModel.$oldViewValue, _disableSanitizer));
			};

			// trigger the validation calls
			if (element.attr('required')) {
				ngModel.$validators.required = function (modelValue, viewValue) {
					return !_blankTest(modelValue || viewValue);
				};
			}

			// parsers trigger from the above keyup function or any other time that the viewValue is updated and parses it for storage in the ngModel
			ngModel.$parsers.push(_sanitize);
			ngModel.$parsers.unshift(_ensureContentWrapped);
			// because textAngular is bi-directional (which is awesome) we need to also sanitize values going in from the server
			ngModel.$formatters.push(_sanitize);
			ngModel.$formatters.unshift(_ensureContentWrapped);
			ngModel.$formatters.unshift(function (value) {
				return ngModel.$undoManager.push(value || '');
			});

			//this code is used to update the models when data is entered/deleted
			if (_isInputFriendly) {
				scope.events = {};
				if (!_isContentEditable) {
					// if a textarea or input just add in change and blur handlers, everything else is done by angulars input directive
					element.on('change blur', scope.events.change = scope.events.blur = function () {
						if (!_isReadonly) {
							ngModel.$setViewValue(_compileHtml());
						}
					});

					element.on('keydown', scope.events.keydown = function (event, eventData) {
						var start,
							end,
							value,
							_linebreak,
							_tab;

						if (eventData) { angular.extend(event, eventData); }

						// Reference to http://stackoverflow.com/questions/6140632/how-to-handle-tab-in-textarea
						if (event.keyCode === 9) { // tab was pressed
							// get caret position/selection
							start = this.selectionStart;
							end = this.selectionEnd;
							value = element.val();

							if (event.shiftKey) {
								// find \t
								_linebreak = value.lastIndexOf('\n', start);
								_tab = value.lastIndexOf('\t', start);

								if (_tab !== -1 && _tab >= _linebreak) {
									// set textarea value to: text before caret + tab + text after caret
									element.val(value.substring(0, _tab) + value.substring(_tab + 1));

									// put caret at right position again (add one for the tab)
									this.selectionStart = this.selectionEnd = start - 1;
								}
							} else {
								// set textarea value to: text before caret + tab + text after caret
								element.val(value.substring(0, start) + "\t" + value.substring(end));

								// put caret at right position again (add one for the tab)
								this.selectionStart = this.selectionEnd = start + 1;
							}
							// prevent the focus lose
							event.preventDefault();
						}
					});

					_repeat = function (string, n) {
						var result = '',
							_n = 0;

						for (_n = 0; _n < n; _n += 1) { result += string; }

						return result;
					};

					// add a _forEach function that will work on a NodeList, etc..
					_forEach = function (array, callback, scope) {
						var i = 0;

						for (i = 0; i < array.length; i += 1) {
							callback.call(scope, i, array[i]);
						}
					};

					// handle <ul> or <ol> nodes
					_recursiveListFormat = function (listNode, tablevel) {
						var _html = '',
							_subnodes = listNode.childNodes,
							nodeName;

						tablevel += 1;
						// tab out and add the <ul> or <ol> html piece
						_html += _repeat('\t', tablevel-1) + listNode.outerHTML.substring(0, 4);
						_forEach(_subnodes, function (index, node) {

							nodeName = node.nodeName.toLowerCase();

							if (nodeName === '#comment') {
								_html += '<!--' + node.nodeValue + '-->';
								return;
							}
							if (nodeName === '#text') {
								_html += node.textContent;
								return;
							}
							/* istanbul ignore next: not tested, and this was original code -- so not wanting to possibly cause an issue, leaving it... */
							if (!node.outerHTML) {
								// no html to add
								return;
							}
							if (nodeName === 'ul' || nodeName === 'ol') {
								_html += '\n' + _recursiveListFormat(node, tablevel);
							}
							else {
								// no reformatting within this subnode, so just do the tabing...
								_html += '\n' + _repeat('\t', tablevel) + node.outerHTML;
							}
						});
						// now add on the </ol> or </ul> piece
						_html += '\n' + _repeat('\t', tablevel-1) + listNode.outerHTML.substring(listNode.outerHTML.lastIndexOf('<'));
						return _html;
					};

					ngModel.$formatters.unshift(function (htmlValue) {

						var _nodes = angular.element('<div>' + htmlValue + '</div>')[0].childNodes;

						if (_nodes.length > 0) {
							// do the reformatting of the layout...
							htmlValue = '';
							_forEach(
								_nodes,
								function (index, node) {
									var nodeName = node.nodeName.toLowerCase();

									if (nodeName === '#comment') {
										htmlValue += '<!--' + node.nodeValue + '-->';
										return;
									}
									if (nodeName === '#text') {
										htmlValue += node.textContent;
										return;
									}
									/* istanbul ignore next: not tested, and this was original code -- so not wanting to possibly cause an issue, leaving it... */
									if (!node.outerHTML) {
										// nothing to format!
										return;
									}
									if (htmlValue.length > 0) {
										// we aready have some content, so drop to a new line
										htmlValue += '\n';
									}
									if (nodeName === 'ul' || nodeName === 'ol') {
										// okay a set of list stuff we want to reformat in a nested way
										htmlValue += '' + _recursiveListFormat(node, 0);
									}
									else {
										// just use the original without any additional formating
										htmlValue += '' + node.outerHTML;
									}
								}
							);
						}
						return htmlValue;
					});
				} else {
					_processpaste = function (text) {
						var _isOneNote = text!==undefined? text.match(/content=["']*OneNote.File/i) : false,
							textFragment,
							dom,
							targetDom,
							_list = {
								element: null,
								lastIndent: [],
								lastLi: null,
								isUl: false
							},
							_resetList,
							i = 0,
							tagName,
							el,
							_listMatch,
							isUl,
							_indentMatch,
							indent,
							_levelMatch,
							_unwrapElement,
							_el,
							binds,
							_b = 0,
							_target,
							_c = 0;

                        //console.log(text);
						if (text && text.trim().length) {
							// test paste from word/microsoft product
							if (text.match(/class=["']*Mso(Normal|List)/i) || text.match(/content=["']*Word.Document/i) || text.match(/content=["']*OneNote.File/i)) {
								textFragment = text.match(/<!--StartFragment-->([\s\S]*?)<!--EndFragment-->/i);
								if (!textFragment)	{ textFragment = text; }
								else				{ textFragment = textFragment[1]; }

								textFragment = textFragment.replace(/<o:p>[\s\S]*?<\/o:p>/ig, '').replace(/class=(["']|)MsoNormal(["']|)/ig, '');
								dom = angular.element("<div>" + textFragment + "</div>");

								targetDom = angular.element("<div></div>");

								_list.lastIndent.peek = function () {
									var n = this.length;
									if (n > 0) { return this[n - 1]; }
									return undefined;
								};

								_resetList = function (isUl) {
									_list.isUl = isUl;
									_list.element = angular.element(isUl ? "<ul>" : "<ol>");
									_list.lastIndent = [];
									_list.lastIndent.peek = function () {
										var n = this.length;
										if (n > 0) { return this[n - 1]; }
										return undefined;
									};
									_list.lastLevelMatch = null;
								};

								for (i = 0; i <= dom[0].childNodes.length; i += 1) {

									if (!dom[0].childNodes[i] || dom[0].childNodes[i].nodeName === "#text") {
										continue;
									} else {
										tagName = dom[0].childNodes[i].tagName.toLowerCase();
										if (
											tagName !== 'p' &&
											tagName !== 'h1' &&
											tagName !== 'h2' &&
											tagName !== 'h3' &&
											tagName !== 'h4' &&
											tagName !== 'h5' &&
											tagName !== 'h6' &&
											tagName !== 'table') {
											continue;
										}
									}

									el = angular.element(dom[0].childNodes[i]);
									_listMatch = (el.attr('class') || '').match(/MsoList(Bullet|Number|Paragraph)(CxSp(First|Middle|Last)|)/i);

									if (_listMatch) {

										if (el[0].childNodes.length < 2 || el[0].childNodes[1].childNodes.length < 1) {
											continue;
										}

										isUl = _listMatch[1].toLowerCase() === 'bullet' || (_listMatch[1].toLowerCase() !== "number" && !(/^[^0-9a-z<]*[0-9a-z]+[^0-9a-z<>]</i.test(el[0].childNodes[1].innerHTML) || /^[^0-9a-z<]*[0-9a-z]+[^0-9a-z<>]</i.test(el[0].childNodes[1].childNodes[0].innerHTML)));
										_indentMatch = (el.attr('style') || '').match(/margin-left:([\-\.0-9]*)/i);
										indent = parseFloat((_indentMatch)?_indentMatch[1]:0);
										_levelMatch = (el.attr('style') || '').match(/mso-list:l([0-9]+) level([0-9]+) lfo[0-9+]($|;)/i);
										// prefers the mso-list syntax

										if (_levelMatch && _levelMatch[2]) {
											indent = parseInt(_levelMatch[2], 10); 
										}
										if ((_levelMatch && (!_list.lastLevelMatch || _levelMatch[1] !== _list.lastLevelMatch[1])) || !_listMatch[3] || _listMatch[3].toLowerCase() === 'first' || (_list.lastIndent.peek() === null) || (_list.isUl !== isUl && _list.lastIndent.peek() === indent)) {
											_resetList(isUl);
											targetDom.append(_list.element);
										} else if (_list.lastIndent.peek() != null && _list.lastIndent.peek() < indent) {
											_list.element = angular.element(isUl ? '<ul>' : '<ol>');
											_list.lastLi.append(_list.element);
										} else if (_list.lastIndent.peek() != null && _list.lastIndent.peek() > indent) {
											while(_list.lastIndent.peek() != null && _list.lastIndent.peek() > indent) {
												if (_list.element.parent()[0].tagName.toLowerCase() === 'li') {
													_list.element = _list.element.parent();
													continue;
												} else if (/[uo]l/i.test(_list.element.parent()[0].tagName.toLowerCase())) {
													_list.element = _list.element.parent();
												} else { // else it's it should be a sibling
													break;
												}
												_list.lastIndent.pop();
											}
											_list.isUl = _list.element[0].tagName.toLowerCase() === 'ul';
											if (isUl !== _list.isUl) {
												_resetList(isUl);
												targetDom.append(_list.element);
											}
										}

										_list.lastLevelMatch = _levelMatch;
										if (indent !== _list.lastIndent.peek()) { _list.lastIndent.push(indent); }
										_list.lastLi = angular.element('<li>');
										_list.element.append(_list.lastLi);
										_list.lastLi.html(el.html().replace(/<!(--|)\[if !supportLists\](--|)>[\s\S]*?<!(--|)\[endif\](--|)>/ig, ''));
										el.remove();
									} else {
										_resetList(false);
										targetDom.append(el);
									}
								}

								_unwrapElement = function (node) {
									var _n;

									node = angular.element(node);

									for (_n = node[0].childNodes.length - 1; _n >= 0; _n -= 1) {
										node.after(node[0].childNodes[_n]);
									}

									node.remove();
								};

								angular.forEach(targetDom.find('span'), function (node) {
									node.removeAttribute('lang');
									if (node.attributes.length <= 0) { _unwrapElement(node); }
								});

								angular.forEach(targetDom.find('font'), _unwrapElement);

                                text = targetDom.html();
                                if (_isOneNote) {
                                    text = targetDom.html() || dom.html();
                                }
								// LF characters instead of spaces in some spots and they are replaced by "/n", so we need to just swap them to spaces
								text = text.replace(/\n/g, ' ');
							} else {
								// remove unnecessary chrome insert
								text = text.replace(/<(|\/)meta[^>]*?>/ig, '');

								if (text.match(/<[^>]*?(ta-bind)[^>]*?>/)) {
									// entire text-angular or ta-bind has been pasted, REMOVE AT ONCE!!
									if (text.match(/<[^>]*?(text-angular)[^>]*?>/)) {

										_el = angular.element('<div>' + text + '</div>');
										_el.find('textarea').remove();

										binds = taDOM.getByAttribute(_el, 'ta-bind');
										for (_b = 0; _b < binds.length; _b += 1) {
											_target = binds[_b][0].parentNode.parentNode;
											for (_c = 0; _c < binds[_b][0].childNodes.length; _c += 1) {
												_target.parentNode.insertBefore(binds[_b][0].childNodes[_c], _target);
											}
											_target.parentNode.removeChild(_target);
										}
										text = _el.html().replace('<br class="Apple-interchange-newline">', '');
									}
								} else if (text.match(/^<span/)) {
									// in case of pasting only a span - chrome paste, remove them. THis is just some wierd formatting
									// if we remove the '<span class="Apple-converted-space"> </span>' here we destroy the spacing
									// on paste from even ourselves!
									if (!text.match(/<span class=(\"Apple-converted-space\"|\'Apple-converted-space\')>.<\/span>/ig)) {
										text = text.replace(/<(|\/)span[^>]*?>/ig, '');
									}
								}
								// Webkit on Apple tags
								text = text.replace(/<br class="Apple-interchange-newline"[^>]*?>/ig, '').replace(/<span class="Apple-converted-space">( |&nbsp;)<\/span>/ig, '&nbsp;');
							}

							if (/<li(\s.*)?>/i.test(text) && /(<ul(\s.*)?>|<ol(\s.*)?>).*<li(\s.*)?>/i.test(text) === false) {
								// insert missing parent of li element
								text = text.replace(/<li(\s.*)?>.*<\/li(\s.*)?>/i, '<ul>$&</ul>');
							}

							// parse whitespace from plaintext input, starting with preceding spaces that get stripped on paste
							text = text.replace(/^[ |\u00A0]+/gm, function (match) {
								var result = '',
									i = 0;

								for (i = 0; i < match.length; i += 1) {
									result += '&nbsp;';
								}

								return result;
							}).replace(/\n|\r\n|\r/g, '<br />').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');

							if (_pasteHandler) { text = _pasteHandler(scope, {$html: text}) || text; }

							// turn span vertical-align:super into <sup></sup>
							text = text.replace(/<span style=("|')([^<]*?)vertical-align\s*:\s*super;?([^>]*?)("|')>([^<]+?)<\/span>/g, "<sup style='$2$3'>$5</sup>");

							text = taSanitize(text, '', _disableSanitizer);

							taSelection.insertHtml(text, element[0]);

							$timeout(
								function () {
									ngModel.$setViewValue(_compileHtml());
									_processingPaste = false;
									element.removeClass('processing-paste');
								},
								0,
								false
							);
						} else {
							_processingPaste = false;
							element.removeClass('processing-paste');
						}
					};

					element.on('paste', scope.events.paste = function (evt, eventData) {
						var pastedContent,
							clipboardData,
							_types = '',
							_t = 0,
							_savedSelection,
							_tempDiv;

						if (eventData) { angular.extend(evt, eventData); }

						if (_isReadonly || _processingPaste) {
							evt.stopPropagation();
							evt.preventDefault();
							return false;
						}

						// Code adapted from http://stackoverflow.com/questions/2176861/javascript-get-clipboard-data-on-paste-event-cross-browser/6804718#6804718
						_processingPaste = true;
						element.addClass('processing-paste');

						clipboardData = (evt.originalEvent || evt).clipboardData;

                        if (!clipboardData && window.clipboardData && window.clipboardData.getData) {
                            pastedContent = window.clipboardData.getData("Text");
                            processpaste(pastedContent);
                            e.stopPropagation();
                            e.preventDefault();
                            return false;
                        }

						if (clipboardData && clipboardData.getData && clipboardData.types.length > 0) {

							for (_t = 0; _t < clipboardData.types.length; _t += 1) {
								_types += " " + clipboardData.types[_t];
							}

							if (/text\/html/i.test(_types)) {
								pastedContent = clipboardData.getData('text/html');
							} else if (/text\/plain/i.test(_types)) {
								pastedContent = clipboardData.getData('text/plain');
							}

							_processpaste(pastedContent);

							evt.stopPropagation();
							evt.preventDefault();

							return false;
						}

						_savedSelection = rangy.core.saveSelection();
						_tempDiv = angular.element('<div class="ta-hidden-input" contenteditable="true"></div>');

						$document.find('body').append(_tempDiv);
						_tempDiv[0].focus();

						$timeout(
							function () {
								// restore selection
								rangy.core.restoreSelection(_savedSelection);
								_processpaste(_tempDiv[0].innerHTML);
								element[0].focus();
								_tempDiv.remove();
							},
							0,
							false
						);

						return false;
					});

					element.on('cut', scope.events.cut = function (evt) {
						// timeout to next is needed as otherwise the paste/cut event has not finished actually changing the display
						if (!_isReadonly) {
							$timeout(
								function () { ngModel.$setViewValue(_compileHtml()); },
								0,
								false
							);
						} else { evt.preventDefault(); }
					});

					element.on('keydown', scope.events.keydown = function (event, eventData) {
						var userSpecialKey,
							contains,
							$selection,
							selection,
							_new,
							_moveOutsideElements,
							_parent;

						if (eventData) {
							angular.extend(event, eventData);
						}

						if (event.keyCode === _SHIFT_KEYCODE) {
                            taSelection.setStateShiftKey(true);
                        } else {
                            taSelection.setStateShiftKey(false);
                        }

						event.specialKey = _mapKeys(event);

						ng.textng.setup.options.keyMappings.forEach(
							function (mapping) {
								if (event.specialKey === mapping.commandKeyCode) {
									// ng.textng.setup.options has remapped this binding... so
									// we disable our own
									event.specialKey = undefined;
								}
								if (mapping.testForKey(event)) {
									userSpecialKey = mapping.commandKeyCode;
								}
								if ((mapping.commandKeyCode === 'UndoKey') || (mapping.commandKeyCode === 'RedoKey')) {
									// this is necessary to fully stop the propagation.
									if (!mapping.enablePropagation) {
										event.preventDefault();
									}
								}
							}
						);

						if (typeof userSpecialKey !== 'undefined') {
							event.specialKey = userSpecialKey;
						}

						if ((typeof event.specialKey !== 'undefined') && (
								event.specialKey !== 'UndoKey' || event.specialKey !== 'RedoKey'
							)) {
							event.preventDefault();
							textAngularManager.sendKeyCommand(scope, event);
						}

						if (!_isReadonly) {
							if (event.specialKey==='UndoKey') {
								_undo();
								event.preventDefault();
							}
							if (event.specialKey==='RedoKey') {
								_redo();
								event.preventDefault();
							}

							if (event.keyCode === _ENTER_KEYCODE && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {

								contains = function (a, obj) {
									for (var i = 0; i < a.length; i += 1) {
										if (a[i] === obj) {
											return true;
										}
									}
									return false;
								};

								selection = taSelection.getSelectionElement();

								if (!angular.validElements[selection.tagName.toLowerCase()]) { return; }

								_new = angular.element(_defaultVal);
								// if we are in the last element of a blockquote, or ul or ol and the element is blank
								// we need to pull the element outside of the said type
								_moveOutsideElements = ['blockquote', 'ul', 'ol'];

								if (contains(_moveOutsideElements, selection.parentNode.tagName.toLowerCase())) {
									if (/^<br(|\/)>$/i.test(selection.innerHTML.trim()) && !selection.nextSibling) {
										// if last element is blank, pull element outside.
										$selection = angular.element(selection);
										_parent = $selection.parent();
										_parent.after(_new);
										$selection.remove();

										if (_parent.children().length === 0) { _parent.remove(); }

										taSelection.setSelectionToElementStart(_new[0]);
										event.preventDefault();
									}
									if (/^<[^>]+><br(|\/)><\/[^>]+>$/i.test(selection.innerHTML.trim())) {
										$selection = angular.element(selection);
										$selection.after(_new);
										$selection.remove();
										taSelection.setSelectionToElementStart(_new[0]);
										event.preventDefault();
									}
								}
							}
						}
					});

					element.on('keyup', scope.events.keyup = function (event, eventData) {
						var _selection,
							_new,
							_val,
							_triggerUndo,
							tagName,
							ps;

						if (eventData) { angular.extend(event, eventData); }

						taSelection.setStateShiftKey(false);	// clear the ShiftKey state

						if (event.keyCode === _TAB_KEYCODE) {
							_selection = taSelection.getSelection();
							if (_selection.start.element === element[0] && element.children().length) {
								taSelection.setSelectionToElementStart(element.children()[0]);
							}
							return;
						}
						// we do this here during the 'keyup' so that the browser has already moved the slection by one character...
						if (event.keyCode === _LEFT_ARROW_KEYCODE && !event.shiftKey) {
							taSelection.updateLeftArrowKey(element);
						}
						// we do this here during the 'keyup' so that the browser has already moved the slection by one character...
						if (event.keyCode === _RIGHT_ARROW_KEYCODE && !event.shiftKey) {
							taSelection.updateRightArrowKey(element);
						}
						if (_undoKeyupTimeout) {
							$timeout.cancel(_undoKeyupTimeout);
						}
						if (!_isReadonly && !BLOCKED_KEYS.test(event.keyCode)) {

							if (event.keyCode === _ENTER_KEYCODE && (event.ctrlKey || event.metaKey || event.altKey)) {

							} else {

								if (_defaultVal !== '' && _defaultVal !== '<br><br>' && event.keyCode === _ENTER_KEYCODE && !event.ctrlKey && !event.metaKey && !event.altKey) {
									_selection = taSelection.getSelectionElement();

									while(!angular.validElements[_selection.nodeName.toLowerCase()] && _selection !== element[0]) {
										_selection = _selection.parentNode;
									}

									if (!event.shiftKey) {
										if (_selection.tagName.toLowerCase() !==
											attrs.taDefaultWrap &&
											_selection.nodeName.toLowerCase() !== 'li' &&
											(_selection.innerHTML.trim() === '' || _selection.innerHTML.trim() === '<br>')
										) {
											// Chrome starts with a <div><br></div> after an EnterKey
											// so we replace this with the _defaultVal
											_new = angular.element(_defaultVal);
											angular.element(_selection).replaceWith(_new);
											taSelection.setSelectionToElementStart(_new[0]);
										}
									} else {
										// shift + Enter
										tagName = _selection.tagName.toLowerCase();

										if ((tagName === attrs.taDefaultWrap ||
											tagName === 'li' ||
											tagName === 'pre' ||
											tagName === 'div') &&
											!/.+<br><br>/.test(_selection.innerHTML.trim())) {
											ps = _selection.previousSibling;

											if (ps) {
												ps.innerHTML = ps.innerHTML + '<br><br>';
												angular.element(_selection).remove();
												taSelection.setSelectionToElementEnd(ps);
											}
										}
									}
								}

								_val = _compileHtml();

								if (_defaultVal !== '' && (_val.trim() === '' || _val.trim() === '<br>')) {
									_setInnerHTML(_defaultVal);
									taSelection.setSelectionToElementStart(element.children()[0]);
								} else if (_val.substring(0, 1) !== '<' && attrs.taDefaultWrap !== '') {
									// do nothing
								}

								_triggerUndo = _lastKey !== event.keyCode && UNDO_TRIGGER_KEYS.test(event.keyCode);

								if(_keyupTimeout) {
									$timeout.cancel(_keyupTimeout);
								}

								_keyupTimeout = $timeout(
									function () {
										_setViewValue(_val, _triggerUndo, true);
									},
									ngModelOptions.$options.debounce || 400,
									false
								);

								if (!_triggerUndo) {
									_undoKeyupTimeout = $timeout(
										function () { ngModel.$undoManager.push(_val); },
										250,
										false
									);
								}

								_lastKey = event.keyCode;
							}
						}
					});

					element.on(
						'input',
						function () {
							if (_compileHtml() !== ngModel.$viewValue) {
								if(_inputTimeout) { $timeout.cancel(_inputTimeout); }

								_inputTimeout = $timeout(
									function () {
										var _savedSelection = rangy.core.saveSelection(),
											_val = _compileHtml();

										if (_val !== ngModel.$viewValue) {
											_setViewValue(_val, true);
										}

										if (ngModel.$viewValue.length !== 0) {
											rangy.core.restoreSelection(_savedSelection);
										}
									},
									1000,
									false
								);
							}
						}
					);

					element.on('blur', scope.events.blur = function () {
						_focussed = false;
						if (!_isReadonly) {
							_setViewValue(undefined, undefined, true);
						} else {
							_skipRender = true; // don't redo the whole thing, just check the placeholder logic
							ngModel.$render();
						}
					});

					// Placeholders not supported on ie 8 and below
					if (attrs.placeholder && (msie > 8 || msie === undefined)) {
						if (attrs.id) {
							_rule = ng.textng.core.add_css_rule('#' + attrs.id + '.placeholder-text:before', 'content: "' + attrs.placeholder + '"');
						} else {
							throw('textAngular Error: An unique ID is required for placeholders to work');
						}

						scope.$on('$destroy', function () {
							ng.textng.core.remove_css_rule(_rule);
						});
					}

					element.on('focus', scope.events.focus = function () {
						_focussed = true;
						element.removeClass('placeholder-text');
						_reApplyOnSelectorHandlers();
					});

					element.on('mouseup', scope.events.mouseup = function () {
						var _selection = taSelection.getSelection();

						if (_selection.start.element === element[0] && element.children().length) {
							taSelection.setSelectionToElementStart(element.children()[0]);
						}
					});

					// prevent propagation on mousedown in editor, see #206
					element.on('mousedown', scope.events.mousedown = function (event, eventData) {
						if (eventData) { angular.extend(event, eventData); }
						event.stopPropagation();
					});
				}
			}

			_selectorClickHandler = function (event) {
				// emit the element-select event, pass the element
				scope.$emit('ta-element-select', this);
				event.preventDefault();
				return false;
			};

			_fileDropHandler = function (event, eventData) {
				var dataTransfer;

				if (eventData) { angular.extend(event, eventData); }
				// emit the drop event, pass the element, preventing should be done elsewhere
				if (!ng.textng.core.dropFired && !_isReadonly) {
					ng.textng.core.dropFired = true;
					if (event.originalEvent)	{ dataTransfer = event.originalEvent.dataTransfer; }
					else						{ dataTransfer = event.dataTransfer; }

					scope.$emit('ta-drop-event', this, event, dataTransfer);

					$timeout(
						function () {
							ng.textng.core.dropFired = false;
							_setViewValue(undefined, undefined, true);
						},
						100,
						false
					);
				}
			};

			//used for updating when inserting wrapped elements
			_reApplyOnSelectorHandlers = scope['reApplyOnSelectorHandlers' + (attrs.id || '')] = function () {
				if (!_isReadonly) {
					angular.forEach(
						ng.textng.setup.tools.selectable_elements,
						function (selector) {
							// check we don't apply the handler twice
							element.find(selector)
								.off('click', _selectorClickHandler)
								.on('click', _selectorClickHandler);
						}
					);
				}
			};

			// changes to the model variable from outside the html/text inputs
			ngModel.$render = function () {
				var val = '';

				if (_renderInProgress)	{ return; }
				else					{ _renderInProgress = true; }

				// catch model being null or undefined
				val = ngModel.$viewValue || '';

				// if the editor isn't focused it needs to be updated, otherwise it's receiving user input
				if (!_skipRender) {
					/* istanbul ignore else: in other cases we don't care */
					if (_isContentEditable && _focussed) {
						// update while focussed
						element.removeClass('placeholder-text');
						if (_renderTimeout) { $timeout.cancel(_renderTimeout); }

						_renderTimeout = $timeout(
							function () {
								if (!_focussed) {
									element[0].focus();
									taSelection.setSelectionToElementEnd(element.children()[element.children().length - 1]);
								}
								_renderTimeout = undefined;
							},
							1,
							false
						);
					}

					if (_isContentEditable) {
						// WYSIWYG Mode
						if (attrs.placeholder) {
							if (val === '') {
								// blank
								_setInnerHTML(_defaultVal);
							} else {
								// not-blank
								_setInnerHTML(val);
							}
						} else {
							_setInnerHTML((val === '') ? _defaultVal : val);
						}

						// if in WYSIWYG and readOnly we kill the use of links by clicking
						if (!_isReadonly) {
							_reApplyOnSelectorHandlers();
							element.on('drop', _fileDropHandler);
						} else {
							element.off('drop', _fileDropHandler);
						}
					} else if (element[0].tagName.toLowerCase() !== 'textarea' && element[0].tagName.toLowerCase() !== 'input') {
						// make sure the end user can SEE the html code as a display. This is a read-only display element
						_setInnerHTML(taApplyCustomRenderers(val));
					} else {
						// only for input and textarea inputs
						element.val(val);
					}
				}

				if (_isContentEditable && attrs.placeholder) {
					if (val === '') {
						if (_focussed)	{ element.removeClass('placeholder-text'); }
						else			{ element.addClass('placeholder-text'); }
					} else {
						element.removeClass('placeholder-text');
					}
				}
				_renderInProgress = _skipRender = false;
			};

			if (attrs.taReadonly) {
				//set initial value
				_isReadonly = scope.$eval(attrs.taReadonly);

				if (_isReadonly) {
					element.addClass('ta-readonly');
					// we changed to readOnly mode (taReadonly='true')
					if (element[0].tagName.toLowerCase() === 'textarea' || element[0].tagName.toLowerCase() === 'input') {
						element.attr('disabled', 'disabled');
					}
					if (element.attr('contenteditable') !== undefined && element.attr('contenteditable')) {
						element.removeAttr('contenteditable');
					}
				} else {
					element.removeClass('ta-readonly');
					// we changed to NOT readOnly mode (taReadonly='false')
					if (element[0].tagName.toLowerCase() === 'textarea' || element[0].tagName.toLowerCase() === 'input') {
						element.removeAttr('disabled');
					} else if (_isContentEditable) {
						element.attr('contenteditable', 'true');
					}
				}
				// taReadonly only has an effect if the taBind element is an input or textarea or has contenteditable='true' on it.
				// Otherwise it is readonly by default
				scope.$watch(
					attrs.taReadonly,
					function (newVal, oldVal) {
						if (oldVal === newVal) { return; }

						if (newVal) {
							element.addClass('ta-readonly');
							// we changed to readOnly mode (taReadonly='true')
							if (element[0].tagName.toLowerCase() === 'textarea' || element[0].tagName.toLowerCase() === 'input') {
								element.attr('disabled', 'disabled');
							}
							if (element.attr('contenteditable') !== undefined && element.attr('contenteditable')) {
								element.removeAttr('contenteditable');
							}
							// turn ON selector click handlers
							angular.forEach(
								ng.textng.setup.tools.selectable_elements,
								function (selector) {
									element.find(selector).on('click', _selectorClickHandler);
								}
							);

							element.off('drop', _fileDropHandler);
						} else {
							element.removeClass('ta-readonly');
							// we changed to NOT readOnly mode (taReadonly='false')
							if (element[0].tagName.toLowerCase() === 'textarea' || element[0].tagName.toLowerCase() === 'input') {
								element.removeAttr('disabled');
							} else if (_isContentEditable) {
								element.attr('contenteditable', 'true');
							}
							// remove the selector click handlers
							angular.forEach(
								ng.textng.setup.tools.selectable_elements,
								function (selector) {
									element.find(selector).off('click', _selectorClickHandler);
								}
							);
							element.on('drop', _fileDropHandler);
						}
						_isReadonly = newVal;
					}
				);
			}

			// Initialise the selectableElements
			// if in WYSIWYG and readOnly we kill the use of links by clicking
			if (_isContentEditable && !_isReadonly) {
				angular.forEach(
					ng.textng.setup.tools.selectable_elements,
					function (selector) {
						element.find(selector).on('click', _selectorClickHandler);
					}
				);

				element.on('drop', _fileDropHandler);
			}
		}
	};
}]);

textAngular.config(
	[function () {
		msos.console.debug('ng.textng.core - config -> called.');

		// clear taTools variable. Just catches testing and any other time that this config may run multiple times...
		angular.forEach(
			ng.textng.setup.tools,
			function (value, key) {
				delete ng.textng.setup.tools[key];
			}
		);
	}]
);

textAngular.directive(
	"textAngular",
	['$compile', '$timeout', 'taSelection', 'taExecCommand',
	 'textAngularManager', '$document', '$animate', '$q', '$parse',
	function ($compile, $timeout, taSelection, taExecCommand,
		textAngularManager, $document, $animate, $q, $parse) {
		"use strict";

		var temp_td = 'ng.textng.core - textAngularDir';

		msos.console.debug(temp_td + ' -> called.');

		return {
			require: '?ngModel',
			scope: {},
			restrict: "EA",
			priority: 2, // So we override validators correctly
			link: function (scope, element, attrs, ngModel) {
				// all these vars should not be accessable outside this directive
				var oneEvent,
					isScrollable,
					_keydown,
					_keyup,
					_keypress,
					_mouseup,
					_focusin,
					_focusout,
					_originalContents,
					_toolbars,
					_toolbar,
					_serial = (attrs.serial) ? attrs.serial : Math.floor(Math.random() * 10000000000000000),
					_taExecCommand,
					_resizeMouseDown,
					_updateSelectedStylesTimeout,
					_savedSelection,
					_firstRun,
					_resizeTimeout,
					testAndSet;

				msos.console.debug(temp_td + ' - link -> start.');

				scope._name = (attrs.name) ? attrs.name : 'textAngularEditor' + _serial;

				oneEvent = function (_element, event, action) {
					$timeout(
						function () {
							_element.one(event, action);
						},
						100,
						false
					);
				};

				_taExecCommand = taExecCommand(attrs.taDefaultWrap);
				// get the settings from the defaults and add our specific functions that need to be on the scope
				angular.extend(
					scope,
					angular.copy(ng.textng.setup.options),
					{
						// wraps the selection in the provided tag / execCommand function. Should only be called in WYSIWYG mode.
						wrapSelection: function (command, opt, isSelectableElementTool) {
							if (command.toLowerCase() === "undo") {
								scope['$undoTaBindtaTextElement' + _serial]();
							} else if (command.toLowerCase() === "redo") {
								scope['$redoTaBindtaTextElement' + _serial]();
							} else {
								// catch errors like FF erroring when you try to force an undo with nothing done
								_taExecCommand(command, false, opt, scope.defaultTagAttributes);
								if (isSelectableElementTool) {
									// re-apply the selectable tool events
									scope['reApplyOnSelectorHandlerstaTextElement' + _serial]();
								}
								// refocus on the shown display element, this fixes a display bug when using :focus styles to outline the box.
								// You still have focus on the text/html input it just doesn't show up
								scope.displayElements.text[0].focus();
							}
						},
						showHtml: scope.$eval(attrs.taShowHtml) || false
					}
				);

				// setup the options from the optional attributes
				if (attrs.taFocussedClass)				{ scope.classes.focussed = attrs.taFocussedClass; }
				if (attrs.taTextEditorClass)			{ scope.classes.textEditor = attrs.taTextEditorClass; }
				if (attrs.taHtmlEditorClass)			{ scope.classes.htmlEditor = attrs.taHtmlEditorClass; }

				if (attrs.taDefaultTagAttributes) {
					try	{
						//	TODO: This should use angular.merge to enhance functionality once angular 1.4 is required
						angular.extend(
							scope.defaultTagAttributes,
							angular.fromJson(attrs.taDefaultTagAttributes)
						);
					} catch (error) {
						msos.console.warn(temp_td + ' - link -> failed:', error);
					}
				}
				// optional setup functions
				if (attrs.taTextEditorSetup)	{ scope.setup.textEditorSetup = scope.$parent.$eval(attrs.taTextEditorSetup); }
				if (attrs.taHtmlEditorSetup)	{ scope.setup.htmlEditorSetup = scope.$parent.$eval(attrs.taHtmlEditorSetup); }
				// optional _fileDropHandler function
				if (attrs.taFileDrop)			{ scope.fileDropHandler = scope.$parent.$eval(attrs.taFileDrop); }
				else							{ scope.fileDropHandler = scope.defaultFileDropHandler; }

				_originalContents = element[0].innerHTML;
				// clear the original content
				element[0].innerHTML = '';

				// Setup the HTML elements as variable references for use later
				scope.displayElements = {
					// we still need the hidden input even with a textarea as the textarea may have invalid/old input in it,
					// wheras the input will ALLWAYS have the correct value.
					forminput: angular.element("<input type='hidden' tabindex='-1' style='display: none;'>"),
					html: angular.element("<textarea></textarea>"),
					text: angular.element("<div></div>"),
					// other toolbased elements
					scrollWindow: angular.element("<div class='ta-scroll-window'></div>"),
					popover: angular.element('<div class="popover fade bottom" style="max-width: none; width: 305px;"></div>'),
					popoverArrow: angular.element('<div class="arrow"></div>'),
					popoverContainer: angular.element('<div class="popover-content"></div>'),
					resize: {
						overlay: angular.element('<div class="ta-resizer-handle-overlay"></div>'),
						background: angular.element('<div class="ta-resizer-handle-background"></div>'),
						anchors: [
							angular.element('<div class="ta-resizer-handle-corner ta-resizer-handle-corner-tl"></div>'),
							angular.element('<div class="ta-resizer-handle-corner ta-resizer-handle-corner-tr"></div>'),
							angular.element('<div class="ta-resizer-handle-corner ta-resizer-handle-corner-bl"></div>'),
							angular.element('<div class="ta-resizer-handle-corner ta-resizer-handle-corner-br"></div>')
						],
						info: angular.element('<div class="ta-resizer-handle-info"></div>')
					}
				};

				// Setup the popover
				scope.displayElements.popover.append(scope.displayElements.popoverArrow);
				scope.displayElements.popover.append(scope.displayElements.popoverContainer);
				scope.displayElements.scrollWindow.append(scope.displayElements.popover);

				scope.displayElements.popover.on(
					'mousedown',
					function (evt, eventData) {
						if (eventData) { angular.extend(evt, eventData); }
						// this prevents focusout from firing on the editor when clicking anything in the popover
						evt.preventDefault();
						return false;
					}
				);

				scope.handlePopoverEvents = function () {
					if (scope.displayElements.popover.css('display') === 'block') {
						if (_resizeTimeout) { $timeout.cancel(_resizeTimeout); }

						_resizeTimeout = $timeout(
							function () {
								//console.log('resize', scope.displayElements.popover.css('display'));
								scope.reflowPopover(scope.resizeElement);
								scope.reflowResizeOverlay(scope.resizeElement);
							},
							100,
							false
						);
					}
				};

				angular.element(window).on('resize', scope.handlePopoverEvents);
				angular.element(window).on('scroll', scope.handlePopoverEvents);

				isScrollable = function (node) {
					var cs,
						_notScrollable = {
							vertical: false,
							horizontal: false,
						},
						overflowY,
						overflowX;

					try {
						cs = window.getComputedStyle(node);
						if (cs === null) {
							return _notScrollable;
						}
					} catch (e) {
						return _notScrollable;
					}

					overflowY = cs['overflow-y'];
					overflowX = cs['overflow-x'];

					return {
						vertical: (overflowY === 'scroll' || overflowY === 'auto') &&
									node.scrollHeight > node.clientHeight,
						horizontal: (overflowX === 'scroll' || overflowX === 'auto') &&
						    		node.scrollWidth > node.clientWidth,
					};
				};

				scope.getScrollTop = function (_el, bAddListener) {
					var scrollTop = _el.scrollTop;

					if (typeof scrollTop === 'undefined') {
						scrollTop = 0;
					}

					if (bAddListener && isScrollable(_el).vertical) {
						// remove element eventListener
						_el.removeEventListener('scroll', scope._scrollListener, false);
						   _el.addEventListener('scroll', scope._scrollListener, false);
					}

					if (scrollTop !== 0) {
						return { node: _el.nodeName, top: scrollTop };
					}

					if (_el.parentNode) {
						return scope.getScrollTop(_el.parentNode, bAddListener);
					} else {
						return { node: '<none>', top: 0 };
					}
				};

				// define the popover show and hide functions
				scope.showPopover = function (_el) {
					scope.getScrollTop(scope.displayElements.scrollWindow[0], true);
					scope.displayElements.popover.css('display', 'block');

					$timeout(
						function () {
							scope.displayElements.resize.overlay.css('display', 'block');
						},
						0,
						false
					);

					scope.resizeElement = _el;
					scope.reflowPopover(_el);
					$animate.addClass(scope.displayElements.popover, 'in');
					oneEvent($document.find('body'), 'click keyup', function () { scope.hidePopover();} );
				};

				scope._scrollListener = function (){
					scope.handlePopoverEvents();
				};

				scope.reflowPopover = function (_el) {
					var scrollTop = scope.getScrollTop(scope.displayElements.scrollWindow[0], false),
						spaceAboveImage = _el[0].offsetTop-scrollTop.top,
						_maxLeft,
						_targetLeft,
						_rleft,
						_marginLeft;

					if (spaceAboveImage < 51) {
						scope.displayElements.popover.css('top', _el[0].offsetTop + _el[0].offsetHeight + scope.displayElements.scrollWindow[0].scrollTop + 'px');
						scope.displayElements.popover.removeClass('top').addClass('bottom');
					} else {
						scope.displayElements.popover.css('top', _el[0].offsetTop - 54 + scope.displayElements.scrollWindow[0].scrollTop + 'px');
						scope.displayElements.popover.removeClass('bottom').addClass('top');
					}

					_maxLeft = scope.displayElements.text[0].offsetWidth - scope.displayElements.popover[0].offsetWidth;
					_targetLeft = _el[0].offsetLeft + (_el[0].offsetWidth / 2.0) - (scope.displayElements.popover[0].offsetWidth / 2.0);
					_rleft = Math.max(0, Math.min(_maxLeft, _targetLeft));
					_marginLeft = (Math.min(_targetLeft, (Math.max(0, _targetLeft - _maxLeft))) - 11);

					_rleft += window.scrollX;
					_marginLeft -= window.scrollX;

					scope.displayElements.popover.css('left', _rleft + 'px');
					scope.displayElements.popoverArrow.css('margin-left', _marginLeft + 'px');
				};

				scope.hidePopover = function () {
					scope.displayElements.popover.css('display', 'none');
					scope.displayElements.popoverContainer.attr('style', '');
					scope.displayElements.popoverContainer.attr('class', 'popover-content');
					scope.displayElements.popover.removeClass('in');
					scope.displayElements.resize.overlay.css('display', 'none');
				};

				// setup the resize overlay
				scope.displayElements.resize.overlay.append(scope.displayElements.resize.background);
				angular.forEach(
					scope.displayElements.resize.anchors,
					function (anchor) { scope.displayElements.resize.overlay.append(anchor);}
				);

				scope.displayElements.resize.overlay.append(scope.displayElements.resize.info);
				scope.displayElements.scrollWindow.append(scope.displayElements.resize.overlay);
				scope.displayElements.resize.background.on('click', function () {
					scope.displayElements.text[0].focus();
				});

				// define the show and hide events
				scope.reflowResizeOverlay = function (_el) {
					_el = angular.element(_el)[0];
					scope.displayElements.resize.overlay.css({
						'display': 'block',
						'left': _el.offsetLeft - 5 + 'px',
						'top': _el.offsetTop - 5 + 'px',
						'width': _el.offsetWidth + 10 + 'px',
						'height': _el.offsetHeight + 10 + 'px'
					});
					scope.displayElements.resize.info.text(_el.offsetWidth + ' x ' + _el.offsetHeight);
				};

				scope.showResizeOverlay = function (_el) {
					var _body = $document.find('body');

					_resizeMouseDown = function (event) {
						var startPosition = {
								width: parseInt(_el.attr('width'), 10),
								height: parseInt(_el.attr('height'), 10),
								x: event.clientX,
								y: event.clientY
							},
							ratio,
							mousemove;

						if (startPosition.width === undefined || isNaN(startPosition.width))	{ startPosition.width  = _el[0].offsetWidth; }
						if (startPosition.height === undefined || isNaN(startPosition.height))	{ startPosition.height = _el[0].offsetHeight; }

						scope.hidePopover();

						ratio = startPosition.height / startPosition.width;

						mousemove = function (event) {
							// calculate new size
							var pos = {
									x: Math.max(0, startPosition.width  + (event.clientX - startPosition.x)),
									y: Math.max(0, startPosition.height + (event.clientY - startPosition.y))
								},
								bForceAspectRatio = (attrs.taResizeForceAspectRatio !== undefined),
								bFlipKeyBinding = attrs.taResizeMaintainAspectRatio,
								bKeepRatio =  bForceAspectRatio || (bFlipKeyBinding && !event.shiftKey),
								newRatio,
								el;

							if (bKeepRatio) {
								newRatio = pos.y / pos.x;

								pos.x = ratio > newRatio ? pos.x : pos.y / ratio;
								pos.y = ratio > newRatio ? pos.x * ratio : pos.y;
							}

							el = angular.element(_el);

							function roundedMaxVal(val) {
								return Math.round(Math.max(0, val));
							}

							el.css('height', roundedMaxVal(pos.y) + 'px');
							el.css('width',  roundedMaxVal(pos.x) + 'px');

							// reflow the popover tooltip
							scope.reflowResizeOverlay(_el);
						};

						_body.on('mousemove', mousemove);

						oneEvent(
							_body,
							'mouseup',
							function (event) {
								event.preventDefault();
								event.stopPropagation();
								_body.off('mousemove', mousemove);

								scope.$apply(
									function () {
										scope.hidePopover();
										scope.updateTaBindtaTextElement();
									},
									100
								);
							}
						);

						event.stopPropagation();
						event.preventDefault();
					};

					scope.displayElements.resize.anchors[3].off('mousedown');
					scope.displayElements.resize.anchors[3].on('mousedown', _resizeMouseDown);

					scope.reflowResizeOverlay(_el);
					oneEvent(_body, 'click', function () {scope.hideResizeOverlay();});
				};

				scope.hideResizeOverlay = function () {
					scope.displayElements.resize.anchors[3].off('mousedown', _resizeMouseDown);
					scope.displayElements.resize.overlay.css('display', '');
				};

				// allow for insertion of custom directives on the textarea and div
				scope.setup.htmlEditorSetup(scope.displayElements.html);
				scope.setup.textEditorSetup(scope.displayElements.text);
				scope.displayElements.html.attr({
					'id': 'taHtmlElement' + _serial,
					'ng-show': 'showHtml',
					'ta-bind': 'ta-bind',
					'ng-model': 'html',
					'ng-model-options': element.attr('ng-model-options')
				});
				scope.displayElements.text.attr({
					'id': 'taTextElement' + _serial,
					'contentEditable': 'true',
					'ta-bind': 'ta-bind',
					'ng-model': 'html',
					'ng-model-options': element.attr('ng-model-options')
				});
				scope.displayElements.scrollWindow.attr({'ng-hide': 'showHtml'});
				if (attrs.taDefaultWrap) {
					// taDefaultWrap is only applied to the text and the not the html view
					scope.displayElements.text.attr('ta-default-wrap', attrs.taDefaultWrap);
				}

				if (attrs.taUnsafeSanitizer) {
					scope.displayElements.text.attr('ta-unsafe-sanitizer', attrs.taUnsafeSanitizer);
					scope.displayElements.html.attr('ta-unsafe-sanitizer', attrs.taUnsafeSanitizer);
				}

                if (attrs.taKeepStyles) {
                    scope.displayElements.text.attr('ta-keep-styles', attrs.taKeepStyles);
                    scope.displayElements.html.attr('ta-keep-styles', attrs.taKeepStyles);
                }

				// add the main elements to the origional element
				scope.displayElements.scrollWindow.append(scope.displayElements.text);
				element.append(scope.displayElements.scrollWindow);
				element.append(scope.displayElements.html);

				scope.displayElements.forminput.attr('name', scope._name);
				element.append(scope.displayElements.forminput);

				if (attrs.tabindex) {
					element.removeAttr('tabindex');
					scope.displayElements.text.attr('tabindex', attrs.tabindex);
					scope.displayElements.html.attr('tabindex', attrs.tabindex);
				}

				if (attrs.placeholder) {
					scope.displayElements.text.attr('placeholder', attrs.placeholder);
					scope.displayElements.html.attr('placeholder', attrs.placeholder);
				}

				if (attrs.taDisabled) {
					scope.displayElements.text.attr('ta-readonly', 'disabled');
					scope.displayElements.html.attr('ta-readonly', 'disabled');
					scope.disabled = scope.$parent.$eval(attrs.taDisabled);
					scope.$parent.$watch(
						attrs.taDisabled,
						function (newVal) {
							scope.disabled = newVal;
							if (scope.disabled) {
								element.addClass(scope.classes.disabled);
							} else {
								element.removeClass(scope.classes.disabled);
							}
						}
					);
				}

				if (attrs.taPaste) {
					scope._pasteHandler = function (_html) {
						return $parse(attrs.taPaste)(scope.$parent, {$html: _html});
					};
					scope.displayElements.text.attr('ta-paste', '_pasteHandler($html)');
				}

				// compile the scope with the text and html elements only - if we do this with the main element it causes a compile loop
				$compile(scope.displayElements.scrollWindow)(scope);
				$compile(scope.displayElements.html)(scope);

				scope.updateTaBindtaTextElement = scope['updateTaBindtaTextElement' + _serial];
				scope.updateTaBindtaHtmlElement = scope['updateTaBindtaHtmlElement' + _serial];

				// add the classes manually last
				element.addClass("ta-root");
				scope.displayElements.scrollWindow.addClass("ta-text ta-editor " + scope.classes.textEditor);
				scope.displayElements.html.addClass("ta-html ta-editor " + scope.classes.htmlEditor);

				testAndSet = function (choice, beforeState) {
					/* istanbul ignore next: this is only here because of a bug in rangy where rangy.saveSelection() has cleared the state */
					if (beforeState !== $document[0].queryCommandState(choice)) {
						$document[0].execCommand(choice, false, null);
					}
				};

				// used in the toolbar actions
				scope._actionRunning = false;

				_savedSelection = false;

				scope.startAction = function () {
					var _beforeStateBold = false,
						_beforeStateItalic = false,
						_beforeStateUnderline = false,
						_beforeStateStrikethough = false;

					scope._actionRunning = true;

					_beforeStateBold = $document[0].queryCommandState('bold');
					_beforeStateItalic = $document[0].queryCommandState('italic');
					_beforeStateUnderline = $document[0].queryCommandState('underline');
					_beforeStateStrikethough = $document[0].queryCommandState('strikeThrough');

					//console.log('B', _beforeStateBold, 'I', _beforeStateItalic, '_', _beforeStateUnderline, 'S', _beforeStateStrikethough);
					// if rangy library is loaded return a function to reload the current selection
					_savedSelection = rangy.core.saveSelection();
					// rangy.saveSelection() clear the state of bold, italic, underline, strikethrough
					// so we reset them here....!!!
					// this fixes bugs #423, #1129, #1105, #693 which are actually rangy bugs!
					testAndSet('bold', _beforeStateBold);
					testAndSet('italic', _beforeStateItalic);
					testAndSet('underline', _beforeStateUnderline);
					testAndSet('strikeThrough', _beforeStateStrikethough);
					//console.log('B', $document[0].queryCommandState('bold'), 'I', $document[0].queryCommandState('italic'), '_', $document[0].queryCommandState('underline'), 'S', $document[0].queryCommandState('strikeThrough') );
					return function () {
						if(_savedSelection) rangy.core.restoreSelection(_savedSelection);
						// perhaps if we restore the selections here, we would do better overall???
						// BUT what we do above does well in 90% of the cases...
					};
				};
				scope.endAction = function () {
					scope._actionRunning = false;

					if (_savedSelection) {
						if (scope.showHtml) {
							scope.displayElements.html[0].focus();
						} else {
							scope.displayElements.text[0].focus();
						}
						rangy.core.removeMarkers(_savedSelection);
					}

					_savedSelection = false;
					scope.updateSelectedStyles();
					// only update if in text or WYSIWYG mode
					if (!scope.showHtml) { scope['updateTaBindtaTextElement' + _serial](); }
				};

				// note that focusout > focusin is called everytime we click a button - except bad support: http://www.quirksmode.org/dom/events/blurfocus.html
				// cascades to displayElements.text and displayElements.html automatically.
				_focusin = function () {
					scope.focussed = true;
					element.addClass(scope.classes.focussed);
					_toolbars.focus();
					element.triggerHandler('focus');
				};

				scope.displayElements.html.on('focus', _focusin);
				scope.displayElements.text.on('focus', _focusin);

				_focusout = function (evt) {
					// if we are NOT runnig an action and have NOT focussed again on the text etc then fire the blur events
					if (!scope._actionRunning && $document[0].activeElement !== scope.displayElements.html[0] && $document[0].activeElement !== scope.displayElements.text[0]) {
						element.removeClass(scope.classes.focussed);
						_toolbars.unfocus();
						// to prevent multiple apply error defer to next seems to work.
						$timeout(
							function () {
								scope._bUpdateSelectedStyles = false;
								element.triggerHandler('blur');
								scope.focussed = false;
							},
							0,
							false
						);
					}
					evt.preventDefault();
					return false;
				};

				scope.displayElements.html.on('blur', _focusout);
				scope.displayElements.text.on('blur', _focusout);

				scope.displayElements.text.on('paste', function (event) {
					element.triggerHandler('paste', event);
				});

				// Setup the default toolbar tools, this way allows the user to add new tools like plugins.
				// This is on the editor for future proofing if we find a better way to do this.
				scope.queryFormatBlockState = function (command) {
					// $document[0].queryCommandValue('formatBlock') errors in Firefox if we call this when focussed on the textarea
					return !scope.showHtml && command.toLowerCase() === $document[0].queryCommandValue('formatBlock').toLowerCase();
				};

				scope.queryCommandState = function (command) {
					// $document[0].queryCommandValue('formatBlock') errors in Firefox if we call this when focussed on the textarea
					return (!scope.showHtml) ? $document[0].queryCommandState(command) : '';
				};

				scope.switchView = function () {
					scope.showHtml = !scope.showHtml;
					$animate.enabled(false, scope.displayElements.html);
					$animate.enabled(false, scope.displayElements.text);
					//Show the HTML view
					if (scope.showHtml) {
						//defer until the element is visible
						$timeout(
							function () {
								$animate.enabled(true, scope.displayElements.html);
								$animate.enabled(true, scope.displayElements.text);
								// [0] dereferences the DOM object from the angular.element
								return scope.displayElements.html[0].focus();
							},
							100,
							false
						);
					} else {
						//Show the WYSIWYG view
						//defer until the element is visible
						$timeout(
							function () {
								$animate.enabled(true, scope.displayElements.html);
								$animate.enabled(true, scope.displayElements.text);
								// [0] dereferences the DOM object from the angular.element
								return scope.displayElements.text[0].focus();
							},
							100,
							false
						);
					}
				};

				// changes to the model variable from outside the html/text inputs
				// if no ngModel, then the only input is from inside text-angular
				if (attrs.ngModel) {

					msos.console.debug(temp_td + ' - link -> first run, set ngModel render.');
					_firstRun = true;

					ngModel.$render = function () {
						if (_firstRun) {
							// we need this firstRun to set the originalContents otherwise it gets
							// overrided by the setting of ngModel to undefined from NaN
							_firstRun = false;
							// if view value is null or undefined initially and there was original content, set to the original content
							var _initialValue = scope.$parent.$eval(attrs.ngModel);

							if ((_initialValue === undefined || _initialValue === null) && (_originalContents && _originalContents !== '')) {
								// on passing through to taBind it will be sanitised
								ngModel.$setViewValue(_originalContents);
							}
						}

						scope.displayElements.forminput.val(ngModel.$viewValue);
						// if the editors aren't focused they need to be updated, otherwise they are doing the updating
						scope.html = ngModel.$viewValue || '';
					};

					// trigger the validation calls
					if (element.attr('required')) {
						ngModel.$validators.required = function (modelValue, viewValue) {
							var value = modelValue || viewValue;

							return !(!value || value.trim() === '');
						};
					}

				} else {
					msos.console.debug(temp_td + ' - link -> no ngModel.');
					// if no ngModel then update from the contents of the origional html.
					scope.displayElements.forminput.val(_originalContents);
					scope.html = _originalContents;
				}

				// changes from taBind back up to here
				scope.$watch(
					'html',
					function (newValue, oldValue) {
						if (newValue !== oldValue) {
							if (attrs.ngModel && ngModel.$viewValue !== newValue) ngModel.$setViewValue(newValue);
							scope.displayElements.forminput.val(newValue);
						}
					}
				);

				if (attrs.taTargetToolbars) _toolbars = textAngularManager.registerEditor(scope._name, scope, attrs.taTargetToolbars.split(','));
				else {
					_toolbar = angular.element('<div text-angular-toolbar name="textAngularToolbar' + _serial + '">');
					// passthrough init of toolbar options
					if (attrs.taToolbar)					{ _toolbar.attr('ta-toolbar', attrs.taToolbar); }
					if (attrs.taToolbarClass)				{ _toolbar.attr('ta-toolbar-class', attrs.taToolbarClass); }
					if (attrs.taToolbarGroupClass)			{ _toolbar.attr('ta-toolbar-group-class', attrs.taToolbarGroupClass); }
					if (attrs.taToolbarButtonClass)			{ _toolbar.attr('ta-toolbar-button-class', attrs.taToolbarButtonClass); }
					if (attrs.taToolbarActiveButtonClass)	{ _toolbar.attr('ta-toolbar-active-button-class', attrs.taToolbarActiveButtonClass); }
					if (attrs.taFocussedClass)				{ _toolbar.attr('ta-focussed-class', attrs.taFocussedClass); }

					element.prepend(_toolbar);
					$compile(_toolbar)(scope.$parent);
					_toolbars = textAngularManager.registerEditor(scope._name, scope, ['textAngularToolbar' + _serial]);
				}

				scope.$on('$destroy', function () {
					textAngularManager.unregisterEditor(scope._name);
					angular.element(window).off('blur');
					angular.element(window).off('resize', scope.handlePopoverEvents);
					angular.element(window).off('scroll', scope.handlePopoverEvents);
				});

				scope.$on(
					'ta-element-select',
					function (event, element) {
						if (_toolbars.triggerElementSelect(event, element)) {
							scope['reApplyOnSelectorHandlerstaTextElement' + _serial]();
						}
					}
				);

				scope.$on(
					'ta-drop-event',
					function (event, element, dropEvent, dataTransfer) {

						if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
							scope.displayElements.text[0].focus();

							taSelection.setSelectionToElementEnd(dropEvent.target);

							angular.forEach(
								dataTransfer.files,
								function (file) {
									try{
										$q.when(
											$q.defer('ng_textng_ta_drop'),
											scope.fileDropHandler(file, scope.wrapSelection) ||
											(
												scope.fileDropHandler !== scope.defaultFileDropHandler &&
												$q.when(
													$q.defer('ng_textng_ta_drop_then'),
													scope.defaultFileDropHandler(file, scope.wrapSelection)
												)
											)
										).then(
											function () {
												scope['updateTaBindtaTextElement' + _serial]();
											}
										);
									} catch (error) {
										msos.console.warn(temp_td + ' - link - ta-drop-event -> failed:', error);
									}
								}
							);
	
							dropEvent.preventDefault();
							dropEvent.stopPropagation();
						} else {
							$timeout(
								function () { scope['updateTaBindtaTextElement' + _serial](); },
								0,
								false
							);
						}
				});

				// the following is for applying the active states to the tools that support it
				scope._bUpdateSelectedStyles = false;

				angular.element(window).on(
					'blur',
					function () {
						scope._bUpdateSelectedStyles = false;
						scope.focussed = false;
					}
				);

				// loop through all the tools polling their activeState function if it exists
				scope.updateSelectedStyles = function () {
					var _selection;

					if (_updateSelectedStylesTimeout) { $timeout.cancel(_updateSelectedStylesTimeout); }

					// test if the common element ISN'T the root ta-text node
					if ((_selection = taSelection.getSelectionElement()) !== undefined && _selection.parentNode !== scope.displayElements.text[0]) {
						_toolbars.updateSelectedStyles(angular.element(_selection));
					} else {
						_toolbars.updateSelectedStyles();
					}
					// used to update the active state when a key is held down, ie the left arrow
					if (scope._bUpdateSelectedStyles) {
						_updateSelectedStylesTimeout = $timeout(
							scope.updateSelectedStyles,
							200,
							false
						);
					}
				};

				// start updating on keydown
				_keydown = function () {
					if (!scope.focussed) {
						scope._bUpdateSelectedStyles = false;
						return;
					}

					if (!scope._bUpdateSelectedStyles) {
						scope._bUpdateSelectedStyles = true;
						scope.$apply(
							function taLink_keydown() {
								scope.updateSelectedStyles();
							}
						);
					}
				};

				scope.displayElements.html.on('keydown', _keydown);
				scope.displayElements.text.on('keydown', _keydown);

				// stop updating on key up and update the display/model
				_keyup = function () {
					scope._bUpdateSelectedStyles = false;
				};

				scope.displayElements.html.on('keyup', _keyup);
				scope.displayElements.text.on('keyup', _keyup);

				// stop updating on key up and update the display/model
				_keypress = function (event, eventData) {
					if (eventData) angular.extend(event, eventData);

					scope.$apply(
						function taLink_keypress() {
							if (_toolbars.sendKeyCommand(event)) {

								if (!scope._bUpdateSelectedStyles) {
									scope.updateSelectedStyles();
								}
								event.preventDefault();
								return false;
							}
							return undefined;
						}
					);
				};

				scope.displayElements.html.on('keypress', _keypress);
				scope.displayElements.text.on('keypress', _keypress);

				// update the toolbar active states when we click somewhere in the text/html boxed
				_mouseup = function () {
					// ensure only one execution of updateSelectedStyles()
					scope._bUpdateSelectedStyles = false;
					scope.$apply(
						function taLink_mouseup() {
							scope.updateSelectedStyles();
						}
					);
				};

				scope.displayElements.html.on('mouseup', _mouseup);
				scope.displayElements.text.on('mouseup', _mouseup);

				msos.console.debug(temp_td + ' - link ->  done!');
			}
		};
	}
]);

textAngular.service(
	'textAngularManager',
			['taToolExecuteAction', 'taRegisterTool', '$interval', '$rootScope',
	function (taToolExecuteAction,   taRegisterTool,   $interval,   $rootScope) {
		// this service is used to manage all textAngular editors and toolbars.
		// All publicly published functions that modify/need to access the toolbar or editor scopes should be in here
		// these contain references to all the editors and toolbars that have been initialised in this app
		var temp_ta = 'ng.textng.core - textAngularManager',
			toolbars = {},
			editors = {},
			toolbarScopes = [],
			timeRecentModification = 0,
			updateStyles = function (selectedElement) {
				angular.forEach(
					editors,
					function (editor) {
						editor.editorFunctions.updateSelectedStyles(selectedElement);
					}
				);
			},
			triggerInterval = 50,
			triggerIntervalTimer,
			setupTriggerUpdateStyles = function () {
				timeRecentModification = Date.now();
				triggerIntervalTimer = $interval(
					function () {
						updateStyles();
						triggerIntervalTimer = undefined;
					},
					triggerInterval,
					1
				); // only trigger once
			},
			touchModification;

		msos.console.debug(temp_ta + ' -> called.');

		$rootScope.$on('destroy', function () {
			if (triggerIntervalTimer) {
				$interval.cancel(triggerIntervalTimer);
				triggerIntervalTimer = undefined;
			}
		});

		touchModification = function () {
			if (Math.abs(Date.now() - timeRecentModification) > triggerInterval) {
				// we have already triggered the updateStyles a long time back... so setup it again...
				setupTriggerUpdateStyles();
			}
		};

		// when we focus into a toolbar, we need to set the TOOLBAR's $parent to be the toolbars it's linked to.
		// We also need to set the tools to be updated to be the toolbars...
		return {
			// register an editor and the toolbars that it is affected by
			registerEditor: function (name, scope, targetToolbars) {

				// targetToolbars are optional, we don't require a toolbar to function
				if (!name || name === '') {
					throw('textAngular Error: An editor requires a name');
				}
				if (!scope) {
					throw('textAngular Error: An editor requires a scope');
				}
				if (editors[name]) {
					throw('textAngular Error: An Editor with name "' + name + '" already exists');
				}

				msos.console.debug(temp_ta + ' - registerEditor -> start.');

				angular.forEach(
					targetToolbars,
					function (_name) {
						if (toolbars[_name]) toolbarScopes.push(toolbars[_name]);
						// if it doesn't exist it may not have been compiled yet and it will be added later
					}
				);

				editors[name] = {
					scope: scope,
					toolbars: targetToolbars,
					_registerToolbarScope: function (toolbarScope) {
						// add to the list late
						if (this.toolbars.indexOf(toolbarScope.name) >= 0) { toolbarScopes.push(toolbarScope); }
					},
					// this is a suite of functions the editor should use to update all it's linked toolbars
					editorFunctions: {
						disable: function () {
							// disable all linked toolbars
							angular.forEach(
								toolbarScopes,
								function (toolbarScope) { toolbarScope.disabled = true; }
							);
						},
						enable: function () {
							// enable all linked toolbars
							angular.forEach(
								toolbarScopes,
								function (toolbarScope) { toolbarScope.disabled = false; }
							);
						},
						focus: function () {
							// this should be called when the editor is focussed
							angular.forEach(
								toolbarScopes,
								function (toolbarScope) {
									toolbarScope._parent = scope;
									toolbarScope.disabled = false;
									toolbarScope.focussed = true;
									scope.focussed = true;
								}
							);
						},
						unfocus: function () {
							// this should be called when the editor becomes unfocussed
							angular.forEach(
								toolbarScopes,
								function (toolbarScope) {
									toolbarScope.disabled = true;
									toolbarScope.focussed = false;
								}
							);
							scope.focussed = false;
						},
						updateSelectedStyles: function (selectedElement) {
							// update the active state of all buttons on liked toolbars
							angular.forEach(
								toolbarScopes,
								function (toolbarScope) {
									angular.forEach(
										toolbarScope.tools,
										function (toolScope) {
											if (toolScope.activeState) {
												toolbarScope._parent = scope;
												// selectedElement may be undefined if nothing selected
												toolScope.active = toolScope.activeState(selectedElement);
											}
										}
									);
								}
							);
						},
						sendKeyCommand: function (event) {
							// we return true if we applied an action, false otherwise
							var result = false;

							if (event.ctrlKey || event.metaKey || event.specialKey) {
								angular.forEach(
									ng.textng.setup.tools,
									function (tool, name) {
										var _t = 0;

										if (tool.commandKeyCode && (tool.commandKeyCode === event.which || tool.commandKeyCode === event.specialKey)) {
											for (_t = 0; _t < toolbarScopes.length; _t += 1) {
												if (toolbarScopes[_t].tools[name] !== undefined) {
													taToolExecuteAction.call(toolbarScopes[_t].tools[name], scope);
													result = true;
													break;
												}
											}
										}
									}
								);
							}
							return result;
						},
						triggerElementSelect: function (event, element) {
							// search through the taTools to see if a match for the tag is made.
							// if there is, see if the tool is on a registered toolbar and not disabled.
							// NOTE: This can trigger on MULTIPLE tools simultaneously.
							var elementHasAttrs = function (_element, attrs) {
									var result = true,
										i = 0;
	
									for (i = 0; i < attrs.length; i += 1) {
										result = result && _element.attr(attrs[i]);
									}
	
									return result;
								},
								workerTools = [],
								unfilteredTools = {},
								result = false,
								onlyWithAttrsFilter = false,
								_i = 0,
								tool,
								name,
								_t = 0;

							element = angular.element(element);

							angular.forEach(
								ng.textng.setup.tools,
								function (tool, name) {
									if (
										tool.onElementSelect &&
										tool.onElementSelect.element &&
										tool.onElementSelect.element.toLowerCase() === element[0].tagName.toLowerCase() &&
										(!tool.onElementSelect.filter || tool.onElementSelect.filter(element))
									) {
										// this should only end up true if the element matches the only attributes
										onlyWithAttrsFilter = onlyWithAttrsFilter ||
											(angular.isArray(tool.onElementSelect.onlyWithAttrs) && elementHasAttrs(element, tool.onElementSelect.onlyWithAttrs));
										if (!tool.onElementSelect.onlyWithAttrs || elementHasAttrs(element, tool.onElementSelect.onlyWithAttrs)) unfilteredTools[name] = tool;
									}
								}
							);

							// if we matched attributes to filter on, then filter, else continue
							if (onlyWithAttrsFilter) {
								angular.forEach(
									unfilteredTools,
									function (tool, name) {
										if (tool.onElementSelect.onlyWithAttrs && elementHasAttrs(element, tool.onElementSelect.onlyWithAttrs)) {
											workerTools.push({'name': name, 'tool': tool});
										}
									}
								);

								// sort most specific (most attrs to find) first
								workerTools.sort(
									function (a, b) {
										return b.tool.onElementSelect.onlyWithAttrs.length - a.tool.onElementSelect.onlyWithAttrs.length;
									}
								);
							} else {
								angular.forEach(
									unfilteredTools,
									function (tool, name) {
										workerTools.push({ 'name': name, 'tool': tool });
									}
								);
							}

							// Run the actions on the first visible filtered tool only
							if (workerTools.length > 0) {
								for (_i = 0; _i < workerTools.length; _i += 1) {
									tool = workerTools[_i].tool;
									name = workerTools[_i].name;

									for (_t = 0; _t < toolbarScopes.length; _t += 1) {
										if (toolbarScopes[_t].tools[name] !== undefined) {
											tool.onElementSelect.action.call(toolbarScopes[_t].tools[name], event, element, scope);
											result = true;
											break;
										}
									}

									if (result) break;
								}
							}
							return result;
						}
					}
				};

				touchModification();

				msos.console.debug(temp_ta + ' - registerEditor ->  done!');

				return editors[name].editorFunctions;
			},
			// retrieve editor by name, largely used by testing suites only
			retrieveEditor: function (name) {
				return editors[name];
			},
			unregisterEditor: function (name) {
				delete editors[name];
				touchModification();
			},
			// registers a toolbar such that it can be linked to editors
			registerToolbar: function (scope) {
				if (!scope) {
					throw('textAngular Error: A toolbar requires a scope');
				}
				if (!scope.name || scope.name === '') {
					throw('textAngular Error: A toolbar requires a name');
				}
				if (toolbars[scope.name]) {
					throw('textAngular Error: A toolbar with name "' + scope.name + '" already exists');
				}

				msos.console.debug(temp_ta + ' - registerToolbar -> start.');

				toolbars[scope.name] = scope;

				angular.forEach(
					editors,
					function (_editor) {
						_editor._registerToolbarScope(scope);
					}
				);

				touchModification();

				msos.console.debug(temp_ta + ' - registerToolbar ->  done!');
			},
			// retrieve toolbar by name, largely used by testing suites only
			retrieveToolbar: function (name) {
				return toolbars[name];
			},
			// retrieve toolbars by editor name, largely used by testing suites only
			retrieveToolbarsViaEditor: function (name) {
				var result = [],
					_this = this;

				angular.forEach(
					this.retrieveEditor(name).toolbars,
					function (name) {
						result.push(_this.retrieveToolbar(name));
					}
				);

				return result;
			},
			unregisterToolbar: function (name) {
				delete toolbars[name];
				// we remove the scope from the toolbarScopes so that we no longer have a memory leak.
				var tmp = [],
					index;

				for (index in toolbarScopes) {
					if (toolbarScopes[index].name !== name) {
						tmp.push(toolbarScopes[index]);
					}
				}

				toolbarScopes = tmp;
				touchModification();
			},
			// functions for updating the toolbar buttons display
			updateToolsDisplay: function (newTaTools) {
				// pass a partial struct of the taTools, this allows us to update the tools on the fly, will not change the defaults.
				var _this = this;

				angular.forEach(
					newTaTools,
					function (_newTool, key) {
						_this.updateToolDisplay(key, _newTool);
					}
				);
			},
			// this function resets all toolbars to their default tool definitions
			resetToolsDisplay: function () {
				var _this = this;

				angular.forEach(
					ng.textng.setup.tools,
					function (_newTool, key) {
						_this.resetToolDisplay(key);
					}
				);

				touchModification();
			},
			// update a tool on all toolbars
			updateToolDisplay: function (toolKey, _newTool) {
				var _this = this;

				angular.forEach(
					toolbars,
					function (toolbarScope, toolbarKey) {
						_this.updateToolbarToolDisplay(toolbarKey, toolKey, _newTool);
					}
				);

				touchModification();
			},
			// resets a tool to the default/starting state on all toolbars
			resetToolDisplay: function (toolKey) {
				var _this = this;

				angular.forEach(
					toolbars,
					function (toolbarScope, toolbarKey) {
						_this.resetToolbarToolDisplay(toolbarKey, toolKey);
					}
				);

				touchModification();
			},
			// update a tool on a specific toolbar
			updateToolbarToolDisplay: function (toolbarKey, toolKey, _newTool) {
				if (toolbars[toolbarKey]) {
					toolbars[toolbarKey].updateToolDisplay(toolKey, _newTool);
				} else {
					throw('textAngular Error: No Toolbar with name "' + toolbarKey + '" exists');
				}
			},
			// reset a tool on a specific toolbar to it's default starting value
			resetToolbarToolDisplay: function (toolbarKey, toolKey) {
				if (toolbars[toolbarKey]) {
					toolbars[toolbarKey].updateToolDisplay(toolKey, ng.textng.setup.tools[toolKey], true);
				} else {
					throw('textAngular Error: No Toolbar with name "' + toolbarKey + '" exists');
				}
			},
			// removes a tool from all toolbars and it's definition
			removeTool: function (toolKey) {
				delete ng.textng.setup.tools[toolKey];

				angular.forEach(
					toolbars,
					function (toolbarScope) {
						var i = 0,
							j = 0,
							toolbarIndex;

						delete toolbarScope.tools[toolKey];

						for (i = 0; i < toolbarScope.toolbar.length; i += 1) {

							for (j = 0; j < toolbarScope.toolbar[i].length; j += 1) {
								if (toolbarScope.toolbar[i][j] === toolKey) {
									toolbarIndex = {
										group: i,
										index: j
									};
									break;
								}
								if (toolbarIndex !== undefined) { break; }
							}

							if (toolbarIndex !== undefined) {
								toolbarScope.toolbar[toolbarIndex.group].slice(toolbarIndex.index, 1);
								toolbarScope._$element.children().eq(toolbarIndex.group).children().eq(toolbarIndex.index).remove();
							}
						}
					}
				);

				touchModification();
			},
			// toolkey, toolDefinition are required. If group is not specified will pick the last group, if index isnt defined will append to group
			addTool: function (toolKey, toolDefinition, group, index) {
				msos.console.debug(temp_ta + ' - addTool -> start, toolKey: ' + toolKey);
	
				taRegisterTool(toolKey, toolDefinition);

				angular.forEach(
					toolbars,
					function (toolbarScope) {
						toolbarScope.addTool(toolKey, toolDefinition, group, index);
					}
				);

				touchModification();

				msos.console.debug(temp_ta + ' - addTool ->  done!');
			},
			// adds a Tool but only to one toolbar not all
			addToolToToolbar: function (toolKey, toolDefinition, toolbarKey, group, index) {
				msos.console.debug(temp_ta + ' - addToolToToolbar -> start, toolKey: ' + toolKey);
	
				taRegisterTool(toolKey, toolDefinition);
	
				toolbars[toolbarKey].addTool(toolKey, toolDefinition, group, index);

				touchModification();

				msos.console.debug(temp_ta + ' - addToolToToolbar ->  done!');
			},
			// this is used when externally the html of an editor has been changed and textAngular needs to be notified to update the model.
			// this will call a $digest if not already happening
			refreshEditor: function (name) {
				msos.console.debug(temp_ta + ' - refreshEditor -> start.');

				if (editors[name]) {
					editors[name].scope.updateTaBindtaTextElement();
					if (!editors[name].scope.$$phase) { editors[name].scope.$digest(); }
				} else {
					throw('textAngular Error: No Editor with name "' + name + '" exists');
				}

				touchModification();

				msos.console.debug(temp_ta + ' - refreshEditor ->  done!');
			},
			// this is used by taBind to send a key command in response to a special key event
			sendKeyCommand: function (scope, event) {
				var _editor = editors[scope._name];

				if (_editor && _editor.editorFunctions.sendKeyCommand(event)) {

					if (!scope._bUpdateSelectedStyles) {
						scope.updateSelectedStyles();
					}

					event.preventDefault();
					return false;
				}

				return undefined;
			},
			updateStyles: updateStyles,
			getVersion: function () { return ng.textng.core.ta_version; },
			getToolbarScopes: function () { return toolbarScopes; }
		};
	}]
);

textAngular.directive(
	'textAngularToolbar',
	[
			 '$compile', 'textAngularManager', 'taToolExecuteAction',
	function ($compile,  textAngularManager,   taToolExecuteAction) {
		"use strict";

		var temp_tb = 'ng.textng.core - textAngularToolbar';

		msos.console.debug(temp_tb + ' -> called.');

		return {
			scope: {
				name: '@' // a name IS required
			},
			restrict: "EA",
			link: function (scope, element, attrs) {
				var temp_l = temp_tb + ' - link -> ',
					setupToolElement,
					defaultChildScope;

				if (!scope.name || scope.name === '') {
					throw('textAngular Error: A toolbar requires a name');
				}

				msos.console.debug(temp_l + 'start.');

				angular.extend(scope, angular.copy(ng.textng.setup.options));

				if (attrs.taToolbar)					{ scope.toolbar = scope.$parent.$eval(attrs.taToolbar); }
				if (attrs.taToolbarClass)				{ scope.classes.toolbar = attrs.taToolbarClass; }
				if (attrs.taToolbarGroupClass)			{ scope.classes.toolbarGroup = attrs.taToolbarGroupClass; }
				if (attrs.taToolbarButtonClass)			{ scope.classes.toolbarButton = attrs.taToolbarButtonClass; }
				if (attrs.taToolbarActiveButtonClass)	{ scope.classes.toolbarButtonActive = attrs.taToolbarActiveButtonClass; }
				if (attrs.taFocussedClass)				{ scope.classes.focussed = attrs.taFocussedClass; }

				scope.disabled = true;
				scope.focussed = false;
				scope._$element = element;
				element[0].innerHTML = '';
				element.addClass("ta-toolbar " + scope.classes.toolbar);

				scope.$watch(
					'focussed',
					function () {
						if (scope.focussed)	{ element.addClass(scope.classes.focussed); }
						else				{ element.removeClass(scope.classes.focussed); }
					}
				);

				setupToolElement = function (toolDefinition, toolScope) {
					var toolElement,
						icon,
						content;

					if (toolDefinition && toolDefinition.display) {
						toolElement = angular.element(toolDefinition.display);
					} else {
						toolElement = angular.element("<button type='button'>");
					}

					if (toolDefinition && toolDefinition["class"]) {
						toolElement.addClass(toolDefinition["class"]);
					} else {
						toolElement.addClass(scope.classes.toolbarButton);
					}

					toolElement.attr('name', toolScope.name);

					// important to not take focus from the main text/html entry
					toolElement.attr('ta-button', 'ta-button');
					toolElement.attr('ng-disabled', 'isDisabled()');
					toolElement.attr('tabindex', '-1');
					toolElement.attr('ng-click', 'executeAction()');
					toolElement.attr('ng-class', 'displayActiveToolClass(active)');

					if (toolDefinition && toolDefinition.tooltiptext) {
						toolElement.attr('title', toolDefinition.tooltiptext);
					}
					if (toolDefinition && !toolDefinition.display && !toolScope._display) {
						// first clear out the current contents if any
						toolElement[0].innerHTML = '';
						// add the buttonText
						if (toolDefinition.buttontext) {
							toolElement[0].innerHTML = toolDefinition.buttontext;
						}
						// add the icon to the front of the button if there is content
						if (toolDefinition.iconclass) {
							icon = angular.element('<i>');
							content = toolElement[0].innerHTML;
							icon.addClass(toolDefinition.iconclass);
							toolElement[0].innerHTML = '';
							toolElement.append(icon);
							if (content && content !== '') {
								toolElement.append('&nbsp;' + content);
							}
						}
					}

					toolScope._lastToolDefinition = angular.copy(toolDefinition);

					return $compile(toolElement)(toolScope);
				};

				// Keep a reference for updating the active states later
				scope.tools = {};
				// create the tools in the toolbar
				// default functions and values to prevent errors in testing and on init
				scope._parent = {
					disabled: true,
					showHtml: false,
					queryFormatBlockState: function () { return false; },
					queryCommandState: function () { return false; }
				};

				defaultChildScope = {
					$editor: function () {
						// dynamically gets the editor as it is set
						return scope._parent;
					},
					isDisabled: function () {
						// view selection button is always enabled since it doesn not depend on a selction!
						if (this.name === 'html' && scope._parent.startAction) {
							return false;
						}
						// to set your own disabled logic set a function or boolean on the tool called 'disabled'
						return ( // this bracket is important as without it it just returns the first bracket and ignores the rest
							// when the button's disabled function/value evaluates to true
							(typeof this.$eval('disabled') !== 'function' && this.$eval('disabled')) || this.$eval('disabled()') ||
							// all buttons except the HTML Switch button should be disabled in the showHtml (RAW html) mode
							(this.name !== 'html' && this.$editor().showHtml) ||
							// if the toolbar is disabled
							this.$parent.disabled ||
							// if the current editor is disabled
							this.$editor().disabled
						);
					},
					displayActiveToolClass: function (active) {
						return (active)? scope.classes.toolbarButtonActive : '';
					},
					executeAction: taToolExecuteAction
				};

				angular.forEach(
					scope.toolbar,
					function (group) {
						// setup the toolbar group
						var groupElement = angular.element("<div>");

						groupElement.addClass(scope.classes.toolbarGroup);

						angular.forEach(
							group,
							function (tool) {
								// init and add the tools to the group
								// a tool name (key name from taTools struct)
								//creates a child scope of the main angularText scope and then extends the childScope with the functions of this particular tool
								// reference to the scope and element kept
								scope.tools[tool] = angular.extend(scope.$new(true), ng.textng.setup.tools[tool], defaultChildScope, {name: tool});
								scope.tools[tool].$element = setupToolElement(ng.textng.setup.tools[tool], scope.tools[tool]);
								// append the tool compiled with the childScope to the group element
								groupElement.append(scope.tools[tool].$element);
							}
						);

						// append the group to the toolbar
						element.append(groupElement);
					}
				);

				// update a tool
				// if a value is set to null, remove from the display
				// when forceNew is set to true it will ignore all previous settings, used to reset to taTools definition
				// to reset to defaults pass in taTools[key] as _newTool and forceNew as true, ie `updateToolDisplay(key, taTools[key], true);`
				scope.updateToolDisplay = function (key, _newTool, forceNew) {
					var toolInstance = scope.tools[key],
						toolElement;

					if (toolInstance) {
						// get the last toolDefinition, then override with the new definition
						if (toolInstance._lastToolDefinition && !forceNew) {
							_newTool = angular.extend({}, toolInstance._lastToolDefinition, _newTool);
						}

						if (_newTool.buttontext === null && _newTool.iconclass === null && _newTool.display === null) {
							throw('textAngular Error: Tool Definition for updating "' + key + '" does not have a valid display/iconclass/buttontext value');
						}

						// if tool is defined on this toolbar, update/redo the tool
						if (_newTool.buttontext === null) {
							delete _newTool.buttontext;
						}
						if (_newTool.iconclass === null) {
							delete _newTool.iconclass;
						}
						if (_newTool.display === null) {
							delete _newTool.display;
						}

						toolElement = setupToolElement(_newTool, toolInstance);

						toolInstance.$element.replaceWith(toolElement);
						toolInstance.$element = toolElement;
					}
				};

				// we assume here that all values passed are valid and correct
				scope.addTool = function (key, _newTool, groupIndex, index) {
					var group;

					scope.tools[key] = angular.extend(
						scope.$new(true),
						ng.textng.setup.tools[key],
						defaultChildScope,
						{ name: key }
					);

					scope.tools[key].$element = setupToolElement(ng.textng.setup.tools[key], scope.tools[key]);

					if (groupIndex === undefined) {
						groupIndex = scope.toolbar.length - 1;
					}

					group = angular.element(element.children()[groupIndex]);

					if (index === undefined) {
						group.append(scope.tools[key].$element);
						scope.toolbar[groupIndex][scope.toolbar[groupIndex].length - 1] = key;
					} else {
						group.children().eq(index).after(scope.tools[key].$element);
						scope.toolbar[groupIndex][index] = key;
					}
				};

				textAngularManager.registerToolbar(scope);

				scope.$on(
					'$destroy',
					function () {
						textAngularManager.unregisterToolbar(scope.name);
					}
				);

				msos.console.debug(temp_l + ' done!');
			}
		};
	}
]);
