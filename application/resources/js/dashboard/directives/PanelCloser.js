'use strict';

angular.module('pixie.dashboard')

.directive('edPanelCloser', ['rightPanel', 'localStorage', function(rightPanel, localStorage) {
    return {
        restrict: 'A',
        link: function($scope, el) {
            el.on('click', function() {
                $scope.$apply(function() {
                    rightPanel.open = false;
                    localStorage.set('rightPanelOpen', false);
                })
            });
        }
    }
}]);