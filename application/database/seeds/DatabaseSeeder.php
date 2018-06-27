<?php

use App\Label;
use App\Folder;
use App\Setting;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;

class DatabaseSeeder extends Seeder {

	/**
	 * Run the database seeds.
	 *
	 * @return void
	 */
	public function run()
	{
		Model::unguard();

		Label::create(['name' => 'favorite']);
        Label::create(['name' => 'trashed']);

        Setting::insert([
            ['name' => 'homeTagline', 'value' => 'BeDrive. A new home for your files.'],
            ['name' => 'homeByline', 'value' => 'Register or Login now to upload, backup, manage and access your files on any device, from anywhere, free.'],
            ['name' => 'homeButtonText', 'value' => 'Register Now'],
            ['name' => 'homepage', 'value' => 'landing'],
            ['name' => 'blacklist', 'value' => 'exe, application/x-msdownload, x-dosexec'],
            ['name' => 'maxFileSize', 'value' => 20],
            ['name' => 'maxUserSpace', 'value' => 104857600],
            ['name' => 'enableRegistration', 'value' => 1],
            ['name' => 'siteName', 'value' => 'BeDrive'],
            ['name' => 'enableHomeUpload', 'value' => 1],
            ['name' => 'maxSimultUploads', 'value' => 10],
            ['name' => 'enablePushState', 'value' => 0],
            ['name' => 'dateLocale', 'value' => 'en'],
            ['name' => 'pushStateRootUrl', 'value' => '/'],
            ['name' => 'disqusShortname', 'value' => 'bedrive'],
            ['name' => 'enablePayments', 'value' => 1],
        ]);
	}

}
