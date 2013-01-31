module.exports = function (elric) {
	
	/**
	 * The Base Action class
	 *
	 * @constructor
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.31
	 * @version  2013.01.31
	 */
	elric.classes.BaseAction = function BaseAction () {
		
		// This constructor will be overwritten
		
	}
	
	var bet = elric.classes.BaseAction;
	var bp = bet.prototype;
	
	/**
	 * The name/identifier of this activity
	 * Used for storing in the database
	 */
	bp.name = 'baseAction';
	
	/**
	 * The title of this activity
	 * This should be shown in the interface instead of the name
	 */
	bp.title = 'Base Action';
	
	/**
	 * The description of this action
	 */
	bp.description = 'The description of this action';
	
	/**
	 * The activity that triggered this action
	 */
	bp.activity = false;
	
	/**
	 * The pre constructor
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.31
	 * @version  2013.01.31
	 */
	bp._preConstructor = function _preConstructor () {
		
	}
	
	/**
	 * This function will be called when the action is activated
	 * The extended action should contain a function called activate()
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.31
	 * @version  2013.01.31
	 */
	bp._activate = function _activate() {
		
		// Only launch the activate function if it exists
		if (this.activate) {
			this.activity.apply(this, arguments);
		} else {
			elric.log.error('Activate function not found for action "' + this.title + '"');
		}
		
	}
}