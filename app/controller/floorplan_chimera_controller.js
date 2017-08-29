/**
 * The Floorplan Chimera Controller class
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Floor = Function.inherits('Alchemy.ChimeraController', function FloorplanChimeraController(conduit, options) {
	FloorplanChimeraController.super.call(this, conduit, options);
});

/**
 * Show all devices
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Conduit}   conduit
 */
Floor.setMethod(function index(conduit) {

	var that = this;

	this.set('pagetitle', 'Floorplan');

	Function.parallel(function getRooms(next) {

		var options = {
			fields: ['_id', 'name', 'elements', 'width', 'height', 'x', 'y', 'z']
		};

		that.getModel('Room').find('list', options, function gotRooms(err, rooms) {

			if (err) {
				return next(err);
			}

			console.log('Got rooms:', rooms);
			that.set('rooms', rooms);

			next();
		});

	}, function getElementTypes(next) {

		var element_types = {},
		    shared = alchemy.getClassGroup('elric_element_type'),
		    entry,
		    key;

		for (key in shared) {
			entry = new shared[key];
			element_types[entry.type_name] = entry;
		}

		that.set('element_types', element_types);

		next();

	}, function done(err) {

		if (err) {
			return conduit.error(err);
		}

		that.render('floorplan/chimera_index');
	});
});

/**
 * Get all the available elements for the given room
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Conduit}   conduit
 */
Floor.setMethod(function elements(conduit) {

	var room_id = conduit.param('value'),
	    options;

	if (!room_id) {
		return conduit.error('Invalid room id given');
	}

	this.getModel('Room').findById(room_id, {fields: ['elements'], document: false}, function gotResponse(err, result) {

		if (err) {
			return conduit.error(err);
		}

		if (!result.length) {
			return conduit.error(new Error('Could not find room'));
		}

		conduit.end(result[0].Room.elements);
	});
});

/**
 * Add a new element to a room
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Conduit}   conduit
 */
Floor.setMethod(function addRoomElement(conduit) {

	var room_id = conduit.param('room'),
	    element_type = conduit.param('element'),
	    options;

	if (!room_id) {
		return conduit.error('Invalid room id given');
	}

	this.getModel('Room').findById(room_id, {fields: ['elements']}, function gotResponse(err, result) {

		var new_element;

		if (err) {
			return conduit.error(err);
		}

		if (!result.length) {
			return conduit.error(new Error('Could not find room'));
		}

		new_element = {
			_id: alchemy.ObjectId(),
			element_type: element_type
		};

		result.elements.push(new_element);

		result.save(function savedRecord(err, data) {

			if (err) {
				return conduit.error(err);
			}

			conduit.end(new_element);
		});
	});
});

/**
 * Add a new element to a room
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Conduit}   conduit
 */
Floor.setMethod(function saveElement(conduit, data) {

	console.log('Save element+?', data);

	if (!data || !data._id) {
		return conduit.error('No element data given');
	}

	console.log('Should save:', data);

	this.getModel('Room').findById(data.room_id, {fields: ['elements']}, function gotResponse(err, result) {

		var element,
		    i;

		if (err) {
			return conduit.error(err);
		}

		if (!result.length) {
			return conduit.error('Room not found');
		}

		console.log('Result:', result);

		for (i = 0; i < result.elements.length; i++) {
			if (String(result.elements[i]._id) == data._id) {
				element = result.elements[i];
				break;
			}
		}

		if (!element) {
			return conduit.error('Could not find element in room');
		}

		// Inject the new data into the element
		Object.assign(element, data);

		result.save(function saved(err) {

			if (err) {
				return conduit.error(err);
			}
		});
	});
});

/**
 * Get external ids for specific types
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Conduit}   conduit
 */
Floor.setMethod(function getTypeExternalIds(conduit, data, callback) {

	var that = this,
	    class_name = data.element_type.classify() + 'ElementType',
	    constructor,
	    instance;

	constructor = Classes.Elric[class_name];

	console.log('Getting external ids?', class_name, constructor)

	if (!constructor) {
		return callback(new Error('Not found: "' + class_name + '"'));
	}

	instance = new constructor();

	if (!instance.getExternalIds) {
		return callback(null);
	}

	instance.getExternalIds(function gotExternalIds(err, result) {

		if (err) {
			return callback(err);
		}

		console.log('Responding with', err, result);

		callback(null, result);
	});
});

// Add the dashboard to the menu deck
alchemy.plugins.chimera.menu.set('floorplan', {
	title: 'Floorplan',
	route: 'chimera@ActionLink',
	parameters: {
		controller: 'Floorplan',
		action: 'index'
	},
	icon: {svg: 'compass'}
});