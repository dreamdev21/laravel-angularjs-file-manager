angular.module('app')

.directive('edLoginRegisterValidator', function() {
    return {
        restrict: 'A',
        link: function($scope, el) {
            var form = $('form');

            $scope.$watch('errors', function(newErrors, oldErrors) {
                if ( ! newErrors) return;

                //remove old errors
                $('.form-error').remove();

                $.each(newErrors, function(field, message) {

                    //if there's no field name append error as alert before the first input field
                    if (field == '*') {
                        el.find('.alert').show().addClass('animated shake').find('.message').text(message);
                    } else {
                        var field = $('[name="'+field+'"]');

                        $('<span class="form-error help-block">'+message+'</span>').appendTo('#login-page').css({
                            top: field.offset().top - 4,
                            left: field.offset().left + field.outerWidth()
                        }).addClass('animated flipInX');
                    }
                });
            });
        }
    };
});