
var _SHOW_ALL$SHOW_COMPLE = {},
	SHOW_ALL = 'show_all',
	SHOW_COMPLETED = 'show_completed',
	SHOW_ACTIVE = 'show_active';

function showAll() {
    return true;
}

function showCompleted(todo) {
    return todo.completed;
}

function showActive(todo) {
    return !todo.completed;
}

msos._defineProperty(
	_SHOW_ALL$SHOW_COMPLE,
	_TodoFilters.SHOW_ALL,
	{
		filter: showAll,
		type: _TodoFilters.SHOW_ALL
	}
);
msos._defineProperty(
	_SHOW_ALL$SHOW_COMPLE,
	_TodoFilters.SHOW_COMPLETED,
	{
		filter: showCompleted,
		type: _TodoFilters.SHOW_COMPLETED
	}
);
msos._defineProperty(
	_SHOW_ALL$SHOW_COMPLE,
	_TodoFilters.SHOW_ACTIVE,
	{
		filter: showActive,
		type: _TodoFilters.SHOW_ACTIVE
	}
);

var initialTodo = {
    text: 'Replace AngularJS with Vue 2.0',
    completed: false,
    id: 0
};

var TodoService = function() {
	"use strict";

    function TodoService() {
        msos._classCallCheck(this, TodoService);
    }

    msos._createClass(
		TodoService,
		[{
			key: 'addTodo',
			value: function addTodo(text, todos) {
				return [{
					id: todos.length === 0 ? 0 : todos[0].id + 1,
					completed: false,
					text: text
				}].concat(todos);
			}
		}, {
			key: 'completeTodo',
			value: function completeTodo(id, todos) {
				return todos.map(function(todo) {
					return todo.id === id ? Object.assign({}, todo, {
						completed: !todo.completed
					}) : todo;
				});
			}
		}, {
			key: 'deleteTodo',
			value: function deleteTodo(id, todos) {
				return todos.filter(function(todo) {
					return todo.id !== id;
				});
			}
		}, {
			key: 'editTodo',
			value: function editTodo(id, text, todos) {
				return todos.map(function(todo) {
					return todo.id === id ? Object.assign({}, todo, {
						text: text
					}) : todo;
				});
			}
		}, {
			key: 'completeAll',
			value: function completeAll(todos) {
				var areAllMarked = todos.every(function(todo) {
					return todo.completed;
				});
				return todos.map(function(todo) {
					return Object.assign({}, todo, {
						completed: !areAllMarked
					});
				});
			}
		}, {
			key: 'clearCompleted',
			value: function clearCompleted(todos) {
				return todos.filter(function(todo) {
					return todo.completed === false;
				});
			}
		}]
	);

    return TodoService;
}();

var AppController = function() {
	"use strict";

    function AppController() {
        msos._classCallCheck(this, AppController);
    }

    msos._createClass(
		AppController,
		[{
			key: '$onInit',
			value: function $onInit() {
				this.todos = [initialTodo];
				this.filter = SHOW_ALL;
			}
		}]
	);

    return AppController;
}();

var HeaderController = function() {
    /** @ngInject */
    function HeaderController(todoService) {
        msos._classCallCheck(this, HeaderController);

        this.todoService = todoService;
    }

    msos._createClass(HeaderController, [{
        key: 'handleSave',
        value: function handleSave(text) {
            if (text.length !== 0) {
                this.todos = this.todoService.addTodo(text, this.todos);
            }
        }
    }]);

    return HeaderController;
}();

var MainSectionController = function() {
    /** @ngInject */
    function MainSectionController(todoService) {
        msos._classCallCheck(this, MainSectionController);

        this.todoService = todoService;
    }

    msos._createClass(
		MainSectionController,
		[{
			key: '$onInit',
			value: function $onInit() {
				this.selectedFilter = visibilityFilters[this.filter];
				this.completeReducer = function(count, todo) {
					return todo.completed ? count + 1 : count;
				};
			}
		}, {
			key: 'handleClearCompleted',
			value: function handleClearCompleted() {
				this.todos = this.todoService.clearCompleted(this.todos);
			}
		}, {
			key: 'handleCompleteAll',
			value: function handleCompleteAll() {
				this.todos = this.todoService.completeAll(this.todos);
			}
		}, {
			key: 'handleShow',
			value: function handleShow(filter) {
				this.filter = filter;
				this.selectedFilter = visibilityFilters[filter];
			}
		}, {
			key: 'handleChange',
			value: function handleChange(id) {
				this.todos = this.todoService.completeTodo(id, this.todos);
			}
		}, {
			key: 'handleSave',
			value: function handleSave(e) {
				if (e.text.length === 0) {
					this.todos = this.todoService.deleteTodo(e.id, this.todos);
				} else {
					this.todos = this.todoService.editTodo(e.id, e.text, this.todos);
				}
			}
		}, {
			key: 'handleDestroy',
			value: function handleDestroy(e) {
				this.todos = this.todoService.deleteTodo(e, this.todos);
			}
		}]
	);

    return MainSectionController;
}();

var TodoTextInputController = function() {
	"use strict";

    /** @ngInject */
    function TodoTextInputController($window, $timeout) {
        msos._classCallCheck(this, TodoTextInputController);

        this.$timeout = $timeout;
        this.$window = $window;
    }

    msos._createClass(TodoTextInputController, [{
        key: '$onInit',
        value: function $onInit() {
            this.editing = this.editing || false;
            this.text = this.text || '';
            if (this.text.length) {
                this.focus();
            }
        }
    }, {
        key: 'handleBlur',
        value: function handleBlur() {
            if (!this.newTodo) {
                this.onSave({
                    text: this.text
                });
            }
        }
    }, {
        key: 'handleSubmit',
        value: function handleSubmit(e) {
            if (e.keyCode === 13) {
                this.onSave({
                    text: this.text
                });
                if (this.newTodo) {
                    this.text = '';
                }
            }
        }
    }, {
        key: 'focus',
        value: function focus() {
            var _this = this;

            this.$timeout(function() {
                var element = _this.$window.document.querySelector('.editing .textInput');
                if (element) {
                    element.focus();
                }
            }, 10);
        }
    }]);

    return TodoTextInputController;
}();

var TodoItemController = function() {
	"use strict";

    function TodoItemController() {
        msos._classCallCheck(this, TodoItemController);
    }

    msos._createClass(
		TodoItemController,
		[{
			key: '$onInit',
			value: function $onInit() {
				this.editing = false;
			}
		}, {
			key: 'handleDoubleClick',
			value: function handleDoubleClick() {
				this.editing = true;
			}
		}, {
			key: 'handleSave',
			value: function handleSave(text) {
				this.onSave({
					todo: {
						text: text,
						id: this.todo.id
					}
				});
				this.editing = false;
			}
		}, {
			key: 'handleDestroy',
			value: function handleDestroy(id) {
				this.onDestroy({
					id: id
				});
			}
		}]
	);

    return TodoItemController;
}();

var FooterController = function() {
	"use strict";

    function FooterController() {
        msos._classCallCheck(this, FooterController);
    }

    msos._createClass(
		FooterController,
		[{
			key: '$onInit',
			value: function $onInit() {
				var _filterTitles;
	
				this.filters = [SHOW_ALL, SHOW_ACTIVE, SHOW_COMPLETED];
				this.filterTitles = (
					_filterTitles = {},
					msos._defineProperty(_filterTitles, SHOW_ALL, 'All'),
					msos._defineProperty(_filterTitles, SHOW_ACTIVE, 'Active'),
					msos._defineProperty(_filterTitles, SHOW_COMPLETED, 'Completed'),
					_filterTitles
				);
			}
		}, {
			key: 'handleClear',
			value: function handleClear() {
				this.onClearCompleted();
			}
		}, {
			key: 'handleChange',
			value: function handleChange(filter) {
				this.onShow({
					filter: filter
				});
			}
		}]
	);

    return FooterController;
}();


angular.module(
	'app',
	['ng']
).service(
	'todoService',
	TodoService
).component(
	'app',
	{
		templateUrl: msos.resource_url('demo', 'vue/todo/components/App.html'),
		controller: AppController
	}
).component(
	'headerComponent',
	{
		templateUrl: msos.resource_url('demo', 'vue/todo/components/Header.html'),
		controller: HeaderController,
		bindings: {
			todos: '='
		}
	}
).component(
	'footerComponent',
	{
		templateUrl: msos.resource_url('demo', 'vue/todo/components/Footer.html'),
		controller: FooterController,
		bindings: {
			completedCount: '<',
			activeCount: '<',
			selectedFilter: '<filter',
			onClearCompleted: '&',
			onShow: '&'
		}
	}
).component(
	'mainSection',
	{
		templateUrl: msos.resource_url('demo', 'vue/todo/components/MainSection.html'),
		controller: MainSectionController,
		bindings: {
			todos: '=',
			filter: '<'
		}
	}
).component(
	'todoTextInput',
	{
		templateUrl: msos.resource_url('demo', 'vue/todo/components/TodoTextInput.html'),
		controller: ['$window', '$timeout', TodoTextInputController],
		bindings: {
			onSave: '&',
			placeholder: '@',
			newTodo: '@',
			editing: '@',
			text: '<'
		}
	}
).component(
	'todoItem',
	{
		templateUrl: msos.resource_url('demo', 'vue/todo/app/component/TodoItem.html'),
		controller: TodoItemController,
		bindings: {
			todo: '<',
			onDestroy: '&',
			onChange: '&',
			onSave: '&'
		}
	}
);
