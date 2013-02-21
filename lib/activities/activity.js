module.exports = function (elric) {
	
	/**
	 * The Base Activity class
	 *
	 * @constructor
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.30
	 * @version  2013.01.30
	 */
	elric.classes.BaseActivity = function BaseActivity () {
		
		// This constructor will be overwritten
		
	}
	
	var bet = elric.classes.BaseActivity;
	var bp = bet.prototype;
	
	/**
	 * A link to elric
	 */
	bp.elric = elric;
	
	/**
	 * The name/identifier of this activity
	 * Used for storing in the database
	 */
	bp.name = 'baseActivity';
	
	/**
	 * The title of this activity
	 * This should be shown in the interface instead of the name
	 */
	bp.title = 'Base Activity';
	
	/**
	 * In which categories should we place this activity?
	 */
	bp.categories = [];
	
	/**
	 * Is this activity instantaneous or ongoing?
	 * Ongoing activites have a beginning and end, both can be used.
	 */
	bp.ongoing = false;

	/**
	 * The structure of the payload,
	 * used for constructing scenarios in the browser
	 */
	bp.blueprint = {};
	
	/**
	 * The class from which to create new activities
	 */
	bp.template = {};
	
	/**
	 * The pre constructor
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.31
	 * @version  2013.02.21
	 */
	bp.preConstructor = function preConstructor () {
		
		this.categories = [];
		
		this.instancePreConstructor = function(){}
		this.instanceConstructor = function(){}
		
	}
	
	/**
	 * The post constructor
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.21
	 * @version  2013.02.21
	 */
	bp.postConstructor = function postConstructor () {
		
		// Create an alias to this parent activity
		var thisActivity = this;
		
		// Create the base activity instance template
		var base = function baseActivityTemplate (){};
		
		/**
		 * Method to fire the activity
		 * 
		 * @author   Jelle De Loecker   <jelle@kipdola.be>
		 * @since    2013.01.31
		 * @version  2013.02.21
		 */
		base.prototype.fire  = function fire () {
	
			this.elric.events.activities.emit('activity', {global: true}, this);
			
			// The activity has fired a first time, it's no longer new
			this.new = false;
			this.fired++;
		}
		
		var constructor = function constructor (elric, options) {
			
			// Create a link to elric
			this.elric = elric;
			this.parent = thisActivity;
			
			this.new = true;
			this.fired = 0;
			this.payload = {};
		
			this.origin = {
				created: new Date().getTime(),
				room: false,
				element: false,
				coordinate: false,
				user: false,
				action: false
			};
		}
		
		// Create a new class for activity instances
		this.template = elric.extend(
			base,
			this.instancePreConstructor,
			constructor,
			this.instanceConstructor
		);
		
	}

	/**
	 * Create a new instance of this activity
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.18
	 * @version  2013.02.21
	 */
	bp.create = function create (options) {
		var newInstance = new this.template(elric, options);
		return newInstance;
	}
	
}