'use strict';

angular.module('app')

.directive('edDisqus', ['utils', function(utils) {
    return {
        restrict: 'E',
        template: '<section id="disqus_container"><div id="disqus_thread"></div></section>',
        replace: true,
        link: function($scope) {
            var unbind = $scope.$watch('shareable.share_id', function(shareId, oldShareId) {
                if (shareId) {
                    initDisqus(shareId, utils.getSetting('disqusShortname'), window.location.href);
                    unbind();
                }
            });
        }
    }
}]);

function initDisqus(identifier, shortname, url) {
    var disqus_shortname = shortname;
    window.disqus_identifier = identifier;

    if (window.DISQUS) {
        DISQUS.reset({
            reload: true,
            config: function () {
                this.page.identifier = identifier;
                this.page.url = url;
            }
        });
    } else {
        (function() {
            var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
            dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
        })();
    }
}