'use strict';

angular.module('pixie.dashboard').controller('DashboardController', ['$scope', '$state', '$mdDialog', 'fileTypes', 'rightPanel', 'utils', 'selectedItems', 'folders', 'localStorage', 'files', 'dashboardState', 'previewStatus', 'activity', 'users', function($scope, $state, $mdDialog, fileTypes, rightPanel, utils, selectedItems, folders, localStorage, files, dashboardState, previewStatus, activity, users) {
    $scope.$state  = $state;
    $scope.rightPanel = rightPanel;
    $scope.selectedItems = selectedItems;
    $scope.folders = folders;
    $scope.previewStatus = previewStatus;
    $scope.level = 1;
    $scope.fileTypes = fileTypes;
    $scope.utils = utils;

    $scope.disableInfinateScroll = false;
    $scope.infiniteScrollPage = 2;

    if ( ! users.current.isSubscribed) {
        $scope.ad1 = utils.trustHtml(utils.getSetting('ad_dashboard_slot_1'));
        $scope.ad2 = utils.trustHtml(utils.getSetting('ad_dashboard_slot_2'));
        $scope.ad3 = utils.trustHtml(utils.getSetting('ad_dashboard_slot_3'));
    }

    //whether or not dashboard is fully loaded (angular, views, folders, photos etc)
    $scope.dashboardState = dashboardState;

    $scope.openNewImageModal = function($event) {
        $mdDialog.show({
            template: $('#new-image-modal-template').html(),
            targetEvent: $event,
            controller: 'DashboardController'
        });
    };

    $scope.paginateFiles = function () {
        files.getAll(false, {folderId: folders.selected.id, page: $scope.infiniteScrollPage+1}).success(function(response) {
            if (response['current_page'] >= response['last_page']) {
                $scope.disableInfinateScroll = true;
            }

            $scope.infiniteScrollPage = response['current_page'];

            $scope.$broadcast('pagination.files', response.data);
        })
    };

    if ( ! folders.available.length) {
        folders.getAll(null); activity.getAll();
    }
}])

.value('dashboardState', { loaded: false })
.value('previewStatus', { open: false });
