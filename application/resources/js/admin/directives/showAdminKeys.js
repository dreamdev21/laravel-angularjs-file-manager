'use strict';

angular.module('pixie.admin')

.directive('showAdminKeys', ['utils', function(utils) {
    return {
        restrict: 'A',
        compile: function(el) {
            el.on('click', function(e) {
                if (utils.isDemo) {
                    utils.showToast('Sorry, you can\'t do that on demo site.');
                } else {
                    $('[type="password"]', '#keys').attr('type', 'text');
                    el.hide();
                }
            })
        }
   	}
}]);