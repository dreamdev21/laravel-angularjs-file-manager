angular.module('app')

.factory('files', ['$rootScope', '$http', '$mdDialog', 'folders', 'utils', function($rootScope, $http, $mdDialog, folders, utils) {
    var files = {

        /**
         * Fetch a photo with given id from server.
         *
         * @param id
         * @returns promise
         */
        get: function(id) {
            return $http.get($rootScope.baseUrl+'files/'+id);
        },

        /**
         * Fetch all files from the server.
         *
         * @param {boolean} all
         * @param {object} params
         * @returns promise
         */
        getAll: function(all, params) {
            return $http.get($rootScope.baseUrl+'files?all='+all, {params: params});
        },

        /**
         * Attach files with given ids (attach_id) to currently logged in user.
         *
         * @param {array} ids
         * @returns {promise}
         */
        attachToUser: function(ids) {
            return $http.post($rootScope.baseUrl + 'photo/attach-to-user', {ids: ids}).success(function(data) {
                if (data) {
                    utils.showToast(data);
                }
            });
        },

        rename: function(id) {
            $http.put($rootScope.baseUrl + 'files/' + id, { name: this.fileNameModel }).success(function(data) {
                var folder = folders.getById(data.folder_id);

                if ( ! folder || ! folder.files) {
                    files.closeModal();
                    $rootScope.$emit('activity.happened', 'renamed', 'photo', data);
                    return utils.showToast('fileRenameSuccess', true);
                } else {
                    for (var i = 0; i < folder.files.length; i++) {
                        if (folder.files[i].id == data.id) {
                            folder.files[i] = data;
                            files.closeModal();
                            $rootScope.$emit('activity.happened', 'renamed', 'file', data);
                            return utils.showToast('fileRenameSuccess', true);
                        }
                    }
                }
            })
        },

        /**
         * Move items to a new folder.
         *
         * @param {array|object} items
         * @param {int}   folderId
         */
        moveToFolder: function(items, folderId) {
            if ( ! angular.isArray(items)) items = [items];

            //filter out items that are already in specified folder
            items = items.filter(function(item) {
                return ! item.folder_id || item.folder_id != folderId;
            });

            //bail if no items are left
            if ( ! items.length) return;

            var ids = items.map(function(item) {
                return {type: item.type, id: item.id};
            });

            $http.post($rootScope.baseUrl + 'move-items', { items: ids, folderId: folderId }).success(function(data) {

                //delete moved files from their current folder
                if (folders.selected && folders.selected.files) {
                    folders.selected.files = folders.selected.files.filter(function(file) {
                        return items.indexOf(file) === -1;
                    });
                }

                folders.available = data;

                files.closeModal();
                $rootScope.$emit('activity.happened', 'moved', 'items', items);
                var movingTo = folders.getById(folderId);
                return utils.showToast(utils.trans('movedItems', { number: items.length, folder: movingTo.name }));
            })
        },

        /**
         * Open modal for renaming selected photo.
         *
         * @param {string} name
         */
        openRenameModal: function(name) {
            this.fileNameModel = name;

            $mdDialog.show({
                templateUrl: 'assets/views/modals/renamePhoto.html',
                controller: ['$scope', 'files', 'selectedItems', function($scope, files, selectedItems) {
                    $scope.files = files;
                    $scope.selectedItems = selectedItems;
                }],
                onComplete: function() {
                    $('#photo-name').focus();
                }
            });
        },

        closeModal: function() {
            $mdDialog.hide();
            this.fileNameModel = false;
        },
    };

    return files;
}]);