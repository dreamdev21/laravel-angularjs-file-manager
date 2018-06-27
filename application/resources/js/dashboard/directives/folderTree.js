'use strict';

angular.module('pixie.dashboard')

.directive('folderTree', ['$translate', '$compile', 'folders', function($translate, $compile, folders) {
    var states = ['dashboard.trash', 'dashboard.favorites', 'dashboard.recent'];

    return {
        restrict: 'E',
        link: function($scope, el) {
            el.on('click', 'li', function(e) {
                e.preventDefault();
                e.stopPropagation();
                folders.open(e.currentTarget.dataset.name.toLowerCase());
            });

            el.on('click', '.toggle-icon', function(e) {
                e.preventDefault();
                e.stopPropagation();
                $(e.currentTarget).closest('li').find('> .sub-folders').toggleClass('subfolders-open');
            });

            $scope.$watch('folders.selected', function(newFolder, oldFolder) {
                if (newFolder && newFolder !== oldFolder) {
                    changeOpenClass(newFolder.id, el);
                }
            });

            //remove .open class from current folder if we're moving to trash, favorites or recent state
            $scope.$on('$stateChangeSuccess', function(e, state) {
                if (states.indexOf(state.name) > -1) {
                    el.find('.open').removeClass('open');
                    folders.selected = false;
                }
            });

            $scope.$watchCollection('folders.available', function(newFolders, oldFolders) {
                if (newFolders && newFolders.length && oldFolders.length) {
                    buildTree(el, $scope);
                    changeOpenClass(folders.selected.id, el);
                }
            })
        }
    };

    function buildTree(el, $scope) {
        var tree = document.createElement('div'),
            ul   = document.createElement('ul'),
            directRootChildren = [],
            rootFolder,
            openSubFolders = getOpenSubFolders(el);

        tree.className = 'folder-tree';

        folders.available.forEach(function(folder) {
            if (folder.isRootChild) {
                directRootChildren.push(folder);
            }

            if (folder.name === 'root') {
                rootFolder = folder;
            }
        });


        buildList(directRootChildren, ul);

        tree.appendChild(buildRootFolderNode(rootFolder));
        tree.appendChild(ul);

        el.html($compile(tree)($scope));

        if (openSubFolders.length) {
            openSubFolders.forEach(function(id) {
                el.find('[data-id="'+id+'"] > .sub-folders').addClass('subfolders-open');
            });
        }
    }

    function buildRootFolderNode(rootFolder) {
        var div = document.createElement('div');
        div.setAttribute('ui-sref', 'dashboard.foldersRoot');
        div.setAttribute('ed-context-menu-item', '');
        div.setAttribute('ed-is-root-folder', '');
        div.setAttribute('ed-folder-droppable', '');
        div.dataset.id = rootFolder.id;
        div.className = 'heading folder';

        var folderName = document.createElement('div');
        folderName.className = 'folder-name';
        div.appendChild(folderName);

        var folderIcon = document.createElement('i');
        folderIcon.className = 'icon icon-folder';

        folderName.appendChild(folderIcon);
        folderName.appendChild(document.createTextNode($translate.instant('folders')));

        return div;
    }

    function buildList(foldersArray, appendTo, indentLevel) {
        for (var i = 0; i < foldersArray.length; i++) {
            var folder      = foldersArray[i],
                children    = folders.getSubFolders(folder.id),
                hasChildren = children && children.length;

            var li = createListItem(folder, appendTo, indentLevel, hasChildren);

            if (hasChildren) {
                indentLevel ? indentLevel++ : indentLevel = 1;

                var ul = document.createElement('ul');
                ul.className = 'sub-folders';

                buildList(children, ul, indentLevel);
                li.appendChild(ul);
                indentLevel ? indentLevel-- : null;
            }
        }
    }

    function createListItem(folder, appendTo, indentLevel, hasChildren) {
        var li = document.createElement('li');
        li.dataset.name = folder.name;
        li.dataset.id   = folder.id;
        li.dataset.shareId = folder.share_id;
        li.setAttribute('ed-context-menu-item', '');
        li.setAttribute('ed-folder-droppable', '');

        var name = document.createElement('div');
        name.className = 'folder-name';

        var icons = document.createElement('div');
        icons.className = 'icons';

        var padding = parseInt(18*indentLevel)+45;
        name.style.cssText = 'padding-left: '+padding+'px;';

        if (hasChildren) {
            var toggleIcon = document.createElement('i');
            toggleIcon.className = 'icon toggle-icon icon-right-dir';
            icons.appendChild(toggleIcon);
        }

        var folderIcon = document.createElement('i');
        folderIcon.className = 'icon icon-folder';
        icons.appendChild(folderIcon);

        name.appendChild(icons);
        name.appendChild(document.createTextNode(folder.name));


        li.appendChild(name);
        appendTo.appendChild(li);
        return li;
    }

    function changeOpenClass(id, el) {
        el.find('.open').removeClass('open');
        el.find('[data-id="'+id+'"] > .folder-name').addClass('open');
    }

    /**
     * Get ids of nodes we'll need to re-apply open class to after rebuilding
     * the folder tree so previous sub-folders are toggled again
     *
     * @returns {Array}
     */
    function getOpenSubFolders(el) {
        var ids = el.find('.subfolders-open').map(function() {
            return $(this).closest('li').data('id');
        });

        return ids.get();
    }
}]);