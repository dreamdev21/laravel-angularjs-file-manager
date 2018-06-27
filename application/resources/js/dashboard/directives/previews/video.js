angular.module('pixie.dashboard')

.directive('videoPreview', ['$templateRequest', '$translate', '$compile', function($templateRequest, $translate, $compile) {
    return {
        restrict: 'E',
        link: function($scope, el) {
            if ( ! document.createElement('video').canPlayType($scope.preview.current.mime)) {
                return $('.no-preview-available').show().find('.message').html('<h2>Whoops!</h2> '+$translate.instant('cantPlayVideo'));
            }

            $templateRequest('assets/views/directives/video-player.html').then(function(data) {
                el.html(data);

                var player = $("#video-preview-player").jPlayer({
                    ready: function() {
                        $(this).jPlayer('setMedia', {
                            title: $scope.preview.current.name,
                            m4v: $scope.preview.current.absoluteUrl
                        }).jPlayer('play');
                    },
                    size: {
                        width: '100%',
                        height: 'auto'
                    },
                    volume: 0.2,
                    cssSelectorAncestor: "#player-container",
                    swfPath: "/assets",
                    supplied: 'm4v',
                    useStateClassSkin: true,
                    autoBlur: false,
                    smoothPlayBar: true,
                    keyEnabled: true,
                    remainingDuration: true,
                    toggleDuration: true
                });
            });
        }
    }
}]);