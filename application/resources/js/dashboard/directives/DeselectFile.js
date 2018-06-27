'use strict';

angular.module('pixie.dashboard')

/**
 * Deselect currently selected file if clicked on a node that has .deselect-file class.
 */
.directive('edDeselectFile', ['selectedItems', function(selectedItems) {
    return {
        restrict: 'A',
        link: function($scope) {
            $(document).on('click', '.deselect-file', function(e) {
                if (e.target !== this) return;

                $scope.$apply(function () {
                    selectedItems.deselectAll();
                })
            });
        }
   	}
}]);