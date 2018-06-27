'use strict';

angular.module('pixie.dashboard').controller('PhotosListController', ['$scope', 'files', 'utils', 'selectedItems', 'deleter', function($scope, files, utils, selectedItems, deleter) {

    $scope.search = { query: '' };

    $scope.currentPage = 1;

    $scope.listSelectedItems = [];

    $scope.itemsPerPage = 12;

    $scope.deleteSelectedFiles = function() {
        deleter.delete($scope.listSelectedItems);
        $scope.listSelectedItems = [];
    };

    $scope.isItemSelected = function(item) {
        return $scope.listSelectedItems.indexOf(item) > -1;
    };

    $scope.select = function(item) {
        var idx = $scope.listSelectedItems.indexOf(item);
        if (idx > -1) $scope.listSelectedItems.splice(idx, 1);
        else $scope.listSelectedItems.push(item);

        selectedItem.set(item);
    };

    $scope.toggleAllPhotos = function() {

        //all items already selected, deselect all
        if ($scope.listSelectedItems.length === $scope.items.length) {
            $scope.listSelectedItems = [];
        }

        //all items arent selected, copy all users array to selected items
        else {
            $scope.listSelectedItems = $scope.items.slice();
        }
    };
}]);