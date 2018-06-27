<?php namespace App\Http\Controllers;

use Auth;
use Input;
use App\Folder;

class ItemsMoveController extends Controller {

    /**
     * Move user files and folders to a new folder.
     *
     * @return Collection
     */
    public function move() {
        $items = $this->splitFilesAndFolders();

        if (count($items['files'])) {
            Auth::user()->files()->whereIn('id', $items['files'])->update(['folder_id' => Input::get('folderId')]);
        }

        if (count($items['folders'])) {
            $parent = Auth::user()->folders()->findOrFail(Input::get('folderId'));

            foreach($items['folders'] as $id) {
                $this->moveFolder($id, $parent);
            }
        }

        return Auth::user()->folders()->with('labels')->get();
    }

    /**
     * Move user folder to a new folder recursively.
     *
     * @param Folder|int|string $folder
     * @param Folder $parent
     */
    private function moveFolder($folder, $parent) {
        if ( ! is_object($folder)) {
            $folder = Auth::user()->folders()->with('folders')->find($folder);
        }

        $folder->folder_id = $parent->name === 'root' ? null : $parent->id;
        $folder->path      = $parent->path ? $parent->path.'/'.$folder->name : 'root/'.$folder->name;
        $folder->save();

        if (! $folder->folders->isEmpty()) {
            foreach($folder->folders as $subFolder) {
                $this->moveFolder($subFolder, $folder, true);
            }
        }
    }
}
