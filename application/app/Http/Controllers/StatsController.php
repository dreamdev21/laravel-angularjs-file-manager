<?php namespace App\Http\Controllers;

use DB;

class StatsController extends Controller {

    public function __construct()
    {
        $this->middleware('loggedIn');

        if ( ! IS_DEMO) {
            $this->middleware('admin');
        }
    }

    /**
     * Return site stats for analytics page.
     *
     * @return array
     */
    public function analytics()
	{
        $stats = [];

        $stats['users']  = DB::table('users')->count();
        $stats['files'] = DB::table('files')->count();
        $stats['files_size'] = abs(DB::table('files')->sum('file_size'));

        return $stats;
	}
}
