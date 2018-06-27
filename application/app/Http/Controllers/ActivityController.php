<?php namespace App\Http\Controllers;

use Auth;
use Input;
use Exception;
use App\Activity;
use App\Http\Requests;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;

class ActivityController extends Controller {

	public function __construct()
    {
        $this->middleware('loggedIn');
    }

    /**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
        $collection = Auth::user()->activity()->orderBy('created_at', 'desc')->limit(50)->get();

        $activity = [];

        foreach($collection as $item) {
            $activity[] = json_decode($item->content, true);
        }

        return $activity;
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
        try {
            $content = json_encode(Input::get('content'));
        } catch(Exception $e) {
            $content = false;
        }

        if ( ! $content) return response('', 422);

        return Auth::user()->activity()->create(['content' => $content]);
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		//
	}

}
