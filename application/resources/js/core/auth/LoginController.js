'use strict';

angular.module('app')

.controller('LoginController', ['$rootScope', '$scope', '$http', '$state', '$mdDialog', 'users', 'utils', function($rootScope, $scope, $http, $state, $mdDialog, users, utils) {

    $scope.registrationEnabled = true;

    $scope.credentials = {
        remember: true
    };

    $scope.passResetCredentials = {
        email: ''
    };

    $scope.resetPasswordError = '';

    $scope.resetPassword = function() {
        $http.post($rootScope.baseUrl + 'password/email', $scope.passResetCredentials).success(function(data) {
            utils.showToast(data);
            $scope.resetPasswordError = '';
            $scope.closePasswordResetModal();
        }).error(function(data) {
            $scope.resetPasswordError = data.email || data;
        })
    };

    $scope.submit = function() {
        $scope.loading = true;

        return users.login($scope.credentials).success(function() {
            $scope.credentials = {};
            $state.go('dashboard.folders');
        }).error(function(data) {
            $scope.errors = data;
        }).finally(function() {
            $scope.loading = false;
        })
    };

    $scope.showPasswordResetModal = function($event) {
        $mdDialog.show({
            templateUrl: 'modals/resetPassword.html',
            targetEvent: $event,
            controller: 'LoginController',
            clickOutsideToClose: true
        });
    };

    $scope.closePasswordResetModal = function() {
        $scope.passResetCredentials = {};
        $mdDialog.hide();
    };
}]);