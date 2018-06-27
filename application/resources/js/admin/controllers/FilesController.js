'use strict';

angular.module('app').controller('FilesController', ['$scope', '$rootScope', 'utils', '$http', '$mdDialog', 'files', 'folders', 'deleter', 'fileTypes', function($scope, $rootScope, utils, $http, $mdDialog, files, folders, deleter, fileTypes) {
    $scope.files = files;
    $scope.allItems = [];
    $scope.fileTypes = fileTypes;
    $scope.utils = utils;

    //files search query
    $scope.search = { query: '' };

    $scope.selectedItems = [];

    $scope.isItemSelected = function(item) {
        return $scope.selectedItems.indexOf(item) > -1;
    };

    $scope.select = function(item) {
        var idx = $scope.selectedItems.indexOf(item);
        if (idx > -1) $scope.selectedItems.splice(idx, 1);
        else $scope.selectedItems.push(item);
    };

    $scope.deleteFiles = function() {
        if (utils.isDemo) {
            utils.showToast('Sorry, you can\'t do that on demo site.');
            $scope.selectedItems = [];
            return;
        }

        deleter.delete($scope.selectedItems);

        setTimeout(function() {
            $scope.paginate($scope.params);
        }, 100);

        $scope.selectedItems = [];
    };

    $scope.toggleAllPhotos = function() {

        //all items already selected, deselect all
        if ($scope.selectedItems.length === $scope.allItems.length) {
            $scope.selectedItems = [];
        }

        //all items arent selected, copy all photos array to selected items
        else {
            $scope.selectedItems = $scope.allItems.slice();
        }
    };

    if (utils.stateIs('admin.files')) {
        var uri = 'files';
    } else if (utils.stateIs('admin.folders')) {
        var uri = 'folders';
    }

    $scope.paginate = function(params) {
        if ($scope.itemsAjaxInProgress) return;

        if ( ! params) params = {};

        $scope.itemsAjaxInProgress = true;

        params.all = true;

        $http.get($rootScope.baseUrl+'/'+uri, { params: params }).success(function(data) {
            $scope.items = data.data;
            $scope.totalItems = data.total;

            $scope.itemsAjaxInProgress = false;
        })
    };

    $scope.paginate($scope.params);
}]);
