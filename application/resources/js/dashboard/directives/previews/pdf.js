angular.module('pixie.dashboard')

.directive('pdfPreview', function() {
    return {
        restrict: 'E',
        link: function($scope, el) {
            el.append('<iframe class="pdf-iframe" src="'+$scope.preview.current.absoluteUrl+'"></iframe>');
        }
    }
});