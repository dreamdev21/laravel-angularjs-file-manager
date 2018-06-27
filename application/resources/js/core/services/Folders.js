angular.module('app')

.factory('folders', ['$rootScope', '$http', '$mdDialog', '$stateParams', '$state', 'utils', 'dashboardState', function($rootScope, $http, $mdDialog, $stateParams, $state, utils, dashboardState) {
    var folders = {

        //model for renaming/create new folder
        folderNameModel: {},

        //all folders user has created
        available: [],

        //currently selected folder
        selected: false,

        /**
         * Get all folders current user has access to.
         *
         * @returns {Promise}
         */
        getAll: function(all) {
            return $http.get('folders?all='+all).success(function(data) {
                folders.available = data;
                folders.bindEvents();
            })
        },

        /**
         * Open folder with given name.
         *
         * @param {string} name
         */
        open: function(name) {
            if (!name) return;
            $state.go('dashboard.folders', { folderId: name });
        },

        /**
         * Create a new folder.
         *
         * @returns {Promise|void}
         */
        createNew: function() {
            if ( ! this.folderNameModel.new) return;

            return $http.post('folders', { name: this.folderNameModel.new, parent: this.selected }).success(function(data) {
                folders.closeModal();
                utils.showToast('newFolderCreated', true);
                folders.available.push(data);
                folders.open(data.name);
                $('.folder-name-modal .md-modal-error').html('');
                $rootScope.$emit('activity.happened', 'created', 'folder', data)
            }).error(function(data) {
                $('.folder-name-modal .md-modal-error').html(data);
            })
        },

        /**
         * Return a file matching given id from selected folder files.
         *
         * @param   {string|int} id
         * @returns {*}
         */
        getFileById: function(id) {
            if (! this.selected || ! this.selected.files) return;

            for (var i = 0; i < this.selected.files.length; i++) {
                if (this.selected.files[i].id == id) {
                    return this.selected.files[i];
                }
            }
        },

        /**
         * Rename folder matching given name.
         *
         * @param {string} name
         */
        rename: function(name) {
            var folder  = this.getByName(name),
                payload = { name: this.folderNameModel.new };

            if (folder && folder.name !== 'root') {
                $http.put($rootScope.baseUrl+'folders/'+folder.id, payload).success(function(data) {
                    utils.showToast('folderRenameSuccess', true);
                    folders.closeModal();

                    for (var i = 0; i < folders.available.length; i++) {
                        if (data.id == folders.available[i].id) {
                            folders.available[i] = data;

                            if (folders.selected.id == data.id) {
                                folders.selectByName(data.name);
                            }

                            $rootScope.$emit('activity.happened', 'renamed', 'folder', data);
                            break;
                        }
                    }
                }).error(function(data) {
                    utils.showToast(data);
                })
            }
        },

        /**
         * Open modal for sharing selected folder.
         *
         * @param {object} $event
         */
        openShareModal: function($event) {
            $mdDialog.show({
                template: $('#share-modal').html(),
                targetEvent: $event,
                controller: 'ShareModalController'
            });
        },

        /**
         * Open modal for creating a new folder.
         *
         * @param {object} $event
         */
        openNewModal: function($event) {
            $mdDialog.show({
                template: $('#new-folder-name-modal').html(),
                clickOutsideToClose: true,
                targetEvent: $event,
                controller: ['$scope', 'folders', function($scope, folders) {
                    $scope.folders = folders;
                    $scope.create = true;
                }],
                onComplete: function() {
                    $('#folder-name').focus();
                }
            });
        },

        /**
         * Open modal for renaming a folder.
         *
         * @param {string} name
         * @param {object} $event
         */
        openRenameModal: function(name) {
            this.folderNameModel.new = name;
            this.folderNameModel.old = name;

            $mdDialog.show({
                template: $('#new-folder-name-modal').html(),
                clickOutsideToClose: true,
                controller: ['$scope', 'folders', function($scope, folders) {
                    $scope.folders = folders;
                    $scope.rename = true;
                }],
                onComplete: function() {
                    $('#folder-name').focus();
                }
            });
        },

        closeModal: function() {
            folders.folderNameModel = {};
            $mdDialog.hide();
        },

        /**
         * Return whether or not we have any folders open
         * and if we are in folders state.
         *
         * @returns {*|boolean}
         */
        anyOpen: function() {
            return (this.selected && this.selected.name && this.selected.name !== 'root') || $state.current.name.indexOf('albums') === -1;
        },

        /**
         * Open initial folder based on state params and bind to state change event.
         */
        bindEvents: function() {
            if (this.eventsBound) return;

            var unbind = $rootScope.$on('folders.selected.changed', function() {
                dashboardState.loaded = true;
                unbind();
            });

            this.selectByName($stateParams.folderId || 'root');

            this.unbindStateChangeEvent = $rootScope.$on('$stateChangeStart', function(e, toState, params) {
                if (toState.name.indexOf('folders') > -1) {
                    folders.selectByName(params.folderId || 'root');
                }
            });

            this.eventsBound = true;
        },

        /**
         * Open preview gallery with given folders files (if it's not empty)
         *
         * @param {string} name
         * @returns {void}
         */
        preview: function(name) {
            var folder = this.getByName(name);

            //if we haven't fetched files yet for this folder do it now
            if ( ! angular.isArray(folder.files)) {
                this.getFilesFor(folder).success(function() {
                    folder = folders.getByName(name);

                    if (! folder.files.length) {
                        return utils.showToast('nothingToPreview', true);
                    }

                    gallery.open(folder.files);
                })
            } else {
                if (! folder.files.length) {
                    return utils.showToast('nothingToPreview', true);
                }

                gallery.open(folder.files);
            }
        },

        /**
         * Get a folder matching given name.
         *
         * @param {string} name
         *
         * @returns {object|void}
         */
        getByName: function(name) {
            if ( ! name) return;

            for (var i = 0; i < this.available.length; i++) {
                if (this.available[i].name === name) {
                    return this.available[i];
                }
            }
        },

        selectByName: function(name) {
            var folder = this.get(name);

            //we've already fetched files for this folder from server
            if (folder && folder.files) {
                this.selected = folder;
                $rootScope.$emit('folders.selected.changed');
                $rootScope.ajaxProgress.files = false;
                return;
            }

            //get this folder files from server
            return $http.get($rootScope.baseUrl+'folders/'+encodeURIComponent(name)).success(function(data) {
                folders.selected = folders.set(data);
                $rootScope.$emit('folders.selected.changed');
            }).finally(function() {
                $rootScope.ajaxProgress.files = false;
            })
        },

        getSubFolders: function(id, isRoot) {
            var subFolders = [];

            this.available.forEach(function(folder) {
                if ((folder.folder_id == id) || (isRoot && ! folder.folder_id && folder.name !== 'root')) subFolders.push(folder);
            });

            return subFolders;
        },

        /**
         * Get a folder by name.
         *
         * @param {string} name
         * @returns {object|undefined}
         */
        get: function(name) {
            for (var i = 0; i < this.available.length; i++) {
                if (this.available[i].name.toLowerCase() === name) {
                    return this.available[i];
                }
            }
        },

        /**
         * Replace an existing folder with a new one.
         *
         * @param {object} folder
         * @returns {object|undefined}
         */
        set: function(folder) {
            for (var i = 0; i < this.available.length; i++) {
                if (this.available[i].name === folder.name) {
                    return this.available[i] = folder;
                }
            }
        },

        /**
         * Get a folder matching given id.
         *
         * @param id
         * @returns {object|void}
         */
        getById: function(id) {
            if ( ! id) return;

            for (var i = 0; i < this.available.length; i++) {
                if (this.available[i].id == id) {
                    return this.available[i];
                }
            }
        },
    };

    $rootScope.$on('user.loggedOut', function() {
        folders.available = [];
        folders.selected = false;
        folders.eventsBound = false;
        folders.unbindStateChangeEvent && folders.unbindStateChangeEvent();
    });

    return folders;
}]);