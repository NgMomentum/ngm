
/*global
    msos: false,
    demo: false
*/

msos.provide("demo.router.app.states");


demo.router.app.states.appState = {
	name: 'app',
	redirectTo: 'welcome',
	component: 'demo.router.app.authed'
};

demo.router.app.states.welcomeState = {
	parent: 'app',
	name: 'welcome',
	url: '/welcome',
	component: 'demo.router.app.welcome'
};

demo.router.app.states.homeState = {
	parent: 'app',
	name: 'home',
	url: '/home',
	component: 'demo.router.app.home'
};


function returnTo($transition$) {

	if ($transition$.redirectedFrom() !== null || $transition$.redirectedFrom() !== undefined) {
		// The user was redirected to the login state (e.g., via the requiresAuth hook when trying to activate contacts)
		// Return to the original attempted target state (e.g., contacts)
		return $transition$.redirectedFrom().targetState();
	}

	var $state = $transition$.router.stateService;

	// The user was not redirected to the login state; they directly activated the login state somehow.
	// Return them to the state they came from.
	if ($transition$.from().name !== '') {
		return $state.target($transition$.from(), $transition$.params("from"));
	}

	// If the fromState's name is empty, then this was the initial transition. Just return them to the home state
	return $state.target('home');
}

returnTo.$inject = ['$transition$'];

demo.router.app.states.loginState = {
	parent: 'app',
	name: 'login',
	url: '/login',
	component: 'demo.router.app.login',
	resolve: { returnTo: returnTo }
};

demo.router.app.states.contactsFutureState = {
	parent: 'app',
	name: 'contacts.**',
	url: '/contacts',
	lazyLoad: function lazyLoad(transition) {

		return transition.injector().get('$ocLazyLoad').load(msos.resource_url('demo', 'router/app/contacts.js')).then(true);
	}
};

demo.router.app.states.prefsFutureState = {
	parent: 'app',
	name: 'prefs.**',
	url: '/prefs',
	lazyLoad: function lazyLoad(transition) {

		return transition.injector().get('$ocLazyLoad').load(msos.resource_url('demo', 'router/app/prefs.js')).then(true);
	}
};

demo.router.app.states.mymessagesFutureState = {
	parent: 'app',
	name: 'mymessages.**',
	url: '/mymessages',
	lazyLoad: function lazyLoad(transition) {

		return transition.injector().get('$ocLazyLoad').load(msos.resource_url('demo', 'router/app/mymessages.js')).then(true);
	}
};
