'use strict';

angular.module('pixie.dashboard').controller('SearchController', ['$rootScope', '$scope', '$http', '$stateParams', function($rootScope, $scope, $http, $stateParams) {

    getSearchResults($stateParams.query);

    //on photo or folder deletion remove it from $scope items array
    var unbind = $rootScope.$on('activity.happened', function(e, action, type, items) {
        if (action !== 'deleted') return;

        $scope.items = $scope.items.filter(function(item) {
            return items.indexOf(item) === -1;
        });
    });

    //cleanup
    $scope.$on('$destroy', function() { unbind(); });

    function getSearchResults(query) {
        return $http.get('search/'+query+'?full=true').success(function(data) {
            $scope.items = data;
        }).finally(function() {
            $rootScope.ajaxProgress.files = false;
        })
    }
}]);