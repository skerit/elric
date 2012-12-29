/**
 * This javascript file adds new Doek actions,
 * especially created for Elric
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    2012.12.28
 */

/**
 * Create an action to change the size of a wall
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    2012.12.28
 */
var changeSize = new Doek.Action('changeSize');

/**
 * Change starting- & endpositions of something
 * when moving the mouse while clicking down
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    2012.12.28
 */
changeSize.on('mousemoveDown', function (caller, payload) {
	if (payload.originnode == Elric.doek.selectedNode) {
		var sp = payload.dragstartposition; // Start position
		var cp = payload.position; // Current position
		var np = payload.originnode.position; // Node position
		var node = payload.originnode;
		
		// Click positions inside the 
		var cx = sp.absX - np.absX;
		var cy = sp.absY - np.absY;
		
		if (!changeSize.mmstuf) {
			changeSize.mmstuf = {}
			
			if (node.width > node.height) {
				changeSize.mmstuf.left = cx;
				changeSize.mmstuf.right = node.width - cx;
			} else {
				changeSize.mmstuf.left = cy;
				changeSize.mmstuf.right = node.height - cy;
			}
		}
		
		var left = changeSize.mmstuf.left;
		var right = changeSize.mmstuf.right;
		
		// We clicked the left side
		if (left < 10) {
			node.setBeginpoint(cp);
		} else if (right < 20) { // Right side
      node.setEndpoint(cp);
		}
	}
});

/**
 * Reset some things when we release the mouse
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    2012.12.28
 */
changeSize.on('mouseup', function (caller, payload) {
	// Reset our store
	changeSize.mmstuf = false;
});

// Create an addLine action
var addLine = new Doek.Action('addLine');

addLine.on('init', function (caller, payload) {
	this.storage.layer = e.layer;
});

addLine.on('mouseupFirst', function(caller, payload) {

	this.storage.object = new Doek.Object(this.storage.layer);
	this.storage.object.tiled = true;
	
	var style = new Doek.Style('ori');
	style.properties.strokeStyle = '#DD0000';
	style.properties.lineWidth = 1;
	
	var p = payload.startposition;
	
	var myline = this.storage.object.addLine(p.absX, p.absY, p.absX, p.absY, style);
	
	var hstyle = new Doek.Style('hover');
	hstyle.properties.strokeStyle = '#009910';
	this.storage.object.addStyle(hstyle);
	
	this.storage.line = myline;
	this.storage.myobject = this.storage.layer.addObject(this.storage.object);
});

addLine.on('mousemoveFirstClick', function (caller, payload) {
	
	var pos = payload.position;
	this.storage.line.setEndpoint(pos);
	
	//this.storage.myobject

});

/**
 * If e is defined (which is our canvas view from
 * our Elric wrapper class) do some things...
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    2012.12.28
 */
if (e) {
	
	// Register our newly made actions
	e.d.registerAction(addLine);
	e.d.registerAction(changeSize);
	
	// Save our rooms & elements when clicking the save button
	$('#savemap').click(function(e) {
		e.preventDefault();
		
		var elUpdate = {}
		
		for (var i in elements) {
			var el = elements[i];
			elUpdate[el._id] = {
				room_id: el.room_id,
				x: el.node.instructions.sx,
				y: el.node.instructions.sy,
				dx: el.node.instructions.dx,
				dy: el.node.instructions.dy
			}
		}
		
		$.post('/roomelement/updates', elUpdate, function(data){
			// Catch errors in here
			for (var i in data) {
				if (data[i].err) {
					// @todo: Do something with this error
				}
			}
		});
		
	});
}