
/**
 * @license AngularJS v1.7.5
 * (c) 2010-2018 Google, Inc. http://angularjs.org
 * License: MIT
 */

/*global
    msos: false,
    ng: false
*/

msos.provide("ng.messages");

ng.messages.version = new msos.set_version(18, 10, 25);


(function (window, angular) {
    'use strict';

    var forEach = angular.forEach,
		isArray = angular.isArray,
		isString = angular.isString,
		jqLite = angular.element;

    function ngMessageDirectiveFactory(isDefault) {

        function contains(collection, key) {
            if (collection) {
                return isArray(collection) ? collection.indexOf(key) >= 0 : collection.hasOwnProperty(key);
            }
        }

        return ['$animate', function ($animate) {
            return {
                restrict: 'AE',
                transclude: 'element',
                priority: 1, // must run before ngBind, otherwise the text is set on the comment
                terminal: true,
                require: '^^ngMessages',
                link: function (scope, element, attrs, ngMessagesCtrl, $transclude) {
                    var commentNode,
						records,
						staticExp,
						dynamicExp,
						assignRecords = function (items) {
							records = items ? (isArray(items) ? items : items.split(/[\s,]+/)) : null;
							ngMessagesCtrl.reRender();
						},
						currentElement,
						messageCtrl;

					if (!isDefault) {

						commentNode = element[0];
						staticExp = attrs.ngMessage || attrs.when;
						dynamicExp = attrs.ngMessageExp || attrs.whenExp;

						if (dynamicExp) {
							assignRecords(scope.$eval(dynamicExp));
							scope.$watchCollection(dynamicExp, assignRecords);
						} else {
							assignRecords(staticExp);
						}
					}

                    ngMessagesCtrl.register(
						commentNode,
						messageCtrl = {
							test: function (name) {
								return contains(records, name);
							},
							attach: function () {
								if (!currentElement) {
									$transclude(
										undefined,		// no scope
										function ngMessagesTransclude(elm, newScope) {
											$animate.enter(elm, null, element);
											currentElement = elm;

											var $$attachId = currentElement.$$attachId = ngMessagesCtrl.getAttachId();

											currentElement.on(
												'$destroy',
												function () {
													if (currentElement && currentElement.$$attachId === $$attachId) {
														ngMessagesCtrl.deregister(commentNode, isDefault);
														messageCtrl.detach();
													}

													newScope.$destroy();
												}
											);
										}
									);
								}
							},
							detach: function () {
								if (currentElement) {
									var elm = currentElement;
									currentElement = null;
									$animate.leave(elm);
								}
							}
						}
					);

                    scope.$on(
						'$destroy',
						function ng_messages_dir_fac_link_on() {
							ngMessagesCtrl.deregister(commentNode, isDefault);
						}
					);
                }
            };
        }];
    }

    angular.module(
		'ng.messages',
		['ng']
	).info(
		{ angularVersion: '1.7.5' }
	).directive(
		'ngMessages',
		['$animate', function ($animate) {
            var ACTIVE_CLASS = 'ng-active',
				INACTIVE_CLASS = 'ng-inactive';

            return {
                require: 'ngMessages',
                restrict: 'AE',
                controller: ['$element', '$scope', '$attrs', function NgMessagesCtrl($element, $scope, $attrs) {
                    var ctrl = this,
						latestKey = 0,
						nextAttachId = 0,
						messages,
						renderLater,
						cachedCollection;

                    this.getAttachId = function getAttachId() {
                        return nextAttachId++;
                    };

                    messages = this.messages = {};

                    this.render = function (collection) {
                        collection = collection || {};

                        renderLater = false;
                        cachedCollection = collection;

                        // this is true if the attribute is empty or if the attribute value is truthy
                        var multiple = isAttrTruthy($scope, $attrs.ngMessagesMultiple) || isAttrTruthy($scope, $attrs.multiple),
							unmatchedMessages = [],
							matchedKeys = {},
							truthyKeys = 0,
							messageItem = ctrl.head,
							messageFound = false,
							messageCtrl,
							messageUsed,
							messageMatched,
							attachDefault,
							totalMessages = 0;

						function isMessageUsed(value, key) {
							if (truthy(value) && !messageUsed) {
								truthyKeys += 1;

								if (messageCtrl.test(key)) {
									// this is to prevent the same error name from showing up twice
									if (matchedKeys[key]) { return; }
										matchedKeys[key] = true;

										messageUsed = true;
										messageCtrl.attach();
								}
							}
						}

                        while (messageItem !== null && messageItem !== undefined) {

                            totalMessages += 1;

                            messageCtrl = messageItem.message;
                            messageUsed = false;

                            if (!messageFound) {
								forEach(collection, isMessageUsed);
							}

                            if (messageUsed) {
                                // unless we want to display multiple messages then we should
                                // set a flag here to avoid displaying the next message in the list
                                messageFound = !multiple;
                            } else {
                                unmatchedMessages.push(messageCtrl);
                            }

                            messageItem = messageItem.next;
                        }

                        forEach(unmatchedMessages, function (messageCtrl) {
                            messageCtrl.detach();
                        });

						if (attachDefault) {
							ctrl.default.attach();
						} else if (ctrl.default) {
							ctrl.default.detach();
						}

                        if (messageMatched || attachDefault) {
                            $animate.setClass($element, ACTIVE_CLASS, INACTIVE_CLASS);
                        } else {
                            $animate.setClass($element, INACTIVE_CLASS, ACTIVE_CLASS);
                        }
                    };

                    $scope.$watchCollection($attrs.ngMessages || $attrs['for'], ctrl.render);

                    this.reRender = function () {
                        if (!renderLater) {
                            renderLater = true;
                            $scope.$evalAsync(function () {
                                if (renderLater && cachedCollection) {
                                    ctrl.render(cachedCollection);
                                }
                            });
                        }
                    };

					this.register = function (comment, messageCtrl, isDefault) {
						var nextKey;

						if (isDefault) {
							ctrl.default = messageCtrl;
						} else {
							nextKey = latestKey.toString();
							messages[nextKey] = {
								message: messageCtrl
							};

							insertMessageNode($element[0], comment, nextKey);
							comment.$$ngMessageNode = nextKey;
							latestKey += 1;
						}

						ctrl.reRender();
					};

					this.deregister = function (comment, isDefault) {
						var key;

						if (isDefault) {
							delete ctrl.default;
						} else {
							key = comment.$$ngMessageNode;
							delete comment.$$ngMessageNode;
							removeMessageNode($element[0], comment, key);
							delete messages[key];
						}

						ctrl.reRender();
					};

                    function findPreviousMessage(parent, comment) {
                        var prevNode = comment,
							parentLookup = [],
							prevKey;

                        while (prevNode && prevNode !== parent) {

                            prevKey = prevNode.$$ngMessageNode;

                            if (prevKey && prevKey.length) {
                                return messages[prevKey];
                            }

                            // dive deeper into the DOM and examine its children for any ngMessage
                            // comments that may be in an element that appears deeper in the list
                            if (prevNode.childNodes.length && parentLookup.indexOf(prevNode) === -1) {
                                parentLookup.push(prevNode);
                                prevNode = prevNode.childNodes[prevNode.childNodes.length - 1];
                            } else if (prevNode.previousSibling) {
                                prevNode = prevNode.previousSibling;
                            } else {
                                prevNode = prevNode.parentNode;
                                parentLookup.push(prevNode);
                            }
                        }
                    }

                    function insertMessageNode(parent, comment, key) {
                        var messageNode = messages[key],
							match;

                        if (!ctrl.head) {
                            ctrl.head = messageNode;
                        } else {
                            match = findPreviousMessage(parent, comment);

                            if (match) {
                                messageNode.next = match.next;
                                match.next = messageNode;
                            } else {
                                messageNode.next = ctrl.head;
                                ctrl.head = messageNode;
                            }
                        }
                    }

                    function removeMessageNode(parent, comment, key) {
                        var messageNode = messages[key],
							match;

                        // This message node may have already been removed by a call to deregister()
                        if (!messageNode) { return; }

                        match = findPreviousMessage(parent, comment);

                        if (match) {
                            match.next = messageNode.next;
                        } else {
                            ctrl.head = messageNode.next;
                        }
                    }
                }]
            };

            function isAttrTruthy(scope, attr) {
                return (isString(attr) && attr.length === 0) || truthy(scope.$eval(attr));
            }

            function truthy(val) {
                return isString(val) ? val.length : !!val;
            }
        }]
	).directive(
		'ngMessagesInclude',
		['$templateRequest', '$document', '$compile', function ($templateRequest, $document, $compile) {

            function replaceElementWithMarker(element, src) {
                // A comment marker is placed for debugging purposes
                var comment = $compile.$$createComment ? $compile.$$createComment('ngMessagesInclude', src) : $document[0].createComment(' ngMessagesInclude: ' + src + ' '),
					marker = jqLite(comment);

                element.after(marker);
                element.remove();
            }

            return {
                restrict: 'AE',
                require: '^^ngMessages', // we only require this for validation sake
                link: function ($scope, element, attrs) {
                    var src = attrs.ngMessagesInclude || attrs.src;

                    $templateRequest(src).then(
						function (html) {

							if ($scope.$$destroyed) { return; }

							if (isString(html) && !html.trim()) {
								// Empty template - nothing to compile
								replaceElementWithMarker(element, src);
							} else {
								// Non-empty template - compile and link
								$compile(html)(
									$scope,
									function (contents) {
										element.after(contents);
										replaceElementWithMarker(element, src);
									}
								);
							}
						}
					);
                }
            };
        }]
	).directive(
		'ngMessage',
		ngMessageDirectiveFactory()
	).directive(
		'ngMessageExp',
		ngMessageDirectiveFactory()
	).directive(
		'ngMessageDefault',
		ngMessageDirectiveFactory(true)
	);

}(window, window.angular));
