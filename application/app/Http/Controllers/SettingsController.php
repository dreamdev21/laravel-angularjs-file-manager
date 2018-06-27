<?php namespace App\Http\Controllers;

use App, Input;

class SettingsController extends Controller {

    /**
     * Settings service instance.
     *
     * @var App\Services\Settings;
     */
    private $settings;

    public function __construct()
    {
        $this->middleware('loggedIn');
        
        if (IS_DEMO) {
            $this->middleware('admin', ['only' => ['updateSettings']]);
        } else {
            $this->middleware('admin');
        }

        $this->settings = App::make('Settings');
    }

    public function getAllSettings()
    {
        return $this->settings->getAll();
    }

    /**
     * Update Settings in the database with given ones.
     *
     * @return int
     */
    public function updateSettings()
    {
        $this->settings->setAll(Input::all());

        return response(trans('app.settingsUpdated'));
    }

    /**
     * Get maximum upload file size set in php.
     *
     * @return string
     */
    public function serverMaxUploadSize()
    {
        return min(ini_get('upload_max_filesize'), ini_get('post_max_size'));
    }
}
