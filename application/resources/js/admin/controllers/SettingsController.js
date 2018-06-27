'use strict';

angular.module('pixie.admin').controller('SettingsController', ['$scope', '$http', 'utils', 'users', function($scope, $http, utils, users) {
    $scope.settings = [];

    $scope.regularMailDrivers = ['smtp', 'mail', 'sendmail', 'log'];

    $http.get('settings').success(function(data) {
        $scope.settings = data;
    });

    $http.get($scope.baseUrl+'settings/ini/max_upload_size').success(function(data) {
        $scope.max_server_upload_size = data;
    });

    $scope.updateSettings = function() {
        if (utils.isDemo) {
            utils.showToast('Sorry, you can\'t do that on demo site.');
            return;
        }

        $http.post('settings', $scope.settings).success(function(data) {
            utils.showToast(data);
        }).error(function(data) {
            utils.showToast(data);
        });
    }
}]);
