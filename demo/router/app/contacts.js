
var contactDetail = {
    bindings: {
        contact: '<'
    },

    template: '\n    <div class="flex-h">\n      <div class="details">\n        <h3>{{$ctrl.contact.name.first}} {{$ctrl.contact.name.last}}</h3>\n        <div><label>Company</label><div>{{$ctrl.contact.company}}</div></div>\n        <div><label>Age</label><div>{{$ctrl.contact.age}}</div></div>\n        <div><label>Phone</label><div>{{$ctrl.contact.phone}}</div></div>\n        <div><label>Email</label><div>{{$ctrl.contact.email}}</div></div>\n        <div class="flex-h">\n          <label>Address</label>\n          <div>{{$ctrl.contact.address.street}}<br>\n                {{$ctrl.contact.address.city}}, {{$ctrl.contact.address.state}} {{$ctrl.contact.address.zip}}\n          </div>\n        </div>\n      </div>\n  \n      <div class="flex nogrow">\n        <img ng-src="{{$ctrl.contact.picture}}"/>\n      </div>\n    </div>\n'
};

var contactList = {
    bindings: {
        contacts: '<'
    },

    template: '\n    <ul class="selectlist list-unstyled flex nogrow">\n      <li>\n        <!-- This link is a relative ui-sref to the contacts.new state. -->\n        <a ui-sref=".new">\n          <button class="btn btn-primary">\n            <i class="fa fa-pencil"></i><span>New Contact</span>\n          </button>\n        </a>\n      </li>\n  \n      <li>&nbsp;</li>\n  \n      <!-- Highlight the selected contact:\n          When the current state matches the ui-sref\'s state (and its parameters)\n          ui-sref-active applies the \'selected\' class to the a element -->\n      <li ng-repeat="contact in $ctrl.contacts">\n        <a ui-sref=".contact({contactId: contact._id})" ui-sref-active="selected">\n          {{contact.name.first}} {{contact.name.last}}\n        </a>\n      </li>\n    </ul>\n'
};

var contacts = {
    bindings: {
        contacts: '<'
    },

    template: '\n    <div class="my-contacts flex-h">\n    \n      <contact-list contacts="$ctrl.contacts" class="flex nogrow"></contact-list>\n    \n      <div ui-view>\n        <!-- This default content is displayed when the ui-view is not filled in by a child state -->\n        <h4 style="margin: 1em 2em;">Select a contact</h4>\n      </div>\n      \n    </div>'
};

var contactView = {
    bindings: {
        contact: '<'
    },

    template: '\n    <div class="contact">\n    \n      <contact-detail contact="$ctrl.contact"></contact-detail>\n      \n      <!-- This button has an ui-sref to the mymessages.compose state. The ui-sref provides the mymessages.compose\n           state with an non-url parameter, which is used as the initial message model -->\n      <button class="btn btn-primary" ui-sref="mymessages.compose({ message: { to: $ctrl.contact.email } })">\n        <i class="fa fa-envelope"></i><span>Message</span>\n      </button>\n    \n      <!-- This button has a relative ui-sref to the contacts.contact.edit state. -->\n      <button class="btn btn-primary" ui-sref=".edit">\n        <i class="fa fa-pencil"></i><span>Edit Contact</span>\n      </button>\n      \n    </div>\n'
};

var EditContactController = function() {
    function EditContactController($state, DialogService, Contacts) {
        msos._classCallCheck(this, EditContactController);

        this.$state = $state;
        this.DialogService = DialogService;
        this.Contacts = Contacts;
    }

    EditContactController.prototype.$onInit = function $onInit() {
        // Make an editable copy of the pristineContact
        this.contact = angular.copy(this.pristineContact);
    };

    EditContactController.prototype.uiCanExit = function uiCanExit() {
        if (this.canExit || angular.equals(this.contact, this.pristineContact)) {
            return true;
        }

        var message = 'You have unsaved changes to this contact.';
        var question = 'Navigate away and lose changes?';

        return this.DialogService.confirm(message, question);
    };

    EditContactController.prototype.remove = function remove(contact) {
        var _this = this;

        this.DialogService.confirm('Delete contact: ' + contact.name.first + ' ' + contact.name.last).then(function() {
            return _this.Contacts.remove(contact);
        }).then(function() {
			_this.canExit = true;

            return _this.canExit;
        }).then(function() {
            return _this.$state.go("^.^", null, {
                reload: true
            });
        });
    };

    EditContactController.prototype.save = function save(contact) {
        var _this2 = this;

        this.Contacts.save(contact).then(function() {
			_this2.canExit = true;
            return _this2.canExit;
        }).then(function() {
            return _this2.$state.go("^", null, {
                reload: true
            });
        });
    };

    return EditContactController;
}();

EditContactController.$inject = ['$state', 'DialogService', 'Contacts'];

var editContact = {
    bindings: {
        pristineContact: '<'
    },

    controller: EditContactController,

    template: '\n    <div class="contact">\n      <div class="details">\n        <div><label>First</label>   <input type="text" ng-model="$ctrl.contact.name.first"></div>\n        <div><label>Last</label>    <input type="text" ng-model="$ctrl.contact.name.last"></div>\n        <div><label>Company</label> <input type="text" ng-model="$ctrl.contact.company"></div>\n        <div><label>Age</label>     <input type="text" ng-model="$ctrl.contact.age"></div>\n        <div><label>Phone</label>   <input type="text" ng-model="$ctrl.contact.phone"></div>\n        <div><label>Email</label>   <input type="text" ng-model="$ctrl.contact.email"></div>\n        <div><label>Street</label>  <input type="text" ng-model="$ctrl.contact.address.street"></div>\n        <div><label>City</label>    <input type="text" ng-model="$ctrl.contact.address.city"> </div>\n        <div><label>State</label>   <input type="text" ng-model="$ctrl.contact.address.state"></div>\n        <div><label>Zip</label>     <input type="text" ng-model="$ctrl.contact.address.zip"></div>\n        <div><label>Image</label>   <input type="text" ng-model="$ctrl.contact.picture"></div>\n      </div>\n    \n      <hr>\n    \n      <div>\n        <!-- This button\'s ui-sref relatively targets the parent state, i.e., contacts.contact -->\n        <button class="btn btn-primary" ui-sref="^"><i class="fa fa-close"></i><span>Cancel</span></button>\n        <button class="btn btn-primary" ng-click="$ctrl.save($ctrl.contact)"><i class="fa fa-save"></i><span>Save</span></button>\n        <button class="btn btn-primary" ng-click="$ctrl.remove($ctrl.contact)"><i class="fa fa-close"></i><span>Delete</span></button>\n      </div>\n    </div>\n'
};

var contactsState = {
    parent: 'app', // declares that 'contacts' is a child of 'app'
    name: "contacts",
    url: "/contacts",
    resolve: {
        contacts: ['Contacts', function(Contacts) {
            return Contacts.all();
        }]
    },
    data: {
        requiresAuth: true
    },
    deepStateRedirect: true,
    sticky: true,
    views: {
        contacts: 'demo.router.app.contacts.contacts'
    }
};

var viewContactState = {
    name: 'contacts.contact',
    url: '/:contactId',
    resolve: {
        contact: ['Contacts', '$transition$', function(Contacts, $transition$) {
            return Contacts.get($transition$.params().contactId);
        }]
    },
    component: 'demo.router.app.contacts.contactView'
};

var editContactState = {
    name: 'contacts.contact.edit',
    url: '/edit',
    views: {
        '^.^.$default': {
            bindings: {
                pristineContact: "contact"
            },
            component: 'demo.router.app.contacts.editContact'
        }
    }
};

var newContactState = {
    name: 'contacts.new',
    url: '/new',
    component: 'demo.router.app.contacts.editContact'
};


angular.module(
	'demo.router.app.contacts',
	['ng', 'ng.ui.router']
).component(
	'demo.router.app.contacts.contactView',
	contactView
).component(
	'demo.router.app.contacts.contacts',
	contacts
).component(
	'demo.router.app.contacts.editContact',
	editContact
).component(
	'demo.router.app.contacts.contactDetail',
	contactDetail
).component(
	'demo.router.app.contacts.contactList',
	contactList
).config(
	['$stateRegistryProvider', function($stateRegistry) {
		$stateRegistry.register(contactsState);
		$stateRegistry.register(newContactState);
		$stateRegistry.register(viewContactState);
		$stateRegistry.register(editContactState);
	}]
);
