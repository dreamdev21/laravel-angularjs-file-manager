'use strict';

angular.module('app')

.directive('spaceUsage', ['$rootScope', '$http', 'users', 'utils', function($rootScope, $http, users, utils) {
        
    return {
        restrict: 'E',
        replace: true,
        scope: {},
        template: '<div class="space-usage">'+
                    '<div class="progress">'+
                        '<div class="progress-bar" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"></div>'+
                    '</div>'+
                    '<div class="text"><span class="space-used"></span> / <span class="space-avail"></span> <span class="upgrade" ng-if="utils.getSetting(\'enablePayments\')">{{:: "upgrade" | translate }}</span></div>'+
                   '</div>',
        link: function($scope, el) {
            $scope.utils = utils;

            fetchUserSpaceUsage().success(function(data) {
                updateSpaceUsage(el, data);
                el.show();
            });

            var unbind = $rootScope.$on('activity.happened', function() {
                fetchUserSpaceUsage().success(function(data) {
                    updateSpaceUsage(el, data);
                });
            });

            var unbind2 = $rootScope.$on('user.subscribed', function() {
                fetchUserSpaceUsage().success(function(data) {
                    updateSpaceUsage(el, data);
                });
            });

            $scope.$on('$destroy', function() {
                unbind(); unbind2();
            })
        }
    };

    function fetchUserSpaceUsage() {
        return $http.get('users/space-usage');
    }

    function updateSpaceUsage(el, info) {
        var percentage = (info.space_used / info.max_space * 100);
        var spaceUsed = utils.formatFileSize(info.space_used);
        var spaceAvail = utils.formatFileSize(info.max_space);
        
        el.find('.progress-bar').css('width', percentage+'%');
        el.find('.space-used').text(spaceUsed);
        el.find('.space-avail').text(spaceAvail);

        if (percentage >= 100) {
            el.find('.progress-bar').css('background-color', '#B71C1C');
        }
    }
}]);