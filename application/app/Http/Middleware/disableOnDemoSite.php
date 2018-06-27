<?php namespace App\Http\Middleware;

use Closure;

class DisableOnDemoSite {

    public function handle($request, Closure $next)
    {
        if (IS_DEMO) {
            return response(trans('app.noDemoPermissions'), 403);
        }

        return $next($request);
    }
}