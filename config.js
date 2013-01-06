module.exports = function Config (elric) {

	// Load base class
	require('./element_types/element_type')(elric);
	require('./capabilities/capability')(elric);

	// Load plugins
	elric.loadPlugin('motion');
	
	// Load models
	elric.loadModel('user');
	elric.loadModel('room');
	elric.loadModel('roomElement');
	elric.loadModel('notification');
	elric.loadModel('client');
	elric.loadModel('clientCapability');
	
	// Load element types
	elric.loadElementType('wall');
	elric.loadElementType('client');
	elric.loadElementType('closet');
	
}