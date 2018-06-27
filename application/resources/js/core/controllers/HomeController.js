angular.module('app').controller('HomeController', ['$scope', '$state', 'utils', function($scope, $state, utils) {
    $scope.ad1 = utils.trustHtml(utils.getSetting('ad_home_slot_1'));

    $scope.shareable = {};

    $scope.linkSelectModel = {
        type: 'directLink',
        size: 'absoluteUrl'
    };

    $scope.assignShareable = function(item) {
        $scope.shareable = item;
    }
}]);