/**
 * This javascript file adds new Doek nodes,
 * especially created for Elric
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    2012.12.28
 */

/**
 * Create a new Doek Node class: Wall
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    2012.12.28
 *
 * @param    {object}       instructions   How to draw this thing
 * @param    {Doek.Object}  parentObject   The parent object
 * @param    {object}       roomElement    The raw roomElement
 */
Doek.Wall = Doek.extend(Doek.Line, function(instructions, parentObject, roomElement) {
	
	this.roomElement = roomElement;
	
	// Call the init function, the parent's constructor
	this.init(instructions, parentObject);
	
	var thisWall = this;
	
	var style = new Doek.Style('ori');
	style.properties.strokeStyle = '#990000';
	style.weight = 100;
	
	var hoverStyle = new Doek.Style('hover');
	hoverStyle.properties.strokeStyle = '#009900';
	hoverStyle.weight = 1000;
	
	var selectStyle = new Doek.Style('select');
	selectStyle.properties.strokeStyle = '#000099';
	
	this.addStyle(hoverStyle);
	this.addStyle(selectStyle);
	
	// Add some events
	this.event.on('mouseMove', function(caller, payload){
		this.activateStyle('hover');
	});
	
	this.event.on('mouseOut', function(caller, payload){
		this.deactivateStyle('hover');
	});
	
	this.event.on('mouseclick', function(caller, payload){
		
		if (Elric.doek.mode == 'select') {
			this.fire('select', this, payload);
		}
	});
	
	this.event.on('select', function(caller, payload){
		this.activateStyle('select');
		
		// Select the items in the html select element
		Elric.doek.selectRoom(this.roomElement.room_id);
		Elric.doek.selectElement(this.roomElement._id);
		
		if (Elric.doek.selectedNode) {
			var oldSelect = Elric.doek.selectedNode;
			oldSelect.fire('unselect', this, payload);
		}
		
		// Set the new selected node
		Elric.doek.selectedNode = this;
		
	});
	
	this.event.on('unselect', function(caller, payload){
		this.deactivateStyle('select');
	});
	
});

/**
 * Extend the doek object prototype
 * Add a wall node to this object
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    2012.12.28
 *
 * @param	{Object}	roomElement
 * @returns	{Doek.Node}
 */
Doek.Object.prototype.addWall = function(roomElement) {
	
	var el = roomElement;
	var wallStyle = new Doek.Style('wall');
	
	// Colores del mundo: nepal touch
	wallStyle.properties.strokeStyle = '#BBCFCC';
	
	var selectStyle = new Doek.Style('select');
	selectStyle.properties.strokeStyle = '#BBCCEE';
	selectStyle.weight = 10;
	
	var newWall = new Doek.Wall({type: 'line',
						sx: el.x, sy: el.y,
						dx: el.dx, dy: el.dy,
						style: wallStyle}, this, el);
	
	newWall.addStyle(selectStyle);
	
	var index = this.nodes.push(newWall);
	
	el.node = newWall;
	
	this.calculate();
	
	return newWall;
}