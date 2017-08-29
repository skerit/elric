/**
 * This javascript file adds new Doek nodes,
 * especially created for Elric
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    2012.12.28
 */

/**
 * Basic node events
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    2013.01.05
 *
 */
Doek.basicNodeEvents = function basicNodeEvents(node) {

	var floorplan = node.canvas.floorplan;

	// Style events
	node.on('mouseMove', function(caller, payload){
		this.activateStyle('hover');
	});

	node.on('mouseOut', function(caller, payload){
		this.deactivateStyle('hover');
	});

	node.on('mouseclick', function(caller, payload){
		if (floorplan.mode == 'select') {
			this.fire('select', this, payload);
		}
	});

	node.on('select', function(caller, payload){

		// Don't select the same item twice
		if (floorplan.selected == this) {
			return;
		}

		// Activate the select style
		this.activateStyle('select');

		// Select the items in the html select element
		//Elric.doek.selectRoom(this.roomElement.room_id);
		//Elric.doek.selectElement(this.roomElement._id);

		if (floorplan.selected) {
			var oldSelect = floorplan.selected;
			oldSelect.fire('unselect', this, payload);
		}

		// Set the new selected node
		floorplan.selected = this;

		this.fillEditForm(true);
	});

	node.on('propertychange', function(caller, payload){
		if (this.fillEditForm !== undefined) {
			if (floorplan.selected == this) this.fillEditForm();
		}
	});

	node.on('unselect', function(caller, payload){
		this.deactivateStyle('select');
	});
};

/**
 * Extendable functions
 */
Doek.Line.prototype.fillEditForm = function fillEditForm(selected) {
	this._fillEditForm(selected);
};

Doek.Rectangle.prototype.fillEditForm = function fillEditForm(selected) {
	this._fillEditForm(selected);
};

/**
 * Fill the sidebar of the floorplan
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.0.1
 * @version  1.0.0
 *
 * @param    {Boolean}   selected   If this element was selected (true) or moved (false)
 */
Doek.Node.prototype._fillEditForm = function _fillEditForm(selected) {

	var that = this,
	    floorplan,
	    html,
	    el,
	    i,
	    n;

	if (!this.elric_node) {
		return;
	}

	floorplan = this.canvas.floorplan;
	html = floorplan.html_elements;
	n = this.roomElement;

	// Only set these values on initial select
	if (selected && html._id) {
		html._id.value = n._id || '';
		html.name.value = n.name || '';

		$('option:selected', html.room).removeAttr('selected');
		$('option[value="' + n.room_id + '"]', html.room).attr('selected', 'selected');

		html.element_type.value = n.element_type || '';

		// @todo: disable?
		html.external_id.value = '';
	}

	// We assume that, since there is no external id, nothing is set.
	if (!html.external_id) {
		return;
	}

	// Remove options of previous selected element
	for (i = 0; i < html.external_id.children.length; i++) {
		el = html.external_id.children[i];

		if (el.value) {
			el.remove();
		}
	}

	console.log('Getting external ids?')

	// Get the external ids for this type
	alchemy.submit('element-externalids', {element_type: this.elricType}, function gotTypes(err, data) {

		var entry,
		    key;

		if (err) {
			return console.error(err);
		}

		if (data) {
			for (key in data) {
				entry = data[key];

				html.external_id.insertAdjacentHTML('beforeend', '<option value="' + key + '">' + entry + '</option>');
			}
		}

		console.log('Have external element?', that.roomElement.type_external_id)

		if (that.roomElement.type_external_id) {
			html.external_id.value = that.roomElement.type_external_id;
		}
	});

	html.x.value = this.instructions.sx;
	html.y.value = this.instructions.sy;

	html.dx.value = this.instructions.dx;
	html.dy.value = this.instructions.dy;

	html.width.value = this.instructions.dx - this.instructions.sx + 10;
	html.height.value = this.instructions.dy - this.instructions.sy + 10;
};

/**
 * Set elric_node to true, so the sidebar edit form will be filled
 * @type   {Boolean}
 */
Doek.Line.prototype.elric_node = true;

/**
 * Set elric_node to true, so the sidebar edit form will be filled
 * @type   {Boolean}
 */
Doek.Rectangle.prototype.elric_node = true;

/**
 * Create a new Doek Node class: Wall
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    2012.12.28
 *
 * @param    {object}       instructions   How to draw this thing
 * @param    {Doek.Object}  parentObject   The parent object
 * @param    {object}       roomElement    The raw roomElement
 */
Doek.Wall = Doek.extend(Doek.Line, function Wall(instructions, parentObject, roomElement) {

	var thisWall = this,
	    element_types,
	    element_type,
	    selectStyle,
	    hoverStyle,
	    style;

	console.log('Creating wall', this);

	this.preInit();

	// Get the available element types
	element_types = parentObject.canvas.floorplan.element_types;

	this.roomElement = roomElement;
	this.elricType = 'wall';

	if (instructions.override) {
		this.elricType = instructions.override;
	}

	instructions.type = 'line';

	element_type = element_types[this.elricType];

	if (!element_type) {
		throw new Error('Unable to find element type "' + this.elricType + '"');
	}

	style = new Doek.Style('ori');
	style.properties.strokeStyle = element_type.colour_original;
	style.weight = 100;

	hoverStyle = new Doek.Style('hover');
	hoverStyle.properties.strokeStyle = element_type.colour_hover;
	hoverStyle.weight = 1000;

	selectStyle = new Doek.Style('select');
	selectStyle.properties.strokeStyle = element_type.colour_select;
	selectStyle.weight = 10000;

	this.addStyle(style);
	this.addStyle(hoverStyle);
	this.addStyle(selectStyle);

	// Call the init function, the parent's constructor
	this.init(instructions, parentObject);

	Doek.basicNodeEvents(this);
});

/**
 * Create a new Doek Node class: Camera
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    2013.01.04
 *
 * @param    {object}       instructions   How to draw this thing
 * @param    {Doek.Object}  parentObject   The parent object
 * @param    {object}       roomElement    The raw roomElement
 */
Doek.Camera = Doek.extend(Doek.Rectangle, function Camera(instructions, parentObject, roomElement) {
	
	this.preInit();
	
	this.roomElement = roomElement;
	this.elricType = 'camera';
	
	instructions.type = 'rectangle';
	
	var thisWall = this;
	
	var style = new Doek.Style('ori');
	style.properties.strokeStyle = Elric.exposed.elementTypes.camera.colour_original;
	style.weight = 100;
	
	var hoverStyle = new Doek.Style('hover');
	hoverStyle.properties.strokeStyle = Elric.exposed.elementTypes.camera.colour_hover;
	hoverStyle.weight = 1000;
	
	var selectStyle = new Doek.Style('select');
	selectStyle.properties.strokeStyle = Elric.exposed.elementTypes.camera.colour_select;
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
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    2013.01.05
 */
Doek.Camera.prototype._fillEditForm = function() {
	var floorplan = this.canvas.floorplan,
	    html = floorplan.html_elements,
	    n = this.roomElement;

	html._id.value = n._id;
	html.name.value = n.name;

	// @todo: Set select correctly
	html.room.value = n.room_id;

	html.element_type.value = n.element_type;

	// @todo: disable?
	html.external_id.value = '';

	html.x.value = this.instructions.sx;
	html.y.value = this.instructions.sy;

	html.dx.value = this.instructions.dx;
	html.dy.value = this.instructions.dy;
}

/**
 * Extend the doek object prototype
 * Add a default node to this object
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    2013.01.06
 *
 * @param    {Object}    room_element
 * @param    {string}    type_name
 * @returns  {Doek.Node}
 */
Doek.Object.prototype.addNewType = function addNewType(room_element, type_name) {

	var floorplan = this.canvas.floorplan,
	    dimensions,
	    class_name,
	    type_class,
	    new_node,
	    index,
	    data;

	if (room_element.elementType) {
		dimensions = room_element.elementType.dimensions;
	} else {
		console.warn('elementType property of', type_name, 'is not set! Defaulting to 2 dimensions');
		dimensions = 2;
	}

	class_name = String(type_name).classify();

	data = {
		override: type_name,
		sx: room_element.x,
		sy: room_element.y,
		dx: room_element.dx,
		dy: room_element.dy
	};

	if (data.sx == null) {
		if (dimensions == 0) {
			data.sx = data.sy = data.dx = data.dy = 300;
		} else if (dimensions == 1) {
			data.sx = data.dx = 10;
			data.sy = 20;
			data.dy = 40;
		} else if (dimensions == 2) {
			data.sx = 50;
			data.sy = 50;
			data.dx = 100;
			data.dy = 100;
		}
	}

	// Get the type class
	if (Doek[class_name]) {
		type_class = Doek[class_name];
	} else {
		type_class = Doek.Wall;
	}

	new_node = new type_class(data, this, room_element);
	index = this.nodes.push(new_node);

	room_element.node = new_node;

	// Recalculate this object
	this.calculate();

	return new_node;
};

/**
 * Extend the doek object prototype
 * Add a camera node to this object
 *
 * @author   Jelle De Loecker <jelle@develry.be>
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
