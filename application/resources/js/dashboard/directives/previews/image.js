angular.module('pixie.dashboard')

.directive('imagePreview', ['selectedItems', function(selectedItems) {
    return {
        restrict: 'E',
        template: '<div class="image-preview-container"></div>',
        replace: true,
        link: function($scope, el) {
            el.append('<img src="'+$scope.preview.current.absoluteUrl+'" alt="'+selectedItems.first('name')+'">');
        }
    }
}]);