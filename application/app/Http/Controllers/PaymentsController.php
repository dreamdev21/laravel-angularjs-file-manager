<?php namespace App\Http\Controllers;

use App;
use Auth;
use Input;
use Stripe\Stripe;
use Stripe\Plan;

class PaymentsController extends Controller {

    public function __construct() {
        $this->middleware('loggedIn');
        $this->middleware('paymentsEnabled');

        $this->user = Auth::user();
        $this->settings = App::make('App\Services\Settings');

        Stripe::setApiKey(env('STRIPE_SECRET_KEY'));
    }

    /**
     * Subscribe user to a plan or swap him to a different plan.
     *
     * @return response
     */
    public function upgrade() {
        if ($this->user->subscribed()) {
            $this->user->subscription(Input::get('plan'))->swap();
        } else {
            $this->user->subscription(Input::get('plan'))->create(Input::get('stripe_token'), ['email' => $this->user->email]);
        }

        return response(trans('app.upgradeSuccess'), 200);
    }

    /**
     * Swap current users plan to a new one.
     *
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     */
    public function swapPlan() {
        if ($this->user->subscribed() && Input::get('plan')) {
            $this->user->subscription(Input::get('plan'))->swap();

            return response(trans('app.planSwapSuccess', ['plan' => Input::get('plan')]), 200);
        }
    }

    /**
     * Attach new credit card to user.
     *
     * @return \Illuminate\Contracts\Routing\ResponseFactory|\Symfony\Component\HttpFoundation\Response
     */
    public function addNewCard() {
        $this->user->updateCard(Input::get('stripe_token'));

        return response(trans('app.cardAddSuccess'), 200);
    }

    /**
     * Resume a canceled subscription.
     */
    public function resumeSubscription() {
        $this->user->subscription(Input::get('plan'))->resume(Input::get('token'));

        return $this->user;
    }

    /**
     * Cancel users subscription.
     *
     * @return \App\User
     */
    public function unsubscribe() {
        $this->user->subscription()->cancel();

        return $this->user;
    }

    /**
     * Return current users invoices.
     *
     * @return array
     */
    public function getInvoices() {
        return view('invoices')->with('invoices', $this->user->invoices())->with('settings', $this->settings);
    }

    /**
     * Download invoice with given id.
     *
     * @param {int|string} $id
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function downloadInvoice($id) {
        return $this->user->downloadInvoice($id, [
            'vendor'  => $this->settings->get('invoiceVendor'),
            'product' => $this->settings->get('invoiceProduct'),
        ]);
    }

    /**
     * Return all created plans.
     *
     * @return array
     */
    public function getPlans() {
        $plans     = Plan::all();
        $formatted = [];

        foreach($plans->data as $plan) {
            $formatted[] = [
                'interval' => $plan['interval'],
                'name' => $plan['name'],
                'amount' => $plan['amount'] / 100,
                'currency' => $plan['currency'],
                'id' => $plan['id'],
                'created' => $plan['created'],
            ];
        }

        usort($formatted, function($a1, $a2) {
            if ($a1['created'] == $a2['created']) return 0;
            return ($a1['created'] < $a2['created']) ? -1 : 1;
        });

        return $formatted;
    }
}
