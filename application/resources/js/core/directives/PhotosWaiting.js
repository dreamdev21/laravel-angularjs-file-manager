'use strict';

angular.module('app')

.directive('edPhotosWaiting', ['$rootScope', '$compile', 'localStorage', 'utils', function($rootScope, $compile, localStorage, utils) {
    return {
        restrict: 'E',
        template: '<div id="photos-waiting"></div>',
        replace: true,
        link: function($scope, el) {
            updateCounter();

            $rootScope.$on('photos.uploaded', updateCounter);

            el.on('click', '.icon-cancel', function() {
                el.fadeOut();
            });

            function updateCounter() {
                var ids = localStorage.get('attachIds');

                if (ids && ids.length) {
                    $compile(el.html(utils.trans('photosWaiting', { number: ids.length })))($scope);
                    el.fadeIn();
                } else {
                    el.fadeOut();
                }
            }
        }
    }
}]);