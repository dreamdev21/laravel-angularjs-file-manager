angular.module('app').factory('selectedItems', ['$rootScope', '$mdDialog', '$http', '$timeout', 'folders', 'files', 'deleter', 'utils', 'trash', 'labels', 'favorites', 'previewStatus', function($rootScope, $mdDialog, $http, $timeout, folders, files, deleter, utils, trash, labels, favorites, previewStatus) {
    var selectedItems = {

        /**
         * Password to view selected items, if required.
         */
        password: false,

        /**
         * Currently selected items in dashboard (folders and files)
         */
        items: false,

        /**
         * Get all currently selected items.
         *
         * @returns {array|boolean}
         */
        get: function () {
            if (this.items) {
                return this.items;
            } else if (this.lastFolder) {
                return [this.lastFolder];
            }
        },

        /**
         * Return number of currently selected items.
         *
         * @returns {int}
         */
        getLength: function() {
            return this.items ? this.items.length : 0;
        },

        /**
         * Get the first selected item or it's property
         *
         * @param {string} prop
         * @returns {object|string}
         */
        first: function(prop) {
            if ( ! this.items) {
                var first = folders.selected;
            } else {
                var first = this.items[0];
            }

            if (!prop) return first;

            if (this.password) {
                //remove any old query strings and add password to url
                first['absoluteUrl'] = first['absoluteUrl'].split('?')[0] += '?password='+this.password;
            }

            return first && first[prop];
        },

        /**
         * Return if given item is currently selected.
         *
         * @param {object} item
         * @returns {boolean}
         */
        has: function(item) {
            if ( ! this.items) return;

            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].id == item.id) {
                    return true;
                }
            }
        },

        /**
         * Deselect given item.
         *
         * @param {int|string|object} id
         * @param {string|undefined} type
         */
        deselect: function(id, type) {
            if (angular.isObject(id)) {
                type = id.type; id = id.id;
            }

            if (this.items) {
                for (var i = 0; i < this.items.length; i++) {
                    var item = this.items[i];

                    if (item.id == id && item.type === type) {
                        selectedItems.items.splice(i, 1);
                        break;
                    }
                }
            }
        },

        /**
         * Deselect all selected files.
         */
        deselectAll: function() {
            this.items = false;
            this.lastFolder = false;
        },

        /**
         * Select given items or item.
         *
         * @param {int|string} id
         * @param {string} type
         * @param {boolean} deselect
         */
        set: function(id, type, deselect) {
            if ( ! this.items || deselect) this.items = [];
                
            if (angular.isObject(id)) {
                var item = id;
            } else if (utils.stateIs('dashboard.trash')) {
                var item = trash.getItemById(id);
            } else if (utils.stateIs('dashboard.favorites')) {
                var item = favorites.getItemById(id);
            } else if (type === 'file') {
                var item = folders.getFileById(id);
            } else {
                var item = folders.getById(id);
            }

            //if item exists and it's not already in selected, select it now
            if (item && ! this.has(item)) {
                this.items.push(item);
            }
        },

        /**
         * Select given items.
         *
         * @param {array|object} items
         */
        setAll: function(items) {
            if (!angular.isArray(items)) {
                items = [items];
            }

            this.items = items;
        },

        /**
         * Check if given type matches first selected items mime type.
         *
         * @param {string} type
         * @param {string} mime
         * @returns {boolean}
         */
        mimeTypeIs: function(type, mime) {
            if ( ! mime) mime = this.first('mime');
            if (this.first('type') === 'folder') return false;

            //handle some special cases
            if (type === 'video' && mime === 'application/ogg') return true;
            if (type === 'zip' && mime === 'application/zip') return true;
            if (type === 'pdf' && mime === 'application/pdf') return true;

            return mime.split('/')[0] === type;
        },

        /**
         * Return first currently selected items file format extracted from file mime.
         *
         * @returns {string}
         */
        getMimeFileType: function() {
            if (this.first('type') === 'folder') return 'folder';

            return this.first('mime').split('/')[1];
        },

        /**
         * Open rename modal for currently open file or folder.
         */
        rename: function () {
            if (this.first('type') === 'folder') {
                folders.openRenameModal(this.first().name);
            } else {
                files.openRenameModal(this.first().name);
            }
        },

        /**
         * Update first selected item.
         *
         * @param {object|undefined} payload
         * @return promise
         */
        update: function(payload) {
            var slug = this.first('type') === 'file' ? 'files' : 'folders';

            return $http.put($rootScope.baseUrl+slug+'/'+this.first('id'), payload || this.first()).success(function(data) {
                if (slug === 'folders') {
                    folders.selected = data;
                } else {
                    selectedItems.set(data, true);

                    if (angular.isArray(folders.selected.files)) {
                        for (var i = 0; i < folders.selected.files.length; i++) {
                            if (folders.selected.files[i].id == data.id) {
                                folders.selected.files[i] = data; break;
                            }
                        }
                    }
                }
            });
        },

        /**
         * Start a download for selected items.
         *
         * @param {array|object|undefined} items
         */
        download: function (items) {
            $('#download-iframe').remove();

            if (items && !angular.isArray(items)) {
                items = [items];
            }

            if ( ! items) {
                items = this.get().map(function(item) {
                    return { id: item.id, share_id: item.share_id, type: item.type, url: item.absoluteUrl, mime: item.mime, password: item.password }
                });
            }

            var iframe = $('<iframe id="download-iframe" style="display: none"></iframe>');

            //downloading just a single file
            if (items.length === 1 && items[0].type === 'file') {
                iframe.appendTo('body').attr('src', $rootScope.baseUrl+'download-file/'+items[0].share_id+'?password='+items[0].password);
            }

            //download multiple items or a folder
            else {
                $http.post('create-download', {items:items}).success(function(data) {
                    iframe.appendTo('body').attr('src', $rootScope.baseUrl+'download-zip/'+data);
                });
            }
        },

        /**
         * Copy selected items.
         */
        copy: function() {
            $http.post('copy-items', {items: this.get()}).success(function(data) {
                if (data.files && data.files.length && folders.selected.files) {
                    folders.selected.files = folders.selected.files.concat(data.files);
                }

                if (data.folders && data.folders.length) {
                    folders.available = folders.available.concat(data.folders);
                }

                var count = data.files.length+data.folders.length;
                utils.showToast(utils.trans('copiedItems', {number: count}));
                $rootScope.$emit('activity.happened', 'copied', 'item', data.files.concat(data.folders));
            }).error(function(data) {
                if(angular.isString(data)) {
                    utils.showToast(data);
                }
            })
        },

        /**
         * Open share dialog for currently selected items.
         */
        share: function () {
            $mdDialog.show({
                templateUrl: 'assets/views/modals/share.html',
                controller: 'ShareModalController',
                locals: {folderName: selectedItems.first('name')},
                onComplete: function() {
                    var input = $('#share-modal-input')[0];
                    input.setSelectionRange(0, input.value.length);
                }
            });
        },

        /**
         * Preview first selected item.
         */
        preview: function () {
            //if we're in trash and it's a folder ask user to restore it first before previewing
            if (this.first('type') === 'folder' && utils.stateIs('dashboard.trash')) {
                utils.confirm({
                    title: 'This folder is in your trash',
                    content: 'To view this folder, you need to restore it from your trash first.',
                    ok: 'restore',
                    onConfirm: function() {
                        selectedItems.restore();
                    }
                })
            } else if (this.first('type') === 'folder') {
                folders.open(this.first('name'));
            } else {
                $timeout(function() {
                    previewStatus.open = true;
                }, 0);
                $rootScope.$emit('preview.shown');
            }
        },

        /**
         * Copy Link for selected item into clipboard.
         */
        copyLink: function () {
            var item = this.first(),
                link = $rootScope.baseUrl+(! utils.getSetting('enablePushState') ? '#/' : '')+'view/'+item.type+'/'+item.share_id + '/' + item.name;
                  
            var node = document.createElement('input'); node.value = link;
            document.body.appendChild(node);
            node.select();
            var copied = document.execCommand('copy');
            document.body.removeChild(node);

            if ( ! copied) {
                utils.showToast('copyNotSupported', true);
            } else {
                utils.showToast('copiedLink', true);
            }
        },

        /**
         * Delete selected items.
         */
        delete: function () {
            deleter.delete(this.get());
            this.deselectAll();
        },

        /**
         * Restore deleted file or folder from trash.
         */
        restore: function () {
            var items = this.get();

            $http.post($rootScope.baseUrl+'trash/restore', { items: items }).success(function(data) {
                $rootScope.$emit('activity.happened', 'restored', 'items', items);

                items.forEach(function(item) {
                    if (item.type === 'folder') {
                        folders.available.push(item);
                    } else {
                        var folder = folders.getById(item.folder_id);

                        if (folder && folder.files) {
                            folder.files.push(item);
                        }
                    }
                });

                utils.showToast(utils.trans('restoreSuccess', {number:data}));
            })
        },

        move: function() {
            $mdDialog.show({
                templateUrl: 'assets/views/modals/move.html',
                clickOutsideToClose: true,
                controller: ['$scope', 'files', 'folders', 'selectedItems', function($scope, files, folders, selectedItems) {
                    $scope.files = files;
                    $scope.selectedItems = selectedItems;
                    $scope.folders = folders;
                    $scope.move = function(folderId) {
                        files.moveToFolder(selectedItems.get(), folderId);
                    }
                }]
            });
        },

        /**
         * Add currently selected items to favorites.
         */
        favorite: function () {
            this.addLabel('favorite');
        },

        /**
         * Remove currently selected items from favorites.
         */
        unfavorite: function() {
            this.removeLabel('favorite');
        },

        /**
         * Add given label to currently selected items.
         *
         * @param {string} name
         */
        addLabel: function(name) {
            var items = this.get().filter(function(item) {
                return !utils.hasLabel(item, name);
            });

            labels.addLabel(name, items);
        },

        /**
         * Remove given label from currently selected items.
         *
         * @param {string} name
         */
        removeLabel: function(name) {
            labels.removeLabel(name, this.get());
        }
    };

    /**
     * Deselect any selected files on state change.
     */
    $rootScope.$on('$stateChangeSuccess', function() {
        selectedItems.deselectAll();
    });

    return selectedItems;
}]);