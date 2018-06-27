'use strict';

angular.module('app').controller('ViewController', ['$rootScope', '$scope', '$stateParams', '$http', 'utils', 'files', 'fileTypes', 'users', 'selectedItems', function($rootScope, $scope, $stateParams, $http, utils, files, fileTypes, users, selectedItems) {
    $scope.passContainerVisible = false;
    $scope.selectedItems = selectedItems;
    $scope.fileTypes = fileTypes;

    //ads html trusted by angular
    if ( ! users.current.isSubscribed) {
        $scope.ad1 = utils.trustHtml(utils.getSetting('ad_preview_slot_1'));
        $scope.ad2 = utils.trustHtml(utils.getSetting('ad_preview_slot_2'));
    }

    //if we already have a shareable on rootScope preview that
    if ($rootScope.shareable && users.current) {
        assignShareable($rootScope.shareable);

    //otherwise fetch shareable from server based on state params
    } else {
        $http.post('shareable/preview', $stateParams).success(function(data) {
            assignShareable(data);
        }).error(function() {
            if (users.current) {
                utils.toState('dashboard.folders');
            } else {
                utils.toState('home');
            }
        });
    }

    function assignShareable(shareable) {
        $scope.shareable = shareable;
        $scope.type = shareable.type;

        //ask for password if it's not currently logged in users file and it's password protected
        if (shareable.password && (! users.current || users.current.id != shareable.user_id)) {
            $scope.passContainerVisible = true;
        }

        selectedItems.setAll(shareable.files || shareable);
        $scope.previewStatus = { open: true };
        $scope.$broadcast('shareable.ready', shareable);
    }

    $scope.toDashboard = function() {
        utils.toState('dashboard.folders');
    };

    $scope.goHome = function() {
        utils.toState('home');
    };

    $scope.checkPassword = function() {
        var payload = {
            id: $scope.shareable.id,
            type: $scope.type,
            password: $scope.password
        };

        $http.post('shareable-password/check', payload).success(function() {
            selectedItems.password = $scope.password;
            $scope.passContainerVisible = false;
        }).error(function(data) {
            $scope.error = data;
        })
    };

    $scope.getSize = function() {
        if ($scope.shareable) {
            var size = $scope.shareable.type === 'file' ? utils.formatFileSize($scope.shareable.file_size) : utils.getFolderSize($scope.shareable);

            if (size) {
                return size;
            } else {
                return '';
            }
        }
    };

    $scope.$on('$destroy', function() {
        $rootScope.shareable = false;
        selectedItems.deselectAll();
    });
}]);