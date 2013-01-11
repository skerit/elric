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
	
	// Route where motion detection arrives (very basic)
	elric.app.get('/noauth/motion/detected/:cameraid', function (req, res) {
		console.log('Motion detected on ' + req.params.cameraid);
		res.end('Motion received');
		//console.log(req);
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
	 * Set the camera on_motion_detected option
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
		client.submit('set_on_motion_detected', {thread: threadnr, cameraid: cameraid});
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