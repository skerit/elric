Router.get('Home', '/', 'Static#home');
Router.get('Test', '/test', 'Static#test');
Router.get('CameraStream', '/stream/camera/:id', 'CameraChimera#webStream');

Router.socket('capconfig', 'ClientChimera#capconfig');
Router.socket('devicecmd', 'DeviceChimera#command');
Router.socket('devicefeature', 'DeviceChimera#feature');
Router.socket('read-device-feature', 'DeviceChimera#readFeature');
Router.socket('protocolcmd', 'DeviceChimera#protocommand');
Router.socket('saveelement', 'FloorplanChimera#saveElement');
Router.socket('element-externalids', 'FloorplanChimera#getTypeExternalIds');

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

// Add the dashboard to the menu deck
alchemy.plugins.chimera.menu.set('device_Test', {
	title: 'Devices test',
	route: 'chimera@ModelAction',
	parameters: {
		controller: 'Editor',
		subject: 'device',
		action: 'index'
	},
	icon: {svg: 'connection'}
});

alchemy.plugins.chimera.menu.set('test_test', {
	title: 'Test model',
	route: 'chimera@ModelAction',
	parameters: {
		controller: 'Editor',
		subject: 'test',
		action: 'index'
	},
	icon: {svg: 'connection'}
});