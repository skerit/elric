module.exports = function Config (elric) {
	
	// Load plugins
	elric.loadPlugin('motion');
	
	// Load models
	elric.loadModel('user');
}