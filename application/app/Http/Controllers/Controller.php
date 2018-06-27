<?php namespace App\Http\Controllers;

use Input;
use Illuminate\Foundation\Bus\DispatchesCommands;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;

abstract class Controller extends BaseController {

	use DispatchesCommands, ValidatesRequests;

    /**
     * Split items from input in folders and files arrays.
     *
     * @return array
     */
    protected function splitFilesAndFolders() {
        $items   = Input::get('items');
        $array   = ['files' => [], 'folders' => []];

        foreach($items as $item) {
            if ($item['type'] === 'folder') {
                $array['folders'][] = $item['id'];
            } else {
                $array['files'][] = $item['id'];
            }
        }

        return $array;
    }
}
