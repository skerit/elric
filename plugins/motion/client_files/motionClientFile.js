var request = require('request');
var $ = require('jquery');

module.exports = function (client) {
	
	client.event.on('start', function() {
		console.log('Motion is starting after everything has loaded');
		
		request({ uri:'http://192.168.1.2:8084' }, function (error, response, body) {
			console.log(body);
			
			console.log($('a', body).text());
		});
		
	});
	
}