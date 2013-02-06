module.exports = function Config (elric) {
	
	var mainPath = process.cwd();

	// Load base classes
	require(mainPath + '/models/model')(elric);
	require(mainPath + '/plugins/plugin')(elric);
	require(mainPath + '/lib/element_types/element_type')(elric);
	require(mainPath + '/lib/capabilities/capability')(elric);
	require(mainPath + '/lib/activities/activity')(elric);
	require(mainPath + '/lib/actions/action')(elric);
	require(mainPath + '/lib/device_types/device_type')(elric);
	require(mainPath + '/lib/interfaces/interface')(elric);
	require(mainPath + '/lib/automation_protocols/automation_protocol')(elric);
	
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
	
	// Load automation protocol
	elric.loadAutomationProtocol('arc');
	
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