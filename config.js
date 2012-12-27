var Config = function Config (elric) {

	// Load plugins
	elric.loadPlugin('motion');
	
	// Load models
	elric.loadModel('user');
	
}

module.exports = Config;