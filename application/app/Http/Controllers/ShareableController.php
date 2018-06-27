<?php namespace App\Http\Controllers;

use Input, Hash, App;
use Illuminate\Http\Request;

class ShareableController extends Controller {

    /**
     * Create new ShareablePasswordController instance.
     *
     * @param Request $request
     */
    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->middleware('loggedIn', ['except' => ['checkPassword', 'show']]);
    }

    /**
     * Return model of shareable matching given input.
     *
     * @return mixed
     */
    public function show()
    {
        $model = $this->getModel();

        //throw 404 page if no name is provided in the url
        if ( ! Input::get('name')) {
            abort(404);
        }

        return $model->where('share_id', Input::get('id'))->firstOrFail();
    }

    /**
     * Add a password to passed in shareable (folder or photo)
     *
     * return Response
     */
    public function addPassword()
    {
        $this->validate($this->request, [
            'password' => 'required|max:255',
        ]);

        $shareable = $this->getModel()->findOrFail(Input::get('id'));

        $shareable->password = Hash::make(Input::get('password'));
        $shareable->save();

        return response(trans('app.passwordAddSuccess'));
    }

    /**
     * Remove a password from passed in shareable (folder or photo)
     *
     * return Response
     */
    public function removePassword()
    {
        $shareable = $this->getModel()->findOrFail(Input::get('id'));

        $shareable->password = '';
        $shareable->save();

        return response(trans('app.passwordRemoveSuccess'));
    }

    /**
     * Verify that given password matches the one on shareable.
     *
     * return Response
     */
    public function checkPassword()
    {
        $this->validate($this->request, [
            'password' => 'required|max:255',
        ]);

        $shareable = $this->getModel()->findOrFail(Input::get('id'));

        if (Hash::check(Input::get('password'), $shareable->password)) {
            return response(trans('app.passMatches'), 200);
        } else {
            return response(trans('app.passDoesntMatch'), 422);
        }
    }

    /**
     * Fetch shareable model from given id and type.
     *
     * @return mixed
     */
    private function getModel()
    {
        $this->validate($this->request, [
            'type'     => 'required|alpha|max:255',
            'id'       => 'required|alpha_num|max:20'
        ]);

        $type = strtolower(Input::get('type'));

        $model = 'App\\'.ucfirst($type);

        //new folder or file model
        $model = App::make($model);

        if ($type === 'folder') {
            $model = $model->with('files');
        }

        return $model;
    }
}
