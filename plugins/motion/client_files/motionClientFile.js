var async = require('async');
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

			var waterfall = [];
			
			// Add the initial camera
			// The first waterfall function is always special
			waterfall.push(function (callback) {
				
				// Get thread number 1's port
				thisClient.getThreadPort(1, function (resultPort, resultThread) {
					ports = {};
					ports[resultThread] = resultPort;
					callback(null, ports);
				});
				
			});
			
			// Loop through every thread and prepare its function
			for (var threadNr = 2; threadNr <= cameraCount; threadNr++) {
				
				(function closeMe (closureThreadNr) {
					waterfall.push(function (ports, callback) {
						// Get thread number n's port
						thisClient.getThreadPort(closureThreadNr, function (resultPort, resultThread) {
							ports[resultThread] = resultPort;
							callback(null, ports);
						});
					});
				})(threadNr);
			}
			
			// Perform all the lookups in serie and
			// submit the information to the server
			async.waterfall(waterfall, function (err, ports) {
				disc.ports = ports;
				submit('discovery', disc);
			});
		});
	});
	
	// Listen to the setoption events from the server
	client.socket.on('setoption', function(packet) {
		
		console.log(packet);
		//this.setOption(threadNr, 'on_motion_detected', 'wget -O - http://' + client.local.server + ':' + client.local.serverport + '/motion/detected/');
		
	});
	
	// Set detection options
	client.socket.on('set_detection', function(packet){
		
		// Base url for callbacks
		var base = 'http://' + client.local.server + ':' + client.local.serverport + '/noauth/motion/';
		
		// Begin the wget command (output to nothing)
		var wget = 'wget -O - ';
		
		// Add post data to wget (motion "conversion specifiers")
		wget += "--post-data 'pixels=%D&x=%K&y=%l&noise=%N&epoch=%s&event=%v'";
		
		// Add the base url
		wget += ' ' + base;
		
		// When an event starts (first movement)
		thisClient.setOption(packet.thread,
                         'on_event_start',
                         wget + 'begin/' + packet.cameraid);
		
		// On motion (every movement)
		thisClient.setOption(packet.thread,
                         'on_motion_detected',
                         wget + 'ongoing/' + packet.cameraid);
		
		// On event stop (last movement)
		thisClient.setOption(packet.thread,
                         'on_event_end',
                         wget + 'end/' + packet.cameraid);
		
	});
	
	/**
	 * Set a camera option
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.09
	 * @version  2013.01.09
	 *
	 * @param    {integer}  threadnr        The camera thread nr
	 * @param    {string}   option          The option name
	 * @param    {string}   value           The option value
	 */
	this.setOption = function setOption (threadnr, option, value) {
		
		var url = location + threadnr + '/config/set?' + option + '=' + encodeURIComponent(value);
		
		request({uri: url}, function (error, response, body) {
			// See if it's actually done
		});
		
	}
	
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

	/**
	 * Get the video stream port of a certain thread
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.09
	 * @version  2013.01.09
	 *
	 * @param    {integer}  threadnr        The thread number
	 * @param    {function} callback        The function to callback
	 */
	this.getThreadPort = function (threadnr, callback) {
		
		var url = location + threadnr + '/config/get?query=stream_port';
		
		// Request the main Motion page, with threadcount info
		request({uri: url}, function (error, response, body) {
			
			// Get the threadcount from the body using a ReGex
			var result = /stream_port = ([0-9]*)/g.exec(body);

			// If a result exists
			if (result && result[1] !== undefined) {
				var portNr = parseInt(result[1]);
				
				callback(portNr, threadnr);
			} else {
				// If no result exists, callback with 0
				callback(false, threadnr);
			}
		});
	}
	
}