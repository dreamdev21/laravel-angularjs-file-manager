'use strict';

angular.module('app').controller('UsersController', ['$scope', '$rootScope', '$state', '$mdDialog', 'utils', 'users', function($scope, $rootScope, $state, $mdDialog, utils, users) {
    $scope.users = users;

    //users search query
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

    //filter model for checkbox to filter photos attach/not attached to user
    $scope.showNotAttachedPhotosOnly = false;

    $scope.deleteUsers = function() {
        if (utils.isDemo) {
            utils.showToast('Sorry, you can\'t do that on demo site.');
            $scope.selectedItems = [];
            return;
        }

        users.delete($scope.selectedItems).success(function() {
            $scope.selectedItems = [];
            $scope.paginate($scope.params);
        }).error(function(data) {
            utils.showToast(data);
        })
    };

    $scope.toggleAllUsers = function() {

        //all items already selected, deselect all
        if ($scope.selectedItems.length === users.all.length) {
            $scope.selectedItems = [];
        }

        //all items aren't selected, copy all users array to selected items
        else {
            $scope.selectedItems = users.all.slice();
        }
    };

    $scope.showCreateUserModal = function($event) {
        $mdDialog.show({
            templateUrl: 'assets/views/modals/create-user.html',
            clickOutsideToClose: true,
            controllerAs: 'ctrl',
            controller: function() { this.parent = $scope },
            targetEvent: $event,
        });
    };

    $scope.showUpdateUserModal = function(user, $event) {
        $scope.userModel = angular.copy(user);
        delete $scope.userModel.password;

        if (utils.isDemo) {
            $scope.userModel.email = 'Hidden on demo site';
        }
        
        $mdDialog.show({
            templateUrl: 'assets/views/modals/update-user.html',
            clickOutsideToClose: true,
            controllerAs: 'ctrl',
            controller: function() { this.parent = $scope },
            targetEvent: $event,
        });
    };

    $scope.updateUser = function() {
        if (utils.isDemo) {
            utils.showToast('Sorry, you can\'t do that on demo site.');
            $scope.selectedItems = [];
            return;
        }

        users.updateAccountSettings($scope.userModel, $scope.userModel.id).success(function() {
            $mdDialog.hide();
            utils.showToast('updatedUserSuccessfully', true);
            $scope.paginate($scope.params);
            $scope.selectedItems = [];
        }).error(function(data) {
            $scope.setErrors(data);
        });
    };

    $scope.createNewUser = function() {
        if (utils.isDemo) {
            utils.showToast('Sorry, you can\'t do that on demo site.');
            $scope.selectedItems = [];
            return;
        }

        users.register($scope.userModel).success(function() {
            $mdDialog.hide();
            utils.showToast('createdUserSuccessfully', true);
            $scope.paginate($scope.params);
            $scope.errors = [];
        }).error(function(data) {
            $scope.setErrors(data);
        });
    };

    $scope.paginate = function(params) {
        if ($scope.usersAjaxInProgress) return;

        $scope.usersAjaxInProgress = true;

        users.paginate(params).success(function(data) {
            $scope.items = data.data;
            $scope.totalItems = data.total;

            $scope.usersAjaxInProgress = false;
        })
    };

    $scope.paginate($scope.params);
}]);
