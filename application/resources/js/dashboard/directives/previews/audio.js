angular.module('pixie.dashboard')

.directive('audioPreview', ['$templateRequest', '$translate', function($templateRequest, $translate) {
    return {
        restrict: 'E',
        link: function($scope, el) {
            if ( ! document.createElement('audio').canPlayType($scope.preview.current.mime)) {
                return $('.no-preview-available').show().find('.message').html('<h2>Whoops!</h2> '+$translate.instant('cantPlayAudio'));
            }

            $templateRequest('assets/views/directives/audio-player.html').then(function(data) {
                el.html(data);

                var player = $("#jquery_jplayer_1").jPlayer({
                    ready: function() {
                        $(this).jPlayer('setMedia', {
                            title: $scope.preview.current.name,
                            m4a: $scope.preview.current.absoluteUrl
                        }).jPlayer('play');
                    },
                    volume: 0.2,
                    cssSelectorAncestor: "#player-container",
                    swfPath: "/assets",
                    supplied: 'm4a',
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