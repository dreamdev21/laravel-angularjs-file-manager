'use strict';

angular.module('pixie.dashboard')

.directive('upgradeModal', ['$rootScope', '$http', 'utils', 'users', function($rootScope, $http, utils, users) {
    return {
        restrict: 'E',
        templateUrl: 'assets/views/directives/upgrade.html',
        replace: true,
        scope: {},
        link: function($scope, el) {
            $scope.loading = true;
            $scope.freePlanSpace = utils.formatFileSize(utils.getSetting('maxUserSpace'));
            $scope.cardDetails = {};
            $scope.months = [1,2,3,4,5,6,7,8,9,10,11,12];
            $scope.years  = [];
            $scope.addingNewCard = false;
            $scope.currentUserPlan = users.current.stripe_plan;
            $scope.onGracePeriod   = $scope.currentUserPlan && ! users.current.stripe_active;

            var current = new Date().getFullYear();
            for (var i = current; i < current+15; i++) {
                $scope.years.push(i);
            }

            setTimeout(function() {
                $('.upgrade').on('click', function() {
                    el.fadeIn(300).css('display','flex');
                    initUpgradeModal($scope, el);
                });
            });

            $scope.unsubscribe = function() {
               utils.confirm({
                   title: 'cancelSub',
                   content: 'cancelSubConfirm',
                   ok: 'unsubscribe',
                   onConfirm: function() {
                       $scope.loading = true;
                       $http.post('payments/unsubscribe').success(function(data) {
                           $scope.loading = false;
                           $scope.selectedPlan = false;
                           $scope.onGracePeriod = true;
                           users.assignCurrentUser(data);
                           utils.showToast('unsubSuccess', true);
                           updateInfoMessages($scope);
                       });
                   }
               });
            };
            
            $scope.showNewCardForm = function() {
                $scope.addingNewCard = true;
            };

            $scope.hideNewCardForm = function() {
                $scope.addingNewCard = false;
                el.find('.errors').text('');
            };

            $scope.addNewCard = function() {
                $scope.loading = true;

                Stripe.card.createToken($scope.cardDetails, function(status, response) {
                    handleStripeResponse(status, response, $scope, el);
                });
            };

            $scope.resumePlan = function(plan) {
                $scope.loading = true;

                $http.post('payments/resume', {plan: plan.id}).success(function(data) {
                    $scope.currentUserPlan = plan.id;
                    $scope.onGracePeriod   = false;
                    users.assignCurrentUser(data);
                    updateInfoMessages($scope);
                    utils.showToast('subResumeSuccess', true);
                }).finally(function() {
                    $scope.loading = false;
                })
            };

            $scope.closeModal = function() {
                el.fadeOut(300);
                $scope.addingNewCard = false;
                $scope.cardDetails = {};
                el.find('.errors').text('');
            };

            $scope.selectPlan = function(plan) {
                if ($scope.currentUserPlan && $scope.currentUserPlan !== plan.id) {
                    $scope.loading = true;

                    $http.post('payments/swap-plan', {plan: plan.id}).success(function(data) {
                        $scope.loading = false;
                        $scope.currentUserPlan = plan.id;
                        utils.showToast(data);
                    })
                } else {
                    el.find('.selected').removeClass('selected');
                    $scope.selectedPlan = plan ? plan.id : false;
                }
            };

            $scope.submitDisabled = function() {
                return !$scope.cardDetails.exp_month || !$scope.cardDetails.exp_year ||
                       !$scope.cardDetails.number || !$scope.cardDetails.cvc;
            };
        }
    };

    function getPlanPrice(plan, $scope) {
        if ($scope.plans) {
            for (var i = 0; i < $scope.plans.length; i++) {
                if ($scope.plans[i].id == plan) {
                    return $scope.plans[i].amount+' '+$scope.plans[i].currency;
                }
            }
        }
    }

    /**
     * Initiate upgrade modal if not already initiated.
     *
     * @param {object} $scope
     * @param {object} el
     */
    function initUpgradeModal($scope, el) {
        if ( ! $scope.inited) {
            $scope.loading = true;

            $http.get('payments/plans').success(function(data) {
                $scope.plans = data;
                $scope.loading = false;

                updateInfoMessages($scope);
                $scope.loading = false;
            });

            $.getScript('https://js.stripe.com/v2/').success(function() {
                Stripe.setPublishableKey(utils.getSetting('stripePubKey'));

                el.on('submit', function() {
                    $scope.loading = true;
                    Stripe.card.createToken($scope.cardDetails, function(status, response) {
                        handleStripeResponse(status, response, $scope, el, $rootScope);
                    });
                });
            });

            $scope.inited = true;
        }
    }

    /**
     * Update subscription information messages for current user.
     *
     * @param $scope
     */
    function updateInfoMessages($scope) {
        $scope.gracePeriodMsg  = utils.trustHtml(utils.trans('onGracePeriodExpl', {date: moment.utc(users.current.subscription_ends_at).format("dddd, MMMM Do YYYY, h:mm:ss a")}));
        $scope.subscribedMsg = utils.trustHtml(utils.trans('subscribedExpl', {plan: $scope.currentUserPlan, lastFour: users.current.last_four, amount: getPlanPrice(users.current.stripe_plan, $scope) }));
    }

    /**
     * Callback for stripe create card method.
     *
     * @param {int} status
     * @param {object} response
     * @param {object} $scope
     * @param {object} el
     */
    function handleStripeResponse(status, response, $scope, el) {
        if (response.error) {
            el.find('.errors').text(response.error.message);
            $scope.$apply(function() {
                $scope.loading = false;
            });
        } else {
            if ($scope.addingNewCard) {
                addNewCard($scope, response.id);
            } else {
                subscribe($scope, response.id, $rootScope);
            }
        }
    }

    /**
     * Subscribe user to selected plan.
     *
     * @param {object} $scope
     * @param {string} token
     */
    function subscribe($scope, token) {
        $http.post('payments/upgrade', {stripe_token: token, plan: $scope.selectedPlan}).success(function(data) {
            utils.showToast(data);
            $scope.closeModal();
            $rootScope.$emit('user.subscribed');
        }).finally(function() {
            $scope.loading = false;
        })
    }

    /**
     * Add new credit card to current user.
     *
     * @param {object} $scope
     * @param {string} token
     */
    function addNewCard($scope, token) {
        $http.post('payments/add-new-card', {stripe_token: token}).success(function(data) {
            utils.showToast(data);
            $scope.closeModal();
        }).finally(function() {
            $scope.loading = false;
        })
    }
}]);