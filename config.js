module.exports = function Config (elric) {

	// Load base classes
	require('./models/model')(elric);
	require('./plugins/plugin')(elric);
	require('./lib/element_types/element_type')(elric);
	require('./lib/capabilities/capability')(elric);
	require('./lib/activities/activity')(elric);
	require('./lib/actions/action')(elric);
	require('./lib/device_types/device_type')(elric);
	require('./lib/interfaces/interface')(elric);
	
	// Copy over all core dust templates
	//elric.loadTemplates('assets/views/');

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
	elric.loadModel('interface');
	elric.loadModel('device');
	
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