Doek.Event = function(owner, canvas) {
	
	this.owner = owner;
	this.canvas = canvas;
	this.events = [];
	
	// A generated id
	this.id = Math.random().toString(36).substring(7);
	
	// The event count
	this.count = 0;
	
	/**
	 * The direction of the event
	 * <--   down <-> up   -->
	 *  layer - object - node - mousecatcher
	 */
	this.directions = {
		mousemove: 'down',		// A mouse has moved over us
		requestredraw: 'down',	// A parent has requested a redraw
		cleared: 'up',			// We have been cleared
		redraw: 'up',			// Parent requests a redraw
		mouseout: false,		// The cursor has moved away
		mouseenter: false,		// The cursor has entered us
		mousedown: false,		// The item is clicked
		mouseup: false,			// The item is released
		modechange: 'up',
		actionchange: 'up'
	}
}

/**
 * Add an event listener to something
 */
Doek.Event.prototype.addEvent = function(eventType, endFunction) {
	
	eventType = eventType.toLowerCase();
	
	/**
	 * endFunction (parent/child)
	 */
	
	if (this.events[eventType] === undefined) this.events[eventType] = [];
	this.events[eventType].push({'type': eventType,
								'endFunction': endFunction});
	
}

/**
 * Alias for the 'addEvent'
 * 'on' makes more sense
 */
Doek.Event.prototype.on = Doek.Event.prototype.addEvent;

/**
 * Execute & bubble the event
 * @param	{string}	eventType		The name of the base event
 * @param	{object}	caller			The caller of the event
 * @param	{object}	payload			Data the event can use
 * @param	{array}		modifiers		Additions to the base event to fire, too
 */
Doek.Event.prototype.fireEvent = function (eventType, caller, payload, modifiers) {
	
	// Do the event first. It'll possibly modify the payload
	var done = this.doEvent(eventType, caller, payload);
	
	if (modifiers !== undefined) for (var i = 0; i < modifiers.length; i++) {
		this.doEvent(eventType + modifiers[i], caller, payload);
	}
	
	if (done !== 'endbubble' && done !== 'endall') {
		this.bubbleEvent(eventType, payload);
		
		if (modifiers !== undefined) for (var i = 0; i < modifiers.length; i++) {
			this.bubbleEvent(eventType + modifiers[i], payload);
		}
	}
}

/**
 * Perform the event of something, but do not bubble it
 *
 * @param	{string}	eventType	The type of event
 * @param	{object}	caller		Where the event came from (direct parent or child)
 */
Doek.Event.prototype.doEvent = function(eventType, caller, payload) {
	
	if (payload === undefined) payload = {};
	
	var newOrigin = false;
	
	// It's the first time, add origin data
	if (payload.origin === undefined) {
		newOrigin = true;
	} else {
		if (payload.origin.type != eventType) newOrigin = true;
	}
	
	if (newOrigin) {
		
		payload.origin = {
			type: eventType,
			caller: caller
			};
			
		payload.eventid = false;
	}
	
	if (payload.eventid === undefined || !payload.eventid) {
		this.count++;
		payload.eventid = this.id + '-' + this.count;
	}
	
	if (payload.origin.callstack === undefined) payload.origin.callstack = [];
	
	payload.origin.callstack.push(caller);

	eventType = eventType.toLowerCase();
	var returnval = '';

	// Look for the event in the collection
	if (this.events[eventType] !== undefined) {
		var events = this.events[eventType];
		
		for (var i = 0; i < events.length; i++) {
			var done = events[i]['endFunction'].call(this.owner, caller, payload);
			
			// Finish our events, but do not bubble up or down
			if (done == 'endbubble') returnval = done;
			
			// Do not do anything after this event
			if (done == 'endall') return done;
			
		}
	}
	
	return returnval;
}

/**
 * Start the event chain, but do not execute the events on this one
 */
Doek.Event.prototype.bubbleEvent = function(eventType, payload) {
	
	eventType = eventType.toLowerCase();
	var direction = false;
	if (this.directions[eventType] !== undefined) direction = this.directions[eventType];
	
	// Inform children of the event if direction is up
	if (direction == 'up' && this.owner._children !== undefined) {
		
		if (this.owner._children.storage !== undefined) var children = this.owner._children.storage;
		else var children = this.owner._children;
		
		for (var key in children) {
			children[key].fire(eventType, this.owner, payload);
		}
	} else if (direction == 'down' && this.owner._parent !== undefined) {
		
		this.owner._parent.fire(eventType, this.owner, payload);
	}
}