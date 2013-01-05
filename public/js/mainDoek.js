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
Elric.doek.etf = {} // Element Type Functions

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
	
	this.layer = this.d.addLayer('main', 10);
	this.floorLayer = this.d.addLayer('floor', 4);
	
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
	
	var floorStyle = new Doek.Style('floor');
	floorStyle.properties.strokeStyle = '#F9F9F9';
	
	for (var i in rooms) {
		var room = rooms[i];
		
		if (Elric.rooms[room._id] === undefined) {
			Elric.rooms[room._id] = room;
			var er = Elric.rooms[room._id];
			er.roomElements = {}
			
			er.roomObject = new Doek.Object(this.layer);
			er.roomObject.tiled = true;
			this.layer.addObject(er.roomObject);
			
			er.roomObject.floorObject = new Doek.Object(this.floorLayer);
			var fo = er.roomObject.floorObject;
			fo.tiled = true;
			this.floorLayer.addObject(fo);
			
			er.roomObject.floorNode = fo.addRectangle(er.roomObject.x, er.roomObject.y, er.roomObject.dx, er.roomObject.dy, floorStyle);
			er.roomObject.floorNode.hide();
			
			er.roomObject.on('dimensionchange', function (caller, payload) {

				var ro = this;
				var canvas = ro.parentLayer.parentCanvas;
				
				var bp = new Doek.Position(canvas, ro.x+5, ro.y+5);
				var ep = new Doek.Position(canvas, ro.dx-15, ro.dy-15);
				
				this.floorNode.show();
				
				this.floorNode.setBeginpoint(bp);
				this.floorNode.setEndpoint(ep);
			});
			
		}
		
	}
}

/**
 * Add an element type function for adding a wall
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    2013.01.03
 *
 * @param   
 */
Elric.doek.etf.wallInit = function (wall) {
	
	var style = new Doek.Style('ori');
	style.properties.strokeStyle = elementTypes.wall.colourOri;
	
	var hoverStyle = new Doek.Style('hover');
	hoverStyle.properties.strokeStyle = elementTypes.wall.colourHover;
	
	var selectStyle = new Doek.Style('select');
	selectStyle.properties.strokeStyle = elementTypes.wall.colourSelect;
	
	if (Elric.rooms[wall.room_id] !== undefined) {
		var er = Elric.rooms[wall.room_id];
		er.roomElements[wall._id] = wall;
		var el = er.roomElements[wall._id];
		
		var newWall = er.roomObject.addWall(el);
		
		newWall.addStyle(hoverStyle);
		newWall.addStyle(selectStyle);
	}
}

/**
 * Add an element type function for adding a camera
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    2013.01.04
 *
 * @param   
 */
Elric.doek.etf.cameraInit = function (camera) {
	
	var style = new Doek.Style('ori');
	style.properties.strokeStyle = elementTypes.camera.colourOri;
	
	var hoverStyle = new Doek.Style('hover');
	hoverStyle.properties.strokeStyle = elementTypes.camera.colourHover;
	
	var selectStyle = new Doek.Style('select');
	selectStyle.properties.strokeStyle = elementTypes.camera.colourSelect;
	
	if (Elric.rooms[camera.room_id] !== undefined) {
		var er = Elric.rooms[camera.room_id];
		er.roomElements[camera._id] = camera;
		var el = er.roomElements[camera._id];
		
		var newWall = er.roomObject.addCamera(el);
		
		newWall.addStyle(hoverStyle);
		newWall.addStyle(selectStyle);
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

	for (var i in elements) {
		var element = elements[i];
		var et = element.element_type;
		
		if (Elric.doek.etf[et + 'Init'] !== undefined) {
			Elric.doek.etf[et + 'Init'](element);
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
 * Add a new element to the doek
 */
$('[data-target="addElementType"]').click(function(e){
	e.preventDefault();
	var type = $(this).attr('data-elementType');
	
	Elric.doek.html.rooms.parent('div').removeClass('error');
	var room_id = Elric.doek.getSelectedRoom();
	
	if (room_id) {
		$.post('/roomelement/new', {room_id: room_id, element_type: type}, function(data){
			ev.addElements([data]);
		});
	} else {
		Elric.doek.html.rooms.parent('div').addClass('error');
	}
	
});

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