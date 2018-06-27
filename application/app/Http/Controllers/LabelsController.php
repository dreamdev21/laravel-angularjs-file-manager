<?php namespace App\Http\Controllers;

use App\Label;
use Input, Auth, Exception;
use App\Http\Controllers\Controller;

class LabelsController extends Controller {

    public function __construct()
    {
        $this->middleware('loggedIn');
    }

    /**
     * Get items user has added given label to.
     *
     * @param  string $label
     * @return Collection
     */
    public function getItemsLabeled($label) {
        $files = Auth::user()->files()->whereHas('labels', function($q) use($label) {
            $q->where('name', $label);
        })->get();

        $folders = Auth::user()->folders()->whereHas('labels', function($q) use($label) {
            $q->where('name', $label);
        })->get();

        return $files->merge($folders);
    }

    /**
     * Attach label to a photo.
     *
     * @return Response
     */
    public function attach()
    {
        $label = Label::where('name', Input::get('label'))->firstOrFail();

        $items = $this->splitFilesAndFolders();

        if (count($items['files'])) {
            $label->files()->attach($items['files']);
        }

        if (count($items['folders'])) {
            $label->folders()->attach($items['folders']);
        }

        return response()->json(trans('app.'.Input::get('label').'Success'));
    }

    /**
     * Detach label from photo.
     *
     * @return Response
     */
    public function detach()
    {
        $label = Label::where('name', Input::get('label'))->firstOrFail();

        $items = $this->splitFilesAndFolders();

        if (count($items['files'])) {
            $label->files()->detach($items['files']);
        }

        if (count($items['folders'])) {
            $label->folders()->detach($items['folders']);
        }

        return response()->json(trans('app.'.Input::get('label').'DetachSuccess'));
    }
}