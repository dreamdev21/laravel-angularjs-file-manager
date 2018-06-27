'use strict';

angular.module('pixie.dashboard').factory('trash', ['$rootScope', '$http', function($rootScope, $http) {
    var trash = {
        /**
         * If we have fetched user trash from server already.
         */
        loaded: false,

        /**
         * Items (files and folders) user has trashed.
         */
        items: [],

        /**
         * Return a trashed item by id.
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
         * Get user trash items.
         *
         * @returns {promise}
         */
        getTrashedItems: function() {
            var self = this;

            return $http.get($rootScope.baseUrl+'user-trash').success(function(data) {
                self.items = data;
                self.loaded = true;
            });
        }
    };

    $rootScope.$on('user.loggedOut', function() {
        trash.items = [];
    });

    return trash;
}]);