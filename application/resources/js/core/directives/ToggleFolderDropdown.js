'use strict';

angular.module('app')

.directive('edToggleFolderDropdown', function() {
    return {
        restrict: 'A',
        link: function($scope, el, attrs) {
            var dropdown = $('.dropdown-folders-list');

            dropdown.on('click', 'li, .heading', function() {
                dropdown.removeClass('open');
            });

            $(document).on('click', function(e) {
                var button = e.which || e.button,
                    leaveOpen  = $(e.target).closest(el).length || $(e.target).closest('.dropdown-folders-list').length;

                if (button === 1 && !leaveOpen) {
                    dropdown.removeClass('open');
                }
            });

            el.on('click', function(e) {
                if (dropdown.hasClass('open')) {
                    dropdown.removeClass('open')
                } else {
                    dropdown.css({
                        top: el.offset().top,
                        left: el.offset().left
                    }).addClass('open');
                }
            });
        }
    }
});