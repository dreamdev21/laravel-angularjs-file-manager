'use strict';

angular.module('pixie.dashboard').factory('labels', ['$rootScope', '$http', 'files', 'utils', 'favorites', function($rootScope, $http, files, utils, favorites) {
    return {
        addLabel: function(name, items) {
            var self = this;

            $http.post($rootScope.baseUrl+'labels/attach', { label:name, items: items }).success(function(data) {
                self.addLabelToModel(items, name);
                utils.showToast(data);
                $rootScope.$emit('activity.happened', 'favorited', 'item', items);

                if (name === 'favorite' && favorites.loaded) {
                    favorites.items = favorites.items.concat(items);
                }
            });
        },

        removeLabel: function(name, items) {
            var self = this;

            $http.post($rootScope.baseUrl+'labels/detach', { label:name, items: items }).success(function(data) {
                self.removeLabelFromModel(items, name);
                utils.showToast(data);
                $rootScope.$emit('activity.happened', 'unfavorited', 'item', items);
            });
        },

        /**
         * Add given label to given item.
         *
         * @param {array} items
         * @param {string} name
         * @returns {string}
         */
        addLabelToModel: function(items, name) {
            items.forEach(function(item) {
                if ( ! item.labels) item.labels = [];
                item.labels.push({ name: name });
            })
        },

        /**
         * Remove given label from given item.
         *
         * @param {array} items
         * @param {string} name
         * @returns {string}
         */
        removeLabelFromModel: function(items, name) {
            items.forEach(function(item) {
                if (item.labels && item.labels.length) {
                    for (var i = 0; i < item.labels.length; i++) {
                        if (item.labels[i].name === name) {
                            item.labels.splice(i, 1);
                            break;
                        }
                    }
                }
            })
        }
    }
}]);