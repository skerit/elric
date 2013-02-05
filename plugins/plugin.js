var $ = require('jquery');

module.exports = function (elric) {
	
	/**
	 * The Base Plugin class
	 *
	 * @constructor
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.16
	 * @version  2013.01.16
	 */
	elric.classes.BasePlugin = function BasePlugin () {
		
		// This constructor will be overwritten
		
	}
	
	var bp = elric.classes.BasePlugin.prototype;
	
	/**
	 * The name of this plugin
	 */
	bp.name = 'BasePlugin';
	
	/**
	 * This plugin's filtered event emitter
	 */
	bp.event = false;
	
	/**
	 * The function to run before the passed constructor
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.16
	 * @version  2013.01.16
	 */
	bp.preConstructor = function preConstructor () {
		var event = new elric.classes.ElricEvent(this.name, this);
	}
	
	/**
	 * The function to run after the passed constructor
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.16
	 * @version  2013.01.16
	 */
	bp._init = function _init () {

	}
	
}