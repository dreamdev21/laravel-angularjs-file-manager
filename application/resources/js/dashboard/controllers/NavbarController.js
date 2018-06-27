'use strict';

angular.module('pixie.dashboard').controller('NavbarController', ['$rootScope', '$scope', '$http', 'utils', 'selectedItems', 'previewStatus', function($rootScope, $scope, $http, utils, selectedItems, previewStatus) {

    $scope.selectedItem = false;

    $scope.getSearchResults = function(query) {
        return $http.get('search/'+query).then(function(response) {
            $scope.searchResults = response.data;
            return response.data;
        });
    };

    $scope.goToSearchPage = function() {
        if ( ! $scope.searchText) return;

        utils.toState('dashboard.search', { query: $scope.searchText });
    };

    $scope.selectItem = function() {
        if ( ! $scope.selectedItem) return;

        selectedItems.set($scope.selectedItem, $scope.selectedItem.type, true);
        previewStatus.open = true;
        $scope.searchText = '';
        $scope.selectedItem = false;
    };
}]);