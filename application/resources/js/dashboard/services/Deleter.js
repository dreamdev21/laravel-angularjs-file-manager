'use strict';

angular.module('pixie.dashboard').factory('deleter', ['$rootScope', '$http', 'utils', 'files', 'folders', 'trash', function($rootScope, $http, utils, files, folders, trash) {

    /**
     * Permanently delete passed in items.
     *
     * @param {array} items
     * @returns {promise}
     */
    function permaDeleteItems(items) {
        return $http.post('delete-items', { items: items }).success(function(data) {
            if (trash.loaded) {
                trash.items = trash.items.filter(function(file) {
                    return items.indexOf(file) === -1;
                });
            }

            utils.showToast(utils.trans('permaDeletedItems', {number:data}));
        }).error(function(data) {
            utils.showToast(data);
        }).finally(function() {
            $rootScope.ajaxProgress.files = false;
            $rootScope.$emit('activity.happened', 'permaDeleted', 'item', items);
        });
    }

    /**
     * Move given items to trash.
     *
     * @param {array} items
     * @returns {promise}
     */
    function moveItemsToTrash(items) {
        return $http.post('trash/put', { items: items }).success(function(data) {
            utils.showToast(utils.trans('movedToTrash', {number:data}));

            //if we're in folders state remove deleted items from their arrays
            if (utils.stateIs(['dashboard.folders', 'dashboard.foldersRoot'])) {
                folders.selected.files = folders.selected.files.filter(function(file) {
                    return items.indexOf(file) === -1;
                });

                folders.available = folders.available.filter(function(folder) {
                    return items.indexOf(folder) === -1;
                })
            }

            //if we've already loaded trash from server, push
            //items we've just deleted into existing trash items
            if (trash.loaded) {
                trash.items = trash.items.concat(items);
            }

            if (items.indexOf(folders.selected) > -1) {
                var parent = folders.getById(folders.selected.folder_id) || folders.getByName('root');
                folders.open(parent.name);
            }
        }).finally(function() {
            $rootScope.ajaxProgress.files = false;
            $rootScope.$emit('activity.happened', 'trashed', 'item', items);
        })
    }

    /**
     * Delete or move to trash given items based on current state and their type.
     *
     * @param {array} items
     */
    function destroy(items) {
        if ( ! items.length) return;

        $rootScope.ajaxProgress.files = true;

        //if we are in trash state we will need to delete folders permanently
        if (utils.stateIs(['dashboard.trash', 'admin.files', 'admin.folders'])) {
            permaDeleteItems(items);
        }

        //otherwise we will move items to trash
        else {
            moveItemsToTrash(items, 'folders');
        }

        //if photo or folder was deleted from preview page go back to dashboard
        if (utils.stateIs('view')) {
            utils.toState('dashboard.folders');
        }
    }

    /**
     * Get options for creating delete conformation modal based on active state.
     *
     * @param {array} items
     * @returns {object|undefined}
     */
    function getConfirmOptions(items) {
        if (utils.stateIs('dashboard.trash')) {
            return {
                title: 'deleteForever',
                content: 'confirmPermaDelete',
                subcontent: 'permaDeleteWarning',
                ok: 'delete',
                onConfirm: function () {
                    destroy(items);
                }
            }
        } else if (utils.stateIs('dashboard.search')) {
            return {
                title: 'deleteItems',
                content: 'sureWantToDeleteItems',
                ok: 'delete',
                onConfirm: function() {
                    destroy(items);
                }
            }
        }
    }

    return {
        delete: function(items) {
            if ( ! items) return;

            //always make sure we're working with an array
            if (! angular.isArray(items)) items = [items];

            var options = getConfirmOptions(items);

            //if we've got confirm options means we will need
            //to confirm the deletion, otherwise we will just
            //go ahead and delete passed items without confirming
            if (options) {
                utils.confirm(options);
            } else {
                destroy(items);
            }
        }
    };
}]);