
/**
 * A wrapper class function for Doek's canvas
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    0.0.1
 * @version  1.0.0
 *
 * @param   {string}   canvasId   The name of the canvas wrapper div
 */
var Floorplan = Function.inherits('Informer', function Floorplan(canvas_id) {

	var that = this,
	    editor_element;

	this.d = new Doek.Canvas(canvas_id);
	this._gridObject = this.d.addGrid();

	editor_element = this.d.container.closest('.floorplan-editor');

	// Get the toolbar
	this.toolbar = editor_element.querySelector('.floorplan-toolbar');

	// Get the sidebar
	this.sidebar = editor_element.parentElement.querySelector('.floorplan-sidebar');

	// html elements
	this.html_elements = {
		rooms: this.sidebar.querySelector('[data-name="rooms"]'),
		room_elements: this.sidebar.querySelector('[data-name="elements"]'),
		_id: this.sidebar.querySelector('[data-name="_id"]'),
		name: this.sidebar.querySelector('[data-name="name"]'),
		room: this.sidebar.querySelector('[data-name="room_id"]'),
		element_type: this.sidebar.querySelector('[data-name="element_type"]'),
		external_id: this.sidebar.querySelector('[data-name="type_external_id"]'),
		x: this.sidebar.querySelector('[data-name="x"]'),
		y: this.sidebar.querySelector('[data-name="y"]'),
		dx: this.sidebar.querySelector('[data-name="dx"]'),
		dy: this.sidebar.querySelector('[data-name="dy"]'),
		width: this.sidebar.querySelector('[data-name="width"]'),
		height: this.sidebar.querySelector('[data-name="height"]'),
		save: this.sidebar.querySelector('#saveElement')
	};

	// Create a reference to this floorplan
	this.d.floorplan = this;

	// All the available element_types
	this.element_types = {};

	// All the available rooms
	this.rooms = {};

	// The current mode of the floorplan
	this.mode = false;

	// The currently selected node
	this.selected = false;

	// Enable tiled
	this.d.settings.tiled = true;

	this.layer = this.d.addLayer('main', 10);
	this.floorLayer = this.d.addLayer('floor', 4);

	// Construct the new element url
	this.new_element_url = hawkejs.scene.helpers.Router.routeUrl(
		'chimera@ActionLink',
		{controller: 'Floorplan', action: 'addRoomElement'}
	);

	// Listen to changes in the floorplan-mode
	this.toolbar.querySelector('.floorplan-mode').addEventListener('change', function(e) {

		if (!this.value) {
			that.mode = '';
		} else if (this.value == 'select') {
			that.mode = 'select';
			that.d.setAction('select');
		} else if (this.value == 'changesize')  {
			that.mode = 'changesize';
			that.d.setAction('changeSize');
		}
	});

	// Listen to clicks on the new element buttons
	this.toolbar.querySelector('.floorplan-elements').addEventListener('change', function(e) {
		console.log('Value:', this.value)

		var room = that.getSelectedRoom(),
		    type = this.value,
		    get;

		if (room) {

			get = {
				room: room._id,
				element: type
			};

			hawkejs.scene.fetch(that.new_element_url, {get: get}, function gotResponse(err, data) {

				if (err) {
					throw err;
				}

				that.addElements(data, room);
			});
		} else {
			throw new Error('You have to select a room');
		}
	});

	registerNewActions(this);
});

/**
 * Add element types
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    1.0.0
 * @version  1.0.0
 *
 * @param   {Object)   element_types
 */
Floorplan.setMethod(function addElementTypes(element_types) {
	Object.assign(this.element_types, element_types);
});

/**
 * Get the currently selected room
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    0.0.1
 * @version  1.0.0
 */
Floorplan.setMethod(function getSelectedRoom() {

	var room_id = this.sidebar.querySelector('[data-name="rooms"]').value;

	if (!room_id) {
		return;
	}

	return this.rooms[room_id];
});

/**
 * Add rooms to the Doek Canvas and the Elric object
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    0.0.1
 * @version  1.0.0
 *
 * @param   {Array}   rooms   An array of rooms
 */
Floorplan.setMethod(function addRooms(rooms) {

	var that = this,
	    floorStyle;

	floorStyle = new Doek.Style('floor');
	floorStyle.properties.strokeStyle = '#F9F9F9';

	console.log('Adding rooms', rooms);

	rooms.forEach(function eachRoom(room, index) {

		var elements,
		    floor;

		if (that.rooms[room._id]) {
			return;
		}

		// Store the room under its _id
		that.rooms[room._id] = room;

		// Get the original element data
		elements = room.elements;

		// Create the elements object
		room.elements = {};

		// Create the room object
		room.doek_object = new Doek.Object(that.layer);
		room.doek_object.tiled = true;

		// And add it to the layer
		that.layer.addObject(room.doek_object);

		// Add the original element to this room
		// @todo: why?
		room.doek_object.roomElement = room;

		// Create a new floor
		floor = new Doek.Object(that.floorLayer);
		room.doek_object.floorObject = floor;
		floor.tiled = true;
		that.floorLayer.addObject(floor);

		// Indicate it's a floor
		floor.floor = true;
		floor.roomElement = room;

		room.doek_object.floorNode = floor.addRectangle(room.doek_object.x, room.doek_object.y, room.doek_object.dx, room.doek_object.dy, floorStyle);
		room.doek_object.floorNode.hide();

		room.doek_object.on('dimensionchange', function (caller, payload) {

			var ro = this;
			var canvas = ro.parentLayer.parentCanvas;
			
			var bp = new Doek.Position(canvas, ro.x+5, ro.y+5);
			var ep = new Doek.Position(canvas, ro.dx-15, ro.dy-15);
			
			this.floorNode.show();
			
			this.floorNode.setBeginpoint(bp);
			this.floorNode.setEndpoint(ep);
		});

		// Add the elements
		that.addElements(elements, room);
		
	});
});

/**
 * Add room elements to the Doek Canvas and the Elric room object
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    0.0.1
 * @version  1.0.0
 *
 * @param   {Array}   elements   An array of roomElements
 * @param   {Object}  room
 */
Floorplan.setMethod(function addElements(elements, room) {

	var that = this;

	if (typeof room == 'string') {
		room = this.rooms[room];
	}

	elements = Array.cast(elements);
	console.log('Adding', elements, 'to', room);

	elements.forEach(function eachElement(element, index) {

		var type_name = element.element_type;


		element.room_id = room._id;

		// Store the element type instance on the element
		element.elementType = that.element_types[type_name];

		console.log('ttt:', element.elementType)

		// @todo: add custom inits
		that.createNewElement(room._id, element, type_name);
	});
});

/**
 * Add an element type function for default elements
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    0.0.1
 * @version  1.0.0
 *
 * @param    {ObjectId} room_id
 * @param    {Object}   element   The element type element
 * @param    {String}   type_name The type to add
 */
Floorplan.setMethod(function createNewElement(room_id, element, type_name) {

	var newElement,
	    el,
	    er;

	er = this.rooms[room_id];
	er.elements[element._id] = element;

	newElement = er.doek_object.addNewType(element, type_name);
});

/**
 * Only create a new Doek if the wrapper div exists
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    0.0.1
 * @version  1.0.0
 */
hawkejs.scene.on({type: 'set', name: 'chimera-cage', template: 'floorplan/chimera_index'}, function setDoek(element, variables) {


	console.log('Vars:', variables, this);

	window.floorplan = new Floorplan('map');

	floorplan.addElementTypes(variables.element_types);

	floorplan.addRooms(variables.rooms);
});

/**
 * Recreate everything when the doek block is loaded
 */
hawkejs.scene.on('doekview', function (query, data){

	var urls = data.urls;

	Elric.exposed.rooms = data.rooms;
	Elric.exposed.elementTypes = data.elementTypes;
	Elric.exposed.urls = urls;

	Elric.rooms = {}
	
	/**
	 * Object for storing doek variables
	 */
	Elric.doek = {};
	Elric.doek.select = false; // The selected node
	Elric.doek.mode = false;
	Elric.doek.html = {};
	Elric.doek.html.rooms = $('select[name="data[rooms]"]');
	Elric.doek.html.elements = $('select[name="data[elements]"]');
	Elric.doek.html.editElement = $('form#editElement');
	Elric.doek.etf = {}; // Element Type Functions
	
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
	 * Add an element type function for default elements
	 *
	 * @author   Jelle De Loecker <jelle@kipdola.be>
	 * @since    2013.01.06
	 *
	 * @param    {object}   element   The element type element
	 * @param    {string}   type      The type to add
	 */
	Elric.doek.etf.defaultInit = function (element, type) {

		var newElement,
		    el,
		    er;

		if (Elric.rooms[element.room_id] !== undefined) {

			er = Elric.rooms[element.room_id];
			er.roomElements[element._id] = element;
			
			el = er.roomElements[element._id];
			el.elementType = data.elementTypes[type];
			
			newElement = er.roomObject.addDefault(el, type);
		}
	};
	
	/**
	 * Add an element type function for adding a camera
	 *
	 * @author   Jelle De Loecker <jelle@kipdola.be>
	 * @since    2013.01.04
	 *
	 * @param    {object}   camera   Camera element type
	 */
	Elric.doek.etf.cameraInit = function (camera) {
		
		if (Elric.rooms[camera.room_id] !== undefined) {
			var er = Elric.rooms[camera.room_id];
			er.roomElements[camera._id] = camera;
			var el = er.roomElements[camera._id];
			el.elementType = Elric.exposed.elementTypes['camera'];
			var newCamera = er.roomObject.addCamera(el);
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
		
		var room_id = Elric.doek.getSelectedRoom(),
		    type    = $(this).attr('data-elementType');
		
		if (room_id) {
			$.post(urls.addElement, {room_id: room_id, element_type: type}, function(data){
				ev.addElements([data]);
			});
		} else {
			toastr.error('You have to select a room');
		}

		e.preventDefault();
	});

	/**
	 * Only create a new Doek if the wrapper div exists
	 */
	if ($('#map').length) {
		window.e = new Elric.View('map');
		window.ev = window.e;
		
		registerNewActions(window.e);
		
		ev.addRooms(data.rooms);
		ev.addElements(data.elements);
	}
	
	/**
	 * Handle the toggling of radio buttons
	 */
 $('div.btn-group[data-toggle-name]').each(function(){
	 var group   = $(this);
	 var form    = group.parents('form').eq(0);
	 var name    = group.attr('data-toggle-name');
	 var ef      = group.attr('data-elric-function');
	 var hidden  = $('input[name="' + name + '"]', form);
	 $('button', group).each(function(){
		 var button = $(this);
		 // When the button is clicked
		 button.click(function(){
			 var newVal = $(this).val();
			 hidden.val(newVal);
			 if (ef) {
				 Elric[ef](newVal);
			 }
		 });
		 // Set the starting value (from hidden element)
		 if(button.val() == hidden.val()) {
			 button.addClass('active');
		 }
	 });
 });

	
});