<?php namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Folder extends Model {

    use SoftDeletes;

	protected $fillable = ['name', 'share_id', 'user_id', 'folder_id', 'children', 'path'];

    protected $appends = array('type', 'isRootChild');

    /**
     * The attributes that should be casted to native types.
     *
     * @var array
     */
    protected $casts = [
        'id'       => 'integer',
        'user_id'  => 'integer',
    ];

    public function getTypeAttribute() {
        return 'folder';
    }

    public function getIsRootChildAttribute() {
        return count(explode('/', $this->path)) === 2;
    }

    public function files()
    {
        return $this->hasMany('App\File');
    }

    public function folders()
    {
        return $this->hasMany('App\Folder');
    }

    public function labels() {
        return $this->morphToMany('App\Label', 'labelable');
    }

}
