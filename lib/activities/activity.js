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
	 * Is this activity instantaneous or ongoing?
	 * Ongoing activites have a beginning and end, both can be used.
	 */
	bp.ongoing = false;
	
	/**
	 * If it is an ongoing action, is it new or is it returning?
	 */
	bp.new = false;
	
	/**
	 * The data of this activity
	 */
	bp.payload = {};
	
	/**
	 * The structure of the payload,
	 * used for constructing scenarios in the browser
	 */
	bp.blueprint = {};
	
	/**
	 * Information regarding the origin of this activity
	 */
	bp.origin = {};
	
	/**
	 * When the activity was created
	 */
	bp.origin.created = false;
	
	/**
	 * From which room this activity originates
	 */
	bp.origin.room = false;
	
	/**
	 * From which element this activity originates
	 */
	bp.origin.element = false;
	
	/**
	 * From the specific coordinate (if applicable)
	 */
	bp.origin.coordinate = false;
	
	/**
	 * From what user (if applicable)
	 */
	bp.origin.user = false;
	
	/**
	 * From what action (should the action trigger an acitivity)
	 */
	bp.origin.action = false;
	
	/**
	 * The pre constructor
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.31
	 * @version  2013.01.31
	 */
	bp.preConstructor = function preConstructor () {
		
		this.new = true;
		
		this.origin = {
			created: new Date().getTime(),
			room: false,
			element: false,
			coordinate: false,
			user: false,
			action: false
		};
		
		this.payload = {};
		
	}
	
	/**
	 * Fire the activity
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.31
	 * @version  2013.01.31
	 */
	bp.fire = function fire () {

		elric.events.activities.emit('activity', {global: true}, this);
		
		// The activity has fired a first time, not it's no longer new
		this.new = false;
	}
	
}