<?php namespace App\Http\Middleware;

use Closure, Auth, App;

class SpaceUsage {

    public function handle($request, Closure $next)
    {
        $usage = App::make('App\Services\SpaceUsage');

        if (Auth::check() && $usage->userIsOutOfSpace()) {
            return response(trans('app.noSpaceLeft'), 403);
        }

        return $next($request);
    }
}