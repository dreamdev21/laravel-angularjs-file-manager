'use strict';

angular.module('app').controller('AnalyticsController', ['$scope', '$http', 'utils', function($scope, $http, utils) {
    $scope.stats = {};

    $http.get($scope.baseUrl+'stats').success(function(data) {
        data.files_size = utils.formatFileSize(data.files_size);
        $scope.stats = data;
    })
}]);
