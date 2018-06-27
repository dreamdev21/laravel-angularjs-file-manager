<?php namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel {

	/**
	 * The application's global HTTP middleware stack.
	 *
	 * @var array
	 */
	protected $middleware = [
		'Illuminate\Foundation\Http\Middleware\CheckForMaintenanceMode',
		'Illuminate\Cookie\Middleware\EncryptCookies',
		'Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse',
		'Illuminate\Session\Middleware\StartSession',
		'Illuminate\View\Middleware\ShareErrorsFromSession',
		'App\Http\Middleware\VerifyCsrfToken',
		'App\Http\Middleware\CheckIfPushStateEnabled',
	];

	/**
	 * The application's route middleware.
	 *
	 * @var array
	 */
	protected $routeMiddleware = [
		'auth' => 'App\Http\Middleware\Authenticate',
		'auth.basic' => 'Illuminate\Auth\Middleware\AuthenticateWithBasicAuth',
		'guest' => 'App\Http\Middleware\RedirectIfAuthenticated',
        'admin' => 'App\Http\Middleware\isAdmin',
        'loggedIn' => 'App\Http\Middleware\isLoggedIn',
        'prerender' => 'App\Http\Middleware\PrerenderIfCrawler',
        'spaceUsage' => 'App\Http\Middleware\SpaceUsage',
        'paymentsEnabled' => 'App\Http\Middleware\PaymentsEnabled',
        'disableOnDemoSite' => 'App\Http\Middleware\DisableOnDemoSite',
	];
}
