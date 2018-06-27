<?php namespace App\Http\Controllers;

use App;
use Auth;
use App\Services\FileSaver;

class FileCopyController extends Controller {

    /**
     * Create new PhotoCopyController Instance.
     *
     * @param FileSaver $saver
     */
    public function __construct(FileSaver $saver)
    {
        $this->middleware('spaceUsage', ['only' => 'copy']);

        $this->saver = $saver;
    }

    /**
     * Copy items in database and filesystem.
     *
     * @return
     */
    public function copy()
    {
        $items = $this->splitFilesAndFolders();
        $response = ['files' => [], 'folders' => []];

        if ($items['files']) {
            foreach($items['files'] as $id) {
                $file = Auth::user()->files()->find($id);

                if ($file) {
                    $newFile = $file->replicate();
                    $fileName = str_random(20).'.'.$file->extension;

                    $newFile->share_id = str_random(20);
                    $newFile->file_name = $fileName;
                    $newFile->name = $file->name.' Copy';
                    $newFile->save();

                    $this->saver->saveFile($newFile, $fileName, $file->getAbsolutePath());
                    $response['files'][] = $newFile;
                }
            }
        }

        if ($items['folders']) {
            foreach($items['folders'] as $id) {
                $folder = Auth::user()->folders()->find($id);

                if ($folder) {
                    //copy folder in db
                    $newFolder = $folder->replicate();
                    $newFolder->share_id = str_random(20);
                    $newFolder->name = $folder->name.' Copy';
                    $newFolder->path = str_replace($folder->name, $newFolder->name, $newFolder->path);
                    $newFolder->save();

                    //copy folder files in db
                    foreach($folder->files as $file) {
                        $newFile = $file->replicate();
                        $fileName = str_random(20).'.'.$file->extension;

                        $newFile->folder_id = $newFolder->id;
                        $newFile->share_id = str_random(20);
                        $newFile->file_name = $fileName;
                        $newFile->name = $file->name.' Copy';
                        $newFile->save();

                        //copy folder files in filesystem
                        $this->saver->saveFile($newFile, $fileName, $file->getAbsolutePath());
                        $newFolder->files->push($newFile);
                    }

                    $response['folders'][] = $newFolder;
                }
            }
        }

        return $response;
    }
}
