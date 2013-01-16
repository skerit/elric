var elric = {};

var Motion = function Motion (elriclink) {

	elric = elriclink;

	var thisMotion = this;

	// Load models
	elric.loadModel('motionCamera', 'motion');
	elric.loadElementType('camera', 'motion');
	elric.loadCapability('motion', 'motion');
	
	// The 'global' client event, all socket messages go here
	var clients = elric.events.clients;
	
	// Model links
	var M = elric.models.motionCamera.model;
	var ME = elric.models.movementEvent.model;
	this.M = M;
	this.ME = ME;
	
	// Every camera gets an entry in this variable
	// We can store specific stuff in here, like active events
	var storage = {};
	this.storage = storage;

	// Load all the cameras
	this.registerAllCameras();
	
	/**
	 * Motion lets us know a new event has started by wgetting this route
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.11
	 * @version  2013.01.14
	 */
	elric.app.post('/noauth/motion/begin/:cameraid', function (req, res) {
		
		// End the request
		res.end('Motion received');
		
		// Create the packet we can send with the global event
		var packet = {};
		
		// Cameraid is part of the request url
		packet.cameraid = req.params.cameraid;
		var cameraid = packet.cameraid;
		
		// Number of pixels detected as Motion
		// If labelling is enabled the number is the number of
		// pixels in the largest labelled motion area. 
		packet.pixels = req.body.pixels;
		
		// Coordinates in pixels of the center point of motion.
		// Origin is upper left corner. 
		packet.x = req.body.x;
		packet.y = req.body.y;
		
		// Noise level
		packet.noise = req.body.noise;
		
		// The number of seconds since the Epoch, i.e.,
		// since 1970-01-01 00:00:00 UTC. 
		packet.epoch = req.body.epoch;
		
		// The event number, as defined by motion
		// Scope is per camera, resets when motion restarts!
		packet.eventnr = req.body.event;
		
		// This should exist, but just in case:
		// @todo: Make sure this exists!
		if (storage[cameraid] === undefined) storage[cameraid] = {};
		
		// Create a new movementEvent record
		var record = getMovementEvent(packet.eventnr,
																	cameraid,
																	packet.epoch,
																	{x: packet.x, y: packet.y, pixels: packet.pixels, noise: packet.noise});

		// Create a link to this camera's storage
		var cs = storage[cameraid];
		
		// Set our current event as active
		cs.eventid = record._id;
		cs.eventnr = packet.eventnr;
		cs.eventrecord = record;
		cs.counter = 0;
		
		packet.eventid = record._id;
		
		console.log('Motion event detected on ' + req.params.cameraid);
	});
	
	/**
	 * Every movement in a motion event
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.11
	 * @version  2013.01.16
	 */
	elric.app.post('/noauth/motion/ongoing/:cameraid', function (req, res) {
		elric.log.info('Ongoing motion detected on ' + req.params.cameraid);
		res.end('Motion received');
		
		var cameraid = req.params.cameraid;
		var eventnr = req.body.event;
		var eventid = getMovementEvent(eventnr, cameraid);
		
		// Create the packet we can send with the global event
		var packet = {};
		packet.pixels = req.body.pixels;
		packet.x = req.body.x;
		packet.y = req.body.y;
		packet.noise = req.body.noise;
		
		ME.findOne({_id: eventid}, function (err, mevent) {
			
			if (mevent) {
				var obj = {x: packet.x, y: packet.y, pixels: packet.pixels, noise: packet.noise};
				mevent.rawdata.push(obj);
				mevent.save();
			} else {
				elric.log.error('Error updating rawdata field in motion event ' + eventid);
				if (err) console.log(err);
			}
		});
	});
	
	/**
	 * A motion event has ended
	 * Note: This can happen BEFORE a movie ends!
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.11
	 * @version  2013.01.16
	 */
	elric.app.post('/noauth/motion/end/:cameraid', function (req, res) {
		
		elric.log.info('Motion event ended on ' + req.params.cameraid);
		res.end('Motion received');
		
		var cameraid = req.params.cameraid;
		
		var eventnr = req.body.event;
		var eventid = getMovementEvent(eventnr, cameraid);
		
		ME.findOne({_id: eventid}, function (err, mevent) {
			
			if (mevent) {
				mevent.finished = true;
				mevent.save();
			} else {
				elric.log.error('Could not finish motion event ' + eventid);
				if (err) console.log(err);
			}
		});
		
		// Indicate no event is set anymore
		storage[cameraid].eventid = false;
		storage[cameraid].eventnr = false;
		storage[cameraid].counter = 0;
	});
	
	/**
	 * A movie file has been created (and is being written to as we speak)
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.13
	 * @version  2013.01.13
	 */
	elric.app.post('/noauth/motion/moviestart/:cameraid', function (req, res) {
		
		var filepath = req.body.file;
		res.end('Motion received');
	});
	
	/**
	 * A movie file has been finished
	 * Note: This can happen AFTER an event has ended!
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.13
	 * @version  2013.01.13
	 */
	elric.app.post('/noauth/motion/movieend/:cameraid', function (req, res) {
		
		// Close the request
		res.end('Motion received');
		
		var filepath = req.body.file;
		var cameraid = req.params.cameraid;
		var eventnr = req.body.event;
		var cs = storage[cameraid];
		
		var eventid = getMovementEvent(eventnr, cameraid);
		
		var record = storage[cameraid].eventrecord;
		var clientsocket = cs.client.socket;

		// Convert the epoch to a date
		var eD = new Date(req.body.epoch * 1000);
		
		// Get the extension with the dot
		var extension = filepath.substring(filepath.lastIndexOf('.')); // .replace('.', '');
		
		// Construct the filename
		var filename = req.body.epoch + '-' + eventid + extension;
		var destinationdir = 'motion/videos/' + cs.name + '/';
		
		// If the movie is a timelapse, store it somewhere else
		if (filepath.indexOf('timelapse') > -1) {
			filename = 'timelapse-' + eD.getFullYear() + '-' + (eD.getMonth()+1) + eD.getDate() + extension;
			destinationdir = 'motion/timelapses/' + cs.name + '/' + eD.getFullYear() + '/' + eD.getFullYear() + '-' + (eD.getMonth()+1) + '/';
			eD = false; // Make sure the getDirectory function doesn't add any more date subfolders
		}
		
		// Get the videos directory relative to the local storage folder
		elric.getDirectory(destinationdir, eD, function (err, dirpath) {

			// Move the file from the client to the server
			cs.client.getFile(filepath,
												dirpath + filename,
											  function (err) {
				
				if (err) {
					elric.log.error('Error moving video file from client!');
					console.log(err);
				} else {
					ME.update({_id: eventid},
								{movie: dirpath + filename},
								{upsert:true}, function(err, data) {
									
									if (err) {
										elric.log.error('Error updating movie field in motion event!');
										console.log(err);
									}
					});
				}
			});
		});
	});
	
	/**
	 * Motion has created a picture file of a frame.
	 * Store it on the server.
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.13
	 * @version  2013.01.13
	 */
	elric.app.post('/noauth/motion/picturesave/:cameraid', function (req, res) {
		
		// Close the request
		res.end('Motion received');
		
		var filepath = req.body.file;
		var cameraid = req.params.cameraid;
		
		// Do nothing if the camera isn't known to the server (yet)
		if (storage[cameraid] === undefined) {
			elric.log.error('Camera ' + cameraid + ' isn\'t known to the server yet.');
			return;
		}
		
		var cs = storage[cameraid];
		
		var eventnr = req.body.event;
		var eventid = getMovementEvent(eventnr, cameraid);
		
		// Increase the picture counter
		cs.counter++;
		
		// Convert the epoch to a date
		var eD = new Date(req.body.epoch * 1000);
		
		// Construct the filename
		var filename = cs.name + '-' + req.body.epoch + '-' + eventid + '-' + String('00000'+cs.counter).slice(-5) + '.jpg';
		
		// Get the frames directory relative to the local storage folder
		elric.getDirectory('motion/frames/', eD, function (err, dirpath) {

			// Move the file from the client to the server
			cs.client.getFile(filepath,
												dirpath + filename,
												function (err) {
				
				if (err) {
					elric.log.error('Error moving picture frame file from client!');
					console.log(err);
				} else {
					ME.update({_id: eventid},
								{$push: { 'pictures' : dirpath + filename }},
								{upsert:true}, function(err, data) {
									
									if (err) {
										elric.log.error('Error updating pictures array field in motion event!');
										console.log(err);
									}
					});
				}
			});
		});
	});

	// Listen to motion discovery events
	this.on('discovery', function(packet, client) {

		for (var cameranr in packet.message.ports) {

			var thisPort = packet.message.ports[cameranr];
			
			// Get the camera from the database (autocreates an item)
			getCamera(client.id, cameranr, function (camera, newCamera) {
				
				if (newCamera) {
					camera.identifier = client.username.toLocaleLowerCase() + '_camera_' + camera.thread;
				}
				
				// Set the camera host
				camera.host = client.ip;
				
				// Set the camera port
				camera.port = thisPort;
				
				// Save the camera
				camera.save();
				
				// Register the camera, if it hasn't been already
				thisMotion.registerCamera(camera);
			});
		}
	});
	
	/**
	 * Get or create a movementEvent record
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.14
	 * @version  2013.01.14
	 *
	 * @param    {integer}  eventnr         The number of the event according to motion
	 * @param    {string}   cameraid        The id of the camera
	 * @param    {integer}  epoch           The epoch begin of the event (Creation only)
	 * @param    {object}   rawdata         Rawdata to add to the record (Creation only)
	 *
	 * @returns  {object|string}   The (unsaved) movementEvent record or the id
	 */
	var getMovementEvent = function getMovementEvent (eventnr, cameraid, epoch, rawdata) {
		
		// Get this camera's storage object
		var cs = storage[cameraid];
		
		// Do nothing if the camera isn't known to the server (yet)
		if (cs === undefined) {
			elric.log.error('Camera ' + cameraid + ' isn\'t known to the server yet, can\'t get event id');
			return false;
		}
		
		if (cs.history[eventnr] === undefined) {
			
			if (epoch === undefined) epoch = parseInt(new Date().getTime()/1000);
			
			var record = new ME({
				begin: new Date(epoch*1000).toISOString(),
				finished: false,
				source_type: 'motion',
				source_id: cameraid,
				room_id: null,
				room_element_id: null,
				pictures: [],
				movie: '',
				rawdata: [rawdata]
			});
			
			record.save();
			
			// Store the id in the history
			cs.history[eventnr] = record._id;
			
			return record;
		}
		
		return cs.history[eventnr];
	}
	
	/**
	 * Set a camera option by sending an event to the client
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.10
	 * @version  2013.01.10
	 *
	 * @param    {object}   client          The client to send it to
	 * @param    {integer}  threadnr        The camera thread nr
	 * @param    {string}   option          The option name
	 * @param    {string}   value           The option value
	 */
	var setOption = function setOption (client, threadnr, option, value) {
		client.submit('setoption', {thread: threadnr, option: option, value: value});
	}
	
	/**
	 * Get a camera from the database, create one if needed
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.09
	 * @version  2013.01.09
	 *
	 * @param    {string}   clientid        The id of the client
	 * @param    {integer}  threadnr        The camera thread nr
	 * @param    {function} callback        The function to callback
	 */
	var getCamera = function getCamera (clientid, threadnr, callback) {
		
		M.findOne({client_id: clientid, thread: threadnr}, function (err, camera) {
			
			var newCamera = false;

			if (!camera) {
				newCamera = true;

				camera = new M({
						client_id: clientid,
						thread: threadnr,
						identifier: 'newcamera-' + threadnr,
						host: '',
						port: 0
					});
			}
			
			callback(camera, newCamera);
		});
	}

}

var mp = Motion.prototype;

/**
 * Set the camera detection options
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.10
 * @version  2013.01.10
 *
 * @param    {object}   client          The client to send it to
 * @param    {integer}  threadnr        The camera thread nr
 * @param    {string}   cameraid        The camera id in the db
 */
mp.setMotionDetect = function setMotionDetect (client, threadnr, cameraid) {
	client.submit('set_detection', {thread: threadnr, cameraid: cameraid});
}

/**
 * Add camera to the storage object
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.15
 * @version  2013.01.15
 *
 * @param    {object}   camerarecord     The camerarecord from the db
 */
mp.registerCamera = function registerCamera (camerarecord) {
	
	var clientid = camerarecord.client_id;
	var client = elric.clients[clientid];
	
	if (this.storage[camerarecord._id] === undefined) {

		// Store the id in the storage
		this.storage[camerarecord._id] = {eventid: false,
														eventnr: false,
														history: {},
														client: client,
														counter: 0,
														name: camerarecord.identifier};
		
		elric.log.info('Camera ' + camerarecord._id + ' storage has been made');
	}
	
	// Make sure the client sets the correct motion detection url callback
	this.setMotionDetect(client, camerarecord.thread, camerarecord._id);
}

/**
 * Register all cameras in the database
 * 
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.15
 * @version  2013.01.15
 */
mp.registerAllCameras = function registerAllCameras () {

	var thisMotion = this;
	
	this.M.find({}, function (err, cameras) {
		
		for (var i in cameras) {
			var camera = cameras[i];
			
			thisMotion.registerCamera(camera);
		}
	});
}

module.exports = Motion;