'use strict';

angular.module('app')

.directive('demoInfoContainer', ['$compile', 'localStorage', 'users', 'utils', function($compile, localStorage, users, utils) {
    return {
        restrict: 'E',
        scope: {},
        link: function($scope, el) {
            var creds = localStorage.get('drive-demo-credentials');

            if (users.current) {
                el.hide();
                return;
            }

            if (creds && creds.email && creds.password) {
                el.html('<h3>Your demo account information</h3><div>Email: <strong>'+creds.email+'</strong></div><div>Password: <strong>'+creds.password+'</strong></div>');
                return;
            }

            //append demo info container html
            var html = '<div>'+
                '<h2>Demo site information <i class="icon icon-cancel"></i></h2>'+
                '<ol>'+
                    '<li>There is no shared demo account. Click the button below or register to create one.</li>'+
                    '<li>On Demo site admin area is accessible to all users.</li>'+
                    '<li>Demo accounts will be reset every 2 days. (files, folders, activity etc will be deleted).</li>'+
                    '<li>Accounts on demo site are limited to 100MB of storage space.</li>'+
                    '<li>Demo accounts created via the button below will be populated with sample files and Folders.</li>'+
                '</ol>'+
            '<div class="demo-btn-container"><md-button class="md-primary md-raised">Create my demo account</md-button></div>'+
            '</div>';

            el.html($compile(html)($scope));

            el.find('.icon').on('click', function() {
                el.hide();
            });

            el.find('.md-button').on('click', function() {
                var credentials = { email: utils.randomString(10)+'@demo.com', password: 'demo', password_confirmation: 'demo', createDemoContent: true };

                $(this).addClass('active').find('span').text('creating your demo account...');

                users.register(credentials).success(function(data) {
                    localStorage.set('drive-demo-credentials', { email: data.email, password: 'demo' });
                    utils.toState('dashboard.folders');
                })
            })
        }
    }
}]);