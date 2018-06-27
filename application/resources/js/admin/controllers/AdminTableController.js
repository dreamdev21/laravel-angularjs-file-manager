'use strict';

angular.module('app').controller('AdminTableController', ['$scope', '$rootScope', '$state', '$http', '$mdDialog', 'utils', function($scope, $rootScope, $state, $http, $mdDialog, utils) {
    $scope = $scope.$parent;
    $scope.ajaxInProgress = false;
    $scope.items = [];
    $scope.errors = [];

    $scope.params = {
        itemsPerPage: '10',
        page: 1
    };

    $scope.selectedItems = [];

    $scope.isItemSelected = function(item) {
        return $scope.selectedItems.indexOf(item) > -1;
    };

    $scope.select = function(item) {
        var idx = $scope.selectedItems.indexOf(item);
        if (idx > -1) $scope.selectedItems.splice(idx, 1);
        else $scope.selectedItems.push(item);
    };

    $scope.toggleAllItems = function() {
        if ($scope.selectedItems.length === $scope.items.length) {
            $scope.selectedItems = [];
        }
        else {
            $scope.selectedItems = $scope.items.slice();
        }
    };

    $scope.deleteItems = function() {
        var name = $state.current.name.replace('admin.', '');
        $http.post('delete-'+name, { items: $scope.selectedItems });
    };

    $scope.$watchCollection('params', function(newParams) {
        $scope.paginate(newParams);
    });

    $scope.closeModal = function() {
        $mdDialog.hide();
    };

    $scope.setErrors = function(data) {
        //if we've got back just a string show it in a toast
        if (angular.isString(data)) {
            return utils.showToast(data);
        }

        //otherwise append each error to user modal
        for (var field in data) {
            $scope.errors.push(data[field][0]);
        }
    };
}]);
