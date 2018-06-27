angular.module('installer', ['ui.router', 'ngMaterial', 'ngAnimate'])

.config(['$mdThemingProvider', '$stateProvider', '$urlRouterProvider', function($mdThemingProvider, $stateProvider, $urlRouterProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('deep-orange')
        .accentPalette('brown');

	$urlRouterProvider.otherwise("/");

	$stateProvider
		.state('compatability', {
			url: '/',
			templateUrl: 'assets/views/install/compatability.html',
		})
		.state('database', {
			url: '/database',
			templateUrl: 'assets/views/install/database.html',
		})
		.state('admin', {
			url: '/admin',
			templateUrl: 'assets/views/install/admin.html',
		})
}])

.run(function($rootScope, $state) {
	$rootScope.$on('$stateChangeStart', function(e, toState) {
		if ($rootScope.currentStep !== toState.name) {
			e.preventDefault();
			$state.go('compatability');
		}
	})
})

.controller('InstallController', ['$scope', '$rootScope', '$http', '$state', function($scope, $rootScope, $http, $state) {

	$scope.enableNextStep = false;

	$rootScope.currentStep = 'compatability';

	$scope.steps = ['compatability', 'database', 'admin'];

	$scope.dbDetails = {
		host: 'localhost',
		database: 'BeDrive',
		username: 'root',
		password: '',
		prefix: '',
		alreadyFilled: false
	};

	$scope.admin = {};

	$scope.error = '';

	$scope.nextStep = function() {
		for (var i = 0; i < $scope.steps.length; i++) {
			if ($scope.steps[i] === $scope.currentStep) {
				$rootScope.currentStep = $scope.steps[i+1];
				$state.go($scope.steps[i+1]);
				break;
			}
		};
	};

	$scope.checkCompat = function() {
		$http.post('check-compat').success(function(data) {
			$scope.compatResults = data;
			
			if ( ! $scope.compatResults.problem) {
				$scope.enableNextStep = true;
			}
		})
	};

	$scope.createDb = function() {
		$('#loader').show();

		$http.post('create-db', $scope.dbDetails).success(function(data) {
			$scope.error = '';
			$scope.nextStep();
		}).error(function(data) {
			$scope.error = data;
		}).finally(function() {
			$('#loader').hide();
		});
	};

	$scope.createAdmin = function() {
		$('#loader').show();

		$http.post('create-admin', $scope.admin).success(function(data) {
			$scope.error = '';
			location.replace(location.origin);
		}).error(function(data) {
			$scope.error = data;
		}).finally(function() {
			$('#loader').hide();
		});
	}
}]);