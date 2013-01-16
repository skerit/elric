var EventEmitter = require('events').EventEmitter;

module.exports = function (elric) {
	
	var eventFilters = {};
	
	/**
	 * Our modified Event class
	 *
	 * @constructor
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.16
	 * @version  2013.01.16
	 *
	 * @param    {string}        namespace    The event namespace
	 * @param    {object}        extendObj    An optional object to add functions to
	 */
	elric.classes.ElricEvent = function ElricEvent (namespace, extendObj) {
		
		var thisEvent = this;
		
		this.namespace = namespace;
		
		// Get the basic emitter
		this._baseEmitter = elric.getEventspace(namespace);
		
		if (extendObj !== undefined) {
			
			// Add the event emitter to the object
			extendObj.event = this;
			
			// Add the on listener to the object
			extendObj.on = function on (eventname, callback) {
				return thisEvent._baseEmitter.on(eventname, callback);
			}
			
			// Add the emit function to the object
			extendObj.emit = function emit () {
				return thisEvent.emit.apply(this, arguments);
			}
		}
		
	}
	
	var bp = elric.classes.ElricEvent.prototype;
	
	// The base emitter
	bp._baseEmitter = false;
	
	// The namespace of this event emitter
	bp.namespace = 'all';
	
	/**
	 * Listen to events on this namespace
	 */
	bp.on = function on (eventname, callback) {
		return this._baseEmitter.on(eventname, callback)
	};
	
	/**
	 * Our modified emit function
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.16
	 * @version  2013.01.16
	 *
	 * @param    {string}   eventname      The name of the event
	 * @param    {object}   eventoptions   Emit options
	 *                                     (if not given, auto created)
	 * @param    {object}   data           Message data
	 */
	bp.emit = function emit (eventname, eventoptions, data) {
		
		// Arguments to pass to the real emit function
		var newArguments = [];
		
		// Push the first argument
		newArguments.push(eventname);
		
		// Set the begin argument
		var i = 2;
		
		// If the options object does not exist, create it
		if (arguments.length < 3) {
			newArguments.push({global: true});
			i = 1;
		} else {
			newArguments.push(arguments[1]);
		}
		
		// Get the options object
		var options = newArguments[1];
		
		// Add all the remaining arguments to the newArguments array
		for (var j = arguments.length; i < j; i++) {
			newArguments.push(arguments[i]);
		}
		
		// Also pass to the global, main one?
		var global = true;
		
		if (options.global !== undefined) {
			global = options.global;
		}
		
		// Add origin information to the options object
		options.namespace = this.namespace;
		
		// Send the event on the global emitter
		if (global && eventname != 'all') {
			elric.getEventspace('all').emit.apply(this, newArguments);
		}
		
		// Emit in our event
		return this._baseEmitter.emit.apply(this, newArguments);
	}
	
	/**
	 * Get a namespace event emitter
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.09
	 * @version  2013.01.16
	 *
	 * @param    {string}        filter    The filter name
	 * @returns  {EventEmitter}            An event emitter
	 */
	elric.getEventspace = function getEventspace (filter) {
		
		if (eventFilters[filter] === undefined) {
			eventFilters[filter] = new EventEmitter(); 
		}
		
		return eventFilters[filter];
	}
	
}