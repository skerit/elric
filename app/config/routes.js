Router.get('Home', '/', 'Static#home');
Router.get('Test', '/test', 'Static#test');
Router.get('CameraStream', '/stream/camera/:id', 'CameraChimera#webStream');

Router.socket('capconfig', 'ClientChimera#capconfig');
Router.socket('devicecmd', 'DeviceChimera#command');
Router.socket('devicefeature', 'DeviceChimera#feature');
Router.socket('read-device-feature', 'DeviceChimera#readFeature');
Router.socket('protocolcmd', 'DeviceChimera#protocommand');
Router.socket('savelement', 'FloorplanChimera#saveElement');

Router.linkup('Camera::linkup', 'cameralink', 'CameraChimera#createLink');

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