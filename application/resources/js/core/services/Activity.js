angular.module('app')

.factory('activity', ['$rootScope', '$translate', '$http', 'folders', 'fileTypes', function($rootScope, $translate, $http, folders, fileTypes) {
    var activity = {

        all: [],

        log: function(action, itemName, content) {
            var item = this.createActivityItem(action, itemName, content);

            activity.all.unshift(item);

            this.saveActivityItem(item);
        },

        createActivityItem: function(action, itemName, content) {
            var item = { action: action, itemName: itemName, happenedAt: Date.now(), items: [], user: $translate.instant('you')  };

            if ( ! angular.isArray(content)) {
                content = [content];
            }

            if (content[0]) {
                if (content[0].type === 'folder') {
                    item.folder_id = parseInt(content[0].id);
                } else {
                    item.folder_id = parseInt(content[0].folder_id || folders.selected.id);
                }
            }

            for (var i = 0; i < content.length; i++) {
                var file = content[i];

                if ( ! file.rejected) {
                    item.items.push({ name: file.name, id: file.id, icon: fileTypes.getMimeIcon(file.mime || file.type) });
                }
            }

            return item;
        },

        saveActivityItem: function(item) {
            return $http.post($rootScope.baseUrl+'activity', { content: item });
        },

        getAll: function() {
            $http.get($rootScope.baseUrl+'activity').success(function(data) {
                activity.all = data;
            })
        }
    };

    $rootScope.$on('activity.happened', function($event, action, itemName, content) {
        activity.log(action, itemName, content);
    });

    return activity;
}]);