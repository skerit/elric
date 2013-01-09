var request = require('request');
var $;

module.exports = function (client) {
	
	$ = client.jQuery;
	var thisClient = this;
	var me = client.settings.motion;
	var settings = me.settings;
	var location = 'http://' + settings.host + ':' + settings.port + '/';
	
	var submit = client.filteredSubmit('motion');
	
	client.event.on('start', function() {
		
		console.log('Motion is starting after everything has loaded');
		
		thisClient.getThreadcount(function (threadCount, cameraCount) {
			console.log('There are ' + threadCount + ' threads running');
			console.log('There are ' + cameraCount + ' camera\'s installed');
			
			var disc = {threads: threadCount, cameras: cameraCount};
			
			submit('discovery', disc);
			
		});
		
	});
	
	/**
	 * Get the thread count & camera count from Motion
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.09
	 * @version  2013.01.09
	 *
	 * @param    {function} callback        The function to callback
	 */
	this.getThreadcount = function (callback) {
		
		// Request the main Motion page, with threadcount info
		request({uri: location}, function (error, response, body) {
			
			// Get the threadcount from the body using a ReGex
			var result = /Running \[([0-9]*)\] Threads/g.exec(body);

			// If a result exists
			if (result && result[1] !== undefined) {
				var threadCount = parseInt(result[1]);
				var cameraCount = threadCount;
				
				// If there is more than 1 thread, there is 1 less camera
				if (threadCount > 1) cameraCount--;
				
				callback(threadCount, cameraCount);
			} else {
				// If no result exists, callback with 0
				callback(0, 0);
			}
		});
	}
	
}