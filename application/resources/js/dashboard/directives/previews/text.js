angular.module('pixie.dashboard')

.directive('textPreview', ['$http', '$translate', function($http, $translate) {
    return {
        restrict: 'E',
        link: function($scope, el) {
            function showNoPreviewContainer() {
                el.hide();
                $('.no-preview-available').show().find('.message').html('<h2>Whoops!</h2> '+$translate.instant('cantShowText'));
            }

            $http.get($scope.preview.current.absoluteUrl).success(function(data) {
                if (data) {
                    el.append('<div class="text-preview-container"><pre></pre></div>').find('pre').text(data);
                } else {
                    showNoPreviewContainer();
                }
            }).error(function() {
                showNoPreviewContainer();
            });
        }
    }
}]);