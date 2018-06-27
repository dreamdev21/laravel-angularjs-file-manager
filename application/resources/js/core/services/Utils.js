
angular.module('app')

.factory('utils', ['$rootScope', '$translate', '$mdToast', '$mdDialog', '$state', '$sce', function($rootScope, $translate, $mdToast, $mdDialog, $state, $sce) {
    return {
        settings: {},

        showToast: function(message, translate) {
            message = translate ? $translate.instant(message) : message;
            $mdToast.show($mdToast.simple({ position: 'bottom right', hideDelay: 2200}).content(message));
        },

        formatFileSize: function(bytes, noExtension) {
            if (noExtension) {
                return filesize(bytes, {output: 'array'})[0];
            }

            return filesize(bytes);
        },

        /**
         * Extract extension from filename.
         *
         * @param {string} filename
         * @returns {undefined|string}
         */
        extractExtension: function(filename) {
            var re = /(?:\.([^.]+))?$/;
            return re.exec(filename)[1];
        },

        /**
         * Truncate string to given length.
         *
         * @param {string} text
         * @param {int} length
         * @returns {string}
         */
        truncate: function(text, length) {
            if (text && text.length > length) {
                return text.substring(0, length)+'...';
            }

            return text;
        },

        /**
         * Get total size for given folder.
         *
         * @param {object} folder
         * @returns {int|string}
         */
        getFolderSize: function(folder) {
            if ( ! folder || folder.files) return 0;

            for (var i = 0; i < folder.files.length; i++) {
                total += parseInt(folder.files[i].file_size);
            }

            return this.formatFileSize(total);
        },

        /**
         * Load js script and execute callback if provided.
         *
         * @param {string} url
         * @param {function|undefined} callback
         */
         loadScript: function(url, callback) {
         	var filename = url.replace(/^.*[\\\/]/, ''), r = false;

            //bail if we have already loaded this script
            if (document.getElementById(filename)) return;

            var s = document.createElement('script');
            s.src = url;
            s.id = filename;

            if (callback) {
            	s.onload = s.onreadystatechange = function() {
            		if ( !r && (!this.readyState || this.readyState == 'complete')) {
            			r = true; callback();
            		}
            	};
            }

            document.body.appendChild(s);
        },

        /**
         * Validate email using regex.
         *
         * @param {string|object} email
         * @returns {boolean}
         */
        validateEmail: function(email) {
            if (angular.isObject(email)) email = email.text;

            var re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            return re.test(email);
        },

        /**
         * Generate random string of given length.
         *
         * @param {int|undefined} length
         * @returns {string}
         */
        randomString: function(length) {
            if ( ! length) length = 15;

            return Math.random().toString(36).substr(2, length);
        },

        /**
         * Format date/time stamp into more human readable format.
         *
         * @param {string} date
         * @returns {*}
         */
        formatDate: function(date) {
            return moment.utc(date).format('MMMM Do YYYY, h:mm:ss a');
        },

        /**
         * Capitalize given string.
         *
         * @param {string} string
         * @returns {string}
         */
        capitalize: function(string) {
            return string.charAt(0).toUpperCase() + string.slice(1)
        },

        /**
         * Register given html with angular so we can output it with ng-bind-html.
         *
         * @param {string} html
         * @returns {string}
         */
        trustHtml: function(html) {
            return $sce.trustAsHtml(html);
        },

        /**
         * Transition to given state.
         *
         * @param {string} state
         * @param {object|undefined} params
         */
        toState: function(state, params) {
            $state.go(state, params);
        },

        /**
         * Return whether active state or it's parent matches any of the given names.
         *
         * @param {string|array} names
         * @returns {boolean}
         */
        stateIs: function(names) {
            if ( ! angular.isArray(names)) names = [names];

            for (var i = 0; i < names.length; i++) {
                if ($state.includes(names[i])) return true;
            }
        },

        /**
         * Return a translation for given key.
         *
         * @param {string} key
         * @param {object|undefined} params
         *
         * @returns {string}
         */
        trans: function(key, params) {
            return $translate.instant(key, params);
        },

        /**
         * Return if item has a label.
         *
         * @param {object} item
         * @param {string} label
         * @returns {boolean}
         */
        hasLabel: function(item, label) {
            if ( ! item || ! item.labels || !item.labels.length) return;

            for (var i = 0; i < item.labels.length; i++) {
                if (item.labels[i].name === label) return true;
            }
        },

        confirm: function(options) {
            var template =
                '<md-dialog class="md-modal md-modal-wide confirm-modal">'+
                    '<div class="md-modal-header">'+
                        '<h1>{{:: \''+options.title+'\' | translate }}</h1>'+
                        '<div ng-click="utils.closeModal()" class="md-close-modal"><i class="mdi mdi-close"></i></div>'+
                    '</div>'+
                    '<p>{{:: \''+options.content+'\' | translate }}</p>'+
                    (options.subcontent ? '<strong>{{:: \''+options.subcontent+'\' | translate }}</strong>' : '')+
                    '<div class="buttons">'+
                        '<md-button ng-click="utils.closeModal()">{{:: \'cancel\' | translate }}</md-button>'+
                        '<md-button ng-click="confirm()" class="md-raised md-primary">{{:: \''+options.ok+'\' | translate }}</md-button>'+
                    '</div>'+
                '</md-dialog>';

            $mdDialog.show({
                template: template,
                clickOutsideToClose: true,
                controller: ['$scope', 'utils', function($scope, utils) {
                    $scope.utils = utils;
                    $scope.confirm = function() {
                        options.onConfirm();
                        $scope.utils.closeModal();
                    }
                }]
            });
        },

        openModal: function(name, $event) {

            //controller name - uppercase first letter and add Controller at the end
            var ctrl = name.charAt(0).toUpperCase() + name.slice(1) + 'Controller',

            //template id - camel case to dashed case and add -modal-template at the end
            id = '#'+name.replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();})+'-modal-template';

            if ( ! ctrl) {
                ctrl = ['$scope', 'files', 'utils', function($scope, files, utils) {
                    $scope.files = files;
                    $scope.utils = utils;
                }]
            }

            $mdDialog.show({
                template: $(id).html(),
                targetEvent: $event,
                controller: ctrl,
                clickOutsideToClose: true
            });
        },

        /**
         * Close currently open modal.
         */
        closeModal: function() {
            $mdDialog.hide();
        },

        /**
         * Return base url for the site.
         *
         * @returns {string}
         */
        baseUrl: function() {
            return $rootScope.baseUrl;
        },

        getAllSettings: function() {
            return this.settings;
        },

        getSetting: function(name, defaultValue) {
            if (name.indexOf('env.') > -1) {
                var setting = this.settings['env'][name.split('env.')[1]];
            } else {
                var setting = this.settings[name];
            }

            if (typeof setting === 'undefined') {
                setting = defaultValue;
            }

            if (setting === '1' || setting === '0') {
                return parseInt(setting);
            }

            return setting;
        },

        setAllSettings: function(settings) {
            if (angular.isObject(settings)) {
                this.settings = settings;
            }
        },

        getHomeTemplateUrl: function() {
            var start = 'assets/views/';

            if (this.settings.homepage === 'login') {
                return start+'/login.html';
            } else if (this.settings.homepage === 'custom' && this.settings.customHomePath) {
                return this.settings.customHomePath;
            } else {
                return start+'/home.html';
            }
        },

        getHomeController: function() {
            if (this.settings.homepage === 'login') {
                return 'LoginController';
            } else {
                return 'HomeController';
            }
        },

        throttle: function(func, wait, options) {
            var context, args, result;
            var timeout = null;
            var previous = 0;
            if (!options) options = {};
            var later = function() {
                previous = options.leading === false ? 0 : Date.now();
                timeout = null;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            };
            return function() {
                var now = Date.now();
                if (!previous && options.leading === false) previous = now;
                var remaining = wait - (now - previous);
                context = this;
                args = arguments;
                if (remaining <= 0 || remaining > wait) {
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }
                    previous = now;
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                } else if (!timeout && options.trailing !== false) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        },
    };
}]);