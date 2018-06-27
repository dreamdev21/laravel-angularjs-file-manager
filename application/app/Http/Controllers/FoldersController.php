<?php namespace App\Http\Controllers;

use App;
use App\Photo;
use App\Folder;
use Illuminate\Database\Eloquent\Model;
use Input, Auth;
use App\Services\Paginator;
use Illuminate\Support\Str;
use App\Services\Photo\Deleter;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;

class FoldersController extends Controller {

    /**
     * Photo columns to get when lazy loading folder photos.
     *
     * @var array
     */
    private $fileColumns = ['created_at', 'updated_at', 'deleted_at', 'description', 'file_name', 'file_size', 'password', 'share_id', 'mime', 'user_id', 'name', 'folder_id', 'id'];

    /**
     * Paginator Instance.
     *
     * @var Paginator
     */
    private $paginator;

    public function __construct(Deleter $deleter, Paginator $paginator)
    {
        $this->middleware('loggedIn');

        $this->deleter = $deleter;
        $this->paginator = $paginator;
    }

    /**
     * Return all folders belonging to current user.
	 *
	 * @return string
	 */
	public function index() {
        if (Input::get('all') === 'true' && (Auth::user()->isAdmin || IS_DEMO)) {
            return $this->paginator->paginate(Folder::withTrashed()->where('name', '!=', 'root')->orderBy('updated_at', 'desc'), Input::all(), 'folders');
        } else {
            return Auth::user()->folders()->with('labels')->get();
        }
	}

    /**
     * Create a new folder in database
     *
     * @param Request $request
     * @return Model
     */
	public function store(Request $request)
	{
        $this->validate($request, [
            'name' => 'required|max:255',
            'folder_id' => 'integer|min:1'
        ]);

        //check if user already has folder with this name
        if (Auth::user()->folders()->where('name', Input::get('name'))->first()) {
            return response()->json(trans('app.folderAlreadyExists'), 422);
        }

        //update parent folders children column with this folder
        $parent = Input::get('parent');
        $name   = Input::get('name');
        $path   = isset($parent['path']) ? $parent['path'].'/'.$name : 'root/'.$name;

        //create the new folder
        return Auth::user()->folders()->create([
            'name'      => $name,
            'path'      => $path,
            'share_id'  => Str::random(15),
            'folder_id' => $parent['name'] !== 'root' ? $parent['id'] : null
        ]);
	}

	/**
	 * Find and return a folder with given id (if current user has access to it)
	 *
	 * @param  string $name
	 * @return Folder
	 */
	public function show($name)
	{
        $folder = Auth::user()->folders()->with(['files' => function($q) {
            $limit = App::make('Settings')->get('dash_files_num', 50);
            $q->with('labels')->select($this->fileColumns)->limit($limit);
        }])->with('labels')->where('name', $name)->firstOrFail();

        return $folder;
	}


	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id, Request $request)
	{
		$name = Input::get('name');

        $this->validate($request, [
            'name' => 'min:1|max:255'
        ]);

        if ($name && Auth::user()->folders()->where('name', $name)->first()) {
            return response(trans('app.folderNameExists'), 422);
        }

        $folder = Auth::user()->folders()->findOrFail($id);

        foreach (Input::all() as $key => $value) {
            if ($key === 'name') {
                $folder->path = str_replace($folder->name, $value, $folder->path);

                //update subfolders path if we're chaning this folders name
                $subfolders = Folder::where('user_id', $folder->user_id)->where('path', 'like', "%/$folder->name/%")->get();

                foreach ($subfolders as $subfolder) {
                	$subfolder->path = str_replace($folder->name, $value, $subfolder->path);
                	$subfolder->save();
                }
            }

            $folder->$key = $value;
        }

        $folder->save();

        return $folder;
	}
}
