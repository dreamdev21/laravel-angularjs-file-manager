<?php namespace App\Http\Controllers;

use Carbon\Carbon;
use Auth, Lang, App;

class HomeController extends Controller {

	public function index()
	{
        $settings = App::make('Settings');
        $pushStateRootUrl = '/';

        if ($settings->get('enablePushState') && substr_count(url(), '/') > 2) {
            $pushStateRootUrl .= substr(url(), strrpos(url(), '/') + 1) . '/';
        }

        return view('main')->with('user', Auth::user())
                           ->with('baseUrl', url())
                           ->with('translations', json_encode(Lang::get('app')))
                           ->with('settings', $settings)
                           ->with('pushStateRootUrl', $pushStateRootUrl)
                           ->with('isDemo', IS_DEMO)
                           ->with('version', VERSION);
    }
}
