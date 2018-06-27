<?php namespace App\Services;

use Auth;
use Storage;
use Exception;

class SpaceUsage {

    /**
     * User model instance.
     *
     * @var \App\User|null
     */
    protected $user;

    /**
     * Settings service instance.
     *
     * @var Settings
     */
    protected $settings;

    /**
     * Create new SpaceUsage instance.
     *
     * @param Settings $settings
     */
    public function __construct(Settings $settings) {
        $this->user = Auth::user();
        $this->settings = $settings;
    }

    /**
     * Return information about users space usage.
     *
     * @return array
     */
    public function info() {
        return [
            'space_used' => $this->getSpaceUsed(),
            'max_space'  => $this->getMaxUserSpace(),
        ];
    }

    /**
     * Return if user has used up his disk space.
     *
     * @return bool
     */
    public function userIsOutOfSpace() {
        return  $this->getMaxUserSpace() <= $this->getSpaceUsed();
    }

    /**
     * Get maximum space for a user depending on his subscription plan.
     *
     * @return int
     */
    private function getMaxUserSpace() {

        if ($this->user->space_available) {
            return $this->convertToBytes($this->user->space_available.'MB');
        }

        if (($this->user->subscribed() || $this->user->onGracePeriod()) && ! IS_DEMO) {
            return $this->convertToBytes($this->user->stripe_plan);
        }

        return $this->settings->get('maxUserSpace');
    }

    /**
     * Return amount of space user is currently using in bytes.
     *
     * @return int
     */
    public function getSpaceUsed()
    {
        return (int) Auth::user()->files()->sum('file_size');
    }

    /**
     * Convert subscription plan name (100GB etc) to bytes.
     *
     * @param string $from
     * @return int
     */
    private function convertToBytes($from) {
        $number = (int) substr($from, 0, -2);

        switch(strtoupper(substr($from, -2))) {
            case "KB":
                return $number*1024;
            case "MB":
                return $number*pow(1024,2);
            case "GB":
                return $number*pow(1024,3);
            case "TB":
                return $number*pow(1024,4);
            default:
                return $number;
        }
    }
}