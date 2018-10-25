(function () {
    "use strict";

    var app = angular.module('bhResponsiveImages', []);

    // Default queries (stolen from Zurb Foundation)
    app.value(
        'presetMediaQueries',
        {
            'default':      'only screen and (min-width: 1px)',
            'small':        'only screen and (min-width: 768px)',
            'medium':       'only screen and (min-width: 1280px)',
            'large':        'only screen and (min-width: 1440px)',
            'landscape':    'only screen and (orientation: landscape)',
            'portrait':     'only screen and (orientation: portrait)',
            'retina':       'only screen and (-webkit-min-device-pixel-ratio: 2), ' +
                            'only screen and (min--moz-device-pixel-ratio: 2), ' +
                            'only screen and (-o-min-device-pixel-ratio: 2/1), ' +
                            'only screen and (min-device-pixel-ratio: 2), ' +
                            'only screen and (min-resolution: 192dpi), ' +
                            'only screen and (min-resolution: 2dppx)'
        }
    );

    app.directive(
        'bhSrcResponsive',
        ['presetMediaQueries', '$timeout', function (presetMediaQueries, $timeout) {
            return {
                restrict: 'A',
                priority: 100,
                link: function (scope, elm, attrs) {
                    // Double-check that the matchMedia function matchMedia exists
                    if (typeof matchMedia !== 'function') { throw "Function 'matchMedia' does not exist"; }

                    // Flag for whether or not we've changed the src
                    var responsiveSrcFlag = false,
                        origSrc = attrs.src,    // Watch for changes to the src attr, save it if we haven't changed it ourselves
                        listenerSets = [],
                        waiting = false,
                        updaterDereg;

                    attrs.$observe(
                        'src',
                        function (n, o) {
                            if (n !== o && n && !responsiveSrcFlag) { origSrc = n; }
                        }
                    );

                    // Array of media query and listener sets
                    // {
                    //    mql: <MediaQueryList object>
                    //    listener: function () { ... } 
                    // }

                    // Query that gets run on link, whenever the directive attr changes, and whenever 
                    function updateFromQuery(querySets) {
                        // Throttle calling this function so that multiple media query change handlers don't try to run concurrently
                        if (!waiting) {
                            $timeout(
                                function () {
                                    var lastTrueQuerySet;

                                    // Destroy registered listeners, we will re-register them below
                                    angular.forEach(
                                        listenerSets,
                                        function (set) {
                                            set.mql.removeListener(set.listener);
                                        }
                                    );

                                    // Clear the deregistration functions
                                    listenerSets = [];

                                    // for (var query in querySets) {
                                    angular.forEach(
                                        querySets,
                                        function (set) {
                                            var queryText = set[0],
                                                query = queryText,
                                                mq,
                                                queryListener;

                                            if (presetMediaQueries.hasOwnProperty(queryText)) {
                                                query = presetMediaQueries[queryText];
                                            }

                                            mq = matchMedia(query);

                                            if (mq.matches) {
                                                lastTrueQuerySet = set;
                                            }

                                            // Listener function for this query
                                            queryListener = function () {
                                                // TODO: add throttling or a debounce here (or somewhere) to prevent this function from being called a ton of times
                                                updateFromQuery(querySets);
                                            };

                                            // Add a listener for when this query's match changes
                                             mq.addListener(queryListener);

                                            listenerSets.push({
                                                mql: mq,
                                                listener: queryListener
                                            });
                                        }
                                    );

                                    if (lastTrueQuerySet) {
                                        setSrc(lastTrueQuerySet[1]);
                                        responsiveSrcFlag = true;
                                    } else {
                                        setSrc(origSrc);
                                    }

                                    waiting = false;
                                },
                                0,
								false
                            );

                            waiting = true;
                        }
                    }


                    function setSrc(src) { elm.attr('src', src); }

                    attrs.$observe(
                        'bhSrcResponsive',
                        function (value) {
                            var querySets = scope.$eval(value);

                            if (querySets instanceof Array === false) {
                                throw "Expected evaluate bh-src-responsive to evaluate to an Array, instead got: " + querySets;
                            }

                            updateFromQuery(querySets);

                            // Remove the previous matchMedia listener
                            if (typeof(updaterDereg) === 'function') {
                                updaterDereg();
                            }
                        }
                    );

                    // Remove media-query listeners when $scope is destroyed
                    scope.$on(
                        '$destroy',
                        function () {
                            angular.forEach(
                                listenerSets,
                                function (set) {
                                    set.mql.removeListener(set.listener);
                                }
                            );
                        }
                    );
                }
            };
        }]
    );

}());