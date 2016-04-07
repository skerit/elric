Router.get('Home', '/', 'Static#home');
Router.get('Test', '/test', 'Static#test');

Router.socket('ClientChimera#capconfig', 'capconfig');
Router.socket('DeviceChimera#command', 'devicecmd');
Router.socket('DeviceChimera#feature', 'devicefeature');
Router.socket('DeviceChimera#protocommand', 'protocolcmd');
Router.socket('FloorplanChimera#saveElement', 'saveelement');

/**
 * Listen for templates to finish rendering
 */
alchemy.hawkejs.on('viewrenderDone', function finishedRendering(viewrender) {

	// Disable pageview event for now
	// return;

	var conduit = viewrender.conduit,
	    event;

	event = elric.emitEvent('pageview', conduit, viewrender);
});