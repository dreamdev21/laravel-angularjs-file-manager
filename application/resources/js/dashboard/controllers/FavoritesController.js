'use strict';

angular.module('pixie.dashboard').controller('FavoritesController', ['$rootScope', '$scope', 'favorites', function($rootScope, $scope, favorites) {

    $scope.items = favorites.items;

    var unbind = $rootScope.$on('activity.happened', function(e, type, itemType, data) {
        var newItems = $scope.items.slice();

        if (type === 'unfavorited') {
            newItems = newItems.filter(function(item) {
                return data.indexOf(item) === -1;
            });
        }

        if (type === 'renamed') {
            newItems = newItems.map(function(file) {
                if (file.id == data.id) {
                    file.name = data.name;
                }

                return file;
            })
        }

        favorites.items = newItems;
        $scope.items = favorites.items;
    });

    if ( ! favorites.loaded) {
        favorites.getFavoritedItems().success(function() {
            $scope.items = favorites.items;
        })
    }

    $scope.$on('$destroy', function() {
        unbind();
    });
}]);