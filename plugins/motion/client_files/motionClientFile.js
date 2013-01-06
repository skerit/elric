module.exports = function (client) {
	
	client.event.on('start', function() {
		console.log('Motion is starting after everything has loaded');
	});
	
}