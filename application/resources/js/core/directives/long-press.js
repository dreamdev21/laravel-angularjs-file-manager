angular.module('app').directive('longPress', function() {
    return {
        restrict: 'A',
        link: function ($scope, el, attrs) {
			var hammer = new Hammer(el[0]);
			hammer.on('press', function() {
			  	$scope.$eval(attrs.longPress);
			});
    	}
    }
});