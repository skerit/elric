Router.get('Home', '/', 'Static#home');

Router.socket('ClientChimera#capconfig', 'capconfig');
Router.socket('DeviceChimera#command', 'devicecmd');
Router.socket('DeviceChimera#protocommand', 'protocolcmd');
Router.socket('FloorplanChimera#saveElement', 'saveelement');

/**
 * Listen for templates to finish rendering
 */
alchemy.hawkejs.on('viewrenderDone', function finishedRendering(viewrender) {

	var conduit = viewrender.conduit,
	    event;

	event = elric.emitEvent('pageview', conduit, viewrender);
});