var Motion = function Motion (elric) {

	// Load models
	elric.loadModel('motionCamera', 'motion');
	elric.loadElementType('camera', 'motion');
	elric.loadCapability('motion', 'motion');
	
	// The 'global' client event, all socket messages go here
	var clients = elric.websocket.client;
	
	// The 'filter' event, only motion events go here
	var motion = elric.getEventspace('motion');
	
	// The Motion model
	var M = elric.models.motionCamera.model;
	
	// The movement event model
	var ME = elric.models.movementEvent.model;
	
	// Store camera specific stuff in here
	var storage = {};
	
	// Route where motion detection arrives (very basic)
	elric.app.post('/noauth/motion/begin/:cameraid', function (req, res) {
		
		// Cameraid is part of the request url
		var cameraid = req.params.cameraid;
		
		// Number of pixels detected as Motion
		// If labelling is enabled the number is the number of
		// pixels in the largest labelled motion area. 
		var pixels = req.body.pixels;
		
		// Coordinates in pixels of the center point of motion.
		// Origin is upper left corner. 
		var x = req.body.x;
		var y = req.body.y;
		
		// Noise leven
		var noise = req.body.noise;
		
		// The number of seconds since the Epoch, i.e.,
		// since 1970-01-01 00:00:00 UTC. 
		var epoch = req.body.epoch;
		
		// The event number, as defined by motion
		// Scope is per camera, resets when motion restarts!
		var event = req.body.event;
		
		// Create a new movementEvent record
		var record = new ME({
			begin: new Date(epoch*1000).toISOString(),
			finished: false,
			source_type: 'motion',
			source_id: cameraid,
			room_id: null,
			room_element_id: null
		});
	
		record.save();
		
		storage[cameraid].eventid = record._id;
		storage[cameraid].eventnr = event;
	
		console.log('Motion event detected on ' + req.params.cameraid);
		res.end('Motion received');

	});
	
	elric.app.post('/noauth/motion/ongoing/:cameraid', function (req, res) {
		console.log('Ongoing motion detected on ' + req.params.cameraid);
		res.end('Motion received');
	});
	
	elric.app.post('/noauth/motion/end/:cameraid', function (req, res) {
		console.log('Motion event ended on ' + req.params.cameraid);
		res.end('Motion received');
	});

	// Listen to motion discovery events
	motion.on('discovery', function(packet, client) {

		for (var cameranr in packet.message.ports) {
			
			var thisPort = packet.message.ports[cameranr];
			
			// Get the camera from the database (autocreates an item)
			getCamera(client.id, cameranr, function (camera, newCamera) {
				
				if (newCamera) {
					camera.identifier = 'Camera ' + camera.thread + ' on ' + client.username;
				}
				
				// Set the camera host
				camera.host = client.address.address;
				
				// Set the camera port
				camera.port = thisPort;
				
				// Save the camera
				camera.save();
				
				// Store the id in the storage
				storage[camera._id] = {};
				
				// Make sure the client sets the correct motion detection url callback
				setMotionDetect(client, camera.thread, camera._id);
			});
		}
		
	});
	
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
	var setMotionDetect = function setMotionDetect (client, threadnr, cameraid) {
		client.submit('set_detection', {thread: threadnr, cameraid: cameraid});
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
						identifier: 'newcamera-' + threadnr
					});
			}
			
			callback(camera, newCamera);
		});
	}
}

module.exports = Motion;