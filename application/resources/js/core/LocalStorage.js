angular.module('app')

.factory('localStorage', function() {
	var storage = {

		/**
		 * How long (days) data will be cached in local storage.
		 * 
		 * @type {Number}
		 */
		expireAfter: 2,

		/**
		 * Retrieve value under given key from local storage.
		 * 
		 * @param  {string} key
		 * @return mixed
		 */
		get: function(key, defaultValue) {
			var value = JSON.parse(localStorage.getItem(key));
			
			if ( ! value || ! storage.isValid(value.time)) {
				return defaultValue;
			}

			return value.value;
		},

		/**
		 * Store value into browser local storage.
		 * 
		 * @param {string} key
		 * @param {*} value
         * @param {boolean} append
		 */
		set: function(key, value, append) {
			var data = { value: value, time: new Date().getTime() };

            //if append flag is true and old value exists and
            //is array, push new value inside that array and store it
            if (append) {
                var old = this.get(key);

                //if old value doesn't exist and new value isn't array
                //turn it into array now so we can push into later
                if ( ! angular.isArray(value)) {
                    data.value = [value];
                }

                if (angular.isArray(old)) {
                    old.push(value);
                    data.value = old;
                }
            }

			return localStorage.setItem(key, JSON.stringify(data));
		},

        /**
         * Remove item from local storage.
         *
         * @param key
         * @returns {*}
         */
        remove: function(key) {
            return localStorage.removeItem(key);
        },

		/**
		 * Whether or not cache with given time is considered expired.
		 * 
		 * @param  string  time
		 * @return {Boolean}
		 */
		isValid: function(time) {
			var days = (new Date().getTime() - new Date(time).getTime())/(1000*60*60*24);

			return days < storage.expireAfter;
		}
	};

	return storage;
});