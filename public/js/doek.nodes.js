/**
 * This javascript file adds new Doek nodes,
 * especially created for Elric
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    2012.12.28
 */

/**
 * Basic node events
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    2013.01.05
 *
 */
Doek.basicNodeEvents = function (node) {
	
	// Style events
	node.on('mouseMove', function(caller, payload){
		this.activateStyle('hover');
	});
	
	node.on('mouseOut', function(caller, payload){
		this.deactivateStyle('hover');
	});
	
	node.on('mouseclick', function(caller, payload){
		if (Elric.doek.mode == 'select') {
			this.fire('select', this, payload);
		}
	});
	
	node.on('select', function(caller, payload){
		
		// Activate the select style
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
		
		// Show the edit element form
		var $ef = Elric.doek.html.editElement;
		$ef.parent('div').show();
		
		this.fillEditForm();
	});
	
	node.on('propertychange', function(caller, payload){
		if (this.fillEditForm !== undefined) {
			if (Elric.doek.selectedNode == this) this.fillEditForm();
		}
	});
	
	node.on('unselect', function(caller, payload){
		this.deactivateStyle('select');
		
		var $ef = Elric.doek.html.editElement;
		$ef.parent('div').hide();
	});
}

Doek.fillEditForm = function() {
	var $ef = Elric.doek.html.editElement;
	
	// Unhide hidden elements
	$(':hidden', $ef).show();
}

/**
 * Extendable functions
 */
Doek.Line.prototype.fillEditForm = function() {
	Doek.fillEditForm();
	this._fillEditForm();
}

Doek.Rectangle.prototype.fillEditForm = function() {
	Doek.fillEditForm();
	this._fillEditForm();
}

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
	
	this.preInit();
	
	this.roomElement = roomElement;
	this.elricType = 'wall';
	
	if (instructions.override) this.elricType = instructions.override;
	
	instructions.type = 'line';
	
	var thisWall = this;
	
	var style = new Doek.Style('ori');
	style.properties.strokeStyle = Elric.exposed.elementTypes[this.elricType].colourOri;
	style.weight = 100;
	
	var hoverStyle = new Doek.Style('hover');
	hoverStyle.properties.strokeStyle = Elric.exposed.elementTypes[this.elricType].colourHover;
	hoverStyle.weight = 1000;
	
	var selectStyle = new Doek.Style('select');
	selectStyle.properties.strokeStyle = Elric.exposed.elementTypes[this.elricType].colourSelect;
	selectStyle.weight = 10000;
	
	this.addStyle(style);
	this.addStyle(hoverStyle);
	this.addStyle(selectStyle);
	
	// Call the init function, the parent's constructor
	this.init(instructions, parentObject);
	
	Doek.basicNodeEvents(this);
	
});

/**
 * Extended function to fill the doek edit form
 * Wall type
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    2012.12.29
 */
Doek.Wall.prototype._fillEditForm = function() {
	var $ef = Elric.doek.html.editElement;
	var n = this.roomElement;
	
	$('[name="_id"]', $ef).val(n._id);
	$('[name="name"]', $ef).val(n.name);
	$('[name="room_id"]', $ef).val(n.room_id);
	$('[name="element_type"]', $ef).val(n.element_type);
	$('[name="type_external_id"]', $ef).hide();
	$('[name="x"]', $ef).val(this.instructions.sx);
	$('[name="y"]', $ef).val(this.instructions.sy);
	$('[name="dx"]', $ef).val(this.instructions.dx);
	$('[name="dy"]', $ef).val(this.instructions.dy);
}

/**
 * Create a new Doek Node class: Camera
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    2013.01.04
 *
 * @param    {object}       instructions   How to draw this thing
 * @param    {Doek.Object}  parentObject   The parent object
 * @param    {object}       roomElement    The raw roomElement
 */
Doek.Camera = Doek.extend(Doek.Rectangle, function(instructions, parentObject, roomElement) {
	
	this.preInit();
	
	this.roomElement = roomElement;
	this.elricType = 'camera';
	
	instructions.type = 'rectangle';
	
	var thisWall = this;
	
	var style = new Doek.Style('ori');
	style.properties.strokeStyle = Elric.exposed.elementTypes.camera.colourOri;
	style.weight = 100;
	
	var hoverStyle = new Doek.Style('hover');
	hoverStyle.properties.strokeStyle = Elric.exposed.elementTypes.camera.colourHover;
	hoverStyle.weight = 1000;
	
	var selectStyle = new Doek.Style('select');
	selectStyle.properties.strokeStyle = Elric.exposed.elementTypes.camera.colourSelect;
	selectStyle.weight = 10000;
	
	this.addStyle(style);
	this.addStyle(hoverStyle);
	this.addStyle(selectStyle);
	
	// Call the init function, the parent's constructor
	this.init(instructions, parentObject);
	
	Doek.basicNodeEvents(this);
	
});

/**
 * Extended function to fill the doek edit form
 * Camera type
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    2013.01.05
 */
Doek.Camera.prototype._fillEditForm = function() {
	var $ef = Elric.doek.html.editElement;
	var n = this.roomElement;
	
	$('[name="_id"]', $ef).val(n._id);
	$('[name="name"]', $ef).val(n.name);
	$('[name="room_id"]', $ef).val(n.room_id);
	$('[name="element_type"]', $ef).val(n.element_type);
	$('[name="type_external_id"]', $ef).val(n.type_external_id);
	$('[name="x"]', $ef).val(this.instructions.sx);
	$('[name="y"]', $ef).val(this.instructions.sy);
	$('[name="dx"]', $ef).val(this.instructions.dx);
	$('[name="dy"]', $ef).val(this.instructions.dy);
	/* We should hide these last 2, but that causes validation problems
	$('[name="dx"]', $ef).hide();
	$('[name="dx"]', $ef).siblings().hide(); // Hide prepended stuff
	$('[name="dy"]', $ef).hide();
	$('[name="dy"]', $ef).siblings().hide(); // Hide prepended stuff
	*/
}

/**
 * Extend the doek object prototype
 * Add a default node to this object
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    2013.01.06
 *
 * @param	   {Object}	   roomElement
 * @param    {string}    type
 * @returns	 {Doek.Node}
 */
Doek.Object.prototype.addDefault = function(roomElement, type) {
	var el = roomElement;

	var newWall = new Doek.Wall({
		        override: type,
						sx: el.x, sy: el.y,
						dx: el.dx, dy: el.dy}, this, el);
	
	var index = this.nodes.push(newWall);
	
	el.node = newWall;
	
	this.calculate();
	
	return newWall;
}
/**
 * Extend the doek object prototype
 * Add a camera node to this object
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    2013.01.04
 *
 * @param	   {Object}	roomElement
 * @returns	 {Doek.Node}
 */
Doek.Object.prototype.addCamera = function(roomElement) {
	var el = roomElement;

	var newCamera = new Doek.Camera({
						sx: el.x, sy: el.y,
						dx: el.x+1, dy: el.y+1}, this, el);
	
	var index = this.nodes.push(newCamera);
	
	el.node = newCamera;
	
	this.calculate();
	
	return newCamera;
}
