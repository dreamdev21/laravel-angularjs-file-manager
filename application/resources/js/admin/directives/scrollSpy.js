'use strict';

angular.module('pixie.admin')

.directive('edScrollSpy', function() {
    return {
        restrict: 'A',
        compile: function(el) {
            var target       = $(el.data('target')),
                container    = $('.flex-fluid'),
                containerTop = container.offset().top,
                rect         = target[0].getBoundingClientRect();

            if (rect.top - 30 <= containerTop && rect.bottom > containerTop) {
                el.addClass('active');
            }

            el.on('click', function() {
                container.animate({
                    scrollTop: target.offset().top - container.offset().top + container.scrollTop() - 10
                }, 300);
            });

            container.on('scroll', function() {
                var rect = target[0].getBoundingClientRect();

                if (rect.top - 30 <= containerTop && rect.bottom > containerTop) {
                    el.addClass('active');

                } else {
                    el.removeClass('active');
                }
            })
        }
   	}
});