var Config = function Config (elric) {

	// Load plugins
	elric.loadPlugin('motion');
	
	// Load models
	elric.loadModel('user');
	elric.loadModel('room');
	elric.loadModel('roomElement');
	
}

module.exports = Config;