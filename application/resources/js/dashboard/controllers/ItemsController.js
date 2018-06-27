'use strict';

angular.module('pixie.dashboard').controller('ItemsController', ['$scope', '$rootScope', '$filter', 'files', 'folders', 'localStorage', 'selectedItems', 'rightPanel', 'fileTypes', function($scope, $rootScope, $filter, files, folders, localStorage, selectedItems, rightPanel, fileTypes) {
    $scope.files  = files;
    $scope.folders = folders;
    $scope.fileTypes = fileTypes;

    $scope.selectedItem = {};

    $scope.order = {
        prop: '-created_at'
    };

    $scope.changeOrder = function(order) {
        $scope.order.prop = order;
        sortFiles();
    };

    $scope.openRightPanel = function() {
        rightPanel.open = true;
    };

    $scope.filteredPhotos = [];

    //manually filter selected folders files so we can get a reference to resulting array
    function sortFiles(items) {
        if ( ! folders.selected || ! angular.isArray(folders.selected.files)) return;

        if ( ! items) items = folders.selected.files || [];

        items = $filter('orderBy')(items, $scope.order.prop);

        //push any child folders of currently selected folder into items array
        var subFolders = folders.getSubFolders(folders.selected.id, folders.selected.name === 'root');
        if (subFolders) {
            items = subFolders.concat(items);
        }

        $scope.items = items;
        $rootScope.filteredFiles = $scope.items;
    }

    $rootScope.$on('folders.selected.changed', function() {
        sortFiles();
    });

    $rootScope.$on('activity.happened', function(e, type, itemType, data) {
        var newItems = $scope.items.slice();

        if (type === 'trashed' || type === 'moved') {
            newItems = newItems.filter(function(file) {
                return data.indexOf(file) === -1;
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

        if (type === 'restored' || type === 'copied' || type === 'uploaded') {
            newItems = newItems.concat(data);
        }

        if (type === 'created' && itemType === 'folder') {
            newItems = [];
        }

        //filter out sub-folders as they will be
        //fetch later in sort function and if they
        //are included here it will cause dupes error
        newItems = newItems.filter(function(file) {
            return file.type !== 'folder';
        });

        sortFiles(newItems);
    });

    /**
     * Infinite scroll event
     */
    $scope.$on('pagination.files', function(e, files) {
        var newFiles = $scope.items.slice().concat(files);

        //filter out sub-folders as they will be
        //fetch later in sort function and if they
        //are included here it will cause dupes error
        newFiles = newFiles.filter(function(file) {
            return file.type !== 'folder';
        });

        sortFiles(newFiles);
    });

    $scope.getImageUrl = function(file) {
        return $scope.baseUrl+'user-file/'+file.share_id+'?w=167&h=131';
    };

    //currently active items layout (grid or list)
    $scope.selectedView = localStorage.get('selectedView', 'grid');

    $scope.toggleSelectedView = function() {
        if ($scope.selectedView === 'list') {
            $scope.selectedView = 'grid';
        } else {
            $scope.selectedView = 'list';
        }

        localStorage.set('selectedView', $scope.selectedView);
    };

    //predicate for filtering photos by folder, if we have a folder selected filter out
    //only photos in that folder, otherwise only photos that have not folder at all
    $scope.selectedFolderFilterPredicate = function() {
        if (folders.selected.id) {
            return {folder_id: folders.selected.id};
        } else {
            return {folder_id: null};
        }
    };

    /**
     * Check if given item is currently selected.
     *
     * @param {object} item
     * @returns {boolean}
     */
    $scope.itemIsSelected = function(item) {
        return selectedItems.has(item);
    };

    /**
     * Select given folder or file.
     *
     * @param {object} item
     * @param {object} $event
     */
    $scope.selectItem = function(item, $event) {

        //if ctrl is pressed and user clicked on item
        //that is already selected, deselect it
        if ($event.ctrlKey && selectedItems.has(item)) {
            selectedItems.deselect(item);
        } else {
            selectedItems.set(item, item.type, !$event.ctrlKey);
        }
    };

    $scope.formatTime = function(time) {
        return moment.utc(time).fromNow();
    };
}]);
