'use strict';

angular.module('app')

.directive('togglePreviewSidebar', function() {
    return {
        restrict: 'A',
        link: function($scope, el) {
            var toggler = $('.toggle-comments');

            toggler.on('click', function() {
                el.toggleClass('open');
            })
        }
    }
});