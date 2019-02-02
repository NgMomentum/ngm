
/*global
    msos: false,
    angular: false,
    demo: false
*/

msos.provide("demo.uirouter.advanced.app.mymessages");

demo.uirouter.advanced.app.mymessages.version = new msos.set_version(18, 12, 20);


var ComposeController = (function () {
	"use strict";

    function ComposeController($state, DialogService, AppConfig, Messages, $stateParams) {
        msos._classCallCheck(this, ComposeController);

        this.$state = $state;
        this.DialogService = DialogService;
        this.AppConfig = AppConfig;
        this.Messages = Messages;
		this.$stateParams = $stateParams;
    }

    ComposeController.prototype.$onInit = function $onInit() {
        this.pristineMessage = angular.extend(
			{ from: this.AppConfig.emailAddress },
			this.$stateParams.message
		);
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
        var $transition$ = this.compTransition;
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
        })).then(function () {
			_this.canExit = true;
            return _this.canExit;
        }).then(function () {
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
        })).then(function () {
			_this2.canExit = true;
            return _this2.canExit;
        }).then(function () {
            return _this2.gotoPreviousState();
        });
    };

    return ComposeController;
}());


var makeResponseMsg = function makeResponseMsg(subjectPrefix, origMsg) {
	"use strict";

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

var MessageController = function () {
	"use strict";

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
			function (obj, action) {
				obj[action] = true;
				return obj;
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

        this.DialogService.confirm("Delete?", undefined).then(function () {
            return _this.Messages.remove(message);
        }).then(function () {
            return _this.$state.go(nextState, params, {
                reload: 'mymessages.messagelist'
            });
        });
    };

    return MessageController;
}();

var messageTableController = function (AppConfig) {
	"use strict";

    var _this = this;

    this.AppConfig = AppConfig;
    this.colVisible = function (name) {
		var t_or_f = _this.columns.indexOf(name) !== -1 ? true : false;
		msos.console.debug('demo.uirouter.advanced.app.mymessages - messageTableController -> called, name: ' + name + ', t/f: ' + t_or_f);
        return t_or_f;
    };
};


angular.module(
	'demo.uirouter.advanced.app.mymessages',
	['ng', 'ng.ui.router']
).config(
	['$stateProvider', function ($stateProvider) {

		$stateProvider.state({
			name: 'mymessages.compose',
			url: '/compose',
			params: {
				message: {}
			},
			views: {
				'!$default.mymessages': 'compose'
			},
			resolve: { compTransition: ['$transition$', function ($transition$) { return $transition$; }] }
		}).state({
			name: 'mymessages.messagelist.message',
			url: '/:messageId',
			resolve: {
				message: ['Messages', '$stateParams', function (Messages, $stateParams) {
					return Messages.get($stateParams.messageId);
				}],
				nextMessageGetter: ['MessageListUI', 'messages', function (MessageListUI, messages) {
					return MessageListUI.proximalMessageId.bind(MessageListUI, messages);
				}]
			},
			views: {
				"^.^.messagecontent": 'message'
			}
		}).state({
			name: 'mymessages.messagelist',
			url: '/:folderId',
			params: {
				folderId: "inbox"
			},
			resolve: {
				folder: ['Folders', '$stateParams', function (Folders, $stateParams) {
					return Folders.get($stateParams.folderId);
				}],
				messages: ['Messages', 'folder', function (Messages, folder) {
					msos.console.debug('demo.uirouter.advanced.app.mymessages - state (mymessages.messagelist) -> Messages', Messages);
					return Messages.byFolder(folder);
				}]
			},
			views: {
				messagelist: 'messageList'
			}
		}).state({
			parent: 'app',
			name: "mymessages",
			url: "/mymessages",
			resolve: {
				// All the folders are fetched from the Folders service
				folders: ['Folders', function (Folders) {
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
				default: { state: 'mymessages.messagelist' }
			},
			sticky: true
		});
	}]
).component(
	'compose',
	{
		bindings: { compTransition: '<?' },
		controller: ['$state', 'DialogService', 'AppConfig', 'Messages', '$stateParams', ComposeController],
		templateUrl: msos.resource_url('demo', 'uirouter/advanced/template/compose.html')
	}
).component(
	'folderList',
	{
		bindings: { folders: '<?' },
		templateUrl: msos.resource_url('demo', 'uirouter/advanced/template/folderList.html')
	}
).component(
	'message',
	{
		bindings: {
			folder: '<?',
			message: '<?',
			nextMessageGetter: '<?'
		},
		controller: ['$state', 'DialogService', 'Messages', MessageController],
		templateUrl: msos.resource_url('demo', 'uirouter/advanced/template/message.html')
	}
).component(
	'messageList',
	{
		bindings: {
			folder: '<?',
			messages: '<?'
		},
		templateUrl: msos.resource_url('demo', 'uirouter/advanced/template/messageList.html')
	}
).component(
	'mymessages',
	{
		bindings: {
			folders: '<?'
		},
		templateUrl: msos.resource_url('demo', 'uirouter/advanced/template/mymessages.html')
	}
).component(
	'messageTable',
	{
		bindings: {
			columns: '<?',
			messages: '<?'
		},
		controller: ['AppConfig', messageTableController],
		templateUrl: msos.resource_url('demo', 'uirouter/advanced/template/messageTable.html')
	}
);
