Elric.rooms = {}

/**
 * Object for storing doek variables
 */
Elric.doek = {}
Elric.doek.select = false; // The selected node
Elric.doek.mode = false;
Elric.doek.html = {}
Elric.doek.html.rooms = $('select[name="rooms"]');
Elric.doek.html.elements = $('select[name="elements"]');
Elric.doek.html.editElement = $('form#editElement');

/**
 * Select a room in the HTML select element
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    2012.12.28
 *
 * @param   {string}   id   The room id
 */
Elric.doek.selectRoom = function (id) {
	var $r = Elric.doek.html.rooms;
	var $e = Elric.doek.html.elements;
	
	$('option:selected', $r).removeAttr('selected');
	Elric.doek.selectElement(false);
	
	if (id) $('option[value="' + id + '"]', $r).attr('selected', true);
}

/**
 * Get the selected room from the HTML select
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    2012.12.29
 */
Elric.doek.getSelectedRoom = function () {
	var $r = Elric.doek.html.rooms;
	return $('option:selected', $r).val();
}

/**
 * Select a roomElement in the HTML select element
 * Should be called AFTER a selectRoom
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    2012.12.28
 *
 * @param   {string}   id   The roomElement id
 */
Elric.doek.selectElement = function (id) {
	var $e = Elric.doek.html.elements;
	
	$('option:selected', $e).removeAttr('selected');
	
	if (id) $('option[value="' + id + '"]', $e).attr('selected', true);
}

/**
 * A wrapper class function for Doek's canvas
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    2012.12.28
 *
 * @param   {string}   canvasId   The name of the canvas wrapper div
 */
Elric.View = function(canvasId) {
	
	var thisView = this;
	
	this.d = new Doek.Canvas(canvasId);
	this._gridObject = this.d.addGrid();
	
	// Enable tiled
	this.d.settings.tiled = true;
	
	this.layer = this.d.addLayer('main', 5);
}

/**
 * Add rooms to the Doek Canvas and the Elric object
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    2012.12.28
 *
 * @param   {array}   rooms   An array of rooms
 */
Elric.View.prototype.addRooms = function (rooms) {
	for (var i in rooms) {
		var room = rooms[i];
		
		if (Elric.rooms[room._id] === undefined) {
			Elric.rooms[room._id] = room;
			var er = Elric.rooms[room._id];
			er.roomObject = new Doek.Object(this.layer);
			er.roomObject.tiled = true;
			er.roomElements = {}
			
			this.layer.addObject(er.roomObject);
		}
		
	}
}

/**
 * Add room elements to the Doek Canvas and the Elric room object
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    2012.12.28
 *
 * @param   {array}   elements   An array of roomElements
 */
Elric.View.prototype.addElements = function (elements) {
	
	var style = new Doek.Style('ori');
	style.properties.strokeStyle = '#990000';
	
	var hoverStyle = new Doek.Style('hover');
	hoverStyle.properties.strokeStyle = '#009900';
	
	var selectStyle = new Doek.Style('select');
	selectStyle.properties.strokeStyle = '#000099';
	
	for (var i in elements) {
		var element = elements[i];
		
		if (Elric.rooms[element.room_id] !== undefined) {
			var er = Elric.rooms[element.room_id];
			er.roomElements[element._id] = element;
			var el = er.roomElements[element._id];
			
			var newWall = er.roomObject.addWall(el);
			
			newWall.addStyle(hoverStyle);
			newWall.addStyle(selectStyle);
		}
	}
}

/**
 * Function that fires when the buttonGroup changes,
 * sets the Elric doek mode & fires certain actions
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    2012.12.28
 *
 * @param   {string}   newMode   The name of the new mode
 */
Elric.buttonChange = function (newMode) {
	Elric.doek.mode = newMode;
	
	if (newMode == 'changesize') {
		ev.d.setAction('changeSize');
	} else {
		ev.d.setAction(false);
	}
}

/**
 * Only create a new Doek if the wrapper div exists
 */
if ($('#map').length) {
	var e = new Elric.View('map');
	var ev = e;
	
	if (rooms !== undefined) {
		ev.addRooms(rooms);
	}
	
	if (elements !== undefined) {
		ev.addElements(elements);
	}
}