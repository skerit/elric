Doek.Rectangle = Doek.extend(Doek.Node, function(instructions, parentObject) {
	this.init(instructions, parentObject);
});

Doek.Rectangle.prototype._calculate = function() {
	
	this.width = 0;
	this.height = 0;

	// Instructions are always map based
	var sx = this.instructions.sx;
	var sy = this.instructions.sy;
	var dx = this.instructions.dx;
	var dy = this.instructions.dy;
	
	var bp = new Doek.Position(this.canvas, sx, sy, 'map');
	var ep = new Doek.Position(this.canvas, dx, dy, 'map');
	
	// Convert the map based instructions
	if (this.parentObject.tiled) {
		sx = bp.tiled.sx;
		sy = bp.tiled.sy;
		dx = ep.tiled.dx;
		dy = ep.tiled.dy;
	} else {
		sx = bp.absX;
		sy = bp.absY;
		dx = ep.absX;
		dy = ep.absY;
	}
	
	if (dx <= sx) {
		sx = ep.tiled.sx;
		dx = bp.tiled.dx;
	}
	
	if (dy <= sy) {
		sy = ep.tiled.sy;
		dy = bp.tiled.dy;
	}
	
	// The position on the parent relative to the sx
	var pw = sx - dx;
	var ph = sy - dy;
	
	// The width and height are at least 1 pixel
	this.width = 1 + Math.abs(pw);
	this.height = 1 + Math.abs(ph);
	
	this.position = new Doek.Position(this.canvas, sx, sy, 'abs');
}

Doek.Rectangle.prototype._setBeginpoint = function(beginposition) {
		
	// If the object is tiled, take clean coordinates
	if (this.parentObject.tiled) {
		var size = beginposition.tiled.tileSize;
		this.instructions.sx = beginposition.tiled.mapX * size;
		this.instructions.sy = beginposition.tiled.mapY * size;
	} else {
		this.instructions.sx = beginposition.mapX;
		this.instructions.sy = beginposition.mapY;
	}
}

Doek.Rectangle.prototype._setEndpoint = function(endposition) {
		
	// If the object is tiled, take clean coordinates
	if (this.parentObject.tiled) {
		var size = endposition.tiled.tileSize;
		this.instructions.dx = endposition.tiled.mapX * size;
		this.instructions.dy = endposition.tiled.mapY * size;
	} else {	
		this.instructions.dx = endposition.mapX;
		this.instructions.dy = endposition.mapY;
	}
}

Doek.Rectangle.prototype._draw = function() {

	if (this.parentObject.tiled) this._idrawRectangleBlock();
	else this._idrawRectangle();

}

Doek.Rectangle.prototype._idrawRectangleBlock = function () {
	
	// Get a reference tot he active style's object
	var t = this._idrawn[this.activeStyle.name];

	// Create necessary elements
	t.element = document.createElement('canvas');
	t.ctx = t.element.getContext('2d');
	
	// Set the dimensions
	t.element.setAttribute('width', this.width);
	t.element.setAttribute('height', this.height);
	
	// Set context & style stuff
	var ctx = t.ctx;
	ctx.lineWidth = this.activeStyle.properties.lineWidth;
	ctx.strokeStyle = this.activeStyle.properties.strokeStyle;
	ctx.fillStyle = this.activeStyle.properties.strokeStyle;
	
	var size = this.canvas.settings.tileSize;
	var id = '';
	var count = 0;
	var positionDrawn = {}
	
	// Get the begin position
	var bp = new Doek.Position(this.canvas, this.instructions.sx, this.instructions.sy, 'map');
	
	// Get the end position
	var ep = new Doek.Position(this.canvas, this.instructions.dx, this.instructions.dy, 'map');
	
	// Store begin & end in their own varq
	var begin = {x: bp.tiled.sx, y: bp.tiled.sy}
	
	// Decrease end positions by one, otherwise it'll take the neighbouring line into account aswell
	var end = {x: ep.tiled.dx-1, y: ep.tiled.dy-1}
	
	// Take negative values into account
	if (bp.tiled.sx >= ep.tiled.dx) {
		begin.x = ep.tiled.sx;
		end.x = bp.tiled.dx;
	}
	
	if (bp.tiled.sy >= ep.tiled.dy) {
		begin.y = ep.tiled.sy;
		end.y = bp.tiled.dy;
	}
	
	// For every x
	for (var x = begin.x; x < end.x; x += size) {
		
		// For every y
		for (var y = begin.y; y < end.y; y += size) {
			
			// Get the position of this specific block
			var blockPos = new Doek.Position(this.canvas, x, y, 'abs');
			
			// Convert the absolute coordinates to internal positions
			var internalPos = this._getInternalPosition(blockPos.tiled.sx, blockPos.tiled.sy);
			
			id = x + '-' + y;
			
			// Keep a record of what we've drawn already
			if (positionDrawn[id] === undefined) {
				positionDrawn[id] = true;
				ctx.fillRect(internalPos.x, internalPos.y, size, size);
			}
		}
		
	}
	
	// It has now been drawn internally
	t.drawn = true;

}

// @todo: This is still the code for drawing a simple line
Doek.Rectangle.prototype._idrawRectangle = function () {
	var t = this._idrawn[this.activeStyle.name];

	t.element = document.createElement('canvas');
	
	t.ctx = t.element.getContext('2d');
	
	t.element.setAttribute('width', this.width);
	t.element.setAttribute('height', this.height);
	
	var ctx = t.ctx;
	
	ctx.lineWidth = this.activeStyle.properties.lineWidth;
	ctx.strokeStyle = this.activeStyle.properties.strokeStyle;
	ctx.beginPath();
	
	var ip = this._getILinePosition();
	
	ctx.moveTo(ip.sx, ip.sy);
	ctx.lineTo(ip.dx, ip.dy);
	ctx.stroke();
	
	// It has now been drawn internally
	this._idrawn[this.activeStyle.name]['drawn'] = true;
}

Doek.Rectangle.prototype._isInNode = function (position) {
	return true;
}