<?php namespace App\Http\Middleware;

use Closure, App;

class paymentsEnabled {

    public function handle($request, Closure $next)
    {
        if ( ! App::make('App\Services\Settings')->get('enablePayments')) {
           abort(404);
        }

        return $next($request);
    }
}