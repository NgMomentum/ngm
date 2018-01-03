// # ngReact
//
// Composed of
// - reactComponent (generic directive for delegating off to React Components)
// - reactDirective (factory for creating specific directives that correspond to reactComponent directives)

/*global
    msos: false,
    _: false,
    angular: false
*/

(function(root, factory) {
    root.ngReact = factory(root.React, root.ReactDOM);
}(this, function ngReact(React, ReactDOM) {
    "use strict";

    function getReactComponent(name, $injector) {
		var reactComponent;

        if (angular.isFunction(name)) {
            return name;
        }

        if (!name) {
            throw new Error('ReactComponent name attribute must be specified');
        }

        try {
            reactComponent = $injector.get(name);
        } catch (e) {
			msos.console.error('ng.react - getReactComponent -> $injector.get failed:', e);
		}

        if (!reactComponent) {
            try {
                reactComponent = name.split('.').reduce(
					function (current, namePart) {
						return current[namePart];
					},
					window
				);
            } catch (e) {
				msos.console.error('ng.react - getReactComponent -> $injector.get failed:', e);
			}
        }

        if (!reactComponent) {
            throw Error('ng.react - getReactComponent -> cannot find react component ' + name);
        }

        return reactComponent;
    }

    function applied(fn, scope) {

        if (fn.wrappedInApply) {
            return fn;
        }

        var wrapped = function () {
            var args = arguments,
				phase = scope.$root.$$phase;

            if (phase === "$apply" || phase === "$digest") {
                return fn.apply(null, args);
            } else {
                return scope.$apply(
					function () {
						return fn.apply(null, args);
					}
				);
            }
        };

        wrapped.wrappedInApply = true;
        return wrapped;
    }

    function applyFunctions(obj, scope, propsConfig) {

        return Object.keys(obj || {}).reduce(
			function(prev, key) {
				var value = obj[key],
					config = (propsConfig || {})[key] || {};

				prev[key] = angular.isFunction(value) && config.wrapApply !== false ? applied(value, scope) : value;

				return prev;
			},
			{}
		);
    }

    function watchProps(watchDepth, scope, watchExpressions, listener) {
        var supportsWatchCollection = angular.isFunction(scope.$watchCollection),
			supportsWatchGroup = angular.isFunction(scope.$watchGroup),
			watchGroupExpressions = [];

        watchExpressions.forEach(
			function (expr) {
				var actualExpr = getPropExpression(expr),
					exprWatchDepth = getPropWatchDepth(watchDepth, expr);

				if (exprWatchDepth === 'collection' && supportsWatchCollection) {
					scope.$watchCollection(actualExpr, listener);
				} else if (exprWatchDepth === 'reference' && supportsWatchGroup) {
					watchGroupExpressions.push(actualExpr);
				} else {
					scope.$watch(actualExpr, listener, (exprWatchDepth !== 'reference'));
				}
			}
		);

        if (watchGroupExpressions.length) {
            scope.$watchGroup(watchGroupExpressions, listener);
        }
    }

    function renderComponent(component, props, scope, elem) {
        scope.$evalAsync(
			function () {
				ReactDOM.render(
					React.createElement(component, props),
					elem[0]
				);
			}
		);
    }

    function getPropName(prop) {
        return (_.isArray(prop)) ? prop[0] : prop;
    }

    function getPropConfig(prop) {
        return (_.isArray(prop)) ? prop[1] : {};
    }

    function getPropExpression(prop) {
        return (_.isArray(prop)) ? prop[0] : prop;
    }

    function findAttribute(attrs, propName) {
        var index = Object.keys(attrs).filter(
				function (attr) {
					return attr.toLowerCase() === propName.toLowerCase();
				}
			)[0];

        return attrs[index];
    }

    function getPropWatchDepth(defaultWatch, prop) {
        var customWatchDepth = ( _.isArray(prop) && angular.isObject(prop[1]) && prop[1].watchDepth);

        return customWatchDepth || defaultWatch;
    }

    // # reactComponent
    // Directive that allows React components to be used in Angular templates.
    //
    // Usage:
    //     <react-component name="Hello" props="name"/>
    //
    // This requires that there exists an injectable or globally available 'Hello' React component.
    // The 'props' attribute is optional and is passed to the component.
    //
    // The following would would create and register the component:
    //
    //     var module = angular.module('ace.react.components');
    //     module.value('Hello', React.createClass({
    //         render: function() {
    //             return <div>Hello {this.props.name}</div>;
    //         }
    //     }));
    //
    var reactComponent = function ($injector) {
        return {
            restrict: 'E',
            replace: true,
            link: function (scope, elem, attrs) {
                var reactComponent = getReactComponent(attrs.name, $injector),
					renderMyComponent = function () {
						var scopeProps = scope.$eval(attrs.props),
							props = applyFunctions(scopeProps, scope);

						renderComponent(reactComponent, props, scope, elem);
					};

				if (attrs.props) {
					watchProps(attrs.watchDepth, scope, [attrs.props], renderMyComponent);
				} else {
					renderMyComponent();
				}

                scope.$on(
					'$destroy',
					function () {
						if (!attrs.onScopeDestroy) {
							ReactDOM.unmountComponentAtNode(elem[0]);
						} else {
							scope.$eval(
								attrs.onScopeDestroy,
								{ unmountComponent: ReactDOM.unmountComponentAtNode.bind(this, elem[0]) }
							);
						}
					}
				);
            }
        };
    };

    // # reactDirective
    // Factory function to create directives for React components.
    //
    // With a component like this:
    //
    //     var module = angular.module('ace.react.components');
    //     module.value('Hello', React.createClass({
    //         render: function() {
    //             return <div>Hello {this.props.name}</div>;
    //         }
    //     }));
    //
    // A directive can be created and registered with:
    //
    //     module.directive('hello', function(reactDirective) {
    //         return reactDirective('Hello', ['name']);
    //     });
    //
    // Where the first argument is the injectable or globally accessible name of the React component
    // and the second argument is an array of property names to be watched and passed to the React component
    // as props.
    //
    // This directive can then be used like this:
    //
    //     <hello name="name"/>
    //
    var reactDirective = function ($injector) {

        return function (reactComponentName, props, conf, injectableProps) {
            var directive = {
					restrict: 'E',
					replace: true,
					link: function (scope, elem, attrs) {
						var reactComponent = getReactComponent(reactComponentName, $injector),
							ngAttrNames = [];

						props = props || Object.keys(reactComponent.propTypes || {});

						if (!props.length) {
							angular.forEach(
								attrs.$attr,
								function (value, key) { ngAttrNames.push(key); }
							);

							props = ngAttrNames;
						}

						var renderMyComponent = function () {
								var scopeProps = {},
									config = {};

								props.forEach(
									function (prop) {
										var propName = getPropName(prop);

											scopeProps[propName] = scope.$eval(findAttribute(attrs, propName));
											config[propName] = getPropConfig(prop);
									}
								);

								scopeProps = applyFunctions(scopeProps, scope, config);
								scopeProps = angular.extend({}, scopeProps, injectableProps);
								renderComponent(reactComponent, scopeProps, scope, elem);
							},
							propExpressions = props.map(
								function (prop) {
									return (_.isArray(prop)) ? [attrs[getPropName(prop)], getPropConfig(prop)] : attrs[prop];
								}
							);

						watchProps(attrs.watchDepth, scope, propExpressions, renderMyComponent);

						renderMyComponent();

						scope.$on(
							'$destroy',
							function () {
								if (!attrs.onScopeDestroy) {
									ReactDOM.unmountComponentAtNode(elem[0]);
								} else {
									scope.$eval(
										attrs.onScopeDestroy,
										{ unmountComponent: ReactDOM.unmountComponentAtNode.bind(this, elem[0]) }
									);
								}
							}
						);
					}
				};

				return angular.extend(directive, conf);
			};
	};

    return angular.module(
			'react',
			['ng']
		).directive(
			'reactComponent',
			['$injector', reactComponent]
		).factory(
			'reactDirective',
			['$injector', reactDirective]
		);
}));