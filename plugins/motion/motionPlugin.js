var Motion = function Motion (elric) {

	// Load models
	elric.loadModel('motion', 'motion');
	elric.loadElementType('camera', 'motion');
	elric.loadCapability('motion', 'motion');
	
	// The 'global' client event, all socket messages go here
	var clients = elric.websocket.client;
	
	// The 'filter' event, only motion events go here
	var motion = elric.getEventspace('motion');

	// Listen to motion discovery events
	motion.on('discovery', function(packet, client) {
		console.log(message);
	});
	
}

module.exports = Motion;