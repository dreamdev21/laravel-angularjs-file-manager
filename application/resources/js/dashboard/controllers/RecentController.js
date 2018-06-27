'use strict';

angular.module('pixie.dashboard').controller('RecentController', ['$rootScope', '$scope', '$http', 'dashboardState', function($rootScope, $scope, $http, dashboardState) {
    $scope.items = [];

    getItems();

    var unbind = $rootScope.$on('activity.happened', function() {
        getItems();
    });

    $scope.$on('$destroy', function() {
        unbind();
    });

    function getItems() {
        $http.get('files/recent').success(function(data) {
            $scope.items = data;
            dashboardState.recentLoaded = true;
        });
    }
}]);