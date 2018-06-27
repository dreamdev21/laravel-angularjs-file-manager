'use strict';

angular.module('app')

.directive('demoAlert', ['localStorage', function(localStorage) {
    return {
        restrict: 'E',
        replace: true,
        template: '<div class="demo-alert"><p></p><i ng-click="removeDemoAlert()" class="icon icon-cancel"></i></div>',
        scope: {},
        controller: ['$scope', function($scope) {
            $scope.removeDemoAlert = function() {
                $('.demo-alert').remove();
                localStorage.set('readBeDrive'+$scope.alertKey+'DemoWarning', true);
            }
        }],
        link: function($scope, el, attrs) {
            $scope.alertKey = attrs.storageKey;

            if (localStorage.get('readBeDrive'+$scope.alertKey+'DemoWarning')) {
                return el.hide();
            }

            el.find('p').text(attrs.message);
        }
    }
}]);