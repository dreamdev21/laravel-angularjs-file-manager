<?php namespace App\Http\Controllers;

use Auth;
use Hash;
use Input;
use App\File;
use ZipArchive;
use App\Folder;
use Storage;
use Response;
use Config;

class ItemsDownloadController extends Controller {

    /**
     * Download a .zip of multiple folder and/or folders.
     *
     * @param $fileName
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function downloadZip($fileName) {
        return response()->download(base_path('storage/zips/'.$fileName), '', ['Content-Type' => 'Application\Zip']);
    }

    /**
     * Download a single file by id.
     *
     * @param string $shareId
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function downloadFile($shareId) {
        $file = File::where('share_id', $shareId)->firstOrFail();

        if ($file->password && ! $this->checkPassword($file)) {
            return response(trans('app.passDoesntMatch'), 422);
        }

        if (($filesystem = Config::get('filesystems.default')) === 'local') {
            return response()->download($file->getAbsolutePath(), $this->getName($file), ['Content-Type' => $file->mime]);
        } else {
            $fs = Storage::getDriver();

            if ($filesystem === 'rackspace') {
                $stream = fopen($fs->getAdapter()->getContainer()->getCdn()->getCdnUri().'/'.$file->getRelativePath(), 'rb');
            } else {
                $stream = $fs->readStream($file->getRelativePath());
            }

            return Response::stream(function() use($stream) {
                fpassthru($stream);
            }, 200, [
            "Content-Type" => $fs->getMimetype($file->getRelativePath()),
            "Content-Length" => $fs->getSize($file->getRelativePath()),
            "Content-disposition" => "attachment; filename=\"" . $this->getName($file) . "\"",
            ]);
        }
    }

    /**
     * Create photos matching given share id download response.
     *
     * @param  int|string $id
     * @return string
     */
    public function createDownload() {
        $items = $this->splitFilesAndFolders();

        $downloads = [];

        foreach ($items['folders'] as $id) {
            $downloads = $this->addFolder($id, $downloads);
        }

        foreach($items['files'] as $id) {
            $file = File::find($id);
            $downloads[$this->getName($file)] = $file->getRelativePath();
        }

        $fileName = $this->createZip(base_path('storage/zips'), $downloads);
        return $fileName;
    }

    /**
     * Create a zip archive for download.
     *
     * @param string $path
     * @param array $downloads
     * @return string
     */
    private function createZip($path, $downloads) {
        $name = 'download-'.(Auth::user() ? Auth::user()->id : str_random()).'-'.date('Y-m-d').'.zip';
        $zip = new ZipArchive();

        $zip->open($path.'/'.$name, ZIPARCHIVE::CREATE);

        $this->fillZip($zip, $downloads);

        $zip->close();

        return $name;
    }

    /**
     * Fill zip archive with files and folders users wants to download.
     *
     * @param ZipArchive $zip
     * @param array $downloads
     * @param string $previousFolder
     */
    private function fillZip(ZipArchive $zip, $downloads, $previousFolder = '') {
        foreach($downloads as $name => $contents) {

            //it's a folder
            if (is_array($contents)) {
                $zip->addEmptyDir($previousFolder ? $previousFolder.'/'.$name : $name);
                $this->fillZip($zip, $contents, $previousFolder ? $previousFolder.'/'.$name : $name);
            }

            //it's a file
            else {
                $zip->addFromString($previousFolder ? $previousFolder.'/'.$name : $name, Storage::get($contents));
            }
        }
    }

    /**
     * Add given folder and its files to downloads array.
     *
     * @param int|string|Folder $folder
     * @param array $downloads
     * @return array
     */
    private function addFolder($folder, &$downloads) {
        if ( ! is_object($folder)) {
            $folder = Folder::with('files', 'folders')->find($folder);
        }

        $downloads[$folder->name] = [];

        if ( ! $folder->files->isEmpty()) {
            foreach($folder->files as $file) {
                $downloads[$folder->name][$this->getName($file)] = $file->getRelativePath();
            }
        }

        if ( ! $folder->folders->isEmpty()) {
            foreach($folder->folders as $subFolder) {
                $this->addFolder($subFolder, $downloads[$folder->name]);
            }
        }

        return $downloads;
    }

    /**
     * Return a file name with a proper extension.
     *
     * @param File $file
     * @return string
     */
    private function getName(File $file) {
        $extension = pathinfo($file->name, PATHINFO_EXTENSION);

        if ( ! $extension) {
            return $file->name .'.'. $file->extension;
        }

        return $file->name;
    }

    /**
     * Verify that given password matches the one on file.
     *
     * return Response
     */
    public function checkPassword($file)
    {
        return Hash::check(Input::get('password'), $file->password) || Input::get('password') === $file->password;
    }
}
