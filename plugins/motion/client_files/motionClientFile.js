var request = require('request');
var $ = require('jquery');
var jQuery = $;

$.expr[':'].regex = function(elem, index, match) {
	var matchParams = match[3].split(','),
			validLabels = /^(data|css):/,
			attr = {
					method: matchParams[0].match(validLabels) ? 
					        matchParams[0].split(':')[0] : 'attr',
					property: matchParams.shift().replace(validLabels,'')
			},
			regexFlags = 'ig',
			regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g,''), regexFlags);
	return regex.test(jQuery(elem)[attr.method](attr.property));
}

module.exports = function (client) {
	
	var me = client.settings.motion;
	var settings = me.settings;
	
	client.event.on('start', function() {
		console.log(client.capabilities);

		console.log(client.settings.motion);
		
		console.log('Motion is starting after everything has loaded');
		
		request({ uri:'http://' + settings.host + ':' + settings.port }, function (error, response, body) {
			
			// Get the threadcount from the body using a ReGex
			var result = /Running \[([0-9]*)\] Threads/g.exec(body);

			if (result && result[1] !== undefined) {
				var threadCount = parseInt(result[1]);
				var cameraCount = threadCount;
				
				// If there is more than 1 thread, there is 1 less camera
				if (threadCount > 1) cameraCount--;
				
				console.log('There are ' + cameraCount + ' camera\'s installed');
				
				//console.log($('a', body).text());
				console.log($('a:regex(href,[0-9])', body).text());
			}
			
		});

		
	});
	
}