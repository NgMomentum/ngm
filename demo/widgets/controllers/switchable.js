
msos.provide("demo.widgets.controllers.switchable");
msos.require("ng.util.resource");

demo.widgets.controllers.switchable.version = new msos.set_version(16, 7, 20);


angular.module(
    'demo.widgets.controllers.switchable', ['ng.util.resource']
).factory(
    'instagram',
    ['$resource', function ($resource) {

        return {
            fetchPopular: function (callback) {

                // The ngResource module gives us the $resource service. It makes working with
                // AJAX easy. Here I am using a client_id of a test app. Replace it with yours.

                var api = $resource(
                        'https://api.instagram.com/v1/media/popular?client_id=:client_id&callback=JSON_CALLBACK',
                        {
                            client_id: '642176ece1e7445e99244cec26f4de1f'
                        },
                        {
                            // This creates an action which we've chosen to name "fetch". It issues
                            // an JSONP request to the URL of the resource. JSONP requires that the
                            // callback=JSON_CALLBACK part is added to the URL.
                            fetch:{method:'JSONP'}
                        }
                    );

                api.fetch(
                    function (response) {
                        // Call the supplied callback function
                        callback(response.data);
                    }
                );
            }
        }
    }]
).controller(
    'demo.widgets.controllers.switchable.ctrl',
    [
        '$scope', 'instagram',
        function ($scope, instagram) {
            // Default layout of the app. Clicking the buttons in the toolbar
            // changes this value.
            $scope.layout = 'grid';
            $scope.pics = [];

            // Use the instagram service and fetch a list of the popular pics
            instagram.fetchPopular(
                function (data){
                    // Assigning the pics array will cause the view
                    // to be automatically redrawn by Angular.
                    $scope.pics = data;

                    msos.console.debug('demo.widgets.controllers.switchable.ctrl - instagram.fetchPopular -> data:', data);
                }
            );
        }
    ]
);
