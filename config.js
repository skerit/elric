module.exports = function Config (elric) {

	// Load base class
	require('./element_types/element_type')(elric);

	// Load plugins
	elric.loadPlugin('motion');
	
	// Load models
	elric.loadModel('user');
	elric.loadModel('room');
	elric.loadModel('roomElement');
	
	// Load element types
	elric.loadElementType('wall');
	
}