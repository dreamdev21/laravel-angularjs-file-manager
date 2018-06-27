<?php namespace App\Http\Controllers;

use App\Photo;
use Auth, Input;
use App\Http\Requests;
use App\Services\Photo\Deleter;

class DeleteItemsController extends Controller {

    public function __construct(Deleter $deleter)
    {
        $this->middleware('loggedIn');

        $this->deleter = $deleter;
    }

    /**
     * Permanently delete given photos and folders.
     *
     * @return int
     */
    public function delete()
    {
        $items = Input::get('items');

        if ( ! $items && ! count($items)) return 0;

        return $this->deleter->delete($items);
    }

}
