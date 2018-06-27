<?php namespace App\Http\Controllers;

use Storage;
use App\File;
use App\User;
use Carbon\Carbon;

use App\Http\Controllers\Controller;

class OldAccountsDeleteController extends Controller {

    /**
     * Delete all accounts that are older then 2 days.
     *
     * @return Response
     */
    public function delete()
    {
        ini_set('max_execution_time', 0);

        if ($_SERVER['REMOTE_ADDR'] !== $_SERVER['SERVER_ADDR']) {
            return response('You don\'t have permissions to do that.', 403);
        }

        $users = User::where('created_at', '<=', Carbon::now()->addDays(-2))->chunk(200, function($users) {
        	foreach($users as $user) {
        		$user->folders()->where('name', '!=', 'root')->forceDelete();
        		$user->activity()->delete();
        		$user->files()->forceDelete();
        		Storage::deleteDirectory('application/storage/uploads/'.$user->id);
        	}
        });

        //delete download zip files
        $files = Storage::files('application/storage/zips');

        Storage::delete(array_filter($files, function($file) {
            return str_contains($file, '.zip');
        }));

        //delete files uploaded by not logged in users
        Storage::deleteDirectory('application/storage/uploads/no-auth');
        File::whereNull('user_id')->where('created_at', '<=', Carbon::now()->addDays(-2))->forceDelete();

        return response('Users older then 2 days deleted successfully.', 200);
    }
}