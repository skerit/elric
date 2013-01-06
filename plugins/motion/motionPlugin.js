var Motion = function Motion (elric) {

	// Load models
	elric.loadModel('motion', 'motion');
	elric.loadElementType('camera', 'motion');
	elric.loadCapability('motion', 'motion');
	
}

module.exports = Motion;