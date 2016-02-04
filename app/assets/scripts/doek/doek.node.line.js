Doek.Line = Doek.extend(Doek.Node, function(instructions, parentObject) {
		this.init(instructions, parentObject);
	});

Doek.Line.prototype._calculate = function() {
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
	
	// The position on the parent relative to the sx
	var pw = sx - dx;
	var ph = sy - dy;
	
	this.width = 1 + Math.abs(pw);
	this.height = 1 + Math.abs(ph);

	if (this.parentObject.tiled) {
		this.width += this.canvas.settings.tileSize;
		this.height += this.canvas.settings.tileSize;
	}
	
	if (dx < sx) {
		sx = sx - this.width;
	}
	
	if (dy < sy) {
		sy = sy - this.height;
	}

	this.position = new Doek.Position(this.canvas, sx, sy, 'abs');
}

Doek.Line.prototype._setBeginpoint = function(beginposition) {
	
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

Doek.Line.prototype._setEndpoint = function(endposition) {
	
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

Doek.Line.prototype._draw = function() {

	if (this.parentObject.tiled) this._idrawLineBlock();
	else this._idrawLine();

}

/**
 * Draw a line (tiled)
 */
Doek.Line.prototype._idrawLineBlock = function () {
	var t = this._idrawn[this.activeStyle.name];

	t.element = document.createElement('canvas');
	t.ctx = t.element.getContext('2d');
	
	t.element.setAttribute('width', this.width);
	t.element.setAttribute('height', this.height);
	
	this._iloc = {}
	
	var bp = new Doek.Position(this.canvas, this.instructions.sx, this.instructions.sy, 'map');
	var begin = {x: bp.tiled.sx, y: bp.tiled.sy}
	
	var ep = new Doek.Position(this.canvas, this.instructions.dx, this.instructions.dy, 'map');
	
	// Decrease end positions by one, otherwise it'll take the neighbouring line into account aswell
	var end = {x: ep.tiled.dx-1, y: ep.tiled.dy-1}
	
	var coordinates = Doek.getLineCoordinates(begin, end);
	
	var ctx = t.ctx;

	ctx.lineWidth = this.activeStyle.properties.lineWidth;
	ctx.strokeStyle = this.activeStyle.properties.strokeStyle;

	// Use strokestyle as fillstyle for blocked lines
	ctx.fillStyle = this.activeStyle.properties.strokeStyle;

	var size = this.canvas.settings.tileSize;
	var id = '';
	var count = 0;

	for (var key in coordinates) {
		
		var c = coordinates[key];
		var np = new Doek.Position(this.canvas, c.x, c.y, 'abs');
		
		var bp = this._getInternalPosition(np.tiled.sx, np.tiled.sy);
		
		id = bp.x + '-' + bp.y;
		
		// Keep a record of what we've drawn already
		if (this._iloc[id] === undefined) {
			this._iloc[id] = true;
			ctx.fillRect(bp.x,bp.y,size,size);
		}
		
	}
	
	// It has now been drawn internally
	this._idrawn[this.activeStyle.name]['drawn'] = true;

}

/**
 * Draw a simple line (not tiled)
 */
Doek.Line.prototype._idrawLine = function () {
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

Doek.Line.prototype._isInNode = function (position) {

	if (position === undefined) throw new Error('Tried to find non existing position');

	if (this.parentObject.tiled) {
		
		var bp = this._getInternalPosition(position.tiled.sx, position.tiled.sy);
		var id = bp.x + '-' + bp.y;
		if (this._iloc[id] !== undefined) return true;
		
	} else {
		return true;
	}
}