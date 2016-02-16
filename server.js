// Intercept uncaught exceptions so the server won't crash
process.on('uncaughtException', function onError(error) {
	// Indicate we caught an exception
	log.error('Uncaught Exception!', {err: error});
});

require('alchemymvc');

// Configure this as an elric master service
alchemy.configureService('elric::master');

// Start the alchemy server
alchemy.start(function onAlchemyReady() {

});