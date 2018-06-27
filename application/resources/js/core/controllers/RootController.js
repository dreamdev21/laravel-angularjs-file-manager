'use strict';

angular.module('app').controller('RootController', ['$scope', '$rootScope', '$state', '$mdToast', '$translate', 'users', 'utils', function($scope, $rootScope, $state, $mdToast, $translate, users, utils) {
    $scope.users = users;
    $scope.utils = utils;

    //delay editor auto start when it's loaded so we can load it manually later
    $rootScope.delayEditorStart = true;

    $scope.statesWhereNavbarIsHidden = ['editor', 'login', 'register'];

    $scope.isNavbarVisible = function() {
        return $state.current.name && $scope.statesWhereNavbarIsHidden.indexOf($state.current.name) === -1;
    };

    $rootScope.ajaxProgress = {

        //show files spinner as soon as possible and until files are fetched
        files: true
    };

    //update document title on state change
    $rootScope.$on('$stateChangeStart', function(e, toState, params) {
        var title = utils.getSetting('siteName');

        //on of the album state
        if (params.folderName) {
            title = params.folderName+' - '+utils.getSetting('siteName');

        //main dashboard page
        } else if (toState.name.indexOf('folders') > -1) {
            title = $translate.instant('dashboard') + ' - ' + utils.getSetting('siteName');

        //view photo or album page
        } else if (toState.name === 'view') {
            title = params.name + ' - ' + utils.getSetting('siteName');

        } else if (toState.name === 'editor') {
            title = utils.trans('photoEditor') + ' - ' + utils.getSetting('siteName');

        //everything else
        } else {
            title = utils.getSetting('siteName')  + ' - ' + $translate.instant(toState.name.split('.')[1] || toState.name+'Title');
        }

        document.title = title;
    });
}]);