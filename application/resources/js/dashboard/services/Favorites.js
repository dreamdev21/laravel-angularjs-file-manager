'use strict';

angular.module('pixie.dashboard').factory('favorites', ['$rootScope', '$http', function($rootScope, $http) {
    var favorites = {

        /**
         * If we have fetched user favorites from server already.
         */
        loaded: false,

        /**
         * Items (files and folders) user has favorited.
         */
        items: [],

        /**
         * Return a favorited item by id.
         *
         * @param {string|int} id
         * @returns {object|undefined}
         */
        getItemById: function(id) {
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].id == id) {
                    return this.items[i];
                }
            }
        },

        /**
         * Get user favorited items.
         *
         * @returns {promise}
         */
        getFavoritedItems: function() {
            var self = this;

            return $http.get($rootScope.baseUrl+'labels/favorite').success(function(data) {
                self.items = data;
                self.loaded = true;
            });
        }
    };

    $rootScope.$on('user.loggedOut', function() {
        favorites.items = [];
    });

    return favorites;
}]);