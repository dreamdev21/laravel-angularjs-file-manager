<?php namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class File extends Model {

    use SoftDeletes;

    protected $table = 'files';

    protected $guarded = ['id'];

    protected $hidden  = ['attach_id'];

    protected $appends = array('absoluteUrl', 'extension', 'type');

    protected $casts = ['id' => 'integer', 'file_size' => 'integer', 'user_id' => 'integer', 'folder_id' => 'integer'];

    public function user()
    {
        return $this->belongsTo('App\User');
    }

    /**
     * Whether or not this photo is favorited by the user.
     *
     * @return boolean
     */
    public function getIsFavoriteAttribute() {
        return $this->labels->contains('name', 'favorite');
    }

    /**
     * Get this model type.
     *
     * @return string
     */
    public function getTypeAttribute() {
        return 'file';
    }

    /**
     * Return mime type for the file (image, audio etc).
     *
     * @return string
     */
    public function getMimeType() {
        return explode('/', $this->mime)[0];
    }

    /**
     * Get photos original size absolute url (with editor modifications applied)
     *
     * @return string
     */
    public function getAbsoluteUrlAttribute()
    {
        return url("user-file/{$this->share_id}");
    }

    public function getExtensionAttribute()
    {
        return pathinfo($this->file_name, PATHINFO_EXTENSION);
    }

    public function getAbsolutePath()
    {
        return storage_path("uploads/{$this->user_id}/{$this->id}/{$this->file_name}");
    }

    public function getFileSizeAttribute($value)
    {
    	return abs($value);
    }

    public function getRelativePath($directory = false)
    {
        if ($directory) {
            return 'application/storage/uploads/'.($this->user_id ? $this->user_id : 'no-auth')."/{$this->id}";
        } else {
            return 'application/storage/uploads/'.($this->user_id ? $this->user_id : 'no-auth')."/{$this->id}/{$this->file_name}";
        }
    }

    public function labels() {
        return $this->morphToMany('App\Label', 'labelable');
    }

}
