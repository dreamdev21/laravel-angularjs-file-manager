<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class Label extends Model {

    public function files()
    {
        return $this->morphedByMany('App\File', 'labelable');
    }

    public function folders()
    {
        return $this->morphedByMany('App\Folder', 'labelable');
    }

}
