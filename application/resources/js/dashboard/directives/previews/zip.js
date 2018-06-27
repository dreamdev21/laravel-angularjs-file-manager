angular.module('pixie.dashboard')

.directive('zipPreview', ['$http', '$compile', '$templateRequest', function($http, $compile, $templateRequest) {
    return {
        restrict: 'E',
        scope: {},
        link: function($scope, el) {
            var loader = $('.preview-loader').css('display', 'flex');

            $.getScript('assets/js/jszip.min.js').success(function() {
                $http.get($scope.$parent.preview.current.absoluteUrl, {responseType: 'arraybuffer'}).success(function(zipArrayBuffer) {
                    $templateRequest('assets/views/directives/file-tree.html').then(function(data) {
                        initFileTree($scope, zipArrayBuffer);
                        el.html($compile(data)($scope));
                        loader.hide();
                    });
                });
            })
        }
    };

     function initFileTree($scope, data) {
         var zip = new JSZip(data);
         var tree = {};

         $.each(zip.files, function(name) {
             buildTree(tree, name);
         });

         $scope.tree = tree;
         $scope.folder = tree;
         $scope.name = $scope.$parent.preview.current.name;
         $scope.folderLength = getNumberOfItemsInFolder($scope.folder);

         $scope.oneFolderUp  = function() {
             if ($scope.folder._parent && $scope.folder._parent !== 'root') {
                 var response  = getDescendantProp($scope.tree, $scope.folder._parent);
                 $scope.folder = response.obj;
                 $scope.name   = response.name;
             } else {
                 $scope.folder = tree;
                 $scope.name   = $scope.$parent.preview.current.name;
             }

             $scope.folderLength = getNumberOfItemsInFolder($scope.folder);
         };

         $scope.changeFolder = function(name, folder) {
             $scope.folder = folder;
             $scope.name = name;
             $scope.folderLength = getNumberOfItemsInFolder($scope.folder);
         };
     }

    /**
     * Return given objects child object and it's key
     * from given string (child1.child2.child3)
     *
     * @param {object} obj
     * @param {string} desc child objects "path"
     *
     * @returns {object}
     */
    function getDescendantProp(obj, desc) {
        var arr = desc.split('.');

        while(arr.length) {
            name = arr.shift();
            obj = obj[name];
        }

        return {
            name: name,
            obj: obj
        }
    }

    /**
     * Builder a tree object from given file path strings for easy looping
     *
     * @param {object} tree
     * @param {string} path 'path/to/folder/or/file.txt'
     */
    function buildTree(tree, path) {
        var lastDir,
            parts = path.split('/'),
            parent = '';

        parts.forEach(function(part) {
            var name = part.trim();

            if ( ! name) return;

            //it's a folder
            if (name.indexOf('.') === -1) {

                //first part of path, create folder
                if (! lastDir && ! tree[name]) {
                    lastDir = tree[name] = {
                        _files: [],
                        _parent: 'root'
                    };

                    parent += name+'.';

                //folder already created, bail
                } else if ( ! lastDir) {
                    lastDir = tree[name];
                    parent += name+'.';
                    return;

                //subsequent parts of path, create folder
                } else if (lastDir && ! lastDir[name]) {
                    lastDir = lastDir[name] = {
                        _files: [],
                        _parent: parent.replace(/\.\s*$/, '')
                    };

                //subsequent parts of path, folder already created, bail
                } else {
                    parent += name+'.';
                    lastDir = lastDir[name];
                }

            //it's a file
            } else {
                if ( ! lastDir) {
                    if ( ! tree._files) tree._files = [];
                    tree._files.push(name);
                } else {
                    lastDir._files.push(name);
                }
            }
        });
    }

    function getNumberOfItemsInFolder(obj) {
        var length = 0, key;

        for (key in obj) {
            if (obj.hasOwnProperty(key) && key.charAt(0) !== '_') length++;
        }

        if (obj._files) {
            length += obj._files.length;
        }

        return length;
    }
}]);