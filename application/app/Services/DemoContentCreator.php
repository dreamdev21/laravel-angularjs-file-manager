<?php namespace App\Services;

use Storage;
use App\User;
use App\File;
use App\Folder;

class DemoContentCreator {

    public function create(User $user)
    {
        $rootFolder = $user->folders->first();
        $this->createFilesForFolder('root', $user, $rootFolder);

        $images = Folder::create(['name' => 'Images', 'description' => 'Demo images folder.', 'user_id' => $user->id, 'share_id' => str_random(20), 'path' => 'root/Images']);
        $this->createFilesForFolder('Images', $user, $images);

        $text = Folder::create(['name' => 'Text', 'description' => 'Demo text folder.', 'user_id' => $user->id, 'share_id' => str_random(20), 'path' => 'root/Text']);
        $this->createFilesForFolder('text', $user, $text);

        Folder::create(['name' => 'Stuff', 'description' => 'Empty demo stuff folder.', 'user_id' => $user->id, 'share_id' => str_random(20), 'path' => 'root/Stuff']);
        Folder::create(['name' => 'Sub-Folder', 'description' => 'Demo sub-folder.', 'user_id' => $user->id, 'share_id' => str_random(20), 'folder_id' => $text->id, 'path' => 'root/Stuff/Sub-Folder']);
    }

    private function createFilesForFolder($folderName, User $user, Folder $folder)
    {
        $files = Storage::files("demo-files/$folderName");

        foreach($files as $file) {
            if (str_contains($file, 'Thumbs.db')) continue;

            //create model
            $fileName   = str_random(10).'.'.pathinfo($file, PATHINFO_EXTENSION);

            $model = File::create([
                'file_name' => $fileName,
                'share_id'  => str_random(20),
                'name'      => basename($file),
                'mime'      => $this->getMimeType($file),
                'folder_id' => $folder->id,
                'file_size' => filesize($file),
                'user_id'   => $user->id,
            ]);

            $path  = 'application/storage/uploads/'.$user->id.'/'.$model->id.'/';
            Storage::copy($file, $path.$fileName);
        }
    }

    private function getMimeType($path) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $path);
        finfo_close($finfo);
        return $mime;
    }
}
