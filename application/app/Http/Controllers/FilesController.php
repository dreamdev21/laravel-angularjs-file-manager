<?php namespace App\Http\Controllers;

use App;
use App\File;
use Input, Auth;
use App\Http\Requests;
use App\Services\Paginator;
use App\Services\FileSaver;
use App\Services\Photo\Deleter;

class FilesController extends Controller {

    /**
     * Paginator Instance.
     *
     * @var Paginator
     */
    private $paginator;

    public function __construct(FileSaver $saver, Deleter $deleter, Paginator $paginator)
    {
        $this->middleware('loggedIn', ['except' => 'store']);
        $this->middleware('spaceUsage', ['only' => 'store']);

        $this->saver = $saver;
        $this->deleter = $deleter;
        $this->user = Auth::user();
        $this->paginator = $paginator;
    }

    /**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
        if (Input::get('all') === 'true' && ($this->user->isAdmin || IS_DEMO)) {
            return $this->paginator->paginate(File::withTrashed()->with('User')->orderBy('updated_at', 'desc'), Input::all(), 'files');
        } else {
            $query = Auth::user()->files();

            if ($folderId = Input::get('folderId')) {
                $query->where('folder_id', $folderId);
            }

            return $query->paginate(App::make('Settings')->get('dash_files_num', 50));
        }
	}

	/**
	 * Find photo with given id.
	 *
	 * @param  int  $id
	 * @return File
	 */
	public function show($id)
	{
        return Auth::user()->files()->findOrFail($id);
	}

    /**
     * Store a new file.
     *
     * @return array|void
     */
    public function store()
    {
        //store uploaded file
        if (Input::file()) {
            return $this->saver->saveFiles(Input::file(), Input::get('folder'), Input::get('attach_id'));
        }
    }

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		$file = Auth::user()->files()->findOrFail($id);

        $file->update(Input::all());

        return $file;
	}

    /**
     * Update files with specified ids.
     *
     * @return int
     */
    public function updateAll()
    {
        return Auth::user()->files()->whereIn('id', Input::get('ids'))->update(Input::get('data'));
    }

    /**
     * Return photos user has recently uploaded or modified.
     *
     * @return mixed
     */
    public function recent()
    {
        return Auth::user()->files()->with('labels')->orderBy('updated_at', 'desc')->limit(30)->get();
    }
}
