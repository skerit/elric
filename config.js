module.exports = function Config (elric) {

	// Load base classes
	require('./models/model')(elric);
	require('./plugins/plugin')(elric);
	require('./element_types/element_type')(elric);
	require('./capabilities/capability')(elric);

	// Load models
	elric.loadModel('user');
	elric.loadModel('room');
	elric.loadModel('roomElement');
	elric.loadModel('notification');
	elric.loadModel('client');
	elric.loadModel('clientCapability');
	elric.loadModel('movementEvent');
	
	// Load plugins
	elric.loadPlugin('motion');
	
	// Load element types
	elric.loadElementType('wall');
	elric.loadElementType('client');
	elric.loadElementType('closet');
	
	// Prepare all the clients
	elric.prepareForClients();
	
}