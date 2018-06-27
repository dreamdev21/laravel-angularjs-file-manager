'use strict';

angular.module('pixie.dashboard').controller('ShareModalController', ['$scope', '$rootScope', '$translate', '$mdDialog', '$http', 'files', 'selectedItems', 'utils', function($scope, $rootScope, $translate, $mdDialog, $http, files, selectedItems, utils) {
    $scope.utils = utils;
    $scope.passwordContainerVisible = false;
    $scope.password = { value: '' };

    $scope.emails = [];
    $scope.mailSendInProgress = false;

    //folder or file that is being shared
    $scope.shareable = selectedItems.first();

    //shareable type - folder or file
    $scope.rawType = selectedItems.first('type');

    //public link to view the shareable
    $scope.link = $rootScope.baseUrl+( ! utils.getSetting('enablePushState') ? '#/' : '')+'view/'+$scope.rawType+'/'+$scope.shareable.share_id + '/' + $scope.shareable.name;

    //translate type after we've used in to construct url
    $scope.type = $translate.instant($scope.rawType);

    $scope.addPassword = function() {
        if ( ! $scope.password.value) return;

        var payload = { id: $scope.shareable.id, type: $scope.rawType, password: $scope.password.value };

        $http.post($rootScope.baseUrl+'shareable-password/add', payload).success(function(data) {
            $scope.shareable.password = true;
            $scope.closePasswordContainer();
            utils.showToast(data);
        })
    };

    $scope.removePassword = function() {
        var payload = { id: $scope.shareable.id, type: $scope.rawType };

        $http.post($rootScope.baseUrl+'shareable-password/remove', payload).success(function(data) {
            $scope.shareable.password = false;
            $scope.password.value = false;
            utils.showToast(data);
        });
    };

    $scope.togglePasswordContainer = function() {
        $scope.passwordContainerVisible = !$scope.passwordContainerVisible;
    };

    $scope.closePasswordContainer = function() {
        $scope.passwordContainerVisible = false;
        $scope.password = '';
    };

    $scope.closeModal = function() {
        $mdDialog.hide();
    };

    $scope.closeModalAndSendEmails = function() {
    	if ($scope.emails.length) {
    		$scope.mailSendInProgress = true;

    		var payload = {emails: $scope.emails.map(function(e) { return e.text;  }), link: $scope.link, name: $scope.shareable.name, message: $scope.emailMessage};

    		$http.post('send-links', payload).success(function(data) {
    			utils.showToast(data);
    			$scope.closeModal();
    		}).error(function() {
    			utils.showToast('genericError', true);
    		}).finally(function() {
    			$scope.mailSendInProgress = false;
    		})
    	} else {
    		$scope.closeModal();
    	}
    }
}]);
