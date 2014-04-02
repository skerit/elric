/**
 * The Doek Object Class
 *
 * @param	{Doek.Layer} parentLayer
 */
Doek.Object = function(parentLayer) {
	
	this.parentLayer = parentLayer;
	this.nodes = new Doek.Collection();
	
	this._parent = parentLayer;
	this._children = this.nodes;
	
	this.drawn = false;
	this.clickable = true;
	
	this.event = new Doek.Event(this, this.parentLayer.parentCanvas);
	
	/**
	 * Event aliases
	 */
	this.on = function (event, callback) {return this.event.on(event, callback)};
	this.fire = function (eventType, caller, payload, modifiers) {return this.event.fireEvent(eventType, caller, payload, modifiers)};
	
	this.tiled = false;
	
	this.x = 0;
	this.y = 0;
	this.dx = 0;
	this.dy = 0;
	
	this.width = 0;
	this.height = 0;
	
	// Add our own events
	this.on('hasCleared', function(caller){
		this.drawn = false;
	});
	
}

/**
 * Return an array of nodes on this position
 * 
 * @param	{Doek.Position}	position
 * @returns	{Doek.Node}
 */
Doek.Object.prototype.findNode = function (position) {
	
	var result = [];
	
	for (var index in this.nodes.storage) {
		
		/**
		 * @type	{Doek.Node}
		 */
		var node = this.nodes.storage[index];

		if ((position.mapX >= node.position.mapX && position.mapX <= (node.position.mapX + node.width)) &&
			(position.mapY >= node.position.mapY && position.mapY <= (node.position.mapY + node.height))) {
			if (node.isInNode(position)) result.push(node);
		}
	}
	
	if (result.length) return result;
	else return false;
}

/**
 * Create and add a node to this object, don't draw it yet
 *
 * @param	{object}	instruction
 * @returns	{Doek.Node}
 */
Doek.Object.prototype.createAddNode = function (instruction) {
	var newNode = new Doek.Node(instruction, this);
	var index = this.nodes.push(newNode);
	
	this.calculate();
	
	return newNode;
}

/**
 * Add a node to this object, don't draw it yet
 *
 * @param	{Doek.Node}
 */
Doek.Object.prototype.addNode = function (newNode) {
	var index = this.nodes.push(newNode);
	this.calculate();
}

/**
 * Calculate object dimensions
 */
Doek.Object.prototype.calculate = function () {
	
	this.x = false;
	this.y = false;
	this.dx = false;
	this.dy = false;
	
	var oldWidth = this.width;
	var oldHeight = this.height;
	
	for (var index in this.nodes.storage) {
		
		var node = this.nodes.storage[index];
		
		// This needs a lot of improvement for negative coordinates
		if (this.x > node.position.mapX || this.x === false) this.x = node.position.mapX;
		if (this.y > node.position.mapY || this.y === false) this.y = node.position.mapY;
		
		var dx = node.position.mapX + node.width;
		var dy = node.position.mapY + node.height;
		
		if (this.dx < dx || this.dx === false) this.dx = dx;
		if (this.dy < dy || this.dy === false) this.dy = dy;
		
	}
	
	this.width = Math.abs(this.x - this.dx);
	this.height = Math.abs(this.y - this.dy);
	
	// Fire the dimension change event if the dimensions of the object have changed
	if (this.width != oldWidth || this.height != oldHeight) {
		this.fire('dimensionchange', this, {oldWidth: oldWidth, oldHeight: oldHeight});
	}
	
}

/**
 * Add a line node to this object
 *
 * @param	{Doek.Style}	style
 * @returns	{Doek.Node}
 */
Doek.Object.prototype.addLine = function(sx, sy, dx, dy, style) {
	
	var newLine = new Doek.Line({type: 'line',
						sx: sx, sy: sy,
						dx: dx, dy: dy,
						style: style}, this);
	var index = this.nodes.push(newLine);
	
	this.calculate();
	
	return newLine;

}

/**
 * Add a rectangle node to this object
 *
 * @param	{Doek.Style}	style
 * @returns	{Doek.Node}
 */
Doek.Object.prototype.addRectangle = function(sx, sy, dx, dy, style) {
	
	var newRectangle = new Doek.Rectangle({type: 'rectangle',
						sx: sx, sy: sy,
						dx: dx, dy: dy,
						style: style}, this);
	var index = this.nodes.push(newRectangle);
	
	this.calculate();
	
	return newRectangle;

}

/**
 * Draw a node, don't care about clearing
 */
Doek.Object.prototype.drawNode = function (index) {
	
	/**
	 * @type	{Doek.Node}
	 */
	var n = this.nodes.storage[index];
	n.draw();
}

/**
 * Draw the entire object
 */
Doek.Object.prototype.draw = function () {
	
	for (var key in this.nodes.storage) {
		this.drawNode(key);
	}
	
	this.drawn = true;
}

/**
 * Add a new style to the child, only if it does not exist yet
 * @param	{Doek.Style}	style
 */
Doek.Object.prototype.addStyle = function(style) {
	
	// Add the style to all the child nodes
	for (var index in this.nodes.storage) {
		this.nodes.storage[index].addStyle(style);
	}
}

/**
 * Apply a certain style to the child nodes
 */
Doek.Object.prototype.applyStyle = function (stylename) {
	
	// Apply the style to all the child nodes directly,
	// We also ask the function to NOT request a redraw,
	// we'll do that when we're finished
	for (var index in this.nodes.storage) {
		this.nodes.storage[index].applyStyle(stylename, false);
	}
	
	this.fire('requestredraw', this);
	
}