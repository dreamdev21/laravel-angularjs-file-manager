'use strict';

angular.module('app').controller('UploadController', ['$rootScope', '$scope', '$translate', '$upload', '$state', 'folders', 'files', 'activity', 'utils', 'users', 'localStorage', function($rootScope, $scope, $translate, $upload, $state, folders, files, activity, utils, users, localStorage) {

    var fileTooBig = utils.trans('fileTooBig', {number: utils.getSetting('maxFileSize')}),
        invalidExtension = utils.trans('invalidExtension');

    //files that are currently being uploaded or have
    //already been upload or rejected during this session
    $scope.uploadHistory = [];

    //number of files that are currently being uploaded
    $scope.uploadsInProgress = 0;

    $scope.whitelist = getWhitelist();
    $scope.blacklist = getBlacklist();
    $scope.maxFileSize = utils.getSetting('maxFileSize');

    //array of uploaded files models
    $scope.uploadedFiles = [];

    $scope.selectedFile = {};

    $scope.assignSelectedFile = function(file) {
        $scope.selectedFile = file;
    };

    $scope.upload = function (files) {
      
        //if uploading from homepage is disabled and user is trying to upload from home we'll bail
        if ( ! utils.getSetting('enableHomeUpload') && ! users.current) {
            return utils.showToast('loginToUpload', true);
        }

        //reset previous upload history in case there is any
        $scope.uploadsInProgress = 0;
        $scope.uploadHistory = [];
        $scope.uploadedFiles = [];

        //if there are no files bail
        if ( ! files || ! files.length) return;

        files = filterOutInvalidFiles(files);

        $rootScope.$emit('upload.started');

        //make sure user is not trying to upload
        //more files at the same time then allowed
        files = filterSimultUploads(files);

        $scope.uploadsInProgress = files.length;

        for (var i = 0; i < files.length; i++) {
            var file = files[i];

            //push the file we're currently uploading into
            //upload history and get it's index in the array
            var index = $scope.uploadHistory.push(file) - 1;

            sendRequest(file, $scope.uploadHistory[index]);
        }
    };

    /**
     * Remove files that don't pass validation from given array.
     *
     * @param {array} files
     * @returns {array}
     */
    function filterOutInvalidFiles(files) {
        if ( ! files || ! files.length) return [];

        return files.filter(function(file) {

            //filter out any directories if uploading a folder
            if (file.type === 'directory') {
                return false;
            }

            //filter out any invalid files so we don't send them
            //to server, but add them to upload history as rejected
            else if (fileNotValid(file)) {
                file.uploaded = true;
                file.rejected = true;
                $scope.uploadHistory.push(file);

                return false;
            }

            return true;
        });
    }

    /**
     * Check if file extension and size are valid.
     *
     * @param {object} file
     * @returns {boolean}
     */
    function fileNotValid(file) {
        var extensionNotValid = extensionInvalid(file);

        //turn max file size from mb to byes and compare to given file size
        var sizeNotValid = (parseInt($scope.maxFileSize) * 1000000) <= file.size;

        if (extensionNotValid) {
            file.rejectReason = invalidExtension;
        }

        if (sizeNotValid) {
            file.rejectReason = fileTooBig;
        }

        return extensionNotValid || sizeNotValid;
    }

    /**
     * Check if given file upload extension is not valid.
     *
     * @param {object} file
     * @returns {boolean}
     */
    function extensionInvalid(file) {
        var mimeExt = file.type.split('/')[1];
        var nameExt = utils.extractExtension(file.name);

        if ($scope.whitelist) {
            if ($scope.whitelist.indexOf(mimeExt) === -1) return true;
            if (nameExt && $scope.whitelist.indexOf(nameExt) === -1) return true;
        }

        if ($scope.blacklist) {
            if ($scope.blacklist.indexOf(mimeExt) > -1) return true;
            if (nameExt && $scope.blacklist.indexOf(nameExt) > -1) return true;
        }
    }

    /**
     * If user is trying to upload more files at the same time then limit
     * we'll slice the give files array until the limit.
     *
     * @param {array} files
     * @returns {array}
     */
    function filterSimultUploads(files) {
        var maxUploads = utils.getSetting('maxSimultUploads');

        if (files.length > maxUploads) {
            utils.showToast(utils.trans('maxSimultUploadsWarning', { number:  maxUploads}));

            files.splice(0, files.length - maxUploads);
        }

        return files;
    }

    function getUploadFields() {

        //no user is logged in, means we're uploading from homepage
        if ( ! users.current) {
            var rand = utils.randomString();

            //store the random string we've generated in localStorage so we can
            //later attach these uploads to user if he registers or logs in
            localStorage.set('attachIds', rand, true);

            return { attach_id: rand }
        } else {
            return { folder: folders.selected.id };
        }
    }

    function sendRequest(file, historyItem) {
        $upload.upload({
            url: $scope.baseUrl + 'files',
            file: file,
            fields: getUploadFields()
        }).progress(function (evt) {
            historyItem.percentageUploaded = parseInt(100.0 * evt.loaded / evt.total);
            historyItem.bytesUploaded      = utils.formatFileSize(evt.loaded);
        }).success(function (data) {
            $scope.uploadedFiles = $scope.uploadedFiles.concat(data.uploaded);

            //if we are not in dashboard just fire an event and bail
            if ( ! $state.includes('dashboard')) {
                $scope.selectedFile = $scope.uploadedFiles[0];
                return $rootScope.$emit('photos.uploaded', data);
            }

            if (data.uploaded && data.uploaded.length) {
                folders.selected.files = folders.selected.files.concat(data.uploaded);
                historyItem.id = data.uploaded[0].id;
            }

            if (data.rejected && data.rejected.length) {
                historyItem.uploaded = true;
                historyItem.rejected = true;
            }
        }).error(function(data) {
            historyItem.rejected = true;

            if (angular.isString(data) && data.length < 300) {
                utils.showToast(data);
            }
        }).finally(function() {
            historyItem.uploaded = true;
            $scope.uploadsInProgress -= 1;

            if ($scope.uploadsInProgress === 0 && users.current) {
                $scope.uploadHistory.filter(function(f) { return !f.rejected; });

                if ($scope.uploadedFiles.length) {
                    $rootScope.$emit('activity.happened', 'uploaded', 'files', $scope.uploadedFiles.slice());
                }
            }
        });
    }

    function getWhitelist() {
        var wl = utils.getSetting('whitelist');

        if (wl && angular.isString(wl)) {
            return wl.replace(/ /g,'').split(',');
        }
    }

    function getBlacklist() {
        var bl = utils.getSetting('blacklist');

        if (bl && angular.isString(bl)) {
            return bl.replace(/ /g,'').split(',');
        }
    }
}])

.directive('edUploadPanelVisibility', ['$rootScope', function($rootScope) {
    return {
        restrict: 'A',
        link: function ($scope, el) {

            el.find('.close-panel').on('click', function() {
                $scope.$apply(function() {
                    el.removeClass('open');
                    $scope.uploadHistory = [];
                    $scope.uploadedFiles = [];
                    $scope.selectedFile = {};
                })
            });

            $rootScope.$on('upload.started', function() {
                el.addClass('open');
            })
        }
    };
}]);



