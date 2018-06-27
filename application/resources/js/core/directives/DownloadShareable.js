'use strict';

angular.module('app').directive('edDownloadShareable', ['selectedItems', function(selectedItems) {
    return {
        restrict: 'A',
        link: function($scope, el) {
        	el.on('click', function() {
                selectedItems.download([$scope.shareable])
        	});
        }
    };
}]);