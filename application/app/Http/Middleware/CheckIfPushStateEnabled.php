<?php namespace App\Http\Middleware;

use App;
use Route;
use Closure;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as BaseVerifier;

class CheckIfPushStateEnabled extends BaseVerifier {

	/**
	 * Handle an incoming request.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  \Closure  $next
	 * @return mixed
	 */
	public function handle($request, Closure $next)
	{
		if (App::make('Settings')->get('enablePushState')) {

            //if html5 push state is enabled catch all urls and redirect to home controller
            //TODO Make sure route is registered with angular before redirecting home
            Route::group(['middleware' => 'prerender'], function () {
				Route::get('view/{type}/{share_id}/{name}', 'App\Http\Controllers\HomeController@index');
			});

            Route::any('{all}', 'App\Http\Controllers\HomeController@index')->where('all', '.*');
		}

        return $next($request);
	}

}
