'use strict';

angular.module('pixie.dashboard', []);
angular.module('image.directives', []);
angular.module('pixie.admin', []);
angular.module('app',
    ['ui.router', 'ngAnimate', 'ngTagsInput', 'material.core', 'material.components.autocomplete', 'material.components.dialog', 'material.components.backdrop', 'material.components.button', 'material.components.checkbox',
     'material.components.icon', 'material.components.input', 'material.components.progressCircular', 'material.components.progressLinear', 'material.components.select', 'material.components.toast',
     'ngMessages', 'afkl.lazyImage', 'pascalprecht.translate', 'angularFileUpload', 'angularUtils.directives.dirPagination', 'pixie.dashboard', 'pixie.admin'])

.factory('addMethodOverrideHeader', function() {
    return {
        request: function (config) {
            if (['PATCH', 'PUT', 'DELETE'].indexOf(config.method) > -1) {
                config.headers['X-HTTP-Method-Override'] = config.method;
                config.method = 'POST';
            }

            return config;
        }
    };
})

.config(['$mdThemingProvider', '$translateProvider', '$compileProvider', '$httpProvider', function($mdThemingProvider, $translateProvider, $compileProvider, $httpProvider) {
    $compileProvider.debugInfoEnabled(false);

    $mdThemingProvider.theme('default')
        .primaryPalette('deep-orange')
        .accentPalette('brown');

    if (vars.selectedLocale) {
        $translateProvider.translations(vars.selectedLocale, vars.trans);
        $translateProvider.preferredLanguage(vars.selectedLocale);
    } else {
        $translateProvider.translations('en', vars.trans);
        $translateProvider.preferredLanguage('en');
    }

    $translateProvider.useUrlLoader('trans-messages');
    $translateProvider.useSanitizeValueStrategy('escaped');

    $httpProvider.interceptors.push('addMethodOverrideHeader');
}])

.run(['$rootScope', '$state', 'users', 'utils', function($rootScope, $state, users, utils) {

    //set base url
    $rootScope.baseUrl = vars.baseUrl + '/';

    //see if we're running in a demo env
    utils.isDemo = parseInt(vars.isDemo);

    //set laravel token
    $rootScope.token = vars.token;

    //set current user
    users.assignCurrentUser(vars.user ? JSON.parse(vars.user) : false);

    //load settings
    utils.setAllSettings(vars.settings);
    utils.version = vars.version;

    //remove vars script node and delete vars object from window.
    $('#vars').remove(); delete window.vars;

    //set moment locale
    moment.locale(utils.getSetting('dateLocale', 'en'));

    //see if folder upload is supported
    var input = document.createElement('input');
    input.type="file";
    utils.folderUploadSupported = 'webkitdirectory' in input;

    var docWidth = $(document).width();
    $rootScope.isSmallScreen = docWidth <= 768;
    $rootScope.isTablet      = docWidth <= 1200 && docWidth > 768;

    var statesThatNeedAuth = ['dashboard', 'admin'];

    $rootScope.$on('$stateChangeStart', function(e, toState, params) {

        //extract parent state name if it's a child state
        var stateName = toState.name.replace(/\..+?$/, '');

        if ( ! $state.get(stateName)) {
            e.preventDefault();
        }

        if (toState.name === 'home') {
            if (users.current) {
                e.preventDefault();
                $state.go('dashboard.folders');
            } else {
               toState.templateUrl = utils.getHomeTemplateUrl();
               toState.controller  = utils.getHomeController();
            }         
        }

        //check if user can access this state
        if (statesThatNeedAuth.indexOf(stateName) > -1 && ! users.current) {
            e.preventDefault();
            $state.go('login');
        }

        //logged in users can't access login or register state
        if ((stateName == 'login' || stateName == 'register') && users.current) {
            e.preventDefault();
            $state.go('dashboard.folders');
        }

        //if registration is disabled redirect to login state
        if (stateName == 'register' && ! utils.getSetting('enableRegistration')) {
            e.preventDefault();
            $state.go('login');
        }

        if (stateName == 'admin') {
            if (! users.current || ! users.current.isAdmin) {
                e.preventDefault();
                $state.go('dashboard.folders');
            }
        }
    })

}]);