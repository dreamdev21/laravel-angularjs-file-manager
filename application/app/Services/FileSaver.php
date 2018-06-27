<?php

namespace App\Services;

use App;
use App\File;
use Auth, Storage;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class FileSaver {

    private $blacklist = false;
    private $whitelist = false;

    public function __construct() {
        $settings  = App::make('App\Services\Settings');
        $whitelist = $settings->get('whitelist');
        $blacklist = $settings->get('blacklist');
        $this->whitelist = $whitelist ? explode(',', $whitelist) : false;
        $this->blacklist = $blacklist ? explode(',', $blacklist) : false;
    }

    public function saveFiles(array $files, $folderId, $attachId)
    {
        $uploaded = []; $rejected = [];

        foreach ($files as $uploadedFile) {

            //check if file was uploaded properly first as
            //otherwise extension guessing will error out
            if ( ! $uploadedFile->isValid()) {
                $rejected[] = $this->makeClientName($uploadedFile); continue;
            }

            $extension = $uploadedFile->guessExtension();

            if ($this->extensionIsNotValid($uploadedFile)) {
                $rejected[] = $this->makeClientName($uploadedFile); continue;
            }

            $fileName = strtolower(str_random(20)).".$extension";
            $fileModel = $this->createReferenceToFileInDB($fileName, $uploadedFile, $folderId, $attachId);

            if ($this->saveFile($fileModel, $fileName, $uploadedFile, $extension)) {
                $uploaded[] = $fileModel;
            } else {
                $fileModel->delete();
            }
        }

        return [ 'uploaded' => $uploaded, 'rejected' => $rejected ];
    }

    /**
     * Save given image to file system and create needed thumbnails for it.
     *
     * @param  File  $fileModel
     * @param  string  $fileName
     * @param  \Symfony\Component\HttpFoundation\File\UploadedFile|string  $uploadedFile
     *
     * @return string|null
     */
    public function saveFile($fileModel, $fileName, $uploadedFile)
    {
        //path to this file folder
        if (Auth::check()) {
            $folderPath = 'application/storage/uploads/'.Auth::user()->id.'/'.$fileModel->id.'/';
        } else {
            $folderPath = 'application/storage/uploads/no-auth/'.$fileModel->id.'/';
        }

        $filePath = is_string($uploadedFile) ? $uploadedFile : $uploadedFile->getRealPath();

        //store uploaded file using a stream
        $stream = fopen($filePath, 'r+');
        Storage::put($folderPath.$fileName, $stream);

        if (is_resource($stream)) {
            fclose($stream);
        }

        return $folderPath.$fileModel->name;
    }

    private function createReferenceToFileInDB($fileName, $file, $folderId, $attachId)
    {
        //if we've got no folder id passed attach this upload to users root folder
        if ( ! $folderId && Auth::check()) {
            $folderId = Auth::user()->folders()->where('name', 'root')->first()->id;
        } else if ( ! $folderId) {
            $folderId = null;
        }

        return File::create([
            'file_name' => $fileName,
            'share_id'  => strtolower(str_random(20)),
            'name'      => $this->makeTitleFromOriginalName($file),
            'folder_id' => $folderId,
            'attach_id' => $attachId ? $attachId : null,
            'file_size' => $file->getClientSize(),
            'mime'      => $file->getMimeType(),
            'user_id'   => Auth::check() ? Auth::user()->id : null,
        ]);
    }

    private function makeTitleFromOriginalName(UploadedFile $photo)
    {
        return htmlspecialchars(ucfirst($photo->getClientOriginalName()));
    }

    private function makeClientName(UploadedFile $photo)
    {
        return htmlspecialchars($photo->getClientOriginalName());
    }

    private function extensionIsNotValid(UploadedFile $file)
    {
        $mimeExt = explode('/', $file->getMimeType())[1];
        $nameExt = $file->getClientOriginalExtension();

        if ($this->whitelist) {
            if ( ! in_array($mimeExt, $this->whitelist)) return true;
            if ($nameExt && ! in_array($nameExt, $this->whitelist)) return true;
        }

        if ($this->blacklist) {
            if (in_array($mimeExt, $this->blacklist)) return true;
            if ($nameExt && in_array($nameExt, $this->blacklist)) return true;
        }

        return false;
    }
}