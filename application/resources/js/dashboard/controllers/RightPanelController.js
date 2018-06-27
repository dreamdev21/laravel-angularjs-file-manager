'use strict';

angular.module('pixie.dashboard').value("rightPanel", {
    open: true
})

.controller('RightPanelController', ['$scope', 'activity', 'rightPanel', 'localStorage', 'selectedItems', 'utils', function($scope, activity, rightPanel, localStorage, selectedItems, utils) {
    $scope.activity = activity;

    rightPanel.open = localStorage.get('rightPanelOpen', !$scope.isSmallScreen);

    $scope.rightPanelModel = {};
    $scope.descriptionAjaxInProgress = false;

    $scope.editDescription = function() {
        if (selectedItems.first('name')) {
            selectedItems.update({ description: selectedItems.first('description')}).success(function() {
                utils.showToast('descriptionUpdated', true);
            });
        }
    };

    $scope.toRelativeTime = function(time) {
        return moment.utc(time).fromNow();
    };
}])

.filter('activityRelativeToContext', ['folders', function(folders) {
    return function(input) {
        var out = [];

        for (var i = 0; i < input.length; i++) {
            var activity = input[i];

            if (activityIsRelevantToFolder(activity)) {
                out.push(activity);
            }
        }

        function activityIsRelevantToFolder(activity) {
            return activity.folder_id == folders.selected.id;
        }

        return out;
    }
}]);