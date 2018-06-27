'use strict';

angular.module('pixie.dashboard').controller('TrashController', ['$rootScope', '$scope', 'trash', function($rootScope, $scope, trash) {

    $scope.items = trash.items;

    var unbind = $rootScope.$on('activity.happened', function(e, type, itemType, restoredItems) {
        if (type === 'restored' || type === 'permaDeleted' || type === 'trashed') {
            $scope.items = trash.items = trash.items.filter(function(item) {
                return restoredItems.indexOf(item) === -1;
            });
        }
    });

    if ( ! trash.loaded) {
        trash.getTrashedItems().success(function() {
            $scope.items = trash.items;
        })
    }

    $scope.$on('$destroy', function() {
        unbind();
    });
}]);