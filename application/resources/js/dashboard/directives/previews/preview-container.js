angular.module('pixie.dashboard')

.directive('filePreviewContainer', ['$rootScope', '$compile', 'previewStatus', 'selectedItems', function($rootScope, $compile, previewStatus, selectedItems) {
    return {
        restrict: 'A',
        link: function($scope, el) {
            var watchStarted = false;

            $scope.$watch('previewStatus.open', function() {
                var items   = formatItemsArray(),
                    preview = {
                    items: items,
                    total: items.length,
                    current: selectedItems.first()
                };

                for (var i = 0; i < preview.items.length; i++) {
                    if (preview.items[i].id == preview.current.id) {
                        preview.currentIndex = i;
                    }
                }

                $scope.preview = preview;

                if ( ! watchStarted) {
                    initCurrentItemWatch($scope, el.find('.content > .preview'));
                }
            });

            $('.next-item', el).on('click', function() {
                $scope.$apply(function() {
                    $scope.preview.currentIndex++;
                    $scope.preview.current = $scope.preview.items[$scope.preview.currentIndex];
                });
            });

            $('.prev-item', el).on('click', function() {
                $scope.$apply(function() {
                    $scope.preview.currentIndex--;
                    $scope.preview.current = $scope.preview.items[$scope.preview.currentIndex];
                });
            });

            //close file preview on backdrop or close button click
            el.on('click', function(e) {
                if (e.target === el[0] || $(e.target).closest('.close-button')[0]) {
                    $scope.$apply(function() {
                        $scope.previewStatus.open = false;
                    })
                }
            })
        }
    };

    /**
     * Start watching current item. Update preview once it changes.
     *
     * @param {object} $scope
     * @param {object} appendTo
     */
    function initCurrentItemWatch($scope, appendTo) {
        $scope.$watch('preview.current', function(newItem) {
            if (newItem) {
                appendTo.html($compile(getPreviewDirective(newItem.mime))($scope));
                updatePrevNextVisibility($scope.preview);
            }
        });
    }

    /**
     * Show/hide previous and next item buttons.
     *
     * @param {object} preview
     */
    function updatePrevNextVisibility(preview) {
        if (preview.currentIndex === preview.total-1) {
            $('.next-item').hide();
        } else {
            $('.next-item').show();
        }

        if (preview.currentIndex < 1) {
            $('.prev-item').hide();
        } else {
            $('.prev-item').show();
        }
    }

    /**
     * Return directive markup for current preview item.
     *
     * @param {string} mime
     * @return {string}
     */
    function getPreviewDirective(mime) {
        switch (true) {
            case selectedItems.mimeTypeIs('audio', mime):
                return '<audio-preview></audio-preview>';
            case selectedItems.mimeTypeIs('video', mime):
                return '<video-preview></video-preview>';
            case selectedItems.mimeTypeIs('image', mime):
                return '<image-preview></audio-preview>';
            case selectedItems.mimeTypeIs('text', mime):
                return '<text-preview></text-preview>';
            case selectedItems.mimeTypeIs('zip', mime):
                return '<zip-preview></zip-preview>';
            case selectedItems.mimeTypeIs('pdf', mime):
                return '<pdf-preview></pdf-preview>';
            default:
                return '<div class="no-preview-available">'+
                            '<div class="message">{{:: \'noFilePreview\' | translate }}</div>'+
                            '<div class="buttons"><md-button class="md-raised md-primary" ng-click="selectedItems.download()"><i class="icon icon-download"></i> {{:: \'download\' | translate }}'+ '</md-button></div>'+
                       '</div>';
        }
    }

    /**
     * Get either selected items array or all files
     * in current folder and remove sub-folders from it.
     *
     * @returns {array}
     */
    function formatItemsArray() {
        if (selectedItems.get().length > 1 || ! $rootScope.filteredFiles) {
            var items = selectedItems.get().slice();
        } else {
            var items = $rootScope.filteredFiles.slice();
        }

        return items.filter(function(item) {
            return item.type === 'file';
        })
    }
}]);