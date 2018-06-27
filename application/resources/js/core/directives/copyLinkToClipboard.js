'use strict';

angular.module('app')

.directive('copyLinkToClipboard', ['$translate', 'utils', function($translate, utils) {
    return {
        restrict: 'A',
        link: function($scope, el) {
            var message = $('<div class="copy-success-message" style="">'+$translate.instant('copiedLink')+'</div>').css({
                top: -el.height(),
                left: -100
            });

            el.on('click', function (e) {
                var input =  $('#share-modal-input');

                if (input[0]) {
                    input.focus()[0].select();

                    try {
                        var copied = document.execCommand('copy');
                    } catch(err) {
                        var copied = false;
                    }

                    message.css('top', -el.height()-15);
                } else {
                    var item = $scope.preview.current,
                        link = $scope.baseUrl+(! utils.getSetting('enablePushState') ? '#/' : '')+'view/'+item.type+'/'+item.share_id + '/' + item.name;
                        	
                    var node = document.createElement('input'); node.value = link;
                    document.body.appendChild(node);
                    node.select();
                    var copied = document.execCommand('copy');
                    document.body.removeChild(node);
                }

                if ( ! copied) {
                    message.text($translate.instant('copyNotSupported'));
                    console.log(message);
                }

                el.after(message);

                setTimeout(function() {
                    message.fadeOut(400, function() {
                        message.remove();
                        message.css('display', 'block');
                    });
                }, 800);
            });
        }
    }
}]);