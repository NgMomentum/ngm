
/*global
    msos: false,
    angular: false,
    demo: false
*/


var ComposeController = function() {
    function ComposeController($state, DialogService, AppConfig, Messages) {
        msos._classCallCheck(this, ComposeController);

        this.$state = $state;
        this.DialogService = DialogService;
        this.AppConfig = AppConfig;
        this.Messages = Messages;
    }

    ComposeController.prototype.$onInit = function $onInit() {
        this.pristineMessage = angular.extend({
            from: this.AppConfig.emailAddress
        }, this.$stateParams.message);
        this.message = angular.copy(this.pristineMessage);
    };

    ComposeController.prototype.uiCanExit = function uiCanExit() {
        if (this.canExit || angular.equals(this.pristineMessage, this.message)) {
            return true;
        }

        var message = 'You have not saved this message.';
        var question = 'Navigate away and lose changes?';
        return this.DialogService.confirm(message, question, "Yes", "No");
    };

    ComposeController.prototype.gotoPreviousState = function gotoPreviousState() {
        var $transition$ = this.$transition$;
        var hasPrevious = !!$transition$.from().name;
        var state = hasPrevious ? $transition$.from() : "mymessages.messagelist";
        var params = hasPrevious ? $transition$.params("from") : {};
        this.$state.go(state, params);
    };

    ComposeController.prototype.send = function send(message) {
        var _this = this;

        this.Messages.save(angular.extend(message, {
            date: new Date(),
            read: true,
            folder: 'sent'
        })).then(function() {
			_this.canExit = true;
            return _this.canExit;
        }).then(function() {
            return _this.gotoPreviousState();
        });
    };

    /** Save the message to the 'drafts' folder, and then go to the previous state */
    ComposeController.prototype.save = function save(message) {
        var _this2 = this;

        this.Messages.save(angular.extend(message, {
            date: new Date(),
            read: true,
            folder: 'drafts'
        })).then(function() {
			_this2.canExit = true;
            return _this2.canExit;
        }).then(function() {
            return _this2.gotoPreviousState();
        });
    };

    return ComposeController;
}();

ComposeController.$inject = ['$state', 'DialogService', 'AppConfig', 'Messages'];

var compose = {
    bindings: {
        $stateParams: '<',
        $transition$: '<'
    },

    controller: ComposeController,

    template: '\n    <div class="compose">\n      <div class="header">\n        <div class="flex-h"> <label>Recipient</label> <input type="text" id="to" name="to" ng-model="$ctrl.message.to"> </div>\n        <div class="flex-h"> <label>Subject</label> <input type="text" id="subject" name="subject" ng-model="$ctrl.message.subject"> </div>\n      </div>\n    \n      <div class="body">\n        <textarea name="body" id="body" ng-model="$ctrl.message.body" cols="30" rows="20"></textarea>\n        \n        <div class="buttons">\n          <!-- Clicking this button brings the user back to the state they came from (previous state) -->\n          <button class="btn btn-primary" ng-click="$ctrl.gotoPreviousState()"><i class="fa fa-times-circle-o"></i><span>Cancel</span></button>\n          <button class="btn btn-primary" ng-click="$ctrl.save($ctrl.message)"><i class="fa fa-save"></i><span>Save as Draft</span></button>\n          <button class="btn btn-primary" ng-click="$ctrl.send($ctrl.message)"><i class="fa fa-paper-plane-o"></i><span>Send</span></button>\n        </div>\n      </div>\n    </div>\n'
};

var folderList = {
  bindings: { folders: '<' },

  template: '\n    <!-- Renders a list of folders -->\n    <div class="folderlist">\n      <ul class="selectlist list-unstyled">\n  \n        <!-- Highlight the selected folder:\n            When the current state matches the ui-sref\'s state (and its parameters)\n            ui-sref-active applies the \'selected\' class to the li element -->\n        <li class="folder" ui-sref-active="selected" ng-repeat="folder in $ctrl.folders" >\n          <!-- This ui-sref is a relative link to the \'mymessages.messagelist\' substate. It provides the\n              \'folderId\' parameter value from the current folder\'s .id property -->\n          <a ui-sref=".messagelist({folderId: folder._id})"><i class="fa"></i>{{folder._id}}</a>\n        </li>\n      </ul>\n    </div>\n'
};

var makeResponseMsg = function makeResponseMsg(subjectPrefix, origMsg) {

	function prefixSubject(prefix, message) {
		return prefix + message.subject;
	}

	function quoteMessage(message) {
		return "\n\n\n\n---------------------------------------\nOriginal message:\nFrom: " + message.from + "\nDate: " + message.date + "\nSubject: " + message.subject + "\n\n" + message.body;
	}

    return {
        from: origMsg.to,
        to: origMsg.from,
        subject: prefixSubject(subjectPrefix, origMsg),
        body: quoteMessage(origMsg)
    };
};

var MessageController = function() {
    function MessageController($state, DialogService, Messages) {
        msos._classCallCheck(this, MessageController);

        this.$state = $state;
        this.DialogService = DialogService;
        this.Messages = Messages;
    }

    MessageController.prototype.$onInit = function $onInit() {
        this.message.read = true;
        this.Messages.put(this.message);

        this.actions = this.folder.actions.reduce(
			function(obj, action) {
				return (0, demo.router.start.setProp)(obj, action, true);
			},
			{}
		);
    };

    MessageController.prototype.reply = function reply(message) {
        var replyMsg = makeResponseMsg("Re: ", message);
        this.$state.go('mymessages.compose', {
            message: replyMsg
        });
    };

    MessageController.prototype.forward = function forward(message) {
        var fwdMsg = makeResponseMsg("Fwd: ", message);
        delete fwdMsg.to;
        this.$state.go('mymessages.compose', {
            message: fwdMsg
        });
    };

    MessageController.prototype.editDraft = function editDraft(message) {
        this.$state.go('mymessages.compose', {
            message: message
        });
    };

    MessageController.prototype.remove = function remove(message) {
        var _this = this;

        var nextMessageId = this.nextMessageGetter(message._id);
        var nextState = nextMessageId ? 'mymessages.messagelist.message' : 'mymessages.messagelist';
        var params = {
            messageId: nextMessageId
        };

        this.DialogService.confirm("Delete?", undefined).then(function() {
            return _this.Messages.remove(message);
        }).then(function() {
            return _this.$state.go(nextState, params, {
                reload: 'mymessages.messagelist'
            });
        });
    };

    return MessageController;
}();

MessageController.$inject = ['$state', 'DialogService', 'Messages'];

var message = {
    bindings: {
        folder: '<',
        message: '<',
        nextMessageGetter: '<'
    },

    controller: MessageController,

    template: "\n    <div class=\"message\">\n    \n      <div class=\"header\">\n        <div>\n          <h4>{{$ctrl.message.subject}}</h4>\n          <h5>{{$ctrl.message.from}} <i class=\"fa fa-long-arrow-right\"></i> {{$ctrl.message.to}}</h5>\n        </div>\n    \n        <div class=\"line2\">\n          <div>{{$ctrl.message.date | date: 'longDate'}} {{$ctrl.message.date | date: 'mediumTime'}}</div>\n          <div>\n            <button class=\"btn btn-primary\" ng-show=\"$ctrl.actions.edit\" ng-click=\"$ctrl.editDraft($ctrl.message)\"><i class=\"fa fa-pencil\"></i> <span>Edit Draft</span></button>\n            <button class=\"btn btn-primary\" ng-show=\"$ctrl.actions.reply\" ng-click=\"$ctrl.reply($ctrl.message)\"><i class=\"fa fa-reply\"></i> <span>Reply</span></button>\n            <button class=\"btn btn-primary\" ng-show=\"$ctrl.actions.forward\" ng-click=\"$ctrl.forward($ctrl.message)\"><i class=\"fa fa-forward\" ></i> <span>Forward</span></button>\n            <button class=\"btn btn-primary\" ng-show=\"$ctrl.actions.delete\" ng-click=\"$ctrl.remove($ctrl.message)\"><i class=\"fa fa-close\"></i> <span>Delete</span></button>\n          </div>\n        </div>\n      </div>\n    \n      <!-- Pass the raw (plain text) message body through the messageBody filter to format slightly nicer. -->\n      <div class=\"body\" ng-bind-html=\"::$ctrl.message.body | messageBody\"></div>\n    </div>\n"
};

var messageList = {
    bindings: {
        folder: '<',
        messages: '<'
    },
    template: '\n    <div class="messages">\n      <message-table columns="$ctrl.folder.columns" messages="$ctrl.messages"></message-table>\n    </div>\n'
};

var mymessages = {
    bindings: {
        folders: '<'
    },

    template: '\n    <div class="my-messages">\n    \n      <!-- Show message folders -->\n      <folder-list folders="$ctrl.folders"></folder-list>\n    \n      <!-- A named view for the list of messages in this folder.  This will be  filled in by the \'mymessages.messagelist\' child state -->\n      <div ui-view="messagelist" class="messagelist"> </div>\n    \n    </div>\n    \n    <!-- A named ui-view for a message\'s contents.  The \'mymessages.messagelist.message\' grandchild state plugs into this ui-view -->\n    <div ui-view="messagecontent"></div>\n'
};

function messageTableController(AppConfig) {
    var _this = this;

    this.AppConfig = AppConfig;
    this.colVisible = function(name) {
        return _this.columns.indexOf(name) !== -1;
    };
}

messageTableController.$inject = ['AppConfig'];

var messageTable = {
    bindings: {
        columns: '<',
        messages: '<'
    },

    controller: messageTableController,

    template: '\n    <table>\n      <thead>\n        <tr>\n          <td ng-if="::$ctrl.colVisible(\'read\')"></td>\n          <td ng-if="::$ctrl.colVisible(\'from\')"     sort-messages="from">Sender</td>\n          <td ng-if="::$ctrl.colVisible(\'to\')"       sort-messages="to">Recipient</td>\n          <td ng-if="::$ctrl.colVisible(\'subject\')"  sort-messages="subject">Subject</td>\n          <td ng-if="::$ctrl.colVisible(\'date\')"     sort-messages="date">Date</td>\n        </tr>\n      </thead>\n  \n      <tbody>\n        <tr ng-repeat="message in $ctrl.messages | orderBy: $ctrl.AppConfig.sort track by message._id"\n            ui-sref=".message({messageId: message._id})" ui-sref-active="active">\n          <td ng-if="::$ctrl.colVisible(\'read\')"><i class="fa fa-circle" style="font-size: 50%" ng-show="!message.read"></td>\n          <td ng-if="::$ctrl.colVisible(\'from\')">{{ message.from }}</td>\n          <td ng-if="::$ctrl.colVisible(\'to\')">{{ message.to }}</td>\n          <td ng-if="::$ctrl.colVisible(\'subject\')">{{ message.subject }}</td>\n          <td ng-if="::$ctrl.colVisible(\'date\')">{{ message.date | date: "yyyy-MM-dd" }}</td>\n        </tr>\n      </tbody>\n  \n    </table>\n'
};

function sortMessages(AppConfig) {
    return {
        restrict: 'A',
        link: function link(scope, elem, attrs) {
            var col = attrs.sortMessages;
            if (!col) return;
            var chevron = angular.element("<i style='padding-left: 0.25em' class='fa'></i>");
            elem.append(chevron);

            elem.on(
				"click",
				function() {
					AppConfig.sort = AppConfig.sort === '+' + col ? '-' + col : '+' + col;
					return AppConfig.sort;
				}
			);

            scope.$watch(
				function() {
					return AppConfig.sort;
				},
				function(newVal) {
					chevron.toggleClass("fa-sort-asc", newVal == '+' + col);
					chevron.toggleClass("fa-sort-desc", newVal == '-' + col);
				}
			);
        }
    };
}

sortMessages.$inject = ['AppConfig'];

function messageBody($sce) {
    return function() {
        var msgText = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        return $sce.trustAsHtml(msgText.split(/\n/).map(function(p) {
            return '<p>' + p + '</p>';
        }).join('\n'));
    };
}

messageBody.$inject = ['$sce'];

var MessageListUI = function() {
    function MessageListUI($filter, AppConfig) {
        msos._classCallCheck(this, MessageListUI);

        this.$filter = $filter;
        this.AppConfig = AppConfig;
    }

    MessageListUI.prototype.proximalMessageId = function proximalMessageId(messages, messageId) {
        var sorted = this.$filter("orderBy")(messages, this.AppConfig.sort);
        var idx = sorted.findIndex(function(msg) {
            return msg._id === messageId;
        });
        var proximalIdx = sorted.length > idx + 1 ? idx + 1 : idx - 1;
        return proximalIdx >= 0 ? sorted[proximalIdx]._id : undefined;
    };

    return MessageListUI;
}();

MessageListUI.$inject = ['$filter', 'AppConfig'];

var mymessagesState = {
    parent: 'app',
    name: "mymessages",
    url: "/mymessages",
    resolve: {
        // All the folders are fetched from the Folders service
        folders: ['Folders', function(Folders) {
            return Folders.all();
        }]
    },
    views: {
        mymessages: 'mymessages'
    },
    data: {
        requiresAuth: true
    },
    deepStateRedirect: {
        default: {
            state: 'mymessages.messagelist'
        }
    },
    sticky: true
};


var messageListState = {
    name: 'mymessages.messagelist',
    url: '/:folderId',
    params: {
        folderId: "inbox"
    },
    resolve: {
        folder: ['Folders', '$stateParams', function(Folders, $stateParams) {
            return Folders.get($stateParams.folderId);
        }],
        messages: ['Messages', 'folder', function(Messages, folder) {
            return Messages.byFolder(folder);
        }]
    },
    views: {
        messagelist: 'messageList'
    }
};

var messageState = {
    name: 'mymessages.messagelist.message',
    url: '/:messageId',
    resolve: {
        message: ['Messages', '$stateParams', function(Messages, $stateParams) {
            return Messages.get($stateParams.messageId);
        }],
        nextMessageGetter: ['MessageListUI', 'messages', function(MessageListUI, messages) {
            return MessageListUI.proximalMessageId.bind(MessageListUI, messages);
        }]
    },
    views: {
        "^.^.messagecontent": 'message'
    }
};

var composeState = {
    name: 'mymessages.compose',
    url: '/compose',
    params: {
        message: {}
    },
    views: {
        '!$default.mymessages': 'compose'
    }
};


angular.module(
	'demo.router.app.mymessages',
	['ng', 'ng.sanitize', 'ng.ui.router']
).directive(
	'sortMessages',
	sortMessages
).component(
	'compose',
	compose
).component(
	'folderList',
	folderList
).component(
	'message',
	message
).component(
	'messageList',
	messageList
).component(
	'mymessages',
	mymessages
).component(
	'messageTable',
	messageTable
).filter(
	'messageBody',
	messageBody
).service(
	'MessageListUI',
	MessageListUI
).config(
	['$stateRegistryProvider', function($stateRegistry) {
		$stateRegistry.register(composeState);
		$stateRegistry.register(messageState);
		$stateRegistry.register(messageListState);
		$stateRegistry.register(mymessagesState);
	}]
);
