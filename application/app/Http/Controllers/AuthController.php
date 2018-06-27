<?php namespace App\Http\Controllers;

use App\Folder;
use Auth, Input, App;
use App\Services\Registrar;
use App\Http\Requests\LogUserInRequest;

class AuthController extends Controller {

    /**
     * Register/create a new user.
     *
     * @param Registrar $registrar
     * @return *
     */
    public function postRegister(Registrar $registrar)
	{
        //make sure that admin has enabled regisration before proceeding
        if ( ! App::make('Settings')->get('enableRegistration', true) && ! Auth::user()->isAdmin) {
            return response(trans('app.registrationDisabled'), 403);
        }

        $validator = $registrar->validator(Input::all());

        if ($validator->fails())
        {
            return response()->json($validator->errors(), 400);
        }

        $user = $registrar->create(Input::all());

        //create a root folder for this user
        Folder::create(['name' => 'root', 'share_id' => str_random(15), 'user_id' => $user->id, 'description' => trans('app.rootAlbumDesc')]);

        if (IS_DEMO && Input::has('createDemoContent')) {
            App::make('\App\Services\DemoContentCreator')->create($user);
        }

        //if user is not logged in, do it now
        if ( ! Auth::check()) {
            Auth::login($user);
        }

        return $user;
	}

    /**
     * Login in a user.
     *
     * @param LogUserInRequest $request
     * @return Response
     */
    public function postLogin(LogUserInRequest $request)
    {
        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials, $request->get('remember')))
        {
            return response()->json(Auth::user(), 200);
        }

        return response()->json(array('*' => trans('app.wrongCredentials')), 422);
    }

    public function postLogout()
    {
        if (Auth::check()) {
            return Auth::logout();
        }

        return abort(404);
    }
}
