'use strict';

angular.module('pixie.dashboard')

.directive('leftColumnCloser', function() {
    return {
        restrict: 'A',
        link: function($scope, el) {
            el.on('click', function() {
                el.closest('#left-col').addClass('closed');
            });

            $('#dashboard').on('click', '.left-col-toggler', function() {
                $('#left-col').toggleClass('closed');
            })
        }
    }
});