/**
 * @param	{string}		actionName
 */
Doek.Action = function (actionName) {
	
	/**
	 * An action will capture all mouse & keyboard
	 * events and then decide what to do with them
	 * Each event will get the node in the payload
	 * for whom the original event was meant.
	 */
	
	this.name = actionName.toLocaleLowerCase();
	this._caseSensitiveName = actionName;
	this.event = new Doek.Event(this);
	
	/**
	 * Event aliases
	 */
	this.on = function (event, callback) {return this.event.on(event, callback)};
	this.fire = function (eventType, caller, payload, modifiers) {return this.event.fireEvent(eventType, caller, payload, modifiers)};
	
	/**
	 * Event list:
	 * mousedown: When the mouse is pressed down
	 * mousedownFirst: the first down press
	 * mousedownN: Any mousedown after the first
	 * mousedownAny: Any mousedown, similar to mousedown
	 *
	 * Same applies to mouseup
	 *
	 * mousemove: When the mouse is moved
	 *
	 * These mousemove+click events are only applied to left clicks
	 * mousemoveZeroClick: When the mouse is moved and no
	 * 					   no clicks have ever been made
	 * mousemoveFirstDown: When the mouse moves while we're
	 * 					   clicking down for the first time
	 * mousemoveFirstClick: When the mouse moves after we've
	 * 						clicked once
	 * mousemoveNDown: When the mouse moves when we're pressing
	 * 				   down, but not on the first time
	 * mousemoveDown: When the mouse moves when we're pressing down, any time
	 * mousemoveNClick
	 * mousemoveAny
	 */
	
	this.canvas = false;
	
	// A place to store your things
	this.storage = {}
	
	this.button = {
		left: {downCount: 0, upCount: 0, down: false},
		middle: {downCount: 0, upCount: 0, down: false},
		right: {downCount: 0, upCount: 0, down: false}
	}
	
	this._mousedown = false;
	this._mouseDownCount = 0;
	this._mouseUpCount = 0;
	
	// Init & Cleanup (reset)
	this.on('init', function(caller, payload){
		this.storage = {}
	
		this.button = {
			left: {downCount: 0, upCount: 0, down: false},
			middle: {downCount: 0, upCount: 0, down: false},
			right: {downCount: 0, upCount: 0, down: false}
		}
		
		this._mousedown = false;
		this._mouseDownCount = 0;
		this._mouseUpCount = 0;
	});
	
	// Finished
	this.on('finished', function(caller){
		
	});

	this.on('mousedown', function(caller, payload){
		
		var button = payload.button;
		
		// Send click event some aditional data
		if (payload === undefined) payload = {};
		payload.originalcaller = caller;
		payload.clickcount = this._mousedownCount;
		
		this.button[button].down = true;
		this.button[button].downCount++;
		this._mouseDownCount++;
		this._mousedown = true;
		
		// Action received the first click
		if (this._mousedownCount == 1) this.fire('mousedownFirst', this, payload);
		
		// Action received more clicks
		else this.fire('mousedownN', this, payload);
		
		// Action received for first click for specific button
		if (this.button[button].downCount == 1) this.fire('mousedownFirst' + button, this, payload);
		
		// Action received more clicks for specific button
		else this.fire('mousedownN' + button, this, payload);
		
		// Action received any click (first, second, ...)
		this.fire('mousedownAny', this, payload, [button]);
	});
	
	this.on('mouseup', function(caller, payload){
		
		var button = payload.button;
		
		if (payload === undefined) payload = {};
		payload.originalcaller = caller;
		payload.clickcount = this._mouseupCount;
		
		this.button[button].down = false;
		this.button[button].upCount++;
		
		this._mouseUpCount++;
		this._mousedown = false;
		
		// Any button click
		if (this._mouseUpCount == 1) this.fire('mouseupFirst', this, payload);
		else this.fire('mouseupN', this, payload);
		
		// Specific button click
		if (this.button[button].upCount == 1) this.fire('mouseupFirst' + button, this, payload);
		else this.fire('mouseupN' + button, this, payload);
		
		this.fire('mouseupAny', this, payload, [button]);
	});
	
	this.on('mousemove', function(caller, payload){
		
		if (payload === undefined) payload = {};
		payload.originalcaller = caller;
		
		// No clicks have ever been made
		if (this.button.left.downCount == 0) this.fire('mousemoveZeroClick', this, payload);
		
		// We're moving while we're clicking down for the first time
		else if (this.button.left.downCount == 1 && this.button.left.down) this.fire('mousemoveFirstDown', this, payload);
		
		// We're moving after the first click
		else if (this.button.left.downCount == 1 && !this.button.left.down) this.fire('mousemoveFirstClick', this, payload);
		
		// We're moving while pressing down, nth time
		else if (this.button.left.down) this.fire('mousemoveNDown', this, payload);
		
		// We're moving after nth click
		else this.fire('mousemoveNClick', this, payload);
		
		// We're moving while pressing down, any time
		if (this.button.left.down) this.fire('mousemoveDown', this, payload);
		
		// Also send any movement
		this.fire('mousemoveAny', this, payload);
	});
	
}