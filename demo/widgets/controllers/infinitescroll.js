
/*global
    msos: false,
    angular: false
*/

msos.provide("demo.widgets.controllers.infinitescroll");
msos.require("ng.ui.scroll.infinite");

demo.widgets.controllers.infinitescroll.version = new msos.set_version(19, 1, 17);


angular.module(
	'demo.widgets.controllers.infinitescroll',
	['ng', 'ng.ui.scroll.infinite']
).config(
	['$sceDelegateProvider', function ($sceDelegateProvider) {
		$sceDelegateProvider.resourceUrlWhitelist([
			'self',
			'https://api.reddit.com/hot?**'
		]);
	}]
).controller(
	'demo.widgets.controllers.infinitescroll.ctrl',
	['$scope', 'Reddit', function ($scope, Reddit) {
		$scope.reddit = new Reddit();
	}]
).factory(
	'Reddit',
	['$http', function ($http) {
		var Reddit = function () {
				this.items = [];
				this.busy = false;
				this.after = '';
			};

		Reddit.prototype.nextPage = function () {

			if (this.busy) { return; }

			this.busy = true;

			var url = "https://api.reddit.com/hot?after=" + this.after;

			$http.jsonp(url, { jsonpCallbackParam: 'jsonp' }).then(
				function (data) {

					var items = data.data.data.children,
						i = 0;

					for (i = 0; i < items.length; i += 1) {
						this.items.push(items[i].data);
					}

					this.after = "t3_" + this.items[this.items.length - 1].id;
					this.busy = false;

				}.bind(this)
			);
		};

		return Reddit;
	}]
);

