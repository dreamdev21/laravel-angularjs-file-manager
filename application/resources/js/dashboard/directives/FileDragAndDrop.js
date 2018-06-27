'use strict';

angular.module('pixie.dashboard')

.directive('edFileDraggable', ['selectedItems', function(selectedItems) {
    return {
        link: function($scope, el) {
            el.draggable({
                revert: 'invalid',
                appendTo: 'body',
                cancel: '.list-view .user-item:not(.selected)',
                helper: function() {
                    document.body.classList.add('dragging');

                    if ( ! selectedItems.items || ! selectedItems.has($scope.item)) {
                        $scope.$apply(function() {
                            selectedItems.set($scope.item, $scope.item.type, true);
                        });
                    }

                    var items = selectedItems.get(),
                        helper = $('<div id="photo-drag-helper"><i class="icon icon-picture"></i>'+selectedItems.first('name')+'</div>');

                    if (items) {
                        helper.append('<div class="items-count">'+items.length+'</div>');

                        items.forEach(function(item) {
                            $('[data-id="'+item.id+'"]').addClass('dragging');
                        });
                    }

                    return helper;
                },
                cursorAt: {
                    top: 0,
                    left: -10
                },
                stop: function() {
                    document.body.classList.remove('dragging');
                    $('.dragging').removeClass('dragging');
                }
            });

            $scope.$on('$destroy', function() {
                el.off('**');
            });
        }
    };
}])

//move photo into folder when dropped on element
.directive('edFolderDroppable', ['selectedItems', 'files', function(selectedItems, files) {
    return {
        link: function($scope, el) {
            //if this directive is added to file node, bail
            if ($scope.item && $scope.item.type === 'file') return;

            el.droppable({
                hoverClass: 'draggable-over',
                drop: function(e) {
                    files.moveToFolder(selectedItems.get(), e.target.dataset.id);
                },
                tolerance: 'pointer'
            });

            $scope.$on('$destroy', function() {
                el.off('**');
            });
        }
    };
}])

//move photo into when dropped on element
.directive('edTrashDroppable', ['selectedItems', function(selectedItems) {
    return {
        link: function($scope, el) {
            el.droppable({
                hoverClass: 'draggable-over',
                drop: function() {
                    selectedItems.delete();
                },
                tolerance: 'pointer'
            });

            $scope.$on('$destroy', function() {
                el.off('**');
            });
        }
    };
}]);
