<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class Design extends Model {

	/**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'designs';

    protected $fillable = ['description', 'user_id', 'data', 'public', 'width', 'height'];
}
