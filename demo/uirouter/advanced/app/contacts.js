
/*global
    msos: false,
    demo: false
*/

msos.provide("demo.uirouter.advanced.app.contacts");

demo.uirouter.advanced.app.contacts.version = new msos.set_version(18, 12, 8);


var EditContactController = (function () {
	"use strict";

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

		if (contact && typeof contact === 'object') {
			this.DialogService.confirm('Delete contact: ' + contact.name.first + ' ' + contact.name.last).then(function () {
				return _this.Contacts.remove(contact);
			}).then(function () {
				_this.canExit = true;
	
				return _this.canExit;
			}).then(function () {
				return _this.$state.go("^.^", null, {
					reload: true
				});
			});
		}
    };

    EditContactController.prototype.save = function save(contact) {
        var _this2 = this;

		if (contact && typeof contact === 'object') {
			this.Contacts.save(contact).then(function () {
				_this2.canExit = true;
				return _this2.canExit;
			}).then(function () {
				return _this2.$state.go("^", null, {
					reload: true
				});
			});
		}
    };

    return EditContactController;
}());

angular.module(
	'demo.uirouter.advanced.app.contacts',
	[
	 'ng',
	 'ng.ui.router'
	]
).config(
	['$stateProvider', function ($stateProvider) {
		"use strict";

		$stateProvider.state({
			parent: 'app', // declares that 'contacts' is a child of 'app'
			name: "contacts",
			url: "/contacts",
			resolve: {
				contacts: ['Contacts', function (Contacts) {
					return Contacts.all();
				}]
			},
			data: { requiresAuth: true },
			deepStateRedirect: true,
			sticky: true,
			views: {
				contacts: 'contacts'
			}
		}).state({
			name: 'contacts.new',
			url: '/new',
			component: 'editContact'
		}).state({
			name: 'contacts.contact',
			url: '/:contactId',
			resolve: {
				contact: ['Contacts', '$transition$', function (Contacts, $transition$) {
					return Contacts.get($transition$.params().contactId);
				}]
			},
			component: 'contactView'
		}).state({
			name: 'contacts.contact.edit',
			url: '/edit',
			views: {
				'^.^.$default': {
					bindings: { pristineContact: "contact" },
					component: 'editContact'
				}
			}
		});
	}]
).component(
	'contactView',
	{
		bindings: { contact: '<?' },
		templateUrl: msos.resource_url('demo', 'uirouter/advanced/template/contactView.html') 
	}
).component(
	'contacts',
	{
		bindings: { contacts: '<?' },
		templateUrl: msos.resource_url('demo', 'uirouter/advanced/template/contacts.html') 
	}
).component(
	'editContact',
	{
		bindings: { pristineContact: '<?' },
		controller: ['$state', 'DialogService', 'Contacts', EditContactController],
		templateUrl: msos.resource_url('demo', 'uirouter/advanced/template/editContact.html')
	}
).component(
	'contactDetail',
	{
		bindings: { contact: '<?' },
		templateUrl: msos.resource_url('demo', 'uirouter/advanced/template/contactDetail.html')
	}
).component(
	'contactList',
	{
		bindings: { contacts: '<?' },
		templateUrl: msos.resource_url('demo', 'uirouter/advanced/template/contactList.html') 
	}
);
