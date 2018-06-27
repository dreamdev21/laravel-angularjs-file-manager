'use strict';

angular.module('app').directive('edShareIcons', ['$rootScope', '$compile', 'utils', function ($rootScope, $compile, utils) {

    var shareIcons = {
        restrict: 'E',
        template: '<section class="social-icons"></section>',
        replace: true,
        link: function ($scope, el) {

            //if we already have a shareable, generate icons now
            if ($scope.shareable) {
                generateIcons($scope, el);

                //otherwise we might need to wait for ajax request, so we'll generate the icons on event
            } else {
                $scope.$on('shareable.ready', function() {
                    generateIcons($scope, el);
                });
            }
        }
    };

    var available = [
        'facebook',
        'twitter',
        'googleplus',
        'pinterest',
        'tumblr',
        'stumbleupon',
        'blogger'
    ];

    function generateIcons($scope, el) {
        var html = '';

        for (var i = 0; i < available.length; i++) {
            html += '<div class="social-icon '+available[i]+'" data-service="'+available[i]+'" ed-tooltip="'+available[i]+'"></div>';
        }

        $compile(el.html(html))($scope);

        el.on('click', '.social-icon', function(e) {

            var width  = 575,
                height = 400,
                left   = ($(window).width()  - width)  / 2,
                top    = ($(window).height() - height) / 2,
                url    = urls[e.currentTarget.dataset.service](),
                opts   = 'status=1'+',width='+width+',height='+height+',top='+top+',left='+left;

            window.open(url, 'share', opts);
        });

        var urls = {

            base: $rootScope.baseUrl+( ! utils.getSetting('enablePushState') ? '#/' : '')+'view/'+$scope.shareable.type+'/'+$scope.shareable.share_id + '/' + $scope.shareable.name,

            blogger: function() {
                return 'https://www.blogger.com/blog_this.pyra?t&u='+this.base+'&n='+$scope.shareable.name;
            },

            stumbleupon: function() {
                return 'http://www.stumbleupon.com/submit?url='+this.base;
            },

            tumblr: function() {
                var start = 'https://www.tumblr.com/widgets/share/tool?shareSource=legacy&canonicalUrl=&posttype=link&title=&caption='+$scope.shareable.name+'&content=';

                if ($scope.shareable.type === 'photo') {
                    start+=$scope.shareable.absoluteUrl;
                }

                return start;
            },

            twitter: function() {
                return 'https://twitter.com/intent/tweet?url='+this.formatUrl(this.base)+'&text=Share '+$scope.shareable.name;
            },

            facebook: function() {
                return 'https://www.facebook.com/sharer/sharer.php?u='+this.formatUrl(this.base);
            },

            googleplus: function() {
                return 'https://plus.google.com/share?url='+this.formatUrl(this.base);
            },

            pinterest: function(url, image, description) {
                var start = 'https://pinterest.com/pin/create/button/?url='+this.base;

                if ($scope.shareable.absoluteUrl) {
                    var absUrl = $scope.shareable.absoluteUrl.split('?')[0];

                    start += '&media='+absUrl;
                }

                if ($scope.shareable.description) {
                    start += '&description='+$scope.shareable.description;
                }

                return start;
            },

            formatUrl: function(url) {
                return url.replace(/^\/\//, 'http://');
            }
        };
    }

    return shareIcons;
}]);