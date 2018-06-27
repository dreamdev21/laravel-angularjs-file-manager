'use strict';

angular.module('pixie.dashboard').factory('fileTypes', ['utils', function(utils) {
    return {
        archive: ['zip', 'x-rar', 'x-rar-compressed', 'x-7z-compressed', 'x-ace-compressed', 'x-zoo', 'x-gtar', 'x-stuffit', 'x-apple-diskimage',
            'x-dgc-compressed', 'x-dar', 'vnd.android.package-archive', 'x-astrotite-afa', 'x-b1', 'x-arj', 'vnd.ms-cab-compressed'
        ],

        isArchive: function(mime) {
            var type = mime.split('/')[0],
                subtype = mime.split('/')[1];

            if (type !== 'application') return false;

            return this.archive.indexOf(subtype) > -1;
        },

        isImage: function(mime) {
            return mime && mime.indexOf('image') === 0;
        },

        /**
         * return icon name that represents given mime type.
         *
         * @param {string} mime
         * @return {string}
         */
        getMimeIcon: function(mime) {
            if ( ! mime || mime === 'folder') return 'folder';

            switch(mime.split('/')[0]) {
                case 'audio':
                    return 'headphones';
                case 'text':
                    return 'doc-text';
                case 'video':
                    return 'video';
                case 'image':
                    return 'file-image';
                case 'application':
                    var type = mime.split('/')[1];

                    if (type === 'ogg') {
                        return 'video';
                    }

                    if (type === 'pdf') {
                        return 'file-pdf';
                    }

                    if (this.isArchive(mime)) {
                        return 'file-archive';
                    }

                    return 'doc-inv';
                default:
                    return 'doc-inv';
            }
        }
    }
}]);