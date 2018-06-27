angular.module('pixie.dashboard')

.directive('edContextMenuItem', ['contextMenu', 'selectedItems', 'folders', function(contextMenu, selectedItems, folders) {
    return {
        restrict: 'A',
        link: function($scope, el, attrs) {
            el.on('contextmenu', function(e) {
                e.preventDefault();
                e.stopPropagation();

                $scope.$apply(function() {
                    //user right clicked on root folder
                    if ('edIsRootFolder' in attrs) {
                        selectedItems.set(folders.getByName('root'), 'folder', true);
                        selectedItems.lastFolder = false;

                    //user right clicked on a folder in folder tree in left panel
                    } else if ( ! $scope.item) {
                        selectedItems.deselectAll();
                        selectedItems.lastFolder = folders.getById(e.currentTarget.dataset.id);

                    //if we have multiple items selected, but user right clicked on item that isn't
                    //currently selected, deselect all items and remove selected class from DOM
                    } else if ( ! selectedItems.has($scope.item)) {
                        selectedItems.deselectAll();
                        selectedItems.set($scope.item);
                        $('.selected').removeClass('selected');
                    }  else {
                        selectedItems.set($scope.item);
                    }
                });

                contextMenu.show(e, $scope.item);
            });
        }
    }
}])

.directive('edMoreOptionsMenu', ['$rootScope', 'contextMenu', 'selectedItems', function($rootScope, contextMenu, selectedItems) {
    return {
        restrict: 'A',
        link: function($scope, el) {
            var open = false,
                menu = $('#context-menu');

            el.on('click', function() {
                if ( ! open || contextMenu.open) {
                    var context = selectedItems.first('type'),
                        rect = el[0].getBoundingClientRect();

                    contextMenu.generateMenu(context);
                    contextMenu.positionMenu({
                        clientX: rect.left,
                        clientY: rect.top + el.height() + 10
                    });

                    open = true;
                    contextMenu.open = false;
                } else {
                    contextMenu.hide();
                    open = false;
                }
            });

            $rootScope.$on('contextmenu.closed', function() {
                open = false;
            });
        }
    }
}])

.directive('edContextMenu', ['$rootScope', 'contextMenu', 'selectedItems', function($rootScope, contextMenu, selectedItems) {
    return {
        restrict: 'A',
        compile: function(el) {
            el.on('click', '.context-menu-item', function(e) {
                e.stopPropagation();
                e.preventDefault();

                selectedItems[e.currentTarget.dataset.action]();

                el.hide();
            });

            el.on('contextmenu', function(e) {
                e.preventDefault();
            });

            //hide custom menu on window resize and update max height
            el.css('max-height', window.innerHeight - 20);
            window.onresize = function() {
                el.hide();
                el.css('max-height', window.innerHeight - 20);
            };

            //hide custom context menu on left click if user didn't click inside the menu itself or on more options button
            $(document).on('click', function(e) {
                var button = e.which || e.button,
                    clickedInsideMenu = $(e.target).closest(el).length || $(e.target).closest('#more-options').length;

                if (button === 1 && !clickedInsideMenu) {
                    $rootScope.$emit('contextmenu.closed');
                }
            });
        }
    }
}])

.factory('contextMenu', ['$rootScope', 'files', 'utils', 'selectedItems', 'folders', function($rootScope, files, utils, selectedItems, folders) {

    var items = [
        { name: utils.trans('preview'), icon: 'eye', action: 'preview', context: ['file', 'multiple-items'] },
        { name: utils.trans('share'), icon: 'share', action: 'share', context: ['file', 'folder', 'rootFolder'] },
        { name: utils.trans('copyLink'), icon: 'link', action: 'copyLink', context: ['file', 'folder', 'rootFolder'] },
        { name: utils.trans('moveTo'), icon: 'folder-empty', action: 'move', context: ['file', 'folder', 'multiple-items'] },
        { name: utils.trans('favorite'), icon: 'star', action: 'favorite', context: ['file', 'folder', 'multiple-items'] },
        { name: utils.trans('rename'), icon: 'pencil', action: 'rename', context: ['file', 'folder'] },
        { name: utils.trans('makeACopy'), icon: 'docs', action: 'copy', context: ['file', 'folder', 'multiple-items'] },
        { name: utils.trans('download'), icon: 'download', action: 'download', context: ['file', 'folder', 'rootFolder', 'multiple-items'], separator: true },
        { name: utils.trans('remove'), icon: 'trash', action: 'delete', context: ['file', 'folder', 'multiple-items'] },
        { name: utils.trans('restore'), icon: 'ccw', action: 'restore', context: ['trash'] },
        { name: utils.trans('deleteForever'), icon: 'trash', action: 'delete', context: ['trash'] }
    ];

    var contextmenu = {
        open: false,
        context: 'file',
        lastFolder: false,

        /**
         * Show context menu.
         *
         * @param {object} e right-click event
         */
        show: function(e) {
            this.context = selectedItems.first('type');

            if (selectedItems.get().length > 1) {
                this.context = 'multiple-items';
            }

            if (utils.stateIs('dashboard.trash')) {
                this.context = 'trash';
            }

            if (this.context === 'folder' && selectedItems.first('name') === 'root' && !selectedItems.lastFolder) {
                this.context = 'rootFolder';
            }

            e.preventDefault();
            this.generateMenu(this.context);
            this.positionMenu(e);

            this.open = true;
        },

        hide: function() {
            $('#context-menu').hide();
            this.open = false;
        },

        generateMenu: function(context) {
            var menu = $('#context-menu');
            menu.find('li').remove();

            for (var i = 0; i < items.length; i++) {
                var item = items[i];

                if (item.context.indexOf(context) === -1 || ((item.action == 'preview' || item.action == 'getLinks') && utils.stateIs('view'))) continue;

                //skip move to action if there is only one folder
                if (item.action === 'move' && folders.available.length === 1) continue;

                //add un-favorite action instead of favorite if item is already favorited or we're in favorites state
                if (item.action === 'favorite' && (selectedItems.getLength() === 1 && utils.hasLabel(selectedItems.first(), 'favorite') || utils.stateIs('dashboard.favorites'))) {
                    menu.append('<li class="context-menu-item" data-action="unfavorite"><i class="icon icon-'+item.icon+'"></i> '+utils.trans('unfavorite')+'</li>');
                    continue;
                }

                menu.append('<li class="context-menu-item" data-action="'+item.action+'"><i class="icon icon-'+item.icon+'"></i> '+item.name+'</li>');

                if (item.separator) {
                    menu.append('<li class="separator"></li>');
                }
            }

            menu.show();
        },

        positionMenu: function(e) {
            var menu = $('#context-menu');

            menu.css('display', 'block');

            var menuWidth    = menu.width() + 4,
                menuHeight   = menu.height() + 20,
                windowWidth  = window.innerWidth,
                windowHeight = window.innerHeight,
                clickCoordsX = e.clientX,
                clickCoordsY = e.clientY;

            if ((windowWidth - clickCoordsX) < menuWidth) {
                menu.css('left', windowWidth - menuWidth + 1);
            } else {
                menu.css('left', clickCoordsX + 1);
            }

            if ((windowHeight - clickCoordsY) < menuHeight) {
                menu.css('top', windowHeight - menuHeight + 1);
            } else {
                menu.css('top', clickCoordsY + 1);
            }
        }
    };

    $rootScope.$on('contextmenu.closed', function() {
        contextmenu.hide();
    });

    $rootScope.$on('$stateChangeSuccess', function() {
        contextmenu.hide();
    });

    return contextmenu;
}]);