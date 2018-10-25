
msos.provide("ng.google.adsense");

// https://www.coditty.com/code/how-to-add-google-ads-to-your-angular-page
// <script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
// <adsense ad-style="display:block;border:0px" ad-format="fluid" ad-layout="text-only" layout-key="-hs-1p+4m-15-5j" ad-client="ca-pub-123456789" ad-slot="123456789"></adsense>

angular.module(
	'ng.google.adsense',
	['ng']
).directive(
	'adsense',
	['$timeout', function ($timeout) {
		var ins_tmpl = '<div class="ads">' +
							'<ins class="adsbygoogle" style="{{adStyle}}" data-ad-format="{{adFormat}}"  data-ad-layout="{{adLayout}}" data-ad-layout-key="{{layoutKey}}" data-ad-client="{{adClient}}" data-ad-slot="{{adSlot}}" data-ad-region="page-'+Math.random()+'"></ins>' +
						'</div>';
        return {
            restrict: 'E',
            replace: true,
            scope : {
                adStyle : '@',
                adFormat : '@',
                adLayout : '@',
                layoutKey : '@',
                adClient : '@',
                adSlot : '@'
            },
            template: ins_tmpl,
            link: function () {
				return $timeout(
					function (){
						return (adsbygoogle = window.adsbygoogle || []).push({});
					},
					10,
					false
				);
            }
        };
    }]
);