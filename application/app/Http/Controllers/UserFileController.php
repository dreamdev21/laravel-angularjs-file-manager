<?php namespace App\Http\Controllers;

use Auth;
use Hash;
use Image;
use Input;
use Config;
use Storage;
use App\File;

class UserFileController extends Controller {

    /**
     * Show a file.
     *
     * @return response
     */
    public function show($shareId) {
        $file = File::withTrashed()->where('share_id', $shareId)->select('mime', 'password', 'user_id', 'id', 'file_name')->firstOrFail();

        $this->checkPassword($file);

        $path = 'application/storage/uploads/'.($file->user_id ? $file->user_id : 'no-auth').'/'.$file->id.'/'.$file->file_name;

        if (Storage::exists($path)) {
            $mime = $file->mime;
            $type = explode('/', $mime)[0];

            if ($type === 'image' && Input::get('w') && Input::get('h')) {
                $file = $this->resizeImage($path, $file->extension);
            } elseif ($this->shouldStream($mime, $type)) {
                return $this->streamVideo($path, $mime, $file->file_name);
            } else {
                $file = Storage::get($path);
            }

            return response($file, 200, ['Content-Type' => $mime]);
        }

        abort(404);
    }

    /**
     * Check if password if needed.
     *
     * @param FIle $file
     * @return void
     */
    private function checkPassword($file) {
        $user = Auth::user();

        if ( ! $file->password || ($user && ($file->user_id === $user->id || $user->isAdmin))) return;

        if ( ! Hash::check(Input::get('password'), $file->password)) {
            abort(403);
        }
    }

    /**
     * Should file with given mime be streamed.
     *
     * @param string $mime
     * @param string $type
     *
     * @return bool
     */
    private function shouldStream($mime, $type) {
        return $type === 'video' || $type === 'audio' || $mime === 'application/ogg';
    }

    /**
     * Properly stream a video so seeking works.
     * @param $path
     * @param $mime
     * @param $fileName
     */
    private function streamVideo($path, $mime, $fileName) {
        $size	= Storage::size($path);
        $time	= date('r', Storage::lastModified($path));
        $fm		= Storage::getDriver()->readStream($path);
        $begin	= 0;
        $end	= $size - 1;

        if (isset($_SERVER['HTTP_RANGE']))
        {
            if (preg_match('/bytes=\h*(\d+)-(\d*)[\D.*]?/i', $_SERVER['HTTP_RANGE'], $matches))
            {
                $begin	= intval($matches[1]);
                if (!empty($matches[2]))
                {
                    $end = intval($matches[2]);
                }
            }
        }

        if (isset($_SERVER['HTTP_RANGE']))
        {
            header('HTTP/1.1 206 Partial Content');
        }
        else
        {
            header('HTTP/1.1 200 OK');
        }

        header("Content-Type: $mime");
        header('Cache-Control: public, must-revalidate, max-age=0');
        header('Pragma: no-cache');
        header('Accept-Ranges: bytes');
        header('Content-Length:' . (($end - $begin) + 1));
        if (isset($_SERVER['HTTP_RANGE']))
        {
            header("Content-Range: bytes $begin-$end/$size");
        }
        header("Content-Disposition: inline; filename=$fileName");
        header("Content-Transfer-Encoding: binary");
        header("Last-Modified: $time");

        $cur	= $begin;
        fseek($fm, $begin, 0);

        while(!feof($fm) && $cur <= $end && (connection_status() == 0))
        {
            print fread($fm, min(1024 * 16, ($end - $cur) + 1));
            $cur += 1024 * 16;
        }
    }

    /**
     * Fit image to given size.
     *
     * @param string $path
     * @param string $extension
     *
     * @return \Intervention\Image\Image
     */
    private function resizeImage($path, $extension = 'jpg') {
        if ($extension === 'svg') return Storage::get($path);
 
        $data = Config::get('filesystems.default') === 'local' ? $path : Storage::get($path);
        
        try {
            return Image::cache(function($image) use($data, $extension) {
                $image->make($data)->fit(Input::get('w', 300), Input::get('h', 200))->encode($extension);
            });
        } catch (\Exception $e) {
            try {
                return Image::make($data)->fit(Input::get('w', 300), Input::get('h', 200))->encode($extension);
            } catch (\Exception $e) {
                return $data;
            }
        }
    }

}
