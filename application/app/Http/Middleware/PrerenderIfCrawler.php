<?php namespace App\Http\Middleware;

use App;
use Closure;
use Illuminate\Http\Request;

class PrerenderIfCrawler  {

    private $userAgents = [
        'baiduspider',
        'facebookexternalhit',
        'twitterbot',
        'rogerbot',
        'linkedinbot',
        'embedly',
        'quora link preview',
        'showyoubot',
        'outbrain',
        'pinterest',
        'developers.google.com/+/web/snippet'
    ];

    /**
	 * Handle an incoming request.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  \Closure  $next
	 * @return mixed
	 */
	public function handle($request, Closure $next)
	{
        if ($this->shouldPrerender($request)) {

            $model = $this->getShareableModel($request);

            return view('view-for-crawlers')->with('model', $model)->with('settings', App::make('Settings'));
        }

        return $next($request);
	}

    /**
     * Fetch shareable model from db based on route params.
     *
     * @param Request $request
     * @return App\Folder | App\File
     */
    private function getShareableModel(Request $request)
    {
        list($route, $type, $share_id, $name) = $request->segments();

        $type = strtolower($type);
        $className = 'App\\'.ucfirst($type);

        return App::make($className)->where('share_id', $share_id)->where('name', urldecode($name))->firstOrFail();
    }

    /**
     * Returns whether the request must be prerendered server side for crawler.
     *
     * @param Request $request
     * @return bool
     */
    private function shouldPrerender(Request $request)
    {
        $userAgent   = strtolower($request->server->get('HTTP_USER_AGENT'));
        $bufferAgent = $request->server->get('X-BUFFERBOT');

        $shouldPrerender = false;

        if (!$userAgent) return false;

        if (!$request->isMethod('GET')) return false;

        //google bot
        if ($request->query->has('_escaped_fragment_')) $shouldPrerender = true;

        //other crawlers
        foreach ($this->userAgents as $crawlerUserAgent) {
            if (str_contains($userAgent, strtolower($crawlerUserAgent))) {
                $shouldPrerender = true;
            }
        }

        if ($bufferAgent) $shouldPrerender = true;

        if (!$shouldPrerender) return false;

        return true;
    }

}
