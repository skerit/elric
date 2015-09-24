var Doek = {}

/**
 * A position object
 * @param	{Doek.Canvas}	canvas		The capturing element
 * @param	{integer}		x			The X position
 * @param	{integer}		y			The Y position
 * @param	{string}		type		The type of position given (abs, map, canvas, ...)
 * @param	{boolean}		fromTiled
 */
Doek.Position = function(canvas, x, y, type, fromTiled) {
	
	if (type === undefined) type = 'abs';
	
	// Get tiled settings
	var tiled = canvas.settings.tiled;
	var size = canvas.settings.tileSize;
	
	if (fromTiled) {
		x = x * size;
		y = y * size;
	}
	
	this.tiled = {
		mapX: false,
		mapY: false,
		canvasX: false,
		canvasY: false,
		tileSize: size
	}
	
	// Get starting positions
	this.rx = canvas.position.x;
	this.ry = canvas.position.y;
	
	this.absX = false;
	this.absY = false;
	
	this.mapX = false;
	this.mapY = false;
	
	switch (type) {
		
		case 'abs':
			this.absX = x;
			this.absY = y;
			
			this.mapX = x - this.rx;
			this.mapY = y - this.ry;
			break;
		
		case 'map':
			this.absX = x + this.rx;
			this.absY = y + this.ry;
			
			this.mapX = x;
			this.mapY = y;
			break;
	}

	if (tiled) {
		
		// Beware of using the tiled canvas coordinates
		// They can be incorrect when the map is moved
		// more or less pixels then a single block
		this.tiled.canvasX = ~~(this.absX / size);
		this.tiled.canvasY = ~~(this.absY / size);
		
		this.tiled.mapX = ~~(this.mapX / size);
		this.tiled.mapY = ~~(this.mapY / size);
		
		// The leftover position of the map on the canvas
		this.tiled.modx = this.rx % size;
		this.tiled.mody = this.ry % size;
		
		var tx = ~~((this.absX - this.tiled.modx) / size);
		var ty = ~~((this.absY - this.tiled.mody) / size);
		
		// The beginning of this position
		this.tiled.sx = (tx * size) + this.tiled.modx;
		this.tiled.sy = (ty * size) + this.tiled.mody;
		
		// The ending of this tiled position
		this.tiled.dx = (this.tiled.sx + size) + this.tiled.modx;
		this.tiled.dy = (this.tiled.sy + size) + this.tiled.mody;
		
	}
	
}

Doek.Position.prototype.helper = function() {
	
}

/**
 * An array like object
 */
Doek.Collection = function() {
	
	this.storage = {};
	this._named = {};
	this.index = 0;
	this.length = 0;
	
}

/**
 * Push an object in the collection, return its id
 */
Doek.Collection.prototype.push = function (obj) {
	
	var thisCollection = this;
	
	var useId = 0;
	var overrideId = false;
	
	if (obj._DCT !== undefined) {
		if (obj.id !== undefined) overrideId = true;
	}
	
	if (overrideId) {
		useId = obj.id;
	} else {
		// Increase the counter by one
		this.index++;
		this.length++;
		useId = this.index;
	}
	
	// Remove the previous value if the id already exists
	if (this.storage[useId] !== undefined) this.storage[useId]._remove();
	
	// Add the object to the storage container
	this.storage[useId] = obj;
	
	// Set the index in the obj
	obj._collectionIndex = useId;
	
	// If the object has a name, store it in the named obj too
	if (obj.name !== undefined) this._named[obj.name.toLowerCase()] = obj;
	
	// Add the remove array, for ever collection this object is added to
	// a remove function will be created
	obj._removeFunctions = [];
	
	var newRemoveFunction = function(id) {return function(){thisCollection.remove(id)}}(useId);
	
	// Set the obj remove function
	obj._removeFunctions.push(newRemoveFunction);
	
	/**
	 * Remove this object from every collection is has been added to
	 */
	obj._remove = function(passedObj) {
		return function(options) {
			
			if (options !== undefined) {
				if (options.redraw) passedObj.fire('requestRedraw');
			}
			
			for (var i in passedObj._removeFunctions) {
				passedObj._removeFunctions[i]();
			}
		};
	}(obj)
	
	// Return the id
	return useId;
}

/**
 * Add a value pair as an object
 * @param	{string}	name		The name of the value
 * @param	{any}		value		Any value
 * @param	{id}		id			Optional numeric id to overwrite
 */
Doek.Collection.prototype.pushPair = function (name, value, id) {
	
	var obj = {name: name, value: value, _DCT: 'pushPair'}
	
	if (id !== undefined) obj.id = id;
	
	return this.push(obj);
}

/**
 * Get something either by its numeric id or string
 */
Doek.Collection.prototype.get = function (identifier) {
	
	// getByName if it's a string
	if (isNaN(identifier)) {
		return this.getByName(identifier);
	} else {
		return this.getById(identifier);
	}
	
}

/**
 * Get an object by its id
 * @returns	{object}
 */
Doek.Collection.prototype.getById = function (id) {

	if (this.storage[id] !== undefined) return this.storage[id];
	else return false;
	
}

/**
 * Get an object by name
 * @returns	{object}
 */
Doek.Collection.prototype.getByName = function (name) {
	
	// Make it case insensitive
	if (typeof name == 'string') name = name.toLowerCase();

	if (this._named[name] !== undefined) return this._named[name];
	else return false;
	
}

/**
 * Delete an object from the collection
 */
Doek.Collection.prototype.remove = function (index) {
	
	if (this.storage[index] !== undefined) {
		
		// Don't forget to remove it from the named object as well, otherwise it'll keep existing
		if (this.storage[index].name) {
			var name = this.storage[index].name.toLowerCase();
			delete this._named[name];
		}
		
		delete this.storage[index];
		this.length--;	
	}
	
}

/**
 * The Style class
 */
Doek.Style = function(stylename) {
	
	this.name = stylename;
	this.weight = 1;
	
	this.properties = {};
	this.properties.fillStyle = '#ffd700';
	this.properties.strokeStyle = '#FF0000';
	this.properties.lineWidth = 1;
	
}

/**
 * Copy over another style, except for null values
 * @param	{Doek.Style}	style
 */
Doek.Style.prototype.merge = function (style) {
	
	// Symlink to the given properties
	var props = style.properties;
	
	for(var key in props) {
		if (props[key] !== null) {
			this.properties[key] = props[key];
		}
	}
	
	this.weight = style.weight;
	
}

/**
 * Make a copy of an object, so we can use it regulary and not by reference
 * @param    obj     {object}    // The object you want
 * @returns  {object}            // The same object, but modifyable
 */
Doek.deepCopy = function(obj) {
    if (typeof obj !== "object" || obj == null) return obj;

    var retVal = new obj.constructor();
    for (var key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        retVal[key] = Doek.deepCopy(obj[key]);
    }
    return retVal;
}

/**
 * Bresenham algorithm
 */
Doek.getLineCoordinates = function(begin, end){

	var x0 = begin.x;
	var y0 = begin.y;
	var x1 = end.x;
	var y1 = end.y;
	
	var dx = Math.abs(x1-x0);
	var dy = Math.abs(y1-y0);
	var sx = (x0 < x1) ? 1 : -1;
	var sy = (y0 < y1) ? 1 : -1;
	var err = dx-dy;
	
	var coordinates = [];
	
	while(true){
	
	  // Do what you need to for this
	  coordinates.push({x: x0, y: y0});
	
	  if ((x0==x1) && (y0==y1)) break;
	  var e2 = 2*err;
	  if (e2>-dy){
		err -= dy;
		x0  += sx;
	  }
	  if (e2 < dx){
		err += dx;
		y0  += sy;
	  }
	}
	
	return coordinates;
}

/**
 * Extend function
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    0.0.1
 * @version  1.0.0
 *
 * @param    {Function}   parent
 * @param    {Function}   child
 *
 * @return   {Function}
 */
Doek.extend = function extend(parent, child) {
	child.prototype = Object.create(parent.prototype);
	return child;
};