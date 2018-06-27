'use strict';

angular.module('app')

.directive('edTooltip', function() {
    return {
        restrict: 'A',
        link: function($scope, el, attrs) {

            //no need for tooltips on phones
            if ($scope.isSmallScreen) return;

            el.tooltip({
                placement: attrs.tooltipPlacement || 'bottom',
                delay: 50,
                title: attrs.edTooltip,
                container: 'body'
            })
        }
    }
});