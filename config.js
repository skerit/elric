module.exports = function Config (elric) {

	// Load base classes
	require('./models/model')(elric);
	require('./plugins/plugin')(elric);
	require('./element_types/element_type')(elric);
	require('./capabilities/capability')(elric);
	require('./activities/activity')(elric);
	require('./actions/action')(elric);
	require('./device_types/device_type')(elric);
	require('./interfaces/interface')(elric);
	
	// Copy over all core dust templates
	elric.loadTemplates('assets/views/');

	// Load models
	elric.loadModel('user');
	elric.loadModel('room');
	elric.loadModel('roomElement');
	elric.loadModel('notification');
	elric.loadModel('client');
	elric.loadModel('clientCapability');
	elric.loadModel('movementEvent');
	elric.loadModel('flow');
	elric.loadModel('scenario');
	
	// Load actions
	elric.loadAction('consoleOutput');
	
	// Load interfaces
	elric.loadInterface('rfxcom');
	
	// Load device types
	elric.loadDeviceType('light');
	
	// Load plugins
	elric.loadPlugin('motion');
	
	// Load element types
	elric.loadElementType('wall');
	elric.loadElementType('client');
	elric.loadElementType('closet');
	
	// Prepare all the clients
	elric.prepareForClients();
}