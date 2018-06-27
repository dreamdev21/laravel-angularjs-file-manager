'use strict';
angular.module('app')
.config(['$urlRouterProvider', '$stateProvider', '$urlMatcherFactoryProvider', '$locationProvider', function($urlRouterProvider, $stateProvider, $urlMatcherFactoryProvider, $locationProvider) {

    //enable html5 pushState if user selected it
    if (parseInt(vars.settings.enablePushState)) {
        $locationProvider.html5Mode(true);
    }

    $urlMatcherFactoryProvider.strictMode(false);

    $urlRouterProvider.when('/dashboard', '/dashboard/folders');
    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: 'assets/views/home.html',
            controller: 'HomeController'
        })
        .state('view', {
            url: '/view/:type/:id/:name',
            templateUrl: 'assets/views/view.html',
            controller: 'ViewController'
        })
        .state('login', {
            url: '/login',
            templateUrl: 'assets/views/login.html',
            controller: 'LoginController'
        })
        .state('register', {
            url: '/register',
            templateUrl: 'assets/views/register.html',
            controller: 'RegisterController'
        })
        .state('dashboard', {
            url: '/dashboard',
            abstract: true,
            templateUrl: 'assets/views/dashboard/dashboard.html',
            controller: 'DashboardController'
        })
        .state('dashboard.trash', {
            url: '/trash',
            templateUrl: 'assets/views/dashboard/files.html',
            controller: 'TrashController'
        })
        .state('dashboard.recent', {
            url: '/recent',
            templateUrl: 'assets/views/dashboard/files.html',
            controller: 'RecentController'
        })
        .state('dashboard.favorites', {
            url: '/favorites',
            templateUrl: 'assets/views/dashboard/files.html',
            controller: 'FavoritesController'
        })
        .state('dashboard.search', {
            url: '/search/:query',
            templateUrl: 'assets/views/dashboard/files.html',
            controller: 'SearchController'
        })
        .state('dashboard.folders', {
            url: '/folders/:folderId?',
            templateUrl: 'assets/views/dashboard/files.html',
            params: {
                folderName: { value: null }
            }
        })
        .state('dashboard.foldersRoot', {
            url: '/folders',
            templateUrl: 'assets/views/dashboard/files.html',
            params: {
                folderName: { value: null }
            }
        })

        //ADMIN
        .state('admin', {
            url: '/admin',
            abstract: true,
            templateUrl: 'assets/views/admin/admin.html',
            controller: 'AdminController',
        })
        .state('admin.users', {
            url: '/users',
            templateUrl: 'assets/views/admin/users.html'
        })
        .state('admin.files', {
            url: '/files',
            templateUrl: 'assets/views/admin/files.html'
        }).state('admin.folders', {
            url: '/folders',
            templateUrl: 'assets/views/admin/folders.html'
        })
        .state('admin.analytics', {
            url: '/analytics',
            templateUrl: 'assets/views/admin/analytics.html',
            controller: 'AnalyticsController'
        })
        .state('admin.settings', {
            url: '/settings',
            templateUrl: 'assets/views/admin/settings.html',
            controller: 'SettingsController'
        })
        .state('admin.ads', {
            url: '/ads',
            templateUrl: 'assets/views/admin/admin-ads.html',
            controller: 'SettingsController'
        })
}]);
