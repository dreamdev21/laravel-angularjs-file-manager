<?php namespace App\Http\Controllers;

use App;
use Auth, Input;
use App\Http\Requests;
use App\Services\Photo\Deleter;

class TrashController extends Controller {

    public function __construct(Deleter $deleter)
    {
        $this->middleware('loggedIn');

        $this->deleter = $deleter;
    }

    /**
     * Return currently logged in users trashed photos.
     *
     * @return Collection
     */
    public function getUserTrash()
    {
        $folders = Auth::user()->folders()->onlyTrashed()->get();
        $files   = Auth::user()->files()->onlyTrashed()->get();

        return $files->merge($folders);
    }

    /**
     * Move files or folders to trash.
     *
     * @return int
     */
    public function put() {
        $items   = Input::get('items');
        $folders = [];
        $files   = [];

        foreach($items as $item) {
            if ($item['type'] === 'folder') {
                $folders[] = $item['id'];
            } else {
                $files[] = $item['id'];
            }
        }

        if (count($folders)) {
            Auth::user()->folders()->whereIn('id', $folders)->delete();
        }

        if (count($files)) {
            Auth::user()->files()->whereIn('id', $files)->delete();
        }

        return count($folders)+count($files);
    }

    /**
     * Restore photo with given id from trash.
     *
     * @return int
     */
    public function restore() {
        $items   = Input::get('items');
        $folders = [];
        $files   = [];

        foreach($items as $item) {
            if ($item['type'] === 'folder') {
                $folders[] = $item['id'];
            } else {
                $files[] = $item['id'];
            }
        }

        if (count($folders)) {
            Auth::user()->folders()->onlyTrashed()->whereIn('id', $folders)->restore();
        }

        if (count($files)) {
            Auth::user()->files()->onlyTrashed()->whereIn('id', $files)->restore();
        }

        return count($folders)+count($files);
    }
}
