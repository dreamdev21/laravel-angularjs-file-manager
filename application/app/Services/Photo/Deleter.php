<?php namespace App\Services\Photo;

use App\File;
use App\Folder;
use Auth, Storage, Exception;

class Deleter {

    /**
     * Move file with given id to trash or delete permanently if already in trash.
     *
     * @param  array $items
     * @return int
     */
    public function delete(array $items)
    {
        $folders = []; $files = [];

        foreach($items as $item) {
            if ($item['type'] === 'folder') {
                $folders[] = $item;
            } else {
                $files[] = $item;
            }
        }

        return $this->deleteFiles($files) + $this->deleteFolders($folders);
    }

    /**
     * Permanently delete given folders and associated files from db and disk.
     *
     * @param array|Collection $folders
     * @return int
     */
    public function deleteFolders($folders) {
        if ( ! count($folders)) return 0;

        foreach($folders as $folder) {

            //if folder is array it's a model instance, otherwise we will need to fetch it from db
            if (is_array($folder)) {
                $folder = Folder::with('files', 'folders')->withTrashed()->findOrFail($folder['id']);
            }

            if ($folder->user_id === Auth::user()->id || Auth::user()->isAdmin) {

                //delete all files
                foreach ($folder->files as $file) {
                    Storage::deleteDirectory($file->getRelativePath(true));
                }

                //delete all file models from db
                File::whereIn('id', $folder->files->lists('id'))->forceDelete();

                //delete sub-folders and files recursively
                if ( ! $folder->folders->isEmpty()) {
                    $this->deleteFolders($folder->folders);
                }

                //delete folder model from db
                $folder->forceDelete();
            }
        }

        return count($folders);
    }

    /**
     * Permanently delete given files from db and disk.
     *
     * @param array $files
     * @return int
     */
    public function deleteFiles(array $files) {
        if ( ! count($files)) return 0;

        foreach($files as $file) {
            $file = File::withTrashed()->findOrFail($file['id']);

            if ($file->user_id === Auth::user()->id || Auth::user()->isAdmin) {
                try {
                    Storage::deleteDirectory($file->getRelativePath(true));
                    $file->forceDelete();
                } catch (Exception $e) {
                    //
                }
            }
        }

        return count($files);
    }
}