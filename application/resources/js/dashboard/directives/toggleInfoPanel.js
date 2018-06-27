'use strict';

angular.module('pixie.dashboard')

.directive('edToggleInfoPanel', ['rightPanel', 'localStorage', function(rightPanel, localStorage) {
    return {
        restrict: 'A',
        link: function($scope, el) {
            el.on('click', function() {
                $scope.$apply(function() {
                    rightPanel.open = !rightPanel.open;
                    localStorage.set('rightPanelOpen', rightPanel.open);
                })
            });
        }
    }
}]);